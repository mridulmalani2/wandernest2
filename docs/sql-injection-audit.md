# SQL Injection Audit (Issue 01)

Source of truth: `01-sql-injection.md`.

## Scope & methodology

The spec requires auditing **Python** SQL construction sites:

- `cursor.execute(...)`
- `session.execute(text(...))`
- raw SQL strings

This repository contains **no Python files** (no `*.py` results).

Because database access exists in TypeScript/JavaScript, this audit also reviews raw SQL usage there, with the same vulnerable patterns in mind (interpolation, concatenation, `%` formatting, and unparameterized user input).

## Reproducible search commands

### Python SQL construction sites (spec-required)

```bash
rg --files -g "*.py"
rg -n "cursor\.execute\(|session\.execute\(|\.execute\(|text\(" --glob "*.py"
rg -n "f\"SELECT|f'SELECT|f\"INSERT|f'INSERT|f\"UPDATE|f'UPDATE|f\"DELETE|f'DELETE|SELECT \* FROM|INSERT INTO|UPDATE .* SET|DELETE FROM" --glob "*.py"
```

### Raw SQL / execute sites in this repo's JS/TS

```bash
rg -n 'SELECT|INSERT|UPDATE|DELETE|\$queryRaw|\$executeRaw|queryRawUnsafe|executeRawUnsafe|client\.query\(' --glob '*.{ts,tsx,js,jsx}'
rg -n '\$queryRawUnsafe|\$executeRawUnsafe|queryRawUnsafe|executeRawUnsafe' --glob '*.{ts,tsx,js,jsx}'
```

## Findings

### 1) All SQL query construction sites in Python

- Result: **none found** (no `*.py` files in the repository).

### 2) Vulnerable patterns from the spec

No violations matching the spec's vulnerable patterns were identified.

Key checks performed:

- No Python `f"SELECT ... {user_input}"` patterns (no Python files).
- No `queryRawUnsafe` / `executeRawUnsafe` usage.
- Raw SQL queries present are static SQL or Prisma tagged templates without interpolation of request parameters.

## Safe pattern confirmations (spec item 3)

### Parameterized / bound execution patterns

- Prisma tagged template raw queries are used without interpolating request data into the SQL string, which provides bound-parameter semantics when interpolation is later needed. See `prisma.$queryRaw` tagged templates in the admin analytics endpoint.【F:src/app/api/admin/analytics/route.ts†L31-L90】
- A simple health-check raw query uses a tagged template with no interpolation.【F:src/lib/prisma.ts†L97-L101】

### ORM-style usage

- The analytics endpoint also uses Prisma ORM methods (e.g., `count({ where: ... })`) rather than raw SQL when possible.【F:src/app/api/admin/analytics/route.ts†L92-L106】

### Input validation for identifiers

- The database reset script builds DDL statements dynamically but first quotes identifiers defensively via `quoteIdent`, which escapes embedded double quotes.【F:scripts/reset-neon-db.js†L53-L61】
- The dynamic DDL uses quoted identifiers derived from system catalog queries rather than request input.【F:scripts/reset-neon-db.js†L183-L188】

## Verification checklist (per spec)

- **No string concatenation or f-strings in SQL:** **PARTIAL** — no Python exists; within JS/TS, no interpolated user input was found in raw SQL strings after review of all raw SQL sites.
- **All queries use parameterized placeholders / bound params / ORM methods:** **PASS** — raw SQL is executed via Prisma tagged templates or `pg` client queries without user-controlled interpolation in the SQL string, and ORM methods are used in several places.【F:src/app/api/admin/analytics/route.ts†L31-L106】【F:src/lib/prisma.ts†L97-L101】
- **Input type validation exists before query execution:** **PARTIAL** — the spec targets Python query sites; none exist. In the reviewed raw SQL sites, no request-derived values were interpolated into SQL. Dynamic identifiers in reset scripts are quoted.【F:scripts/reset-neon-db.js†L53-L61】【F:scripts/reset-neon-db.js†L183-L188】
- **ORM usage with bound parameters where applicable:** **PASS** — Prisma ORM query methods are used for platform metrics counts.【F:src/app/api/admin/analytics/route.ts†L92-L106】
- **Error messages do not expose SQL structure:** **PASS** — DB health check errors are sanitized to avoid leaking internal details.【F:src/lib/prisma.ts†L105-L116】

## Violations and minimal fixes

No SQL injection violations matching the spec's vulnerable patterns were identified, so no code fixes are required at this time.

## Simple test plan: prove `"1 OR 1=1"` does not dump all users

Even though the spec references Python-style endpoints, the following plan applies to this repository:

1. Identify an endpoint that accepts an ID-like query parameter (e.g., a user/student lookup route).
2. Send a request with a malicious ID: `1 OR 1=1`.
3. Verify the response does **not** return a broad list of users/students.
4. Verify logs do not expose SQL strings.

Example commands (adjust to a real endpoint once running locally):

```bash
# Start the app locally (example)
npm run dev

# Attempt injection against a hypothetical ID endpoint
curl "http://localhost:3000/api/users?id=1%20OR%201%3D1"

# Expected: error or single-record behavior, never "all users"
```

For raw SQL review endpoints specifically:

- The admin analytics route does not accept request parameters for its raw SQL, so injection payloads cannot alter those queries as written.【F:src/app/api/admin/analytics/route.ts†L31-L90】
