import { getAssessment, listRecommendations } from "@/lib/server/repo";
import { notFoundResponse, projectForRoute } from "@/lib/server/route-auth";
import { recContent, recText, viewAssessment } from "@/lib/server/views";
import { buildExcel } from "@/lib/exports/excel";
import { downloadResponse } from "@/lib/server/files";
import { getLocale } from "@/lib/i18n/server";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; v: string }> }) {
  const { id, v } = await ctx.params;
  const auth = await projectForRoute(id);
  if (!auth) return notFoundResponse();
  const row = getAssessment(auth.project.id, Number(v));
  if (!row) return notFoundResponse();
  const a = viewAssessment(row);
  const locale = await getLocale();
  const top: Record<string, string | undefined> = {};
  for (const r of listRecommendations(row.id)) {
    if (!top[r.criterion]) top[r.criterion] = recText(recContent(r), locale).title; // list is ordered by priority
  }
  const buf = await buildExcel(a.result, top, locale);
  return downloadResponse(buf, `alan-list-of-success-v${row.version}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}
