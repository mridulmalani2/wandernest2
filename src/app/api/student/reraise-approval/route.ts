import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withStudent } from '@/lib/api-wrappers';

/**
 * POST /api/student/reraise-approval
 * Records when a student clicks "Re-raise Request" for pending approval
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
                approvalReminderSentAt: true,
            },
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
