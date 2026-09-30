# Del Piccolo Diavolo — sito Hugo

Sito di delpiccolodiavolo.it, allevamento di Staffordshire Bull Terrier a Ostellato (FE).
Hugo extended 0.152.2, tre lingue (italiano senza prefisso, `/en/`, `/de/`), pubblicato su Cloudflare Pages.

Due file vanno letti prima di mettere mano al sito:

- `CLAUDE.md` — architettura tecnica: modelli, segnaposto, schema, output per gli agenti AI
- `COME-SI-SCRIVE.md` — criteri editoriali: come si scrivono pagine, articoli e FAQ

Questo README è solo la mappa.

## Struttura del progetto

```
delpiccolodiavolo-hugo/
├── hugo.toml                    # lingue, parametri, recensioni Google, foto hero a rotazione, output
├── content/
│   ├── it/  en/  de/            # 52 / 50 / 50 pagine, collegate fra lingue da translationKey
│   └── */diario-allevamento/    # le cucciolate, una pagina ciascuna (unica sezione vera)
├── layouts/
│   ├── _default/
│   │   ├── baseof.html          # head, meta, Open Graph, hreflang
│   │   ├── single.html          # pagine e articoli
│   │   ├── single.md            # versione Markdown di ogni pagina, per gli agenti AI
│   │   ├── single.rssprogramma.xml  # feed RSS del programma di allevamento
│   │   ├── segui.html           # pagina "Segui le cucciolate"
│   │   └── sitemap.xml          # esclude le pagine noindex
│   ├── diario-allevamento/      # indice e scheda di una cucciolata
│   ├── partials/                # header, footer, schema JSON-LD, hero, correlati,
│   │                            # recenti, guide cucciolo, ultima cucciolata, modulo contatto
│   ├── shortcodes/rimando.html  # scheda con foto verso una pagina importante
│   ├── index.html  index.md     # home, in HTML e in Markdown
│   ├── index.headers            # genera public/_headers (cache e sicurezza)
│   ├── index.llmstxt.txt        # genera llms.txt da assets/llms/<lingua>.txt
│   ├── index.llmsfull.txt       # genera llms-full.txt
│   ├── robots.txt
│   └── 404.html
├── assets/
│   ├── css/main.css             # unico foglio di stile, incorporato nelle pagine
│   └── llms/it.txt en.txt de.txt
├── static/                      # copiato così com'è nel sito pubblicato
│   ├── images/                  # foto, icone del blog, schede di condivisione (og/)
│   ├── videos/  docs/  foto/    # video delle cucciolate, referti e PDF
│   ├── _redirects               # redirect di Cloudflare Pages
│   ├── manifest.json  favicon*
│   └── <chiave>.txt             # chiave IndexNow
├── i18n/it.toml en.toml de.toml # etichette brevi (menu, footer, WhatsApp)
├── tools/
│   ├── controlli/verifica.py    # controllo completo del sito, prima di ogni consegna
│   ├── lastmod/aggiorna.py      # allinea lastmod all'ultima modifica del testo
│   ├── schede-og/genera.py      # schede di condivisione e icone degli articoli
│   └── parole-chiave/volumi.py  # volumi di ricerca da DataForSEO
├── .githooks/pre-commit         # aggiorna lastmod nelle pagine del commit
├── .github/workflows/           # IndexNow dopo ogni push, ricostruzione del lunedì
└── apps-script-prenotazioni.gs  # codice del modulo contatto (va incollato in Apps Script)
```

`_archivio/` sta solo sul disco, fuori da git: lì finiscono i file che nessuna pagina usa più.

## Avviare il sito in locale

```powershell
cd C:\Hugo\delpiccolodiavolo-hugo
hugo server
```

Poi apri http://localhost:1313. Il sito si aggiorna a ogni salvataggio.

## Il controllo prima di pubblicare

```powershell
python tools/controlli/verifica.py
```

