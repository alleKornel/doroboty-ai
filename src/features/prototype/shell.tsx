import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import {
  Menu,
  ArrowUpRight,
  LogOut,
  X,
  BriefcaseBusiness,
  UserRound,
  Bookmark,
  FileText,
  ListChecks,
  Users,
  Building2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { BrandMark } from "@/features/public/brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import { currentPerson } from "./model";
import { usePrototype } from "./store";
import { cn } from "@/lib/utils";
const navigation = [
  { to: "/oferty", label: "Oferty" },
  { to: "/metodologia", label: "Metodologia" },
  { to: "/auth/sign-in?audience=employer&next=/app/oferty", label: "Dla firm" },
];

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="prototype-notice">
      {children}
    </div>
  );
}
export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <h1>{children}</h1>
      {action}
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="prototype-panel">{children}</div>;
}
export function NotFound() {
  return (
    <section className="prototype-section">
      <h1>Nie znaleziono strony</h1>
      <p className="my-5">Ten adres nie prowadzi do dostępnej oferty lub aplikacji.</p>
      <Link className={buttonVariants()} to="/oferty">
        Wróć do ofert
      </Link>
    </section>
  );
}

class ScreenBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="prototype-section" role="alert">
        <h1>Nie udało się otworzyć widoku</h1>
        <p className="my-5">Odśwież stronę, aby pobrać aktualną wersję prototypu.</p>
        <Button onClick={() => window.location.reload()}>Odśwież stronę</Button>
      </section>
    );
  }
}

