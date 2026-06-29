let lastHoveredElement = null;
let lastFocusedElement = null;
let isTabPressed = false;

// Interactive elements — use closest() to catch children
const INTERACTIVE_SELECTOR =
  'button, input, select, textarea, a[href], [role="button"]';

// Content elements — match the element itself
const CONTENT_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, label';

// ─── Text extraction ────────────────────────────────────────────────────────

function getTextContent(el) {
  if (!el) return '';

  // 1. Explicit aria-label wins
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  // 2. Inputs / Textareas / Selects → prefer associated <label>, then placeholder
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    const id = el.id;
    if (id) {
      const labelEl = document.querySelector(`label[for="${id}"]`);
      if (labelEl && labelEl.innerText && labelEl.innerText.trim()) {
        return labelEl.innerText.trim();
      }
    }
    const placeholder = el.getAttribute('placeholder');
    if (placeholder && placeholder.trim()) return placeholder.trim();
    const title = el.getAttribute('title');
    if (title && title.trim()) return title.trim();
    return '';
  }

  // 3. Everything else → innerText (includes role-card children)
  const text = (el.innerText || el.textContent || '').trim();
  return text;
}

// ─── Speech helpers ─────────────────────────────────────────────────────────

function speakText(text) {
  const enabled = localStorage.getItem('focusReaderEnabled') !== 'false';
  if (!enabled || !text || !text.trim()) return;

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = parseFloat(localStorage.getItem('voiceRate')) || 1.0;
    utterance.pitch = parseFloat(localStorage.getItem('voicePitch')) || 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ─── Target resolution ──────────────────────────────────────────────────────
// Given a raw event target, return the element whose text should be spoken.

function findSpeakTarget(el) {
  if (!el || typeof el.closest !== 'function') return null;

  // 1. Role-card: always read the whole card (title + description together)
  const roleCard = el.closest('.role-card');
  if (roleCard) return roleCard;

  // 2. Interactive elements (button, input, link, …)
  const interactive = el.closest(INTERACTIVE_SELECTOR);
  if (interactive) return interactive;

  // 3. The element itself is a content element (h1-h6, p, label)
  if (el.matches && el.matches(CONTENT_SELECTOR)) return el;

  // 4. Hovering a direct child of a card but not a content element above →
  //    walk up and return the nearest content heading inside the card
  const card = el.closest('.card');
  if (card) {
    const heading = card.querySelector('h1, h2, h3, h4');
    if (heading) return heading;
    const para = card.querySelector('p');
    if (para) return para;
  }

  return null;
}

// ─── Init ────────────────────────────────────────────────────────────────────

export function initFocusReader() {
  if (typeof window === 'undefined') return;
  if (window.__focusReaderInitialized) return;
  window.__focusReaderInitialized = true;

  // Track whether the last key was Tab (for keyboard-focus distinction)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') isTabPressed = true;
  });
  window.addEventListener('mousedown', () => {
    isTabPressed = false;
  });

  // ── Hover: speak on mouseover ──────────────────────────────────────────
  window.addEventListener('mouseover', (e) => {
    const target = findSpeakTarget(e.target);
    if (target && target !== lastHoveredElement) {
      lastHoveredElement = target;
      speakText(getTextContent(target));
    }
  });

  // ── Stop on mouseout (only when truly leaving the target) ──────────────
  window.addEventListener('mouseout', (e) => {
    if (!lastHoveredElement) return;
    const related = e.relatedTarget;
    // If the new element is still inside the last spoken element, don't stop
    if (related && lastHoveredElement.contains(related)) return;
    lastHoveredElement = null;
    stopSpeaking();
  });

  // ── Tab-focus: speak on keyboard focus ────────────────────────────────
  window.addEventListener('focus', (e) => {
    if (!isTabPressed) return;
    const target = findSpeakTarget(e.target);
    if (target && target !== lastFocusedElement) {
      lastFocusedElement = target;
      speakText(getTextContent(target));
    }
  }, true);

  // ── Stop on blur ──────────────────────────────────────────────────────
  window.addEventListener('blur', () => {
    lastFocusedElement = null;
    stopSpeaking();
  }, true);
}
