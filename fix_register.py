import os

filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\auth\RegisterPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const [dob, setDob] = useState('');", "const [age, setAge] = useState<number | ''>('');")
content = content.replace("date_of_birth: role === 'pasien' ? dob : null,", "age: role === 'pasien' ? (age || 0) : null,")

old_input = '''<div className="space-y-1.5 relative group">
                            <label className="text-xs font-bold text-charcoal uppercase tracking-wider">{t('auth.dob')}</label>
                            <input
                                type="date"
                                required
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}'''
new_input = '''<div className="space-y-1.5 relative group">
                            <label className="text-xs font-bold text-charcoal uppercase tracking-wider">{t('profile.age')}</label>
                            <input
                                type="number"
                                min="0" max="150"
                                required
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value))}'''
content = content.replace(old_input, new_input)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated RegisterPage.tsx")
