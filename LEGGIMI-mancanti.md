# Quello che manca al sito, in un pacchetto solo

Si estrae in `C:\Hugo\delpiccolodiavolo-hugo`. Tredici file, tutti in `content/`.
Non serve estrarre nient'altro: questo pacchetto sostituisce
`delpiccolodiavolo-fonti.zip` e `delpiccolodiavolo-programma.zip`.
Gli altri tre zip li hai già pubblicati.

Le modifiche sono state rifatte sopra la versione che hai online adesso
(commit `programma`), non sopra la mia copia più vecchia: così non ti riporto
indietro il `lastmod` né altro di quello che hai già fatto.

## Cosa contiene

**Le fonti esterne su dodici pagine** — quattro argomenti in tre lingue.

| Fonte | Dove |
|---|---|
| Canine Genetics Centre, Università di Cambridge | test genetici, IT EN DE |
| Battaglia 2009, *Journal of Veterinary Behavior* | bio sensor, IT EN DE |
| Schoon e Berntsen 2011, stessa rivista | bio sensor, IT EN DE |
| The Kennel Club, standard di razza | legge EN DE, linee di sangue EN |
| Standard FCI n. 76, PDF ufficiale | linee di sangue DE |

Dentro ci sono anche due correzioni di merito sulla pagina dei test genetici:
la data dell'identificazione dell'L2-HGA (2002 il primo caso, 2005 la mutazione,
non «2003») e l'Animal Health Trust, che ha chiuso e il cui gruppo di ricerca
oggi è il Canine Genetics Centre.

**Le quattro FAQ italiane** sulla pagina programma allevamento, che esistevano
solo in inglese e in tedesco.

## Verificato sul costruito

- 145 pagine, nessun errore
- pagine senza una fonte esterna: da 35 a 20
- FAQPage sul programma allevamento con quattro domande
- i due rimandi in bio-sensor, dentro il paragrafo «Cosa regge e cosa no»

## Dopo

```
hugo --gc
git add -A
git commit -m "fonti esterne e FAQ programma"
git push
```
