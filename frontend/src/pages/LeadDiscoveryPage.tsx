import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  Check,
  Upload,
  Download,
  Building,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { LinkedinIcon as Linkedin } from '../components/ui/LinkedinIcon';
import { api } from '../api/client';
import { DiscoveredLead, ICPCriteria } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

export const LeadDiscoveryPage: React.FC = () => {
  const [criteria, setCriteria] = useState<ICPCriteria>({
    industries: ['SaaS', 'Software', 'FinTech'],
    job_titles: ['VP of Growth', 'Head of Sales', 'Chief Commercial Officer', 'Director'],
    locations: ['San Francisco, CA', 'New York, NY', 'Austin, TX'],
    company_sizes: ['51-200', '201-500'],
    keywords: ['outbound', 'qualification', 'revenue'],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<DiscoveredLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // CSV Modal State
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<{ imported: number; duplicates: number; errors: number } | null>(null);

  const fetchDiscoveredLeads = async () => {
    setLoading(true);
    try {
      const res = await api.searchDiscovery(criteria, searchQuery);
      setResults(res);
    } catch (err: any) {
      alert(`Discovery search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveredLeads();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDiscoveredLeads();
  };

  const handleImportLead = async (lead: DiscoveredLead) => {
    setImportingId(lead.id);
    try {
      await api.importDiscoveryLead({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        designation: lead.designation,
        company_name: lead.company_name,
        company_size: lead.company_size,
        industry: lead.industry,
        location: lead.location,
        website: lead.website,
        linkedin_url: lead.linkedin_url,
      });

      // Update local state to show already saved
      setResults((prev) =>
        prev.map((item) => (item.id === lead.id ? { ...item, already_saved: true } : item))
      );

      setToastMsg(`Successfully added ${lead.first_name} ${lead.last_name} to leads pipeline!`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert(`Failed to save lead: ${err.message}`);
    } finally {
      setImportingId(null);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setCsvUploading(true);
    setCsvResult(null);
    try {
      const res = await api.uploadCsv(csvFile);
      setCsvResult(res);
      setTimeout(() => {
        fetchDiscoveredLeads();
      }, 1000);
    } catch (err: any) {
      alert(`CSV Upload failed: ${err.message}`);
    } finally {
      setCsvUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Lead Discovery & ICP Engine
            <Sparkles className="w-4 h-4 text-[#5B5CE2]" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Discover verified target accounts matching your Ideal Customer Profile criteria.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCsvModalOpen(true)}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import CSV
          </Button>
          <a href={api.getCsvTemplateUrl()} download="prospectai_template.csv">
            <Button variant="ghost" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Template
            </Button>
          </a>
        </div>
      </div>

      {/* ICP Configuration Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#5B5CE2]" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ideal Customer Profile (ICP) Parameters
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {results.length} matches discovered
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Target Industries
              </label>
              <input
                type="text"
                value={criteria.industries.join(', ')}
                onChange={(e) =>
                  setCriteria({
                    ...criteria,
                    industries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="SaaS, FinTech, Healthcare"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Target Job Titles
              </label>
              <input
                type="text"
                value={criteria.job_titles.join(', ')}
                onChange={(e) =>
                  setCriteria({
                    ...criteria,
                    job_titles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="VP, Head of Growth, CEO"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Company Headcount
              </label>
              <input
                type="text"
                value={criteria.company_sizes.join(', ')}
                onChange={(e) =>
                  setCriteria({
                    ...criteria,
                    company_sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="51-200, 201-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Keyword / Intent Signal
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                  placeholder="e.g. Elena, Boston, Cloud"
                />
                <Button type="submit" size="sm" variant="primary" isLoading={loading}>
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Discovered Leads Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#5B5CE2]" />
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#131926] rounded-2xl border border-slate-200 dark:border-slate-800">
          <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No prospects matched criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try broadening your target industries or company size filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((lead) => (
            <div
              key={lead.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with Match Score */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lead.first_name} {lead.last_name}
                    </h3>
                    <p className="text-xs text-[#5B5CE2] font-semibold mt-0.5">
                      {lead.designation}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        lead.match_score >= 80
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {lead.match_score.toFixed(0)}% ICP Fit
                    </span>
                  </div>
                </div>

                {/* Company & Details */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.company_name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({lead.company_size} emp • {lead.industry})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.location}</span>
                  </div>
                </div>

                {/* AI Match Reasons */}
                <div className="mb-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Match Signals
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {lead.match_reasons.map((r, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lead.linkedin_url && (
                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                      title="View Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Company Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {lead.already_saved ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" /> In Pipeline
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={importingId === lead.id}
                    onClick={() => handleImportLead(lead)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add to Leads
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CSV Import Modal */}
      <Modal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        title="Import Leads from CSV"
        description="Upload a CSV file containing target accounts. Duplicates by email will be automatically skipped."
      >
        <form onSubmit={handleCsvUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select or drag and drop a .csv file
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports: first_name, last_name, email, company_name, designation, industry
            </p>
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
              className="mt-3 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[#5B5CE2] hover:file:bg-indigo-100"
            />
          </div>

          {csvResult && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p className="font-semibold text-emerald-600">✓ Upload Complete</p>
              <p className="text-slate-600 dark:text-slate-300">
                Imported: <strong>{csvResult.imported}</strong> | Duplicates Skipped: <strong>{csvResult.duplicates}</strong> | Errors: <strong>{csvResult.errors}</strong>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setCsvModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit" isLoading={csvUploading} disabled={!csvFile}>
              Upload & Parse Leads
            </Button>
          </div>
        </form>
      </Modal>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
