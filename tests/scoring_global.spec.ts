import { test, expect } from '@playwright/test';

interface MockAttempt {
    puzzleId: string;
    userId: string;
    attemptNumber: number;
    timestamp: number;
    isCorrect: boolean;
    score: number;
    timeSpent: number;
    usedHints: boolean;
}

test.describe('Global Scoring and Winner System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
    });

    test('should only award global winner after ALL puzzles completed', async ({ page }) => {
        // 1. Register
        await page.goto('/');
        await expect(page.locator('.registration-modal')).toBeVisible();
        await page.fill('input[name="name"]', 'Global Master');
        await page.fill('input[name="email"]', 'master@example.com');
        await page.fill('input[name="mobile"]', '1234567890');
        await page.click('button:has-text("Start Playing")');

        // 2. Inject Progress for 9 out of 10 puzzles
        await page.evaluate(() => {
            const userEmail = 'master@example.com';
            const puzzles = [
                'programming-logic', 'digital-electronics', 'engineering-wordle',
                'mechanical-engineering', 'thermodynamics', 'materials-science',
                'circuit-analysis', 'engineering-mathematics', 'engineering-ethics'
            ];

            const attempts: Record<string, any[]> = {};
            const completedPuzzles: string[] = [];

            puzzles.forEach(pid => {
                completedPuzzles.push(pid);
                attempts[pid] = [{
                    puzzleId: pid,
                    userId: userEmail,
                    attemptNumber: 1,
                    timestamp: Date.now(),
                    isCorrect: true,
                    score: 100,
                    timeSpent: 60,
                    usedHints: false
                }];
            });

            const progress = {
                [userEmail]: {
                    userId: userEmail,
                    userName: 'Global Master',
                    attempts: attempts,
                    completedPuzzles: completedPuzzles,
                    wonPuzzles: [] // Not a winner yet
                }
            };

            localStorage.setItem('puzzleProgress', JSON.stringify(progress));
        });

        // Reload to apply storage
        await page.reload();

        // 3. Play the LAST puzzle: 'Electronics Fundamentals'
        await page.click('text=Electronics Fundamentals');

        // Helper to click answer and next
        const answerAndNext = async (answer: string) => {
            await page.getByRole('button', { name: answer, exact: false }).click();
            await page.getByTestId('next-button').click();
        };

        // Q1: Diode
        await answerAndNext('Diode');
        // Q2: Ohm
        await answerAndNext('Ohm');
        // Q3: Ohms Law
        await page.getByRole('button', { name: /Ohm.s Law/i }).click();
        await page.getByTestId('next-button').click();
        // Q4: Electrical charge
        await answerAndNext('Electrical charge');
        // Q5: Zigzag line
        await answerAndNext('Zigzag line');
        // Q6: DC
        await page.getByRole('button', { name: 'Direct Current (DC)' }).click();
        await page.getByTestId('next-button').click();
        // Q7: P = V x I
        await page.getByRole('button', { name: 'P = V × I' }).click();
        await page.getByTestId('next-button').click();
        // Q8: Transistor
        await answerAndNext('Transistor');
        // Q9: 1.5V
        await answerAndNext('1.5V');
        // Q10: Copper
        await page.getByRole('button', { name: 'Copper' }).click();

        // Submit
        await page.getByTestId('submit-button').click();

        // 4. Verify Success
        await expect(page.getByText('Score: 100%')).toBeVisible();
        await page.getByRole('button', { name: 'Back to Puzzle Hub' }).click();

        // 5. Verify Badge and Stats
        // Check "Global Avg Score" is 100%
        await expect(page.locator('.stat-label', { hasText: 'Global Avg Score' })).toBeVisible();
        await expect(page.locator('.stat-value', { hasText: '100%' })).toBeVisible();

        // 6. Check Leaderboard
        await page.getByRole('button', { name: 'Leaderboard' }).click();

        // Wait for winners list to protect against loading delay
        await expect(page.getByTestId('winners-list')).toBeVisible({ timeout: 10000 });

        // We expect to see 'GLOBAL CHAMPION' badge
        await expect(page.getByText('GLOBAL CHAMPION')).toBeVisible({ timeout: 15000 });
    });
});
