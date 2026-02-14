export type UserRole = 'directeur' | 'vendeur' | 'academy';

export interface User {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    role: UserRole;
    isActive: boolean;
    commissionPercentage?: number;
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

export interface ReferralCode {
    id: string;
    userId: string;
    code: string;
    link: string;
    clicks: number;
    conversions: number;
    createdAt: string;
}

export interface Sale {
    id: string;
    prospectId?: string;
    sellerId: string;
    referralCodeId?: string;
    saleAmount: number;
    commissionPercentage: number;
    commissionAmount: number;
    trackingMethod: 'link' | 'code' | 'manual' | 'direct';
    status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
    productName?: string;
    orderNumber?: string;
    saleDate: string;
    payment_date?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;

    // Virtual fields
    seller?: User;
    prospect?: { company_name: string };
}

export interface CommissionPayment {
    id: string;
    sellerId: string;
    periodStart: string;
    periodEnd: string;
    totalSales: number;
    totalCommission: number;
    status: 'pending' | 'paid' | 'cancelled';
    paymentDate?: string;
    paymentMethod?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}
