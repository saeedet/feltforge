import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

test('mobile card shadows extend past rounded faces without painting the hidden SVG', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.setViewportSize({ width: 457, height: 950 });
  await page.getByLabel('Card width', { exact: true }).fill('250');
  const card = page.locator('.gallery > .flip-card').first();
  const capture = async (name?: string) => {
    await card.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const box = (await card.boundingBox())!;
    const pixels = PNG.sync.read(
      await page.screenshot({
        ...(name
          ? { path: `test-results/shadow-${testInfo.project.name}-${name}.png` }
          : {}),
        scale: 'css',
        clip: {
          x: box.x - 12,
          y: box.y - 12,
          width: box.width + 24,
          height: box.height + 24,
        },
      }),
    );
    const rgb = (x: number, y: number): number[] => {
      const offset = (Math.floor(y) * pixels.width + Math.floor(x)) * 4;
      return Array.from(pixels.data.subarray(offset, offset + 3));
    };
    return {
      // Outside the bottom edge: this must contain real, unclipped shadow pixels.
      outside: rgb(12 + box.width / 2, 12 + box.height + 5),
      // The front's pale panel is here; the reverse artwork is dark blue.
      panel: rgb(12 + box.width * 0.32, 12 + box.height * 0.24),
    };
  };
  const original = await capture('front');
  expect(original.panel[0]).toBeGreaterThan(200);
  expect(original.panel[1]).toBeGreaterThan(200);
  await page.getByLabel('Card shadow', { exact: true }).selectOption('none');
  const none = await capture();
  expect(none.outside[0]! - original.outside[0]!).toBeGreaterThan(5);
  await page.getByLabel('Card shadow', { exact: true }).selectOption('design');
  await card.press('Enter');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await capture()).panel[0]).toBeLessThan(100);
  const back = await capture('back');
  expect(none.outside[0]! - back.outside[0]!).toBeGreaterThan(5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await card.press('Enter');
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await expect
    .poll(async () => (await capture()).panel[0])
    .toBeGreaterThan(200);
});
