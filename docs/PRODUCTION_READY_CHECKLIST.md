# TourWiseCo - Production Ready Checklist & Quick Reference

## Executive Summary

TourWiseCo is a multi-module API platform connecting international tourists with local student guides. The system includes:
- **3 Main User Types**: Admin, Student, Tourist
- **26+ API Endpoints** across 4 modules
- **2 Authentication Systems**: JWT + NextAuth OAuth
- **Multiple Status Workflows** for students, requests, and bookings
- **Intelligent Matching Algorithm** with 8 scoring factors

---

## Quick Reference: Essential Endpoints

### For Frontend Development

```javascript
// STUDENT FLOW
POST   /api/student/auth/initiate        // Send OTP
POST   /api/student/auth/verify          // Verify + create session
GET    /api/student/auth/session         // Check if logged in
POST   /api/student/onboarding           // Complete profile
POST   /api/student/upload               // Upload ID doc
GET    /api/student/dashboard            // Get all dashboard data
POST   /api/student/requests/accept      // Accept booking
POST   /api/student/requests/reject      // Reject booking

// TOURIST FLOW (Unregistered)
POST   /api/tourist/request/initiate     // Start booking
POST   /api/tourist/request/verify       // Verify + create request
POST   /api/tourist/request/match        // Get matched guides
POST   /api/tourist/request/select       // Select students
GET    /api/tourist/request/status       // Check request status

// TOURIST FLOW (Google OAuth)
GET/POST /api/auth/[...nextauth]         // OAuth entry
GET    /api/tourist/bookings             // Get my bookings
POST   /api/tourist/request/create       // Create auth'd request

// ADMIN FLOW
POST   /api/admin/login                  // Admin login
GET    /api/admin/students/pending       // Review pending
POST   /api/admin/students/approve       // Approve/reject
GET    /api/admin/analytics              // Platform metrics
GET    /api/admin/reports                // View reports

// UTILITIES
GET    /api/cities                       // List available cities
```

---

## Response Time Expectations

| Endpoint | Expected Time | Notes |
|----------|--------------|-------|
| `/student/auth/initiate` | <100ms | Email send async |
| `/tourist/request/match` | 200-500ms | Compute intensive |
| `/student/dashboard` | <200ms | Cached data |
| `/admin/analytics` | 500ms-2s | Heavy queries |
| `/tourist/bookings` | <200ms | NextAuth check |

---

## Database Query Optimization

### Indexes to Verify Exist

```sql
-- Student lookups
CREATE INDEX idx_student_email ON Student(email);
CREATE INDEX idx_student_city ON Student(city);
CREATE INDEX idx_student_status ON Student(status);

-- Tourist lookups
CREATE INDEX idx_tourist_email ON Tourist(email);

-- Request lookups
CREATE INDEX idx_tourist_request_city ON TouristRequest(city);
CREATE INDEX idx_tourist_request_status ON TouristRequest(status);

-- Selection lookups
CREATE INDEX idx_selection_student ON RequestSelection(studentId);
CREATE INDEX idx_selection_request ON RequestSelection(requestId);
CREATE INDEX idx_selection_status ON RequestSelection(status);

-- Session cleanup
CREATE INDEX idx_student_session_expiry ON StudentSession(expiresAt);
CREATE INDEX idx_tourist_session_expiry ON TouristSession(expiresAt);
```

---

## Performance Monitoring Checklist

### Metrics to Track

```
✓ API Response Times (by endpoint)
  - P50, P95, P99 latencies
  - Error rate < 0.5%

✓ Database Metrics
  - Query execution time
  - Connection pool utilization
  - Slow query log

✓ External Services
  - Email delivery success rate
  - Google OAuth latency
  - Redis command latency

✓ Business Metrics
  - Request-to-acceptance rate
  - Average matching time
  - Student approval rate
  - Booking completion rate

✓ System Health
  - Memory usage
  - CPU utilization
  - Disk space
  - Network bandwidth
```

