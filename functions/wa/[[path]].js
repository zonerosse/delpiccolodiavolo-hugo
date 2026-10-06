/* Tasto WhatsApp del sito (ottobre 2026): /wa/<numero>?text=… → conta il tocco nel gestionale e manda subito a wa.me.
   Chi tocca non si accorge di niente. Si manda solo la pagina di partenza (dal Referer, stesso sito): niente IP, niente
   dati personali. I robot e le anteprime dei link non si contano. Chiave condivisa: WA_KEY (uguale nel gestionale). */
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pagespeed|seobility|seomator|python|curl|wget|httpclient|java\//i;
export async function onRequestGet(context) {
  const { request, params, env } = context;
  const u = new URL(request.url);
  const seg = Array.isArray(params.path) ? params.path.join("") : String(params.path || "");
  const num = seg.replace(/\D/g, "") || "393924635584";
  const to = "https://wa.me/" + num + u.search;
  const ua = request.headers.get("user-agent") || "";
  // Pagina di controllo: /wa/393924635584?diag=1 mostra se la chiave c'è e cosa risponde il gestionale (conta un tocco di prova)
  if (u.searchParams.get("diag") === "1") {
    const out = { chiave_WA_KEY_presente: !!env.WA_KEY, browser_preso_per_robot: BOT.test(ua) };
    try {
      const r = await fetch("https://gestionale.delpiccolodiavolo.it/api/public/walog", { method: "POST",
        headers: { "content-type": "application/json", "x-wa-key": env.WA_KEY || "" }, body: JSON.stringify({ path: "/prova-diag/" }) });
      out.risposta_gestionale = r.status + " " + (await r.text()).slice(0, 300);
    } catch (e) { out.errore_collegamento = String(e && e.message || e); }
    return new Response(JSON.stringify(out, null, 2), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "X-Robots-Tag": "noindex" } });
  }
  if (env.WA_KEY && !BOT.test(ua)) {
    let path = "";
    try { const r = new URL(request.headers.get("referer") || ""); if (r.hostname.endsWith("delpiccolodiavolo.it")) path = r.pathname; } catch (e) {}
    // il conteggio parte prima del salto a WhatsApp; context.waitUntil (non "staccato" dal contesto) lo lascia finire
    const invio = fetch("https://gestionale.delpiccolodiavolo.it/api/public/walog", { method: "POST",
      headers: { "content-type": "application/json", "x-wa-key": env.WA_KEY }, body: JSON.stringify({ path }) }).catch(() => {});
    try { context.waitUntil(invio); } catch (e) { await invio; }
  }
  return new Response(null, { status: 302, headers: { Location: to, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
