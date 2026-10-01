import { ACRES_TO_HECTARES, normalizeProfile } from './rulesEngine';
import { UserProfile } from '../types/agent';

export function heuristicExtractProfile(text: string): UserProfile {
  const profileDict: Partial<UserProfile> = {
    raw_query: text,
    special_conditions: [],
    is_taxpayer: false,
    is_govt_employee: false,
    has_pension_above_10k: false,
    is_shg_member: false,
    is_student: false,
  };

  const t = text.toLowerCase();

  // 1. Pincode
  const pinMatch = text.match(/\b([1-9][0-9]{5})\b/);
  if (pinMatch) {
    profileDict.pincode = pinMatch[1];
  }

  // 2. Age
  const ageMatch =
    t.match(/(?:age|उम्र|आयु|वर्ष|साल)\s*[:=-]?\s*(\d{1,2})/) ||
    t.match(/(\d{1,2})\s*(?:साल|saal|year|years|वर्ष)/);
  if (ageMatch) {
    const val = ageMatch[1] || ageMatch[2];
    if (val) {
      profileDict.age = parseInt(val, 10);
    }
  }

  // 3. Gender
  if (['महिला', 'female', 'woman', 'ladki', 'aurat', 'स्त्री'].some((w) => t.includes(w))) {
    profileDict.gender = 'Female';
  } else if (['पुरुष', 'male', 'man', 'purush', 'aadmi', 'लड़का'].some((w) => t.includes(w))) {
    profileDict.gender = 'Male';
  }

  // 4. Occupation
  if (['kisan', 'farmer', 'किसान', 'खेती', 'agriculture', 'काश्तकार'].some((w) => t.includes(w))) {
    profileDict.occupation = 'Farmer';
  } else if (['student', 'विद्यार्थी', 'छात्र', 'padhai', 'college'].some((w) => t.includes(w))) {
    profileDict.occupation = 'Student';
    profileDict.is_student = true;
  } else if (['majdoor', 'labourer', 'मजदूर', 'daily wage', 'दिहाड़ी'].some((w) => t.includes(w))) {
    profileDict.occupation = 'Daily Wage Worker';
  } else if (['artisan', 'karigar', 'कारीगर', 'weaver', 'bunker', 'tailor', 'दर्जी'].some((w) => t.includes(w))) {
    profileDict.occupation = 'Artisan';
  } else if (['shop', 'business', 'दुकान', 'व्यापार', 'self employed', 'स्वरोजगार'].some((w) => t.includes(w))) {
    profileDict.occupation = 'Self-Employed';
  }

  // 5. Landholding
  const landMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:एकड़|acre|acres|एकड)/);
  if (landMatch) {
    const acres = parseFloat(landMatch[1]);
    profileDict.land_acres = acres;
    profileDict.land_hectares = Number((acres * ACRES_TO_HECTARES).toFixed(4));
    profileDict.has_land_ownership = true;
  } else {
    const haMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:hectare|hectares|हेक्टेयर|ha)\b/);
    if (haMatch) {
      const ha = parseFloat(haMatch[1]);
      profileDict.land_hectares = ha;
      profileDict.land_acres = Number((ha / ACRES_TO_HECTARES).toFixed(2));
      profileDict.has_land_ownership = true;
    } else if (['भूमिहीन', 'landless', 'no land', 'जमीन नहीं'].some((w) => t.includes(w))) {
      profileDict.land_hectares = 0.0;
      profileDict.has_land_ownership = false;
    }
  }

  // 6. Income
  const lakhMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)/);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    profileDict.annual_income_inr = Math.round(val * 100000);
  } else if (t.includes('डेढ़ लाख') || t.includes('dedh lakh')) {
    profileDict.annual_income_inr = 150000;
  } else if (t.includes('ढाई लाख')) {
    profileDict.annual_income_inr = 250000;
  } else {
    const thousMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:हजार|hazar|k\b|thousand)/);
    if (thousMatch) {
      const val = parseFloat(thousMatch[1]);
      const rawVal = Math.round(val * 1000);
      if (['month', 'महीना', 'monthly', 'प्रति माह'].some((w) => t.includes(w))) {
        profileDict.annual_income_inr = rawVal * 12;
      } else {
        profileDict.annual_income_inr = rawVal;
      }
    } else {
      const numMatch = t.match(/(?:आय|income|kamai|कमाई)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{4,7})/);
      if (numMatch) {
        profileDict.annual_income_inr = parseInt(numMatch[1], 10);
      }
    }
  }

  // 7. Social Category
  if (/\b(sc|dalit)\b/i.test(t) || t.includes('अनुसूचित जाति')) {
    profileDict.social_category = 'SC';
  } else if (/\b(st|adivasi)\b/i.test(t) || t.includes('अनुसूचित जनजाति')) {
    profileDict.social_category = 'ST';
  } else if (/\b(obc)\b/i.test(t) || t.includes('पिछड़ा') || t.includes('other backward')) {
    profileDict.social_category = 'OBC';
  } else if (/\b(general)\b/i.test(t) || t.includes('सामान्य') || t.includes('सवर्ण')) {
    profileDict.social_category = 'General';
  }

  // 8. Housing
  if (['kutcha', 'kuchha', 'कच्चा', 'झोपड़ी', 'kachha', 'kacha', 'tin sheet', 'jhuggi'].some((w) => t.includes(w))) {
    profileDict.housing_type = 'Kutcha';
  } else if (['pucca', 'पक्का', 'brick'].some((w) => t.includes(w))) {
    profileDict.housing_type = 'Pucca';
  } else if (['homeless', 'बेघर'].some((w) => t.includes(w))) {
    profileDict.housing_type = 'Homeless';
  } else if (['rent', 'किराये', 'kiraya'].some((w) => t.includes(w))) {
    profileDict.housing_type = 'Rented';
  }

  // 9. Exclusions & Special conditions
  if (['tax', 'आयकर', 'taxpayer', 'टैक्स'].some((w) => t.includes(w))) {
    if (!['no tax', 'tax nahi', 'टैक्स नहीं', 'tax free'].some((neg) => t.includes(neg))) {
      profileDict.is_taxpayer = true;
    }
  }

  if (['sarkari', 'govt', 'सरकारी नौकरी', 'government'].some((w) => t.includes(w))) {
    if (!['not govt', 'no govt', 'सरकारी नहीं'].some((neg) => t.includes(neg))) {
      profileDict.is_govt_employee = true;
    }
  }

  if (['pension', 'पेंशन'].some((w) => t.includes(w))) {
    if (['>10000', '10000 se zyada', '15000', '12000'].some((w) => t.includes(w))) {
      profileDict.has_pension_above_10k = true;
    }
  }

  if (['shg', 'स्वयं सहायता', 'samuh', 'bachat gat'].some((w) => t.includes(w))) {
    profileDict.is_shg_member = true;
  }

  if (['joint', 'संयुक्त', 'khatauni', 'bhaiyo ke sath', 'hissedari'].some((w) => t.includes(w))) {
    profileDict.special_conditions!.push('joint land ownership');
  }

  if (['bataidar', 'बटाईदार', 'tenant', 'kirayedari kheti'].some((w) => t.includes(w))) {
    profileDict.special_conditions!.push('tenant farmer');
  }

  // 10. State Detection
  const stateMap: Record<string, string> = {
    bihar: 'Bihar', 'बिहार': 'Bihar',
    'uttar pradesh': 'Uttar Pradesh', 'उत्तर प्रदेश': 'Uttar Pradesh', up: 'Uttar Pradesh',
    maharashtra: 'Maharashtra', 'महाराष्ट्र': 'Maharashtra',
    'madhya pradesh': 'Madhya Pradesh', 'मध्य प्रदेश': 'Madhya Pradesh', mp: 'Madhya Pradesh',
    rajasthan: 'Rajasthan', 'राजस्थान': 'Rajasthan',
    punjab: 'Punjab', 'पंजाब': 'Punjab',
    haryana: 'Haryana', 'हरियाणा': 'Haryana',
    'west bengal': 'West Bengal', 'पश्चिम बंगाल': 'West Bengal',
    gujarat: 'Gujarat', 'गुजरात': 'Gujarat',
    odisha: 'Odisha', 'ओडिशा': 'Odisha', 'उड़ीसा': 'Odisha',
    jharkhand: 'Jharkhand', 'झारखंड': 'Jharkhand',
    karnataka: 'Karnataka', 'कर्नाटक': 'Karnataka',
    'tamil nadu': 'Tamil Nadu', 'तमिलनाडु': 'Tamil Nadu',
    kerala: 'Kerala', 'केरल': 'Kerala',
    telangana: 'Telangana', 'तेलंगाना': 'Telangana',
    'andhra pradesh': 'Andhra Pradesh', 'आंध्र प्रदेश': 'Andhra Pradesh',
    assam: 'Assam', 'असम': 'Assam',
    chhattisgarh: 'Chhattisgarh', 'छत्तीसगढ़': 'Chhattisgarh',
    uttarakhand: 'Uttarakhand', 'उत्तराखंड': 'Uttarakhand',
    'himachal pradesh': 'Himachal Pradesh', 'हिमाचल प्रदेश': 'Himachal Pradesh',
  };

  for (const [key, standardName] of Object.entries(stateMap)) {
    if (t.includes(key)) {
      profileDict.state = standardName;
      break;
    }
  }

  // Language detection
  const hasHindiChars = /[\u0900-\u097F]/.test(text);
  profileDict.preferred_language = hasHindiChars ? 'Hindi' : 'English';

  return normalizeProfile(profileDict);
}

