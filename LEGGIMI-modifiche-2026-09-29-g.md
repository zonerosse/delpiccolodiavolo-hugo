# Modifiche del 29/09/2026 (g) — schede di condivisione

Questo zip contiene TUTTO quello dei due zip precedenti (e, f) più le
schede. Se non li avevi ancora applicati, basta questo.

## Schede di condivisione per tutti gli articoli
- 108 immagini 1200x630 (36 articoli x 3 lingue) in
  static/images/og/schede/it|en|de/. Variante 2: fondo sabbia, titolo,
  categoria, icona dell'argomento nel cerchio col colore della categoria.
- Ogni articolo ha nel front matter og_image e og_image_alt che puntano
  alla sua scheda. Vale anche per i 14 articoli che prima avevano una foto.
- baseof.html: dichiara 1200x630 anche per le schede.
- Home, chi siamo, cuccioli, fattrici, maschi, recensioni, contatti e
  diario restano con la foto og-default.jpg.
- Le vecchie foto in static/images/og/*.jpg non sono più usate come
  anteprima: le ho lasciate lì, decidi tu se cancellarle.
- tools/schede-og/: lo script e l'elenco articolo -> icona, per rifare
  le schede quando esce un articolo nuovo (lo lancio io, non tu).

Dopo la pubblicazione, Facebook e WhatsApp tengono in cache le vecchie
anteprime per qualche giorno. Per Facebook si forza col Debugger di
condivisione (developers.facebook.com/tools/debug), incollando l'URL e
premendo "Scrape Again".
