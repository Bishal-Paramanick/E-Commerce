# BISHAL-MART: Enterprise Reactive E-Commerce Platform & Order Orchestration Engine

[![Java](https://img.shields.io/badge/Java-25-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.6-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.3.3-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0.46-4479A1.svg?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-1.4.8-0C2340.svg?style=flat-square&logo=razorpay)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 1. Executive Abstract & Platform Highlights

**BISHAL-MART** is an enterprise-grade, high-concurrency e-commerce orchestration platform engineered by **Bishal Paramanick**. Designed with a **Package-by-Feature (Modular Monolith)** architectural paradigm on the backend and an event-driven **Reactive Single-Page Application (SPA)** on the frontend, the platform provides an end-to-end retail experience spanning identity isolation, multi-faceted product discovery, transactional cart synchronization, real-time inventory allocation, and dual-channel cryptographic payment reconciliation.

The system targets modern, latency-sensitive digital commerce requirements by decoupling domain modules into self-contained operational boundaries, enforcing strict database-level criteria queries, executing transactional stock locks, and providing idempotent asynchronous webhook reconciliation for financial operations.

```
       BISHAL-MART HIGH-LEVEL SYSTEM TOPOLOGY
======================================================
 [ Client Web Browser ]
         │  (HTTPS / REST / JSON)
         ▼
 [ Reverse Proxy / Vite Dev / CDN ]
         │
         ├──► [ Spring Security Filter Chain (JwtFilter) ]
         │            │
         │            ▼
         │    [ Package-by-Feature Domain Modules ]
         │    ├── /user      (Identity & Addresses)
         │    ├── /product   (Catalog & Specifications)
         │    ├── /category  (Self-referencing Hierarchies)
         │    ├── /cart      (Transactional Staging)
         │    ├── /order     (FSM Orchestration & Stock Engine)
         │    ├── /delivery  (Logistics & SLAs)
         │    ├── /payment   (Razorpay Engine & Webhook HMAC)
         │    └── /common    (Auditing, Reset & Global Advice)
         │            │
         │            ▼
         ├──► [ Spring Data JPA / Hibernate ORM ]
         │            │
         │            ▼
         ├──► [ Primary MySQL 8.0.46 Database Cluster ]
         │
         └──► [ Razorpay Payment Cloud Gateway ]
```

### Core Architectural Highlights
- **Stateless JWT Security Engine**: Authentication pipeline running on standard **JJWT 0.12.6**, using **HMAC-SHA256** token generation with automated secret initialization, combined with **BCrypt (Cost Factor 12)** credential hashing.
- **Transactional Stock Locking & Automatic Rollbacks**: Inventory is conditionally evaluated and atomically decremented during checkout. If payments fail or orders are cancelled, stock quantities are programmatically restored to avoid phantom stockouts.
- **Dual-Path Payment Reconciliation**: Supports synchronous browser callbacks verified through the official Razorpay SDK, backed by an asynchronous, idempotent server-to-server webhook processor verified using **HMAC-SHA256** constant-time digest comparisons (`MessageDigest.isEqual`).
- **Dynamic Search & Inverted Keyword Joins**: The product query engine leverages type-safe **Spring Data JPA Criteria Specifications** with left-outer joins over collection tables (`product_keywords`), enabling search across names, brands, and metadata tags with distinct result sets.
- **Automated Lifecycle Seeding & Reset Engine**: Features an administrative reset controller protected by `X-Admin-Reset-Key` and `ROLE_ADMIN` permissions that idempotently purges transactional records (carts, orders, addresses) while preserving baseline identity ledgers.
- **Containerized Multi-Tier Topology**: Production-ready `docker-compose.yaml` orchestrating isolated bridge networks, health-checked MySQL containers, volume mount persistency, and resource limits (CPUs & memory ceilings).

---

## Table of Contents
1. [Executive Abstract & Platform Highlights](#1-executive-abstract--platform-highlights)
2. [Mission & Operational Problem Statement](#2-mission--operational-problem-statement)
3. [Core Capabilities & Subsystems Matrix](#3-core-capabilities--subsystems-matrix)
4. [System Architecture & End-to-End Pipeline](#4-system-architecture--end-to-end-pipeline)
5. [Workspace & Console Breakdown (UI/UX)](#5-workspace--console-breakdown-uiux)
6. [Data Schema & Knowledge Model](#6-data-schema--knowledge-model)
7. [Engine & Lifecycle Architecture (State Machines)](#7-engine--lifecycle-architecture-state-machines)
8. [Security, Compliance & Cryptographic Standards](#8-security-compliance--cryptographic-standards)
9. [Repository Structure](#9-repository-structure)
10. [Quickstart & Installation Guide](#10-quickstart--installation-guide)
11. [REST API Reference & Clearance Matrix](#11-rest-api-reference--clearance-matrix)
12. [Project Ownership & Credits](#12-project-ownership--credits)

---

## 2. Mission & Operational Problem Statement

### Operational Friction Points in Modern E-Commerce
Traditional monolithic and fragmented e-commerce architectures frequently encounter critical operational failures:
1. **Inventory Double-Allocation Under High Concurrency**: Standard checkout implementations check stock at cart entry but fail to enforce atomic decrements at order creation. High-velocity flash sales lead to over-selling and negative stock balances.
2. **Asymmetric Payment Dropoffs**: When a consumer closes their browser tab after completing an off-site bank authentication, client-only callbacks fail to execute. Without an asynchronous, cryptographically verified webhook pipeline, orders remain in perpetual limbo (`PENDING`), while customers are charged.
3. **Cascading Frontend Render Bottlenecks**: Complex filter bars, live search debouncing, and modal dialogs often trigger uncontrolled re-renders across parent components, introducing typing latency and broken micro-interactions.
4. **Combinatorial Query Degradation**: Multi-attribute filtering (combining Category IDs, Brand strings, Price boundaries, In-Stock booleans, and Search keywords) commonly degenerates into unindexed table scans or complex in-memory sorting that overwhelms the persistence layer.
5. **Staging Environment Contamination**: QA and test cycles require regular state purges. Standard database drops erase seed metadata and default administrative accounts, requiring manual migration reruns.

### Systematic Platform Solutions
BISHAL-MART resolves these failure modes through rigorous engineering practices:
- **ACID Transaction Boundaries**: Every order checkout executes inside a `@Transactional` boundary that runs `validateStockAvailability()` and `deductStock()` synchronously before issuing the gateway payment order ID.
- **Idempotent Dual-Track Webhooks**: The webhook processor listens for `order.paid`, `payment.captured`, and `payment.failed`. It verifies signatures using constant-time byte comparisons, updates order statuses idempotently, and restores inventory immediately on transaction failure.
- **Decoupled Reactive State Bus**: React 19 handles routing and authorization state through a unified `AuthContext` with custom DOM events (`auth:logout`, `auth:forbidden`), ensuring immediate session termination across detached components without stale token loops.
- **JPA Criteria Specification Filtering**: Dynamic multi-faceted filtering is translated into a single optimized SQL statement executed directly on the MySQL engine, utilizing database-level pagination (`Pageable`).
- **Idempotent Administrative Reset Engine**: The `DatabaseResetService` clears transactional tables (orders, cart items, customer addresses) while automatically reseeding base accounts (`bishal`, `admin`) and baseline product catalog inventory (50 units per SKU).

---

## 3. Core Capabilities & Subsystems Matrix

| Subsystem | Functional Scope & Architectural Description | Key Source Modules & Paths |
| :--- | :--- | :--- |
| **Identity & Access Management (IAM)** | Stateless authentication, BCrypt password hashing, JWT issue/validation, user profile updates, and multi-address management. | `com/bishal/ecombackend/user/service/UserService.java`<br>`com/bishal/ecombackend/user/service/JWTService.java`<br>`com/bishal/ecombackend/common/filter/JwtFilter.java`<br>`Frontend/src/context/AuthContext.jsx` |
| **Catalog & Product Engine** | Dynamic multi-criteria search, brand/category filtering, price bounds, keyword inverted matching, stock validation, and image uploading. | `com/bishal/ecombackend/product/service/ProductService.java`<br>`com/bishal/ecombackend/product/specification/ProductSpecification.java`<br>`com/bishal/ecombackend/product/controller/ProductController.java` |
| **Category Hierarchy Engine** | Self-referencing recursive parent-child category tree generation with Jackson proxy serialization defenses. | `com/bishal/ecombackend/category/model/Category.java`<br>`com/bishal/ecombackend/category/service/CategoryService.java`<br>`com/bishal/ecombackend/category/controller/CategoryController.java` |
| **Cart Staging Engine** | User-bound cart persistence, quantity modifications, delivery SLA binding, live monetary recalculation, and stock sanity verification. | `com/bishal/ecombackend/cart/service/CartService.java`<br>`com/bishal/ecombackend/cart/model/Cart.java`<br>`com/bishal/ecombackend/cart/controller/CartController.java` |
| **Order Orchestration & FSM** | Order placement, strict status finite state transitions, stock reservation, automatic inventory restitution, and historical tracking. | `com/bishal/ecombackend/order/service/OrderService.java`<br>`com/bishal/ecombackend/order/model/OrderStatus.java`<br>`com/bishal/ecombackend/order/controller/OrderController.java`<br>`com/bishal/ecombackend/order/controller/AdminOrderController.java` |
| **Payment Gateway Engine** | Razorpay order generation, client signature validation, HMAC-SHA256 webhook processing, and timing-attack mitigation. | `com/bishal/ecombackend/payment/service/PaymentService.java`<br>`com/bishal/ecombackend/payment/controller/PaymentController.java`<br>`com/bishal/ecombackend/common/config/RazorpayConfig.java` |
| **Logistics & Delivery Engine** | SLA options (Standard, Express, Next-Day), dynamic shipping cost calculations, and delivery date arrival estimation. | `com/bishal/ecombackend/delivery/service/DeliveryOptionService.java`<br>`com/bishal/ecombackend/delivery/model/DeliveryOption.java` |
| **Administrative Lifecycle Controller** | Automated database seeding (`products.json`), system reset key validation, transactional purge, and test ledger resets. | `com/bishal/ecombackend/common/admin/DatabaseResetService.java`<br>`com/bishal/ecombackend/common/admin/AdminSystemController.java`<br>`com/bishal/ecombackend/common/config/DatabaseSeeder.java` |
| **Client Storefront Application** | High-performance React 19 UI featuring drawer filters, quick-view modals, golden star rating calculations, and tracking progress bars. | `Frontend/src/Pages/Catalog/CatalogPage.jsx`<br>`Frontend/src/Components/ProductModal.jsx`<br>`Frontend/src/Pages/Checkout/CheckoutPage.jsx`<br>`Frontend/src/Pages/orders/TrackingPage.jsx` |

---

## 4. System Architecture & End-to-End Pipeline

```
                              CLIENT & NETWORK TIER
                     ┌──────────────────────────────────────┐
                     │     End-User Browser / Mobile UI     │
                     └──────────────────┬───────────────────┘
                                        │ HTTPS Requests (JWT Bearer)
                                        ▼
                     ┌──────────────────────────────────────┐
                     │   Vite Frontend Client / HTTP Host   │
                     │  (Vite 8.0 / React 19 / Axios Client)│
                     └──────────────────┬───────────────────┘
                                        │
┌───────────────────────────────────────┼───────────────────────────────────────┐
│ BACKEND SPRING BOOT 3.5.6 RUNTIME     │                                       │
│                                       ▼                                       │
│                      ┌─────────────────────────────────┐                      │
│                      │       CORS / CSRF Security      │                      │
│                      │  (Allowed Origins: 5173, Vercel)│                      │
│                      └────────────────┬────────────────┘                      │
│                                       │                                       │
│                                       ▼                                       │
│                      ┌─────────────────────────────────┐                      │
│                      │       JwtFilter (OncePerReq)    │                      │
│                      │  Extracts & Validates Bearer Tok│                      │
│                      └────────────────┬────────────────┘                      │
│                                       │                                       │
│         ┌─────────────────────────────┴─────────────────────────────┐         │
│         │                                                           │         │
│         ▼ (Public / Anonymous)                                      ▼ (Auth)  │
│  ┌───────────────┐                                          ┌──────────────┐  │
│  │ Catalog / Auth│                                          │ Cart / Orders│  │
│  │  Controllers  │                                          │ / Payments   │  │
│  └──────┬────────┘                                          └──────┬───────┘  │
│         │                                                          │          │
│         ▼                                                          ▼          │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           BUSINESS SERVICE TIER                         │  │
│  │  ProductService  |  CartService  |  OrderService  |  PaymentService     │  │
│  └────────────────────────────────────┬────────────────────────────────────┘  │
│                                       │                                       │
│                                       ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                     SPRING DATA JPA REPOSITORIES                        │  │
│  │  ProductRepo  |  OrderRepo  |  CartRepo  |  UserRepo  |  AddressRepo    │  │
│  └────────────────────────────────────┬────────────────────────────────────┘  │
│                                       │ Hibernate ORM (Dialect: MySQL8)       │
└───────────────────────────────────────┼───────────────────────────────────────┘
                                        │
              ┌─────────────────────────┴─────────────────────────┐
              │                                                   │
              ▼                                                   ▼
┌───────────────────────────┐                       ┌───────────────────────────┐
│     MySQL 8.0.46 CLUSTER   │                       │   RAZORPAY PAYMENT CLOUD  │
│  (ecommerce_db Container) │                       │  - Orders API Endpoint    │
│  - Persistent Volume Mount│                       │  - Checkout JS SDK Modal  │
│  - InnoDB Relational Tables│                       │  - Webhook Dispatcher     │
└───────────────────────────┘                       └───────────────────────────┘
```

### End-to-End Transaction Sequence (Order Checkout)
1. **Staging**: Shopper configures quantities and delivery SLA in `/cart`.
2. **Order Initiation**: Client posts to `/api/orders/checkout` with `addressId` or manual address string.
3. **Atomic Reserve**: Inside a Spring transaction, `OrderService` verifies inventory and immediately decrements `stockQuantity`.
4. **Gateway Tokenization**: The backend issues an internal `Order` entity (`PENDING`) and calls `RazorpayClient.orders.create()` to generate a gateway order ID.
5. **Client Presentation**: Frontend opens the Razorpay Checkout Modal displaying the exact rupee figure.
6. **Reconciliation**:
   - *Synchronous Path*: Upon user completion, the modal handler submits `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to `/api/payments/verify`.
   - *Asynchronous Path*: Razorpay servers dispatch an `order.paid` webhook to `/api/payments/webhook`. The backend verifies the HMAC-SHA256 signature, transitions order status to `PAID`, records the transaction reference, and clears the user's cart.

---

## 5. Workspace & Console Breakdown (UI/UX)

The frontend application provides a cohesive, responsive commerce console configured with **Tailwind CSS v4** utility layouts:

### 1. Catalog Explorer & Storefront Console
- **Route**: `/` (`CatalogPage.jsx`)
- **Interactive Capabilities**:
  - **Dynamic Star Ratings**: Renders numeric rating values (e.g., `4.5` out of 5) using golden filled stars (`#f59e0b`), fractional/half-stars, and muted unfilled stars (`#cbd5e1`), accompanied by the exact customer review count in a muted style (`#64748b`).
  - **Slide-In Filter Drawer**: Collapsible responsive sidebar featuring category selection, brand search debouncing (400ms), dual-slider price ranges, and an "In Stock Only" toggle.
  - **Quick-View Product Modal**: Direct card trigger opening an interactive overlay (`ProductModal.jsx`) detailing brand taxonomy, stock scarcity badges ("Hurry! Only X left"), quantity steppers, and trust metrics.

### 2. Authentication & Credential Portal
- **Route**: `/login`, `/register` (`AuthPage.jsx`)
- **Interactive Capabilities**:
  - **Animated Role Selection**: Toggle between standard shopper registration and administrator account demonstration.
  - **Validation & Sanitization**: Live field error envelopes, password visibility toggle, and automatic token propagation into `sessionStorage`.
  - **Return-Path Preservation**: Deep links that require authentication store location state and redirect shoppers back to their intended checkout flow upon authorization.

### 3. Cart & Checkout Orchestration Console
- **Route**: `/cart`, `/checkout` (`CheckoutPage.jsx`)
- **Interactive Capabilities**:
  - **Item Staging**: Dynamic quantity modifications with live subtotal and estimated delivery adjustments.
  - **Address Book Selector**: Toggle between saved profile addresses and immediate manual address input.
  - **Live Payment Summary**: Automatic item sum, shipping aggregation based on selected delivery SLA, and dynamic 10% tax calculation.
  - **Razorpay Modal Integration**: Programmatic injection of the official payment script and handling of modal dismissal or payment failure notifications.

### 4. Order Management & History Hub
- **Route**: `/orders` (`OrdersPage.jsx`)
- **Interactive Capabilities**:
  - **Status Visualizers**: Visual status pills (`PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - **Transactional Cancellation**: Eligible orders in `PENDING` or `PAID` states can be cancelled directly by the customer, triggering automated backend inventory restoration.
  - **Repurchase Pipeline**: "Buy Again" shortcut directly restocking cart items.

### 5. Package Tracking Console
- **Route**: `/orders/:orderId/tracking/:productId` (`TrackingPage.jsx`)
- **Interactive Capabilities**:
  - **Temporal Progress Calculation**: Calculates shipping progress percentages based on the delta between order placement and estimated delivery time.
  - **Three-Stage Milestone Bar**: Graphical step indicator illustrating transition through `Preparing`, `Shipped`, and `Delivered`.

### 6. Profile & Address Management Console
- **Route**: `/profile` (`ProfilePage.jsx`)
- **Interactive Capabilities**:
  - **Account Metadata**: Displays user roles, registration timestamps, and email attributes.
  - **Address Modal Manager**: Full CRUD interface for adding, editing, deleting, and selecting default delivery addresses.

---

## 6. Data Schema & Knowledge Model

The persistence layer is mapped to MySQL using Spring Data JPA. Below is the relational model schema:

```
                            RELATIONAL SCHEMA TOPOLOGY
 ==============================================================================

 ┌────────────────────────┐              ┌────────────────────────┐
 │        users           │              │     user_addresses     │
 ├────────────────────────┤              ├────────────────────────┤
 │ PK  id (BIGINT AUTO)   │1            *│ PK  id (BINARY(16) UUID│
 │     username (VARCHAR) │◄─────────────┤ FK  user_id (BIGINT)   │
 │     email (VARCHAR)    │              │     full_name (VARCHAR)│
 │     password (VARCHAR) │              │     street_address(VAR)│
 │     role (VARCHAR)     │              │     phone (VARCHAR)    │
 │     enabled (BOOLEAN)  │              │     is_default (BOOL)  │
 └───────────┬────────────┘              └────────────────────────┘
             │ 1
             │
             │ 1
 ┌───────────▼────────────┐              ┌────────────────────────┐
 │        carts           │              │       cart_items       │
 ├────────────────────────┤              ├────────────────────────┤
 │ PK  id (BIGINT AUTO)   │1            *│ PK  id (BINARY(16) UUID│
 │ FK  user_id (BIGINT)   │◄─────────────┤ FK  cart_id (BIGINT)   │
 └────────────────────────┘              │ FK  product_id (UUID)  │
                                         │     quantity (INT)     │
                                         │ FK  delivery_option_id │
                                         └────────────────────────┘
 ┌────────────────────────┐
 │       categories       │
 ├────────────────────────┤
 │ PK  id (BIGINT AUTO)   │1
 │     name (VARCHAR)     │◄───┐ (Self-Referencing Hierarchy)
 │ FK  parent_id (BIGINT) ├───┘
 └───────────┬────────────┘
             │ 1
             │
             │ *
 ┌───────────▼────────────┐              ┌────────────────────────┐
 │        products        │              │    product_keywords    │
 ├────────────────────────┤              ├────────────────────────┤
 │ PK  id (BINARY(16) UUID│1            *│ FK  product_id (UUID)  │
 │     name (VARCHAR)     │◄─────────────┤     keyword (VARCHAR)  │
 │     price_cents (INT)  │              └────────────────────────┘
 │     stock_quantity(INT)│
 │ FK  category_id(BIGINT)│
 │     brand (VARCHAR)    │
 │     stars (DOUBLE)     │ (Embedded Rating)
 │     count (INT)        │
 └───────────┬────────────┘
             │ 1
             │
             │ *
 ┌───────────▼────────────┐              ┌────────────────────────┐
 │         orders         │              │     order_products     │
 ├────────────────────────┤              ├────────────────────────┤
 │ PK  id (BINARY(16) UUID│1            *│ FK  order_id (UUID)    │
 │ FK  user_id (BIGINT)   │◄─────────────┤     product_id (UUID)  │
 │     status (VARCHAR)   │              │     quantity (INT)     │
 │     total_cost_cents   │              │     unit_price_cents   │
 │     payment_order_id   │              │     delivery_option_id │
 │     payment_id         │              │     est_delivery_time  │
 └────────────────────────┘              └────────────────────────┘
```

### Relational Entity Dictionary
- **`users`**: Identity credentials and authorization roles (`ROLE_USER`, `ROLE_ADMIN`). Enforces uniqueness on `username` and `email`.
- **`user_addresses`**: Physical delivery locations mapped to a user. Includes a boolean `is_default` flag and a helper method `toFormattedAddress()`.
- **`categories`**: Unidirectional tree topology where parent nodes contain zero or more subcategories via `parent_id`.
- **`products`**: Primary SKU entity implementing Spring Data's `Persistable<UUID>`. Integrates an `@Embedded Rating` component (stars, review count) and an `@ElementCollection` of search keywords.
- **`carts` & `cart_items`**: Transient pre-checkout staging ledger. Each authenticated user owns exactly one persistent cart record.
- **`delivery_options`**: Static logistics SLA ledger containing pricing (`priceCents`) and SLA durations (`deliveryDays`).
- **`orders` & `order_products`**: Immutable financial and transactional history record. Stores an embedded snapshot of products and delivery options at the exact moment of order placement.

---

## 7. Engine & Lifecycle Architecture (State Machines)

### 1. Order Status Finite State Machine (FSM)
Order records adhere to a deterministic state machine defined in `OrderStatus.java`. State transitions are strictly validated, rejecting invalid jumps (e.g., `SHIPPED` cannot revert to `PENDING`).

```
                    ORDER FINITE STATE MACHINE (FSM)
 ======================================================================

                  ┌────────────────────────┐
                  │        PENDING         │
                  └─────┬────────────┬─────┘
                        │            │
         [Payment OK]   │            │ [Payment Fail / Cancel]
                        ▼            ▼
           ┌────────────────┐    ┌────────────────┐
           │      PAID      │    │   CANCELLED    │◄─── (Terminal: Stock
           └──────┬─────────┘    └────────────────┘      Restored)
                  │                      ▲
     [Processing] │                      │
                  ▼                      │ [Cancel via API]
           ┌────────────────┐            │
           │   PROCESSING   │────────────┘
           └──────┬─────────┘
                  │
        [Shipped] │
                  ▼
           ┌────────────────┐
           │    SHIPPED     │
           └──────┬─────────┘
                  │
      [Delivered] │
                  ▼
           ┌────────────────┐
           │   DELIVERED    │◄───────────────────────── (Terminal State)
           └────────────────┘
```

### 2. Dual-Track Payment Reconciliation Architecture
Financial state synchronization utilizes two concurrent paths to prevent stranded transactions:

```
                           DUAL-TRACK RECONCILIATION
 ==============================================================================

                               [ User Checkout ]
                                       │
                                       ▼
                       [ POST /api/orders/checkout ]
                                       │
                         (Generates Razorpay Order)
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
      [ Path A: Synchronous ]                       [ Path B: Asynchronous ]
                │                                             │
    User completes modal prompt                    Razorpay dispatches Webhook
                │                                             │
                ▼                                             ▼
    [ POST /api/payments/verify ]                  [ POST /api/payments/webhook ]
                │                                             │
      Verify Payment Signature                      Verify HMAC-SHA256 Digest
     (SDK / Secret Verification)                   (MessageDigest.isEqual Guard)
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                        [ Transition Status to PAID ]
                        [ Record Gateway Payment ID ]
                        [ Idempotent Order Persistence ]
```

---

## 8. Security, Compliance & Cryptographic Standards

### Cryptographic Standards & Token Verification
- **Symmetric Signature Generation**: The platform generates JWTs using `io.jsonwebtoken (JJWT 0.12.6)`. The secret key is supplied via `JWT_SECRET` or automatically generated on boot via `KeyGenerator.getInstance("HmacSHA256")`.
- **Timing-Attack Resistance**: When verifying Razorpay webhooks, signature matching avoids naive string comparisons. Signatures are validated using constant-time byte comparisons via `MessageDigest.isEqual()`:
  ```java
  MessageDigest.isEqual(
      calculatedSignature.getBytes(StandardCharsets.UTF_8),
      signatureHeader.getBytes(StandardCharsets.UTF_8)
  );
  ```
- **Credential Storage**: Passwords are protected using `BCryptPasswordEncoder(12)`. Raw passwords are never persisted or logged.

### Role-Based Access Control (RBAC) Clearance Matrix
Security policies are enforced via `SecurityConfig.java` and method-level security (`@PreAuthorize`):

```
+---------------------------------------+-------------+---------------+-----------------------+
| Resource Route Path                   | HTTP Method | Allowed Role  | Clearance Policy      |
+---------------------------------------+-------------+---------------+-----------------------+
| /login, /register                     | POST        | ANONYMOUS     | Publicly Accessible   |
| /api/products/**                      | GET         | ANONYMOUS     | Public Catalog Browsing|
| /api/categories/**                    | GET         | ANONYMOUS     | Public Taxonomy Tree  |
| /api/delivery-options/**              | GET         | ANONYMOUS     | Public Logistics SLAs |
| /api/payments/webhook                 | POST        | ANONYMOUS     | HMAC Signature Guard  |
| /api/cart/**                          | ALL         | ROLE_USER     | Authenticated Token   |
| /api/orders/**                        | ALL         | ROLE_USER     | Authenticated Token   |
| /api/users/profile, /addresses/**     | ALL         | ROLE_USER     | Authenticated Token   |
| /api/admin/orders/**                  | ALL         | ROLE_ADMIN    | PreAuthorize Enforced |
| /api/products/**, /categories/**      | POST/PUT/DEL| ROLE_ADMIN    | PreAuthorize Enforced |
| /api/admin/system/reset               | POST        | ADMIN / KEY   | X-Admin-Reset-Key Req |
+---------------------------------------+-------------+---------------+-----------------------+
```

---

## 9. Repository Structure

```
E-Commerce/
├── .gitignore
├── IDEAL_PROJECT_STRUCTURE.txt
├── README.md                                # Platform Technical Documentation
│
├── Backend/                                 # Spring Boot 3.5.6 Backend Application
│   ├── .dockerignore
│   ├── .env.example                         # Environment configuration template
│   ├── build.gradle.kts                     # Kotlin DSL Gradle build script
│   ├── settings.gradle.kts
│   ├── Dockerfile                           # Multi-stage production container build
│   ├── docker-compose.yaml                  # Multi-service container orchestration
│   ├── gradlew / gradlew.bat
│   │
│   └── src/
│       ├── main/
│       │   ├── java/com/bishal/ecombackend/
│       │   │   ├── EComBackendApplication.java
│       │   │   ├── user/                    # IAM & Address Management Subsystem
│       │   │   │   ├── model/ (Users.java, Address.java, UserPrinciple.java)
│       │   │   │   ├── repo/  (UserRepo.java, AddressRepository.java)
│       │   │   │   ├── service/ (UserService.java, JWTService.java)
│       │   │   │   ├── controller/ (UserController.java, ResetController.java)
│       │   │   │   ├── dto/   (UserLoginRequest.java, UserResponse.java, ...)
│       │   │   │   └── mapper/ (UserMapper.java)
│       │   │   ├── product/                 # Catalog & Inventory Subsystem
│       │   │   │   ├── model/ (Product.java, Rating.java)
│       │   │   │   ├── repo/  (ProductRepository.java)
│       │   │   │   ├── service/ (ProductService.java)
│       │   │   │   ├── controller/ (ProductController.java)
│       │   │   │   ├── specification/ (ProductSpecification.java)
│       │   │   │   └── dto/ & mapper/
│       │   │   ├── category/                # Category Hierarchy Subsystem
│       │   │   │   ├── model/ (Category.java)
│       │   │   │   ├── repo/  (CategoryRepo.java)
│       │   │   │   ├── service/ (CategoryService.java)
│       │   │   │   └── controller/ (CategoryController.java)
│       │   │   ├── cart/                    # Cart Staging Subsystem
│       │   │   │   ├── model/ (Cart.java, CartItem.java)
│       │   │   │   ├── repo/  (CartRepository.java, CartItemRepository.java)
│       │   │   │   ├── service/ (CartService.java)
│       │   │   │   └── controller/ (CartController.java, CartItemController.java)
│       │   │   ├── order/                   # Order Orchestration & FSM Subsystem
│       │   │   │   ├── model/ (Order.java, OrderItem.java, OrderStatus.java)
│       │   │   │   ├── repo/  (OrderRepository.java)
│       │   │   │   ├── service/ (OrderService.java)
│       │   │   │   └── controller/ (OrderController.java, AdminOrderController.java)
│       │   │   ├── payment/                 # Payment Gateway Subsystem
│       │   │   │   ├── service/ (PaymentService.java)
│       │   │   │   ├── controller/ (PaymentController.java, PaymentSummaryController.java)
│       │   │   │   └── dto/ (PaymentVerificationRequest.java, ...)
│       │   │   ├── delivery/                # Logistics SLA Subsystem
│       │   │   │   ├── model/ (DeliveryOption.java)
│       │   │   │   └── controller/ & service/
│       │   │   └── common/                  # Cross-Cutting Infrastructure
│       │   │       ├── admin/ (AdminSystemController.java, DatabaseResetService.java)
│       │   │       ├── config/ (SecurityConfig.java, DatabaseSeeder.java, RazorpayConfig.java)
│       │   │       ├── exception/ (GlobalExceptionHandler.java, ResourceNotFoundException.java)
│       │   │       ├── filter/ (JwtFilter.java)
│       │   │       └── model/ (BaseAuditableEntity.java)
│       │   │
│       │   └── resources/
│       │       ├── application.properties
│       │       ├── application.properties.example
│       │       └── data/
│       │           └── products.json        # Baseline product seeding dataset
│       │
│       └── test/                            # Comprehensive Test Suite
│           └── java/com/bishal/ecombackend/
│               ├── EComBackendApplicationTests.java
│               ├── controller/OrderControllerTest.java
│               ├── service/OrderServiceIntegrationTest.java
│               └── service/PaymentServiceTest.java
│
└── Frontend/                                # React 19 Single Page Application
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                          # Root routes & ProtectedRoute guard
        ├── main.jsx
        ├── index.css                        # Tailwind v4 directives & CSS variables
        ├── context/
        │   └── AuthContext.jsx              # Session provider & custom event bus
        ├── services/
        │   └── api.js                       # Axios client & JWT interceptors
        ├── Components/
        │   ├── Header.jsx                   # Sticky navigation & cart counter
        │   └── ProductModal.jsx             # Quick-view product overlay
        ├── Pages/
        │   ├── Catalog/
        │   │   ├── CatalogPage.jsx          # Homepage, star ratings & filter drawer
        │   │   └── CatalogPage.css
        │   ├── Auth/
        │   │   └── AuthPage.jsx             # Login & Register views
        │   ├── Checkout/
        │   │   ├── CheckoutPage.jsx         # Cart items & Razorpay modal trigger
        │   │   └── CartItemDetails.jsx
        │   ├── orders/
        │   │   ├── OrdersPage.jsx           # Order history & cancellation
        │   │   └── TrackingPage.jsx         # Temporal milestone tracking bar
        │   ├── Profile/
        │   │   └── ProfilePage.jsx          # User details & Address CRUD
        │   └── NotFound.jsx                 # 404 Route sentinel
        └── util/
            ├── money.js                     # Currency formatters
            └── toast.js                     # Hot toast wrappers
```

---

## 10. Quickstart & Installation Guide

### Prerequisites
- **Java Development Kit (JDK)**: Version 25 installed (`java -version`).
- **Node.js**: Version 20.x or higher (`node -v`).
- **Package Manager**: `npm` (v10+) or `pnpm`.
- **Database Engine**: MySQL Server 8.0.x running locally on port 3306 or via Docker.
- **Razorpay Account**: Valid Test Key ID and Secret for payment modal verification.

---

### Step 1: Environment Configuration

Create a `.env` file inside the `Backend/` directory based on `.env.example`:

```properties
# Backend/.env
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_ROOT_PASSWORD=your_root_password

RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpaySecretKeyHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere

JWT_SECRET=super_secret_signing_key_at_least_256_bits_long_abcdef123456
ADMIN_RESET_KEY=admin123
```

In the `Frontend/` directory, configure environment variables:

```properties
# Frontend/.env
VITE_API_HOST=http://localhost:8080
VITE_RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
```

---

### Step 2: Build & Start the Backend

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Build the JAR package:
   ```bash
   ./gradlew bootJar
   ```
3. Run the application:
   ```bash
   ./gradlew bootRun
   ```
   *The Spring Boot server will start on `http://localhost:8080`.*

---

### Step 3: Start the Frontend Application

1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The React application will be accessible at `http://localhost:5173`.*

---

### Step 4: Full Multi-Container Docker Deployment

Alternatively, launch the entire stack using Docker Compose:

```bash
cd Backend
docker compose up -d --build
```
This provisions:
- An isolated `ecom-network` bridge.
- A healthy `mysql:8.0.46` container with persistent storage mapped to `mysql_data`.
- The Spring Boot application running inside container `ecom-backend`, with automatic health-check waiting.

---

### Step 5: Running the Test Suite

Execute the unit and integration test suite (covering WebMvc MockMvc tests, JPA repositories, and Razorpay HMAC cryptographic verification):

```bash
cd Backend
./gradlew test
```

---

## 11. REST API Reference & Clearance Matrix

All endpoints prefixed with `/api` consume and produce `application/json`. Authenticated routes require an `Authorization: Bearer <token>` header.

### 1. Authentication & Registration
| Method | Endpoint | Request Body | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | `UserRegisterRequest` | Registers a new user account | Public |
| `POST` | `/login` | `UserLoginRequest` | Authenticates credentials, returns JWT | Public |

### 2. Products & Catalog
| Method | Endpoint | Query Parameters | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | `search`, `categoryId`, `brand`, `minPriceCents`, `maxPriceCents`, `inStock`, `page`, `size` | Paginated product search with dynamic criteria | Public |
| `GET` | `/api/products/{id}` | N/A | Fetch individual product details by UUID | Public |
| `POST` | `/api/products` | `ProductDTO` | Create a new product record | `ROLE_ADMIN` |
| `PUT` | `/api/products/{id}` | `ProductDTO` | Update an existing product | `ROLE_ADMIN` |
| `DELETE`| `/api/products/{id}` | N/A | Delete product from database | `ROLE_ADMIN` |
| `POST` | `/api/products/{id}/image` | `file` (Multipart) | Upload and assign product hero image | `ROLE_ADMIN` |

### 3. Categories & Logistics
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Retrieve hierarchical category tree | Public |
| `POST` | `/api/categories` | Create top-level or sub-category | `ROLE_ADMIN` |
| `DELETE`| `/api/categories/{id}` | Delete category node | `ROLE_ADMIN` |
| `GET` | `/api/delivery-options` | Fetch available delivery SLAs and pricing | Public |

### 4. Cart Staging
| Method | Endpoint | Request Body | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | N/A | Retrieve authenticated user's cart | Authenticated |
| `POST` | `/api/cart/items` | `AddToCartRequest` | Add item or increment existing quantity | Authenticated |
| `PUT` | `/api/cart/items/{itemId}` | `UpdateCartRequest` | Modify item quantity or delivery option | Authenticated |
| `DELETE`| `/api/cart/items/{itemId}` | N/A | Remove item from cart | Authenticated |
| `DELETE`| `/api/cart` | N/A | Purge all items from current cart | Authenticated |

### 5. Order Management & Checkout
| Method | Endpoint | Request Body | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/orders/checkout` | `CheckoutRequest` | Reserve stock, calculate tax, create order | Authenticated |
| `GET` | `/api/orders` | `expand=products`, pagination | View order history for current user | Authenticated |
| `GET` | `/api/orders/{id}` | `expand=products` | View specific order details | Authenticated |
| `PUT` | `/api/orders/{id}/cancel` | N/A | Cancel pending/paid order & restore stock | Authenticated |
| `GET` | `/api/admin/orders` | Pagination | View all system orders across users | `ROLE_ADMIN` |
| `PUT` | `/api/admin/orders/{id}/status` | `UpdateOrderStatusRequest` | Enforce explicit FSM status transition | `ROLE_ADMIN` |

### 6. Payments & Webhooks
| Method | Endpoint | Request Body | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/verify` | `PaymentVerificationRequest` | Synchronously verify client payment signature | Authenticated |
| `POST` | `/api/payments/webhook` | Raw JSON Payload | Asynchronous HMAC-SHA256 webhook ingest | Public (HMAC Verified) |

### 7. User Profile & Address Book
| Method | Endpoint | Request Body | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | N/A | Fetch authenticated user profile data | Authenticated |
| `PUT` | `/api/users/profile` | `UpdateProfileRequest` | Update profile information | Authenticated |
| `GET` | `/api/users/addresses` | N/A | List user's saved shipping addresses | Authenticated |
| `POST` | `/api/users/addresses` | `AddressRequest` | Save a new shipping address | Authenticated |
| `PUT` | `/api/users/addresses/{id}` | `AddressRequest` | Update an existing address | Authenticated |
| `PATCH`| `/api/users/addresses/{id}/default` | N/A | Set address as account default | Authenticated |
| `DELETE`| `/api/users/addresses/{id}` | N/A | Delete saved address | Authenticated |

### 8. Administrative System Lifecycle
| Method | Endpoint | Headers Required | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/system/reset` | `X-Admin-Reset-Key` | Resets DB state, preserves core accounts | Admin / Secret Key |

---

## 12. Project Ownership & Credits

**BISHAL-MART** is authored and maintained by:

**Bishal Paramanick**  
*Full-Stack Software Engineer & Systems Architect*  
- **Email**: [bishalparamanick312@gmail.com](mailto:bishalparamanick312@gmail.com)  
- **GitHub**: [@Bishal-Paramanick](https://github.com/Bishal-Paramanick)  
- **Production Storefront Demo**: [https://bishalmart.vercel.app](https://bishalmart.vercel.app)

### Engineering Philosophy
This codebase is maintained as a reference implementation of a resilient, modern enterprise application combining Java 25 micro-monolith backend architectures with React 19 single-page applications.

---

```
                       BISHAL-MART RUNTIME READY
               Engineered with Precision & Resilience.
```
