import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Star, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  DollarSign, 
  ShoppingBag, 
  X,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Customer, CustomerTier } from '../../types';

export const CustomersView: React.FC = () => {
  const { 
    customers, 
    orders, 
    addCustomer, 
    formatCurrency, 
    formatPercent,
    repeatCustomerRate 
  } = useBusiness();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | CustomerTier>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    tier: 'Regular' as CustomerTier,
    location: '',
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
        c.location.toLowerCase().includes(search.toLowerCase());

      const matchTier = tierFilter === 'All' || c.tier === tierFilter;
      return matchSearch && matchTier;
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, search, tierFilter]);

  const vipCount = customers.filter(c => c.tier === 'VIP').length;
  const wholesaleCount = customers.filter(c => c.tier === 'Wholesale').length;
  const totalCustomerSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLtv = customers.length > 0 ? totalCustomerSpend / customers.length : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    addCustomer({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '+1 (555) 000-0000',
      company: formData.company.trim() || undefined,
      tier: formData.tier,
      location: formData.location.trim() || 'United States',
      status: 'active',
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      tier: 'Regular',
      location: '',
    });
    setIsAddModalOpen(false);
  };

  // Orders for selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => o.customerId === selectedCustomer.id);
  }, [selectedCustomer, orders]);

  return (
    <div className="space-y-6" id="bizpilot-customers-view">
      {/* Customer KPIs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Customer Base</span>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{customers.length}</h3>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Across retail, wholesale & B2B</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Lifetime Value (LTV)</span>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(avgLtv)}
            </h3>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Top 10% average {formatCurrency(avgLtv * 2.8)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VIP & Wholesale Accounts</span>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {vipCount + wholesaleCount}
            </h3>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-purple-700 font-medium mt-1">
            {vipCount} VIP clients • {wholesaleCount} Wholesale buyers
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Repeat Customer Rate</span>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatPercent(repeatCustomerRate)}
            </h3>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">High retention cohort</p>
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
              placeholder="Search by customer name, email, company, or city..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 text-xs focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          {(['All', 'VIP', 'Wholesale', 'Regular', 'New'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                tierFilter === tier
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier === 'All' ? 'All Customers' : `${tier} Tier`}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Client / Contact</th>
                <th className="py-3.5 px-4">Company / Location</th>
                <th className="py-3.5 px-4">Tier Segment</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Cumulative Spend (LTV)</th>
                <th className="py-3.5 px-4">Average Basket (AOV)</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Contact */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.email}</p>
                      </div>
                    </td>

                    {/* Company & Location */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{c.company || 'Direct Consumer'}</p>
                      <p className="text-[11px] text-slate-400">{c.location}</p>
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.tier === 'VIP'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : c.tier === 'Wholesale'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : c.tier === 'Regular'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.tier}
                      </span>
                    </td>

                    {/* Orders count */}
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                    </td>

                    {/* Spend */}
                    <td className="py-3 px-4 font-black text-slate-900">
                      {formatCurrency(c.totalSpent)}
                    </td>

                    {/* AOV */}
                    <td className="py-3 px-4 text-slate-600">
                      {formatCurrency(c.averageOrderValue)}
                    </td>

                    {/* Last Order Date */}
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {c.lastOrderDate}
                    </td>

                    {/* Profile Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-black text-base flex items-center justify-center">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedCustomer.email} • {selectedCustomer.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Account Stats Strip */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Lifetime Value</span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Total Orders</span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {selectedCustomer.totalOrders}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Tier Status</span>
                  <p className="text-base font-black text-purple-700 mt-0.5">
                    {selectedCustomer.tier}
                  </p>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Purchase History</span>
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No completed orders on file.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {customerOrders.map(o => (
                      <div key={o.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{o.orderNumber}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{o.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{formatCurrency(o.totalAmount)}</p>
                          <span className="text-[10px] font-bold text-emerald-600">
                            +{formatCurrency(o.grossProfit)} profit
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Customer Account</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. David Miller"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="david@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Miller Corp LLC"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Tier Classification</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as CustomerTier })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="New">New</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">City / Region</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Los Angeles, CA"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
