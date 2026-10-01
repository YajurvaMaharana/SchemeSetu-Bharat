export type SocialCategory = 'General' | 'OBC' | 'SC' | 'ST' | 'All';
export type HousingType = 'Pucca' | 'Kutcha' | 'Homeless' | 'Rented';

export enum EligibilityStatus {
  ELIGIBLE = 'ELIGIBLE',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

export interface UserProfile {
  name?: string | null;
  age?: number | null;
  gender?: 'Male' | 'Female' | 'Other' | null;
  state?: string | null;
  district?: string | null;
  pincode?: string | null;
  occupation?: string | null;
  annual_income_inr?: number | null;
  land_hectares?: number | null;
  land_acres?: number | null;
  has_land_ownership?: boolean | null;
  social_category?: SocialCategory | string | null;
  housing_type?: HousingType | string | null;
  is_taxpayer?: boolean;
  is_govt_employee?: boolean;
  has_pension_above_10k?: boolean;
  is_shg_member?: boolean;
  is_student?: boolean;
  special_conditions?: string[];
  raw_query?: string | null;
  preferred_language?: 'Hindi' | 'English' | 'Marathi' | string;
}

export interface SchemeEligibilityCriteria {
  min_age?: number | null;
  max_age?: number | null;
  gender?: string | null;
  occupations?: string[];
  requires_land_ownership?: boolean;
  min_land_hectares?: number | null;
  max_land_hectares?: number | null;
  max_annual_income_inr?: number | null;
  housing_type_allowed?: string[];
  social_categories_allowed?: string[];
  states_applicable?: string[];
  exclusions?: string[];
}

export interface Scheme {
  id: string;
  name: string;
  name_hi?: string | null;
  ministry: string;
  category: string;
  target_audience: string[];
  benefit_type: string;
  benefit_amount_inr: number;
  benefit_description: string;
  benefit_frequency: string;
  eligibility_criteria: SchemeEligibilityCriteria;
  edge_cases?: string[];
  required_documents: string[];
  application_mode?: string | null;
  portal_url?: string | null;
}

export interface SchemeEligibilityResult {
  scheme_id: string;
  scheme_name: string;
  scheme_name_hi?: string | null;
  category: string;
  status: EligibilityStatus;
  benefit_amount_inr: number;
  benefit_description: string;
  benefit_frequency: string;
  passed_criteria: string[];
  failed_criteria: string[];
  edge_case_flags: string[];
  llm_edge_review?: string | null;
  friendly_explanation?: string | null;
  required_documents: string[];
  portal_url?: string | null;
  application_mode?: string | null;
  friction_score?: number;
}

export interface AgentEvent {
  step: 'PROFILE_EXTRACTION' | 'DETERMINISTIC_RULES' | 'EDGE_CASE_REVIEW' | 'SCHEME_RANKING' | 'CSC_LOCATOR' | 'MOCK_SUBMISSION' | 'EXPLANATION_GENERATION' | 'DELIVER' | string;
  status: 'STARTING' | 'IN_PROGRESS' | 'COMPLETED' | 'WARNING' | 'ERROR';
  message: string;
  data?: Record<string, any> | null;
  simulated?: boolean;
  timestamp: string; // ISO or HH:MM:SS format
}

export interface CscCenter {
  id?: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pin_code: string;
  phone: string;
  hours: string;
  maps_url: string;
  simulated: boolean;
  match_level?: 'pin' | 'prefix' | 'district' | 'state' | 'fallback';
  distance_km?: number;
  vle_name?: string;
  vle_rating?: number; // e.g. 4.9
  vle_rating_count?: number; // e.g. 142
  current_queue_length?: number; // e.g. 3
  predicted_wait_time_minutes?: number; // e.g. 12
  crowd_level?: 'LOW' | 'MODERATE' | 'BUSY';
  active_counters?: number; // e.g. 2
  facilities?: string[];
}

export interface CscAppointment {
  bookingId: string;
  centerId: string;
  centerName: string;
  vleName: string;
  vlePhone: string;
  address: string;
  citizenName: string;
  citizenPhone: string;
  serviceRequested: string;
  appointmentDate: string;
  appointmentTimeSlot: string;
  tokenNumber: string;
  estimatedWaitMinutes: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  qrCodeData: string;
  createdAt: string;
  simulated: boolean;
}

export interface AgentResponse {
  user_profile: UserProfile;
  eligible_schemes: SchemeEligibilityResult[];
  review_schemes: SchemeEligibilityResult[];
  ineligible_schemes: SchemeEligibilityResult[];
  total_potential_benefit_inr: number;
  summary_text: string;
  vernacular_summary?: string | null;
  csc_recommendation?: CscCenter | null;
  nearby_cscs?: CscCenter[] | null;
  mock_submission?: Record<string, any> | null;
  events: AgentEvent[];
  used_fallback?: boolean;
}
