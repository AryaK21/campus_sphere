import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';
import { AuthenticatedRequest, DEMO_USERS } from '../middlewares/auth';

const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'pccoer.in';

const validateEmailDomain = (email: string): boolean => {
  return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
};

// POST /api/auth/register
// Called after Supabase creates the auth user — stores profile data in our users table
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, department, semester, role, bio, social_links } = req.body;

    if (!name || !email || !department) {
      sendResponse(res, 400, false, 'Name, email, and department are required.');
      return;
    }

    if (!validateEmailDomain(email)) {
      sendResponse(res, 400, false, `Only @${ALLOWED_EMAIL_DOMAIN} email addresses are allowed.`);
      return;
    }

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      sendResponse(res, 400, false, 'An account with this email already exists.');
      return;
    }

    // Get Supabase auth user id from the token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      sendResponse(res, 401, false, 'Authentication required.');
      return;
    }

    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !supabaseUser) {
      sendResponse(res, 401, false, 'Invalid authentication token.');
      return;
    }

    const profilePicUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: supabaseUser.id,
        name: name.trim(),
        email: email.toLowerCase(),
        role: role || 'Student',
        department: department.trim(),
        semester: semester || 1,
        profile_pic_url: profilePicUrl,
        bio: bio || '',
        social_links: social_links || { linkedin: '', github: '', website: '' },
        saved_resources: [],
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      sendResponse(res, 500, false, 'Failed to create user profile.');
      return;
    }

    sendResponse(res, 201, true, 'Profile created successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, 'Not authenticated.');
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        saved_resources_details:resources!inner(id, title, resource_type, file_url, semester, department)
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      // Fallback without join if no saved resources
      const { data: basicUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();

      sendResponse(res, 200, true, 'Profile retrieved.', { user: basicUser });
      return;
    }

    sendResponse(res, 200, true, 'Profile retrieved.', { user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, 'Not authenticated.');
      return;
    }

    const { name, bio, social_links, semester, profile_pic_url } = req.body;

    const updates: Record<string, any> = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (social_links) updates.social_links = { ...req.user.social_links, ...social_links };
    if (semester) updates.semester = semester;
    if (profile_pic_url) updates.profile_pic_url = profile_pic_url;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      sendResponse(res, 500, false, 'Failed to update profile.');
      return;
    }

    sendResponse(res, 200, true, 'Profile updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/save-resource/:resourceId
export const toggleSaveResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, 'Not authenticated.');
      return;
    }

    const { resourceId } = req.params;
    const savedResources: string[] = req.user.saved_resources || [];
    const index = savedResources.indexOf(resourceId);

    let isSaved = false;
    let updatedList: string[];

    if (index > -1) {
      updatedList = savedResources.filter(id => id !== resourceId);
      isSaved = false;
    } else {
      updatedList = [...savedResources, resourceId];
      isSaved = true;
    }

    const { error } = await supabase
      .from('users')
      .update({ saved_resources: updatedList })
      .eq('id', req.user.id);

    if (error) {
      sendResponse(res, 500, false, 'Failed to update bookmarks.');
      return;
    }

    sendResponse(res, 200, true, isSaved ? 'Resource bookmarked.' : 'Bookmark removed.', {
      isSaved,
      savedResources: updatedList,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/user/:userId
export const getPublicProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, semester, bio, profile_pic_url, social_links, created_at')
      .eq('id', req.params.userId)
      .single();

    if (error || !user) {
      sendResponse(res, 404, false, 'User not found.');
      return;
    }

    sendResponse(res, 200, true, 'Public profile retrieved.', { user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/validate-email
export const validateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const isValid = validateEmailDomain(email);
    sendResponse(res, 200, true, isValid ? 'Email domain is valid.' : `Only @${ALLOWED_EMAIL_DOMAIN} emails allowed.`, {
      isValid,
      domain: ALLOWED_EMAIL_DOMAIN,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/demo-login
export const demoLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;
    const roleKey = String(role || 'student').toLowerCase();
    const tokenKey = `demo-token-${roleKey}`;
    const user = DEMO_USERS[tokenKey] || DEMO_USERS['demo-token-student'];

    sendResponse(res, 200, true, `Signed in as demo ${user.role}.`, {
      user,
      token: tokenKey,
    });
  } catch (error) {
    next(error);
  }
};

