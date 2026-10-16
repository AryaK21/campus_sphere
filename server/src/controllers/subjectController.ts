import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth';

const mapSubject = (s: any) => ({
  _id: s.id,
  title: s.title,
  code: s.code,
  department: s.department,
  semester: s.semester,
  syllabus: s.syllabus,
  facultyAssigned: s.faculty_assigned || [],
  createdAt: s.created_at,
});

export const getSubjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, semester, search } = req.query;

    let query = supabase.from('subjects').select('*');

    if (department) query = query.eq('department', department);
    if (semester) query = query.eq('semester', Number(semester));
    if (search) query = query.or(`title.ilike.%${search}%,code.ilike.%${search}%`);

    query = query.order('semester', { ascending: true }).order('code', { ascending: true });

    const { data: subjects, error } = await query;
    if (error) { sendResponse(res, 500, false, 'Failed to retrieve subjects.'); return; }

    sendResponse(res, 200, true, 'Subjects retrieved.', { subjects: (subjects || []).map(mapSubject) });
  } catch (error) { next(error); }
};

export const getSubjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: s, error } = await supabase.from('subjects').select('*').eq('id', req.params.id).single();
    if (error || !s) { sendResponse(res, 404, false, 'Subject not found.'); return; }
    sendResponse(res, 200, true, 'Subject retrieved.', { subject: mapSubject(s) });
  } catch (error) { next(error); }
};

export const createSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, code, department, semester, syllabus } = req.body;
    if (!title || !code || !department || !semester) {
      sendResponse(res, 400, false, 'Title, code, department, and semester are required.'); return;
    }

    const { data: existing } = await supabase.from('subjects').select('id').eq('code', code).single();
    if (existing) { sendResponse(res, 400, false, `Subject code ${code} already exists.`); return; }

    const { data: s, error } = await supabase
      .from('subjects')
      .insert({ title: title.trim(), code: code.trim().toUpperCase(), department, semester: Number(semester), syllabus: syllabus || '' })
      .select().single();

    if (error) { sendResponse(res, 500, false, 'Failed to create subject.'); return; }
    sendResponse(res, 201, true, 'Subject created.', { subject: mapSubject(s) });
  } catch (error) { next(error); }
};

export const updateSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: s, error } = await supabase.from('subjects').update(req.body).eq('id', req.params.id).select().single();
    if (error || !s) { sendResponse(res, 404, false, 'Subject not found.'); return; }
    sendResponse(res, 200, true, 'Subject updated.', { subject: mapSubject(s) });
  } catch (error) { next(error); }
};

export const deleteSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = await supabase.from('subjects').delete().eq('id', req.params.id);
    if (error) { sendResponse(res, 500, false, 'Failed to delete subject.'); return; }
    sendResponse(res, 200, true, 'Subject deleted.');
  } catch (error) { next(error); }
};
