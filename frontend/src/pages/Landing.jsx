import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{ flex: 1 }}>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.2 }}>
            Because Everyone Deserves Opportunity.
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem' }}>
            सक्षम Hire (Saksham Hire) connects highly capable, differently-abled professionals with inclusive employers offering remote, hybrid, and fully accessible careers.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', color: 'var(--bg)' }}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ padding: '4rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.25rem' }}>
          Empowering Features for Accessible Hiring
        </h2>
        <div className="grid grid-2" style={{ gap: '2rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🤖 AI Smart Job Matcher
            </h3>
            <p style={{ margin: 0 }}>
              Our custom AI compares your unique accessibility needs (assistive technologies, preferred work setups, accommodations) and matches you with jobs that offer those environments.
            </p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📄 AI Resume Reviewer
            </h3>
            <p style={{ margin: 0 }}>
              Upload or paste your resume and get immediate, actionable optimization feedback. Tailor details to highlight your assistive tools and structural clarity for screen readers.
            </p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔊 Integrated Screen Reader
            </h3>
            <p style={{ margin: 0 }}>
              Browse listings stress-free using our floating screen reader widget. Listen to any page instantly with adjustable voice pitch and speeds to match your preferences.
            </p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🇮🇳 Govt Scheme Matching
            </h3>
            <p style={{ margin: 0 }}>
              Input your details to find compatible Indian government schemes. Gain vocational training, financial assistance, and aids recommendations automatically.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ backgroundColor: 'var(--card)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)', padding: '5rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3.5rem', fontSize: '2.25rem' }}>
            How सक्षम Hire Works
          </h2>
          <div className="grid grid-3" style={{ gap: '2.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                1
              </div>
              <h4>Create Account</h4>
              <p style={{ color: 'var(--text-muted)' }}>
                Register as a Job Seeker or Employer. Custom settings help match visual, hearing, cognitive, and mobility preferences instantly.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                2
              </div>
              <h4>Verify Profile / Post Jobs</h4>
              <p style={{ color: 'var(--text-muted)' }}>
                Job seekers build portfolios detailing accommodations, while employers post jobs tagging accessibility features like wheelchair ramps or sign language.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                3
              </div>
              <h4>AI Matching & Hiring</h4>
              <p style={{ color: 'var(--text-muted)' }}>
                Our algorithms score connections based on technical skills and structural alignment. Apply easily, review matching profiles, and build inclusive teams!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Ready to Start Your Inclusive Career Journey?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Join thousands of other jobseekers and forward-thinking companies pushing the frontier of workplace accessibility.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', color: 'var(--bg)' }}>
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export default Landing;
