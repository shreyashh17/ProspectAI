import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Search,
  Filter,
  Bot,
  User,
  Send,
  Pause,
  Play,
  UserCheck,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Building,
  MoreVertical,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import { Conversation, Lead, Message } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Message input state
  const [inputMessage, setInputMessage] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [replyMode, setReplyMode] = useState<'lead' | 'human_agent'>('lead');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.getConversations(filterStatus, channelFilter);
      setConversations(res);
      if (res.length > 0 && !selectedConv) {
        handleSelectConversation(res[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [filterStatus, channelFilter]);

  const handleSelectConversation = async (conv: Conversation) => {
    try {
      const detail = await api.getConversation(conv.id);
      setSelectedConv(detail);
      const leadDetail = await api.getLead(conv.lead_id);
      setSelectedLead(leadDetail);
    } catch (e) {
      setSelectedConv(conv);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !inputMessage.trim()) return;

    setSendLoading(true);
    const content = inputMessage;
    setInputMessage('');

    try {
      const reply = await api.sendMessage(selectedConv.id, content, replyMode);
      
      // Refresh current conversation
      const updated = await api.getConversation(selectedConv.id);
      setSelectedConv(updated);
      
      // Refresh lead details
      const leadDetail = await api.getLead(selectedConv.lead_id);
      setSelectedLead(leadDetail);

      if (reply.opted_out) {
        setToastMsg('Opt-out detected. Follow-ups suppressed and marked opted-out.');
        setTimeout(() => setToastMsg(null), 3500);
      } else if (reply.handed_off) {
        setToastMsg('Human handoff requested. Conversation routed to sales specialist.');
        setTimeout(() => setToastMsg(null), 3500);
      }

      fetchConversations();
    } catch (err: any) {
      alert(`Message error: ${err.message}`);
    } finally {
      setSendLoading(false);
    }
  };

  const handleToggleHandoff = async () => {
    if (!selectedConv) return;
    const isCurrentlyHandoff = selectedConv.status === 'human_handoff';
    try {
      await api.toggleHandoff(selectedConv.id, !isCurrentlyHandoff);
      const updated = await api.getConversation(selectedConv.id);
      setSelectedConv(updated);
      fetchConversations();
      setToastMsg(isCurrentlyHandoff ? 'Automated AI assistant resumed.' : 'Conversation handed off to human rep.');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedConv) return;
    try {
      await api.updateConversationStatus(selectedConv.id, newStatus);
      const updated = await api.getConversation(selectedConv.id);
      setSelectedConv(updated);
      fetchConversations();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.lead_name.toLowerCase().includes(q) ||
      c.lead_company.toLowerCase().includes(q) ||
      (c.summary && c.summary.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Conversations Inbox & AI Sales Bot
            <MessageSquareQuote className="w-4 h-4 text-[#5B5CE2]" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time conversational qualification, intent classification, and human escalation handoff.
          </p>
        </div>
      </div>

      {/* Main Inbox 3-Column Split */}
      <div className="flex-1 bg-white dark:bg-[#131926] rounded-2xl border border-[#E7E9EF] dark:border-slate-800 shadow-card flex overflow-hidden">
        {/* Left Column: Conversation List */}
        <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'human_handoff', label: 'Handoff' },
                { id: 'opted_out', label: 'Opted Out' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    filterStatus === tab.id
                      ? 'bg-[#5B5CE2] text-white'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-l-4 border-l-[#5B5CE2]'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {c.lead_name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="truncate">{c.lead_company}</span>
                      <span className="text-[10px] uppercase font-bold text-[#5B5CE2] bg-indigo-50 dark:bg-indigo-950 px-1.5 rounded">
                        {c.channel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      {c.last_message || c.summary || 'Conversation initiated.'}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <Badge
                        variant={
                          c.status === 'human_handoff'
                            ? 'warning'
                            : c.status === 'opted_out'
                            ? 'danger'
                            : 'success'
                        }
                        size="sm"
                      >
                        {c.status.replace('_', ' ')}
                      </Badge>

                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {c.extracted_intent.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Live Conversation Thread */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {selectedConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900/40">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {selectedConv.lead_name[0]}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {selectedConv.lead_name}
                      </h2>
                      <Badge
                        variant={
                          selectedConv.status === 'human_handoff'
                            ? 'warning'
                            : selectedConv.status === 'opted_out'
                            ? 'danger'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {selectedConv.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {selectedConv.lead_designation} • {selectedConv.lead_company}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={selectedConv.status === 'human_handoff' ? 'secondary' : 'outline'}
                    onClick={handleToggleHandoff}
                    leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                  >
                    {selectedConv.status === 'human_handoff' ? 'Resume AI' : 'Human Takeover'}
                  </Button>

                  {selectedConv.status !== 'opted_out' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus('opted_out')}
                      className="text-rose-600 dark:text-rose-400"
                    >
                      Opt Out
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {/* AI Assistant Honest Disclaimer */}
                <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#5B5CE2] shrink-0" />
                  <span>
                    ProspectAI autonomous sales agent engaged. Answers questions, probes pain points 1 at a time, and offers Google Meet slots.
                  </span>
                </div>

                {selectedConv.messages?.map((m) => {
                  const isAi = m.sender === 'ai';
                  const isAgent = m.sender === 'human_agent';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        {isAi ? (
                          <span className="flex items-center gap-1 font-semibold text-[#5B5CE2]">
                            <Bot className="w-3 h-3" /> ProspectAI Agent
                          </span>
                        ) : isAgent ? (
                          <span className="flex items-center gap-1 font-semibold text-emerald-600">
                            <UserCheck className="w-3 h-3" /> Human Specialist
                          </span>
                        ) : (
                          <span className="font-semibold">{selectedConv.lead_name}</span>
                        )}
                        <span>•</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isAi
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm'
                            : isAgent
                            ? 'bg-emerald-600 text-white rounded-tr-sm'
                            : 'bg-[#5B5CE2] text-white rounded-tr-sm shadow-sm'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Send as:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyMode('lead')}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                          replyMode === 'lead'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        Lead ({selectedConv.lead_name.split(' ')[0]})
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyMode('human_agent')}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                          replyMode === 'human_agent'
                            ? 'bg-[#5B5CE2] text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        Human Sales Rep
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={
                        replyMode === 'lead'
                          ? "Try: 'Can we schedule a call on Thursday?' or 'STOP' to test opt-out"
                          : 'Type human message to lead...'
                      }
                      className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                    />
                    <Button type="submit" variant="primary" isLoading={sendLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a conversation to inspect thread and chat with the AI agent.
            </div>
          )}
        </div>

        {/* Right Column: Lead Dossier Context */}
        {selectedLead && (
          <div className="w-72 border-l border-slate-100 dark:border-slate-800 p-5 overflow-y-auto hidden xl:block space-y-5 bg-slate-50/20 dark:bg-slate-900/20">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Prospect Profile
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {selectedLead.first_name} {selectedLead.last_name}
              </h3>
              <p className="text-xs text-[#5B5CE2] font-semibold">{selectedLead.designation}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLead.company_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedLead.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedLead.phone || 'N/A'}</span>
              </div>
            </div>

            {/* AI Fit Breakdown */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                AI Fit Telemetry
              </span>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fit Score:</span>
                  <span className="font-extrabold text-[#5B5CE2]">{selectedLead.icp_match_score.toFixed(0)} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge variant={selectedLead.status === 'qualified' ? 'success' : 'neutral'} size="sm">
                    {selectedLead.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Buying Intent:</span>
                  <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">
                    {selectedLead.qualification?.buying_intent || 'Exploring'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedLead.notes && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Context Notes
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
                  {selectedLead.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
