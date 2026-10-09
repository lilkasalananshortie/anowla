---
name: ANOWLA / ALWINYAH
description: Clinical Nursing & Medical Flashcard System with active recall, SM-2 spaced repetition, and in-browser PDF note synthesis.
colors:
  blush: "#F6E2E9"
  cream: "#FEFAF3"
  sage-light: "#B8CFB3"
  sage-primary: "#84A282"
  sage-hover: "#6E8C6C"
  dark-forest: "#18251A"
  dark-forest-surface: "#203023"
  dark-forest-border: "#2C4030"
  text-ink: "#19251A"
  text-muted: "#586C5A"
  text-faint: "#7D917F"
  border-subtle: "#DFE8DC"
  border-cream: "#EBF2E9"
  surface-card: "#FFFFFF"
typography:
  display:
    fontFamily: "Poppins, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Poppins, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Poppins, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
---

# Design System: ANOWLA Clinical

## 1. Palette Overview (Color Hunt #f6e2e9 #fefaf3 #b8cfb3 #84a282)

- **Deep Sage (`#84A282`)**: Primary action accent, main brand color, active tab indicators, and progress bars.
- **Soft Sage (`#B8CFB3`)**: Secondary accents, badge borders, subtle tag backgrounds, and gentle progress fills.
- **Blush Rose (`#F6E2E9`)**: High-alert medications, critical rationales, urgent review tags, and warm card highlights.
- **Ivory Cream (`#FEFAF3`)**: The core daylight background and light surface tone. Clean, calming, eye-strain reducing for long hospital shifts.
- **Dark Forest (`#18251A`)**: Deep contrast surface for the Hero section, editorial bands, docked night navbar, and footer.

## 2. Typography
- **Primary Typeface**: **Poppins** across the landing page, study workstation, PDF editor, and modals.
- Real weights: 400 (Regular body), 500 (Medium controls), 600 (Semi-bold labels/buttons), 700 (Bold titles and headings).

## 3. Strict Domain Rules
- **No Maths, No Coding**: Exclusively clinical nursing, pharmacology, pathophysiology, and medical-surgical care.
- **Active Recall**: Every deck contains front, back, distractors, clinical rationales, and high-yield mnemonics.
- **In-Browser Privacy**: All PDF note parsing occurs client-side via `pdfjs-dist`.

## 4. Layout & Device Adaptation
- **Mobile (< 768px)**: Single-column deck cards, horizontal swipeable folder pills, full touch targets (44px+).
- **Tablet (768px – 1024px)**: 2-column deck grids, adaptive split-pane PDF workspace.
- **Desktop (> 1024px)**: Docked navigation, 260px sticky sidebar, 3-column deck grid, and dual-pane clinical studio.
