import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  fetchWithAuth: vi.fn(),
  apiJson: vi.fn(),
  mutate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../presentation/components/layout/AdminSidebar", () => ({
  AdminSidebar: () => null,
}));
vi.mock("../application/context/SidebarContext", () => ({
  useSidebar: () => ({ toggleSidebar: vi.fn(), isCollapsed: false }),
}));
vi.mock("../presentation/components/shared/Pagination", () => ({
  Pagination: () => null,
}));
vi.mock("../application/hooks/useStickyState", () => ({
  useStickyState: () => [1, vi.fn()],
}));
vi.mock("../application/hooks/useCachedFetch", () => ({
  useCachedFetch: () => ({
    data: [],
    isLoading: false,
    error: null,
    mutate: api.mutate,
  }),
}));
vi.mock("../config/api", () => ({
  fetchWithAuth: api.fetchWithAuth,
  apiJson: api.apiJson,
}));

import { AdminDevicesPage } from "../presentation/pages/admin/AdminDevicesPage";

describe("administrator device configuration", () => {
  beforeEach(() => {
    api.fetchWithAuth.mockReset();
    api.mutate.mockClear();
  });

  it("sends reviewed hardware identity once and does not claim an unavailable broker is connected", async () => {
    let finishRequest: (response: Response) => void = () => {};
    api.fetchWithAuth.mockReturnValue(
      new Promise<Response>((resolve) => {
        finishRequest = resolve;
      }),
    );
    render(<AdminDevicesPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /register alat baru/i }),
    );
    fireEvent.change(screen.getByLabelText("Nama Perangkat*"), {
      target: { value: "  Examination monitor  " },
    });
    fireEvent.change(screen.getByLabelText("ID perangkat fisik*"), {
      target: { value: "physical_001" },
    });
    fireEvent.change(screen.getByLabelText("MQTT Broker*"), {
      target: { value: " broker.test.invalid " },
    });
    fireEvent.change(screen.getByLabelText("MQTT Topic*"), {
      target: { value: "ecg/physical_001" },
    });
    fireEvent.change(screen.getByLabelText("Username*"), {
      target: { value: "fixture" },
    });
    fireEvent.change(screen.getByLabelText("Password*"), {
      target: { value: "fixture-password" },
    });
    const save = screen.getByRole("button", { name: "Simpan Konfigurasi" });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(api.fetchWithAuth).toHaveBeenCalledTimes(1);
    const [, request] = api.fetchWithAuth.mock.calls[0];
    expect(JSON.parse(request.body)).toMatchObject({
      name: "Examination monitor",
      hardware_id: "physical_001",
      mqtt_broker: "broker.test.invalid",
      mqtt_port: 8883,
      mqtt_topic: "ecg/physical_001",
    });
    finishRequest(
      new Response(
        JSON.stringify({
          success: true,
          saved: true,
          id: "dev_internal",
          connection_status: "unavailable",
          connection_message: "Configuration saved; broker unavailable",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Configuration saved; broker unavailable",
      ),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Menunggu konfirmasi koneksi perangkat",
    );
    expect(api.mutate).toHaveBeenCalledTimes(1);
  });
});
