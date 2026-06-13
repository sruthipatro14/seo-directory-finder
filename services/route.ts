import { NextResponse } from "next/server";
import { runDailyRefresh } from "@/services/schedulerService";

/**
 * Cron endpoint to trigger the daily refresh.
 * Secure this endpoint using a CRON_SECRET environment variable.
 */
export async function GET(request: Request) {
  // Security check: verify the secret from headers (Vercel sets this automatically if configured)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const stats = await runDailyRefresh();
    return NextResponse.json({
      status: "success",
      ...stats
    });
  } catch (error) {
    console.error("[Cron] Internal error:", error);
    return NextResponse.json({ status: "error", message: "Failed to run refresh" }, { status: 500 });
  }
}