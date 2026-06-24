import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 40px', background: '#111', borderBottom: '1px solid #222',
    position: 'sticky', top: 0, zIndex: 100
  };

  const logoStyle = {
    fontSize: '22px', fontWeight: '700',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#8b5cf6' : '#aaa',
    textDecoration: 'none', fontWeight: '500', fontSize: '15px',
    marginLeft: '28px', transition: 'color 0.2s'
  });

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={logoStyle}>ResumeAI</span>
      </Link>
      <div>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/builder" style={linkStyle('/builder')}>Build Resume</Link>
        <Link to="/tailor" style={linkStyle('/tailor')}>JD Tailor</Link>
      </div>
    </nav>
  );
};

export default Navbar;