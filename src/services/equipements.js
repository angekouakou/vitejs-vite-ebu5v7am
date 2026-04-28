import { supabase } from '../supabase';

const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

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
    .insert({
      company_id: COMPANY_ID,
      reference: form.reference || null,
      name: form.nom,
      brand: form.marque || null,
      model: form.modele || null,
      quantity_total: parseInt(form.quantiteTotal) || 1,
      quantity_available: parseInt(form.quantiteTotal) || 1,
      condition: 'good',
      unit_value: parseInt(form.valeur) || 0,
      notes: form.notes || null,
    })
    .select('*, equipment_categories(name, icon)')
    .single();
  if (error) throw error;
  return mapEquipement(data);
}

export async function attribuerEquipement(form, userId) {
  const qte = parseInt(form.quantite) || 1;

  // Vérifier le stock en temps réel depuis Supabase
  const { data: eq, error: eqErr } = await supabase
    .from('equipments')
    .select('quantity_available')
    .eq('id', form.equipementId)
    .single();
  if (eqErr) throw eqErr;
  if (eq.quantity_available < qte) throw new Error('Stock insuffisant');

  const { data, error } = await supabase
    .from('equipment_assignments')
    .insert({
      equipment_id: form.equipementId,
      project_id: null,
      assigned_to: form.technicienId,
      quantity: qte,
      assigned_at: new Date().toISOString().split('T')[0],
      expected_return_at: form.dateRetourPrevue || null,
      condition_out: 'good',
      assigned_by: userId,
    })
    .select()
    .single();
  if (error) throw error;

  // Recharger le stock réel depuis Supabase (mis à jour par le trigger)
  const { data: eqUpdated } = await supabase
    .from('equipments')
    .select('quantity_available')
    .eq('id', form.equipementId)
    .single();

  return { assignment: data, quantiteDisponible: eqUpdated?.quantity_available };
}

export async function restituerEquipement(assignmentId, userId, quantiteRestituee) {
  const { data: attr, error: attrErr } = await supabase
    .from('equipment_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();
  if (attrErr) throw attrErr;

  const qteRestituee = parseInt(quantiteRestituee) || attr.quantity;
  const qteRestante = attr.quantity - qteRestituee;

  const payload = {
    assignment_id: assignmentId,
    returned_at: new Date().toISOString().split('T')[0],
    condition_in: 'good',
    received_by: userId,
    quantity_returned: qteRestituee,
  };

  const { error: retErr } = await supabase
    .from('equipment_returns')
    .insert(payload);
  if (retErr) throw retErr;

  if (qteRestante > 0) {
    // Restitution partielle — mettre à jour la quantité restante sur l'attribution
    await supabase
      .from('equipment_assignments')
      .update({ quantity: qteRestante })
      .eq('id', assignmentId);
  } else {
    // Restitution totale — marquer comme restitué
    await supabase
      .from('equipment_assignments')
      .update({ returned_at: new Date().toISOString() })
      .eq('id', assignmentId);
  }

  const { data: eqUpdated } = await supabase
    .from('equipments')
    .select('quantity_available')
    .eq('id', attr.equipment_id)
    .single();

  return { 
    attr, 
    quantiteDisponible: eqUpdated?.quantity_available,
    qteRestante,
    qteRestituee,
  };
}

export async function deleteEquipement(id) {
  const { error } = await supabase
    .from('equipments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}