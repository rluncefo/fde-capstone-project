import request from 'supertest';
import app from '../index';

// ─────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────
const VALID_USER = {
  email: "test@bookworm.com",
  password: "password123",
};

const SEEDED_COUPON = {
  code: "DISCOUNT100",
  discountAmount: 1.0,
};

const INVALID_COUPON_CODE = "FAKECODE";

// ─────────────────────────────────────────────
// Shape helpers
// ─────────────────────────────────────────────

/**
 * Asserts the shape of a valid coupon response.
 */
function expectValidCouponResponseShape(
  body: Record<string, unknown>
): void {
  expect(body.valid).toBe(true);
  expect(typeof body.discountAmount).toBe("number");
  expect(body.discountAmount).toBeGreaterThan(0);

  // Must not carry an error/message field on a valid response
  expect(body).not.toHaveProperty("message");
}

/**
 * Asserts the shape of an invalid coupon response.
 */
function expectInvalidCouponResponseShape(
  body: Record<string, unknown>
): void {
  expect(body.valid).toBe(false);
  expect(typeof body.message).toBe("string");
  expect((body.message as string).length).toBeGreaterThan(0);

  // Must not leak a discount amount on an invalid response
  expect(body).not.toHaveProperty("discountAmount");
}

// ─────────────────────────────────────────────
// Suite-wide shared state
// ─────────────────────────────────────────────
let authToken: string;

describe('POST /api/coupons/validate', () => {
  // ── Global setup ──────────────────────────────────────────────────────────
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send(VALID_USER)
      .set("Accept", "application/json");

    if (loginResponse.status !== 200 || !loginResponse.body.token) {
      throw new Error(
        `beforeAll › login failed (status ${loginResponse.status}). ` +
        "Cannot run coupon tests without a valid token."
      );
    }

    authToken = loginResponse.body.token;
  });

  // ────────────────────────────────────────────
  // Unauthenticated
  // ────────────────────────────────────────────
  describe("unauthenticated requests", () => {

    // ── 3. No token → 401 ─────────────────────────────────────────────
    it("should return 401 when no Authorization header is provided", async () => {
      const response = await request(app)
        .post("/api/coupons/validate")
        .set("Accept", "application/json")
        // Deliberately omitting Authorization header
        .send({ code: SEEDED_COUPON.code });

      expect(response.status).toBe(401);

      // Error shape
      expect(response.body).toHaveProperty("error");
      expect(typeof response.body.error).toBe("string");
      expect(response.body.error.length).toBeGreaterThan(0);

      // Must not leak any coupon data
      expect(response.body).not.toHaveProperty("valid");
      expect(response.body).not.toHaveProperty("discountAmount");
      expect(response.body).not.toHaveProperty("message");
    });
  });

  // ────────────────────────────────────────────
  // Authenticated
  // ────────────────────────────────────────────
  describe("authenticated requests", () => {

    // ── 1. Valid coupon → valid: true + discountAmount ─────────────────
    it(
      'should return valid: true and discountAmount 1.00 for code "DISCOUNT100"',
      async () => {
        const response = await request(app)
          .post("/api/coupons/validate")
          .set("Authorization", `Bearer ${authToken}`)
          .set("Accept", "application/json")
          .send({ code: SEEDED_COUPON.code });

        expect(response.status).toBe(200);

        const body = response.body as Record<string, unknown>;

        // Shape assertions
        expectValidCouponResponseShape(body);

        // Value assertions — pin to the known seed value
        expect(body.discountAmount).toBe(SEEDED_COUPON.discountAmount);

        // toBeCloseTo guards against floating-point drift (e.g. 0.9999999)
        expect(body.discountAmount as number).toBeCloseTo(
          SEEDED_COUPON.discountAmount,
          2
        );
      }
    );

    // ── 2. Invalid coupon → valid: false + message ─────────────────────
    it(
      'should return valid: false with a message for unknown code "FAKECODE"',
      async () => {
        const response = await request(app)
          .post("/api/coupons/validate")
          .set("Authorization", `Bearer ${authToken}`)
          .set("Accept", "application/json")
          .send({ code: INVALID_COUPON_CODE });

        // Accept 200 (explicit invalid response) or 404 (not found)
        expect([200, 404]).toContain(response.status);

        const body = response.body as Record<string, unknown>;

        // Shape assertions
        expectInvalidCouponResponseShape(body);
      }
    );
  });
});
