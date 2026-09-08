# Del Piccolo Diavolo — sito Hugo

Sito di delpiccolodiavolo.it, allevamento di Staffordshire Bull Terrier a Ostellato (FE).
Hugo multilingua in tre lingue: italiano, inglese, tedesco. Pubblicato su Cloudflare Pages.

## Struttura del progetto

```
delpiccolodiavolo-hugo/
├── hugo.toml                    # configurazione: lingue, parametri, output
├── content/
│   ├── it/                      # 48 pagine italiane (lingua principale, senza /it/ nell'URL)
│   ├── en/                      # 46 pagine inglesi
│   ├── de/                      # 46 pagine tedesche
│   └── */diario-allevamento/    # le cucciolate, una pagina ciascuna
├── layouts/
│   ├── _default/
│   │   ├── baseof.html          # struttura comune: head, meta, Open Graph
│   │   ├── single.html          # pagine normali
│   │   ├── single.md            # versione Markdown di ogni pagina, per gli agenti AI
│   │   └── sitemap.xml          # sitemap; esclude le pagine con noindex
│   ├── diario-allevamento/
│   │   ├── list.html            # indice del diario
│   │   └── single.html          # scheda di una cucciolata
│   ├── partials/
│   │   ├── header.html          # navigazione e selettore di lingua
│   │   ├── footer.html
│   │   ├── css.html             # incorpora assets/css/main.css nella pagina
│   │   ├── schema.html          # tutti i dati strutturati JSON-LD
│   │   ├── breadcrumb.html
│   │   ├── correlati.html       # sostituisce <!--CORRELATI--> nel contenuto
│   │   ├── ultima-cucciolata.html
│   │   ├── hero-foto.html
│   │   └── prenota.html         # modulo di prenotazione, sostituisce <!--PRENOTA-->
│   ├── index.html               # homepage
│   ├── index.headers            # genera public/_headers (cache e sicurezza)
│   ├── index.md                 # versione Markdown della home
│   ├── index.llmsfull.txt       # genera llms-full.txt
│   ├── robots.txt
│   └── 404.html
├── assets/
│   └── css/main.css             # unico foglio di stile, incorporato nelle pagine
├── static/                      # copiato così com'è nel sito pubblicato
│   ├── images/                  # foto (avif e webp)
│   ├── videos/                  # video delle cucciolate
│   ├── docs/                    # referti e guide in PDF
│   ├── blog/  foto/             # immagini più vecchie
│   ├── _redirects               # redirect di Cloudflare Pages
│   ├── llms.txt  en/  de/       # indice del sito per gli agenti AI
│   ├── manifest.json  favicon*  # icone e PWA
│   └── <chiave>.txt             # chiave IndexNow
├── i18n/
│   └── it.toml  en.toml  de.toml
├── .githooks/pre-commit         # aggiorna lastmod nelle pagine modificate
├── .github/workflows/           # IndexNow e ricostruzione settimanale
└── apps-script-prenotazioni.gs  # codice Google Apps Script del modulo
```

## Avviare il sito in locale

```powershell
cd C:\Hugo\delpiccolodiavolo-hugo
hugo server
```

Poi apri http://localhost:1313. Il sito si aggiorna a ogni salvataggio.

## Prima di pubblicare, sempre

```powershell
hugo --gc --minify --cleanDestinationDir
```

`--cleanDestinationDir` serve davvero: senza, Hugo lascia in `public/` le pagine
cancellate, che finiscono online un'altra volta.

Se il comando dà errore, **fermati**: un errore qui è un deploy fallito su
Cloudflare. Il caso più frequente è l'indentazione dentro `custom_content`.

## Come sono fatte le pagine

Ogni pagina è un file `.md` con il frontmatter fra `---` e il contenuto HTML
dentro `custom_content`. I campi che contano:

- `title` — titolo della pagina
- `titleSeo` — titolo per i motori di ricerca, se diverso; ha la precedenza
- `description` — massimo 165 caratteri, finisce nello snippet di Google
- `slug` — l'indirizzo della pagina
- `translationKey` — collega fra loro le tre versioni linguistiche
- `lastmod` — data, aggiornata dall'hook a ogni commit
- `noindex: true` — pagina fuori dalla sitemap e dai risultati di ricerca
- `tipoPagina` — tipo di dato strutturato (WebPage, CollectionPage, ProfilePage…)

**Attenzione all'indentazione.** Tutto ciò che sta dentro `custom_content: |`
va rientrato di due spazi. Una riga a colonna zero chiude il blocco e il build
si ferma con "could not find expected ':'".

Nel contenuto si possono usare tre segnaposto, che Hugo sostituisce da sé:
`<!--CORRELATI-->`, `<!--CUCCIOLATA-->`, `<!--PRENOTA-->`.

## Aggiungere una pagina

1. Crea `content/it/nuova-pagina.md` copiando la struttura da una esistente
2. Metti lo stesso `translationKey` nelle versioni `en/` e `de/`
3. Se l'indirizzo sostituisce quello di una pagina vecchia, aggiungi il redirect

## Redirect: l'ordine conta

In `static/_redirects` le regole **statiche vanno tutte prima** di quelle con
il jolly `*`. Cloudflare Pages considera dinamica ogni riga che segue la prima
con il jolly, e ne applica al massimo 100: le altre le scarta in silenzio,
senza scrivere errori nel log. È già successo, con 386 regole ignorate per mesi.

Stesso limite per `layouts/index.headers`: massimo 100 regole.

## Deploy

Il push su `main` fa partire da solo il build su Cloudflare Pages
(build command `hugo`, output `public`). Poi il workflow IndexNow segnala le
pagine a Bing, da cui pesca ChatGPT quando naviga.

```powershell
git add -A
git commit -m "descrizione della modifica"
git push
```

L'hook in `.githooks/pre-commit` aggiorna `lastmod` nelle pagine del commit.
Va attivato una volta per ogni copia del repository:

```powershell
git config core.hooksPath .githooks
```

## Cose da sapere

- Il CSS è uno solo, `assets/css/main.css`, incorporato nella pagina: nessun file esterno da scaricare
- I dati strutturati stanno tutti in `layouts/partials/schema.html`
- Le anteprime social usano `static/images/og-default.jpg`, in JPEG: AVIF non è supportato da Facebook e LinkedIn
- Cloudflare clona il repository senza storia, quindi `enableGitInfo` non ricava le date: per questo `lastmod` sta nel frontmatter
- Nel pannello Cloudflare, **TTL cache browser** deve restare su "Rispetta intestazioni esistenti", altrimenti sovrascrive `_headers`
