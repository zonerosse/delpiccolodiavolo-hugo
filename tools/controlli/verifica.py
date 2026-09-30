# verifica.py — controlli fissi su delpiccolodiavolo.it
#
# PERCHE' ESISTE
# Ogni analisi fatta "a mano" usava controlli diversi, e le correzioni
# venivano consegnate senza ripassarli tutti: cosi' ogni giro trovava
# problemi "nuovi". Da ora i controlli sono sempre questi, sempre uguali.
#
# COME SI USA (dalla radice del repo, serve Hugo sul PATH e Python 3):
#   python tools/controlli/verifica.py            -> tutti i controlli
#   python tools/controlli/verifica.py --dettagli -> elenca ogni caso, non solo i primi 15
#
# ERRORI = cose rotte (pagina, link, schema). Devono essere 0 prima di
#          consegnare o committare. Codice di uscita 1 se ce n'e' almeno uno.
# AVVISI = regole di COME-SI-SCRIVE.md non rispettate. Non rompono niente:
#          si correggono solo quando Paolo decide.
# Le decisioni gia' prese ("va bene cosi'") stanno in eccezioni.txt e non
# vengono piu' segnalate.
#
# Solo libreria standard: nessun pacchetto da installare.

import os, re, sys, json, glob, shutil, tempfile, subprocess, collections
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote, urljoin

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

RADICE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
os.chdir(RADICE)
DETTAGLI = "--dettagli" in sys.argv
DOMINIO = "delpiccolodiavolo.it"
LINGUE = ("it", "en", "de")

# ---------------------------------------------------------------- eccezioni
ECCEZIONI = set()
_ecc = os.path.join(RADICE, "tools", "controlli", "eccezioni.txt")
if os.path.exists(_ecc):
    for riga in open(_ecc, encoding="utf-8"):
        riga = riga.split("#", 1)[0].strip()
        if "|" in riga:
            c, p = (x.strip() for x in riga.split("|", 1))
            ECCEZIONI.add((c, p))

risultati = collections.OrderedDict()  # codice -> (livello, titolo, [casi])

def segnala(codice, livello, titolo, dove, cosa=""):
    if (codice, dove) in ECCEZIONI:
        return
    risultati.setdefault(codice, (livello, titolo, []))[2].append((dove, cosa))

def registra(codice, livello, titolo):
    risultati.setdefault(codice, (livello, titolo, []))

# ------------------------------------------------------ mini albero HTML
VUOTI = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
         "meta", "source", "track", "wbr", "param"}

class Nodo:
    __slots__ = ("tag", "attrs", "figli", "padre")
    def __init__(self, tag, attrs, padre):
        self.tag, self.attrs, self.figli, self.padre = tag, attrs, [], padre
    def classi(self):
        return (self.attrs.get("class") or "").split()
    def testo(self):
        out = []
        def giro(n):
            for f in n.figli:
                if isinstance(f, str): out.append(f)
                elif f.tag not in ("script", "style"): giro(f)
        giro(self)
        return re.sub(r"\s+", " ", " ".join(out)).strip()
    def tutti(self):
        for f in self.figli:
            if not isinstance(f, str):
                yield f
                yield from f.tutti()

