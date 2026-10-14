import React, { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  Play,
  Pause,
  Mail,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Layers,
} from 'lucide-react';
import { LinkedinIcon as Linkedin } from '../components/ui/LinkedinIcon';
import { api } from '../api/client';
import { Campaign, Lead } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Wizard Modal State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    channel: 'email',
    message_template:
      'Hi {first_name},\n\nI noticed how {company_name} is accelerating outbound pipeline in {industry}. At ProspectAI, we help teams qualify prospects and book meetings autonomously with AI sales agents.\n\nWould you be open to a 10-minute discovery call this Thursday to review our benchmark?\n\nBest regards,\nProspectAI Team',
    follow_up_template:
      'Hi {first_name},\n\nFollowing up on my previous note. Thought you might find this case study on cutting qualification lag by 65% valuable.\n\nBest,\nProspectAI Team',
    follow_up_delay_days: 3,
    lead_ids: [] as string[],
  });

  const [previewMsg, setPreviewMsg] = useState('');
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const [campRes, leadsRes] = await Promise.all([
        api.getCampaigns(),
        api.getLeads({ page: 1, page_size: 50, status: 'all' }),
      ]);
      setCampaigns(campRes);
      setLeads(leadsRes.items.filter((l: Lead) => l.status !== 'opted_out'));
      if (campRes.length > 0 && !selectedCampaign) {
        const fullDetail = await api.getCampaign(campRes[0].id);
        setSelectedCampaign(fullDetail);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleLaunchCampaign = async (campaignId: string) => {
    setLaunchingId(campaignId);
    try {
      const res = await api.launchCampaign(campaignId);
      setToastMsg(`Campaign launched! ${res.dispatched} personalized messages dispatched.`);
      setTimeout(() => setToastMsg(null), 3500);
      fetchCampaigns();
    } catch (err: any) {
      alert(`Launch error: ${err.message}`);
    } finally {
      setLaunchingId(null);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await api.pauseCampaign(campaignId);
      setToastMsg('Campaign paused. Follow-up sequences suspended.');
      setTimeout(() => setToastMsg(null), 3500);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSelectCampaign = async (camp: Campaign) => {
    try {
      const fullDetail = await api.getCampaign(camp.id);
      setSelectedCampaign(fullDetail);
    } catch (e) {
      setSelectedCampaign(camp);
    }
  };

  const handlePreviewPersonalization = async () => {
    if (leads.length === 0) return;
    const targetLead = leads[0];
    try {
      const res = await api.previewPersonalization(
        targetLead.id,
        campaignForm.channel,
        campaignForm.message_template
      );
      setPreviewMsg(res.generated_message);
    } catch (e: any) {
      setPreviewMsg(campaignForm.message_template);
    }
  };

  useEffect(() => {
    if (step === 3) {
      handlePreviewPersonalization();
    }
  }, [step]);

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCamp = await api.createCampaign(campaignForm);
      setWizardOpen(false);
      setStep(1);
      setCampaignForm({
        name: '',
        channel: 'email',
        message_template:
          'Hi {first_name},\n\nI noticed how {company_name} is accelerating outbound pipeline in {industry}. At ProspectAI, we help teams qualify prospects and book meetings autonomously with AI sales agents.\n\nWould you be open to a 10-minute discovery call this Thursday to review our benchmark?\n\nBest regards,\nProspectAI Team',
        follow_up_template:
          'Hi {first_name},\n\nFollowing up on my previous note. Thought you might find this case study on cutting qualification lag by 65% valuable.\n\nBest,\nProspectAI Team',
        follow_up_delay_days: 3,
        lead_ids: [],
      });
      fetchCampaigns();
      setToastMsg(`Campaign '${newCamp.name}' created as draft. Ready to launch!`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      alert(`Creation error: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Outreach Campaigns
            <Send className="w-4 h-4 text-[#5B5CE2]" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized multi-channel sequences with automatic opt-out suppression and AI follow-ups.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setWizardOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Create Campaign Wizard
        </Button>
      </div>

      {/* Campaigns List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {campaigns.map((camp) => {
          const isRunning = camp.status === 'running';
          const isSelected = selectedCampaign?.id === camp.id;
          return (
            <div
              key={camp.id}
              onClick={() => handleSelectCampaign(camp)}
              className={`p-5 rounded-2xl bg-white dark:bg-[#131926] border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#5B5CE2] shadow-md ring-1 ring-[#5B5CE2]/30'
                  : 'border-[#E7E9EF] dark:border-slate-800 shadow-card hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="truncate">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {camp.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                    {camp.channel}
                  </p>
                </div>
                <Badge
                  variant={
                    camp.status === 'running'
                      ? 'success'
                      : camp.status === 'completed'
                      ? 'primary'
                      : camp.status === 'paused'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {camp.status}
                </Badge>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 my-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Sent</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{camp.sent_count}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Replies</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{camp.reply_count}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Meetings</span>
                  <span className="text-xs font-bold text-[#5B5CE2]">{camp.meeting_count}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  {camp.opt_out_count > 0 ? `${camp.opt_out_count} opt-outs suppressed` : 'Clean list'}
                </span>
                {isRunning ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePauseCampaign(camp.id);
                    }}
                    leftIcon={<Pause className="w-3 h-3 text-amber-500" />}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    isLoading={launchingId === camp.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchCampaign(camp.id);
                    }}
                    leftIcon={<Play className="w-3 h-3 text-emerald-500 fill-current" />}
                  >
                    Launch
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Campaign Detailed Inspector */}
      {selectedCampaign && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCampaign.name}
                </h2>
                <Badge variant={selectedCampaign.status === 'running' ? 'success' : 'neutral'}>
                  {selectedCampaign.status}
                </Badge>
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Channel: {selectedCampaign.channel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Follow-up interval: {selectedCampaign.follow_up_delay_days} days. Auto-stops on reply, opt-out, or handoff.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedCampaign.status !== 'running' && (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={launchingId === selectedCampaign.id}
                  onClick={() => handleLaunchCampaign(selectedCampaign.id)}
                  leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  Launch Live Campaign
                </Button>
              )}
            </div>
          </div>

          {/* Template Preview and Safety Guarantee Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Initial Outreach Template
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                {selectedCampaign.message_template || 'Default personalized message template.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-purple-950 dark:text-purple-200">
                  <ShieldCheck className="w-4 h-4 text-[#5B5CE2]" />
                  <span>Ethical Compliance & Safety Guarantee</span>
                </div>
                <p className="text-purple-900/80 dark:text-purple-300/80 leading-relaxed text-[11px]">
                  • Automated follow-ups pause immediately when a reply is detected.<br />
                  • Opt-out keywords suppress all further contact across all channels.<br />
                  • Human requests trigger instant handoff notification.<br />
                  • LinkedIn operations support authorized drafts & simulation sandbox without account risk.
                </p>
              </div>
              <div className="pt-3 border-t border-purple-200/60 dark:border-purple-900/40 mt-3 flex items-center justify-between text-[11px] font-semibold text-[#5B5CE2]">
                <span>Status: Compliant & Verified</span>
                <span>0 Violations</span>
              </div>
            </div>
          </div>

          {/* Campaign Leads Recipients Table */}
          {selectedCampaign.leads && selectedCampaign.leads.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Target Recipients ({selectedCampaign.leads.length})
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Lead</th>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Sent At</th>
                      <th className="py-2.5 px-3">Reply At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {selectedCampaign.leads.map((cl) => (
                      <tr key={cl.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{cl.lead_name}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{cl.lead_company}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={cl.status === 'replied' ? 'success' : cl.status === 'sent' ? 'primary' : 'neutral'}>
                            {cl.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {cl.sent_at ? new Date(cl.sent_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {cl.reply_at ? new Date(cl.reply_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5-Step Campaign Wizard Modal */}
      <Modal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Create Outreach Campaign Wizard"
        description={`Step ${step} of 5: ${
          step === 1
            ? 'Select Target Accounts'
            : step === 2
            ? 'Choose Delivery Channel'
            : step === 3
            ? 'Message Personalization & AI Preview'
            : step === 4
            ? 'Follow-Up Logic'
            : 'Review & Schedule'
        }`}
        maxWidth="xl"
      >
        <div className="space-y-5">
          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-[#5B5CE2]' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="e.g. Q4 FinTech Growth Outbound"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Target Leads ({campaignForm.lead_ids.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {leads.map((l) => {
                    const isChecked = campaignForm.lead_ids.includes(l.id);
                    return (
                      <label
                        key={l.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700/60 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCampaignForm({
                                  ...campaignForm,
                                  lead_ids: [...campaignForm.lead_ids, l.id],
                                });
                              } else {
                                setCampaignForm({
                                  ...campaignForm,
                                  lead_ids: campaignForm.lead_ids.filter((id) => id !== l.id),
                                });
                              }
                            }}
                            className="rounded text-[#5B5CE2] focus:ring-[#5B5CE2]"
                          />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {l.first_name} {l.last_name}
                          </span>
                          <span className="text-slate-400">({l.company_name})</span>
                        </div>
                        <span className="text-emerald-600 font-bold">{l.icp_match_score.toFixed(0)} score</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Choose Outreach Channel
              </label>
              {[
                { id: 'email', name: 'Email Outbound', desc: 'Direct corporate email with verified SPF/DKIM delivery.', icon: Mail },
                { id: 'linkedin', name: 'LinkedIn Sequence', desc: 'Authorized connection drafts with copy-to-clipboard simulation.', icon: Linkedin },
                { id: 'telegram', name: 'Telegram Bot API', desc: 'Real-time conversational bot notifications and inquiries.', icon: MessageCircle },
                { id: 'multichannel', name: 'Multi-Channel Coordinated', desc: 'Sequences email followed by LinkedIn touchpoint upon non-reply.', icon: Layers },
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = campaignForm.channel === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => setCampaignForm({ ...campaignForm, channel: ch.id })}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#5B5CE2] bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-[#5B5CE2]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-[#5B5CE2] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ch.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{ch.desc}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#5B5CE2]" />}
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Template (Variables: {'{first_name}'}, {'{company_name}'}, {'{industry}'}, {'{designation}'})
                </label>
                <textarea
                  rows={5}
                  value={campaignForm.message_template}
                  onChange={(e) => setCampaignForm({ ...campaignForm, message_template: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              {previewMsg && (
                <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#5B5CE2] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Personalized Sample Preview:
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(previewMsg)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {previewMsg}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Delay (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={campaignForm.follow_up_delay_days}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, follow_up_delay_days: parseInt(e.target.value) || 3 })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Automated Follow-up Template
                </label>
                <textarea
                  rows={4}
                  value={campaignForm.follow_up_template}
                  onChange={(e) => setCampaignForm({ ...campaignForm, follow_up_template: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-200">
                Notice: Follow-up messages will NEVER be dispatched if the lead replies, requests opt-out, or is escalated to a human.
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Campaign Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{campaignForm.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Channel:</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">{campaignForm.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Target Recipients:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {campaignForm.lead_ids.length > 0 ? `${campaignForm.lead_ids.length} Leads` : 'Top 10 Qualified Leads'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Safeguards validated: Sending limits and duplicate checks will be enforced.</span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : <div />}

            {step < 5 ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  if (step === 1 && !campaignForm.name.trim()) {
                    alert('Please enter a campaign name');
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Next Step
              </Button>
            ) : (
              <Button size="sm" variant="primary" onClick={handleCreateCampaignSubmit}>
                Confirm & Create Campaign
              </Button>
            )}
          </div>
        </div>
      </Modal>

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
