# Database Schema

Last audited against code: 2026-06-21.

This document reflects the Mongoose models in `back-end/models/`.

## User

File: `back-end/models/user.model.js`

Collection: `users`

### Fields

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `email` | String | Yes | - | Lowercase, trim, unique, indexed, valid email |
| `password` | String | Yes | - | `minlength: 8`, `select: false`, bcrypt-hashed by hooks |
| `firstName` | String | Yes | - | Trim |
| `lastName` | String | Yes | - | Trim |
| `phone` | String | No | - | Trim, unique sparse, valid mobile when present |
| `avatar` | String | No | - | Trim |
| `dateOfBirth` | Date | No | - | - |
| `address` | Embedded array | No | `[]` | See Address |
| `role` | String | No | `customer` | Enum: `customer`, `admin` |
| `status` | String | No | `active` | Enum: `active`, `inactive`, `suspended` |
| `isEmailVerified` | Boolean | No | `false` | - |
| `isPhoneVerified` | Boolean | No | `false` | - |
| `emailVerificationToken` | String | No | - | Trim, hashed token |
| `emailVerificationTokenExpires` | Date | No | - | - |
| `phoneVerificationToken` | String | No | - | Trim, hashed token |
| `phoneVerificationTokenExpires` | Date | No | - | - |
| `passwordResetToken` | String | No | - | Trim, hashed token |
| `passwordResetExpires` | Date | No | - | - |
| `createdAt`, `updatedAt` | Date | Auto | Auto | Mongoose timestamps |

### Address

Embedded in `User.address`. Mongoose creates an `_id` for each address.

| Field | Type | Default | Constraints |
|-------|------|---------|-------------|
| `street` | String | - | Trim |
| `city` | String | - | Trim |
| `state` | String | - | Trim |
| `zipCode` | String | - | Trim |
| `country` | String | - | Trim |
| `isPrimary` | Boolean | `false` | - |
| `label` | String | - | Trim |

### Virtuals, Methods, Hooks, Indexes

| Type | Details |
|------|---------|
| Virtual | `fullName = firstName + ' ' + lastName` |
| Methods | `comparePassword`, `generatePasswordResetToken`, `generateEmailVerificationToken`, `generatePhoneVerificationToken` |
| Hooks | `pre('save')` hashes modified password; `pre('findOneAndUpdate')` hashes plain password and rejects pre-hashed values |
| Indexes | Field index/unique on `email`; unique sparse on `phone`; compound `{ role: 1, status: 1 }`; compound token indexes for password reset and email verification |

## Category

File: `back-end/models/category.model.js`

Collection: `categories`

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `name` | String | Yes | - | Trim, unique, max 100 |
| `slug` | String | Yes | Generated from name | Unique, lowercase, trim |
| `description` | String | No | - | Trim, max 500 |
| `image` | String | No | - | Trim |
| `status` | String | No | `active` | Enum: `active`, `inactive` |
| `isDeleted` | Boolean | No | `false` | Soft delete flag |
| `createdBy` | ObjectId ref `User` | Yes | - | - |
| `createdAt`, `updatedAt` | Date | Auto | Auto | Mongoose timestamps |

Hooks and indexes:

- `pre('validate')` regenerates `slug` from `name`.
- `toJSON` hides `__v` and includes virtuals.
- Explicit index: `{ status: 1, isDeleted: 1 }`.
- Unique indexes are created by `name` and `slug`.

## Product

File: `back-end/models/product.model.js`

Collection: `products`

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `name` | String | Yes | - | Trim, max 200 |
| `slug` | String | Yes | Generated from name | Unique, lowercase, trim |
| `shortDescription` | String | No | - | Trim, max 300 |
| `description` | String | No | `''` | Trim |
| `brand` | String | No | - | Trim, max 100 |
| `category` | ObjectId ref `Category` | Yes | - | - |
| `sku` | String | Yes | - | Unique, uppercase, trim |
| `price` | Number | Yes | - | Min 0 |
| `compareAtPrice` | Number | No | - | Min 0 |
| `stockQuantity` | Number | Yes | `0` | Min 0 |
| `reservedQuantity` | Number | No | `0` | Min 0 |
| `images` | Embedded image array | No | `[]` | Max enforced in service |
| `featured` | Boolean | No | `false` | - |
| `status` | String | No | `draft` | Enum: `draft`, `active`, `archived` |
| `isDeleted` | Boolean | No | `false` | Soft delete flag |
| `lowStockThreshold` | Number | No | `5` | - |
| `createdBy` | ObjectId ref `User` | Yes | - | - |
| `createdAt`, `updatedAt` | Date | Auto | Auto | Mongoose timestamps |

