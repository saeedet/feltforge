import { Card, CardBack, ChipStack, PokerTable } from '../src/index.js';
import { persian } from '@feltforge/assets/courts/persian';
import { joker1 } from '@feltforge/assets/jokers/1';
void (<Card rank="A" suit="spades" />);
void (<Card rank="K" suit="hearts" court={persian} />);
void (<Card rank="joker" artwork={joker1} />);
void (<Card variant="compact" size="community" rank="K" suit="spades" />);
void (<Card variant="compact" size="hero" rank="10" suit="clubs" />);
// @ts-expect-error compact cards do not load court artwork
void (<Card variant="compact" rank="K" suit="spades" court={persian} />);
// @ts-expect-error compact cards are the 52 ordinary ranks, not Jokers
void (<Card variant="compact" rank="joker" artwork={joker1} />);
// @ts-expect-error compact presets are explicit approved sizes
void (<Card variant="compact" size="small" rank="A" suit="hearts" />);
// @ts-expect-error ordinary cards require a suit
void (<Card rank="A" />);
// @ts-expect-error Jokers have no suit
void (<Card rank="joker" suit="hearts" artwork={joker1} />);
// @ts-expect-error number cards have no court collection
void (<Card rank="7" suit="clubs" court={persian} />);
// @ts-expect-error face cards need an explicit, independently imported collection
void (<Card rank="K" suit="hearts" />);
// @ts-expect-error backs are independent from rank
void (<CardBack rank="A" />);
// @ts-expect-error stack representations are mutually exclusive
void (<ChipStack value={25} count={5} chips={[]} />);
// @ts-expect-error only approved table layouts exist
void (<PokerTable layout={7} />);
