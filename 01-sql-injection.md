# Issue 01: SQL Injection Vulnerabilities

> **Severity:** CRITICAL  
> **Category:** Security  
> **OWASP:** A03:2021 - Injection

---

## Problem

SQL injection vulnerabilities exist in the codebase where user input is concatenated directly into SQL query strings instead of using parameterized queries.

### Vulnerable Pattern (DO NOT USE)

```python
# ❌ VULNERABLE - String interpolation allows injection
query = f"SELECT * FROM users WHERE id = {user_input}"

# ❌ VULNERABLE - String concatenation
query = "SELECT * FROM users WHERE id = " + user_input

# ❌ VULNERABLE - % formatting
query = "SELECT * FROM users WHERE id = %s" % user_input
```

### Attack Example

```
If user_input is: 1 OR 1=1; DROP TABLE users; --

Query becomes: SELECT * FROM users WHERE id = 1 OR 1=1; DROP TABLE users; --
```

This returns all users and potentially drops the entire table.

---

## Expected Behavior

All database queries must use parameterized queries with bound parameters. User input should NEVER be interpolated into SQL strings.

### Secure Pattern (USE THIS)

```python
# ✅ SECURE - Parameterized query with psycopg2
cursor.execute("SELECT * FROM users WHERE id = %s", (user_input,))

# ✅ SECURE - SQLAlchemy ORM
user = session.query(User).filter(User.id == user_input).first()

# ✅ SECURE - SQLAlchemy text with bound params
from sqlalchemy import text
result = connection.execute(text("SELECT * FROM users WHERE id = :id"), {"id": user_input})
```

---

## Fix Instructions

### Step 1: Audit all database query locations

Search the codebase for vulnerable patterns:

```bash
# Find string interpolation in SQL contexts
grep -rn "f\"SELECT\|f'SELECT\|f\"INSERT\|f'INSERT\|f\"UPDATE\|f'UPDATE\|f\"DELETE\|f'DELETE" --include="*.py"

# Find string concatenation with SQL
grep -rn "\"SELECT.*\" +" --include="*.py"
grep -rn "'SELECT.*' +" --include="*.py"

# Find .execute() calls that might be vulnerable
grep -rn "\.execute(" --include="*.py"
```

### Step 2: For each vulnerable query, refactor to parameterized form

**Before:**
```python
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    return cursor.fetchone()
```

**After:**
```python
def get_user(user_id):
    # Validate input type
    if not isinstance(user_id, int) or user_id < 1:
        raise ValueError("Invalid user ID")
    
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    return cursor.fetchone()
```

### Step 3: Add input validation layer

```python
def validate_positive_integer(value, field_name="value"):
    """Validate that input is a positive integer."""
    try:
        int_value = int(value)
        if int_value < 1:
            raise ValueError(f"{field_name} must be positive")
        return int_value
    except (TypeError, ValueError):
        raise ValueError(f"Invalid {field_name}: must be a positive integer")
```

### Step 4: Implement safe error logging

```python
import logging

logger = logging.getLogger(__name__)

def safe_query_user(user_id):
    try:
        validated_id = validate_positive_integer(user_id, "user_id")
        cursor.execute("SELECT * FROM users WHERE id = %s", (validated_id,))
        return cursor.fetchone()
    except ValueError as e:
        # Log the error without exposing SQL structure
        logger.warning(f"Invalid query attempt: {e}")
        return None
```

---

## Verification Checklist

After applying fixes, verify each item:

- [ ] **No string concatenation or f-strings in SQL** - `grep` returns no results for interpolated SQL
- [ ] **All queries use parameterized placeholders** - `%s` for psycopg2, `:param` for SQLAlchemy text, or ORM methods
- [ ] **Input type validation exists** before query execution
- [ ] **ORM usage with bound parameters** where applicable
- [ ] **Error messages do not expose SQL structure** - check error handlers and logs

---

## Test Procedure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Identify a query endpoint (e.g., `/api/user?id=`) | Endpoint located |
| 2 | Test with malicious input: `1 OR 1=1` | Returns error or no results (NOT all users) |
| 3 | Test with `'; DROP TABLE users; --` | Returns error, table intact |
| 4 | Test with valid input: `1` | Returns correct single user |
| 5 | Check logs after malicious attempts | No SQL structure exposed in logs |

---

## Files Likely Affected

Search these common locations:
- `app/models/` - Database model files
- `app/api/` or `routes/` - API endpoint handlers
- `app/services/` or `lib/` - Business logic with DB calls
- `database/` or `db/` - Database connection and query utilities

---

## References

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [psycopg2 Parameterized Queries](https://www.psycopg.org/docs/usage.html#passing-parameters-to-sql-queries)
- [SQLAlchemy Query Tutorial](https://docs.sqlalchemy.org/en/14/orm/tutorial.html)
