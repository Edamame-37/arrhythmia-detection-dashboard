import os
import re

# Fix AdminUsersPage.tsx
filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\admin\AdminUsersPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("onChange={(e) => setAddAge(e.target.value)}", "onChange={(e) => setAddAge(parseInt(e.target.value) || '')}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)


# Fix PatientHistoryPage.tsx
filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\patient\PatientHistoryPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("}, true); // Use true flag to indicate multipart", "}); // Multipart is handled automatically by not setting Content-Type")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed.")
