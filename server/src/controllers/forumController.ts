import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth';

const mapPost = (p: any) => ({
  _id: p.id,
  title: p.title,
  body: p.body,
  author: p.author ? { _id: p.author.id, ...p.author } : null,
  category: p.category,
  tags: p.tags || [],
  upvotes: p.upvotes || [],
  bestAnswerId: p.best_answer_id,
  status: p.status,
  commentsCount: p.comments_count,
  viewsCount: p.views_count,
  createdAt: p.created_at,
});

const mapComment = (c: any) => ({
  _id: c.id,
  postId: c.post_id,
  author: c.author ? { _id: c.author.id, ...c.author } : null,
  content: c.content,
  parentCommentId: c.parent_comment_id,
  upvotes: c.upvotes || [],
  isBestAnswer: c.is_best_answer,
  createdAt: c.created_at,
});

export const getForumPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, tag, search, status, sortBy = 'recent', page = 1, limit = 10 } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('forum_posts')
      .select(`*, author:users!forum_posts_author_id_fkey(id, name, email, role, department, profile_pic_url)`, { count: 'exact' });

    if (category && category !== 'All') query = query.eq('category', category);
    if (status && status !== 'All') query = query.eq('status', status);
    if (search && (search as string).trim()) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
    }
    if (sortBy === 'unanswered') query = query.eq('comments_count', 0);

    if (sortBy === 'top') query = query.order('views_count', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    query = query.range(offset, offset + limitNum - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      sendResponse(res, 500, false, 'Failed to retrieve posts.');
      return;
    }

    const total = count || 0;
    sendResponse(res, 200, true, 'Forum posts retrieved.', { posts: (posts || []).map(mapPost) }, {
      total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getForumPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: p, error } = await supabase
      .from('forum_posts')
      .select(`*, author:users!forum_posts_author_id_fkey(id, name, email, role, department, semester, profile_pic_url, bio, social_links)`)
      .eq('id', req.params.id)
      .single();

    if (error || !p) {
      sendResponse(res, 404, false, 'Post not found.');
      return;
    }

    // Increment views
    await supabase.from('forum_posts').update({ views_count: (p.views_count || 0) + 1 }).eq('id', req.params.id);

    const { data: comments } = await supabase
      .from('forum_comments')
      .select(`*, author:users!forum_comments_author_id_fkey(id, name, email, role, department, semester, profile_pic_url)`)
      .eq('post_id', req.params.id)
      .order('is_best_answer', { ascending: false })
      .order('created_at', { ascending: true });

    sendResponse(res, 200, true, 'Post retrieved.', {
      post: mapPost(p),
      comments: (comments || []).map(mapComment),
    });
  } catch (error) {
    next(error);
  }
};

export const createForumPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendResponse(res, 401, false, 'Authentication required.'); return; }

    const { title, body, category, tags } = req.body;
    if (!title || !body || !category) {
      sendResponse(res, 400, false, 'Title, body, and category are required.');
      return;
    }

    const { data: p, error } = await supabase
      .from('forum_posts')
      .insert({
        title: title.trim(),
        body,
        author_id: req.user.id,
        category,
        tags: tags || [],
        upvotes: [req.user.id],
        status: 'Open',
        comments_count: 0,
        views_count: 0,
      })
      .select(`*, author:users!forum_posts_author_id_fkey(id, name, email, role, department, profile_pic_url)`)
      .single();

    if (error) { sendResponse(res, 500, false, 'Failed to create post.'); return; }

    sendResponse(res, 201, true, 'Post created.', { post: mapPost(p) });
  } catch (error) {
    next(error);
  }
};

