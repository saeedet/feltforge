import { expect, test } from '@playwright/test';

const themes = [
  'classic',
  'midnight-racetrack',
  'royal-burgundy',
  'neon-night',
  'emerald-art-deco',
  'ocean-slate',
];
test('all six table themes preserve overlays and local SVG references', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: /^Poker table/ }).click();
  const main = page.locator('.table-preview > [data-table-theme]');
  await expect(page.getByLabel('Table themes').getByRole('button')).toHaveCount(
    6,
  );
  for (const theme of themes) {
    await page.getByLabel('Table theme', { exact: true }).selectOption(theme);
    await expect(main).toHaveAttribute('data-table-theme', theme);
    await expect(main.locator('.community-card')).toHaveCount(5);
    await expect(main.locator('.seat')).toHaveCount(6);
    await expect(main.locator('svg').first().locator('text,image')).toHaveCount(
      0,
    );
    const missing = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]'), (el) => el.id);
      const missing: string[] = [];
      for (const el of document.querySelectorAll('svg *'))
        for (const attr of [
          'fill',
          'stroke',
          'clip-path',
          'filter',
          'href',
          'xlink:href',
        ]) {
          const value = el.getAttribute(attr) ?? '';
          const matches = Array.from(
            value.matchAll(
              attr.endsWith('href') ? /^#(.+)/g : /url\(#([^)"]+)/g,
            ),
            (m) => m[1]!,
          );
          for (const id of matches) if (!ids.includes(id)) missing.push(id);
        }
      return missing;
    });
    expect(missing).toEqual([]);
    await main.screenshot({ path: `test-results/table-${theme}.png` });
    for (const seats of [2, 8, 9, 6]) {
      await page
        .getByLabel('Seats', { exact: true })
        .selectOption(String(seats));
      await expect(main.locator('.seat')).toHaveCount(seats);
      await expect(main).toHaveAttribute('data-table-theme', theme);
    }
  }
  await page.getByRole('button', { name: 'Neon Night', exact: true }).click();
  await expect(page.getByLabel('Table theme', { exact: true })).toHaveValue(
    'neon-night',
  );
  await page
    .getByRole('button', { name: 'Flip community A', exact: true })
    .press('Enter');
  await expect(
    page.getByRole('button', { name: 'Flip community A', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByLabel('Table themes')
    .screenshot({ path: 'test-results/table-theme-gallery.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByLabel('Table themes')
    .screenshot({ path: 'test-results/table-theme-gallery-narrow.png' });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
  expect(errors).toEqual([]);
});

test('table material and shadow tokens override the themed artwork', async ({
  page,
}) => {
  await page.goto('/?tab=table#explore');
  await page
    .getByLabel('Table theme', { exact: true })
    .selectOption('neon-night');
  const table = page.locator('.table-preview > [data-table-theme]');
  await table.evaluate((el) => {
    (el as HTMLElement).style.setProperty('--table-felt', '#123456');
    (el as HTMLElement).style.setProperty('--table-line', '#abcdef');
    (el as HTMLElement).style.setProperty('--table-shadow', 'none');
  });
  await expect(
    table.locator('[data-table-layer="Felt"] > g > rect').first(),
  ).toHaveCSS('fill', 'rgb(18, 52, 86)');
  await expect(
    table.locator('[data-table-layer="Neon Betting Line"] > g > rect').last(),
  ).toHaveCSS('stroke', 'rgb(171, 205, 239)');
  const effects = table.locator('g[filter]');
  expect(await effects.count()).toBeGreaterThan(0);
  expect(
    await effects.evaluateAll((elements) =>
      elements.every((el) => getComputedStyle(el).filter === 'none'),
    ),
  ).toBe(true);
});
