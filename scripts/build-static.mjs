#!/usr/bin/env node
/**
 * Produce a folder of HTML/JS/CSS. No Node process is required to host it.
 * Output: ./site
 *
 * Prerender at `/`. If FOLIO_BASE is `/folio-pdf/` (GitHub Pages project site),
 * rewrite absolute URLs afterwards. Nitro's static preset has no server entry;
 * Vite would otherwise try to SSR-bundle index.html and fail.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { join, extname } from "node:path";

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

if (!existsSync(join(from, "index.html")) || statSync(join(from, "index.html")).size === 0) {
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

const folioBase = (process.env.FOLIO_BASE || "/").replace(/\/$/, "");
if (folioBase) applyProjectBase(site, folioBase);

const routes = ["index.html", "merge/index.html", "protect/index.html", "outlook/index.html"];
for (const route of routes) {
  if (!existsSync(join(site, route))) {
    console.error("Missing", route);
    process.exit(1);
  }
}

console.log("Static site written to", site);
if (folioBase) console.log("URLs prefixed with", folioBase);
console.log("Copy that folder onto IIS, nginx, or GitHub Pages. No server to run.");

function applyProjectBase(dir, base) {
  const inject = `<meta name="folio-base" content="${base}"><script>window.__FOLIO_BASE=${JSON.stringify(base)};</script>`;
  for (const file of listFiles(dir)) {
    if (extname(file) !== ".html") continue;
    let text = readFileSync(file, "utf8");
    const original = text;
    if (!text.includes('name="folio-base"')) {
      text = text.replace(/<head[^>]*>/i, (m) => `${m}${inject}`);
    } else if (!text.includes("__FOLIO_BASE")) {
      text = text.replace(
        /<meta name="folio-base"[^>]*>/,
        (m) => `${m}<script>window.__FOLIO_BASE=${JSON.stringify(base)};</script>`,
      );
    }
    text = text.replace(/(href|src)=(["'])\/(?!\/)/g, `$1=$2${base}/`);
    text = text.replaceAll('"/assets/', `"${base}/assets/`);
    text = text.replaceAll("'/assets/", `'${base}/assets/`);
    if (text !== original) writeFileSync(file, text);
  }
}

function listFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) listFiles(p, out);
    else out.push(p);
  }
  return out;
}
