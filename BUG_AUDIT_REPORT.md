# Project Bug Audit Report

**Project:** MERN Sports E-Commerce Platform  
**Audit Date:** 2026-06-22  
**Scope:** Full repository (backend, frontend, configuration, documentation alignment)  
**Mode:** Read-only — no source files were modified

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Total issues found** | **45** |
| Critical | 3 |
| High | 12 |
| Medium | 23 |
| Low | 4 |
| Informational | 3 |

The backend is architecturally sound (Route → Controller → Service → Model) with good patterns in atomic inventory reservation (`reserveStock`, `commitStock`). However, **order and cart flows contain confirmed race conditions and a broken order-detail endpoint**, and the **frontend cannot build** due to missing dependencies and files. Security gaps include session invalidation after password change, upload validation weaknesses, and unescaped MongoDB query inputs on public listing endpoints. There are **no automated tests, no CI/CD, and no deployment configuration**.

---

## Severity Summary Table

| ID | Severity | Category | File | Status |
|----|----------|----------|------|--------|
| #001 | Critical | Race Condition | back-end/services/order.service.js | Found (Not Fixed) |
| #002 | Critical | Build / Runtime Error | front-end/vite.config.js | Found (Not Fixed) |
| #003 | Critical | Build / Runtime Error | front-end/src/App.jsx | Found (Not Fixed) |
| #004 | High | Logic Error | back-end/controllers/order.controller.js | Found (Not Fixed) |
| #005 | High | Security | back-end/services/auth.service.js | Found (Not Fixed) |
| #006 | High | Race Condition | back-end/services/cart.service.js | Found (Not Fixed) |
| #007 | High | Logic Error | back-end/services/inventory.service.js | Found (Not Fixed) |
| #008 | High | Database | back-end/services/inventory.service.js | Found (Not Fixed) |
| #009 | High | Validation | back-end/services/checkout.service.js | Found (Not Fixed) |
| #010 | High | Database | back-end/services/cart.service.js | Found (Not Fixed) |
| #011 | High | Security | back-end/services/product.service.js | Found (Not Fixed) |
| #012 | High | Security | back-end/middleware/upload.middlware.js | Found (Not Fixed) |
| #013 | High | Security | back-end/services/product.service.js | Found (Not Fixed) |
| #014 | High | Reliability | back-end/server.js | Found (Not Fixed) |
| #015 | High | Config | front-end/vite.config.js | Found (Not Fixed) |
| #016 | Medium | Security | back-end/services/auth.service.js | Found (Not Fixed) |
| #017 | Medium | Authentication | back-end/controllers/auth.controller.js | Found (Not Fixed) |
| #018 | Medium | Configuration | back-end/server.js | Found (Not Fixed) |
| #019 | Medium | Security | back-end/utils/api-query.util.js | Found (Not Fixed) |
| #020 | Medium | Security | back-end/utils/api-query.util.js | Found (Not Fixed) |
| #021 | Medium | Security | back-end/services/auth.service.js | Found (Not Fixed) |
| #022 | Medium | Database | back-end/services/inventory.service.js | Found (Not Fixed) |
| #023 | Medium | Logic Error | back-end/services/inventory.service.js | Found (Not Fixed) |
| #024 | Medium | Race Condition | back-end/services/order.service.js | Found (Not Fixed) |
| #025 | Medium | Logic Error | back-end/services/checkout.service.js | Found (Not Fixed) |
| #026 | Medium | Logic Error | back-end/services/product.service.js | Found (Not Fixed) |
| #027 | Medium | Database | back-end/services/product.service.js | Found (Not Fixed) |
| #028 | Medium | Validation | back-end/services/wishlist.service.js | Found (Not Fixed) |
| #029 | Medium | Runtime Error | back-end/services/cart.service.js | Found (Not Fixed) |
| #030 | Medium | Reliability | back-end/services/auth.service.js | Found (Not Fixed) |
| #031 | Medium | Validation | back-end/routes/user.routes.js | Found (Not Fixed) |
| #032 | Medium | Performance | back-end/utils/api-query.util.js | Found (Not Fixed) |
| #033 | Medium | Validation | back-end/utils/api-query.util.js | Found (Not Fixed) |
| #034 | Medium | Deployment | Repository root | Found (Not Fixed) |
| #035 | Medium | Deployment | front-end/ | Found (Not Fixed) |
| #036 | Medium | Deployment | back-end/app.js | Found (Not Fixed) |
| #037 | Medium | Security | back-end/app.js | Found (Not Fixed) |
| #038 | Medium | Config | back-end/package.json | Found (Not Fixed) |
| #039 | Low | Authentication | back-end/validators/auth.validator.js | Found (Not Fixed) |
| #040 | Low | Express | back-end/middleware/auth.middleware.js | Found (Not Fixed) |
| #041 | Low | Error Handling | back-end/middleware/error.middleware.js | Found (Not Fixed) |
| #042 | Low | Maintainability | Multiple files | Found (Not Fixed) |
| #043 | Info | Testing | back-end/package.json | Found (Not Fixed) |
| #044 | Info | Security | back-end/controllers/auth.controller.js | Found (Not Fixed) |
| #045 | Info | Completeness | front-end/src/App.jsx | Found (Not Fixed) |

---

## Detailed Findings

### Issue Number
#001

### Severity
Critical

### Category
Race Condition

### File
back-end/services/order.service.js

### Line Numbers
21–23, 81–83

### Title
Checkout clears cart from a stale snapshot (TOCTOU data loss)

### Problem
`createOrder` calls `validateCheckout()` **outside** the MongoDB transaction, loading the cart once. Inside the transaction it sets `cart.items = []` on that same in-memory document without reloading the cart from the database within the session.

### Why It Is a Problem
If a user adds items to their cart while checkout is in progress, those newly added items are wiped when the order completes. Stock may remain reserved for products that were silently removed from the cart.

### Evidence
```21:23:back-end/services/order.service.js
const createOrder = async (userId, addressId, notes = '') => {
  const { cart, address, subtotal, shippingCost, tax, total } =
    await checkoutService.validateCheckout(userId, addressId);
```

```81:83:back-end/services/order.service.js
      cart.items = [];

      await cart.save({ session });
```

