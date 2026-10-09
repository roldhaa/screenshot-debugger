import { handleInvestigate } from "@/lib/server/handle-investigate";

export const maxDuration = 60;

export async function POST(request: Request) {
  return handleInvestigate(request);
}
