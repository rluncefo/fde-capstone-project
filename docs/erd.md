# Entity Relationship Diagram (ERD) — BookWorm E-Commerce

This document specifies the complete relational data model for the BookWorm e-commerce application derived from the system wireframes, UI screenshots, and architectural specifications.

---

## 1. Entity Specifications

### 1.1 User
Represents registered customers and guest shoppers with loyalty gift point balances and saved delivery addresses.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the user |
| `email` | String | UNIQUE, NOT NULL | User email address for authentication and notices |
| `passwordHash` | String | NOT NULL | Bcrypt-hashed password |
| `name` | String | NOT NULL | User's full name |
| `role` | Enum (`GUEST`, `MEMBER`) | NOT NULL, default `MEMBER` | User role / membership level |
| `giftPoints` | Integer | NOT NULL, default 0 | Reward points redeemable on purchases |
| `savedAddress` | JSON | NULLABLE | Default shipping / billing address details |
| `createdAt` | DateTime | NOT NULL, default `now()` | Timestamp when user account was created |

---

### 1.2 Category
Represents book genres and browsing classifications.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the category |
| `name` | String | UNIQUE, NOT NULL | Category display name (e.g., Fiction, Science) |
| `slug` | String | UNIQUE, NOT NULL | URL-safe identifier slug |

---

### 1.3 Author
Represents book authors featured in the catalog.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the author |
| `name` | String | NOT NULL | Author's full name |
| `bio` | Text | NULLABLE | Author biographical description |
| `avatarUrl` | String | NULLABLE | URL path to author portrait photo |

---

### 1.4 Store
Represents the bookstore location, configuration, operating hours, and general policies.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the store |
| `name` | String | NOT NULL | Bookstore business name |
| `description` | Text | NULLABLE | Description and storefront details |
| `policies` | JSON | NULLABLE | Store policies (returns, shipping, terms) |

---

### 1.5 Book
Represents physical and digital book products available for catalog browsing and purchase.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the book |
| `title` | String | NOT NULL | Title of the book |
| `slug` | String | UNIQUE, NOT NULL | URL-safe identifier slug |
| `description` | Text | NOT NULL | Full book synopsis and description |
| `coverUrl` | String | NOT NULL | Image URL for the book cover thumbnail/display |
| `price` | Decimal(10,2) | NOT NULL | Base selling price |
| `format` | Enum (`PAPERBACK`, `HARDCOVER`, `EBOOK`) | NOT NULL, default `PAPERBACK` | Physical or digital edition format |
| `language` | String | NOT NULL, default 'English' | Publication language |
| `stockCount` | Integer | NOT NULL, default 0 | Current inventory stock quantity |
| `authorId` | String / UUID | FOREIGN KEY (`Author.id`), NOT NULL | Reference to the author |
| `rating` | Decimal(3,2) | NOT NULL, default 0.00 | Average aggregated customer rating (0.00-5.00) |
| `salesCount` | Integer | NOT NULL, default 0 | Cumulative number of copies sold |
| `isRecommended` | Boolean | NOT NULL, default false | Featured in "Recommended" section |
| `isBestseller` | Boolean | NOT NULL, default false | Flagged as a bestseller |
| `isNewLaunch` | Boolean | NOT NULL, default false | Flagged in "New Launches" section |
| `createdAt` | DateTime | NOT NULL, default `now()` | Timestamp when book was added to catalog |

---

### 1.6 BookCategory
Join table managing the many-to-many relationship between books and categories.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `bookId` | String / UUID | PRIMARY KEY, FOREIGN KEY (`Book.id` ON DELETE CASCADE) | Reference to associated book |
| `categoryId` | String / UUID | PRIMARY KEY, FOREIGN KEY (`Category.id` ON DELETE CASCADE) | Reference to associated category |

---

### 1.7 Review
Customer reviews and numerical ratings submitted for books.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the review |
| `bookId` | String / UUID | FOREIGN KEY (`Book.id` ON DELETE CASCADE), NOT NULL | Reference to reviewed book |
| `userId` | String / UUID | FOREIGN KEY (`User.id` ON DELETE CASCADE), NOT NULL | Reference to review author |
| `rating` | Integer | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Star rating score (1 to 5) |
| `content` | Text | NOT NULL | Text review feedback and commentary |
| `createdAt` | DateTime | NOT NULL, default `now()` | Timestamp when review was submitted |

---

### 1.8 CartItem
Active items placed in a user's shopping cart.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the cart item entry |
| `userId` | String / UUID | FOREIGN KEY (`User.id` ON DELETE CASCADE), NOT NULL | Reference to cart owner |
| `bookId` | String / UUID | FOREIGN KEY (`Book.id` ON DELETE CASCADE), NOT NULL | Reference to selected book |
| `quantity` | Integer | NOT NULL, default 1, CHECK (quantity > 0) | Quantity selected for checkout |

---

### 1.9 Wishlist
Saved book entries for future customer consideration.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the wishlist entry |
| `userId` | String / UUID | FOREIGN KEY (`User.id` ON DELETE CASCADE), NOT NULL | Reference to user owning the wishlist item |
| `bookId` | String / UUID | FOREIGN KEY (`Book.id` ON DELETE CASCADE), NOT NULL | Reference to book saved on wishlist |
| `createdAt` | DateTime | NOT NULL, default `now()` | Timestamp when book was added to wishlist |

