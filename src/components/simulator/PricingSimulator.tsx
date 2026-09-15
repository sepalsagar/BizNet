import React, { useState } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  DollarSign, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const PricingSimulator: React.FC = () => {
  const { products, formatCurrency, formatPercent, settings } = useBusiness();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [priceChangePct, setPriceChangePct] = useState<number>(10); // default +10% price test
  const [priceElasticity, setPriceElasticity] = useState<number>(-1.2); // standard consumer goods elasticity
  const [monthlyBaselineUnits, setMonthlyBaselineUnits] = useState<number>(50);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  if (!selectedProduct) {
    return <div className="p-8 text-center text-slate-400">No products available to simulate.</div>;
  }

  // Base metrics
  const currentPrice = selectedProduct.sellingPrice;
  const unitCost = selectedProduct.costPrice;
  const currentUnitMargin = currentPrice - unitCost;
  const currentMarginPct = (currentUnitMargin / currentPrice) * 100;
  
  const currentRevenue = currentPrice * monthlyBaselineUnits;
  const currentCost = unitCost * monthlyBaselineUnits;
  const currentProfit = currentRevenue - currentCost;

  // Simulated metrics
  const newPrice = Number((currentPrice * (1 + priceChangePct / 100)).toFixed(2));
  // Demand change = Price change % * elasticity
  const demandChangePct = (priceChangePct * priceElasticity) / 100;
  const newUnits = Math.max(0, Math.round(monthlyBaselineUnits * (1 + demandChangePct)));

  const newUnitMargin = newPrice - unitCost;
  const newMarginPct = newPrice > 0 ? (newUnitMargin / newPrice) * 100 : 0;

  const newRevenue = newPrice * newUnits;
  const newCost = unitCost * newUnits;
  const newProfit = newRevenue - newCost;

  // Deltas
  const profitDelta = newProfit - currentProfit;
  const profitDeltaPct = currentProfit > 0 ? (profitDelta / currentProfit) * 100 : 0;
  const revenueDelta = newRevenue - currentRevenue;

  return (
    <div className="space-y-6" id="bizpilot-pricing-simulator">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-700">
              What-If Decision Engine
            </span>
            <span className="text-xs text-slate-400">Microeconomic Elasticity Model</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Pricing & Profit Margin Simulator</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Safely test price increases or reductions before executing in your live storefront or sales quotes.
          </p>
        </div>

        <button
          onClick={() => {
            setPriceChangePct(10);
            setPriceElasticity(-1.2);
            setMonthlyBaselineUnits(50);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Controls (1 Col) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            Simulation Parameters
          </h3>

          {/* Product Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Select Product SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-hidden bg-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatCurrency(p.sellingPrice)})
                </option>
              ))}
            </select>
            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
              <span>Unit Cost: <strong>{formatCurrency(selectedProduct.costPrice)}</strong></span>
              <span>Stock: <strong>{selectedProduct.stock} units</strong></span>
            </div>
          </div>

          {/* Price Adjustment Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Price Adjustment
              </label>
              <span className={`text-sm font-black ${
                priceChangePct > 0 ? 'text-emerald-600' : priceChangePct < 0 ? 'text-amber-600' : 'text-slate-600'
              }`}>
                {priceChangePct > 0 ? `+${priceChangePct}%` : `${priceChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="60"
              step="1"
              value={priceChangePct}
              onChange={(e) => setPriceChangePct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>-40% (Sale)</span>
              <span>0% (Current)</span>
              <span>+60% (Premium)</span>
            </div>
          </div>

          {/* Monthly Baseline Volume */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Baseline Monthly Unit Volume
            </label>
            <input
              type="number"
              min="1"
              value={monthlyBaselineUnits}
              onChange={(e) => setMonthlyBaselineUnits(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Typical monthly sales volume for this SKU
            </p>
          </div>

          {/* Elasticity Preset Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Price Elasticity of Demand (PED)
            </label>
            <select
              value={priceElasticity}
              onChange={(e) => setPriceElasticity(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-hidden bg-white"
            >
              <option value="-0.5">Inelastic (-0.5) — High brand loyalty / essentials</option>
              <option value="-1.0">Unit Elastic (-1.0) — Proportional volume shift</option>
              <option value="-1.2">Standard (-1.2) — Typical consumer e-commerce</option>
              <option value="-1.8">Elastic (-1.8) — Highly competitive / commodity</option>
              <option value="-2.5">Very Elastic (-2.5) — Price-sensitive shoppers</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              For every 1% price increase, unit volume drops by {Math.abs(priceElasticity)}%.
            </p>
          </div>
        </div>

        {/* Results & Comparison (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Verdict Callout */}
          <div className={`p-5 rounded-xl border flex items-start gap-4 ${
            profitDelta > 0 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : profitDelta < 0 
              ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${
              profitDelta > 0 ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {profitDelta > 0 ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {profitDelta > 0 ? 'Optimal Growth Strategy' : 'Profit Degradation Warning'}
                </span>
              </div>
              <h4 className="text-base font-black mt-0.5">
                {profitDelta > 0
                  ? `Net Profit Increases by ${formatCurrency(profitDelta)}/mo (+${profitDeltaPct.toFixed(1)}%)`
                  : `Net Profit Drops by ${formatCurrency(Math.abs(profitDelta))}/mo (${profitDeltaPct.toFixed(1)}%)`
                }
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {profitDelta > 0 ? (
                  `By moving price from ${formatCurrency(currentPrice)} to ${formatCurrency(newPrice)}, unit sales drop from ${monthlyBaselineUnits} to ${newUnits} units (-${Math.round(Math.abs(demandChangePct * 100))}%), but the higher unit margin (${formatPercent(newMarginPct)}) more than offsets volume loss.`
                ) : (
                  `At ${formatCurrency(newPrice)}, expected volume of ${newUnits} units is insufficient to overcome the narrower unit economics. Reconsider this change or pair with cost reductions.`
                )}
              </p>
            </div>
          </div>

          {/* Before vs After Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Baseline</span>
              <div className="mt-3 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Retail Unit Price:</span>
                  <strong className="text-slate-900">{formatCurrency(currentPrice)}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Unit Cost (COGS):</span>
                  <span className="text-slate-700">{formatCurrency(unitCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Gross Margin %:</span>
                  <strong className="text-slate-900">{formatPercent(currentMarginPct)}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Monthly Volume:</span>
                  <strong className="text-slate-900">{monthlyBaselineUnits} units</strong>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Monthly Revenue:</span>
                  <span className="text-slate-900">{formatCurrency(currentRevenue)}</span>
                </div>
                <div className="flex justify-between text-xs font-black">
                  <span className="text-slate-700">Monthly Gross Profit:</span>
                  <span className="text-slate-900 text-sm">{formatCurrency(currentProfit)}</span>
                </div>
              </div>
            </div>

            {/* Simulated Card */}
            <div className="p-5 rounded-xl bg-white border-2 border-indigo-500 shadow-sm relative overflow-hidden">
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                Simulated Result
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Projected Outcome</span>
              <div className="mt-3 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">New Retail Price:</span>
                  <strong className="text-indigo-600 text-sm">{formatCurrency(newPrice)}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Unit Cost (COGS):</span>
                  <span className="text-slate-700">{formatCurrency(unitCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Gross Margin %:</span>
                  <strong className={newMarginPct >= currentMarginPct ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                    {formatPercent(newMarginPct)}
                  </strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Expected Volume:</span>
                  <strong className="text-slate-900">{newUnits} units ({newUnits - monthlyBaselineUnits >= 0 ? `+${newUnits - monthlyBaselineUnits}` : newUnits - monthlyBaselineUnits})</strong>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Monthly Revenue:</span>
                  <span className="text-slate-900">{formatCurrency(newRevenue)}</span>
                </div>
                <div className="flex justify-between text-xs font-black">
                  <span className="text-indigo-600">Monthly Gross Profit:</span>
                  <span className="text-emerald-600 text-sm">{formatCurrency(newProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
