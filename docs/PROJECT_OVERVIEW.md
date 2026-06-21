# Project Overview

Last audited against code: 2026-06-21.

This document is the high-context seed for developers and LLM agents working on this repository. It explains what exists today, the intended architecture, coding standards, implementation goals, and the prioritized roadmap for turning the project into a production-ready sports e-commerce platform.

## Product Vision

The project is a MERN sports e-commerce platform. The intended product is a full online sports retail store where customers can:

- Register, verify email, log in, and manage profile details.
- Browse categories and active products.
- View product images, prices, stock state, and product details.
- Add products to cart with inventory reservations.
- Save products to a wishlist.
- Checkout, pay, track orders, request returns, and review products in future phases.

Administrators should eventually be able to:

- Manage categories, products, images, and inventory.
- View inventory history and low-stock state.
- Manage orders, fulfillment, returns, refunds, coupons, analytics, and users.

## Repository Status

| Area | Path | Stack | Status |
|------|------|-------|--------|
| Backend API | `back-end/` | Node.js, Express 5, MongoDB, Mongoose | Substantially implemented |
| Frontend | `front-end/` | React 19, Vite, Tailwind CSS | Scaffold only |
| Documentation | `docs/` | Markdown | Current audit docs exist |

The backend is the primary implemented system. The frontend is currently a scaffold and should be treated as future implementation work.

## Intended Architecture

The backend follows a layered, domain-sliced architecture:

```text
HTTP request
  -> routes
  -> middleware / validators
  -> controllers
  -> services
  -> models / providers
  -> JSON response
```

### Layer Responsibilities

| Layer | Folder | Responsibility |
|-------|--------|----------------|
| Routes | `back-end/routes/` | Define HTTP methods, paths, middleware order, validators, auth/role requirements. |
| Controllers | `back-end/controllers/` | Thin HTTP adapters. Extract request values, call services, set response status/envelope, set/clear cookies. |
| Services | `back-end/services/` | Business rules, database orchestration, cross-module workflows, expected `AppError` failures. |
| Models | `back-end/models/` | Mongoose schemas, indexes, hooks, virtuals, instance methods, relationships. |
| Validators | `back-end/validators/` | `express-validator` rule chains for request shape and format. |
| Middleware | `back-end/middleware/` | Authentication, authorization, validation aggregation, upload handling, global errors. |
| Constants | `back-end/constants/` | Shared enum values and limits. |
| Utils | `back-end/utils/` | Stateless helpers for errors, JWTs, passwords, query parsing, files, tokens. |
| Providers | `back-end/providers/` | External adapters such as SMTP and local storage. |
| Templates | `back-end/templates/` | HTML email templates. |

### Architectural Rules

- Keep controllers thin. Put decisions and workflows in services.
- Do not query Mongoose models from controllers.
- Do not put business rules in route files.
- Use validators for input shape; use services for database-backed business checks.
- Use `AppError` for expected operational errors.
- Use constants for roles, statuses, reasons, and limits.
- Preserve the existing route/controller/service/model pattern for all new modules.
- Add new commerce workflows as service orchestration, not as model hooks.
- Use MongoDB transactions for future money, order, inventory, and payment workflows.

## Current Folder Structure

```text
back-end/
|-- app.js
|-- server.js
|-- config/
|-- constants/
|-- controllers/
|-- middleware/
|-- models/
|-- providers/
|-- routes/
|-- services/
|-- templates/
|-- utils/
`-- validators/

