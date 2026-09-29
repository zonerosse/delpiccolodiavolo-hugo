# Genera le schede di condivisione (og:image) 1200x630 degli articoli.
# Serve: Python con Pillow e Playwright (chromium), le icone Lucide (npm pack lucide-static)
# in /tmp/package/icons, i font Gelasio e Inter (npm pack @fontsource/gelasio @fontsource/inter)
# in /tmp/f. Legge i titoli dal sito compilato in public/: prima 'hugo', poi questo script.
# MAP = slug italiano -> (categoria, icona). Un articolo nuovo va aggiunto qui.
# Lo prepara Claude: Paolo non deve lanciarlo.
import re,html,base64,io,os,glob,json
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
GROUPS={'s':('#27403a','#4f7566'),'c':('#6b3f1d','#b7793a'),'f':('#4a2c26','#9a5840'),'r':('#211d1a','#5c4a3a'),'k':('#211d1a','#5c4a3a')}
LABEL={'s':{'it':'Salute e benessere','en':'Health and wellbeing','de':'Gesundheit und Wohlbefinden'},
 'c':{'it':'Cuccioli','en':'Puppies','de':'Welpen'},
 'f':{'it':'Famiglia e convivenza','en':'Family life','de':'Familie und Zusammenleben'},
 'r':{'it':'Standard e linee di sangue','en':'Standard and bloodlines','de':'Standard und Blutlinien'},
 'k':{'it':'Conoscere la razza','en':'Know the breed','de':'Die Rasse kennen'}}
MAP={ # slug IT: (group, icon)
'bio-sensor-stimolazione-precoce-cuccioli':('c','brain'),
'boas-staffordshire-bull-terrier-respirazione':('s','wind'),
'colori-staffordshire-bull-terrier':('r','palette'),
'come-scegliere-allevamento-staffordshire-bull-terrier':('k','clipboard-check'),
'come-si-legge-un-pedigree':('r','scroll-text'),
'cuccioli-alimentazione-iniziale':('c','soup'),
'cuccioli-educazione-bisogni':('c','calendar-clock'),
'cuccioli-gestione-solitudine':('c','hourglass'),
'cuccioli-giochi-mentali':('c','puzzle'),
'cuccioli-prima-passeggiata':('c','paw-print'),
'cuccioli-prime-vaccinazioni':('c','syringe'),
'cuccioli-socializzati-cosa-vuol-dire':('c','sprout'),
'cuccioli-socializzazione-in-casa':('c','list-checks'),
'cuccioli-sverminazione-esami-feci':('c','microscope'),
'cucciolo-staffordshire-bull-terrier-all-estero':('c','globe'),
'differenza-staffy-amstaff':('k','scale'),
'differenza-staffy-pitbull-amstaff':('r','fingerprint'),
'famiglia-anziani-rispetto-ritmi':('f','armchair'),
'famiglia-bambini-convivenza':('f','users'),
'famiglia-convivenza-altri-animali':('f','cat'),
'famiglia-viaggi-spostamenti':('f','car'),
'genitori-visibili-cosa-significa':('c','eye'),
'linee-sangue-staffordshire-bull-terrier':('r','network'),
'quanto-costa-cucciolo-staffordshire-bull-terrier':('c','receipt'),
'salute-denti-igiene':('s','toothbrush'),
'salute-esercizio-sicuro':('s','heart-pulse'),
'salute-parassiti-prevenzione':('s','bug'),
'staffordshire-bull-terrier-carattere-vita-famiglia':('f','house'),
'staffordshire-bull-terrier-carattere':('k','heart'),
'staffordshire-bull-terrier-e-il-cane-giusto-per-te':('k','heart-handshake'),
'staffordshire-in-famiglia-storie':('f','book-open'),
'staffy-pericoloso-legge-italia':('k','gavel'),
'standard-linee-di-sangue-orientarsi':('r','git-fork'),
'standard-tipicita-morfologia':('r','ruler'),
'test-genetici-l2hga-hc-staffy':('s','dna'),
'faq-sullo-staffordshire-bull-terrier':('k','message-circle-question'),
}
def b64f(p): return base64.b64encode(open(p,'rb').read()).decode()
F='/tmp/f'
fonts=f"""@font-face{{font-family:G;src:url(data:font/woff2;base64,{b64f(F+'/fontsource-gelasio/package/files/gelasio-latin-400-normal.woff2')}) format('woff2')}}
@font-face{{font-family:I;src:url(data:font/woff2;base64,{b64f(F+'/fontsource-inter/package/files/inter-latin-400-normal.woff2')}) format('woff2')}}"""
b=io.BytesIO(); Image.open(R+'/static/images/logo.webp').save(b,'PNG'); logo='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def icon(n):
    s=open(f'/tmp/package/icons/{n}.svg').read(); s=re.sub(r'<!--.*?-->','',s,flags=re.S)
    return s.replace('class="lucide','style="color:#fff" class="lucide').replace('width="24"','width="210"').replace('height="24"','height="210"').replace('stroke-width="2"','stroke-width="1.4"')
