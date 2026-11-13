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

## How it works

- **Data:** stages, resources, certifications and blogs are in `src/data.ts`.
- **State:** every tick, status change, note and repo link is saved in the browser's `localStorage` (`roadmap-state-v2`). A first visit starts at 0%. Progress is kept per browser and device, and is lost if you clear site data.
- **Progress:** Learn, Resources, Hands-on project and Done when items count toward progress. "Improve it" stretch goals don't.
- **Dates:** the week number, month and habit dates come from the start date (`START_DATE` in `src/data.ts`) and today's date.
- **Streak:** the streak counts consecutive weeks with all three Friday-review items ticked.
- **Theme:** follows the OS light/dark setting. The moon/sun button in the header overrides it.
- **Layout:** below 900px wide you get the mobile layout with a bottom tab bar.

Sample values to replace: the profile in `PROFILE` (`src/data.ts`).
