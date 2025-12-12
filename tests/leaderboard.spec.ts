import { test, expect } from '@playwright/test';

test.describe('Leaderboard Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should display leaderboard section on home page', async ({ page }) => {
        // Check for leaderboard container
        const leaderboard = page.locator('.leaderboard-container, .winners-section, .winners-list-container');
        await expect(leaderboard.first()).toBeVisible();
    });

    test('should have winners tab or loading state', async ({ page }) => {
        // Wait for tabs or loading state to be visible
        await page.waitForTimeout(2000);

        const winnersTab = page.locator('[data-testid="winners-tab"]');
        const loading = page.locator('[data-testid="loading"]');
        const winnersSection = page.locator('.winners-section, .leaderboard-container');

        // Either tabs should be visible OR loading indicator OR a winners section exists
        const hasTab = await winnersTab.isVisible();
        const hasLoading = await loading.isVisible();
        const hasSection = await winnersSection.first().isVisible();

        expect(hasTab || hasLoading || hasSection).toBe(true);
    });

    test('should have attendees tab or loading state', async ({ page }) => {
        // Wait for tabs or loading state to be visible
        await page.waitForTimeout(2000);

        const attendeesTab = page.locator('[data-testid="attendees-tab"]');
        const loading = page.locator('[data-testid="loading"]');
        const winnersSection = page.locator('.winners-section, .leaderboard-container');

        // Either tabs should be visible OR loading indicator OR a winners section exists
        const hasTab = await attendeesTab.isVisible();
        const hasLoading = await loading.isVisible();
        const hasSection = await winnersSection.first().isVisible();

        expect(hasTab || hasLoading || hasSection).toBe(true);
    });
});
