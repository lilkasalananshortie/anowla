# 🎨 Alwinyah Design Specification & Style Guide

Based on the mobile/web design reference (`dwadwafwafaw.avif`).

---

## 1. Core Visual Identity & Aesthetics
* **Design Philosophy:** Tactile, playful, gamified, and modern bento-style cards.
* **Border Radii:** Extra-generous curves (`rounded-3xl` / `24px–32px` for cards, `rounded-full` for badges, tags, and progress bars).
* **Card Style:** Thick, tactile white cards (`bg-white dark:bg-zinc-900`) floating on rich, deeply saturated solid colored canvas backgrounds, paired with colorful pastel accent panels.

---

## 2. Color Palette & Theming

### Primary Theme (Deep Indigo - Screen 1 Reference)
* **Canvas Background:** `#14104c` / `#161356` (Deep Midnight Indigo)
* **Card Surfaces:** `#ffffff` (Pure White with subtle inset/drop shadows)
* **Secondary Surface (Dark):** `#201b63` / `#272275` (Tinted Indigo Surface)

### Accent Pastels (Cards & Charts)
* **Volt Lime:** `#d5f95f` / `#e2fa67` (Energetic accent, streak, active progress)
* **Sky Cyan:** `#9eeaff` / `#b3f0ff` (Deck categories, secondary metrics)
* **Soft Lilac:** `#d7c7fe` / `#e5d9ff` (Action buttons, floating dock highlights)
* **Blush Pink:** `#ffbad1` / `#ffc9db` (Heart/favorite, XP badges)
* **Coral Peach:** `#ff9e7d` (Notifications, highlights)

### Alternative Screen Themes (Supported Variants)
* **Plum Wine:** Canvas `#501538`, Accents Cream `#fff1d8` & Lilac `#e0cbfe`
* **Royal Violet:** Canvas `#573cb0`, Accents Lime `#d5f95f` & Cyan `#9eeaff`
* **Sage Olive:** Canvas `#506b56`, Accents Mint `#c8fad8` & Peach `#ffcaa8`

---

## 3. Typography Hierarchy
* **Font Family:** Modern Sans-Serif (`font-sans`, Geist / Inter).
* **Screen Titles:** Bold, clean, tight tracking (e.g. `text-2xl font-bold tracking-tight text-white`).
* **Card Titles:** High-contrast dark text (`text-base sm:text-lg font-bold text-zinc-900`).
* **Section Eyebrows / Labels:** Tiny, crisp, uppercase or muted titles (`text-xs font-semibold text-zinc-300`).
* **Metrics & Stats:** Chunky numbers (`text-2xl sm:text-3xl font-extrabold`).

---

## 4. Key Component Patterns

### A. Badge & Achievement Cards (Top Section)
* Horizontal white rounded-2xl/rounded-3xl cards.
* Left: Organic 3D / squircle icon with vibrant gradient (clover, star, flower).
* Middle: Title (e.g., "Recall Master", "Double Down") + slim progress bar + progress counter ("8 of 10 Cards reviewed").

### B. Bento Grid Study Decks (Middle Section)
* 2-column or 3-column rounded-3xl cards.
* Soft pastel header background (Lime, Cyan, Lilac) with bold condensed title, time estimate badge (`"5 min"`), and card count.
* Tactile hover animation (lifts upward with soft shadow).

### C. Gamified Progress Widgets
* Segmented chunky donut/ring charts or vertical pill charts showing daily review completion.
* Streak counter with animated flame and XP indicator.

### D. Floating Bottom Navigation Dock
* Deep rounded-full floating bar matching canvas background.
* Prominent oversized pastel center `+` button for creating new decks.
* Clean navigation icons with active indicator dots.

---

## 5. Micro-Interactions
* **Spring Transitions:** Smooth scale on tap (`active:scale-95`).
* **Card Flip / Reveal:** Smooth 3D perspective flip with crisp feedback.
* **Celebration:** Confetti burst upon deck completion.
