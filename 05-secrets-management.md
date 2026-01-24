# Issue 05: Secrets Management - Stop Hardcoding Credentials

> **Severity:** CRITICAL  
> **Category:** Security  
> **OWASP:** A02:2021 - Cryptographic Failures

---

## Problem

AI assistants generate working code—which often means hardcoded credentials, because that's what makes the example "run." This is catastrophic in production. Secrets in source code end up in Git history, logs, error messages, and eventually on GitHub where bots find them in minutes.

### Vulnerable Pattern (DO NOT USE)

```python
# ❌ VULNERABLE - config.py with hardcoded secrets
DATABASE_URL = "postgresql://admin:SuperSecret123@prod-db.company.com/main"
AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
STRIPE_API_KEY = "sk_live_4eC39HqLyjWDarjtT1zdp7dc"
JWT_SECRET = "my-super-secret-jwt-key"
```

**Problems:**
- Secrets visible to anyone with repo access
- Secrets persist in Git history forever (even after deletion)
- Secrets exposed in error messages and logs
- Different environments (dev/staging/prod) require code changes

---

## Expected Behavior

All credentials must be loaded from environment variables or a secrets manager. Source code should contain zero secrets.

### Secure Pattern (USE THIS)

```python
# ✅ SECURE - config.py loading from environment
import os
from functools import lru_cache

@lru_cache
def get_settings():
    return {
        "database_url": os.environ["DATABASE_URL"],
        "aws_secret_key": os.environ["AWS_SECRET_KEY"],
        "stripe_api_key": os.environ["STRIPE_API_KEY"],
        "jwt_secret": os.environ["JWT_SECRET"],
    }

# For production: Use AWS Secrets Manager, Vault, or similar
```

---

## Where Secrets Leak

| Location | Risk Level | Mitigation |
|----------|------------|------------|
| Source code | Critical | Never commit secrets; use env vars |
| Git history | Critical | Use git-filter-branch to purge; rotate leaked secrets |
| Log files | High | Sanitize logs; never log credentials |
| Error messages | High | Use generic errors; don't expose connection strings |
| AI prompts | High | Never paste real credentials in prompts |
| Environment variables (client-side) | Medium | Only expose `NEXT_PUBLIC_` vars intentionally |

---

## Fix Instructions

### Step 1: Audit for hardcoded secrets

```bash
# Find potential hardcoded secrets
grep -rn "password\s*=" --include="*.py" --include="*.js" --include="*.ts"
grep -rn "api_key\s*=" --include="*.py" --include="*.js" --include="*.ts"
grep -rn "secret\s*=" --include="*.py" --include="*.js" --include="*.ts"
grep -rn "DATABASE_URL\s*=" --include="*.py"
grep -rn "sk_live_\|sk_test_" --include="*.py" --include="*.js"  # Stripe
grep -rn "AKIA" --include="*.py" --include="*.js"  # AWS Access Key

# Use gitleaks for comprehensive scan
gitleaks detect --source . --verbose
```

### Step 2: Create secure configuration module

```python
# config.py
import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str
    
    # Authentication
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 1
    
    # External Services
    stripe_api_key: str
    aws_access_key_id: str
    aws_secret_access_key: str
    
    # Application
    debug: bool = False
    environment: str = "production"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

# Usage
settings = get_settings()
```

### Step 3: Create .env.example (safe to commit)

```bash
# .env.example - Template with placeholder values (SAFE TO COMMIT)
# Copy to .env and fill in real values

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=generate-a-secure-random-string-here
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=1

# Stripe (use test keys for development)
STRIPE_API_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx

# AWS
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# Application
DEBUG=false
ENVIRONMENT=development
```

### Step 4: Update .gitignore

```gitignore
# .gitignore - MUST include these

# Environment files with secrets
.env
.env.local
.env.production
.env.*.local

# Never commit these
*.pem
*.key
credentials.json
secrets.json
service-account.json

# IDE files that might cache secrets
.idea/
.vscode/settings.json

# Log files that might contain secrets
*.log
logs/
```

### Step 5: Add pre-commit hook for secrets detection

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

Install and enable:
```bash
pip install pre-commit
pre-commit install
```

This blocks commits containing patterns that look like API keys, passwords, or tokens.

### Step 6: Implement safe logging

