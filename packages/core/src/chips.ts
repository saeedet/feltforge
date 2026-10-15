export const CHIP = {
  size: 64,
  center: 32,
  outerR: 32,
  insertInnerR: 24.5,
  ringOuterR: 22.5,
  fieldR: 20.5,
  insertCount: 8,
  insertSweep: 18,
  fontSize: 16,
  maxLabelWidth: 34,
  minSize: 32,
  stackOffset: { x: 3, y: -4 },
  stackDefaultCap: 5,
  rim: { width: 1, color: '#000000', opacity: 0.28 },
  /** @deprecated Previous Subtle preset; use contactShadows for the current design. */
  shadow: { x: 0, y: 2, blur: 2.5, opacity: 0.18 },
  contactShadows: [
    { x: 0, y: 1, blur: 1, opacity: 0.35 },
    { x: 0, y: 2, blur: 4, opacity: 0.25 },
  ],
} as const;
export type ChipPalette = Readonly<{
  base: string;
  insert: string;
  label: string;
}>;
export const CHIP_PALETTES = {
  1: { base: '#F2EFE6', insert: '#1F4E9C', label: '#1F2937' },
  5: { base: '#C62828', insert: '#F4F1EA', label: '#FFFFFF' },
  25: { base: '#2E7D32', insert: '#F4F1EA', label: '#FFFFFF' },
  100: { base: '#1E1F22', insert: '#F4F1EA', label: '#FFFFFF' },
  500: { base: '#6A3FA0', insert: '#F4F1EA', label: '#FFFFFF' },
  1000: { base: '#E3B23C', insert: '#1E1F22', label: '#1F2937' },
  5000: { base: '#7A4A2A', insert: '#F4F1EA', label: '#FFFFFF' },
} as const;
export const CUSTOM_CHIP_PALETTE: ChipPalette = {
  base: '#0C7A7C',
  insert: '#F4F1EA',
  label: '#FFFFFF',
};
export type ChipGroup = Readonly<{ value: number; count: number }>;
export function assertChipValue(value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER)
    throw new RangeError(
      'Chip value must be a finite non-negative safe number',
    );
}
export function formatChipValue(value: number): string {
  assertChipValue(value);
  return value >= 1000 && value % 1000 === 0
    ? `${value / 1000}K`
    : String(value);
}
export function getChipPalette(value: number): ChipPalette {
  assertChipValue(value);
  return {
    ...(CHIP_PALETTES[value as keyof typeof CHIP_PALETTES] ??
      CUSTOM_CHIP_PALETTE),
  };
}
/** Generate the approved annular insert; caller paints eight copies at 45° increments. */
export function chipInsertPath(index: number): string {
  if (!Number.isInteger(index) || index < 0 || index >= 8)
    throw new RangeError('Insert index must be 0–7');
  const point = (radius: number, degrees: number) => {
    const angle = (degrees * Math.PI) / 180;
    return `${Number((32 + radius * Math.cos(angle)).toFixed(6))} ${Number((32 + radius * Math.sin(angle)).toFixed(6))}`;
  };
  const angle = -90 + 45 * index,
    start = angle - 9,
    end = angle + 9;
  return `M${point(32, start)}A32 32 0 0 1 ${point(32, end)}L${point(24.5, end)}A24.5 24.5 0 0 0 ${point(24.5, start)}Z`;
}
/** Input groups are bottom-to-top. Capping retains the topmost chips without allocating the full count. */
export function getVisibleStack(groups: readonly ChipGroup[], maxVisible = 5) {
  if (!Number.isInteger(maxVisible) || maxVisible < 1 || maxVisible > 8)
    throw new RangeError('Visible chip cap must be 1–8');
  let count = 0,
    totalValue = 0;
  for (const group of groups) {
    assertChipValue(group.value);
    if (!Number.isSafeInteger(group.count) || group.count < 0)
      throw new RangeError('Chip count must be a non-negative safe integer');
    count += group.count;
    totalValue += group.value * group.count;
    if (
      !Number.isSafeInteger(count) ||
      !Number.isFinite(totalValue) ||
      totalValue > Number.MAX_SAFE_INTEGER
    )
      throw new RangeError('Stack exceeds safe numeric range');
  }
  const visible: Array<{ value: number; groupIndex: number }> = [];
  for (let i = groups.length - 1; i >= 0 && visible.length < maxVisible; i--) {
    const group = groups[i]!;
    const take = Math.min(group.count, maxVisible - visible.length);
    for (let j = 0; j < take; j++)
      visible.push({ value: group.value, groupIndex: i });
  }
  visible.reverse();
  const n = visible.length;
  return {
    count,
    totalValue,
    visible,
    width: n ? 64 + 3 * (n - 1) : 0,
    height: n ? 64 + 4 * (n - 1) : 0,
  };
}
