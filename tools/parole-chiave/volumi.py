# volumi.py — volumi di ricerca mensili delle parole chiave principali e dei
# loro sinonimi, da DataForSEO (Google Ads), per Italia, Germania e Regno Unito.
#
# PERCHE' ESISTE
# Per scegliere i sinonimi su cui puntare servono i numeri veri, non le
# impressioni. Lo script parte dalle parole di partenza qui sotto, chiede a
# DataForSEO anche le parole correlate, tiene solo quelle che parlano di
# Staffordshire / Staffy, e scrive un CSV per lingua ordinato per volume.
#
# COME SI USA (dalla radice del repo, in PowerShell):
#   $env:DATAFORSEO_LOGIN="la-tua-email"; $env:DATAFORSEO_PASSWORD="la-password-API"
#   python tools/parole-chiave/volumi.py
# Risultato: tools/parole-chiave/volumi-it.csv, volumi-de.csv, volumi-en.csv
# Costo: 6 chiamate "live" in tutto (2 per lingua).
#
# La password API e' quella della dashboard DataForSEO (API Access), non la
# password di accesso al sito. Non viene salvata da nessuna parte.

import os, sys, json, csv, base64, urllib.request

MERCATI = {
    "it": dict(location_code=2380, language_code="it", semi=[
        "allevamento staffordshire bull terrier", "cuccioli staffordshire bull terrier",
        "staffordshire bull terrier cuccioli", "staffordshire bull terrier allevamento",
        "allevamento staffy", "cuccioli staffy", "staffy cuccioli", "allevamento staffordshire",
        "cuccioli staffordshire", "allevamenti staffordshire bull terrier",
        "cuccioli di staffordshire bull terrier", "staffordshire bull terrier"]),
    "de": dict(location_code=2276, language_code="de", semi=[
        "staffordshire bull terrier züchter", "staffordshire bull terrier welpen",
        "staffordshire bull terrier zucht", "staffy welpen", "staffy züchter",
        "staffordshire bullterrier welpen", "staffbull welpen", "staffordshire bull terrier"]),
    "en": dict(location_code=2826, language_code="en", semi=[
        "staffordshire bull terrier breeder", "staffordshire bull terrier breeders",
        "staffordshire bull terrier puppies", "staffy puppies", "staffie puppies",
        "staffy breeder", "kc registered staffordshire bull terrier puppies",
        "staffordshire bull terrier"]),
}
PERTINENTI = ("staff", "stafford", "staffy", "staffie", "staffbull")

login, password = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
if not login or not password:
    print("Mancano DATAFORSEO_LOGIN e DATAFORSEO_PASSWORD (vedi le istruzioni in testa al file).")
    sys.exit(2)
AUTH = "Basic " + base64.b64encode(f"{login}:{password}".encode()).decode()

def chiama(percorso, corpo):
    req = urllib.request.Request("https://api.dataforseo.com/v3/" + percorso,
                                 data=json.dumps(corpo).encode(), method="POST",
                                 headers={"Authorization": AUTH, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        d = json.load(r)
    t = (d.get("tasks") or [{}])[0]
    if t.get("status_code") != 20000:
        print("  DataForSEO:", t.get("status_code"), t.get("status_message")); return []
    return t.get("result") or []

cartella = os.path.dirname(os.path.abspath(__file__))
for lingua, m in MERCATI.items():
    print(f"{lingua}: interrogo DataForSEO...")
    base = dict(location_code=m["location_code"], language_code=m["language_code"])
    righe = {}
    for r in chiama("keywords_data/google_ads/search_volume/live", [dict(base, keywords=m["semi"])]):
        righe[r["keyword"]] = r
    for r in chiama("keywords_data/google_ads/keywords_for_keywords/live",
                    [dict(base, keywords=m["semi"][:20], sort_by="search_volume")]):
        if any(p in r["keyword"].lower() for p in PERTINENTI):
            righe.setdefault(r["keyword"], r)
    out = os.path.join(cartella, f"volumi-{lingua}.csv")
    with open(out, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["parola chiave", "volume mensile", "concorrenza", "cpc", "parola di partenza"])
        for k, r in sorted(righe.items(), key=lambda x: -(x[1].get("search_volume") or 0)):
            w.writerow([k, r.get("search_volume") or 0, r.get("competition") or "",
                        r.get("cpc") or "", "si" if k in m["semi"] else ""])
    print(f"  {len(righe)} parole -> {out}")
print("Fatto. Mandami i tre CSV.")
