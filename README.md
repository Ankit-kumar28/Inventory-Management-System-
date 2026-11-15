# Inventory Management System (IMS)
## Enterprise Full-Stack MERN Application

---

## 1. Project Introduction

The **Inventory Management System (IMS)** is a full-stack, enterprise-grade web application built using the **MERN** technology stack (MongoDB, Express.js, React, Node.js). Designed and developed to meet the standards of a software engineering capstone demonstration, the application incorporates secure session authentication, atomic inventory transactions, automated stock alerts, and analytical reporting.

The system features an enterprise user interface inspired by modern platforms such as Linear and Stripe Dashboard, avoiding generic AI templates in favor of a restrained, functional design.

---

## 2. Project Objectives

- **Accurate Inventory Tracking:** Maintain reliable, real-time records of physical inventory across diverse catalog classifications.
- **Auditability & Integrity:** Eliminate manual quantity tampering by enforcing that all balance changes pass through atomic, immutable Stock-In and Stock-Out ledger entries.
- **Stock Depletion Prevention:** Enforce conditional database filters to guarantee stock quantities never become negative under concurrent operations.
- **Role-Based Access Control:** Differentiate system authorities between Administrators and operational Staff members.
- **Business Intelligence:** Surface executive KPI metrics, 7-day movement analyses, low-stock notifications, and exportable audit reports.

---

## 3. Major Features

| Module | Features & Capabilities |
|---|---|
| **Authentication & RBAC** | Session authentication with MongoDB store (`connect-mongo`), bcrypt password hashing (12 rounds), login rate limiting, session regeneration on login, HTTP-only cookies, protected route guards. |
| **Dashboard & Analytics** | Real-time KPI summaries, inventory asset valuation (cost basis), 7-day inbound vs outbound visual charts, top products by volume, recent transaction stream. |
| **Product Management** | Full CRUD, unique SKU validation, classification and supplier links, purchase/retail pricing, minimum safety thresholds, safe soft-archival on deletion when transaction history exists. |
| **Category Management** | Dynamic product taxonomy grouping, duplicate name prevention, association checks preventing orphaned items. |
| **Supplier Directory** | Comprehensive vendor records, contact details, telephone/email integration, procurement origin tracking. |
| **Inventory Tracking** | Live warehouse balance tables, quick status badges (`In Stock`, `Low Stock`, `Out of Stock`), dedicated filter tabs. |
| **Stock-In Operations** | Inbound receipt workflow, supplier selection, PO/Invoice reference logging, atomic `$inc` balance updates. |
| **Stock-Out Operations** | Outbound dispatch workflow, reason tracking (Sale, Internal, Damaged, Expired, Return), overdraw protection preventing negative balances. |
| **Transaction Ledger** | Immutable audit trail of every warehouse movement, timestamped operator attribution, detailed certificate inspection modal. |
| **Executive Reports** | Inventory snapshots, Movement reports, Low-Stock audits, and Asset Valuation. One-click RFC 4180-compliant CSV exports and print formatting. |
| **User Administration** | Admin-only user provisioning, credential updates, role assignments, safe status toggling, immutable activity logging. |

---

## 4. Technology Stack

### Frontend Presentation Layer
- **Framework:** React.js 18 (Vite build tool)
- **Styling:** Tailwind CSS with custom enterprise design tokens
- **Routing:** React Router DOM v6
- **Data Visualization:** Recharts
- **Iconography:** Lucide React
- **HTTP Client:** Axios with cross-origin credentials (`withCredentials: true`)

### Backend Application Layer
- **Runtime:** Node.js (JavaScript ES Modules)
- **Web Framework:** Express.js
- **Architecture:** Modular Layered Architecture (Controllers, Services, Models, Middleware, Validators)
- **Security:** Helmet, express-rate-limit, CORS, express-validator
- **Session Store:** express-session + connect-mongo

