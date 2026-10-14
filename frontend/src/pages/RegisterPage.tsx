import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Building, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    workspace_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(formData);
      login(res.access_token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0F17] flex flex-col justify-center items-center px-4 py-12">
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
          Create your autonomous outbound workspace in 30 seconds
        </p>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#131926] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Create Free Workspace
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Start qualifying leads and automating outreach without credit card.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="Sarah Miller"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="sarah@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workspace / Company Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.workspace_name}
                onChange={(e) => setFormData({ ...formData, workspace_name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="Apex Cloud Corp"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="At least 6 characters"
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
            Create Workspace & Start
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#5B5CE2] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#5B5CE2]" />
        <span>Full workspace isolation & SOC-2 compliance principles</span>
      </div>
    </div>
  );
};
