import request from 'supertest';
import app from '../index';

// ─────────────────────────────────────────────
// Shared test data
// ─────────────────────────────────────────────
const VALID_USER = {
  email: "test@bookworm.com",
  password: "password123",
};

const WRONG_PASSWORD_USER = {
  email: "test@bookworm.com",
  password: "wrongpassword",
};

const UNKNOWN_EMAIL_USER = {
  email: "ghost@bookworm.com",
  password: "password123",
};

describe('POST /api/auth/login', () => {
  it("should return 200 with a token and user object on valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send(VALID_USER)
      .set("Accept", "application/json");

    // Status
    expect(response.status).toBe(200);

    // Top-level shape
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");

    // Token is a non-empty string
    expect(typeof response.body.token).toBe("string");
    expect(response.body.token.length).toBeGreaterThan(0);

    // User shape & types
    const { user } = response.body;
    expect(typeof user.id).toBe("string");
    expect(typeof user.email).toBe("string");
    expect(typeof user.name).toBe("string");
    expect(typeof user.role).toBe("string");
    expect(typeof user.giftPoints).toBe("number");

    // User data matches the seeded record
    expect(user.email).toBe(VALID_USER.email);

    // Password must never be exposed
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("passwordHash");
  });
  it("should return 401 with an error message when the password is wrong", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send(WRONG_PASSWORD_USER)
      .set("Accept", "application/json");

    // Status
    expect(response.status).toBe(401);

    // Error shape
    expect(response.body).toHaveProperty("error");
    expect(typeof response.body.error).toBe("string");
    expect(response.body.error.length).toBeGreaterThan(0);

    // Must not leak a token on failure
    expect(response.body).not.toHaveProperty("token");
    expect(response.body).not.toHaveProperty("user");
  });
  it("should return 401 with an error message when the email does not exist", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send(UNKNOWN_EMAIL_USER)
      .set("Accept", "application/json");

    // Status
    expect(response.status).toBe(401);

    // Error shape
    expect(response.body).toHaveProperty("error");
    expect(typeof response.body.error).toBe("string");
    expect(response.body.error.length).toBeGreaterThan(0);

    // Must not leak a token on failure
    expect(response.body).not.toHaveProperty("token");
    expect(response.body).not.toHaveProperty("user");
  });
});

describe('GET /api/auth/me', () => {
  /**
   * Obtain a real token once for the whole describe block.
   * beforeAll keeps individual tests focused on a single concern
   * and avoids repeating the login round-trip in every test.
   */
  let authToken: string;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send(VALID_USER)
      .set("Accept", "application/json");

    // Guard: if login itself is broken, fail loudly here
    if (loginResponse.status !== 200 || !loginResponse.body.token) {
      throw new Error(
        `beforeAll: login failed with status ${loginResponse.status} — ` +
          `cannot run GET /api/auth/me tests without a valid token.`
      );
    }

    authToken = loginResponse.body.token;
  });

  it("should return 200 with the authenticated user's profile on a valid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Accept", "application/json");

    // Status
    expect(response.status).toBe(200);

    // Profile shape & types
    expect(typeof response.body.id).toBe("string");
    expect(typeof response.body.email).toBe("string");
    expect(typeof response.body.name).toBe("string");
    expect(typeof response.body.role).toBe("string");
    expect(typeof response.body.giftPoints).toBe("number");

    // Profile data matches the seeded record
    expect(response.body.email).toBe(VALID_USER.email);

    // Password must never be exposed
    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("passwordHash");
  });
  
  it("should return 401 with an error message when no token is provided", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      // Deliberately omitting the Authorization header
      .set("Accept", "application/json");

    // Status
    expect(response.status).toBe(401);

    // Error shape
    expect(response.body).toHaveProperty("error");
    expect(typeof response.body.error).toBe("string");
    expect(response.body.error.length).toBeGreaterThan(0);

    // Must not leak profile data
    expect(response.body).not.toHaveProperty("id");
    expect(response.body).not.toHaveProperty("email");
  });
});
