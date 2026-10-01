/**
 * DigiLocker Module Types
 * Official DigiLocker Requester / MeriPehchan Specification Interfaces
 */

export interface DigiLockerProfile {
  name: string;
  dob: string;
  gender: string;
  aadhaarMasked: string;
  state: string;
  district: string;
  pin: string;
}

export interface DigiLockerDocument {
  type: string;
  name: string;
  issuer: string;
  uri: string;
  status: string;
  fetchedAt: string;
  docNumberMasked?: string;
}

export interface DigiLockerAuthResult {
  profile: DigiLockerProfile;
  documents: DigiLockerDocument[];
}

export interface DigiLockerCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
  [key: string]: any;
}

export interface DigiLockerProvider {
  readonly mode: 'simulated' | 'live';
  readonly isSimulated: boolean;
  startAuth(customState?: string): Promise<{ redirectUrl: string; verifier?: string; state?: string }>;
  handleCallback(params: DigiLockerCallbackParams): Promise<{
    profile: DigiLockerProfile;
    documents: DigiLockerDocument[];
  }>;
  fetchDocument(uri: string): Promise<DigiLockerDocument>;
  revoke(): Promise<void>;
}
