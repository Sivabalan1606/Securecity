import { ReactNode, useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Building2,
  Activity,
  Users,
  Key,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'city_engineer', 'maintenance_staff', 'public_viewer'] },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2, roles: ['admin', 'city_engineer', 'maintenance_staff', 'public_viewer'] },
    { id: 'security', label: 'Security Monitor', icon: AlertTriangle, roles: ['admin'] },
    { id: 'activity', label: 'Activity Logs', icon: Activity, roles: ['admin'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'city_engineer', 'maintenance_staff'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'api-keys', label: 'API Keys', icon: Key, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item =>
    profile && item.roles.includes(profile.role)
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-slate-800 border-r border-slate-700 transition-all duration-300 overflow-hidden flex flex-col`}
        >
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">UrbanShield</h1>
                <p className="text-slate-400 text-xs">Security Platform</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
              <p className="text-slate-400 text-xs mb-1">Logged in as</p>
              <p className="text-white font-medium text-sm truncate">{profile?.full_name}</p>
              <p className="text-slate-400 text-xs truncate">{profile?.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                  {profile?.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-slate-400 hover:text-white transition"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div>
                  <h2 className="text-white text-xl font-bold capitalize">
                    {currentPage.replace('-', ' ')}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Urban Infrastructure Security Management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-slate-400 text-xs">System Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-900 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
