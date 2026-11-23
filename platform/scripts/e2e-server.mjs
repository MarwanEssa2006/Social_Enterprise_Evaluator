// Starts the production server for E2E tests with a fresh, isolated database and upload folder.
import { rmSync } from "node:fs";
import { spawn } from "node:child_process";

rmSync("data/e2e", { recursive: true, force: true });
const env = {
  ...process.env,
  DATABASE_PATH: "data/e2e/e2e.db",
  UPLOAD_DIR: "data/e2e/uploads",
  AI_MODE: "mock",
  INSECURE_COOKIES: "1",
  PORT: "3100",
};
const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", "3100"], { env, stdio: "inherit", shell: process.platform === "win32" });
const stop = () => child.kill();
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", (code) => process.exit(code ?? 0));
