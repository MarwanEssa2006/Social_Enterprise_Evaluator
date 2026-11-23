import "server-only";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, extname } from "node:path";

// TD-23: allow-listed types, 5 MB limit, random names, stored outside public/.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".csv": "text/csv",
  ".txt": "text/plain",
};
// Magic-number checks for binary types.
const SIGNATURES: Record<string, number[][]> = {
  ".pdf": [[0x25, 0x50, 0x44, 0x46]],
  ".png": [[0x89, 0x50, 0x4e, 0x47]],
  ".jpg": [[0xff, 0xd8, 0xff]],
  ".jpeg": [[0xff, 0xd8, 0xff]],
  ".xlsx": [[0x50, 0x4b, 0x03, 0x04]],
  ".docx": [[0x50, 0x4b, 0x03, 0x04]],
};

export function uploadDir() {
  return resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "data/uploads");
}

export interface StoredFile { file_name: string; file_path: string; file_mime: string; file_size: number }

export async function storeUpload(file: File | null): Promise<StoredFile | null | "invalid"> {
  if (!file || file.size === 0) return null;
  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED[ext] || file.size > MAX_UPLOAD_BYTES) return "invalid";
  const buf = Buffer.from(await file.arrayBuffer());
  const sigs = SIGNATURES[ext];
  if (sigs && !sigs.some((s) => s.every((b, i) => buf[i] === b))) return "invalid";
  const dir = uploadDir();
  mkdirSync(dir, { recursive: true });
  const stored = `${crypto.randomUUID()}${ext}`;
  writeFileSync(join(/*turbopackIgnore: true*/ dir, stored), buf);
  const safeName = file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120);
  return { file_name: safeName, file_path: stored, file_mime: ALLOWED[ext], file_size: file.size };
}

export function readStored(storedName: string): Buffer | null {
  if (!/^[0-9a-f-]{36}\.[a-z]{3,4}$/.test(storedName)) return null; // no path traversal
  const p = join(/*turbopackIgnore: true*/ uploadDir(), storedName);
  return existsSync(/*turbopackIgnore: true*/ p) ? readFileSync(/*turbopackIgnore: true*/ p) : null;
}

export function downloadResponse(buf: Buffer, name: string, mime: string): Response {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
