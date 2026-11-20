import { z } from "zod";
import marketplace from "./data/marketplace.json" with { type: "json" };
import people from "./data/people.json" with { type: "json" };
import type { JobWithCompany } from "@/features/jobs/types";

const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
const shortText = z.string().trim().min(1).max(200);
const text = z.string().trim().max(12000);
export const MIN_APPLICATION_ANSWER_LENGTH = 20;
const companySchema = z.object({
  id,
  slug: id,
  name: shortText,
  summary: text,
  description: text,
  websiteUrl: z
    .string()
    .max(500)
    .refine((value) => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Company website must use HTTP or HTTPS"),
  location: shortText,
  sizeLabel: shortText,
  logoUrl: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional(),
});
export const jobSchema = z
  .object({
    id,
    slug: id,
    companyId: id,
    title: shortText,
    summary: text.min(10),
    description: text.min(30),
    category: z.enum(["build", "apply", "lead"]),
    function: z.enum(["product", "engineering", "data", "design", "marketing", "operations"]),
    remoteStatus: z.enum(["onsite", "hybrid", "remote"]),
    locations: z.array(shortText).min(1).max(10),
    coordinates: z
      .object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })
      .optional(),
    seniority: z.enum(["junior", "mid", "senior", "lead"]),
    contract: z.enum(["employment", "b2b", "mandate"]),
    salaryMin: z.number().nonnegative().optional(),
    salaryMax: z.number().nonnegative().optional(),
    salaryCurrency: z.enum(["PLN", "EUR"]).optional(),
    salaryPeriod: z.enum(["month", "year"]).optional(),
    salaryKind: z.enum(["gross", "net"]).optional(),
    publicationStatus: z.enum(["draft", "review", "published", "hidden", "expired", "archived"]),
    publishedAt: z.iso.datetime(),
    expiryAt: z.iso.datetime(),
    verificationStatus: z.enum(["unverified", "editorial", "employer_verified"]),
    sourceBrief: text.optional(),
    generatedDescription: text.optional(),
  })
  .refine(
    (job) =>
      job.salaryMin === undefined || job.salaryMax === undefined || job.salaryMin <= job.salaryMax,
    { path: ["salaryMax"], message: "Salary maximum must not be below minimum" },
  );
