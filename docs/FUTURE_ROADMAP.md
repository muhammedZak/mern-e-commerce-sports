# Future Roadmap

This file is the planning companion to `docs/ROADMAP.md`.

`ROADMAP.md` is the audited implementation status source of truth. This document keeps the forward-looking plan for modules that do not exist yet.

## Near Term

| Item | Status | Notes |
|------|--------|-------|
| Fix wishlist GET validator | ⏳ Planned | Remove `wishlistProductValidation` from `GET /api/v1/wishlist`. |
| Add test suite | ⏳ Planned | Cover auth, users, products, inventory, cart, wishlist. |
| Add reservation TTL | ⏳ Planned | Add expiration metadata and cleanup jobs for stale cart reservations. |
| Add MongoDB transactions | ⏳ Planned | Cart/inventory and future order/payment flows need atomic writes. |
| Add `.env.example` | ⏳ Planned | Document required environment variables. |

## Commerce Core

| Module | Status | Dependencies |
|--------|--------|--------------|
| Orders | ❌ Not Started | Auth, cart, products, inventory |
| Checkout | ❌ Not Started | Orders, cart, addresses, inventory |
| Payments | ❌ Not Started | Checkout, orders, webhook verification |
| Shipping/Fulfillment | ❌ Not Started | Orders |
| Returns/Refunds | ❌ Not Started | Orders, payments, fulfillment |

## Customer Experience

| Module | Status | Notes |
|--------|--------|-------|
| Frontend catalog | ❌ Not Started | React scaffold exists only. |
| Frontend auth | ❌ Not Started | No login/register UI. |
| Frontend cart/wishlist | ❌ Not Started | No API integration. |
| Reviews and ratings | ❌ Not Started | Should wait for orders if verified purchase is required. |
| Coupons/promotions | ❌ Not Started | Requires cart/order pricing rules. |
| Abandoned cart recovery | ❌ Not Started | Depends on reservation TTL and jobs. |

## Admin and Operations

| Module | Status | Notes |
|--------|--------|-------|
| Admin dashboard | ❌ Not Started | Product/category/inventory APIs exist, but no UI. |
| Admin analytics | ❌ Not Started | Requires orders for meaningful sales metrics. |
| Audit logging | ❌ Not Started | Inventory history exists only for stock adjustments. |
| Structured logging | ❌ Not Started | Current code uses console logging. |
| Monitoring/alerting | ❌ Not Started | No metrics or tracing. |
| CI/CD | ❌ Not Started | No pipeline config. |
| Production file storage | ❌ Not Started | Product images are stored on local disk. |

## Technical Recommendations

- Keep the existing route/controller/service/model architecture.
- Put checkout/order/payment orchestration in services, not controllers.
- Use constants for all new status lifecycles.
- Use transactions for money, orders, and inventory state changes.
- Add idempotency keys for checkout, payment creation, webhooks, refunds, and background jobs.
- Snapshot product, price, address, and payment details into orders.
- Move uploads to Cloudinary/S3 or another shared object store before multi-instance deployment.
