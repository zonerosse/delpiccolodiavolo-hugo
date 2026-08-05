<#
    Add-TranslationKey.ps1
    Inserisce "translationKey" nel front matter delle pagine tradotte.

    USO:
      .\Add-TranslationKey.ps1            -> SIMULAZIONE (non scrive nulla)
      .\Add-TranslationKey.ps1 -Apply     -> scrive davvero

    Da lanciare dalla radice del sito: C:\Hugo\delpiccolodiavolo-hugo
#>

param([switch]$Apply)

# chiave | file IT | file EN | file DE     ("-" = non esiste in quella lingua)
$mappa = @(
 "home|_index.md|_index.md|_index.md"
 "contatti|allevamento-staffordshire-bull-terrier-in-emilia-romagna.md|contact.md|kontakt.md"
 "blog|blog.md|blog.md|blog.md"
 "boas|boas-staffordshire-bull-terrier-respirazione.md|boas-staffordshire-bull-terrier-breathing.md|boas-staffordshire-bull-terrier-atmung.md"
 "chi-siamo|chi-siamo.md|about-us.md|ueber-uns.md"
 "colori|colori-staffordshire-bull-terrier.md|staffordshire-bull-terrier-colours.md|staffordshire-bull-terrier-farben.md"
 "alimentazione|cuccioli-alimentazione-iniziale.md|puppy-initial-feeding.md|welpen-erste-fuetterung.md"
 "consigli-acquisto|cuccioli-consigli-acquisto.md|puppy-buying-tips.md|welpen-kauftipps.md"
 "bisogni|cuccioli-educazione-bisogni.md|puppy-potty-training.md|welpen-stubenreinheit.md"
 "solitudine|cuccioli-gestione-solitudine.md|puppy-alone-time.md|welpen-allein-bleiben.md"
 "giochi-mentali|cuccioli-giochi-mentali.md|puppy-mental-games.md|welpen-denkspiele.md"
 "passeggiata|cuccioli-prima-passeggiata.md|puppy-first-walk.md|welpen-erster-spaziergang.md"
 "vaccinazioni|cuccioli-prime-vaccinazioni.md|puppy-first-vaccinations.md|welpen-erste-impfungen.md"
 "socializzazione|cuccioli-socializzazione-in-casa.md|puppy-home-socialization.md|welpen-sozialisierung-zuhause.md"
 "cuccioli|cuccioli-staffordshire-bull-terrier.md|puppies-staffordshire-bull-terrier.md|welpen-staffordshire-bull-terrier.md"
 "pitbull-amstaff|differenza-staffy-pitbull-amstaff.md|staffy-pitbull-amstaff-difference.md|staffy-pitbull-amstaff-unterschied.md"
 "anziani|famiglia-anziani-rispetto-ritmi.md|staffy-elderly-owners.md|staffy-aeltere-besitzer.md"
 "bambini|famiglia-bambini-convivenza.md|staffy-children-family.md|staffy-kinder-familie.md"
 "altri-animali|famiglia-convivenza-altri-animali.md|staffy-other-pets.md|staffy-andere-haustiere.md"
 "viaggi|famiglia-viaggi-spostamenti.md|staffy-travel-transport.md|staffy-reisen-transport.md"
 "faq|faq-sullo-staffordshire-bull-terrier.md|faq-staffordshire-bull-terrier.md|faq-staffordshire-bull-terrier.md"
 "femmine|femmine-staffordshire-bull-terrier.md|females-staffordshire-bull-terrier.md|huendinnen-staffordshire-bull-terrier.md"
 "linee-sangue|linee-sangue-staffordshire-bull-terrier.md|staffy-bloodlines-guide.md|staffy-blutlinien-guide.md"
 "scelta-linee|standard-linee-di-sangue-orientarsi.md|choosing-bloodlines.md|blutlinien-waehlen.md"
 "maschi|maschi-staffordshire-bull-terrier.md|males-staffordshire-bull-terrier.md|rueden-staffordshire-bull-terrier.md"
 "note-legali|note-legali.md|legal-notice.md|impressum.md"
 "palmares|palmares-del-piccolo-diavolo.md|palmares.md|palmares.md"
 "privacy|privacy-policy.md|privacy-policy.md|datenschutz.md"
 "programma|programma-allevamento.md|litters-staffordshire-bull-terrier.md|wuerfe-staffordshire-bull-terrier.md"
 "recensioni|recensioni.md|reviews.md|bewertungen.md"
 "denti|salute-denti-igiene.md|staffy-dental-health.md|staffy-zahnpflege.md"
 "esercizio|salute-esercizio-sicuro.md|staffy-safe-exercise.md|staffy-sichere-bewegung.md"
 "parassiti|salute-parassiti-prevenzione.md|staffy-parasite-prevention.md|staffy-parasitenvorbeugung.md"
 "carattere-famiglia|staffordshire-bull-terrier-carattere-vita-famiglia.md|staffordshire-bull-terrier-character-family-life.md|staffordshire-bull-terrier-charakter-familienleben.md"
 "cane-giusto|staffordshire-bull-terrier-e-il-cane-giusto-per-te.md|is-the-staffordshire-bull-terrier-right-for-you.md|ist-der-staffordshire-bull-terrier-der-richtige-hund.md"
 "pericoloso|staffy-pericoloso-legge-italia.md|staffy-dangerous-breed-law.md|staffy-gefaehrliche-rasse-gesetz.md"
 "standard|standard-tipicita-morfologia.md|staffy-breed-standard.md|staffy-rassestandard.md"
 "test-genetici|test-genetici-l2hga-hc-staffy.md|staffy-genetic-testing-l2hga-hc.md|staffy-gentests-l2hga-hc.md"
)

