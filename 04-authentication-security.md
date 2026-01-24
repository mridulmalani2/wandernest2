# Issue 04: Authentication - The Keys to Your Kingdom

> **Severity:** CRITICAL  
> **Category:** Security  
> **OWASP:** A07:2021 - Identification and Authentication Failures

---

## Problem

AI generates "working" authentication that often lacks critical security controls: no rate limiting, weak password requirements, predictable tokens, plaintext or weak password storage, and timing vulnerabilities.

### Vulnerable Pattern (DO NOT USE)

```python
# ❌ VULNERABLE - Multiple security failures
def login(username, password):
    user = db.query(User).filter(User.username == username).first()
    
    # Plain text comparison - passwords stored unhashed!
    if user and user.password == password:
        # Predictable token!
        return {"token": str(user.id)}
    
    # User enumeration - different messages
    if not user:
        return {"error": "User not found"}
    return {"error": "Wrong password"}
```

**Problems:**
- Passwords stored/compared in plaintext (or weak hash like MD5)
- No rate limiting - brute force possible
- Predictable token generation
- User enumeration via different error messages
- No timing-safe comparison

---

## Expected Behavior

Authentication must implement all security controls: proper password hashing, rate limiting, account lockout, secure token generation, timing-safe comparison, and generic error messages.

### Secure Pattern (USE THIS)

```python
from passlib.hash import argon2
import secrets
from datetime import timedelta

def login(username, password, ip_address):
    # Rate limiting check
    if rate_limiter.is_blocked(ip_address):
        raise TooManyRequests("Try again in 15 minutes")
    
    user = db.query(User).filter(User.username == username).first()
    
    # Timing-safe verification (runs even if user not found)
    if not user or not argon2.verify(password, user.password_hash):
        rate_limiter.record_failure(ip_address)
        # Generic error - no user enumeration
        raise Unauthorized("Invalid credentials")
    
    # Secure token generation
    token = secrets.token_urlsafe(32)
    store_session(token, user.id, expires=timedelta(hours=1))
    
    return {"token": token}
```

---

## Authentication Security Checklist

| Control | Why It Matters | AI Usually Misses |
|---------|----------------|-------------------|
| Password hashing (Argon2/bcrypt) | Protects stored credentials | Often stores plaintext or uses MD5 |
| Rate limiting | Prevents brute force | Almost never included |
| Account lockout | Stops credential stuffing | Rarely implemented |
| Secure token generation | Prevents session hijacking | Uses predictable values |
| Timing-safe comparison | Prevents timing attacks | Uses regular string comparison |
| Generic error messages | Prevents user enumeration | Says "user not found" vs "wrong password" |

---

## Fix Instructions

### Step 1: Audit current authentication

```bash
# Find password comparisons
grep -rn "password\s*==" --include="*.py"
grep -rn "\.password\s*==" --include="*.py"

# Find weak hashing
grep -rn "md5\|sha1\|sha256" --include="*.py" | grep -i password

# Find token generation
grep -rn "token\s*=" --include="*.py"

# Find login/auth endpoints
grep -rn "def login\|def authenticate\|def signin" --include="*.py"
```

### Step 2: Implement secure password hashing

```python
# auth/password.py
from passlib.hash import argon2

# Argon2 configuration (OWASP recommended)
# Cost factor 12, memory 64MB
argon2_hasher = argon2.using(
    time_cost=12,
    memory_cost=65536,  # 64MB
    parallelism=4
)

def hash_password(password: str) -> str:
    """Hash password with Argon2."""
    return argon2_hasher.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password with timing-safe comparison."""
    try:
        return argon2_hasher.verify(password, password_hash)
    except Exception:
        return False
```

Install required package:
```bash
pip install passlib[argon2]
```

### Step 3: Implement rate limiting

```python
# auth/rate_limiter.py
from datetime import datetime, timedelta
from collections import defaultdict
import threading

class RateLimiter:
    def __init__(self):
        self.attempts = defaultdict(list)
        self.blocked = {}
        self.lock = threading.Lock()
        
        # Configuration
        self.max_attempts_per_ip = 5
        self.max_attempts_per_account = 10
        self.window_minutes = 15
        self.lockout_minutes = 15
    
    def is_blocked(self, ip_address: str, username: str = None) -> bool:
        """Check if IP or account is blocked."""
        with self.lock:
            now = datetime.utcnow()
            
            # Check IP block
            if ip_address in self.blocked:
                if self.blocked[ip_address] > now:
                    return True
                del self.blocked[ip_address]
            
            # Check account block
            if username and username in self.blocked:
                if self.blocked[username] > now:
                    return True
                del self.blocked[username]
            
            return False
    
    def record_failure(self, ip_address: str, username: str = None):
        """Record failed attempt and block if threshold exceeded."""
        with self.lock:
            now = datetime.utcnow()
            window_start = now - timedelta(minutes=self.window_minutes)
            
            # Clean old attempts and add new
            self.attempts[ip_address] = [
                t for t in self.attempts[ip_address] if t > window_start
            ]
            self.attempts[ip_address].append(now)
            
            # Block IP if exceeded
            if len(self.attempts[ip_address]) >= self.max_attempts_per_ip:
                self.blocked[ip_address] = now + timedelta(minutes=self.lockout_minutes)
            
            # Track per-account attempts
            if username:
                self.attempts[username] = [
                    t for t in self.attempts[username] if t > window_start
                ]
                self.attempts[username].append(now)
                
                if len(self.attempts[username]) >= self.max_attempts_per_account:
                    self.blocked[username] = now + timedelta(minutes=self.lockout_minutes)
    
    def clear_on_success(self, ip_address: str, username: str):
        """Clear attempts on successful login."""
        with self.lock:
            self.attempts[ip_address] = []
            if username:
                self.attempts[username] = []

rate_limiter = RateLimiter()
```

