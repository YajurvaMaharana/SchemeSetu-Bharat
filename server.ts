import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  evaluateAllSchemes,
  normalizeProfile,
} from './src/services/rulesEngine';
import {
  findCsc,
  mockPortalSubmission,
} from './src/services/cscLocator';
import {
  generateFallbackEdgeReview,
  generateFallbackSummary,
  heuristicExtractProfile,
} from './src/services/heuristicExtractor';
import {
  AgentEvent,
  AgentResponse,
  SchemeEligibilityResult,
  UserProfile,
} from './src/types/agent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
let isGeminiKeyDisabled = false;

function getGeminiClient(): GoogleGenAI | null {
  if (isGeminiKeyDisabled || process.env.USE_STUB === '1') {
    return null;
  }
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.length < 8 || apiKey === 'YOUR_API_KEY' || apiKey.startsWith('your_')) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch {
    return null;
  }
}

async function callGemini(
  prompt: string,
  systemInstruction?: string,
  jsonMode: boolean = false
): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) {
    return null;
  }
  try {
    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (jsonMode) {
      config.responseMimeType = 'application/json';
    }

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config,
    });
    return response.text || null;
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID') || error?.status === 400 || error?.code === 400) {
      // Disable further failed calls and switch seamlessly to deterministic fallback
      isGeminiKeyDisabled = true;
    }
    return null;
  }
}

const EXTRACTION_SYSTEM_PROMPT = `You are an expert citizen intake agent for SchemeSetu Bharat.
Extract structured citizen demographic and socio-economic attributes from citizen text (Hindi, English, Hinglish, Marathi, etc.).
Output ONLY valid JSON matching this schema:
{
  "name": string or null,
  "age": integer or null,
  "gender": "Male" | "Female" | "Other" | null,
  "state": string or null,
  "district": string or null,
  "pincode": string (6 digits) or null,
  "occupation": string or null (e.g. "Farmer", "Daily Wage Worker", "Student", "Artisan", "Self-Employed"),
  "annual_income_inr": integer INR or null,
  "land_hectares": float or null,
  "land_acres": float or null,
  "has_land_ownership": boolean or null,
  "social_category": "General" | "OBC" | "SC" | "ST" | null,
  "housing_type": "Pucca" | "Kutcha" | "Homeless" | "Rented" | null,
  "is_taxpayer": boolean,
  "is_govt_employee": boolean,
  "has_pension_above_10k": boolean,
  "is_shg_member": boolean,
  "is_student": boolean,
  "special_conditions": [list of strings],
  "preferred_language": "Hindi" | "English" | "Marathi"
}
CONVERSION RULES:
- 1 acre = 0.4047 hectares. If given in acres, convert to hectares.
- Money must be integer INR. (e.g. "1.5 lakh" -> 150000, "50 हजार" -> 50000).
- If landless, set land_hectares=0.0 and has_land_ownership=false.
- If joint ownership is mentioned, include "joint land ownership" in special_conditions.
- If tenant farmer, include "tenant farmer" in special_conditions.
`;

const EDGE_REVIEW_SYSTEM_PROMPT = `You are an official welfare compliance reviewer for the Government of India.
You are evaluating a welfare scheme application flagged by deterministic rules for an EDGE CASE (e.g., joint landholding, borderline threshold, missing certificate).
STRICT COMPLIANCE INVARIANTS:
1. You CANNOT overturn statutory rules or exclusions.
2. You CANNOT invent scheme rules or benefits.
3. You CANNOT certify an applicant as definitively ELIGIBLE if mandatory documentation is absent.
4. Provide a clear, actionable 2-3 sentence administrative guidance note explaining what the edge case implies and which specific certificate/affidavit (e.g. Patwari Panchnama, Tahsildar Income Certificate, Co-owner NOC) is required.`;

const EXPLAINER_SYSTEM_PROMPT = `You are 'SchemeSetu', an empathetic, highly knowledgeable welfare advisor for Indian citizens.
Explain the welfare benefits they qualify for in simple, respectful language (Hindi, Marathi, or English).
RULES:
1. Do NOT invent new schemes or benefits.
2. Highlight total financial value unlocked in Indian Rupees (₹).
3. Clearly list what physical documents the citizen must take to the nearest CSC center or bank.
4. Keep the tone warm, empowering, and easy to understand for rural citizens.`;

