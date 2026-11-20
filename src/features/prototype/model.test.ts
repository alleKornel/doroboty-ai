import { describe, expect, it } from "vitest";
import { initialState, transition, stateSchema, cardSections, type State } from "./model";
const time = "2026-11-03T10:00:00.000Z";
function as(state: State, id: string) {
  return transition(state, { type: "select_person", id });
}
function submitted() {
  const s = as(initialState(), "candidate-anna");
  return transition(
    s,
    {
      type: "submit",
      jobId: s.jobs[0].id,
      notes: "Original notes",
      generated: "Generated copy",
      answer: "Approved application with sufficient context.",
      consent: true,
    },
    time,
    "application-anna",
  );
}
describe("coherent browser scenario", () => {
  it("requires approval and prevents duplicate applications", () => {
    const s = as(initialState(), "candidate-anna");
    const input = {
      type: "submit" as const,
      jobId: s.jobs[0].id,
      notes: "",
      generated: "",
      answer: "Approved application with sufficient context.",
      consent: false,
    };
    expect(() => transition(s, input, time)).toThrow("Zatwierdź");
    expect(() => transition(submitted(), { ...input, consent: true }, time)).toThrow("już wysłana");
    expect(s.applications).toHaveLength(1);
  });
  it("preserves approved sources while profile and notes evolve", () => {
    const s = submitted();
    const app = s.applications.at(-1)!;
    const changed = transition(s, {
      type: "profile",
      value: {
        name: "Updated Name",
        headline: "Updated Headline",
        bio: "Changed",
        location: "Wrocław",
      },
    });
    expect(changed.applications.at(-1)).toEqual(app);
    expect(app.candidateName).toBe("Anna Kowalska");
    expect(app.sourceNotes).toBe("Original notes");
    expect(app.generatedAnswer).toBe("Generated copy");
  });
  it("supports employer review through conversation and continuation without skipping stages", () => {
    let s = as(submitted(), "employer-brightlabs");
    expect(() =>
      transition(
        s,
        { type: "stage", applicationId: "application-anna", stage: "continued", note: "" },
        time,
      ),
    ).toThrow();
    for (const stage of [
      "reviewed",
      "interview_invited",
      "first_conversation_held",
      "continued",
      "hired",
    ] as const)
      s = transition(
        s,
        { type: "stage", applicationId: "application-anna", stage, note: "Employer note" },
        time,
      );
    expect(s.applications.at(-1)?.stage).toBe("hired");
    expect(s.applications.at(-1)?.events).toHaveLength(6);
  });
  it("rejects another employer’s stage writes and another candidate’s withdrawal", () => {
    expect(() =>
      transition(
        as(submitted(), "employer-northstar"),
        { type: "stage", applicationId: "application-anna", stage: "reviewed", note: "" },
        time,
      ),
    ).toThrow();
    expect(() =>
      transition(
        as(submitted(), "candidate-marek"),
        { type: "withdraw", applicationId: "application-anna" },
        time,
      ),
    ).toThrow();
  });
  it("makes withdrawal terminal and keeps drafts and saved jobs person-specific", () => {
    let s = submitted();
    s = transition(s, { type: "withdraw", applicationId: "application-anna" }, time);
    expect(() =>
      transition(
        as(s, "employer-brightlabs"),
        { type: "stage", applicationId: "application-anna", stage: "reviewed", note: "" },
        time,
      ),
    ).toThrow();
    s = transition(s, {
      type: "draft",
      jobId: s.jobs[1].id,
      notes: "Notes",
      generated: "Output",
      answer: "Edited",
    });
    s = transition(s, { type: "toggle_saved", jobId: s.jobs[1].id });
    expect(s.drafts[0].candidateId).toBe("candidate-anna");
    expect(s.saved[0].candidateId).toBe("candidate-anna");
  });
  it("validates broken references, duplicate submissions and invalid histories on import", () => {
    const s = submitted();
    s.applications.push({ ...s.applications.at(-1)!, id: "another-id" });
    expect(stateSchema.safeParse(s).success).toBe(false);
    const broken = submitted();
    broken.applications.at(-1)!.events.push({ stage: "hired", at: time, note: "" });
    broken.applications.at(-1)!.stage = "hired";
    expect(stateSchema.safeParse(broken).success).toBe(false);
    const unknown = initialState();
    unknown.jobs[0].companyId = "missing";
    expect(stateSchema.safeParse(unknown).success).toBe(false);
    const unsafeLink = initialState();
    unsafeLink.companies[0].websiteUrl = "javascript:alert(1)";
    expect(stateSchema.safeParse(unsafeLink).success).toBe(false);
  });
  it("only publishes own-company jobs and keeps submitted job snapshots unchanged", () => {
    const state = as(submitted(), "employer-brightlabs");
    const updated = { ...state.jobs[0], title: "Updated public role" };
    const result = transition(state, { type: "publish", job: updated });
    expect(result.jobs[0].title).toBe("Updated public role");
    expect(result.applications.at(-1)?.jobTitle).toBe("AI Product Manager");
    expect(() =>
      transition(as(state, "employer-northstar"), { type: "publish", job: updated }),
    ).toThrow();
    expect(() =>
      transition(state, { type: "publish", job: { ...updated, salaryMin: 500, salaryMax: 1 } }),
    ).toThrow();
  });
});

