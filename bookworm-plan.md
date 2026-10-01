# BookWorm E-Commerce — Capstone Project Plan

## Top-Level Overview

Build a **BookWorm** online bookstore as a full-stack monorepo application with:

- **Frontend**: React 18 + TypeScript (Vite), Tailwind CSS v4, React Router v6
- **Backend**: Node.js + Express, TypeScript
- **Database**: PostgreSQL via Prisma ORM (schema + seed)
- **Auth**: Mock JWT authentication (no refresh token rotation, seeded users)
- **Currency**: USD (`$`) throughout
- **Payment**: Mock/stub payment API — no real gateway
- **AI Tooling**: IBM Bob (vibe coding for UI + backend services), ICA Agent (test case generation)
- **OpenAPI**: Auto-generated spec from Express routes, served at `/api-docs`

The UI recreates the BookWorm dark-themed e-commerce experience from the provided screenshots:
- Home page with category sidebar, search/filter bar, book sections (Recommended, Bestsellers, New Launches)
- **User account dropdown and slide-out cart drawer accessible directly from the Navbar on every page including Home**
- Book detail page with reviews, author bio, related reads sidebar
- Shopping cart / checkout page with address form, order summary, coupon redemption
- Payment screen (Credit Card, Debit Card, UPI, Wallet)
- Order confirmation modal

The architecture diagram defines these domain entities:
**Member → Store → Catalog → Browse → Add to Cart → Order → Payment Processing → Shipment/Shipping**

### Capstone Requirement Traceability

| Requirement | Addressed In |
|---|---|
| Database: PostgreSQL | Sub-Task 2 (Prisma schema + seed) |
| Data model design from wireframes (Manual) | Sub-Task 0 (ERD artifact) |
| AI augmentation on UI — IBM Bob vibe coding | Sub-Task 0 (workflow documentation) + every frontend sub-task |
| OpenAPI spec generation | Sub-Task 12 (swagger-jsdoc + swagger-ui-express) |
| AI augmented backend services — IBM Bob | Sub-Task 0 (workflow documentation) + Sub-Tasks 2–3 |
| AI augmented test case generator — ICA Agent | Sub-Task 13 (generated test suites) |
| User account accessible from home page | Sub-Task 5 (Navbar user dropdown) |
| Shopping cart accessible from home page | Sub-Task 5 (Navbar cart drawer) |
| Local machine readiness — Docker Compose | Sub-Task 14 (Docker Compose + health check) |
| Production readiness checklist | Sub-Task 15 (pre-deploy hardening) |
| Cloud deployment (AWS ROSA / IBM ROKS) | Out of scope — no cloud access; local Docker only |

---

## Sub-Tasks

---

### Sub-Task 0 — Data Model ERD & AI Tooling Workflow Documentation

**Status:** `[x] done`

**Intent:**
Before any code is written, produce two manual design artifacts required by the capstone:
1. An **Entity Relationship Diagram (ERD)** derived from the wireframes/screenshots and architecture diagram — this satisfies the "Prepare the data model design based on wireframes (Manual)" requirement.
2. A **workflow document** describing how IBM Bob was used for vibe coding (UI + backend services) throughout the project — this satisfies the AI augmentation traceability requirement.

**Expected Outcomes:**
- `docs/erd.md` — written ERD showing all 13 entities, their fields, data types, and relationships (PK/FK, cardinality)
- `docs/ai-tooling-workflow.md` — documents where and how IBM Bob (Plan mode + Agent mode) was used at each sub-task, with prompts used and outcomes produced

**ERD Entities and Relationships (from wireframe analysis):**

```
User          1──< CartItem      >──1  Book
User          1──< Wishlist      >──1  Book
User          1──< Order         >──<  OrderItem  >──1  Book
User          1──< Review        >──1  Book
Order         1──1  Payment
Book          >──<  BookCategory >──1  Category
Book          >──1  Author
Coupon        referenced by Order.couponCode
Store         1 record (single-store seed)
```

**Todo List:**
1. Create `docs/` directory
2. Write `docs/erd.md` with full ERD table: entity name, field name, type, constraints, FK references
3. Write `docs/ai-tooling-workflow.md` with sections: Overview, IBM Bob Usage by Sub-Task, Prompt Examples, Outcomes
4. Note in `docs/ai-tooling-workflow.md` that ICA Agent is used in Sub-Task 13 for test generation

**Relevant Context:**
- This sub-task produces documentation only — no application code
- The ERD must match exactly the Prisma schema that Sub-Task 2 will implement
- IBM Bob Plan mode was used to produce this plan file itself — document that as the first entry

---

### Sub-Task 1 — Monorepo Scaffold & Root Configuration

**Status:** `[x] done`

**Intent:**  
Set up the root `package.json` (workspaces), root `.gitignore`, `.env.example`, and `README.md`. This is the foundation that everything else depends on.

**Expected Outcomes:**
- Root `package.json` with `workspaces: ["client", "server"]`
- `.gitignore` covering node_modules, dist, .env
- `.env.example` listing all required environment variables
- `README.md` updated with project overview and setup instructions

