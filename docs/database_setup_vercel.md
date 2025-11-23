# Database Setup Guide for Vercel Deployment

This guide walks you through setting up a PostgreSQL database for WanderNest on Vercel, from creation to initial data seeding.

---

## Overview

WanderNest uses **PostgreSQL** with **Prisma ORM** for all data storage. The database stores:

- **Students** - Local student guides with profiles and verification
- **Tourists** - Travelers creating booking requests
- **TouristRequests** - Trip booking inquiries
- **RequestSelections** - Matching records between students and requests
- **Reviews** - Feedback and ratings
- **Admins** - Admin panel users
- **Sessions** - NextAuth authentication sessions

---

## Step 1: Create Vercel Postgres Database

### Option A: Via Vercel Dashboard (Recommended)

1. **Navigate to your Vercel project**
   - Go to [vercel.com](https://vercel.com)
   - Select your WanderNest project

2. **Create a new Postgres database**
   - Click the **Storage** tab
   - Click **Create Database**
   - Select **Postgres**
   - Choose a database name (e.g., `wandernest-db`)
   - Select a region (choose closest to your users)
   - Click **Create**

3. **Connect to your project**
   - Vercel will automatically add the database to your project
   - The `DATABASE_URL` environment variable is set automatically
   - Click **Connect** to link it to your project

4. **Verify environment variable**
   - Go to **Settings** → **Environment Variables**
   - Confirm `DATABASE_URL` is present
   - Format: `postgres://user:pass@host:5432/db?sslmode=require`

### Option B: Via Vercel CLI

```bash
# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Create Postgres database
vercel postgres create wandernest-db

# Link database to project
vercel postgres link wandernest-db
```

### Option C: External Postgres Provider

You can also use:
- **Supabase** (https://supabase.com) - Free tier available
- **Neon** (https://neon.tech) - Serverless Postgres
- **Railway** (https://railway.app) - Easy setup
- **DigitalOcean Managed Postgres**

For external providers, manually add the `DATABASE_URL` to your Vercel environment variables.

---

## Step 2: Verify Database Connection

### Check Connection String Format

Your `DATABASE_URL` should look like this:

```
postgresql://user:password@host:5432/database?sslmode=require
```

Key components:
- **Protocol**: `postgresql://` (not `postgres://`)
- **SSL Mode**: `?sslmode=require` (required for Vercel Postgres)
- **Host**: Vercel Postgres uses AWS regions (e.g., `us-east-1.postgres.vercel-storage.com`)

### Test Locally (Optional)

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Test database connection
npx prisma db execute --preview-feature --stdin <<< "SELECT 1"
```

---

## Step 2.5: Serverless Database Optimization (Important!)

### Connection Pooling for Vercel Functions

Serverless functions like those on Vercel have unique database connection requirements:

#### The Problem
- Each serverless function invocation may create new database connections
- PostgreSQL has limited connection slots (typically 100 for free tiers)
- Too many concurrent requests can exhaust connections
- Cold starts can create connection spikes

#### The Solution: Connection Pooling

**Vercel Postgres automatically provides a pooled connection URL:**

1. **POSTGRES_URL** - Direct connection (use for migrations only)
2. **POSTGRES_PRISMA_URL** - Pooled connection via PgBouncer (use this for app)

**Required Configuration:**

Set your `DATABASE_URL` to use the pooled connection:

```bash
# In Vercel Environment Variables
DATABASE_URL="${POSTGRES_PRISMA_URL}"
```

This URL includes:
- `?pgbouncer=true` - Routes through PgBouncer connection pooler
- `&connection_limit=1` - Limits connections per function instance
- `&pool_timeout=0` - Prevents waiting for available connections

#### WanderNest Prisma Configuration

Our Prisma client (in `src/lib/prisma.ts`) is already optimized for serverless:

```typescript
// ✅ Singleton pattern - reuses connection across requests
const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: config.app.isDevelopment ? ['error', 'warn'] : ['error'],
  datasources: { db: { url: config.database.url! } },
  errorFormat: config.app.isDevelopment ? 'pretty' : 'minimal',
})

// ✅ Global singleton prevents multiple client instances
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prismaClient
}
```

#### Best Practices

1. **Always use the pooled URL** (`POSTGRES_PRISMA_URL`) for your application
2. **Use direct URL** (`POSTGRES_URL`) only for:
   - Running migrations (`prisma migrate deploy`)
   - Database introspection (`prisma db pull`)
   - Prisma Studio in development

3. **Don't disconnect Prisma in serverless**:
   ```typescript
   // ❌ Don't do this in serverless functions:
   await prisma.$disconnect()

   // ✅ Let Vercel handle cleanup automatically
   ```

4. **Monitor connection usage**:
   ```bash
   vercel postgres connections wandernest-db
   ```

#### Troubleshooting Connection Issues

If you see errors like:
```
Error: P1001 - Can't reach database server
Error: remaining connection slots are reserved
```

**Check your configuration:**
1. Verify `DATABASE_URL` uses the pooled connection string
2. Check that `?pgbouncer=true` is in the URL
3. Ensure you're not calling `$disconnect()` in API routes
4. Monitor concurrent function invocations

---

## Step 3: Run Database Migrations

Migrations create all required tables in your PostgreSQL database.

### Automatic Migration (During Deployment)

Vercel automatically runs migrations on every deployment via the `vercel-build` script:

```json
{
  "scripts": {
    "vercel-build": "prisma generate --schema=./src/prisma/schema.prisma && prisma migrate deploy --schema=./src/prisma/schema.prisma && next build"
  }
}
```

This ensures your database schema is always up-to-date.

### Manual Migration (One-Time Setup)

If you need to run migrations manually for a new database:

```bash
# Option 1: Via Vercel CLI (remote database)
vercel env pull .env.local
npx prisma migrate deploy --schema=./src/prisma/schema.prisma

# Option 2: Direct connection (if you have the connection string)
DATABASE_URL="your-connection-string" npx prisma migrate deploy --schema=./src/prisma/schema.prisma
```

### What Gets Created

The migration creates these tables:

| Table | Purpose |
|-------|---------|
| `Student` | Student guide profiles |
| `StudentAvailability` | Weekly availability schedules |
| `UnavailabilityException` | Specific unavailable dates |
| `Tourist` | Tourist user accounts |
| `TouristRequest` | Booking requests |
| `RequestSelection` | Student-request matches |
| `Review` | Ratings and feedback |
| `Report` | Student misconduct reports |
| `Admin` | Admin users |
| `TouristSession` | Email verification sessions |
| `StudentSession` | Student auth sessions |
| `User`, `Account`, `Session`, `VerificationToken` | NextAuth tables |
| `ContactMessage` | Contact form submissions |

---

## Step 4: Verify Migration Success

### Check Migration Status

```bash
npx prisma migrate status --schema=./src/prisma/schema.prisma
```

Expected output:
```
Database schema is up to date!
```

### List All Tables

```bash
npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public'" --schema=./src/prisma/schema.prisma
```

You should see all tables listed above.

---

## Step 5: Seed Initial Data (Optional)

### What is Seeding?

Seeding populates your database with initial data for testing and development. For WanderNest, you might want to seed:

- Sample admin accounts
- Test student profiles
- Demo cities and locations

### Check for Seed Script

```bash
# Check if seed script exists
ls src/prisma/seed.ts

# If it exists, run it
npm run seed
```

### Manual Admin Creation

If you don't have a seed script, create an admin account manually:

```bash
# Connect to your database
vercel postgres connect wandernest-db

# Or use Prisma Studio
npx prisma studio --schema=./src/prisma/schema.prisma
```

Create admin via SQL:

```sql
-- Generate password hash first (use bcrypt online tool or Node.js)
-- Example: password "admin123" → hash "$2a$10$..."

INSERT INTO "Admin" (id, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin_' || gen_random_uuid()::text,
  'admin@wandernest.com',
  '$2a$10$YourBcryptHashHere',
  'System Admin',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

To generate a bcrypt hash:

```javascript
// Run in Node.js
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

---

## Step 6: Database Schema Overview

### Core Models

#### Student Model
```prisma
model Student {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  city              String?
  nationality       String?
  languages         String[]
  interests         String[]
  status            StudentStatus  // PENDING_APPROVAL, APPROVED, SUSPENDED
  tripsHosted       Int      @default(0)
  averageRating     Float?
  // ... more fields
}
```

#### TouristRequest Model
```prisma
model TouristRequest {
  id                String   @id @default(cuid())
  email             String
  city              String
  dates             Json
  serviceType       String   // itinerary_help, guided_experience
  interests         String[]
  status            RequestStatus  // PENDING, MATCHED, ACCEPTED
  expiresAt         DateTime
  // ... more fields
}
```

#### RequestSelection Model
```prisma
model RequestSelection {
  id                String   @id @default(cuid())
  requestId         String
  studentId         String
  status            String   // pending, accepted, rejected
  // ... more fields
}
```

### Key Indexes

For optimal performance, these indexes are created:

- `Student`: city, status, email, nationality
- `TouristRequest`: city, status, email
- `RequestSelection`: requestId, studentId, status

---

## Step 7: Backup and Monitoring

### Enable Automatic Backups (Vercel Postgres)

Vercel Postgres automatically backs up your database:
- **Point-in-time recovery**: Up to 7 days
- **Daily snapshots**: Retained for 30 days

### Monitor Database Usage

```bash
# Check database size
vercel postgres stats wandernest-db

# View active connections
vercel postgres connections wandernest-db
```

### Manual Backup

```bash
# Export database to SQL file
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20250122.sql
```

---

## Step 8: Prisma Studio (Database GUI)

Prisma Studio provides a web interface to view and edit your database:

```bash
# Pull environment variables
vercel env pull .env.local

# Launch Prisma Studio
npx prisma studio --schema=./src/prisma/schema.prisma
```

This opens a browser at `http://localhost:5555` where you can:
- Browse all tables
- View and edit records
- Create new entries
- Delete data

---

## Troubleshooting

### Error: "Can't reach database server"

```
❌ Error: P1001 - Can't reach database server at `host:5432`
```

**Solutions:**
1. Check `DATABASE_URL` is set correctly
2. Verify SSL mode: `?sslmode=require`
3. Ensure database is running (Vercel Postgres status)
4. Check firewall/network settings

### Error: "Database does not exist"

```
❌ Error: P1003 - Database does not exist
```

**Solutions:**
1. Create database first via Vercel dashboard
2. Verify database name in connection string
3. Run `vercel postgres create <name>`

### Error: "Authentication failed"

```
❌ Error: P1000 - Authentication failed
```

**Solutions:**
1. Regenerate database credentials
2. Update `DATABASE_URL` in Vercel environment variables
3. Check username/password encoding (special characters)

### Error: "Migration failed"

```
❌ Error: Migration failed to apply
```

**Solutions:**
1. Check migration history: `npx prisma migrate status`
2. Reset database (⚠️ deletes all data): `npx prisma migrate reset`
3. Manually resolve migration conflicts
4. Contact support if using Vercel Postgres

### Connection Pooling Issues

If you see "Too many connections":

```
❌ Error: remaining connection slots are reserved
```

**Solutions:**
1. Use the pooled connection string for serverless:
   - Vercel Postgres provides `POSTGRES_PRISMA_URL` with `?pgbouncer=true`
   - Set this as your `DATABASE_URL` for optimal serverless performance
2. Prisma automatically handles connection pooling via the client singleton
3. Reduce concurrent deployments
4. Upgrade Vercel Postgres plan for more connections

**Best Practice for Vercel:**
```bash
# Use the pooled connection URL from Vercel Postgres
DATABASE_URL="${POSTGRES_PRISMA_URL}"
```

The pooled URL includes parameters like:
- `?pgbouncer=true` - Enables connection pooling
- `&connection_limit=1` - Limits connections per serverless function instance

---

## Migration Commands Reference

### Development

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field --schema=./src/prisma/schema.prisma

# Reset database (⚠️ deletes all data)
npx prisma migrate reset --schema=./src/prisma/schema.prisma

# View migration history
npx prisma migrate status --schema=./src/prisma/schema.prisma
```

### Production

```bash
# Apply pending migrations (used in vercel-build)
npx prisma migrate deploy --schema=./src/prisma/schema.prisma

# Verify current schema
npx prisma db pull --schema=./src/prisma/schema.prisma
```

### Utilities

```bash
# Generate Prisma Client
npx prisma generate --schema=./src/prisma/schema.prisma

# Open Prisma Studio
npx prisma studio --schema=./src/prisma/schema.prisma

# Format schema file
npx prisma format --schema=./src/prisma/schema.prisma

# Validate schema
npx prisma validate --schema=./src/prisma/schema.prisma
```

---

## Production Checklist

Before deploying to production:

- [ ] ✅ Vercel Postgres database created
- [ ] ✅ `DATABASE_URL` environment variable set
- [ ] ✅ SSL mode enabled (`?sslmode=require`)
- [ ] ✅ Migrations applied successfully
- [ ] ✅ All tables created (verified via Prisma Studio)
- [ ] ✅ Admin account created
- [ ] ✅ Connection pooling configured (automatic with Prisma)
- [ ] ✅ Backup strategy in place
- [ ] ✅ Database region matches deployment region (for lower latency)

---

## Quick Command Reference

```bash
# Setup
vercel postgres create wandernest-db
vercel postgres link wandernest-db
vercel env pull .env.local

# Migrations
npx prisma migrate deploy --schema=./src/prisma/schema.prisma
npx prisma migrate status --schema=./src/prisma/schema.prisma

# Database Management
npx prisma studio --schema=./src/prisma/schema.prisma
npx prisma db push --schema=./src/prisma/schema.prisma  # Development only

# Verification
npx prisma validate --schema=./src/prisma/schema.prisma
```

---

## Next Steps

After setting up your database:

1. **Set up authentication** → See `docs/env_variables_required.md`
2. **Configure email notifications** → Optional but recommended
3. **Deploy to Vercel** → `vercel --prod`
4. **Monitor database performance** → Vercel dashboard
5. **Set up Redis (optional)** → For improved performance

---

## Support

- **Vercel Postgres Docs**: https://vercel.com/docs/storage/vercel-postgres
- **Prisma Docs**: https://www.prisma.io/docs
- **Database Issues**: Check application logs in Vercel dashboard
- **Migration Help**: Review migration files in `src/prisma/migrations/`

---

## Summary

You've successfully set up your database when you can:
1. ✅ See `DATABASE_URL` in Vercel environment variables
2. ✅ Run `npx prisma migrate status` without errors
3. ✅ View all tables in Prisma Studio
4. ✅ See "Database: ✅ Connected" in application logs
5. ✅ Create test students and tourist requests

Your WanderNest application is now ready to handle real booking data!
