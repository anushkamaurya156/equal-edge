export function initKeyboardNav() {
  if (typeof window === 'undefined') return;
  if (window.__keyboardNavInitialized) return;
  window.__keyboardNavInitialized = true;

  // 1. Outline visible on Tab, hidden on mouse click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav-active');
    }
  });

  window.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav-active');
  });

  // 2. Respond to Enter and Space for role="button" or class="card" (Event Delegation on document)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = document.activeElement;
      if (!target) return;
      const isCard = target.classList.contains('card') || target.closest('.card');
      const isRoleButton = target.getAttribute('role') === 'button' || target.closest('[role="button"]');
      if (isCard || isRoleButton) {
        if (e.key === ' ') e.preventDefault();
        target.click();
      }
    }
  });

  // Helper to ensure all cards and role="button" elements have tabIndex="0" so they are focusable
  const makeElementsFocusable = () => {
    const elements = document.querySelectorAll('.card, [role="button"]');
    elements.forEach((el) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });
  };

  // Helper to ensure there's a target for the skip link
  const ensureMainContentId = () => {
    if (!document.getElementById('main-content')) {
      const main = document.querySelector('main') || document.querySelector('.dashboard-content') || document.querySelector('#root');
      if (main) {
        main.id = 'main-content';
        if (!main.hasAttribute('tabindex')) {
          main.setAttribute('tabindex', '-1');
          main.style.outline = 'none';
        }
      }
    }
  };

  // 3. Inject skip-to-main-content link
  const injectSkipLink = () => {
    if (document.querySelector('.skip-link')) return;
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.innerText = 'Skip to main content';
    
    // Inline styling so it works before/even if CSS has not loaded
    skipLink.style.cssText = 'position:fixed;top:-100px;left:0;background:#4F46E5;color:white;padding:8px 16px;z-index:99999;border-radius:0 0 4px 0;font-weight:600;font-size:16px;text-decoration:none;transition:top 0.2s;';
    skipLink.addEventListener('focus', () => { skipLink.style.top = '0'; });
    skipLink.addEventListener('blur', () => { skipLink.style.top = '-100px'; });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  };

  // Initialize and keep updating dynamically
  injectSkipLink();
  makeElementsFocusable();
  ensureMainContentId();

  // 4. Trap focus inside modal/dialog elements when open
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    // Search for modal elements (including modal-overlay/content or elements with role="dialog")
    const modal = document.querySelector('.modal, .modal-overlay, .modal-content, [role="dialog"]');
    if (!modal) return;

    // Find all focusable elements within the modal
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(modal.querySelectorAll(focusableSelector)).filter((el) => {
      // Must be visible and not disabled
      return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.disabled;
    });

    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab (going backward)
      if (document.activeElement === firstFocusable || !modal.contains(document.activeElement)) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab (going forward)
      if (document.activeElement === lastFocusable || !modal.contains(document.activeElement)) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  // 5. Arrow key navigation between interactive elements
  document.addEventListener('keydown', (e) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!keys.includes(e.key)) return;

    const activeEl = document.activeElement;
    if (activeEl) {
      const tagName = activeEl.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        return;
      }
    }

    const focusable = Array.from(
      document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
      )
    ).filter((el) => el.offsetWidth > 0 && el.offsetHeight > 0);

    if (focusable.length === 0) return;

    const index = focusable.indexOf(activeEl);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % focusable.length;
      focusable[nextIndex].focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + focusable.length) % focusable.length;
      focusable[prevIndex].focus();
    }
  });

  // Watch for DOM changes to inject/update focusable attributes and skip link if necessary
  const observer = new MutationObserver(() => {
    injectSkipLink();
    makeElementsFocusable();
    ensureMainContentId();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
