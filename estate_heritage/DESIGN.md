---
name: Estate & Heritage
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#39393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#d1c5b4'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#9a8f80'
  outline-variant: '#4e4639'
  surface-tint: '#e9c176'
  primary: '#ffdea5'
  on-primary: '#412d00'
  primary-container: '#e9c176'
  on-primary-container: '#6a4e0c'
  inverse-primary: '#775a19'
  secondary: '#e9c176'
  on-secondary: '#412d00'
  secondary-container: '#604403'
  on-secondary-container: '#dab36a'
  tertiary: '#e5e2e3'
  on-tertiary: '#303031'
  tertiary-container: '#c8c6c7'
  on-tertiary-container: '#535253'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4200'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e5e2e3'
  tertiary-fixed-dim: '#c8c6c7'
  on-tertiary-fixed: '#1b1b1c'
  on-tertiary-fixed-variant: '#474647'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  subtitle-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.15em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Montserrat
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  button-text:
    fontFamily: Montserrat
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is anchored in the concepts of **Authority & Heritage**, specifically tailored for high-end Caribbean legal services. The brand personality conveys absolute security, unwavering professionalism, and a multi-generational legal legacy.

The design style utilizes **Dark-Mode Minimalism** with a **Corporate / Modern** structure. It rejects superfluous ornamentation in favor of high-contrast typography and precise golden accents. The aesthetic evokes the atmosphere of a private legal vault: quiet, expensive, and secure. Visual interest is generated through the interplay between sharp geometric layouts and the timeless elegance of serif typography.

## Colors
The palette is deeply rooted in a dark, atmospheric spectrum to establish authority. The primary background (#131314) provides a non-distracting canvas, while secondary surfaces (#1B1B1C and #2A2A2A) create structural depth without the need for heavy shadows. 

**Gold Accents** (#E9C176 and #C5A059) are used sparingly but decisively for interactive elements, iconography, and structural dividers to symbolize the "Heritage" aspect of the brand. Text colors are slightly off-white to reduce eye strain in the dark environment while maintaining a high-contrast, prestigious feel.

## Typography
This design system employs a sophisticated typographic pairing to balance tradition and modernity.

- **Titles & Headlines:** Use **Playfair Display**. This serif typeface provides the "Heritage" and "Legal Authority" required for the brand. It should be used for large emotional statements and section headers.
- **Subtitles & UI Labels:** Use **Montserrat** with wide tracking and uppercase casing. This creates a refined, architectural feel for navigation and metadata.
- **Body & Data Entry:** Use **Inter**. Chosen for its exceptional legibility in dark mode and its neutral, systematic character, ensuring legal documents and inputs remain highly readable.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to maintain a sense of controlled, deliberate composition. 

- **Grid:** A 12-column grid system with 24px gutters.
- **Rhythm:** Spacing is strictly based on an 8px base unit. Vertical rhythm is generous to emphasize the minimalist, high-end nature of the service.
- **Desktop:** 1200px max-width container, centered with 48px outer margins.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins. Content should reflow vertically, and headlines should scale down to mobile variants to ensure legibility without excessive wrapping.

## Elevation & Depth
In this design system, depth is communicated through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows.

- **Surfaces:** Use `#1B1B1C` for primary cards/sections and `#2A2A2A` for elevated elements like hovering cards or dropdown menus.
- **Dividers:** Use 1px solid lines. For subtle separation, use 10% white. For primary structural separation or branding emphasis, use the Gold (#E9C176) at 0.5px or 1px thickness.
- **Focus States:** Depth is reinforced by a 1px Gold border on active input elements, creating a "glow" effect against the dark background.

## Shapes
The shape language is "Soft" yet disciplined. A **4px (0.25rem)** border radius is applied to buttons, cards, and input fields. This slight rounding softens the corporate edge without losing the professional, "legal-pad" rigidity. 

- **Standard Radius:** 4px (Used for buttons, inputs, and small modules).
- **Large Radius:** 8px (Used for primary content cards).
- **Icons:** Should be linear, 2px stroke weight, using Gold (#E9C176) for primary actions.

## Components

- **Primary Button:** Solid Gold (#E9C176) background with Dark (#131314) text. 4px radius, uppercase Montserrat bold. No shadows; the color contrast provides the hierarchy.
- **Secondary Button:** Ghost style with a 1px border (10% white/grey). Montserrat bold text in Primary Text color (#E5E2E2).
- **Input Fields:** Dark background (#1B1B1C) with a 1px grey border. On focus, the border transitions to Gold (#E9C176). The label is always visible above the input in Montserrat uppercase (label-caps).
- **Progress Bar:** A thin horizontal track. The progress indicator uses the Gold (#E9C176) hex. It should be positioned at the very top of the viewport or container to signify process flow in legal applications.
- **Cards:** Subtle background (#1B1B1C) with no border unless it is a featured item, in which case a 1px Gold border may be applied.
- **Footer:** A fixed, full-width container at the bottom of the page. It features the copyright "© ESTATE & HERITAGE LEGAL PARTNERS" and legal links in Montserrat (label-caps) using Secondary Text (#C5C6CB).