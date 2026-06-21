# Authentication Module

Last audited against code: 2026-06-21.

## Implemented

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- Cookie-based JWT auth through HTTP-only `accessToken`.
- Access token expiration through `JWT_EXPIRES_IN` with default `1h`.
- Cookie max age from `COOKIE_EXPIRES_IN * 60 * 1000`.
- Login requires active status and verified email.
- Forgot-password response is generic to reduce email enumeration.
- Verification and reset tokens are stored hashed, not raw.
- Auth routes are rate limited.

## Authentication Flow

1. User registers with name, email, password.
2. User receives a verification email generated from `FRONTEND_URL`.
3. `POST /verify-email` marks `isEmailVerified` true and clears verification token fields.
4. User logs in with email/password.
5. Server sets `accessToken` as an HTTP-only cookie.
6. Protected routes use `protect` to verify the cookie JWT and load the current user.
7. Admin routes use `authorize(USER_ROLES.ADMIN)`.

## User and Password Flows

| Flow | Status | Notes |
|------|--------|-------|
| Registration | Implemented | Creates `User`, sends verification email best-effort. |
| Login | Implemented | Requires correct password, active status, verified email. |
| Logout | Implemented | Clears cookie; no server-side token revocation. |
| Email verification | Implemented | Token body field; token hash lookup with expiry. |
| Forgot password | Implemented | Sends reset email if user exists; generic response either way. |
| Reset password | Implemented | Token + new password + confirm password. |
| Change password | Implemented under Users | Requires current password and authenticated user. |
| Refresh token | Missing | No refresh token model/cookie. |
| Phone verification | Partially implemented | Model fields/method exist; no API or SMS provider. |

## Security Notes

- Passwords are bcrypt-hashed by `User` model hooks.
- `password` has `select: false`.
- JWT payload contains `userId` and `role`.
- Authorization uses the database-loaded `req.user.role`, not only the JWT role claim.
- `status !== active` blocks login and protected routes.
- `isEmailVerified === false` blocks login.

## Known Gaps

- No refresh tokens.
- No server-side JWT revocation on logout.
- Password reset/change does not invalidate active JWTs.
- No email verification resend endpoint.
- No phone verification endpoints.
- No MFA.
- No admin user management.

See `docs/API_REFERENCE.md` for endpoint request/response details and `docs/DATABASE_SCHEMA.md` for User fields.
