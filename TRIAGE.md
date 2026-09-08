# Triage: Fix-Now vs. Known Limitations

**Candidate:** Pranitha R  
**Project:** Technical AI Product Manager Portfolio  
**Repository:** [https://github.com/pranitha-r/Flyrank-7.1](https://github.com/pranitha-r/Flyrank-7.1)  
**Track:** General AI Fluency | Week 7: Break Your Own Site  

---

## 1. Triage Framework

Engineering diligence requires ruthless prioritization. In a real-world product launch:
- **Fix-Now:** Critical bugs, security flaws, data loss risks, broken navigation, or accessibility blockers that degrade credibility or conversion.
- **Known Limitation:** Architectural trade-offs, edge cases handled gracefully via clear fallbacks, or dependencies on third-party constraints that do not justify scope creep.

---

## 2. Master Triage Matrix

| Item # | Issue Identified | Category | Classification | Priority | Decision Rationale |
|---|---|---|---|---|---|
| **TR-01** | Empty & Whitespace Form Bypass | Form Validation | **Fix-Now** | **P0** | Undermines core conversion flow; leads to empty spam in CRM. Must validate client-side with trim. |
| **TR-02** | Rapid Double-Click Race Condition | Concurrency / UX | **Fix-Now** | **P0** | Duplicate bookings/inquiries damage user trust and cause duplicate backend transactions. |
| **TR-03** | Malicious Input / Script Injection (XSS) | Security | **Fix-Now** | **P0** | Unsanitized payloads could execute if displayed in logs, admin views, or automated email templates. |
| **TR-04** | Invalid Email Format (`foo@bar`) | Data Integrity | **Fix-Now** | **P1** | Inability to respond to a recruiter who enters a malformed address loses business opportunities. |
| **TR-05** | Outdated Repository URL (`flyrank-6.1`) | Navigation | **Fix-Now** | **P0** | Reviewers clicking project code must land on the current Week 7 repository (`Flyrank-7.1`). |
| **TR-06** | Missing SEO, Social Preview & Schema | Findability | **Fix-Now** | **P1** | Core week deliverable. Social previews and JSON-LD drive discoverability by hiring managers. |
| **TR-07** | LocalStorage Crash in Private Browsing | Storage Resilience | **Fix-Now** | **P1** | Uncaught `SecurityError` halts JavaScript execution entirely on Safari Private mode. |
| **TR-08** | Mobile Header Wrapping on 320px Screens | Responsiveness | **Fix-Now** | **P2** | Ugly UI wrapping on smaller mobile devices hurts the candidate's technical brand. |
| **TR-09** | Message Length Overflow (>1500 Chars) | Form UI | **Fix-Now** | **P2** | Prevents layout distortion and sets expectations with live character counter. |
| **TR-10** | Backend Serverless Mail Delivery | Architecture | **Known Limitation** | **P3** | GitHub Pages is a static host. Without an active serverless backend, inquiries are safely cached in localStorage and coupled with direct Calendly & mailto fallback. |
| **TR-11** | Calendly Iframe Cross-Origin Styling | Styling / DOM | **Known Limitation** | **P3** | Browser security prevents altering CSS inside third-party `<iframe>` elements. Solved by offering native inquiry form alongside direct booking. |
| **TR-12** | Offline PWA Background Service Worker | Network Resilience | **Known Limitation** | **P3** | Service worker caching for 100% offline usage is out-of-scope for a 2-hour portfolio hardening checkpoint. |

---

## 3. Deep-Dive: Fix-Now Resolution Specifications

### 1. TR-01: Empty & Whitespace Validation
* **Resolution:** Implemented explicit trimming (`(val || '').trim()`) and field-level validation before form dispatch.
* **Success Criteria:** Blank or space-padded submissions are rejected; user is directed to the offending field with red border and explicit helper text.

### 2. TR-02: Double-Click Lockout & Debouncing
* **Resolution:** Added `isSubmitting` semaphore and timestamp cooldown window (`2500ms`). Submit button is immediately disabled with `aria-busy="true"`, button text changes to `"Submitting..."`, and a loading spinner animates. Subsequent clicks during cooldown display a warning toast.
* **Success Criteria:** Zero duplicate submissions possible regardless of click speed.

### 3. TR-03: Input Sanitization
* **Resolution:** Added `sanitizeInput()` utility converting HTML sensitive characters (`<`, `>`, `&`, `"`, `'`, `/`) into safe HTML entities before caching or forwarding.
* **Success Criteria:** XSS payloads like `<script>alert(1)</script>` are safely rendered as literal text without execution.

### 4. TR-04: Strict Email RFC Regex
* **Resolution:** Swapped native browser email check for standard RFC-5322 regex requiring valid domain and TLD structure.
* **Success Criteria:** Rejects `user@`, `test@localhost`, `@@`, and requires valid dots and domain endings.

### 5. TR-05: Update All Links to `Flyrank-7.1`
* **Resolution:** Updated all anchor links, footer references, and Open Graph canonical URLs from `flyrank-6.1` to `https://github.com/pranitha-r/Flyrank-7.1`.
* **Success Criteria:** All repo links load the Week 7 hardening codebase.

### 6. TR-06: Comprehensive SEO & Social Metadata Suite
* **Resolution:** Added high-res SVG social card (`assets/og-preview.svg`), SVG favicon (`assets/favicon.svg`), Open Graph tags, Twitter Summary Card, JSON-LD Schema (`Person` & `WebSite`), `robots.txt`, and `sitemap.xml`.
* **Success Criteria:** Pass social card validator; rich search card appears when parsed.

### 7. TR-07: Resilient LocalStorage Wrapper (`SafeStorage`)
* **Resolution:** Built a `try/catch` wrapper around `localStorage` operations with an in-memory dictionary fallback.
* **Success Criteria:** Theme switching and inquiry caching function flawlessly even when cookies and local storage are completely disabled.

### 8. TR-08: Responsive CSS for 320px Viewports
* **Resolution:** Media queries with CSS `clamp()`, reduced padding on mobile (from `2.5rem` to `1.25rem`), and concise button labels for small widths.
* **Success Criteria:** Zero horizontal scrolling down to 320px viewport width.

---

## 4. Deep-Dive: Known Limitations (Named & Justified)

### KL-01: Static Host Architecture (GitHub Pages)
* **What it is:** The portfolio is hosted as static files on GitHub Pages, which has no dynamic backend API or database.
* **Why it is not a Fix-Now:** Adding a Lambda / Vercel Serverless function or external backend would introduce third-party subscription dependencies, API key exposure, and cold-start latency for a lightweight portfolio.
* **How it is mitigated:** The portfolio implements a **multi-tier conversion strategy**:
  1. Instant direct calendar booking via Calendly.
  2. Direct email link via pre-formatted `mailto:`.
  3. Client-side form simulation with complete audit logging in `localStorage` and clear user confirmation.

### KL-02: Third-Party Widget Styling (Calendly Iframe)
* **What it is:** Calendly’s embed loads inside a cross-origin `iframe`, preventing parent CSS variables from modifying its internal fonts or calendar grid.
* **Why it is not a Fix-Now:** Cross-origin restrictions (CORS) are enforced by browser security policies and cannot be overridden by parent page CSS.
* **How it is mitigated:** Encapsulated Calendly inside a responsive container with an alternative native form option for users on slow or restrictive networks.

---

## 5. Reviewer Sign-Off

All **Fix-Now** items (TR-01 through TR-09) have been implemented and verified. All **Known Limitations** (KL-01 through KL-03) are transparently disclosed and defended.
