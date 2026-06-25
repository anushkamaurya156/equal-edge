import React, { useState } from 'react';
import { JobseekerSidebar } from './Dashboard';
import { checkResume } from '../../api/ai';

const ResumeChecker = () => {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setSuggestions([]);

    if (!resumeText.trim()) {
      setError('Please paste your resume text to analyze.');
      return;
    }

    setLoading(true);
    try {
      const res = await checkResume(resumeText);
      if (res.success && res.improvements) {
        setSuggestions(res.improvements);
      } else {
        setError('No suggestions returned. Try modifying the text and analyzing again.');
      }
    } catch (err) {
      setError(err.message || 'AI resume checking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <JobseekerSidebar />
      <main className="dashboard-content">
        <h1>AI Resume Checker & Auditor</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Paste your resume text below. Our AI Auditor evaluates formatting, accessibility structure, visual readability, and highlights accommodation terms to match employer expectations.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="grid grid-2" style={{ gap: '2rem' }}>
          {/* Input Panel */}
          <div className="card">
            <h2>Paste Resume Text</h2>
            <form onSubmit={handleAnalyze}>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="14"
                  placeholder="Paste your professional summary, skills, education, and work experience lists here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', color: 'var(--bg)' }}
                disabled={loading}
              >
                {loading ? '🤖 Analyzing Resume...' : 'Analyze with AI'}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h2>AI Optimization Suggestions</h2>
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>🤖</div>
                <h3 style={{ marginTop: '1rem' }}>Parsing resume structure...</h3>
                <p style={{ color: 'var(--text-muted)' }}>Evaluating accessibility markup and section layout</p>
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                <p>Submit your resume text on the left to see recommendations here.</p>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div>
                <p style={{ fontWeight: 'bold', color: 'var(--success)', marginBottom: '1rem' }}>
                  ✓ Analysis complete. Here are {suggestions.length} changes you can make:
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.25rem' }}>
                  {suggestions.map((suggestion, idx) => (
                    <li key={idx} style={{ lineHeight: '1.5' }}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(79, 70, 229, 0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  💡 <strong>Tip:</strong> Incorporating these suggestions increases your match ratings on सक्षम Hire by up to 20%!
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeChecker;
