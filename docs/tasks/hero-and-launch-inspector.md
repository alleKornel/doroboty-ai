# Homepage hero and Launch Inspector follow-up

Restore the three portrait composition from the earlier DoRoboty.ai prototype. Build, Apply and Lead should be visible as real category links in the hero. Use the dark design system and locally optimized portrait assets. Keep the primary browse link and its analytics hook.

- Three distinct portraits with staggered entry, subtle particles and depth that responds to pointer movement. All content stays readable and usable with reduced motion, keyboard navigation and at 320px.
- Validate the new hero and the existing application, shortlist, and data recovery paths in the production build. Check that a build copied under a subdirectory still loads images, styles and hash routes.
- Reassess the findings from Q4.1 on the current fork. Encode the repeatable build in the repository and document the smoke and recovery checks. Keep the preparation, deployment, and observation results separate.

## Verification

- Node 24.22.3 and Playwright Chromium passed the full gate. This includes 36 unit and 36 browser tests, the 120-row baseline check and validation of the static release output.
- The initial browser run exposed public navigation overflow at 768px and inadequate contrast for withdrawn and closed application statuses. The corrected layout and status treatment passed the existing browser and accessibility checks.
- At 320px the homepage reflows and the Build card opens the matching filtered results from the keyboard. Browser tests checked the motion preference, pointer translation, all three local portraits and recovery from a failed screen download.
- A static server under `/pilot/index.html` served the current hero and Build category to ten independent test contexts. The rollback exercise rebuilt commit `3aa0228`, switched the isolated server to that artifact and verified that the original homepage returned with the same browser scenario.
- The three original portraits total 124,586 bytes as local transparent WebP assets. The initial application JavaScript fell from about 215 to 143 kB gzip after moving other screens to on-demand chunks. Optional analytics uses its existing separate chunk.
- The production-only npm audit reported zero findings. A pattern scan of shipped code, configuration and relevant history found no common private-key or account-token signatures. The enabled analytics configuration restricts collection to the exact production origin and uses a public project token.
