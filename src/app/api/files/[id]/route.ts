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

        // Convert base64 back to buffer
        const buffer = Buffer.from(fileRecord.content, 'base64');

        // Return file with correct content type
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': fileRecord.mimeType,
                'Content-Length': fileRecord.size.toString(),
                // Optional: 'Content-Disposition': `inline; filename="${fileRecord.filename}"`,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('File retrieval error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
