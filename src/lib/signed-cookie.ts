import type { UserRole } from "@/types";

// ---------------------------------------------------------------------------
// Lightweight signed session tokens.
//
// The session cookie carries a small signed payload (user id, username,
// name, role, expiry) so `src/middleware.ts` (which runs on the Edge
// runtime) can verify who's logged in without hitting the database on every
// request. The signature uses the Web Crypto API (`crypto.subtle`), which is
// available as a global in both the Node.js runtime (18+) and the Edge
// runtime — so this same code works in Server Actions and in middleware.
//
// This is NOT a JWT library — it's a minimal HMAC-signed payload, which is
// enough for this app's needs. If you outgrow it, swap for NextAuth (see
// comments in src/lib/session.ts).
// ---------------------------------------------------------------------------

export interface SessionPayload {
  sub: string; // user id
  username: string;
  name: string;
  role: UserRole;
  beatCategorySlugs?: string[]; // for EDITOR accounts: their assigned news section(s)
  exp: number; // unix seconds
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET تنظیم نشده است. یک مقدار تصادفی و طولانی برای آن در تنظیمات محیطی Vercel اضافه کنید."
    );
  }
  return secret;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input + "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const key = await getKey(getSecret());
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${toBase64Url(signature)}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const key = await getKey(getSecret());
    const valid = await crypto.subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(body));
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(fromBase64Url(body))) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
