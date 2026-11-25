/* Plantañ.ia : traduction, potager, verger, rapport, clôtures, primes, budget, outils (v4 à v14) */
/* ================= Traduction v4 : segments, nombres, API du navigateur ================= */
const TRX={nl:new Map(),en:new Map()};
const TR_NUM=/\d+(?:[,.   ]\d+)*/g;
const TR_SEPS=[' · ',' — ',' : ',' ; ','. ',', ',' / ',' et '];
let TR_LAT=null;const trLat=()=>TR_LAT||(TR_LAT=new Set([...PL.map(p=>p.l),...(typeof PONDPL!=='undefined'?PONDPL.flatMap(z=>z.sp.map(x=>x[1])):[]),...(typeof VEG!=='undefined'?VEG.map(v=>v.l):[]),...(typeof ORCH!=='undefined'?Object.values(ORCH).flatMap(o=>o.l.split(', ')):[]),...(typeof HSP!=='undefined'?HSP.map(h=>h[1]):[])]));
const TR_REV={nl:new Set(),en:new Set()};
function trAdd(rows){for(const r of rows){const [fr,nl,en]=r;if(nl){TRX.nl.set(fr,nl);TR_REV.nl.add(nl)}if(en){TRX.en.set(fr,en);TR_REV.en.add(en)}if(/#/.test(fr)){}}}
function trLeafCore(k,lang){
  const M=TRX[lang];if(M.has(k))return M.get(k);const t=I18M.get(k);if(t&&t[lang])return t[lang];
  const nums=k.match(TR_NUM);if(nums){const key=k.replace(TR_NUM,'#');const v=M.get(key)||(I18M.get(key)||{})[lang];if(v){let i=0;return v.replace(/#/g,()=>nums[i++]??'')}}
  return null}
const trNeutral=k=>!k||/^[\d\s.,%°×–\-+/≈≥≤<>=:;()mLlkgcmhj²³#·●○★⚙'’'"«»!?]*$/.test(k)||/^'[^']+'$/.test(k)||/^[IVX–, ]+$/.test(k)||trLat().has(k)||/^[A-Z][a-z]+ [a-z-]+( [a-z.]+)*$/.test(k)&&trLat().has(k.split(' ').slice(0,2).join(' '));
function trSeg(s,lang,d=0){
  if(!s)return s;{const w=trLeafCore(s.trim(),lang);if(w!=null)return s.replace(s.trim(),w)}const m=s.match(/^([\s.,;:!?«»"“”(…—–]*)([\s\S]*?)([\s.,;:!?«»"“”)…]*)$/);let pre=m[1],core=m[2],suf=m[3];
  if(!core)return s;
  if(core.split('(').length>core.split(')').length&&suf[0]===')'){core+=')';suf=suf.slice(1)}
  const direct=trLeafCore(core,lang);if(direct!=null)return pre+direct+suf;
  if(TR_REV[lang].has(core)||TR_REV[lang].has(core.replace(TR_NUM,'#')))return s;
  if(/^[A-Z0-9]{1,6}$/.test(core))return s;
  if(trNeutral(core))return s;
  for(let i=d;i<TR_SEPS.length;i++){const sp=TR_SEPS[i];if((sp===', '||sp===' / ')&&core.length>60||sp===' et '&&core.length>40)continue;const rx=sp==='. '?/(?<=[a-zà-ÿ)%»\d])\. (?=[A-ZÀ-Ý«])/:null;if(rx?rx.test(core):core.includes(sp)){const parts=(rx?core.split(rx):core.split(sp)).map(p=>trSeg(p,lang,i));if(parts.some(p=>p==null))return null;return pre+parts.join(sp===' et '?{nl:' en ',en:' and '}[lang]:sp)+suf}}
  const pm=core.match(/^(.+?) \((.+)\)$/);if(pm){const a=trSeg(pm[1],lang,TR_SEPS.length),b=trSeg(pm[2],lang,0);if(a!=null&&b!=null)return pre+a+' ('+b+')'+suf}
  const nm=core.match(/^(\d[\d,.\u202f ]*|#) (.+)$/);if(nm){const a=trSeg(nm[2],lang,0);if(a!=null)return pre+nm[1]+' '+a+suf}
  const qm=core.match(/^(.+?) ('[^']+'.*)$/);if(qm){const a=trSeg(qm[1],lang,TR_SEPS.length);if(a!=null)return pre+a+' '+qm[2]+suf}
  if(window.__trMiss)window.__trMiss.add(core);return null}
function trText(raw,lang){const k=raw.trim();if(!k)return raw;const t=trSeg(k,lang);return t==null?null:raw.replace(k,t)}
/* API de traduction intégrée au navigateur (Chrome récent), pour les textes longs */
const TR_API={nl:null,en:null},TR_CACHE={nl:new Map(),en:new Map()};let trApiState='';
try{for(const l of ['nl','en']){const c=JSON.parse(localStorage.getItem('plantania:trc:'+l)||'[]');c.forEach(([a,b])=>TR_CACHE[l].set(a,b))}}catch(e){}
async function trApiGet(lang){if(TR_API[lang])return TR_API[lang];if(!('Translator' in self))return null;
  try{const av=await Translator.availability({sourceLanguage:'fr',targetLanguage:lang});if(av==='unavailable')return null;TR_API[lang]=await Translator.create({sourceLanguage:'fr',targetLanguage:lang});return TR_API[lang]}catch(e){return null}}
let trQ=new Set(),trBusy=false,trSaveT=0;
function trQueue(n){trQ.add(n);if(!trBusy)setTimeout(trRun,50)}
async function trRun(){if(trBusy)return;trBusy=true;const lang=LANG;try{const api=await trApiGet(lang);trApiState=api?'api':'none';syncLangNote();if(!api){trQ.clear();return}
  while(trQ.size&&LANG===lang){const n=[...trQ][0];trQ.delete(n);if(!n.isConnected||n.__fr==null)continue;const src=n.__fr.trim();if(!src)continue;
    let t=TR_CACHE[lang].get(src);if(t==null){try{t=await api.translate(src)}catch(e){t=null}if(t){TR_CACHE[lang].set(src,t);clearTimeout(trSaveT);trSaveT=setTimeout(trSave,1500)}}
    if(t&&LANG===lang){n.nodeValue=n.__fr.replace(src,t);n.__tr=n.nodeValue}}}finally{trBusy=false}}
function trSave(){try{for(const l of ['nl','en']){const a=[...TR_CACHE[l]].slice(-1500);localStorage.setItem('plantania:trc:'+l,JSON.stringify(a))}}catch(e){}}
function syncLangNote(){const n=$('#langnote');if(!n)return;n.hidden=LANG==='fr';if(LANG==='fr')return;
  n.textContent=trApiState==='api'?{nl:'Vertaald. Lange adviesteksten worden door de vertaalfunctie van uw browser vertaald (kan enkele seconden duren).',en:'Translated. Longer advice texts are translated by your browser’s built-in translator (may take a few seconds).'}[LANG]
   :{nl:'Interface en plantnamen vertaald. Sommige uitgebreide adviezen blijven in het Frans: gebruik de vertaalfunctie van uw browser (rechtermuisklik → Vertalen naar het Nederlands).',en:'Interface and plant names translated. Some detailed advice remains in French: use your browser’s translate function (right-click → Translate to English).'}[LANG]}

const TR_MEMO={nl:new Map(),en:new Map()};window.__trReset=()=>{TR_MEMO.nl.clear();TR_MEMO.en.clear()};
{const el=document.getElementById('trdict');if(el)trAdd(el.textContent.split('\n').map(l=>l.split('\t')).filter(r=>r.length>=3))}
function trMemo(src,lang){const M=TR_MEMO[lang];if(M.has(src))return M.get(src);const t=trText(src,lang);M.set(src,t);return t}
function trNode(n){
  if(n.__fr==null){if(LANG==='fr'||!n.nodeValue.trim())return;n.__fr=n.nodeValue}
  else if(n.nodeValue!==n.__fr&&n.nodeValue!==n.__tr)n.__fr=n.nodeValue;
  const src=n.__fr;if(LANG==='fr'){if(n.nodeValue!==src)n.nodeValue=src;n.__tr=src;return}
  const t=trMemo(src,LANG);if(t!=null){if(n.nodeValue!==t)n.nodeValue=t;n.__tr=t}else{const c=TR_CACHE[LANG].get(src.trim());const v=c?src.replace(src.trim(),c):src;if(n.nodeValue!==v)n.nodeValue=v;n.__tr=v;if(!c&&/[a-zà-ÿ]{4,}/i.test(src))trQueue(n)}}
function trAttr(el){for(const a of ['placeholder','aria-label','title']){const v=el.getAttribute(a);if(v==null)continue;const key='__fr_'+a;if(el[key]==null){if(LANG==='fr')continue;el[key]=v}else if(v!==el[key]&&v!==el['__tr_'+a])el[key]=v;const o=el[key],t=LANG==='fr'?o:(trMemo(o,LANG)??o);el['__tr_'+a]=t;if(v!==t)el.setAttribute(a,t)}}
function translate(root){root=root||document.body;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode&&/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;while(n=w.nextNode())trNode(n);root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(trAttr)}
let trPending=false;
new MutationObserver(()=>{if(LANG==='fr'||trPending)return;trPending=true;requestAnimationFrame(()=>{trPending=false;translate()})}).observe(document.body,{childList:true,subtree:true});
function setLang(l){LANG=l;try{localStorage.setItem('plantania:lang',l)}catch(e){}document.documentElement.lang=l==='nl'?'nl-BE':l==='en'?'en':'fr-BE';$('#lang').value=l;trQ.clear();translate();syncLangNote();if(l!=='fr')setTimeout(trRun,300)}
$('#lang').addEventListener('change',e=>setLang(e.target.value));

/* ---------- Onglets cumulables ---------- */
const TABS=[...document.querySelectorAll('#tabs [data-tab]')].map(b=>b.dataset.tab);
let oneTab=false;
function applyTabs(sel){
  TABS.forEach(id=>{const on=sel.includes(id);$('#'+id).classList.toggle('tabhide',!on);document.querySelector(`#tabs [data-tab="${id}"]`).setAttribute('aria-pressed',String(on))});
  $('#tabOne').setAttribute('aria-pressed',String(oneTab));
  try{localStorage.setItem('plantania:tabs',JSON.stringify(sel))}catch(e){}
  if(sel.includes('carte')&&map.invalidateSize)setTimeout(()=>map.invalidateSize(),50);
}
const curTabs=()=>TABS.filter(id=>!$('#'+id).classList.contains('tabhide'));
function showTab(id,scroll){let sel=curTabs();if(!sel.includes(id))sel=oneTab?[id]:[...sel,id];applyTabs(sel);if(scroll)$('#'+id).scrollIntoView({behavior:'smooth'})}
$('#tabs').addEventListener('click',e=>{
  const b=e.target.closest('[data-tab]');
  if(b){const id=b.dataset.tab;let sel=curTabs();if(oneTab)sel=[id];else sel=sel.includes(id)?sel.filter(x=>x!==id):[...sel,id];if(!sel.length)sel=[id];applyTabs(sel);if(sel.includes(id))$('#'+id).scrollIntoView({behavior:'smooth',block:'start'});return}
  if(e.target.id==='tabAll'){oneTab=false;applyTabs(TABS.slice())}
  if(e.target.id==='tabOne'){oneTab=!oneTab;if(oneTab){const c=curTabs();applyTabs([c[0]||'carte'])}else applyTabs(curTabs())}
});
let tabs0=['carte'];try{const t=JSON.parse(localStorage.getItem('plantania:tabs'));if(Array.isArray(t)&&t.length)tabs0=t.filter(x=>TABS.includes(x))}catch(e){}
applyTabs(tabs0.length?tabs0:['carte']);
/* ---------- Assistant de projet (intégré ou Claude) ---------- */
const AS={msgs:[],busy:false};
const AST={mode:'local',key:'',proxy:'',model:'claude-sonnet-5-5'};
try{Object.assign(AST,JSON.parse(localStorage.getItem('plantania:ai')||'{}'))}catch(e){}
const saveAST=()=>{try{localStorage.setItem('plantania:ai',JSON.stringify(AST))}catch(e){}};
function siteContext(){
  const c=S.clim,so=soilNow(),k=cond(),r=S.lastCompo;
  return {site:S.lat!=null?{lat:+S.lat.toFixed(5),lon:+S.lon.toFixed(5),parcelle:S.parcel?S.parcel.id:null}:null,
    climat:c?{pluie_mm:Math.round(c.pYear),t_moy:+c.tYear.toFixed(1),zone_rusticite:usda(c.extMin),min_annuel_moyen:+c.extMin.toFixed(1),derniere_gelee:doyTxt(c.lastFrost),bilan_ete_mm:Math.round(c.summerBal)}:null,
    sol:so?{texture:so.cls,drainage:so.dr?BDR[so.dr]:null,ph:so.ph||null,source:so.src}:null,
    conditions:{exposition:EXL[k.expo],humidite:WL[k.eau],texture:SL[k.sol],ph:k.ph},
    soleil_h_saison:S.stats?+S.stats.grow.toFixed(1):null,
    composition:r?{style:r.key,surface:r.A,plantes:r.rows.map(x=>x.p.n+' ×'+x.qty)}:null,
    elements:{obstacles:S.shapes.length+S.obs.length,haies:S.hedges.length,fruitiers:S.fruits.length,vignes:S.vines.length,pelouses:S.lawns.length,pieces_eau:S.ponds.length,talus:S.taluses.length},
    styles_disponibles:Object.fromEntries(Object.entries(STY).map(([k2,v])=>[k2,v.l])),
    plantes_disponibles:PL.map(p=>p.l)};
}
const AI_SYSTEM=`Tu es l'assistant de Plantañ.ia, une application belge d'agronomie et d'architecture du paysage pour particuliers. Tu aides la personne à décrire et affiner son projet de jardin à partir des données du site fournies (climat, sol, exposition, parcelle). Réponds dans la langue de la personne, de façon concrète et concise (8 à 15 lignes maximum), en respectant les principes agronomiques, la législation belge (distances de plantation, Code civil art. 3.133) et la biodiversité (espèces indigènes, aucune espèce exotique envahissante). Si une information manque (surface, usage, entretien souhaité, enfants ou animaux, budget), pose au plus 2 questions.
Termine TOUJOURS ta réponse par une ligne qui commence exactement par ACTIONS: suivie d'un objet JSON sur une seule ligne, avec seulement les clés utiles parmi : "style" (une clé de styles_disponibles), "surface" (m², nombre), "couleurs" (liste parmi blanc, rose, rouge, orange, jaune, bleu, violet, blond, vert), "hauteur_max" (m), "exposition" ("s","m","o"), "humidite" ("d","f","h"), "pelouse" ("fam","orn","eco","golf"), "onglets" (liste parmi carte, climat, sol, soleil, plantes, massif, amenagements, machines, export). Exemple : ACTIONS: {"style":"eco","surface":20,"couleurs":["bleu","blanc"]}`;
function applyActions(a){
  const done=[];if(!a||typeof a!=='object')return done;
  if(a.style&&STY[a.style]){S.style=a.style;document.querySelectorAll('.sty').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.s===a.style)));done.push('style « '+STY[a.style].l+' »')}
  if(a.surface>0&&!S.bed){$('#surf').value=Math.round(a.surface);done.push('surface '+Math.round(a.surface)+' m²')}
  if(Array.isArray(a.couleurs)){F.colors=new Set(a.couleurs.filter(c=>COL[c]));document.querySelectorAll('#fColors button').forEach(b=>b.setAttribute('aria-pressed',String(F.colors.has(b.dataset.c))));if(F.colors.size)done.push('couleurs : '+[...F.colors].map(c=>COL[c][0].toLowerCase()).join(', '))}
  if(a.hauteur_max>0){const opts=[0.3,0.5,1,1.5,2,6,99],v=opts.find(o=>o>=a.hauteur_max)||99;F.hmax=v;$('#fHmax').value=String(v);done.push('hauteur max. '+(v>=99?'libre':v+' m'))}
  if(a.exposition&&EXL[a.exposition]){S.ovr.expo=a.exposition;done.push('exposition : '+EXL[a.exposition].toLowerCase())}
  if(a.humidite&&WL[a.humidite]){S.ovr.eau=a.humidite;done.push('sol '+WL[a.humidite].toLowerCase())}
  if(a.pelouse&&LUSE[a.pelouse]){S.lawnUse=a.pelouse;done.push('pelouse : '+LUSE[a.pelouse].toLowerCase())}
  refreshPlants(true);
  const tabs=Array.isArray(a.onglets)?a.onglets.filter(t=>TABS.includes(t)):[];if(!tabs.length&&done.length)tabs.push('massif','plantes');
  if(tabs.length){const cur=curTabs();applyTabs(oneTab?[tabs[0]]:[...new Set([...cur,...tabs])])}
  return done;
}
function localAssistant(t){
  const x=' '+t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')+' ',a={},notes=[],has=(...w)=>w.some(k=>x.includes(k));
  const SR=[['tal',['talus','pente','helling']],['viv',['potager','comestible','vivrier','aromatique','petits fruits','moestuin','eetba','edible','vegetable']],['eco',['biodiversite','ecolog','abeille','papillon','oiseau','pollinis','faune','hérisson','herisson','wildlife','bijen']],['nw',['new wave','oudolf','naturaliste','prairie de vivaces']],['fr',['francais','formel','symetri','buis','formal']],['jap','japonais,zen,japan'.split(',')],['med',['mediterran','jardin sec','sans arrosage','gravier','secheresse','droogte','dry garden']],['gra',['graphique','contemporain','moderne','minimal','design']],['ang',['anglais','cottage','romantique','english','engelse']],['nat',['sous-bois','sauvage','naturel','bos']]];
  for(const [k,ws] of SR)if(has(...ws)){a.style=k;break}
  const m=x.match(/(\d+(?:[.,]\d+)?)\s*(m2|m²|metres? carres|vierkante)/);if(m)a.surface=parseFloat(m[1].replace(',','.'));
  const CW={blanc:['blanc','white','wit'],rose:['rose','pink','roze'],rouge:['rouge','red','rood'],orange:['orange','oranje'],jaune:['jaune','yellow','geel'],bleu:['bleu','blue','blauw'],violet:['violet','mauve','purple','paars','lilas']};
  const cs=Object.entries(CW).filter(([k,ws])=>ws.some(w=>new RegExp('\\b'+w).test(x))).map(([k])=>k);if(cs.length)a.couleurs=cs;
  if(has('mi-ombre','mi ombre','half shade','halfschaduw'))a.exposition='m';else if(has('ombre','ombrage','shade','schaduw'))a.exposition='o';else if(has('plein soleil','ensoleille','full sun','volle zon'))a.exposition='s';
  if(has('humide','mouille','marecag','wet ','nat '))a.humidite='h';
  const hm=x.match(/(?:pas plus de|maximum|max\.?|moins de|sous)\s*(\d+(?:[.,]\d+)?)\s*(cm|m)\b/);if(hm){let v=parseFloat(hm[1].replace(',','.'));if(hm[2]==='cm')v/=100;a.hauteur_max=v}else if(has('bas ','basse','petites plantes','low '))a.hauteur_max=0.5;
  if(has('enfant','jeux','kinderen','children','kids'))a.pelouse='fam';if(has('golf'))a.pelouse='golf';if(has('prairie fleurie','bloemenweide','wildflower'))a.pelouse='eco';
  const tabs=[];
  if(has('haie','haag','hedge'))notes.push('Pour la haie : choisissez « Haie à planter (ligne) » dans « Ajouter sur la carte » et tracez-la ; je calculerai la longueur, le nombre de plants et la distance à la limite.'),tabs.push('amenagements');
  if(has('mare','etang','bassin','piece d','vijver','pond'))notes.push('Pour la pièce d’eau : dessinez son contour avec « Pièce d’eau (forme) » ; la solution d’étanchéité la plus écologique sera choisie selon votre sol.'),tabs.push('amenagements');
  if(has('fruitier','pommier','poirier','verger','cerisier','fruit tree','fruitbo'))notes.push('Pour les fruitiers : placez chaque arbre avec « Arbre fruitier (point) » ; l’espacement et la distance légale sont vérifiés.'),tabs.push('amenagements');
  if(has('vigne','raisin','wijn','grape'))notes.push('Pour la vigne : tracez la ligne du palissage avec « Vigne palissée ».'),tabs.push('amenagements');
  if(has('pelouse','gazon','gras','lawn'))notes.push('Pour la pelouse : dessinez-la ou indiquez sa surface dans « Haies, fruitiers, eau, talus » ; les types de gazon sont classés selon votre site.'),tabs.push('amenagements');
  if(has('talus','pente','helling','slope'))notes.push('Pour le talus : dessinez-le avec « Talus existant » ; la pente est estimée à partir du relief LiDAR.'),tabs.push('amenagements');
  if(has('chien','chat','enfant','animaux','hond','kinder','dog','kids'))notes.push('Enfants ou animaux : évitez l’if, la digitale, les euphorbes et le lierre (baies) près des zones de jeu ; préférez une mare avec berge en pente douce et une clôture basse.');
  if(has('peu d\'entretien','sans entretien','facile','weinig onderhoud','low maintenance'))notes.push('Peu d’entretien : privilégiez les styles « naturel », « écologique » ou « jardin sec », des couvre-sols denses et un paillage épais.');
  if(tabs.length)a.onglets=['massif',...tabs];
  const done=applyActions(a);
  let r=done.length?'J’ai réglé : '+done.join(' ; ')+'.':'Je n’ai pas reconnu de réglage précis dans votre description.';
  if(!a.style)r+=' Quel style vous attire le plus : anglais, naturel, écologique, potager, japonais, jardin sec, graphique ou à la française ?';
  if(!a.surface&&!S.bed)r+=' Quelle surface voulez-vous planter ? Vous pouvez aussi dessiner le massif sur la carte.';
  if(notes.length)r+='\n\n'+notes.map(n=>'• '+n).join('\n');
  r+='\n\nAssistant intégré (sans IA). Pour des conseils rédigés et personnalisés, activez Claude dans les réglages ⚙.';
  return r;
}
async function claudeAssistant(){
  const ctx=siteContext(),hist=AS.msgs.filter(m=>m.role==='user'||m.role==='assistant').slice(-10).map(m=>({role:m.role,content:m.text}));
  hist[hist.length-1]={role:'user',content:'Données du site et du projet (JSON) : '+JSON.stringify(ctx)+'\n\nMessage : '+hist[hist.length-1].content};
  const body={model:AST.model||'claude-sonnet-5-5',max_tokens:1200,system:AI_SYSTEM,messages:hist};
  let r;
  if(AST.mode==='proxy'){if(!AST.proxy)throw new Error('adresse du serveur relais manquante');r=await fetch(AST.proxy,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}
  else{if(!AST.key)throw new Error('clé API manquante');r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':AST.key,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)})}
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));
  const text=(j.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim();
  const mm=text.match(/ACTIONS:\s*(\{.*\})\s*$/s);let acts=null,clean=text;
  if(mm){try{acts=JSON.parse(mm[1])}catch(e){}clean=text.slice(0,mm.index).trim()}
  const done=applyActions(acts);
  return clean+(done.length?'\n\n✔ Réglé dans la page : '+done.join(' ; ')+'.':'');
}
function renderChat(){
  $('#aiLog').innerHTML=AS.msgs.map(m=>`<div class="msg ${m.role}">${esc(m.text).replace(/\n/g,'<br>')}</div>`).join('')+(AS.busy?'<div class="msg assistant typing">…</div>':'');
  $('#aiLog').scrollTop=$('#aiLog').scrollHeight;
  $('#aiMode').textContent=AST.mode==='local'?'Assistant intégré (sans IA)':AST.mode==='key'?'Claude (votre clé API)':'Claude (serveur relais)';
}
async function sendChat(){
  const t=$('#aiIn').value.trim();if(!t||AS.busy)return;$('#aiIn').value='';
  AS.msgs.push({role:'user',text:t});AS.busy=true;renderChat();
  let out;
  try{out=AST.mode==='local'?localAssistant(t):await claudeAssistant()}
  catch(e){out='Je n’ai pas pu joindre Claude ('+e.message+'). Je passe à l’assistant intégré.\n\n'+localAssistant(t)}
  AS.busy=false;AS.msgs.push({role:'assistant',text:out});renderChat();
}
$('#aiOpen').addEventListener('click',()=>{const p=$('#aiPanel');p.hidden=!p.hidden;$('#aiOpen').setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden){if(!AS.msgs.length){AS.msgs.push({role:'assistant',text:'Bonjour ! Décrivez votre projet en quelques phrases : surface, style souhaité, couleurs, usage (enfants, potager, biodiversité…), entretien que vous acceptez, et ce que vous aimeriez ajouter (haie, mare, fruitiers, pelouse…). Je règle la page en conséquence.'})}renderChat();$('#aiIn').focus()}});
$('#aiClose').addEventListener('click',()=>{$('#aiPanel').hidden=true;$('#aiOpen').setAttribute('aria-expanded','false')});
$('#aiForm').addEventListener('submit',e=>{e.preventDefault();sendChat()});
$('#aiIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat()}});
$('#aiSetBtn').addEventListener('click',()=>{const s=$('#aiSet');s.hidden=!s.hidden;$('#aiSelMode').value=AST.mode;$('#aiKey').value=AST.key;$('#aiProxy').value=AST.proxy;$('#aiModel').value=AST.model;$('#aiKeyRow').hidden=AST.mode!=='key';$('#aiProxyRow').hidden=AST.mode!=='proxy'});
$('#aiSelMode').addEventListener('change',e=>{$('#aiKeyRow').hidden=e.target.value!=='key';$('#aiProxyRow').hidden=e.target.value!=='proxy'});
$('#aiSave').addEventListener('click',()=>{AST.mode=$('#aiSelMode').value;AST.key=$('#aiKey').value.trim();AST.proxy=$('#aiProxy').value.trim();AST.model=$('#aiModel').value.trim()||'claude-sonnet-5-5';saveAST();$('#aiSet').hidden=true;renderChat()});
$('#aiForget').addEventListener('click',()=>{AST.key='';$('#aiKey').value='';saveAST()});

/* ---------- Professionnels et achats ---------- */
/* PARTENAIRES : complétez ici vos liens affiliés plus tard. {q} = recherche, {cp} = code postal, {commune} = commune.
   Laissez url vide pour utiliser la recherche locale par défaut. */
const PARTNERS={
  pros:[],                                   // ex. {name:'Plateforme de devis X',url:'https://exemple.be/devis?cp={cp}&ref=plantania',region:'all'}
  shops:{plantes:'',indigenes:'',fournitures:'',materiaux:'',outillage:'',location:'',eau:''}   // ex. plantes:'https://boutique.be/recherche?q={q}&aff=plantania'
};
const SHOPCAT={plantes:'Jardinerie ou pépinière',indigenes:'Pépinière de plantes indigènes',fournitures:'Jardinerie (terreau, compost, paillage, engrais)',materiaux:'Négoce de matériaux (gravier, sable, argile)',outillage:'Magasin de bricolage et jardinage (outils, machines)',location:'Location de matériel (mini-pelle, broyeur)',eau:'Jardinerie aquatique (plantes de mare)'};
const SHOPQ={plantes:'pépinière',indigenes:'pépinière plantes indigènes',fournitures:'jardinerie',materiaux:'négoce matériaux construction',outillage:'magasin bricolage jardin',location:'location matériel mini-pelle',eau:'jardinerie aquatique plantes de mare'};
let PLACE={commune:'',cp:'',region:''};
async function loadPlace(lat,lon){
  S.devisDirty=false;PLACE={commune:'',cp:'',region:inBox(BXL,lat,lon)?'Bruxelles':inBox(BE,lat,lon)?'Belgique':''};renderPros();
  try{const j=await getJSON(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=fr&zoom=14`,10000),a=j.address||{};
    if(S.lat!==lat)return;PLACE={commune:a.city||a.town||a.village||a.municipality||a.suburb||'',cp:a.postcode||'',region:a.state||PLACE.region};renderPros()}catch(e){}
}
const fill=(u,q)=>u.replace('{q}',encodeURIComponent(q)).replace('{cp}',encodeURIComponent(PLACE.cp)).replace('{commune}',encodeURIComponent(PLACE.commune));
const near=q=>`${q} ${PLACE.commune||PLACE.cp||(S.lat!=null?S.lat.toFixed(3)+','+S.lon.toFixed(3):'')}`.trim();
const mapsUrl=q=>`https://www.google.com/maps/search/${encodeURIComponent(near(q))}`;
const osmUrl=q=>`https://www.openstreetmap.org/search?query=${encodeURIComponent(near(q))}`;
function shopLink(cat,q){const u=PARTNERS.shops[cat];return u?fill(u,q||SHOPQ[cat]):mapsUrl(SHOPQ[cat])}
function supplyCat(name){const n=name.toLowerCase();if(/gravier|sable|argile|bentonite|galet|pierre|déblais/.test(n))return'materiaux';if(/mini-pelle|location/.test(n))return'location';if(/tuteur|fil |piquet|agrafe|bâche|epdm|natte|géotextile|toile/.test(n))return'fournitures';return'fournitures'}
function projectSummary(){
  const L=[],r=S.lastCompo,w=[];
  if(r)w.push(`la création d’un massif de plantation (${r.st.l.toLowerCase()}, environ ${nf(r.A)} m²)`);
  if(S.hedges.length)w.push(`la plantation ${S.hedges.length>1?'de '+S.hedges.length+' haies':'d’une haie'} (${nf(S.hedges.reduce((t,h)=>t+lenLL(h.pts),0))} m au total)`);
  {const nf_=S.fruits.filter(f=>!f.orch).length;if(nf_)w.push(`la plantation de ${nf_} arbre${nf_>1?'s':''} fruitier${nf_>1?'s':''}`)}
  if(S.vines.length)w.push('la pose d’un palissage et la plantation d’une vigne');
  if(lawnArea())w.push(`l’installation d’une pelouse (environ ${nf(lawnArea())} m²)`);
  if(S.ponds.length)w.push('la création d’une mare naturelle');
  if(S.taluses.length)w.push('la stabilisation et la plantation d’un talus');
  if(S.boxes&&S.boxes.length)w.push(`la fourniture et la plantation de jardinières (${S.boxes.length} emplacement${S.boxes.length>1?'s':''})`);
  if(S.potagers&&(S.potagers.length||S.veg.touched))w.push(`l’aménagement d’un potager ${S.veg.mode==='bac'?'en bacs':S.veg.mode==='serre'?'sous serre':'en pleine terre'}`);
  if(S.orchards&&(S.orchards.length||S.orch.touched)){const n=orchPlan().trees.length;if(n)w.push(`la plantation d’un verger de ${n} arbre${n>1?'s':''} fruitier${n>1?'s':''}`)}
  L.push('Madame, Monsieur,','');
  L.push('Je souhaiterais faire réaliser des travaux d’aménagement dans mon jardin et je vous serais reconnaissant(e) de bien vouloir me faire parvenir un devis.','');
  if(w.length){L.push('Les travaux envisagés comprennent :');w.forEach(x=>L.push('• '+x[0].toUpperCase()+x.slice(1)+'.'));L.push('')}
  L.push('Vous trouverez en pièce jointe le rapport détaillé de mon projet : plan de plantation, palette végétale, quantités de plantes et de fournitures, et principes d’entretien. Je reste bien entendu ouvert(e) à vos conseils et à vos propositions d’adaptation.','');
  L.push('Je me tiens à votre disposition pour convenir d’une visite sur place à votre meilleure convenance.','');
  L.push('Je vous remercie par avance pour votre attention et vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.','');
  L.push(CLI.name||'');
  return L.join('\n').trim();
}
function renderPros(){
  const box=$('#prosBox');if(!box)return;
  const keepTxt=S.devisDirty&&$('#devisTxt')?$('#devisTxt').value:null,keepMail=$('#devisMail')?$('#devisMail').value:'';
  const where=PLACE.commune?`${PLACE.commune}${PLACE.cp?' ('+PLACE.cp+')':''}${PLACE.region?', '+PLACE.region:''}`:(S.lat!=null?`${S.lat.toFixed(4)}, ${S.lon.toFixed(4)}`:'—');
  const wal=PLACE.region&&/wallon/i.test(PLACE.region),bxl=/brux|brus/i.test(PLACE.region||'');
  const partners=PARTNERS.pros.filter(p=>p.url&&(p.region==='all'||!p.region||(PLACE.region||'').toLowerCase().includes(p.region.toLowerCase())));
  const r=S.lastCompo,needs=new Set(['plantes','fournitures','outillage']);if(r&&r.rows.some(x=>x.p.st.includes('nat')||x.p.st.includes('eco')))needs.add('indigenes');
  if(S.ponds.length){needs.add('materiaux');needs.add('eau');needs.add('location')}if(S.taluses.length||(r&&r.key==='med'))needs.add('materiaux');
  box.innerHTML=`<p>Lieu du projet : <b>${esc(where)}</b></p>
  <div class="grid2">
   <div class="card xcard"><h4>Trouver un professionnel près de chez vous</h4>
    ${partners.length?`<ul>${partners.map(p=>`<li><a href="${esc(fill(p.url,'paysagiste'))}" target="_blank" rel="noopener sponsored">${esc(p.name)}</a></li>`).join('')}</ul>`:''}
    <ul><li><a href="${esc(mapsUrl('paysagiste'))}" target="_blank" rel="noopener">Paysagistes autour de ${esc(PLACE.commune||'votre site')}</a> (Google Maps) · <a href="${esc(osmUrl('paysagiste'))}" target="_blank" rel="noopener">OpenStreetMap</a></li>
     <li><a href="${esc(mapsUrl('entrepreneur de jardins'))}" target="_blank" rel="noopener">Entrepreneurs de jardins autour de ${esc(PLACE.commune||'votre site')}</a></li>
     <li><a href="${esc(mapsUrl('architecte de jardin'))}" target="_blank" rel="noopener">Architectes de jardin</a> (conception)${S.ponds.length?` · <a href="${esc(mapsUrl('création mare naturelle'))}" target="_blank" rel="noopener">création de mares</a>`:''}${S.taluses.length?` · <a href="${esc(mapsUrl('génie végétal talus'))}" target="_blank" rel="noopener">génie végétal (talus)</a>`:''}</li>
     <li><a href="https://www.bfg-fbep.be" target="_blank" rel="noopener">Fédération belge des entrepreneurs paysagistes (FBEP / BFG)</a></li>
     ${wal||!PLACE.region?'<li><a href="https://www.jejardinelocal.be" target="_blank" rel="noopener">« Je jardine local » (Apaq-W) : entrepreneurs et producteurs wallons</a></li>':''}</ul>
    <p class="note">Avant de signer : demandez au moins trois devis détaillés, vérifiez le numéro d’entreprise sur la <a href="https://kbopub.economie.fgov.be/kbopub/zoeknaamfonetischform.html?lang=fr" target="_blank" rel="noopener">Banque-Carrefour des Entreprises</a> et demandez une attestation d’assurance responsabilité civile.</p></div>
   <div class="card xcard"><h4>Acheter les fournitures dans votre région</h4>
    <ul>${[...needs].map(k=>`<li><a href="${esc(shopLink(k))}" target="_blank" rel="noopener${PARTNERS.shops[k]?' sponsored':''}">${esc(SHOPCAT[k])}</a></li>`).join('')}</ul>
    <ul><li><a href="https://www.ecoconso.be" target="_blank" rel="noopener">Écoconso : liste de pépinières de plantes indigènes ou bio en Belgique</a></li>
     ${wal||!PLACE.region?'<li><a href="https://yesweplant.wallonie.be" target="_blank" rel="noopener">Yes We Plant (Wallonie) : subventions pour planter haies, vergers et alignements</a></li>':''}
     <li>Compost : renseignez-vous auprès de votre parc à conteneurs ou de votre intercommunale de gestion des déchets, qui en proposent souvent à prix réduit.</li></ul>
    <p class="note">${Object.values(PARTNERS.shops).some(Boolean)?'Certains liens sont des liens partenaires : Plantañ.ia peut percevoir une commission, sans surcoût pour vous.':'Les recherches s’ouvrent sur une carte, autour de votre lieu de projet.'}</p></div>
  </div>
  <h4>Demande de devis prête à envoyer</h4>
  <p class="note">« Envoyer avec le rapport » joint le rapport Word à votre e-mail quand l’appareil le permet (téléphone, tablette, Windows, Mac) ; sinon, le rapport est téléchargé et votre messagerie s’ouvre : il suffit d’y glisser le fichier.</p>
  <div class="chips"><button type="button" id="devisPdf">Télécharger le rapport PDF</button><button type="button" id="devisDoc">Télécharger le rapport Word</button></div>
  <textarea id="devisTxt" rows="12" class="devis">${esc(projectSummary())}</textarea>
  <div class="crow"><label>Adresse e-mail du professionnel<input type="email" id="devisMail" placeholder="contact@entreprise.be" style="width:16em"></label><button type="button" class="pri" id="devisSend">Envoyer avec le rapport</button><button type="button" id="devisCopy">Copier la demande</button><a class="btnlink" id="devisMailto" href="#">Ouvrir ma messagerie sans le rapport</a><span class="copied" id="devisMsg" aria-live="polite"></span></div>
  <p class="note">Si votre messagerie ne s’ouvre pas, copiez le texte et collez-le dans un e-mail ou dans le formulaire de contact du professionnel. N’oubliez pas d’y joindre le rapport PDF ou Word.</p>`;
  if(keepTxt!=null)$('#devisTxt').value=keepTxt;$('#devisMail').value=keepMail;
  $('#devisTxt').addEventListener('input',()=>{S.devisDirty=true});
  const upd=()=>{const m=$('#devisMail').value.trim();$('#devisMailto').href=`mailto:${m.replace(/[^\w.@+-]/g,'')}?subject=${encodeURIComponent('Demande de devis — aménagement de jardin')}&body=${encodeURIComponent($('#devisTxt').value.slice(0,1800))}`};
  $('#devisMail').addEventListener('input',upd);$('#devisTxt').addEventListener('input',upd);upd();
  $('#devisPdf').addEventListener('click',()=>$('#exPdf').click());$('#devisDoc').addEventListener('click',()=>$('#exDoc').click());
  $('#devisCopy').addEventListener('click',()=>{navigator.clipboard.writeText($('#devisTxt').value).then(()=>$('#devisMsg').textContent='Demande copiée.',()=>{$('#devisTxt').select();$('#devisMsg').textContent='Sélectionnée : copiez avec Ctrl+C.'})});
}

/* ---------- Rapport mis en page (style palette végétale) ---------- */
const CLI={name:'',addr:'',city:'',title:''};
try{Object.assign(CLI,JSON.parse(localStorage.getItem('plantania:client')||'{}'))}catch(e){}
[['cliName','name'],['cliAddr','addr'],['cliCity','city'],['cliTitle','title']].forEach(([id,k])=>{const el=$('#'+id);if(!el)return;el.value=CLI[k]||'';el.addEventListener('input',()=>{CLI[k]=el.value.slice(0,80);try{localStorage.setItem('plantania:client',JSON.stringify(CLI))}catch(e){}if(k==='name'&&!S.devisDirty&&typeof renderPros==='function')renderPros()})});
window.__plantania={collectReport:()=>collectReport(),reportHtml:R=>reportHtml(R)};
const ROM=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
function romMonths(f){if(!f||!f.length)return'';const s=[...f].sort((a,b)=>a-b),out=[];let a=s[0],b=s[0];for(let i=1;i<=s.length;i++){if(s[i]===b+1){b=s[i];continue}out.push(a===b?ROM[a-1]:ROM[a-1]+'–'+ROM[b-1]);a=b=s[i]}return out.join(', ')}
const cpOf=p=>p.pers?'persistant':'caduc';
async function collectReport(){
  const keep=curTabs();applyTabs(TABS.slice());await new Promise(r=>setTimeout(r,400));
  try{
    const R={date:new Date().toLocaleDateString('fr-BE',{day:'numeric',month:'long',year:'numeric'}),cli:{...CLI},place:{...PLACE}};
    const c=S.clim,so=soilNow(),k=cond(),r=S.lastCompo;
    R.site={kpis:c?[['Pluie annuelle',nf(c.pYear)+' mm'],['Température moyenne',nf(c.tYear,1)+' °C'],['Ensoleillement',c.sunYear==null?'–':nf(c.sunYear)+' h/an'],['Rusticité','zone '+usda(c.extMin)],['Dernière gelée',doyTxt(c.lastFrost)],['Bilan hydrique été',nf(c.summerBal)+' mm']]:[],
      soil:so?[['Texture',so.cls],['Drainage',so.dr?BDR[so.dr]:'–'],['pH',so.ph?nf(so.ph,1):'à mesurer']]:[],
      cond:[['Exposition',EXL[k.expo]],['Humidité du sol',WL[k.eau]],['Sol',SL[k.sol]],['Soleil direct (avril–sept.)',S.stats?nf(S.stats.grow,1)+' h/jour':'–']],
      ombro:await svgToPng($('#ombro svg')),sunpath:await svgToPng($('#sunpath svg')),dry:txt($('#drynote')),soilTxt:so?SOILTXT[so.cat]:'',
      parcel:S.parcel?S.parcel.id:''};
    R.compo=r?{style:r.st.l,desc:r.st.d,A:r.A,rows:r.rows}:null;
    R.plan=S.lastLayout?await svgToPng($('#plan svg')):null;
    R.legend=S.lastLayout?S.lastLayout.rows.map((x,i)=>({i:i+1,n:x.p.n,c:speciesColor(x.p)})):[];
    const items=[];
    if(r)r.rows.forEach((x,i)=>items.push({p:x.p,qty:x.qty,num:i+1,src:'massif'}));
    const CAT=[['arbre','ARBRES'],['arbuste','ARBUSTES'],['vivace','PLANTES VIVACES ET COUVRE-SOLS'],['graminee','GRAMINÉES'],['fougere','FOUGÈRES'],['annuelle','ANNUELLES']];
    R.palettes=[];
    for(const [t,title] of CAT){const its=items.filter(x=>x.p.t===t);if(its.length)R.palettes.push({title,items:its})}
    S.hedges.forEach((h,i)=>{const I=hedgeInfo(h);R.palettes.push({title:`HAIE ${S.hedges.length>1?i+1+' ':''}— ${I.T.l.toUpperCase()}`,sub:`${nf(I.len,1)} m · ${nf(I.dens,1)} plants/m · ${I.n} plants`,items:I.mix.map(m=>({p:{n:m.n,l:m.l,f:[],pers:m.pers==='persistant'?1:0},qty:m.qty,cp:m.pers==='persistant'?'P':m.pers==='marcescent'?'M':m.pers==='semi-persistant'?'SP':'C'}))})});
    S.ponds.forEach((p,i)=>{const D=pondInfo(p);R.palettes.push({title:'PIÈCE D’EAU — PLANTES AQUATIQUES',sub:`${nf(D.A,1)} m² · profondeur ${nf(D.dmax,1)} m · ${D.S.t}`,items:D.plants.flatMap(Z=>Z.rows.map(x=>({p:{n:x.n,l:x.l,f:[]},qty:x.q,zone:Z.z})))})});
    S.taluses.forEach((t,i)=>{const V=talusVals(t);if(V.pct==null||!V.area)return;const C=slopeClass(V.pct);if(C.k>=4)return;R.palettes.push({title:'TALUS',sub:`${nf(V.area)} m² · pente ${nf(V.pct)} % (${C.l.toLowerCase()})`,items:talusPlants(V).rows.map(x=>({p:x.p,qty:x.q,zone:x.role}))})});
    if(S.fruits.some(f=>!f.orch))R.palettes.push({title:'ARBRES FRUITIERS',items:S.fruits.filter(f=>!f.orch).map(f=>{const F=fruitInfo(f);return{p:{n:F.fr.n,l:F.fr.l,f:[]},qty:1,zone:F.fo.l+' · '+F.fr.v}})});
    if(typeof v4Palettes==='function')v4Palettes(R);
    for(const pal of R.palettes)for(const it of pal.items){it.photo=await getPhoto(it.p.l)}
    R.checks=S.lastChecks||[];R.supplies=S.lastSupplies||[];
    R.cal=[...document.querySelectorAll('#cal .mo')].map(m=>({m:m.querySelector('h4').textContent,t:[...m.querySelectorAll('li')].map(li=>li.textContent)}));
    R.extras=[];
    S.hedges.forEach((h,i)=>{const I=hedgeInfo(h);R.extras.push([`Haie ${i+1}`,`${nf(I.len,1)} m, ${I.T.l.toLowerCase()}, ${I.n} plants. ${I.d!=null?'Distance à la limite : '+nf(I.d,1)+' m (minimum '+nf(I.min,1)+' m).':''}`])});
    S.fruits.filter(f=>!f.orch).forEach((f,i)=>{const F=fruitInfo(f);R.extras.push([`${F.fr.n} ${i+1}`,`${F.fo.l}. ${F.warn.length?F.warn.join(' '):'Emplacement adapté.'} Variétés : ${F.fr.v}`])});
    S.vines.forEach((v,i)=>{const V=vineInfo(v);R.extras.push([`Vigne ${i+1}`,`${nf(V.len,1)} m, ${V.n} pieds de ${CEPS[v.cep]}, ${nf(V.wire)} m de fil, ${V.posts} piquets.`])});
    const la=lawnArea();if(la){const t=lawnRank()[0].t;R.extras.push(['Pelouse',`${nf(la)} m² : ${t.n}. ${nf(la*t.dose/1000,1)} kg de semences. ${t.ent}`])}
    S.ponds.forEach((p,i)=>{const D=pondInfo(p);R.extras.push([`Pièce d’eau ${i+1}`,`${D.S.t}. ${D.S.d}`]);R.pond=R.pond||[];R.pond.push(D)});
    S.taluses.forEach((t,i)=>{const V=talusVals(t),C=slopeClass(V.pct);if(V.pct!=null)R.extras.push([`Talus ${i+1}`,`${C.l} : ${nf(V.pct)} %. ${C.tips.join(' ')}`])});
    R.mach=machines();R.sections=typeof v4Sections==='function'?v4Sections():[];
    return R;
  }finally{applyTabs(keep)}
}
const RE=x=>xe(x);
function reportHtml(R){
  const page=(inner,cls)=>`<section class="pg ${cls||''}">${inner}<footer><img src="data:image/png;base64,${LOGO}" alt=""><span>${RE(R.cli.title||'Projet de jardin')} · Plantañ.ia</span></footer></section>`;
  const H=t=>`<h2>${RE(t)}</h2>`;
  const kv=rows=>`<table class="kv">${rows.map(r=>`<tr><th>${RE(r[0])}</th><td>${RE(r[1])}</td></tr>`).join('')}</table>`;
  const tbl=(head,rows)=>`<table class="tb"><thead><tr>${head.map(h=>`<th>${RE(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${RE(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const out=[];
  out.push(`<section class="pg cover"><img class="clogo" src="data:image/png;base64,${LOGO}" alt="Plantañ.ia"><div class="ctitle"><h1>${RE((R.cli.title||'Projet de jardin').toUpperCase())}</h1><p>Rapport de site et palette végétale</p></div>
   <div class="cfoot"><div>Plantañ.ia<br>Rapport généré le ${RE(R.date)}${R.compo?'<br>'+RE(R.compo.style):''}</div><div class="cli">${R.cli.name?RE(R.cli.name)+'<br>':''}${R.cli.addr?RE(R.cli.addr)+'<br>':''}${R.cli.city?RE(R.cli.city):(!R.cli.name&&R.place.commune?RE(R.place.commune):'')}</div></div></section>`);
  out.push(page(`${H('LE SITE')}<div class="cols"><div>${R.site.kpis.length?'<h3>Climat</h3>'+kv(R.site.kpis):''}${R.site.soil.length?'<h3>Sol</h3>'+kv(R.site.soil):''}<h3>Conditions retenues</h3>${kv(R.site.cond)}</div><div>${R.site.ombro?`<img class="fig" src="${R.site.ombro.data}">`:''}<p class="small">${RE(R.site.dry)}</p>${R.site.sunpath?`<img class="fig" src="${R.site.sunpath.data}">`:''}</div></div>`));
  const secPages=(list)=>{for(const sec of list){let cur=sec.intro?`<p class="sub">${RE(sec.intro)}</p>`:'',used=sec.intro?2:0,cont=false;const CAP=17,wt=r=>Math.max(1,Math.ceil(r.join(' ').length/150));
    const flush=()=>{out.push(page(`${H(sec.title+(cont?' (suite)':''))}${cur}`,'secp'));cur='';used=0;cont=true};
    for(const t of sec.tables){let i=0;while(i<t.rows.length){let room=CAP-used-(t.h?2:1),ch=[];while(i+ch.length<t.rows.length&&room-wt(t.rows[i+ch.length])>=0){room-=wt(t.rows[i+ch.length]);ch.push(t.rows[i+ch.length])}
      if(!ch.length){if(used>0){flush();continue}ch=[t.rows[i]]}cur+=(t.h?`<h3>${RE(t.h)}${i?' (suite)':''}</h3>`:'')+tbl(t.head,ch);used+=ch.reduce((a,r)=>a+wt(r),0)+(t.h?2:1);i+=ch.length}}
    if(sec.bullets&&sec.bullets.length){const need=sec.bullets.reduce((a,b)=>a+Math.ceil(b.length/170),0)+(sec.bh?2:0);if(used+need>CAP&&used>0)flush();cur+=`${sec.bh?`<h3>${RE(sec.bh)}</h3>`:''}<ul class="small">${sec.bullets.map(b=>`<li>${RE(b)}</li>`).join('')}</ul>`;used+=need}
    if(cur)flush()}};
  secPages((R.sections||[]).filter(x=>x.top));
  if(R.compo){out.push(page(`${H('PLAN DE PLANTATION — '+R.compo.style.toUpperCase())}<div class="cols"><div>${R.plan?`<img class="fig plan" src="${R.plan.data}">`:'<p class="small">Dessinez la forme du massif sur la carte pour obtenir le plan.</p>'}</div><div><p>${RE(R.compo.desc)}</p><p class="small">Surface : ${nf(R.compo.A)} m²</p><ol class="leg">${R.legend.map(l=>`<li><span style="background:${l.c}"></span>${RE(l.n)}</li>`).join('')}</ol></div></div>`))}
  for(const pal of R.palettes){
    for(let s0=0;s0<pal.items.length;s0+=5){const ch=pal.items.slice(s0,s0+5),base=s0;
      out.push(page(`${H(pal.title+(s0?' (suite)':''))}${pal.sub?`<p class="sub">${RE(pal.sub)}</p>`:''}<div class="pal"><div class="photos">${ch.map((it,j)=>`<figure><span class="num">${base+j+1}</span>${it.photo&&it.photo.src?`<img src="${RE(it.photo.src)}" alt="${RE(it.p.n)}">`:'<div class="nophoto"></div>'}</figure>`).join('')}</div>
       <ol start="${base+1}" class="names">${ch.map(it=>`<li><i>${RE(it.p.l)}</i>${it.p.f&&it.p.f.length?', '+romMonths(it.p.f):''}${it.cp||it.p.pers!=null?', '+(it.cp||cpOf(it.p)):''}<br><span>${RE(it.p.n)}${it.qty?' · '+it.qty+' plant'+(it.qty>1?'s':''):''}${it.zone?' · '+RE(it.zone):''}</span></li>`).join('')}</ol></div>
       <p class="credits">Après chaque nom : mois de floraison et feuillage (caduc, persistant ou marcescent). Photos : ${[...new Set(ch.map(it=>it.photo&&it.photo.credit).filter(Boolean))].map(RE).join(' ; ')||'—'}</p>`,'palette'))}
  }
  if(R.compo)out.push(page(`${H('QUANTITÉS ET FOURNITURES')}<div class="cols"><div><h3>Plantes du massif</h3>${tbl(['N°','Plante','Quantité','Hauteur'],R.compo.rows.map((x,i)=>[i+1,x.p.n,x.qty,nf(x.p.h,x.p.h<1?2:1)+' m']))}</div><div><h3>Fournitures</h3>${tbl(['Fourniture','Quantité','Conditionnement'],R.supplies.map(x=>[x[0],x[1],x[2]]))}</div></div>`));
  if(R.checks.length)out.push(page(`${H('CONTRÔLES AGRONOMIQUES ET PAYSAGERS')}${tbl(['','Contrôle','Détail'],R.checks.map(o=>[o.s==='ok'?'✓':o.s==='ko'?'!':'i',o.t,o.d]))}`));
  secPages((R.sections||[]).filter(x=>!x.top));
  if(R.cal.length)out.push(page(`${H('ENTRETIEN, MOIS PAR MOIS')}<div class="cal">${R.cal.map(m=>`<div><h4>${RE(m.m)}</h4><ul>${m.t.map(t=>`<li>${RE(t)}</li>`).join('')}</ul></div>`).join('')}</div>`,'calp'));
  if(R.extras.length)out.push(page(`${H('HAIES, FRUITIERS, PELOUSE, EAU ET TALUS')}${tbl(['Élément','Description'],R.extras)}${R.pond?R.pond.map(D=>`<h3>Pièce d’eau : étapes</h3><ol class="small">${POND_STEPS.map(t=>`<li>${RE(t.replace('{d}',nf(D.dmax,1)))}</li>`).join('')}</ol><h3>Protéger la faune et la flore</h3><ul class="small">${POND_FAUNA.map(t=>`<li>${RE(t)}</li>`).join('')}</ul>`).join(''):''}`));
  out.push(page(`${H('MATÉRIEL D’ENTRETIEN ET SOURCES')}${tbl(['Matériel','Pour','Conseil'],R.mach)}<p class="small">Sources : climat Open-Meteo (ERA5, Copernicus) ; sols CNSW (SPW) et Bodemkaart (DOV) ; cadastre SPF Finances, SPW, Digitaal Vlaanderen ; relief LiDAR SPW et DHMV ; distances de plantation : Code civil belge, art. 3.133 ; photos iNaturalist et Wikimedia Commons. Les quantités et conseils sont des estimations à vérifier sur place.</p>`));
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${RE(R.cli.title||'Projet de jardin')} — Plantañ.ia</title>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;font:10.5pt/1.45 Jost,'Century Gothic',Futura,Arial,sans-serif;color:#1d241f;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:297mm;height:210mm;padding:15mm 18mm 16mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}
.pg footer{position:absolute;left:18mm;right:18mm;bottom:7mm;display:flex;align-items:center;gap:8px;font-size:8pt;color:#7a857d}.pg footer img{height:7mm}
h2{font-weight:400;font-size:17pt;letter-spacing:.02em;text-decoration:underline;text-underline-offset:4px;margin:0 0 8mm}
h3{font-weight:500;font-size:11pt;margin:4mm 0 2mm;color:#2d6a3d}.sub{margin:-5mm 0 5mm;color:#56665b}
.cover{display:grid;grid-template-rows:auto 1fr auto}.clogo{height:34mm}.ctitle{text-align:center;align-self:center}
.ctitle h1{font-weight:400;font-size:36pt;letter-spacing:.03em;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:8px;margin:0}.ctitle p{font-size:13pt;color:#56665b;margin:6mm 0 0}
.cfoot{display:flex;justify-content:space-between;align-items:end;font-size:12pt;line-height:1.7}.cli{text-align:left;min-width:70mm}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:10mm}.fig{width:100%;max-height:70mm;object-fit:contain;margin-bottom:3mm}.fig.plan{max-height:150mm}
.kv{border-collapse:collapse;width:100%;font-size:10pt}.kv th{text-align:left;font-weight:400;color:#56665b;padding:1.5mm 3mm 1.5mm 0;width:45%}.kv td{padding:1.5mm 0;border-bottom:1px solid #e3e8e4}
.tb{border-collapse:collapse;width:100%;font-size:9pt}.tb th{text-align:left;font-weight:500;border-bottom:1.5px solid #1d241f;padding:1.5mm 2mm}.tb td{border-bottom:1px solid #e3e8e4;padding:1.5mm 2mm;vertical-align:top}.tb tr{break-inside:avoid}
.small{font-size:9pt;color:#3d4a41}.leg{columns:2;font-size:10pt;padding-left:6mm}.leg span{display:inline-block;width:3.2mm;height:3.2mm;border-radius:50%;margin-right:2mm;vertical-align:-.3mm}
.pal{display:grid;grid-template-columns:auto minmax(70mm,1fr);gap:9mm;align-items:start}
.photos{display:flex;gap:2.5mm}.photos figure{margin:0;position:relative;width:34mm;height:118mm;overflow:hidden;background:#eef2ee}
.photos img{width:100%;height:100%;object-fit:cover;display:block}.nophoto{width:100%;height:100%;background:repeating-linear-gradient(45deg,#eef2ee 0 6px,#e2e8e3 6px 12px)}
.num{position:absolute;top:1.5mm;left:1.5mm;background:#fff;border:1px solid #1d241f;font-size:8.5pt;min-width:5mm;height:5mm;line-height:4.6mm;text-align:center;z-index:1}
.names{margin:0;padding-left:6mm;font-size:11pt;line-height:1.5}.names li{margin-bottom:3.5mm}.names span{font-size:9.5pt;color:#56665b}
.credits{position:absolute;left:18mm;right:18mm;bottom:13mm;font-size:7pt;color:#8a958d;margin:0}
.cal{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;font-size:8.5pt}.cal h4{margin:0 0 1mm;font-weight:500;color:#2d6a3d}.cal ul{margin:0;padding-left:4mm}
@media screen{body{background:#888}.pg{background:#fff;margin:8mm auto;box-shadow:0 2px 12px rgba(0,0,0,.3)}}</style></head><body>${out.join('\n')}</body></html>`;
}
async function exportPdf(){
  const R=await collectReport(),html=reportHtml(R);
  const fr=document.createElement('iframe');fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(fr);
  fr.srcdoc=html;await new Promise(ok=>fr.onload=ok);
  await Promise.all([...fr.contentDocument.images].map(im=>im.complete?0:new Promise(ok=>{im.onload=im.onerror=ok;setTimeout(ok,8000)})));
  await new Promise(ok=>setTimeout(ok,300));fr.contentWindow.focus();fr.contentWindow.print();setTimeout(()=>fr.remove(),60000);
}
async function imgBytes(url){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),10000);const r=await fetch(url,{signal:c.signal});clearTimeout(t);if(!r.ok)return null;const ty=r.headers.get('content-type')||'';const ext=/png/.test(ty)?'png':/jpe?g/.test(ty)||/\.jpe?g/i.test(url)?'jpeg':null;if(!ext)return null;return{u8:new Uint8Array(await r.arrayBuffer()),ext}}catch(e){return null}}
async function exportDocx(opt){
  const R=await collectReport(),imgs=[];let body='',nid=1;
  const W=14838; // largeur utile en twips (A4 paysage, marges 1000)
  const run=(t,o={})=>`<w:r><w:rPr>${o.b?'<w:b/>':''}${o.i?'<w:i/>':''}${o.u?'<w:u w:val="single"/>':''}${o.c?`<w:color w:val="${o.c}"/>`:''}${o.sz?`<w:sz w:val="${o.sz}"/>`:''}</w:rPr><w:t xml:space="preserve">${xe(t)}</w:t></w:r>`;
  const para=(runs,pp='')=>`<w:p><w:pPr>${pp}</w:pPr>${runs}</w:p>`;
  const brk='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  const pic=(u8,ext,cx,cy)=>{const id='rIdImg'+(imgs.length+1);imgs.push({id,u8,ext});const n=nid++;return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${n}" name="Image${n}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${n}" name="Image${n}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`};
  const picFit=(im,maxCm)=>{const cx=Math.round(maxCm*360000),cy=Math.round(cx*im.h/im.w);return pic(b64u8(im.data.split(',')[1]),'png',cx,cy)};
  const H=t=>para(run(t,{u:1,sz:34}),'<w:pStyle w:val="Heading1"/>');
  const table=(head,rows,widths)=>{const n=head.length,ws=widths||head.map(()=>Math.floor(W/n)),bd='<w:tblBorders><w:bottom w:val="single" w:sz="4" w:color="D5DCD6"/><w:insideH w:val="single" w:sz="4" w:color="D5DCD6"/></w:tblBorders>';
    const cell=(v,i,hd)=>`<w:tc><w:tcPr><w:tcW w:w="${ws[i]}" w:type="dxa"/>${hd?'<w:tcBorders><w:bottom w:val="single" w:sz="10" w:color="1D241F"/></w:tcBorders>':''}</w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${run(v==null?'':v,hd?{b:1,sz:18}:{sz:18})}</w:p></w:tc>`;
    return `<w:tbl><w:tblPr><w:tblW w:w="${W}" w:type="dxa"/>${bd}<w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${ws.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid><w:tr><w:trPr><w:tblHeader/></w:trPr>${head.map((h,i)=>cell(h,i,1)).join('')}</w:tr>${rows.map(r=>`<w:tr><w:trPr><w:cantSplit/></w:trPr>${r.map((v,i)=>cell(v,i)).join('')}</w:tr>`).join('')}</w:tbl>`};
  // page de garde
  body+=para(pic(b64u8(docLogo()[0]),'png',Math.round(4.2*360000),Math.round(4.2*360000*docLogo()[1])));
  body+=para('','<w:spacing w:before="1800"/>')+para(run((R.cli.title||'Projet de jardin').toUpperCase(),{u:1,sz:64}),'<w:jc w:val="center"/>')+para(run('Rapport de site et palette végétale',{sz:26,c:'56665B'}),'<w:jc w:val="center"/><w:spacing w:after="2200"/>');
  const left=[...(proOn()?proLines():['Plantañ.ia']),'Rapport généré le '+R.date,R.compo?R.compo.style:''].filter(Boolean),right=[R.cli.name,R.cli.addr,R.cli.city||(!R.cli.name?R.place.commune:''),R.cli.phone,R.cli.email].filter(Boolean);
  body+=`<w:tbl><w:tblPr><w:tblW w:w="${W}" w:type="dxa"/></w:tblPr><w:tblGrid><w:gridCol w:w="${W/2}"/><w:gridCol w:w="${W/2}"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="${W/2}" w:type="dxa"/></w:tcPr>${left.map(t=>para(run(t,{sz:24}))).join('')}</w:tc><w:tc><w:tcPr><w:tcW w:w="${W/2}" w:type="dxa"/></w:tcPr>${(right.length?right:['']).map(t=>para(run(t,{sz:24}),'<w:ind w:left="3600"/>')).join('')}</w:tc></w:tr></w:tbl>`+brk;
  // site
  if(!R.noSite){body+=H('LE SITE');
  if(R.site.kpis.length)body+=para(run('Climat',{b:1,c:'2D6A3D'}))+table(['Indicateur','Valeur'],R.site.kpis,[5000,9838]);
  if(R.site.soil.length)body+=para(run('Sol',{b:1,c:'2D6A3D'}),'<w:spacing w:before="200"/>')+table(['Caractéristique','Valeur'],R.site.soil,[5000,9838]);
  body+=para(run('Conditions retenues',{b:1,c:'2D6A3D'}),'<w:spacing w:before="200"/>')+table(['Critère','Valeur'],R.site.cond,[5000,9838]);
  if(R.site.ombro)body+=para(picFit(R.site.ombro,11),'<w:spacing w:before="120"/>');if(R.site.dry)body+=para(run(R.site.dry,{sz:18}));
  body+=brk}
  const docSec=sec=>{body+=H(sec.title);(sec.pngs||[]).forEach(pg=>{if(pg)body+=para(picFit(pg,sec.pngs.indexOf(pg)?16:9))});if(sec.intro)body+=para(run(sec.intro,{sz:20,c:'56665B'}));sec.tables.forEach(t=>{if(t.h)body+=para(run(t.h,{b:1,c:'2D6A3D'}),'<w:spacing w:before="200"/>');const n=t.head.length;body+=table(t.head,t.rows.map(r=>r.map(v=>v==null?'':String(v))),t.w&&t.w.length===n?t.w:t.head.map(()=>Math.floor(W/n)))});if(sec.bullets&&sec.bullets.length){if(sec.bh)body+=para(run(sec.bh,{b:1,c:'2D6A3D'}),'<w:spacing w:before="200"/>');sec.bullets.forEach(b=>{body+=para(run('• '+b,{sz:18}))})}body+=brk};
  (R.sections||[]).filter(x=>x.top).forEach(sec=>docSec(sec));
  if(R.compo){body+=H('PLAN DE PLANTATION — '+R.compo.style.toUpperCase())+para(run(R.compo.desc,{sz:20}));if(R.plan)body+=para(picFit(R.plan,15));body+=para(run(R.legend.map(l=>l.i+'. '+l.n).join('   ·   '),{sz:18}))+brk}
  // palettes
  for(const pal of R.palettes){for(let s0=0;s0<pal.items.length;s0+=5){const ch=pal.items.slice(s0,s0+5);
    body+=H(pal.title+(s0?' (suite)':''));if(pal.sub)body+=para(run(pal.sub,{sz:20,c:'56665B'}));
    const cw=Math.floor(W/5),cells=[];
    for(let j=0;j<ch.length;j++){const it=ch[j],ib=it.photo&&it.photo.src?await imgBytes(it.photo.src):null,cx=Math.round(4.3*360000),cy=Math.round(6.4*360000);
      cells.push(`<w:tc><w:tcPr><w:tcW w:w="${cw}" w:type="dxa"/></w:tcPr>${para(run(String(s0+j+1),{b:1,sz:18}))}${ib?para(pic(ib.u8,ib.ext,cx,cy)):para(run('(photo indisponible)',{sz:16,c:'8A958D'}))}</w:tc>`)}
    body+=`<w:tbl><w:tblPr><w:tblW w:w="${cw*ch.length}" w:type="dxa"/><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${ch.map(()=>`<w:gridCol w:w="${cw}"/>`).join('')}</w:tblGrid><w:tr>${cells.join('')}</w:tr></w:tbl>`;
    body+=ch.map((it,j)=>para(run(`${s0+j+1}. `,{sz:22})+run(it.p.l,{i:1,sz:22})+run(`${it.p.f&&it.p.f.length?', '+romMonths(it.p.f):''}${it.cp||it.p.pers!=null?', '+(it.cp||cpOf(it.p)):''} — ${it.p.n}${it.qty?' · '+it.qty+' plant'+(it.qty>1?'s':''):''}${it.zone?' · '+it.zone:''}`,{sz:22}),'<w:spacing w:after="60"/>')).join('');
    body+=para(run('Après chaque nom : mois de floraison et feuillage (caduc, persistant ou marcescent). Photos : '+([...new Set(ch.map(it=>it.photo&&it.photo.credit).filter(Boolean))].join(' ; ')||'—'),{sz:14,c:'8A958D'}),'<w:spacing w:before="200"/>')+brk}}
  if(R.compo){body+=H('QUANTITÉS ET FOURNITURES')+table(['N°','Plante','Nom latin','Quantité','Hauteur'],R.compo.rows.map((x,i)=>[i+1,x.p.n,x.p.l,x.qty,nf(x.p.h,x.p.h<1?2:1)+' m']),[800,4200,4838,2000,3000])+para('')+table(['Fourniture','Quantité','Conditionnement','Détail'],R.supplies,[3600,2000,3600,5638])+brk}
  if(R.checks.length)body+=H('CONTRÔLES AGRONOMIQUES ET PAYSAGERS')+table(['Statut','Contrôle','Détail'],R.checks.map(o=>[o.s==='ok'?'OK':o.s==='ko'?'À revoir':'Info',o.t,o.d]),[1400,3400,10038])+brk;
(R.sections||[]).filter(x=>!x.top).forEach(docSec);
  if(R.cal.length)body+=H('ENTRETIEN, MOIS PAR MOIS')+table(['Mois','Tâches'],R.cal.map(m=>[m.m,m.t.join(' • ')]),[2200,12638])+brk;
  if(R.extras.length){body+=H('HAIES, FRUITIERS, PELOUSE, EAU ET TALUS')+table(['Élément','Description'],R.extras,[3000,11838]);(R.pond||[]).forEach(D=>{body+=para(run('Pièce d’eau : étapes',{b:1,c:'2D6A3D'}),'<w:spacing w:before="200"/>')+POND_STEPS.map((t,i)=>para(run((i+1)+'. '+t.replace('{d}',nf(D.dmax,1)),{sz:18}))).join('')+para(run('Matériaux',{b:1,c:'2D6A3D'}))+table(['Matériau','Quantité','Détail'],D.mats,[4500,2500,7838])+para(run('Protéger la faune et la flore',{b:1,c:'2D6A3D'}),'<w:spacing w:before="200"/>')+POND_FAUNA.map(t=>para(run('•  '+t,{sz:18}))).join('')});body+=brk}
  body+=(R.mach.length?H('MATÉRIEL D’ENTRETIEN ET SOURCES')+table(['Matériel','Pour','Conseil'],R.mach,[4000,3800,7038]):H('SOURCES'))+para(run('Sources : climat Open-Meteo (ERA5, Copernicus) ; sols CNSW (SPW) et Bodemkaart (DOV) ; cadastre SPF Finances, SPW, Digitaal Vlaanderen ; relief LiDAR SPW et DHMV ; distances de plantation : Code civil belge, art. 3.133 ; photos iNaturalist et Wikimedia Commons. Les quantités et conseils sont des estimations à vérifier sur place.',{sz:16,c:'56665B'}),'<w:spacing w:before="200"/>');
  const NS='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
  const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NS}><w:body>${body}<w:sectPr><w:footerReference w:type="default" r:id="rIdFoot"/><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="900" w:right="1000" w:bottom="900" w:left="1000" w:header="400" w:footer="400" w:gutter="0"/><w:titlePg/></w:sectPr></w:body></w:document>`;
  const foot=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="${W}"/></w:tabs></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="7A857D"/></w:rPr><w:t xml:space="preserve">${xe(R.cli.title||'Projet de jardin')} · Plantañ.ia</w:t></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="7A857D"/></w:rPr><w:tab/><w:fldSimple w:instr="PAGE"><w:r><w:t>1</w:t></w:r></w:fldSimple></w:r></w:p></w:ftr>`;
  const sty=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Century Gothic" w:hAnsi="Century Gothic" w:cs="Arial" w:eastAsia="Century Gothic"/><w:sz w:val="20"/><w:color w:val="1D241F"/><w:lang w:val="fr-BE"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="300"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:sz w:val="34"/></w:rPr></w:style></w:styles>`;
  const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`;
  const files=[{name:'[Content_Types].xml',data:ct},{name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'},
    {name:'word/_rels/document.xml.rels',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdFoot" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>${imgs.map((m,i)=>`<Relationship Id="${m.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/img${i+1}.${m.ext}"/>`).join('')}</Relationships>`},
    {name:'word/document.xml',data:doc},{name:'word/styles.xml',data:sty},{name:'word/footer1.xml',data:foot},...imgs.map((m,i)=>({name:`word/media/img${i+1}.${m.ext}`,data:m.u8}))];
  const blob=zipBlob(files,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');if(opt&&opt.blob)return blob;download(blob,'plantania-rapport.docx');
}

/* ---------- Avis des testeurs ---------- */
/* CONFIGURATION : indiquez votre adresse e-mail, ou l’adresse d’un formulaire (Formspree, Getform…) qui accepte un POST JSON. */
const FEEDBACK={email:'',endpoint:''};
let fbNote=0;
$('#fbStars').innerHTML=[1,2,3,4,5].map(n=>`<button type="button" data-n="${n}" aria-pressed="false" aria-label="${n} sur 5">★</button>`).join('');
$('#fbStars').addEventListener('click',e=>{const b=e.target.closest('[data-n]');if(!b)return;fbNote=+b.dataset.n;document.querySelectorAll('#fbStars button').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.n<=fbNote)))});
$('#fbOpen').addEventListener('click',()=>{const p=$('#fbPanel');p.hidden=!p.hidden;if(!p.hidden)$('#fbGood').focus()});
$('#fbClose').addEventListener('click',()=>{$('#fbPanel').hidden=true});
function fbText(){const ctx=$('#fbCtx').checked?`\n\n— Infos techniques —\nNavigateur : ${navigator.userAgent}\nÉcran : ${innerWidth}×${innerHeight}\nLangue : ${LANG}\nOnglets ouverts : ${curTabs().join(', ')}\nÉléments tracés : ${$('#itemsCount').textContent}\nStyle : ${S.style}`:'';
  return `Note : ${fbNote?fbNote+'/5':'—'}\n\nCe qui m’a plu :\n${$('#fbGood').value}\n\nCe qui ne marche pas :\n${$('#fbBad').value}\n\nIdées :\n${$('#fbIdea').value}\n\nE-mail : ${$('#fbMail').value}${ctx}`}
$('#fbCopy').addEventListener('click',()=>navigator.clipboard.writeText(fbText()).then(()=>$('#fbMsg').textContent='Avis copié : collez-le dans un message.',()=>$('#fbMsg').textContent='Copie refusée par le navigateur.'));
$('#fbForm').addEventListener('submit',async e=>{e.preventDefault();const t=fbText();
  if(FEEDBACK.endpoint){try{const r=await fetch(FEEDBACK.endpoint,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({note:fbNote,plu:$('#fbGood').value,probleme:$('#fbBad').value,idees:$('#fbIdea').value,email:$('#fbMail').value,message:t})});if(!r.ok)throw 0;$('#fbMsg').textContent='Merci ! Votre avis a bien été envoyé.';$('#fbForm').reset();fbNote=0;return}catch(err){}}
  if(FEEDBACK.email){location.href=`mailto:${FEEDBACK.email}?subject=${encodeURIComponent('Avis sur Plantañ.ia')}&body=${encodeURIComponent(t.slice(0,1800))}`;$('#fbMsg').textContent='Votre messagerie s’ouvre avec votre avis : il ne reste qu’à l’envoyer. Merci !';return}
  $('#fbMsg').textContent='L’envoi direct n’est pas encore configuré : cliquez sur « Copier » et envoyez votre avis par message à la personne qui vous a partagé le site.';
});
/* ---------- Taille de la carte, remise à zéro ---------- */
if(window.ResizeObserver)new ResizeObserver(()=>{if(map.invalidateSize)map.invalidateSize()}).observe($('#mapwrap'));
$('#mapBig').addEventListener('click',()=>{const w=$('#mapwrap'),on=!w.classList.contains('big');w.style.height='';w.classList.toggle('big',on);$('#mapBig').setAttribute('aria-pressed',String(on));$('#mapBig').textContent=on?'Réduire la carte':'Agrandir la carte';if(on)$('#mapwrap').scrollIntoView({behavior:'smooth',block:'center'})});
$('#mapFull').addEventListener('click',async()=>{const c=$('#carte');try{if(document.fullscreenElement)await document.exitFullscreen();else await c.requestFullscreen()}catch(e){$('#mapBig').click()}});
document.addEventListener('fullscreenchange',()=>{$('#mapFull').textContent=document.fullscreenElement?'Quitter le plein écran':'Plein écran';setTimeout(()=>map.invalidateSize&&map.invalidateSize(),100)});
$('#resetAll').addEventListener('click',e=>{const b=e.currentTarget;
  if(!b.classList.contains('confirm')){b.classList.add('confirm');b.textContent='Confirmer la remise à zéro';setTimeout(()=>{b.classList.remove('confirm');b.textContent='Remettre à zéro'},5000);return}
  try{['plantania:site','plantania:tabs','plantania:current','plantania:wiz'].forEach(k=>localStorage.removeItem(k))}catch(err){}
  location.reload();
});
/* ================= v4 : courbes, édition des points, options de composition ================= */
S.curve=false;S.editing=false;S.potagers=[];S.orchards=[];
function crSpline(pts,closed,n){n=n||8;const m=pts.length;if(m<(closed?3:2))return pts.map(p=>p.slice());const out=[],g=i=>closed?pts[(i+m)%m]:pts[Math.max(0,Math.min(m-1,i))],segs=closed?m:m-1;
  for(let i=0;i<segs;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0,1].map(d=>0.5*(2*p1[d]+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3)))}}
  if(!closed)out.push(pts[m-1].slice());return out}
const EDIT_K=[['shapes',it=>it.kind==='obsPoly'],['hedges',0],['lawns',1],['ponds',1],['vines',0],['taluses',1],['potagers',1],['orchards',1]];
const closedOf=(k,it)=>{const e=EDIT_K.find(x=>x[0]===k);return e?(typeof e[1]==='function'?e[1](it):!!e[1]):false};
function regeom(it,closed){if(!it.raw)it.raw=it.pts.map(p=>p.slice());it.pts=it.smooth?crSpline(it.raw,closed):it.raw.map(p=>p.slice())}
function bedRegeom(){const b=S.bed;if(!b.raw){b.raw=b.ll.map(p=>p.slice());b.rawEdges=(b.edges||b.raw.map(()=>0)).slice()}const n=8;
  if(b.smooth&&b.raw.length>=3){b.ll=crSpline(b.raw,true,n);b.seg2raw=b.ll.map((_,j)=>Math.floor(j/n))}else{b.ll=b.raw.map(p=>p.slice());b.seg2raw=null}
  b.edges=b.ll.map((_,j)=>b.rawEdges[b.seg2raw?b.seg2raw[j]:j]||0)}
function findItem(id){for(const [k] of EDIT_K){const it=(S[k]||[]).find(x=>x.id==id);if(it)return[k,it]}return[null,null]}
function initGeom(id){const [k,it]=findItem(id);if(!it)return;it.raw=it.pts.map(p=>p.slice());it.smooth=!!S.curve;regeom(it,closedOf(k,it));if(k==='taluses'&&it.smooth)estimateTalus(it)}
function toggleCurve(kind,id){pushUndo();
  if(kind==='bed'){if(!S.bed)return;S.bed.smooth=!S.bed.smooth;bedRegeom();drawBed();renderCompo();drawHandles();renderItemsList();return}
  const it=(S[kind]||[]).find(x=>x.id==id);if(!it||!it.pts)return;if(!it.raw)it.raw=it.pts.map(p=>p.slice());it.smooth=!it.smooth;regeom(it,closedOf(kind,it));if(kind==='taluses')estimateTalus(it);itemsChanged(kind==='shapes');drawHandles()}
const editLayer=L.layerGroup().addTo(map);
function drawHandles(){
  editLayer.clearLayers();if(!S.editing)return;
  const H=(ll,cls,onEnd,onDbl)=>{const mk=L.marker(ll,{draggable:true,zIndexOffset:1000,icon:L.divIcon({className:'',html:`<span class="vh ${cls}"></span>`,iconSize:[16,16],iconAnchor:[8,8]})}).addTo(editLayer);
    mk.on('dragend',()=>{const p=mk.getLatLng();pushUndo();onEnd([p.lat,p.lng])});if(onDbl)mk.on('dblclick',e=>{if(e&&L.DomEvent.stopPropagation)L.DomEvent.stopPropagation(e);onDbl()});return mk};
  const edit=(raw,closed,min,done,onIns,onDel)=>{
    raw.forEach((pt,k)=>H(pt,'',q=>{raw[k]=q;done()},raw.length>min?()=>{raw.splice(k,1);onDel&&onDel(k);done()}:null));
    const segs=closed?raw.length:raw.length-1;
    for(let k=0;k<segs;k++){const a=raw[k],b=raw[(k+1)%raw.length];H([(a[0]+b[0])/2,(a[1]+b[1])/2],'mid',q=>{raw.splice(k+1,0,q);onIns&&onIns(k);done()})}};
  if(S.bed){if(!S.bed.raw)bedRegeom();edit(S.bed.raw,true,3,()=>{bedRegeom();drawBed();renderCompo();renderItemsList();drawHandles()},k=>S.bed.rawEdges.splice(k+1,0,S.bed.rawEdges[k]),k=>S.bed.rawEdges.splice(k,1))}
  EDIT_K.forEach(([k])=>(S[k]||[]).forEach(it=>{if(!it.pts)return;if(!it.raw)it.raw=it.pts.map(p=>p.slice());const cl=closedOf(k,it);
    edit(it.raw,cl,cl?3:2,()=>{regeom(it,cl);if(k==='taluses')estimateTalus(it);itemsChanged(k==='shapes');drawHandles()})}));
}
function setEditing(on){S.editing=on;$('#editPts').setAttribute('aria-pressed',String(on));$('#editPts').textContent=on?'Terminer la modification':'Modifier les points';
  if(on){setMode('site');$('#maphint').textContent='Modification : faites glisser un point pour le déplacer, glissez un petit point intermédiaire pour en ajouter un, double-cliquez sur un point pour le supprimer.'}else $('#maphint').textContent=HINT[S.mode]||'';drawHandles()}
$('#editPts').addEventListener('click',()=>setEditing(!S.editing));
$('#curveMode').addEventListener('change',e=>{S.curve=e.target.checked;drawTemp()});

/* ---------- options de composition ---------- */
function harmTxt(){const H=S.harm,set=harmSet(),b=COL[H.base]?COL[H.base][0].toLowerCase():'',names=set?[...set].map(c=>COL[c][0].toLowerCase()).join(', '):'';
  return ({camaieu:`Camaïeu de ${b} : une seule teinte déclinée du clair au soutenu, éclairée de blanc ; les feuillages verts et gris font le lien.`,
    analogue:`Couleurs voisines autour du ${b} (${names}) : un ensemble doux et cohérent ; un peu de blanc ou de feuillage gris l’éclaire.`,
    compl:`Couleurs opposées (${names}) : un contraste vif. Laissez une couleur dominer (environ deux tiers) et répartissez l’autre en touches.`+(H.base==='rouge'||H.base==='rose'?' Le rouge et le rose s’opposent au vert : misez sur des feuillages bien verts et des fleurs vertes (alchémille, euphorbe).':''),
    chaud:'Tons chauds : rouge, orange et jaune donnent de l’énergie et rapprochent visuellement le massif ; les graminées blondes adoucissent l’ensemble.',
    froid:'Tons froids : bleu, violet et blanc agrandissent l’espace et apaisent ; parfaits à mi-ombre et vus de loin.',
    pastel:'Pastels : blanc, rose et bleu, lumineux le soir et à l’ombre légère.',
    blanc:'Jardin blanc : fleurs blanches, feuillages verts, gris et panachés ; très lumineux au crépuscule.'})[H.mode]||''}
$('#oDispo').innerHTML=opts(DISPO,S.dispo);$('#oHarm').innerHTML=opts(HARM,S.harm.mode);$('#oBloom').innerHTML=opts(BLOOM,S.bloom);
$('#oBase').innerHTML=HBASE.map(k=>`<option value="${k}"${k===S.harm.base?' selected':''}>${COL[k][0]}</option>`).join('');
function syncHarmUI(){document.querySelectorAll('.harmSel').forEach(el=>{el.value=S.harm.mode});document.querySelectorAll('.harmBase').forEach(el=>{el.value=S.harm.base});$('#oHarm').value=S.harm.mode;$('#oBase').value=S.harm.base;
  const show=['camaieu','analogue','compl'].includes(S.harm.mode);$('#oBaseL').hidden=!show;document.querySelectorAll('.harmBaseL').forEach(el=>{el.hidden=!show})}
syncHarmUI();
$('#compOpts').addEventListener('change',e=>{const t=e.target;
  if(t.id==='oDispo')S.dispo=t.value;if(t.id==='oHarm')S.harm.mode=t.value;if(t.id==='oBase')S.harm.base=t.value;if(t.id==='oBloom')S.bloom=t.value;
  if(t.id==='oPick'){if(t.value==='perso'&&!S.custom.length){const r=S.lastCompo&&!S.lastCompo.custom?S.lastCompo:compose();S.custom=r.rows.map(x=>({l:x.p.l,qty:x.qty}))}S.pick=t.value}
  syncHarmUI();renderCompo();if(typeof renderBoxes==='function')renderBoxes()});
function renderCustomAdd(r){const el=$('#cuAdd');if(!el)return;if(S.pick!=='perso'){el.innerHTML='';return}
  const cs=harmSet(),list=scored().filter(x=>x.ok&&x.p.t!=='annuelle'&&passF(x.p,true)&&colOk(x.p,cs)&&!S.custom.some(u=>u.l===x.p.l)).sort((a,b)=>a.p.n.localeCompare(b.p.n,'fr'));
  const TP={arbre:'Arbres',arbuste:'Arbustes et rosiers',vivace:'Vivaces et bulbes',graminee:'Graminées',fougere:'Fougères'};
  const grp=Object.entries(TP).map(([k,l])=>{const xs=list.filter(x=>x.p.t===k);return xs.length?`<optgroup label="${l}">${xs.map(x=>`<option value="${esc(x.p.l)}">${esc(x.p.n)} (${x.score} %)</option>`).join('')}</optgroup>`:''}).join('');
  el.innerHTML=`<div class="card cuadd"><label>Ajouter une plante adaptée au site<select id="cuSel">${grp}</select></label><label>Quantité<input type="number" id="cuQty" min="1" max="999" value="3" style="width:6em"></label><button type="button" class="pri" id="cuAddB">Ajouter</button><button type="button" id="cuReset">Repartir de la proposition automatique</button>
   <p class="note" style="flex-basis:100%;margin:0">${list.length} plantes conviennent au site, à vos filtres et à l’harmonie choisie. Le plan les dispose ensuite selon la disposition choisie, les plus hautes au fond.</p></div>`}
$('#compo').addEventListener('change',e=>{const t=e.target;if(!t.classList.contains('cuq'))return;const i=+t.dataset.cu,v=Math.max(1,Math.min(999,parseInt(t.value)||1));if(S.custom[i]){S.custom[i].qty=v;renderCompo()}});
$('#compo').addEventListener('click',e=>{const b=e.target.closest('.cudel');if(!b)return;pushUndo();S.custom.splice(+b.dataset.cu,1);renderCompo();toast('Plante retirée du massif',{undo:true})});
$('#cuAdd').addEventListener('click',e=>{
  if(e.target.id==='cuAddB'){const l=$('#cuSel').value;if(!l)return;S.custom.push({l,qty:Math.max(1,Math.min(999,parseInt($('#cuQty').value)||1))});renderCompo()}
  if(e.target.id==='cuReset'){S.pick='auto';const r=compose();S.custom=r.rows.map(x=>({l:x.p.l,qty:x.qty}));S.pick='perso';renderCompo()}});
function renderBloomCal(r){const el=$('#bloomcal');if(!el)return;const tg=r.tgt,cnt=Array.from({length:12},(_,i)=>r.rows.filter(x=>x.p.f.includes(i+1))),mx=Math.max(1,...cnt.map(a=>a.length));
  el.innerHTML=`<div class="bcal">${cnt.map((a,i)=>{const want=tg&&tg.includes(i+1),miss=want&&!a.length;return `<div class="bm${want?' want':''}${miss?' miss':''}" title="${MOL[i]} : ${a.map(x=>x.p.n).join(', ')||'aucune fleur'}"><div class="bb"><i style="height:${Math.round(a.length/mx*100)}%"></i></div><div class="bd">${a.slice(0,6).map(x=>`<span class="dot" style="background:${COL[x.col]?COL[x.col][1]:speciesColor(x.p)}"></span>`).join('')}</div><b>${MO[i]}</b><small>${a.length}</small></div>`}).join('')}</div>
  <p class="note" style="margin:8px 0 0">${tg?(tg.length===12?'Objectif : des fleurs chaque mois de l’année.':'Objectif : des fleurs d’avril à octobre.')+' Les mois visés sont soulignés ; en rouge, ceux qui restent sans fleurs.':'Nombre d’espèces en fleur chaque mois.'} Survolez un mois pour voir les plantes.</p>`}
const RG={grimpant:'Grimpant',anglais:'Anglais (David Austin)',arbustif:'Arbustif',buisson:'Buisson à grandes fleurs',flori:'Floribunda (fleurs en bouquets)',couvre:'Couvre-sol',botanique:'Botanique (espèce sauvage)'};
function renderRoseBox(r){const el=$('#roseBox');if(!el)return;if(r.key!=='ros'){el.innerHTML='';return}
  const c=cond(),cs=harmSet(),rs=PL.filter(p=>p.rose).map(p=>({p,...scorePlant(p,c)})),pe=S.pick==='perso';
  el.innerHTML=`<h3>Variétés de rosiers possibles</h3><div class="card scroll"><table class="stack"><thead><tr><th>Type</th><th>Variété</th><th>Couleur</th><th class="n">Hauteur</th><th>Parfum</th><th>Santé et floraison</th><th>Pour ce site</th>${pe?'<th></th>':''}</tr></thead><tbody>${Object.keys(RG).flatMap(g=>rs.filter(x=>x.p.rose.g===g).map(x=>{const R=x.p.rose,ok=x.ok&&colOk(x.p,cs);
    return `<tr><td>${RG[g]}</td><td><b>${esc(x.p.n.replace(/^Rosier (grimpant |couvre-sol )?/,''))}</b><br><i class="src">${esc(x.p.l)}</i></td><td><span class="dots" style="display:inline-flex">${dots(x.p)}</span></td><td class="n">${nf(x.p.h,1)} m</td><td>${R.parf?'●'.repeat(R.parf)+'○'.repeat(3-R.parf):'—'}</td><td>${R.adr?'Label ADR':R.res?'Résistant':R.fragile?'Sensible aux maladies':'Moyenne'}${R.rem?', remontant':', une floraison'}${R.nord?', supporte un mur nord':''}</td><td>${ok?'<span class="okk">adapté</span>':`<span class="koo">${x.ok?'hors harmonie':esc(x.why[0]||'non adapté')}</span>`}</td>${pe?`<td>${x.ok&&!S.custom.some(u=>u.l===x.p.l)?`<button type="button" data-addrose="${esc(x.p.l)}">Ajouter</button>`:''}</td>`:''}</tr>`})).join('')}</tbody></table></div>
  <p class="note">Le label allemand ADR distingue des rosiers testés plusieurs années sans traitement. Parfum : ●○○ léger à ●●● intense. ${pe?'':'Passez le « Choix des plantes » en « Personnalisé » pour composer vous-même votre roseraie.'}</p>`}
$('#roseBox').addEventListener('click',e=>{const b=e.target.closest('[data-addrose]');if(!b)return;const p=PL.find(x=>x.l===b.dataset.addrose);if(!p)return;S.custom.push({l:p.l,qty:p.rose.g==='grimpant'||!p.d?1:Math.max(1,Math.round(p.d*2))});renderCompo()});
function renderCompoExtras(r){if(typeof renderPros==='function'&&$('#prosBox')&&!S.devisDirty)setTimeout(renderPros,0);renderCustomAdd(r);renderBloomCal(r);renderRoseBox(r);$('#oPick').value=S.pick;
  const n=$('#plnote');if(n&&!n.dataset.k){n.dataset.k=1;n.textContent=`Base de ${PL.length} espèces et variétés aux exigences simplifiées, à valider. `+n.textContent.replace(/^Base de démonstration aux exigences simplifiées, à valider\. /,'')}}

/* ================= Jardinières et balcons ================= */
S.boxes=[];let boxId=0;
const BOXK={appui:'Appui de fenêtre',garde:'Garde-corps de balcon',jardin:'Pots et bacs (jardin, terrasse)'};
const ORI={auto:'Comme le site',S:'Sud',SE:'Sud-est',SO:'Sud-ouest',E:'Est',O:'Ouest',NE:'Nord-est',NO:'Nord-ouest',N:'Nord'};
const SAIS={e:'Été (mai à octobre)',h:'Hiver et printemps (octobre à mai)',a:'Les deux (deux plantations par an)'};
const JR={h:'Plante haute (centre ou arrière)',r:'Plante de remplissage',t:'Plante retombante (devant)',b:'Bulbes en lasagne (sous les plantes)'};
const oriExpo=o=>o==='auto'?(S.stats?S.stats.cls:'s'):['S','SE','SO'].includes(o)?'s':['E','O'].includes(o)?'m':'o';
function addBox(kind){S.boxes.push({id:++boxId,kind,len:kind==='jardin'?2:kind==='garde'?3:1.2,depth:kind==='appui'?20:kind==='garde'?25:60,ori:'auto',wind:kind==='garde',exist:false,L:60,W:18,H:17,n:1,sais:'e'});renderBoxes()}
function boxPlan(b){
  if(b.exist)return{n:Math.max(1,b.n|0),L:b.L,W:b.W,H:b.H,prop:false};
  const avail=Math.max(30,b.len*100),dep=b.depth;
  if(b.kind==='jardin'){const L=avail>=200?100:80,W=Math.min(50,Math.max(30,dep-5)),n=Math.max(1,Math.floor((avail+10)/(L+10)));return{n,L,W,H:40,prop:true}}
  let best=null;for(const L of [100,80,60,50,40]){const n=Math.floor((avail+5)/(L+5));if(n<1)continue;const cov=n*L/avail;if(!best||cov>best.cov+0.04||(Math.abs(cov-best.cov)<=0.04&&n<best.n))best={n,L,cov}}
  if(!best)best={n:1,L:Math.max(30,Math.floor(avail/10)*10)};
  const W=b.kind==='appui'?(dep>=22?20:dep>=18?17:15):20,H=W>=20?18:15;
  return{n:best.n,L:best.L,W,H,prop:true,narrow:b.kind==='appui'&&dep<15}
}
function boxCompo(b,sais){
  const ex=oriExpo(b.ori),cs=harmSet(),c=cond(),P=boxPlan(b),L=P.L,two=P.W>=17;
  const ok=p=>p.jr&&(p.jr==='b'?sais==='h':(p.sais===sais||p.sais==='a'))&&p.e.includes(ex)&&colOk(p,cs)&&(p.t==='annuelle'||p.z==null||c.tmin==null||c.tmin>=p.z+5);
  const val=p=>(p.t==='annuelle'?8:0)+(b.wind&&p.w.includes('d')?6:0)+Math.min(6,p.f.length)+(p.e[0]===ex?3:0)+(p.sais==='a'&&sais==='e'?-4:0);
  const pick=(role,k)=>pickDiverse(PL.filter(p=>p.jr===role&&ok(p)).map(p=>({p,score:val(p)})).sort((a,z)=>z.score-a.score),k,{months:new Set(),cols:new Set(),cset:cs}).map(x=>x.p);
  const Hh=pick('h',1),Rr=pick('r',two?2:1),Tt=pick('t',L>=60?2:1),Bb=sais==='h'?pick('b',2):[];
  const esp=p=>p.esp||20,rows=[],put=(arr,n,role)=>{if(!arr.length||n<=0)return;arr.forEach((p,i)=>{const q=Math.floor(n/arr.length)+(i<n%arr.length?1:0);if(q)rows.push({p,q,role})})};
  const nH=Hh.length?Math.max(1,Math.round(L/50)):0;
  if(two){put(Hh,nH,'h');put(Rr,Math.max(0,Math.floor(L/(Rr[0]?esp(Rr[0]):20))-nH),'r');put(Tt,Math.max(1,Math.floor(L/(Tt[0]?esp(Tt[0]):25))),'t')}
  else{const tot=Math.max(2,Math.floor(L/20));put(Hh,nH,'h');const rest=tot-nH;put(Rr,Math.ceil(rest/2),'r');put(Tt,Math.floor(rest/2),'t')}
  Bb.forEach(p=>rows.push({p,q:Math.max(3,Math.round(L/10*p.d/18)),role:'b'}));
  return{rows,ex,P}
}
function boxSupplies(b){
  const P=boxPlan(b),vol=P.L*P.W*P.H/1000,drain=P.L*P.W*3/1000,terr=Math.max(0,vol-drain),seasons=b.sais==='a'?['e','h']:[b.sais];
  const kg=Math.round(vol*1.1+(P.L/100)*2),out=[];
  if(P.prop)out.push(['Jardinière'+(P.n>1?'s':''),`${P.n} × ${P.L} cm`,`largeur ${P.W} cm, hauteur ${P.H} cm, avec trous de drainage${oriExpo(b.ori)==='s'||b.wind?' et réserve d’eau':''}`]);
  out.push(['Terreau pour jardinières et bacs',`${nf(terr*P.n)} L`,`${Math.max(1,Math.ceil(terr*P.n/40))} sac(s) de 40 L ; à renouveler à chaque plantation, ou au moins chaque printemps`]);
  out.push(['Billes d’argile (drainage)',`${nf(drain*P.n,1)} L`,'couche de 3 cm au fond, sous un voile de feutre']);
  if(seasons.includes('e'))out.push(['Engrais longue durée (granulés)',`${nf(terr*P.n*3)} g`,'3 g par litre de terreau à la plantation, puis engrais liquide pour fleurs chaque semaine de juin à septembre']);
  if(b.kind!=='jardin')out.push(['Supports ou crochets de fixation',`${P.n*(P.L>=80?3:2)}`,b.kind==='garde'?'crochets réglables, jardinière posée côté intérieur du garde-corps':'consoles vissées ou barre de retenue devant la jardinière']);
  return{out,vol,terr,kg,P}
}
const boxTips=b=>{const ex=oriExpo(b.ori),t=[];
  t.push(ex==='s'?'Plein soleil : arrosez tous les jours en été (tôt le matin ou le soir), deux fois par jour lors des canicules. Une réserve d’eau évite le stress des plantes.':ex==='m'?'Mi-ombre : arrosez tous les 1 à 2 jours en été, quand la surface du terreau est sèche.':'Ombre : arrosez tous les 2 à 3 jours ; les plantes d’ombre craignent autant le dessèchement que l’excès d’eau.');
  if(b.wind)t.push('Exposé au vent : choisissez des jardinières lourdes et bien fixées, et des plantes souples qui résistent au dessèchement ; le vent assèche le terreau deux fois plus vite.');
  if(b.kind!=='jardin')t.push('Sécurité : une jardinière fixée en hauteur doit être solidement retenue (consoles vissées, crochets réglables, barre de retenue). Sur un balcon, placez-la côté intérieur et vérifiez le règlement de copropriété.');
  if(b.sais!=='h')t.push('Plantation d’été après les Saints de Glace (vers le 15 mai). Pincez les jeunes plants pour les ramifier, retirez les fleurs fanées chaque semaine.');
  if(b.sais!=='e')t.push('Plantation d’hiver en octobre : bulbes en lasagne (les plus gros au fond, les petits au-dessus), puis pensées, bruyères et feuillages par-dessus. Arrosez peu en hiver, mais ne laissez jamais le terreau sécher.');
  t.push('Avant les gelées, rentrez géraniums et fuchsias dans un local clair et hors gel (5 à 10 °C) : ils repartiront au printemps.');
  return t};
function renderBoxes(){
  const el=$('#boxBox');if(!el)return;const cs=harmSet();
  const head=`<div class="card xcard"><h4>Vos emplacements</h4><p>Chaque jardinière suit la règle « une plante haute, des plantes de remplissage, des plantes retombantes ». Les annuelles et saisonnières sont choisies selon l’exposition de l’emplacement et l’harmonie de couleurs du projet.</p>
   <div class="chips"><button type="button" data-addbox="appui">+ Appui de fenêtre</button><button type="button" data-addbox="garde">+ Garde-corps de balcon</button><button type="button" data-addbox="jardin">+ Pots et bacs au jardin</button>
   <label>Harmonie de couleurs<select class="harmSel">${opts(HARM,S.harm.mode)}</select></label><label class="harmBaseL"${['camaieu','analogue','compl'].includes(S.harm.mode)?'':' hidden'}>Teinte<select class="harmBase">${HBASE.map(k=>`<option value="${k}"${k===S.harm.base?' selected':''}>${COL[k][0]}</option>`).join('')}</select></label></div></div>`;
  if(!S.boxes.length){el.innerHTML=head+'<p class="empty">Aucun emplacement. Ajoutez un appui de fenêtre, un garde-corps ou des pots pour obtenir une proposition.</p>';return}
  el.innerHTML=head+S.boxes.map((b,i)=>{const P=boxPlan(b),SU=boxSupplies(b),ex=oriExpo(b.ori),seasons=b.sais==='a'?['e','h']:[b.sais];
    return `<div class="card xcard" data-box="${b.id}"><div class="xhead"><h4>${BOXK[b.kind]} ${i+1}</h4><button type="button" data-bf="del">Supprimer</button></div>
    <div class="frow"><label>Emplacement<select data-bf="kind">${opts(BOXK,b.kind)}</select></label>
     <label>Longueur disponible (m)<input type="number" data-bf="len" min="0.3" max="50" step="0.1" value="${b.len}"></label>
     <label>${b.kind==='appui'?'Profondeur de l’appui (cm)':'Profondeur disponible (cm)'}<input type="number" data-bf="depth" min="5" max="200" value="${b.depth}"></label>
     <label>Orientation<select data-bf="ori">${opts(ORI,b.ori)}</select></label>
     <label>Saison<select data-bf="sais">${opts(SAIS,b.sais)}</select></label>
     <label class="chk"><input type="checkbox" data-bf="wind"${b.wind?' checked':''}> Exposé au vent</label>
     <label class="chk"><input type="checkbox" data-bf="exist"${b.exist?' checked':''}> J’ai déjà des jardinières</label></div>
    ${b.exist?`<div class="frow"><label>Nombre<input type="number" data-bf="n" min="1" max="50" value="${b.n}"></label><label>Longueur (cm)<input type="number" data-bf="L" min="20" max="300" value="${b.L}"></label><label>Largeur (cm)<input type="number" data-bf="W" min="8" max="150" value="${b.W}"></label><label>Hauteur (cm)<input type="number" data-bf="H" min="8" max="150" value="${b.H}"></label></div>`:''}
    <p>${P.prop?'Proposition : ':'Vos jardinières : '}<b>${P.n} jardinière${P.n>1?'s':''} de ${P.L} cm</b> (largeur ${P.W} cm, hauteur ${P.H} cm), soit ${nf(SU.terr,1)} L de terreau chacune et environ <b>${SU.kg} kg</b> une fois arrosée. Exposition retenue : ${EXL[ex].toLowerCase()}.${P.W<17?' Jardinière étroite : une seule rangée de plantes.':''}${P.narrow?' L’appui est trop étroit pour une jardinière posée : fixez-la sur des consoles en façade, ou côté intérieur.':''}${P.H<15?' <span class="koo">Hauteur inférieure à 15 cm : le terreau sèche trop vite, préférez des plantes de terrain sec.</span>':''}</p>
    ${seasons.map(sa=>{const C=boxCompo(b,sa);return `<h4 style="margin-top:12px">${sa==='e'?'Plantation d’été (mi-mai)':'Plantation d’hiver et de printemps (octobre)'}</h4>
     ${C.rows.length?`<table class="stack"><thead><tr><th>Rôle</th><th>Plante</th><th>Fleurs</th><th class="n">Par jardinière</th><th class="n">Total</th></tr></thead><tbody>${C.rows.map(x=>`<tr><td>${JR[x.role]}</td><td><div class="pcell"><div class="ph sm" data-ph="${esc(x.p.l)}" data-n="${esc(x.p.n)}" data-small="1"></div><div><b>${esc(x.p.n)}</b><br><i class="src">${esc(x.p.l)}</i>${x.p.note?`<br><small>${esc(x.p.note)}</small>`:''}</div></div></td><td><span class="dots" style="display:inline-flex">${dots(x.p)}</span>${x.p.c.length>1&&pickCol(x.p,cs)?` <small>fleurs ${COL[pickCol(x.p,cs)][0].toLowerCase()}</small>`:''}</td><td class="n">${x.q}</td><td class="n">${x.q*P.n}</td></tr>`).join('')}</tbody></table>`:'<p class="koo">Aucune plante ne correspond à cette exposition et à cette harmonie : changez l’harmonie de couleurs.</p>'}`}).join('')}
    <h4 style="margin-top:12px">Fournitures</h4><table class="stack"><thead><tr><th>Fourniture</th><th class="n">Quantité</th><th>Détail</th></tr></thead><tbody>${SU.out.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td class="n">${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table>
    <ul>${boxTips(b).map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>`}).join('');
  watchPhotos(el);
}
$('#boxBox').addEventListener('click',e=>{const a=e.target.closest('[data-addbox]');if(a){addBox(a.dataset.addbox);return}
  if(e.target.dataset.bf==='del'){pushUndo();const c=e.target.closest('[data-box]');S.boxes=S.boxes.filter(b=>b.id!=c.dataset.box);renderBoxes();toast('Emplacement supprimé',{undo:true})}});
$('#boxBox').addEventListener('change',e=>{const t=e.target;
  if(t.classList.contains('harmSel')){S.harm.mode=t.value;syncHarmUI();renderBoxes();renderCompo();return}
  if(t.classList.contains('harmBase')){S.harm.base=t.value;syncHarmUI();renderBoxes();renderCompo();return}
  const c=t.closest('[data-box]'),f=t.dataset.bf;if(!c||!f)return;const b=S.boxes.find(x=>x.id==c.dataset.box);if(!b)return;
  if(t.type==='checkbox')b[f]=t.checked;else if(['len','depth','n','L','W','H'].includes(f)){const v=parseFloat(String(t.value).replace(',','.'));if(v>0)b[f]=v}else b[f]=t.value;
  if(f==='kind'){b.depth=b.kind==='appui'?20:b.kind==='garde'?25:60;b.wind=b.kind==='garde'}
  renderBoxes()});

/* ================= Potager : bacs, pleine terre, serre ================= */
const V=(n,l,fam,g,sa,sd,pl,re,er,el,bac,serre,ex,e,easy,note)=>({n,l,fam,g,sa,sd,pl,re,er,el,bac,serre,ex,e,easy,note:note||''});
const VEG=[
V('Tomate','Solanum lycopersicum','Solanacées','Fr',[3,4],[],[5],[7,8,9,10],70,50,1,2,2,'s',1,'Tuteurer et retirer les gourmands ; un abri ou une serre limite le mildiou.'),
V('Courgette','Cucurbita pepo','Cucurbitacées','Fr',[4],[5],[5,6],[7,8,9,10],100,100,1,1,2,'s',1,'Deux pieds suffisent pour une famille.'),
V('Haricot à rames','Phaseolus vulgaris (à rames)','Fabacées','L',[],[5,6],[],[7,8,9,10],60,15,1,0,0,'s',1,'Rames de 2 m ; récolter tous les 2 jours.'),
V('Laitue','Lactuca sativa','Astéracées','F',[2,3],[4,5,6,7,8],[4,5,6,7,8,9],[5,6,7,8,9,10],30,30,1,1,1,'sm',1,'Semer un peu toutes les 3 semaines pour récolter en continu.'),
V('Carotte','Daucus carota','Apiacées','R',[],[3,4,5,6,7],[],[6,7,8,9,10,11],25,5,1,0,0,'sm',1,'Sol léger et sans cailloux ; filet contre la mouche de la carotte.'),
V('Radis','Raphanus sativus','Brassicacées','R',[],[3,4,5,6,7,8,9],[],[4,5,6,7,8,9,10],15,3,1,1,0,'sm',1,'Prêt en 4 semaines : idéal pour débuter.'),
V('Poireau','Allium porrum','Amaryllidacées','F',[2,3,4],[],[6,7],[9,10,11,12,1,2,3],30,15,1,0,1,'sm',1,'Planter profond (habiller les racines et les feuilles) pour un long fût blanc.'),
V('Pois','Pisum sativum','Fabacées','L',[],[3,4,5],[],[6,7],40,5,1,0,0,'sm',1,'Grillage de 1,2 m pour les variétés à rames.'),
V('Haricot nain','Phaseolus vulgaris','Fabacées','L',[],[5,6,7],[],[7,8,9],40,10,1,0,0,'s',1,''),
V('Pomme de terre','Solanum tuberosum','Solanacées','R',[],[],[4,5],[7,8,9],70,35,0,0,1,'s',1,'Rotation stricte contre le mildiou ; butter quand les tiges font 20 cm.'),
V('Oignon','Allium cepa','Amaryllidacées','R',[],[],[3,4],[7,8],25,10,1,0,0,'s',1,'Planter des bulbilles, pointe juste visible.'),
V('Ail','Allium sativum','Amaryllidacées','R',[],[],[10,11,2,3],[6,7],25,10,1,0,0,'s',1,'Gousses plantées à 3 cm de profondeur, pointe en haut.'),
V('Betterave','Beta vulgaris','Amaranthacées','R',[],[4,5,6],[],[7,8,9,10],30,10,1,0,1,'sm',1,''),
V('Épinard','Spinacia oleracea','Amaranthacées','F',[],[3,4,8,9],[],[5,6,10,11],30,10,1,1,1,'sm',1,'Monte vite en graines en été : semer au printemps ou à la fin de l’été.'),
V('Blette','Beta vulgaris var. cicla','Amaranthacées','F',[],[4,5],[],[7,8,9,10,11],40,30,1,0,1,'sm',1,''),
V('Mâche','Valerianella locusta','Valérianacées','F',[],[8,9],[],[10,11,12,1,2,3],15,5,1,1,0,'sm',1,'Le légume-feuille de l’hiver.'),
V('Roquette','Eruca vesicaria','Brassicacées','F',[],[3,4,5,6,7,8,9],[],[4,5,6,7,8,9,10],20,5,1,1,0,'sm',1,''),
V('Chou kale','Brassica oleracea var. sabellica','Brassicacées','F',[4,5],[],[6,7],[10,11,12,1,2],60,50,1,0,2,'sm',1,'Meilleur après les premières gelées.'),
V('Persil','Petroselinum crispum','Apiacées','F',[],[3,4,5,6,7],[],[5,6,7,8,9,10,11,12],25,10,1,1,0,'sm',1,''),
V('Basilic','Ocimum basilicum','Lamiacées','F',[4],[],[5,6],[6,7,8,9],25,25,1,2,0,'s',1,'Craint le froid : planter fin mai, au pied des tomates.'),
V('Courge / potiron','Cucurbita maxima','Cucurbitacées','Fr',[4],[5],[5,6],[9,10],150,150,0,0,2,'s',1,'Se conserve tout l’hiver dans un local sec.'),
V('Concombre','Cucumis sativus','Cucurbitacées','Fr',[4],[],[5,6],[7,8,9],60,50,1,2,2,'s',0,''),
V('Poivron','Capsicum annuum','Solanacées','Fr',[2,3],[],[5],[8,9,10],50,40,1,2,2,'s',0,'Peu productif à l’air libre en Belgique : serre ou pied d’un mur sud.'),
V('Aubergine','Solanum melongena','Solanacées','Fr',[2,3],[],[5],[8,9],60,50,1,2,2,'s',0,'Serre conseillée en Belgique.'),
V('Melon','Cucumis melo','Cucurbitacées','Fr',[4],[],[5,6],[8,9],100,80,0,2,2,'s',0,'Serre conseillée en Belgique.'),
V('Maïs doux','Zea mays','Poacées','Fr',[],[5],[],[8,9],70,30,0,0,2,'s',1,'Semer en carré (pollinisation par le vent) plutôt qu’en une seule ligne.'),
V('Fève','Vicia faba','Fabacées','L',[],[2,3,4],[],[6,7],40,15,0,0,0,'sm',1,'Pincer les têtes contre les pucerons noirs.'),
V('Chou pommé','Brassica oleracea var. capitata','Brassicacées','F',[3,4],[],[5,6],[8,9,10,11],60,50,0,0,2,'sm',0,'Filet anti-insectes contre la piéride et la mouche du chou.'),
V('Brocoli','Brassica oleracea var. italica','Brassicacées','F',[3,4],[],[5,6],[7,8,9,10],60,50,0,0,2,'sm',0,''),
V('Fenouil','Foeniculum vulgare var. azoricum','Apiacées','F',[],[6,7],[],[9,10],40,25,1,0,1,'s',0,''),
V('Navet','Brassica rapa','Brassicacées','R',[],[3,4,7,8],[],[5,6,9,10,11],30,10,1,0,0,'sm',1,''),
V('Panais','Pastinaca sativa','Apiacées','R',[],[3,4,5],[],[10,11,12,1,2,3],35,10,0,0,0,'sm',1,'Germination lente : semer des radis sur le même rang pour le repérer.'),
V('Céleri-rave','Apium graveolens var. rapaceum','Apiacées','R',[3],[],[5,6],[10,11],40,40,0,0,2,'sm',0,'')];
const VG={Fr:'Légumes-fruits (gourmands)',F:'Légumes-feuilles et choux',R:'Légumes-racines et bulbes',L:'Légumineuses (enrichissent le sol)'};
const VGO=['Fr','F','R','L'];
const VMODE={pleine:'En pleine terre (planches)',bac:'En bacs (carrés potagers)',serre:'Sous serre'};
const VGOOD=[['Tomate','Basilic'],['Carotte','Poireau'],['Carotte','Oignon'],['Laitue','Radis'],['Maïs doux','Haricot à rames'],['Maïs doux','Courge / potiron'],['Haricot à rames','Courge / potiron'],['Chou pommé','Céleri-rave'],['Betterave','Laitue'],['Concombre','Haricot nain'],['Épinard','Radis'],['Tomate','Persil']];
const VBAD=[['Pois','Ail'],['Pois','Oignon'],['Pois','Poireau'],['Haricot nain','Ail'],['Haricot nain','Oignon'],['Haricot à rames','Oignon'],['Haricot à rames','Ail'],['Tomate','Pomme de terre'],['Fenouil','Tomate'],['Concombre','Pomme de terre']];
S.veg={mode:'pleine',A:20,lvl:'deb',sel:null,nb:4,bL:120,bW:120,bH:40};
function vegArea(){return S.potagers.length?S.potagers.reduce((s,p)=>s+areaLL(p.pts),0):S.veg.A}
function vegEligible(){const v=S.veg,ex=cond().expo;return VEG.filter(x=>(v.mode!=='bac'||x.bac)&&(v.mode!=='serre'||x.serre)&&(v.lvl!=='deb'||x.easy)&&(v.mode==='serre'||ex!=='o'||x.e==='sm'))}
function vegAuto(){const v=S.veg,A=vegArea(),el=vegEligible();
  if(v.mode==='serre'){return el.filter(x=>x.serre===2).slice(0,A<8?3:5).concat(el.filter(x=>x.g!=='Fr'&&x.serre===1&&x.re.some(m=>m>=10||m<=3)).slice(0,3))}
  const k=v.mode==='bac'?(v.nb<=2?2:3):A<20?3:A<60?4:5;return VGO.flatMap(g=>el.filter(x=>x.g===g).slice(0,k))}
function vegCrops(){const el=vegEligible();return S.veg.sel?el.filter(x=>S.veg.sel.has(x.n)):vegAuto()}
function vegPlan(){
  const v=S.veg,A=vegArea(),crops=vegCrops(),out={A,crops,beds:[],parts:[]};
  if(v.mode==='bac'){const ba=v.bL*v.bW/1e4;out.cult=v.nb*ba;out.unit=`${v.nb} bac${v.nb>1?'s':''} de ${v.bL} × ${v.bW} cm, hauteur ${v.bH} cm`;
    for(let i=0;i<v.nb;i++)out.beds.push({name:`Bac ${i+1}`,g:VGO[i%4],a:ba})}
  else if(v.mode==='serre'){out.cult=A*0.6;out.unit=`planches de 0,9 m de large et allée centrale de 0,6 m (${nf(out.cult,1)} m² cultivés)`;out.beds.push({name:'Saison chaude (mai à octobre)',g:'Fr',a:out.cult},{name:'Saison froide (octobre à avril)',g:'F',a:out.cult})}
  else{const Lp=Math.max(2,Math.min(10,Math.round(Math.sqrt(A)))),cult=A*0.75,n=Math.max(4,Math.floor(cult/(1.2*Lp)));out.cult=n*1.2*Lp;out.unit=`${n} planches de 1,2 m × ${Lp} m, allées de 40 cm`;for(let i=0;i<n;i++)out.beds.push({name:`Planche ${i+1}`,g:VGO[i%4],a:1.2*Lp})}
  const gArea={};out.beds.forEach(b=>gArea[b.g]=(gArea[b.g]||0)+b.a);
  const warm=x=>x.g==='Fr'||x.serre===2,cg=g=>v.mode==='serre'?(g==='Fr'?crops.filter(warm):crops.filter(x=>!warm(x))):crops.filter(x=>x.g===g);
  for(const g of (v.mode==='serre'?['Fr','F']:VGO)){const cs=cg(g);if(!cs.length||!gArea[g])continue;const a=gArea[g]/cs.length;
    cs.forEach(x=>{const dens=1e4/(x.er*x.el),q=Math.max(1,Math.round(a*dens));out.parts.push({x,g,a,q,row:a/(x.er/100),seed:x.sd.length>0&&!x.pl.length})})}
  return out;
}
function vegSupplies(P){const v=S.veg,o=[],kgM={Fr:4,F:3,R:1,L:0};
  const comp=P.parts.reduce((s,p)=>s+p.a*(kgM[p.g]||0),0);
  o.push(['Compost mûr',`${nf(comp)} kg`,`≈ ${Math.max(1,Math.ceil(comp/20))} sac(s) de 40 L ; 4 kg/m² pour les légumes-fruits, 3 kg/m² pour les feuilles, 1 kg/m² pour les racines, rien pour les légumineuses`]);
  if(v.mode==='bac'){const vol=v.bL*v.bW*v.bH/1000;o.push(['Remplissage des bacs',`${nf(vol*v.nb)} L`,v.bH>=60?`par bac : 1/3 de branchages et broyat au fond, 1/3 de feuilles et compost, 1/3 de terre de jardin et terreau (${nf(vol/3)} L chacun)`:`par bac : moitié terre de jardin, moitié compost (${nf(vol/2)} L chacun)`]);
    o.push(['Bacs',`${v.nb}`,`bois non traité (douglas, mélèze) ou acier ; ${v.bH>=60?'bac surélevé : travail sans se baisser':'posé sur la terre, fond ouvert'} ; grillage anti-taupes au fond`])}
  o.push(['Paillage (paille, tontes sèches)',`${nf(P.cult*0.05*1000)} L`,'5 cm entre les rangs après la levée, sauf sur les semis en place']);
  o.push(['Engrais vert pour l’automne',`${nf(P.cult*2)} g`,'phacélie (2 g/m²) ou seigle et vesce, semés après les dernières récoltes']);
  if(P.parts.some(p=>/Bras|Daucus|Allium porrum/.test(p.x.l)))o.push(['Filet anti-insectes (maille 0,8 mm)',`${nf(P.parts.filter(p=>/Bras|Daucus|Allium porrum/.test(p.x.l)).reduce((s,p)=>s+p.a,0)*1.5,1)} m²`,'contre la mouche de la carotte, la mouche du poireau et la piéride du chou']);
  o.push(['Récupérateur d’eau de pluie',`${nf(Math.max(300,Math.round(P.cult*30/100)*100))} L`,'15 à 20 L par m² et par semaine lors des sécheresses ; arrosez le soir, au pied']);
  if(v.mode==='serre')o.push(['Thermomètre mini-maxi et filet d’ombrage','1 de chaque','ouvrir dès 25 °C ; ombrer de juin à août']);
  return o}
function vegCal(P){const cell=(x,m)=>{let t='';if(x.sa.includes(m))t+='S';if(x.sd.includes(m))t+='D';if(x.pl.includes(m))t+='P';if(x.re.includes(m))t+='R';return t};
  return `<table class="vcal"><thead><tr><th>Légume</th>${MO.map(m=>`<th>${m}</th>`).join('')}</tr></thead><tbody>${P.parts.map(p=>`<tr><td>${esc(p.x.n)}</td>${[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>{const c=cell(p.x,m);return `<td class="${c.includes('R')?'re':c.includes('P')?'pl':c.includes('D')?'sd':c?'sa':''}">${c}</td>`}).join('')}</tr>`).join('')}</tbody></table>
  <div class="cleg"><span class="sa">S</span> Semis sous abri <span class="sd">D</span> Semis en place <span class="pl">P</span> Plantation <span class="re">R</span> Récolte</div><p class="note">Les dates conviennent à la moyenne Belgique ; décalez de 1 à 2 semaines en Ardenne.</p>`}
function renderVeg(){
  const el=$('#vegBox');if(!el)return;const v=S.veg,P=vegPlan(),A=vegArea(),elig=vegEligible(),selN=new Set(P.crops.map(x=>x.n)),c=cond();
  const names=new Set(P.crops.map(x=>x.n)),good=VGOOD.filter(([a,b])=>names.has(a)&&names.has(b)),bad=VBAD.filter(([a,b])=>names.has(a)&&names.has(b));
  el.innerHTML=`<div class="card xcard"><div class="frow"><label>Type de potager<select data-vf="mode">${opts(VMODE,v.mode)}</select></label>
   <label>Niveau<select data-vf="lvl"><option value="deb"${v.lvl==='deb'?' selected':''}>Débutant (légumes faciles)</option><option value="conf"${v.lvl==='conf'?' selected':''}>Confirmé (tous les légumes)</option></select></label>
   ${S.potagers.length?`<span class="note">Surface dessinée : <b>${nf(A,1)} m²</b></span>`:`<label>${v.mode==='serre'?'Surface de la serre (m²)':'Surface (m²)'}<input type="number" data-vf="A" min="1" max="5000" value="${v.A}"></label>`}
   ${v.mode==='bac'?`<label>Nombre de bacs<input type="number" data-vf="nb" min="1" max="40" value="${v.nb}"></label><label>Longueur (cm)<input type="number" data-vf="bL" min="40" max="400" value="${v.bL}"></label><label>Largeur (cm)<input type="number" data-vf="bW" min="30" max="150" value="${v.bW}"></label><label>Hauteur (cm)<input type="number" data-vf="bH" min="15" max="100" value="${v.bH}"></label>`:''}
   <button type="button" data-vf="draw">Dessiner le potager sur la carte</button></div>
   ${c.expo==='o'&&v.mode!=='serre'?'<p class="koo">Le site est à l’ombre : la plupart des légumes demandent au moins 6 heures de soleil. Seuls les légumes-feuilles et quelques racines sont proposés.</p>':''}
   <p class="note" style="margin:10px 0 4px">Légumes retenus (cliquez pour ajouter ou retirer) :</p><div class="chips vchips">${elig.map(x=>`<button type="button" data-veg="${esc(x.n)}" aria-pressed="${selN.has(x.n)}">${esc(x.n)}</button>`).join('')}${S.veg.sel?'<button type="button" data-vf="auto">Proposition automatique</button>':''}</div></div>
  <div class="grid2" style="margin-top:14px"><div class="card"><h4>Organisation : ${esc(P.unit)}</h4>
   <table class="stack"><thead><tr><th>${v.mode==='bac'?'Bac':v.mode==='serre'?'Période':'Planche'}</th><th>Groupe (année 1)</th><th>Cultures</th></tr></thead><tbody>${P.beds.map(b=>`<tr><td><b>${esc(b.name)}</b></td><td>${v.mode==='serre'?(b.g==='Fr'?'Légumes-fruits':'Légumes d’hiver'):VG[b.g]}</td><td>${P.parts.filter(p=>p.g===b.g).map(p=>esc(p.x.n)).join(', ')||'—'}</td></tr>`).join('')}</tbody></table>
   ${v.mode!=='serre'?`<p class="note">Rotation sur 4 ans : chaque ${v.mode==='bac'?'bac':'planche'} passe chaque année au groupe suivant : légumes-fruits → légumes-feuilles → racines → légumineuses, puis retour aux légumes-fruits avec un apport de compost. On évite ainsi l’épuisement du sol et les maladies.</p>`:'<p class="note">Sous serre, la rotation est difficile : alternez les familles d’une année à l’autre et renouvelez ou amendez la terre tous les 3 à 4 ans.</p>'}</div>
   <div class="card"><h4>Quantités</h4><table class="stack"><thead><tr><th>Légume</th><th class="n">Surface</th><th class="n">Plants ou graines</th><th>Écartement</th></tr></thead><tbody>${P.parts.map(p=>`<tr><td><b>${esc(p.x.n)}</b><br><i class="src">${esc(p.x.l)}</i>${p.x.note?`<br><small>${esc(p.x.note)}</small>`:''}</td><td class="n">${nf(p.a,1)} m²</td><td class="n">${p.seed?`${nf(p.row,1)} m de rang (semis)`:`${p.q} plant${p.q>1?'s':''}`}</td><td>${p.x.er} × ${p.x.el} cm</td></tr>`).join('')}</tbody></table></div></div>
  <h3>Calendrier des semis, plantations et récoltes</h3><div class="card scroll">${vegCal(P)}</div>
  <div class="grid2" style="margin-top:14px"><div class="card"><h4>Associations</h4>${good.length||bad.length?`<ul>${good.map(([a,b])=>`<li class="okk">${a} et ${b} : bonne association</li>`).join('')}${bad.map(([a,b])=>`<li class="koo">${a} et ${b} : à séparer</li>`).join('')}</ul>`:'<p class="note">Aucune association particulière entre les légumes retenus.</p>'}<p class="note">Glissez aussi des fleurs (œillets d’Inde, capucines, soucis, bourrache) en bout de planche : elles attirent les pollinisateurs et les auxiliaires.</p></div>
   <div class="card"><h4>Fournitures</h4><table class="stack"><tbody>${vegSupplies(P).map(r=>`<tr><td><b>${esc(r[0])}</b></td><td class="n">${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div></div>
  <ul>${(v.mode==='serre'?['Orientez le faîtage est-ouest : la serre capte mieux le soleil bas de l’hiver.','Prévoyez des ouvrants sur au moins un sixième de la surface et aérez dès 25 °C ; l’excès d’humidité favorise les maladies.','Arrosez le matin, au pied, avec de l’eau à température ambiante.']:v.mode==='bac'?['Placez les bacs en plein soleil, à 60–80 cm d’intervalle pour passer avec une brouette.','La terre des bacs se tasse : complétez chaque printemps avec 5 cm de compost.','Un bac surélevé sèche plus vite qu’une planche : paillez et arrosez plus souvent.']:['Orientez les planches nord-sud : les deux côtés reçoivent le même soleil.','Ne marchez jamais sur les planches : travaillez depuis les allées, à la grelinette, sans retourner la terre.','Gardez le sol couvert toute l’année : paillage en été, engrais vert ou feuilles mortes en hiver.']).map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;
}
$('#vegBox').addEventListener('click',e=>{const b=e.target.closest('[data-veg]');if(b){const n=b.dataset.veg;if(!S.veg.sel)S.veg.sel=new Set(vegPlan().crops.map(x=>x.n));S.veg.sel.has(n)?S.veg.sel.delete(n):S.veg.sel.add(n);renderVeg();return}
  const f=e.target.dataset&&e.target.dataset.vf;if(f==='auto'){S.veg.sel=null;renderVeg()}if(f==='draw'){setMode('potager');showTab('carte',true)}});
$('#vegBox').addEventListener('change',e=>{const t=e.target,f=t.dataset.vf;if(!f)return;if(['A','nb','bL','bW','bH'].includes(f)){const x=parseFloat(t.value);if(x>0)S.veg[f]=x}else{S.veg[f]=t.value;if(f==='mode'||f==='lvl')S.veg.sel=null}renderVeg()});

/* ================= Verger : essences, variétés, pollinisation, récoltes ================= */
FRUITS.push({n:'Abricotier',l:'Prunus armeniaca',z:-23,e:'s',s:'sl',w:'df',v:"'Bergeron', 'Polonais'",poll:'Autofertile ; floraison précoce sensible au gel : palisser contre un mur sud.',formes:'bt pal'},
 {n:'Noisetier',l:'Corylus avellana',z:-29,e:'sm',s:'sla',w:'f',v:"'Merveille de Bollwiller' avec 'Cosford' comme pollinisateur",poll:'Planter au moins deux variétés.',formes:'bt'},
 {n:'Fruitier indigène',l:'Cornus mas',z:-29,e:'sm',s:'sla',w:'df',v:'cornouiller mâle, sureau noir, alisier torminal',poll:'Espèces sauvages pollinisées par les insectes.',formes:'bt dt'});
const OV=(n,fg,poll,m,use,orig,o={})=>({n,fg,poll,m,use,orig,...o});
const ORCH={
 pommier:{n:'Pommier',l:'Malus domestica',fi:0,w:4,need:1,rs:{ht:'franc (semis) ou MM111',dt:'MM106 ou MM111',bt:'M26 ou MM106 (en fuseau : M9)',pal:'M9 ou M26'},vars:[
  OV('Grenadier',2.5,'',[8,9],'C','rgf',{rust:1}),OV('Joseph Musch',2,'',[9,10,11,12,1],'CT','rgf'),OV('Président Roulin',3,'T',[9,10,11,12],'CT','rgf',{rust:1}),
  OV('Reinette de Blenheim',3,'',[9,10,11,12,1],'TC','rgf'),OV('Reinette Evagil',4,'T',[9],'T','rgf'),OV('Transparente de Lesdain',4,'T',[9,10],'T','rgf'),
  OV('Cwastresse Double',4,'',[9,10,11,12],'TJ','rgf'),OV('Radoux',4,'T',[9,10,11,12,1],'T','rgf'),OV('Reinette Hernaut',4,'',[10,11,12,1,2,3,4],'TCJK','rgf',{rust:1}),
  OV('Gris Braibant',4,'',[10,11,12,1,2,3,4,5],'CJK','rgf'),OV('Godivert',4,'',[10,11,12,1,2,3,4,5],'TK','rgf'),OV('Président Van Dievoet',4,'',[10,11,12,1,2,3,4,5,6],'TCK','rgf',{rust:1}),
  OV('La Paix',4.5,'T',[9,10],'T','rgf'),OV('Reinette de Waleffe',5,'',[10,11,12,1,2,3,4,5],'TK','rgf'),OV('Reinette Dubois',6,'T',[10,11,12,1,2,3,4,5],'TCK','rgf'),
  OV('Jacques Lebel',4,'',[9,10,11,12],'CJ','trad'),OV('Reine des Reinettes',4,'',[9,10,11],'TC','trad'),OV('Belle-Fleur de Brabant',6,'T',[11,12,1,2,3],'CK','trad'),
  OV('Topaz',4,'',[10,11,12,1,2],'TK','mod',{note:'résistante à la tavelure'}),OV('Santana',4,'',[9,10,11,12],'T','mod',{note:'résistante à la tavelure'})]},
 poirier:{n:'Poirier',l:'Pyrus communis',fi:1,w:2,need:1,rs:{ht:'franc (semis de poirier)',dt:'franc',bt:'cognassier BA29 ou Adams',pal:'cognassier Adams'},vars:[
  OV('Précoce de Trévoux',2,'P',[8],'T','trad'),OV('Comtesse de Paris',2,'X',[11,12,1],'T','trad'),OV('Beurré Alexandre Lucas',2,'T',[11,12],'T','trad',{note:'triploïde : ne pollinise pas'}),
  OV('Louise Bonne d’Avranches',2.5,'X',[9,10],'T','trad'),OV('Ananas de Courtrai',3,'X',[8],'T','trad'),OV('Beurré Lebrun',3,'P',[11,12],'T','trad'),OV('Duchesse d’Angoulême',3,'X',[10,11],'T','trad'),
  OV('Bon Chrétien Williams',4,'P',[8,9],'TJ','trad'),OV('Triomphe de Vienne',4,'P',[9],'T','trad'),OV('Beurré Hardy',4,'X',[9,10],'T','trad'),OV('Conférence',4,'X',[10,11,12],'TK','trad'),
  OV('Durondeau',4,'P',[10,11],'TC','trad'),OV('Légipont',4,'X',[10,11],'TJ','trad',{note:'poire à sirop liégeoise'}),OV('Saint-Rémy',4,'',[11,12,1,2,3],'CK','trad',{note:'poire à cuire'}),
  OV('Joséphine de Malines',5,'X',[12,1,2,3],'TK','trad'),OV('Doyenné du Comice',6,'X',[10,11,12],'T','trad'),OV('Concorde',4,'P',[10,11,12],'TK','mod')]},
 prunier:{n:'Prunier',l:'Prunus domestica',fi:2,w:2,need:0,rs:{ht:'Myrobolan ou Brompton',dt:'Myrobolan ou Saint-Julien A',bt:'Saint-Julien A',pal:'Saint-Julien A'},vars:[
  OV('Prune de Prince',1.5,'AF',[8],'TC','trad'),OV('Belle de Thuin',1.5,'X',[8],'T','trad'),OV('Reine-Claude de Bavay',2,'AF',[9],'T','trad'),OV('Queen Victoria',2.5,'AF',[8,9],'TC','trad'),
  OV('Reine-Claude d’Oullins',3,'AF',[8],'T','trad'),OV('Monsieur Hâtif',3,'X',[7,8],'TC','trad'),OV('Bleue de Belgique',3,'AF',[8],'TC','trad'),OV('Reine-Claude verte',3,'X',[8],'T','trad'),
  OV('Sainte-Catherine',3.5,'AF',[9],'CK','trad',{note:'idéale pour sécher (pruneaux)'}),OV('Mirabelle de Metz',4,'AF',[8,9],'TC','trad'),OV('Mirabelle de Nancy',4,'AF',[8,9],'TC','trad'),
  OV('Belle de Louvain',4,'AF',[8,9],'C','trad'),OV('Altesse Double',4,'AF',[9],'C','trad'),OV('Altesse Simple',5,'AF',[9,10],'C','trad')]},
 cerisier:{n:'Cerisier',l:'Prunus avium',fi:3,w:2,need:1,cherry:1,rs:{ht:'merisier (franc) ou F12/1',dt:'Colt ou merisier',bt:'Gisela 5',pal:'Gisela 5'},vars:[
  OV('Burlat',0,'X',[6],'T','trad',{S:'S3S9'}),OV('Helshoven',-2,'X',[7],'T','rgf',{S:'S1S3'}),OV('Ulster',-1,'X',[7],'T','mod',{S:'S3S4'}),OV('Stella',-1,'AF',[7],'T','mod',{S:'S3S4*',note:'autofertile, bon pollinisateur'}),
  OV('Kordia',0,'X',[7],'T','mod',{S:'S3S4'}),OV('Annabella',3,'X',[7],'T','mod',{S:'S1S5'}),OV('Castor',3,'X',[7],'T','mod',{S:'S1S12'}),OV('Semis Ghijssens',3,'X',[7],'T','rgf',{S:'S1S2'}),
  OV('Schneiders späte Knorpelkirsche',3,'X',[7],'T','trad',{S:'S3S12'}),OV('Hedelfinger',4,'X',[7],'T','trad',{S:'S3S5'}),OV('Sam',6,'X',[7],'T','mod',{S:'S2S4'}),OV('Regina',9,'X',[7],'T','mod',{S:'S1S3'}),
  OV('Griotte du Nord',8,'AF',[7,8],'C','trad',{acid:1,note:'cerise acide pour confitures et clafoutis'})]},
 cognassier:{n:'Cognassier',l:'Cydonia oblonga',fi:4,w:1,need:0,rs:{ht:'—',dt:'cognassier de Provence',bt:'cognassier A',pal:'—'},vars:[OV('Champion',0,'AF',[10],'CK','trad'),OV('Géant de Vranja',0,'AF',[10],'CK','trad')]},
 neflier:{n:'Néflier',l:'Mespilus germanica',fi:5,w:1,need:0,rs:{ht:'aubépine ou cognassier',dt:'aubépine ou cognassier',bt:'cognassier',pal:'—'},vars:[OV('Nottingham',0,'AF',[11,12],'C','trad',{note:'nèfles à laisser blettir'}),OV('Néflier commun',0,'AF',[11,12],'C','sauv')]},
 noyer:{n:'Noyer',l:'Juglans regia',fi:8,w:1,need:0,big:1,rs:{ht:'franc (Juglans regia)',dt:'franc',bt:'—',pal:'—'},vars:[OV('Franquette',0,'P',[9,10],'TK','mod',{note:'débourrement tardif, évite les gelées'}),OV('Lara',0,'P',[9,10],'TK','mod')]},
 pecher:{n:'Pêcher',l:'Prunus persica',fi:6,w:1,need:0,rs:{ht:'—',dt:'—',bt:'prunier Saint-Julien A',pal:'prunier Saint-Julien A'},vars:[OV('Pêche de vigne',0,'AF',[9],'TC','trad'),OV('Revita',0,'AF',[8],'T','mod',{note:'tolérante à la cloque'})]},
 abricotier:{n:'Abricotier',l:'Prunus armeniaca',fi:9,w:1,need:0,rs:{ht:'—',dt:'—',bt:'prunier Saint-Julien A',pal:'prunier Saint-Julien A'},vars:[OV('Bergeron',0,'AF',[7,8],'TC','trad',{note:'floraison assez tardive'})]},
 noisetier:{n:'Noisetier',l:'Corylus avellana',fi:10,w:1,need:1,nut:1,rs:{ht:'—',dt:'—',bt:'franc (cépée)',pal:'—'},vars:[OV('Merveille de Bollwiller',0,'X',[9],'TK','trad'),OV('Cosford',0,'',[9],'TK','trad',{note:'pollinisateur de Bollwiller'}),OV('Noisetier commun',0,'',[9],'T','sauv')]},
 sauvage:{n:'Fruitiers sauvages indigènes',l:'Malus sylvestris, Pyrus pyraster…',fi:11,w:1,need:0,rs:{ht:'franc',dt:'franc',bt:'franc',pal:'—'},vars:[OV('Pommier sauvage (Malus sylvestris)',0,'',[9,10],'CJ','sauv'),OV('Poirier sauvage (Pyrus pyraster)',0,'',[10],'C','sauv'),OV('Merisier (Prunus avium)',0,'',[7],'T','sauv'),OV('Cornouiller mâle (Cornus mas)',0,'AF',[8,9],'C','sauv'),OV('Alisier torminal (Sorbus torminalis)',0,'',[10],'C','sauv'),OV('Sureau noir (Sambucus nigra)',0,'AF',[8,9],'C','sauv')]}};
const OTYPE={ht:'Haute-tige (pré-verger, pâturable)',dt:'Demi-tige',bt:'Basse-tige (gobelet, fuseau)',pal:'Palissé (espalier, contre-espalier)'};
const OUSE={T:'À croquer',C:'Cuisine (compote, tarte, cuisson)',J:'Jus, cidre ou sirop',K:'Fruits de garde (hiver)'};
const OHAR={ete:['Été (juin à août)',[6,7,8]],sep:['Fin d’été (septembre)',[9]],aut:['Automne (octobre, novembre)',[10,11]],hiv:['Hiver (fruits conservés)',[12,1,2,3,4,5]]};
const OORIG={reg:'Variétés anciennes et régionales (dont RGF-Gembloux)',mod:'Variétés modernes résistantes',tous:'Toutes les variétés'};
S.orch={type:'dt',A:300,n:0,sp:new Set(['pommier','poirier','prunier','cerisier']),use:new Set(['T','C','K']),har:new Set(['ete','sep','aut','hiv']),orig:'reg',wild:false};
const orSpace=(k,t)=>{const fo=FORMES[t]||FORMES.dt;let s=fo.sp;if(ORCH[k].big)s=Math.max(s,12);if(k==='cerisier'&&t==='bt')s=5;if(k==='noisetier')s=4;return s};
function orchPositions(){
  const t=S.orch.type,sp=Math.max(...[...S.orch.sp].map(k=>orSpace(k,t)),2);
  if(!S.orchards.length)return null;const out=[];
  S.orchards.forEach(o=>{const o0=o.pts[0],P=o.pts.map(p=>toXY(o0,p)),xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),dy=t==='pal'?3:sp*0.866;
    const ring=S.parcel?S.parcel.ring.map(([lo,la])=>toXY(o0,[la,lo])):null,ed=(x,y,R)=>Math.min(...R.map((a,i)=>{const b=R[(i+1)%R.length];return segDist(x,y,a[0],a[1],b[0],b[1])}));
    let r=0;for(let y=Math.min(...ys)+sp/2;y<Math.max(...ys);y+=dy,r++)for(let x=Math.min(...xs)+(r%2&&t!=='pal'?sp:sp/2);x<Math.max(...xs);x+=(t==='pal'?2.5:sp)){
      if(!pip(x,y,P)||ed(x,y,P)<Math.min(sp/2*0.7,2))continue;if(ring&&ed(x,y,ring)<2)continue;
      out.push([o0[0]+y/111320,o0[1]+x/(111320*Math.cos(o0[0]*R))])}});
  return out}
function orchPlan(){
  const O=S.orch,c=cond(),A=S.orchards.length?S.orchards.reduce((s,o)=>s+areaLL(o.pts),0):O.A,pos=orchPositions();
  const keys=[...O.sp].filter(k=>ORCH[k]);if(O.wild&&!keys.includes('sauvage'))keys.push('sauvage');
  if(!keys.length)return{A,N:0,trees:[],keys,warn:['Choisissez au moins une essence.']};
  const sp=Math.max(...keys.map(k=>orSpace(k,O.type)));
  let N=O.n>0?O.n:pos?pos.length:Math.max(1,Math.floor(A/(O.type==='pal'?2.5*3:sp*sp*0.866)));
  const wt=keys.map(k=>ORCH[k].w),tw=wt.reduce((a,b)=>a+b,0),cnt={};keys.forEach((k,i)=>cnt[k]=Math.max(N>=keys.length?1:0,Math.round(N*wt[i]/tw)));
  let sum=Object.values(cnt).reduce((a,b)=>a+b,0);while(sum>N){const k=keys.slice().sort((a,b)=>cnt[b]-cnt[a])[0];if(cnt[k]<=1)break;cnt[k]--;sum--}while(sum<N){cnt[keys[0]]++;sum++}
  const months=new Set([...O.har].flatMap(h=>OHAR[h][1])),cold=c.tmin!=null&&c.tmin<-17;
  const trees=[],warn=[];
  keys.forEach(k=>{const D=ORCH[k];let n=cnt[k];if(!n)return;
    const okO=v=>O.orig==='tous'||(O.orig==='reg'?v.orig!=='mod':v.orig==='mod');
    let L=D.vars.filter(okO);if(!L.length)L=D.vars;
    const sc=v=>[...v.use].filter(u=>O.use.has(u)).length*4+(v.m.some(m=>months.has(m))?4:0)+(v.orig==='rgf'?2:0)+(cold&&v.rust?3:0)-(v.poll==='T'?1:0)-(v.acid&&!O.use.has('C')?6:0);
    const ps={months:new Set(),cols:new Set()},picks=pickDiverse(L.map(v=>({p:{f:v.m,c:[]},score:sc(v),v})),Math.min(n,L.length),ps).map(x=>x.v);
    while(picks.length<n)picks.push(picks[picks.length%Math.max(1,picks.length)]);
    picks.forEach(v=>trees.push({k,v}))});
  // pollinisation
  const compat=(k,a,b)=>{if(a===b)return false;const D=ORCH[k];if(D.cherry){if(a.acid||b.acid)return false;if(b.poll==='AF')return Math.abs(a.fg-b.fg)<=6;return a.S!==b.S&&Math.abs(a.fg-b.fg)<=6}if(D.nut)return true;return b.poll!=='T'&&Math.abs(a.fg-b.fg)<=1};
  const added=[];
  keys.forEach(k=>{const D=ORCH[k];const vs=[...new Set(trees.filter(t=>t.k===k).map(t=>t.v))];
    vs.forEach(v=>{if(v.poll==='AF'||(!D.need&&v.poll!=='X'))return;if(vs.some(w=>compat(k,v,w)))return;
      const cand=D.vars.filter(w=>compat(k,v,w)&&!w.acid).sort((a,b)=>(b.orig===(O.orig==='mod'?'mod':'rgf'))-(a.orig===(O.orig==='mod'?'mod':'rgf'))||b.use.length-a.use.length)[0];
      if(cand&&!vs.includes(cand)){vs.push(cand);trees.push({k,v:cand,poll:1});added.push(`${D.n} '${cand.n}' ajouté pour polliniser '${v.n}'`)}
      else if(k==='pommier')warn.push(`Aucun pollinisateur trouvé pour '${v.n}' : un pommier d’ornement 'Evereste' à proximité fera l’affaire.`)})});
  trees.forEach(t=>{const D=ORCH[t.k],vs=[...new Set(trees.filter(x=>x.k===t.k).map(x=>x.v))];t.by=vs.filter(w=>compat(t.k,t.v,w)).map(w=>w.n)});
  if(pos&&trees.length>pos.length)warn.push(`La zone dessinée accueille ${pos.length} arbres à ${nf(sp,1)} m d’écartement : ${trees.length-pos.length} arbre(s) de pollinisation en plus à placer ailleurs, ou choisissez une forme plus petite.`);
  if(O.type==='ht'&&A<400)warn.push('Une haute-tige demande environ 80 à 100 m² par arbre : sur une petite surface, la demi-tige ou la basse-tige conviennent mieux.');
  if(c.expo==='o')warn.push('Le site est ombragé : les fruitiers ont besoin de 6 heures de soleil au moins pour fructifier.');
  if(c.eau==='h')warn.push('Sol humide : plantez sur une butte de 30 à 40 cm et préférez poiriers sur franc, pruniers et néfliers.');
  return{A,N,trees,keys,sp,pos,warn,added}
}
function renderOrch(){
  const el=$('#orchBox');if(!el)return;const O=S.orch,P=orchPlan(),c=cond();
  const ck=(name,set,obj,lab)=>Object.entries(obj).map(([k,v])=>`<label class="chk"><input type="checkbox" data-oset="${name}" value="${k}"${set.has(k)?' checked':''}> ${Array.isArray(v)?v[0]:typeof v==='string'?v:v.n}</label>`).join('');
  const fl=v=>v.fg?(ORCH.cerisier.vars.includes(v)?`${v.fg>0?'+':''}${v.fg} j / Burlat`:`groupe ${String(v.fg).replace('.',',')}`):'—';
  el.innerHTML=`<div class="card xcard"><div class="frow"><label>Type de verger<select data-of="type">${opts(OTYPE,O.type)}</select></label>
    ${S.orchards.length?`<span class="note">Surface dessinée : <b>${nf(P.A)} m²</b></span>`:`<label>Surface (m²)<input type="number" data-of="A" min="5" max="100000" value="${O.A}"></label>`}
    <label>Nombre d’arbres (0 = automatique)<input type="number" data-of="n" min="0" max="500" value="${O.n}"></label>
    <label>Variétés<select data-of="orig">${opts(OORIG,O.orig)}</select></label>
    <label class="chk"><input type="checkbox" data-of="wild"${O.wild?' checked':''}> Ajouter des fruitiers sauvages indigènes</label>
    <button type="button" data-of="draw">Dessiner le verger sur la carte</button></div>
   <p class="note" style="margin:8px 0 4px">Essences :</p><div class="chips">${ck('sp',O.sp,Object.fromEntries(Object.entries(ORCH).filter(([k])=>k!=='sauvage')),'')}</div>
   <p class="note" style="margin:8px 0 4px">Usages souhaités :</p><div class="chips">${ck('use',O.use,OUSE)}</div>
   <p class="note" style="margin:8px 0 4px">Périodes de récolte et de consommation souhaitées :</p><div class="chips">${ck('har',O.har,OHAR)}</div></div>
  <div class="kpis" style="margin-top:14px"><div class="kpi"><small>Arbres</small><b>${P.trees.length}</b></div><div class="kpi"><small>Écartement</small><b>${nf(P.sp||0,1)} m</b><span>${O.type==='pal'?'rangs à 3 m':'en quinconce'}</span></div><div class="kpi"><small>Surface</small><b>${nf(P.A)} m²</b></div><div class="kpi"><small>Distance à la limite</small><b>2 m</b><span>minimum légal (tronc)</span></div></div>
  ${P.warn.length?`<ul>${P.warn.map(w=>`<li class="koo">${esc(w)}</li>`).join('')}</ul>`:''}
  ${P.added&&P.added.length?`<p class="okk">${P.added.map(esc).join(' · ')}.</p>`:''}
  <div class="card scroll"><table class="stack"><thead><tr><th>N°</th><th>Essence</th><th>Variété</th><th>Floraison</th><th>Pollinisée par</th><th>Récolte et consommation</th><th>Usages</th><th>Porte-greffe conseillé</th></tr></thead><tbody>${P.trees.map((t,i)=>`<tr><td><b>${i+1}</b></td><td><div class="pcell"><div class="ph sm" data-ph="${esc(ORCH[t.k].l.split(',')[0])}" data-n="${esc(ORCH[t.k].n)}" data-small="1"></div><div><b>${esc(ORCH[t.k].n)}</b></div></div></td><td><b>'${esc(t.v.n)}'</b>${t.v.orig==='rgf'?' <span class="badge">RGF</span>':''}${t.poll?' <span class="badge">pollinisateur</span>':''}${t.v.note?`<br><small>${esc(t.v.note)}</small>`:''}</td><td>${fl(t.v)}</td><td>${t.v.poll==='AF'?'autofertile':t.by.length?t.by.map(n=>`'${esc(n)}'`).join(', '):(ORCH[t.k].need||t.v.poll==='X'?'<span class="koo">à prévoir</span>':'—')}</td><td>${romMonths(t.v.m)}</td><td>${[...t.v.use].map(u=>OUSE[u].split(' (')[0]).join(', ')}</td><td>${esc(ORCH[t.k].rs[O.type]||'—')}</td></tr>`).join('')}</tbody></table></div>
  <figure class="card" style="margin-top:14px"><figcaption>Calendrier des récoltes et de la consommation</figcaption><div class="hcal">${[...new Map(P.trees.map(t=>[t.k+t.v.n,t])).values()].map(t=>`<div class="hr"><span>${esc(ORCH[t.k].n)} '${esc(t.v.n)}'</span><div>${[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>hcCell(t,m)).join('')}</div></div>`).join('')}<div class="hr hm"><span></span><div>${MI.map(x=>`<i>${x}</i>`).join('')}</div></div></div>${hcLegend(P)}</figure>
  <div class="grid2" style="margin-top:14px"><div class="card"><h4>Plantation et distances</h4><ul>
   <li>Écartement : ${nf(P.sp||0,1)} m entre les arbres${O.type==='pal'?', palissés sur 3 fils tendus entre des poteaux, rangs espacés de 3 m':''} ; au moins 5 m d’un bâtiment pour une haute-tige ou une demi-tige.</li>
   <li>Distance légale (Code civil, art. 3.133) : 2 m de la limite de propriété, mesurés au milieu du tronc, pour un arbre de plus de 2 m.</li>
   <li>Plantez de novembre à mars, hors gel : trou de 80 × 80 cm, terre ameublie, point de greffe 10 cm au-dessus du sol, tuteur côté vent dominant.</li>
   <li>Protégez les troncs (gaine anti-lapins, corset contre le bétail ou les chevreuils) et paillez un cercle d’1 m sans herbe pendant 3 ans.</li>
   <li>Pollinisation : chaque variété autostérile a besoin d’une autre variété compatible qui fleurit en même temps, à moins de 50 m. Les groupes de floraison et notes de pollinisation viennent des fiches du CRA-W (Gembloux) ; vérifiez-les auprès de votre pépiniériste.</li></ul></div>
   <div class="card"><h4>Faire vivre le verger</h4><ul>
   <li>Taille de formation les 3 à 5 premières années, en hiver ; pruniers et cerisiers se taillent en été, après la récolte.</li>
   <li>Sous un haute-tige, une prairie fauchée ou pâturée accueille une grande biodiversité ; installez des nichoirs (mésanges contre les chenilles) et un hôtel à insectes.</li>
   <li>Les variétés anciennes rustiques demandent peu ou pas de traitements ; ramassez les fruits tombés et les feuilles tachées pour limiter la tavelure.</li>
   ${(c.expo!=='o'&&(O.sp.has('pommier')||O.sp.has('poirier')))?'<li>En Wallonie, le programme « Yes We Plant » peut subventionner la plantation de vergers haute-tige (voir l’onglet « Pros et achats »).</li>':''}</ul>
   ${S.orchards.length&&P.pos?`<button type="button" class="pri" data-of="place">Placer les ${Math.min(P.trees.length,P.pos.length)} arbres sur la carte</button><p class="note">Les arbres sont positionnés en quinconce dans la zone dessinée, à 2 m au moins de la limite cadastrale. Vous pouvez ensuite les déplacer.</p>`:'<p class="note">Dessinez la zone du verger sur la carte pour placer automatiquement les arbres.</p>'}</div></div>`;
  watchPhotos(el);
}
function placeOrchard(){const P=orchPlan();if(!P.pos)return;S.fruits=S.fruits.filter(f=>!f.orch);
  P.trees.slice(0,P.pos.length).forEach((t,i)=>{const [la,lo]=P.pos[i];S.fruits.push({id:++itemId,lat:la,lng:lo,sp:ORCH[t.k].fi,forme:FRUITS[ORCH[t.k].fi].formes.split(' ').includes(S.orch.type)?S.orch.type:FRUITS[ORCH[t.k].fi].formes.split(' ')[0],v:t.v.n,orch:1})});
  itemsChanged(false);showTab('carte',true)}
$('#orchBox').addEventListener('change',e=>{const t=e.target,O=S.orch;
  if(t.dataset.oset){const set=O[t.dataset.oset];t.checked?set.add(t.value):set.delete(t.value);renderOrch();return}
  const f=t.dataset.of;if(!f)return;if(f==='A'||f==='n'){const v=parseFloat(t.value);if(v>=0)O[f]=v}else if(f==='wild')O.wild=t.checked;else O[f]=t.value;renderOrch()});
$('#orchBox').addEventListener('click',e=>{const f=e.target.dataset&&e.target.dataset.of;if(f==='draw'){setMode('orchard');showTab('carte',true)}if(f==='place')placeOrchard()});

/* ================= Remblai ================= */
S.fill={on:false,thick:50,nat:'deb',age:'new',ext:'all'};
const FILLN={veg:'Terre végétale rapportée',deb:'Terre de déblai (sous-sol compact)',grav:'Matériaux mêlés (gravats, cailloux, débris)',sab:'Sable ou sable stabilisé',inc:'Nature inconnue'};
function applyFill(o){const F=S.fill;if(!o||!F||!F.on||F.ext!=='all'||F.thick<30)return o;o={...o,fill:F.nat};
  if(F.nat==='deb'){o.catB='a';o.clay=Math.max(o.clay||0,35);o.dr=o.dr&&DRSHIFT[o.dr]>0?o.dr:'d';o.cls='Remblai compact (terre de déblai)'}
  else if(F.nat==='grav'){o.catB='s';o.sand=Math.max(o.sand||0,65);o.dr='a';o.ph=Math.max(o.ph||7.6,7.6);o.cls='Remblai caillouteux (gravats)'}
  else if(F.nat==='sab'){o.catB='s';o.sand=Math.max(o.sand||0,85);o.clay=Math.min(o.clay||5,5);o.dr='a';o.cls='Remblai sableux'}
  return o}
function fillAdvice(){const F=S.fill;if(!F.on)return[];const t=[];
  t.push('Un remblai change le sol réel : profondeur utile aux racines, tassement, drainage et pH peuvent différer de la carte des sols. Les conseils de cette page en tiennent compte'+(F.ext==='all'&&F.thick>=30?'.':' pour la zone remblayée seulement.'));
  t.push({veg:'Terre végétale : bonne base. Vérifiez l’épaisseur (30 cm pour les vivaces, 60 cm pour les arbustes, 1 m pour les arbres) et percez la couche tassée qui se trouve souvent dessous.',
    deb:'Terre de déblai compacte et pauvre : décompactez à la grelinette ou à la fourche-bêche sur 30 à 40 cm, incorporez 5 à 10 cm de compost et choisissez des plantes de sol lourd et frais.',
    grav:'Gravats et cailloux : retirez les gros débris dans chaque trou de plantation, apportez 20 à 30 cm de terre végétale pour une pelouse ou un potager. Le mortier rend souvent le sol calcaire : mesurez le pH.',
    sab:'Sable : très drainant et pauvre. Apportez du compost chaque année, paillez, et choisissez des plantes de terrain sec.',
    inc:'Nature inconnue : creusez un trou-test de 50 cm et faites le test du boudin à 20 et à 40 cm de profondeur.'}[F.nat]);
  if(F.thick>=60)t.push(`Épaisseur de ${F.thick} cm : les racines des arbres traverseront le remblai ; plantez les grands arbres là où le sol d’origine est le plus proche.`);
  if(F.age==='new')t.push('Remblai récent : il se tasse encore de 10 à 20 % pendant 2 à 3 ans. Attendez avant de creuser une pièce d’eau ou de poser une terrasse, et arrosez les plantations plus souvent.');
  t.push('Origine des terres : en Wallonie, les terres déplacées doivent être tracées (Walterre) ; en Flandre, par le système de gestion des terres (Grondbank). Pour un potager sur une terre d’origine inconnue, faites-la analyser (métaux lourds) ou cultivez en bacs.');
  return t}
function renderFill(){const c=$('#fillCard');if(!c)return;const F=S.fill;$('#fillOpts').hidden=!F.on;$('#fillTxt').innerHTML=F.on?`<ul>${fillAdvice().map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}
$('#fillCard').addEventListener('change',e=>{const t=e.target,F=S.fill;if(t.id==='fillOn')F.on=t.checked;if(t.id==='fillTh'){const v=parseFloat(t.value);if(v>0)F.thick=v}if(t.id==='fillNat')F.nat=t.value;if(t.id==='fillAge')F.age=t.value;if(t.id==='fillExt')F.ext=t.value;renderSoil();refreshPlants(true)});
$('#fillNat').innerHTML=opts(FILLN,S.fill.nat);

/* ================= Synthèse : état biologique du site ================= */
function synRows(){
  const c=S.clim,so=soilNow(),k=cond(),st=S.stats,R_=[],add=(th,lv,tx)=>R_.push([th,lv,tx]);
  if(c){const mild=c.extMin>-12,dry=c.summerBal<-120;add('Climat',dry?'mid':'ok',`${mild?'Tempéré océanique, hivers doux':'Tempéré à hivers froids'} (zone ${usda(c.extMin)}, minimum moyen ${nf(c.extMin,1)} °C). ${nf(c.pYear)} mm de pluie par an, ${nf(c.tYear,1)} °C en moyenne ; ${dry?`été déficitaire (${nf(c.summerBal)} mm) : choisir des plantes sobres et pailler.`:'bilan d’eau estival équilibré.'} Dernière gelée vers le ${doyTxt(c.lastFrost)}.`)}
  if(so){const ph=so.ph,life=so.fill&&so.fill!=='veg'?'perturbée par le remblai':so.cat==='l'&&(!ph||ph>=5.8&&ph<=7.6)&&!(so.dr&&DRSHIFT[so.dr]>0)?'probablement intense (vers de terre, bonne structure)':so.cat==='s'&&ph&&ph<5.5?'faible (sol acide et pauvre)':so.dr&&DRSHIFT[so.dr]>0?'ralentie en hiver par l’excès d’eau':'moyenne';
    add('Sol',so.fill&&so.fill!=='veg'?'ko':so.dr&&DRSHIFT[so.dr]>0?'mid':'ok',`${so.cls}${so.dr?', drainage '+BDR[so.dr]:''}${ph?', pH '+nf(ph,1):', pH à mesurer'}${so.soc!=null?`, matière organique ≈ ${nf(so.soc*1.72/10,1)} %`:''}. Vie du sol ${life}.${S.fill.on?' Remblai signalé : '+FILLN[S.fill.nat].toLowerCase()+'.':''}`)}
  if(st)add('Lumière',st.cls==='o'?'mid':'ok',`${EXL[st.cls]} : environ ${nf(st.grow,1)} h de soleil direct par jour d’avril à septembre${S.obs.length+S.shapes.length?`, compte tenu de ${S.obs.length+S.shapes.length} obstacle(s) saisi(s)`:''}.`);
  {const wet=k.eau==='h',dry=k.eau==='d';add('Eau',dry||wet?'mid':'ok',`Sol ${WL[k.eau].toLowerCase()}${S.ponds.length?`, ${S.ponds.length} pièce(s) d’eau prévue(s) : un habitat humide précieux`:''}. ${dry?'Récupérer l’eau de pluie et pailler.':wet?'Privilégier les plantes de sol humide ; un fossé ou une mare peut recueillir l’excès d’eau.':'Réserve en eau correcte.'}`)}
  const comp=S.lastCompo,nat=comp?comp.rows.filter(x=>x.p.st.includes('nat')||x.p.st.includes('eco')).length:0,
    trees=S.obs.filter(o=>o.type==='caduc'||o.type==='pers').length+S.fruits.length+(comp?comp.rows.filter(x=>x.p.t==='arbre').length:0),
    hedgeN=S.hedges.filter(h=>h.type==='champetre'||h.type==='brisevent').length,lr=lawnArea()?lawnRank()[0].t.k:'',ht=S.orchards.length&&S.orch.type==='ht';
  let sc=0;const has=[];if(trees){sc+=2;has.push(`${trees} arbre(s)`)}if(hedgeN){sc+=2;has.push('haie champêtre')}else if(S.hedges.length){sc+=1;has.push('haie')}if(S.ponds.length){sc+=2;has.push('mare')}
  if(lr==='prairie'||lr==='trefle'){sc+=2;has.push(lr==='prairie'?'prairie fleurie':'pelouse fleurie')}if(nat>=3){sc+=2;has.push('plantes indigènes et mellifères')}if(ht){sc+=1;has.push('verger haute-tige')}if(S.taluses.length)sc+=0;
  const lv=sc>=7?'Très bon':sc>=4?'Bon':sc>=2?'Moyen':'Faible';
  let imp='';if(S.parcel){const pa=polyArea(S.parcel.ring.map(([lo,la])=>toXY([S.lat,S.lon],[la,lo]))),ba=S.shapes.filter(x=>x.kind==='obsPoly').reduce((s,x)=>s+areaLL(x.pts),0)+S.obs.filter(o=>o.type==='bat').reduce((s,o)=>s+o.w*o.w,0);if(pa>0&&ba>0)imp=` Bâti saisi : ${nf(ba/pa*100)} % de la parcelle.`}
  add('Biodiversité',sc>=4?'ok':sc>=2?'mid':'ko',`Potentiel ${lv.toLowerCase()} d’après ce qui est dessiné et composé${has.length?' : '+has.join(', '):''}.${imp}`);
  return R_}
function synActions(){const a=[],k=cond(),so=soilNow();
  if(!so||!so.ph)a.push('Mesurez le pH du sol (kit de jardinerie) et saisissez-le dans l’onglet « Sol ».');
  if(S.fill.on&&S.fill.nat!=='veg')a.push('Décompactez et enrichissez le remblai avant de planter (voir l’onglet « Sol »).');
  if(!S.hedges.some(h=>h.type==='champetre'))a.push('Plantez une haie champêtre indigène : abri, nourriture et corridor pour la faune.');
  if(!S.ponds.length)a.push('Creusez une petite mare naturelle à pente douce : elle attire libellules, amphibiens et oiseaux.');
  if(!(lawnArea()&&['prairie','trefle'].includes(lawnRank()[0].t.k)))a.push('Laissez une zone de pelouse en prairie fleurie, fauchée une à deux fois par an.');
  if(k.eau==='d')a.push('Installez un récupérateur d’eau de pluie et paillez toutes les plantations.');
  a.push('Jardinez sans pesticides ni engrais chimiques ; laissez feuilles mortes, tiges sèches et tas de bois en hiver.');
  return a.slice(0,4)}
function renderSyn(){const el=$('#synBox');if(!el)return;if(S.lat==null){el.innerHTML='<p class="state">Choisissez un site sur la carte.</p>';return}
  const rows=synRows(),L={ok:'Favorable',mid:'À surveiller',ko:'Point faible'};
  el.innerHTML=(rows.length?`<div class="syn">${rows.map(([t,lv,tx])=>`<div class="synr"><span class="pill ${lv}">${L[lv]}</span><b>${t}</b><p>${esc(tx)}</p></div>`).join('')}</div>`:'<p class="state">Données en cours de chargement…</p>')+
   `<div class="card" style="margin-top:14px"><h4>Actions prioritaires</h4><ol>${synActions().map(t=>`<li>${esc(t)}</li>`).join('')}</ol></div>`}

/* ================= Envoi de la demande avec le rapport ================= */
async function sendWithReport(){const msg=$('#devisMsg');msg.textContent='Préparation du rapport…';
  try{const blob=await exportDocx({blob:true}),name='plantania-rapport.docx',subj='Demande de devis — aménagement de jardin',body=$('#devisTxt').value,to=$('#devisMail').value.trim().replace(/[^\w.@+-]/g,'');
    let file=null;try{file=new File([blob],name,{type:blob.type})}catch(e){}
    if(file&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:subj,text:body});msg.textContent='Choisissez votre messagerie : le rapport y est joint.';return}catch(err){if(err&&err.name==='AbortError'){msg.textContent='Envoi annulé.';return}}}
    download(blob,name);
    setTimeout(()=>{location.href=`mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body.slice(0,1800))}`},500);
    msg.textContent='Le rapport Word vient d’être téléchargé et votre messagerie s’ouvre : glissez le fichier « plantania-rapport.docx » dans l’e-mail avant de l’envoyer. Depuis un ordinateur, un site ne peut pas joindre un fichier automatiquement.';
  }catch(e){msg.textContent='Erreur : '+e.message}}
$('#prosBox').addEventListener('click',e=>{if(e.target.id==='devisSend')sendWithReport()});

/* ================= Tutoriel ================= */
const TUTO=[
 ['#search',null,'Trouvez votre terrain','Tapez une adresse ou cliquez sur « Ma position ». Vous pouvez aussi cliquer directement sur la carte.'],
 ['#tsel','carte','Dessinez votre projet','« Ajouter sur la carte » permet de tracer massifs, haies, potager, verger, pièce d’eau, et les obstacles qui font de l’ombre. Cochez « Tracer en courbes » pour des formes arrondies ; « Modifier les points » permet de les déplacer ensuite.'],
 ['#tabs',null,'Naviguez par onglets','Chaque thème a son onglet. Vous pouvez en ouvrir plusieurs à la fois, ou choisir « Un seul onglet ».'],
 ['#synBox','synthese','Lisez la synthèse','Climat, sol, lumière, eau et biodiversité de votre terrain en quelques lignes, avec les actions prioritaires.'],
 ['#fillCard','sol','Vérifiez le sol','Les données viennent des cartes des sols régionales. Corrigez-les avec un test de terrain, indiquez votre pH ou signalez un remblai.'],
 ['#compOpts','massif','Composez un massif','Choisissez un style (dont la roseraie), la disposition, l’harmonie de couleurs et la durée de floraison. En mode « Personnalisé », vous choisissez vous-même les plantes.'],
 ['#boxBox','jardinieres','Jardinières, potager et verger','Ajoutez vos appuis de fenêtre et garde-corps, organisez un potager en bacs, en pleine terre ou sous serre, et composez un verger avec ses pollinisateurs.'],
 ['#exPdf','export','Exportez et faites réaliser','Téléchargez le rapport PDF ou Word et la liste Excel. Dans « Pros et achats », envoyez une demande de devis avec le rapport joint.'],
 ['#aiOpen',null,'Besoin d’aide ?','Décrivez votre projet à l’assistant, et donnez votre avis avec « Donner mon avis ». Le menu ☰ → « Aide : relancer le tutoriel » le relance à tout moment.']];
let tutoI=-1;
function tutoEnd(fin){tutoI=-1;$('#tutoHl').hidden=true;$('#tutoBox').hidden=true;if(fin===true){try{localStorage.setItem('plantania:tuto','done')}catch(e){}}}
let TUTO_SEL='';function tutoPlace(){if(tutoI<0)return;const el=$(TUTO_SEL||TUTO[tutoI][0]);if(!el)return;const r=el.getBoundingClientRect(),hl=$('#tutoHl'),bx=$('#tutoBox'),pad=6;
  Object.assign(hl.style,{left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+2*pad+'px',height:Math.min(r.height+2*pad,innerHeight-20)+'px'});
  const bw=Math.min(380,innerWidth-24),bh=bx.offsetHeight||190;let top=r.bottom+14;if(top+bh>innerHeight-10)top=Math.max(10,r.top-bh-14);if(top<10)top=Math.max(10,innerHeight-bh-10);
  bx.style.left=Math.max(12,Math.min(innerWidth-bw-12,r.left))+'px';bx.style.top=top+'px'}
function tutoGo(i){if(i>=TUTO.length){tutoEnd(true);return}if(i<0){tutoEnd();return}tutoI=i;let [sel,tab,t,d]=TUTO[i];if(sel==='#tabs'&&typeof WZ!=='undefined'&&WZ.on){sel='#steps';t='Suivez les 5 étapes';d='Projet, terrain, dessin, résultats, action : le parcours n’affiche que ce qui est utile. Le menu (en haut) permet de passer en mode libre avec tous les onglets, de gérer vos projets et d’agrandir le texte.'}if(tab)showTab(tab,'force');
  $('#tutoHl').hidden=false;$('#tutoBox').hidden=false;$('#tutoT').textContent=t;$('#tutoD').textContent=d;$('#tutoN').textContent=`${i+1} / ${TUTO.length}`;$('#tutoPrev').disabled=i===0;$('#tutoNext').textContent=i===TUTO.length-1?'Terminer':'Suivant';
  const el=$(sel);if(el){const dd=el.closest('details');if(dd)dd.open=true;el.scrollIntoView({block:'center',behavior:'instant'})}setTimeout(tutoPlace,60);TUTO_SEL=sel;$('#tutoNext').focus()}
$('#tutoNext').addEventListener('click',()=>tutoGo(tutoI+1));$('#tutoPrev').addEventListener('click',()=>tutoGo(tutoI-1));$('#tutoSkip').addEventListener('click',()=>tutoEnd());$('#tutoNever').addEventListener('click',()=>tutoEnd(true));
$('#helpBtn').addEventListener('click',()=>tutoGo(0));
addEventListener('resize',tutoPlace);addEventListener('scroll',tutoPlace,{passive:true});
document.addEventListener('keydown',e=>{if(tutoI>=0&&e.key==='Escape')tutoEnd();if(tutoI>=0&&e.key==='ArrowRight')tutoGo(tutoI+1);if(tutoI>=0&&e.key==='ArrowLeft')tutoGo(tutoI-1)});

/* ================= Rapport et Excel ================= */
function v4Palettes(R){
  const agg=new Map();S.boxes.forEach((b,bi)=>{const P=boxPlan(b);(b.sais==='a'?['e','h']:[b.sais]).forEach(sa=>boxCompo(b,sa).rows.forEach(x=>{const o=agg.get(x.p.l)||{p:x.p,qty:0,zone:new Set()};o.qty+=x.q*P.n;o.zone.add(sa==='e'?'été':'hiver');agg.set(x.p.l,o)}))});
  if(agg.size)R.palettes.push({title:'JARDINIÈRES — PLANTES DE SAISON',sub:`${S.boxes.length} emplacement(s)`,items:[...agg.values()].map(o=>({p:o.p,qty:o.qty,zone:[...o.zone].join(' et ')}))});
  if(S.veg.A>0&&(S.potagers.length||S.veg.touched)){const P=vegPlan();if(P.parts.length)R.palettes.push({title:'POTAGER — '+VMODE[S.veg.mode].toUpperCase(),sub:P.unit,items:P.parts.map(p=>({p:{n:p.x.n,l:p.x.l,f:[]},qty:p.seed?0:p.q,zone:p.seed?`${nf(p.row,1)} m de rang en semis`:''}))})}
  if(S.orchards.length||S.orch.touched){const P=orchPlan(),m=new Map();P.trees.forEach(t=>{const key=t.k+t.v.n,o=m.get(key)||{p:{n:`${ORCH[t.k].n} '${t.v.n}'`,l:ORCH[t.k].l.split(',')[0],f:[]},qty:0,zone:`${OTYPE[S.orch.type].split(' (')[0]}, récolte ${romMonths(t.v.m)}`};o.qty++;m.set(key,o)});if(m.size)R.palettes.push({title:'VERGER',sub:`${P.trees.length} arbres · écartement ${nf(P.sp,1)} m`,items:[...m.values()]})}
}
function v4Sections(){const out=[],L={ok:'Favorable',mid:'À surveiller',ko:'Point faible'};
  if(S.lat!=null)out.push({top:1,title:'SYNTHÈSE : ÉTAT BIOLOGIQUE DU SITE',tables:[{head:['Thème','État','Résumé'],rows:synRows().map(r=>[r[0],L[r[1]],r[2]]),w:[2200,1800,10838]}],bullets:synActions(),bh:'Actions prioritaires'});
  if(S.fill.on)out.push({top:1,title:'SOL : REMBLAI',tables:[{head:['Épaisseur','Nature','Âge','Étendue'],rows:[[S.fill.thick+' cm',FILLN[S.fill.nat],S.fill.age==='new'?'récent':'ancien',S.fill.ext==='all'?'tout le terrain':'une partie']]}],bullets:fillAdvice()});
  if(S.boxes.length){const rows=[],sup=[];S.boxes.forEach((b,i)=>{const P=boxPlan(b),SU=boxSupplies(b);(b.sais==='a'?['e','h']:[b.sais]).forEach(sa=>rows.push([`${BOXK[b.kind]} ${i+1}`,`${P.n} × ${P.L} cm (${P.W} × ${P.H} cm)`,sa==='e'?'Été':'Hiver',boxCompo(b,sa).rows.map(x=>`${x.q*P.n} ${x.p.n}`).join(', ')]));SU.out.forEach(r=>sup.push([`${BOXK[b.kind]} ${i+1}`,...r]))});
    out.push({title:'JARDINIÈRES ET BALCONS',tables:[{head:['Emplacement','Jardinières','Saison','Plantes'],rows,w:[3000,3000,1400,7438]},{h:'Fournitures',head:['Emplacement','Fourniture','Quantité','Détail'],rows:sup,w:[2800,3400,2000,6638]}],bullets:S.boxes.length?boxTips(S.boxes[0]):[]})}
  if(S.potagers.length||S.veg.touched){const P=vegPlan();if(P.parts.length)out.push({title:'POTAGER — '+VMODE[S.veg.mode].toUpperCase(),intro:P.unit,tables:[{head:['Emplacement','Groupe','Cultures'],rows:P.beds.map(b=>[b.name,S.veg.mode==='serre'?(b.g==='Fr'?'Légumes-fruits':'Légumes d’hiver'):VG[b.g],P.parts.filter(p=>p.g===b.g).map(p=>p.x.n).join(', ')]),w:[2600,4000,8238]},
    {h:'Calendrier',head:['Légume','Semis sous abri','Semis en place','Plantation','Récolte','Quantité'],rows:P.parts.map(p=>[p.x.n,romMonths(p.x.sa),romMonths(p.x.sd),romMonths(p.x.pl),romMonths(p.x.re),p.seed?nf(p.row,1)+' m de rang':p.q+' plants']),w:[2600,2200,2200,2200,2800,2838]},
    {h:'Fournitures',head:['Fourniture','Quantité','Détail'],rows:vegSupplies(P),w:[3600,2400,8838]}]})}
  if(S.orchards.length||S.orch.touched){const P=orchPlan();if(P.trees.length)out.push({title:'VERGER — '+OTYPE[S.orch.type].toUpperCase(),intro:`${P.trees.length} arbres, écartement ${nf(P.sp,1)} m, au moins 2 m de la limite de propriété.`,tables:[{head:['N°','Essence','Variété','Pollinisée par','Récolte','Usages','Porte-greffe'],rows:P.trees.map((t,i)=>[i+1,ORCH[t.k].n,`'${t.v.n}'`+(t.poll?' (pollinisateur)':''),t.v.poll==='AF'?'autofertile':t.by.map(n=>`'${n}'`).join(', ')||'—',romMonths(t.v.m),[...t.v.use].map(u=>OUSE[u].split(' (')[0]).join(', '),ORCH[t.k].rs[S.orch.type]||'—']),w:[600,1800,3000,3000,1800,2400,2238]}],bullets:P.warn})}
  return out}
function v4Sheets(sh,buy){
  if(S.boxes.length){const rows=[];S.boxes.forEach((b,i)=>{const P=boxPlan(b);(b.sais==='a'?['e','h']:[b.sais]).forEach(sa=>boxCompo(b,sa).rows.forEach(x=>{rows.push([`${BOXK[b.kind]} ${i+1}`,sa==='e'?'Été':'Hiver',JR[x.role],x.p.n,x.p.l,x.q,x.q*P.n]);buy.push(['Plante',x.p.n,x.p.l,x.q*P.n,'pièce(s)',`Jardinière — ${BOXK[b.kind]} ${i+1} (${sa==='e'?'été':'hiver'})`])}));
      boxSupplies(b).out.forEach(r=>buy.push(['Produit',r[0],'',r[1],'',`${BOXK[b.kind]} ${i+1} — ${r[2]}`]))});
    sh.push({name:'Jardinières',head:['Emplacement','Saison','Rôle','Plante','Nom latin','Par jardinière','Total'],rows})}
  if(S.potagers.length||S.veg.touched){const P=vegPlan();if(P.parts.length){sh.push({name:'Potager',head:['Légume','Nom latin','Famille','Groupe','Surface (m²)','Plants','Rang semé (m)','Semis abri','Semis en place','Plantation','Récolte'],rows:P.parts.map(p=>[p.x.n,p.x.l,p.x.fam,VG[p.g]||p.g,Math.round(p.a*10)/10,p.seed?'':p.q,p.seed?Math.round(p.row*10)/10:'',romMonths(p.x.sa),romMonths(p.x.sd),romMonths(p.x.pl),romMonths(p.x.re)])});
    P.parts.forEach(p=>buy.push(['Plante',p.x.n+(p.seed?' (graines)':' (plants)'),p.x.l,p.seed?Math.round(p.row*10)/10:p.q,p.seed?'m de rang':'pièce(s)','Potager']));vegSupplies(P).forEach(r=>buy.push(['Produit',r[0],'',r[1],'','Potager — '+r[2]]))}}
  if(S.orchards.length||S.orch.touched){const P=orchPlan();if(P.trees.length){sh.push({name:'Verger',head:['N°','Essence','Nom latin','Variété','Floraison','Pollinisée par','Récolte','Usages','Porte-greffe','Forme'],rows:P.trees.map((t,i)=>[i+1,ORCH[t.k].n,ORCH[t.k].l,t.v.n,t.v.fg||'',t.v.poll==='AF'?'autofertile':t.by.join(', '),romMonths(t.v.m),[...t.v.use].map(u=>OUSE[u]).join(', '),ORCH[t.k].rs[S.orch.type]||'',OTYPE[S.orch.type]])});
    P.trees.forEach(t=>buy.push(['Plante',`${ORCH[t.k].n} '${t.v.n}'`,ORCH[t.k].l,1,'pièce',`${OTYPE[S.orch.type]}, porte-greffe ${ORCH[t.k].rs[S.orch.type]||'—'}`]))}}
  if(S.lat!=null)sh.push({name:'Synthèse du site',head:['Thème','État','Résumé'],rows:synRows().map(r=>[r[0],{ok:'Favorable',mid:'À surveiller',ko:'Point faible'}[r[1]],r[2]])});
}
function v4Machines(out){
  if(S.potagers.length||S.veg.touched||S.boxes.length)out.push(['Grelinette, plantoir, arrosoir à pomme fine, voile de forçage','Potager et jardinières','La grelinette ameublit sans retourner la terre ; le voile protège les semis du froid et des insectes.']);
  if(S.orchards.length||S.orch.touched)out.push(['Échelle de cueillette trépied et cueille-fruits','Verger','Plus stable qu’une échelle droite dans l’herbe.']);
  return out}
let v4T=0;function renderV4(){clearTimeout(v4T);v4T=setTimeout(()=>{renderSyn();renderBoxes();renderVeg();renderOrch();renderFill()},20)}
$('#lawnQuick').addEventListener('change',e=>{S.lawnManual=Math.max(0,parseFloat(e.target.value)||0);renderLawn();renderMachines();renderV4()});
$('#vegBox').addEventListener('change',()=>{S.veg.touched=1},true);$('#vegBox').addEventListener('click',()=>{S.veg.touched=1},true);
$('#orchBox').addEventListener('change',()=>{S.orch.touched=1},true);

/* ================= v5 : messages, chargement ================= */
function toast(msg,opt={}){const box=$('#toasts');if(!box)return;const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');
  d.innerHTML=`<span>${esc(msg)}</span>${opt.undo?'<button type="button" class="tundo">Annuler</button>':''}<button type="button" class="tx" aria-label="Fermer">×</button>`;
  box.appendChild(d);const kill=()=>{d.classList.add('out');setTimeout(()=>d.remove(),250)};
  d.querySelector('.tx').onclick=kill;if(opt.undo)d.querySelector('.tundo').onclick=()=>{undo();kill()};setTimeout(kill,opt.undo?8000:4500);while(box.children.length>3)box.firstChild.remove()}
{let n=0;const of=window.fetch.bind(window),bar=()=>{const b=$('#loadbar');if(b)b.hidden=n<=0};
 window.fetch=function(...a){n++;bar();return of(...a).finally(()=>{n--;setTimeout(bar,150)})}}

/* ================= Sauvegarde : état du projet ================= */
const LISTS=['shapes','hedges','lawns','ponds','vines','taluses','potagers','orchards'];
const clone=o=>JSON.parse(JSON.stringify(o));
S.want=new Set(['massif']);
function snapDrawings(){return clone({obs:S.obs.map(o=>({lat:o.lat,lng:o.lng,type:o.type,h:o.h,w:o.w})),items:Object.fromEntries(LISTS.map(k=>[k,S[k]||[]])),fruits:S.fruits,
  bed:S.bed?{raw:S.bed.raw||S.bed.ll,rawEdges:S.bed.rawEdges||S.bed.edges,smooth:!!S.bed.smooth,island:!!S.bed.island}:null,boxes:S.boxes,custom:S.custom})}
function serialize(){return{v:1,name:PRJ.name,saved:Date.now(),site:S.lat!=null?[S.lat,S.lon]:null,draw:snapDrawings(),
  set:clone({style:S.style,harm:S.harm,bloom:S.bloom,dispo:S.dispo,pick:S.pick,ovr:S.ovr,soilMan:S.soilMan,phMeas:S.phMeas||null,fill:S.fill,veg:{...S.veg,sel:S.veg.sel?[...S.veg.sel]:null},
   orch:{...S.orch,sp:[...S.orch.sp],use:[...S.orch.use],har:[...S.orch.har]},lawnUse:S.lawnUse,lawnManual:S.lawnManual,F:{...F,colors:[...F.colors]},want:[...S.want]})}}
let restoring=false;
function restoreDrawings(d){restoring=true;try{
  S.obs.forEach(o=>{map.removeLayer(o.circle);map.removeLayer(o.marker)});S.obs=[];
  (d.obs||[]).forEach(o=>{$('#obsType').value=o.type;addObstacle(o.lat,o.lng);const n=S.obs[S.obs.length-1];n.h=o.h;n.w=o.w;styleObs(n)});
  LISTS.forEach(k=>{S[k]=clone((d.items||{})[k]||[])});S.fruits=clone(d.fruits||[]);
  if(d.bed){S.bed={raw:clone(d.bed.raw),rawEdges:clone(d.bed.rawEdges),smooth:d.bed.smooth,island:d.bed.island};bedRegeom();$('#island').checked=!!d.bed.island}else{S.bed=null;bedLayer.clearLayers();plantLayer.clearLayers();S.lastLayout=null}
  S.boxes=clone(d.boxes||[]);S.custom=clone(d.custom||[]);
  const ids=[...LISTS.flatMap(k=>S[k].map(x=>+x.id||0)),...S.fruits.map(x=>+x.id||0),0];itemId=Math.max(itemId,...ids);boxId=Math.max(boxId,0,...S.boxes.map(b=>b.id));
  S.samples=null;drawItems();renderObs();sunUpdate();renderExtras();renderCompo();drawHandles();renderItemsList();renderBoxes()}finally{restoring=false}}
function restoreSettings(t){if(!t)return;
  ['style','harm','bloom','dispo','pick','ovr','soilMan','phMeas','fill','lawnUse','lawnManual'].forEach(k=>{if(t[k]!==undefined)S[k]=clone(t[k])});
  if(t.veg){Object.assign(S.veg,t.veg);S.veg.sel=t.veg.sel?new Set(t.veg.sel):null}
  if(t.orch){Object.assign(S.orch,t.orch);['sp','use','har'].forEach(k=>S.orch[k]=new Set(t.orch[k]||[]))}
  if(t.F){Object.assign(F,t.F);F.colors=new Set(t.F.colors||[])}
  if(t.want)S.want=new Set(t.want);syncUI()}
function syncUI(){
  document.querySelectorAll('.sty').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.s===S.style)));
  $('#oDispo').value=S.dispo;$('#oBloom').value=S.bloom;$('#oPick').value=S.pick;syncHarmUI();
  [['fType','type'],['fStyle','style'],['fFo','fo'],['fPort','port'],['fHmin','hmin'],['fHmax','hmax'],['fMois','mois']].forEach(([id,k])=>{const el=$('#'+id);if(el)el.value=String(F[k])});
  document.querySelectorAll('#fColors button').forEach(b=>b.setAttribute('aria-pressed',String(F.colors.has(b.dataset.c))));
  if($('#fillOn')){$('#fillOn').checked=!!S.fill.on;$('#fillTh').value=S.fill.thick;$('#fillNat').value=S.fill.nat;$('#fillAge').value=S.fill.age;$('#fillExt').value=S.fill.ext}
  $('#phIn').value=S.phMeas?String(S.phMeas).replace('.',','):'';renderWants();syncAdvSum()}
function restoreState(d){
  if(!d)return;resetProject();restoreSettings(d.set);
  if(d.site){S.lat=null;setSite(d.site[0],d.site[1],true)}
  restoreDrawings(d.draw||{});renderSoil();refreshPlants(true);renderV4();wizApply()}
/* --- projets nommés --- */
const PRJ={id:'',name:'Mon projet'};
const pIdx=()=>{try{return JSON.parse(localStorage.getItem('plantania:projects')||'{}')}catch(e){return{}}};
const pSetIdx=o=>{try{localStorage.setItem('plantania:projects',JSON.stringify(o))}catch(e){}};
let lastSaved='';
function saveNow(force){if(restoring||S.lat==null||!window.__pboot)return;if(!PRJ.id)PRJ.id='p'+Date.now().toString(36);const d=serialize(),js=JSON.stringify({...d,saved:0});if(!force&&js===lastSaved)return;lastSaved=js;
  try{localStorage.setItem('plantania:p:'+PRJ.id,JSON.stringify(d));localStorage.setItem('plantania:current',PRJ.id);const ix=pIdx();ix[PRJ.id]={name:PRJ.name,updated:d.saved};pSetIdx(ix);$('#saveState').textContent='Enregistré'}catch(e){$('#saveState').textContent='Sauvegarde impossible (mémoire pleine)'}}
setInterval(()=>saveNow(false),3000);addEventListener('beforeunload',()=>saveNow(false));addEventListener('pagehide',()=>saveNow(false));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveNow(false)});
function openProject(id){try{const d=JSON.parse(localStorage.getItem('plantania:p:'+id));if(!d)return;saveNow(false);PRJ.id=id;PRJ.name=d.name||'Projet';$('#projName').value=PRJ.name;restoreState(d);lastSaved='';localStorage.setItem('plantania:current',id);toast(`Projet « ${PRJ.name} » ouvert`)}catch(e){toast('Impossible d’ouvrir ce projet')}}
function newProject(){saveNow(true);const n=Object.keys(pIdx()).length+1;PRJ.id='p'+Date.now().toString(36);PRJ.name='Projet '+n;$('#projName').value=PRJ.name;
  const site=S.lat!=null?[S.lat,S.lon]:null;resetProject();S.custom=[];S.pick='auto';S.want=new Set(['massif']);if(site){S.lat=null;setSite(site[0],site[1],true)}syncUI();renderV4();lastSaved='';saveNow(true);wizGo(1);toast(`Nouveau projet « ${PRJ.name} »`)}
function exportProject(){saveNow(true);const d=serialize();if(S.plan&&PLANIMG)d.set.planImg=PLANIMG;const b=new Blob([JSON.stringify(d,null,1)],{type:'application/json'});download(b,(PRJ.name||'projet').replace(/[^\wÀ-ÿ -]+/g,'').trim().replace(/\s+/g,'-')+'.plantania.json');toast('Fichier du projet téléchargé')}
function importProject(file){const fr=new FileReader();fr.onload=()=>{try{const d=JSON.parse(fr.result);if(!d||d.v!==1||!d.draw)throw 0;saveNow(true);PRJ.id='p'+Date.now().toString(36);PRJ.name=d.name||file.name.replace(/\.plantania\.json$|\.json$/,'');$('#projName').value=PRJ.name;restoreState(d);lastSaved='';saveNow(true);renderProjDlg();toast(`Projet « ${PRJ.name} » importé`)}catch(e){toast('Ce fichier n’est pas un projet Plantañ.ia')}};fr.readAsText(file)}
function renderProjDlg(){const ix=pIdx(),ids=Object.keys(ix).sort((a,b)=>ix[b].updated-ix[a].updated);
  $('#projList').innerHTML=ids.length?ids.map(id=>`<li${id===PRJ.id?' class="cur"':''}><div><b>${esc(ix[id].name)}</b><small>${id===PRJ.id?'Projet ouvert · ':''}modifié le ${new Date(ix[id].updated).toLocaleString('fr-BE',{dateStyle:'short',timeStyle:'short'})}</small></div><span>${id===PRJ.id?'':`<button type="button" data-po="${id}">Ouvrir</button>`}<button type="button" data-pd="${id}">Dupliquer</button><button type="button" data-px="${id}">Supprimer</button></span></li>`).join(''):'<li>Aucun projet enregistré.</li>'}
$('#projDlg').addEventListener('click',e=>{const t=e.target;
  if(t.dataset.po){openProject(t.dataset.po);renderProjDlg()}
  if(t.dataset.pd){try{const d=JSON.parse(localStorage.getItem('plantania:p:'+t.dataset.pd));const id='p'+Date.now().toString(36);d.name=(d.name||'Projet')+' (copie)';localStorage.setItem('plantania:p:'+id,JSON.stringify(d));const ix=pIdx();ix[id]={name:d.name,updated:Date.now()};pSetIdx(ix);renderProjDlg()}catch(err){}}
  if(t.dataset.px){if(t.dataset.c!=='1'){t.dataset.c='1';t.textContent='Confirmer';return}const ix=pIdx();delete ix[t.dataset.px];pSetIdx(ix);try{localStorage.removeItem('plantania:p:'+t.dataset.px)}catch(err){}if(t.dataset.px===PRJ.id){PRJ.id='';lastSaved=''}renderProjDlg()}
  if(t.id==='pNew'){newProject();renderProjDlg()}if(t.id==='pExport')exportProject();if(t.id==='pImport')$('#pFile').click();if(t.id==='pClose')$('#projDlg').close()});
$('#pFile').addEventListener('change',e=>{const f=e.target.files[0];if(f)importProject(f);e.target.value=''});
$('#projName').addEventListener('input',e=>{PRJ.name=e.target.value.slice(0,60)||'Mon projet';saveNow(true)});
function projBoot(){try{const id=localStorage.getItem('plantania:current'),d=id&&JSON.parse(localStorage.getItem('plantania:p:'+id));
  if(d){PRJ.id=id;PRJ.name=d.name||'Mon projet';$('#projName').value=PRJ.name;restoreState(d);lastSaved=JSON.stringify({...serialize(),saved:0})}else{$('#projName').value=PRJ.name}}catch(e){console.warn('projBoot',e)}}
/* --- annuler --- */
const UNDO=[];
function pushUndo(){if(restoring)return;UNDO.push(snapDrawings());if(UNDO.length>30)UNDO.shift()}
function undo(){const s=UNDO.pop();if(!s){toast('Rien à annuler');return}restoreDrawings(s);toast('Action annulée')}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key.toLowerCase()==='z'&&!e.target.closest('input,textarea,select,[contenteditable]')){e.preventDefault();undo()}});

/* ================= Parcours guidé ================= */
const WANTS=[['massif','Un massif de fleurs','Vivaces, arbustes, graminées, roseraie','bed'],['jardinieres','Des jardinières ou des pots','Balcon, appui de fenêtre, terrasse',null],['potager','Un potager','En bacs, en pleine terre ou sous serre','potager'],
 ['verger','Un verger','Plusieurs arbres fruitiers, variétés et pollinisateurs','orchard'],['haie','Une haie','Taillée, champêtre, fleurie ou brise-vent','hedge'],['fruit','Quelques fruitiers ou une vigne','Placés un par un','fruit'],
 ['mare','Une mare naturelle','Pièce d’eau pour la faune','pond'],['pelouse','Une pelouse ou une prairie fleurie','Du gazon de jeux à la prairie','lawn'],['talus','Un talus à planter','Stabiliser et fleurir une pente','talus']];
const TOOLWANT={bed:'massif',hedge:'haie',fruit:'fruit',vine:'fruit',lawn:'pelouse',pond:'mare',talus:'talus',potager:'potager',orchard:'verger'};
const STEPS=[['Mon terrain','Placez votre terrain sur la carte, puis lisez la synthèse : climat, sol, lumière et biodiversité.'],['Mon projet','Cochez ce que vous voulez aménager : seuls les outils et les résultats utiles seront affichés.'],
 ['Je dessine','Dessinez chaque élément sur la carte. Les obstacles (maison, arbres existants) servent à calculer les ombres.'],['Mes résultats','Plantes, quantités, plans et entretien pour chaque élément de votre projet.'],['Je passe à l’action','Téléchargez le rapport et la liste d’achats, ou demandez un devis à un professionnel.']];
const WZ={on:true,step:1};try{Object.assign(WZ,JSON.parse(localStorage.getItem('plantania:wiz')||'{}'))}catch(e){}
function stepSecs(n){const w=S.want;switch(n){case 1:return['carte','synthese'];case 2:return['projet'];case 3:return['carte'];
  case 4:{const s=[];if(w.has('massif'))s.push('massif');if(w.has('jardinieres'))s.push('jardinieres');if(w.has('potager'))s.push('potager');if(w.has('verger'))s.push('verger');if(['haie','fruit','mare','talus'].some(k=>w.has(k)))s.push('amenagements');if(w.has('pelouse'))s.push('pelouse');s.push('machines');return s}
  case 5:return['export','pros']}return['carte']}
const STEPMORE={1:[['climat','Climat'],['sol','Sol'],['soleil','Soleil et ombres']],3:[['soleil','Soleil et ombres']],4:[['plantes','Toutes les plantes adaptées'],['climat','Climat'],['sol','Sol']]};
function wizApply(){
  $('#steps').hidden=!WZ.on;$('#tabs').hidden=WZ.on;$('#stepIntro').hidden=!WZ.on;$('#stepNav').hidden=!WZ.on;$('#mWizard').textContent=WZ.on?'Mode libre (onglets au choix)':'Parcours guidé en 5 étapes';
  document.querySelectorAll('#tlist button[data-v]').forEach(b=>{const k=TOOLWANT[b.dataset.v];b.closest('li').hidden=WZ.on&&k&&!S.want.has(k)});
  if(!WZ.on){try{localStorage.setItem('plantania:wiz',JSON.stringify(WZ))}catch(e){}return}
  const n=WZ.step;document.querySelectorAll('#steps [data-step]').forEach(b=>{const k=+b.dataset.step;b.setAttribute('aria-current',k===n?'step':'false');b.classList.toggle('done',k<n)});
  $('#stepIntro').innerHTML=`<div class="in"><b>Étape ${n} sur 5 : ${STEPS[n-1][0]}</b><span>${STEPS[n-1][1]}</span>${n===3?drawChecklist():''}${STEPMORE[n]?`<span class="more">Pour aller plus loin : ${STEPMORE[n].map(([id,l])=>`<button type="button" data-more="${id}" aria-pressed="${!$('#'+id).classList.contains('tabhide')}">${l}</button>`).join('')}</span>`:''}</div>`;
  $('#stPrev').disabled=n===1;$('#stNext').textContent=n===5?'Terminer':'Étape suivante : '+STEPS[n][0];$('#stInfo').textContent=`Étape ${n} / 5`;
  try{localStorage.setItem('plantania:wiz',JSON.stringify(WZ))}catch(e){}}
function drawChecklist(){const has={massif:!!S.bed,haie:S.hedges.length>0,fruit:S.fruits.length+S.vines.length>0,pelouse:S.lawns.length>0||S.lawnManual>0,mare:S.ponds.length>0,talus:S.taluses.length>0,potager:S.potagers.length>0,verger:S.orchards.length>0};
  const items=WANTS.filter(w=>S.want.has(w[0])&&w[3]);
  return `<ul class="todo">${items.map(w=>`<li class="${has[w[0]]?'ok':''}"><span class="sw" style="background:${TC[w[3]]}"></span>${esc(w[1])}${has[w[0]]?' : dessiné':''} <button type="button" data-drawtool="${w[3]}">${has[w[0]]?'Redessiner':'Dessiner'}</button></li>`).join('')}<li><span class="sw pt" style="background:${TC.obs}"></span>Obstacles qui font de l’ombre (facultatif) <button type="button" data-drawtool="obs">Ajouter</button></li></ul>${items.length?'':'<span>Rien à dessiner pour les jardinières : passez à l’étape suivante.</span>'}`}
function wizGo(n){WZ.step=Math.max(1,Math.min(5,n));applyTabs(stepSecs(WZ.step));wizApply();if(WZ.step===4){renderCompo();renderV4()}window.scrollTo({top:0,behavior:'smooth'})}
function setWizard(on){WZ.on=on;if(on)wizGo(WZ.step);else{applyTabs(['carte']);wizApply();toast('Mode libre : seule la carte est ouverte. Ouvrez les autres onglets à la demande dans la barre du haut.')}}
$('#steps').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)wizGo(+b.dataset.step)});
$('#stPrev').addEventListener('click',()=>wizGo(WZ.step-1));$('#stNext').addEventListener('click',()=>{if(WZ.step===5){toast('Votre projet est enregistré automatiquement. Bon jardinage !');return}wizGo(WZ.step+1)});
$('#stepIntro').addEventListener('click',e=>{const m=e.target.closest('[data-more]');if(m){const id=m.dataset.more,sel=curTabs();applyTabs(sel.includes(id)?sel.filter(x=>x!==id):[...sel,id]);wizApply();if(!sel.includes(id))$('#'+id).scrollIntoView({behavior:'smooth'});return}
  const d=e.target.closest('[data-drawtool]');if(d){setMode(d.dataset.drawtool);$('#carte').scrollIntoView({behavior:'smooth'})}});
function renderWants(){$('#wants').innerHTML=WANTS.map(([k,l,d,t])=>`<button type="button" class="want" data-want="${k}" aria-pressed="${S.want.has(k)}"><span class="sw" style="background:${t?TC[t]:'#c2185b'}"></span><b>${esc(l)}</b><small>${esc(d)}</small></button>`).join('')}
$('#wants').addEventListener('click',e=>{const b=e.target.closest('[data-want]');if(!b)return;const k=b.dataset.want;S.want.has(k)?S.want.delete(k):S.want.add(k);renderWants();wizApply()});
{const _st=showTab;showTab=function(id,scroll){if(WZ.on&&scroll!=='force'&&!scroll&&!curTabs().includes(id)){if(id==='massif'&&S.bed)toast(`Massif dessiné : ${nf(bedGeo().area)} m². Les plantes sont proposées à l’étape 4.`,{undo:true});if(WZ.step===3)wizApply();return}return _st(id,!!scroll&&scroll!=='force')}}
$('#mWizard').addEventListener('click',()=>{closeMenu();setWizard(!WZ.on)});

/* ================= Options avancées et lexique ================= */
function syncAdvSum(){const s=$('#advSum');if(s)s.textContent=`${DISPO[S.dispo].split(' (')[0]} · ${HARM[S.harm.mode].split(' (')[0].toLowerCase()} · ${S.bloom==='12'?'fleurs toute l’année':S.bloom==='7'?'fleurs 7 mois':'floraison libre'} · ${S.pick==='perso'?'plantes choisies par vous':'plantes proposées'}`}
{const opts_=$('#compOpts'),d=document.createElement('details');d.className='adv';d.id='advCompo';d.innerHTML='<summary>Options avancées <span id="advSum"></span></summary>';opts_.before(d);d.appendChild(opts_);
 const fr=document.querySelector('#filters .frow'),d2=document.createElement('details');d2.className='adv';d2.innerHTML='<summary>Plus de filtres : feuillage, forme, hauteur, mois de floraison</summary><div class="frow"></div>';fr.after(d2);
 ['fFo','fPort','fHmin','fHmax','fMois'].forEach(id=>d2.querySelector('.frow').appendChild($('#'+id).closest('label')))}
$('#compOpts').addEventListener('change',syncAdvSum);
const GLOSS={'BRF':'Bois raméal fragmenté : jeunes branches broyées, utilisées en paillage ; elles nourrissent la vie du sol en se décomposant.','quinconce':'Disposition en zigzag : chaque plant d’une rangée est en face d’un vide de la rangée voisine.',
 'porte-greffe':'Pied sur lequel la variété est greffée ; il fixe la vigueur et la taille adulte de l’arbre.','haute-tige':'Arbre fruitier dont le tronc mesure environ 1,8 à 2 m avant les branches : grand arbre, long à produire, très durable.',
 'demi-tige':'Fruitier au tronc d’environ 1,2 m : compromis entre taille et production.','basse-tige':'Petit fruitier au tronc court (40 à 60 cm), vite productif, facile à cueillir.','palissé':'Arbre ou vigne guidé le long de fils ou d’un mur, en forme plate.',
 'autofertile':'Variété capable de se polliniser elle-même : un seul arbre suffit pour avoir des fruits.','pollinisateur':'Autre variété de la même espèce, en fleur en même temps, nécessaire pour que les fleurs donnent des fruits.',
 'groupe de floraison':'Classement des variétés selon leur date de floraison ; deux variétés de groupes voisins peuvent se polliniser.','rusticité':'Résistance au froid d’une plante ; la zone USDA indique la température minimale moyenne de l’hiver.',
 'ETP':'Évapotranspiration : eau perdue par le sol et les plantes ; si elle dépasse la pluie, le sol s’assèche.','bilan hydrique':'Différence entre la pluie et l’évapotranspiration : négatif en été, il faut pailler ou arroser.',
 'drainage':'Vitesse à laquelle l’eau s’évacue du sol ; un drainage pauvre laisse le sol gorgé d’eau en hiver.','battance':'Croûte qui se forme à la surface des sols limoneux après une forte pluie.','pH':'Acidité du sol : en dessous de 6 il est acide, au-dessus de 7,5 calcaire.',
 'limon':'Particules de sol plus fines que le sable : terre fertile mais sensible au tassement.','remblai':'Terre ou matériaux rapportés sur le terrain, souvent lors d’un chantier.','camaïeu':'Harmonie d’une seule teinte, du clair au foncé.',
 'complémentaires':'Couleurs opposées sur le cercle chromatique (bleu et orange, violet et jaune) : contraste vif.','vivace':'Plante qui vit plusieurs années ; sa partie aérienne disparaît souvent en hiver.','graminée':'Plante herbacée de la famille des herbes, cultivée pour son feuillage et ses épis.',
 'persistant':'Qui garde ses feuilles en hiver.','caduc':'Qui perd ses feuilles en hiver.','marcescent':'Qui garde ses feuilles sèches en hiver (charme, hêtre).','drageonnant':'Qui émet des pousses depuis ses racines et s’étale.','couvre-sol':'Plante basse et étalée qui couvre le sol et limite les herbes indésirables.',
 'paillage':'Couche protectrice posée sur le sol (écorces, paille, gravier) : garde l’humidité et limite le désherbage.','engrais vert':'Plante semée pour couvrir et enrichir le sol, puis coupée et laissée en surface.','grelinette':'Large fourche à deux manches qui ameublit le sol sans le retourner.',
 'RGF':'Ressources génétiques fruitières : anciennes variétés locales évaluées et diffusées par le CRA-W de Gembloux.','ADR':'Label allemand des rosiers testés plusieurs années sans traitement.','remontant':'Qui refleurit plusieurs fois dans la saison.',
 'corroyer':'Tasser une argile humide par couches pour la rendre étanche.','bentonite':'Argile très gonflante, vendue en natte, qui rend étanche le fond d’une mare.','ombrothermique':'Graphique qui superpose pluie et température mois par mois ; un mois est sec quand la pluie est inférieure au double de la température.',
 'mi-ombre':'Entre 3 et 6 heures de soleil direct par jour en saison.','plein soleil':'Au moins 6 heures de soleil direct par jour en saison.'};
const GK=Object.keys(GLOSS).sort((a,b)=>b.length-a.length);
function glossPass(){document.querySelectorAll('main .band:not(.tabhide), body > .band:not(.tabhide)').forEach(sec=>{
  sec.querySelectorAll('label,th,h3,h4,summary,figcaption,.kpi small,td>b,.cond').forEach(el=>{if(el.querySelector('.q')||el.closest('.q,.aipanel,#tlist'))return;const t=(el.__glt||el.textContent).toLowerCase();
    const k=GK.find(k=>{const i=t.indexOf(k.toLowerCase());return i>=0&&!/[a-zà-ÿ]/i.test(t[i-1]||' ')&&!/[a-zà-ÿ]/i.test(t[i+k.length]||' ')});
    if(!k||sec.querySelector(`.q[data-g="${CSS.escape(k)}"]`))return;const b=document.createElement('button');b.type='button';b.className='q';b.dataset.g=k;b.textContent='?';b.setAttribute('aria-label','Définition : '+k);el.appendChild(b)})})}
let glT=0;new MutationObserver(()=>{clearTimeout(glT);glT=setTimeout(glossPass,400)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',e=>{const q=e.target.closest('.q');const pop=$('#glossPop');if(!q){if(!e.target.closest('#glossPop'))pop.hidden=true;return}e.preventDefault();e.stopPropagation();
  pop.innerHTML=`<b>${esc(q.dataset.g)}</b><p>${esc(GLOSS[q.dataset.g])}</p>`;pop.hidden=false;const r=q.getBoundingClientRect();pop.style.left=Math.max(8,Math.min(innerWidth-310,r.left-140))+'px';pop.style.top=(r.bottom+8+scrollY)+'px'},true);
function openGloss(){$('#glossList').innerHTML=Object.entries(GLOSS).sort((a,b)=>a[0].localeCompare(b[0],'fr')).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');$('#glossDlg').showModal()}

/* ================= Plan par saison, vue de face ================= */
S.planMonth=0;
function seasonColor(p,col){const m=S.planMonth|0;if(!m)return col&&COL[col]?COL[col][1]:speciesColor(p);
  if(p.f.includes(m)&&p.c.length){const c=col&&p.c.includes(col)?col:(p.c.find(x=>x!=='vert')||p.c[0]);return COL[c]?COL[c][1]:'#86a85f'}
  const win=[12,1,2].includes(m);
  if(p.t==='graminee')return win||m===3?(p.pers?'#7d8f6a':'#cdb88a'):m>=9?'#b9a46c':'#7fa25a';
  if(p.pers)return p.fo.includes('gris')?'#93a59a':p.fo.includes('pourpre')?'#5d3a4e':'#3f6b45';
  if((p.t==='vivace'||p.t==='fougere')&&(win||(m===3&&!p.f.some(x=>x<=4))||(m===11&&!p.f.includes(11))))return '#8b735a';
  if((p.t==='arbuste'||p.t==='arbre')&&win)return '#a08b70';
  if((m===10||m===11)&&p.fo.includes('automne'))return '#c8692e';
  return p.fo.includes('pourpre')?'#6b3a5a':p.fo.includes('gris')?'#9fb2a4':p.fo.includes('panache')?'#a9c47a':'#6f9a55'}
const leafCol=p=>{const m=S.planMonth|0,win=[12,1,2].includes(m);if(p.t==='graminee')return win?'#cdb88a':'#7fa25a';if(p.pers)return p.fo.includes('gris')?'#93a59a':p.fo.includes('pourpre')?'#5d3a4e':'#3f6b45';
  if(win&&p.t!=='graminee')return p.t==='arbre'||p.t==='arbuste'?'#a08b70':'#8b735a';if((m===10||m===11)&&p.fo.includes('automne'))return '#c8692e';return p.fo.includes('pourpre')?'#6b3a5a':p.fo.includes('gris')?'#9fb2a4':'#6f9a55'};
function plantShape(p,x,base,w,h,col,rnd){const lf=leafCol(p),fl=!S.planMonth||p.f.includes(S.planMonth|0)?col:null,dorm=S.planMonth&&[12,1,2].includes(S.planMonth|0)&&!p.pers&&(p.t==='vivace'||p.t==='fougere');
  if(dorm){h=Math.max(3,h*0.12)}const bare=S.planMonth&&[12,1,2].includes(S.planMonth|0)&&!p.pers&&(p.t==='arbuste'||p.t==='arbre'),bo=bare?.4:null;
  const e=(cx,cy,rx,ry,f,o)=>`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${Math.max(1,rx).toFixed(1)}" ry="${Math.max(1,ry).toFixed(1)}" fill="${f}"${o?` opacity="${o}"`:''}/>`;
  let g='';
  if(p.t==='arbre'){g+=`<rect x="${(x-w*0.05).toFixed(1)}" y="${(base-h*0.45).toFixed(1)}" width="${(w*0.1).toFixed(1)}" height="${(h*0.45).toFixed(1)}" fill="#6d5640"/>`;g+=e(x,base-h*0.68,w/2,h*0.34,lf,bo);if(fl&&p.c.length)for(let i=0;i<7;i++)g+=e(x+(rnd()-.5)*w*0.8,base-h*(0.5+rnd()*0.4),w*0.06,w*0.06,fl);return g}
  switch(dorm?'couvre':p.p){
    case 'erige':case 'colonne':{const k=p.p==='colonne'?1:3;for(let i=0;i<k;i++){const xx=x+(i-(k-1)/2)*w/3;g+=`<rect x="${(xx-w/(k*2.6)).toFixed(1)}" y="${(base-h).toFixed(1)}" width="${(w/(k*1.3)).toFixed(1)}" height="${h.toFixed(1)}" rx="${(w/(k*2.6)).toFixed(1)}" fill="${lf}"/>`;if(fl)g+=`<rect x="${(xx-w/(k*2.6)).toFixed(1)}" y="${(base-h).toFixed(1)}" width="${(w/(k*1.3)).toFixed(1)}" height="${(h*0.35).toFixed(1)}" rx="${(w/(k*2.6)).toFixed(1)}" fill="${fl}"/>`}return g}
    case 'fontaine':{for(let i=-3;i<=3;i++)g+=`<path d="M${x.toFixed(1)},${base} Q${(x+i*w/10).toFixed(1)},${(base-h*1.1).toFixed(1)} ${(x+i*w/6).toFixed(1)},${(base-h*0.35).toFixed(1)}" stroke="${fl&&p.t==='graminee'?fl:lf}" stroke-width="${Math.max(1.5,w/18).toFixed(1)}" fill="none" stroke-linecap="round"/>`;return g}
    case 'couvre':return e(x,base-h/2,w/2,Math.max(2,h/2),lf)+(fl&&!dorm?e(x,base-h*0.8,w/2.6,Math.max(1.5,h/4),fl,.9):'');
    case 'etale':return e(x,base-h/2,w/2,h/2,lf)+(fl?Array.from({length:6},()=>e(x+(rnd()-.5)*w*0.8,base-h*(0.4+rnd()*0.5),w/12,w/14,fl)).join(''):'');
    default:return e(x,base-h/2,w/2,h/2,lf,bo)+(fl?e(x,base-h*0.72,w/2.4,h/3.6,fl,.92):'')}}
function drawElev(r,Lg){const box=$('#elev');if(!box)return;const sv=box.querySelector('svg'),W=box.clientWidth,H=box.clientHeight;if(!W||!r)return;
  const rand=rng(7);let items=[],wall=false;
  if(Lg){wall=Lg.bi>=0;const xs=Lg.geo.poly.map(p=>p[0]),ys=Lg.geo.poly.map(p=>p[1]),y0=Math.min(...ys),y1=Math.max(...ys)||1;
    const uv=c=>wall?[c.lat,c.t]:[c.x,1-(c.y-y0)/((y1-y0)||1)];
    const G={};Lg.cells.forEach(c=>{if(typeof c.sp!=='number'||c.g==null)return;const k=c.g+'|'+c.sp,[u,v]=uv(c);const o=G[k]||(G[k]={i:c.sp,u0:1e9,u1:-1e9,v:0,n:0});o.u0=Math.min(o.u0,u);o.u1=Math.max(o.u1,u);o.v+=v;o.n++});
    Object.values(G).forEach(o=>{const x=Lg.rows[o.i],a=o.n*Lg.cs*Lg.cs,k=Math.max(1,Math.min(6,Math.round(a*(x.p.d||3)/3)));for(let j=0;j<k;j++)items.push({p:x.p,col:x.col,u:o.u0+(o.u1-o.u0)*(j+.5)/k,w:Math.max(0.35,(o.u1-o.u0)/k*1.15),v:o.v/o.n})});
    Lg.pts.forEach(pt=>{const c={x:pt.x,y:pt.y,lat:wall?(pt.x-Lg.geo.poly[0][0])*0+0:0,t:0};let u,v;if(wall){const near=Lg.cells.reduce((b,c2)=>{const d=Math.hypot(c2.x-pt.x,c2.y-pt.y);return d<b[0]?[d,c2]:b},[1e9,null])[1];u=near?near.lat:0;v=near?near.t:0.3}else{u=pt.x;v=1-(pt.y-y0)/((y1-y0)||1)}items.push({p:pt.p,col:Lg.rows[pt.i].col,u,w:Math.max(0.6,pt.rad*2),v})})}
  else{const rows=[...r.rows].sort((a,b)=>b.p.h-a.p.h);rows.forEach((x,ri)=>{const v=rows.length>1?ri/(rows.length-1):0.5,k=x.m==='count'?Math.min(3,x.qty):3;for(let j=0;j<k;j++)items.push({p:x.p,col:x.col,u:rand()*6,w:x.m==='count'?Math.min(3,x.p.h*0.6):0.8,v})})}
  if(!items.length){sv.innerHTML=`<text x="${W/2}" y="${H/2}" text-anchor="middle">Aucune plante à afficher.</text>`;return}
  const u0=Math.min(...items.map(i=>i.u-i.w/2)),u1=Math.max(...items.map(i=>i.u+i.w/2)),hMax=Math.min(8,Math.max(1.2,...items.map(i=>i.p.h)));
  const ground=H-28,depthPx=Math.min(60,H*0.18),sx=(W-40)/((u1-u0)||1),sy=(ground-depthPx-18)/(hMax*1.08);
  let g=`<defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:light-dark(#dfeef6,#16252c)"/><stop offset="1" style="stop-color:light-dark(#f4f8f1,#0e1511)"/></linearGradient></defs><rect width="${W}" height="${ground}" fill="url(#skyg)"/>`;
  if(wall)g+=`<rect x="0" y="${(ground-depthPx-2*sy).toFixed(1)}" width="${W}" height="${(2*sy).toFixed(1)}" fill="#b8a48c" opacity=".55"/><text x="10" y="${(ground-depthPx-2*sy+14).toFixed(1)}" class="lbl">Mur ou haie du fond</text>`;
  g+=`<rect y="${ground-depthPx}" width="${W}" height="${depthPx+28}" fill="#8a6f52" opacity=".35"/>`;
  items.sort((a,b)=>a.v-b.v).forEach(it=>{const s=0.78+0.22*it.v,base=ground-depthPx*(1-it.v),x=20+(it.u-u0)*sx,w=Math.max(6,it.w*sx*s),h=Math.max(4,it.p.h*sy*s);g+=plantShape(it.p,x,base,w,h,seasonColor(it.p,it.col),rand)});
  const hs=[0.5,1,2,4,6,8].filter(v=>v<=hMax*1.05);hs.forEach(v=>{const y=ground-v*sy;g+=`<line x1="${W-34}" x2="${W-26}" y1="${y}" y2="${y}" stroke="var(--mute)"/><text x="${W-22}" y="${y+4}">${nf(v,v<1?1:0)} m</text>`});
  if(Math.max(...items.map(i=>i.p.h))>hMax)g+=`<text x="${W/2}" y="14" text-anchor="middle">Les arbres dépassent du cadre.</text>`;
  sv.innerHTML=g}
const MONTHS_FULL=['Toutes saisons (couleurs des fleurs)',...MOL.map(m=>m[0].toUpperCase()+m.slice(1))];
$('#planMonth').addEventListener('input',e=>{S.planMonth=+e.target.value;$('#planMonthO').textContent=MONTHS_FULL[S.planMonth];if(S.lastCompo){drawPlan(S.lastCompo,S.lastLayout);drawElev(S.lastCompo,S.lastLayout)}});
if(window.ResizeObserver)new ResizeObserver(()=>{if(S.lastCompo)drawElev(S.lastCompo,S.lastLayout)}).observe($('#elev'));

/* ================= Fiche plante ================= */
async function openPlant(l){const p=PL.find(x=>x.l===l);if(!p)return;const z=scorePlant(p,cond()),dlg=$('#plantDlg');
  const T=tasksFor(p,S.style).sort((a,b)=>a[0]-b[0]);
  $('#plantBody').innerHTML=`<div class="pdph" id="pdPh"></div><div class="pdtx"><span class="tag">${TL[p.t]}</span><h3>${esc(p.n)}</h3><p class="lat">${esc(p.l)}</p>
   <p class="pdscore">${z.ok?'Adaptée à votre site':'Peu adaptée à votre site'} : <b>${z.score} %</b>${z.why.length?' · '+z.why.map(esc).join(' · '):''}</p>
   <table class="kv"><tr><th>Hauteur</th><td>${nf(p.h,p.h<1?2:1)} m · ${PORT[p.p]}</td></tr><tr><th>Feuillage</th><td>${p.fo.map(f=>FOL[f]).join(', ')}${p.pers?', persistant':''}</td></tr>
   ${p.c.length?`<tr><th>Fleurs</th><td><span class="dots" style="display:inline-flex">${dots(p)}</span> ${p.c.map(c=>COL[c]?COL[c][0].toLowerCase():c).join(', ')}</td></tr>`:''}
   <tr><th>Exposition</th><td>${[...p.e].map(x=>EXL[x]).join(', ')}</td></tr><tr><th>Sol</th><td>${[...p.w].map(x=>WL[x]).join(', ')} · ${[...p.s].map(x=>SL[x]).join(', ')} · pH ${nf(p.ph[0],1)} à ${nf(p.ph[1],1)}</td></tr>
   <tr><th>Rusticité</th><td>${p.z!=null?`jusqu’à ${p.z} °C`:'annuelle (pas de rusticité)'}</td></tr></table>
   ${p.f.length?flBar(p):''}${p.note?`<p class="note">${esc(p.note)}</p>`:''}
   ${T.length?`<h4>Entretien</h4><ul>${T.map(([m,t])=>`<li><b>${MOL[(m-1+12)%12]}</b> : ${esc(t)}</li>`).join('')}</ul>`:''}
   <div class="chips">${p.t==='annuelle'?'<span class="note">Annuelle : proposée dans l’onglet « Jardinières ».</span>':`<label>Quantité<input type="number" id="pdQty" min="1" max="999" value="${p.t==='arbre'||(p.t==='arbuste'&&!p.d)?1:Math.max(1,Math.round((p.d||3)*2))}" style="width:6em"></label><button type="button" class="pri" id="pdAdd">Ajouter à mon massif</button>`}<button type="button" id="pdClose">Fermer</button></div></div>`;
  dlg.dataset.l=l;if(!dlg.open)dlg.showModal();const ph=await getPhoto(l);if(dlg.dataset.l===l&&$('#pdPh'))$('#pdPh').innerHTML=ph&&ph.src?`<img src="${esc(ph.src)}" alt="${esc(p.n)}" loading="lazy" decoding="async"><small>${esc(ph.credit||'')}</small>`:'<span>Photo indisponible</span>'}
function addToBed(l,q){const p=PL.find(x=>x.l===l);if(!p)return;pushUndo();if(S.pick!=='perso'){const r=S.lastCompo&&!S.lastCompo.custom?S.lastCompo:compose();S.custom=r.rows.map(x=>({l:x.p.l,qty:x.qty}));S.pick='perso'}
  const ex=S.custom.find(u=>u.l===l);if(ex)ex.qty+=q;else S.custom.push({l,qty:q});renderCompo();syncUI();toast(`${p.n} ajouté à votre massif (choix personnalisé)`,{undo:true})}
$('#plantDlg').addEventListener('click',e=>{if(e.target.id==='pdClose'||e.target===$('#plantDlg'))$('#plantDlg').close();if(e.target.id==='pdAdd'){addToBed($('#plantDlg').dataset.l,Math.max(1,parseInt($('#pdQty').value)||1));$('#plantDlg').close()}});
document.addEventListener('click',e=>{if(e.target.closest('input,select,button:not(.padd),a,.q,dialog'))return;const add=e.target.closest('.padd');if(add){addToBed(add.dataset.add,Math.max(1,Math.round((PL.find(x=>x.l===add.dataset.add)||{}).d*2||1)));return}
  const el=e.target.closest('.pc,.pcell');if(!el)return;const ph=el.querySelector('[data-ph]');if(ph&&PL.some(x=>x.l===ph.dataset.ph))openPlant(ph.dataset.ph)});

/* ================= Menu, texte, thème ================= */
const closeMenu=()=>{$('#menuList').hidden=true;$('#menuBtn').setAttribute('aria-expanded','false')};
$('#menuBtn').addEventListener('click',e=>{e.stopPropagation();const o=$('#menuList').hidden;$('#menuList').hidden=!o;$('#menuBtn').setAttribute('aria-expanded',String(o))});
document.addEventListener('click',e=>{if(!e.target.closest('.hmenu'))closeMenu()});
$('#mProjects').addEventListener('click',()=>{closeMenu();saveNow(true);renderProjDlg();$('#projDlg').showModal()});
$('#mGloss').addEventListener('click',()=>{closeMenu();openGloss()});$('#glossDlg').addEventListener('click',e=>{if(e.target.id==='glossClose'||e.target===$('#glossDlg'))$('#glossDlg').close()});
const UI={tz:1,theme:''};try{Object.assign(UI,JSON.parse(localStorage.getItem('plantania:ui')||'{}'))}catch(e){}
function applyUI(){document.documentElement.style.setProperty('--tz',UI.tz);document.documentElement.classList.toggle('bigtext',UI.tz>1);if(UI.theme)document.documentElement.dataset.theme=UI.theme;else delete document.documentElement.dataset.theme;
  $('#mText').textContent=UI.tz>=1.3?'Texte normal':UI.tz>1?'Texte encore plus grand':'Texte plus grand';$('#mTheme').textContent=UI.theme==='dark'?'Mode clair':UI.theme==='light'?'Thème automatique':'Mode sombre';try{localStorage.setItem('plantania:ui',JSON.stringify(UI))}catch(e){}}
$('#mText').addEventListener('click',()=>{UI.tz=UI.tz>=1.3?1:UI.tz>1?1.3:1.15;applyUI()});$('#mTheme').addEventListener('click',()=>{UI.theme=UI.theme==='dark'?'light':UI.theme==='light'?'':'dark';applyUI();if(S.lastCompo)drawElev(S.lastCompo,S.lastLayout)});
applyUI();

/* ================= Carte : recherche, mesure, aimantation, couches ================= */
$('#mapSearch').addEventListener('submit',async e=>{e.preventDefault();const q=$('#mq').value.trim(),box=$('#mresults');if(!q)return;box.textContent='Recherche…';let res=[];
  try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=fr&q=${encodeURIComponent(q)}`);if(r.ok)res=(await r.json()).map(x=>({lat:+x.lat,lon:+x.lon,name:x.display_name}))}catch(err){}
  box.innerHTML=res.length?res.map((x,i)=>`<button type="button" data-i="${i}">${esc(x.name)}</button>`).join(''):'Aucun résultat.';
  box.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;const x=res[+b.dataset.i];box.innerHTML='';setSite(x.lat,x.lon,true)}});
S.snap=true;$('#snapMode').addEventListener('change',e=>{S.snap=e.target.checked});
function snapPt(lat,lng){if(!S.snap)return[lat,lng];const cand=[];LISTS.forEach(k=>(S[k]||[]).forEach(it=>(it.raw||it.pts||[]).forEach(p=>cand.push(p))));if(S.bed)(S.bed.raw||S.bed.ll).forEach(p=>cand.push(p));
  if(S.parcel)S.parcel.ring.forEach(([lo,la])=>cand.push([la,lo]));if(S.drawPts.length>2)cand.push(S.drawPts[0]);
  let best=null,bd=1e9;const P=map.latLngToContainerPoint&&map.latLngToContainerPoint([lat,lng]);
  cand.forEach(c=>{let d;if(P){const Q=map.latLngToContainerPoint(c);d=Math.hypot(P.x-Q.x,P.y-Q.y)/12}else d=llDist([lat,lng],c)/1;if(d<1&&d<bd){bd=d;best=c}});
  return best?[best[0],best[1]]:[lat,lng]}
{const lay=$('#layers'),d=document.createElement('details');d.className='layersd';d.open=innerWidth>760;d.innerHTML='<summary>Fond de carte et couches</summary>';lay.before(d);d.appendChild(lay)}

/* ================= Photo : reconnaissance par l’assistant ================= */
async function photoToB64(file){const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=URL.createObjectURL(file)});const k=Math.min(1,1024/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',0.8).split(',')[1]}
async function recognizePhoto(file){AS.msgs.push({role:'user',text:'📷 Photo envoyée pour identification'});renderChat();
  if(AST.mode==='local'){AS.msgs.push({role:'assistant',text:'La reconnaissance de plantes et de sols sur photo demande Claude : ouvrez les réglages (⚙) et choisissez « Claude avec ma clé API » ou « Claude via un serveur relais ».'});renderChat();return}
  AS.busy=true;renderChat();
  try{const data=await photoToB64(file),ctx=siteContext();
    const body={model:AST.model||'claude-sonnet-5-5',max_tokens:900,system:'Tu es un jardinier-paysagiste belge. On t’envoie une photo prise au jardin. Si c’est une plante : donne son nom français et latin probable, ton degré de certitude, puis 3 conseils adaptés au site décrit (exposition, sol). Si c’est un échantillon de terre : décris la texture probable (sableuse, limoneuse, argileuse), la matière organique et les signes d’excès d’eau, puis le test simple à faire pour confirmer. Sinon dis ce que tu vois. Réponds en français, en 120 mots au plus.',
      messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data}},{type:'text',text:'Contexte du site (JSON) : '+JSON.stringify(ctx).slice(0,3000)+'\nQue vois-tu sur cette photo ?'}]}]};
    let r;if(AST.mode==='proxy'){if(!AST.proxy)throw new Error('adresse du serveur relais manquante');r=await fetch(AST.proxy,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}
    else{if(!AST.key)throw new Error('clé API manquante');r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':AST.key,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)})}
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));
    AS.msgs.push({role:'assistant',text:(j.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim()||'Je n’ai pas pu analyser cette photo.'})}
  catch(e){AS.msgs.push({role:'assistant',text:'Analyse impossible : '+e.message})}finally{AS.busy=false;renderChat()}}
$('#aiPhoto').addEventListener('click',()=>$('#aiFile').click());$('#aiFile').addEventListener('change',e=>{const f=e.target.files[0];if(f)recognizePhoto(f);e.target.value=''});

/* ================= « Un problème ici ? » ================= */
document.querySelectorAll('.band .shead').forEach(h=>{const sec=h.closest('section');if(!sec||!sec.id)return;const b=document.createElement('button');b.type='button';b.className='probl';b.textContent='Un problème ici ?';b.dataset.sec=sec.id;h.appendChild(b)});
document.addEventListener('click',e=>{const b=e.target.closest('.probl');if(!b)return;const t=b.closest('.shead').querySelector('h2').textContent;$('#fbPanel').hidden=false;const ta=$('#fbBad');if(!ta.value.startsWith('['))ta.value=`[${t}] `+ta.value;ta.focus()});

Object.assign(window,{__S:S,__WZ:WZ,__PRJ:PRJ});
/* ================= Tracé : longueurs et confirmations ================= */
{const _dt=drawTemp;drawTemp=function(){_dt();const el=$('#drawInfo');if(!el)return;const n=S.drawPts.length;if(n<2){el.textContent='';return}
  const cl=SHAPE_MODES[S.mode]===3&&n>2,pts=S.curve&&n>=(cl?3:2)?crSpline(S.drawPts,cl):S.drawPts,L_=lenLL(pts,cl);
  el.textContent=cl?`Périmètre ${nf(L_,1)} m · surface ${nf(areaLL(pts),1)} m²`:`Longueur ${nf(L_,1)} m`;
  if(S.mode==='measure'){const last=S.drawPts[n-1];const mk=L.circleMarker(last,{radius:3,opacity:0,fillOpacity:0,interactive:false}).addTo(tempLayer);if(mk.bindTooltip)mk.bindTooltip(nf(L_,1)+' m',{permanent:true,direction:'top',className:'maplbl'})}}}
function toastNew(m,id){const [k,it]=findItem(id);if(!it)return;const A=()=>nf(areaLL(it.pts)),Ln=()=>nf(lenLL(it.pts),1);
  const t={hedge:()=>`Haie ajoutée : ${Ln()} m`,lawn:()=>`Pelouse ajoutée : ${A()} m²`,pond:()=>`Pièce d’eau ajoutée : ${A()} m²`,vine:()=>`Vigne ajoutée : ${Ln()} m`,talus:()=>`Talus ajouté : ${A()} m²`,potager:()=>`Potager ajouté : ${A()} m²`,orchard:()=>`Verger ajouté : ${A()} m²`,obsPoly:()=>`Bâtiment ajouté : ${A()} m²`,obsLine:()=>`Mur ajouté : ${Ln()} m`}[m];
  if(t)toast(t(),{undo:true})}

/* ================= v6 : légendes des calendriers ================= */
const OCOL={pommier:'#c62828',poirier:'#9e9d24',prunier:'#6a1b9a',cerisier:'#ad1457',cognassier:'#f9a825',neflier:'#8d6e63',noyer:'#5d4037',pecher:'#ef6c00',abricotier:'#fb8c00',noisetier:'#795548',sauvage:'#2e7d32'};
function hcPhase(v,m){if(!v.m.includes(m))return'';if(v.use.includes('K')&&v.m.length>2)return v.m.slice(0,2).includes(m)?'on':'st';return'on'}
function hcCell(t,m){const ph=hcPhase(t.v,m),c=OCOL[t.k]||'var(--soil)';return `<i class="${ph}" style="${ph?`--hc:${c}`:''}" title="${MOL[m-1]}${ph==='on'?' : cueillette':ph==='st'?' : fruits conservés':''}"></i>`}
function hcLegend(P){const ks=[...new Set(P.trees.map(t=>t.k))];return `<div class="cleg"><span><i class="on" style="--hc:#777"></i> Cueillette et consommation fraîche</span><span><i class="st" style="--hc:#777"></i> Consommation après conservation (fruits de garde)</span>${ks.map(k=>`<span><i class="on" style="--hc:${OCOL[k]}"></i> ${esc(ORCH[k].n)}</span>`).join('')}</div>`}

/* ================= Dessin sur la carte plus intuitif ================= */
const SHORT={site:'Point d’étude',obs:'Arbre ou bâtiment',obsPoly:'Bâtiment (forme)',obsLine:'Mur, haie existante',bed:'Massif',hedge:'Haie',fruit:'Fruitier',orchard:'Verger',potager:'Potager',vine:'Vigne',lawn:'Pelouse',pond:'Mare',talus:'Talus',measure:'Mesurer',erase:'Gomme'};
const DRAWTXT={bed:'Cliquez les angles du massif, l’un après l’autre',hedge:'Cliquez le début de la haie, ses angles, puis la fin',vine:'Cliquez le long du mur ou du palissage',lawn:'Cliquez le contour de la pelouse',pond:'Cliquez le contour de la mare',talus:'Cliquez le contour du talus',potager:'Cliquez le contour du potager',orchard:'Cliquez le contour du verger',obsPoly:'Cliquez les angles du bâtiment',obsLine:'Cliquez le long du mur ou de la haie existante',measure:'Cliquez les points du trajet à mesurer',obs:'Cliquez sur chaque arbre ou bâtiment existant',fruit:'Cliquez l’emplacement de chaque arbre fruitier',erase:'Cliquez sur un élément pour le supprimer'};
function renderMapTools(){const box=$('#mapTools');if(!box)return;const shown=TOOLS.filter(t=>t[0]!=='g'&&SHORT[t[0]]&&!(WZ.on&&TOOLWANT[t[0]]&&!S.want.has(TOOLWANT[t[0]])));
  box.innerHTML=`<button type="button" class="mtt" id="mtToggle" aria-expanded="${!box.classList.contains('closed')}">Outils</button>`+shown.map(t=>`<button type="button" data-mt="${t[0]}" aria-pressed="${S.mode===t[0]}" title="${esc(t[1])}">${swatch(t[0],t[2])}<span>${esc(SHORT[t[0]])}</span></button>`).join('')}
$('#mapTools').addEventListener('click',e=>{if(e.target.closest('#mtToggle')){$('#mapTools').classList.toggle('closed');renderMapTools();return}const b=e.target.closest('[data-mt]');if(!b)return;const m=b.dataset.mt;setMode(S.mode===m&&m!=='site'?'site':m)});
function updateDrawUI(){const bar=$('#drawBar');if(!bar)return;const m=S.mode,need=SHAPE_MODES[m],n=S.drawPts.length;
  document.querySelectorAll('#mapTools [data-mt]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mt===m)));
  if(m==='site'||!DRAWTXT[m]){bar.hidden=!(WZ.on&&WZ.step===1);if(!bar.hidden)bar.innerHTML='<b>Cliquez sur la carte pour placer votre terrain</b><span>ou faites glisser le repère jaune.</span>';return}
  bar.hidden=false;const ok=need&&n>=need,cl=need===3;
  bar.innerHTML=`<b>${esc(SHORT[m])} : ${esc(DRAWTXT[m])}.</b>${need?`<span>${n} point${n>1?'s':''} · ${ok?(cl?'cliquez le premier point ou « Terminer » pour fermer la forme':'« Terminer » quand c’est fini'):`encore ${need-n} au minimum`}</span>`:''}
   <span class="dbtns">${need?`<button type="button" data-db="undo"${n?'':' disabled'}>Retirer le dernier point</button><button type="button" class="pri" data-db="finish"${ok?'':' disabled'}>Terminer</button>`:''}<button type="button" data-db="cancel">${need?'Abandonner':'J’ai fini'}</button></span>
   <small>${need?'Raccourcis : Entrée pour terminer, Retour arrière pour retirer un point, Échap pour abandonner.':'Échap pour arrêter.'}</small>`}
$('#drawBar').addEventListener('click',e=>{const a=e.target.dataset.db;if(!a)return;if(a==='undo'){S.drawPts.pop();drawTemp()}if(a==='finish')finishShape();if(a==='cancel'){S.drawPts=[];drawTemp();setMode('site')}});
{const _sm=setMode;setMode=function(m){_sm(m);if(typeof rubber!=='undefined')rubber.clearLayers();updateDrawUI()}}
const rubber=L.layerGroup().addTo(map);
{const _dt2=drawTemp;drawTemp=function(){_dt2();rubber.clearLayers();const n=S.drawPts.length;
  if(n>=3&&SHAPE_MODES[S.mode]===3){const mk=L.circleMarker(S.drawPts[0],{radius:10,color:'#fff',weight:3,fillColor:TC[S.mode]||'#e3a018',fillOpacity:.9,interactive:false}).addTo(tempLayer);if(mk.bindTooltip)mk.bindTooltip('Cliquez ici pour fermer',{direction:'top'})}
  updateDrawUI()}}
{const _ad=addDrawPt;addDrawPt=function(lat,lng){const n=S.drawPts.length;
  if(n>=3&&SHAPE_MODES[S.mode]===3){const f=S.drawPts[0];let near;const P=map.latLngToContainerPoint&&map.latLngToContainerPoint([lat,lng]);if(P){const Q=map.latLngToContainerPoint(f);near=Math.hypot(P.x-Q.x,P.y-Q.y)<16}else near=llDist([lat,lng],f)<1.2;if(near){finishShape();return}}
  _ad(lat,lng)}}
map.on('mousemove',e=>{if(!(S.mode in SHAPE_MODES)||!S.drawPts.length||!e.latlng)return;rubber.clearLayers();const a=S.drawPts[S.drawPts.length-1],b=[e.latlng.lat,e.latlng.lng];
  L.polyline([a,b],{color:TC[S.mode]||'#e3a018',weight:2,dashArray:'4 6',interactive:false}).addTo(rubber);
  if(SHAPE_MODES[S.mode]===3&&S.drawPts.length>=2)L.polyline([b,S.drawPts[0]],{color:TC[S.mode]||'#e3a018',weight:1,opacity:.5,dashArray:'2 6',interactive:false}).addTo(rubber)});
document.addEventListener('keydown',e=>{if(e.target.closest('textarea,select,[contenteditable],dialog')||(e.target.tagName==='INPUT'&&!['checkbox','radio','button'].includes(e.target.type)))return;const m=S.mode;if(!(m in SHAPE_MODES)&&!DRAWTXT[m])return;
  if(e.key==='Escape'){S.drawPts=[];drawTemp();setMode('site')}
  else if(e.key==='Enter'&&m in SHAPE_MODES){e.preventDefault();finishShape()}
  else if(e.key==='Backspace'&&S.drawPts.length){e.preventDefault();S.drawPts.pop();drawTemp()}});
function siteClick(lat,lng){
  const has=S.obs.length||S.bed||LISTS.some(k=>(S[k]||[]).length)||S.fruits.length,far=S.lat!=null&&llDist([lat,lng],[S.lat,S.lon])>150;
  if(WZ.on&&WZ.step!==1&&!far){toast('Pour dessiner, choisissez d’abord un outil dans la barre « Outils » de la carte.');return}
  if(!has||!L.popup){setSite(lat,lng);return}
  const d=document.createElement('div');d.innerHTML=`<b>Déplacer le point d’étude ici ?</b><br><small>${far?'Ce lieu est à plus de 150 m : les éléments dessinés seront effacés.':'Le climat, le sol et l’ensoleillement seront recalculés.'}</small><br><button type="button" class="popdel">Oui, déplacer</button>`;
  d.querySelector('button').onclick=()=>{map.closePopup();setSite(lat,lng)};L.popup().setLatLng([lat,lng]).setContent(d).openOn(map)}
{const _wa=wizApply;wizApply=function(){_wa();renderMapTools();updateDrawUI()}}
if(innerWidth<700)$('#mapTools').classList.add('closed');
renderMapTools();updateDrawUI();

/* ================= Identification des plantes par photo ================= */
const IND=[
 ['Urtica dioica','Ortie dioïque','f','','r',0,'',0,'Sol riche en azote et en matière organique, frais.'],
 ['Rumex obtusifolius','Rumex à feuilles obtuses','h','','r',1,'',0,'Sol tassé, riche en azote, souvent humide.'],
 ['Rumex acetosella','Petite oseille','d','a','p',0,'s',0,'Sol acide, sableux et pauvre.'],
 ['Rumex acetosa','Oseille des prés','f','a','m',0,'',0,'Prairie fraîche à tendance acide.'],
 ['Equisetum arvense','Prêle des champs','h','','p',1,'',0,'Sol compact, engorgé d’eau en profondeur.'],
 ['Ranunculus repens','Renoncule rampante','h','','m',1,'',0,'Sol tassé et gorgé d’eau en hiver.'],
 ['Taraxacum officinale','Pissenlit','f','','r',1,'',0,'Sol riche, plutôt compact.'],
 ['Plantago major','Plantain majeur','f','','r',1,'',0,'Sol piétiné et tassé.'],
 ['Plantago lanceolata','Plantain lancéolé','d','','m',0,'s',0,'Prairie sèche à fraîche, fertilité moyenne.'],
 ['Stellaria media','Mouron des oiseaux','f','','r',0,'',0,'Sol meuble, travaillé, riche en azote.'],
 ['Chenopodium album','Chénopode blanc','f','','r',0,'s',0,'Sol cultivé riche en azote.'],
 ['Convolvulus arvensis','Liseron des champs','d','c','m',1,'s',1,'Sol compact, souvent calcaire.'],
 ['Elymus repens','Chiendent rampant','f','','r',1,'',0,'Sol tassé et riche en azote.'],
 ['Trifolium repens','Trèfle blanc','f','','p',1,'s',0,'Sol pauvre en azote, souvent tassé.'],
 ['Bellis perennis','Pâquerette','f','','m',1,'s',0,'Pelouse tondue court, sol tassé.'],
 ['Lotus corniculatus','Lotier corniculé','d','c','p',0,'s',1,'Sol pauvre, plutôt sec et calcaire.'],
 ['Juncus effusus','Jonc épars','h','a','m',1,'',0,'Sol engorgé, acide et tassé.'],
 ['Cardamine pratensis','Cardamine des prés','h','','m',0,'',0,'Prairie humide.'],
 ['Filipendula ulmaria','Reine-des-prés','h','','r',0,'',0,'Sol humide et fertile.'],
 ['Mentha aquatica','Menthe aquatique','h','','m',0,'',0,'Sol gorgé d’eau, bord de fossé ou de mare.'],
 ['Lythrum salicaria','Salicaire','h','','m',0,'s',0,'Sol humide, bord d’eau.'],
 ['Glechoma hederacea','Lierre terrestre','f','','r',0,'m',0,'Sol frais et riche, mi-ombre.'],
 ['Geranium robertianum','Herbe à Robert','f','','r',0,'o',0,'Sol frais riche en azote, à l’ombre.'],
 ['Galium aparine','Gaillet gratteron','f','','r',0,'',0,'Sol riche en azote.'],
 ['Rubus','Ronce','f','','m',0,'',0,'Friche, sol profond, plutôt acide à neutre.'],
 ['Calluna vulgaris','Callune','d','a','p',0,'s',0,'Sol très acide et pauvre.'],
 ['Vaccinium myrtillus','Myrtille','f','a','p',0,'m',0,'Sol très acide, humus forestier.'],
 ['Pteridium aquilinum','Fougère aigle','f','a','m',0,'m',0,'Sol acide, sans calcaire.'],
 ['Digitalis purpurea','Digitale pourpre','f','a','m',0,'m',0,'Sol acide, clairière.'],
 ['Cytisus scoparius','Genêt à balais','d','a','p',0,'s',0,'Sol acide, sableux et pauvre.'],
 ['Holcus lanatus','Houlque laineuse','f','a','m',0,'s',0,'Prairie fraîche à tendance acide.'],
 ['Papaver rhoeas','Coquelicot','d','c','m',0,'s',1,'Sol cultivé, plutôt calcaire et sec.'],
 ['Sinapis arvensis','Moutarde des champs','f','c','r',0,'s',0,'Sol cultivé, plutôt calcaire.'],
 ['Salvia pratensis','Sauge des prés','d','c','p',0,'s',1,'Prairie sèche sur sol calcaire.'],
 ['Knautia arvensis','Knautie des champs','d','c','p',0,'s',1,'Prairie sèche, sol neutre à calcaire.'],
 ['Thymus','Thym','d','','p',0,'s',1,'Sol sec et pauvre, exposition chaude.'],
 ['Sedum acre','Orpin âcre','d','','p',0,'s',1,'Sol très sec et superficiel, microclimat chaud.'],
 ['Achillea millefolium','Achillée millefeuille','d','','m',0,'s',0,'Sol plutôt sec et peu fertile.'],
 ['Leucanthemum vulgare','Marguerite commune','f','','p',0,'s',0,'Prairie peu fertile.'],
 ['Ficaria verna','Ficaire','h','','r',0,'o',0,'Sol frais à humide, riche, ombragé au printemps.'],
 ['Allium ursinum','Ail des ours','f','c','r',0,'o',0,'Sol frais riche en humus, souvent calcaire, sous-bois.'],
 ['Anemone nemorosa','Anémone des bois','f','','m',0,'o',0,'Sol forestier frais.'],
 ['Hedera helix','Lierre grimpant','f','','m',0,'o',0,'Ombre, sol frais.'],
 ['Mercurialis annua','Mercuriale annuelle','f','','r',0,'s',1,'Sol cultivé riche, chaud.'],
 ['Senecio vulgaris','Séneçon commun','f','','r',0,'',0,'Sol travaillé riche en azote.'],
 ['Matricaria discoidea','Matricaire odorante','f','','m',1,'s',0,'Sol piétiné et tassé.'],
 ['Potentilla anserina','Potentille ansérine','h','','m',1,'s',0,'Sol tassé, humide en hiver.'],
 ['Polygonum aviculare','Renouée des oiseaux','','','m',1,'s',0,'Sol piétiné et compacté.'],
 ['Sambucus nigra','Sureau noir','f','','r',0,'',0,'Sol riche en azote.'],
 ['Veronica persica','Véronique de Perse','f','','r',0,'',0,'Sol cultivé fertile.']];
const indOf=latin=>{const w=String(latin||'').replace(/ ×/,'').split(/\s+/);const two=w.slice(0,2).join(' ');return IND.find(x=>x[0]===two)||IND.find(x=>!x[0].includes(' ')&&x[0]===w[0])};
S.idents=[];const IDS={shots:[],busy:false,res:null};
/* ===== CLÉ Pl@ntNet PARTAGÉE : collez votre clé entre les apostrophes ci-dessous ===== */
const PLANTNET_CLE_DU_SITE='';
/* Adresse du serveur relais Claude (Cloudflare Worker) pour tous les visiteurs, ex. 'https://plantania-ia.votre-compte.workers.dev'. Laisser vide pour désactiver l’IA par défaut. */
const RELAIS_CLAUDE_DU_SITE='';
/* ==================================================================================== */
const IDSET={engine:'plantnet',key:''};try{Object.assign(IDSET,JSON.parse(localStorage.getItem('plantania:idset')||'{}'))}catch(e){}
const ORG={auto:'Automatique',leaf:'Feuille',flower:'Fleur',fruit:'Fruit',bark:'Écorce',habit:'Plante entière'};
async function shrink(file,max){const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=URL.createObjectURL(file)});const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  return{url:c.toDataURL('image/jpeg',0.82),blob:await new Promise(ok=>c.toBlob(ok,'image/jpeg',0.82))}}
function renderShots(){$('#idShots').innerHTML=IDS.shots.length?IDS.shots.map((s,i)=>`<figure><img src="${s.url}" alt="Photo ${i+1}"><select data-org="${i}" aria-label="Partie photographiée">${opts(ORG,s.organ)}</select><button type="button" data-rmshot="${i}" aria-label="Retirer la photo">×</button></figure>`).join(''):'<p class="note">Une seule plante par identification, en gros plan et bien nette : feuille, fleur, fruit ou écorce (jusqu’à 5 photos de la même plante).</p>';
  $('#idGo').disabled=!IDS.shots.length||IDS.busy;$('#idEngine').value=IDSET.engine;$('#idKey').value=IDSET.key;$('#idKeyRow').hidden=IDSET.engine!=='plantnet';$('#idKey').placeholder=PLANTNET_CLE_DU_SITE?'facultatif : clé partagée du site active':'2b10…';const sh=$('#idShared');if(sh)sh.hidden=!(PLANTNET_CLE_DU_SITE&&IDSET.engine==='plantnet')}
async function identify(){if(!IDS.shots.length)return;IDS.busy=true;renderShots();$('#idResult').innerHTML='<p class="state">Identification en cours…</p>';
  try{let C=[];
    if(IDSET.engine==='plantnet'){const KEY=IDSET.key||PLANTNET_CLE_DU_SITE;if(!KEY)throw new Error('ajoutez votre clé Pl@ntNet dans « Moteur d’identification » (gratuite, voir l’explication)');
      const fd=new FormData();IDS.shots.forEach(s=>{fd.append('images',s.blob,'photo.jpg');fd.append('organs',s.organ)});
      const r=await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(KEY)}&lang=fr&include-related-images=false`,{method:'POST',body:fd});
      const j=await r.json().catch(()=>({}));if(r.status===429)throw new Error('le quota quotidien d’identifications du site est atteint ; réessayez demain, ou ajoutez votre propre clé Pl@ntNet dans « Moteur d’identification »');if(r.status===404)throw new Error('aucune espèce reconnue : essayez une photo plus nette ou d’une autre partie de la plante');if(!r.ok)throw new Error((j.message||('erreur '+r.status))+(r.status===401||r.status===403?' : vérifiez la clé et le domaine autorisé':''));
      IDS.left=j.remainingIdentificationRequests;C=(j.results||[]).slice(0,5).map(x=>({latin:x.species.scientificNameWithoutAuthor,fr:(x.species.commonNames||[])[0]||'',score:x.score,family:(x.species.family||{}).scientificNameWithoutAuthor||''}))}
    else{if(AST.mode==='local')throw new Error('activez Claude dans les réglages de l’assistant (⚙), ou choisissez Pl@ntNet');
      const body={model:AST.model||'claude-sonnet-5-5',max_tokens:700,system:'Tu es botaniste en Belgique. Identifie la plante des photos. Réponds uniquement en JSON : {"candidats":[{"latin":"Genre espèce","fr":"nom français","score":0.0}],"remarque":"phrase courte"} avec au plus 4 candidats, scores entre 0 et 1.',
        messages:[{role:'user',content:[...IDS.shots.slice(0,3).map(s=>({type:'image',source:{type:'base64',media_type:'image/jpeg',data:s.url.split(',')[1]}})),{type:'text',text:'Partie photographiée : '+IDS.shots.map(s=>ORG[s.organ]).join(', ')+'. Quelle est cette plante ?'}]}]};
      let r;if(AST.mode==='proxy')r=await fetch(AST.proxy,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
      else r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':AST.key,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)});
      const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));
      const t=(j.content||[]).map(b=>b.text||'').join('');const m=t.match(/\{[\s\S]*\}/);const o=m?JSON.parse(m[0]):{};C=(o.candidats||[]).map(x=>({latin:x.latin,fr:x.fr||'',score:+x.score||0}));IDS.note=o.remarque||''}
    IDS.res=C;renderIdResult()}
  catch(e){$('#idResult').innerHTML=`<p class="koo">Identification impossible : ${esc(e.message)}.</p>`}finally{IDS.busy=false;renderShots()}}
function indTxt(I){if(!I)return'';const t=[];if(I[2])t.push({d:'sol sec',f:'sol frais',h:'sol humide'}[I[2]]);if(I[3])t.push({a:'sol acide',n:'sol neutre',c:'sol calcaire'}[I[3]]);if(I[4])t.push({p:'pauvre en azote',m:'fertilité moyenne',r:'riche en azote'}[I[4]]);if(I[5])t.push('sol tassé');return t.join(', ')}
function renderIdResult(){const C=IDS.res||[];if(!C.length){$('#idResult').innerHTML='<p class="koo">Aucune espèce reconnue. Essayez une photo plus nette, ou d’une autre partie de la plante.</p>';return}
  $('#idResult').innerHTML=`<ol class="idcands">${C.map((c,i)=>{const I=indOf(c.latin),inPL=PL.find(p=>p.l.split(' ').slice(0,2).join(' ')===c.latin.split(' ').slice(0,2).join(' '));
    return `<li><div class="ph sm" data-ph="${esc(c.latin)}" data-n="${esc(c.fr)}" data-small="1"></div><div><b>${esc(c.fr||c.latin)}</b> <i class="src">${esc(c.latin)}</i><div class="idsc"><i style="width:${Math.round(c.score*100)}%"></i></div><small>${Math.round(c.score*100)} % de vraisemblance${I?` · <span class="okk">plante indicatrice : ${esc(indTxt(I))}</span>`:''}${inPL?' · présente dans la bibliothèque de plantes':''}</small></div><button type="button" class="${i?'':'pri'}" data-idok="${i}">C’est elle : ajouter au relevé</button></li>`}).join('')}</ol>
   ${IDS.note?`<p class="note">${esc(IDS.note)}</p>`:''}${IDS.left!=null&&IDS.left<100?`<p class="note">Encore ${IDS.left} identifications disponibles aujourd’hui.</p>`:''}<p class="note">Vérifiez toujours le résultat en comparant avec les photos de l’espèce. Moins de 30 % : identification incertaine.</p>`;watchPhotos($('#idResult'))}
function addIdent(o){S.idents=S.idents.filter(x=>x.latin!==o.latin);S.idents.push({abund:2,...o,date:Date.now()});renderIdents();renderV4();toast(`${o.fr||o.latin} : ajoutée au relevé du terrain`)}
function idDiag(){const W={1:1,2:2,3:3},out={n:0,list:[]};let we=0,se=0,wp=0,sp=0,wn=0,sn=0,tass=0,hot=0,ce=0,cp=0,cn=0;const lum={s:0,m:0,o:0};
  S.idents.forEach(x=>{const I=indOf(x.latin);if(!I)return;const w=W[x.abund]||2;out.n++;out.list.push([x,I]);
    if(I[2]){we+=w;ce++;se+=w*{d:-1,f:0,h:1}[I[2]]}if(I[3]){wp+=w;cp++;sp+=w*{a:-1,n:0,c:1}[I[3]]}if(I[4]){wn+=w;cn++;sn+=w*{p:-1,m:0,r:1}[I[4]]}if(I[5])tass+=w;if(I[7])hot+=w;if(I[6])lum[I[6]]+=w});
  const e=ce>=2?se/we:null,p=cp>=2?sp/wp:null,n=cn>=2?sn/wn:null;
  out.eau=e==null?null:e<-0.35?'d':e>0.35?'h':'f';out.ph=p==null?null:p<-0.5?'5.2':p<-0.15?'6.2':p<0.4?'7':'7.8';out.N=n==null?null:n<-0.35?'pauvre':n>0.35?'riche':'moyen';
  out.tass=tass>=3;out.hot=hot>=2;const lmax=Object.entries(lum).sort((a,b)=>b[1]-a[1])[0];out.lum=lmax[1]>=3?lmax[0]:null;out.conf=out.n>=4?'bonne':out.n>=2?'moyenne':out.n?'faible':'';return out}
function renderIdents(){const box=$('#idList');if(!box)return;
  box.innerHTML=S.idents.length?`<table class="stack"><thead><tr><th>Plante</th><th>Abondance</th><th>Ce qu’elle indique</th><th></th></tr></thead><tbody>${S.idents.map((x,i)=>{const I=indOf(x.latin);return `<tr><td><div class="pcell"><div class="ph sm" data-ph="${esc(x.latin)}" data-n="${esc(x.fr)}" data-small="1"></div><div><b>${esc(x.fr||x.latin)}</b><br><i class="src">${esc(x.latin)}</i></div></div></td>
    <td><select data-abund="${i}" aria-label="Abondance">${opts({1:'Rare',2:'Fréquente',3:'Dominante'},x.abund)}</select></td><td>${I?esc(I[8]):'<span class="note">Pas de valeur indicatrice connue dans la base.</span>'}</td><td><button type="button" data-idrm="${i}">Retirer</button></td></tr>`}).join('')}</tbody></table>`:'<p class="empty">Aucune plante relevée. Identifiez-en par photo, ou ajoutez celles que vous connaissez.</p>';
  watchPhotos(box);
  const D=idDiag(),c=cond(),dg=$('#idDiag');
  if(!D.n){dg.innerHTML='<p class="note">Relevez au moins deux plantes indicatrices (ortie, pissenlit, renoncule rampante, prêle, petite oseille, coquelicot…) pour obtenir un diagnostic du sol.</p>';return}
  const rows=[];if(D.eau)rows.push(['Humidité du sol',WL[D.eau],WL[c.eau],D.eau!==c.eau]);if(D.ph)rows.push(['pH',{5.2:'Acide (≈ 5,2)',6.2:'Légèrement acide (≈ 6,2)',7:'Neutre (≈ 7)',7.8:'Calcaire (≈ 7,8)'}[D.ph],nf(c.ph,1),Math.abs(+D.ph-c.ph)>0.6]);if(D.lum)rows.push(['Lumière',EXL[D.lum],EXL[c.expo],D.lum!==c.expo]);
  dg.innerHTML=`<div class="card"><p>D’après ${D.n} plante${D.n>1?'s':''} indicatrice${D.n>1?'s':''} (fiabilité ${D.conf}) :</p>
   <table class="stack"><thead><tr><th>Critère</th><th>Selon les plantes</th><th>Dans le projet</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}${r[3]?' <span class="koo">différent</span>':' <span class="okk">concorde</span>'}</td></tr>`).join('')}</tbody></table>
   <ul>${D.N?`<li>Fertilité : sol ${D.N==='riche'?'riche en azote : pas d’engrais, des plantes gourmandes s’y plairont (potager, rosiers)':D.N==='pauvre'?'pauvre : idéal pour une prairie fleurie ou un jardin sec ; compost pour un potager':'de fertilité moyenne'}.</li>`:''}
   ${D.tass?'<li class="koo">Plusieurs plantes de sol tassé : décompactez à la grelinette avant de planter, évitez de marcher sur le sol mouillé.</li>':''}
   ${D.hot?'<li>Plantes de lieux chauds et secs : microclimat favorable aux plantes méditerranéennes.</li>':''}
   <li>Le climat général vient des mesures (Open-Meteo) ; les plantes renseignent surtout sur le sol et le microclimat de l’endroit où elles poussent.</li></ul>
   ${rows.some(r=>r[3])?`<div class="chips">${D.eau?`<label class="chk"><input type="checkbox" id="idApE" checked> humidité</label>`:''}${D.ph?`<label class="chk"><input type="checkbox" id="idApP" checked> pH</label>`:''}${D.lum?`<label class="chk"><input type="checkbox" id="idApL"> lumière</label>`:''}<button type="button" class="pri" id="idApply">Appliquer au projet</button></div>`:'<p class="okk">Les plantes confirment les conditions du projet.</p>'}</div>`}
$('#ident').addEventListener('click',e=>{const t=e.target;
  if(t.id==='idAdd')$('#idFile').click();if(t.id==='idGo')identify();
  if(t.dataset.rmshot!=null){IDS.shots.splice(+t.dataset.rmshot,1);renderShots()}
  if(t.dataset.idok!=null){const c=IDS.res[+t.dataset.idok];addIdent({latin:c.latin,fr:c.fr,score:c.score,src:IDSET.engine})}
  if(t.dataset.idrm!=null){S.idents.splice(+t.dataset.idrm,1);renderIdents();renderV4()}
  if(t.id==='idManB'){const l=$('#idMan').value;const I=IND.find(x=>x[0]===l)||INV.find(x=>x[0]===l);if(I)addIdent({latin:I[0],fr:I[1],score:1,src:'manuel'})}
  if(t.id==='idApply'){const D=idDiag();if(D.eau&&$('#idApE')&&$('#idApE').checked)S.ovr.eau=D.eau;if(D.ph&&$('#idApP')&&$('#idApP').checked)S.ovr.ph=D.ph;if(D.lum&&$('#idApL')&&$('#idApL').checked)S.ovr.expo=D.lum;
    if(typeof renderConds==='function')renderConds();refreshPlants(true);renderIdents();toast('Conditions du projet mises à jour d’après les plantes indicatrices')}});
$('#ident').addEventListener('change',e=>{const t=e.target;if(t.dataset.org!=null)IDS.shots[+t.dataset.org].organ=t.value;
  if(t.dataset.abund!=null){S.idents[+t.dataset.abund].abund=+t.value;renderIdents();renderV4()}
  if(t.id==='idEngine'){IDSET.engine=t.value;renderShots()}if(t.id==='idKey')IDSET.key=t.value.trim();
  if(t.id==='idEngine'||t.id==='idKey'){try{localStorage.setItem('plantania:idset',JSON.stringify(IDSET))}catch(err){}}});
$('#idFile').addEventListener('change',async e=>{for(const f of [...e.target.files].slice(0,5-IDS.shots.length)){try{const s=await shrink(f,1280);IDS.shots.push({...s,organ:'auto'})}catch(err){}}e.target.value='';renderShots()});
const fillMan=()=>{$('#idMan').innerHTML=[...IND,...INV.filter(v=>!IND.some(x=>x[0]===v[0]))].sort((a,b)=>a[1].localeCompare(b[1],'fr'))
  .map(x=>`<option value="${esc(x[0])}">${esc(x[1])} (${esc(x[0])})${INV.some(v=>v[0]===x[0]&&v[2]!=='env')?' · invasive':''}</option>`).join('')};
{const _ser=serialize;serialize=function(){const d=_ser();d.set.idents=clone(S.idents);return d}}
{const _rs=restoreSettings;restoreSettings=function(t){_rs(t);S.idents=t&&t.idents?clone(t.idents):[];renderIdents()}}
{const _sr=synRows;synRows=function(){const r=_sr(),D=idDiag();if(D.n)r.push(['Plantes indicatrices',D.tass?'mid':'ok',`${D.n} espèce${D.n>1?'s':''} relevée${D.n>1?'s':''} : ${[D.eau&&WL[D.eau].toLowerCase(),D.ph&&{5.2:'sol acide',6.2:'légèrement acide',7:'neutre',7.8:'calcaire'}[D.ph],D.N&&('fertilité '+D.N),D.tass&&'sol tassé'].filter(Boolean).join(', ')} (fiabilité ${D.conf}).`]);return r}}
STEPMORE[1].push(['ident','Identifier mes plantes']);
renderShots();renderIdents();

/* ================= Plantes invasives et envahissantes ================= */
const INVL={ue:'Invasive réglementée par l’Union européenne : interdite à la vente, à la plantation et à la multiplication',inv:'Invasive en Belgique (exotique qui se répand dans la nature)',env:'Envahissante au jardin (indigène, mais difficile à contenir)'};
const DISP='Ne jamais la composter, la broyer en paillage ni jeter les déchets dans la nature : mettez-les en sac fermé au parc à conteneurs, avec les déchets destinés à l’incinération.';
const INV=[
 ['Reynoutria','Renouée asiatique','inv','Coupez les tiges au ras du sol toutes les 2 à 3 semaines d’avril à octobre, pendant plusieurs années, pour épuiser les rhizomes ; ou couvrez la zone d’une bâche épaisse et opaque débordant de 2 m, pendant au moins 3 ans. Un fragment de 1 cm de rhizome suffit à repartir : ne déplacez jamais de terre contaminée.','Ne la laissez pas atteindre une haie ou un cours d’eau ; signalez les grandes taches à votre commune.'],
 ['Fallopia japonica','Renouée du Japon','inv','Coupez les tiges au ras du sol toutes les 2 à 3 semaines d’avril à octobre, pendant plusieurs années, ou bâchez la zone pendant au moins 3 ans. Un fragment de rhizome suffit à repartir : ne déplacez jamais de terre contaminée.','Signalez les grandes taches à votre commune.'],
 ['Impatiens glandulifera','Balsamine de l’Himalaya','ue','Annuelle à racines superficielles : arrachez-la à la main avant la floraison (juin–juillet), avant que les capsules n’explosent. Repassez 2 à 3 ans de suite : le stock de graines s’épuise vite.','Surveillez les berges de fossés et de ruisseaux voisins.'],
 ['Heracleum mantegazzianum','Berce du Caucase','ue','Sa sève provoque de graves brûlures au soleil : gants, manches longues et lunettes. Coupez la racine à la bêche 10 à 15 cm sous le collet, au printemps ; à défaut, coupez les ombelles avant la formation des graines et brûlez-les en déchets.','Signalez-la (observations.be / waarnemingen.be) ; pour une grande population, faites appel à un professionnel.'],
 ['Ailanthus altissima','Ailante (faux vernis du Japon)','ue','Ne le coupez pas : il rejette massivement de souche et de racines. Arrachez les jeunes plants entiers ; pour un arbre, pratiquez un annelage partiel sur 2 ans, puis abattez-le quand il ne rejette plus.','Arrachez chaque semis dès son apparition.'],
 ['Ludwigia','Jussie','ue','Plante aquatique : arrachez-la entièrement à la main, racines comprises, en filtrant l’eau pour récupérer les fragments ; séchez les déchets loin de l’eau avant le parc à conteneurs.','Ne l’introduisez jamais dans une mare ; nettoyez bottes et outils.'],
 ['Myriophyllum aquaticum','Myriophylle du Brésil','ue','Retirez toute la plante et ses fragments au râteau, à plusieurs reprises ; un petit fragment suffit à reformer un herbier.','Ne transférez jamais d’eau ou de plantes d’une mare à l’autre.'],
 ['Hydrocotyle ranunculoides','Hydrocotyle fausse-renoncule','ue','Retirez-la entièrement à la main ou au râteau, en récupérant les fragments flottants ; repassez chaque mois pendant la saison.','Ne transférez jamais de plantes d’une mare à l’autre.'],
 ['Lagarosiphon major','Lagarosiphon (élodée crépue)','ue','Retirez-la au râteau en plusieurs passages et égouttez les déchets loin de l’eau.','Préférez les plantes oxygénantes indigènes (cornifle, myriophylle en épi).'],
 ['Elodea','Élodée du Canada ou de Nuttall','ue','Retirez-la au râteau en plusieurs passages ; réduisez les apports de nutriments (pas d’engrais près de la mare).','Préférez les plantes oxygénantes indigènes.'],
 ['Lysichiton americanus','Faux arum (lysichiton)','ue','Déterrez entièrement la souche et les racines, en sol humide ; repassez l’année suivante pour les repousses.','Ne la plantez pas près d’une zone humide.'],
 ['Asclepias syriaca','Asclépiade de Syrie','ue','Arrachez les drageons et coupez les tiges avant la formation des graines, plusieurs fois par an et pendant plusieurs années.','Ne la plantez pas.'],
 ['Pennisetum setaceum','Herbe aux écouvillons pourpre (Pennisetum setaceum)','ue','Arrachez la touffe entière avant la floraison. Pour une herbe pourpre de jardinière, vérifiez à l’achat qu’il s’agit d’un cultivar stérile (Pennisetum × advena).','Coupez les épis avant les graines.'],
 ['Buddleja davidii','Arbre aux papillons (buddléia)','inv','Coupez les fleurs fanées avant la formation des graines (chaque pied en produit des millions), arrachez les semis, et remplacez-le par un arbuste indigène mellifère (viorne, cornouiller, troène).','Arrachez les jeunes pieds dans les murs et les friches voisines.'],
 ['Prunus serotina','Cerisier tardif','inv','Arrachez les jeunes plants avec leurs racines ; ne coupez pas un arbre adulte (rejets) : annelez-le ou faites-le traiter par un professionnel.','Les oiseaux dispersent ses fruits : surveillez les semis.'],
 ['Prunus laurocerasus','Laurier-cerise','inv','Coupez les fruits avant maturité (les oiseaux les dispersent), arrachez les semis ; pour une haie, remplacez-le progressivement par une haie champêtre.','Taillez juste après la floraison pour éviter les fruits.'],
 ['Rhododendron ponticum','Rhododendron pontique','inv','Arrachez les jeunes pieds ; coupez les gros sujets au ras du sol et arrachez la souche, ou surveillez les rejets pendant plusieurs années.','Ne le plantez pas en lisière de bois.'],
 ['Solidago','Solidage du Canada ou géant','inv','Fauchez deux fois par an, avant la floraison (juin et août), et arrachez les rhizomes à la fourche-bêche sur les petites taches.','Ne laissez jamais monter en graines.'],
 ['Symphyotrichum lanceolatum','Aster lancéolé','inv','Arrachez les rhizomes à la fourche-bêche et fauchez avant la floraison.','Ne laissez pas monter en graines.'],
 ['Robinia pseudoacacia','Robinier faux-acacia','inv','Ne le coupez pas sans précaution : il drageonne. Annelez le tronc et arrachez les drageons plusieurs années de suite.','Évitez de travailler le sol autour (cela stimule les drageons).'],
 ['Rosa rugosa','Rosier rugueux','inv','Arrachez-le avec ses drageons, et coupez les fruits avant maturité.','Préférez l’églantier ou le rosier des champs, indigènes.'],
 ['Cotoneaster horizontalis','Cotonéaster horizontal','inv','Arrachez les semis et coupez les fruits avant que les oiseaux ne les dispersent ; remplacez-le par un couvre-sol indigène.','Surveillez les rocailles et murets voisins.'],
 ['Senecio inaequidens','Séneçon du Cap','inv','Arrachez-le avant la floraison, avec les gants (plante toxique), et répétez : il fleurit de juin aux gelées.','Surveillez talus et bords de chemins.'],
 ['Impatiens parviflora','Balsamine à petites fleurs','inv','Arrachez-la avant la floraison, plusieurs fois par an ; elle s’épuise en 2 à 3 ans.','Surveillez les sous-bois ombragés.'],
 ['Cortaderia selloana','Herbe de la pampa','inv','Coupez les plumeaux avant la dispersion des graines ; pour l’éliminer, arrachez la souche à la pioche ou à la mini-pelle.','Préférez un miscanthus stérile ou une graminée indigène.'],
 ['Rhus typhina','Sumac de Virginie','inv','Il drageonne fortement : arrachez les drageons à chaque apparition, posez une barrière anti-rhizomes, et ne blessez pas les racines.','Ne travaillez pas le sol autour.'],
 ['Parthenocissus inserta','Vigne vierge commune','inv','Arrachez les tiges et les racines, coupez les fruits avant maturité.','Préférez le lierre, indigène.'],
 ['Crassula helmsii','Crassule de Helms','inv','Plante de mare très difficile à éliminer : retirez-la entièrement, ou bâchez la zone hors d’eau pendant plusieurs mois ; faites appel à un professionnel si elle couvre de grandes surfaces.','Ne transférez jamais de plantes d’une mare à l’autre.'],
 ['Azolla','Azolla (fougère d’eau)','inv','Retirez-la régulièrement à l’épuisette ; elle profite des eaux riches : limitez les apports de nutriments.','Ne l’introduisez pas.'],
 ['Mahonia aquifolium','Mahonia à feuilles de houx','inv','Coupez les fruits avant maturité et arrachez les semis ; remplacez-le par un arbuste indigène.','Surveillez les lisières voisines.'],
 ['Phytolacca americana','Raisin d’Amérique','inv','Plante toxique : arrachez la racine pivotante avec des gants avant la maturité des baies.','Coupez les grappes avant maturité.'],
 ['Ambrosia artemisiifolia','Ambroisie à feuilles d’armoise','inv','Pollen très allergisant : arrachez-la avec des gants avant la floraison (juillet), et signalez-la.','Surveillez les mélanges de graines pour oiseaux, souvent à l’origine des pieds.'],
 ['Elymus repens','Chiendent rampant','env','Arrachez les rhizomes à la fourche-bêche (pas au motoculteur, qui les multiplie), puis couvrez le sol d’un paillage épais ou d’un carton.','Gardez le sol couvert.'],
 ['Convolvulus arvensis','Liseron des champs','env','Arrachez les tiges régulièrement pour épuiser les racines profondes ; paillez épais ou bâchez une saison sur les zones infestées.','Ne retournez pas le sol en profondeur.'],
 ['Equisetum arvense','Prêle des champs','env','Elle signale un sol tassé et humide : décompactez, drainez et apportez de la matière organique ; arrachez les tiges régulièrement.','Améliorer le sol est plus efficace que l’arrachage seul.'],
 ['Rubus','Ronce','env','Coupez les tiges et arrachez la souche à la pioche, ou fauchez plusieurs fois par an ; gardez un coin de ronces pour la faune si vous avez la place.','Recoupez les tiges qui s’enracinent par la pointe.'],
 ['Urtica dioica','Ortie dioïque','env','Arrachez les rhizomes jaunes à la fourche ; gardez-en un coin : elle nourrit de nombreux papillons et fait un excellent purin.','Elle signale un sol riche : pas d’engrais à cet endroit.'],
 ['Aegopodium podagraria','Égopode (herbe aux goutteux)','env','Arrachez les rhizomes à la fourche plusieurs fois, ou bâchez une saison complète ; les jeunes feuilles se mangent.','Posez une bordure enterrée de 20 cm autour des massifs.'],
 ['Glechoma hederacea','Lierre terrestre','env','Griffez et arrachez les stolons ; dans la pelouse, tondez plus haut et aérez le sol.','Plante mellifère précoce : tolérez-la dans les zones sauvages.'],
 ['Ranunculus repens','Renoncule rampante','env','Arrachez les stolons et améliorez le drainage ; elle recule quand le sol est moins tassé.','Évitez de marcher sur le sol mouillé.']];
const invOf=latin=>{const w=String(latin||'').replace(/ ×/,'').split(/\s+/);const two=w.slice(0,2).join(' ');return INV.find(x=>x[0]===two)||INV.find(x=>!x[0].includes(' ')&&x[0]===w[0])};
const invBadge=I=>I?`<span class="invb ${I[2]}">${I[2]==='env'?'Envahissante':'Invasive'+(I[2]==='ue'?' (UE)':'')}</span>`:'';
function invCard(I,name){return `<div class="invcard ${I[2]}"><b>${I[2]==='env'?'Plante envahissante':'Plante invasive'} : ${esc(name||I[1])}</b><p>${esc(INVL[I[2]])}.</p><p><b>${I[2]==='env'?'La contenir':'S’en débarrasser'} :</b> ${esc(I[3])}</p><p><b>Ensuite :</b> ${esc(I[4])}</p>${I[2]!=='env'?`<p><b>Déchets :</b> ${esc(DISP)}</p><p class="note">Vous pouvez signaler l’observation sur observations.be (Wallonie, Bruxelles) ou waarnemingen.be (Flandre). Statuts indicatifs : vérifiez la liste à jour sur le site de la base Harmonia (biodiversite.be).</p>`:''}</div>`}
{const _ir=renderIdResult;renderIdResult=function(){_ir();const C=IDS.res||[];const li=[...document.querySelectorAll('#idResult .idcands > li')];C.forEach((c,i)=>{const I=invOf(c.latin);if(I&&li[i]){li[i].querySelector('b').insertAdjacentHTML('afterend',' '+invBadge(I))}});
  const top=C[0]&&invOf(C[0].latin);if(top&&C[0].score>=0.2)$('#idResult').insertAdjacentHTML('afterbegin',invCard(top,C[0].fr||C[0].latin))}}
{const _ri=renderIdents;renderIdents=function(){_ri();const box=$('#idList');if(!box)return;S.idents.forEach((x,i)=>{const I=invOf(x.latin);const tr=box.querySelectorAll('tbody tr')[i];if(I&&tr)tr.querySelector('b').insertAdjacentHTML('afterend',' '+invBadge(I))});
  const inv=S.idents.map(x=>[x,invOf(x.latin)]).filter(a=>a[1]),ex=inv.filter(a=>a[1][2]!=='env'),nat=inv.filter(a=>a[1][2]==='env');$('#idInv').innerHTML=(ex.length?`<h3>Plantes invasives exotiques relevées</h3>${ex.map(([x,I])=>invCard(I,x.fr||x.latin)).join('')}`:'')+(nat.length?`<details class="adv"><summary>Plantes indigènes qui peuvent envahir le jardin (${nat.length}) : comment les contenir</summary>${nat.map(([x,I])=>invCard(I,x.fr||x.latin)).join('')}</details>`:'')}}
{const _sa=synActions;synActions=function(){const a=_sa(),inv=S.idents.map(x=>invOf(x.latin)).filter(I=>I&&I[2]!=='env');if(inv.length)a.unshift(`Éliminez les plantes invasives relevées (${[...new Set(inv.map(I=>I[1]))].join(', ')}) : voir l’onglet « Identification ».`);return a.slice(0,5)}}
{const _vs=v4Sections;v4Sections=function(){const o=_vs();if(S.idents.length){const D=idDiag();o.push({title:'PLANTES RELEVÉES SUR LE TERRAIN',tables:[{head:['Plante','Nom latin','Abondance','Indication','Statut'],rows:S.idents.map(x=>{const I=indOf(x.latin),V=invOf(x.latin);return[x.fr||x.latin,x.latin,{1:'rare',2:'fréquente',3:'dominante'}[x.abund],I?I[8]:'—',V?(V[2]==='env'?'envahissante':'invasive'+(V[2]==='ue'?' (UE)':'')):'—']}),w:[2800,2800,1600,5000,2638]}],
  bullets:[...(D.n?[`Diagnostic d’après ${D.n} plante(s) indicatrice(s) : ${[D.eau&&('sol '+WL[D.eau].toLowerCase()),D.ph&&('pH ≈ '+String(D.ph).replace('.',',')),D.N&&('fertilité '+D.N),D.tass&&'sol tassé'].filter(Boolean).join(', ')}.`]:[]),...S.idents.map(x=>[x,invOf(x.latin)]).filter(a=>a[1]).map(([x,I])=>`${x.fr||I[1]} : ${I[3]}${I[2]!=='env'?' '+DISP:''}`)]})}return o}}
fillMan();const _pa=PL.find(p=>p.l==="Pennisetum × advena 'Rubrum'");if(_pa)_pa.note='Achetez un cultivar stérile (Pennisetum × advena) : l’espèce Pennisetum setaceum est interdite dans l’Union européenne.';
renderIdents();

/* ================= v8 : rapport fidèle aux choix du projet ================= */
const wantOn=k=>S.want.has(k);
const massifOn=()=>!!S.bed||wantOn('massif');
function withWants(fn){const v=S.veg.touched,o=S.orch.touched;if(!wantOn('potager')&&!S.potagers.length)S.veg.touched=false;if(!wantOn('verger')&&!S.orchards.length)S.orch.touched=false;
  try{return fn()}finally{S.veg.touched=v;S.orch.touched=o}}
{const _v4s=v4Sections;v4Sections=function(){return withWants(()=>_v4s())}}
{const _v4p=v4Palettes;v4Palettes=function(R){return withWants(()=>_v4p(R))}}
{const _v4h=v4Sheets;v4Sheets=function(sh,buy){return withWants(()=>_v4h(sh,buy))}}
function withoutMassif(fn){if(massifOn())return fn();const c=S.lastCompo,l=S.lastLayout,s=S.lastSupplies,k=S.lastChecks;S.lastCompo=null;S.lastLayout=null;S.lastSupplies=null;S.lastChecks=[];
  const back=()=>{S.lastCompo=c;S.lastLayout=l;S.lastSupplies=s;S.lastChecks=k};let r;try{r=fn()}catch(e){back();throw e}
  if(r&&typeof r.then==='function')return r.finally(back);back();return r}
{const _cr=collectReport;collectReport=async function(){
  /* tout recalculer avant de lire : le rapport suit toujours les derniers choix */
  try{renderConds();renderCompo();if(typeof renderV4==='function')renderV4();if(typeof renderExtras==='function')renderExtras()}catch(e){}
  return withoutMassif(()=>_cr())}}
{const _xx=exportXlsx;exportXlsx=function(){try{renderCompo()}catch(e){}return withoutMassif(()=>_xx())}}
const selTxt=id=>{const el=$('#'+id);return el&&el.selectedOptions&&el.selectedOptions[0]?el.selectedOptions[0].textContent.trim():''};
function projectChoices(){const rows=[],r=S.lastCompo;
  const w=WANTS.filter(x=>wantOn(x[0])).map(x=>x[1]);rows.push(['Aménagements souhaités',w.length?w.join(', '):'—']);
  if(typeof plotArea==='function'){const a=plotArea();if(a)rows.push(['Parcelle',`${nf(a)} m² dessinés`+(S.parcel&&S.parcel.area?` (cadastre : ${nf(S.parcel.area)} m²)`:'')])}
  const ex=[];if(S.obs.length)ex.push(`${S.obs.length} bâtiment(s) ou arbre(s)`);const sp=S.shapes.filter(x=>x.kind==='obsPoly').length,sl=S.shapes.filter(x=>x.kind==='obsLine').length;if(sp)ex.push(`${sp} bâtiment(s) dessiné(s)`);if(sl)ex.push(`${sl} mur(s) ou haie(s) existant(s)`);
  if(S.paths&&S.paths.length)ex.push(`${S.paths.length} chemin(s) ou terrasse(s) : ${nf(S.paths.reduce((a,p)=>a+areaLL(p.pts),0))} m²`);rows.push(['Existant',ex.length?ex.join(' ; '):'rien de renseigné']);
  if(massifOn()&&r){rows.push(['Style du massif',r.st.l]);const d=selTxt('oDispo'),bl=selTxt('oBloom');if(d)rows.push(['Mode de plantation',d]);if(bl)rows.push(['Floraison',bl]);try{const h=harmTxt();if(h)rows.push(['Couleurs',h])}catch(e){}
    if(S.bed)rows.push(['Massif dessiné',`${nf(bedGeo().area)} m²`])}
  if(S.hedges.length)rows.push(['Haies',S.hedges.map((h,i)=>{const I=hedgeInfo(h);return `${nf(I.len,1)} m, ${I.T.l.toLowerCase()}`}).join(' ; ')]);
  if(S.boxes.length)rows.push(['Jardinières',`${S.boxes.length} emplacement(s)`]);
  if(S.potagers.length||wantOn('potager'))rows.push(['Potager',(VMODE[S.veg.mode]||'')+(S.potagers.length?` · ${nf(S.potagers.reduce((a,p)=>a+areaLL(p.pts),0))} m²`:'')]);
  if(S.orchards.length||wantOn('verger'))rows.push(['Verger',(OTYPE[S.orch.type]||'')+(S.orchards.length?` · ${nf(S.orchards.reduce((a,p)=>a+areaLL(p.pts),0))} m²`:'')]);
  if(S.fruits.length)rows.push(['Fruitiers isolés',`${S.fruits.length}`]);if(S.vines.length)rows.push(['Vignes',`${S.vines.length}`]);
  const la=lawnArea();if(la)rows.push(['Pelouse',`${nf(la)} m²`]);if(S.ponds.length)rows.push(['Pièces d’eau',`${S.ponds.length}`]);if(S.taluses.length)rows.push(['Talus',`${S.taluses.length}`]);
  if(S.fences&&S.fences.length)rows.push(['Clôtures',S.fences.map(f=>`${nf(lenLL(f.pts),1)} m, ${FM[f.model].l.toLowerCase()}, ${nf(f.h,2)} m`).join(' ; ')]);
  const o=S.ovr||{},oc=[];if(WL[o.eau])oc.push('humidité : '+WL[o.eau].toLowerCase());if(o.ph&&o.ph!=='auto')oc.push('pH ≈ '+String(o.ph).replace('.',','));if(EXL[o.expo])oc.push('exposition : '+EXL[o.expo].toLowerCase());if(oc.length)rows.push(['Conditions corrigées',oc.join(', ')]);
  return rows}
{const _vs8=v4Sections;v4Sections=function(){const o=_vs8();o.unshift({top:1,title:'VOTRE PROJET',intro:'Récapitulatif des choix faits dans Plantañ.ia au moment de la création du rapport.',tables:[{head:['Choix','Détail'],rows:projectChoices(),w:[3600,11238]}]});return o}}

/* appel IA commun (Claude) : relais ou clé du navigateur */
async function askClaude(system,content,max){if(AST.mode==='local')throw new Error('activez Claude dans les réglages de l’assistant (⚙)');
  const body={model:AST.model||'claude-sonnet-5-5',max_tokens:max||800,system,messages:[{role:'user',content}]};let r;
  if(AST.mode==='proxy'){if(!AST.proxy)throw new Error('adresse du serveur relais manquante');r=await fetch(AST.proxy,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}
  else r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':AST.key,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));
  const t=(j.content||[]).map(b=>b.text||'').join('');const m=t.match(/\{[\s\S]*\}/);if(!m)throw new Error('réponse illisible');return JSON.parse(m[0])}
const imgBlock=url=>({type:'image',source:{type:'base64',media_type:'image/jpeg',data:url.split(',')[1]}});
async function photoIn(input,max){const f=input.files&&input.files[0];input.value='';if(!f)return null;return shrink(f,max||1280)}

/* ================= v8 : dessin (parcelle, existant, déplacer, main levée, courbes + droites, dimensions) ================= */
S.plots=S.plots||[];S.paths=S.paths||[];S.fences=S.fences||[];S.drawFlags=[];
LISTS.push('plots','paths','fences');
EDIT_K.push(['plots',1],['paths',1],['fences',0]);
Object.assign(SHAPE_MODES,{plot:3,path:3,fence:2});
Object.assign(TC,{plot:'#3949ab',path:'#a1887f',fence:'#455a64'});
TOOLS.splice(1,0,['plot','Ma parcelle (contour)','area']);
{const i=TOOLS.findIndex(t=>t[0]==='obsLine');TOOLS.splice(i+1,0,['path','Chemin, allée, terrasse (existant)','area'])}
{const i=TOOLS.findIndex(t=>t[0]==='talus');TOOLS.splice(i+1,0,['fence','Clôture ou palissade (ligne)','line'])}
Object.assign(HINT,{plot:'Parcelle : cliquez les angles de votre terrain, ou utilisez la limite cadastrale ou les dimensions.',path:'Chemin ou terrasse existant : cliquez son contour, puis « Terminer ».',fence:'Clôture : cliquez le début, les angles et la fin, puis « Terminer ». Réglez le modèle dans l’onglet « Clôture ».'});
Object.assign(SHORT,{plot:'Ma parcelle',path:'Chemin, terrasse',fence:'Clôture'});
Object.assign(DRAWTXT,{plot:'Cliquez les angles de votre parcelle',path:'Cliquez le contour du chemin ou de la terrasse',fence:'Cliquez le début de la clôture, ses angles, puis la fin'});
TOOLWANT.fence='cloture';
function rebuildToolLists(){
  $('#tlist').innerHTML=TOOLS.map(t=>t[0]==='g'?`<li class="grp" role="presentation">${t[1]}</li>`:`<li role="presentation"><button type="button" role="option" data-v="${t[0]}">${swatch(t[0],t[2])}<span>${t[1]}</span></button></li>`).join('');
  $('#maplegend').innerHTML='<b class="lgt">Légende</b>'+TOOLS.filter(t=>t[0]!=='g'&&t[0]!=='measure').map(t=>`<span>${swatch(t[0],t[2])}${t[1].replace(/ \((forme|ligne|point|contour|existant)\)$/,'').replace(' (point d’étude)','')}</span>`).join('')+'<span><span class="sw line" style="background:#d7263d"></span>Limite cadastrale</span><span><span class="sw" style="background:#0b0f0c;opacity:.45"></span>Ombre portée</span>';
  const v=$('#tool').value;$('#tool').innerHTML=TOOLS.filter(t=>t[0]!=='g').map(t=>`<option value="${t[0]}">${t[1]}</option>`).join('');$('#tool').value=v||'site'}
rebuildToolLists();
const plotArea=()=>S.plots.reduce((a,p)=>a+areaLL(p.pts),0);

/* --- finir les nouvelles formes --- */
{const _fs=finishShape;finishShape=function(){const m=S.mode;
  if(m==='plot'||m==='path'||m==='fence'){const need=SHAPE_MODES[m];if(S.drawPts.length<need){$('#maphint').textContent=`Il faut au moins ${need} points.`;return}pushUndo();
    const pts=S.drawPts.slice(),id=++itemId;
    if(m==='plot')S.plots.push({id,pts});else if(m==='path')S.paths.push({id,pts,nat:'chemin'});else S.fences.push({id,pts,...FDEF()});
    initGeom(id);setMode('site');itemsChanged(false);drawHandles();
    if(m==='fence'){renderFences();showTab('cloture',false);toast('Clôture ajoutée : réglez le modèle dans l’onglet « Clôture »')}
    else toast(m==='plot'?`Parcelle : ${nf(plotArea())} m²`:'Chemin ou terrasse ajouté');
    if(typeof wizApply==='function')wizApply();return}
  return _fs()}}
{const _di=drawItems;drawItems=function(){_di();const tip=(l,t)=>l.bindTooltip(t,{permanent:true,direction:'center',className:'maplbl'});
  S.plots.forEach((p,i)=>tip(hook(L.polygon(p.pts,{color:TC.plot,weight:3,fill:false,dashArray:'10 6'}).addTo(itemsLayer),'plots',p.id,`Parcelle · ${nf(areaLL(p.pts))} m²`),`Parcelle · ${nf(areaLL(p.pts))} m²`));
  S.paths.forEach((p,i)=>{const lab=`${PATHN[p.nat]||'Chemin'} · ${nf(areaLL(p.pts))} m²`;tip(hook(L.polygon(p.pts,{color:TC.path,weight:1,fillColor:TC.path,fillOpacity:.55}).addTo(itemsLayer),'paths',p.id,lab),lab)});
  S.fences.forEach((f,i)=>{const lab=`Clôture ${i+1} · ${nf(lenLL(f.pts),1)} m · ${nf(f.h,2)} m`;tip(hook(L.polyline(f.pts,{color:FCOL[f.col]?FCOL[f.col][1]:TC.fence,weight:5,dashArray:'1 7',lineCap:'square'}).addTo(itemsLayer),'fences',f.id,lab),lab)})}}
const PATHN={chemin:'Chemin ou allée',terrasse:'Terrasse',parking:'Parking ou entrée',gravier:'Zone gravillonnée'};
{const _ril=renderItemsList;renderItemsList=function(){_ril();const el=$('#itemsList');if(!el)return;let ul=el.querySelector('ul');const extra=[];
  const li=(kind,id,c,lab,cls)=>`<li><span class="sw ${cls||''}" style="background:${c}"></span><span>${esc(lab)}</span><button type="button" data-del="${kind}" data-id="${id}">Supprimer</button></li>`;
  S.plots.forEach(p=>extra.push(li('plots',p.id,TC.plot,`Parcelle · ${nf(areaLL(p.pts))} m²`)));S.paths.forEach(p=>extra.push(li('paths',p.id,TC.path,`${PATHN[p.nat]} · ${nf(areaLL(p.pts))} m²`)));
  S.fences.forEach((f,i)=>extra.push(li('fences',f.id,TC.fence,`Clôture ${i+1} · ${nf(lenLL(f.pts),1)} m`,'line')));
  if(!extra.length)return;if(!ul){el.innerHTML=`<ul></ul><button type="button" id="delAll">Tout effacer sur la carte</button>`;ul=el.querySelector('ul')}ul.insertAdjacentHTML('afterbegin',extra.join(''));$('#itemsCount').textContent=el.querySelectorAll('li').length}}
{const _cd=clearDrawings;clearDrawings=function(){S.plots=[];S.paths=[];S.fences=[];_cd();if(typeof renderFences==='function')renderFences()}}
function useCadastre(){if(!S.parcel||!S.parcel.ring){toast('Limite cadastrale pas encore chargée : placez le point d’étude sur votre terrain.');return}pushUndo();
  const pts=S.parcel.ring.map(p=>[p[1],p[0]]);if(pts.length>3&&pts[0][0]===pts[pts.length-1][0]&&pts[0][1]===pts[pts.length-1][1])pts.pop();
  S.plots=[{id:++itemId,pts,raw:pts.map(p=>p.slice()),cad:1}];itemsChanged(false);toast(`Parcelle cadastrale reprise : ${nf(plotArea())} m²`);if(typeof wizApply==='function')wizApply()}

/* --- courbes et droites dans un même tracé --- */
function mixPath(raw,segc,closed,n){n=n||8;const m=raw.length,segs=closed?m:m-1,out=[],seg=[],P=i=>raw[(i+m)%m],cv=i=>closed?!!segc[(i+segs)%segs]:(i>=0&&i<segs&&!!segc[i]);
  for(let i=0;i<segs;i++){const p1=P(i),p2=P(i+1);
    if(!cv(i)){out.push(p1.slice());seg.push(i);continue}
    const p0=cv(i-1)?P(i-1):[2*p1[0]-p2[0],2*p1[1]-p2[1]],p3=cv(i+1)?P(i+2):[2*p2[0]-p1[0],2*p2[1]-p1[1]];
    for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0,1].map(d=>0.5*(2*p1[d]+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3)));seg.push(i)}}
  if(!closed){out.push(raw[m-1].slice());seg.push(segs-1)}return{pts:out,seg}}
const segCount=(it,closed)=>closed?it.raw.length:it.raw.length-1;
function fixSegc(it,closed){const n=segCount(it,closed);it.segc=Array.from({length:n},(_,i)=>it.segc&&it.segc[i]?1:0)}
{const _rg=regeom;regeom=function(it,closed){if(it.segc&&!it.smooth&&it.raw){fixSegc(it,closed);it.pts=mixPath(it.raw,it.segc,closed).pts;return}_rg(it,closed)}}
{const _br=bedRegeom;bedRegeom=function(){_br();const b=S.bed;if(b&&b.segc&&!b.smooth&&b.raw&&b.raw.length>=3){fixSegc(b,true);const M=mixPath(b.raw,b.segc,true);b.ll=M.pts;b.seg2raw=M.seg;b.edges=b.ll.map((_,j)=>b.rawEdges[M.seg[j]]||0)}}}
function segFlags(closed){const f=S.drawFlags.slice(0,S.drawPts.length),segs=[];for(let i=1;i<f.length;i++)segs.push(f[i]?1:0);if(closed)segs.push(S.curve?1:0);return segs}
const mixed=a=>a.some(Boolean)&&!a.every(Boolean);
{const _ad8=addDrawPt;addDrawPt=function(lat,lng){if(Date.now()-(S._fhEnd||0)<400)return;const n=S.drawPts.length;_ad8(lat,lng);if(S.drawPts.length>n){S.drawFlags.length=n;S.drawFlags.push(S.curve?1:0);drawTemp()}}}
{const _sm8=setMode;setMode=function(m){S.drawFlags=[];_sm8(m);if(typeof syncFree==='function')syncFree()}}
{const _ig=initGeom;initGeom=function(id){const [k,it]=findItem(id);const cl=it?closedOf(k,it):false,sf=segFlags(cl);_ig(id);
  if(it&&mixed(sf)){it.smooth=false;it.segc=sf;regeom(it,cl);if(k==='taluses')estimateTalus(it)}}}
{const _fb=finishBed;finishBed=function(){const sf=segFlags(true),n=S.drawPts.length;_fb();if(S.bed&&n>=3&&mixed(sf)){S.bed.smooth=false;S.bed.segc=sf;bedRegeom();drawBed();renderCompo()}}}
/* aperçu du tracé en cours (droites, courbes et main levée) */
{const _dt8=drawTemp;drawTemp=function(){const pts=S.drawPts;S.drawPts=[];try{_dt8()}finally{S.drawPts=pts}
  tempLayer.clearLayers();const n=pts.length;if(!n){if(typeof updateDrawUI==='function')updateDrawUI();return}
  const cl=SHAPE_MODES[S.mode]===3,f=S.drawFlags.slice(0,n),segs=[];for(let i=1;i<n;i++)segs.push(f[i]?1:0);const closed=cl&&n>2;if(closed)segs.push(S.curve?1:0);
  const P=n>=2?mixPath(pts,segs,closed).pts:pts,c=TC[S.mode]||'#e3a018';
  L.polyline(P.concat(closed?[P[0]]:[]),{color:c,weight:3,dashArray:'6 6',interactive:false}).addTo(tempLayer);
  pts.forEach((p,i)=>{if(f[i]&&i&&f[i-1]&&i<n-1&&(S._denseIdx||0)>i)return;L.circleMarker(p,{radius:f[i]?4:5,color:'#fff',weight:2,fillColor:c,fillOpacity:1,interactive:false}).addTo(tempLayer)});
  if(n>=3&&cl){const mk=L.circleMarker(pts[0],{radius:10,color:'#fff',weight:3,fillColor:c,fillOpacity:.9,interactive:false}).addTo(tempLayer);if(mk.bindTooltip)mk.bindTooltip('Cliquez ici pour fermer',{direction:'top'})}
  if(typeof updateDrawUI==='function')updateDrawUI()}}
$('#curveMode').addEventListener('change',()=>toast(S.curve?'Les prochains points seront reliés en courbe.':'Les prochains points seront reliés en ligne droite.'));

/* --- main levée --- */
S.free=false;
function rdp(pts,tol){if(pts.length<3)return pts;const m=pts.map(p=>[p[1]*111320*Math.cos(p[0]*R),p[0]*111320]);
  const keep=new Uint8Array(pts.length);keep[0]=keep[pts.length-1]=1;const st=[[0,pts.length-1]];
  while(st.length){const [a,b]=st.pop();let dmax=0,ix=-1;const [x1,y1]=m[a],[x2,y2]=m[b],L2=(x2-x1)**2+(y2-y1)**2||1e-9;
    for(let i=a+1;i<b;i++){const t=Math.max(0,Math.min(1,((m[i][0]-x1)*(x2-x1)+(m[i][1]-y1)*(y2-y1))/L2)),d=Math.hypot(m[i][0]-x1-t*(x2-x1),m[i][1]-y1-t*(y2-y1));if(d>dmax){dmax=d;ix=i}}
    if(dmax>tol&&ix>0){keep[ix]=1;st.push([a,ix],[ix,b])}}
  return pts.filter((_,i)=>keep[i])}
function syncFree(){const on=S.free&&(S.mode in SHAPE_MODES);if(map.dragging)on?map.dragging.disable():map.dragging.enable();$('#map').classList.toggle('freehand',on);const c=$('#freeMode');if(c)c.checked=S.free}
{const cont=(map.getContainer&&map.getContainer())||$('#map');let stroke=null;
  const toLL=e=>{if(map.mouseEventToLatLng){const p=map.mouseEventToLatLng(e);return[p.lat,p.lng]}return null};
  cont.addEventListener('pointerdown',e=>{if(!S.free||!(S.mode in SHAPE_MODES)||e.button>0||e.target.closest('.maptools,.drawbar,.leaflet-control'))return;const p=toLL(e);if(!p)return;
    stroke=[p];try{cont.setPointerCapture(e.pointerId)}catch(err){}e.preventDefault()});
  cont.addEventListener('pointermove',e=>{if(!stroke)return;const p=toLL(e);if(!p)return;const q=stroke[stroke.length-1];if(Math.hypot((p[0]-q[0])*111320,(p[1]-q[1])*111320*Math.cos(p[0]*R))<0.15)return;stroke.push(p);
    tempLayer.clearLayers&&L.polyline((S.drawPts.length?[S.drawPts[S.drawPts.length-1]]:[]).concat(stroke),{color:TC[S.mode]||'#e3a018',weight:3,interactive:false}).addTo(tempLayer)});
  const end=()=>{if(!stroke)return;const s=stroke;stroke=null;if(s.length<2){drawTemp();return}freeStroke(s)};
  cont.addEventListener('pointerup',end);cont.addEventListener('pointercancel',end)}
function freeStroke(s){const simp=rdp(s,0.35);let pts=simp;if(snapPt&&S.snap){pts=pts.slice();pts[0]=snapPt(pts[0][0],pts[0][1]);pts[pts.length-1]=snapPt(...pts[pts.length-1])}
  const n0=S.drawPts.length;pts.forEach((p,i)=>{if(i===0&&n0&&Math.hypot((p[0]-S.drawPts[n0-1][0])*111320,(p[1]-S.drawPts[n0-1][1])*111320*Math.cos(p[0]*R))<0.3)return;S.drawPts.push(p);S.drawFlags.length=S.drawPts.length-1;S.drawFlags.push(1)});
  S._fhEnd=Date.now();
  /* forme fermée : un trait qui revient à son point de départ ferme la forme */
  const cl=SHAPE_MODES[S.mode]===3,f=S.drawPts[0],l=S.drawPts[S.drawPts.length-1];
  if(cl&&S.drawPts.length>=4&&Math.hypot((f[0]-l[0])*111320,(f[1]-l[1])*111320*Math.cos(f[0]*R))<1.5){S.drawPts.pop();S.drawFlags.length=S.drawPts.length;const c=S.curve;S.curve=true;finishShape();S.curve=c;return}
  drawTemp()}

/* --- formes par dimensions --- */
function ptsFromDims(kind,a,b,rot,center){const c=center,lat0=c[0],k=111320,kc=k*Math.cos(lat0*R),r=(rot||0)*R;
  const tr=(x,y)=>{const X=x*Math.cos(r)-y*Math.sin(r),Y=x*Math.sin(r)+y*Math.cos(r);return[lat0+Y/k,c[1]+X/kc]};
  if(kind==='rect')return{pts:[[-a/2,-b/2],[a/2,-b/2],[a/2,b/2],[-a/2,b/2]].map(p=>tr(...p)),curve:0};
  if(kind==='circle'){const N=a>12?16:10;return{pts:Array.from({length:N},(_,i)=>tr(a/2*Math.cos(2*Math.PI*i/N),(b||a)/2*Math.sin(2*Math.PI*i/N))),curve:1}}
  if(kind==='line')return{pts:[tr(-a/2,0),tr(a/2,0)],curve:0};
  if(kind==='lshape')return{pts:[tr(0,0),tr(a,0),tr(a,b)],curve:0};return null}
function dimsCenter(){const w=$('#dimWhere')?$('#dimWhere').value:'map';if(w==='site'&&S.lat!=null)return[S.lat,S.lon];if(map.getCenter){const c=map.getCenter();return[c.lat,c.lng]}return S.lat!=null?[S.lat,S.lon]:null}
function dimsForm(){const area=SHAPE_MODES[S.mode]===3;return `<div class="dimf" id="dimForm"><label>Forme<select id="dimKind">${area?'<option value="rect">Rectangle</option><option value="circle">Cercle ou ovale</option>':'<option value="line">Ligne droite</option><option value="lshape">En L (deux côtés)</option>'}</select></label>
  <label><span id="dimAl">${area?'Longueur':'Longueur'}</span> (m)<input type="number" id="dimA" min="0.2" max="2000" step="0.1" value="${area?6:10}"></label>
  <label><span id="dimBl">${area?'Largeur':'2e côté'}</span> (m)<input type="number" id="dimB" min="0" max="2000" step="0.1" value="${area?3:5}"></label>
  <label>Rotation (°)<input type="number" id="dimR" min="-180" max="180" step="5" value="0"></label>
  <label>Placer<select id="dimWhere"><option value="map">au centre de la carte</option><option value="site">au point d’étude</option></select></label>
  <button type="button" class="pri" id="dimGo">Créer la forme</button><small>Vous pourrez ensuite la déplacer avec « Modifier les points ».</small></div>`}
$('#drawBar').addEventListener('click',e=>{
  if(e.target.id==='dimOpen'){S._dimOpen=!S._dimOpen;updateDrawUI();return}
  if(e.target.id==='freeBtn'){S.free=!S.free;syncFree();updateDrawUI();toast(S.free?'Main levée : maintenez le clic et tracez. Relâchez pour finir le trait ; vous pouvez enchaîner avec des clics pour des lignes droites.':'Main levée désactivée');return}
  if(e.target.id==='dimGo'){const kind=$('#dimKind').value,a=parseFloat($('#dimA').value),b=parseFloat($('#dimB').value)||0,rot=parseFloat($('#dimR').value)||0,c=dimsCenter();
    if(!(a>0)||!c){toast('Indiquez une longueur.');return}const D=ptsFromDims(kind,a,kind==='circle'?(b||a):b,rot,c);if(!D)return;
    S.drawPts=D.pts;S.drawFlags=D.pts.map(()=>D.curve);const cv=S.curve;S.curve=!!D.curve;S._dimOpen=false;finishShape();S.curve=cv;$('#curveMode').checked=cv}});
$('#drawBar').addEventListener('change',e=>{if(e.target.id==='dimKind'){const k=e.target.value;$('#dimBl').textContent=k==='circle'?'Largeur (ovale)':k==='rect'?'Largeur':'2e côté'}});
{const _ud=updateDrawUI;updateDrawUI=function(){_ud();const bar=$('#drawBar');if(!bar||bar.hidden||!(S.mode in SHAPE_MODES)||S.mode==='measure')return;const b=bar.querySelector('.dbtns');if(!b)return;
  b.insertAdjacentHTML('afterbegin',`<button type="button" id="freeBtn" aria-pressed="${S.free}" title="Tracer en maintenant le clic">✍ Main levée</button><button type="button" id="dimOpen" aria-pressed="${!!S._dimOpen}">📐 Dimensions</button>`);
  if(S._dimOpen)bar.insertAdjacentHTML('beforeend',dimsForm()+(S.drawPts.length?'<small>La forme créée par dimensions remplace les points déjà cliqués.</small>':''));
  const sm=bar.querySelector('small');if(sm)sm.textContent+=` Courbes : cochez « Tracer en courbes » avant de cliquer les points à arrondir ; décochez pour revenir aux lignes droites.`}}

/* --- déplacer une forme entière, basculer un côté courbe/droit --- */
const cen=pts=>pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length],[0,0]);
{const _dh=drawHandles;drawHandles=function(){_dh();if(!S.editing)return;
  const mv=(ll,onEnd)=>{const mk=L.marker(ll,{draggable:true,zIndexOffset:1200,title:'Déplacer toute la forme',icon:L.divIcon({className:'',html:'<span class="vh mv">✥</span>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(editLayer);
    mk.on('dragend',()=>{const p=mk.getLatLng();pushUndo();onEnd([p.lat-ll[0],p.lng-ll[1]])});return mk};
  const sh=(raw,d)=>raw.forEach(p=>{p[0]+=d[0];p[1]+=d[1]});
  const tg=(raw,closed,segc,set)=>{const segs=closed?raw.length:raw.length-1;for(let k=0;k<segs;k++){const a=raw[k],b=raw[(k+1)%raw.length],p=[a[0]+(b[0]-a[0])*.25,a[1]+(b[1]-a[1])*.25],on=segc[k];
    const mk=L.marker(p,{zIndexOffset:1100,title:on?'Côté en courbe : cliquer pour le rendre droit':'Côté droit : cliquer pour l’arrondir',icon:L.divIcon({className:'',html:`<span class="vh cv">${on?'⌒':'—'}</span>`,iconSize:[20,20],iconAnchor:[10,10]})}).addTo(editLayer);
    mk.on('click',e=>{if(e&&L.DomEvent.stopPropagation)L.DomEvent.stopPropagation(e);pushUndo();set(k)})}};
  if(S.bed&&S.bed.raw){const b=S.bed;mv(cen(b.raw),d=>{sh(b.raw,d);bedRegeom();drawBed();renderCompo();drawHandles()});
    const sc=b.smooth?b.raw.map(()=>1):(b.segc||b.raw.map(()=>0));tg(b.raw,true,sc,k=>{const s=sc.slice();s[k]=s[k]?0:1;b.smooth=false;b.segc=s;bedRegeom();drawBed();renderCompo();drawHandles()})}
  EDIT_K.forEach(([k])=>(S[k]||[]).forEach(it=>{if(!it.raw)return;const cl=closedOf(k,it);
    mv(cen(it.raw),d=>{sh(it.raw,d);regeom(it,cl);if(k==='taluses')estimateTalus(it);itemsChanged(k==='shapes');drawHandles();if(k==='fences')renderFences()});
    const segs=segCount(it,cl),sc=it.smooth?Array(segs).fill(1):(it.segc||Array(segs).fill(0));if(it.raw.length<=24)tg(it.raw,cl,sc,j=>{const s=sc.slice();s[j]=s[j]?0:1;it.smooth=false;it.segc=s;regeom(it,cl);itemsChanged(k==='shapes');drawHandles()})}));
  S.fruits.forEach(()=>{});}}
{const _se=setEditing;setEditing=function(on){_se(on);if(on)$('#maphint').textContent='Modification : ✥ déplace toute la forme ; faites glisser un point pour le déplacer ; glissez un petit point intermédiaire pour en ajouter un ; double-cliquez un point pour le supprimer ; cliquez « ⌒ / — » sur un côté pour le passer en courbe ou en droite.'}}
{const _ip=itemPopup;itemPopup=function(ll,kind,id,label){if(kind==='obs'||kind==='shapes'){obsPopup(ll,kind,id);return}_ip(ll,kind,id,label);
  if(!L.popup||kind==='fruits')return;setTimeout(()=>{const box=document.querySelector('.leaflet-popup-content div');if(box&&!box.querySelector('.popmv')){box.insertAdjacentHTML('beforeend',' <button type="button" class="popdel popmv">Déplacer ou modifier</button>');box.querySelector('.popmv').addEventListener('click',()=>{map.closePopup();setEditing(true)})}},0)}}

/* --- étape 1 : parcelle et existant --- */
const EXIST_TOOLS=['site','plot','obs','obsPoly','obsLine','path','measure','erase'];
{const _rmt=renderMapTools;renderMapTools=function(){_rmt();if(!(WZ.on&&WZ.step===1))return;document.querySelectorAll('#mapTools [data-mt]').forEach(b=>{if(!EXIST_TOOLS.includes(b.dataset.mt))b.remove()});
  if(!document.querySelector('#mapTools [data-mt=plot]'))$('#mapTools').insertAdjacentHTML('beforeend',['plot','path'].map(t=>`<button type="button" data-mt="${t}" title="${esc(SHORT[t])}">${swatch(t,'area')}<span>${esc(SHORT[t])}</span></button>`).join(''))}}
{const _rmt2=renderMapTools;renderMapTools=function(){_rmt2();if(WZ.on&&WZ.step!==1)document.querySelectorAll('#mapTools [data-mt=plot],#mapTools [data-mt=path]').forEach(b=>b.remove());
  if(WZ.on&&(WZ.step!==1)&&!wantOn('cloture'))document.querySelectorAll('#mapTools [data-mt=fence]').forEach(b=>b.remove())}}
function step1List(){const ok=x=>x?'ok':'';const nObs=S.obs.length+S.shapes.length;
  return `<ul class="todo"><li class="${ok(S.lat!=null)}"><span class="sw pt" style="background:${TC.site}"></span>Point d’étude placé${S.lat!=null?' : '+esc(PLACE.commune||''):''}</li>
  <li class="${ok(S.plots.length)}"><span class="sw" style="background:${TC.plot}"></span>Ma parcelle${S.plots.length?` : ${nf(plotArea())} m²`:''} <button type="button" data-drawtool="plot">${S.plots.length?'Redessiner':'Dessiner'}</button> <button type="button" data-cad="1"${S.parcel?'':' disabled'}>Limite cadastrale</button> <button type="button" data-dims="plot">Dimensions</button></li>
  <li class="${ok(nObs)}"><span class="sw pt" style="background:${TC.obs}"></span>Bâtiments et arbres existants${nObs?` : ${nObs}`:''} <button type="button" data-drawtool="obs">Point</button> <button type="button" data-drawtool="obsPoly">Forme</button> <button type="button" data-drawtool="obsLine">Mur ou haie</button></li>
  <li class="${ok(S.paths.length)}"><span class="sw" style="background:${TC.path}"></span>Chemins, allées, terrasses${S.paths.length?` : ${S.paths.length}`:''} <button type="button" data-drawtool="path">Dessiner</button></li></ul>
  <span>Tout est facultatif : la parcelle et l’existant servent au calcul des ombres, des surfaces et au rapport. Vous choisirez ce que vous voulez aménager à l’étape suivante.</span>`}
{const _wa8=wizApply;wizApply=function(){_wa8();if(WZ.on&&WZ.step===1){const i=$('#stepIntro .in');if(i&&!i.querySelector('.todo')){const more=i.querySelector('.more');(more||i.lastChild).insertAdjacentHTML(more?'beforebegin':'afterend',step1List())}}}}
$('#stepIntro').addEventListener('click',e=>{if(e.target.dataset.cad){useCadastre();return}const d=e.target.dataset.dims;if(d){setMode(d);S._dimOpen=true;updateDrawUI();$('#carte').scrollIntoView({behavior:'smooth'})}});
{const _sr8=synRows;synRows=function(){const r=_sr8(),a=plotArea();if(a){const bat=S.shapes.filter(x=>x.kind==='obsPoly').reduce((s,x)=>s+areaLL(x.pts),0),pv=S.paths.reduce((s,x)=>s+areaLL(x.pts),0),free=Math.max(0,a-bat-pv);
  r.unshift(['Parcelle','ok',`${nf(a)} m² dessinés${bat?`, dont ${nf(bat)} m² bâtis`:''}${pv?`, ${nf(pv)} m² de chemins et terrasses`:''} : environ ${nf(free)} m² disponibles pour planter (${nf(100*free/a)} %).`])}return r}}
{const _sd8=snapDrawings;snapDrawings=function(){const d=_sd8();d.obs=(d.obs||[]).map((o,i)=>({...o,form:S.obs[i]&&S.obs[i].form||null}));if(S.bed&&S.bed.segc)d.bed.segc=S.bed.segc.slice();return d}}
{const _rd8=restoreDrawings;restoreDrawings=function(d){S.plots=[];S.paths=[];S.fences=[];_rd8(d);(d.obs||[]).forEach((o,i)=>{if(o.form&&S.obs[i])S.obs[i].form=o.form});if(d.bed&&d.bed.segc&&S.bed){S.bed.segc=d.bed.segc;S.bed.smooth=false;bedRegeom();drawBed()}drawItems();if(typeof renderFences==='function')renderFences()}}

/* --- obstacles : hauteur, forme, envergure, rectangle exact --- */
const OFORM={ronde:['Ronde',0.7],colonne:['Colonnaire (fastigiée)',0.3],conique:['Conique',0.45],etalee:['Étalée',1.0],pleureur:['Pleureuse',0.8]};
function obsPopup(ll,kind,id){if(!L.popup||!ll)return;const d=document.createElement('div');d.className='obpop';
  if(kind==='obs'){const o=S.obs.find(x=>x.id==id);if(!o)return;const tree=o.type==='caduc'||o.type==='pers';
    d.innerHTML=`<b>${esc(o.name||OBT[o.type].l)}</b><label>Nom<input data-k="name" value="${esc(o.name||'')}" placeholder="${esc(OBT[o.type].l)}"></label><label>Type<select data-k="type">${Object.entries(OBT).map(([k,v])=>`<option value="${k}"${k===o.type?' selected':''}>${v.l}</option>`).join('')}</select></label>
     <label>Hauteur (m)<input type="number" data-k="h" value="${o.h}" min="0.5" max="150" step="0.5"></label><label>${tree?'Envergure':'Largeur'} (m)<input type="number" data-k="w" value="${o.w}" min="0.5" max="150" step="0.5"></label>
     ${tree?`<label>Forme<select data-k="form"><option value="">—</option>${Object.entries(OFORM).map(([k,v])=>`<option value="${k}"${k===o.form?' selected':''}>${v[0]}</option>`).join('')}</select></label>`:''}
     ${o.type==='bat'?`<details><summary>Forme exacte du bâtiment</summary><label>Longueur (m)<input type="number" data-k="L" value="${o.w}" min="1" step="0.5"></label><label>Largeur (m)<input type="number" data-k="W" value="${Math.round(o.w*0.7)}" min="1" step="0.5"></label><label>Rotation (°)<input type="number" data-k="rot" value="0" step="5"></label><button type="button" data-a="rect">Remplacer par un rectangle</button></details>`:''}
     <div class="chips"><button type="button" data-a="photo">📷 Mesurer sur photo</button><button type="button" class="popx" data-a="del">Supprimer</button></div>`;
    d.addEventListener('change',e=>{const k=e.target.dataset.k;if(!k||['L','W','rot'].includes(k))return;pushUndo();if(k==='name'){o.name=e.target.value.trim().slice(0,40);renderObs();return}
      if(k==='type'){o.type=e.target.value;o.h=OBT[o.type].h;o.w=OBT[o.type].w;o.form=null}else if(k==='form'){o.form=e.target.value||null;if(o.form)o.w=Math.max(0.5,Math.round(o.h*OFORM[o.form][1]*2)/2)}else{const v=parseFloat(e.target.value);if(v>0)o[k]=v}
      styleObs(o);renderObs();sunUpdate();map.closePopup();obsPopup([o.lat,o.lng],'obs',o.id)});
    d.addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;
      if(a==='del'){map.closePopup();delItem('obs',o.id)}
      if(a==='photo'){map.closePopup();openMeasure('obs:'+o.id)}
      if(a==='rect'){const g=k=>parseFloat(d.querySelector(`[data-k=${k}]`).value)||0,D=ptsFromDims('rect',g('L'),g('W'),g('rot'),[o.lat,o.lng]);pushUndo();
        S.shapes.push({id:++itemId,kind:'obsPoly',pts:D.pts,raw:D.pts.map(p=>p.slice()),name:'Bâtiment '+(S.shapes.filter(x=>x.kind==='obsPoly').length+1),h:o.h,nat:'bat'});
        map.removeLayer(o.circle);map.removeLayer(o.marker);S.obs=S.obs.filter(x=>x!==o);map.closePopup();itemsChanged(true);renderObs();toast('Bâtiment remplacé par sa forme exacte')}})}
  else{const sh=S.shapes.find(x=>x.id==id);if(!sh)return;
    d.innerHTML=`<b>${esc(sh.name)}</b><label>Nom<input data-k="name" value="${esc(sh.name)}"></label><label>Nature<select data-k="nat">${Object.entries(SHNAT).map(([k,v])=>`<option value="${k}"${k===sh.nat?' selected':''}>${v}</option>`).join('')}</select></label>
     <label>Hauteur (m)<input type="number" data-k="h" value="${sh.h}" min="0.3" max="150" step="0.1"></label>
     <label>Agrandir ou réduire (%)<input type="number" data-k="scl" value="100" min="10" max="500" step="5"></label><label>Tourner (°)<input type="number" data-k="rotd" value="0" min="-180" max="180" step="5"></label>
     <div class="chips"><button type="button" data-a="edit">Modifier la forme</button><button type="button" data-a="photo">📷 Mesurer sur photo</button><button type="button" class="popx" data-a="del">Supprimer</button></div>`;
    d.addEventListener('change',e=>{const k=e.target.dataset.k;if(!k)return;pushUndo();if(k==='h'){const v=parseFloat(e.target.value);if(v>0)sh.h=v}else if(k==='name')sh.name=e.target.value.slice(0,40);else if(k==='scl'){const f=parseFloat(e.target.value)/100;if(f>0&&f!==1)sclItem('shapes',sh,f);e.target.value=100}else if(k==='rotd'){const a=parseFloat(e.target.value);if(a)rotItem('shapes',sh,-a);e.target.value=0}else sh.nat=e.target.value;itemsChanged(true);renderObs()});
    d.addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;map.closePopup();if(a==='del')delItem('shapes',sh.id);if(a==='edit')setEditing(true);if(a==='photo')openMeasure('shapes:'+sh.id)})}
  L.popup().setLatLng(ll).setContent(d).openOn(map)}
{const _ro=renderObs;renderObs=function(){_ro();document.querySelectorAll('#obslist .ob[data-id]').forEach(row=>{const o=S.obs.find(x=>x.id==row.dataset.id);if(!o||!(o.type==='caduc'||o.type==='pers'))return;
  row.querySelector('.rel').insertAdjacentHTML('beforebegin',`<label>Forme <select data-f="form" aria-label="Forme du houppier"><option value="">—</option>${Object.entries(OFORM).map(([k,v])=>`<option value="${k}"${k===o.form?' selected':''}>${v[0]}</option>`).join('')}</select></label>`)});
  document.querySelectorAll('#obslist .ob').forEach(row=>{if(!row.querySelector('[data-f=photo]'))row.querySelector('[data-f=del]').insertAdjacentHTML('beforebegin','<button type="button" data-f="photo" title="Mesurer sur photo">📷</button>')})}}
$('#obslist').addEventListener('change',e=>{if(e.target.dataset.f!=='form')return;const row=e.target.closest('.ob'),o=S.obs.find(x=>x.id==row.dataset.id);if(!o)return;o.form=e.target.value||null;if(o.form)o.w=Math.max(0.5,Math.round(o.h*OFORM[o.form][1]*2)/2);styleObs(o);renderObs();sunUpdate()},true);
$('#obslist').addEventListener('click',e=>{if(e.target.dataset.f!=='photo')return;const row=e.target.closest('.ob');openMeasure(row.dataset.sid?'shapes:'+row.dataset.sid:'obs:'+row.dataset.id)});
{const _ao=addObstacle;addObstacle=function(lat,lng){_ao(lat,lng);const P=S.pendObs,o=S.obs[S.obs.length-1];if(P&&o){Object.assign(o,P);styleObs(o);S.pendObs=null;renderObs();sunUpdate();toast(`Obstacle placé : ${nf(o.h,1)} m de haut, ${nf(o.w,1)} m de large`)}}}

/* ================= v8 : clôtures (modèles, législation, métré) ================= */
/* sp : écartement des poteaux (m) ; open : ajourée (au sens des règles d'urbanisme : fils ou treillis) ; sec : niveau de sécurité max ; hs : hauteurs courantes */
const FM={
 rigide:{l:'Panneaux rigides (treillis soudé)',sp:2.5,open:1,wire:1,sec:3,hs:[0.63,0.83,1.03,1.23,1.53,1.73,1.93,2.03],cols:['vert','anthracite','noir','galva'],unit:'panneau de 2,50 m'},
 souple:{l:'Grillage souple en rouleau',sp:2.5,open:1,wire:1,sec:1,hs:[0.8,1.0,1.2,1.5,1.75,2.0],cols:['vert','galva','anthracite'],unit:'rouleau de 25 m'},
 fils:{l:'Piquets et fils (clôture rurale)',sp:3,open:1,wire:1,sec:1,hs:[0.8,1.0,1.2,1.5],cols:['galva','bois'],unit:''},
 ganivelle:{l:'Ganivelle en châtaignier',sp:2,open:1,wire:0,sec:1,hs:[0.8,1.0,1.2,1.5],cols:['bois'],unit:'rouleau de 5 m'},
 lisses:{l:'Poteaux et lisses en bois (une ou deux lisses)',sp:2.5,open:1,wire:0,rails:1,sec:1,hs:[0.8,1.0,1.2],cols:['bois','boisT'],unit:''},
 bois:{l:'Palissade en bois (panneaux pleins ou claire-voie)',sp:1.8,open:0,wire:0,sec:2,hs:[0.9,1.2,1.5,1.8],cols:['bois','boisT','anthracite'],unit:'panneau de 1,80 m'},
 composite:{l:'Lames composite sur poteaux aluminium',sp:1.8,open:0,wire:0,sec:2,hs:[0.9,1.2,1.5,1.8],cols:['anthracite','gris','bois'],unit:'lame de 1,80 m'},
 metal:{l:'Barreaudage métallique (acier ou aluminium)',sp:2,open:0,wire:0,sec:3,hs:[1.0,1.2,1.5,1.8,2.0],cols:['anthracite','noir','vert','blanc'],unit:'panneau de 2,00 m'},
 beton:{l:'Plaques et poteaux en béton',sp:2,open:0,wire:0,sec:3,hs:[0.5,1.0,1.5,2.0],cols:['gris','boisT'],unit:'plaque de 2,00 × 0,50 m'},
 gabion:{l:'Gabions (cages remplies de pierres)',sp:1,open:0,wire:0,sec:2,hs:[0.5,1.0,1.5,2.0],cols:['galva'],unit:'module de 1 m'}};
const FCOL={vert:['Vert (RAL 6005)','#2f5d3a'],anthracite:['Anthracite (RAL 7016)','#383e42'],noir:['Noir (RAL 9005)','#111'],gris:['Gris (RAL 7030)','#8b8b84'],blanc:['Blanc (RAL 9010)','#f1eee4'],galva:['Galvanisé','#a7adb0'],bois:['Bois naturel','#b88a56'],boisT:['Bois teinté ou lasuré','#6d4c33']};
const FSEC={1:['Délimitation','marque la limite, retient un chien de taille moyenne'],2:['Standard','empêche le passage, protège l’intimité'],3:['Renforcée','dissuade l’escalade et l’intrusion']};
const FFORM={droite:'Droite',cintree:'Cintrée (arrondie vers le haut)',concave:'Concave (creusée au centre)',claire:'Claire-voie (lames espacées)',pleine:'Pleine (occultante)'};
const FPOS={arriere:'À l’arrière ou non visible de la rue',cote:'Sur le côté',avant:'À l’avant (visible depuis la rue)'};
const FDEF=()=>({model:'rigide',h:1.53,sec:2,col:'anthracite',form:'droite',pos:'arriere',limit:'propre',gates:0,gate:1,portal:0,soub:0,fix:'beton'});
S.fenceDefaults=null;
function regionKey(){const r=(PLACE.region||'').toLowerCase();if(/wallon|walloni/.test(r))return'wal';if(/vlaander|flandr|flander/.test(r))return'vla';if(/brux|brus/.test(r))return'bxl';return''}
function fenceLaw(f){const M=FM[f.model],reg=regionKey(),out=[];let st='ok';const h=f.h,hidden=f.pos==='arriere';
  if(reg==='wal'){const typeOk=(M.wire&&h<=2)||(M.rails&&h<=2)||(f.model==='ganivelle'&&h<=2)||((f.model==='bois'||f.model==='composite')&&h<=1)||(f.model==='gabion'&&h<=1)||(f.model==='beton'&&h<=1&&f.soub);
    if(h>2){st='ko';out.push('Plus de 2 m de haut : permis d’urbanisme nécessaire (CoDT, art. R.IV.1-1, rubrique M).')}
    else if(typeOk)out.push('Dispensée de permis en Wallonie : clôture de 2 m maximum du type autorisé (piquets et fils ou treillis, lisses, palissade bois de 1 m maximum, gabions de 1 m maximum).');
    else if(hidden)out.push('Dispensée de permis si elle n’est pas visible depuis la voirie ou se trouve à l’arrière du bâtiment (2 m maximum, matériaux libres).');
    else{st='ko';out.push('Ce type de clôture, visible depuis la rue, n’entre pas dans les dispenses : permis d’urbanisme nécessaire, sauf à le placer à l’arrière ou hors de vue.')}
    out.push('Pas de dispense en zone d’aléa d’inondation élevé, ni si un permis d’urbanisation (lotissement), un guide communal d’urbanisme ou un site classé impose d’autres règles.')}
  else if(reg==='vla'){if(M.wire){if(h<=2)out.push('Open afsluiting (draad of draadgaas) tot 2 m : vrijgesteld van omgevingsvergunning.');else{st='ko';out.push('Hoger dan 2 m : omgevingsvergunning nodig.')}}
    else{const max=f.pos==='avant'?1:2;if(h<=max)out.push(`Gesloten afsluiting : vrijgesteld tot ${max} m ${f.pos==='avant'?'in de voortuin':'in de zij- en achtertuin'}, binnen 30 m van de woning.`);else{st='ko';out.push(`Gesloten afsluiting hoger dan ${max} m ${f.pos==='avant'?'in de voortuin':''} : omgevingsvergunning nodig.`)}}
    out.push('Controleer ook de gemeentelijke stedenbouwkundige verordening en een eventuele verkavelingsvergunning.')}
  else if(reg==='bxl'){out.push('Bruxelles : les clôtures en zone de cours et jardins peuvent être dispensées de permis si elles respectent le Règlement régional d’urbanisme (RRU), le règlement communal (RCU) et l’éventuel permis de lotir.');
    if(f.pos==='avant'){st='mid';out.push('À l’avant (zone de recul), les règles sont plus strictes : renseignez-vous auprès du service urbanisme avant de commander.')}if(h>2){st='mid';out.push('Au-delà de 2 m, un permis est très probablement nécessaire.')}}
  else{st='mid';out.push('Placez le point d’étude pour connaître les règles de votre région.')}
  if(f.limit==='mitoyenne')out.push('Clôture mitoyenne (sur la limite) : accord écrit du voisin recommandé ; frais de pose et d’entretien partagés.');else out.push('Clôture privative : placez-la entièrement sur votre terrain, quelques centimètres en retrait de la limite.');
  return{st,out}}
function lawLinks(){const c=PLACE.commune||'',reg=regionKey(),q=s=>'https://www.google.com/search?q='+encodeURIComponent(s);
  if(reg==='vla')return[['Omgevingsloket : afsluitingen','https://www.vlaanderen.be/omgevingsvergunning/stedenbouwkundige-handelingen/afscheiding'],[`Stedenbouwkundige verordening · ${c}`,q(`gemeentelijke stedenbouwkundige verordening afsluiting ${c}`)]];
  if(reg==='bxl')return[['Urban.brussels : dispenses de permis','https://urban.brussels'],[`Règlement communal d’urbanisme · ${c}`,q(`règlement communal d'urbanisme clôture ${c}`)]];
  return[['CoDT : travaux dispensés de permis (Wallonie)','https://territoire.wallonie.be/fr/page/consulter-le-code-du-developpement-territorial-codt'],[`Guide communal d’urbanisme · ${c}`,q(`guide communal d'urbanisme clôture ${c}`)]]}
function fenceAdvice(f){const M=FM[f.model],a=[];
  if(f.sec>M.sec)a.push(`Niveau de sécurité « ${FSEC[f.sec][0]} » difficile à atteindre avec ${M.l.toLowerCase()} : préférez des panneaux rigides à fils de 5 mm, un barreaudage ou des plaques béton.`);
  if(f.sec===3){if(f.h<1.8)a.push('Pour dissuader l’escalade, visez 1,80 à 2,00 m, sans traverse horizontale facile à enjamber.');a.push('Sécurité renforcée : poteaux scellés au béton, panneaux à fils de 5 mm, soubassement en plaque béton contre le passage par-dessous, fixations antivol.')}
  if(f.model==='souple'&&f.h>1.5)a.push('Grillage souple de grande hauteur : prévoyez 3 fils de tension et des jambes de force à chaque angle.');
  if(f.form==='pleine'&&f.h>1.5)a.push('Clôture pleine de grande hauteur : prise au vent importante, poteaux plus robustes et scellements de 70 à 80 cm conseillés.');
  if(['bois','ganivelle','lisses'].includes(f.model))a.push('Bois : choisissez un bois de classe 3 ou 4 (pin traité autoclave, mélèze, châtaignier, chêne), ou certifié FSC/PEFC.');
  if(f.model==='rigide'||f.model==='souple')a.push('Un grillage double très bien une haie : plantez la haie côté rue ou côté voisin pour masquer le grillage en 2 à 3 ans.');
  a.push('Laissez un passage de 15 × 15 cm au pied de la clôture tous les 20 à 30 m pour les hérissons.');
  return a}
function fenceCalc(f){const M=FM[f.model],raw=f.raw||f.pts,len=lenLL(f.pts),gw=f.gates*f.gate+f.portal*3.5,net=Math.max(0,len-gw);let bays=0;
  for(let i=0;i<raw.length-1;i++){const d=lenLL([raw[i],raw[i+1]]);bays+=Math.ceil(d/M.sp-1e-6)}
  bays=Math.max(1,Math.round(bays*(net/len||1)));const angles=Math.max(0,raw.length-2),posts=bays+1+(f.gates+f.portal)*1,ph=Math.round((f.h+(f.fix==='platine'?0:0.6))*10)/10,rows=[];
  const R_=(a,q,u,d)=>rows.push([a,q,u,d||'']);
  if(['rigide','metal'].includes(f.model)){R_(`${f.model==='rigide'?'Panneaux rigides':'Panneaux à barreaudage'} ${nf(f.h,2)} m`,bays,'pièce(s)',M.unit);R_(`Poteaux ${f.fix==='platine'?'à platine':'à sceller'} ${nf(ph,1)} m`,posts,'pièce(s)',FCOL[f.col]?FCOL[f.col][0]:'');R_('Colliers ou clips de fixation',posts*Math.max(2,Math.ceil(f.h/0.6)),'pièce(s)','')}
  else if(f.model==='souple'){R_(`Grillage souple ${nf(f.h,2)} m`,Math.ceil(net/25),'rouleau(x) de 25 m',FCOL[f.col]?FCOL[f.col][0]:'');R_(`Poteaux ${nf(ph,1)} m`,posts,'pièce(s)','');R_('Jambes de force',2+angles*2,'pièce(s)','aux extrémités et à chaque angle');
    const nf_=f.h>1.2?3:2;R_('Fil de tension',Math.ceil(net*nf_*1.05),'m',`${nf_} rangs`);R_('Raidisseurs (tendeurs)',(1+angles)*nf_*2,'pièce(s)','');R_('Ligatures',Math.ceil(posts*nf_*1.1),'pièce(s)','')}
  else if(f.model==='fils'){const n=f.h>1?4:3;R_(`Piquets ${nf(ph,1)} m`,posts,'pièce(s)','bois traité ou acier');R_('Fil lisse galvanisé',Math.ceil(net*n*1.05),'m',`${n} rangs`);R_('Tendeurs',(1+angles)*n*2,'pièce(s)','');R_('Jambes de force',2+angles*2,'pièce(s)','')}
  else if(f.model==='ganivelle'){R_(`Ganivelle ${nf(f.h,2)} m`,Math.ceil(net/5),'rouleau(x) de 5 m','');R_(`Piquets châtaignier ${nf(f.h+0.5,1)} m`,posts,'pièce(s)','');R_('Fil de fixation galvanisé',Math.ceil(net*3*1.1),'m','3 rangs')}
  else if(f.model==='lisses'){R_(`Poteaux bois ${nf(ph,1)} m`,posts,'pièce(s)','');R_('Lisses (traverses) 2,50 m',bays*(f.h>1?2:1),'pièce(s)','');R_('Vis inox',bays*(f.h>1?2:1)*4,'pièce(s)','')}
  else if(f.model==='bois'){R_(`Panneaux bois ${nf(f.h,2)} m`,bays,'pièce(s)',`${M.unit}, ${FFORM[f.form]||''}`.trim());R_(`Poteaux ${f.fix==='platine'?'sur platine':'à sceller'} ${nf(ph,1)} m`,posts,'pièce(s)','bois classe 4 ou acier');R_('Équerres de fixation',posts*4,'pièce(s)','');R_('Chapeaux de poteaux',posts,'pièce(s)','');R_('Lasure ou saturateur',Math.ceil(net*f.h*2/10),'litre(s)','deux faces, 10 m²/l')}
  else if(f.model==='composite'){const lm=Math.ceil(f.h/0.15);R_('Lames composite 1,80 m',bays*lm,'pièce(s)',`${lm} lames par travée`);R_(`Poteaux aluminium ${nf(ph,1)} m`,posts,'pièce(s)','');R_('Rails de finition haut et bas',bays*2,'pièce(s)','')}
  else if(f.model==='beton'){const pl=Math.ceil(f.h/0.5);R_('Plaques béton 2,00 × 0,50 m',bays*pl,'pièce(s)',`${pl} par travée`);R_(`Poteaux béton ${nf(f.h+0.6,1)} m`,posts,'pièce(s)','à rainures');R_('Poteaux d’angle',angles,'pièce(s)','')}
  else if(f.model==='gabion'){const ep=0.3,vol=net*f.h*ep;R_(`Cages gabion 1,00 × ${nf(f.h,2)} × ${nf(ep,1)} m`,Math.ceil(net),'pièce(s)','');R_('Pierres de remplissage 60–120 mm',Math.ceil(vol*1.6*10)/10,'tonne(s)',`${nf(vol,1)} m³`);R_('Spirales ou agrafes',Math.ceil(net)*8,'pièce(s)','')}
  if(f.soub&&!['beton','gabion'].includes(f.model))R_('Plaques de soubassement béton 2,50 × 0,25 m',bays,'pièce(s)','contre le passage par-dessous');
  if(f.fix!=='platine'&&!['gabion','ganivelle'].includes(f.model))R_('Béton pour scellement',Math.ceil(posts*(f.form==='pleine'||f.h>1.5?0.05:0.035)*100)/100,'m³',`environ ${Math.ceil(posts*(f.form==='pleine'||f.h>1.5?0.05:0.035)*2.2*10)/10} t de béton prêt à l’emploi en sacs`);
  if(f.fix==='platine'&&!['gabion','ganivelle'].includes(f.model))R_('Chevilles chimiques ou goujons',posts*4,'pièce(s)','sur dalle ou muret');
  if(f.gates)R_(`Portillon ${nf(f.gate,1)} m`,f.gates,'pièce(s)','assorti à la clôture, avec serrure');if(f.portal)R_('Portail 3,50 m',f.portal,'pièce(s)','battant ou coulissant');
  return{len,net,bays,posts,angles,rows}}
function fenceCard(f,i){const M=FM[f.model],C=fenceCalc(f),Lw=fenceLaw(f),hs=[...new Set([...M.hs,f.h])].sort((a,b)=>a-b);
  return `<div class="card fcard" data-fid="${f.id}"><h4><span class="sw line" style="background:${(FCOL[f.col]||[0,TC.fence])[1]}"></span>Clôture ${i+1} · ${nf(C.len,1)} m <button type="button" data-fa="del" class="fdel">Supprimer</button></h4>
   <div class="frow">
    <label>Modèle<select data-ff="model">${Object.entries(FM).map(([k,v])=>`<option value="${k}"${k===f.model?' selected':''}>${v.l}</option>`).join('')}</select></label>
    <label>Hauteur (m)<select data-ff="h">${hs.map(h=>`<option value="${h}"${h===f.h?' selected':''}>${nf(h,2)} m</option>`).join('')}<option value="x">autre…</option></select></label>
    <label>Sécurité<select data-ff="sec">${Object.entries(FSEC).map(([k,v])=>`<option value="${k}"${+k===f.sec?' selected':''}>${v[0]} : ${v[1]}</option>`).join('')}</select></label>
    <label>Couleur<select data-ff="col">${Object.entries(FCOL).filter(([k])=>M.cols.includes(k)||k===f.col).map(([k,v])=>`<option value="${k}"${k===f.col?' selected':''}>${v[0]}</option>`).join('')}</select></label>
    <label>Forme<select data-ff="form">${opts(FFORM,f.form)}</select></label>
    <label>Emplacement<select data-ff="pos">${opts(FPOS,f.pos)}</select></label>
    <label>Sur la limite ?<select data-ff="limit">${opts({propre:'Non, sur mon terrain (privative)',mitoyenne:'Oui, mitoyenne (avec le voisin)'},f.limit)}</select></label>
    <label>Fixation<select data-ff="fix">${opts({beton:'Poteaux scellés au béton',platine:'Poteaux sur platine (dalle, muret)'},f.fix)}</select></label>
    <label>Portillons<input type="number" data-ff="gates" min="0" max="10" value="${f.gates}"></label><label>Largeur portillon (m)<input type="number" data-ff="gate" min="0.8" max="2" step="0.1" value="${f.gate}"></label>
    <label>Portails 3,50 m<input type="number" data-ff="portal" min="0" max="5" value="${f.portal}"></label>
    <label class="chk"><input type="checkbox" data-ff="soub"${f.soub?' checked':''}> Soubassement béton</label></div>
   <div class="fprev">${fenceSvg(f)}</div>
   <p class="${Lw.st==='ok'?'okk':Lw.st==='ko'?'koo':''}"><b>${Lw.st==='ok'?'✓ Réglementation':Lw.st==='ko'?'! Permis probablement nécessaire':'i À vérifier'}</b></p><ul class="small">${Lw.out.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
   <h5>Matériel nécessaire (${C.bays} travée${C.bays>1?'s':''}, ${C.posts} poteaux, ${C.angles} angle${C.angles>1?'s':''})</h5>
   <table class="stack"><thead><tr><th>Article</th><th>Quantité</th><th>Unité</th><th>Détail</th></tr></thead><tbody>${C.rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}</tbody></table>
   <ul class="small">${fenceAdvice(f).map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>`}
function fenceSvg(f){const c=(FCOL[f.col]||[0,'#555'])[1],H=60,h=Math.min(1,f.h/2.2)*H,y0=70,W=300,M=FM[f.model],n=5,bw=W/n;let s='';
  for(let i=0;i<n;i++){const x=10+i*bw,top=y0-h,arc=f.form==='cintree'?-8:f.form==='concave'?8:0;
    if(M.open&&M.wire){s+=`<rect x="${x}" y="${top}" width="${bw}" height="${h}" fill="url(#mesh)" stroke="${c}" stroke-width="1.5"/>`}
    else if(f.model==='gabion')s+=`<rect x="${x}" y="${top}" width="${bw}" height="${h}" fill="#9e9e9e" stroke="${c}"/><rect x="${x}" y="${top}" width="${bw}" height="${h}" fill="url(#mesh)"/>`;
    else if(f.model==='beton')for(let k=0;k<Math.ceil(f.h/0.5);k++)s+=`<rect x="${x}" y="${y0-(k+1)*h/Math.ceil(f.h/0.5)}" width="${bw}" height="${h/Math.ceil(f.h/0.5)-1}" fill="${c}" opacity=".85"/>`;
    else if(f.form==='claire'||f.model==='metal'||f.model==='lisses'||f.model==='ganivelle')for(let k=0;k<(f.model==='lisses'?0:10);k++)s+=`<rect x="${x+k*bw/10+2}" y="${top+(arc&&k>0&&k<9?arc*Math.sin(Math.PI*k/9):0)}" width="${bw/20}" height="${h-(arc?arc*Math.sin(Math.PI*k/9):0)}" fill="${c}"/>`;
    else s+=`<path d="M${x} ${y0}V${top}Q${x+bw/2} ${top+arc*2} ${x+bw} ${top}V${y0}Z" fill="${c}" opacity=".9"/>`;
    if(f.model==='lisses')s+=`<rect x="${x}" y="${top+4}" width="${bw}" height="4" fill="${c}"/>${f.h>1?`<rect x="${x}" y="${top+h/2}" width="${bw}" height="4" fill="${c}"/>`:''}`;
    s+=`<rect x="${x-2}" y="${top-4}" width="4" height="${h+4}" fill="${f.model==='beton'?'#777':c}"/>`}
  if(f.soub)s+=`<rect x="10" y="${y0-8}" width="${W}" height="8" fill="#9a9a90"/>`;
  return `<svg viewBox="0 0 320 80" role="img" aria-label="Aperçu de la clôture"><defs><pattern id="mesh" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0H8M0 0V8" stroke="${c}" stroke-width="1" fill="none"/></pattern></defs><line x1="0" y1="${y0}" x2="320" y2="${y0}" stroke="#7a6a50" stroke-width="2"/>${s}<rect x="${10+W-2}" y="${y0-h-4}" width="4" height="${h+4}" fill="${c}"/></svg>`}
function renderFences(){const box=$('#fenceBox');if(!box)return;const reg=regionKey();
  box.innerHTML=(S.fences.length?S.fences.map(fenceCard).join(''):`<p class="empty">Aucune clôture tracée. Tracez-la sur la carte avec l’outil « Clôture » (début, angles, fin), ou entrez sa longueur avec « 📐 Dimensions ».</p>`)+
   `<div class="chips"><button type="button" class="pri" id="fenceDraw">Tracer une clôture sur la carte</button></div>
   <div class="card"><h4>Règles qui s’appliquent${PLACE.commune?' · '+esc(PLACE.commune):''}</h4><p class="small">Région : ${reg==='wal'?'Wallonie (CoDT)':reg==='vla'?'Flandre (Vrijstellingsbesluit)':reg==='bxl'?'Bruxelles-Capitale (RRU)':'inconnue'}. Les communes peuvent imposer des règles plus strictes (matériaux, couleurs, hauteur en façade) dans leur règlement ou guide d’urbanisme, de même qu’un permis de lotir : vérifiez-les avant de commander.</p>
   <ul>${lawLinks().map(([t,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul></div>`;
  if(map.invalidateSize)setTimeout(()=>{},0)}
$('#cloture').addEventListener('change',e=>{const c=e.target.closest('[data-fid]');if(!c)return;const f=S.fences.find(x=>x.id==c.dataset.fid),k=e.target.dataset.ff;if(!f||!k)return;pushUndo();
  if(k==='h'){if(e.target.value==='x'){const v=parseFloat(prompt('Hauteur de la clôture (m)',String(f.h)));if(v>0&&v<5)f.h=Math.round(v*100)/100}else f.h=+e.target.value}
  else if(k==='model'){f.model=e.target.value;const M=FM[f.model];if(!M.hs.includes(f.h))f.h=M.hs.reduce((a,b)=>Math.abs(b-f.h)<Math.abs(a-f.h)?b:a);if(!M.cols.includes(f.col))f.col=M.cols[0];if(f.sec>M.sec)toast(`${M.l} : sécurité limitée au niveau « ${FSEC[M.sec][0]} »`)}
  else if(k==='soub')f.soub=e.target.checked?1:0;else if(['gates','portal','sec'].includes(k))f[k]=Math.max(0,parseInt(e.target.value)||0);else if(k==='gate')f.gate=parseFloat(e.target.value)||1;else f[k]=e.target.value;
  renderFences();drawItems()});
$('#cloture').addEventListener('click',e=>{if(e.target.id==='fenceDraw'){setMode('fence');showTab('carte',true);return}const c=e.target.closest('[data-fid]');if(c&&e.target.dataset.fa==='del')delItem('fences',+c.dataset.fid)});
{const _ic8=itemsChanged;itemsChanged=function(shade){_ic8(shade);renderFences()}}
{const _vs9=v4Sections;v4Sections=function(){const o=_vs9();if(S.fences.length){const rows=[],mat=[],law=[];S.fences.forEach((f,i)=>{const C=fenceCalc(f),Lw=fenceLaw(f);
  rows.push([`Clôture ${i+1}`,`${nf(C.len,1)} m`,FM[f.model].l,`${nf(f.h,2)} m`,FSEC[f.sec][0],(FCOL[f.col]||['—'])[0],FFORM[f.form],FPOS[f.pos]]);C.rows.forEach(r=>mat.push([`Clôture ${i+1}`,...r]));law.push(`Clôture ${i+1} : `+Lw.out.join(' '))});
  o.push({title:'CLÔTURES ET PALISSADES',tables:[{head:['Clôture','Longueur','Modèle','Hauteur','Sécurité','Couleur','Forme','Emplacement'],rows,w:[1300,1100,3200,1000,1300,2000,2400,2538]},{h:'Matériel nécessaire',head:['Clôture','Article','Quantité','Unité','Détail'],rows:mat,w:[1500,4800,1300,2000,5238]}],
   bullets:[...law,...fenceAdvice(S.fences[0]).slice(0,3),'Quantités estimées à partir du tracé : faites confirmer le métré par le fournisseur ou le poseur.'],bh:'Réglementation et conseils'})}return o}}
{const _v4h9=v4Sheets;v4Sheets=function(sh,buy){_v4h9(sh,buy);if(!S.fences.length)return;const rows=[];S.fences.forEach((f,i)=>{const C=fenceCalc(f);C.rows.forEach(r=>{rows.push([`Clôture ${i+1}`,FM[f.model].l,nf(f.h,2),(FCOL[f.col]||['—'])[0],...r]);buy.push(['Produit',r[0],'',r[1],r[2],`Clôture ${i+1} — ${r[3]}`])})});
  sh.push({name:'Clôtures',head:['Clôture','Modèle','Hauteur (m)','Couleur','Article','Quantité','Unité','Détail'],rows})}}
WANTS.push(['cloture','Une clôture ou une palissade','Grillage, bois, composite, béton, avec les règles en vigueur','fence']);
{const _ss=stepSecs;stepSecs=function(n){const s=_ss(n);if(n===4&&wantOn('cloture')&&!s.includes('cloture'))s.splice(s.length-1,0,'cloture');if(n===5&&!s.includes('primes'))s.push('primes');return s}}

/* ================= v8 : primes et subsides ================= */
function subsidies(){const reg=regionKey(),out=[],hed=S.hedges.map(h=>({len:lenLL(h.pts),rows:h.rows||2,type:h.type})),orchN=(()=>{try{return S.orchards.length||S.orch.touched?orchPlan().trees.length:0}catch(e){return 0}})(),fr=S.fruits.length;
  if(reg==='wal'||!reg){
    if(hed.length){const tot=hed.reduce((a,h)=>a+h.len,0),eur=hed.reduce((a,h)=>a+h.len*(h.rows>=3?9:h.rows===2?7:5),0);
      out.push({reg:'Wallonie',t:'Subvention à la plantation de haies vives',amt:`≈ ${nf(eur)} € (${nf(tot,1)} m ; 5 €/m pour 1 rang, 7 €/m pour 2 rangs, 9 €/m pour 3 rangs ou plus ; × 1,5 si une entreprise plante, sans dépasser 80 % de la facture)`,
        ok:tot>=20,cond:['Espèces indigènes, au moins 3 espèces mélangées ; longueur minimale de 20 m en zone d’habitat (100 m ailleurs, en 5 tronçons de 20 m maximum).','Demande dans les 6 mois après la plantation, en ligne avec la carte d’identité électronique ; factures nominatives détaillant les plants.','Engagement d’entretien pendant 30 ans et reprise d’au moins 80 % des plants.'],url:'https://wallonie.be/fr/demarches/demander-une-subvention-pour-la-plantation-dune-haie-vive-dun-taillis-lineaire-dun-verger-et-dalignement-darbres-ainsi-que-pour-lentretien-des-arbres-tetards'})}
    if(orchN||fr){const n=orchN+fr;out.push({reg:'Wallonie',t:'Subvention à la plantation d’un verger',amt:`≈ ${nf(n*25)} € (${n} arbre${n>1?'s':''} × 25 €, × 1,5 si une entreprise plante)`,ok:true,cond:['Arbres fruitiers hautes-tiges ; conditions techniques détaillées dans le vademecum (variétés, distances, protection).','Mêmes démarches : dans les 6 mois après plantation, factures et photos.'],url:'https://biodiversite.wallonie.be'})}
    out.push({reg:'Wallonie',t:'Yes We Plant : plants gratuits et conseils',amt:'Plants offerts lors de campagnes (selon disponibilité) et accompagnement gratuit des « Conseil’haies »',ok:!!(hed.length||orchN),cond:['Haies diversifiées uniquement, plantées en période de repos végétatif, avec un rapport photo après plantation.'],url:'https://yesweplant.wallonie.be'})}
  if(reg==='vla'){out.push({reg:'Vlaanderen',t:'Provinciale en gemeentelijke subsidies voor hagen en hoogstambomen',amt:'Bedragen verschillen per provincie en gemeente',ok:!!(hed.length||orchN||fr),cond:['Bijvoorbeeld « Beplant het landschap » (Oost-Vlaanderen), samenaankoop van streekeigen plantgoed via het Regionaal Landschap, gemeentelijke premies.'],url:'https://www.google.com/search?q='+encodeURIComponent('subsidie haag hoogstam '+(PLACE.commune||''))})}
  if(reg==='bxl'){out.push({reg:'Bruxelles',t:'Primes communales (végétalisation, eau de pluie)',amt:'Selon la commune',ok:true,cond:['Certaines communes soutiennent les plantes grimpantes en façade, les toitures vertes, les citernes, l’infiltration de l’eau de pluie ou le remplacement de revêtements imperméables.','Les montants et conditions changent d’une commune et d’une année à l’autre.'],url:'https://www.google.com/search?q='+encodeURIComponent('prime végétalisation '+(PLACE.commune||'Bruxelles'))})}
  if(S.ponds.length)out.push({reg:reg==='vla'?'Vlaanderen':reg==='bxl'?'Bruxelles':'Wallonie',t:'Mare naturelle',amt:'Pas de prime régionale générale pour les particuliers à ce jour',ok:false,cond:['Renseignez-vous auprès de votre commune, du Contrat de rivière ou du Parc naturel : certains soutiennent la création de mares.'],url:'https://www.google.com/search?q='+encodeURIComponent('subside création mare '+(PLACE.commune||''))});
  return out}
function renderPrimes(){const box=$('#primesBox');if(!box)return;const L=subsidies();
  box.innerHTML=(L.length?L.map(s=>`<div class="card"><h4>${s.ok?'<span aria-hidden="true">✓</span> ':''}${esc(s.t)} <small class="src">${esc(s.reg)}</small></h4><p><b>${esc(s.amt)}</b></p><ul class="small">${s.cond.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><p><a href="${esc(s.url)}" target="_blank" rel="noopener">Démarche et conditions officielles</a></p></div>`).join(''):'<p class="empty">Aucune aide repérée pour les éléments actuels du projet. Les aides portent surtout sur les haies indigènes, les vergers hautes-tiges et les alignements d’arbres.</p>')+
   `<p class="note">Montants indicatifs calculés à partir de votre tracé, d’après les barèmes publiés ; seules les administrations peuvent confirmer l’éligibilité. Vérifiez toujours les conditions à jour avant de planter : certaines aides exigent une demande préalable ou des espèces précises.</p>`}
{const _rv8=renderV4;renderV4=function(){_rv8();renderPrimes()}}
{const _vs10=v4Sections;v4Sections=function(){const o=_vs10(),L=subsidies().filter(s=>s.ok);if(L.length)o.push({title:'PRIMES ET SUBSIDES POSSIBLES',tables:[{head:['Région','Aide','Montant estimé'],rows:L.map(s=>[s.reg,s.t,s.amt]),w:[1600,5000,8238]}],bullets:[...L.flatMap(s=>s.cond).slice(0,6),'Montants indicatifs : vérifiez les conditions à jour auprès de l’administration avant de planter.'],bh:'Conditions principales'});return o}}

/* ================= v8 : santé des plantes (maladies par photo, plantes hôtes du voisinage) ================= */
/* k : genres de l'agent (pour relier les résultats Pl@ntNet) ; n : nom ; h : plantes touchées ; s : symptômes ; p : prévention ; t : traitement (méthodes douces d'abord) */
const DIS=[
 {k:['Erysiphe','Podosphaera','Golovinomyces','Sphaerotheca','Oidium','Microsphaera'],n:'Oïdium (blanc)',h:'rosiers, courgettes, pommiers, chênes, phlox…',s:'Feutrage blanc poudreux sur les feuilles.',p:'Variétés résistantes, plantation aérée, arrosage au pied le matin.',t:'Supprimer les parties atteintes ; pulvériser du soufre mouillable ou une décoction de prêle en préventif ; bicarbonate de potassium autorisé en bio.'},
 {k:['Phytophthora','Plasmopara','Peronospora','Bremia','Pseudoperonospora'],n:'Mildiou',h:'tomates, pommes de terre, vigne, laitues…',s:'Taches brunes à jaunes, duvet gris-blanc sous les feuilles par temps humide.',p:'Abriter les tomates de la pluie, arroser au pied, rotation des cultures, variétés tolérantes.',t:'Retirer et évacuer les feuilles touchées (pas au compost) ; bouillie bordelaise à faible dose en préventif.'},
 {k:['Puccinia','Phragmidium','Melampsora','Gymnosporangium','Uromyces','Cronartium','Coleosporium'],n:'Rouille',h:'rosiers, poiriers, haricots, poireaux, peupliers…',s:'Pustules orange à brunes sous les feuilles.',p:'Éviter de mouiller le feuillage, espacer les plantes ; éloigner l’hôte alternant si possible (genévrier pour la rouille du poirier).',t:'Ramasser et évacuer les feuilles tombées ; soufre en préventif.'},
 {k:['Venturia'],n:'Tavelure',h:'pommiers, poiriers',s:'Taches brun-olive sur feuilles et fruits, fruits crevassés.',p:'Variétés résistantes, ramasser les feuilles à l’automne, taille aérée.',t:'Traitement au soufre ou au cuivre au débourrement, seulement si la pression est forte.'},
 {k:['Monilinia','Monilia'],n:'Moniliose',h:'pommiers, poiriers, cerisiers, pruniers, pêchers',s:'Fruits pourris avec des cercles de coussinets beiges ; rameaux desséchés.',p:'Supprimer les fruits momifiés en hiver, éviter les blessures des fruits.',t:'Tailler les rameaux atteints 10 cm sous la zone malade ; aucun produit efficace au jardin.'},
 {k:['Taphrina'],n:'Cloque',h:'pêchers, nectariniers',s:'Feuilles boursouflées, rouges, puis qui tombent.',p:'Abriter l’arbre de la pluie en fin d’hiver, variétés tolérantes.',t:'Bouillie bordelaise à la chute des feuilles et au gonflement des bourgeons.'},
 {k:['Diplocarpon','Marssonina'],n:'Maladie des taches noires',h:'rosiers',s:'Taches noires frangées, jaunissement et chute des feuilles.',p:'Rosiers résistants, paillage, arrosage au pied.',t:'Ramasser les feuilles atteintes ; purin de prêle en préventif.'},
 {k:['Botrytis'],n:'Pourriture grise',h:'fraisiers, vigne, tomates, pivoines',s:'Moisissure grise duveteuse sur fruits et fleurs.',p:'Aérer, éviter l’excès d’azote, pailler les fraisiers.',t:'Retirer les parties atteintes ; pas de traitement au jardin.'},
 {k:['Erwinia'],n:'Feu bactérien',h:'poiriers, pommiers, cognassiers, aubépines, cotonéasters, pyracanthas',s:'Pousses noircies recourbées en crosse, comme brûlées.',p:'Éviter les plantes hôtes très sensibles près des fruitiers.',t:'Couper 30 à 50 cm sous la partie atteinte, désinfecter l’outil à l’alcool entre chaque coupe, brûler ou évacuer les déchets.'},
 {k:['Cydalima'],n:'Pyrale du buis',h:'buis',s:'Chenilles vertes rayées de noir, feuilles dévorées, toiles.',p:'Pièges à phéromones de mai à octobre, remplacer le buis par du houx crénelé ou de l’if.',t:'Bacillus thuringiensis (Bt) sur jeunes chenilles ; ramassage manuel.'},
 {k:['Calonectria','Cylindrocladium','Volutella','Pseudonectria'],n:'Dépérissement du buis',h:'buis',s:'Taches brunes, défoliation rapide, rameaux noircis.',p:'Éviter l’arrosage du feuillage, tailler par temps sec.',t:'Supprimer les parties atteintes ; remplacer par une autre essence si l’attaque persiste.'},
 {k:['Hymenoscyphus','Chalara'],n:'Chalarose du frêne',h:'frênes',s:'Rameaux qui sèchent, nécroses sur l’écorce, houppier qui s’éclaircit.',p:'Ne plus planter de frêne.',t:'Aucun traitement : surveiller la sécurité des arbres atteints près des lieux de passage.'},
 {k:['Ophiostoma'],n:'Graphiose de l’orme',h:'ormes',s:'Feuillage qui flétrit d’un coup en été.',p:'Variétés résistantes uniquement.',t:'Abattre et éliminer les arbres atteints.'},
 {k:['Aphis','Myzus','Dysaphis','Brevicoryne','Macrosiphum','Eriosoma'],n:'Pucerons',h:'très nombreuses plantes',s:'Colonies sur les jeunes pousses, feuilles enroulées, miellat collant.',p:'Favoriser coccinelles, syrphes et mésanges (haies, fleurs, nichoirs) ; limiter l’azote.',t:'Jet d’eau, savon noir dilué (5 %) ; éviter les insecticides qui tuent aussi les auxiliaires.'},
 {k:['Cydia'],n:'Carpocapse (ver des fruits)',h:'pommiers, poiriers, noyers',s:'Fruits véreux avec galerie jusqu’au cœur.',p:'Bandes-pièges cartonnées sur le tronc, nichoirs à mésanges, pièges à phéromones.',t:'Virus de la granulose (bio) au bon moment, selon les avertissements.'},
 {k:['Tetranychus','Panonychus'],n:'Araignées rouges (acariens)',h:'arbres fruitiers, tomates, conifères',s:'Feuilles plombées, fines toiles.',p:'Arroser le feuillage en période sèche, favoriser les acariens prédateurs.',t:'Pulvérisations d’eau ; savon noir.'},
 {k:['Neonectria','Nectria'],n:'Chancre',h:'pommiers, poiriers',s:'Plaies creuses sur les branches, bourrelets.',p:'Éviter les sols trop humides et les variétés sensibles.',t:'Cureter la plaie jusqu’au bois sain et la recouvrir d’un mastic ; supprimer les branches très atteintes.'},
 {k:['Alternaria','Septoria'],n:'Alternariose ou septoriose',h:'tomates, céleris, pommes de terre',s:'Taches brunes à anneaux concentriques.',p:'Rotation, arrosage au pied, retirer les feuilles basses des tomates.',t:'Retirer les feuilles atteintes.'},
 {k:['Plasmodiophora'],n:'Hernie du chou',h:'choux, navets, radis',s:'Racines déformées en massue, plantes qui flétrissent.',p:'Chauler les sols acides, rotation de 5 à 7 ans.',t:'Aucun traitement : arracher et évacuer.'},
 {k:['Leptinotarsa'],n:'Doryphore',h:'pommes de terre, aubergines',s:'Larves orange et adultes rayés dévorant les feuilles.',p:'Rotation, buttage.',t:'Ramassage manuel ; Bt spécifique.'},
 {k:['Cameraria'],n:'Mineuse du marronnier',h:'marronniers',s:'Feuilles qui brunissent dès l’été.',p:'Ramasser et évacuer les feuilles à l’automne.',t:'Aucun traitement utile au jardin.'},
 {k:['Thaumetopoea'],n:'Chenilles processionnaires',h:'chênes (en Belgique), pins',s:'Nids soyeux, chenilles en file ; poils très urticants.',p:'Nichoirs à mésanges.',t:'Ne pas toucher : faire enlever les nids par un professionnel.'}];
function disMatch(txt){const t=String(txt||'');return DIS.find(d=>d.k.some(g=>t.toLowerCase().includes(g.toLowerCase())))||null}
/* plantes hôtes du voisinage : g = genres hôtes ; tg = genres ou espèces menacés */
const HOSTS=[
 {g:['Juniperus'],n:'Genévriers ornementaux',d:'Rouille grillagée du poirier',tg:['Pyrus'],a:'Le champignon passe l’hiver sur certains genévriers et contamine les poiriers jusqu’à plusieurs centaines de mètres. Choisissez des poiriers peu sensibles, ramassez les feuilles atteintes et évitez de planter des genévriers sabine ou de Chine près des poiriers.'},
 {g:['Crataegus','Cotoneaster','Pyracantha','Sorbus','Cydonia','Mespilus'],n:'Aubépines, cotonéasters, pyracanthas, sorbiers',d:'Feu bactérien',tg:['Pyrus','Malus','Cydonia','Mespilus','Sorbus','Crataegus','Cotoneaster','Pyracantha'],a:'Ces arbustes peuvent héberger la bactérie. Inspectez les fruitiers au printemps (pousses noircies en crosse) et coupez largement sous la zone atteinte en désinfectant l’outil.'},
 {g:['Ribes'],n:'Cassissiers et groseilliers',d:'Rouille vésiculeuse du pin',tg:['Pinus'],a:'Hôte alternant de la rouille des pins à cinq aiguilles (pin Weymouth) : évitez d’associer les deux.'},
 {g:['Pinus'],n:'Pins à cinq aiguilles',d:'Rouille vésiculeuse (sur cassissiers et groseilliers)',tg:['Ribes'],a:'Les cassissiers et groseilliers proches peuvent être contaminés : surveillez les pustules orange sous les feuilles en été.'},
 {g:['Buxus'],n:'Buis',d:'Pyrale et dépérissement du buis',tg:['Buxus'],a:'Les buis du voisinage entretiennent la pyrale : posez des pièges à phéromones et préférez un substitut (houx crénelé, if, chèvrefeuille arbustif) pour vos bordures.'},
 {g:['Fraxinus'],n:'Frênes',d:'Chalarose du frêne',tg:['Fraxinus'],a:'La chalarose est générale en Belgique : ne plantez pas de frêne.'},
 {g:['Populus','Larix'],n:'Peupliers ou mélèzes',d:'Rouille du peuplier (alternance peuplier et mélèze)',tg:['Populus','Larix'],a:'Évitez d’associer peupliers et mélèzes ; choisissez des clones de peuplier résistants.'},
 {g:['Prunus'],n:'Pruniers, prunelliers, cerisiers sauvages',d:'Sharka (virus transmis par pucerons) et moniliose',tg:['Prunus'],a:'Achetez des plants certifiés ; arrachez un arbre dont les feuilles ou les fruits montrent des anneaux pâles typiques de la sharka.'},
 {g:['Plantago'],n:'Plantains',d:'Puceron cendré du pommier (hôte d’été)',tg:['Malus'],a:'Le puceron passe l’été sur les plantains et revient sur les pommiers à l’automne : favorisez les auxiliaires (haies fleuries, nichoirs) plutôt que d’arracher.'},
 {g:['Euonymus','Viburnum'],n:'Fusains ou viornes',d:'Puceron noir de la fève (hôte d’hiver)',tg:['Vicia','Phaseolus','Beta'],a:'Semez les fèves tôt et pincez les têtes au premier puceron ; les coccinelles régulent vite les colonies.'},
 {g:['Solanum'],n:'Pommes de terre ou tomates voisines',d:'Mildiou',tg:['Solanum'],a:'Le mildiou voyage par le vent depuis les cultures voisines : abritez vos tomates de la pluie et surveillez les bulletins d’avertissement.'},
 {g:['Malus'],n:'Pommiers non entretenus',d:'Tavelure, carpocapse, chancre',tg:['Malus','Pyrus'],a:'Ramassez les feuilles et fruits tombés ; posez des bandes-pièges sur vos troncs.'},
 {g:['Aesculus'],n:'Marronniers',d:'Mineuse du marronnier',tg:['Aesculus'],a:'Évitez de planter un marronnier blanc ; préférez le marronnier à fleurs rouges, moins attaqué.'},
 {g:['Quercus'],n:'Chênes',d:'Chenilles processionnaires du chêne (poils urticants)',tg:['*'],a:'Surveillez les nids sur les chênes proches en mai–juillet, surtout près des aires de jeux.'},
 {g:['Ulmus'],n:'Ormes',d:'Graphiose',tg:['Ulmus'],a:'Plantez uniquement des ormes résistants.'}];
const genusOf=l=>String(l||'').trim().split(/\s+/)[0];
function projectLatins(){const s=new Map(),add=(l,n,src)=>{if(!l)return;const g=genusOf(l);if(!s.has(g))s.set(g,{l,n,src})};
  try{if(massifOn()&&S.lastCompo)S.lastCompo.rows.forEach(x=>add(x.p.l,x.p.n,'massif'))}catch(e){}
  try{S.hedges.forEach(h=>hedgeInfo(h).mix.forEach(m=>add(m.l,m.n,'haie')))}catch(e){}
  try{if(S.orchards.length||S.orch.touched)orchPlan().trees.forEach(t=>add(ORCH[t.k].l.split(',')[0],ORCH[t.k].n,'verger'))}catch(e){}
  try{S.fruits.forEach(f=>{const F=fruitInfo(f);add(F.fr.l,F.fr.n,'fruitier')})}catch(e){}
  try{if(S.potagers.length||S.veg.touched)vegPlan().parts.forEach(p=>add(p.x.l,p.x.n,'potager'))}catch(e){}
  return s}
S.nearby=null;S.disHist=S.disHist||[];
async function loadNearby(){if(S.lat==null){toast('Placez d’abord le point d’étude.');return}$('#hostRes').innerHTML='<p class="state">Recherche des plantes observées autour du site…</p>';
  try{const u=`https://api.inaturalist.org/v1/observations/species_counts?lat=${S.lat.toFixed(5)}&lng=${S.lon.toFixed(5)}&radius=0.6&iconic_taxa=Plantae&quality_grade=research&per_page=500&locale=fr`;
    const r=await fetch(u),j=await r.json();S.nearby=(j.results||[]).filter(x=>x.taxon).map(x=>({l:x.taxon.name,n:x.taxon.preferred_common_name||'',c:x.count}))}
  catch(e){S.nearby=[];toast('Observations du voisinage indisponibles pour le moment.')}renderHosts()}
function hostRisks(){const near=new Map();(S.nearby||[]).forEach(x=>near.set(genusOf(x.l),{...x,src:'voisinage'}));(S.idents||[]).forEach(x=>near.set(genusOf(x.latin),{l:x.latin,n:x.fr,src:'relevé'}));
  const proj=projectLatins();for(const [g,v] of proj)if(!near.has(g))near.set(g,{l:v.l,n:v.n,src:'projet'});
  const out=[];HOSTS.forEach(H=>{const found=[...near.values()].filter(x=>H.g.includes(genusOf(x.l)));if(!found.length)return;
    const ext=found.some(x=>x.src!=='projet');let tgt=[...proj.values()].filter(p=>H.tg.includes('*')||H.tg.includes(genusOf(p.l)));if(!ext)tgt=tgt.filter(p=>!H.g.includes(genusOf(p.l)));if(!ext&&!tgt.length)return;out.push({H,found,tgt})});
  return out.sort((a,b)=>b.tgt.length-a.tgt.length)}
function renderHosts(){const box=$('#hostRes');if(!box)return;const R_=hostRisks(),proj=projectLatins();
  box.innerHTML=(S.nearby?`<p class="small">${S.nearby.length} espèce(s) observée(s) dans un rayon d’environ 600 m (iNaturalist, observations validées)${S.idents&&S.idents.length?`, plus ${S.idents.length} plante(s) de votre relevé`:''}. ${proj.size} genre(s) de plantes dans votre projet.</p>`:'<p class="small">Cliquez sur « Analyser le voisinage » pour croiser les plantes observées autour du site avec celles de votre projet.</p>')+
   (R_.length?`<table class="stack"><thead><tr><th>Plante hôte</th><th>Maladie ou ravageur</th><th>Plantes de votre projet concernées</th><th>Que faire</th></tr></thead><tbody>${R_.map(x=>`<tr class="${x.tgt.length?'risk':''}"><td><b>${esc(x.H.n)}</b><br><small>${x.found.slice(0,3).map(f=>`${esc(f.n||f.l)} <i>(${esc(f.src)})</i>`).join(', ')}</small></td><td>${esc(x.H.d)}</td><td>${x.tgt.length?x.tgt.map(t=>esc(t.n)).join(', '):'<span class="note">aucune pour l’instant</span>'}</td><td class="small">${esc(x.H.a)}</td></tr>`).join('')}</tbody></table>`:(S.nearby?'<p class="okk">Aucune plante hôte de maladie connue repérée entre le voisinage et votre projet.</p>':''));
  watchPhotos(box)}
/* identification d'une maladie par photo */
const DIS_S={shots:[],busy:false,res:null};
function renderDisShots(){$('#disShots').innerHTML=DIS_S.shots.length?DIS_S.shots.map((s,i)=>`<figure><img src="${s.url}" alt="Photo ${i+1}"><select data-dorg="${i}" aria-label="Partie photographiée">${opts(ORG,s.organ)}</select><button type="button" data-drm="${i}" aria-label="Retirer la photo">×</button></figure>`).join(''):'<p class="note">Photographiez de près la partie malade (feuille, fruit, écorce), bien éclairée, sans flash. Ajoutez si possible une vue d’ensemble de la plante.</p>';$('#disGo').disabled=!DIS_S.shots.length||DIS_S.busy}
async function identifyDisease(){if(!DIS_S.shots.length)return;DIS_S.busy=true;renderDisShots();$('#disRes').innerHTML='<p class="state">Analyse en cours…</p>';
  try{let C=[];const host=$('#disHost').value.trim();
    if(IDSET.engine==='plantnet'&&(IDSET.key||PLANTNET_CLE_DU_SITE)){const KEY=IDSET.key||PLANTNET_CLE_DU_SITE,fd=new FormData();DIS_S.shots.forEach(s=>{fd.append('images',s.blob,'photo.jpg');fd.append('organs',s.organ)});
      const r=await fetch(`https://my-api.plantnet.org/v2/diseases/identify?api-key=${encodeURIComponent(KEY)}&lang=fr&nb-results=5`,{method:'POST',body:fd});const j=await r.json().catch(()=>({}));
      if(r.status===404)throw new Error('aucune maladie reconnue : essayez une photo plus nette de la partie atteinte');if(!r.ok)throw new Error(j.message||('erreur '+r.status));
      C=(j.results||[]).map(x=>({n:x.description||x.name,code:x.name,score:x.score,img:x.images&&x.images[0]&&x.images[0].url&&x.images[0].url.s}))}
    else{const o=await askClaude('Tu es phytopathologiste en Belgique (jardins). Identifie la maladie, le ravageur ou le trouble (carence, sécheresse, brûlure) visible sur les photos. Réponds uniquement en JSON : {"candidats":[{"nom":"nom français","agent":"Genre espèce de l’agent ou cause","score":0.0}],"remarque":"phrase courte"} avec au plus 4 candidats.',
      [...DIS_S.shots.slice(0,3).map(s=>imgBlock(s.url)),{type:'text',text:`Plante concernée : ${host||'inconnue'}. Partie photographiée : ${DIS_S.shots.map(s=>ORG[s.organ]).join(', ')}.`}],700);
      C=(o.candidats||[]).map(x=>({n:x.nom+(x.agent?` (${x.agent})`:''),code:x.agent||'',score:+x.score||0}));DIS_S.note=o.remarque||''}
    DIS_S.res=C;renderDisRes()}catch(e){$('#disRes').innerHTML=`<p class="koo">Analyse impossible : ${esc(e.message)}.</p>`}finally{DIS_S.busy=false;renderDisShots()}}
function disCard(D){return `<div class="discard"><b>${esc(D.n)}</b> <small>${esc(D.h)}</small><p><b>Symptômes :</b> ${esc(D.s)}</p><p><b>Prévenir :</b> ${esc(D.p)}</p><p><b>Traiter :</b> ${esc(D.t)}</p></div>`}
function renderDisRes(){const C=DIS_S.res||[];if(!C.length){$('#disRes').innerHTML='<p class="koo">Rien de reconnu. Essayez une photo plus nette de la partie atteinte.</p>';return}const top=disMatch(C[0].n+' '+C[0].code);
  $('#disRes').innerHTML=`<ol class="idcands">${C.map((c,i)=>`<li>${c.img?`<img class="ph sm" src="${esc(c.img)}" alt="">`:'<span></span>'}<div><b>${esc(c.n)}</b><div class="idsc"><i style="width:${Math.round(c.score*100)}%"></i></div><small>${Math.round(c.score*100)} % de vraisemblance</small></div><button type="button" data-dok="${i}"${i?'':' class="pri"'}>Noter dans le projet</button></li>`).join('')}</ol>
   ${top&&C[0].score>=0.15?disCard(top):''}${DIS_S.note?`<p class="note">${esc(DIS_S.note)}</p>`:''}<p class="note">Un diagnostic sur photo reste indicatif : en cas de doute, montrez un échantillon à un pépiniériste ou au service phytosanitaire de votre région. Utilisez toujours les produits de traitement selon leur étiquette.</p>`}
$('#sante').addEventListener('click',e=>{const t=e.target;if(t.id==='disAdd')$('#disFile').click();if(t.id==='disGo')identifyDisease();if(t.id==='hostGo')loadNearby();
  if(t.dataset.drm!=null){DIS_S.shots.splice(+t.dataset.drm,1);renderDisShots()}
  if(t.dataset.dok!=null){const c=DIS_S.res[+t.dataset.dok];S.disHist.push({n:c.n,score:c.score,host:$('#disHost').value.trim(),date:Date.now()});renderDisHist();toast('Noté dans le projet');renderV4()}
  if(t.dataset.dhrm!=null){S.disHist.splice(+t.dataset.dhrm,1);renderDisHist();renderV4()}});
$('#sante').addEventListener('change',e=>{if(e.target.dataset.dorg!=null)DIS_S.shots[+e.target.dataset.dorg].organ=e.target.value});
$('#disFile').addEventListener('change',async e=>{for(const f of [...e.target.files].slice(0,5-DIS_S.shots.length)){try{const s=await shrink(f,1280);DIS_S.shots.push({...s,organ:'auto'})}catch(err){}}e.target.value='';renderDisShots()});
function renderDisHist(){const b=$('#disHist');if(!b)return;b.innerHTML=S.disHist.length?`<ul>${S.disHist.map((d,i)=>`<li>${esc(d.n)}${d.host?' sur '+esc(d.host):''} <small>(${new Date(d.date).toLocaleDateString('fr-BE')})</small> <button type="button" data-dhrm="${i}">Retirer</button></li>`).join('')}</ul>`:'<p class="empty">Aucun problème noté.</p>'}
{const _ser8=serialize;serialize=function(){const d=_ser8();d.set.disHist=clone(S.disHist||[]);d.set.nearby=S.nearby?S.nearby.slice(0,300):null;return d}}
{const _rs8=restoreSettings;restoreSettings=function(t){_rs8(t);S.disHist=t&&t.disHist?clone(t.disHist):[];S.nearby=t&&t.nearby?t.nearby:null;renderDisHist();renderHosts()}}
{const _vs11=v4Sections;v4Sections=function(){const o=_vs11(),R_=hostRisks().filter(x=>x.tgt.length);if(R_.length||S.disHist.length)o.push({title:'SANTÉ DES PLANTES',tables:[...(R_.length?[{h:'Plantes hôtes de maladies autour du site',head:['Plante hôte','Maladie','Plantes du projet concernées','Conseil'],rows:R_.map(x=>[x.H.n,x.H.d,x.tgt.map(t=>t.n).join(', '),x.H.a]),w:[2600,2600,3000,6638]}]:[]),
  ...(S.disHist.length?[{h:'Problèmes observés',head:['Problème','Plante','Conseil'],rows:S.disHist.map(d=>{const D=disMatch(d.n);return[d.n,d.host||'—',D?D.t:'—']}),w:[3600,2600,8638]}]:[])]});return o}}
{const _sr9=synRows;synRows=function(){const r=_sr9(),R_=hostRisks().filter(x=>x.tgt.length);if(R_.length)r.push(['Maladies du voisinage','mid',`${R_.length} risque(s) : ${R_.slice(0,3).map(x=>x.H.d.toLowerCase()+' ('+x.tgt.map(t=>t.n).slice(0,2).join(', ')+')').join(' ; ')}.`]);return r}}
{const _rv9=renderV4;renderV4=function(){_rv9();if(S.nearby)renderHosts()}}

/* ================= v8 : mesurer un obstacle sur photo ================= */
const MS={img:null,url:'',pts:[],refH:1.75,res:null};
const MREF={personne:['Une personne debout',1.75],porte:['Une porte d’entrée',2.05],voiture:['Une voiture (hauteur)',1.5],garage:['Une porte de garage',2.0],cloture:['Une clôture standard',1.8],autre:['Autre (hauteur connue)',0]};
const MSTEP=['Cliquez le pied de la référence','Cliquez le sommet de la référence','Cliquez le pied de l’obstacle','Cliquez le sommet de l’obstacle','Cliquez le bord gauche de l’obstacle (largeur)','Cliquez le bord droit de l’obstacle'];
function measureTargets(sel){return `<option value="new:caduc">Nouvel arbre caduc (à placer sur la carte)</option><option value="new:pers">Nouvel arbre persistant (à placer)</option><option value="new:bat">Nouveau bâtiment (à placer)</option><option value="new:haie">Nouvelle haie existante (à placer)</option>`+
  S.obs.map((o,i)=>`<option value="obs:${o.id}"${sel==='obs:'+o.id?' selected':''}>${esc(OBT[o.type].l)} ${i+1} (${nf(o.h,1)} m)</option>`).join('')+S.shapes.map(s=>`<option value="shapes:${s.id}"${sel==='shapes:'+s.id?' selected':''}>${esc(s.name)} (${nf(s.h,1)} m)</option>`).join('')}
function drawMeasure(){const c=$('#msCanvas');if(!c||!MS.img)return;const g=c.getContext('2d');c.width=MS.img.width;c.height=MS.img.height;g.drawImage(MS.img,0,0);const lw=Math.max(2,c.width/400);
  const col=['#ffd54f','#ffd54f','#4fc3f7','#4fc3f7','#ef5350','#ef5350'];MS.pts.forEach((p,i)=>{g.fillStyle=col[i];g.strokeStyle='#000';g.lineWidth=lw/2;g.beginPath();g.arc(p[0],p[1],lw*3,0,7);g.fill();g.stroke()});
  [[0,1],[2,3],[4,5]].forEach(([a,b],k)=>{if(MS.pts[b]){g.strokeStyle=col[a];g.lineWidth=lw;g.setLineDash([lw*3,lw*2]);g.beginPath();g.moveTo(...MS.pts[a]);g.lineTo(...MS.pts[b]);g.stroke();g.setLineDash([])}});
  $('#msStep').textContent=MS.pts.length<6?`Étape ${MS.pts.length+1} sur 6 : ${MSTEP[MS.pts.length]}.`:'Mesure terminée.';measureCompute()}
function measureCompute(){const P=MS.pts,d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);const k=$('#msRef').value,rh=k==='autre'?parseFloat($('#msRefH').value):MREF[k][1];
  if(P.length<4||!(rh>0)){MS.res=null;$('#msOut').innerHTML='';return}const mpp=rh/d(P[0],P[1]),H=d(P[2],P[3])*mpp,W=P.length>=6?Math.abs(P[5][0]-P[4][0])*mpp:null;MS.res={h:Math.round(H*10)/10,w:W?Math.round(W*10)/10:null,src:'photo'};
  $('#msOut').innerHTML=`<p><b>Hauteur estimée : ${nf(MS.res.h,1)} m</b>${MS.res.w?` · <b>envergure ou largeur : ${nf(MS.res.w,1)} m</b>`:''}</p><p class="note">Précision : bonne si la référence se trouve à la même distance que l’obstacle (par exemple une personne au pied de l’arbre) et si la photo est prise de loin, appareil droit.</p>`}
async function measureAI(){if(!MS.url){toast('Ajoutez d’abord une photo.');return}$('#msOut').innerHTML='<p class="state">Estimation en cours…</p>';
  try{const o=await askClaude('Tu estimes les dimensions d’obstacles (arbres, bâtiments, haies, murs) sur des photos de jardin en Belgique, à partir de repères visibles (portes ≈ 2 m, étages ≈ 2,7 à 3 m, personnes, voitures, briques). Réponds uniquement en JSON : {"type":"arbre caduc|arbre persistant|bâtiment|haie|mur","hauteur_m":0,"envergure_m":0,"confiance":"faible|moyenne|bonne","reperes":"repères utilisés, en une phrase"}.',[imgBlock(MS.url),{type:'text',text:'Estime la hauteur et l’envergure (ou la largeur vue de face) de l’obstacle principal.'}],400);
    MS.res={h:Math.round((+o.hauteur_m||0)*10)/10,w:o.envergure_m?Math.round(+o.envergure_m*10)/10:null,src:'IA',type:o.type};
    $('#msOut').innerHTML=`<p><b>${esc(o.type||'Obstacle')} : hauteur ≈ ${nf(MS.res.h,1)} m${MS.res.w?`, envergure ≈ ${nf(MS.res.w,1)} m`:''}</b> (confiance ${esc(o.confiance||'?')})</p><p class="note">${esc(o.reperes||'')} Estimation à vérifier : la mesure avec une référence est plus fiable.</p>`;
    const t=/bât/i.test(o.type||'')?'bat':/persist/i.test(o.type||'')?'pers':/haie/i.test(o.type||'')?'haie':'caduc';if($('#msTarget').value.startsWith('new:'))$('#msTarget').value='new:'+t}
  catch(e){$('#msOut').innerHTML=`<p class="koo">Estimation impossible : ${esc(e.message)}.</p>`}}
function measureApply(){const r=MS.res;if(!r||!(r.h>0)){toast('Faites d’abord la mesure.');return}const [k,id]=$('#msTarget').value.split(':');
  if(k==='new'){S.pendObs={type:id,h:r.h,w:r.w||OBT[id].w};$('#obsType').value=id;setMode('obs');showTab('carte',true);toast('Cliquez sur la carte à l’emplacement de l’obstacle.');return}
  pushUndo();if(k==='obs'){const o=S.obs.find(x=>x.id==id);if(!o)return;o.h=r.h;if(r.w)o.w=r.w;styleObs(o)}else{const s=S.shapes.find(x=>x.id==id);if(!s)return;s.h=r.h;itemsChanged(true)}
  renderObs();sunUpdate();toast('Dimensions appliquées à l’obstacle : ombres recalculées')}
function openMeasure(target){showTab('soleil',false);const d=$('#msBox');if(d){d.open=true;$('#msTarget').innerHTML=measureTargets(target);if(target)$('#msTarget').value=target;setTimeout(()=>d.scrollIntoView({behavior:'smooth',block:'start'}),60)}}
$('#msBox').addEventListener('toggle',()=>{if($('#msBox').open)$('#msTarget').innerHTML=measureTargets($('#msTarget').value)});
$('#msFile').addEventListener('change',async e=>{const s=await photoIn(e.target,1600);if(!s)return;MS.url=s.url;MS.pts=[];const im=new Image();im.onload=()=>{MS.img=im;$('#msWrap').hidden=false;drawMeasure()};im.src=s.url});
$('#msCanvas').addEventListener('click',e=>{if(!MS.img||MS.pts.length>=6)return;const c=e.currentTarget,r=c.getBoundingClientRect();MS.pts.push([(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]);drawMeasure()});
$('#msBox').addEventListener('click',e=>{const id=e.target.id;if(id==='msPick')$('#msFile').click();if(id==='msUndo'){MS.pts.pop();drawMeasure()}if(id==='msReset'){MS.pts=[];drawMeasure()}if(id==='msAI')measureAI();if(id==='msApply')measureApply()});
$('#msBox').addEventListener('change',e=>{if(e.target.id==='msRef'){$('#msRefHl').hidden=e.target.value!=='autre';measureCompute()}if(e.target.id==='msRefH')measureCompute()});

/* ================= v8 : rendus sur photo (photomontage + IA en option) ================= */
const RN={img:null,url:'',zone:[],closed:false,what:'massif',widthM:0,depth:0.45,month:new Date().getMonth()+1,mulch:true,seed:7,out:null,ai:null};
S.renders=[];
function rnSources(){const o=[];if(S.lastCompo&&massifOn())o.push(['massif','Massif ('+S.lastCompo.st.l+')']);if(S.hedges.length)o.push(['haie','Haie']);if(S.boxes.length)o.push(['jardin','Jardinières']);
  if(S.potagers.length||wantOn('potager'))o.push(['potager','Potager']);if(S.orchards.length||S.fruits.length||wantOn('verger'))o.push(['verger','Verger et fruitiers']);if(S.fences.length)o.push(['cloture','Clôture (dessinez sa ligne de pied)']);if(!o.length&&S.lastCompo)o.push(['massif','Massif']);return o}
function rnItems(){const w=RN.what,its=[];
  if(w==='massif'&&S.lastCompo)S.lastCompo.rows.forEach(x=>its.push({p:x.p,q:x.qty}));
  if(w==='haie'&&S.hedges[0]){const h=S.hedges[0],I=hedgeInfo(h);I.mix.forEach(m=>{const pp=PL.find(p=>p.l===m.l)||{n:m.n,l:m.l,t:'arbuste',h:h.h||1.8,c:['vert'],f:[],pers:m.pers==='persistant'?1:0};its.push({p:{...pp,h:h.h||pp.h},q:m.qty})})}
  if(w==='jardin'&&S.boxes[0]){const b=S.boxes[0];boxCompo(b,b.sais==='h'?'h':'e').rows.forEach(x=>its.push({p:x.p,q:x.q*Math.max(1,boxPlan(b).n)}))}
  if(w==='potager'){try{vegPlan().parts.slice(0,12).forEach(p=>its.push({p:{n:p.x.n,l:p.x.l,t:'legume',h:p.x.h||0.5,c:['vert'],f:[]},q:Math.max(4,Math.min(30,p.q||10))}))}catch(e){}}
  if(w==='verger'){try{const P=orchPlan();(P.trees.length?P.trees:S.fruits.map(()=>({k:'pommier'}))).forEach(t=>its.push({p:{n:'Fruitier',l:'Malus',t:'arbre',h:S.orch.type==='ht'?6:4,c:['blanc'],f:[4,5],fruit:1},q:1}))}catch(e){}}
  return its}
function rnPolyX(y){const P=RN.zone,xs=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]))}return xs.sort((a,b)=>a-b)}
function rnRand(){RN.seed=(RN.seed*9301+49297)%233280;return RN.seed/233280}
function hexMix(h,d){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.max(0,Math.min(255,r+d));g=Math.max(0,Math.min(255,g+d));b=Math.max(0,Math.min(255,b+d));return `rgb(${r},${g},${b})`}
function rnPlant(g,p,x,y,s){const m=RN.month,flo=p.f&&p.f.includes(m),dorm=[12,1,2].includes(m)&&!p.pers&&(p.t==='vivace'||p.t==='fougere'||p.t==='graminee');const H=Math.max(4,(p.h||0.6)*s),leaf=(typeof leafCol==='function'?leafCol(p):'#5f8f45')||'#5f8f45';
  const fc=p.c&&p.c.find(c=>c!=='vert'),fcol=fc&&COL[fc]?COL[fc][1]:'#ffffff';
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x,y,H*0.45,H*0.08,0,0,7);g.fill();
  if(dorm){g.strokeStyle='#8a6d4a';g.lineWidth=Math.max(1,H/40);for(let i=0;i<10;i++){g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnRand()-0.5)*H*0.5,y-H*0.25*rnRand());g.stroke()}return}
  if(p.t==='arbre'){const tr=H*0.38;g.fillStyle='#6b4f36';g.fillRect(x-H*0.03,y-tr,H*0.06,tr);const cw=H*0.36,cy=y-tr-H*0.3;
    for(let i=0;i<60;i++){const a=rnRand()*6.28,r=Math.sqrt(rnRand());g.fillStyle=hexMix(leaf,(rnRand()-0.5)*50);g.beginPath();g.arc(x+Math.cos(a)*r*cw,cy+Math.sin(a)*r*H*0.32,H*0.05,0,7);g.fill()}
    if(flo||p.fruit&&[8,9,10].includes(m))for(let i=0;i<24;i++){const a=rnRand()*6.28,r=Math.sqrt(rnRand());g.fillStyle=p.fruit&&!flo?'#c62828':fcol;g.beginPath();g.arc(x+Math.cos(a)*r*cw,cy+Math.sin(a)*r*H*0.3,H*0.018,0,7);g.fill()}return}
  if(p.t==='graminee'){g.lineWidth=Math.max(1,H/60);for(let i=0;i<34;i++){const dx=(rnRand()-0.5)*H*0.9,hh=H*(0.6+0.4*rnRand());g.strokeStyle=hexMix([9,10,11,12,1,2].includes(m)?'#c8ae7a':leaf,(rnRand()-0.5)*40);g.beginPath();g.moveTo(x+dx*0.15,y);g.quadraticCurveTo(x+dx*0.4,y-hh*0.6,x+dx,y-hh);g.stroke();
    if(flo||[9,10,11].includes(m)){g.fillStyle='rgba(230,214,170,.8)';g.beginPath();g.ellipse(x+dx,y-hh,H*0.02,H*0.06,0,0,7);g.fill()}}return}
  if(p.t==='fougere'){g.strokeStyle=leaf;g.lineWidth=Math.max(1,H/30);for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*0.32;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*H*0.5,y+Math.sin(a)*H*0.9,x+Math.cos(a)*H*0.75,y+Math.sin(a)*H*0.55);g.stroke()}return}
  const w=H*(p.t==='arbuste'?0.5:0.55),n=p.t==='legume'?18:40;for(let i=0;i<n;i++){const a=Math.PI+rnRand()*Math.PI,r=Math.sqrt(rnRand());g.fillStyle=hexMix(leaf,(rnRand()-0.5)*50);g.beginPath();g.arc(x+Math.cos(a)*r*w,y+Math.sin(a)*r*H*0.9,H*0.08,0,7);g.fill()}
  if(flo)for(let i=0;i<(p.t==='annuelle'?30:20);i++){const a=Math.PI+rnRand()*Math.PI,r=0.5+0.5*rnRand();g.fillStyle=hexMix(fcol.startsWith('#')?fcol:'#ffffff',(rnRand()-0.5)*30);g.beginPath();g.arc(x+Math.cos(a)*r*w,y+Math.sin(a)*r*H*0.85,H*0.035,0,7);g.fill()}}
function rnFence(g,s){const f=S.fences[0];if(!f||RN.zone.length<2)return;const c=(FCOL[f.col]||[0,'#444'])[1],M=FM[f.model];
  for(let i=0;i<RN.zone.length-1;i++){const a=RN.zone[i],b=RN.zone[i+1],sa=s(a[1])*f.h,sb=s(b[1])*f.h,seg=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/(s((a[1]+b[1])/2)*M.sp)));
    for(let k=0;k<seg;k++){const t0=k/seg,t1=(k+1)/seg,x0=a[0]+(b[0]-a[0])*t0,y0=a[1]+(b[1]-a[1])*t0,x1=a[0]+(b[0]-a[0])*t1,y1=a[1]+(b[1]-a[1])*t1,h0=sa+(sb-sa)*t0,h1=sa+(sb-sa)*t1;
      g.fillStyle=c;g.globalAlpha=M.open?0.35:0.92;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0,y0-h0);g.lineTo(x1,y1-h1);g.lineTo(x1,y1);g.closePath();g.fill();g.globalAlpha=1;
      if(M.open){g.strokeStyle=c;g.lineWidth=1;for(let j=1;j<10;j++){const u=j/10;g.beginPath();g.moveTo(x0+(x1-x0)*u,y0+(y1-y0)*u);g.lineTo(x0+(x1-x0)*u,y0+(y1-y0)*u-(h0+(h1-h0)*u));g.stroke()}}
      g.fillStyle=c;g.fillRect(x0-2,y0-h0-3,4,h0+3)}}}
function renderRender(){const c=$('#rnCanvas');if(!c||!RN.img)return;const g=c.getContext('2d');c.width=RN.img.width;c.height=RN.img.height;g.drawImage(RN.img,0,0);const Z=RN.zone,lw=Math.max(2,c.width/400);
  if(RN.out&&RN.closed||RN.out&&RN.what==='cloture'){g.drawImage(RN.out,0,0)}
  if(!RN.out||$('#rnShowZone').checked){g.strokeStyle='#ffd54f';g.lineWidth=lw;g.setLineDash([lw*3,lw*2]);g.beginPath();Z.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));if(RN.closed)g.closePath();g.stroke();g.setLineDash([]);
    Z.forEach((p,i)=>{g.fillStyle=i?'#ffd54f':'#ff7043';g.beginPath();g.arc(p[0],p[1],lw*(i?2.5:4),0,7);g.fill()})}
  $('#rnStep').textContent=RN.what==='cloture'?(Z.length<2?'Cliquez le pied de la clôture, d’un bout à l’autre (au moins 2 points).':'Cliquez « Générer » quand la ligne est tracée.'):RN.closed?'Zone fermée : choisissez les réglages puis « Générer le photomontage ».':Z.length<3?'Cliquez le contour de la zone à planter sur la photo (au moins 3 points).':'Cliquez le premier point (orange) pour fermer la zone.';
  $('#rnGen').disabled=!(RN.closed||RN.what==='cloture'&&Z.length>=2);$('#rnAI').disabled=!RN.out;$('#rnDl').disabled=!RN.out;$('#rnAdd').disabled=!RN.out}
function generateRender(){const c=document.createElement('canvas');c.width=RN.img.width;c.height=RN.img.height;const g=c.getContext('2d'),Z=RN.zone;RN.seed=7;
  const ys=Z.map(p=>p[1]),yT=Math.min(...ys),yB=Math.max(...ys),xs=Z.map(p=>p[0]),wPx=Math.max(...xs)-Math.min(...xs);
  const wm=parseFloat($('#rnW').value)||RN.widthM||5,dep=parseFloat($('#rnDepth').value)||0;RN.month=+$('#rnMonth').value;const sB=wPx/wm,s=y=>sB*(1-dep*(yB-y)/Math.max(1,yB-yT));
  if(RN.what==='cloture'){rnFence(g,s);RN.out=c;renderRender();return}
  if($('#rnMulch').checked){g.save();g.beginPath();Z.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.clip();g.fillStyle='rgba(92,64,42,.55)';g.fillRect(0,0,c.width,c.height);
    for(let i=0;i<1500;i++){g.fillStyle=`rgba(${60+rnRand()*60},${40+rnRand()*40},${25+rnRand()*25},.6)`;g.fillRect(Math.min(...xs)+rnRand()*wPx,yT+rnRand()*(yB-yT),2,2)}g.restore()}
  const items=rnItems();if(!items.length){toast('Rien à représenter : composez d’abord cet élément du projet.');return}
  const areaM=Math.max(1,wm*wm*((yB-yT)/Math.max(1,wPx))*1.6),tot=items.reduce((a,x)=>a+x.q,0),k=Math.min(1,160/tot);
  const inst=[];items.sort((a,b)=>(b.p.h||0)-(a.p.h||0)).forEach((x,ri)=>{const n=Math.max(1,Math.round(x.q*k));for(let i=0;i<n;i++)inst.push({p:x.p,rank:ri/Math.max(1,items.length-1)})});
  const pts=[];inst.forEach(it=>{let y,x,tries=0;do{const band=RN.what==='massif'&&$('#rnDispo').value==='layer'?it.rank:rnRand();y=yT+(yB-yT)*Math.min(0.98,Math.max(0.03,band*0.8+rnRand()*0.2));const X=rnPolyX(y);if(X.length>=2){const j=Math.floor(rnRand()*(X.length/2))*2;x=X[j]+(X[j+1]-X[j])*(0.05+0.9*rnRand())}tries++}while(x==null&&tries<20);if(x!=null)pts.push({...it,x,y})});
  pts.sort((a,b)=>a.y-b.y).forEach(o=>rnPlant(g,o.p,o.x,o.y,s(o.y)));RN.out=c;RN.ai=null;$('#rnAiOut').innerHTML='';renderRender()}
function rnMaskB64(){const c=document.createElement('canvas');c.width=RN.img.width;c.height=RN.img.height;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='destination-out';
  g.beginPath();const Z=RN.zone;if(RN.what==='cloture'){const ys=Z.map(p=>p[1]);g.moveTo(Z[0][0],Z[0][1]);Z.forEach(p=>g.lineTo(p[0],p[1]-c.height*0.35));Z.slice().reverse().forEach(p=>g.lineTo(p[0],p[1]+4))}else{Z.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath()}g.fill();
  /* marge au-dessus de la zone pour les plantes hautes */
  if(RN.what!=='cloture'){const ys=Z.map(p=>p[1]),xs=Z.map(p=>p[0]),yT=Math.min(...ys);g.fillRect(Math.min(...xs),Math.max(0,yT-c.height*0.25),Math.max(...xs)-Math.min(...xs),c.height*0.25)}
  return c.toDataURL('image/png').split(',')[1]}
function rnPrompt(){const its=rnItems().slice(0,10),mo=MOL[RN.month-1];
  const list=its.map(x=>`${x.p.n} (${x.p.l}, about ${nf(x.p.h||0.5,1)} m tall${x.p.c&&x.p.c.find(c=>c!=='vert')&&COL[x.p.c.find(c=>c!=='vert')]?', '+COL[x.p.c.find(c=>c!=='vert')][0].toLowerCase()+' flowers':''})`).join('; ');
  if(RN.what==='cloture'){const f=S.fences[0];return `Photorealistic edit of this garden photo: add a ${FM[f.model].l} fence, ${nf(f.h,2)} m high, colour ${(FCOL[f.col]||['natural'])[0]}, ${FFORM[f.form]}, standing along the marked line. Keep everything else unchanged, match the light and perspective.`}
  return `Photorealistic garden visualisation. In the masked area, replace the rough painted plants with real, healthy plants as they look in ${mo} (Belgium), keeping their layout, scale and colours: ${list}. Style: ${S.lastCompo&&RN.what==='massif'?S.lastCompo.st.l:RN.what}. Add a natural mulch or soil surface. Keep the rest of the photo strictly unchanged and match its light, shadows and perspective.`}
async function aiRender(){if(AST.mode!=='proxy'||!AST.proxy){$('#rnAiOut').innerHTML='<p class="koo">Le rendu par IA passe par votre serveur relais (réglages de l’assistant ⚙ → « serveur relais ») et une clé de génération d’images placée dans ce serveur. Voir la note ci-dessous.</p>';return}
  const c=document.createElement('canvas');c.width=RN.img.width;c.height=RN.img.height;const g=c.getContext('2d');g.drawImage(RN.img,0,0);if(RN.out)g.drawImage(RN.out,0,0);
  $('#rnAiOut').innerHTML='<p class="state">Génération du rendu réaliste (30 à 90 secondes)…</p>';$('#rnAI').disabled=true;
  try{const u=AST.proxy.replace(/\/+$/,'')+'/image',r=await fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({image:c.toDataURL('image/png').split(',')[1],mask:rnMaskB64(),prompt:rnPrompt()})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));if(!j.b64)throw new Error('pas d’image reçue');
    RN.ai='data:image/png;base64,'+j.b64;$('#rnAiOut').innerHTML=`<img src="${RN.ai}" alt="Rendu réaliste par IA" class="rnimg"><div class="chips"><button type="button" id="rnAiDl">Télécharger</button><button type="button" id="rnAiAdd">Ajouter au rapport</button></div><p class="note">Image générée par IA à partir de votre photo : les plantes sont suggérées, pas garanties à l’identique.</p>`}
  catch(e){$('#rnAiOut').innerHTML=`<p class="koo">Rendu IA impossible : ${esc(e.message)}.</p>`}finally{$('#rnAI').disabled=!RN.out}}
function rnComposite(){const c=document.createElement('canvas'),k=Math.min(1,1400/RN.img.width);c.width=Math.round(RN.img.width*k);c.height=Math.round(RN.img.height*k);const g=c.getContext('2d');g.drawImage(RN.img,0,0,c.width,c.height);if(RN.out)g.drawImage(RN.out,0,0,c.width,c.height);return c.toDataURL('image/jpeg',0.85)}
function rnAddReport(url,ai){S.renders.push({url,ai:!!ai,what:RN.what,month:RN.month});if(S.renders.length>4)S.renders.shift();renderRnList();toast('Rendu ajouté au rapport PDF')}
function renderRnList(){const b=$('#rnList');if(!b)return;b.innerHTML=S.renders.length?S.renders.map((r,i)=>`<figure><img src="${r.url}" alt="Rendu ${i+1}"><figcaption>${r.ai?'IA':'Photomontage'} · ${esc(MOL[r.month-1])} <button type="button" data-rnrm="${i}">Retirer</button></figcaption></figure>`).join(''):'<p class="empty">Aucun rendu ajouté au rapport.</p>'}
$('#rendu').addEventListener('click',e=>{const id=e.target.id;
  if(id==='rnPick')$('#rnFile').click();if(id==='rnReset'){RN.zone=[];RN.closed=false;RN.out=null;renderRender()}if(id==='rnUndo'){RN.zone.pop();RN.closed=false;RN.out=null;renderRender()}
  if(id==='rnGen')generateRender();if(id==='rnAI')aiRender();
  if(id==='rnDl'){const a=document.createElement('a');a.href=rnComposite();a.download='plantania-rendu.jpg';a.click()}if(id==='rnAdd')rnAddReport(rnComposite(),false);
  if(id==='rnAiDl'){const a=document.createElement('a');a.href=RN.ai;a.download='plantania-rendu-ia.png';a.click()}if(id==='rnAiAdd')rnAddReport(RN.ai,true);
  if(e.target.dataset.rnrm!=null){S.renders.splice(+e.target.dataset.rnrm,1);renderRnList()}});
$('#rendu').addEventListener('change',e=>{if(e.target.id==='rnWhat'){RN.what=e.target.value;RN.out=null;if(RN.what==='cloture')RN.closed=false;rnDefaults();renderRender()}if(['rnMonth','rnDepth','rnW','rnMulch','rnDispo'].includes(e.target.id)&&RN.out)generateRender();if(e.target.id==='rnShowZone')renderRender()});
$('#rnFile').addEventListener('change',async e=>{const s=await photoIn(e.target,1600);if(!s)return;RN.url=s.url;RN.zone=[];RN.closed=false;RN.out=null;const im=new Image();im.onload=()=>{RN.img=im;$('#rnWrap').hidden=false;renderRender()};im.src=s.url});
$('#rnCanvas').addEventListener('click',e=>{if(!RN.img)return;const c=e.currentTarget,r=c.getBoundingClientRect(),p=[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height];
  if(RN.what!=='cloture'){if(RN.closed)return;if(RN.zone.length>=3&&Math.hypot(p[0]-RN.zone[0][0],p[1]-RN.zone[0][1])<c.width/40){RN.closed=true;renderRender();return}}RN.zone.push(p);RN.out=null;renderRender()});
function rnDefaults(){const W=$('#rnW');if(!W)return;let w=5;if(RN.what==='massif'&&S.bed){const ll=S.bed.ll,lo=ll.map(p=>p[1]*111320*Math.cos(p[0]*R));w=Math.max(...lo)-Math.min(...lo)}else if(RN.what==='haie'&&S.hedges[0])w=lenLL(S.hedges[0].pts);else if(RN.what==='cloture'&&S.fences[0])w=lenLL(S.fences[0].pts);else if(RN.what==='verger'&&S.orchards[0]){const ll=S.orchards[0].pts,lo=ll.map(p=>p[1]*111320*Math.cos(p[0]*R));w=Math.max(...lo)-Math.min(...lo)}
  W.value=Math.round(Math.max(1,Math.min(200,w))*10)/10}
function renderRendu(){const sel=$('#rnWhat');if(!sel)return;const o=rnSources(),v=sel.value||RN.what;sel.innerHTML=o.map(([k,l])=>`<option value="${k}">${esc(l)}</option>`).join('')||'<option value="massif">Massif</option>';if(o.some(x=>x[0]===v))sel.value=v;RN.what=sel.value;
  if(!$('#rnMonth').dataset.init){$('#rnMonth').innerHTML=MOL.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('');$('#rnMonth').value=String(RN.month);$('#rnMonth').dataset.init=1;rnDefaults()}renderRnList()}
{const _rv10=renderV4;renderV4=function(){_rv10();renderRendu()}}
{const _cr9=collectReport;collectReport=async function(){const R=await _cr9();R.renders=S.renders.slice();return R}}
{const _rh=reportHtml;reportHtml=function(R){const h=_rh(R);if(!R.renders||!R.renders.length)return h;
  const pg=R.renders.map((r,i)=>`<section class="pg"><h2>RENDU ${i+1} — ${r.ai?'IMAGE GÉNÉRÉE PAR IA':'PHOTOMONTAGE'}</h2><img class="fig" style="max-height:150mm;width:100%;object-fit:contain" src="${r.url}" alt=""><p class="small">${r.ai?'Image générée par intelligence artificielle à partir de la photo du site : illustration non contractuelle.':'Photomontage indicatif des plantes du projet, à l’échelle approximative'} · ${xe(MOL[r.month-1])}.</p></section>`).join('');
  const i=h.lastIndexOf('<section class="pg ');return i>0?h.slice(0,i)+pg+h.slice(i):h.replace('</body>',pg+'</body>')}}

$('#finishBed').addEventListener('click',e=>{e.stopImmediatePropagation();finishShape()},true);
STEPS[0][1]='Placez votre terrain, dessinez sa limite et ce qui existe déjà (bâtiments, arbres, chemins), puis lisez la synthèse : climat, sol, lumière et biodiversité.';
STEPMORE[4].push(['cloture','Clôture'],['sante','Santé des plantes'],['rendu','Rendus sur photo']);STEPMORE[5]=[['primes','Primes et subsides'],['rendu','Rendus sur photo']];
renderFences();renderPrimes();renderRendu();renderDisShots();renderDisHist();renderHosts();

/* ================= v9 : synthèse retirée, rapport ajusté au projet ================= */
$('#synthese').classList.add('gone');{const b=document.querySelector('#tabs [data-tab=synthese]');if(b)b.hidden=true}
for(let i=TUTO.length-1;i>=0;i--)if(TUTO[i][1]==='synthese')TUTO.splice(i,1);
STEPS[0][1]='Placez votre terrain, dessinez sa limite et ce qui existe déjà (bâtiments, arbres, chemins). Climat, sol et ensoleillement sont calculés automatiquement.';
const hasPlantings=()=>!!((massifOn()&&S.lastCompo)||S.hedges.length||S.boxes.length||S.potagers.length||(S.veg.touched&&wantOn('potager'))||S.orchards.length||S.fruits.length||S.vines.length||lawnArea()>0||S.ponds.length||S.taluses.length||(S.maint&&S.maint.some(m=>m.plants&&m.plants.length)));
{const _ss9=stepSecs;stepSecs=function(n){let s=_ss9(n).filter(x=>x!=='synthese');if(n===4){if(!hasPlantings()&&!wantOn('massif'))s=s.filter(x=>x!=='machines');if(wantOn('entretien')&&!s.includes('entretien'))s.unshift('entretien')}if(n===5&&!primesOk().length)s=s.filter(x=>x!=='primes');return s}}
{const _vs12=v4Sections;v4Sections=function(){let o=_vs12().filter(x=>!/^SYNTHÈSE/.test(x.title));if(!hasPlantings())o=o.filter(x=>!/^(SOL : REMBLAI|SANTÉ DES PLANTES)/.test(x.title));return o}}
{const _xb=xlsxBlob;xlsxBlob=function(sh){let s=sh.filter(x=>x.name!=='Synthèse du site');if(!hasPlantings())s=s.filter(x=>!['Matériel','Entretien','Plantes adaptées au site'].includes(x.name));return _xb(s)}}
{const _mc=machines;machines=function(){if(!hasPlantings())return[];if(massifOn())return _mc();const c=S.lastCompo;S.lastCompo=null;try{return _mc()}finally{S.lastCompo=c}}}
{const _cr10=collectReport;collectReport=async function(){const R=await _cr10();const pl=hasPlantings();R.noSite=!pl;if(!massifOn())R.cal=[];if(!pl){R.cal=[];R.checks=[];R.mach=[]}return R}}
{const _rh9=reportHtml;reportHtml=function(R){let h=_rh9(R);
  if(R.noSite)h=h.replace(/<section class="pg ">\s*<h2>LE SITE<\/h2>[\s\S]*?<\/section>/,'');
  if(!R.mach||!R.mach.length)h=h.replace('<h2>MATÉRIEL D’ENTRETIEN ET SOURCES</h2><table class="tb"><thead><tr><th>Matériel</th><th>Pour</th><th>Conseil</th></tr></thead><tbody></tbody></table>','<h2>SOURCES</h2>');
  return h}}

/* ================= v9 : suggestions d'adresse pendant la saisie (Photon) ================= */
function addrSuggest(input,onPick){const wrap=document.createElement('div');wrap.className='acwrap';input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
  const ul=document.createElement('ul');ul.className='aclist';ul.setAttribute('role','listbox');ul.hidden=true;wrap.appendChild(ul);input.setAttribute('autocomplete','off');input.setAttribute('aria-autocomplete','list');
  let tm=null,res=[],act=-1,tok=0;const close=()=>{ul.hidden=true;act=-1};
  const lab=p=>{const a=[p.name,[p.street,p.housenumber].filter(Boolean).join(' ')].filter(Boolean),b=[p.postcode,p.city||p.county].filter(Boolean).join(' ');return{main:a.filter((x,i)=>a.indexOf(x)===i).join(', ')||b,sub:[b,p.country].filter(Boolean).join(' · ')}};
  const show=()=>{if(!res.length){close();return}ul.innerHTML=res.map((r,i)=>`<li role="option" data-i="${i}" aria-selected="${i===act}"><b>${esc(r.main)}</b><small>${esc(r.sub)}</small></li>`).join('');ul.hidden=false};
  const pick=i=>{const r=res[i];if(!r)return;input.value=r.main+(r.sub?', '+r.sub.split(' · ')[0]:'');close();onPick(r)};
  input.addEventListener('input',()=>{clearTimeout(tm);const q=input.value.trim();if(q.length<3){res=[];close();return}
    tm=setTimeout(async()=>{const t=++tok;try{const c=S.lat!=null?`&lat=${S.lat.toFixed(3)}&lon=${S.lon.toFixed(3)}`:'&lat=50.6&lon=4.6';const r=await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=fr${c}`);const j=await r.json();if(t!==tok)return;
      res=(j.features||[]).map(f=>({lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0],...lab(f.properties||{})}));act=-1;show()}catch(e){}},350)});
  input.addEventListener('keydown',e=>{if(ul.hidden)return;if(e.key==='ArrowDown'){act=Math.min(res.length-1,act+1);show();e.preventDefault()}else if(e.key==='ArrowUp'){act=Math.max(0,act-1);show();e.preventDefault()}else if(e.key==='Escape')close();else if(e.key==='Enter'&&act>=0){e.preventDefault();e.stopImmediatePropagation();pick(act)}});
  ul.addEventListener('mousedown',e=>{const li=e.target.closest('li');if(li){e.preventDefault();pick(+li.dataset.i)}});
  input.addEventListener('blur',()=>setTimeout(close,150));
  input.form&&input.form.addEventListener('submit',e=>{if(!ul.hidden&&res.length&&act<0&&res.length===1){e.preventDefault();e.stopImmediatePropagation();pick(0)}else close()},true)}
addrSuggest($('#q'),r=>{$('#results').innerHTML='';setSite(r.lat,r.lon,true)});
addrSuggest($('#mq'),r=>{$('#mresults').innerHTML='';setSite(r.lat,r.lon,true)});

/* ================= v9 : clôtures — poteaux enfoncés, crampillons, béton en sacs ou en vrac ================= */
{const _fc=fenceCalc;fenceCalc=function(f){const C=_fc(f),M=FM[f.model];f.bet=f.bet||'sacs';
  const i=C.rows.findIndex(r=>r[0]==='Béton pour scellement');if(i>=0)C.rows.splice(i,1);
  if(f.fix==='beton'&&f.model!=='gabion'){const V=Math.ceil(C.posts*(f.form==='pleine'||f.h>1.5?0.05:0.035)*1000)/1000;
    if(f.bet==='vrac')C.rows.push(['Béton en vrac',Math.ceil(V*100)/100,'m³','dosé à 350 kg/m³ ; livré en camion (souvent 0,5 m³ minimum) ou fait sur place'],['Ciment (sacs de 25 kg)',Math.ceil(V*350/25),'sac(s)','si vous gâchez vous-même'],['Sable 0/2',Math.ceil(V*650),'kg',''],['Gravier 4/14',Math.ceil(V*1150),'kg',''],['Eau',Math.ceil(V*175),'litre(s)','']);
    else C.rows.push(['Béton prêt à l’emploi (sacs de 25 kg)',Math.ceil(V/0.0115),'sac(s)',`≈ ${nf(V*1000)} L ; environ ${nf(Math.ceil(V/0.0115)/Math.max(1,C.posts),1)} sac(s) par poteau (trou de 25 × 25 × ${f.form==='pleine'||f.h>1.5?80:60} cm)`])}
  if(f.fix==='enfonce'){const j=C.rows.findIndex(r=>/^(Poteaux|Piquets)/.test(r[0]));if(j>=0)C.rows[j]=[`Poteaux en bois pointés ${nf(f.h+0.8,1)} m`,C.rows[j][1],'pièce(s)','châtaignier, acacia (robinier) ou pin traité classe 4, enfoncés de 70 à 80 cm'];
    else C.rows.unshift([`Poteaux en bois pointés ${nf(f.h+0.8,1)} m`,C.posts,'pièce(s)','enfoncés de 70 à 80 cm']);
    C.rows.push(['Enfonce-pieux ou masse (location)',1,'pièce','avec une barre à mine pour préparer l’avant-trou en sol caillouteux'])}
  if(f.model==='ganivelle'){const n=f.h>1.2?3:2;C.rows.push(['Clous cavaliers (crampillons) galvanisés 40 mm',C.posts*n,'pièce(s)',`${n} par poteau, à cheval sur les fils de la ganivelle`],['Fil de tension galvanisé 2,7 mm',Math.ceil(C.net*n*1.05),'m',`${n} rangs, pour tendre la ganivelle entre les poteaux d’about`],['Tendeurs (raidisseurs)',(1+C.angles)*n*2,'pièce(s)','aux extrémités et aux angles'],['Jambes de force',2+C.angles*2,'pièce(s)','aux extrémités et aux angles'],['Ligatures de raccord entre rouleaux',Math.max(0,Math.ceil(C.net/5)-1)*n,'pièce(s)','fil galvanisé torsadé'])}
  else if((f.model==='fils'||f.model==='souple')&&(f.fix==='enfonce'||f.model==='fils')){const n=f.model==='fils'?(f.h>1?4:3):(f.h>1.2?3:2);C.rows.push(['Clous cavaliers (crampillons) galvanisés',C.posts*n,'pièce(s)',`${n} par poteau bois, pour fixer les fils`])}
  return C}}
{const _fa=fenceAdvice;fenceAdvice=function(f){const a=_fa(f);if(f.fix==='enfonce'){a.unshift('Poteaux enfoncés : possible en sol meuble à moyen ; en sol très caillouteux ou très argileux, faites un avant-trou à la barre à mine. Pour une clôture pleine ou de plus de 1,50 m, préférez le scellement au béton (prise au vent).');if(!['fils','ganivelle','lisses','souple','bois'].includes(f.model))a.unshift('Ce modèle se fixe normalement sur des poteaux scellés ou sur platine ; l’enfoncement convient surtout aux poteaux en bois.')}return a}}
{const _fcd=fenceCard;fenceCard=function(f,i){f.bet=f.bet||'sacs';let h=_fcd(f,i);
  h=h.replace(`<option value="platine"${f.fix==='platine'?' selected':''}>Poteaux sur platine (dalle, muret)</option>`,`<option value="platine"${f.fix==='platine'?' selected':''}>Poteaux sur platine (dalle, muret)</option><option value="enfonce"${f.fix==='enfonce'?' selected':''}>Poteaux en bois pointés, enfoncés sans béton</option>`);
  if(f.fix==='beton')h=h.replace('<label>Portillons',`<label>Béton<select data-ff="bet"><option value="sacs"${f.bet==='sacs'?' selected':''}>En sacs prêts à l’emploi</option><option value="vrac"${f.bet==='vrac'?' selected':''}>En vrac (livré ou fait sur place)</option></select></label><label>Portillons`);
  return h}}

$('#cloture').addEventListener('change',e=>{if(e.target.dataset.ff!=='model')return;const c=e.target.closest('[data-fid]'),f=c&&S.fences.find(x=>x.id==c.dataset.fid);if(f&&['ganivelle','fils','lisses'].includes(f.model)&&f.fix==='beton'){f.fix='enfonce';renderFences();toast('Poteaux en bois enfoncés proposés pour ce modèle (modifiable dans « Fixation »).')}});
/* ================= v9 : primes seulement si disponibles ================= */
const primesOk=()=>{try{return subsidies().filter(s=>s.ok)}catch(e){return[]}};
{const _rp=renderPrimes;renderPrimes=function(){const box=$('#primesBox');if(!box)return;const L=primesOk();
  box.innerHTML=L.map(s=>`<div class="card"><h4>${esc(s.t)} <small class="src">${esc(s.reg)}</small></h4><p><b>${esc(s.amt)}</b></p><ul class="small">${s.cond.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><p><a href="${esc(s.url)}" target="_blank" rel="noopener">Démarche et conditions officielles</a></p></div>`).join('')+(L.length?`<p class="note">Montants indicatifs calculés à partir de votre tracé, d’après les barèmes publiés ; seules les administrations peuvent confirmer l’éligibilité. Vérifiez toujours les conditions à jour avant de planter : certaines aides exigent une demande préalable ou des espèces précises.</p>`:'');
  const b=document.querySelector('#tabs [data-tab=primes]');if(b)b.hidden=!L.length;$('#primes').classList.toggle('gone',!L.length);}}

/* ================= v9 : onglet Entretien (photos du jardin) ================= */
S.maint=S.maint||[];const MT={busy:false};
const GENCARE={
 arbre:{taille:'Taille légère en fin d’hiver (hors gel) : bois mort, branches qui se croisent. Pas de taille sévère.',arrosage:'Arrosage profond les 2–3 premières années en été sec (50 L tous les 10 jours), ensuite rarement.',fert:'Paillage organique au pied chaque automne ; pas d’engrais pour un arbre installé.',prot:'Contrôler le tuteur et la protection du tronc des jeunes arbres.',m:[[2,'Supprimer le bois mort'],[4,'Renouveler le paillage au pied'],[7,'Arroser en profondeur si sécheresse (jeunes arbres)']]},
 arbuste:{taille:'Floraison de printemps : tailler juste après la floraison. Floraison d’été : tailler en fin d’hiver. Persistants : taille légère de forme au printemps.',arrosage:'Arroser la première année ; ensuite seulement en sécheresse prolongée.',fert:'Compost en surface au printemps.',prot:'Surveiller pucerons et cochenilles au printemps.',m:[[3,'Taille des arbustes à floraison estivale'],[4,'Compost au pied'],[6,'Taille après floraison des arbustes de printemps']]},
 vivace:{taille:'Couper les tiges sèches en fin d’hiver (les laisser l’hiver pour la faune) ; supprimer les fleurs fanées pour prolonger la floraison.',arrosage:'Arroser au pied par temps sec, le matin.',fert:'Un peu de compost au printemps ; diviser les touffes tous les 3–4 ans.',prot:'Limaces au printemps sur les jeunes pousses.',m:[[3,'Rabattre les tiges sèches'],[4,'Compost et paillage'],[6,'Supprimer les fleurs fanées'],[10,'Diviser les grosses touffes (tous les 3–4 ans)']]},
 graminee:{taille:'Rabattre à 10–15 cm en fin d’hiver (graminées caduques) ; peigner à la main les persistantes.',arrosage:'Rarement nécessaire une fois installées.',fert:'Pas d’engrais : les graminées s’affaissent si le sol est trop riche.',prot:'Peu de problèmes.',m:[[3,'Rabattre avant la repousse'],[11,'Laisser les épis en hiver']]},
 fougere:{taille:'Retirer les vieilles frondes avant la sortie des crosses.',arrosage:'Sol toujours frais : arroser en été sec.',fert:'Feuilles mortes ou compost de feuilles en paillage.',prot:'Ombre ou mi-ombre : éviter le soleil de midi.',m:[[3,'Retirer les vieilles frondes'],[7,'Arroser si sécheresse']]},
 annuelle:{taille:'Supprimer les fleurs fanées chaque semaine.',arrosage:'Arrosage régulier, surtout en pot.',fert:'Engrais liquide pour fleurs toutes les 2 semaines en pot.',prot:'Pucerons, limaces.',m:[[5,'Planter après les Saints de glace'],[7,'Fleurs fanées et engrais liquide'],[10,'Arracher après les gelées']]},
 rosier:{taille:'Taille principale en mars (à la floraison des forsythias), au-dessus d’un œil tourné vers l’extérieur ; supprimer les fleurs fanées en été.',arrosage:'Au pied, sans mouiller le feuillage.',fert:'Compost ou engrais organique en mars et après la première floraison.',prot:'Maladie des taches noires et oïdium : ramasser les feuilles atteintes, purin de prêle en préventif.',m:[[3,'Taille des rosiers'],[4,'Engrais organique'],[6,'Supprimer les fleurs fanées'],[11,'Butter le pied des rosiers greffés']]},
 haie:{taille:'Deux tailles par an : fin juin et septembre. Pas de taille du 15 mars au 31 juillet si des oiseaux nichent.',arrosage:'Arroser les jeunes haies les 2 premiers étés.',fert:'Paillage sur le rang.',prot:'Buis : surveiller la pyrale de mai à octobre.',m:[[6,'Première taille (après la nidification si possible)'],[9,'Seconde taille'],[11,'Pailler le pied de la haie']]},
 fruitier:{taille:'Taille de fructification en hiver (pommiers, poiriers) ; pruniers et cerisiers après la récolte, par temps sec.',arrosage:'Arroser les jeunes arbres en été sec.',fert:'Compost bien mûr au pied en fin d’hiver.',prot:'Ramasser fruits momifiés et feuilles tavelées ; bandes-pièges contre le carpocapse.',m:[[2,'Taille d’hiver des pommiers et poiriers'],[3,'Compost au pied'],[6,'Éclaircir les fruits trop nombreux'],[8,'Taille des pruniers et cerisiers après récolte'],[11,'Ramasser feuilles et fruits tombés']]},
 grimpante:{taille:'Palisser les nouvelles tiges ; tailler selon l’espèce (glycine : en été puis en hiver ; clématites selon leur groupe).',arrosage:'Pied à l’ombre et au frais, arroser en été.',fert:'Compost au pied au printemps.',prot:'Vérifier les attaches et le support.',m:[[2,'Taille d’hiver'],[5,'Palisser les nouvelles pousses'],[7,'Taille d’été (glycine)']]},
 gazon:{taille:'Tondre à 5–6 cm, plus haut en été sec ; laisser une bande non tondue pour la faune.',arrosage:'Inutile : le gazon jaunit en été puis repart.',fert:'Laisser l’herbe coupée sur place (mulching).',prot:'Mousse : aérer et améliorer le drainage plutôt que traiter.',m:[[4,'Scarifier si beaucoup de mousse'],[5,'Première tonte haute'],[9,'Regarnir les zones dégarnies']]},
 legume:{taille:'Tuteurer et pincer selon les légumes (tomates : supprimer les gourmands).',arrosage:'Arrosage régulier au pied, le matin ; pailler.',fert:'Compost à la plantation ; rotation des cultures.',prot:'Mildiou des tomates : abriter de la pluie.',m:[[3,'Préparer les planches et le compost'],[5,'Plantations après les gelées'],[7,'Arrosage et paillage'],[10,'Engrais vert sur les planches libérées']]},
 aromatique:{taille:'Tailler légèrement après la floraison, sans couper dans le vieux bois (lavande, thym, romarin).',arrosage:'Très peu : craint l’excès d’eau.',fert:'Aucun engrais.',prot:'Sol drainant indispensable, soleil.',m:[[4,'Légère taille de nettoyage'],[8,'Taille après floraison']]},
 bulbe:{taille:'Laisser jaunir le feuillage après la floraison (6 semaines) avant de le couper.',arrosage:'Aucun en général.',fert:'Un peu de compost à la plantation.',prot:'Planter à 2–3 fois la hauteur du bulbe.',m:[[6,'Couper le feuillage jauni'],[10,'Planter les bulbes de printemps']]}};
const GEN_TYPE={Rosa:'rosier',Malus:'fruitier',Pyrus:'fruitier',Prunus:'fruitier',Cydonia:'fruitier',Ficus:'fruitier',Ribes:'fruitier',Vitis:'grimpante',Clematis:'grimpante',Wisteria:'grimpante',Hedera:'grimpante',Parthenocissus:'grimpante',Lonicera:'grimpante',Jasminum:'grimpante',Lavandula:'aromatique',Thymus:'aromatique',Salvia:'vivace',Rosmarinus:'aromatique',Origanum:'aromatique',Carpinus:'haie',Ligustrum:'haie',Taxus:'haie',Thuja:'haie',Buxus:'haie',Fagus:'haie',Tulipa:'bulbe',Narcissus:'bulbe',Allium:'bulbe',Crocus:'bulbe',Lolium:'gazon',Festuca:'graminee',Poa:'gazon',Solanum:'legume',Cucurbita:'legume',Lactuca:'legume',Brassica:'legume',Phaseolus:'legume',Daucus:'legume'};
const SPECIAL={Hydrangea:'Hortensia : couper les fleurs fanées en mars juste au-dessus d’une paire de gros bourgeons ; arroser abondamment en été (eau de pluie).',Lavandula:'Lavande : tailler en arrondi après la floraison, au-dessus du vieux bois, jamais dedans.',Buddleja:'Buddléia : plante invasive en Belgique ; couper les fleurs fanées avant les graines, ou la remplacer.',Wisteria:'Glycine : raccourcir les longues pousses à 5–6 feuilles en juillet, puis à 2–3 bourgeons en février.',Clematis:'Clématite : la taille dépend du groupe (printemps : après floraison ; grandes fleurs : légère en février ; été : sévère en février).',Buxus:'Buis : pièges à phéromones contre la pyrale, taille par temps sec et couvert.',Prunus:'Pruniers et cerisiers : tailler en été, par temps sec, pour limiter les maladies (gomme, plomb).',Rosa:'Rosier : choisir des variétés résistantes aux maladies ; enlever les feuilles tachées.'};
function careFor(l,typeHint){const g=genusOf(l),two=String(l||'').split(/\s+/).slice(0,2).join(' ');const p=PL.find(x=>x.l.split(' ').slice(0,2).join(' ')===two)||null;
  let t=GEN_TYPE[g]||(typeHint&&GENCARE[typeHint]?typeHint:null)||(p&&GENCARE[p.t]?p.t:null)||'arbuste';if(p&&p.t==='graminee'&&!GEN_TYPE[g])t='graminee';
  let G=GENCARE[t];const m=new Map();
  if(t==='arbuste'&&p){G={...G,taille:p.pers?'Persistant : taille légère de mise en forme au printemps, si nécessaire.':p.f.length&&p.f[0]<=6?'Fleurit au printemps : tailler légèrement juste après la floraison (sinon, vous supprimez les boutons de l’an prochain).':'Fleurit en été : tailler en fin d’hiver, avant la reprise.'}}
  if(t==='arbuste'&&!p)G={...G,m:[[4,'Compost au pied']]};
  (p&&['arbuste','vivace','graminee','fougere'].includes(t)?G.m.filter(([mo,tx])=>!/Taille|Rabattre|Supprimer les fleurs/.test(tx)):G.m).forEach(([mo,tx])=>m.set(mo,[...(m.get(mo)||[]),tx]));if(p&&typeof tasksFor==='function')try{tasksFor(p,'ang').forEach(([mo,tx])=>{const a=m.get(mo)||[];if(!a.includes(tx))m.set(mo,[...a,tx])})}catch(e){}
  return{t,p,G,months:m,special:SPECIAL[g]||''}}
const TYPEL={arbre:'Arbre',arbuste:'Arbuste',vivace:'Vivace',graminee:'Graminée',fougere:'Fougère',annuelle:'Annuelle',rosier:'Rosier',haie:'Haie ou arbuste de haie',fruitier:'Fruitier',grimpante:'Grimpante',gazon:'Gazon',legume:'Légume',aromatique:'Aromatique',bulbe:'Bulbe'};
async function analyseMaint(item){item.st='busy';renderMaint();const eng=$('#mtEngine').value==='auto'?(AST.mode!=='local'?'claude':'plantnet'):$('#mtEngine').value;
  try{if(eng==='plantnet'){const KEY=IDSET.key||PLANTNET_CLE_DU_SITE;if(!KEY)throw new Error('ajoutez une clé Pl@ntNet (onglet Identification) ou activez Claude');const fd=new FormData();fd.append('images',item.blob,'photo.jpg');fd.append('organs','auto');
      const r=await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(KEY)}&lang=fr&include-related-images=false`,{method:'POST',body:fd});const j=await r.json().catch(()=>({}));if(r.status===404)throw new Error('aucune plante reconnue : cadrez une seule plante, de près');if(!r.ok)throw new Error(j.message||('erreur '+r.status));
      const C=(j.results||[]).slice(0,3).map(x=>({l:x.species.scientificNameWithoutAuthor,n:(x.species.commonNames||[])[0]||x.species.scientificNameWithoutAuthor,score:x.score}));
      item.plants=C.length?[{...C[0],alt:C.slice(1)}]:[];item.src='Pl@ntNet'}
    else{const o=await askClaude('Tu es jardinier-paysagiste en Belgique. Identifie les plantes bien visibles sur la photo d’un jardin (au plus 6) et donne pour chacune un entretien adapté au climat belge, en tenant compte de son état visible. Réponds uniquement en JSON : {"plantes":[{"nom":"nom français","latin":"Genre espèce","type":"arbre|arbuste|vivace|graminee|fougere|annuelle|rosier|haie|fruitier|grimpante|gazon|legume|aromatique|bulbe","confiance":0.0,"etat":"bon|moyen|mauvais","observation":"ce que tu vois (taille, maladie, sécheresse…)","conseils":["conseil prioritaire concret","…"]}]}',
      [imgBlock(item.url),{type:'text',text:'Identifie les plantes et conseille leur entretien. Mois actuel : '+MOL[new Date().getMonth()]+'.'}],1200);
      item.plants=(o.plantes||[]).map(x=>({l:x.latin||'',n:x.nom||x.latin||'',score:+x.confiance||0,type:x.type,etat:x.etat,obs:x.observation||'',tips:Array.isArray(x.conseils)?x.conseils.slice(0,4):[]}));item.src='Claude'}
    item.st='ok'}catch(e){item.st='err';item.err=e.message}renderMaint();renderV4()}
function maintCal(){const m=new Map();S.maint.forEach(it=>(it.plants||[]).forEach(p=>{const c=careFor(p.l,p.type);c.months.forEach((ts,mo)=>ts.forEach(t=>{const k=mo+'|'+t,o=m.get(k)||{mo,t,ns:new Set()};o.ns.add(p.n);m.set(k,o)}))}));
  return [...m.values()].sort((a,b)=>a.mo-b.mo)}
function renderMaint(){const box=$('#mtList');if(!box)return;
  box.innerHTML=S.maint.length?S.maint.map((it,i)=>`<div class="card mtcard"><div class="mthead"><img src="${it.thumb}" alt="Photo ${i+1}"><div>${it.st==='busy'?'<p class="state">Analyse en cours…</p>':it.st==='err'?`<p class="koo">Analyse impossible : ${esc(it.err)}.</p>`:it.st==='ok'?`<small class="src">Analyse : ${esc(it.src)} · ${(it.plants||[]).length} plante(s)</small>`:'<p class="note">Pas encore analysée.</p>'}
     <div class="chips"><button type="button" data-mta="go" data-i="${i}"${it.st==='busy'?' disabled':''}>${it.st==='ok'?'Analyser à nouveau':'Analyser'}</button><button type="button" data-mta="rm" data-i="${i}">Retirer</button></div></div></div>
    ${(it.plants||[]).map((p,j)=>{const c=careFor(p.l,p.type);return `<div class="mtplant"><h5>${esc(p.n)} <i class="src">${esc(p.l)}</i> <small>${esc(TYPEL[c.t]||'')}${p.score?` · ${Math.round(p.score*100)} %`:''}</small>${p.etat?` <span class="${p.etat==='bon'?'okk':p.etat==='mauvais'?'koo':''}">état ${esc(p.etat)}</span>`:''}${typeof invOf==='function'&&invOf(p.l)?' '+invBadge(invOf(p.l)):''}</h5>
      ${p.alt&&p.alt.length?`<p class="small">Ou peut-être : ${p.alt.map((a,k)=>`<button type="button" class="linkb" data-mtalt="${i}:${j}:${k}">${esc(a.n)}</button>`).join(', ')}</p>`:''}
      ${p.obs?`<p class="small"><b>Observé :</b> ${esc(p.obs)}</p>`:''}${p.tips&&p.tips.length?`<ul class="small">${p.tips.map(t=>`<li><b>${esc(t)}</b></li>`).join('')}</ul>`:''}
      <ul class="small"><li><b>Taille :</b> ${esc(c.G.taille)}</li><li><b>Arrosage :</b> ${esc(c.G.arrosage)}</li><li><b>Fertilisation :</b> ${esc(c.G.fert)}</li><li><b>À surveiller :</b> ${esc(c.G.prot)}</li>${c.special?`<li><b>Conseil spécifique :</b> ${esc(c.special)}</li>`:''}</ul>
      <p class="small"><b>Calendrier :</b> ${[...c.months].sort((a,b)=>a[0]-b[0]).map(([mo,ts])=>`${MOL[mo-1]} : ${ts.map(esc).join(' ; ')}`).join(' · ')}</p></div>`}).join('')}</div>`).join(''):'<p class="empty">Aucune photo. Prenez une photo d’une plante ou d’un coin du jardin, ou choisissez-en dans votre photothèque.</p>';
  const cal=maintCal(),cb=$('#mtCal');if(cb)cb.innerHTML=cal.length?`<div class="cal">${MOL.map((ml,k)=>{const t=cal.filter(x=>x.mo===k+1);return t.length?`<div class="mo"><h4>${ml[0].toUpperCase()+ml.slice(1)}</h4><ul>${t.map(x=>`<li>${esc(x.t)} <em>— ${[...x.ns].map(esc).join(', ')}</em></li>`).join('')}</ul></div>`:''}).join('')}</div>`:'';
  $('#mtGo').disabled=!S.maint.some(x=>x.st!=='ok'&&x.st!=='busy')}
async function addMaintFiles(files){for(const f of [...files].slice(0,12-S.maint.length)){try{const s=await shrink(f,1280);const c=document.createElement('canvas'),im=new Image();await new Promise(ok=>{im.onload=ok;im.src=s.url});const k=Math.min(1,220/Math.max(im.width,im.height));c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  S.maint.push({id:Date.now()+Math.random(),thumb:c.toDataURL('image/jpeg',0.7),url:s.url,blob:s.blob,st:'new',plants:[]})}catch(e){}}renderMaint()}
$('#entretien').addEventListener('click',e=>{const t=e.target;if(t.id==='mtCam')$('#mtFileCam').click();if(t.id==='mtLib')$('#mtFileLib').click();
  if(t.id==='mtGo'){(async()=>{for(const it of S.maint)if(it.st!=='ok'&&it.blob)await analyseMaint(it)})()}
  const a=t.dataset.mta;if(a){const it=S.maint[+t.dataset.i];if(!it)return;if(a==='rm'){S.maint.splice(+t.dataset.i,1);renderMaint();renderV4()}else if(a==='go'){if(!it.blob){toast('Photo d’un ancien projet : ajoutez-la à nouveau pour la réanalyser.');return}analyseMaint(it)}}
  if(t.dataset.mtalt){const [i,j,k]=t.dataset.mtalt.split(':').map(Number),p=S.maint[i].plants[j],alt=p.alt.splice(k,1)[0];p.alt.push({l:p.l,n:p.n,score:p.score});Object.assign(p,{l:alt.l,n:alt.n,score:alt.score});renderMaint();renderV4()}});
$('#mtFileCam').addEventListener('change',e=>{addMaintFiles(e.target.files);e.target.value=''});$('#mtFileLib').addEventListener('change',e=>{addMaintFiles(e.target.files);e.target.value=''});
{const _ser9=serialize;serialize=function(){const d=_ser9();d.set.maint=S.maint.map(x=>({id:x.id,thumb:x.thumb,st:x.st==='ok'?'ok':'new',src:x.src||'',plants:x.plants||[]}));return d}}
{const _rs9=restoreSettings;restoreSettings=function(t){_rs9(t);S.maint=t&&t.maint?clone(t.maint):[];renderMaint()}}
{const _vs13=v4Sections;v4Sections=function(){const o=_vs13(),pl=S.maint.flatMap(x=>x.plants||[]);if(pl.length){const cal=maintCal();o.push({title:'ENTRETIEN DE VOTRE JARDIN',intro:'Plantes reconnues sur vos photos et entretien conseillé.',tables:[{head:['Plante','Nom latin','Type','État','Taille','Arrosage et fertilisation'],rows:pl.map(p=>{const c=careFor(p.l,p.type);return[p.n,p.l,TYPEL[c.t]||'',p.etat||'—',c.G.taille+(c.special?' '+c.special:''),c.G.arrosage+' '+c.G.fert]}),w:[2000,2000,1200,900,4800,3938]},
  {h:'Calendrier d’entretien',head:['Mois','Travaux','Plantes'],rows:cal.map(x=>[MOL[x.mo-1],x.t,[...x.ns].join(', ')]),w:[1800,7000,6038]}],bullets:pl.flatMap(p=>(p.tips||[]).map(t=>`${p.n} : ${t}`)).slice(0,8),bh:'Conseils prioritaires d’après vos photos'})}return o}}
WANTS.push(['entretien','Entretenir mon jardin existant','Photos analysées : plantes reconnues et entretien conseillé',null]);
STEPMORE[1].push(['entretien','Entretenir mes plantes']);STEPMORE[4].push(['entretien','Entretien par photos']);

/* ================= v9 : Pros et achats — carte des adresses locales (OpenStreetMap) ================= */
const PCAT={pro:['Paysagistes et entrepreneurs de jardins','#2e7d32'],pep:['Pépinières','#6a1b9a'],jar:['Jardineries','#ef6c00'],mat:['Matériaux, bricolage, clôtures','#455a64'],agr:['Coopératives agricoles, fournitures','#8d6e63']};
const PROS={list:null,map:null,layer:null,filt:new Set(Object.keys(PCAT)),r:10};
function proCat(t){if(t.craft==='gardener'||t.craft==='landscaper'||t.office==='landscape_architect'||/paysag|tuinaanleg|landscap/i.test(t.name||''))return'pro';if(t.landuse==='plant_nursery'||/pépini|pepini|kweker|boomkwek/i.test(t.name||''))return'pep';if(t.shop==='garden_centre')return'jar';if(t.shop==='agrarian')return'agr';return'mat'}
async function loadPros(){if(S.lat==null){toast('Placez d’abord le point d’étude.');return}const R_=PROS.r*1000,a=`(around:${R_},${S.lat.toFixed(5)},${S.lon.toFixed(5)})`;$('#prosMapMsg').textContent='Recherche des adresses autour du site…';
  const q=`[out:json][timeout:25];(nwr["craft"~"^(gardener|landscaper)$"]${a};nwr["office"="landscape_architect"]${a};nwr["landuse"="plant_nursery"]["name"]${a};nwr["shop"~"^(garden_centre|agrarian|doityourself|hardware|trade)$"]${a};);out center tags 250;`;
  try{const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q),headers:{'content-type':'application/x-www-form-urlencoded'}});const j=await r.json();
    PROS.list=(j.elements||[]).map(e=>{const t=e.tags||{},la=e.lat||(e.center&&e.center.lat),lo=e.lon||(e.center&&e.center.lon);if(la==null||!t.name)return null;
      return{n:t.name,cat:proCat(t),lat:la,lon:lo,addr:[[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' '),[t['addr:postcode'],t['addr:city']].filter(Boolean).join(' ')].filter(Boolean).join(', '),tel:t.phone||t['contact:phone']||'',web:t.website||t['contact:website']||'',d:llDist([S.lat,S.lon],[la,lo])}}).filter(Boolean).sort((x,y)=>x.d-y.d);
    $('#prosMapMsg').textContent=`${PROS.list.length} adresse(s) dans un rayon de ${PROS.r} km (données OpenStreetMap, à compléter par la recherche Google Maps).`}
  catch(e){PROS.list=[];$('#prosMapMsg').textContent='Carte des adresses indisponible pour le moment : utilisez les liens de recherche ci-dessous.'}renderProsMap()}
function renderProsMap(){const box=$('#prosList');if(!box)return;const L_=(PROS.list||[]).filter(x=>PROS.filt.has(x.cat));
  $('#prosFilt').innerHTML=Object.entries(PCAT).map(([k,[l,c]])=>`<button type="button" data-pc="${k}" aria-pressed="${PROS.filt.has(k)}"><span class="sw" style="background:${c}"></span>${esc(l)} (${(PROS.list||[]).filter(x=>x.cat===k).length})</button>`).join('');
  if(PROS.list&&!PROS.map&&L.map&&$('#prosMap')){try{PROS.map=L.map('prosMap',{scrollWheelZoom:false}).setView([S.lat,S.lon],11);L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{attribution:'© OpenStreetMap, © CARTO',maxZoom:19}).addTo(PROS.map);PROS.layer=L.layerGroup().addTo(PROS.map)}catch(e){}}
  if(PROS.map&&PROS.layer){PROS.layer.clearLayers();L.circleMarker([S.lat,S.lon],{radius:8,color:'#fff',weight:3,fillColor:TC.site,fillOpacity:1}).addTo(PROS.layer).bindTooltip&&0;
    L_.forEach(x=>{const m=L.circleMarker([x.lat,x.lon],{radius:7,color:'#fff',weight:2,fillColor:PCAT[x.cat][1],fillOpacity:.95}).addTo(PROS.layer);if(m.bindPopup)m.bindPopup(`<b>${esc(x.n)}</b><br>${esc(PCAT[x.cat][0])}${x.addr?'<br>'+esc(x.addr):''}${x.tel?'<br>'+esc(x.tel):''}<br><a href="https://www.google.com/maps/dir/?api=1&destination=${x.lat},${x.lon}" target="_blank" rel="noopener">Itinéraire</a>${x.web?` · <a href="${esc(/^https?:/.test(x.web)?x.web:'https://'+x.web)}" target="_blank" rel="noopener">Site web</a>`:''}`)});
    if(PROS.map.invalidateSize)setTimeout(()=>PROS.map.invalidateSize(),60)}
  box.innerHTML=L_.length?`<table class="stack"><thead><tr><th>Nom</th><th>Type</th><th>Adresse</th><th>Distance</th><th></th></tr></thead><tbody>${L_.slice(0,60).map(x=>`<tr><td><b>${esc(x.n)}</b>${x.tel?`<br><small><a href="tel:${esc(x.tel.replace(/\s/g,''))}">${esc(x.tel)}</a></small>`:''}</td><td><span class="sw" style="background:${PCAT[x.cat][1]}"></span> ${esc(PCAT[x.cat][0])}</td><td>${esc(x.addr||'—')}</td><td>${nf(x.d/1000,1)} km</td><td><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x.n+' '+(x.addr||''))}" target="_blank" rel="noopener">Google Maps</a>${x.web?` · <a href="${esc(/^https?:/.test(x.web)?x.web:'https://'+x.web)}" target="_blank" rel="noopener">Site</a>`:''}</td></tr>`).join('')}</tbody></table>`:(PROS.list?'<p class="empty">Aucune adresse de ce type dans la zone : élargissez le rayon ou utilisez les recherches Google Maps.</p>':'')}
$('#prosBox').insertAdjacentHTML('beforebegin',`<div class="card" id="prosMapCard"><h4>Sur la carte : professionnels, pépinières et magasins autour de vous</h4>
   <div class="chips"><label>Rayon<select id="prosR"><option value="5">5 km</option><option value="10" selected>10 km</option><option value="20">20 km</option><option value="35">35 km</option></select></label><button type="button" class="pri" id="prosGo">Afficher les adresses</button></div>
   <div class="chips" id="prosFilt"></div><p class="small" id="prosMapMsg">Cliquez sur « Afficher les adresses » pour voir les entreprises et magasins proches de votre terrain.</p><div id="prosMap" class="prosmap"></div><div id="prosList"></div>
   <p class="note">Adresses issues d’OpenStreetMap, sans classement ni recommandation : vérifiez avis et coordonnées avant de contacter une entreprise.</p></div>`);
function resetProsMap(){const o=$('#prosMap');if(!o)return;const n=document.createElement('div');n.id='prosMap';n.className='prosmap';o.replaceWith(n);PROS.map=null;PROS.layer=null}
$('#pros').addEventListener('click',e=>{if(e.target.id==='prosGo'){PROS.r=+$('#prosR').value;resetProsMap();loadPros();return}const b=e.target.closest('[data-pc]');if(b){const k=b.dataset.pc;PROS.filt.has(k)?PROS.filt.delete(k):PROS.filt.add(k);renderProsMap()}});
{const _ss10=setSite;setSite=function(...a){const r=_ss10(...a);if(PROS.list){PROS.list=null;resetProsMap();$('#prosList').innerHTML='';$('#prosFilt').innerHTML='';$('#prosMapMsg').textContent='Lieu modifié : cliquez sur « Afficher les adresses ».'}return r}}

renderMaint();
/* ================= v10 : vue de face plus réaliste ================= */
const hx=c=>{if(!c||c[0]!=='#')return'#6f9a55';return c.length===4?'#'+[1,2,3].map(i=>c[i]+c[i]).join(''):c};
const shade=(c,d)=>hexMix(hx(c),d);
function blobs(cx,cy,rx,ry,col,n,sz,rnd,top){let s='';const R_=Math.max(1.2,sz);
  for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd()),x=cx+Math.cos(a)*r*rx,y=cy+Math.sin(a)*r*ry*(top?0.95:1),lt=(cy-y)/(ry||1)*28-(x-cx)/(rx||1)*8+(rnd()-0.5)*18;
    s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(R_*(0.7+rnd()*0.6)).toFixed(1)}" ry="${(R_*(0.55+rnd()*0.5)).toFixed(1)}" fill="${shade(col,lt)}"/>`}return s}
function flower(x,y,r,col,rnd){if(r<2.2)return`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.max(1,r).toFixed(1)}" fill="${col}"/>`;let s='';const rot=rnd()*Math.PI;
  for(let k=0;k<5;k++){const a=rot+k*Math.PI*2/5;s+=`<circle cx="${(x+Math.cos(a)*r*0.55).toFixed(1)}" cy="${(y+Math.sin(a)*r*0.55).toFixed(1)}" r="${(r*0.48).toFixed(1)}" fill="${col}"/>`}
  return s+`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r*0.3).toFixed(1)}" fill="${['jaune','orange'].some(k=>COL[k]&&COL[k][1]===col)?'#8a5a12':'#f3d36b'}"/>`}
function twigs(x,y,len,ang,depth,rnd,col,w){if(depth<=0||len<2)return'';const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;
  let s=`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${Math.max(0.6,w).toFixed(1)}" stroke-linecap="round"/>`;
  const n=depth>2?3:2;for(let i=0;i<n;i++)s+=twigs(x2,y2,len*(0.6+rnd()*0.15),ang+(i-(n-1)/2)*0.55+(rnd()-0.5)*0.3,depth-1,rnd,col,w*0.65);return s}
plantShape=function(p,x,base,w,h,col,rnd){
  if(p.t!=='arbre'&&h>3&&w>h*(p.t==='graminee'?1.4:2.2)+8){const n=Math.min(8,Math.ceil(w/(h*(p.t==='graminee'?1.1:1.6)))),sw=w/n;let o='';for(let i=0;i<n;i++)o+=plantShape(p,x-w/2+sw*(i+.5)+(rnd()-.5)*sw*0.2,base+(rnd()-.5)*2,sw*1.25,h*(0.9+rnd()*0.15),col,rnd);return o}
  const m=S.planMonth|0,lf=leafCol(p)||'#6f9a55',fl=(!m||p.f.includes(m))&&p.c.length&&!(p.c.length===1&&p.c[0]==='vert')?hx(col):null,
  win=[12,1,2].includes(m),dorm=m&&win&&!p.pers&&(p.t==='vivace'||p.t==='fougere'),bare=m&&win&&!p.pers&&(p.t==='arbuste'||p.t==='arbre');
  let g=`<g class="pl"><title>${esc(p.n)} · ${nf(p.h,p.h<1?2:1)} m</title><ellipse cx="${x.toFixed(1)}" cy="${(base+1).toFixed(1)}" rx="${(w*0.55).toFixed(1)}" ry="${Math.max(2,w*0.07).toFixed(1)}" fill="rgba(0,0,0,.12)"/>`;
  const end='</g>',sz=Math.max(1.6,Math.min(w,h)*0.11);
  if(dorm){for(let i=0;i<9;i++)g+=`<line x1="${x}" y1="${base}" x2="${(x+(rnd()-.5)*w*0.6).toFixed(1)}" y2="${(base-Math.max(3,h*0.14)*(0.5+rnd()*0.5)).toFixed(1)}" stroke="#8b735a" stroke-width="1.2"/>`;return g+end}
  if(p.t==='arbre'){const tb=w*0.05,crownY=base-h*0.62,narrow=p.p==='colonne'||p.p==='erige';
    g+=`<path d="M${(x-tb*1.4).toFixed(1)},${base} Q${(x-tb).toFixed(1)},${(base-h*0.3).toFixed(1)} ${(x-tb*0.6).toFixed(1)},${(base-h*0.5).toFixed(1)} L${(x+tb*0.6).toFixed(1)},${(base-h*0.5).toFixed(1)} Q${(x+tb).toFixed(1)},${(base-h*0.3).toFixed(1)} ${(x+tb*1.4).toFixed(1)},${base} Z" fill="#6d5640"/><path d="M${(x+tb*0.2).toFixed(1)},${base} L${(x+tb*0.2).toFixed(1)},${(base-h*0.5).toFixed(1)}" stroke="#5a4532" stroke-width="${Math.max(1,tb*0.5).toFixed(1)}"/>`;
    if(bare){g+=twigs(x,base-h*0.48,h*0.2,-Math.PI/2,4,rnd,'#7a6550',Math.max(1,tb*0.9));return g+end}
    const rx=narrow?w*0.3:w*0.5,ry=h*(narrow?0.42:0.36);g+=blobs(x,crownY,rx,ry,shade(lf,-30),Math.round(26+w/4),sz*1.3,rnd)+blobs(x-rx*0.1,crownY-ry*0.12,rx*0.85,ry*0.8,lf,Math.round(30+w/3),sz*1.15,rnd,true);
    if(fl)for(let i=0;i<Math.min(40,8+w/3);i++){const a=rnd()*6.28,r=Math.sqrt(rnd());g+=flower(x+Math.cos(a)*r*rx*0.9,crownY+Math.sin(a)*r*ry*0.85,sz*0.45,fl,rnd)}
    return g+end}
  if(p.t==='graminee'||p.p==='fontaine'){const n=Math.round(18+w/3),blade=[9,10,11,12,1,2,3].includes(m)&&!p.pers?'#cdb88a':lf;
    for(let i=0;i<n;i++){const t=(i/(n-1)-0.5)*2,hh=h*(0.65+rnd()*0.35)*(1-Math.abs(t)*0.25),tx=x+t*w*0.55+(rnd()-.5)*w*0.1,arch=p.p==='fontaine'?t*w*0.25:t*w*0.08;
      g+=`<path d="M${(x+t*w*0.08).toFixed(1)},${base} Q${(x+t*w*0.15).toFixed(1)},${(base-hh*0.7).toFixed(1)} ${(tx+arch).toFixed(1)},${(base-hh).toFixed(1)}" stroke="${shade(blade,(rnd()-.5)*40)}" stroke-width="${Math.min(2.2,Math.max(0.8,w/45)).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
      if(p.t==='graminee'&&(fl||[8,9,10,11].includes(m))&&i%2===0)g+=`<ellipse cx="${(tx+arch).toFixed(1)}" cy="${(base-hh-h*0.05).toFixed(1)}" rx="${Math.max(1,w/40).toFixed(1)}" ry="${Math.max(2,h*0.07).toFixed(1)}" fill="${fl&&fl!==hx(lf)?fl:'#e6d9b0'}" opacity=".9" transform="rotate(${(t*25).toFixed(0)} ${(tx+arch).toFixed(1)} ${(base-hh).toFixed(1)})"/>`}
    return g+end}
  if(p.t==='fougere'){for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*0.3,ex=x+Math.cos(a)*w*0.6,ey=base+Math.sin(a)*h*0.95,cx_=x+Math.cos(a)*w*0.25,cy_=base-h*0.9;
      g+=`<path d="M${x},${base} Q${cx_.toFixed(1)},${cy_.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" stroke="${shade(lf,-15)}" stroke-width="1.3" fill="none"/>`;
      for(let k=1;k<9;k++){const t=k/9,px=(1-t)*(1-t)*x+2*(1-t)*t*cx_+t*t*ex,py=(1-t)*(1-t)*base+2*(1-t)*t*cy_+t*t*ey,L_=w*0.09*(1-t*0.6);g+=`<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${L_.toFixed(1)}" ry="${(L_*0.35).toFixed(1)}" fill="${shade(lf,(rnd()-.5)*30)}" transform="rotate(${(a*57.3+90).toFixed(0)} ${px.toFixed(1)} ${py.toFixed(1)})"/>`}}
    return g+end}
  if(bare){for(let i=0;i<6;i++)g+=twigs(x+(i-2.5)*w*0.06,base,h*0.35,-Math.PI/2+(i-2.5)*0.18,3,rnd,'#8a7358',1.4);return g+end}
  const P=p.p;
  if(P==='erige'||P==='colonne'){const k=P==='colonne'?1:Math.max(3,Math.min(7,Math.round(w/14)));
    g+=blobs(x,base-h*0.22,w*0.45,h*0.2,lf,Math.round(14+w/5),sz,rnd);
    for(let i=0;i<k;i++){const xx=x+(k>1?(i/(k-1)-0.5):0)*w*0.6,hh=h*(0.75+rnd()*0.25);g+=`<line x1="${xx.toFixed(1)}" y1="${(base-h*0.2).toFixed(1)}" x2="${xx.toFixed(1)}" y2="${(base-hh).toFixed(1)}" stroke="${shade(lf,-20)}" stroke-width="${Math.max(1,w/40).toFixed(1)}"/>`;
      g+=blobs(xx,base-hh*0.6,w*(P==='colonne'?0.3:0.07),hh*0.25,lf,8,sz*0.8,rnd);
      if(fl){const sh=hh*0.35;for(let j=0;j<10;j++){const yy=base-hh+sh*j/10;g+=flower(xx+(rnd()-.5)*w*0.04,yy,Math.max(1.2,w*0.025*(1.2-j/12)),fl,rnd)}}}
    return g+end}
  if(P==='couvre'){g+=blobs(x,base-h*0.45,w*0.52,Math.max(2,h*0.5),lf,Math.round(16+w/3),Math.max(1.4,sz*0.9),rnd,true);
    if(fl)for(let i=0;i<Math.min(40,6+w/4);i++)g+=flower(x+(rnd()-.5)*w*0.95,base-h*(0.55+rnd()*0.5),Math.max(1.2,sz*0.45),fl,rnd);return g+end}
  /* touffe ou boule (vivaces, arbustes, annuelles) */
  const rx=w*0.5,ry=h*0.5,cy=base-ry;
  g+=blobs(x,cy+ry*0.1,rx,ry*0.92,shade(lf,-28),Math.round(16+w/3),sz*1.2,rnd)+blobs(x-rx*0.08,cy-ry*0.08,rx*0.88,ry*0.82,lf,Math.round(22+w/2.5),sz,rnd,true);
  if(fl){const n=Math.min(70,Math.round((P==='etale'?10:8)+w/(p.t==='annuelle'?2:3.5))),r=Math.max(1.3,sz*(p.t==='arbuste'?0.42:0.55));
    for(let i=0;i<n;i++){const a=Math.PI*(1.05+rnd()*0.9),rr=0.35+0.65*Math.sqrt(rnd());g+=flower(x+Math.cos(a)*rr*rx*0.92,cy+Math.sin(a)*rr*ry*0.92,r,fl,rnd)}}
  return g+end};
{const _de=drawElev;drawElev=function(r,Lg){_de(r,Lg);const box=$('#elev');if(!box)return;const sv=box.querySelector('svg'),W=box.clientWidth,H=box.clientHeight;if(!W||!sv)return;let h=sv.innerHTML;const ground=H-28;
  const ticks=[...h.matchAll(/<line x1="(\d+(?:\.\d+)?)" x2="[\d.]+" y1="([\d.]+)" y2="[\d.]+" stroke="var\(--mute\)"><\/line><text[^>]*>([\d,]+) m<\/text>/g)].map(x=>[parseFloat(x[3].replace(',','.')),parseFloat(x[2])]);
  const sy=ticks.length?(ground-ticks[0][1])/ticks[0][0]:null,m=S.planMonth|0,win=[12,1,2].includes(m);
  const defs=`<linearGradient id="soilg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5c3e"/><stop offset="1" stop-color="#5c4330"/></linearGradient><linearGradient id="grassg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${win?'#8fa06c':'#79a94f'}"/><stop offset="1" stop-color="${win?'#6d7d52':'#5a8a3a'}"/></linearGradient>`;
  h=h.replace('</linearGradient></defs>','</linearGradient>'+defs+'</defs>');
  let bg='';const rnd=rng(3);let path=`M0,${ground-6}`;for(let x=0;x<=W;x+=W/14)path+=` Q${(x+W/28).toFixed(0)},${(ground-30-rnd()*26).toFixed(0)} ${(x+W/14).toFixed(0)},${(ground-14-rnd()*10).toFixed(0)}`;
  bg+=`<path d="${path} L${W},${ground} L0,${ground} Z" fill="${win?'#a7b1a0':'#a9c39a'}" opacity=".35"/>`;
  h=h.replace(/(<rect width="\d+(?:\.\d+)?" height="[\d.]+" fill="url\(#skyg\)"><\/rect>)/,'$1'+bg);
  h=h.replace(/<rect y="([\d.]+)" width="(\d+(?:\.\d+)?)" height="([\d.]+)" fill="#8a6f52" opacity="\.35"><\/rect>/,(s0,y,w_,hh)=>{let sp='';const r2=rng(5);for(let i=0;i<Math.round(W/3);i++)sp+=`<circle cx="${(r2()*W).toFixed(0)}" cy="${(+y+r2()*(ground-+y)).toFixed(1)}" r="${(0.6+r2()*1.2).toFixed(1)}" fill="${r2()>.5?'#4b3624':'#9a7a55'}" opacity=".6"/>`;
    return `<rect y="${y}" width="${w_}" height="${(ground-+y).toFixed(1)}" fill="url(#soilg)" opacity=".85"></rect>${sp}<rect y="${ground}" width="${w_}" height="28" fill="url(#grassg)"></rect>`});
  if(sy&&sy>8){const ph=1.75*sy,px=W-80,b=ground;h+=`<g opacity=".55"><title>Silhouette de 1,75 m pour l’échelle</title><circle cx="${px}" cy="${(b-ph+ph*0.065).toFixed(1)}" r="${(ph*0.065).toFixed(1)}" fill="#3d4a41"/><path d="M${(px-ph*0.1).toFixed(1)},${(b-ph*0.47).toFixed(1)} L${(px-ph*0.12).toFixed(1)},${(b-ph*0.82).toFixed(1)} Q${px},${(b-ph*0.88).toFixed(1)} ${(px+ph*0.12).toFixed(1)},${(b-ph*0.82).toFixed(1)} L${(px+ph*0.1).toFixed(1)},${(b-ph*0.47).toFixed(1)} L${(px+ph*0.06).toFixed(1)},${b} L${(px+ph*0.015).toFixed(1)},${b} L${px},${(b-ph*0.45).toFixed(1)} L${(px-ph*0.015).toFixed(1)},${b} L${(px-ph*0.06).toFixed(1)},${b} Z" fill="#3d4a41"/><text x="${px}" y="${(b-ph-4).toFixed(1)}" text-anchor="middle" style="font-size:10px">1,75 m</text></g>`}
  sv.innerHTML=h}}

/* ================= v10 : Pros et achats — Google Maps ================= */
/* Clé facultative « Maps Embed API » (gratuite, sans limite d'usage) : collez-la entre les apostrophes et limitez-la à votre domaine dans Google Cloud. */
const GOOGLE_MAPS_CLE_DU_SITE='';
/* MENTIONS LÉGALES ET CONFIDENTIALITÉ : complétez ces champs (affichés dans « Mentions légales » et « Confidentialité », en bas de page et dans le Menu).
   statut : « personne physique », « entreprise individuelle » ou la forme de la société (SRL, SA…). bce : numéro d’entreprise (0123.456.789), si vous en avez un. */
const EDITEUR={nom:'',statut:'',adresse:'',email:'',telephone:'',bce:'',tva:'',responsable:''};
const GCAT=[['paysagiste','Paysagistes'],['entrepreneur de jardins','Entrepreneurs de jardins'],['architecte de jardin','Architectes de jardin'],['pépinière','Pépinières'],['jardinerie','Jardineries'],['matériaux de construction clôture','Matériaux et clôtures'],['location de matériel de jardin','Location de matériel']];
const GM={q:'paysagiste'};
function gmWhere(){return PLACE.commune?`${PLACE.commune}${PLACE.cp?' '+PLACE.cp:''}, Belgique`:(S.lat!=null?`${S.lat.toFixed(5)},${S.lon.toFixed(5)}`:'Belgique')}
function gmSrc(q){const w=gmWhere(),ll=S.lat!=null?`${S.lat.toFixed(5)},${S.lon.toFixed(5)}`:'50.6,4.6';
  if(GOOGLE_MAPS_CLE_DU_SITE)return`https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(GOOGLE_MAPS_CLE_DU_SITE)}&q=${encodeURIComponent(q+' près de '+w)}&center=${ll}&zoom=11&language=fr`;
  return`https://maps.google.com/maps?q=${encodeURIComponent(q+' près de '+w)}&ll=${ll}&z=11&hl=fr&output=embed`}
function renderGmaps(){const c=$('#prosMapCard');if(!c)return;const extra=[...GCAT];if(S.ponds.length)extra.push(['création mare naturelle','Création de mares']);
  c.innerHTML=`<h4>Sur Google Maps : professionnels, pépinières et magasins autour de ${esc(PLACE.commune||'votre terrain')}</h4>
   <div class="chips" id="gmCats">${extra.map(([q,l])=>`<button type="button" data-gq="${esc(q)}" aria-pressed="${GM.q===q}">${esc(l)}</button>`).join('')}</div>
   ${S.lat==null?'<p class="empty">Placez d’abord votre terrain sur la carte.</p>':`<iframe id="gmFrame" class="gmframe" title="Google Maps : ${esc(GM.q)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="${esc(gmSrc(GM.q))}"></iframe>
   <p class="small"><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GM.q+' près de '+gmWhere())}" target="_blank" rel="noopener">Ouvrir cette recherche dans Google Maps</a> (avis, horaires, itinéraires, appel).</p>`}
   <p class="note">Résultats proposés par Google Maps, sans classement ni recommandation de Plantañ.ia : comparez les avis et demandez plusieurs devis.</p>`}
$('#prosMapCard').addEventListener('click',e=>{const b=e.target.closest('[data-gq]');if(!b)return;GM.q=b.dataset.gq;renderGmaps()});
{const _rp10=renderPros;renderPros=function(){_rp10();const f=$('#gmFrame');if(!f||f.dataset.where!==gmWhere()){renderGmaps();const g=$('#gmFrame');if(g)g.dataset.where=gmWhere()}}}
renderGmaps();

/* ================= v11 : mare — profils de terrassement ================= */
function pondProfile(p){const I=pondInfo(p),o=p.pts[0],xy=p.pts.map(q=>toXY(o,q)),n=xy.length,c=xy.reduce((a,q)=>[a[0]+q[0]/n,a[1]+q[1]/n],[0,0]);
  let sxx=0,syy=0,sxy=0;xy.forEach(q=>{const dx=q[0]-c[0],dy=q[1]-c[1];sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy});const th=0.5*Math.atan2(2*sxy,sxx-syy);
  const cut=(ux,uy)=>{const ts=[];for(let i=0;i<n;i++){const a=xy[i],b=xy[(i+1)%n],ex=b[0]-a[0],ey=b[1]-a[1],den=ux*ey-uy*ex;if(Math.abs(den)<1e-9)continue;
      const t=((a[0]-c[0])*ey-(a[1]-c[1])*ex)/den,s=((a[0]-c[0])*uy-(a[1]-c[1])*ux)/den;if(s>=-1e-6&&s<=1+1e-6)ts.push(t)}return ts.length>=2?[Math.min(...ts),Math.max(...ts)]:[-1,1]};
  const dmax=I.dmax,steps=L=>{const h=L/2,b1=Math.min(1.5,Math.max(0.5,h*0.25)),p1=Math.min(0.6,h*0.15),seg=[[0,0,'bord'],[b1,0.2,'fin de berge (pente 1/5 ou plus douce)'],[b1+p1,0.2,'palier des plantes de bord']];let x=b1+p1,d=0.2;
    if(dmax>0.35){const t=Math.min(0.5,dmax);x+=(t-d)*2;d=t;seg.push([x,d,'pente 1/2']);if(dmax>0.65){x+=Math.min(0.5,h*0.12);seg.push([x,d,'palier des plantes immergées']);x+=(dmax-d)*2;d=dmax;seg.push([x,d,'fond'])}}
    let reach=d;if(x>h){const k=seg.findIndex(s=>s[0]>h);reach=k>0?seg[k-1][1]+(seg[k][1]-seg[k-1][1])*(h-seg[k-1][0])/((seg[k][0]-seg[k-1][0])||1):d;seg.splice(k);seg.push([h,reach,'centre'])}
    return{seg,reach}};
  const mk=(name,ux,uy)=>{const [t0,t1]=cut(ux,uy),L=t1-t0,S_=steps(L),f=x=>{const y=Math.min(x,L-x);let dd=0;for(let i=1;i<S_.seg.length;i++){const a=S_.seg[i-1],b=S_.seg[i];if(y<=b[0]){dd=a[1]+(b[1]-a[1])*(y-a[0])/((b[0]-a[0])||1);return dd}dd=b[1]}return dd};
    const pts=[];for(let i=0;i<=80;i++){const x=L*i/80;pts.push([x,f(x)])}return{name,L,pts,seg:S_.seg,reach:S_.reach,a:[c[0]+ux*t0,c[1]+uy*t0],b:[c[0]+ux*t1,c[1]+uy*t1]}};
  const A=mk('Coupe A–A (longueur)',Math.cos(th),Math.sin(th)),B=mk('Coupe B–B (largeur)',-Math.sin(th),Math.cos(th));
  const off=d=>xy.map(q=>{const vx=c[0]-q[0],vy=c[1]-q[1],l=Math.hypot(vx,vy)||1,m=Math.min(d,l*0.92);return[q[0]+vx/l*m,q[1]+vy/l*m]});
  const brk=B.seg.filter((s,i)=>i>0&&s[2]!=='centre'),cont=[...new Map(brk.map(s=>[s[1],s])).values()].map(s=>({d:s[0],depth:s[1],poly:off(s[0])}));
  const Ldim=Math.max(...xy.map(q=>q[0]))-Math.min(...xy.map(q=>q[0])),Wdim=Math.max(...xy.map(q=>q[1]))-Math.min(...xy.map(q=>q[1]));
  const liner=[A.L+2*Math.max(A.reach,0.2)+1,B.L+2*Math.max(B.reach,0.2)+1];
  return{I,xy,c,A,B,cont,liner,reachMax:Math.max(A.reach,B.reach)}}
function sectionSvg(S_,dmax){const W=640,H=200,top=40,xs=(W-60)/S_.L,ys=Math.min(120/Math.max(0.3,dmax),(xs*4)),X=x=>30+x*xs,Y=d=>top+d*ys,ex=ys/xs;
  const prof=S_.pts.map(([x,d])=>`${X(x).toFixed(1)},${Y(d).toFixed(1)}`).join(' ');let g='';
  g+=`<rect x="0" y="0" width="${W}" height="${top}" fill="light-dark(#eef5fb,#16252c)"/><rect x="0" y="${top}" width="${W}" height="${H-top}" fill="#8a6f52" opacity=".55"/>`;
  g+=`<polygon points="${X(0)},${top} ${prof} ${X(S_.L)},${top}" fill="#4f8fc0" opacity=".55"/><polyline points="${prof}" fill="none" stroke="#3e2c1c" stroke-width="2.5"/>`;
  g+=`<line x1="0" x2="${W}" y1="${top}" y2="${top}" stroke="#5a8a3a" stroke-width="4"/>`;
  const marks=[];S_.seg.forEach(s=>{if(s[0]<=0)return;[s[0],S_.L-s[0]].forEach(x=>{if(!marks.some(m=>Math.abs(m[0]-x)<0.05))marks.push([x,s[1]])})});let lastD=-1,lastX=-9;
  marks.sort((a,b)=>a[0]-b[0]).forEach(([x,d],i)=>{const showD=Math.abs(d-lastD)>0.03||(x-lastX)*xs>70;if(showD){lastD=d;lastX=x}g+=`<line x1="${X(x).toFixed(1)}" x2="${X(x).toFixed(1)}" y1="${top-14}" y2="${Y(d).toFixed(1)}" stroke="#222" stroke-dasharray="3 3" stroke-width=".8"/><text x="${X(x).toFixed(1)}" y="${top-17-(i%2)*11}" text-anchor="middle" style="font-size:10px">${nf(x,1)} m</text>${showD?`<text x="${(X(x)+3).toFixed(1)}" y="${(Y(d)+12).toFixed(1)}" style="font-size:10px;fill:#fff">−${nf(d*100,0)} cm</text>`:''}`});
  g+=`<text x="${X(0)}" y="${H-6}" style="font-size:11px">${esc(S_.name)} · ${nf(S_.L,1)} m · échelle verticale × ${nf(ex,1)}</text>`;
  return`<svg viewBox="0 0 ${W} ${H}" class="pprof" role="img" aria-label="${esc(S_.name)}">${g}</svg>`}
function pondPlanSvg(P){const W=320,H=240,xs=P.xy.map(q=>q[0]),ys=P.xy.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),k=Math.min((W-40)/((x1-x0)||1),(H-40)/((y1-y0)||1)),
  T=q=>`${(20+(q[0]-x0)*k).toFixed(1)},${(H-20-(q[1]-y0)*k).toFixed(1)}`,cols=['#bfe0f2','#8cc3e6','#5a9fd0','#2f74ad'];
  let g=`<polygon points="${P.xy.map(T).join(' ')}" fill="#d9ecf7" stroke="#3e2c1c" stroke-width="2"/>`;
  P.cont.forEach((ct,i)=>{g+=`<polygon points="${ct.poly.map(T).join(' ')}" fill="${cols[Math.min(3,i+1)]}" stroke="#1d4f78" stroke-width="1" stroke-dasharray="4 3" opacity=".85"><title>−${nf(ct.depth*100,0)} cm à ${nf(ct.d,1)} m de la berge</title></polygon>`});
  [[P.A,'A'],[P.B,'B']].forEach(([s,l])=>{g+=`<line x1="${T(s.a).split(',')[0]}" y1="${T(s.a).split(',')[1]}" x2="${T(s.b).split(',')[0]}" y2="${T(s.b).split(',')[1]}" stroke="#c62828" stroke-width="1.5"/><text x="${T(s.a).split(',')[0]}" y="${T(s.a).split(',')[1]}" style="font-size:12px;font-weight:700;fill:#c62828">${l}</text><text x="${T(s.b).split(',')[0]}" y="${T(s.b).split(',')[1]}" style="font-size:12px;font-weight:700;fill:#c62828">${l}</text>`});
  return`<svg viewBox="0 0 ${W} ${H}" class="pplan" role="img" aria-label="Plan des courbes de niveau de la mare">${g}</svg>`}
function pondProfileHtml(p){const P=pondProfile(p),I=P.I,needLiner=/bâche|EPDM/i.test(I.S.d+I.S.t);
  return `<div class="pprofbox"><h4>Profils de terrassement</h4><div class="pgrid">${pondPlanSvg(P)}<div>${sectionSvg(P.A,I.dmax)}${sectionSvg(P.B,I.dmax)}</div></div>
   <table class="stack"><thead><tr><th>Courbe de niveau</th><th>Distance depuis la berge</th><th>Profondeur sous le bord</th><th>Rôle</th></tr></thead><tbody>${P.B.seg.filter((s,i)=>i>0).map(s=>`<tr><td>${s[2]==='centre'?'Centre':'Palier ou rupture'}</td><td>${nf(s[0],1)} m</td><td>${nf(s[1]*100,0)} cm</td><td>${esc(s[2])}</td></tr>`).join('')}</tbody></table>
   ${P.reachMax+0.02<I.dmax?`<p class="koo">La mare est trop étroite pour atteindre ${nf(I.dmax*100,0)} cm avec des pentes douces : profondeur maximale réaliste ≈ ${nf(P.reachMax*100,0)} cm. Élargissez la forme ou acceptez cette profondeur.</p>`:''}
   <ul class="small"><li>Piquetage : plantez un piquet tous les 1 à 2 m sur le contour, puis un second rang aux distances du tableau, mesurées perpendiculairement à la berge ; tendez un cordeau entre les piquets de même profondeur.</li>
   <li>Repère de niveau : le bord doit être parfaitement horizontal (niveau laser, ou tuyau transparent rempli d’eau). Le point le plus bas du bord fixe le niveau de l’eau : prévoyez-y un déversoir de trop-plein vers une zone d’infiltration.</li>
   <li>Creusez 10 cm plus profond que la cote finale si vous posez une couche de sable, d’argile ou de substrat.</li>
   ${needLiner?`<li>Dimensions de la bâche ou de la natte (avec 50 cm de recouvrement de chaque côté) : ${nf(P.liner[0],1)} × ${nf(P.liner[1],1)} m.</li>`:''}</ul></div>`}
{const _rpo=renderPonds;renderPonds=function(){_rpo();document.querySelectorAll('#pondBox [data-k=ponds]').forEach(c=>{const p=S.ponds.find(x=>x.id==c.dataset.id);if(!p||c.querySelector('.pprofbox'))return;try{c.insertAdjacentHTML('beforeend',pondProfileHtml(p))}catch(e){}})}}
{const _vs14=v4Sections;v4Sections=function(){const o=_vs14();S.ponds.forEach((p,i)=>{try{const P=pondProfile(p);o.push({title:`MARE ${i+1} : PROFILS DE TERRASSEMENT`,intro:`Coupe A–A : ${nf(P.A.L,1)} m · coupe B–B : ${nf(P.B.L,1)} m · profondeur visée ${nf(P.I.dmax*100,0)} cm (atteignable ≈ ${nf(P.reachMax*100,0)} cm).`,
  tables:[{head:['Distance depuis la berge','Profondeur sous le bord','Rôle'],rows:P.B.seg.filter((s,k)=>k>0).map(s=>[nf(s[0],1)+' m',nf(s[1]*100,0)+' cm',s[2]]),w:[3600,3600,7638]}],bullets:['Bord parfaitement horizontal (niveau laser ou tuyau à eau) ; trop-plein au point le plus bas.','Surcreuser de 10 cm si une couche de sable, d’argile ou de substrat est prévue.',`Bâche ou natte éventuelle : ${nf(P.liner[0],1)} × ${nf(P.liner[1],1)} m, recouvrement compris.`],svg:[pondPlanSvg(P),sectionSvg(P.A,P.I.dmax),sectionSvg(P.B,P.I.dmax)]})}catch(e){}});return o}}
{const _rh10=reportHtml;reportHtml=function(R){let h=_rh10(R);(R.sections||[]).filter(s=>s.svg).forEach(s=>{const pg=`<section class="pg"><h2>${xe(s.title)} — SCHÉMAS</h2><div style="display:grid;grid-template-columns:1fr 1.6fr;gap:8mm;align-items:start"><div>${s.svg[0]}</div><div>${s.svg.slice(1).join('')}</div></div><p class="small">Schémas indicatifs, échelle verticale exagérée sur les coupes.</p></section>`;
  const i=h.lastIndexOf('<section class="pg ');h=i>0?h.slice(0,i)+pg+h.slice(i):h});return h}}

/* ================= v11 : je réalise les travaux moi-même ================= */
const DIY={
 massif:{t:'Massif de plantation',when:'Octobre–novembre (idéal) ou mars–avril',dur:a=>`≈ ${nf(Math.max(2,a*0.6),0)} h pour ${nf(a)} m²`,lvl:'Facile',tools:'Bêche ou grelinette, fourche, râteau, transplantoir, brouette, arrosoir',s:['Tracer le contour au sol (cordeau, sable ou bombe de traceur) d’après le plan.','Désherber à la main et retirer les racines de liserons, chiendent et ronces ; ou bâcher 2 à 3 mois à l’avance.','Ameublir sur 25–30 cm à la grelinette sans retourner la terre ; incorporer 3 à 5 cm de compost.','Disposer les plantes dans leurs pots selon le plan (les hautes au fond), ajuster avant de planter.','Plonger les mottes dans un seau d’eau, planter au niveau du collet, tasser et arroser abondamment (5 à 10 L par plante).','Pailler sur 5 à 7 cm (BRF, feuilles, écorces) en laissant le collet dégagé.','Arroser chaque semaine sans pluie pendant la première saison.']},
 haie:{t:'Haie',when:'Novembre à mars, hors gel (racines nues)',dur:l=>`≈ ${nf(Math.max(2,l*0.25),0)} h pour ${nf(l)} m`,lvl:'Facile',tools:'Bêche, cordeau, sécateur, maillet, brouette',s:['Tendre un cordeau en respectant la distance légale à la limite (0,5 m pour une haie de moins de 2 m).','Ouvrir une tranchée ou des trous de 40 × 40 cm, ameublir le fond.','Habiller les racines (raccourcir les plus longues) et les praliner (boue d’argile et compost).','Planter en quinconce sur deux rangs, en mélangeant les essences par groupes de 1 à 3.','Tasser, arroser, puis pailler sur 1 m de large (BRF, paille).','Recéper à 20 cm les essences buissonnantes la première année pour une haie bien garnie à la base.']},
 verger:{t:'Arbres fruitiers et verger',when:'Novembre à mars (racines nues), hors gel',dur:n=>`≈ ${nf(Math.max(1,n*0.75),0)} h pour ${n} arbre(s)`,lvl:'Moyen',tools:'Bêche, pioche, tuteur, liens, maillet, protection de tronc',s:['Piqueter l’emplacement en respectant les écartements et 2 m de la limite.','Creuser un trou de 60 × 60 cm, ameublir le fond, séparer terre de surface et sous-sol.','Planter le tuteur côté vent dominant avant l’arbre.','Placer le point de greffe 10 cm au-dessus du sol, reboucher avec la terre de surface mêlée de compost mûr.','Tasser, faire une cuvette, arroser avec 20 à 30 L.','Attacher au tuteur en huit, poser une protection contre les lapins et chevreuils, pailler.','Faire la taille de formation dès la première fin d’hiver.']},
 potager:{t:'Potager',when:'Préparation à l’automne, cultures de mars à octobre',dur:a=>`≈ ${nf(Math.max(2,a*0.4),0)} h de préparation pour ${nf(a)} m²`,lvl:'Facile',tools:'Grelinette, râteau, binette, cordeau, arrosoir',s:['Délimiter les planches (1,2 m de large) et les allées (40 cm).','Ameublir à la grelinette, apporter 3 à 5 cm de compost.','Couvrir le sol en hiver (paille, feuilles, engrais vert).','Semer et planter selon le calendrier de l’onglet Potager, en respectant la rotation des familles.','Pailler en été, arroser au pied le matin.']},
 pelouse:{t:'Pelouse ou prairie',when:'Septembre (idéal) ou avril–mai',dur:a=>`≈ ${nf(Math.max(2,a*0.08),0)} h pour ${nf(a)} m²`,lvl:'Facile',tools:'Motobineuse ou grelinette, râteau, rouleau (location), semoir',s:['Désherber et retirer les pierres.','Ameublir sur 10–15 cm, niveler au râteau, laisser reposer 2 à 3 semaines et retirer les levées d’herbes.','Semer à la dose indiquée en deux passages croisés.','Ratisser légèrement, puis passer le rouleau.','Arroser en pluie fine tous les jours sans pluie jusqu’à la levée (2 à 3 semaines).','Première tonte haute (8 cm) quand l’herbe atteint 10 cm.']},
 mare:{t:'Mare naturelle',when:'Septembre à novembre, sol ressuyé',dur:a=>`≈ ${nf(Math.max(4,a*1.5),0)} h pour ${nf(a)} m² (à la main)`,lvl:'Difficile',tools:'Bêche, pioche, brouette, niveau laser ou tuyau à eau, piquets, cordeau ; mini-pelle en location au-delà de 10 m²',s:['Tracer la forme et piqueter les courbes de niveau d’après les profils.','Décaper la terre végétale et la mettre de côté.','Creuser par paliers en suivant les profils, en contrôlant souvent le niveau du bord.','Retirer pierres et racines, étaler 5 cm de sable ou poser l’étanchéité conseillée.','Remplir lentement à l’eau de pluie, poser les plantes en mai–juin.','Ne pas introduire de poissons.']},
 talus:{t:'Talus',when:'Octobre–novembre',dur:a=>`≈ ${nf(Math.max(2,a*0.5),0)} h pour ${nf(a)} m²`,lvl:'Moyen',tools:'Bêche, agrafes, toile de jute ou coco, maillet',s:['Désherber sans mettre le sol à nu sur de grandes surfaces.','Poser une toile biodégradable (jute ou coco) agrafée tous les 50 cm si la pente dépasse 30 %.','Planter en quinconce, en commençant par le haut, dans des fentes en croix dans la toile.','Faire une petite cuvette en aval de chaque plant, arroser.','Pailler les trous de plantation.']},
 cloture:{t:'Clôture',when:'Toute l’année, hors gel (béton)',dur:l=>`≈ ${nf(Math.max(3,l*0.35),0)} h pour ${nf(l)} m`,lvl:'Moyen',tools:'Cordeau, niveau, tarière ou bêche, masse ou enfonce-pieux, visseuse, brouette et bac à béton',s:['Vérifier les règles (onglet Clôture) et l’accord du voisin si la clôture est mitoyenne.','Tendre un cordeau et marquer l’emplacement des poteaux d’angle et d’extrémité, puis des intermédiaires.','Creuser les trous (25 × 25 × 60 à 80 cm) ou enfoncer les poteaux pointés.','Sceller d’abord les poteaux d’angle bien d’aplomb, puis les intermédiaires alignés au cordeau ; laisser durcir 48 h.','Poser les panneaux, le grillage (tendu entre jambes de force) ou la ganivelle (crampillons sur chaque fil).','Contrôler l’alignement et ménager un passage à hérissons.']},
 jardin:{t:'Jardinières',when:'Mai (été) et octobre (hiver)',dur:n=>`≈ ${nf(Math.max(1,n*0.5),0)} h`,lvl:'Facile',tools:'Transplantoir, arrosoir',s:['Percer le fond si nécessaire, poser 3 cm de billes d’argile et un voile.','Remplir de terreau pour jardinières mêlé d’engrais organique.','Placer les plantes hautes au fond ou au centre, les retombantes devant.','Arroser jusqu’à ce que l’eau s’écoule ; en été, arroser chaque jour sans pluie.']},
 arrosage:{t:'Arrosage automatique',when:'Printemps, avant les plantations ou en même temps',dur:z=>`≈ ${nf(Math.max(3,z*2.5),0)} h pour ${z} zone(s)`,lvl:'Moyen',tools:'Coupe-tube, clés, bêche étroite, mètre',s:['Poser le programmateur, le filtre, le réducteur de pression et le clapet anti-retour au point d’eau.','Creuser des saignées de 20–30 cm pour le tuyau principal PE et les raccords vers chaque électrovanne.','Installer les électrovannes dans un regard, câbler vers le programmateur.','Dérouler les lignes de goutte-à-goutte sous le paillis, les fixer avec des cavaliers, boucher les extrémités.','Poser les arroseurs à fleur du sol pour la pelouse, régler les secteurs et portées.','Tester chaque zone, purger avant les gelées (vidange en novembre).']}};
function diyList(){const L=[];if(massifOn()&&S.bed)L.push(['massif',bedGeo().area]);if(S.hedges.length)L.push(['haie',S.hedges.reduce((a,h)=>a+lenLL(h.pts),0)]);
  const nt=S.fruits.length+(S.orchards.length?(()=>{try{return orchPlan().trees.length}catch(e){return 0}})():0);if(nt)L.push(['verger',nt]);if(S.potagers.length)L.push(['potager',S.potagers.reduce((a,p)=>a+areaLL(p.pts),0)]);
  const la=lawnArea();if(la)L.push(['pelouse',la]);S.ponds.forEach(p=>L.push(['mare',areaLL(p.pts)]));if(S.taluses.length)L.push(['talus',S.taluses.reduce((a,t)=>a+(t.pts?areaLL(t.pts):0),0)]);
  if(S.fences.length)L.push(['cloture',S.fences.reduce((a,f)=>a+lenLL(f.pts),0)]);if(S.boxes.length)L.push(['jardin',S.boxes.length]);if(wantOn('arrosage')&&typeof irrPlan==='function'){const P=irrPlan();if(P.zones.length)L.push(['arrosage',P.nz])}return L}
function renderDiy(){const box=$('#diyBox');if(!box)return;const L=diyList();
  box.innerHTML=L.length?L.map(([k,v])=>{const D=DIY[k];return `<details class="card diycard" open><summary><b>${esc(D.t)}</b> <small>${esc(D.lvl)} · ${esc(D.dur(v))} · ${esc(D.when)}</small></summary><p class="small"><b>Outils :</b> ${esc(D.tools)}</p><ol>${D.s.map(t=>`<li>${esc(t)}</li>`).join('')}</ol></details>`}).join('')+'<p class="note">Durées indicatives pour une personne ; prévoyez davantage en sol lourd ou caillouteux. Louez le gros matériel (mini-pelle, motobineuse, rouleau) plutôt que de l’acheter.</p>':'<p class="empty">Dessinez d’abord les éléments de votre projet : les étapes de réalisation s’afficheront pour chacun.</p>'}
{const _vs15=v4Sections;v4Sections=function(){const o=_vs15();if(wantOn('diy')){const L=diyList();if(L.length)o.push({title:'RÉALISER LES TRAVAUX SOI-MÊME',tables:[{head:['Chantier','Période','Durée estimée','Difficulté','Outils'],rows:L.map(([k,v])=>{const D=DIY[k];return[D.t,D.when,D.dur(v),D.lvl,D.tools]}),w:[2200,2800,2600,1300,5938]}],bullets:L.flatMap(([k])=>DIY[k].s.map((t,i)=>`${DIY[k].t} — ${i+1}. ${t}`)),bh:'Étapes'})}return o}}

/* ================= v11 : arrosage automatique optimisé ================= */
S.irr=S.irr||{src:'ville',flow:1.8,bar:3,cuve:5000,pump:3,roof:0,tap:null,rainS:1};
const IRRSRC={ville:'Eau de ville (robinet extérieur)',cuve:'Cuve d’eau de pluie existante',cuvenew:'Cuve d’eau de pluie à installer'};
/* k : coefficient de besoin en plein été (mm/j = 4 × k) ; t : type d'arrosage */
function irrZones(){const Z=[],cen=pts=>pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length],[0,0]);
  if(massifOn()&&S.bed){const a=bedGeo().area,len=a/0.4*1.05;Z.push({n:'Massif',t:'goutte',k:0.6,need:'moyen',a,len,q:len/0.3*2/1000,c:cen(S.bed.ll),eq:`${nf(len)} m de tuyau goutteur 16 mm (goutteurs 2 L/h tous les 30 cm), lignes espacées de 40 cm`})}
  S.hedges.forEach((h,i)=>{const L_=lenLL(h.pts),r=h.rows||2,len=L_*r*1.05;Z.push({n:`Haie ${i+1}`,t:'goutte',k:0.45,need:'faible',a:L_*1,len,q:len/0.3*2/1000,c:cen(h.pts),eq:`${nf(len)} m de tuyau goutteur 16 mm (${r} ligne${r>1?'s':''})`})});
  let nt=S.fruits.length;try{if(S.orchards.length)nt+=orchPlan().trees.length}catch(e){}
  if(nt){const pts=[...S.fruits.map(f=>[f.lat,f.lng]),...S.orchards.flatMap(o=>o.pts)];Z.push({n:'Arbres fruitiers',t:'goutte',k:0.5,need:'moyen',a:nt*4,len:nt*4,trees:nt,q:nt*4*2/1000,c:cen(pts),eq:`${nt} anneau(x) de 4 goutteurs de 2 L/h (Ø 1 m) autour des troncs`})}
  S.potagers.forEach((p,i)=>{const a=areaLL(p.pts),len=a/0.3*0.75;Z.push({n:`Potager ${i+1}`,t:'goutte',k:1,need:'fort',a,len,q:len/0.3*2/1000,c:cen(p.pts),eq:`${nf(len)} m de tuyau goutteur 16 mm, lignes espacées de 30 cm sur les planches`})});
  if(S.boxes.length){let nb=0;S.boxes.forEach(b=>{try{nb+=boxPlan(b).n}catch(e){nb++}});Z.push({n:'Jardinières',t:'goutte',k:1.2,need:'fort',a:nb*0.25,len:nb*3,q:nb*3*2/1000,c:S.lat!=null?[S.lat,S.lon]:[0,0],eq:`${nb*3} micro-goutteurs 2 L/h (3 par jardinière) et 4 mm de capillaire`})}
  S.lawns.forEach((l,i)=>{const a=areaLL(l.pts),xy=l.pts.map(p=>toXY(l.pts[0],p)),w=Math.min(Math.max(...xy.map(q=>q[0]))-Math.min(...xy.map(q=>q[0])),Math.max(...xy.map(q=>q[1]))-Math.min(...xy.map(q=>q[1])));
    const tur=a>120&&w>8,r=tur?Math.min(10,w/2):Math.min(4.5,Math.max(2.5,w/2)),nh=Math.ceil(a/(r*r*0.87))+2,q=nh*(tur?0.9:0.35)*0.6;
    Z.push({n:`Pelouse ${i+1}`,t:'aspersion',k:0.8,need:'moyen',a,heads:nh,q,c:cen(l.pts),eq:`${nh} ${tur?'turbines (portée ≈ '+nf(r,0)+' m)':'tuyères (portée ≈ '+nf(r,1)+' m)'} en disposition tête à tête`})});
  return Z}
function irrPlan(){const I=S.irr,Z=irrZones(),src=I.src==='ville'?Math.max(0.3,+I.flow||1.8):Math.max(0.3,+I.pump||3),qmax=src*0.8,G=[];
  /* regrouper par type d'arrosage et par besoin (hydrozones), sans dépasser 80 % du débit disponible */
  ['goutte','aspersion'].forEach(t=>['fort','moyen','faible'].forEach(nd=>{Z.filter(z=>z.t===t&&z.need===nd).sort((a,b)=>b.q-a.q).forEach(z=>{if(z.q>qmax){const parts=Math.ceil(z.q/qmax);for(let i=0;i<parts;i++){const hd=z.heads?Math.ceil(z.heads/parts):0,eq=z.heads?z.eq.replace(/^\d+/,String(hd)):z.len?z.eq.replace(/^[\d\s\u202f\u00a0.,]+ m/,nf(z.len/parts)+' m'):z.eq;G.push({t,need:nd,items:[{...z,n:z.n+` (${i+1}/${parts})`,q:z.q/parts,a:z.a/parts,len:z.len?z.len/parts:0,heads:hd,eq}],q:z.q/parts})}return}
    const g=G.find(g=>g.t===t&&g.need===nd&&g.q+z.q<=qmax);g?(g.items.push(z),g.q+=z.q):G.push({t,need:nd,items:[z],q:z.q})})}));
  const tap=I.tap||(S.lat!=null?[S.lat,S.lon]:null),dist=c=>tap&&c&&c[0]?llDist(tap,c):10;let pe25=0;G.forEach(g=>{const d=Math.max(...g.items.map(z=>dist(z.c)));g.dist=d;pe25+=d*1.15});
  G.forEach((g,i)=>{g.id=i+1;const a=g.items.reduce((s,z)=>s+(z.a||0),0)||1,mmh=g.t==='goutte'?2/(0.3*0.4):12,k=g.items.reduce((s,z)=>s+z.k*(z.a||1),0)/a,mmday=4*k,days=g.t==='goutte'?(g.need==='fort'?7:3):3;
    g.min=Math.max(5,Math.round(mmday*7/days/mmh*60/(g.t==='goutte'?0.9:0.75)));g.days=days;g.week=g.items.reduce((s,z)=>s+z.a*4*z.k*7,0)});
  const week=G.reduce((s,g)=>s+g.week,0),roof=+I.roof||S.shapes.filter(x=>x.kind==='obsPoly').reduce((s,x)=>s+areaLL(x.pts),0),rain=S.clim&&S.clim.pYear?S.clim.pYear:800,harvest=roof*rain*0.8;
  const cuveRec=Math.round(Math.min(Math.max(week*3,1000),Math.max(1000,harvest*0.06))/500)*500;
  return{zones:Z,G,nz:G.length,src,qmax,pe25,week,roof,harvest,cuveRec,tap}}
function irrMaterials(P){const I=S.irr,rows=[],R_=(a,q,u,d)=>rows.push([a,q,u,d||'']),drip=P.G.some(g=>g.t==='goutte'),spr=P.G.some(g=>g.t==='aspersion');
  R_(`Programmateur ${P.nz+1} stations${I.rainS?' avec sonde de pluie':''}`,1,'pièce','une station de réserve ; programmation tôt le matin');R_('Électrovannes 24 V (1")',P.nz,'pièce(s)','une par zone');R_('Regard pour électrovannes',Math.ceil(P.nz/4),'pièce(s)','');
  R_('Câble multibrins pour électrovannes',Math.ceil(Math.max(...P.G.map(g=>g.dist),5)*1.2),'m',`${P.nz+1} conducteurs`);R_('Tuyau PE 25 mm (alimentation)',Math.ceil(P.pe25+5),'m','enterré à 20–30 cm');
  if(I.src==='ville')R_('Clapet anti-retour type EA (ou disconnecteur selon le distributeur)',1,'pièce','protection obligatoire du réseau d’eau potable');
  else{R_(I.src==='cuvenew'?`Cuve enterrée ou hors sol ${nf(P.cuveRec)} L`:'Pompe pour la cuve existante',1,'pièce',I.src==='cuvenew'?`dimensionnée sur 3 semaines de besoin d’été et votre toiture (${nf(P.roof)} m²)`:'');R_(`Pompe immergée avec pressostat (≥ ${nf(Math.max(2.5,P.qmax/0.8),1)} m³/h à 3 bar)`,1,'pièce','avec flotteur de sécurité anti-marche à sec');R_('Filtre d’aspiration flottant',1,'pièce','')}
  if(drip){const len=P.zones.filter(z=>z.t==='goutte').reduce((s,z)=>s+(z.len||0),0);R_('Filtre à tamis 120 mesh',1,'pièce','');R_('Réducteur de pression 1,5 bar',P.G.filter(g=>g.t==='goutte').length,'pièce(s)','sur chaque zone de goutte-à-goutte');
    R_('Tuyau goutteur 16 mm (2 L/h, 30 cm, autorégulant)',Math.ceil(len),'m','');R_('Raccords 16 mm (tés, coudes, bouchons de fin de ligne)',Math.ceil(len/15)+10,'pièce(s)','');R_('Cavaliers de fixation',Math.ceil(len/1),'pièce(s)','un par mètre')}
  P.zones.filter(z=>z.heads).forEach(z=>{R_(z.eq.includes('turbines')?'Turbines escamotables':'Tuyères escamotables (corps 10 cm)',z.heads,'pièce(s)',z.n);R_('Buses ou têtes assorties',z.heads,'pièce(s)','secteurs 90°, 180°, 360° selon la position')});
  if(spr)R_('Prises en charge et tuyau PE 16–20 mm vers les arroseurs',Math.ceil(P.zones.filter(z=>z.heads).reduce((s,z)=>s+z.heads*4,0)),'m','');
  R_('Purgeur ou vanne de vidange (hiver)',P.nz,'pièce(s)','au point bas de chaque zone');return rows}
function renderIrr(){const box=$('#irrBox');if(!box)return;const I=S.irr,P=irrPlan();
  box.innerHTML=`<div class="card"><div class="frow"><label>Source d’eau<select data-irr="src">${opts(IRRSRC,I.src)}</select></label>
    ${I.src==='ville'?`<label>Débit au robinet (m³/h)<input type="number" data-irr="flow" min="0.3" max="6" step="0.1" value="${I.flow}"></label><label>Pression (bar)<input type="number" data-irr="bar" min="1" max="8" step="0.5" value="${I.bar}"></label>`:`<label>Débit de la pompe (m³/h)<input type="number" data-irr="pump" min="0.5" max="8" step="0.1" value="${I.pump}"></label>`}
    ${I.src==='cuve'?`<label>Volume de la cuve (L)<input type="number" data-irr="cuve" min="300" max="50000" step="100" value="${I.cuve}"></label>`:''}${I.src!=='ville'?`<label>Toiture raccordée (m²)<input type="number" data-irr="roof" min="0" max="2000" value="${I.roof||Math.round(P.roof)}"></label>`:''}
    <label class="chk"><input type="checkbox" data-irr="rainS"${I.rainS?' checked':''}> Sonde de pluie</label><button type="button" id="irrTap">📍 ${I.tap?'Déplacer':'Placer'} le point d’eau sur la carte</button></div>
    <p class="small">${I.src==='ville'?'Mesurez votre débit : chronométrez le remplissage d’un seau de 10 L robinet grand ouvert (débit m³/h = 36 ÷ secondes).':'La pompe doit fournir au moins le débit de la plus grosse zone, à 3 bar.'}</p></div>
   ${P.zones.length?`<h4>Zones d’arrosage optimisées (${P.nz} zone${P.nz>1?'s':''}, débit maximal ${nf(P.qmax,2)} m³/h par zone)</h4>
   <table class="stack"><thead><tr><th>Zone</th><th>Contenu</th><th>Système</th><th>Débit</th><th>Programme d’été</th></tr></thead><tbody>${P.G.map(g=>`<tr><td><b>Zone ${g.id}</b><br><small>besoin ${g.need}</small></td><td>${g.items.map(z=>`${esc(z.n)}<br><small>${esc(z.eq)}</small>`).join('<br>')}</td><td>${g.t==='goutte'?'Goutte-à-goutte':'Aspersion'}</td><td>${nf(g.q,2)} m³/h</td><td>${g.days} jour${g.days>1?'s':''}/semaine, ${g.min} min, entre 4 h et 7 h</td></tr>`).join('')}</tbody></table>
   <p>Besoin d’eau en plein été : <b>≈ ${nf(P.week/1000,1)} m³ par semaine</b>.${I.src==='cuve'?` Autonomie de votre cuve : ≈ ${nf(I.cuve/Math.max(1,P.week)*7,0)} jours sans pluie.`:''}${I.src!=='ville'?` Récupération possible sur ${nf(P.roof)} m² de toiture : ≈ ${nf(P.harvest/1000,0)} m³ par an.`:''}${I.src==='cuvenew'?` Cuve conseillée : <b>${nf(P.cuveRec)} L</b>.`:''}</p>
   <h4>Matériel</h4><table class="stack"><thead><tr><th>Article</th><th>Quantité</th><th>Unité</th><th>Détail</th></tr></thead><tbody>${irrMaterials(P).map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}</tbody></table>
   <ul class="small"><li>Optimisation : goutte-à-goutte sous paillis pour les massifs, haies et potager (90 % de l’eau profite aux plantes), aspersion réservée à la pelouse ; zones regroupées par besoin pour ne pas sur-arroser.</li><li>Arroser tôt le matin, moins souvent mais plus longtemps, pour des racines profondes ; couper en avril–mai et septembre dès qu’il pleut.</li><li>Pelouse : un gazon rustique supporte l’été sans arrosage ; l’aspersion peut rester en option.</li><li>Vidanger toute l’installation avant les gelées (novembre).</li></ul>`:'<p class="empty">Dessinez d’abord vos plantations (massif, haie, fruitiers, potager, pelouse, jardinières) : l’arrosage sera dimensionné automatiquement.</p>'}`}
$('#arrosage').addEventListener('change',e=>{const k=e.target.dataset.irr;if(!k)return;S.irr[k]=e.target.type==='checkbox'?(e.target.checked?1:0):k==='src'?e.target.value:parseFloat(e.target.value)||0;renderIrr();drawItems()});
$('#arrosage').addEventListener('click',e=>{if(e.target.id==='irrTap'){setMode('site');S.mode='tap';$('#map').classList.add('adding');$('#maphint').textContent='Cliquez sur la carte à l’emplacement du robinet ou de la cuve.';showTab('carte',true);toast('Cliquez sur la carte à l’emplacement du robinet ou de la cuve.')}});
{const _sc=siteClick;siteClick=function(lat,lng){if(S.mode==='tap'){S.irr.tap=[lat,lng];setMode('site');drawItems();renderIrr();toast('Point d’eau placé');return}_sc(lat,lng)}}
{const _di11=drawItems;drawItems=function(){_di11();if(!wantOn('arrosage')||!S.irr.tap)return;const P=irrPlan();L.circleMarker(S.irr.tap,{radius:8,color:'#fff',weight:3,fillColor:'#1565c0',fillOpacity:1,interactive:false}).addTo(itemsLayer);
  P.zones.forEach(z=>{if(z.c&&z.c[0])L.polyline([S.irr.tap,z.c],{color:'#1565c0',weight:2,dashArray:'6 6',interactive:false}).addTo(itemsLayer)})}}
{const _ser10=serialize;serialize=function(){const d=_ser10();d.set.irr=clone(S.irr);return d}}
{const _rs10=restoreSettings;restoreSettings=function(t){_rs10(t);if(t&&t.irr)Object.assign(S.irr,clone(t.irr));renderIrr();renderDiy()}}
{const _vs16=v4Sections;v4Sections=function(){const o=_vs16();if(wantOn('arrosage')){const P=irrPlan();if(P.zones.length)o.push({title:'ARROSAGE AUTOMATIQUE',intro:`${IRRSRC[S.irr.src]} · ${P.nz} zone(s) · besoin d’été ≈ ${nf(P.week/1000,1)} m³ par semaine${S.irr.src==='cuvenew'?' · cuve conseillée '+nf(P.cuveRec)+' L':''}.`,
  tables:[{head:['Zone','Contenu','Système','Débit (m³/h)','Programme d’été'],rows:P.G.map(g=>[`Zone ${g.id}`,g.items.map(z=>z.n+' : '+z.eq).join(' ; '),g.t==='goutte'?'Goutte-à-goutte':'Aspersion',nf(g.q,2),`${g.days} j/sem., ${g.min} min, 4 h–7 h`]),w:[1100,7400,1700,1500,3138]},{h:'Matériel',head:['Article','Quantité','Unité','Détail'],rows:irrMaterials(P),w:[5200,1300,1800,6538]}],
  bullets:['Goutte-à-goutte pour les plantations, aspersion uniquement pour la pelouse ; zones regroupées par besoin en eau.','Programmer tôt le matin ; couper en période pluvieuse (sonde de pluie).','Vidanger avant les gelées.'],bh:'Principes'})}return o}}
{const _v4h10=v4Sheets;v4Sheets=function(sh,buy){_v4h10(sh,buy);if(!wantOn('arrosage'))return;const P=irrPlan();if(!P.zones.length)return;const M=irrMaterials(P);sh.push({name:'Arrosage',head:['Article','Quantité','Unité','Détail'],rows:M});M.forEach(r=>buy.push(['Produit',r[0],'',r[1],r[2],'Arrosage — '+r[3]]))}}
WANTS.push(['arrosage','Un arrosage automatique','Goutte-à-goutte et arroseurs, eau de ville ou cuve',null],['diy','Je réalise les travaux moi-même','Étapes, outils et durée de chaque chantier',null]);
{const _ss11=stepSecs;stepSecs=function(n){const s=_ss11(n);if(n===4){if(wantOn('arrosage')&&!s.includes('arrosage'))s.push('arrosage');if(wantOn('diy')&&!s.includes('diy'))s.push('diy')}return s}}
STEPMORE[4].push(['arrosage','Arrosage automatique'],['diy','Je réalise moi-même']);
{const _rv11=renderV4;renderV4=function(){_rv11();renderIrr();renderDiy()}}

renderIrr();renderDiy();
/* ================= v12 : budget estimatif ================= */
/* Prix indicatifs TTC pour un particulier en Belgique (fourchette basse – haute), modifiables par l'utilisateur. */
const PRICE0={rate:['Main-d’œuvre d’un paysagiste','€/h HTVA',35,55],
 vivace:['Vivace (godet 9 cm à 1 L)','€/pièce',3.5,7],graminee:['Graminée (1 à 2 L)','€/pièce',4,9],fougere:['Fougère','€/pièce',5,10],arbuste:['Arbuste (conteneur 3 à 5 L)','€/pièce',12,30],arbre:['Arbre (baliveau ou tige)','€/pièce',45,150],annuelle:['Annuelle ou plante de saison','€/pièce',1.5,3.5],
 haie:['Jeune plant de haie, racines nues 60–80 cm','€/pièce',1.8,4],fruitier:['Arbre fruitier (scion à haute-tige)','€/pièce',30,90],tuteur:['Tuteur, liens et protection d’arbre','€/arbre',10,20],legume:['Plant de légume','€/pièce',0.8,2],graines:['Sachet de graines','€/sachet',2.5,4],
 compost:['Compost en vrac','€/m³',45,70],paillage:['Paillage (BRF, écorces)','€/m³',30,50],terreau:['Terreau pour jardinières','€/50 L',6,12],semence:['Semences de gazon','€/kg',8,15],
 bache:['Bâche EPDM 1 mm','€/m²',8,14],geotex:['Géotextile','€/m²',1,2],argile:['Argile à corroyer','€/m³',40,70],aquatique:['Plante aquatique','€/pièce',4,8],coco:['Toile coco ou jute','€/m²',2,4],
 rigide:['Clôture panneaux rigides (matériel)','€/m pour 1,5 m',25,50],souple:['Grillage souple (matériel)','€/m pour 1,5 m',6,15],fils:['Piquets et fils (matériel)','€/m',2,5],ganivelle:['Ganivelle (matériel)','€/m',12,22],lisses:['Poteaux et lisses bois (matériel)','€/m',12,25],
 bois:['Palissade bois (matériel)','€/m pour 1,5 m',35,80],composite:['Composite (matériel)','€/m pour 1,5 m',80,150],metal:['Barreaudage métal (matériel)','€/m pour 1,5 m',120,300],beton:['Plaques béton (matériel)','€/m pour 1,5 m',30,80],gabion:['Gabions (matériel et pierres)','€/m pour 1 m',80,200],
 portillon:['Portillon','€/pièce',150,400],portail:['Portail 3 à 4 m','€/pièce',800,2500],sacbeton:['Sac de béton 25 kg','€/sac',4,6],
 goutteur:['Tuyau goutteur 16 mm','€/m',0.4,0.9],pe25:['Tuyau PE 25 mm','€/m',1,1.8],programmateur:['Programmateur','€/pièce',80,250],vanne:['Électrovanne 24 V','€/pièce',25,50],tuyere:['Tuyère avec buse','€/pièce',10,20],turbine:['Turbine','€/pièce',18,40],
 pompe:['Pompe immergée avec pressostat','€/pièce',165,550],cuveL:['Cuve d’eau de pluie (hors pose)','€/1000 L',150,300],divers:['Petit matériel d’arrosage (filtre, réducteur, raccords, clapet)','€/zone',40,90],
 minipelle:['Location mini-pelle avec transport','€/jour',180,280],motobineuse:['Location motobineuse','€/jour',50,80],tariere:['Location tarière thermique','€/jour',45,70],rouleau:['Location rouleau à gazon','€/jour',15,25]};
const PRICE=clone(PRICE0);try{const s=JSON.parse(localStorage.getItem('plantania:prices')||'{}');Object.keys(s).forEach(k=>{if(PRICE[k])PRICE[k][2]=+s[k][0],PRICE[k][3]=+s[k][1]})}catch(e){}
const pr=(k,q)=>[PRICE[k][2]*q,PRICE[k][3]*q];
const add2=(a,b)=>[a[0]+b[0],a[1]+b[1]];
/* heures « particulier » par chantier (les pros vont environ 1,8 fois plus vite avec leur matériel) */
const HOURS={massif:a=>Math.max(2,a*0.6),haie:l=>Math.max(2,l*0.25),verger:n=>Math.max(1,n*0.75),potager:a=>Math.max(2,a*0.4),pelouse:a=>Math.max(2,a*0.08),mare:a=>Math.max(4,a*1.5),talus:a=>Math.max(2,a*0.5),cloture:l=>Math.max(3,l*0.35),jardin:n=>Math.max(1,n*0.5),arrosage:z=>Math.max(3,z*2.5)};
function budgetLines(){const L=[],push=(k,t,sup,vat,qtxt,rent)=>L.push({k,t,sup,vat,qtxt,rent:rent||[0,0]});
  if(massifOn()&&S.lastCompo){const r=S.lastCompo,a=S.bed?bedGeo().area:r.A;let s=[0,0];r.rows.forEach(x=>{const k=PRICE[x.p.t]?x.p.t:'vivace';s=add2(s,pr(k,x.qty))});
    s=add2(s,add2(pr('compost',a*0.04),pr('paillage',a*0.06)));push('massif','Massif de plantation',s,6,`${r.rows.reduce((q,x)=>q+x.qty,0)} plantes, ${nf(a)} m²`)}
  if(S.hedges.length){let s=[0,0],n=0,len=0;S.hedges.forEach(h=>{const I=hedgeInfo(h);n+=I.n;len+=I.len;s=add2(s,add2(pr('haie',I.n),pr('paillage',I.len*0.08)))});push('haie','Haies',s,6,`${n} plants, ${nf(len,1)} m`)}
  let nt=S.fruits.length;try{if(S.orchards.length||S.orch.touched)nt+=orchPlan().trees.length}catch(e){}
  if(nt)push('verger','Arbres fruitiers et verger',add2(pr('fruitier',nt),pr('tuteur',nt)),6,`${nt} arbre(s)`);
  if(S.potagers.length){const a=S.potagers.reduce((s,p)=>s+areaLL(p.pts),0);let s=pr('compost',a*0.04);try{vegPlan().parts.forEach(p=>{s=add2(s,p.seed?pr('graines',1):pr('legume',p.q||0))})}catch(e){}push('potager','Potager',s,6,`${nf(a)} m²`,pr('motobineuse',a>40?1:0))}
  if(S.boxes.length){let n=0,pl=0;S.boxes.forEach(b=>{try{const P=boxPlan(b);n+=P.n;boxCompo(b,b.sais==='h'?'h':'e').rows.forEach(x=>pl+=x.q*P.n)}catch(e){n++}});push('jardin','Jardinières (plantes et terreau)',add2(pr('annuelle',pl),pr('terreau',n*0.8)),6,`${n} jardinière(s), ${pl} plantes`)}
  const la=lawnArea();if(la){let kg=la*0.035;try{const t=lawnRank()[0].t;kg=la*t.dose/1000}catch(e){}push('pelouse','Pelouse ou prairie',add2(pr('semence',kg),[la*0.2,la*0.5]),21,`${nf(la)} m², ${nf(kg,1)} kg de semences`,add2(pr('motobineuse',la>60?1:0),pr('rouleau',1)))}
  S.ponds.forEach((p,i)=>{const I=pondInfo(p),A=I.A,lin=/bâche|EPDM/i.test(I.S.t);let s=lin?add2(pr('bache',A*1.6),pr('geotex',A*1.6)):/argile/i.test(I.S.t)&&/apport/.test(I.S.t+I.S.d)?pr('argile',A*1.25*0.2):[0,0];
    let nq=0;I.plants.forEach(Z=>Z.rows.forEach(x=>nq+=x.q));s=add2(s,pr('aquatique',nq));push('mare',`Mare ${i+1}`,s,21,`${nf(A,1)} m², ${nq} plantes aquatiques`,pr('minipelle',A>10?Math.ceil(A/25):0))});
  if(S.taluses.length){const a=S.taluses.reduce((s,t)=>s+(t.pts?areaLL(t.pts):0),0);let s=pr('coco',a);try{S.taluses.forEach(t=>{const V=talusVals(t);if(V.area)talusPlants(V).rows.forEach(x=>s=add2(s,pr(PRICE[x.p.t]?x.p.t:'vivace',x.q)))})}catch(e){}push('talus','Talus',s,6,`${nf(a)} m²`)}
  S.fences.forEach((f,i)=>{const C=fenceCalc(f),hk=f.model==='gabion'?f.h:f.h/1.5;let s=pr(f.model,C.net*Math.max(0.5,hk));s=add2(s,add2(pr('portillon',f.gates),pr('portail',f.portal)));
    const bags=(C.rows.find(r=>/sacs de 25 kg/.test(r[0]))||[0,0])[1];if(bags)s=add2(s,pr('sacbeton',bags));push('cloture',`Clôture ${i+1}`,s,21,`${nf(C.len,1)} m, ${FM[f.model].l.toLowerCase()}, ${nf(f.h,2)} m`,pr('tariere',f.fix==='beton'&&C.posts>15?Math.ceil(C.posts/40):0))});
  if(wantOn('arrosage')){const P=irrPlan();if(P.zones.length){const drip=P.zones.filter(z=>z.t==='goutte').reduce((s,z)=>s+(z.len||0),0),hd=P.zones.filter(z=>z.heads);
    let s=add2(add2(pr('goutteur',drip),pr('pe25',P.pe25+5)),add2(pr('programmateur',1),add2(pr('vanne',P.nz),pr('divers',P.nz))));hd.forEach(z=>s=add2(s,pr(z.eq.includes('turbines')?'turbine':'tuyere',z.heads)));
    if(S.irr.src!=='ville')s=add2(s,pr('pompe',1));if(S.irr.src==='cuvenew')s=add2(s,pr('cuveL',P.cuveRec/1000));push('arrosage','Arrosage automatique',s,21,`${P.nz} zone(s)${S.irr.src==='cuvenew'?', cuve de '+nf(P.cuveRec)+' L':''}`)}}
  const qty={massif:S.bed?bedGeo().area:0,haie:S.hedges.reduce((s,h)=>s+lenLL(h.pts),0),verger:nt,potager:S.potagers.reduce((s,p)=>s+areaLL(p.pts),0),pelouse:la,talus:S.taluses.reduce((s,t)=>s+(t.pts?areaLL(t.pts):0),0),jardin:S.boxes.length,arrosage:wantOn('arrosage')?irrPlan().nz:0};
  L.forEach(x=>{const v=x.k==='mare'?pondInfo(S.ponds[+x.t.split(' ')[1]-1]).A:x.k==='cloture'?fenceCalc(S.fences[+x.t.split(' ')[1]-1]).len:qty[x.k];x.hDiy=HOURS[x.k](v||1);x.hPro=x.hDiy/1.8});
  return L}
const TTC=(v,vat)=>v*(1+vat/100);
function budgetTotals(L){const r=[PRICE.rate[2],PRICE.rate[3]];let diy=[0,0],pro=[0,0];
  L.forEach(x=>{x.diy=add2([TTC(x.sup[0],x.vat),TTC(x.sup[1],x.vat)],x.rent.map(v=>TTC(v,21)));x.lab=[TTC(x.hPro*r[0],21),TTC(x.hPro*r[1],21)];x.pro=add2([TTC(x.sup[0],21),TTC(x.sup[1],21)],x.lab);diy=add2(diy,x.diy);pro=add2(pro,x.pro)});return{diy,pro,hours:L.reduce((s,x)=>s+x.hDiy,0),hpro:L.reduce((s,x)=>s+x.hPro,0)}}
const eur=v=>nf(Math.round(v/10)*10)+' €',rg=a=>`${eur(a[0])} – ${eur(a[1])}`;
function renderBudget(){const box=$('#budgetBox');if(!box)return;const L=budgetLines();
  if(!L.length){box.innerHTML='<p class="empty">Dessinez et composez d’abord les éléments de votre projet : le budget se calcule automatiquement.</p>';return}const T=budgetTotals(L),P=typeof primesOk==='function'?primesOk():[];
  box.innerHTML=`<div class="grid2 btot"><div class="card"><h4>Je fais moi-même</h4><p class="big">${rg(T.diy)}</p><p class="small">Fournitures et location de matériel, TVA comprise · environ ${nf(T.hours)} h de travail</p></div>
   <div class="card"><h4>Je fais faire par un professionnel</h4><p class="big">${rg(T.pro)}</p><p class="small">Fournitures et main-d’œuvre (${PRICE.rate[2]===PRICE.rate[3]?nf(PRICE.rate[2]):nf(PRICE.rate[2])+'–'+nf(PRICE.rate[3])} €/h HTVA), TVA 21 % comprise · environ ${nf(T.hpro)} h de chantier</p></div></div>
   <table class="stack"><thead><tr><th>Poste</th><th>Quantités</th><th>Fournitures TTC</th><th>Je fais moi-même</th><th>Main-d’œuvre pro TTC</th><th>Fait par un pro</th></tr></thead><tbody>${L.map(x=>`<tr><td><b>${esc(x.t)}</b></td><td class="small">${esc(x.qtxt)}${x.rent[1]?'<br>+ location de matériel':''}</td><td>${rg([TTC(x.sup[0],x.vat),TTC(x.sup[1],x.vat)])}</td><td>${rg(x.diy)}<br><small>${nf(x.hDiy,0)} h</small></td><td>${rg(x.lab)}</td><td><b>${rg(x.pro)}</b></td></tr>`).join('')}
   <tr class="tot"><td><b>Total</b></td><td></td><td></td><td><b>${rg(T.diy)}</b></td><td></td><td><b>${rg(T.pro)}</b></td></tr></tbody></table>
   ${P.length?`<p class="okk">Aides possibles à déduire : ${P.map(s=>esc(s.t)+' ('+esc(s.amt.split(' (')[0])+')').join(' ; ')} — voir l’onglet « Primes et subsides ».</p>`:''}
   <ul class="small"><li>Fourchettes indicatives : les prix varient selon la région, la taille des plantes, l’accès au chantier et la saison. Demandez toujours plusieurs devis.</li>
   <li>TVA : les plantes achetées par un particulier chez un pépiniériste sont à 6 % ; fournies et plantées par un entrepreneur de jardin, elles sont à 21 %, comme la main-d’œuvre.</li>
   <li>Non compris : terrassement lourd, évacuation de terres, abattage, dallage, éclairage, études et déplacements.</li></ul>
   <details class="adv" id="priceAdj"><summary>Ajuster les prix unitaires</summary><table class="stack prtable"><thead><tr><th>Article</th><th>Unité</th><th>Bas</th><th>Haut</th></tr></thead><tbody>${Object.entries(PRICE).map(([k,v])=>`<tr><td>${esc(v[0])}</td><td class="small">${esc(v[1])}</td><td><input type="number" min="0" step="0.1" data-pk="${k}" data-pi="2" value="${v[2]}"></td><td><input type="number" min="0" step="0.1" data-pk="${k}" data-pi="3" value="${v[3]}"></td></tr>`).join('')}</tbody></table><button type="button" id="priceReset">Revenir aux prix par défaut</button></details>`}
$('#budget').addEventListener('change',e=>{const k=e.target.dataset.pk;if(!k)return;PRICE[k][+e.target.dataset.pi]=Math.max(0,parseFloat(e.target.value)||0);
  try{localStorage.setItem('plantania:prices',JSON.stringify(Object.fromEntries(Object.entries(PRICE).map(([k,v])=>[k,[v[2],v[3]]]))))}catch(err){}const o=$('#priceAdj').open;renderBudget();$('#priceAdj').open=o});
$('#budget').addEventListener('click',e=>{if(e.target.id!=='priceReset')return;Object.keys(PRICE0).forEach(k=>PRICE[k]=clone(PRICE0[k]));try{localStorage.removeItem('plantania:prices')}catch(err){}renderBudget()});
{const _rv12=renderV4;renderV4=function(){_rv12();renderBudget()}}
{const _vs17=v4Sections;v4Sections=function(){const o=_vs17(),L=budgetLines();if(L.length){const T=budgetTotals(L);o.push({title:'BUDGET ESTIMATIF',intro:`Je fais moi-même : ${rg(T.diy)} (≈ ${nf(T.hours)} h de travail) · Fait par un professionnel : ${rg(T.pro)}. Montants TVA comprise, indicatifs.`,
  tables:[{head:['Poste','Quantités','Je fais moi-même','Main-d’œuvre pro','Fait par un pro'],rows:[...L.map(x=>[x.t,x.qtxt,rg(x.diy),rg(x.lab),rg(x.pro)]),['Total','',rg(T.diy),'',rg(T.pro)]],w:[2800,4200,2600,2600,2638]}],
  bullets:['Prix indicatifs pour la Belgique, à confirmer par des devis.','Plantes achetées par un particulier : TVA 6 % ; fournies par un entrepreneur de jardin : TVA 21 %, comme la main-d’œuvre.','Non compris : terrassement lourd, évacuation de terres, abattage, dallage, éclairage.'],bh:'À savoir'})}return o}}
{const _v4h11=v4Sheets;v4Sheets=function(sh,buy){_v4h11(sh,buy);const L=budgetLines();if(!L.length)return;const T=budgetTotals(L),R2=v=>Math.round(v);
  sh.push({name:'Budget',head:['Poste','Quantités','Fournitures TTC min','Fournitures TTC max','Moi-même min','Moi-même max','Heures (moi-même)','Pro min','Pro max'],rows:[...L.map(x=>[x.t,x.qtxt,R2(TTC(x.sup[0],x.vat)),R2(TTC(x.sup[1],x.vat)),R2(x.diy[0]),R2(x.diy[1]),R2(x.hDiy),R2(x.pro[0]),R2(x.pro[1])]),['Total','','','',R2(T.diy[0]),R2(T.diy[1]),R2(T.hours),R2(T.pro[0]),R2(T.pro[1])]]})}}

/* ================= v12 : rappels d'entretien dans l'agenda (.ics) ================= */
function careTasksByMonth(){const M=Array.from({length:12},()=>new Map()),add=(m,t,who)=>{if(m<1||m>12)return;const s=M[m-1].get(t)||new Set();if(who)s.add(who);M[m-1].set(t,s)};
  if(massifOn()&&S.lastCompo){try{renderCompo()}catch(e){}document.querySelectorAll('#cal .mo').forEach(mo=>{const m=MOL.findIndex(x=>x.toLowerCase()===mo.querySelector('h4').textContent.trim().toLowerCase())+1;mo.querySelectorAll('li').forEach(li=>add(m,li.textContent.trim(),'massif'))})}
  if(typeof maintCal==='function')maintCal().forEach(x=>add(x.mo,x.t,[...x.ns].join(', ')));
  if(S.hedges.length){add(6,'Taille des haies (après la nidification si possible)','haies');add(9,'Seconde taille des haies','haies');add(11,'Pailler le pied des haies','haies')}
  if(S.fruits.length||S.orchards.length){add(2,'Taille d’hiver des pommiers et poiriers','fruitiers');add(6,'Éclaircir les fruits trop nombreux','fruitiers');add(8,'Taille des pruniers et cerisiers après récolte','fruitiers');add(11,'Ramasser les feuilles et fruits tombés','fruitiers')}
  if(lawnArea()){add(4,'Première tonte haute, scarifier si mousse','pelouse');add(9,'Regarnir les zones dégarnies de la pelouse','pelouse')}
  if(S.ponds.length){add(3,'Mare : retirer l’excès de feuilles et vase (sans vider)','mare');add(10,'Mare : couper les plantes de berge sur un tiers seulement','mare')}
  if(S.potagers.length){add(3,'Potager : préparer les planches et le compost','potager');add(5,'Potager : plantations après les Saints de glace','potager');add(10,'Potager : semer un engrais vert','potager')}
  if(wantOn('arrosage')){add(4,'Arrosage : remise en route, contrôle des goutteurs et du filtre','arrosage');add(11,'Arrosage : vidange avant les gelées','arrosage')}
  if(S.fences.some(f=>['bois','ganivelle','lisses'].includes(f.model)))add(5,'Clôture bois : contrôle, et lasure tous les 2 à 3 ans','clôture');
  return M}
function icsText(opt){const M=careTasksByMonth(),now=new Date(),yr=now.getFullYear(),pad=n=>String(n).padStart(2,'0'),stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const esc_=s=>String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n'),fold=l=>{const out=[];let s=l;while(new TextEncoder().encode(s).length>73){let i=73;while(new TextEncoder().encode(s.slice(0,i)).length>73)i--;out.push(s.slice(0,i));s=' '+s.slice(i)}out.push(s);return out.join('\r\n')};
  const dayCode={sa:'SA',su:'SU'}[opt.day]||'SA',nth=opt.nth||1;
  const firstDate=(y,m)=>{const d=new Date(y,m-1,1),target=dayCode==='SA'?6:0;while(d.getDay()!==target)d.setDate(d.getDate()+1);d.setDate(d.getDate()+7*(nth-1));return d};
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Plantania//Entretien du jardin//FR','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Entretien du jardin (Plantañ.ia)'];let n=0;
  M.forEach((mp,i)=>{if(!mp.size)return;const m=i+1;let d=firstDate(yr,m);if(d<new Date(now.getFullYear(),now.getMonth(),now.getDate()))d=firstDate(yr+1,m);
    const ev=(sum,desc,k)=>{n++;const ds=`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`,de=new Date(d);de.setDate(de.getDate()+1);
      lines.push('BEGIN:VEVENT',`UID:plantania-${PRJ.id||'p'}-${m}-${k}@plantania`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${ds}`,`DTEND;VALUE=DATE:${de.getFullYear()}${pad(de.getMonth()+1)}${pad(de.getDate())}`,`RRULE:FREQ=YEARLY;BYMONTH=${m};BYDAY=${nth}${dayCode}`,
        fold('SUMMARY:'+esc_(sum)),fold('DESCRIPTION:'+esc_(desc)),'TRANSP:TRANSPARENT','BEGIN:VALARM','ACTION:DISPLAY',fold('DESCRIPTION:'+esc_(sum)),`TRIGGER:-P${opt.alarm||1}D`,'END:VALARM','END:VEVENT')};
    const T=[...mp].map(([t,w])=>`• ${t}${w.size?' ('+[...w].join(', ')+')':''}`);
    if(opt.mode==='task')[...mp].forEach(([t,w],k)=>ev(`🌿 ${t}`,`${t}${w.size?'\n'+[...w].join(', '):''}\n\nPlantañ.ia — ${PRJ.name||'Mon projet'}`,k));
    else ev(`🌿 Jardin : travaux de ${MOL[i]}`,`${T.join('\n')}\n\nPlantañ.ia — ${PRJ.name||'Mon projet'}`,0)});
  lines.push('END:VCALENDAR');return{text:lines.join('\r\n')+'\r\n',n}}
function exportIcs(){const o={mode:$('#icsMode').value,day:$('#icsDay').value.slice(1),nth:+$('#icsDay').value[0],alarm:+$('#icsAlarm').value},R_=icsText(o);
  if(!R_.n){toast('Aucune tâche d’entretien : composez d’abord votre projet ou analysez des photos dans l’onglet Entretien.');return}
  download(new Blob([R_.text],{type:'text/calendar;charset=utf-8'}),'plantania-entretien.ics');toast(`${R_.n} rappel(s) d’entretien exporté(s), répétés chaque année`)}
const ICS_UI=`<div class="card icscard"><h4>📅 Rappels d’entretien dans mon agenda</h4><div class="frow"><label>Regrouper<select id="icsMode"><option value="month">Un rappel par mois (liste des travaux)</option><option value="task">Un rappel par tâche</option></select></label>
  <label>Jour<select id="icsDay"><option value="1sa">1er samedi du mois</option><option value="1su">1er dimanche du mois</option><option value="2sa">2e samedi du mois</option><option value="3sa">3e samedi du mois</option></select></label>
  <label>Me prévenir<select id="icsAlarm"><option value="1">la veille</option><option value="3">3 jours avant</option><option value="7">une semaine avant</option></select></label><button type="button" class="pri" id="icsGo">Télécharger le calendrier (.ics)</button></div>
  <p class="small">Le fichier fonctionne avec Google Agenda (Paramètres → Importer et exporter → Importer), l’iPhone ou le Mac (ouvrir le fichier → Ajouter tout) et Outlook (ouvrir le fichier). Les rappels se répètent chaque année ; pour les mettre à jour après un changement de projet, supprimez l’ancien calendrier puis importez le nouveau.</p></div>`;
$('#exMsg').closest('.chips').insertAdjacentHTML('afterend',ICS_UI);
document.addEventListener('click',e=>{if(e.target.id==='icsGo')exportIcs()});
$('#mtCal').insertAdjacentHTML('afterend','<div class="chips"><button type="button" id="icsGo2">📅 Ajouter ces rappels à mon agenda</button></div>');
$('#icsGo2').addEventListener('click',()=>{showTab('export',true);setTimeout(()=>$('.icscard').scrollIntoView({behavior:'smooth',block:'center'}),300)});
{const _ss12=stepSecs;stepSecs=function(n){const s=_ss12(n);if(n===5&&!s.includes('budget'))s.unshift('budget');return s}}
STEPMORE[4].push(['budget','Budget estimatif']);

renderBudget();
/* ================= v13 : photos du rapport plus fiables ================= */
{const _gp=getPhoto;getPhoto=async function(latin){const r=await _gp(latin);if(r&&r.src)return r;const q=photoKey(latin),g=q.split(' ')[0];
  for(const u of[`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/ /g,'_'))}`,`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(g)}`,`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(g)}`]){
    try{const j=await getJSON(u,8000);if(j&&j.thumbnail&&j.thumbnail.source){const res={src:j.thumbnail.source,credit:'Wikipédia / Wikimedia Commons',link:(j.content_urls&&j.content_urls.desktop&&j.content_urls.desktop.page)||''};PHC[q]=res;try{localStorage.setItem('plantania:ph:'+q,JSON.stringify(res))}catch(e){}return res}}catch(e){}}
  return r}}
/* rapport Word : si le site de la photo refuse le téléchargement direct, passer par un relais d'images public */
{const _ib=imgBytes;imgBytes=async function(url){const r=await _ib(url);if(r||!url||/^data:/.test(url))return r;return _ib(`https://wsrv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//,''))}&w=700&output=jpg`)}}
/* rapport PDF : précharger les photos avant l'impression */
{const _ep=exportPdf;exportPdf=async function(){exMsg('Chargement des photos du rapport…');return _ep()}}

/* ================= v13 : profils de la mare et liste de plantation dans les rapports ================= */
const PDEPTH={berge:['0 à 10 cm d’eau','en pleine terre humide, 4 par m²'],palier:['10 à 30 cm d’eau','en panier ou dans le substrat, 3 par m²'],oxy:['40 à 100 cm','brins lestés jetés au fond'],flot:['60 cm et plus','panier posé au fond']};
function pondZoneKey(z){return /Berge/i.test(z)?'berge':/Palier/i.test(z)?'palier':/oxyg/i.test(z)?'oxy':'flot'}
{const _vs18=v4Sections;v4Sections=function(){const o=_vs18();S.ponds.forEach((p,i)=>{try{const I=pondInfo(p),rows=I.plants.flatMap(Z=>Z.rows.map(x=>{const D=PDEPTH[pondZoneKey(Z.z)];return[Z.z,x.n,x.l,x.q,D[0],D[1]]}));
  if(rows.length)o.push({title:`MARE ${i+1} : LISTE DE PLANTATION`,intro:`${rows.reduce((s,r)=>s+r[3],0)} plantes aquatiques${p.pstyle==='jap'||pondJap(p)?' (ambiance japonaise)':' indigènes'} · plantation de mai à juin, après la mise en eau.`,tables:[{head:['Zone','Plante','Nom latin','Quantité','Profondeur','Mise en place'],rows,w:[2600,2600,2800,1100,2000,3738]}],
   bullets:['Ne jamais introduire de poissons : ils mangent les larves d’amphibiens et de libellules.','N’achetez pas de plantes invasives (jussie, myriophylle du Brésil, élodées exotiques, crassule de Helms).']})}catch(e){}});return o}}
const svgHost=()=>{let d=$('#svgHost');if(!d){d=document.createElement('div');d.id='svgHost';d.style.cssText='position:fixed;left:-10000px;top:0;width:640px;pointer-events:none';document.body.appendChild(d)}return d};
async function svgStrToPng(str,w){const h=svgHost();h.style.width=(w||640)+'px';h.innerHTML=str;const sv=h.querySelector('svg');if(!sv)return null;sv.style.width=(w||640)+'px';sv.style.height='auto';await new Promise(r=>requestAnimationFrame(r));try{return await svgToPng(sv)}catch(e){return null}finally{h.innerHTML=''}}
{const _cr11=collectReport;collectReport=async function(){const R=await _cr11();for(const s of R.sections||[]){if(s.svg){s.pngs=[];for(let k=0;k<s.svg.length;k++)s.pngs.push(await svgStrToPng(s.svg[k],k?640:320))}}return R}}

/* ================= v13 : primes toujours consultables ================= */
{const _rp13=renderPrimes;renderPrimes=function(){_rp13();const b=document.querySelector('#tabs [data-tab=primes]');if(b)b.hidden=false;$('#primes').classList.remove('gone');
  if(!primesOk().length){const reg=regionKey();$('#primesBox').innerHTML=`<p class="empty">Aucune prime ni subside connu pour les éléments actuels de votre projet${PLACE.region?' en '+esc(PLACE.region):''}.</p>
   <p class="small">Les aides publiques concernent surtout la plantation de haies indigènes, de vergers hautes-tiges et d’alignements d’arbres${reg==='bxl'?', ainsi que certaines primes communales (végétalisation, eau de pluie)':''}. Les clôtures, pelouses et massifs d’ornement n’en bénéficient généralement pas.</p>
   <p class="small"><a href="https://www.google.com/search?q=${encodeURIComponent('prime jardin biodiversité '+(PLACE.commune||''))}" target="_blank" rel="noopener">Vérifier les primes de votre commune</a></p>`}}}
{const _ss13=stepSecs;stepSecs=function(n){const s=_ss13(n);if(n===5&&!s.includes('primes'))s.splice(1,0,'primes');return s}}

/* ================= v13 : liens entre aménagements ================= */
const JAPPOND={berge:[['Primevère du Japon','Primula japonica'],['Iris du Japon','Iris ensata'],['Populage des marais','Caltha palustris']],palier:[['Iris lisse du Japon','Iris laevigata'],['Jonc fleuri','Butomus umbellatus'],['Iris des marais','Iris pseudacorus']]};
const geomPts=(k,it)=>{const P=k==='bed'?it.ll:it.pts?it.pts:[[it.lat,it.lng]],out=[];P.forEach((a,i)=>{out.push(a);const b=P[(i+1)%P.length];if(b&&P.length>1)out.push([(a[0]+b[0])/2,(a[1]+b[1])/2])});return out};
function minD(A,B){let d=1e9;A.forEach(a=>B.forEach(b=>{const x=llDist(a,b);if(x<d)d=x}));return d}
function nearJapBed(p,dist){if(!S.bed||!S.lastCompo||!massifOn()||S.lastCompo.key!=='jap')return false;return minD(geomPts('bed',S.bed),geomPts('pond',p))<(dist||6)}
function pondJap(p){return p.pstyle==='jap'||(p.pstyle!=='nat'&&nearJapBed(p))}
{const _pi=pondInfo;pondInfo=function(p){const I=_pi(p);if(!pondJap(p))return I;I.plants=I.plants.map(Z=>{const k=pondZoneKey(Z.z);if(!JAPPOND[k]||!Z.rows.length)return Z;const tot=Z.rows.reduce((s,x)=>s+x.q,0),sp=JAPPOND[k];
  return{z:Z.z,rows:sp.map((x,i)=>({n:x[0],l:x[1],q:Math.floor(tot/sp.length)+(i<tot%sp.length?1:0)}))}});return I}}
{const _rpo2=renderPonds;renderPonds=function(){_rpo2();document.querySelectorAll('#pondBox [data-k=ponds]').forEach(c=>{const p=S.ponds.find(x=>x.id==c.dataset.id);if(!p||c.querySelector('[data-pst]'))return;const fr=c.querySelector('.frow');
  if(fr)fr.insertAdjacentHTML('beforeend',`<label>Ambiance de la mare<select data-pst="${p.id}"><option value="auto"${!p.pstyle||p.pstyle==='auto'?' selected':''}>Assortie au massif voisin</option><option value="nat"${p.pstyle==='nat'?' selected':''}>Naturelle (plantes indigènes)</option><option value="jap"${p.pstyle==='jap'?' selected':''}>Japonaise</option></select></label>`);
  const h=[...c.querySelectorAll('h4')].find(x=>/Plantes aquatiques/.test(x.textContent));if(h&&!c.querySelector('.plhead')){const n=pondInfo(p).plants.reduce((s,Z)=>s+Z.rows.reduce((a,x)=>a+x.q,0),0);if(pondJap(p))h.lastChild.textContent='Plantes de la mare (ambiance japonaise)';h.insertAdjacentHTML('afterend',`<p class="plhead okk">Liste de plantation : ${n} plantes, à planter de mai à juin après la mise en eau.</p>`)}})}}
$('#pondBox').addEventListener('change',e=>{const id=e.target.dataset.pst;if(!id)return;const p=S.ponds.find(x=>x.id==id);if(!p)return;p.pstyle=e.target.value;renderExtras()});
function interactions(){const L=[],bedP=S.bed&&massifOn()?geomPts('bed',S.bed):null,st=S.lastCompo&&S.lastCompo.key,stl=S.lastCompo&&S.lastCompo.st.l;
  const trees=[...S.fruits.map(f=>({n:FRUITS[f.sp].n,pts:[[f.lat,f.lng]],h:5})),...S.obs.filter(o=>o.type==='caduc').map(o=>({n:'Arbre caduc existant',pts:[[o.lat,o.lng]],h:o.h}))];
  if(S.lastCompo&&bedP&&S.lastCompo.rows.some(x=>x.p.t==='arbre'))trees.push({n:'Arbre du massif',pts:bedP,h:Math.max(...S.lastCompo.rows.filter(x=>x.p.t==='arbre').map(x=>x.p.h))});
  S.ponds.forEach((p,i)=>{const pp=geomPts('pond',p),nm=`mare ${i+1}`;
    if(bedP){const d=minD(bedP,pp);if(d<4){const hum=PL.filter(x=>['vivace','fougere','graminee'].includes(x.t)&&x.w.includes('h')&&(!st||x.st.includes(st))&&!S.custom.some(c=>c.l===x.l)&&!S.lastCompo.rows.some(r=>r.p.l===x.l)).slice(0,3);
      L.push({lvl:'tip',t:`Massif et ${nm} : une transition humide`,d:`Le massif est à ${nf(d,1)} m de la mare. Sur le côté qui la borde, le sol reste plus frais : des plantes de milieu humide feront le lien entre le massif et la berge${st==='jap'?' ; pour le style japonais, la mare passe automatiquement en ambiance japonaise (iris du Japon, primevères, pas japonais en pierre)':''}.`,act:hum.length?{l:`Ajouter ${hum.map(x=>x.n).join(', ')} au bord du massif`,fn:()=>{hum.forEach(x=>S.custom.push({l:x.l,qty:3}));refreshPlants(false);toast('Plantes de transition ajoutées au massif')}}:null})}}
    trees.forEach(tr=>{const d=minD(tr.pts,pp);if(d<Math.max(4,tr.h)){const c=cen(tr.pts),cp=cen(pp),south=c[0]<cp[0];L.push({lvl:'mid',t:`${tr.n} près de la ${nm}`,d:`À ${nf(d,1)} m : les feuilles tombent dans l’eau (vase, manque d’oxygène)${south?' et l’arbre, au sud de la mare, l’ombrage':''}. Prévoyez un filet à l’automne ou placez les arbres au nord de la mare.`})}});
    S.taluses.forEach(t=>{if(t.pts&&minD(geomPts('t',t),pp)<5)L.push({lvl:'tip',t:`Talus au-dessus de la ${nm}`,d:'Le ruissellement apporte terre et nutriments dans la mare : gardez une bande enherbée de 1 m entre les deux et couvrez le talus (toile coco, couvre-sols).'})});
    if(S.potagers.some(v=>minD(geomPts('v',v),pp)<20))L.push({lvl:'ok',t:`Potager et ${nm} : bon voisinage`,d:'Grenouilles, crapauds et carabes issus de la mare régulent limaces et insectes du potager. N’utilisez aucun produit qui ruissellerait vers l’eau.'});
    if(wantOn('arrosage'))L.push({lvl:'tip',t:`Arrosage et ${nm}`,d:'Orientez les arroseurs pour ne pas arroser la mare, et faites déborder son trop-plein vers une zone d’infiltration ou un massif humide plutôt que vers l’égout.'})});
  const shaders=[...S.hedges.map((h,i)=>({n:`Haie ${i+1} (${nf(h.h||1.8,1)} m à terme)`,pts:h.pts,h:h.h||1.8})),...S.fences.filter(f=>!FM[f.model].open).map((f,i)=>({n:`Clôture pleine (${nf(f.h,1)} m)`,pts:f.pts,h:f.h})),...S.shapes.map(s=>({n:s.name,pts:s.pts,h:s.h}))];
  const targets=[...(bedP?[{n:'le massif',pts:bedP}]:[]),...S.potagers.map((v,i)=>({n:`le potager ${i+1}`,pts:geomPts('v',v)})),...S.lawns.map((l,i)=>({n:`la pelouse ${i+1}`,pts:geomPts('l',l)}))];
  shaders.forEach(sh=>targets.forEach(tg=>{const d=minD(sh.pts,tg.pts),cs=cen(sh.pts),ct=cen(tg.pts);if(d<sh.h*2&&cs[0]<ct[0])L.push({lvl:'mid',t:`${sh.n} : ombre sur ${tg.n}`,d:`Placée au sud, à ${nf(d,1)} m, elle ombrage ${tg.n} une partie de la journée. Cette ombre est prise en compte dans l’ensoleillement et le choix des plantes${tg.n.includes('potager')?' ; gardez les légumes-fruits (tomates, courgettes) du côté le plus éloigné':''}.`})}));
  S.potagers.forEach((v,i)=>{trees.concat(S.hedges.map(h=>({n:'Haie',pts:h.pts,h:h.h||1.8}))).forEach(tr=>{const d=minD(tr.pts,geomPts('v',v));if(d<3)L.push({lvl:'mid',t:`${tr.n} trop proche du potager ${i+1}`,d:`À ${nf(d,1)} m, ses racines concurrencent les légumes pour l’eau et les nutriments. Gardez 3 m ou posez une barrière anti-racines.`})})});
  if(bedP)S.lawns.forEach((l,i)=>{if(minD(bedP,geomPts('l',l))<1)L.push({lvl:'tip',t:`Massif et pelouse ${i+1} se touchent`,d:'Prévoyez une bordure (acier, pierre ou bois) ou une bande de tonte de 20 cm : la tondeuse passe sans abîmer les plantes et le gazon n’envahit pas le massif.'})});
  S.hedges.forEach((h,i)=>S.fences.forEach((f,j)=>{if(minD(h.pts,f.pts)<1)L.push({lvl:'tip',t:`Haie ${i+1} le long de la clôture ${j+1}`,d:'La haie masquera la clôture en 2 à 3 ans. Plantez-la à 50 cm au moins de la limite et prévoyez l’accès pour la tailler des deux côtés si la clôture est mitoyenne.'})}));
  if(S.orchards.length&&S.lawns.length)L.push({lvl:'tip',t:'Verger et pelouse',d:'Sous les arbres fruitiers, une prairie fleurie fauchée deux fois par an remplace avantageusement le gazon : moins de tontes, plus de pollinisateurs.'});
  if(st==='eco'&&S.hedges.length)L.push({lvl:'ok',t:'Massif écologique et haie champêtre',d:'Ensemble, ils forment un corridor pour la faune : laissez un passage à hérissons dans la clôture et un tas de bois au pied de la haie.'});
  if(st==='jap'&&S.lawns.length)L.push({lvl:'tip',t:'Style japonais et pelouse',d:'Près du massif japonais, une zone de mousse, de gravier ratissé ou de couvre-sols (Ophiopogon, Acaena) prolongera mieux l’ambiance qu’un gazon.'});
  return L}
function renderCoherence(){const box=$('#cohBox');if(!box)return;const L=interactions();window.__inter=L;
  box.innerHTML=L.length?`<ul class="cohlist">${L.map((x,i)=>`<li class="${x.lvl}"><b>${esc(x.t)}</b><br><span>${esc(x.d)}</span>${x.act?`<br><button type="button" data-coh="${i}">${esc(x.act.l)}</button>`:''}</li>`).join('')}</ul>`:'<p class="empty">Dessinez au moins deux éléments (massif, mare, haie, potager, pelouse, clôture…) : Plantañ.ia vérifie comment ils interagissent et adapte les compositions.</p>'}
$('#coherence').addEventListener('click',e=>{const i=e.target.dataset.coh;if(i==null||!window.__inter)return;const x=window.__inter[+i];if(x&&x.act){pushUndo();x.act.fn();renderCoherence()}});
{const _oa=obsAll;obsAll=function(){const r=_oa();if(r!==S._xsRef){S._xsRef=r;
  S.hedges.forEach(h=>{const P=h.pts;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],k=Math.max(1,Math.round(llDist(a,b)/2));for(let j=0;j<k;j++){const t=j/k;r.push({lat:a[0]+(b[0]-a[0])*t,lng:a[1]+(b[1]-a[1])*t,h:h.h||1.8,w:2.2,type:/persist|thuya|laurier|if/i.test(h.type||'')?'pers':'caduc'})}}});
  S.fences.filter(f=>!FM[f.model].open).forEach(f=>{const P=f.pts;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],k=Math.max(1,Math.round(llDist(a,b)/2));for(let j=0;j<k;j++){const t=j/k;r.push({lat:a[0]+(b[0]-a[0])*t,lng:a[1]+(b[1]-a[1])*t,h:f.h,w:2.2,type:'bat'})}}})}return r}}
{const _rv13=renderV4;renderV4=function(){_rv13();renderCoherence()}}
{const _ic13=itemsChanged;itemsChanged=function(sh){S.samples=null;_ic13(true)}}
{const _vs19=v4Sections;v4Sections=function(){const o=_vs19(),L=interactions();if(L.length){const i=o.findIndex(s=>s.title==='VOTRE PROJET');o.splice(i+1,0,{top:1,title:'LIENS ENTRE VOS AMÉNAGEMENTS',tables:[{head:['','Point','Conseil'],rows:L.map(x=>[x.lvl==='ok'?'✓':x.lvl==='mid'?'!':'i',x.t,x.d]),w:[600,4200,10038]}]})}return o}}
{const _ss14=stepSecs;stepSecs=function(n){const s=_ss14(n);if(n===4&&interactions().length&&!s.includes('coherence'))s.unshift('coherence');return s}}

/* ================= v13 : sections et cartes repliables ================= */
const FOLD=new Set(JSON.parse(localStorage.getItem('plantania:fold')||'[]'));const foldKey=el=>(el.closest('section.band')||{}).id+'|'+[...el.childNodes].filter(n=>!(n.classList&&n.classList.contains('foldb'))).map(n=>n.textContent).join('').trim().slice(0,40);
function foldPass(){document.querySelectorAll('section.band .shead > h2').forEach(h=>{if(h.querySelector('.foldb'))return;h.insertAdjacentHTML('afterbegin','<button type="button" class="foldb" aria-expanded="true" title="Masquer ou afficher">▾</button>');const sec=h.closest('section.band'),k='sec|'+sec.id;if(FOLD.has(k))setFold(h.querySelector('.foldb'),true,sec,k,1)});
  document.querySelectorAll('section.band .card > h4:first-child, section.band .card > summary + h4').forEach(h=>{if(h.querySelector('.foldb')||h.closest('.mtcard'))return;h.insertAdjacentHTML('afterbegin','<button type="button" class="foldb small" aria-expanded="true" title="Masquer ou afficher">▾</button>');const k=foldKey(h);if(FOLD.has(k))setFold(h.querySelector('.foldb'),true,h.parentElement,k,1)})}
function setFold(b,on,box,k,silent){box.classList.toggle('folded',on);b.setAttribute('aria-expanded',String(!on));b.textContent=on?'▸':'▾';if(silent)return;on?FOLD.add(k):FOLD.delete(k);try{localStorage.setItem('plantania:fold',JSON.stringify([...FOLD]))}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('.foldb');if(!b)return;e.preventDefault();e.stopPropagation();const h=b.parentElement;if(h.tagName==='H2'){const sec=h.closest('section.band');setFold(b,!sec.classList.contains('folded'),sec,'sec|'+sec.id)}else{const box=h.parentElement;setFold(b,!box.classList.contains('folded'),box,foldKey(h))}},true);
{let ft=null;new MutationObserver(()=>{clearTimeout(ft);ft=setTimeout(foldPass,120)}).observe(document.body,{childList:true,subtree:true})}
foldPass();

renderCoherence();
{const _vs20=v4Sections;v4Sections=function(){const o=_vs20();o.filter(x=>/^MARE \d+ : LISTE/.test(x.title)).forEach(L=>{const k=L.title.split(' :')[0],i=o.indexOf(L);o.splice(i,1);const j=o.findIndex(x=>x.title===k+' : PROFILS DE TERRASSEMENT');o.splice(j>=0?j+1:o.length,0,L)});const b=o.findIndex(x=>x.title==='BUDGET ESTIMATIF');if(b>=0)o.push(o.splice(b,1)[0]);return o}}
/* ================= v14 : accès au chantier (réaliser soi-même) ================= */
S.acc=Object.assign({w:'',stairs:false,house:false,vois:false,vw:'',dem:false,demL:3,demT:'rigide',haie:false,haieL:5,haieAge:'jeune'},S.acc||{});
const ACCM=[[2.5,'Très large','Mini-pelle de 2,5 à 3 t et dumper ; le camion de livraison (terre, gravier, plantes) peut approcher du chantier.'],
 [1.5,'Large','Mini-pelle de 1,5 à 1,8 t (environ 1 à 1,3 m de large) et mini-dumper ; terre et matériaux livrés en big bag à l’entrée.'],
 [1.0,'Moyen','Mini-pelle compacte d’environ 1 t et mini-dumper chenillé (0,8 à 1 m de large selon le modèle).'],
 [0.75,'Étroit','Micro-pelle à voies rétractables (environ 0,7 à 0,75 m de large : vérifiez le modèle chez le loueur), brouette motorisée ou mini-dumper étroit.'],
 [0,'Très étroit','Aucun engin ne passe : tout se fait à la main et à la brouette (environ 0,6 m de large).']];
const ACCF=[1,1,1.05,1.15,1.35];
const DEMG={rigide:'pan',metal:'pan',composite:'pan',bois:'bois',lisses:'bois',souple:'fil',fils:'fil',ganivelle:'fil',beton:'beton',gabion:'gab'};
const DEMTXT={pan:['Dévissez les attaches et retirez un ou deux panneaux (environ 2,5 m chacun). Les poteaux restent en place si l’engin passe entre eux ; sinon, un poteau sera à resceller au remontage.',0.4],
 bois:['Dévissez les lames ou les panneaux, numérotez-les et stockez-les à plat, à l’abri ; prévoyez des vis neuves (inox) pour le remontage.',0.8],
 fil:['Détendez le grillage ou les fils aux tendeurs, défaites les ligatures et enroulez-le ; retendez-le au remontage avec des fils de tension neufs.',0.5],
 beton:['Soulevez les plaques par le haut, à deux (40 à 80 kg chacune), et stockez-les debout contre un appui ; les poteaux restent en place.',1],
 gab:['Les gabions ne se démontent pas facilement : prévoyez un autre passage ou faites appel à un professionnel.',2]};
const accNum=v=>{const x=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(x)&&x>0?x:null};
function accOn(){const a=S.acc;return accNum(a.w)!=null||!!(a.vois||a.dem||a.haie||a.stairs||a.house)}
function accEff(){const a=S.acc;let w=accNum(a.w),via='par l’accès habituel';if(a.house){w=w==null?0.8:w;via='à travers la maison'}
  if(a.vois){const v=accNum(a.vw);if(v!=null&&(w==null||v>w)){w=v;via='par chez le voisin'}}
  if(a.dem&&a.demT!=='gabion'){const d=accNum(a.demL);if(d!=null&&(w==null||d>w)){w=d;via='par la clôture démontée'}}
  let cls=w==null?null:ACCM.findIndex(m=>w>=m[0]);if(cls!=null&&a.stairs&&via!=='par chez le voisin'&&via!=='par la clôture démontée')cls=Math.min(4,cls+1);
  return{w,via,cls,M:cls==null?null:ACCM[cls]}}
const ACCK=['mare','potager','pelouse','massif','talus','cloture','verger','haie','pasjap'];
function accFactor(k){if(!accOn()||!ACCK.includes(k))return 1;const E=accEff();let f=E.cls==null?1:ACCF[E.cls];if(S.acc.stairs)f+=0.15;if(E.via==='à travers la maison')f+=0.1;return f}
function accVol(){return S.ponds.reduce((s,p)=>{try{return s+pondInfo(p).vol*1.25}catch(e){return s}},0)}
function accAdvice(){const a=S.acc,E=accEff(),tips=[],rows=[];
  if(E.w!=null){rows.push(['Passage retenu',`${nf(E.w,2)} m, ${E.via}`],['Catégorie',E.M[1]],['Matériel qui passe',E.M[2]])}
  if(a.stairs){tips.push('Marches sur le trajet : posez une rampe provisoire en madriers pour la brouette ; un engin à chenilles ne passe qu’avec une rampe adaptée et un opérateur expérimenté.');rows.push(['Marches','oui'])}
  if(a.house){tips.push('Passage par la maison : protégez sols et portes (bâches, cartons), transportez terre et gravats en sacs ou en seaux ; comptez nettement plus de temps.');rows.push(['Accès','à travers la maison'])}
  if(a.vois){tips.push('Passage chez le voisin : demandez son accord écrit (dates, trajet, engins prévus, remise en état), prenez des photos avant le chantier et prévenez votre assurance responsabilité civile familiale.','Protégez sa pelouse avec des plaques de protection de sol ou des panneaux de contreplaqué ; ratissez et regarnissez juste après le passage.');rows.push(['Passage chez le voisin',accNum(a.vw)?nf(accNum(a.vw),2)+' m':'oui'])}
  if(a.dem){const g=DEMG[a.demT]||'pan';tips.push(`Clôture à ouvrir (${nf(accNum(a.demL)||3,1)} m, ${FM[a.demT]?FM[a.demT].l.toLowerCase():''}) : ${DEMTXT[g][0]}`,'Si la clôture est mitoyenne, prévenez le voisin et convenez du remontage. Fermez l’ouverture le soir (barrière de chantier) si vous avez des animaux ou des enfants, et remontez-la dès la fin du terrassement.');rows.push(['Clôture démontée provisoirement',`${nf(accNum(a.demL)||3,1)} m, ${FM[a.demT]?FM[a.demT].l.toLowerCase():''}`])}
  if(a.haie){const l=accNum(a.haieL)||5;tips.push(a.haieAge==='etablie'?'Haie installée (plus de 5 ans) : la reprise est incertaine, surtout pour les persistants (thuya, if, laurier). Il est souvent plus sûr et moins cher de replanter de jeunes plants après les travaux ; sinon, faites appel à un professionnel équipé d’une transplanteuse.':'Haie jeune (moins de 5 ans) : la reprise est bonne si la motte reste entière.',
    'Période : de novembre à mars, hors gel, pour les caducs ; octobre ou mars–avril pour les persistants. Évitez d’avril à juillet (nidification des oiseaux).',
    'La veille, arrosez abondamment ; rabattez les branches d’un tiers et liez-les pour faciliter la manutention.',
    'Prélevez chaque plant avec sa motte (30 à 50 cm de diamètre pour des plants de 1 à 1,5 m) et emballez-la dans une toile de jute.',
    'Mise en jauge : serrez les mottes dans une tranchée à l’ombre, hors du passage des engins, couvrez de terre ou de paille humide et arrosez chaque semaine.',
    'Replantez au même niveau dans les 2 à 6 semaines, avec du compost ; arrosez chaque semaine sans pluie jusqu’à la fin de l’été suivant.');rows.push(['Haie transplantée',`${nf(l,1)} m, ${a.haieAge==='etablie'?'installée':'jeune'}`])}
  const V=accVol();if(V>0.3&&E.w!=null){const nb=Math.ceil(V/0.08);tips.push(`Terre à sortir de la mare : environ ${nf(V,1)} m³ foisonnés, soit ${nb} brouettes de 80 L${E.cls<=2?` ou ${Math.ceil(V/0.5)} rotations de mini-dumper (0,5 m³)`:''}. Gardez-la plutôt sur place (butte, talus) pour éviter les trajets.`)}
  if(E.w!=null){tips.push('Mesurez au point le plus étroit (portillon, allée entre la maison et la limite) et vérifiez la hauteur libre (avant-toit, branches basses).','Repérez ce qui est enterré sur le trajet (citerne, fosse septique, égouts, câbles) : un engin peut l’écraser. Protégez la pelouse avec des plaques de protection.');
    if(E.cls>0)tips.push('Livraisons : un camion a besoin d’environ 3 m de large ; faites déposer terre et matériaux en big bag à l’entrée, puis transférez-les à la brouette ou au dumper.')}
  const f=accFactor('mare');const res=E.w!=null?`<div class="accres"><b>Passage retenu : ${nf(E.w,2)} m, ${esc(E.via)} — ${esc(E.M[1])}</b><br>${esc(E.M[2])}${f>1.001?`<br><small>Durées des chantiers de terrassement et de plantation majorées d’environ ${Math.round((f-1)*100)} % dans le budget.</small>`:''}</div>`:(accOn()?'<p class="small">Indiquez la largeur du passage le plus étroit pour connaître le matériel qui passe.</p>':'');
  return{res,tips,rows}}
function accCard(){const a=S.acc,ck=(k,l)=>`<label class="chk"><input type="checkbox" data-acc="${k}"${a[k]?' checked':''}> ${l}</label>`,A=accAdvice();
  const fo=Object.keys(FM).map(k=>`<option value="${k}"${a.demT===k?' selected':''}>${esc(FM[k].l)}</option>`).join('');
  return `<div class="card acccard"><h4>Accès au chantier</h4><p class="small">Par où passeront les machines, la terre et les plantes ? Vos réponses adaptent le matériel conseillé, les durées et le budget.</p>
  <div class="frow"><label>Largeur du passage le plus étroit (m)<input type="number" min="0" step="0.05" data-accv="w" value="${esc(String(a.w||''))}" placeholder="1,1"></label></div>
  <div class="accopts">${ck('stairs','Marches ou escalier sur le trajet')}${ck('house','Seul accès : à travers la maison')}${ck('vois','Passage possible chez un voisin')}${a.vois?`<span class="sub"><label>Largeur du passage chez le voisin (m)<input type="number" min="0" step="0.05" data-accv="vw" value="${esc(String(a.vw||''))}"></label></span>`:''}
  ${ck('dem','Démonter provisoirement une clôture ou une palissade')}${a.dem?`<span class="sub"><label>Longueur à ouvrir (m)<input type="number" min="0.5" step="0.5" data-accv="demL" value="${esc(String(a.demL))}"></label><label>Type<select data-accv="demT">${fo}</select></label></span>`:''}
  ${ck('haie','Transplanter une haie pendant les travaux')}${a.haie?`<span class="sub"><label>Longueur de haie (m)<input type="number" min="1" step="0.5" data-accv="haieL" value="${esc(String(a.haieL))}"></label><label>Âge<select data-accv="haieAge"><option value="jeune"${a.haieAge!=='etablie'?' selected':''}>Jeune (moins de 5 ans)</option><option value="etablie"${a.haieAge==='etablie'?' selected':''}>Installée (plus de 5 ans)</option></select></label></span>`:''}</div>
  ${A.res}${A.tips.length?`<ul class="small acctips">${A.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}</div>`}
{const _rd14=renderDiy;renderDiy=function(){_rd14();const box=$('#diyBox');if(box)box.insertAdjacentHTML('afterbegin',accCard())}}
$('#diy').addEventListener('change',e=>{const t=e.target;if(t.dataset.acc){S.acc[t.dataset.acc]=t.checked}else if(t.dataset.accv){S.acc[t.dataset.accv]=t.value}else return;renderDiy();if(typeof renderBudget==='function')renderBudget()});
{const _ser14=serialize;serialize=function(){const d=_ser14();d.set.acc=clone(S.acc);if(S.plan)d.set.plan=clone(S.plan);return d}}
{const _rs14=restoreSettings;restoreSettings=function(t){_rs14(t);if(t&&t.acc)Object.assign(S.acc,clone(t.acc))}}
{const _rp14=resetProject;resetProject=function(){_rp14();S.acc={w:'',stairs:false,house:false,vois:false,vw:'',dem:false,demL:3,demT:'rigide',haie:false,haieL:5,haieAge:'jeune'}}}

/* --- budget : accès, démontage, transplantation, pas japonais --- */
Object.assign(PRICE0,{pasjap:['Pas japonais (dalle ou pierre plate 40–50 cm)','€/pièce',8,25],plaques:['Location de plaques de protection de sol (lot)','€/jour',30,80]});
['pasjap','plaques'].forEach(k=>{if(!PRICE[k])PRICE[k]=clone(PRICE0[k])});
try{const s=JSON.parse(localStorage.getItem('plantania:prices')||'{}');['pasjap','plaques'].forEach(k=>{if(s[k])PRICE[k][2]=+s[k][0],PRICE[k][3]=+s[k][1]})}catch(e){}
HOURS.pasjap=n=>Math.max(1,n*0.25);
{const _bl14=budgetLines;budgetLines=function(){const L=_bl14();const jp=S.paths.filter(p=>p.nat==='pasjap'),nj=jp.reduce((s,p)=>s+(p.n||stepsN(pathLen(p))),0);
  if(nj){const h=HOURS.pasjap(nj);L.push({k:'pasjap',t:'Chemins en pas japonais',sup:pr('pasjap',nj),vat:21,qtxt:`${nj} pierres`,rent:[0,0],hDiy:h,hPro:h/1.8})}
  if(accOn()){const E=accEff(),a=S.acc;L.forEach(x=>{const f=accFactor(x.k);x.hDiy*=f;x.hPro*=f*(E.cls===4&&['mare','potager','pelouse','talus'].includes(x.k)?1.5:1);if(E.cls===4)x.rent=[0,0]});
    if(a.dem){const g=DEMG[a.demT]||'pan',l=accNum(a.demL)||3,h=l*DEMTXT[g][1]*2;L.push({k:'acces',t:'Démontage et remontage provisoire de clôture',sup:[10,40],vat:21,qtxt:`${nf(l,1)} m`,rent:[0,0],hDiy:h,hPro:h/1.8})}
    if(a.haie){const l=accNum(a.haieL)||5,h=l*(a.haieAge==='etablie'?2.5:1);L.push({k:'acces',t:'Transplantation provisoire de haie',sup:add2(add2(pr('compost',l*0.05),pr('paillage',l*0.08)),[l,l*2]),vat:21,qtxt:`${nf(l,1)} m de haie`,rent:[0,0],hDiy:h,hPro:h/1.8})}
    if(a.vois)L.push({k:'acces',t:'Passage chez le voisin : protection et remise en état',sup:pr('semence',1),vat:21,qtxt:'Plaques de protection, regarnissage',rent:pr('plaques',2),hDiy:3,hPro:2})}
  return L}}
{const _vs20=v4Sections;v4Sections=function(){const o=_vs20();if(wantOn('diy')&&accOn()){const A=accAdvice();if(A.rows.length||A.tips.length){const i=o.findIndex(s=>s.title==='RÉALISER LES TRAVAUX SOI-MÊME'),sec={title:'ACCÈS AU CHANTIER',tables:A.rows.length?[{head:['Point','Détail'],rows:A.rows,w:[4000,10838]}]:[],bullets:A.tips,bh:'Conseils'};
  if(i>=0)o.splice(i+1,0,sec);else o.push(sec)}}return o}}

/* ================= v14 : propositions automatiques (déplacer, pas japonais) ================= */
const mPer=lat=>111320*Math.cos(lat*Math.PI/180);
const shiftLL=(P,dx,dy)=>P.map(p=>[p[0]+dy/111320,p[1]+dx/mPer(p[0])]);
function inPolyLL(pt,poly){let ins=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[0]>pt[0])!==(b[0]>pt[0]))&&(pt[1]<(b[1]-a[1])*(pt[0]-a[0])/(b[0]-a[0])+a[1]))ins=!ins}return ins}
const densP=P=>geomPts('x',{pts:P});
const DIR8=['l’est','le nord-est','le nord','le nord-ouest','l’ouest','le sud-ouest','le sud','le sud-est'];
const dir8=(dx,dy)=>DIR8[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
const stepsN=d=>Math.max(2,Math.round(Math.max(0,d-0.6)/0.62)+1);
const pathLen=p=>p.pts&&p.pts.length===4?llDist(p.pts[0],p.pts[1]):Math.sqrt(areaLL(p.pts)/0.5);
const mvPts=(k,it)=>k==='fruits'?[[it.lat,it.lng]]:it.pts;
function distPtPoly(q,P){if(P.length>2&&inPolyLL(q,P))return 0;const mp=mPer(q[0]),T=p=>[(p[1]-q[1])*mp,(p[0]-q[0])*111320];let d=1e9;for(let i=0;i<P.length;i++){const a=T(P[i]),b=T(P[(i+1)%P.length]),vx=b[0]-a[0],vy=b[1]-a[1],L2=vx*vx+vy*vy,t=L2?Math.max(0,Math.min(1,-(a[0]*vx+a[1]*vy)/L2)):0;d=Math.min(d,Math.hypot(a[0]+vx*t,a[1]+vy*t))}return d}
function mvPtsBlock(it){return[...S.fruits.filter(f=>f!==it).map(f=>[f.lat,f.lng]),...S.obs.map(o=>[o.lat,o.lng])]}
function mvBlock(it){const B=[];if(S.bed&&massifOn())B.push(S.bed.ll);['ponds','potagers','paths'].forEach(k=>(S[k]||[]).forEach(x=>{if(x!==it&&x.pts&&x.pts.length>2)B.push(x.pts)}));S.shapes.forEach(s=>{if(s.kind==='obsPoly'&&s.pts&&s.pts.length>2)B.push(s.pts)});return B}
function findMove(k,it,bad,from){const P0=mvPts(k,it),c=cen(P0),vx=(c[1]-from[1])*mPer(c[0]),vy=(c[0]-from[0])*111320,a0=(Math.abs(vx)+Math.abs(vy))>1e-6?Math.atan2(vy,vx):Math.PI/2,B=mvBlock(it),BP=mvPtsBlock(it);
  for(let d=0.5;d<=15;d+=0.5)for(const da of[0,Math.PI/4,-Math.PI/4,Math.PI/2,-Math.PI/2]){const dx=Math.cos(a0+da)*d,dy=Math.sin(a0+da)*d,P=shiftLL(P0,dx,dy);
    if(bad(P))continue;if(S.plots&&S.plots.length&&!P.every(p=>S.plots.some(pl=>inPolyLL(p,pl.pts))))continue;
    if(B.some(b=>P.some(p=>inPolyLL(p,b))||(P.length>2&&b.some(q=>inPolyLL(q,P)))))continue;if(P.length>2&&BP.some(q=>distPtPoly(q,P)<(k==='potagers'?3:k==='ponds'?5:1.5)))continue;return{dx,dy,d}}return null}
function doMove(k,it,m){if(k==='fruits'){const p=shiftLL([[it.lat,it.lng]],m.dx,m.dy)[0];it.lat=p[0];it.lng=p[1]}else if(it.raw){it.raw=shiftLL(it.raw,m.dx,m.dy);regeom(it,closedOf(k,it))}else it.pts=shiftLL(it.pts,m.dx,m.dy);
  itemsChanged(true);if(S.editing)drawHandles();toast('Élément déplacé.',{undo:true})}
const mvAct=(lab,k,it,m)=>m?{l:`${lab} de ${nf(m.d,1)} m vers ${dir8(m.dx,m.dy)}`,fn:()=>doMove(k,it,m)}:null;
function addStepPath(A,B,name){let best=null;A.forEach(a=>B.forEach(b=>{const d=llDist(a,b);if(!best||d<best.d)best={a,b,d}}));if(!best||best.d<0.8){toast('Les deux zones se touchent déjà.');return}
  const o=best.a,bx=(best.b[1]-o[1])*mPer(o[0]),by=(best.b[0]-o[0])*111320,Ln=Math.hypot(bx,by),ux=bx/Ln,uy=by/Ln,nx=-uy,ny=ux,w=0.25,s0=0.25,s1=Ln-0.25;
  const P=[[s0,w],[s1,w],[s1,-w],[s0,-w]].map(([t,q])=>{const x=ux*t+nx*q,y=uy*t+ny*q;return[o[0]+y/111320,o[1]+x/mPer(o[0])]});
  const id=++itemId,n=stepsN(Ln);S.paths.push({id,pts:P,raw:P.map(p=>p.slice()),smooth:false,nat:'pasjap',name,n});itemsChanged(false);toast(`Chemin en pas japonais tracé : ${n} pierres sur ${nf(Ln,1)} m.`,{undo:true})}
PATHN.pasjap='Chemin en pas japonais';
{const _int14=interactions;interactions=function(){const L=_int14(),free=t=>L.find(x=>x.t===t&&!x.act);
  S.ponds.forEach((p,i)=>{const pp=geomPts('pond',p),nm=`mare ${i+1}`;
    S.fruits.forEach(f=>{const n=FRUITS[f.sp].n,e=free(`${n} près de la ${nm}`);if(!e)return;
      e.act=mvAct(`Déplacer : ${n}`,'fruits',f,findMove('fruits',f,P=>minD(P,pp)<5,cen(pp)))||mvAct(`Éloigner la ${nm}`,'ponds',p,findMove('ponds',p,P=>minD([[f.lat,f.lng]],densP(P))<5,[f.lat,f.lng]))});
    S.obs.filter(o=>o.type==='caduc').forEach(o=>{const th=Math.max(4,o.h),e=free(`Arbre caduc existant près de la ${nm}`);if(!e)return;e.act=mvAct(`Éloigner la ${nm}`,'ponds',p,findMove('ponds',p,P=>minD([[o.lat,o.lng]],densP(P))<th,[o.lat,o.lng]))})});
  const bedP=S.bed&&massifOn()?geomPts('bed',S.bed):null;
  const shaders=[...S.hedges.map((h,j)=>({n:`Haie ${j+1} (${nf(h.h||1.8,1)} m à terme)`,pts:h.pts,h:h.h||1.8})),...S.fences.filter(f=>!FM[f.model].open).map(f=>({n:`Clôture pleine (${nf(f.h,1)} m)`,pts:f.pts,h:f.h})),...S.shapes.map(s=>({n:s.name,pts:s.pts,h:s.h}))];
  S.potagers.forEach((v,i)=>{const vp=geomPts('v',v);
    S.fruits.forEach(f=>{const n=FRUITS[f.sp].n,e=free(`${n} trop proche du potager ${i+1}`);if(!e)return;e.act=mvAct(`Déplacer : ${n}`,'fruits',f,findMove('fruits',f,P=>minD(P,vp)<3,cen(vp)))});
    [...S.obs.filter(o=>o.type==='caduc').map(o=>({n:'Arbre caduc existant',pts:[[o.lat,o.lng]]})),...(bedP&&S.lastCompo&&S.lastCompo.rows.some(x=>x.p.t==='arbre')?[{n:'Arbre du massif',pts:bedP}]:[]),...S.hedges.map(h=>({n:'Haie',pts:h.pts}))].forEach(tr=>{const e=free(`${tr.n} trop proche du potager ${i+1}`);if(!e)return;e.act=mvAct(`Éloigner le potager ${i+1}`,'potagers',v,findMove('potagers',v,P=>minD(tr.pts,densP(P))<3,cen(tr.pts)))});
    shaders.forEach(sh=>{const e=free(`${sh.n} : ombre sur le potager ${i+1}`);if(!e)return;const cs=cen(sh.pts);e.act=mvAct(`Déplacer le potager ${i+1}`,'potagers',v,findMove('potagers',v,P=>{const D=densP(P);return minD(sh.pts,D)<sh.h*2&&cs[0]<cen(P)[0]},cs))})});
  const hasJP=(A,B)=>S.paths.some(x=>minD(x.pts,A)<1.5&&minD(x.pts,B)<1.5),st=S.lastCompo&&S.lastCompo.key;
  if(st==='jap'&&bedP)S.ponds.forEach((p,i)=>{const pp=geomPts('pond',p),d=minD(bedP,pp);if(d>1&&d<25&&!hasJP(bedP,pp))L.push({lvl:'tip',t:`Relier le massif japonais et la mare ${i+1}`,d:`Un chemin en pas japonais de ${nf(d,1)} m (environ ${stepsN(d)} pierres plates de 40 à 50 cm, espacées de 60 à 65 cm) invite à la promenade et protège le sol de la berge.`,act:{l:'Tracer le chemin en pas japonais',fn:()=>addStepPath(bedP,pp,'Massif japonais – mare')}})});
  if(S.potagers.length){const homes=[...S.shapes.filter(s=>s.kind==='obsPoly').map(s=>({n:'la maison',pts:geomPts('s',s)})),...S.paths.filter(x=>x.nat==='terrasse').map(x=>({n:'la terrasse',pts:geomPts('p',x)}))];
    S.potagers.forEach((v,i)=>{const vp=geomPts('v',v);let best=null;homes.forEach(h=>{const d=minD(h.pts,vp);if(!best||d<best.d)best={...h,d}});
      if(best&&best.d>2&&best.d<40&&!hasJP(best.pts,vp))L.push({lvl:'tip',t:`Une allée vers le potager ${i+1}`,d:`Le potager est à ${nf(best.d,1)} m de ${best.n}. Une allée en pas japonais (environ ${stepsN(best.d)} dalles) garde les pieds au sec pour la cueillette quotidienne et évite de tasser la pelouse.`,act:{l:'Tracer une allée en pas japonais',fn:()=>addStepPath(best.pts,vp,'Allée du potager')}})})}
  return L}}
/* pierres dessinées sur la carte */
{const _di14=drawItems;drawItems=function(){_di14();if(!L.circle)return;S.paths.filter(p=>p.nat==='pasjap'&&p.pts&&p.pts.length===4).forEach(p=>{const P=p.pts,a=[(P[0][0]+P[3][0])/2,(P[0][1]+P[3][1])/2],b=[(P[1][0]+P[2][0])/2,(P[1][1]+P[2][1])/2],n=p.n||stepsN(llDist(a,b));
  for(let j=0;j<n;j++){const t=n>1?j/(n-1):0.5;L.circle([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],{radius:0.22,color:'#5d5d5d',weight:1,fillColor:'#bdbdbd',fillOpacity:.95,interactive:false}).addTo(itemsLayer)}})}}
DIY.pasjap={t:'Chemin en pas japonais',when:'Toute l’année, hors gel',dur:n=>`≈ ${nf(Math.max(1,n*0.25),1)} h pour ${n} pierres`,lvl:'Facile',tools:'Bêche, niveau, maillet en caoutchouc, sable, cordeau',
 s:['Poser les pierres sur le gazon ou le sol en suivant le tracé et ajuster l’espacement à votre pas (60 à 65 cm de centre à centre).','Détourer chaque pierre à la bêche, retirer la motte sur l’épaisseur de la pierre plus 3 cm.','Étaler 3 cm de sable, poser la pierre et la caler au maillet, 1 cm sous le niveau du gazon pour laisser passer la tondeuse.','Vérifier la stabilité de chaque pierre en marchant dessus ; regarnir les joints de terre.']};
{const _dl14=diyList;diyList=function(){const L=_dl14(),jp=S.paths.filter(p=>p.nat==='pasjap');if(jp.length)L.push(['pasjap',jp.reduce((s,p)=>s+(p.n||stepsN(pathLen(p))),0)]);return L}}

/* ================= v14 : carte précise et verrouillable ================= */
if(L.control&&L.control.scale){try{L.control.scale({imperial:false,maxWidth:140,position:'topright'}).addTo(map)}catch(e){}}
let MAPLOCK=false;try{MAPLOCK=localStorage.getItem('plantania:lock')==='1'}catch(e){}
function applyLock(){['dragging','touchZoom','scrollWheelZoom','doubleClickZoom','boxZoom','keyboard'].forEach(h=>{const x=map[h];if(!x||!x.disable)return;
  if(MAPLOCK)x.disable();else if(h==='dragging'){if(typeof syncFree==='function')syncFree();else x.enable()}else if(h==='doubleClickZoom'){if(S.mode in SHAPE_MODES)x.disable();else x.enable()}else x.enable()});
  const w=$('#mapwrap');if(w)w.classList.toggle('locked',MAPLOCK);const b=$('#mapLock');if(b){b.setAttribute('aria-pressed',String(MAPLOCK));b.innerHTML=MAPLOCK?'<span aria-hidden="true">🔒</span> Carte verrouillée':'<span aria-hidden="true">🔓</span> Verrouiller la carte'}
  const f=$('#lockFab');if(f){f.textContent=MAPLOCK?'🔒':'🔓';f.title=MAPLOCK?'Carte verrouillée : toucher pour la déverrouiller':'Verrouiller la carte (elle ne bouge plus par erreur)';f.setAttribute('aria-pressed',String(MAPLOCK))}}
function toggleLock(){MAPLOCK=!MAPLOCK;try{localStorage.setItem('plantania:lock',MAPLOCK?'1':'0')}catch(e){}applyLock();toast(MAPLOCK?'Carte verrouillée : elle ne se déplace plus. Les boutons + et − restent actifs ; vous pouvez toujours dessiner.':'Carte déverrouillée.')}
{const _sf14=syncFree;syncFree=function(){_sf14();if(MAPLOCK&&map.dragging)map.dragging.disable()}}
{const _sm14=setMode;setMode=function(m){_sm14(m);if(MAPLOCK&&map.doubleClickZoom)map.doubleClickZoom.disable()}}
$('#mapLock').addEventListener('click',toggleLock);$('#lockFab').addEventListener('click',e=>{e.stopPropagation();toggleLock()});
['click','dblclick','mousedown','touchstart','pointerdown'].forEach(ev=>$('#lockFab').addEventListener(ev,e=>e.stopPropagation()));
let zHint14=0;
function onZoom14(){planPos();const z=map.getZoom?map.getZoom():0;if(!zHint14&&z>19.5&&map.hasLayer&&map.hasLayer(sat)&&S.lat>49.4&&S.lat<51.6&&S.lon>2.5&&S.lon<6.5){zHint14=1;toast('Vous zoomez au-delà de la photo satellite : pour une image plus nette, choisissez le fond « Orthophoto régionale » dans les couches.')}}
if(map.on)map.on('zoomend viewreset resize',onZoom14);

/* ================= v14 : plan existant importé (géomètre, architecte, paysagiste) ================= */
S.plan=null;S.planCal=null;let PLANIMG='';let planEl=null;
const planLayer=L.layerGroup().addTo(map),calLayer=L.layerGroup().addTo(map);
const PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/legacy/build/';
if(map.createPane){try{map.createPane('planPane');const pn=map.getPane('planPane');pn.style.zIndex=350;pn.style.pointerEvents='none'}catch(e){}}
const plTh=()=>S.plan.rot*Math.PI/180,plH=()=>S.plan.w*S.plan.ih/S.plan.iw;
function planPt(u,v){const P=S.plan,t=plTh(),x=Math.cos(t)*u-Math.sin(t)*v,y=Math.sin(t)*u+Math.cos(t)*v;return[P.c[0]-y/111320,P.c[1]+x/mPer(P.c[0])]}
function llToPx(lat,lng){const P=S.plan,t=plTh(),dx=(lng-P.c[1])*mPer(P.c[0]),dy=-(lat-P.c[0])*111320,u=Math.cos(t)*dx+Math.sin(t)*dy,v=-Math.sin(t)*dx+Math.cos(t)*dy,s=P.w/P.iw;return{px:u/s+P.iw/2,py:v/s+P.ih/2}}
function pxToLL(px,py){const s=S.plan.w/S.plan.iw;return planPt((px-S.plan.iw/2)*s,(py-S.plan.ih/2)*s)}
function planPos(){if(!S.plan||!planEl||!map.latLngToLayerPoint||!map.getZoom)return;const P=S.plan,p=map.latLngToLayerPoint(P.c),mpp=40075016.686*Math.cos(P.c[0]*Math.PI/180)/(256*Math.pow(2,map.getZoom())),wpx=P.w/mpp,hpx=wpx*P.ih/P.iw,st=planEl.style;
  st.left=(p.x-wpx/2)+'px';st.top=(p.y-hpx/2)+'px';st.width=wpx+'px';st.height=hpx+'px';st.transform=`rotate(${P.rot}deg)`;st.opacity=P.op;st.display=P.hide?'none':'';const pn=planEl.parentNode;if(pn&&pn.style)pn.style.mixBlendMode=P.mul?'multiply':'normal'}
function planHandles(){if(planLayer.clearLayers)planLayer.clearLayers();if(!S.plan||S.plan.lock||S.plan.hide||!L.marker)return;
  const mk=L.marker(S.plan.c,{draggable:true,zIndexOffset:1300,title:'Déplacer le plan',icon:L.divIcon({className:'',html:'<span class="vh mv plmv">✥</span>',iconSize:[30,30],iconAnchor:[15,15]})}).addTo(planLayer);
  mk.on('drag',()=>{const q=mk.getLatLng();S.plan.c=[q.lat,q.lng];planPos()});mk.on('dragend',()=>{planHandles();drawPlanCal();renderPlanPanel();planSaveSoon()});
  const rk=L.marker(planPt(0,-plH()/2-Math.max(1.5,S.plan.w*0.05)),{draggable:true,zIndexOffset:1300,title:'Tourner le plan',icon:L.divIcon({className:'',html:'<span class="vh mv plrot">⟳</span>',iconSize:[30,30],iconAnchor:[15,15]})}).addTo(planLayer);
  rk.on('drag',()=>{const q=rk.getLatLng(),dx=(q.lng-S.plan.c[1])*mPer(S.plan.c[0]),dy=-(q.lat-S.plan.c[0])*111320;S.plan.rot=Math.round(Math.atan2(dx,-dy)*1800/Math.PI)/10;planPos()});rk.on('dragend',()=>{planHandles();drawPlanCal();renderPlanPanel();planSaveSoon()})}
function planMount(){if(planEl){planEl.remove();planEl=null}if(planLayer.clearLayers)planLayer.clearLayers();
  if(S.plan&&PLANIMG){const pn=map.getPane&&map.getPane('planPane');if(pn){planEl=document.createElement('img');planEl.className='planimg leaflet-zoom-hide';planEl.alt='';planEl.src=PLANIMG;pn.appendChild(planEl)}planPos();planHandles()}
  drawPlanCal();renderPlanPanel()}
let planT14=0;function planSaveSoon(){clearTimeout(planT14);planT14=setTimeout(()=>saveNow(true),500)}
function planStore(){if(!PLANIMG)return true;if(!PRJ.id)saveNow(true);if(!PRJ.id)return false;try{localStorage.setItem('plantania:plan:'+PRJ.id,PLANIMG);return true}catch(e){return false}}
function fitCanvas(src,w,h,max){const k=Math.min(1,max/Math.max(w,h)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(w*k));cv.height=Math.max(1,Math.round(h*k));const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(src,0,0,cv.width,cv.height);return cv}
const loadImg=src=>new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ko(new Error('image illisible : utilisez un fichier JPG, PNG ou PDF'));i.src=src});
async function pdfLib(){if(window.__pdfjs)return window.__pdfjs;let m;try{m=await import(PDFJS+'pdf.min.mjs')}catch(e){throw new Error('lecteur PDF indisponible (connexion internet nécessaire), ou exportez le plan en image JPG ou PNG')}m.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.mjs';return window.__pdfjs=m}
async function pdfRender(buf,n){const lib=await pdfLib(),doc=await lib.getDocument({data:new Uint8Array(buf.slice(0))}).promise,pg=await doc.getPage(Math.max(1,Math.min(n||1,doc.numPages))),v1=pg.getViewport({scale:1}),sc=Math.min(5,3000/Math.max(v1.width,v1.height)),v=pg.getViewport({scale:sc});
  const cv=document.createElement('canvas');cv.width=Math.round(v.width);cv.height=Math.round(v.height);const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);await pg.render({canvas:cv,canvasContext:x,viewport:v}).promise;return{cv,mm:v1.width*25.4/72,pages:doc.numPages}}
let PLANPDF=null;
async function planFromCanvas(cv,meta,keepPos){let data=cv.toDataURL('image/jpeg',0.88);PLANIMG=data;
  const iw=cv.width,ih=cv.height,old=S.plan;
  if(keepPos&&old){S.plan={...old,...meta,iw,ih}}else{const c=map.getCenter?map.getCenter():null,cc=c?[c.lat,c.lng]:[S.lat,S.lon];let w=40;try{const b=map.getBounds();w=Math.min(80,Math.max(10,llDist([cc[0],b.getWest()],[cc[0],b.getEast()])*0.6))}catch(e){}
    S.plan={name:meta.name,iw,ih,c:cc,w:meta.pdfmm?meta.pdfmm/1000*100:w,ech:meta.pdfmm?100:'',rot:0,op:0.75,mul:true,lock:false,hide:false,page:1,pages:meta.pages||1,pdfmm:meta.pdfmm||null,step:0.1}}
  if(!planStore()){const cv2=fitCanvas(cv,cv.width,cv.height,1800);PLANIMG=cv2.toDataURL('image/jpeg',0.8);S.plan.iw=cv2.width;S.plan.ih=cv2.height;if(!planStore())toast('Plan trop lourd pour être mémorisé dans ce navigateur : il reste affiché tant que la page est ouverte.')}
  if(MAPLOCK===false&&map.setView&&!keepPos)try{map.setView(S.plan.c,Math.min(21,map.getZoom()))}catch(e){}
  planMount();saveNow(true)}
async function planImport(f){if(/\.(dwg|dxf)$/i.test(f.name)){toast('Les fichiers DWG ou DXF ne sont pas lus : demandez un export PDF (ou une image) à votre géomètre ou architecte.');return}
  toast('Import du plan…');let cv,meta={name:f.name};
  if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){const buf=await f.arrayBuffer();PLANPDF=buf;const r=await pdfRender(buf,1);cv=r.cv;meta.pdfmm=r.mm;meta.pages=r.pages}
  else{PLANPDF=null;const url=URL.createObjectURL(f);try{const im=await loadImg(url);cv=fitCanvas(im,im.naturalWidth,im.naturalHeight,3000)}finally{URL.revokeObjectURL(url)}}
  await planFromCanvas(cv,meta,false);showTab('carte',true);toast('Plan importé : placez-le avec ✥ et ⟳, puis calez-le sur deux repères pour le mettre exactement à l’échelle.')}
function planFit(){const C=S.planCal,P=C.pairs;if(P.length<2)return;const o=P[0].tl,mp=mPer(o[0]);let su=0,sv=0,sx=0,sy=0;const n=P.length;
  P.forEach(q=>{q.x=(q.tl[1]-o[1])*mp;q.y=-(q.tl[0]-o[0])*111320;su+=q.px;sv+=q.py;sx+=q.x;sy+=q.y});const mu=su/n,mv=sv/n,mx=sx/n,my=sy/n;let A=0,B=0,D=0;
  P.forEach(q=>{const u=q.px-mu,v=q.py-mv,x=q.x-mx,y=q.y-my;A+=u*x+v*y;B+=u*y-v*x;D+=u*u+v*v});if(D<1e-9){toast('Choisissez deux repères éloignés l’un de l’autre.');C.pairs.pop();return}
  const a=A/D,b=B/D,s=Math.hypot(a,b),th=Math.atan2(b,a),uc=S.plan.iw/2-mu,vc=S.plan.ih/2-mv,xc=a*uc-b*vc+mx,yc=b*uc+a*vc+my;
  S.plan.c=[o[0]-yc/111320,o[1]+xc/mp];S.plan.w=s*S.plan.iw;S.plan.rot=Math.round(th*18000/Math.PI)/100;S.plan.ech=S.plan.pdfmm?Math.round(S.plan.w*1000/S.plan.pdfmm):S.plan.ech;
  let e=0;P.forEach(q=>{const u=q.px-mu,v=q.py-mv;e=Math.max(e,Math.hypot(a*u-b*v+mx-q.x,b*u+a*v+my-q.y))});C.err=e;planPos();planHandles();planSaveSoon()}
function planCalStart(kind){if(!S.plan)return;S.plan.hide=false;if(S.plan.lock)S.plan.lock=false;setMode('site');S.mode='planpt';S.planCal={kind,pairs:[],cur:null,pts:[]};$('#map').classList.add('adding');showTab('carte',true);planHandles();planPos();planCalHint();renderPlanPanel();drawPlanCal()}
function planCalEnd(){S.planCal=null;calLayer.clearLayers&&calLayer.clearLayers();setMode('site');renderPlanPanel()}
function planCalText(){const C=S.planCal;if(!C)return'';if(C.kind==='scale')return C.pts.length<2?`Échelle : cliquez sur le plan la ${C.pts.length?'seconde':'première'} extrémité d’une cote connue (une longueur écrite sur le plan, par exemple la façade).`:'Indiquez ci-dessous la distance réelle entre les deux points.';
  return !C.cur?`Calage, repère ${C.pairs.length+1} : cliquez un repère bien visible SUR LE PLAN (angle de maison, borne, piquet).`:`Calage, repère ${C.pairs.length+1} : cliquez maintenant ce même repère À SA VRAIE PLACE sur la photo aérienne ou le cadastre.`}
function planCalHint(){$('#maphint').textContent=planCalText()}
function drawPlanCal(){if(calLayer.clearLayers)calLayer.clearLayers();const C=S.planCal;if(!C||!S.plan||!L.circleMarker)return;const dot=(ll,col)=>L.circleMarker(ll,{radius:7,color:'#fff',weight:2,fillColor:col,fillOpacity:1,interactive:false}).addTo(calLayer);
  (C.pairs||[]).forEach(q=>{const a=pxToLL(q.px,q.py);dot(a,'#e65100');dot(q.tl,'#2e7d32');if(L.polyline)L.polyline([a,q.tl],{color:'#e65100',weight:2,dashArray:'4 4',interactive:false}).addTo(calLayer)});
  if(C.cur)dot(pxToLL(C.cur.px,C.cur.py),'#e65100');(C.pts||[]).forEach(q=>dot(pxToLL(q.px,q.py),'#6a1b9a'));if(C.pts&&C.pts.length===2&&L.polyline)L.polyline(C.pts.map(q=>pxToLL(q.px,q.py)),{color:'#6a1b9a',weight:3,interactive:false}).addTo(calLayer)}
{const _sc14=siteClick;siteClick=function(lat,lng){if(S.mode!=='planpt'||!S.planCal||!S.plan)return _sc14(lat,lng);const C=S.planCal;
  if(C.kind==='scale'){if(C.pts.length<2)C.pts.push(llToPx(lat,lng))}
  else if(!C.cur)C.cur=llToPx(lat,lng);else{C.pairs.push({...C.cur,tl:[lat,lng]});C.cur=null;if(C.pairs.length>=2)planFit()}
  drawPlanCal();planCalHint();renderPlanPanel()}}
function renderPlanPanel(){const box=$('#planPanel');if(!box)return;if(!S.plan||!PLANIMG){box.hidden=true;box.innerHTML='';return}box.hidden=false;const P=S.plan,C=S.planCal,dis=P.lock?' disabled':'';
  const cal=C?`<div class="calbox"><b>${esc(planCalText())}</b>${C.kind==='pts'?`<br><small>${C.pairs.length} repère(s) calé(s)${C.pairs.length>=2?` · écart maximal ${nf(C.err||0,2)} m${C.pairs.length===2?' (ajoutez un 3e repère pour vérifier)':''}`:''}</small>`:''}
    ${C.kind==='scale'&&C.pts.length===2?`<div class="plrow"><label>Distance réelle (m)<input type="number" min="0.1" step="0.01" id="plDist"></label><button type="button" data-pl="dist" class="pri">Appliquer l’échelle</button></div>`:''}
    <div class="plrow">${C.kind==='pts'&&C.pairs.length>=2?'<button type="button" data-pl="end" class="pri">Terminer le calage</button>':''}<button type="button" data-pl="undo">Retirer le dernier point</button><button type="button" data-pl="cancel">Annuler</button></div></div>`:'';
  box.innerHTML=`<h4>Plan importé</h4><p class="small"><b>${esc(P.name||'Plan')}</b> · ${nf(P.w,2)} m × ${nf(plH(),2)} m · rotation ${nf(P.rot,1)}°${P.ech?` · échelle 1:${P.ech}`:''}</p>${cal}
   <div class="plrow"><button type="button" data-pl="cal" class="pri"${dis}>Caler sur des repères</button><button type="button" data-pl="scale"${dis}>Échelle avec une cote connue</button>${P.pdfmm?`<label>Échelle du plan 1:<input type="number" min="1" step="1" data-plv="ech" value="${P.ech||''}"${dis}></label>`:''}</div>
   <div class="plrow"><label>Largeur réelle (m)<input type="number" min="0.5" step="0.01" data-plv="w" value="${(+P.w).toFixed(2)}"${dis}></label><label>Rotation (°)<input type="number" step="0.1" data-plv="rot" value="${(+P.rot).toFixed(1)}"${dis}></label>
    <span class="nudge">Décaler : <button type="button" data-pn="0,1" title="Vers le nord"${dis}>↑</button><button type="button" data-pn="0,-1" title="Vers le sud"${dis}>↓</button><button type="button" data-pn="-1,0" title="Vers l’ouest"${dis}>←</button><button type="button" data-pn="1,0" title="Vers l’est"${dis}>→</button>
    <select data-plv="step" aria-label="Pas du décalage"${dis}>${[[0.05,'5 cm'],[0.1,'10 cm'],[0.5,'50 cm'],[2,'2 m']].map(([v,l])=>`<option value="${v}"${+P.step===v?' selected':''}>${l}</option>`).join('')}</select></span></div>
   <div class="plrow"><label>Opacité<input type="range" min="10" max="100" data-plv="op" value="${Math.round(P.op*100)}"></label>${P.pages>1?`<label>Page<select data-plv="page">${Array.from({length:P.pages},(_,i)=>`<option value="${i+1}"${P.page===i+1?' selected':''}>${i+1}</option>`).join('')}</select></label>`:''}
    <label class="chk"><input type="checkbox" data-plc="mul"${P.mul?' checked':''}> Blanc transparent</label><label class="chk"><input type="checkbox" data-plc="lock"${P.lock?' checked':''}> Verrouiller le plan</label><label class="chk"><input type="checkbox" data-plc="hide"${P.hide?' checked':''}> Masquer</label></div>
   <div class="plrow"><button type="button" data-pl="png">Télécharger le plan annoté</button><button type="button" data-pl="new">Remplacer le plan</button><button type="button" data-pl="del" class="danger">Retirer le plan</button></div>
   <p class="small">Posez le plan à peu près en place (✥ pour le déplacer, ⟳ pour le tourner), puis calez-le sur deux repères éloignés (angles de la maison, bornes) : il se met exactement à l’échelle et dans le bon sens. Choisissez ensuite un outil et dessinez par-dessus. Pour ne voir que le plan, choisissez le fond « Fond blanc » dans les couches.</p>`}
$('#planImp').addEventListener('click',()=>$('#planFile').click());
$('#planFile').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;try{await planImport(f)}catch(err){console.warn(err);toast('Import impossible : '+(err&&err.message||err))}});
$('#planPanel').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||!S.plan)return;const P=S.plan;
  if(b.dataset.pn){const[dx,dy]=b.dataset.pn.split(',').map(Number),s=+P.step||0.1;P.c=shiftLL([P.c],dx*s,dy*s)[0];planPos();planHandles();drawPlanCal();planSaveSoon();return}
  const k=b.dataset.pl;if(!k)return;
  if(k==='cal')planCalStart('pts');else if(k==='scale')planCalStart('scale');else if(k==='cancel'||k==='end'){if(k==='end')toast(`Plan calé : écart maximal ${nf(S.planCal.err||0,2)} m.`);planCalEnd()}
  else if(k==='undo'){const C=S.planCal;if(!C)return;if(C.kind==='scale')C.pts.pop();else if(C.cur)C.cur=null;else C.pairs.pop();drawPlanCal();planCalHint();renderPlanPanel()}
  else if(k==='dist'){const d=accNum($('#plDist').value),C=S.planCal;if(!d||!C||C.pts.length<2){toast('Indiquez la distance réelle en mètres.');return}const dp=Math.hypot(C.pts[0].px-C.pts[1].px,C.pts[0].py-C.pts[1].py);if(dp<1)return;P.w=d/dp*P.iw;if(P.pdfmm)P.ech=Math.round(P.w*1000/P.pdfmm);planCalEnd();planPos();planHandles();planSaveSoon();toast(`Échelle appliquée : le plan mesure ${nf(P.w,2)} m de large.`)}
  else if(k==='png'){const im=await planComposite(2400);if(!im)return;const bl=await (await fetch(im.data)).blob();download(bl,(PRJ.name||'projet').replace(/[^\w\-]+/g,'_')+'-plan-annote.png')}
  else if(k==='new')$('#planFile').click();
  else if(k==='del'){if(b.dataset.c!=='1'){b.dataset.c='1';b.textContent='Confirmer le retrait';setTimeout(()=>{if(b.isConnected){b.dataset.c='';b.textContent='Retirer le plan'}},4000);return}try{localStorage.removeItem('plantania:plan:'+PRJ.id)}catch(err){}S.plan=null;PLANIMG='';S.planCal=null;if(S.mode==='planpt')setMode('site');planMount();saveNow(true);toast('Plan retiré.')}});
$('#planPanel').addEventListener('input',e=>{if(e.target.dataset.plv==='op'&&S.plan){S.plan.op=+e.target.value/100;planPos()}});
$('#planPanel').addEventListener('change',async e=>{const t=e.target,P=S.plan;if(!P)return;
  if(t.dataset.plc){P[t.dataset.plc]=t.checked;planPos();planHandles();renderPlanPanel();planSaveSoon();return}
  const k=t.dataset.plv;if(!k)return;const v=accNum(t.value);
  if(k==='w'&&v){P.w=v;if(P.pdfmm)P.ech=Math.round(v*1000/P.pdfmm)}else if(k==='rot'){const r=parseFloat(String(t.value).replace(',','.'));if(isFinite(r))P.rot=r}else if(k==='ech'&&v&&P.pdfmm){P.ech=Math.round(v);P.w=P.pdfmm/1000*v}else if(k==='step'){P.step=+t.value}else if(k==='op'){P.op=+t.value/100}
  else if(k==='page'&&PLANPDF){try{const r=await pdfRender(PLANPDF,+t.value);P.page=+t.value;await planFromCanvas(r.cv,{name:P.name,pdfmm:r.mm,pages:r.pages},true);return}catch(err){toast('Page illisible.')}}
  else if(k==='page')toast('Réimportez le PDF pour changer de page.');
  planPos();planHandles();drawPlanCal();renderPlanPanel();planSaveSoon()});
$('#stepIntro').addEventListener('click',e=>{if(e.target.dataset.planimp)$('#planFile').click()});
{const _s114=step1List;step1List=function(){return _s114().replace('</ul>',`<li class="${S.plan?'ok':''}"><span class="sw" style="background:#5c6bc0"></span>Plan d’un géomètre, d’un architecte ou d’un paysagiste (facultatif)${S.plan?' : importé':''} <button type="button" data-planimp="1">${S.plan?'Remplacer':'Importer'}</button></li></ul>`)}}
{const _rst14=restoreState;restoreState=function(d){_rst14(d);const P=d&&d.set&&d.set.plan;S.planCal=null;PLANIMG='';S.plan=P?clone(P):null;
  if(S.plan){if(d.set.planImg){PLANIMG=d.set.planImg;planStore()}else{try{PLANIMG=localStorage.getItem('plantania:plan:'+PRJ.id)||''}catch(e){}}if(!PLANIMG){S.plan=null;toast('Le plan importé de ce projet n’est plus en mémoire : réimportez-le.')}}planMount()}}
{const _rp14b=resetProject;resetProject=function(){_rp14b();S.plan=null;S.planCal=null;PLANIMG='';if(typeof planMount==='function')planMount()}}
setTimeout(()=>{try{const ix=pIdx();Object.keys(localStorage).filter(k=>k.startsWith('plantania:plan:')).forEach(k=>{const id=k.slice(15);if(id!==PRJ.id&&!ix[id])localStorage.removeItem(k)})}catch(e){}},4000);
/* --- plan annoté : plan fourni + aménagements dessinés --- */
function planItems(){const it=[],add=(pts,col,o)=>{if(pts&&pts.length)it.push({pts,col,...o})};
  (S.plots||[]).forEach(p=>add(p.pts,TC.plot,{closed:1,dash:1,lw:3}));S.shapes.forEach(s=>add(s.pts,s.kind==='obsPoly'?'#795548':'#4e342e',{closed:s.kind==='obsPoly'?1:0,fill:s.kind==='obsPoly'?.45:0,lw:2}));
  (S.paths||[]).forEach(p=>add(p.pts,TC.path,{closed:1,fill:.6,lw:1}));S.lawns.forEach(p=>add(p.pts,TC.lawn,{closed:1,fill:.35,lw:2}));S.potagers.forEach(p=>add(p.pts,TC.potager,{closed:1,fill:.4,lw:2}));S.orchards.forEach(p=>add(p.pts,TC.orchard,{closed:1,fill:.25,lw:2}));
  S.taluses.forEach(p=>add(p.pts,TC.talus,{closed:1,fill:.3,lw:2}));S.ponds.forEach(p=>add(p.pts,TC.pond,{closed:1,fill:.55,lw:2}));if(S.bed&&massifOn())add(S.bed.ll,TC.bed,{closed:1,fill:.45,lw:2});
  S.hedges.forEach(h=>add(h.pts,TC.hedge,{lw:7}));S.vines.forEach(h=>add(h.pts,TC.vine,{lw:4}));S.fences.forEach(f=>add(f.pts,TC.fence,{lw:3,dash:1}));
  S.fruits.forEach(f=>add([[f.lat,f.lng]],TC.fruit,{r:2}));S.obs.forEach(o=>add([[o.lat,o.lng]],TC.obs,{r:Math.max(0.6,(o.w||3)/2)}));return it}
async function planComposite(W){if(!S.plan||!PLANIMG)return null;const P=S.plan,im=await loadImg(PLANIMG),o=P.c,mp=mPer(o[0]),toL=q=>[(q[1]-o[1])*mp,-(q[0]-o[0])*111320],H=plH(),th=plTh();
  const corn=[[-P.w/2,-H/2],[P.w/2,-H/2],[P.w/2,H/2],[-P.w/2,H/2]].map(([u,v])=>[Math.cos(th)*u-Math.sin(th)*v,Math.sin(th)*u+Math.cos(th)*v]);
  const items=planItems().map(i=>({...i,m:i.pts.map(toL)})),all=[...corn,...items.flatMap(i=>i.m.map(p=>i.r?[[p[0]-i.r,p[1]-i.r],[p[0]+i.r,p[1]+i.r]]:[p]).flat())];
  const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),x0=Math.min(...xs)-2,x1=Math.max(...xs)+2,y0=Math.min(...ys)-2,y1=Math.max(...ys)+2,sc=Math.min((W||1600)/(x1-x0),(W||1600)*1.4/(y1-y0)),cw=Math.round((x1-x0)*sc),ch=Math.round((y1-y0)*sc)+70;
  const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cw,ch);const X=p=>[(p[0]-x0)*sc,(p[1]-y0)*sc];
  x.save();x.translate(-x0*sc,-y0*sc);x.rotate(th);x.globalAlpha=P.hide?0:0.95;x.drawImage(im,-P.w/2*sc,-H/2*sc,P.w*sc,H*sc);x.restore();
  items.forEach(i=>{x.save();x.strokeStyle=i.col;x.fillStyle=i.col;x.lineWidth=(i.lw||2)*Math.max(1,sc/40);x.lineJoin='round';x.lineCap='round';if(i.dash)x.setLineDash([10,7]);
    if(i.r){const c=X(i.m[0]);x.globalAlpha=.55;x.beginPath();x.arc(c[0],c[1],i.r*sc,0,7);x.fill();x.globalAlpha=1;x.lineWidth=2;x.stroke()}
    else{x.beginPath();i.m.forEach((p,j)=>{const q=X(p);j?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1])});if(i.closed){x.closePath();if(i.fill){x.globalAlpha=i.fill;x.fill();x.globalAlpha=1}}x.stroke()}x.restore()});
  const bar=[1,2,5,10,20,50].find(v=>v*sc>cw*0.12)||50,by=ch-30;x.fillStyle='#212121';x.fillRect(20,by,bar*sc,6);x.font=`${Math.max(14,Math.round(cw/90))}px sans-serif`;x.fillText(`${bar} m`,24+bar*sc,by+7);
  x.beginPath();x.moveTo(cw-40,by+10);x.lineTo(cw-30,by-22);x.lineTo(cw-20,by+10);x.closePath();x.fill();x.fillText('N',cw-36,by-28);
  x.fillStyle='#555';x.fillText(`${P.name||'Plan fourni'} · plan calé ${P.ech?'(1:'+P.ech+') ':''}et aménagements Plantañ.ia`,40+bar*sc+60,by+7);
  return{data:cv.toDataURL('image/png'),w:Math.round(cw/2),h:Math.round(ch/2)}}
{const _cr14=collectReport;collectReport=async function(){const R=await _cr14();if(S.plan&&PLANIMG&&R.sections){try{const im=await planComposite(1600);if(im){const i=R.sections.findIndex(s=>s.title==='VOTRE PROJET');
  R.sections.splice(i>=0?i+1:0,0,{title:'PLAN FOURNI ET AMÉNAGEMENTS',intro:`Plan importé (${S.plan.name||'plan fourni'}), calé sur le terrain${S.plan.ech?' à l’échelle 1:'+S.plan.ech:''}, avec les aménagements dessinés par-dessus.`,tables:[],pngs:[null,im],planPng:im.data})}}catch(e){console.warn('plan',e)}}return R}}
{const _rh14=reportHtml;reportHtml=function(R){let h=_rh14(R);(R.sections||[]).filter(s=>s.planPng).forEach(s=>{const pg=`<section class="pg"><h2>${xe(s.title)}</h2><img src="${s.planPng}" alt="" style="width:100%;max-height:235mm;object-fit:contain;border:1px solid #ddd"><p class="small">Superposition indicative : le calage dépend des repères choisis ; vérifiez les cotes importantes sur le plan d’origine.</p></section>`;
  const i=h.lastIndexOf('<section class="pg ');h=i>0?h.slice(0,i)+pg+h.slice(i):h});return h}}

applyLock();
window.__p14={pxToLL,llToPx,planComposite,interactions:()=>interactions()};