---

### 1.10 Order
Customer orders placed upon checkout completion.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the order |
| `userId` | String / UUID | FOREIGN KEY (`User.id` ON DELETE RESTRICT), NOT NULL | Reference to user who placed the order |
| `status` | Enum (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`) | NOT NULL, default `PENDING` | Current order lifecycle status |
| `totalAmount` | Decimal(10,2) | NOT NULL | Total payable order amount after tax/discounts |
| `tax` | Decimal(10,2) | NOT NULL, default 0.00 | Calculated tax applied |
| `discount` | Decimal(10,2) | NOT NULL, default 0.00 | Applied coupon or reward discount amount |
| `deliveryAddress` | JSON | NOT NULL | Snapshot of destination shipping address at order time |
| `couponCode` | String | NULLABLE | Coupon code applied during checkout (soft reference) |
| `createdAt` | DateTime | NOT NULL, default `now()` | Timestamp when order was placed |

---

### 1.11 OrderItem
Line items capturing books, quantities, and historical unit prices within an order.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the order line item |
| `orderId` | String / UUID | FOREIGN KEY (`Order.id` ON DELETE CASCADE), NOT NULL | Reference to parent order |
| `bookId` | String / UUID | FOREIGN KEY (`Book.id` ON DELETE RESTRICT), NOT NULL | Reference to ordered book product |
| `quantity` | Integer | NOT NULL, CHECK (quantity > 0) | Quantity purchased |
| `priceAtTime` | Decimal(10,2) | NOT NULL | Locked unit price at the time of purchase |

---

### 1.12 Payment
Payment transaction records linked to orders.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the payment |
| `orderId` | String / UUID | FOREIGN KEY (`Order.id` ON DELETE CASCADE), UNIQUE, NOT NULL | 1-to-1 reference to associated order |
| `method` | Enum (`CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `WALLET`) | NOT NULL | Payment payment method used |
| `status` | Enum (`PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`) | NOT NULL, default `PENDING` | Transaction processing status |
| `amount` | Decimal(10,2) | NOT NULL | Total transaction monetary amount processed |
| `transactionRef` | String | NOT NULL | Reference code from payment gateway |
| `createdAt` | DateTime | NOT NULL, default `now()` | Timestamp when payment was initiated |

---

### 1.13 Coupon
Promotional discount vouchers redeemable during checkout.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / UUID | PRIMARY KEY, default UUID | Unique identifier for the coupon |
| `code` | String | UNIQUE, NOT NULL | Promo code entered by user (e.g., `SAVE10`) |
| `discountAmount` | Decimal(10,2) | NOT NULL | Flat or deductible discount amount |
| `isActive` | Boolean | NOT NULL, default true | Active flag controlling validity |

---

## 2. Relationships & Cardinality

| Source Entity | Cardinality | Target Entity | Foreign Key Column / Relation Description |
| :--- | :---: | :--- | :--- |
| `User` | **1 ── <** | `CartItem` | `CartItem.userId` references `User.id` |
| `Book` | **1 ── <** | `CartItem` | `CartItem.bookId` references `Book.id` |
| `User` | **1 ── <** | `Wishlist` | `Wishlist.userId` references `User.id` |
| `Book` | **1 ── <** | `Wishlist` | `Wishlist.bookId` references `Book.id` |
| `User` | **1 ── <** | `Order` | `Order.userId` references `User.id` |
| `Order` | **1 ── <** | `OrderItem` | `OrderItem.orderId` references `Order.id` |
| `Book` | **1 ── <** | `OrderItem` | `OrderItem.bookId` references `Book.id` |
| `User` | **1 ── <** | `Review` | `Review.userId` references `User.id` |
| `Book` | **1 ── <** | `Review` | `Review.bookId` references `Book.id` |
| `Order` | **1 ── 1** | `Payment` | `Payment.orderId` references `Order.id` (Unique) |
| `Book` | **> ── <** | `Category` | Joined via `BookCategory` (`bookId`, `categoryId`) |
| `Author` | **1 ── <** | `Book` | `Book.authorId` references `Author.id` |
| `Coupon` | **- - -** | `Order` | Soft reference via `Order.couponCode` matching `Coupon.code` |

```
+----------+          1..* +----------+ 1..1       +----------+
|   User   |---------------| CartItem |------------|   Book   |
+----------+               +----------+            +----+-----+
     | 1..*                                             | 1..*
     +--------------------- +----------+ 1..1           |
     |                      | Wishlist |----------------+
     |                      +----------+                |
     | 1..*                                             |
     +--------------------- +----------+ 1..1           |
     |                      |  Review  |----------------+
     |                      +----------+                |
     | 1..*                                             | 1..*
     +--------------------- +----------+ 1..*      1..1 |
                            |  Order   |-------+---|----+
                            +----+-----+       |   |
                                 | 1..1        |   |
                            +----+-----+       |   |
                            | Payment  |       |   |
                            +----------+       |   |
                                               |   |
                                   +-----------+   |
                                   | OrderItem |---+
                                   +-----------+
                                         |
                                         | 1..*
+----------+ 1..*           1..*   +-----+----+   1..1 +----------+
| Category |-----------------------| BookCat  |--------|  Author  |
+----------+                       +----------+        +----------+
```