$utf8 = New-Object System.Text.UTF8Encoding($false)
$scritti = 0; $saltati = 0; $mancanti = 0

if (-not $Apply) {
    Write-Host ""
    Write-Host "  *** SIMULAZIONE - nessun file verra' modificato ***" -ForegroundColor Yellow
    Write-Host "  (rilancia con  -Apply  per scrivere davvero)" -ForegroundColor Yellow
    Write-Host ""
}

foreach ($riga in $mappa) {
    $p = $riga.Split("|")
    $chiave = $p[0]
    $lingue = @{ "it" = $p[1]; "en" = $p[2]; "de" = $p[3] }

    foreach ($lang in @("it","en","de")) {
        $nome = $lingue[$lang]
        if ($nome -eq "-") { continue }
        $path = Join-Path "content\$lang" $nome

        if (-not (Test-Path $path)) {
            Write-Host "  MANCA    $path" -ForegroundColor Red
            $mancanti++
            continue
        }

        $testo = [System.IO.File]::ReadAllText((Resolve-Path $path), $utf8)

        if ($testo -match "(?m)^translationKey:") {
            Write-Host "  gia' ok  $path" -ForegroundColor DarkGray
            $saltati++
            continue
        }

        $righe = $testo -split "`r?`n"
        $idx = -1
        for ($i = 0; $i -lt $righe.Count; $i++) {
            if ($righe[$i] -match "^title:") { $idx = $i; break }
        }
        if ($idx -lt 0) {
            Write-Host "  NO title $path" -ForegroundColor Red
            $mancanti++
            continue
        }

        $nuove = @()
        $nuove += $righe[0..$idx]
        $nuove += "translationKey: `"$chiave`""
        if ($idx + 1 -lt $righe.Count) { $nuove += $righe[($idx+1)..($righe.Count-1)] }
        $nuovoTesto = $nuove -join "`n"

        if ($Apply) {
            [System.IO.File]::WriteAllText((Resolve-Path $path), $nuovoTesto, $utf8)
            Write-Host "  SCRITTO  $path  ->  $chiave" -ForegroundColor Green
        } else {
            Write-Host "  da fare  $path  ->  $chiave" -ForegroundColor Cyan
        }
        $scritti++
    }
}

Write-Host ""
Write-Host "  ------------------------------------------"
if ($Apply) { Write-Host "  Modificati : $scritti" -ForegroundColor Green }
else        { Write-Host "  Da modificare : $scritti" -ForegroundColor Cyan }
Write-Host "  Gia' a posto  : $saltati"
Write-Host "  Problemi      : $mancanti" -ForegroundColor $(if($mancanti -gt 0){"Red"}else{"Gray"})
Write-Host "  ------------------------------------------"
Write-Host ""
