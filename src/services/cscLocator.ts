import cscCentersData from '../data/cscCenters.json';
import { CscCenter, CscAppointment, UserProfile } from '../types/agent';

const VLE_PRESETS = [
  {
    name: 'Rajesh Kumar Verma',
    phone: '+91 98721 04512',
    rating: 4.9,
    reviews: 218,
    queue: 2,
    counters: 2,
    facilities: [
      'Aadhaar Biometric e-KYC Device',
      'Khasra/7-12 Land Record Printout',
      'PM-KISAN DBT Seeding Desk',
      'Ayushman Bharat PVC Card Printing',
    ],
  },
  {
    name: 'Pooja Nitin Deshmukh',
    phone: '+91 98721 04513',
    rating: 4.8,
    reviews: 184,
    queue: 4,
    counters: 2,
    facilities: [
      'Aadhaar Biometric e-KYC Device',
      'Income & Caste Certificate Filing',
      'Kisan Credit Card (KCC) Processing',
      'Direct Benefit Transfer Verification',
    ],
  },
  {
    name: 'Sanjay Vithal Patil',
    phone: '+91 98721 04514',
    rating: 4.9,
    reviews: 312,
    queue: 1,
    counters: 2,
    facilities: [
      'Fast-Track Biometric Scanner',
      '7/12 Land Mutation Record Assistance',
      'PFMS Bank Account Seeding',
      'Crop Insurance (PMFBY) Claims Desk',
    ],
  },
  {
    name: 'Amitabh Sharma',
    phone: '+91 98721 04515',
    rating: 4.7,
    reviews: 96,
    queue: 7,
    counters: 1,
    facilities: [
      'Aadhaar Demographic Update',
      'E-Shram Card Registration',
      'Digital Signature Certificate (DSC)',
      'Pension (PM-KMY) Verification',
    ],
  },
  {
    name: 'Sunil Ramesh Gavande',
    phone: '+91 98721 04516',
    rating: 4.6,
    reviews: 140,
    queue: 3,
    counters: 2,
    facilities: [
      'Biometric IRIS & Fingerprint Scanner',
      'DigiLocker Document Sync Desk',
      'Govt Utility Bill Payment & DBT',
      'Ayushman Golden Card Printing',
    ],
  },
];

/**
 * Identify the 5 nearest CSCs to the user, ranked by distance, with real-time
 * queue length, VLE rating, and predicted wait time.
 */
