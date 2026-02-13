export type UserRole = 'directeur' | 'vendeur' | 'academy';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
}

export interface CommissionRule {
    id: string;
    month: number;
    year: number;

    standardCommissionPct: number;
    standardVolumeBonusPct: number;
    standardVolumeThreshold: number;

    premiumCommissionPct: number;
    premiumVolumeBonusPct: number;
    premiumVolumeThreshold: number;

    objectiveAmount: number;
    bonus100_110: number;
    bonus111_125: number;
    bonusAbove125: number;

    slaThresholdPct: number;
    slaBonusAmount: number;

    firstPremiumBonus: number;
    exclusivityBonus: number;
    largeDealThreshold: number;
    largeDealBonus: number;

    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export type PayoutStatus = 'en_calcul' | 'en_validation' | 'valide' | 'paye';

export interface CommissionPayout {
    id: string;
    vendeurId: string;
    vendeur?: User; // Joined Relation
    month: number;
    year: number;
    ruleId?: string;

    totalRevenueClosed: number;
    nbDealsStandard: number;
    nbDealsPremium: number;

    commissionStandard: number;
    commissionPremium: number;
    bonusVolume: number;
    bonusObjective: number;
    bonusSla: number;
    bonusSpecial: number;

    totalCommission: number;

    status: PayoutStatus;
    validatedBy?: string;
    validatedAt?: string;
    paidAt?: string;
    notes?: string;

    createdAt: string;
    updatedAt: string;
}

export interface DealCommissionDetail {
    id: string;
    payoutId: string;
    prospectId: string;
    dealNumber: string;
    dealValue: number;
    dealPlan: 'standard' | 'premium';
    closeDate: string;

    commissionRate: number;
    commissionAmount: number;
}
