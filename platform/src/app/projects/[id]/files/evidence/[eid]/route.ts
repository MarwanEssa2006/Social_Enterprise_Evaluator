import { getEvidence } from "@/lib/server/repo";
import { notFoundResponse, projectForRoute } from "@/lib/server/route-auth";
import { downloadResponse, readStored } from "@/lib/server/files";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; eid: string }> }) {
  const { id, eid } = await ctx.params;
  const auth = await projectForRoute(id);
  if (!auth) return notFoundResponse();
  const e = getEvidence(auth.project.id, eid);
  if (!e?.file_path) return notFoundResponse();
  const buf = readStored(e.file_path);
  if (!buf) return notFoundResponse();
  return downloadResponse(buf, e.file_name ?? "evidence", e.file_mime ?? "application/octet-stream");
}
