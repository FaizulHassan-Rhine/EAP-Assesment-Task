# Smart Inventory & Order Management System

A full-stack web application to manage products, stock levels, customer orders, fulfillment flow, restock priority, and activity tracking.

Built with Next.js frontend + Express/MongoDB backend, ready for Vercel deployment.

## Features

- Authentication
  - User signup and login (email + password)
  - Demo login support
  - Protected app routes
- Product & category management
  - Create/update/delete categories
  - Create/update/delete products
  - Product status handling (`active`, `out_of_stock`, unavailable listing)
- Order management
  - Create orders with multiple line items
  - Status updates (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)
  - Cancel orders with stock restoration
  - Auto total calculation
- Stock handling rules
  - Auto stock deduction on order creation
  - Prevent order when requested quantity exceeds stock
  - Auto mark product out-of-stock when quantity becomes `0`
- Restock queue
  - Auto enqueue products below threshold
  - Priority based on stock health (`high`, `medium`, `low`)
  - Manual restock and queue removal
- Conflict detection
  - Prevent duplicate product in same order
  - Prevent ordering unavailable/inactive product
  - Clear validation and warning messages
- Dashboard & analytics
  - Orders today, pending vs completed, low stock count, revenue today
  - 7-day orders/revenue chart
  - Product low-stock summary
- Activity log
  - Recent system actions with timestamps

## Tech Stack

- Frontend
  - Next.js (App Router)
  - React
  - Tailwind CSS
  - TanStack Query
  - Lucide React icons
  - Recharts
- Backend
  - Node.js
  - Express.js
  - MongoDB + Mongoose
  - JWT auth + bcryptjs
  - Zod validation
- Deployment
  - Vercel (Next.js + serverless Express handler via `api/index.js`)

## Project Structure

- `src/app` - Next.js pages/routes
- `src/components` - reusable UI components/layout
- `src/context` - auth context
- `src/lib` - API and utility helpers
- `server` - Express app, routes, models, middleware
- `api/index.js` - Vercel serverless bridge for Express

## Setup (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env.local` and update values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/smart-inventory
JWT_SECRET=change-me-in-production
NODE_ENV=development
INTERNAL_API_URL=http://127.0.0.1:5000
# FRONTEND_ORIGIN=http://localhost:3000
```

Notes:
- `INTERNAL_API_URL` is for local development only (Next.js rewrite to Express server).
- Use a strong random value for `JWT_SECRET`.

### 3) Run development servers

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://127.0.0.1:5000`

### 4) Build for production (local check)

```bash
npm run build
```

## Demo Credentials

The backend seeds a demo user on startup if not present:

- Email: `demo@inventory.local`
- Password: `demo123`

## Vercel Deployment

1. Push code to GitHub.
2. Import the repo in Vercel.
3. Add environment variables in Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - Optional: `FRONTEND_ORIGIN=https://your-domain.vercel.app`
4. Deploy.

Important:
- Do **not** set `INTERNAL_API_URL` in Vercel.
- On Vercel, `/api/*` is handled by the serverless function (`api/index.js`) using `vercel.json`.

## Available Scripts

- `npm run dev` - Run frontend and backend in development
- `npm run dev:next` - Run Next.js dev server
- `npm run dev:server` - Run Express server with file watch
- `npm run build` - Production build
- `npm run start` - Start built app
- `npm run lint` - Run linter

## Security Notes

- Never commit `.env.local`.
- Rotate credentials if accidentally exposed.
- Use strong `JWT_SECRET` in production.

