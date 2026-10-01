import schemesData from '../data/schemes.json';
import {
  EligibilityStatus,
  Scheme,
  SchemeEligibilityResult,
  UserProfile,
} from '../types/agent';

export const ACRES_TO_HECTARES = 0.4047;

export function normalizeProfile(raw: Partial<UserProfile>): UserProfile {
  const profile: UserProfile = {
    name: raw.name ?? null,
    age: raw.age ? Number(raw.age) : null,
    gender: raw.gender ?? null,
    state: raw.state ?? null,
    district: raw.district ?? null,
    pincode: raw.pincode ?? null,
    occupation: raw.occupation ?? null,
    annual_income_inr: raw.annual_income_inr !== undefined && raw.annual_income_inr !== null ? Math.round(Number(raw.annual_income_inr)) : null,
    land_hectares: raw.land_hectares !== undefined && raw.land_hectares !== null ? Number(raw.land_hectares) : null,
    land_acres: raw.land_acres !== undefined && raw.land_acres !== null ? Number(raw.land_acres) : null,
    has_land_ownership: raw.has_land_ownership ?? null,
    social_category: raw.social_category ?? 'General',
    housing_type: raw.housing_type ?? 'Pucca',
    is_taxpayer: Boolean(raw.is_taxpayer),
    is_govt_employee: Boolean(raw.is_govt_employee),
    has_pension_above_10k: Boolean(raw.has_pension_above_10k),
    is_shg_member: Boolean(raw.is_shg_member),
    is_student: Boolean(raw.is_student),
    special_conditions: Array.isArray(raw.special_conditions) ? raw.special_conditions : [],
    raw_query: raw.raw_query ?? null,
    preferred_language: raw.preferred_language ?? 'Hindi',
  };

  // Convert land units
  if (profile.land_acres !== null && profile.land_hectares === null) {
    profile.land_hectares = Number((profile.land_acres * ACRES_TO_HECTARES).toFixed(4));
  } else if (profile.land_hectares !== null && profile.land_acres === null) {
    profile.land_acres = Number((profile.land_hectares / ACRES_TO_HECTARES).toFixed(2));
  }

  return profile;
}

