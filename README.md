# Folio

Private PDF tools that run in the browser. Combine, split, convert, compress, stamp, lock and unlock documents on this device — files are not uploaded.

## Run it

Needs [Node.js 22](https://nodejs.org/).

```bash
npm install
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080) in Edge or Chrome.

- `npm run build` — production build
- `npm run test:unit` — library tests (merge, split, lock/unlock, …)

## On Windows

Open Folio in Microsoft Edge. Optional: **⋯ → Apps → Install this site as an app** to pin it to the Start menu. There is no extra Windows service. PDFs stay on that PC.

To host it for the firm, deploy the production build as a website (the host only serves the page; it never sees the documents).
