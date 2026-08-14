import os

# Fix AdminUsersPage.tsx
filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\admin\AdminUsersPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("setAddDob", "setAddAge")
content = content.replace("addDob", "addAge")
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix RegisterPage.tsx
filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\auth\RegisterPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("value={dob}", "value={age}")
content = content.replace("onChange={(e) => setDob(e.target.value)}", "onChange={(e) => setAge(parseInt(e.target.value))}")
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix PatientHistoryPage.tsx
filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\patient\PatientHistoryPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
if "fetchWithAuth" not in content[:500]:
    content = content.replace("import { API_URL } from '../../../config/env';", "import { API_URL } from '../../../config/env';\nimport { fetchWithAuth } from '../../../config/api';")
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed frontend TS errors.")
