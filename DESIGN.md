---
name: Sistema de Votacion Electronica Distribuido
description: Distributed electronic voting system for UNSA university elections
colors:
  primary: "#16213e"
  primary-hover: "#0f3460"
  civic-green: "#2d6a4f"
  civic-green-hover: "#1b4332"
  neutral-bg: "#f0f2f5"
  surface: "#ffffff"
  ink: "#1a1a2e"
  ink-muted: "#555555"
  ink-dim: "#999999"
  border: "#e0e0e0"
  border-light: "#eee"
  success-bg: "#d8f3dc"
  error-bg: "#f8d7da"
  error-text: "#842029"
  secondary: "#e0e0e0"
  secondary-hover: "#ccc"
  secondary-text: "#333333"
  list-hover: "#f8f9ff"
  list-selected: "#eef0ff"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.2rem, 3vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.3
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.4
  fine:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "50%"
spacing:
  xs: "0.3rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-success:
    backgroundColor: "{colors.civic-green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.5rem"
  button-success-hover:
    backgroundColor: "{colors.civic-green-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-text}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.5rem"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 0.8rem"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  list-item:
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  step-number:
    backgroundColor: "{colors.secondary}"
    textColor: "#666666"
    rounded: "{rounded.full}"
    size: "26px"
  step-number-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  step-number-done:
    backgroundColor: "{colors.civic-green}"
    textColor: "{colors.surface}"
---

# Design System: Sistema de Votacion Electronica Distribuido

## 1. Overview

**Creative North Star: "The Civic Booth"**

A well-lit voting station — transparent sightlines, deliberate sightlines, nothing between the voter and their choice. The interface steps aside and lets the act of voting feel consequential, not confusing. Every surface is clean and purposeful: Institutional Navy anchors authority, Civic Green marks progress, and white surfaces keep the focus on content. Shadows are subtle and earned — they appear only where interaction happens, not as decorative layering.

This system explicitly rejects corporate dashboard aesthetics, dark mode, gamified feedback, and any visual noise that competes with the voting task. It serves Spanish-speaking university students and faculty; the language is woven into the UI, not bolted on after the fact.

**Key Characteristics:**
- Civic trust through restrained authority colors, not visual density
- Progress as a visible, sequential journey through the 5-step flow
- Feedback on every action — loading, confirmation, error, result — never silence
- Mobile-scaled interactions, desktop layouts in one responsive pass
- Flat surfaces with interactive elevation: shadows only on hoverable elements, not on containers at rest

## 2. Colors

The palette splits cleanly into authority (navy), affirmation (green), and neutrality (white, light gray). The navy is the institutional backbone; the green is the signal that progress has been made.

### Primary
- **Institutional Navy** (`#16213e`): The foundational authority color. Used for header, primary buttons, active step markers, focus outlines, and list selection states. It anchors the UI without overwhelming it.
- **Institutional Navy Hover** (`#0f3460`): Slightly lifted navy for hover states on primary actions. Still within the same tonal family — no chromatic shift.

### Success
- **Civic Green** (`#2d6a4f`): Confirmation and completion. Used for the success button, completed step indicators, "OPEN" election status, and confirmation feedback.
- **Civic Green Hover** (`#1b4332`): Darker green for hover state on the success/confirm button. Maintains readability against white text.

### Semantic
- **Success BG** (`#d8f3dc`): Pale green background for confirmation banners and success alerts.
- **Error BG** (`#f8d7da`): Pale red background for login errors and failure states.
- **Error Text** (`#842029`): Dark red text on the error alert background — meets WCAG AA contrast.

### Neutral
- **Body BG** (`#f0f2f5`): The page background. Cool-tinted light gray that recedes behind the white card surfaces.
- **Surface** (`#ffffff`): Pure white for cards, step progress bar, and all container backgrounds where content lives.
- **Ink** (`#1a1a2e`): Primary body text — dark enough for comfortable reading, slightly blue-tinted to harmonize with the navy.
- **Ink Muted** (`#555555`): Secondary text, descriptions, metadata. High contrast against white surface.
- **Ink Dim** (`#999999`): Inactive items, loading placeholders, "no data" messages. The dimmest acceptable text.
- **Border** (`#e0e0e0`): Input borders, secondary button backgrounds, inactive step number backgrounds.
- **Border Light** (`#eeeeee`): List item dividers and subtle separation lines.
- **List Hover** (`#f8f9ff`): Very faint blue-tinted hover state on list items. Carries the navy hue at near-zero saturation.
- **List Selected** (`#eef0ff`): Slightly stronger blue tint for the actively selected list item.

