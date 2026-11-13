# AI Platform Architect Roadmap

A personal 6-month learning tracker: an overview dashboard, a page per stage with checklists, notes and repo links, a progress tracker, a resources library and an "Ongoing" page for certifications, reading and the weekly habit.

Built with React 18, TypeScript and Vite, from the Claude Design handoff (`RoadmapApp.dc.html`, CATS-Nova design system).

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve the build
```

`dist/` is a static site that works from any path (it uses hash routes like `#/stage/2`), so GitHub Pages, Netlify or any static host will work.

**GitHub Pages:** `.github/workflows/deploy.yml` builds and deploys on every push to `main`. One-time setup: Settings → Pages → Build and deployment → Source: **GitHub Actions**. The site is served at https://arjunrawat2010.github.io/roadmap/.

## Install as a desktop app

The site is an installable web app (PWA), so it runs in its own window with a desktop icon and works offline.

- **Chrome / Edge (Windows, macOS, Linux):** open the site, then click the install icon at the right end of the address bar (or menu → *Cast, save and share* → *Install page as app* in Chrome, or *Apps* → *Install this site as an app* in Edge).
- **Safari (macOS Sonoma or newer):** File → *Add to Dock*.

Updates come in automatically: after a new deploy, the next launch picks up the new version. Progress is shared with the same browser's copy of the site, so installing doesn't lose anything.

## Windows app (.exe)

The app is also packaged with Electron as a Windows desktop program.

- **Download:** grab `Roadmap-Setup-<version>.exe` (installer) or `Roadmap-Portable-<version>.exe` (no install, just run) from the repo's **Releases** page.
- **New release:** bump `version` in `package.json`, then push a matching tag, for example `git tag v1.0.1 && git push origin v1.0.1`. `.github/workflows/release.yml` builds on Windows and attaches both `.exe` files to a GitHub Release.
- **Local build:** `npm run dist:win` on Windows (on macOS/Linux it needs Wine). Output goes to `release/`. `npm run electron` runs the desktop app without packaging. `npm run dist:mac` and `npm run dist:linux` build for those systems.

The `.exe` isn't code-signed, so Windows SmartScreen warns the first time: click **More info → Run anyway**. The desktop app keeps its own progress, separate from the website's.

## How it works

- **Data:** stages, resources, certifications and blogs are in `src/data.ts`.
- **State:** every tick, status change, note and repo link is saved in the browser's `localStorage` (`roadmap-state-v2`). A first visit starts at 0%. Progress is kept per browser and device, and is lost if you clear site data.
- **Progress:** Learn, Resources, Hands-on project and Done when items count toward progress. "Improve it" stretch goals don't.
- **Dates:** the week number, month and habit dates come from the start date (`START_DATE` in `src/data.ts`) and today's date.
- **Streak:** the streak counts consecutive weeks with all three Friday-review items ticked.
- **Theme:** follows the OS light/dark setting. The moon/sun button in the header overrides it.
- **Layout:** below 900px wide you get the mobile layout with a bottom tab bar.

Sample values to replace: the profile in `PROFILE` (`src/data.ts`).
