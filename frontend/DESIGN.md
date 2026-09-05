# AIGate design system

AIGate uses a dark, evidence-first control-plane aesthetic rather than a generic SaaS dashboard.

- Canvas: near-black with restrained emerald/violet ambient fields.
- Glass: CSS backdrop-filter panels with real fallbacks; no dependency on an experimental glass library.
- Motion: Motion for state transitions; React Three Fiber for the evidence graph and an original GLSL policy core.
- Accessibility: semantic controls, visible labels, keyboard-native inputs, reduced-motion handling and responsive single-column layouts.
- Product hierarchy: request → screening → evidence → approval → value → method.
- No remote images, analytics, authentication service, paid font, model API or database is required.
