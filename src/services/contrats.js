import { supabase } from '../supabase';
// ═══════════════════════════════════════
// contrats.js
// ═══════════════════════════════════════
const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export async function genRefContrat() {
  const year = new Date().getFullYear();
  const { count } = await supabase.from('contracts').select('*', { count: 'exact', head: true }).like('reference', `CTR-${year}-%`);
  return `CTR-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
}

export function mapContrat(c) {
  return {
    ...c,
    numero: c.reference,
    clientNom: c.clients?.name || '',
    objet: c.subject,
    valeur: c.value_amount,
    statut: { active: 'Actif', expired: 'Expiré', terminated: 'Résilié', draft: 'Brouillon' }[c.status] || c.status,
    dateDebut: c.start_date,
    dateFin: c.end_date,
    renouvellement: c.renewal === 'auto' ? 'Automatique' : 'Manuel',
    periodicite: c.periodicity,
  };
}

export async function createContrat(form, userId) {
  const reference = await genRefContrat();
  const { data, error } = await supabase
    .from('contracts')
    .insert({ company_id: COMPANY_ID, client_id: form.clientId, reference, type: form.type, subject: form.objet, value_amount: parseInt(form.valeur) || 0, status: 'active', start_date: form.dateDebut || null, end_date: form.dateFin || null, renewal: form.renouvellement === 'Automatique' ? 'auto' : 'manual', periodicity: form.periodicite || null, notes: form.notes || null, created_by: userId })
    .select('*, clients(name)').single();
  if (error) throw error;
  return mapContrat(data);
}

export async function deleteContrat(id) {
  const { error } = await supabase.from('contracts').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}