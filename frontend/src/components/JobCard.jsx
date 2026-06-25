import React from 'react';

const JobCard = ({ job, matchScore, matchReason, onApply, isApplied }) => {
  const {
    title,
    company,
    location,
    workType,
    jobType,
    salaryMin,
    salaryMax,
    currency,
    accessibilityFeatures = {},
    description
  } = job;

  // Render accessibility badges
  const renderAccessibilityBadges = () => {
    const badges = [];
    if (accessibilityFeatures.wheelchairAccessible) {
      badges.push({ text: '♿ Wheelchair Accessible', key: 'wheelchair' });
    }
    if (accessibilityFeatures.screenReaderCompatible) {
      badges.push({ text: '👁️ Screen Reader Compatible', key: 'screen' });
    }
    if (accessibilityFeatures.flexibleHours) {
      badges.push({ text: '⏰ Flexible Hours', key: 'flexible' });
    }
    if (accessibilityFeatures.signLanguageSupport) {
      badges.push({ text: '🤟 Sign Language Support', key: 'sign' });
    }
    if (accessibilityFeatures.workFromHome) {
      badges.push({ text: '🏠 Work From Home', key: 'wfh' });
    }
    if (accessibilityFeatures.assistiveTechProvided) {
      badges.push({ text: '💻 Assistive Tech Provided', key: 'assist' });
    }

    return badges.map(badge => (
      <span
        key={badge.key}
        style={{
          fontSize: '0.8rem',
          fontWeight: '600',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          color: 'var(--primary)',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        {badge.text}
      </span>
    ));
  };

  return (
    <div className="card" style={{ gap: '1rem', justifyContent: 'space-between' }}>
      <div>
        <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
          {matchScore !== undefined && (
            <div 
              style={{
                backgroundColor: matchScore >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: matchScore >= 75 ? 'var(--success)' : 'var(--warning)',
                padding: '0.4rem 0.8rem',
                borderRadius: '50px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                border: '1px solid currentColor'
              }}
            >
              {matchScore}% Match
            </div>
          )}
        </div>
        
        <p style={{ fontWeight: '600', margin: 0, color: 'var(--text-muted)' }}>{company}</p>
        
        <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
          <span>📍 {location}</span>
          <span style={{ textTransform: 'capitalize' }}>💼 {workType}</span>
          <span style={{ textTransform: 'capitalize' }}>📄 {jobType}</span>
          {salaryMin && (
            <span>💰 {currency} {salaryMin.toLocaleString()} - {salaryMax ? salaryMax.toLocaleString() : 'Negotiable'}</span>
          )}
        </div>

        <p style={{ 
          fontSize: '0.95rem', 
          margin: '0.5rem 0',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {description}
        </p>

        {matchReason && (
          <div style={{
            fontSize: '0.85rem',
            backgroundColor: 'var(--bg)',
            borderLeft: '4px solid var(--primary)',
            padding: '0.5rem 0.75rem',
            margin: '0.75rem 0',
            borderRadius: '0 4px 4px 0',
            fontStyle: 'italic',
            color: 'var(--text-muted)'
          }}>
            <strong>AI Analysis:</strong> {matchReason}
          </div>
        )}

        <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {renderAccessibilityBadges()}
          {accessibilityFeatures.otherAccommodations && (
            <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              Other: {accessibilityFeatures.otherAccommodations}
            </span>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        {onApply && (
          <button 
            onClick={() => onApply(job)}
            className="btn btn-primary"
            style={{ flex: 1, padding: '0.5rem 1rem' }}
            disabled={isApplied}
          >
            {isApplied ? '✓ Applied' : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
