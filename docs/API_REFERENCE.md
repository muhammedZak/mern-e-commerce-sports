# API Reference

Complete API documentation for every endpoint implemented in `back-end/`. All paths are relative to the server origin (default `http://localhost:5000`).

**API version prefix:** `/api/v1`

---

## Global Conventions

### Authentication

Protected endpoints require a valid JWT stored in an **HTTP-only cookie** named `accessToken`. The cookie is set on `POST /api/v1/auth/login`.

| Requirement | Detail |
|-------------|--------|
| Cookie name | `accessToken` |
| Set by | `POST /api/v1/auth/login` |
| Cleared by | `POST /api/v1/auth/logout` |
| Client config | Requests must include `credentials: true` (fetch) or `withCredentials: true` (axios) |
| CORS | `FRONTEND_URL` must match client origin; `credentials: true` enabled in `app.js` |

### Roles

| Role | Value | Access |
|------|-------|--------|
| Customer | `customer` | Default role; protected user endpoints |
| Admin | `admin` | Admin-only catalog, inventory, and product management |

### Success Response Envelope

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

`message` is omitted on some read endpoints. `data` may be omitted when only a message is returned.

### Error Response Envelope

```json
{
  "success": false,
  "status": "error",
  "message": "Error description",
  "errors": []
}
```

When validation fails, `errors` contains field-level detail:

```json
{
  "success": false,
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

### Common HTTP Status Codes

| Code | When |
|------|------|
| `400` | Validation failure, bad input, insufficient stock |
| `401` | Missing/invalid token, invalid credentials |
| `403` | Inactive account, insufficient role |
| `404` | Resource or route not found |
| `409` | Duplicate email, SKU, or category name |
| `500` | Unexpected server error |

### Query Parameters (Shared)

Used by list endpoints via `utils/api-query.util.js`:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page |
| `sort` | string | `-createdAt` | Mongoose sort string (e.g. `price`, `-name`) |
| `search` | string | — | Case-insensitive regex search on configured fields |

---

## Endpoint Index

| Module | Method | Route | Auth | Role |
|--------|--------|-------|------|------|
| **System** | GET | `/health` | No | — |
| **Authentication** | POST | `/api/v1/auth/register` | No | — |
| | POST | `/api/v1/auth/login` | No | — |
| | GET | `/api/v1/auth/me` | Yes | Any |
| | POST | `/api/v1/auth/logout` | No | — |
| | POST | `/api/v1/auth/verify-email` | No | — |
| | POST | `/api/v1/auth/forgot-password` | No | — |
| | POST | `/api/v1/auth/reset-password` | No | — |
| **Users** | GET | `/api/v1/users/me` | Yes | Any |
| | PATCH | `/api/v1/users/me` | Yes | Any |
| | PATCH | `/api/v1/users/change-password` | Yes | Any |
| **Categories** | GET | `/api/v1/categories` | No | — |
| | GET | `/api/v1/categories/:slug/products` | No | — |
| | GET | `/api/v1/categories/:identifier` | No | — |
| | POST | `/api/v1/categories` | Yes | Admin |
| | PATCH | `/api/v1/categories/:id` | Yes | Admin |
| | DELETE | `/api/v1/categories/:id` | Yes | Admin |
| | PATCH | `/api/v1/categories/:id/restore` | Yes | Admin |
| **Products** | POST | `/api/v1/products` | Yes | Admin |
| | GET | `/api/v1/products` | No | — |
| | GET | `/api/v1/products/:identifier` | No | — |
| | PATCH | `/api/v1/products/:id` | Yes | Admin |
| | DELETE | `/api/v1/products/:id` | Yes | Admin |
| | PATCH | `/api/v1/products/:id/restore` | Yes | Admin |
| **Product Images** | POST | `/api/v1/products/:id/images` | Yes | Admin |
| | DELETE | `/api/v1/products/:id/images/:filename` | Yes | Admin |
| | PATCH | `/api/v1/products/:Id/images/primary` | Yes | Admin |
| | PATCH | `/api/v1/products/Id/images/reorder` | Yes | Admin |
| | PATCH | `/api/v1/products/:Id/images/alt-text` | Yes | Admin |
| **Inventory** | PATCH | `/api/v1/inventory/:productId/adjust` | Yes | Admin |
| | GET | `/api/v1/inventory/:productId/history` | Yes | Admin |
| | GET | `/api/v1/inventory/:productId/summary` | Yes | Admin |
| **Cart** | POST | `/api/v1/cart/items` | Yes | Any |
| | GET | `/api/v1/cart` | Yes | Any |
| | PATCH | `/api/v1/cart/items/:productId` | Yes | Any |
| | DELETE | `/api/v1/cart/items/:productId` | Yes | Any |
| | DELETE | `/api/v1/cart` | Yes | Any |
| **Wishlist** | GET | `/api/v1/wishlist` | Yes | Any |
| | POST | `/api/v1/wishlist/:productId` | Yes | Any |
| | DELETE | `/api/v1/wishlist/:productId` | Yes | Any |

> **Note:** Three product image routes (`primary`, `reorder`, `alt-text`) are registered with path/parameter inconsistencies relative to their controllers. See [Product Images](#product-images) for details.

---

# Authentication

Base path: `/api/v1/auth`

---

## Register

| Field | Value |
|-------|-------|
| **Module** | Authentication |
| **Method** | `POST` |
| **Route** | `/api/v1/auth/register` |
| **Authentication Required** | No |
| **Role Required** | — |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes | 1–50 characters |
| `lastName` | string | Yes | 1–50 characters |
| `email` | string | Yes | Valid email |
| `password` | string | Yes | Strong password (see Validation Rules) |

### Validation Rules

- `firstName` — required, trimmed, max 50 chars
- `lastName` — required, trimmed, max 50 chars
- `email` — required, valid email, normalized
- `password` — required, 8–128 chars, must include uppercase, lowercase, number, and special character

### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email address.",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "firstName": "Jane",
    "lastName": "Doe",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "status": "active",
    "isEmailVerified": false
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body fields |
| `409` | Email already exists | Duplicate email |
| `409` | `{field} already exists` | MongoDB unique constraint (e.g. phone) |

### Example Request

```http
POST /api/v1/auth/register HTTP/1.1
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "SecureP@ss1"
}
```

---

## Login

| Field | Value |
|-------|-------|
| **Module** | Authentication |
| **Method** | `POST` |
| **Route** | `/api/v1/auth/login` |
| **Authentication Required** | No |
| **Role Required** | — |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email |
| `password` | string | Yes | Non-empty |

### Validation Rules

- `email` — required, valid email
- `password` — required

### Success Response — `200 OK`

**Headers:** `Set-Cookie: accessToken=<jwt>; HttpOnly; SameSite=Strict`

```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "firstName": "Jane",
      "lastName": "Doe",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer",
      "status": "active",
      "isEmailVerified": false
    }
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body |
| `401` | Invalid email or password | Wrong credentials |
| `403` | Account is not active | User status is not `active` |

