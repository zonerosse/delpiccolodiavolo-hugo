# COME-SI-SCRIVE.md

Criteri adottati su delpiccolodiavolo.it per creare pagine, articoli, FAQ e
tutto il resto. Questo file riguarda **cosa scrivere e come**; l'architettura
tecnica del sito sta in `CLAUDE.md`.

Ogni regola qui dentro nasce da un errore commesso davvero, e sotto ciascuna
c'è scritto perché.

---

## 0. Tre lingue, sempre insieme

**Ogni modifica in italiano si fa, nello stesso momento, anche in inglese e in
tedesco.** Vale per tutto: una pagina o un articolo nuovo, un paragrafo
aggiunto o tolto, un titolo, un H1, una description, una FAQ, un link, un'alt,
una foto, una fonte. La pagina italiana e le sue versioni EN e DE (quelle con
la stessa `translationKey`) devono dire le stesse cose, con la stessa
struttura: stesse sezioni, stesse FAQ, stesse fonti, stesse immagini, stessi
link verso le pagine corrispondenti nella propria lingua.

Non è una traduzione da fare "dopo": una consegna che cambia solo l'italiano
è incompleta, e lo script di controllo la blocca come **errore** (confronta
i file modificati e non ancora committati: se cambia la pagina italiana e non
cambiano le altre due, si ferma). Se l'italiano risulta aggiornato più di
recente di EN o DE, lo segnala come avviso.

Un articolo nuovo si pubblica quindi in tre file, con tre schede nel blog,
tre voci in llms.txt e i link in entrata in tutte e tre le lingue.

Perché: EN e DE rimasti indietro erano 35 pagine su 52, con FAQ, fonti e
sezioni mancanti. Tenerle allineate a ogni modifica costa poco; recuperarle
tutte insieme costa giorni.

---

## 1. La regola che viene prima di tutte

**Non affermare: dimostrare.**

Il sito non dice "siamo seri", pubblica i referti con il numero di microchip.
Non dice "selezioniamo bene", pubblica il coefficiente di consanguineità di
Queen con i numeri. Non dice "i cuccioli sono sani", pubblica l'esame delle
feci compresa la riga positiva.

Quando una frase non si può verificare, o si toglie o si sostituisce con il
dato che la rende controllabile.

| Da non scrivere | Da scrivere |
|---|---|
| Cuccioli socializzati | I cuccioli crescono in casa, poi nel cortile, con i rumori della strada |
| Genitori testati | Referti pubblicati sul sito, con microchip in chiaro |
| Allevamento serio | Otto criteri e come verificarli, su di noi come su chiunque |
| Cane equilibrato | Lo standard descrive un cane affidabile con le persone |

---

## 2. Tono

**Non tirarsela.** Niente aperture con l'elenco dei titoli. I risultati
emergono dai fatti, alla fine, non dall'inizio.

**Dire anche quello che non torna.** Il Bio Sensor non ha le prove che
promette. Il "nanny dog" è un soprannome, non una garanzia. Una fattrice in
lattazione non è in forma. Un allevamento che dichiara solo le cose belle non
sta dando informazioni, sta facendo pubblicità.

**Prima la riserva, poi la rassicurazione.** Vale soprattutto per bambini e
altri cani. Si apre con il limite e si chiude con quello che si può fare, mai
il contrario.

**Niente parole che non significano niente**: passione, amore per la razza,
esperienza pluriennale, professionalità.

---

## 3. Le tre posizioni non negoziabili

Queste vanno tenute identiche ovunque compaiano, in tutte e tre le lingue.

**Portatori.** *Da noi no, mai.* Un cane portatore di L2-HGA o di cataratta
ereditaria non entra in riproduzione. Tecnicamente un portatore accoppiato a
un esente non produce malati, ma lascia in giro cuccioli portatori: il
problema si sposta di una generazione e si affida a qualcun altro.

**Bambini.** Nessun cane va lasciato solo con un bambino piccolo, di nessuna
razza. "Nanny dog" descrive la tolleranza, non una capacità di sorveglianza.

