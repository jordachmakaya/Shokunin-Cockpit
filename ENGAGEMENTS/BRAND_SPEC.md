# BRAND_SPEC.md — Shokunin Cockpit (V2, enterprise product system)

> **V2, 2026-06-24.** Product designer pass over the owner's V1 brand. The V1 sheet was an
> *editorial* identity for **index-ai** (warm paper, single teal, Lora display). This V2 keeps
> the owner's DNA — **warm paper + teal, flat, calm, confident** — and turns it into a
> **dual light/dark product design system** for a control surface: a real type scale, a full
> button hierarchy with states, status semantics built for `VERIFIED ≠ DECLARED`, and tokens
> ready for Tailwind v4 `@theme` (S3 `T3.1`). **Accent direction: teal monochrome enriched —
> no second brand hue; depth comes from a proper teal ramp + warm-neutral ramp.**
>
> V1 lineage preserved at the bottom (nothing lost).

---

## 1. Brand idea

A **calm control surface for AI-assisted work**. Editorial restraint (lots of whitespace, flat,
no neon) meets cockpit legibility (dense data, monospace numerals, unmistakable status). The
feeling: *quiet, exact, trustworthy* — software that proves rather than declares.

---

## 2. Color — teal ramp (the one brand hue)

Anchor `#1C6E6A` = **teal-600 = primary**. Everything else is a tint/shade of it.

| Token | Hex | Use |
|-------|-----|-----|
| teal-50  | `#EEF6F5` | faint wash, hovered ghost bg (light) |
| teal-100 | `#D6EAE7` | selected/active subtle bg (light) |
| teal-200 | `#AFD6D1` | soft borders on teal fills |
| teal-300 | `#80BBB4` | teal text/links on **dark** |
| teal-400 | `#4E9A92` | accents on dark; secondary border (dark) |
| teal-500 | `#2C7F78` | focus ring base; in-progress; primary on dark |
| **teal-600** | **`#1C6E6A`** | **primary buttons, key numerals, active accent** |
| teal-700 | `#155E5A` | primary hover; link text (light) |
| teal-800 | `#134E4A` | primary pressed; heading on teal fill |
| teal-900 | `#103F3C` | deep teal panels |
| teal-950 | `#0A2A28` | teal surface tint on dark |

## 3. Color — warm neutral ramp (carries the paper DNA)

Warm-tinted grays, anchored on the owner's paper `#F4F3EE` and ink `#191919`.

| Token | Hex | Use |
|-------|-----|-----|
| neutral-0   | `#FFFFFF` | cards (light) |
| neutral-50  | `#F7F6F2` | app background (light) — the warm paper |
| neutral-100 | `#EDEBE3` | alt surface / table header (light) |
| neutral-200 | `#E3E0D8` | borders / dividers (light) |
| neutral-300 | `#D3CFC4` | strong divider, disabled border |
| neutral-400 | `#A8A498` | faint labels, disabled text |
| neutral-500 | `#807C70` | placeholder, eyebrow |
| neutral-600 | `#6B6960` | muted body text (light) |
| neutral-700 | `#4B493F` | secondary text |
| neutral-800 | `#3F3E39` | body text (light) |
| neutral-900 | `#26251F` | strong text |
| neutral-950 | `#191919` | headings / primary ink (light) |

## 4. Color — dark theme surfaces (warm charcoal, never pure black)

| Token | Hex | Use |
|-------|-----|-----|
| dark-bg       | `#131310` | app background (dark) |
| dark-surface  | `#1B1B17` | cards (dark) |
| dark-surface-2| `#232320` | table header, insets (dark) |
| dark-elevated | `#2B2B26` | popovers/menus (dark) |
| dark-border   | `#34332C` | hairline borders (dark) |
| dark-border-2 | `#45443B` | strong border (dark) |
| dark-text     | `#ECEAE1` | primary text (dark) |
| dark-text-muted | `#A8A496` | muted text (dark) |
| dark-faint    | `#75736A` | faint labels (dark) |

## 5. Color — status semantics (status ONLY, never brand decoration)

Carries the owner's rule forward: green/red are status, not decor. V2 adds **amber** — also
**status-only** — because a control surface needs a third signal: *claimed-but-not-proven*.
Amber is **not** a brand accent; it never appears as decoration.

