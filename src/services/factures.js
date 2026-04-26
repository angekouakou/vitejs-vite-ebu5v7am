import { supabase } from '../supabase';
// ═══════════════════════════════════════
// factures.js
// ═══════════════════════════════════════
const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

const methodMap = {
  'Virement bancaire': 'bank_transfer',
  'Chèque': 'check',
  'Espèces': 'cash',
  'Mobile Money': 'mobile_money',
  'Orange Money': 'orange_money',
};

function toISO(str) {
  if (!str) return null;
  if (str.includes('-')) return str;
  const [d, m, y] = str.split('/');
  return `${y}-${m}-${d}`;
}

export async function genRefFacture() {
  const year = new Date().getFullYear();
  const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).like('reference', `FAC-${year}-%`);
  return `FAC-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
}

export function mapFacture(f) {
  return {
    ...f,
    numero: f.reference,
    clientNom: f.clients?.name || '',
    objet: f.subject,
    montantHT: f.amount_ht,
    montantTTC: f.amount_ttc,
    statut: f.status,
    tva: f.tax_rate,
    dateEmission: f.issued_at ? new Date(f.issued_at).toLocaleDateString('fr-CI', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    dateEcheance: f.due_date ? new Date(f.due_date).toLocaleDateString('fr-CI', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    datePaiement: f.paid_at ? new Date(f.paid_at).toLocaleDateString('fr-CI', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null,
    paiements: (f.payments || []).map(p => ({
      ...p,
      montant: p.amount,
      mode: p.method,
      ref: p.reference,
      date: p.payment_date,
    })),
  };
}

export async function createFacture(form, userId) {
  const reference = await genRefFacture();
  const ht = parseInt(form.montantHT) || 0;
  const ttc = Math.round(ht * (1 + (parseInt(form.tva) || 18) / 100));

  const { data, error } = await supabase
    .from('invoices')
    .insert({ company_id: COMPANY_ID, client_id: form.clientId, project_id: form.chantierId || null, reference, type: 'invoice', subject: form.objet, status: 'sent', tax_rate: parseInt(form.tva) || 18, amount_ht: ht, amount_ttc: ttc, amount_paid: 0, issued_at: new Date().toISOString().split('T')[0], due_date: form.dateEcheance ? toISO(form.dateEcheance) : null, created_by: userId })
    .select('*, payments(*), clients(name)').single();
  if (error) throw error;
  return mapFacture(data);
}

export async function enregistrerPaiement(invoiceId, form, userId) {
  const { data, error } = await supabase
    .from('payments')
    .insert({ invoice_id: invoiceId, amount: parseInt(form.montant), method: methodMap[form.mode] || 'bank_transfer', reference: form.ref || null, payment_date: form.date ? toISO(form.date) : new Date().toISOString().split('T')[0], recorded_by: userId })
    .select().single();
  if (error) throw error;
  return data;
}

export async function deleteFacture(id) {
  const { error } = await supabase.from('invoices').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
