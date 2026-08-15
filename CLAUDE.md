# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static site for delpiccolodiavolo.it (Staffordshire Bull Terrier kennel, Ostellato FE), built with **Hugo extended v0.152.2**. Trilingual: Italian (default, no URL prefix), English (`/en/`), German (`/de/`). No Node, no package.json, no test suite, no linter — Hugo is the whole toolchain.

Site copy, front matter keys, template comments and script output are all in Italian. Keep that convention when adding code or content.

## Commands

```bash
hugo server          # dev server on http://localhost:1313, live reload
hugo                 # production build into public/ (gitignored)
hugo --quiet         # build, only show warnings/errors — use to verify templates compile
hugo server -D       # include drafts
```

Deploy is Cloudflare Pages (build command `hugo`, output dir `public`), triggered on push to `main`.

Two PowerShell maintenance scripts, both **dry-run by default**, `-Apply` to write (they preserve UTF-8 without BOM — keep it that way):

```powershell
.\Add-TranslationKey.ps1 -Apply   # injects translationKey into front matter, from a hardcoded it|en|de filename map
.\Fix-BrokenLinks.ps1 -Apply      # rewrites known-bad href="..." paths across content/
```

`Add-TranslationKey.ps1` contains an explicit page map at the top; adding a new translated page means adding a row there too.

## Architecture

### Multilingual layout

Each language has its own `contentDir` (`content/it`, `content/en`, `content/de`) and **its own localized filenames/slugs** — `cuccioli-staffordshire-bull-terrier.md` ↔ `puppies-staffordshire-bull-terrier.md` ↔ `welpen-staffordshire-bull-terrier.md`. Translations are linked *only* by the `translationKey` front matter field, never by filename. If `translationKey` is missing or mismatched, hreflang tags and `.AllTranslations` silently drop the page.

### `custom_content`: pages are HTML in front matter, not Markdown

The dominant pattern (~123 of 136 pages): the page body is empty and all markup lives in a `custom_content:` YAML block-scalar in the front matter, rendered through `safeHTML` by `layouts/index.html` / `layouts/_default/single.html`. Only pages *without* `custom_content` fall through to the standard Markdown path (breadcrumb + `.Content` + WhatsApp CTA). Goldmark has `unsafe = true`, so inline HTML in Markdown bodies also renders.

Inside `custom_content`, HTML comment placeholders are string-replaced with partials before the output is marked safe. **Which placeholders work depends on the template**:

| Placeholder | Home (`index.html`) | Regular page (`single.html`) | Renders |
|---|---|---|---|
| `<!--NEWS-->` | yes | no | newest `diario-allevamento` post as a card (built inline in the template) |
| `<!--HEROFOTO-->` | yes | no | `partials/hero-foto.html` |
| `<!--CUCCIOLATA-->` | no | yes | `partials/ultima-cucciolata.html` |
| `<!--CORRELATI-->` | yes | yes | `partials/correlati.html`, driven by the `correlati:` front matter list |
| `<!--LISTAATTESA-->` | yes | yes | `partials/lista-attesa.html` |

Adding a placeholder to a page that its template doesn't handle leaves the literal comment in the HTML.

### Breeding diary drives the homepage

`content/<lang>/diario-allevamento/` is the only real Hugo section, with its own `layouts/diario-allevamento/{list,single}.html`. The **newest post by date** is pulled into the home NEWS block and into `ultima-cucciolata.html`. Post front matter: `date`, `image`, `image_alt`, `annuncio` (overrides the title in cards), and `stato: disponibile|completa` which switches the waiting-list CTA copy on the post page.

### Hero photo rotation and the weekly rebuild

`layouts/partials/hero-foto.html` picks one entry from the `[[params.hero.foto]]` array in `hugo.toml` using `now` (`rotazione = "settimane" | "giorni" | "mesi"`). Selection happens **at build time**, so the photo only changes when the site is rebuilt — that is what `.github/workflows/ricostruzione-settimanale.yml` is for: every Monday it POSTs to a Cloudflare Pages deploy hook (repo secret `CLOUDFLARE_DEPLOY_HOOK`). Each photo entry carries `alt`/`title`/`didascalia` plus `altEn`/`altDe` etc. variants; missing translations fall back to the Italian.

### CSS

One file, `assets/css/main.css` (already minified in-repo, single long line), inlined into every page's `<head>` via `partials/css.html` through Hugo Pipes. There is no external stylesheet request and no build step for CSS. Component-level styling is otherwise **inline `style=""` attributes** inside partials and `custom_content` — that is deliberate, not an oversight.

### Translations: three mechanisms coexist

1. `i18n/{it,en,de}.toml` via `{{ T "key" }}` — nav labels, footer, WhatsApp prefill text.
2. Inline `{{ if eq .Site.Language.Lang "en" }}…{{ end }}` chains — used throughout the partials for anything longer than a label.
3. Per-language `dict` blocks — `lista-attesa.html` builds a whole `$T` dictionary per language.

`layouts/partials/header.html` hardcodes each menu target as a `cond` chain over the three language slugs, and the **desktop `<ul class="nav-links">` and the `.mobile-menu` block are separate copies** — a menu change must be applied to both.

### SEO machinery

- `baseof.html`: `titleSeo` front matter overrides `title` for `<title>`/OG/Twitter; the brand suffix is appended only when the result stays ≤60 chars (always on the home page). `hreflang` comes from `.AllTranslations` (hence `translationKey`). `noindex: true` front matter emits a robots meta tag. `json_ld` front matter injects extra JSON-LD.
- `partials/schema.html`: hand-written Organization/LocalBusiness JSON-LD with address, geo coordinates and `aggregateRating` — these values are duplicated from `[params]` in `hugo.toml`, so update both.
- `enableGitInfo = true`: `lastmod` comes from git commit dates. Sitemap and robots.txt have custom layouts (`layouts/_default/sitemap.xml`, `layouts/robots.txt`); taxonomies and RSS are disabled.

### Waiting-list form → Google Apps Script

`partials/lista-attesa.html` renders a plain `<form method="POST">` posting directly to `params.listaAttesaEndpoint` (a Google Apps Script `/exec` URL). It works with JavaScript disabled; the small inline script only blocks the `azienda` honeypot field and disables the submit button. Server side lives in `apps-script-lista-attesa.gs` — that file is **not deployed by this repo**; editing it requires a manual redeploy from the Apps Script editor (see the install comment at the top of the file).

## Repo cruft — do not treat as source

`content_backup/`, `content/*- Copia.zip`, `layouts.zip`, `lista.txt` (UTF-16 file listing), and `PULIZIA-FILE-VECCHI.bat` are leftovers from the site migration. `public/` is gitignored but present locally.
