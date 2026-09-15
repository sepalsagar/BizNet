import { formatIndianCurrency } from './formatters';

export interface FallbackProduct {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  costPrice?: number;
  sellingPrice?: number;
  salesCount?: number;
  supplierName?: string;
}

export interface FallbackBusinessContext {
  totalRevenue?: number;
  grossProfit?: number;
  grossMarginPct?: number;
  targetMarginPct?: number;
  totalProducts?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  topLowStock?: FallbackProduct[];
  products?: FallbackProduct[];
  recentOrdersCount?: number;
  customersCount?: number;
  suppliersCount?: number;
  customerSummary?: {
    totalSpent?: number;
    repeatCustomerRate?: number;
    vipCount?: number;
    wholesaleCount?: number;
  };
  supplierSummary?: {
    totalPurchases?: number;
    activePurchaseOrders?: number;
    receivedPurchaseOrders?: number;
  };
}

export interface FallbackHistoryMessage {
  role?: string;
  content?: string;
}

const money = (value: number | undefined): string => formatIndianCurrency(Number(value || 0));

const listNames = (products: FallbackProduct[]): string =>
  products.map(product => `- **${product.name}** (${product.stock} units; reorder at ${product.reorderPoint})`).join('\n');

const hasAny = (query: string, terms: string[]): boolean => terms.some(term => query.includes(term));

const hasFollowUpContext = (query: string, history: FallbackHistoryMessage[]): boolean => {
  if (!/\b(which one|which should|that one|it|first)\b/.test(query)) return false;
  return history.some(message => /low stock|out of stock|reorder|restock/i.test(message.content || ''));
};

