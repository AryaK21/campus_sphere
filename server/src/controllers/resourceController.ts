import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      department,
      semester,
      subjectId,
      resourceType,
      search,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('resources')
      .select(`
        *,
        subject:subjects(id, title, code, semester, department),
        uploader:users!resources_uploaded_by_fkey(id, name, email, role, department, profile_pic_url)
      `, { count: 'exact' });

    if (department && department !== 'All') query = query.eq('department', department);
    if (semester && semester !== 'All') query = query.eq('semester', Number(semester));
    if (subjectId && subjectId !== 'All') query = query.eq('subject_id', subjectId);
    if (resourceType && resourceType !== 'All') query = query.eq('resource_type', resourceType);
    if (search && (search as string).trim() !== '') {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    if (sortBy === 'popular') query = query.order('download_count', { ascending: false });
    else if (sortBy === 'rating') query = query.order('average_rating', { ascending: false });
    else if (sortBy === 'oldest') query = query.order('created_at', { ascending: true });
    else query = query.order('created_at', { ascending: false });

    query = query.range(offset, offset + limitNum - 1);

    const { data: resources, error, count } = await query;

    if (error) {
      console.error('Resources fetch error:', error);
      sendResponse(res, 500, false, 'Failed to retrieve resources.');
      return;
    }

    // Map to match frontend interface
    const mapped = (resources || []).map(r => ({
      _id: r.id,
      title: r.title,
      description: r.description,
      subjectId: r.subject ? { _id: r.subject.id, ...r.subject } : null,
      semester: r.semester,
      department: r.department,
      uploadedBy: r.uploader ? { _id: r.uploader.id, ...r.uploader } : null,
      resourceType: r.resource_type,
      fileUrl: r.file_url,
      fileType: r.file_type,
      downloadCount: r.download_count,
      ratings: r.ratings || [],
      averageRating: r.average_rating,
      createdAt: r.created_at,
    }));

    const total = count || 0;
    sendResponse(res, 200, true, 'Resources retrieved.', { resources: mapped }, {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getResourceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: r, error } = await supabase
      .from('resources')
      .select(`
        *,
        subject:subjects(id, title, code, semester, department, syllabus),
        uploader:users!resources_uploaded_by_fkey(id, name, email, role, department, profile_pic_url, bio)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !r) {
      sendResponse(res, 404, false, 'Resource not found.');
      return;
    }

    const resource = {
      _id: r.id,
      title: r.title,
      description: r.description,
      subjectId: r.subject ? { _id: r.subject.id, ...r.subject } : null,
      semester: r.semester,
      department: r.department,
      uploadedBy: r.uploader ? { _id: r.uploader.id, ...r.uploader } : null,
      resourceType: r.resource_type,
      fileUrl: r.file_url,
      fileType: r.file_type,
      downloadCount: r.download_count,
      ratings: r.ratings || [],
      averageRating: r.average_rating,
      createdAt: r.created_at,
    };

    sendResponse(res, 200, true, 'Resource retrieved.', { resource });
  } catch (error) {
    next(error);
  }
};

export const uploadResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, 'Authentication required.');
      return;
    }

    const { title, description, subject_id, semester, department, resource_type, file_url, file_type } = req.body;

    if (!title || !subject_id || !semester || !department || !resource_type || !file_url) {
      sendResponse(res, 400, false, 'Missing required fields.');
      return;
    }

    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        title: title.trim(),
        description: description || '',
        subject_id,
        semester: Number(semester),
        department,
        uploaded_by: req.user.id,
        resource_type,
        file_url,
        file_type: file_type || 'pdf',
        download_count: 0,
        ratings: [],
        average_rating: 0,
      })
      .select(`
        *,
        subject:subjects(id, title, code),
        uploader:users!resources_uploaded_by_fkey(id, name, email, role)
      `)
      .single();

    if (error) {
      console.error('Resource upload error:', error);
      sendResponse(res, 500, false, 'Failed to upload resource.');
      return;
    }

    const mapped = {
      _id: resource.id,
      title: resource.title,
      description: resource.description,
      subjectId: resource.subject ? { _id: resource.subject.id, ...resource.subject } : null,
      semester: resource.semester,
      department: resource.department,
      uploadedBy: resource.uploader ? { _id: resource.uploader.id, ...resource.uploader } : null,
      resourceType: resource.resource_type,
      fileUrl: resource.file_url,
      fileType: resource.file_type,
      downloadCount: resource.download_count,
      ratings: resource.ratings || [],
      averageRating: resource.average_rating,
      createdAt: resource.created_at,
    };

    sendResponse(res, 201, true, 'Resource uploaded successfully.', { resource: mapped });
  } catch (error) {
    next(error);
  }
};

export const rateResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, 'Authentication required.');
      return;
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      sendResponse(res, 400, false, 'Rating must be between 1 and 5.');
      return;
    }

    const { data: existing, error: fetchError } = await supabase
      .from('resources')
      .select('id, ratings, average_rating')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) {
      sendResponse(res, 404, false, 'Resource not found.');
      return;
    }

    const ratings: any[] = existing.ratings || [];
    const existingIdx = ratings.findIndex(r => r.userId === req.user!.id);

    const newRating = {
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString(),
    };

    if (existingIdx > -1) {
      ratings[existingIdx] = newRating;
    } else {
      ratings.push(newRating);
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Number((sum / ratings.length).toFixed(1));

    const { data: updated, error: updateError } = await supabase
      .from('resources')
      .update({ ratings, average_rating: averageRating })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      sendResponse(res, 500, false, 'Failed to save rating.');
      return;
    }

    sendResponse(res, 200, true, 'Rating recorded.', {
      resource: { ...updated, _id: updated.id },
      averageRating,
    });
  } catch (error) {
    next(error);
  }
};

export const recordDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: resource, error: fetchError } = await supabase
      .from('resources')
      .select('id, download_count')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !resource) {
      sendResponse(res, 404, false, 'Resource not found.');
      return;
    }

    const { data: updated, error } = await supabase
      .from('resources')
      .update({ download_count: (resource.download_count || 0) + 1 })
      .eq('id', req.params.id)
      .select('download_count')
      .single();

    if (error) {
      sendResponse(res, 500, false, 'Failed to record download.');
      return;
    }

    sendResponse(res, 200, true, 'Download recorded.', { downloadCount: updated.download_count });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, 'Authentication required.');
      return;
    }

    const { data: resource, error: fetchError } = await supabase
      .from('resources')
      .select('id, uploaded_by')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !resource) {
      sendResponse(res, 404, false, 'Resource not found.');
      return;
    }

    const isOwner = resource.uploaded_by === req.user.id;
    const isStaffOrAdmin = req.user.role === 'Admin' || req.user.role === 'Faculty';

    if (!isOwner && !isStaffOrAdmin) {
      sendResponse(res, 403, false, 'You do not have permission to delete this resource.');
      return;
    }

    const { error } = await supabase.from('resources').delete().eq('id', req.params.id);

    if (error) {
      sendResponse(res, 500, false, 'Failed to delete resource.');
      return;
    }

    sendResponse(res, 200, true, 'Resource deleted.');
  } catch (error) {
    next(error);
  }
};
