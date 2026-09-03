# Toglie content_backup dal tracciamento git, lasciando i file sul disco.
# Il sito non cambia: content_backup non e' mai stato pubblicato.

$ErrorActionPreference = "Stop"

if (-not (Test-Path "hugo.toml")) {
  Write-Host "Eseguilo dalla radice del repo (C:\Hugo\delpiccolodiavolo-hugo)." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "content_backup")) {
  Write-Host "content_backup non c'e'. Niente da fare." -ForegroundColor Yellow
  exit 0
}

$prima = (Get-ChildItem -Recurse -File content_backup).Count
Write-Host "content_backup: $prima file sul disco" -ForegroundColor Cyan

git rm -r --cached --quiet content_backup

if (-not (Select-String -Path ".gitignore" -Pattern "^content_backup/" -Quiet)) {
  Add-Content -Path ".gitignore" -Value ""
  Add-Content -Path ".gitignore" -Value "# Backup e copie di lavoro: restano sul disco, fuori da git"
  Add-Content -Path ".gitignore" -Value "content_backup/"
  Write-Host "aggiunto a .gitignore" -ForegroundColor Green
}

git add .gitignore

$dopo = (Get-ChildItem -Recurse -File content_backup).Count
Write-Host ""
Write-Host "File ancora sul disco: $dopo (devono essere $prima)" -ForegroundColor Green
Write-Host ""
Write-Host "Adesso:" -ForegroundColor Cyan
Write-Host "  hugo --gc --minify   deve restare 100/93/93"
Write-Host "  git status           110 righe D piu' .gitignore modificato"
Write-Host ""
Write-Host "Se qualcosa non torna:  git reset --hard HEAD" -ForegroundColor Yellow
