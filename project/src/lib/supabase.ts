import { createClient } from '@supabase/supabase-js';

// For this challenge we default to DEMO MODE so you don't need any Supabase setup.
// If you later want real Supabase auth, set:
// VITE_USE_REAL_SUPABASE=true
// along with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file.
export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_USE_REAL_SUPABASE === 'true'
);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!isSupabaseConfigured) {
  console.warn(
    'Running UrbanShield in DEMO MODE (no real Supabase connection). ' +
      'Sign up / login and data stay local in your browser.'
  );
}

class NoopQuery {
  private readonly result = {
    data: null,
    error: { message: 'Supabase not configured' },
  };

  // Read
  select() { return this; }
  eq() { return this; }
  gte() { return this; }
  order() { return this; }
  limit() { return this; }
  in() { return this; }
  maybeSingle() { return this; }

  // Write
  insert() { return this; }
  update() { return this; }
  delete() { return this; }

  // Make it awaitable (`await supabase.from(...).select(...)`)
  then(resolve: any, reject: any) {
    return Promise.resolve(this.result).then(resolve, reject);
  }
}

const noopSupabase = {
  from: () => new NoopQuery(),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: new Error('Supabase not configured'),
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: new Error('Supabase not configured'),
    }),
    signOut: async () => ({ error: null }),
  },
} as const;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (noopSupabase as any);

export type UserRole = 'admin' | 'city_engineer' | 'maintenance_staff' | 'public_viewer';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'bridge' | 'road' | 'streetlight' | 'water_pipeline' | 'hospital';
  location: { lat: number; lng: number };
  status: 'operational' | 'maintenance_required' | 'critical' | 'offline';
  health_score: number;
  last_inspection: string;
  maintenance_due: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ip_address: string;
  status: 'success' | 'failed' | 'blocked';
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  alert_type: 'brute_force' | 'api_abuse' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id: string | null;
  description: string;
  details: Record<string, unknown>;
  ip_address: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  created_by: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  last_used: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface MaintenanceReport {
  id: string;
  asset_id: string;
  submitted_by: string;
  report_type: 'inspection' | 'maintenance' | 'repair' | 'emergency';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  findings: string;
  actions_taken: string;
  images: string[];
  created_at: string;
  updated_at: string;
}
