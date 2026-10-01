import { LifeEvent, ProactiveWhatsAppMessage, SuggestedSchemePreview } from '../types/proactive';
import { UserProfile } from '../types/agent';

export function generateProactiveWhatsAppMessage(
  event: LifeEvent,
  profile: Partial<UserProfile> | null,
  language: 'hi' | 'mr' | 'en' = 'hi'
): ProactiveWhatsAppMessage {
  const recipientName = profile?.name || 'नागरिक / Citizen';
  const phone = '98721XXXXX';
  const district = profile?.district || event.district;
  const timestamp = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Multilingual generators
  if (language === 'hi') {
    return generateHindiMessage(event, recipientName, phone, district, timestamp);
  } else if (language === 'mr') {
    return generateMarathiMessage(event, recipientName, phone, district, timestamp);
  } else {
    return generateEnglishMessage(event, recipientName, phone, district, timestamp);
  }
}

function generateHindiMessage(
  event: LifeEvent,
  name: string,
  phone: string,
  district: string,
  timestamp: string
): ProactiveWhatsAppMessage {
  let headline = '';
  let schemes: SuggestedSchemePreview[] = [];
  let quickReplies: string[] = [];
  let body = '';

  if (event.type === 'WEATHER_ALERT') {
    headline = '⚠️ मौसम सतर्कता सूचना: नासिक में ओलावृष्टि अलर्ट';
    schemes = [
      {
        schemeId: 'pmfby',
        schemeName: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
        benefitText: 'फसल क्षति पर ₹1,50,000/हेक्टेयर तक का मुआवजा दावा',
        urgencyText: '72 घंटे के भीतर सूचना देना अनिवार्य',
      },
      {
        schemeId: 'kcc',
        schemeName: 'किसान क्रेडिट कार्ड (KCC) आपात राहत',
        benefitText: '₹3,00,000 तक की आपातकालीन सीमा व ऋण पुनर्गठन',
        urgencyText: 'बैंक शाखा व सीएससी पर सक्रिय',
      },
    ];
    quickReplies = [
      '1️⃣ 1 दबाएं: फसल क्षति दावा शुरू करें',
      '2️⃣ 2 दबाएं: नजदीकी CSC केंद्र खोजें',
      '3️⃣ 3 दबाएं: कृषि अधिकारी से बात करें',
    ];

    body = `🙏 *नमस्ते ${name} जी | SchemeSetu Bharat (जन कल्याण सेवा)*

⚡ *सक्रिय जीवन-घटना सूचना:*
भारत मौसम विज्ञान विभाग (IMD) द्वारा आपके जिले *${district}* में अचानक तेज आंधी और ओलावृष्टि की *ऑरेंज चेतावनी* जारी की गई है।

आपके द्वारा बिना खोजे ही, SchemeSetu Bharat ने आपकी खेती और आजीविका की सुरक्षा हेतु निम्नलिखित सरकारी सहायता पहचानी है:

1️⃣ *प्रधानमंत्री फसल बीमा योजना (PMFBY)*
   • लाभ: ओलावृष्टि से नुकसान पर त्वरित बैंक हस्तांतरण
   • ⚠️ *महत्वपूर्ण:* क्षति के 72 घंटे के भीतर सूचना दर्ज कराना जरूरी है।

2️⃣ *किसान क्रेडिट कार्ड (KCC) आपात ऋण राहत*
   • लाभ: ₹3,00,000 तक की सुरक्षित ऋण सीमा व ब्याज छूट।

👉 *त्वरित सहायता के लिए इस चैट में उत्तर दें:*
• *1* भेजें - PMFBY नुकसान क्लेम फॉर्म ऑटो-फिल करने के लिए
• *2* भेजें - ${district} में नजदीकी CSC केंद्र का पता व फोन नंबर पाने के लिए
• *3* भेजें - सीधे किसान कॉल सेंटर (14447) से जुड़ने के लिए`;
  } else if (event.type === 'AADHAAR_UPDATE') {
    headline = '🆔 आधार अद्यतन सूचना: ग्रामीण कल्याण योजनाओं की स्वतः पहचान';
    schemes = [
      {
        schemeId: 'pmay_g',
        schemeName: 'प्रधानमंत्री ग्रामीण आवास योजना (PMAY-G)',
        benefitText: 'पक्का आवास निर्माण हेतु ₹1,20,000 की सीधी DBT सहायता',
        urgencyText: 'ग्राम पंचायत कोटा उपलब्ध',
      },
      {
        schemeId: 'ayushman_bharat',
        schemeName: 'आयुष्मान भारत - PM-JAY',
        benefitText: 'प्रति वर्ष ₹5,00,000 तक का पूर्णतः मुफ्त इलाज',
        urgencyText: 'डिजिलॉकर से डिजिटल कार्ड तुरंत डाउनलोड करें',
      },
    ];
    quickReplies = [
      '1️⃣ 1 दबाएं: PMAY-G फॉर्म भरें',
      '2️⃣ 2 दबाएं: आयुष्मान कार्ड डाउनलोड करें',
      '3️⃣ 3 दबाएं: राशन कार्ड राशन कोटा देखें',
    ];

    body = `🙏 *नमस्ते ${name} जी | SchemeSetu Bharat (आधार डिजिटल सेवा)*

🆔 *आधार जीवन-घटना सूचना:*
UIDAI पोर्टल पर आपके आधार में हाल ही में ग्रामीण क्षेत्र का पता सफलतापूर्वक सत्यापित हुआ है।

*बिना किसी खोज के, हमारे सिस्टम ने आपके लिए ₹6,20,000 तक के नए लाभ पहचाने हैं:*

1️⃣ *प्रधानमंत्री ग्रामीण आवास योजना (PMAY-G)*
   • लाभ: पक्के मकान के लिए ₹1,20,000 की सरकारी अनुदान राशि।

2️⃣ *आयुष्मान भारत (PM-JAY) गोल्डन कार्ड*
   • लाभ: ₹5,00,000 प्रति वर्ष का कैशलेस स्वास्थ्य बीमा।

👉 *निःशुल्क सहायता के लिए उत्तर दें:*
• *1* भेजें - PMAY-G में अपना नाम जांचने व आवेदन हेतु
• *2* भेजें - डिजिलॉकर से आयुष्मान गोल्डन कार्ड प्राप्त करने हेतु`;
  } else if (event.type === 'LAND_MUTATION') {
    headline = '🌾 7/12 जमीन फेरफार सूचना: किसान योजनाओं की अग्रिम सहायता';
    schemes = [
      {
        schemeId: 'pm_kisan',
        schemeName: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
        benefitText: '₹6,000 प्रति वर्ष 3 किस्तों में सीधा बैंक खाता अंतरण',
        urgencyText: 'ई-केवाईसी व लैंड सीडिंग आवश्यक',
      },
      {
        schemeId: 'kcc',
        schemeName: 'किसान क्रेडिट कार्ड (KCC)',
        benefitText: '₹3,00,000 तक का रियायती फसली ऋण (4% ब्याज दर)',
        urgencyText: 'नया 7/12 मान्य',
      },
    ];
    quickReplies = [
      '1️⃣ 1 दबाएं: PM-Kisan ई-केवाईसी करें',
      '2️⃣ 2 दबाएं: KCC आवेदन पत्र डाउनलोड करें',
      '3️⃣ 3 दबाएं: सीएससी केंद्र पर अपॉइंटमेंट लें',
    ];

    body = `🙏 *नमस्ते ${name} जी | SchemeSetu Bharat*

🌾 *महाभूमि (7/12) जीवन-घटना सूचना:*
आपके नाम पर महाभूलेख पोर्टल पर 1.5 एकड़ कृषि भूमि का फेरफार/नामांतरण सफलतापूर्वक दर्ज हुआ है।

*अब आप निम्नलिखित केंद्रीय योजनाओं के लिए पूर्णतः पात्र हैं:*
1️⃣ *पीएम-किसान सम्मान निधि (PM-KISAN)*: ₹6,000 प्रति वर्ष सीधा खाता जमा।
2️⃣ *किसान क्रेडिट कार्ड (KCC)*: ₹3,00,000 की रियायती फसली साख सीमा।

👉 उत्तर दें: *1* दबाएं और आधार-भूमि सीडिंग 1-क्लिक में पूरी करें!`;
  } else {
    headline = '🎓 12वीं परिणाम सूचना: उच्च शिक्षा छात्रवृत्ति सहायता';
    schemes = [
      {
        schemeId: 'nsp_post_matric',
        schemeName: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP Post-Matric)',
        benefitText: '₹48,000 प्रति वर्ष उच्च शिक्षा प्रोत्साहन छात्रवृत्ति',
        urgencyText: 'आवेदन पोर्टल खुला है (28 दिन शेष)',
      },
    ];
    quickReplies = [
      '1️⃣ 1 दबाएं: NSP छात्रवृत्ति हेतु पूर्व-भराई अर्जी पाएं',
      '2️⃣ 2 दबाएं: आवश्यक दस्तावेजों की सूची देखें',
    ];

    body = `🙏 *नमस्ते ${name} जी | SchemeSetu Bharat*

🎓 *शैक्षणिक उपलब्धि सूचना:*
12वीं बोर्ड परीक्षा में आपकी सफलता पर हार्दिक बधाई!

उच्च शिक्षा के लिए सरकार की *NSP Post-Matric छात्रवृत्ति (₹48,000/वर्ष)* का पोर्टल सक्रिय है।

👉 उत्तर दें: *1* भेजें और अपने रोल नंबर से सीधे आवेदन किट प्राप्त करें।`;
  }

  return {
    id: `msg-${event.id}-hi`,
    lifeEventId: event.id,
    recipientName: name,
    recipientPhone: phone,
    language: 'hi',
    headline,
    messageText: body,
    vernacularSummary: body,
    schemesSuggested: schemes,
    quickReplies,
    generatedAt: timestamp,
    isAiGenerated: true,
    sourceAuthority: event.source,
  };
}

