import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { InfrastructurePage } from './components/InfrastructurePage';
import { SecurityMonitor } from './components/SecurityMonitor';
import { ActivityLogs } from './components/ActivityLogs';
import { ApiKeyManagement } from './components/ApiKeyManagement';
import { UserManagement } from './components/UserManagement';

type PageId =
  | 'dashboard'
  | 'infrastructure'
  | 'security'
  | 'activity'
  | 'reports'
  | 'users'
  | 'api-keys';

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-300 text-sm">Loading UrbanShield...</p>
        </div>
      </div>
    );
  }

  // If not authenticated yet, show the login/sign‑up experience
  if (!user || !profile) {
    return <LoginPage />;
  }

  let content: JSX.Element | null = null;
  switch (currentPage) {
    case 'dashboard':
      content = <Dashboard />;
      break;
    case 'infrastructure':
      content = <InfrastructurePage />;
      break;
    case 'security':
      content = <SecurityMonitor />;
      break;
    case 'activity':
      content = <ActivityLogs />;
      break;
    case 'users':
      content = <UserManagement />;
      break;
    case 'api-keys':
      content = <ApiKeyManagement />;
      break;
    // simple placeholder for now
    case 'reports':
      content = (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-slate-200">
          <h2 className="text-xl font-bold mb-2">Reports</h2>
          <p className="text-slate-400 text-sm">
            Reporting and analytics will appear here.
          </p>
        </div>
      );
      break;
    default:
      content = null;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {content}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
