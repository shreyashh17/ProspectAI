import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  ShieldCheck,
  Bell,
  Users,
  Key,
  FileText,
  Save,
  Check,
  Clock,
  User,
} from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [workspace, setWorkspace] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [ws, logs] = await Promise.all([
        api.getWorkspaceSettings(),
        api.getAuditLogs(30),
      ]);
      setWorkspace(ws);
      setWorkspaceName(ws.name);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateWorkspaceSettings({ name: workspaceName });
      setToastMsg('Workspace settings updated successfully!');
      setTimeout(() => setToastMsg(null), 3000);
      fetchSettings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Workspace Settings & Compliance
          <SettingsIcon className="w-4 h-4 text-[#5B5CE2]" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage workspace profile, audit logs, team access, and safety safeguards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Workspace Profile & Team */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workspace Form */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Workspace Profile & Brand Identity
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Organization details and verified brand assets applied across outbound campaigns, automated SDR emails, and calendar invites.
            </p>

            {/* Brand Logo Identity Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 mb-5">
              <img
                src="/logo-icon.jpg"
                alt="ProspectAI Logo"
                className="w-14 h-14 rounded-2xl object-cover shadow-md shadow-indigo-500/20 border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    ProspectAI Outbound Suite
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5CE2] dark:text-indigo-300">
                    Official Logo Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Applied to email headers, bot disclaimers, SDR signatures, and client-facing booking pages.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workspace Display Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Timezone for Calendar Invites
                </label>
                <input
                  type="text"
                  disabled
                  value="UTC (Coordinated Universal Time)"
                  className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" isLoading={saving} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Save Workspace Details
                </Button>
              </div>
            </form>
          </div>

          {/* Brand Assets Showcase */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Brand Assets & Logos
                </h3>
                <p className="text-xs text-slate-400">
                  Registered visual assets used across dashboard, auth screens, email outreach, and public landing pages.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                3 Assets Loaded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                <div className="h-20 flex items-center justify-center mb-2">
                  <img src="/logo-icon.jpg" alt="Icon Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">App Icon</div>
                <div className="text-[10px] text-slate-400">Favicon & Sidebar</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                <div className="h-20 flex items-center justify-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-2">
                  <img src="/logo-full.png" alt="Full Wordmark" className="max-h-9 max-w-full object-contain" />
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Horizontal Wordmark</div>
                <div className="text-[10px] text-slate-400">Navbar & Email Signature</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                <div className="h-20 flex items-center justify-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-2">
                  <img src="/logo-banner.png" alt="Banner Lockup" className="max-h-9 max-w-full object-contain" />
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Banner Lockup</div>
                <div className="text-[10px] text-slate-400">Social & Marketing</div>
              </div>
            </div>
          </div>

          {/* Team Members List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Team Members & Roles
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Workspace users with authorized SDR execution permissions.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Alexander Wright</p>
                    <p className="text-[11px] text-slate-400">admin@prospectai.io</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  Admin
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    S
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Sarah Miller</p>
                    <p className="text-[11px] text-slate-400">sarah.sales@prospectai.io</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  Sales Rep
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Audit Logging Stream */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5B5CE2]" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Security & Compliance Audit Log
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Immutable</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    User: {log.user_email || 'system'} • Type: {log.entity_type}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-center">
            <span className="text-[10px] text-slate-400">
              Audit trails retained for 365 days in accordance with data governance policies.
            </span>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
