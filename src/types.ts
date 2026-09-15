export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type OrderStatus = 'completed' | 'processing' | 'shipped' | 'pending' | 'cancelled';
export type CustomerTier = 'VIP' | 'Wholesale' | 'Regular' | 'New';
export type SupplierStatus = 'preferred' | 'reliable' | 'watch';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderPoint: number;
  supplierId: string;
  supplierName: string;
  status: StockStatus;
  salesCount: number;
  unit: string;
  description?: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  subtotal: number;
  profit: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number; // in percentage e.g. 38.5
  status: OrderStatus;
  paymentMethod: string;
  channel: 'Online' | 'In-Store' | 'Wholesale' | 'B2B';
  stockRestored?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  tier: CustomerTier;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  rating: number; // 1 to 5
  leadTimeDays: number;
  activeProductsCount: number;
  totalPurchases: number;
  status: SupplierStatus;
  paymentTerms: string;
}

export type PurchaseOrderStatus = 'pending' | 'ordered' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  date: string;
  createdAt: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  totalItems: number;
  status: PurchaseOrderStatus;
  paymentTerms?: string;
  leadTimeDays?: number;
  notes?: string;
  stockReceived?: boolean;
  receivedAt?: string;
}

export interface BusinessSettings {
  companyName: string;
  storeTagline: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // e.g. 8.25
  lowStockThresholdDefault: number;
  targetMarginPct: number;
  autoReorderAlerts: boolean;
  businessType: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  metricsContext?: {
    revenue?: number;
    margin?: number;
    lowStockCount?: number;
  };
}

export type ActiveTab = 
  | 'dashboard' 
  | 'inventory' 
  | 'sales' 
  | 'customers' 
  | 'suppliers' 
  | 'analytics' 
  | 'pricing' 
  | 'discounts' 
  | 'ai_advisor' 
  | 'settings';

export type WorkspaceMode = 'demo' | 'client';

export interface WorkspaceIdentity {
  mode: WorkspaceMode;
  id: string;
}