**Altri cani.** È un terrier: la reattività verso i simili esiste, soprattutto
fra soggetti dello stesso sesso in età adulta. La socializzazione la riduce,
non la cancella. Un cane che sta bene al parco può rifiutare un coinquilino,
perché in casa l'altro non se ne va più.

---

## 4. Il blocco citabile

Ogni pagina apre con **un paragrafo che si regge da solo**: fra 110 e 160
parole, subito dopo `<article class="article-content">`.

Deve funzionare anche letto isolato, fuori dalla pagina, perché è il pezzo che
un motore generativo può prendere e citare.

- **Nomina il soggetto**: "l'allevamento Del Piccolo Diavolo, a Ostellato in
  provincia di Ferrara", non "noi" o "qui"
- **Nomina la razza** per esteso almeno una volta
- **Contiene dati**: numeri, nomi di test, riferimenti di legge
- **Non dipende** da quello che c'è scritto sopra o sotto

Se il paragrafo non nomina l'allevamento in modo naturale, si chiude con la
frase di attribuzione, identica ovunque:

- IT: *Guida a cura dell'allevamento Del Piccolo Diavolo, che alleva Staffordshire Bull Terrier a Ostellato (FE) dal 2013.*
  In italiano la parte *allevamento Del Piccolo Diavolo, che alleva
  Staffordshire Bull Terrier* è un link alla home (`href="/"`): è il segnale
  principale per la parola chiave "allevamento Staffordshire Bull Terrier"
  (scelta di Paolo, settembre 2026). Nelle guide nuove va messo uguale.
  Stessa cosa in inglese (link su *Del Piccolo Diavolo kennel, which has bred
  Staffordshire Bull Terriers*, verso `/en/`) e in tedesco (link su *Zucht Del
  Piccolo Diavolo, die seit 2013 in Ostellato (Ferrara, Italien) Staffordshire
  Bull Terrier züchtet*, verso `/de/`).
- EN: *A guide by the Del Piccolo Diavolo kennel, which has bred Staffordshire Bull Terriers in Ostellato (Ferrara, Italy) since 2013.*
- DE: *Ein Ratgeber der Zucht Del Piccolo Diavolo, die seit 2013 in Ostellato (Ferrara, Italien) Staffordshire Bull Terrier züchtet.*

Se con la frase lunga si superano le 160 parole, si usa la versione breve
(*Guida dell'allevamento Del Piccolo Diavolo, Ostellato (FE).* / *A guide by
the Del Piccolo Diavolo kennel, Ostellato, Italy.* / *Ein Ratgeber der Zucht
Del Piccolo Diavolo, Ostellato (Italien).*). Meglio ancora, quando il testo lo
permette, sostituire un "noi" o un "nostro" con il nome, come nelle pagine
sulle storie di famiglia e sulla sverminazione.

Perché: un motore generativo che estrae il paragrafo cita il dato, ma senza il
nome non cita chi lo dice.

Lo stesso principio vale per i paragrafi dentro la pagina: evitare aperture
come "E poi chiedi comunque", "Il terzo punto", "Quello che leggete qui" —
frasi che senza il contesto non si capiscono.

---

## 5. FAQ

**Nessuna risposta sotto le 80 parole.** La media sul sito è 116 in italiano,
108 in inglese, 89 in tedesco.

Una risposta deve contenere **almeno una cosa che chi ha già letto tre siti
non sapeva**. Se non c'è niente di non scontato da dire, la domanda non serve.

Esempi di cosa significa:
- non "lo Staffy soffre il caldo", ma *il muso corto rende l'ansimazione meno
  efficiente, e l'ansimazione è l'unico sistema di raffreddamento del cane*
- non "usa snack dentali", ma *la regola dell'unghia: se premendo con l'unghia
  l'oggetto non cede, è troppo duro, e la frattura del quarto premolare
  superiore è la diagnosi più comune*
