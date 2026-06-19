# User Model

Documentation for the Mongoose `User` model defined in `back-end/models/user.model.js`. MongoDB collection name: **`users`** (Mongoose pluralizes `User`).

---

# User Schema Overview

The User model is the **identity and authentication anchor** for the platform. It stores credentials, profile data, role/status metadata, embedded shipping addresses, and hashed verification/reset tokens.

| Aspect | Detail |
|--------|--------|
| **File** | `models/user.model.js` |
| **Model name** | `User` |
| **Collection** | `users` |
| **Timestamps** | `createdAt`, `updatedAt` (via `timestamps: true`) |
| **Embedded schemas** | `addressSchema` (array on user) |
| **Virtuals** | `fullName` |
| **Instance methods** | 4 |
| **Static methods** | None |
| **Explicit schema indexes** | `email` (field-level) |
| **Implicit indexes** | `email` (unique), `phone` (unique sparse) |

```mermaid
erDiagram
    users {
        ObjectId _id PK
        string email UK
        string password
        string firstName
        string lastName
        string phone UK_sparse
        string avatar
        date dateOfBirth
        string role
        string status
        boolean isEmailVerified
        boolean isPhoneVerified
        string emailVerificationToken
        date emailVerificationTokenExpires
        string phoneVerificationToken
        date phoneVerificationTokenExpires
        string passwordResetToken
        date passwordResetExpires
        date createdAt
        date updatedAt
    }

    users ||--o{ address : "embeds"
    address {
        string street
        string city
        string state
        string zipCode
        string country
        boolean isPrimary
        string label
    }
```

---

# Field-by-Field Explanation

## Identity & Credentials

| Field | Type | Purpose | Validation | Default |
|-------|------|---------|------------|---------|
| `_id` | `ObjectId` | MongoDB primary key | Auto-generated | — |
| `email` | `String` | Unique login identifier; used for registration, login, password reset | Required; `validator.isEmail`; `lowercase`, `trim`; **unique** | — |
| `password` | `String` | bcrypt-hashed credential | Required; `minlength: 6`; **`select: false`** (excluded from queries by default) | — |
| `firstName` | `String` | User given name; used in emails and profile | Required; `trim` | — |
| `lastName` | `String` | User family name; used in emails and profile | Required; `trim` | — |

## Contact & Profile