### Product Image

Embedded in `Product.images` with `_id: false`.

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `url` | String | Yes | - |
| `filename` | String | Yes | - |
| `alt` | String | No | `''` |
| `isPrimary` | Boolean | No | `false` |
| `sortOrder` | Number | No | `0` |

### Virtuals, Hooks, Indexes

| Type | Details |
|------|---------|
| Virtuals | `primaryImage`, `availableStock`, `inStock`, `lowStock`, `inventoryStatus` |
| Hooks | `pre('validate')` enforces only one primary image; `pre('validate')` regenerates slug when name changes |
| Indexes | `{ slug: 1 }`, `{ category: 1 }`, `{ status: 1 }`, `{ featured: 1 }`, `{ category: 1, status: 1 }`, `{ isDeleted: 1, status: 1 }`, text `{ name: 'text', brand: 'text' }`, `{ featured: 1, status: 1, isDeleted: 1 }` |
| Unique | `slug`, `sku` |

## InventoryHistory

File: `back-end/models/inventory-history.model.js`

Collection: `inventoryhistories`

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `product` | ObjectId ref `Product` | Yes | Adjusted product |
| `previousQuantity` | Number | Yes | Stock before adjustment |
| `newQuantity` | Number | Yes | Stock after adjustment |
| `adjustment` | Number | Yes | Signed delta |
| `reason` | String | Yes | Adjustment reason |
| `adjustedBy` | ObjectId ref `User` | Yes | Admin actor |
| `createdAt`, `updatedAt` | Date | Auto | Timestamps |

Indexes:

- `{ product: 1, createdAt: -1 }`
- `{ adjustedBy: 1, createdAt: -1 }`

## Cart

File: `back-end/models/cart.model.js`

Collection: `carts`

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `user` | ObjectId ref `User` | Yes | - | Unique |
| `items` | Embedded cart item array | No | `[]` | - |
| `createdAt`, `updatedAt` | Date | Auto | Auto | Mongoose timestamps |

Embedded cart item uses `_id: false`.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `product` | ObjectId ref `Product` | Yes | - |
| `quantity` | Number | Yes | Min 1 |
| `priceSnapshot` | Number | Yes | Unit price at add time |

Virtuals:

- `totalItems`: sum of quantities.
- `subtotal`: sum of `priceSnapshot * quantity`.

## Wishlist

File: `back-end/models/wishlist.model.js`

Collection: `wishlists`

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `user` | ObjectId ref `User` | Yes | - | Unique |
| `products` | ObjectId refs `Product` | No | `[]` | Array |
| `createdAt`, `updatedAt` | Date | Auto | Auto | Mongoose timestamps |

Virtuals:

- `totalItems`: `products.length`.

## Relationships

| Relationship | Implementation |
|--------------|----------------|
| User to Cart | `Cart.user` ObjectId ref, unique |
| User to Wishlist | `Wishlist.user` ObjectId ref, unique |
| User to Category/Product creation | `createdBy` ObjectId ref |
| Category to Product | `Product.category` ObjectId ref |
| Product to Cart | `Cart.items.product` ObjectId ref |
| Product to Wishlist | `Wishlist.products[]` ObjectId refs |
| Product to InventoryHistory | `InventoryHistory.product` ObjectId ref |
| User to InventoryHistory | `InventoryHistory.adjustedBy` ObjectId ref |

## Schema Gaps

- No Order, Payment, Shipping, Review, Coupon, or AuditLog models exist.
- No reservation expiration fields exist on Cart items.
- Product stock can be changed through product update without inventory history.
- Phone verification token fields exist, but there is no phone verification API.
