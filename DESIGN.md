# EthAum — DESIGN.md

Premium International Healthcare · Calm Clinical · Modern Editorial Typography
Tagline: **Global Care. Closer to You.**

This file is the single source of truth for visual design. Components must use the tokens below. Never hardcode hex values inside components.

---

## 1. Principles

1. **Trust over flash.** Calm, quiet, readable. No neon, no glow, no gradients as decoration.
2. **Light first.** Light theme is the default. Dark theme is a carefully tuned alternative, not an inversion.
3. **One clear action per screen.** Each page has one primary button.
4. **Real content only.** No invented prices, providers, testimonials, statistics, accreditation badges or patient data. If data is missing, show a placeholder or an empty state.
5. **Status is never colour alone.** Always pair colour with a text label (and an icon where useful).
6. **Restraint.** Radius 8–12px, 1px borders, almost no shadows, no pill-shaped everything.

---

## 2. Colour tokens

### Light theme

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAFBF9` | Page background (warm white) |
| `--surface` | `#FFFFFF` | Cards, tables, inputs |
| `--surface-alt` | `#E8F0EB` | Soft sage bands, sidebar |
| `--text` | `#202C30` | Body text |
| `--text-heading` | `#174C4F` | Headings, brand |
| `--text-muted` | `#58686C` | Secondary text (passes 4.5:1 on bg) |
| `--border` | `#DFE6E2` | Hairlines |
| `--border-strong` | `#9DB3AE` | Outlined buttons, inputs |
| `--action` | `#247C78` | Primary button background |
| `--on-action` | `#FFFFFF` | Text on primary button |
| `--action-text` | `#1E6B67` | Teal text/links on light |
| `--info-bg` / `--info-text` | `#E1EEF7` / `#2F5F87` | Informational chips |
| `--warn-bg` / `--warn-text` | `#FBEFD5` / `#7A5200` | Waiting / attention |
| `--success-bg` / `--success-text` | `#DFF1E5` / `#1F5A34` | Completed |
| `--error-bg` / `--error-text` | `#FBE3E1` / `#8A2A22` | Failed / blocked |

### Dark theme

| Token | Value |
|---|---|
| `--bg` | `#0F1B1D` |
| `--surface` | `#172A2D` |
| `--surface-alt` | `#142427` |
| `--text` | `#E4ECEA` |
| `--text-heading` | `#F2F7F5` |
| `--text-muted` | `#9FB2B0` |
| `--border` | `#26393C` |
| `--border-strong` | `#3E5A5D` |
| `--action` | `#4FB3AC` |
| `--on-action` | `#0B1A1C` |
| `--action-text` | `#7CCBC4` |
| `--info-bg` / `--info-text` | `#1E3548` / `#A9CDEB` |
| `--warn-bg` / `--warn-text` | `#3A2E14` / `#F0CF8A` |
| `--success-bg` / `--success-text` | `#16341F` / `#9ED7B0` |
| `--error-bg` / `--error-text` | `#3F1D1A` / `#F2B1AA` |

Rules:
- Teal = brand and primary actions only. Sage = supportive bands. Blue = information only.
- Dark theme never uses pure `#000`. Avoid saturated green anywhere.
- Validate every text/background pair for WCAG 2.2 AA (4.5:1 body, 3:1 large text and UI borders).

---

## 3. Typography

- **Headings:** Manrope (600, 700, 800)
- **Body / UI / forms / tables:** Inter (400, 500, 600)
- Only these weights. No italics for emphasis in clinical text.
- Arabic (if enabled): IBM Plex Sans Arabic or Noto Sans Arabic, same scale, `dir="rtl"`.

| Token | Desktop | Mobile | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| `display` | 60px | 38px | 800 | 1.08 | -0.025em |
| `h1` (page) | 34px | 28px | 800 | 1.15 | -0.02em |
| `h2` (section) | 40px | 30px | 700 | 1.15 | -0.02em |
| `h3` (card) | 20px | 18px | 700 | 1.3 | -0.01em |
| `body-lg` | 18px | 17px | 400 | 1.6 | 0 |
| `body` | 16–17px | 16px | 400 | 1.55 | 0 |
| `small` | 14–15px | 14px | 400 | 1.5 | 0 |
| `label` | 13px | 13px | 600 | 1.4 | 0.08em uppercase (eyebrows only) |

Rules:
- Paragraph max width: 62ch. Hero paragraph max 520px.
- Heading margin-bottom: 12–20px. Section gap: 72–96px desktop, 48px mobile.
- Never go below 14px for clinical information. Numbers in tables use `font-variant-numeric: tabular-nums`.

---

## 4. Spacing, radius, elevation

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72, 96.
- Page gutters: 72px desktop, 32px tablet, 20px mobile. Max content width 1200px.
- Radius: `--radius-sm 6px` (chips), `--radius-md 8px` (buttons, inputs), `--radius-lg 12px` (cards, panels).
- Elevation: borders first. One soft shadow allowed for floating overlays only: `0 8px 24px rgba(0,0,0,.08)`.
- Touch targets: minimum 44×44px.

---

## 5. Components

**Button**
- Primary: `--action` bg, `--on-action` text, 600, radius 8, min-height 48.
- Secondary: transparent, 1px `--border-strong`, `--text-heading` text.
- Tertiary: text link in `--action-text` with arrow.
- One primary per view. Visible focus ring: 2px `--action` outline, 2px offset.

