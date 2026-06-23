---
name: Kinetic Workspace
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e5'
  on-surface: '#1b1b1e'
  on-surface-variant: '#56423d'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#8a726c'
  outline-variant: '#ddc0ba'
  surface-tint: '#a03f29'
  primary: '#a03f28'
  on-primary: '#ffffff'
  primary-container: '#c0573e'
  on-primary-container: '#120100'
  inverse-primary: '#ffb4a3'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#934a23'
  on-tertiary: '#ffffff'
  tertiary-container: '#b26138'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0700'
  on-primary-fixed-variant: '#812914'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb693'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#76330d'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e5'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 60px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
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
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 16px
---

## Brand & Style
The design system for Kinetic Workspace transitions from a sterile, tech-centric atmosphere to an organic, high-performance environment. The brand personality is grounded, sophisticated, and intentional. It aims to evoke the feeling of a bespoke physical study—warm, quiet, and focused—rather than a generic digital tool.

The design style is a blend of **Minimalism** and **Tactile Modernism**. It prioritizes heavy whitespace and structured layouts while using subtle tonal shifts and natural color palettes to create a sense of physical presence. The target audience includes creative professionals, architects, and executive teams who value deep work and a calm, uncluttered digital workspace.

## Colors
The palette is inspired by natural materials and earth tones to provide a "warm" professional aesthetic.

- **Primary (Terracotta):** Used for primary actions and active states. It provides a confident, human-centric energy.
- **Secondary (Amber):** Used for highlights, warnings, or secondary focal points. It adds a glow of approachability.
- **Tertiary (Wood Tone):** A deep, dark brown used for navigational elements or structural borders to anchor the UI.
- **Surface & Backgrounds:** The "Paper" background (#FAF9F6) replaces pure white to reduce eye strain during long desktop sessions.
- **Neutral:** A warm charcoal used for high-contrast text and primary iconography.

## Typography
The typographic hierarchy is optimized for desktop clarity and information density. 

**Manrope** provides a balanced, modern geometric feel for headings, while **Work Sans** ensures high legibility for long-form content and UI controls. **JetBrains Mono** is utilized sparingly for technical metadata, labels, and small UI indicators to provide a "precise" and professional tool-like feel. 

Large displays utilize aggressive negative letter-spacing to maintain a tight, editorial look. Body text uses a generous line height to promote readability on wide desktop monitors.

## Layout & Spacing
The design system employs a **Fixed Grid** philosophy for desktop browsers, centering content within a 1440px container to prevent excessive line lengths on ultra-wide monitors.

- **The 8px Rhythm:** All spacing, padding, and height values must be multiples of 8px.
- **Desktop Grid:** A 12-column system with 24px gutters.
- **Vertical Rhythm:** Large sections are separated by 80px or 120px to emphasize the "Minimalist" brand pillar.
- **Contextual Padding:** Components like cards and input groups should use 24px internal padding (3 units) to feel airy and premium.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Soft Ambient Shadows**. This design system avoids harsh blacks in shadows, opting instead for shadows tinted with the Tertiary (Wood) tone.

- **Level 0 (Surface):** The base canvas.
- **Level 1 (Cards/Panels):** Defined by a subtle 1px border in a pale terracotta-grey or a very soft, diffused shadow (Y: 4px, Blur: 12px, Opacity: 5%).
- **Level 2 (Dropdowns/Modals):** High elevation with a more pronounced shadow to create a clear separation from the background.
- **Interactive Depth:** Buttons use a slight "inset" shadow on hover to simulate a physical press, reinforcing the tactile nature of the workspace.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a professional, architectural precision while removing the "coldness" of sharp corners. 

- Large containers and cards should use `rounded-lg` (0.5rem) to soften the overall layout.
- Search bars and tags may use `rounded-xl` (0.75rem) to distinguish them as interactive, pill-like elements.
- Geometric icons should follow the same corner radius logic to maintain visual harmony.

## Components
- **Buttons:** Primary buttons use a solid Terracotta fill with white text. Secondary buttons use a transparent background with a 1px Wood-tone border.
- **Input Fields:** Use a subtle warm-grey fill (#F1F0EE) with a bottom-only border that thickens and changes to Amber on focus.
- **Cards:** White or very light cream backgrounds with a 1px border in a "Warm Sand" tone. No heavy shadows unless the card is being dragged.
- **Lists:** High density for desktop. Hover states should use a soft Amber-tinted background (2% opacity) to guide the eye.
- **Chips/Tags:** Use the Label-Caps typography. Backgrounds are muted versions of the primary/secondary colors to prevent them from competing with main actions.
- **Navigation Rail:** A vertical sidebar using the Tertiary Wood-tone as a background with low-opacity Amber icons to create a "warm-dark" workspace vibe.