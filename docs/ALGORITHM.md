# Guide Matching Algorithm - Technical Documentation

## Overview

The TourWiseCo matching algorithm is designed to connect tourists with the most suitable local student guides based on multiple weighted criteria. The algorithm balances objective metrics (availability, ratings) with subjective preferences (interests, language).

## Algorithm Flow

```
┌─────────────────────┐
│  Tourist Request    │
│  - City             │
│  - Dates            │
│  - Preferences      │
│  - Interests        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Filter Candidates  │
│  - City match       │
│  - Status APPROVED  │
│  - Nationality      │
│  - Languages        │
│  - Gender           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Score Each Guide   │
│  - Availability(40) │
│  - Rating (20)      │
│  - Reliability (20) │
│  - Interests (20)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sort & Return Top 4│
└─────────────────────┘
```

## Detailed Scoring Breakdown

### 1. Availability Matching (40 points)

**Rationale**: Availability is the most critical factor. A highly-rated guide who isn't available is useless.

**Implementation**:
```typescript
function checkAvailability(student, requestedDates): boolean {
  // Parse dates (single date or range)
  const checkDates = parseDateRange(requestedDates)

  // Check each date
  return checkDates.every(date => {
    const dayOfWeek = date.getDay()
    return student.availability.some(avail =>
      avail.dayOfWeek === dayOfWeek
    )
  })
}
```

**Scoring**:
- Available: **40 points**
- Not available: **0 points**

**Edge Cases**:
- Multi-day trips: All days must be available
- Time zones: Assumes local time in guide's city
- Holidays: Currently not considered (future enhancement)

### 2. Rating Score (20 points)

**Rationale**: Past performance is a strong indicator of future quality.

**Formula**: `rating × 4`

**Examples**:
- 5.0 stars → 20 points
- 4.5 stars → 18 points
- 3.0 stars → 12 points (default for new guides)
- 1.0 stars → 4 points

**Default Handling**:
New guides without ratings receive 3.0 stars (12 points) to give them a fair starting position while being slightly below experienced guides.

**Why This Weight?**
Rating represents consistent quality but shouldn't overshadow availability or reliability. 20% of the total score provides meaningful differentiation without dominating.

### 3. Reliability Score (20 points)

**Rationale**: No-shows damage the tourist experience and platform reputation.

**Formula**: `max(0, 20 - (noShowCount × 5))`

**Examples**:
- 0 no-shows → 20 points
- 1 no-show → 15 points
- 2 no-shows → 10 points
- 3 no-shows → 5 points
- 4+ no-shows → 0 points

**Why This Weight?**
Reliability is equally important as rating. A 5-star guide who frequently no-shows is worse than a 4-star guide who always shows up.

**Badge System**:
- **Gold**: 50+ trips, 0 no-shows, 4.5+ rating
- **Silver**: 20+ trips, ≤1 no-show, 4.0+ rating
- **Bronze**: 10+ trips, ≤2 no-shows, 3.5+ rating

### 4. Interest Overlap (20 points)

**Rationale**: Shared interests create better connections and experiences.

**Formula**: `(matchingInterests / totalTouristInterests) × 20`

**Examples**:
Tourist interests: [Photography, Food, History, Art] (4 total)

- Guide matches 4/4 → 20 points
- Guide matches 3/4 → 15 points
- Guide matches 2/4 → 10 points
- Guide matches 1/4 → 5 points
- Guide matches 0/4 → 0 points

**Why This Weight?**
While important, interest overlap is less critical than availability, rating, and reliability. It's the "nice to have" that breaks ties between otherwise equal guides.

## Filtering Logic

### Hard Filters (Must Match)

1. **City**
   ```typescript
   where: { city: request.city }
   ```
   - Exact match required
   - Case-sensitive

2. **Status**
   ```typescript
   where: { status: 'APPROVED' }
   ```
   - Only approved guides shown
   - Excludes pending and suspended

### Soft Filters (Optional)

3. **Nationality**
   ```typescript
   nationality: request.preferredNationality || undefined
   ```
   - Applied only if specified
   - Exact match

4. **Languages**
   ```typescript
   languages: { hasSome: request.preferredLanguages }
   ```
   - Guide must speak at least one preferred language
   - Uses Prisma's `hasSome` operator

5. **Gender**
   ```typescript
   gender: request.preferredGender !== 'no_preference'
     ? request.preferredGender
     : undefined
   ```
   - Skipped if "no_preference"
   - Options: male, female, prefer_not_to_say

## Example Scenarios

### Scenario 1: Perfect Match

**Request**:
- City: Tokyo
- Dates: July 15-17 (Fri-Sun)
- Languages: [English]
- Interests: [Photography, Food]

**Guide**:
- City: Tokyo ✓
- Available: Fri-Sun ✓
- Languages: [English, Japanese] ✓
- Rating: 5.0
- No-shows: 0
- Interests: [Photography, Food, History]

**Score**:
- Availability: 40
- Rating: 5.0 × 4 = 20
- Reliability: 20
- Interests: 2/2 × 20 = 20
- **Total: 100 points** 🎯

