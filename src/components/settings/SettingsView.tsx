import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  DollarSign, 
  Percent, 
  Save, 
  RotateCcw, 
  Download, 
  Bell, 
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData, products, orders, customers, suppliers } = useBusiness();

  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    storeTagline: settings.storeTagline || '',
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    targetMarginPct: settings.targetMarginPct.toString(),
    lowStockThresholdDefault: settings.lowStockThresholdDefault.toString(),
    taxRate: settings.taxRate.toString(),
    autoReorderAlerts: settings.autoReorderAlerts,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const handleConfirmReset = () => {
    setIsResetting(true);
    resetToDefaultData();
    setIsResetting(false);
    setIsResetConfirmOpen(false);
    setResetSuccessMessage('All business datasets have been restored to initial factory sample seeds.');
    setTimeout(() => setResetSuccessMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName: formData.companyName,
      storeTagline: formData.storeTagline,
      currency: formData.currency,
      currencySymbol: formData.currencySymbol,
      targetMarginPct: parseFloat(formData.targetMarginPct) || 45,
      lowStockThresholdDefault: parseInt(formData.lowStockThresholdDefault) || 15,
      taxRate: parseFloat(formData.taxRate) || 8.25,
      autoReorderAlerts: formData.autoReorderAlerts,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      settings,
      products,
      orders,
      customers,
      suppliers,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bizpilot_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-4xl" id="bizpilot-settings-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your business profile, financial targets, alerts, and local data controls.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Organization Profile</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-6">Set the identity and display conventions used throughout BizPilot.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Business Trading Name
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:border-slate-400 focus:outline-hidden focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Currency & Symbol
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.currency}
                  onChange={(e) => {
                    const curr = e.target.value;
                    const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$' };
                    setFormData({ ...formData, currency: curr, currencySymbol: symbols[curr] || '$' });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:border-slate-400 focus:outline-hidden focus:bg-white transition-colors"
                >
                    <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  placeholder="Symbol"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:border-slate-400 focus:outline-hidden focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Benchmarks */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Financial Targets & Thresholds</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-6">Set the benchmarks used by operational alerts and performance diagnostics.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Target Gross Margin (%)
              </label>
              <input
                type="number"
                min="5"
                max="95"
                value={formData.targetMarginPct}
                onChange={(e) => setFormData({ ...formData, targetMarginPct: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:border-slate-400 focus:outline-hidden focus:bg-white transition-colors"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Items below this % are flagged on alerts and diagnostics.
              </p>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Default Reorder Threshold
              </label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThresholdDefault}
                onChange={(e) => setFormData({ ...formData, lowStockThresholdDefault: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:border-slate-400 focus:outline-hidden focus:bg-white transition-colors"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Minimum inventory level before restock reminder fires.
              </p>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Standard Sales Tax (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:border-slate-400 focus:outline-hidden focus:bg-white transition-colors"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Default point-of-sale tax rate.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Automated Intelligence Notifications</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-6">Control proactive alerts for inventory and margin conditions.</p>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs py-2">
            <div>
              <p className="font-bold text-slate-900">Enable Stockout & Margin Alert Notifications</p>
              <p className="text-slate-500 mt-1">
                Receive proactive alert pills in the header when critical SKUs breach reorder thresholds.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.autoReorderAlerts}
              onChange={(e) => setFormData({ ...formData, autoReorderAlerts: e.target.checked })}
              className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-2xs transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Backup & System Maintenance */}
      <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Data Management & Disaster Recovery</h2>
          <p className="text-xs text-slate-500 mt-1">
          All data is persisted locally in your browser storage. You can export a full JSON snapshot anytime or reset to initial demo seeds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Full Data Snapshot (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium shadow-2xs transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Default Demo Datasets</span>
          </button>
        </div>

        {resetSuccessMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-medium animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setResetSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-700 p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Reset */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => {
          if (!isResetting) setIsResetConfirmOpen(false);
        }}
        onConfirm={handleConfirmReset}
        title="Reset Demo Datasets"
        description="Are you sure you want to reset all inventory items, sales orders, customer accounts, suppliers, and purchase orders? This action will permanently erase any local modifications and reload the initial demo factory seeds."
        confirmText="Yes, Reset All Data"
        cancelText="Keep Current Data"
        variant="danger"
        isLoading={isResetting}
      />
    </div>
  );
};
