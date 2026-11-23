// Demo mode (serverless hosts): signed sessions and deterministic demo seed.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { signSession, verifySession } from "@/lib/server/signed-session";
import { openDb, setDb, getDb } from "@/lib/server/db";
import { seedDemoData } from "@/lib/server/demo";
import * as repo from "@/lib/server/repo";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/server/mode";
import { verifyPassword } from "@/lib/server/passwords";

describe("Signed sessions", () => {
  const secret = "test-secret-0123456789";
  it("round-trips the user id", () => {
    const t = signSession("user-1", Date.now() + 60_000, secret);
    expect(verifySession(t, secret)).toBe("user-1");
  });
  it("rejects tampering, wrong secret, and expiry", () => {
    const t = signSession("user-1", Date.now() + 60_000, secret);
    expect(verifySession(t.replace("user-1", "user-2"), secret)).toBeNull();
    expect(verifySession(t, "another-secret-xxxxxx")).toBeNull();
    expect(verifySession(signSession("user-1", Date.now() - 1, secret), secret)).toBeNull();
    expect(verifySession("garbage", secret)).toBeNull();
  });
});

describe("Demo seed", () => {
  const dirs: string[] = [];
  const fresh = () => {
    const d = mkdtempSync(join(tmpdir(), "sev-demo-test-"));
    dirs.push(d);
    setDb(openDb(join(d, "demo.db")));
  };
  beforeAll(fresh);
  afterAll(() => {
    getDb().close();
    setDb(null);
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  });

  it("creates the demo account and projects once, with fixed ids on every instance", () => {
    expect(seedDemoData()).toBe(true);
    expect(seedDemoData()).toBe(false); // idempotent
    const u = repo.findUserByEmail(DEMO_EMAIL)!;
    expect(verifyPassword(DEMO_PASSWORD, u.password_hash)).toBe(true);
    const ids = repo.listProjects(u.id).map((p) => p.id).sort();
    expect(repo.listAssessments("00000000-0000-4000-8000-0000000000a1")).toHaveLength(2);

    getDb().close(); // a second "instance"
    fresh();
    seedDemoData();
    const u2 = repo.findUserByEmail(DEMO_EMAIL)!;
    expect(u2.id).toBe(u.id);
    expect(repo.listProjects(u2.id).map((p) => p.id).sort()).toEqual(ids);
  });
});
