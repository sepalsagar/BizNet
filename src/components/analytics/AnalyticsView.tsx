import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Layers,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { useBusiness } from '../../context/BusinessContext';

type TimeframeOption = '7d' | '14d' | '30d';

export const AnalyticsView: React.FC = () => {
  const { 
    products, 
    orders, 
    formatCurrency, 
    formatPercent,
    settings 
  } = useBusiness();

  // Local timeframe state for Analytics
  const [timeframe, setTimeframe] = useState<TimeframeOption>('14d');

  // Helper to format a local Date object into YYYY-MM-DD without UTC shift
  const formatLocalDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter active orders based on selected timeframe
  const filteredActiveOrders = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'cancelled');
    if (timeframe === '30d') {
      return active;
    }
    const days = timeframe === '7d' ? 7 : 14;
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const cutoffStr = formatLocalDate(cutoff);
    
    return active.filter((o) => o.date >= cutoffStr && o.date <= todayStr);
  }, [orders, timeframe]);

  // Aggregate financial metrics for the selected timeframe
  const periodRevenue = useMemo(() => {
    return filteredActiveOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [filteredActiveOrders]);

  const periodCost = useMemo(() => {
    return filteredActiveOrders.reduce((sum, o) => sum + o.totalCost, 0);
  }, [filteredActiveOrders]);

  const periodProfit = useMemo(() => {
    return periodRevenue - periodCost;
  }, [periodRevenue, periodCost]);

  const periodMarginPct = useMemo(() => {
    return periodRevenue > 0 ? (periodProfit / periodRevenue) * 100 : 0;
  }, [periodRevenue, periodProfit]);

  // Channel breakdown calculated from timeframe-filtered active orders
  const channelBreakdown = useMemo(() => {
    const channels = ['Online', 'In-Store', 'Wholesale', 'B2B'] as const;
    return channels.map(channel => {
      const channelOrders = filteredActiveOrders.filter(o => o.channel === channel);
      const revenue = channelOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const profit = channelOrders.reduce((sum, o) => sum + o.grossProfit, 0);
      return {
        channel,
        revenue,
        profit,
        ordersCount: channelOrders.length,
        marginPct: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    });
  }, [filteredActiveOrders]);

  // Category breakdown calculated from timeframe-filtered active orders
  const categoryBreakdown = useMemo(() => {
    const cats = new Map<string, { revenue: number; cost: number; profit: number; itemCount: number; stockCount: number }>();

    // Initial item and stock counts from product catalog
    products.forEach((p) => {
      const cur = cats.get(p.category) || { revenue: 0, cost: 0, profit: 0, itemCount: 0, stockCount: 0 };
      cur.itemCount += 1;
      cur.stockCount += p.stock;
      cats.set(p.category, cur);
    });

    // Revenue and cost from filtered active orders
    filteredActiveOrders.forEach((order) => {
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const catName = prod ? prod.category : 'General';
        const cur = cats.get(catName) || { revenue: 0, cost: 0, profit: 0, itemCount: 0, stockCount: 0 };
        cur.revenue += item.subtotal;
        cur.cost += item.unitCost * item.quantity;
        cur.profit += item.profit;
        cats.set(catName, cur);
      });
    });

    return Array.from(cats.entries()).map(([name, data]) => {
      const marginPct = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
      return {
        name,
        revenue: Math.round(data.revenue),
        cost: Math.round(data.cost),
        profit: Math.round(data.profit),
        marginPct: Math.round(marginPct * 10) / 10,
        itemCount: data.itemCount,
        stockCount: data.stockCount,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [products, filteredActiveOrders]);

  // Top 5 Highest and Lowest margin products (catalog SKU unit economics)
  const sortedByMargin = useMemo(() => {
    return [...products].sort((a, b) => {
      const marginA = ((a.sellingPrice - a.costPrice) / a.sellingPrice) * 100;
      const marginB = ((b.sellingPrice - b.costPrice) / b.sellingPrice) * 100;
      return marginB - marginA;
    });
  }, [products]);

  const topMarginProducts = sortedByMargin.slice(0, 5);
  const lowestMarginProducts = sortedByMargin.slice(-5).reverse();

  const totalPeriodRevenue = channelBreakdown.reduce((sum, c) => sum + c.revenue, 0);

  // Channel Chart Colors
  const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6" id="bizpilot-analytics-view">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Financial Diagnostics</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {timeframe === '7d' ? 'Past 7 Days' : timeframe === '14d' ? 'Past 14 Days' : 'Full Range'}
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-0.5">Comprehensive Profit & Channel Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate revenue distribution across channels, categories, and unit economics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Timeframe Selector */}
          <div id="analytics-timeframe-selector" className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setTimeframe('7d')}
              className={`px-2.5 py-1 rounded-md transition-all ${timeframe === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              aria-pressed={timeframe === '7d'}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('14d')}
              className={`px-2.5 py-1 rounded-md transition-all ${timeframe === '14d' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              aria-pressed={timeframe === '14d'}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('30d')}
              className={`px-2.5 py-1 rounded-md transition-all ${timeframe === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              aria-pressed={timeframe === '30d'}
            >
              Full Range
            </button>
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">Blended Gross Margin</span>
              <p className="text-xl font-black text-emerald-600">{formatPercent(periodMarginPct)}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-xs text-slate-400">Net Profit Generated</span>
              <p className="text-xl font-black text-slate-900">{formatCurrency(periodProfit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue by Sales Channel</h3>
              <p className="text-xs text-slate-500">Distribution across Online, In-Store, Wholesale & B2B</p>
            </div>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <PieChartIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            {totalPeriodRevenue === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <PieChartIcon className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                <p className="font-semibold text-slate-600">No sales recorded in this timeframe</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Adjust timeframe to view historical channel distribution</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="channel"
                  >
                    {channelBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            {channelBreakdown.map((c) => (
              <div key={c.channel} className="p-2 rounded-lg bg-slate-50">
                <span className="text-slate-400 text-[10px] font-semibold">{c.channel}</span>
                <p className="font-bold text-slate-900">{formatCurrency(c.revenue)}</p>
                <p className="text-[10px] text-slate-500">{c.ordersCount} orders</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Profitability Comparison */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Profit Margins (%)</h3>
              <p className="text-xs text-slate-500">Department margin percentage vs company benchmark ({settings.targetMarginPct}%)</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Profit Margin']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="marginPct" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Target Profit Margin: <strong>{settings.targetMarginPct}%</strong></span>
            <span className="text-emerald-600 font-semibold">
              {(() => {
                const topCat = categoryBreakdown.find((c) => c.revenue > 0) || categoryBreakdown[0];
                return topCat && topCat.revenue > 0
                  ? `Highest Performer: ${topCat.name} (${topCat.marginPct}%)`
                  : 'No category sales in period';
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Unit Economics Margin Extremes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Margin Performers */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Highest Margin Products (Cash Cows)</h3>
                <p className="text-xs text-slate-500">Products delivering the highest percentage profit per unit</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {topMarginProducts.map(p => {
              const margin = ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100;
              const unitProfit = p.sellingPrice - p.costPrice;
              return (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Cost: {formatCurrency(p.costPrice)} • Retail: {formatCurrency(p.sellingPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                      {margin.toFixed(1)}% margin
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">+{formatCurrency(unitProfit)}/unit</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lowest Margin Watchlist */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Low Margin Watchlist (Optimization Opportunities)</h3>
                <p className="text-xs text-slate-500">SKUs below target margin needing supplier renegotiation or price bump</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {lowestMarginProducts.map(p => {
              const margin = ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100;
              const unitProfit = p.sellingPrice - p.costPrice;
              return (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Cost: {formatCurrency(p.costPrice)} • Retail: {formatCurrency(p.sellingPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                      margin < 40 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {margin.toFixed(1)}% margin
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">+{formatCurrency(unitProfit)}/unit</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

