import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadDiscoveryPage } from './pages/LeadDiscoveryPage';
import { LeadManagementPage } from './pages/LeadManagementPage';
import { AIQualificationPage } from './pages/AIQualificationPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient();

// Protected Route wrapper that allows seamless demo viewing if token exists or auto-logins
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0F17] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#5B5CE2] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* App Routes (Authenticated Shell) */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/discovery" element={<LeadDiscoveryPage />} />
                <Route path="/leads" element={<LeadManagementPage />} />
                <Route path="/qualification" element={<AIQualificationPage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/conversations" element={<ConversationsPage />} />
                <Route path="/meetings" element={<MeetingsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
