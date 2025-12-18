# GigStream Security Guide

## Security Best Practices

This document outlines security measures implemented and recommended for the GigStream platform.

## 1. Authentication & Authorization

### Implemented
- ✅ NextAuth.js for authentication
- ✅ Secure password hashing with bcrypt
- ✅ Session-based authentication
- ✅ Role-based access control (BUYER, SELLER, ADMIN)
- ✅ Protected API routes
- ✅ Server-side session validation

### Recommendations
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Session timeout after inactivity
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts
- [ ] Email verification for new accounts

### Implementation Example
```typescript
// lib/auth.ts - Password validation
export function validatePassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
}
```

## 2. Data Protection

### Database Security
- ✅ Parameterized queries (Prisma ORM)
- ✅ SQL injection prevention
- ✅ Environment variables for credentials
- [ ] Database encryption at rest
- [ ] Regular database backups
- [ ] Separate read/write replicas

### Sensitive Data
- ✅ Password hashing (bcrypt)
- ✅ Secure token generation (crypto)
- [ ] PII encryption
- [ ] Credit card data via Stripe (PCI compliant)
- [ ] GDPR compliance measures

## 3. API Security

### Rate Limiting
Implemented in `middleware.ts`:
```typescript
// Rate limiting configuration
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};
```

### Input Validation
- ✅ Zod schema validation
- ✅ Type checking with TypeScript
- ✅ Sanitization of user inputs

Example:
```typescript
import { z } from 'zod';

const gigSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(5000),
  price: z.number().positive().max(10000),
  category: z.enum(['Design', 'Development', 'Writing']),
});
```

### CORS Configuration
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

## 4. XSS Protection

### Content Security Policy
Add to `next.config.ts`:
```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

### Sanitization
```bash
npm install dompurify isomorphic-dompurify
```

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}
```

## 5. CSRF Protection

### Implementation
```typescript
// lib/csrf.ts
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}
```

### Usage in Forms
```tsx
<form>
  <input type="hidden" name="csrf_token" value={csrfToken} />
  {/* other fields */}
</form>
```

## 6. File Upload Security

### Validation
```typescript
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): boolean {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  return true;
}
```

### Virus Scanning
```bash
npm install clamav.js
```

## 7. Payment Security

### Stripe Integration
- ✅ Server-side payment processing
- ✅ Webhook signature verification
- ✅ No card data stored locally
- ✅ PCI DSS compliance via Stripe

```typescript
// Verify Stripe webhook
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Process event
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }
}
```

## 8. Logging & Monitoring

### Error Tracking
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Audit Logging
```typescript
// Log sensitive actions
export async function logAuditEvent(event: {
  userId: string;
  action: string;
  resource: string;
  metadata?: any;
}) {
  await prisma.auditLog.create({
    data: {
      ...event,
      timestamp: new Date(),
      ipAddress: req.headers.get('x-forwarded-for'),
    },
  });
}
```

## 9. Dependency Security

### Regular Audits
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Use Snyk for continuous monitoring
npm install -g snyk
snyk test
snyk monitor
```

### Dependabot
Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

## 10. Environment Variables

### Security
- ✅ Never commit `.env` files
- ✅ Use different keys for dev/prod
- ✅ Rotate secrets regularly
- [ ] Use secret management service (AWS Secrets Manager, Vault)

### Required Variables
```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=

# File Upload
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 11. HTTPS & SSL

### Production Requirements
- ✅ Force HTTPS
- ✅ HSTS headers
- ✅ Valid SSL certificate
- [ ] Certificate auto-renewal

### Vercel Configuration
Vercel automatically provides:
- Free SSL certificates
- Automatic HTTPS redirect
- HTTP/2 support

## 12. Security Checklist

### Pre-Launch
- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] All dependencies updated
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] CSP headers added
- [ ] Error messages don't leak info
- [ ] Admin routes protected
- [ ] File upload restrictions
- [ ] SQL injection tests passed
- [ ] XSS protection verified
- [ ] CSRF protection enabled
- [ ] Session management secure
- [ ] Password policy enforced

### Post-Launch
- [ ] Monitor error logs daily
- [ ] Review access logs weekly
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Backup verification monthly
- [ ] Incident response plan ready
- [ ] Bug bounty program (optional)

## 13. Incident Response

### Steps
1. **Detect**: Monitor for security events
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix vulnerabilities
5. **Recover**: Restore normal operations
6. **Review**: Post-mortem analysis

### Contact Information
- Security Team: security@gigstream.com
- Emergency Hotline: [PHONE]
- Incident Report: [URL]

## 14. Compliance

### GDPR
- [ ] Privacy policy
- [ ] Cookie consent
- [ ] Data export functionality
- [ ] Right to deletion
- [ ] Data processing agreements

### CCPA
- [ ] Do not sell my data option
- [ ] Privacy notice
- [ ] Data access requests

## 15. Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Stripe Security](https://stripe.com/docs/security)
- [Vercel Security](https://vercel.com/docs/security)

## Regular Security Tasks

### Daily
- Monitor error logs
- Check failed login attempts

### Weekly
- Review access logs
- Check for new CVEs

### Monthly
- Update dependencies
- Review user permissions
- Backup verification

### Quarterly
- Security audit
- Penetration testing
- Policy review
