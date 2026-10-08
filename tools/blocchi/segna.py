"""Numera i blocchi delle pagine per il gestionale (Google -> Pagine del sito), ottobre 2026.

Ogni blocco che si puo' spegnere dal gestionale sta fra due commenti:
    <!--BLOCCO:3-->  ...  <!--/BLOCCO:3-->
Un blocco e':
  - una <section> che contiene un h2, un h1 o un segnaposto (es. <!--CUCCIOLATE-->);
  - un segnaposto che disegna una sezione intera, da solo su una riga (<!--ULTIMA-CUCCIOLATA-->, <!--CORRELATI-->...);
  - negli articoli senza <section>: da un h2 (o "## " nel Markdown) fino al successivo, solo se il pezzo e' un HTML
    completo (ogni tag aperto si chiude dentro il pezzo).
I numeri devono essere gli stessi nelle tre lingue (stessa translationKey): se una pagina ha un numero di blocchi
diverso dalle sue traduzioni, nessuna delle tre viene numerata e lo script lo dice.

Non tocca le pagine scritte dal gestionale (gestionale: true) e non entra mai fra <!-- GESTIONALE:INIZIO --> e
<!-- GESTIONALE:FINE -->. Si puo' rilanciare quando si vuole: prima toglie i numeri vecchi, poi li rimette.

Uso:  python3 tools/blocchi/segna.py            (mostra cosa farebbe)
      python3 tools/blocchi/segna.py --scrivi   (scrive i file)
"""
import glob, os, re, sys, collections

RADICE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SEGNAPOSTO = r"<!--(?:ULTIMA-CUCCIOLATA|CUCCIOLATE|CUCCIOLATA|NOVITA|NEWS|ESPOSIZIONI|CORRELATI|RECENTI|GUIDE)-->"
# Pagine con i blocchi in ordine diverso fra le lingue (o uniti in uno solo): quali blocchi si corrispondono,
# come posizione (1, 2, 3...) nell'elenco di ogni lingua, (it, en, de). Solo questi avranno l'interruttore.
MAPPE = {
    "cuccioli": [(1, 1, 1), (2, 2, 2), (3, 3, 3), (4, 4, 4), (5, 5, 5), (6, 7, 7), (7, 6, 6), (10, 11, 11), (11, 10, 10),
                 (12, 8, 8), (13, 12, 12), (14, 13, 13), (15, 14, 14)],
    "programma": [(1, 1, 1), (2, 2, 2), (6, 8, 8)],
    "test-genetici": [(1, 1, 1), (2, 2, 2), (3, 3, 3), (4, 4, 4), (5, 5, 5), (6, 6, 6), (7, 9, 9), (8, 8, 8), (9, 10, 10),
                      (10, 11, 11), (11, 12, 12)],
    "cucciolata-bilquis-agosto-2026": [(1, 1, 1), (3, 4, 4), (4, 5, 5), (5, 6, 6), (6, 7, 7), (7, 8, 8)],
}
# Come si scrivono e si tolgono i numeri (esattamente al contrario, cosi' lo script si puo' rilanciare)
APRI_HTML, CHIUDI_HTML = "<!--BLOCCO:{n}-->\n", "\n<!--/BLOCCO:{n}-->"
APRI_MD, CHIUDI_MD = "\n<!--BLOCCO:{n}-->\n\n", "\n\n<!--/BLOCCO:{n}-->\n"
TOGLI_HTML = re.compile(r"<!--BLOCCO:\d+-->\n|\n<!--/BLOCCO:\d+-->")
TOGLI_MD = re.compile(r"\n<!--BLOCCO:\d+-->\n\n|\n\n<!--/BLOCCO:\d+-->\n")


class _Mark:
    """MARK.sub(\"\", corpo) toglie i numeri, nel formato giusto (HTML o Markdown)."""
    @staticmethod
    def sub(_, corpo, md=None):
        corpo = TOGLI_MD.sub("", corpo)
        return TOGLI_HTML.sub("", corpo)


MARK = _Mark()
CONTENITORI = ("div", "article", "ul", "ol", "table", "details", "figure", "aside", "blockquote", "nav", "dl", "form")
TAG = re.compile(r"<(/?)(" + "|".join(CONTENITORI) + r")\b[^>]*?(/?)>", re.I)