**Todo List:**
1. Create root `package.json` with npm workspaces config
2. Create `.gitignore`
3. Create `.env.example` with `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CLIENT_URL`
4. Update `README.md` with project description, prerequisites, and `npm install` / `npm run dev` instructions

**Relevant Context:**
- Workspace root: `/Users/robinlunceford/Documents/Your Learning/capstone-project`
- No existing application code; blank repo

---

### Sub-Task 2 — PostgreSQL Data Model (Prisma Schema + Seed)

**Status:** `[x] done`

**Intent:**  
Define the complete relational data model derived from the architecture diagram and screenshots, and provide seed data that makes the UI look fully populated.

**Expected Outcomes:**
- `server/prisma/schema.prisma` defining all tables
- `server/prisma/seed.ts` seeding categories, books, authors, users, reviews
- Prisma client generated and importable in backend code

**Data Model (Tables):**

| Table | Key Fields |
|---|---|
| `User` | id, email, passwordHash, name, role (GUEST/MEMBER), giftPoints, savedAddress (JSON) |
| `Category` | id, name, slug |
| `Author` | id, name, bio, avatarUrl |
| `Book` | id, title, slug, description, coverUrl, price, format (PAPERBACK/HARDCOVER/EBOOK), language, stockCount, authorId, rating, salesCount, isRecommended, isBestseller, isNewLaunch, createdAt |
| `BookCategory` | bookId, categoryId (many-to-many join) |
| `Review` | id, bookId, userId, rating, content, createdAt |
| `CartItem` | id, userId, bookId, quantity |
| `Wishlist` | id, userId, bookId |
| `Order` | id, userId, status (PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED/RETURNED), totalAmount, tax, discount, deliveryAddress (JSON), couponCode, createdAt |
| `OrderItem` | id, orderId, bookId, quantity, priceAtTime |
| `Payment` | id, orderId, method (CREDIT_CARD/DEBIT_CARD/UPI/WALLET), status (PENDING/SUCCESS/FAILED/REFUNDED), amount, transactionRef |
| `Coupon` | id, code, discountAmount, isActive |
| `Store` | id, name, description, policies (JSON) |

**Todo List:**
1. Create `server/` directory structure
2. Run `npm init` / configure `server/package.json` with Prisma, Express, JWT, bcryptjs dependencies
3. Write `server/prisma/schema.prisma` with all models above
4. Write `server/prisma/seed.ts` with 15+ seeded books across categories (matching screenshot titles), 3 seeded users, categories, authors, reviews, one coupon (`DISCOUNT100`)
5. Write `server/tsconfig.json`

**Relevant Context:**
- Screenshots show books: "The Art of Focus", "The Art of Learning", "The Path to Success", "The Midnight Hour", "Beneath the Stars", "The Final Frontier", "Joy of Minimalism", "The Vanishing House", "The Lost Kitten"
- Categories from sidebar: All, Romance, Mystery, Science Fiction, Fantasy, Historical, Biography, Self-help, Memoir, Travel, Cooking, Children's, Young Adult, Comics & Graphic Novels, Poetry, Drama, Science, Philosophy, Religion, Language Learning
- Prices originally in ₹ — convert to USD equivalents (divide by ~85, round to nearest $0.99)
- `publisherId` was removed — there is no Publisher model; publisher name ("ABC Publishers") is treated as a display-only string in the UI, not a relational FK
- `deliveryDate` was removed — this field is **not stored in the DB**; it is computed dynamically on the frontend as +3 business days from the current date (see Sub-Task 6)
- **Implementation note:** The categories route was split into its own file `server/src/routes/categories.ts` mounted at `/api/categories`, rather than being part of `books.ts`. Both approaches produce the same API surface.

---

### Sub-Task 3 — Express Backend API

**Status:** `[x] done`

**Intent:**  
Build the REST API that the frontend will consume. All routes return JSON. Auth uses JWT in `Authorization: Bearer` header.

**Expected Outcomes:**
- Express app running on `PORT` (default 3001)
- All API routes documented below implemented and returning correct shapes
- CORS configured for `CLIENT_URL`

**API Routes:**

```
Auth
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Catalog
  GET    /api/books                  ?category&format&language&minPrice&maxPrice&sort&search&page&limit
  GET    /api/books/:slug            (book detail)
  GET    /api/books/:slug/related    (related by category)
  GET    /api/categories

Orders / Cart
  GET    /api/cart                   (user's cart)
  POST   /api/cart                   (add item)
  PATCH  /api/cart/:itemId           (update quantity)
  DELETE /api/cart/:itemId           (remove item)

Wishlist
  GET    /api/wishlist
  POST   /api/wishlist
  DELETE /api/wishlist/:bookId

Orders
  GET    /api/orders                 (order history)
  POST   /api/orders                 (create order / checkout)
  GET    /api/orders/:id
  POST   /api/orders/:id/cancel

Payment (mock)
  POST   /api/payments               (mock: always returns success after 1s delay)

Reviews
  GET    /api/books/:slug/reviews
  POST   /api/books/:slug/reviews

Coupons
  POST   /api/coupons/validate       { code } → { discountAmount }
```

