import { Card, OrderingStrategy } from '../types';

/**
 * Calculates a new position for a card inserted between prevPos and nextPos.
 */
export function calculatePosition(
  prevPos: number | null,
  nextPos: number | null,
  strategy: OrderingStrategy = 'fractional'
): { newPos: number; requiresReindex: boolean } {
  if (strategy === 'integer_reindex') {
    // Under integer re-indexing, we temporarily assign a fractional or target order,
    // then reindex all items in column to 1, 2, 3...
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
    if (newPos < 0.0001) requiresReindex = true;
  } else if (prevPos !== null && nextPos === null) {
    // Inserted at bottom
    newPos = prevPos + 1.0;
  } else if (prevPos !== null && nextPos !== null) {
    // Inserted between two items
    newPos = (prevPos + nextPos) / 2;
    // Check if floating point precision gap is getting too small (~50 insertions under same gap)
    if (Math.abs(nextPos - prevPos) < 0.0001) {
      requiresReindex = true;
    }
  } else {
    newPos = 1.0;
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

/**
 * Educational text for defense of the ordering strategy
 */
export const ORDERING_DEFENSE_INFO = {
  title: 'Захист курсової / лабораторної: Алгоритм індексування позицій (Position Indexing)',
  questions: [
    {
      question: '1. Чому обрано дробне індексування (Fractional Indexing)?',
      answer:
        'Дробне індексування дозволяє вставляти картку між двома іншими (наприклад, між 1.0 та 2.0 отримуємо 1.5) за O(1) часу. На відміну від послідовного переіменування всієї колонки, при дробовому індексуванні оновлюється лише ЄДИНА картка, яку перетягнули, що економить бандвідч і записи в базу даних.',
    },
    {
      question: '2. Що станеться після 50 вставок підряд в одну й ту саму позицію?',
      answer:
        'При кожній вставці між парами відстань зменшується вдвічі: 1/2, 1/4, 1/8... 1/2^50 ≈ 8.88 × 10^-16. Досягається ліміт точності чисел з плаваючою крапкою (IEEE 754 64-bit float mantissa = 53 біти precision limit). У наш алгоритм вбудовано Auto-Normalization (автоматичне переіндексування): коли дельта між сусідами менше 0.0001, система автоматично скидає позиції колонки назад до чистих цілих чисел 1, 2, 3..., запобігаючи колізіям!',
    },
    {
      question: '3. Які є альтернативні підходи?',
      answer:
        '• Послідовне переіндексування цілими числами (Integer Re-indexing 1, 2, 3... N): вимагає оновлення N карток при кожній зміні.\n• Лексикографічне рядкове індексування (Lexicographical String Indexing, напр., "a", "am", "b" як у Trello/Figma): замість чисел використовуються рядки, де між "a" та "b" вставляється "am". Після 50 вставок довжина рядка виросте до 50 символів, після чого також виконується ребалансування.',
    },
  ],
};
