import request from 'supertest';
import app from '../index';

// ─────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────
const VALID_USER = {
  email: "test@bookworm.com",
  password: "password123",
};

const SEEDED_COUPON_CODE = "DISCOUNT100";
const COUPON_DISCOUNT_AMOUNT = 1.0; // $1.00

const DELIVERY_ADDRESS = {
  firstName: "Test",
  lastName: "User",
  address: "123 Bookworm Lane",
  city: "Reading",
  pin: "12345",
  state: "Bookstate",
  country: "US",
  email: "test@bookworm.com",
  phone: "5550001234",
};

// ─────────────────────────────────────────────
// Shape helpers
// ─────────────────────────────────────────────

/**
 * Asserts the minimum required shape of a single Order object.
 */
function expectValidOrderShape(order: Record<string, unknown>): void {
  // Identity & status
  expect(typeof order.id).toBe("string");
  expect((order.id as string).length).toBeGreaterThan(0);
  expect(typeof order.status).toBe("string");

  // Financial fields
  expect(typeof order.subtotal).toBe("number");
  expect(typeof order.total).toBe("number");
  expect(order.subtotal).toBeGreaterThanOrEqual(0);
  expect(order.total).toBeGreaterThanOrEqual(0);

  // Items array
  expect(Array.isArray(order.items)).toBe(true);
  expect((order.items as unknown[]).length).toBeGreaterThan(0);

  // Delivery address must be present
  expect(order.deliveryAddress).toBeDefined();
  const addr = order.deliveryAddress as Record<string, unknown>;
  expect(typeof addr.firstName).toBe("string");
  expect(typeof addr.lastName).toBe("string");
  expect(typeof addr.address).toBe("string");
  expect(typeof addr.city).toBe("string");
  expect(typeof addr.email).toBe("string");

  // Timestamps
  expect(typeof order.createdAt).toBe("string");
}

/**
 * Asserts the shape of a single order line item.
 */
function expectValidOrderItemShape(item: Record<string, unknown>): void {
  expect(typeof item.bookId).toBe("string");
  expect(typeof item.quantity).toBe("number");
  expect(item.quantity).toBeGreaterThan(0);
  expect(typeof item.price).toBe("number");
  expect(item.price).toBeGreaterThanOrEqual(0);
}

// ─────────────────────────────────────────────
// Suite-wide shared state
// ─────────────────────────────────────────────
let authToken: string;
let seededBookId: string;
let createdOrderId: string;       // captured in test 1, used in test 4
let createdOrderTotal: number;    // captured in test 1, used as baseline in test 2