export function generateFallbackResponse(
  query: string,
  context: FallbackBusinessContext = {},
  history: FallbackHistoryMessage[] = [],
): { message: string; suggestedActions: string[] } {
  const normalizedQuery = (query || '').trim().toLowerCase();
  const products = context.products || context.topLowStock || [];
  const lowStockProducts = products.filter(product => product.stock > 0 && product.stock <= product.reorderPoint);
  const outOfStockProducts = products.filter(product => product.stock <= 0);
  const followUpReorder = hasFollowUpContext(normalizedQuery, history);

  if (hasAny(normalizedQuery, ['low stock', 'low on stock', 'out of stock', 'stockout', 'inventory', 'reorder', 'restock']) || followUpReorder) {
    const relevantProducts = normalizedQuery.includes('out of stock')
      ? outOfStockProducts
      : normalizedQuery.includes('low stock') || followUpReorder
        ? lowStockProducts
        : [...outOfStockProducts, ...lowStockProducts];

    return {
      message: relevantProducts.length > 0
        ? `### Inventory Priorities\n\n${listNames(relevantProducts)}\n\n${outOfStockProducts.length > 0 ? `**${outOfStockProducts.length} product(s) are out of stock.**` : 'No products are currently out of stock.'}`
        : `### Inventory Priorities\n\n${context.outOfStockCount || 0} out-of-stock product(s) and ${context.lowStockCount || 0} product(s) at or below their reorder points are reported in the supplied context. Product-level details are not available for this request.`,
      suggestedActions: ['Review inventory valuation', 'Open Purchase Orders', 'Check product margins'],
    };
  }

  if (hasAny(normalizedQuery, ['revenue', 'sales total', 'sales volume', 'turnover'])) {
    return {
      message: `### Revenue Summary\n\nYour recorded revenue is **${money(context.totalRevenue)}** across **${context.recentOrdersCount || 0} orders**.`,
      suggestedActions: ['Review gross profit', 'Compare sales channels', 'Check business health'],
    };
  }

  if (hasAny(normalizedQuery, ['gross profit', 'profit amount', 'profit summary'])) {
    return {
      message: `### Gross Profit Summary\n\nRecorded gross profit is **${money(context.grossProfit)}**, with a current gross margin of **${Number(context.grossMarginPct || 0).toFixed(1)}%**.`,
      suggestedActions: ['Find best-margin products', 'Review pricing', 'Check discount impact'],
    };
  }

  if (hasAny(normalizedQuery, ['margin', 'pricing', 'best product', 'best margin'])) {
    const rankedProducts = products
      .filter(product => typeof product.costPrice === 'number' && typeof product.sellingPrice === 'number' && product.sellingPrice > 0)
      .map(product => ({
        ...product,
        marginPct: ((product.sellingPrice! - product.costPrice!) / product.sellingPrice!) * 100,
      }))
      .sort((left, right) => right.marginPct - left.marginPct)
      .slice(0, 5);

    return {
      message: rankedProducts.length > 0
        ? `### Product Margin Leaders\n\n${rankedProducts.map(product => `- **${product.name}**: ${product.marginPct.toFixed(1)}% margin (${money(product.sellingPrice)} selling price, ${money(product.costPrice)} cost)`).join('\n')}`
        : `### Product Margin Leaders\n\nCurrent overall gross margin is **${Number(context.grossMarginPct || 0).toFixed(1)}%**. Product cost and selling-price data is not available in the current context.`,
      suggestedActions: ['Review low-margin products', 'Open Pricing Simulator', 'Check discount impact'],
    };
  }

  if (hasAny(normalizedQuery, ['customer', 'retention', 'repeat purchase', 'best client'])) {
    const summary = context.customerSummary;
    return {
      message: summary
        ? `### Customer Summary\n\nBizPilot currently tracks **${context.customersCount || 0} customers**. Recorded customer spend is **${money(summary.totalSpent)}**, with a repeat-customer rate of **${Number(summary.repeatCustomerRate || 0).toFixed(1)}%**. The fallback does not receive customer names or contact details, so it cannot safely rank individual customers.`
        : '### Customer Summary\n\nBizPilot currently tracks **${context.customersCount || 0} customers**. Individual customer rankings are not available in the supplied privacy-safe context.',
      suggestedActions: ['Review customer retention', 'Analyze revenue', 'Open Customers'],
    };
  }

  if (hasAny(normalizedQuery, ['supplier', 'vendor', 'purchase order', 'procurement'])) {
    const summary = context.supplierSummary;
    return {
      message: summary
        ? `### Supplier Summary\n\nBizPilot tracks **${context.suppliersCount || 0} suppliers** and **${summary.activePurchaseOrders || 0} active purchase orders**. Recorded supplier purchases total **${money(summary.totalPurchases)}**.`
        : `### Supplier Summary\n\nBizPilot currently tracks **${context.suppliersCount || 0} suppliers**. Detailed supplier and purchase-order metrics are not available in the supplied context.`,
      suggestedActions: ['Review Purchase Orders', 'Check inventory priorities', 'Analyze business health'],
    };
  }

  if (hasAny(normalizedQuery, ['discount', 'promotion', 'promo'])) {
    return {
      message: `### Promotion Guidance\n\nThe supplied context includes revenue and margin metrics, but it does not include campaign-level elasticity or discount history. Use the Discount Optimizer to test a promotion against current product economics.`,
      suggestedActions: ['Open Discount Optimizer', 'Review product margins', 'Check gross profit'],
    };
  }

  if (hasAny(normalizedQuery, ['how is my business', 'business health', 'doing', 'performance', 'overview', 'focus', 'recommend'])) {
    const priorities = [
      outOfStockProducts.length > 0 ? `address ${outOfStockProducts.length} out-of-stock product(s)` : '',
      lowStockProducts.length > 0 ? `reorder ${lowStockProducts.length} low-stock product(s)` : '',
      typeof context.grossMarginPct === 'number' && context.grossMarginPct < (context.targetMarginPct || 0) ? 'review margins below target' : '',
    ].filter(Boolean);
    return {
      message: `### Business Health Summary\n\nRevenue is **${money(context.totalRevenue)}**, gross profit is **${money(context.grossProfit)}**, and gross margin is **${Number(context.grossMarginPct || 0).toFixed(1)}%** across **${context.recentOrdersCount || 0} orders**.\n\n**Priority focus:** ${priorities.length > 0 ? priorities.join('; ') + '.' : 'No urgent risk is visible in the supplied metrics.'}`,
      suggestedActions: ['Review inventory priorities', 'Find best-margin products', 'Analyze customer retention'],
    };
  }

  return {
    message: 'I can analyze BizPilot sales, inventory, customers, suppliers, pricing, and profitability data. I do not currently have enough information to answer that specific question. Try asking about total revenue, low-stock products, product margins, reorder priorities, customer retention, or business health.',
    suggestedActions: ['Ask for a revenue summary', 'Ask which products need reorder', 'Ask for a business health summary'],
  };
}
