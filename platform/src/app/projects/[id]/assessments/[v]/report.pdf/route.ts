import { getAssessment, listRecommendations } from "@/lib/server/repo";
import { notFoundResponse, projectForRoute } from "@/lib/server/route-auth";
import { recContent, viewAssessment } from "@/lib/server/views";
import { reportHtml } from "@/lib/exports/report-html";
import { htmlToPdf } from "@/lib/exports/pdf";
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
  const html = reportHtml(
    {
      project: { name: auth.project.name, description: auth.project.description, country: a.input.context.country, area: a.input.context.area, beneficiaryModel: a.input.context.beneficiaryModel, grantsCoverCosts: a.input.context.grantsCoverCosts },
      version: row.version, methodology: row.methodology_version, createdAt: row.created_at, result: a.result, answers: a.input.answers,
      analysis: a.analysis, recommendations: listRecommendations(row.id).map((r) => ({ priority: r.priority, status: r.status, content: recContent(r) })),
    },
    locale,
  );
  try {
    const pdf = await htmlToPdf(html);
    return downloadResponse(pdf, `assessment-v${row.version}.pdf`, "application/pdf");
  } catch (e) {
    // Hosts without Chromium (e.g., Vercel functions): serve the same report as a printable page.
    console.error("PDF rendering unavailable; serving printable HTML", e instanceof Error ? e.message.slice(0, 200) : e);
    const note = locale === "ar"
      ? "توليد ملف PDF غير متاح على هذا الخادم. اطبع هذه الصفحة واحفظها PDF من المتصفح (Ctrl+P)."
      : "PDF generation is not available on this server. Print this page and save it as PDF from your browser (Ctrl+P).";
    const printable = html.replace("<body>", `<body><p style="background:#fff7e6;color:#7a4b00;padding:8px 12px;border-radius:6px;font-weight:600" class="no-print">${note}</p><style>@media print{.no-print{display:none}}</style>`);
    return new Response(printable, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  }
}
