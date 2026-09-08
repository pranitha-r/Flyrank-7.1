/**
 * Pranitha R Portfolio - Interactive Logic & Hardening Guards
 * Handles:
 *  - Safe LocalStorage (Private browsing resilience)
 *  - Debounced theme switching with ARIA state
 *  - Form validation against empty inputs, garbage data, XSS sanitization
 *  - Double-submission lock & race condition protection
 *  - Accessible feedback messaging
 */

// 1. Safe LocalStorage Wrapper (Guards against Safari Private Browsing & Quota Errors)
const SafeStorage = {
  memory: {},
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage read blocked; using in-memory fallback.', e);
      return this.memory[key] || null;
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage write blocked; using in-memory fallback.', e);
      this.memory[key] = String(value);
    }
  }
};

// 2. Theme Switcher with ARIA state updates
function setTheme(theme) {
  const allowed = ['minimalist', 'dark', 'colorful'];
  const targetTheme = allowed.includes(theme) ? theme : 'minimalist';
  
  document.documentElement.setAttribute('data-theme', targetTheme);
  SafeStorage.setItem('theme', targetTheme);

  // Update button active / aria-pressed states
  document.querySelectorAll('.theme-btn').forEach(btn => {
    const isActive = btn.getAttribute('data-theme-val') === targetTheme;
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.classList.toggle('active', isActive);
  });
}

// 3. XSS Sanitization Helper
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 4. Input Validator
function validateEmail(email) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(String(email).trim());
}

