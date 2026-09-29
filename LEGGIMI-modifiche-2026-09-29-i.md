# Modifiche del 29/09/2026 (i) — icone nel blog e nelle testate

Questo zip contiene anche tutto lo zip "analisi-2-correzioni" (h):
se non l'avevi ancora applicato, basta questo.

## Pagina Blog (IT/EN/DE) e riquadro "Ultimi articoli"
- Tutte le schede degli articoli mostrano l'icona, stile A (fondo chiaro,
  icona nel cerchio col colore della categoria). 102 schede in tutto.
- Le schede del diario restano con le foto delle cucciolate.
- Immagini in static/images/blog/icone/ (una per articolo, valgono per
  tutte e tre le lingue).

## Testata degli articoli
- 27 articoli passano all'icona: i 19 con foto troppo piccola (sotto i
  560 pixel) e gli 8 con la foto generica hero-default.
- 9 tengono la loro foto: sverminazione, costo, vaccinazioni, pedigree,
  come scegliere l'allevamento, Staffy o Amstaff, temperamento, storie
  di famiglia, cucciolo all'estero.

## Documentazione
- CLAUDE.md: regole per icone, testate e foto generica.
- tools/schede-og/genera.py --icone rigenera le icone.
