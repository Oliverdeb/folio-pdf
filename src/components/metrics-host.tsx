import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { goatSite, trackPage } from "@/lib/metrics";

export function MetricsHost() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!goatSite()) return;
    trackPage(pathname);
  }, [pathname]);
  return null;
}
