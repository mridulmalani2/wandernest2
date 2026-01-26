import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson, z } from '@/lib/validation/validate'
import { requireAuth } from '@/lib/auth/requireAuth'

export const dynamic = 'force-dynamic'

const setPasswordSchema = z
  .object({
    password: z.string().min(8).max(128),
  })
  .strict()

export async function POST(req: NextRequest) {
  try {
    await rateLimitByIp(req, 5, 60, 'student-set-password')
    await rateLimitByIp(req, 20, 60 * 60, 'student-set-password-hour')
    const { password } = await validateJson<{ password: string }>(req, setPasswordSchema)

    const identity = await requireAuth(req, 'student')
    const studentId = identity.userId

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Update Student
    await prisma.student.update({
      where: { id: studentId },
      data: { passwordHash: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof NextResponse) {
      return err
    }
    logger.error('Error in set-password route', {
      errorType: err instanceof Error ? err.name : 'unknown',
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
