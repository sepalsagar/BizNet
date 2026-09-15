import React from 'react';
import { X, AlertTriangle, AlertCircle, Package, ShoppingCart, ArrowRight } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    lowStockProducts,
    outOfStockProducts,
    orders,
    adjustStock,
    setActiveTab
  } = useBusiness();

  const formatCurrency = formatIndianCurrency;

  if (!isOpen) return null;

  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending');
  const alertCount = lowStockProducts.length + outOfStockProducts.length + pendingOrders.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-[calc(100%-2rem)] sm:w-full flex pl-4 sm:pl-10">
        <div
          className="w-full bg-white shadow-xl flex flex-col border-l border-slate-200/90"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-drawer-title"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200/80 bg-white">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-1.5 rounded-md bg-amber-50 border border-amber-200/70 text-amber-700 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id="notification-drawer-title" className="text-base font-bold tracking-tight text-slate-900">Operational Alerts</h2>
                  <span className="inline-flex min-w-5 items-center justify-center rounded-md bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    {alertCount}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lowStockProducts.length + outOfStockProducts.length} inventory alerts • {pendingOrders.length} pending orders
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
              aria-label="Close operational alerts"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Alert Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Out of Stock Section */}
            {outOfStockProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Out of Stock ({outOfStockProducts.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {outOfStockProducts.map(p => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-rose-200/80 bg-rose-50/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-500">SKU: {p.sku} • {p.supplierName}</p>
                      </div>
                      <button
                        onClick={() => adjustStock(p.id, 25)}
                        className="shrink-0 px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300"
                      >
                        +25 Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Low Stock Threshold Reached ({lowStockProducts.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.map(p => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-amber-200/80 bg-amber-50/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-600">
                          Current Stock: <span className="font-bold text-amber-700">{p.stock}</span> / Reorder at {p.reorderPoint}
                        </p>
                      </div>
                      <button
                        onClick={() => adjustStock(p.id, 20)}
                        className="shrink-0 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-300"
                      >
                        +20 Quick PO
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 text-center" role="status">
                <p className="text-xs font-semibold text-emerald-800">All inventory levels are healthy!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">No products below reorder thresholds.</p>
              </div>
            )}

            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Pending Orders ({pendingOrders.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {pendingOrders.map(o => (
                    <div
                      key={o.id}
                      className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/70 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{o.orderNumber}</p>
                        <p className="text-[11px] text-slate-500">{o.customerName} • {formatCurrency(o.totalAmount)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/70 text-blue-700 text-[10px] font-semibold">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                setActiveTab('inventory');
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
            >
              <Package className="h-3.5 w-3.5" />
              <span>Manage Inventory</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sales');
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
            >
              <span>View All Orders</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
