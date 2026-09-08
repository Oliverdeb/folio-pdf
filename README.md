# Folio

Private PDF tools that run in the browser. Combine, split, convert, compress, stamp, lock and unlock documents on this device — files are not uploaded.

| Tool | What it does |
| --- | --- |
| Combine PDFs | Join files in the order you set |
| Split / extract | Pull pages out, or break a bundle into files |
| Compress | Shrink a PDF for email |
| Stamp & Bates | Watermark, page numbers, exhibit labels |
| Rearrange | Reorder or drop pages |
| Photos to PDF | JPEG/PNG to A4 or letter |
| PDF to images | One PNG per page (zip) |
| Word to PDF | Convert a `.docx` letter |
| Password protect | AES-256 lock |
| Remove password | Unlock a file you already have the key for |
| Outlook add-in | Ask to lock unlocked PDFs when you attach them in Outlook for Windows |

Nothing in that list is sent to a server. The host only serves the page.

---

## 1. Put Folio on a website

Needs [Node.js 22](https://nodejs.org/) **once**, to build. After that there is no Node process.

```bash
npm install
npm run build:static
```

That writes a `site/` folder: HTML, JavaScript, CSS, fonts, samples, and the Outlook add-in files. Copy that folder onto IIS, nginx, Apache, or GitHub Pages.

Do not double-click `index.html` on disk. Serve the folder over http(s). HTTPS is required for the Outlook add-in.

### IIS (Windows)

1. Copy `site` to e.g. `C:\inetpub\wwwroot\folio`.
2. Install the [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) module if it is not already there (`web.config` is included). Deep links such as `/protect` and `/outlook/pane` must fall back to the app.
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

### GitHub Pages (free public site)

The repo must be **public** on GitHub’s free plan. The live URL will be:

**https://oliverdeb.github.io/folio-pdf/**

1. On GitHub: **Settings → General → Danger zone → Change visibility → Public**.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push (or wait for) the workflow in `.github/workflows/pages.yml`. **Actions** should show **GitHub Pages** in green.
4. Open https://oliverdeb.github.io/folio-pdf/

`404.html` is a copy of the home page so `/protect` and `/outlook` still load. The workflow sets the app’s base path to `/folio-pdf/` so scripts and samples resolve.

If you later attach a custom domain at the site root, follow **Custom domain** below.

Download the Outlook add-in from **this** Pages URL (not from a copy of the repo) so the XML points at GitHub Pages.

### Custom domain

A custom domain (for example `folio.yourfirm.com`) serves Folio at the **root** of that host, not under `/folio-pdf/`. Do this after Pages is already working.

**1. DNS at your registrar**

For a subdomain (`folio.yourfirm.com`):

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `folio` | `oliverdeb.github.io` |

For an apex domain (`yourfirm.com`):

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

Optional: CNAME `www` → `oliverdeb.github.io`, then set both `www` and the apex in GitHub.

TTL 300–600 seconds is enough. Wait until `folio.yourfirm.com` resolves to GitHub before the next step.

**2. Tell GitHub the name**

Repo → **Settings → Pages → Custom domain** → enter `folio.yourfirm.com` → **Save**. Wait for DNS check. Tick **Enforce HTTPS** when it appears (can take up to an hour).

**3. Rebuild Folio at `/`**

Repo → **Settings → Secrets and variables → Actions → Variables → New repository variable**

| Name | Value |
| --- | --- |
| `FOLIO_BASE` | `/` |

Then **Actions → GitHub Pages → Run workflow**. When it is green, open `https://folio.yourfirm.com`. `/protect` and `/outlook` must load.

**4. Outlook add-in**

Open **Outlook add-in** on the **custom domain** and download the XML again. The old GitHub.io XML will still point at `oliverdeb.github.io/folio-pdf`.

If the page is blank after switching domain, `FOLIO_BASE` is still `/folio-pdf/` — set the variable to `/` and re-run the workflow.



---

## 2. Use Folio in the browser

1. Open the published site in Edge or Chrome.
2. Pick a tool, or start with **Combine PDFs**.
3. Drop a file (or use a sample on the page).
4. Download the result. Closing the tab clears the working copy from memory.

**Password protect:** password must be at least 4 characters, entered twice. Printing stays allowed; editing is not. **Remove password** needs the existing password; a wrong one is rejected on this PC, not against a remote service.

Optional on Windows: Edge **⋯ → Apps → Install this site as an app** pins Folio to the Start menu. There is no extra Windows service.

---

## 3. Outlook for Windows add-in

The add-in watches a draft. Attach a PDF that is **not** password-protected, and Folio asks whether to lock it. If you lock it, AES-256 runs on that PC and the draft attachment is replaced. The mail host never sees the password.

Works in **new Outlook** and **classic Outlook** on Windows. The add-in file (`folio-outlook.xml`) is generated from the address of the Folio site you are looking at — download it from the live site, not from a copy of the repo.

### Install (one PC)

1. Publish Folio first (section 1) so staff can open it in a browser.
2. On that same site, open **Outlook add-in**.
3. Choose **Download Outlook add-in**. Save `folio-outlook.xml`.
4. In Outlook for Windows:
   - **Home → Get Add-ins** (or **All Apps → Add apps**)
   - **My add-ins → Add a custom add-in → Add from file**
   - Choose `folio-outlook.xml`
5. Restart Outlook.

You should see a **Folio → Lock PDFs** button on the Message tab when composing.

If **Add from file** is missing, the organisation has turned off custom add-ins. Ask IT to allow them, or use the firm-wide deploy below.

### Use

1. Compose a new email (or meeting).
2. Attach a PDF that is not locked.
3. A banner appears: *this file is not password-protected — lock it with Folio?*
4. Choose **Lock PDFs**.
5. Enter a password (at least 4 characters) and confirm.
6. **Lock this PDF** replaces the attachment on the draft. **Keep unlocked** leaves it as it is.

Already-locked PDFs are ignored. Pictures and Word files are ignored.

If you send while a PDF is still unlocked, Outlook asks again: go back and lock, or send anyway.

You can open the pane at any time with the **Lock PDFs** ribbon button.

### Firm-wide deploy

1. Download `folio-outlook.xml` from the live Folio site (so the URLs inside it match).
2. In the [Microsoft 365 admin center](https://admin.microsoft.com): **Settings → Integrated apps → Upload custom apps**.
3. Upload the XML and assign it to users or a group.

Everyone then gets **Lock PDFs** without sideloading. The add-in still talks only to your Folio site; PDFs are encrypted on each sender’s PC.

### If it does not appear

- Confirm Folio is served over **https** at the same address baked into the XML (open the XML and check the `DefaultValue` URLs).
- Restart Outlook after adding the file.
- Deep links must work: in a browser, `…/outlook/pane` and `…/outlook/commands.js` should load (IIS URL Rewrite / nginx `try_files`).
- Classic Outlook: use a current Microsoft 365 build. Event banners need Mailbox 1.12+.
- The ribbon button still works even if the attach-banner does not; use **Lock PDFs** by hand, then send.

---

## Develop

Needs [Node.js 22](https://nodejs.org/).

```bash
npm install
npm run dev
```

- `npm run build` — production app (hosted preview)
- `npm run build:static` — files-only folder in `site/`
- `npm run test:unit` — library tests (merge, split, lock/unlock, Outlook detect)
