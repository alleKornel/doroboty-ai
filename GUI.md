# GUI — DoRoboty.ai dark prototype

The owner selected the [dark visual system](docs/design-system/DOROBOTO-DARK.md) of the earlier prototype for every screen on the shortlist branch. Use the existing React, Base UI and hash-route structure. `src/app/doroboto-dark.css` maps the theme into the host and marketplace components; `src/components/ui/button.tsx` owns shared actions. Roboto is bundled locally.

The original Poster People kit under `docs/design-system/agent-kit` is preserved as historical source material and for its own integrity check. It is not the target appearance of this branch. Validate desktop and mobile layouts, keyboard and focus states, forms, data recovery and the order of the two study variants. Run `./scripts/verify` where the required Node/browser tools are available and record actual results.
