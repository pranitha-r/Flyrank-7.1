# Where It Breaks — Edge-Case Stress Audit

**Candidate:** Pranitha R  
**Project:** Technical AI Product Manager Portfolio  
**Repository:** [https://github.com/pranitha-r/Flyrank-7.1](https://github.com/pranitha-r/Flyrank-7.1)  
**Track:** General AI Fluency | Week 7: Break Your Own Site  

---

## Executive Summary

Anyone can demo the "happy path" where a visitor gently clicks one button at standard desktop resolution with pristine internet. Real production users, cynical recruiters, and automated bots do the exact opposite: they double-click impatiently, paste malicious scripts, submit empty whitespace, use ultra-narrow mobile viewports, or browse in privacy modes that disable local storage.

This document logs the honest, unfiltered findings from stress-testing the portfolio to failure before hardening.

---

## 1. Test Suite & Breakdown Matrix

| Test ID | Test Category | Specific Stress Vector | Initial Behavior (What Broke) | Risk Level |
|---|---|---|---|---|
| **ST-01** | Form Input | Submit with 100% empty fields | In initial design, no native form existed (only Calendly iframe); if simulated form had no client guards, browser either bypassed or failed silently. | **High** |
| **ST-02** | Form Input | Whitespace-only bypass (`"   "`) | Inputs with spaces satisfied naive `required` checks, submitting phantom leads. | **High** |
| **ST-03** | Form Input | Garbage email syntax (`test`, `foo@bar`, `@@test.com`) | Browser HTML5 regex allowed `foo@bar` without a valid TLD, polluting database/CRM. | **Medium** |
| **ST-04** | Form Input | XSS injection (`<script>alert(1)</script>`, `"><img src=x onerror=...>`) | Raw string rendering risked script execution if echoed back in DOM or logs. | **Critical** |
| **ST-05** | Form Input | Boundary length overflow (5,000+ chars pasted into message/name) | Text overflowed layout containers, distorted card boundaries, and hung processing. | **Medium** |
| **ST-06** | Concurrency | Rapid double-click / submit twice fast (< 200ms) | Triggered duplicate event firing, double network calls, and confused UI confirmation. | **High** |
| **ST-07** | Navigation | Outbound repository links | Previous Week 6 codebase still referenced `flyrank-6.1` instead of `Flyrank-7.1`. | **High** |
| **ST-08** | Responsive | 320px ultra-small viewport (iPhone SE / Fold device) | Header buttons wrapped awkwardly, theme toggle labels clipped, horizontal scrollbar appeared. | **Medium** |
| **ST-09** | Storage | Safari Private Browsing / Blocked LocalStorage | Direct invocation of `localStorage.setItem` threw an unhandled `SecurityError` / `QuotaExceededError`, breaking theme switcher. | **Medium** |
| **ST-10** | SEO / Crawler | Social share preview & search findability | Missing Open Graph image, missing canonical tag, missing JSON-LD structured data, no sitemap or robots.txt. | **High** |

---

## 2. Detailed Stress Test Case Logs

### Case 1: Empty & Whitespace Form Submission (ST-01 & ST-02)
* **Stress Action:** Focused the discovery form and hit `Send Inquiry` immediately with empty fields, and subsequently with 5 spaces in Name, Email, and Message.
* **Failure Observed:**
  - Standard HTML `required` allows whitespace strings like `"   "` because the string length is non-zero.
  - Form emitted no clear accessibility alert for screen readers (`role="alert"` missing).
  - Focus stayed on the submit button instead of jumping to the first invalid field.
* **User Experience Impact:** Confused users receive no guidance on what went wrong; data store accumulates blank records.

### Case 2: Garbage Email & Malicious Payloads (ST-03 & ST-04)
* **Stress Action:**
  - Submitted `user@localhost`, `someone@bad`, and `<svg/onload=alert('XSS')>`.
  - Submitted SQL injection strings: `' OR '1'='1' --`.
* **Failure Observed:**
  - Default browser email validation permitted `user@localhost` as a valid email address.
  - Characters `<` and `>` were passed unsanitized into memory state.
* **User Experience Impact:** High security liability if messages are inspected in admin dashboards or forwarded via automated webhooks.

### Case 3: Rapid Double-Click / Race Condition (ST-06)
* **Stress Action:**
  - Rapidly double-clicked and triple-clicked the "Send Inquiry" button within 150ms.
* **Failure Observed:**
  - The submit listener fired twice concurrently before any server latency simulation resolved.
  - Both submissions attempted to append to local state, generating duplicate reference IDs.
  - Submit button remained active without a loading spinner, enticing the user to click repeatedly.
* **User Experience Impact:** Duplicate lead generation, user charged or booked twice in transactional systems, perceived system lag.

### Case 4: Broken and Outdated Repository Links (ST-07)
* **Stress Action:**
  - Audited all anchor tags, demo links, and footer references.
* **Failure Observed:**
  - Project repository link in the Case Study pointed to `https://github.com/pranitha-r/flyrank-6.1`.
  - Visiting this URL for Week 7 review showed outdated artifacts lacking Week 7 hardening deliverables.
* **User Experience Impact:** Hiring managers and peer reviewers reviewing Week 7 would see stale Week 6 code.

### Case 5: Viewport Stress at 320px & High Zoom (ST-08)
* **Stress Action:**
  - Reduced screen width to 320px (mimicking iPhone SE, Galaxy Fold external screen) and zoomed to 175%.
* **Failure Observed:**
  - The header theme toggles (`Minimalist`, `Dark`, `Colorful`) caused the navigation row to wrap onto two lines, colliding with the logo.
  - Form padding (2.5rem) caused inputs to become cramped, dropping width to under 240px.
* **User Experience Impact:** Cluttered interface, degraded first impression for recruiters reviewing candidates on mobile phones.

### Case 6: LocalStorage Security Exception (ST-09)
* **Stress Action:**
  - Simulated restricted cookie / private browsing environments (e.g. `window.localStorage` throws exception upon access).
* **Failure Observed:**
  - `localStorage.getItem('theme')` threw `DOMException: The operation is insecure`.
  - Uncaught exception halted page script execution, preventing subsequent JS listeners from attaching.
* **User Experience Impact:** Entire page interactivity broke on iOS Safari in strict privacy mode.

### Case 7: Social Share & Discoverability Gap (ST-10)
* **Stress Action:**
  - Ran link scrapers mimicking LinkedIn, Twitter/X, and Slack link unfurlers.
* **Failure Observed:**
  - The site shared as a plain generic link without an image preview, target role badge, or structured summary.
  - Search engines lacked canonical URLs and JSON-LD schema linking Pranitha R to AI Product Management.
* **User Experience Impact:** Invisible to technical recruiters sourcing via Google or sharing profiles internally on Slack/Teams.

---

## 3. Conclusion

Testing the happy path is easy; testing edge cases reveals that client-side resilience requires explicit defensive programming. The identified issues have been documented and handed off to [`TRIAGE.md`](TRIAGE.md) for immediate remediation.
