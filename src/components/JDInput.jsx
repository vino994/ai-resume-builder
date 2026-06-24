import React, { useState } from 'react';
import { tailorResume } from '../utils/claudeAPI';
import { useNavigate } from 'react-router-dom';
import ResumeTemplate from './ResumeTemplate';

const JDInput = () => {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [tailored, setTailored] = useState(null);
  const navigate = useNavigate();

  const resumeData = JSON.parse(localStorage.getItem('resumeData') || '{}');
  const hasResume = resumeData.name;

  const handleTailor = async () => {
    if (!jd.trim()) return alert('Please paste a Job Description first!');
    if (!hasResume) return alert('Please build your resume first!');
    setLoading(true);
    try {
      const result = await tailorResume(resumeData, jd);
      const merged = { ...resumeData, ...result };
      setTailored(merged);
      localStorage.setItem('tailoredResume', JSON.stringify(merged));
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  const downloadTailored = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    const canvas = await html2canvas(document.getElementById('resume-template'), { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${tailored.name || 'tailored'}-resume.pdf`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>🎯 JD Tailor</h2>
      <p style={{ color: '#888', marginBottom: '28px' }}>Paste any job description and AI will rewrite your resume to match</p>

      {!hasResume && (
        <div style={{ background: '#2a1a1a', border: '1px solid #553333', borderRadius: '10px', padding: '16px', marginBottom: '24px', color: '#ff8888' }}>
          ⚠️ No resume found. <span style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/builder')}>Build your resume first →</span>
        </div>
      )}

      <textarea
        style={{
          width: '100%', minHeight: '200px', padding: '16px', background: '#1a1a1a',
          border: '1px solid #333', borderRadius: '10px', color: '#fff',
          fontSize: '14px', resize: 'vertical', outline: 'none', lineHeight: '1.6'
        }}
        placeholder="Paste the full Job Description here..."
        value={jd}
        onChange={e => setJd(e.target.value)}
      />

      <button className="btn-primary" onClick={handleTailor} disabled={loading}
        style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}>
        {loading ? '⏳ AI is tailoring your resume...' : '🤖 Tailor My Resume with AI'}
      </button>

      {tailored && (
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#8b5cf6', fontSize: '18px' }}>✅ Tailored Resume Ready!</h3>
            <button className="btn-primary" onClick={downloadTailored}>⬇️ Download PDF</button>
          </div>
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left' }}>
            <ResumeTemplate data={tailored} />
          </div>
        </div>
      )}
    </div>
  );
};

export default JDInput;