def bilanciato(t):
    """True se ogni contenitore aperto in t si chiude in t, e nessuno si chiude senza essere aperto."""
    stack = []
    for chiude, nome, auto in TAG.findall(t):
        if auto:
            continue
        if chiude:
            if not stack or stack[-1] != nome.lower():
                return False
            stack.pop()
        else:
            stack.append(nome.lower())
    return not stack


def taglia_al_contenitore(t):
    """Accorcia t prima del primo tag che chiude un contenitore aperto fuori da t."""
    stack = []
    for m in TAG.finditer(t):
        chiude, nome, auto = m.group(1), m.group(2).lower(), m.group(3)
        if auto:
            continue
        if chiude:
            if not stack:
                return t[: m.start()]
            if stack[-1] != nome:
                return None
            stack.pop()
        else:
            stack.append(nome)
    return t


def zone_vietate(s):
    return [(m.start(), m.end()) for m in re.finditer(r"<!-- GESTIONALE:INIZIO -->.*?<!-- GESTIONALE:FINE -->", s, re.S)]


def blocchi(s, markdown):
    """Lista di (inizio, fine, tipo) dei blocchi in s (senza numeri vecchi)."""
    vietate = zone_vietate(s)
    dentro_vietata = lambda a, b: any(x < b and a < y for x, y in vietate) and not any(a <= x and y <= b for x, y in vietate)
    sezioni = [(m.start(), m.end()) for m in re.finditer(r"<section\b.*?</section>", s, re.S)]
    in_sezione = lambda p: any(a <= p < b for a, b in sezioni)
    unita = []
    for a, b in sezioni:
        t = s[a:b]
        if re.search(r"<h[12]\b|" + SEGNAPOSTO, t) or (markdown and re.search(r"^##\s", t, re.M)):
            unita.append((a, b, "h1" if "<h1" in t else "sec"))
    for m in re.finditer(r"^[ \t]*" + SEGNAPOSTO + r"[ \t]*$", s, re.M):
        if not in_sezione(m.start()):
            unita.append((m.start(), m.end(), "auto"))
    # h2 fuori dalle sezioni
    teste = [m.start() for m in re.finditer(r"<h2\b", s) if not in_sezione(m.start())]
    if markdown:
        teste += [m.start() for m in re.finditer(r"^##\s", s, re.M) if not in_sezione(m.start())]
    teste.sort()
    confini = sorted(set(teste + [a for a, _ in sezioni] + [a for a, _, k in unita if k == "auto"] + [len(s)]))
    for h in teste:
        fine = min(c for c in confini if c > h)
        pezzo = taglia_al_contenitore(s[h:fine])
        if pezzo is None or not pezzo.strip() or not bilanciato(pezzo):
            continue
        # torna indietro all'inizio della riga, togli gli spazi finali
        a = s.rfind("\n", 0, h) + 1 if s[s.rfind("\n", 0, h) + 1 : h].strip() == "" else h
        b = h + len(pezzo.rstrip())
        unita.append((a, b, "h2"))
    def a_capo(a):  # se prima di a sulla riga ci sono solo spazi, il blocco parte da inizio riga
        r = s.rfind("\n", 0, a) + 1
        return r if s[r:a].strip() == "" else a
    unita = [(a_capo(a), b, k) for a, b, k in unita]
    unita = [u for u in unita if not dentro_vietata(u[0], u[1])]
    unita.sort()
    puliti = []
    for u in unita:  # niente sovrapposizioni
        if puliti and u[0] < puliti[-1][1]:
            continue
        puliti.append(u)
    return puliti


def parti(testo):
    """Divide un file in (prima, corpo, dopo, rientro, markdown): il corpo e' custom_content (senza rientro) o il Markdown."""
    m = re.search(r"^custom_content:[ \t]*\|-?[ \t]*\n", testo, re.M)
    if m:
        i = m.end()
        righe = testo[i:].split("\n")
        rientro = re.match(r"[ \t]*", next(r for r in righe if r.strip())).group(0)
        n = 0
        for r in righe:
            if r.strip() == "" or r.startswith(rientro):
                n += 1
            else:
                break
        while n and righe[n - 1].strip() == "":
            n -= 1
        corpo = "\n".join(r[len(rientro):] if r.startswith(rientro) else r for r in righe[:n])
        return testo[:i], corpo, "\n" + "\n".join(righe[n:]), rientro, False
    fm_fine = testo.find("\n---", 3) + 4
    return testo[:fm_fine], testo[fm_fine:], "", "", True


