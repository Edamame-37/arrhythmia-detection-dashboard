import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PreferencesProvider } from "../application/context/PreferencesContext";
import { MemoryRouter } from "react-router-dom";
const send = vi.hoisted(() =>
  vi.fn(async () => {
    throw new Error("Device unavailable");
  }),
);
vi.mock("../application/context/AuthContext", () => ({
  useAuth: () => ({ identity: { role: "pasien", profile_id: "pat_A" } }),
}));
vi.mock("../application/hooks/useCachedFetch", () => ({
  useCachedFetch: () => ({ data: { patient: { device_id: "dev_A" } } }),
}));
vi.mock("../application/hooks/useDeviceCommands", () => ({
  useDeviceCommands: () => ({
    sendCommand: send,
    busy: false,
    error: "Device unavailable",
  }),
}));
vi.mock("../application/hooks/useECGStream", () => ({
  useECGStream: () => ({
    isRecording: false,
    session: null,
    deviceId: "",
    sessionId: "",
    segment: { raw: { ch1: [], ch2: [], ch3: [] } },
    timeline: [],
    heartRate: "--",
    clinicalStatus: null,
    fetchSummary: vi.fn(),
  }),
}));
import { MonitorPanel } from "../presentation/components/dashboard/MonitorPanel";
describe("monitor command state", () => {
  it("keeps START available after a rejected command and displays the server failure", async () => {
    render(
      <MemoryRouter>
        <PreferencesProvider>
          <MonitorPanel />
        </PreferencesProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mulai Perekaman" }));
    expect(send).toHaveBeenCalledWith("dev_A", "START", "pat_A", "");
    expect(screen.getByRole("alert")).toHaveTextContent("Device unavailable");
    expect(
      screen.queryByRole("button", { name: "Akhiri Perekaman" }),
    ).toBeNull();
  });
});