export function evaluateSingleScheme(
  profile: UserProfile,
  scheme: Scheme
): SchemeEligibilityResult {
  const passedCriteria: string[] = [];
  const failedCriteria: string[] = [];
  const edgeCaseFlags: string[] = [];

  const criteria = scheme.eligibility_criteria;
  const exclusions = criteria.exclusions ?? [];

  // 1. HARD EXCLUSIONS
  if (profile.is_taxpayer) {
    const taxExclusion = exclusions.some((ex) => ex.toLowerCase().includes('tax'));
    if (taxExclusion) {
      failedCriteria.push('Income Tax Payer exclusion: Statutory rules bar income taxpayers.');
    }
  }

  if (profile.is_govt_employee) {
    const govtExclusion = exclusions.some(
      (ex) => ex.toLowerCase().includes('government') || ex.toLowerCase().includes('govt')
    );
    if (govtExclusion) {
      failedCriteria.push('Government Employee exclusion: Serving or retired govt personnel barred.');
    }
  }

  if (profile.has_pension_above_10k) {
    const pensionExclusion = exclusions.some((ex) => ex.toLowerCase().includes('pension'));
    if (pensionExclusion) {
      failedCriteria.push('Pension ceiling exclusion: Pension exceeds statutory threshold of ₹10,000/mo.');
    }
  }

  // 2. GENDER RESTRICTIONS
  const requiredGender = criteria.gender;
  if (requiredGender && !['all', 'any'].includes(requiredGender.toLowerCase())) {
    if (profile.gender) {
      if (profile.gender.trim().toLowerCase() === requiredGender.toLowerCase()) {
        passedCriteria.push(`Gender requirement met: ${requiredGender}`);
      } else {
        failedCriteria.push(`Scheme restricted to ${requiredGender}; applicant is ${profile.gender}`);
      }
    } else {
      edgeCaseFlags.push(`Scheme specifically targets ${requiredGender}; gender unconfirmed in profile.`);
    }
  }

  // 3. AGE RESTRICTIONS
  const minAge = criteria.min_age;
  const maxAge = criteria.max_age;
  if (profile.age !== null && profile.age !== undefined) {
    if (minAge !== null && minAge !== undefined && profile.age < minAge) {
      failedCriteria.push(`Applicant age (${profile.age}) is below minimum requirement (${minAge} years).`);
    } else if (maxAge !== null && maxAge !== undefined && profile.age > maxAge) {
      failedCriteria.push(`Applicant age (${profile.age}) exceeds maximum ceiling (${maxAge} years).`);
    } else {
      const ageDesc: string[] = [];
      if (minAge !== null && minAge !== undefined) ageDesc.push(`>=${minAge}`);
      if (maxAge !== null && maxAge !== undefined) ageDesc.push(`<=${maxAge}`);
      passedCriteria.push(`Age criteria met (${profile.age} yrs within ${ageDesc.join(' and ')}).`);
    }
  } else if (minAge !== null || maxAge !== null) {
    passedCriteria.push('Age requirement assumed subject to Aadhaar verification.');
  }

  // 4. OCCUPATION MATCHING
  const allowedOccupations = (criteria.occupations ?? ['any']).map((o) => o.toLowerCase());
  if (!allowedOccupations.includes('any')) {
    const userOcc = (profile.occupation ?? '').toLowerCase().trim();
    const farmerSynonyms = ['farmer', 'kisan', 'krishi', 'cultivator', 'agriculture', 'kheti', 'agricultural labourer'];
    const studentSynonyms = ['student', 'vidyarthi', 'scholar', 'chhatra'];
    const artisanSynonyms = ['artisan', 'karigar', 'weaver', 'carpenter', 'tailor', 'blacksmith', 'handicraft'];

    const isFarmer =
      farmerSynonyms.some((s) => userOcc.includes(s)) ||
      (profile.land_hectares !== null && profile.land_hectares !== undefined && profile.land_hectares > 0);
    const isStudent = studentSynonyms.some((s) => userOcc.includes(s)) || Boolean(profile.is_student);
    const isArtisan = artisanSynonyms.some((s) => userOcc.includes(s));

    let matchFound = false;
    for (const allowed of allowedOccupations) {
      if (allowed.includes('farmer') && isFarmer) {
        matchFound = true;
        break;
      }
      if (allowed.includes('student') && isStudent) {
        matchFound = true;
        break;
      }
      if (
        (allowed.includes('artisan') || allowed.includes('self-employed')) &&
        (isArtisan || userOcc.includes('self') || userOcc.includes('business') || userOcc.includes('shop'))
      ) {
        matchFound = true;
        break;
      }
      if (userOcc && (allowed.includes(userOcc) || userOcc.includes(allowed))) {
        matchFound = true;
        break;
      }
    }

    if (matchFound) {
      passedCriteria.push(`Occupation criterion met (${profile.occupation || 'Agricultural landholder'}).`);
    } else if (!userOcc) {
      edgeCaseFlags.push(`Scheme targets ${(criteria.occupations ?? []).join(', ')}; occupation self-declaration needed.`);
    } else {
      failedCriteria.push(`Occupation (${profile.occupation}) does not match scheme target: ${(criteria.occupations ?? []).join(', ')}.`);
    }
  }

  // 5. LANDHOLDING REQUIREMENTS
  const requiresLand = criteria.requires_land_ownership ?? false;
  const minLand = criteria.min_land_hectares;
  const maxLand = criteria.max_land_hectares;

  const specialCondsStr = (profile.special_conditions ?? []).join(' ').toLowerCase();
  const hasJointLand = specialCondsStr.includes('joint') || specialCondsStr.includes('ancestral') || specialCondsStr.includes('khatauni');
  const isTenantFarmer = specialCondsStr.includes('tenant') || specialCondsStr.includes('sharecropper') || specialCondsStr.includes('bataidar');

  if (requiresLand) {
    if (profile.has_land_ownership === false) {
      failedCriteria.push('Scheme mandates legal title to agricultural land. Profile indicates no land ownership.');
    } else if (profile.land_hectares !== null && profile.land_hectares !== undefined && profile.land_hectares <= 0) {
      failedCriteria.push('Agricultural landholding must be greater than 0 hectares.');
    } else if (isTenantFarmer && scheme.id === 'pm_kisan') {
      failedCriteria.push('PM-KISAN statutory rules exclude tenant farmers/sharecroppers without recorded ownership.');
    } else {
      if (hasJointLand) {
        edgeCaseFlags.push('Joint land title / undivided ancestral Khatauni requires co-owner partition or affidavit.');
      }
      passedCriteria.push('Land ownership requirement verified or declared.');
    }
  }

  if (profile.land_hectares !== null && profile.land_hectares !== undefined) {
    if (minLand !== null && minLand !== undefined && profile.land_hectares < minLand) {
      failedCriteria.push(`Landholding (${profile.land_hectares} ha) is below scheme minimum (${minLand} ha).`);
    }
    if (maxLand !== null && maxLand !== undefined) {
      if (profile.land_hectares > maxLand) {
        if (profile.land_hectares <= maxLand * 1.10) {
          edgeCaseFlags.push(
            `Landholding (${profile.land_hectares.toFixed(2)} ha) slightly exceeds ${maxLand} ha ceiling within 10% survey tolerance.`
          );
        } else {
          failedCriteria.push(
            `Landholding (${profile.land_hectares.toFixed(2)} ha) exceeds statutory ceiling of ${maxLand} ha.`
          );
        }
      } else {
        passedCriteria.push(`Landholding (${profile.land_hectares.toFixed(2)} ha) is within permissible limit of ${maxLand} ha.`);
      }
    }
  }

  // 6. ANNUAL INCOME THRESHOLD
  const maxIncome = criteria.max_annual_income_inr;
  if (maxIncome !== null && maxIncome !== undefined && profile.annual_income_inr !== null && profile.annual_income_inr !== undefined) {
    if (profile.annual_income_inr > maxIncome) {
      if (profile.annual_income_inr <= maxIncome * 1.10) {
        edgeCaseFlags.push(
          `Income (₹${profile.annual_income_inr.toLocaleString('en-IN')}) is within 10% margin of ₹${maxIncome.toLocaleString('en-IN')} threshold; net taxable vs gross deductions review required.`
        );
      } else {
        failedCriteria.push(
          `Annual income (₹${profile.annual_income_inr.toLocaleString('en-IN')}) exceeds maximum ceiling of ₹${maxIncome.toLocaleString('en-IN')}.`
        );
      }
    } else {
      passedCriteria.push(`Annual income (₹${profile.annual_income_inr.toLocaleString('en-IN')}) complies with ceiling of ₹${maxIncome.toLocaleString('en-IN')}.`);
    }
  }

  // 7. HOUSING DWELLING TYPE
  const housingAllowed = criteria.housing_type_allowed;
  if (housingAllowed && housingAllowed.length > 0) {
    const userHousing = (profile.housing_type || 'Pucca').trim().toLowerCase();
    const isAllowed = housingAllowed.some((h) => h.toLowerCase() === userHousing);
    if (isAllowed) {
      passedCriteria.push(`Housing dwelling status (${profile.housing_type}) satisfies scheme criteria.`);
    } else {
      if (housingAllowed.some((h) => h.toLowerCase() === 'kutcha') && userHousing === 'pucca') {
        failedCriteria.push('Scheme strictly requires Kutcha house or homelessness; applicant owns Pucca structure.');
      } else {
        edgeCaseFlags.push(`Housing status (${profile.housing_type}) requires physical Gram Sabha verification.`);
      }
    }
  }

  // 8. SOCIAL CATEGORY
  const allowedCategories = criteria.social_categories_allowed ?? ['All'];
  if (!allowedCategories.includes('All')) {
    const userCat = (profile.social_category || '').trim();
    if (allowedCategories.includes(userCat)) {
      passedCriteria.push(`Social category (${userCat}) qualifies under reservation guidelines.`);
    } else if (userCat) {
      failedCriteria.push(`Category (${userCat}) does not meet scheme requirements (${allowedCategories.join(', ')}).`);
    } else {
      edgeCaseFlags.push(`Scheme requires category in ${allowedCategories.join(', ')}; caste certificate verification needed.`);
    }
  }

  // 9. STATE APPLICABILITY
  const applicableStates = criteria.states_applicable ?? ['All'];
  if (!applicableStates.includes('All') && profile.state) {
    const isStateAllowed = applicableStates.some(
      (s) => s.toLowerCase() === profile.state!.trim().toLowerCase()
    );
    if (isStateAllowed) {
      passedCriteria.push(`Applicant state (${profile.state}) is within operational jurisdiction.`);
    } else {
      failedCriteria.push(`Scheme not applicable in state: ${profile.state}.`);
    }
  }

  // 10. FINAL STATUS
  let status: EligibilityStatus = EligibilityStatus.ELIGIBLE;
  if (failedCriteria.length > 0) {
    status = 'NOT_ELIGIBLE';
  } else if (edgeCaseFlags.length > 0) {
    status = 'NEEDS_REVIEW';
  } else {
    status = 'ELIGIBLE';
  }

  // Calculate friction score based on docs and criteria
  let friction = 1;
  if (scheme.required_documents.length >= 4 || scheme.id === 'pmay_g' || scheme.id === 'nsp_post_matric') {
    friction = 3;
  } else if (scheme.required_documents.length >= 3 || scheme.id === 'lakhpati_didi' || scheme.id === 'mudra_shishu') {
    friction = 2;
  }
  if (scheme.id === 'ayushman_bharat' || scheme.id === 'pm_kisan') {
    friction = 1;
  }

  return {
    scheme_id: scheme.id,
    scheme_name: scheme.name,
    scheme_name_hi: scheme.name_hi,
    category: scheme.category,
    status,
    benefit_amount_inr: scheme.benefit_amount_inr,
    benefit_description: scheme.benefit_description,
    benefit_frequency: scheme.benefit_frequency,
    passed_criteria: passedCriteria,
    failed_criteria: failedCriteria,
    edge_case_flags: edgeCaseFlags,
    required_documents: scheme.required_documents,
    portal_url: scheme.portal_url,
    application_mode: scheme.application_mode,
    friction_score: friction,
  };
}

export function evaluateAllSchemes(
  profile: UserProfile,
  schemes: Scheme[] = schemesData as Scheme[]
): {
  eligible: SchemeEligibilityResult[];
  review: SchemeEligibilityResult[];
  ineligible: SchemeEligibilityResult[];
} {
  const normProfile = normalizeProfile(profile);
  const eligible: SchemeEligibilityResult[] = [];
  const review: SchemeEligibilityResult[] = [];
  const ineligible: SchemeEligibilityResult[] = [];

  for (const scheme of schemes) {
    const res = evaluateSingleScheme(normProfile, scheme);
    if (res.status === 'ELIGIBLE') {
      eligible.push(res);
    } else if (res.status === 'NEEDS_REVIEW') {
      review.push(res);
    } else {
      ineligible.push(res);
    }
  }

  // Sort descending by benefit value (₹)
  eligible.sort((a, b) => b.benefit_amount_inr - a.benefit_amount_inr);
  review.sort((a, b) => b.benefit_amount_inr - a.benefit_amount_inr);
  ineligible.sort((a, b) => b.benefit_amount_inr - a.benefit_amount_inr);

  return { eligible, review, ineligible };
}
