/* Il cane: riquadri 1-4 comuni ai due calcolatori (crocchette e BARF) e motore delle calorie, una sola fonte.
   24/10/2026 (Paolo: «i due calcolatori sono diversi… le ultime linee guida», anteprima-19).
   Energia: cucciolo NRC 2006 (adottata dalle linee guida FEDIAF, edizione luglio 2024): 130 × peso^0,75 × 3,2 × (e^(−0,87 p) − 0,1),
   p = peso di oggi / peso da adulto. Adulto: 70 × peso^0,75 × 1,8 (intero) o 1,6 (sterilizzato); 8+ anni 1,4 / 1,3; × movimento; forma ±10%.
   Gravidanza (data della monta): fino al giorno 34 come prima; dal giorno 35 NRC 132 × peso^0,75 + 26 × peso.
   Allattamento (data del parto): NRC 145 × peso^0,75 + peso × (24 n + 12 m) × L, L = 0,75 / 0,95 / 1,1 / 1,2 nelle settimane 1-4;
   settimane 5-8 L = 0,9 / 0,65 / 0,4 / 0,2 (stima nostra: le linee guida non danno la formula), dalla 9ª razione da adulta.
   Uso: var C = DPDCane.make(elemento, {lang, S, onChange}); C.render(); C.need(); C.rows(). Classi pp-* (stile in notte.css). */
