import os

filepath = r'c:\ecgrhythmia\arrhythmia-detection-dashboard\src\presentation\pages\patient\PatientProfilePage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace interface
content = content.replace('date_of_birth: string;', 'age: number;')

# Replace formData init
content = content.replace("date_of_birth: '',", "age: 0,")

# Replace form state from profile
content = content.replace("date_of_birth: data.patient.date_of_birth || '',", "age: data.patient.age || 0,")
content = content.replace("date_of_birth: '1968-05-12',", "age: 56,")
content = content.replace("date_of_birth: mockData.patient.date_of_birth,", "age: mockData.patient.age,")

# Replace API payload
content = content.replace("date_of_birth: formData.date_of_birth,", "age: Number(formData.age),")

# Replace calculateAge block
old_dob_render = '''<div className="bg-clinical-surface p-5 rounded-2xl border border-clinical-charcoal/5 transition-all hover:border-clinical-blue/30 hover:shadow-sm">
                                            <p className="text-[10px] text-clinical-charcoal/60 uppercase font-bold tracking-widest mb-1">{t('profile.dob')}</p>
                                            <p className="text-base font-bold text-clinical-charcoal flex items-center gap-2">
                                                {isLoading ? '---' : (profile?.patient?.date_of_birth ? new Date(profile.patient.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')}
                                            </p>
                                        </div>'''

new_dob_render = ''
content = content.replace(old_dob_render, new_dob_render)

old_age_render = "calculateAge(profile?.patient?.date_of_birth) ? ${calculateAge(profile.patient.date_of_birth)} "
new_age_render = "profile?.patient?.age ? ${profile.patient.age} "
content = content.replace(old_age_render, new_age_render)

# Replace input field
old_input = '''<label className="text-xs font-bold text-clinical-charcoal uppercase tracking-wider">{t('profile.dob')}</label>
                                        <input
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}'''
new_input = '''<label className="text-xs font-bold text-clinical-charcoal uppercase tracking-wider">{t('profile.age')}</label>
                                        <input
                                            type="number"
                                            min="0" max="150"
                                            value={formData.age || ''}
                                            onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}'''
content = content.replace(old_input, new_input)

# Replace cancel button reset
content = content.replace("date_of_birth: profile.patient.date_of_birth,", "age: profile.patient.age,")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PatientProfilePage.tsx")
