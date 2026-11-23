import { useEffect } from "react";
import { useLocation } from "react-router";
import { analyticsClient } from "./client";
import { publicPage } from "./privacy";

export function AnalyticsPageviews() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = publicPage(pathname);
    if (page === null) return;
    let active = true;
    void analyticsClient()
      .then((client) => {
        if (active) client?.capture("$pageview", { page });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);
  return null;
}
