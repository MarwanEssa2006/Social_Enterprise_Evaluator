import { getRecommendation, getRecommendationEvidence } from "@/lib/server/repo";
import { notFoundResponse, projectForRoute } from "@/lib/server/route-auth";
import { downloadResponse, readStored } from "@/lib/server/files";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; rid: string; fid: string }> }) {
  const { id, rid, fid } = await ctx.params;
  const auth = await projectForRoute(id);
  if (!auth) return notFoundResponse();
  const rec = getRecommendation(auth.project.id, rid);
  if (!rec) return notFoundResponse();
  const e = getRecommendationEvidence(rec.id, fid);
  if (!e?.file_path) return notFoundResponse();
  const buf = readStored(e.file_path);
  if (!buf) return notFoundResponse();
  return downloadResponse(buf, e.file_name ?? "evidence", e.file_mime ?? "application/octet-stream");
}
