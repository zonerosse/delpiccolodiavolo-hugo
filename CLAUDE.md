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

Markdown for AI agents: every page also builds as `index.md` (`layouts/_default/single.md`, `layouts/index.md`). On Cloudflare a URL Rewrite Transform Rule named "Markdown per agenti AI" serves it to clients sending `Accept: text/markdown`:
expression `(http.request.headers["accept"][0] contains "text/markdown" and not ends_with(http.request.uri.path, ".md"))`, dynamic path `concat(http.request.uri.path, "index.md")`. `Vary: Accept` in `layouts/index.headers` keeps the cache from mixing the two. Check: `curl.exe -H "Accept: text/markdown" https://delpiccolodiavolo.it/colori-staffordshire-bull-terrier/` must start with `#`, not `<!DOCTYPE html>`.

## Architecture

### Multilingual layout

Each language has its own `contentDir` (`content/it`, `content/en`, `content/de`) and **its own localized filenames/slugs** — `cuccioli-staffordshire-bull-terrier.md` ↔ `puppies-staffordshire-bull-terrier.md` ↔ `welpen-staffordshire-bull-terrier.md`. Translations are linked *only* by the `translationKey` front matter field, never by filename. If `translationKey` is missing or mismatched, hreflang tags and `.AllTranslations` silently drop the page.

### `custom_content`: pages are HTML in front matter, not Markdown

The dominant pattern (137 of 161 content files): the page body is empty and all markup lives in a `custom_content:` YAML block-scalar in the front matter, rendered through `safeHTML` by `layouts/index.html` / `layouts/_default/single.html`. Only pages *without* `custom_content` fall through to the standard Markdown path (breadcrumb + `.Content` + WhatsApp CTA). A Markdown article that starts its body with its own `<section class="hero">` followed by `<nav class="breadcrumb">` gets no generic page-hero: `single.html` prints everything up to the first `</nav>` full width and puts the rest inside `.article-content`. The four articles still written in Markdown (price guide, choosing a breeder, temperament, Staffy vs Amstaff, in three languages) all follow this pattern. Goldmark has `unsafe = true`, so inline HTML in Markdown bodies also renders.

Inside `custom_content`, HTML comment placeholders are string-replaced with partials before the output is marked safe. **Which placeholders work depends on the template**:

| Placeholder | Home (`index.html`) | Regular page (`single.html`) | Renders |
|---|---|---|---|
| `<!--NEWS-->` | yes | no | newest `diario-allevamento` post as a card (built inline in the template) |
| `<!--HEROFOTO-->` | yes | no | `partials/hero-foto.html` |
| `<!--CUCCIOLATA-->` | no | yes | `partials/ultima-cucciolata.html` |
| `<!--CORRELATI-->` | yes | yes | `partials/correlati.html`, driven by the `correlati:` front matter list |
| `<!--RECENTI-->` | no | yes | `partials/recenti.html` |
| `<!--GUIDE-->` | no | yes | `partials/guide-cucciolo.html`, group `cucciolo` (links to the practical puppy guides, found by `translationKey`, current page excluded) |
| `<!--PRENOTA-->` | no | yes | `partials/prenota.html` — the trilingual contact form, used only on `/contatto/` |
| `<!--REC-VOTO-->` / `<!--REC-TOTALE-->` | yes | yes | Google rating and review count from `recensioniVoto` / `recensioniTotale` in `hugo.toml` — never write the numbers by hand |

`<!--CORRELATI-->` and `<!--RECENTI-->` are also replaced in the Markdown body of pages *without* `custom_content` (the `{{ else }}` branch of `single.html`); the other placeholders are not. Adding a placeholder to a page that its template doesn't handle leaves the literal comment in the HTML.

### Breeding diary drives the homepage

