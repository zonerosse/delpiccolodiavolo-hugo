<#
    Fix-BrokenLinks.ps1
    Corregge i link interni rotti trovati nel controllo.

    USO:
      .\Fix-BrokenLinks.ps1          -> SIMULAZIONE (non scrive nulla)
      .\Fix-BrokenLinks.ps1 -Apply   -> scrive davvero

    Da lanciare dalla radice del sito: C:\Hugo\delpiccolodiavolo-hugo
#>

param([switch]$Apply)

# vecchio => nuovo   (si sostituisce solo dentro href="...")
$fix = [ordered]@{
    # home
    '/index/'                                  = '/'
    # slug accorciati (manca il prefisso di categoria)
    '/bambini-convivenza/'                     = '/famiglia-bambini-convivenza/'
    '/convivenza-altri-animali/'               = '/famiglia-convivenza-altri-animali/'
    '/anziani-rispetto-ritmi/'                 = '/famiglia-anziani-rispetto-ritmi/'
    '/esercizio-sicuro/'                       = '/salute-esercizio-sicuro/'
    '/parassiti-prevenzione/'                  = '/salute-parassiti-prevenzione/'
    '/denti-igiene/'                           = '/salute-denti-igiene/'
    # slug inesistenti
    '/test-genetici-l2hga-hc/'                 = '/test-genetici-l2hga-hc-staffy/'
    '/standard-tipicita-morfologia-staffy/'    = '/standard-tipicita-morfologia/'
    '/cuccioli-socializzazione-primi-mesi/'    = '/cuccioli-socializzazione-in-casa/'
    # slug italiani rimasti nelle pagine tradotte
    '/en/allevamento-staffordshire-bull-terrier-in-emilia-romagna/' = '/en/contact/'
    '/en/cuccioli-staffordshire-bull-terrier/' = '/en/puppies-staffordshire-bull-terrier/'
    '/en/programma-allevamento/'               = '/en/litters-staffordshire-bull-terrier/'
    '/de/allevamento-staffordshire-bull-terrier-in-emilia-romagna/' = '/de/kontakt/'
    '/de/cuccioli-staffordshire-bull-terrier/' = '/de/welpen-staffordshire-bull-terrier/'
    '/de/programma-allevamento/'               = '/de/wuerfe-staffordshire-bull-terrier/'
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
$totale = 0; $fileTocc = 0

if (-not $Apply) {
    Write-Host ""
    Write-Host "  *** SIMULAZIONE - nessun file verra' modificato ***" -ForegroundColor Yellow
    Write-Host "  (rilancia con  -Apply  per scrivere davvero)" -ForegroundColor Yellow
    Write-Host ""
}

Get-ChildItem -Recurse -Path content -Filter *.md | ForEach-Object {
    $path = $_.FullName
    $testo = [System.IO.File]::ReadAllText($path, $utf8)
    $orig  = $testo
    $inFile = 0
    $dettagli = @()

    foreach ($k in $fix.Keys) {
        $vecchio = 'href="' + $k + '"'
        $nuovo   = 'href="' + $fix[$k] + '"'
        $n = ([regex]::Matches($testo, [regex]::Escape($vecchio))).Count
        if ($n -gt 0) {
            $testo = $testo.Replace($vecchio, $nuovo)
            $inFile += $n
            $dettagli += "        $n x  $k  ->  $($fix[$k])"
        }
    }

    if ($inFile -gt 0) {
        $rel = $path.Substring($PWD.Path.Length + 1)
        if ($Apply) {
            [System.IO.File]::WriteAllText($path, $testo, $utf8)
            Write-Host "  SCRITTO  $rel  ($inFile)" -ForegroundColor Green
        } else {
            Write-Host "  da fare  $rel  ($inFile)" -ForegroundColor Cyan
        }
        $dettagli | ForEach-Object { Write-Host $_ -ForegroundColor DarkGray }
        $totale += $inFile
        $fileTocc++
    }
}

Write-Host ""
Write-Host "  ------------------------------------------"
Write-Host "  File interessati : $fileTocc"
if ($Apply) { Write-Host "  Link corretti    : $totale" -ForegroundColor Green }
else        { Write-Host "  Link da correggere: $totale" -ForegroundColor Cyan }
Write-Host "  ------------------------------------------"
Write-Host ""
