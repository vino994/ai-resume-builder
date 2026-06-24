import React, { useState } from 'react';
import { autoGenerateResume } from '../utils/claudeAPI';
import { useNavigate } from 'react-router-dom';

const inputStyle = {
  width: '100%', padding: '11px 14px', background: '#1a1a1a',
  border: '1px solid #333', borderRadius: '8px', color: '#fff',
  fontSize: '14px', marginBottom: '14px', outline: 'none', fontFamily: 'inherit'
};
const labelStyle = { color: '#aaa', fontSize: '13px', marginBottom: '6px', display: 'block' };
const selectStyle = {
  padding: '11px 14px', background: '#1a1a1a', border: '1px solid #333',
  borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer'
};
const sectionTitle = (t) => (
  <h3 style={{
    color: '#8b5cf6', marginBottom: '16px', marginTop: '32px', fontSize: '13px',
    textTransform: 'uppercase', letterSpacing: '1.5px',
    borderBottom: '1px solid #222', paddingBottom: '10px'
  }}>{t}</h3>
);

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

const MonthYearPicker = ({ label, value, onChange, allowPresent }) => {
  const [month, setMonth] = useState(value?.month || '');
  const [year, setYear] = useState(value?.year || '');
  const [isPresent, setIsPresent] = useState(value?.present || false);

  const handleChange = (m, y, p) => onChange({ month: m, year: y, present: p });

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {!isPresent && (
          <>
            <select style={{ ...selectStyle, flex: 1 }} value={month}
              onChange={e => { setMonth(e.target.value); handleChange(e.target.value, year, false); }}>
              <option value="">Month</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select style={{ ...selectStyle, flex: 1 }} value={year}
              onChange={e => { setYear(e.target.value); handleChange(month, e.target.value, false); }}>
              <option value="">Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}
        {allowPresent && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={isPresent}
              onChange={e => { setIsPresent(e.target.checked); handleChange(month, year, e.target.checked); }}
              style={{ accentColor: '#8b5cf6' }} />
            Present
          </label>
        )}
      </div>
    </div>
  );
};

const formatDate = (d) => {
  if (!d) return '';
  if (d.present) return 'Present';
  if (d.month && d.year) return `${d.month} ${d.year}`;
  return '';
};

const ResumeForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [profileType, setProfileType] = useState('');
  const [showInternship, setShowInternship] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '',
    currentRole: '', totalExp: '', extraSkills: '', careerObjective: '',
    hobbies: '', extraCurricular: '',
    companies: [{ company: '', role: '', startDate: null, endDate: null }],
    education: [{ institution: '', degree: '', branch: '', startYear: '', endYear: '', percentage: '' }],
    certifications: '', languages: '', achievements: ''
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateCompany = (i, field, value) => {
    const updated = [...form.companies];
    updated[i][field] = value;
    setForm(prev => ({ ...prev, companies: updated }));
  };

  const updateEducation = (i, field, value) => {
    const updated = [...form.education];
    updated[i][field] = value;
    setForm(prev => ({ ...prev, education: updated }));
  };

  const handleGenerate = async () => {
    if (!form.name || !form.email) return alert('Name and Email are required!');

    const finalCompanies = (profileType === 'fresher' && !showInternship)
      ? []
      : form.companies.filter(c => c.company && c.role).map(c => ({
          ...c, duration: `${formatDate(c.startDate)} – ${formatDate(c.endDate)}`
        }));

    if (profileType === 'experienced' && finalCompanies.length === 0)
      return alert('Please add at least one company!');

    setLoading(true);
    const msgs = ['🔍 Analysing your profile...','✍️ Writing resume content...','🎯 Making it ATS-friendly...','⚡ Finalising your resume...'];
    let idx = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => { idx = (idx + 1) % msgs.length; setLoadingMsg(msgs[idx]); }, 2500);

    try {
      const payload = { ...form, profileType, companies: finalCompanies };
      const result = await autoGenerateResume(payload);
      localStorage.setItem('resumeData', JSON.stringify(result));
      clearInterval(interval);
      navigate('/preview');
    } catch (e) {
      clearInterval(interval);
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  if (!profileType) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px', textAlign: 'center' }}>Who are you? 👋</h2>
        <p style={{ color: '#888', marginBottom: '48px', textAlign: 'center' }}>We'll customize the form for you</p>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { type: 'fresher', icon: '🎓', label: 'Fresher', desc: 'Student or recent graduate with no/little work experience' },
            { type: 'experienced', icon: '💼', label: 'Experienced', desc: 'Working professional with industry experience' }
          ].map(opt => (
            <div key={opt.type} onClick={() => { setProfileType(opt.type); setShowInternship(false); }}
              style={{ background: '#1a1a1a', border: '2px solid #333', borderRadius: '16px', padding: '40px 32px', cursor: 'pointer', textAlign: 'center', width: '220px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#8b5cf6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{opt.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>{opt.label}</div>
              <div style={{ color: '#888', fontSize: '13px' }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setProfileType('')}
          style={{ background: 'none', border: '1px solid #333', color: '#aaa', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}>
          ← Back
        </button>
        <span style={{ background: '#2a1a4a', color: '#8b5cf6', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
          {profileType === 'fresher' ? '🎓 Fresher' : '💼 Experienced'}
        </span>
      </div>

      <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>Tell us about yourself</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Fill the basics — AI writes the rest ✨</p>

      {sectionTitle('Personal Info')}
      <label style={labelStyle}>Full Name *</label>
      <input style={inputStyle} placeholder="Kishore Kumar" value={form.name} onChange={e => update('name', e.target.value)} />
      <label style={labelStyle}>Email *</label>
      <input style={inputStyle} placeholder="kishore@gmail.com" value={form.email} onChange={e => update('email', e.target.value)} />
      <label style={labelStyle}>Phone</label>
      <input style={inputStyle} placeholder="+91 99999 99999" value={form.phone} onChange={e => update('phone', e.target.value)} />
      <label style={labelStyle}>LinkedIn URL</label>
      <input style={inputStyle} placeholder="linkedin.com/in/kishore" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} />
      <label style={labelStyle}>GitHub URL</label>
      <input style={inputStyle} placeholder="github.com/kishore" value={form.github} onChange={e => update('github', e.target.value)} />
      <label style={labelStyle}>Portfolio URL (optional)</label>
      <input style={inputStyle} placeholder="kishore.vercel.app" value={form.portfolio} onChange={e => update('portfolio', e.target.value)} />

      {sectionTitle('Your Role')}
      <label style={labelStyle}>{profileType === 'fresher' ? 'Target Job Role *' : 'Current Job Role *'}</label>
      <input style={inputStyle} placeholder="Frontend Developer" value={form.currentRole} onChange={e => update('currentRole', e.target.value)} />

      {profileType === 'experienced' && (
        <>
          <label style={labelStyle}>Total Years of Experience</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.totalExp} onChange={e => update('totalExp', e.target.value)}>
            <option value="">Select experience</option>
            {['Less than 1 year','1 year','2 years','3 years','4 years','5 years','6 years','7 years','8+ years','10+ years'].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </>
      )}

      <label style={labelStyle}>Key Skills (comma separated)</label>
      <input style={inputStyle} placeholder="React.js, JavaScript, GSAP, Tailwind CSS" value={form.extraSkills} onChange={e => update('extraSkills', e.target.value)} />

      {profileType === 'fresher' && (
        <>
          <label style={labelStyle}>Career Objective (optional — AI will improve it)</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="I am a passionate developer..."
            value={form.careerObjective} onChange={e => update('careerObjective', e.target.value)} />
        </>
      )}

      {/* Fresher internship toggle */}
      {profileType === 'fresher' && (
        <>
          {sectionTitle('Internship / Part-time (Optional)')}
          <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
            <p style={{ color: '#60a5fa', fontSize: '13px', margin: '0 0 14px 0', fontWeight: '600' }}>
              🎓 Did you do any internship or part-time work?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowInternship(true)}
                style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: showInternship ? '#4f46e5' : '#1a1a2a', color: showInternship ? '#fff' : '#888' }}>
                ✅ Yes, I have
              </button>
              <button onClick={() => { setShowInternship(false); setForm(prev => ({ ...prev, companies: [{ company: '', role: '', startDate: null, endDate: null }] })); }}
                style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: !showInternship ? '#4f46e5' : '#1a1a2a', color: !showInternship ? '#fff' : '#888' }}>
                ❌ No, skip this
              </button>
            </div>
          </div>
        </>
      )}

      {/* Experienced work section title */}
      {profileType === 'experienced' && sectionTitle('Work Experience')}
      {profileType === 'experienced' && (
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>Add company name & role — AI writes the bullets 🤖</p>
      )}

      {/* Company cards */}
      {(profileType === 'experienced' || showInternship) && (
        <>
          {form.companies.map((c, i) => (
            <div key={i} style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '700' }}>
                  {profileType === 'fresher' ? `Internship ${i + 1}` : `Company ${i + 1}`}
                </span>
                {form.companies.length > 1 && (
                  <button onClick={() => setForm(prev => ({ ...prev, companies: prev.companies.filter((_, idx) => idx !== i) }))}
                    style={{ background: '#2a1a1a', border: 'none', color: '#ff6b6b', cursor: 'pointer', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>
                    Remove
                  </button>
                )}
              </div>
              <label style={labelStyle}>{profileType === 'fresher' ? 'Company / Organization' : 'Company Name'}</label>
              <input style={inputStyle} placeholder={profileType === 'fresher' ? 'ABC Pvt Ltd / Startup' : 'Hogarth Worldwide'}
                value={c.company} onChange={e => updateCompany(i, 'company', e.target.value)} />
              <label style={labelStyle}>{profileType === 'fresher' ? 'Internship Role' : 'Your Role'}</label>
              <input style={inputStyle} placeholder={profileType === 'fresher' ? 'Frontend Intern' : 'Frontend Developer'}
                value={c.role} onChange={e => updateCompany(i, 'role', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <MonthYearPicker label="Start Date" value={c.startDate} onChange={val => updateCompany(i, 'startDate', val)} allowPresent={false} />
                <MonthYearPicker label="End Date" value={c.endDate} onChange={val => updateCompany(i, 'endDate', val)} allowPresent={true} />
              </div>
            </div>
          ))}
          <button className="btn-secondary"
            onClick={() => setForm(prev => ({ ...prev, companies: [...prev.companies, { company: '', role: '', startDate: null, endDate: null }] }))}
            style={{ width: '100%', marginBottom: '8px' }}>
            + {profileType === 'fresher' ? 'Add Another Internship' : 'Add Another Company'}
          </button>
        </>
      )}

      {sectionTitle('Education')}
      {form.education.map((edu, i) => (
        <div key={i} style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '700' }}>Education {i + 1}</span>
            {form.education.length > 1 && (
              <button onClick={() => setForm(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }))}
                style={{ background: '#2a1a1a', border: 'none', color: '#ff6b6b', cursor: 'pointer', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>
                Remove
              </button>
            )}
          </div>
          <label style={labelStyle}>Institution Name</label>
          <input style={inputStyle} placeholder="Anna University" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} />
          <label style={labelStyle}>Degree</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)}>
            <option value="">Select Degree</option>
            {['B.E','B.Tech','B.Sc','B.Com','B.A','BCA','MCA','M.E','M.Tech','M.Sc','MBA','Diploma','12th / HSC','10th / SSLC','Other'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label style={labelStyle}>Branch / Specialization</label>
          <input style={inputStyle} placeholder="Computer Science Engineering" value={edu.branch} onChange={e => updateEducation(i, 'branch', e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Start Year</label>
              <select style={{ ...selectStyle, width: '100%' }} value={edu.startYear} onChange={e => updateEducation(i, 'startYear', e.target.value)}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>End Year</label>
              <select style={{ ...selectStyle, width: '100%' }} value={edu.endYear} onChange={e => updateEducation(i, 'endYear', e.target.value)}>
                <option value="">Year</option>
                {[...years, 'Present'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>% / CGPA</label>
              <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="8.5 / 85%" value={edu.percentage} onChange={e => updateEducation(i, 'percentage', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button className="btn-secondary"
        onClick={() => setForm(prev => ({ ...prev, education: [...prev.education, { institution: '', degree: '', branch: '', startYear: '', endYear: '', percentage: '' }] }))}
        style={{ width: '100%', marginBottom: '8px' }}>
        + Add Education
      </button>

      {sectionTitle('Additional Info')}
      <label style={labelStyle}>Certifications (optional)</label>
      <input style={inputStyle} placeholder="AWS Certified, Google UX Design, Meta Frontend..." value={form.certifications} onChange={e => update('certifications', e.target.value)} />
      <label style={labelStyle}>Languages Known</label>
      <input style={inputStyle} placeholder="Tamil, English, Hindi" value={form.languages} onChange={e => update('languages', e.target.value)} />
      <label style={labelStyle}>Achievements / Awards (optional)</label>
      <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
        placeholder="Hackathon winner, College topper, Open source contributor..."
        value={form.achievements} onChange={e => update('achievements', e.target.value)} />

      {profileType === 'fresher' && (
        <>
          <label style={labelStyle}>Hobbies & Interests (optional)</label>
          <input style={inputStyle} placeholder="Reading, Photography, Gaming, Travelling..."
            value={form.hobbies} onChange={e => update('hobbies', e.target.value)} />
          <label style={labelStyle}>Extra Curricular Activities (optional)</label>
          <input style={inputStyle} placeholder="NSS Volunteer, Cultural Secretary, Sports Captain..."
            value={form.extraCurricular} onChange={e => update('extraCurricular', e.target.value)} />
        </>
      )}

      <div style={{ marginTop: '40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px', background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
            <p style={{ color: '#8b5cf6', fontWeight: '700', fontSize: '16px' }}>{loadingMsg}</p>
            <p style={{ color: '#555', fontSize: '13px', marginTop: '8px' }}>Taking 15–20 seconds...</p>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleGenerate} style={{ width: '100%', padding: '18px', fontSize: '17px' }}>
            🚀 Generate My ATS Resume with AI
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;