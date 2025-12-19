# GigStream - System Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Authentication Flow](#authentication-flow)
8. [Payment Flow](#payment-flow)
9. [Real-time Communication](#real-time-communication)
10. [File Upload Architecture](#file-upload-architecture)
11. [Security Architecture](#security-architecture)
12. [Deployment Architecture](#deployment-architecture)

---

## Overview

GigStream is a modern freelance marketplace platform built with Next.js 16, featuring:
- **Server-Side Rendering (SSR)** for optimal SEO
- **Real-time messaging** via Pusher
- **Secure payments** via Stripe
- **File uploads** via Cloudinary
- **Type-safe database** via Prisma ORM

### Key Characteristics
- **Monolithic Architecture**: Single Next.js application
- **Full-Stack**: API routes + React components
- **Type-Safe**: TypeScript throughout
- **Database-First**: Prisma schema as source of truth
- **Edge-Ready**: Deployable to Vercel Edge Network

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Browser │  │  Mobile  │  │  Tablet  │  │   PWA    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼────────────┼─────────────┼─────────────┼──────────┘
        │            │             │             │
        └────────────┴─────────────┴─────────────┘
                     │
        ┌────────────▼─────────────────────────────────────┐
        │           VERCEL EDGE NETWORK (CDN)              │
        │  - Global distribution                           │
        │  - SSL/TLS termination                          │
        │  - DDoS protection                              │
        └────────────┬─────────────────────────────────────┘
                     │
        ┌────────────▼─────────────────────────────────────┐
        │         NEXT.JS 16 APPLICATION                   │
        │  ┌──────────────────────────────────────┐       │
        │  │     APP ROUTER (Server Components)    │       │
        │  ├──────────────────────────────────────┤       │
        │  │  Pages  │  Components  │  Layouts    │       │
        │  └──────────────────────────────────────┘       │
        │  ┌──────────────────────────────────────┐       │
        │  │         API ROUTES LAYER              │       │
        │  │  /api/auth  /api/gigs  /api/orders   │       │
        │  └──────────────────────────────────────┘       │
        │  ┌──────────────────────────────────────┐       │
        │  │       MIDDLEWARE LAYER                │       │
        │  │  - Authentication                     │       │
        │  │  - Rate limiting                      │       │
        │  │  - CORS handling                      │       │
        │  └──────────────────────────────────────┘       │
        └────────────┬─────────────────────────────────────┘
                     │
        ┌────────────┴─────────────────────────────────────┐
        │                                                   │
   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐    │
   │ Prisma  │  │ Stripe  │  │Cloudinary│  │ Pusher  │    │
   │   ORM   │  │   API   │  │   API    │  │   API   │    │
   └────┬────┘  └─────────┘  └──────────┘  └─────────┘    │
        │                                                   │
   ┌────▼────────────────────────────────────────────┐    │
   │         PostgreSQL Database                      │    │
   │  - Users, Gigs, Orders, Messages                │    │
   │  - Reviews, Transactions, Notifications         │    │
   └─────────────────────────────────────────────────┘    │
                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Stack
```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
├─────────────────────────────────────────┤
│ React 19                                │
│ - Server Components (default)           │
│ - Client Components (interactive)       │
│ - Streaming SSR                         │
├─────────────────────────────────────────┤
│ Next.js 16 App Router                   │
│ - File-based routing                    │
│ - Layouts & Templates                   │
│ - Loading & Error states                │
├─────────────────────────────────────────┤
│ TypeScript                              │
│ - Strict mode enabled                   │
│ - Type inference                        │
│ - Interface definitions                 │
├─────────────────────────────────────────┤
│ Tailwind CSS 4                          │
│ - Utility-first styling                 │
│ - Custom design system                  │
│ - Responsive breakpoints                │
├─────────────────────────────────────────┤
│ UI Libraries                            │
│ - Lucide React (icons)                  │
│ - Recharts (analytics)                  │
│ - React Hook Form (forms)               │
│ - Zod (validation)                      │
└─────────────────────────────────────────┘
```

### Backend Stack
```
┌─────────────────────────────────────────┐
│          APPLICATION LAYER              │
├─────────────────────────────────────────┤
│ Next.js API Routes                      │
│ - RESTful endpoints                     │
│ - Route handlers                        │
│ - Middleware support                    │
├─────────────────────────────────────────┤
│ Prisma ORM                              │
│ - Type-safe queries                     │
│ - Migration system                      │
│ - Schema validation                     │
├─────────────────────────────────────────┤
│ NextAuth.js                             │
│ - Session management                    │
│ - JWT tokens                            │
│ - OAuth providers                       │
├─────────────────────────────────────────┤
│ External Services                       │
│ - Stripe (payments)                     │
│ - Cloudinary (files)                    │
│ - Pusher (real-time)                    │
│ - Resend (emails)                       │
└─────────────────────────────────────────┘
```

### Data Layer
```
┌─────────────────────────────────────────┐
│           DATABASE LAYER                │
├─────────────────────────────────────────┤
│ PostgreSQL (Production)                 │
│ - ACID compliance                       │
│ - Relational integrity                  │
│ - Full-text search                      │
├─────────────────────────────────────────┤
│ SQLite (Development)                    │
│ - Fast local development                │
│ - Zero configuration                    │
│ - Easy testing                          │
├─────────────────────────────────────────┤
│ Connection Pooling                      │
│ - Prisma connection pool                │
│ - Max connections: 10                   │
│ - Timeout: 30s                          │
└─────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    User      │         │     Gig      │         │    Order     │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │────────▶│ sellerId(FK) │◀────────│ gigId (FK)   │
│ email        │         │ id (PK)      │         │ id (PK)      │
│ password     │         │ title        │         │ buyerId (FK) │
│ role         │         │ description  │         │ sellerId(FK) │
│ fullName     │         │ category     │         │ status       │
│ avatar       │         │ price        │         │ totalAmount  │
│ rating       │         │ packages     │         │ createdAt    │
│ isVerified   │         │ images       │         └──────┬───────┘
└──────┬───────┘         │ status       │                │
       │                 │ rating       │                │
       │                 └──────┬───────┘                │
       │                        │                        │
       │                        │                        │
┌──────▼───────┐         ┌─────▼────────┐        ┌─────▼────────┐
│   Review     │         │  Favorite    │        │ Deliverable  │
├──────────────┤         ├──────────────┤        ├──────────────┤
│ id (PK)      │         │ id (PK)      │        │ id (PK)      │
│ orderId (FK) │         │ userId (FK)  │        │ orderId (FK) │
│ gigId (FK)   │         │ gigId (FK)   │        │ fileUrl      │
│ reviewerId   │         │ createdAt    │        │ fileName     │
│ sellerId     │         └──────────────┘        │ fileSize     │
│ rating       │                                 └──────────────┘
│ comment      │
└──────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│Conversation  │         │   Message    │         │Notification  │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │────────▶│ convId (FK)  │         │ id (PK)      │
│ orderId (FK) │         │ id (PK)      │         │ userId (FK)  │
│ createdAt    │         │ senderId(FK) │         │ type         │
└──────┬───────┘         │ content      │         │ title        │
       │                 │ attachments  │         │ message      │
       │                 │ status       │         │ isRead       │
       │                 └──────────────┘         └──────────────┘
       │
┌──────▼───────────────┐
│ConversationParticipant│
├──────────────────────┤
│ id (PK)              │
│ conversationId (FK)  │
│ userId (FK)          │
│ unreadCount          │
│ lastReadAt           │
└──────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Transaction │         │   Wallet     │         │   Dispute    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ userId (FK)  │         │ userId (FK)  │         │ orderId (FK) │
│ orderId (FK) │         │ balance      │         │ initiatorId  │
│ type         │         │ pending      │         │ reason       │
│ amount       │         │ totalEarnings│         │ description  │
│ status       │         │ totalWithdraw│         │ status       │
│ method       │         └──────────────┘         │ resolution   │
└──────────────┘                                  └──────────────┘
```

### Core Models

#### User Model
```typescript
model User {
  // Identity
  id            String    @id @default(cuid())
  email         String    @unique
  username      String?   @unique
  password      String?
  
  // Profile
  fullName      String?
  avatar        String?
  bio           String?
  location      String?
  
  // Role & Status
  role          UserRole  @default(BUYER)
  status        UserStatus @default(ACTIVE)
  isVerified    Boolean   @default(false)
  
  // Metrics
  rating        Float     @default(0)
  totalReviews  Int       @default(0)
  totalEarnings Float     @default(0)
  
  // Relations
  gigsAsSeller      Gig[]
  ordersAsBuyer     Order[]
  ordersAsSeller    Order[]
  reviews           Review[]
  messages          Message[]
  favorites         Favorite[]
}
```

#### Gig Model
```typescript
model Gig {
  id              String      @id @default(cuid())
  sellerId        String
  seller          User        @relation(fields: [sellerId])
  
  // Content
  title           String
  slug            String      @unique
  description     String
  category        String
  tags            String      // JSON
  images          String      // JSON
  
  // Pricing
  packages        Json        // {basic, standard, premium}
  price           Float       // Starting price
  
  // Status
  status          GigStatus   @default(DRAFT)
  rating          Float       @default(0)
  totalOrders     Int         @default(0)
  
  // Relations
  orders          Order[]
  reviews         Review[]
  favorites       Favorite[]
}
```

#### Order Model
```typescript
model Order {
  id              String        @id @default(cuid())
  
  // Parties
  gigId           String
  gig             Gig           @relation(fields: [gigId])
  buyerId         String
  buyer           User          @relation("BuyerOrders")
  sellerId        String
  seller          User          @relation("SellerOrders")
  
  // Package & Pricing
  packageType     String        // BASIC, STANDARD, PREMIUM
  price           Float
  serviceFee      Float
  totalAmount     Float
  
  // Status
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentIntentId String?
  
  // Delivery
  deliveryDate    DateTime
  revisionCount   Int           @default(0)
  maxRevisions    Int
  
  // Relations
  deliverables    Deliverable[]
  review          Review?
  messages        Message[]
  dispute         Dispute?
}
```

---

## API Architecture

### API Route Structure

```
/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth handler
│   ├── register/route.ts         # User registration
│   ├── forgot-password/route.ts  # Password reset request
│   └── reset-password/route.ts   # Password reset
├── gigs/
│   └── route.ts                  # GET, POST gigs
├── orders/
│   ├── route.ts                  # GET, POST orders
│   └── [id]/
│       └── status/route.ts       # PATCH order status
├── messages/
│   └── route.ts                  # GET, POST messages
├── conversations/
│   └── route.ts                  # GET conversations
├── reviews/
│   ├── route.ts                  # POST review
│   └── [id]/route.ts             # DELETE review (admin)
├── notifications/
│   └── route.ts                  # GET, PATCH notifications
├── disputes/
│   └── route.ts                  # POST dispute
├── favorites/
│   └── route.ts                  # GET, POST, DELETE favorites
├── upload/
│   └── route.ts                  # POST file upload
├── checkout/
│   └── route.ts                  # POST create payment
├── webhooks/
│   └── stripe/route.ts           # POST Stripe webhook
├── admin/
│   ├── analytics/
│   │   └── revenue/route.ts      # GET revenue data
│   └── settings/route.ts         # GET, PATCH settings
├── search/
│   └── suggestions/route.ts      # GET search suggestions
├── users/
│   └── profile/route.ts          # GET, PATCH profile
└── seed/
    └── route.ts                  # POST seed database
```

### API Request/Response Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. HTTP Request
       │    (GET /api/gigs?category=Design)
       ▼
┌──────────────────────┐
│   Middleware         │
│  - Auth check        │
│  - Rate limiting     │
│  - CORS headers      │
└──────┬───────────────┘
       │ 2. Validated Request
       ▼
┌──────────────────────┐
│   Route Handler      │
│  /api/gigs/route.ts  │
│  - Parse params      │
│  - Validate input    │
└──────┬───────────────┘
       │ 3. Database Query
       ▼
┌──────────────────────┐
│   Prisma ORM         │
│  - Build query       │
│  - Execute           │
│  - Return results    │
└──────┬───────────────┘
       │ 4. Raw Data
       ▼
┌──────────────────────┐
│   Data Transform     │
│  - Map to FE types   │
│  - Parse JSON fields │
│  - Format dates      │
└──────┬───────────────┘
       │ 5. JSON Response
       ▼
┌──────────────────────┐
│   Client             │
│  - Update UI         │
│  - Cache data        │
└──────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
│   ├── Navbar
│   │   ├── Logo
│   │   ├── SearchBar
│   │   ├── Navigation Links
│   │   └── UserMenu
│   │       ├── Notifications
│   │       └── Profile Dropdown
│   │
│   ├── [Page Content]
│   │
│   └── Footer
│       ├── Newsletter
│       ├── Links
│       └── Social
│
├── page.tsx (Homepage)
│   ├── Hero
│   │   ├── SearchBar
│   │   └── PopularTags
│   ├── Categories
│   ├── FeaturedGigs
│   ├── Stats
│   ├── Features
│   └── CTA
│
├── marketplace/page.tsx
│   ├── SearchFilters
│   │   ├── CategoryFilter
│   │   ├── PriceRange
│   │   └── SortOptions
│   ├── GigGrid
│   │   └── GigCard[]
│   │       ├── Image
│   │       ├── SellerInfo
│   │       ├── Title
│   │       ├── Rating
│   │       ├── Price
│   │       └── FavoriteButton
│   └── Pagination
│
├── gig/[slug]/page.tsx
│   ├── GigHeader
│   ├── GigGallery
│   ├── GigDescription
│   ├── PackageSelector
│   │   ├── BasicPackage
│   │   ├── StandardPackage
│   │   └── PremiumPackage
│   ├── SellerCard
│   ├── Reviews
│   │   └── ReviewCard[]
│   └── FAQ
│
├── dashboard/
│   ├── layout.tsx (Dashboard Layout)
│   │   ├── Sidebar
│   │   └── [Dashboard Content]
│   │
│   ├── page.tsx (Dashboard Home)
│   │   ├── Stats
│   │   ├── RecentOrders
│   │   └── QuickActions
│   │
│   ├── orders/
│   │   ├── page.tsx (Order List)
│   │   └── [id]/
│   │       ├── page.tsx (Order Details)
│   │       ├── OrderActions
│   │       ├── review/page.tsx
│   │       └── dispute/
│   │           ├── page.tsx
│   │           └── DisputeForm
│   │
│   └── settings/
│       ├── page.tsx
│       └── SettingsForm
│
├── messages/page.tsx
│   ├── ConversationList
│   └── ChatInterface
│       ├── MessageList
│       ├── MessageInput
│       └── FileUpload
│
└── admin/
    ├── layout.tsx (Admin Layout)
    │   ├── AdminSidebar
    │   └── [Admin Content]
    │
    ├── page.tsx (Admin Dashboard)
    │   ├── RevenueChart
    │   ├── UserStats
    │   └── RecentActivity
    │
    ├── users/page.tsx
    ├── gigs/page.tsx
    ├── orders/page.tsx
    ├── reviews/page.tsx
    └── settings/page.tsx
```

### Data Flow Pattern

```
┌─────────────────────────────────────────────────────┐
│              SERVER COMPONENT (Default)              │
│  - Fetch data on server                             │
│  - No JavaScript sent to client                     │
│  - SEO-friendly                                     │
│                                                      │
│  async function Page() {                            │
│    const data = await prisma.gig.findMany()        │
│    return <GigList gigs={data} />                  │
│  }                                                   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│            CLIENT COMPONENT (Interactive)            │
│  "use client"                                       │
│  - Event handlers                                   │
│  - State management                                 │
│  - Browser APIs                                     │
│                                                      │
│  function GigCard({ gig }) {                        │
│    const [isFavorited, setIsFavorited] = useState() │
│    return <button onClick={...}>...</button>        │
│  }                                                   │
└─────────────────────────────────────────────────────┘
```

---

**[CHUNK 1 COMPLETE - Architecture Overview & Database Schema]**

This is a logical breakpoint. The architecture documentation has covered:
- ✅ System overview
- ✅ High-level architecture diagram
- ✅ Technology stack breakdown
- ✅ Complete database schema with ERD
- ✅ API architecture structure
- ✅ Frontend component hierarchy

**Next chunks will cover:**
- Authentication flow
- Payment flow
- Real-time communication
- File upload architecture
- Security architecture
- Deployment architecture

Reply "continue" to proceed with the next chunk.

## Authentication Flow

### User Registration Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /api/auth/register
     │    { email, password, fullName }
     ▼
┌──────────────────────┐
│  Register Handler    │
│  - Validate input    │
│  - Check existing    │
└────┬─────────────────┘
     │ 2. Hash password (bcrypt)
     ▼
┌──────────────────────┐
│  Prisma              │
│  User.create()       │
└────┬─────────────────┘
     │ 3. User created
     ▼
┌──────────────────────┐
│  Send Email          │
│  (Verification)      │
└────┬─────────────────┘
     │ 4. Success response
     ▼
┌──────────────────────┐
│  Redirect to Login   │
└──────────────────────┘
```

### Login Flow (NextAuth.js)

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /api/auth/signin
     │    { email, password }
     ▼
┌──────────────────────────────┐
│  NextAuth Credentials        │
│  - Find user by email        │
│  - Compare password (bcrypt) │
└────┬─────────────────────────┘
     │ 2. Valid credentials
     ▼
┌──────────────────────────────┐
│  Create Session              │
│  - Generate JWT token        │
│  - Set secure cookie         │
│  - Store in database         │
└────┬─────────────────────────┘
     │ 3. Session token
     ▼
┌──────────────────────────────┐
│  Return Session              │
│  { user, expires, token }    │
└────┬─────────────────────────┘
     │ 4. Redirect to dashboard
     ▼
┌──────────────────────────────┐
│  Client (Authenticated)      │
│  - Session stored            │
│  - Token in cookie           │
└──────────────────────────────┘
```

### Protected Route Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. Request protected page
     │    GET /dashboard
     ▼
┌──────────────────────────────┐
│  Middleware                  │
│  - Check session cookie      │
│  - Validate JWT              │
└────┬─────────────────────────┘
     │ 2. Valid session?
     ├─ YES ──────────────────┐
     │                        ▼
     │              ┌──────────────────┐
     │              │  Allow Access    │
     │              │  - Fetch data    │
     │              │  - Render page   │
     │              └──────────────────┘
     │
     └─ NO ───────────────────┐
                              ▼
                    ┌──────────────────┐
                    │  Redirect Login  │
                    │  ?callbackUrl=   │
                    └──────────────────┘
```

### Password Reset Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /api/auth/forgot-password
     │    { email }
     ▼
┌──────────────────────────────┐
│  Forgot Password Handler     │
│  - Find user                 │
│  - Generate token (crypto)   │
└────┬─────────────────────────┘
     │ 2. Store token
     ▼
┌──────────────────────────────┐
│  VerificationToken.create()  │
│  - token (hashed)            │
│  - expires (1 hour)          │
└────┬─────────────────────────┘
     │ 3. Send email
     ▼
┌──────────────────────────────┐
│  Email Service (Resend)      │
│  - Reset link with token     │
└────┬─────────────────────────┘
     │ 4. User clicks link
     ▼
┌──────────────────────────────┐
│  GET /reset-password?token=  │
│  - Validate token            │
│  - Show reset form           │
└────┬─────────────────────────┘
     │ 5. POST new password
     ▼
┌──────────────────────────────┐
│  Reset Password Handler      │
│  - Verify token              │
│  - Hash new password         │
│  - Update user               │
│  - Delete token              │
└────┬─────────────────────────┘
     │ 6. Success
     ▼
┌──────────────────────────────┐
│  Redirect to Login           │
└──────────────────────────────┘
```

---

## Payment Flow

### Checkout Process (Stripe Integration)

```
┌─────────────┐
│   Buyer     │
└──────┬──────┘
       │ 1. Select package & click "Order Now"
       ▼
┌──────────────────────────────┐
│  Checkout Page               │
│  - Display order summary     │
│  - Show pricing breakdown    │
│  - Collect requirements      │
└──────┬───────────────────────┘
       │ 2. Click "Proceed to Payment"
       ▼
┌──────────────────────────────┐
│  POST /api/checkout          │
│  {                           │
│    gigId,                    │
│    packageType,              │
│    requirements              │
│  }                           │
└──────┬───────────────────────┘
       │ 3. Create order & payment intent
       ▼
┌──────────────────────────────┐
│  Backend Processing          │
│  ┌────────────────────────┐  │
│  │ 1. Create Order        │  │
│  │    - status: PENDING   │  │
│  │    - payment: PENDING  │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 2. Calculate Fees      │  │
│  │    - Gig price         │  │
│  │    - Service fee (10%) │  │
│  │    - Total amount      │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 3. Stripe API          │  │
│  │    stripe.paymentIntents│ │
│  │    .create({           │  │
│  │      amount,           │  │
│  │      currency: 'usd'   │  │
│  │    })                  │  │
│  └────────────────────────┘  │
└──────┬───────────────────────┘
       │ 4. Return clientSecret
       ▼
┌──────────────────────────────┐
│  Stripe Elements             │
│  - Card input form           │
│  - Secure iframe             │
│  - PCI compliant             │
└──────┬───────────────────────┘
       │ 5. Submit payment
       ▼
┌──────────────────────────────┐
│  Stripe Payment Processing   │
│  - Validate card             │
│  - Charge amount             │
│  - 3D Secure (if needed)     │
└──────┬───────────────────────┘
       │ 6. Payment result
       ├─ SUCCESS ──────────────┐
       │                        ▼
       │              ┌──────────────────┐
       │              │  Webhook Trigger │
       │              │  payment_intent  │
       │              │  .succeeded      │
       │              └────┬─────────────┘
       │                   │
       │                   ▼
       │              ┌──────────────────┐
       │              │ Update Order     │
       │              │ - status: IN_    │
       │              │   PROGRESS       │
       │              │ - payment:       │
       │              │   COMPLETED      │
       │              └────┬─────────────┘
       │                   │
       │                   ▼
       │              ┌──────────────────┐
       │              │ Create Transaction│
       │              │ - type: PAYMENT  │
       │              │ - amount         │
       │              └────┬─────────────┘
       │                   │
       │                   ▼
       │              ┌──────────────────┐
       │              │ Send Notifications│
       │              │ - Email to buyer │
       │              │ - Email to seller│
       │              │ - In-app notify  │
       │              └────┬─────────────┘
       │                   │
       │                   ▼
       │              ┌──────────────────┐
       │              │ Create Conversation│
       │              │ - Buyer + Seller │
       │              └──────────────────┘
       │
       └─ FAILED ───────────────┐
                                ▼
                       ┌──────────────────┐
                       │ Update Order     │
                       │ - payment:       │
                       │   FAILED         │
                       │ - Show error     │
                       └──────────────────┘
```

### Webhook Verification

```
┌─────────────┐
│   Stripe    │
└──────┬──────┘
       │ 1. Event triggered
       │    (payment_intent.succeeded)
       ▼
┌──────────────────────────────┐
│  POST /api/webhooks/stripe   │
│  Headers:                    │
│  - stripe-signature          │
│  Body:                       │
│  - event data                │
└──────┬───────────────────────┘
       │ 2. Verify signature
       ▼
┌──────────────────────────────┐
│  Webhook Handler             │
│  stripe.webhooks             │
│    .constructEvent(          │
│      body,                   │
│      signature,              │
│      webhookSecret           │
│    )                         │
└──────┬───────────────────────┘
       │ 3. Valid signature?
       ├─ YES ──────────────────┐
       │                        ▼
       │              ┌──────────────────┐
       │              │ Process Event    │
       │              │ - Update order   │
       │              │ - Send emails    │
       │              │ - Create records │
       │              └──────────────────┘
       │
       └─ NO ───────────────────┐
                                ▼
                       ┌──────────────────┐
                       │ Return 400       │
                       │ Invalid signature│
                       └──────────────────┘
```

---

## Real-time Communication

### Pusher Integration Architecture

```
┌──────────────────────────────────────────────────────┐
│                   PUSHER CHANNELS                     │
│  - WebSocket connections                             │
│  - Global message distribution                       │
│  - Presence channels                                 │
└──────────────┬───────────────────────────────────────┘
               │
               ├─────────────────┬─────────────────┐
               │                 │                 │
        ┌──────▼──────┐   ┌─────▼─────┐   ┌──────▼──────┐
        │  Browser 1  │   │ Browser 2 │   │  Browser 3  │
        │  (Seller)   │   │  (Buyer)  │   │   (Admin)   │
        └─────────────┘   └───────────┘   └─────────────┘
```

### Message Send Flow

```
┌─────────────┐
│   Sender    │
└──────┬──────┘
       │ 1. Type message & click send
       ▼
┌──────────────────────────────┐
│  Client Component            │
│  - Optimistic UI update      │
│  - Show message immediately  │
└──────┬───────────────────────┘
       │ 2. POST /api/messages
       │    {
       │      conversationId,
       │      content,
       │      attachments
       │    }
       ▼
┌──────────────────────────────┐
│  API Route Handler           │
│  ┌────────────────────────┐  │
│  │ 1. Validate session    │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 2. Create message      │  │
│  │    prisma.message      │  │
│  │    .create()           │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 3. Update unread count │  │
│  │    for recipient       │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 4. Trigger Pusher      │  │
│  │    pusher.trigger(     │  │
│  │      channel,          │  │
│  │      'new-message',    │  │
│  │      messageData       │  │
│  │    )                   │  │
│  └────────────────────────┘  │
└──────┬───────────────────────┘
       │ 5. Broadcast to Pusher
       ▼
┌──────────────────────────────┐
│  Pusher Server               │
│  - Distribute to subscribers │
└──────┬───────────────────────┘
       │ 6. Push to all clients
       ├──────────┬──────────────┐
       ▼          ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Sender   │ │Recipient │ │  Other   │
│ (confirm)│ │ (receive)│ │ (ignore) │
└──────────┘ └──────────┘ └──────────┘
```

### Typing Indicator Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Start typing
       ▼
┌──────────────────────────────┐
│  Client (debounced)          │
│  - Wait 300ms                │
│  - Emit typing event         │
└──────┬───────────────────────┘
       │ 2. pusher.trigger(
       │      'typing-start'
       │    )
       ▼
┌──────────────────────────────┐
│  Pusher                      │
│  - Broadcast to channel      │
└──────┬───────────────────────┘
       │ 3. Notify recipient
       ▼
┌──────────────────────────────┐
│  Recipient Client            │
│  - Show "User is typing..."  │
│  - Auto-hide after 3s        │
└──────────────────────────────┘
```

### Notification System

```
┌──────────────────────────────┐
│  Event Occurs                │
│  - Order placed              │
│  - Message received          │
│  - Review submitted          │
└──────┬───────────────────────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       │             │             │             │
       ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Database │  │  Email   │  │  Pusher  │  │   SMS    │
│ Notification│ (Resend) │  │(Real-time)│ (Optional)│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
       │             │             │             │
       ▼             ▼             ▼             ▼
┌──────────────────────────────────────────────────────┐
│                    User Receives                      │
│  - In-app badge                                      │
│  - Email in inbox                                    │
│  - Real-time popup                                   │
│  - SMS (if enabled)                                  │
└──────────────────────────────────────────────────────┘
```

---

## File Upload Architecture

### Cloudinary Upload Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Select file(s)
       ▼
┌──────────────────────────────┐
│  Client Validation           │
│  - File type check           │
│  - Size limit (10MB)         │
│  - Image dimensions          │
└──────┬───────────────────────┘
       │ 2. Valid file
       ▼
┌──────────────────────────────┐
│  Create FormData             │
│  - Append file               │
│  - Append metadata           │
└──────┬───────────────────────┘
       │ 3. POST /api/upload
       ▼
┌──────────────────────────────┐
│  Upload API Handler          │
│  ┌────────────────────────┐  │
│  │ 1. Validate session    │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 2. Parse file          │  │
│  │    - Get buffer        │  │
│  │    - Validate again    │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 3. Upload to Cloudinary│  │
│  │    cloudinary.uploader │  │
│  │    .upload_stream()    │  │
│  └────────────────────────┘  │
└──────┬───────────────────────┘
       │ 4. Upload to cloud
       ▼
┌──────────────────────────────┐
│  Cloudinary Processing       │
│  - Store original            │
│  - Generate thumbnails       │
│  - Optimize (WebP)           │
│  - Create responsive sizes   │
└──────┬───────────────────────┘
       │ 5. Return URLs
       ▼
┌──────────────────────────────┐
│  API Response                │
│  {                           │
│    url: "https://...",       │
│    publicId: "...",          │
│    width: 1920,              │
│    height: 1080,             │
│    format: "jpg"             │
│  }                           │
└──────┬───────────────────────┘
       │ 6. Store URL in DB
       ▼
┌──────────────────────────────┐
│  Update Record               │
│  - Gig images                │
│  - User avatar               │
│  - Message attachment        │
│  - Deliverable file          │
└──────────────────────────────┘
```

### Image Optimization Strategy

```
Original Upload (2MB JPEG)
         │
         ▼
┌──────────────────────────────┐
│  Cloudinary Transformations  │
├──────────────────────────────┤
│  1. Thumbnail (150x150)      │
│     - WebP format            │
│     - Quality: 80            │
│     - Size: ~15KB            │
├──────────────────────────────┤
│  2. Small (400x300)          │
│     - WebP format            │
│     - Quality: 85            │
│     - Size: ~45KB            │
├──────────────────────────────┤
│  3. Medium (800x600)         │
│     - WebP format            │
│     - Quality: 85            │
│     - Size: ~120KB           │
├──────────────────────────────┤
│  4. Large (1920x1080)        │
│     - WebP format            │
│     - Quality: 90            │
│     - Size: ~280KB           │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Next.js Image Component     │
│  - Lazy loading              │
│  - Responsive srcset         │
│  - Blur placeholder          │
│  - Auto format detection     │
└──────────────────────────────┘
```

---

**[CHUNK 2 COMPLETE - Authentication, Payment, Real-time & File Upload Flows]**

Added comprehensive flow diagrams for:
- ✅ Authentication (registration, login, protected routes, password reset)
- ✅ Payment processing (Stripe checkout, webhook verification)
- ✅ Real-time communication (Pusher messaging, typing indicators, notifications)
- ✅ File upload (Cloudinary integration, image optimization)

**Next chunk will cover:**
- Security architecture
- Deployment architecture
- Performance considerations
- Monitoring & logging

Reply "continue" to proceed with the final chunk.

## Security Architecture

### Layered Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                       Example Request                        │
│             POST /api/orders (Create Order)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Network & Infrastructure (Vercel/Cloudflare)       │
│  - DDoS Protection                                          │
│  - SSL/TLS Termination (HTTPS only)                         │
│  - Geo-blocking (optional)                                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Application Middleware (middleware.ts)             │
│  - CSP Headers (XSS Protection)                             │
│  - CRS Headers (Cross-Origin Resource Sharing)              │
│  - Rate Limiting (100 req/min)                              │
│  - Host Header Validation                                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Authentication & Authorization (NextAuth)          │
│  - Session Validation (JWT verification)                    │
│  - CSRF Token Check (Double submit cookie)                  │
│  - RBAC Check (Is user authenticated? Is user a Buyer?)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: Input Validation (Zod Schemas)                     │
│  - Type Checking (String, Number, etc.)                     │
│  - Format Validation (Email, UUID, Min/Max length)          │
│  - Sanitization (Strip HTML tags if needed)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: Data Access (Prisma ORM)                           │
│  - Parameterized Queries (SQL Injection prevention)         │
│  - Relation Integrity Checks                                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 6: Database (PostgreSQL)                              │
│  - Encrypted Storage (At rest)                              │
│  - Access Control Lists (ACLs)                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Security Measures

1. **Authentication**
   - **Bcrypt**: Adaptive hashing for passwords (work factor 10).
   - **HttpOnly Cookies**: Prevents XSS attacks from stealing sessions.
   - **Secure Flag**: Cookies only sent over HTTPS.
   - **SameSite=Lax**: Prevents CSRF attacks.

2. **API Protection**
   - **Rate Limiting**: Token bucket algorithm per IP address.
   - **Request Size Limits**: Max 10MB for uploads, 1MB for JSON.
   - **Method Validation**: Strict HTTP verb checking.

3. **Data Protection**
   - **Environment Variables**: Secrets stored in `.env.local` / Vercel Vault.
   - **Least Privilege**: Database user only has CRUD permissions on specific tables.
   - **UUIDs**: Non-sequential IDs prevent resource enumeration attacks.

---

## Deployment Architecture

### CI/CD Pipeline (Vercel)

```
┌──────────────┐
│  Git Commit  │
│  (GitHub)    │
└──────┬───────┘
       │ 1. Push to main/PR
       ▼
┌──────────────────────────────┐
│  Vercel Build System         │
│  - Clone repository          │
│  - Install dependencies      │
└──────┬───────────────────────┘
       │ 2. npm install
       ▼
┌──────────────────────────────┐
│  Static Analysis & Tests     │
│  - TypeScript check (tsc)    │
│  - Linting (eslint)          │
│  - Unit Tests (Jest)         │
└──────┬───────────────────────┘
       │ 3. Validation passed?
       │    (Block deployment if failed)
       ▼
┌──────────────────────────────┐
│  Build Optimization          │
│  - Next.js Build             │
│  - Static Page Generation    │
│  - Image Optimization        │
│  - Route Map Generation      │
└──────┬───────────────────────┘
       │ 4. Build artifacts
       ▼
┌──────────────────────────────┐
│  Edge Deployment             │
│  - Distribute static assets  │
│  - Deploy API functions      │
│  - Update Edge Config        │
└──────────────────────────────┘
```

### Environment Configuration

| Environment | Database | Auth | Logs | Purpose |
|-------------|----------|------|------|---------|
| **Development** | SQLite/Local | LocalHost | Console | Feature building |
| **Preview** | Neon (Branch) | Preview URL | Vercel Logs | PR testing |
| **Production** | Neon (Main) | Custom Domain | Sentry/Datadog | Live traffic |

---

## Performance & Monitoring

### Optimization Strategy

1. **Server-Side Rendering (SSR)**
   - Initial page loads are pre-rendered HTML.
   - Reduces Time to First Contentful Paint (FCP).
   - Essential for Marketplace and Gig Details pages (SEO).

2. **Caching Layers**
   - **Browser Cache**: Static assets (images, fonts, JS) cached for 1 year.
   - **Request Memoization**: Deduplicates fetch requests in the current route render pass.
   - **Data Cache (Next.js)**: Persists data across requests (revalidated on-demand).

3. **Database Indexing**
   - Indexes on frequently queried fields: `sellerId`, `category`, `status`, `slug`.
   - Compound indexes for filtering: `[category, price, rating]`.

### Monitoring Stack

```
┌──────────────────────────────┐
│  Application (Next.js)       │
└──────┬──────────────┬────────┘
       │              │
       ▼              ▼
┌──────────────┐  ┌──────────────┐
│  Log Stream  │  │  Web Vitals  │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Sentry /    │  │  Vercel      │
│  LogRocket   │  │  Analytics   │
├──────────────┤  ├──────────────┤
│ - Error      │  │ - FCP, LCP   │
│   Tracking   │  │ - CLS, FID   │
│ - Stack      │  │ - Real User  │
│   Traces     │  │   Metrics    │
└──────────────┘  └──────────────┘
```

---

**[DOCUMENTATION COMPLETE]**

The System Architecture documentation is now fully complete, covering all aspects of the GigStream platform from high-level overviews to detailed security and deployment flows.
