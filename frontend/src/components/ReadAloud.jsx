import React, { useState, useEffect } from 'react';

const ReadAloud = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState(null);

  useEffect(() => {
    if (window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  const handleSpeak = () => {
    if (!synth) return;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    // Grab all readable text, filter out button texts or accessibility controls if desired
    const textToRead = mainElement.innerText || '';
    if (!textToRead.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Retrieve settings from localStorage
    const rate = parseFloat(localStorage.getItem('voiceRate')) || 1.0;
    const pitch = parseFloat(localStorage.getItem('voicePitch')) || 1.0;

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    synth.cancel(); // Cancel any current speech
    synth.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  if (!synth) return null; // Graceful degradation for browsers without SpeechSynthesis

  return (
    <button
      onClick={handleSpeak}
      className="btn btn-primary"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '3px solid var(--border)',
        fontSize: '1.75rem',
        padding: 0
      }}
      title={isSpeaking ? "Stop Reading Aloud" : "Read Page Aloud"}
      aria-label={isSpeaking ? "Stop Reading Aloud" : "Read Page Aloud"}
    >
      {isSpeaking ? '⏹️' : '🔊'}
    </button>
  );
};

export default ReadAloud;
