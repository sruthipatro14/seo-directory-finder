// services/mozService.ts
//
// Fetches Domain Authority and Spam Score from the Moz API.

import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MozMetrics {
  domainAuthority: number;
  spamScore: number;
}

export interface MozProvider {
  readonly name: string;
  getMetrics(domain: string): Promise<MozMetrics>;
}

// ─── Configuration ────────────────────────────────────────────────────────────

const MOZ_ACCESS_ID = process.env.MOZ_ACCESS_ID;
const MOZ_SECRET_KEY = process.env.MOZ_SECRET_KEY;

// ─── Utils ────────────────────────────────────────────────────────────────────

/** Normalizes a URL string into a root domain for DA lookup. */
function normalizeDomain(input: string): string {
  try {
    const url = input.includes("://") ? new URL(input) : new URL(`http://${input}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return input.trim();
  }
}

function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain);
}

// ─── Providers ────────────────────────────────────────────────────────────────

/**
 * Returns simulated data for local development.
 */
class MockMozProvider implements MozProvider {
  readonly name = "mock";

  async getMetrics(domain: string): Promise<MozMetrics> {
    await new Promise((r) => setTimeout(r, 200)); // Sim latency
    
    const seed = domain.length;
    return {
      domainAuthority: Math.min(100, Math.max(1, seed * 3)),
      spamScore: seed % 5,
    };
  }
}

/**
 * Real-world Moz API implementation using Signed Authentication (v1).
 */
class MozApiProvider implements MozProvider {
  readonly name = "moz-api";

  constructor(private accessId: string, private secretKey: string) {}

  async getMetrics(domain: string): Promise<MozMetrics> {
    const expires = Math.floor(Date.now() / 1000) + 300;
    const stringToSign = `${this.accessId}\n${expires}`;
    const signature = crypto
      .createHmac("sha1", this.secretKey)
      .update(stringToSign)
      .digest("base64");

    const query = encodeURIComponent(domain);
    const url = `https://lsapi.moz.com/linkscape/url-metrics/${query}?Cols=68719476736&AccessID=${this.accessId}&Expires=${expires}&Signature=${encodeURIComponent(signature)}`;

    try {
      const response = await fetch(url);

      if (response.status === 429) {
        throw new Error("Moz API Rate Limit exceeded (429). Free tier allows 1 req / 10s.");
      }

      if (!response.ok) {
        throw new Error(`Moz API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        domainAuthority: Math.round(data.pda || 0),
        spamScore: Math.round(data.fsq || 0),
      };
    } catch (err) {
      console.error(`[MozProvider] Request failed:`, err);
      throw err;
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

const activeProvider: MozProvider =
  MOZ_ACCESS_ID && MOZ_SECRET_KEY
    ? new MozApiProvider(MOZ_ACCESS_ID, MOZ_SECRET_KEY)
    : new MockMozProvider();

export async function getMozMetrics(urlOrDomain: string): Promise<MozMetrics> {
  const domain = normalizeDomain(urlOrDomain);
  if (!isValidDomain(domain)) throw new Error(`Invalid domain format: "${domain}"`);
  return activeProvider.getMetrics(domain);
}

export async function getDomainAuthority(domain: string): Promise<number> {
  const metrics = await getMozMetrics(domain);
  return metrics.domainAuthority;
}

export async function getSpamScore(domain: string): Promise<number> {
  const metrics = await getMozMetrics(domain);
  return metrics.spamScore;
}