async function extractUserProfileServer(text: string): Promise<UserProfile> {
  const llmRes = await callGemini(
    `Citizen query: ${text}`,
    EXTRACTION_SYSTEM_PROMPT,
    true
  );

  if (llmRes) {
    try {
      const cleaned = llmRes.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      parsed.raw_query = text;
      return normalizeProfile(parsed);
    } catch {
      // Fallback
    }
  }

  return heuristicExtractProfile(text);
}

// API Routes
app.post('/api/agent/run', async (req: Request, res: Response) => {
  const { query, profile: inputProfile, pincode, district, language } = req.body;
  const events: AgentEvent[] = [];

  const addEvent = (
    step: string,
    status: 'STARTING' | 'IN_PROGRESS' | 'COMPLETED' | 'WARNING' | 'ERROR',
    message: string,
    data?: any,
    simulated: boolean = false
  ) => {
    const ev: AgentEvent = {
      step,
      status,
      message,
      data: data || null,
      simulated,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };
    events.push(ev);
    return ev;
  };

  try {
    // STAGE 1: UNDERSTAND
    addEvent(
      'PROFILE_EXTRACTION',
      'STARTING',
      'Analyzing citizen query and extracting demographic attributes...'
    );

    let profile: UserProfile;
    if (inputProfile && typeof inputProfile === 'object') {
      profile = normalizeProfile(inputProfile);
    } else if (typeof query === 'string' && query.trim()) {
      profile = await extractUserProfileServer(query);
    } else {
      profile = normalizeProfile({});
    }

    if (pincode && !profile.pincode) profile.pincode = pincode;
    if (district && !profile.district) profile.district = district;
    if (language) profile.preferred_language = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';

    addEvent(
      'PROFILE_EXTRACTION',
      'COMPLETED',
      `Profile extracted: Age=${profile.age ?? 'N/A'}, Occupation=${profile.occupation ?? 'General'}, Land=${profile.land_hectares ?? 0} ha (${profile.land_acres ?? 0} acres), Income=₹${(profile.annual_income_inr ?? 0).toLocaleString('en-IN')}`,
      profile
    );

    // STAGE 2: REASON
    addEvent(
      'DETERMINISTIC_RULES',
      'STARTING',
      'Evaluating statutory eligibility rules against knowledge base...'
    );

    const { eligible, review, ineligible } = evaluateAllSchemes(profile);

    addEvent(
      'DETERMINISTIC_RULES',
      'COMPLETED',
      `Deterministic verification complete: ${eligible.length} eligible, ${review.length} require review, ${ineligible.length} not eligible.`,
      {
        eligible_ids: eligible.map((s) => s.scheme_id),
        review_ids: review.map((s) => s.scheme_id),
        ineligible_ids: ineligible.map((s) => s.scheme_id),
        counts: {
          eligible: eligible.length,
          review: review.length,
          ineligible: ineligible.length,
        },
      }
    );

    // STAGE 3: EDGE CASE REVIEW
    let updatedReview: SchemeEligibilityResult[] = [];
    if (review.length > 0) {
      addEvent(
        'EDGE_CASE_REVIEW',
        'STARTING',
        `Reviewing ${review.length} schemes flagged with edge conditions...`
      );

      for (const r of review) {
        if (r.status === 'NOT_ELIGIBLE') {
          updatedReview.push(r);
          continue;
        }

        const flagsSummary = r.edge_case_flags.join(', ');
        const prompt = `Scheme: ${r.scheme_name}\nApplicant Profile: Age=${profile.age}, Occupation=${profile.occupation}, Land=${profile.land_hectares} ha, Income=₹${profile.annual_income_inr}\nFlagged Edge Cases: ${flagsSummary}\nProvide official administrative guidance and document resolution path.`;
        
        let reviewNote = await callGemini(prompt, EDGE_REVIEW_SYSTEM_PROMPT);
        if (!reviewNote || reviewNote.trim().length < 10) {
          reviewNote = generateFallbackEdgeReview(r.scheme_name, r.edge_case_flags);
        }
        r.llm_edge_review = reviewNote.trim();
        updatedReview.push(r);
      }

      addEvent(
        'EDGE_CASE_REVIEW',
        'COMPLETED',
        'Edge case reviews formulated with statutory document resolution paths.',
        { reviewed_schemes: updatedReview.map((s) => s.scheme_id) }
      );
    } else {
      updatedReview = review;
      addEvent(
        'EDGE_CASE_REVIEW',
        'COMPLETED',
        'No borderline edge cases flagged; all statutory criteria clean.'
      );
    }

    // STAGE 4: PLAN & RANK
    const totalBenefit = eligible.reduce((acc, s) => acc + s.benefit_amount_inr, 0);
    addEvent(
      'SCHEME_RANKING',
      'COMPLETED',
      `Schemes ranked by benefit: ₹${totalBenefit.toLocaleString('en-IN')} in potential welfare capital unlocked.`,
      {
        total_benefit_inr: totalBenefit,
        top_scheme: eligible[0]?.scheme_name ?? null,
      }
    );

    // STAGE 5: USE TOOLS (Simulated CSC Locator)
    addEvent(
      'CSC_LOCATOR',
      'STARTING',
      'Querying geolocation directory for nearest Common Service Centre...',
      null,
      true
    );

    const cscInfo = findCsc(profile.district, profile.pincode, profile.state);
    addEvent(
      'CSC_LOCATOR',
      'COMPLETED',
      `Located nearest CSC desk: ${cscInfo.name} (${cscInfo.distance_km ?? 1.5} km away).`,
      cscInfo,
      true
    );

    // STAGE 6: DELIVER (Citizen Explanations)
    addEvent(
      'EXPLANATION_GENERATION',
      'STARTING',
      'Generating personalized action plan and vernacular explanations...'
    );

    const contextStr = [
      ...eligible.map((s) => `[ELIGIBLE] ${s.scheme_name}: Benefit ₹${s.benefit_amount_inr}. Docs: ${s.required_documents.join(', ')}`),
      ...updatedReview.map((s) => `[NEEDS_REVIEW] ${s.scheme_name}: Note: ${s.llm_edge_review || s.edge_case_flags.join(', ')}`),
    ].join('\n');

    const explainerPrompt = `Citizen Profile: Age=${profile.age}, Occupation=${profile.occupation}, Income=₹${profile.annual_income_inr}, Land=${profile.land_hectares} ha (${profile.land_acres} acres), State=${profile.state}, Preferred Language=${profile.preferred_language}\nTotal Financial Value: ₹${totalBenefit}\nWelfare Schemes Evaluated:\n${contextStr}\nWrite a friendly, empowering summary in ${profile.preferred_language} outlining eligible schemes, total benefit, key documents, and next steps.`;

    let summaryText = await callGemini(explainerPrompt, EXPLAINER_SYSTEM_PROMPT);
    if (!summaryText || summaryText.trim().length < 30) {
      summaryText = generateFallbackSummary(profile, eligible, updatedReview);
    }

    addEvent(
      'EXPLANATION_GENERATION',
      'COMPLETED',
      'Action plan and document checklist compiled.'
    );

    addEvent(
      'DELIVER',
      'COMPLETED',
      `Execution successful: ${eligible.length} eligible welfare schemes delivered.`,
      {
        total_benefit_inr: totalBenefit,
        eligible_count: eligible.length,
      }
    );

    const responsePayload: AgentResponse = {
      user_profile: profile,
      eligible_schemes: eligible,
      review_schemes: updatedReview,
      ineligible_schemes: ineligible,
      total_potential_benefit_inr: totalBenefit,
      summary_text: summaryText,
      vernacular_summary: summaryText,
      csc_recommendation: cscInfo,
      events,
      used_fallback: isGeminiKeyDisabled || !getGeminiClient(),
    };

    return res.json(responsePayload);
  } catch (error: any) {
    console.error('Agent execution error:', error);
    addEvent('DELIVER', 'ERROR', `Agent execution failed: ${error.message || error}`);
    return res.status(500).json({
      error: error.message || 'Internal server error during agent execution',
      events,
    });
  }
});

app.post('/api/agent/locate-csc', (req: Request, res: Response) => {
  const { district, pincode, state } = req.body;
  const csc = findCsc(district, pincode, state);
  return res.json(csc);
});

app.post('/api/agent/submit', (req: Request, res: Response) => {
  const { scheme_id, user_profile } = req.body;
  if (!scheme_id) {
    return res.status(400).json({ error: 'scheme_id is required' });
  }
  const result = mockPortalSubmission(scheme_id, normalizeProfile(user_profile || {}));
  return res.json(result);
});

// Vite middleware or Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`SchemeSetu Bharat server running on http://${HOST}:${PORT}`);
  });
}

startServer();
