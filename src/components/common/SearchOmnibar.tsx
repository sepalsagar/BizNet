import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Users, ShoppingCart, ArrowRight, X, Sparkles } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface SearchOmnibarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOmnibar: React.FC<SearchOmnibarProps> = ({ isOpen, onClose }) => {
  const { products, customers, orders, setActiveTab, formatCurrency } = useBusiness();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle global ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else (window as any).__openOmnibar?.();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredProducts = q
    ? products.filter(
        p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const filteredCustomers = q
    ? customers.filter(
        c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company && c.company.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const filteredOrders = q
    ? orders.filter(
        o => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const totalResults = filteredProducts.length + filteredCustomers.length + filteredOrders.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-slate-200 bg-white">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by SKU, name, customers, orders..."
            className="w-full px-3 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd 
            onClick={onClose}
            className="cursor-pointer px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200"
          >
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-8 text-center">
              <div className="inline-flex p-3 rounded-full bg-indigo-50 text-indigo-600 mb-2">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Quick Global Command Search</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Type any product name (e.g. "Keyboard"), customer name, SKU ("EL-"), or order number to jump immediately.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {['Keyboard', 'Headphones', 'Sarah Jenkins', 'ORD-2025', 'Apparel'].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setQuery(sample)}
                    className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-slate-800">No matching records found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching by a broader keyword, category name, or customer email.
              </p>
            </div>
          ) : (
            <>
              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <Package className="h-3.5 w-3.5" />
                    Products ({filteredProducts.length})
                  </div>
                  <div className="space-y-1">
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveTab('inventory');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {p.sku} • {p.category} • Stock: <span className="font-semibold">{p.stock}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">{formatCurrency(p.sellingPrice)}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            {(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(0)}% margin
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Section */}
              {filteredCustomers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <Users className="h-3.5 w-3.5" />
                    Customers ({filteredCustomers.length})
                  </div>
                  <div className="space-y-1">
                    {filteredCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setActiveTab('customers');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.email} {c.company ? `• ${c.company}` : ''}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            {c.tier} Tier
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">{formatCurrency(c.totalSpent)} spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {filteredOrders.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Orders ({filteredOrders.length})
                  </div>
                  <div className="space-y-1">
                    {filteredOrders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setActiveTab('sales');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{o.orderNumber}</p>
                          <p className="text-[11px] text-slate-500">{o.customerName} • {o.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">{formatCurrency(o.totalAmount)}</p>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400">
          <span>Press ESC to exit</span>
          <button
            onClick={() => {
              setActiveTab('ai_advisor');
              onClose();
            }}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            <Sparkles className="h-3 w-3" />
            <span>Ask BizPilot Copilot instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
