import { UserProfile } from '../types/agent';

export interface ApplicationTrackerItem {
  id: string;
  schemeId: string;
  schemeName: string;
  schemeNameHi?: string;
  applicationNumber: string;
  portalName: string;
  appliedDate: string;
  daysPending: number;
  status: 'SUBMITTED' | 'UNDER_SCRUTINY' | 'FIELD_VERIFICATION' | 'STALLED_CRITICAL' | 'APPROVED' | 'DISBURSED';
  officerDesignation: string;
  department: string;
  disbursementAmountInr: number;
  district: string;
  state: string;
  isStalled: boolean; // daysPending > 60
  stallReason?: string;
}

export const SAMPLE_TRACKED_APPLICATIONS: ApplicationTrackerItem[] = [
  {
    id: 'app-001',
    schemeId: 'pm_kisan',
    schemeName: 'PM-KISAN Samman Nidhi',
    schemeNameHi: 'पीएम-किसान सम्मान निधि',
    applicationNumber: 'PMK-2024-MH-918231',
    portalName: 'pmkisan.gov.in',
    appliedDate: '2024-05-10',
    daysPending: 74,
    status: 'STALLED_CRITICAL',
    officerDesignation: 'Tehsildar & Talathi Revenue Office',
    department: 'Department of Agriculture & Farmers Welfare',
    disbursementAmountInr: 6000,
    district: 'Nashik',
    state: 'Maharashtra',
    isStalled: true,
    stallReason: 'Land mutation record pending physical verification at block level beyond statutory 45-day citizen charter limit.',
  },
  {
    id: 'app-002',
    schemeId: 'kcc',
    schemeName: 'Kisan Credit Card (KCC)',
    schemeNameHi: 'किसान क्रेडिट कार्ड',
    applicationNumber: 'KCC-BOI-2024-8812',
    portalName: 'jansamarth.in',
    appliedDate: '2024-06-01',
    daysPending: 68,
    status: 'STALLED_CRITICAL',
    officerDesignation: 'Lead District Bank Manager (LDM)',
    department: 'Department of Financial Services (DFS)',
    disbursementAmountInr: 300000,
    district: 'Nashik',
    state: 'Maharashtra',
    isStalled: true,
    stallReason: 'Scale of finance computation delayed by rural branch credit committee past 14-day statutory SLA.',
  },
  {
    id: 'app-003',
    schemeId: 'ayushman_bharat',
    schemeName: 'Ayushman Bharat PM-JAY',
    schemeNameHi: 'आयुष्मान भारत कार्ड',
    applicationNumber: 'AB-PMJAY-MH-2024-0019',
    portalName: 'setu.pmjay.gov.in',
    appliedDate: '2024-07-15',
    daysPending: 22,
    status: 'FIELD_VERIFICATION',
    officerDesignation: 'District Implementation Unit (DIU)',
    department: 'National Health Authority (NHA)',
    disbursementAmountInr: 500000,
    district: 'Nashik',
    state: 'Maharashtra',
    isStalled: false,
  },
  {
    id: 'app-004',
    schemeId: 'pmay_g',
    schemeName: 'PMAY-Gramin Housing Grant',
    schemeNameHi: 'प्रधानमंत्री आवास योजना (ग्रामीण)',
    applicationNumber: 'PMAYG-2024-MH-44910',
    portalName: 'pmayg.nic.in',
    appliedDate: '2024-04-12',
    daysPending: 92,
    status: 'STALLED_CRITICAL',
    officerDesignation: 'Block Development Officer (BDO)',
    department: 'Ministry of Rural Development',
    disbursementAmountInr: 120000,
    district: 'Nashik',
    state: 'Maharashtra',
    isStalled: true,
    stallReason: 'Geo-tagged foundation photograph approval pending with Gram Panchayat Sevak beyond 30-day timeline.',
  },
];

export interface WhatIfScenario {
  id: string;
  title: string;
  category: 'Agriculture' | 'Solar & Energy' | 'Enterprise & FPO' | 'Education & Girl Child';
  iconEmoji: string;
  investmentInr: number;
  totalGovtSubsidyInr: number;
  unlockedSchemeIds: string[];
  schemesApplicable: string[];
  annualSavingsInr: number;
  paybackMonths: number;
  fiveYearNetBenefitInr: number;
  actionChecklist: string[];
  strategicAdvice: string;
}