front-end/
|-- public/
`-- src/

docs/
|-- API_REFERENCE.md
|-- DATABASE_SCHEMA.md
|-- ROADMAP.md
|-- PROJECT_OVERVIEW.md
`-- module-specific documentation
```

See `docs/FOLDER_STRUCTURE.md` for the full audited file tree.

## Current Backend Modules

| Module | Status | Current capability |
|--------|--------|--------------------|
| Authentication | Implemented | Register, login, logout, current user, email verification, forgot password, reset password. Uses cookie-based JWT auth. Login requires verified email. |
| Users | Implemented | Profile read/update, phone field support, address CRUD, change password. |
| Categories | Implemented | CRUD, slug generation, status, soft delete, restore, products-by-category. |
| Products | Implemented | CRUD, active public catalog, soft delete, restore, status lifecycle, image gallery, primary image, reorder, alt text, inventory fields. |
| Inventory | Partially implemented | Adjustment, history, summary, atomic reservation, release, atomic commit primitive. Missing order integration and reservation TTL. |
| Cart | Implemented with limitations | Add, get, update quantity, remove, clear, price snapshots, inventory reservation/release. No guest cart or reservation expiration. |
| Wishlist | Implemented with limitation | Get, add, remove, product validation. `GET /wishlist` currently has an incorrect `productId` validator. |

## Authentication Model

Implemented:

- JWT access token stored in an HTTP-only cookie named `accessToken`.
- JWT expiry controlled by `JWT_EXPIRES_IN`, default `1h`.
- Cookie lifetime controlled by `COOKIE_EXPIRES_IN` in minutes.
- `protect` middleware reads cookie, verifies JWT, reloads user from DB, checks `status === active`.
- `authorize` middleware enforces admin-only routes.
- Registration generates hashed email verification token.
- Login is blocked until `isEmailVerified` is true.
- Forgot/reset password uses hashed reset token.
- Auth routes are rate limited.

Missing or planned:

- Refresh tokens.
- Session rotation.
- Server-side JWT revocation.
- Session invalidation after password reset/change.
- Email verification resend endpoint.
- Phone verification API.
- MFA and admin user management.

## Database Model Summary

| Collection | Model | Purpose |
|------------|-------|---------|
| `users` | `User` | Accounts, credentials, roles/status, profile, addresses, verification/reset token hashes |
| `categories` | `Category` | Product taxonomy |
| `products` | `Product` | Catalog, pricing, status, inventory quantities, embedded images |
| `inventoryhistories` | `InventoryHistory` | Admin stock adjustment audit trail |
| `carts` | `Cart` | One authenticated cart per user with price-snapshot line items |
| `wishlists` | `Wishlist` | One wishlist per user with product references |

See `docs/DATABASE_SCHEMA.md` for exact fields, virtuals, indexes, constraints, and relationships.

## Current API Surface

Base API prefix: `/api/v1`

| Module | Base path |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Categories | `/api/v1/categories` |
| Products | `/api/v1/products` |
| Inventory | `/api/v1/inventory` |
| Cart | `/api/v1/cart` |
| Wishlist | `/api/v1/wishlist` |

See `docs/API_REFERENCE.md` for endpoint-level request, validation, auth, response, and error details.

## Coding Standards

### Backend Standards

- Use CommonJS modules, matching the existing codebase.
- Name files by domain and layer: `product.routes.js`, `product.controller.js`, `product.service.js`, `product.model.js`.
- Export named service/controller functions where the existing pattern does.
- Keep response envelopes consistent:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

- Throw `AppError` from services for expected errors.
- Add route validators for request bodies, params, and query params where practical.
- Keep ownership derived from `req.user`, never from request body.
- Use service-level whitelists for update operations.
- Prefer constants over hardcoded status/role/reason strings.
- Add indexes for frequently filtered fields in new models.
- Add timestamps to new main schemas.
- Include virtuals in JSON when API responses need computed values.

### Security Standards

- Keep JWTs in HTTP-only cookies for browser auth.
- Keep CORS origin restricted to `FRONTEND_URL`.
- Do not return password or token hash fields.
- Use generic credential/reset responses where enumeration is a risk.
- Admin mutations must use `protect` and `authorize(USER_ROLES.ADMIN)`.
- Payment and webhook features must use idempotency and signature verification.
- Future checkout/order/payment flows must use transactions.

### Documentation Standards

- Do not document features that do not exist as implemented.
- Clearly label features as implemented, partially implemented, planned, or not started.
- Update `API_REFERENCE.md` whenever routes change.
- Update `DATABASE_SCHEMA.md` whenever models change.
- Update `ROADMAP.md` whenever feature status changes.

## Implementation Goals

### Short-Term Goals

1. Fix the wishlist `GET /api/v1/wishlist` validator bug.
2. Add `.env.example`.
3. Add automated tests for auth, users, products, inventory, cart, and wishlist.
4. Add route param validators for product/category/inventory/cart paths.
5. Add MongoDB transactions around cart and inventory reservation workflows.
6. Add reservation TTL fields and cleanup jobs.

### Commerce MVP Goals

1. Implement Orders.
2. Implement Checkout.
3. Connect checkout to inventory `commitStock`.
4. Integrate one payment provider.
5. Add payment webhooks with idempotency.
6. Add order status history.
7. Add basic fulfillment states.
8. Build customer frontend flows for auth, catalog, product detail, cart, wishlist, checkout, and order history.
9. Build admin flows for catalog, inventory, and order management.

### Production Goals

1. Move product images from local disk to Cloudinary/S3 or equivalent.
2. Add structured logging, request IDs, metrics, and alerts.
3. Add CI/CD with tests, linting, build, and deployment stages.
4. Add staging environment.
5. Add database backup/restore procedures.
6. Add operational runbooks.
7. Add stronger session security: refresh token rotation, revocation, and optional admin MFA.

## Prioritized Future Roadmap

| Priority | Feature | Status | Why it matters |
|----------|---------|--------|----------------|
| 1 | Fix wishlist GET validator | Planned | Current route validates a missing param and may block normal wishlist reads. |
| 2 | Automated tests | Planned | Existing backend has enough business logic that regression protection is now essential. |
| 3 | `.env.example` | Planned | Reduces onboarding friction and helps LLM/dev agents infer required configuration. |
| 4 | Param validation hardening | Planned | Prevents invalid IDs from reaching services and Mongoose. |
| 5 | Cart/inventory transactions | Planned | Prevents reservation/cart desynchronization under failure. |
| 6 | Reservation TTL and cleanup | Planned | Prevents abandoned carts from holding stock forever. |
| 7 | Orders module | Not started | Creates the durable purchase record and unlocks checkout/payment/fulfillment. |
| 8 | Checkout module | Not started | Coordinates cart validation, addresses, stock commit, order creation, and payment setup. |
| 9 | Payment integration | Not started | Required for revenue-generating commerce. |
| 10 | Payment webhooks/idempotency | Not started | Required for reliable payment state transitions. |
| 11 | Customer frontend | Not started | Makes existing backend usable by shoppers. |
| 12 | Admin order management | Not started | Required for operations after checkout launches. |
| 13 | Fulfillment/shipping | Not started | Required for post-payment operations. |
| 14 | Returns/refunds | Not started | Required for complete commerce support. |
| 15 | Coupons/promotions | Not started | Useful after checkout/order pricing is stable. |
| 16 | Reviews/ratings | Not started | Best after orders exist for verified-purchase logic. |
| 17 | Analytics/admin dashboard | Not started | Needs order/payment data to be meaningful. |
| 18 | Production storage/observability/CI | Not started | Required before real deployment. |

## Recommended Future Module Pattern

New backend modules should follow this structure:

```text
back-end/
|-- routes/order.routes.js
|-- controllers/order.controller.js
|-- services/order.service.js
|-- models/order.model.js
|-- validators/order.validator.js
`-- constants/order.constants.js
```

