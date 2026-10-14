import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';
import type { Locator } from '@playwright/test';

test('Contact shadows render outside chips, separate stack layers and support overrides', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Chips & markers' }).click();
  const surface = page.getByLabel('Chip shadows on felt', { exact: true });
  const large = surface
    .locator('.chip-shadow-row')
    .first()
    .locator(':scope > svg')
    .first();
  const small = surface.locator('.chip-shadow-row--small > svg').first();
  const stack = surface.locator('.chip-shadow-row--small > svg').last();
  const below = async (chip: Locator) => {
    await chip.scrollIntoViewIfNeeded();
    const box = (await chip.boundingBox())!;
    const png = PNG.sync.read(
      await page.screenshot({
        scale: 'css',
        clip: {
          x: box.x - 4,
          y: box.y - 4,
          width: box.width + 8,
          height: box.height + 8,
        },
      }),
    );
    const offset =
      (Math.floor(4 + box.height + 1) * png.width +
        Math.floor(4 + box.width / 2)) *
      4;
    return png.data[offset + 1]!;
  };
  const original = [await below(large), await below(small)];
  await expect(stack.locator('[data-chip-face]')).toHaveCount(3);
  expect(
    await stack
      .locator('[data-chip-face]')
      .evaluateAll((faces) =>
        faces.every((el) => getComputedStyle(el).filter.includes('url(')),
      ),
  ).toBe(true);
  await page.getByLabel('Chip shadow', { exact: true }).selectOption('none');
  expect((await below(large)) - original[0]!).toBeGreaterThan(3);
  expect((await below(small)) - original[1]!).toBeGreaterThan(3);
  expect(
    await stack
      .locator('[data-chip-face]')
      .evaluateAll((faces) =>
        faces.every((el) => getComputedStyle(el).filter === 'none'),
      ),
  ).toBe(true);
  await page.getByLabel('Chip shadow', { exact: true }).selectOption('custom');
  await page
    .getByLabel('Custom chip shadow', { exact: true })
    .fill('drop-shadow(0 2px 2px rgba(0, 0, 0, .6))');
  expect(
    await stack
      .locator('[data-chip-face]')
      .evaluateAll((faces) =>
        faces.every((el) =>
          getComputedStyle(el).filter.includes('drop-shadow('),
        ),
      ),
  ).toBe(true);
  await page.getByLabel('Chip shadow', { exact: true }).selectOption('design');
  await page.locator('.chip-shadow-lab').screenshot({
    path: `test-results/chip-shadows-${testInfo.project.name}.png`,
  });
  await page.getByLabel('Chip size', { exact: true }).fill('28');
  await expect(page.locator('.chip-stage > svg').first()).toHaveAttribute(
    'width',
    '28',
  );
  await page.getByLabel('Chip count', { exact: true }).fill('0');
  await expect(
    page.locator('.chip-stage > svg').nth(1).locator('[data-chip-face],filter'),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.chip-shadow-lab').screenshot({
    path: `test-results/chip-shadows-mobile-${testInfo.project.name}.png`,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
});
