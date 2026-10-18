/* Calcolatore delle crocchette (18/10/2026, Paolo; nato nel gestionale, voce «Quanto mangia»).
   Energia di base RER = 70 × kg^0,75 × fattore per l'età (3 fino a 3 mesi, scende a 2 a 6 mesi, poi all'adulto a 12 mesi:
   1,8 intero, 1,6 sterilizzato; 8+ anni 1,4) × movimento. Grammi = kcal / (kcal per 100 g / 100).
   Le crocchette vengono dalla tabella #pappa-db della pagina (una sola fonte). Le crocchette aggiunte restano solo
   nel browser di chi le scrive (localStorage). Testi in it/en/de dalla lingua della pagina. */
(function(){
var box=document.getElementById("pappa");if(!box)return;
var L=(document.documentElement.lang||"it").slice(0,2);
var TX={
 it:{birth:"Data di nascita",age:"età",kg:"Peso di oggi (kg)",adult:"Peso da adulto previsto (kg)",adultH:"serve per la tabella delle età",food:"Crocchette",pick:"— scegli le crocchette —",mine:"Le mie crocchette",
  other:"Le tue crocchette non sono nell'elenco?",man:"✏️ Scrivo io le kcal",comp:"🧮 Calcolo dai componenti del sacco",foto:"📷 Fotografa il sacco",fotoH:"La foto la legge un'intelligenza artificiale: c'è un limite di letture al giorno (3 per persona), impostato per contenere i costi.",reading:"Leggo il sacco…",limit:"Oggi la lettura delle foto non è disponibile: c'è un limite di letture al giorno, impostato per contenere i costi. Riprova domani, oppure scrivi le kcal o calcolale dai componenti.",fail:"Non sono riuscito a leggere la foto. Riprova con una foto più nitida del retro del sacco, oppure scrivi le kcal.",how:{sacco:"✓ kcal lette sul sacco: controlla e aggiungi.",componenti:"✓ kcal calcolate dai componenti letti sul sacco: controlla e aggiungi.",web:"✓ kcal trovate in internet dal nome sul sacco: controlla e aggiungi.",none:"Non ho trovato le kcal: fotografa il retro del sacco (Componenti analitici) oppure scrivile tu."},name:"Nome delle crocchette",kcal:"kcal per 100 g",save:"Aggiungi all'elenco",
  p:"Proteina %",f:"Grassi %",fi:"Fibra %",a:"Ceneri %",u:"Umidità %",compH:"I cinque valori sono sul retro del sacco, alla voce «Componenti analitici».",calc:"Calcola le kcal",
  act:"Movimento",acts:["🛋 Tranquillo","🚶 Normale","🏃 Molto attivo","💪 Lavoro / sport"],ster:"Sterilizzato",no:"No",yes:"Sì",meals:"Pasti al giorno",sug:"consigliato",
  m4:"Fino a 3 mesi: 4 pasti. Poi 3 fino a 6 mesi, da lì 2.",m3:"Da 3 a 6 mesi: 3 pasti. Dopo i 6 mesi bastano 2.",m2:"Dai 6 mesi in su: 2 pasti (mattina e sera). Un solo pasto è sconsigliato.",
  perday:" g al giorno",meal1:" pasto",mealN:" pasti",about:" da circa ",need:{food:"scegli le crocchette",kg:"scrivi il peso di oggi",birth:"scrivi la data di nascita"},
  th:["Età","Peso circa","Grammi al giorno","Pasti"],mo:" mesi",adultR:"Adulto (da 1 anno e mezzo)",senior:"Anziano (8+ anni)",wk:" settimane",yr1:" anno",yrN:" anni",
  src:{p:"✓ valore del produttore",c:"✓ calcolato dai componenti del sacco",m:"✓ scritto da te",f:"✓ letto dalla foto del sacco"},bad:"Le kcal per 100 g di solito sono tra 300 e 500: controlla.",need3:"Servono almeno proteina, grassi e ceneri."},
 en:{birth:"Date of birth",age:"age",kg:"Today's weight (kg)",adult:"Expected adult weight (kg)",adultH:"used for the table by age",food:"Kibble",pick:"— choose the kibble —",mine:"My kibble",
  other:"Your kibble is not in the list?",man:"✏️ I'll type the kcal",comp:"🧮 Work it out from the bag",foto:"📷 Photograph the bag",fotoH:"The photo is read by an artificial intelligence: there is a daily limit on readings (3 per person), set to keep costs down.",reading:"Reading the bag…",limit:"Photo reading is not available today: there is a daily limit on readings, set to keep costs down. Try again tomorrow, or type the kcal or work them out from the analysis.",fail:"I could not read the photo. Try again with a sharper photo of the back of the bag, or type the kcal.",how:{sacco:"✓ kcal read on the bag: check and add.",componenti:"✓ kcal worked out from the analysis read on the bag: check and add.",web:"✓ kcal found online from the name on the bag: check and add.",none:"No kcal found: photograph the back of the bag (Analytical constituents) or type them in."},name:"Kibble name",kcal:"kcal per 100 g",save:"Add to the list",
  p:"Protein %",f:"Fat %",fi:"Fibre %",a:"Ash %",u:"Moisture %",compH:"The five values are on the back of the bag, under «Analytical constituents».",calc:"Work out the kcal",
  act:"Activity",acts:["🛋 Calm","🚶 Normal","🏃 Very active","💪 Working / sport"],ster:"Neutered",no:"No",yes:"Yes",meals:"Meals a day",sug:"suggested",
  m4:"Up to 3 months: 4 meals. Then 3 up to 6 months, 2 after that.",m3:"From 3 to 6 months: 3 meals. After 6 months, 2 are enough.",m2:"From 6 months on: 2 meals (morning and evening). One meal a day is not advised.",
  perday:" g a day",meal1:" meal",mealN:" meals",about:" of about ",need:{food:"choose the kibble",kg:"type today's weight",birth:"type the date of birth"},
  th:["Age","Weight approx.","Grams a day","Meals"],mo:" months",adultR:"Adult (from 18 months)",senior:"Senior (8+ years)",wk:" weeks",yr1:" year",yrN:" years",
  src:{p:"✓ manufacturer's figure",c:"✓ worked out from the bag's analysis",m:"✓ typed by you",f:"✓ read from the photo of the bag"},bad:"kcal per 100 g are usually between 300 and 500: please check.",need3:"Protein, fat and ash are needed at least."},
 de:{birth:"Geburtsdatum",age:"Alter",kg:"Gewicht heute (kg)",adult:"Erwartetes Erwachsenengewicht (kg)",adultH:"für die Tabelle nach Alter",food:"Trockenfutter",pick:"— Futter wählen —",mine:"Mein Futter",
  other:"Ihr Futter steht nicht in der Liste?",man:"✏️ kcal selbst eingeben",comp:"🧮 Aus der Packung berechnen",foto:"📷 Packung fotografieren",fotoH:"Das Foto liest eine künstliche Intelligenz: es gibt ein tägliches Limit (3 pro Person), um die Kosten zu begrenzen.",reading:"Ich lese die Packung…",limit:"Heute ist das Lesen von Fotos nicht verfügbar: es gibt ein tägliches Limit, um die Kosten zu begrenzen. Versuchen Sie es morgen wieder, oder geben Sie die kcal ein oder berechnen Sie sie aus der Analyse.",fail:"Das Foto konnte nicht gelesen werden. Versuchen Sie es mit einem schärferen Foto der Rückseite, oder geben Sie die kcal ein.",how:{sacco:"✓ kcal von der Packung gelesen: prüfen und hinzufügen.",componenti:"✓ kcal aus der gelesenen Analyse berechnet: prüfen und hinzufügen.",web:"✓ kcal im Internet anhand des Namens gefunden: prüfen und hinzufügen.",none:"Keine kcal gefunden: fotografieren Sie die Rückseite (Analytische Bestandteile) oder geben Sie sie ein."},name:"Name des Futters",kcal:"kcal pro 100 g",save:"Zur Liste hinzufügen",
  p:"Rohprotein %",f:"Fettgehalt %",fi:"Rohfaser %",a:"Rohasche %",u:"Feuchtigkeit %",compH:"Die fünf Werte stehen auf der Rückseite unter «Analytische Bestandteile».",calc:"kcal berechnen",
  act:"Bewegung",acts:["🛋 Ruhig","🚶 Normal","🏃 Sehr aktiv","💪 Arbeit / Sport"],ster:"Kastriert",no:"Nein",yes:"Ja",meals:"Mahlzeiten am Tag",sug:"empfohlen",
  m4:"Bis 3 Monate: 4 Mahlzeiten. Dann 3 bis 6 Monate, danach 2.",m3:"Von 3 bis 6 Monaten: 3 Mahlzeiten. Ab 6 Monaten reichen 2.",m2:"Ab 6 Monaten: 2 Mahlzeiten (morgens und abends). Eine einzige Mahlzeit ist nicht ratsam.",
  perday:" g am Tag",meal1:" Mahlzeit",mealN:" Mahlzeiten",about:" zu etwa ",need:{food:"Futter wählen",kg:"heutiges Gewicht eingeben",birth:"Geburtsdatum eingeben"},
  th:["Alter","Gewicht ca.","Gramm am Tag","Mahlzeiten"],mo:" Monate",adultR:"Erwachsen (ab 18 Monaten)",senior:"Senior (ab 8 Jahren)",wk:" Wochen",yr1:" Jahr",yrN:" Jahre",
  src:{p:"✓ Angabe des Herstellers",c:"✓ aus der Analyse berechnet",m:"✓ von Ihnen eingegeben",f:"✓ vom Foto der Packung gelesen"},bad:"kcal pro 100 g liegen meist zwischen 300 und 500: bitte prüfen.",need3:"Mindestens Protein, Fett und Asche werden gebraucht."}
}[L]||null;if(!TX)return;
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]})}
function num(v){return parseFloat(String(v==null?"":v).replace(",","."))||0}
function dec(x){return(L==="en"?String(x):String(x).replace(".",","))}
/* elenco dalla tabella della pagina */
var DB=[];var t=document.getElementById("pappa-db");
if(t)[].forEach.call(t.querySelectorAll("tbody tr"),function(r,i){var c=r.querySelectorAll("td");if(c.length>=3)DB.push({id:"db"+i,brand:c[0].textContent.trim(),name:c[1].textContent.trim(),kcal:num(c[2].textContent),src:r.getAttribute("data-src")||"p"})});
var MY=[];try{MY=JSON.parse(localStorage.getItem("pappaMie")||"[]")||[]}catch(e){MY=[]}
var S={birth:"",kg:"",adult:"",food:"",act:1,ster:0,meals:0};try{var o=JSON.parse(localStorage.getItem("pappaStato")||"{}");for(var k in o)S[k]=o[k]}catch(e){}
function keep(){try{localStorage.setItem("pappaStato",JSON.stringify(S));localStorage.setItem("pappaMie",JSON.stringify(MY))}catch(e){}}
function foods(){return MY.concat(DB)}function food(id){var F=foods();for(var i=0;i<F.length;i++)if(F[i].id===id)return F[i];return null}
var G=[[2,.25],[3,.38],[4,.5],[5,.62],[6,.72],[7,.8],[8,.86],[9,.9],[10,.93],[11,.96],[12,.98],[18,1]];
function frac(m){if(m>=18)return 1;if(m<=2)return .25*Math.max(.3,m/2);for(var i=1;i<G.length;i++)if(m<=G[i][0]){var a=G[i-1],b=G[i];return a[1]+(b[1]-a[1])*(m-a[0])/(b[0]-a[0])}return 1}
function fac(m,ster,act){var ad=ster?1.6:1.8,f;if(m<=3)f=3;else if(m<=6)f=3-(m-3)/3;else if(m<=12)f=2-(2-ad)*(m-6)/6;else if(m<96)f=ad;else f=1.4;return m<4?f*Math.min(act,1.1):f*act}
function grams(kg,m,ster,act,kcal){return 70*Math.pow(kg,.75)*fac(m,ster,act)/(kcal/100)}
function sug(m){return m<3?4:m<6?3:2}
function ageM(){if(!/^\d{4}-\d{2}-\d{2}$/.test(S.birth))return null;var d=(Date.now()-new Date(S.birth+"T12:00:00"))/864e5;return d<0?null:d/30.44}
function ageTxt(m){if(m<4)return Math.round(m*4.345)+TX.wk;if(m<24)return dec(Math.round(m*2)/2)+TX.mo;var y=Math.floor(m/12);return y+(y===1?TX.yr1:TX.yrN)}
function chips(k,list){return '<div class="pp-ch">'+list.map(function(x){return '<button type="button" class="pp-c'+(String(S[k])===String(x[0])?' on':'')+'" data-k="'+k+'" data-v="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</div>'}
function opt(f){return '<option value="'+f.id+'"'+(f.id===S.food?' selected':'')+'>'+esc(f.brand)+' '+esc(f.name)+' · '+f.kcal+' kcal</option>'}
function build(){var brands=[];DB.forEach(function(f){if(brands.indexOf(f.brand)<0)brands.push(f.brand)});
 box.innerHTML='<div class="pp-g2"><label>'+TX.birth+'<input type="date" id="pp-birth" value="'+esc(S.birth)+'"><span class="pp-ok" id="pp-age"></span></label>'+
 '<label>'+TX.kg+'<input id="pp-kg" inputmode="decimal" value="'+esc(S.kg)+'" placeholder="5,2"></label></div>'+
 '<div class="pp-g2"><label>'+TX.adult+'<input id="pp-adult" inputmode="decimal" value="'+esc(S.adult)+'" placeholder="15"><span class="pp-ok">'+TX.adultH+'</span></label>'+
 '<label>'+TX.food+'<select id="pp-food"><option value="">'+TX.pick+'</option>'+(MY.length?'<optgroup label="'+esc(TX.mine)+'">'+MY.map(opt).join("")+'</optgroup>':'')+brands.map(function(b){return '<optgroup label="'+esc(b)+'">'+DB.filter(function(f){return f.brand===b}).map(opt).join("")+'</optgroup>'}).join("")+'</select><span class="pp-ok" id="pp-src"></span></label></div>'+
 '<div class="pp-oth"><b>'+TX.other+'</b><div class="pp-g2"><button type="button" class="pp-c" data-x="man">'+TX.man+'</button><button type="button" class="pp-c" data-x="comp">'+TX.comp+'</button><button type="button" class="pp-c" data-x="foto">'+TX.foto+'</button></div><p class="pp-ok" style="color:#4a5768">'+TX.fotoH+'</p><div id="pp-add" hidden></div></div>'+
 '<span class="pp-l">'+TX.act+'</span>'+chips("act",[[.85,TX.acts[0]],[1,TX.acts[1]],[1.25,TX.acts[2]],[1.6,TX.acts[3]]])+
 '<span class="pp-l">'+TX.ster+'</span>'+chips("ster",[[0,TX.no],[1,TX.yes]])+
 '<span class="pp-l">'+TX.meals+'</span><div class="pp-ch" id="pp-meals"></div><span class="pp-ok" id="pp-ms"></span>'+
 '<div class="pp-res" aria-live="polite"><b id="pp-g">—</b><span id="pp-gs"></span></div>'+
 '<div class="pp-tb"><table tabindex="0"><thead><tr><th>'+TX.th[0]+'</th><th>'+TX.th[1]+'</th><th class="n">'+TX.th[2]+'</th><th class="n">'+TX.th[3]+'</th></tr></thead><tbody id="pp-tb"></tbody></table></div>';
 draw()}
function $(id){return document.getElementById(id)}
function draw(){var m=ageM(),f=food(S.food),kg=num(S.kg),ad=num(S.adult)||(m!=null&&m>=18&&kg?kg:15),ster=+S.ster===1,act=+S.act||1,sg=m!=null?sug(m):2,ml=+S.meals||sg;
 $("pp-age").textContent=m!=null?TX.age+": "+ageTxt(m):"";$("pp-src").textContent=f?(TX.src[f.src]||""):"";
 $("pp-meals").innerHTML=[1,2,3,4,5].map(function(n){return '<button type="button" class="pp-c'+(n===ml?' on':'')+'" data-k="meals" data-v="'+n+'">'+n+(n===sg?'<small>'+TX.sug+'</small>':'')+'</button>'}).join("");
 $("pp-ms").textContent=m==null?"":sg===4?TX.m4:sg===3?TX.m3:TX.m2;
 if(!f||!kg||m==null){$("pp-g").textContent="—";$("pp-gs").textContent=!f?TX.need.food:!kg?TX.need.kg:TX.need.birth;$("pp-tb").innerHTML="";return}
 var g=grams(kg,m,ster,act,f.kcal);$("pp-g").textContent=Math.round(g/5)*5+TX.perday;$("pp-gs").textContent=ml+(ml===1?TX.meal1:TX.mealN)+TX.about+Math.round(g/ml)+" g";
 var R=[],x;for(x=2;x<=6;x+=.5)R.push(x);[7,8,9,10,11,12].forEach(function(v){R.push(v)});
 var rows=R.map(function(v){return[v,dec(v)+TX.mo,ad*frac(v)]});rows.push([18,TX.adultR,ad],[96,TX.senior,ad]);
 $("pp-tb").innerHTML=rows.map(function(r,i){var nx=rows[i+1],now=m>=r[0]-.25&&(!nx||m<nx[0]-.25);return '<tr'+(now?' class="now"':'')+'><td>'+r[1]+'</td><td>'+dec(r[2].toFixed(1))+' kg</td><td class="n">'+Math.round(grams(r[2],r[0],ster,act,f.kcal)/5)*5+' g</td><td class="n">'+sug(r[0])+'</td></tr>'}).join("")}
function addForm(kind){var a=$("pp-add");a.hidden=false;a.removeAttribute("data-foto");
 var fld=function(id,lab,ph){return '<label>'+lab+'<input id="'+id+'" inputmode="'+(id==="pp-n"?"text":"decimal")+'"'+(ph?' placeholder="'+ph+'"':'')+'></label>'};
 a.innerHTML='<div class="pp-g2">'+fld("pp-n",TX.name)+fld("pp-k",TX.kcal,"380")+'</div>'+(kind==="comp"?'<p class="pp-ok" style="color:inherit">'+TX.compH+'</p><div class="pp-g5">'+fld("pp-p",TX.p)+fld("pp-f",TX.f)+fld("pp-fi",TX.fi)+fld("pp-a",TX.a)+fld("pp-u",TX.u)+'</div><button type="button" class="pp-c" data-x="calc">'+TX.calc+'</button> ':'')+
 '<button type="button" class="pp-c on" data-x="save">'+TX.save+'</button><p class="pp-err" id="pp-err"></p>';$("pp-n").focus()}
/* 📷 foto del sacco: la legge Claude dal gestionale, con un limite di letture al giorno (scelta A di Paolo, 18/10/2026) */
var API="https://gestionale.delpiccolodiavolo.it/api/public/sacco";
function shrink(f){return new Promise(function(ok){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",.85))};im.onerror=function(){ok(null)};im.src=r.result};r.onerror=function(){ok(null)};r.readAsDataURL(f)})}
function foto(b){var i=document.createElement("input");i.type="file";i.accept="image/*";i.multiple=true;i.onchange=function(){var fs=[].slice.call(i.files,0,2);if(!fs.length)return;var lab=b.innerHTML;b.disabled=true;b.innerHTML=TX.reading;
  Promise.all(fs.map(shrink)).then(function(parts){parts=parts.filter(Boolean);return fetch(API,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({parts:parts})})}).then(function(r){return r.json()}).then(function(j){
    b.disabled=false;b.innerHTML=lab;addForm("man");if(!j.ok){$("pp-err").textContent=j.limit?TX.limit:TX.fail;return}
    $("pp-n").value=((j.brand||"")+" "+(j.name||"")).trim();if(j.kcal)$("pp-k").value=j.kcal;$("pp-add").setAttribute("data-foto","1");
    var m=$("pp-err");m.style.color="#2e6b34";m.textContent=j.kcal?TX.how[j.how]||"":TX.how.none;if(!j.kcal)m.style.color=""
  }).catch(function(){b.disabled=false;b.innerHTML=lab;addForm("man");$("pp-err").textContent=TX.limit})};i.click()}
box.addEventListener("click",function(e){var b=e.target.closest("button");if(!b||!box.contains(b))return;
 if(b.getAttribute("data-k")){S[b.getAttribute("data-k")]=+b.getAttribute("data-v");keep();var k=b.getAttribute("data-k");if(k!=="meals")[].forEach.call(box.querySelectorAll('[data-k="'+k+'"]'),function(y){y.classList.toggle("on",y===b)});draw();return}
 var x=b.getAttribute("data-x");if(x==="foto")return foto(b);if(x==="man"||x==="comp")return addForm(x);
 if(x==="calc"){var v=function(id){var s=$(id).value.trim();return s===""?null:num(s)},p=v("pp-p"),f=v("pp-f"),a=v("pp-a");if(p==null||f==null||a==null){$("pp-err").textContent=TX.need3;return}
   var u=v("pp-u");$("pp-k").value=Math.round(3.5*p+8.5*f+3.5*Math.max(0,100-p-f-(v("pp-fi")||0)-a-(u==null?10:u)));b.setAttribute("data-c","1");return}
 if(x==="save"){var n=$("pp-n").value.trim(),kc=Math.round(num($("pp-k").value));if(!(kc>200&&kc<700)){$("pp-err").textContent=TX.bad;return}
   var cb=box.querySelector('[data-x="calc"][data-c="1"]');var it={id:"my"+Date.now().toString(36),brand:"",name:n||"—",kcal:kc,src:$("pp-add").getAttribute("data-foto")?"f":cb?"c":"m"};MY.unshift(it);S.food=it.id;keep();build()}});
box.addEventListener("input",function(e){var id=e.target.id;if(id==="pp-birth"||id==="pp-kg"||id==="pp-adult"){S[id.slice(3)]=e.target.value.trim();keep();draw()}});
box.addEventListener("change",function(e){if(e.target.id==="pp-food"){S.food=e.target.value;keep();draw()}});
build()})();