**Todo List:**
1. Create `server/src/index.ts` (Express app bootstrap)
2. Create `server/src/middleware/` — `auth.ts` (JWT verify), `errorHandler.ts`
3. Create `server/src/routes/` — one file per domain: `auth.ts`, `books.ts`, `cart.ts`, `wishlist.ts`, `orders.ts`, `payments.ts`, `reviews.ts`, `coupons.ts`
4. Create `server/src/controllers/` matching each route file
5. Wire all routes in `index.ts`
6. Add `server/package.json` scripts: `dev` (ts-node-dev), `build` (tsc), `seed` (ts-node prisma/seed.ts)

**Relevant Context:**
- Prisma client from Sub-Task 2 is the data layer
- Mock payment controller: generates a random `transactionRef`, always resolves SUCCESS after artificial delay
- Gift points: 1 point per $1 spent; 100 points = $1 discount (stub logic in order creation)

---

### Sub-Task 4 — Vite + React + Tailwind Frontend Scaffold

**Status:** `[x] done`

**Intent:**
Scaffold the `client/` directory: Vite config, Tailwind v4 config, TypeScript config, base CSS with CSS variables matching the dark BookWorm theme, and the top-level routing structure.

**Expected Outcomes:**
- `client/` bootstrapped with Vite + React + TypeScript template
- Tailwind CSS v4 configured with CSS custom properties for the dark theme colors
- React Router v6 with all page routes registered
- Axios (or fetch wrapper) API client configured with base URL and auth header interceptor

**Color Theme (from screenshots):**
```
--color-bg-primary:    #1a1a2e   (deep dark navy)
--color-bg-secondary:  #16213e   (sidebar / card dark)
--color-bg-card:       #0f3460   (card hover)
--color-accent:        #3b82f6   (blue — CTA buttons, links)
--color-text-primary:  #f1f5f9
--color-text-muted:    #94a3b8
--color-border:        #2d3748
```

**Routing Structure:**
```
/                        → HomePage
/login                   → LoginPage
/books/:slug             → BookDetailPage
/cart                    → CartPage
/checkout                → CheckoutPage
/payment                 → PaymentPage
/order-confirmation      → OrderConfirmationPage
/orders                  → OrderHistoryPage
/wishlist                → WishlistPage
```

**Todo List:**
1. Create `client/` via Vite scaffold (React + TypeScript template config — write files manually, do not run CLI)
2. Create `client/package.json`, `client/vite.config.ts`, `client/tsconfig.json`, `client/index.html`
3. Configure Tailwind v4: `client/src/index.css` with `@import "tailwindcss"` and CSS variable definitions
4. Create `client/src/main.tsx` and `client/src/App.tsx` with React Router `<Routes>`
5. Create `client/src/api/client.ts` — Axios instance with `baseURL` and request interceptor for JWT
6. Create empty page placeholder files for all 9 routes

**Relevant Context:**
- Tailwind v4 uses `@import "tailwindcss"` not the v3 `@tailwind` directives
- Vite proxy config: `/api` → `http://localhost:3001`

---

### Sub-Task 5 — Shared Layout & Navigation Components

**Status:** `[x] done`

**Intent:**
Build the reusable shell components visible on every page: `<Navbar>`, `<CategorySidebar>`, `<MainLayout>`, and the base `<PageWithSidebar>` layout. Critically, the Navbar must provide **direct access to the user account and shopping cart from any page, including the Home page**, without requiring navigation to a separate route first.

**Expected Outcomes:**
- `<Navbar>` renders: BookWorm logo, My Orders / My Wishlist / My Writers links, cart icon with item count badge, user account icon
- **Clicking the cart icon opens a `<CartDrawer>` slide-out panel (right side) showing cart items, subtotal, and a "Go to Checkout" button — accessible from every page including Home**
- **Clicking the user icon opens a `<UserDropdown>` menu showing: logged-in user name, "My Orders", "My Wishlist", "Logout" — or "Login" if unauthenticated — accessible from every page including Home**
- `<CategorySidebar>` renders the full category list with active highlight
- `<MainLayout>` wraps navbar + children
- `<PageWithSidebar>` = MainLayout + CategorySidebar + content area
- All components are fully typed with TypeScript props

**Component File Map:**
```
client/src/components/layout/
  Navbar.tsx
  CartDrawer.tsx          ← NEW: slide-out cart panel
  UserDropdown.tsx        ← NEW: user account dropdown
  CategorySidebar.tsx
  MainLayout.tsx
  PageWithSidebar.tsx
client/src/components/layout/index.ts   (barrel export)
```

**Todo List:**
1. Create `Navbar.tsx` — logo, nav links, cart icon (opens drawer), user icon (opens dropdown)
2. Create `CartDrawer.tsx` — slide-out overlay, reads `CartContext`, shows book covers + titles + quantities + subtotal, "Go to Checkout" CTA button, "×" close button
3. Create `UserDropdown.tsx` — positioned below user icon, shows name + links if logged in, "Login" link if guest
4. Create `CategorySidebar.tsx` — fetches `/api/categories`, renders list, highlights active via URL param
5. Create `MainLayout.tsx` — sticky navbar + `<Outlet>` / `{children}`
6. Create `PageWithSidebar.tsx` — `<MainLayout>` + sidebar left column + main content right column
7. Create `client/src/context/CartContext.tsx` — cart items array + count + open/close drawer state
8. Create `client/src/context/AuthContext.tsx` — current user state, login/logout actions

