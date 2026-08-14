import os
import re

filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\doctor\AnalyticsPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update fetch
content = content.replace("fetchWithAuth(`/api/records/${sessionId}`)\n            .then(res => res.json())\n            .then(data => {",
"""Promise.all([
            fetchWithAuth(`/api/records/${sessionId}`).then(res => res.json()),
            fetchWithAuth(`/api/sessions/${sessionId}/frames`).then(res => res.json()).catch(() => ({ frames: [] }))
        ])
            .then(([data, framesData]) => {""")

# 2. Add dbFrame inside loop
# Find `const evalResult = evaluateIrregularity(rrIntervals);` and insert mapping right after
content = content.replace("const evalResult = evaluateIrregularity(rrIntervals);",
"""const dbFrame = framesData?.frames?.find((f: any) => f.time_interval === loadedEvents[loadedEvents.length - 1].timeStr) || {};
                    const evalResult = evaluateIrregularity(rrIntervals);""")

# 3. Add to loadedSegments
content = content.replace("createdAt: payload.created_at || \"---\",",
"""createdAt: payload.created_at || "---",
                        dbId: dbFrame.id || null,
                        devNote: dbFrame.dev_note || null,
                        docNote: dbFrame.doc_note || null,
                        confirmation: dbFrame.confirmation !== undefined ? dbFrame.confirmation : null,
                        docClassification: dbFrame.doc_classification || null,
                        startTime: dbFrame.start_time || null,
                        endTime: dbFrame.end_time || null,""")

# 4. Update the AiCard invocation
old_aicard = """<AiCard 
                        sessionId={sessionId} 
                        rawClassification={currentEvent?.classResult || null} 
                        isDoctorReview={true}
                        timeInterval={currentEvent ? `${currentEvent.timeStr} - ${events[selectedIdx + 1]?.timeStr || 'Akhir'}` : undefined}
                    />"""

new_aicard = """<AiCard 
                        sessionId={sessionId} 
                        rawClassification={currentEvent?.classResult || null} 
                        isDoctorReview={true}
                        timeInterval={currentEvent ? `${currentEvent.timeStr} - ${events[selectedIdx + 1]?.timeStr || 'Akhir'}` : undefined}
                        frameId={currentSegment?.dbId}
                        initialDevNote={currentSegment?.devNote}
                        initialDocNote={currentSegment?.docNote}
                        initialConfirmation={currentSegment?.confirmation}
                        initialDocClassification={currentSegment?.docClassification}
                        startTime={currentSegment?.startTime}
                        endTime={currentSegment?.endTime}
                    />"""

content = content.replace(old_aicard, new_aicard)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
