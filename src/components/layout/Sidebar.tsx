import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  BarChart3, 
  DollarSign, 
  Percent, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { useBusiness, TAB_ROUTES } from '../../context/BusinessContext';
import { ActiveTab } from '../../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeVariant?: 'alert' | 'info' | 'neutral';
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    lowStockProducts, 
    orders
  } = useBusiness();

  const pendingOrdersCount = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;

  const topItems: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard }
  ];

  const operationsGroup: NavGroup = {
    title: 'OPERATIONS',
    items: [
      { 
        id: 'inventory', 
        label: 'Inventory', 
        icon: Package, 
        badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined,
        badgeVariant: 'alert'
      },
      { 
        id: 'sales', 
        label: 'Sales', 
        icon: ShoppingCart,
        badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
        badgeVariant: 'info'
      },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'suppliers', label: 'Suppliers', icon: Truck }
    ]
  };

  const insightsGroup: NavGroup = {
    title: 'INSIGHTS',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'pricing', label: 'Pricing', icon: DollarSign },
      { id: 'discounts', label: 'Discounts', icon: Percent },
      { 
        id: 'ai_advisor', 
        label: 'AI Assistant', 
        icon: Sparkles,
        badge: 'AI',
        badgeVariant: 'neutral'
      }
    ]
  };

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <Link
        key={item.id}
        id={`nav-item-${item.id}`}
        to={TAB_ROUTES[item.id]}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
          isActive
            ? 'bg-slate-100 text-slate-900 font-semibold'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
        }`}
        title={!isSidebarOpen ? item.label : undefined}
      >
        <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
        
        {isSidebarOpen && (
          <span className="flex-1 text-left truncate">{item.label}</span>
        )}

        {isSidebarOpen && item.badge !== undefined && (
          <span
            className={`ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded ${
              item.badgeVariant === 'alert'
                ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                : item.badgeVariant === 'info'
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
            }`}
          >
            {item.badge}
          </span>
        )}

        {!isSidebarOpen && item.badge !== undefined && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
        )}
      </Link>
    );
  };

  return (
    <aside 
      id="bizpilot-sidebar"
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white text-slate-800 transition-all duration-300 ease-in-out border-r border-slate-200/90 select-none ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80">
        <Link 
          to="/dashboard"
          className="flex flex-col cursor-pointer overflow-hidden group min-w-0" 
          id="bizpilot-brand-toggle"
        >
          {isSidebarOpen ? (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold tracking-wider text-slate-900 uppercase font-sans leading-tight">
                BIZPILOT
              </span>
              <span className="text-[11px] font-normal text-slate-500 tracking-normal leading-tight">
                Business Intelligence
              </span>
            </div>
          ) : (
            <span className="text-sm font-extrabold tracking-wider text-slate-900 uppercase text-center w-full">
              BP
            </span>
          )}
        </Link>

        {/* Collapse toggle button */}
        <button
          id="toggle-sidebar-button"
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Top Overview Item */}
        <div className="space-y-1">
          {topItems.map(renderNavLink)}
        </div>

        {/* Operations Section */}
        <div className="space-y-1">
          {isSidebarOpen ? (
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {operationsGroup.title}
            </div>
          ) : (
            <div className="h-px bg-slate-100 my-2 mx-2" />
          )}
          {operationsGroup.items.map(renderNavLink)}
        </div>

        {/* Insights Section */}
        <div className="space-y-1">
          {isSidebarOpen ? (
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {insightsGroup.title}
            </div>
          ) : (
            <div className="h-px bg-slate-100 my-2 mx-2" />
          )}
          {insightsGroup.items.map(renderNavLink)}
        </div>
      </div>

      {/* Settings at Bottom */}
      <div className="p-3 border-t border-slate-200/80">
        {renderNavLink({ id: 'settings', label: 'Settings', icon: Settings })}
      </div>
    </aside>
  );
};
