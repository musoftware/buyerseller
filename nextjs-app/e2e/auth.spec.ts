import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
    test('should show login page', async ({ page }) => {
        await page.goto('/login')

        await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible()
        await expect(page.getByLabel(/Email/i)).toBeVisible()
        await expect(page.getByLabel(/Password/i)).toBeVisible()
    })

    test('should show register page', async ({ page }) => {
        await page.goto('/register')

        await expect(page.getByRole('heading', { name: /Create Account/i })).toBeVisible()
        await expect(page.getByLabel(/Name/i)).toBeVisible()
        await expect(page.getByLabel(/Email/i)).toBeVisible()
        await expect(page.getByLabel(/Password/i)).toBeVisible()
    })

    test('should validate login form', async ({ page }) => {
        await page.goto('/login')

        // Try to submit empty form
        await page.getByRole('button', { name: /Sign In/i }).click()

        // Should show validation errors
        await expect(page.getByText(/required/i)).toBeVisible()
    })

    test('should navigate between login and register', async ({ page }) => {
        await page.goto('/login')

        // Click on register link
        await page.getByRole('link', { name: /Sign Up/i }).click()

        await expect(page).toHaveURL(/\/register/)

        // Go back to login
        await page.getByRole('link', { name: /Sign In/i }).click()

        await expect(page).toHaveURL(/\/login/)
    })

    test('should show forgot password page', async ({ page }) => {
        await page.goto('/login')

        await page.getByRole('link', { name: /Forgot Password/i }).click()

        await expect(page).toHaveURL(/\/forgot-password/)
        await expect(page.getByRole('heading', { name: /Reset Password/i })).toBeVisible()
    })
})
