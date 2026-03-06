import { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Copy, CheckCircle } from 'lucide-react';
import { isSupabaseConfigured, supabase, ApiKey } from '../lib/supabase';
import { demoApiKeys } from '../lib/demoData';
import { useAuth } from '../contexts/AuthContext';

export const ApiKeyManagement = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    if (!isSupabaseConfigured) {
      const data = demoApiKeys
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      setApiKeys(data);
      return;
    }

    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setApiKeys(data);
    }
  };

  const generateApiKey = () => {
    return `urban_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const createApiKey = async () => {
    if (!newKeyName.trim() || !user) return;

    const key = generateApiKey();
    if (!isSupabaseConfigured) {
      const newKey: ApiKey = {
        id: `demo-${Date.now()}`,
        key,
        name: newKeyName,
        created_by: user.id,
        permissions: ['read', 'write'],
        rate_limit: 100,
        is_active: true,
        last_used: null,
        expires_at: null,
        created_at: new Date().toISOString(),
      };
      setApiKeys((prev) => [newKey, ...prev]);
      setNewKeyName('');
      setShowCreateForm(false);
      return;
    }

    await supabase.from('api_keys').insert({
      key,
      name: newKeyName,
      created_by: user.id,
      permissions: ['read', 'write'],
      rate_limit: 100,
      is_active: true,
    });

    setNewKeyName('');
    setShowCreateForm(false);
    loadApiKeys();
  };

  const deleteApiKey = async (keyId: string) => {
    if (!isSupabaseConfigured) {
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
      return;
    }

    await supabase.from('api_keys').delete().eq('id', keyId);
    loadApiKeys();
  };

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    if (!isSupabaseConfigured) {
      setApiKeys((prev) =>
        prev.map((k) =>
          k.id === keyId ? { ...k, is_active: !currentStatus } : k
        )
      );
      return;
    }

    await supabase.from('api_keys').update({ is_active: !currentStatus }).eq('id', keyId);
    loadApiKeys();
  };

  const copyToClipboard = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">API Key Management</h2>
            <p className="text-blue-100">
              Manage API keys for external applications and services
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Key</span>
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Create New API Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">
                Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API, Mobile App"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={createApiKey}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Create Key
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKeyName('');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <Key className="w-8 h-8 text-blue-400" />
            <div className="text-right">
              <p className="text-slate-400 text-sm">Total Keys</p>
              <p className="text-white text-3xl font-bold">{apiKeys.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div className="text-right">
              <p className="text-slate-400 text-sm">Active Keys</p>
              <p className="text-white text-3xl font-bold">
                {apiKeys.filter((k) => k.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <Key className="w-8 h-8 text-yellow-400" />
            <div className="text-right">
              <p className="text-slate-400 text-sm">API Requests</p>
              <p className="text-white text-3xl font-bold">
                {Math.floor(Math.random() * 10000) + 5000}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-bold">API Keys</h3>
        </div>

        <div className="divide-y divide-slate-700">
          {apiKeys.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No API keys created yet. Create one to get started.
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="p-6 hover:bg-slate-700/30 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-semibold">{apiKey.name}</h4>
                      <button
                        onClick={() => toggleKeyStatus(apiKey.id, apiKey.is_active)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          apiKey.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-slate-300 text-sm font-mono">
                        {apiKey.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition"
                        title="Copy to clipboard"
                      >
                        {copiedKey === apiKey.id ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Rate Limit</p>
                        <p className="text-white font-medium">{apiKey.rate_limit} req/min</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Created</p>
                        <p className="text-white font-medium">
                          {new Date(apiKey.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Last Used</p>
                        <p className="text-white font-medium">
                          {apiKey.last_used
                            ? new Date(apiKey.last_used).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Expires</p>
                        <p className="text-white font-medium">
                          {apiKey.expires_at
                            ? new Date(apiKey.expires_at).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteApiKey(apiKey.id)}
                    className="ml-4 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-6">
        <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Security Best Practices
        </h3>
        <ul className="space-y-2 text-blue-200 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Never share your API keys publicly or commit them to version control</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Rotate API keys regularly and revoke unused keys immediately</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Use different keys for different environments (dev, staging, production)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Monitor API usage and set up alerts for unusual activity</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
