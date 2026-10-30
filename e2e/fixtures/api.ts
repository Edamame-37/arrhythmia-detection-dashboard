import { expect, type Page } from "@playwright/test";
export async function signInFixture(
  page: Page,
  role: "pasien" | "dokter" | "admin",
  options: { legacy?: boolean; testAccounts?: boolean } = {},
) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({
      sub: "11111111-1111-4111-8111-111111111111",
      exp: now + 3600,
      iat: now,
      aud: "authenticated",
      role: "authenticated",
    }),
    "YWJj",
  ].join(".");
  const session = {
    access_token: token,
    refresh_token: "synthetic-refresh",
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: "bearer",
    user: {
      id: "11111111-1111-4111-8111-111111111111",
      aud: "authenticated",
      role: "authenticated",
      email: "fixture@test.invalid",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { role: "admin" },
      created_at: "2026-10-01T08:00:00Z",
    },
  };
  const profileId =
    role === "pasien" ? "pat_A" : role === "dokter" ? "doc_A" : "acc_A";
  await page.addInitScript(
    ({ session, role, legacy, profileId }) => {
      localStorage.setItem(
        "sb-test-project-auth-token",
        JSON.stringify(session),
      );
      localStorage.setItem("user_role", legacy ? role : "admin");
      if (legacy) {
        localStorage.setItem("user_id", profileId);
        localStorage.setItem("auth_token", session.access_token);
        localStorage.setItem("synced_device_id", "dev_A");
      }
    },
    { session, role, legacy: !!options.legacy, profileId },
  );
  const patient = {
    id: "pat_A",
    account_id: "acc_patient",
    first_name: "Synthetic",
    last_name: "Patient",
    name: "Synthetic Patient",
    device_id: "dev_A",
    primary_doctor_id: "doc_A",
    date_of_birth: "1990-01-02",
    age: 36,
    gender: "L",
    profile_photo: null,
  };
  const doctor = {
    id: "doc_A",
    account_id: "acc_doctor",
    first_name: "Synthetic",
    last_name: "Doctor",
    name: "Synthetic Doctor",
    email: "doctor@test.invalid",
    profile_photo: null,
  };
  const device = {
    id: "dev_A",
    name: "Synthetic device",
    hardware_id: "device_pat_A",
    mapping_status: "mapped",
    status: "Unknown",
    assigned_to: "pat_A",
    last_seen_at: null,
    mqtt_broker: "broker.test.invalid",
    mqtt_port: 8883,
    mqtt_topic: "ecg/synthetic",
    mqtt_username: "fixture",
  };
  const savedSession = {
    id: "ses_A",
    session_id: "ses_A",
    patient_id: "pat_A",
    patient_name: "Synthetic Patient",
    device_id: "dev_A",
    started_at: "2026-10-20T08:00:00Z",
    ended_at: "2026-10-20T08:00:20Z",
    state: "ended",
    dev_note: "Synthetic recording fixture",
    ecg_paper: null,
  };
  const frame = {
    id: "fra_2",
    frame_number: 2,
    start_time: 10,
    end_time: 20,
    label: "UNKNOWN",
    confirmation: null,
    doc_note: null,
  };
  const recording = {
    ...frame,
    frame_id: "2",
    device_id: "dev_A",
    sampling_rate_hz: 125,
    sampling_rate: 125,
    startTime: 10,
    endTime: 20,
    created_at: "2026-10-20T08:00:10Z",
    duration_s: 10,
    ecg: {
      format: "samples_by_time",
      samples: Array.from({ length: 1250 }, () => [0, 0, 0]),
    },
  };
  const list = (data: unknown[], total = data.length) => ({
    data,
    pagination: {
      total,
      page: 1,
      limit: 10,
      total_pages: Math.ceil(total / 10),
    },
  });
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url()),
      path = url.pathname,
      method = route.request().method();
    if (!options.legacy)
      expect(route.request().headers().authorization).toBe("Bearer " + token);
    let body: unknown;
    let status = 200;
    if (path === "/api/auth/me")
      body = {
        account_id: "acc_A",
        auth_id: session.user.id,
        actor_id: "acc_A",
        profile_id: profileId,
        role,
      };
    else if (path.endsWith("/recording-status"))
      body = { is_recording: false, session: null };
    else if (path === "/api/admin/stats")
      body = {
        total_patients: 1,
        total_doctors: 1,
        active_devices: 0,
        critical_alerts: 0,
      };
    else if (path === "/api/patients/pat_A" && method === "GET")
      body = { patient, doctor };
    else if (path === "/api/doctors/doc_A") body = doctor;
    else if (path === "/api/patients" || path === "/api/doctors/doc_A/patients")
      body = list([patient]);
    else if (path === "/api/admin/users") {
      if (options.testAccounts) {
        const requestedRole =
          url.searchParams.get("role") === "dokter" ? "dokter" : "pasien";
        const pageNumber = Number(url.searchParams.get("page") || 1);
        const limit = Number(url.searchParams.get("limit") || 10);
        const total = requestedRole === "pasien" ? 101 : 1;
        const start = (pageNumber - 1) * limit;
        const data = Array.from(
          { length: Math.max(0, Math.min(limit, total - start)) },
          (_, offset) => {
            const index = start + offset;
            const trial = requestedRole === "dokter" || index === 100;
            const id = trial
              ? requestedRole === "pasien"
                ? "pat_trial_synthetic"
                : "doc_trial_synthetic"
              : String(index + 1);
            return {
              id,
              account_id: "acc_" + id,
              role: requestedRole,
              name: trial
                ? requestedRole === "pasien"
                  ? "Patient Test"
                  : "Doctor Test"
                : "Synthetic Patient " + (index + 1),
              email: "synthetic-" + id + "@test.invalid",
              registered_at: "2026-10-01T08:00:00Z",
              connected_doctor_id: null,
              connected_device_id: null,
              profile_photo: null,
            };
          },
        );
        body = {
          data,
          pagination: {
            total,
            page: pageNumber,
            limit,
            total_pages: Math.ceil(total / limit),
          },
        };
      } else {
        body = list(
          url.searchParams.get("role") === "dokter"
            ? [
                {
                  ...doctor,
                  role: "dokter",
                  registered_at: "2026-10-01T08:00:00Z",
                },
              ]
            : [
                {
                  ...patient,
                  email: "patient@test.invalid",
                  role: "pasien",
                  connected_doctor_id: "doc_A",
                  connected_device_id: "dev_A",
                  registered_at: "2026-10-01T08:00:00Z",
                },
              ],
        );
      }
    } else if (
      path.startsWith("/api/admin/devices") &&
      (method === "POST" || method === "PUT")
    )
      body = {
        success: true,
        saved: true,
        id: "dev_saved",
        connection_status: "connecting",
      };
    else if (path === "/api/devices" || path === "/api/admin/devices")
      body = [device];
    else if (
      path === "/api/sessions" ||
      path === "/api/patients/pat_A/sessions"
    )
      body = list([savedSession]);
    else if (path === "/api/sessions/ses_A") body = savedSession;
    else if (path === "/api/sessions/ses_A/frames") body = list([frame]);
    else if (path === "/api/sessions/ses_A/validation")
      body = { total: 1, validated: 0 };
    else if (path === "/api/records/ses_A") body = [recording];
    else if (path.endsWith("/pairing-code"))
      body = {
        code: "synthetic-consent",
        patient_id: "pat_A",
        expires_in: 300,
        qr: "ecgrhythmia://sync/patient/pat_A?token=synthetic-consent",
      };
    else if (method !== "GET") body = { success: true };
    else {
      status = 404;
      body = { message: "Unmocked fixture endpoint: " + path };
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  await page.route("https://**/auth/v1/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(session.user),
    }),
  );
  // Old screenshots may exercise historical browser RPCs; every response remains synthetic.
  await page.route("https://**/rest/v1/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          session_id: "ses_A",
          total_count: 1,
          total_frames: 1,
          validated_count: 0,
        },
      ]),
    }),
  );
}
