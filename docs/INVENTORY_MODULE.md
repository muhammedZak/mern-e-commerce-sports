# Inventory Module

Last audited against code: 2026-06-21.

Inventory state lives on the Product document. `InventoryHistory` records admin stock adjustments only.

## Implemented

- Admin inventory adjustment.
- Inventory history.
- Inventory summary.
- Stock reservation.
- Stock release.
- Stock commit primitive.
- Available stock calculation.
- Low stock detection.
- Inventory status calculation.

## API

All inventory routes require admin authorization.

| Method | Route | Purpose |
|--------|-------|---------|
| PATCH | `/api/v1/inventory/:productId/adjust` | Apply signed stock adjustment and create history |
| GET | `/api/v1/inventory/:productId/history` | List adjustment history |
| GET | `/api/v1/inventory/:productId/summary` | Return stock fields and virtuals |

## Stock Model

| Field | Location | Meaning |
|-------|----------|---------|
| `stockQuantity` | Product | On-hand stock |
| `reservedQuantity` | Product | Units reserved by carts |
| `lowStockThreshold` | Product | Threshold for low-stock state |
| `availableStock` | Product virtual | `stockQuantity - reservedQuantity` |

## Atomic Reservation Improvements

Implemented in `services/inventory.service.js`:

- `reserveStock(productId, quantity)` uses `findOneAndUpdate`.
- Reservation query requires active, non-deleted product.
- Reservation query uses `$expr` to require `stockQuantity - reservedQuantity >= quantity`.
- Reservation increments `reservedQuantity` atomically.
- `commitStock(productId, quantity)` uses `findOneAndUpdate`.
- Commit query requires `reservedQuantity >= quantity`.
- Commit decrements both `stockQuantity` and `reservedQuantity` atomically.
- `addItemToCart` catches failures after reservation and attempts to release the reserved quantity.

These changes improve overselling protection and reservation rollback protection, but they do not replace full transaction boundaries.

## Release Behavior

`releaseStock(productId, quantity)` loads the product, subtracts `Math.min(quantity, reservedQuantity)`, saves, and returns the product. It prevents `reservedQuantity` from going below zero.

## Summary Response

`getInventorySummary` returns:

- `productId`
- `stockQuantity`
- `reservedQuantity`
- `availableStock`
- `lowStockThreshold`
- `inStock`
- `lowStock`
- `inventoryStatus`

`inventoryStatus` values are `in_stock`, `low_stock`, and `out_of_stock`.

## Remaining Gaps

- Reservation TTL is not implemented.
- Reservation cleanup jobs are not implemented.
- Abandoned cart recovery is not implemented.
- `commitStock` is not used by any order/checkout flow.
- Cart and inventory updates are not wrapped in MongoDB transactions.
- Reservation/release/commit actions are not recorded in `InventoryHistory`.
- Product stock can be updated through product PATCH without inventory history.