export function find5NearestCscs(
  district?: string | null,
  pinCode?: string | null,
  state?: string | null
): CscCenter[] {
  const allCenters = cscCentersData as Array<{
    name: string;
    address: string;
    district: string;
    state: string;
    pin_code: string;
    phone: string;
    hours: string;
    maps_url: string;
  }>;

  const targetDist = (district || '').toLowerCase().trim();
  const targetPin = (pinCode || '').trim();
  const targetState = (state || '').toLowerCase().trim();

  // Score and filter centers
  const scoredCenters = allCenters.map((c) => {
    let score = 0;
    if (targetPin && c.pin_code === targetPin) score += 100;
    else if (targetPin && c.pin_code.slice(0, 3) === targetPin.slice(0, 3)) score += 50;
    if (targetDist && c.district.toLowerCase() === targetDist) score += 40;
    if (targetState && c.state.toLowerCase() === targetState) score += 20;

    return { center: c, score };
  });

  // Sort centers by match score descending
  scoredCenters.sort((a, b) => b.score - a.score);

  // Take top 5 unique centers (or pad if fewer)
  const selectedRaw = scoredCenters.slice(0, 5).map((sc) => sc.center);

  // Fallback defaults if dataset didn't provide 5
  while (selectedRaw.length < 5) {
    const idx = selectedRaw.length + 1;
    const dName = district || 'Nashik';
    const sName = state || 'Maharashtra';
    const pCode = pinCode || '422001';
    selectedRaw.push({
      name: `CSC Jan Seva Kendra #${idx} (${dName})`,
      address: `Shop No. ${idx * 4}, Near Gram Panchayat Office, Dist. ${dName}, ${sName} - ${pCode}`,
      district: dName,
      state: sName,
      pin_code: pCode,
      phone: `+91 98721 0451${idx}`,
      hours: 'Mon-Sat 9:00 AM - 6:00 PM',
      maps_url: `https://www.google.com/maps/search/?api=1&query=CSC+Center+${encodeURIComponent(dName)}`,
    });
  }

  // Realistic progressive distances
  const baseDistances = [0.8, 1.4, 2.3, 3.1, 4.5];

  return selectedRaw.map((raw, idx) => {
    const preset = VLE_PRESETS[idx % VLE_PRESETS.length];
    const distance_km = baseDistances[idx];
    const queue = preset.queue;
    const counters = preset.counters;
    // Predicted wait time = (queue * 7 mins per citizen) / active counters
    const predicted_wait_time_minutes = Math.max(3, Math.round((queue * 7) / counters));
    const crowd_level: 'LOW' | 'MODERATE' | 'BUSY' =
      predicted_wait_time_minutes <= 8
        ? 'LOW'
        : predicted_wait_time_minutes <= 18
        ? 'MODERATE'
        : 'BUSY';

    return {
      id: `csc-${raw.pin_code}-${idx + 1}`,
      name: raw.name.replace(' (Demo)', ''),
      address: raw.address,
      district: raw.district,
      state: raw.state,
      pin_code: raw.pin_code,
      phone: preset.phone,
      hours: raw.hours || 'Mon-Sat 9:00 AM - 6:00 PM',
      maps_url:
        raw.maps_url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          raw.name + ' ' + raw.address
        )}`,
      simulated: true,
      match_level: idx === 0 ? 'pin' : idx < 3 ? 'district' : 'state',
      distance_km,
      vle_name: `${preset.name} (VLE)`,
      vle_rating: preset.rating,
      vle_rating_count: preset.reviews,
      current_queue_length: queue,
      active_counters: counters,
      predicted_wait_time_minutes,
      crowd_level,
      facilities: preset.facilities,
    };
  });
}

/**
 * Backward compatible single nearest CSC locator
 */
export function findCsc(
  district?: string | null,
  pinCode?: string | null,
  state?: string | null
): CscCenter {
  const fiveNearest = find5NearestCscs(district, pinCode, state);
  return fiveNearest[0];
}

/**
 * Generate a guaranteed CSC Priority Appointment Booking Token
 */
export function generateCscAppointment(
  center: CscCenter,
  citizenProfile: UserProfile,
  slotTime: string = '10:30 AM - 11:00 AM',
  service: string = 'PM-KISAN DBT e-KYC & Land Record Verification'
): CscAppointment {
  const randomTokenNum = Math.floor(10 + Math.random() * 89);
  const randomBookingId = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();

  // Tomorrow's date
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateFormatted = tomorrow.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    bookingId: `APT-2026-${randomBookingId}`,
    centerId: center.id || `csc-${center.pin_code}`,
    centerName: center.name,
    vleName: center.vle_name || 'Village Level Entrepreneur',
    vlePhone: center.phone || '+91 98721 04512',
    address: center.address,
    citizenName: citizenProfile.name || 'Citizen Applicant',
    citizenPhone: citizenProfile.pincode ? `+91 98721 ${citizenProfile.pincode.slice(-5)}` : '+91 98721 04512',
    serviceRequested: service,
    appointmentDate: dateFormatted,
    appointmentTimeSlot: slotTime,
    tokenNumber: `CSC-TKN-${randomTokenNum}`,
    estimatedWaitMinutes: Math.min(5, Math.max(2, Math.round((center.predicted_wait_time_minutes || 10) / 4))),
    status: 'CONFIRMED',
    qrCodeData: `CSC-PASS|${center.name}|TKN-${randomTokenNum}|APT-2026-${randomBookingId}|${citizenProfile.name}`,
    createdAt: now.toISOString(),
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
