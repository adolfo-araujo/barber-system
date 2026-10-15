import { handleApiError, json } from "@/app/_lib/api/http";
import { registerUser } from "@/app/_lib/services/users";

export const dynamic = "force-dynamic";

// POST /api/register — cria uma conta. Body: { name, email, password }
export async function POST(request: Request) {
  try {
    const user = await registerUser(await request.json());
    return json(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
