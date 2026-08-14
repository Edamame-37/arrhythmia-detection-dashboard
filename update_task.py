import os

filepath = r'c:\Users\ra07z\.gemini\antigravity-ide\brain\ef39c5d9-4964-46d3-a670-fcc0431f2ddb\task.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("- `[ ]` **Fase 2: Sistem Unggah Kertas EKG (Frontend)**", "- `[x]` **Fase 2: Sistem Unggah Kertas EKG (Frontend)**")
content = content.replace("- `[ ]` **Fase 3: Sistem Anotasi Tunggal (Frontend)**", "- `[x]` **Fase 3: Sistem Anotasi Tunggal (Frontend)**")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
