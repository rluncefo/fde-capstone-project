import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getWishlist(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: { book: { include: { author: true } } },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function addItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bookId } = req.body as { bookId: string };
    const userId = req.user!.id;

    const item = await prisma.wishlist.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId },
      update: {},
      include: { book: { include: { author: true } } },
    });

    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function removeItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;

    await prisma.wishlist.deleteMany({ where: { userId, bookId } });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
}
