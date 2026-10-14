export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  workspace_id: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface QualificationSummary {
  id: string;
  score: number;
  status: 'qualified' | 'potential' | 'not_qualified';
  reason?: string;
  pain_points: string[];
  requirements: string[];
  missing_info: string[];
  buying_intent: 'high' | 'medium' | 'low' | 'unknown';
  authority_fit: string;
  budget_fit: string;
  need_fit: string;
  timeline_fit: string;
  recommended_action: string;
  summary?: string;
  manual_override: boolean;
  manual_notes?: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  designation?: string;
  company_name: string;
  company_size?: string;
  industry?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  source: string;
  status: 'new' | 'qualified' | 'potential' | 'not_qualified' | 'contacted' | 'replied' | 'meeting_scheduled' | 'opted_out';
  icp_match_score: number;
  icp_explanation?: string;
  tags?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  qualification?: QualificationSummary;
}

export interface DiscoveredLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  company_name: string;
  company_size: string;
  industry: string;
  location: string;
  website: string;
  linkedin_url: string;
  match_score: number;
  match_reasons: string[];
  already_saved: boolean;
}

export interface ICPCriteria {
  industries: string[];
  job_titles: string[];
  locations: string[];
  company_sizes: string[];
  keywords: string[];
  business_requirements?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'ai' | 'lead' | 'human_agent';
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_email?: string;
  lead_company: string;
  lead_designation?: string;
  lead_status: string;
  channel: 'chat' | 'email' | 'linkedin' | 'telegram';
  status: 'active' | 'paused' | 'human_handoff' | 'closed' | 'opted_out';
  unread_count: number;
  summary?: string;
  extracted_intent: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  channel: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
  target_criteria: Record<string, any>;
  message_template?: string;
  follow_up_template?: string;
  follow_up_delay_days: number;
  sent_count: number;
  reply_count: number;
  qualified_count: number;
  meeting_count: number;
  opt_out_count: number;
  total_leads_count: number;
  created_at: string;
  updated_at: string;
  leads?: CampaignLead[];
}

export interface CampaignLead {
  id: string;
  campaign_id: string;
  lead_id: string;
  lead_name: string;
  lead_email?: string;
  lead_company: string;
  lead_designation?: string;
  status: string;
  personalized_message?: string;
  sent_at?: string;
  reply_at?: string;
  error_message?: string;
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  formatted_time: string;
  available: boolean;
}

export interface Meeting {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_email?: string;
  lead_company: string;
  user_id?: string;
  title: string;
  start_time: string;
  end_time: string;
  timezone: string;
  google_calendar_event_id?: string;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
  notes?: string;
  created_at: string;
}

export interface Integration {
  id: string;
  workspace_id: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'telegram' | 'linkedin' | 'google_calendar' | 'hubspot';
  status: 'connected' | 'disconnected' | 'simulated' | 'error';
  is_active: boolean;
  config_summary: Record<string, any>;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  stats: {
    total_leads: number;
    qualified_leads: number;
    active_campaigns: number;
    scheduled_meetings: number;
    qualification_rate: number;
    response_rate: number;
    active_conversations: number;
  };
  trends: Array<{
    date: string;
    discovered: number;
    qualified: number;
    meetings: number;
  }>;
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  recent_leads: Array<{
    id: string;
    name: string;
    designation?: string;
    company_name: string;
    industry?: string;
    status: string;
    score: number;
    created_at: string;
  }>;
  upcoming_meetings: Array<{
    id: string;
    title: string;
    prospect_name: string;
    company: string;
    start_time: string;
    meeting_link?: string;
    timezone: string;
  }>;
  recent_activities: Array<{
    id: string;
    action: string;
    entity_type: string;
    user_email: string;
    details: Record<string, any>;
    timestamp: string;
  }>;
  campaign_performance: Array<{
    id: string;
    name: string;
    channel: string;
    status: string;
    sent: number;
    replies: number;
    qualified: number;
    meetings: number;
  }>;
}
