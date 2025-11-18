import express from 'express';
import reviewRoutes from './routes/reviewRoutes';
import { startReviewEmailCron } from './jobs/reviewEmailCron';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/reviews', reviewRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start cron job for review emails
  startReviewEmailCron();
  console.log('Review email cron job started');
});

export default app;
