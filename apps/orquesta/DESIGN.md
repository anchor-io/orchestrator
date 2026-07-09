# Design System: Kura Component System

## 1. Visual Theme & Atmosphere

A dark, framed-grid interface for dense application development. The atmosphere is
precise, dense, and restrained — off-black panels, thin structural lines, plain
component-focused copy, and one signal accent. The design is terse first, decorative second.

- **Density:** Operational, 8/10. Information is compact, sections stay tight, and
  components use the minimum padding that reads as intentional. Air comes from layout
  grid gaps, not from generous component padding.
- **Variance:** Offset Asymmetric, 7/10. Heroes and major sections use uneven columns,
  wide empty cells, and offset visual blocks.
- **Motion:** Fluid CSS, 5/10. Motion is deliberate, short, and tied to state.

> **Style lineage:** Adapted from the shadcn-svelte Lyra style with
> kuracomps-specific deviations: pill buttons via `<PillButton>`, citron soft accent
> bar on alerts, Signal Citron wash for table selection, `.hairline-frame` inset
> light on surfaces, and `bg-black/10` lighter overlays. Typography is Lyra-derived
> (sans, normal-case, `text-sm font-medium` for nav and `text-xs font-medium` for
> section labels); mono is reserved for code and data only.

## 2. Color Palette & Roles

- **Off-Black Canvas** (`#08090B`) - page background and dominant viewport color.
- **Panel Charcoal** (`#0D0F12`) - cards, popovers, modal surfaces, and framed panels.
- **Control Charcoal** (`#15171B`) - inputs, muted cells, quiet table rows, inactive
  tabs.
- **Raised Zinc** (`#202328`) - hover rows, secondary surfaces, and selected-adjacent
  fills.
- **Structural Border** (`#262A30`) - 1px panel borders, grid divisions, menu borders.
- **Primary Ink** (`#F4F4F5`) - headings and high-priority text.
- **Muted Steel** (`#A3A7AE`) - body copy, helper text, metadata.
- **Signal Citron** (`#B9D765`) - the only accent. Use for primary actions, active
  states, focus rings, selected controls, and sparse data highlights.
- **Signal Soft** (`#D0E891`) - link hover, chart contrast, and small highlight text.
- **Signal Deep** (`#708936`) - low-emphasis accent fills and chart secondary values.
- **Operational Green** (`#38B66B`) - success and healthy sync states only.
- **Warning Ochre** (`#D1AA24`) - warning, drift, and attention states.
- **Destructive Red** (`#F85149`) - destructive actions and inline validation errors.

Maximum one accent color is allowed.

## 3. Typography Rules

- **Display:** Geist Variable. Large headings use weight `600`, tight line-height
  (`0.95` to `1.05`), and balanced wrapping.
- **Body:** Geist Variable. Body copy uses relaxed leading (`1.65` to `1.8`) and max
  width near `65ch`.
- **Mono:** system monospace stack. Use for code, keyboard shortcuts, technical
  metadata, and real metric numbers. Component labels (buttons, badges, card titles,
  menu items, tab triggers, nav links, and the logo wordmark) use the sans body font.
- **Section labels:** sidebar section titles and the on-this-page heading use sans,
  normal-case `text-xs font-medium text-muted-foreground`. Section labels must name the section, not the UI
  affordance. Do not use decorative slash labels like "// system" or vague headers
  like "audit-ready".
- **Header:** the site header is a single shared component (`$lib/components/header.svelte`)
  used on both the landing page (non-sticky) and docs (sticky). Logo is a lowercase
  "kura" wordmark in Geist semibold, normal-case. Nav links are sans `text-sm
font-medium`, `text-muted-foreground` → `text-foreground` on active. The header
  carries a theme toggle and a GitHub link on the right; docs additionally render a
  mobile navigation drawer (existing `sheet`, `side="left"`) via a snippet slot.
- **Banned:** Inter, generic serif fonts, oversized all-caps paragraphs, and
  proportional metric numbers.

## 4. Component Stylings

- **Buttons:** Sharp corners (`rounded-none`) across all variants. Primary uses Signal
  Citron fill with dark text. Outline stays dark with a thin border. Active feedback
  uses a 1px downward translate. Focus rings are `ring-1 ring-ring/50` (light, not
  heavy). No neon outer glow. Pills are an opt-in affordance via `<PillButton>`,
  restricted to `default` and `outline` action variants, used for destination CTAs
  (onboarding, hero, modal confirm, empty-state). Do not use pills in toolbars, button
  groups, tables, or inline in text.
- **Cards and panels:** Use cards only for real hierarchy. Default surface is Panel
  Charcoal with the `.hairline-frame` utility (1px `ring-foreground/10` ring + inset
  top-edge light). No drop shadow on cards. Prefer grid cells, top rules, and dividers
  over floating card stacks. All framed surfaces (cards, dialogs, popovers, menus,
  sheets, tooltips) share the same `.hairline-frame` treatment.