| Field | Type | Purpose | Validation | Default |
|-------|------|---------|------------|---------|
| `phone` | `String` | Optional contact number; updatable via `PATCH /users/me` | Optional; `trim`; **unique sparse**; `validator.isMobilePhone(value, 'any')` when set | `undefined` |
| `avatar` | `String` | Profile image URL or path | Optional; `trim` | `undefined` |
| `dateOfBirth` | `Date` | Date of birth | Optional | `undefined` |
| `address` | `[addressSchema]` | Embedded shipping/billing addresses | See [Address Structure](#address-structure); no API CRUD implemented | `[]` (empty if unset) |

## Authorization & Account State

| Field | Type | Purpose | Validation | Default |
|-------|------|---------|------------|---------|
| `role` | `String` | RBAC role for `authorize` middleware | `enum`: `customer`, `admin` (from `USER_ROLES`) | `customer` |
| `status` | `String` | Account lifecycle state; checked on login and `protect` | `enum`: `active`, `inactive`, `suspended` (from `USER_STATUS`) | `active` |
| `isEmailVerified` | `Boolean` | Whether user completed email verification | — | `false` |
| `isPhoneVerified` | `Boolean` | Whether phone was verified | — | `false` |

## Email Verification Tokens

| Field | Type | Purpose | Validation | Default |
|-------|------|---------|------------|---------|
| `emailVerificationToken` | `String` | **SHA-256 hash** of raw verification token (never store raw token) | Optional; `trim`; cleared after verification | `undefined` |
| `emailVerificationTokenExpires` | `Date` | Expiry for email verification | — | `undefined` |

Set by `generateEmailVerificationToken()` on register. Expiry: `now + TOKEN_EXPIRY_MINUTES` (default **10 minutes**).

## Phone Verification Tokens

| Field | Type | Purpose | Validation | Default |
|-------|------|---------|------------|---------|
| `phoneVerificationToken` | `String` | SHA-256 hash of raw phone verification token | Optional; `trim` | `undefined` |
| `phoneVerificationTokenExpires` | `Date` | Expiry for phone verification | — | `undefined` |

Set by `generatePhoneVerificationToken()`. **No API uses this method today** — model scaffolding only.

## Password Reset Tokens

| Field | Type | Purpose | Validation | Default |
|-------|------|---------|------------|---------|
| `passwordResetToken` | `String` | SHA-256 hash of raw reset token | Optional; `trim`; cleared after reset | `undefined` |
| `passwordResetExpires` | `Date` | Expiry for password reset | — | `undefined` |

Set by `generatePasswordResetToken()` on forgot-password. Expiry: `now + TOKEN_EXPIRY_MINUTES` (default **10 minutes**).

## Timestamps (Schema Options)

| Field | Type | Purpose | Validation | Default |
|-------|------|---------|------------|---------|
| `createdAt` | `Date` | Document creation time | Mongoose-managed | Set on create |
| `updatedAt` | `Date` | Last modification time | Mongoose-managed | Updated on save |

## Virtual Fields

| Virtual | Type | Purpose | Included in JSON |
|---------|------|---------|------------------|
| `fullName` | `String` (computed) | `` `${firstName} ${lastName}` `` | Yes when virtuals enabled on query/toJSON |

Defined via `userSchema.virtual('fullName').get(...)`. Used in auth service responses and profile DTOs.

---

# User Roles

Defined in `constants/user.constants.js` → `USER_ROLES`:

| Constant | Stored Value | Purpose | Set By |
|----------|--------------|---------|--------|
| `USER_ROLES.CUSTOMER` | `customer` | Default shopper role; access to cart, wishlist, profile | Default on registration |
| `USER_ROLES.ADMIN` | `admin` | Catalog, inventory, category management via `authorize(USER_ROLES.ADMIN)` | **No API to assign** — must be set directly in DB or seed |

| Role | JWT Payload | `authorize` Check |
|------|-------------|-------------------|
| `customer` | `role` included in token | Blocked from admin routes |
| `admin` | `role` included in token | Allowed on admin routes |

`protect` middleware reloads the user from DB on each request — **effective role is `req.user.role` from database**, not the JWT claim alone.

---

# User Statuses

Defined in `constants/user.constants.js` → `USER_STATUS`:

| Constant | Stored Value | Purpose | Checked Where |
|----------|--------------|---------|---------------|
| `USER_STATUS.ACTIVE` | `active` | Normal operating account | Default; required for login and `protect` |
| `USER_STATUS.INACTIVE` | `inactive` | Deactivated account | Login → `403`; `protect` → `403` |
| `USER_STATUS.SUSPENDED` | `suspended` | Suspended account | Login → `403`; `protect` → `403` |

| Status | Can Login? | Can Use Protected Routes? |
|--------|------------|---------------------------|
| `active` | Yes | Yes |
| `inactive` | No | No |
| `suspended` | No | No |

**No API endpoint** changes user status — admin tooling not implemented.

---

# Address Structure

Embedded sub-schema `addressSchema` — **not a separate collection**.

| Field | Type | Purpose | Validation | Default |
|-------|------|---------|------------|---------|
| `street` | `String` | Street address line | Optional; `trim` | — |
| `city` | `String` | City | Optional; `trim` | — |
| `state` | `String` | State/province | Optional; `trim` | — |
| `zipCode` | `String` | Postal code | Optional; `trim` | — |
| `country` | `String` | Country | Optional; `trim` | — |
| `isPrimary` | `Boolean` | Marks primary address | — | `false` |
| `label` | `String` | User-defined label (e.g. "Home", "Work") | Optional; `trim` | — |

### Current API Exposure

| Capability | Status |
|------------|--------|
| Read addresses | Returned on `GET /api/v1/users/me` as `address` array |
| Create/update/delete addresses | **Not implemented** — no service or route modifies `address` |

Embedded documents receive Mongoose subdocument `_id` by default unless `{ _id: false }` — `addressSchema` does **not** disable `_id`, so each address entry gets its own `_id`.

---

# Password Hashing

## Algorithm & Configuration

| Setting | Source | Value |
|---------|--------|-------|
| Algorithm | `utils/password.util.js` | bcrypt |
| Cost factor | `BCRYPT_ROUNDS` env var | Default **12** |
| Hash prefix | bcrypt output | `$2b$...` (detected in `findOneAndUpdate` guard) |

## When Hashing Occurs

| Trigger | Mechanism |
|---------|-----------|
| `user.save()` with modified password | `pre('save')` hook calls `hashPassword(this.password)` |
| `findOneAndUpdate` with password in update | `pre('findOneAndUpdate')` hook hashes plain password |

## Plain-Text Password Path

```javascript
// Registration / reset / change-password services set plain password:
user.password = newPassword;
await user.save();  // pre('save') hashes before MongoDB write
```

## Comparison

```javascript
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};
```

Requires `.select('+password')` on query — password excluded by default.

## Validator vs Schema Mismatch

| Layer | Minimum Password Rules |
|-------|--------------------------|
| Mongoose schema | `minlength: 6` |
| API validators (`auth.validator.js`) | 8–128 chars + strong password (upper, lower, number, symbol) |

API registration/reset/change-password paths enforce the stricter rules. Direct DB writes could bypass API validators.

---

# Schema Hooks

## Pre-Save Hook (`pre('save')`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Before `save()`, `create()` (which calls save) |
| **Condition** | `this.isModified('password')` |
| **Action** | Replace `this.password` with `await hashPassword(this.password)` |
| **Skip** | No-op if password unchanged |

```javascript
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await hashPassword(this.password);
});
```

## Pre-findOneAndUpdate Hook (`pre('findOneAndUpdate')`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Before `findOneAndUpdate`, `findByIdAndUpdate` |
| **Action 1** | `setOptions({ runValidators: true })` |
| **Action 2** | If update contains plain `password`, hash it |
| **Guard** | Rejects updates where password already starts with `$2` (bcrypt hash) |

```javascript
if (typeof password === 'string' && password.startsWith('$2')) {
  return next(new Error('Hashed passwords must not be supplied to update operations'));
}
```

**Note:** Current services use `user.save()` for password changes, not `findOneAndUpdate`. This hook is defensive for future query patterns.

## Other Hooks

| Hook Type | Implemented? |
|-----------|--------------|
| `post('save')` | No |
| `pre('validate')` | No |
| `post('find')` | No |
| `pre('remove')` / `deleteOne` | No |

---

# Instance Methods

## `comparePassword(candidatePassword)`

| Aspect | Detail |
|--------|--------|
| **Signature** | `async comparePassword(candidatePassword) → boolean` |
| **Purpose** | Verify login or current password during change-password |
| **Implementation** | Delegates to `comparePassword()` in `password.util.js` (bcrypt) |
| **Requires** | Document must have `password` loaded (`.select('+password')`) |
| **Used by** | `auth.service.js` → `loginUser`; `user.service.js` → `changePassword` |

## `generateEmailVerificationToken()`

| Aspect | Detail |
|--------|--------|
| **Signature** | `generateEmailVerificationToken() → rawToken (string)` |
| **Purpose** | Create one-time email verification credential |
| **Sets on document** | `emailVerificationToken` (SHA-256 hash), `emailVerificationTokenExpires` |
| **Returns** | **Raw** 64-char hex token (send to user via email only) |
| **Token source** | `crypto.randomBytes(32).toString('hex')` via `token.util.js` |
| **Expiry** | `Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000` |
| **Used by** | `auth.service.js` → `registerUser` |
| **Persisted** | On subsequent `user.save()` |

## `generatePasswordResetToken()`

| Aspect | Detail |
|--------|--------|
| **Signature** | `generatePasswordResetToken() → rawToken (string)` |
| **Purpose** | Create one-time password reset credential |
| **Sets on document** | `passwordResetToken` (SHA-256 hash), `passwordResetExpires` |
| **Returns** | Raw token for email link |
| **Expiry** | Same as email verification (`TOKEN_EXPIRY_MINUTES`) |
| **Used by** | `auth.service.js` → `forgotPassword` |
| **Cleared by** | `resetPassword` service after successful reset; rolled back if email send fails |

## `generatePhoneVerificationToken()`

| Aspect | Detail |
|--------|--------|
| **Signature** | `generatePhoneVerificationToken() → rawToken (string)` |
| **Purpose** | Create one-time phone verification credential |
| **Sets on document** | `phoneVerificationToken` (SHA-256 hash), `phoneVerificationTokenExpires` |
| **Returns** | Raw token |
| **Used by** | **Nothing in codebase** — method exists, no routes or services call it |

---

# Static Methods

**None implemented.**

The model exports only:

```javascript
module.exports = mongoose.model('User', userSchema);
```

No `userSchema.statics.*` definitions exist. All user queries use Mongoose built-ins:

| Query | Used In |
|-------|---------|
| `User.findOne({ email })` | `auth.service.js` |
| `User.findById(userId)` | `auth.middleware.js`, `user.service.js` |
| `new User({ ... })` + `save()` | `auth.service.js` registration |

---

# Indexes

## Explicit Field Index

| Field | Index Definition | Purpose |
|-------|------------------|---------|
| `email` | `index: true` on schema field | Faster lookups by email (login, register duplicate check, forgot-password) |

## Unique Constraints (Create Indexes Automatically)

| Field | Options | Purpose |
|-------|---------|---------|
| `email` | `unique: true` | Enforce one account per email; prevents duplicates at DB level |
| `phone` | `unique: true`, `sparse: true` | Enforce uniqueness only when phone is set; multiple users can omit phone |

### Sparse Index Behavior (`phone`)

| Document phone value | Indexed? | Unique enforced? |
|---------------------|----------|------------------|
| `undefined` / not set | No | No |
| `"+15551234567"` | Yes | Yes — duplicate phone rejected |

### Indexes Not Defined

| Field | Notes |
|-------|-------|
| `role` | No index — low cardinality; not used in frequent filtered queries |
| `status` | No index |
| `emailVerificationToken` | No index — looked up by hash + expiry in verification flow |
| `passwordResetToken` | No index — looked up by hash + expiry in reset flow |
| `createdAt` | No explicit index (timestamps only) |

---

# Security Considerations

## Strengths

| Measure | Implementation |
|---------|----------------|
| Password exclusion | `select: false` on `password` — not returned in default queries |
| bcrypt hashing | Cost factor 12 (configurable); automatic on save |
| Verification/reset tokens | Only SHA-256 hashes stored; raw tokens sent once via email |
| Token expiry | 10-minute default window on email/reset tokens |
| Email uniqueness | Schema + service-level duplicate check |
| Pre-hashed password rejection | `findOneAndUpdate` hook blocks double-hashing |
| Role/status on every request | `protect` reloads user from DB |

## Risks & Gaps

| Risk | Detail |
|------|--------|
| **Sensitive fields in responses** | Token hash fields could leak if full document serialized — services return DTOs, but raw `req.user` is full document |
| **Phone verification unused** | Token fields exist without cleanup workflow |
| **No password history** | Old passwords can be reused |
| **Schema minlength 6** | Weaker than API validator if bypassed |
| **JWT not invalidated on password change** | Model has no session/version field |
| **`isEmailVerified` not enforced** | Model tracks flag; login does not require it |
| **Admin role assignment** | No controlled API — manual DB change only |
| **Address data unvalidated at schema** | All address sub-fields optional with minimal constraints |
| **Avatar URL** | No URL validation on schema (unlike category `image`) |

## Token Field Exposure

| Field | Should appear in API responses? |
|-------|--------------------------------|
| `password` | Never (excluded by `select: false`) |
| `emailVerificationToken` | Never |
| `passwordResetToken` | Never |
| `phoneVerificationToken` | Never |

Auth and user services project safe DTOs. Avoid `res.json(req.user)` or `toJSON()` without field selection.

---

# Example User Document

Representative document after registration (before email verification):

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "customer",
  "status": "active",
  "isEmailVerified": false,
  "isPhoneVerified": false,
  "emailVerificationToken": "8f434346648f6b96df89dda845c0e98aa1a31f4b397b26a199368b8fb49dcb6",
  "emailVerificationTokenExpires": "2026-06-19T12:10:00.000Z",
  "address": [],
  "createdAt": "2026-06-19T12:00:00.000Z",
  "updatedAt": "2026-06-19T12:00:00.000Z"
}
```

After verification and profile update with phone:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+15551234567",
  "role": "customer",
  "status": "active",
  "isEmailVerified": true,
  "isPhoneVerified": false,
  "address": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0e",
      "street": "123 Main St",
      "city": "Portland",
      "state": "OR",
      "zipCode": "97201",
      "country": "US",
      "isPrimary": true,
      "label": "Home"
    }
  ],
  "createdAt": "2026-06-19T12:00:00.000Z",
  "updatedAt": "2026-06-19T14:30:00.000Z"
}
```

