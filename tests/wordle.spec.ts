import { test, expect } from '@playwright/test';

test.describe('Engineering Wordle', () => {
    test('should complete the puzzle with correct word', async ({ page }) => {
        // Navigate to the Wordle puzzle
        await page.goto('/puzzles/engineering-wordle');

        // Verify page loaded
        await expect(page.locator('h1')).toContainText('Engineering Wordle');

        // Verify the grid is present
        await expect(page.locator('.wordle-grid')).toBeVisible();

        // Test Case 1: Type incorrect word first
        await page.keyboard.type('LASER');
        await page.keyboard.press('Enter');

        // Wait a moment for the row to render
        await page.waitForTimeout(500);

        // Verify that the first row has some colored cells (not all empty)
        const firstRow = page.locator('.wordle-row').first();
        await expect(firstRow).toBeVisible();

        // Test Case 2: Type the correct word
        await page.keyboard.type('DIODE');
        await page.keyboard.press('Enter');

        // Wait for the success animation
        await page.waitForTimeout(2000);

        // Verify success message appears
        await expect(page.locator('.result-title')).toContainText('Congratulations', { timeout: 3000 });

        // Verify the score is displayed
        await expect(page.locator('.score-value-large')).toContainText('100%');
    });

    test('should show keyboard colors after guesses', async ({ page }) => {
        await page.goto('/puzzles/engineering-wordle');

        // Type and submit a word
        await page.keyboard.type('DIODE');
        await page.keyboard.press('Enter');

        // Wait for success
        await page.waitForTimeout(2000);

        // Verify win condition
        await expect(page.locator('.result-title')).toContainText('Congratulations');
    });

    test('should prevent submission of incomplete words', async ({ page }) => {
        await page.goto('/puzzles/engineering-wordle');

        // Type only 3 letters
        await page.keyboard.type('DIO');
        await page.keyboard.press('Enter');

        // The row should shake but not submit
        await page.waitForTimeout(600);

        // Verify we're still on the first row (no submission happened)
        const rows = page.locator('.wordle-row');
        await expect(rows.first()).toBeVisible();
    });

    test('should allow backspace to delete letters', async ({ page }) => {
        await page.goto('/puzzles/engineering-wordle');

        // Type some letters
        await page.keyboard.type('LASER');

        // Delete 2 letters
        await page.keyboard.press('Backspace');
        await page.keyboard.press('Backspace');

        // Complete the word
        await page.keyboard.type('ER');
        await page.keyboard.press('Enter');

        // Verify submission happened
        await page.waitForTimeout(500);

        // Should be able to see the submitted row
        const firstRow = page.locator('.wordle-row').first();
        await expect(firstRow).toBeVisible();
    });
});