### Example Request

```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "SecureP@ss1"
}
```

---

## Get Current User (Auth)

| Field | Value |
|-------|-------|
| **Module** | Authentication |
| **Method** | `GET` |
| **Route** | `/api/v1/auth/me` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Request Parameters

None.

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "firstName": "Jane",
    "lastName": "Doe",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "status": "active",
    "isEmailVerified": false
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | Authentication required | Missing cookie |
| `401` | Invalid or expired token | Bad JWT |
| `401` | User no longer exists | User deleted |
| `403` | Account is not active | Suspended/inactive account |

---

## Logout

| Field | Value |
|-------|-------|
| **Module** | Authentication |
| **Method** | `POST` |
| **Route** | `/api/v1/auth/logout` |
| **Authentication Required** | No |
| **Role Required** | — |

### Success Response — `200 OK`

Clears `accessToken` cookie.

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Verify Email

| Field | Value |
|-------|-------|
| **Module** | Authentication |
| **Method** | `POST` |
| **Route** | `/api/v1/auth/verify-email` |
| **Authentication Required** | No |
| **Role Required** | — |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Raw verification token from email link |

### Validation Rules

- `token` — required, non-empty, trimmed

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Missing token |
| `400` | Invalid or expired verification token | Token invalid or expired |

### Example Request

```json
{
  "token": "a1b2c3d4e5f6..."
}
```

