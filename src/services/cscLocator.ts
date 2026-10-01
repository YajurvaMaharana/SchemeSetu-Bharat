import cscCentersData from '../data/cscCenters.json';
import { CscCenter, UserProfile } from '../types/agent';

export function findCsc(
  district?: string | null,
  pinCode?: string | null,
  state?: string | null
): CscCenter {
  const centers = cscCentersData as CscCenter[];

  // 1. Exact pin match
  if (pinCode) {
    const found = centers.find((c) => c.pin_code === pinCode.trim());
    if (found) {
      return {
        ...found,
        match_level: 'pin',
        distance_km: 1.4,
        vle_name: 'Rajesh Kumar Verma (CSC VLE)',
        facilities: [
          'Aadhaar Biometric e-KYC Device',
          'Khasra/Khatauni Land Record Printout',
          'Income & Caste Certificate Application Filing',
          'Ayushman Bharat PVC Card Printing',
        ],
        simulated: true,
      };
    }
  }

  // 2. 3-digit pin prefix match
  if (pinCode && pinCode.trim().length >= 3) {
    const prefix = pinCode.trim().slice(0, 3);
    const found = centers.find((c) => c.pin_code.startsWith(prefix));
    if (found) {
      return {
        ...found,
        match_level: 'prefix',
        distance_km: 3.2,
        vle_name: 'Amitabh Sharma (VLE Kendra)',
        facilities: [
          'Aadhaar Biometric e-KYC Device',
          'Khasra/Khatauni Land Record Printout',
          'DBT Bank Account Seeding',
          'Ayushman Card Desk',
        ],
        simulated: true,
      };
    }
  }

  // 3. Case-insensitive district match
  if (district) {
    let distLower = district.toLowerCase().trim();
    const distMap: Record<string, string> = {
      'chhatrapati sambhajinagar': 'aurangabad',
      bombay: 'mumbai',
      bengaluru: 'bengaluru rural',
      bangalore: 'bengaluru rural',
      poona: 'pune',
      banaras: 'varanasi',
      kashi: 'varanasi',
    };
    distLower = distMap[distLower] || distLower;

    const found = centers.find((c) => c.district.toLowerCase().trim() === distLower);
    if (found) {
      return {
        ...found,
        match_level: 'district',
        distance_km: 4.8,
        vle_name: 'Sunil Kumar (District Digital Kendra)',
        facilities: [
          'Aadhaar Biometric e-KYC Device',
          'Revenue Records & Form Submission',
          'CSC Direct Welfare Helpdesk',
        ],
        simulated: true,
      };
    }
  }

  // 4. Case-insensitive state match
  if (state) {
    const stateLower = state.toLowerCase().trim();
    const found = centers.find((c) => c.state.toLowerCase().trim() === stateLower);
    if (found) {
      return {
        ...found,
        match_level: 'state',
        distance_km: 8.5,
        vle_name: 'State Central Seva Desk',
        facilities: [
          'Aadhaar Biometric e-KYC Device',
          'Land & Revenue Documentation Support',
          'Direct Benefit Transfer Verification',
        ],
        simulated: true,
      };
    }
  }

  // 5. Fallback
  const pin = pinCode || '800001';
  const dist = district || 'Patna';
  return {
    name: `CSC Digital Seva Kendra - Center #${pin.slice(-3) || '101'}`,
    address: `Near Gram Panchayat Bhavan, Main Road, Block Center, Dist. ${dist}, PIN - ${pin}`,
    district: dist,
    state: state || 'Bihar',
    pin_code: pin,
    phone: '+91 98721 04512',
    hours: '09:00 AM - 06:00 PM (Mon - Sat)',
    maps_url: 'https://locator.csccloud.in',
    match_level: 'fallback',
    distance_km: 2.1,
    vle_name: 'Rajesh Kumar Verma (Village Level Entrepreneur)',
    facilities: [
      'Aadhaar Biometric e-KYC Device',
      'Khasra/Khatauni Land Record Printout',
      'Income/Caste Certificate Application Filing',
      'Ayushman Card PVC Printing',
    ],
    simulated: true,
  };
}

export function mockPortalSubmission(
  schemeId: string,
  profile: UserProfile
): {
  simulated: boolean;
  submission_id: string;
  acknowledgement_number: string;
  scheme_id: string;
  portal_endpoint: string;
  status: string;
  timestamp: string;
  applicant_snapshot: Partial<UserProfile>;
  next_step: string;
  message: string;
} {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randSub = Math.floor(100000 + Math.random() * 900000);
  const randAck1 = Math.floor(1000 + Math.random() * 9000);
  const randAck2 = Math.floor(10 + Math.random() * 90);

  return {
    simulated: true,
    submission_id: `GOI-${schemeId.toUpperCase()}-${dateStr}-${randSub}`,
    acknowledgement_number: `ACK-${randAck1}-${randAck2}`,
    scheme_id: schemeId,
    portal_endpoint: `https://api.gov.in/v2/welfare/${schemeId}/apply`,
    status: 'PRE_FILED_SUCCESS',
    timestamp: now.toISOString(),
    applicant_snapshot: {
      name: profile.name || 'Citizen Applicant',
      age: profile.age,
      occupation: profile.occupation,
      annual_income_inr: profile.annual_income_inr,
      land_hectares: profile.land_hectares,
      state: profile.state,
      pincode: profile.pincode,
    },
    next_step:
      'Present the acknowledgement number at nearest CSC or Tehsil for biometric Aadhaar e-KYC authentication.',
    message: 'Simulated government portal submission completed.',
  };
}