**Relevant Context:**
- Cart badge shows red dot with count (visible in all screenshots top-right)
- `CartDrawer` must be rendered inside `MainLayout` so it overlays every page, not just cart-specific pages
- `UserDropdown` closes on outside click (use `useRef` + document click listener)
- Category list matches screenshot sidebar exactly
- Active category is highlighted in a brighter blue/white

---

### Sub-Task 6 — Reusable E-Commerce Components

**Status:** `[x] done`

**Intent:**  
Build the shared atomic and composite components used across multiple pages: `<BookCard>`, `<BookGrid>`, `<SearchBar>`, `<FilterBar>`, `<StarRating>`, `<PriceTag>`, `<Badge>`, `<Breadcrumb>`, `<QuantitySelector>`, `<Modal>`.

**Expected Outcomes:**
- All components in `client/src/components/ui/` and `client/src/components/ecommerce/`
- Each component is fully typed, accepts only what it needs
- Components match the visual style seen in the screenshots

**Component Inventory:**

```
client/src/components/ui/
  Button.tsx          — variant: primary | secondary | ghost; size: sm | md | lg
  Badge.tsx           — genre tag chips (e.g. "Non-fiction", "Self Help")
  StarRating.tsx      — display (0–5 stars) + interactive input mode
  Modal.tsx           — centered overlay modal (used for payment + confirmation)
  Breadcrumb.tsx      — Home / Non-Fiction / Self Help crumb trail
  Spinner.tsx         — loading indicator

client/src/components/ecommerce/
  BookCard.tsx        — cover image, title, author link, format, genre badges, price, delivery date
  BookGrid.tsx        — section title + 3-column responsive grid of BookCards
  SearchBar.tsx       — search input with magnifier icon
  FilterBar.tsx       — Language / Format / Price Range / Sort By dropdowns (4 selects in a row)
  QuantitySelector.tsx — quantity with − and + buttons
  PriceTag.tsx        — formats number as "$XX.XX"
```

**Todo List:**
1. Create all `ui/` components
2. Create `BookCard.tsx` — matches screenshot layout exactly (cover left, metadata right, price, delivery)
3. Create `BookGrid.tsx` — section heading + responsive grid
4. Create `SearchBar.tsx` + `FilterBar.tsx`
5. Create `QuantitySelector.tsx` + `PriceTag.tsx`
6. Create barrel exports `client/src/components/ui/index.ts` and `client/src/components/ecommerce/index.ts`

**Relevant Context:**
- BookCard in the home listing uses a compact horizontal layout (cover ~80px wide, text right)
- BookCard in the checkout uses a larger cover (~100px wide)
- Delivery date shown as "Delivery by Mon, 21 Jul" — compute dynamically as +3 business days from today

---

### Sub-Task 7 — Home Page

**Status:** `[x] done`

**Intent:**  
Build the main landing page matching screenshot 1: category sidebar, search + filter bar, and three book sections (Recommended for You, Bestsellers this Month, New Launches).

**Expected Outcomes:**
- `HomePage` fetches books from `/api/books` with appropriate filters
- Three sections each show 3 books in a row using `<BookGrid>`
- Selecting a category in the sidebar filters the book list
- Search bar and filter dropdowns filter the visible results
- Clicking a book navigates to `/books/:slug`

**Todo List:**
1. Implement `client/src/pages/HomePage.tsx`
2. Create `client/src/api/books.ts` — typed API functions for all book endpoints
3. Wire category sidebar selection to URL search params (`?category=romance`)
4. Wire search + filter bar inputs to URL search params
5. Use `useQuery` pattern (or `useEffect` + state) to fetch and render the three sections

**Relevant Context:**
- Book sections: `isRecommended=true` → "Recommended for You", `isBestseller=true` → "Bestsellers this Month", `isNewLaunch=true` → "New Launches"
- Screenshots show exactly 3 books per section row; in full implementation show up to 6 with a "See all" link

---

### Sub-Task 8 — Book Detail Page

**Status:** `[x] done`

**Intent:**  
Build the book detail page matching the "Shopping Cart" screenshot: book cover gallery, metadata, Add to Cart / Add to Wishlist buttons, About the Writer section, Reviews section, Related Reads sidebar.

**Expected Outcomes:**
- `BookDetailPage` fetches `/api/books/:slug` and `/api/books/:slug/related`
- "Add to Cart" calls `POST /api/cart` and updates CartContext
- "Add to Wishlist" calls `POST /api/wishlist`
- Reviews section shows existing reviews and a textarea + star rating to submit a new review
- Related Reads sidebar shows 3 related books as compact `<BookCard>` entries
- Breadcrumb trail: Home / Category / Book Title

**Todo List:**
1. Implement `client/src/pages/BookDetailPage.tsx`
2. Add author bio section using `Author` data from the book response
3. Add `ReviewForm` component (textarea with 100-char counter, star rating input, Submit button)
4. Add `ReviewList` component
5. Add Related Reads sidebar column
6. Handle "Add to Cart" with optimistic cart count update in `CartContext`

