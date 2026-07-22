import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployerSidebar } from './Dashboard';
import { createJob } from '../../api/jobs';

const PostJob = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('remote');
  const [jobType, setJobType] = useState('full-time');

  // Accessibility Checkboxes
  const [wheelchair, setWheelchair] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [flexible, setFlexible] = useState(false);
  const [signLanguage, setSignLanguage] = useState(false);
  const [wfh, setWfh] = useState(false);
  const [assistive, setAssistive] = useState(false);
  const [otherAccommodations, setOtherAccommodations] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic Validation
    if (!title || !company || !description || !location) {
      setError('Please fill in all required fields (Title, Company, Description, Location).');
      return;
    }

    setLoading(true);

    const jobData = {
      title,
      company,
      description,
      responsibilities,
      requirements,
      skillsRequired: skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      currency,
      location,
      workType,
      jobType,
      accessibilityFeatures: {
        wheelchairAccessible: wheelchair,
        screenReaderCompatible: screenReader,
        flexibleHours: flexible,
        signLanguageSupport: signLanguage,
        workFromHome: wfh,
        assistiveTechProvided: assistive,
        otherAccommodations
      }
    };

    try {
      const res = await createJob(jobData);
      if (res.success) {
        setSuccess('Job posting created successfully!');
        window.scrollTo(0, 0);
        setTimeout(() => {
          navigate('/employer/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <EmployerSidebar />
      <main className="dashboard-content">
        <h1>Post a New Job Opening</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Create an inclusive job listing. Be sure to specify the accessibility details and accommodations you provide.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="card" style={{ gap: '1.5rem' }}>
          {/* Basic Job Details */}
          <div>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              Basic Information
            </h2>
            
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  placeholder="Enter job title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="company">Company Name *</label>
                <input
                  type="text"
                  id="company"
                  className="form-control"
                  placeholder="Enter company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="grid grid-3" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="location">Location / City *</label>
                <input
                  type="text"
                  id="location"
                  className="form-control"
                  placeholder="Enter city, state or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="workType">Work Arrangement</label>
                <select
                  id="workType"
                  className="form-control"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="jobType">Job Type</label>
                <select
                  id="jobType"
                  className="form-control"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description & Requirements */}
          <div>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              Description & Requirements
            </h2>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Job Description *</label>
              <textarea
                id="description"
                rows="5"
                className="form-control"
                placeholder="Describe the role, its goals, and the impact this person will have"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="responsibilities">Responsibilities</label>
              <textarea
                id="responsibilities"
                rows="3"
                className="form-control"
                placeholder="List the day-to-day responsibilities"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                rows="3"
                className="form-control"
                placeholder="List required qualifications and certifications"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="skills">Required Skills (comma-separated)</label>
              <input
                type="text"
                id="skills"
                className="form-control"
                placeholder="Enter required skills separated by commas"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
              />
            </div>
          </div>

          {/* Salary details */}
          <div>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              Salary Details
            </h2>

            <div className="grid grid-3" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="salMin">Minimum Salary (Annual)</label>
                <input
                  type="number"
                  id="salMin"
                  className="form-control"
                  placeholder="Enter minimum annual salary"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="salMax">Maximum Salary (Annual)</label>
                <input
                  type="number"
                  id="salMax"
                  className="form-control"
                  placeholder="Enter maximum annual salary"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  className="form-control"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility features checklist */}
          <div>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              Accessibility Features & Accommodations Provided
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={wheelchair}
                  onChange={(e) => setWheelchair(e.target.checked)}
                />
                ♿ Wheelchair Accessible Infrastructure
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={screenReader}
                  onChange={(e) => setScreenReader(e.target.checked)}
                />
                👁️ Screen Reader Compatible software
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={flexible}
                  onChange={(e) => setFlexible(e.target.checked)}
                />
                ⏰ Flexible Working Hours
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={signLanguage}
                  onChange={(e) => setSignLanguage(e.target.checked)}
                />
                🤟 Sign Language Support / Captions
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={wfh}
                  onChange={(e) => setWfh(e.target.checked)}
                />
                🏠 Full Work From Home (WFH) Option
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={assistive}
                  onChange={(e) => setAssistive(e.target.checked)}
                />
                💻 Assistive Technologies Provided by company
              </label>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="otherAccom">Other Accessibility Details</label>
              <textarea
                id="otherAccom"
                rows="2"
                className="form-control"
                placeholder="Describe other accessibility support or equipment provided"
                value={otherAccommodations}
                onChange={(e) => setOtherAccommodations(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', color: 'var(--bg)' }}
            disabled={loading}
          >
            {loading ? 'Creating Job Posting...' : 'Publish Job Posting'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default PostJob;
