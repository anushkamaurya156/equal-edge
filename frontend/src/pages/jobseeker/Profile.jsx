import React, { useState, useEffect } from 'react';
import { JobseekerSidebar } from './Dashboard';
import { getMyProfile, createOrUpdateProfile, uploadResume, uploadCertificate } from '../../api/profile';

const Profile = () => {
  // Form state fields matching Profile schema
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [disabilityType, setDisabilityType] = useState('visual');
  const [disabilitySeverity, setDisabilitySeverity] = useState('mild');
  const [assistiveTech, setAssistiveTech] = useState([]);
  const [preferredWorkType, setPreferredWorkType] = useState('remote');
  const [accommodationsNeeded, setAccommodationsNeeded] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [education, setEducation] = useState('');
  
  // Work history is array of { company, role, duration }
  const [workHistory, setWorkHistory] = useState([]);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const [certifications, setCertifications] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [disabilityCertificateUrl, setDisabilityCertificateUrl] = useState('');

  // Status states
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resumeUploadMsg, setResumeUploadMsg] = useState('');
  const [certUploadMsg, setCertUploadMsg] = useState('');

  // Load existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        if (res.success && res.profile) {
          const p = res.profile;
          setPhone(p.phone || '');
          setCity(p.city || '');
          setState(p.state || '');
          setProfilePhoto(p.profilePhoto || '');
          setDisabilityType(p.disabilityType || 'visual');
          setDisabilitySeverity(p.disabilitySeverity || 'mild');
          setAssistiveTech(p.assistiveTech || []);
          setPreferredWorkType(p.preferredWorkType || 'remote');
          setAccommodationsNeeded(p.accommodationsNeeded || '');
          setHeadline(p.headline || '');
          setBio(p.bio || '');
          setSkills(p.skills ? p.skills.join(', ') : '');
          setExperienceLevel(p.experienceLevel || 'fresher');
          setEducation(p.education || '');
          setWorkHistory(p.workHistory || []);
          setCertifications(p.certifications ? p.certifications.join(', ') : '');
          setLinkedinUrl(p.linkedinUrl || '');
          setPortfolioUrl(p.portfolioUrl || '');
          setResumeUrl(p.resumeUrl || '');
          setDisabilityCertificateUrl(p.disabilityCertificateUrl || '');
        }
      } catch (err) {
        console.log("No profile created yet or network error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleTechChange = (tech) => {
    if (assistiveTech.includes(tech)) {
      setAssistiveTech(assistiveTech.filter(t => t !== tech));
    } else {
      setAssistiveTech([...assistiveTech, tech]);
    }
  };

  const handleAddWorkHistory = () => {
    if (!newCompany || !newRole || !newDuration) {
      alert('Please fill out all work history columns.');
      return;
    }
    setWorkHistory([...workHistory, { company: newCompany, role: newRole, duration: newDuration }]);
    setNewCompany('');
    setNewRole('');
    setNewDuration('');
  };

  const handleRemoveWorkHistory = (index) => {
    setWorkHistory(workHistory.filter((_, idx) => idx !== index));
  };

  // Upload handlers
  const handleResumeFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setResumeUploadMsg('Uploading resume...');
    try {
      const res = await uploadResume(formData);
      if (res.success) {
        setResumeUrl(res.fileUrl);
        setResumeUploadMsg('Resume uploaded successfully!');
      }
    } catch (err) {
      setResumeUploadMsg(`Upload failed: ${err.message}`);
    }
  };

  const handleCertFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('disabilityCertificate', file);

    setCertUploadMsg('Uploading certificate...');
    try {
      const res = await uploadCertificate(formData);
      if (res.success) {
        setDisabilityCertificateUrl(res.fileUrl);
        setCertUploadMsg('Certificate uploaded successfully!');
      }
    } catch (err) {
      setCertUploadMsg(`Upload failed: ${err.message}`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaveLoading(true);

    const profileData = {
      phone,
      city,
      state,
      profilePhoto,
      disabilityType,
      disabilitySeverity,
      assistiveTech,
      preferredWorkType,
      accommodationsNeeded,
      headline,
      bio,
      skills,
      experienceLevel,
      education,
      workHistory,
      certifications,
      linkedinUrl,
      portfolioUrl,
      resumeUrl,
      disabilityCertificateUrl
    };

    try {
      const res = await createOrUpdateProfile(profileData);
      if (res.success) {
        setSuccess('Profile updated successfully!');
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <JobseekerSidebar />
      <main className="dashboard-content">
        <h1>My Job Seeker Profile</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Fill in your accommodation requirements, technical skills, and background so employers can view matches.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <h2>Loading profile data...</h2>
        ) : (
          <form onSubmit={handleSave} className="card" style={{ gap: '1.5rem' }}>
            
            {/* Section: Headline & Bio */}
            <div>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Professional Headline & Bio
              </h2>
              <div className="form-group">
                <label className="form-label" htmlFor="headline">Headline</label>
                <input
                  type="text"
                  id="headline"
                  className="form-control"
                  placeholder="Enter your professional headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="bio">Professional Summary / Bio</label>
                <textarea
                  id="bio"
                  rows="4"
                  className="form-control"
                  placeholder="Describe your experience, achievements, vocational training, and goals"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            {/* Section: Disability & Accommodation info */}
            <div>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Disability & Accommodations Info
              </h2>
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="disabilityType">Primary Disability Type</label>
                  <select
                    id="disabilityType"
                    className="form-control"
                    value={disabilityType}
                    onChange={(e) => setDisabilityType(e.target.value)}
                  >
                    <option value="visual">Visual Impairment</option>
                    <option value="hearing">Hearing Impairment</option>
                    <option value="mobility">Mobility Impairment</option>
                    <option value="cognitive">Cognitive Impairment</option>
                    <option value="speech">Speech Impairment</option>
                    <option value="other">Other / Multiple</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="disabilitySeverity">Severity Level</label>
                  <select
                    id="disabilitySeverity"
                    className="form-control"
                    value={disabilitySeverity}
                    onChange={(e) => setDisabilitySeverity(e.target.value)}
                  >
                    <option value="mild">Mild (under 40%)</option>
                    <option value="moderate">Moderate (40% - 70%)</option>
                    <option value="severe">Severe (above 70%)</option>
                  </select>
                </div>
              </div>

              {/* Checklist Assistive Tech */}
              <div className="form-group">
                <span className="form-label">Assistive Technologies You Use</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[
                    { id: 'screen_reader', label: '👁️ Screen Reader (JAWS/NVDA/VoiceOver)' },
                    { id: 'braille', label: '⠃ Braille Display/Reader' },
                    { id: 'hearing_aid', label: '🦻 Hearing Aid / FM System' },
                    { id: 'wheelchair', label: '♿ Wheelchair / Mobility Aid' },
                    { id: 'other', label: '🛠️ Other Assistive Tools' }
                  ].map(tech => (
                    <label key={tech.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={assistiveTech.includes(tech.id)}
                        onChange={() => handleTechChange(tech.id)}
                      />
                      {tech.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="acac">Specific Workplace Accommodations Needed</label>
                <textarea
                  id="acac"
                  rows="3"
                  className="form-control"
                  placeholder="Describe any accommodations you need (e.g. ergonomic desk, sign language interpreter, screen reader compatibility)"
                  value={accommodationsNeeded}
                  onChange={(e) => setAccommodationsNeeded(e.target.value)}
                />
              </div>
            </div>

            {/* Section: Professional Details */}
            <div>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Qualifications & Preferences
              </h2>
              <div className="grid grid-3" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prefWork">Preferred Work Type</label>
                  <select
                    id="prefWork"
                    className="form-control"
                    value={preferredWorkType}
                    onChange={(e) => setPreferredWorkType(e.target.value)}
                  >
                    <option value="remote">Fully Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="exp">Experience Level</label>
                  <select
                    id="exp"
                    className="form-control"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="fresher">Fresher</option>
                    <option value="junior">Junior (1-3 yrs)</option>
                    <option value="mid">Mid-level (3-5 yrs)</option>
                    <option value="senior">Senior (5+ yrs)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="skills">Skills (comma-separated)</label>
                  <input
                    type="text"
                    id="skills"
                    className="form-control"
                    placeholder="Enter skills separated by commas (e.g. React, JavaScript, HTML)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edu">Highest Education Details</label>
                  <input
                    type="text"
                    id="edu"
                    className="form-control"
                    placeholder="Enter your highest qualification and year"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="certs">Certifications (comma-separated)</label>
                  <input
                    type="text"
                    id="certs"
                    className="form-control"
                    placeholder="Enter certifications separated by commas"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section: Work History */}
            <div>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Work History (Previous Employment)
              </h2>
              {workHistory.length > 0 ? (
                <div className="table-container" style={{ marginBottom: '1rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Duration</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workHistory.map((w, idx) => (
                        <tr key={idx}>
                          <td>{w.company}</td>
                          <td>{w.role}</td>
                          <td>{w.duration}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkHistory(idx)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.2rem 0.5rem' }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>No previous work history added yet.</p>
              )}

              <div className="grid grid-3" style={{ gap: '1rem', alignItems: 'end', backgroundColor: 'var(--border)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="whc">Company Name</label>
                  <input
                    type="text"
                    id="whc"
                    className="form-control"
                    placeholder="Enter company name"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="whr">Role / Designation</label>
                  <input
                    type="text"
                    id="whr"
                    className="form-control"
                    placeholder="Enter your job title or designation"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="whd">Duration</label>
                  <input
                    type="text"
                    id="whd"
                    className="form-control"
                    placeholder="Enter duration (e.g. Jan 2022 - Aug 2023)"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddWorkHistory}
                style={{ marginTop: '0.75rem' }}
              >
                + Add Work History Row
              </button>
            </div>

            {/* Section: File Uploads & Contact Details */}
            <div>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Documents & Links
              </h2>
              
              <div className="grid grid-3" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    className="form-control"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    className="form-control"
                    placeholder="Enter your city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    className="form-control"
                    placeholder="Enter your state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="linkedin">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    id="linkedin"
                    className="form-control"
                    placeholder="Enter your LinkedIn profile URL"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="portfolio">Portfolio Website URL</label>
                  <input
                    type="url"
                    id="portfolio"
                    className="form-control"
                    placeholder="Enter your portfolio or website URL"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Upload fields */}
              <div className="grid grid-2" style={{ gap: '1.5rem', marginTop: '1rem' }}>
                <div className="card" style={{ padding: '1rem', border: '1px dashed var(--primary)' }}>
                  <h4>Upload Resume (PDF, DOC)</h4>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeFileChange}
                    style={{ margin: '0.75rem 0' }}
                  />
                  {resumeUploadMsg && <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>{resumeUploadMsg}</p>}
                  {resumeUrl && (
                    <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
                      Current: <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
                    </p>
                  )}
                </div>

                <div className="card" style={{ padding: '1rem', border: '1px dashed var(--primary)' }}>
                  <h4>Upload Disability Certificate</h4>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleCertFileChange}
                    style={{ margin: '0.75rem 0' }}
                  />
                  {certUploadMsg && <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>{certUploadMsg}</p>}
                  {disabilityCertificateUrl && (
                    <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
                      Current: <a href={disabilityCertificateUrl} target="_blank" rel="noopener noreferrer">View Certificate</a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', color: 'var(--bg)' }}
              disabled={saveLoading}
            >
              {saveLoading ? 'Saving Profile Changes...' : 'Save Profile Details'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Profile;
