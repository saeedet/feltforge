import { expect, test } from '@playwright/test';

const themes = [
  'classic',
  'midnight-racetrack',
  'royal-burgundy',
  'neon-night',
  'emerald-art-deco',
  'ocean-slate',
];
for (const theme of themes)
  test(`${theme} adapts without stretching across four proportions`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/?tab=table#explore');
    await page.getByLabel('Table theme', { exact: true }).selectOption(theme);
    const surface = page.locator('.surface-underlay');
    for (const [preset, w, h, s] of [
      ['portrait', 334, 486, 0.57],
      ['landscape', 559.64, 262.66, 0.571],
      ['square', 460, 460, 1],
    ] as const) {
      await page
        .getByLabel('Surface example', { exact: true })
        .selectOption(preset);
      await expect(surface).toHaveAttribute('viewBox', `0 0 ${w} ${h}`);
      const rail = surface
        .locator('[data-table-layer="Outer Rail"] > g > rect')
        .first();
      await expect(rail).toHaveAttribute('width', String(w));
      await expect(rail).toHaveAttribute('height', String(h));
      await expect(rail).toHaveAttribute('rx', String(Math.min(w, h) / 2));
      const felt = surface
        .locator('[data-table-layer="Felt"] > g > rect')
        .first();
      expect(Number(await felt.getAttribute('width'))).toBeLessThan(w);
      expect(Number(await felt.getAttribute('height'))).toBeLessThan(h);
      const stroke = surface
        .locator('[data-table-layer="Outer Rail"] > g > rect')
        .last();
      expect(Number(await stroke.getAttribute('stroke-width'))).toBeCloseTo(
        (theme === 'ocean-slate'
          ? 1
          : ['midnight-racetrack', 'royal-burgundy'].includes(theme)
            ? 2
            : 1.5) *
          2 *
          s,
      );
      for (const circle of await surface.locator('ellipse').all()) {
        const box = await circle.boundingBox();
        expect(box!.width).toBeCloseTo(box!.height, 2);
      }
      for (const path of await surface
        .locator('[data-table-layer="Deco Chevron"]')
        .all()) {
        const matrix = await path.evaluate((el) => {
          const m = (el as SVGGraphicsElement).transform.baseVal.consolidate()!
            .matrix;
          return { a: m.a, b: m.b, c: m.c, d: m.d };
        });
        expect(matrix.a).toBeCloseTo(matrix.d, 6);
        expect(matrix.b).toBe(0);
        expect(matrix.c).toBe(0);
      }
      await page
        .getByRole('region', { name: 'Table surface proportions' })
        .locator('.surface-preview-frame')
        .screenshot({
          path: `test-results/surface-${theme}-${preset}-${info.project.name}.png`,
        });
    }
    await page.getByLabel('Surface width', { exact: true }).fill('725');
    await page.getByLabel('Surface height', { exact: true }).fill('355');
    await expect(surface).toHaveAttribute('viewBox', '0 0 725 355');
    const refs = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]'), (el) => el.id),
        missing: string[] = [];
      for (const el of document.querySelectorAll('svg *'))
        for (const attribute of [
          'fill',
          'filter',
          'clip-path',
          'href',
          'xlink:href',
        ]) {
          const value = el.getAttribute(attribute) ?? '';
          for (const match of value.matchAll(
            attribute.endsWith('href') ? /^#(.+)/g : /url\(#([^)"]+)/g,
          ))
            if (!ids.includes(match[1]!)) missing.push(match[1]!);
        }
      return { missing, unique: new Set(ids).size === ids.length };
    });
    expect(refs).toEqual({ missing: [], unique: true });
    expect(errors).toEqual([]);
  });

test('surface sizing responds to CSS without changing geometry or taking over consumer controls', async ({
  page,
}) => {
  await page.goto('/?tab=table#explore');
  await page
    .getByLabel('Surface example', { exact: true })
    .selectOption('portrait');
  const surface = page.locator('.surface-underlay'),
    player = page.getByRole('button', { name: 'Player 1', exact: true });
  await player.click();
  await expect(player).toHaveAttribute('aria-pressed', 'true');
  const before = await surface.evaluate((el) => el.outerHTML);
  await page.setViewportSize({ width: 390, height: 844 });
  const small = await surface.boundingBox();
  await page.setViewportSize({ width: 1100, height: 800 });
  const large = await surface.boundingBox();
  expect(small!.width).toBeLessThan(large!.width);
  expect(small!.width / small!.height).toBeCloseTo(334 / 486, 3);
  expect(large!.width / large!.height).toBeCloseTo(334 / 486, 3);
  expect(await surface.evaluate((el) => el.outerHTML)).toBe(before);
  await page.getByLabel('Surface detail scale', { exact: true }).fill('0.6');
  await expect(
    surface.locator('[data-table-layer="Rail Stitching"] > g > rect').last(),
  ).toHaveAttribute('stroke-dasharray', '6 6');
  await expect(surface.locator('feGaussianBlur').first()).toHaveAttribute(
    'stdDeviation',
    '9',
  );
  await surface.evaluate((el) => {
    el.style.setProperty('--table-felt', '#123456');
    el.style.setProperty('--table-shadow', 'none');
  });
  await expect(
    surface.locator('[data-table-layer="Felt"] > g > rect').first(),
  ).toHaveCSS('fill', 'rgb(18, 52, 86)');
  expect(
    await surface
      .locator('g[filter]')
      .evaluateAll((nodes) =>
        nodes.every((n) => getComputedStyle(n).filter === 'none'),
      ),
  ).toBe(true);
});
