# Authentication Security Verification Guide

These curl samples validate the required protections from `04-authentication-security.md`.

> Replace placeholders with valid credentials, tokens, and IDs.

## Student Login Lockout (401 after max failures)
```
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://localhost:3000/api/student/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"student@example.com","password":"wrong-pass"}'
done
```

## Admin Login Lockout (401 after max failures)
```
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://localhost:3000/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrong-pass"}'
done
```

## OTP Stored as HMAC (manual DB check)
```
# Request a student signup OTP
curl -i -X POST https://localhost:3000/api/student/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com"}'

# Verify that StudentOtp.otpHmac does NOT equal the sent OTP code.
```

## OTP Attempt Exhaustion (generic failure)
```
for i in {1..6}; do
  curl -i -X POST https://localhost:3000/api/student/auth/forgot-password/confirm \
    -H "Content-Type: application/json" \
    -d '{"email":"student@example.com","code":"000000","newPassword":"NewPass123"}'
done
```
