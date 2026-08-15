# Markdown per gli agenti AI — cosa fare su Cloudflare

Il sito ora genera, accanto a ogni pagina HTML, una versione Markdown:

    /colori-staffordshire-bull-terrier/index.html   ← per le persone
    /colori-staffordshire-bull-terrier/index.md     ← per gli agenti AI

Il Markdown pesa l'89% in meno: 6,9 MB contro 764 KB su tutto il sito.
Meno token da leggere significa risposte più rapide e più probabilità che
un modello legga la pagina per intero invece di troncarla.

Le versioni Markdown sono **già online** dopo il push: chiunque può
aprire `delpiccolodiavolo.it/colori-staffordshire-bull-terrier/index.md`
e vederle. Questo da solo è già utile.

I due passaggi qui sotto servono a fare un passo in più: consegnare
automaticamente il Markdown a chi lo chiede, senza che debba conoscere
l'indirizzo del file.

---

## 1. Regola di trasformazione (5 minuti)

Cloudflare → il dominio delpiccolodiavolo.it → **Regole** → **Regole di
trasformazione** → **Riscrittura URL** → *Crea regola*.

**Nome:** `Markdown per agenti AI`

**Quando le richieste corrispondono a...** → scegli *Modifica espressione*
e incolla:

    (http.request.headers["accept"][0] contains "text/markdown" and not ends_with(http.request.uri.path, ".md"))

**Quindi...** → *Riscrivi a...* → **Percorso** → *Dinamico*:

    concat(http.request.uri.path, "index.md")

Salva e distribuisci.

Da quel momento, quando un agente chiede una pagina dichiarando di
preferire il Markdown, riceve la versione leggera. Un browser normale
continua a ricevere l'HTML: non cambia niente per i visitatori.

---

## 2. Intestazione Vary (2 minuti)

Serve perché la cache non serva l'HTML a chi ha chiesto Markdown, o
viceversa.

Nel file `static/_headers` del progetto Hugo, la riga è **già stata
aggiunta**:

    /*
      Vary: Accept

Nessuna azione richiesta: arriva con il prossimo push.

---

## 3. Come verificare che funzioni

Da PowerShell:

    curl.exe -H "Accept: text/markdown" https://delpiccolodiavolo.it/colori-staffordshire-bull-terrier/

Se la risposta inizia con `# I colori dello Staffordshire Bull Terrier`
la regola funziona. Se inizia con `<!DOCTYPE html>` la regola non è
attiva: ricontrolla l'espressione al punto 1.

E per vedere la versione Markdown senza nessuna configurazione:

    https://delpiccolodiavolo.it/colori-staffordshire-bull-terrier/index.md

---

## Note

- L'HTML non è stato toccato: 136 pagine, 357 blocchi JSON-LD validi.
- Il Markdown viene generato per tutte e tre le lingue.
- Se in futuro modifichi la struttura delle pagine, la conversione si
  adatta da sola: legge il contenuto, non una copia.
- I file di conversione sono `layouts/_default/single.md` e
  `layouts/index.md`. Se un elemento decorativo finisse nel Markdown,
  si aggiunge una riga lì per toglierlo.
