import { prisma } from '../lib/prisma';

/**
 * Email template for review request
 */
interface ReviewRequestEmail {
  to: string;
  subject: string;
  body: string;
  studentName: string;
  requestId: string;
}

/**
 * Finds tourist requests that need review emails sent
 * (24 hours after experience date, no review yet submitted)
 */
export async function findRequestsNeedingReview(): Promise<string[]> {
  // Calculate the timestamp for 24 hours ago
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find accepted requests where:
  // 1. Experience date was ~24 hours ago
  // 2. No review has been submitted yet
  // 3. Request status is ACCEPTED
  const requests = await prisma.touristRequest.findMany({
    where: {
      status: 'ACCEPTED',
      review: null, // No review exists yet
    },
    include: {
      selections: {
        where: { status: 'accepted' },
        include: {
          student: true,
        },
      },
    },
  });

  // Filter requests where experience date was 24 hours ago
  const requestsToEmail = requests.filter((request) => {
    const dates = request.dates as any;
    let experienceDate: Date;

    // Handle both single date and date range
    if (dates.end) {
      experienceDate = new Date(dates.end);
    } else if (dates.start) {
      experienceDate = new Date(dates.start);
    } else if (typeof dates === 'string') {
      experienceDate = new Date(dates);
    } else {
      return false;
    }

    // Check if experience ended approximately 24 hours ago (with 1 hour tolerance)
    const hoursSinceExperience =
      (Date.now() - experienceDate.getTime()) / (1000 * 60 * 60);

    return hoursSinceExperience >= 23 && hoursSinceExperience <= 25;
  });

  return requestsToEmail.map((r) => r.id);
}

/**
 * Sends review request email to tourist
 */
export async function sendReviewRequestEmail(requestId: string): Promise<void> {
  const request = await prisma.touristRequest.findUnique({
    where: { id: requestId },
    include: {
      selections: {
        where: { status: 'accepted' },
        include: {
          student: true,
        },
      },
    },
  });

  if (!request || !request.selections[0]) {
    throw new Error('Request or student not found');
  }

  const student = request.selections[0].student;
  const email = buildReviewRequestEmail(request.email, student.name, requestId);

  // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
  console.log('Sending review request email:', email);

  // In production, you would call your email service here:
  // await emailProvider.send(email);
}

/**
 * Builds the review request email template
 */
function buildReviewRequestEmail(
  touristEmail: string,
  studentName: string,
  requestId: string
): ReviewRequestEmail {
  const reviewUrl = `${process.env.APP_URL}/review/${requestId}`;

  return {
    to: touristEmail,
    subject: `How was your experience with ${studentName}?`,
    body: `
Hello!

We hope you had a wonderful experience with ${studentName} on your recent trip!

We'd love to hear about your experience. Your feedback helps us maintain quality
and helps other travelers make informed decisions.

Please take a moment to leave a review:
${reviewUrl}

Your review will help ${studentName} build their reputation and improve their service.

Thank you for using WanderNest!

Best regards,
The WanderNest Team
    `.trim(),
    studentName,
    requestId,
  };
}

/**
 * Cron job function to send review requests
 * Should be run periodically (e.g., every hour)
 */
export async function sendPendingReviewRequests(): Promise<number> {
  const requestIds = await findRequestsNeedingReview();

  let sentCount = 0;
  for (const requestId of requestIds) {
    try {
      await sendReviewRequestEmail(requestId);
      sentCount++;
    } catch (error) {
      console.error(`Failed to send review email for request ${requestId}:`, error);
    }
  }

  console.log(`Sent ${sentCount} review request emails`);
  return sentCount;
}

/**
 * Manual trigger to send review request for a specific request
 */
export async function triggerReviewRequest(requestId: string): Promise<void> {
  const request = await prisma.touristRequest.findUnique({
    where: { id: requestId },
    include: {
      review: true,
    },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.review) {
    throw new Error('Review already submitted for this request');
  }

  if (request.status !== 'ACCEPTED') {
    throw new Error('Can only send review requests for accepted experiences');
  }

  await sendReviewRequestEmail(requestId);
}
