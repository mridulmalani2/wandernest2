// Force dynamic rendering for admin data
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { requireDatabase } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  const prisma = requireDatabase()

  try {
    const requests = await prisma.touristRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        tourist: true,
      },
    })

    const payload = requests.map((req) => ({
      id: req.id,
      city: req.city,
      status: req.status,
      serviceType: req.serviceType,
      preferredLanguages: req.preferredLanguages,
      preferredNationality: req.preferredNationality,
      preferredTime: req.preferredTime,
      dates: req.dates,
      createdAt: req.createdAt,
      travelerName: req.tourist?.name || req.tourist?.email || req.email,
      email: req.email,
    }))

    return NextResponse.json({ requests: payload })
  } catch (error) {
    console.error('Error loading admin requests', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
