# EthAum — Implementation Plan

## Phase 0 — Foundation

### Setup
- [ ] Create Git repository
- [ ] Create frontend
- [ ] Create backend
- [ ] Create docs folder
- [ ] Configure `.gitignore`
- [ ] Create environment files
- [ ] Create README
- [ ] Establish branch/commit workflow

### Frontend
- [ ] React + Vite
- [ ] Tailwind CSS
- [ ] React Router
- [ ] Axios
- [ ] Lucide React

### Backend
- [ ] Django
- [ ] Django REST Framework
- [ ] Virtual environment
- [ ] Base configuration
- [ ] Environment variable handling

---

# Phase 1 — Design System

- [ ] Colors
- [ ] Typography
- [ ] Buttons
- [ ] Inputs
- [ ] Selects
- [ ] Cards
- [ ] Badges
- [ ] Breadcrumbs
- [ ] Tabs
- [ ] Modal
- [ ] Toast
- [ ] Timeline
- [ ] File uploader
- [ ] Calendar
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

---

# Phase 2 — Public Experience

## Homepage
- [ ] Navbar
- [ ] Hero
- [ ] Search
- [ ] Trust strip
- [ ] Treatments
- [ ] Destinations
- [ ] How it works
- [ ] Why EthAum
- [ ] Medical Case story
- [ ] Testimonials
- [ ] FAQ
- [ ] Footer

## Treatment
- [ ] Treatment directory
- [ ] Search
- [ ] Filters
- [ ] Treatment detail

## Providers
- [ ] Provider directory
- [ ] Provider filters
- [ ] Provider profile

## Destinations
- [ ] Destination directory
- [ ] Destination detail

---

# Phase 3 — Authentication

- [ ] Login
- [ ] Signup
- [ ] Logout
- [ ] Session persistence
- [ ] Protected routes
- [ ] Patient role
- [ ] Provider role
- [ ] Admin role

---

# Phase 4 — Medical Case

- [ ] Create case
- [ ] Save draft
- [ ] Treatment selection
- [ ] Destination
- [ ] Budget
- [ ] Preferred date
- [ ] Medical history
- [ ] Case status
- [ ] Case detail
- [ ] Patient dashboard

---

# Phase 5 — Medical Records

- [ ] Upload
- [ ] File validation
- [ ] Storage
- [ ] Document category
- [ ] Record list
- [ ] Record preview
- [ ] Permissions
- [ ] Grant access
- [ ] Revoke access
- [ ] Access log

---

# Phase 6 — AI

Start with mocked responses.

- [ ] Document classification
- [ ] Case summary
- [ ] Missing information
- [ ] Matching explanation
- [ ] Quote normalization

Then connect Grok.

- [ ] AI service
- [ ] Backend API
- [ ] Structured JSON validation
- [ ] Error handling
- [ ] Logging
- [ ] Safety prompts

---

# Phase 7 — Provider Platform

- [ ] Provider dashboard
- [ ] Lead inbox
- [ ] Case detail
- [ ] Permitted records
- [ ] Quote builder
- [ ] Appointment management
- [ ] Messaging

---

# Phase 8 — Quotes

- [ ] Quote creation
- [ ] Quote items
- [ ] Included services
- [ ] Excluded services
- [ ] Quote validity
- [ ] Quote comparison
- [ ] Select provider

---

# Phase 9 — Consultation & Booking

- [ ] Doctor availability
- [ ] Calendar
- [ ] Time slots
- [ ] Consultation booking
- [ ] Booking status
- [ ] Confirmation
- [ ] Mock payment

---

# Phase 10 — Journey & Aftercare

- [ ] Journey timeline
- [ ] Treatment status
- [ ] Aftercare
- [ ] Follow-up reminders
- [ ] Document upload
- [ ] Provider contact
- [ ] Review request

---

# Phase 11 — Security

- [ ] Authorization
- [ ] Record permissions
- [ ] Access logging
- [ ] File validation
- [ ] Secret management
- [ ] API rate limiting
- [ ] Audit events
- [ ] Error handling
- [ ] Privacy UX

---

# Phase 12 — Testing

- [ ] Component testing
- [ ] API testing
- [ ] Authentication testing
- [ ] Case workflow testing
- [ ] File upload testing
- [ ] Permission testing
- [ ] AI failure testing
- [ ] Quote workflow testing
- [ ] Responsive testing
- [ ] Accessibility testing

---

# Phase 13 — Deployment

- [ ] Supabase production project
- [ ] Backend deployment
- [ ] Frontend deployment
- [ ] Environment variables
- [ ] Domain
- [ ] HTTPS
- [ ] Production database
- [ ] Storage policies
- [ ] Final smoke test

---

# Recommended Build Order

```text
UI
↓
Public Pages
↓
Authentication
↓
Medical Case
↓
Dashboard
↓
Backend
↓
Database
↓
Medical Records
↓
AI
↓
Provider
↓
Quotes
↓
Consultation
↓
Journey
↓
Security
↓
Testing
↓
Deployment
```

Do not start by building every feature simultaneously.
