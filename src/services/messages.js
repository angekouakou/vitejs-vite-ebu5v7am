import { supabase } from '../supabase';
// ═══════════════════════════════════════
// messages.js
// ═══════════════════════════════════════

export async function sendMessage(conversationId, senderId, content, isUrgent = false) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content, is_urgent: isUrgent, read_by: [senderId] })
    .select().single();
  if (error) throw error;

  const { data: membres } = await supabase.from('conversation_members').select('user_id').eq('conversation_id', conversationId).neq('user_id', senderId);
  if (membres?.length > 0) {
    await supabase.from('notifications').insert(
      membres.map(m => ({
        user_id: m.user_id,
        type: isUrgent ? 'message_urgent' : 'nouveau_message',
        title: isUrgent ? '⚠️ Message urgent' : 'Nouveau message',
        body: content.slice(0, 80),
        entity_type: 'conversations',
        entity_id: conversationId,
      }))
    );
  }
  return data;
}

export function subscribeToConversation(conversationId, onMessage) {
  return supabase
    .channel(`conv:${conversationId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, payload => onMessage(payload.new))
    .subscribe();
}

export function unsubscribeChannel(channel) {
  supabase.removeChannel(channel);
}