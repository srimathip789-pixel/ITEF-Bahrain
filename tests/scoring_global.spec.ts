import { test, expect } from '@playwright/test';

test.describe('Global Scoring and Winner System', () => {
    test.beforeEach(async ({ page }) => {
        // Clear local storage to start fresh
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
    });

    test('should calculate global average and award badge', async ({ page }) => {
        // 1. Register
        await page.goto('/');
        // Check if registration modal is present (it should be after clear)
        await expect(page.locator('.registration-modal')).toBeVisible();

        await page.fill('input[name="name"]', 'Global Test User');
        await page.fill('input[name="email"]', 'globaltest@example.com');
        await page.fill('input[name="mobile"]', '9876543210');
        await page.click('button:has-text("Start Playing")');

        // 2. Play Electronics Fundamentals
        await page.click('text=Electronics Fundamentals');

        // Answer 10 questions correctly
        // Q1: Diode
        await page.click('button:has-text("Diode")');
        await page.click('[data-testid="next-button"]');

        // Q2: Ohm
        await page.click('button:has-text("Ohm")');
        await page.click('[data-testid="next-button"]');

        // Q3: Ohm's Law
        await page.click('button:has-text("Ohm\'s Law")');
        await page.click('[data-testid="next-button"]');

        // Q4: Electrical charge
        await page.click('button:has-text("Electrical charge")');
        await page.click('[data-testid="next-button"]');

        // Q5: Zigzag line
        await page.click('button:has-text("Zigzag line")');
        await page.click('[data-testid="next-button"]');

        // Q6: Direct Current (DC)
        await page.click('button:has-text("Direct Current (DC)")');
        await page.click('[data-testid="next-button"]');

        // Q7: P = V × I
        await page.click('button:has-text("P = V × I")');
        await page.click('[data-testid="next-button"]');

        // Q8: Transistor
        await page.click('button:has-text("Transistor")');
        await page.click('[data-testid="next-button"]');

        // Q9: 1.5V
        await page.click('button:has-text("1.5V")');
        await page.click('[data-testid="next-button"]');

        // Q10: Copper
        await page.click('button:has-text("Copper")');
        await page.click('[data-testid="submit-button"]');

        // 3. Verify Success and 100% Score
        await expect(page.locator('text=Score: 100%')).toBeVisible();
        await page.click('button:has-text("Back to Puzzle Hub")');

        // 4. Verify Leaderboard Badge and Global Stats
        // Check the Stats Card on Puzzle Hub
        await expect(page.locator('.stat-label:has-text("Global Avg Score")')).toBeVisible();
        await expect(page.locator('.stat-value:has-text("100%")')).toBeVisible();

        // 5. Verify 24-Hour Auto Logout Logic (mocked)
        // Check loginTimestamp presence
        const userDetails = await page.evaluate(() => localStorage.getItem('itef_user_details'));
        expect(userDetails).toBeTruthy();
        const detailsObj = JSON.parse(userDetails || '{}');
        expect(detailsObj.loginTimestamp).toBeDefined();

        // Verify that setting timestamp to 25 hours ago triggers logout
        await page.evaluate(() => {
            const data = JSON.parse(localStorage.getItem('itef_user_details') || '{}');
            data.loginTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
            localStorage.setItem('itef_user_details', JSON.stringify(data));
        });

        // Trigger re-render or reload
        await page.reload();

        // Verify Logout (Registration modal should be visible)
        await expect(page.locator('.registration-modal')).toBeVisible();
    });
});
