import React, { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
export function QrReader({
  onRead,
  onStatusChange,
}: {
  onRead: (value: string) => void;
  onStatusChange?: (status: { active: boolean; error: string }) => void;
}) {
  const id = "qr-" + useId().replace(/[^a-z0-9]/gi, "");
  const scanner = useRef<Html5Qrcode | null>(null);
  const mounted = useRef(true);
  const starting = useRef(false);
  const callback = useRef(onRead);
  useEffect(() => {
    callback.current = onRead;
  }, [onRead]);
  const statusCallback = useRef(onStatusChange);
  useEffect(() => {
    statusCallback.current = onStatusChange;
  }, [onStatusChange]);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    statusCallback.current?.({ active, error });
  }, [active, error]);
  const stop = async () => {
    const current = scanner.current;
    scanner.current = null;
    if (current) {
      try {
        await current.stop();
      } catch {
        /* Start may still be completing. */
      }
      try {
        current.clear();
      } catch {
        /* Camera startup may still be pending. */
      }
    }
    if (mounted.current) setActive(false);
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void stop();
    };
  }, []);
  const start = async () => {
    if (starting.current || scanner.current) return;
    starting.current = true;
    setError("");
    const current = new Html5Qrcode(id);
    scanner.current = current;
    try {
      let consumed = false;
      await current.start(
        { facingMode: "environment" },
        { fps: 10 },
        (value) => {
          if (consumed || !mounted.current) return;
          consumed = true;
          callback.current(value);
          void stop();
        },
        () => {},
      );
      if (!mounted.current || scanner.current !== current) {
        try {
          await current.stop();
        } catch {}
        try {
          current.clear();
        } catch {
          /* Camera startup may still be pending. */
        }
      } else setActive(true);
    } catch (problem) {
      scanner.current = null;
      if (mounted.current)
        setError(
          problem instanceof Error
            ? problem.message
            : "Kamera tidak dapat diakses",
        );
    } finally {
      starting.current = false;
    }
  };
  return (
    <section className="relative w-full h-full min-h-[280px] flex flex-col items-center justify-center bg-clinical-surface/50">
      <div
        id={id}
        className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
      />
      <button
        type="button"
        className="absolute bottom-6 z-30 bg-white border border-clinical-charcoal/10 shadow-sm text-clinical-blue rounded-full px-5 py-2.5 text-xs font-bold hover:brightness-95"
        onClick={() => (active ? void stop() : void start())}
      >
        {active ? "Hentikan kamera" : "Pindai dengan kamera"}
      </button>
      {error && (
        <p
          role="alert"
          className="absolute top-6 z-30 rounded-xl bg-white/95 border border-red-100 p-3 text-xs text-red-700 mx-4"
        >
          {error}. Anda dapat memasukkan kode secara manual.
        </p>
      )}
    </section>
  );
}
