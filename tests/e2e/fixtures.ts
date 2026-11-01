import { Page, expect, test as base } from '@playwright/test';

export { expect } from '@playwright/test';

export const test = base.extend({
    context: async ({ context }, use) => {
        // Keep test runs out of the PostHog analytics, which the app proxies through /ingest
        await context.route('**/ingest/**', (route) => route.abort());
        await use(context);
    },
});

export const logIn = async (page: Page, username: string, password: string) => {
    await page.goto('/login');

    // In development the client certificate check always passes, so the page opens in card reader mode
    const usernameField = page.getByPlaceholder('Användarnamn');
    const usePasswordButton = page.getByRole('button', { name: 'Använd användarnamn och lösenord istället' });
    await expect(usernameField.or(usePasswordButton)).toBeVisible();
    if (await usePasswordButton.isVisible()) {
        await usePasswordButton.click();
    }

    await usernameField.fill(username);
    await page.getByPlaceholder('Lösenord').fill(password);
    await page.getByRole('button', { name: 'Logga in' }).click();
};
