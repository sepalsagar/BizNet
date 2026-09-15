import React from 'react';
import { 
  X, 
  FileText, 
  Truck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  PackageCheck,
  Send,
  Building2,
  DollarSign
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types';

interface PurchaseOrderDetailsModalProps {
  po: PurchaseOrder | null;
  onClose: () => void;
}

export const PurchaseOrderDetailsModal: React.FC<PurchaseOrderDetailsModalProps> = ({
  po,
  onClose,
}) => {
  const { updatePurchaseOrderStatus } = useBusiness();
  const formatCurrency = formatIndianCurrency;

  if (!po) return null;

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            RECEIVED
          </span>
        );
      case 'ordered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="h-3.5 w-3.5" />
            ORDERED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="h-3.5 w-3.5" />
            PENDING DRAFT
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="h-3.5 w-3.5" />
            CANCELLED
          </span>
        );
    }
  };

  const handleStatusChange = (newStatus: PurchaseOrderStatus) => {
    updatePurchaseOrderStatus(po.id, newStatus);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
      id="po-details-modal"
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{po.poNumber}</h3>
                {getStatusBadge(po.status)}
              </div>
              <p className="text-xs text-slate-500">
                Created {po.date} • {po.supplierName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Supplier and Logistics Strip */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Vendor
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{po.supplierName}</p>
              <p className="text-slate-500 text-[11px] truncate">{po.supplierEmail}</p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Payment Terms
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{po.paymentTerms || 'Standard'}</p>
              <p className="text-slate-500 text-[11px]">Contract Terms</p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Estimated Lead Time
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {po.leadTimeDays ? `${po.leadTimeDays} days` : '7 days'}
              </p>
              <p className="text-slate-500 text-[11px]">Factory to Dock</p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Inventory Status
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {po.stockReceived ? 'Stock Added' : 'Pending Receipt'}
              </p>
              <p className="text-slate-500 text-[11px]">
                {po.receivedAt ? `Received: ${po.receivedAt}` : 'No stock added yet'}
              </p>
            </div>
          </div>

          {/* Notes if present */}
          {po.notes && (
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-900">
              <span className="font-bold uppercase tracking-wider text-indigo-500 text-[10px] block mb-0.5">
                Procurement Notes
              </span>
              <p className="text-xs">{po.notes}</p>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Itemized Line Items ({po.items.length})
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="bg-slate-50 px-3.5 py-2 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <div className="col-span-6">Product & SKU</div>
                <div className="col-span-2 text-right">Unit Cost</div>
                <div className="col-span-2 text-center">Ordered Qty</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
              {po.items.map((item, i) => (
                <div key={i} className="px-3.5 py-2.5 grid grid-cols-12 items-center text-xs">
                  <div className="col-span-6 pr-2">
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
                  </div>
                  <div className="col-span-2 text-right font-medium text-slate-700">
                    {formatCurrency(item.unitCost)}
                  </div>
                  <div className="col-span-2 text-center font-bold text-slate-900">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right font-black text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Order Quantity:</span>
              <p className="font-bold text-white text-sm mt-0.5">{po.totalItems} total units</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Total Purchase Commitment:</span>
              <p className="font-black text-white text-lg mt-0.5">{formatCurrency(po.totalAmount)}</p>
            </div>
          </div>

          {/* Status Workflow Action Strip */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                  Lifecycle Workflow Action
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {po.status === 'pending' && 'This PO is currently a draft. Dispatch when approved.'}
                  {po.status === 'ordered' && 'PO is active with vendor. Mark as received when delivered.'}
                  {po.status === 'received' && 'Shipment received. Inventory units were added to active stock.'}
                  {po.status === 'cancelled' && 'This purchase order has been cancelled.'}
                </p>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex items-center gap-2">
                {po.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('ordered')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Dispatch as Ordered</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange('cancelled')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-200 font-semibold transition-colors"
                    >
                      Cancel PO
                    </button>
                  </>
                )}

                {po.status === 'ordered' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('received')}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-colors"
                    >
                      <PackageCheck className="h-3.5 w-3.5" />
                      <span>Receive Shipment (Add Stock)</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange('cancelled')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-200 font-semibold transition-colors"
                    >
                      Cancel PO
                    </button>
                  </>
                )}

                {po.status === 'received' && (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Completed & In Stock</span>
                  </div>
                )}

                {po.status === 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange('pending')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                  >
                    Reopen as Draft
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Quick Status Override:</span>
            <select
              value={po.status}
              onChange={(e) => handleStatusChange(e.target.value as PurchaseOrderStatus)}
              className="px-2 py-1 rounded-md border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="pending">pending</option>
              <option value="ordered">ordered</option>
              <option value="received">received</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
