import { Router } from 'express';
import { processPayment } from '../controllers/paymentsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/payments:
 *   post:
 *     summary: Process mock payment for an order
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - method
 *             properties:
 *               orderId:
 *                 type: string
 *               method:
 *                 type: string
 *                 enum: [CREDIT_CARD, DEBIT_CARD, UPI, WALLET]
 *               cardDetails:
 *                 type: object
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *                   cardHolder:
 *                     type: string
 *                   expiryDate:
 *                     type: string
 *                   cvv:
 *                     type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid payment data or order already paid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/', authenticateToken, processPayment);

export default router;
