/* Plantañ.ia : particulier et professionnel, envies, tutoriel, liste des éléments (v15 à v22) */
/* ================= v15 : particulier / professionnel, envies, idées IA, rapport, règles communales ================= */
if(RELAIS_CLAUDE_DU_SITE){let had=null;try{had=localStorage.getItem('plantania:ai')}catch(e){}if(!had||AST.mode==='local'&&!AST.proxy){AST.mode='proxy';AST.proxy=RELAIS_CLAUDE_DU_SITE}}
const aiReady=()=>AST.mode==='proxy'?!!AST.proxy:AST.mode==='key'?!!AST.key:false;
/* --- version particulier / professionnel --- */
let AUD=null;try{AUD=localStorage.getItem('plantania:aud')}catch(e){}
let WZNEW=false;try{WZNEW=!localStorage.getItem('plantania:wiz')}catch(e){}
let AUDNEW=false;if(AUD!=='pub'&&AUD!=='pro'){let n=0;try{n=Object.keys(pIdx()).length}catch(e){}AUD=n?'pro':'pub';AUDNEW=true;try{localStorage.setItem('plantania:aud',AUD)}catch(e){}}
const STEPS0=STEPS.map(x=>x.slice()),STEPMORE0=JSON.parse(JSON.stringify(STEPMORE));
const STEPS_PRO={1:['Mon terrain','Placez votre terrain sur la carte et dessinez ce qui existe déjà : limite, bâtiments, arbres, chemins.']};
const STEPS_PUB={2:['Mes envies','Décrivez votre projet (texte ou dictée) ou répondez aux questions. Pas d’idée ? Montrez une photo de votre jardin.'],1:['Mon terrain','Placez votre terrain, puis dessinez ce qui existe et ce que vous voulez aménager.'],4:['Mes résultats','Vos plantes, les quantités, le plan et l’entretien : l’essentiel.'],5:['Mon projet en main','Rapport, budget, primes et professionnels près de chez vous.']};
const MORE_PUB={1:[['soleil','Soleil et ombres'],['climat','Climat'],['sol','Sol']],4:[['plantes','Toutes les plantes adaptées'],['machines','Matériel d’entretien'],['ident','Identifier une plante'],['sante','Santé des plantes']]};
const wzOrder=()=>[2,1,4,5];
function applySteps(){const P=AUD==='pub'?STEPS_PUB:STEPS_PRO;STEPS0.forEach((s,i)=>{STEPS[i]=(P[i+1]||s).slice()});
  Object.keys(STEPMORE).forEach(k=>delete STEPMORE[k]);Object.assign(STEPMORE,AUD==='pub'?JSON.parse(JSON.stringify(MORE_PUB)):JSON.parse(JSON.stringify(STEPMORE0)));
  const O=wzOrder();$('#steps ol').innerHTML=O.map((k,i)=>`<li><button type="button" data-step="${k}"><b>${i+1}</b><span>${esc(STEPS[k-1][0])}</span></button></li>`).join('');
  document.documentElement.classList.toggle('pub',AUD==='pub');document.documentElement.classList.toggle('pro',AUD!=='pub');
  document.querySelectorAll('#audSw [data-aud]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.aud===AUD)))}
function setAud(a,quiet){if(a===AUD&&!quiet)return;AUD=a;try{localStorage.setItem('plantania:aud',a)}catch(e){}applySteps();syncRmode();
  if(a==='pub'){WZ.on=true;wizGo(2)}else{if(WZ.on)wizGo(2);else wizApply()}
  if(!quiet)toast(a==='pub'?'Version particulier : un parcours en 4 étapes qui va à l’essentiel.':'Version professionnelle : tous les onglets, outils et détails.')}
{const _ss15=stepSecs;stepSecs=function(n){if(n===2&&AUD==='pub')return['envies'];const s=_ss15(n);if(AUD==='pub'&&n===4)return s.filter(x=>x!=='machines');return s}}
{const _wa15=wizApply;wizApply=function(){_wa15();if(!WZ.on)return;const O=wzOrder(),n=WZ.step,p=O.indexOf(n)+1,N=O.length;if(p<1)return;
  const b=$('#stepIntro .in > b');if(b)b.textContent=`Étape ${p} sur ${N} : ${STEPS[n-1][0]}`;
  $('#stPrev').disabled=p===1;$('#stNext').textContent=p===N?'Terminer':'Étape suivante : '+STEPS[O[p]-1][0];$('#stInfo').textContent=`Étape ${p} / ${N}`;
  document.querySelectorAll('#steps [data-step]').forEach(x=>{const k=+x.dataset.step;x.setAttribute('aria-current',k===n?'step':'false');x.classList.toggle('done',O.indexOf(k)<O.indexOf(n))});
  const i=$('#stepIntro .in');if(!i)return;
  if(n===2)i.querySelectorAll('.todo').forEach(x=>x.remove());
  if(AUD==='pub'&&n===1&&!i.querySelector('.todo.draw')){const h=drawChecklist().replace('<ul class="todo">','<ul class="todo draw">');if(S.want.size){const more=i.querySelector('.more');(more||i.lastChild).insertAdjacentHTML(more?'beforebegin':'afterend',`<span class="todoh">Puis dessinez votre projet :</span>${h}`)}}}}
{const _wg15=wizGo;wizGo=function(n){_wg15(n);if(AUD==='pub'&&WZ.step===4){/* résultats déjà calculés par l’étape 4 */}}}
$('#stPrev').addEventListener('click',e=>{if(!WZ.on)return;e.stopImmediatePropagation();const O=wzOrder(),p=O.indexOf(WZ.step);if(p>0)wizGo(O[p-1])},true);
$('#stNext').addEventListener('click',e=>{if(!WZ.on)return;e.stopImmediatePropagation();const O=wzOrder(),p=O.indexOf(WZ.step);if(p>=O.length-1){toast('Votre projet est enregistré automatiquement. Bon jardinage !');return}wizGo(O[p+1])},true);
{const _rmt15=renderMapTools;renderMapTools=function(){_rmt15();if(!(AUD==='pub'&&WZ.on&&WZ.step===1))return;const box=$('#mapTools');if(!box)return;const have=new Set([...box.querySelectorAll('[data-mt]')].map(b=>b.dataset.mt));
  const add=TOOLS.filter(t=>{const k=t[0];if(k==='g'||!SHORT[k]||have.has(k))return false;if(k==='fence')return wantOn('cloture');return !!(TOOLWANT[k]&&S.want.has(TOOLWANT[k]))});
  box.insertAdjacentHTML('beforeend',add.map(t=>`<button type="button" data-mt="${t[0]}" aria-pressed="${S.mode===t[0]}" title="${esc(t[1])}">${swatch(t[0],t[2])}<span>${esc(SHORT[t[0]])}</span></button>`).join(''))}}
$('#audSw').addEventListener('click',e=>{const b=e.target.closest('[data-aud]');if(b)setAud(b.dataset.aud)});

/* --- mes envies : questions sur les besoins --- */
S.env=Object.assign({amb:'',care:'',who:[],water:'',diy:'',budget:''},S.env||{});
const ENVQ=[
 {k:'want',m:1,q:'Que voulez-vous faire dans votre jardin ?',o:[['massif','Des fleurs toute l’année'],['potager','Cultiver mes légumes'],['fruit','Récolter quelques fruits'],['verger','Planter un verger'],['haie','Plus d’intimité, cacher un vis-à-vis'],['mare','Un point d’eau, une mare'],['pelouse','Un coin pelouse ou prairie fleurie'],['jardinieres','Fleurir un balcon ou une terrasse'],['cloture','Clôturer mon terrain'],['talus','Planter une pente'],['entretien','Mieux entretenir ce que j’ai déjà']]},
 {k:'amb',q:'Quelle ambiance vous fait envie ?',o:[['auto','Je ne sais pas : conseillez-moi'],['ang','Champêtre et très fleurie'],['nat','Naturelle, sous-bois'],['jap','Japonaise, zen'],['gra','Contemporaine, graphique'],['med','Sèche, méditerranéenne'],['eco','Refuge pour la biodiversité'],['viv','Comestible'],['ros','Romantique, avec des roses'],['nw','Moderne, graminées et vivaces']]},
 {k:'care',q:'Combien de temps pour l’entretien ?',o:[['low','Le moins possible'],['mid','Un peu chaque mois'],['high','J’adore jardiner']]},
 {k:'who',m:1,q:'Qui profite du jardin ?',o:[['kids','De jeunes enfants'],['pets','Un chien ou un chat'],['bio','Les oiseaux, abeilles et papillons'],['senior','Des personnes qui se baissent difficilement']]},
 {k:'water',q:'Et l’arrosage ?',o:[['ok','Je peux arroser facilement'],['auto','J’aimerais un arrosage automatique'],['none','Je ne veux pas arroser']]},
 {k:'diy',q:'Qui fera les travaux ?',o:[['me','Moi-même'],['pro','Un professionnel'],['?','Je ne sais pas encore']]},
 {k:'budget',q:'Quel budget environ ?',o:[['s','Moins de 500 €'],['m','De 500 à 3 000 €'],['l','Plus de 3 000 €'],['?','Je ne sais pas']]}];
const envLab=(k,v)=>{const Q=ENVQ.find(q=>q.k===k),o=Q&&Q.o.find(x=>x[0]===v);return o?o[1]:''};
function envStyle(){const E=S.env;if(E.amb&&E.amb!=='auto'&&STY[E.amb])return E.amb;if(E.water==='none')return'med';if(E.who.includes('bio'))return'eco';if(E.care==='low')return'nw';return'ang'}
function setWant(k,on){if(!WANTS.some(w=>w[0]===k)||S.want.has(k)===on)return;on?S.want.add(k):S.want.delete(k)}
function applyStyle(k){if(!STY[k]||!k)return;S.style=k;document.querySelectorAll('#styles .sty').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.s===k)))}
function envAdvice(){const E=S.env,a=[];
  if(E.care==='low')a.push('Entretien réduit : vivaces robustes plantées serrées, paillage épais, prairie fleurie plutôt que pelouse tondue chaque semaine.');
  if(E.care==='high')a.push('Vous aimez jardiner : potager, rosiers, vivaces à floraison longue et taille des fruitiers sont à votre portée.');
  if(E.who.includes('kids'))a.push('Jeunes enfants : les plantes toxiques (if, digitale, laurier-rose, cytise, muguet…) sont retirées des compositions. Une mare doit être sécurisée (grille rigide sous la surface ou clôture).');
  if(E.who.includes('pets'))a.push('Chien ou chat : les plantes toxiques pour eux (lis, hémérocalles, if, laurier-cerise…) sont retirées des compositions.');
  if(E.who.includes('bio'))a.push('Biodiversité : plantes mellifères et indigènes, haie champêtre, coin laissé sauvage et point d’eau peu profond.');
  if(E.who.includes('senior'))a.push('Pour éviter de se baisser : potager en bacs surélevés (70 à 90 cm), jardinières hautes, allées larges et stables.');
  if(E.water==='none')a.push('Sans arrosage : plantes de terrain sec, plantation en automne, paillage minéral ou végétal épais ; arrosez seulement la première année.');
  if(E.water==='auto')a.push('Un arrosage automatique est ajouté au projet (goutte-à-goutte pour les massifs et les haies).');
  if(E.diy==='me')a.push('Vous ferez les travaux : les étapes, les outils et les durées de chaque chantier sont ajoutés.');
  if(E.diy==='pro')a.push('Travaux par un professionnel : le rapport sert de cahier des charges pour demander des devis comparables.');
  return a}
function envBudgetTxt(){const E=S.env;if(!E.budget||E.budget==='?')return'';let T=null;try{const L=budgetLines();if(L.length)T=budgetTotals(L)}catch(e){}if(!T)return'';
  const lim={s:[0,500],m:[500,3000],l:[3000,1e9]}[E.budget],v=E.diy==='pro'?T.pro:T.diy,who=E.diy==='pro'?'par un professionnel':'en le faisant vous-même';
  return v[0]>lim[1]?`Estimation actuelle ${who} : ${rg(v)}, au-dessus de votre budget. Réduisez les surfaces ou étalez le projet sur plusieurs saisons.`:`Estimation actuelle ${who} : ${rg(v)}${v[1]<=lim[1]?', dans votre budget.':', proche de votre budget.'}`}
function renderEnvies(){const box=$('#enviesBox');if(!box)return;const E=S.env;
  box.innerHTML=ENVQ.map((Q,i)=>`<div class="card envq"><h4><span class="qn">${i+1}</span>${esc(Q.q)}${Q.m?' <small>(plusieurs choix possibles)</small>':''}</h4><div class="envo">${Q.o.map(([k,l])=>{const on=Q.k==='want'?S.want.has(k):Q.m?E[Q.k].includes(k):E[Q.k]===k;return `<button type="button" class="envb" data-eq="${Q.k}" data-ev="${k}" aria-pressed="${on}">${esc(l)}</button>`}).join('')}</div></div>`).join('')+envSummary()}
