import { Card, OrderingStrategy } from '../types';

export const MIN_POSITION_GAP = 0.0001;

/**
 * Calculates a new position for a card inserted between prevPos and nextPos.
 */
export function calculatePosition(
  prevPos: number | null,
  nextPos: number | null,
  strategy: OrderingStrategy = 'fractional'
): { newPos: number; requiresReindex: boolean } {
  if (strategy === 'integer_reindex') {
    const pos = prevPos === null ? 1 : prevPos + 1;
    return { newPos: pos, requiresReindex: true };
  }

  // Fractional Indexing algorithm
  let newPos: number;
  let requiresReindex = false;

  if (prevPos === null && nextPos === null) {
    // First card in column
    newPos = 1.0;
  } else if (prevPos === null && nextPos !== null) {
    // Inserted at top
    newPos = nextPos / 2;
    if (newPos < MIN_POSITION_GAP) requiresReindex = true;
  } else if (prevPos !== null && nextPos === null) {
    // Inserted at bottom
    newPos = prevPos + 1.0;
  } else {
    // Inserted between two items (prevPos !== null && nextPos !== null)
    newPos = (prevPos! + nextPos!) / 2;
    if (Math.abs(nextPos! - prevPos!) < MIN_POSITION_GAP) {
      requiresReindex = true;
    }
  }

  return { newPos, requiresReindex };
}

/**
 * Normalizes/Reindexes cards in a column so positions are neat integers 1, 2, 3...
 */
export function reindexColumnCards(cards: Card[]): Card[] {
  const sorted = [...cards].sort((a, b) => a.position - b.position);
  return sorted.map((card, index) => ({
    ...card,
    position: index + 1,
  }));
}