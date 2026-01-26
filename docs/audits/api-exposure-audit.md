# API Exposure Audit (Issue 02)

Source of truth: `docs/02-api-exposure.md`.

## Endpoint Classification
- **PUBLIC**: No auth, but rate-limited and response-filtered.
- **AUTHENTICATED**: Requires a signed session/token.
- **PRIVILEGED**: Admin-only.
- **TOKEN-BASED**: Signed one-time links or tokens.

## Audit Table

| Method | Path | File | Auth | Authz | Response filtering | Rate limit | Mass assignment | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | /api/health | src/app/api/health/route.ts | PUBLIC | N/A | Yes | Yes | N/A | Public health check, rate-limited. |
| GET | /api/cities | src/app/api/cities/route.ts | PUBLIC | N/A | Yes | Yes | N/A | Public static data, rate-limited. |
| GET | /api/files/[id] | src/app/api/files/[id]/route.ts | PUBLIC (profile photo) / AUTHENTICATED | Yes | N/A (binary) | Yes | N/A | Owner/admin enforced for private files. |
| GET | /api/auth/[...nextauth] | src/app/api/auth/[...nextauth]/route.ts | PUBLIC | N/A | N/A | Yes | N/A | Auth provider handler with rate limit. |
| POST | /api/auth/[...nextauth] | src/app/api/auth/[...nextauth]/route.ts | PUBLIC | N/A | N/A | Yes | N/A | Auth provider handler with rate limit. |
| GET | /api/auth/provider-status | src/app/api/auth/provider-status/route.ts | PUBLIC | N/A | Yes | Yes | N/A | Only exposes provider availability. |
| POST | /api/reviews | src/app/api/reviews/route.ts | AUTHENTICATED (tourist) | Yes | Yes | Yes | Yes | Tourist ownership + assigned student checks. |
| GET | /api/reviews/student/[studentId] | src/app/api/reviews/student/[studentId]/route.ts | PUBLIC | N/A | Yes | Yes | N/A | Public reviews with cached fields only. |
| GET | /api/reviews/student/[studentId]/metrics | src/app/api/reviews/student/[studentId]/metrics/route.ts | PUBLIC | N/A | Yes | Yes | N/A | Public metrics only. |
| POST | /api/matches | src/app/api/matches/route.ts | AUTHENTICATED (tourist) | Yes | Yes | Yes | Yes | Request ownership required. |
| GET | /api/matches | src/app/api/matches/route.ts | AUTHENTICATED (tourist) | Yes | Yes | Yes | N/A | Request ownership required. |
| POST | /api/matches/select | src/app/api/matches/select/route.ts | AUTHENTICATED (tourist) | Yes | Yes | Yes | Yes | Uses signed selection tokens. |
| POST | /api/tourist/request/create | src/app/api/tourist/request/create/route.ts | AUTHENTICATED (tourist) | Yes | Yes | Yes | Yes | Request owned by session user. |
| POST | /api/tourist/request/verify | src/app/api/tourist/request/verify/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Email verification + rate limits. |
| POST | /api/tourist/request/select | src/app/api/tourist/request/select/route.ts | AUTHENTICATED (tourist) | Yes | Yes | Yes | Yes | Signed selection tokens + ownership. |
| POST | /api/tourist/request/match | src/app/api/tourist/request/match/route.ts | AUTHENTICATED (tourist) | Yes | Yes | Yes | Yes | Request ownership required. |
| POST | /api/tourist/request/initiate | src/app/api/tourist/request/initiate/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Rate-limited OTP initiation. |
| GET | /api/tourist/request/status | src/app/api/tourist/request/status/route.ts | AUTHENTICATED | Yes | Yes | Yes | N/A | Owner or admin only. |
| POST | /api/tourist/dashboard/access | src/app/api/tourist/dashboard/access/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Email verification + rate limits. |
| POST | /api/tourist/dashboard/verify | src/app/api/tourist/dashboard/verify/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Token issuance with rate limit. |
| GET | /api/tourist/dashboard/requests | src/app/api/tourist/dashboard/requests/route.ts | AUTHENTICATED (tourist token) | Yes | Yes | Yes | N/A | Returns only scoped fields. |
| GET | /api/tourist/bookings | src/app/api/tourist/bookings/route.ts | AUTHENTICATED (tourist session) | Yes | Yes | Yes | N/A | Scoped to tourist. |
| POST | /api/contact | src/app/api/contact/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Strict payload + rate limit. |
| GET | /api/cron/approval-follow-up | src/app/api/cron/approval-follow-up/route.ts | PRIVILEGED (cron secret) | N/A | Yes | Yes | N/A | Requires CRON_SECRET header. |
| POST | /api/student/auth/send-otp | src/app/api/student/auth/send-otp/route.ts | PUBLIC | N/A | Yes | Yes | Yes | OTP rate limits enforced. |
| POST | /api/student/auth/set-password | src/app/api/student/auth/set-password/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | Yes | Uses student auth identity. |
| POST | /api/student/auth/login | src/app/api/student/auth/login/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Login rate limits enforced. |
| POST | /api/student/auth/signout | src/app/api/student/auth/signout/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | N/A | Requires auth + rate limit. |
| GET | /api/student/auth/session-status | src/app/api/student/auth/session-status/route.ts | AUTHENTICATED (session cookie) | N/A | Yes | Yes | N/A | Returns minimal session state. |
| POST | /api/student/auth/signup | src/app/api/student/auth/signup/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Strict OTP signup payload. |
| POST | /api/student/auth/forgot-password/confirm | src/app/api/student/auth/forgot-password/confirm/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Strict payload + rate limit. |
| POST | /api/student/auth/forgot-password/request | src/app/api/student/auth/forgot-password/request/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Strict payload + rate limit. |
| GET | /api/student/profile | src/app/api/student/profile/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | N/A | Scoped to current student. |
| PUT | /api/student/profile | src/app/api/student/profile/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | Yes | Strict schema + allowlist. |
| POST | /api/student/reraise-approval | src/app/api/student/reraise-approval/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | N/A | Scoped to current student. |
| GET | /api/student/requests | src/app/api/student/requests/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | N/A | Scoped selections only. |
| POST | /api/student/requests/accept | src/app/api/student/requests/accept/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | Yes | Selection ownership enforced. |
| POST | /api/student/requests/reject | src/app/api/student/requests/reject/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | Yes | Selection ownership enforced. |
| POST | /api/student/requests/[requestId]/accept | src/app/api/student/requests/[requestId]/accept/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | Yes | Selection ownership enforced. |
| POST | /api/student/requests/[requestId]/reject | src/app/api/student/requests/[requestId]/reject/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | Yes | Selection ownership enforced. |
| POST | /api/student/onboarding | src/app/api/student/onboarding/route.ts | AUTHENTICATED (student OTP) | Yes | Yes | Yes | Yes | Email/session ownership enforced. |
| POST | /api/student/upload | src/app/api/student/upload/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | N/A | Uploads scoped to student. |
| GET | /api/student/match/respond | src/app/api/student/match/respond/route.ts | TOKEN-BASED | N/A | N/A (HTML) | Yes | N/A | Signed token required. |
| POST | /api/student/match/respond | src/app/api/student/match/respond/route.ts | TOKEN-BASED | Yes | Yes | Yes | Yes | Signed token + rate limit. |
| GET | /api/student/dashboard | src/app/api/student/dashboard/route.ts | AUTHENTICATED (student) | Yes | Yes | Yes | N/A | Scoped to current student. |
| POST | /api/admin/login | src/app/api/admin/login/route.ts | PUBLIC | N/A | Yes | Yes | Yes | Admin login rate limited. |
| POST | /api/admin/logout | src/app/api/admin/logout/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Requires admin auth. |
| GET | /api/admin/dashboard | src/app/api/admin/dashboard/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Admin-only. |
| GET | /api/admin/analytics | src/app/api/admin/analytics/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Admin-only. |
| GET | /api/admin/bookings | src/app/api/admin/bookings/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Admin-only. |
| POST | /api/admin/bookings/assign | src/app/api/admin/bookings/assign/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | Yes | Strict body schema. |
| GET | /api/admin/bookings/[id] | src/app/api/admin/bookings/[id]/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Admin-only. |
| GET | /api/admin/students | src/app/api/admin/students/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Admin-only. |
| GET | /api/admin/students/pending | src/app/api/admin/students/pending/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Role checked. |
| POST | /api/admin/students/bulk-approve | src/app/api/admin/students/bulk-approve/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | Yes | Strict body schema. |
| POST | /api/admin/students/approve | src/app/api/admin/students/approve/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | Yes | Strict body schema. |
| GET | /api/admin/reports | src/app/api/admin/reports/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Filtered report DTOs. |
| PATCH | /api/admin/reports | src/app/api/admin/reports/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | Yes | Strict body schema. |
| GET | /api/admin/test-email | src/app/api/admin/test-email/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | N/A | Admin-only. |
| POST | /api/admin/test-email | src/app/api/admin/test-email/route.ts | PRIVILEGED (admin) | Yes | Yes | Yes | Yes | Strict body schema. |
