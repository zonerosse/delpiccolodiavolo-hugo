{{- /* Versione Markdown dell'elenco del Diario, per agenti e modelli AI.
     Stesso ordine della pagina HTML (scelta C di Paolo): prima le cucciolate, poi il testo del diario. */ -}}
# {{ or (partial "pagine/mod.html" .).h1 .Title }}
{{ with partial "pagine/desc.html" . }}
> {{ . }}
{{ end }}
{{ range .Pages.ByDate.Reverse }}
## [{{ .Title }}]({{ .Permalink }})

{{ .Date | time.Format ":date_long" }}{{ with .Description }}. {{ . }}{{ end }}
{{ end }}
{{- $c := partial "pagine/applica.html" (dict "p" . "c" (string .Content)) -}}
{{- $c = replaceRE `(?s)<!--.*?-->` "" $c -}}
{{- $c = replaceRE `(?s)<h2[^>]*>(.*?)</h2>` "\n\n## $1\n" $c -}}
{{- $c = replaceRE `(?s)<h3[^>]*>(.*?)</h3>` "\n\n### $1\n" $c -}}
{{- $c = replaceRE `(?s)<li[^>]*>(.*?)</li>` "\n- $1" $c -}}
{{- $c = replaceRE `(?s)<a [^>]*href="([^"]*)"[^>]*>(.*?)</a>` "[$2]($1)" $c -}}
{{- $c = replaceRE `(?s)<strong[^>]*>(.*?)</strong>` "**$1**" $c -}}
{{- $c = replaceRE `(?s)<em[^>]*>(.*?)</em>` "*$1*" $c -}}
{{- $c = replaceRE `</p>` "\n\n" $c -}}
{{- $c = replaceRE `<br\s*/?>` "\n" $c -}}
{{- $c = replaceRE `<[^>]+>` "" $c -}}
{{- $c = replaceRE `[ \t]+` " " $c -}}
{{- $c = replaceRE `\n{3,}` "\n\n" $c }}
{{ $c | plainify | htmlUnescape | safeHTML }}

---
Fonte: {{ .Permalink }}
