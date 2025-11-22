# Student Review System

This document describes the student review system implementation for TourWiseCo.

## Overview

The review system allows tourists to rate and review student guides after their experience. The system automatically calculates student metrics, assigns reliability badges, and sends review request emails 24 hours after an experience.

## Review Schema

Reviews have the following structure:

```typescript
{
  rating: number,        // 1-5 (required)
  text: string,          // optional, max 500 characters
  attributes: string[],  // from predefined list
  noShow: boolean,       // whether student was a no-show
  pricePaid: number,     // optional
  isAnonymous: boolean   // default false
}
```

## Predefined Review Attributes

Tourists can select from the following attributes when reviewing:

**Positive attributes:**
- friendly
- knowledgeable
- punctual
- professional
- flexible
- good_communication
- local_insights
- great_recommendations
- patient
- enthusiastic
- well_prepared
- good_english

**Areas for improvement:**
- late
- unprepared
- poor_communication
- rushed
- limited_knowledge

## Student Metrics

After each review, the following metrics are automatically calculated:

### Average Rating
The mean of all ratings received by the student.

### Completion Rate
Percentage of experiences where the student showed up:
```
completionRate = (non-no-show reviews / total reviews) × 100
```

### Reliability Badge
Assigned based on completion rate and number of reviews:

- **Gold**: ≥95% completion rate AND ≥10 reviews
- **Silver**: ≥90% completion rate AND ≥5 reviews
- **Bronze**: Default for all others

## Email Triggers

### Automatic Review Requests
The system runs a cron job every hour that:
1. Finds tourist requests where the experience ended ~24 hours ago
2. Checks if no review has been submitted yet
3. Sends an email to the tourist requesting a review

### Manual Trigger
You can manually trigger a review request email:
```bash
POST /api/reviews/trigger/:requestId
```

## API Endpoints

### Create a Review
```bash
POST /api/reviews
Content-Type: application/json

{
  "requestId": "clx123...",
  "studentId": "clx456...",
  "rating": 5,
  "text": "Great experience! Very knowledgeable guide.",
  "attributes": ["friendly", "knowledgeable", "punctual"],
  "noShow": false,
  "pricePaid": 50,
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx789...",
    "requestId": "clx123...",
    "studentId": "clx456...",
    "rating": 5,
    "text": "Great experience!...",
    "attributes": ["friendly", "knowledgeable", "punctual"],
    "noShow": false,
    "pricePaid": 50,
    "isAnonymous": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Student Reviews
```bash
GET /api/reviews/student/:studentId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx789...",
      "rating": 5,
      "text": "Great experience!",
      "attributes": ["friendly", "knowledgeable"],
      "noShow": false,
      "isAnonymous": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "request": {
        "city": "Paris",
        "dates": {...},
        "groupType": "family"
      }
    }
  ]
}
```

### Get Student Metrics
```bash
GET /api/reviews/student/:studentId/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.7,
    "completionRate": 95.5,
    "reliabilityBadge": "gold",
    "totalReviews": 22
  }
}
```

### Trigger Review Request Email
```bash
POST /api/reviews/trigger/:requestId
```

**Response:**
```json
{
  "success": true,
  "message": "Review request email sent"
}
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and email service credentials
   ```

3. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Cron Job Configuration

The review email cron job runs automatically when the server starts. It executes every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.).

To modify the schedule, edit `src/jobs/reviewEmailCron.ts`:

```typescript
// Current: runs every hour
cron.schedule('0 * * * *', async () => { ... });

// Example: run every 30 minutes
cron.schedule('*/30 * * * *', async () => { ... });

// Example: run daily at 9 AM
cron.schedule('0 9 * * *', async () => { ... });
```

## Email Service Integration

The current implementation logs emails to the console. To integrate with a real email service:

1. **Install email provider SDK:**
   ```bash
   # For SendGrid
   npm install @sendgrid/mail

   # For AWS SES
   npm install @aws-sdk/client-ses
   ```

2. **Update `src/services/emailService.ts`:**
   ```typescript
   // Example with SendGrid
   import sgMail from '@sendgrid/mail';
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   async function sendReviewRequestEmail(requestId: string) {
     // ... existing code ...

     await sgMail.send({
       to: email.to,
       from: process.env.EMAIL_FROM,
       subject: email.subject,
       text: email.body,
     });
   }
   ```

## Testing

### Manual Testing

1. **Create a test review:**
   ```bash
   curl -X POST http://localhost:3000/api/reviews \
     -H "Content-Type: application/json" \
     -d '{
       "requestId": "test-request-1",
       "studentId": "test-student-1",
       "rating": 5,
       "text": "Excellent guide!",
       "attributes": ["friendly", "knowledgeable"],
       "noShow": false,
       "pricePaid": 50
     }'
   ```

2. **Check student metrics:**
   ```bash
   curl http://localhost:3000/api/reviews/student/test-student-1/metrics
   ```

3. **Trigger review email:**
   ```bash
   curl -X POST http://localhost:3000/api/reviews/trigger/test-request-1
   ```

## Database Schema

The review system uses the following models:

- **Review**: Stores individual reviews
- **Student**: Includes calculated metrics (averageRating, reliabilityBadge, noShowCount, tripsHosted)
- **TouristRequest**: Links to reviews via one-to-one relation

See `prisma/schema.prisma` for complete schema definitions.

## Implementation Details

### Post-Review Calculations

When a review is created, the system:

1. Validates the review data (rating range, text length, attributes)
2. Creates the review in the database
3. Fetches all reviews for the student
4. Calculates new average rating
5. Calculates completion rate
6. Determines reliability badge
7. Updates student record with new metrics

This is implemented in `src/services/reviewService.ts:updateStudentMetrics()`.

### Email Timing Logic

The system finds requests needing review emails by:

1. Filtering for ACCEPTED requests without reviews
2. Parsing the experience end date from the `dates` JSON field
3. Checking if the experience ended 23-25 hours ago (1-hour tolerance)
4. Sending emails for matching requests

This is implemented in `src/services/emailService.ts:findRequestsNeedingReview()`.

## Future Enhancements

Potential improvements to consider:

- Email templates with HTML formatting
- Review response system (students can respond to reviews)
- Review moderation/reporting
- Review analytics dashboard
- Photo uploads with reviews
- Review verification (confirmed bookings only)
- Multi-language support for emails
- Push notifications in addition to emails