```python
# utils/logging.py
import logging
import re

class SecretFilter(logging.Filter):
    """Filter to redact secrets from log messages."""
    
    PATTERNS = [
        (r'password["\']?\s*[:=]\s*["\']?[^"\'&\s]+', 'password=***REDACTED***'),
        (r'api_key["\']?\s*[:=]\s*["\']?[^"\'&\s]+', 'api_key=***REDACTED***'),
        (r'secret["\']?\s*[:=]\s*["\']?[^"\'&\s]+', 'secret=***REDACTED***'),
        (r'token["\']?\s*[:=]\s*["\']?[^"\'&\s]+', 'token=***REDACTED***'),
        (r'Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+', 'Bearer ***REDACTED***'),
        (r'sk_live_[A-Za-z0-9]+', 'sk_live_***REDACTED***'),
        (r'sk_test_[A-Za-z0-9]+', 'sk_test_***REDACTED***'),
        (r'AKIA[A-Z0-9]{16}', 'AKIA***REDACTED***'),
    ]
    
    def filter(self, record):
        message = record.getMessage()
        for pattern, replacement in self.PATTERNS:
            message = re.sub(pattern, replacement, message, flags=re.IGNORECASE)
        record.msg = message
        record.args = ()
        return True

# Apply filter to all loggers
logging.getLogger().addFilter(SecretFilter())
```

### Step 7: Safe error handling

```python
# utils/errors.py
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

class DatabaseConnectionError(Exception):
    """Raised when database connection fails."""
    pass

def handle_database_error(e: Exception):
    """Handle database errors without exposing connection details."""
    # Log full error internally
    logger.error(f"Database error: {e}", exc_info=True)
    
    # Return generic message to client
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Database temporarily unavailable"  # NOT the connection string!
    )
```

### Step 8: For production - Use a secrets manager

```python
# config_production.py - AWS Secrets Manager example
import boto3
import json
from functools import lru_cache

@lru_cache
def get_secret(secret_name: str) -> dict:
    """Retrieve secret from AWS Secrets Manager."""
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Usage
db_secrets = get_secret("prod/tourwiseco/database")
database_url = db_secrets["url"]
```

---

## If You've Already Leaked a Secret

**Act immediately - bots scan GitHub continuously:**

1. **Rotate immediately** — generate new credentials
2. **Revoke the old secret** — don't assume it wasn't found
3. **Check access logs** — see if it was used
4. **Purge from git history** — use BFG Repo-Cleaner
5. **Force-push cleaned history** — notify collaborators

```bash
# Using BFG Repo-Cleaner to remove secrets from history
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create file with secrets to remove
echo "SuperSecret123" >> secrets-to-remove.txt
echo "sk_live_4eC39HqLyjWDarjtT1zdp7dc" >> secrets-to-remove.txt

# Run BFG
java -jar bfg.jar --replace-text secrets-to-remove.txt my-repo.git

# Clean up and force push
cd my-repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

---

## Next.js Specific: Client-Side Environment Variables

```javascript
// ❌ DANGEROUS - Exposes to browser
STRIPE_SECRET_KEY=sk_live_xxx  // Will be in client bundle!

// ✅ SAFE - Only server-side
STRIPE_SECRET_KEY=sk_live_xxx  // No NEXT_PUBLIC_ prefix

// ✅ INTENTIONALLY PUBLIC - For client-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  // OK for browser
```

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never prefix secrets with `NEXT_PUBLIC_`.

---

## Verification Checklist

After applying fixes, verify each item:

- [ ] **No hardcoded secrets in source code** - `grep` and gitleaks return clean
- [ ] **All secrets loaded from environment variables** - Using `os.environ` or `pydantic_settings`
- [ ] **`.env` file in `.gitignore`** - Never committed
- [ ] **`.env.example` exists** with placeholder values
- [ ] **Pre-commit hook installed** - gitleaks blocks secret commits
- [ ] **Logs sanitized** - SecretFilter applied, no credentials in logs
- [ ] **Error messages generic** - No connection strings exposed
- [ ] **Git history clean** - No secrets in previous commits
- [ ] **Client-side vars checked** - No `NEXT_PUBLIC_` secrets

---

## Test Procedure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `gitleaks detect --source .` | No secrets found |
| 2 | Check `.gitignore` for `.env` | `.env` listed |
| 3 | Try to commit a file with `sk_live_` | Pre-commit blocks it |
| 4 | Trigger a database error | Generic message, no connection string |
| 5 | Check application logs | No passwords or API keys visible |
| 6 | Inspect client JS bundle | No secret keys present |
| 7 | Run app without `.env` file | Fails fast with clear error |

---

## Files Likely Affected

- `config.py` or `settings.py` - Configuration module
- `.env` - Environment variables (should NOT be in repo)
- `.env.example` - Template (SHOULD be in repo)
- `.gitignore` - Must exclude secrets
- `.pre-commit-config.yaml` - Secrets detection hook
- `utils/logging.py` - Log sanitization
- All files importing config values

---

## References

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [gitleaks - Secret Detection](https://github.com/gitleaks/gitleaks)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [HashiCorp Vault](https://www.vaultproject.io/)
