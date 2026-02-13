import { supabase } from './supabase';
import { Prospect, PipelineStage, Canton, CompanyType, LeadSource, PotentialMonthly, UrgencyLevel, InvestmentCapacity, PriceSensitivity } from '../types';
import { handleStageChangeAutomation } from './automations';

// Database type matching our Supabase schema
export interface DatabaseProspect {
    id?: string;
    company_name: string;
    company_website?: string;
    company_type: string;
    ide_number?: string;
    address_street?: string;
    address_city?: string;
    address_postal_code?: string;
    canton: string;

    contact_civility?: string;
    contact_first_name: string;
    contact_last_name: string;
    contact_function?: string;
    contact_email: string;
    contact_phone: string;
    contact_linkedin?: string;

    source: string;
    assigned_to_id?: string;
    potential_monthly: string;
    maturity_level?: string;
    urgency?: string;
    suggested_plan?: string;
    investment_capacity?: string;
    price_sensitivity?: string;
    interest_academy: boolean;
    interest_exclusivity: boolean;

    lead_score: number;
    is_premium_candidate: boolean;

    pipeline_stage: string;
    pipeline_stage_entered_at?: string;
    probability_close: number;
    estimated_deal_value?: number;
    expected_close_date?: string;

    is_closed: boolean;
    close_status?: string;
    close_date?: string;
    final_deal_value?: number;
    chosen_plan?: string;

    lost_reason?: string;
    lost_competitor?: string;
    lost_details?: string;
    nurture_recontact_date?: string;

    objections: string[];
    strategic_notes?: string;

    created_at?: string;
    updated_at?: string;
    last_activity_at?: string;
    next_followup_at?: string;
}

// Transform database row to app Prospect
const fromDatabase = (db: DatabaseProspect): Prospect => {
    return {
        id: db.id || '',
        companyName: db.company_name,
        companyWebsite: db.company_website,
        companyType: db.company_type as CompanyType,
        ideNumber: db.ide_number,
        addressStreet: db.address_street,
        addressCity: db.address_city,
        addressPostalCode: db.address_postal_code,
        canton: db.canton as Canton,

        contactCivility: db.contact_civility,
        contactFirstName: db.contact_first_name,
        contactLastName: db.contact_last_name,
        contactFunction: db.contact_function,
        contactEmail: db.contact_email,
        contactPhone: db.contact_phone,
        contactLinkedin: db.contact_linkedin,

        source: db.source as LeadSource,
        assignedTo: db.assigned_to_id,
        potentialMonthly: db.potential_monthly as PotentialMonthly,
        maturityLevel: db.maturity_level as any,
        urgency: db.urgency as any,
        suggestedPlan: db.suggested_plan as any,
        investmentCapacity: db.investment_capacity as any,
        priceSensitivity: db.price_sensitivity as any,
        interestAcademy: db.interest_academy,
        interestExclusivity: db.interest_exclusivity,

        leadScore: db.lead_score,
        isPremiumCandidate: db.is_premium_candidate,

        pipelineStage: db.pipeline_stage as PipelineStage,
        pipelineStageEnteredAt: db.pipeline_stage_entered_at || new Date().toISOString(),
        probabilityClose: db.probability_close,
        estimatedDealValue: db.estimated_deal_value,
        expectedCloseDate: db.expected_close_date,

        isClosed: db.is_closed,
        closeStatus: db.close_status as any,
        closeDate: db.close_date,
        finalDealValue: db.final_deal_value,
        chosenPlan: db.chosen_plan as any,

        lostReason: db.lost_reason,
        lostCompetitor: db.lost_competitor,
        lostDetails: db.lost_details,
        nurtureRecontactDate: db.nurture_recontact_date,

        objections: db.objections || [],
        strategicNotes: db.strategic_notes,

        createdAt: db.created_at || new Date().toISOString(),
        updatedAt: db.updated_at || new Date().toISOString(),
        lastActivityAt: db.last_activity_at,
        nextFollowupAt: db.next_followup_at
    };
};

