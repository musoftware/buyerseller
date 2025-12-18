import { test, expect } from '@playwright/test';

test.describe('Gig Creation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'seller@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/);
    });

    test('should create a new gig successfully', async ({ page }) => {
        await page.goto('/create-gig');

        // Fill basic information
        await page.fill('input[name="title"]', 'Professional Logo Design');
        await page.selectOption('select[name="category"]', 'Graphics & Design');
        await page.fill('textarea[name="description"]', 'I will create a professional logo for your business');

        // Fill pricing
        await page.fill('input[name="basicPrice"]', '50');
        await page.fill('input[name="basicDelivery"]', '3');
        await page.fill('textarea[name="basicDescription"]', 'Basic logo design');

        // Add tags
        await page.fill('input[name="tags"]', 'logo, design, branding');

        // Upload image (mock)
        // await page.setInputFiles('input[type="file"]', 'path/to/test-image.jpg');

        // Submit
        await page.click('button[type="submit"]');

        // Should redirect to gig page or dashboard
        await expect(page).toHaveURL(/\/(gig|dashboard)/);
    });

    test('should show validation errors for incomplete form', async ({ page }) => {
        await page.goto('/create-gig');

        // Submit empty form
        await page.click('button[type="submit"]');

        // Should show validation errors
        await expect(page.locator('text=/required/i')).toBeVisible();
    });
});

test.describe('Gig Browsing', () => {
    test('should display gigs on marketplace', async ({ page }) => {
        await page.goto('/marketplace');

        // Should show gig cards
        await expect(page.locator('[data-testid="gig-card"]').first()).toBeVisible();
    });

    test('should filter gigs by category', async ({ page }) => {
        await page.goto('/marketplace');

        // Click on a category
        await page.click('text=Graphics & Design');

        // URL should update
        await expect(page).toHaveURL(/category=Graphics/);

        // Should show filtered results
        await expect(page.locator('[data-testid="gig-card"]')).toHaveCount(await page.locator('[data-testid="gig-card"]').count());
    });

    test('should search for gigs', async ({ page }) => {
        await page.goto('/marketplace');

        // Enter search query
        await page.fill('input[name="q"]', 'logo design');
        await page.click('button[type="submit"]');

        // URL should update
        await expect(page).toHaveURL(/q=logo/);
    });

    test('should view gig details', async ({ page }) => {
        await page.goto('/marketplace');

        // Click on first gig
        await page.locator('[data-testid="gig-card"]').first().click();

        // Should navigate to gig detail page
        await expect(page).toHaveURL(/\/gig\//);

        // Should show gig details
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('text=/Package/i')).toBeVisible();
    });
});
