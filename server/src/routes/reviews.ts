import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviewsController';
import { authenticateToken } from '../middleware/auth';

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/books/{slug}/reviews:
 *   get:
 *     summary: Get reviews for a specific book
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Book slug
 *     responses:
 *       200:
 *         description: List of reviews for the book
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/:slug/reviews', getReviews);

/**
 * @openapi
 * /api/books/{slug}/reviews:
 *   post:
 *     summary: Submit a review for a book
 *     tags:
 *       - Reviews
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Book slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - content
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error or already reviewed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.post('/:slug/reviews', authenticateToken, createReview);

export default router;
