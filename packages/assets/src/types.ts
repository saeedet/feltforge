import type { CourtRank, CourtStyle, JokerVariant } from '@feltforge/core';
export interface InlineAsset {
  readonly body: string;
  readonly viewBox: string;
}
export interface CourtArtwork {
  readonly style: CourtStyle;
  readonly cards: Readonly<Record<CourtRank, InlineAsset>>;
}
export interface JokerArtwork extends InlineAsset {
  readonly variant: JokerVariant;
}
