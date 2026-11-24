import type { ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryBackdrop } from "./category-backdrop";
import { currentPerson } from "./model";
import { Empty } from "./shell";
import { usePrototype } from "./store";

export function PersonPicker() {
  const { state, run } = usePrototype();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const audience = params.get("audience");
  const people =
    audience === "candidate" || audience === "employer"
      ? state.people.filter((person) => person.role === audience)
      : state.people;
  const safeNext = next && /^\/(?!\/)/.test(next) && !next.startsWith("/auth") ? next : null;
  return (
    <section
      className={cn("prototype-section max-w-4xl", audience === "employer" && "category-hero")}
    >
      {audience === "employer" && <CategoryBackdrop scene="employer" />}
      <h1>Wybierz osobę</h1>
      <p className="mt-4 mb-8 text-muted-foreground">
        Wybierz fikcyjny profil, aby wypróbować proces. W aplikacjach używaj wyłącznie przykładowych
        danych.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {people.map((person) => (
          <article key={person.id} className="prototype-panel">
            <h2 className="text-xl">{person.name}</h2>
            <p className="my-4 text-muted-foreground">{person.headline}</p>
            <Button
              variant="outline"
              onClick={() => {
                run({ type: "select_person", id: person.id });
                navigate(
                  person.role === "candidate"
                    ? (safeNext ?? "/app")
                    : person.role === "employer"
                      ? "/app/oferty"
                      : "/app/case",
                );
              }}
            >
              Wejdź jako {person.name}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
export function RequireRole({
  role,
  children,
}: {
  role?: "candidate" | "employer" | "operator";
  children: ReactNode;
}) {
  const { state } = usePrototype();
  const person = currentPerson(state);
  if (!person) return <PersonPicker />;
  if (role && person.role !== role)
    return (
      <Empty>
        <h1>Ten widok wymaga innej roli</h1>
        <p className="my-4">
          Ten widok jest dostępny dla{" "}
          {role === "candidate" ? "kandydata" : role === "employer" ? "pracodawcy" : "prowadzącego"}
          .
        </p>
        <Link className={buttonVariants({ variant: "outline" })} to="/auth/sign-in">
          Zmień osobę
        </Link>
      </Empty>
    );
  return children;
}
