import React, { useState, useEffect } from 'react';
import {
  Plug,
  Bot,
  MessageCircle,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Check,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { LinkedinIcon as Linkedin } from '../components/ui/LinkedinIcon';
import { api } from '../api/client';
import { Integration } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Configure modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.getIntegrations();
      setIntegrations(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTestConnection = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const res = await api.testIntegration(provider);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ provider, success: false, message: err.message, mode: 'error' });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProvider) return;
    setSaveLoading(true);
    try {
      await api.updateIntegration({
        provider: activeProvider,
        status: configValue ? 'connected' : 'simulated',
        config: { [configKey || 'api_key']: configValue },
      });
      setModalOpen(false);
      setConfigValue('');
      fetchIntegrations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI / LLM Provider',
      category: 'AI Engine',
      icon: Bot,
      desc: 'Powers conversational sales qualification, pain-point extraction, and outreach generation.',
      modeLabel: 'Smart Fallback Active (Zero Credentials Needed)',
      keyName: 'api_key',
      keyPlaceholder: 'sk-... (Optional)',
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar API',
      category: 'Calendar & Scheduling',
      icon: Calendar,
      desc: 'Retrieves free/busy availability and creates confirmed Google Meet links.',
      modeLabel: 'Sandbox Availability Generator Active',
      keyName: 'client_id',
      keyPlaceholder: 'OAuth Client ID (Optional)',
    },
    {
      id: 'telegram',
      name: 'Telegram Bot API',
      category: 'Messaging',
      icon: MessageCircle,
      desc: 'Authorized bot messaging webhook for real-time customer qualification inquiries.',
      modeLabel: 'Webhook Simulator Active',
      keyName: 'bot_token',
      keyPlaceholder: 'Bot Token from @BotFather (Optional)',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Network Suite',
      category: 'Social Outreach',
      icon: Linkedin,
      desc: 'Generates permitted message drafts, copy-to-clipboard, and sandbox delivery simulations.',
      modeLabel: 'Authorized Drafts & Simulation Active',
      keyName: 'access_token',
      keyPlaceholder: 'Partner Access Token (Optional)',
    },
    {
      id: 'hubspot',
      name: 'HubSpot / CRM Webhooks',
      category: 'CRM Synchronization',
      icon: Layers,
      desc: 'Synchronizes qualified deals, meeting logs, and opt-out suppression states.',
      modeLabel: 'Webhook Dispatcher Ready',
      keyName: 'webhook_url',
      keyPlaceholder: 'https://api.hubspot.com/...',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Integrations & Provider Credentials
          <Plug className="w-4 h-4 text-[#5B5CE2]" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Connect external AI models, calendars, and channels. All integrations function seamlessly in demo mode.
        </p>
      </div>

      {/* Safety & Demo Mode Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-indigo-900 text-[#5B5CE2] flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              Zero-Credential Demonstration Sandbox
            </h4>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
              Every feature runs 100% out-of-the-box using our deterministic AI engine, simulated calendar slots, and mock outreach. Adding live keys upgrades services automatically.
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold text-[#5B5CE2] bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 shrink-0">
          Demo Operational
        </span>
      </div>

      {/* Test Result Toast/Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
            testResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>
              <strong>{testResult.provider.toUpperCase()}:</strong> {testResult.message}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/60 dark:bg-black/30">
            Mode: {testResult.mode}
          </span>
        </div>
      )}

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {providers.map((p) => {
          const Icon = p.icon;
          const matchingInteg = integrations.find((i) => i.provider === p.id);
          const isTesting = testingProvider === p.id;
          const status = matchingInteg?.status || 'simulated';

          return (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#5B5CE2] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {p.category}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      status === 'connected'
                        ? 'success'
                        : status === 'simulated'
                        ? 'primary'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {status === 'simulated' ? 'Simulated Sandbox' : status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {p.desc}
                </p>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{p.modeLabel}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setActiveProvider(p.id);
                    setConfigKey(p.keyName);
                    setModalOpen(true);
                  }}
                  leftIcon={<Settings className="w-3.5 h-3.5" />}
                >
                  Configure
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={isTesting}
                  onClick={() => handleTestConnection(p.id)}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Test Connection
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Provider Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Configure ${activeProvider?.toUpperCase()} Integration`}
        description="Provide optional API keys or endpoints to switch from simulation to live production calls."
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 capitalize">
              {configKey.replace('_', ' ')}
            </label>
            <input
              type="text"
              value={configValue}
              onChange={(e) => setConfigValue(e.target.value)}
              placeholder="Leave blank to use zero-credential deterministic demo fallback"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              API credentials remain securely on the backend and are never sent to the client browser.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saveLoading}>
              Save Configuration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
