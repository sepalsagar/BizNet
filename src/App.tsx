import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { SearchOmnibar } from './components/common/SearchOmnibar';
import { CreateOrderModal } from './components/sales/CreateOrderModal';
import { ProductModal } from './components/inventory/ProductModal';

// Views - Dashboard is statically loaded for instant landing page TTI
import { DashboardView } from './components/dashboard/DashboardView';
import { RouteLoadingFallback } from './components/common/RouteLoadingFallback';

// Route-level code-splitting for secondary/deep modules
const InventoryView = React.lazy(() =>
  import('./components/inventory/InventoryView').then(m => ({ default: m.InventoryView }))
);
const SalesView = React.lazy(() =>
  import('./components/sales/SalesView').then(m => ({ default: m.SalesView }))
);
const CustomersView = React.lazy(() =>
  import('./components/customers/CustomersView').then(m => ({ default: m.CustomersView }))
);
const SuppliersView = React.lazy(() =>
  import('./components/suppliers/SuppliersView').then(m => ({ default: m.SuppliersView }))
);
const AnalyticsView = React.lazy(() =>
  import('./components/analytics/AnalyticsView').then(m => ({ default: m.AnalyticsView }))
);
const PricingSimulator = React.lazy(() =>
  import('./components/simulator/PricingSimulator').then(m => ({ default: m.PricingSimulator }))
);
const DiscountOptimizer = React.lazy(() =>
  import('./components/simulator/DiscountOptimizer').then(m => ({ default: m.DiscountOptimizer }))
);
const AiAdvisorView = React.lazy(() =>
  import('./components/advisor/AiAdvisorView').then(m => ({ default: m.AiAdvisorView }))
);
const SettingsView = React.lazy(() =>
  import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView }))
);

const AppContent: React.FC = () => {
  const { isSidebarOpen } = useBusiness();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Expose global omnibar opener
  React.useEffect(() => {
    (window as any).__openOmnibar = () => setIsSearchOpen(true);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        {/* Top Header */}
        <Header
          onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
          onOpenAddProduct={() => setIsAddProductOpen(true)}
          onToggleNotifications={() => setIsNotificationsOpen(prev => !prev)}
          onOpenOmnibar={() => setIsSearchOpen(true)}
        />

        {/* Scrollable View Canvas with URL Routes */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            <React.Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <DashboardView
                      onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
                      onOpenAddProduct={() => setIsAddProductOpen(true)}
                    />
                  }
                />
                <Route
                  path="/inventory"
                  element={<InventoryView onOpenAddProduct={() => setIsAddProductOpen(true)} />}
                />
                <Route path="/sales" element={<SalesView />} />
                <Route path="/customers" element={<CustomersView />} />
                <Route path="/suppliers" element={<SuppliersView />} />
                <Route path="/analytics" element={<AnalyticsView />} />
                <Route path="/pricing" element={<PricingSimulator />} />
                <Route path="/discounts" element={<DiscountOptimizer />} />
                <Route path="/assistant" element={<AiAdvisorView />} />
                <Route path="/ai_advisor" element={<Navigate to="/assistant" replace />} />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </React.Suspense>
          </div>
        </main>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Global ⌘K Search Omnibar */}
      <SearchOmnibar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Global Modals */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
      />

      <ProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <BusinessProvider>
        <AppContent />
      </BusinessProvider>
    </BrowserRouter>
  );
}
