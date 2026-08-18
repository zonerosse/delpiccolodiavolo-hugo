# {{ .Site.Title }}
{{ with .Description }}
> {{ . }}
{{ end }}
{{- $c := .Params.custom_content | default "" -}}
{{- if not $c }}{{ $c = .Content }}{{ end -}}
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
{{- $c = replaceRE `(?s)<h1[^>]*>(.*?)</h1>` "\n\n# $1\n" $c -}}
{{- $c = replaceRE `(?s)<h2[^>]*>(.*?)</h2>` "\n\n## $1\n" $c -}}
{{- $c = replaceRE `(?s)<h3[^>]*>(.*?)</h3>` "\n\n### $1\n" $c -}}
{{- $c = replaceRE `(?s)<li[^>]*>(.*?)</li>` "\n- $1" $c -}}
{{- $c = replaceRE `(?s)<a [^>]*href="([^"]*)"[^>]*>(.*?)</a>` "[$2]($1)" $c -}}
{{- $c = replaceRE `(?s)<strong[^>]*>(.*?)</strong>` "**$1**" $c -}}
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