function envSummary(){const E=S.env,w=WANTS.filter(x=>S.want.has(x[0])).map(x=>x[1]),adv=envAdvice(),bt=envBudgetTxt();
  return `<div class="card envsum"><h4>Votre projet en bref</h4>${w.length?`<p><b>À aménager :</b> ${esc(w.join(', '))}</p>`:'<p class="small">Choisissez au moins une envie à la question 1.</p>'}
   <p><b>Ambiance proposée :</b> ${esc(STY[envStyle()].l)}${E.amb==='auto'||!E.amb?' <small>(choisie d’après vos réponses)</small>':''}</p>${adv.length?`<ul class="small">${adv.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}${bt?`<p class="small"><b>Budget :</b> ${esc(bt)}</p>`:''}
   <div class="chips"><button type="button" class="pri" data-envnext="1"${w.length?'':' disabled'}>Continuer : placer mon terrain sur la carte</button></div></div>`}
$('#envies').addEventListener('click',e=>{const b=e.target.closest('[data-eq]');
  if(b){const k=b.dataset.eq,v=b.dataset.ev,E=S.env;
    if(k==='want'){setWant(v,!S.want.has(v));renderWants()}
    else if(k==='who'){E.who=E.who.includes(v)?E.who.filter(x=>x!==v):[...E.who,v];if(typeof renderCompo==='function')try{renderCompo()}catch(err){}}
    else{E[k]=E[k]===v?'':v;if(k==='water')setWant('arrosage',E.water==='auto');if(k==='diy')setWant('diy',E.diy==='me');if(k==='water'||k==='diy')renderWants()}
    if(['amb','care','water','who'].includes(k))applyStyle(envStyle());
    renderEnvies();if(WZ.on)wizApply();renderMapTools();saveNow(true);return}
  if(e.target.closest('[data-envnext]')){if(WZ.on)wizGo(1);else{applyTabs([...new Set([...curTabs(),'carte'])]);showTab('carte',true)}}});
{const _rw15=renderWants;renderWants=function(){_rw15();if($('#enviesBox')&&!$('#envies').classList.contains('tabhide'))renderEnvies()}}
const TOXG=['Digitalis','Taxus','Aconitum','Laburnum','Nerium','Ricinus','Datura','Brugmansia','Convallaria','Colchicum','Daphne','Euphorbia','Rhododendron','Helleborus','Lupinus','Arum','Delphinium','Ruta','Ilex','Kalmia','Pieris','Gloriosa','Narcissus'];
const TOXPET=['Lilium','Hemerocallis','Cycas','Tulipa','Hyacinthus'];
const toxic=p=>{const g=p.l.split(' ')[0],w=S.env.who;return TOXG.includes(g)||p.l.startsWith('Prunus laurocerasus')||(w.includes('pets')&&TOXPET.includes(g))};
{const _pf15=passF;passF=function(p,c){if(!_pf15(p,c))return false;const w=S.env&&S.env.who||[];return !((w.includes('kids')||w.includes('pets'))&&toxic(p))}}

/* --- idées de projets par l’IA à partir de photos --- */
let IDEAPH=[];S.aiIdeas=null;S.aiPick=null;
function renderIdeaThumbs(){$('#aiThumbs').innerHTML=IDEAPH.map((u,i)=>`<span class="th"><img src="${u}" alt="Photo ${i+1}"><button type="button" data-rmph="${i}" aria-label="Retirer la photo ${i+1}">×</button></span>`).join('')}
$('#aiPhotos').addEventListener('change',async e=>{const fs=[...(e.target.files||[])];e.target.value='';for(const f of fs){if(IDEAPH.length>=3){toast('Trois photos au maximum.');break}try{const u=URL.createObjectURL(f),im=await loadImg(u);IDEAPH.push(fitCanvas(im,im.naturalWidth,im.naturalHeight,1024).toDataURL('image/jpeg',0.8));URL.revokeObjectURL(u)}catch(err){toast('Photo illisible : '+f.name)}}renderIdeaThumbs()});
$('#aiThumbs').addEventListener('click',e=>{const b=e.target.closest('[data-rmph]');if(b){IDEAPH.splice(+b.dataset.rmph,1);renderIdeaThumbs()}});
function ideaPrompt(){const E=S.env,sc=scored().filter(x=>x.ok).sort((a,b)=>b.score-a.score).slice(0,160).map(x=>`${x.p.l} (${x.p.n})`);
  return `Contexte du terrain (données Plantañ.ia) : ${JSON.stringify(siteContext())}
Région : ${PLACE.region||'Belgique'}${PLACE.commune?', commune : '+PLACE.commune:''}${typeof plotArea==='function'&&plotArea()?`, parcelle dessinée : ${Math.round(plotArea())} m²`:''}.
Réponses de l’utilisateur : envies = ${WANTS.filter(x=>S.want.has(x[0])).map(x=>x[1]).join(', ')||'non précisées'} ; ambiance = ${envLab('amb',E.amb)||'non précisée'} ; entretien = ${envLab('care',E.care)||'non précisé'} ; public = ${E.who.map(v=>envLab('who',v)).join(', ')||'non précisé'} ; arrosage = ${envLab('water',E.water)||'non précisé'} ; travaux = ${envLab('diy',E.diy)||'non précisé'} ; budget = ${envLab('budget',E.budget)||'non précisé'}.
Souhait libre : ${($('#aiWish').value||'').trim()||'aucun'}.
Plantes adaptées à ce site (choisis-les de préférence dans cette liste) : ${sc.join('; ')}.`}
const IDEA_SYS=`Tu es paysagiste en Belgique. À partir des photos d’un jardin et du contexte fourni, propose exactement 3 projets différents et réalistes (un simple et économique, un intermédiaire, un plus ambitieux), adaptés au climat, au sol, à l’exposition visible et aux réponses de l’utilisateur. Réponds uniquement en JSON compact, en français, sans texte autour :
{"observations":"ce que montrent les photos : exposition, existant, contraintes (2 phrases)","projets":[{"titre":"","resume":"2 phrases","ambiance":"une clé parmi ${Object.keys(STY).join(', ')}","amenagements":["clés parmi ${WANTS.map(w=>w[0]).join(', ')}"],"plantes":[{"latin":"","nom":"","role":"rôle en 3 à 6 mots"}],"entretien":"faible|moyen|soutenu","budget":"fourchette en euros","etapes":["3 à 5 étapes courtes"],"attention":"un point de vigilance"}]}
Au plus 8 plantes par projet. Pas de plantes invasives. Si des enfants ou des animaux sont présents, aucune plante toxique.`;
$('#aiGo').addEventListener('click',async()=>{const out=$('#aiOut');if(!aiReady()){out.innerHTML='<p class="koo">Cette fonction utilise l’IA Claude. Elle n’est pas encore activée sur ce site : le propriétaire doit renseigner l’adresse du serveur relais (constante RELAIS_CLAUDE_DU_SITE), ou vous pouvez la régler dans l’assistant (⚙).</p>';return}
  if(!IDEAPH.length&&!($('#aiWish').value||'').trim()){out.innerHTML='<p class="koo">Ajoutez au moins une photo, ou décrivez ce que vous aimeriez.</p>';return}
  out.innerHTML='<p class="small">Analyse des photos et préparation de trois projets… (20 à 40 secondes)</p>';$('#aiGo').disabled=true;
  try{const j=await askClaude(IDEA_SYS,[...IDEAPH.map(imgBlock),{type:'text',text:ideaPrompt()}],2400);if(!j||!Array.isArray(j.projets)||!j.projets.length)throw new Error('réponse incomplète');S.aiIdeas=j;renderIdeas();saveNow(true)}
  catch(err){out.innerHTML=`<p class="koo">Proposition impossible : ${esc(err.message||String(err))}</p>`}finally{$('#aiGo').disabled=false}});
const plMatch=l=>{if(!l)return null;const s=String(l).toLowerCase().replace(/[‘’'"]/g,'').trim();return PL.find(p=>p.l.toLowerCase()===s)||PL.find(p=>s.startsWith(p.l.toLowerCase()))||PL.find(p=>p.l.toLowerCase().startsWith(s))||null};
function renderIdeas(){const out=$('#aiOut'),j=S.aiIdeas;if(!out)return;if(!j){out.innerHTML='';return}
  out.innerHTML=`${j.observations?`<p class="small"><b>Ce que l’IA voit :</b> ${esc(j.observations)}</p>`:''}<div class="ideas">${j.projets.slice(0,3).map((P,i)=>{const am=(P.amenagements||[]).map(k=>WANTS.find(w=>w[0]===k)).filter(Boolean);const sel=S.aiPick&&S.aiPick.titre===P.titre;
   return `<div class="card idea${sel?' sel':''}"><h4>${esc(P.titre||'Projet '+(i+1))}</h4><p>${esc(P.resume||'')}</p>
    <p class="small">${STY[P.ambiance]?`<span class="pill">${esc(STY[P.ambiance].l)}</span>`:''}${am.map(w=>`<span class="pill">${esc(w[1])}</span>`).join('')}</p>
    <ul class="small">${(P.plantes||[]).slice(0,8).map(x=>{const m=plMatch(x.latin);return `<li><i>${esc(x.latin||'')}</i> ${x.nom?'('+esc(x.nom)+')':''}${x.role?' : '+esc(x.role):''}${m?' <span class="okb" title="Plante présente dans la base">✓</span>':''}</li>`}).join('')}</ul>
    <p class="small"><b>Entretien :</b> ${esc(P.entretien||'—')} · <b>Budget :</b> ${esc(P.budget||'—')}</p>${P.attention?`<p class="small"><b>Attention :</b> ${esc(P.attention)}</p>`:''}
    ${(P.etapes||[]).length?`<details><summary>Étapes</summary><ol class="small">${P.etapes.slice(0,6).map(t=>`<li>${esc(t)}</li>`).join('')}</ol></details>`:''}
    <div class="chips"><button type="button" class="pri" data-aipick="${i}">${sel?'Projet choisi ✓':'Choisir ce projet'}</button>${(P.plantes||[]).some(x=>plMatch(x.latin))?`<button type="button" data-aiplants="${i}">Utiliser ces plantes dans le massif</button>`:''}</div></div>`}).join('')}</div>
   <p class="note">Propositions générées par IA à partir de vos photos : vérifiez-les sur place. Les plantes marquées ✓ sont dans la base de Plantañ.ia et seront calculées (quantités, entretien).</p>`}
$('#aiOut').addEventListener('click',e=>{const a=e.target.closest('[data-aipick]'),b=e.target.closest('[data-aiplants]');if(!a&&!b)return;const P=S.aiIdeas.projets[+(a||b).dataset[a?'aipick':'aiplants']];if(!P)return;
  if(a){const keep=['diy','arrosage','entretien'];WANTS.forEach(w=>{if(!keep.includes(w[0]))setWant(w[0],(P.amenagements||[]).includes(w[0]))});if(STY[P.ambiance]){S.env.amb=P.ambiance;applyStyle(P.ambiance)}S.aiPick=JSON.parse(JSON.stringify(P));renderWants();renderEnvies();renderIdeas();if(WZ.on)wizApply();renderMapTools();saveNow(true);toast(`Projet « ${P.titre} » choisi : vos envies et l’ambiance sont mises à jour.`)}
  else{const L=(P.plantes||[]).map(x=>plMatch(x.latin)).filter(Boolean);S.custom=[...new Map(L.map(p=>[p.l,{l:p.l,qty:p.t==='arbre'||p.t==='arbuste'?1:5}])).values()];S.pick='perso';const o=$('#oPick');if(o)o.value='perso';setWant('massif',true);renderWants();try{renderCompo()}catch(err){}saveNow(true);toast(`${S.custom.length} plantes ajoutées au massif (« Mon choix »). Dessinez le massif sur la carte pour les quantités.`)}});

/* --- persistance --- */
{const _ser15=serialize;serialize=function(){const d=_ser15();d.set.env=clone(S.env);if(S.aiIdeas)d.set.aiIdeas=S.aiIdeas;if(S.aiPick)d.set.aiPick=S.aiPick;return d}}
{const _rs15=restoreSettings;restoreSettings=function(t){_rs15(t);if(t&&t.env)S.env=Object.assign({amb:'',care:'',who:[],water:'',diy:'',budget:''},clone(t.env));S.aiIdeas=t&&t.aiIdeas||null;S.aiPick=t&&t.aiPick||null}}
{const _rp15=resetProject;resetProject=function(){_rp15();S.env={amb:'',care:'',who:[],water:'',diy:'',budget:''};S.aiIdeas=null;S.aiPick=null;IDEAPH=[];if($('#aiThumbs'))renderIdeaThumbs()}}
{const _rst15=restoreState;restoreState=function(d){_rst15(d);renderEnvies();renderIdeas()}}

/* --- règles communales des clôtures : recherche par l’IA --- */
async function askWeb(system,prompt,uses){if(!aiReady())throw new Error('IA non activée sur ce site');const loc={type:'approximate',country:'BE',timezone:'Europe/Brussels'};if(PLACE.commune)loc.city=PLACE.commune;
  let msgs=[{role:'user',content:prompt}],j=null,all=[];
  for(let g=0;g<3;g++){const body={model:AST.model||'claude-sonnet-5-5',max_tokens:2500,system,messages:msgs};let r;
    if(AST.mode==='proxy'){body.web=true;body.web_uses=uses||4;body.city=PLACE.commune||'';r=await fetch(AST.proxy,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}
    else{body.tools=[{type:'web_search_20250305',name:'web_search',max_uses:uses||4,user_location:loc}];r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':AST.key,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)})}
    j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));all.push(...(j.content||[]));
    if(j.stop_reason==='pause_turn'&&AST.mode!=='proxy'){msgs=[...msgs,{role:'assistant',content:j.content}];continue}break}
  const txt=[],src=new Map();all.forEach(b=>{if(b.type==='text'){txt.push(b.text);(b.citations||[]).forEach(c=>{if(c.url&&!src.has(c.url))src.set(c.url,c.title||c.url)})}});
  if(!src.size)all.filter(b=>b.type==='web_search_tool_result'&&Array.isArray(b.content)).forEach(b=>b.content.slice(0,4).forEach(x=>{if(x.url&&!src.has(x.url))src.set(x.url,x.title||x.url)}));
  if(!txt.join('').trim())throw new Error('aucune réponse');return{text:txt.join('').trim(),sources:[...src]}}
const LAW_SYS='Tu es un assistant en urbanisme pour la Belgique. Cherche sur le web le règlement ou le guide communal d’urbanisme de la commune indiquée (site de la commune en priorité), et les règles régionales applicables aux clôtures, palissades, murets et haies. N’affirme que ce que disent les sources trouvées ; si la commune n’a pas de règle spécifique trouvée en ligne, dis-le clairement. Réponds en français, en texte brut, avec ces titres sur une ligne chacun, suivis de tirets : En bref, Hauteurs, Matériaux et aspect, Permis ou dispense, Documents de référence, À vérifier auprès de la commune. 200 mots au maximum.';
const lawKey=()=>'plantania:law:'+(regionKey()||'')+':'+(PLACE.commune||'').toLowerCase();
function lawGet(){try{return JSON.parse(localStorage.getItem(lawKey())||'null')}catch(e){return null}}
function lawHtml(L){if(!L)return'';const lines=L.text.split(/\n+/).map(s=>s.trim()).filter(Boolean);let h='',inList=false;
  lines.forEach(s=>{const m=s.match(/^[-•*]\s*(.*)$/);if(m){if(!inList){h+='<ul class="small">';inList=true}h+=`<li>${esc(m[1].replace(/\*\*/g,''))}</li>`}else{if(inList){h+='</ul>';inList=false}h+=`<p class="lawh"><b>${esc(s.replace(/\*\*/g,'').replace(/^#+\s*/,''))}</b></p>`}});if(inList)h+='</ul>';
  return `${h}${L.sources.length?`<p class="small"><b>Sources :</b> ${L.sources.slice(0,6).map(([u,t])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' · ')}</p>`:''}<p class="note">Recherche faite par IA le ${esc(L.date)} : confirmez auprès du service urbanisme de la commune avant de commander.</p>`}
function renderLawAi(){const card=$('#fenceBox')&&[...$('#fenceBox').querySelectorAll('.card')].find(c=>/Règles qui s’appliquent/.test(c.textContent));if(!card)return;let box=$('#lawAi');if(!box){card.insertAdjacentHTML('beforeend','<div id="lawAi" class="lawai"></div>');box=$('#lawAi')}
  const L=lawGet(),c=PLACE.commune;box.innerHTML=`<h4>Règles de ${c?esc(c):'votre commune'}</h4>${L?lawHtml(L):`<p class="small">L’IA cherche le règlement ou le guide d’urbanisme de la commune et résume les règles des clôtures, avec les liens vers les sources.</p>`}
   <div class="chips"><button type="button" class="${L?'':'pri'}" id="lawGo"${c?'':' disabled'}>${L?'Actualiser la recherche':'Chercher les règles de ma commune'}</button></div>${c?'':'<p class="small">Placez d’abord votre terrain : la commune est détectée automatiquement.</p>'}`}
{const _rf15=renderFences;renderFences=function(){_rf15();renderLawAi()}}
$('#cloture').addEventListener('click',async e=>{if(!e.target.closest('#lawGo'))return;const b=$('#lawGo');if(!aiReady()){toast('La recherche par IA n’est pas activée sur ce site (serveur relais).');return}
  b.disabled=true;b.textContent='Recherche en cours… (30 à 60 secondes)';const reg=regionKey(),F=S.fences.map(f=>`${FM[f.model]?FM[f.model].l:f.model}, ${nf(f.h,1)} m, ${f.pos||''}`).join(' ; ');
  try{const r=await askWeb(LAW_SYS,`Commune : ${PLACE.commune}${PLACE.cp?' ('+PLACE.cp+')':''}, région : ${reg==='vla'?'Flandre':reg==='bxl'?'Bruxelles-Capitale':'Wallonie'}, Belgique.\nProjet de clôture : ${F||'clôture de jardin, hauteur à préciser'}.\nQuelles règles s’appliquent (hauteur maximale à rue et en limites latérales et arrière, matériaux, couleurs, haie obligatoire, recul, permis ou dispense) ?`,4);
    const L={...r,date:new Date().toLocaleDateString('fr-BE'),commune:PLACE.commune};try{localStorage.setItem(lawKey(),JSON.stringify(L))}catch(err){}renderLawAi()}
  catch(err){toast('Recherche impossible : '+(err.message||err));renderLawAi()}});
{const _vs15=v4Sections;v4Sections=function(){const o=_vs15(),L=lawGet(),s=o.find(x=>x.title==='CLÔTURES ET PALISSADES');if(s&&L){s.bullets=[...(s.bullets||[]),`Règles de ${L.commune} (recherche par IA du ${L.date}, à confirmer auprès de la commune) :`,...L.text.split(/\n+/).map(x=>x.replace(/^[-•*]\s*/,'').replace(/\*\*/g,'').trim()).filter(Boolean).slice(0,14),...(L.sources.length?['Sources : '+L.sources.slice(0,4).map(([u,t])=>`${t} (${u})`).join(' ; ')]:[])]}return o}}

/* --- rapport : résumé ou détaillé, nouvelle mise en page --- */
const repMode=()=>{let m=null;try{m=localStorage.getItem('plantania:rmode')}catch(e){}return m==='sum'||m==='full'?m:(AUD==='pub'?'sum':'full')};
function syncRmode(){const m=repMode();document.querySelectorAll('input[name=rmode]').forEach(r=>{r.checked=r.value===m})}
document.querySelectorAll('input[name=rmode]').forEach(r=>r.addEventListener('change',()=>{try{localStorage.setItem('plantania:rmode',r.value)}catch(e){}}));
function briefData(R){const t=[],w=WANTS.filter(x=>wantOn(x[0])&&!['diy','arrosage','entretien'].includes(x[0]));
  t.push(['Aménagements',w.length?String(w.length):'—']);let a=0;try{a=typeof plotArea==='function'?plotArea():0}catch(e){}t.push(['Terrain dessiné',a?nf(a)+' m²':'—']);
  const nP=(R.palettes||[]).reduce((s,p)=>s+p.items.reduce((u,it)=>u+(+it.qty||0),0),0);t.push(['Plantes',nP?nf(nP):'—']);
  t.push(['Ambiance',R.compo?R.compo.style:(STY[S.style]?STY[S.style].l:'—')]);
  try{const L=budgetLines();if(L.length){const T=budgetTotals(L);t.push(['Budget soi-même',rg(T.diy)],['Budget professionnel',rg(T.pro)],['Temps de travaux',`≈ ${nf(Math.round(T.hours))} h`])}}catch(e){}
  if(S.env.care)t.push(['Entretien souhaité',envLab('care',S.env.care)]);
  const photos=(R.palettes||[]).flatMap(p=>p.items).filter(it=>it.photo&&it.photo.src).slice(0,6).map(it=>({src:it.photo.src,n:it.p.n}));
  const env=ENVQ.filter(q=>q.k!=='want').map(q=>[q.q.replace(/ \?$/,''),q.m?S.env[q.k].map(v=>envLab(q.k,v)).join(', '):envLab(q.k,S.env[q.k])]).filter(r=>r[1]);
  return{tiles:t.slice(0,8),photos,want:w.map(x=>x[1]),env,adv:envAdvice(),hero:R.plan&&R.plan.data||((R.sections||[]).find(s=>s.planPng)||{}).planPng||(photos[0]&&photos[0].src)||'',heroPlan:!!(R.plan&&R.plan.data||(R.sections||[]).some(s=>s.planPng))}}
{const _cr15=collectReport;collectReport=async function(){const R=await _cr15();try{const mode=repMode();R.mode=mode;
  if(S.aiPick){const P=S.aiPick,i=R.sections.findIndex(s=>s.title==='VOTRE PROJET');R.sections.splice(i>=0?i+1:0,0,{title:'PROJET PROPOSÉ PAR L’IA',intro:`${P.titre} : ${P.resume||''}`,tables:(P.plantes||[]).length?[{head:['Plante','Nom commun','Rôle'],rows:P.plantes.slice(0,8).map(x=>[x.latin||'',x.nom||'',x.role||'']),w:[4000,4000,6838]}]:[],bullets:[...(P.etapes||[]),...(P.attention?['Attention : '+P.attention]:[])],bh:'Étapes proposées'})}
  const B=briefData(R);R.brief=B;R.sections.unshift({title:'VOTRE PROJET EN BREF',brief:1,tables:[{head:['Indicateur','Valeur'],rows:B.tiles,w:[5000,9838]},...(B.env.length?[{h:'Vos envies',head:['Question','Réponse'],rows:B.env,w:[7000,7838]}]:[])],bullets:B.adv,bh:'Nos conseils'});
  if(mode==='sum'){const DROP=/PROFILS|RÉALISER|ACCÈS|SANTÉ|LIENS|IDENTIF|MATÉRIEL/;R.sections=R.sections.filter(s=>!DROP.test(s.title)).map(s=>s.brief?s:{...s,tables:(s.tables||[]).map(t=>t.rows.length>14?{...t,rows:[...t.rows.slice(0,14),[`… et ${t.rows.length-14} lignes de plus dans le rapport détaillé`,...t.head.slice(1).map(()=>'')]]}:t),bullets:(s.bullets||[]).slice(0,5)});R.checks=[];R.mach=[]}}
  catch(e){console.warn('rapport',e)}return R}}
const REP_CSS=`<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&display=swap" rel="stylesheet"><style>
:root{--g:#2d6a3d;--g2:#e8f1ea;--ink:#1d241f}body{counter-reset:sec}
h2{text-decoration:none;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:19pt;color:var(--g);display:flex;align-items:center;gap:4mm;margin:0 0 7mm;padding-bottom:3mm;border-bottom:2px solid var(--g2)}
.pg>h2::before{counter-increment:sec;content:counter(sec,decimal-leading-zero);font:600 10pt Jost,sans-serif;color:#fff;background:var(--g);border-radius:50%;width:9mm;height:9mm;display:inline-flex;align-items:center;justify-content:center;flex:none}
h3{font-family:Fraunces,Georgia,serif;font-weight:600;color:var(--g)}.sub{color:#4c5d51}
.pg footer{border-top:1px solid var(--g2);padding-top:2mm}
.tb{border-collapse:separate;border-spacing:0;border-radius:2.5mm;overflow:hidden;border:1px solid var(--g2)}.tb th{background:var(--g2);color:var(--g);font-weight:600;border-bottom:none}.tb td{border-bottom:none}.tb tbody tr:nth-child(even) td{background:#f6faf6}
.kv th{color:var(--g)}.kv td{border-bottom:1px dashed #dbe5dd}
.photos figure{border-radius:3mm}.num{border:none;background:var(--g);color:#fff;border-radius:50%;width:6mm;height:6mm;line-height:6mm;min-width:0;font-weight:600}
.cal>div{background:#f4f8f5;border-radius:3mm;padding:2.5mm 3mm}.fig{border-radius:2mm}
.cover2{display:grid;grid-template-columns:1.05fr 1fr;padding:0!important}
.cv-l{background:linear-gradient(160deg,#1f4d2b,#2d6a3d 60%,#4f8a5b);color:#fff;padding:16mm 14mm;display:flex;flex-direction:column;justify-content:space-between}
.cv-l .clogo{height:22mm;background:#fff;border-radius:3mm;padding:2mm;align-self:flex-start}.kick{text-transform:uppercase;letter-spacing:.2em;font-size:9pt;opacity:.85;margin:0}
.cv-t h1{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:32pt;line-height:1.1;margin:3mm 0 4mm}.lead{font-size:12pt;opacity:.9;margin:0}
.cv-cli{font-size:11pt;line-height:1.6;border-top:1px solid rgba(255,255,255,.35);padding-top:5mm}
.cv-r{position:relative;background:radial-gradient(circle at 30% 30%,#cfe3d3,#9cc3a6)}.cv-r img{width:100%;height:100%;object-fit:cover;display:block}.cv-r.plan{background:#fff}.cv-r.plan img{object-fit:contain;padding:12mm 10mm 22mm}
.cv-badges{position:absolute;left:8mm;bottom:8mm;right:8mm;display:flex;gap:2mm;flex-wrap:wrap}.cv-badges span{background:#fff;color:var(--g);border-radius:20mm;padding:1.5mm 4mm;font-size:9.5pt;font-weight:500;box-shadow:0 1mm 3mm rgba(0,0,0,.15)}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin-bottom:6mm}.tile{background:var(--g2);border-radius:3mm;padding:3.5mm 4.5mm}.tile span{display:block;font-size:8pt;color:#56665b;text-transform:uppercase;letter-spacing:.06em}.tile b{display:block;font-family:Fraunces,Georgia,serif;font-size:13.5pt;color:var(--g);margin-top:1mm;font-weight:600;line-height:1.2}
.bphotos{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5mm}.bphotos figure{margin:0}.bphotos img{width:100%;height:36mm;object-fit:cover;border-radius:3mm;display:block}.bphotos figcaption{font-size:8pt;color:#56665b;margin-top:.8mm}
.advice{padding-left:5mm}.advice li{margin-bottom:1.6mm}.wants span{display:inline-block;background:#fff;border:1px solid var(--g);color:var(--g);border-radius:20mm;padding:.8mm 3mm;margin:0 1.5mm 1.5mm 0;font-size:9pt}
</style>`;
{const _rh15=reportHtml;reportHtml=function(R){const R2={...R,sections:(R.sections||[]).filter(s=>!s.brief)};let h=_rh15(R2);try{const B=R.brief||briefData(R),title=R.cli.title||'Projet de jardin',sum=R.mode==='sum';
  const foot=`<footer><img src="data:image/png;base64,${LOGO}" alt=""><span>${RE(title)} · Plantañ.ia</span></footer>`;
  const cover=`<section class="pg cover2"><div class="cv-l"><img class="clogo" src="data:image/png;base64,${LOGO}" alt="Plantañ.ia"><div class="cv-t"><p class="kick">Aménagement paysager</p><h1>${RE(title)}</h1><p class="lead">Rapport ${sum?'résumé':'détaillé'} · ${RE(R.date)}</p></div><div class="cv-cli">${R.cli.name?RE(R.cli.name)+'<br>':''}${R.cli.addr?RE(R.cli.addr)+'<br>':''}${R.cli.city?RE(R.cli.city):(R.place&&R.place.commune?RE(R.place.commune):'')}</div></div>
   <div class="cv-r${B.heroPlan?' plan':''}">${B.hero?`<img src="${RE(B.hero)}" alt="">`:''}<div class="cv-badges">${B.want.slice(0,5).map(w=>`<span>${RE(w)}</span>`).join('')}</div></div></section>`;
  const brief=`<section class="pg brief"><h2>VOTRE PROJET EN BREF</h2><div class="tiles">${B.tiles.map(([l,v])=>`<div class="tile"><span>${RE(l)}</span><b>${RE(v)}</b></div>`).join('')}</div>
   <div class="cols"><div>${B.want.length?`<h3>Ce que vous voulez aménager</h3><p class="wants">${B.want.map(w=>`<span>${RE(w)}</span>`).join('')}</p>`:''}${B.adv.length?`<h3>Nos conseils</h3><ul class="advice small">${B.adv.slice(0,5).map(a=>`<li>${RE(a)}</li>`).join('')}</ul>`:''}${!B.adv.length&&B.env.length?`<h3>Vos envies</h3><table class="kv">${B.env.map(r=>`<tr><th>${RE(r[0])}</th><td>${RE(r[1])}</td></tr>`).join('')}</table>`:''}</div>
   <div>${B.photos.length?`<h3>Quelques plantes de votre projet</h3><div class="bphotos">${B.photos.map(p=>`<figure><img src="${RE(p.src)}" alt=""><figcaption>${RE(p.n)}</figcaption></figure>`).join('')}</div>`:''}${sum?'<p class="small" style="margin-top:4mm">Rapport résumé : les fiches techniques (profils de terrassement, étapes de chantier, contrôles, matériel) sont dans le rapport détaillé.</p>':''}</div></div>${foot}</section>`;
  const a=h.indexOf('<section class="pg cover">'),b=a>=0?h.indexOf('</section>',a):-1;if(a>=0&&b>0)h=h.slice(0,a)+cover+brief+h.slice(b+10);
  if(sum){const k=h.indexOf('MATÉRIEL D’ENTRETIEN ET SOURCES');if(k>0){const s0=h.lastIndexOf('<section',k),s1=h.indexOf('</section>',k);if(s0>0&&s1>0)h=h.slice(0,s0)+h.slice(s1+10)}}
  h=h.replace('</head>',REP_CSS+'</head>')}catch(e){console.warn('mise en page',e)}return h}}
syncRmode();applySteps();if(AUD==='pub'&&!WZ.on){WZ.on=true}
window.__p15={setPlace:o=>Object.assign(PLACE,o),AST,repMode,setAud,aud:()=>AUD,toxic,ENVQ};
setTimeout(()=>{renderEnvies();renderIdeas();if(AUD==='pub'){if(!WZ.on)WZ.on=true;const O=wzOrder();if(AUDNEW||!O.includes(WZ.step))WZ.step=2;wizGo(WZ.step)}else if(WZ.on){if(WZNEW)wizGo(2);else wizApply()}},0);

/* ================= v16 : lot 1 (légende, rotation, obstacles, vue des massifs, pelouse, plan d’ensemble) ================= */
/* --- légende : seulement ce qui est sur la carte --- */
const LEGK={site:()=>S.lat!=null,plot:()=>S.plots.length,obs:()=>S.obs.length,obsPoly:()=>S.shapes.some(s=>s.kind==='obsPoly'),obsLine:()=>S.shapes.some(s=>s.kind==='obsLine'),path:()=>S.paths.length,bed:()=>!!S.bed,hedge:()=>S.hedges.length,fruit:()=>S.fruits.length,vine:()=>S.vines.length,lawn:()=>S.lawns.length,pond:()=>S.ponds.length,talus:()=>S.taluses.length,potager:()=>S.potagers.length,orchard:()=>S.orchards.length,fence:()=>S.fences.length};
function updateLegend(){const el=$('#maplegend');if(!el)return;const has=k=>{try{if(k.startsWith('z_'))return(S.zones||[]).some(z=>'z_'+z.kind===k);return LEGK[k]?!!LEGK[k]():false}catch(e){return false}};
  const shown=TOOLS.filter(t=>t[0]!=='g'&&t[0]!=='measure'&&t[0]!=='erase'&&has(t[0])),real=shown.filter(t=>t[0]!=='site');
  el.hidden=!real.length;const z=el.closest('.mapzone');if(z)z.classList.toggle('noleg',!real.length);if(!real.length){el.innerHTML='';return}
  const sh=S.obs.length||S.shapes.length;el.innerHTML='<b class="lgt">Légende</b>'+shown.map(t=>`<span>${swatch(t[0],t[2])}${t[1].replace(/ \((forme|ligne|point|contour|existant)\)$/,'').replace(' (point d’étude)','')}</span>`).join('')+(S.parcel?'<span><span class="sw line" style="background:#d7263d"></span>Limite cadastrale</span>':'')+(sh?'<span><span class="sw" style="background:#0b0f0c;opacity:.45"></span>Ombre portée</span>':'')}
{const _rtl16=rebuildToolLists;rebuildToolLists=function(){_rtl16();updateLegend()}}
{const _di16=drawItems;drawItems=function(){_di16();updateLegend()}}
{const _db16=drawBed;drawBed=function(){_db16();updateLegend()}}
{const _ro16=renderObs;renderObs=function(){_ro16();updateLegend();document.querySelectorAll('#obslist .ob[data-id]').forEach(row=>{const o=S.obs.find(x=>x.id==row.dataset.id);if(!o||row.querySelector('[data-f=oname]'))return;const s=row.querySelector('select[data-f=type]');if(s)s.insertAdjacentHTML('afterend',`<input data-f="oname" value="${esc(o.name||'')}" placeholder="Nom" aria-label="Nom de l’obstacle" style="width:8em">`)})}}
$('#obslist').addEventListener('change',e=>{if(e.target.dataset.f!=='oname')return;e.stopImmediatePropagation();const row=e.target.closest('.ob'),o=row&&S.obs.find(x=>x.id==row.dataset.id);if(!o)return;o.name=e.target.value.trim().slice(0,40);renderItemsList();saveNow(true)},true);
OBT.arbu={l:'Arbuste existant',h:2.5,w:2.5,c:'#7cb342'};
{const _sd16=snapDrawings;snapDrawings=function(){const d=_sd16();d.obs=(d.obs||[]).map((o,i)=>({...o,name:S.obs[i]&&S.obs[i].name||''}));return d}}
{const _rd16=restoreDrawings;restoreDrawings=function(d){_rd16(d);(d&&d.obs||[]).forEach((o,i)=>{if(S.obs[i]&&o.name)S.obs[i].name=o.name});renderObs()}}
function obsName(o,i){return o.name||`${OBT[o.type].l} ${i+1}`}

/* --- rotation et taille des formes --- */
function rotPts(P,c,ang){const a=ang*Math.PI/180,mp=mPer(c[0]);return P.map(p=>{const x=(p[1]-c[1])*mp,y=(p[0]-c[0])*111320;return[c[0]+(x*Math.sin(a)+y*Math.cos(a))/111320,c[1]+(x*Math.cos(a)-y*Math.sin(a))/mp]})}
const sclPts=(P,c,f)=>P.map(p=>[c[0]+(p[0]-c[0])*f,c[1]+(p[1]-c[1])*f]);
function rotItem(k,it,a){const raw=it.raw||it.pts;const nr=rotPts(raw,cen(raw),a);if(it.raw){it.raw=nr;regeom(it,closedOf(k,it))}else it.pts=nr;itemsChanged(k==='shapes');if(S.editing)drawHandles()}
function sclItem(k,it,f){const raw=it.raw||it.pts;const nr=sclPts(raw,cen(raw),f);if(it.raw){it.raw=nr;regeom(it,closedOf(k,it))}else it.pts=nr;itemsChanged(k==='shapes');if(S.editing)drawHandles()}
{const _dh16=drawHandles;drawHandles=function(){_dh16();if(!S.editing||!L.marker)return;
  const rh=(raw,done)=>{if(!raw||raw.length<2)return;const c=cen(raw),mp=mPer(c[0]),R=Math.max(...raw.map(p=>Math.hypot((p[1]-c[1])*mp,(p[0]-c[0])*111320)));
    const mk=L.marker([c[0]+(R+1.5)/111320,c[1]],{draggable:true,zIndexOffset:1200,title:'Tourner la forme',icon:L.divIcon({className:'',html:'<span class="vh mv rot">⟳</span>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(editLayer);
    mk.on('dragend',()=>{const q=mk.getLatLng();let a=Math.round(Math.atan2((q.lat-c[0])*111320,(q.lng-c[1])*mp)*180/Math.PI-90);a=((a+540)%360)-180;if(!a){drawHandles();return}
      pushUndo();const nr=rotPts(raw,c,a);raw.splice(0,raw.length,...nr);done();toast(`Forme tournée de ${Math.abs(a)}° ${a>0?'dans le sens inverse des aiguilles d’une montre':'dans le sens des aiguilles d’une montre'}`,{undo:true})})};
  if(S.bed&&S.bed.raw)rh(S.bed.raw,()=>{bedRegeom();drawBed();renderCompo();drawHandles()});
  EDIT_K.forEach(([k])=>(S[k]||[]).forEach(it=>{if(!it.raw)return;const cl=closedOf(k,it);rh(it.raw,()=>{regeom(it,cl);if(k==='taluses')estimateTalus(it);itemsChanged(k==='shapes');drawHandles();if(k==='fences')renderFences()})}))}}

/* --- d’où regarde-t-on le massif ? --- */
const VIEWD={n:[0,1],ne:[.707,.707],e:[1,0],se:[.707,-.707],s:[0,-1],so:[-.707,-.707],o:[-1,0],no:[-.707,.707]};
const VIEWL={auto:'Automatique (selon les murs et obstacles proches)',maison:'Depuis la maison',terrasse:'Depuis la terrasse',s:'Depuis le sud',so:'Depuis le sud-ouest',o:'Depuis l’ouest',no:'Depuis le nord-ouest',n:'Depuis le nord',ne:'Depuis le nord-est',e:'Depuis l’est',se:'Depuis le sud-est',tous:'De tous les côtés (massif isolé)'};
S.bedView=S.bedView||'auto';
function applyView(v,quiet){const b=S.bed;S.bedView=v;if(!b){renderViewHint();return}if(!b.raw)bedRegeom();
  if(v==='tous'){b.island=true;$('#island').checked=true}else{b.island=false;$('#island').checked=false;b.rawEdges=b.rawEdges.map(t=>t===1?0:t===2?3:t);
    if(v!=='auto'){const R=b.raw,c=cen(R),mp=mPer(c[0]),P=R.map(p=>[(p[1]-c[1])*mp,(p[0]-c[0])*111320]);let d=VIEWD[v];
      if(v==='maison'||v==='terrasse'){const T=v==='maison'?S.shapes.filter(s=>s.kind==='obsPoly').map(s=>cen(s.pts)).concat(S.obs.filter(o=>o.type==='bat').map(o=>[o.lat,o.lng])):S.paths.filter(p=>p.nat==='terrasse').map(p=>cen(p.pts));
        if(!T.length){if(!quiet)toast(v==='maison'?'Dessinez d’abord la maison (outil « Bâtiment ») sur la carte.':'Dessinez d’abord la terrasse (outil « Chemin, terrasse »).');renderViewHint();return}
        const t=T.sort((a,b)=>llDist(a,c)-llDist(b,c))[0],vx=(t[1]-c[1])*mp,vy=(t[0]-c[0])*111320,L_=Math.hypot(vx,vy)||1;d=[vx/L_,vy/L_]}
      const ar=P.reduce((s,p,i)=>{const q=P[(i+1)%P.length];return s+p[0]*q[1]-q[0]*p[1]},0),sg=ar>0?1:-1;let best=-1,bv=-9;
      P.forEach((p,i)=>{const q=P[(i+1)%P.length],dx=q[0]-p[0],dy=q[1]-p[1],Ln=Math.hypot(dx,dy)||1,nx=dy/Ln*sg,ny=-dx/Ln*sg,val=(-d[0]*nx-d[1]*ny)*Math.min(1,Ln/2);if(val>bv){bv=val;best=i}});
      if(best>=0)b.rawEdges[best]=b.rawEdges[best]===3?2:1}}
  bedRegeom();drawBed();renderCompo();renderViewHint();saveNow(true)}
function renderViewHint(){const h=$('#oViewHint'),s=$('#oView');if(s)s.value=S.bedView||'auto';if(!h)return;const v=S.bedView||'auto';
  h.textContent=!S.bed?'Dessinez le massif pour choisir d’où on le regarde.':v==='tous'?'Massif vu de tous les côtés : les plantes hautes au centre.':v==='auto'?'Le fond (trait marron sur la carte) est placé contre le mur ou l’obstacle le plus proche. Vous pouvez aussi cliquer un côté du massif sur la carte.':'Les plantes hautes sont placées au fond (trait marron sur la carte), les basses du côté d’où vous regardez.'}
$('#oView').addEventListener('change',e=>applyView(e.target.value));
$('#island').addEventListener('change',()=>{S.bedView=$('#island').checked?'tous':'auto';renderViewHint()});
$('#bedExist').addEventListener('click',()=>{showTab('carte',true);const t=$('#obsType');if(t)t.value='caduc';setMode('obs');toast('Cliquez l’arbre ou l’arbuste existant sur la carte, puis réglez son type, sa hauteur et son envergure.')});

const MON16=MOL.map(m=>m[0].toUpperCase()+m.slice(1));
/* --- pelouse : un type choisi, mise en œuvre et entretien --- */
S.lawnType=S.lawnType||null;let lawnAll=false;
const LAWN_STEPS={std:['Désherber, retirer cailloux et racines.','Ameublir sur 15 à 20 cm (bêche, grelinette ou motoculteur) ; sur sol pauvre, incorporer 2 à 3 cm de compost.','Niveler au râteau, rouler, puis attendre 2 à 3 semaines et arracher les herbes qui lèvent (faux semis).','Semer à la volée en deux passages croisés, griffer légèrement et rouler.','Arroser en pluie fine chaque jour sans pluie jusqu’à la levée (10 à 20 jours), puis espacer.','Première tonte quand l’herbe atteint 8 à 10 cm, en ne coupant que le tiers supérieur.'],
  prairie:['Décaper 5 à 10 cm de terre riche ou faucher ras et exporter : une prairie fleurie aime les sols pauvres.','Ameublir superficiellement (3 à 5 cm) et niveler sans compost ni engrais.','Mélanger les graines avec du sable sec pour bien les répartir, semer à la volée en surface sans recouvrir.','Rouler pour mettre les graines au contact du sol ; arroser si le printemps est sec.','Première année : une fauche de nettoyage quand les herbes atteignent 20 cm ; ensuite 1 à 2 fauches par an avec exportation.'],
  golf:['Confier la réalisation à un professionnel : substrat sableux drainé de 20 à 30 cm, nivellement au laser, arrosage automatique.','Semis d’agrostide stolonifère ou placage de gazon de précision.','Tontes très fréquentes à quelques millimètres dès l’enracinement.']};
const LAWN_CAL={std:[[3,'Scarifier et regarnir les zones clairsemées'],[4,'Reprise des tontes ; engrais organique de printemps'],[6,'Tondre plus haut par temps chaud et sec'],[9,'Aérer, regarnir, engrais d’automne pauvre en azote'],[11,'Dernière tonte ; ramasser les feuilles mortes']],
  sec:[[4,'Reprise des tontes, toujours haut (6 à 8 cm)'],[7,'Aucun arrosage : le gazon jaunit puis reverdit'],[9,'Regarnir les zones abîmées'],[11,'Ramasser les feuilles']],
  trefle:[[4,'Première tonte haute'],[6,'Tondre toutes les 2 à 3 semaines, laisser fleurir le trèfle'],[9,'Regarnir si besoin'],[11,'Ramasser les feuilles']],
  prairie:[[3,'Ramasser les déchets ; aucun engrais'],[6,'Fauche de fin juin (facultative) avec exportation'],[9,'Fauche principale avec exportation ; laisser une zone refuge'],[10,'Semer en complément si des trous apparaissent']],
  golf:[[3,'Aération, sablage et regarnissage'],[4,'Tontes très fréquentes à 3–5 mm'],[7,'Arrosage quotidien, surveillance des maladies'],[10,'Aération et sablage d’automne']]};
const lawnT=()=>{const rk=lawnRank();return(S.lawnType&&LAWNS.find(t=>t.k===S.lawnType))||rk[0].t};
function lawnSupplies(t,A){const r=[[`Semences « ${t.n} »`,`${nf(Math.ceil(A*t.dose*1.1/100)/10,1)} kg`,`${t.dose} g/m² + 10 %`]];
  if(t.k!=='prairie'&&t.k!=='golf')r.push(['Compost (sol pauvre)',`${nf(Math.round(A*0.025*10)/10,1)} m³`,'2 à 3 cm à incorporer'],['Engrais organique de démarrage',`${nf(Math.round(A*0.05*10)/10,1)} kg`,'environ 50 g/m², suivre l’étiquette']);
  if(t.k==='prairie')r.push(['Sable sec pour le semis',`${nf(Math.max(5,Math.round(A*0.2)))} L`,'pour bien répartir les graines']);
  return r}
{const _rl16=renderLawn;renderLawn=function(){_rl16();const box=$('#lawnBox');if(!box)return;const rk=lawnRank(),cards=[...box.querySelectorAll('.lawns > .card')],A=lawnArea();
  cards.forEach((cd,i)=>{const t=rk[i]&&rk[i].t;if(!t)return;const sel=S.lawnType===t.k;cd.classList.toggle('lawnsel',sel);if(S.lawnType&&!sel&&!lawnAll)cd.hidden=true;
    cd.insertAdjacentHTML('beforeend',`<div class="chips"><button type="button" class="${sel?'pri':''}" data-lawnpick="${t.k}">${sel?'Type choisi ✓':'Choisir ce type'}</button></div>`);
    if(sel){const st=LAWN_STEPS[t.k]||LAWN_STEPS.std,sup=A?lawnSupplies(t,A):[];cd.insertAdjacentHTML('beforeend',`<details open><summary>Mise en œuvre</summary><ol class="small">${st.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details>${sup.length?`<details><summary>Fournitures</summary><ul class="small">${sup.map(r=>`<li>${esc(r[0])} : <b>${esc(r[1])}</b> (${esc(r[2])})</li>`).join('')}</ul></details>`:''}<details><summary>Entretien mois par mois</summary><ul class="small">${(LAWN_CAL[t.k]||LAWN_CAL.std).map(([m,x])=>`<li><b>${MON16[m-1]}</b> : ${esc(x)}</li>`).join('')}</ul></details>`)}});
  if(S.lawnType){const l=box.querySelector('.lawns');if(l)l.insertAdjacentHTML('afterend',`<div class="chips"><button type="button" data-lawnall="1">${lawnAll?'Masquer les autres types':'Voir les autres types de pelouse'}</button></div>`)}}}
$('#pelouse').addEventListener('click',e=>{const p=e.target.closest('[data-lawnpick]');if(p){S.lawnType=S.lawnType===p.dataset.lawnpick?null:p.dataset.lawnpick;lawnAll=false;renderLawn();saveNow(true);return}if(e.target.closest('[data-lawnall]')){lawnAll=!lawnAll;renderLawn()}});
{const _vs16=v4Sections;v4Sections=function(){const o=_vs16(),A=lawnArea();if(A>0&&(S.lawns.length||wantOn('pelouse'))){const t=lawnT(),cal=LAWN_CAL[t.k]||LAWN_CAL.std;
  o.push({title:'PELOUSE — '+t.n.toUpperCase(),intro:`${S.lawnType?'Type choisi':'Type conseillé pour votre terrain'} : ${t.n}. Surface : ${nf(A)} m². Usage : ${LUSE[S.lawnUse]||'—'}.`,
   tables:[{h:'Caractéristiques',head:['Point','Détail'],rows:[['Mélange',t.mix],['Dose de semis',`${t.dose} g/m²`],['Période de semis','Avril–mai ou fin août–septembre'],['Entretien',t.ent]],w:[3500,11338]},
    {h:'Fournitures',head:['Fourniture','Quantité','Remarque'],rows:lawnSupplies(t,A),w:[6000,3000,5838]},{h:'Entretien mois par mois',head:['Mois','Tâche'],rows:cal.map(([m,x])=>[MON16[m-1],x]),w:[3000,11838]}],
   bullets:LAWN_STEPS[t.k]||LAWN_STEPS.std,bh:'Mise en œuvre'})}return o}}

/* --- plan d’ensemble avec échelle et nord --- */
const KLAB={plots:'Parcelle',bed:'Massif',ponds:'Mare',potagers:'Potager',lawns:'Pelouse',orchards:'Verger',taluses:'Talus',hedges:'Haie',vines:'Vigne',fences:'Clôture',paths:'Chemin, terrasse',fruits:'Fruitier',obs:'Arbre ou bâtiment existant',shapes:'Bâtiment ou mur existant',zones:'Zone'};
function planLabels(){const L_=[],a=(t,p)=>{if(p)L_.push([t,p])};
  S.shapes.forEach(s=>a(s.name,cen(s.pts)));S.obs.forEach((o,i)=>a(obsName(o,i),[o.lat,o.lng]));if(S.bed&&massifOn())a('Massif',cen(S.bed.ll));
  S.ponds.forEach((p,i)=>a(`Mare ${i+1}`,cen(p.pts)));S.potagers.forEach((p,i)=>a(`Potager ${i+1}`,cen(p.pts)));S.lawns.forEach((p,i)=>a(`Pelouse ${i+1}`,cen(p.pts)));S.orchards.forEach((p,i)=>a(`Verger ${i+1}`,cen(p.pts)));
  S.taluses.forEach((p,i)=>a(`Talus ${i+1}`,cen(p.pts)));S.hedges.forEach((p,i)=>a(`Haie ${i+1}`,p.pts[Math.floor(p.pts.length/2)]));S.fences.forEach((p,i)=>a(`Clôture ${i+1}`,p.pts[Math.floor(p.pts.length/2)]));
  S.paths.forEach(p=>a(PATHN[p.nat]||'Chemin',cen(p.pts)));S.fruits.forEach(f=>a(FRUITS[f.sp].n,[f.lat,f.lng]));(S.zones||[]).forEach(z=>a(`${ZK[z.kind].l} ${zNum(z)}`,cen(z.pts)));return L_}
async function drawSiteCanvas(withPlan,W){const P=withPlan&&S.plan&&PLANIMG?S.plan:null,items=planItems();if(!P&&!items.length)return null;
  const o=P?P.c:(S.plots[0]?cen(S.plots[0].pts):cen(items.flatMap(i=>i.pts))),mp=mPer(o[0]),toL=q=>[(q[1]-o[1])*mp,-(q[0]-o[0])*111320];
  let corn=[],im=null,H=0,th=0;if(P){im=await loadImg(PLANIMG);H=plH();th=plTh();corn=[[-P.w/2,-H/2],[P.w/2,-H/2],[P.w/2,H/2],[-P.w/2,H/2]].map(([u,v])=>[Math.cos(th)*u-Math.sin(th)*v,Math.sin(th)*u+Math.cos(th)*v])}
  const its=items.map(i=>({...i,m:i.pts.map(toL)})),all=[...corn,...its.flatMap(i=>i.m.map(p=>i.r?[[p[0]-i.r,p[1]-i.r],[p[0]+i.r,p[1]+i.r]]:[p]).flat())];
  const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),x0=Math.min(...xs)-3,x1=Math.max(...xs)+3,y0=Math.min(...ys)-3,y1=Math.max(...ys)+3,Wd=W||1600,sc=Math.min(Wd/(x1-x0),Wd*1.3/(y1-y0)),cw=Math.round((x1-x0)*sc),legH=90,ch=Math.round((y1-y0)*sc)+legH;
  const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cw,ch);const X=p=>[(p[0]-x0)*sc,(p[1]-y0)*sc],fs=Math.max(13,Math.round(cw/85));
  if(!P){x.strokeStyle='#eef2ee';x.lineWidth=1;const g=sc*5>40?5:10;for(let gx=Math.ceil(x0/g)*g;gx<x1;gx+=g){x.beginPath();x.moveTo((gx-x0)*sc,0);x.lineTo((gx-x0)*sc,ch-legH);x.stroke()}for(let gy=Math.ceil(y0/g)*g;gy<y1;gy+=g){x.beginPath();x.moveTo(0,(gy-y0)*sc);x.lineTo(cw,(gy-y0)*sc);x.stroke()}}
  if(P){x.save();x.translate(-x0*sc,-y0*sc);x.rotate(th);x.globalAlpha=P.hide?0:0.95;x.drawImage(im,-P.w/2*sc,-H/2*sc,P.w*sc,H*sc);x.restore()}
  its.forEach(i=>{x.save();x.strokeStyle=i.col;x.fillStyle=i.col;x.lineWidth=(i.lw||2)*Math.max(1,sc/40);x.lineJoin='round';x.lineCap='round';if(i.dash)x.setLineDash([10,7]);
    if(i.r){const c=X(i.m[0]);x.globalAlpha=.55;x.beginPath();x.arc(c[0],c[1],i.r*sc,0,7);x.fill();x.globalAlpha=1;x.lineWidth=2;x.stroke()}
    else{x.beginPath();i.m.forEach((p,j)=>{const q=X(p);j?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1])});if(i.closed){x.closePath();if(i.fill){x.globalAlpha=i.fill;x.fill();x.globalAlpha=1}}x.stroke()}x.restore()});
  x.font=`600 ${fs}px sans-serif`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.miterLimit=2;const boxes=[];planLabels().forEach(([t,p])=>{const q=X(toL(p)),w=x.measureText(t).width+6,h=fs+4;let y=q[1];for(let k=0;k<6&&boxes.some(b=>Math.abs(b[0]-q[0])<(b[2]+w)/2&&Math.abs(b[1]-y)<h);k++)y+=h;boxes.push([q[0],y,w]);x.lineWidth=4;x.strokeStyle='rgba(255,255,255,.92)';x.strokeText(t,q[0],y);x.fillStyle='#1d241f';x.fillText(t,q[0],y)});
  x.textAlign='left';x.textBaseline='alphabetic';const by=ch-legH+30,bar=[1,2,5,10,20,50].find(v=>v*sc>cw*0.12)||50;x.fillStyle='#212121';x.fillRect(20,by,bar*sc,6);x.font=`${fs}px sans-serif`;x.fillText(`${bar} m`,26+bar*sc,by+7);
  x.beginPath();x.moveTo(cw-40,by+12);x.lineTo(cw-30,by-22);x.lineTo(cw-20,by+12);x.closePath();x.fill();x.fillText('N',cw-36,by-28);
  const kinds=[...new Map(items.map(i=>[i.col,i.lab])).entries()].filter(e=>e[1]);let lx=20,ly=by+30;x.font=`${Math.round(fs*0.85)}px sans-serif`;
  kinds.forEach(([c,l])=>{const w=x.measureText(l).width+40;if(lx+w>cw-60){lx=20;ly+=fs+4}x.fillStyle=c;x.globalAlpha=.7;x.fillRect(lx,ly-fs*0.7,16,fs*0.8);x.globalAlpha=1;x.fillStyle='#333';x.fillText(l,lx+22,ly);lx+=w});
  return{data:cv.toDataURL('image/png'),w:Math.round(cw/2),h:Math.round(ch/2)}}
{const _pi16=planItems;planItems=function(){const it=_pi16(),lab={[TC.plot]:'Parcelle',[TC.path]:'Chemin, terrasse',[TC.lawn]:'Pelouse',[TC.potager]:'Potager',[TC.orchard]:'Verger',[TC.talus]:'Talus',[TC.pond]:'Mare',[TC.bed]:'Massif',[TC.hedge]:'Haie',[TC.vine]:'Vigne',[TC.fence]:'Clôture',[TC.fruit]:'Fruitier',[TC.obs]:'Arbre ou bâtiment existant','#795548':'Bâtiment existant','#4e342e':'Mur ou haie existant'};
  it.forEach(i=>{i.lab=lab[i.col]||''});(S.zones||[]).forEach(z=>it.push({pts:z.pts,col:ZK[z.kind].c,closed:1,fill:.4,lw:2,lab:ZK[z.kind].l}));return it}}
planComposite=function(W){return drawSiteCanvas(true,W)};
{const _cr16=collectReport;collectReport=async function(){const R=await _cr16();try{if(!(S.plan&&PLANIMG)&&R.sections){const im=await drawSiteCanvas(false,1600);if(im){const i=R.sections.findIndex(s=>s.title==='VOTRE PROJET');
  R.sections.splice(i>=0?i+1:1,0,{title:'PLAN D’ENSEMBLE',intro:'Tout ce qui a été dessiné sur la carte, à l’échelle, nord en haut.',tables:[],pngs:[null,im],planPng:im.data})}}}catch(e){console.warn('plan',e)}return R}}

/* ================= v16 : lot 2 (plantes, jardin médicinal, strates, existant, micro-forêt, eau, fraîcheur) ================= */
const NP=[
P("Ciste pourpre","Cistus × purpureus","arbuste",-12,"s","d","sl",[5.5,8],1,[5,6,7],1,"rose","vert","arrondi","med gra",{pers:1}),
P("Ciste à feuilles de laurier","Cistus laurifolius","arbuste",-15,"s","d","sl",[5,7.5],1.5,[6,7],1,"blanc","vert","arrondi","med",{pers:1}),
P("Sauge de Jérusalem","Phlomis fruticosa","arbuste",-15,"s","d","sl",[6,8.5],1,[6,7],1,"jaune","gris","arrondi","med gra",{pers:1}),
P("Santoline","Santolina chamaecyparissus","arbuste",-15,"s","d","sl",[6,8.5],0.5,[6,7],4,"jaune","gris","arrondi","med fr",{pers:1}),
P("Immortelle d’Italie","Helichrysum italicum","arbuste",-12,"s","d","s",[6,8.5],0.5,[6,7,8],4,"jaune","gris","arrondi","med",{pers:1,medic:'Huile essentielle, usage cosmétique (cicatrisation)'}),
P("Euphorbe de Corse","Euphorbia myrsinites","vivace",-20,"s","d","sl",[6,8.5],0.2,[3,4,5],5,"jaune","gris","couvre","med gra",{pers:1}),
P("Panicaut des Pyrénées","Eryngium bourgatii","vivace",-20,"s","d","sl",[6,8.5],0.5,[6,7,8],5,"bleu","gris","erige","med nw eco"),
P("Giroflée vivace 'Bowles's Mauve'","Erysimum 'Bowles's Mauve'","vivace",-15,"s","df","sl",[6,8],0.7,[3,4,5,6,7,8],3,"violet","gris","arrondi","med ang eco",{pers:1}),
P("Ballote","Ballota pseudodictamnus","vivace",-12,"s","d","s",[6.5,8.5],0.5,[6,7],4,"blanc","gris","arrondi","med"),
P("Anthémis des teinturiers","Anthemis tinctoria","vivace",-25,"s","d","sl",[6,8],0.6,[6,7,8],5,"jaune","vert","touffe","med ang eco"),
P("Avoine bleue","Helictotrichon sempervirens","graminee",-25,"s","d","sl",[6,8.5],0.6,[6,7],3,"blond","gris","fontaine","med gra nw",{pers:1}),
P("Avoine géante","Stipa gigantea","graminee",-20,"s","d","sl",[5.5,8],2,[6,7],1,"blond","vert","fontaine","med nw gra"),
P("Tritoma","Kniphofia uvaria (hybrides)","vivace",-15,"s","df","sl",[6,7.5],1,[7,8,9],3,"orange rouge","vert","touffe","med gra ang"),
P("Asphodèle jaune","Asphodeline lutea","vivace",-20,"s","d","sl",[6,8.5],0.8,[5,6],5,"jaune","gris","erige","med"),
P("Armoise 'Powis Castle'","Artemisia 'Powis Castle'","vivace",-15,"s","d","sl",[6,8],0.7,[],2,"","gris","arrondi","med gra",{pers:1}),
P("Germandrée petit-chêne","Teucrium chamaedrys","vivace",-20,"s","d","sl",[6.5,8.5],0.3,[7,8],6,"rose","vert","couvre","med fr eco",{pers:1}),
P("Orpin 'Angelina'","Sedum rupestre 'Angelina'","vivace",-25,"s","d","s",[6,8],0.15,[6,7],9,"jaune","vert","couvre","med gra",{pers:1}),
P("Lavandin 'Grosso'","Lavandula × intermedia 'Grosso'","arbuste",-15,"s","d","sl",[6.5,8.5],0.8,[7,8],2,"violet","gris","arrondi","med fr eco",{pers:1,medic:'Aromatique ; fleurs séchées (sachets, infusion légère)'}),
P("Liseron de Mauritanie arbustif","Convolvulus cneorum","arbuste",-10,"s","d","s",[6.5,8.5],0.6,[5,6,7],2,"blanc","gris","arrondi","med",{pers:1}),
P("Myrte commun","Myrtus communis","arbuste",-12,"s","df","sl",[6,8],2,[7,8],0,"blanc","vert","arrondi","med",{pers:1}),
P("Arbousier","Arbutus unedo","arbuste",-15,"s","df","sla",[5,7.5],4,[10,11],0,"blanc","vert","arrondi","med ang",{pers:1,note:"Fruits comestibles en automne, en même temps que les fleurs."}),
P("Gattilier","Vitex agnus-castus","arbuste",-15,"s","d","sl",[6,8],2.5,[8,9],0,"violet","gris","arrondi","med eco"),
P("Tamaris d’été","Tamarix ramosissima","arbuste",-25,"s","df","sl",[6,8.5],3,[7,8],0,"rose","vert","arrondi","med"),
P("Chalef d’Ebbinge","Elaeagnus × ebbingei","arbuste",-18,"smo","df","sla",[5.5,8],3,[10,11],0,"blanc","gris","arrondi","med fr",{pers:1}),
P("Olivier","Olea europaea","arbre",-12,"s","d","sl",[6,8.5],5,[6],0,"blanc","gris","arrondi","med",{pers:1,note:"Rustique jusqu’à −12 °C environ : à l’abri d’un mur exposé au sud, sur sol très drainant."}),
P("Cyprès de Provence","Cupressus sempervirens 'Totem'","arbre",-15,"s","d","sl",[6,8.5],6,[],0,"","vert","colonne","med fr",{pers:1}),
P("Mélisse","Melissa officinalis","vivace",-25,"sm","f","sla",[6,8],0.7,[6,7,8],4,"blanc","vert","touffe","viv eco",{medic:'Infusion apaisante et digestive (feuilles)'}),
P("Menthe poivrée","Mentha × piperita","vivace",-25,"smo","fh","la",[6,7.5],0.5,[7,8],6,"violet","vert","couvre","viv",{medic:'Infusion digestive (feuilles)',note:"Très envahissante : plantez-la dans un pot enterré."}),
P("Camomille matricaire","Matricaria chamomilla","annuelle",null,"s","df","sl",[6,8],0.4,[6,7,8],16,"blanc","vert","touffe","viv eco",{medic:'Infusion apaisante (capitules)'}),
P("Valériane officinale","Valeriana officinalis","vivace",-30,"sm","fh","la",[5.5,8],1.2,[6,7],3,"blanc rose","vert","erige","nat eco",{medic:'Racine : usage traditionnel pour le sommeil'}),
P("Millepertuis perforé","Hypericum perforatum","vivace",-30,"s","df","sl",[5.5,8],0.6,[6,7,8],5,"jaune","vert","erige","nat eco",{medic:'Usage traditionnel (huile rouge) ; nombreuses interactions médicamenteuses, rend la peau sensible au soleil'}),
P("Bourrache","Borago officinalis","annuelle",null,"s","f","sl",[6,8],0.6,[5,6,7,8,9],4,"bleu","vert","touffe","viv eco",{medic:'Fleurs comestibles ; huile des graines'}),
P("Guimauve officinale","Althaea officinalis","vivace",-25,"s","fh","la",[6,8],1.5,[7,8,9],2,"rose","gris","erige","nat",{medic:'Racine et feuilles adoucissantes (toux, gorge)'}),
P("Hysope officinale","Hyssopus officinalis","vivace",-25,"s","d","sl",[6.5,8.5],0.5,[7,8,9],5,"bleu","vert","touffe","med viv eco",{medic:'Aromatique ; infusion pour les voies respiratoires',pers:1}),
P("Grande camomille","Tanacetum parthenium","vivace",-25,"s","df","sl",[6,8],0.6,[6,7,8],5,"blanc","vert","touffe","ang viv",{medic:'Usage traditionnel contre les migraines'}),
P("Mauve sylvestre","Malva sylvestris","vivace",-25,"s","df","sla",[6,8],1,[6,7,8,9],3,"violet rose","vert","erige","nat eco",{medic:'Fleurs et feuilles adoucissantes en infusion'}),
P("Agripaume cardiaque","Leonurus cardiaca","vivace",-30,"sm","df","sla",[6,8],1,[6,7,8],3,"rose","vert","erige","nat",{medic:'Usage traditionnel (nervosité, palpitations)'}),
P("Agastache anisée","Agastache foeniculum","vivace",-25,"s","df","sl",[6,8],1,[7,8,9],4,"violet","vert","erige","eco viv",{medic:'Infusion anisée (feuilles et fleurs)'}),
P("Carex à épis pendants","Carex pendula","graminee",-25,"smo","fh","la",[5.5,8],1,[5,6],2,"vert","vert","fontaine","nat jap",{pers:1}),
P("Jonc épars","Juncus effusus","graminee",-30,"sm","h","la",[4.5,7.5],0.7,[6,7],4,"blond","vert","touffe","nat",{pers:1}),
P("Eupatoire chanvrine","Eupatorium cannabinum","vivace",-30,"sm","fh","la",[6,8],1.3,[7,8,9],2,"rose","vert","erige","nat eco"),
P("Lysimaque commune","Lysimachia vulgaris","vivace",-30,"sm","fh","la",[5.5,7.5],0.9,[7,8],4,"jaune","vert","erige","nat eco")];
{const have=new Set(PL.map(p=>p.l));NP.forEach(p=>{if(!have.has(p.l))PL.push(p)})}
const MEDIC={'Achillea millefolium':'Infusion digestive ; cicatrisant traditionnel','Calendula officinalis':'Fleurs : pommade apaisante pour la peau','Echinacea purpurea':'Racine et parties aériennes : usage traditionnel pour les défenses naturelles','Filipendula ulmaria':'Fleurs : infusion contre les douleurs légères','Lavandula angustifolia':'Fleurs : apaisante, huile essentielle','Mentha spicata':'Feuilles : infusion digestive','Origanum vulgare':'Aromatique ; infusion digestive','Salvia officinalis':'Feuilles : gargarisme, digestion','Salvia rosmarinus':'Aromatique ; tonique','Symphytum officinale':'Usage externe seulement (cataplasmes)','Thymus vulgaris':'Aromatique ; infusion pour la gorge','Thymus serpyllum':'Aromatique ; infusion','Sambucus nigra':'Fleurs en infusion ; baies cuites seulement'};
PL.forEach(p=>{if(MEDIC[p.l])p.medic=MEDIC[p.l];if(p.medic&&!p.st.includes('medi'))p.st.push('medi')});
STY.medi={l:'Jardin médicinal',s:'Aromatiques et plantes médicinales en carrés',d:'Un jardin de simples : des aromatiques persistantes pour la structure (thym, sauge, romarin, lavande, hysope), des vivaces médicinales (mélisse, échinacée, achillée, valériane…) plantées en carrés ou en bandes faciles d’accès pour la cueillette, et quelques annuelles semées chaque année (souci, camomille, bourrache). Les usages indiqués sont traditionnels : demandez conseil à un médecin ou à un pharmacien avant toute utilisation.',
 roles:[{r:'Aromatiques persistantes (structure)',f:p=>!!p.medic&&(p.t==='arbuste'||!!p.pers)&&p.h<=1.2&&p.d>0,k:A=>A>=8?3:2,m:'area',sh:.35},{r:'Vivaces médicinales',f:p=>!!p.medic&&p.t==='vivace'&&!p.pers,k:A=>A>=10?6:4,m:'area',sh:.65}],
 tasks:[[3,'Tailler d’un tiers les aromatiques ligneuses (lavande, sauge, thym, hysope)'],[5,'Semer souci, camomille et bourrache en place'],[6,'Récolter feuilles et fleurs le matin, par temps sec, au début de la floraison'],[9,'Diviser mélisse et menthe ; récolter les racines de valériane et de guimauve']]};
$('#styles').innerHTML=Object.entries(STY).map(([k,v])=>`<button class="sty" data-s="${k}" aria-pressed="${k===S.style}"><b>${v.l}</b><span>${v.s}</span></button>`).join('');
ENVQ[1].o.push(['medi','Médicinale et aromatique']);

/* --- strates choisies et variété des arbres --- */
const STRATA={all:null,noTree:['arbuste','vivace','graminee','fougere','bulbe','annuelle'],noWood:['vivace','graminee','fougere','bulbe','annuelle'],shrubs:['arbuste'],viv:['vivace','bulbe'],vivgra:['vivace','graminee','bulbe'],gra:['graminee'],fern:['fougere','vivace','bulbe'],trees:['arbre','arbuste']};
const STRL={arbre:'Arbres',arbuste:'Arbustes',vivace:'Vivaces',graminee:'Graminées',fougere:'Fougères',bulbe:'Bulbes'};
S.strata=S.strata||'all';S.strataC=S.strataC||['arbre','arbuste','vivace','graminee','fougere','bulbe'];S.vary=S.vary||0;
const pcat=p=>isBulb(p)?'bulbe':p.t;
const strataSet=()=>S.strata==='custom'?[...S.strataC,'annuelle']:STRATA[S.strata];
let COMPO16=0,NOTREE16=0;
{const _pf16=passF;passF=function(p,c){if(!_pf16(p,c))return false;if(c&&COMPO16){const s=strataSet();if(s&&!s.includes(pcat(p)))return false;if(NOTREE16&&p.t==='arbre')return false}return true}}
const hsh=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)/4294967296};
{const _sc16=scored;scored=function(){const r=_sc16();if(!COMPO16)return r;const seed=(PRJ.id||'')+':'+S.vary;return r.map(x=>x.p.t==='arbre'||x.p.t==='arbuste'?{...x,score:x.score+Math.round(hsh(seed+x.p.l)*(x.p.t==='arbre'?14:7))}:x)}}
function bedExisting(){if(!S.bed||!S.bed.ll)return[];const ll=S.bed.ll;return S.obs.filter(o=>['caduc','pers','arbu'].includes(o.type)&&(inPolyLL([o.lat,o.lng],ll)||distPtPoly([o.lat,o.lng],ll)<(o.w||2)/2))}
function underPlants(o,A){const c=cond(),cm={...c,expo:o.type==='pers'?'o':'m',eau:'d'};const ok=PL.filter(p=>['vivace','fougere','graminee'].includes(p.t)&&p.h<=0.8&&p.d>0&&scorePlant(p,cm).ok&&passF(p,true)).map(p=>({p,score:scorePlant(p,cm).score})).sort((a,b)=>b.score-a.score);
  const pick=[];for(const x of ok){if(pick.length>=4)break;if(pick.some(y=>y.p.t===x.p.t&&pick.filter(z=>z.p.t===x.p.t).length>=2))continue;pick.push(x)}return pick}
{const _co16=compose;compose=function(){const ex=bedExisting();COMPO16=1;NOTREE16=ex.some(o=>o.type==='caduc'||o.type==='pers')?1:0;let r;try{r=_co16()}finally{COMPO16=0;NOTREE16=0}
  try{if(r&&!r.custom){const s=strataSet();
    if(s&&!r.rows.some(x=>x.m==='area')&&r.rows.length&&s.includes('arbuste')){const tot=r.rows.reduce((a,x)=>a+x.qty,0),need=Math.max(tot,Math.round(r.planted/2));r.rows.forEach(x=>{x.qty=Math.max(1,Math.round(x.qty*need/tot));x.det='plantés à environ 2 m² chacun'})}
    if(ex.length&&S.bed){const ll=S.bed.ll;let Au=0;const add=[];ex.forEach(o=>{const cr=Math.PI*Math.pow((o.w||3)/2,2),a=Math.min(cr,r.A*0.8);Au+=a;if(o.type==='arbu')return;
        const pk=underPlants(o,a);pk.forEach(x=>{const ar=a/pk.length;add.push({role:`Sous l’arbre existant (${o.type==='pers'?'ombre sèche':'mi-ombre sèche'})`,m:'area',p:x.p,score:x.score,qty:Math.max(1,Math.round(ar*x.p.d)),det:`${nf(ar,1)} m² · ${x.p.d}/m²`,off:false,place:'Sous l’arbre',col:pickCol(x.p,r.cset)})})});
      const f=Math.max(0.2,1-Au/r.A);r.rows.forEach(x=>{if(x.m==='area'){x.qty=Math.max(1,Math.round(x.qty*f))}});r.rows.push(...add);r.existing=ex.map(o=>`${o.name||OBT[o.type].l} (${nf(o.h,1)} m)`)}}}catch(e){console.warn('compo',e)}
  return r}}
function renderStrata(){const s=$('#oStrata');if(s)s.value=S.strata;const c=$('#oStrataC');if(!c)return;c.hidden=S.strata!=='custom';c.innerHTML=Object.entries(STRL).map(([k,l])=>`<label class="chk"><input type="checkbox" data-strat="${k}"${S.strataC.includes(k)?' checked':''}> ${l}</label>`).join('')}
$('#oStrata').addEventListener('change',e=>{S.strata=e.target.value;renderStrata();renderCompo();saveNow(true)});
$('#oStrataC').addEventListener('change',e=>{const k=e.target.dataset.strat;if(!k)return;S.strataC=e.target.checked?[...new Set([...S.strataC,k])]:S.strataC.filter(x=>x!==k);if(!S.strataC.length){S.strataC=[k];e.target.checked=true;toast('Gardez au moins une strate.')}renderCompo();saveNow(true)});
$('#oVary').addEventListener('click',()=>{S.vary=(S.vary||0)+1;renderCompo();saveNow(true);toast('Nouvelle sélection d’arbres et d’arbustes.')});

/* --- micro-forêt, jardin de pluie, noue, îlot de fraîcheur --- */
S.zones=S.zones||[];LISTS.push('zones');EDIT_K.push(['zones',1]);
const ZK={foret:{l:'Micro-forêt',c:'#2e5e2a',w:'foret',t:'Micro-forêt (forme)',h:'Micro-forêt : cliquez le contour de la zone à boiser (idéalement 30 m² ou plus), puis « Terminer ».'},
 pluie:{l:'Jardin de pluie',c:'#3f8fb0',w:'pluie',t:'Jardin de pluie (forme)',h:'Jardin de pluie : cliquez le contour de la cuvette, à 3 m au moins des fondations, puis « Terminer ».'},
 noue:{l:'Noue d’infiltration',c:'#6aa9c9',w:'noue',t:'Noue d’infiltration (forme allongée)',h:'Noue : dessinez une forme allongée qui suit la pente, de la descente de gouttière vers la mare ou le jardin de pluie.'},
 fraicheur:{l:'Îlot de fraîcheur',c:'#43a047',w:'fraicheur',t:'Îlot de fraîcheur (forme)',h:'Îlot de fraîcheur : cliquez le contour de la zone à ombrager (coin repas, jeux, terrasse), puis « Terminer ».'}};
Object.entries(ZK).forEach(([k,z])=>{const m='z_'+k;SHAPE_MODES[m]=3;TC[m]=z.c;HINT[m]=z.h;SHORT[m]=z.l;DRAWTXT[m]='Cliquez le contour : '+z.l.toLowerCase();TOOLWANT[m]=z.w});
{const i=TOOLS.findIndex(t=>t[0]==='fence');TOOLS.splice(i+1,0,...Object.entries(ZK).map(([k,z])=>['z_'+k,z.t,'area']))}
rebuildToolLists();
WANTS.push(['foret','Une micro-forêt','Forêt dense d’essences locales (méthode Miyawaki)','z_foret'],['pluie','Un jardin de pluie','Recueille l’eau des toitures et l’infiltre','z_pluie'],['noue','Une noue d’infiltration','Fossé planté qui guide l’eau de pluie, vers une mare par exemple','z_noue'],['fraicheur','Un îlot de fraîcheur','Ombre, végétation et eau contre la chaleur','z_fraicheur']);
ENVQ[0].o.splice(ENVQ[0].o.length-1,0,['foret','Une micro-forêt'],['pluie','Gérer l’eau de pluie (jardin de pluie)'],['noue','Guider l’eau vers une mare (noue)'],['fraicheur','Un coin frais en été']);
renderWants();
const zDef=k=>({drain:k==='pluie'?40:k==='noue'?60:0,depth:k==='pluie'?0.2:k==='noue'?0.4:0});
{const _fs16=finishShape;finishShape=function(){const m=S.mode;if(!m||!m.startsWith('z_'))return _fs16();if(S.drawPts.length<3){$('#maphint').textContent='Il faut au moins 3 points.';return}pushUndo();
  const k=m.slice(2),id=++itemId;S.zones.push({id,pts:S.drawPts.slice(),kind:k,opts:zDef(k)});initGeom(id);setMode('site');itemsChanged(false);drawHandles();renderZones();toast(`${ZK[k].l} ajouté(e) : ${nf(areaLL(S.zones[S.zones.length-1].pts))} m². Résultats dans l’onglet « Forêt, eau et fraîcheur ».`);if(typeof wizApply==='function')wizApply()}}
{const _di16b=drawItems;drawItems=function(){_di16b();(S.zones||[]).forEach(z=>{const lab=`${ZK[z.kind].l} ${zNum(z)} · ${nf(areaLL(z.pts))} m²`;const l=hook(L.polygon(z.pts,{color:ZK[z.kind].c,weight:2,fillColor:ZK[z.kind].c,fillOpacity:z.kind==='noue'||z.kind==='pluie'?.45:.35,dashArray:z.kind==='noue'?'6 4':null}).addTo(itemsLayer),'zones',z.id,lab);if(l&&l.bindTooltip)l.bindTooltip(lab,{permanent:true,direction:'center',className:'maplbl'})});updateLegend()}}
{const _ril16=renderItemsList;renderItemsList=function(){_ril16();const ul=$('#itemsList ul');if(!ul)return;(S.zones||[]).forEach(z=>ul.insertAdjacentHTML('beforeend',`<li><span class="sw" style="background:${ZK[z.kind].c}"></span><span>${esc(ZK[z.kind].l)} ${zNum(z)} · ${nf(areaLL(z.pts))} m²</span><button type="button" data-del="zones" data-id="${z.id}">Supprimer</button></li>`))}}
{const _ss16=stepSecs;stepSecs=function(n){const s=_ss16(n);if(n===4&&(S.zones.length||['foret','pluie','noue','fraicheur'].some(wantOn))&&!s.includes('zones')){const i=s.indexOf('machines');i>=0?s.splice(i,0,'zones'):s.push('zones')}return s}}
const zNum=z=>S.zones.filter(x=>x.kind===z.kind).indexOf(z)+1;
function zDims(z){const mp=mPer(z.pts[0][0]),P=z.pts.map(p=>[p[1]*mp,p[0]*111320]);let L_=0;for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++)L_=Math.max(L_,Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1]));const A=areaLL(z.pts);return{A,L:L_,W:L_?A/L_:0}}
const nearB=z=>{const B=[...S.shapes.filter(s=>s.kind==='obsPoly').map(s=>s.pts),...S.obs.filter(o=>o.type==='bat').map(o=>[[o.lat,o.lng]])];let d=1e9;B.forEach(b=>z.pts.forEach(p=>{d=Math.min(d,b.length>2?distPtPoly(p,b):llDist(p,b[0]))}));return d};
const nearPond=z=>{let best=null;S.ponds.forEach((p,i)=>{const d=minD(geomPts('pond',p),geomPts('z',z));if(!best||d<best.d)best={i,d,p}});return best};
function pickPlants(filter,cm,n,used,nat){const out=[];PL.filter(p=>filter(p)&&!used.has(p.l)&&passF(p,true)).map(p=>({p,s:scorePlant(p,cm)})).filter(x=>x.s.ok).sort((a,b)=>(b.s.score+(nat&&b.p.st.includes('nat')?20:0))-(a.s.score+(nat&&a.p.st.includes('nat')?20:0))).forEach(x=>{if(out.length<n){out.push(x.p);used.add(x.p.l)}});return out}
function zoneInfo(z){const c=cond(),D=zDims(z),A=D.A,o=z.opts||{},used=new Set(),warn=[],rows=[],sup=[],steps=[],tech=[];let hours=0,cost=[0,0],nPl=0;
  const addPl=(lay,list,qtot)=>{if(!list.length)return;const q=Math.max(1,Math.round(qtot/list.length));list.forEach(p=>{rows.push([lay,p.n,p.l,q,nf(p.h,p.h<1?2:1)+' m']);nPl+=q;cost=add2(cost,pr(p.t==='arbre'||p.t==='arbuste'?(z.kind==='foret'?'haie':p.t):p.t==='annuelle'?'annuelle':p.t==='fougere'?'fougere':p.t==='graminee'?'graminee':'vivace',q))})};
  if(z.kind==='foret'){const n=Math.round(A*3),nat=p=>p.st.includes('nat')&&!p.pers;
    const L1=pickPlants(p=>p.t==='arbre'&&p.h>=12&&nat(p),c,4,used),L2=pickPlants(p=>(p.t==='arbre'&&p.h<12||p.t==='arbuste'&&p.h>=5)&&nat(p),c,4,used),L3=pickPlants(p=>p.t==='arbuste'&&p.h>=1.5&&p.h<5&&nat(p),c,6,used),L4=pickPlants(p=>p.t==='arbuste'&&p.h<1.5&&p.st.includes('nat'),c,3,used);
    addPl('Canopée (grands arbres)',L1,n*0.2);addPl('Arbres moyens',L2,n*0.25);addPl('Arbustes',L3,n*0.4);addPl('Strate basse',L4,n*0.15);
    const sp=L1.length+L2.length+L3.length+L4.length;if(A<30)warn.push('Surface faible : une micro-forêt fonctionne mieux à partir d’environ 30 m², idéalement 100 m² ou plus.');if(D.W<3)warn.push('Zone très étroite : visez au moins 3 m de large.');if(sp<10)warn.push(`Seulement ${sp} essences adaptées trouvées : ajoutez-en d’autres indigènes chez le pépiniériste (objectif : 15 à 30 essences).`);
    if(nearB(z)<5)warn.push('Moins de 5 m d’un bâtiment : les grands arbres devront être placés au fond de la zone.');
    tech.push(['Densité','3 jeunes plants par m²'],['Nombre de plants',String(n)],['Taille des plants','Jeunes plants de 40 à 80 cm, racines nues ou godets forestiers'],['Période de plantation','De novembre à mars, hors gel']);
    sup.push(['Compost ou fumier composté',`${nf(A*0.05,1)} m³`],['Paillage (paille, BRF)',`${nf(A*0.12,1)} m³ (10 à 15 cm)`]);cost=add2(add2(cost,pr('compost',A*0.05)),pr('paillage',A*0.12));hours=A*0.4+n*0.08;
    steps.push('Délimiter la zone et retirer le gazon.','Décompacter le sol sur 50 cm à 1 m (fourche-bêche ou mini-pelle) et y mélanger le compost.','Planter serré, 3 plants par m², en mélangeant les essences au hasard : jamais deux plants identiques côte à côte.','Pailler sur 10 à 15 cm et arroser copieusement.','Les 2 à 3 premières années : désherber, arroser en période sèche, recharger le paillage. Ensuite, la forêt se débrouille seule.')}
  else if(z.kind==='pluie'){const ratio={s:0.1,l:0.15,a:0.25}[c.sol]||0.15,need=(o.drain||40)*ratio,vol=A*(o.depth||0.2),vneed=(o.drain||40)*0.03;
    tech.push(['Surface de toiture ou terrasse raccordée',`${nf(o.drain||40)} m²`],['Surface conseillée',`${nf(need,1)} m² (${Math.round(ratio*100)} % de la surface raccordée, sol ${c.sol==='s'?'sableux':c.sol==='a'?'argileux':'limoneux'})`],['Profondeur de la cuvette',`${nf((o.depth||0.2)*100)} cm`],['Volume retenu',`${nf(vol,1)} m³ (pluie de 30 mm : ${nf(vneed,1)} m³)`]);
    if(A<need*0.8)warn.push(`Jardin un peu petit : visez environ ${nf(need,1)} m², ou raccordez moins de toiture.`);if(vol<vneed)warn.push('Volume insuffisant pour une forte pluie : creusez un peu plus ou prévoyez un trop-plein.');if(nearB(z)<3)warn.push('À moins de 3 m d’un bâtiment : éloignez la cuvette des fondations.');if(c.sol==='a')warn.push('Sol argileux : l’eau s’infiltre lentement. Ajoutez 20 à 30 cm de mélange sable-compost et un trop-plein (vers une noue ou une mare).');
    const bot=pickPlants(p=>['vivace','graminee'].includes(p.t)&&p.w.includes('h')&&p.w.includes('f')&&p.h<=1.5,{...c,eau:'h'},4,used,1),slope=pickPlants(p=>['vivace','graminee','fougere'].includes(p.t)&&p.w.includes('f')&&p.h<=1.2,{...c,eau:'f'},4,used,1),rim=pickPlants(p=>['vivace','graminee','arbuste'].includes(p.t)&&p.w.includes('d')&&p.h<=1.2,{...c,eau:'d'},3,used,1);
    const q=(arr,frac)=>arr.length?A*frac*(arr.reduce((s,p)=>s+(p.d||4),0)/arr.length):0;addPl('Fond (supporte l’eau quelques jours)',bot,q(bot,0.4));addPl('Pentes',slope,q(slope,0.4));addPl('Bord (plus sec)',rim,q(rim,0.2));
    sup.push(['Mélange sable-compost (sol lourd)',`${nf(A*0.25,1)} m³`],['Galets pour l’arrivée d’eau',`${nf(Math.max(0.1,A*0.01),1)} m³`],['Paillage',`${nf(A*0.07,1)} m³`]);cost=add2(cost,pr('paillage',A*0.07));if(c.sol!=='s')cost=add2(cost,pr('compost',A*0.12));hours=A*1.2+nPl*0.08;
    steps.push('Repérer la descente de gouttière et la pente du terrain ; placer la cuvette à 3 m au moins des fondations.','Creuser une cuvette de 15 à 30 cm, fond plat, bords en pente douce.','Ameublir le fond ; sur sol lourd, remplacer 20 à 30 cm par un mélange sable-compost.','Amener l’eau par une rigole en galets ou un tuyau enterré ; protéger l’arrivée avec des galets.','Prévoir un trop-plein vers une noue, une mare ou une zone qui accepte l’excès d’eau.','Planter selon les zones (fond, pentes, bord), pailler et arroser la première année.')}
  else if(z.kind==='noue'){const d=o.depth||0.4,s=3,b=D.W-2*s*d,dmax=D.W/(2*s),dd=b<0?Math.round(dmax*100)/100:d,bb=Math.max(0,D.W-2*s*dd),vol=D.L*(D.W+bb)/2*dd,vneed=(o.drain||60)*0.03,np=nearPond(z);
    tech.push(['Longueur',`${nf(D.L,1)} m`],['Largeur en haut',`${nf(D.W,2)} m`],['Profondeur',`${nf(dd*100)} cm${b<0?` (réduite : la noue est trop étroite pour ${nf(d*100)} cm avec des berges douces)`:''}`],['Largeur du fond',`${nf(bb,2)} m`],['Pentes des berges','1 de haut pour 3 de large'],['Volume stocké',`${nf(vol,1)} m³`],['Surface raccordée',`${nf(o.drain||60)} m² (pluie de 30 mm : ${nf(vneed,1)} m³)`]);
    if(vol<vneed)warn.push('Volume un peu faible : allongez ou élargissez la noue, ou raccordez moins de surface.');if(np&&np.d<6){tech.push(['Trop-plein',`vers la mare ${np.i+1} (à ${nf(np.d,1)} m)`]);steps.push(`Relier le bout de la noue à la mare ${np.i+1} par un seuil en galets : la mare reçoit l’eau propre des toitures, sans engrais ni boue.`)}
    const bot=pickPlants(p=>['vivace','graminee'].includes(p.t)&&p.w.includes('h')&&p.w.includes('f')&&p.h<=1.3,{...c,eau:'h'},3,used,1),bank=pickPlants(p=>['vivace','graminee'].includes(p.t)&&p.w.includes('f')&&p.h<=1,{...c,eau:'f'},3,used,1);
    addPl('Fond de la noue',bot,A*0.35*4);addPl('Berges',bank,A*0.65*5);sup.push(['Terre végétale',`${nf(A*0.1,1)} m³ (10 cm)`],['Toile coco pour les berges',`${nf(A*0.7)} m²`],['Galets (entrée, sortie, seuils)',`${nf(Math.max(0.2,D.L*0.03),1)} m³`]);cost=add2(cost,pr('coco',A*0.7));hours=D.L*1.5+nPl*0.06;
    steps.unshift('Tracer la noue en suivant la pente (0,5 à 1 %) ou en travers de la pente pour freiner l’eau ; placer des seuils si la pente est forte.','Creuser un profil en cuvette : berges douces (1 pour 3), fond plat.','Remettre 10 cm de terre végétale, couvrir les berges de toile coco.','Semer un mélange pour prairie humide ou planter fond et berges ; protéger l’entrée et la sortie par des galets.')}
  else if(z.kind==='fraicheur'){const tr=pickPlants(p=>p.t==='arbre'&&p.h>=6&&p.h<=16&&!p.pers&&['arrondi','etale'].includes(p.p),c,3,used),cr=tr.length?tr.reduce((s,p)=>s+Math.PI*Math.pow(p.h*0.35,2),0)/tr.length:40,nt=Math.max(1,Math.ceil(A*0.5/cr));
    addPl('Arbres d’ombrage (caducs : ombre l’été, soleil l’hiver)',tr.slice(0,Math.min(3,nt)),nt);const sh=pickPlants(p=>p.t==='arbuste'&&p.h<=3&&p.h>=1,{...c,expo:'m'},3,used),gc=pickPlants(p=>['vivace','fougere'].includes(p.t)&&p.p==='couvre',{...c,expo:'m'},3,used);
    addPl('Arbustes',sh,Math.max(2,Math.round(A/15)));addPl('Couvre-sols (sol toujours couvert)',gc,A*0.3*6);
    tech.push(['Objectif','Au moins la moitié de la zone ombragée par les arbres adultes'],['Arbres',`${nt} (couronne adulte moyenne ≈ ${nf(cr)} m²)`],['Surface',`${nf(A)} m²`]);
    if(!tr.length)warn.push('Aucun arbre adapté trouvé pour ce site : demandez conseil au pépiniériste.');sup.push(['Tuteurs et liens',`${nt}`],['Compost',`${nf(A*0.03,1)} m³`],['Paillage',`${nf(A*0.08,1)} m³`]);cost=add2(add2(add2(cost,pr('tuteur',nt)),pr('compost',A*0.03)),pr('paillage',A*0.08));hours=nt*1.5+A*0.2+nPl*0.08;
    steps.push('Placer les arbres au sud-ouest et à l’ouest du coin à rafraîchir : ils coupent le soleil de l’après-midi, le plus chaud.','Garder le sol perméable et couvert : couvre-sols, paillage ou prairie plutôt que grandes surfaces minérales sombres qui stockent la chaleur.','En attendant que les arbres grandissent : pergola ou treille avec une grimpante (vigne, glycine, houblon).','Ajouter de l’eau si possible : petite mare, bassin, fontaine ou simple récupérateur pour arroser.','Arroser les jeunes arbres en été pendant 3 ans (50 L tous les 10 jours en période sèche).')}
  return{A,D,rows,warn,tech,sup,steps,hours,cost,nPl}}
