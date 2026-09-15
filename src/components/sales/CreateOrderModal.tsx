import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItemRow {
  productId: string;
  quantity: number;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  const { customers, products, addOrder, settings } = useBusiness();
  const formatCurrency = formatIndianCurrency;

  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || '');
  const [channel, setChannel] = useState<'Online' | 'In-Store' | 'Wholesale' | 'B2B'>('In-Store');
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [status, setStatus] = useState<'completed' | 'processing' | 'pending'>('completed');
  
  const [items, setItems] = useState<OrderItemRow[]>([
    { productId: products.find(p => p.stock > 0)?.id || products[0]?.id || '', quantity: 1 }
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      setCustomerId(customers[0]?.id || '');
      setChannel('In-Store');
      setPaymentMethod('Credit Card');
      setStatus('completed');
      const initialProd = products.find(p => p.stock > 0) || products[0];
      setItems([{ productId: initialProd ? initialProd.id : '', quantity: 1 }]);
      setValidationError(null);
    }
  }, [isOpen, customers, products]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setValidationError(null);
    const available = products.find(p => p.stock > 0) || products[0];
    setItems(prev => [...prev, { productId: available ? available.id : '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setValidationError(null);
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', val: any) => {
    setValidationError(null);
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: val };
    }));
  };

  // Calculations
  let totalAmount = 0;
  let totalCost = 0;
  let hasStockError = false;

  items.forEach(row => {
    const prod = products.find(p => p.id === row.productId);
    if (prod) {
      const subtotal = prod.sellingPrice * row.quantity;
      const cost = prod.costPrice * row.quantity;
      totalAmount += subtotal;
      totalCost += cost;

      if (row.quantity > prod.stock || row.quantity <= 0) {
        hasStockError = true;
      }
    }
  });

  const grossProfit = totalAmount - totalCost;
  const marginPct = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || totalAmount <= 0) {
      setValidationError('Please select valid products for this transaction.');
      return;
    }
    if (hasStockError) {
      setValidationError('One or more product quantities exceed currently available stock.');
      return;
    }

    addOrder({
      customerId,
      items: items.map(i => ({ productId: i.productId, quantity: Number(i.quantity) })),
      channel,
      paymentMethod,
      status,
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      id="bizpilot-create-order-modal"
    >
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Record Sale
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Process a new transaction and update inventory levels.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-medium">
              {validationError}
            </div>
          )}

          {/* Section 1: Customer & Channel */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Customer & Channel
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Customer Picker */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer Account *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier} Tier) {c.company ? `• ${c.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales Channel */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sales Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden"
                >
                  <option value="Online">Online Store</option>
                  <option value="In-Store">In-Store / POS</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="B2B">Corporate B2B</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden"
                >
                  <option value="Credit Card">Credit Card / Debit</option>
                  <option value="UPI / QR">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cash">Cash</option>
                  <option value="Corporate Invoice">Corporate Invoice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden"
                >
                  <option value="completed">Completed (Dispatched & Paid)</option>
                  <option value="processing">Processing (Packing)</option>
                  <option value="pending">Pending Payment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Line Items Builder */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Items ({items.length})
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto border border-slate-200/80 rounded-lg p-2 bg-slate-50/40">
              {items.map((row, idx) => {
                const prod = products.find(p => p.id === row.productId);
                const isOver = prod && (row.quantity > prod.stock || prod.stock === 0);

                return (
                  <div key={idx} className="py-2 flex items-center gap-2.5">
                    {/* Product Select */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={row.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-xs bg-white focus:outline-hidden truncate"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.stock === 0}>
                            {p.name} ({formatCurrency(p.sellingPrice)}) {p.stock === 0 ? '- OUT OF STOCK' : `[Stock: ${p.stock}]`}
                          </option>
                        ))}
                      </select>
                      {isOver && (
                        <p className="text-[11px] text-rose-600 mt-0.5">
                          {prod.stock === 0 ? 'Product is out of stock' : `Only ${prod.stock} unit(s) available`}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="w-16 shrink-0">
                      <input
                        type="number"
                        min="1"
                        max={prod ? prod.stock : 999}
                        value={row.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className={`w-full px-2 py-1.5 rounded-md border text-xs text-center font-mono focus:outline-hidden ${
                          isOver ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-white'
                        }`}
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="w-24 text-right text-xs font-mono font-medium text-slate-900 shrink-0">
                      {prod ? formatCurrency(prod.sellingPrice * row.quantity) : formatCurrency(0)}
                    </div>

                    {/* Delete item */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                        title="Remove Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Order Summary & Economics */}
          <div className="p-4 rounded-lg bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Gross Transaction Revenue:</span>
              <span className="text-sm font-medium font-mono text-white">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Cost of Goods (COGS):</span>
              <span className="font-mono">{formatCurrency(totalCost)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Projected Gross Profit:</span>
              <div className="text-right font-mono">
                <span className="font-medium text-emerald-400">+{formatCurrency(grossProfit)}</span>
                <span className="ml-2 text-slate-400">({marginPct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasStockError || items.length === 0}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-2xs"
            >
              Record Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

