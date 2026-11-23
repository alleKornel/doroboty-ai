import type { PostHog } from "posthog-js";
import { analyticsSettings, sanitizeAnalyticsEvent } from "./privacy";

let client: Promise<PostHog | null> | undefined;

export function analyticsClient() {
  const settings = analyticsSettings(import.meta.env, import.meta.env.PROD, window.location.origin);
  if (!settings) return Promise.resolve(null);
  client ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(settings.token, {
        api_host: settings.host,
        defaults: "2026-08-30",
        capture_pageview: false,
        capture_pageleave: false,
        autocapture: {
          dom_event_allowlist: ["click"],
          element_allowlist: ["a", "button"],
          css_selector_allowlist: ['[data-analytics="browse-jobs"]'],
          capture_copied_text: false,
        },
        mask_all_text: true,
        mask_all_element_attributes: true,
        person_profiles: "never",
        persistence: "memory",
        ip: false,
        respect_dnt: true,
        disable_session_recording: true,
        enable_recording_console_log: false,
        capture_exceptions: false,
        capture_performance: false,
        capture_heatmaps: false,
        capture_dead_clicks: false,
        rageclick: false,
        disable_surveys: true,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
        before_send: (event) => sanitizeAnalyticsEvent(event, settings.origin),
      });
      return posthog;
    })
    .catch(() => null);
  return client;
}
