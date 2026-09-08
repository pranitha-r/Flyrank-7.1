# Week 7: Break Your Own Site — AI Fluency Portfolio Hardening

[![Hardening Checkpoint](https://img.shields.io/badge/Hardening_Review-PASSED-success?style=for-the-badge)](HARDENING_REVIEW.md)
[![Performance Score](https://img.shields.io/badge/Lighthouse_Speed-99%2F100-brightgreen?style=for-the-badge)](SEO_AND_SPEED.md)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub_Pages-blue?style=for-the-badge)](https://pranitha-r.github.io/Flyrank-7.1/)

Live Portfolio URL: **[https://pranitha-r.github.io/Flyrank-7.1/](https://pranitha-r.github.io/Flyrank-7.1/)**  
Project Repository: **[https://github.com/pranitha-r/Flyrank-7.1](https://github.com/pranitha-r/Flyrank-7.1)**  

---

## 1. Project Context & Strategy

* **Target Audience:** Hiring managers and engineering leadership seeking a **Technical AI Product Manager**.
* **Core Proof Claim:**
  > *"I prove I can define, scope, and build production-ready agentic AI systems using LLM orchestrators and Python."*
* **Target Conversion Action:** Submit discovery inquiry or book a 15-minute technical discovery call via Calendly.

---

## 2. Deliverables Summary for Week 7 Phase Checkpoint

| Deliverable File | Description | Status |
|---|---|---|
| [`WHERE_IT_BREAKS.md`](WHERE_IT_BREAKS.md) | Honest catalog of 10 edge cases stress-tested to failure (empty inputs, garbage data, double-click race condition, narrow viewports, storage blocks). | ✅ Complete |
| [`TRIAGE.md`](TRIAGE.md) | Systematic triage classifying every finding into **Fix-Now** (P0/P1) vs. **Known Limitation** with technical rationale. | ✅ Complete |
| [`CHANGES.md`](CHANGES.md) | Concrete code diffs and verification evidence demonstrating that all fix-nows have been addressed. | ✅ Complete |
| [`SEO_AND_SPEED.md`](SEO_AND_SPEED.md) | Complete SEO/meta verification, Open Graph social share preview check, candidate self-search audit, and speed test report (99/100 Lighthouse). | ✅ Complete |
| [`HARDENING_REVIEW.md`](HARDENING_REVIEW.md) | Structured peer/mentor review sign-off verifying that all must-fixes have been implemented to launch standards. | ✅ Complete |
| [`index.html`](index.html) | Semantic portfolio code with complete SEO suite, JSON-LD Schema.org, Open Graph, and accessible conversion forms. | ✅ Complete |
| [`styles.css`](styles.css) | Hardened responsive stylesheet supporting **Minimalist**, **Dark**, and **Colorful** themes with 320px viewport resilience. | ✅ Complete |
| [`app.js`](app.js) | Defensive client-side logic: double-submission debounce lock, safe localStorage wrapper, XSS input sanitization, and strict RFC email validation. | ✅ Complete |
| [`assets/og-preview.svg`](assets/og-preview.svg) | Branded 1200x630 social share card for LinkedIn, Slack, and Twitter unfurling. | ✅ Complete |
| [`assets/favicon.svg`](assets/favicon.svg) | Crisp SVG vector favicon. | ✅ Complete |
| [`robots.txt`](robots.txt) & [`sitemap.xml`](sitemap.xml) | Search engine crawler discovery files. | ✅ Complete |

---

## 3. Key Hardening Fixes Implemented

1. **Double-Submission & Race Condition Lock:** Added `isSubmitting` flag and 2.5-second debouncing cooldown. Submit button immediately disables with `aria-busy="true"`, loading spinner animates, and rapid duplicate clicks are intercepted.
2. **Defensive Input Validation:** Rejects empty or whitespace-only inputs, strips malicious HTML/XSS payloads, and enforces RFC-compliant email formatting.
3. **Storage Fallback (`SafeStorage`):** Wrapped `localStorage` in a `try/catch` memory dictionary fallback to guarantee zero script crashes on Safari Private Browsing.
4. **Full Findability Suite:** Added Open Graph metadata, Twitter Cards, Schema.org JSON-LD structured data for `Person` and `WebSite`, `sitemap.xml`, and `robots.txt`.
5. **Ultra-Narrow Screen Hardening:** Responsive CSS tested and hardened down to 320px screen width without layout clipping or horizontal scrolling.

---

## 4. How to Enable GitHub Pages (Launch Guide)

1. Go to repository settings: **[https://github.com/pranitha-r/Flyrank-7.1/settings/pages](https://github.com/pranitha-r/Flyrank-7.1/settings/pages)**.
2. Under **Build and deployment** > **Source**:
   * Branch: `main`
   * Folder: `/ (root)`
   * Click **Save**.
3. Within 1–2 minutes, your hardened portfolio will be live at:
   **`https://pranitha-r.github.io/Flyrank-7.1/`**
