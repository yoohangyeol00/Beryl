---
name: BERYL
colors:
  surface: '#f6faf8'
  surface-dim: '#d7dbd9'
  surface-bright: '#f6faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f2'
  surface-container: '#ebefed'
  surface-container-high: '#e5e9e7'
  surface-container-highest: '#dfe3e1'
  on-surface: '#181d1c'
  on-surface-variant: '#3d4a41'
  inverse-surface: '#2d3130'
  inverse-on-surface: '#eef2f0'
  outline: '#6d7a70'
  outline-variant: '#bccabe'
  surface-tint: '#006d43'
  primary: '#006d43'
  on-primary: '#ffffff'
  primary-container: '#00a86b'
  on-primary-container: '#00331d'
  inverse-primary: '#59de9b'
  secondary: '#2a6865'
  on-secondary: '#ffffff'
  secondary-container: '#b1eeea'
  on-secondary-container: '#316e6b'
  tertiary: '#006c52'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a782'
  on-tertiary-container: '#003326'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#78fbb6'
  primary-fixed-dim: '#59de9b'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#005232'
  secondary-fixed: '#b1eeea'
  secondary-fixed-dim: '#95d1ce'
  on-secondary-fixed: '#00201f'
  on-secondary-fixed-variant: '#084f4d'
  tertiary-fixed: '#79f9ce'
  tertiary-fixed-dim: '#5adcb3'
  on-tertiary-fixed: '#002117'
  on-tertiary-fixed-variant: '#00513d'
  background: '#f6faf8'
  on-background: '#181d1c'
  surface-variant: '#dfe3e1'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for BERYL (Business E-bidding & Resource Yield Link), a platform where institutional authority meets modern procurement efficiency. The brand personality is anchored in **Trust, Transparency, and Solidity**, mimicking the structural integrity and clarity of its gemstone namesake.

The visual style is a fusion of **Corporate Modern** and **High-Contrast Professionalism**. It utilizes expansive white space to denote transparency, while employing deep, solid colors to evoke a sense of permanence and reliability. The aesthetic avoids fleeting trends, opting instead for a "Digital Vault" feel—secure, precise, and authoritative.

## Colors
The palette is derived from the Beryl gemstone family, emphasizing the clarity of Aquamarine and the richness of Emerald. 

- **Primary (Emerald Green):** Used for primary actions, branding, and status indicators signifying "success" or "active."
- **Secondary (Deep Forest):** Provides the "Solidity" of the brand. Used for navigation bars, headers, and heavy typography to ground the UI.
- **Tertiary (Aquamarine):** An accent for highlights, hover states, and subtle background fills to prevent the UI from feeling overly heavy.
- **Surface & Neutrals:** All surfaces are tinted with a 2% Emerald hue (#F7FBF9) to maintain a cohesive environment. This off-white base reduces eye strain during long procurement cycles and reinforces the gemstone motif.

## Typography
This design system utilizes a tiered typography strategy to ensure maximum legibility and professional hierarchy. 

- **Headlines (Manrope):** Chosen for its modern, geometric construction that feels both approachable and highly engineered. Used for page titles and section headers.
- **Body (Work Sans):** A neutral, stable typeface that excels in data-heavy environments. Its slightly wider apertures ensure readability in complex bidding tables.
- **Labels (IBM Plex Sans):** A monospaced-adjacent grotesque used for technical data, metadata, and button labels to emphasize the "Business & Resource" aspect of the platform.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to maintain "Solidity" and control over information density, transitioning to a fluid model on mobile devices.

- **Grid:** A 12-column grid with a 24px gutter. For complex dashboards, a 4-column sub-grid is used within cards.
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Adaptation:** On mobile, margins shrink to 16px and columns collapse to a single-stack layout. Data-heavy tables should implement horizontal scrolling with a pinned first column to preserve context.

## Elevation & Depth
In alignment with the "Solidity" theme, this design system avoids floating elements. Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines**.

- **Surfaces:** Use `#FFFFFF` for the highest priority interactive cards, set against the `#F7FBF9` base background.
- **Borders:** Instead of heavy shadows, use 1px solid borders in `#D1E3DC`.
- **Shadows:** Only used for temporary overlays (modals, dropdowns). Shadows should be "Ambient"—very soft, using a deep forest green tint (#00241B) at 8% opacity to maintain the color narrative even in the shadows.

## Shapes
The shape language is **Soft (Level 1)**. Elements feature a 0.25rem (4px) base corner radius. This small radius provides a hint of modern refinement without sacrificing the "Industrial/Institutional" feel of sharp, professional corners. Large containers (cards) may scale up to 8px (rounded-lg) to soften the overall interface density.

## Components
Consistent execution across the following components is vital for the institutional integrity of the design system:

- **Buttons:** Primary buttons use the Emerald Green (#00A86B) with white text. Secondary buttons use a Forest Green outline. Interaction states should involve a subtle darkening of the green, rather than a color shift.
- **Input Fields:** Use a solid 1px border (#D1E3DC). On focus, the border thickens to 2px in Emerald Green with a very light Aquamarine glow.
- **Cards:** Cards are the primary container for bidding data. They should have a white background, a subtle emerald-tinted border, and no shadow unless hovered.
- **Chips/Badges:** Used for "Bid Status." Use low-saturation background tints of the primary colors (e.g., a pale emerald background with dark emerald text) to keep the UI clean.
- **Data Tables:** Use Zebra-striping with the surface-tint (#F0F7F4). Header rows should be Forest Green with white text to anchor the data.