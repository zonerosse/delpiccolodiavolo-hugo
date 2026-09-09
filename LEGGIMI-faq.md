# FAQ: le due pagine mancanti, e un guasto più grosso trovato per strada

Si estrae in `C:\Hugo\delpiccolodiavolo-hugo`. Tre file sostituiti.

| File | Cosa cambia |
|---|---|
| `content/en/staffy-genetic-testing-l2hga-hc.md` | le 6 risposte incapsulate in `<p>` |
| `content/en/staffy-bloodlines-guide.md` | le 5 risposte incapsulate in `<p>` |
| `layouts/partials/schema.html` | la domanda non attraversa più il `</h2>` |

## Le due pagine segnalate

Le pagine italiane scrivono la risposta così:

```
<div class="faq-item">
<h3 class="faq-question">Domanda?</h3>
<div class="faq-answer">
<p>Risposta.</p>
</div>
</div>
```

Le due inglesi la scrivevano senza il `<p>`, con il testo attaccato dentro il
`div`. `schema.html` cerca due forme: la fisarmonica con `</div>` prima della
risposta, oppure il titolo seguito da un paragrafo. Quel markup non era né
l'una né l'altra, quindi le coppie non venivano trovate e il FAQPage non
partiva. Ora sono uguali alle italiane.

## Il guasto trovato per strada

L'espressione dello Schema 2 era:

```
<h[23][^>]*>(.*?\?)\s*</h[23]>
```

`(.*?)` con `(?s)` attraversa qualunque cosa, `</h2>` compreso. Quindi partiva
da un titolo che non era una domanda, proseguiva nel paragrafo sotto e si
fermava al primo punto interrogativo utile, che era il titolo della domanda
successiva. Il tutto veniva pubblicato come nome di una `Question` nel JSON-LD.

Sul sito costruito, prima:

```
pagine con FAQPage: 39
domande malformate: su 36 pagine su 39
```

Un esempio vero, dal sito in produzione:

> "What a bloodline actually is A bloodline is not a sub-breed and it is not a
> brand. It is the ac..."

Non è una domanda, ed era dichiarata a Google come tale.

La correzione è una classe di caratteri: `([^<]*\?)` invece di `(.*?\?)`. Così
la cattura si ferma al primo tag e non può uscire dal titolo.

Dopo, sullo stesso sito costruito:

```
pagine con FAQPage: 39
domande totali:     258
domande malformate: 0
```

Nessuna pagina perde il suo FAQPage: le domande vere restano tutte, e quelle
che prima venivano inghiottite dentro una domanda finta ora compaiono da sole.
Da qui i 258.

## Come verificare

```
hugo --gc
```

Poi apri `public\en\staffy-bloodlines-guide\index.html` e cerca `FAQPage`:
deve esserci, con cinque domande che finiscono tutte con il punto interrogativo.