### Step 4: Implement secure token generation

```python
# auth/tokens.py
import secrets
from datetime import datetime, timedelta
from typing import Optional

def generate_secure_token(length: int = 32) -> str:
    """Generate cryptographically secure token."""
    return secrets.token_urlsafe(length)

# For JWT (if using)
import jwt
from os import environ

JWT_SECRET = environ.get('JWT_SECRET')  # NEVER hardcode!
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_HOURS = 1

def create_jwt_token(user_id: int) -> str:
    """Create JWT with expiration."""
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET not configured")
    
    payload = {
        'sub': user_id,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Optional[int]:
    """Verify JWT and return user_id."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get('sub')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
```

### Step 5: Implement complete secure login

```python
# auth/login.py
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
import logging

from .password import verify_password
from .rate_limiter import rate_limiter
from .tokens import generate_secure_token

logger = logging.getLogger(__name__)
router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str

@router.post("/login", response_model=LoginResponse)
def login(request: Request, credentials: LoginRequest):
    ip_address = request.client.host
    username = credentials.username
    
    # Check rate limiting
    if rate_limiter.is_blocked(ip_address, username):
        logger.warning(f"Blocked login attempt from {ip_address} for {username}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Try again in 15 minutes."
        )
    
    # Fetch user
    user = db.query(User).filter(User.username == username).first()
    
    # Verify password (timing-safe, runs even if user is None)
    password_valid = False
    if user:
        password_valid = verify_password(credentials.password, user.password_hash)
    
    if not user or not password_valid:
        # Record failure
        rate_limiter.record_failure(ip_address, username)
        
        # Log attempt (without password!)
        logger.warning(f"Failed login from {ip_address} for {username}")
        
        # GENERIC error message - no user enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Success - clear rate limits
    rate_limiter.clear_on_success(ip_address, username)
    
    # Generate secure token
    token = generate_secure_token(32)
    
    # Store session
    store_session(
        token=token,
        user_id=user.id,
        ip_address=ip_address,
        expires=timedelta(hours=1)
    )
    
    logger.info(f"Successful login from {ip_address} for {username}")
    
    return LoginResponse(token=token)
```

### Step 6: Audit logging for security events

```python
# auth/audit.py
import logging
from datetime import datetime

audit_logger = logging.getLogger('security.audit')

def log_auth_event(
    event_type: str,
    ip_address: str,
    username: str = None,
    user_id: int = None,
    success: bool = False,
    details: str = None
):
    """Log authentication events for security monitoring."""
    audit_logger.info({
        'timestamp': datetime.utcnow().isoformat(),
        'event': event_type,
        'ip': ip_address,
        'username': username,
        'user_id': user_id,
        'success': success,
        'details': details
    })
```

---

## JWT vs Session Tokens

| Approach | Pros | Cons | When to Use |
|----------|------|------|-------------|
| JWT | Stateless, scalable | Can't revoke easily, size | Microservices, APIs |
| Session tokens | Revocable, smaller | Requires server storage | Traditional web apps |
| JWT + Refresh | Best of both | More complex | Mobile apps, SPAs |

> ⚠️ **WARNING:** AI often generates JWT code without expiration, without signature verification, or with the secret hardcoded. Always verify: token has `exp` claim, signature is validated, secret is from environment variable.

---

## Verification Checklist

After applying fixes, verify each item:

- [ ] **Passwords hashed with Argon2 or bcrypt** - No plaintext, MD5, or SHA
- [ ] **Rate limiting implemented** - 5 attempts per 15 min per IP, 10 per account
- [ ] **Account lockout after failures** - Requires email verification to unlock
- [ ] **Tokens generated with `secrets.token_urlsafe(32)`** - Not predictable
- [ ] **Token expiry set** - 1 hour for session, refresh token if longer needed
- [ ] **Timing-safe password comparison** - Uses `argon2.verify()` or `hmac.compare_digest()`
- [ ] **Generic error messages** - "Invalid credentials" for both user not found and wrong password
- [ ] **All auth attempts logged** - IP, timestamp, username, success/failure
- [ ] **JWT secret from environment** - Not hardcoded in code

---

## Test Procedure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login with invalid username | "Invalid credentials" (not "user not found") |
| 2 | Login with wrong password | "Invalid credentials" (not "wrong password") |
| 3 | Attempt 6 rapid logins | 429 Too Many Requests |
| 4 | Check token format | URL-safe, ~43 characters |
| 5 | Decode JWT (if used) | Has `exp` claim, valid signature |
| 6 | Check password in database | Hashed (starts with `$argon2`) |
| 7 | Wait 1 hour, use token | 401 Unauthorized (expired) |
| 8 | Check audit logs | All attempts recorded with IP |

---

## Files Likely Affected

- `auth/` or `core/security.py` - Authentication logic
- `models/user.py` - Password storage field
- `routes/auth.py` - Login endpoint
- `middleware/` - Rate limiting middleware
- `config.py` or `.env` - JWT secret configuration

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Argon2 Specification](https://github.com/P-H-C/phc-winner-argon2)
- [Python secrets module](https://docs.python.org/3/library/secrets.html)