const candidateNav = [
  ["/app", "Przegląd", LayoutDashboard],
  ["/app/profil", "Profil", UserRound],
  ["/app/karta-projektu", "Karta projektu", FileText],
  ["/app/zapisane", "Zapisane oferty", Bookmark],
  ["/app/aplikacje", "Moje aplikacje", FileText],
] as const;
const employerNav = [
  ["/app", "Przegląd", LayoutDashboard],
  ["/app/oferty", "Moje oferty", BriefcaseBusiness],
  ["/app/kandydaci", "Kandydaci", Users],
  ["/app/shortlista", "Badanie shortlisty", ListChecks],
  ["/app/organizacja", "Organizacja", Building2],
] as const;
export function Shell() {
  const { state, issue, error, clearError } = usePrototype();
  const person = currentPerson(state);
  const { pathname, search } = useLocation();
  const workspace = pathname.startsWith("/app") && person;
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const main = useRef<HTMLElement>(null);
  const workspaceMenuButton = useRef<HTMLButtonElement>(null);
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      clearError();
      main.current?.focus();
      window.scrollTo(0, 0);
      lastPath.current = pathname;
    }
  }, [pathname, clearError]);
  useEffect(() => {
    const region = main.current;
    if (!region) return;
    const updateTitle = () => {
      const heading = region.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim();
      document.title = heading ? `${heading} | DoRoboty.ai` : "DoRoboty.ai";
    };
    updateTitle();
    const observer = new MutationObserver(updateTitle);
    observer.observe(region, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, workspace]);
  const nav =
    person?.role === "employer"
      ? employerNav
      : person?.role === "operator"
        ? [["/app/case", "Materiały case study", FileText] as const]
        : candidateNav;
  const content = (
    <>
      <>
        {issue && (
          <Notice>
            {issue}{" "}
            <Link className="underline" to="/app/settings">
              Ustawienia danych
            </Link>
          </Notice>
        )}
      </>
      {error && (
        <p className="prototype-error" role="alert">
          {error}
        </p>
      )}
      <div key={`${state.activePersonId}:${pathname}`}>
        <ScreenBoundary>
          <Suspense
            fallback={
              <p role="status" className="prototype-section">
                Ładujemy widok…
              </p>
            }
          >
            <Outlet />
          </Suspense>
        </ScreenBoundary>
      </div>
    </>
  );
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Przejdź do treści
      </a>
      {workspace ? (
        <div className="app-frame">
          <div className="mobile-header">
            <Link to="/" className="brand">
              <BrandMark />
              DoRoboty.ai
            </Link>
            <Button
              ref={workspaceMenuButton}
              aria-label={menuAt === pathname ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={menuAt === pathname}
              aria-controls="workspace-nav"
              variant="ghost"
              size="icon"
              onClick={() => setMenuAt(menuAt === pathname ? null : pathname)}
            >
              {menuAt === pathname ? <X /> : <Menu />}
            </Button>
          </div>
          <aside
            className={`sidebar ${menuAt === pathname ? "sidebar-open" : ""}`}
            onBlur={(e) => {
              if (
                menuAt === pathname &&
                !e.currentTarget.contains(e.relatedTarget) &&
                e.relatedTarget !== workspaceMenuButton.current
              ) {
                setMenuAt(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && menuAt === pathname) {
                setMenuAt(null);
                workspaceMenuButton.current?.focus();
              }
            }}
          >
            <Link className="brand" to="/">
              <BrandMark />
              DoRoboty.ai
            </Link>
            <div className="workspace-label">
              <span className="workspace-avatar">{person.name[0]}</span>
              <div>
                <strong>{person.name}</strong>
                <span>{person.headline}</span>
              </div>
            </div>
            <nav id="workspace-nav" aria-label="Panel użytkownika">
              {nav.map(([to, label, Icon]) => (
                <NavLink
                  end={to === "/app"}
                  key={to}
                  to={to}
                  onClick={() => setMenuAt(null)}
                  className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/app/settings"
                onClick={() => setMenuAt(null)}
                className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
              >
                <Settings className="size-4" />
                Ustawienia
              </NavLink>
              <Link className="nav-link" to="/oferty">
                Wszystkie oferty
              </Link>
              <Link className="nav-link" to="/auth/sign-in">
                Zmień osobę
              </Link>
            </nav>
          </aside>
          <div className="workspace">
            <div className="topbar">
              <span>
                {person.role === "candidate"
                  ? "Strefa kandydata"
                  : person.role === "employer"
                    ? "Strefa pracodawcy"
                    : "Case study"}
              </span>
              <Link to="/auth/sign-in">{person.name}</Link>
            </div>
            <main id="main" ref={main} tabIndex={-1} className="main-content outline-none">
              {content}
            </main>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-background/95 shadow-[var(--gui-divider-bottom-shadow)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 pt-2 md:flex md:gap-4 md:py-0">
              <Link
                className="flex items-center gap-2.5 text-base font-semibold tracking-[var(--gui-tracking-s)]"
                to="/"
                aria-label="DoRoboty.ai — strona główna"
              >
                <BrandMark />
                <span>DoRoboty.ai</span>
              </Link>
              <nav
                aria-label="Główna nawigacja"
                className="order-last col-span-2 flex flex-wrap items-center gap-x-4 md:order-none md:ml-auto md:gap-x-3 lg:gap-x-5"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.to}
                    className="inline-flex min-h-9 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:underline-offset-4"
                    to={item.to}
                    aria-current={
                      item.to === `${pathname}${search}` || item.to === pathname
                        ? "page"
                        : undefined
                    }
                  >
                    {item.label}
                  </Link>
                ))}
                {person?.role === "candidate" && (
                  <>
                    <Link
                      className="hidden min-h-9 items-center text-sm font-medium text-muted-foreground md:inline-flex"
                      to="/app/aplikacje"
                    >
                      Aplikacje
                    </Link>
                    <Link
                      className="hidden min-h-9 items-center text-sm font-medium text-muted-foreground md:inline-flex"
                      to="/app/profil"
                    >
                      Profil
                    </Link>
                  </>
                )}
              </nav>
              <div className="flex items-center gap-1 lg:gap-3">
                <Link
                  to={person ? "/app" : "/auth/sign-in?audience=candidate"}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "text-sm font-medium max-sm:min-h-10 max-sm:px-[var(--gui-space-xs)]",
                  )}
                >
                  {person ? "Moje konto" : "Wybierz osobę"}
                </Link>
                {person && (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "hidden md:inline-flex",
                    )}
                    to="/auth/sign-in"
                    aria-label="Zmień osobę"
                    title="Zmień osobę"
                  >
                    <LogOut aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </header>
          <main id="main" ref={main} tabIndex={-1} className="outline-none">
            {content}
          </main>
          <footer className="bg-muted/40 text-foreground shadow-[var(--gui-divider-top-shadow)]">
            <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 sm:grid-cols-2 lg:px-8">
              <div>
                <p className="text-base font-semibold">DoRoboty.ai</p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  Praca dla ludzi, którzy potrafią z AI zbudować coś wartościowego — nie tylko
                  wpisać je do CV.
                </p>
              </div>
              <nav
                aria-label="Stopka"
                className="flex flex-wrap content-start gap-x-6 gap-y-3 text-sm text-muted-foreground sm:justify-end [&_a]:inline-flex [&_a]:min-h-6 [&_a]:items-center"
              >
                <Link to="/oferty">Oferty</Link>
                <Link to="/metodologia">Metodologia</Link>
                <Link to="/polityka-prywatnosci">Prywatność</Link>
                <Link className="inline-flex items-center gap-1" to="/auth/sign-in">
                  Strefa case <ArrowUpRight className="size-4" />
                </Link>
              </nav>
            </div>
            <div className="px-5 py-4 text-xs text-muted-foreground shadow-[var(--gui-divider-top-shadow)] lg:px-8">
              <div className="mx-auto max-w-[1360px]">
                © {new Date().getFullYear()} DoRoboty.ai — od Superhero.tech
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
