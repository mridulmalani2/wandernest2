import { NextResponse } from 'next/server'

// In a real application, this would come from the database
// For now, we'll return a static list of cities
const cities = [
  { value: 'paris', label: 'Paris, France' },
  { value: 'london', label: 'London, United Kingdom' },
  { value: 'tokyo', label: 'Tokyo, Japan' },
  { value: 'new-york', label: 'New York, USA' },
  { value: 'barcelona', label: 'Barcelona, Spain' },
  { value: 'rome', label: 'Rome, Italy' },
  { value: 'amsterdam', label: 'Amsterdam, Netherlands' },
  { value: 'dubai', label: 'Dubai, UAE' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'istanbul', label: 'Istanbul, Turkey' },
  { value: 'bangkok', label: 'Bangkok, Thailand' },
  { value: 'sydney', label: 'Sydney, Australia' },
]

export async function GET() {
  return NextResponse.json({ cities })
}
