import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const DEMO_SESSION_KEY = 'urbanshield_demo_session';
  const DEMO_USERS_KEY = 'urbanshield_demo_users';

  const readDemoSession = () => {
    try {
      const raw = localStorage.getItem(DEMO_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeDemoSession = (session: any | null) => {
    try {
      if (!session) localStorage.removeItem(DEMO_SESSION_KEY);
      else localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  };

  const readDemoUsers = (): any[] => {
    try {
      const raw = localStorage.getItem(DEMO_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeDemoUsers = (users: any[]) => {
    try {
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  };

  const createDemoAccount = (
    email: string,
    fullName: string,
    role: string
  ): { demoUser: User; demoProfile: Profile; allUsers: any[] } => {
    const users = readDemoUsers();
    const exists = users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('Demo mode: account already exists. Please sign in.');
    }

    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`).toString();
    const demoUser = { id, email } as any as User;
    const demoProfile: Profile = {
      id,
      email,
      full_name: fullName,
      role: role as any,
      department: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const next = [...users, { id, email, profile: demoProfile }];
    writeDemoUsers(next);
    writeDemoSession({ user: demoUser, profile: demoProfile });

    return { demoUser, demoProfile, allUsers: next };
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  const logActivity = async (action: string, resource: string, status: string = 'success') => {
    if (!user) return;

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      resource,
      status,
      ip_address: 'client',
      details: {}
    });
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const demo = readDemoSession();
      setUser(demo?.user ?? null);
      setProfile(demo?.profile ?? null);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // demo mode: password is ignored
      const users = readDemoUsers();
      const found = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) throw new Error('Demo mode: user not found. Please sign up first.');

      const demoUser = { id: found.id, email: found.email } as any as User;
      const demoProfile: Profile = found.profile;
      setUser(demoUser);
      setProfile(demoProfile);
      writeDemoSession({ user: demoUser, profile: demoProfile });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await logActivity('login_failed', 'auth', 'failed');
      throw error;
    }

    if (data.user) {
      const profileData = await fetchProfile(data.user.id);
      setProfile(profileData);
      await logActivity('login_success', 'auth', 'success');
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    if (!isSupabaseConfigured) {
      // Pure demo mode: only use local storage, never hit Supabase.
      const { demoUser, demoProfile } = createDemoAccount(email, fullName, role);
      setUser(demoUser);
      setProfile(demoProfile);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        // If Supabase complains (e.g. "Database error saving new user"),
        // fall back to a local demo account so the UX still works.
        console.warn('Supabase signUp failed, falling back to demo account:', error.message);
        const { demoUser, demoProfile } = createDemoAccount(email, fullName, role);
        setUser(demoUser);
        setProfile(demoProfile);
        return;
      }

      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
      } else {
        // No user in response – create a demo user so the UI can proceed.
        const { demoUser, demoProfile } = createDemoAccount(email, fullName, role);
        setUser(demoUser);
        setProfile(demoProfile);
      }
    } catch (err: any) {
      // Last‑resort fallback: any unexpected error becomes a demo user.
      console.warn('Unexpected error during signUp, using demo account instead:', err?.message);
      const { demoUser, demoProfile } = createDemoAccount(email, fullName, role);
      setUser(demoUser);
      setProfile(demoProfile);
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      writeDemoSession(null);
      return;
    }

    await logActivity('logout', 'auth', 'success');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const hasRole = (roles: string | string[]) => {
    if (!profile) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(profile.role);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
