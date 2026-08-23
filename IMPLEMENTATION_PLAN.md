# KNT World Welfare Foundation — Implementation Plan

**Source of truth for remaining work.**  
Is file me tick update hota rahega. Naya kaam yahi se pick karna hai — har baar poochna nahi.

**Last updated:** 19 Aug 2026  
**Stack:** React (Vite) frontend · Express/MySQL backend · UPI screenshot donations · CMS JSON

**Legend**
- `[x]` complete
- `[ ]` pending
- `[-]` out of scope as custom code (vendor / legal / hosting)

---

## Phase 0 — Current MVP (already in product)

- [x] Public website (20+ routes), mobile responsive
- [x] Admin login (JWT + refresh cookie), Admin / Super Admin roles
- [x] CMS hub + CMS-only sidebar + Back to Admin Panel
- [x] Campaigns / crowdfunding (list, detail, donate modal, payouts)
- [x] Fundraiser requests (start form + admin approve/reject)
- [x] UPI QR + screenshot donation + admin verify
- [x] Receipt PDF on verify (pdfmake)
- [x] Enquiries inbox (contact form)
- [x] Gallery, Programs, Partners, Leadership, Certificates CMS
- [x] Donor login + donation history dashboard
- [x] User management + site settings (social + payment QR)
- [x] Vite `/api` proxy to backend `:5001`

---

## Phase 1 — Website + donation close-out

**Goal:** Public giving flow complete, content pages editable, mail ready.

### 1.1 Donations
- [x] Dedicated `/donate` page (amount, campaign, name/email/phone/PAN, QR, screenshot)
- [x] Home QR strip + Donate Now CTA
- [x] Navbar / footer / donor dashboard Donate links
- [x] Guest donor fields (`guest_name`, `guest_email`, `guest_phone`, `guest_pan`)
- [x] Live home stats from verified donations (`GET /donations/stats`)
- [x] SMTP mailer (skip if env empty, do not fail donation)
- [x] Thank-you email on donation create
- [x] Receipt email on admin verify
- [x] Enquiry alert email to `ADMIN_EMAIL`
- [ ] Configure real SMTP in `backend/.env` (host/user/pass/from) and test send
- [ ] Dedicated donation page: show selected campaign title after `?campaign=`
- [ ] Minimum amount / copy from Settings CMS (not hardcoded 100)

### 1.2 80G
- [x] Admin `/admin/80g` generate + download
- [x] Auto-generate 80G when PAN present on verify
- [x] Donor dashboard 80G download
- [x] 80G PDF uses official template (`uploads/80g_certificates/certificate.pdf`) with auto-filled donor name, INR, purpose, certificate no, date
- [x] PAN format validation (AAAAA9999A)
- [ ] Bulk FY issue + resend email

### 1.3 Blog / News
- [x] Admin CMS Blog (`/admin/cms/blog`)
- [x] Public `/news` + `/news/:slug`
- [x] Navbar + footer News links
- [ ] Cover image dedicated upload folder (`/uploads/blog/`) instead of gallery folder
- [ ] Draft vs published date edit
- [ ] Home page “latest news” strip (3 posts)

### 1.4 Documents & Policies
- [x] Admin library `/admin/cms/policies` (11 types, public/internal, PDF upload)
- [x] Public `/policies` with type filters
- [x] About dropdown + footer Policies
- [x] CMS PUT validation allows new section keys (`policies`, `blog`, …)
- [x] Seed first public PDFs (company profile, privacy, 80G copy) if files exist
- [x] About “Our Publications” books ko isi library se load karo (static `/books/*` hatao)

### 1.5 Remaining Phase 1 content gaps
- [x] Job application: real API + file upload + admin inbox (form abhi mock submit hai)
- [x] Vision & Mission page CMS (abhi static)
- [x] Home testimonials CMS (abhi hardcoded)
- [x] About Who We Are / Highlights CMS
- [x] Leadership founder block CMS (abhi static image)
- [x] Contact map already exists — keep; optional CMS lat/long later
- [x] Forgot password on `/login`
- [x] Admin notifications bell (abhi empty stub)

**Phase 1 exit:** SMTP tested, job applications stored, remaining static home/about blocks in CMS.

---

## Phase 2 — Donor CRM + finance

**Goal:** Donor 360 and auditor-ready money trail.

### 2.1 Donor CRM
- [x] Admin Donors list (search, last gift, total, 80G flag, tags)
- [x] Donor 360 page: gifts, campaigns, notes, staff follow-up
- [x] Capture address + PAN on every gift (guest + logged-in)
- [x] Annual donation statement PDF (FY) + email in April
- [x] CSV/Excel donor export

### 2.2 Finance
- [x] Donation register (date, mode, campaign, PAN, receipt no, 80G, print)
- [x] Receipt numbering series + letterhead/seal on PDF
- [x] Income & expense heads (not only campaign payouts)
- [x] Budget per program/project (allocated vs spent vs remaining)
- [x] Audit period export (donations + payouts + receipts)
- [x] Utilization certificate PDF
- [x] Admin financial dashboard (monthly trend, 80G issued, utilization)

**Phase 2 exit:** One FY can be closed with register + statements + 80G list.

---

## Phase 3 — People (membership, volunteers, HR)

**Goal:** New roles on top of `users`, not a second auth system.

