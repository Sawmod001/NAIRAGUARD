# NairaGuard Typography Research

## Research date

2026-09-16

## Objective

Select a contemporary typography system for NairaGuard that feels editorial, technical, premium, and distinctive without sacrificing readability.

The research focused heavily on Indian Type Foundry / Fontshare because the project specifically wants modern typefaces from that ecosystem.

---

## 1. Satoshi — Primary UI/body candidate

Satoshi is a contemporary sans-serif distributed by Fontshare and associated with Indian Type Foundry. Current references show a broad weight range and a strong fit for product UI, branding, and modern web interfaces. citeturn0search0turn0search13

Use for:

- body copy
- navigation
- buttons
- UI labels
- dashboard-adjacent marketing content
- supporting headings

Suggested initial weights:

- 400 Regular
- 500 Medium
- 700 Bold

The project-provided webfont direction should use the official Fontshare API format rather than an invented URL.

Reference pattern:

`https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap`

Verify the current Fontshare delivery and license terms before production release.

---

## 2. Clash Display — Primary display candidate

Clash Display is a display family from Indian Type Foundry / Fontshare with multiple weights and a stronger editorial presence than a neutral UI sans. Current type references describe it as suitable for brand-scale display work. citeturn2search0turn2search7

Use for:

- hero headline
- major section headings
- large editorial statements
- high-impact CTA typography

Suggested weights:

- 400
- 600
- 700

A Satoshi + Clash Display combination is a documented pairing and matches NairaGuard's desired hierarchy: expressive display + neutral UI/body. citeturn2search1

---

## 3. Cabinet Grotesk — Strong alternative display/UI candidate

Cabinet Grotesk is a characterful grotesque family in the Fontshare/ITF ecosystem with a wide weight range, including a variable version. It is especially interesting for editorial and branding work. citeturn2search2turn2search6

Potential use:

- alternate hero typography
- editorial headings
- experimental section titles

Do not use it simultaneously with Clash Display and Satoshi everywhere. Typography needs hierarchy, not font collecting.

---

## 4. Switzer — Neutral system alternative

Switzer is a variable Fontshare family associated with Indian Type Foundry and offers a more neutral system direction. citeturn1search0

Potential use:

- UI-heavy alternative
- product/application typography
- neutral body system if Satoshi becomes too distinctive

Not currently the primary homepage choice.

---

## 5. General Sans — Strong UI/body alternative

General Sans is another Fontshare/Indian Type Foundry sans with a broad weight range and a more classical grotesque character. citeturn2search4turn2search8

Potential use:

- UI/body
- technical marketing copy
- dense product explanations

It should be evaluated against Satoshi rather than automatically added to the final stack.

---

## 6. Array — Experimental display accent

Array is a Fontshare display family with wide and standard variants and multiple weights. citeturn2search9

Use sparingly for:

- oversized editorial numbers
- special section labels
- poster-like visual moments
- experimental typography

Do not use for body copy or dense UI.

---

## 7. Stardom — Experimental serif display accent

Stardom is a single-weight display serif designed for very large sizes and is positioned toward branding, experimental, fun, and poster applications. citeturn0search10turn3search9

Use only for:

- one-off editorial moments
- oversized statement words
- special transitions

It should not be a core interface font.

---

## 8. Gambarino — Narrow editorial accent

Gambarino is a narrow, single-weight serif intended for headlines and has a postmodern interpretation of the Garalde style. citeturn3search6turn3search7

Potential use:

- small number of editorial headlines
- visual contrast against Satoshi
- selected campaign-style moments

It should be used carefully because NairaGuard's primary identity remains technical rather than fashion/editorial.

---

## 9. Boska — Editorial serif alternative

Boska is a variable serif family associated with Indian Type Foundry and includes multiple weights and italics. citeturn3search0turn3search2

Potential use:

- editorial story section
- quote-like statements
- occasional large serif contrast

Not a default UI font.

---

## 10. Panchang — Technical/structural alternative

Panchang is a variable sans-serif family with a broad weight range. citeturn3search5

Potential use:

- experimental data labels
- technical display
- alternate heading system

It should be compared visually against Satoshi, Clash Display, and General Sans before adoption.

---

# Recommended NairaGuard typography direction

## Primary system

**Clash Display + Satoshi + restrained monospace**

### Clash Display

Hero and major editorial headings.

### Satoshi

Body, navigation, UI, supporting headings, buttons.

### JetBrains Mono or equivalent

Technical metadata, resource IDs, timestamps, code-like information, and selected data labels.

## Experimental layer

Use only when a section needs a deliberate typographic break:

- Array
- Stardom
- Gambarino
- Boska

The goal is not to make NairaGuard look like a typography showcase. The goal is to create a strong hierarchy that makes the product memorable.

---

# Font selection test before implementation

Before locking the final stack, render the following in each candidate:

1. `See where your AWS spend goes.`
2. `Find the waste.`
3. `Understand what it means in naira.`
4. `₦1,842,500`
5. `$1,187.40`
6. `41.4%`
7. `EC2 / RDS / EBS / S3`
8. `Estimated monthly savings`
9. `Implementation effort: Low`
10. `Last synchronized 14 min ago`

Evaluate:

- large-size character
- lowercase rhythm
- numeral design
- currency symbols
- punctuation
- uppercase labels
- dense UI readability
- line wrapping
- weight transitions
- letter spacing
- visual relationship between display and body faces

Do not finalize the typography stack from font names alone.
