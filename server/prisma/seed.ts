import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Use string literals instead of enum imports so the seed compiles
// before `prisma generate` has been run.
type BookFormatStr = 'PAPERBACK' | 'HARDCOVER' | 'EBOOK';
type RoleStr = 'GUEST' | 'MEMBER';

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Store ──────────────────────────────────────────────────────────────────
  await prisma.store.upsert({
    where: { id: 'store-bookworm' },
    update: {},
    create: {
      id: 'store-bookworm',
      name: 'BookWorm Store',
      description: 'Your favorite online bookstore',
    },
  });
  console.log('✅ Store seeded');

  // ─── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'All', slug: 'all' },
    { name: 'Romance', slug: 'romance' },
    { name: 'Mystery', slug: 'mystery' },
    { name: 'Science Fiction', slug: 'science-fiction' },
    { name: 'Fantasy', slug: 'fantasy' },
    { name: 'Historical', slug: 'historical' },
    { name: 'Biography', slug: 'biography' },
    { name: 'Self-help', slug: 'self-help' },
    { name: 'Memoir', slug: 'memoir' },
    { name: 'Travel', slug: 'travel' },
    { name: 'Cooking', slug: 'cooking' },
    { name: "Children's", slug: 'childrens' },
    { name: 'Young Adult', slug: 'young-adult' },
    { name: 'Comics & Graphic Novels', slug: 'comics-graphic-novels' },
    { name: 'Poetry', slug: 'poetry' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Science', slug: 'science' },
    { name: 'Philosophy', slug: 'philosophy' },
    { name: 'Religion', slug: 'religion' },
    { name: 'Language Learning', slug: 'language-learning' },
  ];

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  // ─── Authors ─────────────────────────────────────────────────────────────────
  const authorData = [
    {
      name: 'Arjun Patel',
      bio: 'Arjun Patel is a productivity coach and author helping thousands reclaim their focus in a distracted world.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunPatel',
    },
    {
      name: 'Raj Patel',
      bio: 'Raj Patel is an educator and learning strategist dedicated to helping readers unlock their full potential.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RajPatel',
    },
    {
      name: 'James Wright',
      bio: 'James Wright is a motivational speaker and author specializing in personal development and goal setting.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesWright',
    },
    {
      name: 'James Adams',
      bio: 'James Adams is a bestselling thriller writer known for his atmospheric mysteries and psychological suspense.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesAdams',
    },
    {
      name: 'Jessica Martin',
      bio: 'Jessica Martin is a romance novelist whose heartfelt stories have captured readers across the globe.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JessicaMartin',
    },
    {
      name: 'Laura Mitchell',
      bio: 'Laura Mitchell is a science fiction author and aerospace enthusiast, writing adventures that push the boundaries of human possibility.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LauraMitchell',
    },
    {
      name: 'Daniel Reed',
      bio: 'Daniel Reed is a minimalism advocate and lifestyle writer, helping readers simplify their lives for greater happiness.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanielReed',
    },
    {
      name: 'Clara Nelson',
      bio: 'Clara Nelson is a mystery author with a talent for crafting spine-chilling narratives that keep readers guessing.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ClaraNelson',
    },
    {
      name: 'Emily Parker',
      bio: "Emily Parker is a beloved children's book author whose stories inspire imagination, courage, and kindness.",
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyParker',
    },
  ];

  const authors: Record<string, string> = {};
  for (const a of authorData) {
    const author = await prisma.author.upsert({
      where: { id: `author-${a.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `author-${a.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...a,
      },
    });
    authors[a.name] = author.id;
  }
  console.log('✅ Authors seeded');

  // ─── Books ───────────────────────────────────────────────────────────────────
  const bookData: Array<{
    title: string;
    slug: string;
    description: string;
    price: string;
    format: BookFormatStr;
    authorName: string;
    categorySlugs: string[];
    isRecommended?: boolean;
    isBestseller?: boolean;
    isNewLaunch?: boolean;
    salesCount: number;
    rating: string;
  }> = [
    {
      title: 'The Art of Focus',
      slug: 'the-art-of-focus',
      description: 'Practical guide to mastering focus & boosting productivity every day.',
      price: '4.69',
      format: 'PAPERBACK',
      authorName: 'Arjun Patel',
      categorySlugs: ['self-help'],
      isRecommended: true,
      salesCount: 320,
      rating: '4.50',
    },
    {
      title: 'The Art of Learning',
      slug: 'the-art-of-learning',
      description: 'Master the mindset and methods for effective lifelong learning.',
      price: '3.05',
      format: 'PAPERBACK',
      authorName: 'Raj Patel',
      categorySlugs: ['self-help'],
      isRecommended: true,
      salesCount: 275,
      rating: '4.30',
    },
    {
      title: 'The Path to Success',
      slug: 'the-path-to-success',
      description: 'A practical guide to achieving goals with clarity and confidence.',
      price: '4.23',
      format: 'PAPERBACK',
      authorName: 'James Wright',
      categorySlugs: ['self-help'],
      isRecommended: true,
      salesCount: 410,
      rating: '4.70',
    },
    {
      title: 'The Midnight Hour',
      slug: 'the-midnight-hour',
      description: "Haunting tale of a man's journey & the shadows of a forgotten past.",
      price: '3.52',
      format: 'PAPERBACK',
      authorName: 'James Adams',
      categorySlugs: ['mystery'],
      isBestseller: true,
      salesCount: 490,
      rating: '4.80',
    },
    {
      title: 'Beneath the Stars',
      slug: 'beneath-the-stars',
      description: 'A heartwarming tale, where two souls discover who you need.',
      price: '5.87',
      format: 'HARDCOVER',
      authorName: 'Jessica Martin',
      categorySlugs: ['romance'],
      isBestseller: true,
      salesCount: 380,
      rating: '4.60',
    },
    {
      title: 'The Final Frontier',
      slug: 'the-final-frontier',
      description: 'A mission to space secrets to change humanity forever.',
      price: '4.23',
      format: 'PAPERBACK',
      authorName: 'Laura Mitchell',
      categorySlugs: ['science-fiction'],
      isBestseller: true,
      salesCount: 310,
      rating: '4.40',
    },
    {
      title: 'Joy of Minimalism',
      slug: 'joy-of-minimalism',
      description: 'Declutter your life to uncover peace, clarity, and joy.',
      price: '1.75',
      format: 'PAPERBACK',
      authorName: 'Daniel Reed',
      categorySlugs: ['self-help'],
      isNewLaunch: true,
      salesCount: 95,
      rating: '4.20',
    },
    {
      title: 'The Vanishing House',
      slug: 'the-vanishing-house',
      description: 'A chilling mystery unfolds within a house that disappears.',
      price: '1.16',
      format: 'EBOOK',
      authorName: 'Clara Nelson',
      categorySlugs: ['mystery'],
      isNewLaunch: true,
      salesCount: 72,
      rating: '3.90',
    },
    {
      title: 'The Lost Kitten',
      slug: 'the-lost-kitten',
      description: 'A heartwarming tale of courage, friendship, and feline adventure.',
      price: '3.99',
      format: 'HARDCOVER',
      authorName: 'Emily Parker',
      categorySlugs: ['childrens'],
      isNewLaunch: true,
      salesCount: 130,
      rating: '4.90',
    },
  ];

  const books: Record<string, string> = {};
  for (const b of bookData) {
    const authorId = authors[b.authorName];
    const book = await prisma.book.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        id: `book-${b.slug}`,
        title: b.title,
        slug: b.slug,
        description: b.description,
        coverUrl: `https://picsum.photos/seed/${b.slug}/200/300`,
        price: b.price,
        format: b.format,
        language: 'English',
        stockCount: 100,
        authorId,
        rating: b.rating,
        salesCount: b.salesCount,
        isRecommended: b.isRecommended ?? false,
        isBestseller: b.isBestseller ?? false,
        isNewLaunch: b.isNewLaunch ?? false,
      },
    });
    books[b.slug] = book.id;

    // Create BookCategory join records
    for (const catSlug of b.categorySlugs) {
      const category = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (category) {
        await prisma.bookCategory.upsert({
          where: {
            bookId_categoryId: { bookId: book.id, categoryId: category.id },
          },
          update: {},
          create: { bookId: book.id, categoryId: category.id },
        });
      }
    }
  }
  console.log('✅ Books seeded');

  // ─── Users ───────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      id: 'user-test',
      email: 'test@bookworm.com',
      name: 'Test User',
      role: 'MEMBER' as RoleStr,
      giftPoints: 250,
    },
    {
      id: 'user-alice',
      email: 'alice@bookworm.com',
      name: 'Alice Johnson',
      role: 'MEMBER' as RoleStr,
      giftPoints: 100,
    },
    {
      id: 'user-guest',
      email: 'guest@bookworm.com',
      name: 'Guest User',
      role: 'GUEST' as RoleStr,
      giftPoints: 0,
    },
  ];

  const createdUsers: Record<string, string> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
    });
    createdUsers[u.email] = user.id;
  }
  console.log('✅ Users seeded');

  // ─── Coupon ──────────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'DISCOUNT100' },
    update: {},
    create: {
      code: 'DISCOUNT100',
      discountAmount: '1.00',
      isActive: true,
    },
  });
  console.log('✅ Coupon seeded');

  // ─── Reviews ─────────────────────────────────────────────────────────────────
  const joyBookId = books['joy-of-minimalism'];
  const testUserId = createdUsers['test@bookworm.com'];
  const aliceUserId = createdUsers['alice@bookworm.com'];
  const guestUserId = createdUsers['guest@bookworm.com'];

  const reviewsData = [
    {
      id: 'review-joy-1',
      bookId: joyBookId,
      userId: testUserId,
      rating: 5,
      content:
        'This book completely changed how I think about possessions. Life-changing read!',
    },
    {
      id: 'review-joy-2',
      bookId: joyBookId,
      userId: aliceUserId,
      rating: 4,
      content:
        'Great practical advice on decluttering. Some chapters felt repetitive but overall very inspiring.',
    },
    {
      id: 'review-joy-3',
      bookId: joyBookId,
      userId: guestUserId,
      rating: 4,
      content: 'A refreshing perspective on minimalism. Short, sweet, and impactful.',
    },
  ];

  for (const r of reviewsData) {
    await prisma.review.upsert({
      where: { id: r.id },
      update: {},
      create: r,
    });
  }
  console.log('✅ Reviews seeded');

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