- non "quanto vive", ma *12-14 anni, e dopo la genetica il fattore che incide
  di più è il peso*

**Struttura HTML.** La risposta va dentro `<div class="faq-answer">`, la
domanda dentro `<h3 class="faq-q">` o `<h3 class="faq-question">`. Lo schema
`FAQPage` si genera da solo leggendo queste classi: la domanda non deve
attraversare tag di intestazione diversi, altrimenti il JSON-LD si rompe.

---

## 6. Front matter di un articolo

```yaml
---
title: "Titolo visibile in cima alla pagina"
titleSeo: "Titolo per Google, 30-60 caratteri"
date: 2026-09-27
lastmod: 2026-09-27
translationKey: "chiave-uguale-nelle-tre-lingue"
articolo: true
image: "/images/blog/nome-immagine.webp"
description: "140-165 caratteri, dice cosa c'è nella pagina senza slogan."
slug: "indirizzo-della-pagina"
custom_content: |

  <!-- tutto l'HTML, indentato di DUE spazi per ogni riga -->
---
```

**`date` è obbligatoria.** Senza, con `enableGitInfo = true` Hugo userebbe la
data dell'ultimo commit e l'articolo risulterebbe pubblicato oggi ogni volta
che lo tocchi. La sezione `[frontmatter]` in `hugo.toml` lo impedisce, e il
gancio pre-commit blocca il commit se manca.

**`lastmod` lo aggiorna Claude** in ogni file che consegna, con
`tools/lastmod/aggiorna.py --scrivi`. Il gancio in `.githooks/pre-commit`
resta come rete di sicurezza, ma non si conta su di lui.

**Lunghezze da rispettare**: `titleSeo` fra 30 e 60 caratteri, `description`
fra 140 e 165. Oltre, Google taglia.

**`translationKey` identica nelle tre lingue**, altrimenti gli hreflang non si
collegano e le versioni risultano pagine separate.

**Indentazione**: ogni riga dentro `custom_content` va rientrata di due spazi.
Una riga fuori posto rompe il front matter YAML e la pagina non compila.

---

## 7. Struttura di una pagina articolo

Nell'ordine:

1. `<section class="hero">` con foto, occhiello, titolo, sottotitolo e tempo
   di lettura
2. `<nav class="breadcrumb">` con Home › Blog › Categoria › Pagina
3. `<div class="article-container"><article class="article-content">`
4. **Il blocco citabile**
5. Il corpo, con `<h2>` per le sezioni
6. Una scheda `<a class="rimando">` verso una pagina collegata
7. `<div class="related-articles">` con tre o quattro articoli
8. Chiusura `</article></div>`
9. `<section class="cta-section">` con l'invito finale

---

## 8. Immagini

**Ogni articolo ha la sua**, e nessuna immagine è usata da due schede del blog:
il sito ha 34 schede italiane e 34 immagini diverse. Due articoli con la stessa
foto sembrano lo stesso articolo.

**Dove stanno**: `static/images/blog/` per gli articoli, `static/images/` per
cani e pagine principali.

**Formato**: WebP, qualità 82-84, lato lungo massimo 900 pixel. Sotto i 200 KB.

**Attributo `alt` sempre**, descrittivo: "Femmina di Staffordshire Bull Terrier
che allatta la cucciolata", non "cane".

**Attenzione al suffisso delle dimensioni.** La sitemap normalizza i nomi
togliendo `-400w` e simili: se esiste solo `nome-400w.webp` e non `nome.webp`,
la sitemap dichiara un file inesistente. O si crea anche il file base, o nella
scheda si usa direttamente l'immagine grande.

**Mai immagini prese da internet.** Sono quasi tutte protette da diritto
d'autore, e comunque tutto il sito funziona perché le foto sono vere. Se serve
un'immagine tecnica, si estrae dai documenti propri — come il vetrino al
microscopio preso dal referto dell'esame delle feci.

---

## 9. Fonti esterne

