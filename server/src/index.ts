import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import authRoutes from './routes/auth';
import booksRoutes from './routes/books';
import categoriesRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import ordersRoutes from './routes/orders';
import paymentsRoutes from './routes/payments';
import reviewsRoutes from './routes/reviews';
import couponsRoutes from './routes/coupons';
import { errorHandler } from './middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 db:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       503:
 *         description: Database unreachable
 */
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/books', reviewsRoutes);
app.use('/api/coupons', couponsRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Only start the HTTP server when NOT imported by tests (Supertest binds its own port)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API docs: http://localhost:${PORT}/api-docs`);
  });
}

export default app;
