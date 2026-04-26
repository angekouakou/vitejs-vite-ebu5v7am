// ═══════════════════════════════════════
// blocages.js
// ═══════════════════════════════════════

export async function signalerBlocage(projectId, form, userId) {
  const { data, error } = await supabase
    .from('blocages')
    .insert({ project_id: projectId, reported_by: userId, type: form.type, description: form.description, is_resolved: false })
    .select('*, projects(chef_id, name)').single();
  if (error) throw error;

  if (data.projects?.chef_id) {
    await supabase.from('notifications').insert({
      user_id: data.projects.chef_id,
      type: 'blocage',
      title: `⚠️ Blocage: ${form.type}`,
      body: form.description,
      entity_type: 'blocages',
      entity_id: data.id,
    });
  }
  return data;
}

export async function resoudreBlocage(blocageId, note, userId) {
  const { data, error } = await supabase
    .from('blocages')
    .update({ is_resolved: true, resolved_at: new Date().toISOString(), resolved_by: userId, resolution_note: note || null })
    .eq('id', blocageId).select().single();
  if (error) throw error;
  return data;
}
