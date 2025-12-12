import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Navigate to the app to set localStorage
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:5173');

    // Set user details to bypass registration modal
    await page.evaluate(() => {
        localStorage.setItem('itef_user_details', JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            mobile: '12345678'
        }));
    });

    // Save storage state
    await page.context().storageState({ path: 'tests/.auth/storage.json' });

    await browser.close();
}

export default globalSetup;
