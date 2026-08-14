import os

filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\patient\PatientHistoryPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update imports and interface
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';")
content = content.replace("started_at: string;\n}", "started_at: string;\n    ecg_paper?: string | null;\n}")

# Update state and hooks
content = content.replace("const [sessions, setSessions] = useState<SessionRecord[]>([]);",
"""const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingSessionId, setUploadingSessionId] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !uploadingSessionId) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('paper', file);

        try {
            const res = await fetchWithAuth(`/api/sessions/${uploadingSessionId}/ecg_paper`, {
                method: 'POST',
                body: formData
            }, true); // Use true flag to indicate multipart
            const data = await res.json();
            if (data.success) {
                setSessions(prev => prev.map(s => s.id === uploadingSessionId ? { ...s, ecg_paper: data.path } : s));
            } else {
                alert("Gagal mengunggah foto: " + data.message);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Terjadi kesalahan saat mengunggah foto.");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
            setUploadingSessionId(null);
        }
    };

    const triggerUpload = (sessionId: string) => {
        setUploadingSessionId(sessionId);
        if (fileInputRef.current) fileInputRef.current.click();
    };""")

# Add file input element
content = content.replace("<PatientHeader />", "<PatientHeader />\n            <input type=\"file\" ref={fileInputRef} className=\"hidden\" accept=\"image/*\" onChange={handleFileChange} />")

# Update render block
old_buttons = """<div className="flex items-center gap-3 w-full md:w-auto">
                                    <Link
                                        to={`/patient/history/${session.id}`}"""
new_buttons = """<div className="flex items-center gap-3 w-full md:w-auto">
                                    {session.ecg_paper ? (
                                        <button onClick={() => setPreviewImage(API_URL + session.ecg_paper)} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-clinical-blue text-white font-bold text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all outline-none">
                                            Lihat Foto EKG
                                            <span className="material-symbols-outlined text-[18px]">image</span>
                                        </button>
                                    ) : (
                                        <button onClick={() => triggerUpload(session.id)} disabled={uploadingSessionId === session.id} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-clinical-charcoal/5 text-clinical-charcoal font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-charcoal/10 active:scale-95 transition-all outline-none">
                                            {uploadingSessionId === session.id ? "Mengunggah..." : "Unggah Foto EKG"}
                                            <span className="material-symbols-outlined text-[18px]">upload</span>
                                        </button>
                                    )}
                                    <Link
                                        to={`/patient/history/${session.id}`}"""

content = content.replace(old_buttons, new_buttons)

# Add image preview modal
content = content.replace("</main>", """</main>
            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full p-4" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white hover:text-clinical-red transition-colors">
                            <span className="material-symbols-outlined text-4xl">close</span>
                        </button>
                        <img src={previewImage} alt="ECG Paper" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
                    </div>
                </div>
            )}""")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
