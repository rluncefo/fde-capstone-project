import request from 'supertest';
import app from '../index';

// ─────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────
const VALID_USER = {
  email: "test@bookworm.com",
  password: "password123",
};

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

const PAYMENT_METHODS = ["CREDIT_CARD", "DEBIT_CARD", "UPI", "WALLET"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const TEST_PAYMENT_METHOD: PaymentMethod = "CREDIT_CARD";

// The mock always resolves after 500 ms — give it generous headroom
const PAYMENT_TIMEOUT_MS = 10_000;

// ─────────────────────────────────────────────
// Shape helpers
// ─────────────────────────────────────────────

/**
 * Asserts the top-level payment response envelope.
 */
function expectValidPaymentResponseShape(
  body: Record<string, unknown>
): void {
  // Top-level flags
  expect(body.success).toBe(true);

  // transactionRef at the envelope level
  expect(typeof body.transactionRef).toBe("string");
  expect((body.transactionRef as string).length).toBeGreaterThan(0);

  // Nested payment object
  expect(body.payment).toBeDefined();
}

/**
 * Asserts the shape and types of the nested payment object.
 */
function expectValidPaymentObjectShape(
  payment: Record<string, unknown>,
  {
    expectedOrderId,
    expectedMethod,
  }: { expectedOrderId: string; expectedMethod: PaymentMethod }
): void {
  // Identity
  expect(typeof payment.id).toBe("string");
  expect((payment.id as string).length).toBeGreaterThan(0);

  // Must reference the correct order
  expect(payment.orderId).toBe(expectedOrderId);

  // Method must match what was sent
  expect(payment.method).toBe(expectedMethod);

  // Mock always returns SUCCESS
  expect(payment.status).toBe("SUCCESS");

  // Financial fields
  expect(typeof payment.amount).toBe("number");
  expect(payment.amount).toBeGreaterThan(0);

  // transactionRef on the nested object
  expect(typeof payment.transactionRef).toBe("string");
  expect((payment.transactionRef as string).length).toBeGreaterThan(0);
}

// ─────────────────────────────────────────────
// Suite-wide shared state
// ─────────────────────────────────────────────
let authToken: string;
let createdOrderId: string;

describe('Payments API (/api/payments)', () => {

  // ── Global setup ──────────────────────────────────────────────────────────
  beforeAll(async () => {

    // ── Step 1: Obtain auth token ──────────────────────────────────────
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send(VALID_USER)
      .set("Accept", "application/json");

    if (loginResponse.status !== 200 || !loginResponse.body.token) {
      throw new Error(
        `beforeAll › login failed (status ${loginResponse.status}). ` +
        "Cannot run payment tests without a valid token."
      );
    }

    authToken = loginResponse.body.token;

    // ── Step 2: Resolve a seeded book ID ──────────────────────────────
    const booksResponse = await request(app)
      .get("/api/books")
      .query({ search: "minimalism" })
      .set("Accept", "application/json");

    if (booksResponse.status !== 200) {
      throw new Error(
        `beforeAll › book search failed (status ${booksResponse.status}). ` +
        "Cannot create an order without a valid bookId."
      );
    }

    const books = booksResponse.body.books as Record<string, unknown>[];
    const targetBook = books.find((b) => b.slug === "joy-of-minimalism");

    if (!targetBook) {
      throw new Error(
        'beforeAll › book with slug "joy-of-minimalism" not found. ' +
        "Verify seed data before running tests."
      );
    }

    const seededBookId = targetBook.id as string;

    // ── Step 3: Create an order to pay for ────────────────────────────
    const orderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json")
      .send({
        items: [{ bookId: seededBookId, quantity: 1 }],
        deliveryAddress: DELIVERY_ADDRESS,
      });

    if (orderResponse.status !== 201 || !orderResponse.body.id) {
      throw new Error(
        `beforeAll › order creation failed (status ${orderResponse.status}). ` +
        "Cannot run payment tests without a valid orderId."
      );
    }

    createdOrderId = orderResponse.body.id as string;
  }, 15_000); // beforeAll timeout covers login + book search + order creation

  // ────────────────────────────────────────────
  // POST /api/payments — unauthenticated
  // ────────────────────────────────────────────
  describe("POST /api/payments (unauthenticated)", () => {

    // ── 3. No token → 401 ─────────────────────────────────────────────
    it("should return 401 when no Authorization header is provided", async () => {
      const response = await request(app)
        .post("/api/payments")
        .set("Accept", "application/json")
        // Deliberately omitting Authorization header
        .send({
          orderId: "any-order-id",
          method: TEST_PAYMENT_METHOD,
        });

      expect(response.status).toBe(401);

      // Error shape
      expect(response.body).toHaveProperty("error");
      expect(typeof response.body.error).toBe("string");
      expect(response.body.error.length).toBeGreaterThan(0);

      // Must not leak any payment data
      expect(response.body).not.toHaveProperty("success");
      expect(response.body).not.toHaveProperty("transactionRef");
      expect(response.body).not.toHaveProperty("payment");
    });
  });
  
  // ────────────────────────────────────────────
  // POST /api/payments — authenticated
  // ────────────────────────────────────────────
  describe("POST /api/payments (authenticated)", () => {

    // Shared: response body captured once for tests 1 & 2
    // to avoid making two real payment calls against the same order.
    let paymentResponseBody: Record<string, unknown>;

    beforeAll(async () => {
      const response = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .set("Accept", "application/json")
        .send({
          orderId: createdOrderId,
          method: TEST_PAYMENT_METHOD,
        });

      if (response.status !== 200) {
        throw new Error(
          `beforeAll › payment request failed (status ${response.status}). ` +
          "Cannot run payment assertion tests."
        );
      }

      paymentResponseBody = response.body as Record<string, unknown>;
    }, PAYMENT_TIMEOUT_MS);

    // ── 1. Processes payment and returns SUCCESS ───────────────────────
    it(
      "should return 200 with success=true and payment status SUCCESS",
      () => {
        // Envelope shape
        expectValidPaymentResponseShape(paymentResponseBody);

        // Nested payment shape bound to our order and method
        const payment = paymentResponseBody.payment as Record<string, unknown>;
        expectValidPaymentObjectShape(payment, {
          expectedOrderId: createdOrderId,
          expectedMethod: TEST_PAYMENT_METHOD,
        });

        // Envelope and nested transactionRef must match each other
        expect(paymentResponseBody.transactionRef).toBe(
          payment.transactionRef
        );
      },
      PAYMENT_TIMEOUT_MS
    );

    // ── 2. transactionRef starts with "TXN-" ──────────────────────────
    it(
      'should return a transactionRef that starts with "TXN-"',
      () => {
        const { transactionRef } = paymentResponseBody;

        // Envelope-level ref
        expect(typeof transactionRef).toBe("string");
        expect(transactionRef as string).toMatch(/^TXN-/);

        // Nested payment ref must also start with "TXN-"
        const payment = paymentResponseBody.payment as Record<string, unknown>;
        expect(payment.transactionRef as string).toMatch(/^TXN-/);

        // Both refs must be identical
        expect(payment.transactionRef).toBe(transactionRef);

        // Validate the full expected format: TXN- followed by
        // at least one alphanumeric / hyphen character
        expect(transactionRef as string).toMatch(/^TXN-[A-Za-z0-9-]+$/);
      },
      PAYMENT_TIMEOUT_MS
    );
  });
});
