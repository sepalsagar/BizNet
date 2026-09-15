import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BusinessProvider, useBusiness } from '../context/BusinessContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={['/suppliers']}>
    <BusinessProvider>{children}</BusinessProvider>
  </MemoryRouter>
);

describe('Purchase Orders & Inventory Receiving', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creating a PO does not immediately change inventory stock', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const supplier = result.current.suppliers[0];
    const product = result.current.products[0];
    const initialStock = product.stock;
    const poQty = 25;

    let createdPO: any = null;
    act(() => {
      createdPO = result.current.createPurchaseOrder({
        supplierId: supplier.id,
        items: [{ productId: product.id, quantity: poQty, unitCost: product.costPrice }],
        notes: 'Restock batch #101',
      });
    });

    expect(createdPO).not.toBeNull();
    expect(createdPO.status).toBe('ordered');
    expect(createdPO.stockReceived).toBe(false);

    // Stock must remain unchanged
    const currentProduct = result.current.products.find((p) => p.id === product.id)!;
    expect(currentProduct.stock).toBe(initialStock);
  });

  it('receiving a PO increases product inventory by the exact ordered quantity', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const supplier = result.current.suppliers[0];
    const product = result.current.products[0];
    const initialStock = product.stock;
    const poQty = 50;

    let createdPO: any = null;
    act(() => {
      createdPO = result.current.createPurchaseOrder({
        supplierId: supplier.id,
        items: [{ productId: product.id, quantity: poQty, unitCost: product.costPrice }],
      });
    });

    // Update status to received
    act(() => {
      result.current.updatePurchaseOrderStatus(createdPO.id, 'received');
    });

    const updatedProduct = result.current.products.find((p) => p.id === product.id)!;
    const updatedPO = result.current.purchaseOrders.find((po) => po.id === createdPO.id)!;

    expect(updatedPO.status).toBe('received');
    expect(updatedPO.stockReceived).toBe(true);
    expect(updatedProduct.stock).toBe(initialStock + poQty);
  });

  it('receiving the same PO twice does NOT increase inventory twice', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const supplier = result.current.suppliers[0];
    const product = result.current.products[0];
    const initialStock = product.stock;
    const poQty = 30;

    let createdPO: any = null;
    act(() => {
      createdPO = result.current.createPurchaseOrder({
        supplierId: supplier.id,
        items: [{ productId: product.id, quantity: poQty, unitCost: product.costPrice }],
      });
    });

    // First receive
    act(() => {
      result.current.updatePurchaseOrderStatus(createdPO.id, 'received');
    });
    expect(result.current.products.find((p) => p.id === product.id)!.stock).toBe(initialStock + poQty);

    // Redundant update to received
    act(() => {
      result.current.updatePurchaseOrderStatus(createdPO.id, 'received');
    });

    // Stock must remain initialStock + poQty (not double counted)
    expect(result.current.products.find((p) => p.id === product.id)!.stock).toBe(initialStock + poQty);
  });

  it('cancelling a PO does not modify inventory', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const supplier = result.current.suppliers[0];
    const product = result.current.products[0];
    const initialStock = product.stock;

    let createdPO: any = null;
    act(() => {
      createdPO = result.current.createPurchaseOrder({
        supplierId: supplier.id,
        items: [{ productId: product.id, quantity: 40, unitCost: product.costPrice }],
      });
    });

    act(() => {
      result.current.updatePurchaseOrderStatus(createdPO.id, 'cancelled');
    });

    const currentProduct = result.current.products.find((p) => p.id === product.id)!;
    expect(currentProduct.stock).toBe(initialStock);
  });

  it('correctly calculates PO totals and item subtotals', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const supplier = result.current.suppliers[0];
    const product1 = result.current.products[0];
    const product2 = result.current.products[1];

    const item1 = { productId: product1.id, quantity: 10, unitCost: 15.5 };
    const item2 = { productId: product2.id, quantity: 5, unitCost: 20.0 };

    let createdPO: any = null;
    act(() => {
      createdPO = result.current.createPurchaseOrder({
        supplierId: supplier.id,
        items: [item1, item2],
      });
    });

    expect(createdPO).not.toBeNull();
    expect(createdPO.totalItems).toBe(15);
    expect(createdPO.totalAmount).toBe(255); // (10 * 15.5) + (5 * 20.0) = 155 + 100 = 255
    expect(createdPO.items[0].subtotal).toBe(155);
    expect(createdPO.items[1].subtotal).toBe(100);
  });

  it('rejects invalid PO items (zero quantity or negative unit cost)', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const supplier = result.current.suppliers[0];
    const product = result.current.products[0];

    // Zero quantity
    let poZeroQty: any = null;
    act(() => {
      poZeroQty = result.current.createPurchaseOrder({
        supplierId: supplier.id,
        items: [{ productId: product.id, quantity: 0, unitCost: 10 }],
      });
    });
    expect(poZeroQty).toBeNull();

    // Negative unit cost
    let poNegativeCost: any = null;
    act(() => {
      poNegativeCost = result.current.createPurchaseOrder({
        supplierId: supplier.id,
        items: [{ productId: product.id, quantity: 5, unitCost: -10 }],
      });
    });
    expect(poNegativeCost).toBeNull();
  });
});
