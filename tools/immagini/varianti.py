# Crea le versioni piccole (480, 640 e 680 px di larghezza) delle foto in testata (hero), per i telefoni.
# Le foto originali non si toccano. Il sito le usa da solo con srcset (layouts/partials/immagini-hero.html).
# Uso: hugo, poi python3 tools/immagini/varianti.py  (legge le testate dal sito compilato in public/).
import re,glob,os
from PIL import Image
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
src=set()
for f in glob.glob(R+'/public/**/index.html',recursive=True):
    for m in re.finditer(r'class="hero-image">\s*<img [^>]*src="(/images/[^"]+\.(?:avif|webp|jpg|jpeg|png))"',open(f,encoding='utf-8').read()):
        src.add(m.group(1))
fatte=0
mappa={}
for s in sorted(src):
    p=R+'/static'+s
    if not os.path.exists(p) or re.search(r'-\d+w\.\w+$',p): continue
    im=Image.open(p); W,H=im.size
    if W<700: continue
    base,ext=os.path.splitext(p)
    mappa[s]={'w':W,'h':H}
    for w in (480,640,680):
        out=f'{base}-{w}w{ext}'
        if os.path.exists(out): continue
        h=round(H*w/W); r=im.convert('RGBA' if im.mode in ('RGBA','LA','P') else 'RGB').resize((w,h),Image.LANCZOS)
        fmt={'.avif':'AVIF','.webp':'WEBP','.jpg':'JPEG','.jpeg':'JPEG','.png':'PNG'}[ext.lower()]
        kw={'quality':60} if fmt=='AVIF' else {'quality':80} if fmt in('WEBP','JPEG') else {}
        if fmt=='JPEG': r=r.convert('RGB')
        r.save(out,fmt,**kw); fatte+=1
import json
json.dump(dict(sorted(mappa.items())),open(R+'/data/varianti.json','w'),indent=1)
print(len(src),'foto in testata,',fatte,'versioni piccole create, data/varianti.json:',len(mappa))
