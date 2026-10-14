import { test } from '@playwright/test';

test('mobile card shadow investigation', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.setViewportSize({ width: 457, height: 950 });
  await page.getByLabel('Card width', { exact: true }).fill('250');
  const card = page.locator('.gallery > .flip-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `test-results/shadow-${testInfo.project.name}-before.png`,
  });
  await page.addStyleTag({
    content: '.flip-card__face > svg { overflow: visible; }',
  });
  await page.screenshot({
    path: `test-results/shadow-${testInfo.project.name}-overflow.png`,
  });
  await page.addStyleTag({
    content: '.flip-card__glare { border-radius: inherit; }',
  });
  await page.screenshot({
    path: `test-results/shadow-${testInfo.project.name}-glare.png`,
  });
});
