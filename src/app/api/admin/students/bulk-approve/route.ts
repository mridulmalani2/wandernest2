// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/api-auth'
import { z } from 'zod'
import { isZodError } from '@/lib/error-handler'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'

const bulkApproveSchema = z.object({
  studentIds: z.array(z.string().cuid()).min(1),
  action: z.enum(['approve', 'reject']),
}).strict()

export async function POST(request: NextRequest) {
  try {
    await rateLimitByIp(request, 30, 60, 'admin-students-bulk-approve')
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = requireDatabase()

    const { studentIds, action } = await validateJson<{ studentIds: string[]; action: 'approve' | 'reject' }>(
      request,
      bulkApproveSchema
    )

    const result = await db.student.updateMany({
      where: {
        id: { in: studentIds },
        status: 'PENDING_APPROVAL',
      },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'SUSPENDED',
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} student(s) ${action === 'approve' ? 'approved' : 'suspended'}`,
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    if (isZodError(error)) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      )
    }
    console.error('Error bulk approving/rejecting students:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