**Ogni guida ne cita almeno una.** Un testo che afferma senza mai rimandare a
una fonte è indistinguibile da un'opinione.

**Quando una fonte esterna non c'è, si dice perché.** Molte pagine sono
personali: la storia dell'allevamento, i cuccioli, il diario, le recensioni,
il test Staffy o Amstaff. Lì i fatti sono dell'allevamento e una fonte esterna
non esiste. In quel caso:

1. nel front matter si scrive `fonti_motivo: "…"` con il motivo in una frase;
2. in fondo alla pagina, prima dell'invito finale, si mette la stessa frase
   visibile: `<p class="fonti">Fonti: …</p>` (EN *Sources:*, DE *Quellen:*),
   indicando dove si verificano i dati (referti, ENCI, profilo Google);
3. il template la dichiara anche ai motori e alle IA come `backstory` nello
   schema della pagina.

Le pagine legali hanno solo il `fonti_motivo`, senza frase visibile.
Lo script di controllo segnala ogni pagina che non ha né una fonte esterna né
il `fonti_motivo`.

Perché: una pagina senza fonti e senza spiegazione sembra un'opinione; una
pagina che dice "questi sono dati nostri, e si verificano così" è una
testimonianza diretta, che per un motore generativo vale più di una fonte
ripresa da altri.

**Icone e foto.** Le icone di testata degli articoli sono decorative: `alt=""`
(il titolo le segue subito), e restano fuori dalla sitemap. Le icone SVG
decorative hanno `aria-hidden="true"`. L'`alt` descrittivo è per le foto
vere, cani compresi, sempre.

Fonti usate finora: ENCI, Kennel Club britannico, WSAVA, AVSAB, Gazzetta
Ufficiale, Regolamento UE 576/2013, Royal Veterinary College, PubMed, Cornell,
Cambridge, SBTPedigree.

Ogni link esterno va scritto così:

```html
<a href="https://esempio.org/" target="_blank" rel="noopener"
   aria-label="Nome della fonte (si apre in una nuova scheda)">Nome</a>
```

`rel="noopener"` è sicurezza, `aria-label` serve a chi usa un lettore di
schermo per sapere che la scheda cambia.

---

## 10. Collegamenti interni

Un articolo nuovo **non deve restare isolato**: se l'unico link è la scheda nel
blog, Google lo considera marginale e nessuno lo trova navigando.

Regola pratica: **almeno tre pagine esistenti devono puntarci**, agganciate
dove il tema c'è già, non infilate a forza. E l'articolo nuovo rimanda a tre o
quattro pagine esistenti.

Esempio di aggancio buono: nella guida sui parassiti c'era già "il libretto con
le date delle sverminazioni" — il link all'articolo sull'esame delle feci si
inserisce lì, in mezzo alla frase.

---

## 11. Pubblicare un articolo: la lista completa

Per ogni articolo nuovo servono, in tutte e tre le lingue:

1. Il file `content/<lingua>/<slug>.md` con il front matter completo
2. L'immagine in `static/images/blog/`
3. La **scheda nel blog**: `content/<lingua>/blog.md`, dentro la sezione
   giusta, con il contatore della categoria aumentato di uno
4. La **voce nel llms.txt**: `assets/llms/it.txt`, `assets/llms/en.txt`,
   `assets/llms/de.txt` (Hugo li pubblica come `/llms.txt`, `/en/llms.txt`,
   `/de/llms.txt`)
5. I **collegamenti in entrata** da almeno tre pagine esistenti
6. Se l'articolo cita un documento, il PDF in `static/docs/`

Le categorie del blog sono **sezioni HTML scritte a mano** dentro `blog.md`:
non sono tassonomie Hugo, e il campo `categories:` nel front matter non serve a
niente — è stato tolto da tutte le pagine.

---

## 12. Prima del commit

```powershell
python tools/controlli/verifica.py
```

Lo script compila il sito con Hugo e fa **sempre gli stessi controlli**
(elencati in testa al file). Divide il risultato in due:

