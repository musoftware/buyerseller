# GigStream Deployment Guide

This guide covers deploying GigStream to production using various platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Vercel Deployment](#vercel-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 20+ installed
- [ ] Git repository set up
- [ ] All required API keys and credentials
- [ ] Database instance ready
- [ ] Domain name (optional)

---

## Environment Variables

### Required Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Resend)
RESEND_API_KEY="re_..."

# Pusher
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="us2"
```

### Optional Variables

```bash
# PayPal
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
PAYPAL_MODE="live"

# VirusTotal
VIRUSTOTAL_API_KEY="your-api-key"

# Sentry
SENTRY_DSN="https://...@sentry.io/..."

# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

---

## Vercel Deployment

### Method 1: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Preview deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Redeploy

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Docker Deployment

### Build and Run Locally

```bash
# Build image
docker build -t gigstream .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  gigstream
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Deploy to Cloud

#### AWS ECS

1. **Push to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   docker tag gigstream:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/gigstream:latest
   
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/gigstream:latest
   ```

2. **Create ECS Task Definition**
3. **Create ECS Service**
4. **Configure Load Balancer**

#### Google Cloud Run

```bash
# Build and deploy
gcloud run deploy gigstream \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Database Setup

### PostgreSQL (Recommended)

#### Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

#### PlanetScale

1. Create database at [planetscale.com](https://planetscale.com)
2. Get connection string
3. Run migrations:
   ```bash
   npx prisma db push
   ```

#### Neon

1. Create project at [neon.tech](https://neon.tech)
2. Get connection string
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Redis (Optional)

#### Upstash

1. Create database at [upstash.com](https://upstash.com)
2. Get REST URL and token
3. Add to environment variables

---

## Post-Deployment

### 1. Database Seeding

```bash
npm run prisma:seed
```

### 2. Verify Deployment

- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] Payment processing works
- [ ] File uploads work
- [ ] Real-time messaging works
- [ ] Email notifications work

### 3. Configure Webhooks

#### Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

#### PayPal Webhooks (if using)

1. Go to PayPal Developer Dashboard
2. Add webhook: `https://yourdomain.com/api/webhooks/paypal`
3. Select events

### 4. Configure DNS

Point your domain to Vercel:

```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

### 5. SSL Certificate

Vercel automatically provisions SSL certificates. For custom domains:

1. Add domain in Vercel dashboard
2. Configure DNS records
3. Wait for SSL provisioning (automatic)

---

## Monitoring

### Vercel Analytics

Automatically enabled on Vercel. View at:
- Dashboard → Your Project → Analytics

### Sentry Error Tracking

1. Create project at [sentry.io](https://sentry.io)
2. Add DSN to environment variables
3. Errors automatically tracked

### Custom Monitoring

Add monitoring endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with module not found

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Database Connection Issues

**Issue**: Cannot connect to database

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from deployment platform
3. Verify SSL mode if required:
   ```
   DATABASE_URL="postgresql://...?sslmode=require"
   ```

### Environment Variables Not Working

**Issue**: Environment variables undefined

**Solution**:
1. Ensure variables are set in Vercel dashboard
2. Redeploy after adding variables
3. Check variable names (case-sensitive)
4. Client-side variables must start with `NEXT_PUBLIC_`

### Slow Performance

**Issue**: Application is slow

**Solution**:
1. Enable caching:
   ```typescript
   export const revalidate = 3600 // 1 hour
   ```
2. Optimize images
3. Enable CDN
4. Use Redis for caching

### Payment Webhooks Not Working

**Issue**: Stripe/PayPal webhooks failing

**Solution**:
1. Verify webhook URL is correct
2. Check webhook secret matches
3. Ensure endpoint is publicly accessible
4. Check webhook logs in provider dashboard

---

## Performance Optimization

### 1. Enable Caching

```typescript
// app/layout.tsx
export const revalidate = 3600 // Revalidate every hour
```

### 2. Image Optimization

Already configured in `next.config.js`:
- AVIF/WebP formats
- Responsive sizes
- Cloudinary CDN

### 3. Code Splitting

Automatic with Next.js App Router

### 4. Database Optimization

```typescript
// Use connection pooling
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Security Checklist

Before going live:

- [ ] All environment variables are secure
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] CSRF protection is active
- [ ] Input validation is implemented
- [ ] File upload scanning is enabled
- [ ] Database backups are configured
- [ ] Error messages don't leak sensitive info
- [ ] Admin routes are protected

---

## Scaling

### Horizontal Scaling

Vercel automatically scales based on traffic.

### Database Scaling

- Use connection pooling
- Enable read replicas
- Implement caching layer (Redis)

### CDN

- Cloudinary for images/videos
- Vercel Edge Network for static assets

---

## Backup Strategy

### Database Backups

#### Automated (Supabase)
- Daily automatic backups
- Point-in-time recovery

#### Manual
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### File Backups

Cloudinary automatically backs up all uploads.

---

## Rollback Procedure

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Docker

```bash
# Revert to previous image
docker pull gigstream:previous-tag
docker-compose up -d
```

---

## Support

For issues:
- Check [GitHub Issues](https://github.com/yourusername/gigstream/issues)
- Review logs in Vercel dashboard
- Check Sentry for errors
- Contact support@gigstream.com

---

## Next Steps

After deployment:
1. Monitor error rates
2. Check performance metrics
3. Gather user feedback
4. Plan feature updates
5. Regular security audits

---

**Congratulations! Your GigStream platform is now live! 🎉**
