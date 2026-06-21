# Folder Structure

Last audited against code: 2026-06-21.

## Repository Layout

```text
mern-ecommerce-sports/
|-- back-end/
|   |-- app.js
|   |-- server.js
|   |-- package.json
|   |-- package-lock.json
|   |-- config/
|   |   `-- db.js
|   |-- constants/
|   |   |-- category.constants.js
|   |   |-- inventory.constants.js
|   |   |-- product.constants.js
|   |   |-- upload.constants.js
|   |   `-- user.constants.js
|   |-- controllers/
|   |   |-- auth.controller.js
|   |   |-- cart.controller.js
|   |   |-- category.controller.js
|   |   |-- inventory.controller.js
|   |   |-- product.controller.js
|   |   |-- user.controller.js
|   |   `-- wishlist.controller.js
|   |-- middleware/
|   |   |-- auth.middleware.js
|   |   |-- error.middleware.js
|   |   |-- upload.middlware.js
|   |   `-- validate.middleware.js
|   |-- models/
|   |   |-- cart.model.js
|   |   |-- category.model.js
|   |   |-- inventory-history.model.js
|   |   |-- product.model.js
|   |   |-- user.model.js
|   |   `-- wishlist.model.js
|   |-- providers/
|   |   |-- email.provider.js
|   |   `-- storage/
|   |       `-- localStorage.provider.js
|   |-- routes/
|   |   |-- auth.routes.js
|   |   |-- cart.routes.js
|   |   |-- category.routes.js
|   |   |-- inventory.routes.js
|   |   |-- product.routes.js
|   |   |-- user.routes.js
|   |   `-- wishlist.routes.js
|   |-- services/
|   |   |-- auth.service.js
|   |   |-- cart.service.js
|   |   |-- category.service.js
|   |   |-- email.service.js
|   |   |-- file.service.js
|   |   |-- inventory.service.js
|   |   |-- product.service.js
|   |   |-- user.service.js
|   |   `-- wishlist.service.js
|   |-- templates/
|   |   |-- reset-password-email.html
|   |   `-- verification-email.html
|   |-- utils/
|   |   |-- api-query.util.js
|   |   |-- app-error.util.js
|   |   |-- file.util.js
|   |   |-- jwt.util.js
|   |   |-- password.util.js
|   |   `-- token.util.js
|   `-- validators/
|       |-- auth.validator.js
|       |-- cart.validator.js
|       |-- category.validator.js
|       |-- inventory.validator.js
|       |-- product.validator.js
|       `-- wishlist.validator.js
|-- docs/
|   |-- API_DOCUMENTATION.md
|   |-- API_REFERENCE.md
|   |-- ARCHITECTURE.md
|   |-- AUTH_MODULE.md
|   |-- CART_MODULE.md
|   |-- CATEGORY_MODULE.md
|   |-- DATABASE_SCHEMA.md
|   |-- FOLDER_STRUCTURE.md
|   |-- FUTURE_ROADMAP.md
|   |-- INVENTORY_MODULE.md
|   |-- PRODUCT_MODULE.md
|   |-- PROJECT_OVERVIEW.md
|   |-- ROADMAP.md
|   `-- USER_MODEL.md
|-- front-end/
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   |-- vite.config.js
|   |-- public/
|   |   |-- favicon.svg
|   |   `-- icons.svg
|   `-- src/
|       |-- App.css
|       |-- App.jsx
|       |-- index.css
|       |-- main.jsx
|       `-- assets/
|           |-- hero.png
|           |-- react.svg
|           `-- vite.svg
|-- .gitignore
`-- node_modules/
```

## Backend Folder Roles

| Folder/file | Purpose |
|-------------|---------|
| `app.js` | Builds the Express app, registers middleware, mounts routes, static uploads, 404, and error handler. |
| `server.js` | Loads env, connects MongoDB, verifies email provider, starts the listener. |
| `config/` | Database connection setup. |
| `constants/` | Shared domain enums and upload limits. |
| `controllers/` | Thin HTTP adapters that call services and return response envelopes. |
| `middleware/` | Auth, authorization, validation aggregation, upload handling, and error formatting. |
| `models/` | Mongoose schemas, hooks, virtuals, indexes, and instance methods. |
| `providers/` | External adapters for SMTP email and local product image storage. |
| `routes/` | Express routers and middleware chains. |
| `services/` | Business rules and cross-model orchestration. |
| `templates/` | Verification and password reset email templates. |
| `utils/` | Reusable helpers for errors, JWT, password hashing, tokens, query parsing, and files. |
| `validators/` | `express-validator` rule chains. |

## Request Flow

```text
app.js -> route -> middleware/validators -> controller -> service -> model/provider -> response
```

## Not Present

The following folders/modules are not implemented:

- `orders`
- `checkout`
- `payments`
- `shipping`
- `reviews`
- `coupons`
- `analytics`
- `tests`
- CI/CD configuration

## Notes

- `upload.middlware.js` is misspelled in the actual code and documented as-is.
- `node_modules/` exists locally but is not source code.
- Runtime uploaded files are served from `/uploads`; the source tree currently contains the upload middleware/provider but not a tracked uploads folder.
