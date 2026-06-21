# Roadmap

Last audited against code: 2026-06-21.

Status markers:

- ✅ Completed
- 🟡 Partially Implemented
- ⏳ Planned
- ❌ Not Started

## Current Status

| Area | Status | Evidence |
|------|--------|----------|
| Backend foundation | ✅ Completed | Express app, MongoDB connection, middleware, route mounting, global error handling |
| Authentication | ✅ Completed | Register/login/logout/me/verify-email/forgot-password/reset-password |
| Cookie JWT auth | ✅ Completed | `accessToken` HTTP-only cookie set on login and read by `protect` |
| Email verification gate | ✅ Completed | `loginUser` rejects users with `isEmailVerified === false` |
| User profile | ✅ Completed | `GET /users/me`, `PATCH /users/me` |
| Change password | ✅ Completed | `PATCH /users/change-password` |
| Address management | ✅ Completed | `GET/POST/PATCH/DELETE /users/addresses` |
| Phone support | 🟡 Partially Implemented | `phone` field and validation exist; phone verification routes do not |
| Category CRUD | ✅ Completed | Public reads and admin create/update/archive/restore |
| Product CRUD | ✅ Completed | Public active catalog and admin lifecycle |
| Product image gallery | ✅ Completed | Upload, delete, set primary, reorder, update alt text |
| Inventory adjustment/history/summary | ✅ Completed | Admin inventory routes exist |
| Atomic stock reservation | ✅ Completed | `reserveStock` uses `findOneAndUpdate` with `$expr` availability guard |
| Atomic stock commit primitive | 🟡 Partially Implemented | `commitStock` exists but no Orders/Checkout consumer |
| Reservation rollback protection | 🟡 Partially Implemented | `addItemToCart` attempts release on save failure; other flows lack transactions |
| Cart | ✅ Completed | Add, get, update, remove, clear with price snapshots |
| Wishlist | 🟡 Partially Implemented | Get/add/remove and validation exist; `GET /wishlist` has an invalid `productId` validator |
| Frontend application | 🟡 Partially Implemented | Vite/React scaffold only |
| Automated tests | ❌ Not Started | `npm test` placeholder exits with error |
| Orders | ❌ Not Started | No order model/routes/services |
| Checkout | ❌ Not Started | No checkout module |
| Payments | ❌ Not Started | No payment provider or webhook handling |
| Shipping/fulfillment | ❌ Not Started | No module |
| Reviews/ratings | ❌ Not Started | No module |
| Coupons/promotions | ❌ Not Started | No module |
| Admin analytics | ❌ Not Started | No module |
| Deployment pipeline | ❌ Not Started | No CI/CD config found |

## Recommended Implementation Order

| Priority | Item | Status | Rationale |
|----------|------|--------|-----------|
| 1 | Fix wishlist GET validation | ⏳ Planned | Current route validates a param that does not exist. |
| 2 | Add automated tests | ⏳ Planned | Inventory/cart/auth behavior is now business-critical. |
| 3 | Add MongoDB transactions for cart/inventory | ⏳ Planned | Current reservation and cart writes are not fully atomic together. |
| 4 | Add reservation TTL and cleanup job | ⏳ Planned | Abandoned carts can hold stock forever. |
| 5 | Build Orders module | ⏳ Planned | Needed to consume `commitStock`. |
| 6 | Build Checkout module | ⏳ Planned | Coordinates cart, address, inventory, order creation. |
| 7 | Add Payments and webhooks | ⏳ Planned | Required for real commerce. |
| 8 | Build frontend catalog/auth/cart/wishlist | ⏳ Planned | Backend exists but has no real UI consumer. |
| 9 | Add shipping/fulfillment | ⏳ Planned | Needed after paid orders. |
| 10 | Add admin dashboard/analytics | ⏳ Planned | Operational visibility. |

## Remaining Gaps

### Inventory and Cart

- Reservation TTL is not implemented.
- Reservation cleanup jobs are not implemented.
- Abandoned cart recovery is not implemented.
- Cart/inventory writes are not wrapped in MongoDB transactions.
- `commitStock` is not connected to orders.

### Authentication and Users

- Refresh tokens are not implemented.
- Server-side JWT revocation is not implemented.
- Password reset/change does not invalidate active sessions.
- Phone verification is not implemented beyond model scaffolding.
- Admin user management is not implemented.

### Commerce

- Orders, checkout, payments, shipping, returns, refunds, reviews, and coupons are not implemented.
- No payment webhook idempotency.
- No order audit/status history.
- No shipment tracking.

### Operations

- No automated tests.
- No `.env.example`.
- No CI/CD pipeline.
- No structured logs, metrics, tracing, or alerting.
- Product uploads use local disk storage.

## MVP Completion Checklist

| Item | Status |
|------|--------|
| Authenticated users can register, verify email, login, manage profile | ✅ Completed |
| Admins can manage products/categories/inventory | ✅ Completed |
| Customers can maintain cart and wishlist | ✅ Completed |
| Stock reservation prevents basic overselling during cart add | ✅ Completed |
| Expiring reservations | ❌ Not Started |
| Orders from cart | ❌ Not Started |
| Payment provider | ❌ Not Started |
| Checkout UI | ❌ Not Started |
| Production deployment | ❌ Not Started |