- **ERRORI**: cose rotte (tag non chiusi, link rotti, schema non valido,
  hreflang, sitemap, llms.txt, lastmod). Devono essere **zero**: con anche un
  solo errore non si consegna e non si committa.
- **AVVISI**: regole di questo file non rispettate (lunghezze, blocco
  citabile, FAQ corte, link in entrata, parole vuote). Si correggono quando
  Paolo decide.

Quando Paolo decide che un caso va bene così, si aggiunge una riga in
`tools/controlli/eccezioni.txt` e lo script smette di segnalarlo.

Perché: prima i controlli si facevano a mano e ogni volta erano diversi, così
ogni analisi trovava problemi "nuovi" e una correzione poteva romperne
un'altra senza che nessuno se ne accorgesse.

---

## 13. Errori già commessi, da non rifare

**Le date.** Aver messo `enableGitInfo` senza la sezione `[frontmatter]`
faceva risultare pubblicati oggi tutti gli articoli senza `date`. Si vedeva
solo guardando "Ultimi articoli", e per mesi non se n'è accorto nessuno.

**Le immagini ripetute.** Nove schede del blog usavano la stessa foto
generica: gli articoli sembravano tutti uguali.

**I blocchi nel posto sbagliato.** Un paragrafo introduttivo inserito dopo il
primo `<h2>` si legge come la risposta a quel titolo. Va prima.

**Le didascalie doppie.** YouTube scrive già il titolo sopra l'anteprima: una
didascalia sotto che dice la stessa cosa è rumore.

**Le affermazioni non verificate.** "Cuccioli socializzati", "genitori
testati", "protocollo di socializzazione": tolte tutte, sostituite con i fatti.

**Fidarsi degli strumenti di analisi.** In una sola serata sei strumenti hanno
prodotto nove errori: robots.txt cercato su `http://`, H2 contati zero perché
avevano un attributo `class`, `og:locale:alternate` segnalato come duplicato
quando per specifica è ripetibile, 445 parole su una pagina che ne ha 1.758
perché avevano letto una copia in cache. Prima di correggere qualcosa, va
verificato che il problema esista.

**Lo standard citato a memoria.** Per mesi il sito ha scritto, in sei pagine e
tre lingue, che nero focato e fegato "non sono ammessi" e "non possono essere
presentati in esposizione". Lo standard FCI n. 76 li definisce *altamente
indesiderabili*: non vietati, penalizzati. Lo standard si cita con le parole
del testo ENCI (EN: *highly undesirable*, DE: *höchst unerwünscht*), mai
riassunte a memoria.

**EN e DE rimasti a una versione vecchia.** In italiano le prenotazioni e il
linguaggio commerciale erano stati tolti; in inglese e tedesco sono rimasti
"lose a sale", "buyers", "deposit", una sezione "We're Not Sellers" e un
modulo chiamato "Reservation Form". Lo script controlla che EN e DE non abbiano
*meno* dell'italiano, non che non abbiano *altro*: quando si cambia una regola
di linguaggio, si cerca la parola in tutte e tre le lingue.

**Fidarsi dei report GEO.** Un audit esterno (ottobre 2026) segnalava lo schema
LocalBusiness mancante, il FAQPage su una sola pagina, l'apertura degli
articoli da rifare e il canale YouTube assente: erano tutti già a posto. Vale
la stessa regola degli strumenti SEO: prima si verifica nel repo.

---

## 14. Cosa vale la pena scrivere

Il criterio è uno solo: **se puoi scriverlo senza guardare i tuoi cani, non
scriverlo.** Esiste già in cento copie e non hai motivo di essere letto.

Funzionano gli articoli che contengono qualcosa che nessun altro ha:

- il COI di Queen al 9,14% su otto generazioni e 21,5% sul pedigree completo
- i referti dell'esame delle feci, compresa la riga positiva
- la femmina che dopo il cesareo e la reazione allergica non ha riconosciuto i
  cuccioli
