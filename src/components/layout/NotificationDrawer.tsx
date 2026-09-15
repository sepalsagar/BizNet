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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full flex pl-10">
        <div className="w-full bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-100 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Operational Alerts</h3>
                <p className="text-xs text-slate-500">
                  {lowStockProducts.length + outOfStockProducts.length} inventory alerts • {pendingOrders.length} pending orders
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Alert Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Out of Stock Section */}
            {outOfStockProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-red-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Out of Stock ({outOfStockProducts.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {outOfStockProducts.map(p => (
                    <div 
                      key={p.id}
                      className="p-3 rounded-lg border border-red-200 bg-red-50/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-500">SKU: {p.sku} • {p.supplierName}</p>
                      </div>
                      <button
                        onClick={() => adjustStock(p.id, 25)}
                        className="shrink-0 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors shadow-xs"
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
                <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Low Stock Threshold Reached ({lowStockProducts.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.map(p => (
                    <div 
                      key={p.id}
                      className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-600">
                          Current Stock: <span className="font-bold text-amber-700">{p.stock}</span> / Reorder at {p.reorderPoint}
                        </p>
                      </div>
                      <button
                        onClick={() => adjustStock(p.id, 20)}
                        className="shrink-0 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-colors shadow-xs"
                      >
                        +20 Quick PO
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                <p className="text-xs font-semibold text-emerald-800">All inventory levels are healthy!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">No products below reorder thresholds.</p>
              </div>
            )}

            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Pending Orders ({pendingOrders.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {pendingOrders.map(o => (
                    <div 
                      key={o.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{o.orderNumber}</p>
                        <p className="text-[11px] text-slate-500">{o.customerName} • {formatCurrency(o.totalAmount)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
            <button
              onClick={() => {
                setActiveTab('inventory');
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              <Package className="h-3.5 w-3.5" />
              <span>Manage Inventory</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sales');
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
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
