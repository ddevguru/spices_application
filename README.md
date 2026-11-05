# Naturale - Premium Dry Fruits, Spices & Cereals E-Commerce Platform

A production-ready, full-stack premium e-commerce platform dedicated exclusively to selling handpicked **Dry Fruits**, **Whole Spices**, **Blended Spices**, and nutritious **Cereals**.

Built with a unified, elegant visual identity inspired by warm peach and cream aesthetics:
- **Primary Color Palette:** Peach (`#F2D5C0`), Light Peach (`#F8E5D6`), Cream (`#FFF8EF`), Primary Orange (`#FF812E`), Soft Orange (`#FFA45B`), Dark Text (`#292929`), Secondary Text (`#898078`), Light Border (`#F0E3D8`), Success Green (`#27865F`).
- **Design Philosophy:** Soft rounded cards, natural shadows, high-resolution realistic food photography, clean spacious hierarchy, zero cluttered grocery UI.

---

## Architecture & Project Structure

The platform is organized into three completely decoupled components:

```
c:\Dryfruits\
│
├── backend/                  # Production Node.js + Express + PostgreSQL Backend
│   ├── config/               # PostgreSQL Connection Pool & resilient file fallback
│   ├── controllers/          # Controllers (Auth, Products, Variants, Orders, Inventory, etc.)
│   ├── middleware/           # JWT auth, Multer file upload, error handler
│   ├── models/               # PostgreSQL schema (schema.sql - 10 relational tables)
│   ├── routes/               # Modular Express API routes
│   ├── scripts/              # Migration (migrate.js) & Seeding (seed.js)
│   ├── uploads/              # Uploaded media and product imagery
│   ├── server.js             # Main server entry point (port 5000)
│   └── .env                  # Database connection credentials & secrets
│
├── customer_app/             # Customer Mobile Application (Flutter + Dart)
│   ├── lib/
│   │   ├── core/             # Colors, theme, dimensions, GoRouter, formatters
│   │   ├── models/           # Dynamic models (Products, Variants, Categories, Orders)
│   │   ├── providers/        # Riverpod State Management (Auth, Cart, Wishlist, Orders)
│   │   ├── services/         # API service connecting to backend with offline persistence
│   │   ├── widgets/          # Reusable cards, weight variant selectors, bottom nav
│   │   └── features/         # Onboarding, Auth, Home, Products, Cart, Checkout, Tracking
│   └── assets/               # High-resolution product images, categories, and banners
│
├── admin_panel/              # Admin Management Dashboard (React.js + Vite + Plain CSS)
│   ├── public/               # Public assets and high-res photography
│   └── src/
│       ├── layouts/          # Responsive fixed-sidebar admin layout
│       ├── pages/            # Dashboard, Products, Variants, Inventory, Orders, Coupons
│       ├── services/         # API Client & Mock fallback service
│       ├── context/          # Admin authentication context
│       └── styles/           # Plain CSS design system (Strictly No Tailwind)
│
└── README.md
```

---

## Database Architecture (PostgreSQL 18)

The PostgreSQL database `dryfruits_db` contains **10 relational tables** with foreign key constraints, indexes, and full support for weight-based variants:

1. `admin_users` – Secure administrator accounts with bcrypt password hashes and roles (`SUPER_ADMIN`, `MANAGER`).
2. `categories` – Categories (`cat_dry_fruits`, `cat_whole_spices`, `cat_blended_spices`, `cat_cereals`) with subcategory arrays.
3. `products` – Master product records (title, description, rating, review count, origins, nutrition facts per 100g, images).
4. `product_variants` – **Core Weight Engine**: Granular variants (100g, 250g, 500g, 1kg) with individual prices, MRP, stock quantity, SKU, and order limits.
5. `customers` – Registered customer accounts, addresses, total orders, and lifetime spend.
6. `orders` – Multi-status order records with subtotal, discounts, delivery fees, and shipping details.
7. `order_items` – Individual lines per order with chosen package variant, grams, and unit price.
8. `coupons` – Promotional promo codes (`WELCOME20`, `NATURALE100`) with minimum order thresholds and expiry.
9. `banners` – Hero banner sliders with CTA targets and category links.
10. `store_settings` – Store configuration (free delivery threshold ₹500, delivery fee ₹40, contact information).

---

## REST API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server and database health check |
| `POST` | `/auth/login` | Admin & Customer JWT login |
| `GET` | `/products` | List products with nested weight variants |
| `POST` | `/products` | Create new product |
| `GET` | `/products/:id` | Get product details with all variants |
| `PUT` | `/products/:id` | Update product information |
| `DELETE` | `/products/:id` | Delete product and associated variants |
| `POST` | `/products/:id/variants` | Add a new weight variant (e.g. 250g, 500g) |
| `PUT` | `/products/:id/variants/:variantId` | Update variant price, MRP, or stock |
| `DELETE` | `/products/:id/variants/:variantId` | Remove a weight variant |
| `GET` | `/categories` | List categories and subcategories |
| `POST` | `/categories` | Create new category |
| `GET` | `/orders` | List orders (with search, filter & pagination) |
| `POST` | `/orders` | Place a customer order |
| `PATCH` | `/orders/:id/status` | Update order status (8-stage timeline) |
| `GET` | `/inventory` | List variant-level stock & low-stock warnings |
| `PATCH` | `/inventory/:variantId` | Adjust variant stock quantity |
| `GET` | `/dashboard/metrics` | KPI stats, sales chart, and category share |
| `GET` | `/customers` | List registered shoppers |
| `GET` | `/coupons` | List promo codes and discount rules |
| `GET` | `/banners` | List homepage promotional banners |
| `POST` | `/upload` | Multer image upload endpoint |

---

## Setup & Running Instructions

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL 18** (running on port 5432)
- **Flutter SDK** (v3.18+)

---

### 2. Run the Node.js + Express Backend
```bash
cd backend
npm install
# (Optional) Run migrations and seed data into PostgreSQL
npm run migrate
npm run seed
# Start the server
npm start
```
The backend starts at **`http://localhost:5000`**.
> *Note:* The backend features an automatic dual-mode architecture. If PostgreSQL is active, it connects to PostgreSQL `dryfruits_db`. If offline, it smoothly switches to local persisted file storage without crashing.

---

### 3. Run the React Admin Panel
```bash
cd admin_panel
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.
- **Admin Email:** `admin@naturale.com`
- **Admin Password:** `admin123`

---

### 4. Run the Flutter Customer App
```bash
cd customer_app
flutter pub get
flutter run -d chrome     # Run in Chrome
# Or run on Android/iOS/Windows:
# flutter run -d windows
```

To run smoke and unit tests:
```bash
cd customer_app
flutter test
```
All tests pass with `0 errors`.

---

## Key Highlights

- **Gram & KG Variant Shopping:** Seamless package sizing (100g, 250g, 500g, 1kg) and custom weight inputs.
- **Complete Visual Identity:** Warm Peach Canvas (`#F2D5C0`), Light Peach (`#F8E5D6`), Cream Cards (`#FFF8EF`), and Orange Highlights (`#FF812E`).
- **Production Clean Architecture:** Decoupled Flutter Riverpod state management, React component modularity with Plain CSS (zero Tailwind), and Node.js Express controllers with PostgreSQL relational pooling.