function generateMarathiMessage(
  event: LifeEvent,
  name: string,
  phone: string,
  district: string,
  timestamp: string
): ProactiveWhatsAppMessage {
  const headline = '⚠️ हवामान इशारा: नाशिक जिल्ह्यात अवकाळी पाऊस व गारपीट अलर्ट';
  const body = `🙏 *नमस्कार ${name} जी | SchemeSetu Bharat (आपली योजना, आपला हक्क)*

⚡ *सक्रिय जीवन-घटना सूचना (हवामान खाते):*
भारतीय हवामान विभागाने (IMD) *${district}* जिल्ह्यासाठी अवकाळी पाऊस आणि गारपिटीचा *ऑरेंज अलर्ट* जारी केला आहे.

आपल्या शेती पिकांचे संभाव्य नुकसान टाळण्यासाठी शासनाच्या खालील योजनांची पूर्व-तयारी सुरू करण्यात आली आहे:

1️⃣ *प्रधानमंत्री पीक विमा योजना (PMFBY)*
   • लाभ: गारपिटीमुळे नुकसान झाल्यास तात्काळ भरपाई (₹१,५०,००० प्रति हेक्टर पर्यंत)
   • ⚠️ *महत्त्वाचे:* नुकसान झाल्यापासून ७२ तासांच्या आत ऑनलाइन किंवा कृषी मित्राकडे तक्रार नोंदवणे अनिवार्य आहे.

2️⃣ *किसान क्रेडिट कार्ड (KCC) आपत्कालीन सहाय्य*
   • लाभ: ₹३,००,००० पर्यंत अल्प व्याजदरावर पत मर्यादा व कर्ज पुनर्रचना.

👉 *तातडीच्या मदतीसाठी या संदेशाला उत्तर द्या:*
• *1* पाठवा - पीक विमा नुकसान दावा सुरू करण्यासाठी
• *2* पाठवा - जवळचे नाशिक सीएससी केंद्र शोधण्यासाठी
• *3* पाठवा - थेट कृषी सहाय्यकाशी संपर्क करण्यासाठी`;

  return {
    id: `msg-${event.id}-mr`,
    lifeEventId: event.id,
    recipientName: name,
    recipientPhone: phone,
    language: 'mr',
    headline,
    messageText: body,
    vernacularSummary: body,
    schemesSuggested: [
      {
        schemeId: 'pmfby',
        schemeName: 'प्रधानमंत्री पीक विमा योजना (PMFBY)',
        benefitText: 'नुकसान भरपाई थेट बँक खात्यात',
        urgencyText: '७२ तासांच्या आत पूर्वसूचना आवश्यक',
      },
      {
        schemeId: 'kcc',
        schemeName: 'किसान क्रेडिट कार्ड (KCC)',
        benefitText: '₹३,००,००० पत मर्यादा',
      },
    ],
    quickReplies: [
      '1️⃣ 1 पाठवा: पीक विमा क्लेम सुरू करा',
      '2️⃣ 2 पाठवा: जवळचे CSC केंद्र शोधा',
      '3️⃣ 3 पाठवा: कृषी मित्राशी संपर्क',
    ],
    generatedAt: timestamp,
    isAiGenerated: true,
    sourceAuthority: event.source,
  };
}

