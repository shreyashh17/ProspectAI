import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Sparkles,
  MoreVertical,
  CheckCircle2,
  Clock,
  Ban,
  MessageSquare,
  Calendar,
  ExternalLink,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Edit2,
  Trash2,
  Send,
  X,
  Bot,
  User,
} from 'lucide-react';
import { api } from '../api/client';
import { Lead, Conversation, AvailableSlot } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const LeadManagementPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selected Lead Drawer State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<'qualification' | 'chat' | 'override' | 'meeting'>('qualification');
  
  // Chat state in lead drawer
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [senderRole, setSenderRole] = useState<'lead' | 'human_agent'>('lead');

  // Override state
  const [overrideStatus, setOverrideStatus] = useState('qualified');
  const [overrideScore, setOverrideScore] = useState(85);
  const [overrideNotes, setOverrideNotes] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Meeting state
  const [meetingDate, setMeetingDate] = useState('2026-10-20');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads({
        page,
        page_size: pageSize,
        search,
        status: statusFilter,
        industry: industryFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setLeads(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, industryFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleOpenLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab('qualification');
    try {
      const conv = await api.getLeadConversation(lead.id);
      setConversation(conv);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !chatMessage.trim()) return;

    setChatLoading(true);
    const content = chatMessage;
    setChatMessage('');

    try {
      await api.sendMessage(conversation.id, content, senderRole);
      // Reload conversation
      const updated = await api.getConversation(conversation.id);
      setConversation(updated);
      
      // Refresh lead details too as intent or status may have changed
      if (selectedLead) {
        const leadRes = await api.getLead(selectedLead.id);
        setSelectedLead(leadRes);
        fetchLeads();
      }
    } catch (err: any) {
      alert(`Chat error: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !selectedLead.qualification) return;
    setOverrideLoading(true);
    try {
      await api.overrideQualification(selectedLead.qualification.id, {
        status: overrideStatus,
        score: overrideScore,
        manual_notes: overrideNotes,
      });
      const updated = await api.getLead(selectedLead.id);
      setSelectedLead(updated);
      fetchLeads();
      alert('Qualification status successfully updated!');
    } catch (err: any) {
      alert(`Override error: ${err.message}`);
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleFetchSlots = async () => {
    try {
      const res = await api.getAvailableSlots(meetingDate, 'UTC');
      setSlots(res);
      if (res.length > 0) setSelectedSlot(res[0]);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'meeting') {
      handleFetchSlots();
    }
  }, [activeTab, meetingDate]);

  const handleBookMeeting = async () => {
    if (!selectedLead || !selectedSlot) return;
    setBookingLoading(true);
    try {
      await api.scheduleMeeting({
        lead_id: selectedLead.id,
        title: `ProspectAI Discovery: ${selectedLead.first_name} (${selectedLead.company_name})`,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        timezone: 'UTC',
        notes: 'Booked directly from Lead Management console.',
      });
      alert('Discovery demo successfully booked and synced with Google Calendar!');
      const updated = await api.getLead(selectedLead.id);
      setSelectedLead(updated);
      fetchLeads();
      setActiveTab('qualification');
    } catch (err: any) {
      alert(`Booking error: ${err.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'qualified':
        return <Badge variant="success">Qualified</Badge>;
      case 'potential':
        return <Badge variant="warning">Potential</Badge>;
      case 'not_qualified':
        return <Badge variant="danger">Not Qualified</Badge>;
      case 'meeting_scheduled':
        return <Badge variant="primary">Meeting Booked</Badge>;
      case 'contacted':
        return <Badge variant="neutral">Contacted</Badge>;
      case 'replied':
        return <Badge variant="primary">Replied</Badge>;
      case 'opted_out':
        return <Badge variant="danger">Opted Out</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Lead Management
            <Users className="w-4 h-4 text-[#5B5CE2]" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View, filter, qualify, and converse with all target prospects in your pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a href={api.getExportLeadsUrl()} download="prospectai_leads.csv">
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export CSV
            </Button>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLeads}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, email, title, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="qualified">Qualified</option>
            <option value="potential">Potential</option>
            <option value="new">New</option>
            <option value="replied">Replied</option>
            <option value="meeting_scheduled">Meeting Scheduled</option>
            <option value="not_qualified">Not Qualified</option>
            <option value="opted_out">Opted Out</option>
          </select>

          {/* Industry Filter */}
          <select
            value={industryFilter}
            onChange={(e) => {
              setIndustryFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Industries</option>
            <option value="SaaS">SaaS</option>
            <option value="Software">Software</option>
            <option value="FinTech">FinTech</option>
            <option value="Artificial Intelligence">AI</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Supply Chain">Supply Chain</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="icp_match_score-desc">Highest ICP Score</option>
            <option value="icp_match_score-asc">Lowest ICP Score</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-[#131926] rounded-2xl border border-[#E7E9EF] dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Prospect</th>
                <th className="py-3 px-4">Company & Role</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">ICP Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => handleOpenLead(lead)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#5B5CE2] transition-colors">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {lead.email || 'No email registered'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {lead.company_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {lead.designation || 'Specialist'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {lead.industry || 'Technology'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-xs ${
                            lead.icp_match_score >= 75
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : lead.icp_match_score >= 50
                              ? 'text-amber-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {lead.icp_match_score.toFixed(0)}
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lead.icp_match_score >= 75
                                ? 'bg-emerald-500'
                                : lead.icp_match_score >= 50
                                ? 'bg-amber-500'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${lead.icp_match_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 capitalize text-[11px]">
                      {lead.source.replace('_', ' ')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLead(lead);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Open Details & Chat"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {leads.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(page * pageSize, total)} of {total} leads
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer for Selected Lead */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedLead(null)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xl bg-white dark:bg-[#131926] shadow-2xl border-l border-slate-200 dark:border-slate-800 z-10 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="truncate mr-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {selectedLead.first_name} {selectedLead.last_name}
                  </h2>
                  {getStatusBadge(selectedLead.status)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedLead.designation} at <span className="font-semibold">{selectedLead.company_name}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 text-xs font-semibold gap-6 bg-white dark:bg-[#131926]">
              <button
                onClick={() => setActiveTab('qualification')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'qualification'
                    ? 'border-[#5B5CE2] text-[#5B5CE2]'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Qualification
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'border-[#5B5CE2] text-[#5B5CE2]'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                Live Chatbot
              </button>
              <button
                onClick={() => setActiveTab('meeting')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'meeting'
                    ? 'border-[#5B5CE2] text-[#5B5CE2]'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Demo
              </button>
              <button
                onClick={() => setActiveTab('override')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'override'
                    ? 'border-[#5B5CE2] text-[#5B5CE2]'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Override
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'qualification' && (
                <div className="space-y-5">
                  {/* Score Breakdown Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Qualification Score
                      </span>
                      <span className="text-xl font-extrabold text-[#5B5CE2]">
                        {selectedLead.icp_match_score.toFixed(1)} / 100
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedLead.qualification?.reason || selectedLead.icp_explanation || 'Strong ICP alignment across company size and leadership role.'}
                    </p>
                  </div>

                  {/* 4 Fit Dimensions */}
                  {selectedLead.qualification && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Authority Fit</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                          {selectedLead.qualification.authority_fit.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Buying Intent</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                          {selectedLead.qualification.buying_intent}
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Need Fit</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                          {selectedLead.qualification.need_fit}
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Budget Tier</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                          {selectedLead.qualification.budget_fit}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pain Points */}
                  {selectedLead.qualification?.pain_points && selectedLead.qualification.pain_points.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                        Extracted Business Pain Points
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {selectedLead.qualification.pain_points.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {selectedLead.qualification?.requirements && selectedLead.qualification.requirements.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                        Identified Requirements
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {selectedLead.qualification.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                            <span className="text-[#5B5CE2] font-bold">✓</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Action */}
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs">
                    <span className="font-bold text-purple-900 dark:text-purple-200">Recommended Next Step: </span>
                    <span className="text-purple-700 dark:text-purple-300">
                      {selectedLead.qualification?.recommended_action || 'Initiate conversational discovery via AI Sales Bot.'}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-[500px]">
                  {/* Chat disclaimer header */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#5B5CE2] shrink-0" />
                    <span>Real-time conversational AI. Identifies pain points, respects opt-out, and offers calendar slots.</span>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                    {conversation?.messages?.map((msg) => {
                      const isAi = msg.sender === 'ai';
                      const isAgent = msg.sender === 'human_agent';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                            {isAi ? 'ProspectAI Assistant' : isAgent ? 'Sales Rep' : `${selectedLead.first_name}`}
                          </span>
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                              isAi
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 border border-indigo-100 dark:border-indigo-800/60 rounded-tl-sm'
                                : isAgent
                                ? 'bg-emerald-600 text-white rounded-tr-sm'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tr-sm'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input with Role Switcher */}
                  <form onSubmit={handleSendChatMessage} className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Simulate message as:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSenderRole('lead')}
                          className={`px-2 py-0.5 rounded font-semibold ${
                            senderRole === 'lead'
                              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          Prospect ({selectedLead.first_name})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSenderRole('human_agent')}
                          className={`px-2 py-0.5 rounded font-semibold ${
                            senderRole === 'human_agent'
                              ? 'bg-[#5B5CE2] text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          Human Rep
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder={
                          senderRole === 'lead'
                            ? "Try: 'We want to book a demo' or 'STOP' to test opt-out"
                            : 'Type human sales rep reply...'
                        }
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                      />
                      <Button type="submit" variant="primary" size="sm" isLoading={chatLoading}>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'meeting' && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs">
                    <p className="font-semibold text-[#5B5CE2]">Google Calendar Availability Sync</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                      Check real-time slot availability for {selectedLead.first_name} without double-booking.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Available Time Slots (30 min)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                            selectedSlot?.formatted_time === slot.formatted_time
                              ? 'border-[#5B5CE2] bg-indigo-50 dark:bg-indigo-950/70 text-[#5B5CE2] font-bold'
                              : slot.available
                              ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                              : 'opacity-40 border-slate-100 dark:border-slate-800 text-slate-400 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.formatted_time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-4"
                    isLoading={bookingLoading}
                    onClick={handleBookMeeting}
                    disabled={!selectedSlot}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  >
                    Confirm & Send Google Meet Invite
                  </Button>
                </div>
              )}

              {activeTab === 'override' && (
                <form onSubmit={handleApplyOverride} className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200">
                    Manual overrides take precedence over autonomous AI scoring and are recorded in the compliance audit trail.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Override Status
                    </label>
                    <select
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="qualified">Qualified (Priority)</option>
                      <option value="potential">Potential (Nurture)</option>
                      <option value="not_qualified">Not Qualified (Archive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Manual Score (0 - 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reviewer Reason / Audit Notes
                    </label>
                    <textarea
                      rows={3}
                      value={overrideNotes}
                      onChange={(e) => setOverrideNotes(e.target.value)}
                      placeholder="e.g. Spoke directly at SaaStr; confirmed $20k budget allocation for Q1."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={overrideLoading}
                  >
                    Save Manual Override
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
