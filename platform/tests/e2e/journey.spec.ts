import { test, expect, type Page } from "@playwright/test";

const uid = Date.now();
const PASSWORD = "e2e-test-password-1"; // test-only credential for the isolated E2E database

async function register(page: Page, email: string) {
  await page.goto("/register");
  await page.fill("#name", "E2E Tester");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL("**/dashboard");
}

async function createProject(page: Page, name: string, model = "workers") {
  await page.goto("/projects/new");
  await page.fill("#name", name);
  await page.fill("#country", "Egypt");
  await page.fill("#area", "Minya");
  await page.check(`input[name=beneficiaryModel][value=${model}]`);
  await page.click("button[type=submit]");
  await page.waitForURL("**/questions");
  return page.url().split("/projects/")[1].split("/")[0];
}

/** Answer every question on every criterion page. choose(qid) returns the option index. */
async function answerAll(page: Page, projectId: string, choose: (qid: string) => number) {
  for (let c = 1; c <= 8; c++) {
    await page.goto(`/projects/${projectId}/questions?c=C${c}`);
    const ids = [1, 2, 3, 4].map((q) => `C${c}-Q${q}`);
    if (c === 1) ids.push("C1-EF");
    for (const qid of ids) await page.check(`input[name="q:${qid}"][value="${choose(qid)}"]`);
    await page.click(c < 8 ? `button[name=next][value=C${c + 1}]` : "button[name=next][value=submit]");
    await page.waitForLoadState("networkidle");
  }
}

test("full journey: assess, track, reassess, compare, export", async ({ page }) => {
  await register(page, `founder-${uid}@example.test`);
  const pid = await createProject(page, "E2E Weaving Co-op (dummy)");

  // Submission is blocked until everything is answered (D-24)
  await page.goto(`/projects/${pid}/submit`);
  await expect(page.locator("text=C1-Q1").first()).toBeVisible();

  await answerAll(page, pid, (qid) => (qid === "C2-Q1" ? 2 : qid === "C1-EF" ? 3 : 0));
  await page.waitForURL(`**/projects/${pid}/submit`);
  await page.click("button[type=submit]");
  await page.waitForURL(`**/projects/${pid}/assessments/1`, { timeout: 60_000 });
  await expect(page.getByText("التصنيف العام")).toBeVisible();
  const commercialV1 = await page.locator("text=/\\d\\.\\d/").first().textContent();

  // Criterion details
  await page.goto(`/projects/${pid}/assessments/1/criteria/C2`);
  await expect(page.getByText("هوامش ربح كبيرة").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "التحليل" })).toBeVisible();

  // Mark a recommendation Completed — scores must not change (D-14)
  await page.goto(`/projects/${pid}/recommendations`);
  const firstStatus = page.locator("select[name=status]").first();
  await firstStatus.selectOption("completed");
  await page.locator("form:has(select[name=status]) button").first().click();
  await page.waitForLoadState("networkidle");
  await page.reload(); // check what was persisted, not client-side form state
  await expect(page.locator("select[name=status]").first()).toHaveValue("completed");
  await page.goto(`/projects/${pid}/assessments/1`);
  expect(await page.locator("text=/\\d\\.\\d/").first().textContent()).toBe(commercialV1);

  // Results, recommendations and progress pages must not overflow at phone width
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of [`/projects/${pid}/assessments/1`, `/projects/${pid}/assessments/1/criteria/C1`, `/projects/${pid}/recommendations`]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} at 375px`).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 1280, height: 800 });

  // Exports
  const pdf = await page.request.get(`/projects/${pid}/assessments/1/report.pdf`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  const xlsx = await page.request.get(`/projects/${pid}/assessments/1/export.xlsx`);
  expect(xlsx.status()).toBe(200);
  expect((await xlsx.body()).subarray(0, 2).toString()).toBe("PK");

  // Improve the margin answer and reassess → version 2; version 1 unchanged
  await page.goto(`/projects/${pid}/questions?c=C2`);
  await page.check('input[name="q:C2-Q1"][value="0"]');
  await page.click("button[name=next][value=C2]");
  await page.waitForLoadState("networkidle");
  await page.goto(`/projects/${pid}/submit`);
  await page.click("button[type=submit]");
  await page.waitForURL(`**/projects/${pid}/assessments/2`, { timeout: 60_000 });

  await page.goto(`/projects/${pid}/progress?from=1&to=2`);
  await expect(page.getByText("تغيّر في المشروع (إجابات أو أدلة جديدة)").first()).toBeVisible();
  await page.goto(`/projects/${pid}/assessments/1`);
  expect(await page.locator("text=/\\d\\.\\d/").first().textContent()).toBe(commercialV1);
});

test("another user's project is not accessible", async ({ browser }) => {
  const a = await browser.newPage();
  await register(a, `owner-${uid}@example.test`);
  const pid = await createProject(a, "Private project (dummy)");
  const b = await browser.newPage();
  await register(b, `intruder-${uid}@example.test`);
  const res = await b.goto(`/projects/${pid}`);
  expect(res?.status()).toBe(404);
  expect((await b.request.get(`/projects/${pid}/assessments/1/report.pdf`)).status()).toBe(404);
  expect((await b.request.get(`/projects/${pid}/assessments/1/export.xlsx`)).status()).toBe(404);
  const anon = await browser.newPage();
  await anon.goto(`/projects/${pid}`);
  await expect(anon).toHaveURL(/\/login$/);
});

test("language switch and service-user N/A, responsive layout", async ({ page }) => {
  await register(page, `lang-${uid}@example.test`);
  const pid = await createProject(page, "Learning hub (dummy)", "service_users");
  await page.goto(`/projects/${pid}/questions?c=C2`);
  await expect(page.getByText("لا ينطبق على نموذج المستفيدين لديك").first()).toBeVisible();
  expect(await page.locator("html").getAttribute("dir")).toBe("rtl");
  await page.getByRole("button", { name: "English" }).click();
  await page.waitForLoadState("networkidle");
  expect(await page.locator("html").getAttribute("dir")).toBe("ltr");
  await expect(page.getByText("Evaluation questions")).toBeVisible();

  for (const vp of [{ width: 375, height: 812 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(vp);
    for (const path of ["/dashboard", `/projects/${pid}`, `/projects/${pid}/questions?c=C1`]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} at ${vp.width}px`).toBeLessThanOrEqual(1);
    }
  }
});
