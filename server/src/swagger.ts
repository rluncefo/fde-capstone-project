import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookWorm API',
      version: '1.0.0',
      description: 'E-commerce API for BookWorm bookstore',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            coverUrl: { type: 'string' },
            price: { type: 'number' },
            format: { type: 'string', enum: ['PAPERBACK', 'HARDCOVER', 'EBOOK'] },
            language: { type: 'string' },
            stockCount: { type: 'integer' },
            rating: { type: 'number' },
            salesCount: { type: 'integer' },
            isRecommended: { type: 'boolean' },
            isBestseller: { type: 'boolean' },
            isNewLaunch: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            author: { $ref: '#/components/schemas/Author' },
            categories: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
          },
        },
        BookSummary: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            coverUrl: { type: 'string' },
            price: { type: 'number' },
            rating: { type: 'number' },
            author: { $ref: '#/components/schemas/Author' },
          },
        },
        Author: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            bio: { type: 'string' },
            avatarUrl: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['GUEST', 'MEMBER'] },
            giftPoints: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'] },
            totalAmount: { type: 'number' },
            tax: { type: 'number' },
            discount: { type: 'number' },
            deliveryAddress: { type: 'object' },
            couponCode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bookId: { type: 'string' },
            quantity: { type: 'integer' },
            book: { $ref: '#/components/schemas/BookSummary' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderId: { type: 'string' },
            method: { type: 'string', enum: ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET'] },
            status: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
            amount: { type: 'number' },
            transactionRef: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bookId: { type: 'string' },
            userId: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
          },
        },
        Coupon: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            code: { type: 'string' },
            discountAmount: { type: 'number' },
            isActive: { type: 'boolean' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
