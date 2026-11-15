# Inventory Management System — API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authentication Strategy:** Session cookie (`inventory.sid`) backed by MongoDB store.

---

## Standard Response Envelopes

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success",
  "data": [ ... ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": ["Validation field error description"]
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Description:** Authenticates user credentials, regenerates session, and issues an HTTP-only cookie.
- **Access:** Public (Throttled by rate limiter)
- **Request Body:**
  ```json
  {
    "email": "admin@inventory.com",
    "password": "Admin@123456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "6644f123abc...",
        "fullName": "System Administrator",
        "email": "admin@inventory.com",
        "role": "admin",
        "phoneNumber": "+1-555-0100",
        "isActive": true
      }
    }
  }
  ```

### `POST /api/auth/logout`
- **Description:** Destroys current session, clears cookie, and logs audit record.
- **Access:** Authenticated
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "data": {}
  }
  ```

### `GET /api/auth/me`
- **Description:** Retrieves currently authenticated user session.
- **Access:** Authenticated
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User profile retrieved",
    "data": {
      "user": { ... }
    }
  }
  ```

---

## 2. Product Management

### `GET /api/products`
- **Description:** Paginated catalog query with multi-field filtering and sorting.
- **Access:** Authenticated
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `search` (string) — matches product name or SKU
  - `category` (ObjectId)
  - `supplier` (ObjectId)
  - `stockStatus` ('low-stock' | 'out-of-stock')
  - `sortBy` ('productName' | 'quantity' | 'sellingPrice' | 'createdAt')
  - `sortOrder` ('asc' | 'desc')

### `POST /api/products`
- **Description:** Creates a new product catalog record. Initial stock defaults to 0.
- **Access:** Administrator only
- **Request Body:**
  ```json
  {
    "productName": "Ergonomic Office Chair",
    "sku": "FURN-CHR-009",
    "description": "Adjustable high-back lumbar chair",
    "category": "6644f...",
    "supplier": "6644f...",
    "purchasePrice": 120.00,
    "sellingPrice": 249.00,
    "minimumStockLevel": 5,
    "unit": "pcs"
  }
  ```

### `GET /api/products/:id`
- **Description:** Returns single product populated with category and supplier.
- **Access:** Authenticated

### `PUT /api/products/:id`
- **Description:** Updates product metadata. **Quantity cannot be modified directly via this endpoint.**
- **Access:** Administrator only

### `DELETE /api/products/:id`
- **Description:** Deletes product if no transactions exist; automatically archives (`isActive: false`) if transaction history exists.
- **Access:** Administrator only

---

## 3. Category Endpoints

- `GET /api/categories` — List active categories (supports `?page=1&limit=20&search=...`)
- `GET /api/categories/:id` — Get category by ID
- `POST /api/categories` — Create category (Admin only)
- `PUT /api/categories/:id` — Update category (Admin only)
- `DELETE /api/categories/:id` — Deactivate category (Admin only; blocked if active products are linked)

---

## 4. Supplier Endpoints

- `GET /api/suppliers` — List suppliers (supports `?page=1&limit=20&search=...`)
- `GET /api/suppliers/:id` — Get supplier by ID
- `POST /api/suppliers` — Register supplier (Admin only)
- `PUT /api/suppliers/:id` — Update supplier (Admin only)
- `DELETE /api/suppliers/:id` — Deactivate supplier (Admin only)

---

## 5. Inventory & Alert Endpoints

- `GET /api/inventory` — Read-only warehouse stock table with pagination and filters
- `GET /api/inventory/low-stock` — Returns products where `0 < quantity <= minimumStockLevel`
- `GET /api/inventory/out-of-stock` — Returns products where `quantity == 0`

---

## 6. Transaction Ledger Endpoints

### `POST /api/transactions/stock-in`
- **Description:** Executes atomic inventory increment and registers stock-in receipt.
- **Access:** Authenticated (Staff or Admin)
- **Request Body:**
  ```json
  {
    "product": "6644f...",
    "supplier": "6644f...",
    "quantity": 10,
    "unitPrice": 120.00,
    "referenceNumber": "PO-2026-901",
    "notes": "Delivered to Dock 3"
  }
  ```

### `POST /api/transactions/stock-out`
- **Description:** Executes atomic inventory reduction. Fails if available stock is insufficient.
- **Access:** Authenticated (Staff or Admin)
- **Request Body:**
  ```json
  {
    "product": "6644f...",
    "quantity": 3,
    "reason": "Sale",
    "referenceNumber": "SO-2026-004",
    "notes": "Dispatched to customer"
  }
  ```

### `GET /api/transactions`
- **Description:** Query immutable transaction ledger with date-range and type filters.
- **Access:** Authenticated

---

## 7. Dashboard Endpoints

- `GET /api/dashboard/stats` — High-level KPI aggregates (Total Products, Stock Units, Valuation, Low Stock, Out of Stock).
- `GET /api/dashboard/recent-transactions` — Latest stock movement ledger events.
- `GET /api/dashboard/stock-overview` — 7-day movement graph data and top products by quantity.

---

## 8. Reporting & CSV Export Endpoints

All reporting endpoints return JSON by default or stream a `.csv` file when `?export=csv` is supplied:

- `GET /api/reports/inventory` (Supports `?export=csv`)
- `GET /api/reports/stock-in` (Supports `?export=csv&startDate=...&endDate=...`)
- `GET /api/reports/stock-out` (Supports `?export=csv&startDate=...&endDate=...`)
- `GET /api/reports/low-stock` (Supports `?export=csv`)
- `GET /api/reports/valuation` (Supports `?export=csv`, computes `purchasePrice * quantity` at cost basis)

---

## 9. User Administration & Audit Logs (Admin Only)

- `GET /api/users` — Paginated list of users
- `POST /api/users` — Create staff or admin account
- `GET /api/users/:id` — Get user profile
- `PUT /api/users/:id` — Update user details or reset password
- `PATCH /api/users/:id/status` — Toggle user active/disabled status (protected against self-deactivation and deactivating the last active admin)
- `GET /api/users/activity-logs` — Paginated tamper-proof server audit log
