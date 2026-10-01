import { UserProfile } from '../types/agent';
import { normalizeProfile, evaluateAllSchemes } from './rulesEngine';

export type SupportedDialect =
  | 'bhojpuri'
  | 'marwari'
  | 'maithili'
  | 'awadhi'
  | 'hindi'
  | 'marathi';

export interface DialectInfo {
  id: SupportedDialect;
  name: string;
  nativeName: string;
  region: string;
  flagEmoji: string;
  sampleAudioPrompt: string;
  sampleTranscript: string;
  sampleResponse: string;
}

export const SUPPORTED_DIALECTS: DialectInfo[] = [
  {
    id: 'bhojpuri',
    name: 'Bhojpuri',
    nativeName: 'भोजपुरी',
    region: 'Eastern UP, Bihar & Jharkhand',
    flagEmoji: '🌾',
    sampleAudioPrompt: 'हमार नाम रामेश यादव ह, हमर 2 एकड़ खेत बा, हमरा कवन-कवन सरकारी योजना मिली?',
    sampleTranscript: 'प्रणाम! हमार नाम रामेश यादव ह। हम बिहार के किसान बानी, हमर 2 एकड़ खेत बा। हमरा खातिर कवन सरकारी योजना बा?',
    sampleResponse: 'रामेश भईया प्रणाम! रउआ खातिर खुशबरी बा। रउआ 2 एकड़ खेत के किसान बानी, एहिसे रउआ के "पीएम-किसान सम्मान निधि" में हर साल 6,000 रुपिया सीधे बैंक खाता में मिली। साथे-साधे खाद-बीज खातिर 3 लाख तक "किसान क्रेडिट कार्ड (KCC)" 4% ब्याज पर मिल जाई। रउआ लगे कच्चा घर बा त "पीएम आवास योजना" में 1 लाख 20 हजार रुपिया मकान बनावे खातिर मिली। अपना आधार कार्ड आ जमीन के रसीद लेके नजदीकी सीएससी केंद्र पर जाईं!',
  },
  {
    id: 'marwari',
    name: 'Marwari',
    nativeName: 'मारवाड़ी / राजस्थानी',
    region: 'Rajasthan (Marwar, Shekhawati, Mewar)',
    flagEmoji: '🐪',
    sampleAudioPrompt: 'म्हारो नाम कानाराम है, म्हारै 2 बीघा जमीन है, म्हांनै सरकार री कांई योजना मिल सके?',
    sampleTranscript: 'खम्मा घणी सा! म्हारो नाम कानाराम है। म्हारै 2 बीघा जमीन है अर म्हे खेती करां। म्हांनै सरकार री कांई-कांई योजनावां रो लाभ मिल सके?',
    sampleResponse: 'खम्मा घणी कानाराम जी सा! थारे खातर सरकार री घणी घणी योजनावां री सौगात है। थारे दो बीघा जमीन है, ई वास्ते थानै "पीएम-किसान सम्मान निधि" रो ₹6,000 हर साल सीधो बैंक खाता मांय मिलेला। फसल रो काम वास्ते "किसान क्रेडिट कार्ड (KCC)" मांय ₹3,00,000 री सस्ती पत (लिमिट) मिल जावेली। थारे परिवार वास्ते "आयुष्मान भारत" मांय ₹5 लाख रो मुफ्त इलाज रो सुरक्षा कवच भी है। थारो आधार अर जमाबंदी ले’र तुरंत जन सेवा केंद्र (CSC) पधारो सा!',
  },
  {
    id: 'maithili',
    name: 'Maithili',
    nativeName: 'मैथिली',
    region: 'Mithila Region, North Bihar',
    flagEmoji: '🪷',
    sampleAudioPrompt: 'हमर नाम विद्यानंद झा अछि, हमर 1.5 बीघा खेत अछि, कोनो योजना भेटत?',
    sampleTranscript: 'प्रणाम! हमर नाम विद्यानंद झा अछि। हमर 1.5 बीघा खेत अछि आ हम किसानी करैत छी। हमरा लेल सरकारक कोन कोन योजना अछि?',
    sampleResponse: 'प्रणाम झा जी! अहाँक लेल सरकारक बहुत पैघ योजना अछि। अहाँक 1.5 बीघा खेत अछि, एहि लेल अहाँके "पीएम-किसान सम्मान निधि" मे प्रति वर्ष ₹6,000 टका भेटत। एहि सं संगे "किसान क्रेडिट कार्ड" पर ३ लाख टका धरि ऋण भेटत। अहाँक राशन कार्ड पर ₹5 लाख टका धरिक मुफ्त इलाजक "आयुष्मान कार्ड" सेहो बनत। अहाँ तुरंत नजदीकी सीएससी सेन्टर पर संपर्क करू!',
  },
  {
    id: 'awadhi',
    name: 'Awadhi',
    nativeName: 'अवधी',
    region: 'Ayodhya, Lucknow & Central UP',
    flagEmoji: '🕉️',
    sampleAudioPrompt: 'हमार नाम राम लखन अहइ, हमार दुइ बीघा खेत बा, सरकारी सहायता कइसे मिली?',
    sampleTranscript: 'राम राम! हमार नाम राम लखन अहइ। हमरे लगे दुइ बीघा खेत बा अउर हम किसानी करत हन। हमका कौन सरकारी योजना के लाभ मिल सकत है?',
    sampleResponse: 'राम राम राम लखन भैया! आपके बरे सरकार के तरफ से बहुतै नीक योजना बा। आपके लगे दुइ बीघा खेत बा, यह बरे आपको "पीएम-किसान सम्मान निधि" से हर साल ₹6,000 मिली। फसल के लागत बरे ₹3 लाख तक "किसान क्रेडिट कार्ड" मिली। अगर कच्चा घर बा तव "पीएम आवास योजना" मा ₹1,20,000 के अनुदान मिली। अपना आधार अउर खतौनी लइके तुरंत जन सेवा केंद्र जाव!',
  },
  {
    id: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'National Standard (North & Central India)',
    flagEmoji: '🇮🇳',
    sampleAudioPrompt: 'मेरा नाम रमेश कुमार है, मैं 2 एकड़ का छोटा किसान हूँ, मुझे कौन सी योजना मिलेगी?',
    sampleTranscript: 'नमस्ते, मेरा नाम रमेश कुमार है। मैं 2 एकड़ जमीन पर खेती करता हूँ और मेरी सालाना आय 80 हजार है। मुझे कौन सी योजनाएं मिल सकती हैं?',
    sampleResponse: 'नमस्ते रमेश जी! आपके विवरण के अनुसार आप "पीएम-किसान सम्मान निधि" के पात्र हैं जिसमें आपको ₹6,000 प्रति वर्ष मिलेंगे। साथ ही खेती के लिए ₹3,00,000 की लिमिट वाला "किसान क्रेडिट कार्ड (KCC)" और पूरे परिवार के लिए ₹5,00,000 का "आयुष्मान भारत" स्वास्थ्य बीमा मिलेगा। अपना आधार और खतौनी लेकर नजदीकी सीएससी केंद्र जाएं!',
  },
  {
    id: 'marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'Maharashtra & Goa',
    flagEmoji: '🚩',
    sampleAudioPrompt: 'माझं नाव रमेश पाटील आहे, माझी २ एकर शेती आहे, मला कोणती योजना मिळेल?',
    sampleTranscript: 'नमस्कार! माझं नाव रमेश पाटील आहे, नाशिक जिल्ह्यात राहतो. माझी २ एकर शेती आहे. मला शासनाच्या कोणत्या योजना मिळतील?',
    sampleResponse: 'नमस्कार रमेशजी! आपल्यासाठी शासनाच्या प्रमुख योजना उपलब्ध आहेत. आपण अल्पभूधारक शेतकरी असल्याने आपल्याला "पीएम-किसान सन्मान निधी" अंतर्गत दरवर्षी ₹६,००० थेट बँक खात्यात मिळतील. याशिवाय पिकासाठी ₹३ लाखांपर्यंतचे "किसान क्रेडिट कार्ड (KCC)" आणि कुटुंबासाठी ₹५ लाखांचे "आयुष्मान भारत" आरोग्य कवच मिळेल. आपला ७/१२ उतारा आणि आधार घेऊन जवळच्या सीएससी केंद्राला भेट द्या!',
  },
];