> `password` omitted — stored as bcrypt hash, excluded from queries by default.  
> Token hash fields omitted in verified state — cleared by `verifyEmail` service.

---

# Future Expansion Possibilities

The following are **not implemented** but align with existing schema scaffolding or common e-commerce needs:

| Expansion | Schema Support Today | Work Required |
|-----------|---------------------|---------------|
| **Phone verification API** | `phoneVerificationToken*`, `isPhoneVerified`, `generatePhoneVerificationToken()` | Routes, service, SMS provider |
| **Address CRUD API** | Embedded `address[]` with `isPrimary`, `label` | Validators, service methods, routes |
| **Avatar upload** | `avatar` string field | Upload provider, PATCH endpoint |
| **Date of birth** | `dateOfBirth` field | Validator, profile update whitelist |
| **Email change flow** | `email` unique indexed | Re-verification tokens, pending email field |
| **Account status API** | `status` enum | Admin routes to set inactive/suspended |
| **Admin role assignment** | `role` enum | Admin user management module |
| **Password version / session invalidation** | Not in schema | Add `passwordChangedAt` or `tokenVersion` field |
| **OAuth identities** | Not in schema | `providers[]` subdocument (googleId, etc.) |
| **2FA secrets** | Not in schema | `twoFactorEnabled`, `twoFactorSecret` fields |
| **Login metadata** | Not in schema | `lastLoginAt`, `lastLoginIp`, `failedLoginAttempts` |
| **Preferences** | Not in schema | `preferences` subdocument (notifications, locale) |
| **Soft delete users** | Not in schema | `isDeleted` flag (products/categories pattern) |
| **Index on reset/verify tokens** | Not indexed | Compound index if token lookup becomes hot path |

---

# Related Files

| File | Relationship |
|------|--------------|
| `constants/user.constants.js` | `USER_ROLES`, `USER_STATUS` enums |
| `utils/password.util.js` | bcrypt hash/compare used by hooks and methods |
| `utils/token.util.js` | Crypto token generation for instance methods |
| `services/auth.service.js` | Registration, login, verify, reset — primary User writer |
| `services/user.service.js` | Profile update, change password |
| `middleware/auth.middleware.js` | `User.findById` on every protected request |
| `validators/auth.validator.js` | API-level validation stricter than schema for passwords |

---

# Summary

The User model centralizes **identity, credentials, authorization metadata, and token-based email flows** in a single `users` collection. Passwords are bcrypt-hashed via pre-save hooks; verification and reset tokens are stored hashed with short expiry. Roles and statuses drive middleware access control. Embedded addresses and phone verification are partially scaffolded but lack full API coverage. No static methods exist — business logic lives in services that operate on this schema.
