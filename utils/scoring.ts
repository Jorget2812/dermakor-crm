
import { Lead, LeadStage, InterestLevel, MaturityLevel, StructureType } from '../types';

export const calculateDaysWithoutContact = (lastContact: string): number => {
  const diff = new Date().getTime() - new Date(lastContact).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const getScore = (lead: Lead): number => {
  let score = 0;

  // Potential Monthly (0-40 pts)
  if (lead.monthlyPotential > 10000) score += 40;
  else if (lead.monthlyPotential > 5000) score += 25;
  else if (lead.monthlyPotential > 2000) score += 10;

  // Interest (0-30 pts)
  if (lead.declaredInterest === InterestLevel.PREMIUM) score += 30;
  else if (lead.declaredInterest === InterestLevel.STANDARD) score += 15;

  // Structure (0-20 pts)
  if (lead.structure === StructureType.CLINICA) score += 20;
  else if (lead.structure === StructureType.INSTITUTO) score += 10;

  // Academy interest (10 pts)
  if (lead.academyInterest) score += 10;

  return score;
};

export const getPriority = (score: number): string => {
  if (score >= 75) return 'Haute';
  if (score >= 50) return 'Moyenne';
  return 'Basse';
};

export const isPremiumCandidate = (lead: Lead): boolean => {
  return lead.declaredInterest === InterestLevel.PREMIUM || lead.monthlyPotential >= 5000;
};

export const isOverdue = (nextFollowUp: string): boolean => {
  return new Date(nextFollowUp).getTime() < new Date().getTime();
};
