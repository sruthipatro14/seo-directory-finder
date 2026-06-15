export interface Website {
  id: string;
  name: string;
  url: string;
  description?: string | null;
  domainAuthority: number;
  spamScore: number;
  estimatedTraffic?: number | null;
  contactEmail?: string | null;
  freeListing: boolean;
  industry: string;
  daCategory: "Low" | "Average" | "Excellent";
  active: boolean;
  createdAt?: string | Date | null;
}
