# Admin Deploy Hardening — pauzirano

**Datum pauziranja:** 2026-05-19
**Status:** Decisions captured kroz grill-me sesiju. PRD i implementacija NISU urađeni.

## Kontekst (zašto se ovo radi)

Trenutni admin workflow:
- Admin koristi `app/admin-diaverzum/` UI da doda/izmeni sadržaj (vesti, blog, događaji, juniori, članovi).
- UI poziva `/api/admin/*` rute (`app/api/admin/{vesti,blog,dogadjaji,juniori,clanovi}/route.ts`).
- API rute koriste GitHub Contents API (sa PAT tokenom) da commit-uju MDX fajlove i slike direktno na granu (trenutno `develop` po defaultu, ali plan je da admin radi na `main`-u u produkciji).
- Push na `main` triggeruje `.github/workflows/deploy.yml` koji buildu-je Next.js statički export i deploy-uje na GitHub Pages.

**Bol koji rešavamo:** admin čeka 2-3 minuta da se završi build/deploy posle save-a; ako je napravio grešku ili nešto pukne u pipeline-u, sajt može da padne ili admin ne zna šta se desilo. Treba nam fallback mehanizam i bolji feedback adminu.

**Razmotrili i odbacili:**
- Dodavanje prave baze (Supabase / PocketBase / SQLite) — over-engineering za ovaj projekat.
- Promena hostinga (Vercel / Netlify) — nije potrebno, GitHub Pages je dovoljan.
- Runtime fetch iz browsera — gubitak SEO-a, neprihvatljivo za udruženje koje hoće vidljivost u Google search-u.
- PR-based admin workflow — previše kompleksno za 1-2 admina.
- Auto-merge develop → main — admin radi direktno na `main`-u, develop se koristi samo za feature dev.

## Resolved Decisions

1. **Bez baze podataka.** Ostaje trenutna arhitektura — MDX fajlovi + git kao "baza".
2. **Bez promene hostinga.** Ostaje GitHub Pages + GitHub Actions deploy pipeline.
3. **Admin workflow ostaje na `main`-u.** Admin commit-uje direktno na `main` kroz postojeće `/api/admin/*` rute (GitHub Contents API sa PAT tokenom). Develop → main je ručan i redak (samo kad se dodaje nova feature).
4. **Glavni bol koji rešavamo:** "lom" u deploy pipeline-u na `main`-u kada admin sačuva sadržaj — sajt ne sme da padne, admin mora da zna ako nešto nije prošlo.
5. **Strategija: pre-commit validacija + auto-revert na fail (bez auto-retry-ja).**
6. **Auto-revert detalji:**
   - GitHub Action `if: failure() && startsWith(github.event.head_commit.message, 'Admin:')` korak koji uradi `git revert HEAD --no-edit && git push`.
   - Anti-loop guard: ne revertuj već revertovan commit (proveri da poruka ne počinje sa `Revert "Admin:`).
   - Ne revertuj commit-ove koji nemaju `Admin:` prefix (štiti feature push-eve developer-a).
7. **Notifikacija na fail:** Status u admin UI-u (primarno) + GitHub Issue auto-create (backup za istoriju). Bez email-a / Slack-a.
8. **Admin UX flow nakon "Sačuvaj":**
   - Non-blocking banner: "Sačuvano lokalno, kači se na sajt (~2-3 min)" + spinner u uglu, admin može da nastavi rad.
   - Pending saves persistuju u `localStorage` sa SHA commit-a — na sledeće otvaranje admin UI-a se proverava status preko GitHub Actions API (`/repos/.../actions/runs?head_sha=<sha>`).
   - Na success: tiho ukloni iz pending liste.
   - Na fail: popup sa imenom događaja/vesti + razlogom (parsiran iz workflow log-a kad može, generic poruka + link na run kad ne može).
   - Popup ima dve CTA: **"Izmeni pa pošalji"** (default — otvara formu sa popunjenim poljima) i **"Pokušaj ponovo"** (slepi re-submit istog sadržaja).
9. **Dva odvojena modal-a:**
   - Sinhroni **validation modal** (inline u formi, pre commit-a) — npr. "Naslov je prazan".
   - Async **build-failure popup** (posle 2-3 min ili kad se admin vrati) — npr. "Neuspešno kačenje '{ime_događaja}', pokušajte ponovo?".
10. **Pre-commit validacije** (u `/api/admin/*` rutama):
    - Naslov nije prazan i nakon `toSlug` ne daje prazan string.
    - Slug konflikt blokira u "add" modu (već postoji fajl sa istim imenom) sa porukom: "Već postoji '{slug}'. Promenite naslov ili izmenite postojeći."
    - Glavna slika: max 5 MB, formati JPG/PNG/WebP.
    - Datum validan ISO format.
    - Excerpt ≤ 300 karaktera.
    - Body sadržaj nije prazan.
    - Novi tagovi su dozvoljeni ali normalizovani (lowercase, trim, ukloni duplikate).
11. **Double-submit zaštita:** samo client-side disable dugmeta dok `fetch` ne završi. Bez server-side idempotency key-a (over-engineering za 1-2 admina).

## Otvorena pitanja (nismo stigli da razrešimo)

- **Zod schema vs ad-hoc validacija** — preporučeno je ad-hoc za sada, ali nije eksplicitno potvrđeno. Zod bi dao šemu iz koje se vade i validacije i TypeScript tipovi (manje bugova kasnije, više inicijalnog rada).
- **Orphan slike** — ako MDX commit padne a slika je već uploadovana na GitHub (ili obrnuto), `public/content/` može da ima neiskorišćene slike. Strategija nije odlučena — opcije: ne-radi-ništa, periodični manuelni cleanup, ili automatski cleanup job.
- **Out-of-scope lista nije eksplicitno potvrđena** — odlučili smo se za navedeno gore, ali poslednje pitanje gde sam tražio potvrdu out-of-scope liste je prekinuto pre odgovora.

## Šta dalje (kad se vratimo na ovo)

1. Potvrditi otvorena pitanja iznad (Zod da/ne, orphan strategija, out-of-scope finalizacija).
2. Tražiti od Claude-a da napiše PRD na osnovu Resolved Decisions + razrešenih otvorenih pitanja.
3. Implementacija po fazama (predlog redosleda):
   - **Faza 1:** Pre-commit validacije u `/api/admin/*` rutama + client-side disable dugmeta (najjednostavnije, najveći ROI).
   - **Faza 2:** Auto-revert workflow korak (`.github/workflows/deploy.yml` ili novi `revert.yml`) + anti-loop guard.
   - **Faza 3:** Admin UI status tracking — non-blocking banner, `localStorage` pending saves, polling GitHub Actions API.
   - **Faza 4:** Async build-failure popup sa "Izmeni" / "Pokušaj ponovo" akcijama, parsiranje GitHub Actions log-a, GitHub Issue auto-create.

## Reference

- Trenutni admin UI: `app/admin-diaverzum/page.tsx`
- API rute koje commit-uju u git: `app/api/admin/{vesti,blog,dogadjaji,juniori,clanovi}/route.ts`
- Deploy workflow: `.github/workflows/deploy.yml`
- Next.js config (static export, `unoptimized` images): `next.config.mjs`
- Format admin commit poruka koji koristi prefix logika: `Admin: ...` (vidi recent commitove kao `0eb7ded Admin: izmeni člana Stevan Stejić (ID: 1)`)
