import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function folioBasepath(): string | undefined {
  const fromWindow =
    typeof globalThis !== "undefined"
      ? (globalThis as { __FOLIO_BASE?: string }).__FOLIO_BASE
      : undefined;
  const fromMeta =
    typeof document !== "undefined"
      ? document.querySelector('meta[name="folio-base"]')?.getAttribute("content")
      : undefined;
  const env = (import.meta.env.BASE_URL as string | undefined) || "/";
  const raw = fromWindow || fromMeta || (env === "/" ? "" : env);
  const base = (raw || "").replace(/\/$/, "");
  return base && base !== "/" ? base : undefined;
}

export function getRouter() {
  const basepath = folioBasepath();
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    ...(basepath ? { basepath } : {}),
  });
}
