export type HouseholdRelation = 'HEAD' | 'SPOUSE' | 'CHILD' | 'PARENT' | 'DEPENDENT';

export interface HouseholdMember {
  id: string;
  name: string;
  relation: HouseholdRelation;
  age: number;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  isStudent?: boolean;
  educationLevel?: string; // 'Secondary' | 'Post-Matric' | 'Undergraduate' | 'None'
  isShgMember?: boolean; // Self Help Group Member (for Lakhpati Didi)
  isTaxpayer?: boolean;
  landAcres?: number;
  annualIncomeInr?: number;
  hasKutchaHouse?: boolean;
  socialCategory?: 'GEN' | 'OBC' | 'SC' | 'ST';
}

export interface MemberAllocatedScheme {
  schemeId: string;
  schemeName: string;
  schemeNameHi?: string;
  category: string;
  benefitType:
    | 'DIRECT_CASH'
    | 'CREDIT_LIMIT'
    | 'INSURANCE_COVER'
    | 'HOUSING_GRANT'
    | 'SCHOLARSHIP'
    | 'PENSION'
    | 'LIVELIHOOD_GRANT';
  year1AmountInr: number;
  year2AmountInr: number;
  year3AmountInr: number;
  year4AmountInr: number;
  year5AmountInr: number;
  fiveYearTotalInr: number;
  frequency: string;
  description: string;
  documents: string[];
  statutoryReason: string;
}

export interface MemberBenefitSummary {
  member: HouseholdMember;
  allocatedSchemes: MemberAllocatedScheme[];
  total5YearDirectCashInr: number;
  total5YearProtectionInr: number;
  total5YearGrandTotalInr: number;
}

export interface YearlyCashFlowBreakdown {
  year: number;
  directCashDbtInr: number;
  housingGrantsInr: number;
  scholarshipsInr: number;
  livelihoodGrantsInr: number;
  creditAndProtectionInr: number;
  totalYearlyInr: number;
}

export interface CombinatorialConstraintLog {
  ruleName: string;
  description: string;
  resolution: string;
  impactInr: number;
  status: 'ENFORCED_OPTIMAL' | 'PRUNED_CONFLICT' | 'HOUSEHOLD_CEILING_APPLIED';
}

export interface HouseholdOptimizationResult {
  householdId: string;
  householdName: string;
  state: string;
  district: string;
  membersCount: number;
  totalCombinationsEvaluated: number;
  optimalCombinationRank: number;
  year1TotalInr: number;
  year5TotalDirectGrantsInr: number;
  year5TotalProtectionPoolInr: number;
  year5GrandTotalEntitlementInr: number;
  yearlyCashflows: YearlyCashFlowBreakdown[];
  memberSummaries: MemberBenefitSummary[];
  constraintsEnforced: CombinatorialConstraintLog[];
  filingPhases: Array<{
    phase: string;
    timeline: string;
    action: string;
    schemes: string[];
    responsibleMember: string;
  }>;
  simulated: boolean;
  generatedAt: string;
}
