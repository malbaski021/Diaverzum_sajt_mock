# Diaverzum Novi Sad

> [!IMPORTANT]
> **Status:** The site is complete and its admin panel is fully functional for content updates. The production domain [www.diaverzum.rs](https://www.diaverzum.rs) is reserved, but the exact go-live date is not yet confirmed.

Website for the diabetes patients' association **"Diaverzum Novi Sad"**. It combines a public-facing site (news, blog, events, information about diabetes, members, contact, donations, and a "Juniori" section for young people) with an integrated admin panel through which all content is added, edited, archived, and deleted — with no manual deploy step.

The site's language is Serbian (Latin script only). The visual design is inspired by [plavikrug.org](https://plavikrug.org).

> [!NOTE]
> **This project was built entirely with the help of artificial intelligence** (Claude Code) — from architecture and code, through the design system, to this documentation. The repository doubles as a practical example of AI-assisted development of a production Next.js application.

---

## Table of contents

- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Content model](#content-model)
- [Admin panel](#admin-panel)
- [Design system](#design-system)
- [Running locally](#running-locally)
- [Environment configuration](#environment-configuration)
- [Build and checks](#build-and-checks)
- [Security](#security)

---

## Key features

- **Static-first architecture** — no database. Content lives as MDX files, JSON, and images inside the repository.
- **Deploy-free admin panel** — in production, edits are committed straight into the Git repository via the GitHub Contents API, which automatically triggers a redeploy.
- **Server-side rendering / SSG** — public pages are statically generated (`generateStaticParams` for every `[slug]` route).
- **Client-side search** — news, blog, and events are filtered on the client via a URL query parameter (`?q=`).
- **Accessibility (WCAG 2.1 AA)** — semantic HTML, visible focus indicators, ARIA attributes, skip-to-content link.
- **Responsive design** — mobile hamburger menu, fluid grid, lightbox galleries.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Content | MDX (`next-mdx-remote` + `gray-matter`) |
| Dates | `date-fns` (locale `srLatn`) |
| Search | `use-debounce` + URL query, client-side filter |
| Images | Local `<img>` wrapper (`components/Img.tsx`) — deliberately **not** `next/image` |
| Persistence (prod) | GitHub Contents API |
| Persistence (dev) | Direct file system writes |
| Testing | Vitest |
| Linting | `next/core-web-vitals` + `next/typescript` |
| Runtime | Node.js 18.x, npm |

---

## Architecture

The site has no database. All content is stored as files in the repository and loaded through the loaders in `lib/`:

- `lib/mdx.ts` — blog and news
- `lib/events.ts` — events
- `lib/juniori.ts` — Juniori posts (gallery or video)
- `lib/basePath.ts` — helper for sub-path deployments (`NEXT_PUBLIC_BASE_PATH`)

Each post is a single folder containing exactly one `.mdx` file (whose name without the extension is the **slug**) and its associated images numbered `1.jpg`, `2.jpg`, … The first image (or `image:` from the frontmatter) becomes the hero; the rest form the gallery.

> [!IMPORTANT]
> Images are not served directly from `content/`. The loaders and the admin copy them into `public/content/<section>/<slug>/` so that Next can serve them. Images therefore exist in two places (source + copy in `public/`), and the admin keeps this in sync automatically.

### Two persistence modes

The admin API routes choose their behavior based on the environment:

```ts
const IS_LOCAL = process.env.NODE_ENV === "development";
```

- **Local (`npm run dev`)** — direct writes into `content/` and `public/content/`. No commits; changes are temporary until committed manually.
- **Production** — each operation is one or more `PUT`/`DELETE` calls to the GitHub Contents API on the `develop` branch. The push triggers an automatic build and deploy.

---

## Project structure

```
/app                      # Next.js App Router (routes)
  page.tsx                # / — Home
  layout.tsx              # Root layout (SiteShell)
  /o-nama, /o-dijabetesu, /donacije, /kontakt   # Static pages
  /vesti, /blog, /dogadjaji, /juniori           # List + [slug] pages
  /clanovi                # Members grid (force-dynamic)
  /admin-diaverzum        # Admin SPA (client)
  /api/admin/{blog,vesti,dogadjaji,juniori,clanovi}/route.ts   # CRUD API
/components               # React components (server + client)
/content                  # SOURCE of content (MDX + images + clanovi.json)
/public/content           # Statically served image copies
/lib                      # Content loaders and helpers
/types                    # TypeScript interfaces
/tailwind.config.ts       # Brand tokens (colors, font, spacing)
```

---

## Content model

### Blog / News / Events (MDX frontmatter)

```yaml
---
title: "Naslov"
date: "2026-04-17"          # ISO; sorted descending
excerpt: "Kratak opis"
author: "Ime Prezime"
tags: ["tag1", "tag2"]
heroLayout: "top"           # top | float | landscape | float-4-3 | float-2-3 | float-3-4
image: "/content/<section>/<slug>/1.jpg"   # optional
heroObjectPosition: "50% 50%"              # optional (CSS object-position)
arhivirano: false           # if true, hidden from listings
---

Article body in Markdown/MDX.
```

### Juniori (additional fields)

```yaml
type: "video" | "gallery"
videoSrc: "/content/juniori/<slug>/video.mp4"   # when type = video
```

### Members (`content/clanovi/clanovi.json`)

```json
{
  "id": 1,
  "name": "Ime Prezime",
  "role": "Predsednik udruženja",
  "image": "/content/clanovi/Ime Prezime 1.jpg",
  "bio": "...",
  "arhivirano": false,
  "heroObjectPosition": "50% 50%"
}
```

---

## Admin panel

Available at the `/admin-diaverzum` route. Implemented as a single client-side SPA component backed by five API routes (`/api/admin/*`). For each section it supports:

- **Add** — a form for a new entry (title, author, date, hero layout, main image, gallery, tags, body).
- **List / Edit** — view and edit existing entries, including adding and removing gallery images.
- **Archive / Restore / Delete** — with a confirmation modal.

**Validation:** title 3–100 characters (excluding `/ \ : * ? " < > |`), body min. 20 characters, images JPG/PNG only up to 5 MB, and slug duplicate checks.

**Slug generator** (identical on client and server):

```
č,ć → c   š → s   ž → z   đ → dj
space → -   everything else outside [a-z0-9-] is stripped
```

| Verb | Function |
|---|---|
| `GET` | List entries / single entry / list images |
| `POST` | Create a new entry (multipart form-data) |
| `PUT` | Edit an existing entry (JSON) |
| `PATCH` | Add images to a gallery (multipart) |
| `DELETE` | Delete images or an entire entry |

---

## Design system

### Colors (Tailwind tokens)

| Token | Hex | Usage |
|---|---|---|
| `brand-blue` | `#0056b3` | Primary — CTA, links |
| `brand-blue-dark` | `#003d80` | Hover states |
| `brand-blue-light` | `#e8f0fb` | Card backgrounds |
| `brand-gray` | `#f5f7fa` | Section backgrounds |
| `brand-gray-mid` | `#e2e8f0` | Borders |
| `brand-gray-text` | `#64748b` | Secondary text |

### Typography and spacing

- Font: **Inter** (Google Fonts), base 16px / line-height 1.6, headings 700, body 400.
- Spacing follows an **8px rhythm** — all margins and paddings are multiples of eight.

### Accessibility

Minimum contrast ratio 4.5:1, visible `focus-visible` rings, `aria-label` on icon-only buttons, `aria-current="page"` in navigation, a skip-to-content link, and semantic HTML (`nav`, `main`, `article`, `section`, `footer`, `time`).

---

## Running locally

Prerequisites: **Node.js 18.x** and **npm**.

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`, and the admin panel at `http://localhost:3000/admin-diaverzum`.

> In dev mode the admin writes to the local file system and does **not** commit to GitHub. To sync content that was entered through the production admin, pull the changes: `git pull origin develop`.

---

## Environment configuration

Production mode (persistence via GitHub) requires the following environment variables:

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | Token with write access to the repository (server-side only) |
| `GITHUB_OWNER` | Repository owner |
| `GITHUB_REPO` | Repository name |
| `GITHUB_BRANCH` | Target branch (defaults to `develop`) |
| `NEXT_PUBLIC_BASE_PATH` | Optional — prefix for sub-path deployments |

`GITHUB_TOKEN` is used exclusively by Next.js Route Handlers on the server and is never exposed to the client.

---

## Build and checks

```bash
npm run build          # production build and static route generation
npm run start          # run the production build
npm run lint           # ESLint
npm test               # Vitest (single run)
npm run test:watch     # Vitest in watch mode
npm run test:coverage  # coverage report
```

> [!NOTE]
> Because every `[slug]` route uses `generateStaticParams`, the build must pass for new pages entered via the admin to appear on the site.

---

## Security

The admin panel currently has **no authentication** — anyone who knows the URL can edit content. This is a deliberate choice for a small association with internal use, with the following caveats:

- `GITHUB_TOKEN` stays server-side and is never leaked to the client.
- Validation of file types and sizes guards against accidental mistakes.

If protection is needed, the simplest approach is middleware over `/admin-diaverzum*` and `/api/admin/*` that checks a session/cookie or Basic Auth from environment variables.

---

<div align="center">
<sub>Built entirely with the help of artificial intelligence (Claude Code).</sub>
</div>
