export interface AnonymizedGuide {
  id: string
  anonymousId: string
  university: string
  languages: string[]
  tripsHosted: number
  rating: number
  badge: string
  score?: number
}

export interface MatchResponse {
  success: boolean
  matches: AnonymizedGuide[]
  count: number
}
