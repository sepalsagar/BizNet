import { describe, it, expect } from 'vitest';

// Helper function implementing the exact date-filtering logic of AnalyticsView
function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface TestOrder {
  id: string;
  date: string;
  status: string;
  totalAmount: number;
}

function filterOrdersForAnalytics(
  orders: TestOrder[],
  timeframe: '7d' | '14d' | '30d',
  mockNow: Date
): TestOrder[] {
  const active = orders.filter((o) => o.status !== 'cancelled');
  if (timeframe === '30d') {
    return active;
  }
  const days = timeframe === '7d' ? 7 : 14;
  const todayStr = formatLocalDate(mockNow);
  const cutoff = new Date(mockNow);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffStr = formatLocalDate(cutoff);

  return active.filter((o) => o.date >= cutoffStr && o.date <= todayStr);
}

describe('Analytics Date Filtering & Timeframe Constraints', () => {
  const fixedNow = new Date(2026, 8, 15); // Sept 15, 2026 (Month is 0-indexed: 8 = Sept)
  const todayStr = '2026-09-15';
  const cutoff7d = '2026-09-09'; // 15 - 6 = 9
  const beforeCutoff7d = '2026-09-08';
  const cutoff14d = '2026-09-02'; // 15 - 13 = 2
  const beforeCutoff14d = '2026-09-01';
  const futureDate = '2026-09-16';
  const oldHistoricalDate = '2026-08-10';

  const testOrders: TestOrder[] = [
    { id: 'o-today', date: todayStr, status: 'completed', totalAmount: 100 },
    { id: 'o-today-cancelled', date: todayStr, status: 'cancelled', totalAmount: 100 },
    { id: 'o-7d-boundary', date: cutoff7d, status: 'processing', totalAmount: 200 },
    { id: 'o-7d-before', date: beforeCutoff7d, status: 'completed', totalAmount: 150 },
    { id: 'o-14d-boundary', date: cutoff14d, status: 'completed', totalAmount: 250 },
    { id: 'o-14d-before', date: beforeCutoff14d, status: 'completed', totalAmount: 300 },
    { id: 'o-future', date: futureDate, status: 'completed', totalAmount: 400 },
    { id: 'o-old', date: oldHistoricalDate, status: 'completed', totalAmount: 500 },
  ];

  it('7 Days timeframe includes today and exact cutoff boundary, but excludes earlier, future, and cancelled orders', () => {
    const result = filterOrdersForAnalytics(testOrders, '7d', fixedNow);
    const ids = result.map((o) => o.id);

    expect(ids).toContain('o-today');
    expect(ids).toContain('o-7d-boundary');
    expect(ids).not.toContain('o-today-cancelled');
    expect(ids).not.toContain('o-7d-before');
    expect(ids).not.toContain('o-14d-boundary');
    expect(ids).not.toContain('o-future');
    expect(ids).not.toContain('o-old');
    expect(result).toHaveLength(2);
  });

  it('14 Days timeframe includes today, 7d boundary, and exact 14d cutoff boundary', () => {
    const result = filterOrdersForAnalytics(testOrders, '14d', fixedNow);
    const ids = result.map((o) => o.id);

    expect(ids).toContain('o-today');
    expect(ids).toContain('o-7d-boundary');
    expect(ids).toContain('o-7d-before');
    expect(ids).toContain('o-14d-boundary');
    expect(ids).not.toContain('o-today-cancelled');
    expect(ids).not.toContain('o-14d-before');
    expect(ids).not.toContain('o-future');
    expect(ids).not.toContain('o-old');
    expect(result).toHaveLength(4);
  });

  it('Full Range (30d) includes all historical active orders and excludes cancelled orders', () => {
    const result = filterOrdersForAnalytics(testOrders, '30d', fixedNow);
    const ids = result.map((o) => o.id);

    expect(ids).toContain('o-today');
    expect(ids).toContain('o-7d-boundary');
    expect(ids).toContain('o-7d-before');
    expect(ids).toContain('o-14d-boundary');
    expect(ids).toContain('o-14d-before');
    expect(ids).toContain('o-future');
    expect(ids).toContain('o-old');
    expect(ids).not.toContain('o-today-cancelled');
    expect(result).toHaveLength(7);
  });

  it('formatLocalDate correctly pads single-digit months and days without UTC offset shift', () => {
    const testDate = new Date(2026, 0, 5); // Jan 5, 2026
    expect(formatLocalDate(testDate)).toBe('2026-01-05');
  });
});
