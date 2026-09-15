import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BusinessProvider, useBusiness } from '../context/BusinessContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={['/sales']}>
    <BusinessProvider>{children}</BusinessProvider>
  </MemoryRouter>
);

describe('Order Lifecycle & Inventory Restoration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creating an active order deducts inventory and increases salesCount', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const targetProduct = result.current.products[0];
    const initialStock = targetProduct.stock;
    const initialSalesCount = targetProduct.salesCount || 0;
    const targetCustomer = result.current.customers[0];
    const orderQty = 2;

    expect(initialStock).toBeGreaterThanOrEqual(orderQty);

    let createdOrder: any = null;
    act(() => {
      createdOrder = result.current.addOrder({
        customerId: targetCustomer.id,
        items: [{ productId: targetProduct.id, quantity: orderQty }],
        paymentMethod: 'Credit Card',
        channel: 'Online',
        status: 'completed',
      });
    });

    expect(createdOrder).not.toBeNull();
    expect(createdOrder.stockRestored).toBe(false);

    const updatedProduct = result.current.products.find((p) => p.id === targetProduct.id)!;
    expect(updatedProduct.stock).toBe(initialStock - orderQty);
    expect(updatedProduct.salesCount).toBe(initialSalesCount + orderQty);
  });

  it('cancelling an active order restores exact stock and decrements salesCount', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const targetProduct = result.current.products[0];
    const initialStock = targetProduct.stock;
    const targetCustomer = result.current.customers[0];
    const orderQty = 3;

    let createdOrder: any = null;
    act(() => {
      createdOrder = result.current.addOrder({
        customerId: targetCustomer.id,
        items: [{ productId: targetProduct.id, quantity: orderQty }],
        paymentMethod: 'Credit Card',
        channel: 'Online',
        status: 'processing',
      });
    });

    // Stock should be deducted
    expect(result.current.products.find((p) => p.id === targetProduct.id)!.stock).toBe(initialStock - orderQty);

    // Cancel the order
    act(() => {
      result.current.updateOrderStatus(createdOrder.id, 'cancelled');
    });

    const restoredProduct = result.current.products.find((p) => p.id === targetProduct.id)!;
    const cancelledOrder = result.current.orders.find((o) => o.id === createdOrder.id)!;

    expect(cancelledOrder.status).toBe('cancelled');
    expect(cancelledOrder.stockRestored).toBe(true);
    expect(restoredProduct.stock).toBe(initialStock);
  });

  it('cancelling an already cancelled order is idempotent and does not restore stock twice', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const targetProduct = result.current.products[0];
    const initialStock = targetProduct.stock;
    const targetCustomer = result.current.customers[0];
    const orderQty = 2;

    let createdOrder: any = null;
    act(() => {
      createdOrder = result.current.addOrder({
        customerId: targetCustomer.id,
        items: [{ productId: targetProduct.id, quantity: orderQty }],
        paymentMethod: 'Credit Card',
        channel: 'Online',
        status: 'pending',
      });
    });

    // First cancellation
    act(() => {
      result.current.updateOrderStatus(createdOrder.id, 'cancelled');
    });
    expect(result.current.products.find((p) => p.id === targetProduct.id)!.stock).toBe(initialStock);

    // Second cancellation attempt
    act(() => {
      result.current.updateOrderStatus(createdOrder.id, 'cancelled');
    });

    // Stock must remain initialStock, NOT increase further
    expect(result.current.products.find((p) => p.id === targetProduct.id)!.stock).toBe(initialStock);
  });

  it('reactivating a cancelled order deducts inventory again and updates salesCount', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    const targetProduct = result.current.products[0];
    const initialStock = targetProduct.stock;
    const initialSalesCount = targetProduct.salesCount || 0;
    const targetCustomer = result.current.customers[0];
    const orderQty = 4;

    let createdOrder: any = null;
    act(() => {
      createdOrder = result.current.addOrder({
        customerId: targetCustomer.id,
        items: [{ productId: targetProduct.id, quantity: orderQty }],
        paymentMethod: 'Credit Card',
        channel: 'Online',
        status: 'pending',
      });
    });

    // Cancel order -> restores stock
    act(() => {
      result.current.updateOrderStatus(createdOrder.id, 'cancelled');
    });
    expect(result.current.products.find((p) => p.id === targetProduct.id)!.stock).toBe(initialStock);
    expect(result.current.products.find((p) => p.id === targetProduct.id)!.salesCount).toBe(initialSalesCount);

    // Reactivate order -> deducts stock again
    act(() => {
      result.current.updateOrderStatus(createdOrder.id, 'processing');
    });

    const reactivatedProduct = result.current.products.find((p) => p.id === targetProduct.id)!;
    const reactivatedOrder = result.current.orders.find((o) => o.id === createdOrder.id)!;

    expect(reactivatedOrder.status).toBe('processing');
    expect(reactivatedOrder.stockRestored).toBe(false);
    expect(reactivatedProduct.stock).toBe(initialStock - orderQty);
    expect(reactivatedProduct.salesCount).toBe(initialSalesCount + orderQty);

    // Calling status update to shipped does NOT double-deduct
    act(() => {
      result.current.updateOrderStatus(createdOrder.id, 'shipped');
    });
    expect(result.current.products.find((p) => p.id === targetProduct.id)!.stock).toBe(initialStock - orderQty);
  });

  it('rejects orders with invalid/empty items or non-existent customer', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    let orderWithNoItems: any = null;
    act(() => {
      orderWithNoItems = result.current.addOrder({
        customerId: result.current.customers[0].id,
        items: [],
        paymentMethod: 'Credit Card',
        channel: 'Online',
      });
    });
    expect(orderWithNoItems).toBeNull();

    let orderWithInvalidCustomer: any = null;
    act(() => {
      orderWithInvalidCustomer = result.current.addOrder({
        customerId: 'non-existent-id',
        items: [{ productId: result.current.products[0].id, quantity: 1 }],
        paymentMethod: 'Credit Card',
        channel: 'Online',
      });
    });
    expect(orderWithInvalidCustomer).toBeNull();
  });
});
