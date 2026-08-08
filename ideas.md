# PIN Generator — Design Brainstorm

## Three Stylistic Approaches

### 1. "Midnight Vault"
Dark, high-security bank-vault aesthetic with deep charcoal surfaces, brushed-metal textures, and a warm amber glow signaling "live" status. Emotional intent: trust, secrecy, precision.
Probability: 0.06

### 2. "Swiss Terminal"
Light paper-white background with strict grid, monospace numerals, oxblood red accents, and documentary-style labeling like a technical specification sheet. Emotional intent: bureaucratic precision, clarity.
Probability: 0.03

### 3. "Soft Ledger"
Warm cream and sage palette, rounded cards, gentle serif numerals — a friendly banking ledger feel that softens the security theme. Emotional intent: approachable, calm.
Probability: 0.04

---

## CHOSEN: Midnight Vault

**Design Movement**: Industrial-noir security design — inspired by hardware security modules (HSMs), bank vault doors, and cinematic safe-cracking interfaces. Dark surfaces, warm warning-light amber, machined precision.

**Core Principles**:
1. **Secrecy by aesthetics** — the UI feels like a classified instrument: concealed PINs (masked dots), reveal-on-demand, copy-to-clipboard like extracting a credential.
2. **Warm light on dark steel** — a single amber light source against near-black surfaces; everything else stays dim.
3. **Machined precision** — hairline borders, monospace numerals, exact alignment; no rounded softness except the PIN keycaps themselves.
4. **One action per screen** — generate OR verify; the interface never asks two questions at once.

**Color Philosophy**: Near-black backgrounds (oklch ~0.16, slight warm shift) evoke the inside of a vault; signature amber `oklch(0.82 0.16 75)` is the "live status light" — used only for live data (the generated PIN, success states) so the eye always knows where the secret is. Success = amber; error = a desaturated red; neutral = steel gray. The amber is deliberately NOT the button color — buttons are steel with amber glow on hover, reinforcing that only the PIN itself "glows."

**Layout Paradigm**: Split asymmetric console — left rail holds the "control panel" (generate + API docs navigation), right side is the "vault chamber" holding the oversized PIN display. Not a centered hero; a workbench composition with a fixed top bar like a device bezel.

**Signature Elements**:
1. Masked/unmasked PIN display with per-digit reveal animation (digits flip in like a mechanical counter).
2. Amber status LED motif — small glowing dots marking "live" data, copied states, and connected states.
3. Hairline-ruled panels with corner ticks (⌜ ⌝), like vault door engravings.

**Interaction Philosophy**: Interactions feel like operating hardware — instant, tactile, decisive. Buttons compress on press (scale 0.97), keycaps in the verify pad depress. Generating a PIN triggers the mechanical counter animation; copying shows a brief "copied" state like a latch clicking.

**Animation**: Digit flip-in: each digit rotatesY from 90° to 0° staggered 60ms apart, 250ms, ease-out cubic-bezier(0.23,1,0.32,1). LED pulse: slow 2s opacity breathe on amber dots. Button press 160ms scale(0.97). Success/error states: 200ms fade+slide. All under 300ms except the status-LED breath. Respect prefers-reduced-motion.

**Typography System**: Display/headings: "Space Grotesk" (geometric, technical). Numerals & PIN: "IBM Plex Mono" — mechanical, tabular. Body: "Inter"-free zone — use "Space Grotesk" 400/500 for body too, keeping two-family discipline (Grotesk + Plex Mono only). Hierarchy: mono for all data/code, grotesk for everything else.

**Brand Essence**: A pocket vault that mints one-time 4-digit credentials and proves them — for developers prototyping PIN flows and hobbyists curious about entropy. Personality: discreet, precise, quiet.

**Brand Voice**: Terse, instrument-like. Examples: "Mint a credential." / "Four digits. 10,000 possibilities. Zero trace." Banned: "Welcome to our website", "Get started today".

**Wordmark & Logo**: Wordmark "PINFORGE" in Space Grotesk 700 with the "O" replaced by a glowing amber status dot. Logo mark: a bold square keycap silhouette with four dots inside, amber-on-dark, transparent background.

**Signature Brand Color**: Amber `#F2A93B` (oklch 0.82 0.16 75) — the status light.
