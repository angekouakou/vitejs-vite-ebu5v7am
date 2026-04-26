// ═══════════════════════════════════════
// equipements.js
// ═══════════════════════════════════════

export function mapEquipement(e) {
  return {
    ...e,
    nom: e.name,
    categorie: e.equipment_categories?.name || '',
    marque: e.brand,
    modele: e.model,
    quantiteTotal: e.quantity_total,
    quantiteDisponible: e.quantity_available,
    etat: e.condition,
    valeur: e.unit_value,
  };
}

export async function createEquipement(form) {
  const { data, error } = await supabase
    .from('equipments')
    .insert({ company_id: COMPANY_ID, reference: form.reference || null, name: form.nom, brand: form.marque || null, model: form.modele || null, quantity_total: parseInt(form.quantiteTotal) || 1, quantity_available: parseInt(form.quantiteTotal) || 1, condition: 'good', unit_value: parseInt(form.valeur) || 0, notes: form.notes || null })
    .select('*, equipment_categories(name, icon)').single();
  if (error) throw error;
  return mapEquipement(data);
}

export async function attribuerEquipement(form, userId) {
  const eq = { id: form.equipementId, quantiteDisponible: form.quantiteDispo };
  if (eq.quantiteDisponible < parseInt(form.quantite)) throw new Error('Stock insuffisant');

  const { data, error } = await supabase
    .from('equipment_assignments')
    .insert({ equipment_id: form.equipementId, project_id: form.chantierId || null, assigned_to: form.technicienId, quantity: parseInt(form.quantite), assigned_at: new Date().toISOString().split('T')[0], expected_return_at: form.dateRetourPrevue || null, condition_out: 'good', assigned_by: userId })
    .select().single();
  if (error) throw error;
  return data;
}

export async function restituerEquipement(assignmentId, userId) {
  const { data: attr, error: attrErr } = await supabase.from('equipment_assignments').select('*').eq('id', assignmentId).single();
  if (attrErr) throw attrErr;

  await supabase.from('equipment_returns').insert({ assignment_id: assignmentId, returned_at: new Date().toISOString().split('T')[0], condition_in: 'good', received_by: userId });

  // Le trigger SQL remet le stock automatiquement
  return attr;
}

export async function deleteEquipement(id) {
  const { error } = await supabase.from('equipments').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}