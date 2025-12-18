# GigStream Performance Optimization Guide

## Performance Goals

- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.8s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

## 1. Image Optimization

### Next.js Image Component
Already implemented throughout the app:
```tsx
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

### Cloudinary Optimization
```typescript
// lib/cloudinary.ts
export function getOptimizedImageUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}) {
  const { width = 800, height = 600, quality = 80 } = options || {};
  
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},q_${quality},f_auto/${publicId}`;
}
```

### WebP Format
```typescript
// Automatic with Next.js Image component
// Cloudinary also auto-converts with f_auto parameter
```

## 2. Code Splitting

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Disable SSR if not needed
});

// Lazy load with named export
const AdminDashboard = dynamic(
  () => import('@/components/AdminDashboard').then(mod => mod.AdminDashboard),
  { loading: () => <LoadingSpinner /> }
);
```

### Route-based Code Splitting
Next.js automatically code-splits by route. No additional configuration needed.

## 3. Caching Strategy

### Redis Setup
```bash
npm install ioredis
```

```typescript
// lib/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCache(key: string, value: any, ttl = 3600) {
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### API Route Caching
```typescript
// app/api/gigs/route.ts
import { getCached, setCache } from '@/lib/redis';

export async function GET(req: Request) {
  const cacheKey = `gigs:${searchParams.toString()}`;
  
  // Try cache first
  const cached = await getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // Fetch from database
  const gigs = await prisma.gig.findMany({...});
  
  // Cache for 5 minutes
  await setCache(cacheKey, gigs, 300);
  
  return NextResponse.json(gigs);
}
```

### Static Generation
```tsx
// app/gig/[slug]/page.tsx
export async function generateStaticParams() {
  const gigs = await prisma.gig.findMany({
    select: { slug: true },
    where: { status: 'ACTIVE' },
  });
  
  return gigs.map((gig) => ({
    slug: gig.slug,
  }));
}

export const revalidate = 3600; // Revalidate every hour
```

## 4. Database Optimization

### Indexing
Already implemented in Prisma schema:
```prisma
model Gig {
  // ...
  @@index([sellerId])
  @@index([slug])
  @@index([category])
  @@index([status])
}
```

### Query Optimization
```typescript
// Use select to fetch only needed fields
const gigs = await prisma.gig.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    price: true,
    images: true,
    seller: {
      select: {
        id: true,
        fullName: true,
        avatar: true,
      },
    },
  },
});

// Use pagination
const gigs = await prisma.gig.findMany({
  skip: (page - 1) * limit,
  take: limit,
});

// Use cursor-based pagination for large datasets
const gigs = await prisma.gig.findMany({
  take: 20,
  cursor: lastId ? { id: lastId } : undefined,
  skip: lastId ? 1 : 0,
});
```

### Connection Pooling
```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## 5. Bundle Size Optimization

### Analyze Bundle
```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... other config
});
```

Run analysis:
```bash
ANALYZE=true npm run build
```

### Tree Shaking
```typescript
// Import only what you need
import { formatCurrency } from '@/lib/utils';
// Instead of: import * as utils from '@/lib/utils';

// Use named imports from libraries
import { useState, useEffect } from 'react';
// Instead of: import React from 'react';
```

### Remove Unused Dependencies
```bash
npm install -g depcheck
depcheck
```

## 6. Font Optimization

### Next.js Font Optimization
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Preload Critical Fonts
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 7. API Optimization

### Response Compression
Vercel automatically compresses responses. For custom servers:
```bash
npm install compression
```

### Pagination
```typescript
// Implement cursor-based pagination for better performance
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = 20;
  
  const gigs = await prisma.gig.findMany({
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });
  
  const hasMore = gigs.length > limit;
  const items = hasMore ? gigs.slice(0, -1) : gigs;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  
  return NextResponse.json({
    items,
    nextCursor,
    hasMore,
  });
}
```

### Field Selection
```typescript
// Allow clients to specify which fields they need
const fields = searchParams.get('fields')?.split(',');
const select = fields?.reduce((acc, field) => ({ ...acc, [field]: true }), {});

const data = await prisma.gig.findMany({
  select: select || undefined,
});
```

## 8. Client-Side Performance

### Debouncing
```typescript
// lib/utils.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage in search
const debouncedSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);
```

### Virtualization for Long Lists
```bash
npm install react-window
```

```tsx
import { FixedSizeList } from 'react-window';

function GigList({ gigs }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <GigCard gig={gigs[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={gigs.length}
      itemSize={300}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Memoization
```tsx
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const GigCard = memo(function GigCard({ gig }) {
  // Component code
});

// Memoize expensive calculations
function GigList({ gigs, filters }) {
  const filteredGigs = useMemo(() => {
    return gigs.filter(gig => matchesFilters(gig, filters));
  }, [gigs, filters]);
  
  const handleClick = useCallback((id) => {
    // Handle click
  }, []);
  
  return <div>{/* Render */}</div>;
}
```

## 9. CDN Configuration

### Vercel Edge Network
Automatic with Vercel deployment. Assets are automatically distributed globally.

### Custom CDN (Cloudflare)
```javascript
// next.config.ts
module.exports = {
  images: {
    domains: ['cdn.gigstream.com'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.gigstream.com' 
    : '',
};
```

## 10. Monitoring & Analytics

### Web Vitals
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Web Vitals Reporting
```typescript
// app/layout.tsx
export function reportWebVitals(metric) {
  // Send to analytics
  if (metric.label === 'web-vital') {
    console.log(metric);
    // Send to your analytics service
  }
}
```

### Lighthouse CI
```bash
npm install -D @lhci/cli

# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

## 11. Performance Checklist

### Pre-Launch
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on slow 3G network
- [ ] Test on low-end devices
- [ ] Optimize images (WebP, lazy loading)
- [ ] Enable compression
- [ ] Implement caching strategy
- [ ] Code splitting configured
- [ ] Bundle size analyzed
- [ ] Database queries optimized
- [ ] CDN configured
- [ ] Monitoring setup

### Post-Launch
- [ ] Monitor Core Web Vitals
- [ ] Track page load times
- [ ] Monitor API response times
- [ ] Review slow queries
- [ ] Optimize based on real user data
- [ ] A/B test performance improvements

## 12. Performance Budget

Set and enforce performance budgets:

```javascript
// next.config.ts
module.exports = {
  experimental: {
    performanceBudget: {
      maxInitialLoadTime: 3000,
      maxRouteLoadTime: 2000,
    },
  },
};
```

## 13. Quick Wins

1. **Enable compression** (automatic on Vercel)
2. **Use Next.js Image component** (✅ Done)
3. **Lazy load images** (✅ Done)
4. **Code split heavy components** (✅ Partially done)
5. **Cache API responses** (⏳ To implement)
6. **Optimize database queries** (✅ Done)
7. **Use CDN for static assets** (✅ Vercel Edge)
8. **Minimize JavaScript bundle** (⏳ To optimize)
9. **Preload critical resources**
10. **Remove unused dependencies**

## 14. Tools

- **Lighthouse**: Performance auditing
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools**: Performance profiling
- **Vercel Analytics**: Real user monitoring
- **Bundle Analyzer**: Bundle size analysis
- **React DevTools Profiler**: Component performance

## Next Steps

1. ✅ Implement Redis caching
2. ✅ Add dynamic imports for heavy components
3. ✅ Set up performance monitoring
4. ✅ Run Lighthouse CI in pipeline
5. ✅ Optimize bundle size
6. ✅ Implement virtualization for long lists
7. ✅ Add service worker for offline support
