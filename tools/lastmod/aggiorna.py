# Allinea "lastmod" nel front matter alla data dell'ultima modifica del TESTO
# VISIBILE di ogni pagina, ricavata dalla storia git. Non serve il pre-commit
# hook: lo lancia Claude prima di consegnare i file, dalla radice del repo
# (serve la storia completa, non un clone --depth 1).
#   python3 tools/lastmod/aggiorna.py          -> elenca le date da correggere
#   python3 tools/lastmod/aggiorna.py --scrivi -> le corregge nei file
# Le modifiche non ancora committate prendono la data di oggi.
import subprocess,re,glob,sys,datetime
def vis(s):
    lines=[l for l in s.splitlines() if not l.startswith(('lastmod:','date:','og_image','og_image_alt','thumb:'))]
    t=re.sub(r'<[^>]*>','','\n'.join(lines)); return re.sub(r'\s+',' ',t).strip()
def git(*a): return subprocess.run(['git',*a],capture_output=True,text=True,encoding='utf8').stdout
oggi=datetime.date.today().isoformat(); out=[]
for f in sorted(glob.glob('content/**/*.md',recursive=True)):
    cur=open(f,encoding='utf8').read()
    m=re.search(r'^lastmod:\s*"?(\d{4}-\d{2}-\d{2})',cur,re.M)
    if not m: continue
    last=None
    if vis(git('show',f'HEAD:{f}'))!=vis(cur): last=oggi
    else:
        for line in git('log','--format=%h %ad','--date=short','--',f).split('\n'):
            if not line: continue
            h,d=line.split()
            if vis(git('show',f'{h}:{f}'))!=vis(git('show',f'{h}^:{f}')): last=d; break
    if last and last>m.group(1):
        out.append((f,m.group(1),last))
        if '--scrivi' in sys.argv:
            open(f,'w',encoding='utf8',newline='').write(re.sub(r'^lastmod:.*$',f'lastmod: {last}',cur,count=1,flags=re.M))
for o in out: print(*o)
print(len(out),'pagine' + (' corrette' if '--scrivi' in sys.argv else ' da correggere'))
