import { createHmac, timingSafeEqual, createHash } from "node:crypto";

// Stateless session tokens for demo mode (serverless: no shared database between instances).
// Format: s1.<userId>.<expiresMs>.<HMAC-SHA256>. Tampering or expiry → rejected.
export function signSession(userId: string, expiresMs: number, secret: string): string {
  const body = `s1.${userId}.${expiresMs}`;
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}

export function verifySession(token: string, secret: string, nowMs = Date.now()): string | null {
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "s1") return null;
  const [, userId, exp, mac] = parts;
  const expected = createHmac("sha256", secret).update(`s1.${userId}.${exp}`).digest();
  const given = Buffer.from(mac, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (!/^\d+$/.test(exp) || Number(exp) < nowMs) return null;
  return userId;
}

/** SESSION_SECRET is strongly recommended in demo deployments. The fallback is derived from the
 *  deployment's project/environment variables and is only acceptable for dummy demo data. */
export function sessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) return process.env.SESSION_SECRET;
  const seed = [process.env.VERCEL_PROJECT_ID, process.env.VERCEL_ENV, process.env.VERCEL_URL, "sev-demo-fallback"].join("|");
  return createHash("sha256").update(seed).digest("hex");
}
