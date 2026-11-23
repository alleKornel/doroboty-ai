import type { CaptureResult } from "posthog-js";

const publicPages = new Set(["/", "/oferty", "/metodologia", "/polityka-prywatnosci"]);

export function publicPage(pathname: string) {
  return publicPages.has(pathname) ? pathname : null;
}

export function analyticsSettings(
  env: Record<string, unknown>,
  production: boolean,
  currentOrigin: string,
) {
  const token = env.VITE_POSTHOG_PROJECT_TOKEN;
  const host = env.VITE_POSTHOG_HOST;
  const origin = env.VITE_POSTHOG_SITE_ORIGIN;
  if (
    !production ||
    env.VITE_POSTHOG_ENABLED !== "true" ||
    typeof token !== "string" ||
    !/^phc_[a-zA-Z0-9]+$/.test(token) ||
    (host !== "https://eu.i.posthog.com" && host !== "https://us.i.posthog.com") ||
    typeof origin !== "string" ||
    !origin.startsWith("https://") ||
    origin !== currentOrigin
  ) {
    return null;
  }
  return { token, host, origin };
}

// Keep only SDK delivery/session fields; discard DOM content, referrers and URL parameters.
const sdkProperties = [
  "token",
  "distinct_id",
  "$device_id",
  "$session_id",
  "$window_id",
  "$lib",
  "$lib_version",
] as const;

export function sanitizeAnalyticsEvent(event: CaptureResult, origin: string): CaptureResult | null {
  if (event.event !== "$pageview" && event.event !== "$autocapture") return null;
  const click = event.event === "$autocapture";
  const page = click ? "/" : publicPage(event.properties.page);
  if (page === null) return null;
  const properties: CaptureResult["properties"] = {};
  for (const key of sdkProperties) {
    const value: unknown = event.properties[key];
    if (typeof value === "string") properties[key] = value;
  }
  Object.assign(properties, {
    page,
    $current_url: `${origin}/#${page}`,
    $pathname: "/",
    $host: new URL(origin).host,
    $process_person_profile: false,
    environment: "production",
  });
  if (click) {
    // The only Autocapture-allowed element is this static homepage CTA.
    properties.$event_type = "click";
    properties.$el_text = "Zobacz oferty";
    properties.action = "browse_jobs";
  }
  return { uuid: event.uuid, event: event.event, timestamp: event.timestamp, properties };
}
