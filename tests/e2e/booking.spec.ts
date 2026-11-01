import { expect, test } from './fixtures';

test('creates a booking manually', async ({ page }) => {
    const bookingName = `E2E-bokning ${Date.now()}`;

    await page.goto('/bookings/new');
    await page.getByRole('button', { name: 'Skapa bokning manuellt' }).click();
    await page.getByRole('button', { name: 'Fyll i kunddetaljer manuellt' }).click();
    await page.getByRole('button', { name: 'Koppla inte emailtråd' }).click();

    await page.getByLabel('Bokningsnamn').fill(bookingName);
    await page.getByLabel('Bokningstyp').selectOption({ index: 1 });
    await page.getByLabel('Prisplan').selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Lägg till bokning' }).first().click();

    await expect(page).toHaveURL(/\/bookings\/\d+$/);
    await expect(page.getByRole('heading', { name: bookingName })).toBeVisible();
});
