# API Exposure Verification Guide

These curl samples validate the required protections from `docs/02-api-exposure.md`.

> Replace placeholders with valid tokens and IDs.

## Auth Required (401)
```
curl -i https://localhost:3000/api/student/profile
```

## Authorization / IDOR (403)
```
curl -i -H "Authorization: Bearer <tourist-token>" \
  "https://localhost:3000/api/matches?requestId=<other_users_request_id>"
```

## Rate Limiting (429)
```
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    https://localhost:3000/api/contact
done
```

## Response Filtering (no sensitive fields)
```
curl -s -H "Authorization: Bearer <admin-token>" \
  https://localhost:3000/api/admin/reports | jq '.reports[0]'
```

## Mass Assignment Rejection (400)
```
curl -i -X POST https://localhost:3000/api/tourist/request/create \
  -H "Content-Type: application/json" \
  -d '{"city":"Paris","dates":{"start":"2025-01-01"},"preferredTime":"morning","numberOfGuests":1,"groupType":"solo","preferredLanguages":["en"],"serviceType":"itinerary_help","interests":["food"],"contactMethod":"email","unexpectedField":"should-fail"}'
```
