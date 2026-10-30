import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
const frames = [
  { id: "fra_second", frame_number: 2, start_time: 10, end_time: 20 },
];
vi.mock("../application/hooks/useCachedFetch", () => ({
  useCachedFetch: (path: string) => ({
    data: !path
      ? undefined
      : path.includes("/frames?")
        ? { data: frames, pagination: { total: 1 } }
        : path?.includes("/api/records/")
          ? [
              {
                ...frames[0],
                sampling_rate_hz: 125,
                ecg: { samples: Array.from({ length: 1250 }, () => [0, 0, 0]) },
              },
            ]
          : {},
    mutate: vi.fn(),
  }),
}));
import { useSessionReview } from "../application/hooks/useSessionReview";
describe("history metadata contract", () => {
  it("selects the database frame ID and retains original time after earlier frames are hidden", async () => {
    const { result } = renderHook(() => useSessionReview("ses_A"));
    await waitFor(() => expect(result.current.selectedId).toBe("fra_second"));
    expect(result.current.current?.startTime).toBe(10);
    expect(result.current.current?.raw.samplingRate).toBe(125);
    expect(result.current.current?.classification).toBe("UNKNOWN");
    expect(result.current.current?.heartRate).toBe("--");
  });
});
