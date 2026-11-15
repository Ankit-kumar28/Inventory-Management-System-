# Software Requirements Specification (SRS)
## Inventory Management System (IMS)
**Version:** 1.0  
**Status:** Approved for Demonstration  
**Target Environment:** Full-Stack MERN (Node.js, Express, MongoDB, React, Tailwind CSS)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, non-functional, security, and interface specifications for the Inventory Management System (IMS). The intended audience includes software architects, developers, quality assurance engineers, system administrators, and university evaluators.

### 1.2 Scope
The Inventory Management System is an enterprise-grade web application designed to regulate, track, and analyze organizational inventory movements. The scope includes:
- Role-based user authentication and access control (Administrator and Staff).
- Full product catalog lifecycle management with categorization and vendor assignment.
- Warehouse stock tracking, automated low-stock and stock-out alerts.
- Controlled inbound (Stock-In) and outbound (Stock-Out) inventory transactions with atomic ledger entries.
- Executive analytics dashboard, real-time metrics, and historical movement charts.
- Exportable business reports (Current Inventory, Movement, Low-Stock, and Asset Valuation at Cost Basis).
- Administrative user enrollment and immutable server-side activity audit logs.

### 1.3 Definitions, Acronyms, and Abbreviations
- **IMS:** Inventory Management System
- **MERN:** MongoDB, Express.js, React, Node.js
- **SKU:** Stock Keeping Unit (Unique alphanumeric product identifier)
- **RBAC:** Role-Based Access Control
- **CRUD:** Create, Read, Update, Delete
- **ODM:** Object Data Modeling (Mongoose)
- **REST:** Representational State Transfer
- **PoV:** Point of Valuation (Cost basis: `Quantity × Unit Purchase Price`)

### 1.4 References
- IEEE Std 29148-2018: Systems and software engineering — Life cycle processes — Requirements engineering.
- OWASP Top 10 Web Application Security Risks.
- Node.js & Express.js Security Best Practices.

---

## 2. Overall Description

### 2.1 Product Perspective
The IMS is a standalone, browser-based web application with a decoupled architectural model:
1. **Frontend Presentation Tier:** React Single Page Application (SPA) driven by Vite and Tailwind CSS.
2. **Backend Application Tier:** RESTful API service built on Express.js with a modular controller-service-repository design.
3. **Database Tier:** Document database (MongoDB) managed via Mongoose schemas with indexed collections.

### 2.2 Product Functions
- **Access Control:** Secure session-based authentication backed by MongoDB session storage.
- **Product & Category Administration:** Catalog organization, pricing definition, SKU uniqueness verification.
- **Supplier Directory:** Vendor profiling, contact tracking, and procurement referencing.
- **Inventory & Transaction Services:** Non-negative stock enforcement, atomic quantity increments/decrements, immutable transaction logs.
- **Reporting & Business Intelligence:** Filtered tabular reporting, print styling, and one-click RFC 4180-compliant CSV exports.
- **Administrative Audit:** Tamper-proof logging of logins, logouts, entity creations, mutations, and status changes.

### 2.3 User Classes and Characteristics
1. **Administrator (Role: `admin`):**
   - Full read/write authority across the entire platform.
   - Enrolls new staff members and manages credentials/status.
   - Authorizes product catalog creations, updates, and archival.
   - Reviews system-wide audit activity logs.
2. **Staff Member (Role: `staff`):**
   - Read access to products, categories, suppliers, and inventory levels.
   - Authority to execute authorized Stock-In (receiving) and Stock-Out (issuing) transactions.
   - Access to view transaction history and standard inventory reports.
   - Prohibited from accessing user management or modifying system settings.

### 2.4 Operating Environment
- **Client Platforms:** Modern evergreen web browsers (Chrome, Firefox, Safari, Edge) on desktop, laptop, tablet, and mobile devices.
- **Server Runtime:** Node.js v18.0.0 or higher on Linux/macOS/Windows.
- **Database Engine:** MongoDB v6.0+ (Local MongoDB Community or MongoDB Atlas replica set).

---

## 3. Specific System Features (Functional Requirements)

### 3.1 Authentication and Access Control
- **FR-AUTH-01:** System shall authenticate users via verified email and password.
- **FR-AUTH-02:** Passwords must be hashed using bcrypt with a work factor of 12 rounds before persistent storage. Plaintext passwords must never be stored or logged.
- **FR-AUTH-03:** The API shall return an HTTP-only, secure, SameSite session cookie upon successful login and regenerate the session ID to prevent session fixation.
- **FR-AUTH-04:** Rate-limiting middleware shall throttle login attempts to mitigate brute-force attacks.
- **FR-AUTH-05:** Terminating a session shall destroy the session in MongoDB, invalidate the cookie, and write a logout entry to the audit log.
- **FR-AUTH-06:** Route middleware (`requireAuth`, `requireAdmin`, `requireStaffOrAdmin`) shall enforce RBAC on every sensitive endpoint.

