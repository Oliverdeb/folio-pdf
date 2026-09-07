# Folio

Private PDF tools that run in the browser. Combine, split, convert, compress, stamp, lock and unlock documents on this device — files are not uploaded.

## Host as a static site (no Node to run)

```bash
npm install
npm run build:static
```

That writes a `site/` folder: HTML, JavaScript, CSS, fonts, and samples. Copy that folder onto IIS, nginx, Apache, or GitHub Pages. There is **no server process**. The host only hands the page to the browser. PDFs never leave the PC that opened it.

Do not double-click `index.html` on disk. Serve the folder over http(s).

### IIS (Windows)

1. Copy `site` to e.g. `C:\inetpub\wwwroot\folio`.
2. Install the [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) module if it is not already there (`web.config` is included).
3. Confirm `.mjs` is served as JavaScript (the included `web.config` does this).
4. Open the site in Edge. Optional: **⋯ → Apps → Install this site as an app**.

### nginx

```nginx
root /var/www/folio;
index index.html;
location / {
  try_files $uri $uri/ /index.html;
}
```

### GitHub Pages

Upload the `site` folder (or point Pages at it). `404.html` is a copy of `index.html` so `/merge` and `/protect` still load.

## Develop

Needs [Node.js 22](https://nodejs.org/).

```bash
npm install
npm run dev
```

- `npm run build` — production app (for the hosted preview)
- `npm run build:static` — files-only folder in `site/`
- `npm run test:unit` — library tests (merge, split, lock/unlock, …)
