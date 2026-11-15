# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Tech recruiters and engineering managers evaluating developer candidates. They arrive via a shared link or resume, scan for proof of skill, and decide whether to advance to an interview.

**Secondary:** Fellow developers and the broader tech community encountering the portfolio organically.

## Product Purpose

A personal developer portfolio that showcases web development skills and projects through an interactive Formula 1 race-track experience. The site itself is the proof: the craft of the portfolio demonstrates the candidate's frontend engineering ability. Success means a recruiter remembers the portfolio, explores every project, and reaches the contact section.

## Positioning

Unlike conventional developer portfolios built on static grids or minimal cards, f1port turns the browsing experience into an interactive race lap. The visitor chooses an F1 team, and a car animates along an SVG circuit as they scroll through content sectors — making the portfolio's technical ambition the first and strongest signal of the developer's skill.

## Operating Context

- Visitors land from a resume link, LinkedIn, or direct share.
- Average session: rapid scan under 2 minutes; the experience must hook within seconds.
- No authentication, no backend, no CMS — pure static frontend with client-side interactivity.
- Content is author-maintained in code.

## Capabilities and Constraints

### Core Mechanics

- **Team Selection:** On landing, visitors choose one of three F1 team themes — Mercedes, Ferrari, or Red Bull. The choice dynamically updates accent colors, the car model, and visual styling across the entire UI.
- **Track Navigation:** An interactive SVG race track serves as the primary navigation and content structure:
  - Sector 1 / Turn 1: About Me / Driver Specs
  - Turns 2–5: Projects Showcase (one project per turn)
  - Pit Stop: Technical Skills & Stack
  - Finish Line / Podium: Contact & Resume
- **Car Animation:** The selected team's F1 car follows the SVG track path as the user scrolls or navigates, using path-following animation (Framer Motion or GSAP MotionPathPlugin).
- **Responsive Fallback:** On mobile screens, the track collapses to a clean vertical pit-stop timeline retaining the selected team's branding.

### Team Color Tokens

| Team      | Primary Accent |
|-----------|---------------|
| Mercedes  | `#00A19C` (Teal/Silver) |
| Ferrari   | `#E8002D` (Rosso Red) |
| Red Bull  | `#3671C6` (Navy/Yellow/Red) |

### Technical Constraints

- Next.js 16 with React 19, Tailwind CSS v4, TypeScript, Bun.
- Dark mode by default; no light-mode toggle required.
- No backend or API routes — purely client-side rendered interactive content.

### Undecided

- Number of projects to feature (placeholder: 4, matching turns 2–5).
- Actual project content, bio copy, and resume details (author will supply).
- Whether engine-sound audio cues and pit-wall aesthetic toggles are in scope for v1.

## Brand Commitments

- **Name:** f1port
- **Team Assets:** Mercedes, Ferrari, and Red Bull logos and car visuals are permitted for use.
- **Typography:**
  - Display / Headers: **Orbitron** or **Titillium Web** (Bold, uppercase, motorsport/telemetry feel)
  - Body: **Inter** or **Space Grotesk** (clean, legible dark-mode sans-serif)
  - Monospace / Stats: **JetBrains Mono**
  - All loaded via `next/font/google`.
- **Aesthetic anchors:** Carbon fiber background (`#0D0D0D`), high-contrast telemetry styling, dark mode default.

## Evidence on Hand

- No existing project content, bio, images, or testimonials yet — author will provide.
- Team logos and car visuals are authorized but not yet sourced as assets.
- No live deployment target specified.

## Product Principles

1. **The portfolio is the proof.** Every interaction, animation, and detail signals the developer's engineering skill — the medium is the message.
2. **Hook in seconds, reward exploration.** The team-selection moment and track animation must earn attention immediately; each content sector sustains it.
3. **Performance is non-negotiable.** Complex animations must never compromise load time or scrolling smoothness on mainstream hardware.
4. **Respect the recruiter's time.** Content is scannable and navigable; the experience enhances rather than delays access to information.
5. **Theming is substance, not decoration.** The team-selection mechanic proves dynamic theming skill — it's a portfolio piece in itself.
