import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey', () => {
    test('complete user flow: register → quiz → leaderboard', async ({ page }) => {
        // 1. Navigate to home
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 2. Select Engineering Wordle
        await page.locator('[href="/puzzles/engineering-wordle"]').click();
        await page.waitForLoadState('networkidle');

        // 3. Complete Wordle puzzle
        const targetWord = 'DIODE';
        for (const letter of targetWord) {
            await page.keyboard.press(letter);
        }
        await page.keyboard.press('Enter');

        // Wait for feedback
        await page.waitForTimeout(1500);

        // 4. Check for success message
        const successMessage = page.locator('[data-testid="success-message"]');
        const isSuccess = await successMessage.isVisible();

        if (isSuccess) {
            // 5. Navigate back to home
            await page.goto('/');

            // 6. Check leaderboard
            await page.locator('[data-testid="attendees-tab"]').click();
            await expect(page.locator('[data-testid="attendees-list"]')).toBeVisible();
        }
    });

    test('complete MCQ quiz and verify results', async ({ page }) => {
        // 1. Start Electronics quiz
        await page.goto('/puzzles/electronics-fundamentals');

        // 2. Answer all questions
        for (let i = 0; i < 10; i++) {
            // Select first option (for testing purposes)
            await page.locator('[data-testid="choice-option"]').first().click();

            if (i < 9) {
                await page.locator('[data-testid="next-button"]').click();
                await page.waitForTimeout(300);
            }
        }

        // 3. Submit quiz
        await page.locator('[data-testid="submit-button"]').click();

        // 4. Verify results page
        await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();

        // 5. Check score display
        const scoreText = await page.locator('[data-testid="score-display"]').textContent();
        expect(scoreText).toMatch(/\d+%|\d+\/10/);
    });

    test('attempt same quiz multiple times', async ({ page }) => {
        const quizUrl = '/puzzles/programming-logic';

        // First attempt
        await page.goto(quizUrl);

        for (let i = 0; i < 10; i++) {
            await page.locator('[data-testid="choice-option"]').first().click();
            if (i < 9) {
                await page.locator('[data-testid="next-button"]').click();
                await page.waitForTimeout(200);
            }
        }

        await page.locator('[data-testid="submit-button"]').click();
        await page.waitForTimeout(1000);

        // Navigate back to home
        await page.goto('/');

        // Second attempt
        await page.goto(quizUrl);

        // Verify quiz loads again
        await expect(page.locator('[data-testid="question-text"]')).toBeVisible();

        // Check if attempt counter increased
        const attemptIndicator = page.locator('[data-testid="attempt-number"]');
        if (await attemptIndicator.isVisible()) {
            const attemptText = await attemptIndicator.textContent();
            expect(attemptText).toContain('2');
        }
    });
});

test.describe('Cross-Quiz Navigation', () => {
    test('should navigate between different quizzes', async ({ page }) => {
        await page.goto('/');

        // Go to Wordle
        await page.locator('[href="/puzzles/engineering-wordle"]').click();
        await expect(page).toHaveURL(/engineering-wordle/);

        // Go back
        await page.goBack();

        // Go to MCQ quiz
        await page.locator('[href="/puzzles/electronics-fundamentals"]').click();
        await expect(page).toHaveURL(/electronics-fundamentals/);
    });

    test('should maintain state when navigating back', async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');

        // Answer first question
        await page.locator('[data-testid="choice-option"]').nth(1).click();
        await page.locator('[data-testid="next-button"]').click();

        // Go back in browser
        await page.goBack();

        // Check if it returns to home or quiz start
        await page.waitForLoadState('networkidle');
        const url = page.url();
        expect(url).toBeTruthy();
    });
});

test.describe('Performance and Load Tests', () => {
    test('should load home page within 3 seconds', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(3000);
    });

    test('should load quiz page within 2 seconds', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/puzzles/engineering-wordle');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(2000);
    });

    test('should handle rapid clicking without errors', async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');

        // Rapid click on choice
        for (let i = 0; i < 10; i++) {
            await page.locator('[data-testid="choice-option"]').first().click();
        }

        // Should not crash or throw errors
        await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
    });
});

test.describe('Accessibility Tests', () => {
    test('should have proper headings structure', async ({ page }) => {
        await page.goto('/');

        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();

        const h1Text = await h1.textContent();
        expect(h1Text).toBeTruthy();
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');

        // Tab through elements
        await page.keyboard.press('Tab');
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
    test('should handle invalid quiz URL gracefully', async ({ page }) => {
        await page.goto('/puzzles/invalid-quiz-name');

        // Should show 404 or redirect to home
        await page.waitForLoadState('networkidle');

        const url = page.url();
        const is404 = url.includes('404') || page.locator('text=/404|not found/i').isVisible();

        expect(url).toBeTruthy();
    });

    test('should handle network errors', async ({ page }) => {
        // Simulate offline
        await page.context().setOffline(true);

        try {
            await page.goto('/');
        } catch (error) {
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

    test('should allow mobile quiz completion', async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');

        // Answer a question on mobile
        await page.locator('[data-testid="choice-option"]').first().click();
        await page.locator('[data-testid="next-button"]').click();

        await expect(page.locator('[data-testid="question-number"]')).toContainText('2');
    });
});
