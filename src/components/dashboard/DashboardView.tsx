import React from 'react';
import { Plus } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';
import { formatIndianDate } from '../../utils/formatters';

interface DashboardViewProps {
  onOpenCreateOrder: () => void;
  onOpenAddProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCreateOrder,
}) => {
  const { 
    totalRevenue, 
    totalOrdersCount, 
    totalInventoryValuation,
    lowStockProducts, 
    outOfStockProducts,
    products,
    orders,
    setActiveTab,
  } = useBusiness();

  const formatCurrency = formatIndianCurrency;

  const recentOrders = orders.slice(0, 6);
  const displayInventory = products.slice(0, 6);
  const totalAttentionCount = lowStockProducts.length + outOfStockProducts.length;

  return (
    <div className="space-y-8" id="bizpilot-dashboard-view">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of your store's performance, recent transactions, and inventory health.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="dashboard-record-sale-btn"
            onClick={onOpenCreateOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </div>
        </div>

        {/* Total Sales */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Sales
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {totalOrdersCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Completed orders</p>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Inventory Value
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalInventoryValuation)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Current stock</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Low Stock Items
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {totalAttentionCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {outOfStockProducts.length > 0
                ? `${outOfStockProducts.length} out of stock`
                : 'Need attention'}
            </p>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Table */}
        <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Recent Sales</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest customer transactions and order status</p>
            </div>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              View all →
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900 font-mono">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {order.customerName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatIndianDate(order.date)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-900 font-mono">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : order.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : order.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : order.status === 'shipped'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Overview Table */}
        <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Inventory Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Current stock levels and reorder alerts</p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              View all →
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Stock</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayInventory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No inventory products found.
                    </td>
                  </tr>
                ) : (
                  displayInventory.map((product) => {
                    const isOutOfStock = product.stock === 0;
                    const isLowStock = product.stock > 0 && product.stock <= product.reorderPoint;
                    const isCritical = product.stock > 0 && product.stock <= Math.max(1, Math.floor(product.reorderPoint / 2));
                    
                    let statusLabel = 'In Stock';
                    let statusClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
                    
                    if (isOutOfStock) {
                      statusLabel = 'Out of Stock';
                      statusClass = 'bg-rose-50 text-rose-700 border border-rose-200/60';
                    } else if (isCritical) {
                      statusLabel = 'Critical';
                      statusClass = 'bg-rose-50 text-rose-700 border border-rose-200/60';
                    } else if (isLowStock) {
                      statusLabel = 'Low Stock';
                      statusClass = 'bg-amber-50 text-amber-700 border border-amber-200/60';
                    }

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-900">{product.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{product.sku}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {product.category}
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-slate-900 font-mono">
                          {product.stock} {product.unit || 'units'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
