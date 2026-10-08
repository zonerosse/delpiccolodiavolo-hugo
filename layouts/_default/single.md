{{- /* Versione Markdown della pagina, per agenti e modelli AI. */ -}}
{{- /* Titolo: se la pagina ha un h1 suo (diverso dall'h1 "hero-title", che
     ripete il titolo) si usa quello e lo si toglie dal testo, cosi' il file
     ha un solo titolo # come la pagina HTML (es. Palmares). */ -}}
{{- $grezzo := partial "pagine/applica.html" (dict "p" . "c" (.Params.custom_content | default (string .Content))) -}}
{{- $grezzo = replaceRE `(?s)<h1 class="hero-title">.*?</h1>` "" $grezzo -}}
{{- $titolo := or (partial "pagine/mod.html" .).h1 .Title -}}
{{- $suoH1 := false -}}
{{- with findRESubmatch `(?s)<h1(?:\s[^>]*)?>(.*?)</h1>` $grezzo 1 -}}
{{- $t := index (index . 0) 1 | replaceRE `<br\s*/?>` " " | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace -}}
{{- if $t }}{{ $titolo = $t }}{{ $suoH1 = true }}{{ end -}}
{{- end -}}
# {{ $titolo }}
{{ with partial "pagine/desc.html" . }}
> {{ . }}
{{ end }}
{{- $c := .Params.custom_content | default "" -}}
{{- if not $c }}{{ $c = .Content }}{{ end -}}
{{- $c = partial "pagine/applica.html" (dict "p" . "c" (string $c)) -}}
{{- $c = replace $c "<!--CUCCIOLATE-->" (partial "cucciolate.html" (dict "p" .)) -}}
{{- $c = replace $c "<!--ULTIMA-CUCCIOLATA-->" (cond (partial "ultima-cucciolata-doppia.html" .) "" (partial "ultima-cucciolata-scheda.html" .)) -}}
{{- range $i, $m := (findRE `<!--ESPOSIZIONI(:[A-Za-z0-9_-]+)?-->` $c) -}}
{{- $c = replace $c $m (partial "esposizioni.html" (dict "p" $ "k" (replaceRE `^<!--ESPOSIZIONI:?([A-Za-z0-9_-]*)-->$` "$1" $m) "first" false)) -}}
{{- end -}}
{{- $c = replaceRE `(?s)<script[^>]*>.*?</script>` "" $c -}}
{{- $c = replaceRE `(?s)<style[^>]*>.*?</style>` "" $c -}}
{{- $c = replaceRE `(?s)<svg[^>]*>.*?</svg>` "" $c -}}
{{- $c = replaceRE `(?s)<!--.*?-->` "" $c -}}
{{- $c = replaceRE `(?s)<nav[^>]*>.*?</nav>` "" $c -}}
{{- $c = replaceRE `(?s)<header[^>]*>.*?</header>` "" $c -}}
{{- $c = replaceRE `(?s)<footer[^>]*>.*?</footer>` "" $c -}}
{{- $c = replaceRE `(?s)<div class="features-bar">.*?</div>\s*</div>` "" $c -}}
{{- $c = replaceRE `(?s)<span class="hero-eyebrow">.*?</span>` "" $c -}}
{{- $c = replaceRE `(?s)<span class="section-label">.*?</span>` "" $c -}}
{{- $c = replaceRE `(?s)<p class="tags">.*?</p>` "" $c -}}
{{- $c = replaceRE `(?s)<div class="hero-meta">.*?</div>` "" $c -}}
{{- $c = replaceRE `(?s)<h1 class="hero-title">.*?</h1>` "" $c -}}
{{- $c = replaceRE `(?s)<div class="article-footer">.*?</div>` "" $c -}}
{{- $c = replaceRE `(?s)<div class="[^"]*toc[^"]*"[^>]*>.*?</div>\s*</div>` "" $c -}}
{{- $c = replaceRE `(?s)<(ul|div)[^>]*class="[^"]*(indice|sommario|jump|anchor)[^"]*"[^>]*>.*?</(ul|div)>` "" $c -}}
{{- $c = replaceRE `(?s)<div class="[^"]*(toc|breadcrumb|nav)[^"]*"[^>]*>.*?</div>` "" $c -}}
{{- if $suoH1 }}{{ $c = replaceRE `(?s)<h1(?:\s[^>]*)?>.*?</h1>` "" $c 1 }}{{ end -}}
{{- $c = replaceRE `(?s)<h1[^>]*>(.*?)</h1>` "\n\n# $1\n" $c -}}
{{- $c = replaceRE `(?s)<h2[^>]*>(.*?)</h2>` "\n\n## $1\n" $c -}}
{{- $c = replaceRE `(?s)<h3[^>]*>(.*?)</h3>` "\n\n### $1\n" $c -}}
{{- $c = replaceRE `(?s)<h4[^>]*>(.*?)</h4>` "\n\n#### $1\n" $c -}}
{{- $c = replaceRE `(?s)<li[^>]*>(.*?)</li>` "\n- $1" $c -}}
{{- $c = replaceRE `(?s)<a [^>]*href="([^"]*)"[^>]*>(.*?)</a>` "[$2]($1)" $c -}}
{{- $c = replaceRE `(?s)<strong[^>]*>(.*?)</strong>` "**$1**" $c -}}
{{- $c = replaceRE `(?s)<b>(.*?)</b>` "**$1**" $c -}}
{{- $c = replaceRE `(?s)<em[^>]*>(.*?)</em>` "*$1*" $c -}}
{{- $c = replaceRE `</p>` "\n\n" $c -}}
{{- $c = replaceRE `<br\s*/?>` "\n" $c -}}
{{- $c = replaceRE `(?s)</?(thead|tbody)[^>]*>` "" $c -}}
{{- $c = replaceRE `(?s)<t[hd][^>]*>(.*?)</t[hd]>` "| $1 " $c -}}
{{- $c = replaceRE `<tr[^>]*>` "\n" $c -}}
{{- $c = replaceRE `</tr>` "|" $c -}}
{{- $c = replaceRE `(?s)</?table[^>]*>` "\n" $c -}}
{{- $c = replaceRE `<[^>]+>` "" $c -}}
{{- $c = replaceRE `[ \t]+` " " $c -}}
{{- $c = replaceRE `\n{3,}` "\n\n" $c -}}
{{ $c | plainify | htmlUnescape | safeHTML }}

---
Fonte: {{ .Permalink }}
