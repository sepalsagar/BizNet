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
    <div className="space-y-6 max-w-4xl" id="bizpilot-settings-view">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Storefront & System Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure financial benchmarks, currency formatting, and operational telemetry thresholds.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Organization Profile</h3>
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
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
                    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$' };
                    setFormData({ ...formData, currency: curr, currencySymbol: symbols[curr] || '$' });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden bg-white"
                >
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Benchmarks */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Percent className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Financial Targets & Thresholds</h3>
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Default point-of-sale tax rate.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Automated Intelligence Notifications</h3>
          </div>

          <div className="flex items-center justify-between text-xs py-2">
            <div>
              <p className="font-bold text-slate-900">Enable Stockout & Margin Alert Notifications</p>
              <p className="text-slate-500">
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
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Backup & System Maintenance */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Data Management & Disaster Recovery</h3>
        <p className="text-xs text-slate-500">
          All data is persisted locally in your browser storage. You can export a full JSON snapshot anytime or reset to initial demo seeds.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Full Data Snapshot (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Default Demo Datasets</span>
          </button>
        </div>

        {resetSuccessMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold animate-fade-in">
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
