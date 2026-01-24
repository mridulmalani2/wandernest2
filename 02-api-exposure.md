# Issue 02: API Exposure - Unsecured Backend Endpoints

> **Severity:** CRITICAL  
> **Category:** Security  
> **OWASP:** A01:2021 - Broken Access Control, A07:2021 - Identification and Authentication Failures

---

## Problem

API endpoints lack proper security controls. The code "works" but is accessible to anyone, including attackers. Common issues include:

1. **No Authentication** - Endpoints don't verify user identity
2. **No Authorization (IDOR)** - Users can access other users' data by changing IDs
3. **Mass Assignment** - Accepts all fields from request body
4. **Excessive Data Exposure** - Returns full database objects with sensitive fields
5. **No Rate Limiting** - Endpoints can be abused without throttling

### Vulnerable Pattern (DO NOT USE)

```python
# ❌ VULNERABLE - No auth, no authz, no rate limit, full data exposure
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return db.query(User).filter(User.id == user_id).first()
```

**Problems:**
- Anyone can call this endpoint (no authentication)
- Any authenticated user can access ANY user's data (no authorization)
- Returns entire User object including password_hash, email, etc. (data exposure)
- Can be called unlimited times (no rate limiting)

---

## Expected Behavior

Every API endpoint must implement:
1. Authentication (verify WHO is making the request)
2. Authorization (verify they CAN access this resource)
3. Response filtering (return ONLY allowed fields)
4. Rate limiting (prevent abuse)

### Secure Pattern (USE THIS)

```python
from fastapi import Depends, HTTPException, status
from fastapi_limiter.depends import RateLimiter

# ✅ SECURE - Full protection stack
@app.get("/users/{user_id}")
@require_auth
@rate_limit(100, per="hour")
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    # Authorization: Check ownership or admin status
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Fetch user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return only public fields via schema
    return UserPublicSchema.from_orm(user)
```

---

## Common API Vulnerabilities AI Generates

| Vulnerability | What AI Does | What You Need |
|---------------|--------------|---------------|
| No Authentication | Assumes auth is "elsewhere" | Explicit auth decorator/middleware |
| IDOR (Insecure Direct Object Reference) | Uses ID directly from URL | Verify requester owns resource |
| Mass Assignment | Accepts all fields from request | Whitelist allowed fields |
| Excessive Data Exposure | Returns entire database objects | Use DTOs/schemas for responses |
| No Rate Limiting | Doesn't consider abuse | Add rate limits per endpoint |

---

## Fix Instructions

### Step 1: Audit all API endpoints

```bash
# Find all route definitions
grep -rn "@app\.\(get\|post\|put\|patch\|delete\)" --include="*.py"
grep -rn "@router\.\(get\|post\|put\|patch\|delete\)" --include="*.py"

# Find endpoints missing auth decorators
grep -rn "@app\." --include="*.py" | grep -v "require_auth\|Depends(get_current"
```

### Step 2: Implement Authentication Middleware

```python
# auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Extract and validate user from JWT token."""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user
```

### Step 3: Add Authorization Checks (IDOR Prevention)

```python
# utils/authorization.py
from fastapi import HTTPException, status

def verify_resource_ownership(
    resource_owner_id: int,
    current_user: User,
    allow_admin: bool = True
):
    """Verify the current user owns the resource or is admin."""
    if current_user.id != resource_owner_id:
        if not (allow_admin and current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot access other users' data"
            )

# Usage in endpoint
@app.get("/users/{user_id}/bookings")
def get_user_bookings(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    verify_resource_ownership(user_id, current_user)
    return db.query(Booking).filter(Booking.user_id == user_id).all()
```

### Step 4: Create Response Schemas (Prevent Data Exposure)

```python
# schemas/user.py
from pydantic import BaseModel
from datetime import datetime

class UserPublicSchema(BaseModel):
    """Public user data - NEVER include sensitive fields."""
    id: int
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True  # Pydantic v2
        # orm_mode = True  # Pydantic v1

# ❌ NEVER return these fields:
# - password_hash
# - email (unless owner/admin)
# - phone (unless owner/admin)
# - internal_notes
# - payment_info
```

### Step 5: Implement Rate Limiting

```python
# Using slowapi for FastAPI
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/users/{user_id}")
@limiter.limit("100/hour")
def get_user(request: Request, user_id: int, ...):
    ...

# Or using fastapi-limiter with Redis
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.get("/users/{user_id}", dependencies=[Depends(RateLimiter(times=100, hours=1))])
def get_user(...):
    ...
```

### Step 6: Implement Request Validation (Prevent Mass Assignment)

```python
# schemas/user.py
class UserUpdateSchema(BaseModel):
    """Only these fields can be updated by user."""
    username: str | None = None
    display_name: str | None = None
    
    # ❌ NEVER allow these in update:
    # - is_admin
    # - role
    # - email_verified
    # - password_hash

# Usage
@app.patch("/users/{user_id}")
def update_user(
    user_id: int,
    updates: UserUpdateSchema,  # Whitelist enforced by schema
    current_user: User = Depends(get_current_user)
):
    verify_resource_ownership(user_id, current_user)
    # Only whitelisted fields from UserUpdateSchema are applied
    user = db.query(User).filter(User.id == user_id).first()
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    return UserPublicSchema.from_orm(user)
```

---

## Verification Checklist

After applying fixes, verify each item:

- [ ] **Every endpoint has authentication** - No public endpoints for user data
- [ ] **Resource access checks ownership/permissions** - Users cannot access other users' data via ID manipulation
- [ ] **Response schemas limit exposed fields** - Passwords, emails, internal data never returned
- [ ] **Rate limiting configured per endpoint** - Abuse attempts are throttled
- [ ] **Error messages don't leak internal details** - Generic "Access denied" not "User 123 is not owner of booking 456"
- [ ] **Request schemas whitelist allowed fields** - Mass assignment blocked

---

## Test Procedure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call endpoint without auth token | 401 Unauthorized |
| 2 | Call endpoint with invalid token | 401 Unauthorized |
| 3 | Call `/users/2` as user 1 (non-admin) | 403 Forbidden |
| 4 | Call `/users/1` as user 1 | 200 with limited fields only |
| 5 | Check response for password_hash | Field NOT present |
| 6 | Send 150 requests in 1 minute | Rate limited after threshold |
| 7 | Try updating `is_admin: true` via PATCH | Field ignored or error |

---

## Files Likely Affected

- `app/api/` or `routes/` - All endpoint definitions
- `app/auth/` or `core/security.py` - Authentication logic
- `app/schemas/` or `models/schemas.py` - Pydantic models
- `app/middleware/` - Rate limiting, auth middleware
- `main.py` or `app.py` - App configuration

---

## References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [IDOR Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
