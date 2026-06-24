import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Builder from './pages/Builder';
import Tailor from './pages/Tailor';
import Preview from './pages/Preview';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/tailor" element={<Tailor />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </Router>
  );
}

export default App;