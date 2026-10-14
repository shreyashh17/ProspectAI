import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  Mail,
  MessageCircle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Zap,
} from 'lucide-react';
import { LinkedinIcon as Linkedin } from '../components/ui/LinkedinIcon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../api/client';
import { Button } from '../components/ui/Button';

const COLORS = ['#5B5CE2', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAnalyticsOverview();
        setData(res);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { channel_performance, industry_breakdown, score_distribution, velocity_trends } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Outreach Analytics & Conversion ROI
          <BarChart3 className="w-4 h-4 text-[#5B5CE2]" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive conversion telemetry across acquisition channels, industries, and qualification tiers.
        </p>
      </div>

      {/* Top 4 Performance High-Level Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Outbound Reach</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">157 leads</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">+34% this month</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Avg Channel Reply Rate</span>
          <p className="text-2xl font-extrabold text-[#5B5CE2] mt-1">38.2%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Industry avg: 12%</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Qualified Pipeline</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">36 ops</p>
          <p className="text-[10px] text-slate-400 mt-0.5">High buying intent</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Meetings Scheduled</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">15 demos</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Direct calendar sync</p>
        </div>
      </div>

      {/* Row 1: Channel Performance Comparison & Industry Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Channel Performance Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Dispatched volume vs verified replies across outreach vectors
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channel_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="channel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="sent" name="Messages Dispatched" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="replies" name="Responses Received" fill="#5B5CE2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meetings" name="Meetings Booked" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Distribution Pie Chart (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Industry Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Distribution of leads across target verticals
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industry_breakdown}
                    dataKey="leads"
                    nameKey="industry"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {industry_breakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {industry_breakdown.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{item.industry}: {item.leads}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Score Tiers and Weekly Velocity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Tier Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Qualification Score Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Count of accounts across ICP qualification tiers
          </p>

          <div className="space-y-3">
            {score_distribution.map((tier: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {tier.tier}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {i === 0 ? 'Immediate Demo Offer' : i === 1 ? 'Standard Sequence' : i === 2 ? 'Educational Nurture' : 'Archive'}
                  </p>
                </div>
                <span className="text-base font-extrabold text-[#5B5CE2]">
                  {tier.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Discovery Velocity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Weekly Growth Velocity
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Progression of prospect acquisition week-over-week
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocity_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="discovered" name="Discovered" fill="#5B5CE2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qualified" name="Qualified" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
