import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
    test('should successfully register a new user', async ({ page }) => {
        await page.goto('/register');

        // Fill registration form
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
        await page.fill('input[name="password"]', 'Test123!@#');
        await page.fill('input[name="confirmPassword"]', 'Test123!@#');

        // Submit form
        await page.click('button[type="submit"]');

        // Should redirect to dashboard or show success
        await expect(page).toHaveURL(/\/(dashboard|login)/);
    });

    test('should show validation errors for invalid data', async ({ page }) => {
        await page.goto('/register');

        // Submit empty form
        await page.click('button[type="submit"]');

        // Should show validation errors
        await expect(page.locator('text=/required/i')).toBeVisible();
    });

    test('should prevent registration with existing email', async ({ page }) => {
        await page.goto('/register');

        // Use a known existing email
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', 'existing@example.com');
        await page.fill('input[name="password"]', 'Test123!@#');
        await page.fill('input[name="confirmPassword"]', 'Test123!@#');

        await page.click('button[type="submit"]');

        // Should show error about existing email
        await expect(page.locator('text=/already exists/i')).toBeVisible();
    });
});

test.describe('User Login Flow', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password123');

        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');

        await page.click('button[type="submit"]');

        // Should show error message
        await expect(page.locator('text=/invalid credentials/i')).toBeVisible();
    });

    test('should redirect to login when accessing protected route', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });
});

test.describe('Password Reset Flow', () => {
    test('should send password reset email', async ({ page }) => {
        await page.goto('/forgot-password');

        await page.fill('input[name="email"]', 'test@example.com');
        await page.click('button[type="submit"]');

        // Should show success message
        await expect(page.locator('text=/check your email/i')).toBeVisible();
    });

    test('should reset password with valid token', async ({ page }) => {
        // This would require a valid reset token
        // In a real test, you'd generate one through the API
        const token = 'valid-reset-token';

        await page.goto(`/reset-password?token=${token}`);

        await page.fill('input[name="password"]', 'NewPassword123!');
        await page.fill('input[name="confirmPassword"]', 'NewPassword123!');

        await page.click('button[type="submit"]');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });
});
