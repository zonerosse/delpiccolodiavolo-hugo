# La trappola nel foglio di stile

Si estrae in `C:\Hugo\delpiccolodiavolo-hugo`. Un file:
`layouts/partials/css.html`.

## Cos'era

```
{{- with resources.Get "css/main.css" -}}      ← legge da assets/, funziona
<style>...</style>
{{- else -}}
<style>{{ readFile "static/css/main.css" }}</style>   ← file cancellato l'8 agosto
{{- end -}}
```

Il ramo di riserva puntava a `static/css/main.css`, che avevi tolto tu nel
commit `speren` dell'8 agosto. Finché `assets/css/main.css` c'è, quel ramo non
viene mai eseguito e nessuno se ne accorge. Il giorno in cui quel file sparisse —
un rinomino, un `git clean` andato lungo, una cartella spostata — Hugo andrebbe
sul ramo di riserva e si fermerebbe dicendo che non trova un file di cui tu non
sai più niente da un mese.

## Cosa c'è adesso

```
{{- else -}}
{{ errorf "Il foglio di stile assets/css/main.css non esiste: la pagina uscirebbe senza CSS." }}
{{- end -}}
```

Non ho tolto il ramo e basta: senza, il sito si costruirebbe zitto e uscirebbe
senza stile, che è peggio. Così invece la compilazione si ferma e ti dice
esattamente quale file manca e perché conta.

## Provato, tutti e due i casi

**Normale**: 145 pagine, codice di uscita 0, CSS incorporato nella home,
75.831 byte.

**Con `assets/css/main.css` tolto di mezzo**:

```
ERROR Il foglio di stile assets/css/main.css non esiste: la pagina uscirebbe senza CSS.
Error: error building site: logged 1 error(s)
codice di uscita 1
```

Il file è stato poi rimesso e la ricostruzione è tornata a posto.
