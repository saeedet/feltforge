import { expect, test } from '@playwright/test';

const themes = [
  'classic',
  'midnight-racetrack',
  'royal-burgundy',
  'neon-night',
  'emerald-art-deco',
  'ocean-slate',
];

test('table layers keep seats above chips and chips above cards', async ({
  page,
}, info) => {
  await page.goto('/?tab=table#explore');
  const table = page.locator('.table-preview > [data-table-theme]');
  await table.evaluate((el) => {
    el.parentElement!.style.width = '280px';
    const root = el as HTMLElement;
    root.style.width = '280px';
    for (const overlay of el.querySelectorAll<HTMLElement>(
      '[data-table-overlay]',
    )) {
      overlay.style.visibility = 'hidden';
      overlay.style.left = '50%';
      overlay.style.top = '50%';
    }
    const seat = el.querySelector<HTMLElement>(
      '[data-seat-index="0"] [data-table-overlay="seat"]',
    )!;
    const bet = el.querySelector<HTMLElement>(
      '[data-seat-index="0"] [data-table-overlay="bet"]',
    )!;
    const cards = el.querySelector<HTMLElement>(
      '[data-table-overlay="community"]',
    )!;
    for (const node of [seat, bet, cards]) node.style.visibility = 'visible';
    cards.style.width = '100px';
    cards.style.transform = 'translate(-50%, -50%)';
    (cards.firstElementChild as HTMLElement).style.width = '100%';
    for (const card of Array.from(cards.children).slice(1))
      (card as HTMLElement).style.display = 'none';
  });
  await table.scrollIntoViewIfNeeded();
  await expect(table).toHaveCSS('isolation', 'isolate');
  for (const [kind, level] of [
    ['community', '1'],
    ['bet', '2'],
    ['pot', '2'],
    ['marker', '2'],
    ['seat', '3'],
  ])
    for (const node of await table
      .locator(`[data-table-overlay="${kind}"]`)
      .all())
      await expect(node).toHaveCSS('z-index', level!);
  const topLayer = () =>
    table.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return document
        .elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        ?.closest('[data-table-overlay]')
        ?.getAttribute('data-table-overlay');
    });
  expect(await topLayer()).toBe('seat');
  await table.screenshot({
    path: `test-results/table-layer-overlap-${info.project.name}.png`,
  });
  await table
    .locator('[data-seat-index="0"] [data-table-overlay="seat"]')
    .evaluate((el) => (el.style.visibility = 'hidden'));
  expect(await topLayer()).toBe('bet');
  await table
    .locator('[data-seat-index="0"] [data-table-overlay="bet"]')
    .evaluate((el) => (el.style.visibility = 'hidden'));
  expect(await topLayer()).toBe('community');

  for (const [selector, level] of [
    ['.surface-underlay', '0'],
    ['.surface-community', '1'],
    ['.surface-chips', '2'],
    ['.surface-player', '3'],
  ])
    for (const node of await page.locator(selector!).all())
      await expect(node).toHaveCSS('z-index', level!);
});

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