### Database Layer
- **Database:** MongoDB (Local Community Edition or MongoDB Atlas Cluster)
- **Object Data Modeling (ODM):** Mongoose v8
- **Consistency Engine:** Atomic operators with conditional queries & multi-document transaction fallback

---

## 5. Architecture Overview

The system implements a layered architectural pattern:

```
[ Client: React + Vite + Tailwind ]
               │  (HTTPS / Cookie-based REST API)
               ▼
   [ Express Application Server ]
    ├── Middleware (Helmet, CORS, RateLimiter, Session, RBAC)
    ├── Controllers (HTTP Request / Response Formatting)
    ├── Services (Business Logic & Atomic Transactions)
    └── Models (Mongoose Schemas, Indexes & Validation)
               │
               ▼
   [ Database: MongoDB / MongoDB Atlas ]
```

---

## 6. Project Folder Structure

```
inventory-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment, database, and session configurations
│   │   ├── constants/       # Global system enums (Roles, Transaction Types, Actions)
│   │   ├── controllers/     # Express route handlers
│   │   ├── middleware/      # Auth, RBAC, error handling, validation, rate limiting
│   │   ├── models/          # Mongoose data schemas and indexes
│   │   ├── routes/          # RESTful endpoint definitions
│   │   ├── scripts/         # Database seed script for initial admin/demo records
│   │   ├── services/        # Business logic and atomic database operations
│   │   ├── utils/           # Response formatters, CSV generator, ObjectId validator
│   │   ├── validators/      # Express-validator schema rules
│   │   ├── app.js           # Express app instance and middleware pipeline
│   │   └── server.js        # Server listener and graceful shutdown handling
│   ├── tests/               # Automated integration tests (Jest + Supertest)
│   ├── .env.example         # Backend environment blueprint
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── public/              # Static public assets
│   ├── src/
│   │   ├── components/      # Reusable UI primitives (Modals, Badges, Tables, Toast)
│   │   ├── context/         # AuthContext and ToastContext
│   │   ├── hooks/           # useToast and usePagination custom hooks
│   │   ├── layouts/         # AppLayout and responsive navigation wrappers
│   │   ├── pages/           # Screen views (Dashboard, Products, Stock-In/Out, etc.)
│   │   ├── routes/          # ProtectedRoute and RBAC gatekeepers
│   │   ├── services/        # Centralized Axios API client
│   │   ├── utils/           # Formatters, currency helpers, CSV downloader
│   │   ├── App.jsx          # Route catalog
│   │   ├── index.css        # Tailwind directives and utility classes
│   │   └── main.jsx         # React DOM mount point
│   ├── .env.example         # Frontend environment blueprint
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── SRS/                 # Software Requirements Specification (IEEE 29148)
│   ├── UML/                 # Use Case, Class, Sequence, and Activity diagrams
│   └── API/                 # Complete REST API reference
├── .gitignore
└── README.md
```

---

## 7. Prerequisites

- **Node.js:** v18.0.0 or higher (`node -v`)
- **npm:** v9.0.0 or higher (`npm -v`)
- **MongoDB:** v6.0+ (Local MongoDB Community or free MongoDB Atlas account)

---

## 8. Installation & Setup Instructions

### Step 1: Clone or Navigate to the Workspace
```bash
cd "/Users/ayushsoni7852/Desktop/inventory management"
```

### Step 2: Configure Backend Environment
Navigate to `backend/` and copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and supply your MongoDB connection string and a secret key:
```env
NODE_ENV=development
PORT=5000

# Local MongoDB or MongoDB Atlas URI:
MONGODB_URI=mongodb://127.0.0.1:27017/inventory_management
SESSION_SECRET=your_custom_long_random_session_secret_key_here

CLIENT_URL=http://localhost:5173
APP_URL=http://localhost:5000

SESSION_NAME=inventory.sid
SESSION_MAX_AGE=86400000
BCRYPT_ROUNDS=12
```

