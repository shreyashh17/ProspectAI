import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  CheckCircle2,
  Send,
  MessageSquareQuote,
  Calendar,
  BarChart3,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { label: 'Overview Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Lead Discovery', path: '/discovery', icon: Sparkles, badge: 'AI' },
    { label: 'Lead Management', path: '/leads', icon: Users },
    { label: 'AI Qualification', path: '/qualification', icon: CheckCircle2 },
    { label: 'Outreach Campaigns', path: '/campaigns', icon: Send },
    { label: 'Conversations', path: '/conversations', icon: MessageSquareQuote, badge: 'Live' },
    { label: 'Meetings', path: '/meetings', icon: Calendar },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Integrations', path: '/integrations', icon: Plug },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 z-30 h-screen bg-white dark:bg-[#0D131F] border-r border-[#E7E9EF] dark:border-slate-800 transition-all duration-300 flex flex-col justify-between select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-[#E7E9EF] dark:border-slate-800/80 justify-between">
            <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/logo-icon.jpg"
                alt="ProspectAI Logo"
                className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50"
              />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                    Prospect<span className="text-[#5B5CE2]">AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                    Autopilot SaaS
                  </span>
                </div>
              )}
            </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace info tag */}
        {!collapsed && (
          <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="truncate">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400">Workspace</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                Acme HyperGrowth
              </p>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Active
            </span>
          </div>
        )}

        {/* Navigation items */}
        <nav className="px-3 py-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-[#5B5CE2] text-white shadow-sm shadow-[#5B5CE2]/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-5 h-5 shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={clsx(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide',
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badge === 'Live'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Safeguard Badge */}
      <div className="p-3 border-t border-[#E7E9EF] dark:border-slate-800">
        {!collapsed ? (
          <div className="px-3 py-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#5B5CE2] shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-[11px] font-semibold text-purple-950 dark:text-purple-200">
                Ethical Safeguards
              </p>
              <p className="text-[10px] text-purple-700/80 dark:text-purple-300/80 truncate">
                Instant opt-outs & handoffs active
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1 text-[#5B5CE2]" title="Ethical Safeguards Active">
            <ShieldCheck className="w-5 h-5" />
          </div>
        )}
      </div>
    </aside>
  );
};
