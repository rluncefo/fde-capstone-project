import { Router } from 'express';
import { getWishlist, addItem, removeItem } from '../controllers/wishlistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

/**
 * @openapi
 * /api/wishlist:
 *   get:
 *     summary: Get current user's wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   bookId:
 *                     type: string
 *                   book:
 *                     $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getWishlist);

/**
 * @openapi
 * /api/wishlist:
 *   post:
 *     summary: Add a book to wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added to wishlist
 *       401:
 *         description: Unauthorized
 */
router.post('/', addItem);

/**
 * @openapi
 * /api/wishlist/{bookId}:
 *   delete:
 *     summary: Remove a book from wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Item removed from wishlist
 *       401:
 *         description: Unauthorized
 */
router.delete('/:bookId', removeItem);

export default router;