### Step 3: Seed the Database
Populate the database with the initial Administrator account, demo categories, suppliers, and sample catalog products:
```bash
npm run seed
```

> **Default Seed Credentials:**
> - **Administrator:** `admin@inventory.com` / `Admin@123456`
> - **Staff Member:** `staff@inventory.com` / `Staff@123456`

### Step 4: Configure Frontend Environment
In another terminal, navigate to `frontend/` and configure `.env`:
```bash
cd ../frontend
cp .env.example .env
```
Default `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 9. Running the Application

### Start Backend Service
```bash
cd backend
npm run dev
```
The backend API server will initialize at `http://localhost:5000`.

### Start Frontend Application
```bash
cd frontend
npm run dev
```
The React development server will start at `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173/login`.

---

## 10. MongoDB Setup Details

### Option A: Local MongoDB (Community Edition)
1. Install MongoDB via Homebrew (`brew tap mongodb/brew && brew install mongodb-community`) or download from mongodb.com.
2. Start the daemon:
   ```bash
   brew services start mongodb/brew/mongodb-community
   ```
3. Use connection string: `mongodb://127.0.0.1:27017/inventory_management`.
4. *Transaction Note:* Multi-document transactions in MongoDB require a replica set. The application is built with a dual-execution strategy: if connected to a replica set, it initiates native database transactions; on standalone local instances, it executes atomic conditional operators (`$inc` and `$gte` filters) to guarantee zero negative inventory.

### Option B: MongoDB Atlas (Cloud Cluster - Recommended)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Build an **M0 Free** cluster.
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, whitelist your IP address (or `0.0.0.0/0` for development).
5. Copy the connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/inventory_management?retryWrites=true&w=majority`) and paste it as `MONGODB_URI` in `backend/.env`.

---

## 11. Automated Testing

Run the automated integration test suite:
```bash
cd backend
npm test
```
The test suite verifies health endpoints, authentication guards, invalid credential rejections, rate limits, and unauthenticated route protections.

---

## 12. Documentation Reference

- **Software Requirements Specification:** [`docs/SRS/software-requirements-specification.md`](file:///Users/ayushsoni7852/Desktop/inventory%20management/docs/SRS/software-requirements-specification.md)
- **Use Case Diagram:** [`docs/UML/use-case-diagram.md`](file:///Users/ayushsoni7852/Desktop/inventory%20management/docs/UML/use-case-diagram.md)
- **Class Diagram:** [`docs/UML/class-diagram.md`](file:///Users/ayushsoni7852/Desktop/inventory%20management/docs/UML/class-diagram.md)
- **Sequence Diagrams:** [`docs/UML/sequence-diagram.md`](file:///Users/ayushsoni7852/Desktop/inventory%20management/docs/UML/sequence-diagram.md)
- **Activity Diagrams:** [`docs/UML/activity-diagram.md`](file:///Users/ayushsoni7852/Desktop/inventory%20management/docs/UML/activity-diagram.md)
- **REST API Documentation:** [`docs/API/api-documentation.md`](file:///Users/ayushsoni7852/Desktop/inventory%20management/docs/API/api-documentation.md)

---

## 13. Team Members & Responsibilities

| Role | Team Member Placeholder | Primary Responsibilities |
|---|---|---|
| **Full-Stack Lead & Architect** | Student 1 | System architecture design, Express RESTful API, authentication middleware, atomic transaction coordination, and database modeling. |
| **Frontend Engineer & UI/UX Designer** | Student 2 | React presentation components, Tailwind design system tokens, responsive navigation layout, Recharts dashboard integration, and form validations. |
| **Database & Security Engineer** | Student 3 | MongoDB schema optimization, index configuration, negative stock prevention, session store setup, and rate limiting. |
| **QA Engineer & Technical Writer** | Student 4 | IEEE 29148 SRS documentation, UML diagram creation, API specification, integration testing, and project verification. |
