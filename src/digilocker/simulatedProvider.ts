import {
  DigiLockerCallbackParams,
  DigiLockerDocument,
  DigiLockerProfile,
  DigiLockerProvider,
} from './types';

export const SIMULATED_RAMESH_PATIL_PROFILE: DigiLockerProfile = {
  name: 'Ramesh Patil',
  dob: '15/07/1986',
  gender: 'Male',
  aadhaarMasked: 'XXXX XXXX 4821',
  state: 'Maharashtra',
  district: 'Nashik',
  pin: '422001',
};

export const SIMULATED_DOCUMENTS: DigiLockerDocument[] = [
  {
    uri: 'in.gov.uidai-id-4821',
    type: 'Identity',
    name: 'Aadhaar Card (Masked)',
    issuer: 'Unique Identification Authority of India (UIDAI)',
    status: 'VERIFIED_SIMULATED',
    fetchedAt: new Date().toISOString(),
    docNumberMasked: 'XXXX XXXX 4821',
  },
  {
    uri: 'in.gov.maharashtra.revenue-inc-89412',
    type: 'Revenue',
    name: 'Income Certificate (Verified ₹80,000)',
    issuer: 'Revenue & Forest Department, Govt. of Maharashtra',
    status: 'VERIFIED_SIMULATED',
    fetchedAt: new Date().toISOString(),
    docNumberMasked: 'INC/MH/2026/89412',
  },
  {
    uri: 'in.gov.maharashtra.sdo-cst-51203',
    type: 'Social',
    name: 'Caste Certificate (OBC)',
    issuer: 'Sub-Divisional Officer (SDO), Nashik',
    status: 'VERIFIED_SIMULATED',
    fetchedAt: new Date().toISOString(),
    docNumberMasked: 'CST/MH/2024/51203',
  },
  {
    uri: 'in.gov.maharashtra.land-7-12-9182',
    type: 'Agriculture',
    name: 'Land Record (7/12 Extract, Verified 2.0 Acres)',
    issuer: 'Mahabhulekh / Revenue Department, Maharashtra',
    status: 'VERIFIED_SIMULATED',
    fetchedAt: new Date().toISOString(),
    docNumberMasked: 'MH/NSK/7-12/2024/9182',
  },
  {
    uri: 'in.gov.maharashtra.board-hsc-774129',
    type: 'Education',
    name: 'Class XII Marksheet',
    issuer: 'Maharashtra State Board of Secondary & Higher Secondary Education',
    status: 'VERIFIED_SIMULATED',
    fetchedAt: new Date().toISOString(),
    docNumberMasked: 'HSC/2004/774129',
  },
];

/**
 * SimulatedProvider: Fictional profile and simulated DigiLocker/MeriPehchan workflow
 * Sets a visible 'Simulated' ribbon and returns deterministic demo citizen Ramesh Patil.
 */
export class SimulatedProvider implements DigiLockerProvider {
  readonly mode: 'simulated' = 'simulated';
  readonly isSimulated: boolean = true;

  async startAuth(customState?: string): Promise<{ redirectUrl: string; verifier?: string; state?: string }> {
    const state = customState || `sim_state_${Date.now()}`;
    return {
      redirectUrl: `#/digilocker/simulated?state=${encodeURIComponent(state)}`,
      state,
      verifier: 'simulated_pkce_verifier',
    };
  }

  async handleCallback(_params: DigiLockerCallbackParams): Promise<{
    profile: DigiLockerProfile;
    documents: DigiLockerDocument[];
  }> {
    // Return Ramesh Patil profile and demo digital credentials
    return {
      profile: { ...SIMULATED_RAMESH_PATIL_PROFILE },
      documents: SIMULATED_DOCUMENTS.map((doc) => ({
        ...doc,
        fetchedAt: new Date().toISOString(),
      })),
    };
  }

  async fetchDocument(uri: string): Promise<DigiLockerDocument> {
    const found = SIMULATED_DOCUMENTS.find((d) => d.uri === uri || d.type.toLowerCase() === uri.toLowerCase());
    if (found) {
      return {
        ...found,
        fetchedAt: new Date().toISOString(),
      };
    }
    return {
      uri,
      type: 'General',
      name: 'Simulated Digital Record',
      issuer: 'National Digital Gateway (Simulated)',
      status: 'VERIFIED_SIMULATED',
      fetchedAt: new Date().toISOString(),
      docNumberMasked: 'SIM/2026/XXXX',
    };
  }

  async revoke(): Promise<void> {
    // Clear any simulated session keys
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('digilocker_pkce_verifier');
      window.sessionStorage.removeItem('digilocker_oauth_state');
      window.sessionStorage.removeItem('digilocker_simulated_session');
    }
  }
}