### 3.1 Membership
- [x] Online membership form (type, fee, KYC, photo)
- [x] Member role + member portal (ID, certificate, renew, receipts)
- [x] Auto ID card PDF/PNG
- [x] QR membership card → `/members/verify/:id`
- [x] Membership certificate PDF
- [x] Renewal + expiry reminder email

### 3.2 Volunteers
- [x] Public volunteer registration + admin approval
- [x] Skills / availability
- [x] Volunteer dashboard (hours, assignments)
- [x] ID card (reuse membership template)

### 3.3 HR / employees
- [x] Employee portal (profile, docs, announcements)
- [x] Attendance (daily / QR check-in)
- [x] Leave apply / approve / balance
- [x] Welcome kit PDF + checklist
- [x] Career job applications inbox (from Phase 1.5) linked to hiring

**Phase 3 exit:** Member can join + download ID; volunteer can register; staff can mark attendance.

---

## Phase 4 — Office lite (documents, letters, QR verify)

**Goal:** File registry + letters. Not a government eOffice clone.

- [x] Searchable file registry (use unused `media_files` table)
- [x] Folders + roles (who can see internal policies)
- [x] Digital letter dispatch (template, number series, PDF log)
- [x] Digital seal image stamped on generated PDFs
- [x] QR-verified certificates (`/verify/:code` for 80G, membership, letters)
- [x] Letter email / WhatsApp send log

**Out of scope (do not custom-build)**
- [-] DSC USB token signing — vendor later if legally required
- [-] Government e-stamp issuance — upload stamped PDF only
- [-] Full file-movement eOffice product

**Phase 4 exit:** Public can scan QR on a certificate and see valid/invalid.

---

## Phase 5 — Projects, impact, dashboards

**Goal:** Extend campaigns; do not replace them.

- [x] Beneficiaries table (patient + student), link to campaign/program
- [x] Use existing unused `student_details` / campaign fields
- [x] Progress reports (dated updates + photos, optional public)
- [x] Project budget vs donations vs payouts
- [x] GIS lat/long on projects + map
- [x] Impact metrics CMS or computed (replace leftover static copy)
- [x] SDG tags on programs + public/admin SDG dashboard
- [x] CSR donor view (amount, utilization, branding)
- [x] Beneficiary dashboard
- [x] Volunteer dashboard (after Phase 3)
- [x] Home live donation counter polish (animated, last gift)

**Phase 5 exit:** Admin can open one project and see people, money, photos, location.

---

## Phase 6 — Payments, comms, security (when confirmed)

### 6.1 Payment gateway (SBI ePay — fill credentials in `.env` when SBI issues them)
- [x] Create order + checkout
- [x] Webhook / return URL + decrypt + auto-mark donation verified
- [x] Keep UPI screenshot as fallback path
- [x] Refund / failed payment states

### 6.2 Communication
- [x] Mail templates admin-editable
- [x] Mail send log in admin
- [x] WhatsApp widget (existing floating contact) — keep
- [-] Custom live-chat server — use Tawk.to / WhatsApp, do not build

### 6.3 Auth / security
- [x] Forgot / reset password
- [x] Email verification on register
- [x] Optional admin 2FA
- [x] Guest donation identity required (name+email already on `/donate`; enforce on campaign modal too)

**Phase 6 exit:** Gateway wired for SBI ePay (goes live when merchant ID + encryption key are set); UPI fallback remains; password reset works.

---

## Ops / hosting (not app modules)

- [-] Official domain + DNS (ops)
- [-] Professional mailbox IDs (ops)
- [-] SSL + HTTPS on Hostinger (ops)
- [-] Cloud hosting deploy API + frontend + MySQL + `uploads/` disk (ops)
- [ ] Production `.env` SMTP, JWT, DB, `CLIENT_URL`
- [ ] Uploads backup policy

---

## Admin information architecture (target)

| Sidebar group | Items | Status |
|---------------|--------|--------|
| Operations | Dashboard, Campaigns, Requests, Donations, Enquiries | Done |
| CMS hub | Overview + existing CMS + Blog + Policies | Done |
| Donors | Donor CRM, Receipts inbox, 80G, Annual statements | Done |
| Finance | Register, Budgets, Expenses, Audit, UC | Done |
| People | Members, Volunteers, Employees, Attendance, Leave, Job applications | Done |
| Office | File library, Letters | Done |
| Insights | Financial, Beneficiary, Volunteer, CSR, SDG | Done |

---

## Public routes to add (remaining)

- [x] `/donate`
- [x] `/news`, `/news/:slug`
- [x] `/policies`
- [x] `/membership`
- [x] `/volunteer`
- [x] `/members/verify/:id`
- [x] `/verify/:code`
- [x] `/impact`
- [x] `/donate/status/:id`
- [x] `/verify-email`

---

## Immediate next coding slice (do in this order, no extra questions)

1. [x] Job applications API + admin inbox (Phase 1.5)
2. [x] CMS: Vision & Mission, testimonials, About remaining static blocks
3. [ ] Home latest-news strip
4. [x] 80G PDF branding from official template with donor auto-fill
5. [x] Then Phase 2 Donor CRM (unless SMTP/gateway credentials arrive)

---

## How to use this file

- Kaam complete hone par yahi checkbox `[x]` karo.
- Naya scope add ho to sahi phase ke neeche bullet add karo.
- Payment gateway / SMTP secrets milte hi Phase 6.1 / 1.1 SMTP test pehle karo.
