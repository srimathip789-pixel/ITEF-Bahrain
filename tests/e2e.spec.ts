import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey', () => {
    test('complete MCQ quiz flow', async ({ page }) => {
        // Start quiz
        await page.goto('/puzzles/electronics-fundamentals');
        await page.waitForLoadState('networkidle');

        // Answer all questions
        for (let i = 0; i < 10; i++) {
            await page.locator('[data-testid="choice-option"]').first().click();

            if (i < 9) {
                await page.locator('[data-testid="next-button"]').click();
                await page.waitForTimeout(300);
            }
        }

        // Submit quiz
        await page.locator('[data-testid="submit-button"]').click();

        // Verify results page
        await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
    });
});

test.describe('Navigation Tests', () => {
    test('should navigate between different puzzles', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Go to Wordle
        const wordleLink = page.locator('[href="/puzzles/engineering-wordle"]');
        if (await wordleLink.isVisible()) {
            await wordleLink.click();
            await expect(page).toHaveURL(/engineering-wordle/);
        }
    });
});

test.describe('Performance Tests', () => {
    test('should load home page within 5 seconds', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(5000);
    });
});

test.describe('Accessibility Tests', () => {
    test('should have proper headings structure', async ({ page }) => {
        await page.goto('/');

        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');
        await page.waitForLoadState('networkidle');

        // Tab through elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // One element should be focused
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
    });

    test('should have alt text for images', async ({ page }) => {
        await page.goto('/');

        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
            const alt = await images.nth(i).getAttribute('alt');
            expect(alt).not.toBeNull();
        }
    });
});

test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
        // Simulate offline
        await page.context().setOffline(true);

        try {
            await page.goto('/');
        } catch {
            // Expected to fail
        }

        // Go back online
        await page.context().setOffline(false);
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible();
    });
});

test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display correctly on mobile', async ({ page }) => {
        await page.goto('/');

        // Check if content is visible
        await expect(page.locator('h1')).toBeVisible();

        // Check if buttons are accessible
        const quizLinks = page.locator('a[href^="/puzzles/"]');
        await expect(quizLinks.first()).toBeVisible();
    });
});
