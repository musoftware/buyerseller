import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
    test('should complete registration successfully', async ({ page }) => {
        // Navigate to registration page
        await page.goto('/register');

        // Wait for page to load
        await expect(page.locator('h1')).toContainText('Create Account');

        // Fill in registration form
        const timestamp = Date.now();
        await page.fill('input[name="fullName"]', 'Test User');
        await page.fill('input[name="username"]', `testuser${timestamp}`);
        await page.fill('input[name="email"]', `test${timestamp}@example.com`);
        await page.fill('input[name="password"]', 'TestPassword123');

        // Select role
        await page.click('text=I want to sell services');

        // Submit form
        await page.click('button[type="submit"]');

        // Should redirect to dashboard or show success message
        await expect(page).toHaveURL(/\/(dashboard|login)/);
    });

    test('should show validation errors for invalid input', async ({ page }) => {
        await page.goto('/register');

        // Try to submit empty form
        await page.click('button[type="submit"]');

        // Should show validation errors
        await expect(page.locator('text=/required/i')).toBeVisible();
    });

    test('should reject weak passwords', async ({ page }) => {
        await page.goto('/register');

        await page.fill('input[name="fullName"]', 'Test User');
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'weak'); // Weak password

        await page.click('button[type="submit"]');

        // Should show password strength error
        await expect(page.locator('text=/password/i')).toBeVisible();
    });
});

test.describe('User Login Flow', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
        await page.goto('/login');

        await expect(page.locator('h1')).toContainText('Sign In');

        // Use test credentials (assuming seed data exists)
        await page.fill('input[name="email"]', 'buyer@test.com');
        await page.fill('input[name="password"]', 'password123');

        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');

        await page.click('button[type="submit"]');

        // Should show error message
        await expect(page.locator('text=/invalid|incorrect/i')).toBeVisible();
    });
});

test.describe('Gig Creation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login as seller first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'seller@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/);
    });

    test('should create a gig successfully', async ({ page }) => {
        await page.goto('/create-gig');

        // Fill in gig details
        await page.fill('input[name="title"]', 'I will create a professional website');
        await page.fill('textarea[name="description"]', 'I will create a stunning, responsive website for your business with modern design and best practices.');

        // Select category
        await page.click('select[name="category"]');
        await page.selectOption('select[name="category"]', 'Web Development');

        // Add tags
        await page.fill('input[name="tags"]', 'website, web design, responsive');

        // Fill package details
        await page.fill('input[name="basicPrice"]', '50');
        await page.fill('input[name="basicDeliveryDays"]', '3');
        await page.fill('textarea[name="basicDescription"]', 'Basic website with 3 pages');

        // Add requirements
        await page.fill('input[name="requirements"]', 'Website content and images');

        // Submit
        await page.click('button[type="submit"]');

        // Should show success or redirect
        await expect(page).toHaveURL(/\/(dashboard|gig)/);
    });
});

test.describe('Order Placement Flow', () => {
    test('should complete order placement', async ({ page }) => {
        // Login as buyer
        await page.goto('/login');
        await page.fill('input[name="email"]', 'buyer@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Browse marketplace
        await page.goto('/marketplace');

        // Click on first gig
        await page.click('.gig-card >> nth=0');

        // Select package
        await page.click('text=Basic');

        // Click order button
        await page.click('button:has-text("Order Now")');

        // Should redirect to checkout
        await expect(page).toHaveURL(/\/checkout/);

        // Fill in requirements if needed
        await page.fill('textarea[name="requirements"]', 'Please use blue color scheme');

        // Proceed to payment
        await page.click('button:has-text("Continue to Payment")');

        // Should show Stripe payment form or success
        await expect(page.locator('text=/payment|stripe/i')).toBeVisible();
    });
});

test.describe('Messaging Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'buyer@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
    });

    test('should send a message', async ({ page }) => {
        await page.goto('/messages');

        // Click on a conversation or start new one
        await page.click('.conversation-item >> nth=0');

        // Type message
        const messageText = `Test message ${Date.now()}`;
        await page.fill('textarea[name="message"]', messageText);

        // Send
        await page.click('button:has-text("Send")');

        // Should appear in conversation
        await expect(page.locator(`text=${messageText}`)).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/');

        // Check mobile menu
        await page.click('button[aria-label="Menu"]');
        await expect(page.locator('nav')).toBeVisible();

        // Navigate to marketplace
        await page.click('text=Marketplace');
        await expect(page).toHaveURL(/\/marketplace/);

        // Gigs should be displayed in single column
        const gigCards = page.locator('.gig-card');
        await expect(gigCards.first()).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });

        await page.goto('/marketplace');

        // Should show grid layout
        const gigCards = page.locator('.gig-card');
        await expect(gigCards).toHaveCount(await gigCards.count());
    });
});

test.describe('Performance', () => {
    test('should load homepage quickly', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        const loadTime = Date.now() - startTime;

        // Should load in under 3 seconds
        expect(loadTime).toBeLessThan(3000);
    });

    test('should have good Core Web Vitals', async ({ page }) => {
        await page.goto('/');

        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');

        // Check if images are optimized (using next/image)
        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
            const img = images.nth(i);
            const loading = await img.getAttribute('loading');
            // Next.js images should have lazy loading
            expect(loading).toBeTruthy();
        }
    });
});
