import { createElement, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  identity: {
    auth_id: "auth_admin",
    actor_id: "acc_admin",
    account_id: "acc_admin",
    profile_id: "acc_admin",
    role: "admin",
  },
}));
vi.mock("../config/api", () => ({
  apiJson: mocks.request,
  getImpersonation: () => null,
}));
vi.mock("../application/context/AuthContext", () => ({
  useAuth: () => ({ identity: mocks.identity }),
}));
import {
  useTestAccount,
  type TestAccount,
} from "../application/hooks/useTestAccount";
function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );
}
function user(
  id: string,
  name: string,
  role: "pasien" | "dokter" = "pasien",
): TestAccount {
  return { id, account_id: "acc_" + id, name, role };
}
function page(data: TestAccount[], number = 1, totalPages = 1) {
  return {
    data,
    pagination: {
      page: number,
      limit: 100,
      total_pages: totalPages,
      total: totalPages === 1 ? data.length : 101,
    },
  };
}
beforeEach(() => {
  mocks.request.mockReset();
  mocks.identity.role = "admin";
});
describe("administrator test-account lookup", () => {
  it("finds the named account on a later page and ignores the unrelated ID 1", async () => {
    const regular = Array.from({ length: 100 }, (_, index) =>
      user(String(index + 1), "Regular " + index),
    );
    const trial = user("pat_uuid_trial", "Patient Test");
    mocks.request
      .mockResolvedValueOnce(page(regular, 1, 2))
      .mockResolvedValueOnce(page([trial], 2, 2));
    const { result } = renderHook(() => useTestAccount("pasien"), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(trial));
    expect(mocks.request.mock.calls.map((call) => call[0])).toEqual([
      "/api/admin/users?role=pasien&page=1&limit=100",
      "/api/admin/users?role=pasien&page=2&limit=100",
    ]);
  });
  it("selects Doctor Test only for the doctor role and normalizes name whitespace", async () => {
    const trial = user("doc_uuid_trial", " Doctor   Test ", "dokter");
    mocks.request.mockResolvedValue(
      page([user("pat_trial", "Patient Test"), trial]),
    );
    const { result } = renderHook(() => useTestAccount("dokter"), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(trial));
    expect(mocks.request).toHaveBeenCalledWith(
      "/api/admin/users?role=dokter&page=1&limit=100",
    );
  });
  it("finishes with null when the account does not exist", async () => {
    mocks.request.mockResolvedValue(page([user("1", "Regular Patient")]));
    const { result } = renderHook(() => useTestAccount("pasien"), { wrapper });
    await waitFor(() => expect(result.current.data).toBeNull());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });
  it("surfaces a failed request and supports an explicit retry", async () => {
    const trial = user("pat_trial", "Patient Test");
    mocks.request
      .mockRejectedValueOnce(new Error("Service unavailable"))
      .mockResolvedValueOnce(page([trial]));
    const { result } = renderHook(() => useTestAccount("pasien"), { wrapper });
    await waitFor(() =>
      expect(result.current.error?.message).toBe("Service unavailable"),
    );
    expect(result.current.isLoading).toBe(false);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.mutate();
    });
    await waitFor(() => expect(result.current.data).toEqual(trial));
    expect(result.current.error).toBeUndefined();
  });
  it("rejects multiple matching profiles instead of selecting an arbitrary identity", async () => {
    mocks.request.mockResolvedValue(
      page([user("pat_A", "Patient Test"), user("pat_B", "Patient Test")]),
    );
    const { result } = renderHook(() => useTestAccount("pasien"), { wrapper });
    await waitFor(() =>
      expect(result.current.error?.message).toContain("Lebih dari satu"),
    );
    expect(result.current.data).toBeUndefined();
  });
  it("does not request administrator data under a non-admin identity", () => {
    mocks.identity.role = "pasien";
    const { result } = renderHook(() => useTestAccount("pasien"), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("does not show the cached patient account while loading the doctor account", async () => {
    const patient = user("pat_trial", "Patient Test");
    const doctor = user("doc_trial", "Doctor Test", "dokter");
    let resolveDoctor!: (value: ReturnType<typeof page>) => void;
    mocks.request.mockResolvedValueOnce(page([patient])).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveDoctor = resolve;
        }),
    );
    const { result, rerender } = renderHook(
      ({ role }: { role: "pasien" | "dokter" }) => useTestAccount(role),
      { wrapper, initialProps: { role: "pasien" } },
    );
    await waitFor(() => expect(result.current.data).toEqual(patient));
    rerender({ role: "dokter" });
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.data).toBeUndefined();
    await act(async () => {
      resolveDoctor(page([doctor]));
    });
    await waitFor(() => expect(result.current.data).toEqual(doctor));
  });
});
