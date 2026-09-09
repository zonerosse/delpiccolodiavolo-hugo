# Riquadro "Ultima cucciolata": spento, non cancellato

Si estrae in `C:\Hugo\delpiccolodiavolo-hugo`. Due file.

| File | Cosa cambia |
|---|---|
| `hugo.toml` | nuovo parametro `mostraUltimaCucciolata = false` |
| `layouts/partials/ultima-cucciolata.html` | il riquadro viene disegnato solo se quel parametro è true |

## Perché spento e non tolto

Il riquadro compariva in sei pagine — cuccioli e cucciolate, nelle tre lingue —
richiamato dal segnaposto `<!--CUCCIOLATA-->` dentro il contenuto di ognuna.
Toglierlo davvero avrebbe voluto dire cancellare quel segnaposto da sei file, e
rimetterlo a mano in sei file alla prossima cucciolata.

Così invece i segnaposto restano dove sono e non producono niente. Verificato
ricostruendo il sito: 145 pagine, zero riquadri, nessuna sezione vuota rimasta
per strada.

## Come farlo tornare

In `hugo.toml`, sotto `[params]`:

```
mostraUltimaCucciolata = true
```

Il riquadro pesca da solo l'ultima voce del diario di allevamento: non c'è altro
da aggiornare.
