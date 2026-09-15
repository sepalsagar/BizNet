import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BusinessProvider, useBusiness } from '../context/BusinessContext';
import { initialProducts } from '../data/initialData';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={['/dashboard']}>
    <BusinessProvider>{children}</BusinessProvider>
  </MemoryRouter>
);

describe('workspace data isolation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads the populated Indian demo workspace by default', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });

    expect(result.current.workspace).toEqual({ mode: 'demo', id: 'demo' });
    expect(result.current.products.length).toBe(initialProducts.length);
    expect(result.current.customers.length).toBeGreaterThan(0);
    expect(result.current.settings.currency).toBe('INR');
  });

  it('treats existing legacy data as demo data and writes it to demo storage', () => {
    localStorage.setItem('bizpilot_products_v1', JSON.stringify([{ ...initialProducts[0], stock: 7 }]));

    const { result } = renderHook(() => useBusiness(), { wrapper });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].stock).toBe(7);
    expect(localStorage.getItem('bizpilot:demo:products:v1')).toContain('"stock":7');
  });

  it('keeps client mutations independent from demo data', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });
    const demoProduct = result.current.products[0];
    const demoStock = demoProduct.stock;

    act(() => {
      result.current.switchWorkspace('client');
    });

    expect(result.current.products).toEqual([]);
    act(() => {
      result.current.addProduct({
        sku: 'CLIENT-001',
        name: 'Client Product',
        category: 'General',
        costPrice: 10,
        sellingPrice: 20,
        stock: 4,
        reorderPoint: 1,
        supplierId: '',
        supplierName: '',
        unit: 'pcs',
      });
    });
    const clientProduct = result.current.products[0];
    act(() => {
      result.current.adjustStock(clientProduct.id, 3);
    });

    act(() => {
      result.current.switchWorkspace('demo');
    });

    expect(result.current.products.find((product) => product.id === 'CLIENT-001')).toBeUndefined();
    expect(result.current.products.find((product) => product.id === demoProduct.id)?.stock).toBe(demoStock);
  });

  it('persists each workspace after switching away and back', () => {
    const { result } = renderHook(() => useBusiness(), { wrapper });
    const demoProduct = result.current.products[0];
    const updatedDemoStock = demoProduct.stock + 5;

    act(() => {
      result.current.adjustStock(demoProduct.id, 5);
    });
    act(() => {
      result.current.switchWorkspace('client');
    });

    expect(result.current.products).toEqual([]);
    let clientProductId = '';
    act(() => {
      clientProductId = result.current.addProduct({
        sku: 'CLIENT-002',
        name: 'Persistent Client Product',
        category: 'General',
        costPrice: 12,
        sellingPrice: 24,
        stock: 8,
        reorderPoint: 2,
        supplierId: '',
        supplierName: '',
        unit: 'pcs',
      }).id;
    });

    act(() => {
      result.current.switchWorkspace('demo');
    });
    expect(result.current.products.find((product) => product.id === demoProduct.id)?.stock).toBe(updatedDemoStock);

    act(() => {
      result.current.switchWorkspace('client');
    });
    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].id).toBe(clientProductId);
  });
});
