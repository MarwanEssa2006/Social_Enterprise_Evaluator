// Export tests: the Excel file must be Alan's original template with only the 8 response cells filled (TD-21);
// the PDF must be generated from saved results.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import JSZip from "jszip";
import ExcelJS from "exceljs";
import { buildExcel, TEMPLATE_PATH } from "@/lib/exports/excel";
import { reportHtml } from "@/lib/exports/report-html";
import { htmlToPdf } from "@/lib/exports/pdf";
import { runAssessment } from "@/lib/scoring/engine";
import { selectRecommendations } from "@/lib/recommendations/select";
import { runAnalysis } from "@/lib/ai/pipeline";
import { MockProvider } from "@/lib/ai/mock";
import { allFirst, input } from "./helpers";

const i = input({ ...allFirst(), "C2-Q1": 2, "C3-Q1": 5 }); // C3 main question unknown → C3 commercial Not Scored
const result = runAssessment(i);

describe("Excel export (Alan's template)", () => {
  it("keeps every package part identical except the worksheet", async () => {
    const out = await buildExcel(result, { C1: "Grow the paying market" }, "ar");
    const a = await JSZip.loadAsync(readFileSync(TEMPLATE_PATH()));
    const b = await JSZip.loadAsync(out);
    expect(Object.keys(b.files).sort()).toEqual(Object.keys(a.files).sort());
    for (const name of Object.keys(a.files)) {
      if (a.files[name].dir || name === "xl/worksheets/sheet1.xml") continue;
      expect(await b.file(name)!.async("string"), name).toBe(await a.file(name)!.async("string"));
    }
  });

  it("only the 8 response cells change; sheet, notes, merges preserved", async () => {
    const out = await buildExcel(result, { C1: "Grow the paying market" }, "ar");
    const tpl = new ExcelJS.Workbook();
    await tpl.xlsx.readFile(TEMPLATE_PATH());
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(out as unknown as ArrayBuffer);
    expect(wb.worksheets.map((w) => w.name)).toEqual(["نموذج الآن للنجاح"]);
    const ws = wb.worksheets[0], wt = tpl.worksheets[0];
    const changed: string[] = [];
    wt.eachRow({ includeEmpty: true }, (row, r) => row.eachCell({ includeEmpty: true }, (cell, c) => {
      const o = ws.getRow(r).getCell(c);
      // Cells inside a merged range report the master cell's value; compare master cells only.
      if (o.master.address === o.address && JSON.stringify(o.value) !== JSON.stringify(cell.value)) changed.push(cell.address);
      expect(JSON.stringify(o.note ?? null)).toBe(JSON.stringify(cell.note ?? null));
    }));
    expect(changed.sort()).toEqual(["C14", "C5", "F14", "F5", "I14", "I5", "L14", "L5"].sort());
    expect(String(ws.getCell("C5").value)).toContain("5/5");
    expect(String(ws.getCell("C5").value)).toContain("Grow the paying market");
    expect(String(ws.getCell("F5").value)).toContain("3/5");
    expect(String(ws.getCell("I5").value)).toContain("غير مُقيَّم"); // C3 commercial Not Scored (unknown answer)
    expect(ws.getCell("C3").value).toBe("سوق كبير");
    expect(Object.keys((ws as unknown as { _merges: object })._merges).length).toBe(Object.keys((wt as unknown as { _merges: object })._merges).length);
  });
});

describe("PDF report", () => {
  it("renders a PDF with Chromium from saved results (AR and EN)", async () => {
    const selected = selectRecommendations(result.criteria, i.answers);
    for (const locale of ["ar", "en"] as const) {
      const analysis = await runAnalysis(result, i.answers, i.context, i.evidence, selected, { provider: new MockProvider(), lang: locale, sleep: async () => {} });
      const html = reportHtml({
        project: { name: "Test Co-op", description: "Dummy data", country: "Egypt", area: "Assiut", beneficiaryModel: "workers", grantsCoverCosts: false },
        version: 1, methodology: "M1.0", createdAt: new Date().toISOString(), result, answers: i.answers, analysis,
        recommendations: analysis.recommendations.map((r) => ({ priority: r.priority, status: "not_started", content: r })),
      }, locale);
      expect(html).toContain(locale === "ar" ? 'dir="rtl"' : 'dir="ltr"');
      const pdf = await htmlToPdf(html);
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
      expect(pdf.length).toBeGreaterThan(20_000);
    }
  }, 120_000);
});
