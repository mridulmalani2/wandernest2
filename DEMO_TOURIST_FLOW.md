# WanderNest Tourist Flow - Local Demo

## Overview

This is a **working local demo** of the complete tourist-to-student matching flow using **dummy data** (no database required).

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the demo page:**
   ```
   http://localhost:3000/demo/tourist-flow
   ```

3. **Test the flow:**
   - Fill in the tourist details form
   - Click "Find Matching Students"
   - View 3-5 matching student profiles
   - Click on a student card to select them
   - Click "Confirm This Student" to complete the booking

## Tourist Flow Step-by-Step

### Step 1: Tourist Details Form
The tourist fills in:
- **Trip Details:** City (Paris/London), dates, time preference, number of guests, group type
- **Preferences:** Languages, service type (itinerary help vs guided experience), interests, budget
- **Contact:** Email, phone, preferred contact method, additional notes

### Step 2: View Matching Students
After submitting, the tourist sees:
- **3-5 matching students** ranked by compatibility
- **Student cards** showing:
  - Masked identity (e.g., "Guide #A1", "Marie L.")
  - University and nationality
  - Languages spoken
  - Experience stats (trips hosted, rating)
  - Reliability info (attendance record, badges)
  - Match reasons (why this student is a good fit)
  - Specialties/tags
- **Suggested price range** based on city and service type
- Ability to select one student by clicking their card

### Step 3: Confirmation
After selecting and confirming a student:
- Success message is displayed
- Student details are shown (name, email, institute)
- Next steps are explained
- In production, emails would be sent to both parties

## Implementation Details

### Dummy Student Database
**Location:** `/src/lib/demo/dummyStudents.ts`

Contains 16 dummy students:
- **8 in Paris** (Marie, Jean-Pierre, Sophie, Ahmed, Isabella, Lucas, Yuki, Thomas)
- **8 in London** (Emma, Raj, Olivia, Liam, Fatima, Marcus, Hannah, Carlos)

Each student has:
- Personal info (name, email, city, home country)
- Languages, hourly rate, max guests
- Bio and focus areas
- Institute, experience stats, ratings
- Reliability badges

### Matching Algorithm
**Location:** `/src/lib/demo/matchingAlgorithm.ts`

Scoring system based on:
1. **City match** (required)
2. **Language compatibility** (high priority, +30 points per match)
3. **Guest capacity**
4. **Nationality preference** (+40 points)
5. **Gender preference** (+15 points)
6. **Interest overlap** (+15 points per match)
7. **Focus area matches** (+12 points per match)
8. **Budget compatibility** (+25/-20 points)
9. **Experience level** (+5 to +35 points)
10. **Rating** (+10 per star)
11. **Reliability** (+25 for perfect attendance)
12. **Badges** (+10 to +30 points)

Returns top 3-5 matches sorted by score.

### API Routes

All demo routes are in `/src/app/api/demo/`:

1. **POST /api/demo/request** - Creates a tourist request
   - Validates input with Zod
   - Stores in-memory (doesn't require database)
   - Returns request ID

2. **POST /api/demo/match** - Finds matching students
   - Takes request ID
   - Runs matching algorithm against dummy data
   - Returns 3-5 best matches with reasons
   - Includes suggested price range

3. **POST /api/demo/confirm** - Confirms student selection
   - Takes request ID and student ID
   - Returns success with student details
   - In production, would send emails and create booking

### UI Components

**Demo Page:** `/src/app/demo/tourist-flow/page.tsx`
- Single-page flow with three states: form → results → confirmed
- Uses existing WanderNest design system (glassmorphism, colors, animations)
- Fully responsive with mobile-first design
- Client-side validation and error handling

**Reused Components:**
- `/src/components/tourist/StudentProfileCard.tsx` - Student display cards
- `/src/components/ui/*` - All UI primitives (buttons, inputs, etc.)

## Replacing with Production Code

When ready to move to production:

1. **Remove dummy data:**
   - Delete `/src/lib/demo/dummyStudents.ts`
   - Delete `/src/lib/demo/matchingAlgorithm.ts`

2. **Switch to production API routes:**
   - Replace `/api/demo/*` calls with `/api/tourist/request/*`
   - Use existing routes:
     - `/api/tourist/request/create` (requires auth)
     - `/api/tourist/request/match` (uses Prisma)
     - `/api/tourist/request/select` (saves to DB)

3. **Add authentication:**
   - Require NextAuth session
   - Protect routes with middleware

4. **Database integration:**
   - The matching algorithm in `/api/tourist/request/match/route.ts` is already production-ready
   - It queries real students from Prisma/PostgreSQL
   - The scoring logic is similar to the demo version

5. **Enable email notifications:**
   - Uncomment email sending in API routes
   - Configure email templates

## File Locations Summary

| Component | File Path |
|-----------|-----------|
| **Demo Page** | `/src/app/demo/tourist-flow/page.tsx` |
| **Dummy Students** | `/src/lib/demo/dummyStudents.ts` |
| **Matching Logic** | `/src/lib/demo/matchingAlgorithm.ts` |
| **API: Create Request** | `/src/app/api/demo/request/route.ts` |
| **API: Match Students** | `/src/app/api/demo/match/route.ts` |
| **API: Confirm Selection** | `/src/app/api/demo/confirm/route.ts` |
| **Student Card Component** | `/src/components/tourist/StudentProfileCard.tsx` |

## Design Patterns Used

- **In-memory storage** for demo requests (Map data structure)
- **Modular matching algorithm** with clear scoring system
- **Type-safe** with TypeScript interfaces throughout
- **Validation** with Zod schemas
- **Consistent error handling** with try-catch and proper HTTP status codes
- **Responsive design** using Tailwind CSS and existing design tokens
- **Progressive enhancement** (client-side → server-side flow)

## Notes

- **No database required** - Everything runs in-memory
- **No authentication needed** - Demo is open access
- **No email sending** - Just console logs
- **Data resets on server restart** - That's fine for demo purposes
- **Mobile-friendly** - Tested on various screen sizes
- **Production-ready patterns** - Easy to migrate to real backend

## Testing the Demo

Example test flow:

1. **Select:** Paris
2. **Dates:** Any future date
3. **Time:** Afternoon
4. **Guests:** 2
5. **Group Type:** Friends
6. **Languages:** English, French
7. **Service:** Guided Experience
8. **Interests:** Art, Museums, Food
9. **Email:** test@example.com
10. **Contact Method:** Email

Expected results:
- Should see **Marie Laurent** (art/museum specialist) as top match
- Should see **Sophie Chen** (family-friendly, multilingual) as second match
- Should see **Jean-Pierre Dubois** (food specialist) as third match
- Price range: €20-35/hour

## Questions?

The implementation is fully functional and ready to demo. All code follows Next.js 14 best practices and the existing WanderNest design patterns.
