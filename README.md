# BookWorm E-Commerce

BookWorm is a modern, full-stack book e-commerce application designed to provide a rich online shopping experience for book lovers. Built with React, TypeScript, Tailwind CSS, Express, Prisma ORM, and PostgreSQL.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, React Router v6, Axios
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JSON Web Tokens (JWT), Bcrypt.js
- **Database**: PostgreSQL 16
- **API Documentation**: OpenAPI 3.0 / Swagger UI (`swagger-ui-express`)
- **Containerization**: Docker & Docker Compose (Multi-stage production build with Nginx reverse proxy)
- **Testing**: Jest, Supertest, Vitest, React Testing Library

---

## 📋 Prerequisites

Ensure you have the following installed locally:
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Docker Desktop**

---

## 🛠️ Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd fde-capstone-project
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root (and workspace packages as needed):
```bash
cp .env.example .env
```

### 3. Run Database Migrations & Seed
Ensure PostgreSQL is running locally with database `bookworm_db`, then run:
```bash
npx prisma migrate dev --prefix server
npm run seed
```

### 4. Start the Application
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Interactive Swagger API Docs**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

---

## 🐳 Quick Start (Docker Compose — Recommended)

Docker Compose starts the full stack (PostgreSQL, Express API, React frontend) with a single command. No local Node.js or PostgreSQL installation required — only **Docker Desktop**.

### First-time setup

**macOS — make Docker available in your shell** (only needed once):
```bash
echo 'export PATH="$HOME/.docker/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Verify Docker is running:**
```bash
docker --version        # should print Docker version 24+
docker compose version  # should print Docker Compose version
```

If Docker is installed but not running, open **Docker Desktop** from your Applications folder and wait for the whale icon in the menu bar to become steady.

---

### Start the app

```bash
# From the project root — builds images, runs migrations, seeds data, starts all services
docker compose up --build
```

On first run this will:
1. Pull `postgres:16-alpine` and `node:20-alpine` base images (~200MB, one-time download)
2. Build the server and client images
3. Start PostgreSQL and wait for it to be healthy
4. Run database migrations automatically
5. Seed 9 books, 20 categories, 3 users, and sample reviews
6. Start the Express API on port 3001
7. Start the Nginx-served React app on port 5173

**Once running, open:**
| URL | What |
|---|---|
| http://localhost:5173 | BookWorm app |
| http://localhost:3001/api-docs | Interactive Swagger API docs |
| http://localhost:3001/api/health | Health check (confirms DB connected) |

**Test login credentials:**
| Email | Password | Role |
|---|---|---|
| test@bookworm.com | password123 | Member (250 gift points) |
| alice@bookworm.com | password123 | Member (100 gift points) |
| guest@bookworm.com | password123 | Guest |

---

### Subsequent starts (no rebuild needed)

```bash
# Start existing containers — fast, no rebuild
docker compose up

# Start in the background (detached mode)
docker compose up -d
```

---

### Stop the app

```bash
# Stop all containers (preserves database data)
docker compose down

# Or press Ctrl+C in the terminal where docker compose up is running
```

---

### Reset everything (wipe database)

```bash
# Stop containers AND delete the postgres volume (all data is wiped)
docker compose down -v

# Next `docker compose up --build` will re-run migrations and seed from scratch
```

---

### Rebuild after code changes

```bash
# Rebuild images and restart (picks up source code changes)
docker compose up --build
```

---

### View logs

```bash
# All services
docker compose logs -f

# One service only
docker compose logs -f server
docker compose logs -f client
docker compose logs -f db
```

---

### Common issues

| Problem | Solution |
|---|---|
| `zsh: command not found: docker` | Run `source ~/.zshrc` to reload PATH, or open a new terminal tab |
| Port 5173 or 3001 already in use | Run `docker compose down` then retry, or check for other processes on those ports |
| Database tables missing after restart | Run `docker compose down -v && docker compose up --build` to fully reset |
| Slow first build | Normal — Docker is downloading base images. Subsequent builds use cache and are faster |

---

## 📁 Project Structure

```text
fde-capstone-project/
├── client/                      # Vite + React + Tailwind CSS v4 frontend
│   ├── src/
│   │   ├── api/                 # Axios API client modules (books, cart, orders…)
│   │   ├── components/
│   │   │   ├── ecommerce/       # BookCard, BookGrid, OrderSummary, PriceTag…
│   │   │   ├── layout/          # Navbar, CartDrawer, CategorySidebar, MainLayout
│   │   │   └── ui/              # Button, Badge, StarRating, Modal, Spinner…
│   │   ├── context/             # AuthContext, CartContext (React Context + hooks)
│   │   ├── pages/               # HomePage, BookDetailPage, CheckoutPage…
│   │   ├── types/               # Shared TypeScript interfaces (Book, Cart, Order…)
│   │   └── __tests__/           # Vitest + React Testing Library test suites
│   ├── Dockerfile               # Multi-stage build → Nginx serving Vite dist
│   ├── nginx.conf               # SPA fallback + /api proxy to server:3001
│   ├── package.json
│   └── vite.config.ts
├── server/                      # Express + TypeScript backend API
│   ├── prisma/
│   │   ├── schema.prisma        # 13-model Prisma schema (PostgreSQL)
│   │   ├── seed.ts              # Seed data (9 books, 3 users, coupon, reviews)
│   │   └── migrations/          # Prisma migration history
│   ├── src/
│   │   ├── controllers/         # Request handlers for each route group
│   │   ├── middleware/          # JWT auth + global error handler
│   │   ├── routes/              # Express routers with @openapi JSDoc annotations
│   │   ├── scripts/             # exportSpec.ts — exports OpenAPI JSON to disk
│   │   ├── swagger.ts           # swagger-jsdoc config + component schemas
│   │   └── __tests__/           # Jest + Supertest integration test suites
│   ├── Dockerfile               # Node build + migrate/seed + start
│   ├── jest.config.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── erd.md                   # 13-entity ERD with fields, types, and FK relationships
│   ├── ai-tooling-workflow.md   # IBM Bob usage log by sub-task with example prompts
│   ├── test-generation-log.md   # ICA Agent test generation log (inputs, outputs, fixes)
│   ├── deployment-readiness.md  # Production readiness checklist
│   └── openapi.json             # Exported OpenAPI 3.0 spec snapshot
├── bookworm-plan.md             # Master capstone plan — all 16 sub-tasks
├── docker-compose.yml           # db + server + client services with health checks
├── .env.example                 # All required environment variables documented
├── package.json                 # Root npm workspaces config
└── README.md
```

---

## 🧪 Testing

The project has two test suites that run differently:

### Frontend tests (Vitest + React Testing Library)
These run locally — no database needed.
```bash
cd client
npm test
```

### Backend API tests (Jest + Supertest)
These are integration tests that connect to a real PostgreSQL database. The Docker stack must be running first.

**Terminal 1 — start the stack:**
```bash
source ~/.zshrc
docker compose up
```

**Terminal 2 — run server tests inside the container:**
```bash
source ~/.zshrc
docker compose exec server npm test
```

### Run all tests at once (Docker must be running)
```bash
# Frontend (local)
cd client && npm test

# Backend (inside container)
docker compose exec server npm test
```

### Why backend tests run inside Docker
The backend tests (`auth.test.ts`, `books.test.ts`, etc.) are integration tests — they call the real Express API which connects to PostgreSQL. Running them inside the container means they automatically connect to the `db` service with no extra configuration needed.
