import { test, expect } from '@playwright/test';

test.describe('Order Placement Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login as buyer
        await page.goto('/login');
        await page.fill('input[name="email"]', 'buyer@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/);
    });

    test('should place an order successfully', async ({ page }) => {
        // Navigate to a gig
        await page.goto('/gig/professional-logo-design');

        // Select package
        await page.click('button:has-text("Select Basic")');

        // Should navigate to checkout
        await expect(page).toHaveURL(/\/checkout/);

        // Fill requirements
        await page.fill('textarea[name="requirements"]', 'I need a modern logo for my tech startup');

        // Proceed to payment
        await page.click('button:has-text("Continue to Payment")');

        // Mock Stripe payment (in real test, use Stripe test mode)
        // This would require Stripe Elements interaction

        // After successful payment
        // await expect(page).toHaveURL(/\/checkout\/success/);
    });

    test('should show order in dashboard', async ({ page }) => {
        await page.goto('/dashboard/orders');

        // Should show orders
        await expect(page.locator('[data-testid="order-card"]').first()).toBeVisible();
    });

    test('should view order details', async ({ page }) => {
        await page.goto('/dashboard/orders');

        // Click on first order
        await page.locator('[data-testid="order-card"]').first().click();

        // Should show order details
        await expect(page).toHaveURL(/\/dashboard\/orders\//);
        await expect(page.locator('text=/Order Details/i')).toBeVisible();
    });
});

test.describe('Order Management (Seller)', () => {
    test.beforeEach(async ({ page }) => {
        // Login as seller
        await page.goto('/login');
        await page.fill('input[name="email"]', 'seller@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/);
    });

    test('should accept an order', async ({ page }) => {
        await page.goto('/dashboard/orders');

        // Find pending order
        const pendingOrder = page.locator('[data-testid="order-card"]:has-text("Pending")').first();
        await pendingOrder.click();

        // Accept order
        await page.click('button:has-text("Accept Order")');

        // Should show confirmation
        await expect(page.locator('text=/Order accepted/i')).toBeVisible();
    });

    test('should deliver an order', async ({ page }) => {
        await page.goto('/dashboard/orders');

        // Find in-progress order
        const inProgressOrder = page.locator('[data-testid="order-card"]:has-text("In Progress")').first();
        await inProgressOrder.click();

        // Upload deliverable
        // await page.setInputFiles('input[type="file"]', 'path/to/deliverable.zip');
        await page.fill('textarea[name="deliveryNote"]', 'Here is your completed work');

        // Mark as delivered
        await page.click('button:has-text("Mark as Delivered")');

        // Should show success
        await expect(page.locator('text=/Order delivered/i')).toBeVisible();
    });
});

test.describe('Order Completion (Buyer)', () => {
    test.beforeEach(async ({ page }) => {
        // Login as buyer
        await page.goto('/login');
        await page.fill('input[name="email"]', 'buyer@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/);
    });

    test('should complete order and leave review', async ({ page }) => {
        await page.goto('/dashboard/orders');

        // Find delivered order
        const deliveredOrder = page.locator('[data-testid="order-card"]:has-text("Delivered")').first();
        await deliveredOrder.click();

        // Complete order
        await page.click('button:has-text("Complete Order")');

        // Should navigate to review page
        await expect(page).toHaveURL(/\/review/);

        // Leave review
        await page.click('[data-rating="5"]'); // 5-star rating
        await page.fill('textarea[name="comment"]', 'Excellent work! Very professional.');

        await page.click('button[type="submit"]');

        // Should show success
        await expect(page.locator('text=/Review submitted/i')).toBeVisible();
    });
});