export function generateFallbackEdgeReview(schemeName: string, edgeFlags: string[]): string {
  const guidanceNotes: string[] = [];
  const flagsText = edgeFlags.join(' ').toLowerCase();

  if (flagsText.includes('joint') || flagsText.includes('khatauni')) {
    guidanceNotes.push(
      'संयुक्त भूमि (Joint Landholding): ग्राम लेखपाल/पटवारी से सह-खातेदार अनापत्ति प्रमाण पत्र (NOC Affidavit) एवं अलग अंश निर्धारण अनिवार्य है।'
    );
  }
  if (flagsText.includes('tolerance') || flagsText.includes('landholding')) {
    guidanceNotes.push(
      'सीमांत भूमि सत्यापन (Land Boundary): खतौनी में दर्ज रकबा योजना की सीमा से अत्यंत निकट है; तहसील से प्रमाणित खसरा नकल प्रस्तुत करें।'
    );
  }
  if (flagsText.includes('income') || flagsText.includes('taxable')) {
    guidanceNotes.push(
      'आय सत्यापन (Income Threshold): सकल आय सीमा के निकट है; तहसीलदार द्वारा जारी वैध आय प्रमाण पत्र (Income Certificate) संलग्न करना होगा।'
    );
  }
  if (flagsText.includes('gender') || flagsText.includes('occupation') || flagsText.includes('caste')) {
    guidanceNotes.push(
      'दस्तावेज़ सत्यापन (Verification Required): संबंधित पात्रता श्रेणी के लिए स्व-घोषणा पत्र एवं अधिकृत पहचान पत्र अनिवार्य है।'
    );
  }

  if (guidanceNotes.length === 0) {
    guidanceNotes.push(
      `यह आवेदन '${schemeName}' की विशेष शर्तों के अधीन है। कृपया सीएससी (CSC) केंद्र पर मूल दस्तावेजों के साथ भौतिक सत्यापन कराएं।`
    );
  }

  return guidanceNotes.join(' | ');
}