def rimonta(prima, corpo, dopo, rientro, markdown):
    if markdown:
        return prima + corpo + dopo
    return prima + "\n".join((rientro + r) if r.strip() else "" for r in corpo.split("\n")) + dopo


def segna(corpo, markdown, scelta=None):
    """scelta = [(posizione, numero)]: numera solo quei blocchi; None = tutti, nell'ordine."""
    corpo = MARK.sub("", corpo)
    us = blocchi(corpo, markdown)
    if scelta is None:
        scelta = [(i, i) for i in range(1, len(us) + 1)]
    numeri = dict(scelta)
    out, pos = [], 0
    for i, (a, b, _) in enumerate(us, 1):
        if i not in numeri:
            continue
        n = numeri[i]
        out.append(corpo[pos:a])
        apri, chiudi = ((APRI_MD, CHIUDI_MD) if markdown else (APRI_HTML, CHIUDI_HTML))
        apri, chiudi = apri.format(n=n), chiudi.format(n=n)
        out.append(apri + corpo[a:b] + chiudi)
        pos = b
    out.append(corpo[pos:])
    return "".join(out), us


def main():
    scrivi = "--scrivi" in sys.argv
    os.chdir(RADICE)
    per_chiave = collections.defaultdict(dict)
    for f in sorted(glob.glob("content/*/**/*.md", recursive=True)):
        testo = open(f, encoding="utf-8").read()
        if re.search(r"^gestionale:\s*true\s*$", testo, re.M) or re.search(r"^noindex:\s*true", testo, re.M):
            continue
        k = re.search(r'^translationKey:\s*"?([^"\n]+)"?', testo, re.M)
        if not k:
            continue
        lingua = f.split("/")[1]
        prima, corpo, dopo, rientro, md = parti(testo)
        per_chiave[k.group(1).strip()][lingua] = (f, testo, (prima, corpo, dopo, rientro, md))
    scritti = saltati = 0
    for chiave, L in sorted(per_chiave.items()):
        tipi = {l: [u[2] for u in blocchi(MARK.sub("", v[2][1]), v[2][4])] for l, v in L.items()}
        pari = len(L) == 3 and len({len(t) for t in tipi.values()}) == 1 and len({tuple(i for i, x in enumerate(t) if x == "h1") for t in tipi.values()}) == 1
        mappa = MAPPE.get(chiave) if len(L) == 3 else None
        if pari or mappa:
            col = {"it": 0, "en": 1, "de": 2}
            pronti = []
            for l, (f, vecchio, (p, c, d, r, md)) in L.items():
                scelta = None if pari and not mappa else [(t[col[l]], n) for n, t in enumerate(mappa, 1)]
                nuovo, _ = segna(c, md, scelta)
                pronti.append((f, vecchio, rimonta(p, nuovo, d, r, md)))
            if mappa and not pari:
                print(f"  {chiave}: blocchi abbinati a mano ({len(mappa)} con l'interruttore)")
            for f, vecchio, nuovo in pronti:
                if nuovo != vecchio:
                    scritti += 1
                    if scrivi:
                        open(f, "w", encoding="utf-8").write(nuovo)
        else:
            saltati += 1
            print(f"  {chiave}: blocchi diversi fra le lingue, non numerata " + ", ".join(f"{l}={len(t)}" for l, t in sorted(tipi.items())))
            if scrivi:  # togli eventuali numeri vecchi rimasti
                for f, vecchio, (p, c, d, r, md) in L.values():
                    pulito = rimonta(p, MARK.sub("", c), d, r, md)
                    if pulito != vecchio:
                        open(f, "w", encoding="utf-8").write(pulito)
    print(f"{'Scritti' if scrivi else 'Da scrivere'}: {scritti} file. Pagine non numerate: {saltati}.")


if __name__ == "__main__":
    main()
