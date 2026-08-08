@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ============================================
echo  PULIZIA FILE OBSOLETI - Del Piccolo Diavolo
echo ============================================
echo.
echo Cartella: %CD%
echo.
echo Verranno eliminati i file con spazi nel nome
echo (sostituiti da versioni rinominate) e il CSS
echo vecchio, ora spostato in assets\css\.
echo.
pause
echo.

set N=0

for %%F in (
  "static\images\la-principessa-di roma.avif"
  "static\images\Nora, femmina di staffordshire bull terrier.avif"
  "static\images\Nora, femmina di staffordshire bull terrier.jpg"
  "static\images\Staffy femmina con la sua proprietaria.jpg"
  "static\images\Staffy femmina con la sua proprietaria.webp"
  "static\images\cucciolo staffordshire bull terrier-compressed.jpg"
  "static\images\foto2 (1).avif"
  "static\images\imageye___-_imgi_5_Logo-Home (1).webp"
  "static\docs\DNA Nora.PDF"
  "static\videos\d420c735-f456-4ee9-9cc8-181a90d43a05 (1).mp4"
  "static\css\main.css"
) do (
  if exist %%F (
    del /f /q %%F
    echo   [ELIMINATO] %%~nxF
    set /a N+=1
  ) else (
    echo   [gia assente] %%~nxF
  )
)

echo.
echo --- Controllo file di backup ---
if exist "content_backup" echo   TROVATA cartella content_backup\  ^(valuta se rimuoverla^)
if exist "content\it - Copia.zip" echo   TROVATI i file "Copia.zip" in content\  ^(valuta se rimuoverli^)

echo.
echo --- Verifica finale: file con spazi rimasti ---
dir /b /s "static\* *" 2>nul || echo   nessuno
echo.
echo ============================================
echo  Fatto. Ora esegui:  hugo --quiet
echo  e controlla che il sito si generi senza errori.
echo ============================================
echo.
pause
