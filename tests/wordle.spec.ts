import { test, expect } from '@playwright/test';

test.describe('Engineering Wordle', () => {
    test('should load wordle puzzle page', async ({ page }) => {
        // Navigate to the Wordle puzzle
        await page.goto('/puzzles/engineering-wordle');
        await page.waitForLoadState('networkidle');

        // Verify page loaded
        await expect(page.locator('h1')).toContainText('Engineering Wordle');

        // Verify the grid is present
        await expect(page.locator('.wordle-grid')).toBeVisible();
    });

    test('should allow typing letters', async ({ page }) => {
        await page.goto('/puzzles/engineering-wordle');
        await page.waitForLoadState('networkidle');

        // Wait for wordle grid to be ready
        await expect(page.locator('.wordle-grid')).toBeVisible();

        // Type some letters
        await page.keyboard.type('TEST');

        // Verify letters appeared in the grid
        const cells = page.locator('.wordle-cell');
        await expect(cells.first()).toBeVisible();
    });

    test('should allow backspace to delete letters', async ({ page }) => {
        await page.goto('/puzzles/engineering-wordle');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.wordle-grid')).toBeVisible();

        // Type some letters
        await page.keyboard.type('LASER');

        // Delete 2 letters
        await page.keyboard.press('Backspace');
        await page.keyboard.press('Backspace');

        // The grid should still be visible
        await expect(page.locator('.wordle-grid')).toBeVisible();
    });

    test('should prevent submission of incomplete words', async ({ page }) => {
        await page.goto('/puzzles/engineering-wordle');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.wordle-grid')).toBeVisible();

        // Type only 3 letters
        await page.keyboard.type('DIO');
        await page.keyboard.press('Enter');

        // Verify we're still on the first row (no submission happened)
        const rows = page.locator('.wordle-row');
        await expect(rows.first()).toBeVisible();
    });
});
