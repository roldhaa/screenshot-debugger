import { headers } from "next/headers";
import { handleAnalyze } from "@/lib/server/handle-analyze";

export const maxDuration = 60;

export async function POST(request: Request) {
  return handleAnalyze(request);
}

export async function GET() {
  await headers();
  return Response.json({
    demoProtected: Boolean(process.env.DEMO_ACCESS_TOKEN?.trim()),
  });
}
