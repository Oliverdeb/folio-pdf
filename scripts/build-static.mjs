#!/usr/bin/env node
/**
 * Produce a folder of HTML/JS/CSS. No Node process is required to host it.
 * Output: ./site
 *
 * TanStack Start + Nitro static prerenders the pages, then Vite may still try
 * a Nitro server bundle and fail. If index.html is already on disk, we treat
 * the export as done.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const site = join(root, "site");
const from = join(root, ".output", "public");

const build = spawnSync(
  process.execPath,
  ["scripts/with-app-env.mjs", "vite", "build"],
  {
    stdio: "inherit",
    env: { ...process.env, FOLIO_STATIC: "1" },
  },
);

if (!existsSync(join(from, "index.html"))) {
  console.error("Static build did not write index.html.");
  process.exit(build.status || 1);
}

if (build.status) {
  console.warn("Vite exited %s after prerender; using .output/public anyway.", build.status);
}

rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
cpSync(from, site, { recursive: true });
copyFileSync(join(site, "index.html"), join(site, "404.html"));
writeFileSync(join(site, ".nojekyll"), "");

if (!existsSync(join(site, "web.config"))) {
  const webConfig = join(root, "public", "web.config");
  if (existsSync(webConfig)) copyFileSync(webConfig, join(site, "web.config"));
}

const routes = [
  "index.html",
  "merge/index.html",
  "protect/index.html",
  "unlock/index.html",
  "privacy/index.html",
];
for (const route of routes) {
  if (!existsSync(join(site, route))) {
    console.error("Missing", route);
    process.exit(1);
  }
}

console.log("Static site written to", site);
console.log("Copy that folder onto IIS, nginx, or GitHub Pages. No server to run.");
