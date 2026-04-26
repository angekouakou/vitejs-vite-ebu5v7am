import { supabase } from '../supabase';
// ═══════════════════════════════════════
// clients.js
// ═══════════════════════════════════════

export function mapClient(c) {
  return {
    ...c,
    nom: c.name,
    contact: c.contact_name,
    email: c.contact_email,
    tel: c.contact_phone,
    ville: c.city,
    statut: { active: 'Actif', inactive: 'Inactif', prospect: 'Prospect' }[c.status] || c.status,
  };
}

export async function createClient(form, userId) {
  const { data, error } = await supabase
    .from('clients')
    .insert({ company_id: COMPANY_ID, name: form.nom, status: 'active', contact_name: form.contact || null, contact_email: form.email || null, contact_phone: form.tel || null, address: form.adresse || null, city: form.ville || null, notes: form.notes || null })
    .select().single();
  if (error) throw error;
  return mapClient(data);
}

export async function updateClient(id, form) {
  const { data, error } = await supabase
    .from('clients')
    .update({ name: form.nom, status: { Actif: 'active', Inactif: 'inactive', Prospect: 'prospect' }[form.statut] || 'active', contact_name: form.contact, contact_email: form.email, contact_phone: form.tel, address: form.adresse, city: form.ville, notes: form.notes, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return mapClient(data);
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
