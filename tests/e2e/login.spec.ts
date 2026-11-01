import { expect, logIn, test } from './fixtures';

test.use({ storageState: { cookies: [], origins: [] } });

test('rejects a wrong password', async ({ page }) => {
    await logIn(page, 'albert', 'wrong');

    await expect(page.getByText('Felaktigt användarnamn eller lösenord.')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
});

test('redirects to the login page when not logged in', async ({ page }) => {
    await page.goto('/bookings');

    await expect(page).toHaveURL(/\/login/);
});
