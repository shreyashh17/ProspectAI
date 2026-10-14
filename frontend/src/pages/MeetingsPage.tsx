import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Building,
  User,
  MapPin,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { api } from '../api/client';
import { Meeting, AvailableSlot, Lead } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // New Meeting Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-10-22');
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('ProspectAI Discovery & Architecture Walkthrough');
  const [meetingNotes, setMeetingNotes] = useState('Review qualification pain points and team seat allocation.');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const [meetingsRes, leadsRes] = await Promise.all([
        api.getMeetings(statusFilter),
        api.getLeads({ page: 1, page_size: 50 }),
      ]);
      setMeetings(meetingsRes);
      setLeads(leadsRes.items);
      if (leadsRes.items.length > 0 && !selectedLeadId) {
        setSelectedLeadId(leadsRes.items[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [statusFilter]);

  const fetchSlots = async () => {
    try {
      const res = await api.getAvailableSlots(selectedDate, selectedTimezone);
      setSlots(res);
      if (res.length > 0) setSelectedSlot(res.find((s: AvailableSlot) => s.available) || res[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (bookingModalOpen) {
      fetchSlots();
    }
  }, [bookingModalOpen, selectedDate, selectedTimezone]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !selectedSlot) {
      alert('Please select a target lead and an available time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      await api.scheduleMeeting({
        lead_id: selectedLeadId,
        title: meetingTitle,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        timezone: selectedTimezone,
        notes: meetingNotes,
      });

      setBookingModalOpen(false);
      setToastMsg('Meeting booked! Google Meet link generated and prospect notified.');
      setTimeout(() => setToastMsg(null), 3500);
      fetchMeetings();
    } catch (err: any) {
      alert(`Booking conflict or error: ${err.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      await api.cancelMeeting(meetingId, 'Canceled by host in dashboard.');
      fetchMeetings();
      setToastMsg('Meeting canceled and calendar updated.');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Meeting Scheduling & Google Calendar
            <CalendarIcon className="w-4 h-4 text-[#5B5CE2]" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated conflict-free slot reservation, Google Meet video generation, and calendar sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setBookingModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Schedule Discovery Meeting
          </Button>
        </div>
      </div>

      {/* Integration Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-indigo-900 text-[#5B5CE2] flex items-center justify-center shadow-sm">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              Google Calendar Sync Active (Demo Sandbox Mode)
            </h4>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
              Live slot conflict detection prevents double booking across UTC, EST, and PST timezones.
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
          Connected
        </span>
      </div>

      {/* Filter and Schedule Grid */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'scheduled', 'completed', 'canceled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#5B5CE2] text-white shadow-sm'
                  : 'bg-white dark:bg-[#131926] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {meetings.length} meetings recorded
        </span>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.length === 0 ? (
          <div className="col-span-3 p-12 text-center bg-white dark:bg-[#131926] rounded-2xl border border-slate-200 dark:border-slate-800">
            <CalendarIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">No meetings found</h3>
            <p className="text-[11px] text-slate-400 mt-1">Book your first discovery demo using the button above.</p>
          </div>
        ) : (
          meetings.map((m) => {
            const isScheduled = m.status === 'scheduled';
            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#131926] border border-[#E7E9EF] dark:border-slate-800 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="truncate">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {m.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        With <span className="font-semibold text-[#5B5CE2]">{m.lead_name}</span> ({m.lead_company})
                      </p>
                    </div>
                    <Badge variant={m.status === 'scheduled' ? 'success' : m.status === 'canceled' ? 'danger' : 'neutral'}>
                      {m.status}
                    </Badge>
                  </div>

                  {/* Timing & Timezone */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {new Date(m.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pl-5">
                      <span>
                        {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(m.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-mono text-[10px]">{m.timezone}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {m.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {m.notes}
                    </p>
                  )}
                </div>

                {/* Footer Link & Cancel Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {m.meeting_link && isScheduled ? (
                    <a
                      href={m.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B5CE2] hover:underline"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Launch Google Meet
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Meeting concluded</span>
                  )}

                  {isScheduled && (
                    <button
                      onClick={() => handleCancelMeeting(m.id)}
                      className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Meeting Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Qualified Discovery Meeting"
        description="Select an interested prospect and choose a verified conflict-free Google Calendar time slot."
        maxWidth="lg"
      >
        <form onSubmit={handleBookSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Prospect Lead *
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.first_name} {l.last_name} ({l.company_name} - {l.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Date *
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Timezone
              </label>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="UTC">UTC (Universal)</option>
                <option value="America/New_York">America/New York (EST)</option>
                <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Available Calendar Slots
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
              {slots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    selectedSlot?.formatted_time === slot.formatted_time
                      ? 'border-[#5B5CE2] bg-indigo-50 dark:bg-indigo-950 text-[#5B5CE2] font-bold'
                      : slot.available
                      ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      : 'opacity-40 border-slate-100 text-slate-400 cursor-not-allowed line-through'
                  }`}
                >
                  {slot.formatted_time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Agenda Notes
            </label>
            <textarea
              rows={2}
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={bookingLoading} disabled={!selectedSlot}>
              Confirm Booking & Sync
            </Button>
          </div>
        </form>
      </Modal>

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
