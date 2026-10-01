import { Router } from 'express';
import { list, detail, related } from '../controllers/booksController';

const router = Router();

/**
 * @openapi
 * /api/books:
 *   get:
 *     summary: List books with filtering, searching, sorting and pagination
 *     tags:
 *       - Books
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category slug to filter by
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [PAPERBACK, HARDCOVER, EBOOK]
 *         description: Book format
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Book language
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [relevance, price_asc, price_desc, rating, newest]
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for title and author name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Items per page
 *       - in: query
 *         name: isRecommended
 *         schema:
 *           type: boolean
 *         description: Filter recommended books
 *       - in: query
 *         name: isBestseller
 *         schema:
 *           type: boolean
 *         description: Filter bestseller books
 *       - in: query
 *         name: isNewLaunch
 *         schema:
 *           type: boolean
 *         description: Filter new launch books
 *     responses:
 *       200:
 *         description: List of books with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get('/', list);

/**
 * @openapi
 * /api/books/{slug}/related:
 *   get:
 *     summary: Get related books based on category
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug of the book
 *     responses:
 *       200:
 *         description: List of related books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:slug/related', related);

/**
 * @openapi
 * /api/books/{slug}:
 *   get:
 *     summary: Get book details by slug
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Book slug
 *     responses:
 *       200:
 *         description: Detailed book object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:slug', detail);

export default router;
