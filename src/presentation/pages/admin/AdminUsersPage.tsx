import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../../application/context/SidebarContext";
import {
  ActionModal,
  type ActionModalType,
} from "../../components/shared/ActionModal";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { Avatar } from "../../components/shared/Avatar";
import { Pagination } from "../../components/shared/Pagination";
import { useCachedFetch } from "../../../application/hooks/useCachedFetch";
import { useTestAccount } from "../../../application/hooks/useTestAccount";
import { apiJson, beginImpersonation } from "../../../config/api";
export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"pasien" | "dokter">("pasien");
  const [page, setPage] = useState(1);
  const userQuery = useCachedFetch(
    "/api/admin/users?role=" + role + "&page=" + page + "&limit=10",
  );
  const { data: doctors } = useCachedFetch(
    "/api/admin/users?role=dokter&limit=100",
  );
  const devicesQuery = useCachedFetch<any[]>("/api/admin/devices");
  const [create, setCreate] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [doctor, setDoctor] = useState("");
  const [device, setDevice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "pasien",
    first_name: "",
    last_name: "",
    age: 0,
    gender: "L",
  });
  const perform = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await Promise.all([
        userQuery.mutate(),
        devicesQuery.mutate(),
        testAccount.mutate().catch(() => undefined),
      ]);
      return true;
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Permintaan gagal");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const view = (user: any) => {
    setSelected(user);
    setDoctor(user.connected_doctor_id || "");
    setDevice(user.connected_device_id || "");
    setError("");
  };
  const { isCollapsed, toggleSidebar } = useSidebar();
  const users = userQuery.data?.data || [];
  const devices = devicesQuery.data || [];
  const allDoctors = doctors?.data || [];
  const doctorsList = allDoctors;
  const testAccount = useTestAccount(role);
  const testUser = testAccount.data;
  const paginatedUsers = users;
  const totalUsers = userQuery.data?.pagination?.total || 0;
  const itemsPerPage = 10;
  const loading = userQuery.isLoading;
  const addError = error;
  const addLoading = busy;
  const selectedProfile = useCachedFetch(
    selected
      ? (selected.role === "pasien" ? "/api/patients/" : "/api/doctors/") +
          selected.id
      : null,
  );
  const userDetail = selected ? { ...selected, ...selectedProfile.data } : null;
  const loadingDetail = selectedProfile.isLoading;
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: ActionModalType;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const closeActionModal = () =>
    setActionModal((previous) => ({ ...previous, isOpen: false }));
  const actionLoading = busy;
  const requestAction = (
    title: string,
    message: string,
    action: () => Promise<unknown>,
  ) =>
    setActionModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onConfirm: () => {
        void perform(action).then((success) => {
          if (success) closeActionModal();
          else setActionModal((previous) => ({ ...previous, isOpen: false }));
        });
      },
    });
  const handleViewDetail = view;
  const closeDetailModal = () => setSelected(null);
  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleString("id-ID") : "-";
  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));
  const handleAddUser = (event: React.FormEvent) => {
    event.preventDefault();
    void perform(async () => {
      await apiJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setCreate(false);
      setForm((previous) => ({ ...previous, password: "" }));
    });
  };
  const handleImpersonate = (user: any) =>
    requestAction(
      "Konfirmasi Login",
      "Buka dashboard " + user.name + " sebagai pengguna ini?",
      async () => {
        const context = await apiJson(
          "/api/admin/impersonate/" + user.account_id,
          { method: "POST" },
        );
        await beginImpersonation(context);
        navigate(
          context.role === "pasien"
            ? "/patient/dashboard"
            : "/doctor/dashboard",
        );
      },
    );
  const handleSyncDoctor = () => {
    if (!selected) return;
    requestAction(
      "Konfirmasi Dokter",
      "Terapkan dokter penanggung jawab pasien?",
      async () => {
        await apiJson(
          "/api/patients/" +
            selected.id +
            (doctor ? "/connect" : "/disconnect"),
          {
            method: "POST",
            body: doctor ? JSON.stringify({ doctor_id: doctor }) : undefined,
          },
        );
        setSelected((previous: any) => ({
          ...previous,
          connected_doctor_id: doctor || null,
        }));
        await selectedProfile.mutate();
      },
    );
  };
  const handleSyncDevice = () => {
    if (!selected) return;
    requestAction(
      "Konfirmasi Tautkan Perangkat",
      "Terapkan penautan perangkat pasien?",
      async () => {
        const target = device || selected.connected_device_id;
        if (!target) return;
        await apiJson("/api/devices/" + target + "/assign", {
          method: "POST",
          body: JSON.stringify({ patient_id: device ? selected.id : null }),
        });
        setSelected((previous: any) => ({
          ...previous,
          connected_device_id: device || null,
        }));
        await selectedProfile.mutate();
      },
    );
  };
  const renderUserRow = (u: any) => (
    <tr
      key={u.id}
      className="hover:bg-clinical-surface/50 transition-colors border-b border-clinical-charcoal/5 last:border-0 bg-white group"
    >
      <td className="p-4 font-mono text-xs text-clinical-blue font-bold">
        {u.id.substring(0, 9)}
      </td>
      <td className="p-4 text-sm font-bold text-clinical-charcoal">
        <div className="flex items-center gap-3">
          <Avatar src={u.profile_photo} name={u.name} size="sm" />
          {u.name}
        </div>
      </td>
      {role === "pasien" && (
        <td className="p-4 text-xs font-mono font-bold text-clinical-blue">
          {u.connected_doctor_id ? (
            allDoctors.find((d: any) => d.id === u.connected_doctor_id)?.name ||
            u.connected_doctor_id
          ) : (
            <span className="text-clinical-charcoal/50 italic font-normal">
              Kosong
            </span>
          )}
        </td>
      )}
      {role === "pasien" && (
        <td className="p-4 text-xs font-mono font-bold text-clinical-blue">
          {u.connected_device_id ? (
            u.connected_device_id
          ) : (
            <span className="text-clinical-charcoal/50 italic font-normal">
              Kosong
            </span>
          )}
        </td>
      )}
      <td className="p-4 text-xs text-clinical-charcoal/70">
        {formatDate(u.registered_at)}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-4 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => handleViewDetail(u)}
            className="text-clinical-charcoal hover:text-clinical-blue text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              visibility
            </span>
            Detail & Sync
          </button>
          <button
            onClick={() => handleImpersonate(u)}
            className="text-clinical-charcoal hover:text-clinical-blue text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            Login
          </button>
        </div>
      </td>
    </tr>
  );

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
              Manajemen Pengguna
            </h1>
            <p className="text-xs md:text-sm font-medium text-clinical-charcoal/60 mt-0.5">
              Daftar semua pengguna terdaftar di sistem.
            </p>
          </div>
        </header>

        {(error || userQuery.error || selectedProfile.error) && (
          <p
            role="alert"
            className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700"
          >
            {error ||
              userQuery.error?.message ||
              selectedProfile.error?.message}
          </p>
        )}
        <div className="px-4 md:px-6 w-full mt-6 w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex bg-white/50 backdrop-blur-sm border border-clinical-charcoal/5 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => {
                  setRole("pasien");
                  setPage(1);
                }}
                className={`px-5 py-2.5 font-bold text-sm transition-all relative rounded-lg ${role === "pasien" ? "text-clinical-blue bg-white shadow-md" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
              >
                Pasien
              </button>
              <button
                onClick={() => {
                  setRole("dokter");
                  setPage(1);
                }}
                className={`px-5 py-2.5 font-bold text-sm transition-all relative rounded-lg ${role === "dokter" ? "text-clinical-blue bg-white shadow-md" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
              >
                Dokter
              </button>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={() => setCreate(true)}
              className="bg-clinical-blue text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>{" "}
              Tambah Manual
            </button>
          </div>

          <div
            role="region"
            aria-label="Akses Cepat Akun Uji Coba"
            className="mb-6 bg-clinical-blue/5 border border-clinical-blue/20 rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-4 md:p-6 bg-clinical-blue/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-clinical-blue flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    account_circle
                  </span>
                  Akses Cepat Akun Uji Coba (
                  {role === "pasien" ? "Pasien" : "Dokter"})
                </h3>
                <p className="text-xs text-clinical-charcoal/70 mt-1">
                  Gunakan profil di bawah ini untuk menguji sistem dengan
                  menekan tombol{" "}
                  <strong className="text-clinical-blue">Login</strong>.
                </p>
              </div>
            </div>
            {testAccount.isLoading ? (
              <p
                role="status"
                className="p-4 text-xs font-bold text-clinical-charcoal/50 bg-white border-t border-clinical-blue/20"
              >
                Memuat akun uji coba...
              </p>
            ) : testAccount.error ? (
              <div className="p-4 bg-white border-t border-clinical-blue/20 text-xs">
                <p role="alert" className="text-clinical-red">
                  Gagal memuat akun uji coba: {testAccount.error.message}
                </p>
                <button
                  onClick={() => {
                    void testAccount.mutate().catch(() => undefined);
                  }}
                  className="mt-3 px-4 py-2 rounded-full bg-clinical-blue text-white font-bold"
                >
                  Coba lagi
                </button>
              </div>
            ) : testUser ? (
              <div className="overflow-x-auto bg-white border-t border-clinical-blue/20">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-clinical-surface/50 text-clinical-charcoal/60 text-[10px] uppercase tracking-wider font-bold">
                      <th className="p-4 border-b border-clinical-charcoal/5">
                        User ID
                      </th>
                      <th className="p-4 border-b border-clinical-charcoal/5">
                        Nama Lengkap
                      </th>
                      {role === "pasien" && (
                        <th className="p-4 border-b border-clinical-charcoal/5">
                          Dokter Terhubung
                        </th>
                      )}
                      {role === "pasien" && (
                        <th className="p-4 border-b border-clinical-charcoal/5">
                          Device Terhubung
                        </th>
                      )}
                      <th className="p-4 border-b border-clinical-charcoal/5">
                        Tanggal Daftar
                      </th>
                      <th className="p-4 border-b border-clinical-charcoal/5">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>{renderUserRow(testUser)}</tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-xs font-bold text-clinical-charcoal/50 bg-white border-t border-clinical-blue/20">
                Akun uji coba{" "}
                {role === "pasien" ? "Patient Test" : "Doctor Test"} tidak
                ditemukan.
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] border border-clinical-charcoal/5 shadow-sm overflow-hidden flex flex-col mb-8">
            <div className="p-6 border-b border-clinical-charcoal/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/50 backdrop-blur-sm">
              <h2 className="font-bold text-clinical-charcoal text-lg">
                Semua Pengguna ({role === "pasien" ? "Pasien" : "Dokter"})
              </h2>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-clinical-surface/50 text-clinical-charcoal/60 text-[10px] uppercase tracking-wider font-bold">
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      User ID
                    </th>
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      Nama Lengkap
                    </th>
                    {role === "pasien" && (
                      <th className="p-4 border-b border-clinical-charcoal/5">
                        Dokter Terhubung
                      </th>
                    )}
                    {role === "pasien" && (
                      <th className="p-4 border-b border-clinical-charcoal/5">
                        Device Terhubung
                      </th>
                    )}
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      Tanggal Daftar
                    </th>
                    <th className="p-4 border-b border-clinical-charcoal/5">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={role === "pasien" ? 6 : 4}
                        className="p-8 text-center text-clinical-charcoal/50"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={role === "pasien" ? 6 : 4}
                        className="p-8 text-center text-clinical-charcoal/50"
                      >
                        Tidak ada data.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u: any) => renderUserRow(u))
                  )}
                </tbody>
              </table>
            </div>
            {users.length > 0 && (
              <Pagination
                currentPage={page}
                totalItems={totalUsers}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {create && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-clinical-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setCreate(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-clinical-charcoal/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-clinical-charcoal/5 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <h3 className="font-bold font-display text-xl text-clinical-charcoal">
                Tambah Pengguna Manual
              </h3>
              <button
                onClick={() => setCreate(false)}
                className="text-clinical-charcoal/50 hover:text-clinical-charcoal transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              aria-label="Tambah akun"
              onSubmit={handleAddUser}
              className="p-6 space-y-4"
            >
              {addError && (
                <div className="bg-clinical-red/10 text-clinical-red p-3 rounded-lg text-sm font-bold">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue transition-all"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                  Password (Minimal 12 karakter)
                </label>
                <input
                  minLength={12}
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue transition-all"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value as any)}
                  className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue transition-all cursor-pointer"
                >
                  <option value="dokter">Dokter</option>
                  <option value="pasien">Pasien</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                    Nama Depan
                  </label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                    Nama Belakang (Opsional)
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
              {form.role === "pasien" && (
                <div className="flex gap-4 animate-in fade-in duration-200">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                      Umur
                    </label>
                    <input
                      type="number"
                      required
                      value={form.age}
                      onChange={(e) =>
                        updateField("age", Number(e.target.value) || 0)
                      }
                      className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue transition-all cursor-pointer"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCreate(false)}
                  className="flex-1 py-3 rounded-full font-bold text-clinical-charcoal bg-clinical-charcoal/5 hover:bg-clinical-charcoal/10 active:scale-95 transition-all outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-clinical-blue hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 outline-none"
                >
                  {addLoading && (
                    <span className="material-symbols-outlined animate-spin text-sm">
                      progress_activity
                    </span>
                  )}
                  {addLoading ? "Menyimpan..." : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Sync Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-clinical-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-clinical-charcoal/10 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-clinical-charcoal/5 flex items-center justify-between bg-white/50 backdrop-blur-sm shrink-0">
              <h3 className="font-bold font-display text-xl text-clinical-charcoal">
                Detail & Sinkronisasi Pengguna
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-clinical-charcoal/50 hover:text-clinical-charcoal transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {loadingDetail ? (
                <div className="text-center py-12 flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl animate-spin text-clinical-blue">
                    progress_activity
                  </span>
                  <p className="text-clinical-charcoal/50 font-bold text-sm">
                    Memuat informasi profil...
                  </p>
                </div>
              ) : userDetail ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-6">
                    <Avatar
                      src={
                        userDetail.patient?.profile_photo ||
                        userDetail.profile_photo
                      }
                      name={userDetail.name || ""}
                      size="xl"
                      className="w-24 h-24 rounded-[1.5rem] border-4 border-white shadow-md text-2xl"
                    />
                    <div>
                      <h4 className="text-2xl font-bold text-clinical-charcoal mb-1">
                        {selected.name}
                      </h4>
                      <p className="text-sm text-clinical-blue font-mono bg-clinical-blue/10 px-3 py-1.5 rounded-lg inline-block font-bold">
                        {selected.id}
                      </p>
                      <p className="text-xs text-clinical-charcoal/50 mt-2 font-medium">
                        Terdaftar sejak: {selected.registered_at.split("T")[0]}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Data */}
                  <div className="grid grid-cols-2 gap-4 bg-clinical-surface/50 p-5 rounded-2xl border border-clinical-charcoal/5">
                    <div>
                      <p className="text-[10px] text-clinical-charcoal/60 uppercase tracking-widest font-bold mb-1">
                        Jenis Kelamin
                      </p>
                      <p className="font-bold text-clinical-charcoal text-sm">
                        {userDetail.gender ||
                          userDetail.doctor?.gender ||
                          userDetail.patient?.gender ||
                          "Belum diatur"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-clinical-charcoal/60 uppercase tracking-widest font-bold mb-1">
                        Umur
                      </p>
                      <p className="font-bold text-clinical-charcoal text-sm">
                        {userDetail.age ||
                          userDetail.doctor?.age ||
                          userDetail.patient?.age ||
                          "Belum diatur"}
                      </p>
                    </div>
                  </div>

                  {/* Sync Actions (Only for Patient) */}
                  {selected.role === "pasien" && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                      <h4 className="font-bold text-clinical-charcoal text-sm flex items-center gap-2 pb-2 border-b border-clinical-charcoal/5 mt-6">
                        <span className="material-symbols-outlined text-clinical-blue text-[18px]">
                          sync_alt
                        </span>
                        Manajemen Sinkronisasi
                      </h4>

                      {/* Sync Doctor */}
                      <div className="bg-white p-4 rounded-2xl border border-clinical-charcoal/5 shadow-sm flex flex-col sm:flex-row sm:items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                            Dokter Penanggung Jawab
                          </label>
                          <select
                            value={doctor}
                            onChange={(e) => setDoctor(e.target.value)}
                            className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue shadow-sm transition-all text-clinical-charcoal cursor-pointer"
                          >
                            <option value="">
                              -- Kosong (Tidak Terhubung) --
                            </option>
                            {doctorsList.map((d: any) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={handleSyncDoctor}
                          className="bg-clinical-blue text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2 outline-none"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            save
                          </span>
                          Terapkan
                        </button>
                      </div>

                      {/* Sync Device */}
                      <div className="bg-white p-4 rounded-2xl border border-clinical-charcoal/5 shadow-sm flex flex-col sm:flex-row sm:items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-clinical-charcoal/60 uppercase tracking-widest mb-2">
                            Alat ECG Terpasang
                          </label>
                          <select
                            value={device}
                            onChange={(e) => setDevice(e.target.value)}
                            className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-clinical-blue focus:ring-1 focus:ring-clinical-blue shadow-sm transition-all text-clinical-charcoal cursor-pointer"
                          >
                            <option value="">
                              -- Kosong (Tidak Terhubung) --
                            </option>
                            {devices.map((d: any) => (
                              <option
                                key={d.id}
                                value={d.id}
                                disabled={
                                  d.assigned_to !== null &&
                                  d.assigned_to !== selected.id
                                }
                              >
                                {d.name}{" "}
                                {d.assigned_to && d.assigned_to !== selected.id
                                  ? "(Sedang dipakai pasien lain)"
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={handleSyncDevice}
                          className="bg-clinical-blue text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2 outline-none"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            save
                          </span>
                          Terapkan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-clinical-charcoal/50 font-medium">
                  Gagal mengambil detail.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Detail & Sync Modal */}
      {/* ... other modals ... */}

      <ActionModal
        isOpen={actionModal.isOpen}
        type={actionModal.type}
        title={actionModal.title}
        message={actionModal.message}
        onConfirm={actionModal.onConfirm}
        onClose={closeActionModal}
        isLoading={actionLoading}
      />
    </div>
  );
};