Compila il sito e fa 45 controlli: link, hreflang, canonical, schema, FAQ, tre
lingue allineate, lastmod, parole chiave, regole di COME-SI-SCRIVE. Gli ERRORI
devono essere 0. Gli AVVISI sono regole editoriali: si decide caso per caso, e
quelli accettati vanno in `tools/controlli/eccezioni.txt`.

## Come sono fatte le pagine

Quasi tutte le pagine hanno il corpo vuoto e l'HTML dentro `custom_content` nel
front matter. I campi che contano:

- `title`, `titleSeo` — titolo; `titleSeo` ha la precedenza per `<title>` e anteprime
- `description` — fra 140 e 165 caratteri
- `slug` — l'indirizzo della pagina
- `translationKey` — collega le tre versioni linguistiche: senza, niente hreflang
- `lastmod` — data dell'ultima modifica del testo visibile
- `noindex: true` — fuori dalla sitemap e dai risultati di ricerca
- `fonti_motivo` — perché la pagina non cita fonti esterne, quando non le cita
- `og_image`, `og_image_alt`, `thumb` — scheda di condivisione e icona dell'articolo

**Attenzione all'indentazione.** Tutto ciò che sta dentro `custom_content: |`
va rientrato di due spazi. Una riga a colonna zero chiude il blocco e il build
si ferma con "could not find expected ':'".

I segnaposto (`<!--CORRELATI-->`, `<!--RECENTI-->`, `<!--GUIDE-->`,
`<!--REC-TOTALE-->`…) e i modelli in cui funzionano sono in `CLAUDE.md`.

## Aggiungere una pagina

1. Crea la pagina nelle tre lingue insieme, con lo stesso `translationKey` e la stessa struttura
2. Se è un articolo, aggiungilo alla pagina blog delle tre lingue e genera scheda e icona con `tools/schede-og/genera.py`
3. Se l'indirizzo sostituisce quello di una pagina vecchia, aggiungi il redirect
4. Lancia `verifica.py`

## Redirect: l'ordine conta

In `static/_redirects` le regole **statiche vanno tutte prima** di quelle con
il jolly `*`. Cloudflare Pages considera dinamica ogni riga che segue la prima
con il jolly, e ne applica al massimo 100: le altre le scarta in silenzio,
senza scrivere errori nel log. È già successo, con 386 regole ignorate per mesi.

Stesso limite per `layouts/index.headers`: massimo 100 regole.

## Deploy

Il push su `main` fa partire da solo il build su Cloudflare Pages
(build command `hugo`, output `public`). Poi il workflow IndexNow segnala le
pagine cambiate a Bing, da cui pesca ChatGPT quando naviga. Ogni lunedì un
secondo workflow fa ricompilare il sito, così la foto della home cambia anche
senza modifiche.

```powershell
git add -A
git commit -m "descrizione della modifica"
git push
```

## Cose da sapere

- Il CSS è uno solo, `assets/css/main.css`, incorporato nella pagina: nessun file esterno da scaricare
- I dati strutturati stanno in `layouts/partials/schema.html`; indirizzo e coordinate sono ripetuti in `hugo.toml`, vanno cambiati in tutti e due
- Voto e numero delle recensioni Google si cambiano solo in `hugo.toml` (`recensioniVoto`, `recensioniTotale`)
- Le anteprime social sono JPEG: AVIF non è supportato da Facebook e LinkedIn
- Cloudflare clona il repository senza storia, quindi `enableGitInfo` non ricava le date: per questo `lastmod` sta nel front matter
- Su Cloudflare una regola di trasformazione ("Markdown per agenti AI") consegna la versione `index.md` a chi la chiede con `Accept: text/markdown`; i dettagli sono in `CLAUDE.md`
- Nel pannello Cloudflare, **TTL cache browser** deve restare su "Rispetta intestazioni esistenti", altrimenti sovrascrive `_headers`
