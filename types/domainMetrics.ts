export interface DomainMetricResult {
  url: string;
  domainAuthority: number | null;
  spamScore: number | null;
  success: boolean;
  error?: string;
}