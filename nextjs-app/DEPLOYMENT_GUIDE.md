# 🚀 GigStream - Complete Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Third-Party Services](#third-party-services)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All tests passing (`npm run test:all`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Production build successful (`npm run build`)
- [ ] Bundle size optimized (< 200KB gzipped)

### ✅ Security
- [ ] All environment variables secured
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] No sensitive data in code
- [ ] Dependencies audited (`npm audit`)

### ✅ Performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] Caching strategy defined
- [ ] Database queries optimized

---

## Environment Setup

### 1. Create Production Environment Variables

Copy `env.template` and create production values:

```bash
# Required Variables
DATABASE_URL=postgresql://user:pass@host:5432/gigstream
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://yourdomain.com

# Stripe (Production Keys)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Pusher
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Resend
RESEND_API_KEY=re_...

# Redis (Upstash recommended)
REDIS_URL=redis://user:pass@host:port

# Sentry
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# PayPal (Production)
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live
```

### 2. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CSRF_SECRET
openssl rand -base64 32
```

---

## Database Setup

### Option 1: Supabase (Recommended)

1. **Create Project**
   ```bash
   # Go to https://supabase.com
   # Create new project
   # Copy connection string
   ```

2. **Configure Database**
   ```bash
   # Update DATABASE_URL in Vercel
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   ```

3. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Seed Data (Optional)**
   ```bash
   npm run prisma:seed
   ```

### Option 2: PlanetScale

1. **Create Database**
   ```bash
   pscale database create gigstream --region us-east
   ```

2. **Create Branch**
   ```bash
   pscale branch create gigstream main
   ```

3. **Get Connection String**
   ```bash
   pscale connect gigstream main
   ```

### Option 3: Neon

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
cd /path/to/gigstream
vercel link
```

### 4. Set Environment Variables

```bash
# Set all production environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
# ... add all other variables
```

Or use Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add all variables from `env.template`
3. Set environment to "Production"

### 5. Deploy

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

### 6. Configure Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. Wait for SSL certificate (automatic)

---

## Third-Party Services

### Stripe Setup

1. **Create Account**: https://stripe.com
2. **Get API Keys**: Dashboard > Developers > API keys
3. **Configure Webhooks**:
   ```
   Endpoint URL: https://yourdomain.com/api/webhooks/stripe
   Events to send:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - checkout.session.completed
   ```
4. **Copy Webhook Secret** to `STRIPE_WEBHOOK_SECRET`

### Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. Copy Client ID and Secret

### Cloudinary Setup

1. Create account: https://cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret
4. Configure upload presets (optional)

### Pusher Setup

1. Create account: https://pusher.com
2. Create new app
3. Copy App ID, Key, Secret, Cluster
4. Enable client events (optional)

### Resend Setup

1. Create account: https://resend.com
2. Verify domain
3. Create API key
4. Add to environment variables

### Redis (Upstash) Setup

1. Create account: https://upstash.com
2. Create Redis database
3. Copy connection URL
4. Add to `REDIS_URL`

### Sentry Setup

1. Create account: https://sentry.io
2. Create new project (Next.js)
3. Copy DSN
4. Run Sentry wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check if site is live
curl -I https://yourdomain.com

# Check API endpoints
curl https://yourdomain.com/api/health
```

### 2. Test Critical Flows

- [ ] User registration
- [ ] User login
- [ ] Gig creation
- [ ] Order placement
- [ ] Payment processing
- [ ] Messaging
- [ ] File uploads

### 3. Configure DNS

Update your domain's nameservers or add A/CNAME records

### 4. Set up SSL

Vercel handles this automatically, but verify:
- [ ] HTTPS enabled
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid

### 5. Enable Monitoring

- [ ] Sentry error tracking active
- [ ] Vercel Analytics enabled
- [ ] Google Analytics configured
- [ ] Uptime monitoring (UptimeRobot, etc.)

---

## Monitoring & Maintenance

### Monitoring Tools

1. **Vercel Analytics**
   - Go to Project > Analytics
   - Monitor Core Web Vitals
   - Track visitor metrics

2. **Sentry**
   - Monitor errors in real-time
   - Set up alerts for critical issues
   - Review performance metrics

3. **Database Monitoring**
   - Supabase: Built-in monitoring
   - PlanetScale: Insights dashboard
   - Set up query performance alerts

4. **Uptime Monitoring**
   ```bash
   # Recommended: UptimeRobot
   # Monitor: https://yourdomain.com
   # Check interval: 5 minutes
   ```

### Regular Maintenance

#### Daily
- [ ] Check error logs in Sentry
- [ ] Monitor uptime status
- [ ] Review user feedback

#### Weekly
- [ ] Review performance metrics
- [ ] Check database performance
- [ ] Update dependencies (if needed)
- [ ] Backup database

#### Monthly
- [ ] Security audit (`npm audit`)
- [ ] Performance optimization review
- [ ] Cost analysis (Vercel, Supabase, etc.)
- [ ] User analytics review

---

## Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

```bash
# Test connection
npx prisma db push

# Reset database (CAUTION: Deletes data)
npx prisma migrate reset
```

### Environment Variable Issues

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

### Performance Issues

1. Check bundle size:
   ```bash
   npm run analyze
   ```

2. Review Vercel logs:
   ```bash
   vercel logs
   ```

3. Check database query performance

### SSL/HTTPS Issues

1. Verify domain configuration
2. Check DNS propagation: https://dnschecker.org
3. Force HTTPS redirect in `next.config.ts`

---

## Rollback Procedure

### Quick Rollback

```bash
# Rollback to previous deployment
vercel rollback
```

### Manual Rollback

1. Go to Vercel Dashboard
2. Select Deployments
3. Find previous working deployment
4. Click "Promote to Production"

---

## CI/CD Pipeline

The project includes GitHub Actions for automated deployment:

### Workflow Triggers
- Push to `main` → Deploy to production
- Pull request → Deploy preview
- Push to `develop` → Deploy to staging

### Manual Deployment

```bash
# Deploy specific branch
vercel --prod --branch=main
```

---

## Performance Optimization

### After Deployment

1. **Enable Caching**
   - Redis for session data
   - CDN for static assets
   - Database query caching

2. **Monitor Core Web Vitals**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

3. **Optimize Images**
   - Use Next.js Image component
   - Cloudinary auto-optimization
   - WebP format

4. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based splitting (automatic)

---

## Security Checklist

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CSRF protection enabled
- [ ] Rate limiting active
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection
- [ ] Secrets not in code
- [ ] Dependencies up to date
- [ ] Regular security audits

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Stripe Docs**: https://stripe.com/docs

---

**Last Updated**: 2025-12-19  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