### Alerting Rules

```yaml
Alerts to Configure:
  - API error rate > 1%
  - P95 response time > 2s
  - Database connection pool > 80%
  - Redis latency > 100ms
  - Email delivery failure > 5%
  - OAuth callback failures > 2%
  - Disk space < 10% available
  - Memory usage > 85%
```

---

## Security Hardening Checklist

### Environment & Secrets

```bash
# .env.production should contain:
NODE_ENV=production
DATABASE_URL=postgres://...
NEXTAUTH_SECRET=<strong-random-key>
NEXTAUTH_URL=https://tourwiseco.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
REDIS_URL=...
JWT_SECRET=<strong-random-key>
ADMIN_EMAIL=...
```

### Security Headers to Add

```javascript
// In middleware or vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### API Security Measures

```
✓ Input Validation: Zod schemas on ALL endpoints
✓ Rate Limiting:
  - Auth endpoints: 5 attempts per 15 minutes
  - API endpoints: 100 requests per minute (authenticated)
  - Public endpoints: 30 requests per minute (unauthenticated)

✓ CORS Configuration:
  - Whitelist production domain only
  - Allow credentials: true
  - Allowed methods: GET, POST, PATCH

✓ SQL Injection Prevention:
  - Using Prisma ORM (parameterized queries)
  - No raw SQL with user input

✓ XSS Prevention:
  - Input sanitization on all text fields
  - HTML escape on output
  - Content Security Policy headers

✓ CSRF Protection:
  - NextAuth tokens in secure cookies
  - SameSite=Strict for session cookies

✓ Authentication:
  - JWT validation on protected endpoints
  - Token expiry enforcement
  - Session rotation on sensitive operations
```

---

## Load Testing Recommendations

### Test Scenarios

```
Scenario 1: Normal Load (100 concurrent users)
  - 50% tourists browsing
  - 30% students accepting requests
  - 20% admins viewing analytics

Scenario 2: Peak Load (1000 concurrent users)
  - Matching algorithm under stress
  - Simultaneous request selections
  - Admin analytics queries

Scenario 3: Data Volume
  - 10,000+ students
  - 50,000+ requests
  - 100,000+ selections

Success Criteria:
  - P95 response time < 2s
  - Error rate < 1%
  - Database connections: < 100
  - Memory: < 1GB per pod
```

### Tools to Use

```
- Apache JMeter: Load testing
- K6: Performance testing
- Artillery: API load testing
- DataDog: Monitoring & profiling
```

---

## Email Service Configuration

### Email Templates to Set Up

| Email Type | Trigger | Template |
|-----------|---------|----------|
| Student Verification | `/auth/initiate` | OTP code + link |
| Student Welcome | `/auth/verify` | Onboarding guide |
| Student Approved | Admin approval | Confirmation + access |
| Student Rejected | Admin rejection | Reason + appeal info |
| Tourist Verification | `/request/initiate` | OTP code |
| Request Notification | `/request/select` | Request details + link |
| Request Accepted | Student acceptance | Confirmation + contact |
| Request Rejected | Student rejection | Alternative suggestions |
| Admin Alert | Various | Issue notifications |

### Email Service Requirements

```
Minimum specs:
- 1000+ emails/day capacity
- < 5 second delivery time
- Bounce/complaint rate < 0.5%
- SMTP + API access
- Webhook support for delivery tracking

Recommended: SendGrid, AWS SES, or Postmark
```

---

## Deployment Architecture

### Recommended Setup

```
┌─────────────────────────────────────────┐
│ Next.js Application                     │
│ • API routes (serverless/edge)          │
│ • Frontend (static)                     │
├─────────────────────────────────────────┤
│ Platform: Vercel or AWS Lambda          │
│ Auto-scaling: 2-10 instances            │
└────────────────┬────────────────────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
   PostgreSQL  Redis     Email Service
   (AWS RDS)   (ElastiCache) (SendGrid/SES)
   Backup:     Replication
   Daily       High availability
