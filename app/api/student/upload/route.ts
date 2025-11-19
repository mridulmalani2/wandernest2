// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
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

    // Upload to Vercel Blob Storage
    // This is the recommended approach for Vercel deployments
    // - Files are stored in a CDN for fast access
    // - No database bloat from Base64 encoding
    // - Automatic optimization and caching
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true, // Prevents filename conflicts
    });

    return NextResponse.json({
      success: true,
      url: blob.url, // CDN URL for accessing the file
      filename: file.name,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error('File upload error:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      // Check if it's a Vercel Blob configuration error
      if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        return NextResponse.json(
          {
            error: 'File upload service not configured. Please set up Vercel Blob storage.',
            details: 'Missing BLOB_READ_WRITE_TOKEN environment variable'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
