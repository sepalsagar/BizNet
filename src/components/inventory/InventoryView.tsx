import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';
import { Product, StockStatus } from '../../types';
import { ProductModal } from './ProductModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface InventoryViewProps {
  onOpenAddProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenAddProduct }) => {
  const { 
    products, 
    deleteProduct, 
    adjustStock, 
    totalInventoryValuation, 
    totalRetailValuation, 
    lowStockProducts, 
    outOfStockProducts,
    settings 
  } = useBusiness();

  const formatCurrency = formatIndianCurrency;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | StockStatus>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'margin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Product Edit Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Product Delete Confirmation state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Dynamic Categories from existing products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(search.toLowerCase());
      
      const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      if (sortBy === 'stock') comparison = a.stock - b.stock;
      if (sortBy === 'price') comparison = a.sellingPrice - b.sellingPrice;
      if (sortBy === 'margin') {
        const marginA = ((a.sellingPrice - a.costPrice) / (a.sellingPrice || 1)) * 100;
        const marginB = ((b.sellingPrice - b.costPrice) / (b.sellingPrice || 1)) * 100;
        comparison = marginA - marginB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, search, categoryFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = (key: 'name' | 'stock' | 'price' | 'margin') => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleOpenAdd = () => {
    if (onOpenAddProduct) {
      onOpenAddProduct();
    } else {
      setIsAddModalOpen(true);
    }
  };

  const totalAttentionCount = lowStockProducts.length + outOfStockProducts.length;

  return (
    <div className="space-y-8" id="bizpilot-inventory-view">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your products and stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="inventory-add-product-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Inventory KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Products */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Products
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {products.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Active SKUs</p>
          </div>
        </div>

        {/* Inventory Value (Cost) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Inventory Value
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalInventoryValuation)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total at cost</p>
          </div>
        </div>

        {/* Retail Value */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Retail Valuation
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalRetailValuation)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total selling value</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Low Stock Items
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {totalAttentionCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {outOfStockProducts.length > 0 
                ? `${outOfStockProducts.length} out of stock` 
                : 'Need attention'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between text-xs font-medium shadow-2xs">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-300 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, SKU, or supplier..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 text-xs focus:outline-hidden bg-slate-50/50 hover:bg-white transition-colors"
            />
          </div>

          {/* Action Selects */}
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
            {categories.map((cat) => (
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
        )}
      </div>

      {/* Products Table Card */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {products.length === 0 ? (
          /* Entire Catalog Empty State */
          <div className="py-16 px-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No products yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your first product to start managing your inventory and tracking stock levels.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Search/Filter Empty State */
          <div className="py-12 px-6 text-center text-xs text-slate-500">
            <p>No products match your current search or filter criteria.</p>
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
                setStatusFilter('all');
              }}
              className="mt-3 text-xs font-medium text-slate-900 underline hover:text-slate-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  <th 
                    className="py-3 px-5 cursor-pointer hover:text-slate-900 select-none" 
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Product
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none" 
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Price
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none" 
                    onClick={() => toggleSort('margin')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Margin
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-center cursor-pointer hover:text-slate-900 select-none" 
                    onClick={() => toggleSort('stock')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Stock
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => {
                  const marginPct = ((p.sellingPrice - p.costPrice) / (p.sellingPrice || 1)) * 100;
                  
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.reorderPoint;
                  const isCritical = p.stock > 0 && p.stock <= Math.max(1, Math.floor(p.reorderPoint / 2));

                  let statusLabel = 'In Stock';
                  let statusClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';

                  if (isOutOfStock) {
                    statusLabel = 'Out of Stock';
                    statusClass = 'bg-rose-50 text-rose-700 border border-rose-200/60';
                  } else if (isCritical) {
                    statusLabel = 'Critical';
                    statusClass = 'bg-rose-50 text-rose-700 border border-rose-200/60';
                  } else if (isLowStock) {
                    statusLabel = 'Low Stock';
                    statusClass = 'bg-amber-50 text-amber-700 border border-amber-200/60';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product & SKU */}
                      <td className="py-3.5 px-5">
                        <div className="min-w-0 max-w-[240px]">
                          <p className="font-medium text-slate-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {p.sku} {p.supplierName ? `• ${p.supplierName}` : ''}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.category}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {formatCurrency(p.costPrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      {/* Margin */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className={`text-xs ${
                          marginPct >= settings.targetMarginPct
                            ? 'text-emerald-700 font-medium'
                            : 'text-slate-600'
                        }`}>
                          {marginPct.toFixed(1)}%
                        </span>
                      </td>

                      {/* Stock Level with +/- Adjusters */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                            title="Decrease stock by 1"
                            aria-label="Decrease stock"
                          >
                            <MinusCircle className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-medium text-slate-900 font-mono min-w-[28px] text-center">
                            {p.stock}
                          </span>
                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                            title="Increase stock by 1"
                            aria-label="Increase stock"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit Product"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            title="Delete Product"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => {
          if (!isDeleting) setProductToDelete(null);
        }}
        onConfirm={() => {
          if (productToDelete) {
            setIsDeleting(true);
            const name = productToDelete.name;
            deleteProduct(productToDelete.id);
            setIsDeleting(false);
            setProductToDelete(null);
            setActionFeedback(`Product "${name}" was removed from inventory.`);
            setTimeout(() => setActionFeedback(null), 3500);
          }
        }}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}" (${productToDelete?.sku})? This product and its stock records will be removed.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Add or Edit Modal */}
      <ProductModal
        isOpen={isAddModalOpen || !!editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />
    </div>
  );
};

