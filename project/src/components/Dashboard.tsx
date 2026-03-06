import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  demoActivityLogs,
  demoInfrastructureAssets,
  demoProfiles,
  demoSecurityAlerts,
} from '../lib/demoData';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalAssets: number;
  criticalAssets: number;
  activeUsers: number;
  recentAlerts: number;
  apiRequests: number;
  blockedRequests: number;
}

export const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    criticalAssets: 0,
    activeUsers: 0,
    recentAlerts: 0,
    apiRequests: 0,
    blockedRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemRisk, setSystemRisk] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const safePct = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    if (!isSupabaseConfigured) {
      const assets = demoInfrastructureAssets;
      const alerts = demoSecurityAlerts.filter(
        (a) =>
          new Date(a.created_at).getTime() >=
          Date.now() - 24 * 60 * 60 * 1000
      );
      const logs = demoActivityLogs
        .slice()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        )
        .slice(0, 10);
      const users = demoProfiles.filter((u) => u.is_active);

      const criticalCount =
        assets.filter(
          (a) => a.status === 'critical' || a.status === 'offline'
        ).length || 0;
      const totalAssets = assets.length;
      const unresolvedAlerts =
        alerts.filter((a) => !a.resolved).length || 0;

      let risk: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (unresolvedAlerts > 10 || criticalCount > 5) risk = 'critical';
      else if (unresolvedAlerts > 5 || criticalCount > 2) risk = 'high';
      else if (unresolvedAlerts > 2 || criticalCount > 0) risk = 'medium';

      setStats({
        totalAssets,
        criticalAssets: criticalCount,
        activeUsers: users.length,
        recentAlerts: unresolvedAlerts,
        apiRequests: 8200,
        blockedRequests: 37,
      });
      setRecentActivity(logs);
      setSystemRisk(risk);
      return;
    }

    const { data: assets } = await supabase
      .from('infrastructure_assets')
      .select('status');

    const { data: alerts } = await supabase
      .from('security_alerts')
      .select('*')
      .gte(
        'created_at',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );

    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    const { data: users } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('is_active', true);

    const criticalCount = assets?.filter(a => a.status === 'critical' || a.status === 'offline').length || 0;
    const totalAssets = assets?.length || 0;
    const unresolvedAlerts = alerts?.filter(a => !a.resolved).length || 0;

    let risk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (unresolvedAlerts > 10 || criticalCount > 5) risk = 'critical';
    else if (unresolvedAlerts > 5 || criticalCount > 2) risk = 'high';
    else if (unresolvedAlerts > 2 || criticalCount > 0) risk = 'medium';

    setStats({
      totalAssets,
      criticalAssets: criticalCount,
      activeUsers: users?.length || 0,
      recentAlerts: unresolvedAlerts,
      apiRequests: Math.floor(Math.random() * 5000) + 3000,
      blockedRequests: Math.floor(Math.random() * 50) + 10,
    });

    setRecentActivity(logs || []);
    setSystemRisk(risk);
  };

  const statCards = [
    {
      title: 'Infrastructure Assets',
      value: stats.totalAssets,
      subtitle: `${stats.criticalAssets} need attention`,
      icon: Shield,
      color: 'blue',
      trend: '+12%',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      subtitle: 'Currently online',
      icon: Users,
      color: 'green',
      trend: '+5%',
    },
    {
      title: 'Security Alerts',
      value: stats.recentAlerts,
      subtitle: 'Last 24 hours',
      icon: AlertTriangle,
      color: stats.recentAlerts > 5 ? 'red' : 'yellow',
      trend: stats.recentAlerts > 5 ? '+23%' : '-8%',
    },
    {
      title: 'API Requests',
      value: stats.apiRequests.toLocaleString(),
      subtitle: `${stats.blockedRequests} blocked`,
      icon: Activity,
      color: 'cyan',
      trend: '+18%',
    },
  ];

  const riskColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {profile?.full_name}</h2>
            <p className="text-blue-100">
              Your urban infrastructure security command center
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100 mb-1">System Risk Level</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${riskColors[systemRisk]} animate-pulse`}></div>
              <span className="text-lg font-bold uppercase">{systemRisk}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`bg-${stat.color}-500/20 rounded-lg p-3`}
                >
                  <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    stat.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-white text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-slate-500 text-xs">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-bold">Recent Activity</h3>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
                >
                  {log.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{log.action}</p>
                    <p className="text-slate-400 text-xs truncate">{log.resource}</p>
                  </div>
                  <span className="text-slate-500 text-xs flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-bold">System Health</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Infrastructure Health</span>
                <span className="text-white font-semibold">
                  {stats.totalAssets > 0
                    ? safePct(((stats.totalAssets - stats.criticalAssets) / stats.totalAssets) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{
                    width: `${
                      stats.totalAssets > 0
                        ? safePct(((stats.totalAssets - stats.criticalAssets) / stats.totalAssets) * 100)
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">API Success Rate</span>
                <span className="text-white font-semibold">
                  {stats.apiRequests > 0
                    ? safePct(((stats.apiRequests - stats.blockedRequests) / stats.apiRequests) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{
                    width: `${
                      stats.apiRequests > 0
                        ? safePct(((stats.apiRequests - stats.blockedRequests) / stats.apiRequests) * 100)
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Security Score</span>
                <span className="text-white font-semibold">
                  {systemRisk === 'low' ? '95%' : systemRisk === 'medium' ? '75%' : systemRisk === 'high' ? '55%' : '35%'}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    systemRisk === 'low'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : systemRisk === 'medium'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}
                  style={{
                    width:
                      systemRisk === 'low' ? '95%' : systemRisk === 'medium' ? '75%' : systemRisk === 'high' ? '55%' : '35%',
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">Uptime</p>
              <p className="text-white text-xl font-bold">99.8%</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">Response Time</p>
              <p className="text-white text-xl font-bold">45ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
