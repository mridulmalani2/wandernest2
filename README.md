# WanderNest - Multi-Step Booking Form

A comprehensive booking platform connecting tourists with local student guides through an intuitive multi-step form with email verification.

## Features

### Multi-Step Booking Form

#### Step 1: Trip Details
- **City dropdown** - Populated from database
- **Date picker** - Min: today, Max: 6 months ahead
- **Time preference** - Radio buttons (morning/afternoon/evening)
- **Guest count** - Number input (1-10)
- **Group type** - Select (family/friends/solo/business)
- **Accessibility needs** - Optional textarea

#### Step 2: Preferences
- **Nationality** - Optional text input
- **Languages** - Multi-select checkboxes (8 languages)
- **Gender preference** - Radio buttons (male/female/no_preference)
- **Service type** - Radio with descriptions:
  - Itinerary Planning Help
  - Full Guided Experience
- **Interests** - Checkbox group (8 interests with emojis)
- **Budget range** - Slider ($50-$500+ per day)

#### Step 3: Contact & Verification
- **Email** - Required, validated
- **Phone** - Optional with country code
- **WhatsApp** - Checkbox to use phone number
- **Contact method** - Radio (email/phone/whatsapp)
- **Trip notes** - Optional textarea

### Email Verification Flow

1. **Generate Code**: 6-digit code using `Math.floor(100000 + Math.random() * 900000)`
2. **Store in Redis**: 10-minute TTL
3. **Send Email**: Beautiful HTML email with verification code
4. **Verification Modal**: 6 individual input fields for code
5. **Attempt Tracking**: Maximum 3 attempts before requiring regeneration
6. **Success**: Creates TouristRequest in database and redirects to success page

### API Endpoints

- **POST `/api/tourist/request/initiate`**
  - Validates booking data
  - Generates verification code
  - Stores in Redis (10-min TTL)
  - Sends verification email
  - Returns success status

- **POST `/api/tourist/request/verify`**
  - Validates verification code
  - Checks attempt count (max 3)
  - Creates TouristRequest in database
  - Sends confirmation email
  - Returns requestId

- **GET `/api/cities`**
  - Returns list of available cities

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Prisma** - Database ORM (PostgreSQL)
- **Redis (ioredis)** - Verification code storage
- **Nodemailer** - Email sending
- **Zod** - Schema validation

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis server
- SMTP email credentials (Gmail, SendGrid, etc.)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/wandernest"
   REDIS_URL="redis://localhost:6379"
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   EMAIL_FROM="WanderNest <noreply@wandernest.com>"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   VERIFICATION_CODE_EXPIRY=600
   ```

3. **Set up database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Start Redis:**
   ```bash
   redis-server
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
wandernest/
├── app/
│   ├── api/
│   │   ├── cities/
│   │   │   └── route.ts
│   │   └── tourist/
│   │       └── request/
│   │           ├── initiate/
│   │           │   └── route.ts
│   │           └── verify/
│   │               └── route.ts
│   ├── booking/
│   │   ├── success/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── booking/
│   │   ├── BookingForm.tsx
│   │   ├── TripDetailsStep.tsx
│   │   ├── PreferencesStep.tsx
│   │   ├── ContactStep.tsx
│   │   └── VerificationModal.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── radio-group.tsx
│       ├── checkbox.tsx
│       ├── select.tsx
│       ├── slider.tsx
│       ├── dialog.tsx
│       └── textarea.tsx
├── lib/
│   ├── prisma.ts
│   ├── redis.ts
│   ├── email.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Email Verification Details

### Code Generation
```typescript
Math.floor(100000 + Math.random() * 900000) // 6-digit code
```

### Redis Storage
- **Key pattern**: `verification:{email}`
- **Value**: JSON with `{ code: string, attempts: number }`
- **TTL**: 10 minutes (600 seconds)

### Attempt Tracking
- **Max attempts**: 3
- **On failure**: Increment attempt counter
- **After 3 failures**: Require code regeneration

### Email Template
- Beautiful HTML design with gradient header
- Code displayed in large, monospace font
- 10-minute expiry notice
- Security warning for unsolicited emails

## Validation

All form fields are validated using Zod schemas:

- **Email**: Valid email format
- **City**: Required, must be from available cities
- **Dates**: Start date required, must be within next 6 months
- **Guests**: Number between 1-10
- **Languages**: At least one required
- **Interests**: At least one required
- **Service Type**: Required
- **Contact Method**: Required

## Database Schema

### TouristRequest Model
```prisma
model TouristRequest {
  id                   String   @id @default(cuid())
  email                String
  emailVerified        Boolean  @default(false)
  city                 String
  dates                Json
  preferredTime        String
  numberOfGuests       Int
  groupType            String
  preferredNationality String?
  preferredLanguages   String[]
  preferredGender      String?
  serviceType          String
  interests            String[]
  budget               Float?
  phone                String?
  whatsapp             String?
  contactMethod        String
  tripNotes            String?
  accessibilityNeeds   String?
  status               RequestStatus @default(PENDING)
  expiresAt            DateTime
  createdAt            DateTime @default(now())
}
```

## Pages

- **`/`** - Landing page with hero section
- **`/booking`** - Multi-step booking form
- **`/booking/success`** - Success page with request ID

## Future Enhancements

- [ ] Admin dashboard for managing requests
- [ ] Student guide portal
- [ ] Real-time matching algorithm
- [ ] Payment integration
- [ ] Review system
- [ ] Mobile app
- [ ] Multi-language support
- [ ] SMS verification option

## License

MIT

## Support

For issues or questions, contact: support@wandernest.com
