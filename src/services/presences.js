import { supabase } from '../supabase';
// ═══════════════════════════════════════
// presences.js
// ═══════════════════════════════════════

export async function pointerArrivee(userId, projectId, lat = null, lng = null) {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase.from('presences').select('id').eq('user_id', userId).eq('project_id', projectId).eq('work_date', today).single();
  if (existing) throw new Error('Déjà pointé ce jour sur ce chantier');

  const { data, error } = await supabase
    .from('presences')
    .insert({ user_id: userId, project_id: projectId, work_date: today, arrived_at: new Date().toISOString(), latitude_in: lat, longitude_in: lng })
    .select().single();
  if (error) throw error;
  return data;
}

export async function pointerDepart(presenceId, lat = null, lng = null) {
  const { data: existing } = await supabase.from('presences').select('departed_at').eq('id', presenceId).single();
  if (existing?.departed_at) throw new Error('Départ déjà enregistré');

  const { data, error } = await supabase
    .from('presences')
    .update({ departed_at: new Date().toISOString(), latitude_out: lat, longitude_out: lng })
    .eq('id', presenceId).select().single();
  if (error) throw error;
  return data;
}