### 3.2 Product and Category Management
- **FR-PROD-01:** Every product must possess a unique SKU, valid non-negative purchase price, non-negative selling price, and references to active Category and Supplier entities.
- **FR-PROD-02:** Ordinary product updates shall **not** permit direct modification of on-hand quantity. All inventory modifications must originate from the transaction service.
- **FR-PROD-03:** Products with existing transaction history cannot be hard-deleted; deleting such products will automatically toggle `isActive: false` (archival) to preserve ledger integrity.
- **FR-CAT-01:** Category names must be unique (case-insensitive).
- **FR-CAT-02:** Deleting a category associated with active products shall be rejected with an appropriate 400 Bad Request client notification.

### 3.3 Supplier Management
- **FR-SUP-01:** The system shall maintain supplier contact names, emails, telephone numbers, company titles, and physical addresses.
- **FR-SUP-02:** Historical stock-in receipts shall retain their associated supplier references even if the supplier profile is subsequently deactivated.

### 3.4 Inventory and Transaction Ledger
- **FR-INV-01:** On-hand product quantity shall never drop below zero.
- **FR-INV-02:** A Stock-In transaction must atomically increment on-hand quantity and persist an immutable `StockTransaction` record.
- **FR-INV-03:** A Stock-Out transaction must verify available stock (`quantity >= requestedQuantity`), decrement quantity atomically, and log an immutable transaction record with a declared operational reason (e.g., Sale, Damaged, Internal Use).
- **FR-INV-04:** If quantity is insufficient during a Stock-Out attempt, the transaction must fail and return a 400 Bad Request detailing available vs. requested units.

### 3.5 Automated Stock Alerts
- **FR-ALT-01:** A product is flagged as **Low Stock** when `quantity <= minimumStockLevel` and `quantity > 0`.
- **FR-ALT-02:** A product is flagged as **Out of Stock** when `quantity == 0`.
- **FR-ALT-03:** Alert thresholds must be evaluated dynamically from active database records on both the dashboard and dedicated alert views.

### 3.6 Reports & Analytics
- **FR-REP-01:** Provide real-time reports for Inventory Status, Stock Inbound, Stock Outbound, Low-Stock alerts, and Asset Valuation.
- **FR-REP-02:** Inventory valuation must be computed as `Quantity × Unit Purchase Price` and explicitly labeled as Cost Basis valuation.
- **FR-REP-03:** Provide RFC 4180-compliant CSV exports across all reporting views with proper column formatting and header metadata.

### 3.7 User Management & Audit Logging
- **FR-USR-01:** User provisioning is restricted to Administrators; public registration is disallowed.
- **FR-USR-02:** Deactivating or deleting the last active Administrator account is strictly prohibited.
- **FR-LOG-01:** The backend shall record security and operational events (logins, logouts, entity creations, updates, deletions, and stock transactions) to an indexed `ActivityLog` collection with timestamp, operator ID, and action type.

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Security
- OWASP Top 10 compliance: Helmet HTTP headers, express-rate-limit, CORS origin restriction, parameterized Mongoose queries, input validation via express-validator.
- Passwords excluded by default in schema projections (`select: false`).
- MongoDB ObjectIDs validated on all parameterized path segments.

### 4.2 Performance & Scalability
- Page render times under 300ms for desktop clients.
- RESTful query responses under 100ms for indexed collections.
- Cursor-based and skip/limit pagination on all list endpoints (default 20, max 100 items per request).

### 4.3 Reliability & Transaction Consistency
- Atomic database operations (`$inc` with conditional filters) ensure concurrent stock modifications cannot corrupt quantities or cause race conditions.
- MongoDB multi-document transactions utilized where replica set clusters are available, with safe conditional atomic fallbacks for standalone dev environments.

### 4.4 Usability & Design Quality
- Premium enterprise UI inspired by Linear and Stripe Dashboard: deep navy and slate gray palette, restrained typography (Inter), clear visual hierarchies, and complete absence of generic AI aesthetic artifacts.
- Zero non-functional or decorative placeholder buttons. Every interaction is tied to live backend endpoints.
- Fully responsive across desktop (1920x1080), laptop (1366x768), tablet (768x1024), and mobile viewports (375x812).
