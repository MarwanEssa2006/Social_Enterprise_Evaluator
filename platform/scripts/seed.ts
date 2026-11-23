// Seeds realistic DUMMY data (D-39: no real personal or beneficiary data). Safe to re-run.
// The same data is created automatically at startup in demo mode (src/lib/server/demo.ts).
import { getDb } from "../src/lib/server/db";
import { seedDemoData } from "../src/lib/server/demo";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../src/lib/server/mode";

getDb();
const created = seedDemoData();
console.log(created ? "Seeded demo data." : "Demo data already present.", "Login:", DEMO_EMAIL, "/", DEMO_PASSWORD, "(test data only)");
