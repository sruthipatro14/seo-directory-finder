export function normalizeUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr.trim().toLowerCase());
    let hostname = url.hostname;
    if (hostname.startsWith('www.')) hostname = hostname.slice(4);
    const path = url.pathname.replace(/\/$/, "");
    // We keep protocol to distinguish http/https but strip www and trailing slashes
    return `${url.protocol}//${hostname}${path}`;
  } catch {
    return urlStr.trim().toLowerCase();
  }
}