// Transform app Prospect to database object
const toDatabase = (p: Prospect): Partial<DatabaseProspect> => {
    const db: Partial<DatabaseProspect> = {
        company_name: p.companyName,
        company_website: p.companyWebsite,
        company_type: p.companyType,
        ide_number: p.ideNumber,
        address_street: p.addressStreet,
        address_city: p.addressCity,
        address_postal_code: p.addressPostalCode,
        canton: p.canton,

        contact_civility: p.contactCivility,
        contact_first_name: p.contactFirstName,
        contact_last_name: p.contactLastName,
        contact_function: p.contactFunction,
        contact_email: p.contactEmail,
        contact_phone: p.contactPhone,
        contact_linkedin: p.contactLinkedin,

        source: p.source,
        assigned_to_id: p.assignedTo || null,
        potential_monthly: p.potentialMonthly,
        maturity_level: p.maturityLevel,
        urgency: p.urgency,
        suggested_plan: p.suggestedPlan,
        investment_capacity: p.investmentCapacity,
        price_sensitivity: p.priceSensitivity,
        interest_academy: p.interestAcademy || false,
        interest_exclusivity: p.interestExclusivity || false,

        lead_score: p.leadScore || 0,
        is_premium_candidate: p.isPremiumCandidate || false,

        probability_close: p.probabilityClose || 0,
        estimated_deal_value: p.estimatedDealValue || 0,
        expected_close_date: p.expectedCloseDate,

        is_closed: p.isClosed || false,
        close_status: p.closeStatus,
        close_date: p.closeDate,
        final_deal_value: p.finalDealValue,
        chosen_plan: p.chosenPlan,

        lost_reason: p.lostReason,
        lost_competitor: p.lostCompetitor,
        lost_details: p.lostDetails,
        nurture_recontact_date: p.nurtureRecontactDate,

        strategic_notes: p.strategicNotes,
        updated_at: new Date().toISOString(),
        pipeline_stage: p.pipelineStage
    };

    // Only include ID if it's a valid UUID
    if (p.id && p.id.trim() !== '') {
        db.id = p.id;
    }

    return db;
};

export const fetchLeads = async (): Promise<Prospect[]> => {
    const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Supabase Error (fetchLeads):', error);
        throw error;
    }
    return (data || []).map(fromDatabase);
};

export const createLead = async (prospect: Prospect, userId: string): Promise<Prospect> => {
    const dbData = toDatabase(prospect);
    // Always force assigned_to_id to the current user on creation
    dbData.assigned_to_id = userId;

    const { data, error } = await supabase
        .from('prospects')
        .insert([dbData])
        .select()
        .single();

    if (error) {
        console.error('Supabase Error (createLead):', error);
        throw error;
    }
    return fromDatabase(data);
};

export const updateLead = async (prospect: Prospect, userId: string): Promise<Prospect> => {
    const dbData = toDatabase(prospect);
    // Explicitly do NOT allow manual update of assigned_to_id here if it's not provided or to prevent tampering
    // If we want to allow transfer (Directors), we can keep the value from p.assignedTo if it exists
    if (!prospect.assignedTo) {
        delete dbData.assigned_to_id;
    }

    const { data, error } = await supabase
        .from('prospects')
        .update(dbData)
        .eq('id', prospect.id)
        .select()
        .single();

    if (error) {
        console.error('Supabase Error (updateLead):', error);
        throw error;
    }

    const updated = fromDatabase(data);

    // Trigger automations if stage changed
    if (prospect.pipelineStage) {
        handleStageChangeAutomation(updated, undefined, updated.pipelineStage, userId);
    }

    return updated;
};

export const deleteLead = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const fetchCollaborators = async (): Promise<any[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['sales_rep', 'collaborator']);

    if (error) {
        console.error('Supabase Error (fetchCollaborators):', error);
        throw error;
    }
    return data || [];
};
