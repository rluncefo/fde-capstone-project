import { Router } from 'express';
import { validateCoupon } from '../controllers/couponsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/coupons/validate:
 *   post:
 *     summary: Validate a promotional coupon code
 *     tags:
 *       - Coupons
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 discountAmount:
 *                   type: number
 *       400:
 *         description: Invalid or expired coupon code
 *       401:
 *         description: Unauthorized
 */
router.post('/validate', authenticateToken, validateCoupon);

export default router;
