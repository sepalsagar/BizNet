import React, { useState } from 'react';
import { 
  Percent, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  TrendingDown, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';

export const DiscountOptimizer: React.FC = () => {
  const { products, formatPercent } = useBusiness();
  const formatCurrency = formatIndianCurrency;

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [discountPct, setDiscountPct] = useState<number>(15);
  const [currentSalesUnits, setCurrentSalesUnits] = useState<number>(100);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  if (!selectedProduct) {
    return <div className="p-8 text-center text-slate-400">No products available to optimize.</div>;
  }

  const normalPrice = selectedProduct.sellingPrice;
  const costPrice = selectedProduct.costPrice;
  const normalMarginDollars = normalPrice - costPrice;
  const normalMarginPct = (normalMarginDollars / normalPrice) * 100;

  const discountedPrice = normalPrice * (1 - discountPct / 100);
  const discountedMarginDollars = discountedPrice - costPrice;
  const discountedMarginPct = discountedPrice > 0 ? (discountedMarginDollars / discountedPrice) * 100 : 0;

  // Breakeven multiplier: how many units need to be sold to make the same total gross profit?
  // Normal profit = Units * normalMarginDollars
  // Required Units * discountedMarginDollars = Normal profit
  // Required Units = (Units * normalMarginDollars) / discountedMarginDollars
  const isUnderwater = discountedMarginDollars <= 0;
  const requiredUnits = !isUnderwater 
    ? Math.ceil((currentSalesUnits * normalMarginDollars) / discountedMarginDollars)
    : 0;
  
  const additionalUnitsNeeded = requiredUnits - currentSalesUnits;
  const volumeLiftPct = currentSalesUnits > 0 ? (additionalUnitsNeeded / currentSalesUnits) * 100 : 0;

  // Common discount thresholds comparison table
  const discountTiers = [5, 10, 15, 20, 25, 30];

  return (
    <div className="space-y-6" id="bizpilot-discount-optimizer">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
            Profit Margin Defense
          </span>
          <span className="text-xs text-slate-400">Promotion Breakeven Calculator</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 mt-1">Discount & Promotion Breakeven Optimizer</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Calculate exactly how much sales volume you must generate to prevent a promotion from destroying your net profit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls (1 Col) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Percent className="h-4 w-4 text-indigo-600" />
            Promotion Setup
          </h3>

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
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Cost: {formatCurrency(costPrice)}</span>
              <span>Margin: {formatPercent(normalMarginPct)}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Proposed Discount %
              </label>
              <span className="text-sm font-black text-indigo-600">
                {discountPct}% OFF
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>5% Light Promo</span>
              <span>25% Flash Sale</span>
              <span>50% Liquidation</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Baseline Sales Units (Without Discount)
            </label>
            <input
              type="number"
              min="1"
              value={currentSalesUnits}
              onChange={(e) => setCurrentSalesUnits(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The number of units you currently sell at regular price.
            </p>
          </div>
        </div>

        {/* Real-time Breakeven Analysis (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Verdict Card */}
          <div className="p-6 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Breakeven Required Volume
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {discountPct}% Price Cut
              </span>
            </div>

            {isUnderwater ? (
              <div className="mt-4 p-4 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
                <p className="font-bold text-sm text-red-100 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Negative Unit Margin Error!
                </p>
                <p className="mt-1">
                  At {discountPct}% discount, the price ({formatCurrency(discountedPrice)}) is below your cost ({formatCurrency(costPrice)}). You lose money on every unit sold regardless of volume!
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {requiredUnits} <span className="text-lg font-normal text-slate-400">units needed</span>
                  </h3>
                  <span className="text-emerald-400 font-extrabold text-sm sm:text-base">
                    (+{volumeLiftPct.toFixed(1)}% sales volume lift required)
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  To earn the same gross profit of <strong>{formatCurrency(currentSalesUnits * normalMarginDollars)}</strong> that you currently make selling {currentSalesUnits} units at {formatCurrency(normalPrice)}, you must sell at least <strong>{requiredUnits} units</strong> (+{additionalUnitsNeeded} units) at the discounted price of {formatCurrency(discountedPrice)}.
                </p>
              </div>
            )}
          </div>

          {/* Breakeven Multiplier Grid by Tier */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              Breakeven Volume Curve for {selectedProduct.name}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
              {discountTiers.map(t => {
                const testPrice = normalPrice * (1 - t / 100);
                const testMargin = testPrice - costPrice;
                const testReqUnits = testMargin > 0 
                  ? Math.ceil((currentSalesUnits * normalMarginDollars) / testMargin)
                  : 'N/A';
                const testLift = testMargin > 0 
                  ? (((testReqUnits as number) - currentSalesUnits) / currentSalesUnits) * 100
                  : null;

                return (
                  <div 
                    key={t}
                    className={`p-3 rounded-xl border ${
                      discountPct === t 
                        ? 'border-indigo-500 bg-indigo-50/50' 
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-slate-700">{t}% OFF</span>
                    <p className="text-sm font-black text-slate-900 mt-1">
                      {typeof testReqUnits === 'number' ? `${testReqUnits} units` : 'Loss'}
                    </p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${
                      testLift && testLift > 50 ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {testLift !== null ? `+${testLift.toFixed(0)}% lift` : 'Below cost'}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Notice how higher discounts exponentially increase the sales volume needed to stay solvent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