---

## Forgot Password

| Field | Value |
|-------|-------|
| **Module** | Authentication |
| **Method** | `POST` |
| **Route** | `/api/v1/auth/forgot-password` |
| **Authentication Required** | No |
| **Role Required** | — |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email |

### Validation Rules

- `email` — required, valid email, normalized

### Success Response — `200 OK`

Always returns the same message (prevents email enumeration):

```json
{
  "success": true,
  "message": "If an account exists for that email, a password reset link has been sent."
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid email |
| `500` | Internal Server Error | Email send failed after token was saved |

---

## Reset Password

| Field | Value |
|-------|-------|
| **Module** | Authentication |
| **Method** | `POST` |
| **Route** | `/api/v1/auth/reset-password` |
| **Authentication Required** | No |
| **Role Required** | — |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Raw reset token from email |
| `password` | string | Yes | New strong password |
| `confirmPassword` | string | Yes | Must match `password` |

### Validation Rules

- `token` — required
- `password` — required, 8–128 chars, strong password rules
- `confirmPassword` — required, must equal `password`

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body or password mismatch |
| `400` | Invalid or expired password reset token | Token invalid or expired |

---

# Users

Base path: `/api/v1/users`

---

## Get Profile

| Field | Value |
|-------|-------|
| **Module** | Users |
| **Method** | `GET` |
| **Route** | `/api/v1/users/me` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "firstName": "Jane",
    "lastName": "Doe",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "status": "active",
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "address": []
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | Authentication required | Missing/invalid token |
| `403` | Account is not active | Inactive account |

---

## Update Profile

| Field | Value |
|-------|-------|
| **Module** | Users |
| **Method** | `PATCH` |
| **Route** | `/api/v1/users/me` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Request Body

All fields optional. Only `firstName`, `lastName`, and `phone` are applied by the service.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | No | 1–50 characters |
| `lastName` | string | No | 1–50 characters |
| `phone` | string | No | Valid mobile phone |

### Validation Rules

- `firstName` — optional, 1–50 chars if provided
- `lastName` — optional, 1–50 chars if provided
- `phone` — optional, valid mobile phone if provided

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfullly",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "firstName": "Jane",
    "lastName": "Smith",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "role": "customer",
    "status": "active",
    "isEmailVerified": true
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid phone or name length |
| `401` | Authentication required | Missing/invalid token |

---

## Change Password

| Field | Value |
|-------|-------|
| **Module** | Users |
| **Method** | `PATCH` |
| **Route** | `/api/v1/users/change-password` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | Current password |
| `newPassword` | string | Yes | New strong password |
| `confirmPassword` | string | Yes | Must match `newPassword` |

### Validation Rules

- `currentPassword` — required
- `newPassword` — required, 8–128 chars, strong password; must differ from `currentPassword`
- `confirmPassword` — required, must equal `newPassword`

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body |
| `400` | Current password is incorrect | Wrong current password |
| `401` | Authentication required | Missing/invalid token |

---

# Categories

Base path: `/api/v1/categories`

**Status values:** `active`, `inactive` (default: `active`)

---

## List Categories

| Field | Value |
|-------|-------|
| **Module** | Categories |
| **Method** | `GET` |
| **Route** | `/api/v1/categories` |
| **Authentication Required** | No |
| **Role Required** | — |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default `1`) |
| `limit` | number | Items per page (default `10`) |
| `sort` | string | Sort field (default `-createdAt`) |
| `search` | string | Search category `name` |
| `status` | string | Filter by status (`active`, `inactive`) |

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "Running Shoes",
        "slug": "running-shoes",
        "description": "Footwear for runners",
        "image": "https://example.com/cat.jpg",
        "status": "active",
        "isDeleted": false,
        "createdBy": "665f1a2b3c4d5e6f7a8b9c01",
        "createdAt": "2026-01-15T10:00:00.000Z",
        "updatedAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

> Only non-deleted categories (`isDeleted: false`) are returned.

---

## Get Category Products

| Field | Value |
|-------|-------|
| **Module** | Categories |
| **Method** | `GET` |
| **Route** | `/api/v1/categories/:slug/products` |
| **Authentication Required** | No |
| **Role Required** | — |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Category slug (e.g. `running-shoes`) |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `sort` | string | Sort field |
| `search` | string | Search product `name` or `brand` |
| `brand` | string | Filter by brand |
| `featured` | boolean | Filter featured products |

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Running Shoes",
      "slug": "running-shoes"
    },
    "products": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | Category not found | Invalid slug or deleted category |

---

## Get Category

| Field | Value |
|-------|-------|
| **Module** | Categories |
| **Method** | `GET` |
| **Route** | `/api/v1/categories/:identifier` |
| **Authentication Required** | No |
| **Role Required** | — |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `identifier` | string | MongoDB ObjectId or category slug |

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Running Shoes",
    "slug": "running-shoes",
    "description": "Footwear for runners",
    "status": "active",
    "isDeleted": false
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | Category not found | Not found or deleted |

---

## Create Category

| Field | Value |
|-------|-------|
| **Module** | Categories |
| **Method** | `POST` |
| **Route** | `/api/v1/categories` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Max 100 characters; slug auto-generated |
| `description` | string | No | Max 500 characters |
| `image` | string (URL) | No | Valid URL |
| `status` | string | No | `active` or `inactive` (not validated; passed to model if sent) |

### Validation Rules

- `name` — required, max 100 chars
- `description` — optional, max 500 chars
- `image` — optional, valid URL

### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Running Shoes",
    "slug": "running-shoes",
    "status": "active",
    "createdBy": "665f1a2b3c4d5e6f7a8b9c01"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body |
| `401` | Authentication required | Not logged in |
| `403` | Forbidden | Not admin |
| `409` | Category already exists | Duplicate name |

---

## Update Category

| Field | Value |
|-------|-------|
| **Module** | Categories |
| **Method** | `PATCH` |
| **Route** | `/api/v1/categories/:id` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Category ID |

### Request Body

Allowed fields (service whitelist): `name`, `description`, `image`, `status`

### Validation Rules

- `name` — optional, max 100 chars
- `description` — optional, max 500 chars
- `image` — optional, valid URL

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": { }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body |
| `403` | Forbidden | Not admin |
| `404` | Category not found | Invalid or deleted ID |

---

## Archive Category

| Field | Value |
|-------|-------|
| **Module** | Categories |
| **Method** | `DELETE` |
| **Route** | `/api/v1/categories/:id` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Category ID |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Category archived successfully"
}
```

