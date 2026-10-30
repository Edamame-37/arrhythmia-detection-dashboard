import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { useSidebar } from "../../../application/context/SidebarContext";
import { Pagination } from "../../components/shared/Pagination";
import { useStickyState } from "../../../application/hooks/useStickyState";
import { fetchWithAuth, apiJson } from "../../../config/api";
import { useCachedFetch } from "../../../application/hooks/useCachedFetch";

interface DeviceRecord {
  id: string;
  name: string;
  hardware_id: string | null;
  mapping_status: "mapped" | "unmapped";
  mqtt_broker: string;
  mqtt_port: number;
  mqtt_topic: string;
  mqtt_username: string;
  assigned_to: string | null;
}

export const AdminDevicesPage: React.FC = () => {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const {
    data: devicesData,
    isLoading: loading,
    error: devicesError,
    mutate: mutateDevices,
  } = useCachedFetch("/api/admin/devices");
  const devices: DeviceRecord[] = Array.isArray(devicesData) ? devicesData : [];
  const [selectedDeviceQr, setSelectedDeviceQr] = useState<string | null>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    hardware_id: "",
    mqtt_broker: "",
    mqtt_port: "8883",
    mqtt_topic: "",
    mqtt_username: "",
    mqtt_password: "",
  });
  const savingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [connectionWarning, setConnectionWarning] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const closeForm = () => {
    if (!savingRef.current) setIsRegisterModalOpen(false);
  };

  const [currentPage, setCurrentPage] = useStickyState(1, "adminDevicesPage");
  const itemsPerPage = 10;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return;
    const fields = {
      ...formData,
      name: formData.name.trim(),
      hardware_id: formData.hardware_id.trim(),
      mqtt_broker: formData.mqtt_broker.trim(),
      mqtt_port: Number(formData.mqtt_port),
      mqtt_topic: formData.mqtt_topic.trim(),
      mqtt_username: formData.mqtt_username.trim(),
    };
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(fields.hardware_id)) {
      setFormError("ID perangkat fisik harus berisi 1–128 huruf, angka, tanda hubung, atau garis bawah.");
      return;
    }
    if (!fields.name || fields.name.length > 200) {
      setFormError("Nama perangkat harus berisi 1–200 karakter.");
      return;
    }
    if (!Number.isInteger(fields.mqtt_port) || fields.mqtt_port !== 8883) {
      setFormError("Koneksi MQTT harus memakai TLS pada port 8883.");
      return;
    }
    if (!fields.mqtt_topic || fields.mqtt_topic.length > 200 || /[#+]/.test(fields.mqtt_topic)) {
      setFormError("Gunakan satu topik MQTT yang tepat tanpa wildcard # atau +.");
      return;
    }
    if (!fields.mqtt_broker || !fields.mqtt_username || (!editingDeviceId && !fields.mqtt_password)) {
      setFormError("Broker, username, dan password perangkat baru wajib diisi.");
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    setFormError("");
    setNotice("");
    setConnectionWarning("");
    setRefreshError("");
    try {
      const url = editingDeviceId
        ? `/api/admin/devices/${encodeURIComponent(editingDeviceId)}`
        : `/api/admin/devices`;
      const method = editingDeviceId ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success !== true || data.saved !== true) {
        throw new Error(data.message || data.error || `Konfigurasi gagal disimpan (${res.status}).`);
      }
      setNotice(`Konfigurasi ${data.id || editingDeviceId || fields.hardware_id} tersimpan. Menunggu konfirmasi koneksi perangkat.`);
      if (data.connection_status === "unavailable") {
        setConnectionWarning(data.connection_message || "Konfigurasi tersimpan, tetapi koneksi perangkat belum tersedia. Periksa broker dan status perangkat.");
      }
      setIsRegisterModalOpen(false);
      setCurrentPage(1);
      void mutateDevices().catch(() => {
        setRefreshError("Konfigurasi tersimpan, tetapi daftar perangkat belum berhasil diperbarui. Muat ulang halaman untuk mencoba lagi.");
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Permintaan gagal.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-clinical-surface text-clinical-charcoal antialiased overflow-x-hidden w-full min-h-screen relative font-sans">
      <div className="absolute inset-0 ecg-grid opacity-10 pointer-events-none z-0"></div>
      <AdminSidebar />

      <main
        id="main-content"
        className={`pb-24 md:pb-12 transition-all duration-300 min-h-screen flex flex-col relative z-10 md:ml-[260px] md:w-[calc(100%-260px)] ${isCollapsed ? "md:!ml-[72px] md:!w-[calc(100%-72px)]" : ""}`}
      >
        <header className="sticky top-0 bg-clinical-surface/80 backdrop-blur-xl border-b border-clinical-charcoal/5 z-40 px-4 md:px-6 py-4 flex items-center gap-4 w-full w-full transition-all duration-300">
          <button
            onClick={toggleSidebar}
            className="md:hidden flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-clinical-surface text-clinical-charcoal/70 transition-colors outline-none"
            title="Sembunyikan / Tampilkan Menu Utama"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-clinical-charcoal">
              Armada Perangkat (IoT Devices)
            </h1>
            <p className="text-xs md:text-sm font-medium text-clinical-charcoal/60 mt-0.5">
              Pemantauan armada perangkat keras yang terhubung ke jaringan.
            </p>
          </div>
        </header>

        <div className="px-4 md:px-6 w-full mt-6 w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
          {connectionWarning && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{connectionWarning}</p>}
          {refreshError && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{refreshError}</p>}
          <div className="bg-white border border-clinical-charcoal/5 rounded-[2rem] shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-500">
            <div className="p-6 border-b border-clinical-charcoal/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/50 backdrop-blur-sm">
              <h2 className="font-bold text-clinical-charcoal text-lg">
                Daftar Perangkat
              </h2>
              <button
                onClick={() => {
                  setEditingDeviceId(null);
                  setFormData({
                    name: "",
                    hardware_id: "",
                    mqtt_broker: "",
                    mqtt_port: "8883",
                    mqtt_topic: "",
                    mqtt_username: "",
                    mqtt_password: "",
                  });
                  setFormError("");
                  setIsRegisterModalOpen(true);
                }}
                className="bg-clinical-blue text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>{" "}
                Register Alat Baru
              </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-clinical-surface/50 text-clinical-charcoal/60 text-[10px] uppercase tracking-wider font-bold">
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      ID Internal
                    </th>
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      Nama / ID Fisik
                    </th>
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      MQTT Broker
                    </th>
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      MQTT Topic
                    </th>
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      Assigned To
                    </th>
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : devicesError ? (
                    <tr><td colSpan={6} className="p-4 text-center text-red-700" role="alert">Daftar perangkat gagal dimuat. Muat ulang halaman untuk mencoba lagi.</td></tr>
                  ) : (
                    (() => {
                      const paginatedDevices = devices.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage,
                      );
                      return paginatedDevices.map((d) => (
                        <tr
                          key={d.id}
                          className="hover:bg-clinical-surface/50 transition-colors border-b border-clinical-charcoal/5 last:border-0 group"
                        >
                          <td className="p-4 font-mono text-xs text-clinical-blue font-bold">
                            {d.id}
                          </td>
                          <td className="p-4 font-bold text-sm text-clinical-charcoal">
                            {d.name}
                            <span className="block font-mono text-xs font-normal text-clinical-charcoal/70">{d.hardware_id || "Belum dipetakan"}</span>
                          </td>
                          <td className="p-4 font-mono text-xs text-clinical-charcoal/70">
                            {d.mqtt_broker}:{d.mqtt_port}
                          </td>
                          <td className="p-4 font-mono text-xs text-clinical-charcoal/70">
                            <span className="bg-clinical-surface px-2 py-1 rounded-md">
                              {d.mqtt_topic}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-mono text-clinical-charcoal/70">
                            {d.assigned_to || "Unassigned"}
                          </td>
                          <td className="p-4 flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={async () => {
                                try {
                                  const result = await apiJson(
                                    "/api/devices/" + d.id + "/pairing-code",
                                    { method: "POST" },
                                  );
                                  setSelectedDeviceQr(result.qr);
                                } catch (problem) {
                                  alert(
                                    problem instanceof Error
                                      ? problem.message
                                      : "Kode pairing gagal dibuat",
                                  );
                                }
                              }}
                              className="text-clinical-blue hover:text-clinical-charcoal text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Tampilkan QR"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                qr_code
                              </span>
                            </button>
                            <button
                              className="text-clinical-charcoal hover:text-clinical-blue text-xs font-bold transition-colors"
                              title="Ping"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                wifi
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingDeviceId(d.id);
                                setFormData({
                                  name: d.name,
                                  hardware_id: d.hardware_id || "",
                                  mqtt_broker: d.mqtt_broker,
                                  mqtt_port: String(d.mqtt_port),
                                  mqtt_topic: d.mqtt_topic,
                                  mqtt_username: d.mqtt_username,
                                  mqtt_password: "",
                                });
                                setFormError("");
                                setIsRegisterModalOpen(true);
                              }}
                              className="text-clinical-charcoal hover:text-clinical-blue text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </button>
                          </td>
                        </tr>
                      ));
                    })()
                  )}
                </tbody>
              </table>
            </div>
            {devices.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={devices.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {selectedDeviceQr && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedDeviceQr(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-charcoal mb-2">
              QR Code Alat
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Minta pasien memindai QR Code ini untuk terhubung dengan alat.
            </p>

            <div className="bg-white p-4 rounded-xl border-4 border-medical-teal/20 mb-6">
              <QRCode value={selectedDeviceQr} size={200} level="H" />
            </div>

            <div className="bg-surface-container-low rounded-lg p-3 w-full mb-6 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Device ID
              </span>
              <span className="font-mono text-lg font-bold text-charcoal">
                {selectedDeviceQr}
              </span>
            </div>

            <button
              onClick={() => setSelectedDeviceQr(null)}
              className="w-full bg-medical-teal text-white py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeForm}
        >
          <div
            className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-charcoal mb-6 text-center">
              {editingDeviceId ? "Edit Alat" : "Registrasi Alat Baru"}
            </h3>
            <form aria-label="Konfigurasi perangkat" onSubmit={handleRegister} className="flex flex-col gap-4">
              {formError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
              {editingDeviceId && <p className="text-xs text-on-surface-variant">ID internal: <span className="font-mono">{editingDeviceId}</span></p>}
              <div>
                <label htmlFor="device-name" className="block text-sm font-bold text-charcoal mb-1">
                  Nama Perangkat*
                </label>
                <input
                  required
                  id="device-name"
                  maxLength={200}
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest"
                  placeholder="Contoh: Monitor ruang pemeriksaan"
                />
              </div>
              <div>
                <label htmlFor="device-hardware-id" className="block text-sm font-bold text-charcoal mb-1">ID perangkat fisik*</label>
                <input required id="device-hardware-id" type="text" maxLength={128} value={formData.hardware_id} onChange={(e) => setFormData({ ...formData, hardware_id: e.target.value })} className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest" placeholder="Contoh: device02" />
                <p className="mt-1 text-xs text-on-surface-variant">Harus sama dengan device_id yang dikirim perangkat. ID internal dibuat oleh sistem.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="device-broker" className="block text-sm font-bold text-charcoal mb-1">
                    MQTT Broker*
                  </label>
                  <input
                    required
                    id="device-broker"
                    type="text"
                    value={formData.mqtt_broker}
                    onChange={(e) =>
                      setFormData({ ...formData, mqtt_broker: e.target.value })
                    }
                    className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest"
                    placeholder="contoh.hivemq.cloud"
                  />
                </div>
                <div className="w-24">
                  <label htmlFor="device-port" className="block text-sm font-bold text-charcoal mb-1">
                    Port*
                  </label>
                  <input
                    required
                    id="device-port"
                    type="number"
                    min={1}
                    max={65535}
                    step={1}
                    value={formData.mqtt_port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mqtt_port: e.target.value,
                      })
                    }
                    className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest"
                    placeholder="8883"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="device-topic" className="block text-sm font-bold text-charcoal mb-1">
                  MQTT Topic*
                </label>
                <input
                  required
                  id="device-topic"
                  type="text"
                  value={formData.mqtt_topic}
                  onChange={(e) =>
                    setFormData({ ...formData, mqtt_topic: e.target.value })
                  }
                  className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest"
                  placeholder="Contoh: ecgrhythmia/device02"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="device-username" className="block text-sm font-bold text-charcoal mb-1">
                    Username*
                  </label>
                  <input
                    required
                    id="device-username"
                    type="text"
                    value={formData.mqtt_username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mqtt_username: e.target.value,
                      })
                    }
                    className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="device-password" className="block text-sm font-bold text-charcoal mb-1">
                    {editingDeviceId ? "Password" : "Password*"}
                  </label>
                  <input
                    required={!editingDeviceId}
                    id="device-password"
                    type="password"
                    value={formData.mqtt_password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mqtt_password: e.target.value,
                      })
                    }
                    className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest"
                  />
                  {editingDeviceId && <p className="mt-1 text-xs text-on-surface-variant">Kosongkan untuk mempertahankan password yang tersimpan.</p>}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className="flex-1 py-3 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-medical-teal text-white font-bold rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
