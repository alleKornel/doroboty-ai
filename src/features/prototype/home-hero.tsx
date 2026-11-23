import type { CSSProperties, PointerEvent } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import buildPortrait from "./hero-assets/build.webp";
import applyPortrait from "./hero-assets/apply.webp";
import leadPortrait from "./hero-assets/lead.webp";
import "./home-hero.css";

const paths = [
  { key: "build", title: "Build", description: "Buduj AI", portrait: buildPortrait, depth: 0.7 },
  { key: "apply", title: "Apply", description: "Pracuj z AI", portrait: applyPortrait, depth: 1.1 },
  { key: "lead", title: "Lead", description: "Prowadź zmiany", portrait: leadPortrait, depth: 1.5 },
] as const;

const particles = [
  [3, 27],
  [7, 69],
  [9, 14],
  [16, 9],
  [22, 90],
  [29, 4],
  [35, 40],
  [40, 94],
  [48, 19],
  [54, 8],
  [62, 71],
  [65, 12],
  [73, 5],
  [77, 92],
  [85, 18],
  [91, 10],
  [94, 47],
  [97, 77],
];

function moveScene(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;
  const scene = event.currentTarget;
  const { left, top, width, height } = scene.getBoundingClientRect();
  scene.style.setProperty("--hero-x", `${((event.clientX - left) / width - 0.5) * 20}px`);
  scene.style.setProperty("--hero-y", `${((event.clientY - top) / height - 0.5) * 20}px`);
}

function resetScene(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.removeProperty("--hero-x");
  event.currentTarget.style.removeProperty("--hero-y");
}

export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-layout">
        <div className="home-hero-copy">
          <p className="home-hero-eyebrow">Portal pracy dla ludzi AI</p>
          <h1 id="home-hero-title">
            Praca dla ludzi,
            <br />
            którzy dowożą <em>z AI.</em>
          </h1>
          <p className="home-hero-lede">
            Budujesz rozwiązania, używasz AI w swojej pracy lub prowadzisz zmianę? Znajdź rolę, w
            której Twój wkład ma znaczenie.
          </p>
          <div className="home-hero-actions">
            <Link
              to="/oferty"
              data-analytics="browse-jobs"
              className={buttonVariants({ size: "lg" })}
            >
              Zobacz oferty <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/metodologia" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Jak wybieramy role
            </Link>
          </div>
        </div>
        <div className="home-hero-scene" onPointerMove={moveScene} onPointerLeave={resetScene}>
          <div className="home-hero-depth" aria-hidden="true" />
          <div className="home-hero-particles" aria-hidden="true">
            {particles.map(([x, y], index) => (
              <i
                key={x}
                style={
                  {
                    left: `${x}%`,
                    top: `${y}%`,
                    "--particle-delay": `${(index % 7) * 120}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <ul className="home-hero-paths" aria-label="Ścieżki pracy z AI">
            {paths.map((path) => (
              <li
                key={path.key}
                className={`home-hero-path home-hero-path--${path.key}`}
                style={{ "--hero-depth": path.depth } as CSSProperties}
              >
                <Link className="home-hero-card" to={`/oferty?category=${path.key}`}>
                  <img alt="" width="320" height="480" src={path.portrait} />
                  <span className="home-hero-caption">
                    <strong>{path.title}</strong>
                    <span>{path.description}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
