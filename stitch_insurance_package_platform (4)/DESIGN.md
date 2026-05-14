---
name: Kinetic Tech
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#454556'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#767588'
  outline-variant: '#c6c4d9'
  surface-tint: '#4040f2'
  primary: '#2218dc'
  on-primary: '#ffffff'
  primary-container: '#4040f2'
  on-primary-container: '#d5d4ff'
  inverse-primary: '#c0c1ff'
  secondary: '#5d5e65'
  on-secondary: '#ffffff'
  secondary-container: '#dfdfe7'
  on-secondary-container: '#616269'
  tertiary: '#464747'
  on-tertiary: '#ffffff'
  tertiary-container: '#5e5e5e'
  on-tertiary-container: '#d9d8d7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#06006c'
  on-primary-fixed-variant: '#2219dc'
  secondary-fixed: '#e2e2ea'
  secondary-fixed-dim: '#c5c6ce'
  on-secondary-fixed: '#191b21'
  on-secondary-fixed-variant: '#45464d'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for high-performance technology interfaces, blending **Corporate Modern** precision with a **Minimalist** clarity. The brand personality is authoritative yet agile, designed to evoke feelings of reliability, speed, and technical sophistication.

The aesthetic prioritizes functional beauty. It utilizes a disciplined layout, generous whitespace, and purposeful motion to guide users through complex data environments. The visual language is rooted in a "utility-first" mindset, ensuring that every element serves a clear cognitive purpose while maintaining a premium, developer-ready finish.

## Colors

The color palette is anchored by a high-energy vibrant blue, used strategically to denote action and brand presence. 

- **Primary (#4040f2):** Used for primary actions, active states, and key brand moments.
- **Dark Surface/Text (#181a20):** Applied to primary headings and deep background layers to provide grounded contrast.
- **Grey Accents (#717171):** Reserved for secondary body text, icons, and metadata to establish a clear content hierarchy.
- **Light Background (#f7f8fa):** The canvas for the UI, providing a soft, low-strain environment for extended use.
- **Border (#e0e0e0):** A subtle structural tool used to define zones without adding visual noise.
- **White (#ffffff):** Used for card surfaces and elevated containers to pop against the light neutral background.

## Typography

The typography system relies exclusively on **Hanken Grotesk**, a typeface chosen for its sharp geometry and exceptional readability in technical contexts. 

The hierarchy uses significant weight shifts (from 400 to 700) to distinguish between data and navigation. Large headlines feature tight letter-spacing to maintain a "compact" tech aesthetic, while small labels utilize increased tracking to ensure legibility in dense dashboards. Text color should strictly follow the color tokens: `#181a20` for headlines and `#717171` for secondary body copy.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop and a **Fluid** model for mobile.

- **Grid:** A 12-column grid system is used for desktop (1280px max-width) with 24px gutters.
- **Rhythm:** All spacing (padding, margins, component heights) must be a multiple of the 4px base unit. 
- **Adaptation:** On mobile devices, side margins shrink to 16px, and complex multi-column layouts reflow into a single vertical stack. 
- **Density:** Use `md` (16px) for standard component internals and `lg` (24px) for spacing between distinct content sections.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**.

1.  **Level 0 (Base):** The `#f7f8fa` background.
2.  **Level 1 (Cards/Surfaces):** White (`#ffffff`) surfaces with a 1px border of `#e0e0e0`. No shadows are used at this level to maintain a flat, professional look.
3.  **Level 2 (Overlays/Modals):** White surfaces with a soft ambient shadow (0px 8px 24px rgba(24, 26, 32, 0.08)).
4.  **Level 3 (Interactive):** Elements like primary buttons use a subtle inner glow or a very crisp 2px drop shadow on hover to indicate tactility.

Avoid heavy blurs; depth should feel architectural rather than organic.

## Shapes

The shape language is **Soft** and disciplined. A base radius of 4px (`0.25rem`) is applied to most UI components including input fields, buttons, and checkboxes. 

Larger containers like cards use an 8px (`0.5rem`) radius to create a nesting effect that feels structured. This subtle rounding softens the technical edge of the typography without losing the professional, "engineered" feel of the system.

## Components

- **Buttons:** Primary buttons use the `#4040f2` background with white text. Ghost buttons use `#e0e0e0` borders and `#181a20` text. All buttons have a 4px corner radius.
- **Input Fields:** Use a white background, `#e0e0e0` border, and 4px radius. On focus, the border transitions to `#4040f2` with a 2px outer glow.
- **Chips:** Small, 24px high elements with a `#f7f8fa` background and `#717171` text for tags; active chips switch to `#4040f2` with white text.
- **Lists:** Clean rows separated by 1px `#e0e0e0` dividers. Use `body-sm` for secondary metadata within list items.
- **Checkboxes/Radios:** Use `#4040f2` for the selected state. Checkboxes should be 16px squares with a 2px radius.
- **Cards:** White background, 8px radius, 1px `#e0e0e0` border. Use for grouping related data or dashboard modules.
- **Data Tables:** High-density layouts with `#181a20` for headers and `#f7f8fa` for alternating row stripes to improve scanability.