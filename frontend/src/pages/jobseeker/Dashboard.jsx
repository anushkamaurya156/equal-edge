import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile } from '../../api/profile';
import { getMyApplications } from '../../api/applications';
import { matchJobs } from '../../api/ai';

const JobseekerSidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/jobseeker/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>📊 Dashboard</NavLink>
      <NavLink to="/jobseeker/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>👤 Profile</NavLink>
      <NavLink to="/jobseeker/available-jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>🔍 Available Jobs</NavLink>
      <NavLink to="/jobseeker/my-applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>📁 My Applications</NavLink>
      <NavLink to="/jobseeker/resume-checker" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>📝 Resume Checker</NavLink>
      <NavLink to="/jobseeker/government-schemes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>🏛️ Govt Schemes</NavLink>
      <NavLink to="/jobseeker/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>⚙️ Settings</NavLink>
    </aside>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [matchedJobsCount, setMatchedJobsCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let currentProfile = null;
        
        // 1. Fetch Profile
        try {
          const profileRes = await getMyProfile();
          if (profileRes.success && profileRes.profile) {
            currentProfile = profileRes.profile;
            setProfile(currentProfile);
            
            // Calculate Profile Completion %
            const fields = [
              'phone', 'city', 'state', 'disabilityType', 'disabilitySeverity',
              'assistiveTech', 'preferredWorkType', 'accommodationsNeeded',
              'headline', 'bio', 'skills', 'experienceLevel', 'education',
              'resumeUrl', 'disabilityCertificateUrl'
            ];
            let filledCount = 0;
            fields.forEach(field => {
              const val = currentProfile[field];
              if (val) {
                if (Array.isArray(val) && val.length > 0) filledCount++;
                else if (typeof val === 'string' && val.trim() !== '') filledCount++;
                else if (typeof val !== 'string' && val !== null) filledCount++;
              }
            });
            const percent = Math.round((filledCount / fields.length) * 100);
            setProfileCompletion(percent);
          }
        } catch (err) {
          console.warn("Profile not created yet.");
          setProfileCompletion(0);
        }

        // 2. Fetch Applications
        try {
          const appsRes = await getMyApplications();
          if (appsRes.success) {
            setApplicationsCount(appsRes.count);
          }
        } catch (err) {
          console.error(err);
        }

        // 3. Fetch matched jobs count
        if (currentProfile) {
          try {
            const matchRes = await matchJobs(currentProfile);
            if (matchRes.success) {
              // Count jobs with > 60% match
              const highMatches = matchRes.matches.filter(m => m.matchScore >= 60);
              setMatchedJobsCount(highMatches.length);
            }
          } catch (err) {
            console.error(err);
          }
        }
      } catch (err) {
        setError('Error loading dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-layout">
      <JobseekerSidebar />
      <main className="dashboard-content">
        <h1 style={{ marginBottom: '0.5rem' }}>Welcome, {user?.name || 'Job Seeker'}!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          This is your inclusive dashboard. Here you can track your applications, monitor profile completion, and view jobs that match your exact accommodation requirements.
        </p>

        {loading ? (
          <h2>Loading stats...</h2>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Applications Sent</h3>
                <div className="stat-value">{applicationsCount}</div>
                <Link to="/jobseeker/my-applications" style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block' }}>
                  View All Applications &rarr;
                </Link>
              </div>

              <div className="stat-card">
                <h3>AI Job Matches</h3>
                <div className="stat-value">{matchedJobsCount}</div>
                <Link to="/jobseeker/available-jobs" style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block' }}>
                  Browse Matching Jobs &rarr;
                </Link>
              </div>

              <div className="stat-card">
                <h3>Profile Completion</h3>
                <div className="stat-value">{profileCompletion}%</div>
                <div style={{ width: '100%', backgroundColor: 'var(--border)', height: '8px', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
                  <div style={{ width: `${profileCompletion}%`, backgroundColor: 'var(--primary)', height: '100%' }}></div>
                </div>
                <Link to="/jobseeker/profile" style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block' }}>
                  Update Profile Details &rarr;
                </Link>
              </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Next Steps to Boost Your Profile</h2>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                {profileCompletion < 50 && (
                  <li>⚠️ Complete your profile information to help our AI match jobs more accurately.</li>
                )}
                {!profile?.resumeUrl && (
                  <li>📄 Upload your resume so employers can download it directly when you apply.</li>
                )}
                {!profile?.disabilityCertificateUrl && (
                  <li>🪪 Upload your disability certificate to unlock inclusive job filters.</li>
                )}
                <li>🧠 Try the <strong>AI Resume Checker</strong> in the sidebar to review improvement suggestions.</li>
                <li>🏛️ Check out the <strong>Government Schemes</strong> tab to see financial aid opportunities matching your profile.</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
export { JobseekerSidebar };
