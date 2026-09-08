# Changes Made & Fix-Now Implementation Evidence

**Candidate:** Pranitha R  
**Project:** Technical AI Product Manager Portfolio  
**Repository:** [https://github.com/pranitha-r/Flyrank-7.1](https://github.com/pranitha-r/Flyrank-7.1)  
**Track:** General AI Fluency | Week 7: Break Your Own Site  

---

## Overview

This document provides concrete code diffs, architectural modifications, and behavioral evidence for every **Fix-Now** item identified during stress-testing and categorized in [`TRIAGE.md`](TRIAGE.md).

---

## 1. Summary of Changes by File

| File | Type | Primary Role & Changes |
|---|---|---|
| [`index.html`](index.html) | **Modified** | Added complete SEO meta suite, Open Graph tags, Twitter card, JSON-LD structured data, responsive discovery form, and updated all repo links to `Flyrank-7.1`. |
| [`styles.css`](styles.css) | **Modified** | Hardened responsive layout for 320px screens, added input focus rings, error badges, character counter warnings, loading spinner animations, and print styles. |
| [`app.js`](app.js) | **New** | Client-side hardening logic: double-submission debounce lock, safe localStorage wrapper, XSS input sanitization, and strict RFC email validation. |
| [`assets/favicon.svg`](assets/favicon.svg) | **New** | High-resolution scalable vector icon preventing 404 favicon requests and enhancing browser tab branding. |
| [`assets/og-preview.svg`](assets/og-preview.svg) | **New** | Social share card (1200x630) optimized for LinkedIn, Twitter, Slack, and Discord link unfurling. |
| [`robots.txt`](robots.txt) | **New** | Search engine crawler instructions referencing the canonical sitemap. |
| [`sitemap.xml`](sitemap.xml) | **New** | XML sitemap indicating canonical portfolio URL and update frequency. |

---

## 2. Detailed Code Diffs & Verification Evidence

### Fix 1: Double-Submission Prevention & Race Condition Lock
* **Before:** Fast repeated clicks on the submit button dispatched duplicate actions or crashed unhandled async state.
* **After:**
```javascript
// In app.js
let isSubmitting = false;
let lastSubmitTimestamp = 0;
const SUBMIT_COOLDOWN_MS = 2500;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const now = Date.now();

  // Block rapid duplicate clicks
  if (isSubmitting || (now - lastSubmitTimestamp < SUBMIT_COOLDOWN_MS)) {
    showFeedback('alert-warning', '⚠️ Please wait: Your submission is already processing. Rapid duplicate submissions are blocked.');
    return;
  }

  isSubmitting = true;
  lastSubmitTimestamp = now;
  submitBtn.disabled = true;
  submitBtn.setAttribute('aria-busy', 'true');
  submitSpinner.style.display = 'inline-block';
  submitBtnText.textContent = 'Submitting...';
  // ...
});
```
* **Behavior Verified:** Spam-clicking "Send Inquiry" triggers immediate button disabling, displays animated spinner, and rejects concurrent clicks with a courteous notice.

---

### Fix 2: Defensive Input Sanitization & Empty/Garbage Validation
* **Before:** No native form existed or naive checks allowed whitespace and unescaped HTML.
* **After:**
```javascript
// In app.js
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

function validateEmail(email) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(String(email).trim());
}

// Trimming & boundary enforcement
const rawName = (nameInput.value || '').trim();
const rawEmail = (emailInput.value || '').trim();
const rawMessage = (messageInput.value || '').trim();

if (!rawName || rawName.length < 2) {
  setFieldError(nameInput, 'Name is required (minimum 2 characters).');
}
if (!validateEmail(rawEmail)) {
  setFieldError(emailInput, 'Please provide a valid email address (e.g. name@company.com).');
}
```
* **Behavior Verified:** Inputs with whitespace or malformed emails (`foo@bar`) immediately display red error indicators and shift focus to the first error. XSS strings like `<script>alert(1)</script>` are converted to safe HTML entities.

---

### Fix 3: Safari Private Browsing LocalStorage Resilience
* **Before:** `localStorage.getItem` or `localStorage.setItem` in private browsing threw unhandled `DOMException` and halted script execution.
* **After:**
```javascript
// In app.js
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
```
* **Behavior Verified:** Theme switching and audit logging operate smoothly without runtime exceptions when storage cookies are blocked.

---

### Fix 4: Full SEO Metadata, Open Graph & JSON-LD Structured Data
* **Before:** Minimal `<meta charset>` and basic title tag; zero social card previews, zero schema data.
* **After:**
```html
<!-- In index.html -->
<title>Pranitha R | Technical AI Product Manager & Agentic Systems Portfolio</title>
<meta name="description" content="Portfolio of Pranitha R, Technical AI Product Manager specializing in autonomous LLM multi-agent systems, LangGraph orchestration, Python, and deterministic AI evaluation." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://pranitha-r.github.io/Flyrank-7.1/" />

<!-- Open Graph / Social Sharing -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://pranitha-r.github.io/Flyrank-7.1/" />
<meta property="og:title" content="Pranitha R | Technical AI Product Manager & Agentic Systems" />
<meta property="og:image" content="https://pranitha-r.github.io/Flyrank-7.1/assets/og-preview.svg" />

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://pranitha-r.github.io/Flyrank-7.1/#person",
      "name": "Pranitha R",
      "jobTitle": "Technical AI Product Manager",
      "url": "https://pranitha-r.github.io/Flyrank-7.1/",
      "knowsAbout": ["Agentic AI", "LLM Orchestration", "LangGraph", "Python"]
    }
  ]
}
</script>
```
* **Behavior Verified:** Crawlers and social unfurlers generate high-fidelity preview cards with title, description, and high-contrast banner.

---

### Fix 5: Repository Link Update to Week 7 Repository
* **Before:**
```html
<a href="https://github.com/pranitha-r/flyrank-6.1" ...>
```
* **After:**
```html
<a href="https://github.com/pranitha-r/Flyrank-7.1" target="_blank" rel="noopener noreferrer" class="code-link">
  <span>📁</span> View Source Code & Hardening Suite (Flyrank-7.1)
</a>
```
* **Behavior Verified:** All outbound repo links navigate directly to `https://github.com/pranitha-r/Flyrank-7.1`.

---

### Fix 6: 320px Viewport & Responsive Layout Hardening
* **Before:** Fixed padding (2.5rem) and desktop button widths caused horizontal scrollbars and text truncation on screens under 360px.
* **After:**
```css
/* In styles.css */
@media (max-width: 640px) {
  .header-content { flex-direction: column; align-items: flex-start; }
  .hero { padding: 3rem 1rem 2rem; }
  .metrics-grid { grid-template-columns: 1fr; }
  .hero-actions { flex-direction: column; }
  .hero-actions .btn { width: 100%; }
}

@media (max-width: 340px) {
  .theme-label { display: none; }
  .theme-btn { padding: 0.25rem 0.45rem; font-size: 0.75rem; }
  .nav-links { font-size: 0.8rem; gap: 0.5rem; }
}
```
* **Behavior Verified:** Zero layout shift or horizontal overflow down to 320px screen width.

---

## 3. Verification Conclusion

Every fix-now item was implemented with defensive programming, accessible markup (`aria-*`), and verified against regression. The site is now fully prepared for peer/mentor hardening sign-off.
