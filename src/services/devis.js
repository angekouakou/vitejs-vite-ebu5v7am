import { supabase } from '../supabase';
// ═══════════════════════════════════════
// devis.js
// ═══════════════════════════════════════

const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export async function genRefDevis() {
  const year = new Date().getFullYear();
  const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true }).like('reference', `DEV-${year}-%`);
  return `DEV-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
}

export function mapDevis(d) {
  return {
    ...d,
    numero: d.reference,
    clientNom: d.clients?.name || d.clientNom || '',
    objet: d.subject,
    montantHT: d.amount_ht,
    montantTTC: d.amount_ttc,
    tva: d.tax_rate,
    statut: { draft: 'Brouillon', sent: 'Envoyé', accepted: 'Accepté', refused: 'Refusé', expired: 'Expiré', invoiced: 'Facturé' }[d.status] || d.status,
    dateCreation: d.created_at ? new Date(d.created_at).toLocaleDateString('fr-CI') : '',
    dateExpiration: d.validity_date ? new Date(d.validity_date).toLocaleDateString('fr-CI') : '',
    lignes: (d.quote_lines || []).map(l => ({
      ...l,
      description: l.description,
      quantite: l.quantity,
      prixUnit: l.unit_price,
      total: l.total_ht,
    })),
  };
}

export async function createDevis(form, userId) {
  const reference = await genRefDevis();
  const ht = (form.lignes || []).reduce((s, l) => s + (l.total || 0), 0);
  const apresRemise = Math.round(ht * (1 - (form.remise || 0) / 100));
  const ttc = Math.round(apresRemise * (1 + (form.tva || 18) / 100));

  const { data, error } = await supabase
    .from('quotes')
    .insert({ company_id: COMPANY_ID, client_id: form.clientId, reference, subject: form.objet, status: 'draft', tax_rate: form.tva || 18, discount_rate: form.remise || 0, amount_ht: apresRemise, amount_ttc: ttc, validity_date: form.dateExpiration || null, notes: form.notes || null, created_by: userId })
    .select().single();
  if (error) throw error;

  if (form.lignes?.length > 0) {
    await supabase.from('quote_lines').insert(
      form.lignes.map((l, i) => ({ quote_id: data.id, position: i + 1, description: l.description, quantity: l.quantite, unit_price: l.prixUnit, total_ht: l.total }))
    );
  }
  return mapDevis(data);
}

export async function updateStatutDevis(id, statut) {
  const dbStatus = { Brouillon: 'draft', Envoyé: 'sent', Accepté: 'accepted', Refusé: 'refused', Facturé: 'invoiced' }[statut] || statut;
  const patch = { status: dbStatus, updated_at: new Date().toISOString() };
  if (dbStatus === 'accepted') patch.accepted_at = new Date().toISOString();
  if (dbStatus === 'refused') patch.refused_at = new Date().toISOString();

  const { data, error } = await supabase.from('quotes').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDevis(id) {
  const { error } = await supabase.from('quotes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
