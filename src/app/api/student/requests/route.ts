import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
    getValidStudentSession,
    readStudentTokenFromRequest,
} from '@/lib/student-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        let studentEmail: string | null = null;
        let studentId: string | null = null;

        // 1. Try Custom OTP Session
        const token = readStudentTokenFromRequest(request);
        const otpSession = await getValidStudentSession(token);

        if (otpSession) {
            studentEmail = otpSession.email;
            studentId = otpSession.studentId;
        } else {
            // 2. Try NextAuth Session
            const nextAuthSession = await getServerSession(authOptions);
            if (nextAuthSession?.user?.userType === 'student' && nextAuthSession.user.email) {
                studentEmail = nextAuthSession.user.email;
            }
        }

        if (!studentEmail) {
            return NextResponse.json(
                { error: 'Unauthorized - Please sign in' },
                { status: 401 }
            );
        }

        // Get Student ID if we only have email
        if (!studentId) {
            const student = await prisma.student.findUnique({
                where: { email: studentEmail },
                select: { id: true },
            });

            if (!student) {
                return NextResponse.json(
                    { error: 'Student profile not found' },
                    { status: 404 }
                );
            }
            studentId = student.id;
        }

        // Fetch requests (selections) for this student
        const selections = await prisma.requestSelection.findMany({
            where: { studentId },
            include: {
                request: {
                    include: {
                        tourist: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to dashboard format
        const requests = selections.map(selection => {
            const req = selection.request;
            // Parse dates if stored as JSON, or assume they are compatible
            // Schema says dates is Json.

            return {
                id: selection.id, // Use selection ID for actions
                requestId: req.id,
                touristName: req.tourist?.name || 'Tourist', // Fallback if name not available
                city: req.city,
                dates: req.dates,
                numberOfGuests: req.numberOfGuests,
                serviceType: req.serviceType,
                totalBudget: req.budget || 0, // Using budget as totalBudget
                status: selection.status, // pending, accepted, rejected
                createdAt: selection.createdAt.toISOString(),
            };
        });

        return NextResponse.json({
            success: true,
            requests,
        });

    } catch (error) {
        console.error('Error fetching student requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch requests' },
            { status: 500 }
        );
    }
}
