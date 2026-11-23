// Excel export (TD-21, TD-22): populates Alan's ORIGINAL template. Only the eight response cells in the
// worksheet XML are changed; every other part of the package is copied unchanged.
import JSZip from "jszip";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CRITERIA } from "../questions/criteria";
import type { AssessmentResult, DimensionResult } from "../scoring/types";
import { DICTS, type Locale } from "../i18n/dict";

export const TEMPLATE_PATH = () => resolve(/*turbopackIgnore: true*/ process.env.EXCEL_TEMPLATE_PATH || "assets/alan-template.xlsx");
const SHEET = "xl/worksheets/sheet1.xml";

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function setInlineString(sheetXml: string, ref: string, text: string): string {
  const cellRe = new RegExp(`<c r="${ref}"([^>]*?)(/>|>[\\s\\S]*?</c>)`);
  const m = sheetXml.match(cellRe);
  if (!m) throw new Error(`Template cell ${ref} not found`);
  const attrs = m[1].replace(/\s+t="[^"]*"/, "");
  const cell = `<c r="${ref}"${attrs} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(text)}</t></is></c>`;
  return sheetXml.replace(cellRe, cell);
}

function dimText(d: DimensionResult, locale: Locale) {
  const t = DICTS[locale];
  if (d.status === "scored") return `${d.score}/5 (${t.readings[d.reading]})`;
  if (d.status === "not_applicable") return t.res.na;
  return t.res.notScored;
}

export function cellTexts(result: AssessmentResult, topRecTitles: Record<string, string | undefined>, locale: Locale): Record<string, string> {
  const t = DICTS[locale];
  const out: Record<string, string> = {};
  for (const c of result.criteria) {
    const meta = CRITERIA.find((m) => m.id === c.id)!;
    const parts = [
      `${t.res.commercial}: ${dimText(c.commercial, locale)}`,
      `${t.res.social}: ${dimText(c.social, locale)}`,
      `${t.res.confidence}: ${t.confidence[c.confidence]}`,
    ];
    if (topRecTitles[c.id]) parts.push(`${locale === "ar" ? "أولوية" : "Priority"}: ${topRecTitles[c.id]}`);
    out[meta.templateCell] = parts.join(" | ");
  }
  return out;
}

export async function buildExcel(result: AssessmentResult, topRecTitles: Record<string, string | undefined>, locale: Locale): Promise<Buffer> {
  const zip = await JSZip.loadAsync(readFileSync(/*turbopackIgnore: true*/ TEMPLATE_PATH()));
  let xml = await zip.file(SHEET)!.async("string");
  for (const [ref, text] of Object.entries(cellTexts(result, topRecTitles, locale))) xml = setInlineString(xml, ref, text);
  zip.file(SHEET, xml, { createFolders: false }); // do not add folder entries the template does not have
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
