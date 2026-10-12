import { expect, test } from '@playwright/test';
test('development workspace loads without runtime errors and identifies pending visuals', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'FeltForge', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'No card, chip, marker, or table visuals are implemented yet.',
    ),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
