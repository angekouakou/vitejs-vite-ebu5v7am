import { supabase } from '../supabase';
// ═══════════════════════════════════════
// photos.js
// ═══════════════════════════════════════

export async function uploadPhoto(file, projectId, userId, lat = null, lng = null) {
  const ext = file.name.split('.').pop();
  const path = `projects/${projectId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('diginets-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('diginets-photos').getPublicUrl(path);

  const { data, error } = await supabase
    .from('photos')
    .insert({ project_id: projectId, uploaded_by: userId, url: urlData.publicUrl, filename: file.name, size_bytes: file.size, latitude: lat, longitude: lng, taken_at: new Date().toISOString() })
    .select().single();
  if (error) throw error;
  return data;
}

export async function deletePhoto(photoId) {
  const { error } = await supabase.from('photos').update({ deleted_at: new Date().toISOString() }).eq('id', photoId);
  if (error) throw error;
}