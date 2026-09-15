# Inquiry & email system upgrade

Your site already has a working enquiry inbox, reply system, email templates and admin area. Rather than rebuild it, this plan upgrades that foundation to the full specification, in four stages. Nothing on the public site changes visually except the contact, careers and media forms.

## What already exists (kept)
- Enquiry storage, threaded conversations, admin inbox with spam/trash, reply sending, sent mail, reply tracking, share stats
- Email templates with an admin editor and preview, auto-reply to visitors, notification to staff
- Google and email sign-in, admin-only access, secure CV storage with in-browser preview
- Managed email sending from your verified Veritas domain (already live and tested)

## Stage 1 - Enquiry records
- Add to the existing enquiry table: human-readable reference (VG-1001, VG-1002...), phone, country, service, preferred contact method, priority, assigned staff, source, first response time, closed time, email status, internal notes
- New tables: internal notes, activity timeline, audit log, and a proper email log (direction, addresses, provider id, status, error, timestamps)
- New roles: manager and staff alongside admin, with access rules enforced in the database (staff see only enquiries assigned to them)
- Every reference number is generated server-side and shown to the visitor on success

## Stage 2 - Public forms
- Contact form gains: organization, phone, country, inquiry type (the nine listed types), service of interest, subject, preferred contact method, consent checkbox, and attachments (PDF, DOC, DOCX, XLS, XLSX, PNG, JPG)
- Careers form gains position, LinkedIn and portfolio links alongside the CV upload
- A dedicated media enquiry form with publication, topic and deadline; a deadline marks it high priority
- Validation on the page and again on the server, rate limiting per visitor, and honeypot spam protection
- Routing table: business and security to business@, policy, risk, human rights and research to research@, careers to careers@, media to media@, everything else to info@

## Stage 3 - Staff dashboard
- Overview counters: total, new, in review, high priority, assigned, waiting, responded, closed
- Filters (date, department, type, status, priority, assignee, country) and search by name, organization, email, reference or subject
- Table view plus a full enquiry detail page: contact details, full message, attachments, conversation thread, internal notes kept visually separate, and an activity timeline
- Reply editor with attachments; sending updates status, records first response time and logs delivery
- Analytics page (by month, department, service, country, open vs closed, average response time) and CSV export
- Settings page for department addresses, signature, auto-reply on/off, reply templates, notification preferences, with info@ protected from deletion

## Stage 4 - Inbound mail and delivery events
- Secure webhook endpoints for delivery, bounce and failure events, with signature verification, feeding the email log
- Inbound handler matches the reference number in the subject to the right enquiry, or opens a new one routed by the address it was sent to, with loop protection
- An admin setup screen listing exactly which DNS records your email provider requires, shown only once the provider is connected - no invented values
- Written setup and testing guide inside the project

## Technical notes
- Existing `form_submissions` / `submission_messages` tables are extended, not replaced, so the current inbox keeps working throughout
- All sending stays server-side through the existing managed email service; provider settings move into one configuration module so a provider can be swapped later without touching feature code
- Role checks use a security-definer role function and row-level policies; anonymous visitors can only submit a form
- Attachments stay in the existing private bucket, reachable only through short-lived links for signed-in staff

## Still needs you
Receiving mail directly at info@ and the other addresses requires mail records on your domain, which is blocked until the nameserver change at your registrar is done. Until then, the reply-link flow already built stays as the fallback and every other part of this works.
