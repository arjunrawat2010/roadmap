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

## Run locally with nginx

One command builds the app and serves it with nginx at **http://localhost:8080/**. Run it again after changes to rebuild and reload.

**Windows:** double-click `deploy\deploy.cmd`, or from a terminal in the repo folder:

```powershell
deploy\deploy.cmd               # build + start (or reload), opens the browser
deploy\deploy.cmd -Port 9000    # another port
deploy\deploy.cmd stop          # stop nginx
```

The first run downloads nginx for Windows from nginx.org into `.nginx\bin`. It doesn't install anything or need admin rights. If nginx is already on PATH, that copy is used instead.

**macOS / Linux:** install nginx (`brew install nginx` or `sudo apt install nginx`), then:

```bash
./deploy/deploy.sh               # or: npm run deploy
PORT=9000 ./deploy/deploy.sh
./deploy/deploy.sh stop
```

Everything nginx writes (config, logs, PID) goes in `.nginx/`, which git ignores. To change server settings, edit `deploy/nginx.conf.template`. nginx only listens on `127.0.0.1`, so other machines on your network can't reach it.

If Windows Smart App Control blocks `nginx.exe`, run the Mac/Linux steps inside WSL (Ubuntu) instead: `sudo apt install nginx`, then `./deploy/deploy.sh`. Windows browsers can open WSL's `localhost:8080` directly.

## Install as a desktop app

The site is an installable web app (PWA), so it runs in its own window with a desktop icon and works offline.

- **Chrome / Edge (Windows, macOS, Linux):** open the site (GitHub Pages or your local `http://localhost:8080/`), then click the install icon at the right end of the address bar (or menu → *Cast, save and share* → *Install page as app* in Chrome, or *Apps* → *Install this site as an app* in Edge).
- **Safari (macOS Sonoma or newer):** File → *Add to Dock*.

Updates come in automatically: after a new deploy, the next launch picks up the new version. Progress is shared with the same browser's copy of that address, so installing doesn't lose anything. The local site and the GitHub Pages site are different addresses, so each keeps its own progress.

## How it works

- **Data:** stages, resources, certifications and blogs are in `src/data.ts`.
- **State:** every tick, status change, note and repo link is saved in the browser's `localStorage` (`roadmap-state-v2`). A first visit starts at 0%. Progress is kept per browser and device, and is lost if you clear site data.
- **Progress:** Learn, Resources, Hands-on project and Done when items count toward progress. "Improve it" stretch goals don't.
- **Dates:** the week number, month and habit dates come from the start date (`START_DATE` in `src/data.ts`) and today's date.
- **Streak:** the streak counts consecutive weeks with all three Friday-review items ticked.
- **Theme:** follows the OS light/dark setting. The moon/sun button in the header overrides it.
- **Layout:** below 900px wide you get the mobile layout with a bottom tab bar.

Sample values to replace: the profile in `PROFILE` (`src/data.ts`).
