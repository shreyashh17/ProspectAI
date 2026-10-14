import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Sparkles,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Check,
  Send,
  Calendar,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { api } from '../../api/client';

interface TopbarProps {
  collapsed: boolean;
  onOpenNewLeadModal?: () => void;
}

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  link: string;
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed, onOpenNewLeadModal }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'Meeting Confirmed', desc: 'Elena Rostova scheduled a 15-min discovery demo.', time: '10m ago', unread: true, link: '/meetings' },
    { id: 2, title: 'AI Qualified Lead', desc: 'Marcus Chen scored 88.5/100 (Enterprise fit).', time: '1h ago', unread: true, link: '/leads' },
    { id: 3, title: 'Outreach Delivered', desc: 'Q4 Outbound Campaign delivered 42 messages.', time: '3h ago', unread: false, link: '/campaigns' },
    { id: 4, title: 'Safeguard Triggered', desc: 'Opt-out processed for Robert Vance.', time: '1d ago', unread: false, link: '/settings' },
  ]);

  const quickActionsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (quickActionsRef.current && !quickActionsRef.current.contains(target)) {
        setShowQuickActions(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    showToast(nextTheme === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read');
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setShowNotifications(false);
    navigate(item.link);
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleBatchQualify = async () => {
    setBatchLoading(true);
    setShowQuickActions(false);
    try {
      const res = await api.batchQualify();
      showToast(`Batch AI qualification completed: ${res.processed_count} leads evaluated!`);
      window.dispatchEvent(new CustomEvent('refresh_dashboard'));
    } catch (e: any) {
      showToast(`Batch qualification failed: ${e.message}`);
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-20 h-16 bg-white/90 dark:bg-[#0D131F]/90 backdrop-blur-md border-b border-[#E7E9EF] dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
          collapsed ? 'left-20' : 'left-64'
        }`}
      >
        {/* Global Search */}
        <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, companies, designation... (Enter to search)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]/30 focus:border-[#5B5CE2]"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded font-mono">
            ↵
          </kbd>
        </form>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Actions Dropdown */}
          <div className="relative" ref={quickActionsRef}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              rightIcon={<ChevronDown className="w-3.5 h-3.5 opacity-80" />}
              onClick={() => {
                setShowQuickActions(!showQuickActions);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
            >
              Quick Action
            </Button>

            {showQuickActions && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#131926] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickActions(false);
                    if (onOpenNewLeadModal) onOpenNewLeadModal();
                    else navigate('/leads');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#5B5CE2]" />
                  Add New Lead
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/campaigns');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Send className="w-4 h-4 text-emerald-500" />
                  Launch Outreach Campaign
                </button>
                <button
                  type="button"
                  onClick={handleBatchQualify}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Run AI Batch Qualification
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]/40 transition-all duration-200"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform duration-200" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowQuickActions(false);
                setShowProfileMenu(false);
              }}
              className="p-2 relative rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]/40 transition-colors"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#5B5CE2] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0D131F]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#131926] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5CE2] dark:text-indigo-300 text-[10px] font-semibold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-[#5B5CE2] hover:text-indigo-600 font-semibold cursor-pointer hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="py-1 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          n.unread
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#5B5CE2]" />}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {n.desc}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowQuickActions(false);
              }}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.full_name ? user.full_name[0] : 'A'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                  {user?.full_name || 'Alexander Wright'}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Admin'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#131926] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.full_name || 'Admin User'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@prospectai.io'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Workspace Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-200 text-xs font-medium animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
