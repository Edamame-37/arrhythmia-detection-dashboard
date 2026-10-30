import React, { useRef, useState } from "react";
import { apiJson } from "../../../config/api";
declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}
interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess?: () => void;
}
export const FolderUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!isOpen) return null;
  const uploadFiles = async (selectedFiles: File[]) => {
    setBusy(true);
    setError("");
    try {
      const validFiles = selectedFiles.filter((file) =>
        /\.(json|csv)$/i.test(file.name),
      );
      if (
        !validFiles.length ||
        validFiles.reduce((total, file) => total + file.size, 0) >
          20 * 1024 * 1024
      )
        throw new Error("Pilih frame JSON/CSV dengan total maksimal 20 MiB");
      const body = new FormData();
      body.append("patient_id", patientId);
      validFiles.forEach((file) => body.append("files", file));
      await apiJson("/api/sessions/upload", { method: "POST", body });
      onSuccess?.();
      setFiles([]);
      onClose();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Upload gagal");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Unggah sesi"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-deep-charcoal/60 backdrop-blur-sm"
        onClick={!busy ? onClose : undefined}
      ></div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-deep-charcoal mb-2">
          Upload Folder Sesi
        </h2>
        <p className="text-sm text-secondary mb-6">
          Pilih folder yang berisi kumpulan frame (file .csv dan .json) untuk
          pasien ini.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            <span role="alert">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center bg-surface-container/30 hover:bg-surface-container transition-colors relative">
            <span className="material-symbols-outlined text-4xl text-medical-teal mb-2">
              folder_open
            </span>
            <p className="text-sm font-medium text-deep-charcoal">
              {busy ? "Sedang Memproses..." : "Klik untuk Memilih Folder"}
            </p>
            <p className="text-xs text-secondary mt-1">
              JSON/CSV, maksimal 20 MiB. {files.length} berkas dipilih.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              aria-label="Folder rekaman"
              onChange={(event) => {
                const selectedFiles = Array.from(event.target.files || []);
                setFiles(selectedFiles);
                void uploadFiles(selectedFiles);
              }}
              disabled={busy}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          {busy && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="animate-pulse bg-medical-teal h-2.5 rounded-full transition-all duration-300"
                style={{ width: "100%" }}
                aria-label="Mengunggah berkas"
              ></div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg font-medium text-secondary hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
