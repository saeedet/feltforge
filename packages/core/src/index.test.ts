import { describe, expect, it } from 'vitest';
import { isRank, isSuit } from './index.js';

describe('public card input validation', () => {
  it.each(['A', '2', '10', 'J', 'Q', 'K'])(
    'accepts canonical rank %s',
    (rank) => {
      expect(isRank(rank)).toBe(true);
    },
  );
  it.each([null, undefined, 10, '1', '11', 'a', 'joker', {}, ['A']])(
    'rejects invalid rank %j',
    (rank) => {
      expect(isRank(rank)).toBe(false);
    },
  );
  it.each(['hearts', 'diamonds', 'clubs', 'spades'])(
    'accepts canonical suit %s',
    (suit) => {
      expect(isSuit(suit)).toBe(true);
    },
  );
  it.each([null, undefined, 'heart', 'Spades', 'joker', 0, {}])(
    'rejects invalid suit %j',
    (suit) => {
      expect(isSuit(suit)).toBe(false);
    },
  );
});
