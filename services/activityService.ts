import { supabase } from '../utils/supabase';

export interface Activity {
    id: string;
    prospect_id: string;
    activity_type: 'call' | 'email' | 'demo' | 'task' | 'reminder';
    title: string;
    description?: string;
    scheduled_date: string;
    completed: boolean;
    completed_at?: string;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    created_by: string;
    created_at: string;
    updated_at: string;
}

export const activityService = {
    /**
     * Fetch all activities for a specific prospect
     */
    async getActivities(prospectId: string) {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('prospect_id', prospectId)
            .order('scheduled_date', { ascending: false });

        if (error) throw error;
        return data as Activity[];
    },

    /**
     * Log a new activity (e.g., immediate call or scheduled task)
     */
    async createActivity(activity: Partial<Activity>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('activities')
            .insert({
                ...activity,
                created_by: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data as Activity;
    },

    /**
     * Update an existing activity (e.g., mark as completed)
     */
    async updateActivity(id: string, updates: Partial<Activity>) {
        const { data, error } = await supabase
            .from('activities')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Activity;
    },

    /**
     * Delete an activity
     */
    async deleteActivity(id: string) {
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
