---
version: 4.1.0
name: Sun Yoga Studio — Quiet Luxury Wellness & Liquid Porcelain Rounded Glass Design System
description: Option A (Liquid Porcelain) concentric rounded glassmorphism design system combining Warm Pastel Zen surfaces, multi-layer optical frosted translucency, specular edge lighting, cursor-lit glass borders, and an ambient 60fps HTML5 Canvas zen breathing engine.
tokens:
  colors:
    # Canvas & Atmospheric Surfaces
    bg-canvas: "#FAF6F0"                             # Warm Oat Linen canvas
    bg-canvas-gradient: "linear-gradient(155deg, #FAF6F0 0%, #F4ECE1 52%, #EFE6DA 100%)"
    bg-surface-glass-start: "rgba(255, 253, 249, 0.80)" # Liquid Porcelain upper-left highlight
    bg-surface-glass-mid: "rgba(255, 252, 247, 0.52)"   # Optical translucent core
    bg-surface-glass-end: "rgba(255, 253, 249, 0.70)"   # Warm lower reflection
    bg-surface-well: "rgba(255, 253, 249, 0.46)"        # Inner frosted glass well
    bg-surface-card-fallback: "#FFFDF9"                 # Reduced-transparency solid fallback
    bg-sidebar: "rgba(250, 246, 240, 0.78)"             # Frosted warm sidebar
    bg-subtle: "#F3ECE1"                                # Warm sand container

    # Borders & Optical Rim Highlights
    border-glass-top: "rgba(255, 255, 255, 0.94)"       # 1.5px crisp top specular edge
    border-glass-rim: "rgba(255, 255, 255, 0.62)"       # 1px prismatic glass rim
    border-glass-outer: "rgba(61, 53, 46, 0.08)"        # Subtle warm contact ring
    border-well-rim: "rgba(255, 255, 255, 0.70)"        # Inner frosted well hairline
    border-subtle: "#E8DFD3"
    border-strong: "#DFD5C8"

    # Typography (Warm Onyx Scale — WCAG AA >= 4.5:1)
    text-primary: "#322B25"           # Deep warm onyx
    text-secondary: "#6D6156"         # Calibrated warm umber
    text-tertiary: "#96897C"          # Whisper caption & footnote
    text-inverse: "#FFFDF9"

    # Signature 3-Color Warm Pastel Zen Accents (No Purple)
    brand-terracotta: "#D48160"       # Primary Action & Liquid CTA
    brand-terracotta-deep: "#B86546"  # Hover / Active text
    brand-terracotta-subtle: "rgba(212, 129, 96, 0.16)"
    brand-ochre: "#C89452"            # Warm Sun Ochre ambient & warning
    brand-ochre-subtle: "rgba(208, 146, 68, 0.16)"
    brand-sage: "#4E6E54"             # Deep Biophilic Sage
    brand-sage-soft: "#8FA893"
    brand-sage-subtle: "rgba(114, 152, 121, 0.16)"

    # Semantic Status Badges
    status-active-bg: "rgba(114, 152, 121, 0.16)"
    status-active-text: "#4E6E54"
    status-active-dot: "#6E9B76"

    status-warning-bg: "rgba(208, 146, 68, 0.18)"
    status-warning-text: "#9E6420"
    status-warning-dot: "#D99438"

    status-danger-bg: "rgba(212, 114, 86, 0.18)"
    status-danger-text: "#B8523A"
    status-danger-dot: "#D97356"

    # Dark Obsidian Liquid Glass Overrides
    dark-bg-canvas: "#0E0E12"
    dark-surface-glass-start: "rgba(42, 40, 46, 0.74)"
    dark-surface-glass-mid: "rgba(24, 24, 30, 0.56)"
    dark-surface-glass-end: "rgba(34, 32, 39, 0.68)"
    dark-border-top: "rgba(255, 255, 255, 0.28)"
    dark-border-rim: "rgba(255, 255, 255, 0.14)"

  typography:
    family-display: "'Playfair Display', Georgia, serif"
    family-interface: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
    family-mono: "'JetBrains Mono', 'SF Mono', monospace"

  shadows:
    glass-card: "inset 0 1.5px 0 rgba(255, 255, 255, 0.94), inset 0 -10px 22px -14px rgba(255, 255, 255, 0.65), 0 18px 40px -20px rgba(66, 51, 38, 0.11), 0 3px 10px -4px rgba(66, 51, 38, 0.05), 0 0 0 1px rgba(61, 53, 46, 0.07)"
    glass-hover: "inset 0 1.5px 0 rgba(255, 255, 255, 0.98), inset 0 -12px 24px -14px rgba(255, 255, 255, 0.78), 0 24px 48px -18px rgba(66, 51, 38, 0.15), 0 6px 16px -6px rgba(66, 51, 38, 0.07), 0 0 0 1px rgba(212, 129, 96, 0.30)"
    glass-active-kpi: "inset 0 1.5px 0 rgba(255, 255, 255, 0.96), inset 0 0 18px rgba(217, 138, 108, 0.14), 0 16px 36px -14px rgba(212, 129, 96, 0.34), 0 0 0 1.5px rgba(212, 129, 96, 0.58)"
    glass-well: "inset 0 1px 0 rgba(255, 255, 255, 0.65), inset 0 2px 6px rgba(61, 53, 46, 0.03)"
    elevated-sheet: "inset 0 1.5px 0 rgba(255, 255, 255, 0.95), 0 -12px 44px rgba(48, 36, 26, 0.16), 0 -2px 10px rgba(48, 36, 26, 0.06)"
    liquid-cta: "inset 0 1.5px 0 rgba(255, 255, 255, 0.45), inset 0 -4px 10px rgba(154, 72, 42, 0.25), 0 10px 22px -8px rgba(204, 119, 87, 0.55)"

  radii:
    # Mathematical Concentric Curvature Scale (R_inner = R_outer - padding)
    xs: "8px"
    sm: "12px"
    md: "16px"
    card-inner: "19px"    # Frosted inset wells, schedule items, config rows
    lg: "24px"
    card-glass: "30px"    # All primary rounded liquid glass cards
    sheet-top: "32px"     # Mobile bottom sheet & modal corners
    pill: "9999px"        # Action CTAs, phone pills, badges, search inputs

  blur:
    glass-card: "24px"
    glass-well: "12px"
    glass-sheet: "34px"
    glass-wallpaper: "28px"

  motion:
    spring-physics: "cubic-bezier(0.22, 1, 0.36, 1)"
    spring-bounce: "cubic-bezier(0.34, 1.45, 0.64, 1)"
    duration-fast: "180ms"
    duration-normal: "320ms"
    duration-slow: "480ms"
