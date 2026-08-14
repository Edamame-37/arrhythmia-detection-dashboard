import os
import re

# Fix AdminUsersPage.tsx
filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\admin\AdminUsersPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'type="date"', 'type="number"', content)
content = re.sub(r'onChange=\{e =>\s*setAddAge\(e\.target\.value\)\}', "onChange={e => setAddAge(parseInt(e.target.value) || '')}", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed.")
