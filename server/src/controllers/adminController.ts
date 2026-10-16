import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getSystemAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      { count: totalUsers },
      { count: studentCount },
      { count: facultyCount },
      { count: adminCount },
      { count: totalResources },
      { count: totalSubjects },
      { count: totalForumPosts },
      { count: totalComments },
      { count: activePlacements },
      { count: activeNotices },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Student'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Faculty'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Admin'),
      supabase.from('resources').select('*', { count: 'exact', head: true }),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
      supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
      supabase.from('forum_comments').select('*', { count: 'exact', head: true }),
      supabase.from('placements').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
      supabase.from('notices').select('*', { count: 'exact', head: true }),
    ]);

    // Get total downloads
    const { data: downloadStats } = await supabase.from('resources').select('download_count');
    const totalDownloads = (downloadStats || []).reduce((sum: number, r: any) => sum + (r.download_count || 0), 0);

    // Recent activity
    const [{ data: recentUsers }, { data: recentResources }, { data: recentPosts }] = await Promise.all([
      supabase.from('users').select('id, name, email, role, department, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('resources').select('id, title, resource_type, created_at, uploader:users!resources_uploaded_by_fkey(name, role)').order('created_at', { ascending: false }).limit(5),
      supabase.from('forum_posts').select('id, title, category, created_at, author:users!forum_posts_author_id_fkey(name, role)').order('created_at', { ascending: false }).limit(5),
    ]);

    sendResponse(res, 200, true, 'Analytics retrieved.', {
      metrics: {
        totalUsers: totalUsers || 0,
        studentCount: studentCount || 0,
        facultyCount: facultyCount || 0,
        adminCount: adminCount || 0,
        totalResources: totalResources || 0,
        totalSubjects: totalSubjects || 0,
        totalForumPosts: totalForumPosts || 0,
        totalComments: totalComments || 0,
        activePlacements: activePlacements || 0,
        activeNotices: activeNotices || 0,
        totalDownloads,
      },
      recentActivity: {
        users: recentUsers || [],
        resources: recentResources || [],
        posts: recentPosts || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from('users').select('*', { count: 'exact' });

    if (role && role !== 'All') query = query.eq('role', role);
    if (department && department !== 'All') query = query.eq('department', department);
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limitNum - 1);

    const { data: users, error, count } = await query;

    if (error) { sendResponse(res, 500, false, 'Failed to retrieve users.'); return; }

    const mapped = (users || []).map((u: any) => ({ _id: u.id, ...u }));
    const total = count || 0;

    sendResponse(res, 200, true, 'Users retrieved.', { users: mapped }, {
      total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['Student', 'Faculty', 'Admin'].includes(role)) {
      sendResponse(res, 400, false, 'Invalid role.'); return;
    }

    const { data: user, error } = await supabase
      .from('users').update({ role }).eq('id', req.params.userId).select().single();

    if (error || !user) { sendResponse(res, 404, false, 'User not found.'); return; }

    sendResponse(res, 200, true, `Role updated to ${role}.`, { user: { _id: user.id, ...user } });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.userId);
    if (error) { sendResponse(res, 500, false, 'Failed to delete user.'); return; }
    sendResponse(res, 200, true, 'User deleted.');
  } catch (error) {
    next(error);
  }
};
