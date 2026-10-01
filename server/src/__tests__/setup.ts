// Mock swagger-jsdoc to avoid ESM/CommonJS incompatibility in Jest
jest.mock('swagger-jsdoc', () => () => ({ openapi: '3.0.0', info: {}, paths: {} }));
jest.mock('swagger-ui-express', () => ({
  serve: [],
  setup: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));