Sets `isDeleted: true` (soft delete).

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `403` | Forbidden | Not admin |
| `404` | Category not found | Invalid ID |

---

## Restore Category

| Field | Value |
|-------|-------|
| **Module** | Categories |
| **Method** | `PATCH` |
| **Route** | `/api/v1/categories/:id/restore` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Category ID |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Category restored successfully",
  "data": { }
}
```

Sets `isDeleted: false`.

---

# Products

Base path: `/api/v1/products`

**Status values:** `draft`, `active`, `archived` (default: `draft` on create; public list/detail returns `active` only)

---

## Create Product

| Field | Value |
|-------|-------|
| **Module** | Products |
| **Method** | `POST` |
| **Route** | `/api/v1/products` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Body

| Field | Type | Required | Validated | Description |
|-------|------|----------|-----------|-------------|
| `name` | string | Yes | Yes | Max 200 chars; slug auto-generated |
| `category` | ObjectId | Yes | Yes | Must exist and not be deleted |
| `sku` | string | Yes | Yes | Unique, uppercased by model |
| `price` | number | Yes | Yes | ≥ 0 |
| `stockQuantity` | integer | Yes | Yes | ≥ 0 |
| `compareAtPrice` | number | No | Yes | ≥ 0 if provided |
| `shortDescription` | string | No | No | Max 300 chars (model) |
| `description` | string | No | No | Long description |
| `brand` | string | No | No | Max 100 chars |
| `featured` | boolean | No | No | Default `false` |
| `status` | string | No | No | `draft`, `active`, `archived` |
| `lowStockThreshold` | number | No | No | Default `5` |

### Validation Rules

- `name` — required, max 200 chars
- `category` — required, valid MongoId
- `sku` — required
- `price` — required, float ≥ 0
- `compareAtPrice` — optional, float ≥ 0
- `stockQuantity` — required, int ≥ 0

### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Pro Runner X",
    "slug": "pro-runner-x",
    "sku": "RUN-001",
    "price": 129.99,
    "stockQuantity": 50,
    "status": "draft",
    "category": "665f1a2b3c4d5e6f7a8b9c01",
    "createdBy": "665f1a2b3c4d5e6f7a8b9c02"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body |
| `403` | Forbidden | Not admin |
| `404` | Category not found | Invalid category |
| `409` | Product SKU already exists | Duplicate SKU |

### Example Request

```json
{
  "name": "Pro Runner X",
  "category": "665f1a2b3c4d5e6f7a8b9c01",
  "sku": "RUN-001",
  "price": 129.99,
  "stockQuantity": 50,
  "brand": "SportMax",
  "status": "active"
}
```

---

## List Products

| Field | Value |
|-------|-------|
| **Module** | Products |
| **Method** | `GET` |
| **Route** | `/api/v1/products` |
| **Authentication Required** | No |
| **Role Required** | — |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `sort` | string | Sort field (default `-createdAt`) |
| `search` | string | Search `name` or `brand` |
| `brand` | string | Filter by brand |
| `status` | string | Filter by status (default forced to `active`) |
| `featured` | boolean/string | Filter featured |
| `category` | ObjectId | Filter by category ID |

> Service always filters `isDeleted: false` and `status: 'active'` unless `status` is overridden via query.

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "Pro Runner X",
        "slug": "pro-runner-x",
        "price": 129.99,
        "category": {
          "_id": "665f1a2b3c4d5e6f7a8b9c01",
          "name": "Running Shoes",
          "slug": "running-shoes"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## Get Product

| Field | Value |
|-------|-------|
| **Module** | Products |
| **Method** | `GET` |
| **Route** | `/api/v1/products/:identifier` |
| **Authentication Required** | No |
| **Role Required** | — |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `identifier` | string | MongoDB ObjectId or product slug |

### Success Response — `200 OK`

Returns full product document with populated `category` (`name`, `slug`). Includes virtuals when serialized (`availableStock`, `inStock`, `primaryImage`, etc.).

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | Product not found | Not found, deleted, or not `active` |

---

## Update Product

| Field | Value |
|-------|-------|
| **Module** | Products |
| **Method** | `PATCH` |
| **Route** | `/api/v1/products/:id` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Product ID |

### Request Body

Service whitelist: `name`, `shortDescription`, `description`, `brand`, `price`, `compareAtPrice`, `stockQuantity`, `featured`, `status`, `images`

### Validation Rules

- `name` — optional, max 200 chars
- `price` — optional, float ≥ 0
- `compareAtPrice` — optional, float ≥ 0
- `stockQuantity` — optional, int ≥ 0

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body |
| `403` | Forbidden | Not admin |
| `404` | Product not found | Invalid or deleted ID |

---

## Archive Product

| Field | Value |
|-------|-------|
| **Module** | Products |
| **Method** | `DELETE` |
| **Route** | `/api/v1/products/:id` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Product archived successfully"
}
```

