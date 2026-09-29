# Terza passata del 29 settembre 2026: link in entrata e articolo sul pedigree

Base: commit `5c9400f` ("fix2") di main. Le due home EN/DE contengono anche la
riga `titleSeo:` dello zip "c": se lo hai gia' applicato, sovrascrivere va bene lo stesso.

Estrarre nella radice del repository.

## Link in entrata per le 17 pagine deboli
36 collegamenti aggiunti in 27 pagine esistenti, tutti agganciati a frasi che gia'
parlavano dell'argomento (mai infilati a forza). Risultato: nessuna pagina
indicizzabile sotto i 3 link contestuali; le 17 stanno ora fra 4 e 7.
- IT: FAQ (3 risposte), cane giusto, cuccioli (2), standard-tipicita', legge,
  femmine (scheda di Nora -> cucciolata), programma allevamento (-> diario),
  home ("conformita' allo standard" -> standard).
- EN: FAQ (4 risposte), puppies, is-it-right-for-you (3), females (2), males,
  diario (2 x colours), litters (2), other-pets (correlati), home.
- DE: FAQ (5 risposte), welpen (2), richtige-hund (3), huendinnen (2), rueden,
  diario (2 x Farben), wuerfe (2), home.
Le risposte FAQ allungate restano sotto il limite di 1.200 caratteri dello schema:
le tre pagine FAQ tengono tutte le 28 domande.

## Articolo sul pedigree in inglese e tedesco
- `content/en/how-to-read-a-pedigree.md`, `content/de/wie-man-eine-ahnentafel-liest.md`
  (translationKey `leggere-pedigree`, stessa data e stessa immagine dell'italiano;
  hreflang a tre lingue + x-default).
- Scheda nel blog: `content/en/blog.md`, `content/de/blog.md`, sezione Standard,
  contatore 7 -> 8.
- `static/en/llms.txt`, `static/de/llms.txt`: voce nella sezione Salute e selezione.
- Link in entrata (4 ciascuno): home, choosing-bloodlines / blutlinien-waehlen,
  how-to-choose-a-breeder / wie-waehlt-man-eine-zucht, piu' la scheda nel blog.
  Per parita' anche la home italiana ora rimanda a come-si-legge-un-pedigree.
- `Add-TranslationKey.ps1`: riga `leggere-pedigree` aggiunta alla mappa.

## Verifica sul build
`hugo --gc --minify --cleanDestinationDir`: nessun WARN, 162 pagine, 0 link rotti,
0 errori JSON-LD, hreflang completo su tutte le pagine indicizzabili.
