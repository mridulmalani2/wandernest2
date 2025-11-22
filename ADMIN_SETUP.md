# Admin Dashboard & Tourist Dashboard Setup Guide

This guide covers the setup and usage of the TourWiseCo Admin Dashboard and Tourist Dashboard.

## Features Implemented

### Admin Dashboard
- **Student Approval Queue** (`/admin/approvals`)
  - Review student applications with cover letters
  - View student ID cards in modal
  - Syntax-highlighted cover letters using highlight.js
  - Quick approve/reject buttons
  - Bulk approval actions for efficiency

- **Student Management** (`/admin/students`)
  - View all students with filtering by status and city
  - See student metrics (trips hosted, ratings, acceptance rate)
  - Reliability badge system (bronze, silver, gold)
  - Pagination support

- **Safety Reports** (`/admin/reports`)
  - Review user-submitted reports
  - Filter by status (pending, reviewed, resolved)
  - Update report status
  - View detailed report information

- **Platform Analytics** (`/admin/analytics`)
  - Demand-supply ratio by city
  - Average response time metrics
  - Match success rate
  - Average price by service type
  - Overall platform metrics

### Tourist Dashboard
- **Email-based Authentication**
  - Send 6-digit verification code to email
  - Verify code and create temporary JWT (1 hour expiry)
  - No password required

- **Request History**
  - View all past tour requests
  - See request status with color-coded badges
  - View matched students
  - See submitted reviews

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tourwiseco"
JWT_SECRET="your-super-secret-jwt-key"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"
EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"
```

### 2. Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Create Admin User

Create your first admin user using Prisma Studio or a seed script:

```typescript
// seed-admin.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10)

  await prisma.admin.create({
    data: {
      email: 'admin@tourwiseco.com',
      passwordHash,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  })

  console.log('Admin user created!')
}

main()
```

Run the seed script:
```bash
npx ts-node seed-admin.ts
```

### 4. Email Configuration

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

### 5. Start Development Server

```bash
npm run dev
```

## Usage

### Admin Routes

1. **Login**: `/admin/login`
   - Use admin credentials created in setup
   - JWT token stored in localStorage

2. **Approvals**: `/admin/approvals`
   - Review pending student applications
   - Click "Review" to see full details in modal
   - Approve or reject individual students
   - Use bulk actions for multiple students

3. **Students**: `/admin/students`
   - Filter by status: Approved, Pending, Suspended
   - Filter by city
   - Paginated view of all students
   - See metrics and ratings

4. **Reports**: `/admin/reports`
   - Filter by status
   - Click "View Details" for full report
   - Update status: pending → reviewed → resolved

5. **Analytics**: `/admin/analytics`
   - View platform overview metrics
   - Demand-supply ratio by city
   - Response time and match success
   - Average pricing by service type

### Tourist Dashboard

1. **Access**: `/tourist/dashboard`
   - Enter email address
   - Receive 6-digit code via email
   - Enter code to access dashboard
   - JWT token valid for 1 hour

2. **Dashboard**
   - View all past requests
   - See request status
   - View matched students
   - See submitted reviews

## API Endpoints

### Admin API
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/students/pending` - Get pending approvals
- `POST /api/admin/students/approve` - Approve/reject student
- `POST /api/admin/students/bulk-approve` - Bulk approve/reject
- `GET /api/admin/students` - Get all students (with filters)
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/reports` - Get reports
- `PATCH /api/admin/reports` - Update report status

### Tourist API
- `POST /api/tourist/dashboard/access` - Send verification code
- `POST /api/tourist/dashboard/verify` - Verify code and get JWT
- `GET /api/tourist/dashboard/requests` - Get tourist's requests

## Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in production to a strong random string
2. **Database**: Use environment-specific database URLs
3. **Email**: Use secure app-specific passwords, never commit credentials
4. **Admin Passwords**: Use strong passwords with bcrypt hashing
5. **HTTPS**: Always use HTTPS in production

## Database Schema

### New Models Added

**Admin**
- id, email, passwordHash, name, role, isActive
- Roles: SUPER_ADMIN, MODERATOR, SUPPORT

**TouristSession**
- id, email, verificationCode, token, isVerified, expiresAt
- Used for email-based authentication

### Updated Models

**RequestSelection**
- Added `pricePaid` for analytics
- Added `acceptedAt` for response time calculation

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Email**: Nodemailer
- **Syntax Highlighting**: highlight.js
- **Password Hashing**: bcryptjs

## Troubleshooting

**Admin can't login**
- Verify admin user exists in database
- Check password hash is correct
- Verify JWT_SECRET is set

**Email not sending**
- Check EMAIL_* environment variables
- Verify SMTP credentials
- Check email provider allows SMTP access

**Database connection error**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run Prisma migrations

## Next Steps

1. Add file upload for student ID cards
2. Implement admin user management
3. Add email templates for verification codes
4. Add real-time notifications
5. Implement audit logs
6. Add export functionality for analytics data