(function(){
var IC={act:['<path d="M3 18h18M6 18v-4a6 6 0 0 1 12 0v4"/>','<circle cx="13" cy="4" r="2"/><path d="m9 21 2-6 3 3v3M7 12l3-4 4 1 3 3"/>','<circle cx="16" cy="4" r="2"/><path d="m4 20 5-4 2-5 5 3 3-2M11 11l2-4"/>','<path d="M4 21V9l8-6 8 6v12M9 21v-6h6v6"/>']};
var DOGS=["<svg viewBox='0 0 120 228' width='104' height='198' aria-hidden='true' focusable='false'><rect x='28.0' y='65' width='10' height='17' rx='5' transform='rotate(-28 33.0 72)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='82.0' y='65' width='10' height='17' rx='5' transform='rotate(28 87.0 72)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='36.0' y='153' width='10' height='17' rx='5' transform='rotate(-28 41.0 160)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='74.0' y='153' width='10' height='17' rx='5' transform='rotate(28 79.0 160)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><path d='M60,188 Q65,206 62,222' stroke='var(--dgs)' stroke-width='5' stroke-linecap='round' fill='none'/><path d='M73.0,46.0 C79.2,48.7 82.2,56.3 84.0,62.0 C85.8,67.7 84.0,73.3 84.0,80.0 C84.0,86.7 86.0,94.0 84.0,102.0 C82.0,110.0 72.8,119.3 72.0,128.0 C71.2,136.7 78.7,146.0 79.0,154.0 C79.3,162.0 76.0,170.0 74.0,176.0 C72.0,182.0 70.5,187.7 67.0,190.0 C63.5,192.3 56.5,192.3 53.0,190.0 C49.5,187.7 48.0,182.0 46.0,176.0 C44.0,170.0 40.7,162.0 41.0,154.0 C41.3,146.0 48.8,136.7 48.0,128.0 C47.2,119.3 38.0,110.0 36.0,102.0 C34.0,94.0 36.0,86.7 36.0,80.0 C36.0,73.3 34.2,67.7 36.0,62.0 C37.8,56.3 40.8,48.7 47.0,46.0 C53.2,43.3 66.8,43.3 73.0,46.0 Z' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='43' cy='30' rx='6' ry='9' transform='rotate(-35 43 30)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='77' cy='30' rx='6' ry='9' transform='rotate(35 77 30)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='60' cy='32' rx='18' ry='16' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='51' y='6' width='18' height='20' rx='8' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='60' cy='8' rx='5' ry='3.5' fill='var(--dgs)'/><path d='M41.0,84 Q60,89 79.0,84' stroke='var(--dgs)' stroke-width='1.2' fill='none' opacity='.75'/><path d='M41.0,93 Q60,98 79.0,93' stroke='var(--dgs)' stroke-width='1.2' fill='none' opacity='.75'/><path d='M41.0,102 Q60,107 79.0,102' stroke='var(--dgs)' stroke-width='1.2' fill='none' opacity='.75'/><path d='M41.0,111 Q60,116 79.0,111' stroke='var(--dgs)' stroke-width='1.2' fill='none' opacity='.75'/><path d='M45.0,152 Q60,147 75.0,152' stroke='var(--dgs)' stroke-width='1.2' fill='none' opacity='.75'/><line x1='60' y1='60' x2='60' y2='182' stroke='var(--dgs)' stroke-width='1' stroke-dasharray='2 3' opacity='.6'/></svg>","<svg viewBox='0 0 120 228' width='104' height='198' aria-hidden='true' focusable='false'><rect x='28.0' y='65' width='10' height='17' rx='5' transform='rotate(-28 33.0 72)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='82.0' y='65' width='10' height='17' rx='5' transform='rotate(28 87.0 72)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='32.0' y='153' width='10' height='17' rx='5' transform='rotate(-28 37.0 160)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='78.0' y='153' width='10' height='17' rx='5' transform='rotate(28 83.0 160)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><path d='M60,188 Q65,206 62,222' stroke='var(--dgs)' stroke-width='5' stroke-linecap='round' fill='none'/><path d='M73.0,46.0 C79.2,48.7 81.7,56.3 84.0,62.0 C86.3,67.7 86.5,73.3 87.0,80.0 C87.5,86.7 88.7,94.0 87.0,102.0 C85.3,110.0 77.7,119.3 77.0,128.0 C76.3,136.7 82.8,146.0 83.0,154.0 C83.2,162.0 80.7,170.0 78.0,176.0 C75.3,182.0 71.2,187.7 67.0,190.0 C62.8,192.3 57.2,192.3 53.0,190.0 C48.8,187.7 44.7,182.0 42.0,176.0 C39.3,170.0 36.8,162.0 37.0,154.0 C37.2,146.0 43.7,136.7 43.0,128.0 C42.3,119.3 34.7,110.0 33.0,102.0 C31.3,94.0 32.5,86.7 33.0,80.0 C33.5,73.3 33.7,67.7 36.0,62.0 C38.3,56.3 40.8,48.7 47.0,46.0 C53.2,43.3 66.8,43.3 73.0,46.0 Z' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='43' cy='30' rx='6' ry='9' transform='rotate(-35 43 30)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='77' cy='30' rx='6' ry='9' transform='rotate(35 77 30)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='60' cy='32' rx='18' ry='16' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='51' y='6' width='18' height='20' rx='8' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='60' cy='8' rx='5' ry='3.5' fill='var(--dgs)'/></svg>","<svg viewBox='0 0 120 228' width='104' height='198' aria-hidden='true' focusable='false'><rect x='28.0' y='65' width='10' height='17' rx='5' transform='rotate(-28 33.0 72)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='82.0' y='65' width='10' height='17' rx='5' transform='rotate(28 87.0 72)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='24.0' y='153' width='10' height='17' rx='5' transform='rotate(-28 29.0 160)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='86.0' y='153' width='10' height='17' rx='5' transform='rotate(28 91.0 160)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><path d='M60,188 Q65,206 62,222' stroke='var(--dgs)' stroke-width='5' stroke-linecap='round' fill='none'/><path d='M73.0,46.0 C79.2,48.7 80.7,56.3 84.0,62.0 C87.3,67.7 91.5,73.3 93.0,80.0 C94.5,86.7 92.5,94.0 93.0,102.0 C93.5,110.0 96.3,119.3 96.0,128.0 C95.7,136.7 92.7,146.0 91.0,154.0 C89.3,162.0 90.0,170.0 86.0,176.0 C82.0,182.0 72.5,187.7 67.0,190.0 C61.5,192.3 58.5,192.3 53.0,190.0 C47.5,187.7 38.0,182.0 34.0,176.0 C30.0,170.0 30.7,162.0 29.0,154.0 C27.3,146.0 24.3,136.7 24.0,128.0 C23.7,119.3 26.5,110.0 27.0,102.0 C27.5,94.0 25.5,86.7 27.0,80.0 C28.5,73.3 32.7,67.7 36.0,62.0 C39.3,56.3 40.8,48.7 47.0,46.0 C53.2,43.3 66.8,43.3 73.0,46.0 Z' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='43' cy='30' rx='6' ry='9' transform='rotate(-35 43 30)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='77' cy='30' rx='6' ry='9' transform='rotate(35 77 30)' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='60' cy='32' rx='18' ry='16' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><rect x='51' y='6' width='18' height='20' rx='8' fill='var(--dg)' stroke='var(--dgs)' stroke-width='1.6'/><ellipse cx='60' cy='8' rx='5' ry='3.5' fill='var(--dgs)'/></svg>"];
var TT={
it:{b:["Il cane","Peso","Com'è, visto dall'alto","Movimento"],bcsS:"corregge del 10%",mesi:"Mesi",anni:"Anni",old:"Anziano 8+",dn:"Oppure la data di nascita",lt2:"Ha meno di 2 mesi: il calcolo parte dai 2 mesi.",
 noSt:"Non sterilizzato",siSt:"Sterilizzato",noStF:"Non sterilizzata",siStF:"Sterilizzata",stPup:"Nel cucciolo conta la crescita: la sterilizzazione si fa sentire da adulto, ricontrolla allora.",sxM:"Maschio",sxF:"Femmina",
 first:"Prima scegli l'età: per i cuccioli serve il peso previsto da adulto.",wPup:"Peso previsto da adulto",wPupH:"Per i cuccioli di razza: il peso dei genitori o quello dello standard.",wTod:"Peso di oggi",opt:"(facoltativo)",wTodH:"Se lo sai, il calcolo è più preciso.",wAd:"Peso di oggi",
 sizes:[[8,"Piccola · fino a 10 kg"],[18,"Media · 10–25 kg"],[34,"Grande · 25–45 kg"],[55,"Gigante · oltre 45 kg"]],
 bcs:[["Magro","costole, spina e ossa del bacino si vedono; vita molto stretta"],["Peso giusto","costole che si sentono con la mano piatta senza premere; da sopra si vede la vita"],["Sovrappeso","costole che non si sentono; niente vita, fianchi dritti o tondi"]],
 acts:[["Tranquillo","poche passeggiate"],["Normale","passeggiate ogni giorno"],["Molto attivo","corre e gioca tanto"],["Lavoro o sport","agility, caccia, utilità"]],
 mom:"Gravidanza o allattamento",rep:["Nessuno","Gravida","In allattamento"],dM:"Data della monta (la prima)",dP:"Data del parto",np:"Cuccioli che allatta",fut:"La data è nel futuro: controlla.",
 mEta:"l'età",mPeso:"il peso",mPesoP:"il peso previsto da adulto",mMonta:"la data della monta",mParto:"la data del parto",
 h:"½",mo:" mesi",y1:" anno",yN:" anni",y15:"1 anno e mezzo",wk:" settimane",
 adult:"Adulto",senior:"Anziano (8+ anni)",pupL:"Cucciolo",
 grL:"Gravidanza · giorno ",latL:"Allattamento · ",latW:function(w){return w+"ª settimana"},pups:" cuccioli",pup1:" cucciolo",
 bcsN:{"-1":"+10% perché è magro: ricontrolla tra due settimane.","1":"−10% perché è in sovrappeso: ricontrolla tra due settimane."},chk:"Ricontrolla sul cane ogni due settimane.",
 repNo:"In questo momento la formula è già quella della femmina gravida o che allatta: forma e movimento non cambiano il conto.",
 gr:[[0,0,"Monta: giorno 0"],[25,30,"Ecografia: conferma della gravidanza"],[35,63,"Razione più alta (formula della gravidanza): passa alla nuova quantità in 3-4 giorni"],[55,55,"Radiografia: si contano i cuccioli"],[56,58,"Prepara la cassa parto"],[58,68,"Parto: previsto il giorno 63"]],
 grN0:"Fino al giorno 34 la razione resta quella di prima: ingrassare adesso rende il parto più difficile.",grNc:"Niente integratori di calcio in gravidanza, se non li prescrive il veterinario.",grOver:"Il parto previsto è passato: se non ha partorito, senti il veterinario. Qui il calcolo torna alla razione di prima.",
 lat:[[1,2,"Settimane 1-2: solo latte, la richiesta sale"],[3,4,"Settimane 3-4: picco del latte"],[5,6,"Settimane 5-6: i cuccioli mangiano anche la pappa, la madre ne chiede meno"],[7,8,"Settimane 7-8: svezzamento, la madre torna verso la razione di prima"],[9,99,"Dalla 9ª settimana: razione da adulta"]],
 latN:"Dalla 5ª settimana i numeri sono una nostra stima: le linee guida danno la formula solo per le prime 4 settimane.",latE:"Svezzati: la razione torna quella da adulta.",
 tlG:"Tappe della gravidanza",tlL:"Tappe dell'allattamento",next:"prossima",from:"dal",grS:["Monta","Ecografia","Razione più alta","Radiografia","Cassa parto","Parto"],latS:["Settimane 1-2","Picco del latte","Pappa ai cuccioli","Svezzamento","Razione da adulta"],today:"oggi",wkT:"Settimana",dayT:"giorno ",sugT:{4:"Fino a 3 mesi: 4 pasti. Poi 3 fino a 6 mesi, da lì 2.",3:"Fino a 6 mesi: 3 pasti. Dopo i 6 mesi bastano 2.",2:"Dai 6 mesi in su: 2 pasti (mattina e sera). Un solo pasto è sconsigliato.",r:"Gravidanza avanzata e allattamento: meglio 3 pasti o più, piccoli."}},
en:{b:["The dog","Weight","What it looks like from above","Activity"],bcsS:"adjusts by 10%",mesi:"Months",anni:"Years",old:"Senior 8+",dn:"Or the date of birth",lt2:"Under 2 months: the calculation starts at 2 months.",
 noSt:"Not neutered",siSt:"Neutered",noStF:"Not spayed",siStF:"Spayed",stPup:"In a puppy growth comes first: neutering shows its effect in the adult, check again then.",sxM:"Male",sxF:"Female",
 first:"Choose the age first: puppies need the expected adult weight.",wPup:"Expected adult weight",wPupH:"For pedigree puppies: the parents' weight or the breed standard.",wTod:"Today's weight",opt:"(optional)",wTodH:"If you know it, the result is more precise.",wAd:"Today's weight",
 sizes:[[8,"Small · up to 10 kg"],[18,"Medium · 10–25 kg"],[34,"Large · 25–45 kg"],[55,"Giant · over 45 kg"]],
 bcs:[["Thin","ribs, spine and hip bones show; very narrow waist"],["Right weight","ribs felt with a flat hand without pressing; a waist seen from above"],["Overweight","ribs cannot be felt; no waist, straight or round sides"]],
 acts:[["Calm","few walks"],["Normal","walks every day"],["Very active","runs and plays a lot"],["Working or sport","agility, hunting, working"]],
 mom:"Pregnancy or nursing",rep:["None","Pregnant","Nursing"],dM:"Date of mating (the first)",dP:"Date of whelping",np:"Puppies she is nursing",fut:"The date is in the future: please check.",
 mEta:"the age",mPeso:"the weight",mPesoP:"the expected adult weight",mMonta:"the date of mating",mParto:"the date of whelping",
 h:"½",mo:" months",y1:" year",yN:" years",y15:"1½ years",wk:" weeks",
 adult:"Adult",senior:"Senior (8+ years)",pupL:"Puppy",
 grL:"Pregnancy · day ",latL:"Nursing · ",latW:function(w){return "week "+w},pups:" puppies",pup1:" puppy",
 bcsN:{"-1":"+10% because the dog is thin: check again in two weeks.","1":"−10% because the dog is overweight: check again in two weeks."},chk:"Check on the dog every two weeks.",
 repNo:"At this stage the formula is already the one for a pregnant or nursing bitch: shape and activity do not change the result.",
 gr:[[0,0,"Mating: day 0"],[25,30,"Ultrasound: pregnancy confirmed"],[35,63,"Larger ration (pregnancy formula): move to the new amount over 3-4 days"],[55,55,"X-ray: the puppies are counted"],[56,58,"Get the whelping box ready"],[58,68,"Whelping: expected on day 63"]],
 grN0:"Up to day 34 the ration stays as before: putting on weight now makes whelping harder.",grNc:"No calcium supplements during pregnancy unless your vet prescribes them.",grOver:"The expected date has passed: if she has not whelped, call your vet. Here the calculation goes back to the usual ration.",
 lat:[[1,2,"Weeks 1-2: milk only, the demand rises"],[3,4,"Weeks 3-4: peak milk"],[5,6,"Weeks 5-6: the puppies also eat solid food, the mother needs less"],[7,8,"Weeks 7-8: weaning, the mother goes back towards her usual ration"],[9,99,"From week 9: adult ration"]],
 latN:"From week 5 the figures are our estimate: the guidelines give the formula for the first 4 weeks only.",latE:"Weaned: back to the adult ration.",
 tlG:"Pregnancy milestones",tlL:"Nursing milestones",next:"next",from:"from",grS:["Mating","Ultrasound","Larger ration","X-ray","Whelping box","Whelping"],latS:["Weeks 1-2","Peak milk","Solid food for the puppies","Weaning","Adult ration"],today:"today",wkT:"Week",dayT:"day ",sugT:{4:"Up to 3 months: 4 meals. Then 3 up to 6 months, 2 after that.",3:"Up to 6 months: 3 meals. After 6 months, 2 are enough.",2:"From 6 months on: 2 meals (morning and evening). One meal a day is not advised.",r:"Late pregnancy and nursing: better 3 or more small meals."}},
de:{b:["Der Hund","Gewicht","Wie er von oben aussieht","Bewegung"],bcsS:"passt um 10 % an",mesi:"Monate",anni:"Jahre",old:"Senior 8+",dn:"Oder das Geburtsdatum",lt2:"Unter 2 Monaten: die Berechnung beginnt mit 2 Monaten.",
 noSt:"Nicht kastriert",siSt:"Kastriert",noStF:"Nicht kastriert",siStF:"Kastriert",stPup:"Beim Welpen zählt das Wachstum: die Kastration wirkt sich erst beim erwachsenen Hund aus, dann neu prüfen.",sxM:"Rüde",sxF:"Hündin",
 first:"Zuerst das Alter wählen: für Welpen braucht es das erwartete Erwachsenengewicht.",wPup:"Erwartetes Erwachsenengewicht",wPupH:"Für Rassewelpen: das Gewicht der Eltern oder des Standards.",wTod:"Gewicht heute",opt:"(freiwillig)",wTodH:"Wenn Sie es kennen, wird das Ergebnis genauer.",wAd:"Gewicht heute",
 sizes:[[8,"Klein · bis 10 kg"],[18,"Mittel · 10–25 kg"],[34,"Groß · 25–45 kg"],[55,"Riesig · über 45 kg"]],
 bcs:[["Dünn","Rippen, Wirbelsäule und Beckenknochen sichtbar; sehr schmale Taille"],["Richtiges Gewicht","Rippen mit flacher Hand ohne Druck fühlbar; von oben eine Taille"],["Übergewicht","Rippen nicht fühlbar; keine Taille, gerade oder runde Flanken"]],
 acts:[["Ruhig","wenig Spaziergänge"],["Normal","jeden Tag Spaziergänge"],["Sehr aktiv","rennt und spielt viel"],["Arbeit oder Sport","Agility, Jagd, Gebrauchshund"]],
 mom:"Trächtigkeit oder Säugezeit",rep:["Nein","Trächtig","Säugend"],dM:"Datum des Deckakts (des ersten)",dP:"Datum der Geburt",np:"Welpen, die sie säugt",fut:"Das Datum liegt in der Zukunft: bitte prüfen.",
 mEta:"das Alter",mPeso:"das Gewicht",mPesoP:"das erwartete Erwachsenengewicht",mMonta:"das Datum des Deckakts",mParto:"das Datum der Geburt",
 h:"½",mo:" Monate",y1:" Jahr",yN:" Jahre",y15:"1½ Jahre",wk:" Wochen",
 adult:"Erwachsen",senior:"Senior (ab 8 Jahren)",pupL:"Welpe",
 grL:"Trächtigkeit · Tag ",latL:"Säugezeit · ",latW:function(w){return w+". Woche"},pups:" Welpen",pup1:" Welpe",
 bcsN:{"-1":"+10 %, weil er dünn ist: in zwei Wochen erneut prüfen.","1":"−10 %, weil er übergewichtig ist: in zwei Wochen erneut prüfen."},chk:"Alle zwei Wochen am Hund überprüfen.",
 repNo:"In dieser Phase gilt schon die Formel für die tragende oder säugende Hündin: Figur und Bewegung ändern das Ergebnis nicht.",
 gr:[[0,0,"Deckakt: Tag 0"],[25,30,"Ultraschall: Trächtigkeit bestätigt"],[35,63,"Größere Ration (Formel der Trächtigkeit): in 3-4 Tagen auf die neue Menge umstellen"],[55,55,"Röntgen: die Welpen werden gezählt"],[56,58,"Wurfkiste vorbereiten"],[58,68,"Geburt: erwartet am Tag 63"]],
 grN0:"Bis Tag 34 bleibt die Ration wie vorher: jetzt zuzunehmen erschwert die Geburt.",grNc:"Keine Kalziumzusätze in der Trächtigkeit, außer der Tierarzt verschreibt sie.",grOver:"Der erwartete Termin ist vorbei: wenn sie nicht geworfen hat, den Tierarzt anrufen. Hier gilt wieder die gewohnte Ration.",
 lat:[[1,2,"Wochen 1-2: nur Milch, der Bedarf steigt"],[3,4,"Wochen 3-4: Höhepunkt der Milch"],[5,6,"Wochen 5-6: die Welpen fressen auch Brei, die Mutter braucht weniger"],[7,8,"Wochen 7-8: Entwöhnung, die Mutter geht zur gewohnten Ration zurück"],[9,99,"Ab der 9. Woche: Ration für Erwachsene"]],
 latN:"Ab der 5. Woche sind die Zahlen unsere Schätzung: die Leitlinien geben die Formel nur für die ersten 4 Wochen.",latE:"Entwöhnt: wieder die Ration für Erwachsene.",
 tlG:"Etappen der Trächtigkeit",tlL:"Etappen der Säugezeit",next:"nächste",from:"ab",grS:["Deckakt","Ultraschall","Größere Ration","Röntgen","Wurfkiste","Geburt"],latS:["Wochen 1-2","Höhepunkt der Milch","Brei für die Welpen","Entwöhnung","Ration für Erwachsene"],today:"heute",wkT:"Woche",dayT:"Tag ",sugT:{4:"Bis 3 Monate: 4 Mahlzeiten. Dann 3 bis 6 Monate, danach 2.",3:"Bis 6 Monate: 3 Mahlzeiten. Ab 6 Monaten reichen 2.",2:"Ab 6 Monaten: 2 Mahlzeiten (morgens und abends). Eine einzige Mahlzeit ist nicht ratsam.",r:"Späte Trächtigkeit und Säugezeit: besser 3 oder mehr kleine Mahlzeiten."}}};
var ACTS=[.85,1,1.25,1.6],MESI=[2,2.5,3,3.5,4,4.5,5,5.5,6,7,8,9,10,11],ANNI=[12,18,24,36,48,60,72,84];
var LAT=[.75,.95,1.1,1.2,.9,.65,.4,.2];
var G=[[2,.25],[3,.38],[4,.5],[5,.62],[6,.72],[7,.8],[8,.86],[9,.9],[10,.93],[11,.96],[12,.98],[18,1]];
function frac(m){if(m>=18)return 1;if(m<=2)return .25*Math.max(.3,m/2);for(var i=1;i<G.length;i++)if(m<=G[i][0]){var a=G[i-1],b=G[i];return a[1]+(b[1]-a[1])*(m-a[0])/(b[0]-a[0])}return 1}
/* la crescita dura di più nei cani grandi: fine a 10 mesi (fino a 10 kg), 12 (10-25), 15 (25-45), 20 (oltre 45) */
function fine(ad){return ad<10?10:ad<25?12:ad<45?15:20}
function eq(m,ad){return m*12/fine(ad||18)}
function pupOf(m,ad){return m!=null&&m<Math.max(18,fine(ad)+3)}
function num(v){return parseFloat(String(v==null?"":v).replace(",","."))||0}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]})}
function days(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d||""))return null;var t=new Date();t.setHours(12,0,0,0);return Math.round((t-new Date(d+"T12:00:00"))/864e5)}
function addD(d,n){var x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return x}
/* energia, kcal al giorno */
function kPup(W,ad){var p=Math.min(W/ad,1);return 130*Math.pow(W,.75)*3.2*(Math.exp(-.87*p)-.1)}
function kAd(W,m,ster,act){return 70*Math.pow(W,.75)*(m>=96?(ster?1.3:1.4):(ster?1.6:1.8))*act}
function kGr(W){return 132*Math.pow(W,.75)+26*W}
function kLat(W,np,w){var n=Math.min(np,4),mm=Math.min(Math.max(np-4,0),4);return 145*Math.pow(W,.75)+W*(24*n+12*mm)*LAT[w-1]}
function make(root,O){O=O||{};
 var L=(O.lang||document.documentElement.lang||"it").slice(0,2);if(!TT[L])L="it";var T=TT[L];
 var S=O.S||{};var D0={sex:"m",ster:0,mode:"age",age:"",birth:"",adult:"",kg:"",bcs:0,act:1,rep:"no",repD:"",np:6};for(var k in D0)if(S[k]==null)S[k]=D0[k];
 var fire=O.onChange||function(){};
 function dec(x,d){var s=d==null?String(x):x.toFixed(d);return L==="en"?s:s.replace(".",",")}
 function dt(x){return x.toLocaleDateString(L==="en"?"en-GB":L==="de"?"de-DE":"it-IT",{day:"numeric",month:"short"})}
 function ageM(){if(S.mode!=="date")return num(S.age)||null;var d=days(S.birth);return d==null||d<0?null:d/30.44}
 function ageTxt(m){if(m>=96&&S.mode!=="date")return T.old;if(m<4)return Math.round(m*4.345)+T.wk;if(m<24)return dec(Math.round(m*2)/2)+T.mo;var y=Math.floor(m/12);return y+(y===1?T.y1:T.yN)}
 function canRep(m){return S.sex==="f"&&!+S.ster&&(m==null||m>=12)}
 function rep(m){return canRep(m)?S.rep:"no"}
 function szKg(z){return S.sex==="f"?Math.round(z*.9*2)/2:z}
 function mLab(v){return(v%1?Math.floor(v)+T.h:v)+T.mo}
 function aLab(v){return v===18?T.y15:(v/12)+(v===12?T.y1:T.yN)}
 function svg(d){return '<svg class="pp-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+d+'</svg>'}
 function blk(n,inner,sub){return '<div class="pp-blk"><h2 class="pp-h">'+n+'. '+T.b[n-1]+(sub?' <small>('+sub+')</small>':'')+'</h2>'+inner+'</div>'}
 function numIn(id,val,ph){return '<div class="pp-num"><button type="button" class="pp-pm" data-pm="'+id+'" data-d="-0.5" aria-label="−0,5 kg">−</button><input data-in="'+id+'" inputmode="decimal" value="'+esc(val)+'" placeholder="'+esc(ph||"kg")+'" aria-label="kg"><button type="button" class="pp-pm" data-pm="'+id+'" data-d="0.5" aria-label="+0,5 kg">+</button><span>kg</span></div>'}
 /* tappe della gravidanza o dell'allattamento, con le date */
 /* tappe in una tendina chiusa (24/10/2026, Paolo: «a tendina, così troppo invasiva»): da chiusa dice il giorno di oggi e la prossima tappa */
 var TL_OPEN=false;
 function tl(){var m=ageM(),r=rep(m);if(r==="no"||!S.repD)return"";var d=days(S.repD);if(d==null)return"";if(d<0)return '<p class="pp-ok dc-warn">'+T.fut+'</p>';
  var li,now,nx,note;
  if(r==="acc"){li=T.gr.map(function(g,i){var st=d>g[1]?" fatto":d>=g[0]?" ora":"";return '<li class="dc-t'+st+'"><span>'+dt(addD(S.repD,g[0]))+(g[1]>g[0]?' – '+dt(addD(S.repD,g[1])):'')+'</span>'+g[2]+'</li>'}).join("");
   nx=T.gr.filter(function(g){return g[0]>d})[0];now=T.dayT.replace(/^./,function(c){return c.toUpperCase()})+d;
   if(nx)nx=T.grS[T.gr.indexOf(nx)]+' ('+dt(addD(S.repD,nx[0]))+(nx[1]>nx[0]?' – '+dt(addD(S.repD,nx[1])):'')+')';
   note=(d<35?T.grN0+' ':'')+T.grNc+(d>70?' <b>'+T.grOver+'</b>':'');}
  else{var w=Math.floor(d/7)+1;li=T.lat.map(function(g){var st=w>g[1]?" fatto":w>=g[0]?" ora":"";return '<li class="dc-t'+st+'"><span>'+dt(addD(S.repD,(g[0]-1)*7))+'</span>'+g[2]+'</li>'}).join("");
   nx=T.lat.filter(function(g){return g[0]>w})[0];now=T.latW(w).replace(/^./,function(c){return c.toUpperCase()});
   if(nx)nx=T.latS[T.lat.indexOf(nx)]+' ('+T.from+' '+dt(addD(S.repD,(nx[0]-1)*7))+')';note=T.latN}
  return '<details class="dc-tld"'+(TL_OPEN?' open':'')+'><summary><b>'+(r==="acc"?T.tlG:T.tlL)+'</b><span>'+now+(nx?' · '+T.next+': '+nx:'')+'</span></summary><ol class="dc-tl">'+li+'</ol><p class="pp-ok">'+note+'</p></details>'}
 function html(){var m=ageM(),ad=num(S.adult),pup=pupOf(m,ad),old=S.mode!=="date"&&num(S.age)>=96,r=rep(m);
  var mo='<option value="">—</option>'+MESI.map(function(v){return '<option value="'+v+'"'+(S.mode!=="date"&&String(v)===String(S.age)?' selected':'')+'>'+mLab(v)+'</option>'}).join("");
  var yo='<option value="">—</option>'+ANNI.map(function(v){return '<option value="'+v+'"'+(S.mode!=="date"&&String(v)===String(S.age)?' selected':'')+'>'+aLab(v)+'</option>'}).join("");
  var isM=S.mode!=="date"&&MESI.indexOf(num(S.age))>=0,isA=S.mode!=="date"&&ANNI.indexOf(num(S.age))>=0,today=new Date().toISOString().slice(0,10);
  var at=S.mode==="date"&&S.birth&&m!=null?(m<2?T.lt2:ageTxt(m)):"";
  var b1='<div class="pp-row"><label>'+T.mesi+'<select data-sel="mesi"'+(isM?' class="on"':'')+'>'+mo+'</select></label><label>'+T.anni+'<select data-sel="anni"'+(isA?' class="on"':'')+'>'+yo+'</select></label><button type="button" class="pp-c pp-old'+(old?' on':'')+'" data-x="old">'+T.old+'</button></div>'+
   '<label class="pp-dn">'+T.dn+'<input type="date" data-in="birth"'+(S.mode==="date"&&S.birth?' class="on"':'')+' value="'+(S.mode==="date"?esc(S.birth):"")+'" max="'+today+'"></label><span class="pp-ok dc-at">'+esc(at)+'</span>'+
   '<div class="pp-ch pp-two pp-sx"><button type="button" class="pp-c'+(S.sex==="f"?'':' on')+'" data-sx="m">♂ '+T.sxM+'</button><button type="button" class="pp-c'+(S.sex==="f"?' on':'')+'" data-sx="f">♀ '+T.sxF+'</button></div>'+
   '<div class="pp-ch pp-two"><button type="button" class="pp-c'+(+S.ster?'':' on')+'" data-k="ster" data-v="0">'+(S.sex==="f"?T.noStF:T.noSt)+'</button><button type="button" class="pp-c'+(+S.ster?' on':'')+'" data-k="ster" data-v="1">'+(S.sex==="f"?T.siStF:T.siSt)+'</button></div>'+
   '<div class="dc-stn">'+pStn()+'</div><div class="dc-repw">'+pRep()+'</div>';
  return blk(1,b1)+blk(2,'<div class="dc-b2">'+pB2()+'</div>')+blk(3,b3(),T.bcsS)+blk(4,b4()+'<div class="dc-b4n">'+pB4n()+'</div>')}
 function pStn(){var m=ageM();return pupOf(m,num(S.adult))&&+S.ster?'<p class="pp-ok">'+T.stPup+'</p>':''}
 function pRep(){var m=ageM(),r=rep(m),today=new Date().toISOString().slice(0,10);return (canRep(m)?'<div class="dc-rep"><span class="pp-l">'+T.mom+'</span><div class="pp-ch dc-three">'+["no","acc","lat"].map(function(v,i){return '<button type="button" class="pp-c'+(r===v?' on':'')+'" data-rep="'+v+'">'+T.rep[i]+'</button>'}).join("")+'</div>'+
    (r!=="no"?'<div class="dc-rd"><label>'+(r==="acc"?T.dM:T.dP)+'<input type="date" data-in="repD" value="'+esc(S.repD)+'" max="'+today+'"></label>'+(r==="lat"?'<label>'+T.np+'<select data-sel="np">'+[1,2,3,4,5,6,7,8,9,10,11,12].map(function(n){return '<option'+(n===+S.np?' selected':'')+'>'+n+'</option>'}).join("")+'</select></label>':'')+'</div><div class="dc-tlw">'+tl()+'</div>':'')+'</div>':'')}
 function pB2(){var m=ageM(),ad=num(S.adult),pup=pupOf(m,ad),r=rep(m);return m==null?'<p class="pp-vuoto">'+T.first+'</p>':(pup&&r==="no")?'<div class="pp-g2"><div><span class="pp-l">'+T.wPup+'</span>'+numIn("adult",S.adult,"15")+'<div class="pp-sz">'+T.sizes.map(function(z){var w=szKg(z[0]);return '<button type="button" class="pp-c pp-s'+(num(S.adult)===w?' on':'')+'" data-sz="'+w+'">'+z[1]+'</button>'}).join("")+'</div><p class="pp-ok">'+T.wPupH+'</p></div><div><span class="pp-l">'+T.wTod+' <i>'+T.opt+'</i></span>'+numIn("kg",S.kg,ad&&m!=null?dec(+(ad*frac(eq(m,ad))).toFixed(1)):"")+'<p class="pp-ok">'+T.wTodH+'</p></div></div>':'<span class="pp-l">'+T.wAd+'</span>'+numIn("adult",S.adult,"15")}
 function b3(){return '<div class="pp-opts">'+[-1,0,1].map(function(v,i){return '<button type="button" class="pp-o pp-fig'+(+S.bcs===v?' on':'')+'" data-k="bcs" data-v="'+v+'"><span class="pp-dog">'+DOGS[i]+'</span><b>'+T.bcs[i][0]+'</b><small>'+T.bcs[i][1]+'</small></button>'}).join("")+'</div>'}
 function b4(){return '<div class="pp-opts">'+ACTS.map(function(a,i){return '<button type="button" class="pp-o'+(+S.act===a?' on':'')+'" data-k="act" data-v="'+a+'">'+svg(IC.act[i])+'<b>'+T.acts[i][0]+'</b><small>'+T.acts[i][1]+'</small></button>'}).join("")+'</div>'}
 function pB4n(){return formRep()?'<p class="pp-ok">'+T.repNo+'</p>':''}
 function formRep(){var m=ageM(),r=rep(m),d=days(S.repD);return d!=null&&d>=0&&((r==="acc"&&d>=35&&d<=70)||(r==="lat"&&d<56))}
 function render(){root.innerHTML=html()}
 /* aggiornamento a pezzi dopo una data: il campo della data non si ridisegna, così il calendario resta aperto (24/10/2026, Paolo: «prende la data di oggi e si chiude») */
 function part(src){var q=function(c,h){var e=root.querySelector("."+c);if(e&&!e.contains(document.activeElement))e.innerHTML=h};var m=ageM();
  var at=S.mode==="date"&&S.birth&&m!=null?(m<2?T.lt2:ageTxt(m)):"";q("dc-at",esc(at));q("dc-stn",pStn());q("dc-b2",pB2());q("dc-b4n",pB4n());
  if(src==="birth")q("dc-repw",pRep());else q("dc-tlw",tl())}
 function set(k,v,re){S[k]=v;if(re)render();fire(k)}
 root.addEventListener("click",function(e){var b=e.target.closest("button");if(!b||!root.contains(b))return;
  if(b.dataset.k){var k=b.dataset.k,v=+b.dataset.v;[].forEach.call(root.querySelectorAll('[data-k="'+k+'"]'),function(y){y.classList.toggle("on",y===b)});set(k,v,k==="ster");return}
  if(b.dataset.sx){var ns=b.dataset.sx;if(ns!==S.sex){var o=T.sizes.filter(function(z){return num(S.adult)===szKg(z[0])})[0];S.sex=ns;if(o)S.adult=String(szKg(o[0]));set("sex",ns,1)}return}
  if(b.dataset.rep){set("rep",b.dataset.rep,1);return}
  if(b.dataset.sz){set("adult",b.dataset.sz,1);return}
  if(b.dataset.pm){var id=b.dataset.pm,nv=Math.max(.5,Math.round(((num(S[id])||(id==="kg"?5:15))+ +b.dataset.d)*10)/10),inp=root.querySelector('[data-in="'+id+'"]');S[id]=String(nv);if(inp)inp.value=dec(nv);fire(id);return}
  if(b.dataset.x==="old"){var was=S.mode!=="date"&&num(S.age)>=96;S.mode="age";S.birth="";S.age=was?"":"96";set("age",S.age,1)}});
 root.addEventListener("toggle",function(e){if(e.target.classList&&e.target.classList.contains("dc-tld"))TL_OPEN=e.target.open},true);
 root.addEventListener("change",function(e){var t=e.target;
  if(t.dataset.sel==="mesi"||t.dataset.sel==="anni"){S.mode="age";S.birth="";set("age",t.value,1);return}
  if(t.dataset.sel==="np"){set("np",+t.value,1);return}
  if(t.dataset.in==="birth"){S.birth=t.value;S.mode=S.birth?"date":"age";if(S.birth)S.age="";t.classList.toggle("on",!!S.birth);[].forEach.call(root.querySelectorAll("[data-sel=mesi],[data-sel=anni]"),function(x){x.value="";x.classList.remove("on")});
   var ob=root.querySelector("[data-x=old]");if(ob)ob.classList.remove("on");part("birth");fire("birth");return}
  if(t.dataset.in==="repD"){S.repD=t.value;part("repD");fire("repD")}});
 root.addEventListener("input",function(e){var t=e.target,id=t.dataset.in;if(id!=="kg"&&id!=="adult")return;var was=pupOf(ageM(),num(S.adult));S[id]=t.value.trim();
  if(pupOf(ageM(),num(S.adult))!==was){var pos=t.selectionStart;render();var n=root.querySelector('[data-in="'+id+'"]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}fire(id)});
 /* il risultato: kcal al giorno e tutto quello che serve ai calcolatori */
 function need(){var m=ageM(),ad=num(S.adult),pup=pupOf(m,ad),r=rep(m),miss=[],ster=!!+S.ster,act=+S.act||1,bc=+S.bcs||0,bf=bc===-1?1.1:bc===1?.9:1;
  if(m==null||(S.mode==="date"&&m<2))miss.push(T.mEta);else if(pup&&r==="no"&&!ad)miss.push(T.mPesoP);else if(!ad)miss.push(T.mPeso);
  if(r!=="no"){var d=days(S.repD);if(d==null||d<0)miss.push(r==="acc"?T.mMonta:T.mParto)}
  if(miss.length)return{miss:miss};
  var o={miss:[],m:m,pup:pup&&r==="no",ster:ster,act:act,bcs:bc,ad:ad,rep:"no",note:bc?T.bcsN[String(bc)]:T.chk,age:ageTxt(m)};
  if(r==="acc"){var dd=days(S.repD);o.W=ad;if(dd>=35&&dd<=70){o.kc=kGr(ad);o.std="eg";o.rep="gr";o.sug=3;o.note=T.grNc}else{o.kc=kAd(ad,m,ster,act)*bf;o.std=ster||m>=96||act<=.85?"a95":"a110";o.sug=2;o.rep=dd>70?"gr+":"gr0"}o.lab=T.grL+dd;o.sugT=o.sug===3?T.sugT.r:T.sugT[2];return o}
  if(r==="lat"){var dl=days(S.repD),w=Math.floor(dl/7)+1;o.W=ad;o.np=+S.np;if(w<=8){o.kc=kLat(ad,+S.np,w);o.std="eg";o.rep="lat";o.sug=3;o.note=w>4?T.latN:T.chk}else{o.kc=kAd(ad,m,ster,act)*bf;o.std=ster||m>=96||act<=.85?"a95":"a110";o.sug=2;o.rep="lat+";o.note=T.latE}o.lab=T.latL+T.latW(w)+" · "+S.np+(+S.np===1?T.pup1:T.pups);o.sugT=o.sug===3?T.sugT.r:T.sugT[2];return o}
  if(o.pup){o.W=num(S.kg)||ad*frac(eq(m,ad));o.est=!num(S.kg);o.kc=kPup(o.W,ad)*bf;o.std=m<3.25?"eg":"lg";o.lab=T.pupL+" · "+ageTxt(m)}
  else{o.W=ad;o.kc=kAd(ad,m,ster,act)*bf;o.std=ster||m>=96||act<=.85?"a95":"a110";o.lab=m>=96?T.senior:T.adult}
  o.sug=m<3?4:m<6?3:2;o.sugT=T.sugT[o.sug];return o}
 /* tabella «come cambia»: per età (crescita) o settimana per settimana (gravidanza, allattamento) */
 function rows(){var N=need();if(N.miss.length)return null;var ad=N.ad,ster=N.ster,act=N.act,bf=N.bcs===-1?1.1:N.bcs===1?.9:1,m=N.m,R=[];
  if(N.rep==="gr"||N.rep==="gr0"||N.rep==="gr+"){var d=days(S.repD);for(var k=1;k<=9;k++){var dm=(k-1)*7+3;R.push({lab:T.wkT+" "+k,sub:dt(addD(S.repD,(k-1)*7)),W:ad,kc:dm>=35?kGr(ad):kAd(ad,m,ster,act)*bf,sug:dm>=35?3:2,now:d>=(k-1)*7&&d<k*7})}return{h:"w",r:R}}
  if(N.rep==="lat"||N.rep==="lat+"){var dl=days(S.repD);for(var w=1;w<=9;w++)R.push({lab:T.wkT+" "+w,sub:dt(addD(S.repD,(w-1)*7)),W:ad,kc:w<=8?kLat(ad,+S.np,w):kAd(ad,m,ster,act)*bf,sug:w<=8?3:2,now:Math.floor(dl/7)+1===w||(w===9&&dl>=56)});return{h:"w",r:R}}
  var F=fine(ad),x,A=[];for(x=2;x<=6;x+=.5)A.push(x);for(x=7;x<=Math.max(12,F);x++)if(x<=12||x===15||x===18||x===F)A.push(x);
  A.forEach(function(v){var W=ad*frac(eq(v,ad));R.push({m:v,lab:dec(v)+T.mo,W:W,kc:(pupOf(v,ad)?kPup(W,ad):kAd(W,v,ster,act))*bf,sug:v<3?4:v<6?3:2})});
  R.push({m:Math.max(18,F+3),lab:T.adult,W:ad,kc:kAd(ad,24,ster,act)*bf,sug:2},{m:96,lab:T.senior,W:ad,kc:kAd(ad,96,ster,act)*bf,sug:2});
  R.forEach(function(r,i){var nx=R[i+1];r.now=m>=r.m-.25&&(!nx||m<nx.m-.25)});return{h:"m",r:R}}
 return{S:S,T:T,L:L,render:render,need:need,rows:rows,ageM:ageM}}
window.DPDCane={make:make,fine:fine,frac:frac,eq:eq};
})();
