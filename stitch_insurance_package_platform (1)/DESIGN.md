---
name: Kinetic Tech
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#40000d'
  on-tertiary-container: '#f23d5c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  success: '#10B981'
  warning: '#F59E0B'
  surface-alt: '#F8FAFC'
  border-subtle: '#E2E8F0'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter-mobile: 16px
  gutter-desktop: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1280px
---

## Brand & Style

This design system targets high-performance technology and developer-centric platforms. The brand personality is precise, technical, and forward-leaning, aiming to evoke a sense of focused productivity and "engineered" quality. 

The chosen style is **Modern Corporate with a Technical Edge**. It balances the reliability of structured enterprise layouts with the aesthetic cues of high-end developer tools. It utilizes a refined color palette, monospaced accents for metadata, and high-quality typography to ensure information density remains legible and aesthetically pleasing. The interface should feel like a high-precision instrument—efficient, responsive, and devoid of unnecessary decoration.

## Colors

The palette is anchored by a deep obsidian primary color, establishing a strong professional foundation. The secondary blue acts as the functional driver for actions and highlights, while the tertiary rose color is reserved for critical alerts or high-priority status indicators.

A sophisticated neutral scale ranging from slate to cool grays manages the hierarchy of secondary information and UI borders. Backgrounds primarily utilize pure white or the subtle "surface-alt" for layering, maintaining high contrast and clarity.

## Typography

This design system uses a tri-font strategy to differentiate intent. **Hanken Grotesk** provides a sharp, modern geometric feel for headings. **Inter** handles the heavy lifting of body copy with its exceptional legibility and neutral tone. **JetBrains Mono** is utilized for labels, metadata, and status indicators, reinforcing the technical and systematic nature of the product.

Hierarchy is established through tight line-heights in headings and generous leading in body text to promote scanning. Mobile headings should scale down aggressively to maintain layout integrity on smaller viewports.

## Layout & Spacing

The system follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. A strict 4px base unit (baseline grid) governs all internal component spacing to ensure mathematical harmony.

Layouts should favor vertical stacking on mobile and transition to multi-column arrangements at 768px (tablet) and 1024px (desktop). Use significant margins on desktop to prevent line lengths from becoming too wide for comfortable reading. Containers should be capped at a maximum width of 1280px for optimal readability on ultra-wide monitors.

## Elevation & Depth

This design system utilizes **Tonal Layers** supplemented by **Low-Contrast Outlines**. Rather than heavy shadows, depth is communicated through subtle shifts in surface color (e.g., moving from a white background to a "surface-alt" container).

Borders are the primary method of separation, using a 1px solid stroke in `border-subtle`. For floating elements like dropdowns or modals, a single, highly diffused "Ambient Shadow" is permitted (e.g., 0px 10px 25px rgba(15, 23, 42, 0.08)) to provide clear separation without breaking the clean, flat aesthetic.

## Shapes

The shape language is "Soft," utilizing small, precise corner radii that feel modern but structured. Small components like checkboxes and inputs use a 0.25rem radius. Larger containers, such as cards, utilize 0.5rem. Buttons are generally rectangular with soft corners; pill shapes should be avoided except for status "chips" or badges where high visual distinction is required.

## Components

### Buttons
Primary buttons use the obsidian primary color with white text. Secondary buttons use a `border-subtle` stroke with the primary color for text. Hover states should involve a subtle shift in background brightness rather than a color change.

### Input Fields
Inputs should have a 1px border and a subtle gray background. Upon focus, the border transitions to the secondary blue with a 2px outer "glow" or ring to signify activity.

### Chips & Badges
Utilize the `label-sm` monospaced font. They should be styled with a low-opacity background tint of their functional color (e.g., a success badge has a 10% opacity green background).

### Cards
Cards are defined by their `border-subtle` and lack of shadow. They should use `surface-alt` for header sections to provide internal hierarchy.

### Data Tables
Tables are critical to this system. Use `body-sm` for cell data and `label-sm` for headers. Headers should have a subtle bottom border and no vertical dividers. Rows should use a subtle highlight on hover to assist with tracking information horizontally.