# UML Class Diagram (Data Models & Architecture)

```mermaid
classDiagram
    direction TB

    class User {
        +ObjectId _id
        +String fullName
        +String email
        +String password
        +String phoneNumber
        +String role
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
        +comparePassword(candidate) Boolean
        +toSafeObject() Object
    }

    class Category {
        +ObjectId _id
        +String categoryName
        +String description
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class Supplier {
        +ObjectId _id
        +String supplierName
        +String contactPerson
        +String email
        +String phoneNumber
        +String companyName
        +String address
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class Product {
        +ObjectId _id
        +String productName
        +String sku
        +String description
        +ObjectId category
        +ObjectId supplier
        +Number purchasePrice
        +Number sellingPrice
        +Number quantity
        +Number minimumStockLevel
        +String unit
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class StockTransaction {
        +ObjectId _id
        +ObjectId product
        +ObjectId supplier
        +String transactionType
        +Number quantity
        +Number unitPrice
        +String referenceNumber
        +String reason
        +String notes
        +ObjectId createdBy
        +Date createdAt
    }

    class ActivityLog {
        +ObjectId _id
        +ObjectId user
        +String action
        +String entityType
        +ObjectId entityId
        +String description
        +Object metadata
        +Date createdAt
    }

    %% Relationships
    Category "1" -- "0..*" Product : classifies
    Supplier "1" -- "0..*" Product : supplies
    Product "1" -- "0..*" StockTransaction : tracked in
    Supplier "0..1" -- "0..*" StockTransaction : sourced from
    User "1" -- "0..*" StockTransaction : executes
    User "0..1" -- "0..*" ActivityLog : logged for
```

### Entity Schema Dictionary

1. **User:** Represents system actors. Passwords are protected via bcrypt hashing with 12 salt rounds and excluded from standard projections via `{ select: false }`. Role is restricted to `admin` or `staff`.
2. **Category:** Hierarchical grouping of products. Case-insensitive unique indexing ensures no duplicates.
3. **Supplier:** Commercial vendor profiles associated with products and stock-in receipts.
4. **Product:** Master SKU catalog records. Holds unit pricing, current on-hand quantity, minimum stock safety thresholds, and unit of measure.
5. **StockTransaction:** Immutable event record written during stock-in receipts and stock-out issues. Preserves audit data indefinitely.
6. **ActivityLog:** Server-side security and administrative activity log recording logins, logouts, entity creations, updates, and permission changes.
