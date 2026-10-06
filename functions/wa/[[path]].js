/* Tasto WhatsApp del sito (ottobre 2026): /wa/<numero>?text=… → conta il tocco nel gestionale e manda subito a wa.me.
   Chi tocca non si accorge di niente. Si manda solo la pagina di partenza (dal Referer, stesso sito): niente IP, niente
   dati personali. I robot e le anteprime dei link non si contano. Chiave condivisa: WA_KEY (uguale nel gestionale). */
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pagespeed|seobility|seomator|python|curl|wget|httpclient|java\//i;
export async function onRequestGet({ request, params, env, waitUntil }) {
  const u = new URL(request.url);
  const seg = Array.isArray(params.path) ? params.path.join("") : String(params.path || "");
  const num = seg.replace(/\D/g, "") || "393924635584";
  const to = "https://wa.me/" + num + u.search;
  const ua = request.headers.get("user-agent") || "";
  if (env.WA_KEY && !BOT.test(ua)) {
    let path = "";
    try { const r = new URL(request.headers.get("referer") || ""); if (r.hostname.endsWith("delpiccolodiavolo.it")) path = r.pathname; } catch (e) {}
    waitUntil(fetch("https://gestionale.delpiccolodiavolo.it/api/public/walog", { method: "POST",
      headers: { "content-type": "application/json", "x-wa-key": env.WA_KEY }, body: JSON.stringify({ path }) }).catch(() => {}));
  }
  return new Response(null, { status: 302, headers: { Location: to, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
