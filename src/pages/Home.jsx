import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '52px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px' }}>
        Build Your Resume<br />
        <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Tailored by AI
        </span>
      </h1>
      <p style={{ color: '#aaa', fontSize: '18px', maxWidth: '500px', marginBottom: '40px', lineHeight: 1.7 }}>
        Create a professional resume in minutes. Paste any Job Description and our AI rewrites your resume to match perfectly.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={() => navigate('/builder')}>
          🚀 Build My Resume
        </button>
        <button className="btn-secondary" onClick={() => navigate('/tailor')}>
          🎯 Tailor to JD
        </button>
      </div>

      <div style={{ display: 'flex', gap: '32px', marginTop: '80px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '⚡', title: 'Fast Builder', desc: 'Fill form, get resume instantly' },
          { icon: '🤖', title: 'AI Powered', desc: 'Claude AI tailors to any JD' },
          { icon: '📄', title: 'PDF Export', desc: 'Download clean PDF resume' },
        ].map((f, i) => (
          <div key={i} style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: '12px', padding: '28px 24px', width: '200px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>{f.title}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;