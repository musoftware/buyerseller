import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
        await page.goto('/')

        // Check page title
        await expect(page).toHaveTitle(/GigStream/)

        // Check hero section
        await expect(page.getByRole('heading', { name: /Find the Perfect/i })).toBeVisible()

        // Check search bar
        await expect(page.getByPlaceholder(/Search for services/i)).toBeVisible()
    })

    test('should navigate to marketplace', async ({ page }) => {
        await page.goto('/')

        // Click on a category
        await page.getByRole('link', { name: /Graphics & Design/i }).first().click()

        // Should navigate to marketplace
        await expect(page).toHaveURL(/\/marketplace/)
    })

    test('should search for gigs', async ({ page }) => {
        await page.goto('/')

        // Enter search query
        const searchInput = page.getByPlaceholder(/Search for services/i)
        await searchInput.fill('logo design')

        // Submit search
        await searchInput.press('Enter')

        // Should navigate to marketplace with search query
        await expect(page).toHaveURL(/\/marketplace\?.*search=logo/)
    })

    test('should display categories', async ({ page }) => {
        await page.goto('/')

        // Check if categories are visible
        await expect(page.getByText('Graphics & Design')).toBeVisible()
        await expect(page.getByText('Digital Marketing')).toBeVisible()
        await expect(page.getByText('Writing & Translation')).toBeVisible()
    })

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        // Check mobile menu button
        await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()

        // Open mobile menu
        await page.getByRole('button', { name: /menu/i }).click()

        // Check navigation links in mobile menu
        await expect(page.getByRole('link', { name: /Browse Gigs/i })).toBeVisible()
    })
})
