import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Calendar,
  ShieldCheck,
  Send,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MessageSquareQuote,
  Zap,
  Globe,
  Sliders,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async () => {
    await loginAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0F17] text-[#17202F] dark:text-[#E2E8F0] selection:bg-[#5B5CE2]/20">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo-icon.jpg"
            alt="ProspectAI Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-md shadow-indigo-500/20 border border-slate-200/60 dark:border-slate-800"
          />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Prospect<span className="text-[#5B5CE2]">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-[#5B5CE2] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#5B5CE2] transition-colors">How It Works</a>
          <a href="#pipeline" className="hover:text-[#5B5CE2] transition-colors">The Pipeline</a>
          <a href="#integrations" className="hover:text-[#5B5CE2] transition-colors">Integrations</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Button variant="primary" size="sm" onClick={handleLaunchDemo} leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}>
            Launch Live Demo
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold text-[#5B5CE2] dark:text-indigo-300 mb-8 animate-in fade-in slide-in-from-bottom duration-300">
          <Sparkles className="w-4 h-4 text-[#5B5CE2]" />
          <span>Next-Generation B2B Outbound Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
          Turn Potential Customers <br className="hidden sm:block" />
          Into <span className="text-[#5B5CE2]">Real Conversations.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10">
          ProspectAI connects lead discovery, 5-dimensional AI qualification, and autonomous conversational outreach—scheduling qualified pipeline directly into your calendar without manual SDR friction.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={handleLaunchDemo}
            leftIcon={<Zap className="w-5 h-5" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-lg shadow-indigo-500/25"
          >
            Explore Interactive App (No Setup Required)
          </Button>
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full">
              Create Free Workspace
            </Button>
          </Link>
        </div>

        {/* Live Metrics Trust Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16 pt-10 border-t border-slate-200/60 dark:border-slate-800/80">
          <div>
            <p className="text-3xl font-extrabold text-[#5B5CE2]">65%</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Faster Qualification Lag</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">3.2x</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Qualified Pipeline Volume</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#5B5CE2]">100%</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Opt-Out Compliance</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">&lt; 30s</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Inbound Response Time</p>
          </div>
        </div>
      </section>

      {/* Interactive App Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-2xl bg-white dark:bg-[#131926] p-4 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="ml-2 text-xs font-mono text-slate-400">app.prospectai.io/dashboard</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ● Live Sandbox Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-[#5B5CE2] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Lead Discovery</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Define your exact ICP criteria: industry, seniority, location, and company headcount.
              </p>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between font-semibold">
                  <span>Elena Rostova</span>
                  <span className="text-emerald-600 font-bold">92.0 Score</span>
                </div>
                <p className="text-[11px] text-slate-400">VP of Growth at CloudScale Systems</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Autonomous AI Sales Bot</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Engages prospects with 1 question at a time, identifies budget and needs, and handles escalations.
              </p>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-xs space-y-2 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-[#5B5CE2]">ProspectAI:</span> "Would Thursday at 2:00 PM UTC suit you for a 15-minute walkthrough?"
                </p>
                <p className="text-[11px] text-emerald-600 font-medium">
                  ✓ Ready to Book Intent Detected
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Conflict-Free Scheduling</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Google Calendar sync automatically checks availability across timezones and links events.
              </p>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Thursday, 2:00 PM</span>
                  <span className="text-[10px] bg-indigo-50 text-[#5B5CE2] dark:bg-indigo-950 px-1.5 py-0.5 rounded font-bold">Confirmed</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">meet.google.com/pro-ai-demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 7-Stage End-to-End Pipeline */}
      <section id="pipeline" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            The Complete Autonomous Pipeline
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Every step seamlessly connected from initial search to signed agreement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {[
            { step: '01', title: 'Lead Discovery', desc: 'Define ICP & retrieve verified target accounts.' },
            { step: '02', title: 'Data Enrichment', desc: 'Pull title, company size, and intent signals.' },
            { step: '03', title: 'AI Qualification', desc: 'Score across 5 dimensions with evidence.' },
            { step: '04', title: 'Personal Outreach', desc: 'Multi-channel email, LinkedIn & Telegram.' },
            { step: '05', title: 'Sales Chatbot', desc: '1-question dialogue discovering pain points.' },
            { step: '06', title: 'Meeting Booking', desc: 'Syncs Google Calendar availability.' },
            { step: '07', title: 'CRM Sync', desc: 'Updates pipeline status & triggers alerts.' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
              <span className="text-[10px] font-extrabold text-[#5B5CE2] bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                {item.step}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Sliders className="w-8 h-8 text-[#5B5CE2] mb-4" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Customizable ICP Rules</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Configure weights for title seniority, industry relevance, company size tier, and buying intent signals. Inspect evidence for every score with full human override support.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Ethical Safeguards & Opt-Outs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Respect prospect boundaries instantly. Keywords like "STOP" or "unsubscribe" immediately suppress future follow-ups, and requests for a person trigger human handoff in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Globe className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Multi-Channel Sequences</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Orchestrate coordinated outreach campaigns across Email, Telegram Bot, and authorized LinkedIn drafting with realistic preview modes and automated stop-on-reply logic.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5B5CE2]/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-extrabold mb-4 relative z-10">
            Ready to Put Your Outbound on Autopilot?
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mb-8 relative z-10">
            Join hundreds of forward-thinking B2B companies automating discovery, qualification, and sales conversations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Button
              size="lg"
              variant="primary"
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto"
            >
              Launch Live Platform
            </Button>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 text-center text-xs text-slate-400 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo-icon.jpg" alt="ProspectAI" className="w-5 h-5 rounded-md object-cover" />
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Prospect<span className="text-[#5B5CE2]">AI</span>
          </span>
        </div>
        <p>© 2026 ProspectAI Inc. Built for high-velocity B2B sales automation.</p>
      </footer>
    </div>
  );
};
