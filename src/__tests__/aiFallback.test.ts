import { describe, expect, it } from 'vitest';
import { generateFallbackResponse, FallbackBusinessContext } from '../utils/aiFallback';

const context: FallbackBusinessContext = {
  totalRevenue: 125000,
  grossProfit: 42000,
  grossMarginPct: 33.6,
  targetMarginPct: 45,
  recentOrdersCount: 24,
  customersCount: 12,
  suppliersCount: 4,
  products: [
    { id: 'p-1', name: 'Rice 5kg', stock: 5, reorderPoint: 10, costPrice: 400, sellingPrice: 520, salesCount: 80 },
    { id: 'p-2', name: 'Cooking Oil 1L', stock: 0, reorderPoint: 8, costPrice: 120, sellingPrice: 180, salesCount: 65 },
    { id: 'p-3', name: 'Steel Tiffin', stock: 40, reorderPoint: 10, costPrice: 300, sellingPrice: 600, salesCount: 25 },
  ],
  customerSummary: {
    totalSpent: 250000,
    repeatCustomerRate: 41.5,
  },
};

describe('AI Advisor fallback', () => {
  it('answers a revenue question with INR formatting', () => {
    const result = generateFallbackResponse('What is my total revenue?', context);

    expect(result.message).toContain('₹1,25,000');
    expect(result.message).toContain('24 orders');
  });

  it('lists actual low-stock products', () => {
    const result = generateFallbackResponse('Which products are low on stock?', context);

    expect(result.message).toContain('Rice 5kg');
    expect(result.message).not.toContain('Steel Tiffin');
  });

  it('identifies the highest-margin product', () => {
    const result = generateFallbackResponse('Which products have the best margins?', context);

    expect(result.message).toContain('Steel Tiffin');
    expect(result.message).toContain('50.0% margin');
  });

  it('recommends products for reorder', () => {
    const result = generateFallbackResponse('Should I reorder anything?', context);

    expect(result.message).toContain('Rice 5kg');
    expect(result.message).toContain('Cooking Oil 1L');
  });

  it('summarizes business health from supplied metrics', () => {
    const result = generateFallbackResponse('How is my business doing?', context);

    expect(result.message).toContain('₹1,25,000');
    expect(result.message).toContain('33.6%');
    expect(result.message).toContain('review margins below target');
  });

  it('uses privacy-safe customer aggregates without inventing names', () => {
    const result = generateFallbackResponse('Who are my best customers?', context);

    expect(result.message).toContain('12 customers');
    expect(result.message).toContain('₹2,50,000');
    expect(result.message).toContain('does not receive customer names');
  });

  it('uses history for a reorder follow-up question', () => {
    const result = generateFallbackResponse(
      'Which one should I reorder first?',
      context,
      [{ role: 'user', content: 'Which products are low on stock?' }, { role: 'model', content: 'Rice 5kg is low stock.' }],
    );

    expect(result.message).toContain('Rice 5kg');
  });

  it('does not turn unsupported questions into a generic business overview', () => {
    const result = generateFallbackResponse('What is the weather tomorrow?', context);

    expect(result.message).toContain('do not currently have enough information');
    expect(result.message).not.toContain('Strategic Business Assessment');
  });
});