function renderZones(){const box=$('#zonesBox');if(!box)return;if(!S.zones.length){box.innerHTML=`<p class="empty">Dessinez une micro-forêt, un jardin de pluie, une noue ou un îlot de fraîcheur sur la carte (outils « Micro-forêt », « Jardin de pluie »…).</p><div class="chips">${Object.entries(ZK).map(([k,z])=>`<button type="button" data-zdraw="${k}">${esc(z.l)}</button>`).join('')}</div>`;return}
  box.innerHTML=S.zones.map(z=>{const I=zoneInfo(z),o=z.opts||{};return `<div class="card zcard" data-zid="${z.id}"><h4><span class="sw" style="background:${ZK[z.kind].c}"></span> ${esc(ZK[z.kind].l)} ${zNum(z)} · ${nf(I.A)} m²</h4>
   ${z.kind==='pluie'||z.kind==='noue'?`<div class="frow"><label>Surface de toiture ou terrasse raccordée (m²)<input type="number" min="0" step="5" data-zo="drain" value="${o.drain||0}"></label><label>Profondeur (cm)<input type="number" min="5" max="100" step="5" data-zo="depth" value="${Math.round((o.depth||0)*100)}"></label></div>`:''}
   ${I.warn.map(w=>`<p class="warn">${esc(w)}</p>`).join('')}<table class="stack"><tbody>${I.tech.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>
   ${I.rows.length?`<h5>Plantes (${nf(I.nPl)})</h5><table class="stack"><thead><tr><th>Strate</th><th>Plante</th><th>Qté</th><th>Hauteur</th></tr></thead><tbody>${I.rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])} <i>${esc(r[2])}</i></td><td>${r[3]}</td><td>${esc(r[4])}</td></tr>`).join('')}</tbody></table>`:''}
   ${I.sup.length?`<p class="small"><b>Fournitures :</b> ${I.sup.map(s=>`${esc(s[0])} : ${esc(s[1])}`).join(' · ')}</p>`:''}<details><summary>Étapes de réalisation</summary><ol class="small">${I.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details>
   <p class="small">Budget indicatif (fournitures et plants) : ${rg(I.cost.map(v=>v*1.06))} · travail ≈ ${nf(Math.round(I.hours))} h</p></div>`}).join('')}
$('#zones').addEventListener('change',e=>{const k=e.target.dataset.zo;if(!k)return;const z=S.zones.find(x=>x.id==e.target.closest('[data-zid]').dataset.zid);if(!z)return;const v=parseFloat(e.target.value);if(!(v>=0))return;z.opts=z.opts||{};z.opts[k]=k==='depth'?v/100:v;renderZones();saveNow(true)});
$('#zones').addEventListener('click',e=>{const b=e.target.closest('[data-zdraw]');if(b){setWant(ZK[b.dataset.zdraw].w,true);renderWants();showTab('carte',true);setMode('z_'+b.dataset.zdraw)}});
{const _ic16=itemsChanged;itemsChanged=function(a){_ic16(a);if(!$('#zones').classList.contains('tabhide'))renderZones()}}
{const _bl16=budgetLines;budgetLines=function(){const L=_bl16();S.zones.forEach(z=>{const I=zoneInfo(z);L.push({k:z.kind,t:`${ZK[z.kind].l} ${zNum(z)}`,sup:I.cost,vat:6,qtxt:`${nf(I.A)} m² · ${nf(I.nPl)} plants`,rent:z.kind==='foret'&&I.A>60||z.kind==='noue'&&I.D.L>15?[60,110]:[0,0],hDiy:I.hours,hPro:I.hours/1.8})});return L}}
{const _vs16b=v4Sections;v4Sections=function(){const o=_vs16b();S.zones.forEach(z=>{const I=zoneInfo(z);o.push({title:`${ZK[z.kind].l.toUpperCase()} ${zNum(z)}`,intro:`${nf(I.A)} m².`,tables:[{h:'Caractéristiques',head:['Point','Détail'],rows:I.tech,w:[5000,9838]},...(I.rows.length?[{h:'Plantes',head:['Strate','Plante','Nom latin','Quantité','Hauteur'],rows:I.rows,w:[3500,3500,3800,1800,2238]}]:[]),...(I.sup.length?[{h:'Fournitures',head:['Fourniture','Quantité'],rows:I.sup,w:[8000,6838]}]:[])],bullets:[...I.warn,...I.steps],bh:'Points d’attention et étapes'})});const bi=o.findIndex(x=>/^BUDGET/.test(x.title));if(bi>=0)o.push(o.splice(bi,1)[0]);return o}}
DIY.foret={t:'Micro-forêt',when:'Novembre à mars',dur:a=>`≈ ${nf(Math.round(a*0.6))} h pour ${nf(a)} m²`,lvl:'Moyen',tools:'Fourche-bêche, bêche, brouette, cordeau',s:['Voir les étapes détaillées dans l’onglet « Forêt, eau et fraîcheur ».']};
DIY.pluie={t:'Jardin de pluie',when:'Printemps ou automne',dur:a=>`≈ ${nf(Math.round(a*1.5))} h pour ${nf(a)} m²`,lvl:'Moyen',tools:'Bêche, pelle, niveau, brouette',s:['Voir les étapes détaillées dans l’onglet « Forêt, eau et fraîcheur ».']};
DIY.noue={t:'Noue d’infiltration',when:'Fin d’été ou automne (sol ressuyé)',dur:a=>`≈ ${nf(Math.round(a*1.2))} h pour ${nf(a)} m²`,lvl:'Moyen à difficile',tools:'Bêche, pelle, niveau à bulle et cordeau (ou mini-pelle)',s:['Voir les étapes détaillées dans l’onglet « Forêt, eau et fraîcheur ».']};
DIY.fraicheur={t:'Îlot de fraîcheur',when:'Novembre à mars pour les arbres',dur:a=>`≈ ${nf(Math.round(a*0.3))} h pour ${nf(a)} m²`,lvl:'Facile',tools:'Bêche, tuteurs, maillet, arrosoir',s:['Voir les étapes détaillées dans l’onglet « Forêt, eau et fraîcheur ».']};
{const _dl16=diyList;diyList=function(){const L=_dl16();S.zones.forEach(z=>L.push([z.kind,Math.round(areaLL(z.pts))]));return L}}
{const _int16=interactions;interactions=function(){const L=_int16();S.zones.forEach(z=>{const i=zNum(z)-1;if(z.kind!=='noue'&&z.kind!=='pluie')return;const np=nearPond(z);if(np&&np.d<6)L.push({lvl:'tip',t:`${ZK[z.kind].l} ${i+1} et mare ${np.i+1}`,d:`À ${nf(np.d,1)} m l’une de l’autre : faites déborder ${z.kind==='noue'?'la noue':'le jardin de pluie'} vers la mare par un seuil en galets. La mare reçoit l’eau propre des toitures et reste pleine plus longtemps l’été.`});
    else if(z.kind==='noue'&&S.ponds.length)L.push({lvl:'tip',t:`Noue ${i+1} et mare`,d:'Prolongez la noue jusqu’à la mare pour l’alimenter en eau de pluie.'});if(nearB(z)<3)L.push({lvl:'warn',t:`${ZK[z.kind].l} ${i+1} trop près d’un bâtiment`,d:'Gardez au moins 3 m entre une zone d’infiltration et les fondations.'})});
  S.zones.filter(z=>z.kind==='foret').forEach((z,i)=>{/*num*/S.potagers.forEach((v,j)=>{const d=minD(geomPts('z',z),geomPts('v',v));if(d<4)L.push({lvl:'warn',t:`Micro-forêt ${i+1} et potager ${j+1}`,d:'La micro-forêt va ombrager et concurrencer le potager : gardez 4 m au moins, ou placez le potager au sud de la forêt.'})})});return L}}
{const _ser16=serialize;serialize=function(){const d=_ser16();Object.assign(d.set,{bedView:S.bedView,lawnType:S.lawnType,strata:S.strata,strataC:S.strataC,vary:S.vary});return d}}
{const _rs16=restoreSettings;restoreSettings=function(t){_rs16(t);if(!t)return;S.bedView=t.bedView||'auto';S.lawnType=t.lawnType||null;S.strata=t.strata||'all';S.strataC=t.strataC||['arbre','arbuste','vivace','graminee','fougere','bulbe'];S.vary=t.vary||0;renderStrata();renderViewHint()}}
{const _rp16=resetProject;resetProject=function(){_rp16();S.bedView='auto';S.lawnType=null;S.strata='all';S.vary=0;S.zones=[];renderStrata();renderViewHint()}}
{const _rst16=restoreState;restoreState=function(d){_rst16(d);S.zones=S.zones||[];drawItems();renderZones();renderStrata();renderViewHint()}}
renderStrata();renderViewHint();updateLegend();setTimeout(()=>{renderZones();updateLegend()},0);
window.__p16={zoneInfo,drawSiteCanvas,applyView,bedExisting,rotItem,sclItem,lawnT};

/* ================= v17 : envies décrites en texte ou à la voix ================= */
S.env.text=S.env.text||'';
const ENVKW={want:{massif:['fleur','massif','vivace','couleur','bloem'],potager:['potager','legume','tomate','salade','moestuin','groente','vegetable'],fruit:['fruit','pommier','poirier','cerisier','framboise','prunier','fruitboom'],verger:['verger','boomgaard','orchard'],
   haie:['haie','intimite','vis-a-vis','vis a vis','cacher','brise-vue','brise vue','regard','haag','privacy'],mare:['mare','bassin','etang','point d\'eau','grenouille','vijver','pond'],pelouse:['pelouse','gazon','prairie','gras','lawn'],jardinieres:['balcon','jardiniere','en pot','des pots','bacs','balkon'],
   cloture:['cloture','palissade','grillage','afsluiting','fence'],talus:['talus','pente','butte','helling','slope'],entretien:['entretenir','deja des plantes','existant'],foret:['foret','miyawaki','bosquet','minibos'],pluie:['eau de pluie','gouttiere','jardin de pluie','inond','flaque','regenwater'],noue:['noue','fosse','wadi'],fraicheur:['fraicheur','frais en ete','canicule','chaleur','trop chaud','ombre pour','koel']},
 amb:[['jap',['japon','zen']],['med',['mediterran','provence','jardin sec','lavande','olivier']],['ros',['rosier','roseraie','des roses']],['medi',['medicinal','tisane','aromatique','plantes qui soignent']],['gra',['contemporain','moderne','graphique','minimal','epure']],['nw',['graminee','new wave','prairie de vivaces']],['eco',['biodiversite','ecolog','refuge']],['viv',['comestible','nourricier','a manger']],['nat',['naturel','sauvage','sous-bois','sous bois','forestier']],['ang',['anglais','champetre','romantique','cottage','boheme']]],
 care:[['low',['peu d\'entretien','pas le temps','sans entretien','facile','pas beaucoup de temps','le moins possible','weinig onderhoud','low maintenance']],['high',['j\'adore jardiner','passionne','j\'aime jardiner','beaucoup de temps']]],
 who:{kids:['enfant','bebe','petit-fils','petite-fille','kinder','kids','children'],pets:['chien','chat','animaux','animal','hond','kat','dog','cat'],bio:['oiseau','abeille','papillon','biodiversite','herisson','insecte','pollinis','vogel','bij'],senior:['mal au dos','se baisser','age','mobilite','fauteuil','genoux']},
 water:[['auto',['arrosage automatique','goutte a goutte','goutte-a-goutte','arroseur']],['none',['pas arroser','sans arrosage','pas d\'arrosage','secheresse','ne veux pas arroser','zonder water']],['ok',['arroser facilement','je peux arroser']]],
 diy:[['me',['moi-meme','moi meme','je ferai','je vais faire','bricol','je creuse','zelf']],['pro',['paysagiste','professionnel','une entreprise','faire faire','aannemer','tuinaannemer']]]};
function envParse(t){const x=' '+String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’]/g,'\'')+' ',has=w=>w.some(k=>x.includes(k)),r={want:[],who:[]};
  Object.entries(ENVKW.want).forEach(([k,w])=>{if(has(w))r.want.push(k)});Object.entries(ENVKW.who).forEach(([k,w])=>{if(has(w))r.who.push(k)});
  ['amb','care','water','diy'].forEach(k=>{const f=ENVKW[k].find(([v,w])=>has(w));if(f)r[k]=f[0]});
  const m=x.match(/(\d[\d .]*)\s*(€|eur|euro)/);if(m){const v=parseFloat(m[1].replace(/[ .]/g,''));if(v>0)r.budget=v<500?'s':v<=3000?'m':'l'}else if(has(['petit budget','pas cher','economique','pas beaucoup d\'argent']))r.budget='s';
  return r}
function envApply(r,src){const E=S.env,got=[];(r.want||[]).forEach(k=>{if(WANTS.some(w=>w[0]===k)&&!S.want.has(k)){setWant(k,true);got.push(WANTS.find(w=>w[0]===k)[1])}});
  (r.who||[]).forEach(v=>{if(['kids','pets','bio','senior'].includes(v)&&!E.who.includes(v)){E.who=[...E.who,v];got.push(envLab('who',v))}});
  [['amb',Object.keys(STY)],['care',['low','mid','high']],['water',['ok','auto','none']],['diy',['me','pro','?']],['budget',['s','m','l','?']]].forEach(([k,ok])=>{if(r[k]&&ok.includes(r[k])&&E[k]!==r[k]){E[k]=r[k];got.push(k==='amb'?STY[r[k]].l:envLab(k,r[k]))}});
  if(E.water==='auto')setWant('arrosage',true);if(E.diy==='me')setWant('diy',true);applyStyle(envStyle());renderWants();renderEnvies();if(WZ.on)wizApply();renderMapTools();saveNow(true);
  const out=$('#envTxtOut');if(out)out.innerHTML=got.length?`<p class="okp"><b>${src==='ia'?'L’IA a compris':'J’ai compris'} :</b> ${esc(got.join(' · '))}. Les réponses ci-dessous sont cochées : corrigez-les si besoin.</p>${r.resume?`<p class="small">${esc(r.resume)}</p>`:''}`:'<p class="koo">Je n’ai rien reconnu de précis : ajoutez des détails (ce que vous voulez planter, l’ambiance, le temps d’entretien…) ou répondez aux questions ci-dessous.</p>'}
const ENV_SYS=`Tu aides à remplir un questionnaire de jardin à partir de la description libre d’un particulier en Belgique. Réponds uniquement en JSON :
{"want":["clés parmi ${WANTS.map(w=>w[0]).join(', ')}, foret, pluie, noue, fraicheur"],"amb":"une clé parmi ${Object.keys(STY).join(', ')}, medi, ou vide","care":"low|mid|high|vide","who":["kids|pets|bio|senior"],"water":"ok|auto|none|vide","diy":"me|pro|?|vide","budget":"s (moins de 500 €)|m (500 à 3 000 €)|l (plus de 3 000 €)|vide","resume":"une phrase qui reformule le projet"}
N’invente rien : laisse vide ce qui n’est pas dit.`;
$('#envTxtGo').addEventListener('click',async()=>{const t=($('#envTxt').value||'').trim();if(!t){toast('Écrivez ou dictez d’abord ce que vous aimeriez.');return}S.env.text=t;if(!($('#aiWish').value||'').trim())$('#aiWish').value=t;
  const loc=envParse(t);if(!aiReady()){envApply(loc,'local');return}
  const b=$('#envTxtGo');b.disabled=true;b.textContent='Analyse…';try{const j=await askClaude(ENV_SYS,t.slice(0,3000),600);const m={...loc,...Object.fromEntries(Object.entries(j||{}).filter(([k,v])=>v&&(!Array.isArray(v)||v.length)))};m.want=[...new Set([...(loc.want||[]),...((j&&j.want)||[])])];m.who=[...new Set([...(loc.who||[]),...((j&&j.who)||[])])];envApply(m,'ia')}
  catch(e){envApply(loc,'local')}finally{b.disabled=false;b.textContent='Comprendre ma description'}});
const SRec=window.SpeechRecognition||window.webkitSpeechRecognition;let envRec=null;
function micUI(on){const b=$('#envMic');if(!b)return;b.setAttribute('aria-pressed',String(on));b.innerHTML=on?'<span aria-hidden="true">⏹</span> Arrêter la dictée':'<span aria-hidden="true">🎤</span> Dicter'}
$('#envMic').addEventListener('click',()=>{if(!SRec){toast('Dictée non disponible dans ce navigateur : utilisez le micro du clavier de votre téléphone, ou Chrome, Edge ou Safari.');return}
  if(envRec){envRec.stop();return}const ta=$('#envTxt'),base=ta.value.trim()?ta.value.trim()+' ':'';envRec=new SRec();envRec.lang=LANG==='nl'?'nl-BE':LANG==='en'?'en-GB':'fr-BE';envRec.interimResults=true;envRec.continuous=true;
  envRec.onresult=e=>{let fin='',tmp='';for(let i=0;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)fin+=r[0].transcript+' ';else tmp+=r[0].transcript}ta.value=(base+fin+tmp).replace(/\s+/g,' ')};
  envRec.onerror=e=>{toast(e.error==='not-allowed'?'Autorisez le micro pour ce site dans votre navigateur.':'Dictée interrompue ('+e.error+').')};envRec.onend=()=>{envRec=null;micUI(false);S.env.text=ta.value.trim();saveNow(true)};
  try{envRec.start();micUI(true)}catch(err){envRec=null;toast('Dictée impossible : '+err.message)}});
if(!SRec)$('#envMic').title='Dictée non prise en charge par ce navigateur';
{const _re17=renderEnvies;renderEnvies=function(){_re17();const t=$('#envTxt');if(t&&!t.value&&S.env.text)t.value=S.env.text}}
$('#envTxt').addEventListener('change',e=>{S.env.text=e.target.value.trim();saveNow(true)});
{const _rp17=resetProject;resetProject=function(){_rp17();const t=$('#envTxt');if(t)t.value='';const o=$('#envTxtOut');if(o)o.innerHTML=''}}
window.__p17={envParse};


/* ================= v17 : tutoriel adapté (particulier / professionnel), relancé tant qu’il n’est pas terminé ================= */
const TUTO0=TUTO.map(x=>x.slice());
const TUTO_PRO_START=['#audSw',null,'Particulier ou professionnel','Ce bouton choisit la version : particulier (parcours simple en 4 étapes) ou professionnel (tous les onglets, outils et détails).'];
const TUTO_PUB=[TUTO_PRO_START,
 ['#envTxt','envies','Dites ce que vous aimeriez','Écrivez ou dictez votre projet avec le bouton 🎤, ou répondez aux questions : tout se coche automatiquement.'],
 ['.aiideas','envies','Pas encore d’idée ?','Ajoutez des photos de votre jardin : l’IA vous propose trois projets adaptés.'],
 ['#steps',null,'Suivez les 4 étapes','Mes envies, Mon terrain, Mes résultats, Mon projet en main : seul ce qui est utile s’affiche.'],
 ['#search',null,'Trouvez votre terrain','Tapez votre adresse ou cliquez sur « Ma position ».'],
 ['#mapTools','carte','Dessinez sur la carte','Choisissez un outil, puis cliquez les angles sur la carte : votre terrain, la maison, le massif, la mare… Le cadenas 🔓 empêche la carte de bouger par erreur.'],
 ['#exPdf','export','Votre rapport','Rapport résumé ou détaillé en PDF ou Word, budget, primes et professionnels près de chez vous.'],
 ['#aiOpen',null,'Besoin d’aide ?','« Décrire mon projet » ouvre l’assistant. Le menu ☰ → « Aide : relancer le tutoriel » le relance à tout moment.']];
function setTuto(){const L=AUD==='pub'?TUTO_PUB:[TUTO_PRO_START,...TUTO0];TUTO.splice(0,TUTO.length,...L.map(x=>x.slice()))}
{const _tg17=tutoGo;tutoGo=function(i){if(i===0&&tutoI<0)setTuto();const el=TUTO[i]&&document.querySelector(TUTO[i][0]);if(i<TUTO.length&&i>=0&&!el){return tutoGo(i+(i>=tutoI?1:-1))}return _tg17(i)}}
{const _te17=tutoEnd;tutoEnd=function(fin){const was=tutoI>=0;_te17(fin);if(was&&WZ.on){applyTabs(stepSecs(WZ.step));wizApply()}}}

/* ================= v18 : plan en deux parties (existant / aménagement), couches à gauche, éléments modifiables ================= */
S.phase=S.phase||'exist';
const EXK=['plots','obs','shapes'];
function curPhase(){return S.phase==='create'?'create':'exist'}
const isExistItem=(kind,it)=>EXK.includes(kind)||(kind==='paths'&&!(it&&it.nat==='pasjap'));
const locked=(kind,it)=>curPhase()==='create'&&isExistItem(kind,it);
const toolOk=k=>{if(k==='measure'||k==='erase')return true;const ex=EXIST_TOOLS.includes(k);return curPhase()==='exist'?ex:!ex};
const PH_HINT={exist:'Dessinez ce qui existe déjà : limite du terrain, maison et bâtiments, arbres, murs, chemins et terrasse. Ces éléments comptent pour l’ombre, les distances et les conseils.',
  create:'Dessinez votre aménagement. L’existant est verrouillé (en pointillés) : il ne bouge plus, mais il reste pris en compte pour l’ombre, les distances et les liens entre aménagements.'};
function setPhase(p){S.phase=p;applyPhase();saveNow(true)}
function applyPhase(){const ph=curPhase();document.querySelectorAll('#phaseBar [data-ph]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ph===ph)));
  const h=$('#phHint');if(h)h.textContent=PH_HINT[ph];const n=$('#phNext');if(n)n.hidden=ph!=='exist';const bk=$('#phBack');if(bk)bk.hidden=ph!=='create';
  $('#map').classList.toggle('phcreate',ph==='create');if(S.mode&&S.mode!=='site'&&!toolOk(S.mode))setMode('site');
  S.obs.forEach(o=>{if(o.marker&&o.marker.dragging)ph==='create'?o.marker.dragging.disable():o.marker.dragging.enable()});
  renderMapTools();drawItems();renderItemsList();renderObs();if(S.editing)drawHandles()}
$('#phaseBar').addEventListener('click',e=>{const b=e.target.closest('[data-ph]');if(b){setPhase(b.dataset.ph);return}if(e.target.closest('#phNext')){setPhase('create');toast('L’existant est verrouillé. Choisissez un outil pour dessiner votre aménagement.')}if(e.target.closest('#phBack'))setPhase('exist')});
{const _rmt18=renderMapTools;renderMapTools=function(){_rmt18();const box=$('#mapTools');if(!box)return;const ph=curPhase();
  box.querySelectorAll('[data-mt]').forEach(b=>{if(!toolOk(b.dataset.mt))b.remove()});const have=new Set([...box.querySelectorAll('[data-mt]')].map(b=>b.dataset.mt));
  const add=TOOLS.filter(t=>{const k=t[0];if(k==='g'||!SHORT[k]||have.has(k)||!toolOk(k)||k==='measure'||k==='erase')return false;if(ph==='exist')return true;if(k==='fence')return wantOn('cloture');return !TOOLWANT[k]||S.want.has(TOOLWANT[k])});
  const ref=box.querySelector('[data-mt=measure],[data-mt=erase]'),html=add.map(t=>`<button type="button" data-mt="${t[0]}" aria-pressed="${S.mode===t[0]}" title="${esc(t[1])}">${swatch(t[0],t[2])}<span>${esc(SHORT[t[0]])}</span></button>`).join('');
  if(ref)ref.insertAdjacentHTML('beforebegin',html);else box.insertAdjacentHTML('beforeend',html);box.querySelectorAll('[data-mt=measure],[data-mt=erase]').forEach(b=>box.appendChild(b))}}
{const _wg18=wizGo;wizGo=function(n){_wg18(n);if(AUD!=='pub'&&(WZ.step===1||WZ.step===3))S.phase=WZ.step===1?'exist':'create';applyPhase()}}
{const _wa18=wizApply;wizApply=function(){_wa18();if(!(WZ.on&&AUD==='pub'&&WZ.step===1))return;const i=$('#stepIntro .in');if(!i)return;const ph=curPhase();
  if(ph==='exist'){i.querySelectorAll('.todo.draw,.todoh').forEach(x=>x.remove())}else{i.querySelectorAll('.todo:not(.draw)').forEach(x=>x.remove());if(!i.querySelector('.todo.draw')){const more=i.querySelector('.more'),hh=drawChecklist().replace('<ul class="todo">','<ul class="todo draw">');(more||i.lastChild).insertAdjacentHTML(more?'beforebegin':'afterend',hh)}}}}
/* verrouillage de l’existant pendant la création */
{const _hk18=hook;hook=function(l,kind,id,label){const r=_hk18(l,kind,id,label);try{const it=(kind==='bed'?S.bed:(Array.isArray(S[kind])?S[kind]:[]).find(x=>x.id==id));if(locked(kind,it)&&l.setStyle)l.setStyle({opacity:.6,fillOpacity:.1,dashArray:'5 5'})}catch(e){}return r}}
{const _del18=delItem;delItem=function(kind,id){const it=(kind==='bed'?S.bed:(Array.isArray(S[kind])?S[kind]:[]).find(x=>x.id==id));if(locked(kind,it)){toast('Élément existant verrouillé : revenez à « 1. L’existant » pour le supprimer.');return}return _del18(kind,id)}}
{const _dh18=drawHandles;drawHandles=function(){if(curPhase()!=='create')return _dh18();const keep=EDIT_K.slice();for(let i=EDIT_K.length-1;i>=0;i--)if(EXK.includes(EDIT_K[i][0])||EDIT_K[i][0]==='paths')EDIT_K.splice(i,1);try{return _dh18()}finally{EDIT_K.splice(0,EDIT_K.length,...keep)}}}
{const _sc18=siteClick;siteClick=function(lat,lng){if(curPhase()==='create'&&S.mode==='site'&&!(WZ.on&&AUD!=='pub')){$('#maphint').textContent='Choisissez un outil pour dessiner votre aménagement, ou revenez à « 1. L’existant » pour déplacer le terrain.';return}return _sc18(lat,lng)}}
{const _ro18=renderObs;renderObs=function(){_ro18();const box=$('#obslist');if(!box)return;const lk=curPhase()==='create';box.classList.toggle('lockedl',lk);box.querySelectorAll('input,select,button').forEach(x=>{x.disabled=lk});
  let n=$('#obsLockNote');if(lk&&!n){box.insertAdjacentHTML('beforebegin','<p class="note" id="obsLockNote">🔒 Existant verrouillé pendant la création de l’aménagement. <button type="button" data-ph-back="1">Revenir à l’existant</button></p>')}else if(!lk&&n)n.remove()}}
document.addEventListener('click',e=>{if(e.target.closest('[data-ph-back]'))setPhase('exist')});
/* fenêtre d’un élément : verrouillée ou enrichie (modifier la forme, réglages) */
const KTAB={bed:['massif','Composition du massif'],hedges:['amenagements','Réglages de la haie'],fruits:['amenagements','Réglages du fruitier'],vines:['amenagements','Réglages de la vigne'],ponds:['amenagements','Réglages de la mare'],taluses:['amenagements','Réglages du talus'],orchards:['verger','Réglages du verger'],potagers:['potager','Réglages du potager'],lawns:['pelouse','Choisir la pelouse'],fences:['cloture','Réglages de la clôture'],zones:['zones','Détails et réglages']};
function popEl(){const c=document.querySelectorAll('.leaflet-popup-content');return c[c.length-1]||null}
{const _ip18=itemPopup;itemPopup=function(ll,kind,id,label){const it=kind==='bed'?S.bed:(S[kind]||[]).find(x=>x.id==id);
  if(locked(kind,it)){if(!L.popup||!ll)return;const d=document.createElement('div');d.className='lockpop';d.innerHTML=`<b>🔒 ${esc(label||'Élément existant')}</b><p class="small">Élément existant : il reste pris en compte (ombre, distances, liens) mais ne se modifie pas pendant la création.</p><button type="button" class="popdel">Revenir à « L’existant » pour le modifier</button>`;
    d.querySelector('button').addEventListener('click',()=>{map.closePopup();setPhase('exist');setTimeout(()=>itemPopup(ll,kind,id,label),200)});L.popup().setLatLng(ll).setContent(d).openOn(map);return}
  _ip18(ll,kind,id,label);setTimeout(()=>{const c=popEl();if(!c||c.querySelector('.popx18'))return;const T=KTAB[kind],shape=kind==='bed'||(it&&it.pts&&it.pts.length>1);
    const w=document.createElement('div');w.className='popx18';w.innerHTML=`${shape&&!S.editing?'<button type="button" class="popdel" data-pe="edit">Modifier la forme</button> ':''}${T?`<button type="button" class="popdel" data-pe="tab">${esc(T[1])}</button>`:''}`;if(!w.innerHTML.trim())return;c.appendChild(w);
    w.addEventListener('click',ev=>{const b=ev.target.closest('[data-pe]');if(!b)return;map.closePopup&&map.closePopup();if(b.dataset.pe==='edit'){setEditing(true);toast('Déplacez les points, la poignée ✥ ou ⟳ ; « Terminer la modification » pour finir.')}else{applyTabs([...new Set([...curTabs(),T[0]])]);showTab(T[0],true)}})},30)}}
/* liste « Éléments sur la carte » : un clic ouvre l’élément */
function itemLL(kind,id){if(kind==='bed')return S.bed&&cen(S.bed.ll);const it=(S[kind]||[]).find(x=>x.id==id);if(!it)return null;if(kind==='obs'||kind==='fruits')return[it.lat,it.lng];return it.pts&&cen(it.pts)}
{const _ril18=renderItemsList;renderItemsList=function(){_ril18();const el=$('#itemsList');if(!el)return;const lk=curPhase()==='create';
  el.querySelectorAll('li').forEach(li=>{const d=li.querySelector('[data-del]');if(!d)return;const kind=d.dataset.del,id=d.dataset.id,it=kind==='bed'?S.bed:(S[kind]||[]).find(x=>x.id==id),lab=li.querySelector('span:not(.sw)');
    if(lab&&!lab.classList.contains('itlink')){lab.classList.add('itlink');lab.setAttribute('role','button');lab.tabIndex=0;lab.title='Afficher et modifier sur la carte';lab.dataset.k=kind;lab.dataset.i=id}
    if(lk&&isExistItem(kind,it)){li.classList.add('lockli');li.querySelectorAll('button').forEach(b=>b.hidden=true);if(lab&&!lab.textContent.startsWith('🔒'))lab.textContent='🔒 '+lab.textContent}})}}
function openItem(kind,id,label){const p=itemLL(kind,id);if(!p)return;applyTabs([...new Set([...curTabs(),'carte'])]);const ll={lat:p[0],lng:p[1]};try{map.panTo(p)}catch(e){}
  const w=$('#mapwrap');if(w)w.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>itemPopup(ll,kind,id,label.replace(/^🔒 /,'')),250)}
$('#itemsList').addEventListener('click',e=>{const s=e.target.closest('.itlink');if(s)openItem(s.dataset.k,s.dataset.i,s.textContent)});
$('#itemsList').addEventListener('keydown',e=>{const s=e.target.closest('.itlink');if(s&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openItem(s.dataset.k,s.dataset.i,s.textContent)}});
/* couches : menu discret à gauche de la carte */
{const dd=document.querySelector('details.layersd'),w=$('#mapwrap');if(dd&&w){dd.open=false;dd.classList.add('layfloat');w.appendChild(dd);const sm=dd.querySelector('summary');if(sm){sm.innerHTML='<span aria-hidden="true">🗺️</span><span class="lt"> Couches</span>';sm.title='Fond de carte et couches'}
  ['click','dblclick','mousedown','touchstart','pointerdown','wheel'].forEach(ev=>dd.addEventListener(ev,e=>e.stopPropagation(),{passive:ev!=='click'}));
  document.addEventListener('click',e=>{if(dd.open&&!dd.contains(e.target))dd.open=false});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dd.open){dd.open=false;sm&&sm.focus()}})}}
{const _ser18=serialize;serialize=function(){const d=_ser18();d.set.phase=S.phase;return d}}
{const _rs18=restoreSettings;restoreSettings=function(t){_rs18(t);S.phase=t&&t.phase||((S.bed||S.ponds.length||S.hedges.length)?'create':'exist')}}
{const _rp18=resetProject;resetProject=function(){_rp18();S.phase='exist'}}
{const _rst18=restoreState;restoreState=function(d){_rst18(d);applyPhase()}}
setTimeout(applyPhase,0);
window.__p18={setPhase,curPhase,openItem,locked};

/* ================= v19 : réglages dans la liste, copier-coller, massif arbustif, ombres masquables, propositions d’implantation ================= */
/* --- massif arbustif existant (forme) --- */
SHNAT.arbu='Massif arbustif existant';
{const i=TOOLS.findIndex(t=>t[0]==='obsLine');TOOLS.splice(i+1,0,['obsShrub','Massif arbustif existant (forme)','area'])}
SHAPE_MODES.obsShrub=3;TC.obsShrub='#7cb342';SHORT.obsShrub='Massif arbustif';HINT.obsShrub='Massif arbustif existant : cliquez son contour, puis « Terminer ». Hauteur réglable dans « Éléments sur la carte ».';DRAWTXT.obsShrub='Cliquez le contour du massif arbustif existant';EXIST_TOOLS.splice(EXIST_TOOLS.indexOf('path'),0,'obsShrub');
LEGK.obsShrub=()=>S.shapes.some(s=>s.nat==='arbu');LEGK.obsPoly=()=>S.shapes.some(s=>s.kind==='obsPoly'&&s.nat!=='arbu');
{const _fs19=finishShape;finishShape=function(){if(S.mode!=='obsShrub')return _fs19();if(S.drawPts.length<3){$('#maphint').textContent='Il faut au moins 3 points.';return}pushUndo();
  const id=++itemId,pts=S.drawPts.slice();S.shapes.push({id,kind:'obsPoly',pts,name:'Massif arbustif '+(S.shapes.filter(x=>x.nat==='arbu').length+1),h:2,nat:'arbu'});initGeom(id);setMode('site');itemsChanged(true);renderObs();sunUpdate();toast('Massif arbustif existant ajouté : réglez sa hauteur dans « Éléments sur la carte ».')}}
{const _hk19=hook;hook=function(l,kind,id,label){const r=_hk19(l,kind,id,label);try{if(kind==='shapes'){const s=S.shapes.find(x=>x.id==id);if(s&&s.nat==='arbu'&&l.setStyle)l.setStyle({color:'#558b2f',fillColor:'#7cb342'})}}catch(e){}return r}}
rebuildToolLists();

/* --- ombres portées : afficher / masquer --- */
let SHADE_ON=true;try{SHADE_ON=localStorage.getItem('plantania:shadows')!=='0'}catch(e){}
function applyShade(){try{if(SHADE_ON){if(map.hasLayer&&!map.hasLayer(shadowLayer))shadowLayer.addTo(map)}else if(map.removeLayer)map.removeLayer(shadowLayer)}catch(e){}
  const b=$('#shadeFab');if(b){b.setAttribute('aria-pressed',String(SHADE_ON));b.title=SHADE_ON?'Masquer les ombres portées':'Afficher les ombres portées';b.classList.toggle('off',!SHADE_ON)}const c=$('#shadeChk');if(c)c.checked=SHADE_ON;updateLegend()}
function toggleShade(v){SHADE_ON=v==null?!SHADE_ON:!!v;try{localStorage.setItem('plantania:shadows',SHADE_ON?'1':'0')}catch(e){}applyShade()}
$('#shadeFab').addEventListener('click',e=>{e.stopPropagation();toggleShade()});['dblclick','mousedown','touchstart','pointerdown'].forEach(ev=>$('#shadeFab').addEventListener(ev,e=>e.stopPropagation()));
{const lay=$('#layers');if(lay){lay.insertAdjacentHTML('beforeend','<label class="chk"><input type="checkbox" id="shadeChk" checked> Ombres portées</label>');$('#shadeChk').addEventListener('change',e=>toggleShade(e.target.checked))}}
{const _ul19=updateLegend;updateLegend=function(){_ul19();if(!SHADE_ON){const el=$('#maplegend');if(el)[...el.querySelectorAll('span')].filter(s=>/Ombre portée/.test(s.textContent)&&s.parentElement===el).forEach(s=>s.remove())}}}

/* --- réglages dans « Éléments sur la carte » (plus de fenêtres sur le plan) --- */
let SEL19=null,CLIP19=null;S.mouse19=null;
const itemOf=(kind,id)=>kind==='bed'?S.bed:(S[kind]||[]).find(x=>x.id==id);
function openEditor(kind,id){SEL19={kind,id:String(id)};const pn=$('#itemsPanel');if(pn)pn.open=true;renderItemsList();setTimeout(()=>{const ed=$('#itemsList .ited');if(ed){ed.scrollIntoView({block:'nearest',behavior:'smooth'});ed.tabIndex=-1;try{ed.focus({preventScroll:true})}catch(e){}}},40)}
itemPopup=function(ll,kind,id){openEditor(kind,id)};
function geoXf(kind,it,fn){if(kind==='bed'){S.bed.raw=fn(S.bed.raw);bedRegeom();drawBed();renderCompo();if(S.editing)drawHandles();return}const raw=it.raw||it.pts;const nr=fn(raw);if(it.raw){it.raw=nr;regeom(it,closedOf(kind,it))}else it.pts=nr;if(kind==='taluses')estimateTalus(it);itemsChanged(kind==='shapes');if(kind==='shapes'){S.samples=null;sunUpdate()}if(kind==='fences')renderFences();if(S.editing)drawHandles()}
function obsRestyle(o){const d=OBT[o.type];try{o.circle.setRadius(o.w/2);o.circle.setStyle({color:d.c});o.marker.setIcon(L.divIcon({className:'',html:`<span class="obpin" style="background:${d.c}"></span>`,iconSize:[16,16],iconAnchor:[8,8]}))}catch(e){}}
function editorHtml(kind,it){if(!it)return'';if(locked(kind,it))return `<div class="ited"><p class="small">🔒 Élément existant, verrouillé pendant la création de l’aménagement. Il reste pris en compte pour l’ombre et les distances.</p><div class="chips"><button type="button" data-ed="back">Revenir à l’existant pour le modifier</button></div></div>`;
  let f='';const n=(k,v,min,max,st,lab)=>`<label>${lab}<input type="number" data-ef="${k}" value="${v}" min="${min}" max="${max}" step="${st}"></label>`;
  if(kind==='obs')f=`<label>Nom<input data-ef="name" value="${esc(it.name||'')}" placeholder="${esc(OBT[it.type].l)}" maxlength="40"></label><label>Type<select data-ef="type">${Object.entries(OBT).map(([k,v])=>`<option value="${k}"${k===it.type?' selected':''}>${esc(v.l)}</option>`).join('')}</select></label>${n('h',it.h,0.3,60,0.1,'Hauteur (m)')}${n('w',it.w,0.3,60,0.1,'Envergure (m)')}`;
  else if(kind==='shapes')f=`<label>Nom<input data-ef="name" value="${esc(it.name||'')}" maxlength="40"></label><label>Nature<select data-ef="nat">${Object.entries(SHNAT).map(([k,v])=>`<option value="${k}"${k===it.nat?' selected':''}>${esc(v)}</option>`).join('')}</select></label>${n('h',it.h,0.3,150,0.1,'Hauteur (m)')}`;
  else if(kind!=='fruits')f=`<label>Nom<input data-ef="label" value="${esc(it.label||'')}" placeholder="Nom libre" maxlength="40"></label>`;
  const geo=kind!=='obs'&&kind!=='fruits',P=kind==='bed'?it.ll:it.pts;
  if(geo)f+=`${n('scl',100,10,500,5,'Agrandir ou réduire (%)')}${n('rot',0,-180,180,5,'Tourner (°)')}`;
  const dim=geo&&P?(P.length>2&&kind!=='hedges'&&kind!=='vines'&&kind!=='fences'&&!(kind==='shapes'&&it.kind==='obsLine')?`Surface ${nf(areaLL(P))} m² · périmètre ${nf(lenLL([...P,P[0]]),1)} m`:`Longueur ${nf(lenLL(P),1)} m`):'';
  const T=KTAB[kind];return `<div class="ited"><div class="frow">${f}</div>${dim?`<p class="small">${dim}</p>`:''}<div class="chips">${['obs','shapes'].includes(kind)?'<button type="button" data-ed="dup" title="Ctrl+C puis Ctrl+V fonctionne aussi">Dupliquer</button>':''}${geo?'<button type="button" data-ed="shape">Modifier la forme</button>':''}${T?`<button type="button" data-ed="tab">${esc(T[1])}</button>`:''}<button type="button" data-ed="close">Fermer</button></div></div>`}
{const _ril19=renderItemsList;renderItemsList=function(){_ril19();const el=$('#itemsList');if(!el)return;
  el.querySelectorAll('li').forEach(li=>{const lab=li.querySelector('.itlink');if(!lab)return;const it=itemOf(lab.dataset.k,lab.dataset.i);if(it&&it.label&&!['obs','shapes'].includes(lab.dataset.k))lab.textContent=(lab.textContent.startsWith('🔒 ')?'🔒 ':'')+it.label+' · '+lab.textContent.replace(/^🔒 /,'');
    const sel=SEL19&&SEL19.kind===lab.dataset.k&&SEL19.id===String(lab.dataset.i);li.classList.toggle('isel',!!sel);lab.setAttribute('aria-expanded',String(!!sel));if(sel)li.insertAdjacentHTML('afterend',`<li class="itedli" data-ek="${lab.dataset.k}" data-ei="${lab.dataset.i}">${editorHtml(lab.dataset.k,it)}</li>`)})}}
openItem=function(kind,id){if(SEL19&&SEL19.kind===kind&&SEL19.id===String(id)){SEL19=null;renderItemsList();return}openEditor(kind,id);const p=itemLL(kind,id);try{if(p)map.panTo(p)}catch(e){}};
function edTarget(e){const li=e.target.closest('.itedli');if(!li)return null;const kind=li.dataset.ek,id=li.dataset.ei;return{kind,id,it:itemOf(kind,id)}}
$('#itemsList').addEventListener('change',e=>{const T=edTarget(e);if(!T||!T.it)return;const k=e.target.dataset.ef;if(!k)return;const {kind,it}=T,v=e.target.value;pushUndo();
  if(k==='name'){it.name=v.trim().slice(0,40);if(kind==='shapes')itemsChanged(true);renderObs();renderItemsList();saveNow(true);return}
  if(k==='label'){it.label=v.trim().slice(0,40);renderItemsList();saveNow(true);return}
  if(kind==='obs'){if(k==='type'){it.type=v;const d=OBT[v];if(!it.name){it.h=d.h;it.w=d.w}}else{const x=parseFloat(v);if(!(x>0))return;it[k]=x}obsRestyle(it);S.samples=null;renderObs();sunUpdate();renderItemsList();saveNow(true);return}
  if(kind==='shapes'&&(k==='h'||k==='nat')){if(k==='h'){const x=parseFloat(v);if(!(x>0))return;it.h=x}else it.nat=v;S.samples=null;itemsChanged(true);renderObs();sunUpdate();renderItemsList();saveNow(true);return}
  if(k==='scl'){const f=parseFloat(v)/100;if(f>0&&f!==1){const P=kind==='bed'?S.bed.raw:(it.raw||it.pts);geoXf(kind,it,r=>sclPts(r,cen(P),f))}}
  if(k==='rot'){const a=parseFloat(v);if(a){const P=kind==='bed'?S.bed.raw:(it.raw||it.pts);geoXf(kind,it,r=>rotPts(r,cen(P),-a))}}
  renderItemsList();saveNow(true)});
$('#itemsList').addEventListener('click',e=>{const b=e.target.closest('[data-ed]');if(!b)return;const T=edTarget(e);if(!T)return;const a=b.dataset.ed;
  if(a==='close'){SEL19=null;renderItemsList()}else if(a==='back')setPhase('exist');else if(a==='shape'){setEditing(true);toast('Déplacez les points sur la carte, ✥ pour déplacer, ⟳ pour tourner ; « Terminer la modification » pour finir.');const w=$('#mapwrap');if(w)w.scrollIntoView({block:'center',behavior:'smooth'})}
  else if(a==='tab'){const K=KTAB[T.kind];applyTabs([...new Set([...curTabs(),K[0]])]);showTab(K[0],true)}else if(a==='dup')dupItem(T.kind,T.it,null)});
/* --- copier-coller des obstacles --- */
function dupItem(kind,src,at){if(locked(kind,src)){toast('Revenez à « 1. L’existant » pour copier un élément existant.');return}
  if(kind==='obs'){const p=at||shiftLL([[src.lat,src.lng]],Math.max(2,src.w),0)[0],sel=$('#obsType'),old=sel.value;sel.value=src.type;addObstacle(p[0],p[1]);sel.value=old;const o=S.obs[S.obs.length-1];o.type=src.type;o.h=src.h;o.w=src.w;o.form=src.form;o.name=src.name?src.name.replace(/( \(copie( \d+)?\))?$/,'')+' (copie)':'';obsRestyle(o);S.samples=null;renderObs();sunUpdate();SEL19={kind:'obs',id:String(o.id)};renderItemsList();saveNow(true);toast(`Copie ajoutée${at?' à l’endroit de la souris':' à côté'}.`);return}
  if(kind==='shapes'){const c=cen(src.pts),mp=mPer(c[0]),dx=at?(at[1]-c[1])*mp:3,dy=at?(at[0]-c[0])*111320:-3,pts=shiftLL(src.pts,dx,dy);pushUndo();const id=++itemId;
    S.shapes.push({...JSON.parse(JSON.stringify({kind:src.kind,h:src.h,nat:src.nat,name:src.name})),id,pts,raw:shiftLL(src.raw||src.pts,dx,dy),smooth:!!src.smooth,name:(src.name||'Forme')+' (copie)'});S.samples=null;itemsChanged(true);renderObs();sunUpdate();SEL19={kind:'shapes',id:String(id)};renderItemsList();saveNow(true);toast('Copie ajoutée.')}}
if(map.on)map.on('mousemove mouseout',e=>{S.mouse19=e.type==='mouseout'||!e.latlng?null:[e.latlng.lat,e.latlng.lng]});
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey)return;const k=e.key.toLowerCase();if(k!=='c'&&k!=='v')return;const t=e.target,inEd=t&&t.closest&&t.closest('.ited');if(t&&(t.isContentEditable||t.tagName==='TEXTAREA'||/^(INPUT|SELECT)$/.test(t.tagName)&&!(inEd&&(t.tagName==='SELECT'||(t.type!=='text'&&t.type!=='search')||(k==='c'&&t.selectionStart===t.selectionEnd)))))return;if(k==='c'&&String(window.getSelection&&window.getSelection())!=='')return;
  if(k==='c'){if(!SEL19||!['obs','shapes'].includes(SEL19.kind)){return}const it=itemOf(SEL19.kind,SEL19.id);if(!it)return;CLIP19={kind:SEL19.kind,id:SEL19.id};e.preventDefault();toast(`Copié : ${it.name||(SEL19.kind==='obs'?OBT[it.type].l:'forme')}. Ctrl+V colle à l’endroit de la souris sur la carte.`)}
  else if(CLIP19){const src=itemOf(CLIP19.kind,CLIP19.id);if(!src){CLIP19=null;return}e.preventDefault();dupItem(CLIP19.kind,src,S.mouse19)}});

/* --- propositions d’implantation selon la place libre, le soleil et les obstacles --- */
let PROP19=null,PSEED=0;const propLayer=L.layerGroup().addTo(map);
function sunTable(){const y=new Date().getFullYear(),T=[];for(let m=4;m<=9;m++)for(let h=5;h<=21;h++){const sp=sunPos(new Date(y,m-1,15,h,0).getTime(),S.lat,S.lon);if(sp.alt>1)T.push({az:sp.az,alt:sp.alt,m})}return T}
function sunHoursAt(p,T,OBS){let n=0;const mp=mPer(p[0]);const rel=OBS.map(o=>{const dn=(o.lat-p[0])*111320,de=(o.lng-p[1])*mp,d=Math.max(Math.hypot(dn,de),0.5);return{d,brg:((Math.atan2(de,dn)*180/Math.PI)+360)%360,hw:d<=o.w/2?180:Math.atan(o.w/2/d)*180/Math.PI,ang:Math.atan(o.h/d)*180/Math.PI,cad:o.type==='caduc'}});
  for(const s of T){let bl=false;for(const r of rel){const diff=Math.abs(((s.az-r.brg+540)%360)-180);if(diff<=r.hw&&s.alt<r.ang){bl=true;break}}if(!bl)n++}return n/6}
function distEdge(q,P){const mp=mPer(q[0]),T=p=>[(p[1]-q[1])*mp,(p[0]-q[0])*111320];let d=1e9;for(let i=0;i<P.length;i++){const a=T(P[i]),b=T(P[(i+1)%P.length]),vx=b[0]-a[0],vy=b[1]-a[1],L2=vx*vx+vy*vy,t=L2?Math.max(0,Math.min(1,-(a[0]*vx+a[1]*vy)/L2)):0;d=Math.min(d,Math.hypot(a[0]+vx*t,a[1]+vy*t))}return d}
function propDomain(){if(S.plots&&S.plots.length)return S.plots.slice().sort((a,b)=>areaLL(b.pts)-areaLL(a.pts))[0].pts;if(S.parcel&&S.parcel.ring)return S.parcel.ring.map(([x,y])=>[y,x]);return null}
function proposeLayout(){const D=propDomain();if(!D){toast('Dessinez d’abord la limite de votre terrain dans « 1. L’existant » (ou attendez le cadastre).');return null}
  const c=cen(D),mp=mPer(c[0]),XY=p=>[(p[1]-c[1])*mp,(p[0]-c[0])*111320],DX=D.map(XY);let th=0,bl=0;DX.forEach((p,i)=>{const q=DX[(i+1)%DX.length],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(l>bl){bl=l;th=Math.atan2(q[1]-p[1],q[0]-p[0])}});
  const ct=Math.cos(th),st=Math.sin(th),toUV=([x,y])=>[x*ct+y*st,-x*st+y*ct],toXY=([u,v])=>[u*ct-v*st,u*st+v*ct],toLL=([x,y])=>[c[0]+y/111320,c[1]+x/mp];
  const UV=DX.map(toUV),u0=Math.min(...UV.map(p=>p[0])),u1=Math.max(...UV.map(p=>p[0])),v0=Math.min(...UV.map(p=>p[1])),v1=Math.max(...UV.map(p=>p[1])),Atot=areaLL(D),cs=Math.max(1,Math.round(Math.sqrt(Atot/1400)*2)/2),NU=Math.ceil((u1-u0)/cs),NV=Math.ceil((v1-v0)/cs);
  const cellLL=(i,j)=>toLL(toXY([u0+(i+.5)*cs,v0+(j+.5)*cs])),bld=S.shapes.filter(s=>s.kind==='obsPoly').map(s=>s.pts),walls=[...S.shapes.filter(s=>s.kind==='obsLine').map(s=>Object.assign(s.pts.slice(),{bw:(s.w||0.4)/2+0.6})),...(S.fences||[]).map(f=>Object.assign(f.pts.slice(),{bw:0.7})),...S.hedges.map(h=>Object.assign(h.pts.slice(),{bw:1.2}))];
  const proj=[...(S.bed&&S.bed.ll?[S.bed.ll]:[]),...S.ponds.map(x=>x.pts),...S.potagers.map(x=>x.pts),...S.orchards.map(x=>x.pts),...(S.zones||[]).map(x=>x.pts),...S.paths.map(x=>x.pts),...S.taluses.map(x=>x.pts)];
  const T=sunTable(),OBS=obsAll(),G=[];let free=0;
  for(let i=0;i<NU;i++){G.push([]);for(let j=0;j<NV;j++){const p=cellLL(i,j);let ok=inPolyLL(p,D)&&distEdge(p,D)>=0.5;
      if(ok&&bld.some(b=>distPtPoly(p,b)<1.2))ok=false;if(ok&&walls.some(w=>w.some((q,k)=>k<w.length-1&&distPtPoly(p,[q,w[k+1],q])<w.bw)))ok=false;
      if(ok&&S.obs.some(o=>llDist(p,[o.lat,o.lng])<o.w/2+0.3))ok=false;if(ok&&proj.some(P=>P.length>2&&distPtPoly(p,P)<0.8))ok=false;if(ok&&S.hedges.some(h=>h.pts.some((q,k)=>k<h.pts.length-1&&distPtPoly(p,[q,h.pts[k+1],q])<1.2)))ok=false;
      G[i].push({ok,p,sun:ok?sunHoursAt(p,T,OBS):0});if(ok)free++}}
  const Afree=free*cs*cs,house=bld.length?bld.slice().sort((a,b)=>areaLL(b)-areaLL(a))[0]:null,hc=house?cen(house):null;
  const used=G.map(r=>r.map(()=>false));
  function fits(i,j,a,b){if(i<0||j<0||i+a>NU||j+b>NV)return false;for(let x=i;x<i+a;x++)for(let y=j;y<j+b;y++){if(!G[x][y].ok||used[x][y])return false}return true}
  function meanSun(i,j,a,b){let s=0;for(let x=i;x<i+a;x++)for(let y=j;y<j+b;y++)s+=G[x][y].sun;return s/(a*b)}
  function rectLL(i,j,a,b){return[[i,j],[i+a,j],[i+a,j+b],[i,j+b]].map(([x,y])=>toLL(toXY([u0+x*cs,v0+y*cs])))}
  function ellLL(i,j,a,b,n){const cu=u0+(i+a/2)*cs,cv=v0+(j+b/2)*cs,ru=a*cs/2*0.92,rv=b*cs/2*0.92;return Array.from({length:n||14},(_,k)=>{const t=k/(n||14)*2*Math.PI,w=1+0.08*Math.sin(3*t);return toLL(toXY([cu+Math.cos(t)*ru*w,cv+Math.sin(t)*rv*w]))})}
  function mark(i,j,a,b,m){const mm=Math.ceil((m||1)/cs);for(let x=Math.max(0,i-mm);x<Math.min(NU,i+a+mm);x++)for(let y=Math.max(0,j-mm);y<Math.min(NV,j+b+mm);y++)used[x][y]=true}
  const nearEdge=(i,j,a,b)=>{const P=rectLL(i,j,a,b);return Math.min(...P.map(q=>distEdge(q,D)),...bld.map(B=>Math.min(...P.map(q=>distPtPoly(q,B)))))};
  function best(dims,score){const cand=[];dims.forEach(([a,b])=>{for(let i=0;i<=NU-a;i++)for(let j=0;j<=NV-b;j++){if(!fits(i,j,a,b))continue;const s=score(i,j,a,b);if(s!=null&&isFinite(s))cand.push({i,j,a,b,s})}});
    cand.sort((x,y)=>y.s-x.s);const picks=[];for(const k of cand){if(picks.every(p=>Math.abs(p.i-k.i)>=Math.max(p.a,k.a)||Math.abs(p.j-k.j)>=Math.max(p.b,k.b)))picks.push(k);if(picks.length>=4)break}return picks.length?picks[PSEED%picks.length]:null}
  const cells=m=>Math.max(1,Math.round(m/cs)),out=[],dH=(i,j,a,b)=>hc?llDist(cen(rectLL(i,j,a,b)),hc):0,ctr=(i,j,a,b)=>cen(rectLL(i,j,a,b));
  if(Afree<8){toast('Il reste très peu de place libre : dégagez de l’espace ou agrandissez la limite du terrain.');return{props:[],Afree,cs}}
  // potager : le plus de soleil, pas trop loin de la maison
  if(!S.potagers.length&&Afree>=20){const T_=Math.min(30,Math.max(6,Afree*0.08)),b=cells(Math.sqrt(T_/1.5)),a=cells(Math.sqrt(T_/1.5)*1.5);const r=best([[a,b],[b,a]],(i,j,A,B)=>{const s=meanSun(i,j,A,B);if(s<5)return null;return s*10-(hc?Math.max(0,dH(i,j,A,B)-12):0)});
    if(r){mark(r.i,r.j,r.a,r.b,1.5);const sh=meanSun(r.i,r.j,r.a,r.b);out.push({k:'potager',w:'potager',lab:'Potager',pts:rectLL(r.i,r.j,r.a,r.b),why:`${nf(sh,1)} h de soleil direct par jour en saison${hc?`, à ${nf(dH(r.i,r.j,r.a,r.b))} m de la maison`:''}`})}}
  // micro-forêt : au nord, loin de la maison, contre la limite
  if(!S.zones.some(z=>z.kind==='foret')&&Afree>=150){const T_=Math.min(150,Math.max(30,Afree*0.15)),b=cells(Math.sqrt(T_/1.3)),a=cells(Math.sqrt(T_/1.3)*1.3);const r=best([[a,b],[b,a]],(i,j,A,B)=>{const q=ctr(i,j,A,B);return (q[0]-c[0])*111320*0.8+(hc?Math.min(30,dH(i,j,A,B)):0)-nearEdge(i,j,A,B)*3});
    if(r){mark(r.i,r.j,r.a,r.b,2);out.push({k:'z_foret',w:'foret',lab:'Micro-forêt',pts:rectLL(r.i,r.j,r.a,r.b),why:`${nf(r.a*r.b*cs*cs)} m² au nord du terrain : elle n’ombrage pas le reste du jardin`})}}
  // mare : mi-soleil, loin des arbres, visible de la maison
  if(!S.ponds.length&&Afree>=25){const T_=Math.min(20,Math.max(4,Afree*0.04)),b=cells(Math.sqrt(T_/1.6)),a=cells(Math.sqrt(T_/1.6)*1.6);const trees=S.obs.filter(o=>o.type==='caduc'||o.type==='pers');
    const r=best([[a,b],[b,a]],(i,j,A,B)=>{const q=ctr(i,j,A,B);if(trees.some(o=>llDist(q,[o.lat,o.lng])<o.w/2+3+Math.max(A,B)*cs/2))return null;const s=meanSun(i,j,A,B);if(s<3)return null;return -Math.abs(s-6)*5+(hc&&dH(i,j,A,B)<25?6:0)});
    if(r){mark(r.i,r.j,r.a,r.b,1.5);out.push({k:'pond',w:'mare',lab:'Mare',pts:ellLL(r.i,r.j,r.a,r.b,16),why:`${nf(meanSun(r.i,r.j,r.a,r.b),1)} h de soleil (idéal : 5 à 6 h), loin des arbres qui perdent leurs feuilles`})}}
  // massif : le long d’une limite ou d’un mur, visible
  if(!S.bed){const Lm=Math.min(12,Math.max(4,Afree*0.1/2.5)),a=cells(Lm),b=cells(2.5);const r=best([[a,b],[b,a]],(i,j,A,B)=>{const e=nearEdge(i,j,A,B);return (e<=1.3?20:-e*2)+meanSun(i,j,A,B)*2-(hc?dH(i,j,A,B)/4:0)});
    if(r){mark(r.i,r.j,r.a,r.b,1);out.push({k:'bed',w:'massif',lab:'Massif',pts:rectLL(r.i,r.j,r.a,r.b),why:`${nf(r.a*r.b*cs*cs)} m² le long d’une limite, ${nf(meanSun(r.i,r.j,r.a,r.b),1)} h de soleil : l’ambiance s’adapte à l’exposition`})}}
  // jardin de pluie : près de la maison (3 à 8 m) pour l’eau du toit
  if(house&&!S.zones.some(z=>z.kind==='pluie')&&Afree>=40){const T_=Math.min(15,Math.max(3,areaLL(house)*0.15)),b=cells(Math.sqrt(T_/1.5)),a=cells(Math.sqrt(T_/1.5)*1.5);const r=best([[a,b],[b,a]],(i,j,A,B)=>{const P=rectLL(i,j,A,B),d=Math.min(...P.map(q=>distPtPoly(q,house)));if(d<3)return null;return -Math.abs(d-4)*3});
    if(r){mark(r.i,r.j,r.a,r.b,1);out.push({k:'z_pluie',w:'pluie',lab:'Jardin de pluie',pts:ellLL(r.i,r.j,r.a,r.b,14),why:`à environ ${nf(Math.min(...rectLL(r.i,r.j,r.a,r.b).map(q=>distPtPoly(q,house))))} m de la maison : il recueille l’eau du toit sans risque pour les fondations`})}}
  // haie : le long de la plus longue limite libre
  if(!S.hedges.length&&Atot>=120){let bestE=null;D.forEach((p,i)=>{const q=D[(i+1)%D.length],L_=llDist(p,q);if(L_<6)return;let okc=0,n=0;for(let t=0.05;t<1;t+=0.1){const s=[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t],ip=shiftLL([s],0,0)[0];n++;const inn=[s[0]+((c[0]-s[0])>0?1:-1)*1/111320,s[1]];if(!bld.some(B=>distPtPoly(s,B)<2)&&!S.obs.some(o=>llDist(s,[o.lat,o.lng])<o.w/2)&&!walls.some(w=>w.some((q,k)=>k<w.length-1&&distPtPoly(s,[q,w[k+1],q])<w.bw+1.5)))okc++}const sc=L_*okc/n;if(!bestE||sc>bestE.s)bestE={s:sc,p,q,L_}});
    if(bestE&&bestE.s>6){const inset=0.6,dx=(c[1]-(bestE.p[1]+bestE.q[1])/2)*mp,dy=(c[0]-(bestE.p[0]+bestE.q[0])/2)*111320,dl=Math.hypot(dx,dy)||1,P=shiftLL([bestE.p,bestE.q],dx/dl*inset,dy/dl*inset);out.push({k:'hedge',w:'haie',lab:'Haie champêtre',pts:P,why:`${nf(bestE.L_)} m le long de la limite : intimité, abri pour les oiseaux (à 0,6 m de la limite pour une haie de moins de 2 m)`})}}
  return{props:out,Afree,cs}}
function drawProps(){if(propLayer.clearLayers)propLayer.clearLayers();if(!PROP19||!L.polygon)return;PROP19.props.forEach((p,i)=>{if(p.off)return;const st={color:'#e65100',weight:2,dashArray:'6 5',fillColor:'#ffb74d',fillOpacity:.25,interactive:false};const l=(p.k==='hedge'&&L.polyline?L.polyline(p.pts,{...st,weight:5}):L.polygon(p.pts,st)).addTo(propLayer);if(l.bindTooltip)l.bindTooltip(`${i+1}. ${p.lab}`,{permanent:true,direction:'center',className:'maplbl'})})}
function renderProps(){const box=$('#propBox');if(!box)return;if(!PROP19){box.hidden=true;box.innerHTML='';return}box.hidden=false;const P=PROP19.props;
  box.innerHTML=`<h4>Propositions selon la place disponible (${nf(PROP19.Afree)} m² libres)</h4>${P.length?`<ul class="props">${P.map((p,i)=>`<li><label class="chk"><input type="checkbox" data-pi="${i}"${p.off?'':' checked'}> <b>${i+1}. ${esc(p.lab)}</b></label> <span class="small">${esc(p.why)}</span></li>`).join('')}</ul>`:'<p class="small">Aucune proposition : la place libre est déjà occupée, ou les éléments sont déjà dessinés.</p>'}
   <div class="chips">${P.length?'<button type="button" class="pri" data-pa="add">Ajouter la sélection</button><button type="button" data-pa="other">Autre proposition</button>':''}<button type="button" data-pa="clear">Fermer</button></div><p class="note">Calcul à partir de la limite du terrain, des bâtiments, arbres et chemins existants, et des heures de soleil d’avril à septembre. Vous pourrez tout modifier ensuite.</p>`}
function runProps(){if(curPhase()!=='create')setPhase('create');PROP19=proposeLayout();drawProps();renderProps();if(PROP19&&PROP19.props.length)toast(`${PROP19.props.length} proposition(s) en orange sur la carte.`)}
$('#propGo').addEventListener('click',runProps);
$('#propBox').addEventListener('change',e=>{const i=e.target.dataset.pi;if(i==null||!PROP19)return;PROP19.props[+i].off=!e.target.checked;drawProps()});
$('#propBox').addEventListener('click',e=>{const b=e.target.closest('[data-pa]');if(!b)return;const a=b.dataset.pa;
  if(a==='clear'){PROP19=null;drawProps();renderProps();return}if(a==='other'){PSEED++;runProps();return}
  if(a==='add'&&PROP19){const sel=PROP19.props.filter(p=>!p.off);let n=0;const curve=S.curve;sel.forEach(p=>{setWant(p.w,true);S.curve=['bed','pond','z_pluie'].includes(p.k);setMode(p.k);S.drawPts=p.pts.map(q=>q.slice());try{finishShape();n++}catch(err){console.warn(err)}});S.curve=curve;setMode('site');renderWants();renderMapTools();PROP19=null;drawProps();renderProps();itemsChanged(false);saveNow(true);toast(`${n} aménagement(s) ajouté(s). Cliquez-les dans « Éléments sur la carte » pour les ajuster.`)}});
{const _ap19=applyPhase;applyPhase=function(){_ap19();const g=$('#propGo');if(g)g.hidden=curPhase()!=='create';if(curPhase()!=='create'&&PROP19){PROP19=null;drawProps();renderProps()}}}
applyShade();rebuildToolLists();renderMapTools();
window.__p19={proposeLayout,openEditor,dupItem,toggleShade,sunHoursAt};

/* ================= v20 : questions de « Mes envies » qui dépendent du point 1 ================= */
{const t=ENVQ[0].o.find(o=>o[0]==='talus');if(t)t[1]='Planter un talus'}
const FRX={pomme:/^Pommier/i,poire:/^Poirier/i,cerise:/^Cerisier/i,prune:/^Prunier|^Mirabellier|^Reine-claude/i,petits:/Framboisier|Groseillier|Cassissier|Cassis|Myrtillier|Mûrier/i};
const ENVF=[
 {w:['pelouse'],k:'f_lawn',q:'Quel type de pelouse ou de prairie ?',o:()=>[['auto','Je ne sais pas : conseillez-moi'],...LAWNS.map(t=>[t.k,t.n])],apply:v=>{S.lawnType=v&&v!=='auto'?v:null;try{renderLawn()}catch(e){}}},
 {w:['pelouse'],k:'f_luse',q:'À quoi servira-t-elle surtout ?',o:()=>Object.entries(LUSE),apply:v=>{if(v)S.lawnUse=v;try{renderLawn()}catch(e){}}},
 {w:['potager'],k:'f_veg',q:'Quel genre de potager ?',o:()=>Object.entries(VMODE),apply:v=>{if(v){S.veg.mode=v;try{renderVeg()}catch(e){}}}},
 {w:['fruit','verger'],k:'f_fruits',m:1,q:'Quels fruits aimeriez-vous ?',o:()=>[['pomme','Pommes'],['poire','Poires'],['cerise','Cerises'],['prune','Prunes'],['petits','Petits fruits (framboises, groseilles…)']]},
 {w:['haie'],k:'f_hedge',q:'Quel type de haie ?',o:()=>Object.entries(HEDGE_T).map(([k,v])=>[k,v.l]),apply:v=>{if(v){S.hedges.forEach(h=>h.type=v);itemsChanged(false)}}},
 {w:['mare'],k:'f_pond',q:'Quelle mare ?',o:()=>[['nat','Naturelle, pour la biodiversité'],['jap','Japonaise, zen'],['auto','Assortie au reste du jardin']],apply:v=>{if(v){S.ponds.forEach(p=>p.pstyle=v);try{renderPonds()}catch(e){}}}},
 {w:['cloture'],k:'f_fence',q:'Quel type de clôture ?',o:()=>['rigide','bois','souple','ganivelle','composite','beton'].filter(k=>FM[k]).map(k=>[k,FM[k].l]),apply:v=>{if(v){S.fences.forEach(f=>f.model=v);try{renderFences()}catch(e){}}}},
 {w:['talus'],k:'f_talus',q:'Que planter sur le talus ?',o:()=>[['couvre','Couvre-sols persistants, peu d’entretien'],['fleuri','Vivaces fleuries et graminées'],['arbustes','Arbustes bas'],['prairie','Prairie fleurie']]},
 {w:['jardinieres'],k:'f_box',m:1,q:'Où voulez-vous fleurir ?',o:()=>[['fenetre','Appuis de fenêtre'],['balcon','Balcon ou garde-corps'],['terrasse','Grands bacs sur la terrasse']]},
 {w:['pluie','noue'],k:'f_roof',q:'Quelle surface de toit voulez-vous raccorder ?',o:()=>[['20','Un abri ou une annexe (environ 20 m²)'],['60','Une partie de la maison (environ 60 m²)'],['120','Toute la maison (environ 120 m²)']],apply:v=>{if(v){S.zones.filter(z=>z.kind==='pluie'||z.kind==='noue').forEach(z=>{z.opts=z.opts||{};z.opts.drain=+v});try{renderZones()}catch(e){}}}}];
const PLANTW=['massif','potager','pelouse','haie','fruit','verger','jardinieres','talus','mare','foret','pluie','noue','fraicheur'];
const ENVCOND={amb:()=>['massif','jardinieres'].some(w=>S.want.has(w)),care:()=>PLANTW.some(w=>S.want.has(w)),who:()=>S.want.size>0,water:()=>['massif','potager','pelouse','haie','jardinieres','fruit','verger','talus','fraicheur'].some(w=>S.want.has(w)),diy:()=>S.want.size>0,budget:()=>S.want.size>0};
function envVisible(){const L_=[ENVQ[0]];ENVF.forEach(f=>{if(f.w.some(w=>S.want.has(w)))L_.push({...f,o:f.o(),fu:1})});ENVQ.slice(1).forEach(Q=>{if(!ENVCOND[Q.k]||ENVCOND[Q.k]())L_.push(Q)});return L_}
renderEnvies=function(){const box=$('#enviesBox');if(!box)return;const E=S.env,V=envVisible();
  box.innerHTML=V.map((Q,i)=>{const cur=E[Q.k];return `<div class="card envq${Q.fu?' envfu':''}"><h4><span class="qn">${i+1}</span>${esc(Q.q)}${Q.m?' <small>(plusieurs choix possibles)</small>':''}</h4><div class="envo">${Q.o.map(([k,l])=>{const on=Q.k==='want'?S.want.has(k):Q.m?(Array.isArray(cur)&&cur.includes(k)):cur===k;return `<button type="button" class="envb" data-eq="${Q.k}" data-ev="${k}" aria-pressed="${on}">${esc(l)}</button>`}).join('')}</div></div>`}).join('')+(S.want.size?'':'<p class="small envwait">Choisissez au moins une envie : les questions suivantes s’adaptent à votre choix.</p>')+envSummary();
  const t=$('#envTxt');if(t&&!t.value&&E.text)t.value=E.text};
$('#envies').addEventListener('click',e=>{const b=e.target.closest('[data-eq]');if(!b||!b.dataset.eq.startsWith('f_'))return;e.stopImmediatePropagation();const k=b.dataset.eq,v=b.dataset.ev,F=ENVF.find(f=>f.k===k),E=S.env;
  if(F.m){const a=Array.isArray(E[k])?E[k]:[];E[k]=a.includes(v)?a.filter(x=>x!==v):[...a,v]}else E[k]=E[k]===v?'':v;
  if(F.apply)F.apply(Array.isArray(E[k])?E[k]:E[k]);renderEnvies();saveNow(true)},true);
/* les choix s’appliquent aussi à ce qu’on dessine ensuite */
{const _fs20=finishShape;finishShape=function(){const m=S.mode,nh=S.hedges.length,nf_=S.fences.length,nz=S.zones.length;_fs20();const E=S.env;
  if(m==='hedge'&&E.f_hedge&&S.hedges.length>nh){S.hedges[S.hedges.length-1].type=E.f_hedge;itemsChanged(false)}
  if(m==='fence'&&E.f_fence&&S.fences.length>nf_){S.fences[S.fences.length-1].model=E.f_fence;try{renderFences()}catch(e){}}
  if(m==='pond'&&E.f_pond){S.ponds.forEach(p=>{if(!p.pstyle)p.pstyle=E.f_pond})}
  if((m==='z_pluie'||m==='z_noue')&&E.f_roof&&S.zones.length>nz){const z=S.zones[S.zones.length-1];z.opts.drain=+E.f_roof;try{renderZones()}catch(e){}}}}
{const _af20=addFruit;addFruit=function(lat,lng){_af20(lat,lng);const L_=(Array.isArray(S.env.f_fruits)?S.env.f_fruits:[]).filter(k=>FRX[k]&&FRUITS.some(x=>FRX[k].test(x.n)));if(!L_.length)return;const f=S.fruits[S.fruits.length-1],want=L_[(S.fruits.length-1)%L_.length],i=FRUITS.findIndex(x=>FRX[want]&&FRX[want].test(x.n));if(i>=0){f.sp=i;itemsChanged(false)}}}
/* résumé, rapport et IA reprennent ces réponses */
function envFuRows(){const E=S.env;return ENVF.filter(f=>f.w.some(w=>S.want.has(w))&&E[f.k]&&(!Array.isArray(E[f.k])||E[f.k].length)).map(f=>{const o=f.o(),lab=v=>(o.find(x=>x[0]===v)||[])[1]||v;return[f.q.replace(/ \?$/,''),Array.isArray(E[f.k])?E[f.k].map(lab).join(', '):lab(E[f.k])]})}
{const _bd20=briefData;briefData=function(R){const B=_bd20(R);B.env=[...envFuRows(),...B.env];return B}}
{const _es20=envSummary;envSummary=function(){const h=_es20(),r=envFuRows();return r.length?h.replace('</h4>',`</h4><p class="small">${r.map(x=>`<b>${esc(x[0])} :</b> ${esc(x[1])}`).join(' · ')}</p>`):h}}
{const _ip20=ideaPrompt;ideaPrompt=function(){const r=envFuRows();return _ip20()+(r.length?`\nPrécisions : ${r.map(x=>x[0]+' = '+x[1]).join(' ; ')}.`:'')}}
renderEnvies();


/* ================= v21 : « Modifier la forme » ne rend modifiable que l’élément choisi ================= */
S.editOnly=null;
{const _dh21=drawHandles;drawHandles=function(){const O=S.editOnly;if(!O||!S.editing)return _dh21();const sv={},bed=S.bed;
  EDIT_K.forEach(([k])=>{sv[k]=S[k];S[k]=k===O.kind?(S[k]||[]).filter(x=>String(x.id)===String(O.id)):[]});if(O.kind!=='bed')S.bed=null;
  try{return _dh21()}finally{Object.keys(sv).forEach(k=>{S[k]=sv[k]});S.bed=bed}}}
{const _se21=setEditing;setEditing=function(on){if(!on)S.editOnly=null;_se21(on)}}
{const _oe21=openEditor;openEditor=function(kind,id){_oe21(kind,id);if(S.editing&&kind!=='obs'&&kind!=='fruits'){S.editOnly={kind,id:String(id)};drawHandles()}}}
$('#itemsList').addEventListener('click',e=>{const b=e.target.closest('[data-ed=shape]');if(!b)return;const li=b.closest('.itedli');if(!li)return;S.editOnly={kind:li.dataset.ek,id:String(li.dataset.ei)};if(S.editing)drawHandles()},true);


/* ================= v21 : « Tout effacer » efface vraiment tout ; option « Effacer mon aménagement » ================= */
function resetAfterClear(){S.zones=S.zones||[];if(typeof PROP19!=='undefined'){PROP19=null;drawProps();renderProps()}SEL19=null;S.editOnly=null;if(S.editing)setEditing(false);if(typeof drawHandles==='function')drawHandles();
  S.samples=null;drawItems();itemsChanged(true);try{renderCompo()}catch(e){}try{renderZones()}catch(e){}try{renderFences()}catch(e){}try{renderLawn()}catch(e){}try{renderPonds()}catch(e){}try{renderCoherence()}catch(e){}try{if(typeof renderBudget==='function')renderBudget()}catch(e){}updateLegend();renderItemsList()}
{const _cd21=clearDrawings;clearDrawings=function(){S.zones=[];if(S.editing)setEditing(false);_cd21();resetAfterClear()}}
function clearProject(){S.hedges=[];S.lawns=[];S.ponds=[];S.fruits=[];S.vines=[];S.taluses=[];S.potagers=[];S.orchards=[];S.fences=[];S.zones=[];S.paths=S.paths.filter(p=>p.nat!=='pasjap');
  S.bed=null;bedLayer.clearLayers();plantLayer.clearLayers();S.lastLayout=null;const cb=$('#clearBed');if(cb)cb.hidden=true;S.drawPts=[];drawTemp();resetAfterClear()}
function clearExisting(){S.obs.forEach(o=>{try{map.removeLayer(o.circle);map.removeLayer(o.marker)}catch(e){}});S.obs=[];S.shapes=[];S.plots=[];S.paths=S.paths.filter(p=>p.nat==='pasjap');S.samples=null;S.drawPts=[];drawTemp();renderObs();resetAfterClear()}
{const _ril21=renderItemsList;renderItemsList=function(){_ril21();const all=$('#delAll');if(!all)return;all.textContent=curPhase()==='create'?'Effacer mon aménagement (l’existant est gardé)':'Effacer l’existant (l’aménagement est gardé)'}}
$('#itemsList').addEventListener('click',e=>{if(e.target.id!=='delAll')return;e.stopImmediatePropagation();pushUndo();if(curPhase()==='create'){clearProject();toast('Aménagement effacé : l’existant est conservé.',{undo:true})}else{clearExisting();toast('Existant effacé : votre aménagement est conservé.',{undo:true})}sunUpdate()},true);


/* ================= v22 : point d’étude discret, verrouillable et masquable ================= */
let SITELOCK=false,SITEVIS=true;try{SITELOCK=localStorage.getItem('plantania:siteLock')==='1';SITEVIS=localStorage.getItem('plantania:siteVis')!=='0'}catch(e){}
const siteIcon2=L.divIcon({className:'',html:'<span class="pin2" title="Point d’étude"></span>',iconSize:[14,14],iconAnchor:[7,7]});
function applySite(){try{if(siteMarker){if(siteMarker.setIcon)siteMarker.setIcon(siteIcon2);if(siteMarker.dragging)SITELOCK?siteMarker.dragging.disable():siteMarker.dragging.enable();
    if(SITEVIS){if(map.hasLayer&&!map.hasLayer(siteMarker))siteMarker.addTo(map)}else if(map.removeLayer)map.removeLayer(siteMarker)}}catch(e){}
  const v=$('#siteVis'),l=$('#siteLock');if(v)v.checked=SITEVIS;if(l)l.checked=SITELOCK;try{localStorage.setItem('plantania:siteLock',SITELOCK?'1':'0');localStorage.setItem('plantania:siteVis',SITEVIS?'1':'0')}catch(e){}updateLegend()}
{const _ss22=setSite;setSite=function(a,b){const r=_ss22.apply(this,arguments);applySite();return r}}
{const lay=$('#layers');if(lay){lay.insertAdjacentHTML('afterbegin','<div class="sitectl"><b>Point d’étude</b><label class="chk"><input type="checkbox" id="siteVis" checked> Visible</label><label class="chk"><input type="checkbox" id="siteLock"> Verrouillé</label></div>');
  $('#siteVis').addEventListener('change',e=>{SITEVIS=e.target.checked;applySite()});$('#siteLock').addEventListener('change',e=>{SITELOCK=e.target.checked;applySite();toast(SITELOCK?'Point d’étude verrouillé : un clic sur la carte ne le déplace plus.':'Point d’étude déverrouillé : cliquez sur la carte ou faites-le glisser pour le déplacer.')})}}
{const _sc22=siteClick;siteClick=function(lat,lng){if(S.mode==='site'&&(SITELOCK||!SITEVIS)){$('#maphint').textContent=SITELOCK?'Point d’étude verrouillé : choisissez un outil pour dessiner, ou déverrouillez-le dans « Couches ».':'Point d’étude masqué : affichez-le dans « Couches » pour le déplacer.';return}return _sc22(lat,lng)}}
$('#mapTools').addEventListener('click',e=>{const b=e.target.closest('[data-mt=site]');if(b&&(SITELOCK||!SITEVIS)){SITELOCK=false;SITEVIS=true;applySite();toast('Point d’étude déverrouillé : cliquez sur la carte pour le placer.')}},true);
{const _ul22=updateLegend;updateLegend=function(){_ul22();const el=$('#maplegend');if(!el)return;[...el.children].forEach(c=>{if(/Placer le site/.test(c.textContent)){if(!SITEVIS)c.remove();else c.innerHTML='<span class="pin2 lg"></span>Point d’étude'}})}}
applySite();