class Costruttore(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.radice = Nodo("#doc", {}, None); self.cur = self.radice
    def handle_starttag(self, tag, attrs):
        n = Nodo(tag, {k: (v or "") for k, v in attrs}, self.cur)
        self.cur.figli.append(n)
        if tag not in VUOTI: self.cur = n
    def handle_startendtag(self, tag, attrs):
        self.cur.figli.append(Nodo(tag, {k: (v or "") for k, v in attrs}, self.cur))
    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag: n = n.padre
        if n is not None and n.padre is not None: self.cur = n.padre
    def handle_data(self, d):
        self.cur.figli.append(d)

def albero(html):
    c = Costruttore(); c.feed(html); return c.radice

class Bilancia(HTMLParser):
    """Controlla che ogni tag aperto sia chiuso, nell'ordine giusto."""
    def __init__(self):
        super().__init__(); self.pila = []; self.errori = []
    def handle_starttag(self, tag, attrs):
        if tag not in VUOTI: self.pila.append((tag, self.getpos()[0]))
    def handle_startendtag(self, tag, attrs): pass
    def handle_endtag(self, tag):
        if tag in VUOTI: return
        nomi = [t for t, _ in self.pila]
        if tag in nomi:
            while self.pila[-1][0] != tag:
                t, r = self.pila.pop()
                self.errori.append(f"<{t}> della riga {r} non chiuso (chiuso da </{tag}> a riga {self.getpos()[0]})")
            self.pila.pop()
        else:
            self.errori.append(f"</{tag}> a riga {self.getpos()[0]} senza apertura")

# ------------------------------------------------------ front matter
CHIAVE = re.compile(r"^([A-Za-z_][\w-]*):(?:\s(.*)|)$")

def leggi_fm(percorso):
    testo = open(percorso, encoding="utf-8").read().replace("\r\n", "\n")
    if testo.startswith("\ufeff"):
        segnala("bom", "ERRORE", "File con BOM (deve essere UTF-8 senza BOM)", percorso)
        testo = testo[1:]
    m = re.match(r"---\n(.*?)\n---\n?(.*)", testo, re.S)
    if not m:
        return None, testo
    fm, corpo, chiave = {}, m.group(2), None
    for i, riga in enumerate(m.group(1).split("\n"), 2):
        k = CHIAVE.match(riga)
        if k:
            chiave = k.group(1); v = (k.group(2) or "").strip()
            fm[chiave] = [] if v in ("|", "|-", ">", ">-", "") else v.strip('"').strip("'")
            if v in ("|", "|-", ">", ">-"): fm["_blocco_" + chiave] = i
        elif riga.strip() == "":
            if isinstance(fm.get(chiave), list): fm[chiave].append("")
        elif riga.startswith(" ") or riga.startswith("\t"):
            if isinstance(fm.get(chiave), list): fm[chiave].append(riga)
        else:
            segnala("indentazione", "ERRORE", "Riga fuori posto nel front matter (manca il rientro)",
                    percorso, f"riga {i}: {riga[:60]}")
    for k in list(fm):
        if isinstance(fm[k], list): fm[k] = "\n".join(fm[k])
    return fm, corpo

def vero(v):
    return str(v).lower() == "true"

registra("build", "ERRORE", "Hugo: errori o WARN nella compilazione")
registra("fm", "ERRORE", "File senza front matter")
registra("indentazione", "ERRORE", "Riga fuori posto nel front matter (manca il rientro)")
registra("bom", "ERRORE", "File con BOM (deve essere UTF-8 senza BOM)")

# ================================================================ 1. BUILD
print("Compilo il sito con Hugo...")
dest = tempfile.mkdtemp(prefix="dpd-verifica-")
try:
    r = subprocess.run(["hugo", "--gc", "--cleanDestinationDir", "--destination", dest],
                       capture_output=True, text=True, encoding="utf-8")
except FileNotFoundError:
    print("Hugo non trovato sul PATH."); sys.exit(2)
for riga in (r.stdout + r.stderr).splitlines():
    if re.search(r"\b(WARN|ERROR)\b", riga):
        segnala("build", "ERRORE", "Hugo: errori o WARN nella compilazione", "hugo", riga.strip()[:200])
if r.returncode != 0:
    segnala("build", "ERRORE", "Hugo: errori o WARN nella compilazione", "hugo", "la compilazione e' fallita")
    print("La compilazione e' fallita, mi fermo qui.")

# ============================================================ 2. SORGENTI
pagine_src = {}   # percorso .md -> (fm, corpo)
for f in sorted(glob.glob("content/**/*.md", recursive=True)):
    f = f.replace("\\", "/")
    fm, corpo = leggi_fm(f)
    if fm is None:
        segnala("fm", "ERRORE", "File senza front matter", f); continue
    pagine_src[f] = (fm, corpo)

registra("tag", "ERRORE", "Tag HTML non bilanciati nel sorgente")
registra("tk", "ERRORE", "translationKey mancante, doppia o senza le tre lingue")
registra("data", "ERRORE", "Articolo senza 'date'")
registra("fm_file", "ERRORE", "Immagine del front matter (image, og_image, thumb) inesistente")

chiavi = collections.defaultdict(dict)
for f, (fm, corpo) in pagine_src.items():
    lingua = f.split("/")[1]
    html = fm.get("custom_content") or corpo
    b = Bilancia(); b.feed(html); b.close()
    for e in b.errori + [f"<{t}> della riga {r} mai chiuso" for t, r in b.pila]:
        segnala("tag", "ERRORE", "Tag HTML non bilanciati nel sorgente", f, e)
    if not vero(fm.get("noindex")):
        k = fm.get("translationKey")
        if not k:
            segnala("tk", "ERRORE", "", f, "manca translationKey")
        elif lingua in chiavi[k]:
            segnala("tk", "ERRORE", "", f, f"stessa chiave di {chiavi[k][lingua]}")
        else:
            chiavi[k][lingua] = f
    if vero(fm.get("articolo")) and not fm.get("date"):
        segnala("data", "ERRORE", "", f)
    for campo in ("image", "og_image", "thumb"):
        v = fm.get(campo)
        if v and v.startswith("/") and not os.path.isfile("static" + v):
            segnala("fm_file", "ERRORE", "", f, f"{campo}: {v}")
for k, v in chiavi.items():
    if len(v) != 3:
        segnala("tk", "ERRORE", "", next(iter(v.values())), f"'{k}' esiste solo in: {', '.join(sorted(v))}")

# ============================================================ 3. PAGINE COMPILATE
if r.returncode == 0:
    esistenti = set()
    for p in glob.glob(dest + "/**/*", recursive=True):
        rel = p[len(dest):].replace("\\", "/")
        esistenti.add(rel)
        if rel.endswith("/index.html"): esistenti.add(rel[:-10])

    def esiste(percorso):
        percorso = unquote(percorso.split("#")[0].split("?")[0])
        return (percorso in esistenti or percorso.rstrip("/") + "/" in esistenti
                or percorso + "/" in esistenti)

    for cod, tit in [
        ("link", "Link interni rotti (a, img, srcset, link, script)"),
        ("canonical", "Canonical mancante o diverso dall'URL della pagina"),
        ("hreflang", "hreflang non reciproci o verso pagine inesistenti"),
        ("h1", "Pagina indicizzabile senza un solo <h1>"),
        ("jsonld", "JSON-LD non valido"),
        ("segnaposto", "Segnaposto <!--...--> non sostituito"),
        ("alt", "Immagine senza attributo alt"),
        ("noopener", "Link che apre una nuova scheda senza rel=\"noopener\""),
        ("sitemap", "Sitemap: URL inesistenti o pagine noindex"),
        ("llms", "llms.txt: articoli assenti o link rotti"),
    ]:
        registra(cod, "ERRORE", tit)
    for cod, tit in [
        ("titolo", "<title> fuori da 30-60 caratteri"),
        ("titolo_doppio", "<title> uguale su piu' pagine"),
        ("descr", "description fuori da 140-165 caratteri"),
        ("descr_doppia", "description uguale su piu' pagine"),
        ("arialabel", "Link esterno in nuova scheda senza aria-label"),
        ("citabile", "Blocco citabile: primo paragrafo non fra 110 e 160 parole, o dopo il primo h2"),
        ("faq", "Risposta FAQ sotto le 80 parole"),
        ("blog", "Articolo che non compare nella pagina blog della sua lingua"),
        ("entrata", "Articolo con meno di 3 link in entrata dal testo di altre pagine"),
        ("peso", "Immagine del blog oltre i 200 KB"),
        ("parole", "Parole vuote vietate (passione, esperienza pluriennale...)"),
    ]:
        registra(cod, "AVVISO", tit)
    for cod, tit in [
        ("faq_struttura", "Blocco FAQ rotto (domanda senza risposta, FAQ dentro FAQ)"),
        ("faq_schema", "FAQ visibile che manca nello schema FAQPage"),
        ("faq_cta", "Schema FAQPage con una domanda fuori dal blocco FAQ e risposta sotto le 25 parole"),
        ("img_url", "Icone o immagini esposte come URL a se' (sitemap, link diretti)"),
    ]:
        registra(cod, "ERRORE", tit)
    for cod, tit in [
        ("faq_titolo", "Schema FAQPage con domande prese da titoli, fuori dal blocco FAQ"),
        ("faq_poche", "Sezione FAQ con meno di 3 domande (nessuno schema FAQPage)"),
        ("parita", "EN/DE con meno testo o meno elementi dell'italiano"),
        ("fonti", "Pagina senza fonte esterna e senza il motivo dichiarato (fonti_motivo)"),
        ("originali", "Articolo originale con meno link in entrata del minimo (originali.txt)"),
        ("alt_vuoto", "Immagine con alt vuoto o icona SVG senza descrizione"),
        ("kw_pagina", "Parola chiave principale assente da title, h1, description, apertura o alt"),
        ("kw_ancore", "Pagina principale con poche ancore che contengono la parola chiave o un sinonimo"),
        ("kw_concorrenza", "Altra pagina con la stessa parola chiave principale nel title o nell'h1"),
    ]:
        registra(cod, "AVVISO", tit)

    NON_FONTI = re.compile(r"wa\.me|whatsapp|google\.[a-z.]+/maps|maps\.app|g\.page|goo\.gl|facebook\.|instagram\.|"
                           r"youtube\.|youtu\.be|tiktok\.|feedly\.|inoreader\.|linkedin\.|x\.com|twitter\.")
    statistiche = {}   # url -> dati per il confronto fra lingue
    kw_dati = {}; kw_ancore = collections.defaultdict(list)
    url_fm = {}        # url -> front matter
    for f, (fm, _) in pagine_src.items():
        lingua = f.split("/")[1]
        base = "" if lingua == "it" else "/" + lingua
        sez = "/diario-allevamento" if "/diario-allevamento/" in f else ""
        if os.path.basename(f) == "_index.md":
            u = base + (sez + "/" if sez else "/")
        else:
            u = base + sez + "/" + (fm.get("slug") or os.path.basename(f)[:-3]) + "/"
        url_fm[u] = (f, fm)

    titoli, descr, hl, articoli_url, entrate = (collections.defaultdict(list), collections.defaultdict(list),
                                                 {}, {}, collections.defaultdict(set))
    # quali URL sono articoli
    for f, (fm, _) in pagine_src.items():
        if vero(fm.get("articolo")) and "/diario-allevamento/" not in f:
            lingua = f.split("/")[1]
            slug = fm.get("slug") or os.path.basename(f)[:-3]
            articoli_url[("" if lingua == "it" else "/" + lingua) + "/" + slug + "/"] = f

    VIETATE = re.compile(r"\b(passione|amore per la razza|esperienza pluriennale|professionalit[aà]|"
                         r"anni di esperienza|passion for|years of (?:direct )?experience|"
                         r"Leidenschaft|jahre(?:n)? (?:direkter )?erfahrung)\b", re.I)

    for p in sorted(glob.glob(dest + "/**/*.html", recursive=True)):
        url = p[len(dest):].replace("\\", "/")
        if url.endswith("index.html"): url = url[:-10]
        html = open(p, encoding="utf-8").read()
        if re.search(r'http-equiv="?refresh', html[:1500]) and len(html) < 1500:
            continue  # pagina di reindirizzamento (alias)
        doc = albero(html)
        nodi = list(doc.tutti())
        head_meta = {n.attrs.get("name"): n.attrs.get("content", "") for n in nodi if n.tag == "meta" and n.attrs.get("name")}
        noindex = "noindex" in head_meta.get("robots", "")
        titolo = next((n.testo() for n in nodi if n.tag == "title"), "")

        if not noindex:
            titoli[titolo].append(url)
            if not 30 <= len(titolo) <= 60:
                segnala("titolo", "AVVISO", "", url, f"{len(titolo)} car.: {titolo}")
            d = head_meta.get("description", "")
            descr[d].append(url)
            if not 140 <= len(d) <= 165:
                segnala("descr", "AVVISO", "", url, f"{len(d)} car.")
            if sum(1 for n in nodi if n.tag == "h1") != 1:
                segnala("h1", "ERRORE", "", url, f"{sum(1 for n in nodi if n.tag == 'h1')} h1")

        can = next((n.attrs.get("href") for n in nodi if n.tag == "link" and n.attrs.get("rel") == "canonical"), None)
        if not can:
            segnala("canonical", "ERRORE", "", url, "manca")
        elif urlparse(can).path != url:
            segnala("canonical", "ERRORE", "", url, can)
        hl[url] = {n.attrs["hreflang"]: urlparse(n.attrs.get("href", "")).path
                   for n in nodi if n.tag == "link" and n.attrs.get("hreflang")}

        for m in re.findall(r"<!--(NEWS|HEROFOTO|CUCCIOLATA|CORRELATI|LISTAATTESA|RECENTI)-->", html):
            segnala("segnaposto", "ERRORE", "", url, m)

        for n in nodi:
            for attr in ("href", "src", "srcset"):
                v = n.attrs.get(attr)
                if not v or n.tag not in ("a", "img", "link", "script", "source"): continue
                if n.tag == "link" and n.attrs.get("rel") in ("preconnect", "dns-prefetch"): continue
                for pezzo in (v.split(",") if attr == "srcset" else [v]):
                    u = pezzo.strip().split(" ")[0]
                    pr = urlparse(u)
                    if not u or u.startswith("#") or pr.scheme in ("mailto", "tel", "data", "javascript", "whatsapp"): continue
                    if pr.netloc and DOMINIO not in pr.netloc: continue
                    percorso = pr.path if pr.path.startswith("/") else urljoin(url, pr.path)
                    if not esiste(percorso):
                        segnala("link", "ERRORE", "", url, u)
            if n.tag == "img" and "alt" not in n.attrs:
                segnala("alt", "ERRORE", "", url, n.attrs.get("src", ""))
            if n.tag == "a" and n.attrs.get("target") == "_blank":
                if "noopener" not in n.attrs.get("rel", ""):
                    segnala("noopener", "ERRORE", "", url, n.attrs.get("href", ""))
                if "aria-label" not in n.attrs:
                    segnala("arialabel", "AVVISO", "", url, n.attrs.get("href", ""))
            if n.tag == "script" and n.attrs.get("type") == "application/ld+json":
                try: json.loads(n.testo() or "null")
                except Exception as e: segnala("jsonld", "ERRORE", "", url, str(e)[:80])

        if noindex: continue

        # blocco citabile (solo articoli)
        if url in articoli_url:
            art = next((n for n in nodi if n.tag == "article" and "article-content" in n.classi()), None)
            if art is None:
                art = next((n for n in nodi if n.tag == "main"), doc)
                # pagine senza <article>: si parte dopo la breadcrumb o dopo la hero
                inizio = False; primo = None; dopo_h2 = False
                for n in art.tutti():
                    if n.tag == "nav" or (n.tag == "section" and "hero" in n.classi()):
                        inizio = True; continue
                    if not inizio: continue
                    anc = n.padre; in_hero = False
                    while anc is not None:
                        if anc.tag == "section" and "hero" in anc.classi(): in_hero = True
                        anc = anc.padre
                    if in_hero: continue
                    if n.tag == "h2" and primo is None: dopo_h2 = True
                    if n.tag == "p" and primo is None: primo = n; break
            else:
                primo = None; dopo_h2 = False
                for n in art.tutti():
                    if n.tag == "h2" and primo is None: dopo_h2 = True
                    if n.tag == "p": primo = n; break
            parole = len(primo.testo().split()) if primo else 0
            if dopo_h2:
                segnala("citabile", "AVVISO", "", url, f"il primo paragrafo sta dopo un h2 ({parole} parole)")
            elif not 110 <= parole <= 160:
                segnala("citabile", "AVVISO", "", url, f"{parole} parole")

        for n in nodi:
            if "faq-answer" in n.classi():
                w = len(n.testo().split())
                if w < 80: segnala("faq", "AVVISO", "", url, f"{w} parole")

        # ---- FAQ: struttura, schema, inviti scambiati per domande
        visibili = []
        for it in (n for n in nodi if "faq-item" in n.classi()):
            if any("faq-item" in x.classi() for x in it.tutti()):
                segnala("faq_struttura", "ERRORE", "", url, "FAQ dentro un'altra FAQ")
            dom = next((x for x in it.tutti() if set(x.classi()) & {"faq-question", "faq-q"} or x.tag in ("h3", "h4")), None)
            if dom is None: continue
            q = dom.testo()
            if not q.endswith("?"): continue          # schede di consigli, non domande
            risposta = it.testo().replace(q, "", 1).strip()
            if len(risposta.split()) < 5:
                segnala("faq_struttura", "ERRORE", "", url, f"senza risposta: {q[:50]}")
            visibili.append(q)
        schema_q = []
        for n in nodi:
            if n.tag == "script" and n.attrs.get("type") == "application/ld+json":
                try: d = json.loads(n.testo() or "null")
                except Exception: continue
                for g in (d if isinstance(d, list) else (d.get("@graph", [d]) if isinstance(d, dict) else [])):
                    if isinstance(g, dict) and g.get("@type") == "FAQPage":
                        for e in g.get("mainEntity", []):
                            schema_q.append((e.get("name", ""), (e.get("acceptedAnswer") or {}).get("text", "")))
        norm = lambda t: re.sub(r"\W+", "", t.lower())
        vis_n = {norm(q) for q in visibili}
        sch_n = {norm(q) for q, _ in schema_q}
        if schema_q:
            for q in visibili:
                if norm(q) not in sch_n:
                    segnala("faq_schema", "ERRORE", "", url, q[:60])
            for q, r in schema_q:
                if norm(q) in vis_n: continue
                if len(r.split()) < 25:
                    segnala("faq_cta", "ERRORE", "", url, q[:60])
                else:
                    segnala("faq_titolo", "AVVISO", "", url, q[:60])
        blocchi_faq = [n for n in nodi if (n.tag == "section" and "faq" in n.classi()) or "faq-container" in n.classi()]
        for b in blocchi_faq:
            k = sum(1 for x in b.tutti() if "faq-item" in x.classi())
            if 0 < k < 3 or (k == 0 and "faq" in b.classi()):
                segnala("faq_poche", "AVVISO", "", url, f"{k} domande")
        if not blocchi_faq and 0 < len(visibili) < 3:
            segnala("faq_poche", "AVVISO", "", url, f"{len(visibili)} domande")

        # ---- immagini e icone: alt e SVG
        for n in nodi:
            if n.tag == "img" and n.attrs.get("alt", None) == "":
                segnala("alt_vuoto", "AVVISO", "", url, n.attrs.get("src", ""))
            if n.tag == "svg" and n.attrs.get("aria-hidden") != "true" and not n.attrs.get("aria-label") \
                    and not any(x.tag == "title" for x in n.tutti()):
                segnala("alt_vuoto", "AVVISO", "", url, "icona SVG senza descrizione")
        for n in nodi:
            if n.tag == "a" and re.search(r"\.(webp|jpe?g|png|avif|gif|svg)$", n.attrs.get("href", "").split("?")[0], re.I):
                segnala("img_url", "ERRORE", "", url, "link diretto a " + n.attrs.get("href", ""))

        # ---- dati per le parole chiave principali
        _m = next((n for n in nodi if n.tag == "main"), doc)
        kw_dati[url] = dict(
            title=titolo, h1=next((n.testo() for n in nodi if n.tag == "h1"), ""),
            descr=head_meta.get("description", ""),
            apertura=" ".join(_m.testo().split()[:150]),
            alt=" | ".join(n.attrs.get("alt", "") for n in _m.tutti() if n.tag == "img"),
            noindex=noindex)
        _esc = set()
        for n in nodi:
            if n.tag in ("header", "footer", "nav") or "mobile-menu" in n.classi():
                _esc.update(id(x) for x in n.tutti())
        for n in nodi:
            if n.tag == "a" and id(n) not in _esc:
                h = n.attrs.get("href", "").replace("https://" + DOMINIO, "").split("#")[0]
                if h and h != url:
                    # conta il testo visibile del link (e l'alt se il link e' un'immagine),
                    # non l'attributo title: Google da' peso al primo, quasi niente al secondo
                    _alt = " ".join(x.attrs.get("alt", "") for x in n.tutti() if x.tag == "img")
                    kw_ancore[h].append((url, (n.testo() + " " + _alt).lower()))

        # ---- dati per fonti e confronto fra lingue (solo il contenuto, dentro <main>)
        principale = next((n for n in nodi if n.tag == "main"), doc)
        pn = list(principale.tutti())
        esterne = {n.attrs.get("href") for n in pn if n.tag == "a"
                   and n.attrs.get("href", "").startswith("http") and DOMINIO not in n.attrs.get("href", "")
                   and not NON_FONTI.search(n.attrs.get("href", ""))}
        statistiche[url] = dict(car=len(principale.testo()), h2=sum(n.tag == "h2" for n in pn),
                                faq=len(visibili), fonti=len(esterne), img=sum(n.tag == "img" for n in pn),
                                faq_answer=sum("faq-answer" in n.classi() for n in pn))
        fm_pag = url_fm.get(url, (None, {}))[1]
        if not esterne and not fm_pag.get("fonti_motivo") and not url.endswith(("/404.html",)):
            segnala("fonti", "AVVISO", "", url)

        # parole vuote, escluse le recensioni (sono citazioni dei clienti)
        for n in nodi:
            if n.tag in ("p", "h1", "h2", "h3", "span", "li") and not any(
                    "review" in c for a in [n] + [n.padre] for c in (a.classi() if a else [])):
                if any(not isinstance(f, str) and f.tag in ("p", "li") for f in n.figli): continue
                m = VIETATE.search(n.testo())
                if m: segnala("parole", "AVVISO", "", url, f"\u00ab{m.group(0)}\u00bb")

        # link in entrata: si conta il testo, non menu, pie' di pagina, correlati, blog
        if not url.rstrip("/").endswith("blog"):
            esclusi = set()
            for n in nodi:
                if n.tag in ("header", "footer", "nav") or set(n.classi()) & {"related", "related-articles", "correlati"}:
                    esclusi.update(id(x) for x in n.tutti())
            for n in nodi:
                if n.tag == "a" and id(n) not in esclusi:
                    h = n.attrs.get("href", "").replace("https://" + DOMINIO, "").split("#")[0]
                    if h != url and (h in articoli_url or h in url_fm):
                        entrate[h].add(url)

    # ---- EN/DE contro IT, pagina per pagina (legate da translationKey)
    per_chiave = collections.defaultdict(dict)
    for u, (f, fm) in url_fm.items():
        if fm.get("translationKey") and u in statistiche:
            per_chiave[fm["translationKey"]][f.split("/")[1]] = u
    for k, lingue in per_chiave.items():
        if "it" not in lingue: continue
        it = statistiche[lingue["it"]]
        for l in ("en", "de"):
            if l not in lingue: continue
            u = lingue[l]; st = statistiche[u]; diff = []
            if it["car"] and st["car"] < 0.85 * it["car"]:
                diff.append(f"testo {round(100 * st['car'] / it['car'])}% dell'italiano")
            for campo, nome in (("h2", "sezioni h2"), ("faq", "FAQ"), ("fonti", "fonti esterne"), ("img", "immagini")):
                if st[campo] < it[campo]:
                    diff.append(f"{nome} {st[campo]} contro {it[campo]}")
            if it["faq_answer"] and not st["faq_answer"]:
                diff.append("FAQ con struttura diversa (senza faq-answer)")
            if diff:
                segnala("parita", "AVVISO", "", u, "; ".join(diff))

    # ---- articoli originali: minimo di link in entrata piu' alto
    orig_file = os.path.join(RADICE, "tools", "controlli", "originali.txt")
    minimo = 6
    if os.path.isfile(orig_file):
        originali = []
        for riga in open(orig_file, encoding="utf-8"):
            riga = riga.split("#", 1)[0].strip()
            if riga.startswith("minimo:"): minimo = int(riga.split(":")[1])
            elif riga.startswith("/"): originali.append(riga)
        for u_it in originali:
            f_it = url_fm.get(u_it, (None, {}))[1]
            k = f_it.get("translationKey")
            for u in ([per_chiave[k][l] for l in LINGUE if l in per_chiave.get(k, {})] if k else [u_it]):
                if len(entrate[u]) < minimo:
                    segnala("originali", "AVVISO", "", u, f"{len(entrate[u])} link, minimo {minimo}")

    # ---- parole chiave principali (tools/controlli/parole-chiave.txt)
    kw_file = os.path.join(RADICE, "tools", "controlli", "parole-chiave.txt")
    if os.path.isfile(kw_file):
        min_anc = 10
        def contiene(testo, frase):
            t = " " + re.sub(r"[^\wäöüß]+", " ", testo.lower()) + " "
            return all(" " + w + " " in t for w in frase.lower().split())
        for riga in open(kw_file, encoding="utf-8"):
            riga = riga.split("#", 1)[0].strip()
            if riga.startswith("minimo_ancore:"): min_anc = int(riga.split(":")[1]); continue
            if riga.count("|") < 1: continue
            parti = [x.strip() for x in riga.split("|")]
            u, kw = parti[0], parti[1]
            sin = [x.strip() for x in (parti[2] if len(parti) > 2 else "").split(";") if x.strip()]
            min_pag = min_anc
            if len(parti) > 3 and parti[3].startswith("minimo:"):
                min_pag = int(parti[3].split(":")[1])
            d = kw_dati.get(u)
            if not d:
                segnala("kw_pagina", "AVVISO", "", u, "pagina non trovata"); continue
            mancano = [c for c in ("title", "h1", "descr", "apertura", "alt") if not contiene(d[c], kw)]
            if mancano:
                segnala("kw_pagina", "AVVISO", "", u, f"'{kw}' manca in: {', '.join(mancano)}")
            buone = {da for da, testo in kw_ancore[u] if any(contiene(testo, f) for f in [kw] + sin)}
            if len(buone) < min_pag:
                segnala("kw_ancore", "AVVISO", "", u, f"{len(buone)} pagine con ancora '{kw}' o sinonimo, minimo {min_pag}")
            lingua_u = u.split("/")[1] if u.count("/") > 1 and u.split("/")[1] in ("en", "de") else "it"
            for altra, dd in kw_dati.items():
                if altra == u or dd["noindex"]: continue
                la = altra.split("/")[1] if altra.split("/")[1] in ("en", "de") else "it"
                if la != lingua_u: continue
                if contiene(dd["title"], kw) or contiene(dd["h1"], kw):
                    segnala("kw_concorrenza", "AVVISO", "", altra, f"'{kw}' nel title/h1, come {u}")

    # ---- icone e immagini tecniche dichiarate come URL nella sitemap
    for sm in glob.glob(dest + "/**/sitemap.xml", recursive=True):
        x = open(sm, encoding="utf-8").read()
        for loc in re.findall(r"<image:loc>([^<]+)</image:loc>", x):
            if re.search(r"/images/(blog/icone|og)/|favicon|\.svg$", loc):
                segnala("img_url", "ERRORE", "", sm[len(dest):], loc.replace("https://" + DOMINIO, ""))
        for loc in re.findall(r"<loc>([^<]+)</loc>", x):
            if re.search(r"\.(webp|jpe?g|png|avif|gif|svg|pdf)$", loc):
                segnala("img_url", "ERRORE", "", sm[len(dest):], "file dichiarato come pagina: " + loc)

    for t, us in titoli.items():
        if len(us) > 1:
            for u in us: segnala("titolo_doppio", "AVVISO", "", u, t)
    for d, us in descr.items():
        if len(us) > 1:
            for u in us: segnala("descr_doppia", "AVVISO", "", u, d[:60])
    for u, mappa in hl.items():
        for lingua, dest_url in mappa.items():
            if not esiste(dest_url):
                segnala("hreflang", "ERRORE", "", u, f"{lingua} -> {dest_url} inesistente")
            elif dest_url != u and dest_url in hl and u not in hl[dest_url].values():
                segnala("hreflang", "ERRORE", "", u, f"{lingua} -> {dest_url} non ricambia")
    for u in articoli_url:
        if len(entrate[u]) < 3:
            segnala("entrata", "AVVISO", "", u, f"{len(entrate[u])} link")

    # pagina blog
    for lingua in LINGUE:
        blog = f"content/{lingua}/blog.md"
        if blog in pagine_src:
            testo_blog = pagine_src[blog][0].get("custom_content", "") + pagine_src[blog][1]
            for u, f in articoli_url.items():
                if f.split("/")[1] == lingua:
                    slug = u.rstrip("/").split("/")[-1]
                    if f"/{slug}/" not in testo_blog:
                        segnala("blog", "AVVISO", "", u)

    # sitemap
    for sm in glob.glob(dest + "/**/sitemap.xml", recursive=True):
        x = open(sm, encoding="utf-8").read()
        for loc in re.findall(r"<(?:loc|image:loc)>https?://" + re.escape(DOMINIO) + r"([^<]*)</", x):
            if not esiste(loc):
                segnala("sitemap", "ERRORE", "", sm[len(dest):], f"{loc} inesistente")
            else:
                ph = dest + loc.rstrip("/") + "/index.html"
                if os.path.isfile(ph) and re.search(r'name="?robots"?[^>]*noindex', open(ph, encoding="utf-8").read()[:5000]):
                    segnala("sitemap", "ERRORE", "", sm[len(dest):], f"{loc} e' noindex")

    # llms.txt
    for lingua in LINGUE:
        pre = "" if lingua == "it" else "/" + lingua
        for nome in ("llms.txt", "llms-full.txt"):
            pf = dest + pre + "/" + nome
            if not os.path.isfile(pf):
                segnala("llms", "ERRORE", "", pre + "/" + nome, "file mancante"); continue
            L = open(pf, encoding="utf-8").read()
            for u in set(re.findall(r"https://" + re.escape(DOMINIO) + r"(/[^\s)\]>\"'`]*)", L)):
                if not esiste(u.rstrip(".,;:")):
                    segnala("llms", "ERRORE", "", pre + "/" + nome, f"link rotto {u}")
            if nome == "llms.txt":
                for u, f in articoli_url.items():
                    if f.split("/")[1] == lingua and u not in L:
                        segnala("llms", "ERRORE", "", pre + "/llms.txt", f"manca {u}")

    for img in glob.glob("static/images/blog/**/*", recursive=True):
        if os.path.isfile(img) and os.path.getsize(img) > 200 * 1024:
            segnala("peso", "AVVISO", "", img.replace("\\", "/"), f"{os.path.getsize(img)//1024} KB")

shutil.rmtree(dest, ignore_errors=True)

# ================================================================ 4. LASTMOD
registra("lastmod", "ERRORE", "lastmod piu' vecchio dell'ultima modifica del testo")
agg = os.path.join("tools", "lastmod", "aggiorna.py")
if os.path.isfile(agg):
    o = subprocess.run([sys.executable, agg], capture_output=True, text=True, encoding="utf-8").stdout
    for riga in o.splitlines():
        if riga.startswith("content/"):
            f, vecchia, nuova = riga.split()
            segnala("lastmod", "ERRORE", "", f, f"{vecchia} -> {nuova}  (python tools/lastmod/aggiorna.py --scrivi)")

# ================================================================ RIEPILOGO
tot = {"ERRORE": 0, "AVVISO": 0}
for livello in ("ERRORE", "AVVISO"):
    print("\n" + ("=" * 60))
    print("ERRORI (devono essere 0)" if livello == "ERRORE" else "AVVISI (regole di COME-SI-SCRIVE, decide Paolo)")
    print("=" * 60)
    for cod, (liv, tit, casi) in risultati.items():
        if liv != livello: continue
        tot[livello] += len(casi)
        segno = "ok " if not casi else ("XX " if liv == "ERRORE" else "!! ")
        print(f"{segno}{tit}: {len(casi)}")
        for dove, cosa in (casi if DETTAGLI else casi[:15]):
            print(f"      {dove}  {cosa}")
        if casi and not DETTAGLI and len(casi) > 15:
            print(f"      ... altri {len(casi) - 15} (usa --dettagli)")
print(f"\nTotale: {tot['ERRORE']} errori, {tot['AVVISO']} avvisi. Controlli eseguiti: {len(risultati)}.")
sys.exit(1 if tot["ERRORE"] else 0)
