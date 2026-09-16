# NairaGuard Homepage Design System

## 1. Design Intent

NairaGuard should feel like a serious engineering and financial product with an editorial visual language.

Primary direction:

**Controlled editorial**

Secondary influence:

**Experimental brutalism, used selectively**

The website must not resemble a generic AI SaaS template.

Avoid:

- repetitive rounded cards
- excessive glassmorphism
- purple/blue AI gradients
- random 3D objects
- decorative cloud illustrations without meaning
- excessive floating blobs
- every section using the same card treatment
- animation for animation's sake

---

## 2. Color Direction

Primary palette:

- Black
- White
- Orange

Orange is an attention and action color, not a background color used everywhere.

Suggested semantic roles:

- Black: infrastructure, authority, depth
- White: clarity, information, breathing room
- Orange: financial attention, waste signals, actions, key transitions
- Muted neutrals: supporting information

The exact color values should be established as design tokens before implementation.

---

## 3. Layout Fundamentals

The homepage must establish a real layout system before decorative effects are introduced.

### Box model

Understand and deliberately use:

- content
- padding
- border
- margin
- `box-sizing`
- `content-box`
- `border-box`
- width and height
- min/max dimensions
- overflow
- intrinsic sizing

The default project baseline should use `border-box` unless a specific component has a reason to differ.

### Display

Use semantic display modes intentionally:

- block
- inline
- inline-block
- flex
- grid
- none
- contents where justified

### Flexbox

Use Flexbox primarily for one-dimensional relationships.

Examples:

- navigation rows
- button groups
- icon + label
- metric/value relationships
- horizontal alignment
- vertical stacks

Important properties:

- `flex-direction`
- `flex-wrap`
- `justify-content`
- `align-items`
- `align-content`
- `gap`
- `flex-grow`
- `flex-shrink`
- `flex-basis`
- `align-self`
- `order`

### Grid

Use CSS Grid primarily for two-dimensional composition and precise page-level alignment.

Important tools:

- `grid-template-columns`
- `grid-template-rows`
- `grid-template-areas`
- `grid-column`
- `grid-row`
- `gap`
- `minmax()`
- `repeat()`
- `auto-fit`
- `auto-fill`
- `fr`

A section may use Grid while a component inside it uses Flexbox.

### Positioning

Understand and intentionally use:

- static
- relative
- absolute
- fixed
- sticky
- containing blocks
- stacking contexts
- `z-index`

These are especially important for scroll storytelling and layered hero visuals.

---

## 4. Responsive Design

Responsive behavior is part of the design, not a final patch.

Consider:

- desktop
- tablet
- mobile
- narrow mobile
- landscape
- reduced motion
- touch targets
- text wrapping
- visual order
- chart readability
- horizontal overflow

Prefer fluid CSS where appropriate:

- `clamp()`
- `min()`
- `max()`
- `calc()`
- `%`
- `rem`
- `vw`
- `vh`
- `dvh`
- `svh`
- `lvh`
- `ch`
- `fr`

Do not create arbitrary breakpoint-specific copies of the same design.

---

## 5. Container and Grid System

The page should have a consistent outer container and alignment grid.

Sections may intentionally break out of that grid for editorial or brutalist moments, but the break must be deliberate.

Principle:

**Controlled disorder requires an underlying order.**

Use consistent left edges, column alignment, baseline relationships, and section rhythm before introducing asymmetry.

---

## 6. Spacing System

Establish a coherent spacing scale rather than arbitrary values.

Initial reference scale:

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96 / 128 / 160`

Use the scale as a system, not a prison. Large editorial whitespace may intentionally exceed it.

Spacing categories:

- micro spacing
- component spacing
- content spacing
- section spacing
- editorial spacing

---

## 7. Borders, Radius and Shadows

### Borders

Use borders as structural devices.

Possible treatments:

- no border
- subtle 1px border
- hard structural border
- orange accent border

### Radius

Do not put the same large radius on every component.

The visual language can combine:

- square editorial blocks
- small-radius utility components
- moderate-radius interactive elements
- occasional custom shapes

### Shadows

Prefer a mostly flat, border-driven visual language.

Use shadows only when they clarify depth or interaction.

---

## 8. Typography Roles

Typography is part of the product identity, not a finishing step.

Recommended role structure:

### Display

Hero and major editorial statements.

Candidate:

**Clash Display**

### UI / Body

Navigation, paragraphs, buttons, dashboard references, supporting text.

Primary candidate:

**Satoshi**

### Technical / Data

Small metadata, resource IDs, implementation notes, code-like values.

Candidate:

**JetBrains Mono** or another restrained monospace.

### Experimental accent

Use selectively for special editorial moments:

- Array
- Stardom
- Gambarino
- Boska

These should not become the default UI font.

---

## 9. Homepage Section Treatments

Every major section should have its own visual treatment while still belonging to the same system.

Suggested progression:

1. **Hero** — black, large typography, layered product/financial visual
2. **Problem** — white, editorial composition, strong USD/NGN contrast
3. **SEE** — structured data grid / product visualization
4. **FIND** — orange intervention, recommendation/waste story
5. **UNDERSTAND** — black/white financial conversion composition
6. **How it works** — editorial process layout
7. **Recommendation detail** — dense technical treatment
8. **Demo** — high-contrast invitation
9. **Technical credibility** — restrained engineering layout
10. **Final CTA** — dramatic black/orange composition
11. **Footer** — black, compact, structured

This sequence is directional. Final color ordering should follow the narrative rather than a rigid repeating pattern.

---

## 10. Hero Motion Story

The hero visual should communicate:

`AWS resources → spend → waste → potential savings → Naira context`

Possible implementation tools:

- GSAP for timeline/scroll orchestration
- Framer Motion for local UI transitions
- React Three Fiber / Three.js only where a genuine spatial visualization improves understanding
- CSS for lightweight effects

Do not use all tools merely because they are available.

---

## 11. Motion Rules

Motion must support:

- understanding
- hierarchy
- product identity
- perceived quality

Define before implementation:

- duration
- easing
- stagger
- distance
- scale
- opacity
- scroll progress
- reduced-motion behavior

No animation should hide or delay critical financial information.

---

## 12. Accessibility

The visual system must preserve:

- semantic HTML
- keyboard navigation
- visible focus states
- color contrast
- reduced-motion support
- meaningful alt text
- correct link/button semantics
- touch target sizes
- heading hierarchy
- readable chart labels

Experimental design does not justify poor accessibility.

---

## 13. Performance

The homepage may use advanced visual effects, but it must remain a fast product website.

Prefer:

- server-rendered static content where possible
- lazy-loaded interactive visuals
- limited client boundaries
- optimized images
- lightweight CSS effects before JavaScript effects
- selective 3D
- reduced motion when requested

Do not load large visual libraries for effects that CSS can perform well.
