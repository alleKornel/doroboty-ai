import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "./field";
import { PageTitle, Empty } from "./shell";
import { usePrototype } from "./store";
import {
  cardLabels,
  cardSections,
  currentPerson,
  type Application,
  type Contribution,
  type State,
} from "./model";

const blankCard = (): Contribution => ({
  challenge: "",
  contribution: "",
  aiUse: "",
  outcome: "",
  reflection: "",
});

export function ContributionEditor() {
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const card = state.contributionCards.find((item) => item.candidateId === person.id);
  const [draft, setDraft] = useState<Contribution>(card?.draft ?? blankCard());
  const [message, setMessage] = useState("");
  function save() {
    if (run({ type: "card_draft", value: draft }))
      setMessage("Prywatny szkic zapisany w tej przeglądarce.");
  }
  function publish() {
    if (!run({ type: "card_draft", value: draft })) return;
    if (run({ type: "card_publish" }))
      setMessage("Karta opublikowana. Pracodawca zobaczy tę wersję w badaniu.");
  }
  return (
    <section className="study-layout">
      <PageTitle>Karta wkładu w projekt</PageTitle>
      <p className="study-intro">
        Opisz swój udział w fikcyjnym projekcie. Szkic nie jest widoczny w widoku pracodawcy.
        Pracodawca zobaczy dopiero wersję opublikowaną. Późniejsza edycja szkicu nie zmienia
        publikacji.
      </p>
      <div className="study-grid">
        <div className="prototype-panel study-panel">
          <div className="study-section-heading">
            <div>
              <span className="study-eyebrow">Kandydat · szkic</span>
              <h2>Edytuj kartę</h2>
            </div>
            <span className="study-status">
              {card?.published ? `Opublikowana · wersja ${card.version}` : "Nieopublikowana"}
            </span>
          </div>
          <div className="study-fields">
            {cardSections.map((section) => (
              <Field key={section} label={cardLabels[section]}>
                <Textarea
                  value={draft[section]}
                  maxLength={1200}
                  rows={4}
                  onChange={(event) => setDraft({ ...draft, [section]: event.target.value })}
                  aria-describedby={`${section}-hint`}
                />
                <span id={`${section}-hint`} className="study-hint">
                  Co najmniej 10 znaków przed publikacją · {draft[section].length}/1200
                </span>
              </Field>
            ))}
          </div>
          <div className="study-actions">
            <Button type="button" variant="outline" onClick={save}>
              Zapisz prywatny szkic
            </Button>
            <Button type="button" onClick={publish}>
              Opublikuj tę wersję
            </Button>
            {card?.published && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (
                    window.confirm("Wycofać opublikowaną kartę? Oceny tej wersji zostaną usunięte.")
                  ) {
                    if (run({ type: "card_withdraw" })) setMessage("Publikacja wycofana.");
                  }
                }}
              >
                Wycofaj publikację
              </Button>
            )}
          </div>
          {message && (
            <p role="status" className="study-message">
              {message}
            </p>
          )}
        </div>
        <aside className="prototype-panel study-panel" aria-label="Podgląd karty">
          <span className="study-eyebrow">Podgląd szkicu</span>
          <h2>{person.name}</h2>
          <p className="study-muted">{person.headline}</p>
          <ContributionView value={draft} />
          {card?.published && (
            <div className="study-published-preview">
              <span className="study-eyebrow">Wersja {card.version} widoczna dla pracodawcy</span>
              <ContributionView value={card.published} />
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function ContributionView({ value }: { value: Contribution }) {
  return (
    <div className="study-card-sections">
      {cardSections.map((section) => (
        <section key={section} className="study-card-section">
          <h3>{cardLabels[section]}</h3>
          <p>{value[section] || "Ta sekcja jest pusta."}</p>
        </section>
      ))}
    </div>
  );
}

const choices = [
  ["invite", "Zaprosić"],
  ["hold", "Wstrzymać"],
  ["reject", "Odrzucić"],
] as const;

function DecisionForm({
  applicationId,
  variant,
  review,
}: {
  applicationId: string;
  variant: "profile" | "card";
  review: State["studyReviews"][number] | undefined;
}) {
  const { run } = usePrototype();
  const decision = variant === "profile" ? review?.profileDecision : review?.cardDecision;
  const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (
      run({
        type: "study_decide",
        applicationId,
        variant,
        choice: String(data.get("choice")) as "invite" | "hold" | "reject",
        reason: String(data.get("reason")),
        question: String(data.get("question")),
      })
    )
      setMessage("Decyzja badawcza zapisana lokalnie.");
  }
  return (
    <form
      className="study-decision"
      onSubmit={submit}
      key={`${applicationId}-${variant}-${decision?.at ?? "new"}`}
    >
      <h3>Decyzja na podstawie tego widoku</h3>
      <Field label="Co zrobisz dalej?">
        <select name="choice" className="native-select" defaultValue={decision?.choice ?? "hold"}>
          {choices.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Dlaczego?">
        <Textarea
          name="reason"
          required
          minLength={10}
          maxLength={1200}
          defaultValue={decision?.reason ?? ""}
          rows={3}
        />
      </Field>
      <Field label="Pytanie do kandydata (opcjonalnie)">
        <Textarea
          name="question"
          maxLength={1200}
          defaultValue={decision?.question ?? ""}
          rows={2}
        />
      </Field>
      <Button type="submit">Zapisz decyzję</Button>
      {message && (
        <p role="status" className="study-message">
          {message}
        </p>
      )}
    </form>
  );
}

function CandidateComparison({ application }: { application: Application }) {
  const { state, run } = usePrototype();
  const card = state.contributionCards.find((item) => item.candidateId === application.candidateId);
  const review = state.studyReviews.find((item) => item.applicationId === application.id);
  const ratings = review?.ratings ?? {};
  const complete =
    card?.published && cardSections.every((section) => ratings[section] !== undefined);
  const average = complete
    ? cardSections.reduce((sum, section) => sum + (ratings[section] ?? 0), 0) / cardSections.length
    : 0;
  const studyScore = complete ? Math.round(application.score * 0.7 + average * 20 * 0.3) : null;
  const person = state.people.find((item) => item.id === application.candidateId);
  return (
    <div className="study-comparison">
      <div className="study-section-heading">
        <div>
          <span className="study-eyebrow">Ta sama aplikacja · dwa widoki</span>
          <h2>{application.candidateName}</h2>
        </div>
        <Link
          className={buttonVariants({ variant: "outline" })}
          to={`/app/kandydaci/${application.id}`}
        >
          Zobacz proces
        </Link>
      </div>
      <p className="study-muted">
        {application.jobTitle} · Dane są fikcyjne. Oceny w badaniu nie zmieniają etapu rekrutacji.
      </p>
      <div className="study-variants">
        <article className="prototype-panel study-panel">
          <span className="study-eyebrow">Wariant A · tylko profil</span>
          <h3>{person?.headline ?? application.candidateName}</h3>
          <p>{person?.bio}</p>
          <div className="study-fact">
            <span>Dotychczasowy Match Score</span>
            <strong>{application.score}%</strong>
          </div>
          <p className="study-muted">{application.summary}</p>
          {review?.profileDecision ? (
            <div className="study-locked-decision">
              <strong>Decyzja A zapisana</strong>
              <p>
                {choices.find(([value]) => value === review.profileDecision?.choice)?.[1]} ·{" "}
                {review.profileDecision.reason}
              </p>
            </div>
          ) : (
            <DecisionForm applicationId={application.id} variant="profile" review={review} />
          )}
        </article>
        {review?.profileDecision ? (
          <article className="prototype-panel study-panel">
            <span className="study-eyebrow">Wariant B · profil i karta wkładu</span>
            <h3>{person?.headline ?? application.candidateName}</h3>
            <p>{person?.bio}</p>
            {card?.published ? (
              <>
                <ContributionView value={card.published} />
                <p className="study-muted">
                  Opublikowana wersja {card.version}. Oceń tylko widoczne treści, od 1 do 5.
                </p>
                <div className="study-ratings">
                  {cardSections.map((section) => (
                    <label key={section} className="study-rating">
                      <span>{cardLabels[section]}</span>
                      <select
                        aria-label={`Ocena: ${cardLabels[section]}`}
                        className="native-select"
                        value={ratings[section] ?? ""}
                        onChange={(event) =>
                          run({
                            type: "study_rate",
                            applicationId: application.id,
                            section,
                            rating: Number(event.target.value),
                          })
                        }
                      >
                        <option value="">Wybierz ocenę</option>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating}/5
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
                <div className="study-score" aria-live="polite">
                  <span>Wynik eksperymentalny</span>
                  <strong>{studyScore === null ? "Oceń 5 sekcji" : `${studyScore}/100`}</strong>
                  <small>
                    70% dotychczasowy Match Score + 30% średnia ocen karty. Wskaźnik tylko do
                    badania, bez wpływu na proces.
                  </small>
                </div>
                <DecisionForm applicationId={application.id} variant="card" review={review} />
              </>
            ) : (
              <Empty>
                Karta nie jest opublikowana. Kandydat może ją przygotować w swoim widoku.
              </Empty>
            )}
          </article>
        ) : (
          <article className="prototype-panel study-panel study-locked-variant">
            <span className="study-eyebrow">Wariant B · profil i karta wkładu</span>
            <h3>Najpierw zapisz decyzję A</h3>
            <p className="study-muted">
              Po zapisaniu oceny samego profilu zobaczysz kartę projektu i ocenisz drugi wariant.
            </p>
          </article>
        )}
      </div>
      <div className="prototype-panel study-summary">
        <h3>Podsumowanie porównania</h3>
        <p>
          Profil:{" "}
          <strong>
            {choices.find(([value]) => value === review?.profileDecision?.choice)?.[1] ??
              "Brak decyzji"}
          </strong>
        </p>
        <p>
          Profil + karta:{" "}
          <strong>
            {choices.find(([value]) => value === review?.cardDecision?.choice)?.[1] ??
              "Brak decyzji"}
          </strong>
        </p>
        {review?.profileDecision?.reason && <p>Uzasadnienie A: {review.profileDecision.reason}</p>}
        {review?.cardDecision?.reason && <p>Uzasadnienie B: {review.cardDecision.reason}</p>}
        {review?.profileDecision?.question && <p>Pytanie A: {review.profileDecision.question}</p>}
        {review?.cardDecision?.question && <p>Pytanie B: {review.cardDecision.question}</p>}
        {(review?.profileDecision || review?.cardDecision) && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Rozpocząć to porównanie od nowa? Zapisane decyzje i oceny tej aplikacji zostaną usunięte.",
                )
              )
                run({ type: "study_restart", applicationId: application.id });
            }}
          >
            Rozpocznij porównanie od nowa
          </Button>
        )}
      </div>
    </div>
  );
}

export function ShortlistStudy() {
  const { state } = usePrototype();
  const employer = currentPerson(state)!;
  const applications = state.applications.filter((item) => item.companyId === employer.companyId);
  const [selectedId, setSelectedId] = useState("");
  const selected = applications.find((item) => item.id === selectedId) ?? applications[0];
  return (
    <section className="study-layout">
      <PageTitle>Badanie shortlisty</PageTitle>
      <p className="study-intro">
        Porównaj dwie wersje tej samej aplikacji. Najpierw podejmij decyzję na podstawie profilu,
        potem przeczytaj kartę projektu i zapisz drugą decyzję. To ćwiczenie na danych fikcyjnych,
        zapisane tylko w tej przeglądarce.
      </p>
      {applications.length ? (
        <>
          <Field label="Wybierz aplikację">
            <select
              className="native-select study-picker"
              value={selected?.id}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {applications.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.candidateName} · {item.jobTitle}
                </option>
              ))}
            </select>
          </Field>
          {selected && <CandidateComparison key={selected.id} application={selected} />}
        </>
      ) : (
        <Empty>
          Ta firma nie ma jeszcze aplikacji. Przełącz się na kandydata i wyślij przykładową
          aplikację.
        </Empty>
      )}
    </section>
  );
}
