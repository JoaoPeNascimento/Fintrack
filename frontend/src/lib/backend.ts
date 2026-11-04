import { SignJWT } from 'jose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Server-only: every call to the Spring Boot API goes through here, so the
// shared secret and the signed token never reach the browser.

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const JWT_ISSUER = 'fintrack-web';
const JWT_AUDIENCE = 'fintrack-api';

export class BackendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type BackendUser = {
  email: string;
  name?: string | null;
  image?: string | null;
};

async function signBackendToken(user: BackendUser) {
  const secret = process.env.BACKEND_JWT_SECRET;
  if (!secret) {
    throw new BackendError(500, 'BACKEND_JWT_SECRET não configurado.');
  }

  return new SignJWT({ name: user.name ?? undefined, picture: user.image ?? undefined })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.email)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(secret));
}

/** Calls the backend on behalf of the given user. */
export async function callBackend<T>(
  user: BackendUser,
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await signBackendToken(user);

  const response = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload?.message ||
      (response.status === 401 ? 'Você precisa estar logado.' : 'Erro ao comunicar com o servidor.');
    throw new BackendError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

/** Calls the backend on behalf of the user in the current NextAuth session. */
export async function backendFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new BackendError(401, 'Você precisa estar logado.');
  }
  return callBackend<T>(session.user as BackendUser, path, init);
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
