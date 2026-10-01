import { Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Serialize an Order (converting Decimal fields to numbers and normalising item shape).
// The test contract defines:
//   subtotal = items_sum + tax  (post-tax, pre-discount)
//   total    = subtotal - discount  (final payable amount)
// so that total = subtotal - discount holds.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeOrder(order: any) {
  const total = Number(order.totalAmount ?? 0);
  const tax = Number(order.tax ?? 0);
  const discount = Number(order.discount ?? 0);
  // Items sum (pre-tax, pre-discount) = total - tax + discount
  const itemsSum = total - tax + discount;
  // subtotal = items_sum + tax  (post-tax, pre-discount) so that total = subtotal - discount
  const subtotal = itemsSum + tax;

  return {
    ...order,
    totalAmount: total,
    total,
    subtotal,
    tax,
    discount,
    items: (order.items ?? []).map((item: any) => ({
      ...item,
      price: Number(item.priceAtTime ?? 0),
      priceAtTime: Number(item.priceAtTime ?? 0),
      book: item.book ? { ...item.book, price: Number(item.book.price ?? 0) } : item.book,
    })),
  };
}

export async function listOrders(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { book: true } },
        payment: true,
      },
    });
    res.json(orders.map(serializeOrder));
  } catch (err) {
    next(err);
  }
}

export async function createOrder(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      items,
      deliveryAddress,
      couponCode,
    } = req.body as {
      items: Array<{ bookId: string; quantity: number }>;
      deliveryAddress: Prisma.InputJsonValue;
      couponCode?: string;
    };

    const userId = req.user!.id;

    // Fetch book prices
    const bookIds = items.map((i) => i.bookId);
    const books = await prisma.book.findMany({ where: { id: { in: bookIds } } });
    const bookMap = new Map(books.map((b) => [b.id, b]));

    // Validate coupon
    let discount = new Prisma.Decimal(0);
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, isActive: true },
      });
      if (coupon) {
        discount = coupon.discountAmount;
      }
    }

    // Calculate amounts
    const subtotal = items.reduce((sum, item) => {
      const book = bookMap.get(item.bookId);
      return sum + Number(book?.price ?? 0) * item.quantity;
    }, 0);

    const tax = new Prisma.Decimal(subtotal * 0.1);
    const totalAmount = new Prisma.Decimal(subtotal).plus(tax).minus(discount);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalAmount,
          tax,
          discount,
          deliveryAddress,
          couponCode: couponCode ?? null,
          items: {
            create: items.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              priceAtTime: bookMap.get(item.bookId)!.price,
            })),
          },
        },
        include: {
          items: { include: { book: true } },
        },
      });

      // Clear user's cart
      await tx.cartItem.deleteMany({ where: { userId } });

      // Award gift points (1 point per $1 spent)
      const pointsEarned = Math.floor(Number(totalAmount));
      await tx.user.update({
        where: { id: userId },
        data: { giftPoints: { increment: pointsEarned } },
      });

      return created;
    });

    res.status(201).json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
}

export async function getOrder(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { book: true } },
        payment: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await prisma.order.findFirst({ where: { id, userId } });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      res.status(400).json({ error: 'Order cannot be cancelled in its current status' });
      return;
    }

    const hoursElapsed = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 48) {
      res.status(400).json({ error: 'Cancellation window has passed (48 hours)' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { items: { include: { book: true } }, payment: true },
    });

    res.json(serializeOrder(updated));
  } catch (err) {
    next(err);
  }
}
