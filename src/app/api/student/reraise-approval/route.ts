import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withStudent } from '@/lib/api-wrappers';
import { sendAdminApprovalReminder } from '@/lib/email';

/**
 * POST /api/student/reraise-approval
 * Records when a student clicks "Re-raise Request" for pending approval
 * and sends an email notification to admins
 */
export const POST = withStudent(async (request, studentAuth) => {
    const { email: studentEmail, id: studentId } = studentAuth;

    try {
        // Update the student's approvalReminderSentAt timestamp
        const student = await prisma.student.update({
            where: studentId ? { id: studentId } : { email: studentEmail },
            data: {
                approvalReminderSentAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                name: true,
                city: true,
                institute: true,
                createdAt: true,
                approvalReminderSentAt: true,
            },
        });

        // Send email notification to admins (non-blocking)
        sendAdminApprovalReminder({
            id: student.id,
            name: student.name || 'Unknown',
            email: student.email,
            city: student.city || 'Unknown',
            institute: student.institute || 'Unknown',
            createdAt: student.createdAt,
        }).catch((error) => {
            // Log error but don't fail the request
            console.error('Failed to send admin approval reminder email:', error);
        });

        return NextResponse.json({
            success: true,
            message: 'Approval reminder recorded successfully',
            reminderSentAt: student.approvalReminderSentAt,
        });
    } catch (error: any) {
        console.error('Error recording approval reminder:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            studentId,
            studentEmail
        });
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to record reminder',
                details: error.message
            },
            { status: 500 }
        );
    }
});
