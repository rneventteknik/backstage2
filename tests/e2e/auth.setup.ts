import { expect, logIn, test as setup } from './fixtures';

// Logs in once and saves the session cookie, which the other tests load through `storageState` in
// playwright.config.ts instead of going through the login page themselves.
setup('log in as admin', async ({ page }) => {
    await logIn(page, 'albert', 'dmx');

    await expect(page).toHaveURL('/');
    await page.context().storageState({ path: 'tests/e2e/.auth/admin.json' });
});
