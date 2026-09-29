# Modifiche del 29/09/2026 (e)

## 1. Tolto il markup Review / AggregateRating
`layouts/partials/schema.html`: via il blocco che leggeva le schede
recensione e i campi `review` e `aggregateRating` dell'Organization sulle
pagine recensioni / reviews / bewertungen. Le recensioni restano visibili,
i numeri in `hugo.toml` continuano a comandare i testi.
Motivo: recensioni prese dalla scheda Google = vietato marcarle; per
LocalBusiness Google non mostra comunque stelle "self-serving".

## 2. Blocco citabile con il nome dell'allevamento
Prima: 21 pagine su 105 nominavano Del Piccolo Diavolo nel primo paragrafo.
Ora: 97 su 105. Le 6 restanti sono i tre articoli in Markdown (temperamento,
Staffy o Amstaff) dove il blocco citabile è il secondo paragrafo e il nome
c'è gia'.

- 68 pagine: aggiunta la frase di attribuzione in fondo al primo paragrafo
  (versione breve in 4 pagine EN/IT per stare sotto le 160 parole).
- Sverminazione IT/EN/DE: "nostra cucciolata" -> nome dell'allevamento, e
  aggiunta la razza nella prima frase.
- Storie di famiglia IT/EN/DE: "Alleviamo" -> "L'allevamento Del Piccolo
  Diavolo alleva".
- Come scegliere l'allevamento: IT, "questo allevamento" -> nome; EN e DE
  avevano un'apertura di 32-34 parole, aggiunta la traduzione del blocco
  italiano come primo paragrafo.
- Temperamento EN e DE: aggiunta la traduzione del blocco citabile italiano
  dopo "In short" / "Kurz gefasst".

## Da decidere
`cuccioli-educazione-bisogni` (155 parole) e `cuccioli-giochi-mentali` (159):
anche la frase breve porta oltre 160. Serve togliere una frase: scegli tu quale.

## Documentazione
CLAUDE.md e COME-SI-SCRIVE.md (sezione 4) aggiornati con le due regole.
