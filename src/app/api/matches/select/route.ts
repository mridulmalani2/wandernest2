// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifySelectionToken } from '@/lib/auth/tokens'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson, z } from '@/lib/validation/validate'
import { serializeSelectionPublic } from '@/lib/response/serialize'

const selectSchema = z.object({
  requestId: z.string().min(1),
  selectedGuideTokens: z.array(z.string().min(1)).min(1),
}).strict()

export async function POST(request: NextRequest) {
  try {
    await rateLimitByIp(request, 60, 60, 'matches-select')
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = requireDatabase()

    const body = await validateJson<{ requestId: string; selectedGuideTokens: string[] }>(request, selectSchema)
    const { requestId, selectedGuideTokens } = body

    const touristRequest = await db.touristRequest.findUnique({
      where: { id: requestId }
    })

    if (touristRequest && (touristRequest.email !== session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!touristRequest) {
      return NextResponse.json(
        { error: 'Tourist request not found' },
        { status: 404 }
      )
    }

    const parsedGuideIds = selectedGuideTokens.map((token: string) => {
      const payload = verifySelectionToken(token)
      if (!payload || payload.requestId !== requestId) {
        return null
      }
      return payload.studentId
    })

    if (parsedGuideIds.some((id) => id === null)) {
      return NextResponse.json(
        { error: 'Invalid or expired guide selection token' },
        { status: 400 }
      )
    }

    const selectedGuideIds = Array.from(new Set(
      parsedGuideIds.filter((id): id is string => Boolean(id))
    ))

    if (selectedGuideIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid guide selections provided' },
        { status: 400 }
      )
    }

    await db.requestSelection.deleteMany({
      where: { requestId }
    })

    const matchedStudents = await db.student.findMany({
      where: {
        id: { in: selectedGuideIds },
        status: 'APPROVED',
      },
      select: { id: true },
    })

    if (matchedStudents.length !== selectedGuideIds.length) {
      return NextResponse.json(
        { error: 'One or more selected guides are not available' },
        { status: 400 }
      )
    }

    const selections = await db.$transaction(async (tx) => {
      await tx.requestSelection.deleteMany({
        where: { requestId }
      })

      const createdSelections = await Promise.all(
        selectedGuideIds.map((studentId: string) =>
          tx.requestSelection.create({
            data: {
              requestId,
              studentId,
              status: 'pending'
            }
          })
        )
      )

      await tx.touristRequest.update({
        where: { id: requestId },
        data: { status: 'MATCHED' }
      })

      return createdSelections
    })

    return NextResponse.json({
      success: true,
      selections: selections.map(serializeSelectionPublic),
      message: 'Guides selected successfully'
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Error saving selections:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to save guide selections' },
      { status: 500 }
    )
  }
}
