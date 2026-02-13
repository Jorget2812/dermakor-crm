import { supabase } from '../utils/supabase';

export interface InternalMessage {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    is_read: boolean;
    read_at?: string;
    created_at: string;
    conversation_key: string;
}

export const messagingService = {
    async sendMessage(recipientId: string, content: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('internal_messages')
            .insert({
                sender_id: user.id,
                recipient_id: recipientId,
                content
            })
            .select()
            .single();

        if (error) throw error;
        return data as InternalMessage;
    },

    async fetchMessages(otherUserId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // The conversation_key logic handles the sorting, but we can also just use OR
        const { data, error } = await supabase
            .from('internal_messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as InternalMessage[];
    },

    async fetchUnreadCount() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count, error } = await supabase
            .from('internal_messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    },

    async markAsRead(senderId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('internal_messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('sender_id', senderId)
            .eq('recipient_id', user.id)
            .eq('is_read', false);

        if (error) throw error;
    },

    subscribeToMessages(callback: (message: InternalMessage) => void) {
        return supabase
            .channel('internal_messages_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'internal_messages'
                },
                (payload) => {
                    callback(payload.new as InternalMessage);
                }
            )
            .subscribe();
    }
};
