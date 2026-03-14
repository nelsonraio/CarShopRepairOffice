import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { JWTPayload } from "jose";

export interface UserJwtPayload extends JWTPayload {
  id: number;
  email: string;
  nome_completo: string;
  nome_utilizador: string;
  papel: string;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Lê o cookie 'token', verifica o JWT e devolve o payload do utilizador.
 * @returns O payload JWT se o token for válido, caso contrário null.
 */
export async function getJwtPayload(): Promise<UserJwtPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("token");

  if (cookie?.value) {
    try {
      const { payload } = await jwtVerify<UserJwtPayload>(cookie.value, secret, {
        algorithms: ["HS256"],
      });
      return payload;
    } catch (error) {
      console.error("Token inválido:", error);
      return null;
    }
  }
  return null;
}
