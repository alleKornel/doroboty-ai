import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const routeGroups = [
  {
    name: "public",
    routes: [
      ["/", /Praca dla ludzi/],
      ["/oferty", /Dobra robota/],
      ["/oferty?category=build", /Dobra robota/],
      ["/oferty?category=apply", /Dobra robota/],
      ["/oferty?category=lead", /Dobra robota/],
      ["/oferty?view=map", /Dobra robota/],
      ["/oferty?query=nieistniejaca-rola", /Dobra robota/],
      ["/oferty/ai-product-manager", /AI Product Manager/],
      ["/firmy/brightlabs", /BrightLabs/],
      ["/metodologia", /Nie każda praca/],
      ["/polityka-prywatnosci", /Prywatność prototypu/],
      ["/auth/sign-in", /Wybierz osobę/],
      ["/auth/sign-in?audience=employer&next=/app/oferty", /Wybierz osobę/],
      ["/oferty/brak-oferty", /Nie znaleziono strony/],
    ],
  },
  {
    name: "candidate",
    persona: "Marek Nowak",
    routes: [
      ["/app", /Witaj, Marek/],
      ["/app/profil", /Twój profil/],
      ["/app/profil/podglad", /Marek Nowak/],
      ["/app/karta-projektu", /Karta wkładu/],
      ["/app/zapisane", /Zapisane oferty/],
      ["/app/aplikacje", /Moje aplikacje/],
      ["/app/aplikacje/application-example", /AI Product Manager/],
      ["/app/shortlista", /Ten widok wymaga innej roli/],
      ["/aplikuj/ai-operations-specialist", /Aplikuj na ofertę/],
      ["/app/settings", /Ustawienia prototypu/],
    ],
  },
  {
    name: "employer",
    persona: "Karolina Wiśniewska",
    routes: [
      ["/app", /Witaj, Karolina/],
      ["/app/oferty", /Moje oferty/],
      ["/app/oferty/nowa", /Nowa oferta/],
      ["/app/oferty/20000000-0000-4000-8000-000000000001", /Edytuj ofertę/],
      ["/app/organizacja", /Twoja organizacja/],
      ["/app/kandydaci", /Kandydaci/],
      ["/app/kandydaci/application-example", /Marek Nowak/],
      ["/app/shortlista", /Badanie shortlisty/],
    ],
  },
  {
    name: "case facilitator",
    persona: "Prowadzący",
    routes: [["/app/case", /Materiały case study/]],
  },
] as const;

for (const width of [320, 1280]) {
  for (const group of routeGroups) {
    test(`WCAG A/AA and reflow for ${group.name} routes at ${width}px`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      if ("persona" in group) {
        await page.goto("/#/auth/sign-in");
        await page
          .getByRole("button", { name: `Wejdź jako ${group.persona}`, exact: true })
          .click();
      }

      for (const [path, heading] of group.routes) {
        await test.step(path, async () => {
          await page.goto(`/#${path}`);
          await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
          await expect(page).toHaveTitle(heading);
          const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
          expect
            .soft(
              violations.flatMap(({ id, nodes }) =>
                nodes.map(({ target, failureSummary }) => ({ id, target, failureSummary })),
              ),
              `${path} accessibility`,
            )
            .toEqual([]);
          expect
            .soft(
              await page.evaluate(() => document.documentElement.scrollWidth),
              `${path} horizontal reflow`,
            )
            .toBeLessThanOrEqual(width);
        });
      }
    });
  }
}

test("category artwork has a static reduced-motion state and an entry animation", async ({
  page,
}) => {
  for (const [path, scene] of [
    ["/oferty", "jobs"],
    ["/metodologia", "methodology"],
    ["/auth/sign-in?audience=employer&next=/app/oferty", "employer"],
    ["/firmy/brightlabs", "employer"],
  ]) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/#${path}`);
    const artwork = page.locator(`.category-backdrop--${scene}`);
    const sweep = artwork.locator(".category-backdrop-sweep");
    await expect(artwork).toHaveAttribute("aria-hidden", "true");
    await expect(artwork).toHaveCSS("pointer-events", "none");
    await expect(sweep).toHaveCSS("animation-duration", "3.8s");
    await expect(sweep).toHaveCSS("animation-iteration-count", "1");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(sweep).toHaveCSS("animation-name", "none");
    await expect(artwork.locator(".category-backdrop-shape")).toHaveCSS("animation-name", "none");
    await page.emulateMedia({ forcedColors: "active" });
    await expect(artwork).toBeHidden();
    await page.emulateMedia({ forcedColors: "none" });
  }
});

test("mobile category links can be reached with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/#/oferty");
  const nav = page.getByRole("navigation", { name: "Główna nawigacja" });
  const jobs = nav.getByRole("link", { name: "Oferty", exact: true });
  await expect(jobs).toHaveAttribute("aria-current", "page");
  const headline = page.getByRole("heading", { level: 1 }).getByText("Z AI w środku.");
  await expect(headline).toHaveCSS("text-decoration-line", "underline");
  await expect(headline).toHaveCSS("text-decoration-skip-ink", "auto");
  await expect(page.locator(".hero-signal")).toBeHidden();
  await jobs.focus();
  await page.keyboard.press("Tab");
  const methodology = nav.getByRole("link", { name: "Metodologia", exact: true });
  await expect(methodology).toBeFocused();
  await expect(methodology).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  const employer = nav.getByRole("link", { name: "Dla firm", exact: true });
  await expect(employer).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska" })).toBeVisible();
});

test("public category content reflows with WCAG text spacing", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const [path, heading] of [
    ["/oferty", /Dobra robota/],
    ["/metodologia", /Nie każda praca/],
    ["/auth/sign-in?audience=employer", /Wybierz osobę/],
  ] as const) {
    await page.goto(`/#${path}`);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    const spacing = await page.addStyleTag({
      content: `
        * { line-height: 1.5 !important; letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important; }
        p { margin-block-end: 2em !important; }
      `,
    });
    expect.soft(await page.evaluate(() => document.documentElement.scrollWidth), path).toBe(320);
    await spacing.evaluate((style) => style.parentNode?.removeChild(style));
  }
});

test("closing the workspace menu from the keyboard restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Marek Nowak", exact: true }).click();
  const menu = page.getByRole("button", { name: "Otwórz menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  const navigation = page.getByRole("navigation", { name: "Panel użytkownika" });
  await page.keyboard.press("Tab");
  await expect(navigation.getByRole("link", { name: "Przegląd", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(navigation).toBeHidden();
});

test("the open mobile filters and unlocked shortlist variant pass WCAG scans", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/oferty");
  await page.getByRole("button", { name: "Filtry", exact: true }).click();
  const filters = page.getByRole("dialog", { name: "Filtry", exact: true });
  await expect(filters).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Filtry", exact: true })).toBeFocused();

  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska", exact: true }).click();
  await page.goto("/#/app/shortlista");
  await page
    .getByRole("textbox", { name: "Dlaczego?", exact: true })
    .fill("Fikcyjna ocena w teście.");
  await page.getByRole("button", { name: "Zapisz decyzję", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Ocena: Mój wkład" })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([]);
});
