import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string;
                    avatar_url: string | null;
                    role: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    full_name: string;
                    avatar_url?: string | null;
                    role?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    avatar_url?: string | null;
                    role?: string;
                    updated_at?: string;
                };
            };
            leads: {
                Row: {
                    id: string;
                    name: string;
                    contact_person: string | null;
                    canton: string;
                    structure: string;
                    maturity: string;
                    monthly_potential: number;
                    declared_interest: string;
                    stage: string;
                    last_contact: string | null;
                    next_follow_up: string | null;
                    owner_id: string;
                    territorial_exclusivity: boolean;
                    initial_investment_capacity: number;
                    urgency: number;
                    price_sensitivity: number;
                    academy_interest: boolean;
                    source: string;
                    notes: string;
                    created_at: string;
                    updated_at: string;
                    created_by: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    contact_person?: string | null;
                    canton: string;
                    structure: string;
                    maturity: string;
                    monthly_potential?: number;
                    declared_interest: string;
                    stage: string;
                    last_contact?: string | null;
                    next_follow_up?: string | null;
                    owner_id: string;
                    territorial_exclusivity?: boolean;
                    initial_investment_capacity?: number;
                    urgency?: number;
                    price_sensitivity?: number;
                    academy_interest?: boolean;
                    source?: string;
                    notes?: string;
                    created_by: string;
                };
                Update: {
                    name?: string;
                    contact_person?: string | null;
                    canton?: string;
                    structure?: string;
                    maturity?: string;
                    monthly_potential?: number;
                    declared_interest?: string;
                    stage?: string;
                    last_contact?: string | null;
                    next_follow_up?: string | null;
                    owner_id?: string;
                    territorial_exclusivity?: boolean;
                    initial_investment_capacity?: number;
                    urgency?: number;
                    price_sensitivity?: number;
                    academy_interest?: boolean;
                    source?: string;
                    notes?: string;
                    updated_at?: string;
                };
            };
        };
    };
}
