import React, { useState, useEffect } from 'react';
import { EmployerSidebar } from './Dashboard';
import { getEmployerJobs } from '../../api/jobs';
import { getJobApplications, updateApplicationStatus } from '../../api/applications';

const JobApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected cover letter view state
  const [activeCoverLetter, setActiveCoverLetter] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await getEmployerJobs();
        if (res.success) {
          setJobs(res.jobs);
          if (res.jobs.length > 0) {
            setSelectedJobId(res.jobs[0]._id);
          }
        }
      } catch (err) {
        setError('Failed to fetch job postings.');
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    const fetchApplications = async () => {
      try {
        setLoadingApps(true);
        setError('');
        setSuccess('');
        const res = await getJobApplications(selectedJobId);
        if (res.success) {
          setApplications(res.applications);
        }
      } catch (err) {
        setError('Failed to load applications for this job.');
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApplications();
  }, [selectedJobId]);

  const handleStatusChange = async (appId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      const res = await updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setSuccess('Application status updated successfully!');
        
        // Update local state
        setApplications(applications.map(app => 
          app._id === appId ? { ...app, status: res.application.status } : app
        ));
      }
    } catch (err) {
      setError(err.message || 'Failed to update application status.');
    }
  };

  return (
    <div className="dashboard-layout">
      <EmployerSidebar />
      <main className="dashboard-content">
        <h1>Manage Job Applications</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Select a job listing below to review candidate portfolios, download documents, and update review pipeline statuses.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loadingJobs ? (
          <h2>Loading job listings...</h2>
        ) : jobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 0' }}>
            <h3>No job listings posted yet.</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You must post a job before you can review candidate applications.</p>
            <a href="/employer/post-job" className="btn btn-primary" style={{ color: 'var(--bg)', display: 'inline-block' }}>
              Post a Job Now
            </a>
          </div>
        ) : (
          <div>
            {/* Selector Dropdown */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="jobSelector">Active Job Posting Selector</label>
                <select
                  id="jobSelector"
                  className="form-control"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  style={{ fontWeight: '600' }}
                >
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>
                      {job.title} &mdash; {job.location} ({job.workType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Applications List */}
            {loadingApps ? (
              <h2>Retrieving candidate pipeline...</h2>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: 'var(--card)', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                <h3>No applications received yet for this position.</h3>
                <p style={{ color: 'var(--text-muted)' }}>We'll notify you as soon as candidates apply.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', margin: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Candidate Name</th>
                        <th>Disability Details</th>
                        <th>Accommodations Requested</th>
                        <th>Documents</th>
                        <th>Pipeline Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <strong>{app.applicantId?.name || 'Candidate'}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {app.applicantId?.email || 'N/A'}
                            </div>
                            {app.profile?.phone && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Tel: {app.profile.phone}
                              </div>
                            )}
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {app.profile?.disabilityType ? (
                              <span>
                                {app.profile.disabilityType} ({app.profile.disabilitySeverity || 'mild'})
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No profile details</span>
                            )}
                          </td>
                          <td>
                            {app.profile?.accommodationsNeeded ? (
                              <div style={{ fontSize: '0.875rem', maxHeight: '60px', overflowY: 'auto' }}>
                                {app.profile.accommodationsNeeded}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No special accommodation</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                              {app.profile?.resumeUrl ? (
                                <a href={app.profile.resumeUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                                  📄 Download Resume
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>No Resume</span>
                              )}
                              {app.profile?.disabilityCertificateUrl ? (
                                <a href={app.profile.disabilityCertificateUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                                  🪪 Download Certificate
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>No Certificate</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <select
                              className="form-control"
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              style={{ 
                                padding: '0.4rem', 
                                fontSize: '0.875rem',
                                border: '1px solid var(--border)',
                                width: '130px'
                              }}
                            >
                              <option value="applied">Applied</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setActiveCoverLetter(app.coverLetter)}
                            >
                              Cover Letter
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cover Letter Modal popup */}
        {activeCoverLetter && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '550px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Candidate Cover Letter</h2>
              <div 
                style={{ 
                  backgroundColor: 'var(--card)', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius)', 
                  border: '1px solid var(--border)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                {activeCoverLetter}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setActiveCoverLetter('')}
                  className="btn btn-primary"
                  style={{ color: 'var(--bg)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobApplications;
export { JobApplications as JobApplicationsComponent };
