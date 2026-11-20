# Design system in this fork

The active application uses the owner's [dark DoRoboty.ai visual system](DOROBOTO-DARK.md) across public, candidate, employer and study screens. See [GUI.md](../../GUI.md) for the short implementation entry point. The host theme is in `src/app/doroboto-dark.css`; bundled Roboto files and their license are in `src/app/fonts/doroboto`.

The 67-file `agent-kit/` is the immutable Poster People reference used by the upstream teaching baseline. Its standalone `design.md`, components, examples and checks remain available for historical comparison. `IMPLEMENTATION.md`, `VERIFICATION.md`, `HOST-COMPONENTS.md`, `RECORDS.md` and `STATUS.md` describe that earlier integration; they are not the acceptance standard for this branch's dark UI.

Preserve domain behavior, React/Base UI composition, hash URLs and local state. Verify the actual built app at desktop and mobile widths with keyboard access. `npm run design-system:check` checks the preserved kit only; `./scripts/verify` runs the project gate when Node 24 and Playwright Chromium are present.
