# Architecture

Last audited against code: 2026-06-21.

The backend is a layered Express REST API backed by MongoDB through Mongoose.

```text
routes -> controllers -> services -> models
```

## Application Bootstrap

| File | Responsibility |
|------|----------------|
| `server.js` | Loads environment variables, connects MongoDB, verifies SMTP connection, starts HTTP server. |
| `app.js` | Builds Express app, configures middleware, mounts routes, serves uploads, attaches 404 and error handlers. |
| `config/db.js` | Connects Mongoose using `MONGO_URI`. |

## Global Middleware

Registered in `app.js`:

| Middleware | Purpose |
|------------|---------|
| `helmet()` | Security headers |
| `hpp()` | HTTP parameter pollution protection |
| `compression()` | Response compression |
| `express-rate-limit` API limiter | 300 requests per 15 minutes globally |
| `cors({ origin: FRONTEND_URL, credentials: true })` | Browser cookie support from configured frontend origin |
| `express.json({ limit: '100kb' })` | JSON body parsing |
| `cookieParser()` | Reads `accessToken` cookie |
| `express.urlencoded()` | URL-encoded body parsing |
| `express.static('/uploads')` | Serves uploaded files |
| Auth limiter | 10 auth requests per 15 minutes on `/api/v1/auth` |
| Error handler | Uniform JSON error responses |

## Route Mounts

| Mount | Router |
|-------|--------|
| `/api/v1/auth` | `routes/auth.routes.js` |
| `/api/v1/users` | `routes/user.routes.js` |
| `/api/v1/products` | `routes/product.routes.js` |
| `/api/v1/categories` | `routes/category.routes.js` |
| `/api/v1/inventory` | `routes/inventory.routes.js` |
| `/api/v1/cart` | `routes/cart.routes.js` |
| `/api/v1/wishlist` | `routes/wishlist.routes.js` |

## Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| Routes | Declare paths, HTTP methods, middleware order, auth/role checks, validators, upload handling. |
| Controllers | Extract request values, call service functions, choose HTTP status, set/clear auth cookies. |
| Services | Own business rules, database orchestration, cross-service calls, and `AppError` failures. |
| Models | Define schema fields, indexes, constraints, virtuals, hooks, and instance methods. |
| Validators | Reject invalid request shape before controllers. |
| Middleware | Auth, role authorization, validation aggregation, file upload, and global errors. |
| Providers | Isolate SMTP and local storage implementation details. |
| Utils | Stateless shared helpers. |

## Authentication Architecture

- Login signs a JWT with payload `{ userId, role }`.
- The JWT is sent as an HTTP-only cookie named `accessToken`.
- Protected routes use `protect`, which reads the cookie, verifies the token, reloads the user from MongoDB, checks `status === active`, and attaches `req.user`.
- Admin routes use `authorize(USER_ROLES.ADMIN)` after `protect`.
- `loginUser` requires `isEmailVerified` before issuing a token.
- There are no refresh tokens and no server-side JWT revocation.

## Inventory Architecture

Inventory state is stored on Product:

- `stockQuantity`
- `reservedQuantity`
- `lowStockThreshold`

Product virtuals compute:

- `availableStock`
- `inStock`
- `lowStock`
- `inventoryStatus`

Admin stock adjustments create `InventoryHistory` documents. Cart reservations do not create history records.

Atomic improvements implemented:

- `reserveStock` uses `findOneAndUpdate` with an `$expr` check that `stockQuantity - reservedQuantity >= quantity`.
- `commitStock` uses `findOneAndUpdate` requiring `reservedQuantity >= quantity` and decrements both stock and reserved quantities.
- `addItemToCart` attempts to roll back a reservation if cart persistence fails.

Remaining architecture gap:

- Cart and inventory writes are not wrapped in MongoDB transactions.
- Reservation TTL and cleanup jobs do not exist.

## Data Model Summary

| Model | Role |
|-------|------|
| `User` | Identity, credentials, profile, addresses, role/status, verification/reset token hashes |
| `Category` | Product taxonomy |
| `Product` | Catalog, pricing, status, inventory quantities, image gallery |
| `InventoryHistory` | Stock adjustment audit |
| `Cart` | User cart with embedded price-snapshot line items |
| `Wishlist` | User saved products |

See `docs/DATABASE_SCHEMA.md` for exact fields.

## Error Handling

Expected failures use `AppError(message, statusCode, errors)`. Controllers pass errors to `next(error)`. `error.middleware.js` returns a consistent JSON envelope.

Unexpected errors return `500 Internal Server Error`.

## Validation

Validation uses `express-validator` rule chains followed by `validate.middleware.js`, which converts validation failures into `AppError('Validation failed', 400, formattedErrors)`.

Validation is present for auth, users, categories, products, product images, inventory adjustment, cart add/update, and wishlist product params.

Known validation issue: `GET /api/v1/wishlist` currently uses a `productId` param validator even though the route has no `productId`.

## Current Limitations

- No orders, checkout, payments, shipping, reviews, coupons, or analytics modules.
- No automated tests.
- No MongoDB transaction boundaries for cart/inventory.
- No reservation expiration.
- Local disk product uploads are not multi-instance safe.
- No refresh tokens or session revocation.
- No `.env.example`.
