import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const book = await prisma.book.findUnique({
      where: { slug },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    res.json(book.reviews);
  } catch (err) {
    next(err);
  }
}

export async function createReview(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;
    const { rating, content } = req.body as { rating: number; content: string };
    const userId = req.user!.id;

    const book = await prisma.book.findUnique({ where: { slug } });

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    const review = await prisma.review.create({
      data: { bookId: book.id, userId, rating, content },
      include: { user: { select: { id: true, name: true } } },
    });

    // Recalculate average rating
    const aggregate = await prisma.review.aggregate({
      where: { bookId: book.id },
      _avg: { rating: true },
    });

    await prisma.book.update({
      where: { id: book.id },
      data: { rating: aggregate._avg.rating ?? 0 },
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}
