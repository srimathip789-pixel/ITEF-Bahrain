import { test, expect } from '@playwright/test';

test.describe('MCQ Quizzes - Core Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/puzzles/electronics-fundamentals');
        await page.waitForLoadState('networkidle');
    });

    test('should load quiz with questions and choices', async ({ page }) => {
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
                await page.waitForTimeout(300);
            }
        }

        // Submit quiz
        await page.locator('[data-testid="submit-button"]').click();

        // Check results page
        await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
    });

    test('should allow going back to previous questions', async ({ page }) => {
        // Answer first question and go next
        await page.locator('[data-testid="choice-option"]').first().click();
        await page.locator('[data-testid="next-button"]').click();

        // Go back
        await page.locator('[data-testid="back-button"]').click();
        await expect(page.locator('[data-testid="question-number"]')).toContainText('1');
    });
});

test.describe('All MCQ Quizzes - Load Tests', () => {
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
    }
});
