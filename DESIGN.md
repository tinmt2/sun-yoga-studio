---
version: 4.0.0
name: Sun Yoga Studio — Quiet Luxury Wellness & Apple Liquid Glass Design System
description: Ultra-premium wellness management aesthetic blending editorial serif elegance, Apple liquid glass translucency, responsive Figma auto-layout tokens, and an ambient HTML5 Canvas zen breathing engine.
tokens:
  colors:
    # Canvas & Atmospheric Surfaces
    bg-canvas: "#F9F8F5"              # Serene Alabaster Linen canvas
    bg-surface-glass: "rgba(255, 255, 255, 0.76)"  # Translucent Apple Liquid Glass
    bg-surface-card: "#FFFFFF"        # Solid crisp white elevated card
    bg-sidebar: "rgba(247, 246, 242, 0.88)" # Soft warm blurred sidebar
    bg-subtle: "#F2EFE9"              # Cashmere cream container

    # Borders & Dividers
    border-glass: "rgba(255, 255, 255, 0.80)" # Top-edge specular highlight
    border-subtle: "rgba(26, 29, 28, 0.08)"    # Hairline structural definition
    border-strong: "rgba(26, 29, 28, 0.16)"    # Interactive control boundary

    # Typography (Warm Onyx Scale)
    text-primary: "#181A19"           # Deep warm onyx
    text-secondary: "#5A615D"         # Calibrated slate sage
    text-tertiary: "#8F9692"          # Whisper caption & footnote
    text-inverse: "#FFFFFF"

    # Signature Luxury Accents
    brand-ochre: "#C28A4A"            # Warm Amber Gold / Sun Ochre
    brand-ochre-hover: "#AC7537"
    brand-ochre-subtle: "rgba(194, 138, 74, 0.12)"
    brand-sage: "#34624C"             # Deep Biophilic Emerald Sage
    brand-sage-subtle: "rgba(52, 98, 76, 0.12)"
    brand-lavender: "#665899"         # Serene Amethyst / Quartz Lavender
    brand-lavender-subtle: "rgba(102, 88, 153, 0.10)"

    # Semantic Status Badges
    status-active-bg: "#EDF5EF"
    status-active-text: "#265B3E"
    status-active-dot: "#2E7D32"

    status-warning-bg: "#FDF6EA"
    status-warning-text: "#A25F14"
    status-warning-dot: "#D9822B"

    status-danger-bg: "#FDF2F0"
    status-danger-text: "#B83228"
    status-danger-dot: "#E04838"

  typography:
    family-display: "'Playfair Display', Georgia, serif"
    family-interface: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
    family-mono: "'JetBrains Mono', 'SF Mono', monospace"

  shadows:
    glass-card: "0 4px 20px rgba(24, 26, 25, 0.04), 0 1px 3px rgba(24, 26, 25, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
    glass-hover: "0 14px 34px rgba(24, 26, 25, 0.08), 0 3px 8px rgba(24, 26, 25, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)"
    elevated-sheet: "0 -8px 40px rgba(24, 26, 25, 0.12), 0 -2px 10px rgba(24, 26, 25, 0.06)"
    gold-glow: "0 4px 18px rgba(194, 138, 74, 0.32)"

  radii:
    xs: "6px"
    sm: "10px"
    md: "14px"
    lg: "20px"
    xl: "28px"
    pill: "9999px"

  motion:
    spring-physics: "cubic-bezier(0.16, 1, 0.3, 1)"
    duration-fast: "180ms"
    duration-normal: "320ms"
    duration-slow: "480ms"
---

# Sun Yoga Studio — Quiet Luxury Wellness UI Specification

## 1. Aesthetic Vision
Sun Yoga Studio is designed as a tranquil digital sanctuary combining the calm grace of high-end wellness retreats (Aman, Six Senses, Equinox) with the ergonomic precision of Apple macOS Sequoia and iOS 18 liquid glass surfaces.

## 2. Core Pillars
- **Atmospheric Canvas (Ambient Zen Engine):** Soft organic gradient orbs breathing gently at 60fps in the background, creating depth and peace without distraction.
- **Editorial Typography Hierarchy:** Contrast between stately `Playfair Display` serif headers and ultra-clean `Plus Jakarta Sans` interface elements.
- **Translucent Optical Depth:** Layered frosted glass surfaces (`backdrop-filter: blur(28px)`) with specular light reflections along upper borders.
- **Spatial Spring Motion:** Every interaction (tab transition, sheet opening, card hover) operates with Apple-calibrated spring physics rather than mechanical linear fades.
