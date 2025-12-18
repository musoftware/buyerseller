# GigStream Testing Guide

## Testing Strategy

This document outlines the testing approach for the GigStream platform.

## Test Types

### 1. Unit Tests
Test individual components and functions in isolation.

**Tools:**
- Jest
- React Testing Library

**Setup:**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

**Configuration:** Create `jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Example Unit Test:**
```typescript
// __tests__/components/GigCard.test.tsx
import { render, screen } from '@testing-library/react';
import GigCard from '@/components/GigCard';

describe('GigCard', () => {
  const mockGig = {
    id: '1',
    title: 'Test Gig',
    slug: 'test-gig',
    price: 50,
    rating: 4.5,
    totalReviews: 10,
    // ... other required fields
  };

  it('renders gig title', () => {
    render(<GigCard gig={mockGig} />);
    expect(screen.getByText('Test Gig')).toBeInTheDocument();
  });

  it('displays correct price', () => {
    render(<GigCard gig={mockGig} />);
    expect(screen.getByText('$50')).toBeInTheDocument();
  });
});
```

### 2. Integration Tests
Test how different parts of the application work together.

**Example:**
```typescript
// __tests__/api/favorites.test.ts
import { POST, DELETE } from '@/app/api/favorites/route';

describe('Favorites API', () => {
  it('adds gig to favorites', async () => {
    // Mock session
    // Make request
    // Verify response
  });

  it('removes gig from favorites', async () => {
    // Test implementation
  });
});
```

### 3. End-to-End Tests
Test complete user workflows.

**Tools:**
- Playwright

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration:** Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Example E2E Test:**
```typescript
// e2e/marketplace.spec.ts
import { test, expect } from '@playwright/test';

test('user can browse and filter gigs', async ({ page }) => {
  await page.goto('/marketplace');
  
  // Check page loads
  await expect(page.locator('h1')).toContainText('Find the perfect service');
  
  // Filter by category
  await page.click('text=Design & Creative');
  await expect(page.url()).toContain('category=Design');
  
  // Search
  await page.fill('input[name="q"]', 'logo design');
  await page.click('button:has-text("Search")');
  await expect(page.url()).toContain('q=logo');
});

test('user can favorite a gig', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Go to marketplace
  await page.goto('/marketplace');
  
  // Click favorite button
  await page.click('.gig-card:first-child button:has(svg.lucide-heart)');
  
  // Verify favorited
  await expect(page.locator('.gig-card:first-child svg.lucide-heart')).toHaveClass(/fill-red-500/);
});
```

## Test Coverage Goals

- **Unit Tests:** 80%+ coverage for utilities and components
- **Integration Tests:** All API routes
- **E2E Tests:** Critical user paths

## Critical Paths to Test

### User Flows
1. **Registration & Login**
   - Sign up with email
   - Login with credentials
   - Password reset flow
   - Social login (if implemented)

2. **Browsing & Search**
   - View marketplace
   - Filter by category
   - Search gigs
   - Sort results
   - View gig details

3. **Ordering**
   - Select package
   - Checkout process
   - Payment completion
   - Order confirmation

4. **Seller Workflow**
   - Create gig
   - Receive order
   - Deliver work
   - Handle revisions

5. **Buyer Workflow**
   - Place order
   - Communicate with seller
   - Receive delivery
   - Submit review

6. **Messaging**
   - Send message
   - Receive message
   - File attachments

7. **Reviews**
   - Submit review
   - View reviews
   - Seller response

8. **Admin**
   - View dashboard
   - Moderate content
   - Manage users
   - Handle disputes

## Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# E2E tests
npx playwright test

# E2E with UI
npx playwright test --ui

# Specific test file
npx playwright test e2e/marketplace.spec.ts
```

## Continuous Integration

Add to `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

## Best Practices

1. **Write tests first** (TDD) for critical features
2. **Mock external services** (Stripe, email, etc.)
3. **Use test databases** separate from development
4. **Clean up test data** after each test
5. **Test error cases** not just happy paths
6. **Keep tests fast** and independent
7. **Use descriptive test names**
8. **Avoid testing implementation details**

## Performance Testing

Use Lighthouse CI for performance monitoring:

```bash
npm install -D @lhci/cli

# Run Lighthouse
lhci autorun
```

## Security Testing

1. **OWASP ZAP** for vulnerability scanning
2. **npm audit** for dependency vulnerabilities
3. **Snyk** for continuous security monitoring

```bash
npm audit
npm audit fix
```

## Load Testing

Use k6 for load testing:

```bash
# Install k6
brew install k6

# Create test script
# k6-load-test.js

# Run test
k6 run k6-load-test.js
```

## Monitoring in Production

1. **Sentry** for error tracking
2. **LogRocket** for session replay
3. **Vercel Analytics** for performance
4. **Uptime monitoring** (UptimeRobot, Pingdom)

## Next Steps

1. ✅ Set up Jest and React Testing Library
2. ✅ Write unit tests for utilities
3. ✅ Write component tests
4. ✅ Set up Playwright
5. ✅ Write E2E tests for critical paths
6. ✅ Add CI/CD pipeline
7. ✅ Set up error tracking
8. ✅ Configure performance monitoring
