// Demo mode: for serverless hosts (e.g., Vercel) without persistent storage.
// Each server instance builds its own temporary SQLite database and seeds the same demo data,
// so the demo account works on every instance. Data created by users is temporary.
// On by default on Vercel (VERCEL env var); force with DEMO_MODE=1, disable with DEMO_MODE=0.
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "0") return false;
  return process.env.DEMO_MODE === "1" || !!process.env.VERCEL;
}

/** Test-only demo credentials, shown on the login page in demo mode. Dummy data only (D-39). */
export const DEMO_EMAIL = "demo@example.test";
export const DEMO_PASSWORD = "demo-password-123";
