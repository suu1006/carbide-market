# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-07-15
- Primary product surfaces: single-page Korean landing site for carbide scrap buying consultation
- Evidence reviewed: `index.html`, `styles.css`, `script.js`, `tests/site-content.test.mjs`, `assets/`

## Brand
- Personality: direct, practical, trustworthy, industrial, fast to scan
- Trust signals: same-day quote language, visible contact actions, recent buying cases, clear buying process
- Avoid: decorative marketing-only sections, standalone market-price displays, vague fixed-price promises, dense copy without decision cues

## Product goals
- Goals: help sellers identify accepted items, understand the transaction process, compare proof cases, and contact quickly
- Non-goals: publish guaranteed live commodity prices or automate final valuation
- Success signals: users can find items, process, cases, and contact CTAs without reading long explanations

## Personas and jobs
- Primary personas: machining shops, tool suppliers, manufacturing sites, small sellers with mixed carbide scrap
- User jobs: check whether items are buyable, compare with similar cases, prepare basic consultation information, request a quote
- Key contexts of use: mobile photo consultation, desktop comparison while sorting scrap, quick phone/Kakao inquiry

## Information architecture
- Primary navigation: hero, items, process, cases, contact
- Core routes/screens: one-page anchored sections
- Content hierarchy: immediate value proposition, item recognition, transaction steps, comparable proof gallery, FAQ/contact

## Design principles
- Principle 1: show decision structure before detail
- Principle 2: every repeated card must add comparison value; do not repeat a featured item as a second card
- Tradeoffs: keep changing price information out of the page; direct users to consultation for an inspection-based quote

## Visual language
- Color: white and soft blue surfaces, navy text/CTA grounding, yellow Kakao/accent, green/orange status cues
- Typography: bold Korean headings, compact labels, readable body copy
- Spacing/layout rhythm: full-screen sections with clear reading order and generous separation between item, process, case, and contact content
- Shape/radius/elevation: 8px cards, restrained shadows, pill labels only for status
- Motion: restrained section reveal and item scanner only, with reduced-motion fallback; case data stays still for faster comparison
- Imagery/iconography: real carbide and case assets; avoid purely abstract decoration

## Components
- Existing components to reuse: header, buttons, item cards, process steps, badges, scroll progress
- New/changed components: single-source editorial case gallery and case proof summary; standalone price components are intentionally absent
- Variants and states: one featured case card and responsive case layouts
- Token/component ownership: plain CSS variables in `styles.css`

## Accessibility
- Target standard: semantic landmarks and readable contrast
- Keyboard/focus behavior: native anchors and buttons remain keyboard reachable
- Contrast/readability: dark panels use white text and muted white secondary copy
- Screen-reader semantics: sections use headings and `aria-label` on comparison/metric groups
- Reduced motion and sensory considerations: `prefers-reduced-motion` disables long animations

## Responsive behavior
- Supported breakpoints/devices: desktop, tablet at 1080/900/768px, narrow mobile at 640/480px
- Layout adaptations: item and case layouts collapse from multi-column grids to single-column reading order
- Touch/hover differences: CTAs become full-width on small screens

## Interaction states
- Loading: static page, no async loading state required
- Empty: not applicable for current static content
- Error: external Kakao/phone links rely on browser defaults
- Success: consultation CTA opens external channel
- Disabled: not applicable
- Offline/slow network, if applicable: images use local assets

## Content voice
- Tone: concise, practical, Korean-first, consultation-oriented
- Terminology: 폐초경, 초경스크랩, 인서트, 엔드밀, 슬러지, 검수, 정산
- Microcopy rules: avoid guaranteed fixed prices; ask for photo, weight, region when price depends on inspection

## Implementation constraints
- Framework/styling system: static HTML, CSS, vanilla JavaScript
- Design-token constraints: CSS custom properties in `:root`
- Performance constraints: local images, no external scripts
- Compatibility constraints: modern browsers with CSS grid and IntersectionObserver
- Test/screenshot expectations: `npm test` validates required sections, confirms the price page is absent, and checks CTAs, responsive CSS, and case structures

## Open questions
- [ ] Replace placeholder phone number with production contact / owner: site owner / impact: CTA accuracy
