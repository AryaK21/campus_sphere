import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth';

const mapNotice = (n: any) => ({
  _id: n.id,
  title: n.title,
  content: n.content,
  category: n.category,
  postedBy: n.posted_by_user ? { _id: n.posted_by_user.id, ...n.posted_by_user } : null,
  targetAudience: n.target_audience || ['All'],
  pinned: n.pinned,
  attachmentUrl: n.attachment_url,
  expiresAt: n.expires_at,
  createdAt: n.created_at,
});

export const getNotices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, audience, search, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('notices')
      .select(`*, posted_by_user:users!notices_posted_by_fkey(id, name, email, role, department, profile_pic_url)`, { count: 'exact' });

    if (category && category !== 'All') query = query.eq('category', category);
    if (search && (search as string).trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    query = query
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: notices, error, count } = await query;

    if (error) { sendResponse(res, 500, false, 'Failed to retrieve notices.'); return; }

    const total = count || 0;
    sendResponse(res, 200, true, 'Notices retrieved.', { notices: (notices || []).map(mapNotice) }, {
      total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

export const getNoticeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: n, error } = await supabase
      .from('notices')
      .select(`*, posted_by_user:users!notices_posted_by_fkey(id, name, email, role, department, profile_pic_url)`)
      .eq('id', req.params.id)
      .single();

    if (error || !n) { sendResponse(res, 404, false, 'Notice not found.'); return; }

    sendResponse(res, 200, true, 'Notice retrieved.', { notice: mapNotice(n) });
  } catch (error) { next(error); }
};

export const createNotice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendResponse(res, 401, false, 'Authentication required.'); return; }
    if (req.user.role !== 'Faculty' && req.user.role !== 'Admin') {
      sendResponse(res, 403, false, 'Only faculty and admins can post notices.'); return;
    }

    const { title, content, category, target_audience, pinned, attachment_url, expires_at } = req.body;

    if (!title || !content || !category) {
      sendResponse(res, 400, false, 'Title, content, and category are required.'); return;
    }

    const { data: n, error } = await supabase
      .from('notices')
      .insert({
        title: title.trim(),
        content,
        category,
        posted_by: req.user.id,
        target_audience: Array.isArray(target_audience) ? target_audience : ['All'],
        pinned: Boolean(pinned),
        attachment_url: attachment_url || '',
        expires_at: expires_at || null,
      })
      .select(`*, posted_by_user:users!notices_posted_by_fkey(id, name, email, role, department, profile_pic_url)`)
      .single();

    if (error) { sendResponse(res, 500, false, 'Failed to create notice.'); return; }

    sendResponse(res, 201, true, 'Notice published.', { notice: mapNotice(n) });
  } catch (error) { next(error); }
};

export const togglePinNotice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: n } = await supabase.from('notices').select('id, pinned').eq('id', req.params.id).single();
    if (!n) { sendResponse(res, 404, false, 'Notice not found.'); return; }

    const { data: updated, error } = await supabase
      .from('notices').update({ pinned: !n.pinned }).eq('id', req.params.id).select('pinned').single();

    if (error) { sendResponse(res, 500, false, 'Failed to update pin.'); return; }

    sendResponse(res, 200, true, updated.pinned ? 'Notice pinned.' : 'Notice unpinned.', { pinned: updated.pinned });
  } catch (error) { next(error); }
};

export const deleteNotice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = await supabase.from('notices').delete().eq('id', req.params.id);
    if (error) { sendResponse(res, 500, false, 'Failed to delete notice.'); return; }
    sendResponse(res, 200, true, 'Notice deleted.');
  } catch (error) { next(error); }
};
