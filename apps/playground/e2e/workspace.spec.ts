import { expect, test } from '@playwright/test';
test('compact cards preserve approved sizes, flip independently and share overridable shadows', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('All 52 cards').check();
  const gallery = page.locator('.compact-gallery');
  await expect(gallery.locator('.flip-card')).toHaveCount(52);
  for (const [size, width, height] of [
    ['community', 38, 53],
    ['hero', 50, 70],
  ] as const) {
    await page.getByLabel('Compact size', { exact: true }).selectOption(size);
    const front = gallery.locator('.flip-card__face--front > svg').first();
    await expect(front).toHaveAttribute('viewBox', `0 0 ${width} ${height}`);
    await expect(front).toHaveCSS('width', `${width}px`);
    await expect(front).toHaveCSS('height', `${height}px`);
    await expect(gallery.locator('text,image')).toHaveCount(0);
  }
  const king = page.getByRole('button', {
    name: 'Flip compact K of spades',
    exact: true,
  });
  await king.press('Enter');
  await expect(king).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: 'Flip compact Q of spades', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  const fronts = page.locator(
    '.gallery .flip-card__face--front, .compact-gallery .flip-card__face--front',
  );
  expect(
    await fronts.first().evaluate((el) => getComputedStyle(el).boxShadow),
  ).toContain('rgba(0, 0, 0, 0.25)');
  await page.getByLabel('Card shadow', { exact: true }).selectOption('none');
  expect(
    await fronts.evaluateAll((cards) =>
      cards.every((el) => getComputedStyle(el).boxShadow === 'none'),
    ),
  ).toBe(true);
  await page.getByLabel('Card shadow', { exact: true }).selectOption('custom');
  await page
    .getByLabel('Custom card shadow', { exact: true })
    .fill('0 3px 9px rgba(20, 40, 60, 0.5)');
  expect(
    await fronts.first().evaluate((el) => getComputedStyle(el).boxShadow),
  ).toContain('rgba(20, 40, 60, 0.5)');
  await page.getByLabel('Card shadow', { exact: true }).selectOption('design');
  await page
    .getByLabel('Compact size', { exact: true })
    .selectOption('community');
  await page
    .locator('.compact-lab')
    .screenshot({ path: 'test-results/compact-desktop.png' });
  await page.getByLabel('Magnification', { exact: true }).selectOption('4');
  await page
    .locator('.compact-samples')
    .screenshot({ path: 'test-results/compact-closeup.png' });
  await page.getByLabel('Magnification', { exact: true }).selectOption('1');
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator('.compact-lab')
    .screenshot({ path: 'test-results/compact-mobile.png' });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
});
test('cards flip independently, all styles load, and every ordinary card is reachable', async ({
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
    .getByRole('button', { name: 'Flip 7 of hearts', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Flip 7 of hearts', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  for (const style of ['western', 'eastern', 'persian']) {
    await page.getByLabel('Court collection').selectOption(style);
    await expect(
      page.getByRole('img', { name: 'Jack of Hearts' }),
    ).toBeVisible();
  }
  await page.getByLabel('All 52 cards').check();
  await expect(page.locator('.gallery > .flip-card')).toHaveCount(52);
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
  const backsFit = await page
    .locator('.community-card .flip-card__face--back > svg')
    .evaluateAll((backs) =>
      backs.every((back) => {
        const frame = back.closest('.flip-card')!;
        const a = getComputedStyle(back),
          b = getComputedStyle(frame);
        return (
          Math.abs(parseFloat(a.width) - parseFloat(b.width)) < 0.1 &&
          Math.abs(parseFloat(a.height) - parseFloat(b.height)) < 0.1
        );
      }),
    );
  expect(backsFit).toBe(true);
  await expect(
    page.getByRole('group', { name: '9-seat poker table' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Dealer button' }),
  ).toHaveAttribute('width', '40');
  await page.screenshot({ path: 'test-results/table-500.png', fullPage: true });
});
test('mobile gallery stays within the viewport and cards flip by keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(
    page.locator('.gallery').getByRole('img', { name: 'Seven of Hearts' }),
  ).toBeVisible();
  const card = page.getByRole('button', {
    name: 'Flip 7 of hearts',
    exact: true,
  });
  await card.focus();
  await expect(card).toHaveCSS('outline-style', 'none');
  await page.keyboard.press('Enter');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  const heroCards = page.locator(
    '.hero-back > svg, .hero-ace > svg, .hero-court > svg',
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const sizes = await heroCards.evaluateAll((cards) =>
      cards.map((card) => {
        const style = getComputedStyle(card);
        const bounds = card.getBoundingClientRect();
        return {
          width: parseFloat(style.width),
          height: parseFloat(style.height),
          left: bounds.left,
          right: bounds.right,
        };
      }),
    );
    expect(sizes).toHaveLength(3);
    for (const size of sizes) {
      expect(size.width).toBeGreaterThan(0);
      expect(size.width).toBeCloseTo(sizes[0]!.width, 1);
      expect(size.width / size.height).toBeCloseTo(5 / 7, 2);
      expect(size.left).toBeGreaterThanOrEqual(0);
      expect(size.right).toBeLessThanOrEqual(width + 1);
    }
  }
  await page.locator('.hero').screenshot({ path: 'test-results/hero-320.png' });
});

test('flip preview supports clicks, keyboard controls and external face controls', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.getByRole('button', {
    name: 'Flip King of hearts',
    exact: true,
  });
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await card.click();
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await expect(card.locator('.flip-card__face--front')).toHaveAttribute(
    'inert',
    '',
  );
  await card.press('Enter');
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await card.press('Space');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Show face', exact: true }).click();
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await expect(card.locator('.flip-card__face--back')).toHaveAttribute(
    'inert',
    '',
  );
  await expect(page.getByRole('status')).toHaveText('King of hearts');
});

test('flip preview tilts on hover and follows a pointer drag before springing to the back', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.getByRole('button', {
    name: 'Flip King of hearts',
    exact: true,
  });
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width - 25, box.y + 30);
  await expect
    .poll(() =>
      card.locator('.flip-card__rotor').evaluate((el) => {
        const matrix = new DOMMatrix(getComputedStyle(el).transform);
        return Math.abs(matrix.m13) + Math.abs(matrix.m23);
      }),
    )
    .toBeGreaterThan(0.02);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 70, y, { steps: 8 });
  await expect(card).toHaveAttribute('data-dragging', '');
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await page.mouse.move(x + 160, y, { steps: 8 });
  // Pause only to distinguish a positional drag from velocity-driven flicking.
  await page.waitForTimeout(100);
  await page.mouse.up();
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await expect(card).not.toHaveAttribute('data-dragging', '');
  await expect
    .poll(() =>
      card
        .locator('.flip-card__rotor')
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m11),
    )
    .toBeLessThan(-0.99);
  await page.getByRole('button', { name: 'Show face', exact: true }).click();
  await expect
    .poll(() =>
      card
        .locator('.flip-card__rotor')
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m11),
    )
    .toBeGreaterThan(0.99);
  await page
    .locator('.flip-lab')
    .screenshot({ path: 'test-results/flip-card.png' });
});

