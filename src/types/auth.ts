import { UserProfile } from './agent';

export interface UserDocument {
  id: string;
  type: string;
  name: string;
  name_hi?: string;
  name_mr?: string;
  status: 'VERIFIED_SIMULATED';
  issuedBy: string;
  fetchedAt: string;
  docNumberMasked?: string;
}

export interface AuthUser {
  name: string;
  mobile?: string;
  email?: string;
  language: 'hi' | 'mr' | 'en';
  authMethod: 'otp' | 'digilocker' | 'google';
  profile: Partial<UserProfile>;
  documents: UserDocument[];
  aadhaar_masked?: string;
}

export interface AuthState {
  status: 'guest' | 'signedIn';
  user: AuthUser | null;
}