Mount new routers in `app.js` under `/api/v1/{resource}`.

Controllers should remain thin:

```text
controller receives req -> calls service -> returns envelope
```

Services should own orchestration:

```text
service validates domain state -> writes models in transaction -> throws AppError on expected failure
```

## Commerce Workflow Target

The intended future checkout workflow is:

```text
Cart item added
  -> reserve stock
  -> checkout validates cart and address
  -> create order snapshot
  -> create payment intent
  -> payment webhook confirms payment
  -> commit reserved stock
  -> clear cart
  -> mark order paid/processing
```

Critical rules:

- Never trust client totals.
- Snapshot product, price, address, and payment details into the order.
- Use transactions for order/inventory/cart changes.
- Use idempotency keys for checkout and payment operations.
- Release reservations if checkout/payment expires or fails.

## Known Technical Debt

- `GET /api/v1/wishlist` uses a validator that expects `productId`.
- Cart/inventory writes are not fully transactional.
- Reservation TTL and cleanup jobs do not exist.
- Product stock can be updated through product PATCH without inventory history.
- No automated tests.
- No `.env.example`.
- No production-safe file storage.
- No structured logging or observability.
- No refresh tokens or server-side session revocation.
- No order/payment/checkout modules.

## LLM Implementation Guidance

When using this repository as context for an LLM:

- Treat `docs/API_REFERENCE.md` as the source of truth for routes.
- Treat `docs/DATABASE_SCHEMA.md` as the source of truth for models.
- Preserve the existing layered architecture.
- Do not invent existing features; check the route, service, and model first.
- Prefer narrow, vertical feature implementation over broad rewrites.
- For new commerce modules, implement model, constants, validators, service, controller, routes, docs, and tests together.
- Prioritize correctness around inventory and money over speed of feature delivery.
