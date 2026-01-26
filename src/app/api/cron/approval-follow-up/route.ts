import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminApprovalReminder } from '@/lib/email';
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * Cron job to send automated 3-day follow-up reminders for pending approvals
 * 
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions)
 * It finds students who:
 * 1. Are still in PENDING_APPROVAL status
 * 2. Requested a reminder (approvalReminderSentAt is set)
 * 3. Haven't received a follow-up yet (approvalFollowUpReminderSentAt is null)
 * 4. It's been 3+ days since they requested the reminder
 * 
 * To set up on Vercel:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/approval-follow-up",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 * 
 * Security: Vercel Cron automatically adds Authorization header
 */
export async function GET(request: NextRequest) {
    try {
        await rateLimitByIp(request, 30, 60, 'cron-approval-follow-up');
        // Verify this is a legitimate cron request
        // Vercel Cron sends a special header
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Calculate the date 3 days ago
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Find students who need a follow-up reminder
        const studentsNeedingFollowUp = await prisma.student.findMany({
            where: {
                status: 'PENDING_APPROVAL',
                approvalReminderSentAt: {
                    not: null,
                    lte: threeDaysAgo, // Reminder was sent 3+ days ago
                },
                approvalFollowUpReminderSentAt: null, // Haven't sent follow-up yet
            },
            select: {
                id: true,
                name: true,
                email: true,
                city: true,
                institute: true,
                createdAt: true,
                approvalReminderSentAt: true,
            },
        });

        console.log(`Found ${studentsNeedingFollowUp.length} students needing follow-up reminders`);

        const results = [];

        // Send follow-up reminders
        for (const student of studentsNeedingFollowUp) {
            try {
                // Send the reminder email
                const emailResult = await sendAdminApprovalReminder({
                    id: student.id,
                    name: student.name || 'Unknown',
                    email: student.email,
                    city: student.city || 'Unknown',
                    institute: student.institute || 'Unknown',
                    createdAt: student.createdAt,
                });

                // Mark that we sent the follow-up
                await prisma.student.update({
                    where: { id: student.id },
                    data: {
                        approvalFollowUpReminderSentAt: new Date(),
                    },
                });

                results.push({
                    studentId: student.id,
                    success: true,
                    emailsSent: emailResult.sentTo,
                });

                console.log(`✅ Sent follow-up reminder for ${student.email}`);
            } catch (error) {
                console.error(`❌ Failed to send follow-up for ${student.email}:`, error);
                results.push({
                    studentId: student.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({
            success: true,
            message: `Processed ${studentsNeedingFollowUp.length} students, sent ${successCount} follow-up reminders`,
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error('Error in approval follow-up cron:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
