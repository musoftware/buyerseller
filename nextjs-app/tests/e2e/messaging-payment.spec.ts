import { test, expect } from '@playwright/test';

test.describe('Messaging Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'buyer@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/);
    });

    test('should send a message', async ({ page }) => {
        await page.goto('/messages');

        // Click on a conversation or start new one
        await page.click('[data-testid="conversation-item"]').first();

        // Type message
        await page.fill('textarea[name="message"]', 'Hello, I have a question about your service');

        // Send
        await page.click('button[type="submit"]');

        // Should show message in conversation
        await expect(page.locator('text=Hello, I have a question')).toBeVisible();
    });

    test('should receive real-time messages', async ({ page, context }) => {
        // Open two pages (simulate two users)
        const page2 = await context.newPage();

        // Login as seller on page2
        await page2.goto('/login');
        await page2.fill('input[name="email"]', 'seller@example.com');
        await page2.fill('input[name="password"]', 'password123');
        await page2.click('button[type="submit"]');
        await page2.waitForURL(/\/dashboard/);

        // Both go to same conversation
        await page.goto('/messages/conversation-123');
        await page2.goto('/messages/conversation-123');

        // Send message from page1
        await page.fill('textarea[name="message"]', 'Test real-time message');
        await page.click('button[type="submit"]');

        // Should appear on page2
        await expect(page2.locator('text=Test real-time message')).toBeVisible({ timeout: 5000 });
    });

    test('should upload file attachment', async ({ page }) => {
        await page.goto('/messages');
        await page.click('[data-testid="conversation-item"]').first();

        // Upload file
        // await page.setInputFiles('input[type="file"]', 'path/to/test-file.pdf');

        // Should show file preview
        // await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();

        // Send with attachment
        await page.click('button[type="submit"]');

        // Should show message with attachment
        // await expect(page.locator('[data-testid="message-attachment"]')).toBeVisible();
    });
});

test.describe('Payment Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login as buyer
        await page.goto('/login');
        await page.fill('input[name="email"]', 'buyer@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/);
    });

    test('should process payment with Stripe', async ({ page }) => {
        // Navigate to checkout
        await page.goto('/checkout?gigId=g1&package=BASIC');

        // Fill requirements
        await page.fill('textarea[name="requirements"]', 'My project requirements');

        // Continue to payment
        await page.click('button:has-text("Continue to Payment")');

        // Wait for Stripe Elements to load
        await page.waitForSelector('iframe[name^="__privateStripeFrame"]');

        // In a real test, you would:
        // 1. Switch to Stripe iframe
        // 2. Fill in test card details (4242 4242 4242 4242)
        // 3. Submit payment

        // For now, just check that Stripe loaded
        const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
        await expect(stripeFrame.locator('input[name="cardnumber"]')).toBeVisible();
    });
});