### Scenario 2: Good Match (Available but New)

**Guide**:
- Available: ✓
- Rating: 3.0 (default, new guide)
- No-shows: 0
- Interests: 1/2 match

**Score**:
- Availability: 40
- Rating: 3.0 × 4 = 12
- Reliability: 20
- Interests: 1/2 × 20 = 10
- **Total: 82 points**

### Scenario 3: Poor Match (Unavailable)

**Guide**:
- Available: ✗
- Rating: 5.0
- No-shows: 0
- Interests: 2/2 match

**Score**:
- Availability: 0 ❌
- Rating: 20
- Reliability: 20
- Interests: 20
- **Total: 60 points**

*Note: This guide would likely not be in top 4*

### Scenario 4: Experienced but Unreliable

**Guide**:
- Available: ✓
- Rating: 4.8
- No-shows: 3
- Interests: 2/2 match

**Score**:
- Availability: 40
- Rating: 4.8 × 4 = 19.2
- Reliability: 20 - (3 × 5) = 5 ⚠️
- Interests: 20
- **Total: 84.2 points**

## Algorithm Optimizations

### Current Implementation

```typescript
// Fetch all candidates at once
const candidates = await prisma.student.findMany({
  where: filters,
  include: { availability: true }
})

// Score in memory
const scored = candidates.map(student => ({
  ...student,
  score: calculateScore(student, request)
}))

// Sort and return top 4
return scored.sort((a, b) => b.score - a.score).slice(0, 4)
```

**Time Complexity**: O(n log n)
**Space Complexity**: O(n)

### Potential Optimizations

1. **Database-Level Scoring**
   ```sql
   SELECT *,
     (availability_score * 40 +
      rating_score * 20 +
      reliability_score * 20 +
      interest_score * 20) as total_score
   ORDER BY total_score DESC
   LIMIT 4
   ```

2. **Caching**
   - Cache guide availability patterns
   - Cache interest tags for quick lookup
   - TTL: 1 hour for availability, 24 hours for interests

3. **Pre-filtering**
   - Index on (city, status) for faster filtering
   - Materialized views for common queries

4. **Parallel Processing**
   - Score guides in parallel using Worker threads
   - Useful for large candidate pools (>1000)

## Testing Strategies

### Unit Tests

```typescript
describe('calculateScore', () => {
  it('should give perfect score for ideal guide', () => {
    const guide = {
      availability: [...],
      averageRating: 5.0,
      noShowCount: 0,
      interests: ['Photography', 'Food']
    }
    const request = {
      dates: { start: '2024-07-15', end: '2024-07-17' },
      interests: ['Photography', 'Food']
    }
    expect(calculateScore(guide, request)).toBe(100)
  })

  it('should penalize unavailable guides heavily', () => {
    // Test availability = 0 case
  })

  it('should handle new guides fairly', () => {
    // Test default rating case
  })
})
```

### Integration Tests

```typescript
describe('findMatches', () => {
  it('should return top 4 matches sorted by score', async () => {
    // Setup test data
    // Call findMatches
    // Verify order and count
  })

  it('should filter by city and status', async () => {
    // Verify only approved guides in correct city
  })
})
```

### A/B Testing Scenarios

Test different weight distributions:

**Variant A** (Current):
- Availability: 40
- Rating: 20
- Reliability: 20
- Interests: 20

**Variant B** (Experience-focused):
- Availability: 30
- Rating: 30
- Reliability: 25
- Interests: 15

**Variant C** (Reliability-focused):
- Availability: 35
- Rating: 15
- Reliability: 35
- Interests: 15

**Metrics to Track**:
- Match acceptance rate
- Tourist satisfaction scores
- Guide utilization rate
- Booking completion rate

## Future Enhancements

### 1. Machine Learning Scoring
- Train on historical match success data
- Personalized weight adjustments
- Predict tourist-guide compatibility

### 2. Dynamic Weights
- Adjust weights based on request urgency
- Season-specific adjustments
- User preference learning

### 3. Additional Factors
- Distance from tourist location
- Price range compatibility
- Response time metrics
- Language proficiency levels
- Special accessibility accommodations

### 4. Real-time Availability
- WebSocket integration
- Calendar sync (Google, Outlook)
- Instant availability updates

### 5. Collaborative Filtering
- "Guides liked by similar tourists"
- Community-based recommendations
- Social proof signals

## Performance Benchmarks

**Target Performance**:
- < 500ms for match generation
- < 1s for page load with 4 guides
- Support 1000+ concurrent requests

**Current Bottlenecks**:
1. Database query for candidates
2. Availability calculation for date ranges
3. Interest overlap computation

**Monitoring**:
```typescript
console.time('findMatches')
const matches = await findMatches(request)
console.timeEnd('findMatches')
// Target: < 500ms
```

## Conclusion

The TourWiseCo matching algorithm balances multiple factors to create optimal tourist-guide pairings. The 40-20-20-20 weight distribution prioritizes availability while giving significant weight to quality metrics and personal compatibility. The algorithm is designed to be transparent, testable, and optimizable for future enhancements.
