import { describe, expect, it } from "vitest";
import type { CaptureResult } from "posthog-js";
import { analyticsSettings, publicPage, sanitizeAnalyticsEvent } from "./privacy";

const origin = "https://study.example.com";
const env = {
  VITE_POSTHOG_ENABLED: "true",
  VITE_POSTHOG_PROJECT_TOKEN: "phc_test",
  VITE_POSTHOG_HOST: "https://eu.i.posthog.com",
  VITE_POSTHOG_SITE_ORIGIN: origin,
};
const event: CaptureResult = {
  uuid: "event-id",
  event: "$pageview",
  timestamp: new Date("2026-11-23T19:00:00Z"),
  properties: {
    page: "/oferty",
    token: "phc_test",
    distinct_id: "random-browser-id",
    $session_id: "random-session-id",
    $current_url: `${origin}/?email=private@example.com#/oferty?q=private-search`,
    $referrer: "https://private.example.com/token",
    $elements: [{ tag_name: "textarea", text: "private project notes" }],
    $set: { email: "private@example.com" },
    $initial_current_url: "https://private.example.com/secret",
    answers: "private application answers",
  },
  $set: { name: "private name" },
  $set_once: { secret: "private secret" },
};

describe("analytics privacy boundaries", () => {
  it("does not activate in development, previews or incomplete/malformed configuration", () => {
    expect(analyticsSettings(env, true, origin)).not.toBeNull();
    expect(analyticsSettings(env, false, origin)).toBeNull();
    expect(analyticsSettings(env, true, "https://preview.example.com")).toBeNull();
    expect(analyticsSettings({}, true, origin)).toBeNull();
    expect(analyticsSettings({ ...env, VITE_POSTHOG_ENABLED: "false" }, true, origin)).toBeNull();
    expect(
      analyticsSettings({ ...env, VITE_POSTHOG_HOST: "https://unknown.test" }, true, origin),
    ).toBeNull();
    expect(
      analyticsSettings({ ...env, VITE_POSTHOG_PROJECT_TOKEN: "phx_personal" }, true, origin),
    ).toBeNull();
  });

  it("never emits a pageview for persona, profile, form or study routes", () => {
    for (const page of [
      "/auth/sign-in",
      "/app/profil",
      "/app/shortlista",
      "/aplikuj/job",
      "/firmy/private",
    ])
      expect(publicPage(page)).toBeNull();
    expect(
      sanitizeAnalyticsEvent(
        { ...event, properties: { ...event.properties, page: "/app/profil" } },
        origin,
      ),
    ).toBeNull();
  });

  it("strips private URLs, DOM, nested properties and person updates from allowed pageviews", () => {
    const result = sanitizeAnalyticsEvent(event, origin)!;
    expect(result.properties.$current_url).toBe(`${origin}/#/oferty`);
    expect(result.properties.distinct_id).toBe("random-browser-id");
    expect(result.properties.$process_person_profile).toBe(false);
    expect(result.uuid).toBe(event.uuid);
    expect(result.timestamp).toEqual(event.timestamp);
    expect(JSON.stringify(result)).not.toContain("private");
  });

  it("keeps the native Autocapture name and static CTA label without DOM contents", () => {
    const result = sanitizeAnalyticsEvent({ ...event, event: "$autocapture" }, origin)!;
    expect(result.event).toBe("$autocapture");
    expect(result.properties.$event_type).toBe("click");
    expect(result.properties.$el_text).toBe("Zobacz oferty");
    expect(result.properties.$current_url).toBe(`${origin}/#/`);
    expect(JSON.stringify(result)).not.toContain("private");
  });

  it("discards replay, logs, errors, copied content, person and custom events", () => {
    for (const name of [
      "$snapshot",
      "$exception",
      "$identify",
      "$copy_autocapture",
      "application_submitted",
    ])
      expect(sanitizeAnalyticsEvent({ ...event, event: name }, origin)).toBeNull();
  });
});
