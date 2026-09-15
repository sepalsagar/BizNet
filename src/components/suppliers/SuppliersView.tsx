import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Star, 
  Mail, 
  Phone, 
  Clock, 
  Package, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';
import { formatIndianPhone } from '../../utils/formatters';
import { Supplier, SupplierStatus } from '../../types';
import { CreatePurchaseOrderModal } from './CreatePurchaseOrderModal';
import { PurchaseOrdersLedger } from './PurchaseOrdersLedger';

export const SuppliersView: React.FC = () => {
  const { suppliers, products, purchaseOrders, addSupplier } = useBusiness();
  const formatCurrency = formatIndianCurrency;

  const [subTab, setSubTab] = useState<'vendors' | 'orders'>('vendors');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);
  const [selectedSupplierForPO, setSelectedSupplierForPO] = useState<string | null>(null);
  const [poSuccessBanner, setPoSuccessBanner] = useState<string | null>(null);

  // New supplier form
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'Electronics',
    leadTimeDays: '7',
    paymentTerms: 'Net 30',
    status: 'preferred' as SupplierStatus,
  });

  const categories = ['All', 'Electronics', 'Home & Kitchen', 'Apparel', 'Health & Wellness', 'Industrial'];

  const filteredSuppliers = suppliers.filter(s => {
    const matchSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    
    const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0);
  const avgLeadTime = suppliers.length > 0 
    ? (suppliers.reduce((sum, s) => sum + s.leadTimeDays, 0) / suppliers.length).toFixed(1) 
    : '0';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    addSupplier({
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim() || 'Purchasing Rep',
      email: formData.email.trim(),
      phone: formData.phone.trim() || '+1 (555) 000-0000',
      category: formData.category,
      leadTimeDays: parseInt(formData.leadTimeDays) || 7,
      rating: 4.8,
      activeProductsCount: 0,
      totalPurchases: 0,
      status: formData.status,
      paymentTerms: formData.paymentTerms,
    });

    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      category: 'Electronics',
      leadTimeDays: '7',
      paymentTerms: 'Net 30',
      status: 'preferred',
    });
    setIsAddModalOpen(false);
  };

  const handleOpenCreatePO = (supplierId?: string) => {
    setSelectedSupplierForPO(supplierId || null);
    setIsCreatePOModalOpen(true);
  };

  return (
    <div className="space-y-8" id="bizpilot-suppliers-view">
      {/* Page Header and View Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage supply partners, procurement terms, and purchase orders.
          </p>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab('vendors')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              subTab === 'vendors'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Supply Partners ({suppliers.length})</span>
          </button>
          <button
            onClick={() => setSubTab('orders')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              subTab === 'orders'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenCreatePO()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* PO Success Banner */}
      {poSuccessBanner && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{poSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setPoSuccessBanner(null)}
            className="text-emerald-500 hover:text-emerald-700 p-0.5 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {subTab === 'orders' ? (
        <PurchaseOrdersLedger onCreatePO={() => handleOpenCreatePO()} />
      ) : (
        <>
          {/* Supplier KPIs Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Supply Partners</span>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{suppliers.length}</h3>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Truck className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Direct manufacturer & mill contracts</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Purchase Volume</span>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(totalPurchases)}
                </h3>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Cumulative inventory acquisitions</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Average Lead Time</span>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {avgLeadTime} <span className="text-xs font-normal text-slate-500">days</span>
                </h3>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Fastest: 6 days (Terra Organics)</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Supplier Reliability</span>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">96.8%</h3>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-purple-700 font-medium mt-1">
                {suppliers.filter(s => s.status === 'preferred').length} Preferred tier vendors
              </p>
            </div>
          </div>

          {/* Control Ribbon */}
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendors by name, representative, or email..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 text-xs focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Vendor</span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSuppliers.map(s => {
              const supplierProducts = products.filter(p => p.supplierId === s.id);
              return (
                <div 
                  key={s.id}
                  className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {s.category}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">{s.name}</h4>
                      </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 border ${
                        s.status === 'preferred'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : s.status === 'reliable'
                          ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                          : 'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Rating & Lead Time */}
                    <div className="flex items-center gap-4 py-2 border-y border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{s.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{s.leadTimeDays}d lead time</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        <span>{supplierProducts.length} active SKUs</span>
                      </div>
                    </div>

                    {/* Contact Rep Details */}
                    <div className="py-3 space-y-1.5 text-xs text-slate-500">
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>Contact:</span>
                        <strong className="text-slate-900">{s.contactPerson}</strong>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{s.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatIndianPhone(s.phone)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer Specs & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Terms: {s.paymentTerms}</span>
                    <button
                      onClick={() => handleOpenCreatePO(s.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                    >
                      Issue Reorder PO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Persistent Create Purchase Order Modal */}
      <CreatePurchaseOrderModal
        isOpen={isCreatePOModalOpen}
        onClose={() => setIsCreatePOModalOpen(false)}
        initialSupplierId={selectedSupplierForPO}
        onCreated={() => {
          setSubTab('orders');
          setPoSuccessBanner('Purchase Order has been recorded in your business ledger.');
          setTimeout(() => setPoSuccessBanner(null), 4000);
        }}
      />

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-white">
              <h3 className="text-base font-bold text-slate-900">Register Supply Vendor</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Electronics Ltd"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Key Representative</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="David Chen"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rep@supplier.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.leadTimeDays}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="Net 30"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

