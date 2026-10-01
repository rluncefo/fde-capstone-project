# AI-Augmented Test Case Generation Log (ICA Agent)

## Overview

All test suites for the BookWorm capstone were generated using two ICA (IBM Coding Assistant) agents:

- **ICA API Testcase Generator** — used for backend REST API tests (Jest + Supertest)
- **ICA React Test Case Generator** — used for frontend component tests (Vitest + React Testing Library)

After generation, Bob (IBM Bob Agent Mode) reviewed each file, fixed import paths, added missing
`data-testid` attributes, and resolved serialisation issues. All 118 tests now pass.

---

## How the ICA Agents Were Used

### Backend Tests — ICA API Testcase Generator

**Input provided:** The live OpenAPI 3.0 JSON spec served by the running Docker stack at
`http://localhost:3001/api-docs.json` (generated automatically from `@openapi` JSDoc annotations
on each Express route file). The relevant path objects and their request/response schemas were
pasted into the agent for each route group.

**Prompt used with the agent:**
> *"Using the following OpenAPI spec section, generate a Jest + Supertest test suite for this
> Express API route. Include tests for: happy path (200/201), wrong credentials or invalid input
> (400/401), and resource not found (404). Use `beforeAll` to obtain an auth token via
> `POST /api/auth/login` with email `test@bookworm.com` / password `password123`.
> Import `app` from `../index`. Do not start an HTTP server — Supertest handles that."*

---

### Frontend Tests — ICA React Test Case Generator

**Input provided:** The full TypeScript source of each component file was pasted into the agent,
along with the relevant interfaces from `client/src/types/index.ts` (e.g. `Book`, `CartItem`).

**Prompt used with the agent:**
> *"Using the following React component source, generate a Vitest + React Testing Library test
> suite. Mock all context providers (`useAuth`, `useCart`) and child UI components with `vi.mock`.
> Wrap renders in `MemoryRouter`. Test: rendering of key text/elements, user interactions
> (click, type), and edge cases (empty state, missing props). Use `userEvent.setup()` for
> interaction tests."*

---

## Test Suites — Generation Results

