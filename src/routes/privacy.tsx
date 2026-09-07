import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <AppShell>
      <article className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-4xl tracking-tight">How Folio stays private</h1>
        <p className="mt-4 text-muted">
          Every tool runs in your browser. The PDF is read into memory in this tab, processed, and offered back as a
          download. There is no upload step and no account.
        </p>

        <h2 className="mt-10 font-display text-2xl">What leaves the machine</h2>
        <p className="mt-3 text-muted">
          The website files themselves (the page, scripts, fonts). Not your documents. Not passwords. Closing the tab
          clears the working copies from memory.
        </p>

        <h2 className="mt-10 font-display text-2xl">On a Windows PC</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
          <li>Open Folio in Microsoft Edge.</li>
          <li>
            Optional: open the browser menu, choose <strong className="text-fg">Apps</strong>, then{" "}
            <strong className="text-fg">Install this site as an app</strong>. That pins Folio to the Start menu.
          </li>
          <li>Drop a PDF. Work happens on that PC. Nothing is sent to a firm server unless you later email the result.</li>
        </ol>
        <p className="mt-3 text-muted">
          There is no Windows service to install and no extra programme to run. Staff do not host a server on their
          desks. IT can publish Folio as a static folder on IIS or the intranet — HTML and scripts only. The host still
          never sees the documents.
        </p>

        <h2 className="mt-10 font-display text-2xl">Static hosting</h2>
        <p className="mt-3 text-muted">
          Folio is a set of files. Build with <span className="font-medium text-fg">npm run build:static</span> and copy
          the site folder onto IIS, nginx, or GitHub Pages. No Node, Python, or database. Deep links such as Password
          protect still work because each tool is a page in that folder, with a fallback to the home page.
        </p>

        <h2 className="mt-10 font-display text-2xl">Outlook for Windows</h2>
        <p className="mt-3 text-muted">
          The Outlook add-in asks when you attach an unlocked PDF. If you lock it, encryption happens on that PC
          before the file is on the message. Folio does not receive the document or the password.{" "}
          <Link to="/outlook" className="text-primary underline-offset-2 hover:underline">
            Install the add-in
          </Link>
          .
        </p>

        <h2 className="mt-10 font-display text-2xl">Passwords</h2>
        <p className="mt-3 text-muted">
          Protect uses AES-256 in this tab. Unlock needs the existing password. Wrong passwords are rejected here; they
          are not tried against a remote service.
        </p>


        <p className="mt-10">
          <Link to="/" className="text-primary underline-offset-2 hover:underline">
            Back to tools
          </Link>
        </p>
      </article>
    </AppShell>
  );
}