### Named Rules
**The One Hue Rule.** The navy is the sole chromatic authority. The green is not a second accent — it is a semantic signal (done, confirm, success), not a decorative accent. If it marks completion, use Civic Green. For everything else, use Institutional Navy or a neutral.

**The Interactive Shadow Rule.** Shadows are earned by interaction, not by container type. Cards and containers sit flat at rest. Shadows appear on hovered buttons, focused inputs, and active interactive states. The only exception: the step progress bar carries a subtle (`0 1px 4px`) shadow to separate it from the content below, because it is the primary navigation affordance.

## 3. Typography

**Display / Body Font:** System UI stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)

**Character:** One clean, neutral sans-serif stack. No personality beyond clarity — the system fonts ensure native rendering speed and perfect legibility on every device. The typography is invisible, and that's the point: the voter reads the content, not the typeface.

### Hierarchy
- **Display** (`700`, `clamp(1.2rem, 3vw, 1.5rem)`, `1.2`): The header title. Only the app-level branding uses this size. Short, bold, authoritative.
- **Headline** (`600`, `1.2rem`, `1.3`): Section titles inside cards ("Iniciar Sesion", "Selecciona una Eleccion", "Votar"). One per card.
- **Title** (`600`, `1rem`, `1.4`): Election and candidate names in list items. Bold enough to stand out in the list without an extra heading.
- **Body** (`400`, `0.9rem`, `1.5`): Input values, button labels, description text. The everyday reading size. Capped at 65ch.
- **Label** (`600`, `0.85rem`, `1.3`): Form labels above input fields. Bold to associate clearly with the field below.
- **Caption** (`400`, `0.8rem`, `1.4`): Step names, secondary descriptions, timestamps. Lighter weight and smaller.
- **Fine** (`600`, `0.75rem`, `1.3`): Result bar percentages, vote counts in the results view. Bold for readability at small sizes.

### Named Rules
**The Tool Font Rule.** No custom typefaces. The system stack loads instantly, matches the OS chrome, and costs zero network requests. The interface is a tool, not a poster. A beautiful typeface would be a distraction, not an improvement.

## 4. Elevation

The elevation system is intentionally restrained. Depth is communicated through interactive state changes, not through stacked surfaces. Cards and containers are flat at rest — they rely on the card's white surface against the light gray page background for separation, not on drop shadows.

The one static exception is the step progress bar (`box-shadow: 0 1px 4px rgba(0,0,0,0.06)`), which sits above the card surfaces as the primary navigation affordance.

Interactive shadow layer:
- **Button Hover / Focus:** `0 2px 8px rgba(0,0,0,0.12)` — buttons lift slightly when hovered or focused. The shadow is soft and shallow, enough to signal responsiveness without floating.
- **Card** (`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`): The only static surface with a shadow. Just enough to distinguish the card from the background. Not interactive.

### Named Rules
**The Interactive Shadow Rule.** Surfaces at rest are flat. Shadows appear only as a response to state — hover, focus, active. The step progress bar is the sole exception because it serves as the primary navigation affordance across the flow.

## 5. Components

### Buttons
- **Shape:** Gently rounded corners (6px radius).
- **Primary:** Institutional Navy fill, white text. Hover transitions to `#0f3460` with soft shadow lift. Used for "Ingresar", "Register", and primary entry points.
- **Success:** Civic Green fill, white text. Hover transitions to `#1b4332` with soft shadow lift. Reserved for voting actions: "Votar" and "Si, votar".
- **Secondary:** Light gray (`#e0e0e0`) fill, dark gray (`#333`) text. Hover darkens to `#ccc`. Used for "Atras" (back), "Cancelar", "Volver a elecciones".
- **Disabled:** 50% opacity on all variants, `cursor: not-allowed`. Never a separate color — just faded out.

### Input Fields
- **Shape:** Gently rounded corners (6px radius). Full-width within their container.
- **Style:** White background, subtle gray border (`#ddd`). Comfortable padding (`0.6rem 0.8rem`). Clear placeholder text in Ink Dim.
- **Focus:** Navy border (`#16213e`), no glow or ring. The color shift from gray to navy is sufficient focus indication.
- **Label:** Bold (600 weight) at `0.85rem`, spaced `0.3rem` above the field. Dark gray (`#444`).

