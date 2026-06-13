// services/industryClassifier.ts
//
// Architecture:
//   classifyIndustry(text)
//     └── ClassificationProvider.classify(text)   — swappable backend
//           ├── KeywordProvider   (active now)
//           └── OpenAIProvider    (future — see stub below)
//
// The public classifyIndustry() function depends only on the
// ClassificationProvider interface — swapping to OpenAI is a one-liner.

// ─── Industry type ────────────────────────────────────────────────────────────

export type Industry =
  | "General Business"
  | "Technology"
  | "Healthcare"
  | "Real Estate"
  | "Finance"
  | "Education"
  | "Manufacturing"
  | "Marketing"
  | "Legal";

/** All valid industry values — import this as the single source of truth. */
export const INDUSTRIES: Industry[] = [
  "General Business",
  "Technology",
  "Healthcare",
  "Real Estate",
  "Finance",
  "Education",
  "Manufacturing",
  "Marketing",
  "Legal",
];

export interface ClassificationResult {
  industry: Industry;
  /** Numeric confidence score (0.0 to 1.0). */
  confidence: number;
  /** Which keywords triggered the classification (empty for OpenAI provider). */
  matchedKeywords: string[];
  /** Which provider produced this result. */
  provider: string;
}

// ─── Provider interface ───────────────────────────────────────────────────────

/**
 * Every classification backend must implement this contract.
 * Pass a different instance to classifyIndustry() to switch providers.
 */
export interface ClassificationProvider {
  readonly name: string;
  classify(text: string): Promise<ClassificationResult>;
}

// ─── Keyword registry ─────────────────────────────────────────────────────────

/**
 * Maps each industry to an array of case-insensitive keyword strings.
 *
 * Scoring: the industry with the most matched keywords wins.
 * Ties are broken by declaration order (first one wins).
 * "General Business" has no keywords and is the explicit fallback.
 *
 * Tune this list freely — no other code needs to change.
 */
const INDUSTRY_KEYWORDS: Record<Industry, string[]> = {
  Technology: [
    "software", "saas", "app", "application", "tech", "technology",
    "developer", "programming", "code", "coding", "startup", "api",
    "cloud", "ai", "machine learning", "artificial intelligence",
    "cybersecurity", "data science", "iot", "internet of things",
    "web development", "mobile", "platform", "digital", "it services",
    "computer", "hardware", "semiconductor", "ecommerce", "e-commerce",
  ],
  Healthcare: [
    "health", "healthcare", "medical", "doctor", "hospital", "clinic",
    "pharmacy", "medicine", "patient", "dental", "dentist", "therapy",
    "therapist", "wellness", "nutrition", "fitness", "mental health",
    "telehealth", "telemedicine", "surgery", "physician", "nurse",
    "nursing", "diagnostic", "laboratory", "lab", "pharmaceutical",
    "drug", "rehabilitation", "rehab", "veterinary", "vet",
  ],
  "Real Estate": [
    "real estate", "property", "properties", "realty", "realtor",
    "mortgage", "homes for sale", "rent", "rental", "landlord",
    "tenant", "apartment", "condo", "house", "housing", "estate",
    "commercial property", "residential", "lease", "leasing",
    "home buyer", "home seller", "listing agent", "broker",
    "mls", "foreclosure", "investment property",
  ],
  Finance: [
    "finance", "financial", "bank", "banking", "investment", "investing",
    "stock", "trading", "fund", "hedge fund", "portfolio", "insurance",
    "accounting", "accountant", "tax", "taxes", "loan", "mortgage",
    "credit", "debt", "wealth", "asset", "equity", "venture capital",
    "private equity", "fintech", "cryptocurrency", "crypto", "bitcoin",
    "forex", "currency", "budget", "savings", "retirement", "401k",
    "ira", "audit", "bookkeeping", "payroll",
  ],
  Education: [
    "education", "school", "university", "college", "learning",
    "course", "training", "tutor", "tutoring", "student", "teacher",
    "curriculum", "academic", "degree", "certification", "e-learning",
    "elearning", "online learning", "lms", "edtech", "classroom",
    "lecture", "scholarship", "k-12", "kindergarten", "preschool",
    "campus", "enrollment", "admissions", "research", "science",
  ],
  Manufacturing: [
    "manufacturing", "factory", "production", "industrial", "industry",
    "assembly", "fabrication", "machining", "supply chain", "logistics",
    "warehouse", "distribution", "shipping", "freight", "raw material",
    "equipment", "machinery", "automation", "robotics", "cnc",
    "3d printing", "additive manufacturing", "aerospace", "automotive",
    "chemical", "construction", "building", "contractor", "engineering",
    "civil engineering", "mechanical", "electrical",
  ],
  Marketing: [
    "marketing", "advertising", "seo", "sem", "ppc", "social media",
    "content marketing", "email marketing", "branding", "brand",
    "agency", "pr", "public relations", "campaign", "lead generation",
    "conversion", "funnel", "analytics", "crm", "growth hacking",
    "influencer", "affiliate", "copywriting", "design", "creative",
    "media", "print", "billboard", "digital marketing", "inbound",
    "outbound", "market research",
  ],
  Legal: [
    "legal", "law", "lawyer", "attorney", "solicitor", "firm",
    "law firm", "litigation", "court", "judge", "justice", "contract",
    "compliance", "regulation", "intellectual property", "patent",
    "trademark", "copyright", "corporate law", "criminal law",
    "family law", "immigration", "personal injury", "divorce",
    "bankruptcy", "tax law", "real estate law", "employment law",
    "paralegal", "notary", "arbitration", "mediation",
  ],
  // Explicit fallback — no keywords, matched only when no other industry scores
  "General Business": [],
};