- **Badges:** Compact `h-5` labels with `text-xs font-medium` (sans, normal-case).
  Default badge uses a restrained citron tint (`bg-primary/15 border-primary/45`), not
  a solid citron fill. Avoid marketing-style pills for large groups.
- **Inputs and forms:** Label above input, helper text below when useful, inline error
  text below the field with `role="alert"`. Focus ring uses Signal Citron at low
  opacity (`ring-1 ring-ring/50`). No floating labels.
- **Menus and overlays:** All overlay content shares Panel Charcoal, `.hairline-frame`
  hairline, `z-50`, and short transform/opacity entrance. Modal overlays use
  `bg-black/10 backdrop-blur-xs` (lighter dim — lets the grid show through, preserves
  workspace context). Reuse the same selected/focus color across command, dropdown,
  context menu, menubar, tabs, and calendars.
- **Alerts:** Lyra-density framed boxes (`px-2.5 py-2 gap-0.5`) with a preserved left
  accent bar (`after:bg-link` for default, `after:bg-destructive` for destructive).
  The accent bar distinguishes alerts from cards at a glance.
- **Tables and data:** Use mono numbers with tabular rhythm. Hover rows use Raised
  Zinc (`hover:bg-accent`). Selected rows use Signal Citron wash
  (`bg-primary-wash` at `0.16` alpha), not full neon fills.
- **Loaders:** Prefer skeletons that match the final layout shape. Spinners are allowed
  only as tiny inline status indicators.
- **Empty states:** Compose icon/media, short title, explanation, and one action.
  Never show only "No data".
- **Errors:** Direct, calm, sentence-case text. No "Oops", no exclamation marks.

## 5. Layout Principles

- Use CSS Grid for all page-level layout. Avoid flex percentage math.
- Max content width is `80rem` to `88rem`, centered.
- Major sections are framed by full-width horizontal rules and internal grid lines.
- Hero sections are asymmetric.
- Full-height screens use `min-height: 100dvh`, never `height: 100vh`.
- Mobile puts content before navigation. Navigation can follow as a component map or
  collapse into a compact switcher.
- **Docs page:** three panes (sidebar `18rem` | content | TOC `14rem`) on a single
  balanced `gap-8` gutter. Content is capped at `max-w-2xl` in every breakpoint so it
  never stretches past a readable measure; the desktop TOC appears at `xl` and the
  sidebar at `lg`. Below `xl`, an inline collapsible `<details>` "On this page"
  (`$lib/components/docs/mobile-toc.svelte`) sits between the doc header and the
  markdown so mobile readers can still jump sections. The desktop table of contents
  (`$lib/components/docs/toc.svelte`) flattens the velite TOC tree, indents by depth,
  and highlights the active heading via a citron indicator bar that slides to the
  active link.

## 6. Motion & Interaction

- Default transition duration: `200ms` for controls, `300ms` for section reveals.
- Preferred easing: `cubic-bezier(0.22, 1, 0.36, 1)` for entry and overlay motion.
- Spring-feel target: stiffness `100`, damping `20` when using motion primitives.
- Animate only `transform` and `opacity`; never animate layout properties.
- Lists should cascade in small delays when introduced.
- Active surfaces may use subtle shimmer or pulse, but only inside bounded cells.
- Respect reduced motion by removing loops and keeping state changes instant but clear.

## 7. Responsive Rules

- Below `768px`, every multi-column layout collapses to a single column.
- No horizontal scroll on mobile. Fixed demo surfaces must either wrap or become
  scroll-contained inside their own framed region.
- Touch targets are at least `44px`.
- Headlines use responsive `clamp()` or breakpoint sizing, never viewport-width font
  scaling.
- Inline visual blocks stack below or above headline text on mobile; text must never
  overlap visual assets.
- Long labels and buttons must wrap or truncate cleanly.

## 8. Anti-Patterns (Banned)

- No emojis.
- No Inter.
- No pure black (`#000000`).
- No custom cursor.
- No overlapping text and images.
- No 3-column equal-card feature rows.
- No generic names like "John Doe", "Acme", or "Nexus".
- No fake-perfect data such as `99.99%` or generic `50%`.
- No invented process stats, fake drift scores, or random inventory badges.
- No "not this, but that" marketing headings.
- No vague decorative tags such as "audit-ready", "signal", "coverage", or "registry pulse".
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen",
  "Game-changer", "Delve", or "Tapestry".
- No filler instructions like "Scroll to explore" or bouncing arrows.
- No broken Unsplash links.
- No circular spinner as the primary loading state.
