# Modifiche del 29 settembre 2026

Base: commit `a46b617` di `zonerosse/delpiccolodiavolo-hugo` (main, 29/09/2026 14:49).
Se nel frattempo hai modificato uno di questi file, confronta prima di sovrascrivere.

Estrarre nella radice del repository: i percorsi sono quelli del repo.

## Punto 1 — Home inglese e tedesca
- `content/en/_index.md`, `content/de/_index.md`: ricostruite sulla struttura della
  home italiana (hero con i dati, "Nati e cresciuti qui", FerraraToday, "Cosa non
  facciamo", "Una cucciolata l'anno", "Come si controlla quello che scriviamo",
  giudici, FAQ prezzo/test/visita, CTA). Parole: EN 1.376 -> 2.582, DE 1.270 -> 2.394.
- Tolti i blocchi vecchi ("tidy boxes and identical puppies", "he loves children").
- `correlati` allineati a quelli italiani (cuccioli, quanto costa, cane giusto, visita).

## Punto 2 — Le sette guide cuccioli italiane
- `content/it/cuccioli-prime-vaccinazioni.md` (581 -> 1.333 parole)
- `content/it/cuccioli-alimentazione-iniziale.md` (633 -> 1.162)
- `content/it/cuccioli-educazione-bisogni.md` (606 -> 1.229)
- `content/it/cuccioli-gestione-solitudine.md` (726 -> 1.180)
- `content/it/cuccioli-prima-passeggiata.md` (847 -> 1.446)
- `content/it/cuccioli-giochi-mentali.md` (768 -> 1.487)
- `content/it/cuccioli-socializzazione-in-casa.md` (719 -> 1.566)
  Front matter invariato (title, date, slug, translationKey, image, description);
  blocco citabile conservato; stessi collegamenti interni piu' quelli alle guide
  nuove (sverminazione, cuccioli socializzati, esercizio sicuro, denti, estero).
  Il gancio pre-commit aggiornera' lastmod al commit.

## Punto 5 — Ancore del breadcrumb
- 8 file in `content/it/`: `/blog/#salute-benessere` -> `/blog/#salute`,
  `/blog/#standard-linee-sangue` -> `/blog/#standard` (48 link).

## Punto 6 — Schema e anteprime social
- `layouts/partials/schema.html`:
  - `Organization.name` fisso "Allevamento Del Piccolo Diavolo" nelle tre lingue;
    "Del Piccolo Diavolo Kennel" / "Zucht Del Piccolo Diavolo" in `alternateName`.
    SE la scheda Google Business ha un altro nome, cambia quella riga.
  - `Article.keywords` solo se il front matter dichiara `tags: [...]` (prima era un
    testo fisso, identico su 112 articoli e in italiano anche in EN/DE).
  - `Article.image` ora e' un elenco: prima l'anteprima 1200x630, poi l'originale.
- `layouts/_default/baseof.html`: `og:image` automatico. Ordine: `og_image` nel
  front matter -> `/images/og/<nome-immagine>.jpg` se esiste -> `og-default.jpg`.
  Per dare un'anteprima a un articolo nuovo basta creare il JPEG 1200x630 con lo
  stesso nome dell'`image` della pagina, in `static/images/og/`.
- `static/images/og/`: 21 anteprime JPEG 1200x630 (1,7 MB in tutto), generate dalle
  immagini degli articoli abbastanza grandi (orizzontali >= 640 px, verticali
  >= 560 px; le verticali stanno intere su sfondo sfocato). Le 24 immagini troppo
  piccole (miniature da 300x168 ecc.) restano su og-default.jpg.

## Verifica fatta sul build
`hugo --gc --minify --cleanDestinationDir`: nessun WARN. 0 link interni rotti,
0 errori JSON-LD, tag bilanciati, indentazione a due spazi, blocco citabile fra
110 e 160 parole su tutte e sette le guide, hreflang IT/EN/DE + x-default sulle home.
