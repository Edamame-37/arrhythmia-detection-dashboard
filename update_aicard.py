import os
import re

filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\components\dashboard\AiCard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Props
content = content.replace("interface AiCardProps {\n    sessionId?: string | null;\n    rawClassification?: string | null;\n    isDoctorReview?: boolean;\n    timeInterval?: string;\n}", 
"""interface AiCardProps {
    sessionId?: string | null;
    rawClassification?: string | null;
    isDoctorReview?: boolean;
    timeInterval?: string;
    frameId?: string | null;
    initialDevNote?: string | null;
    initialDocNote?: string | null;
    initialConfirmation?: boolean | null;
    initialDocClassification?: string | null;
    startTime?: number | null;
    endTime?: number | null;
}""")

# 2. Update Component Definition
content = content.replace("export const AiCard: React.FC<AiCardProps> = ({ sessionId, rawClassification, isDoctorReview, timeInterval }) => {", 
"export const AiCard: React.FC<AiCardProps> = ({ sessionId, rawClassification, isDoctorReview, timeInterval, frameId, initialDevNote, initialDocNote, initialConfirmation, initialDocClassification, startTime, endTime }) => {")

# 3. Update State Initialization
content = content.replace("const [verificationState, setVerificationState] = useState<'correct' | 'incorrect' | null>(null);\n    const [selectedCorrection, setSelectedCorrection] = useState<string>('Normal');",
"""const [verificationState, setVerificationState] = useState<'correct' | 'incorrect' | null>(initialConfirmation === true ? 'correct' : (initialConfirmation === false ? 'incorrect' : null));
    const [selectedCorrection, setSelectedCorrection] = useState<string>(initialDocClassification || 'Normal');
    const [docNote, setDocNote] = useState<string>(initialDocNote || '');""")

# 4. Update handleConfirm
content = content.replace("if (!sessionId || !timeInterval) return;", "if (!frameId || !timeInterval) return;")
content = content.replace("const docClassification = verificationState === 'correct' ? (rawClassification || 'Unclassified') : selectedCorrection;",
"const docClassification = verificationState === 'correct' ? (rawClassification || 'Unclassified') : selectedCorrection;")

content = content.replace("""const res = await fetchWithAuth(`/api/sessions/${sessionId}/confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirmation,
                    doc_classification: docClassification,
                    time_interval: timeInterval
                })
            });""",
"""const res = await fetchWithAuth(`/api/frames/${frameId}/annotation`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirmation: confirmation === 1,
                    doc_classification: docClassification,
                    start_time: startTime || 0,
                    end_time: endTime || 0,
                    label: rawClassification || 'Normal',
                    dev_note: initialDevNote || null,
                    doc_note: docNote
                })
            });""")

# 5. Add text areas to the UI before the Submit button
new_ui = """
                                    <div className="w-full max-w-[240px] mb-4 text-left">
                                        <label className="block text-[10px] text-clinical-charcoal/60 uppercase tracking-widest mb-1 font-label-md">Catatan Sistem/ML</label>
                                        <textarea 
                                            readOnly 
                                            value={initialDevNote || 'Tidak ada catatan dari sistem.'} 
                                            className="w-full text-xs font-body-sm bg-clinical-surface/50 border border-outline-variant rounded-lg px-3 py-2 text-clinical-charcoal/60 outline-none resize-none h-16"
                                        />
                                    </div>
                                    <div className="w-full max-w-[240px] mb-5 text-left">
                                        <label className="block text-[10px] text-clinical-charcoal/60 uppercase tracking-widest mb-1 font-label-md">Catatan Dokter</label>
                                        <textarea 
                                            value={docNote}
                                            onChange={(e) => setDocNote(e.target.value)}
                                            placeholder="Tambahkan catatan analitis..." 
                                            className="w-full text-xs font-body-sm bg-white border border-outline-variant rounded-lg px-3 py-2 text-clinical-charcoal focus:ring-2 focus:ring-clinical-blue/20 focus:border-clinical-blue outline-none resize-none h-20 shadow-sm transition-all"
                                        />
                                    </div>

                                    {verificationState && ("""
content = content.replace("{verificationState && (", new_ui)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