**Input / form**
- Visible `<label>` above field, 15px 600. Helper text 14px muted. Error text with icon, never colour only.
- Height 48px, 1px `--border-strong`, radius 8, focus ring as above.

**Card**
- `--surface`, 1px `--border`, radius 12, padding 24. No shadow. Do not create grids of identical cards for every section; use editorial layouts, lists with dividers, or tables.

**Table**
- Header 13px muted, row padding 14–16px, 1px row dividers, horizontal scroll container on small screens.

**Status badge**
- Radius 6, padding 4×10, 13px 600, text label required. Variants: info, warn, success, error, neutral.

**Navigation**
- Top nav: 72px tall, 1px bottom border, links 15px muted → heading colour on hover.
- App sidebar: 240px, `--surface-alt`, active item has surface + border.

**Alert**: 1px border, tinted background, icon + title + text. **Modal**: radius 12, focus trap, Esc closes. **Tooltip**: 14px, appears on focus as well as hover.

**Empty / loading / error states**: every list and table has all three. Skeletons respect reduced motion.

---

## 6. Page layouts

### Homepage (in order)
1. Nav
2. Hero: split layout, text left, real photography right with a small genuine product preview overlapping
3. Plain-language transparency strip (3 facts that are true in the product)
4. Four-step journey (numbered columns with top rule, not cards)
5. Provider discovery preview (real data only; empty state if none)
6. Patient-controlled records explainer (image + text, alternating)
7. Medical Case workflow
8. Quote comparison (table)
9. Consultation and aftercare
10. FAQ (accordion)
11. Final CTA band (deep teal)
12. Footer

### Patient dashboard
Overview → next recommended step banner → treatment journey stepper → upcoming consultation → records & sharing table → quotes → aftercare → messages/notifications. No decorative metrics.

### Provider
Profile (credentials only when verified), case list table, quote form, scheduling, record-access indicator ("Access granted by patient · date").

---

## 7. Imagery

**Style:** real, documentary, natural light, calm. People look unposed and professional. Clean clinical spaces. Warm neutral tones that sit well with teal.

**Avoid:** AI-generated people, stethoscope-on-white-background clichés, over-smiling stock models, dramatic neon travel photos, hospital logos you do not have rights to, anything implying a specific hospital partnership.

**Rules**
- Photos of people are illustrative. Never caption them as real EthAum patients or doctors.
- Use only licensed images (own photoshoot, or Unsplash / Pexels / commissioned). Keep license + author in `public/images/CREDITS.md`.
- Every `<img>` has meaningful `alt` text (decorative images use `alt=""`).
- Aspect ratios fixed with `aspect-ratio` to avoid layout shift; `loading="lazy"` below the fold; hero image `fetchpriority="high"`.
- Export WebP/AVIF at 1x and 2x; hero max 1600px wide, others max 1200px. Under 200 KB each where possible.
- Apply a consistent subtle treatment: no filters, same colour temperature. In dark mode, do not invert; optionally reduce brightness by 8–10%.

---

## 8. Accessibility

- WCAG 2.2 AA. Skip link, landmarks, one `h1` per page, logical heading order.
- Full keyboard operation, visible focus on every interactive element.
- `prefers-reduced-motion`: disable transitions over 150ms, parallax and autoplay.
- Support `prefers-color-scheme` with a manual toggle stored per user.
- RTL: use logical CSS properties (`margin-inline-start`, `padding-inline`), mirror icons that imply direction, test Arabic text expansion.
- Forms: associated labels, `aria-describedby` for hints/errors, never placeholder-only labels.

---

## 9. Implementation (Tailwind + CSS variables)

```css
:root {
  --bg:#FAFBF9; --surface:#FFFFFF; --surface-alt:#E8F0EB;
  --text:#202C30; --text-heading:#174C4F; --text-muted:#58686C;
  --border:#DFE6E2; --border-strong:#9DB3AE;
  --action:#247C78; --on-action:#FFFFFF; --action-text:#1E6B67;
  --info-bg:#E1EEF7; --info-text:#2F5F87;
  --warn-bg:#FBEFD5; --warn-text:#7A5200;
  --success-bg:#DFF1E5; --success-text:#1F5A34;
  --error-bg:#FBE3E1; --error-text:#8A2A22;
}
[data-theme="dark"] {
  --bg:#0F1B1D; --surface:#172A2D; --surface-alt:#142427;
  --text:#E4ECEA; --text-heading:#F2F7F5; --text-muted:#9FB2B0;
  --border:#26393C; --border-strong:#3E5A5D;
  --action:#4FB3AC; --on-action:#0B1A1C; --action-text:#7CCBC4;
  --info-bg:#1E3548; --info-text:#A9CDEB;
  --warn-bg:#3A2E14; --warn-text:#F0CF8A;
  --success-bg:#16341F; --success-text:#9ED7B0;
  --error-bg:#3F1D1A; --error-text:#F2B1AA;
}
```

Map these to Tailwind `theme.extend.colors` (e.g. `bg: 'var(--bg)'`) and set `fontFamily.heading = ['Manrope', ...]`, `fontFamily.sans = ['Inter', ...]`.

---

## 10. Definition of done

- No hardcoded colours outside the token files.
- Light and dark themes both pass AA contrast.
- All images have licenses recorded and alt text.
- No fake data anywhere. Existing tests and production build pass.