export const WHAT_IF_SCENARIOS: WhatIfScenario[] = [
  {
    id: 'scenario_tractor',
    title: 'Purchase 45HP Agriculture Tractor',
    category: 'Agriculture',
    iconEmoji: '🚜',
    investmentInr: 700000,
    totalGovtSubsidyInr: 350000, // SMAM 50% subsidy
    unlockedSchemeIds: ['smam_tractor', 'kcc_machinery'],
    schemesApplicable: ['Sub-Mission on Agricultural Mechanization (SMAM)', 'KCC Term Loan (4% Int)'],
    annualSavingsInr: 120000,
    paybackMonths: 22,
    fiveYearNetBenefitInr: 580000,
    actionChecklist: [
      'Apply on MahaDBT / Agricoop portal for SMAM subsidy lottery token',
      'Submit Quotation from authorized dealer with RTO road-tax exemption',
      'Avail collateral-free 4% credit line under KCC Agriculture Term Loan',
    ],
    strategicAdvice:
      'By utilizing the 50% SMAM capital subsidy, your out-of-pocket cost drops to ₹3.5 Lakhs. Custom hiring rental income to neighboring cultivators generates ~₹10,000/month, amortizing the investment within 22 months.',
  },
  {
    id: 'scenario_fpo',
    title: 'Form 10-Farmer Producer Organization (FPO)',
    category: 'Enterprise & FPO',
    iconEmoji: '🏢',
    investmentInr: 200000,
    totalGovtSubsidyInr: 1500000, // ₹15L matching grant
    unlockedSchemeIds: ['central_10k_fpo', 'nabard_equity_grant'],
    schemesApplicable: ['10,000 Central FPO Scheme', 'NABARD Equity Grant & Credit Guarantee (₹2 Cr)'],
    annualSavingsInr: 450000,
    paybackMonths: 6,
    fiveYearNetBenefitInr: 2850000,
    actionChecklist: [
      'Mobilize minimum 10 shareholder farmers in village cluster',
      'Register Producer Company under Companies Act with MCA',
      'Apply to NABARD/SFAC for ₹15 Lakhs matching equity grant and ₹2 Cr collateral-free guarantee',
    ],
    strategicAdvice:
      'Transforming from individual smallholders to a registered FPO unlocks a 100% tax exemption for 5 years, bulk fertilizer procurement discounts (saving 18%), and ₹15,00,000 non-refundable institutional funding.',
  },
  {
    id: 'scenario_solar_pump',
    title: 'Install 5HP PM-KUSUM Off-Grid Solar Pump',
    category: 'Solar & Energy',
    iconEmoji: '☀️',
    investmentInr: 300000,
    totalGovtSubsidyInr: 240000, // 60% Central + 30% State (Farmer pays 10%)
    unlockedSchemeIds: ['pm_kusum_b', 'state_krishi_pump'],
    schemesApplicable: ['PM-KUSUM Component-B', 'State Krishi Solar Pump Yojana'],
    annualSavingsInr: 75000, // Diesel elimination
    paybackMonths: 10,
    fiveYearNetBenefitInr: 375000,
    actionChecklist: [
      'Verify water source borewell / open well clearance',
      'Pay only 10% citizen contribution (₹30,000) on DISCOM portal',
      'Obtain 25-year warranty with free net-metered solar modules',
    ],
    strategicAdvice:
      'You only pay ₹30,000 (10%). Eliminating diesel pump operating expenses saves ~₹6,200 every month while guaranteeing daytime irrigation reliability for crops.',
  },
  {
    id: 'scenario_girl_child_education',
    title: 'Higher Education for Daughter (College/STEM)',
    category: 'Education & Girl Child',
    iconEmoji: '🎓',
    investmentInr: 50000,
    totalGovtSubsidyInr: 240000,
    unlockedSchemeIds: ['sukanya_samriddhi', 'pragati_scholarship', 'begum_hazrat'],
    schemesApplicable: ['AICTE Pragati STEM Grant (₹50,000/yr)', 'Sukanya Samriddhi 8.2% Tax-Free Corpus', 'Post-Matric Girl Scholarship'],
    annualSavingsInr: 60000,
    paybackMonths: 0,
    fiveYearNetBenefitInr: 350000,
    actionChecklist: [
      'Enroll on National Scholarship Portal (NSP) with college admission slip',
      'Open Sukanya Samriddhi Yojana account at post office (8.2% sovereign interest)',
      'Avail 100% college tuition fee waiver under state girls education policy',
    ],
    strategicAdvice:
      'Combining AICTE Pragati with State Post-Matric scholarships covers 100% tuition, boarding fees, and provides a ₹5,000 monthly stipend directly into her bank account via DBT.',
  },
];