Sets `isDeleted: true` and `status: 'archived'`.

---

## Restore Product

| Field | Value |
|-------|-------|
| **Module** | Products |
| **Method** | `PATCH` |
| **Route** | `/api/v1/products/:id/restore` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Product restored successfully",
  "data": { }
}
```

Sets `isDeleted: false` and `status: 'active'`.

---

# Product Images

Base path: `/api/v1/products`

Static files served at `/uploads/products/{filename}`.

**Upload constraints** (from `constants/upload.constants.js`):

| Constraint | Value |
|------------|-------|
| Allowed types | `image/jpeg`, `image/png`, `image/webp` |
| Max file size | 5 MB |
| Max images per product | 10 |
| Form field name | `images` (array, max 10 per request) |

---

## Upload Product Images

| Field | Value |
|-------|-------|
| **Module** | Product Images |
| **Method** | `POST` |
| **Route** | `/api/v1/products/:id/images` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |
| **Content-Type** | `multipart/form-data` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Product ID |

### Request Body (multipart)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | file[] | Yes | One or more image files |

### Validation Rules

- No `express-validator` chain
- Multer file filter: JPG, PNG, WEBP only
- Max 10 files per request; total gallery max 10 images
- Service requires at least one file

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "images": [
      {
        "url": "/uploads/products/1718700000000-123456789.jpg",
        "filename": "1718700000000-123456789.jpg",
        "alt": "Pro Runner X",
        "isPrimary": true,
        "sortOrder": 1
      }
    ]
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Only JPG, PNG and WEBP images are allowed | Invalid MIME type |
| `400` | File size exceeds 5MB limit | File too large |
| `400` | At least one image is required | Empty upload |
| `400` | Maximum 10 images allowed | Gallery limit exceeded |
| `403` | Forbidden | Not admin |
| `404` | Product not found | Invalid product ID |

### Example Request

```http
POST /api/v1/products/665f1a2b3c4d5e6f7a8b9c0d/images HTTP/1.1
Content-Type: multipart/form-data; boundary=----FormBoundary
Cookie: accessToken=<jwt>

