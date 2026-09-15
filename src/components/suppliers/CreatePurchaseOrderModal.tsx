import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText, AlertCircle, CheckCircle, Truck, DollarSign } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';
import { PurchaseOrderStatus } from '../../types';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSupplierId?: string | null;
  onCreated?: (poId: string) => void;
}

interface POItemRow {
  productId: string;
  quantity: number;
  unitCost: number;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  initialSupplierId,
  onCreated,
}) => {
  const { suppliers, products, createPurchaseOrder } = useBusiness();
  const formatCurrency = formatIndianCurrency;

  const [supplierId, setSupplierId] = useState<string>('');
  const [status, setStatus] = useState<PurchaseOrderStatus>('ordered');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<POItemRow[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize or reset when modal opens or initialSupplierId changes
  useEffect(() => {
    if (!isOpen) return;

    const chosenSupplierId = initialSupplierId && suppliers.some(s => s.id === initialSupplierId)
      ? initialSupplierId
      : (suppliers[0]?.id || '');

    setSupplierId(chosenSupplierId);
    setStatus('ordered');
    setNotes('');
    setValidationError(null);

    // Pick first product matching this supplier, or first general product
    const supplierProducts = products.filter(p => p.supplierId === chosenSupplierId);
    const defaultProduct = supplierProducts[0] || products[0];

    if (defaultProduct) {
      setItems([
        {
          productId: defaultProduct.id,
          quantity: 25,
          unitCost: defaultProduct.costPrice,
        },
      ]);
    } else {
      setItems([]);
    }
  }, [isOpen, initialSupplierId, suppliers, products]);

  // When supplier changes, update supplierId and adjust product suggestions if items were empty
  const handleSupplierChange = (newSupId: string) => {
    setSupplierId(newSupId);
    setValidationError(null);

    // If current items are empty or only have 1 default product, recommend this supplier's product
    if (items.length <= 1) {
      const supProds = products.filter(p => p.supplierId === newSupId);
      const defaultProduct = supProds[0] || products[0];
      if (defaultProduct) {
        setItems([
          {
            productId: defaultProduct.id,
            quantity: 25,
            unitCost: defaultProduct.costPrice,
          },
        ]);
      }
    }
  };

  if (!isOpen) return null;

  const currentSupplier = suppliers.find(s => s.id === supplierId);

  const handleAddItem = () => {
    const supplierProducts = products.filter(p => p.supplierId === supplierId);
    // Find a product not yet added
    const existingIds = new Set(items.map(i => i.productId));
    const nextProd = supplierProducts.find(p => !existingIds.has(p.id)) ||
      products.find(p => !existingIds.has(p.id)) ||
      products[0];

    if (nextProd) {
      setItems(prev => [
        ...prev,
        {
          productId: nextProd.id,
          quantity: 20,
          unitCost: nextProd.costPrice,
        },
      ]);
    }
    setValidationError(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    setValidationError(null);
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find(p => p.id === newProductId);
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        productId: newProductId,
        unitCost: prod ? prod.costPrice : item.unitCost,
      };
    }));
    setValidationError(null);
  };

  const handleQuantityChange = (index: number, val: string) => {
    const parsed = parseInt(val, 10);
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        quantity: isNaN(parsed) ? 0 : parsed,
      };
    }));
    setValidationError(null);
  };

  const handleUnitCostChange = (index: number, val: string) => {
    const parsed = parseFloat(val);
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        unitCost: isNaN(parsed) ? 0 : parsed,
      };
    }));
    setValidationError(null);
  };

  // Calculations & Validations
  let totalCost = 0;
  let totalUnits = 0;
  let hasInvalidItem = false;
  let invalidItemReason = '';

  const calculatedRows = items.map((row) => {
    const prod = products.find(p => p.id === row.productId);
    const subtotal = Math.round(row.quantity * row.unitCost * 100) / 100;
    totalCost += subtotal;
    totalUnits += row.quantity;

    if (!row.productId) {
      hasInvalidItem = true;
      invalidItemReason = 'Please select a product for all line items.';
    } else if (row.quantity <= 0) {
      hasInvalidItem = true;
      invalidItemReason = 'Line item quantity must be at least 1 unit.';
    } else if (row.unitCost < 0) {
      hasInvalidItem = true;
      invalidItemReason = 'Unit cost cannot be negative.';
    }

    return {
      ...row,
      product: prod,
      subtotal,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      setValidationError('Please select a supplier.');
      return;
    }

    if (items.length === 0) {
      setValidationError('Please add at least one line item to the purchase order.');
      return;
    }

    if (hasInvalidItem) {
      setValidationError(invalidItemReason || 'Please fix invalid line items.');
      return;
    }

    const created = createPurchaseOrder({
      supplierId,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost,
      })),
      notes: notes.trim() || undefined,
      status,
    });

    if (created) {
      if (onCreated) {
        onCreated(created.id);
      }
      onClose();
    } else {
      setValidationError('Failed to create purchase order. Please check all fields.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto" id="create-po-modal">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Issue Purchase Order</h3>
              <p className="text-xs text-slate-500">Record a supplier procurement requisition</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Supplier Selector */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-600">
              Select Supply Vendor *
            </label>
            <select
              value={supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden bg-white font-medium text-slate-800"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category}) • Terms: {s.paymentTerms} • Lead Time: {s.leadTimeDays}d
                </option>
              ))}
            </select>

            {currentSupplier && (
              <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact</span>
                  <p className="font-semibold text-slate-900 truncate">{currentSupplier.contactPerson}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Email</span>
                  <p className="text-slate-600 truncate">{currentSupplier.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Terms</span>
                  <p className="font-semibold text-slate-900">{currentSupplier.paymentTerms}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Lead Time</span>
                  <p className="font-semibold text-slate-900">{currentSupplier.leadTimeDays} days</p>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase tracking-wider text-slate-600">
                Purchase Order Line Items ({items.length}) *
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                <p>No line items added yet.</p>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-100"
                >
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {calculatedRows.map((row, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
                  >
                    {/* Product Selection */}
                    <div className="flex-1 w-full sm:w-auto">
                      <select
                        value={row.productId}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:outline-hidden font-medium text-slate-800"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) {p.supplierId === supplierId ? '⭐' : ''}
                          </option>
                        ))}
                      </select>
                      {row.product && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>SKU: {row.product.sku}</span>
                          <span>•</span>
                          <span>In Stock: {row.product.stock}</span>
                          <span>•</span>
                          <span>Std Cost: {formatCurrency(row.product.costPrice)}</span>
                        </div>
                      )}
                    </div>

                    {/* Unit Cost */}
                    <div className="w-28">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Unit Cost ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.unitCost}
                        onChange={(e) => handleUnitCostChange(index, e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border bg-white focus:outline-hidden font-medium text-slate-800 ${
                          row.unitCost < 0 ? 'border-rose-400 bg-rose-50' : 'border-slate-300 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="w-24">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={row.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border bg-white focus:outline-hidden font-bold text-slate-900 ${
                          row.quantity <= 0 ? 'border-rose-400 bg-rose-50' : 'border-slate-300 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="w-28 sm:text-right self-end sm:self-center">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5 sm:hidden">Subtotal</label>
                      <p className="font-black text-slate-900">{formatCurrency(row.subtotal)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 self-end sm:self-center transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PurchaseOrderStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden bg-white font-medium text-slate-800"
              >
                <option value="ordered">Dispatched / Ordered</option>
                <option value="pending">Draft / Pending Approval</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Purchase Order Requisition Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Expedited dock delivery, Ref contract #2026-B"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="font-semibold text-xs">{validationError}</p>
            </div>
          )}

          {/* Order Totals Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Procurement Commitment
              </span>
              <p className="text-xl font-black tracking-tight text-white mt-0.5">
                {formatCurrency(totalCost)}
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {totalUnits} units across {items.length} line {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Inventory Impact
              </span>
              <p className="text-indigo-300 font-semibold text-[11px] mt-0.5">
                Stock changes only upon receipt
              </p>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={items.length === 0 || hasInvalidItem}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-xs shadow-indigo-600/20 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{status === 'ordered' ? 'Dispatch Purchase Order' : 'Save Draft Requisition'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
