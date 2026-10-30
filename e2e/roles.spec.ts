import { test, expect } from "@playwright/test";
import { signInFixture } from "./fixtures/api";
for (const role of ["pasien", "dokter", "admin"] as const) {
  test(
    role + " opens the authorized monitor using server identity",
    async ({ page }) => {
      await signInFixture(page, role);
      const prefix =
        role === "pasien" ? "patient" : role === "dokter" ? "doctor" : "admin";
      await page.goto("/" + prefix + "/monitor?patient_id=pat_A", {
        waitUntil: "domcontentloaded",
      });
      await expect(
        page.getByRole("heading", { name: "Monitor ECG", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Mulai Perekaman" }),
      ).toBeEnabled();
      await expect(page.getByTestId("ecg-svg")).toHaveAttribute(
        "data-paper-speed",
        "25",
      );
      expect(await page.evaluate(() => localStorage.getItem("user_role"))).toBe(
        role,
      );
    },
  );
}
test("history keeps the original second-frame offset at 125 Hz", async ({
  page,
}) => {
  await signInFixture(page, "pasien");
  await page.goto("/patient/history/ses_A", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Waktu asli:.*125 Hz/)).toBeVisible();
  await expect(page.getByTestId("ecg-path-II")).toHaveAttribute("d", /^M/);
  await expect(page.getByTestId("ai-classification")).toHaveText("UNKNOWN");
  await expect(page.getByTestId("heart-rate-value")).toHaveText("--");
});
