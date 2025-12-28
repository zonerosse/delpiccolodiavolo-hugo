# Del Piccolo Diavolo - Sito Hugo

Questo è il sito delpiccolodiavolo.it convertito in Hugo con supporto multilingua (Italiano + Inglese).

## Struttura del progetto

```
delpiccolodiavolo-hugo/
├── hugo.toml              # Configurazione principale
├── content/
│   ├── it/                # Contenuti italiani (36 pagine)
│   └── en/                # Contenuti inglesi (da completare)
├── layouts/
│   ├── _default/          # Template base
│   │   ├── baseof.html    # Layout wrapper
│   │   └── single.html    # Template pagine
│   ├── partials/          # Componenti riutilizzabili
│   │   ├── header.html    # Navigazione
│   │   ├── footer.html    # Footer
│   │   └── css.html       # Stili CSS
│   └── index.html         # Template homepage
├── static/                # File statici (immagini, video, PDF)
│   ├── images/
│   ├── docs/
│   ├── blog/
│   ├── foto/
│   └── Video/
└── i18n/                  # Traduzioni menu/footer
    ├── it.toml
    └── en.toml
```

## Installare Hugo

### macOS
```bash
brew install hugo
```

### Windows
Scarica da: https://gohugo.io/installation/windows/

### Linux
```bash
sudo apt install hugo
# oppure
sudo snap install hugo
```

## Avviare il sito in locale

1. Apri il terminale
2. Vai nella cartella del progetto:
   ```bash
   cd delpiccolodiavolo-hugo
   ```
3. Avvia il server:
   ```bash
   hugo server
   ```
4. Apri il browser su: http://localhost:1313

Il sito si aggiorna automaticamente quando modifichi i file.

## Come funziona

### Modificare una pagina
I contenuti sono in `content/it/nome-pagina.md`. Ogni file ha:
- **frontmatter** (tra `---`): titolo, descrizione, slug
- **custom_content**: il contenuto HTML della pagina

Per modificare, apri il file .md e cambia il contenuto nella sezione `custom_content`.

### Aggiungere una nuova pagina
1. Crea un file `content/it/nuova-pagina.md`
2. Copia la struttura da una pagina esistente
3. Modifica titolo, descrizione e contenuto

### Versione inglese
La homepage inglese è già pronta in `content/en/_index.md`.

Per aggiungere altre pagine inglesi:
1. Copia il file italiano corrispondente in `content/en/`
2. Traduci il contenuto
3. I link del menu si adattano automaticamente

### Modificare il menu
Il menu è in `layouts/partials/header.html`. Le traduzioni delle voci sono in `i18n/it.toml` e `i18n/en.toml`.

### Modificare il footer
Il footer è in `layouts/partials/footer.html`.

### Modificare gli stili CSS
Gli stili sono in `layouts/partials/css.html`.

## Build per la produzione

Per generare il sito statico:
```bash
hugo
```

I file vengono creati nella cartella `public/`. Questi sono i file da caricare su Cloudflare Pages o altro hosting.

## Deploy su Cloudflare Pages

1. Carica il progetto su GitHub
2. Collega il repository a Cloudflare Pages
3. Imposta:
   - Build command: `hugo`
   - Build output directory: `public`
4. Ogni push su GitHub aggiornerà automaticamente il sito

## Note

- Le immagini sono già in `/static/images/`
- I PDF sono in `/static/docs/`
- I video sono in `/static/Video/`
- Il sito usa CSS inline per massime performance
- Supporto multilingua attivo (IT default, EN disponibile)

## Supporto

Per domande o modifiche, contattami.
