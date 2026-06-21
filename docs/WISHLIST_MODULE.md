# Wishlist Module

Last audited against code: 2026-06-21.

## Implemented

- Get current user's wishlist.
- Add product to wishlist.
- Remove product from wishlist.
- Validation layer for `productId` route params.
- Duplicate adds are idempotent.
- Wishlist products must be active and non-deleted when added.

## API

All wishlist routes require authentication.

| Method | Route | Purpose | Validation |
|--------|-------|---------|------------|
| GET | `/api/v1/wishlist` | Get wishlist | Currently has an incorrect `productId` param validator |
| POST | `/api/v1/wishlist/:productId` | Add product | `productId` must be MongoId |
| DELETE | `/api/v1/wishlist/:productId` | Remove product | `productId` must be MongoId |

## Schema

See `docs/DATABASE_SCHEMA.md` for exact fields.

Wishlist fields:

- `user`: unique `User` reference.
- `products`: array of `Product` references.

Virtual:

- `totalItems`: `products.length`.

## Current Limitations

- `GET /api/v1/wishlist` incorrectly applies `wishlistProductValidation`; it should not validate `productId` because the route has no such param.
- No move-to-cart endpoint.
- No clear wishlist endpoint.
- No wishlist pagination.
