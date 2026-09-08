import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const env = (import.meta.env.BASE_URL as string | undefined) || "/";
  let basepath = env === "/" ? undefined : env.replace(/\/$/, "");
  if (!basepath && typeof document !== "undefined") {
    const tagged = document.querySelector('meta[name="folio-base"]')?.getAttribute("content");
    if (tagged && tagged !== "/") basepath = tagged.replace(/\/$/, "");
  }
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    ...(basepath ? { basepath } : {}),
  });
}
