# Pulizia del 30/09/2026
#  1. sposta in _archivio/ le immagini di static/ che nessuna pagina usa
#     (restano sul disco, escono da git e dal sito)
#  2. cancella dalla radice i file vecchi
# Alla fine questo script si cancella da solo.

$ErrorActionPreference = "Stop"

if (-not (Test-Path "hugo.toml")) {
  Write-Host "Eseguilo dalla radice del repo (C:\Hugo\delpiccolodiavolo-hugo)." -ForegroundColor Red
  exit 1
}

# --- 1. immagini non usate -> _archivio/static/... -------------------------
$immagini = @(
  "static/blog"
  "static/images/blog/salute.jpg"
  "static/images/blog/salute-2.jpg"
  "static/images/blog/boas-respirazione.png"
  "static/images/blog/cuccioli-3-400w.webp"
  "static/images/blog/cuccioli-3-800w.webp"
  "static/images/blog/esame-feci-microscopio-400w.webp"
  "static/images/blog/hero-default.jpg.webp"
  "static/images/og/cuccioli-3.jpg"
  "static/images/og/standard-tipicita-morfologia-hero.jpg"
  "static/foto/cuccioli-in-piscina.webp"
)

$spostati = 0
foreach ($p in $immagini) {
  if (-not (Test-Path -LiteralPath $p)) {
    Write-Host "  gia' assente: $p" -ForegroundColor DarkGray
    continue
  }
  $dest = Join-Path "_archivio" $p
  $cartella = Split-Path $dest -Parent
  New-Item -ItemType Directory -Force -Path $cartella | Out-Null
  if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Recurse -Force }
  Move-Item -LiteralPath $p -Destination $dest
  $spostati++
}
git add -A -- static

# --- 2. file vecchi della radice ------------------------------------------
$vecchi = @(
  "lista.txt"
  "PULIZIA-FILE-VECCHI.bat"
  "FILE-NON-USATI.md"
  "Add-TranslationKey.ps1"
  "Fix-BrokenLinks.ps1"
  "MARKDOWN-AGENTI-AI.md"
)
$cancellati = 0
foreach ($f in $vecchi) {
  if (Test-Path -LiteralPath $f) { git rm --quiet -- "$f"; $cancellati++ }
  else { Write-Host "  gia' assente: $f" -ForegroundColor DarkGray }
}

git add -- README.md CLAUDE.md

Write-Host ""
Write-Host "Spostati in _archivio: $spostati   Cancellati: $cancellati" -ForegroundColor Green
Write-Host ""
Write-Host "Adesso:" -ForegroundColor Cyan
Write-Host "  hugo --quiet     non deve scrivere nulla"
Write-Host "  git status       37 righe D (cancellati) e 2 M (README, CLAUDE)"
Write-Host "  git commit -m `"pulizia static e radice, README aggiornato`""
Write-Host "  git push"
Write-Host ""
Write-Host "Se qualcosa non torna:  git reset --hard HEAD" -ForegroundColor Yellow
Write-Host "  (le immagini restano comunque in _archivio)" -ForegroundColor Yellow

Remove-Item -LiteralPath $PSCommandPath -Force
