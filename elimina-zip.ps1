# Elimina gli zip di lavoro dal repo e dal disco.
# Restano comunque recuperabili dalla storia di git, se mai servissero.

$ErrorActionPreference = "Stop"

if (-not (Test-Path "hugo.toml")) {
  Write-Host "Eseguilo dalla radice del repo (C:\Hugo\delpiccolodiavolo-hugo)." -ForegroundColor Red
  exit 1
}

$zip = git ls-files "*.zip"

if (-not $zip) {
  Write-Host "Nessuno zip tracciato. Niente da fare." -ForegroundColor Yellow
  exit 0
}

Write-Host "Sto per eliminare:" -ForegroundColor Cyan
foreach ($f in $zip) {
  $kb = [math]::Round((Get-Item -LiteralPath $f).Length / 1KB)
  Write-Host "  $f  ($kb KB)"
}

foreach ($f in $zip) { git rm --quiet -- "$f" }

if (-not (Select-String -Path ".gitignore" -Pattern "^\*\.zip" -Quiet)) {
  Add-Content -Path ".gitignore" -Value ""
  Add-Content -Path ".gitignore" -Value "# Zip di lavoro: fuori dal repo"
  Add-Content -Path ".gitignore" -Value "*.zip"
  Write-Host "aggiunto *.zip a .gitignore" -ForegroundColor Green
}

git add .gitignore

$rimasti = 0
foreach ($f in $zip) { if (Test-Path -LiteralPath $f) { $rimasti++ } }

Write-Host ""
Write-Host "Eliminati: $($zip.Count)   Ancora presenti: $rimasti (deve essere 0)" -ForegroundColor Green
Write-Host ""
Write-Host "Adesso:" -ForegroundColor Cyan
Write-Host "  hugo --gc --minify   deve restare 100/93/93"
Write-Host "  git status           4 righe D piu' .gitignore modificato"
Write-Host ""
Write-Host "Prima del commit torni indietro con:  git reset --hard HEAD" -ForegroundColor Yellow