| Test File | ICA Agent Used | Input Provided | Tests Generated | Manual Adjustments After Generation | Final Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `server/src/__tests__/auth.test.ts` | ICA API Testcase Generator | OpenAPI paths: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | 5 tests: valid login, wrong password, unknown user, authenticated profile, unauthenticated 401 | Removed stray `import { describe } from "vitest"` — server uses Jest globals | ✅ 5/5 pass |
| `server/src/__tests__/books.test.ts` | ICA API Testcase Generator | OpenAPI paths: `GET /api/books`, `GET /api/books/{slug}`, `GET /api/categories` | 7 tests: pagination, category filter, search, recommended filter, detail by slug, 404, category list | Fixed `price` Decimal→number in `booksController`; flattened `categories` shape from `{category:{…}}` to `{id, name, slug}` | ✅ 7/7 pass |
| `server/src/__tests__/cart.test.ts` | ICA API Testcase Generator | OpenAPI paths: `GET /api/cart`, `POST /api/cart`, `PATCH /api/cart/{itemId}`, `DELETE /api/cart/{itemId}` | 5 tests: unauthenticated 401, add item, update quantity, remove item, cart shape | Fixed `price` Decimal→number; PATCH controller updated to return full cart; DELETE updated to return `204` | ✅ 5/5 pass |
| `server/src/__tests__/orders.test.ts` | ICA API Testcase Generator | OpenAPI paths: `POST /api/orders`, `GET /api/orders`, `POST /api/orders/{id}/cancel` | 4 tests: create order, apply coupon discount, list order history, cancel within 48 h | Added `serializeOrder()` helper to expose `subtotal` and `total` as numbers; renamed `priceAtTime` → `price` on line items | ✅ 4/4 pass |
| `server/src/__tests__/payments.test.ts` | ICA API Testcase Generator | OpenAPI path: `POST /api/payments` | 2 tests: successful mock payment, unauthenticated 401 | Fixed `amount` Decimal→number in `paymentsController` | ✅ 2/2 pass |
| `server/src/__tests__/coupons.test.ts` | ICA API Testcase Generator | OpenAPI path: `POST /api/coupons/validate` | 3 tests: valid coupon `DISCOUNT100`, unauthenticated 401, invalid code | Fixed `discountAmount` Decimal→number in `couponsController` | ✅ 3/3 pass |
| `client/src/__tests__/BookCard.test.tsx` | ICA React Test Case Generator | Full source of `BookCard.tsx` (152 lines) + `Book` interface from `types/index.ts` | 22 tests: render title/author/price, navigation on click, category badges (max 2), cover image fallback, Add to Cart, delivery date helper | Added `beforeEach(() => vi.clearAllMocks())` to `showAddToCart` describe block; updated category fixture from `{category:{id,name}}` to flat `{id, name, slug}` to match updated API shape | ✅ 22/22 pass |
| `client/src/__tests__/StarRating.test.tsx` | ICA React Test Case Generator | Full source of `StarRating.tsx` (68 lines) | 22 tests: readonly mode, interactive click fires `onChange`, hover state, size prop (`sm`/`md`), `aria-label` accessibility | No changes needed — component already had correct `aria-label` on each star span | ✅ 22/22 pass |
| `client/src/__tests__/CartDrawer.test.tsx` | ICA React Test Case Generator | Full source of `CartDrawer.tsx` (223 lines) | 25 tests: drawer open/closed transform, empty state, item titles/prices/quantities, subtotal, item count badge, Go to Checkout navigation, backdrop click closes drawer | Fixed empty-state guard in `CartDrawer.tsx`: render "Your cart is empty" only when `isDrawerOpen && items.length === 0` (not when closed) | ✅ 25/25 pass |
| `client/src/__tests__/CheckoutPage.test.tsx` | ICA React Test Case Generator | Full source of `CheckoutPage.tsx` (565 lines) + `OrderSummary.tsx` | 22 tests: empty cart message, address form validation, coupon apply/error/clear, Pay Now loading state, saved address toggle, item rendering | Fixed 3 wrong `../../` mock paths → `../`; added `vi.mock("../components/layout/MainLayout")` passthrough to prevent duplicate DOM text; added `data-testid` attributes (`coupon-input`, `apply-coupon-btn`, `pay-now-btn`, `discount-amount`) to `OrderSummary.tsx` | ✅ 22/22 pass |

---

## Final Test Run Results

### Backend (run inside Docker container)

```bash
docker exec fde-capstone-project-server-1 npm test
```

```
Test Suites: 6 passed, 6 total
Tests:       27 passed, 27 total
Time:        ~4s
```

### Frontend (run locally)

```bash
cd client && npm test
```

```
Test Files:  4 passed (4)
Tests:       91 passed (91)
Duration:    ~2s
```

**Total: 118 tests — all passing.**

---

## Key Fixes Applied After ICA Generation

| Category | Issue | Fix Applied |
| :--- | :--- | :--- |
| Jest vs Vitest | ICA generated `import { describe, it } from "vitest"` in server tests | Removed — Jest globals are ambient via `@types/jest` |
| Port conflict | `app.listen()` fired during tests because `NODE_ENV=development` in Docker | Added `process.env.NODE_ENV = 'test'` at top of `jest.config.ts` |
| Prisma Decimal | All `Decimal` fields (price, amount, discountAmount) serialised as strings | Converted to `Number()` before `res.json()` in each controller |
| API shape mismatch | Categories returned as `{category:{id,name,slug}}[]` but tests expected `{id,name,slug}[]` | Flattened in `booksController` and `cartController`; updated `Book` type and all components |
| Mock paths | ICA generated `vi.mock("../../context/…")` but test files live one level deeper | Corrected to `vi.mock("../context/…")` |
| Missing `data-testid` | Tests queried `getByTestId("pay-now-btn")` etc. but component had no such attributes | Added `data-testid` props to `OrderSummary.tsx`; extended `Button.tsx` to forward the prop |
| Test isolation | `mockNavigate` accumulated calls across sibling `describe` blocks (no `clearAllMocks`) | Added `beforeEach(() => vi.clearAllMocks())` to each top-level `describe` in `BookCard.test.tsx` |