------FormBoundary
Content-Disposition: form-data; name="images"; filename="shoe.jpg"
Content-Type: image/jpeg

<binary>
------FormBoundary--
```

---

## Delete Product Image

| Field | Value |
|-------|-------|
| **Module** | Product Images |
| **Method** | `DELETE` |
| **Route** | `/api/v1/products/:id/images/:filename` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Product ID |
| `filename` | string | Image filename (e.g. `1718700000000-123456789.jpg`) |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": { }
}
```

Deletes file from disk and removes from `images` array. If deleted image was primary, first remaining image becomes primary.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `403` | Forbidden | Not admin |
| `404` | Product not found | Invalid product |
| `404` | Image not found | Filename not in gallery |

---

## Set Primary Image

| Field | Value |
|-------|-------|
| **Module** | Product Images |
| **Method** | `PATCH` |
| **Route** | `/api/v1/products/:Id/images/primary` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

> **Implementation note:** Route parameter is `:Id` (capital I). Controller reads `req.params.id` (lowercase). This mismatch may prevent the handler from receiving the product ID correctly.

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `Id` | ObjectId | Product ID (route param name as registered) |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | Yes | Image filename to set as primary |

### Validation Rules

- `filename` — required, non-empty, trimmed

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Primary image updated successfully",
  "data": { }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Missing filename |
| `403` | Forbidden | Not admin |
| `404` | Product not found | Invalid product |
| `404` | Image not found | Filename not in gallery |

---

## Reorder Images

| Field | Value |
|-------|-------|
| **Module** | Product Images |
| **Method** | `PATCH` |
| **Route** | `/api/v1/products/Id/images/reorder` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

> **Implementation note:** Route is registered as a **literal path** `/Id/images/reorder` (no `:id` parameter). Controller expects `req.params.id` and `req.body.images`. This endpoint may not function as intended for a specific product.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | string[] | Yes | Ordered array of filenames; length must match gallery size |

### Validation Rules

- `images` — required array, min length 1

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Product gallery reordered successfully",
  "data": { }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Missing or invalid `images` array |
| `400` | Image order does not match gallery | Array length mismatch |
| `400` | Invalid image: {filename} | Unknown filename in order |
| `403` | Forbidden | Not admin |
| `404` | Product not found | Product ID unavailable |

---

## Update Image Alt Text

| Field | Value |
|-------|-------|
| **Module** | Product Images |
| **Method** | `PATCH` |
| **Route** | `/api/v1/products/:Id/images/alt-text` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

> **Implementation note:** Same `:Id` vs `req.params.id` mismatch as Set Primary Image.

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `Id` | ObjectId | Product ID (route param name as registered) |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | Yes | Image filename |
| `alt` | string | Yes | Alt text, max 200 chars |

### Validation Rules

- `filename` — required
- `alt` — required, max 200 chars

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Image alt text updated successfully",
  "data": { }
}
```

---

# Inventory

Base path: `/api/v1/inventory`

**Adjustment reasons:** `restock`, `manual_adjustment`, `damaged`, `returned`

---

## Adjust Inventory

| Field | Value |
|-------|-------|
| **Module** | Inventory |
| **Method** | `PATCH` |
| **Route** | `/api/v1/inventory/:productId/adjust` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | ObjectId | Product ID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `adjustment` | integer | Yes | Signed integer (+/-) applied to `stockQuantity` |
| `reason` | string | Yes | One of: `restock`, `manual_adjustment`, `damaged`, `returned` |

### Validation Rules

- `adjustment` — required integer
- `reason` — required, must be valid `INVENTORY_REASONS` value

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "stockQuantity": 55,
    "reservedQuantity": 2
  }
}
```