function generateEnglishMessage(
  event: LifeEvent,
  name: string,
  phone: string,
  district: string,
  timestamp: string
): ProactiveWhatsAppMessage {
  const headline = '⚠️ Weather Warning: Hailstorm & Unseasonal Rain Alert in Nashik';
  const body = `🙏 *Greetings ${name} | SchemeSetu Bharat (Citizen Welfare Desk)*

⚡ *Proactive Life Event Alert:*
India Meteorological Department (IMD) has issued a severe *Orange Alert* for unseasonal rain and hailstorm across *${district}* district.

Before you even searched, SchemeSetu detected your 1.5-acre agricultural profile and pre-configured statutory disaster relief:

1️⃣ *Pradhan Mantri Fasal Bima Yojana (PMFBY)*
   • Benefit: Direct DBT crop loss settlement up to ₹1,50,000/ha for localized hailstorm damage.
   • ⚠️ *Critical Rule:* Statutory reporting mandatory within *72 hours* of event.

2️⃣ *Kisan Credit Card (KCC) Disaster Restructuring*
   • Benefit: Restructure existing loans & unlock emergency credit line up to ₹3,00,000 at 4% interest.

👉 *Reply directly to this chat for 1-click assistance:*
• Reply *1* to trigger automated PMFBY claim filing with pre-attached 7/12 extract.
• Reply *2* to get GPS directions and contact for your nearest Common Service Centre (CSC).
• Reply *3* to connect with Kisan Call Centre (Toll-Free 14447).`;

  return {
    id: `msg-${event.id}-en`,
    lifeEventId: event.id,
    recipientName: name,
    recipientPhone: phone,
    language: 'en',
    headline,
    messageText: body,
    vernacularSummary: body,
    schemesSuggested: [
      {
        schemeId: 'pmfby',
        schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        benefitText: 'Localized calamity compensation up to ₹1,50,000/ha',
        urgencyText: 'Strict 72-hour reporting window',
      },
      {
        schemeId: 'kcc',
        schemeName: 'Kisan Credit Card (KCC)',
        benefitText: 'Emergency credit limit & restructuring up to ₹3,00,000',
      },
    ],
    quickReplies: [
      '1️⃣ Reply 1: Start 1-Click Crop Claim',
      '2️⃣ Reply 2: Locate Nearest CSC Desk',
      '3️⃣ Reply 3: Dial Kisan Call Centre (14447)',
    ],
    generatedAt: timestamp,
    isAiGenerated: true,
    sourceAuthority: event.source,
  };
}
