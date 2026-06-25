let isTabPressed = false;
let lastHoveredElement = null;
let lastFocusedElement = null;

function getElementLabel(el) {
  if (!el) return '';

  // 1. aria-label attribute
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) {
    return ariaLabel.trim();
  }

  // 2. placeholder attribute
  const placeholder = el.getAttribute('placeholder');
  if (placeholder && placeholder.trim()) {
    return placeholder.trim();
  }

  // 3. associated <label> element text (via id)
  const id = el.getAttribute('id');
  if (id) {
    const labelEl = document.querySelector(`label[for="${id}"]`);
    if (labelEl && labelEl.innerText && labelEl.innerText.trim()) {
      return labelEl.innerText.trim();
    }
  }

  // 4. innerText of the element
  const innerText = el.innerText;
  if (innerText && innerText.trim()) {
    return innerText.trim();
  }

  // 5. title attribute
  const title = el.getAttribute('title');
  if (title && title.trim()) {
    return title.trim();
  }

  return '';
}

function speakElement(el) {
  const enabled = localStorage.getItem('focusReaderEnabled') !== 'false';
  if (!enabled) return;

  const label = getElementLabel(el);
  if (!label || !label.trim()) return;

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(label);
    
    // Retrieve pitch and rate settings from localStorage
    const rate = parseFloat(localStorage.getItem('voiceRate')) || 1.0;
    const pitch = parseFloat(localStorage.getItem('voicePitch')) || 1.0;
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    window.speechSynthesis.speak(utterance);
  }
}

export function initFocusReader() {
  if (typeof window === 'undefined') return;
  if (window.__focusReaderInitialized) return;
  window.__focusReaderInitialized = true;

  // Track Tab key down to distinguish keyboard focus from click focus
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isTabPressed = true;
    }
  });

  window.addEventListener('mousedown', () => {
    isTabPressed = false;
  });

  // Hover listener (mouseover)
  window.addEventListener('mouseover', (e) => {
    const target = e.target;
    const interactive = target && typeof target.closest === 'function'
      ? target.closest('button, input, select, textarea, a, [role="button"]')
      : null;

    if (interactive) {
      if (interactive !== lastHoveredElement) {
        lastHoveredElement = interactive;
        speakElement(interactive);
      }
    } else {
      lastHoveredElement = null;
    }
  });

  // Reset hovered element on mouseout
  window.addEventListener('mouseout', (e) => {
    const target = e.target;
    const interactive = target && typeof target.closest === 'function'
      ? target.closest('button, input, select, textarea, a, [role="button"]')
      : null;
    if (interactive && interactive === lastHoveredElement) {
      lastHoveredElement = null;
    }
  });

  // Focus listener (keyboard focus via Tab key)
  window.addEventListener('focus', (e) => {
    if (!isTabPressed) return;
    const target = e.target;
    const interactive = target && typeof target.closest === 'function'
      ? target.closest('button, input, select, textarea, a, [role="button"]')
      : null;

    if (interactive && interactive !== lastFocusedElement) {
      lastFocusedElement = interactive;
      speakElement(interactive);
    }
  }, true);

  // Reset focused element on blur
  window.addEventListener('blur', () => {
    lastFocusedElement = null;
  }, true);
}