---

# Sun Yoga Studio — Option A: Liquid Porcelain Rounded Glass Specification

## 1. Aesthetic Vision
Sun Yoga Studio blends calm, sun-washed organic wellness textures (Warm Oat Linen, Terracotta, Biophilic Sage) with modern concentric rounded frosted glass cards inspired by Apple macOS Sequoia / iOS 26 Liquid Glass approximations and Lucian UX/UI optical physics (`#001`, `#228`).

## 2. Core Pillars
- **Transparent Workspace + Warm Zen Breathing Canvas:** `.main-workspace` remains transparent over the 60fps HTML5 Canvas warm breathing orbs (Sun Ochre, Biophilic Sage, Terracotta Peach, Golden Sand — zero AI-purple) so every frosted card refracts living atmospheric light even without a custom wallpaper.
- **Concentric Rounded Geometry:** Every card obeys concentric curvature: `30px` outer glass card → `19px` inner frosted glass well → `9999px` pill actions and status badges.
- **Multi-Layer Optical Glass Physics:** Beyond plain `backdrop-filter: blur(24px) saturate(185%)`, every glass card combines a diagonal warm porcelain gradient fill, a `1.5px` crisp upper specular rim, a soft lower caustic bounce shadow, a top sheen crescent, and a desktop cursor-lit warm rim glow (Lucian `#228`).
- **Accessibility & Graceful Fallbacks:** WCAG AA `>= 4.5:1` contrast across Zen Orbs, Studio Wallpaper (`20%–90%` overlay), and Dark Obsidian themes; mobile touch targets `>= 40–44px` with `>= 8px` gaps; full `prefers-reduced-motion` and `prefers-reduced-transparency` fallbacks.