**Relevant Context:**
- The screenshot shows two book cover images side by side (front cover + back/blurb view)
- Language, Rating (stars), Sales count shown as a metadata row below the price
- Publisher shown as text: "Published by: ABC Publishers" — this is a static display string, not a relational field (no Publisher model in schema)
- `deliveryDate` is computed client-side as +3 business days from `new Date()` — not fetched from the API

---

### Sub-Task 9 — Cart, Checkout & Order Confirmation Pages

**Status:** `[x] done`

**Intent:**  
Build the three-step purchase flow: Shopping Cart (with address form + order summary), Payment Screen (modal with payment method selector), and Order Confirmation (success modal).

**Expected Outcomes:**
- `CartPage` / `CheckoutPage` renders cart items with quantity controls, address form, grand total panel with coupon redemption and Pay Now button
- `PaymentPage` renders the "Complete Payment" modal UI with Credit Card / Debit Card / UPI / Wallet tab selector and card detail fields
- `OrderConfirmationPage` renders the success modal with purchased books listed and "Continue your Shopping" button
- Coupon code `DISCOUNT100` applies a $1 discount
- "Use Saved Address" checkbox pre-fills from user profile

**Todo List:**
1. Implement `client/src/pages/CheckoutPage.tsx` — cart item list, `<QuantitySelector>`, address form, `<OrderSummary>` panel
2. Create `client/src/components/ecommerce/OrderSummary.tsx` — price, tax, delivery, coupon, total
3. Implement `client/src/pages/PaymentPage.tsx` — modal with payment method tabs + Credit Card form fields
4. Implement `client/src/pages/OrderConfirmationPage.tsx` — success modal with book list and CTA
5. Create `client/src/api/orders.ts` and `client/src/api/payments.ts` — typed API call functions
6. Wire full flow: Checkout → PaymentPage → OrderConfirmationPage

**Relevant Context:**
- Checkout screenshot shows breadcrumb: Home / Non-Fiction / Self Help / Joy of Minimalism / Checkout
- Grand Total panel shows: Price (N items), Tax, Delivery Charges (Free), Apply Coupon, Discount, Total Amount, Pay Now
- Payment modal shows payable amount at top-right, method list left, form fields right
- Confirmation modal has green checkmark icon, purchased book cards, "Continue your Shopping" button

---

### Sub-Task 10 — Order History & Wishlist Pages

**Status:** `[x] done`

**Intent:**  
Build the secondary authenticated pages: Order History (My Orders) and Wishlist (My Wishlist), plus the Login page.

**Expected Outcomes:**
- `LoginPage` has email/password form, authenticates against `/api/auth/login`, stores JWT, redirects to home
- `OrderHistoryPage` lists past orders with status badge, order date, total, and a "Buy Again" button per item
- `WishlistPage` lists wishlisted books with Remove and Add to Cart actions

**Todo List:**
1. Implement `client/src/pages/LoginPage.tsx`
2. Implement `client/src/pages/OrderHistoryPage.tsx`
3. Implement `client/src/pages/WishlistPage.tsx`
4. Add protected route wrapper `client/src/components/auth/ProtectedRoute.tsx` — redirects to `/login` if no JWT
5. Apply `<ProtectedRoute>` to orders, wishlist, checkout, payment routes in `App.tsx`

**Relevant Context:**
- Architecture diagram states: "User Browses Order History with Buy In Again feature"
- My Orders, My Wishlist, My Writers are visible as nav links in all screenshots

---

### Sub-Task 11 — API Integration Polish & End-to-End Wiring

**Status:** `[x] done`

**Intent:**  
Connect all pages to real API calls, ensure loading/error states are handled, and verify the complete user journey works end-to-end.

**Expected Outcomes:**
- All pages show a `<Spinner>` while loading and an error message on failure
- Cart count in Navbar reflects actual server-side cart state after login
- Coupon validation calls the API and shows discount in real-time
- Order creation persists to PostgreSQL and appears in Order History
- Mock payment always succeeds and redirects to confirmation

**Todo List:**
1. Audit all pages for missing API wiring; replace any hardcoded mock data with real API calls
2. Add loading + error states to every data-fetching page
3. Verify cart context syncs with server on login
4. Test full checkout flow: add to cart → checkout → payment → confirmation → order history
5. Add `axios` response interceptor to handle 401 (clear JWT, redirect to login)

**Relevant Context:**
- This sub-task assumes Sub-Tasks 1–10 are all complete
- Focus on correctness of data flow, not new UI features

---

### Sub-Task 12 — OpenAPI Spec Generation

**Status:** `[x] done`

**Intent:**
Generate a complete OpenAPI 3.0 specification from the Express routes using `swagger-jsdoc` annotations, and serve it as interactive documentation via `swagger-ui-express` at `/api-docs`. This satisfies the "Open API spec generation" capstone requirement and also serves as the contract between frontend and backend.

**Expected Outcomes:**
- Every API route in Sub-Task 3 has JSDoc `@openapi` annotation comments describing request/response schemas
- `GET /api-docs` serves the Swagger UI with all routes browsable and testable
- `GET /api-docs.json` returns the raw OpenAPI JSON spec
- A copy of the spec is saved to `docs/openapi.json` for submission

**OpenAPI Spec Coverage:**