export const toggleUpvotePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendResponse(res, 401, false, 'Authentication required.'); return; }

    const { data: post } = await supabase.from('forum_posts').select('id, upvotes').eq('id', req.params.id).single();
    if (!post) { sendResponse(res, 404, false, 'Post not found.'); return; }

    const upvotes: string[] = post.upvotes || [];
    const idx = upvotes.indexOf(req.user.id);
    let hasUpvoted = false;

    if (idx > -1) { upvotes.splice(idx, 1); } else { upvotes.push(req.user.id); hasUpvoted = true; }

    await supabase.from('forum_posts').update({ upvotes }).eq('id', req.params.id);
    sendResponse(res, 200, true, hasUpvoted ? 'Upvoted.' : 'Upvote removed.', { upvotesCount: upvotes.length, hasUpvoted });
  } catch (error) { next(error); }
};

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendResponse(res, 401, false, 'Authentication required.'); return; }

    const { content, parentCommentId } = req.body;
    if (!content) { sendResponse(res, 400, false, 'Content is required.'); return; }

    const { data: post } = await supabase.from('forum_posts').select('id, comments_count').eq('id', req.params.id).single();
    if (!post) { sendResponse(res, 404, false, 'Post not found.'); return; }

    const { data: comment, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: req.params.id,
        author_id: req.user.id,
        content,
        parent_comment_id: parentCommentId || null,
        upvotes: [],
        is_best_answer: false,
      })
      .select(`*, author:users!forum_comments_author_id_fkey(id, name, email, role, department, semester, profile_pic_url)`)
      .single();

    if (error) { sendResponse(res, 500, false, 'Failed to add comment.'); return; }

    await supabase.from('forum_posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', req.params.id);

    sendResponse(res, 201, true, 'Comment added.', { comment: mapComment(comment) });
  } catch (error) { next(error); }
};

export const toggleUpvoteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendResponse(res, 401, false, 'Authentication required.'); return; }

    const { data: comment } = await supabase.from('forum_comments').select('id, upvotes').eq('id', req.params.commentId).single();
    if (!comment) { sendResponse(res, 404, false, 'Comment not found.'); return; }

    const upvotes: string[] = comment.upvotes || [];
    const idx = upvotes.indexOf(req.user.id);
    let hasUpvoted = false;

    if (idx > -1) { upvotes.splice(idx, 1); } else { upvotes.push(req.user.id); hasUpvoted = true; }

    await supabase.from('forum_comments').update({ upvotes }).eq('id', req.params.commentId);
    sendResponse(res, 200, true, hasUpvoted ? 'Upvoted.' : 'Upvote removed.', { upvotesCount: upvotes.length, hasUpvoted });
  } catch (error) { next(error); }
};

export const markBestAnswer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendResponse(res, 401, false, 'Authentication required.'); return; }

    const { postId, commentId } = req.params;
    const { data: post } = await supabase.from('forum_posts').select('id, author_id').eq('id', postId).single();
    if (!post) { sendResponse(res, 404, false, 'Post not found.'); return; }

    const isAuthor = post.author_id === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Faculty';

    if (!isAuthor && !isPrivileged) {
      sendResponse(res, 403, false, 'Only the post author or faculty can mark the best answer.');
      return;
    }

    await supabase.from('forum_comments').update({ is_best_answer: false }).eq('post_id', postId);
    await supabase.from('forum_comments').update({ is_best_answer: true }).eq('id', commentId);
    await supabase.from('forum_posts').update({ best_answer_id: commentId, status: 'Resolved' }).eq('id', postId);

    sendResponse(res, 200, true, 'Best answer marked. Post marked as resolved.');
  } catch (error) { next(error); }
};

export const deleteForumPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendResponse(res, 401, false, 'Authentication required.'); return; }

    const { data: post } = await supabase.from('forum_posts').select('id, author_id').eq('id', req.params.id).single();
    if (!post) { sendResponse(res, 404, false, 'Post not found.'); return; }

    const isOwner = post.author_id === req.user.id;
    const isModerator = req.user.role === 'Admin' || req.user.role === 'Faculty';

    if (!isOwner && !isModerator) {
      sendResponse(res, 403, false, 'You do not have permission to delete this post.');
      return;
    }

    await supabase.from('forum_comments').delete().eq('post_id', req.params.id);
    await supabase.from('forum_posts').delete().eq('id', req.params.id);

    sendResponse(res, 200, true, 'Post deleted.');
  } catch (error) { next(error); }
};
