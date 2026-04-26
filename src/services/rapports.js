// ═══════════════════════════════════════
// rapports.js
// ═══════════════════════════════════════

export async function soumettreRapport(projectId, form, userId) {
  const { data, error } = await supabase
    .from('rapports')
    .insert({ project_id: projectId, written_by: userId, travaux: form.travaux, problemes: form.problemes || null, materiel: form.materiel || null, remarques: form.remarques || null, reported_at: new Date().toISOString() })
    .select().single();
  if (error) throw error;
  return data;
}