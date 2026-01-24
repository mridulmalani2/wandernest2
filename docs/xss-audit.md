# XSS Audit (Issue 03)

Security spec: `03-xss-cross-site-scripting.md`.

## Reproducible scan commands

```bash
rg -n "dangerouslySetInnerHTML|\.innerHTML\s*=|document\.write|\.html\(|v-html" --glob "*.{tsx,ts,jsx,js,vue}"
rg -n "Content-Security-Policy|CSP|securityHeaders|headers\(\)" --glob "*.{ts,tsx,js,json}"
rg -n "setCookie|cookies\(|response\.cookies|res\.cookie|httpOnly|httponly" --glob "*.{ts,tsx,js}"
```

## Dangerous pattern inventory (frontend/templates)

### `dangerouslySetInnerHTML`

1) `src/app/page.tsx`

- Lines: 44-51.
- Usage: JSON-LD structured data rendered via `<script type="application/ld+json">`.
- Evidence: `toSafeJsonLd` performs `JSON.stringify(...).replace(/</g, '\\u003c')` before injection.
- Classification: **SAFE (sanitized for JSON-LD context)**.
- Safe refactor (minimal): keep the helper and ensure it is only used for trusted structured data, not user input.

2) `src/app/how-it-works/page.tsx`

- Lines: 240-277.
- Usage: JSON-LD structured data rendered via `<script type="application/ld+json">`.
- Evidence: the JSON is escaped for `<`, `>`, `&`, and `'` before injection.
- Classification: **SAFE (sanitized for JSON-LD context)**.
- Safe refactor (minimal): extract the escaping into a shared helper to reduce the chance of future unsafe uses.

### `innerHTML`

3) `src/app/api/student/match/respond/route.ts`

- Result after refactor: no `innerHTML` usage remains in this file (verified via scan command).
- Current approach: DOM nodes are constructed via `document.createElement`, `textContent`, and `setAttribute`.
- URL safety: `sanitizeUrl(...)` now rejects protocol-relative values like `//attacker.com`, parses via the `URL` API, enforces same-origin, and preserves `pathname + search + hash`.
- Classification: **SAFE (refactored away from `innerHTML` and hardened URL handling)**.

Safe refactor (implemented): build the result UI via DOM APIs instead of string concatenation.

## Minimal security fix applied

The earlier fix still allowed protocol-relative URLs (e.g., `//attacker.com`) and relied on `innerHTML` string concatenation.

Fixes applied:

- Replace `innerHTML` rendering with DOM construction (`createElement`, `textContent`, `setAttribute`).
- Harden `sanitizeUrl(...)` by:
  - rejecting empty values and protocol-relative inputs starting with `//`
  - parsing with the `URL` API using `window.location.origin` as the base
  - enforcing `parsed.origin === window.location.origin`
  - returning normalized `pathname + search + hash`

## CSP header verification

- CSP header exists in `vercel.json` under the global `/(.*)` header set.
- Evidence: `Content-Security-Policy` is configured with `script-src ... 'unsafe-inline'` and `'unsafe-eval'`.

Result: **FAIL** against the spec requirement that CSP should not allow inline scripts (`'unsafe-inline'`) for `script-src`.

## HttpOnly cookie verification

Evidence was gathered by scanning for cookie-setting code (`response.cookies`, `res.cookie`, `httpOnly`/`httponly`, etc.).

Observed HttpOnly session cookies in key auth routes:

- `src/app/api/admin/login/route.ts` sets `admin-token` with `httpOnly: true`.
- `src/app/api/student/auth/login/route.ts` sets `student_session_token` with `httpOnly: true`.
- `src/app/api/student/auth/signup/route.ts` sets `student_session_token` with `httpOnly: true`.

Result: **PASS** (HttpOnly flags are explicitly set in the repository code).
