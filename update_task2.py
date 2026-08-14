import os

filepath = r'c:\Users\ra07z\.gemini\antigravity-ide\brain\ef39c5d9-4964-46d3-a670-fcc0431f2ddb\task.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("- `[ ]` 3. **Fase 2: Sistem Unggah Kertas EKG (Frontend)**", "- `[x]` 3. **Fase 2: Sistem Unggah Kertas EKG (Frontend)**")
content = content.replace("- `[ ]` 5. **Fase 3: Sistem Anotasi Tunggal (Frontend)**", "- `[x]` 5. **Fase 3: Sistem Anotasi Tunggal (Frontend)**")
content = content.replace("- `[ ]`   - `[ ]` Tambahkan komponen tombol", "- `[x]`   - `[x]` Tambahkan komponen tombol")
content = content.replace("- `[ ]`   - `[ ]` Integrasikan *fetching* data", "- `[x]`   - `[x]` Integrasikan *fetching* data")
content = content.replace("- `[ ]`   - `[ ]` Modifikasi form *Pop-up/Modal*", "- `[x]`   - `[x]` Modifikasi form *Pop-up/Modal*")
content = content.replace("- `[ ]` 6. **Verifikasi & Finalisasi**", "- `[x]` 6. **Verifikasi & Finalisasi**")
content = content.replace("- `[ ]`   - `[ ]` `cargo check` di backend.", "- `[x]`   - `[x]` `cargo check` di backend.")
content = content.replace("- `[ ]`   - `[ ]` Pastikan frontend tidak ada *type errors*.", "- `[x]`   - `[x]` Pastikan frontend tidak ada *type errors*.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
