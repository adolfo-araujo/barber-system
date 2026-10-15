import { db } from "@/app/_lib/prisma";
import { json } from "@/app/_lib/api/http";

export const dynamic = "force-dynamic";

// GET /api/health — verifica se a aplicação e o banco de dados estão respondendo
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return json({ status: "ok", database: "ok", timestamp: new Date().toISOString() });
  } catch {
    return json({ status: "error", database: "unreachable", timestamp: new Date().toISOString() }, 503);
  }
}
