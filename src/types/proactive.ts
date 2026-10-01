export type LifeEventType =
  | 'WEATHER_ALERT'
  | 'AADHAAR_UPDATE'
  | 'LAND_MUTATION'
  | 'ACADEMIC_RESULTS'
  | 'HEALTH_EVENT'
  | 'AGE_MILESTONE';

export interface LifeEvent {
  id: string;
  type: LifeEventType;
  icon: string;
  title: string;
  source: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'INFO';
  district: string;
  state: string;
  headline: string;
  description: string;
  impactSummary: string;
  matchedSchemeIds: string[];
  suggestedAction: string;
  metadata: Record<string, any>;
}

export interface SuggestedSchemePreview {
  schemeId: string;
  schemeName: string;
  benefitText: string;
  urgencyText?: string;
  actionUrl?: string;
}

export interface ProactiveWhatsAppMessage {
  id: string;
  lifeEventId: string;
  recipientName: string;
  recipientPhone: string;
  language: 'hi' | 'mr' | 'en';
  headline: string;
  messageText: string;
  vernacularSummary: string;
  schemesSuggested: SuggestedSchemePreview[];
  quickReplies: string[];
  generatedAt: string;
  isAiGenerated: boolean;
  sourceAuthority: string;
}
