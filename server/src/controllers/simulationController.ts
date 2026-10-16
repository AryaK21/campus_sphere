import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendResponse } from '../utils/apiResponse';

const mapSimulation = (s: any) => ({
  _id: s.id,
  title: s.title,
  module: s.module,
  slug: s.slug,
  description: s.description,
  metadata: s.metadata || {},
  usageStats: { views: s.views || 0, runs: s.runs || 0 },
});

export const getSimulations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module } = req.query;
    let query = supabase.from('simulations').select('*');
    if (module && module !== 'All') query = query.eq('module', module);
    query = query.order('runs', { ascending: false });

    const { data: simulations, error } = await query;
    if (error) { sendResponse(res, 500, false, 'Failed to retrieve simulations.'); return; }

    sendResponse(res, 200, true, 'Simulations retrieved.', { simulations: (simulations || []).map(mapSimulation) });
  } catch (error) { next(error); }
};

export const getSimulationBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: s, error } = await supabase.from('simulations').select('*').eq('slug', req.params.slug).single();
    if (error || !s) { sendResponse(res, 404, false, 'Simulation not found.'); return; }

    // Increment views
    await supabase.from('simulations').update({ views: (s.views || 0) + 1 }).eq('slug', req.params.slug);

    sendResponse(res, 200, true, 'Simulation retrieved.', { simulation: mapSimulation(s) });
  } catch (error) { next(error); }
};

export const recordSimulationRun = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: s } = await supabase.from('simulations').select('id, runs').eq('slug', req.params.slug).single();
    if (!s) { sendResponse(res, 404, false, 'Simulation not found.'); return; }

    const { data: updated, error } = await supabase
      .from('simulations').update({ runs: (s.runs || 0) + 1 }).eq('slug', req.params.slug).select('runs').single();

    if (error) { sendResponse(res, 500, false, 'Failed to record run.'); return; }
    sendResponse(res, 200, true, 'Run recorded.', { runs: updated.runs });
  } catch (error) { next(error); }
};