/**
 * Heuristic Dialect Intent & Profile Extractor
 */
export function extractDialectProfile(text: string, dialect: SupportedDialect): UserProfile {
  const lower = text.toLowerCase();
  const profile: UserProfile = {
    name: 'Citizen',
    age: 38,
    gender: 'male',
    state: dialect === 'marwari' ? 'Rajasthan' : dialect === 'marathi' ? 'Maharashtra' : dialect === 'bhojpuri' || dialect === 'maithili' ? 'Bihar' : 'Uttar Pradesh',
    district: dialect === 'marwari' ? 'Jodhpur' : dialect === 'marathi' ? 'Nashik' : dialect === 'bhojpuri' ? 'Patna' : dialect === 'maithili' ? 'Darbhanga' : 'Varanasi',
    occupation: 'Farmer',
    land_acres: 2.0,
    annual_income_inr: 80000,
    housing_type: 'Kutcha',
    is_taxpayer: false,
    language: dialect === 'marathi' ? 'mr' : dialect === 'hindi' ? 'hi' : 'hi',
  };

  // Farmer indicators across dialects
  if (
    lower.includes('किसान') ||
    lower.includes('खेती') ||
    lower.includes('खेत') ||
    lower.includes('जमीन') ||
    lower.includes('बीघा') ||
    lower.includes('एकड़') ||
    lower.includes('महे किसानी') ||
    lower.includes('शेतकरी') ||
    lower.includes('शेती') ||
    lower.includes('acre')
  ) {
    profile.occupation = 'Farmer';
  }

  // Name extraction patterns
  const nameMatches = text.match(/(?:नाम|नाव)\s+([^\s,।.]+)\s+([^\s,।.]+)?/i);
  if (nameMatches && nameMatches[1]) {
    profile.name = `${nameMatches[1]} ${nameMatches[2] || ''}`.trim();
  }

  // Land extraction
  const landMatches = text.match(/(\d+(?:\.\d+)?)\s*(?:एकड़|बीघा|एकडे|एकर|acre)/i);
  if (landMatches && landMatches[1]) {
    const val = parseFloat(landMatches[1]);
    profile.land_acres = val;
  }

  return normalizeProfile(profile);
}

