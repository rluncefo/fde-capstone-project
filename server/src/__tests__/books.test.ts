import request from 'supertest';
import app from '../index';

// ─────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────
const SEEDED_BOOK_SLUG = "joy-of-minimalism";
const NONEXISTENT_SLUG = "nonexistent-slug";
const SEEDED_CATEGORY_SLUG = "self-help";
const SEARCH_TERM = "minimalism";

// ─────────────────────────────────────────────
// Type guards / shape helpers
// ─────────────────────────────────────────────

/**
 * Asserts the shared shape every Book object must satisfy.
 * Call this for every book in a list response AND for single-book responses.
 */
function expectValidBookShape(book: Record<string, unknown>): void {
  // Core scalar fields
  expect(typeof book.id).toBe("string");
  expect(typeof book.title).toBe("string");
  expect(typeof book.slug).toBe("string");
  expect(typeof book.price).toBe("number");

  // Non-empty strings
  expect((book.title as string).length).toBeGreaterThan(0);
  expect((book.slug as string).length).toBeGreaterThan(0);
}

/**
 * Asserts the extra relations that must be present on a detail response.
 */
function expectBookDetailRelations(book: Record<string, unknown>): void {
  // author must be an object with at minimum a name field
  expect(book.author).toBeDefined();
  expect(typeof (book.author as Record<string, unknown>).name).toBe("string");

  // categories must be a non-empty array of objects with id / name / slug
  expect(Array.isArray(book.categories)).toBe(true);
  const categories = book.categories as Record<string, unknown>[];
  expect(categories.length).toBeGreaterThan(0);
  categories.forEach((cat) => {
    expect(typeof cat.id).toBe("string");
    expect(typeof cat.name).toBe("string");
    expect(typeof cat.slug).toBe("string");
  });
}

/**
 * Asserts the pagination envelope returned by GET /api/books.
 */
function expectValidPaginationEnvelope(
  body: Record<string, unknown>,
  { page, limit }: { page: number; limit: number }
): void {
  expect(Array.isArray(body.books)).toBe(true);
  expect(typeof body.total).toBe("number");
  expect(typeof body.page).toBe("number");
  expect(typeof body.limit).toBe("number");

  expect(body.total).toBeGreaterThanOrEqual(0);
  expect(body.page).toBe(page);
  expect(body.limit).toBe(limit);

  // The list cannot be longer than the requested limit
  expect((body.books as unknown[]).length).toBeLessThanOrEqual(limit);
}

// ─────────────────────────────────────────────
// GET /api/books
// ─────────────────────────────────────────────
describe("GET /api/books", () => {
  // ── 1. Paginated list ─────────────────────────────────────────────────────
  it("should return 200 with a paginated books list", async () => {
    const PAGE = 1;
    const LIMIT = 10;

    const response = await request(app)
      .get("/api/books")
      .query({ page: PAGE, limit: LIMIT })
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    // Pagination envelope
    expectValidPaginationEnvelope(response.body, { page: PAGE, limit: LIMIT });

    // Every book in the list satisfies the base shape
    const books = response.body.books as Record<string, unknown>[];
    books.forEach(expectValidBookShape);
  });

  // ── 2. Filter by category ─────────────────────────────────────────────────
  it("should return 200 with only books matching the given category slug", async () => {
    const response = await request(app)
      .get("/api/books")
      .query({ category: SEEDED_CATEGORY_SLUG, page: 1, limit: 20 })
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    const books = response.body.books as Record<string, unknown>[];

    // At least one seeded book belongs to self-help
    expect(books.length).toBeGreaterThan(0);

    // Every returned book must belong to the requested category
    books.forEach((book) => {
      const categories = book.categories as
        | Record<string, unknown>[]
        | undefined;

      // categories may be undefined on list items — if present, validate
      if (categories !== undefined) {
        const slugs = categories.map((c) => c.slug);
        expect(slugs).toContain(SEEDED_CATEGORY_SLUG);
      }
    });

    // Pagination envelope still valid
    expectValidPaginationEnvelope(response.body, { page: 1, limit: 20 });
  });

  // ── 3. Search by title ────────────────────────────────────────────────────
  it("should return 200 with books whose title matches the search term", async () => {
    const response = await request(app)
      .get("/api/books")
      .query({ search: SEARCH_TERM, page: 1, limit: 10 })
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    const books = response.body.books as Record<string, unknown>[];

    // The seeded "joy-of-minimalism" book must appear in results
    expect(books.length).toBeGreaterThan(0);

    // Every result must contain the search term in its title (case-insensitive)
    books.forEach((book) => {
      expect((book.title as string).toLowerCase()).toContain(
        SEARCH_TERM.toLowerCase()
      );
    });
  });

  // ── 4. Filter recommended books ───────────────────────────────────────────
  it("should return 200 with only recommended books when isRecommended=true", async () => {
    const response = await request(app)
      .get("/api/books")
      .query({ isRecommended: "true", page: 1, limit: 20 })
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    const books = response.body.books as Record<string, unknown>[];

    // Every returned book must have the flag set
    books.forEach((book) => {
      expect(book.isRecommended).toBe(true);
    });

    // Pagination envelope still valid
    expectValidPaginationEnvelope(response.body, { page: 1, limit: 20 });
  });
});

// ─────────────────────────────────────────────
// GET /api/books/:slug
// ─────────────────────────────────────────────
describe("GET /api/books/:slug", () => {
  // ── 5. Known slug → book detail ───────────────────────────────────────────
  it("should return 200 with full book detail including author and categories", async () => {
    const response = await request(app)
      .get(`/api/books/${SEEDED_BOOK_SLUG}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    const book = response.body as Record<string, unknown>;

    // Base scalar shape
    expectValidBookShape(book);

    // Slug in the response must match the requested slug
    expect(book.slug).toBe(SEEDED_BOOK_SLUG);

    // Relations (author + categories) must be present and well-formed
    expectBookDetailRelations(book);
  });

  // ── 6. Unknown slug → 404 ─────────────────────────────────────────────────
  it("should return 404 with an error message for a non-existent slug", async () => {
    const response = await request(app)
      .get(`/api/books/${NONEXISTENT_SLUG}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(404);

    // Error shape
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Book not found");

    // Must not leak any book data
    expect(response.body).not.toHaveProperty("id");
    expect(response.body).not.toHaveProperty("slug");
    expect(response.body).not.toHaveProperty("title");
  });
});

// ─────────────────────────────────────────────
// GET /api/categories
// ─────────────────────────────────────────────
describe("GET /api/categories", () => {
  // ── 7. All categories ─────────────────────────────────────────────────────
  it("should return 200 with an array of category objects", async () => {
    const response = await request(app)
      .get("/api/categories")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    // Response is a top-level array
    expect(Array.isArray(response.body)).toBe(true);

    const categories = response.body as Record<string, unknown>[];

    // At least the seeded category is present
    expect(categories.length).toBeGreaterThan(0);

    // Every category satisfies the required shape
    categories.forEach((cat) => {
      expect(typeof cat.id).toBe("string");
      expect(typeof cat.name).toBe("string");
      expect(typeof cat.slug).toBe("string");

      expect((cat.name as string).length).toBeGreaterThan(0);
      expect((cat.slug as string).length).toBeGreaterThan(0);
    });

    // The seeded "self-help" category must be present
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain(SEEDED_CATEGORY_SLUG);
  });
});