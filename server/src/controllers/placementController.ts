import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth';

const mapPlacement = (p: any) => ({
  _id: p.id,
  companyName: p.company_name,
  role: p.role,
  package: p.package,
  location: p.location,
  eligibility: p.eligibility || { minCgpa: 0, allowedDepartments: [], allowedBatches: [], backlogsAllowed: false },
  jobDescription: p.job_description,
  deadline: p.deadline,
  applyUrl: p.apply_url,
  status: p.status,
  interviewExperiences: (p.interview_experiences || []).map((e: any) => ({
    _id: e.id,
    author: e.author_name ? { name: e.author_name, profile_pic_url: e.author_pic } : null,
    roundDetails: e.round_details,
    tips: e.tips,
    outcome: e.outcome,
    createdAt: e.created_at,
  })),
  attachments: p.attachments || [],
  createdAt: p.created_at,
});

export const getPlacements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, department, search, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from('placements').select('*', { count: 'exact' });

    if (status && status !== 'All') query = query.eq('status', status);
    if (search && (search as string).trim()) {
      query = query.or(`company_name.ilike.%${search}%,role.ilike.%${search}%,job_description.ilike.%${search}%`);
    }

    query = query.order('deadline', { ascending: true }).range(offset, offset + limitNum - 1);

    const { data: placements, error, count } = await query;

    if (error) { sendResponse(res, 500, false, 'Failed to retrieve placements.'); return; }

    const total = count || 0;
    sendResponse(res, 200, true, 'Placements retrieved.', { placements: (placements || []).map(mapPlacement) }, {
      total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

export const getPlacementById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: p, error } = await supabase.from('placements').select('*').eq('id', req.params.id).single();
    if (error || !p) { sendResponse(res, 404, false, 'Placement not found.'); return; }
    sendResponse(res, 200, true, 'Placement retrieved.', { placement: mapPlacement(p) });
  } catch (error) { next(error); }
};

export const createPlacement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'Faculty')) {
      sendResponse(res, 403, false, 'Only admins and faculty can create placements.'); return;
    }

    const { company_name, role, package: pkg, location, eligibility, job_description, deadline, apply_url, status } = req.body;

    const { data: p, error } = await supabase
      .from('placements')
      .insert({
        company_name, role, package: pkg, location,
        eligibility: eligibility || { minCgpa: 0, allowedDepartments: [], allowedBatches: [], backlogsAllowed: false },
        job_description, deadline, apply_url: apply_url || '',
        status: status || 'Active',
        interview_experiences: [],
        attachments: [],
      })
      .select().single();

    if (error) { sendResponse(res, 500, false, 'Failed to create placement.'); return; }
    sendResponse(res, 201, true, 'Placement created.', { placement: mapPlacement(p) });
  } catch (error) { next(error); }
};

export const updatePlacement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: p, error } = await supabase.from('placements').update(req.body).eq('id', req.params.id).select().single();
    if (error || !p) { sendResponse(res, 404, false, 'Placement not found.'); return; }
    sendResponse(res, 200, true, 'Placement updated.', { placement: mapPlacement(p) });
  } catch (error) { next(error); }
};

export const deletePlacement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = await supabase.from('placements').delete().eq('id', req.params.id);
    if (error) { sendResponse(res, 500, false, 'Failed to delete placement.'); return; }
    sendResponse(res, 200, true, 'Placement deleted.');
  } catch (error) { next(error); }
};

export const addInterviewExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendResponse(res, 401, false, 'Authentication required.'); return; }

    const { roundDetails, tips, outcome } = req.body;
    if (!roundDetails) { sendResponse(res, 400, false, 'Round details are required.'); return; }

    const { data: p } = await supabase.from('placements').select('id, interview_experiences').eq('id', req.params.id).single();
    if (!p) { sendResponse(res, 404, false, 'Placement not found.'); return; }

    const experiences = p.interview_experiences || [];
    experiences.unshift({
      id: crypto.randomUUID(),
      author_id: req.user.id,
      author_name: req.user.name,
      round_details: roundDetails,
      tips: tips || '',
      outcome: outcome || 'In-Progress',
      created_at: new Date().toISOString(),
    });

    const { data: updated, error } = await supabase
      .from('placements').update({ interview_experiences: experiences }).eq('id', req.params.id).select().single();

    if (error) { sendResponse(res, 500, false, 'Failed to add experience.'); return; }
    sendResponse(res, 201, true, 'Experience added.', { placement: mapPlacement(updated) });
  } catch (error) { next(error); }
};
