import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../api/client';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    designation: '',
    industry: 'SaaS',
    company_size: '51-200',
    notes: '',
  });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLeadLoading(true);
    try {
      await api.createLead(newLeadForm);
      setIsAddLeadOpen(false);
      setNewLeadForm({
        first_name: '',
        last_name: '',
        email: '',
        company_name: '',
        designation: '',
        industry: 'SaaS',
        company_size: '51-200',
        notes: '',
      });
      // reload window or refresh page state
      window.location.reload();
    } catch (err: any) {
      alert(`Error creating lead: ${err.message}`);
    } finally {
      setAddLeadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0F17] flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Topbar
          collapsed={collapsed}
          onOpenNewLeadModal={() => setIsAddLeadOpen(true)}
        />

        <main className="flex-1 mt-16 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Lead Modal */}
      <Modal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        title="Add New Target Lead"
        description="Add a prospect to your workspace for instant AI qualification and outreach."
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name *
              </label>
              <input
                required
                type="text"
                value={newLeadForm.first_name}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, first_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="e.g. Rachel"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name *
              </label>
              <input
                required
                type="text"
                value={newLeadForm.last_name}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, last_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="e.g. Green"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={newLeadForm.email}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="rachel@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Title / Designation
              </label>
              <input
                type="text"
                value={newLeadForm.designation}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="e.g. VP of Demand Gen"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                required
                type="text"
                value={newLeadForm.company_name}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, company_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
                placeholder="e.g. Apex Corp"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Industry
              </label>
              <select
                value={newLeadForm.industry}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
              >
                <option value="SaaS">SaaS</option>
                <option value="Software">Software</option>
                <option value="FinTech">FinTech</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="Cloud Computing">Cloud Computing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Context & Notes for AI
            </label>
            <textarea
              rows={2}
              value={newLeadForm.notes}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5CE2]"
              placeholder="e.g. Mentioned hiring 10 SDRs; looking to automate outbound qualification."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddLeadOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={addLeadLoading}>
              Save & Run AI Qualification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