export const profileSchema = z.object({
  name: shortText,
  headline: shortText,
  bio: text,
  location: shortText,
});
const personSchema = profileSchema.extend({
  id,
  role: z.enum(["candidate", "employer", "operator"]),
  companyId: id.optional(),
  cv: text,
  exampleScore: z.number().int().min(0).max(100),
  exampleSummary: text,
});
export const stages = [
  "submitted",
  "reviewed",
  "interview_invited",
  "first_conversation_held",
  "continued",
  "rejected",
  "withdrawn",
  "hired",
] as const;
export type Stage = (typeof stages)[number];
export const stageLabels: Record<Stage, string> = {
  submitted: "Aplikacja wysłana",
  reviewed: "W przeglądzie",
  interview_invited: "Zaproszenie na rozmowę",
  first_conversation_held: "Pierwsza rozmowa odbyta",
  continued: "Kolejny etap",
  rejected: "Proces zakończony",
  withdrawn: "Wycofana",
  hired: "Zatrudnienie",
};
export const nextStages: Record<Stage, Stage[]> = {
  submitted: ["reviewed", "rejected"],
  reviewed: ["interview_invited", "rejected"],
  interview_invited: ["first_conversation_held", "rejected"],
  first_conversation_held: ["continued", "rejected"],
  continued: ["hired", "rejected"],
  rejected: [],
  withdrawn: [],
  hired: [],
};
const applicationSchema = z.object({
  id,
  candidateId: id,
  jobId: id,
  companyId: id,
  jobTitle: shortText,
  candidateName: shortText,
  cv: text.min(20),
  answer: text.min(MIN_APPLICATION_ANSWER_LENGTH),
  sourceNotes: text,
  generatedAnswer: text,
  score: z.number().int().min(0).max(100),
  summary: text,
  stage: z.enum(stages),
  events: z
    .array(z.object({ stage: z.enum(stages), at: z.iso.datetime(), note: text }))
    .min(1)
    .max(30),
});
const draftSchema = z.object({
  candidateId: id,
  jobId: id,
  notes: text,
  generated: text,
  answer: text,
});
export const cardSections = [
  "challenge",
  "contribution",
  "aiUse",
  "outcome",
  "reflection",
] as const;
export const cardLabels: Record<(typeof cardSections)[number], string> = {
  challenge: "Wyzwanie",
  contribution: "Mój wkład",
  aiUse: "Rola AI",
  outcome: "Efekt",
  reflection: "Wnioski",
};
export const contributionSchema = z.object({
  challenge: text.max(1200),
  contribution: text.max(1200),
  aiUse: text.max(1200),
  outcome: text.max(1200),
  reflection: text.max(1200),
});
export type Contribution = z.infer<typeof contributionSchema>;
const decisionSchema = z.object({
  choice: z.enum(["invite", "hold", "reject"]),
  reason: z.string().trim().min(10).max(1200),
  question: z.string().trim().max(1200),
  at: z.iso.datetime(),
});
const cardSchema = z.object({
  candidateId: id,
  draft: contributionSchema,
  published: contributionSchema.nullable(),
  version: z.number().int().nonnegative(),
  publishedAt: z.iso.datetime().nullable(),
});
const reviewSchema = z.object({
  applicationId: id,
  profileDecision: decisionSchema.optional(),
  cardDecision: decisionSchema.optional(),
  cardVersion: z.number().int().positive().optional(),
  ratings: z.partialRecord(z.enum(cardSections), z.number().int().min(1).max(5)),
});
export const stateSchema = z
  .object({
    version: z.literal(1),
    activePersonId: id.nullable(),
    companies: z.array(companySchema).min(1).max(200),
    jobs: z.array(jobSchema).min(1).max(1000),
    people: z.array(personSchema).min(1).max(100),
    applications: z.array(applicationSchema).max(2000),
    saved: z.array(z.object({ candidateId: id, jobId: id })).max(5000),
    drafts: z.array(draftSchema).max(1000),
    contributionCards: z.array(cardSchema).max(100).default([]),
    studyReviews: z.array(reviewSchema).max(2000).default([]),
  })
  .superRefine((s, ctx) => {
    const problem = (message: string) => ctx.addIssue({ code: "custom", message });
    for (const list of [s.companies, s.jobs, s.people, s.applications]) {
      if (new Set(list.map((x) => x.id)).size !== list.length) problem("Duplicate identifiers");
    }
    if (
      new Set(s.jobs.map((x) => x.slug)).size !== s.jobs.length ||
      new Set(s.companies.map((x) => x.slug)).size !== s.companies.length
    )
      problem("Duplicate slugs");
    const companyIds = new Set(s.companies.map((x) => x.id));
    const jobs = new Map(s.jobs.map((x) => [x.id, x]));
    const candidates = new Set(s.people.filter((x) => x.role === "candidate").map((x) => x.id));
    if (s.activePersonId !== null && !s.people.some((x) => x.id === s.activePersonId))
      problem("Unknown active person");
    for (const p of s.people)
      if (p.role === "employer" && (!p.companyId || !companyIds.has(p.companyId)))
        problem("Unknown employer company");
    for (const j of s.jobs) if (!companyIds.has(j.companyId)) problem("Unknown job company");
    const keys = new Set<string>();
    for (const a of s.applications) {
      const key = `${a.candidateId}:${a.jobId}`;
      if (
        !candidates.has(a.candidateId) ||
        jobs.get(a.jobId)?.companyId !== a.companyId ||
        keys.has(key)
      )
        problem("Invalid application reference");
      keys.add(key);
      if (a.events[0]?.stage !== "submitted" || a.events.at(-1)?.stage !== a.stage)
        problem("Invalid application history");
      for (let i = 1; i < a.events.length; i++) {
        const before = a.events[i - 1];
        const after = a.events[i];
        if (!(
          nextStages[before.stage].includes(after.stage) ||
          (after.stage === "withdrawn" &&
            !["hired", "rejected", "withdrawn"].includes(before.stage))
        ))
          problem("Invalid stage transition");
        if (after.at < before.at) problem("Invalid event order");
      }
    }
    for (const list of [s.saved, s.drafts]) {
      const pairs = new Set<string>();
      for (const item of list) {
        const key = `${item.candidateId}:${item.jobId}`;
        if (!candidates.has(item.candidateId) || !jobs.has(item.jobId) || pairs.has(key))
          problem("Invalid candidate/job reference");
        pairs.add(key);
      }
    }
    const cards = new Set<string>();
    for (const card of s.contributionCards) {
      if (!candidates.has(card.candidateId) || cards.has(card.candidateId))
        problem("Invalid contribution card reference");
      cards.add(card.candidateId);
      if ((card.published === null) !== (card.publishedAt === null))
        problem("Invalid contribution publication");
    }
    const reviews = new Set<string>();
    for (const review of s.studyReviews) {
      const application = s.applications.find((a) => a.id === review.applicationId);
      if (!application || reviews.has(review.applicationId))
        problem("Invalid study review reference");
      reviews.add(review.applicationId);
      const card = s.contributionCards.find((c) => c.candidateId === application?.candidateId);
      if (
        review.cardVersion !== undefined &&
        (!card?.published || review.cardVersion !== card.version)
      )
        problem("Outdated contribution card review");
      if (
        (review.cardDecision || Object.keys(review.ratings).length) &&
        review.cardVersion === undefined
      )
        problem("Missing contribution card review version");
      if ((review.cardDecision || Object.keys(review.ratings).length) && !review.profileDecision)
        problem("Study variants must be reviewed in order");
    }
  });
