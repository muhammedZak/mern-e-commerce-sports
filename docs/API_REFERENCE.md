# API Reference

Last audited against code: 2026-06-21.

Base API prefix: `/api/v1`

Protected routes require a valid JWT stored in the HTTP-only cookie `accessToken`. Admin routes require `protect` plus `authorize(USER_ROLES.ADMIN)`.

## Global Response Shape

Success responses:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "status": "error",
  "message": "Error message",
  "errors": []
}
```

Validation errors include field-level entries in `errors`.

## Authentication

Base path: `/api/v1/auth`

| Method | Route | Auth | Body | Validation | Success | Common errors |
|--------|-------|------|------|------------|---------|---------------|
| POST | `/register` | No | `firstName`, `lastName`, `email`, `password` | Names required 1-50 chars; email valid; password 8-128 chars and strong | `201`, user DTO, verification email attempted | `400`, `409 Email already exists` |
| POST | `/login` | No | `email`, `password` | Email valid; password required | `200`, sets `accessToken` cookie, returns user DTO | `401 Invalid email or password`, `403 Account is not active`, `403 Please verify your email before logging in` |
| GET | `/me` | Yes | None | None | `200`, current auth user DTO | `401`, `403` |
| POST | `/logout` | No | None | None | `200`, clears `accessToken` cookie | None expected |
| POST | `/verify-email` | No | `token` | Required non-empty token | `200 Email verified successfully` | `400 Invalid or expired verification token` |
| POST | `/forgot-password` | No | `email` | Valid email | `200` generic reset email message | `400`, email provider errors |
| POST | `/reset-password` | No | `token`, `password`, `confirmPassword` | Token required; strong password; confirmation match | `200 Password reset successful` | `400 Invalid or expired password reset token` |

Login cookie options come from `auth.controller.js`: `httpOnly: true`, `secure` in production, `sameSite: strict`, and `maxAge: COOKIE_EXPIRES_IN * 60 * 1000`.

## Users

Base path: `/api/v1/users`

| Method | Route | Auth | Body | Validation | Success | Common errors |
|--------|-------|------|------|------------|---------|---------------|
| GET | `/me` | Yes | None | None | `200`, profile DTO including `address` and `isPhoneVerified` | `401`, `403` |
| PATCH | `/me` | Yes | Optional `firstName`, `lastName`, `phone` | Names 1-50 chars; phone valid mobile | `200`, updated profile DTO | `400`, `401` |
| PATCH | `/change-password` | Yes | `currentPassword`, `newPassword`, `confirmPassword` | Strong new password; must differ from current; confirmation match | `200 Password changed successfully` | `400 Current password is incorrect` |
| GET | `/addresses` | Yes | None | None | `200`, address array | `401`, `403` |
| POST | `/addresses` | Yes | `street`, `city`, `state`, `zipCode`, `country`, optional `label`, `isPrimary` | Required address fields; max lengths; `isPrimary` boolean | `201`, updated address array | `400` |
| PATCH | `/addresses/:addressId` | Yes | Same as create | `addressId` MongoId; same body validation | `200`, updated address array | `400`, `404 Address not found` |
| DELETE | `/addresses/:addressId` | Yes | None | `addressId` MongoId | `200`, updated address array | `400`, `404 Address not found` |

Address create/update promotes the first address to primary. Setting one address as primary clears the flag from the others. Deleting the primary address promotes the first remaining address.

## Categories

Base path: `/api/v1/categories`

| Method | Route | Auth | Role | Body/query | Validation | Success |
|--------|-------|------|------|------------|------------|---------|
| GET | `/` | No | - | Query: `page`, `limit`, `sort`, `search`, `status` | No route validator | `200`, `{ categories, pagination }` |
| GET | `/:slug/products` | No | - | Query: `page`, `limit`, `sort`, `search`, `brand`, `featured` | No route validator | `200`, category summary plus products |
| GET | `/:identifier` | No | - | ObjectId or slug | No route validator | `200`, category |
| POST | `/` | Yes | Admin | `name`, optional `description`, `image`, `status` | Name required max 100; description max 500; image URL | `201`, created category |
| PATCH | `/:id` | Yes | Admin | Optional `name`, `description`, `image`, `status` | Name max 100; description max 500; image URL | `200`, updated category |
| DELETE | `/:id` | Yes | Admin | None | None | `200`, archive message |
| PATCH | `/:id/restore` | Yes | Admin | None | None | `200`, restored category |

Category archive sets `isDeleted: true`. It does not change `status` and does not cascade to products.

## Products

Base path: `/api/v1/products`

| Method | Route | Auth | Role | Body/query | Validation | Success |
|--------|-------|------|------|------------|------------|---------|
| POST | `/` | Yes | Admin | `name`, `category`, `sku`, `price`, `stockQuantity`, optional product fields | Required fields; category MongoId; price >= 0; stock integer >= 0 | `201`, created product |
| GET | `/` | No | - | Query: `page`, `limit`, `sort`, `search`, `brand`, `status`, `featured`, `category` | No route validator | `200`, `{ products, pagination }` |
| GET | `/:identifier` | No | - | ObjectId or slug | No route validator | `200`, active non-deleted product |
| PATCH | `/:id` | Yes | Admin | Whitelisted service fields | Optional name/price/compareAtPrice/stockQuantity validation | `200`, updated product |
| DELETE | `/:id` | Yes | Admin | None | None | `200`, archive message |
| PATCH | `/:id/restore` | Yes | Admin | None | None | `200`, restored product |

Update whitelist: `name`, `shortDescription`, `description`, `brand`, `price`, `compareAtPrice`, `stockQuantity`, `featured`, `status`, `images`.

Product archive sets `isDeleted: true` and `status: archived`. Restore sets `isDeleted: false` and `status: active`.

### Product Images

All image routes are admin-only and live under `/api/v1/products`.

| Method | Route | Body | Validation | Success |
|--------|-------|------|------------|---------|
| POST | `/:id/images` | Multipart field `images`, up to 10 files | Multer file limits: JPG/PNG/WEBP, 5 MB each, max 10 images per product | `200`, updated product |
| DELETE | `/:id/images/:filename` | None | None | `200`, updated product |
| PATCH | `/:id/images/primary` | `filename` | Required non-empty filename | `200`, updated product |
| PATCH | `/:id/images/reorder` | `images` array of filenames | Array min length 1; must match gallery | `200`, updated product |
| PATCH | `/:id/images/alt-text` | `filename`, `alt` | Filename required; alt required max 200 | `200`, updated product |

Images are embedded on the Product document with `url`, `filename`, `alt`, `isPrimary`, and `sortOrder`. Static files are served from `/uploads/products/{filename}`.

## Inventory

Base path: `/api/v1/inventory`

All inventory endpoints require admin authorization.

| Method | Route | Body | Validation | Success |
|--------|-------|------|------------|---------|
| PATCH | `/:productId/adjust` | `adjustment`, `reason` | Adjustment required integer; reason one of `restock`, `manual_adjustment`, `damaged`, `returned` | `200`, updated product and history record |
| GET | `/:productId/history` | None | No route validator | `200`, history sorted newest first |
| GET | `/:productId/summary` | None | No route validator | `200`, stock summary |

Summary response fields: `productId`, `stockQuantity`, `reservedQuantity`, `availableStock`, `lowStockThreshold`, `inStock`, `lowStock`, `inventoryStatus`.

Internal inventory functions:

- `reserveStock(productId, quantity)`: atomic `findOneAndUpdate` guarded by active product, non-deleted product, and `$expr` available stock check.
- `releaseStock(productId, quantity)`: loads product and subtracts `Math.min(quantity, reservedQuantity)`.
- `commitStock(productId, quantity)`: atomic `findOneAndUpdate` requiring `reservedQuantity >= quantity`, decrements both `stockQuantity` and `reservedQuantity`.

Remaining gaps: reservation TTL, reservation cleanup jobs, abandoned cart recovery, and order checkout integration.

## Cart

Base path: `/api/v1/cart`

All cart endpoints require authentication.

| Method | Route | Body | Validation | Success |
|--------|-------|------|------------|---------|
| POST | `/items` | `productId`, `quantity` | ProductId MongoId; quantity integer >= 1 | `200`, populated cart |
| GET | `/` | None | None | `200`, populated cart or empty DTO |
| PATCH | `/items/:productId` | `quantity` | Quantity integer >= 1. URL `productId` is not validated. | `200`, populated cart |
| DELETE | `/items/:productId` | None | No URL validator | `200`, populated cart |
| DELETE | `/` | None | None | `200`, cleared cart |

Cart behavior:

- One cart document per user.
- Line items are embedded and contain `product`, `quantity`, `priceSnapshot`.
- Adding the same product increments quantity and keeps the original price snapshot.
- Increasing quantity reserves the difference.
- Decreasing/removing/clearing releases reservations.
- `addItemToCart` attempts to release the reserved quantity if cart save fails after reservation.

Limitations:

- Guest cart is not implemented.
- Checkout and stock commit are not implemented.
- Reservation TTL and cleanup jobs are not implemented.
- Cart/inventory operations are not wrapped in MongoDB transactions.

## Wishlist

Base path: `/api/v1/wishlist`

All wishlist endpoints require authentication.

| Method | Route | Body/params | Validation | Success |
|--------|-------|-------------|------------|---------|
| GET | `/` | None | Current route incorrectly applies `wishlistProductValidation`, which expects `:productId` | Intended `200`, wishlist or empty DTO |
| POST | `/:productId` | URL `productId` | MongoId param | `200`, wishlist |
| DELETE | `/:productId` | URL `productId` | MongoId param | `200`, wishlist |

Wishlist behavior:

- One wishlist per user.
- Products are references to active, non-deleted products.
- Adding an existing product is idempotent.
- `totalItems` virtual equals `products.length`.

## System

| Method | Route | Auth | Response |
|--------|-------|------|----------|
| GET | `/health` | No | `{ "status": "success" }` |
| GET | `/uploads/*` | No | Static uploaded files |

## Validation Coverage Notes

Implemented validation:

- Auth register/login/verify/forgot/reset.
- User profile/password/address.
- Category create/update.
- Product create/update/image operations.
- Inventory adjustment.
- Cart add/update.
- Wishlist `productId`.

Known validation gaps:

- Inventory `productId` route params are not validated.
- Product/category `:id` route params are not validated.
- Cart delete/update `:productId` route params are not consistently validated.
- `GET /wishlist` incorrectly uses a `productId` param validator.
