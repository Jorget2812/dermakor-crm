import { Lead } from '../types';

const STORAGE_KEY = 'dermakor_crm_leads';
const STORAGE_VERSION = '1.0';

interface StorageData {
    version: string;
    leads: Lead[];
    lastUpdated: string;
}

/**
 * Save leads to localStorage
 * Structured as an adapter pattern for easy Supabase migration
 */
export const saveLeads = (leads: Lead[]): void => {
    try {
        const data: StorageData = {
            version: STORAGE_VERSION,
            leads,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        // Handle quota exceeded or other storage errors
        console.error('Failed to save leads to localStorage:', error);
        // TODO: In production, could trigger a notification to user
    }
};

/**
 * Load leads from localStorage
 * Returns null if no data exists or data is corrupted
 */
export const loadLeads = (): Lead[] | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const data: StorageData = JSON.parse(stored);

        // Version check for future migrations
        if (data.version !== STORAGE_VERSION) {
            console.warn('Storage version mismatch, clearing old data');
            clearLeads();
            return null;
        }

        return data.leads;
    } catch (error) {
        console.error('Failed to load leads from localStorage:', error);
        return null;
    }
};

/**
 * Clear all leads from localStorage
 */
export const clearLeads = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear leads from localStorage:', error);
    }
};

/**
 * Future: Supabase adapter
 * This structure allows easy migration to Supabase:
 * 
 * export const saveLeads = async (leads: Lead[]): Promise<void> => {
 *   const { error } = await supabase
 *     .from('leads')
 *     .upsert(leads);
 *   if (error) throw error;
 * };
 * 
 * export const loadLeads = async (): Promise<Lead[]> => {
 *   const { data, error } = await supabase
 *     .from('leads')
 *     .select('*');
 *   if (error) throw error;
 *   return data;
 * };
 */
