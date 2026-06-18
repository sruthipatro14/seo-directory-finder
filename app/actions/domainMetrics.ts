'use server';

import { getMozMetrics } from "@/services/mozService";

export async function bulkDaSpamCheck(urls: string[]) {
  return Promise.all(
    urls.map(async (url) => {
      try {
        const metrics = await getMozMetrics(url);

        return {
          url,
          domainAuthority: metrics.domainAuthority,
          spamScore: metrics.spamScore,
          success: true,
        };
      } catch (error) {
        return {
          url,
          domainAuthority: null,
          spamScore: null,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        };
      }
    })
  );
}