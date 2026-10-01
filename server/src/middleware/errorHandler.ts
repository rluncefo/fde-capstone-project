import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error & { status?: number; statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err.stack);

  const status = err.status ?? err.statusCode ?? 500;
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(isDev ? { stack: err.stack } : {}),
  });
}