export function generateFallbackSummary(
  profile: UserProfile,
  eligible: Array<{ scheme_name: string; scheme_name_hi?: string | null; benefit_amount_inr: number; required_documents: string[] }>,
  review: Array<{ scheme_name: string; scheme_name_hi?: string | null; benefit_amount_inr: number; required_documents: string[] }>
): string {
  const totalBenefit = eligible.reduce((acc, s) => acc + s.benefit_amount_inr, 0);
  const eligibleNames = eligible.map((s) => s.scheme_name_hi || s.scheme_name);
  const reviewNames = review.map((s) => s.scheme_name_hi || s.scheme_name);

  const lines: string[] = [];
  lines.push(`🙏 नमस्ते! आपकी पात्रता के विश्लेषण के अनुसार:`);
  lines.push(`• कुल संभावित सरकारी लाभ: ₹${totalBenefit.toLocaleString('en-IN')} तक`);
  lines.push(`• तुरंत पात्र योजनाएं (${eligible.length}): ${eligibleNames.length ? eligibleNames.join(', ') : 'कोई नहीं'}`);

  if (review.length > 0) {
    lines.push(`• सत्यापन के अधीन योजनाएं (${review.length}): ${reviewNames.join(', ')}`);
    lines.push('  (इन योजनाओं के लिए तहसील या सीएससी केंद्र पर अतिरिक्त दस्तावेज़ जैसे खतौनी/आय प्रमाण पत्र की आवश्यकता होगी।)');
  }

  lines.push('\n📋 आवश्यक मुख्य दस्तावेज़:');
  const allDocs = new Set<string>();
  for (const s of [...eligible, ...review]) {
    for (const d of s.required_documents.slice(0, 2)) {
      allDocs.add(d);
    }
  }
  for (const doc of Array.from(allDocs).slice(0, 5)) {
    lines.push(`  ✓ ${doc}`);
  }

  lines.push('\n👉 अगला कदम: नजदीकी कॉमन सर्विस सेंटर (CSC) पर जाएं या ऑनलाइन पोर्टल के माध्यम से आवेदन करें।');
  return lines.join('\n');
}
