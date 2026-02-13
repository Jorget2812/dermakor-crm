import { Prospect, PipelineStage, ActivityType } from '../types';
import { supabase } from './supabase';

/**
 * CRM Automation Orchestrator
 * Handles side effects triggered by prospect stage changes.
 */

export const handleStageChangeAutomation = async (
    lead: Prospect,
    oldStage: PipelineStage | undefined,
    newStage: PipelineStage,
    userId: string
) => {
    // Avoid re-triggering if stage hasn't actually changed
    if (oldStage === newStage) return;

    console.log(`🤖 Automation Trigger: ${lead.companyName} moved from ${oldStage} to ${newStage}`);

    switch (newStage) {
        case PipelineStage.CONTACTE:
            await sendIntroductionEmail(lead, userId);
            break;

        case PipelineStage.PROPOSITION:
            await sendProposalEmail(lead, userId);
            break;

        case PipelineStage.NEGOCIATION:
            await scheduleFollowUp(lead, 3); // 3 days follow-up
            break;

        default:
            // No automation for other stages yet
            break;
    }
};

/**
 * Simulated: Send Introduction Email
 */
async function sendIntroductionEmail(lead: Prospect, userId: string) {
    console.log(`📧 Sending Intro Email to: ${lead.contactEmail}`);

    const content = `Bonjour ${lead.contactFirstName},\n\nMerci de votre intérêt pour DermaKor Swiss. Nous sommes ravis de commencer notre collaboration...`;

    await logAutomationActivity(lead.id, userId, ActivityType.EMAIL, 'Email d\'Introduction Envoyé (Auto)', content);
}

/**
 * Simulated: Send Proposal Email
 */
async function sendProposalEmail(lead: Prospect, userId: string) {
    console.log(`📧 Sending Proposal Email to: ${lead.contactEmail}`);

    const content = `Bonjour ${lead.contactFirstName},\n\nSuite à nos échanges, vous trouverez ci-joint notre proposition stratégique pour l'Écosystème Partenaires...`;

    await logAutomationActivity(lead.id, userId, ActivityType.EMAIL, 'Email de Proposition Envoyé (Auto)', content);
}

/**
 * Logic: Schedule a follow-up reminder
 */
async function scheduleFollowUp(lead: Prospect, days: number) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + days);
    const formattedDate = followUpDate.toISOString();

    console.log(`📅 Scheduling follow-up for ${lead.companyName} on ${formattedDate}`);

    const { error } = await supabase
        .from('prospects')
        .update({ next_followup_at: formattedDate })
        .eq('id', lead.id);

    if (error) {
        console.error('❌ Error scheduling follow-up:', error);
    } else {
        // Log activity
        // Note: We don't have a userId here easily without passing it down, 
        // but we can assume the system or the triggerer.
    }
}

/**
 * Internal: Log automation actions as activities
 */
async function logAutomationActivity(
    prospectId: string,
    userId: string,
    type: ActivityType,
    subject: string,
    content: string
) {
    const { error } = await supabase
        .from('activities')
        .insert([{
            prospect_id: prospectId,
            created_by: userId,
            type: type,
            subject: subject,
            content: content,
            created_at: new Date().toISOString()
        }]);

    if (error) {
        console.error('❌ Error logging automation activity:', error);
    }
}
