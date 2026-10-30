# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Editorial criteria — how to write pages, articles and FAQ — are in
> [`COME-SI-SCRIVE.md`](COME-SI-SCRIVE.md) (Italian). This file covers the
> technical architecture only.**

## What this is

Static site for delpiccolodiavolo.it (Staffordshire Bull Terrier kennel, Ostellato FE), built with **Hugo extended v0.152.2**. Trilingual: Italian (default, no URL prefix), English (`/en/`), German (`/de/`). No Node, no package.json, no test suite, no linter — Hugo is the whole toolchain.

Site copy, front matter keys, template comments and script output are all in Italian. Keep that convention when adding code or content.

## Commands

**Three languages, always together (Paolo's rule).** Any change to an
Italian page or article — new page, text, title, H1, description, FAQ, link,
alt, image, source — must be made in the same delivery to its EN and DE
versions (same `translationKey`), with the same structure. Never deliver an
Italian-only change. `verifica.py` enforces it: an Italian content file
changed (uncommitted) without its EN and DE counterparts is an ERROR, and an
Italian `lastmod` newer than EN/DE is a warning. Details in COME-SI-SCRIVE §0.
A change that only alters capitalization (or markup) is not a content change:
`verifica.py` and `tools/lastmod/aggiorna.py` compare visible text case-insensitively,
so it neither moves `lastmod` nor requires touching EN/DE. Writing style (short
sentences, no em dashes, no AI tics, sentence-case headings): COME-SI-SCRIVE §17.

**Before delivering any file and at the start of any repo analysis, run
`python3 tools/controlli/verifica.py`** (full clone, Hugo on PATH). ERRORI
must be 0 before delivering. AVVISI are COME-SI-SCRIVE rules: report them,
fix them only when Paolo decides. Cases Paolo has accepted go in
`tools/controlli/eccezioni.txt`. Report results as that script prints them:
if a new kind of check is added, say it is a new check, not a new problem.

Other files read by the script: `tools/controlli/originali.txt` (Paolo's list
of the most original articles, which need at least `minimo:` in-text inbound
links, in all three languages) and the front matter key `fonti_motivo` (a page
with no external source must say why; without it the page is reported).
`tools/controlli/parole-chiave.txt` lists the primary keyword of each main
page (home: "allevamento staffordshire bull terrier", puppies page: "cuccioli
staffordshire bull terrier", and the EN/DE equivalents): the script checks
title, h1, description, opening text, alt, inbound anchors and other pages
competing for the same keyword. These two keywords are Paolo's top priority.
Search volumes for synonyms come from `tools/parole-chiave/volumi.py`
(DataForSEO, run by Paolo with his API credentials).
Decorative inline SVG icons carry `aria-hidden="true" focusable="false"`;
icon images and share cards are kept out of the sitemap.

```bash
hugo server          # dev server on http://localhost:1313, live reload
hugo                 # production build into public/ (gitignored)
hugo --quiet         # build, only show warnings/errors — use to verify templates compile
hugo server -D       # include drafts
```

Deploy is Cloudflare Pages (build command `hugo`, output dir `public`), triggered on push to `main`.

After each push touching the site, `.github/workflows/indexnow.yml` waits until the deploy is live, then pings IndexNow with the pages whose sitemap `lastmod` is today or yesterday. "Live" means the `X-Build` header of `/sitemap.xml` (written by `layouts/index.headers` from Cloudflare's `CF_PAGES_COMMIT_SHA`, allowed in `[security.funcs]` of `hugo.toml`) equals the pushed commit or has changed since the run started; after 20 minutes it goes ahead anyway with a warning. Locally the variable is empty and the header is not emitted.

Hugo writes `/sitemap.xml` twice in the same build (the multilingual sitemap index, then the Italian urlset, because Italian lives at the root); the Italian urlset wins, and robots.txt and the IndexNow workflow rely on it. Hugo only reports this with `--printPathWarnings`, so do not "fix" it by removing `"sitemap"` from the home outputs: that makes the index win. `verifica.py` (check `sitemap_forma`) fails if any language sitemap is missing, empty, an index, or lists another language.

Markdown for AI agents: every page also builds as `index.md` (`layouts/_default/single.md`, `layouts/index.md`, and for the Diary list `layouts/diario-allevamento/list.md`, output `section` in `hugo.toml`). On Cloudflare a URL Rewrite Transform Rule named "Markdown per agenti AI" serves it to clients sending `Accept: text/markdown`:
expression `(http.request.headers["accept"][0] contains "text/markdown" and not ends_with(http.request.uri.path, ".md"))`, dynamic path `concat(http.request.uri.path, "index.md")`. `Vary: Accept` in `layouts/index.headers` keeps the cache from mixing the two. Check: `curl.exe -H "Accept: text/markdown" https://delpiccolodiavolo.it/colori-staffordshire-bull-terrier/` must start with `#`, not `<!DOCTYPE html>`.

## Architecture

### Multilingual layout

Each language has its own `contentDir` (`content/it`, `content/en`, `content/de`) and **its own localized filenames/slugs** — `cuccioli-staffordshire-bull-terrier.md` ↔ `puppies-staffordshire-bull-terrier.md` ↔ `welpen-staffordshire-bull-terrier.md`. Translations are linked *only* by the `translationKey` front matter field, never by filename. If `translationKey` is missing or mismatched, hreflang tags and `.AllTranslations` silently drop the page.

### `custom_content`: pages are HTML in front matter, not Markdown

The dominant pattern (140 of 164 content files): the page body is empty and all markup lives in a `custom_content:` YAML block-scalar in the front matter, rendered through `safeHTML` by `layouts/index.html` / `layouts/_default/single.html`. Only pages *without* `custom_content` fall through to the standard Markdown path (breadcrumb + `.Content` + WhatsApp CTA). A Markdown article that starts its body with its own `<section class="hero">` followed by `<nav class="breadcrumb">` gets no generic page-hero: `single.html` prints everything up to the first `</nav>` full width and puts the rest inside `.article-content`. The four articles still written in Markdown (price guide, choosing a breeder, temperament, Staffy vs Amstaff, in three languages) all follow this pattern. Goldmark has `unsafe = true`, so inline HTML in Markdown bodies also renders.

Inside `custom_content`, HTML comment placeholders are string-replaced with partials before the output is marked safe. **Which placeholders work depends on the template**:

| Placeholder | Home (`index.html`) | Regular page (`single.html`) | Renders |
|---|---|---|---|
| `<!--NEWS-->` | yes | no | newest `diario-allevamento` post as a card (built inline in the template) |
| `<!--HEROFOTO-->` | yes | no | `partials/hero-foto.html` |
| `<!--CUCCIOLATA-->` | no | yes | `partials/ultima-cucciolata.html` |
| `<!--ULTIMA-CUCCIOLATA-->` | no | yes | `partials/ultima-cucciolata-scheda.html` — the "latest litter" section of the Puppies page (IT/EN/DE), always on, real text for Google and AI (also in `single.md`) |
| `<!--CORRELATI-->` | yes | yes | `partials/correlati.html`, driven by the `correlati:` front matter list |
| `<!--RECENTI-->` | no | yes | `partials/recenti.html` |
| `<!--GUIDE-->` | no | yes | `partials/guide-cucciolo.html`, group `cucciolo` (links to the practical puppy guides, found by `translationKey`, current page excluded) |
| `<!--PRENOTA-->` | no | yes | `partials/prenota.html` — the trilingual contact form, used only on `/contatto/` |
| `<!--REC-VOTO-->` / `<!--REC-TOTALE-->` | yes | yes | Google rating and review count from `recensioniVoto` / `recensioniTotale` in `hugo.toml` — never write the numbers by hand |

`<!--CORRELATI-->` and `<!--RECENTI-->` are also replaced in the Markdown body of pages *without* `custom_content` (the `{{ else }}` branch of `single.html`); the other placeholders are not. Adding a placeholder to a page that its template doesn't handle leaves the literal comment in the HTML.

### Breeding diary drives the homepage

`content/<lang>/diario-allevamento/` is the only real Hugo section, with its own `layouts/diario-allevamento/{list,single}.html`. The **newest post by date** is pulled into the home NEWS block and into `ultima-cucciolata.html`. Post front matter: `date`, `image`, `image_alt`, `annuncio` (overrides the title in cards), and `stato: disponibile|completa` (default `completa`) which switches the title and text of the contact block at the bottom of the post page.

The newest post also feeds the "latest litter" section of the Puppies page (`<!--ULTIMA-CUCCIOLATA-->`, October 2026: Paolo wants the page to always show a real litter, so Google sees it as the puppies page). Its data come from the optional `scheda:` block of the post (`madre`, `padre`, `maschi`, `femmine`, `colori`, `foto: [{src, alt}]`), written in each language's file; missing lines are simply not shown, so diary pages written by the gestionale without `scheda:` still work (date, status, `image`). Fill `scheda:` in all three languages for every new hand-written litter post. The old `<!--CUCCIOLATA-->` box (switch `mostraUltimaCucciolata`) was removed from the Puppies pages and stays only on the breeding programme pages. When the same litter (same birth date) or a more recent born litter is among the gestionale cards of the Puppies page (`data/cucciolate.json`, switch "Pagina Cuccioli"), the section is not shown (`hidden`, and left out of `index.md`) so the litter does not appear twice — `partials/ultima-cucciolata-doppia.html` decides at build time, and the script in `cucciolate.html` shows/hides it again with the gestionale's live data (Paolo's choice D, 08/10/2026). The gestionale writes the `scheda:` block (madre, padre, maschi, femmine, foto) in its own diary pages.

### Hero photo rotation and the weekly rebuild

17/10/2026 (Paolo): rotation switched off. Only one `[[params.hero.foto]]` is left (Divine, `divine-cucciola-tre-mesi.avif`), so the Home photo never changes; add blocks back to restart the rotation.

`layouts/partials/hero-foto.html` picks one entry from the `[[params.hero.foto]]` array in `hugo.toml` using `now` (`rotazione = "settimane" | "giorni" | "mesi"`). Selection happens **at build time**, so the photo only changes when the site is rebuilt — that is what `.github/workflows/ricostruzione-settimanale.yml` is for: every Monday it POSTs to a Cloudflare Pages deploy hook (repo secret `CLOUDFLARE_DEPLOY_HOOK`). Each photo entry carries `alt`/`title`/`didascalia` plus `altEn`/`altDe` etc. variants; missing translations fall back to the Italian.

Header photos get smaller copies for phones (18/10/2026, Lighthouse): `python3 tools/immagini/varianti.py` (after `hugo`) writes `-480w`/`-640w`/`-680w` next to every header photo at least 700 px wide and lists them in `data/varianti.json`; `partials/immagini-hero.html` then adds `srcset`/`sizes` (computed in `partials/immagini-hero-set.html`, also used by the preload in `baseof.html`) to the `.hero-image img`, replacing any srcset written by hand in the page. **Run it after adding a new header photo.** The menu logo has `alt=""` (the name is written next to it).

### CSS

`assets/css/main.css` (single long line), plus `home.css` (Home) and `notte.css` (Notte pages). `partials/css.html` joins them per page type (light pages: main; Notte pages: main+notte; Home: main+home+notte), minifies them and writes them **inside the page in a `<style>` tag** (21/10/2026, Paolo, choice A). From 18 to 21/10 they were an external fingerprinted file with `integrity` and an Early Hints preload: on Paolo's flaky Iliad connection the CSS request stalled and the whole page stayed white (nothing is drawn until a stylesheet arrives), and the preload without `integrity` made Chrome download it twice. Do not move the CSS back to an external file. Since 26/10/2026 (Paolo, choice B) each page gets only the rules it needs: `partials/css/` splits the minified bundle into rules (cached per bundle) and keeps a rule when, for at least one selector, every class/id appears in the site's `.html` layouts, `data/`, `i18n/`, `hugo.toml`, or in the page's own text (custom_content, body, the `/js/…` scripts it loads, and the optional partials whose placeholder it contains, listed in `partials/css/facoltativi.html`). Calculator classes (`pp-`, `bf-`, `dc-`) count only on pages that load a calculator script. A new placeholder partial must be added to `facoltativi.html` or its rules stay on every page (harmless, just heavier). Checked by comparing the computed style of every element on all pages (1280 and 390 px) and in open menus, FAQ and calculator states: zero differences. Home style 107 → 57 KB. The CSS has no `url()`, so inline paths stay correct. Rules for components no longer on the site were removed on 18/10 (checked with screenshots of all 164 pages before and after). Component-level styling is otherwise **inline `style=""` attributes** inside partials and `custom_content` — that is deliberate, not an oversight.

### Translations: three mechanisms coexist

1. `i18n/{it,en,de}.toml` via `{{ T "key" }}` — nav labels, footer, WhatsApp prefill text.
2. Inline `{{ if eq .Site.Language.Lang "en" }}…{{ end }}` chains — used throughout the partials for anything longer than a label.
3. Per-language `dict` blocks — e.g. `data-locale.html`, `schema.html`.

Exception: `partials/prenota.html` is a single page for all three languages, so its labels carry IT · EN · DE on the same line instead of switching by language.

`layouts/partials/header.html` hardcodes each menu target as a `cond` chain over the three language slugs, and the **desktop `<ul class="nav-links">` and the `.mobile-menu` block are separate copies** — a menu change must be applied to both.

### SEO machinery

- `baseof.html`: `titleSeo` front matter overrides `title` for `<title>`/OG/Twitter; the brand suffix is appended only when the result stays ≤60 chars (always on the home page). `hreflang` comes from `.AllTranslations` (hence `translationKey`). `noindex: true` front matter emits a robots meta tag. `json_ld` front matter injects extra JSON-LD.
- `partials/schema.html`: hand-written Organization/LocalBusiness JSON-LD with address and geo coordinates — these values are duplicated from `[params]` in `hugo.toml`, so update both. **No `Review`/`AggregateRating` markup, on purpose**: the reviews come from the Google Business profile, and Google forbids marking up reviews collected elsewhere (and shows no stars for self-serving LocalBusiness reviews). `recensioniVoto`/`recensioniTotale` in `hugo.toml` only feed the visible text. The BreadcrumbList JSON-LD is written only when it has at least two items, so the three home pages have none (Paolo, 26/10/2026).
- `enableGitInfo = true`, but `[frontmatter]` in `hugo.toml` reads `lastmod` from front matter first, then git (Cloudflare clones without history, so git dates alone would be wrong); `date` comes only from front matter. See "lastmod: who updates it" below. Sitemap and robots.txt have custom layouts (`layouts/_default/sitemap.xml`, `layouts/robots.txt`); taxonomies and RSS are disabled.

### Contact form (`/contatto/`) → Google Apps Script

There is **no waiting list and no booking**: Paolo removed both from the whole site. What remains is a "let's stay in touch" form.

- Page: `content/it/prenota.md` (slug `contatto`, `noindex`, Italian only, no `translationKey` — the form itself is trilingual). The link is not published anywhere on the site: Paolo sends it to people who ask. Confirmation page: `content/it/prenota-grazie.md` (slug `contatto-grazie`, noindex, `build.list: never`).
- `partials/prenota.html`, via `<!--PRENOTA-->`, renders a plain `<form method="POST">` to `params.listaAttesaEndpoint` (a Google Apps Script `/exec` URL; the parameter keeps its old name). Without JavaScript it is a normal POST. With JavaScript it posts in the background (`fetch`, `no-cors`) and then sends the visitor to `/contatto-grazie/`, because the site's `X-Frame-Options: DENY` prevents the Apps Script response page from being framed. The `azienda` field is a honeypot.
- Server side: `apps-script-prenotazioni.gs`, **not deployed by this repo** — to change it, paste it into the Apps Script editor and publish a new version of the existing deployment (the `/exec` URL does not change).
- File names, the `listaAttesaEndpoint` parameter and the spreadsheet name in the script still say "prenota"/"lista d'attesa": internal leftovers, never to be used in visible text. Visible copy follows COME-SI-SCRIVE (no booking, waiting-list or sales language).

## Repo cruft — do not treat as source

Delivery notes (`LEGGIMI-*`) are not kept in the repo: current rules live only in this file and in COME-SI-SCRIVE. Static files no page links to are moved to `_archivio/` (gitignored: they stay on Paolo's disk, out of git and off the site), never deleted. `archivia-immagini.ps1`, `archivia-backup.ps1` and `elimina-zip.ps1` are one-shot cleanup scripts already run. `public/` is gitignored but present locally.

## Share cards (og:image) for articles

Every article (IT/EN/DE) has its own 1200x630 share card in `static/images/og/schede/<lang>/<slug>.jpg`: title, category label, a Lucide icon matching the topic inside a circle with the category gradient, kennel name. Set via `og_image` / `og_image_alt` in front matter. Photos were dropped on purpose: Paolo does not want photos that do not match the topic.
Colours (18/10/2026, Paolo's choice A): every category uses the same blue circle `#1f3a5f→#3b6a9e` on a light blue background `#eaf0f7`, title `#1f2d42`, category label `#1f4f82` (the category is told by the label, not the colour). Same colours for the blog icons (`--icone`).
New article = add its slug, category and icon to `MAP` in `tools/schede-og/genera.py`, generate the cards for the three languages and set the front matter. Institutional pages (home, about, puppies, females, males, reviews, contact) keep `og-default.jpg`.

## lastmod: who updates it

Paolo does not run the pre-commit hook reliably (it needs `git config core.hooksPath .githooks` on each machine, and commits made on github.com skip it). So **Claude sets `lastmod` itself in every file it delivers** whose visible text changed, and before delivering runs `python3 tools/lastmod/aggiorna.py --scrivi` on a full clone to catch anything missed. The hook stays as a safety net, nothing depends on it.

## Article schema image

For articles with `og_image`, the Article JSON-LD `image` is the 1200x630 share card only (blog photos are too small for Google and often unrelated to the topic). Diary posts keep their litter photos.

## Icons in the blog listing and article headers

- Blog listing (`content/*/blog.md` and `partials/recenti.html`): every article card shows its icon, style A, from `static/images/blog/icone/<slug-it>.webp` (front matter `thumb`). Diary cards keep litter photos.
- Article header: the existing photo stays only if it is at least 560 px wide (the header box on desktop) AND it matches the topic. Otherwise the header uses `static/images/blog/icone/hero-<slug-it>.webp`, with `alt=""` (decorative, the title follows). Paolo's rule; 27 articles use the icon header, 9 keep their photo (sverminazione, costo, vaccinazioni, pedigree, scegliere allevamento, Staffy o Amstaff, temperamento, storie, estero).
- The generic `hero-default.webp` must not be used as an article header.
- Files are generated with `python3 tools/schede-og/genera.py --icone`.


## Risultati in esposizione dal gestionale (ottobre 2026)
- Nel gestionale (gestionale.delpiccolodiavolo.it) ogni esposizione ha l'interruttore "Sul sito".
- **In automatico**: `layouts/partials/esposizioni.html` legge `https://gestionale.delpiccolodiavolo.it/api/public/esposizioni`
  (param `gestionaleEsposizioni` per cambiarlo) e aggiunge i risultati più nuovi. Google e le IA non li vedono.
- **Testo vero**: `data/esposizioni.json`, che arriva con "Prepara per il sito" del gestionale (zip `delpiccolodiavolo-esposizioni.zip`
  da estrarre nella cartella del sito). È quello che leggono Google, le IA e la versione `.md` delle pagine.
- Segnaposto nel testo: `<!--ESPOSIZIONI-->` nella pagina Palmarès (IT/EN/DE): il partial disegna tutta la sezione "Gli ultimi
  risultati dei nostri cani" (ultimi 12), nascosta finché non c'è almeno un risultato (la mostra lo script se arriva in automatico) e `<!--ESPOSIZIONI:<id del cane nel gestionale>-->` dentro la scheda di ogni cane in Femmine/Maschi (ultimi 6;
  bilquis, queen, croiolc, faiter, jackie, nutella, cattleya, nora, lothar, braveheart, papillon). Sostituiti in `single.html` e `single.md`.
- Sul sito niente giudizi scritti né foto (scelta di Paolo). Classi, qualifiche e tipi tradotti in inglese e tedesco nel partial.

## Cucciolate dal gestionale nella pagina Cuccioli (punto 10, ottobre 2026)
- Segnaposto `<!--CUCCIOLATE-->` nelle pagine Cuccioli (IT `cuccioli-…`, EN `puppies-…`, DE `welpen-…`), dopo la prima sezione;
  sostituito in `single.html` e `single.md` con `layouts/partials/cucciolate.html`.
- Mostra le cucciolate con "Sul sito" acceso nel gestionale, come le schede del Programma allevamento: genitori con foto, test e
  titoli (in IT/EN/DE: campi `tests_en/_de`, `titles_en/_de` del gestionale, altrimenti italiano), i loro genitori, link SBT;
  etichetta Disponibili / Non disponibili / In programma; numero di cuccioli e link SBT della cucciolata. Niente cuccioli singoli,
  niente prenotazioni, nessun riquadro di contatto (scelte di Paolo). Mai note né proprietari.
- **Testo vero**: `data/cucciolate.json` + `static/images/cucciolate/<id cane>.<ext>`, che arrivano con "Prepara per il sito" della
  Scheda della cucciolata (zip `delpiccolodiavolo-cucciolate.zip`). **In automatico**: lo script ridisegna la sezione da
  `https://gestionale.delpiccolodiavolo.it/api/public/cucciolate` (param `gestionaleCucciolate`), foto da `…/cucciolate/f/<chiave>`.
  Sezione nascosta se non c'è nessuna cucciolata.


## Published from the management app (gestionale), October 2026

Paolo publishes from his phone with "🌐 Pubblica sul sito" in the gestionale (repo `zonerosse/gestionale-allevamento`,
`functions/api/publish.js`): one commit on `main` via the GitHub API (fine-grained token, this repo only). Never edit by hand:

- `data/cucciolate.json` + `static/images/cucciolate/` — the Cuccioli page, as before.
- `data/novita.json` — the gold "news" box on the home page (`layouts/partials/novita-home.html`, placeholder
  `<!--NOVITA-->` in `content/{it,en,de}/_index.md`, right after the hero and the features bar; replaced in `layouts/index.html`).
  `{"show":false}` → no box. Texts for it/en/de come ready from the gestionale; `url` points to the diary page or to the
  litter card in the breeding programme (`#cucciolata-<id>`). Switched on/off from the gestionale ("Novità in Home").
- Breeding programme pages (`content/it/programma-allevamento.md`, `content/en/litters-staffordshire-bull-terrier.md`,
  `content/de/wuerfe-staffordshire-bull-terrier.md`): the gestionale owns only the text between
  `<!-- GESTIONALE:INIZIO -->` and `<!-- GESTIONALE:FINE -->` inside `custom_content` (same `<article class="litter-card">`
  markup as the hand-written cards, so the RSS feed and `/programma-allevamento/segui/` pick them up). Never edit inside the
  markers; everything outside them is Paolo's and the gestionale never touches it.
- Diary pages with `gestionale: true` in the front matter (`content/<lang>/diario-allevamento/*.md`, photos in
  `static/images/diario/<it-slug>/`): written and deleted by the gestionale, only for litters from October 2026 on. The
  publish endpoint refuses to overwrite or delete any file without `gestionale: true`, so hand-written diary pages are safe.
  The opening paragraph is the citable block (110–160 words, kennel and breed named), descriptions are kept within 140–165
  characters, external links carry `aria-label`: `tools/controlli/verifica.py` reports no warnings on them.

Before working on the site locally, **Fetch/Pull** in GitHub Desktop: the gestionale may have committed in the meantime.
- Gestionale diary pages are also listed in `llms.txt` automatically: placeholder `<!--DIARIO-GESTIONALE-->` in
  `assets/llms/<lang>.txt` (right under the diary entry), filled by `layouts/index.llmstxt.txt` with the pages that have
  `gestionale: true`, newest first. Hand-written diary pages stay listed by hand.
- When the gestionale changes its cards in the breeding programme it also sets `lastmod` to today in the three files, so
  IndexNow and Google see the page as updated. Photos have descriptive names
  (`static/images/cucciolate/<dog-name>-staffordshire-bull-terrier.<ext>`,
  `static/images/diario/<slug>/cuccioli-staffordshire-bull-terrier-<dam>-<sire>-<n>.<ext>`).

## Photos that fail to arrive (20/10/2026)
- Paolo on 5G saw the Home stay white or without the header photo. Measured from his Chrome: the site answered in 0.1 s on a fresh
  connection, but every request on the open HTTP/3 (QUIC) connection hung. Paolo switched off HTTP/3 in Cloudflare (Speed →
  Impostazioni → Ottimizzazione protocolli → HTTP/3 off). Leave it off.
- `baseof.html` has a tiny inline script at the top of `<head>`: if a site image fails, it asks for it again up to 3 times
  (after 1, 2, 3 s), adding `?rip=n` to `src` and to each `srcset` entry.

## Browser protections: Permissions-Policy and the guest list (CSP), October 2026
- `layouts/index.headers` sends `Permissions-Policy` (camera, microphone, geolocation, payment, usb, midi, topics all off)
  and `Content-Security-Policy`, the "guest list" of external hosts the browser may load from.
- Active since 09/10/2026, after a report-only test (Diary, Puppies, Palmarès clean in incognito; warnings in Paolo's normal
  Chrome came from extensions, not the site). To go back to test mode, rename the header to `Content-Security-Policy-Report-Only`.
- Allowed guests: `static.cloudflareinsights.com` + `cloudflareinsights.com` (Web Analytics), `gestionale.delpiccolodiavolo.it`
  (cucciolate/esposizioni data and photos, contact form), `script.google.com` + `script.googleusercontent.com` (contact form),
  `www.youtube-nocookie.com` (diary videos). **Any new external service (map, video host, widget, font) must be added there**,
  or the active policy will block it. `'unsafe-inline'` stays: the site relies on inline scripts and styles by design.

## WhatsApp buttons (October 2026)
- Every WhatsApp link on the site points to `/wa/<number>?text=…`, never straight to `https://wa.me/`. `functions/wa/[[path]].js`
  (Cloudflare Pages Function) logs the tap in the management app (`gestionale.delpiccolodiavolo.it/api/public/walog`,
  shared secret `WA_KEY` set in BOTH Cloudflare projects) and redirects (302) to `https://wa.me/<number>?text=…`.
  Only the source page path is sent (from the same-site Referer): no IP, no personal data; bots and link previews are skipped.
- Diagnostic page: `/wa/393924635584?diag=<WA_DIAG>` shows whether `WA_KEY` is set and what the gestionale answers. It works only
  when the Cloudflare variable `WA_DIAG` exists and the word matches; without it the page is off and `?diag=` just redirects.
- `robots.txt` disallows `/wa/` for every group; `verifica.py` treats `/wa/<digits>` as a valid internal link.
- The JSON-LD in `partials/schema.html` keeps the real `https://wa.me/` URL (it is data, not a button).
- 12/10/2026: browser prefetch/prerender requests are not counted; opens of `/wa/` from outside the site (no page of origin) are sent
  with `src` (referrer host or in-app browser + phone/computer, never IP) and the gestionale counts them apart, not as taps.
- New pages: write WhatsApp links as `/wa/393924635584?text=…` (same text-encoding as before).

## Pages edited from the gestionale (Google → Pagine del sito), October 2026

Paolo changes some parts of every page from the gestionale (Google → 🌐 Pagine del sito), in Italian only: Claude (the
gestionale's /api/ai) translates into EN and DE, and "Pubblica tutte le modifiche" writes **`data/pagine.json`** in one
commit (Paolo's choices: A in Google, B automatic translations, C2 publish all together). Never edit that file by hand.

- `data/pagine.json` = `{"pagine": {"<translationKey>": {"it":{"title","desc","h1","ap"}, "en":{…}, "de":{…},
  "spente":[n…], "link":[{"key":"<translationKey>","it","en","de"}], "mod":"YYYY-MM-DD"}}}`. Empty fields = today's text.
- `layouts/partials/pagine/`: `mod.html` (the changes for a page, in its language), `desc.html` (description),
  `lastmod.html` (newest of front matter lastmod and `mod`: sitemap, schema, "Aggiornato il", article:modified_time — always
  use this partial instead of `.Lastmod`), `applica.html` (switched-off blocks, h1, opening paragraph, "Leggi anche" box
  before the `cta-section`, and it ALWAYS strips the block markers), `apertura.html` (the opening paragraph = first `<p>` after
  the h1, within 5000 characters, with at least 15 words), `da-chiave.html`. `applica.html` runs in index.html, single.html
  (both branches), diario single/list, index.md, single.md and llms-full. The title override is in baseof.html.
- **Blocks**: every page carries `<!--BLOCCO:n-->` … `<!--/BLOCCO:n-->` comments around the blocks that can be switched off,
  with the same numbers in IT/EN/DE. Written by **`python3 tools/blocchi/segna.py --scrivi`** (idempotent; without
  `--scrivi` it only reports). Pages whose blocks differ between languages are paired by hand in `MAPPE` in that script
  (puppies, breeding programme, genetic tests, Bilquis diary: only paired blocks get a switch). **After writing or changing a
  page, run `segna.py --scrivi`** (a page whose block count differs between languages is reported and left unnumbered).
  Never put markers inside the GESTIONALE:INIZIO/FINE region; gestionale diary pages are skipped.
- **`/pagine-indice.json`** (`layouts/index.pagine.json`, output format PAGINE, Italian home only): for every page today's
  title/description/h1/opening/keyword (from `tools/controlli/parole-chiave.txt`) per language and its blocks (titles, and
  flags h1/faq/kw/link used by the gestionale to warn). CORS for the gestionale in `index.headers`.

## Accessibility (WCAG 2.2 AA), October 2026
After the EN 301 549 report of 13/10/2026 and a full axe-core 4.14 audit of all pages (PC, phone, 320 px), the fixes are
guarded by `verifica.py` (codes `a11y_*`, all ERRORI):
- `a11y_nome` (2.5.3): an `aria-label` on a link/button must contain its visible text as whole words (best: start with it,
  then context and "(si apre in una nuova scheda)"). Same rule for the gestionale's pages.
- `a11y_lingua` (3.1.1): `<html lang>` on every page.
- `a11y_tabella` (2.1.1): every `<table>` has `tabindex="0"` (Markdown tables get it from `_default/_markup/render-table.html`).
- `a11y_griglia` (1.4.10): grid columns written as `minmax(min(NNNpx,100%),1fr)`, never `minmax(NNNpx,1fr)`.
- `a11y_css`: cards (blog, diary, females/males, FAQ) without `overflow:hidden` (text clipped at 200% zoom); links in
  paragraphs underlined; focus ring on iframe/video/table; features bar pauses on hover/Tab and with reduced motion;
  `.image-center img` max `min(350px,100%)`.
The features bar keeps scrolling by Paolo's choice (13/10/2026).

## Layout choices for readers who skim (Paolo, 13/10/2026)
- Showcase pages (Diario, Programma allevamento, Femmine, Maschi, Recensioni, Palmarès, IT/EN/DE): cards right under the
  header, introductory text below the cards (choice C). Diario: order set in `layouts/diario-allevamento/list.html`.
- `partials/guide-cucciolo.html`: max 4 guide cards (the guides after the current page, in rotation) + "Tutte le guide" (R2).
- Phone header photo: whole photo, 42% of the screen height, `object-fit:contain` (never cropped).
- Articles: `partials/inbreve.html` adds "In breve" (front matter `in_breve:`, 2-4 sentences, written from the article's
  own text, same in IT/EN/DE) and a closed "In questa pagina" index (automatic, articles with 6+ h2). No `<p>` inside, so
  the citable first paragraph is unchanged. New long articles: write `in_breve` in the three languages.
- Home: three key numbers under the header (rating/total from hugo.toml), a review right after the puppies and one before
  the final CTA, "Come si controlla" subsections as `.tendina`, long sections with "Continua a leggere" (`.continua`),
  puppy photos spread next to paragraphs; photos of dogs looking left are mirrored with `transform:scaleX(-1)` so they
  look towards the text (neuro web design, Paolo's rule).
- Long pages (13/10/2026): FAQ answers are open in the HTML (Google, AI, no-JS) and closed by the script in `baseof.html`,
  which wraps each question in a real `<button class="faq-btn">` (keyboard, aria-expanded); a question containing a link
  stays open. On phones the two parents in litter cards sit side by side and
  galleries are 3 in a row. (17/10/2026: on the Notte pages `.continua`, `.tendina` and `<details class="tutti">` were removed,
  everything is open: see "Stile Notte" below.)
  Puppies page: reviews moved right after the litters (`MAPPE["cuccioli"]` in segna.py updated, block numbers unchanged).
  Lines added inside `custom_content:` must keep the block's indentation, or the YAML block ends early.

## Niente numero di cuccioli sul sito (15/10/2026, Paolo)
- "Non voglio spiattellare quanti cuccioli faccio": il sito non mostra mai quanti cuccioli, maschi o femmine sono nati.
  Tolti da cucciolate.html (Hugo e JS), ultima-cucciolata-scheda.html (resta solo "Colori"), front matter scheda.maschi/femmine
  dei diari Bilquis, riga vuota "Geborene Welpen" del diario Red Nora DE. Il gestionale non manda più n/m/f e non li scrive nei testi.

## Stile "Notte" (17/10/2026, Paolo: scelta B)
- 18/10/2026 (Paolo): colori «Blu notte, bianco e oro». Fondo blu (`--n-bg:#25354c`, `--n-bg2:#2c3f57`, `--n-card:#354a63`,
  scuro `#1f2d42`), testo `#d6dde6`, oro `#f0cc86` al posto di oro e rame. Bottoni bianchi con scritta `#1f3a5f`; link oro in
  grassetto con sottolineatura sottile (B). Niente marrone in link, bottoni e menu (anche al passaggio del mouse). Le regole in fondo
  a `notte.css` prevalgono sui vecchi colori caffè e rame scritti più su.
- 18/10/2026 (Paolo, scelta B): le pagine chiare (articoli del Blog, Privacy, Note legali, contatto) restano chiare ma senza
  marrone: titoli `#1f2d42`, link e bottoni `#1f4f82`, fondi azzurrini (`#f6f8fb`, `#eaf0f7`), piè di pagina blu. Fatto sostituendo
  i colori in `main.css`, nei layout e negli `style=""` dei contenuti (mappa in un solo passaggio; zona GESTIONALE e pagine
  `gestionale: true` escluse). Nuove pagine: non usare più i marroni `#8b5a2b`, `#5c4a3a`, `#4a3f35`, `#6b5d52`, `#3d2f22`.
- Pagine vetrina scure (caffè, rame, oro): Home, Cuccioli, Chi siamo, Femmine, Maschi, Palmarès, Diario (elenco), Programma,
  Recensioni, Contatti, FAQ, Blog (elenco), in IT/EN/DE. Si accende con `notte: true` nel front matter (body `notte-pagina`, `assets/css/notte.css`
  caricato da `partials/css.html`). Gli articoli del Blog e le pagine del diario restano chiari.
- Regola di Paolo: si cambiano solo impaginazione e grafica. Testi, titoli, descrizioni, link e JSON restano identici a quelli
  online; si toglie solo ciò che chiede lui (es. i bottoni, con la loro scritta). Prima di pubblicare: anteprima HTML, poi
  confronto parola per parola con la versione online.
- Home: `assets/css/home.css` (caricato solo sulla home); FAQ aperte come `.faq-item active n-faq` dentro `.faq-container` (schema FAQPage).
- Niente bottoni nella testata (hero) di nessuna pagina tranne la Home (Paolo, 17/10/2026); i bottoni dentro la pagina e WhatsApp in fondo restano.
- Pagine vetrina aperte una alla volta (17/10/2026; Chi siamo EN/DE tengono il loro testo di prima, impaginato a righe): niente «Continua a leggere» né tendine; le tendine diventano
  `.n-percorso > .n-passo` (titolo a sinistra, testo a destra, scelta B), i «rimando» una riga `.n-vedi`, le FAQ `.faq-item active n-faq`.
- Home e Cuccioli (17/10/2026, scelte di Paolo): la Home usa `notte: true` come le altre (niente più `<div class="notte">`);
  «Nati e cresciuti» = `.n-foto3` (foto alte con il momento scritto sopra, C); le altre sezioni a righe `.n-percorso > .n-passo`;
  recensione e FerraraToday dopo i risultati dei cani. Testo 18 px ovunque e titoli contenuti (scala C, fine di `notte.css`):
  niente paragrafi più grandi degli altri. Piè di pagina scuro su tre colonne (B) solo sulle pagine Notte.
- Contrasti: tutte le pagine Notte passano axe-core `color-contrast` (WCAG AA). Colori nuovi nel `style=""` delle pagine Notte
  vanno ricoperti in `notte.css`, altrimenti testo scuro su fondo scuro. Bottoni rame: `linear-gradient(135deg,#9c5f2c,#7f4a1f)`.
- Pagine rifatte a righe il 17/10/2026 (scelte di Paolo, una alla volta):
  - Femmine A e Maschi: schede dei cani a righe; in Maschi «Etica, salute e selezione» a righe con i titoli in grassetto.
  - Palmarès: cani a righe (foto 4:5 a sinistra), risultati `.risultato` in elenco tutti visibili (niente «Tutti i risultati»);
    in IT il testo della testata `.page-hero` a righe (frase a sinistra, paragrafo a destra).
  - Programma: schede delle cucciolate uguali a Cuccioli; sezioni di testo a righe con l'h2 a sinistra (`.n-passo > h2`);
    fascia scura `.n-righe-scure`; FAQ EN/DE `.n-faq`. La zona GESTIONALE non si tocca.
  - Recensioni: `.reviews-grid .review-card` a righe (nome, stelle, data a sinistra; testo a destra), tutte visibili;
    i quattro `.value-card` diventano righe.
  - Diario (elenco): `.diario-card` a righe (foto a sinistra) e `.diario-intro` a righe solo con il CSS (h2 a sinistra).
  - Contatti: Paolo la vuole impaginata com'era; cambiano solo i colori (riquadri delle città `.zone-row` scuri).
  - Al telefono le righe `.n-storia` con la foto vanno una sotto l'altra.
  - FAQ (scelta A): domande a righe, tutte aperte (CSS `.faq-container:not(.n-faqs)`); lo script di `baseof.html` non le
    chiude sulle pagine Notte. Testata con icona (`img[alt=""]`): icona piccola e centrata, senza sfumatura.
  - Blog (scelta A): articoli a righe (icona 120 px a sinistra, data, titolo e testo a destra), tutti visibili (niente
    «Mostra tutti gli articoli»). In «Ultimi articoli» (`partials/recenti.html`) la data è nella lingua della pagina.
  - Pagine delle singole cucciolate del Diario: sempre Notte (anche quelle del gestionale, senza front matter: `baseof.html` e
    `css.html` guardano la sezione `diario-allevamento`), body `tipo-articolo notte-pagina`. A righe solo con il CSS (h2 a sinistra,
    contenuto a destra). Niente fondi senape o marroni: riquadri scuri con bordo oro o rame. Data e navigazione nella lingua della pagina.
  - Niente fondi pieni senape, rame, verdi o blu nelle etichette (badge, female-badge, stato-fattrice, etichette con
    `style` di fondo): solo bordo oro o rame. Fascia finale `.cta-section` scura e uniforme, senza alone marrone.
  - Riquadri con foto `.n-foto3` (Home «Nati e cresciuti», Chi siamo), 20/10/2026: foto sempre intera (`contain` su fondo scuro, 340 px) e scritta sotto la foto, non sopra (regole in fondo a `notte.css`).
  - Foto in testata sempre intera, mai tagliata (scelta A): `object-fit:contain` su fondo scuro; al telefono alta il 62% dello
    schermo. La foto di Bilquis in testata è `bilquis-campionessa-hero.avif` (800×976), non più `femmina-bilquis-hero.avif` (301×396, sgranata).

## Palmarès: targa del titolo, titoli e schede (30/10/2026, Paolo: anteprime 48-51, «Targa calda»)
- Sopra il nome di ogni cane `<span class="section-label titolo-cane">` con la coccarda a colori (svg `.coccarda`) e il titolo principale; sotto il nome `<div class="titoli-cane">` con tutti i titoli, ognuno con una coccarda piccola. Niente alloro (Paolo: «sanno da morto»), niente righe sopra e sotto né maiuscolo spaziato («sembra un'epigrafe»).
- Risultati: grafica di prima (blocchi e righe `.risultato`), anche per Queen. Le schede `.ev` e `.rc` (anteprime 48 e 52) Paolo le ha scartate il 30/10/2026: «cambia solo la targa calda». Le regole `.ev*` in `notte.css` restano inutilizzate.

## Calcolatore delle crocchette (18/10/2026, Paolo)
- Pagine `calcolatore-crocchette-cane` / `dog-food-calculator` / `futterrechner-hund` (translationKey `calcolatore-crocchette`).
  Il calcolatore è `static/js/calcolatore-crocchette.js` (testi IT/EN/DE dentro lo script), stile `.pp*` in fondo a `main.css`.
  L'elenco delle crocchette è la tabella `#pappa-db` della pagina (una sola fonte: lo script la legge); per aggiungerne una si
  aggiunge una riga nelle tre lingue (`data-src="p"` produttore, `"c"` calcolato dai componenti).
- Età da elenco (o data di nascita), peso a occhio o per taglia (piccola, media, grande, gigante); la crescita finisce a 10/12/15/20 mesi
  secondo la taglia. 📷 foto del sacco: `https://gestionale.delpiccolodiavolo.it/api/public/sacco` (limite 30 letture al giorno,
  3 per visitatore, scritto sulla pagina). Le crocchette aggiunte dal visitatore restano nel suo browser (localStorage).
- Componenti analitici (18/10/2026): ogni riga di `#pappa-db` ha `data-c="proteina,grassi,fibra,ceneri,umidità"` (vuoto = non pubblicato), uguale nelle tre lingue; lo script li mostra sotto la scelta delle crocchette.
- **Dopo ogni modifica a `static/js/calcolatore-crocchette.js` cambiare `?v=` nel tag `<script>` delle tre pagine** (18/10/2026: Paolo vedeva la versione vecchia dalla cache). `/js/*` ha `max-age=0, must-revalidate` in `index.headers`.
- Elenco comune (18/10/2026, Paolo): le crocchette aggiunte dai visitatori vanno a `https://gestionale.delpiccolodiavolo.it/api/public/crocchette`
  (POST); Claude le controlla e, se i dati tornano, entrano nell'elenco per tutti (GET della stessa API, aggiunte dallo script all'elenco
  della pagina). Non sono nella tabella `#pappa-db` (Google non le vede): per metterne una nel testo vero, si aggiunge la riga a mano.
- SEO: `titleSeo` «Quanto deve mangiare un cane…», `tags` (keywords dell'Article), `json_ld` WebApplication, 4 FAQ (FAQPage).
- 19/10/2026 (Paolo): pagina a sé, non più articolo del Blog. Niente `articolo: true` (niente scheda nel Blog, né «Ultimi articoli», né Blog nel percorso), `notte: true` (grafica del sito; i colori scuri del calcolatore sono in fondo a `notte.css`, la stampa resta chiara), testata con la foto `cucciolo-ritratto-hero.webp`, FAQ `.faq-item active n-faq`. Nel menu: voce «Calcolatore crocchette» nella voce «Calcolatori» (23/10/2026; prima sotto «Cuccioli»; chiave i18n `calcolatore`, desktop e telefono). In llms.txt fra le pagine principali. «In breve» compare anche fuori dagli articoli se c'è `in_breve:`.
- 20/10/2026 (Paolo): nuovo aspetto, tutto in una pagina senza «Avanti», colori 2 (riquadri bianchi sulla pagina blu; regole `.pp-nuovo` in fondo a `notte.css`, quelle scure del 19/10 tolte). Cinque riquadri: 1 Età (tendine Mesi 2–11 e Anni 1–7, tasto «Anziano 8+», oppure data di nascita col calendario; sterilizzato solo da adulto), 2 Peso (cuccioli: peso previsto da adulto + peso di oggi facoltativo; adulti: peso di oggi), 3 forma vista dall'alto, 4 movimento (icone a linea), 5 crocchette (ricerca + elenco sempre visibile, la scelta in cima) con il riquadro in risalto «Non trovi le tue crocchette?»: «Fotografa il sacco» (API sacco) e «Scrivi la descrizione» (ricerca per nome, API crocchette), più «scrivo io kcal o componenti». Risultato a destra fisso sul computer, barra in basso sul telefono (solo mentre il calcolatore è sullo schermo); tabella per età in un riquadro sotto. Il motore di calcolo è quello di prima.
- 23/10/2026 (Paolo, anteprima-05): nel riquadro 1 sempre ♂ Maschio / ♀ Femmina (`S.sex`, `data-sx`) e Sterilizzato/a (prima solo da adulto); con Femmina le taglie danno il peso da adulto ×0,9 (`szKg`). Riquadro 3 con le figure del cane visto dall'alto (`DOGS`, copia di `FD_DOGS` del gestionale; regole `.pp-dog`, `.pp-fig` in fondo a `notte.css`). Tasto «Scrivi la marca delle tue crocchette». Crocchette aggiunte e non confermate ma plausibili: elenco per tutti con `src:"n"` («dati scritti da un utente, non controllati»), vedi CLAUDE.md del gestionale.

## Notizie: i post del profilo Google (23/10/2026, Paolo: pagina visibile a Google, voce nel menu dopo «Diario Allevamento»)
- Pagine `content/it/novita.md` (slug `notizie`, `/notizie/`; nome «Notizie» scelto da Paolo il 23/10/2026, 1B), `content/en/news.md` (`/en/news/`), `content/de/neuigkeiten.md` (`/de/neuigkeiten/`),
  translationKey `novita-google`, `notte: true`, `postgoogle: true`. Segnaposto `<!--POST-GOOGLE-->` → `partials/post-google.html`
  (sostituito in `single.html` e `single.md`): post dal più recente, data nella lingua della pagina, foto intera, testo
  tradotto, «Scopri di più» portato alla stessa pagina nella lingua del lettore (via translationKey). Nessun post → frase vuota.
- Dati: `data/postgoogle.json` + foto in `static/images/novita-google/`, **scritti solo dal gestionale** (`/api/sitepost`, da solo
  quando Paolo apre, pubblica o elimina un post su Google). Mai modificarli a mano. `lastmod` della pagina = `updated` del file
  (`partials/pagine/lastmod.html`).
- Menu: voce `T "novita"` dopo il Diario, desktop e telefono. llms.txt: riga dopo `<!--DIARIO-GESTIONALE-->`.
- Home (23/10/2026, Paolo): lo stesso riquadro di `<!--NOVITA-->` (`partials/novita-home.html`) mostra la cucciolata se
  `data/novita.json` ha `show:true` («Novità in Home» del gestionale), altrimenti l'ultimo post di `data/postgoogle.json`
  (etichetta «Ultima notizia · data», testo fino a ~300 caratteri, bottone «Leggi tutte le notizie» → `/notizie/#post-<id>`).
  Stile scelto (B senza contorno): scheda blu `--n-card` senza bordo, foto intera a sinistra, bottone bianco `.btn`; regole `.ng-*`
  in fondo a `notte.css`.

## Calcolatore BARF e voce «Calcolatori» (23/10/2026, Paolo: anteprime 09-12 approvate)
- Pagine `calcolatore-barf` / `barf-calculator` / `barf-rechner` (translationKey `calcolatore-barf`, `notte: true`, testata con
  `hero-barf-staffordshire-bull-terrier.webp`). Script `static/js/calcolatore-barf.js` (testi IT/EN/DE, 34 alimenti USDA SR28 e figure
  del cane dentro lo script; **dopo ogni modifica cambiare `?v=` nelle tre pagine**). Stile `.bf-*` in fondo a `notte.css`.
- Motore: calorie 70×peso^0,75 × fattori (come le crocchette); cuccioli, gravidanza (dalla 5ª settimana) e allattamento con le equazioni
  NRC 2006; ciotola 80/20 (carne .40, trippa .16, fegato .04, altre frattaglie .08, ossa .12, verdure .15, frutta .05), «Non ce l'ho»
  rinormalizza le quote; controllo di 12 nutrienti sui minimi e massimi FEDIAF 2021 per 1000 kcal; aggiunte di guscio d'uovo, olio di
  fegato di merluzzo, olio di salmone; iodio, fosforo, zinco, rame, vitamina E «da concordare con il veterinario». Maiale escluso (Aujeszky).
- Nel risultato ogni alimento ha grammi e kcal; togliendo un alimento povero di calorie i grammi scendono e le kcal restano (frase spiegata).
- «Prima di cominciare» = `<details class="bf-info bf-prima">` chiuso che lampeggia (animazione `bf-lamp`) finché non si apre
  (classe `letto`); niente memoria nel browser: a ogni visita lampeggia di nuovo (scelta di Paolo); con «riduci movimento» solo evidenziato.
  Dopo il calcolatore: «Dopo il calcolo» e «Esonero di responsabilità» (testo vero nella pagina).
- «Altro…» in ogni tendina degli alimenti: il visitatore scrive l'alimento, `POST https://gestionale.delpiccolodiavolo.it/api/public/alimento`
  (Claude, valori medi per 100 g crudi; rifiuta maiale, cibi tossici, ossa cotte), l'alimento entra nell'elenco con «(stima IA)» e resta
  nel browser (localStorage `barfAltro`). Limiti e cache nel gestionale (vedi il suo CLAUDE.md).
- Menu: voce a sé «Calcolatori» (i18n `calcolatori`, fra Blog e FAQ) con i due calcolatori; al passaggio del cursore `.dd-tip` (icona e
  due righe, i18n `calcolatoreTip`, `calcolatoreBarfTip`, `calcolatoreBarf`); sul telefono le due righe sono scritte sotto (`.dd-sub`).
  Desktop e `.mobile-menu` sono copie separate in `header.html`. Fra 768 e 1400 px lo spazio fra le voci è 1rem perché il menu stia su una riga.
- 23/10/2026 (Paolo, anteprima-13): sotto i grammi la tabella «Nutrienti ogni 1000 kcal» (`protHtml`, testi `NT`): proteine e grassi dai
  componenti analitici, calcio, fosforo e Ca:P solo se scritti (caselle `pp-ca`, `pp-ph` del modulo «Ho il sacco…» o foto del sacco, che ora
  restituisce `ca`/`ph`), minimi e massimi FEDIAF per età; stato ok / al limite / manca / troppo in rosso; riga sulle vitamine («completo»).
- 23/10/2026 (Paolo, anteprima-15): la foto del sacco legge anche gli additivi per kg (vitamine A, D3, E; zinco, rame, iodio, ferro, selenio,
  manganese → `f.a`) e sotto i nutrienti compare «Vitamine e minerali aggiunti» (`addHtml`, testi `AD`): aggiunti ogni 1000 kcal contro il
  minimo FEDIAF («coperto» / «più le materie prime», mai «manca»: il sacco scrive solo la parte aggiunta) e per kg contro il massimo di legge
  UE («troppo»). Le crocchette proposte all'elenco comune si salvano subito come «attesa» e il gestionale le ricontrolla da solo.
- 23/10/2026 (Paolo, anteprime 16-17): etichette del produttore nell'elenco. Ogni riga di `#pappa-db` ha `data-a` (calcio e fosforo in %,
  additivi per kg come elemento: `ca:1.1;ph:0.91;va:16000;vd:1600;ve:600;zn:146;cu:14.1;fe:37.5;se:0.4;mn:49.4`) e `data-au` (pagina della fonte),
  uguali nelle tre lingue; il catalogo del gestionale ha `a`/`au` per 334 crocchette (cercate da Claude il 23/10/2026). Per le crocchette senza
  etichetta lo script la chiede a `https://gestionale.delpiccolodiavolo.it/api/public/etichetta` (Claude cerca in internet una volta, poi vale per
  tutti; `pappaEt` nel browser). Anziano sterilizzato 1,3; nel cucciolo sterilizzato una frase spiega che conta la crescita.
- 24/10/2026 (Paolo, anteprime 33-35, scelta C): «Rimedia». Nella tabella dei nutrienti, sotto «manca»/«al limite» di fosforo, zinco, rame,
  iodio e vitamina E, il tasto «Rimedia» apre una finestra dal basso (`.bf-sh`) con gli alimenti per compensare (`CMP`, dati extra `XF`, USDA SR28):
  grammi per arrivare al minimo FEDIAF +5%, misura in cucchiai/cucchiaini, kcal; in grigio quelli che sforano un massimo (vit. A, D, calcio, fosforo,
  Ca:P) o servono oltre il 10% delle calorie. Toccato, entra nella ciotola (`S.ex`, riga «aggiunto per», «Togli») e le calorie restano quelle.
  Iodio: solo alga kelp, con i µg/g scritti dall'etichetta (Paolo: niente ostriche né pesce). Stile in fondo a `notte.css`, copiato nel gestionale.
- 24/10/2026 (Paolo, anteprime 37-38): secondo alimento metà e metà per carne muscolare, fegato e ossa carnose (`S.ing2`, `DUE`, tasti
  «+ Aggiungi un'altra carne muscolare / un altro fegato / altre ossa carnose», `items()` divide la quota); in «Rimedia» le proposte «½ + ½»
  che sistemano la carenza senza sforare i massimi. Stile `.bf-s2`, `.bf-shs` in fondo a `notte.css`, copiato nel gestionale.
- 24/10/2026 (Paolo, anteprima-18, scelta C): la tendina «Carne muscolare» del BARF è divisa in gruppi (`<optgroup>`, mappa `CG` e testi `T.cg`
  nello script): Carne · Cuore e ventrigli (contano come carne) · Pesce · Uova · Aggiunti da te (alimenti di «Altro…»). Nuovi alimenti di carne: metterli in `CG`.

## Riquadri comuni dei calcolatori: calcolatore-cane.js (24/10/2026, Paolo: anteprime 19-21 approvate, «le ultime linee guida»)
- `static/js/calcolatore-cane.js` (`window.DPDCane.make(elemento,{lang,S,onChange})`) disegna i riquadri 1-4 (età con mezzi mesi, anni, «Anziano 8+»
  e data di nascita; sesso, sterilizzato; peso con taglie e ±; forma vista dall'alto; movimento) ed è l'unico motore delle calorie per tutti e due i
  calcolatori: crocchette (`calcolatore-crocchette.js`) e BARF (`calcolatore-barf.js`, che lo carica da solo se manca, es. pagina delle famiglie del
  gestionale). Stile: classi `pp-*` dentro `.pp-nuovo` + regole `.dc-*` in fondo a `notte.css`. **Le tre pagine di ogni calcolatore caricano prima
  `calcolatore-cane.js` e poi il proprio script, con lo stesso `?v=`: cambiarlo in tutte e sei dopo ogni modifica.**
- Formule (FEDIAF luglio 2024 / NRC 2006): cucciolo 130 × kg^0,75 × 3,2 × (e^(−0,87 p) − 0,1), p = peso di oggi / peso da adulto, senza fattore
  movimento; adulto 70 × kg^0,75 × 1,8/1,6 (8+ anni 1,4/1,3) × movimento; forma ±10%. Femmina intera da 12 mesi: «Gravidanza o allattamento» (25/10/2026, prima «Momento»; si vede appena si sceglie Femmina non sterilizzata, anche senza età): Nessuno / Gravida
  (Gravida: data della monta, fino al giorno 34 razione di prima, dal 35 132 × kg^0,75 + 26 × kg) / In allattamento (data del parto e cuccioli: 145 × kg^0,75 +
  kg × (24 n + 12 m) × L, L settimane 1-4 = 0,75/0,95/1,1/1,2 NRC, 5-8 = 0,9/0,65/0,4/0,2 stima nostra, dalla 9ª adulto). Tappe con le date in una
  tendina chiusa (`details.dc-tld`). Tabella «Come cambia crescendo» o «Settimana per settimana» in tutti e due i calcolatori (`rows()`).
- Le date non ridisegnano il proprio campo (aggiornamento a pezzi, `part()`): sull'iPhone il calendario restava chiuso al primo tocco.
- Crescita oltre 15 kg da adulto: calcio minimo 2,5 g/1000 kcal (FEDIAF 2024, tabella III-3b), in tutti e due i calcolatori.
- In fondo alle pagine «Le formule del calcolo e il perché» (stesso testo per le calorie nelle due pagine, IT/EN/DE), con lo studio Klein 2019
  (l'equazione NRC può dare circa il 20% in più sotto i 6 mesi) fra le fonti.


## Parole cliccabili (24/10/2026, Paolo: «niente link idioti»)
- Regole in COME-SI-SCRIVE §10 «La parola cliccabile». `verifica.py` le controlla (codice `link_generico`, ERRORE):
  nessun link può cominciare con Leggi/Vedi/Scopri/Clicca/Vai/Apri/Read/See/View/Mehr/Hier… o essere «qui», «questa pagina».
- Link a SBTPedigree: «Pedigree di <cane> su SBTPedigree» (EN «Pedigree of …», DE «Stammbaum von …»), mai «Vedi pedigree».
- Le parole dei «Tag» in fondo agli articoli sono `<span>`, non link (portavano tutte all'elenco del Blog).

## Più foto nelle pagine (24/10/2026, Paolo: «l'utente medio non legge», anteprima-30 approvata)
- Regola: una foto almeno ogni 300 parole circa, una per sezione, sotto il titolo della sezione e prima del testo:
  `<figure class="n-foto1"><img src=… alt=… width height loading="lazy" decoding="async"></figure>` (stile in `notte.css` e `main.css`:
  intera, mai tagliata, alta al massimo 440 px, larga al massimo 560 px). Nei `.n-passo` va dentro la colonna del testo (subito dopo `<div>`).
- Foto solo dei cani e cuccioli dell'allevamento, legate a quello che dice la sezione. Fonti: quelle già in `static/images` e quelle
  recuperate dalla cronologia git (archivio tolto dal sito), convertite in `static/images/foto/<nome-descrittivo>.webp` (max 900 px).
- Foto messe il 24/10/2026 in quasi tutte le pagine (anteprime 36, 39, 40). Nell'archivio, `img-…` con il cane marrone su asfalto al sole con stivali viola è Tikus (Paolo): mai usarla.
- Foto di Cattleya (`cattleya-campionessa*.webp`): l'handler con la giacca marrone non è Cristina (Paolo, 25/10/2026), si possono usare.
- 30/10/2026 (Paolo): tolta ovunque la foto del cane nero con la pettorina viola, di sera in giardino (`giovane-staffordshire-bull-terrier-con-pettorina.webp`, `staffordshire-bull-terrier-con-pettorina-di-sera.webp`, ora in `_archivio/`): mai rimetterla.
- **Mai foto di Tikus, mai foto con Cristina (ex handler)**: nel dubbio niente foto di esposizione con handler, meglio solo il cane.
- Righe con un link da solo: niente più. Al loro posto riquadri `.n-schede` / `.n-scheda` (etichetta oro, titolo, una riga, bottone)
  in fondo alla sezione; `.n-uno` per un riquadro solo (regole in `notte.css` e `main.css`).

## Foto mai ingrandite (25/10/2026, Paolo: anteprima-41 approvata)
- Molte foto dei cani esistono solo piccole (225–450 px): Paolo non ne ha di più grandi. Regola: nessuna foto viene mostrata più larga
  della sua misura vera, e nelle schede dei cani si vede intera. Regole in fondo a `main.css` e `notte.css` («Foto mai ingrandite»):
  `figure.n-foto1`, `.female-image`, `.male-image`, `.image-center`, `.article-image`, `.story-block`, `.dog` con `width:auto;max-width:100%`
  e `object-fit:contain`; galleria `.gallery-item` intera su fondo scuro. I cani della Home (`.n-cane`) restano come prima (scelta di Paolo).
- Controllo: build in `/tmp`, poi misurare con Playwright larghezza mostrata contro `naturalWidth` di ogni `<img>` (PC 1280 e telefono 390).
