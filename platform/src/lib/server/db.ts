import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { isDemoMode } from "./mode";
import { seedDemoData } from "./demo";

// TD-02: SQLite via node:sqlite. Migrations are append-only.
const MIGRATIONS: string[] = [
  `
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'ar',
    created_at TEXT NOT NULL
  );
  CREATE TABLE sessions (
    id TEXT PRIMARY KEY,               -- SHA-256 of the session token (raw token never stored)
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX sessions_user ON sessions(user_id);

  CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    area TEXT NOT NULL DEFAULT '',
    beneficiary_model TEXT NOT NULL DEFAULT 'undetermined',
    grants_cover_costs INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX projects_owner ON projects(owner_id);

  CREATE TABLE draft_answers (
    project_id TEXT NOT NULL REFERENCES projects(id),
    question_id TEXT NOT NULL,
    option_index INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (project_id, question_id)
  );

  CREATE TABLE evidence_items (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    criterion TEXT NOT NULL,
    dimension TEXT NOT NULL,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    numeric_value REAL,
    file_name TEXT,
    file_path TEXT,
    file_mime TEXT,
    file_size INTEGER,
    created_at TEXT NOT NULL
  );
  CREATE INDEX evidence_project ON evidence_items(project_id);

  CREATE TABLE assessments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    version INTEGER NOT NULL,
    methodology_version TEXT NOT NULL,
    input_snapshot TEXT NOT NULL,
    results TEXT NOT NULL,
    analysis TEXT NOT NULL,
    ai_meta TEXT NOT NULL,
    locale TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (project_id, version)
  );
  -- D-12 / D-32: historical assessments are never overwritten or deleted.
  CREATE TRIGGER assessments_immutable_update BEFORE UPDATE ON assessments
    BEGIN SELECT RAISE(ABORT, 'assessments are immutable'); END;
  CREATE TRIGGER assessments_immutable_delete BEFORE DELETE ON assessments
    BEGIN SELECT RAISE(ABORT, 'assessments are immutable'); END;

  CREATE TABLE recommendations (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL REFERENCES assessments(id),
    project_id TEXT NOT NULL REFERENCES projects(id),
    rec_key TEXT NOT NULL,
    criterion TEXT NOT NULL,
    dimension TEXT NOT NULL,
    priority TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started',
    status_updated_at TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX recommendations_assessment ON recommendations(assessment_id);
  -- Content of a saved recommendation is immutable; only status may change (D-14).
  CREATE TRIGGER recommendations_content_immutable BEFORE UPDATE OF content, rec_key, criterion, dimension, priority, assessment_id ON recommendations
    BEGIN SELECT RAISE(ABORT, 'recommendation content is immutable'); END;

  CREATE TABLE recommendation_evidence (
    id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL REFERENCES recommendations(id),
    note TEXT NOT NULL,
    file_name TEXT,
    file_path TEXT,
    file_mime TEXT,
    file_size INTEGER,
    created_at TEXT NOT NULL
  );

  CREATE TABLE ai_runs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    criterion TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    status TEXT NOT NULL,
    attempts INTEGER NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_ms INTEGER,
    error TEXT,
    created_at TEXT NOT NULL
  );
  `,
];

let db: DatabaseSync | null = null;

export function dbPath(): string {
  // Demo mode on a read-only host: the only writable place is the OS temp folder.
  const fallback = isDemoMode() ? join(tmpdir(), "sev-demo", "app.db") : "data/app.db";
  return resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH || fallback);
}

export function openDb(path = dbPath()): DatabaseSync {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const d = new DatabaseSync(path);
  d.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  migrate(d);
  return d;
}

export function migrate(d: DatabaseSync) {
  d.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)");
  const row = d.prepare("SELECT MAX(version) AS v FROM schema_migrations").get() as { v: number | null };
  const current = row.v ?? 0;
  for (let i = current; i < MIGRATIONS.length; i++) {
    d.exec("BEGIN");
    try {
      d.exec(MIGRATIONS[i]);
      d.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)").run(i + 1, new Date().toISOString());
      d.exec("COMMIT");
    } catch (e) {
      d.exec("ROLLBACK");
      throw e;
    }
  }
}

export function getDb(): DatabaseSync {
  if (!db) {
    db = openDb();
    if (isDemoMode()) seedDemoData(); // idempotent: same demo data on every instance
  }
  return db;
}

/** For tests: replace the singleton (e.g., with a temporary file). */
export function setDb(d: DatabaseSync | null) {
  db = d;
}

export function tx<T>(fn: () => T): T {
  const d = getDb();
  d.exec("BEGIN IMMEDIATE");
  try {
    const r = fn();
    d.exec("COMMIT");
    return r;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}

export const now = () => new Date().toISOString();
export const newId = () => crypto.randomUUID();