### Reproduction
1. Add product A to cart.  
2. Begin `POST /api/v1/orders` (slow or delayed).  
3. Concurrently add product B via `POST /api/v1/cart/items`.  
4. Order completes → product B disappears from cart; its reservation may remain on the product.

### Suggested Fix (Description Only)
Reload the cart inside `withTransaction` using the session, validate items against live inventory, remove only the lines being ordered, or use optimistic locking / cart version field.

### Confidence
High

---

### Issue Number
#002

### Severity
Critical

### Category
Build / Runtime Error

### File
front-end/vite.config.js

### Line Numbers
3, 7

### Title
Missing `@tailwindcss/vite` dependency prevents Vite from starting

### Problem
`vite.config.js` imports `@tailwindcss/vite`, which is not declared in `front-end/package.json` or `package-lock.json`.

### Why It Is a Problem
Vite fails to load its configuration, blocking both `npm run dev` and `npm run build`.

### Evidence
```3:7:front-end/vite.config.js
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Build verification: `npm run build` exits with `ERR_MODULE_NOT_FOUND: Cannot find package '@tailwindcss/vite'`.

### Reproduction
Run `npm run build` or `npm run dev` in `front-end/`.

### Suggested Fix (Description Only)
Either install `@tailwindcss/vite` and migrate fully to Tailwind v4, or remove the plugin and use the existing Tailwind v3 PostCSS pipeline.

### Confidence
High

---

### Issue Number
#003

### Severity
Critical

### Category
Build / Runtime Error

### File
front-end/src/App.jsx

### Line Numbers
1

### Title
Import references non-existent `App.css`

### Problem
`App.jsx` imports `./App.css`, but no `App.css` file exists anywhere under `front-end/`.

### Why It Is a Problem
After resolving #002, Vite will fail module resolution for the missing stylesheet.

### Evidence
```1:1:front-end/src/App.jsx
import './App.css';
```

Glob search for `App.css` under `front-end/` returns zero files.

### Reproduction
Fix #002, then run `npm run dev` → `Failed to resolve import "./App.css"`.

### Suggested Fix (Description Only)
Create `src/App.css` or remove the unused import.

### Confidence
High

---

### Issue Number
#004

### Severity
High

### Category
Logic Error

### File
back-end/controllers/order.controller.js

### Line Numbers
36–38

### Title
Swapped arguments in `getOrderById` call

### Problem
The controller passes `(userId, orderId)` but the service expects `(orderId, userId)`, causing the MongoDB query to use the user ID as `_id` and the order ID as `user`.

### Why It Is a Problem
Authenticated users cannot retrieve their own order details; every valid request returns 404.

### Evidence
Controller:
```36:38:back-end/controllers/order.controller.js
    const order = await orderService.getOrderById(
      req.user._id,
      req.params.orderId,
```

Service:
```112:116:back-end/services/order.service.js
const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })
```

### Reproduction
Create an order via `POST /api/v1/orders`, then `GET /api/v1/orders/:orderId` → 404.

### Suggested Fix (Description Only)
Swap controller arguments to `getOrderById(req.params.orderId, req.user._id)`.

### Confidence
High

---

### Issue Number
#005

### Severity
High

### Category
Security

### File
back-end/services/auth.service.js, back-end/services/user.service.js, back-end/middleware/auth.middleware.js

### Line Numbers
auth.service.js 159–180; user.service.js 47–66; auth.middleware.js 6–31

### Title
JWT sessions remain valid after password reset or change

### Problem
`resetPassword` and `changePassword` update the password hash but do not invalidate existing JWT cookies. `protect` only verifies signature/expiry and reloads the user — there is no `passwordChangedAt`, token version, or denylist.

### Why It Is a Problem
A stolen session cookie remains usable until JWT expiry (up to 1 hour per `.env.example`) even after the victim changes their password.

### Evidence
No `passwordChangedAt` field exists in `user.model.js`. Password update in `resetPassword`:
```171:176:back-end/services/auth.service.js
  user.password = password;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
```

### Reproduction
Log in → capture `accessToken` cookie → change password → replay old cookie on `GET /api/v1/auth/me` → still authenticated.

### Suggested Fix (Description Only)
Add `passwordChangedAt` to the user model; embed it in JWT claims; reject tokens issued before the last password change. Optionally clear the cookie on reset/change.

### Confidence
High

---

### Issue Number
#006

### Severity
High

### Category
Race Condition

### File
back-end/services/cart.service.js

### Line Numbers
34–36, 46–54

### Title
Concurrent add-to-cart can create duplicate line items

### Problem
The `existingItem` check runs on a cart document loaded **before** the transaction. Two parallel requests adding the same product can both see no existing line and each `push` a new entry. There is no unique constraint on `(user, items.product)`.

### Why It Is a Problem
Duplicate cart lines for one product cause incorrect totals, double stock reservations, and inconsistent checkout behavior.

### Evidence
```34:36:back-end/services/cart.service.js
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );
```

```49:53:back-end/services/cart.service.js
        cart.items.push({
          product: product._id,
          quantity,
          priceSnapshot: product.price,
        });
```

### Reproduction
Send two simultaneous `POST /api/v1/cart/items` with the same `productId` → two separate line items for one product.

### Suggested Fix (Description Only)
Use atomic `findOneAndUpdate` with positional operators, reload cart inside the transaction, or add a partial unique index with retry logic.

### Confidence
High

---

### Issue Number
#007

### Severity
High

### Category
Logic Error

### File
back-end/services/inventory.service.js

### Line Numbers
123–127

### Title
`releaseStock` silently under-releases reserved inventory

### Problem
`releaseAmount = Math.min(quantity, product.reservedQuantity)` clamps the release without error when `quantity > reservedQuantity`. The cart still removes the full quantity.

### Why It Is a Problem
Reservation/cart mismatches leave ghost reservations, reducing available stock for other customers without any alert.

### Evidence
```123:127:back-end/services/inventory.service.js
  const releaseAmount = Math.min(quantity, product.reservedQuantity);

  product.reservedQuantity -= releaseAmount;

  await product.save({ session });
