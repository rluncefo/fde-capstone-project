import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

async function buildCartResponse(userId: string) {
  const rawItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { book: { include: { author: true, categories: { include: { category: true } } } } },
  });

  const totalItems = rawItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = rawItems.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0
  );

  // Serialize Decimal price and flatten categories
  const items = rawItems.map((item) => ({
    ...item,
    book: {
      ...item.book,
      price: Number(item.book.price),
      categories: item.book.categories.map((bc) => ({
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
      })),
    },
  }));

  return { items, totalItems, subtotal };
}

export async function getCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const cart = await buildCartResponse(req.user!.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function addItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bookId, quantity = 1 } = req.body as { bookId: string; quantity?: number };
    const userId = req.user!.id;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { userId_bookId: { userId, bookId } },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, bookId, quantity },
      });
    }

    const cart = await buildCartResponse(userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body as { quantity: number };
    const userId = req.user!.id;

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, userId } });
      res.json({ message: 'Item removed' });
      return;
    }

    const updated = await prisma.cartItem.updateMany({
      where: { id: itemId, userId },
      data: { quantity },
    });

    if (updated.count === 0) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    const cart = await buildCartResponse(userId);
    res.json(cart);
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
    const { itemId } = req.params;
    const userId = req.user!.id;

    await prisma.cartItem.deleteMany({ where: { id: itemId, userId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
