import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@prospectai.io');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      login(res.access_token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0F17] flex flex-col justify-center items-center px-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <img
            src="/logo-icon.jpg"
            alt="ProspectAI Logo"
            className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-indigo-500/20 border border-slate-200/80 dark:border-slate-800"
          />
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Prospect<span className="text-[#5B5CE2]">AI</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Autonomous Lead Generation & Client Outreach Automation
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#131926] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Welcome back
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Sign in to access your outbound pipelines and qualification dashboard.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <a href="#" className="text-[11px] text-[#5B5CE2] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="my-5 flex items-center justify-between">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          <span className="px-3 text-[11px] text-slate-400 uppercase font-medium">Or demo sandbox</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleDemoLogin}
          leftIcon={<Zap className="w-4 h-4 text-amber-500" />}
          className="w-full"
        >
          1-Click Instant Demo Login (Admin)
        </Button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#5B5CE2] font-semibold hover:underline">
            Create Workspace
          </Link>
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#5B5CE2]" />
        <span>Enterprise-grade JWT authentication and workspace isolation</span>
      </div>
    </div>
  );
};
