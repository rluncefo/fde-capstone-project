import { Request, Response, NextFunction } from 'express';
import { PrismaClient, BookFormat, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      category,
      format,
      language,
      minPrice,
      maxPrice,
      sort = 'relevance',
      search,
      page = '1',
      limit = '12',
      isRecommended,
      isBestseller,
      isNewLaunch,
    } = req.query as Record<string, string | undefined>;

    const pageNum = parseInt(page ?? '1', 10);
    const limitNum = parseInt(limit ?? '12', 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.BookWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (format) {
      where.format = format as BookFormat;
    }

    if (language) {
      where.language = { equals: language, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: new Prisma.Decimal(minPrice) } : {}),
        ...(maxPrice ? { lte: new Prisma.Decimal(maxPrice) } : {}),
      };
    }

    if (category) {
      where.categories = {
        some: {
          category: { slug: category },
        },
      };
    }

    if (isRecommended === 'true') {
      where.isRecommended = true;
    }

    if (isBestseller === 'true') {
      where.isBestseller = true;
    }

    if (isNewLaunch === 'true') {
      where.isNewLaunch = true;
    }

    let orderBy: Prisma.BookOrderByWithRelationInput = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { salesCount: 'desc' };
    }

    const [rawBooks, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          author: true,
          categories: { include: { category: true } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    const books = rawBooks.map((b) => ({
      ...b,
      price: Number(b.price),
      categories: b.categories.map((bc) => ({
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
      })),
    }));

    res.json({ books, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
}

export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const book = await prisma.book.findUnique({
      where: { slug },
      include: {
        author: true,
        categories: { include: { category: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    res.json({
      ...book,
      price: Number(book.price),
      categories: book.categories.map((bc) => ({
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function related(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const book = await prisma.book.findUnique({
      where: { slug },
      include: { categories: true },
    });

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    const categoryIds = book.categories.map((bc) => bc.categoryId);

    const relatedBooks = await prisma.book.findMany({
      where: {
        id: { not: book.id },
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      take: 5,
      include: {
        author: true,
        categories: { include: { category: true } },
      },
    });

    res.json(relatedBooks.map((b) => ({
      ...b,
      price: Number(b.price),
      categories: b.categories.map((bc) => ({
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
      })),
    })));
  } catch (err) {
    next(err);
  }
}

export async function categories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const all = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(all);
  } catch (err) {
    next(err);
  }
}
