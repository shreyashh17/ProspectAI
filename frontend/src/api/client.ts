const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD
    ? 'https://prospectai-11.onrender.com/api/v1'
    : 'http://localhost:8000/api/v1');


export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('prospectai_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail || `Request failed with status ${response.status}`);
  }

  // Handle empty or text responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text() as any;
}

export const api = {
  // Auth
  login: (data: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),

  // Dashboard
  getDashboardMetrics: () => apiRequest('/dashboard/metrics'),

  // Leads
  getLeads: (params: { page?: number; page_size?: number; search?: string; status?: string; industry?: string; sort_by?: string; sort_order?: string }) => {
    const q = new URLSearchParams();
    if (params.page) q.append('page', params.page.toString());
    if (params.page_size) q.append('page_size', params.page_size.toString());
    if (params.search) q.append('search', params.search);
    if (params.status && params.status !== 'all') q.append('status', params.status);
    if (params.industry && params.industry !== 'all') q.append('industry', params.industry);
    if (params.sort_by) q.append('sort_by', params.sort_by);
    if (params.sort_order) q.append('sort_order', params.sort_order);
    return apiRequest(`/leads?${q.toString()}`);
  },
  getLead: (id: string) => apiRequest(`/leads/${id}`),
  createLead: (data: any) => apiRequest('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: any) => apiRequest(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLead: (id: string) => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
  qualifyLead: (id: string) => apiRequest(`/leads/${id}/qualify`, { method: 'POST' }),
  getExportLeadsUrl: () => `${API_BASE}/leads/export`,

  // Discovery
  searchDiscovery: (criteria: any, query?: string) => {
    const q = query ? `?query=${encodeURIComponent(query)}` : '';
    return apiRequest(`/discovery/search${q}`, { method: 'POST', body: JSON.stringify(criteria) });
  },
  importDiscoveryLead: (data: any) => apiRequest('/discovery/import', { method: 'POST', body: JSON.stringify(data) }),
  uploadCsv: async (file: File) => {
    const token = localStorage.getItem('prospectai_token');
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/discovery/upload-csv`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('CSV upload failed');
    return res.json();
  },
  getCsvTemplateUrl: () => `${API_BASE}/discovery/csv-template`,

  // Qualification
  getQualificationStats: () => apiRequest('/qualification/stats'),
  getQualificationRules: () => apiRequest('/qualification/rules'),
  updateQualificationRules: (rules: any) => apiRequest('/qualification/rules', { method: 'PUT', body: JSON.stringify(rules) }),
  batchQualify: (leadIds?: string[]) => apiRequest('/qualification/batch', { method: 'POST', body: JSON.stringify({ lead_ids: leadIds }) }),
  overrideQualification: (qualId: string, data: { status: string; score?: number; manual_notes?: string }) =>
    apiRequest(`/qualification/${qualId}/override`, { method: 'POST', body: JSON.stringify(data) }),

  // Conversations & Chatbot
  getConversations: (status?: string, channel?: string) => {
    const q = new URLSearchParams();
    if (status) q.append('filter_status', status);
    if (channel) q.append('channel', channel);
    return apiRequest(`/conversations?${q.toString()}`);
  },
  getLeadConversation: (leadId: string, channel: string = 'chat') =>
    apiRequest(`/conversations/lead/${leadId}?channel=${channel}`),
  getConversation: (id: string) => apiRequest(`/conversations/${id}`),
  sendMessage: (convId: string, content: string, sender: string = 'lead') =>
    apiRequest(`/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content, sender }) }),
  toggleHandoff: (convId: string, enable: boolean) =>
    apiRequest(`/conversations/${convId}/handoff?enable=${enable}`, { method: 'POST' }),
  updateConversationStatus: (convId: string, newStatus: string) =>
    apiRequest(`/conversations/${convId}/status?new_status=${newStatus}`, { method: 'POST' }),

  // Campaigns
  getCampaigns: () => apiRequest('/campaigns'),
  getCampaign: (id: string) => apiRequest(`/campaigns/${id}`),
  createCampaign: (data: any) => apiRequest('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: any) => apiRequest(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  launchCampaign: (id: string) => apiRequest(`/campaigns/${id}/launch`, { method: 'POST' }),
  pauseCampaign: (id: string) => apiRequest(`/campaigns/${id}/pause`, { method: 'POST' }),
  previewPersonalization: (leadId: string, channel: string = 'email', template?: string) => {
    const q = new URLSearchParams({ lead_id: leadId, channel });
    if (template) q.append('template', template);
    return apiRequest(`/campaigns/preview-personalization?${q.toString()}`, { method: 'POST' });
  },

  // Meetings
  getMeetings: (status?: string) => {
    const q = status ? `?status_filter=${status}` : '';
    return apiRequest(`/meetings${q}`);
  },
  getAvailableSlots: (date: string, timezone: string = 'UTC') =>
    apiRequest(`/meetings/slots?date=${date}&timezone=${encodeURIComponent(timezone)}`),
  scheduleMeeting: (data: any) => apiRequest('/meetings', { method: 'POST', body: JSON.stringify(data) }),
  cancelMeeting: (id: string, reason?: string) => {
    const q = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return apiRequest(`/meetings/${id}/cancel${q}`, { method: 'POST' });
  },

  // Analytics
  getAnalyticsOverview: () => apiRequest('/analytics/overview'),

  // Integrations
  getIntegrations: () => apiRequest('/integrations'),
  updateIntegration: (data: any) => apiRequest('/integrations/update', { method: 'POST', body: JSON.stringify(data) }),
  testIntegration: (provider: string) => apiRequest(`/integrations/test/${provider}`, { method: 'POST' }),

  // Settings
  getWorkspaceSettings: () => apiRequest('/settings/workspace'),
  updateWorkspaceSettings: (data: any) => apiRequest('/settings/workspace', { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: (limit: number = 50) => apiRequest(`/settings/audit-logs?limit=${limit}`),
};
