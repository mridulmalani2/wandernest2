export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { verifyAdmin } from '@/lib/api-auth';
import { decryptFileContent } from '@/lib/file-encryption';

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
            const token = await readStudentTokenFromRequest(req);
            const session = await getValidStudentSession(token);

            if (session && session.studentId === fileRecord.studentId) {
                isAccessAllowed = true;
            }

            const adminAuth = await verifyAdmin(req);
            if (adminAuth.authorized) {
                isAccessAllowed = true;
            }
        }

        if (!isAccessAllowed) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (!fileRecord.content) {
            return new NextResponse('File content missing', { status: 404 });
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedMimeTypes.includes(fileRecord.mimeType)) {
            return new NextResponse('Unsupported media type', { status: 415 });
        }

        // Convert base64 back to buffer
        const buffer = decryptFileContent(fileRecord.content);
        const body = new Blob([buffer]);
        const disposition = fileRecord.mimeType.startsWith('image/')
            ? 'inline'
            : 'attachment';

        // Return file with correct content type
        return new NextResponse(body, {
            headers: {
                'Content-Type': fileRecord.mimeType,
                'Content-Length': fileRecord.size.toString(),
                'Content-Disposition': `${disposition}; filename="${fileRecord.filename}"`,
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'private, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        // SECURITY FIX: Use structured logger instead of console.error with full error object
        // to prevent exposing sensitive details (tokens, PII, stack traces) in logs
        logger.error('File retrieval error', {
            errorType: error instanceof Error ? error.name : 'unknown',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
