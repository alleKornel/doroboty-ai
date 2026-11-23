import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { JobCard } from "@/features/jobs/job-card";
import { usePrototype } from "./store";
import { publishedJobs } from "./model";
import { HomeHero } from "./home-hero";

export default function HomePage() {
  const { state } = usePrototype();
  const latestJobs = publishedJobs(state).slice(0, 4);

  return (
    <>
      <HomeHero />

      <section className="bg-muted/25 shadow-[var(--gui-divider-top-shadow)]">
        <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-medium tracking-[var(--gui-tracking-xl)] text-muted-foreground">
                Aktualne role
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[var(--gui-tracking-s)] sm:text-4xl">
                Najnowsze oferty
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--gui-link)] hover:underline"
              to="/oferty"
            >
              Wszystkie oferty <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 pp-job-list">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
