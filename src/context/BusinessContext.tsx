import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Product, 
  Customer, 
  Order, 
  Supplier, 
  BusinessSettings, 
  ActiveTab, 
  StockStatus, 
  OrderStatus,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus
} from '../types';
import { 
  initialProducts, 
  initialCustomers, 
  initialOrders, 
  initialSuppliers, 
  initialSettings,
  initialPurchaseOrders
} from '../data/initialData';

interface CategoryBreakdown {
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  marginPct: number;
  itemCount: number;
  stockCount: number;
}

interface DailyTrend {
  date: string;
  displayDate: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  marginPct: number;
}

interface BusinessContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  settings: BusinessSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  addProduct: (product: Omit<Product, 'id' | 'status' | 'salesCount' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  addOrder: (orderData: {
    customerId: string;
    items: { productId: string; quantity: number; unitPrice?: number }[];
    channel: 'Online' | 'In-Store' | 'Wholesale' | 'B2B';
    paymentMethod: string;
    status?: OrderStatus;
  }) => Order | null;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  createPurchaseOrder: (poData: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost?: number }[];
    notes?: string;
    status?: PurchaseOrderStatus;
  }) => PurchaseOrder | null;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrderStatus) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'averageOrderValue' | 'lastOrderDate'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetToDefaultData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;

  // Computed Business Metrics
  totalRevenue: number;
  totalCostOfGoodsSold: number;
  grossProfit: number;
  grossMarginPct: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  totalInventoryValuation: number;
  totalRetailValuation: number;
  potentialInventoryProfit: number;
  repeatCustomerRate: number;
  dailyTrends: DailyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  topSellingProducts: { product: Product; revenue: number; unitsSold: number }[];
  slowMovingProducts: Product[];

  // Utility formatters
  formatCurrency: (amount: number) => string;
  formatPercent: (val: number) => string;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'bizpilot_products_v1',
  CUSTOMERS: 'bizpilot_customers_v1',
  ORDERS: 'bizpilot_orders_v1',
  SUPPLIERS: 'bizpilot_suppliers_v1',
  PURCHASE_ORDERS: 'bizpilot_purchase_orders_v1',
  SETTINGS: 'bizpilot_settings_v1',
};

export const TAB_ROUTES: Record<ActiveTab, string> = {
  dashboard: '/dashboard',
  inventory: '/inventory',
  sales: '/sales',
  customers: '/customers',
  suppliers: '/suppliers',
  analytics: '/analytics',
  pricing: '/pricing',
  discounts: '/discounts',
  ai_advisor: '/assistant',
  settings: '/settings',
};

export const ROUTE_TABS: Record<string, ActiveTab> = {
  '/dashboard': 'dashboard',
  '/inventory': 'inventory',
  '/sales': 'sales',
  '/customers': 'customers',
  '/suppliers': 'suppliers',
  '/analytics': 'analytics',
  '/pricing': 'pricing',
  '/discounts': 'discounts',
  '/assistant': 'ai_advisor',
  '/ai_advisor': 'ai_advisor',
  '/settings': 'settings',
};

export function getTabFromPath(pathname: string): ActiveTab {
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return ROUTE_TABS[normalized] || 'dashboard';
}