describe('Orders API (/api/orders)', () => {
  // ── Global setup ──────────────────────────────────────────────────────────
  beforeAll(async () => {

    // ── Step 1: Obtain auth token ────────────────────────────────────────
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send(VALID_USER)
      .set("Accept", "application/json");

    if (loginResponse.status !== 200 || !loginResponse.body.token) {
      throw new Error(
        `beforeAll › login failed (status ${loginResponse.status}). ` +
        "Cannot run order tests without a valid token."
      );
    }

    authToken = loginResponse.body.token;

    // ── Step 2: Resolve seeded book ID ───────────────────────────────────
    const booksResponse = await request(app)
      .get("/api/books")
      .query({ search: "minimalism" })
      .set("Accept", "application/json");

    if (booksResponse.status !== 200) {
      throw new Error(
        `beforeAll › book search failed (status ${booksResponse.status}). ` +
        "Cannot run order tests without a valid bookId."
      );
    }

    const books = booksResponse.body.books as Record<string, unknown>[];
    const target = books.find((b) => b.slug === "joy-of-minimalism");

    if (!target) {
      throw new Error(
        'beforeAll › book with slug "joy-of-minimalism" not found. ' +
        "Verify seed data before running tests."
      );
    }

    seededBookId = target.id as string;
  });

  it("should return 201 with a valid order object when body is well-formed", async () => {
    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json")
      .send({
        items: [{ bookId: seededBookId, quantity: 1 }],
        deliveryAddress: DELIVERY_ADDRESS,
      });

    expect(response.status).toBe(201);

    const order = response.body as Record<string, unknown>;

    // Full order shape
    expectValidOrderShape(order);

    // Line items shape
    const items = order.items as Record<string, unknown>[];
    items.forEach(expectValidOrderItemShape);

    // The book we ordered must appear in the line items
    const matchingItem = items.find(
      (item) => (item.bookId as string) === seededBookId
    );
    expect(matchingItem).toBeDefined();
    expect(matchingItem!.quantity).toBe(1);

    // Delivery address must echo what we sent
    const addr = order.deliveryAddress as Record<string, unknown>;
    expect(addr.firstName).toBe(DELIVERY_ADDRESS.firstName);
    expect(addr.lastName).toBe(DELIVERY_ADDRESS.lastName);
    expect(addr.city).toBe(DELIVERY_ADDRESS.city);
    expect(addr.email).toBe(DELIVERY_ADDRESS.email);

    // A freshly created order must be PENDING
    expect(order.status).toBe("PENDING");

    // No coupon — discount must be zero or absent
    const discount = (order.discount as number) ?? 0;
    expect(discount).toBe(0);

    // Capture for downstream tests
    createdOrderId = order.id as string;
    createdOrderTotal = order.total as number;

    expect(typeof createdOrderId).toBe("string");
    expect(createdOrderId.length).toBeGreaterThan(0);
    expect(typeof createdOrderTotal).toBe("number");
    expect(createdOrderTotal).toBeGreaterThan(0);
  });

  it("should apply the DISCOUNT100 coupon and reduce the total by $1.00", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .set("Accept", "application/json")
        .send({
          items: [{ bookId: seededBookId, quantity: 1 }],
          deliveryAddress: DELIVERY_ADDRESS,
          couponCode: SEEDED_COUPON_CODE,
        });

      expect(response.status).toBe(201);

      const order = response.body as Record<string, unknown>;

      // Full shape still valid
      expectValidOrderShape(order);

      // Discount field must equal the known coupon value
      expect(typeof order.discount).toBe("number");
      expect(order.discount).toBe(COUPON_DISCOUNT_AMOUNT);

      // total must be subtotal minus the discount
      const expectedTotal =
        (order.subtotal as number) - COUPON_DISCOUNT_AMOUNT;
      expect(order.total).toBeCloseTo(expectedTotal, 2);

      // total must be strictly less than the baseline order in test 1
      // (same book, same quantity → same subtotal, but coupon reduces final total)
      expect(order.total as number).toBeLessThan(createdOrderTotal);

      // Coupon code or applied coupon should be reflected in the response
      const couponField =
        (order.couponCode as string | undefined) ??
        (order.appliedCoupon as string | undefined);
      expect(couponField).toBe(SEEDED_COUPON_CODE);
    });

  it("should return 200 with an array of orders for the authenticated user", async () => {
    const response = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    // Response must be an array
    expect(Array.isArray(response.body)).toBe(true);

    const orders = response.body as Record<string, unknown>[];

    // At minimum the two orders from tests 1 & 2 must be present
    expect(orders.length).toBeGreaterThanOrEqual(2);

    // Every order satisfies the shape contract
    orders.forEach(expectValidOrderShape);

    // The order created in test 1 must appear in history
    const found = orders.find((o) => o.id === createdOrderId);
    expect(found).toBeDefined();

    // Orders must only belong to the authenticated user — no cross-user leak
    // (Each order's deliveryAddress.email should match the seeded user)
    orders.forEach((order) => {
      const addr = order.deliveryAddress as Record<string, unknown>;
      expect(addr.email).toBe(DELIVERY_ADDRESS.email);
    });
  });

  it("should cancel the order and reflect CANCELLED status in the response", async () => {
    // Guard: test 1 must have run successfully
    if (!createdOrderId) {
      throw new Error(
        "Cancel test requires createdOrderId from test 1. " +
        "Ensure 'POST /api/orders' passed before running this test."
      );
    }

    const response = await request(app)
      .post(`/api/orders/${createdOrderId}/cancel`)
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json");

    // Accept 200 (updated order returned) or 204 (no content)
    expect([200, 204]).toContain(response.status);

    if (response.status === 200) {
      const order = response.body as Record<string, unknown>;

      // Shape must still be valid
      expectValidOrderShape(order);

      // Status must have transitioned to CANCELLED
      expect(order.status).toBe("CANCELLED");

      // ID must match the order we cancelled
      expect(order.id).toBe(createdOrderId);
    }

    // ── Confirm via GET /api/orders ──────────────────────────────────
    const verifyResponse = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json");

    expect(verifyResponse.status).toBe(200);

    const orders = verifyResponse.body as Record<string, unknown>[];
    const cancelledOrder = orders.find((o) => o.id === createdOrderId);

    expect(cancelledOrder).toBeDefined();
    expect(cancelledOrder!.status).toBe("CANCELLED");
  });
});