```
/api/auth/login          POST  — LoginRequest, LoginResponse, 401
/api/auth/me             GET   — UserProfile, 401
/api/books               GET   — BookListResponse with pagination
/api/books/{slug}        GET   — BookDetailResponse, 404
/api/books/{slug}/related GET  — BookListResponse
/api/categories          GET   — CategoryListResponse
/api/cart                GET/POST/PATCH/DELETE
/api/wishlist            GET/POST/DELETE
/api/orders              GET/POST
/api/orders/{id}         GET
/api/orders/{id}/cancel  POST
/api/payments            POST  — PaymentRequest, PaymentResponse
/api/books/{slug}/reviews GET/POST
/api/coupons/validate    POST  — CouponRequest, CouponResponse
```

**Todo List:**
1. ~~Add `swagger-jsdoc` and `swagger-ui-express` to `server/package.json`~~ ✅ Done in Sub-Task 3
2. ~~Create `server/src/swagger.ts`~~ ✅ Done in Sub-Task 3 — file exists with all component schemas and server config
3. ~~Mount `/api-docs` and `/api-docs.json` endpoints in `server/src/index.ts`~~ ✅ Done in Sub-Task 3
4. ~~Create `server/src/scripts/exportSpec.ts`~~ ✅ Done in Sub-Task 3
5. **Add `@openapi` JSDoc annotations to all 9 route files** — `auth.ts`, `books.ts`, `categories.ts`, `cart.ts`, `wishlist.ts`, `orders.ts`, `payments.ts`, `reviews.ts`, `coupons.ts`
6. Run `exportSpec.ts` to write `docs/openapi.json`

**Relevant Context:**
- `server/src/swagger.ts` already exists with all schemas — annotations in route files use `$ref: '#/components/schemas/...'` to reference them
- swagger-jsdoc glob is `./src/routes/*.ts` — `categories.ts` is already covered by this glob
- **Implementation note (Sub-Task 3 divergence):** categories route lives in `server/src/routes/categories.ts` (not inside `books.ts`). The glob covers it automatically — no change needed to `swagger.ts`.
- This sub-task is now annotation-only work; all swagger infrastructure is already in place

---

### Sub-Task 13 — AI-Augmented Test Case Generation (ICA Agent)

**Status:** `[x] done`

**Intent:**
Use the ICA (IBM Coding Assistant) Agent — specifically the **API Test Case Generator** and **React Test Case Generator** agents — to produce test suites for the backend API and critical frontend components. This satisfies the "AI augmented test case generator" capstone requirement.

**Expected Outcomes:**
- `server/src/__tests__/` — generated API test files (Jest + Supertest) covering happy path and error cases for all major routes
- `client/src/__tests__/` — generated React component tests (Vitest + React Testing Library) for critical components
- A `docs/test-generation-log.md` documenting: which ICA agent was used, the prompts provided (OpenAPI spec sections + component source), and what was generated vs what was manually adjusted
- All generated tests pass with `npm test`

**Test Coverage Targets:**

```
Backend (Jest + Supertest):
  auth.test.ts         — POST /api/auth/login: valid creds, wrong password, unknown user
  books.test.ts        — GET /api/books: pagination, filter by category, search
  cart.test.ts         — add item, update quantity, remove item, auth required
  orders.test.ts       — create order, get history, cancel within 48h
  payments.test.ts     — mock payment success response shape
  coupons.test.ts      — valid coupon, invalid coupon, already-used coupon

Frontend (Vitest + RTL):
  BookCard.test.tsx    — renders title, author, price, delivery date
  CartDrawer.test.tsx  — opens/closes, shows items, subtotal calculates
  CheckoutPage.test.tsx — address form validation, coupon apply, Pay Now enabled
  StarRating.test.tsx  — interactive mode fires onChange, display mode is read-only
```

**ICA Agent Workflow:**
1. Feed the OpenAPI spec sections (from Sub-Task 12) to the **API Testcase Generator** agent
2. Feed each React component's source (from Sub-Tasks 5–9) to the **Test case generator for React** agent
3. Review generated tests, fix import paths, add missing assertions
4. Document the generation process in `docs/test-generation-log.md`

**Todo List:**
1. Add Jest, Supertest, ts-jest to `server/package.json`; add Vitest, @testing-library/react to `client/package.json`
2. Create `server/jest.config.ts` and `client/vitest.config.ts`
3. Use ICA Agent (API Testcase Generator) with the OpenAPI spec to generate backend test stubs
4. Use ICA Agent (Test case generator for React) with component source to generate frontend test stubs
5. Review, fix, and complete all generated tests until they pass
6. Write `docs/test-generation-log.md` — record agent used, input provided, output received, manual changes made

**Relevant Context:**
- This sub-task depends on Sub-Tasks 3 (backend routes) and 12 (OpenAPI spec) for backend tests
- This sub-task depends on Sub-Tasks 5–9 (all frontend components/pages) for React tests
- The OpenAPI spec from `docs/openapi.json` is the primary input to the API Testcase Generator agent
- Document any prompt engineering needed (e.g., providing the schema context + route context together)
- Tests run in CI: add `test` scripts to root `package.json`

---

### Sub-Task 14 — Local Machine Readiness (Docker Compose)

