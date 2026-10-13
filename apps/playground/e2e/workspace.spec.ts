import { expect, test } from '@playwright/test';
test('cards are selectable, all styles load, and every ordinary card is reachable', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Good hands/ })).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'King of Hearts' }).first(),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Select 7 of hearts', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Select 7 of hearts', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  for (const style of ['western', 'eastern', 'persian']) {
    await page.getByLabel('Court collection').selectOption(style);
    await expect(
      page.getByRole('img', { name: 'Jack of Hearts' }),
    ).toBeVisible();
  }
  await page.getByLabel('All 52 cards').check();
  await expect(page.locator('.card-button')).toHaveCount(52);
  await expect(page.getByRole('img', { name: 'Joker 1' })).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/cards.png', fullPage: true });
});
test('chip labels fit and stack controls update visible geometry', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Chips & markers' }).click();
  await page.getByLabel('Custom denomination').fill('123456');
  const chip = page.getByRole('img', { name: '123456 chip', exact: true });
  await expect(chip).toBeVisible();
  await expect
    .poll(() =>
      chip
        .locator('text')
        .evaluate((el) => (el as SVGTextElement).getComputedTextLength()),
    )
    .toBeLessThanOrEqual(34.1);
  await page.getByLabel('Chip count', { exact: true }).fill('50');
  await expect(
    page.getByRole('img', { name: '50 chips, total 6172800' }).locator('text'),
  ).toHaveCount(5);
  await page.getByRole('slider', { name: 'Visible limit' }).fill('8');
  await expect(
    page.getByRole('img', { name: '50 chips, total 6172800' }).locator('text'),
  ).toHaveCount(8);
  await page.screenshot({ path: 'test-results/chips.png', fullPage: true });
});
test('table layouts expose independently sized overlays', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Poker table' }).click();
  for (const layout of [2, 6, 8, 9]) {
    await page
      .getByLabel('Seats', { exact: true })
      .selectOption(String(layout));
    await expect(page.locator('[data-seat-index]')).toHaveCount(layout);
  }
  await page.screenshot({
    path: 'test-results/table-1000.png',
    fullPage: true,
  });
  await page.getByLabel('Table width', { exact: true }).fill('500');
  await expect(
    page.getByRole('group', { name: '9-seat poker table' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Dealer button' }),
  ).toHaveAttribute('width', '40');
  await page.screenshot({ path: 'test-results/table-500.png', fullPage: true });
});
test('mobile gallery stays within the viewport and native card buttons work by keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(
    page.getByRole('img', { name: 'Seven of Hearts' }),
  ).toBeVisible();
  const card = page.getByRole('button', {
    name: 'Select 7 of hearts',
    exact: true,
  });
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});