`content/<lang>/diario-allevamento/` is the only real Hugo section, with its own `layouts/diario-allevamento/{list,single}.html`. The **newest post by date** is pulled into the home NEWS block and into `ultima-cucciolata.html`. Post front matter: `date`, `image`, `image_alt`, `annuncio` (overrides the title in cards), and `stato: disponibile|completa` (default `completa`) which switches the title and text of the contact block at the bottom of the post page.

### Hero photo rotation and the weekly rebuild

`layouts/partials/hero-foto.html` picks one entry from the `[[params.hero.foto]]` array in `hugo.toml` using `now` (`rotazione = "settimane" | "giorni" | "mesi"`). Selection happens **at build time**, so the photo only changes when the site is rebuilt — that is what `.github/workflows/ricostruzione-settimanale.yml` is for: every Monday it POSTs to a Cloudflare Pages deploy hook (repo secret `CLOUDFLARE_DEPLOY_HOOK`). Each photo entry carries `alt`/`title`/`didascalia` plus `altEn`/`altDe` etc. variants; missing translations fall back to the Italian.

### CSS

One file, `assets/css/main.css` (already minified in-repo, single long line), inlined into every page's `<head>` via `partials/css.html` through Hugo Pipes. There is no external stylesheet request and no build step for CSS. Component-level styling is otherwise **inline `style=""` attributes** inside partials and `custom_content` — that is deliberate, not an oversight.

### Translations: three mechanisms coexist

1. `i18n/{it,en,de}.toml` via `{{ T "key" }}` — nav labels, footer, WhatsApp prefill text.
2. Inline `{{ if eq .Site.Language.Lang "en" }}…{{ end }}` chains — used throughout the partials for anything longer than a label.
3. Per-language `dict` blocks — e.g. `data-locale.html`, `schema.html`.

Exception: `partials/prenota.html` is a single page for all three languages, so its labels carry IT · EN · DE on the same line instead of switching by language.

`layouts/partials/header.html` hardcodes each menu target as a `cond` chain over the three language slugs, and the **desktop `<ul class="nav-links">` and the `.mobile-menu` block are separate copies** — a menu change must be applied to both.

### SEO machinery

- `baseof.html`: `titleSeo` front matter overrides `title` for `<title>`/OG/Twitter; the brand suffix is appended only when the result stays ≤60 chars (always on the home page). `hreflang` comes from `.AllTranslations` (hence `translationKey`). `noindex: true` front matter emits a robots meta tag. `json_ld` front matter injects extra JSON-LD.
- `partials/schema.html`: hand-written Organization/LocalBusiness JSON-LD with address and geo coordinates — these values are duplicated from `[params]` in `hugo.toml`, so update both. **No `Review`/`AggregateRating` markup, on purpose**: the reviews come from the Google Business profile, and Google forbids marking up reviews collected elsewhere (and shows no stars for self-serving LocalBusiness reviews). `recensioniVoto`/`recensioniTotale` in `hugo.toml` only feed the visible text.
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
Colours: health `#27403a→#4f7566`, puppies `#6b3f1d→#b7793a`, family `#4a2c26→#9a5840`, standard/bloodlines and "know the breed" `#211d1a→#5c4a3a`.
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

## WhatsApp buttons (October 2026)
- Every WhatsApp link on the site points to `/wa/<number>?text=…`, never straight to `https://wa.me/`. `functions/wa/[[path]].js`
  (Cloudflare Pages Function) logs the tap in the management app (`gestionale.delpiccolodiavolo.it/api/public/walog`,
  shared secret `WA_KEY` set in BOTH Cloudflare projects) and redirects (302) to `https://wa.me/<number>?text=…`.
  Only the source page path is sent (from the same-site Referer): no IP, no personal data; bots and link previews are skipped.
- `robots.txt` disallows `/wa/` for every group; `verifica.py` treats `/wa/<digits>` as a valid internal link.
- The JSON-LD in `partials/schema.html` keeps the real `https://wa.me/` URL (it is data, not a button).
- New pages: write WhatsApp links as `/wa/393924635584?text=…` (same text-encoding as before).
