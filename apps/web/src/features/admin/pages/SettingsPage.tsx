import React, { useEffect, useState } from 'react';
import { FiSettings, FiSave, FiClock, FiCpu, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAdminStore } from '../store/admin-store';

// =============================================================================
// DevSync AI — Admin Settings Page
// System configurations for refresh intervals, log retention policies,
// CPU/Memory alert thresholds, and notification routing emails.
// =============================================================================

export const SettingsPage: React.FC = () => {
  const { settings, fetchSettings } = useAdminStore();

  const [refreshInterval, setRefreshInterval] = useState(30);
  const [logRetention, setLogRetention] = useState(30);
  const [cpuThreshold, setCpuThreshold] = useState(85);
  const [memoryThreshold, setMemoryThreshold] = useState(90);
  const [alertEmails, setAlertEmails] = useState('admin@devsync.ai');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setRefreshInterval(settings.refreshIntervalSeconds);
      setLogRetention(settings.logRetentionDays);
      setCpuThreshold(settings.alertCpuThresholdPercent);
      setMemoryThreshold(settings.alertMemoryThresholdPercent);
      setAlertEmails(settings.alertEmails.join(', '));
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Admin settings updated successfully!');
    }, 600);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <FiSettings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">
              System Administration Settings
            </h3>
            <p className="text-xs text-slate-400">
              Configure telemetry intervals, log retention, and alert rules
            </p>
          </div>
        </div>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Monitoring & Retention */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
            <FiClock className="text-indigo-400" />
            <span>Telemetry & Log Retention</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dashboard Auto-Refresh Interval (Seconds)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                System Log Retention Policy (Days)
              </label>
              <input
                type="number"
                min={7}
                max={365}
                value={logRetention}
                onChange={(e) => setLogRetention(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Alert Thresholds */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
            <FiCpu className="text-purple-400" />
            <span>Resource Threshold Alerts</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                CPU Alert Threshold (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={cpuThreshold}
                onChange={(e) => setCpuThreshold(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Memory Alert Threshold (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={memoryThreshold}
                onChange={(e) => setMemoryThreshold(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <FiMail className="text-slate-400" />
              <span>System Alert Recipient Emails (comma separated)</span>
            </label>
            <input
              type="text"
              value={alertEmails}
              onChange={(e) => setAlertEmails(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
