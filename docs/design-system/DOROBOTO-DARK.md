# DoRoboty.ai dark interface on the shortlist branch

The project owner selected the dark visual system of the earlier DoRoboty.ai prototype for **all** public and workspace screens on `codex/shortlist-readiness`. The source is `../../../prototypes/ui/tokens.css` in the sibling prototype project and its accepted component documentation. This guide governs current UI work on this branch. The Poster People agent kit remains intact as historical baseline material, not the target appearance.

## Roles and tokens

| Role           | Value     | Use                                     |
| -------------- | --------- | --------------------------------------- |
| Canvas         | `#070a10` | Page background                         |
| Surface        | `#0d131b` | Cards, navigation, dialogs              |
| Raised surface | `#111a23` | Inputs and secondary panels             |
| Border         | `#2a4652` | Panel and control outlines              |
| Main text      | `#f0f5f6` | Headings and body                       |
| Muted text     | `#9aaab2` | Labels and supporting copy              |
| Cyan           | `#48e6f4` | Links, focus and section labels         |
| Lime           | `#c7ff4a` | Primary actions and selected navigation |
| Magenta        | `#ed5ae4` | Sparse tertiary signal only             |

Use the bundled Roboto WOFF2 files and OFL license in `src/app/fonts/doroboto`. No runtime font request goes to a third party. Main controls and informative copy are at least 14px; metadata is at least 12px. Cards and buttons have sharp 3–8px corners. Primary lime surfaces use dark text. Focus has a visible cyan outline; success and error feedback use text as well as color.

`src/app/doroboto-dark.css` maps the existing host and marketplace variables, then handles legacy hard-coded component surfaces. `src/components/ui/button.tsx` owns shared action colors. The immutable kit in `docs/design-system/agent-kit` still has its own design and verification scripts; those verify the archive, not the dark application.

## Screen checks

- Review homepage, listing, offer, candidate editor, employer study, settings and process screens at desktop and 390px width.
- Check keyboard focus, forms, low-content states, large text wrapping and all role navigation.
- The study must hide variant B until the participant records variant A; the fixed Match Score must stay separate from the experimental 70/30 indicator.
- Use the app's functional tests and a fresh rendered browser view to verify changes. Record any unavailable browser gate honestly.
