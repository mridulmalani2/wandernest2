/**
 * DEMO API ROUTE - Student Matching
 * This endpoint matches tourists with dummy student data for the local demo.
 *
 * To replace with production:
 * 1. Use /api/tourist/request/match instead
 * 2. Query real students from database
 * 3. Add proper availability checking
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { DUMMY_STUDENTS, getStudentsByCity } from '@/lib/demo/dummyStudents'
import {
  findMatchingStudents,
  calculateSuggestedPrice,
  TouristRequest,
} from '@/lib/demo/matchingAlgorithm'

// In-memory storage reference (shared with request route)
// In a real app, this would query the database
const demoRequests = new Map<string, any>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // For demo: If request is not in our in-memory store, try to find it from query params
    // This allows the flow to work even after server restarts
    let touristRequest: TouristRequest | null = null

    // Try to get from in-memory store first
    if (demoRequests.has(requestId)) {
      touristRequest = demoRequests.get(requestId)
    } else {
      // For demo purposes, if we can't find the request, we'll create a sample one
      // based on common criteria. In production, this would be a 404 error.
      console.warn(
        'Demo: Request not found in memory, using sample criteria for matching'
      )

      // Create a sample request for demo purposes
      touristRequest = {
        city: 'Paris', // Default to Paris for demo
        dates: { start: '2025-12-01', end: '2025-12-03' },
        preferredTime: 'afternoon',
        numberOfGuests: 2,
        groupType: 'friends',
        preferredLanguages: ['English', 'French'],
        serviceType: 'guided_experience',
        interests: ['art', 'museums', 'food'],
        email: 'demo@example.com',
        contactMethod: 'email',
      }
    }

    // Get all students in the requested city
    const studentsInCity = getStudentsByCity(touristRequest.city)

    if (studentsInCity.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        message: `No students available in ${touristRequest.city}`,
      })
    }

    // Find matching students (top 3-5)
    const matches = findMatchingStudents(studentsInCity, touristRequest, 5)

    // Calculate suggested price range
    const suggestedPriceRange = calculateSuggestedPrice(
      touristRequest.city,
      touristRequest.serviceType
    )

    return NextResponse.json({
      success: true,
      matches,
      suggestedPriceRange,
      requestId,
    })
  } catch (error) {
    console.error('Error matching students:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find matching students',
      },
      { status: 500 }
    )
  }
}
