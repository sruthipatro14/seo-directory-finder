// services/mozService.ts

import crypto from "crypto";

export interface MozMetrics {
  domainAuthority: number;
  spamScore: number;
}

export interface MozProvider {
  readonly name: string;
  getMetrics(domain: string): Promise<MozMetrics>;
}

const MOZ_ACCESS_ID = process.env.MOZ_ACCESS_ID;
const MOZ_SECRET_KEY = process.env.MOZ_SECRET_KEY;

console.log(
  MOZ_ACCESS_ID && MOZ_SECRET_KEY
    ? "Using Moz API"
    : "Using Mock Moz Provider"
);


function normalizeDomain(input: string): string {
  try {
    const url = input.includes("://")
      ? new URL(input)
      : new URL(`https://${input}`);

    return url.hostname.replace(/^www\./, "");
  } catch {
    return input.trim();
  }
}

function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain);
}

class MockMozProvider implements MozProvider {
  readonly name = "mock";

  async getMetrics(domain: string): Promise<MozMetrics> {
    const seed = domain.length;

    return {
      domainAuthority: Math.min(100, Math.max(1, seed * 3)),
      spamScore: seed % 5,
    };
  }
}

class MozApiProvider implements MozProvider {
  readonly name = "moz-api";

  constructor(
    private accessId: string,
    private secretKey: string
  ) {}

  async getMetrics(domain: string): Promise<MozMetrics> {
    const expires = Math.floor(Date.now() / 1000) + 300;

    const stringToSign = `${this.accessId}\n${expires}`;

    const signature = crypto
      .createHmac("sha1", this.secretKey)
      .update(stringToSign)
      .digest("base64");

    const url =
      `https://lsapi.moz.com/linkscape/url-metrics/${encodeURIComponent(
        domain
      )}` +
      `?Cols=68719476736` +
      `&AccessID=${this.accessId}` +
      `&Expires=${expires}` +
      `&Signature=${encodeURIComponent(signature)}`;

    console.log("Calling Moz API:", domain);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Moz API Error: ${response.status}`);
    }

    const data = await response.json();

    console.log("Moz Response:", data);

    return {
      domainAuthority: Math.round(data.pda || 0),
      spamScore: Math.round(data.fsq || 0),
    };
  }
}



export async function getMozMetrics(
  urlOrDomain: string
): Promise<MozMetrics> {
  const domain = normalizeDomain(urlOrDomain);

  console.log("================================");
  console.log("Input URL:", urlOrDomain);
  console.log("Normalized Domain:", domain);
  console.log("Provider:", activeProvider.name);
  console.log("================================");

  if (!isValidDomain(domain)) {
    throw new Error(`Invalid domain: ${domain}`);
  }

  return activeProvider.getMetrics(domain);
}

export async function getDomainAuthority(
  domain: string
): Promise<number> {
  const metrics = await getMozMetrics(domain);
  return metrics.domainAuthority;
}

export async function getSpamScore(
  domain: string
): Promise<number> {
  const metrics = await getMozMetrics(domain);
  return metrics.spamScore;
}

const activeProvider: MozProvider =
  MOZ_ACCESS_ID && MOZ_SECRET_KEY
    ? new MozApiProvider(MOZ_ACCESS_ID, MOZ_SECRET_KEY)
    : new MockMozProvider();