### Cards / Containers
- **Corner Style:** Generous radius (12px).
- **Background:** White (`#ffffff`).
- **Shadow Strategy:** `0 2px 8px rgba(0,0,0,0.08)` — soft, unobtrusive separation from the page background.
- **Internal Padding:** 2rem on all sides. Generous breathing room for the content within.
- **Header / Title:** Headline typography at the top of the card, inset with the padding.

### Lists (Election List, Candidate List)
- **Corner Style:** 8px radius on each list item.
- **Structure:** Unstyled list with bordered items. Each item is a clickable row.
- **Default State:** White background, `#eee` border, standard body text.
- **Hover State:** Faint blue-tinted background (`#f8f9ff`), navy border (`#16213e`). Indicates the item is actionable.
- **Selected State:** Stronger blue-tinted background (`#eef0ff`), same navy border. Selected item stays visually distinct.
- **Candidate List:** Horizontal layout with an avatar circle on the left, name and party on the right.

### Navigation (Step Progress Bar)
- **Style:** White card with subtle shadow, horizontal 5-step row. Steps connected by arrow symbols (`▶`) in `#ccc`.
- **Steps:** Each step has a numbered circle (26px, `#e0e0e0` background, `#666` text) and a label.
- **Active Step:** Navy circle, bold navy label text.
- **Completed Step:** Civic Green circle, green label text.
- **Inactive Step:** Gray circle, dim gray label text.

### Result Bars
- **Structure:** Horizontal bar row with candidate name (120px fixed), filled bar, and vote count.
- **Bar Container:** `28px` height, `#eee` background, 6px radius, overflow hidden.
- **Bar Fill:** Navy gradient (`#16213e` → `#0f3460`), white percentage text inside, 6px radius, 0.75rem bold.
- **Vote Count:** `0.85rem` text, Ink Muted color, right-aligned in 60px fixed width.

### Alerts
- **Shape:** 6px radius, comfortable padding (0.8rem).
- **Success Alert:** Pale green background (`#d8f3dc`), dark green text (`#1b4332`).
- **Error Alert:** Pale red background (`#f8d7da`), dark red text (`#842029`).
- **Placement:** Below the triggering form or action, never floating or toasting.

### Candidate Avatar (Signature Component)
- **Shape:** Perfect circle (40px, 50% radius).
- **Style:** Navy background (`#16213e`), white single-initial letter. Bold 0.9rem text, centered.
- **Context:** Appears only in candidate list items, on the left side before the name and party.

## 6. Do's and Don'ts

### Do:
- **Do** use Institutional Navy as the single authority color. Let it anchor headers, primary buttons, and active states.
- **Do** use Civic Green exclusively for completion and confirmation — done steps, success buttons, registered votes.
- **Do** keep surfaces flat at rest. Shadows signal interactivity.
- **Do** design for mobile first. Voting happens on phones between classes.
- **Do** give feedback on every voter action — loading spinner, success message, or error text.
- **Do** maintain WCAG AA contrast on all text: body text on white is `#1a1a2e` on `#ffffff` (≥10:1), label text on white is `#444` (~8.5:1), dim text on white is `#999` (~4.5:1).
- **Do** write every label, error, and instruction in Spanish. The interface is designed for the language it speaks.

### Don't:
- **Don't** use dark backgrounds or dark navbars. The header uses navy, but the page and all content surfaces are light. This is a civic tool, not a corporate dashboard.
- **Don't** use gradient text, glassmorphism, side-stripe borders, or any decorative effect. Ornament is visual noise for a voting interface.
- **Don't** gamify the voting flow. No confetti, no badges, no celebratory animations. Voting is a civic act, not a game.
- **Don't** use numbered section markers (01 / 02 / 03) above the step progress bar. The step bar IS the numbering; it already communicates sequence.
- **Don't** let text overflow its container. Test every heading at 375px viewport width. If it overflows, reduce the size or rephrase the copy.
- **Don't** rely on color alone for status. The step progress bar uses color + text label + checkmark/icon pattern to indicate done, active, and pending.
- **Don't** use the tiny uppercase tracked eyebrow pattern above any section. No "BIENVENIDO" or "VOTACION" kickers. Section hierarchy comes from heading weight and position, not from all-caps decoration.
