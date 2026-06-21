# Category Module

Last audited against code: 2026-06-21.

## Implemented

- Public category list.
- Public category detail by ID or slug.
- Public products-by-category endpoint.
- Admin create, update, archive, and restore.
- Slug generation from category name.
- Status management with `active` and `inactive`.
- Soft delete through `isDeleted`.
- Search/filter/sort/pagination through `ApiQuery`.

## API

| Method | Route | Auth | Role | Purpose |
|--------|-------|------|------|---------|
| GET | `/api/v1/categories` | No | - | List categories |
| GET | `/api/v1/categories/:slug/products` | No | - | List active products in category |
| GET | `/api/v1/categories/:identifier` | No | - | Get category by ID or slug |
| POST | `/api/v1/categories` | Yes | Admin | Create category |
| PATCH | `/api/v1/categories/:id` | Yes | Admin | Update category |
| DELETE | `/api/v1/categories/:id` | Yes | Admin | Archive category |
| PATCH | `/api/v1/categories/:id/restore` | Yes | Admin | Restore category |

## Schema Highlights

See `docs/DATABASE_SCHEMA.md` for the exact schema.

Important fields:

- `name`
- `slug`
- `description`
- `image`
- `status`
- `isDeleted`
- `createdBy`

## Lifecycle

- Create defaults to `status: active` and `isDeleted: false`.
- Archive sets `isDeleted: true`.
- Restore sets `isDeleted: false`.
- Archive/restore do not change `status`.
- Products are not cascaded when a category is archived.

## Current Gaps

- No nested categories.
- No category image upload, only URL field.
- No admin endpoint to include deleted categories.
- No cascade or guard when archiving categories with products.
- `status` is accepted by service update but not validated at the route edge.
