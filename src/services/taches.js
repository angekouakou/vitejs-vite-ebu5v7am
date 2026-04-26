// ═══════════════════════════════════════
// taches.js
// ═══════════════════════════════════════
import { supabase } from '../supabase';

export async function createTache(projectId, label) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ project_id: projectId, label, is_done: false })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, label: data.label, done: data.is_done };
}

export async function toggleTache(taskId, isDone, userId) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ is_done: isDone, done_at: isDone ? new Date().toISOString() : null, done_by: isDone ? userId : null, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select('*, projects(chef_id, name)')
    .single();
  if (error) throw error;

  if (isDone && data.projects?.chef_id) {
    await supabase.from('notifications').insert({
      user_id: data.projects.chef_id,
      type: 'tache_cochee',
      title: 'Tâche complétée',
      body: `"${data.label}" sur ${data.projects.name}`,
      entity_type: 'tasks',
      entity_id: taskId,
    });
  }
  return data;
}

export async function deleteTache(taskId) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}