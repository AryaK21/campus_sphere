import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, Role } from '../types';

const ALLOWED_DOMAIN = 'pccoer.in';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  signInWithGoogle: () => Promise<void>;
  loginAsDemo: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  toggleSaveResource: (resourceId: string) => Promise<boolean>;
  completeRegistration: (data: {
    name: string;
    department: string;
    semester?: number;
    role?: Role;
  }) => Promise<void>;
  needsProfile: boolean;
}

const localDemoProfiles: Record<Role, User> = {
  Student: {
    _id: '00000000-0000-0000-0000-000000000001',
    name: 'Aarav Patel',
    email: 'aarav.patel@pccoer.in',
    role: 'Student',
    department: 'Computer Engineering',
    semester: 6,
    profilePicUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Full Stack Developer & Competitive Programmer at PCCOE.',
    socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    savedResources: [],
    createdAt: new Date().toISOString(),
  },
  Faculty: {
    _id: '00000000-0000-0000-0000-000000000002',
    name: 'Prof. Rajesh Sharma',
    email: 'prof.sharma@pccoer.in',
    role: 'Faculty',
    department: 'Computer Engineering',
    semester: 1,
    profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Professor of Computer Engineering & Distributed Systems at PCCOE.',
    socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    savedResources: [],
    createdAt: new Date().toISOString(),
  },
  Admin: {
    _id: '00000000-0000-0000-0000-000000000003',
    name: 'Dr. Alok Verma',
    email: 'admin@pccoer.in',
    role: 'Admin',
    department: 'Administration',
    semester: 1,
    profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Dean of Academic Computing & Administration at PCCOE.',
    socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    savedResources: [],
    createdAt: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  const mapProfile = (profile: any): User => ({
    _id: profile.id || profile._id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    department: profile.department,
    semester: profile.semester,
    profilePicUrl: profile.profile_pic_url || profile.profilePicUrl,
    bio: profile.bio,
    socialLinks: profile.social_links || profile.socialLinks,
    savedResources: profile.saved_resources || profile.savedResources || [],
    createdAt: profile.created_at || profile.createdAt,
  });

  const fetchUserProfile = async (supabaseUser: SupabaseUser, token: string): Promise<boolean> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data?.user) {
        setUser(mapProfile(data.data.user));
        localStorage.setItem('campus_sphere_token', token);
        setNeedsProfile(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // 1. Check for stored demo user first
    const savedDemo = localStorage.getItem('campus_sphere_demo_user');
    const savedToken = localStorage.getItem('campus_sphere_token');

    if (savedDemo && savedToken?.startsWith('demo-token-')) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('campus_sphere_demo_user');
      }
    }

    // 2. Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const email = session.user.email || '';
        if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
          supabase.auth.signOut();
          localStorage.removeItem('campus_sphere_token');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('campus_sphere_token', session.access_token);
        fetchUserProfile(session.user, session.access_token).then((hasProfile) => {
          if (!hasProfile) {
            setNeedsProfile(true);
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }).catch(() => {
      setIsLoading(false);
    });

    // 3. Listen to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user && event !== 'SIGNED_OUT') {
        const email = session.user.email || '';
        if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
          await supabase.auth.signOut();
          localStorage.removeItem('campus_sphere_token');
          setUser(null);
          setNeedsProfile(false);
          setIsLoading(false);
          return;
        }

        localStorage.setItem('campus_sphere_token', session.access_token);
        const hasProfile = await fetchUserProfile(session.user, session.access_token);
        if (!hasProfile) {
          setNeedsProfile(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNeedsProfile(false);
        localStorage.removeItem('campus_sphere_token');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: ALLOWED_DOMAIN,
        },
      },
    });
    if (error) throw error;
  };

  const loginAsDemo = async (role: Role) => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const result = await response.json();
      if (result.success && result.data?.user) {
        const demoUser = mapProfile(result.data.user);
        setUser(demoUser);
        localStorage.setItem('campus_sphere_token', result.data.token);
        localStorage.setItem('campus_sphere_demo_user', JSON.stringify(demoUser));
        setNeedsProfile(false);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // Fallback below
    }

    const fallbackUser = localDemoProfiles[role] || localDemoProfiles.Student;
    setUser(fallbackUser);
    localStorage.setItem('campus_sphere_token', `demo-token-${role.toLowerCase()}`);
    localStorage.setItem('campus_sphere_demo_user', JSON.stringify(fallbackUser));
    setNeedsProfile(false);
    setIsLoading(false);
  };

  const completeRegistration = async (data: {
    name: string;
    department: string;
    semester?: number;
    role?: Role;
  }) => {
    if (!session) throw new Error('No active session');
    
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        name: data.name,
        email: session.user.email,
        department: data.department,
        semester: data.semester || 1,
        role: data.role || 'Student',
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Registration failed');
    }

    setUser(mapProfile(result.data.user));
    setNeedsProfile(false);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('campus_sphere_token');
    localStorage.removeItem('campus_sphere_demo_user');
    setUser(null);
    setSession(null);
    setNeedsProfile(false);
  };

  const toggleSaveResource = async (resourceId: string): Promise<boolean> => {
    if (!user) return false;
    const token = localStorage.getItem('campus_sphere_token');
    if (!token) return false;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/save-resource/${resourceId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        const { isSaved, savedResources } = data.data;
        setUser((prev) => prev ? { ...prev, savedResources } : null);
        return isSaved;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updatedUser } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        role: user ? user.role : null,
        signInWithGoogle,
        loginAsDemo,
        signOut,
        updateUser,
        toggleSaveResource,
        completeRegistration,
        needsProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