```

### Reproduction
Create state where cart quantity exceeds `reservedQuantity` (via prior bugs or manual DB edit) → remove cart item → reserved quantity not fully released.

### Suggested Fix (Description Only)
Throw if `product.reservedQuantity < quantity`, or use atomic `$inc: { reservedQuantity: -quantity }` with a `$gte` guard in the filter.

### Confidence
High

---

### Issue Number
#008

### Severity
High

### Category
Database

### File
back-end/services/inventory.service.js, back-end/services/product.service.js

### Line Numbers
inventory.service.js 18–28; product.service.js 110–122

### Title
Admin stock changes can make `stockQuantity < reservedQuantity`

### Problem
`adjustInventory` only checks `newQuantity >= 0`. `updateProduct` allows direct writes to `stockQuantity` with no check against `reservedQuantity`.

### Why It Is a Problem
The `availableStock` virtual becomes negative; checkout `commitStock` fails unpredictably; inventory state becomes inconsistent.

### Evidence
```20:24:back-end/services/inventory.service.js
  const newQuantity = previousQuantity + adjustment;

  if (newQuantity < 0) {
    throw new AppError('Insufficient stock', 400);
  }
```

No check for `newQuantity >= product.reservedQuantity`.

### Reproduction
Product with stock 10 and reserved 8 → admin sets stock to 5 → `availableStock = -3`.

### Suggested Fix (Description Only)
Reject adjustments where `newQuantity < product.reservedQuantity`; route all stock changes through inventory service with reservation awareness.

### Confidence
High

---

### Issue Number
#009

### Severity
High

### Category
Validation

### File
back-end/services/checkout.service.js

### Line Numbers
31–47

### Title
Checkout validation does not verify reserved inventory alignment

### Problem
`validateCheckout` checks product existence, deletion status, and active status but does not verify that each cart line's quantity is covered by the product's `reservedQuantity`.

### Why It Is a Problem
Reservation drift surfaces only at `commitStock` inside the order transaction as a generic 400, after the checkout summary already succeeded.

### Evidence
```31:47:back-end/services/checkout.service.js
  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      throw new AppError('Product no longer exists', 400);
    }

    if (product.isDeleted) {
      throw new AppError(`${product.name} is unavailable`, 400);
    }

    if (product.status !== PRODUCT_STATUS.ACTIVE) {
      throw new AppError(`${product.name} is not available`, 400);
    }

    subtotal += item.priceSnapshot * item.quantity;
  }
```

### Reproduction
Create reservation mismatch → `GET /api/v1/checkout/summary` succeeds → `POST /api/v1/orders` fails with "Insufficient reserved inventory".

### Suggested Fix (Description Only)
In `validateCheckout`, verify each line against live `reservedQuantity` and `availableStock`.

### Confidence
High

---

### Issue Number
#010

### Severity
High

### Category
Database

### File
back-end/services/cart.service.js, back-end/services/order.service.js

### Line Numbers
cart.service.js 38–43; order.service.js 35–40

### Title
MongoDB transactions require a replica set

### Problem
Cart and order flows use `mongoose.startSession()` / `withTransaction`, which fail on a standalone MongoDB instance.

### Why It Is a Problem
Local development with default `mongod` (no replica set) cannot add to cart or create orders — core commerce flows are broken in the most common dev setup.

### Evidence
Transaction usage in `cart.service.js` line 38 and `order.service.js` line 35.

### Reproduction
Connect to standalone MongoDB → add to cart or create order → transaction error.

### Suggested Fix (Description Only)
Document replica-set requirement; configure `mongod --replSet` for local dev; or provide a non-transaction fallback for development with clear warnings.

### Confidence
High

---

### Issue Number
#011

### Severity
High

### Category
Security

### File
back-end/services/product.service.js

### Line Numbers
41–45

### Title
Public product listing allows `status` query filter to override hardcoded `active` constraint

### Problem
`getProducts` sets `status: 'active'` then spreads `queryBuilder.getFilters()`, which includes `status` from `req.query`. A client can pass `?status=draft` or `?status=archived` to list non-public products.

### Why It Is a Problem
Draft and archived products become visible on an unauthenticated public endpoint, bypassing intended catalog access control.

### Evidence
```36:45:back-end/services/product.service.js
const getProducts = async (queryParams) => {
  const queryBuilder = new ApiQuery(queryParams)
    .filter(['brand', 'status', 'featured', 'category'])
    .search(['name', 'brand']);

  const filters = {
    isDeleted: false,
    status: 'active',
    ...queryBuilder.getFilters(),
  };
```

Because `status` is in `allowedFilters`, the spread overwrites `'active'`.

### Reproduction
`GET /api/v1/products?status=draft` → returns draft products.

### Suggested Fix (Description Only)
Remove `status` from public allowed filters, or apply user-supplied status only for admin-authenticated routes.

### Confidence
High

---

### Issue Number
#012

### Severity
High

### Category
Security

### File
back-end/middleware/upload.middlware.js, back-end/app.js

### Line Numbers
upload.middlware.js 20–22, 26–32; app.js 73

### Title
Upload validation trusts client MIME type; extension taken from original filename

### Problem
Only `file.mimetype` (client-controlled) is validated. Saved filenames use `path.extname(file.originalname)`, preserving attacker-chosen extensions.

### Why It Is a Problem
Admin-only, but malicious content (HTML/SVG) can be stored under `/uploads/products/` and served publicly via `express.static`, enabling stored content abuse on the API origin.

### Evidence
```26:32:back-end/middleware/upload.middlware.js
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new AppError('Only JPG, PNG and WEBP images are allowed', 400));
  }
  cb(null, true);
};
```

```73:73:back-end/app.js
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

### Reproduction
As admin, upload file with `Content-Type: image/jpeg` and `originalname: payload.html` → served at `/uploads/products/<timestamp>.html`.

### Suggested Fix (Description Only)
Verify magic bytes; whitelist extensions; force safe extensions regardless of original name; serve uploads with restrictive headers or from a separate domain.

### Confidence
High

---

### Issue Number
#013

### Severity
High

### Category
Security

### File
back-end/services/product.service.js

### Line Numbers
103–120, 194–226

### Title
Path traversal risk when deleting product images

### Problem
`deleteProductImage` joins user-supplied `filename` from URL params via `path.join` without path containment validation. `updateProduct` allows direct mutation of the `images` array without structure validation.

### Why It Is a Problem
A compromised admin account could delete files outside `uploads/products/` (e.g., `../../package.json`).

