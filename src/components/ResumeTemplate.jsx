import React from 'react';

const ResumeTemplate = ({ data }) => {
  if (!data) return null;

  const isFresher = data.profileType === 'fresher';

  const skills = Array.isArray(data.skills) ? data.skills
    : typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()) : [];

  const certifications = Array.isArray(data.certifications) ? data.certifications.filter(c => c)
    : typeof data.certifications === 'string' && data.certifications ? [data.certifications] : [];

  const languages = Array.isArray(data.languages) ? data.languages.filter(l => l)
    : typeof data.languages === 'string' && data.languages ? data.languages.split(',').map(l => l.trim()) : [];

  const achievements = Array.isArray(data.achievements) ? data.achievements.filter(a => a)
    : typeof data.achievements === 'string' && data.achievements ? [data.achievements] : [];

  const hobbies = Array.isArray(data.hobbies) ? data.hobbies.filter(h => h)
    : typeof data.hobbies === 'string' && data.hobbies ? data.hobbies.split(',').map(h => h.trim()) : [];

  const extraCurricular = Array.isArray(data.extraCurricular) ? data.extraCurricular.filter(e => e)
    : typeof data.extraCurricular === 'string' && data.extraCurricular ? data.extraCurricular.split(',').map(e => e.trim()) : [];

  const hasExperience = data.experience?.length > 0 && data.experience[0]?.company?.trim() !== '';

  // PDF-safe typography settings with explicit layout word separation overrides
  const sectionHeading = {
    fontSize: '12px', 
    fontWeight: '800', 
    textTransform: 'uppercase',
    letterSpacing: '1px', 
    wordSpacing: '2px', // Added safety boundary spacing override
    color: '#4f46e5', 
    margin: '0 0 10px 0',
    paddingBottom: '4px', 
    borderBottom: '1.5px solid #e0e0ff',
    lineHeight: '1.4'
  };
  
  const sectionWrap = { 
    marginBottom: '18px',
    clear: 'both'
  };
  
  const bulletStyle = { 
    fontSize: '12px', 
    color: '#333333', 
    lineHeight: '1.6', 
    marginBottom: '5px',
    letterSpacing: '0.3px', // Expanded baseline tracking metric values
    wordSpacing: '1px'
  };
  
  const tagStyle = {
    background: '#f0f0ff', 
    color: '#3730a3', 
    padding: '5px 8px',
    borderRadius: '2px', 
    fontSize: '11px', 
    fontWeight: '600',
    borderLeft: '3px solid #4f46e5', 
    marginBottom: '6px',
    display: 'block',
    lineHeight: '1.3',
    letterSpacing: '0.3px',
    wordBreak: 'break-word'
  };

  return (
    <div 
      id="resume-template" 
      style={{
        width: '794px', 
        minHeight: '1123px', 
        background: '#ffffff', 
        color: '#111111',
        fontFamily: 'Arial, Helvetica, sans-serif', 
        padding: '44px 50px',
        boxSizing: 'border-box', 
        fontSize: '13px',
        lineHeight: '1.5',
        letterSpacing: '0.3px', // Base container scale fallback metric
        wordSpacing: '1px'       // Prevents structural dynamic character crashing bugs
      }}
    >

      {/* HEADER */}
      <div style={{ borderBottom: '2.5px solid #4f46e5', paddingBottom: '12px', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 4px 0', color: '#111111', lineHeight: '1.2', letterSpacing: '0.5px' }}>
          {data.name}
        </h1>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#4f46e5', margin: '0 0 8px 0', lineHeight: '1.3', letterSpacing: '0.4px' }}>
          {data.currentRole}
        </p>
        
        {/* Contact Links: Migrated from inline spans to absolute flex wrappers to enforce clean spacing */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: '11.5px', color: '#444444', lineHeight: '1.5' }}>
          {data.email && <span style={{ display: 'inline-flex', alignItems: 'center' }}>📧{" "}{data.email}</span>}
          {data.phone && <span style={{ display: 'inline-flex', alignItems: 'center' }}>📞{" "}{data.phone}</span>}
          {data.linkedin && <span style={{ display: 'inline-flex', alignItems: 'center' }}>🔗{" "}{data.linkedin}</span>}
          {data.github && <span style={{ display: 'inline-flex', alignItems: 'center' }}>💻{" "}{data.github}</span>}
          {data.portfolio && <span style={{ display: 'inline-flex', alignItems: 'center' }}>🌐{" "}{data.portfolio}</span>}
        </div>
      </div>

      {/* SUMMARY / OBJECTIVE */}
      {data.summary && (
        <div style={sectionWrap}>
          <h2 style={sectionHeading}>{isFresher ? 'Career Objective' : 'Professional Summary'}</h2>
          <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#333333', margin: 0, letterSpacing: '0.2px', wordSpacing: '0.5px' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* TWO COLUMN CONTENT WRAPPERS */}
      <div style={{ width: '100%', clear: 'both' }}>

        {/* LEFT COLUMN (approx 70% width) */}
        <div style={{ width: '510px', float: 'left', marginRight: '24px' }}>

          {/* Experience */}
          {hasExperience && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>{isFresher ? 'Internship Experience' : 'Work Experience'}</h2>
              {data.experience.map((exp, i) => exp.company ? (
                <div key={i} style={{ marginBottom: '14px', clear: 'both' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#666666', float: 'right', background: '#f5f5ff', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', letterSpacing: '0.2px' }}>
                      {exp.duration}
                    </span>
                    <p style={{ fontWeight: '800', fontSize: '13px', margin: '0 0 2px 0', color: '#111111', width: '380px', letterSpacing: '0.2px' }}>
                      {exp.role}
                    </p>
                    <p style={{ color: '#4f46e5', fontSize: '12px', margin: '0', fontWeight: '600', letterSpacing: '0.2px' }}>
                      {exp.company}
                    </p>
                  </div>
                  <div style={{ clear: 'both' }}></div>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px' }}>
                    {(Array.isArray(exp.bullets) ? exp.bullets : String(exp.bullets || '').split('\n'))
                      .filter(b => b?.trim()).map((b, j) => (
                        <li key={j} style={bulletStyle}>
                          {" "}{b}
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null)}
            </div>
          )}

          {/* Projects */}
          {data.projects?.length > 0 && data.projects[0]?.name && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>Projects</h2>
              {data.projects.map((proj, i) => proj.name ? (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <p style={{ fontWeight: '800', fontSize: '13px', margin: '0 0 2px 0', color: '#111111', letterSpacing: '0.2px' }}>{proj.name}</p>
                  {proj.tech && <p style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '600', margin: '0 0 4px 0', letterSpacing: '0.2px' }}>{proj.tech}</p>}
                  <p style={{ fontSize: '12px', color: '#444444', lineHeight: '1.5', margin: 0, letterSpacing: '0.1px' }}>{proj.description}</p>
                </div>
              ) : null)}
            </div>
          )}

          {/* Education */}
          {data.education?.length > 0 && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>Education</h2>
              {data.education.map((edu, i) => edu.institution ? (
                <div key={i} style={{ marginBottom: '12px', clear: 'both' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#666666', float: 'right', background: '#f5f5ff', padding: '2px 8px', borderRadius: '4px' }}>
                      {edu.year}
                    </span>
                    <p style={{ fontWeight: '800', fontSize: '13px', margin: '0 0 2px 0', color: '#111111', width: '380px', letterSpacing: '0.2px' }}>
                      {edu.degree}{edu.branch ? ` — ${edu.branch}` : ''}
                    </p>
                    <p style={{ color: '#4f46e5', fontSize: '12px', margin: '0', fontWeight: '600', letterSpacing: '0.1px' }}>{edu.institution}</p>
                    {edu.percentage && <p style={{ fontSize: '11.5px', color: '#666666', margin: '2px 0 0 0' }}>Score: {edu.percentage}</p>}
                  </div>
                  <div style={{ clear: 'both' }}></div>
                </div>
              ) : null)}
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>Achievements & Awards</h2>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {achievements.map((a, i) => (
                  <li key={i} style={bulletStyle}>
                    {" "}{a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Extra Curricular */}
          {isFresher && extraCurricular.length > 0 && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>Extra Curricular Activities</h2>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {extraCurricular.map((item, i) => (
                  <li key={i} style={bulletStyle}>
                    {" "}{item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Declaration */}
          {isFresher && (
            <div style={{ marginTop: '16px', clear: 'both' }}>
              <h2 style={sectionHeading}>Declaration</h2>
              <p style={{ fontSize: '11.5px', color: '#444444', lineHeight: '1.6', margin: '0 0 20px 0', letterSpacing: '0.1px' }}>
                I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.
              </p>
              <div style={{ fontSize: '11.5px', color: '#333333', letterSpacing: '0.2px' }}>
                <div style={{ float: 'left', width: '33%' }}>Place: _____________</div>
                <div style={{ float: 'left', width: '33%' }}>Date: _____________</div>
                <div style={{ float: 'left', width: '34%', textAlign: 'right' }}>Signature: _____________</div>
                <div style={{ clear: 'both' }}></div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (approx 30% width) */}
        <div style={{ width: '160px', float: 'left' }}>

          {/* Skills */}
          {skills.length > 0 && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>Skills</h2>
              <div style={{ display: 'block' }}>
                {skills.map((skill, i) => <div key={i} style={tagStyle}>{skill}</div>)}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>Languages</h2>
              <div>
                {languages.map((lang, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#333333', marginBottom: '5px', lineHeight: '1.4', letterSpacing: '0.2px' }}>
                    <span style={{ color: '#4f46e5', fontWeight: '700', marginRight: '5px' }}>▸</span>{lang}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>Certifications</h2>
              <div>
                {certifications.map((cert, i) => (
                  <div key={i} style={{ fontSize: '11.5px', color: '#333333', lineHeight: '1.4', paddingBottom: '6px', marginBottom: '6px', borderBottom: i < certifications.length - 1 ? '1px solid #eeeeee' : 'none', letterSpacing: '0.1px' }}>
                    🏅{" "}{cert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {isFresher && hobbies.length > 0 && (
            <div style={sectionWrap}>
              <h2 style={sectionHeading}>Hobbies</h2>
              <div>
                {hobbies.map((h, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#333333', marginBottom: '5px', lineHeight: '1.4', letterSpacing: '0.2px' }}>
                    <span style={{ color: '#4f46e5', fontWeight: '700', marginRight: '5px' }}>▸</span>{h}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Clear columns structural wrapper */}
        <div style={{ clear: 'both' }}></div>
      </div>
    </div>
  );
};

export default ResumeTemplate;