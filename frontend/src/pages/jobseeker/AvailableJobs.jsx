import React, { useState, useEffect } from 'react';
import { JobseekerSidebar } from './Dashboard';
import JobCard from '../../components/JobCard';
import { getMyProfile } from '../../api/profile';
import { getAllJobs } from '../../api/jobs';
import { matchJobs } from '../../api/ai';
import { applyToJob, getMyApplications } from '../../api/applications';

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [matchedScores, setMatchedScores] = useState({}); // jobId -> { score, reason }
  const [appliedJobs, setAppliedJobs] = useState([]); // Array of jobIds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering states
  const [workType, setWorkType] = useState('');
  const [jobType, setJobType] = useState('');
  const [wheelchair, setWheelchair] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [flexible, setFlexible] = useState(false);
  const [signLanguage, setSignLanguage] = useState(false);
  const [wfh, setWfh] = useState(false);
  const [assistive, setAssistive] = useState(false);

  // Modal states
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  const fetchJobsAndProfile = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Get Seeker Applications (to check what is already applied)
      let appliedList = [];
      try {
        const appRes = await getMyApplications();
        if (appRes.success) {
          appliedList = appRes.applications.map(app => app.jobId._id);
          setAppliedJobs(appliedList);
        }
      } catch (err) {
        console.error("Failed to load applications state", err);
      }

      // 2. Fetch Profile
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

      // 3. Fetch all Jobs with active filters
      const filters = {
        workType,
        jobType,
        wheelchairAccessible: wheelchair ? 'true' : '',
        screenReaderCompatible: screenReader ? 'true' : '',
        flexibleHours: flexible ? 'true' : '',
        signLanguageSupport: signLanguage ? 'true' : '',
        workFromHome: wfh ? 'true' : '',
        assistiveTechProvided: assistive ? 'true' : ''
      };

      const jobsRes = await getAllJobs(filters);
      let jobList = [];
      if (jobsRes.success) {
        jobList = jobsRes.jobs;
      }

      // 4. Match Jobs if profile exists
      if (currentProfile && jobList.length > 0) {
        try {
          const matchRes = await matchJobs(currentProfile);
          if (matchRes.success && matchRes.matches) {
            const scoresMap = {};
            matchRes.matches.forEach(match => {
              scoresMap[match.jobId] = {
                score: match.matchScore,
                reason: match.reason
              };
            });
            setMatchedScores(scoresMap);

            // Sort jobs by match score
            jobList.sort((a, b) => {
              const scoreA = scoresMap[a._id]?.score || 0;
              const scoreB = scoresMap[b._id]?.score || 0;
              return scoreB - scoreA;
            });
          }
        } catch (matchErr) {
          console.error("AI matching failed", matchErr);
        }
      }

      setJobs(jobList);
    } catch (err) {
      setError(err.message || 'Failed to fetch job opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndProfile();
  }, [workType, jobType, wheelchair, screenReader, flexible, signLanguage, wfh, assistive]);

  const handleOpenApplyModal = (job) => {
    setSelectedJob(job);
    setCoverLetter('');
    setApplyError('');
    setApplySuccess('');
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setApplyError('Please write a short cover letter.');
      return;
    }

    setApplyLoading(true);
    setApplyError('');
    try {
      const res = await applyToJob(selectedJob._id, coverLetter);
      if (res.success) {
        setApplySuccess('Application submitted successfully!');
        setAppliedJobs([...appliedJobs, selectedJob._id]);
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (err) {
      setApplyError(err.message || 'Application failed to submit.');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <JobseekerSidebar />
      <main className="dashboard-content">
        <h1>Available Jobs & Opportunities</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Explore accessible positions. If you complete your profile, the board automatically ranks postings by AI compatibility.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {!profile && !loading && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            ⚠️ <strong>Complete Your Profile:</strong> You haven't set up a seeker profile. 
            <a href="/jobseeker/profile" style={{ marginLeft: '0.5rem', textDecoration: 'underline', color: 'inherit' }}>
              Create your profile now
            </a> to view AI match scores and suitability analyses!
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Filter Board Listings</h2>
          
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="workType">Work Type</label>
              <select
                id="workType"
                className="form-control"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
              >
                <option value="">All Work Types</option>
                <option value="remote">Fully Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="jobType">Job Type</label>
              <select
                id="jobType"
                className="form-control"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Accessibility Feature Checkboxes */}
          <div>
            <span className="form-label">Accessibility Accommodations</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={wheelchair}
                  onChange={(e) => setWheelchair(e.target.checked)}
                />
                ♿ Wheelchair Accessible
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={screenReader}
                  onChange={(e) => setScreenReader(e.target.checked)}
                />
                👁️ Screen Reader Compatible
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={flexible}
                  onChange={(e) => setFlexible(e.target.checked)}
                />
                ⏰ Flexible Hours
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={signLanguage}
                  onChange={(e) => setSignLanguage(e.target.checked)}
                />
                🤟 Sign Language Support
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={wfh}
                  onChange={(e) => setWfh(e.target.checked)}
                />
                🏠 Work From Home
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={assistive}
                  onChange={(e) => setAssistive(e.target.checked)}
                />
                💻 Assistive Tech Provided
              </label>
            </div>
          </div>
        </div>

        {/* Listings */}
        {loading ? (
          <h2>Loading available listings...</h2>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3>No jobs found matching your filters.</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try turning off some filters to browse more listings.</p>
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            {jobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                matchScore={matchedScores[job._id]?.score}
                matchReason={matchedScores[job._id]?.reason}
                isApplied={appliedJobs.includes(job._id)}
                onApply={handleOpenApplyModal}
              />
            ))}
          </div>
        )}

        {/* Apply Modal popup */}
        {selectedJob && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Apply to {selectedJob.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                at <strong>{selectedJob.company}</strong>
              </p>

              {applyError && <div className="alert alert-danger">{applyError}</div>}
              {applySuccess && <div className="alert alert-success">{applySuccess}</div>}

              <form onSubmit={handleApplySubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="coverLetter">Cover Letter / Accommodation Request</label>
                  <textarea
                    id="coverLetter"
                    className="form-control"
                    rows="6"
                    placeholder="Describe why you are qualified, what assistive tech setup you use, and any special accommodations you will need for the interview process..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>

                <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={applyLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ color: 'var(--bg)' }}
                    disabled={applyLoading}
                  >
                    {applyLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AvailableJobs;
