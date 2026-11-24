# Category backgrounds and accessibility

Keep the job-listing headline legible on the dark theme. Give the public jobs, methodology and employer entry pages decorative cyberpunk backgrounds that preserve the readability and operation of foreground content. Keep the current theme, routes and course data.

## Acceptance criteria

- The listing accent sits below the glyphs and wraps with the headline at narrow widths.
- Public category backgrounds have distinct artwork, remain non-interactive, stop in under five seconds and stay static with reduced motion. They do not affect controls or reflow.
- Review WCAG 2.2 A and AA across public and role-specific route templates, with mobile and desktop scans and focused checks for keyboard operation, text contrast, reflow, dialogs and motion.
- Run the project verification gate and record the scope and results of the separate review.

## Verification

- Node.js 24.22.3 and `./scripts/verify` passed the design-system integrity check, formatting, lint, types, 36 unit tests, baseline packet validation, the production build and 49 Chromium tests.
- Axe reported no WCAG A/AA violations in 33 route and state samples at 320px and 1280px, plus the open mobile filter dialog and the unlocked employer study variant. The route suite also checks page titles and horizontal reflow. Targeted tests cover WCAG text spacing, keyboard access to public categories, workspace menu focus restoration, animation duration, reduced motion and forced colors.
- The baseline audit found invalid description-list markup on company pages. A later open-dialog scan exposed a white filter heading on a white background with 1.09:1 contrast. Visual inspection revealed a mobile listing callout overlapping search. The changes address all three findings.
- Inspected the jobs, methodology and employer entry at 1440px and 390px during the light sweep. Against the brightest sampled decorative background inside the section, the muted text token had at least 4.92:1 contrast and the control outline token had at least 3.17:1. Decorative backdrops complete a single 3.8-second sweep, stay static when reduced motion is requested and disappear in forced colors.
- Separate review checked the title derivation for lazily loaded routes, the keyboard order and focus restoration in public and workspace navigation, the description list, the distinction between dark surfaces and interactive boundaries, and containment of decorative art. `FEATURES.md` reflects the changes.
- Evidence covers the local Chromium build and sampled UI states. VoiceOver and NVDA were not run. See [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and the [W3C evaluation overview](https://www.w3.org/WAI/test-evaluate/).