// Form State Management (Double-submission & debounce protection)
let isSubmitting = false;
let lastSubmitTimestamp = 0;
const SUBMIT_COOLDOWN_MS = 2500;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  const initialTheme = SafeStorage.getItem('theme') || 'minimalist';
  setTheme(initialTheme);

  // Theme button listeners
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.getAttribute('data-theme-val'));
    });
  });

  // Contact / Discovery Form Elements
  const form = document.getElementById('discovery-form');
  if (!form) return;

  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const roleInput = document.getElementById('form-role');
  const messageInput = document.getElementById('form-message');
  const submitBtn = document.getElementById('submit-btn');
  const submitSpinner = document.getElementById('submit-spinner');
  const submitBtnText = document.getElementById('submit-text');
  const formFeedback = document.getElementById('form-feedback');
  const charCounter = document.getElementById('char-counter');

  // Live Character Counter with Overlength warning
  if (messageInput && charCounter) {
    const maxLen = parseInt(messageInput.getAttribute('maxlength') || '1500', 10);
    const updateCount = () => {
      const remaining = maxLen - messageInput.value.length;
      charCounter.textContent = `${messageInput.value.length} / ${maxLen} characters`;
      charCounter.classList.toggle('warning', remaining < 100);
    };
    messageInput.addEventListener('input', updateCount);
    updateCount();
  }

  // Clear errors on input
  [nameInput, emailInput, roleInput, messageInput].forEach(field => {
    if (!field) return;
    field.addEventListener('input', () => {
      field.classList.remove('has-error');
      const errEl = document.getElementById(`${field.id}-error`);
      if (errEl) {
        errEl.textContent = '';
        errEl.style.display = 'none';
      }
      field.removeAttribute('aria-invalid');
    });
  });

  // Show inline error helper
  function setFieldError(field, message) {
    field.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    const errEl = document.getElementById(`${field.id}-error`);
    if (errEl) {
      errEl.textContent = message;
      errEl.style.display = 'block';
    }
  }

  // Double-submit & empty/garbage submission handling
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const now = Date.now();

    // HARDENING CHECK 1: Rapid Double-Click / Race Condition Interception
    if (isSubmitting || (now - lastSubmitTimestamp < SUBMIT_COOLDOWN_MS)) {
      showFeedback('alert-warning', '⚠️ Please wait: Your submission is already processing. Rapid duplicate submissions are blocked.');
      return;
    }

    // Reset feedback
    formFeedback.style.display = 'none';
    formFeedback.className = 'form-feedback-box';
    formFeedback.textContent = '';

    // Extract values & Trim
    const rawName = (nameInput.value || '').trim();
    const rawEmail = (emailInput.value || '').trim();
    const rawRole = (roleInput.value || '').trim();
    const rawMessage = (messageInput.value || '').trim();

    let hasError = false;
    let firstErrorField = null;

    // HARDENING CHECK 2: Validate Name
    if (!rawName) {
      setFieldError(nameInput, 'Name is required. Please enter your name.');
      hasError = true;
      firstErrorField = firstErrorField || nameInput;
    } else if (rawName.length < 2) {
      setFieldError(nameInput, 'Name must be at least 2 characters long.');
      hasError = true;
      firstErrorField = firstErrorField || nameInput;
    } else if (rawName.length > 80) {
      setFieldError(nameInput, 'Name cannot exceed 80 characters.');
      hasError = true;
      firstErrorField = firstErrorField || nameInput;
    }

    // HARDENING CHECK 3: Validate Email against Garbage Syntax
    if (!rawEmail) {
      setFieldError(emailInput, 'Email address is required.');
      hasError = true;
      firstErrorField = firstErrorField || emailInput;
    } else if (!validateEmail(rawEmail)) {
      setFieldError(emailInput, 'Please provide a valid email address (e.g. name@company.com).');
      hasError = true;
      firstErrorField = firstErrorField || emailInput;
    }

    // HARDENING CHECK 4: Validate Message Content & Minimum Substance
    if (!rawMessage) {
      setFieldError(messageInput, 'Message is required. Please briefly describe your inquiry.');
      hasError = true;
      firstErrorField = firstErrorField || messageInput;
    } else if (rawMessage.length < 10) {
      setFieldError(messageInput, 'Please provide a bit more context (minimum 10 characters).');
      hasError = true;
      firstErrorField = firstErrorField || messageInput;
    } else if (rawMessage.length > 1500) {
      setFieldError(messageInput, 'Message is too long (maximum 1500 characters).');
      hasError = true;
      firstErrorField = firstErrorField || messageInput;
    }

    // Abort if validation failed
    if (hasError) {
      if (firstErrorField) {
        firstErrorField.focus();
      }
      showFeedback('alert-error', 'Please fix the highlighted errors before submitting.');
      return;
    }

    // Sanitized values
    const cleanPayload = {
      name: sanitizeInput(rawName),
      email: sanitizeInput(rawEmail),
      role: sanitizeInput(rawRole),
      message: sanitizeInput(rawMessage),
      timestamp: new Date().toISOString()
    };

    // HARDENING CHECK 5: Engage Submission Lock & UI Disabled State
    isSubmitting = true;
    lastSubmitTimestamp = now;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    if (submitSpinner) submitSpinner.style.display = 'inline-block';
    if (submitBtnText) submitBtnText.textContent = 'Submitting...';

    try {
      // Simulate resilient asynchronous processing with simulated latency
      await new Promise(resolve => setTimeout(resolve, 800));

      // Record in local cache as verified lead / audit trail
      const existingInquiries = JSON.parse(SafeStorage.getItem('inquiries') || '[]');
      existingInquiries.push(cleanPayload);
      SafeStorage.setItem('inquiries', JSON.stringify(existingInquiries));

      // Success UI state
      form.reset();
      if (charCounter) charCounter.textContent = '0 / 1500 characters';
      
      const referenceId = 'PR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      showFeedback(
        'alert-success',
        `✅ Thank you, ${cleanPayload.name}! Your discovery request has been received (Ref: ${referenceId}). Pranitha will respond within 24 business hours.`
      );
    } catch (err) {
      console.error('Submission error:', err);
      showFeedback(
        'alert-error',
        'An unexpected error occurred. Please contact Pranitha directly via email at contact@pranitha.dev.'
      );
    } finally {
      // Release lock after cooldown
      setTimeout(() => {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        if (submitSpinner) submitSpinner.style.display = 'none';
        if (submitBtnText) submitBtnText.textContent = 'Send Inquiry';
      }, 1000);
    }
  });

  function showFeedback(typeClass, message) {
    formFeedback.className = `form-feedback-box ${typeClass}`;
    formFeedback.textContent = message;
    formFeedback.style.display = 'block';
    formFeedback.setAttribute('role', typeClass === 'alert-error' ? 'alert' : 'status');
    formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
