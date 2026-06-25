import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <p style={{ margin: 0, fontWeight: '500' }}>
          সक्षम Hire &copy; {new Date().getFullYear()} &mdash; Inclusive Job Portal for Differently-Abled Individuals.
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          Because Everyone Deserves Opportunity. Designed for barrier-free accessibility.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
