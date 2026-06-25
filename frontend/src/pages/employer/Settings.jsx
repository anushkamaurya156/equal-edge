import React, { useState, useEffect } from 'react';
import { EmployerSidebar } from './Dashboard';

const Settings = () => {
  const [fontSize, setFontSize] = useState(
    parseInt(localStorage.getItem('fontSize')) || 16
  );
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'normal'
  );
  const [voicePitch, setVoicePitch] = useState(
    parseFloat(localStorage.getItem('voicePitch')) || 1.0
  );
  const [voiceRate, setVoiceRate] = useState(
    parseFloat(localStorage.getItem('voiceRate')) || 1.0
  );
  const [dyslexiaFont, setDyslexiaFont] = useState(
    localStorage.getItem('dyslexiaFont') === 'true'
  );

  // Apply changes when settings state changes
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (theme === 'normal') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('voicePitch', voicePitch);
  }, [voicePitch]);

  useEffect(() => {
    localStorage.setItem('voiceRate', voiceRate);
  }, [voiceRate]);

  useEffect(() => {
    if (dyslexiaFont) {
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }
    localStorage.setItem('dyslexiaFont', dyslexiaFont);
  }, [dyslexiaFont]);

  const handleReset = () => {
    setFontSize(16);
    setTheme('normal');
    setVoicePitch(1.0);
    setVoiceRate(1.0);
    setDyslexiaFont(false);
  };

  return (
    <div className="dashboard-layout">
      <EmployerSidebar />
      <main className="dashboard-content">
        <h1>Recruiter Settings & Interface Panel</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Adjust font sizing scales, color contrasts, or speech parameters to optimize accessibility.
        </p>

        <div className="card" style={{ maxWidth: '650px', gap: '2rem' }}>
          {/* Theme Section */}
          <div>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              Contrast & Color Themes
            </h2>
            <div className="form-group">
              <span className="form-label">Theme Mode</span>
              <div className="role-cards" style={{ flexWrap: 'wrap' }}>
                <div
                  className={`role-card ${theme === 'normal' ? 'active' : ''}`}
                  onClick={() => setTheme('normal')}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => { if (e.key === 'Enter') setTheme('normal'); }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>☀️</div>
                  <strong>Normal Mode</strong>
                </div>
                <div
                  className={`role-card ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => { if (e.key === 'Enter') setTheme('dark'); }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌙</div>
                  <strong>Dark Mode</strong>
                </div>
                <div
                  className={`role-card ${theme === 'high-contrast' ? 'active' : ''}`}
                  onClick={() => setTheme('high-contrast')}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => { if (e.key === 'Enter') setTheme('high-contrast'); }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👁️‍🗨️</div>
                  <strong>High Contrast</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              Typography & Readability
            </h2>
            
            <div className="slider-group">
              <label htmlFor="fontSizeSlider">
                <span>Font Size (Scaling)</span>
                <span>{fontSize}px</span>
              </label>
              <input
                id="fontSizeSlider"
                type="range"
                min="14"
                max="22"
                className="slider"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={dyslexiaFont}
                  onChange={(e) => setDyslexiaFont(e.target.checked)}
                />
                <span style={{ fontWeight: '600' }}>Enable Dyslexia-Friendly Font (Comic Sans/OpenDyslexic)</span>
              </label>
            </div>
          </div>

          {/* Speech synthesis */}
          <div>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              Screen Reader Sound Synthesis (TTS)
            </h2>
            
            <div className="slider-group">
              <label htmlFor="voiceRateSlider">
                <span>Reading Speed</span>
                <span>{voiceRate.toFixed(1)}x</span>
              </label>
              <input
                id="voiceRateSlider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                className="slider"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              />
            </div>

            <div className="slider-group" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="voicePitchSlider">
                <span>Voice Pitch</span>
                <span>{voicePitch.toFixed(1)}</span>
              </label>
              <input
                id="voicePitchSlider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                className="slider"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', borderTop: '2px solid var(--border)', paddingTop: '1.5rem' }}>
            <button
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
