# Modifiche del 29/09/2026 (l) — contrasto dei testi

Cinque correzioni di colore, solo il tono: forme e posizioni uguali.
Controllo automatico (axe) su tutte le pagine, computer e telefono: 0 problemi.

1. Descrizioni schede blog e data recensioni: #777 -> #6b6b6b (5,33:1)
2. Etichette test genetici in home IT/EN/DE: #8b7355 -> #7a6448 (5,61:1)
3. Etichette oro Palmarès IT/EN/DE: testo bianco -> #3d2f22 (5,33:1), variante A
4. Programma, riquadro scuro: link al diario #e0b77a (6,89:1),
   firma #d9bb94 (7,05:1)
5. Modulo di /contatto/: note #8a7a66 -> #6b5d52 (5,98:1)

Non toccata la regola content-visibility del CSS: i due avvisi di
Lighthouse (link all'affido all'estero e footer) sono falsi allarmi.

## Aggiunta: tolta la regola content-visibility
assets/css/main.css: tolta `.section:not(:first-of-type){content-visibility:auto}`.
Con la regola, Lighthouse segnalava come illeggibili il link all'affido
all'estero e il footer (falsi allarmi). Senza, il controllo di contrasto
sulle 161 pagine, con telefono simulato come fa Lighthouse, dà 0 problemi.
