import React, { useState, useEffect } from 'react';
import { JobseekerSidebar } from './Dashboard';
import { getMyApplications } from '../../api/applications';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyApplications();
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="dashboard-layout">
      <JobseekerSidebar />
      <main className="dashboard-content">
        <h1>My Job Applications</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Track the status of roles you have applied for. Under review and shortlisted candidates will receive updates below.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <h2>Loading your application history...</h2>
        ) : applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h3>You haven't applied to any jobs yet.</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Discover inclusive roles tailored to your accessibility needs now.
            </p>
            <a href="/jobseeker/available-jobs" className="btn btn-primary" style={{ color: 'var(--bg)' }}>
              Browse Available Jobs
            </a>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>
                          {app.jobId ? app.jobId.title : 'Deleted Position'}
                        </strong>
                        {app.jobId?.workType && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.75rem', 
                            backgroundColor: 'var(--border)', 
                            padding: '0.2rem 0.4rem', 
                            borderRadius: '4px',
                            textTransform: 'capitalize' 
                          }}>
                            {app.jobId.workType}
                          </span>
                        )}
                      </td>
                      <td>{app.jobId ? app.jobId.company : 'N/A'}</td>
                      <td>📍 {app.jobId ? app.jobId.location : 'N/A'}</td>
                      <td>📅 {formatDate(app.appliedAt)}</td>
                      <td>
                        <span className={`badge badge-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyApplications;