test('flip preview respects reduced motion while remaining operable on mobile', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const card = page.getByRole('button', {
    name: 'Flip King of hearts',
    exact: true,
  });
  await expect(card).toHaveAttribute('data-fade', 'front');
  await expect(card).not.toHaveAttribute('data-draggable', '');
  await card.click();
  await expect(card).toHaveAttribute('data-fade', 'back');
  await expect(card.locator('.flip-card__rotor')).toHaveCSS(
    'transform',
    'none',
  );
  await expect(card.locator('.flip-card__face--back')).toHaveCSS(
    'transition-duration',
    '0s',
  );
  await expect(card.locator('.flip-card__face--back')).toHaveCSS(
    'opacity',
    '1',
  );
  await card.press('Enter');
  await expect(card).toHaveAttribute('data-fade', 'front');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
  await page
    .locator('.flip-lab')
    .screenshot({ path: 'test-results/flip-card-mobile.png' });
});

test('a short flick crosses to the back using release velocity', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.getByRole('button', {
    name: 'Flip King of hearts',
    exact: true,
  });
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  // 60px is less than the 110px positional halfway threshold. Release momentum must finish the flip.
  await page.mouse.move(x + 60, y, { steps: 6 });
  // Release immediately: an assertion here pauses past the 60ms flick window.
  await page.mouse.up();
  await expect(card).toHaveAttribute('aria-pressed', 'true');
});

test('gallery, special and table cards share motion while the hero stays static', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('All 52 cards').check();
  await expect(
    page.locator('.gallery > .flip-card[data-draggable]'),
  ).toHaveCount(52);
  await expect(page.locator('.special-cards > .flip-card')).toHaveCount(3);
  await expect(page.locator('.hero-art .flip-card')).toHaveCount(0);
  await expect(
    page.locator('.hero-back > svg, .hero-ace > svg, .hero-court > svg'),
  ).toHaveCount(3);
  const seven = page.getByRole('button', {
    name: 'Flip 7 of hearts',
    exact: true,
  });
  await seven.focus();
  await expect(seven).toHaveCSS('outline-style', 'none');
  await seven.press('Enter');
  await expect(seven).toHaveAttribute('aria-pressed', 'true');
  await expect(seven).toHaveCSS('outline-style', 'none');
  await expect(
    page.getByRole('button', { name: 'Flip 8 of hearts', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  for (const name of ['Flip Joker 1', 'Flip Joker 2', 'Flip Classic back']) {
    const card = page.getByRole('button', { name, exact: true });
    const before = await card.getAttribute('aria-pressed');
    await card.press('Enter');
    await expect(card).toHaveAttribute(
      'aria-pressed',
      before === 'true' ? 'false' : 'true',
    );
    await expect(card).toHaveCSS('outline-style', 'none');
  }
  await page.getByRole('button', { name: 'Poker table' }).click();
  const table = page.getByRole('group', { name: '6-seat poker table' });
  await expect(table.locator('.community-card[data-draggable]')).toHaveCount(5);
  const hidden = page.getByRole('button', {
    name: 'Flip hidden community K',
    exact: true,
  });
  await expect(hidden).toHaveAttribute('aria-pressed', 'true');
  await hidden.press('Enter');
  await expect(hidden).toHaveAttribute('aria-pressed', 'false');
  // Cards outside the decorative hero use the interactive wrapper.
  expect(
    await page
      .locator('svg[viewBox="0 0 250 350"]')
      .evaluateAll((cards) =>
        cards
          .filter((card) => !card.closest('.hero-art'))
          .every((card) => card.closest('.flip-card')),
      ),
  ).toBe(true);
  await page.getByLabel('Table width', { exact: true }).fill('500');
  const bounds = (await hidden.boundingBox())!;
  expect(bounds.width / bounds.height).toBeCloseTo(5 / 7, 2);
});
