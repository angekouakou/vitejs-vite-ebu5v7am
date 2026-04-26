import { supabase } from '../supabase';

function toISO(str) {
  if (!str) return null;
  if (str.includes('-')) return str; // déjà au bon format
  const [d, m, y] = str.split('/');
  return `${y}-${m}-${d}`;
}

const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

async function genRef() {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .like('reference', `PROJ-${year}-%`);
  return `PROJ-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
}

export function mapChantier(c) {
  return {
    ...c,
    nom: c.name,
    client: c.clients?.name || '',
    statut: {
      draft: 'Planifié', planned: 'Planifié',
      in_progress: 'En cours', completed: 'Terminé', archived: 'Archivé'
    }[c.status] || c.status,
    budget: c.budget_amount || 0,
    depense: c.spent_amount || 0,
    avancement: c.progress || 0,
    localisation: c.location || '',
    dateDebut: c.start_date || '',
    dateFin: c.end_date || '',
    equipe: (c.project_members || []).map(m => m.user_id),
    taches: (c.tasks || []).map(t => ({ id: t.id, label: t.label, done: t.is_done })),
    blocages: (c.blocages || []).map(b => ({ id: b.id, type: b.type, description: b.description, resolu: b.is_resolved, date: b.created_at, technicien: b.reported_by })),
    photos: c.photos || [],
    rapports: c.rapports || [],
    presences: c.presences || [],
    documents: [],
  };
}

export async function getDepenseChantier(projectId, factures) {
  // Calcul depuis les paiements des factures liées au chantier
  const facturesChantier = (factures || []).filter(
    f => f.project_id === projectId || f.chantierId === projectId
  );
  return facturesChantier.reduce((s, f) => s + (f.amount_paid || 0), 0);
}

export async function loadChantiers() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients(name),
      users!projects_chef_id_fkey(first_name, last_name),
      tasks(id, label, is_done),
      blocages(id, type, description, is_resolved, created_at, reported_by),
      project_members(user_id)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapChantier);
}

export async function createChantier(form, userId) {
  const reference = await genRef();

  const { data, error } = await supabase
    .from('projects')
    .insert({
      company_id:    COMPANY_ID,
      client_id:     form.clientId || null,
      chef_id:       null,
      reference,
      name:          form.nom,
      location:      form.localisation || null,
      status:        'planned',
      budget_amount: parseInt(form.budget) || 0,
      spent_amount:  0,
      progress:      0,
      start_date: toISO(form.dateDebut),
end_date: toISO(form.dateFin),
      created_by:    null,
    })
    .select()
    .single();

  if (error) throw error;

  // Ajouter les membres
  if (form.membres?.length > 0) {
    await supabase.from('project_members').insert(
      form.membres.map(uid => ({
        project_id: data.id,
        user_id: uid,
        role: 'technicien',
      }))
    );
  }

  return mapChantier(data);
}

export async function updateChantier(id, patch) {
  const dbPatch = {};
  if (patch.statut !== undefined) {
    dbPatch.status = {
      'Planifié': 'planned', 'En cours': 'in_progress',
      'Terminé': 'completed', 'Archivé': 'archived'
    }[patch.statut] || patch.statut;
  }
  if (patch.avancement !== undefined) dbPatch.progress = patch.avancement;
  if (patch.depense !== undefined) dbPatch.spent_amount = patch.depense;
  if (patch.budget !== undefined) dbPatch.budget_amount = patch.budget;
  if (patch.nom !== undefined) dbPatch.name = patch.nom;
  if (patch.localisation !== undefined) dbPatch.location = patch.localisation;
  if (patch.dateFin !== undefined) dbPatch.end_date = patch.dateFin;
  dbPatch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('projects')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChantier(id) {
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function assignerEquipe(projectId, userIds) {
  await supabase.from('project_members').delete().eq('project_id', projectId);

  if (userIds.length > 0) {
    const { error } = await supabase.from('project_members').insert(
      userIds.map(uid => ({ project_id: projectId, user_id: uid, role: 'technicien' }))
    );
    if (error) throw error;
  }
}