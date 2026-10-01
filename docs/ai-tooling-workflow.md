# AI Tooling & Vibe Coding Workflow

This document records the AI-assisted development workflow employed across the BookWorm e-commerce capstone project, detailing how AI capabilities were integrated into system planning, full-stack implementation ("vibe coding"), OpenAPI specification generation, and automated test suite creation.

---

## 1. Overview

The BookWorm application was engineered leveraging a structured AI-augmented workflow combining two primary AI developer tools:

1. **IBM Bob (Plan & Agent Modes)**:
   - **Plan Mode**: Used for high-level technical breakdown, requirements traceability, and generating the master implementation blueprint (`bookworm-plan.md`) from architectural diagrams and UI wireframe screenshots.
   - **Agent Mode**: Used for active "vibe coding" across backend Express/Prisma services, React/Tailwind frontend components, state management stores, and Docker containerization.
2. **ICA Agent (IBM Code Assistant / Test Generator Agent)**:
   - Used for specialized, automated test generation targeting both backend REST API routes (`API Testcase Generator`) and frontend UI React components (`React Test Case Generator`).

This workflow blends conversational AI steering with rigorous engineering discipline, ensuring high velocity without compromising testability or code quality.

---

## 2. IBM Bob Usage by Sub-Task

| Sub-Task | Bob Mode Used | What Was Generated | Notes |
| :--- | :--- | :--- | :--- |
| **0. ERD & Workflow Docs** | **Plan Mode** | Project Master Plan (`bookworm-plan.md`), ERD document (`docs/erd.md`), AI Workflow document (`docs/ai-tooling-workflow.md`) | Plan mode analyzed screenshots & architecture to derive 13 entities, 16 sub-tasks, and end-to-end milestone criteria. |
| **1. Monorepo Scaffold** | **Agent Mode** | Root `package.json` (npm workspaces), `.gitignore`, `.env.example`, and `README.md` | Configured workspace scripts for concurrent client/server development. |
| **2. PostgreSQL Data Model** | **Agent Mode** | `server/prisma/schema.prisma`, seed script `server/prisma/seed.ts`, and database client | 13 models matching ERD, mock seed data across books, authors, categories, reviews, and test accounts. |
| **3. Express Backend API** | **Agent Mode** | Express app, TypeScript config, Auth middleware (JWT + bcrypt), REST routes for Books, Categories, Cart, Wishlist, Orders, Coupons, and Store | Modular controllers, Prisma queries, error handling middleware, and route validation. |
| **4. Frontend Scaffold** | **Agent Mode** | Vite + React + TypeScript setup, Tailwind CSS configuration, Axios API client, Zustand store (`useAuthStore`, `useCartStore`, `useWishlistStore`) | Base responsive typography, color palette matching wireframes, and persistent stores. |
| **5. Layout & Navigation** | **Agent Mode** | Header, TopBar, Navbar, Footer, MegaMenu, SearchBar, AuthModal (Login/Register tabs) | Pixel-accurate header with category dropdowns, cart badge counter, and auth dialog. |
| **6. Reusable E-Commerce UI** | **Agent Mode** | `BookCard`, `StarRating`, `PriceTag`, `Badge`, `QuantitySelector`, `Pagination`, `Tabs` | Accessible, reusable UI primitives styled with Tailwind. |
| **7. Home Page** | **Agent Mode** | `HeroBanner`, `CategoryPills`, `BookCarousel`, `BestsellerGrid`, `AuthorSpotlight`, `StorePoliciesBanner` | Composite page rendering hero promotions, carousel sliders, and featured picks. |
| **8. Book Detail Page** | **Agent Mode** | `BookDetail` page view, Image gallery, format selector (Paperback/Hardcover/eBook), stock indicator, Review list, Review submission form, Related books section | Full single-product view with instant cart addition and review creation. |
| **9. Cart, Checkout & Confirmation** | **Agent Mode** | `CartPage` (line item adjustments, subtotal, coupon input), `CheckoutPage` (address form, payment method selector, order summary), `OrderConfirmationPage` | Complete transaction funnel with gift points and discount calculations. |
| **10. Order History & Wishlist** | **Agent Mode** | `OrdersPage` (list past orders, statuses, item breakdowns), `WishlistPage` (grid of saved books, move-to-cart action) | User account area for past orders and saved items. |
| **11. API Polish & End-to-End** | **Agent Mode** | End-to-end integration testing, loading states, error boundary states, toast notifications | Verified complete user purchase loop from browsing to receipt. |
| **12. OpenAPI Spec** | **Agent Mode** | `tsoa` / `swagger-jsdoc` annotations on Express routes, Swagger UI mounted at `/api-docs` | Interactive OpenAPI 3.0 specification exposing all REST endpoints. |
| **13. AI-Augmented Testing** | **ICA Agent** | API test suite via Supertest/Jest (`server/src/__tests__/*`) and React component tests via React Testing Library (`client/src/__tests__/*`) | Prompted ICA Agent using route files and component source files as input. |
| **14. Docker Compose Setup** | **Agent Mode** | `Dockerfile` (server), `Dockerfile` (client with Nginx multi-stage build), `docker-compose.yml`, health checks | Multi-container local production environment with automated db migrations and seeding. |
| **15. Production Readiness** | **Agent Mode** | Production checklist audit, build verification, environment variable validation, and final documentation polish | Validated zero linting errors, passing builds, and complete test coverage. |

---

## 3. Example Prompts Used with IBM Bob

### Prompt 1: Initial System Planning (Plan Mode)
> *"Analyze the attached UI wireframes, store screenshots, and architecture diagrams for the BookWorm e-commerce application. Deconstruct the requirements into a detailed, sequential sub-task implementation plan. Ensure each sub-task defines concrete file paths, expected outcomes, and traceability back to all capstone evaluation criteria."*

### Prompt 2: Vibe Coding a Frontend Component (Agent Mode)
> *"Create the `BookCard.tsx` React component using Tailwind CSS and TypeScript. It should display the book cover thumbnail with hover zoom, discount badge, bestseller chip, book title, author name, interactive star rating, current price vs original price strike-through, an 'Add to Cart' quick button, and a wishlist heart toggle button tied to Zustand store actions."*

### Prompt 3: Backend REST Route & Service (Agent Mode)
> *"Implement the Express router and controller for `/api/orders` in TypeScript. Handle authenticated order placement with transactional balance deduction: validate book stock in Prisma, apply coupon code discounts if valid, create the `Order` and `OrderItem` records inside a `$transaction`, create the linked `Payment` record, deduct purchased stock counts, and return the populated order payload."*

---

## 4. ICA Agent (IBM Code Assistant) Usage

In **Sub-Task 13**, specialized ICA Agents are utilized for test generation:

1. **ICA API Testcase Generator**:
   - **Input Provided**: Express route handler definitions, TypeScript interface schemas, and OpenAPI specification (`/api-docs` JSON).
   - **Output Generated**: Jest and Supertest test suites covering positive paths (200/201), input validation failures (400), unauthorized requests (401/403), resource not found (404), and database transactional rollback cases (500).
2. **ICA React Test Case Generator**:
   - **Input Provided**: React component source files (e.g., `BookCard.tsx`, `CartPage.tsx`, `AuthModal.tsx`), mock Zustand store state definitions, and Mock Service Worker (MSW) handlers.
   - **Output Generated**: React Testing Library & Vitest unit and integration test suites validating DOM rendering, user click events, state mutations, accessibility attributes, and async API fetch lifecycles.