describe("contribution card shortlist study", () => {
  it("keeps a draft private, publishes a snapshot and invalidates stale ratings only on republication", () => {
    let state = as(initialState(), "candidate-marek");
    const first = state.contributionCards[0].published;
    const revised = {
      ...state.contributionCards[0].draft,
      outcome: "Nowy fikcyjny rezultat projektu, opisany po dodatkowym teście.",
    };
    state = transition(state, { type: "card_draft", value: revised }, time);
    expect(state.contributionCards[0].published).toEqual(first);
    state = as(state, "employer-brightlabs");
    state = transition(
      state,
      {
        type: "study_decide",
        applicationId: "application-example",
        variant: "profile",
        choice: "hold",
        reason: "Potrzebuję większej jasności co do wkładu.",
        question: "",
      },
      time,
    );
    state = transition(
      state,
      { type: "study_rate", applicationId: "application-example", section: "outcome", rating: 4 },
      time,
    );
    state = transition(
      state,
      {
        type: "study_decide",
        applicationId: "application-example",
        variant: "card",
        choice: "invite",
        reason: "Opis wkładu jest wystarczająco konkretny.",
        question: "Jak sprawdzono jakość?",
      },
      time,
    );
    expect(state.studyReviews[0].ratings.outcome).toBe(4);
    state = as(state, "candidate-marek");
    state = transition(state, { type: "card_publish" }, time);
    expect(state.contributionCards[0].version).toBe(2);
    expect(state.contributionCards[0].published?.outcome).toBe(revised.outcome);
    expect(state.studyReviews[0].ratings).toEqual({});
    expect(state.studyReviews[0].cardDecision).toBeUndefined();
  });
  it("keeps study decisions separate from recruiting and rejects another firm's access", () => {
    const initial = initialState();
    const employer = as(initial, "employer-brightlabs");
    const reviewed = transition(
      employer,
      {
        type: "study_decide",
        applicationId: "application-example",
        variant: "profile",
        choice: "hold",
        reason: "Potrzebuję więcej informacji o roli.",
        question: "Jaka była Twoja odpowiedzialność?",
      },
      time,
    );
    expect(reviewed.applications).toEqual(initial.applications);
    expect(reviewed.studyReviews[0].profileDecision?.choice).toBe("hold");
    expect(() =>
      transition(
        employer,
        { type: "study_rate", applicationId: "application-example", section: "outcome", rating: 5 },
        time,
      ),
    ).toThrow("Najpierw zapisz decyzję");
    expect(() =>
      transition(
        as(initial, "employer-northstar"),
        { type: "study_rate", applicationId: "application-example", section: "outcome", rating: 5 },
        time,
      ),
    ).toThrow("własnej firmy");
    expect(() =>
      transition(
        as(initial, "candidate-marek"),
        { type: "study_rate", applicationId: "application-example", section: "outcome", rating: 5 },
        time,
      ),
    ).toThrow("pracodawcy");
  });
  it("rejects invalid ratings, incomplete publication and stale imported reviews", () => {
    let state = as(initialState(), "candidate-anna");
    state = transition(state, {
      type: "card_draft",
      value: { challenge: "Krótko", contribution: "", aiUse: "", outcome: "", reflection: "" },
    });
    expect(() => transition(state, { type: "card_publish" }, time)).toThrow("co najmniej 10");
    const employer = transition(
      as(initialState(), "employer-brightlabs"),
      {
        type: "study_decide",
        applicationId: "application-example",
        variant: "profile",
        choice: "hold",
        reason: "Sprawdzę zakres odpowiedzialności.",
        question: "",
      },
      time,
    );
    expect(() =>
      transition(
        employer,
        { type: "study_rate", applicationId: "application-example", section: "outcome", rating: 6 },
        time,
      ),
    ).toThrow("od 1 do 5");
    const rated = transition(
      employer,
      {
        type: "study_rate",
        applicationId: "application-example",
        section: cardSections[0],
        rating: 5,
      },
      time,
    );
    rated.studyReviews[0].cardVersion = 99;
    expect(stateSchema.safeParse(rated).success).toBe(false);
  });
});
