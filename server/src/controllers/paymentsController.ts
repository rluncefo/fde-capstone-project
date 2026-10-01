import { Response, NextFunction } from 'express';
import { PrismaClient, PaymentMethod } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function processPayment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { orderId, method } = req.body as {
      orderId: string;
      method: PaymentMethod;
      cardDetails?: unknown; // accepted but not stored
    };

    const userId = req.user!.id;

    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ error: 'Order is not in a payable state' });
      return;
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const transactionRef = 'TXN-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          orderId,
          method,
          status: 'SUCCESS',
          amount: order.totalAmount,
          transactionRef,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      }),
    ]);

    res.json({
      success: true,
      transactionRef,
      payment: {
        ...payment,
        amount: Number(payment.amount),
      },
    });
  } catch (err) {
    next(err);
  }
}