### Evidence
```224:226:back-end/services/product.service.js
  const filePath = path.join(process.cwd(), 'uploads', 'products', filename);

  await deleteFile(filePath);
```

DELETE route has no filename param validator in `product.validator.js`.

### Reproduction
As admin, PATCH product with malicious `images[].filename`, then DELETE `/:id/images/../../package.json`.

### Suggested Fix (Description Only)
Resolve path and verify it stays under `uploads/products/`; validate filename with strict allowlist regex; disallow unvalidated direct `images` PATCH.

### Confidence
High

---

### Issue Number
#014

### Severity
High

### Category
Reliability

### File
back-end/server.js

### Line Numbers
13

### Title
Server startup blocked by SMTP verification failure

### Problem
`startServer` calls `await emailProvider.verifyConnection()` before listening. If SMTP credentials are wrong or the mail server is unreachable, the entire API fails to start.

### Why It Is a Problem
Non-email endpoints (catalog, health check, cart read) become unavailable due to email infrastructure failure.

### Evidence
```9:17:back-end/server.js
const startServer = async () => {
  try {
    await connectDB();

    await emailProvider.verifyConnection();
    app.set('trust proxy', 1);
    app.listen(PORT, () => {
```

### Reproduction
Start server with invalid `EMAIL_*` env vars → startup exits with error; no HTTP listener.

### Suggested Fix (Description Only)
Make email verification non-blocking at startup (log warning, retry in background); fail only on first send attempt or use a feature flag.

### Confidence
High

---

### Issue Number
#015

### Severity
High

### Category
Config

### File
front-end/vite.config.js, front-end/postcss.config.js, front-end/src/index.css

### Line Numbers
vite.config.js 3–7; index.css 1–3; postcss.config.js 1–6

### Title
Incompatible Tailwind v3 and v4 configuration mixed

### Problem
Project uses Tailwind **v3** patterns (`@tailwind` directives, `tailwind.config.js`, PostCSS plugin) while Vite config targets Tailwind **v4** (`@tailwindcss/vite`).

### Why It Is a Problem
Even after installing the missing package, conflicting pipelines may prevent utility classes (e.g., `text-4xl` in `App.jsx`) from compiling correctly.

### Evidence
```1:3:front-end/src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

vs. `@tailwindcss/vite` in `vite.config.js` with `tailwindcss: ^3.4.19` in `package.json`.

### Reproduction
Resolve #002 → styles may be missing or build may emit warnings/errors depending on resolution path.

### Suggested Fix (Description Only)
Choose one stack: v3 (drop Vite Tailwind plugin, keep PostCSS) or v4 (add `@tailwindcss/vite`, replace CSS directives, remove PostCSS Tailwind plugin).

### Confidence
High

---

### Issue Number
#016

### Severity
Medium

### Category
Security

### File
back-end/services/auth.service.js

### Line Numbers
8–13

### Title
Registration reveals whether an email is already registered

### Problem
Duplicate registration returns HTTP 409 with `"Email already exists"` instead of a generic response.

### Why It Is a Problem
Enables email enumeration for targeted phishing or credential-stuffing attacks.

### Evidence
```8:13:back-end/services/auth.service.js
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }
```

### Reproduction
`POST /api/v1/auth/register` with known email → 409; unknown email → 201.

### Suggested Fix (Description Only)
Return identical 201 response regardless; optionally re-send verification for unverified existing accounts.

### Confidence
High

---

### Issue Number
#017

### Severity
Medium

### Category
Authentication

### File
back-end/controllers/auth.controller.js

### Line Numbers
22–27

### Title
Cookie `maxAge` becomes `NaN` when `COOKIE_EXPIRES_IN` is unset

### Problem
`maxAge` is computed as `process.env.COOKIE_EXPIRES_IN * 60 * 1000` without validation. Missing env var produces `NaN`.

### Why It Is a Problem
Session cookies behave unpredictably across browsers; JWT and cookie expiry can desynchronize.

### Evidence
```22:27:back-end/controllers/auth.controller.js
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: process.env.COOKIE_EXPIRES_IN * 60 * 1000,
    });
```

### Reproduction
Omit `COOKIE_EXPIRES_IN` from `.env` → login → inspect `Set-Cookie` for invalid `Max-Age`.

### Suggested Fix (Description Only)
Validate at startup; parse with `Number()` and default to a value aligned with `JWT_EXPIRES_IN`.

### Confidence
High

---

### Issue Number
#018

### Severity
Medium

### Category
Configuration

### File
back-end/server.js, back-end/utils/jwt.util.js

### Line Numbers
server.js 9–22; jwt.util.js 4–7

### Title
No startup validation for `JWT_SECRET` and other critical auth env vars

### Problem
`MONGO_URI` is validated at startup, but `JWT_SECRET`, `FRONTEND_URL`, and `COOKIE_EXPIRES_IN` are not. Missing `JWT_SECRET` causes runtime 500 on login and misleading 401 on protected routes.

### Why It Is a Problem
Misconfigured deployments fail at runtime with confusing errors instead of failing fast at boot.

### Evidence
`db.js` validates `MONGO_URI`; `server.js` has no equivalent for JWT/auth vars.

### Reproduction
Start server without `JWT_SECRET` → login returns 500; protected routes return 401.

### Suggested Fix (Description Only)
Add startup env validation module that exits if required auth vars are missing or weak in production.

### Confidence
High

---

### Issue Number
#019

### Severity
Medium

### Category
Security

### File
back-end/utils/api-query.util.js

### Line Numbers
12–16

### Title
Unescaped user input in MongoDB `$regex` (ReDoS)

### Problem
The `search` query parameter is passed directly as a MongoDB regex pattern with no escaping or length cap.

### Why It Is a Problem
Public `GET /api/v1/products?search=...` can be abused for ReDoS against MongoDB.

### Evidence
```12:16:back-end/utils/api-query.util.js
    this.filters.$or = fields.map((field) => ({
      [field]: {
        $regex: this.queryParams.search,
        $options: 'i',
      },
    }));