```

### Deployment Checklist

```
✓ Database backups (daily, encrypted)
✓ Database replication (high availability)
✓ SSL/TLS certificates (auto-renew)
✓ CDN for static assets
✓ Load balancer with health checks
✓ Auto-scaling rules configured
✓ CI/CD pipeline setup
✓ Monitoring & alerting active
✓ Logging aggregation (ELK, DataDog)
✓ Incident response plan
✓ Rollback capability verified
✓ Disaster recovery plan documented
```

---

## Data Privacy & Compliance

### GDPR Compliance

```
✓ User consent forms
✓ Data collection transparency
✓ Right to be forgotten implementation
✓ Data portability endpoints
✓ Privacy policy published
✓ Terms of service published
✓ Cookie consent banner
✓ Data retention policies
```

### Student Data Protection

```
✓ ID documents encrypted in storage
✓ Cover letters not exposed to tourists initially
✓ Email masked in match results
✓ Name partially masked until acceptance
✓ Contact info only revealed after acceptance
✓ Student can delete profile (purge data)
```

### Tourist Data Protection

```
✓ Email not shared with students initially
✓ Phone/WhatsApp only after acceptance
✓ Review responses privacy
✓ Booking history privacy
✓ Can delete account & data
```

---

## Monitoring Dashboard Essentials

### Key Metrics to Display

```
REAL-TIME (Updated every 30s):
  • Current API request rate
  • Error rate (by endpoint)
  • Top 5 slowest endpoints
  • Active users (online now)
  • Request queue depth

LAST 24 HOURS:
  • Total requests by endpoint
  • Average response time
  • Error rate trend
  • P95, P99 latencies
  • Database query time
  • Email delivery success rate

BUSINESS METRICS:
  • New student signups
  • Approved vs pending students
  • New booking requests
  • Match completion rate
  • Booking acceptance rate
  • Average response time
  • Student satisfaction rating

SYSTEM HEALTH:
  • Database connection pool
  • Redis memory usage
  • Disk space remaining
  • API server uptime
  • Cache hit rate
```

---

## Maintenance & Operations

### Daily Tasks

```
□ Check error logs for anomalies
□ Verify email delivery success rate
□ Review failed bookings/matches
□ Check database replication lag
□ Monitor Redis memory usage
```

### Weekly Tasks

```
□ Review analytics dashboard
□ Check slow query log
□ Verify backup completion
□ Review user feedback
□ Check certificate expiry
```

### Monthly Tasks

```
□ Performance analysis
□ Security audit
□ Database optimization
□ Capacity planning review
□ Disaster recovery drill
□ Update dependencies
```

### Quarterly Tasks

```
□ Full security audit
□ Load testing
□ Database migration planning
□ Feature roadmap review
□ Cost optimization review
□ Compliance audit
```

---

## Rollback & Disaster Recovery

### Zero-Downtime Deployment

```
1. Deploy new version to canary (5% traffic)
2. Monitor metrics for 5 minutes
3. If errors > threshold: auto-rollback
4. If OK: Gradual shift (25%, 50%, 100%)
5. Keep previous version live for 30 minutes
6. Full rollback possible in < 1 minute
```

### Database Backup Strategy

```
• Automated daily backups (encrypted)
• Weekly full backup to cold storage
• Point-in-time recovery capability
• Backup retention: 30 days
• Restore test: monthly
• RTO (Recovery Time Objective): 1 hour
• RPO (Recovery Point Objective): 1 hour
```

### Incident Response

```
1. Alert triggered (error rate or latency)
2. On-call engineer notified
3. Severity assessment
4. Page relevant teams
5. Rollback if possible
6. Post-mortem within 24 hours
7. Action items & timeline
```

---

## Success Metrics

### Technical KPIs

```
✓ API Availability: 99.9%
✓ P95 Response Time: < 500ms
✓ Error Rate: < 0.1%
✓ Database Query Time: < 100ms
✓ Email Delivery: > 99%
✓ Uptime SLA: 99.9%
```

### Business KPIs

```
✓ Student approval rate: > 80%
✓ Booking request conversion: > 40%
✓ Match acceptance rate: > 60%
✓ Average rating: > 4.5/5
✓ Customer satisfaction: > 90%
✓ Student retention: > 85%
```

### Growth Metrics

```
✓ New students per week
✓ New tourists per week
✓ Booking requests per week
✓ Cities covered
✓ Platform load (API calls)
```

---

## Production Launch Checklist

### Before Going Live

```
SECURITY
  ☐ All secrets in environment variables
  ☐ HTTPS enforced
  ☐ CORS properly configured
  ☐ Rate limiting enabled
  ☐ Input validation on all endpoints
  ☐ Security headers added
  ☐ SQL injection prevention verified
  ☐ XSS prevention verified
  ☐ CSRF tokens in place

