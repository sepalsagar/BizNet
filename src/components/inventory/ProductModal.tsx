import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { Product } from '../../types';
import { useBusiness } from '../../context/BusinessContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, suppliers, settings } = useBusiness();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Electronics',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    reorderPoint: '15',
    supplierId: '',
    unit: 'pcs',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        sku: productToEdit.sku,
        name: productToEdit.name,
        category: productToEdit.category,
        costPrice: productToEdit.costPrice.toString(),
        sellingPrice: productToEdit.sellingPrice.toString(),
        stock: productToEdit.stock.toString(),
        reorderPoint: productToEdit.reorderPoint.toString(),
        supplierId: productToEdit.supplierId,
        unit: productToEdit.unit,
        description: productToEdit.description || '',
      });
    } else {
      setFormData({
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        category: 'Electronics',
        costPrice: '',
        sellingPrice: '',
        stock: '20',
        reorderPoint: '10',
        supplierId: suppliers[0]?.id || '',
        unit: 'pcs',
        description: '',
      });
    }
    setErrors({});
  }, [productToEdit, isOpen, suppliers]);

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

  const cost = parseFloat(formData.costPrice) || 0;
  const selling = parseFloat(formData.sellingPrice) || 0;
  const calculatedMargin = selling > 0 ? ((selling - cost) / selling) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (cost <= 0) newErrors.costPrice = 'Cost must be greater than 0';
    if (selling <= 0) newErrors.sellingPrice = 'Price must be greater than 0';
    if (selling < cost) newErrors.sellingPrice = 'Selling price cannot be below cost price';
    if (parseInt(formData.stock) < 0) newErrors.stock = 'Stock cannot be negative';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedSup = suppliers.find(s => s.id === formData.supplierId) || suppliers[0];

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        category: formData.category,
        costPrice: cost,
        sellingPrice: selling,
        stock: parseInt(formData.stock) || 0,
        reorderPoint: parseInt(formData.reorderPoint) || 10,
        supplierId: selectedSup ? selectedSup.id : 'sup-1',
        supplierName: selectedSup ? selectedSup.name : 'Primary Supplier',
        unit: formData.unit,
        description: formData.description,
      });
    } else {
      addProduct({
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        category: formData.category,
        costPrice: cost,
        sellingPrice: selling,
        stock: parseInt(formData.stock) || 0,
        reorderPoint: parseInt(formData.reorderPoint) || 10,
        supplierId: selectedSup ? selectedSup.id : 'sup-1',
        supplierName: selectedSup ? selectedSup.name : 'Primary Supplier',
        unit: formData.unit,
        description: formData.description,
      });
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      id="bizpilot-product-modal"
    >
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {productToEdit ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {productToEdit ? `Updating details for ${productToEdit.name}` : 'Enter product information and stock thresholds.'}
            </p>
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
          {/* Section 1: Product Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Product Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Masala Chai Blend"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-hidden transition-colors ${
                    errors.name 
                      ? 'border-rose-400 bg-rose-50/50' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  SKU / Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. BEV-CHAI-01"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden font-mono"
                />
                {errors.sku && <p className="text-[11px] text-rose-600 mt-1">{errors.sku}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Supplier
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing Information */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Pricing & Margin
              </h3>
              {selling > 0 && (
                <span className="text-[11px] font-mono text-slate-500">
                  Margin: <strong className={calculatedMargin >= settings.targetMarginPct ? 'text-emerald-700' : 'text-slate-800'}>{calculatedMargin.toFixed(1)}%</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cost Price ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-hidden font-mono transition-colors ${
                    errors.costPrice 
                      ? 'border-rose-400 bg-rose-50/50' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400'
                  }`}
                />
                {errors.costPrice && <p className="text-[11px] text-rose-600 mt-1">{errors.costPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Selling Price ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-hidden font-mono transition-colors ${
                    errors.sellingPrice 
                      ? 'border-rose-400 bg-rose-50/50' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400'
                  }`}
                />
                {errors.sellingPrice && <p className="text-[11px] text-rose-600 mt-1">{errors.sellingPrice}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Stock & Thresholds */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Stock & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden font-mono"
                />
                {errors.stock && <p className="text-[11px] text-rose-600 mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reorder Point
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                  placeholder="10"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="pcs, box, kg"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Description (Optional) */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Specifications, supplier codes, or packaging details..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 text-xs focus:outline-hidden resize-none"
            />
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
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-2xs"
            >
              {productToEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

