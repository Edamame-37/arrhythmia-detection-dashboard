import useSWR from "swr";
import { useAuth } from "../context/AuthContext";
import { apiJson, getImpersonation } from "../../config/api";
import type { PageResponse } from "../../core/types/apiTypes";

type TestAccountRole = "pasien" | "dokter";
export interface TestAccount {
  id: string;
  account_id: string;
  name: string;
  role: TestAccountRole;
  email?: string;
  registered_at?: string;
  profile_photo?: string | null;
  connected_doctor_id?: string | null;
  connected_device_id?: string | null;
}
const PAGE_SIZE = 100;
const TEST_NAMES: Record<TestAccountRole, string> = {
  pasien: "Patient Test",
  dokter: "Doctor Test",
};
const normalizeName = (name: string) =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

async function findTestAccount(
  role: TestAccountRole,
): Promise<TestAccount | null> {
  const expectedName = normalizeName(TEST_NAMES[role]);
  const matches = new Map<string, TestAccount>();
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page++) {
    const response = await apiJson<PageResponse<TestAccount>>(
      `/api/admin/users?role=${role}&page=${page}&limit=${PAGE_SIZE}`,
    );
    totalPages = response.pagination.total_pages;
    for (const user of response.data) {
      if (user.role === role && normalizeName(user.name) === expectedName) {
        matches.set(user.account_id + ":" + user.id, user);
      }
    }
  }
  if (matches.size > 1) {
    throw new Error(
      "Lebih dari satu akun uji coba ditemukan. Periksa data pengguna sebelum memilih akun.",
    );
  }
  return matches.values().next().value ?? null;
}

export function useTestAccount(role: TestAccountRole) {
  const { identity } = useAuth();
  const impersonationId = getImpersonation()?.impersonation_id || "";
  return useSWR<TestAccount | null, Error>(
    identity?.role === "admin"
      ? [
          "admin-test-account",
          identity.auth_id,
          identity.actor_id,
          identity.account_id,
          impersonationId,
          role,
        ]
      : null,
    () => findTestAccount(role),
    {
      keepPreviousData: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    },
  );
}