def card(label,title,g,ic):
    a,b_=GROUPS[g]
    t=html.escape(title).replace('-','&#8209;')
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{fonts}
*{{box-sizing:border-box}}html,body{{margin:0}}
.card{{width:1200px;height:630px;position:relative;overflow:hidden;background:#f5ebe0;font-family:G,Georgia,serif}}
.txt{{position:absolute;top:0;bottom:0;left:0;right:420px;padding:64px 72px;display:flex;flex-direction:column}}
.cat{{font-family:I,sans-serif;font-size:26px;margin:0 0 22px;color:{b_}}}
h2{{font-weight:normal;font-size:64px;line-height:1.12;margin:0;color:#4a3f35}}
.foot{{margin-top:auto;display:flex;align-items:center;gap:20px;font-size:28px;line-height:1.25;color:#4a3f35;padding-top:24px}}.foot img{{width:76px}}
.foot small{{font-family:I,sans-serif;font-size:21px;opacity:.85}}
.icy{{position:absolute;right:80px;top:50%;transform:translateY(-50%);width:320px;height:320px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,{a},{b_})}}
</style></head><body><div class="card"><div class="icy">{icon(ic)}</div><div class="txt"><p class="cat">{html.escape(label)}</p><h2 id="t">{t}</h2><div class="foot"><img src="{logo}" alt=""><span>Allevamento Del Piccolo Diavolo<br><small>Staffordshire Bull Terrier, Ostellato (FE)</small></span></div></div></div></body></html>"""
# collect pages
jobs=[]
for line in open(os.path.join(os.path.dirname(__file__),'articoli.tsv')):
    it,en,de,_,_=line.rstrip('\n').split('\t')
    if it=='diario-allevamento': continue
    jobs.append((it,{'it':'/'+it+'/','en':en,'de':de}))
h=open(R+'/public/faq-sullo-staffordshire-bull-terrier/index.html').read()
alts=dict(re.findall(r'<link rel="alternate" hreflang="(\w\w)" href="https://delpiccolodiavolo.it([^"]*)"',h))
jobs.append(('faq-sullo-staffordshire-bull-terrier',{'it':'/faq-sullo-staffordshire-bull-terrier/','en':alts['en'],'de':alts['de']}))
out=[]
for it,urls in jobs:
    g,ic=MAP[it]
    for lang,u in urls.items():
        ph=open(R+'/public'+u+'index.html').read()
        title=html.unescape(re.search(r'property="og:title" content="([^"]*)"',ph).group(1))
        slug=u.strip('/').split('/')[-1]
        out.append(dict(it=it,lang=lang,url=u,slug=slug,title=title,html=card(LABEL[g][lang],title,g,ic),file=f'/images/og/schede/{lang}/{slug}.jpg'))
json.dump([{k:v for k,v in o.items() if k!='html'} for o in out],open(os.path.join(os.path.dirname(__file__),'schede.json'),'w'),ensure_ascii=False,indent=1)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    br=p.chromium.launch(); pg=br.new_page(viewport={'width':1200,'height':630})
    for o in out:
        pg.set_content(o['html']); pg.wait_for_timeout(50)
        # shrink title until the footer fits
        fs=64
        while pg.evaluate("()=>{const f=document.querySelector('.foot').getBoundingClientRect();return f.bottom>630-64+1}") and fs>40:
            fs-=2; pg.evaluate(f"()=>document.getElementById('t').style.fontSize='{fs}px'")
        o['fs']=fs
        dest=R+'/static'+o['file']; os.makedirs(os.path.dirname(dest),exist_ok=True)
        pg.screenshot(path='/tmp/c.png'); Image.open('/tmp/c.png').convert('RGB').save(dest,'JPEG',quality=85,optimize=True,progressive=True)
    br.close()
print(len(out),'cards'); print('shrunk:',[(o['lang'],o['slug'],o['fs']) for o in out if o['fs']<64])

# ---------------------------------------------------------------------------
# Icone per l'elenco del blog e per la testata degli articoli (stile A:
# fondo sabbia, icona nel cerchio col colore della categoria). Non dipendono
# dalla lingua: un file per articolo, col nome dello slug italiano.
#   static/images/blog/icone/<slug-it>.webp       600x376  (schede del blog, front matter "thumb")
#   static/images/blog/icone/hero-<slug-it>.webp  1120x840 (testata, solo se la foto e' sotto
#                                                  i 560 px o e' la generica hero-default)
# Si generano con:  python3 tools/schede-og/genera.py --icone
def icona_riquadro(g,ic,W,H,circle):
    a,b_=GROUPS[g]
    svg=icon(ic).replace('width="210"',f'width="{int(circle*0.62)}"').replace('height="210"',f'height="{int(circle*0.62)}"')
    return (f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{{margin:0}}</style></head><body>'
            f'<div style="width:{W}px;height:{H}px;background:#f5ebe0;display:flex;align-items:center;justify-content:center">'
            f'<div style="width:{circle}px;height:{circle}px;border-radius:50%;background:linear-gradient(135deg,{a},{b_});display:flex;align-items:center;justify-content:center">{svg}</div></div></body></html>')
import sys
if '--icone' in sys.argv:
    from playwright.sync_api import sync_playwright
    dest=os.path.join(R,'static','images','blog','icone'); os.makedirs(dest,exist_ok=True)
    with sync_playwright() as p:
        br=p.chromium.launch(); pg=br.new_page()
        for slug,(g,ic) in MAP.items():
            for nome,W,H,c in ((slug,600,376,230),('hero-'+slug,1120,840,440)):
                pg.set_viewport_size({'width':W,'height':H}); pg.set_content(icona_riquadro(g,ic,W,H,c))
                pg.screenshot(path='/tmp/i.png'); Image.open('/tmp/i.png').convert('RGB').save(os.path.join(dest,nome+'.webp'),'WEBP',quality=82)
        br.close()
