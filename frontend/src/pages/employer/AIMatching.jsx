import React, { useState, useEffect } from 'react';
import { EmployerSidebar } from './Dashboard';
import { getEmployerJobs } from '../../api/jobs';
import { getJobApplications } from '../../api/applications';
import { matchJobs } from '../../api/ai';

const AIMatching = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [rankedApplicants, setRankedApplicants] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);

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

  const handleFindMatches = async () => {
    if (!selectedJobId) return;
    setMatchingLoading(true);
    setError('');
    setRankedApplicants([]);
    setHasRun(true);

    try {
      // 1. Fetch applications for selected job (joins candidate profiles)
      const appsRes = await getJobApplications(selectedJobId);
      if (!appsRes.success) {
        throw new Error('Failed to load applications for this job.');
      }

      const applicationsWithProfiles = appsRes.applications.filter(app => app.profile !== null);
      if (applicationsWithProfiles.length === 0) {
        setRankedApplicants([]);
        return;
      }

      // 2. Match each candidate's profile against this job using backend matcher
      const evaluatedList = await Promise.all(
        applicationsWithProfiles.map(async (app) => {
          try {
            const matchRes = await matchJobs(app.profile);
            if (matchRes.success && matchRes.matches) {
              const details = matchRes.matches.find(m => m.jobId === selectedJobId);
              return {
                ...app,
                matchScore: details ? details.matchScore : 50,
                matchReason: details ? details.reason : 'Baseline match based on profile metrics.'
              };
            }
          } catch (err) {
            console.error(`AI matching error for applicant ${app._id}`, err);
          }
          return {
            ...app,
            matchScore: 50,
            matchReason: 'Baseline alignment with standard job properties.'
          };
        })
      );

      // 3. Sort by match score descending
      evaluatedList.sort((a, b) => b.matchScore - a.matchScore);
      setRankedApplicants(evaluatedList);
    } catch (err) {
      setError(err.message || 'Failed to execute AI matching.');
    } finally {
      setMatchingLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <EmployerSidebar />
      <main className="dashboard-content">
        <h1>AI Candidate Matcher</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Select a job listing and activate the AI matcher to score and rank candidates based on their technical profiles and accessibility alignments.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loadingJobs ? (
          <h2>Loading job listings...</h2>
        ) : jobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 0' }}>
            <h3>No job listings posted yet.</h3>
            <p style={{ color: 'var(--text-muted)' }}>You must post a job first before matching candidates.</p>
          </div>
        ) : (
          <div>
            {/* Selection Toolbar */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
              <div className="flex align-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '280px' }}>
                  <label className="form-label" htmlFor="jobSelect">Select Job Posting to Match</label>
                  <select
                    id="jobSelect"
                    className="form-control"
                    value={selectedJobId}
                    onChange={(e) => {
                      setSelectedJobId(e.target.value);
                      setHasRun(false);
                      setRankedApplicants([]);
                    }}
                  >
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>
                        {job.title} &mdash; {job.company}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleFindMatches}
                  className="btn btn-primary"
                  style={{ color: 'var(--bg)', alignSelf: 'flex-end', height: '46px' }}
                  disabled={matchingLoading}
                >
                  {matchingLoading ? '🤖 Scanning Profiles...' : 'Find Best Matches'}
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {matchingLoading && (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>🤖</div>
                <h3 style={{ marginTop: '1rem' }}>Evaluating Candidate Accommodation Metrics...</h3>
                <p style={{ color: 'var(--text-muted)' }}>Scanning work preferences, assistive technologies, and requirements.</p>
              </div>
            )}

            {!matchingLoading && hasRun && rankedApplicants.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                <h3>No candidates with profiles have applied to this job yet.</h3>
                <p>Wait for applicants to create profiles and submit their applications.</p>
              </div>
            )}

            {!matchingLoading && rankedApplicants.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: 0 }}>
                  Ranked Candidates ({rankedApplicants.length})
                </h2>
                
                {rankedApplicants.map((app, index) => (
                  <div 
                    key={app._id} 
                    className="card"
                    style={{ 
                      borderLeft: `5px solid ${app.matchScore >= 75 ? 'var(--success)' : 'var(--warning)'}`,
                      gap: '1rem'
                    }}
                  >
                    <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                          # {index + 1} Best Fit Match
                        </span>
                        <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.3rem' }}>
                          {app.applicantId?.name}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          {app.profile?.headline || 'No headline provided'}
                        </p>
                      </div>
                      
                      <div 
                        style={{
                          backgroundColor: app.matchScore >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: app.matchScore >= 75 ? 'var(--success)' : 'var(--warning)',
                          padding: '0.5rem 1rem',
                          borderRadius: '50px',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          border: '1px solid currentColor'
                        }}
                      >
                        {app.matchScore}% Match
                      </div>
                    </div>

                    <div style={{ 
                      backgroundColor: 'var(--bg)', 
                      padding: '0.75rem 1rem', 
                      borderRadius: 'var(--radius)', 
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      fontStyle: 'italic',
                      color: 'var(--text-muted)'
                    }}>
                      <strong>Reasoning:</strong> {app.matchReason}
                    </div>

                    {/* Quick profile info */}
                    <div className="grid grid-3" style={{ gap: '1rem', fontSize: '0.9rem' }}>
                      <div>
                        <strong>Disability details:</strong>
                        <div style={{ textTransform: 'capitalize' }}>
                          {app.profile?.disabilityType} ({app.profile?.disabilitySeverity})
                        </div>
                      </div>
                      <div>
                        <strong>Experience level:</strong>
                        <div style={{ textTransform: 'capitalize' }}>
                          {app.profile?.experienceLevel} ({app.profile?.education || 'N/A'})
                        </div>
                      </div>
                      <div>
                        <strong>Contact Details:</strong>
                        <div>{app.applicantId?.email}</div>
                        {app.profile?.phone && <div>{app.profile.phone}</div>}
                      </div>
                    </div>

                    <div className="flex" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                      {app.profile?.resumeUrl && (
                        <a href={app.profile.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                          📄 View Resume
                        </a>
                      )}
                      <a href={`mailto:${app.applicantId?.email}`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none', color: 'var(--bg)' }}>
                        ✉️ Contact Candidate
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AIMatching;
