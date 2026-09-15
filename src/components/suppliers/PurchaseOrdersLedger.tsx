import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  PackageCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types';
import { PurchaseOrderDetailsModal } from './PurchaseOrderDetailsModal';

interface PurchaseOrdersLedgerProps {
  onCreatePO: () => void;
}

export const PurchaseOrdersLedger: React.FC<PurchaseOrdersLedgerProps> = ({ onCreatePO }) => {
  const { purchaseOrders, updatePurchaseOrderStatus } = useBusiness();
  const formatCurrency = formatIndianCurrency;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PurchaseOrderStatus>('all');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Sync selectedPO with updated purchaseOrders from context
  const activeSelectedPO = useMemo(() => {
    if (!selectedPO) return null;
    return purchaseOrders.find(p => p.id === selectedPO.id) || selectedPO;
  }, [selectedPO, purchaseOrders]);

  // Metrics
  const totalSpend = purchaseOrders.reduce((sum, p) => p.status !== 'cancelled' ? sum + p.totalAmount : sum, 0);
  const activeOrdersCount = purchaseOrders.filter(p => p.status === 'ordered' || p.status === 'pending').length;
  const receivedOrdersCount = purchaseOrders.filter(p => p.status === 'received').length;
  const committedActiveSpend = purchaseOrders
    .filter(p => p.status === 'ordered')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  // Filtered list
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const q = search.toLowerCase();
      const matchSearch = 
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        po.items.some(i => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || po.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, search, statusFilter]);

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            RECEIVED
          </span>
        );
      case 'ordered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            <Truck className="h-3 w-3" />
            ORDERED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3" />
            PENDING
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            <XCircle className="h-3 w-3" />
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="bizpilot-purchase-orders-ledger">
      {/* PO KPIs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Purchase Orders</span>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{purchaseOrders.length}</h3>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">{receivedOrdersCount} fulfilled & received</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Committed Spend</span>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(committedActiveSpend)}
            </h3>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">In transit / currently ordered</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Pipelines</span>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{activeOrdersCount}</h3>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Drafts & dispatched reorders</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cumulative Spend</span>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalSpend)}
            </h3>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <PackageCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-1">All valid procurement records</p>
        </div>
      </div>

      {/* Control Ribbon */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PO #, supplier, or product SKU..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 text-xs focus:outline-hidden"
            />
          </div>

          <button
            onClick={onCreatePO}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Purchase Order</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          {(['all', 'ordered', 'pending', 'received', 'cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'all' ? `All POs (${purchaseOrders.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">PO Number</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Vendor</th>
                <th className="px-5 py-3.5">Requisition Items</th>
                <th className="px-5 py-3.5 text-right">Order Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No purchase orders found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {search ? 'Try adjusting your search filters' : 'Issue your first supplier purchase order'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr 
                    key={po.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedPO(po)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-slate-900">{po.poNumber}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                      {po.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{po.supplierName}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{po.supplierEmail}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">
                        {po.items.length} {po.items.length === 1 ? 'line item' : 'line items'} ({po.totalItems} units)
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {po.items.map(i => i.productName).join(', ')}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900">
                      {formatCurrency(po.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {po.status === 'ordered' && (
                          <button
                            onClick={() => updatePurchaseOrderStatus(po.id, 'received')}
                            className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition-colors"
                            title="Mark shipment as received and add units to stock"
                          >
                            Receive
                          </button>
                        )}
                        {po.status === 'pending' && (
                          <button
                            onClick={() => updatePurchaseOrderStatus(po.id, 'ordered')}
                            className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] border border-indigo-200 transition-colors"
                            title="Dispatch PO to supplier"
                          >
                            Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="View PO Details"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Details Modal */}
      {activeSelectedPO && (
        <PurchaseOrderDetailsModal
          po={activeSelectedPO}
          onClose={() => setSelectedPO(null)}
        />
      )}
    </div>
  );
};
