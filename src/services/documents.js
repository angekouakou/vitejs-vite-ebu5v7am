import { supabase } from '../supabase';

const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export async function uploadDocument(file, form, userId) {
  const path = `documents/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from('diginets-documents').upload(path, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('diginets-documents').getPublicUrl(path);

  const { data, error } = await supabase
    .from('documents')
    .insert({
      company_id: COMPANY_ID,
      project_id: form.chantierId || null,
      uploaded_by: userId,
      name: form.nom || file.name,
      file_type: form.type || file.name.split('.').pop(),
      category: form.categorie,
      size_bytes: file.size,
      storage_url: urlData.publicUrl,
      description: form.description || null,
      tags: form.tags || [],
      access_roles: ['admin', 'chef', 'technicien'],
      current_version: form.version || 'v1.0',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDocument(id, storageUrl) {
  await supabase.from('documents').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (storageUrl) {
    const path = storageUrl.split('/diginets-documents/')[1];
    if (path) await supabase.storage.from('diginets-documents').remove([path]);
  }
}