function determineStockStatus(stock: number, reorderPoint: number): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= reorderPoint) return 'low_stock';
  return 'in_stock';
}

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialProducts;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialCustomers;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialOrders;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialSuppliers;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialPurchaseOrders;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialSettings;
  });

  const activeTab = useMemo<ActiveTab>(() => {
    return getTabFromPath(location.pathname);
  }, [location.pathname]);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    const targetPath = TAB_ROUTES[tab] || '/dashboard';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [location.pathname, navigate]);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Utility formatters
  const formatCurrency = (amount: number) => {
    return `${settings.currencySymbol || '₹'}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercent = (val: number) => {
    return `${val.toFixed(1)}%`;
  };

  // Actions
  const addProduct = (newProduct: Omit<Product, 'id' | 'status' | 'salesCount' | 'updatedAt'>) => {
    const id = `prod-${Date.now()}`;
    const status = determineStockStatus(newProduct.stock, newProduct.reorderPoint);
    const createdProduct: Product = {
      ...newProduct,
      id,
      status,
      salesCount: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [createdProduct, ...prev]);
    return createdProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] };
        updated.status = determineStockStatus(updated.stock, updated.reorderPoint);
        return updated;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStock = Math.max(0, p.stock + delta);
        return {
          ...p,
          stock: newStock,
          status: determineStockStatus(newStock, p.reorderPoint),
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const addOrder = ({
    customerId,
    items,
    channel,
    paymentMethod,
    status = 'completed',
  }: {
    customerId: string;
    items: { productId: string; quantity: number; unitPrice?: number }[];
    channel: 'Online' | 'In-Store' | 'Wholesale' | 'B2B';
    paymentMethod: string;
    status?: OrderStatus;
  }): Order | null => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || items.length === 0) return null;

    let totalAmount = 0;
    let totalCost = 0;
    const orderItems = [];

    // Check & calculate items
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) continue;
      const unitPrice = item.unitPrice ?? prod.sellingPrice;
      const unitCost = prod.costPrice;
      const subtotal = unitPrice * item.quantity;
      const profit = subtotal - (unitCost * item.quantity);

      totalAmount += subtotal;
      totalCost += unitCost * item.quantity;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: item.quantity,
        unitPrice,
        unitCost,
        subtotal,
        profit,
      });

      // Deduct stock and increment sales count
      adjustStock(prod.id, -item.quantity);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id ? { ...p, salesCount: p.salesCount + item.quantity } : p
        )
      );
    }

    const grossProfit = totalAmount - totalCost;
    const profitMargin = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString().split('T')[0],
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items: orderItems,
      totalAmount,
      totalCost,
      grossProfit,
      profitMargin,
      status,
      paymentMethod,
      channel,
      stockRestored: false,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update customer stats
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customer.id) return c;
        const newTotalOrders = c.totalOrders + 1;
        const newTotalSpent = c.totalSpent + totalAmount;
        const newAov = newTotalSpent / newTotalOrders;
        let newTier = c.tier;
        if (newTotalSpent >= 3000 && c.tier !== 'Wholesale') newTier = 'VIP';
        return {
          ...c,
          totalOrders: newTotalOrders,
          totalSpent: newTotalSpent,
          averageOrderValue: newAov,
          tier: newTier,
          lastOrderDate: new Date().toISOString().split('T')[0],
        };
      })
    );

    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder || targetOrder.status === status) return;

    const isCancelling = status === 'cancelled' && targetOrder.status !== 'cancelled' && !targetOrder.stockRestored;
    const isReactivating = targetOrder.status === 'cancelled' && status !== 'cancelled' && Boolean(targetOrder.stockRestored);

    if (isCancelling) {
      // Build map of product IDs to quantities to restore
      const restoreMap = new Map<string, number>();
      for (const item of targetOrder.items) {
        if (item.productId && typeof item.quantity === 'number' && item.quantity > 0) {
          restoreMap.set(item.productId, (restoreMap.get(item.productId) || 0) + item.quantity);
        }
      }

      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const qtyToRestore = restoreMap.get(p.id);
          if (qtyToRestore === undefined || qtyToRestore <= 0) return p;
          const newStock = Math.max(0, p.stock + qtyToRestore);
          return {
            ...p,
            stock: newStock,
            status: determineStockStatus(newStock, p.reorderPoint),
            salesCount: Math.max(0, (p.salesCount || 0) - qtyToRestore),
            updatedAt: new Date().toISOString().split('T')[0],
          };
        })
      );

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === id ? { ...o, status, stockRestored: true } : o
        )
      );
    } else if (isReactivating) {
      // Re-deduct stock if reactivating from a cancelled state where stock was previously restored
      const deductMap = new Map<string, number>();
      for (const item of targetOrder.items) {
        if (item.productId && typeof item.quantity === 'number' && item.quantity > 0) {
          deductMap.set(item.productId, (deductMap.get(item.productId) || 0) + item.quantity);
        }
      }

      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const qtyToDeduct = deductMap.get(p.id);
          if (qtyToDeduct === undefined || qtyToDeduct <= 0) return p;
          const newStock = Math.max(0, p.stock - qtyToDeduct);
          return {
            ...p,
            stock: newStock,
            status: determineStockStatus(newStock, p.reorderPoint),
            salesCount: (p.salesCount || 0) + qtyToDeduct,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        })
      );

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === id ? { ...o, status, stockRestored: false } : o
        )
      );
    } else {
      // Normal status transition (e.g. pending -> processing -> shipped -> completed)
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === id ? { ...o, status } : o))
      );
    }
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'averageOrderValue' | 'lastOrderDate'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const createPurchaseOrder = ({
    supplierId,
    items,
    notes,
    status = 'ordered',
  }: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost?: number }[];
    notes?: string;
    status?: PurchaseOrderStatus;
  }): PurchaseOrder | null => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier || !items || items.length === 0) return null;

    // Validate that every item has quantity > 0 and unitCost >= 0
    const validItems = items.filter((i) => {
      const q = Number(i.quantity);
      const c = i.unitCost !== undefined ? Number(i.unitCost) : 0;
      return !isNaN(q) && q > 0 && !isNaN(c) && c >= 0;
    });

    if (validItems.length === 0 || validItems.length !== items.length) {
      return null;
    }

    let totalAmount = 0;
    let totalItems = 0;
    const poItems: PurchaseOrderItem[] = [];

    for (const item of validItems) {
      const prod = products.find((p) => p.id === item.productId);
      const quantity = Math.floor(Number(item.quantity));
      const unitCost = item.unitCost !== undefined ? Number(item.unitCost) : (prod ? prod.costPrice : 0);
      const subtotal = Math.round(unitCost * quantity * 100) / 100;

      totalAmount += subtotal;
      totalItems += quantity;

      poItems.push({
        productId: item.productId,
        productName: prod ? prod.name : 'Custom Item',
        sku: prod ? prod.sku : 'SKU-CUSTOM',
        quantity,
        unitCost,
        subtotal,
      });
    }

    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      date: dateStr,
      createdAt: now.toISOString(),
      items: poItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalItems,
      status,
      paymentTerms: supplier.paymentTerms,
      leadTimeDays: supplier.leadTimeDays,
      notes: notes?.trim() || undefined,
      stockReceived: false,
    };

    // Note: Creating or ordering a PO does NOT modify inventory
    setPurchaseOrders((prev) => [newPO, ...prev]);

    return newPO;
  };

  const updatePurchaseOrderStatus = (id: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders((prev) => {
      const targetPO = prev.find((p) => p.id === id);
      if (!targetPO || targetPO.status === status) return prev;

      if (status === 'received' && !targetPO.stockReceived) {
        // Stock is increased exactly once when status becomes received
        const qtyMap = new Map<string, number>();
        for (const item of targetPO.items) {
          if (item.productId && typeof item.quantity === 'number' && item.quantity > 0) {
            qtyMap.set(item.productId, (qtyMap.get(item.productId) || 0) + item.quantity);
          }
        }

        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const qtyToAdd = qtyMap.get(p.id);
            if (qtyToAdd === undefined || qtyToAdd <= 0) return p;
            const newStock = p.stock + qtyToAdd;
            return {
              ...p,
              stock: newStock,
              status: determineStockStatus(newStock, p.reorderPoint),
              updatedAt: new Date().toISOString().split('T')[0],
            };
          })
        );

        return prev.map((po) =>
          po.id === id
            ? {
                ...po,
                status: 'received',
                stockReceived: true,
                receivedAt: new Date().toISOString().split('T')[0],
              }
            : po
        );
      }

      return prev.map((po) => (po.id === id ? { ...po, status } : po));
    });
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefaultData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setOrders(initialOrders);
    setSuppliers(initialSuppliers);
    setPurchaseOrders(initialPurchaseOrders);
    setSettings(initialSettings);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.PURCHASE_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  const exportDataJSON = () => {
    const bundle = {
      products,
      customers,
      orders,
      suppliers,
      purchaseOrders,
      settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(bundle, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.orders && Array.isArray(data.orders)) setOrders(data.orders);
      if (data.suppliers && Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (data.purchaseOrders && Array.isArray(data.purchaseOrders)) setPurchaseOrders(data.purchaseOrders);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  };

  // Computed Business Metrics
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'cancelled');
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [activeOrders]);

  const totalCostOfGoodsSold = useMemo(() => {
    return activeOrders.reduce((sum, o) => sum + o.totalCost, 0);
  }, [activeOrders]);

  const grossProfit = useMemo(() => {
    return totalRevenue - totalCostOfGoodsSold;
  }, [totalRevenue, totalCostOfGoodsSold]);

  const grossMarginPct = useMemo(() => {
    return totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  }, [totalRevenue, grossProfit]);

  const totalOrdersCount = useMemo(() => {
    return activeOrders.length;
  }, [activeOrders]);

  const averageOrderValue = useMemo(() => {
    return totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  }, [totalRevenue, totalOrdersCount]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= p.reorderPoint);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => p.stock === 0);
  }, [products]);

  const totalInventoryValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  }, [products]);

  const totalRetailValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
  }, [products]);

  const potentialInventoryProfit = useMemo(() => {
    return totalRetailValuation - totalInventoryValuation;
  }, [totalRetailValuation, totalInventoryValuation]);

  const repeatCustomerRate = useMemo(() => {
    if (customers.length === 0) return 0;
    const repeatCount = customers.filter((c) => c.totalOrders > 1).length;
    return (repeatCount / customers.length) * 100;
  }, [customers]);

  // Daily Trends for Charts
  const dailyTrends = useMemo(() => {
    const map = new Map<string, { revenue: number; cost: number; profit: number; orders: number }>();
    
    // Seed the map with the last 21 days
    const today = new Date();
    for (let i = 20; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map.set(key, { revenue: 0, cost: 0, profit: 0, orders: 0 });
    }

    // Populate with orders
    activeOrders.forEach((order) => {
      const existing = map.get(order.date);
      if (existing) {
        existing.revenue += order.totalAmount;
        existing.cost += order.totalCost;
        existing.profit += order.grossProfit;
        existing.orders += 1;
      } else {
        map.set(order.date, {
          revenue: order.totalAmount,
          cost: order.totalCost,
          profit: order.grossProfit,
          orders: 1,
        });
      }
    });

    const sortedEntries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    return sortedEntries.map(([date, data]) => {
      const parts = date.split('-');
      const displayDate = parts.length === 3 ? `${parts[1]}/${parts[2]}` : date;
      const marginPct = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
      return {
        date,
        displayDate,
        revenue: Math.round(data.revenue),
        cost: Math.round(data.cost),
        profit: Math.round(data.profit),
        orders: data.orders,
        marginPct: Math.round(marginPct * 10) / 10,
      };
    });
  }, [activeOrders]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const cats = new Map<string, { revenue: number; cost: number; profit: number; itemCount: number; stockCount: number }>();

    // Initial item and stock counts
    products.forEach((p) => {
      const cur = cats.get(p.category) || { revenue: 0, cost: 0, profit: 0, itemCount: 0, stockCount: 0 };
      cur.itemCount += 1;
      cur.stockCount += p.stock;
      cats.set(p.category, cur);
    });

    // Revenue and cost from orders
    activeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const catName = prod ? prod.category : 'General';
        const cur = cats.get(catName) || { revenue: 0, cost: 0, profit: 0, itemCount: 0, stockCount: 0 };
        cur.revenue += item.subtotal;
        cur.cost += item.unitCost * item.quantity;
        cur.profit += item.profit;
        cats.set(catName, cur);
      });
    });

    return Array.from(cats.entries()).map(([name, data]) => {
      const marginPct = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
      return {
        name,
        revenue: Math.round(data.revenue),
        cost: Math.round(data.cost),
        profit: Math.round(data.profit),
        marginPct: Math.round(marginPct * 10) / 10,
        itemCount: data.itemCount,
        stockCount: data.stockCount,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [products, activeOrders]);

  // Top products by revenue
  const topSellingProducts = useMemo(() => {
    const map = new Map<string, { product: Product; revenue: number; unitsSold: number }>();
    
    activeOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return;
        const cur = map.get(prod.id) || { product: prod, revenue: 0, unitsSold: 0 };
        cur.revenue += item.subtotal;
        cur.unitsSold += item.quantity;
        map.set(prod.id, cur);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [products, activeOrders]);

  // Slow moving products (stock > 20, but sales < 120)
  const slowMovingProducts = useMemo(() => {
    return products.filter((p) => p.stock > 15 && p.salesCount < 120);
  }, [products]);

  return (
    <BusinessContext.Provider
      value={{
        products,
        customers,
        orders,
        suppliers,
        purchaseOrders,
        settings,
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        searchQuery,
        setSearchQuery,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addOrder,
        updateOrderStatus,
        createPurchaseOrder,
        updatePurchaseOrderStatus,
        addCustomer,
        updateCustomer,
        addSupplier,
        updateSupplier,
        updateSettings,
        resetToDefaultData,
        exportDataJSON,
        importDataJSON,
        totalRevenue,
        totalCostOfGoodsSold,
        grossProfit,
        grossMarginPct,
        totalOrdersCount,
        averageOrderValue,
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValuation,
        totalRetailValuation,
        potentialInventoryProfit,
        repeatCustomerRate,
        dailyTrends,
        categoryBreakdown,
        topSellingProducts,
        slowMovingProducts,
        formatCurrency,
        formatPercent,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
