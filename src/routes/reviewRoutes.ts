import { Router, Request, Response } from 'express';
import {
  createReview,
  getStudentReviews,
  getStudentMetrics,
} from '../services/reviewService';
import { triggerReviewRequest } from '../services/emailService';

const router = Router();

/**
 * POST /api/reviews
 * Create a new review
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const review = await createReview(req.body);
    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/reviews/student/:studentId
 * Get all reviews for a student
 */
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const reviews = await getStudentReviews(studentId);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/reviews/student/:studentId/metrics
 * Get student metrics (average rating, completion rate, badge)
 */
router.get('/student/:studentId/metrics', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const metrics = await getStudentMetrics(studentId);

    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/reviews/trigger/:requestId
 * Manually trigger a review request email
 */
router.post('/trigger/:requestId', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    await triggerReviewRequest(requestId);

    res.json({
      success: true,
      message: 'Review request email sent',
    });
  } catch (error: any) {
    console.error('Error triggering review request:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
