# Modifiche del 29/09/2026 (f) — sostituisce anche lo zip "e"

Contiene tutto lo zip precedente (schema recensioni, blocchi citabili) più:

## 1. Nome dell'allevamento nelle risposte FAQ e nel testo
- 78 frasi in prima persona nelle risposte FAQ ("da noi", "i nostri cuccioli",
  "we receive", "unsere Welpen"...) ora nominano l'allevamento. Sono le
  risposte che un motore AI estrae da sole, fuori dalla pagina: senza nome
  non sapeva di chi fosse la pratica descritta.
  Risposte FAQ che nominano l'allevamento: prima circa 10, ora 73 su 411.
  Le altre sono risposte generali sulla razza, dove il nome non serve.
- 5 pagine: "nel nostro allevamento" / "in unserer Zucht" -> nome (una sola
  sostituzione per pagina, solo dove il nome compariva meno di 4 volte).
- Lasciato com'è "Da noi no, mai." sui portatori: è la formula fissa di
  COME-SI-SCRIVE.md.

## 2. llms.txt con le recensioni, aggiornato da solo
- static/llms.txt, static/en/llms.txt, static/de/llms.txt spostati in
  assets/llms/it.txt, en.txt, de.txt. Il testo si modifica lì, come prima.
- Nuovo layouts/index.llmstxt.txt + formato LLMSTXT in hugo.toml: genera
  /llms.txt, /en/llms.txt, /de/llms.txt sostituendo <!--REC-VOTO--> e
  <!--REC-TOTALE--> con i valori di hugo.toml.
- Aggiunta la riga "Recensioni Google: 41, voto medio 5.0 su 5" (e EN/DE)
  e la stessa riga nell'intestazione di llms-full.txt.
- ATTENZIONE: estraendo lo zip, CANCELLA a mano static/llms.txt,
  static/en/llms.txt e static/de/llms.txt, altrimenti Hugo trova due file
  con lo stesso percorso.

## 5. FAQ duplicate fra pagine
Tolte le domande che comparivano identiche su più pagine, tenendo quella
nella pagina più adatta:
- "Quanto vive" (3 lingue): resta nella pagina FAQ, tolta da "carattere e
  vita in famiglia" e da "è il cane giusto per te".
- "Abbaia molto" (3 lingue): resta nella pagina FAQ, tolta da "carattere e
  vita in famiglia".
- "Adatto alla prima esperienza" (3 lingue): resta in "è il cane giusto per
  te", tolta da "carattere e vita in famiglia".
- Pagina FAQ italiana: "Quali test genetici fate sui riproduttori?" diventa
  "Quali test genetici servono allo Staffordshire Bull Terrier?", che è
  quello a cui la risposta risponde davvero; la versione "fate" resta in home.