| Role | Light fg | Light tint bg | Dark fg | Dark tint bg | Meaning in the cockpit |
|------|----------|---------------|---------|--------------|------------------------|
| **success** | `#0F9E6E` (text `#0A3D2E`) | `#E5F5EF` | `#34D399` | `#0F2D24` | **VERIFIED** gate · project `done` |
| **warning** | `#B8740A` (text `#6E430A`) | `#FBF1DF` | `#F0B24A` | `#2E2410` | **DECLARED / UNVERIFIED** gate · stale |
| **error**   | `#D6362F` (text `#7A211C`) | `#FBE9E8` | `#F87171` | `#2E1714` | **BLOCKED** gate · invalid file |
| **info/brand** | `#155E5A` | `#EEF6F5` | `#80BBB4` | `#0A2A28` | **IN-PROGRESS** · active sprint |
| **neutral** | `#6B6960` | `#EDEBE3` | `#A8A496` | `#232320` | **TODO / not started** · missing |

> Gate-state map (the honesty rule made visual): VERIFIED = success · DECLARED = **amber** ·
> BLOCKED = error · IN-PROGRESS = teal · TODO/missing = neutral. Five visually distinct states;
> a *declared* gate can never be mistaken for a *verified* one.

---

## 6. Typography

Keep the owner's three families; assign them product roles.

- **Inter** — all UI/product text (weights 400/500/600). The cockpit's workhorse.
- **JetBrains Mono** — data, IDs, timestamps, file paths, code, numerals (400/500). Reinforces
  the cockpit feel and makes gate IDs / `lastUpdated` scannable.
- **Lora** (serif) — **reserved for marketing/editorial surfaces only** (landing, portfolio),
  **not** the cockpit chrome. Keeps brand lineage without making the product feel like a blog.

| Style | Font | Size / line | Weight | Tracking |
|-------|------|-------------|--------|----------|
| Display | Inter | 32 / 40 | 600 | -0.02em |
| H1 | Inter | 24 / 32 | 600 | -0.02em |
| H2 | Inter | 20 / 28 | 600 | -0.01em |
| H3 | Inter | 16 / 24 | 600 | 0 |
| Body-lg | Inter | 15 / 24 | 400 | 0 |
| **Body (base)** | Inter | **14 / 22** | 400 | 0 |
| Small | Inter | 13 / 20 | 400 | 0 |
| Caption/eyebrow | Inter | 12 / 16 | 500 | 0.06em · UPPERCASE |
| Mono/data | JetBrains Mono | 13 / 20 | 400–500 | 0 |

---

## 7. Spacing, radius, elevation, focus

- **Spacing** (4px base): 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64.
- **Radius**: sm 4 · **md 6 (default control)** · lg 8 (cards) · xl 12 · 2xl 16 · full 9999.
- **Elevation** (flat-first — surfaces stay flat; elevation only for floating layers):
  - `shadow-sm` `0 1px 2px rgba(25,25,25,.06)` — optional card lift
  - `shadow-md` `0 4px 12px rgba(25,25,25,.10)` — popovers / menus
  - `shadow-lg` `0 12px 32px rgba(25,25,25,.14)` — modals
- **Focus ring** (a11y, always visible): `0 0 0 2px var(surface)` + `0 0 0 4px teal-500/45%`.

---

## 8. Buttons — the full hierarchy (what the owner asked for)

**Sizes:** `sm` h28 / px12 / 13px · **`md` h36 / px16 / 14px (default)** · `lg` h44 / px20 / 15px.
Icon-only = square (28/36/44). Radius md(6). Gap 8. Loading = spinner replaces leading icon,
label dims, pointer-events off.

| Variant | When to use | Light: rest → hover → active | Disabled |
|---------|-------------|------------------------------|----------|
| **Primary** | The single main action of a view | bg `teal-600` / white → `teal-700` → `teal-800` | bg `neutral-200`, text `neutral-400` |
| **Secondary** | Alt to primary, still brand | transparent, border `teal-600`, text `teal-700` → bg `teal-50` → bg `teal-100` | border `neutral-200`, text `neutral-400` |
| **Tertiary** (neutral) | Non-brand actions (Cancel, filter) | bg `neutral-0`, border `neutral-200`, text `neutral-800` → bg `neutral-50` → bg `neutral-100` | border `neutral-200`, text `neutral-400` |
| **Ghost** | Toolbar / inline / icon | no bg/border, text `teal-700` → bg `teal-50` → bg `teal-100` | text `neutral-400` |
| **Destructive** | Irreversible (rare in read-only V1) | bg `error-500` / white → `error-600` → `error-deep`. Outline form: border/text `error` | bg `neutral-200`, text `neutral-400` |
| **Link** | Inline navigation | text `teal-700`, underline on hover | text `neutral-400` |