```

### Reproduction
Send `GET /api/v1/products?search=(a%2B)%2B` repeatedly → elevated CPU on DB/server.

### Suggested Fix (Description Only)
Escape regex metacharacters, cap search length, or use MongoDB `$text` search.

### Confidence
High

---

### Issue Number
#020

### Severity
Medium

### Category
Security

### File
back-end/utils/api-query.util.js

### Line Numbers
22–27

### Title
Unvalidated query filter values passed to MongoDB filters

### Problem
Values for `brand`, `status`, `featured`, and `category` are copied directly from `req.query` without type coercion or operator sanitization.

### Why It Is a Problem
Object-style operators (e.g., `category[$ne]=...`) may reach MongoDB and alter query logic on public endpoints.

### Evidence
```22:27:back-end/utils/api-query.util.js
  filter(allowedFilters = []) {
    allowedFilters.forEach((field) => {
      if (this.queryParams[field] !== undefined) {
        this.filters[field] = this.queryParams[field];
      }
    });
```

### Reproduction
`GET /api/v1/products?category[$ne]=null` and observe whether filter constraints are bypassed.

### Suggested Fix (Description Only)
Accept only scalar strings; validate `category` as MongoId; reject keys containing `$` or object values.

### Confidence
Medium

---

### Issue Number
#021

### Severity
Medium

### Category
Security

### File
back-end/services/auth.service.js

### Line Numbers
36, 136

### Title
Verification and reset tokens embedded in URL query strings

### Problem
Raw tokens appear in email URLs (`?token=...`), exposing them to browser history, referrer headers, proxy logs, and analytics.

### Why It Is a Problem
URL token leakage is a common real-world exposure vector for reset/verify flows.

### Evidence
```36:36:back-end/services/auth.service.js
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
```

### Reproduction
Complete forgot-password flow → inspect email link and server access logs.

### Suggested Fix (Description Only)
Use POST-from-frontend pattern, URL fragments, or short-lived one-time codes; ensure tokens are never logged.

### Confidence
High

---

### Issue Number
#022

### Severity
Medium

### Category
Database

### File
back-end/services/inventory.service.js

### Line Numbers
26–37

### Title
`adjustInventory` is not transactional

### Problem
Product save and `InventoryHistory.create` are separate writes with no shared session.

### Why It Is a Problem
If history insert fails after product save, stock changes without an audit trail.

### Evidence
```26:37:back-end/services/inventory.service.js
  product.stockQuantity = newQuantity;

  await product.save();

  await InventoryHistory.create({
    product: product._id,
    previousQuantity,
    newQuantity,
    adjustment,
    reason,
    adjustedBy: userId,
  });
```

### Suggested Fix (Description Only)
Wrap both operations in a MongoDB transaction.

### Confidence
High

---

### Issue Number
#023

### Severity
Medium

### Category
Logic Error

### File
back-end/services/inventory.service.js, back-end/services/cart.service.js

### Line Numbers
inventory.service.js 76–107

### Title
No reservation TTL or abandoned-cart cleanup

### Problem
Stock reservations created by cart operations never expire. Abandoned carts hold inventory indefinitely.

### Why It Is a Problem
Popular products can appear out of stock while stock sits reserved in inactive carts.

### Evidence
No expiry metadata, cron job, or TTL mechanism exists for reservations.

### Suggested Fix (Description Only)
Add reservation timestamps and a scheduled cleanup job, or implement cart TTL with automatic release.

### Confidence
High

---

### Issue Number
#024

### Severity
Medium

### Category
Race Condition

### File
back-end/services/order.service.js

### Line Numbers
21–92

### Title
No idempotency on order creation

### Problem
Duplicate `POST /api/v1/orders` requests can race. The second usually fails at `commitStock`, but the client receives errors with poor UX and potential partial side effects depending on timing.

### Why It Is a Problem
Double-click or network retry during checkout creates confusing failure states.

### Evidence
No idempotency key, deduplication table, or client token in order creation flow.

### Suggested Fix (Description Only)
Accept `Idempotency-Key` header and store request outcomes.

### Confidence
Medium

---

### Issue Number
#025

### Severity
Medium

### Category
Logic Error

### File
back-end/services/checkout.service.js

### Line Numbers
49–52

### Title
Shipping and tax hardcoded to zero

### Problem
`shippingCost = 0` and `tax = 0` are hardcoded; no calculation based on address or rules.

### Why It Is a Problem
Order totals are incorrect for any real commerce scenario; downstream payment integration will require schema changes.

### Evidence
```49:52:back-end/services/checkout.service.js
  const shippingCost = 0;
  const tax = 0;

  const total = subtotal + shippingCost + tax;
```

### Suggested Fix (Description Only)
Implement shipping/tax calculation services; persist computed values on the order.

### Confidence
High

---

### Issue Number
#026

### Severity
Medium

### Category
Logic Error

### File
back-end/services/product.service.js

### Line Numbers
127–139

### Title
Product archive does not release cart reservations

### Problem
`archiveProduct` sets `isDeleted` and `status: 'archived'` but does not release reservations or remove cart lines for that product.

### Why It Is a Problem
Users with archived products in cart cannot checkout; they must manually remove items to release stock.

### Evidence
```134:137:back-end/services/product.service.js
  product.isDeleted = true;
  product.status = 'archived';

  await product.save();
```

### Suggested Fix (Description Only)
On archive, release reservations across all carts containing the product or auto-remove those cart lines.

### Confidence
Medium

---

### Issue Number
#027

### Severity
Medium

### Category
Database

### File
back-end/services/product.service.js, back-end/services/category.service.js

### Line Numbers
product.service.js 11–13; category.service.js 8–10

### Title
Uniqueness checks ignore soft-deleted records

### Problem
`Product.findOne({ sku })` and `Category.findOne({ name })` do not filter `isDeleted: false`.

### Why It Is a Problem
Archived product SKUs and category names cannot be reused without manual database cleanup.

### Evidence
```11:13:back-end/services/product.service.js
  const existingSku = await Product.findOne({
    sku: productData.sku,
  });
```

### Suggested Fix (Description Only)
Use partial unique indexes excluding deleted records, or scope queries with `isDeleted: false`.

### Confidence
High

---

### Issue Number
#028

### Severity
Medium

### Category
Validation

### File
back-end/services/wishlist.service.js

### Line Numbers
46–58

### Title
Wishlist returns inactive or deleted products

### Problem
`getMyWishlist` populates all referenced products without filtering by `isDeleted` or `status`.

### Why It Is a Problem
Users see unavailable products in their wishlist with no indication they cannot purchase them.

### Evidence
```46:49:back-end/services/wishlist.service.js
const getMyWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({
    user: userId,
  }).populate('products', 'name slug price images');
```

### Suggested Fix (Description Only)
Add populate `match: { isDeleted: false, status: 'active' }` or post-filter stale entries.

### Confidence
High

---

### Issue Number
#029

### Severity
Medium

### Category
Runtime Error

### File
back-end/services/cart.service.js, back-end/services/wishlist.service.js

### Line Numbers
cart.service.js 27–31; wishlist.service.js 23–27

### Title
Concurrent cart/wishlist creation throws unhandled duplicate key error

### Problem
`user` field is unique on Cart and Wishlist models. Parallel first requests can both attempt `create`, causing MongoDB E11000 → 500.

### Why It Is a Problem
Race on first cart/wishlist access returns internal server error instead of graceful retry.

### Evidence
```27:31:back-end/services/cart.service.js
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }
```

`auth.service.js` handles E11000 on registration; cart/wishlist do not.

### Reproduction
Two simultaneous first cart requests for the same user → one returns 500.

### Suggested Fix (Description Only)
Catch E11000 and retry `findOne`, or use upsert.

### Confidence
Medium

---

### Issue Number
#030

### Severity
Medium

### Category
Reliability

### File
back-end/services/auth.service.js

### Line Numbers
38–46

### Title
Registration succeeds even when verification email fails to send

### Problem
Email send failure is caught and logged, but registration still returns 201. The user cannot log in without email verification.

### Why It Is a Problem
Users are stranded in an unverified state with no way to log in and no resend-verification endpoint.

### Evidence
```38:46:back-end/services/auth.service.js
  try {
    await emailService.sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationUrl,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
```

### Reproduction
Register with valid data but broken SMTP → 201 response → login returns 403 "Please verify your email".

### Suggested Fix (Description Only)
Return error or queue retry on send failure; add resend-verification endpoint.

### Confidence
High

---

### Issue Number
#031

### Severity
Medium

### Category
Validation

### File
back-end/routes/user.routes.js, back-end/validators/auth.validator.js

### Line Numbers
user.routes.js 36–42; auth.validator.js 165–211

### Title
Address PATCH requires all fields (not partial update)

### Problem
`PATCH /api/v1/users/addresses/:addressId` uses the same `addressValidation` as POST, which requires `street`, `city`, `state`, `zipCode`, and `country` to all be non-empty.

### Why It Is a Problem
Partial address updates (e.g., changing only `city`) fail validation with 400.

### Evidence
```36:42:back-end/routes/user.routes.js
router.patch(
  '/addresses/:addressId',
  protect,
  addressIdValidation,
  addressValidation,
  validate,
  updateAddress,
);
```

All address fields in `addressValidation` use `.notEmpty()`.

### Reproduction
`PATCH /api/v1/users/addresses/:id` with `{ "city": "Boston" }` only → 400 Validation failed.

### Suggested Fix (Description Only)
Create separate optional-field validation for PATCH, mirroring `updateProfileValidation`.

### Confidence
High

---

### Issue Number
#032

### Severity
Medium

### Category
Performance

### File
back-end/utils/api-query.util.js

### Line Numbers
36–47

### Title
Unbounded pagination `limit` parameter

### Problem
`getPagination()` accepts any numeric `limit` from query string with no maximum cap.

### Why It Is a Problem
`?limit=1000000` on public listing endpoints can cause excessive memory use and slow queries (DoS vector).

### Evidence
```39:39:back-end/utils/api-query.util.js
    const limit = Number(this.queryParams.limit) || 10;
```

No upper bound check.

### Reproduction
`GET /api/v1/products?limit=999999` → large result set loaded into memory.

### Suggested Fix (Description Only)
Cap `limit` at a reasonable maximum (e.g., 100).

### Confidence
High

---

### Issue Number
#033

### Severity
Medium

### Category
Validation

### File
back-end/utils/api-query.util.js

### Line Numbers
50–52

### Title
Unvalidated `sort` query parameter passed to Mongoose

### Problem
`getSort()` returns the raw `req.query.sort` value with no allowlist of permitted fields.

### Why It Is a Problem
Clients can sort by arbitrary fields (including internal ones if present), cause unexpected query behavior, or trigger errors.

### Evidence
```50:52:back-end/utils/api-query.util.js
  getSort() {
    return this.queryParams.sort || '-createdAt';
  }
```

### Reproduction
`GET /api/v1/products?sort=password` or `?sort=$where` → unexpected behavior or error.

### Suggested Fix (Description Only)
Allowlist sortable fields; reject values containing `$` or non-alphanumeric characters.

### Confidence
Medium

---

### Issue Number
#034

### Severity
Medium

### Category
Deployment

### File
Repository root

### Line Numbers
N/A

### Title
No Docker, CI/CD, or deployment configuration

### Problem
No `Dockerfile`, `docker-compose`, `.github/workflows`, or platform deployment manifests exist.

### Why It Is a Problem
No reproducible builds, no automated lint/test gates, no documented deployment path.

### Evidence
Glob search for `docker*`, `.github/**`, CI YAML files → zero results.

### Reproduction
Search repository for deployment artifacts → none found.

### Suggested Fix (Description Only)
Add CI pipeline (lint + build), Dockerfile or platform config, SPA fallback routing for future client-side routes.

### Confidence
High

---

### Issue Number
#035

### Severity
Medium

### Category
Deployment

### File
front-end/

### Line Numbers
N/A

### Title
No front-end environment configuration for API integration

### Problem
No `.env.example`, no `import.meta.env` usage, no Vite dev proxy for `/api`. Backend expects cookie auth with CORS credentials.

### Why It Is a Problem
Future API integration will require hardcoded URLs; cross-origin cookie auth needs aligned `FRONTEND_URL` and `withCredentials`.

### Evidence
Grep for `VITE_` / `import.meta.env` in `front-end/` → no matches. Backend CORS at `app.js` lines 51–55 requires `FRONTEND_URL`.

### Suggested Fix (Description Only)
Add `front-end/.env.example` with `VITE_API_URL`; configure axios with `withCredentials: true`; optional Vite dev proxy.

### Confidence
High

---

### Issue Number
#036

### Severity
Medium

### Category
Deployment

### File
back-end/app.js

### Line Numbers
73

### Title
Backend does not serve built front-end assets

### Problem
Express only serves `/uploads` statically; no route for SPA `dist/` or `index.html` fallback.

### Why It Is a Problem
Single-origin deployment (API + UI on one host) is unsupported without additional configuration.

### Evidence
```73:73:back-end/app.js
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

### Suggested Fix (Description Only)
Serve `front-end/dist` in production with SPA fallback, or document separate static hosting + CORS strategy.

### Confidence
High

---

### Issue Number
#037

### Severity
Medium

### Category
Security

### File
back-end/app.js

### Line Numbers
51–55

### Title
CORS origin depends on unset `FRONTEND_URL` in production

### Problem
`cors({ origin: process.env.FRONTEND_URL, credentials: true })` — if `FRONTEND_URL` is missing, credentialed requests from the SPA fail.

### Why It Is a Problem
Cookie-based JWT auth requires an explicitly allowed origin; misconfiguration blocks all authenticated API calls from the browser.

### Evidence
```51:55:back-end/app.js
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
```

### Reproduction
Start backend without `FRONTEND_URL` → browser credentialed fetch → CORS error.

### Suggested Fix (Description Only)
Validate `FRONTEND_URL` at startup; support environment-specific values.

### Confidence
High

---

### Issue Number
#038

### Severity
Medium

### Category
Config

### File
back-end/package.json

### Line Numbers
5, 8

### Title
`main` field points to non-existent `index.js`

### Problem
`"main": "index.js"` but entry point is `server.js`; no `index.js` exists.

### Why It Is a Problem
Breaks tooling that resolves package entry (some deploy platforms, programmatic requires).

### Evidence
```5:8:back-end/package.json
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
```

### Suggested Fix (Description Only)
Set `"main": "server.js"` or add an `index.js` re-export.

### Confidence
High

---

### Issue Number
#039

### Severity
Low

### Category
Authentication

### File
back-end/validators/auth.validator.js

### Line Numbers
16–22, 45–51

### Title
Inconsistent email normalization between register and login

### Problem
Register uses `.normalizeEmail()`; login only trims and validates format. User model lowercases on save, but login queries with raw submitted casing.

### Why It Is a Problem
Users registering with mixed-case email may be unable to log in unless they match exact stored casing behavior.

### Evidence
Register validator includes `.normalizeEmail()` at line 18; login validator does not.

### Reproduction
Register with `User@Example.com` → login with same mixed-case email → possible 401 depending on normalization path.

### Suggested Fix (Description Only)
Apply `.normalizeEmail()` consistently on login and all email lookups.

### Confidence
High

---

### Issue Number
#040

### Severity
Low

### Category
Express

### File
back-end/middleware/auth.middleware.js

### Line Numbers
34–40

### Title
`authorize()` assumes `req.user` exists without guard

### Problem
`authorize` reads `req.user.role` without checking `req.user`, causing TypeError → 500 if `protect` is omitted.

### Why It Is a Problem
Misconfigured routes fail with internal errors rather than explicit 401/403; defense-in-depth gap.

### Evidence
```34:40:back-end/middleware/auth.middleware.js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
};
```

Current routes always pair `protect` before `authorize`.

### Suggested Fix (Description Only)
Add `if (!req.user) return next(new AppError('Authentication required', 401))`.

### Confidence
High

---

### Issue Number
#041

### Severity
Low

### Category
Error Handling

### File
back-end/middleware/error.middleware.js

### Line Numbers
4–31

### Title
Mongoose errors not mapped to appropriate HTTP status codes

### Problem
Only `multer.MulterError` and `AppError` get structured handling. Mongoose `CastError`, `ValidationError`, and duplicate key errors fall through to generic 500.

### Why It Is a Problem
Invalid ObjectIds and validation failures return 500 instead of 400; full stack traces logged for expected errors.

### Evidence
Error handler has two branches: `AppError` and catch-all 500 with `console.error('[UNEXPECTED ERROR]', err)`.

### Reproduction
Hit endpoint with malformed ID where no route validator runs → 500 instead of 400.

### Suggested Fix (Description Only)
Map Mongoose error types to 4xx responses; use structured logging with severity levels.

### Confidence
High

---

### Issue Number
#042

### Severity
Low

### Category
Maintainability

### File
Multiple files

### Line Numbers
order.service.js 5–6, 19; cart.controller.js 6; order.controller.js 37

### Title
Unused imports and inconsistent `req.user.id` vs `req.user._id`

### Problem
`order.service.js` imports `Product`, `User`, and `PRODUCT_STATUS` but never uses them. Cart/wishlist controllers use `req.user.id` while order controllers use `req.user._id`.

### Why It Is a Problem
Dead code adds noise; inconsistent ID accessors increase future bug risk (both work today via Mongoose document API).

### Evidence
```5:6:back-end/services/order.service.js
const Product = require('../models/product.model');
const User = require('../models/user.model');
```

```6:6:back-end/controllers/cart.controller.js
      req.user.id,
```

```6:6:back-end/controllers/order.controller.js
      req.user._id,
```

### Suggested Fix (Description Only)
Remove unused imports; standardize on `_id` or `id` across all controllers.

### Confidence
High

---

### Issue Number
#043

### Severity
Info

### Category
Testing

### File
back-end/package.json

### Line Numbers
7

### Title
No automated test suite

### Problem
`npm test` is a placeholder that always exits with code 1.

### Why It Is a Problem
Regressions in inventory, cart, and order flows (which have confirmed bugs) will go undetected.

### Evidence
```7:7:back-end/package.json
    "test": "echo \"Error: no test specified\" && exit 1",
```

### Suggested Fix (Description Only)
Add integration tests for auth, cart, inventory, checkout, and order flows.

### Confidence
High

---

### Issue Number
#044

### Severity
Info

### Category
Security

### File
back-end/controllers/auth.controller.js, back-end/app.js

### Line Numbers
auth.controller.js 22–27

### Title
Cookie-based auth without explicit CSRF tokens (mitigated by SameSite)

### Problem
State-changing endpoints use HTTP-only cookies but no CSRF token mechanism.

### Why It Is a Problem
`sameSite: 'strict'` mitigates most cross-site cookie submission; residual risk exists if SameSite policy changes or same-site XSS is introduced.

### Evidence
Cookie set with `sameSite: 'strict'`; no CSRF library in codebase.

### Suggested Fix (Description Only)
Consider CSRF tokens for defense-in-depth if SameSite policy ever relaxes.

### Confidence
High

---

### Issue Number
#045

### Severity
Info

### Category
Completeness

### File
front-end/src/App.jsx

### Line Numbers
1–9

### Title
Frontend is a scaffold with no API integration

### Problem
Single static heading component; no routing, auth UI, catalog, cart, or checkout flows.

### Why It Is a Problem
Expected per project documentation; blocks all customer-facing e-commerce functionality.

### Evidence
```3:6:front-end/src/App.jsx
function App() {
  return (
    <div className='text-4xl font-bold text-blue-500'>MERN E-Commerce</div>
  );
}
```

### Suggested Fix (Description Only)
Implement catalog, auth, cart, and checkout UI per project roadmap.

### Confidence
High

---

## Priority Recommendations

### Critical
1. **#001** — Fix order cart-clearing TOCTOU race (reload cart inside transaction; do not blind `cart.items = []`).
2. **#002 / #003** — Unblock frontend build (resolve Tailwind stack conflict #015; add missing `App.css` or remove import).

### High
3. **#004** — Fix swapped `getOrderById` arguments (one-line fix, immediate user impact).
4. **#005** — Invalidate JWT sessions on password change/reset.
5. **#006** — Fix concurrent cart duplicate line items.
6. **#007 / #008** — Harden `releaseStock` and stock adjustment guards against `reservedQuantity`.
7. **#009** — Add inventory verification to checkout validation.
8. **#010** — Document/configure MongoDB replica set for local dev.
9. **#011** — Remove `status` from public product filter allowlist.
10. **#012 / #013** — Harden file upload and deletion (magic bytes, path containment).
11. **#014** — Decouple server startup from SMTP verification.
12. **#015** — Unify Tailwind v3 or v4 configuration.

### Medium
13. **#016–#021** — Auth hardening (email enumeration, cookie maxAge, env validation, query sanitization, token URLs).
14. **#022–#030** — Inventory/cart reliability (transactions, TTL, idempotency, email failure handling).
15. **#031–#033** — Validation gaps (partial address PATCH, pagination cap, sort allowlist).
16. **#034–#038** — Deployment readiness (CI/CD, env config, static serving, CORS validation).

### Low
17. **#039–#042** — Code quality (email normalization, authorize guard, error handler, import/ID consistency).

---

## Overall Project Health

### Overall code quality assessment
The backend demonstrates **good architectural discipline**: clear separation of routes, controllers, services, and models; consistent use of `express-validator`; bcrypt password hashing; hashed email/reset tokens; HTTP-only cookies with `sameSite: 'strict'`; rate limiting; and atomic inventory operations for reserve/commit. Code is readable and follows predictable patterns. However, **concurrency handling in cart/order flows is insufficient** for a production e-commerce system, and the frontend is a **non-functional scaffold**.

### Main architectural concerns
- **Cart and order flows load documents outside transactions** then mutate them inside, creating TOCTOU races (#001, #006).
- **Inventory release logic is permissive** rather than fail-fast (#007), compounding race-related inconsistencies.
- **No reservation expiry mechanism** (#023) will cause inventory lock-up at scale.
- **Email verification is a hard gate for login** but email delivery is best-effort (#030) with no resend endpoint.
- **Frontend and backend are completely decoupled** with no integration layer, env config, or deployment strategy.

### Most risky modules
| Module | Risk |
|--------|------|
| `order.service.js` | TOCTOU cart clear (#001), broken detail lookup (#004), no idempotency (#024) |
| `cart.service.js` | Duplicate line race (#006), E11000 on create (#029), transaction dependency (#010) |
| `inventory.service.js` | Silent under-release (#007), reservation vs stock mismatch (#008), no TTL (#023) |
| `product.service.js` | Public status filter bypass (#011), path traversal (#013), upload trust (#012) |
| `auth.service.js` | Session invalidation gap (#005), email enumeration (#016), silent email failure (#030) |
| `front-end/` | Cannot build (#002, #003), no API integration (#045) |

### Security observations
**Strengths:** bcrypt hashing, hashed tokens at rest, generic forgot-password response, admin route protection (`protect` + `authorize`), Helmet/HPP/compression, body size limits, CORS with credentials scoped to `FRONTEND_URL`, auth rate limiting.

**Weaknesses:** No session invalidation after password change (#005); public product status filter bypass (#011); unescaped `$regex` search (#019); potential NoSQL operator injection (#020); upload MIME spoofing (#012); path traversal on image delete (#013); tokens in URL query strings (#021); missing startup secret validation (#018).

### Performance observations
- Unbounded pagination limit (#032) is a DoS vector on public endpoints.
- ReDoS via `$regex` search (#019) can elevate MongoDB CPU.
- Abandoned cart reservations (#023) reduce effective inventory without time bound.
- Global API rate limit (300 req/15 min) is reasonable; auth limit (10 req/15 min) is appropriate.

### Reliability observations
- Server startup depends on SMTP (#014) — single point of failure.
- MongoDB transactions require replica set (#010) — breaks default local dev.
- Registration can succeed without deliverable verification email (#030).
- No automated tests (#043) — confirmed bugs would not be caught by CI.
- Order detail endpoint is completely broken (#004).

### Technical debt assessment
**High debt areas:** cart/order concurrency, frontend build pipeline, deployment infrastructure, test coverage, reservation lifecycle management, commerce completeness (shipping/tax/payments/admin orders).

**Low debt areas:** auth foundation, catalog CRUD, category management, wishlist, email templating, validation middleware pattern, API versioning.

**Documentation drift:** `docs/PROJECT_OVERVIEW.md` references an order boot failure from a wrong import path that is already fixed in `app.js` (line 17 correctly imports `./routes/order.routes`). Docs also reference files that do not exist in the frontend tree (`App.css`, `favicon.svg`).

---

*End of report. No source files were modified during this audit.*
