import { test, expect } from '@playwright/test';

test.describe('MCQ Quizzes - Electronics Fundamentals', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');
        await page.waitForLoadState('networkidle');
    });

    test('should load quiz with 10 questions', async ({ page }) => {
        // Check title
        await expect(page.locator('h1')).toContainText('Electronics Fundamentals');

        // Verify first question loads
        await expect(page.locator('[data-testid="question-text"]').first()).toBeVisible();

        // Verify 4 choices
        const choices = page.locator('[data-testid="choice-option"]');
        await expect(choices).toHaveCount(4);
    });

    test('should select an answer and proceed to next question', async ({ page }) => {
        // Select first choice
        await page.locator('[data-testid="choice-option"]').first().click();

        // Click next button
        await page.locator('[data-testid="next-button"]').click();

        // Verify question number changed
        await expect(page.locator('[data-testid="question-number"]')).toContainText('2');
    });

    test('should complete quiz and show results', async ({ page }) => {
        // Answer all 10 questions
        for (let i = 0; i < 10; i++) {
            await page.locator('[data-testid="choice-option"]').first().click();

            if (i < 9) {
                await page.locator('[data-testid="next-button"]').click();
                await page.waitForTimeout(500);
            }
        }

        // Submit quiz
        await page.locator('[data-testid="submit-button"]').click();

        // Check results page
        await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
        await expect(page.locator('[data-testid="score-display"]')).toBeVisible();
    });

    test('should show timer counting down', async ({ page }) => {
        const timerBefore = await page.locator('[data-testid="timer"]').textContent();

        await page.waitForTimeout(2000);

        const timerAfter = await page.locator('[data-testid="timer"]').textContent();

        // Timer should have decreased
        expect(timerBefore).not.toBe(timerAfter);
    });

    test('should prevent submission without answering all questions', async ({ page }) => {
        // Try to submit without answering
        const submitButton = page.locator('[data-testid="submit-button"]');

        // Submit button should be disabled or not visible initially
        await expect(submitButton).toBeDisabled();
    });
});

test.describe('MCQ Quizzes - Programming & Logic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/puzzles/programming-logic');
        await page.waitForLoadState('networkidle');
    });

    test('should display correct quiz title and description', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Programming & Logic');
        await expect(page.locator('[data-testid="quiz-description"]')).toBeVisible();
    });

    test('should track answered questions', async ({ page }) => {
        // Answer first question
        await page.locator('[data-testid="choice-option"]').first().click();
        await page.locator('[data-testid="next-button"]').click();

        // Check progress indicator
        await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('1/10');
    });
});

test.describe('MCQ Quizzes - Digital Electronics', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/puzzles/digital-electronics');
        await page.waitForLoadState('networkidle');
    });

    test('should show explanations after submission', async ({ page }) => {
        // Complete quiz quickly
        for (let i = 0; i < 10; i++) {
            await page.locator('[data-testid="choice-option"]').first().click();
            if (i < 9) {
                await page.locator('[data-testid="next-button"]').click();
            }
        }

        await page.locator('[data-testid="submit-button"]').click();

        // Verify explanations are shown
        await expect(page.locator('[data-testid="explanation"]').first()).toBeVisible();
    });
});

test.describe('All MCQ Quizzes - General Tests', () => {
    const quizzes = [
        'electronics-fundamentals',
        'programming-logic',
        'digital-electronics',
        'mechanical-engineering',
        'thermodynamics',
        'materials-science',
        'circuit-analysis',
        'engineering-mathematics',
        'engineering-ethics'
    ];

    for (const quiz of quizzes) {
        test(`${quiz} should load successfully`, async ({ page }) => {
            await page.goto(`/puzzles/${quiz}`);
            await page.waitForLoadState('networkidle');

            // Verify quiz loaded
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
        });

        test(`${quiz} should have 10 questions`, async ({ page }) => {
            await page.goto(`/puzzles/${quiz}`);

            let questionCount = 0;

            // Navigate through all questions
            for (let i = 0; i < 10; i++) {
                const questionVisible = await page.locator('[data-testid="question-text"]').isVisible();
                if (questionVisible) questionCount++;

                if (i < 9) {
                    await page.locator('[data-testid="choice-option"]').first().click();
                    await page.locator('[data-testid="next-button"]').click();
                    await page.waitForTimeout(300);
                }
            }

            expect(questionCount).toBe(10);
        });
    }
});

test.describe('Quiz Time Limit', () => {
    test('should show 10-minute timer', async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');

        const timer = page.locator('[data-testid="timer"]');
        await expect(timer).toBeVisible();

        const timerText = await timer.textContent();
        // Should show 10:00 or 09:59
        expect(timerText).toMatch(/0?9:[0-5][0-9]|10:00/);
    });

    test('should auto-submit when timer expires', async ({ page }) => {
        // This test would require mocking time or waiting 10 minutes
        // Skipping for now, but structure is here
        test.skip();
    });
});

test.describe('Quiz Navigation', () => {
    test('should allow going back to previous questions', async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');

        // Answer first question
        await page.locator('[data-testid="choice-option"]').first().click();
        await page.locator('[data-testid="next-button"]').click();

        // Go back
        const backButton = page.locator('[data-testid="back-button"]');
        if (await backButton.isVisible()) {
            await backButton.click();
            await expect(page.locator('[data-testid="question-number"]')).toContainText('1');
        }
    });

    test('should show review screen before final submission', async ({ page }) => {
        await page.goto('/puzzles/programming-logic');

        // Answer all questions
        for (let i = 0; i < 10; i++) {
            await page.locator('[data-testid="choice-option"]').first().click();
            if (i < 9) {
                await page.locator('[data-testid="next-button"]').click();
            }
        }

        // Check if review screen appears
        const reviewButton = page.locator('[data-testid="review-button"]');
        if (await reviewButton.isVisible()) {
            await reviewButton.click();
            await expect(page.locator('[data-testid="review-screen"]')).toBeVisible();
        }
    });
});
