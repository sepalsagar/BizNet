import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  X,
  FileText,
  ShoppingBag,
  ArrowUpDown
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Order, OrderStatus } from '../../types';
import { CreateOrderModal } from './CreateOrderModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SalesView: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    totalRevenue, 
    grossProfit, 
    grossMarginPct, 
    formatCurrency, 
    formatPercent 
  } = useBusiness();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [channelFilter, setChannelFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'profit' | 'orderNumber'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Cancellation confirmation state
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = 
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchChannel = channelFilter === 'All' || o.channel === channelFilter;

      return matchSearch && matchStatus && matchChannel;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'orderNumber') comparison = a.orderNumber.localeCompare(b.orderNumber);
      if (sortBy === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount') comparison = a.totalAmount - b.totalAmount;
      if (sortBy === 'profit') comparison = a.grossProfit - b.grossProfit;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [orders, search, statusFilter, channelFilter, sortBy, sortOrder]);

  const toggleSort = (key: 'date' | 'amount' | 'profit' | 'orderNumber') => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (newStatus === 'cancelled' && order.status !== 'cancelled') {
      setOrderToCancel(order);
    } else {
      updateOrderStatus(order.id, newStatus);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Completed
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
            Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
            Processing
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8" id="bizpilot-sales-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Sales
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your business transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="sales-record-sale-btn"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Gross Revenue */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all completed sales</p>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Gross Profit
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {formatCurrency(grossProfit)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Margin: <span className="font-mono text-slate-700">{formatPercent(grossMarginPct)}</span>
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Active Orders
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {activeOrdersCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Pending dispatch or payment</p>
          </div>
        </div>

        {/* Lifetime Orders */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Lifetime Orders
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {orders.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total recorded sales</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Ribbon */}
      <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer name, or email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 text-xs focus:outline-hidden bg-slate-50/50 hover:bg-white transition-colors"
            />
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-2">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden"
            >
              <option value="All">All Channels</option>
              <option value="Online">Online Store</option>
              <option value="In-Store">In-Store / POS</option>
              <option value="Wholesale">Wholesale</option>
              <option value="B2B">Corporate B2B</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'completed', label: 'Completed' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'pending', label: 'Pending' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {orders.length === 0 ? (
          /* Entire Orders Empty State */
          <div className="py-16 px-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No sales yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Record your first sale to start tracking business activity.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Sale</span>
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Filter/Search Empty State */
          <div className="py-12 px-6 text-center text-xs text-slate-500">
            <p>No orders match your current search or filter criteria.</p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setChannelFilter('All');
              }}
              className="mt-3 text-xs font-medium text-slate-900 underline hover:text-slate-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  <th 
                    className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none" 
                    onClick={() => toggleSort('orderNumber')}
                  >
                    <div className="flex items-center gap-1">
                      Order #
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none" 
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Channel / Payment</th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none" 
                    onClick={() => toggleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Amount
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none" 
                    onClick={() => toggleSort('profit')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Profit
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Order Number */}
                    <td className="py-3.5 px-5 font-mono font-medium text-slate-900">
                      {o.orderNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {o.date}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-medium text-slate-900 truncate">{o.customerName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{o.customerEmail}</p>
                      </div>
                    </td>

                    {/* Channel / Method */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span>{o.channel} • {o.paymentMethod}</span>
                    </td>

                    {/* Gross Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                      {formatCurrency(o.totalAmount)}
                    </td>

                    {/* Profit & Margin */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className="text-emerald-700 font-medium">+{formatCurrency(o.grossProfit)}</span>
                      <span className="text-[11px] text-slate-400 ml-1">({o.profitMargin.toFixed(0)}%)</span>
                    </td>

                    {/* Status with Inline Select */}
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value as OrderStatus)}
                        className="text-[11px] font-medium py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-hidden hover:border-slate-300 transition-colors"
                      >
                        <option value="completed">Completed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors"
                        title="View order details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Order {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedOrder.date} • {selectedOrder.channel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Customer & Payment Info */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Customer</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-slate-500">{selectedOrder.customerEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Payment & Status</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedOrder.paymentMethod}</p>
                  <div className="mt-1 flex justify-end">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Itemized Items ({selectedOrder.items.length})
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-lg overflow-hidden">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">{item.productName}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.sku} • Qty: <span className="font-medium text-slate-700">{item.quantity}</span> @ {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-medium text-slate-900">{formatCurrency(item.subtotal)}</p>
                        <p className="text-[11px] text-emerald-700">
                          +{formatCurrency(item.profit)} profit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-4 rounded-lg bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Total:</span>
                  <span className="font-mono font-medium text-white">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cost of Goods Sold (COGS):</span>
                  <span className="font-mono">{formatCurrency(selectedOrder.totalCost)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-medium text-xs">
                  <span className="text-slate-300">Gross Margin Profit:</span>
                  <span className="font-mono text-emerald-400">
                    +{formatCurrency(selectedOrder.grossProfit)} ({selectedOrder.profitMargin.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200/80 bg-white flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!orderToCancel}
        onClose={() => setOrderToCancel(null)}
        onConfirm={() => {
          if (orderToCancel) {
            updateOrderStatus(orderToCancel.id, 'cancelled');
            setOrderToCancel(null);
          }
        }}
        title="Cancel Order"
        description={`Are you sure you want to cancel order ${orderToCancel?.orderNumber}? This will restore ${orderToCancel?.items.reduce((sum, i) => sum + i.quantity, 0) || 0} unit(s) back to inventory.`}
        confirmText="Cancel Order"
        cancelText="Keep Active"
        variant="danger"
      />

      {/* Record Sale Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