**Status:** `[x] done`

**Intent:**
Package the entire application — PostgreSQL database, Express backend, and Vite-built React frontend — so it starts with a single `docker compose up` command on any developer's local machine. This eliminates "works on my machine" issues and is the foundation for any future cloud deployment.

**Expected Outcomes:**
- `docker-compose.yml` at the project root starts three services: `db`, `server`, `client`
- `docker-compose.yml` runs database migrations and seed automatically on first start via an init script
- A developer with only Docker Desktop installed can run the full application with no other prerequisites
- `README.md` contains a "Quick Start" section with exactly the commands needed: `docker compose up --build`
- Health checks are defined for all three services so `docker compose ps` shows accurate status

**Services in docker-compose.yml:**

```
db:
  image: postgres:16-alpine
  environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
  volumes: postgres_data (named volume for persistence)
  ports: 5432:5432
  healthcheck: pg_isready

server:
  build: ./server  (Dockerfile.server)
  environment: DATABASE_URL, JWT_SECRET, PORT, CLIENT_URL
  ports: 3001:3001
  depends_on: db (condition: service_healthy)
  command: runs migrations + seed + starts server

client:
  build: ./client  (Dockerfile.client — nginx serving Vite build)
  ports: 5173:80
  depends_on: server
```

**Dockerfiles:**

```
server/Dockerfile:
  FROM node:20-alpine
  WORKDIR /app
  COPY package.json, prisma/, src/, tsconfig.json
  RUN npm install
  RUN npm run build
  CMD: npx prisma migrate deploy && npx prisma db seed && node dist/index.js

client/Dockerfile:
  Stage 1 (build): FROM node:20-alpine — npm install && npm run build
  Stage 2 (serve): FROM nginx:alpine — COPY dist/ to /usr/share/nginx/html
  COPY nginx.conf for SPA fallback (all routes → index.html)
```

**Todo List:**
1. Create `server/Dockerfile` — multi-stage Node build + migrate/seed + start
2. Create `client/Dockerfile` — multi-stage Vite build + nginx serve
3. Create `client/nginx.conf` — nginx config with SPA fallback (`try_files $uri /index.html`)
4. Create root `docker-compose.yml` with `db`, `server`, `client` services and health checks
5. Create `.env.docker` with Docker-specific defaults (host = `db` not `localhost`)
6. Update `README.md` with "Quick Start" section: prerequisites (Docker Desktop), commands, URLs (`http://localhost:5173`, `http://localhost:3001/api-docs`)
7. Verify `docker compose up --build` starts cleanly, migrations run, seed data is loaded, and app is accessible

**Relevant Context:**
- `DATABASE_URL` in Docker context uses hostname `db` (the compose service name), not `localhost`
- The Vite client must be built with `VITE_API_URL=/api` so requests proxy through nginx to the backend; nginx must proxy `/api` → `http://server:3001`
- Named volume `postgres_data` persists DB state across `docker compose stop`/`start`; use `docker compose down -v` to fully reset
- This sub-task depends on Sub-Task 13 (all application code complete and tests passing)

---

### Sub-Task 15 — Production Readiness Checklist

**Status:** `[x] done`

**Intent:**
Apply a structured hardening checklist to make the codebase ready for a real deployment (cloud or otherwise). This does not deploy to cloud, but ensures the code is in a deployable state — environment variable hygiene, security headers, build optimization, and a documented readiness checklist in `docs/deployment-readiness.md`.

**Expected Outcomes:**
- `docs/deployment-readiness.md` — checklist with each item marked pass/fail and notes
- All critical checklist items pass before the capstone is submitted
- No secrets, hardcoded URLs, or dev-only flags leak into a production build

**Readiness Checklist:**

```
Security
  [ ] All secrets in environment variables — no hardcoded JWT_SECRET, DB passwords
  [ ] CORS restricted to CLIENT_URL env var (not wildcard *)
  [ ] Helmet.js middleware added to Express (sets secure HTTP headers)
  [ ] Passwords hashed with bcryptjs (salt rounds >= 10) — never stored in plain text
  [ ] JWT expiry set (e.g. 24h) — token checked on every protected route

Build & Performance
  [ ] Vite production build runs without errors (npm run build in client/)
  [ ] Bundle size checked (vite build --report) — no unexpectedly large chunks
  [ ] Images/assets served from /public with cache headers
  [ ] API responses paginated — no unbounded queries returning all rows

Database
  [ ] Prisma migrations used (not db push) — migration history tracked in version control
  [ ] Indexes on high-query columns: Book.slug, Book.categoryId, Order.userId
  [ ] No raw SQL strings — all queries go through Prisma client

Observability
  [ ] Express request logging with morgan (dev) and a structured format (production)
  [ ] Unhandled promise rejections caught in Express error handler
  [ ] Health check endpoint GET /api/health returns {status: ok, db: connected}

Documentation
  [ ] README Quick Start is accurate and tested
  [ ] OpenAPI spec is up to date with all routes
  [ ] ERD matches final Prisma schema
  [ ] AI tooling workflow log is complete
```

