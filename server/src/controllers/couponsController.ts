import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function validateCoupon(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { code } = req.body as { code: string };

    if (!code) {
      res.status(400).json({ error: 'Coupon code is required' });
      return;
    }

    const coupon = await prisma.coupon.findFirst({
      where: { code, isActive: true },
    });

    if (!coupon) {
      res.json({ valid: false, message: 'Invalid or expired coupon' });
      return;
    }

    res.json({ valid: true, discountAmount: Number(coupon.discountAmount) });
  } catch (err) {
    next(err);
  }
}