/**
 * Synthesize Dialect Response with Scheme Grounding
 */
export function generateDeterministicDialectResponse(
  query: string,
  dialect: SupportedDialect,
  profile: UserProfile
): {
  responseText: string;
  detectedSchemes: string[];
} {
  const schemesRes = evaluateAllSchemes(profile);
  const eligibleNames = schemesRes.eligible.map((s) => s.scheme_name);

  if (dialect === 'bhojpuri') {
    return {
      responseText: `${profile.name || 'रामेश भईया'} प्रणाम! रउआ जौन जानकारी बतवनी, ओकरा हिसाब से रउआ के "पीएम-किसान" में ₹6,000 सालाना, खेती खातिर "किसान क्रेडिट कार्ड" पर ₹3 लाख के लोन, आ पूरा परिवार खातिर "आयुष्मान भारत" में ₹5 लाख के मुफ्त इलाज मिली। अगर कच्चा घर बा त "पीएम आवास" में ₹1,20,000 मिली। रउआ आपन आधार कार्ड आ जमीन के खतियान लेके नजदीकी सीएससी केंद्र पर तुरंत जाईं!`,
      detectedSchemes: eligibleNames,
    };
  }

  if (dialect === 'marwari') {
    return {
      responseText: `खम्मा घणी ${profile.name || 'कानाराम जी'} सा! थारी बात सुण’र घणी खुशी हुई। थारे दो बीघा जमीन है, ई वास्ते थानै "पीएम-किसान सम्मान निधि" मांय ₹6,000 हर साल बैंक मांय आवेला। साथे "किसान क्रेडिट कार्ड (KCC)" मांय ₹3,00,000 री सूलभ पत मिल जावेली। थारे पूरे परिवार वास्ते ₹5 लाख रो "आयुष्मान भारत" इलाज रो कार्ड भी बणेला। थारो आधार अर जमीन री जमाबंदी ले’र तुरंत सीएससी जन सेवा केंद्र पधारो सा!`,
      detectedSchemes: eligibleNames,
    };
  }

  if (dialect === 'maithili') {
    return {
      responseText: `प्रणाम ${profile.name || 'मिथिलावासी'} जी! अहाँक लेल सरकारक पैघ योजना उपलब्ध अछि। अहाँक खेतक लेल "पीएम-किसान सम्मान निधि" मे प्रति वर्ष ₹6,000 टका आ "किसान क्रेडिट कार्ड" मे ३ लाख टका धरिक ऋण भेटत। आयुष्मान भारत कार्ड सं ५ लाख टका धरिक इलाज मुफ्त अछि। अहाँ तुरंत नजदीकी ग्राहक सेवा केंद्र (CSC) जा क’ आवेदन करू!`,
      detectedSchemes: eligibleNames,
    };
  }

  if (dialect === 'awadhi') {
    return {
      responseText: `राम राम ${profile.name || 'भैया'}! आपके बरे सरकार बहुतै नीक योजना लायी है। खेती बरे "पीएम-किसान" से ₹6,000 हर साल अउर "किसान क्रेडिट कार्ड" से ₹3 लाख तक सुविधा मिली। परिवार बरे ₹5 लाख के आयुष्मान कार्ड बनी। आपन आधार अउर खतौनी लइके तुरंत जन सेवा केंद्र जाव!`,
      detectedSchemes: eligibleNames,
    };
  }

  if (dialect === 'marathi') {
    return {
      responseText: `नमस्कार ${profile.name || 'पाटील'} जी! आपल्या प्रोफाइलनुसार आपण "पीएम-किसान सन्मान निधी" (दरवर्षी ₹६,०००), "किसान क्रेडिट कार्ड" (₹३,००,००० पत मर्यादा) आणि "आयुष्मान भारत" (₹५ लाख आरोग्य कवच) साठी पात्र आहात. त्वरित जवळच्या सीएससी केंद्राला भेट द्या!`,
      detectedSchemes: eligibleNames,
    };
  }

  // Default Hindi
  return {
    responseText: `नमस्ते ${profile.name || 'नागरिक'} जी! आपके विवरण के अनुसार आप "पीएम-किसान सम्मान निधि" (₹6,000/वर्ष), "किसान क्रेडिट कार्ड" (₹3 लाख लिमिट), और पूरे परिवार के लिए "आयुष्मान भारत" (₹5 लाख) के लिए पूरी तरह पात्र हैं। अपने नजदीकी सीएससी केंद्र पर जाकर तुरंत आवेदन करें!`,
    detectedSchemes: eligibleNames,
  };
}