**Todo List:**
1. Add `helmet` and `morgan` to `server/package.json`
2. Mount `helmet()` and `morgan()` in `server/src/index.ts`
3. Add `GET /api/health` endpoint that pings the Prisma DB and returns status
4. Verify CORS is scoped to `process.env.CLIENT_URL`
5. Add Prisma index annotations (`@@index`) to `Book`, `Order`, `CartItem` models
6. Run `vite build` and `tsc --noEmit` and fix any errors
7. Write `docs/deployment-readiness.md` — go through every checklist item, mark pass/fail, note any accepted trade-offs
8. Update `README.md` with note: "For cloud deployment (AWS ROSA / IBM ROKS), containerize using the provided Dockerfiles and configure the environment variables listed in `.env.example`"

**Relevant Context:**
- This is the final sub-task — all application code and Docker config must be complete first
- Helmet defaults are sufficient for this capstone; no custom CSP needed
- The production readiness doc is a capstone submission artifact
- Cloud deployment path: if cloud access becomes available, the Docker images built in Sub-Task 14 can be pushed to a container registry and deployed via an OpenShift/Kubernetes manifest — document this pathway in the readiness doc without implementing it

---

## Folder Structure

```
fde-capstone-project/
├── package.json                    (root workspaces)
├── .gitignore
├── .env.example
├── .env.docker                     (Docker Compose overrides — Sub-Task 14)
├── docker-compose.yml              (db + server + client — Sub-Task 14)
├── README.md
├── docs/
│   ├── erd.md                      (manual ERD from wireframes — Sub-Task 0)
│   ├── ai-tooling-workflow.md      (IBM Bob usage log — Sub-Task 0)
│   ├── openapi.json                (generated OpenAPI spec — Sub-Task 12)
│   ├── test-generation-log.md     (ICA Agent test gen log — Sub-Task 13)
│   └── deployment-readiness.md    (production checklist — Sub-Task 15)
├── client/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── Dockerfile                  (multi-stage Vite build + nginx — Sub-Task 14)
│   ├── nginx.conf                  (SPA fallback + /api proxy — Sub-Task 14)
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css               (Tailwind v4 + CSS vars)
│       ├── api/
│       │   ├── client.ts
│       │   ├── books.ts
│       │   ├── cart.ts
│       │   ├── orders.ts
│       │   ├── payments.ts
│       │   ├── wishlist.ts
│       │   └── auth.ts
│       ├── context/
│       │   ├── AuthContext.tsx
│       │   └── CartContext.tsx
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.tsx
│       │   │   ├── CartDrawer.tsx
│       │   │   ├── UserDropdown.tsx
│       │   │   ├── CategorySidebar.tsx
│       │   │   ├── MainLayout.tsx
│       │   │   ├── PageWithSidebar.tsx
│       │   │   └── index.ts
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── StarRating.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Breadcrumb.tsx
│       │   │   ├── Spinner.tsx
│       │   │   └── index.ts
│       │   ├── ecommerce/
│       │   │   ├── BookCard.tsx
│       │   │   ├── BookGrid.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   ├── FilterBar.tsx
│       │   │   ├── QuantitySelector.tsx
│       │   │   ├── PriceTag.tsx
│       │   │   ├── OrderSummary.tsx
│       │   │   └── index.ts
│       │   └── auth/
│       │       └── ProtectedRoute.tsx
│       └── pages/
│           ├── HomePage.tsx
│           ├── LoginPage.tsx
│           ├── BookDetailPage.tsx
│           ├── CartPage.tsx
│           ├── CheckoutPage.tsx
│           ├── PaymentPage.tsx
│           ├── OrderConfirmationPage.tsx
│           ├── OrderHistoryPage.tsx
│           └── WishlistPage.tsx
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.ts
    ├── Dockerfile                  (Node build + migrate + seed + start — Sub-Task 14)
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── src/
        ├── index.ts
        ├── swagger.ts                  (swagger-jsdoc config — Sub-Task 12)
        ├── middleware/
        │   ├── auth.ts
        │   └── errorHandler.ts
        ├── routes/
        │   ├── auth.ts                 (with @openapi JSDoc)
        │   ├── books.ts                (with @openapi JSDoc)
        │   ├── categories.ts           (split from books.ts during impl — with @openapi JSDoc)
        │   ├── cart.ts                 (with @openapi JSDoc)
        │   ├── wishlist.ts             (with @openapi JSDoc)
        │   ├── orders.ts               (with @openapi JSDoc)
        │   ├── payments.ts             (with @openapi JSDoc)
        │   ├── reviews.ts              (with @openapi JSDoc)
        │   └── coupons.ts              (with @openapi JSDoc)
        ├── controllers/
        │   ├── authController.ts
        │   ├── booksController.ts
        │   ├── cartController.ts
        │   ├── wishlistController.ts
        │   ├── ordersController.ts
        │   ├── paymentsController.ts
        │   ├── reviewsController.ts
        │   └── couponsController.ts
        ├── scripts/
        │   └── exportSpec.ts           (writes docs/openapi.json — Sub-Task 12)
        └── __tests__/                  (ICA Agent generated — Sub-Task 13)
            ├── auth.test.ts
            ├── books.test.ts
            ├── cart.test.ts
            ├── orders.test.ts
            ├── payments.test.ts
            └── coupons.test.ts
```
