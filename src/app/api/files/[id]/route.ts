import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id;

        if (!fileId) {
            return new NextResponse('File ID missing', { status: 400 });
        }

        const fileRecord = await prisma.fileStorage.findUnique({
            where: { id: fileId },
        });

        if (!fileRecord) {
            return new NextResponse('File not found', { status: 404 });
        }

        const db = prisma;

        // ACCESS CONTROL LOGIC
        let isAccessAllowed = false;

        // 1. Check if it's a public profile photo
        // We check if ANY student has this file as their profilePhotoUrl
        // Optimization: Check the fileRecord.studentId to narrow it down if possible, 
        // but profilePhotoUrl might be used by a student different from uploader in theory (though unlikely in this app).
        // Let's rely on the student who uploaded it for ownership check, but for public access, 
        // we strictly check if it IS a profile photo.

        // Actually, we can check if the fileID alone matches a public field.
        // Assuming profilePhotoUrl stores the FULL URL "/api/files/ID", we would need to check that.
        // Or if it stores just the ID. The upload route returns `/api/files/${fileRecord.id}`.
        const fileUrl = `/api/files/${fileId}`;

        const isProfilePhoto = await db.student.findFirst({
            where: { profilePhotoUrl: fileUrl },
            select: { id: true }
        });

        if (isProfilePhoto) {
            isAccessAllowed = true;
        } else {
            // 2. Private File - Check Authentication
            // We need to verify if the requester is the owner (Student) or an Admin.

            // Verify Student
            const { getValidStudentSession, readStudentTokenFromRequest } = await import('@/lib/student-auth');
            const token = readStudentTokenFromRequest(req);
            const session = await getValidStudentSession(token);

            if (session && session.studentId === fileRecord.studentId) {
                isAccessAllowed = true;
            }

            // TODO: Add Admin check here if we have a unified verifyAdmin helper accessible
            // const adminAuth = await verifyAdmin(req);
            // if (adminAuth.authorized) isAccessAllowed = true;
        }

        if (!isAccessAllowed) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Convert base64 back to buffer
        const buffer = Buffer.from(fileRecord.content, 'base64');

        // Return file with correct content type
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': fileRecord.mimeType,
                'Content-Length': fileRecord.size.toString(),
                'Cache-Control': 'private, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('File retrieval error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
