import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search, Filter, MapPin, Activity as ActivityIcon } from 'lucide-react';
import { isSupabaseConfigured, supabase, InfrastructureAsset } from '../lib/supabase';
import { demoInfrastructureAssets } from '../lib/demoData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const InfrastructurePage = () => {
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<InfrastructureAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((asset) => asset.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((asset) => asset.status === filterStatus);
    }

    setFilteredAssets(filtered);
  }, [searchTerm, filterType, filterStatus, assets]);

  const loadAssets = async () => {
    if (!isSupabaseConfigured) {
      const data = demoInfrastructureAssets;
      setAssets(data);
      setFilteredAssets(data);
      return;
    }

    const { data, error } = await supabase
      .from('infrastructure_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssets(data);
      setFilteredAssets(data);
    }
  };

  const statusColors = {
    operational: 'bg-green-500',
    maintenance_required: 'bg-yellow-500',
    critical: 'bg-orange-500',
    offline: 'bg-red-500',
  };

  const statusTextColors = {
    operational: 'text-green-400',
    maintenance_required: 'text-yellow-400',
    critical: 'text-orange-400',
    offline: 'text-red-400',
  };

  const typeIcons: Record<string, string> = {
    bridge: '🌉',
    road: '🛣️',
    streetlight: '💡',
    water_pipeline: '💧',
    hospital: '🏥',
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search infrastructure assets..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg pl-11 pr-8 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">All Types</option>
                <option value="bridge">Bridges</option>
                <option value="road">Roads</option>
                <option value="streetlight">Streetlights</option>
                <option value="water_pipeline">Water Pipelines</option>
                <option value="hospital">Hospitals</option>
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance_required">Maintenance Required</option>
              <option value="critical">Critical</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-bold">Asset Map</h3>
          </div>
          <div className="h-[500px]">
            <MapContainer
              center={[37.7749, -122.4194]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {filteredAssets.map((asset) => (
                <Marker
                  key={asset.id}
                  position={[asset.location.lat, asset.location.lng]}
                  eventHandlers={{
                    click: () => setSelectedAsset(asset),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{asset.name}</p>
                      <p className="text-xs text-gray-600">{asset.type}</p>
                      <p className="text-xs mt-1">
                        Status: <span className={statusTextColors[asset.status]}>{asset.status}</span>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-bold">Asset List</h3>
            </div>
            <span className="text-slate-400 text-sm">
              {filteredAssets.length} assets
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '500px' }}>
            {filteredAssets.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No assets found</p>
            ) : (
              filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 rounded-lg border transition cursor-pointer ${
                    selectedAsset?.id === asset.id
                      ? 'bg-blue-900/30 border-blue-600'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeIcons[asset.type]}</span>
                      <div>
                        <h4 className="text-white font-semibold">{asset.name}</h4>
                        <p className="text-slate-400 text-xs capitalize">{asset.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${statusColors[asset.status]} animate-pulse`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${statusTextColors[asset.status]} font-medium capitalize`}>
                      {asset.status.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500">Health: {asset.health_score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedAsset && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Asset Name</p>
              <p className="text-white font-semibold">{selectedAsset.name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Type</p>
              <p className="text-white font-semibold capitalize">{selectedAsset.type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Status</p>
              <p className={`${statusTextColors[selectedAsset.status]} font-semibold capitalize`}>
                {selectedAsset.status.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Health Score</p>
              <p className="text-white font-semibold">{selectedAsset.health_score}%</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Last Inspection</p>
              <p className="text-white font-semibold">
                {new Date(selectedAsset.last_inspection).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Maintenance Due</p>
              <p className="text-white font-semibold">
                {new Date(selectedAsset.maintenance_due).toLocaleDateString()}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-slate-400 text-sm mb-1">Description</p>
              <p className="text-white">{selectedAsset.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
