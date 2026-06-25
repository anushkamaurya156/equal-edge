import React from 'react';
import { EmployerSidebar } from './Dashboard';

const Resources = () => {
  const articles = [
    {
      id: 1,
      title: "Building an Inclusive Workplace: Standard Guidelines",
      summary: "Understand standard architectural and software design guidelines to create a barrier-free physical and digital environment.",
      tips: [
        "Ensure entrance ramps and elevators are wheelchair accessible.",
        "Adopt screen reader friendly software (e.g. adding alternative text to tags, semantic HTML).",
        "Enable captions in all online video conferencing tools."
      ]
    },
    {
      id: 2,
      title: "Working with Visually Impaired Team Members",
      summary: "Best practices to assist colleagues with partial or total blindness in achieving success in their roles.",
      tips: [
        "Share documents in accessible digital formats (Word, semantic PDF) instead of scanned images.",
        "Provide verbal descriptions when sharing screen-shares or graphics in meetings.",
        "Install and support screen reader software setups like JAWS or NVDA."
      ]
    },
    {
      id: 3,
      title: "Hearing Accommodation Best Practices",
      summary: "Enhance team communication and ensure colleagues with hearing impairments are fully integrated.",
      tips: [
        "Use real-time automated transcription tools during company calls.",
        "Make sure virtual presentations have clean visual outlines.",
        "Consider hiring certified sign language interpreters for team events or reviews."
      ]
    },
    {
      id: 4,
      title: "Cognitive Inclusion & Workplace Neurodiversity",
      summary: "Accommodating ADHD, autism spectrum, dyslexia, and learning differences in modern development environments.",
      tips: [
        "Provide written notes and guidelines alongside verbal instructions.",
        "Minimize open-office clutter and provide quiet work alcoves.",
        "Allow flexible work hours and check-ins to prevent cognitive fatigue."
      ]
    },
    {
      id: 5,
      title: "Leveraging Government Grants for Accessibility Infrastructure",
      summary: "Explore Indian state subsidies, rebates, and schemes available to employers who hire and train PwD candidates.",
      tips: [
        "Check SIPDA scheme funding for setting up office wheelchair ramps.",
        "Benefit from employee PF contribution waivers for registered differently-abled workers.",
        "Apply for National Awards to highlight corporate social responsibility achievements."
      ]
    }
  ];

  return (
    <div className="dashboard-layout">
      <EmployerSidebar />
      <main className="dashboard-content">
        <h1>Employer Accessibility Resources</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Explore articles, onboarding guides, and training tips to ensure a successful, inclusive career path for your team members.
        </p>

        <div className="grid grid-2" style={{ gap: '2rem' }}>
          {/* Main articles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2>Inclusion Guides & Guides</h2>
            
            {articles.map(art => (
              <div key={art.id} className="card">
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{art.title}</h3>
                <p style={{ fontSize: '0.95rem' }}>{art.summary}</p>
                <div style={{ backgroundColor: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    QUICK ACTION TIPS:
                  </strong>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {art.tips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Quick tips panel & External links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <h2>Creating Accessible Digital Assets</h2>
              <p style={{ fontSize: '0.95rem' }}>
                Colleagues using screen readers or voice-control require standard web accessibility specifications (WCAG 2.1). Ensure your internal software portals comply:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <li>Maintain a color contrast ratio of at least 4.5:1 for text.</li>
                <li>Write comprehensive `aria-label` properties on form inputs and icon-only buttons.</li>
                <li>Design web forms with logical keyboard focus tab paths.</li>
                <li>Provide text descriptions for charts, reports, and diagrams.</li>
              </ul>
            </div>

            <div className="card">
              <h2>External Portals & Links</h2>
              <p style={{ fontSize: '0.95rem' }}>
                For further certification standards and government compliance assistance:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li>
                  <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                    W3C Web Accessibility Guidelines (WCAG)
                  </a>
                </li>
                <li>
                  <a href="https://disabilityaffairs.gov.in/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                    Department of Empowerment of Persons with Disabilities, India
                  </a>
                </li>
                <li>
                  <a href="https://www.nhfdc.nic.in/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                    National Handicapped Finance and Development Corporation (NHFDC)
                  </a>
                </li>
                <li>
                  <a href="https://samarthanam.org/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                    Samarthanam Trust for the Disabled
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Resources;