- lo stop a duecento metri di una sorella di Bilquis al campo di lavoro
- in dodici anni nessun cane è mai tornato indietro

Non funzionano: "quanto costa un cucciolo", "come socializzare", "lo Staffy è
pericoloso" — a meno che non li si scriva partendo dai propri dati.

---

## 15. Parole dell'affido, non del commercio

**L'allevamento è un'attività amatoriale, non a fini di lucro**, e le note
legali (sezione 4) lo dichiarano. Ogni testo del sito deve essere coerente con
questa dichiarazione: il sito è un documento pubblico, e una sola pagina che
parla di vendite e caparre la contraddice.

**Prenotazioni, liste d'attesa e caparre non si citano mai**, nemmeno per dire
che non ci sono (scelta di Paolo, ottobre 2026). Non esistono, quindi non se ne
parla. Il modulo di `/contatto/` si chiama *modulo di contatto*; la visita in
allevamento si *concorda*, non si prenota.

| Da non scrivere | Da scrivere |
|---|---|
| clienti, acquirenti | famiglie |
| vendita, vendere, cessione di un nostro cucciolo | affido, affidare |
| acquisto, prima dell'acquisto | prima di prendere un cucciolo |
| prenotare un cucciolo, chi ha prenotato | le famiglie che accoglieranno un cucciolo |
| prenota una visita | concorda una visita |
| caparra, acconto | (non si cita) |
| EN: customers, clients, buyers, sale, purchase, deposit, reservation | EN: families, placement, before taking on a puppy |
| DE: Kunden, Käufer, Verkauf, Kauf, Anzahlung, Reservierung | DE: Familien, Vermittlung, bevor ein Welpe einzieht |

**Eccezioni, decise da Paolo:**

- l'articolo sul prezzo (nelle tre lingue) usa *prezzo* e il linguaggio
  dell'acquisto, perché la parola chiave è quella: è l'unico posto;
- le recensioni sono parole dei proprietari, prese dal profilo Google: non si
  ritoccano, anche se dicono "ho acquistato";
- le frasi che descrivono il *mercato* e i segnali d'allarme di altri
  allevamenti ("un cane venduto come Pit Bull", "chi vende un colore raro a
  prezzo maggiorato") restano: parlano di altri, non dell'affido dei nostri
  cuccioli;
- "clienti" detto di persone estranee all'allevamento (la palestra di una
  proprietaria nelle storie di famiglia) resta.

**Il numero dei cuccioli per cucciolata non si pubblica.** La legge regionale
(L.R. Emilia-Romagna 5/2005, art. 5) conta fattrici e cuccioli l'anno; i
numeri li gestisce Paolo con l'AUSL, non il sito. Le femmine sterilizzate sono
indicate come tali nella loro scheda, e "fattrici in attività" è riservato a
quelle in riproduzione.

Perché: l'inquadramento amatoriale si regge su fatti e su parole coerenti. Una
caparra nelle note legali e un badge "Clienti soddisfatti" dicono il contrario
di quello che l'allevamento è.

---

## 16. Tabelle

Una tabella si usa **solo quando il contenuto è già una tabella** scritta come
elenco o come prosa: un calendario (vaccinazioni), un confronto fra opzioni con
gli stessi criteri (antiparassitari, sistemi per l'auto), delle fasce d'età
(bambini), dei passaggi a dosi (cambio di alimento). Non si inventano tabelle
per decorare un articolo.

- Dati identici a quelli del testo: la tabella riordina, non aggiunge.
- Prima colonna in `<strong>`, intestazioni in `<thead>`, stessa tabella nelle
  tre lingue.
- Una frase prima della tabella che dica cosa contiene, così la tabella si
  capisce anche estratta dalla pagina.
- Niente stile in linea: lo stile delle tabelle è già in `main.css`.

Perché: Google e i motori generativi estraggono volentieri le tabelle per le
domande di confronto e di calendario, ma una tabella che ripete male il testo
è solo rumore.

