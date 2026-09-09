# La seconda espressione aveva lo stesso difetto

Si estrae in `C:\Hugo\delpiccolodiavolo-hugo`. Due file.
Comprende anche la correzione della riga di riserva del CSS: se non hai ancora
estratto `delpiccolodiavolo-css.zip`, questo lo sostituisce.

## Cosa era rimasto

`schema.html` ha due espressioni che pescano le domande dal contenuto. Ieri ne
abbiamo corretta una, la seconda. La prima — quella della fisarmonica
`faq-item` — aveva esattamente lo stesso `(.*?\?)` e lo stesso comportamento:
scavalcava il `</h3>` e si portava dietro il paragrafo seguente.

Non si vedeva perché colpiva solo quattro pagine invece di trentasei:

```
/faq-sullo-staffordshire-bull-terrier/
/en/faq-staffordshire-bull-terrier/
/de/faq-staffordshire-bull-terrier/
/cuccioli-staffordshire-bull-terrier/
```

Su tutte e quattro la prima domanda dichiarata a Google era
«Le Tue Domande, Le Nostre Risposte Benvenuto nella sezione FAQ…» e le sue
traduzioni.

## La correzione

Qui il titolo può contenere link o `<strong>`, quindi `[^<]*` non andava bene.
La cattura ora ammette tag dentro il titolo ma non la chiusura del titolo
stesso:

```
((?:[^<]|<[^/]|</[^h]|</h[^23])*?\?)
```

Senza lookahead, perché Hugo usa Go e Go usa RE2, che non li ha.

## Verificato ricostruendo

- 40 pagine con FAQPage, 262 domande
- pagine segnalate dal nuovo controllo di Sottosopra: **0**, erano 4
- nessuna domanda persa: il conteggio è lo stesso di prima
