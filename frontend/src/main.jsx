import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './styles/global.css';

// Pre-flight accessibility setup: apply saved settings immediately to prevent style flashing
const applySettingsOnLoad = () => {
  const theme = localStorage.getItem('theme') || 'normal';
  if (theme !== 'normal') {
    document.body.setAttribute('data-theme', theme);
  } else {
    document.body.removeAttribute('data-theme');
  }

  const fontSize = localStorage.getItem('fontSize') || '16';
  document.documentElement.style.setProperty('--font-size', `${fontSize}px`);

  const dyslexiaFont = localStorage.getItem('dyslexiaFont') === 'true';
  if (dyslexiaFont) {
    document.body.classList.add('dyslexia-font');
  } else {
    document.body.classList.remove('dyslexia-font');
  }
};

// Execute pre-flight settings
applySettingsOnLoad();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
