import { fetchLeads, createLead, updateLead, deleteLead } from '../utils/leads';
import { Prospect } from '../types';

export const prospectService = {
    /**
     * Get all prospects
     */
    async getProspects(): Promise<Prospect[]> {
        return await fetchLeads();
    },

    /**
     * Create a new prospect
     */
    async createProspect(prospect: Prospect, userId: string): Promise<Prospect> {
        return await createLead(prospect, userId);
    },

    /**
     * Update an existing prospect
     */
    async updateProspect(prospect: Prospect, userId: string): Promise<Prospect> {
        return await updateLead(prospect, userId);
    },

    /**
     * Delete a prospect
     */
    async deleteProspect(id: string): Promise<void> {
        return await deleteLead(id);
    }
};
