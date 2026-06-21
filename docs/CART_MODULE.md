# Cart Module

Last audited against code: 2026-06-21.

## Implemented

- Add item.
- Get current user's cart.
- Update item quantity.
- Remove item.
- Clear cart.
- Price snapshot storage.
- Inventory reservation integration.
- Reservation release on quantity decrease, item removal, and cart clear.
- Reservation rollback attempt in `addItemToCart` if cart save fails after reservation.

## API

All cart routes require authentication.

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/v1/cart/items` | Add product to cart |
| GET | `/api/v1/cart` | Get current user's cart |
| PATCH | `/api/v1/cart/items/:productId` | Set absolute quantity |
| DELETE | `/api/v1/cart/items/:productId` | Remove product from cart |
| DELETE | `/api/v1/cart` | Clear cart |

## Schema

See `docs/DATABASE_SCHEMA.md` for exact fields.

Cart fields:

- `user`: unique `User` reference.
- `items`: embedded cart items.

Cart item fields:

- `product`: `Product` reference.
- `quantity`: minimum 1.
- `priceSnapshot`: product price at first add.

Virtuals:

- `totalItems`: sum of item quantities.
- `subtotal`: sum of `priceSnapshot * quantity`.

## Inventory Integration

| Cart operation | Inventory behavior |
|----------------|--------------------|
| Add item | Reserves full added quantity |
| Increase quantity | Reserves the difference |
| Decrease quantity | Releases the difference |
| Remove item | Releases item quantity |
| Clear cart | Releases all item quantities |

## Current Limitations

- Guest cart is not implemented.
- Checkout is not implemented.
- `commitStock` is not called.
- Reservation TTL is not implemented.
- Reservation cleanup jobs are not implemented.
- Abandoned cart recovery is not implemented.
- Cart/inventory writes are not wrapped in MongoDB transactions.
- Delete route `productId` params are not validated.
