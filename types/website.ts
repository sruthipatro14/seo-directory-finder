export interface Website {
  id: string;
  name: string;
  url: string;
  domainAuthority: number;
  spamScore: number;
  freeListing: boolean;
  industry: string;
  daCategory: "Low" | "Average" | "Excellent";
  active: boolean;
}