Creates an `InventoryHistory` audit record.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body |
| `400` | Insufficient stock | Adjustment would make stock negative |
| `403` | Forbidden | Not admin |
| `404` | Product not found | Invalid or deleted product |

### Example Request

```json
{
  "adjustment": 10,
  "reason": "restock"
}
```

---

## Get Inventory History

| Field | Value |
|-------|-------|
| **Module** | Inventory |
| **Method** | `GET` |
| **Route** | `/api/v1/inventory/:productId/history` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | ObjectId | Product ID |

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0e",
      "product": "665f1a2b3c4d5e6f7a8b9c0d",
      "previousQuantity": 45,
      "newQuantity": 55,
      "adjustment": 10,
      "reason": "restock",
      "adjustedBy": {
        "_id": "665f1a2b3c4d5e6f7a8b9c01",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "createdAt": "2026-06-19T12:00:00.000Z"
    }
  ]
}
```

Sorted by `createdAt` descending. No request validation.

---

## Get Inventory Summary

| Field | Value |
|-------|-------|
| **Module** | Inventory |
| **Method** | `GET` |
| **Route** | `/api/v1/inventory/:productId/summary` |
| **Authentication Required** | Yes |
| **Role Required** | `admin` |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | ObjectId | Product ID |

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "productId": "665f1a2b3c4d5e6f7a8b9c0d",
    "stockQuantity": 55,
    "reservedQuantity": 2,
    "availableStock": 53,
    "lowStockThreshold": 5,
    "inStock": true,
    "lowStock": false,
    "inventoryStatus": "in_stock"
  }
}
```

`inventoryStatus` values: `in_stock`, `low_stock`, `out_of_stock`

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `403` | Forbidden | Not admin |
| `404` | Product not found | Invalid or deleted product |

---

# Cart

Base path: `/api/v1/cart`

All cart endpoints require authentication. Adding to cart reserves inventory (`reservedQuantity` on product).

---

## Add Item to Cart

| Field | Value |
|-------|-------|
| **Module** | Cart |
| **Method** | `POST` |
| **Route** | `/api/v1/cart/items` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | ObjectId | Yes | Active, non-deleted product |
| `quantity` | integer | Yes | Min 1 |

### Validation Rules

- `productId` — valid MongoId
- `quantity` — integer ≥ 1

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0f",
    "user": "665f1a2b3c4d5e6f7a8b9c01",
    "items": [
      {
        "product": {
          "_id": "665f1a2b3c4d5e6f7a8b9c0d",
          "name": "Pro Runner X",
          "slug": "pro-runner-x",
          "price": 129.99,
          "images": [],
          "stockQuantity": 55,
          "reservedQuantity": 2,
          "lowStockThreshold": 5
        },
        "quantity": 2,
        "priceSnapshot": 129.99
      }
    ],
    "totalItems": 2,
    "subtotal": 259.98
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid body |
| `400` | Insufficient inventory available | Not enough `availableStock` |
| `401` | Authentication required | Not logged in |
| `404` | Product not found | Inactive or deleted product |

### Example Request

```http
POST /api/v1/cart/items HTTP/1.1
Content-Type: application/json
Cookie: accessToken=<jwt>

{
  "productId": "665f1a2b3c4d5e6f7a8b9c0d",
  "quantity": 2
}
```

---

## Get My Cart

| Field | Value |
|-------|-------|
| **Module** | Cart |
| **Method** | `GET` |
| **Route** | `/api/v1/cart` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Success Response — `200 OK`

Returns cart with populated products, virtuals `totalItems` and `subtotal`.

If no cart exists:

```json
{
  "success": true,
  "data": {
    "items": [],
    "totalItems": 0,
    "subtotal": 0
  }
}
```

---

## Update Cart Item Quantity

