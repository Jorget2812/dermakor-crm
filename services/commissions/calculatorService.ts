import { supabase } from '../../utils/supabase';
import { CommissionRule, DealCommissionDetail } from './types';

export interface CalculationResult {
    success: boolean;
    count?: number;
    error?: string;
    details?: string;
}

export async function calculateCommissionsForMonth(month: number, year: number): Promise<CalculationResult> {
    try {
        // 1. Récupérer les règles pour le mois/année
        const { data: rule, error: ruleError } = await supabase
            .from('commission_rules')
            .select('*')
            .eq('month', month)
            .eq('year', year)
            .single();

        if (ruleError || !rule) {
            if (ruleError?.code === 'PGRST116') {
                return { success: false, error: 'Règles non configurées', details: 'Aucune règle de commission trouvée pour ce mois.' };
            }
            throw ruleError;
        }

        // 2. Récupérer tous les vendeurs actifs (role='sales_rep' ou 'vendeur')
        // Note: On cherche dans 'profiles' qui mapped à User dans notre logique
        const { data: vendeurs, error: vendeursError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .or('role.eq.sales_rep,role.eq.vendeur'); // Support both legacy and new roles
        // .eq('is_active', true); // Add this if is_active column exists in profiles

        if (vendeursError) throw vendeursError;
        if (!vendeurs || vendeurs.length === 0) {
            return { success: true, count: 0, details: 'Aucun vendeur trouvé.' };
        }

        let processedCount = 0;

        // 3. Pour chaque vendeur, calculer la commission
        for (const vendeur of vendeurs) {
            await calculateVendeurPayout(vendeur, rule, month, year);
            processedCount++;
        }

        return { success: true, count: processedCount };

    } catch (error: any) {
        console.error('Erreur calcul commissions:', error);
        return { success: false, error: error.message };
    }
}

async function calculateVendeurPayout(vendeur: any, rule: CommissionRule, month: number, year: number) {
    // Définir la période du mois
    // Attention: Le mois en JS commence à 0 (Janvier = 0), mais nos règles stockent 1-12.
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1)); // Le 1er du mois suivant (exclusif)

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    // Récupérer les deals GAGNÉS et FERMÉS pour ce vendeur dans la période
    // Table: 'prospects' (mapped from Prospect model)
    const { data: deals, error: dealsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('assigned_to', vendeur.id)
        .eq('pipeline_stage', 'ferme_gagne') // Ou check close_status='gagne'
        .gte('close_date', startIso)
        .lt('close_date', endIso);

    if (dealsError) throw dealsError;

    const allDeals = deals || [];

    // Séparer Standard vs Premium
    const dealsStandard = allDeals.filter((d: any) => d.chosen_plan === 'standard');
    const dealsPremium = allDeals.filter((d: any) => d.chosen_plan === 'premium');

    // Calcul CA (Revenue)
    const revenueStd = dealsStandard.reduce((sum: number, d: any) => sum + Number(d.final_deal_value || 0), 0);
    const revenuePrm = dealsPremium.reduce((sum: number, d: any) => sum + Number(d.final_deal_value || 0), 0);
    const totalRevenue = revenueStd + revenuePrm;

    // --- CALCULS ---

    // 1. Commissions Base
    const commStd = revenueStd * (Number(rule.standardCommissionPct) / 100);
    const commPrm = revenuePrm * (Number(rule.premiumCommissionPct) / 100);

    // 2. Bonus Volume
    let bonusVolume = 0;
    if (dealsStandard.length >= rule.standardVolumeThreshold) {
        bonusVolume += revenueStd * (Number(rule.standardVolumeBonusPct) / 100);
    }
    if (dealsPremium.length >= rule.premiumVolumeThreshold) {
        bonusVolume += revenuePrm * (Number(rule.premiumVolumeBonusPct) / 100);
    }

    // 3. Bonus Objectif
    let bonusObjective = 0;
    // Éviter division par zéro
    if (Number(rule.objectiveAmount) > 0) {
        const objectivePct = (totalRevenue / Number(rule.objectiveAmount)) * 100;

        if (objectivePct >= 125) {
            bonusObjective = Number(rule.bonusAbove125);
        } else if (objectivePct >= 111) {
            bonusObjective = Number(rule.bonus111_125);
        } else if (objectivePct >= 100) {
            bonusObjective = Number(rule.bonus100_110);
        }
    }

    // 4. Bonus Spéciaux (Exemple: Premier deal premium)
    let bonusSpecial = 0;
    if (dealsPremium.length > 0) {
        // Logique simplifiée: Si au moins 1 deal premium, on donne le bonus "First Premium"
        // Idéalement, il faudrait vérifier si c'est LE premier deal premium historique du vendeur
        // Pour l'instant, on applique le montant configure dans la règle si des deals premium existent ce mois-ci
        // bonusSpecial += Number(rule.firstPremiumBonus); 
        // TODO: Implémenter vérification historique pour "First Premium" réel
    }

    // Bonus Large Deal (> Threshold)
    for (const deal of allDeals) {
        if (Number(deal.final_deal_value) >= Number(rule.largeDealThreshold)) {
            bonusSpecial += Number(rule.largeDealBonus);
        }
    }

    const bonusSla = 0; // Placeholder pour future implementation SLA

    const totalCommission = commStd + commPrm + bonusVolume + bonusObjective + bonusSla + bonusSpecial;

    // --- UPSERT PAYOUT ---

    // Vérifier si un payout existe déjà pour ce mois/vendeur
    const { data: existingPayout } = await supabase
        .from('commission_payouts')
        .select('id')
        .eq('vendeur_id', vendeur.id)
        .eq('month', month)
        .eq('year', year)
        .single();

    const payoutData = {
        vendeur_id: vendeur.id,
        month: month,
        year: year,
        rule_id: rule.id,
        total_revenue_closed: totalRevenue,
        nb_deals_standard: dealsStandard.length,
        nb_deals_premium: dealsPremium.length,
        commission_standard: commStd,
        commission_premium: commPrm,
        bonus_volume: bonusVolume,
        bonus_objective: bonusObjective,
        bonus_sla: bonusSla,
        bonus_special: bonusSpecial,
        total_commission: totalCommission,
        // Ne pas changer le statut s'il est déjà validé/payé, sinon remettre en calcul
        status: existingPayout ? undefined : 'en_calcul', // Si update, on garde le status sauf si on veut forcer recalcul
        updated_at: new Date().toISOString()
    };

    // Si le payout existe et est déjà validé/payé, on ne devrait peut-être pas le recalculer automatiquement
    // Sauf si action explicite "Forcer Recalcul". Ici on update simple.

    let payoutId: string;

    if (existingPayout) {
        const { error: updateError } = await supabase
            .from('commission_payouts')
            .update(payoutData)
            .eq('id', existingPayout.id);

        if (updateError) throw updateError;
        payoutId = existingPayout.id;
    } else {
        // Insert
        const { data: newPayout, error: insertError } = await supabase
            .from('commission_payouts')
            .insert([{ ...payoutData, status: 'en_calcul' }])
            .select('id')
            .single();

        if (insertError) throw insertError;
        payoutId = newPayout.id;
    }

    // --- CREATE DETAILS ---

    // 1. Supprimer anciens détails pour ce payout
    await supabase
        .from('deal_commission_details')
        .delete()
        .eq('payout_id', payoutId);

    // 2. Insérer nouveaux détails
    const detailsToInsert = allDeals.map((deal: any) => {
        const isPremium = deal.chosen_plan === 'premium';
        const rate = isPremium ? Number(rule.premiumCommissionPct) : Number(rule.standardCommissionPct);
        const val = Number(deal.final_deal_value || 0);

        return {
            payout_id: payoutId,
            prospect_id: deal.id,
            deal_number: `${year}${String(month).padStart(2, '0')}-${deal.id.substring(0, 4)}`, // Fake deal number generated
            deal_value: val,
            deal_plan: deal.chosen_plan,
            close_date: deal.close_date,
            commission_rate: rate,
            commission_amount: val * (rate / 100)
        };
    });

    if (detailsToInsert.length > 0) {
        const { error: detailsError } = await supabase
            .from('deal_commission_details')
            .insert(detailsToInsert);

        if (detailsError) throw detailsError;
    }
}
