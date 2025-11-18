import cron from 'node-cron';
import { sendPendingReviewRequests } from '../services/emailService';

/**
 * Starts a cron job that runs every hour to send review request emails
 * for experiences that ended 24 hours ago
 */
export function startReviewEmailCron() {
  // Run every hour at minute 0
  // Cron format: minute hour day month weekday
  cron.schedule('0 * * * *', async () => {
    console.log('Running review email cron job...');
    try {
      const sentCount = await sendPendingReviewRequests();
      console.log(`Review email cron completed. Sent ${sentCount} emails.`);
    } catch (error) {
      console.error('Error in review email cron job:', error);
    }
  });

  console.log('Review email cron job scheduled (runs every hour)');
}
