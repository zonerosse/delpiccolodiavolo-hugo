# Seconda passata del 29 settembre 2026

Base: commit `a46b617` + lo zip precedente (`delpiccolodiavolo-fix-2026-09-29.zip`).
`layouts/partials/schema.html` qui dentro CONTIENE ANCHE le modifiche dello zip
precedente (nome Organization, keywords, image dell'Article): va bene sovrascrivere.

Estrarre nella radice del repository.

## Breadcrumb JSON-LD uguale a quello visibile
- `layouts/partials/schema.html`: il BreadcrumbList si legge dal
  `<nav class="breadcrumb">` presente nel contenuto: livelli, nomi e link,
  compresa la categoria con l'ancora (`/blog/#cuccioli`). Risultato sul build:
  64 pagine a 4 livelli, 45 a 3, le schede del diario Home > Diario > Scheda
  (percorso del template), le pagine senza percorso visibile restano Home > Pagina.
  Nessun file di contenuto toccato.

## Ticker: seconda copia nascosta
- `layouts/partials/ticker-a11y.html` (nuovo): mette `aria-hidden="true"` sugli
  span della seconda meta' di ogni `.features-track`. Lavora sull'HTML a build,
  quindi le 150 pagine con la barra non vanno modificate. Se le due meta' non
  coincidono, non tocca niente.
- `layouts/index.html`, `layouts/_default/single.html`: chiamano il partial.
- `assets/css/main.css`: aggiunta in coda
  `@media (prefers-reduced-motion:reduce){.features-track{animation:none}}`.

## Chiave `contatti` sulla pagina geo
- `content/it/allevamento-staffordshire-bull-terrier-in-emilia-romagna.md`:
  `translationKey: "contatti"` (era `emilia-romagna`). Ora la pagina geo,
  `/en/contact/` e `/de/kontakt/` sono collegate: hreflang a tre lingue piu'
  x-default sull'italiano, sia nel <head> che nella sitemap, e selettore di lingua.
- `Add-TranslationKey.ps1`: mappa aggiornata di conseguenza (la riga
  `emilia-romagna` e' stata unita a quella `contatti`), cosi' un futuro
  `-Apply` non riporta indietro la chiave.

## Titoli home EN/DE
Non toccati: le varianti sono nel messaggio, scegli tu e poi e' una riga
(`titleSeo:` nel front matter delle due home).

## Verifica sul build
`hugo --gc --minify --cleanDestinationDir`: nessun WARN, 0 link rotti,
0 errori JSON-LD, 160 pagine.
