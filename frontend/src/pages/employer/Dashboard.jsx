import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployerJobs } from '../../api/jobs';
import { getJobApplications } from '../../api/applications';

const EmployerSidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/employer/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>📊 Dashboard</NavLink>
      <NavLink to="/employer/post-job" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>➕ Post Job</NavLink>
      <NavLink to="/employer/applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>📂 Job Applications</NavLink>
      <NavLink to="/employer/ai-matching" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>🤖 AI Matching</NavLink>
      <NavLink to="/employer/resources" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>📚 Resources</NavLink>
      <NavLink to="/employer/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>⚙️ Settings</NavLink>
    </aside>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [jobsCount, setJobsCount] = useState(0);
  const [totalAppsCount, setTotalAppsCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    const fetchEmployerStats = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch Employer Jobs
        const jobsRes = await getEmployerJobs();
        if (jobsRes.success) {
          const jobsList = jobsRes.jobs;
          setJobsCount(jobsList.length);
          setRecentJobs(jobsList.slice(0, 5));

          // 2. Fetch applications count and shortlist count across all jobs
          let totalApps = 0;
          let shortlisted = 0;

          await Promise.all(
            jobsList.map(async (job) => {
              try {
                const appsRes = await getJobApplications(job._id);
                if (appsRes.success) {
                  totalApps += appsRes.count;
                  shortlisted += appsRes.applications.filter(app => app.status === 'shortlisted').length;
                }
              } catch (appErr) {
                console.error(`Failed to load applications for job ${job._id}`, appErr);
              }
            })
          );

          setTotalAppsCount(totalApps);
          setShortlistedCount(shortlisted);
        }
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerStats();
  }, []);

  return (
    <div className="dashboard-layout">
      <EmployerSidebar />
      <main className="dashboard-content">
        <h1 style={{ marginBottom: '0.5rem' }}>Employer Dashboard &mdash; {user?.name || 'Recruiter'}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Overview of your active listings, applications pipelines, and candidate matches.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <h2>Loading stats...</h2>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Jobs Posted</h3>
                <div className="stat-value">{jobsCount}</div>
                <Link to="/employer/post-job" style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block' }}>
                  Post a New Job &rarr;
                </Link>
              </div>

              <div className="stat-card">
                <h3>Total Applications</h3>
                <div className="stat-value">{totalAppsCount}</div>
                <Link to="/employer/applications" style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block' }}>
                  Review Applications &rarr;
                </Link>
              </div>

              <div className="stat-card">
                <h3>Shortlisted</h3>
                <div className="stat-value">{shortlistedCount}</div>
                <Link to="/employer/applications" style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block' }}>
                  View Candidate Pipeline &rarr;
                </Link>
              </div>
            </div>

            {/* Recent Job Listings */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Recent Job Postings</h2>
              {recentJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ color: 'var(--text-muted)' }}>You haven't posted any jobs yet.</p>
                  <Link to="/employer/post-job" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', color: 'var(--bg)' }}>
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="table-container" style={{ border: 'none', margin: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Location</th>
                        <th>Work Type</th>
                        <th>Status</th>
                        <th>Posted Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map(job => (
                        <tr key={job._id}>
                          <td>
                            <strong style={{ color: 'var(--primary)' }}>{job.title}</strong>
                          </td>
                          <td>📍 {job.location}</td>
                          <td style={{ textTransform: 'capitalize' }}>{job.workType}</td>
                          <td>
                            <span style={{ 
                              fontSize: '0.8rem', 
                              backgroundColor: job.isActive ? '#d1fae5' : '#fee2e2', 
                              color: job.isActive ? '#065f46' : '#991b1b', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>
                              {job.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
export { EmployerSidebar };
