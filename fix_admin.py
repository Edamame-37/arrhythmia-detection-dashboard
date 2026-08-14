import os

filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\admin\AdminUsersPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const [addDob, setAddDob] = useState('');", "const [addAge, setAddAge] = useState<number | ''>('');")
content = content.replace("date_of_birth: addDob,", "age: addAge || 0,")

old_input = '''<div>
                                    <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">{t('adminUsers.dob')}</label>
                                    <input type="date" value={addDob} onChange={e => setAddDob(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-charcoal/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue focus:border-transparent transition-all" />
                                </div>'''
new_input = '''<div>
                                    <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">{t('profile.age')}</label>
                                    <input type="number" min="0" value={addAge} onChange={e => setAddAge(Number(e.target.value))} required className="w-full px-4 py-2.5 bg-white border border-charcoal/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue focus:border-transparent transition-all" />
                                </div>'''
content = content.replace(old_input, new_input)

old_detail = "userDetail.date_of_birth || userDetail.doctor?.date_of_birth || userDetail.patient?.date_of_birth || 'Belum diatur'"
new_detail = "userDetail.age || userDetail.doctor?.age || userDetail.patient?.age || 'Belum diatur'"
content = content.replace(old_detail, new_detail)

old_detail_label = "{t('adminUsers.dob')}"
new_detail_label = "{t('profile.age')}"
# but be careful to only replace it near the detail view. 
# actually it's fine if we leave the translation as is, but we want it to be Age.
content = content.replace(old_detail_label, new_detail_label)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminUsersPage.tsx")
