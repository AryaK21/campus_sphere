import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';

export interface UserProfile {
  id: string;
  email: string;
  role: 'Student' | 'Faculty' | 'Admin';
  name: string;
  department: string;
  semester?: number;
  profile_pic_url?: string;
  bio?: string;
  social_links?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  saved_resources?: string[];
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
  supabaseUserId?: string;
}

export const DEMO_USERS: Record<string, UserProfile> = {
  'demo-token-student': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'aarav.patel@pccoer.in',
    name: 'Aarav Patel',
    role: 'Student',
    department: 'Computer Engineering',
    semester: 6,
    profile_pic_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Full Stack Developer & Competitive Programmer at PCCOE.',
    social_links: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    saved_resources: [],
    created_at: new Date().toISOString(),
  },
  'demo-token-faculty': {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'prof.sharma@pccoer.in',
    name: 'Prof. Rajesh Sharma',
    role: 'Faculty',
    department: 'Computer Engineering',
    semester: 1,
    profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Professor of Computer Engineering & Distributed Systems at PCCOE.',
    social_links: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    saved_resources: [],
    created_at: new Date().toISOString(),
  },
  'demo-token-admin': {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'admin@pccoer.in',
    name: 'Dr. Alok Verma',
    role: 'Admin',
    department: 'Administration',
    semester: 1,
    profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Dean of Academic Computing & Administration at PCCOE.',
    social_links: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    saved_resources: [],
    created_at: new Date().toISOString(),
  },
};

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      sendResponse(res, 401, false, 'Access denied. No authentication token provided.');
      return;
    }

    // Support instant demo accounts for evaluation
    if (DEMO_USERS[token]) {
      req.user = DEMO_USERS[token];
      req.supabaseUserId = DEMO_USERS[token].id;
      return next();
    }

    // Verify the Supabase JWT
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      sendResponse(res, 401, false, 'Invalid or expired authentication token.');
      return;
    }

    // Get user profile from our users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profileError || !profile) {
      sendResponse(res, 401, false, 'User profile not found.');
      return;
    }

    req.user = profile as UserProfile;
    req.supabaseUserId = supabaseUser.id;
    next();
  } catch (error) {
    sendResponse(res, 401, false, 'Authentication failed.');
    return;
  }
};

export const authorize = (...roles: Array<'Student' | 'Faculty' | 'Admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendResponse(res, 401, false, 'User authentication required.');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendResponse(
        res,
        403,
        false,
        `Access denied. Your role (${req.user.role}) does not have permission for this action.`
      );
      return;
    }

    next();
  };
};