FUNCTIONALITY
  ☐ All endpoints tested
  ☐ Happy path tested
  ☐ Error cases tested
  ☐ Edge cases tested
  ☐ Email notifications working
  ☐ Authentication flows working
  ☐ Database queries optimized
  ☐ File uploads working

PERFORMANCE
  ☐ Load testing completed
  ☐ Database indexes verified
  ☐ Query optimization done
  ☐ Caching implemented
  ☐ Response times acceptable
  ☐ Auto-scaling configured

OPERATIONS
  ☐ Monitoring configured
  ☐ Alerting configured
  ☐ Logging aggregation setup
  ☐ Backup strategy verified
  ☐ Disaster recovery tested
  ☐ Deployment process documented
  ☐ Rollback procedure tested
  ☐ Incident response plan ready

COMPLIANCE
  ☐ Privacy policy published
  ☐ Terms of service published
  ☐ Data protection verified
  ☐ GDPR compliance verified
  ☐ User consent forms ready
  ☐ Cookie consent banner added

DOCUMENTATION
  ☐ API documentation complete
  ☐ Architecture documented
  ☐ Runbooks created
  ☐ Troubleshooting guide created
  ☐ Team trained
  ☐ On-call procedure documented
```

---

## Support & Escalation

### Support Tiers

```
Tier 1 (Chat/Email): General questions
  → Max response time: 4 hours

Tier 2 (Engineering): Technical issues
  → Max response time: 2 hours

Tier 3 (Critical): System down
  → Max response time: 30 minutes
  → On-call engineer immediately
  → Customer notification within 5 minutes
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Students not receiving OTP | Email service down | Check email logs, retry |
| Matching not working | Algorithm error | Review logs, redeploy |
| Database slow | Missing indexes | Add indexes, optimize queries |
| API timeouts | High load | Scale up, optimize queries |
| OAuth not working | Google tokens expired | Refresh, check credentials |

---

## Communication Plan

### Status Page

```
- Real-time incident updates
- Maintenance notifications
- Performance degradation alerts
- Automatic incident posting
- Slack/Email integration
```

### Stakeholder Updates

```
Daily:    Engineering team (metrics review)
Weekly:   Leadership (business metrics)
Monthly:  All teams (performance report)
Quarterly: Board (strategic review)
```

---

## Final Notes for Production

✅ **This documentation covers:**
- Complete API endpoint reference
- User journey flows
- Authentication & authorization
- Database schema & relationships
- Performance optimization
- Security hardening
- Deployment architecture
- Monitoring & alerting
- Incident response
- Compliance & privacy

✅ **Distributed to:**
- Engineering team
- DevOps team
- Product team
- Support team
- Executive stakeholders

✅ **Update frequency:**
- Weekly (for metrics)
- Monthly (for architecture changes)
- Quarterly (for comprehensive review)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Status**: ✅ Production Ready
**Approved By**: [Your Name]
**Next Review**: 2025-12-18