export type State = z.infer<typeof stateSchema>;
export type Person = State["people"][number];
export type Application = State["applications"][number];
export type Action =
  | { type: "select_person"; id: string | null }
  | { type: "profile"; value: z.infer<typeof profileSchema> }
  | { type: "toggle_saved"; jobId: string }
  | { type: "draft"; jobId: string; notes: string; generated: string; answer: string }
  | {
      type: "submit";
      jobId: string;
      notes: string;
      generated: string;
      answer: string;
      consent: boolean;
    }
  | { type: "stage"; applicationId: string; stage: Stage; note: string }
  | { type: "withdraw"; applicationId: string }
  | { type: "publish"; job: z.infer<typeof jobSchema> }
  | { type: "company"; name: string; description: string }
  | { type: "card_draft"; value: Contribution }
  | { type: "card_publish" }
  | { type: "card_withdraw" }
  | {
      type: "study_rate";
      applicationId: string;
      section: (typeof cardSections)[number];
      rating: number;
    }
  | {
      type: "study_decide";
      applicationId: string;
      variant: "profile" | "card";
      choice: "invite" | "hold" | "reject";
      reason: string;
      question: string;
    }
  | { type: "study_restart"; applicationId: string };

export function initialState(): State {
  const state = stateSchema.parse({
    version: 1,
    activePersonId: null,
    ...marketplace,
    people,
    applications: [],
    saved: [],
    drafts: [],
    contributionCards: [],
    studyReviews: [],
  });
  const bob = state.people.find((x) => x.id === "candidate-marek")!;
  const job = state.jobs[0];
  state.applications.push({
    id: "application-example",
    candidateId: bob.id,
    jobId: job.id,
    companyId: job.companyId,
    jobTitle: job.title,
    candidateName: bob.name,
    cv: bob.cv,
    answer:
      "Pracowałem nad automatyzacją obsługi zgłoszeń. Poprowadziłem badania z użytkownikami i wdrożenie, które skróciło czas odpowiedzi o 25%. Chętnie opowiem o decyzjach i ograniczeniach tego projektu.",
    sourceNotes: "",
    generatedAnswer: "",
    score: bob.exampleScore,
    summary: bob.exampleSummary,
    stage: "submitted",
    events: [{ stage: "submitted", at: "2026-11-02T09:00:00.000Z", note: "" }],
  });
  state.contributionCards.push({
    candidateId: bob.id,
    draft: {
      challenge: "Zespół obsługi tracił czas na ręczne klasyfikowanie powtarzalnych zgłoszeń.",
      contribution:
        "Zaprojektowałem badania, prototyp klasyfikacji i zasady przekazania trudnych przypadków człowiekowi.",
      aiUse:
        "Model proponował kategorię i szkic odpowiedzi; konsultant zawsze zatwierdzał wysyłkę.",
      outcome: "W fikcyjnym pilotażu średni czas pierwszej odpowiedzi spadł o 25%.",
      reflection:
        "Najtrudniejsze było rozpoznanie zgłoszeń, których model nie powinien obsługiwać.",
    },
    published: null,
    version: 0,
    publishedAt: null,
  });
  state.contributionCards[0].published = structuredClone(state.contributionCards[0].draft);
  state.contributionCards[0].version = 1;
  state.contributionCards[0].publishedAt = "2026-11-02T09:00:00.000Z";
  return stateSchema.parse(state);
}
export function publishedJobs(state: State): JobWithCompany[] {
  return state.jobs
    .filter((x) => x.publicationStatus === "published")
    .map((job) => ({ ...job, company: state.companies.find((x) => x.id === job.companyId)! }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function currentPerson(state: State) {
  return state.people.find((x) => x.id === state.activePersonId);
}
export function transition(
  state: State,
  action: Action,
  now = new Date().toISOString(),
  newId: string = crypto.randomUUID(),
): State {
  const s = structuredClone(state);
  const person = currentPerson(s);
  const fail = (message: string): never => {
    throw new Error(message);
  };
  const candidate = () => {
    if (person?.role !== "candidate") return fail("Wybierz profil kandydata.");
    return person;
  };
  const employer = () => {
    if (person?.role !== "employer") return fail("Wybierz profil pracodawcy.");
    return person;
  };
  if (action.type === "select_person") {
    if (action.id !== null && !s.people.some((x) => x.id === action.id))
      fail("Nie znaleziono osoby.");
    s.activePersonId = action.id;
  } else if (action.type === "profile")
    Object.assign(candidate(), profileSchema.parse(action.value));
  else if (action.type === "toggle_saved") {
    const p = candidate();
    if (!s.jobs.some((x) => x.id === action.jobId)) fail("Nie znaleziono oferty.");
    const index = s.saved.findIndex((x) => x.candidateId === p.id && x.jobId === action.jobId);
    if (index >= 0) s.saved.splice(index, 1);
    else s.saved.push({ candidateId: p.id, jobId: action.jobId });
  } else if (action.type === "draft") {
    const p = candidate();
    const draft = draftSchema.parse({ candidateId: p.id, ...action });
    s.drafts = s.drafts.filter((x) => !(x.candidateId === p.id && x.jobId === action.jobId));
    s.drafts.push(draft);
  } else if (action.type === "submit") {
    const p = candidate();
    const job = s.jobs.find((x) => x.id === action.jobId && x.publicationStatus === "published");
    if (!job) return fail("Oferta nie jest dostępna.");
    if (!action.consent) fail("Zatwierdź treść i zgodę na przesłanie aplikacji.");
    if (s.applications.some((x) => x.candidateId === p.id && x.jobId === job.id))
      fail("Aplikacja na tę ofertę została już wysłana.");
    s.applications.push(
      applicationSchema.parse({
        id: newId,
        candidateId: p.id,
        jobId: job.id,
        companyId: job.companyId,
        jobTitle: job.title,
        candidateName: p.name,
        cv: p.cv,
        answer: action.answer,
        sourceNotes: action.notes,
        generatedAnswer: action.generated,
        score: p.exampleScore,
        summary: p.exampleSummary,
        stage: "submitted",
        events: [{ stage: "submitted", at: now, note: "" }],
      }),
    );
    s.drafts = s.drafts.filter((x) => !(x.candidateId === p.id && x.jobId === job.id));
  } else if (action.type === "stage" || action.type === "withdraw") {
    const application = s.applications.find((x) => x.id === action.applicationId);
    if (!application) return fail("Nie znaleziono aplikacji.");
    const stage = action.type === "withdraw" ? "withdrawn" : action.stage;
    if (action.type === "withdraw") {
      const p = candidate();
      if (
        application.candidateId !== p.id ||
        ["hired", "rejected", "withdrawn"].includes(application.stage)
      )
        fail("Nie można wycofać tej aplikacji.");
    } else {
      const p = employer();
      if (application.companyId !== p.companyId || !nextStages[application.stage].includes(stage))
        fail("Ta zmiana etapu nie jest dostępna.");
    }
    application.stage = stage;
    application.events.push({ stage, at: now, note: action.type === "stage" ? action.note : "" });
  } else if (action.type === "publish") {
    const p = employer();
    const job = jobSchema.parse(action.job);
    if (job.companyId !== p.companyId) fail("Wybierz ofertę własnej firmy.");
    const index = s.jobs.findIndex((x) => x.id === job.id);
    if (index >= 0) {
      if (s.jobs[index].companyId !== p.companyId) fail("Nie można zmienić tej oferty.");
      s.jobs[index] = job;
    } else s.jobs.unshift(job);
  } else if (action.type === "company") {
    const p = employer();
    Object.assign(
      s.companies.find((x) => x.id === p.companyId)!,
      { name: shortText.parse(action.name), description: text.parse(action.description) },
    );
  } else if (action.type === "card_draft") {
    const p = candidate();
    const value = contributionSchema.parse(action.value);
    const card = s.contributionCards.find((c) => c.candidateId === p.id);
    if (card) card.draft = value;
    else
      s.contributionCards.push({
        candidateId: p.id,
        draft: value,
        published: null,
        version: 0,
        publishedAt: null,
      });
  } else if (action.type === "card_publish") {
    const p = candidate();
    const card = s.contributionCards.find((c) => c.candidateId === p.id);
    if (!card) return fail("Najpierw zapisz szkic karty.");
    if (cardSections.some((section) => card.draft[section].trim().length < 10))
      return fail("Uzupełnij każdą sekcję karty co najmniej 10 znakami.");
    card.published = structuredClone(card.draft);
    card.version += 1;
    card.publishedAt = now;
    for (const review of s.studyReviews.filter(
      (r) => s.applications.find((a) => a.id === r.applicationId)?.candidateId === p.id,
    )) {
      review.ratings = {};
      delete review.cardDecision;
      delete review.cardVersion;
    }
  } else if (action.type === "card_withdraw") {
    const p = candidate();
    const card = s.contributionCards.find((c) => c.candidateId === p.id);
    if (!card?.published) return fail("Karta nie jest opublikowana.");
    card.published = null;
    card.publishedAt = null;
    for (const review of s.studyReviews.filter(
      (r) => s.applications.find((a) => a.id === r.applicationId)?.candidateId === p.id,
    )) {
      review.ratings = {};
      delete review.cardDecision;
      delete review.cardVersion;
    }
  } else if (
    action.type === "study_rate" ||
    action.type === "study_decide" ||
    action.type === "study_restart"
  ) {
    const p = employer();
    const application = s.applications.find(
      (a) => a.id === action.applicationId && a.companyId === p.companyId,
    );
    if (!application) return fail("Nie znaleziono aplikacji własnej firmy.");
    if (action.type === "study_restart") {
      s.studyReviews = s.studyReviews.filter((r) => r.applicationId !== application.id);
      return stateSchema.parse(s);
    }
    let review = s.studyReviews.find((r) => r.applicationId === application.id);
    if (!review) {
      review = { applicationId: application.id, ratings: {} };
      s.studyReviews.push(review);
    }
    if ((action.type === "study_rate" || action.variant === "card") && !review.profileDecision)
      return fail("Najpierw zapisz decyzję na podstawie samego profilu.");
    if (action.type === "study_decide" && action.variant === "profile" && review.profileDecision)
      return fail(
        "Pierwsza decyzja jest już zapisana. Aby rozpocząć od nowa, zresetuj porównanie.",
      );
    if (action.type === "study_rate" || action.variant === "card") {
      const card = s.contributionCards.find((c) => c.candidateId === application.candidateId);
      if (!card?.published) return fail("Kandydat nie opublikował karty.");
      review.cardVersion = card.version;
      if (action.type === "study_rate") {
        if (
          !cardSections.includes(action.section) ||
          !Number.isInteger(action.rating) ||
          action.rating < 1 ||
          action.rating > 5
        )
          fail("Ocena sekcji musi być od 1 do 5.");
        review.ratings[action.section] = action.rating;
      }
    }
    if (action.type === "study_decide") {
      const decision = decisionSchema.parse({
        choice: action.choice,
        reason: action.reason,
        question: action.question,
        at: now,
      });
      if (action.variant === "profile") review.profileDecision = decision;
      else review.cardDecision = decision;
    }
  }
  return stateSchema.parse(s);
}
