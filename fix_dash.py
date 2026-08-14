import os

filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\patient\PatientDashboardPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("date_of_birth: string;", "age: number;")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PatientDashboardPage.tsx")
