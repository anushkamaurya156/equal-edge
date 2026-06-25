import React, { useState, useEffect } from 'react';
import { JobseekerSidebar } from './Dashboard';
import { getMyProfile } from '../../api/profile';
import { matchSchemes } from '../../api/ai';

const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        setError('');

        let currentProfile = null;
        try {
          const profileRes = await getMyProfile();
          if (profileRes.success && profileRes.profile) {
            currentProfile = profileRes.profile;
            setProfile(currentProfile);
          }
        } catch (err) {
          console.warn("User has no profile yet");
        }

        // Fetch schemes matched to profile (or returns default list of schemes if profile is null or fails)
        // If profile doesn't exist, we send a dummy profile structure to backend to trigger the default list
        const payloadProfile = currentProfile || { disabilityType: 'visual', experienceLevel: 'fresher' };
        
        const schemesRes = await matchSchemes(payloadProfile);
        if (schemesRes.success) {
          setSchemes(schemesRes.schemes);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch government schemes.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  return (
    <div className="dashboard-layout">
      <JobseekerSidebar />
      <main className="dashboard-content">
        <h1>Indian Government Disability & Skill Schemes</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Browse central financial assistance, concession loan schemes, and skill-development workshops curated for differently-abled citizens.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {!profile && !loading && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            ⚠️ <strong>Standard Recommendations:</strong> Complete your seeker profile in the profile page to get AI matched schemes tailored to your specific disability and experience level!
          </div>
        )}

        {loading ? (
          <h2>Curating government scheme recommendations...</h2>
        ) : (
          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            {schemes.map((scheme) => (
              <div 
                key={scheme.id} 
                className="card" 
                style={{ 
                  justifyContent: 'space-between',
                  borderLeft: '4px solid var(--primary)' 
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                    🏛️ {scheme.name}
                  </h3>
                  
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {scheme.description}
                  </p>

                  <div 
                    style={{ 
                      backgroundColor: 'var(--bg)', 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius)', 
                      border: '1px solid var(--border)', 
                      fontSize: '0.9rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <strong>Eligibility:</strong> {scheme.eligibility}
                  </div>
                </div>

                <a 
                  href={scheme.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    alignSelf: 'flex-start', 
                    marginTop: '1rem',
                    textDecoration: 'none'
                  }}
                >
                  Visit Official Portal &rarr;
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GovernmentSchemes;
