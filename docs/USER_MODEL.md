# User Model

Last audited against code: 2026-06-21.

Canonical schema details are in `docs/DATABASE_SCHEMA.md`.

## Model Summary

| Property | Value |
|----------|-------|
| File | `back-end/models/user.model.js` |
| Model | `User` |
| Collection | `users` |
| Timestamps | Yes |
| Main API routes | `/api/v1/auth`, `/api/v1/users` |

## Implemented Fields

- Credentials: `email`, `password`.
- Profile: `firstName`, `lastName`, `phone`, `avatar`, `dateOfBirth`.
- Addresses: embedded `address[]` with `street`, `city`, `state`, `zipCode`, `country`, `isPrimary`, `label`.
- Authorization: `role` (`customer`, `admin`), `status` (`active`, `inactive`, `suspended`).
- Verification state: `isEmailVerified`, `isPhoneVerified`.
- Token hashes: email verification, phone verification, password reset.

## Implemented User APIs

| Capability | Status | Route |
|------------|--------|-------|
| Profile retrieval | Implemented | `GET /api/v1/users/me` |
| Profile update | Implemented | `PATCH /api/v1/users/me` |
| Phone support | Implemented as profile field | `PATCH /api/v1/users/me` |
| Address list | Implemented | `GET /api/v1/users/addresses` |
| Address create | Implemented | `POST /api/v1/users/addresses` |
| Address update | Implemented | `PATCH /api/v1/users/addresses/:addressId` |
| Address delete | Implemented | `DELETE /api/v1/users/addresses/:addressId` |
| Change password | Implemented | `PATCH /api/v1/users/change-password` |
| Phone verification | Not implemented | Model method only |
| Admin user management | Not implemented | No routes |

## Hooks and Methods

| Type | Name | Purpose |
|------|------|---------|
| Hook | `pre('save')` | Hashes modified password. |
| Hook | `pre('findOneAndUpdate')` | Hashes plain password updates and rejects pre-hashed values. |
| Virtual | `fullName` | Combines first and last name. |
| Method | `comparePassword` | bcrypt password check. |
| Method | `generateEmailVerificationToken` | Stores hashed token and expiry, returns raw token. |
| Method | `generatePasswordResetToken` | Stores hashed token and expiry, returns raw token. |
| Method | `generatePhoneVerificationToken` | Exists but unused by API. |

## Indexes and Constraints

- `email` is required, unique, lowercase, trimmed, indexed, and email-validated.
- `phone` is unique and sparse.
- Compound indexes exist for `{ role, status }`, `{ passwordResetToken, passwordResetExpires }`, and `{ emailVerificationToken, emailVerificationTokenExpires }`.

## Current Gaps

- No API changes `role` or `status`.
- No API updates `avatar` or `dateOfBirth`.
- Phone verification is not wired to routes or a provider.
- No session invalidation fields such as `tokenVersion` or `passwordChangedAt`.
