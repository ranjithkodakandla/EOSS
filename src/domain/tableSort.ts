export type SortDirection = 'asc' | 'desc';

export function compareSortValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function sortRows<T>(rows: T[], key: string, direction: SortDirection, value: (row: T, key: string) => unknown): T[] {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => multiplier * compareSortValues(value(a, key), value(b, key)));
}
