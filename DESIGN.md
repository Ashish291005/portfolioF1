# Design System — f1port

<!-- impeccable:design-schema 1 -->

## Visual Authority & World

**World:** F1 Race Control / Telemetry Station
**Aesthetic:** Dark mode default (`#0D0D0D` carbon fiber), high-contrast telemetry styling, glowing team accents, precision data graphics, and motorsport typography.

---

## Palette & Theme Tokens

### Core Colors

- **Ground:** `#0D0D0D` (Carbon fiber texture ground)
- **Surface:** `#1A1A1A` (Card & panel containers)
- **Surface Elevated:** `#242424` (Hover states & interactive elements)
- **Border Subtle:** `#2A2A2A` (Subtle dividers & container borders)
- **Text Primary:** `#F0F0F0` (Headings & primary content)
- **Text Secondary:** `#888888` (Descriptions, labels, metadata)
- **Telemetry Green:** `#00FF87` (Live indicators, timing green, online status)
- **Sector Yellow:** `#FFD700` (Sector markers & telemetry flags)

### Constructor Livery Themes (Dynamic CSS Custom Properties)

| Team | Primary Accent (`--accent`) | Secondary Accent (`--accent-secondary`) | RGB Value (`--accent-rgb`) |
|------|-----------------------------|----------------------------------------|----------------------------|
| **Mercedes** | `#00A19C` (Teal) | `#C6C6C6` (Silver) | `0, 161, 156` |
| **Ferrari** | `#E8002D` (Rosso Red) | `#FFF200` (Yellow) | `232, 0, 45` |
| **Red Bull** | `#3671C6` (Navy Blue) | `#FFD700` (Red Bull Yellow) | `54, 113, 198` |

---

## Typography

- **Display & Telemetry Headers:** `Orbitron` (`var(--font-orbitron)`), Bold 700 / Black 900, uppercase with wide letter-spacing (`0.15em` to `0.2em`). Used for sector titles, turn indicators, project names, and driver profile headers.
- **Body & Content:** `Inter` (`var(--font-inter)`), Regular 400 / Medium 500. Clean, highly legible dark-mode sans-serif for descriptions and bio narrative.
- **Data & Telemetry Metrics:** `JetBrains Mono` (`var(--font-jetbrains)`), Medium 500 / Bold 700. Monospace font for timing deltas, stat values, skill percentages, and tech tags.

---

## Layout & Components

### 1. Split-View Track Layout (Desktop ≥1024px)
- **Left Column (40% width):** Sticky SVG Race Track panel containing the circuit loop, programmatic sector markers, and scroll-linked F1 Car path animation.
- **Right Column (60% width):** Main scrollable content sectors (Hero, Driver Specs, Projects, Pit Stop Skills, Contact Podium).

### 2. Mobile Pit Wall Timeline (<1024px)
- Compact sticky top bar featuring active team car model, pit wall status, and quick horizontal scroll sector buttons (`T1`, `T2`, `PIT`, `FINISH`).

### 3. Telemetry Cards & Containers
- Carbon fiber texture overlay (`.carbon-fiber`)
- Glowing borders (`.glow-border`) with team accent color glow `rgba(var(--accent-rgb), 0.3)`
- Telemetry headers with horizontal accent lines (`.sector-header`)
- Category pill filters with active team fill in `SkillsSection`
