// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidStudentSession, readStudentTokenFromRequest } from '@/lib/student-auth';
import { sanitizeFilename } from '@/lib/sanitization';
import { encryptFileContent } from '@/lib/file-encryption';
import { logger } from '@/lib/logger';
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit';

export async function POST(req: NextRequest) {
  try {
    await rateLimitByIp(req, 30, 60, 'student-upload');
    // SECURITY: Verify authentication - only authenticated students can upload
    const token = await readStudentTokenFromRequest(req);
    const session = await getValidStudentSession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    // const type = formData.get('type') as string; // Unused, removed

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    // Validate Extension mapping to Mime (Basic spoofing check)
    const mimeToExt: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
      'application/pdf': ['pdf']
    };

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Check extension matches mime
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!mimeToExt[file.type]?.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file extension for the provided file type.' },
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

    const matchesSignature = (mimeType: string, data: Buffer) => {
      if (mimeType === 'application/pdf') {
        return data.slice(0, 4).toString() === '%PDF';
      }
      if (mimeType === 'image/png') {
        return data.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
      }
      if (mimeType === 'image/jpeg') {
        return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
      }
      if (mimeType === 'image/webp') {
        return data.slice(0, 4).toString() === 'RIFF' && data.slice(8, 12).toString() === 'WEBP';
      }
      return false;
    };

    if (!matchesSignature(file.type, buffer)) {
      return NextResponse.json(
        { error: 'File content does not match the declared file type.' },
        { status: 400 }
      );
    }
    const encryptedPayload = encryptFileContent(buffer);

    // Store in Neon DB
    const safeFilename = sanitizeFilename(file.name);
    const fileRecord = await prisma.fileStorage.create({
      data: {
        filename: safeFilename,
        mimeType: file.type,
        size: file.size,
        content: encryptedPayload,
        studentId: session.studentId,
      },
    });

    // Generate URL for the file
    // We'll create a new route /api/files/[id] to serve these
    const fileUrl = `/api/files/${fileRecord.id}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: safeFilename,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    logger.error('File upload error', {
      errorType: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
