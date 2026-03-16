import { storageAdapter } from '@/lib/core/storage/storage.adapter';

const SESSION_KEY = 'pokedex_session';

export interface UserSession {
  email: string;
  name:  string;
  loggedInAt: string;
}

// ─── Guardar sesión ───────────────────────────────────────────────────────────

export async function saveSession(email: string, name: string): Promise<void> {
  const session: UserSession = {
    email,
    name,
    loggedInAt: new Date().toISOString(),
  };
  await storageAdapter.setItem(SESSION_KEY, JSON.stringify(session));
}

// ─── Obtener sesión ───────────────────────────────────────────────────────────

export async function getSession(): Promise<UserSession | null> {
  try {
    const raw = await storageAdapter.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

// ─── Cerrar sesión ────────────────────────────────────────────────────────────

export async function clearSession(): Promise<void> {
  await storageAdapter.removeItem(SESSION_KEY);
}

// ─── Validación simple (sin backend) ─────────────────────────────────────────
// Cuando conectes Supabase, reemplaza esto por supabase.auth.signInWithPassword()

export function validateCredentials(email: string, password: string): boolean {
  const emailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;
  return emailValid && passwordValid;
}