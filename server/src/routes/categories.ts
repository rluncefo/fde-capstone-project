import { Router } from 'express';
import { categories } from '../controllers/booksController';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Get all book categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', categories);

export default router;
