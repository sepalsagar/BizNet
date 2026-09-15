import {
  formatIndianCurrency,
  formatIndianDate,
  formatIndianPhone,
} from '../utils/formatters';
import { describe, expect, it } from 'vitest';

describe('formatIndianCurrency', () => {
  it('uses Indian number grouping', () => {
    expect(formatIndianCurrency(1250)).toBe('₹1,250');
    expect(formatIndianCurrency(125000)).toBe('₹1,25,000');
    expect(formatIndianCurrency(1250000)).toBe('₹12,50,000');
  });

  it('formats zero and decimal values', () => {
    expect(formatIndianCurrency(0)).toBe('₹0');
    expect(formatIndianCurrency(1250.5)).toBe('₹1,250.5');
  });
});

describe('formatIndianDate', () => {
  it('formats a known UTC date as DD/MM/YYYY', () => {
    expect(formatIndianDate('2026-09-15T00:00:00.000Z')).toBe('15/09/2026');
  });
});

describe('formatIndianPhone', () => {
  it('formats a +91 phone number', () => {
    expect(formatIndianPhone('+919876543210')).toBe('+91 98765 43210');
  });

  it('formats a 10-digit Indian phone number', () => {
    expect(formatIndianPhone('9876543210')).toBe('+91 98765 43210');
  });

  it('normalizes an already-formatted phone number', () => {
    expect(formatIndianPhone('+91 98765 43210')).toBe('+91 98765 43210');
  });

  it('leaves an unrecognized phone number unchanged', () => {
    expect(formatIndianPhone('12345')).toBe('12345');
  });
});