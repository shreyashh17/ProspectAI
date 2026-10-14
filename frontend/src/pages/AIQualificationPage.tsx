import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  BrainCircuit,
  Sliders,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  RefreshCw,
  Info,
  Check,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/client';
import { Lead } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const AIQualificationPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [rules, setRules] = useState({
    min_qualified_score: 75,
    min_potential_score: 50,
    icp_weight: 0.35,
    role_weight: 0.25,
    need_weight: 0.25,
    intent_weight: 0.15,
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [saveRulesLoading, setSaveRulesLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, rulesRes, leadsRes] = await Promise.all([
        api.getQualificationStats(),
        api.getQualificationRules(),
        api.getLeads({ page: 1, page_size: 20 }),
      ]);
      setStats(statsRes);
      setRules(rulesRes);
      setLeads(leadsRes.items);
      if (leadsRes.items.length > 0) setSelectedLead(leadsRes.items[0]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBatch = async () => {
    setBatchLoading(true);
    try {
      const res = await api.batchQualify();
      setToastMsg(`AI evaluated ${res.processed_count} leads successfully!`);
      setTimeout(() => setToastMsg(null), 3000);
      fetchData();
    } catch (err: any) {
      alert(`Batch qualification failed: ${err.message}`);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveRulesLoading(true);
    try {
      await api.updateQualificationRules(rules);
      setToastMsg('Qualification rules & weights updated successfully!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert(`Error saving rules: ${err.message}`);
    } finally {
      setSaveRulesLoading(false);
    }
  };

  const handleQuickOverride = async (lead: Lead, newStatus: string) => {
    if (!lead.qualification) return;
    try {
      await api.overrideQualification(lead.qualification.id, {
        status: newStatus,
        score: newStatus === 'qualified' ? 88 : newStatus === 'potential' ? 62 : 35,
        manual_notes: '1-click review action from AI Qualification console.',
      });
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            AI Qualification Engine
            <CheckCircle2 className="w-4 h-4 text-[#5B5CE2]" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Combines multi-dimensional LLM semantic extraction with deterministic B2B scoring rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunBatch}
            isLoading={batchLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Run Batch AI Qualification
          </Button>
        </div>
      </div>

      {/* 4 Telemetry Metrics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Evaluated</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total_evaluated}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Automated pipeline</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Qualified Fit</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.qualified_count}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">≥ 75 points</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Potential Leads</span>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">{stats.potential_count}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">50 - 74 points</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Average Fit Score</span>
            <p className="text-2xl font-extrabold text-[#5B5CE2] mt-1">{stats.average_score}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Out of 100 max</p>
          </div>
        </div>
      )}

      {/* Main Split Grid: Rules Config on Left, Evidence Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules & Weights Configuration Form */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <Sliders className="w-4 h-4 text-[#5B5CE2]" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Scoring Weights & Thresholds
            </h3>
          </div>

          <form onSubmit={handleSaveRules} className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Target Industry Relevance</span>
                <span className="font-bold text-[#5B5CE2]">{(rules.icp_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={rules.icp_weight}
                onChange={(e) => setRules({ ...rules, icp_weight: parseFloat(e.target.value) })}
                className="w-full accent-[#5B5CE2]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Role Authority & Seniority</span>
                <span className="font-bold text-[#5B5CE2]">{(rules.role_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={rules.role_weight}
                onChange={(e) => setRules({ ...rules, role_weight: parseFloat(e.target.value) })}
                className="w-full accent-[#5B5CE2]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Identified Need & Pain Fit</span>
                <span className="font-bold text-[#5B5CE2]">{(rules.need_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={rules.need_weight}
                onChange={(e) => setRules({ ...rules, need_weight: parseFloat(e.target.value) })}
                className="w-full accent-[#5B5CE2]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Buying Intent Signals</span>
                <span className="font-bold text-[#5B5CE2]">{(rules.intent_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={rules.intent_weight}
                onChange={(e) => setRules({ ...rules, intent_weight: parseFloat(e.target.value) })}
                className="w-full accent-[#5B5CE2]"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Qualified Minimum Cutoff
              </label>
              <input
                type="number"
                min="50"
                max="95"
                value={rules.min_qualified_score}
                onChange={(e) => setRules({ ...rules, min_qualified_score: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
              <p className="text-[10px] text-slate-400 mt-1">Leads with this score or higher qualify automatically.</p>
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full mt-2"
              isLoading={saveRulesLoading}
            >
              Update Qualification Criteria
            </Button>
          </form>
        </div>

        {/* Live Qualification Evidence Inspector (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Qualification Evidence & Audit Inspector
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Click a lead below to inspect</span>
            </div>

            {selectedLead ? (
              <div className="space-y-4">
                {/* Lead Summary Header */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedLead.first_name} {selectedLead.last_name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedLead.designation} at <span className="font-semibold">{selectedLead.company_name}</span> ({selectedLead.industry})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-[#5B5CE2]">
                      {selectedLead.icp_match_score.toFixed(0)} pts
                    </span>
                    <Badge variant={selectedLead.status === 'qualified' ? 'success' : selectedLead.status === 'potential' ? 'warning' : 'danger'}>
                      {selectedLead.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Evidence & Reasoning Text */}
                <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs">
                  <span className="font-bold text-purple-950 dark:text-purple-200">AI Qualification Synthesis: </span>
                  <p className="text-purple-900 dark:text-purple-300 mt-1 leading-relaxed">
                    {selectedLead.qualification?.reason || selectedLead.icp_explanation || 'Strong ICP fit based on direct C-level authority and high-growth industry.'}
                  </p>
                </div>

                {/* Extracted Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Authority</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                      {selectedLead.qualification?.authority_fit || 'Decision Maker'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Buying Intent</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                      {selectedLead.qualification?.buying_intent || 'High'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Need Fit</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                      {selectedLead.qualification?.need_fit || 'Strong'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Timeline</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                      {selectedLead.qualification?.timeline_fit || 'Immediate'}
                    </p>
                  </div>
                </div>

                {/* 1-Click Human Decision Controls */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Human Review Override:
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickOverride(selectedLead, 'qualified')}
                      leftIcon={<ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />}
                    >
                      Approve (Qualified)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickOverride(selectedLead, 'potential')}
                      leftIcon={<HelpCircle className="w-3.5 h-3.5 text-amber-500" />}
                    >
                      Mark Potential
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickOverride(selectedLead, 'not_qualified')}
                      leftIcon={<ThumbsDown className="w-3.5 h-3.5 text-rose-500" />}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-10 text-center">No lead selected.</p>
            )}
          </div>

          {/* Lead Selector Pill Carousel */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              {leads.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLead(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${
                    selectedLead?.id === l.id
                      ? 'border-[#5B5CE2] bg-indigo-50 dark:bg-indigo-950 text-[#5B5CE2] font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {l.first_name} ({l.icp_match_score.toFixed(0)})
                </button>
              ))}
            </div>
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
