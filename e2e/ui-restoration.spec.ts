import { test, expect } from "@playwright/test";
import { signInFixture } from "./fixtures/api";
const routes: {
  name: string;
  path: string;
  role?: "pasien" | "dokter" | "admin";
}[] = [
  { name: "home", path: "/" },
  { name: "how-it-works", path: "/how-it-works" },
  { name: "faq", path: "/faq" },
  { name: "login", path: "/auth/login" },
  { name: "register", path: "/auth/register" },
  { name: "password-reset", path: "/auth/reset-password" },
  { name: "patient-dashboard", path: "/patient/dashboard", role: "pasien" },
  { name: "patient-monitor", path: "/patient/monitor", role: "pasien" },
  { name: "patient-history", path: "/patient/history", role: "pasien" },
  { name: "patient-recording", path: "/patient/history/ses_A", role: "pasien" },
  { name: "patient-profile", path: "/patient/profile", role: "pasien" },
  { name: "patient-settings", path: "/patient/settings", role: "pasien" },
  { name: "patient-consent", path: "/patient/qr-sync", role: "pasien" },
  {
    name: "patient-device-scanner",
    path: "/patient/device-scanner",
    role: "pasien",
  },
  { name: "doctor-dashboard", path: "/doctor/dashboard", role: "dokter" },
  { name: "doctor-history", path: "/doctor/analytics", role: "dokter" },
  {
    name: "doctor-recording",
    path: "/doctor/analytics?sessionId=ses_A",
    role: "dokter",
  },
  {
    name: "doctor-monitor",
    path: "/doctor/monitor?patient_id=pat_A",
    role: "dokter",
  },
  { name: "doctor-profile", path: "/doctor/profile", role: "dokter" },
  { name: "doctor-scanner", path: "/doctor/qr-scanner", role: "dokter" },
  { name: "admin-dashboard", path: "/admin/dashboard", role: "admin" },
  { name: "admin-users", path: "/admin/users", role: "admin" },
  { name: "admin-devices", path: "/admin/devices", role: "admin" },
  { name: "admin-sessions", path: "/admin/sessions", role: "admin" },
  { name: "admin-history", path: "/admin/analytics", role: "admin" },
  {
    name: "admin-recording",
    path: "/admin/analytics?sessionId=ses_A",
    role: "admin",
  },
  {
    name: "admin-monitor",
    path: "/admin/monitor?patient_id=pat_A",
    role: "admin",
  },
];
for (const width of [1440, 390]) {
  test.describe(width === 1440 ? "restored desktop" : "restored mobile", () => {
    test.use({ viewport: { width, height: 900 } });
    for (const screen of routes)
      test(screen.name, async ({ page }, info) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        if (screen.role) await signInFixture(page, screen.role);
        else {
          await page.route("**/api/**", (route) =>
            route.fulfill({
              status: 401,
              contentType: "application/json",
              body: '{"message":"Authentication required"}',
            }),
          );
          await page.route("https://**/auth/v1/**", (route) =>
            route.fulfill({
              status: 401,
              contentType: "application/json",
              body: '{"message":"No fixture session"}',
            }),
          );
        }
        await page.goto(screen.path, { waitUntil: "domcontentloaded" });
        await expect(page.locator("h1,h2").first()).toBeVisible({
          timeout: 15000,
        });
        if (screen.role) await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
          )
          .toBe(true);
        await page.screenshot({
          path: info.outputPath(screen.name + "-" + width + ".png"),
          fullPage: true,
          animations: "disabled",
        });
        expect(errors).toEqual([]);
      });
  });
}
test("administrator sidebar collapses without covering the user table", async ({
  page,
}) => {
  await signInFixture(page, "admin");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/admin/users");
  await page.getByTitle("Sembunyikan Sidebar", { exact: true }).click();
  await expect(
    page.getByTitle("Tampilkan Sidebar", { exact: true }),
  ).toBeVisible();
  const sidebar = page.locator("#main-sidebar");
  await expect
    .poll(async () => Math.round((await sidebar.boundingBox())?.width || 0))
    .toBe(72);
  await page.getByTitle("Tampilkan Sidebar", { exact: true }).click();
  await expect
    .poll(async () => Math.round((await sidebar.boundingBox())?.width || 0))
    .toBe(260);
  await page.getByRole("button", { name: "Tambah Manual" }).click();
  await expect(
    page.getByRole("heading", { name: /Tambah.*Pengguna|Tambah.*Akun/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Batal", exact: true }).last().click();
});
test("mobile doctor menu opens and navigation closes it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInFixture(page, "dokter");
  await page.goto("/doctor/analytics");
  await page.getByTitle("Sembunyikan / Tampilkan Menu Utama").first().click();
  await page
    .locator("#main-sidebar")
    .getByRole("link", { name: /Dashboard/i })
    .click();
  await expect(page).toHaveURL(/\/doctor\/dashboard/);
  await expect
    .poll(() =>
      page
        .locator("#main-sidebar")
        .evaluate((element) => element.getBoundingClientRect().bottom <= 0),
    )
    .toBe(true);
});
test("manual scanner requires consent and only shows success after server acceptance", async ({
  page,
}) => {
  await signInFixture(page, "pasien");
  await page.goto("/patient/device-scanner");
  await page.getByLabel("ID perangkat", { exact: true }).fill("dev_A");
  await page
    .getByRole("button", { name: "Hubungkan Alat", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "kode pairing wajib diisi",
  );
  await page.getByRole("button", { name: "Tutup dan Coba Lagi" }).click();
  await page
    .getByLabel("Kode pairing administrator")
    .fill("synthetic-device-code");
  const request = page.waitForRequest((request) =>
    request.url().includes("/api/devices/dev_A/assign"),
  );
  await page
    .getByRole("button", { name: "Hubungkan Alat", exact: true })
    .click();
  expect((await request).postDataJSON()).toEqual({
    patient_id: "pat_A",
    code: "synthetic-device-code",
  });
  await expect(
    page.getByRole("heading", { name: "Alat Terhubung!" }),
  ).toBeVisible();
});

test("administrator expands patient sessions and opens the clinical recording", async ({
  page,
}) => {
  await signInFixture(page, "admin");
  await page.goto("/admin/sessions");
  await page.getByLabel("Tampilan rekaman").selectOption("patients");
  await expect(
    page.getByRole("columnheader", { name: "Total Sesi", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lihat Sesi", exact: true }).click();
  await page.getByRole("button", { name: "ses_A", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/analytics\?sessionId=ses_A/);
  await expect(
    page.getByRole("heading", { name: "Edge AI Prediction", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Status Validasi Medis", exact: true }),
  ).toBeVisible();
});

test("test patient remains pinned across pages and switches to the named doctor account", async ({
  page,
}, info) => {
  await signInFixture(page, "admin", { testAccounts: true });
  await page.goto("/admin/users");
  const quick = page.getByRole("region", {
    name: "Akses Cepat Akun Uji Coba",
    exact: true,
  });
  await expect(
    quick.getByRole("cell", { name: /Patient Test$/ }),
  ).toBeVisible();
  await expect(quick.getByText("pat_trial", { exact: false })).toBeVisible();
  await expect(
    quick.getByRole("button", { name: "Login", exact: false }),
  ).toBeVisible();
  await quick.getByRole("row").last().hover();
  await quick.screenshot({
    path: info.outputPath("trial-patient.png"),
    animations: "disabled",
  });
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(
    page.getByRole("cell", { name: /Synthetic Patient 11$/ }),
  ).toBeVisible();
  await expect(
    quick.getByRole("cell", { name: /Patient Test$/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dokter", exact: true }).click();
  await expect(quick.getByRole("cell", { name: /Doctor Test$/ })).toBeVisible();
  await expect(quick.getByRole("cell", { name: /Patient Test$/ })).toHaveCount(
    0,
  );
  await quick.getByRole("row").last().hover();
  await quick.screenshot({
    path: info.outputPath("trial-doctor.png"),
    animations: "disabled",
  });
});
test("missing test account shows an empty state instead of loading forever", async ({
  page,
}) => {
  await signInFixture(page, "admin");
  await page.goto("/admin/users");
  const quick = page.getByRole("region", {
    name: "Akses Cepat Akun Uji Coba",
    exact: true,
  });
  await expect(quick).toContainText(
    "Akun uji coba Patient Test tidak ditemukan.",
  );
  await expect(quick.getByRole("status")).toHaveCount(0);
});
test("test account lookup reports an error and retries explicitly", async ({
  page,
}) => {
  await signInFixture(page, "admin", { testAccounts: true });
  let failed = false;
  await page.route("**/api/admin/users?**", async (route) => {
    const url = new URL(route.request().url());
    if (
      !failed &&
      url.searchParams.get("role") === "pasien" &&
      url.searchParams.get("limit") === "100"
    ) {
      failed = true;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "Temporary lookup failure" }),
      });
    } else await route.fallback();
  });
  await page.goto("/admin/users");
  const quick = page.getByRole("region", {
    name: "Akses Cepat Akun Uji Coba",
    exact: true,
  });
  await expect(quick.getByRole("alert")).toContainText(
    "Temporary lookup failure",
  );
  await quick.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await expect(
    quick.getByRole("cell", { name: /Patient Test$/ }),
  ).toBeVisible();
  await expect(quick.getByRole("alert")).toHaveCount(0);
});
