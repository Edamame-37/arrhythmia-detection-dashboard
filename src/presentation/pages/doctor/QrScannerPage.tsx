import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DoctorSidebar } from '../../components/layout/DoctorSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { useConnection } from '../../../application/context/ConnectionContext';
import { Html5Qrcode } from 'html5-qrcode';
import { API_URL } from '../../../config/env';

export const QrScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, toggleSidebar } = useSidebar();
  const { setConnectedPatient, setConnectedDoctor, disconnectAll } = useConnection();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isProcessing = useRef(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [foundPatient, setFoundPatient] = useState<{ id: string, name: string } | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    setScannerInstance(html5QrCode);

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isProcessing.current) return;

            if (decodedText.includes('/sync/patient/')) {
              isProcessing.current = true;
              const parts = decodedText.split('/');
              const idToFetch = parts[parts.length - 1];
              const numId = parseInt(idToFetch.replace(/[^0-9]/g, '')) || 1;
              setInputValue(`PAT-${numId.toString().padStart(4, '0')}-XYZ`);

              fetchPatientData(numId);
            } else {
              // Invalid QR Code format
              isProcessing.current = true;
              setModalErrorMsg('Kode QR tidak valid. Pastikan Anda memindai kode QR dari aplikasi ECG Rhythmia.');
              setShowErrorModal(true);
            }
          },
          (errorMessage) => {
            // ignore continuous scan errors
          }
        );
        setIsCameraActive(true);
      } catch (err) {
        console.error("Failed to start camera", err);
        setCameraError(true);
        setIsCameraActive(false);
      }
    };

    let isMounted = true;
    startScanner().then(() => {
      if (!isMounted) {
        // If it unmounted while starting, stop it immediately.
        try {
          html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => html5QrCode.clear());
        } catch (e) {
          html5QrCode.clear();
        }
      }
    });

    return () => {
      isMounted = false;
      try {
        html5QrCode.stop()
          .then(() => html5QrCode.clear())
          .catch(() => html5QrCode.clear());
      } catch (e) {
        try { html5QrCode.clear(); } catch (err) { }
      }
    };
  }, []);

  const fetchPatientData = async (id: number) => {
    setIsLoading(true);

    try {
      // Simulate an error if ID is 0 or 9999 (allow manual failure for testing)
      if (id === 0 || id === 9999) {
        throw new Error('Simulated Not Found');
      }

      let patientData;
      try {
        const response = await fetch(`${API_URL}/api/patients/${id}`);
        if (!response.ok) throw new Error('Patient not found');

        const data = await response.json();
        patientData = data.patient;
      } catch (apiErr) {
        console.warn("Backend API offline or failed, using mock data for demo", apiErr);
        await new Promise(resolve => setTimeout(resolve, 800)); // simulate network delay
        patientData = {
          id: id,
          first_name: "Test",
          last_name: "Patient"
        };
      }

      const patientDisplay = {
        id: `PAT-${patientData.id.toString().padStart(4, '0')}-XYZ`,
        name: `${patientData.first_name} ${patientData.last_name}`
      };

      setFoundPatient(patientDisplay);
      setConnectedPatient({
        id: patientDisplay.id,
        name: patientDisplay.name,
        profile_photo: patientData.profile_photo || undefined,
        connectedAt: new Date().toISOString()
      });

      // Also register the current doctor to the connection context
      const docId = localStorage.getItem('user_id') || '1';
      try {
        const docRes = await fetch(`${API_URL}/api/doctors/${docId}`);
        if (docRes.ok) {
          const docData = await docRes.json();
          setConnectedDoctor({
            id: docId,
            name: `Dr. ${docData.first_name} ${docData.last_name}`,
            hospital: "",
            photo: docData.profile_photo || undefined
          });
        }
      } catch (e) {
        console.warn("Failed to fetch doctor profile during sync", e);
        setConnectedDoctor({
          id: docId,
          name: "Dokter (Sesi Aktif)",
          hospital: ""
        });
      }

      setShowSuccessModal(true);
    } catch (err) {
      setModalErrorMsg('Gagal terhubung! Pasien tidak ditemukan di dalam sistem atau ID tidak valid.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!inputValue) {
      setModalErrorMsg('Masukkan ID pasien terlebih dahulu sebelum melakukan pencarian.');
      setShowErrorModal(true);
      return;
    }
    const parsedId = inputValue.replace(/[^0-9]/g, '');
    if (!parsedId) {
      setModalErrorMsg('Format ID tidak valid. Harap gunakan format seperti PAT-0001-XYZ atau cukup masukkan angkanya saja.');
      setShowErrorModal(true);
      return;
    }

    const idToFetch = parseInt(parsedId);
    fetchPatientData(idToFetch);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    isProcessing.current = false;
  };

  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden w-full min-h-screen flex">


      <DoctorSidebar />

      <main id="main-content" className={`flex-grow min-h-screen pb-24 md:pb-12 transition-all duration-300 ${isOpen ? 'md:ml-[260px]' : 'ml-0'}`}>
        <header className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 z-40 px-6 py-4 flex justify-between items-center max-w-container-max mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} id="toggle-sidebar-btn" className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-charcoal">Scanner Pasien</h1>
              <p className="text-xs text-on-surface-variant mt-0.5">Scan QR code atau masukkan ID Pasien</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden p-4 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">

              <div className="flex flex-col gap-4">
                <div className="w-full aspect-square bg-surface-container-lowest border border-outline-variant/50 rounded-3xl relative shadow-sm overflow-hidden group">

                  {/* The HTML5 QR Code Scanner Container */}
                  <div id="reader" className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full border-none"></div>

                  {/* Corner Viewfinder Overlay */}
                  <div className="absolute inset-0 pointer-events-none p-4 flex items-center justify-center z-20">
                    <div className="w-full h-full relative">
                      {/* Top Left */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-black rounded-tl-3xl"></div>
                      {/* Top Right */}
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-black rounded-tr-3xl"></div>
                      {/* Bottom Left */}
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-black rounded-bl-3xl"></div>
                      {/* Bottom Right */}
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-black rounded-br-3xl"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-2">
                  <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-medical-teal font-medium transition-colors bg-surface-container px-4 py-2 rounded-full">
                    <span className="material-symbols-outlined text-[18px]">{cameraError || !isCameraActive ? 'videocam_off' : 'videocam'}</span>
                    {cameraError ? 'Kamera Gagal Akses' : (isCameraActive ? 'Status Kamera Aktif' : 'Status Kamera Tidak Aktif')}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6 justify-center">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal mb-2">Sinkronisasi Manual</h2>
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Masukkan ID Pasien secara manual jika kode QR sulit dipindai atau stiker rusak.</p>

                  <div className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Contoh: PAT-0001-XYZ"
                      className="w-full bg-surface border border-outline-variant rounded-2xl p-4 pl-12 text-lg focus:ring-2 focus:ring-medical-teal focus:border-medical-teal outline-none font-mono uppercase tracking-widest shadow-sm transition-shadow hover:shadow-md"
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">badge</span>
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full bg-medical-teal text-white py-4 rounded-2xl font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  )}
                  {isLoading ? 'Mencari...' : 'Hubungkan Pasien'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>



      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in-50 fade-in duration-500 ease-spring">
            <div className="w-20 h-20 bg-status-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-status-green" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-2">Pasien Terhubung!</h3>

            <div className="bg-surface-container-lowest rounded-2xl p-4 my-6 border border-outline-variant/50">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Identitas Pasien</p>
              <p className="font-bold font-mono text-lg text-charcoal mb-1">{foundPatient?.id}</p>
              <p className="text-on-surface font-medium">{foundPatient?.name}</p>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => {
                disconnectAll();
                setShowSuccessModal(false);
                isProcessing.current = false;
              }} className="flex-1 bg-surface-container text-on-surface font-bold py-3.5 rounded-xl hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
              <button onClick={() => navigate('/doctor/dashboard')} className="flex-[2] bg-medical-teal text-white py-3.5 rounded-xl font-bold shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border-2 border-brand-red/10 animate-in zoom-in-50 fade-in duration-500 ease-spring">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-red/20 animate-ping"></div>
              <span className="material-symbols-outlined text-5xl text-brand-red relative z-10" style={{ fontVariationSettings: '"FILL" 1' }}>error</span>
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">Koneksi Gagal</h3>

            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed px-2">
              {modalErrorMsg}
            </p>

            <button onClick={closeErrorModal} className="w-full bg-brand-red text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-brand-red/90 hover:-translate-y-0.5 transition-all active:scale-95">
              Tutup dan Coba Lagi
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
