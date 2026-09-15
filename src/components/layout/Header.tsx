import React from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Sparkles
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface HeaderProps {
  onOpenCreateOrder: () => void;
  onOpenAddProduct: () => void;
  onToggleNotifications: () => void;
  onOpenOmnibar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateOrder,
  onOpenAddProduct,
  onToggleNotifications,
  onOpenOmnibar,
}) => {
  const { 
    settings, 
    lowStockProducts, 
    orders, 
    activeTab, 
    setActiveTab
  } = useBusiness();

  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending');
  const alertCount = lowStockProducts.length + (pendingOrders.length > 0 ? 1 : 0);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Overview';
      case 'inventory': return 'Inventory & Stock Management';
      case 'sales': return 'Sales & Order Processing';
      case 'customers': return 'Customer Relationships & Tiers';
      case 'suppliers': return 'Supply Chain & Vendors';
      case 'analytics': return 'Performance & Margin Analytics';
      case 'pricing': return 'Pricing & Margin Simulator';
      case 'discounts': return 'Discount & Promotion Optimizer';
      case 'ai_advisor': return 'BizPilot Copilot AI Advisor';
      case 'settings': return 'Business Settings & Data Controls';
      default: return 'Business Dashboard';
    }
  };

  return (
    <header 
      id="bizpilot-header"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/90 bg-white px-6 select-none"
    >
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate">
            {settings.companyName} {settings.storeTagline ? `• ${settings.storeTagline}` : ''}
          </p>
        </div>
      </div>

      {/* Center Search Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div 
          onClick={onOpenOmnibar}
          id="header-omnibar-trigger"
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 text-slate-500 hover:border-slate-300 hover:bg-slate-100/60 text-xs cursor-pointer transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="flex-1 text-slate-500 text-xs">Search products, customers, orders...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Live System Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Operations Active</span>
        </div>

        {/* AI Copilot Quick Jump Button */}
        {activeTab !== 'ai_advisor' && (
          <button
            id="header-ai-quick-btn"
            onClick={() => setActiveTab('ai_advisor')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Ask Copilot</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          id="header-notifications-btn"
          onClick={onToggleNotifications}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Alerts and Notifications"
        >
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-2xs">
              {alertCount}
            </span>
          )}
        </button>

        {/* Quick Add Actions */}
        <div className="flex items-center gap-1.5 ml-1">
          <button
            id="quick-add-product-btn"
            onClick={onOpenAddProduct}
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>Product</span>
          </button>

          <button
            id="quick-record-sale-btn"
            onClick={onOpenCreateOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>
    </header>
  );
};
