
export enum UserRole {
  DIRECTEUR = 'director',
  SALES_REP = 'sales_rep',
  COLLABORATEUR = 'collaborator',
  ACADEMY = 'academy'
}

export enum PipelineStage {
  NOUVEAU = 'nouveau',
  CONTACTE = 'contacte',
  QUALIFIE = 'qualifie',
  PROPOSITION = 'proposition',
  NEGOCIATION = 'negociation',
  FERME_GAGNE = 'ferme_gagne',
  FERME_PERDU = 'ferme_perdu'
}

export enum CompanyType {
  INSTITUT = 'institut',
  CLINIQUE = 'clinique',
  INDEPENDANT = 'independant'
}

export enum LeadSource {
  WEB = 'web',
  INSTAGRAM = 'instagram',
  REFERE = 'refere',
  EVENEMENT = 'evenement',
  AUTRE = 'autre'
}

export enum UrgencyLevel {
  BASSE = 'basse',
  MOYENNE = 'moyenne',
  HAUTE = 'haute',
  IMMEDIATE = 'immediate'
}

export enum MaturityLevel {
  STARTUP = 'startup',
  DEVELOPP_1_2ANS = 'developp_1_2ans',
  ETABLI_2ANS_PLUS = 'etabli_2ans_plus',
  LEADER_MARCHE = 'leader_marche'
}

export enum PotentialMonthly {
  MOINS_5K = 'moins_5k',
  F5K_10K = '5k_10k',
  F10K_15K = '10k_15k',
  F15K_25K = '15k_25k',
  F25K_40K = '25k_40k',
  PLUS_40K = 'plus_40k'
}

export enum InvestmentCapacity {
  MOINS_5K = 'moins_5k',
  F5K_10K = '5k_10k',
  F10K_20K = '10k_20k',
  F20K_50K = '20k_50k',
  PLUS_50K = 'plus_50k'
}

export enum PriceSensitivity {
  BASSE = 'basse',
  MOYENNE = 'moyenne',
  HAUTE = 'haute'
}

export enum Canton {
  AG = 'AG', AI = 'AI', AR = 'AR', BE = 'BE', BL = 'BL', BS = 'BS',
  FR = 'FR', GE = 'GE', GL = 'GL', GR = 'GR', JU = 'JU', LU = 'LU',
  NE = 'NE', NW = 'NW', OW = 'OW', SG = 'SG', SH = 'SH', SO = 'SO',
  SZ = 'SZ', TG = 'TG', TI = 'TI', UR = 'UR', VD = 'VD', VS = 'VS',
  ZG = 'ZG', ZH = 'ZH'
}

export enum ActivityType {
  APPEL = 'appel',
  EMAIL = 'email',
  REUNION = 'reunion',
  NOTE = 'note',
  DEMO = 'demo',
  VISITE = 'visite'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export interface Prospect {
  id: string;
  // Entreprise
  companyName: string;
  companyWebsite?: string;
  companyType: CompanyType;
  ideNumber?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  canton: Canton;

  // Contact
  contactCivility?: string;
  contactFirstName: string;
  contactLastName: string;
  contactFunction?: string;
  contactEmail: string;
  contactPhone: string;
  contactLinkedin?: string;

  // Qualification
  source: LeadSource;
  assignedTo?: string; // userId
  potentialMonthly: PotentialMonthly;
  maturityLevel?: MaturityLevel;
  urgency?: UrgencyLevel;
  suggestedPlan?: 'standard' | 'premium' | 'indecis';
  investmentCapacity?: InvestmentCapacity;
  priceSensitivity?: PriceSensitivity;
  interestAcademy?: boolean;
  interestExclusivity?: boolean;

  // Scoring
  leadScore: number; // 0-100
  isPremiumCandidate: boolean;

  // Pipeline
  pipelineStage: PipelineStage;
  pipelineStageEnteredAt: string;
  probabilityClose: number;
  estimatedDealValue?: number;
  expectedCloseDate?: string;

  // Clôture
  isClosed: boolean;
  closeStatus?: 'gagne' | 'perdu';
  closeDate?: string;
  finalDealValue?: number;
  chosenPlan?: 'standard' | 'premium';

  // Si perdu
  lostReason?: string;
  lostCompetitor?: string;
  lostDetails?: string;
  nurtureRecontactDate?: string;

  objections: string[];
  strategicNotes?: string;

  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  nextFollowupAt?: string;
}

export interface Activity {
  id: string;
  prospectId: string;
  createdBy: string;
  type: ActivityType;
  subject?: string;
  content: string;
  durationMinutes?: number;
  emailTemplateUsed?: string;
  emailSentAt?: string;
  emailOpenedAt?: string;
  createdAt: string;
}

export interface Partner {
  id: string;
  prospectId: string;
  partnerCode: string;
  companyName: string;
  canton: Canton;
  planType: 'standard' | 'premium';
  contractSignedDate: string;
  hasExclusivity: boolean;
  academyStatus: 'non_initie' | 'en_cours' | 'certifie' | 'expire';
  monthlyRevenueActual?: number;
}

export interface CantonTerritory {
  canton: Canton;
  name: string;
  status: 'libre' | 'actif' | 'sature' | 'exclusif';
  activePartnersCount: number;
  exclusivePartnerId?: string;
  totalMonthlyRevenue: number;
}
