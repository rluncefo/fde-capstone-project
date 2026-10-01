import request from 'supertest';
import app from '../index';

// ─────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────
const VALID_USER = {
  email: "test@bookworm.com",
  password: "password123",
};

const SEARCH_TERM = "minimalism";
const BOOK_SLUG = "joy-of-minimalism";

// ─────────────────────────────────────────────
// Shape helpers
// ─────────────────────────────────────────────

/**
 * Asserts the top-level cart response envelope.
 */
function expectValidCartShape(body: Record<string, unknown>): void {
  expect(Array.isArray(body.items)).toBe(true);
  expect(typeof body.totalItems).toBe("number");
  expect(typeof body.subtotal).toBe("number");
  expect(body.totalItems).toBeGreaterThanOrEqual(0);
  expect(body.subtotal).toBeGreaterThanOrEqual(0);
}

/**
 * Asserts the shape of a single cart item.
 */
function expectValidCartItemShape(item: Record<string, unknown>): void {
  expect(typeof item.id).toBe("string");
  expect(typeof item.bookId).toBe("string");
  expect(typeof item.quantity).toBe("number");
  expect(item.quantity).toBeGreaterThan(0);

  // The book sub-object must carry at least its identity fields
  expect(item.book).toBeDefined();
  const book = item.book as Record<string, unknown>;
  expect(typeof book.id).toBe("string");
  expect(typeof book.title).toBe("string");
  expect(typeof book.price).toBe("number");
}

// ─────────────────────────────────────────────
// Suite-wide shared state
// (populated in beforeAll, consumed by tests)
// ─────────────────────────────────────────────
let authToken: string;
let seededBookId: string;
let addedCartItemId: string; // set in test 3, used by tests 4 & 5

// ─────────────────────────────────────────────
// GET /api/cart — unauthenticated (no beforeAll needed)
// ─────────────────────────────────────────────
describe("GET /api/cart (unauthenticated)", () => {
  // ── 1. No token → 401 ─────────────────────────────────────────────────────
  it("should return 401 when no Authorization header is provided", async () => {
    const response = await request(app)
      .get("/api/cart")
      .set("Accept", "application/json");
    // Deliberately omitting Authorization header

    expect(response.status).toBe(401);

    // Error shape
    expect(response.body).toHaveProperty("error");
    expect(typeof response.body.error).toBe("string");
    expect(response.body.error.length).toBeGreaterThan(0);

    // Must not leak any cart data
    expect(response.body).not.toHaveProperty("items");
    expect(response.body).not.toHaveProperty("totalItems");
    expect(response.body).not.toHaveProperty("subtotal");
  });
});

