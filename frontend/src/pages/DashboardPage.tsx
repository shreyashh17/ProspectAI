import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Send,
  Calendar,
  Percent,
  MessageSquareQuote,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Clock,
  Video,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../api/client';
import { DashboardMetrics } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';

export const DashboardPage: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboardMetrics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleRefresh = () => {
      fetchDashboard();
    };
    window.addEventListener('refresh_dashboard', handleRefresh);
    return () => window.removeEventListener('refresh_dashboard', handleRefresh);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#131926] rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-rose-500 font-semibold mb-2">Error loading dashboard</p>
        <p className="text-xs text-slate-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} size="sm">Retry</Button>
      </div>
    );
  }

  const { stats, trends, funnel, recent_leads, upcoming_meetings, recent_activities, campaign_performance } = data;

  const statCards = [
    { label: 'Total Leads', val: stats.total_leads, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/50', change: '+14% vs last wk' },
    { label: 'Qualified Leads', val: stats.qualified_leads, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/50', change: 'Tier 1 priority' },
    { label: 'Active Campaigns', val: stats.active_campaigns, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/50', change: 'Multi-channel' },
    { label: 'Meetings Booked', val: stats.scheduled_meetings, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/50', change: 'GCal sync' },
    { label: 'Qualification Rate', val: `${stats.qualification_rate}%`, icon: Percent, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/50', change: 'AI evaluated' },
    { label: 'Response Rate', val: `${stats.response_rate}%`, icon: MessageSquareQuote, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/50', change: 'Autonomous reply' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Overview Dashboard
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Live DB
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time pipeline performance, AI qualification telemetry, and autonomous booking status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/discovery">
            <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#5B5CE2]" />}>
              Discover Leads
            </Button>
          </Link>
          <Link to="/campaigns">
            <Button variant="primary" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((sc, i) => {
          const Icon = sc.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800/80 shadow-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {sc.label}
                </span>
                <div className={`w-7 h-7 rounded-lg ${sc.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${sc.color}`} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {sc.val}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 truncate">
                {sc.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Velocity Trends & Qualification Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pipeline Velocity (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400">
                Discovered vs AI-qualified leads vs booked meetings
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5B5CE2]" /> Discovered
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Qualified
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDiscovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B5CE2" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5B5CE2" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme === 'dark' ? '#1E293B' : '#E2E8F0'}
                  opacity={theme === 'dark' ? 0.7 : 0.8}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: theme === 'dark' ? '#94A3B8' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme === 'dark' ? '#94A3B8' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                    borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.15)',
                    fontSize: '12px',
                    color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
                  }}
                  itemStyle={{
                    color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                  }}
                />
                <Area type="monotone" dataKey="discovered" stroke="#5B5CE2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDiscovered)" />
                <Area type="monotone" dataKey="qualified" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQualified)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Qualification Funnel (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Qualification Funnel
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time progression from discovery to meeting
            </p>

            <div className="space-y-3.5">
              {funnel.map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{f.stage}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {f.count} <span className="text-[10px] text-slate-400 font-normal">({f.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        i === 0 ? 'bg-indigo-400' :
                        i === 1 ? 'bg-blue-500' :
                        i === 2 ? 'bg-purple-500' :
                        i === 3 ? 'bg-[#5B5CE2]' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(f.percentage, 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Link to="/qualification" className="text-xs text-[#5B5CE2] font-semibold flex items-center justify-between hover:underline">
              <span>Inspect AI Qualification Rules</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Columns: Recent Leads, Upcoming Meetings, Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Target Leads</h3>
            <Link to="/leads" className="text-xs text-[#5B5CE2] hover:underline font-medium">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {recent_leads.map((l) => (
              <div
                key={l.id}
                onClick={() => navigate(`/leads`)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="truncate mr-2">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{l.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{l.designation} • {l.company_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold ${l.score >= 75 ? 'text-emerald-600' : l.score >= 50 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {l.score.toFixed(0)}
                  </span>
                  <p className="text-[9px] uppercase tracking-wide text-slate-400 capitalize">{l.status.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Discovery Demos</h3>
            <Link to="/meetings" className="text-xs text-[#5B5CE2] hover:underline font-medium">
              Calendar
            </Link>
          </div>

          {upcoming_meetings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No scheduled meetings yet.</p>
          ) : (
            <div className="space-y-3">
              {upcoming_meetings.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {m.prospect_name}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate">
                    {m.company} • {m.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(m.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {m.meeting_link && (
                      <a
                        href={m.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#5B5CE2] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" />
                        Join Meet
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activity History Stream */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity History</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Audit Log</span>
          </div>

          <div className="space-y-3">
            {recent_activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#5B5CE2] mt-1.5 shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {act.action.replace('_', ' ')}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {act.details?.prospect || act.details?.name || act.details?.msg || act.entity_type}
                  </p>
                  <p className="text-[10px] text-slate-400/80">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
