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

- Lines: 93-165.
- Context: the route returns an HTML page string that includes inline JS which writes into `container.innerHTML`.
- Risk assessment:
  - User-controlled fields from the response (`data.message`, `data.title`, `data.nextSteps[*]`, and `data.contactDetails.*`) are escaped via `escapeHtml(...)` before inclusion.
  - The redirect URL is now sanitized to same-origin relative paths via `sanitizeUrl(...)` prior to insertion into the `href` attribute.
- Classification: **SAFE (sanitized)** after the redirect URL fix.

Safe refactor (preferred): avoid `innerHTML` altogether by constructing DOM nodes and setting `textContent` and `setAttribute` values explicitly.

## Minimal security fix applied

Although most user-controlled fields were escaped, `data.redirectUrl` was previously written directly into an `href` attribute in an `innerHTML` string.

This allowed payloads like `javascript:alert(1)` or attribute-breakout attempts to execute if `redirectUrl` ever became user-controlled.

Fix: introduce `sanitizeUrl(...)` that enforces a relative path (must start with `/`) and escapes quotes before interpolation, and use it for the `href`.

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