// ─── Keyword provider (active) ────────────────────────────────────────────────

class KeywordProvider implements ClassificationProvider {
  readonly name = "keyword";

  async classify(text: string): Promise<ClassificationResult> {
    const normalised = text.toLowerCase();

    let bestIndustry: Industry = "General Business";
    let bestScore              = 0;
    let bestMatches: string[]  = [];

    for (const [industry, keywords] of Object.entries(
      INDUSTRY_KEYWORDS
    ) as [Industry, string[]][]) {
      if (industry === "General Business") continue; // handled as fallback

      const matched = keywords.filter((kw) => normalised.includes(kw));
      if (matched.length > bestScore) {
        bestScore    = matched.length;
        bestIndustry = industry;
        bestMatches  = matched;
      }
    }

    // Calculate numeric confidence score (0 to 1)
    // Heuristic: baseline of 0.4 for first match, +0.1 per match, capped at 0.95.
    // If no matches, confidence is 0.2 for the "General Business" fallback.
    const confidence = bestScore === 0 
      ? 0.2 
      : Math.min(0.4 + (bestScore * 0.1), 0.95);

    return {
      industry:        bestIndustry,
      confidence:      Number(confidence.toFixed(2)),
      matchedKeywords: bestMatches,
      provider:        this.name,
    };
  }
}

// ─── OpenAI provider stub ─────────────────────────────────────────────────────

/**
 * TODO: Implement using the OpenAI Chat Completions API.
 * Install: npm install openai
 *
 * import OpenAI from "openai";
 *
 * class OpenAIProvider implements ClassificationProvider {
 *   readonly name = "openai";
 *   private client: OpenAI;
 *
 *   constructor(apiKey: string) {
 *     this.client = new OpenAI({ apiKey });
 *   }
 *
 *   async classify(text: string): Promise<ClassificationResult> {
 *     const systemPrompt = `
 *       You are an industry classifier. Given website text, return exactly one
 *       industry from this list: ${INDUSTRIES.join(", ")}
 *
 *       Respond with a JSON object:
 *       {
 *         "industry": "<one of the listed industries>",
 *         "confidence": 0.0 to 1.0,
 *         "reason": "<one sentence>"
 *       }
 *     `;
 *
 *     const response = await this.client.chat.completions.create({
 *       model:           "gpt-4o-mini",
 *       messages: [
 *         { role: "system", content: systemPrompt },
 *         { role: "user",   content: text.slice(0, 4_000) }, // stay within token budget
 *       ],
 *       response_format: { type: "json_object" },
 *       temperature:     0, // deterministic output
 *     });
 *
 *     const parsed   = JSON.parse(response.choices[0].message.content ?? "{}");
 *     const industry = INDUSTRIES.includes(parsed.industry)
 *       ? (parsed.industry as Industry)
 *       : "General Business";
 *
 *     return {
 *       industry,
 *       confidence:      typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
 *       matchedKeywords: [],  // LLMs don't return discrete keyword matches
 *       provider:        this.name,
 *     };
 *   }
 * }
 *
 * // Usage:
 * // const result = await classifyIndustry(text, new OpenAIProvider(process.env.OPENAI_API_KEY!));
 */

// ─── Public API ───────────────────────────────────────────────────────────────

const activeProvider: ClassificationProvider = new KeywordProvider();

/**
 * Classifies a block of text into one of the supported industries.
 *
 * @param text     - Free-form text (page body, title, description, …)
 * @param provider - Optional override; defaults to the active keyword provider
 *
 * @returns ClassificationResult — never throws
 *
 * @example
 *   // Keyword provider (now)
 *   const result = await classifyIndustry("online courses university degree");
 *   // { industry: "Education", confidence: "high", matchedKeywords: ["courses", "university", "degree", ...] }
 *
 *   // OpenAI provider (future)
 *   const result = await classifyIndustry(text, new OpenAIProvider(process.env.OPENAI_API_KEY!));
 */
export async function classifyIndustry(
  text: string,
  provider: ClassificationProvider = activeProvider
): Promise<ClassificationResult> {
  if (!text.trim()) {
    return {
      industry:        "General Business",
      confidence:      0.1,
      matchedKeywords: [],
      provider:        provider.name,
    };
  }
  return provider.classify(text);
}
