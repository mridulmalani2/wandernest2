// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidStudentSession, readStudentTokenFromRequest } from '@/lib/student-auth';

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Verify authentication - only authenticated students can upload
    const token = readStudentTokenFromRequest(req);
    const session = await getValidStudentSession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Content = buffer.toString('base64');

    // Store in Neon DB
    const fileRecord = await prisma.fileStorage.create({
      data: {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        content: base64Content,
        studentId: session.studentId,
      },
    });

    // Generate URL for the file
    // We'll create a new route /api/files/[id] to serve these
    const fileUrl = `/api/files/${fileRecord.id}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: file.name,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error('File upload error:', error);

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
