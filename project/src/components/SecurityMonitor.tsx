import { useEffect, useState } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { AlertTriangle, Shield, Activity, TrendingUp } from 'lucide-react';
import { isSupabaseConfigured, supabase, SecurityAlert } from '../lib/supabase';
import { demoSecurityAlerts } from '../lib/demoData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const SecurityMonitor = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    critical: 0,
  });

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    if (!isSupabaseConfigured) {
      const data = demoSecurityAlerts
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      setAlerts(data);
      setStats({
        total: data.length,
        resolved: data.filter((a) => a.resolved).length,
        pending: data.filter((a) => !a.resolved).length,
        critical: data.filter((a) => a.severity === 'critical' && !a.resolved).length,
      });
      return;
    }

    const { data } = await supabase
      .from('security_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAlerts(data);
      setStats({
        total: data.length,
        resolved: data.filter((a) => a.resolved).length,
        pending: data.filter((a) => !a.resolved).length,
        critical: data.filter((a) => a.severity === 'critical' && !a.resolved).length,
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    if (!isSupabaseConfigured) {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, resolved: true, resolved_at: new Date().toISOString() } : a
        )
      );
      setStats((prev) => ({
        ...prev,
        resolved: prev.resolved + 1,
        pending: Math.max(0, prev.pending - 1),
      }));
      return;
    }

    await supabase
      .from('security_alerts')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', alertId);
    loadSecurityData();
  };

  const apiTrafficData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'],
    datasets: [
      {
        label: 'API Requests',
        data: [320, 180, 450, 890, 1200, 950, 670],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Blocked Requests',
        data: [12, 8, 25, 42, 35, 28, 18],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const alertTypeData = {
    labels: ['Brute Force', 'API Abuse', 'Unauthorized Access', 'Suspicious Activity'],
    datasets: [
      {
        data: [
          alerts.filter((a) => a.alert_type === 'brute_force').length,
          alerts.filter((a) => a.alert_type === 'api_abuse').length,
          alerts.filter((a) => a.alert_type === 'unauthorized_access').length,
          alerts.filter((a) => a.alert_type === 'suspicious_activity').length,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const severityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Alerts by Severity',
        data: [
          alerts.filter((a) => a.severity === 'low').length,
          alerts.filter((a) => a.severity === 'medium').length,
          alerts.filter((a) => a.severity === 'high').length,
          alerts.filter((a) => a.severity === 'critical').length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(203, 213, 225)',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgb(148, 163, 184)' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
      },
      y: {
        ticks: { color: 'rgb(148, 163, 184)' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
        },
      },
    },
  };

  const severityColors: Record<string, string> = {
    low: 'text-green-400 bg-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/20',
    high: 'text-orange-400 bg-orange-500/20',
    critical: 'text-red-400 bg-red-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div className="text-right">
              <p className="text-slate-400 text-sm">Total Alerts</p>
              <p className="text-white text-3xl font-bold">{stats.total}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">All time security events</p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <div className="text-right">
              <p className="text-slate-400 text-sm">Pending</p>
              <p className="text-white text-3xl font-bold">{stats.pending}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">Awaiting resolution</p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-8 h-8 text-green-400" />
            <div className="text-right">
              <p className="text-slate-400 text-sm">Resolved</p>
              <p className="text-white text-3xl font-bold">{stats.resolved}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">Successfully handled</p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-red-400" />
            <div className="text-right">
              <p className="text-slate-400 text-sm">Critical</p>
              <p className="text-white text-3xl font-bold">{stats.critical}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">Requires immediate attention</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">API Traffic & Security</h3>
          <div style={{ height: '300px' }}>
            <Line data={apiTrafficData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Alert Distribution</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={alertTypeData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Severity Breakdown</h3>
          <div style={{ height: '250px' }}>
            <Bar data={severityData} options={chartOptions} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-bold">Recent Security Alerts</h3>
            <span className="text-slate-400 text-sm">{alerts.length} total</span>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          severityColors[alert.severity]
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {alert.alert_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium">{alert.description}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
                    >
                      Resolve
                    </button>
                  )}
                  {alert.resolved && (
                    <span className="ml-4 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-slate-500 text-center py-8">No security alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
