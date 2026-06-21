# Product Module

Last audited against code: 2026-06-21.

## Implemented

- Admin create, update, archive, and restore.
- Public product list and detail for active, non-deleted products.
- Slug generation from product name.
- SKU uniqueness.
- Category reference validation on create.
- Product status management: `draft`, `active`, `archived`.
- Soft delete through `isDeleted`.
- Embedded image gallery with upload, delete, primary image, reorder, and alt text.
- Inventory fields on product: `stockQuantity`, `reservedQuantity`, `lowStockThreshold`.
- Inventory virtuals: `availableStock`, `inStock`, `lowStock`, `inventoryStatus`.
- Search/filter/sort/pagination through `ApiQuery`.

## API

| Method | Route | Auth | Role | Purpose |
|--------|-------|------|------|---------|
| POST | `/api/v1/products` | Yes | Admin | Create product |
| GET | `/api/v1/products` | No | - | List active products |
| GET | `/api/v1/products/:identifier` | No | - | Get active product by ID or slug |
| PATCH | `/api/v1/products/:id` | Yes | Admin | Update product |
| DELETE | `/api/v1/products/:id` | Yes | Admin | Archive product |
| PATCH | `/api/v1/products/:id/restore` | Yes | Admin | Restore product |
| POST | `/api/v1/products/:id/images` | Yes | Admin | Upload images |
| DELETE | `/api/v1/products/:id/images/:filename` | Yes | Admin | Delete image |
| PATCH | `/api/v1/products/:id/images/primary` | Yes | Admin | Set primary image |
| PATCH | `/api/v1/products/:id/images/reorder` | Yes | Admin | Reorder images |
| PATCH | `/api/v1/products/:id/images/alt-text` | Yes | Admin | Update alt text |

## Schema Highlights

The exact schema is documented in `docs/DATABASE_SCHEMA.md`.

Important fields:

- Catalog: `name`, `slug`, `shortDescription`, `description`, `brand`, `category`, `sku`.
- Pricing: `price`, `compareAtPrice`.
- Inventory: `stockQuantity`, `reservedQuantity`, `lowStockThreshold`.
- Lifecycle: `featured`, `status`, `isDeleted`, `createdBy`.
- Images: `url`, `filename`, `alt`, `isPrimary`, `sortOrder`.

## Product Image Behavior

- Upload accepts multipart `images`, max 10 files per request/product.
- Allowed types: JPEG, PNG, WEBP.
- Max file size: 5 MB.
- First image becomes primary when gallery is empty.
- Deleting the primary image promotes the first remaining image.
- Reorder requires a filename array matching the current gallery.
- Alt text is required and capped at 200 characters.

## Current Gaps

- No variants/options.
- No product reviews.
- No bulk import/export.
- Product `stockQuantity` can be updated through product update without inventory history.
- No reservation cleanup when product is archived.
- Local image storage is not production-safe for multi-instance deployment.