// ─────────────────────────────────────────────
// Authenticated cart operations
// ─────────────────────────────────────────────
describe("Cart API (authenticated)", () => {
  // ── Global setup ──────────────────────────────────────────────────────────
  beforeAll(async () => {
    // ── Step 1: Obtain auth token ──────────────────────────────────────────
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send(VALID_USER)
      .set("Accept", "application/json");

    if (loginResponse.status !== 200 || !loginResponse.body.token) {
      throw new Error(
        `beforeAll: login failed (status ${loginResponse.status}). ` +
          "Cannot run authenticated cart tests without a valid token."
      );
    }

    authToken = loginResponse.body.token;

    // ── Step 2: Resolve the seeded book ID via search ──────────────────────
    const booksResponse = await request(app)
      .get("/api/books")
      .query({ search: SEARCH_TERM })
      .set("Accept", "application/json");

    if (booksResponse.status !== 200) {
      throw new Error(
        `beforeAll: book search failed (status ${booksResponse.status}). ` +
          "Cannot run cart tests without a valid bookId."
      );
    }

    const books = booksResponse.body.books as Record<string, unknown>[];
    const targetBook = books.find((b) => b.slug === BOOK_SLUG);

    if (!targetBook) {
      throw new Error(
        `beforeAll: book with slug "${BOOK_SLUG}" not found in search results. ` +
          "Verify the seed data is present before running tests."
      );
    }

    seededBookId = targetBook.id as string;
  });
  // ── 2. GET /api/cart with valid token ─────────────────────────────────────
  it("should return 200 with a valid cart structure when authenticated", async () => {
    const response = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    // Top-level envelope
    expectValidCartShape(response.body);

    // Every existing item (if any) must satisfy the item shape
    const items = response.body.items as Record<string, unknown>[];
    items.forEach(expectValidCartItemShape);
  });

  // ── 3. POST /api/cart — add a book ────────────────────────────────────────
  it("should return 200 with the updated cart after adding a book", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json")
      .send({ bookId: seededBookId, quantity: 2 });

    expect(response.status).toBe(200);

    // Envelope shape
    expectValidCartShape(response.body);

    // The newly added book must appear in the returned items
    const items = response.body.items as Record<string, unknown>[];
    expect(items.length).toBeGreaterThan(0);

    const addedItem = items.find(
      (item) => (item.bookId as string) === seededBookId
    );

    expect(addedItem).toBeDefined();
    expectValidCartItemShape(addedItem as Record<string, unknown>);

    // Quantity must match what we sent
    expect(addedItem!.quantity).toBe(2);

    // totals must reflect the addition
    expect(response.body.totalItems).toBeGreaterThan(0);
    expect(response.body.subtotal).toBeGreaterThan(0);

    // Capture itemId for the PATCH and DELETE tests below
    addedCartItemId = addedItem!.id as string;
    expect(typeof addedCartItemId).toBe("string");
    expect(addedCartItemId.length).toBeGreaterThan(0);
  });

  // ── 4. PATCH /api/cart/:itemId — update quantity ──────────────────────────
  it("should return 200 with the updated cart after changing item quantity", async () => {
    // Guard: this test cannot run if test 3 did not capture an itemId
    if (!addedCartItemId) {
      throw new Error(
        "PATCH test requires addedCartItemId set by the POST test. " +
          "Ensure test 3 passed successfully."
      );
    }

    const NEW_QUANTITY = 5;

    const response = await request(app)
      .patch(`/api/cart/${addedCartItemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json")
      .send({ quantity: NEW_QUANTITY });

    expect(response.status).toBe(200);

    // Envelope shape
    expectValidCartShape(response.body);

    // The patched item must reflect the new quantity
    const items = response.body.items as Record<string, unknown>[];
    const patchedItem = items.find((item) => item.id === addedCartItemId);

    expect(patchedItem).toBeDefined();
    expect(patchedItem!.quantity).toBe(NEW_QUANTITY);

    // totalItems must now account for the updated quantity
    expect(response.body.totalItems).toBeGreaterThanOrEqual(NEW_QUANTITY);
  });

  // ── 5. DELETE /api/cart/:itemId — remove item ─────────────────────────────
  it("should remove the item from the cart and return the updated cart", async () => {
    // Guard: this test cannot run if test 3 did not capture an itemId
    if (!addedCartItemId) {
      throw new Error(
        "DELETE test requires addedCartItemId set by the POST test. " +
          "Ensure test 3 passed successfully."
      );
    }

    const deleteResponse = await request(app)
      .delete(`/api/cart/${addedCartItemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json");

    // Accept either 200 (updated cart) or 204 (no content) as valid
    expect([200, 204]).toContain(deleteResponse.status);

    // ── If the API returns the updated cart, validate it ──────────────────
    if (deleteResponse.status === 200) {
      expectValidCartShape(deleteResponse.body);

      // The deleted item must no longer be present
      const items = deleteResponse.body.items as Record<string, unknown>[];
      const deletedItem = items.find((item) => item.id === addedCartItemId);
      expect(deletedItem).toBeUndefined();
    }

    // ── Confirm removal with a follow-up GET ──────────────────────────────
    const verifyResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json");

    expect(verifyResponse.status).toBe(200);

    const remainingItems = verifyResponse.body.items as Record<
      string,
      unknown
    >[];
    const stillPresent = remainingItems.find(
      (item) => item.id === addedCartItemId
    );

    // Item must be gone from a fresh GET as well
    expect(stillPresent).toBeUndefined();
  });
});