| Field | Value |
|-------|-------|
| **Module** | Cart |
| **Method** | `PATCH` |
| **Route** | `/api/v1/cart/items/:productId` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | ObjectId | Product ID in cart |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quantity` | integer | Yes | New quantity (min 1) |

### Validation Rules

- `quantity` — integer ≥ 1

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": { }
}
```

Adjusts inventory reservations: increases reserve on quantity up; releases on quantity down.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | Validation failed | Invalid quantity |
| `400` | Insufficient inventory available | Not enough stock for increase |
| `404` | Cart not found | No cart for user |
| `404` | Cart item not found | Product not in cart |

---

## Remove Cart Item

| Field | Value |
|-------|-------|
| **Module** | Cart |
| **Method** | `DELETE` |
| **Route** | `/api/v1/cart/items/:productId` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | ObjectId | Product ID to remove |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Cart item removed successfully",
  "data": { }
}
```

Releases reserved inventory for the removed quantity.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | Cart not found | No cart |
| `404` | Cart item not found | Product not in cart |

---

## Clear Cart

| Field | Value |
|-------|-------|
| **Module** | Cart |
| **Method** | `DELETE` |
| **Route** | `/api/v1/cart` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "items": [],
    "totalItems": 0,
    "subtotal": 0
  }
}
```

Releases all reserved inventory for cart items.

---

# Wishlist

Base path: `/api/v1/wishlist`

> Implemented in the codebase but not listed in the original module grouping. Documented here because the routes exist in `app.js`.

---

## Wishlist Endpoints Summary

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| `GET` | `/api/v1/wishlist` | Yes | Any | Get my wishlist |
| `POST` | `/api/v1/wishlist/:productId` | Yes | Any | Add product |
| `DELETE` | `/api/v1/wishlist/:productId` | Yes | Any | Remove product |

No `express-validator` chains are registered for wishlist routes.

---

## Get My Wishlist

| Field | Value |
|-------|-------|
| **Module** | Wishlist |
| **Method** | `GET` |
| **Route** | `/api/v1/wishlist` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c10",
    "user": "665f1a2b3c4d5e6f7a8b9c01",
    "products": [
      {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "Pro Runner X",
        "slug": "pro-runner-x",
        "price": 129.99,
        "images": []
      }
    ],
    "totalItems": 1
  }
}
```

Empty wishlist:

```json
{
  "success": true,
  "data": {
    "products": [],
    "totalItems": 0
  }
}
```

---

## Add to Wishlist

| Field | Value |
|-------|-------|
| **Module** | Wishlist |
| **Method** | `POST` |
| **Route** | `/api/v1/wishlist/:productId` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | ObjectId | Active, non-deleted product |

### Validation Rules

None at route level. Service validates product exists.

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Product added to wishlist",
  "data": { }
}
```

Idempotent for duplicate adds (no error if already in wishlist).

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | Product not found | Invalid or inactive product |

---

## Remove from Wishlist

| Field | Value |
|-------|-------|
| **Module** | Wishlist |
| **Method** | `DELETE` |
| **Route** | `/api/v1/wishlist/:productId` |
| **Authentication Required** | Yes |
| **Role Required** | Any authenticated user |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Product removed from wishlist",
  "data": { }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | Wishlist not found | User has no wishlist document |

---

# System

## Health Check

| Field | Value |
|-------|-------|
| **Module** | System |
| **Method** | `GET` |
| **Route** | `/health` |
| **Authentication Required** | No |

### Success Response — `200 OK`

```json
{
  "status": "success"
}
```

> Note: Health response uses `status` instead of the `success` envelope used by `/api/v1/*` routes.

---

## Static Files

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **Route** | `/uploads/products/{filename}` |
| **Authentication Required** | No |

Serves product images uploaded via the admin image endpoint.

---

# Appendix: Duplicate User Endpoints

Two modules expose a "current user" read endpoint with different response shapes:

| Route | Fields returned |
|-------|-----------------|
| `GET /api/v1/auth/me` | `id`, `firstName`, `lastName`, `fullName`, `email`, `role`, `status`, `isEmailVerified` |
| `GET /api/v1/users/me` | Above plus `isPhoneVerified`, `address` |

Both require authentication. Prefer `/api/v1/users/me` for full profile data.