**Dark mappings:** Primary `bg teal-500` / text `#06201E`, hover `teal-400`. Secondary `border
teal-400` / text `teal-300`, hover bg `teal-950`. Tertiary `bg dark-surface-2` / border
`dark-border` / text `dark-text`. Ghost text `teal-300`, hover bg `dark-surface-2`. Destructive
`bg error-500` / white. Link text `teal-300`.

---

## 9. Core components (built in S3)

- **Card** — surface + `border` hairline + radius lg + padding 16/20; flat by default, optional
  `shadow-sm`.
- **Badge / Pill** — h20, px8, 12px/600 UPPERCASE 0.04em; status tint bg + on-color text.
- **GateChip** — status dot + label + (if verified) a `proof ↗` link; the five states of §5.
- **Input / Select** — h36, border `neutral-200`, radius md, focus ring; dark equivalents.
- **Table** — header `neutral-100` / `dark-surface-2`, hairline rows, mono for IDs/timestamps.
- **StatusBadge (project)** — `done` / `in_progress` / `blocked` / `not_started` per §5 map.

---

## 10. Tailwind v4 `@theme` (S3 — paste target for `app/assets/css/main.css`)

```css
@import "tailwindcss";

@theme {
  /* brand */
  --color-teal-50:#EEF6F5; --color-teal-100:#D6EAE7; --color-teal-200:#AFD6D1;
  --color-teal-300:#80BBB4; --color-teal-400:#4E9A92; --color-teal-500:#2C7F78;
  --color-teal-600:#1C6E6A; --color-teal-700:#155E5A; --color-teal-800:#134E4A;
  --color-teal-900:#103F3C; --color-teal-950:#0A2A28;
  /* warm neutrals */
  --color-neutral-50:#F7F6F2; --color-neutral-100:#EDEBE3; --color-neutral-200:#E3E0D8;
  --color-neutral-300:#D3CFC4; --color-neutral-400:#A8A498; --color-neutral-500:#807C70;
  --color-neutral-600:#6B6960; --color-neutral-700:#4B493F; --color-neutral-800:#3F3E39;
  --color-neutral-900:#26251F; --color-neutral-950:#191919;
  /* status (status-only) */
  --color-success:#0F9E6E; --color-warning:#B8740A; --color-error:#D6362F;
  /* type + radius */
  --font-sans:"Inter",ui-sans-serif,system-ui,sans-serif;
  --font-mono:"JetBrains Mono",ui-monospace,monospace;
  --radius-DEFAULT:6px;
}
```

Dark theme via a `.dark` class on `<html>` overriding surface/text tokens (CSS variables),
toggled by the cockpit; respects `prefers-color-scheme` as the default.

---

## 11. Usage rules (carried from V1, sharpened)

- One brand hue: **teal**. Everything else is neutral or status. No second decorative color.
- Flat surfaces; elevation only for floating layers. No gradients, no neon.
- Green/amber/red appear **only** as status. Amber = *declared/unverified/stale*, never decor.
- Generous whitespace; mono for data/IDs; Inter for UI; Lora for marketing only.
- Every interactive element has a **visible focus state** and AA contrast.

---

## 12. V1 lineage (preserved — index-ai editorial sheet)

Original single-accent editorial palette: teal primary `#1C6E6A`, dark `#155E5A`, deep `#134E4A`,
muted `#2F5D59`, soft `#E2ECEA`, soft border `#CFE0DD`; paper `#F4F3EE`, alt `#EDEBE3`, soft
`#FBFAF7`; ink `#191919`, secondary `#3F3E39`, muted `#6B6960`, eyebrow `#908C81`; status green
`#10B981`, red `#EF4444`. Fonts Lora / Inter / JetBrains Mono. Slogan options + the index-ai
NotebookLM prompt remain valid for **marketing** surfaces; this V2 governs the **product**.
