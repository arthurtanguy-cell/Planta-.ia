/* Plantañ.ia : terrasse, démolition, arbres, cultivars, professionnels (v23 et suivantes) */
/* ================= v23 : aménagement fonctionnel (terrasse, allées, piscine) ================= */
/* Prix 2026 en Belgique, HTVA, relevés en novembre 2026 (Trustup, Vakmanprijzen, Piscine.be, Tafsquare, Test-Achats) : indicatifs, modifiables. */
S.amen=S.amen||[];S.cside=S.cside||'veg';LISTS.push('amen');EDIT_K.push(['amen',1]);
const AK={terrasse:{l:'Terrasse',c:'#c0843d',w:'terrasse',t:'Terrasse (forme)',h:'Terrasse : cliquez les angles, puis « Terminer ». Matériau, fondation, évacuation de l’eau et budget se règlent dans l’onglet « Terrasse, allées, piscine ».'},
 allee:{l:'Allée',c:'#a1937a',w:'allee',t:'Allée ou cheminement (forme)',h:'Allée : cliquez le contour de l’allée (une forme allongée), puis « Terminer ».'},
 piscine:{l:'Piscine',c:'#1ea7d6',w:'piscine',t:'Piscine ou baignade naturelle (forme)',h:'Piscine : cliquez les angles du bassin, puis « Terminer ». Pour une baignade naturelle, dessinez toute la surface (zone de nage et zone plantée).'}};
const FONC=['a_terrasse','a_allee','a_piscine','fence'];
Object.entries(AK).forEach(([k,a])=>{const m='a_'+k;SHAPE_MODES[m]=3;TC[m]=a.c;HINT[m]=a.h;SHORT[m]=a.l;DRAWTXT[m]=k==='allee'?'Cliquez le contour de l’allée':k==='piscine'?'Cliquez les angles du bassin':'Cliquez les angles de la terrasse';TOOLWANT[m]=a.w;LEGK[m]=()=>S.amen.some(x=>x.kind===k)});
{let i=-1;TOOLS.forEach((t,j)=>{if(/^z_/.test(t[0]))i=j});if(i<0)i=TOOLS.findIndex(t=>t[0]==='fence');TOOLS.splice(i+1,0,['g','Aménagement fonctionnel'],...Object.entries(AK).map(([k,a])=>['a_'+k,a.t,'area']))}
rebuildToolLists();
WANTS.push(['terrasse','Une terrasse','Bois, composite, pierre, céramique…','a_terrasse'],['allee','Des allées ou des chemins','Gravier, pavés, dalles, pas japonais','a_allee'],['piscine','Une piscine ou une baignade naturelle','Coque, béton, kit ou piscine naturelle','a_piscine']);
{const o=ENVQ[0].o,i=o.findIndex(x=>x[0]==='entretien');o.splice(i<0?o.length:i,0,['terrasse','Une terrasse pour profiter du jardin'],['allee','Des allées et des chemins'],['piscine','Une piscine ou une baignade naturelle'])}
renderWants();
Object.assign(PRICE0,{plaque:['Location plaque vibrante','€/jour',40,70]});if(!PRICE.plaque)PRICE.plaque=clone(PRICE0.plaque);
try{const s=JSON.parse(localStorage.getItem('plantania:prices')||'{}');if(s.plaque)PRICE.plaque[2]=+s.plaque[0],PRICE.plaque[3]=+s.plaque[1]}catch(e){}

/* matériaux : sup = fourniture seule, pose = fourni et posé (hors fondation), en €/m² HTVA */
const AMAT={
 bois:{l:'Bois résineux (pin traité, mélèze, thermowood)',sup:[30,60],pose:[50,100],base:'plots',h:0.8,perm:1,heat:0,life:'10 à 20 ans',care:'Huiler ou saturer chaque année, nettoyer au printemps',for:'ta'},
 exo:{l:'Bois exotique certifié FSC (ipé, padouk…)',sup:[60,110],pose:[90,150],base:'plots',h:0.9,perm:1,heat:0,life:'25 ans et plus',care:'Huile facultative (sinon il grisaille), nettoyage annuel',for:'t'},
 composite:{l:'Composite (lames pleines ou alvéolaires)',sup:[35,90],pose:[60,140],base:'plots',h:0.8,perm:1,heat:1,life:'25 à 30 ans',care:'Nettoyage à l’eau savonneuse, pas d’huile',for:'t'},
 pierre:{l:'Pierre bleue belge',sup:[50,180],pose:[100,200],base:'emp',h:1.1,perm:0,heat:1,life:'50 ans et plus',care:'Nettoyage doux ; évitez les produits acides',for:'ta'},
 ceram:{l:'Céramique 2 cm (grès cérame)',sup:[40,100],pose:[70,150],base:'plots',h:1,perm:0,heat:0,life:'30 ans et plus',care:'Très faible : un coup de brosse',for:'t'},
 dalle:{l:'Dalles en béton',sup:[20,50],pose:[40,90],base:'emp',h:0.7,perm:0,heat:0,life:'30 ans et plus',care:'Brossage, démoussage de temps en temps',for:'ta'},
 paves:{l:'Pavés en béton ou klinkers',sup:[15,45],pose:[40,90],base:'emp',h:0.8,perm:0.5,heat:0,life:'30 ans et plus',care:'Regarnir les joints de sable de temps en temps',for:'ta'},
 pnat:{l:'Pavés en pierre naturelle',sup:[25,70],pose:[45,120],base:'emp',h:1,perm:0.5,heat:0,life:'50 ans et plus',care:'Regarnir les joints',for:'ta'},
 desac:{l:'Béton désactivé',sup:[20,45],pose:[50,120],base:'her',h:0.6,perm:0,heat:0,life:'30 ans et plus',care:'Nettoyage à l’eau sous pression modérée',for:'ta',nodiy:1},
 gravier:{l:'Gravier stabilisé (dalles alvéolaires)',sup:[12,30],pose:[30,60],base:'emp',h:0.3,perm:1,heat:0,life:'15 à 25 ans',care:'Ratisser, recharger un peu de gravier tous les 2 à 3 ans',for:'ta'},
 dolomie:{l:'Gravier ou dolomie damée',sup:[6,15],pose:[15,30],base:'emp',h:0.25,perm:1,heat:0,life:'10 ans (à recharger)',care:'Désherber à la main, recharger et compacter',for:'a'},
 pasjap:{l:'Pas japonais dans le gazon',sup:[0,0],pose:[0,0],base:'none',h:0,perm:1,heat:0,life:'Très longue',care:'Tondre autour, repositionner un pas qui bouge',for:'a'}};
const FBASE={emp:{l:'terrassement de 25 à 30 cm et empierrement compacté',pro:[45,90],sup:[12,25],h:0.6},plots:{l:'nivellement, géotextile et plots réglables',pro:[5,25],sup:[3,10],h:0.25},her:{l:'terrassement et hérisson drainant',pro:[35,65],sup:[10,20],h:0.5},none:{l:'aucune',pro:[0,0],sup:[0,0],h:0}};
const BASEO={new:'Rien : tout est à créer (pelouse, terre)',old:'Un ancien revêtement à démolir',slab:'Une dalle de béton saine, à réutiliser',stab:'Un empierrement stable, à réutiliser'};
const DRAINO={auto:'Choisir pour moi',pente:'Pente de 1 à 2 % vers le jardin',caniveau:'Caniveau à fente le long de la façade',drain:'Drain (tranchée drainante) en bas de pente',zone:'Vers un jardin de pluie ou une noue',none:'Rien de prévu'};
const DRAINP={caniveau:{pro:[30,60],sup:[20,40],h:0.5,l:'Caniveau à fente'},drain:{pro:[50,90],sup:[15,30],h:0.8,l:'Drain dans une tranchée de graviers'}};
const AUSE={pieton:'À pied (une personne)',duo:'À pied à deux, brouette, vélo',voiture:'Voiture (carrossable)'};
const WHO={pro:'Un professionnel',diy:'Moi-même'};
const PT={naturelle:{l:'Baignade naturelle (filtration par les plantes)',lo:T=>15000+250*T,hi:T=>25000+450*T,d:2},coque:{l:'Coque polyester',lo:A=>8400+364*A,hi:A=>16000+590*A,d:1.5},beton:{l:'Béton ou blocs, sur mesure',lo:A=>12500+545*A,hi:A=>18600+1136*A,d:1.5},kit:{l:'Kit bois ou acier semi-enterré',lo:A=>2000+170*A,hi:A=>6000+500*A,d:1.3,diy:1}};
const HEAT={none:'Pas de chauffage',pac:'Pompe à chaleur',solaire:'Chauffage solaire'};
const SAFE={volet:'Volet roulant',bache:'Bâche à barres',barriere:'Barrière autour du bassin',alarme:'Alarme',none:'Rien pour l’instant'};
const FBUD=[['s','Moins de 5 000 €',[0,5000]],['m','De 5 000 à 15 000 €',[5000,15000]],['l','De 15 000 à 40 000 €',[15000,40000]],['xl','Plus de 40 000 €',[40000,0]]];
const ADEF=k=>k==='terrasse'?{mat:'composite',base:'new',drain:'auto',who:'pro',gear:0,old10:0,bmin:0,bmax:0}:k==='allee'?{mat:'gravier',use:'pieton',base:'new',drain:'pente',who:'diy',gear:0,bmin:0,bmax:0}:{type:'coque',depth:1.5,regen:40,heat:'none',safe:'volet',link:'',bmin:0,bmax:0};
const aNum=a=>S.amen.filter(x=>x.kind===a.kind).indexOf(a)+1;
const aName=a=>`${AK[a.kind].l} ${aNum(a)}`;
const matsFor=k=>Object.entries(AMAT).filter(([,m])=>m.for.includes(k==='terrasse'?'t':'a'));
const COMP=['nord','nord-est','est','sud-est','sud','sud-ouest','ouest','nord-ouest'];
function bldList(){return[...S.shapes.filter(s=>s.kind==='obsPoly'&&s.nat!=='caduc'&&s.nat!=='haie').map(s=>s.pts),...S.obs.filter(o=>o.type==='bat').map(o=>[[o.lat,o.lng]])]}
function nearBld(a){let best=null;bldList().forEach(b=>{const d=b.length>2?Math.min(...a.pts.map(p=>distPtPoly(p,b))):Math.min(...a.pts.map(p=>llDist(p,b[0])));if(!best||d<best.d)best={d,b}});return best}
function sideOf(a,b){const c=cen(a.pts),o=b.length>2?cen(b):b[0],mp=mPer(c[0]),dn=(c[0]-o[0])*111320,de=(c[1]-o[1])*mp;const brg=((Math.atan2(de,dn)*180/Math.PI)+360)%360;return COMP[Math.round(brg/45)%8]}
function amSun(p){try{if(S.lat==null)return null;return sunHoursAt(p,sunTable(),obsAll())}catch(e){return null}}
function edges(P){return P.map((p,i)=>[p,P[(i+1)%P.length],llDist(p,P[(i+1)%P.length])])}
function houseEdgeLen(a){const E=edges(a.pts),B=bldList().filter(b=>b.length>2);if(!B.length)return Math.max(...E.map(e=>e[2]));let best=null;E.forEach(e=>{const m=[(e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2],d=Math.min(...B.map(b=>distPtPoly(m,b)));if(!best||d<best.d)best={d,l:e[2]}});return best.l}
function nearZone(a,kinds,max){let best=null;(S.zones||[]).filter(z=>kinds.includes(z.kind)).forEach(z=>{const d=minD(geomPts('a',a),geomPts('z',z));if(d<=max&&(!best||d<best.d))best={d,z}});return best}
function touches(a,b){return minD(geomPts('a',a),geomPts('a',b))}
const amenTTC=(v,vat)=>[v[0]*(1+vat/100),v[1]*(1+vat/100)];
function overPath(a){const c=cen(a.pts);return S.paths.find(p=>p.nat!=='pasjap'&&inPolyLL(c,p.pts))}

function amenInfo(a,noSun){const o={...ADEF(a.kind),...(a.opts||{})},A=areaLL(a.pts),D=zDims(a),c=cen(a.pts),tech=[],warn=[],steps=[],gear=[],bud=[],tips=[];const C=cond();
  let proHT=[0,0],supHT=[0,0],rentHT=[0,0],hDiy=0,vatPro=21,diyOk=true,debV=0;const nb=nearBld(a),attached=!!(nb&&nb.d<=1.5),sun=noSun?null:amSun(c);
  if(a.kind==='terrasse'||a.kind==='allee'){const M=AMAT[o.mat]||AMAT.gravier,car=a.kind==='allee'&&o.use==='voiture';
    const fb=FBASE[o.base==='slab'||o.base==='stab'?'none':M.base]||FBASE.none,kb=car?1.4:1;let base=[fb.pro[0]*kb,fb.pro[1]*kb],bsup=[fb.sup[0]*kb,fb.sup[1]*kb],bh=fb.h;
    if(o.base==='old'){base=add2(base,[15,35]);bh+=0.5}if(o.base==='stab'||(o.base==='slab'&&M.base==='plots')){base=[5,25];bsup=[2,6];bh=0.2}
    if(o.mat==='pasjap'){const n=Math.max(2,Math.ceil(D.L/0.65))*(D.W>1.2?2:1),s=pr('pasjap',n),hh=HOURS.pasjap(n);supHT=s;hDiy=hh;const lab=[hh/1.8*PRICE.rate[2],hh/1.8*PRICE.rate[3]];proHT=add2(s,lab);
      tech.push(['Revêtement',M.l],['Nombre de pas',`${n} (un pas tous les 65 cm environ${D.W>1.2?', en double rangée':''})`]);bud.push(['Pas japonais',`${n} pièces`,rg(amenTTC(s,21))]);
      steps.push('Poser les pas sur la pelouse en suivant votre foulée (60 à 70 cm d’axe en axe) et marcher dessus pour vérifier.','Découper le gazon autour de chaque pas, creuser 5 cm de plus que son épaisseur.','Mettre 3 à 5 cm de sable, poser le pas un peu sous le niveau du gazon (pour tondre par-dessus), tasser au maillet.');gear.push('Bêche ou coupe-bordure, maillet en caoutchouc, niveau');if(car)warn.push('Des pas japonais ne conviennent pas au passage d’une voiture.')}
    else{const kp=car&&o.mat==='desac'?1.25:1,pose=[M.pose[0]*A*kp,M.pose[1]*A*kp],bA=[base[0]*A,base[1]*A];proHT=add2(pose,bA);supHT=add2([M.sup[0]*A,M.sup[1]*A],[bsup[0]*A,bsup[1]*A]);hDiy=A*(M.h+bh);
      tech.push(['Revêtement',M.l],['Fondation',o.base==='slab'?'Dalle existante réutilisée'+(M.base==='plots'?' (plots posés sur la dalle)':' (pose collée sur mortier drainant)'):o.base==='stab'?'Empierrement existant réutilisé, à niveler':(o.base==='old'?'Démolition de l’ancien revêtement, puis ':'')+(M.base==='none'?'aucune':FBASE[M.base].l)],['Durée de vie',M.life],['Entretien',M.care]);
      bud.push(['Revêtement fourni et posé',`${nf(A)} m² × ${nf(M.pose[0]*kp)}–${nf(M.pose[1]*kp)} €`,rg(pose)]);if(bA[1])bud.push([o.base==='old'?'Démolition et fondation':'Préparation et fondation',`${nf(A)} m²`,rg(bA)]);
      if(M.nodiy)diyOk=false}
    let dr=o.drain;if(dr==='auto'){const z=nearZone(a,['pluie','noue'],15);dr=M.perm>=1?'pente':z?'zone':attached?'caniveau':C.sol==='a'?'drain':'pente'}
    if(a.kind==='allee'&&dr==='caniveau'&&!attached)dr='drain';
    if(DRAINP[dr]){const len=dr==='caniveau'?houseEdgeLen(a):Math.max(...edges(a.pts).map(e=>e[2])),P=DRAINP[dr];proHT=add2(proHT,[P.pro[0]*len,P.pro[1]*len]);supHT=add2(supHT,[P.sup[0]*len,P.sup[1]*len]);hDiy+=P.h*len;bud.push([P.l,`${nf(len,1)} m`,rg([P.pro[0]*len,P.pro[1]*len])])}
    tech.push(['Évacuation de l’eau',(o.drain==='auto'?'Conseillé : ':'')+DRAINO[dr]+(dr==='zone'?(()=>{const z=nearZone(a,['pluie','noue'],15);return z?` (${ZK[z.z.kind].l} ${zNum(z.z)} à ${nf(z.d,1)} m)`:' (dessinez-en un sur la carte)'})():'')]);
    if(a.kind==='terrasse'){vatPro=attached&&o.old10?6:21;
      if(nb)tech.push(['Position',`${attached?'Contre':`À ${nf(nb.d,1)} m de`} la maison, côté ${sideOf(a,nb.b)}`]);
      if(sun!=null){tech.push(['Soleil d’avril à septembre',`≈ ${nf(sun,1)} h par jour`]);if(sun>7&&AMAT[o.mat]&&AMAT[o.mat].heat)warn.push('Ce matériau chauffe en plein soleil : choisissez une teinte claire ou prévoyez de l’ombre (pergola, voile, arbre caduc).');if(sun>8)tips.push('Terrasse très ensoleillée : un arbre caduc ou une pergola au sud-ouest donne de l’ombre l’été sans priver du soleil l’hiver.');if(sun<3)warn.push(`Peu de soleil (≈ ${nf(sun,1)} h par jour) : la terrasse restera fraîche et la mousse s’installe vite sur le bois et la pierre. Préférez le composite ou la céramique antidérapante.`)}
      if(attached&&o.mat!=='pasjap')warn.push('Contre la maison : la pente (1 à 2 %) doit éloigner l’eau de la façade, et la terrasse doit rester sous le seuil des portes.');
      if(attached&&!o.old10&&o.who==='pro')tips.push('Habitation de plus de 10 ans ? Une terrasse attenante, fournie et posée par une entreprise, peut bénéficier de la TVA à 6 % : cochez la case pour l’estimation.');
      const op=overPath(a);if(op)tips.push(o.base==='new'?`La terrasse recouvre un « ${PATHN[op.nat]||'chemin'} » existant : choisissez « une dalle de béton saine, à réutiliser » ou « un ancien revêtement à démolir » dans « Ce qu’il y a déjà au sol ».`:o.base==='old'?'Si l’ancien revêtement repose sur une dalle de béton saine, choisissez « une dalle de béton saine, à réutiliser » : la fondation est alors déjà faite.':'')}
    else{tech.unshift(['Longueur et largeur',`≈ ${nf(D.L,1)} m × ${nf(D.W,2)} m`],['Usage',AUSE[o.use]||AUSE.pieton]);
      const wmin=o.use==='voiture'?2.5:o.use==='duo'?1.2:0.8;if(D.W<wmin-0.05)warn.push(`Largeur d’environ ${nf(D.W,2)} m : comptez au moins ${nf(wmin,1)} m pour cet usage.`);
      if(car&&['bois','exo','composite','ceram','dolomie','pasjap'].includes(o.mat))warn.push('Ce revêtement ne supporte pas bien le passage d’une voiture : préférez pavés, gravier stabilisé ou béton désactivé.');
      const ln=amenLinks(a);if(ln.length)tech.push(['Relie',ln.join(', ')])}
    if(M.perm>=1)tips.push('Revêtement perméable : l’eau de pluie s’infiltre sur place, c’est le meilleur choix pour le sol et souvent demandé par les communes.');
    if(regionKey()==='vla'&&M.perm<1)tips.push('En Flandre, les surfaces imperméables comptent pour le règlement régional sur les eaux de pluie (hemelwaterverordening) : infiltration ou récupération peuvent être exigées.');
    if(o.mat!=='pasjap'){const B=o.base==='slab'||o.base==='stab',st=[];st.push(`Tracer ${a.kind==='terrasse'?'la terrasse':'l’allée'} au cordeau et prévoir la pente : 1 à 2 % vers le jardin, jamais vers la maison.`);
      if(o.base==='old')st.push('Démolir l’ancien revêtement et évacuer les gravats (conteneur).');
      if(B)st.push(o.base==='slab'?'Vérifier que la dalle est saine (ni fissure ni affaissement) et qu’elle a déjà une pente ; la réparer si besoin.':'Reprofiler et recompacter l’empierrement existant à la plaque vibrante.');
      else if(M.base==='plots')st.push('Décaper la pelouse ou la terre végétale sur 10 à 15 cm, niveler, compacter, poser un géotextile et une fine couche de gravier.');
      else if(M.base==='emp')st.push(`Décaisser sur ${car?'35':'25 à 30'} cm, poser un géotextile, puis ${car?'25':'15 à 20'} cm d’empierrement 0/32 compacté à la plaque vibrante par couches de 10 cm.`,'Poser les bordures sur béton maigre pour bloquer le revêtement.');
      if(o.mat==='bois'||o.mat==='exo'||o.mat==='composite')st.push('Placer les plots réglables tous les 40 à 50 cm sous les lambourdes et les régler au niveau, pente comprise.','Fixer les lambourdes, puis visser les lames en laissant le jeu de dilatation indiqué par le fabricant.','Finir les bords avec une lame de rive.');
      else if(o.mat==='ceram')st.push('Placer un plot à chaque angle de dalle, régler la hauteur au niveau.','Poser les dalles de 2 cm avec les croisillons des plots.');
      else if(o.mat==='pierre'||o.mat==='dalle')st.push('Poser les dalles sur 3 à 5 cm de sable stabilisé ou de mortier drainant, joints de 5 à 10 mm, en contrôlant la pente.','Remplir les joints (mortier ou sable polymère) et nettoyer.');
      else if(o.mat==='paves'||o.mat==='pnat')st.push('Étaler 3 à 5 cm de sable de pose réglé à la règle, poser les pavés selon l’appareillage choisi.','Compacter avec une plaque munie d’un tapis, remplir les joints de sable et balayer.');
      else if(o.mat==='gravier')st.push('Poser les dalles alvéolaires, les remplir de gravier 8/16 et ajouter 1 à 2 cm de gravier par-dessus.');
      else if(o.mat==='dolomie')st.push('Étaler la dolomie en deux couches de 5 cm, arroser et compacter chaque couche.');
      else if(o.mat==='desac')st.push('Travail de professionnel : coffrage, hérisson drainant, treillis, béton coulé, désactivant pulvérisé puis lavage à l’eau sous pression le lendemain.');
      if(dr==='caniveau')st.push('Poser le caniveau à fente le long de la façade et le raccorder à une citerne, un puits d’infiltration, une noue ou au réseau d’eaux pluviales, selon la commune.');
      if(dr==='drain')st.push('Poser un drain dans une tranchée de graviers enrobée de géotextile, en bas de pente, vers un exutoire.');
      if(dr==='zone')st.push('Orienter la pente vers le jardin de pluie ou la noue : l’eau y est infiltrée.');
      steps.push(...st);
      if(!B&&M.base==='emp')gear.push('Mini-pelle (location) ou bêche et pelle, brouette','Plaque vibrante (location)');
      if(!B&&M.base==='plots')gear.push('Bêche, râteau, dameuse');
      gear.push('Cordeau, piquets, niveau à bulle et règle de 2 m (ou niveau laser)');
      if(['bois','exo','composite'].includes(o.mat))gear.push('Scie à onglet ou circulaire, visseuse, clé de réglage des plots');
      if(['pierre','ceram','dalle','paves','pnat'].includes(o.mat))gear.push('Disqueuse diamant, maillet en caoutchouc, ventouse pour les grandes dalles')}
    if(o.who==='diy'&&!o.gear&&diyOk&&o.mat!=='pasjap'&&!(o.base==='slab'||o.base==='stab')){const nd=M.base==='emp'||M.base==='her';if(nd&&A>15)rentHT=add2(rentHT,pr('minipelle',Math.max(1,Math.ceil(A/40))));if(M.base==='emp')rentHT=add2(rentHT,pr('plaque',Math.max(1,Math.ceil(A/60))))}
    if(!diyOk&&o.who==='diy')warn.push('Le béton désactivé se coule par une entreprise (camion toupie, finition le lendemain) : l’estimation « moi-même » n’est pas possible.')}
  else{const P=PT[o.type]||PT.coque,dep=o.depth||P.d,nat=o.type==='naturelle',reg=Math.max(0,Math.min(70,o.regen??40))/100,swim=nat?A*(1-reg):A,V=swim*dep*(nat?0.8:1),deb=nat?swim*dep+A*reg*0.5:A*(dep+0.2);
    debV=deb;proHT=[P.lo(A),P.hi(A)];vatPro=21;diyOk=!!P.diy;if(P.diy){supHT=[Math.max(0,P.lo(A)-1000),Math.max(0,P.hi(A)-300)];hDiy=24+A*1.5;if(!a.opts||!a.opts.gear)rentHT=pr('minipelle',1)}else{supHT=proHT.slice();hDiy=0}
    tech.push(['Type',P.l],['Surface',nat?`${nf(A)} m² au total : ≈ ${nf(swim)} m² de nage et ${nf(A*reg)} m² de zone plantée (${Math.round(reg*100)} %)`:`${nf(A)} m² (≈ ${nf(D.L,1)} × ${nf(D.W,1)} m)`],['Profondeur',`${nf(dep,2)} m${nat?' dans la zone de nage':''}`],['Volume d’eau',`≈ ${nf(V)} m³ (remplissage ≈ ${eur(V*5)} à environ 5 €/m³)`],['Terres à évacuer',`≈ ${nf(deb)} m³`],['Chauffage',HEAT[o.heat]||HEAT.none],['Sécurité',SAFE[o.safe]||SAFE.none],['Entretien',nat?'Pas de chlore : retirer les feuilles, nettoyer le fond, tailler les plantes en automne':'Filtration et traitement de l’eau d’avril à octobre, hivernage : ≈ 700 à 2 500 € par an']);
    bud.push([P.l+(P.diy?' (kit posé)':' (forfait courant tout compris)'),`${nf(A)} m²`,rg(proHT)]);
    if(nat){if(A<50)warn.push(`Baignade naturelle de ${nf(A)} m² : en dessous de 50 m² environ, l’équilibre biologique est difficile à tenir.`);if(reg<0.3)warn.push('Zone plantée trop petite : comptez 30 à 50 % de la surface totale pour épurer l’eau.')}
    if(sun!=null){tech.push(['Soleil d’avril à septembre',`≈ ${nf(sun,1)} h par jour`]);if(!nat&&sun<5)warn.push(`Bassin peu ensoleillé (≈ ${nf(sun,1)} h par jour) : eau plus froide et chauffage plus coûteux.`);if(nat&&sun>8)tips.push('Baignade naturelle en plein soleil : agrandissez la zone plantée ou ombragez-en une partie pour éviter que l’eau chauffe et verdisse.');if(!nat&&sun>=7)tips.push('Bon ensoleillement : l’eau se réchauffe naturellement ; une bâche à bulles suffit souvent en début de saison.')}
    const trees=S.obs.filter(t=>(t.type==='caduc'||t.type==='pers')&&Math.min(...a.pts.map(p=>llDist(p,[t.lat,t.lng])))<Math.max(5,t.w));if(trees.length)warn.push(`${trees.length} arbre${trees.length>1?'s':''} tout près du bassin : feuilles et aiguilles à retirer souvent${trees.some(t=>t.type==='caduc')?', surtout en automne':''}. Gardez la place pour les racines.`);
    if(S.env&&Array.isArray(S.env.who)&&S.env.who.includes('kids')&&(o.safe==='none'||!o.safe))warn.push('Avec de jeunes enfants : prévoyez au moins une protection (barrière, volet ou bâche à barres) et une alarme.');
    if(nb)tech.push(['Distance à la maison',`${nf(nb.d,1)} m`]);
    const lk=amenLink(a);if(lk){tech.push(['Reliée à',`${aName(lk.it)}${lk.d>0.3?` (à ${nf(lk.d,1)} m)`:' (touche le bassin)'}`]);if(lk.d>2)tips.push(`${aName(lk.it)} est à ${nf(lk.d,1)} m : prolongez la plage ou ajoutez une allée pour aller à pied sec jusqu’au bassin.`)}
    else tips.push('Reliez la piscine à une terrasse ou à une allée (dessinez-la puis choisissez-la dans « Reliée à ») : on y circule pieds nus, il faut une plage antidérapante autour du bassin.');
    if(nat)steps.push('Concevoir avec un spécialiste : zone de nage, zone plantée (30 à 50 % de la surface) et circulation de l’eau.','Terrasser en paliers et séparer les deux zones (muret ou boudin sous l’eau).','Poser un géotextile puis la membrane d’étanchéité (EPDM ou équivalent).','Mettre un substrat minéral pauvre (sans terre) et planter les plantes épuratrices (iris, joncs, nénuphars…).','Installer une pompe basse consommation et un skimmer ; remplir lentement : l’équilibre s’installe en une ou deux saisons.');
    else if(o.type==='kit')steps.push('Choisir un emplacement plat, à l’abri des vents dominants, accessible pour la livraison.','Creuser à la profondeur prévue et couler une dalle de béton d’environ 15 cm.','Monter la structure, poser le liner, raccorder la filtration (électricité par un électricien).','Remblayer avec du gravier drainant, jamais de terre contre la paroi.','Remplir progressivement en contrôlant le liner.');
    else steps.push('Implanter le bassin et le local technique ; vérifier l’accès pour les engins'+(o.type==='coque'?', le camion et la grue.':'.'),'Terrassement et radier (béton ou gravier stabilisé).',o.type==='coque'?'Pose de la coque, remblai au gravier en même temps que le remplissage pour équilibrer les pressions.':'Murs en béton coulé, projeté ou en blocs, puis étanchéité et revêtement (liner, membrane armée ou carrelage).','Raccordement de la filtration ; électricité par un électricien, installation contrôlée par un organisme agréé.','Margelles et plage antidérapante, raccord avec la terrasse ou l’allée.');
    gear.push(P.diy?'Mini-pelle (location), brouette, niveau laser, bétonnière pour la dalle':'Travail de pisciniste : engins et matériel fournis par l’entreprise');
    tech.unshift(['Règles',poolRules(a,{A,deb,swim}).summary])}
  const pro=amenTTC(proHT,vatPro),diy=diyOk?add2(amenTTC(supHT,21),amenTTC(rentHT,21)):pro.slice(),lab=[Math.max(0,pro[0]-supHT[0]*(1+vatPro/100)),Math.max(0,pro[1]-supHT[1]*(1+vatPro/100))];
  if(rentHT[1])bud.push(['Location de matériel (moi-même)','',rg(rentHT)]);
  return{deb:debV,o,A,D,tech,warn,tips,steps,gear,bud,proHT,supHT,rentHT,vatPro,pro,diy,lab,diyOk,hDiy,hPro:hDiy?hDiy/1.8:0,sun,attached}}
function amenLinks(a){const out=[],near=(pts,max)=>minD(geomPts('a',a),pts)<=max;const nb=nearBld(a);if(nb&&nb.d<=1.5)out.push('la maison');
  S.amen.forEach(b=>{if(b!==a&&b.kind!=='allee'&&near(geomPts('a',b),1.5))out.push(aName(b).toLowerCase())});S.amen.filter(b=>b!==a&&b.kind==='allee'&&near(geomPts('a',b),1)).forEach(b=>out.push(aName(b).toLowerCase()));
  S.potagers.forEach((p,i)=>{if(near(geomPts('v',p),1.5))out.push('le potager'+(S.potagers.length>1?' '+(i+1):''))});S.ponds.forEach((p,i)=>{if(near(geomPts('pond',p),1.5))out.push('la mare'+(S.ponds.length>1?' '+(i+1):''))});
  S.shapes.filter(s=>s.kind==='obsPoly').forEach(s=>{if(s.name&&near(geomPts('s',s),1.5)&&!out.includes(s.name.toLowerCase()))out.push(s.name.toLowerCase())});return[...new Set(out)]}
function amenLink(a){const o=a.opts||{};if(o.link){const it=S.amen.find(x=>String(x.id)===String(o.link));if(it)return{it,d:touches(a,it)}}let best=null;S.amen.filter(x=>x!==a&&x.kind!=='piscine').forEach(x=>{const d=touches(a,x);if(d<=1.5&&(!best||d<best.d))best={it:x,d}});return best}
function poolRules(a,X){const reg=regionKey(),Dm=propDomain(),dB=Dm?Math.min(...a.pts.map(p=>inPolyLL(p,Dm)?distEdge(p,Dm):0)):null,rows=[],ck=(ok,t)=>rows.push([ok===null?'?':ok?'✓':'✗',t]),o={...ADEF('piscine'),...(a.opts||{})},nb=nearBld(a);
  const lim=m=>dB==null?' (dessinez votre parcelle pour vérifier)':` (ici ${nf(dB,1)} m)`;
  if(reg==='wal'){ck(X.A<=75,`Superficie de 75 m² au plus (ici ${nf(X.A)} m²)`);ck(dB==null?null:dB>=3,'À 3 m au moins des limites de la parcelle'+lim());ck(S.amen.filter(x=>x.kind==='piscine').length<=1,'Une seule piscine sur la propriété');ck(null,'Dans la cour ou le jardin, non visible depuis la rue');ck(null,`Pas de modification sensible du relief ailleurs sur le terrain : évacuez les ${nf(X.deb)} m³ de terres plutôt que de les étaler (au-delà de 40 m³, la modification est « sensible »)`);ck(null,'Non couverte, ou abri télescopique léger de 3,50 m de haut au plus')}
  else if(reg==='vla'){const tot=S.amen.reduce((s,x)=>s+areaLL(x.pts),0)+S.paths.filter(p=>p.nat!=='pasjap').reduce((s,p)=>s+areaLL(p.pts),0)+S.ponds.reduce((s,p)=>s+areaLL(p.pts),0);
    ck(tot<=80,`Au plus 80 m² de constructions non couvertes dans les jardins latéral et arrière, piscine, terrasses, chemins et mares compris (ici ≈ ${nf(tot)} m²)`);ck(dB==null?null:dB>=1,'À 1 m au moins de la limite de la parcelle'+lim());ck(nb?nb.d<30:null,`À moins de 30 m de la maison${nb?` (ici ${nf(nb.d,1)} m)`:''}`);ck(o.type==='kit'?null:true,'Pas plus de 1,5 m au-dessus du sol');ck(null,'Pas en zone vulnérable ni à moins de 5 m de la berge d’un cours d’eau');ck(null,'Le règlement régional sur les eaux de pluie (hemelwaterverordening) s’applique')}
  else if(reg==='bxl'){ck(X.A<=20,`Superficie de 20 m² au plus (ici ${nf(X.A)} m²)`);ck(dB==null?null:dB>=2,'À 2 m au moins des propriétés voisines'+lim());ck(o.type==='kit'?null:true,'Enterrée et non couverte');ck(null,'Non visible depuis la voie publique')}
  const ko=rows.some(r=>r[0]==='✗'),un=rows.some(r=>r[0]==='?');
  return{rows,reg,summary:!reg?'Région inconnue : placez votre terrain pour vérifier la dispense de permis.':ko?'Permis probablement nécessaire (au moins une condition de dispense non remplie)':un?'Dispense de permis possible, à confirmer (points à vérifier)':'Dispense de permis possible selon les règles régionales'}}

/* budget du projet comparé au budget souhaité */
function aBudget(a){const o=a.opts||{};if(o.bmin||o.bmax)return[+o.bmin||0,+o.bmax||0];return null}
function envBud(){const v=S.env&&S.env.f_fbud,f=FBUD.find(x=>x[0]===v);return f?f[2]:null}
function fitMsg(est,B){if(!B)return'';const[lo,hi]=B;if(hi&&est[0]>hi)return`<p class="warn">Au-dessus de votre budget (${hi?eur(hi):''}) : l’estimation commence à ${eur(est[0])}.</p>`;if(lo&&est[1]<lo)return`<p class="okk">Sous votre budget : il reste de la marge pour un matériau plus haut de gamme ou des finitions.</p>`;return`<p class="okk">Dans votre budget${hi?` (jusqu’à ${eur(hi)})`:''}.</p>`}
function altMats(a,B){if(!B||!B[1])return[];const o={...ADEF(a.kind),...(a.opts||{})},out=[];
  if(a.kind==='piscine'){Object.keys(PT).forEach(t=>{if(t===o.type)return;const I=amenInfo({...a,opts:{...o,type:t,depth:PT[t].d}},1);if(I.pro[0]<=B[1])out.push([t,PT[t].l,I.pro])});const P=PT[o.type];let lo=5,hi=120;for(let k=0;k<30;k++){const m=(lo+hi)/2;(P.lo(m)*1.21<=B[1])?lo=m:hi=m}if(lo>5&&lo<areaLL(a.pts))out.push(['size',`Même type, environ ${nf(lo)} m² au plus`,[P.lo(lo)*1.21,P.hi(lo)*1.21]]);return out.slice(0,4)}
  matsFor(a.kind).forEach(([k,m])=>{if(k===o.mat)return;const I=amenInfo({...a,opts:{...o,mat:k}},1),est=o.who==='diy'&&I.diyOk?I.diy:I.pro;if(est[0]<=B[1])out.push([k,m.l,est])});return out.sort((x,y)=>y[2][1]-x[2][1]).slice(0,3)}

/* dessin, liste et carte */
{const _fs23=finishShape;finishShape=function(){const m=S.mode;if(!m||!m.startsWith('a_'))return _fs23();if(S.drawPts.length<3){$('#maphint').textContent='Il faut au moins 3 points.';return}pushUndo();
  const k=m.slice(2),id=++itemId,o=ADEF(k),E=S.env||{};if(k==='terrasse'&&E.f_terr&&E.f_terr!=='auto'&&AMAT[E.f_terr])o.mat=E.f_terr;if(k==='piscine'&&E.f_pool&&PT[E.f_pool]){o.type=E.f_pool;o.depth=PT[E.f_pool].d}if(E.diy==='me'&&k!=='piscine')o.who='diy';
  const a={id,pts:S.drawPts.slice(),kind:k,opts:o};S.amen.push(a);initGeom(id);
  if(k==='terrasse'&&overPath(a))a.opts.base='old';
  if(k==='piscine'){const lk=amenLink(a);if(lk)a.opts.link=String(lk.it.id)}else{S.amen.filter(p=>p.kind==='piscine'&&!(p.opts||{}).link&&touches(p,a)<=1.5).forEach(p=>{p.opts.link=String(a.id)})}
  setMode('site');itemsChanged(false);drawHandles();renderFonc();toast(`${AK[k].l} ajoutée : ${nf(areaLL(a.pts))} m². Réglages dans l’onglet « Terrasse, allées, piscine ».`);if(typeof wizApply==='function')wizApply()}}
{const _di23=drawItems;drawItems=function(){_di23();(S.amen||[]).forEach(a=>{const K=AK[a.kind],o=a.opts||{},lab=`${aName(a)}${a.kind!=='piscine'&&AMAT[o.mat]?' · '+AMAT[o.mat].l.split(' (')[0]:''} · ${nf(areaLL(a.pts))} m²`;
  const fc=a.kind!=='piscine'&&(PLANK.includes(o.mat)||SLAB.includes(o.mat))?(DCOL[deckDef(a).col]||[0,K.c])[1]:K.c;const l=hook(L.polygon(a.pts,{color:a.kind==='piscine'?'#0b7fae':K.c,weight:a.kind==='allee'?1.5:2,fillColor:fc,fillOpacity:a.kind==='piscine'?.6:.5,dashArray:a.kind==='allee'?'4 4':null}).addTo(itemsLayer),'amen',a.id,lab);if(l&&l.bindTooltip)l.bindTooltip(lab,{permanent:true,direction:'center',className:'maplbl'})});updateLegend()}}
{const _ril23=renderItemsList;renderItemsList=function(){_ril23();const el=$('#itemsList');if(!el||!(S.amen||[]).length)return;let ul=el.querySelector('ul');
  if(!ul){el.innerHTML='<ul></ul><button type="button" id="delAll"></button>';ul=el.querySelector('ul');$('#delAll').textContent=curPhase()==='create'?'Effacer mon aménagement (l’existant est gardé)':'Effacer l’existant (l’aménagement est gardé)'}
  S.amen.forEach(a=>{const sel=typeof SEL19!=='undefined'&&SEL19&&SEL19.kind==='amen'&&SEL19.id===String(a.id),lab=(a.label?a.label+' · ':'')+`${aName(a)} · ${nf(areaLL(a.pts))} m²`;
    ul.insertAdjacentHTML('beforeend',`<li class="${sel?'isel':''}"><span class="sw" style="background:${AK[a.kind].c}"></span><span class="itlink" role="button" tabindex="0" title="Afficher et modifier sur la carte" data-k="amen" data-i="${a.id}" aria-expanded="${sel}">${esc(lab)}</span><button type="button" data-del="amen" data-id="${a.id}">Supprimer</button></li>${sel?`<li class="itedli" data-ek="amen" data-ei="${a.id}">${editorHtml('amen',a)}</li>`:''}`)});
  const c=$('#itemsCount');if(c)c.textContent=el.querySelectorAll('li:not(.itedli)').length}}
KTAB.amen=['fonct','Matériau, fondation et budget'];
{const _eh23=editorHtml;editorHtml=function(kind,it){let h=_eh23(kind,it);if(kind!=='amen'||!it||locked(kind,it))return h;const o={...ADEF(it.kind),...(it.opts||{})};
  const sel=it.kind==='piscine'?`<label>Type<select data-ef="ptype">${Object.entries(PT).map(([k,p])=>`<option value="${k}"${k===o.type?' selected':''}>${esc(p.l)}</option>`).join('')}</select></label>`:`<label>Matériau<select data-ef="amat">${matsFor(it.kind).map(([k,m])=>`<option value="${k}"${k===o.mat?' selected':''}>${esc(m.l)}</option>`).join('')}</select></label>`;
  return h.replace('<div class="frow">','<div class="frow">'+sel)}}
$('#itemsList').addEventListener('change',e=>{const k=e.target.dataset.ef;if(k!=='amat'&&k!=='ptype')return;e.stopImmediatePropagation();const li=e.target.closest('.itedli');if(!li)return;const it=itemOf(li.dataset.ek,li.dataset.ei);if(!it)return;pushUndo();it.opts=it.opts||{};
  if(k==='amat')it.opts.mat=e.target.value;else{it.opts.type=e.target.value;it.opts.depth=PT[e.target.value].d}itemsChanged(false);renderFonc();saveNow(true)},true);

/* végétal / fonctionnel dans « Mon aménagement » */
document.querySelector('#phaseBar .phsw').insertAdjacentHTML('afterend','<div class="phsw cside" id="csideBar" role="group" aria-label="Type d’aménagement" hidden><button type="button" data-cs="veg" aria-pressed="true">🌿 Végétal</button><button type="button" data-cs="fonc" aria-pressed="false">🧱 Fonctionnel</button></div>');
const isFonc=k=>FONC.includes(k);
{const _rmt23=renderMapTools;renderMapTools=function(){_rmt23();const box=$('#mapTools');if(!box||curPhase()!=='create')return;const side=S.cside==='fonc'?'fonc':'veg';
  box.querySelectorAll('[data-mt]').forEach(b=>{const k=b.dataset.mt;if(k==='measure'||k==='erase'||k==='site')return;if((side==='fonc')!==isFonc(k))b.remove()});
  if(side==='fonc'){const have=new Set([...box.querySelectorAll('[data-mt]')].map(b=>b.dataset.mt)),ref=box.querySelector('[data-mt=measure],[data-mt=erase]');
    const html=FONC.filter(k=>!have.has(k)).map(k=>{const t=TOOLS.find(x=>x[0]===k);return t?`<button type="button" data-mt="${k}" aria-pressed="${S.mode===k}" title="${esc(t[1])}">${swatch(k,t[2])}<span>${esc(SHORT[k])}</span></button>`:''}).join('');
    if(ref)ref.insertAdjacentHTML('beforebegin',html);else box.insertAdjacentHTML('beforeend',html)}}}
function applyCside(){const bar=$('#csideBar');if(!bar)return;const cr=curPhase()==='create';bar.hidden=!cr;bar.querySelectorAll('[data-cs]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cs===(S.cside==='fonc'?'fonc':'veg'))))}
{const _ap23=applyPhase;applyPhase=function(){_ap23();applyCside()}}
$('#csideBar').addEventListener('click',e=>{const b=e.target.closest('[data-cs]');if(!b)return;S.cside=b.dataset.cs;if(S.mode&&S.mode!=='site'&&S.mode!=='measure'&&S.mode!=='erase'&&isFonc(S.mode)!==(S.cside==='fonc'))setMode('site');applyCside();renderMapTools();saveNow(true);
  if(S.cside==='fonc')toast('Aménagement fonctionnel : terrasse, allée, piscine et clôture.')});
{const _sm23=setMode;setMode=function(m){if(m&&m!=='site'&&m!=='measure'&&m!=='erase'&&TOOLS.some(t=>t[0]===m)&&!EXIST_TOOLS.includes(m)){const s=isFonc(m)?'fonc':'veg';if(S.cside!==s){S.cside=s;try{applyCside();renderMapTools()}catch(e){}}}return _sm23(m)}}
{const _dc23=drawChecklist;drawChecklist=function(){let h=_dc23();Object.entries(AK).forEach(([k,K])=>{if(!S.amen.some(a=>a.kind===k))return;const w=WANTS.find(x=>x[0]===K.w);if(!w)return;h=h.replace(`<li class=""><span class="sw" style="background:${TC['a_'+k]}"></span>${esc(w[1])} <button type="button" data-drawtool="a_${k}">Dessiner</button>`,`<li class="ok"><span class="sw" style="background:${TC['a_'+k]}"></span>${esc(w[1])} : dessiné <button type="button" data-drawtool="a_${k}">Redessiner</button>`)});return h}}

/* questions de suivi dans « Mes envies » */
ENVF.push({w:['terrasse'],k:'f_terr',q:'Votre terrasse, plutôt en… ?',o:()=>[['auto','Je ne sais pas : conseillez-moi'],['bois','Bois'],['composite','Composite'],['pierre','Pierre bleue'],['ceram','Céramique'],['paves','Pavés'],['dalle','Dalles en béton']],apply:v=>{if(v&&v!=='auto'&&AMAT[v])S.amen.filter(a=>a.kind==='terrasse').forEach(a=>a.opts.mat=v);itemsChanged(false);renderFonc()}},
 {w:['piscine'],k:'f_pool',q:'Quel genre de piscine ?',o:()=>[['naturelle','Baignade naturelle, sans chlore'],['coque','Coque polyester'],['beton','Béton, sur mesure'],['kit','Kit bois ou acier semi-enterré'],['auto','Je ne sais pas encore']],apply:v=>{if(PT[v])S.amen.filter(a=>a.kind==='piscine').forEach(a=>{a.opts.type=v;a.opts.depth=PT[v].d});renderFonc()}},
 {w:['terrasse','allee','piscine'],k:'f_fbud',q:'Budget pour la terrasse, les allées ou la piscine ?',o:()=>FBUD.map(f=>[f[0],f[1]]).concat([['?','Je ne sais pas']]),apply:()=>renderFonc()});
renderEnvies();

/* onglet « Terrasse, allées, piscine » */
const sel_=(k,v,opts)=>`<select data-ao="${k}">${opts.map(([x,l])=>`<option value="${x}"${String(x)===String(v)?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
const LAWP_SYS='Tu es un assistant en urbanisme pour la Belgique. Cherche sur le web le règlement ou le guide communal d’urbanisme de la commune indiquée (site de la commune en priorité) et les règles régionales applicables aux piscines, terrasses et allées de jardin (dispense de permis, distances aux limites, superficie, gestion des eaux de pluie, imperméabilisation). N’affirme que ce que disent les sources trouvées ; si la commune n’a pas de règle spécifique trouvée en ligne, dis-le clairement. Réponds en français, en texte brut, avec ces titres sur une ligne chacun, suivis de tirets : En bref, Piscine, Terrasse et allées, Eaux de pluie, Documents de référence, À vérifier auprès de la commune. 220 mots au maximum.';
const lawpKey=()=>'plantania:lawp:'+(regionKey()||'')+':'+(PLACE.commune||'').toLowerCase();
function lawpGet(){try{return JSON.parse(localStorage.getItem(lawpKey())||'null')}catch(e){return null}}
function amenCard(a,I){const o=I.o,K=AK[a.kind],B=aBudget(a),est=o.who==='diy'&&I.diyOk?I.diy:I.pro,alt=altMats(a,B||envBud());let f='';
  if(a.kind==='piscine'){f=`<label>Type de bassin${sel_('type',o.type,Object.entries(PT).map(([k,p])=>[k,p.l]))}</label><label>Profondeur (m)<input type="number" data-ao="depth" min="0.6" max="3" step="0.1" value="${nf(o.depth||PT[o.type].d,1).replace(',','.')}"></label>${o.type==='naturelle'?`<label>Zone plantée (%)<input type="number" data-ao="regen" min="10" max="70" step="5" value="${o.regen??40}"></label>`:''}<label>Chauffage${sel_('heat',o.heat,Object.entries(HEAT))}</label><label>Sécurité${sel_('safe',o.safe,Object.entries(SAFE))}</label><label>Reliée à${sel_('link',o.link||'',[['','Rien (ou automatique)'],...S.amen.filter(x=>x.kind!=='piscine').map(x=>[String(x.id),aName(x)])])}</label>`}
  else{f=`<label>Matériau${sel_('mat',o.mat,matsFor(a.kind).map(([k,m])=>[k,m.l]))}</label>${a.kind==='allee'?`<label>Usage${sel_('use',o.use,Object.entries(AUSE))}</label>`:''}${o.mat!=='pasjap'?`<label>Ce qu’il y a déjà au sol${sel_('base',o.base,Object.entries(BASEO))}</label><label>Évacuation de l’eau${sel_('drain',o.drain,Object.entries(DRAINO).filter(([k])=>a.kind==='terrasse'||k!=='caniveau'))}</label>`:''}<label>Qui réalise ?${sel_('who',o.who,Object.entries(WHO))}</label>${o.who==='diy'?`<label class="ck"><input type="checkbox" data-ao="gear"${o.gear?' checked':''}> J’ai déjà le matériel (pas de location)</label>`:''}${a.kind==='terrasse'&&o.who==='pro'?`<label class="ck"><input type="checkbox" data-ao="old10"${o.old10?' checked':''}> Habitation de plus de 10 ans</label>`:''}`}
  f+=`<label>Mon budget de (€)<input type="number" data-ao="bmin" min="0" step="500" value="${o.bmin||''}" placeholder="min"></label><label>à (€)<input type="number" data-ao="bmax" min="0" step="500" value="${o.bmax||''}" placeholder="max"></label>`;
  const rules=a.kind==='piscine'?poolRules(a,{A:I.A,deb:I.deb}):null;
  return `<div class="card zcard acard" data-aid="${a.id}"><h4><span class="sw" style="background:${K.c}"></span> ${esc(aName(a))}${a.label?' · '+esc(a.label):''} · ${nf(I.A)} m²</h4><div class="frow">${f}</div>
   ${I.warn.map(w=>`<p class="warn">${esc(w)}</p>`).join('')}<table class="stack"><tbody>${I.tech.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>
   ${rules&&rules.rows.length?`<h5>Permis : conditions de dispense (${rules.reg==='wal'?'Wallonie, CoDT':rules.reg==='vla'?'Flandre':'Bruxelles'})</h5><table class="stack amrules"><tbody>${rules.rows.map(r=>`<tr><td class="${r[0]==='✓'?'ok':r[0]==='✗'?'ko':'q'}">${r[0]}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table><p class="small">Conditions régionales relevées en 2026. La commune peut être plus stricte : vérifiez avant de commander.</p>`:''}
   <h5>Budget indicatif</h5><table class="stack"><thead><tr><th>Poste</th><th>Quantité</th><th>HTVA</th></tr></thead><tbody>${I.bud.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table>
   <p><b>Fait par un professionnel :</b> ${rg(I.pro)} TVAC (TVA ${I.vatPro} %)${I.diyOk&&a.kind!=='piscine'||a.kind==='piscine'&&I.diyOk?` · <b>moi-même :</b> ${rg(I.diy)} TVAC${I.hDiy?` et ≈ ${nf(Math.round(I.hDiy))} h de travail`:''}`:''}</p>
   ${fitMsg(est,B||envBud())}${alt.length?`<div class="chips"><span class="small">${(B||envBud())&&est[0]>((B||envBud())[1]||1e12)?'Pour rester dans le budget :':'Autres choix possibles dans le budget :'}</span>${alt.map(([k,l,e])=>`<button type="button" data-aalt="${k}" title="${esc(rg(e))}">${esc(l)} · ${esc(rg(e))}</button>`).join('')}</div>`:''}
   ${I.tips.filter(Boolean).map(t=>`<p class="small">💡 ${esc(t)}</p>`).join('')}
   ${a.kind!=='piscine'?deckHtml(a):''}<details><summary>Étapes de réalisation</summary><ol class="small">${I.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details>
   ${I.gear.length?`<details><summary>Matériel nécessaire</summary><ul class="small">${I.gear.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></details>`:''}</div>`}
function renderFonc(){const box=$('#foncBox');if(!box)return;const A=S.amen||[];
  if(!A.length){box.innerHTML=`<p class="empty">Dessinez une terrasse, une allée ou une piscine sur la carte : « 2. Mon aménagement », puis « 🧱 Fonctionnel ».</p><div class="chips">${Object.entries(AK).map(([k,a])=>`<button type="button" data-adraw="${k}">${esc(a.l)}</button>`).join('')}</div>${tplHtml()}`;return}
  const L_=A.map(a=>[a,amenInfo(a)]),tot=L_.reduce((s,[a,I])=>add2(s,(I.o.who==='diy'&&I.diyOk)?I.diy:I.pro),[0,0]),EB=envBud(),c=PLACE.commune,lp=lawpGet();
  box.innerHTML=`<div class="card"><h4>Total de l’aménagement fonctionnel</h4><p class="big">${rg(tot)}</p><p class="small">TVA comprise, selon « qui réalise » pour chaque élément. Prix 2026 en Belgique, indicatifs : demandez toujours plusieurs devis.</p>${EB?fitMsg(tot,EB):''}</div>${tplHtml()}
   ${L_.map(([a,I])=>amenCard(a,I)).join('')}
   <div class="card lawai"><h4>Règles de ${c?esc(c):'votre commune'} pour la piscine, la terrasse et les allées</h4>${lp?lawHtml(lp):'<p class="small">L’IA cherche le règlement ou le guide d’urbanisme de la commune et résume les règles, avec les liens vers les sources.</p>'}<div class="chips"><button type="button" id="lawpGo" class="${lp?'':'pri'}"${c?'':' disabled'}>${lp?'Actualiser la recherche':'Chercher les règles de ma commune'}</button><button type="button" data-adraw="terrasse">+ Terrasse</button><button type="button" data-adraw="allee">+ Allée</button><button type="button" data-adraw="piscine">+ Piscine</button></div>${c?'':'<p class="small">Placez d’abord votre terrain : la commune est détectée automatiquement.</p>'}</div>`;requestAnimationFrame(drawDecks)}
$('#fonct').addEventListener('change',e=>{const tp=e.target.dataset.tp;if(tp){S.tpl[tp]=tp==='k'||tp==='w'?e.target.value:Math.max(0.5,parseFloat(String(e.target.value).replace(',','.'))||1);const op=!!e.target.closest('details[open]');renderFonc();const t=$('#foncBox .tplcard');if(t&&op)t.open=true;return}
  const dk=e.target.dataset.ad;if(dk){const card=e.target.closest('[data-aid]'),a=card&&S.amen.find(x=>String(x.id)===card.dataset.aid);if(!a)return;pushUndo();a.opts.deck={...(a.opts.deck||{})};let v=e.target.type==='checkbox'?(e.target.checked?1:0):e.target.value;if(['bl','bw','gap','H','ang'].includes(dk)){v=parseFloat(String(v).replace(',','.'));if(!isFinite(v))return}a.opts.deck[dk]=v;itemsChanged(false);renderFonc();saveNow(true);return}
  const k=e.target.dataset.ao;if(!k)return;const card=e.target.closest('[data-aid]');const a=card&&S.amen.find(x=>String(x.id)===card.dataset.aid);if(!a)return;pushUndo();a.opts=a.opts||{};let v=e.target.type==='checkbox'?(e.target.checked?1:0):e.target.value;
  if(['depth','regen','bmin','bmax'].includes(k)){v=parseFloat(String(v).replace(',','.'));if(!(v>=0))v=0}a.opts[k]=v;if(k==='type')a.opts.depth=PT[v].d;itemsChanged(false);renderFonc();saveNow(true)});
$('#fonct').addEventListener('click',async e=>{if(e.target.closest('#tplGo')){const T=S.tpl;placeTerrace(T.k,+T.A,+T.B,+T.a,+T.b,T.w);return}const d=e.target.closest('[data-adraw]');if(d){setWant(AK[d.dataset.adraw].w,true);renderWants();S.cside='fonc';try{setPhase('create')}catch(err){}showTab('carte',true);setMode('a_'+d.dataset.adraw);return}
  const al=e.target.closest('[data-aalt]');if(al){const card=al.closest('[data-aid]'),a=card&&S.amen.find(x=>String(x.id)===card.dataset.aid);if(!a)return;pushUndo();const v=al.dataset.aalt;
    if(a.kind==='piscine'){if(v==='size'){toast('Réduisez le bassin : « Éléments sur la carte » → la piscine → « Agrandir ou réduire ».');return}a.opts.type=v;a.opts.depth=PT[v].d}else a.opts.mat=v;itemsChanged(false);renderFonc();saveNow(true);return}
  if(!e.target.closest('#lawpGo'))return;const b=$('#lawpGo');if(!aiReady()){toast('La recherche par IA n’est pas activée sur ce site (serveur relais).');return}
  b.disabled=true;b.textContent='Recherche en cours… (30 à 60 secondes)';const reg=regionKey(),P=S.amen.map(a=>{const o=a.opts||{};return `${aName(a)} ${nf(areaLL(a.pts))} m²${a.kind==='piscine'?' ('+(PT[o.type]||PT.coque).l+')':AMAT[o.mat]?' ('+AMAT[o.mat].l+')':''}`}).join(' ; ');
  try{const r=await askWeb(LAWP_SYS,`Commune : ${PLACE.commune}${PLACE.cp?' ('+PLACE.cp+')':''}, région : ${reg==='vla'?'Flandre':reg==='bxl'?'Bruxelles-Capitale':'Wallonie'}, Belgique.\nProjet : ${P||'terrasse et piscine de jardin'}.\nQuelles règles s’appliquent (permis ou dispense, superficie, distance aux limites, imperméabilisation et eaux de pluie) ?`,4);
    const L={...r,date:new Date().toLocaleDateString('fr-BE'),commune:PLACE.commune};try{localStorage.setItem(lawpKey(),JSON.stringify(L))}catch(err){}renderFonc()}
  catch(err){toast('Recherche impossible : '+(err.message||err));renderFonc()}});
{const _ic23=itemsChanged;itemsChanged=function(a){_ic23(a);const s=$('#fonct');if(s&&!s.classList.contains('tabhide'))renderFonc()}}
{const _ss23=stepSecs;stepSecs=function(n){const s=_ss23(n);if(n===4&&(S.amen.length||['terrasse','allee','piscine'].some(wantOn))&&!s.includes('fonct')){const i=s.indexOf('machines');i>=0?s.splice(i,0,'fonct'):s.push('fonct')}return s}}
{const _at23=applyTabs;applyTabs=function(sel){_at23(sel);if(sel.includes('fonct'))renderFonc()}}


/* --- plan de pose de la terrasse (calepinage), à la manière d’un configurateur de terrasse --- */
const PLANK=['bois','exo','composite'],SLAB=['ceram','pierre','dalle','paves','pnat'];
const PFMT={paves:{'22x11':'22 × 11 cm (pavé béton courant)','20x10':'20 × 10 cm (klinker, pavé)','21x10.5':'21 × 10,5 cm (klinker)','30x20':'30 × 20 cm','20x20':'20 × 20 cm'},pnat:{'10x10':'10 × 10 cm (pavé mosaïque)','15x15':'15 × 15 cm','14x20':'14 × 20 cm (pavé de rue)','20x20':'20 × 20 cm (platine)'},
 dalle:{'30x30':'30 × 30 cm','40x40':'40 × 40 cm','60x40':'60 × 40 cm','60x30':'60 × 30 cm','60x60':'60 × 60 cm','80x80':'80 × 80 cm','90x45':'90 × 45 cm','100x100':'100 × 100 cm','opus':'Opus : 4 formats (60 × 60, 60 × 40, 40 × 60, 40 × 40)'}};PFMT.pierre=PFMT.dalle;PFMT.ceram=PFMT.dalle;
const PLAY={droit:'Pose droite, joints alignés',demi:'Joints décalés d’un demi (à l’anglaise)',tiers:'Joints décalés d’un tiers',diag:'Pose en diagonale (45°)',chevron90:'Chevrons à 90° (arête de poisson)',chevron45:'Chevrons à 45°',panier:'Panier tressé (par paires)',opus:'Opus (formats mélangés)'};
const PWASTE={droit:0.05,demi:0.05,tiers:0.06,diag:0.1,chevron90:0.08,chevron45:0.12,panier:0.07,opus:0.08};
const fmtLW=f=>{const m=String(f).split('x').map(Number);return[Math.max(m[0],m[1])/100,Math.min(m[0],m[1])/100]};
const layOk=(f,k)=>{if(f==='opus')return k==='opus';if(k==='opus')return false;const[L,W]=fmtLW(f);if(['chevron90','chevron45','panier'].includes(k))return Math.abs(L/W-2)<0.05;return true};
function layUnits(lay,f,j,box){const out=[],[x0,y0,x1,y1]=box;if(lay==='opus'){const M=[[0,0,0.6,0.6],[0.6,0,0.4,0.6],[0,0.6,0.6,0.4],[0.6,0.6,0.4,0.4]];for(let r=Math.floor(y0)-1;r<=y1+1;r++){const off=(((r%2)+2)%2)*0.4;for(let c=Math.floor(x0)-2;c<=x1+1;c++){const fl=((c+r)%2+2)%2;M.forEach(t=>out.push([c+off+(fl?1-t[0]-t[2]:t[0]),r+(fl?1-t[1]-t[3]:t[1]),t[2]-j,t[3]-j]))}}return out}
  const[L,W]=fmtLW(f),Lp=L+j,Wp=W+j;if(lay==='chevron90'||lay==='chevron45'){const a=Lp,b=Lp/2,N=Math.ceil(Math.max(x1-x0,y1-y0)/b)+4,cx=(x0+x1)/2,cy=(y0+y1)/2,m0=Math.round((cx+cy)/(2*b)),n0=Math.round((cx-cy)/(2*a));
    for(let m=m0-N;m<=m0+N;m++)for(let n=n0-N;n<=n0+N;n++){const ox=m*b+n*a,oy=m*b-n*a;if(ox>x1+a||ox<x0-2*a||oy>y1+a||oy<y0-2*a)continue;out.push([ox,oy,a-j,b-j],[ox,oy+b,b-j,a-j])}return out}
  if(lay==='panier'){const B=Lp;for(let i=Math.floor(x0/B)-1;i<=x1/B+1;i++)for(let k=Math.floor(y0/B)-1;k<=y1/B+1;k++){const bx=i*B,by=k*B;if((i+k)%2===0)out.push([bx,by,B-j,B/2-j],[bx,by+B/2,B-j,B/2-j]);else out.push([bx,by,B/2-j,B-j],[bx+B/2,by,B/2-j,B-j])}return out}
  for(let r=Math.floor(y0/Wp)-1;r<=y1/Wp+1;r++){const off=lay==='demi'?(((r%2)+2)%2)*Lp/2:lay==='tiers'?(((r%3)+3)%3)*Lp/3:0;for(let c=Math.floor(x0/Lp)-2;c<=x1/Lp+1;c++)out.push([c*Lp+off,r*Wp,L,W])}return out}
const DCOL={rouge:['Rouge brique','#9c4a37'],nuance:['Nuancé brun-rouge','#8a6a5b'],gris:['Gris clair','#a3a7a8'],anthra:['Anthracite','#4b4f52'],brun:['Brun','#6d4c3d'],sable:['Sable','#cbb38f'],teck:['Teck','#a0703f'],naturel:['Bois naturel','#b98b5a'],ipe:['Bois exotique foncé','#7a4b33'],bleu:['Bleu-gris (pierre bleue)','#5f6b73'],beige:['Beige','#d6c7ad']};
const DSENS={perp:'Perpendiculaire à la maison (l’eau suit les rainures)',para:'Parallèle à la maison',d45:'En diagonale (45°)',free:'Angle libre'};
const DPAT={decal:'Joints décalés (à l’anglaise)',aligne:'Joints alignés (par bandes)'};
const DSUB={beton:'Dalle de béton',gravier:'Gravier ou gravillons compactés',terre:'Terre (à préparer)'};
const SLABS={'60x60':[0.6,0.6],'40x80':[0.4,0.8],'80x80':[0.8,0.8],'45x90':[0.45,0.9],'100x100':[1,1]};
const DPLOT=[[0,2,'cales ou lambourdes posées à plat'],[2,4,'plots réglables de 20 à 40 mm'],[4,7,'plots réglables de 40 à 70 mm'],[7,12,'plots réglables de 70 à 120 mm'],[12,22,'plots réglables de 120 à 220 mm'],[22,35,'plots réglables de 220 à 350 mm']];
function deckDef(a){const o=a.opts||{},m=o.mat,sub=o.base==='slab'?'beton':o.base==='stab'?'gravier':'terre';
  const fmt0={paves:'22x11',pnat:'15x15',dalle:'60x40',pierre:'60x60',ceram:'60x60'}[m]||'60x60',D={bl:m==='bois'?4.2:3.6,bw:m==='bois'?14.5:14,gap:5,col:m==='composite'?'gris':m==='exo'?'ipe':m==='pierre'?'bleu':m==='ceram'?'gris':m==='dalle'?'beige':m==='paves'?'nuance':m==='pnat'?'gris':'naturel',sens:SLAB.includes(m)?'para':'perp',ang:30,pat:'decal',start:'house',rive:1,onglet:1,sub,H:12,fmt:fmt0,lay:m==='paves'||m==='pnat'?'demi':'droit',joint:m==='pnat'?10:m==='pierre'?8:3,bord:1,...(o.deck||{})};
  if(SLAB.includes(m)&&!(PFMT[m]||{})[D.fmt])D.fmt=fmt0;if(SLAB.includes(m)&&!layOk(D.fmt,D.lay))D.lay=D.fmt==='opus'?'opus':'droit';return D}
function frameOf(a){const c=cen(a.pts),mp=mPer(c[0]),XY=p=>[(p[1]-c[1])*mp,(p[0]-c[0])*111320],P=a.pts.map(XY);let phi=null,hb=null,best=1e9;
  S.shapes.filter(s=>s.kind==='obsPoly'&&s.nat!=='caduc'&&s.nat!=='haie').forEach(s=>{const Q=s.pts.map(XY);Q.forEach((q,i)=>{const r=Q[(i+1)%Q.length],vx=r[0]-q[0],vy=r[1]-q[1],L2=vx*vx+vy*vy,t=L2?Math.max(0,Math.min(1,-(q[0]*vx+q[1]*vy)/L2)):0,d=Math.hypot(q[0]+vx*t,q[1]+vy*t);if(d<best){best=d;phi=Math.atan2(vy,vx);hb=cen(Q)}})});
  if(a.kind==='allee'){phi=null;best=1e9}
  if(phi==null||best>12){let bl=0;P.forEach((p,i)=>{const q=P[(i+1)%P.length],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(l>bl){bl=l;phi=Math.atan2(q[1]-p[1],q[0]-p[0])}});hb=null}
  return{c,mp,P,phi,hb}}
function segsAt(Q,v,iu,iv){const xs=[];for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length];if((a[iv]<=v&&b[iv]>v)||(b[iv]<=v&&a[iv]>v))xs.push(a[iu]+(v-a[iv])*(b[iu]-a[iu])/(b[iv]-a[iv]))}xs.sort((x,y)=>x-y);const out=[];for(let i=0;i+1<xs.length;i+=2)out.push([xs[i],xs[i+1]]);return out}
function deckCalc(a){const o={...ADEF('terrasse'),...(a.opts||{})},d=deckDef(a),F=frameOf(a),m=o.mat,plank=PLANK.includes(m),slab=SLAB.includes(m);if(!plank&&!slab)return null;
  let th=F.phi+(d.sens==='perp'?Math.PI/2:d.sens==='d45'?Math.PI/4:d.sens==='free'?(+d.ang||0)*Math.PI/180:0);if(slab)th=F.phi;
  const ct=Math.cos(th),st=Math.sin(th),UV=([x,y])=>[x*ct+y*st,-x*st+y*ct],XY=([u,v])=>[u*ct-v*st,u*st+v*ct],Q=F.P.map(UV),us=Q.map(p=>p[0]),vs=Q.map(p=>p[1]),u0=Math.min(...us),u1=Math.max(...us),v0=Math.min(...vs),v1=Math.max(...vs);
  const H=F.hb?UV(F.hb):[u0-1,v0-1],hv=H[1]<(v0+v1)/2?'min':'max',hu=H[0]<(u0+u1)/2?'min':'max',fromH=d.start==='house',A=areaLL(a.pts),per=lenLL([...a.pts,a.pts[0]]),rows=[],items=[],joists=[],plots=[],seams=[];
  const ex=F.hb?(()=>{const hp=UV(F.hb);let mx=0;Q.forEach(p=>{const dd=Math.abs(p[1]-(hv==='min'?v0:v1));mx=Math.max(mx,dd)});return mx})():v1-v0;
  if(plank){const p=(d.bw/100)+(d.gap/1000),n=Math.max(1,Math.ceil((v1-v0)/p)),start=fromH?(hv==='min'?v0:v1-n*p):(hv==='min'?v1-n*p:v0);let Lb=0;
    for(let i=0;i<n;i++){const va=start+i*p,vm=va+p/2,sg=segsAt(Q,vm,0,1);sg.forEach(([a1,a2])=>{Lb+=a2-a1;const off=d.pat==='decal'?(i%3)*d.bl/3:0,base=fromH===(hu==='min')?a1:a2;const ends=[];for(let k=-3;k<200;k++){const uu=fromH===(hu==='min')?base+off+k*d.bl:base-off-k*d.bl;if(uu>a1+0.05&&uu<a2-0.05)ends.push(uu);if(k*d.bl>a2-a1+d.bl)break}rows.push({v:[va,va+d.bw/100],u:[a1,a2],ends})})}
    const e=(m==='composite'?0.4:0.5)*(d.sens==='d45'||d.sens==='free'?0.75:1),spl=m==='composite'?0.5:0.6;let Lj=0,np=0;
    for(let u=u0+0.05;u<=u1-0.04;u+=e){segsAt(Q,u,1,0).forEach(([b1,b2])=>{const l=b2-b1;if(l<0.1)return;Lj+=l;joists.push({u,v:[b1,b2]});const k=Math.max(2,Math.ceil(l/spl)+1);for(let j=0;j<k;j++)plots.push([u,b1+(l)*j/(k-1)]);np+=k})}
    const xj=(d.pat==='decal'?0.15:0.1)+(d.rive?per*0.5/Math.max(Lj,1):0),Ljt=Lj*(1+xj),w=d.pat==='decal'?0.07:0.05,wa=d.sens==='d45'||d.sens==='free'?0.06:0,nb=Math.ceil(Lb*(1+w+wa)/d.bl),nr=d.rive?Math.ceil(per*1.1/d.bl):0,cross=Math.ceil(Lb/e*1.05);
    items.push(['Lames',`${nb} lames de ${nf(d.bl,1)} m`,`${nf(d.bw,1)} cm de large, ${DCOL[d.col]?DCOL[d.col][0].toLowerCase():''} ; ${nf(Lb,0)} m linéaires + ${Math.round((w+wa)*100)} % de chutes`]);
    if(nr)items.push(['Lames de rive (bordure)',`${nr} lames de ${nf(d.bl,1)} m`,`${nf(per,1)} m de périmètre${d.onglet?', angles coupés en onglet (45°)':''}`]);
    items.push(['Lambourdes',`${Math.ceil(Ljt/4)} de 4 m`,`${nf(Ljt,0)} m, entraxe ${Math.round(e*100)} cm${d.pat==='decal'?' ; doublez la lambourde sous chaque about de lame':''}`]);
    const hp=d.H-(m==='composite'?2.3:2.1)-4.5,drop=Math.max(0,ex)*0.01*100,rg_=DPLOT.find(r=>hp>=r[0]&&hp<r[1]),rgLo=DPLOT.find(r=>hp-drop>=r[0]&&hp-drop<r[1]);
    items.push([hp<2?'Cales de calage':'Plots',`${np}`,hp<2?'Lambourdes posées sur cales ou bandes de caoutchouc':`${rg_?rg_[2]:hp>=35?'hauteur trop grande pour des plots : structure sur pilotis à faire étudier':'plots réglables'}${rgLo&&rg_&&rgLo!==rg_?` côté maison, ${rgLo[2].replace('plots réglables ','')} côté jardin`:''} (≈ ${nf(Math.max(0,hp),1)} cm contre la maison, ${nf(Math.max(0,hp-drop),1)} cm au bout, pour une pente de 1 %)`]);
    items.push([m==='composite'?'Clips de fixation':'Vis inox',m==='composite'?`${cross}`:`${cross*2}`,m==='composite'?'un clip à chaque croisement lame-lambourde, plus les clips de départ':'deux vis par croisement lame-lambourde, avant-trou conseillé']);
    items.push(['Vis lambourde-plot',`${np}`,'une par plot']);
    if(d.sub!=='beton'){items.push(['Géotextile',`${nf(A*1.1,0)} m²`,'contre les mauvaises herbes']);items.push(['Dalles d’appui sous plots',`${np}`,'dalle béton ou pavé de 30 × 30 cm sur sol compacté']);if(d.sub==='terre')items.push(['Gravier ou empierrement compacté',`${nf(A*0.1,1)} m³`,'10 cm sous la terrasse'])}
    return{mode:'plank',d,F,th,XY,Q,rows,joists,plots,items,A,per,u:[u0,u1],v:[v0,v1],L:Lb,e,hp,drop}}
  const lay=d.lay,rot=lay==='diag'||lay==='chevron45'?Math.PI/4:0,cr=Math.cos(th+rot),sr=Math.sin(th+rot),PF=([x,y])=>[x*cr+y*sr,-x*sr+y*cr],FP=([u,v])=>[u*cr-v*sr,u*sr+v*cr],Qp=F.P.map(PF),pu=Qp.map(p=>p[0]),pv=Qp.map(p=>p[1]);
  const jj=(+d.joint||3)/1000,onPlots=m==='ceram'||(d.sub==='beton'&&(m==='dalle'||m==='pierre')&&o.base==='slab'&&false);
  const Hq=F.hb?PF(F.hb):null,sx=Hq&&Hq[0]>(Math.min(...pu)+Math.max(...pu))/2?-1:1,sy=Hq&&Hq[1]>(Math.min(...pv)+Math.max(...pv))/2?-1:1,fH=d.start==='house';
  const ox=fH?(sx>0?Math.min(...pu):Math.max(...pu)):(sx>0?Math.max(...pu):Math.min(...pu)),oy=fH?(sy>0?Math.min(...pv):Math.max(...pv)):(sy>0?Math.max(...pv):Math.min(...pv));
  const Ql=Qp.map(([u,v])=>[(u-ox)*sx,(v-oy)*sy]),bx=[Math.min(...Ql.map(p=>p[0])),Math.min(...Ql.map(p=>p[1])),Math.max(...Ql.map(p=>p[0])),Math.max(...Ql.map(p=>p[1]))];
  const ins=p=>{let c=false;for(let i=0,k=Ql.length-1;i<Ql.length;k=i++){const a1=Ql[i],b1=Ql[k];if((a1[1]>p[1])!==(b1[1]>p[1])&&p[0]<(b1[0]-a1[0])*(p[1]-a1[1])/(b1[1]-a1[1])+a1[0])c=!c}return c};
  const U=layUnits(lay,d.fmt,jj,bx),cells=[],cnt=new Map();let full=0,cut=0;
  U.forEach(([x,y,w,h])=>{if(x>bx[2]||y>bx[3]||x+w<bx[0]||y+h<bx[1])return;const cs=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],k=cs.filter(ins).length+(ins([x+w/2,y+h/2])?1:0),vin=k===0&&Ql.some(p=>p[0]>x&&p[0]<x+w&&p[1]>y&&p[1]<y+h);if(!k&&!vin)return;k===5?full++:cut++;cells.push({c:cs,f:k===5});const key=lay==='opus'?`${Math.round(Math.max(w,h)*100+3)}×${Math.round(Math.min(w,h)*100+3)}`:'';cnt.set(key,(cnt.get(key)||0)+1)});
  const toXY=([x,y])=>FP([x*sx+ox,y*sy+oy]),w0=PWASTE[lay]||0.06;
  if(lay==='opus'){const mods=Math.ceil(A*(1+w0)/1.0);items.push(['Dalles opus',`${mods} modules de 1 m²`,`soit ${mods} dalles de 60 × 60, ${mods*2} de 60 × 40 et ${mods} de 40 × 40 ; ${cut} dalles à découper environ`])}
  else{const[L,W]=fmtLW(d.fmt),n=Math.ceil(A/((L+jj)*(W+jj))*(1+w0)),pm2=1/((L+jj)*(W+jj));items.push([m==='paves'||m==='pnat'?'Pavés':'Dalles',`${n} pièces de ${String(d.fmt).replace('x',' × ')} cm`,`≈ ${nf(pm2,1)} au m², + ${Math.round(w0*100)} % de chutes pour « ${PLAY[lay].toLowerCase()} » ; ${cut} pièces à découper environ ; ${DCOL[d.col]?DCOL[d.col][0].toLowerCase():''}`])}
  const car=a.kind==='allee'&&o.use==='voiture',nb=nearBld(a),hl=nb&&nb.d<=1.5&&a.kind==='terrasse'?houseEdgeLen(a):0,bl=Math.max(0,per-hl);
  if(onPlots){const nodes=new Set();cells.forEach(c=>c.c.forEach(q=>nodes.add(q.map(z=>z.toFixed(2)).join(','))));const hp=d.H-2,rg_=DPLOT.find(r=>hp>=r[0]&&hp<r[1]);items.push(['Plots',`${nodes.size}`,`un plot à chaque angle de dalle, ${rg_?rg_[2]:'hauteur à étudier'}`],['Têtes de plot et croisillons',`${nodes.size}`,`joint de ${Math.round(jj*1000)} mm`]);if(d.sub!=='beton')items.push(['Géotextile',`${nf(A*1.1,0)} m²`,'contre les mauvaises herbes'])}
  else{if(d.bord&&bl>0.5)items.push(['Bordures',`${Math.ceil(bl)} pièces de 1 m`,`${nf(bl,1)} m${hl?' (sans le côté maison)':''}, posées sur ${nf(bl*0.04,2)} m³ de béton maigre`]);
    if(o.base==='new'||o.base==='old')items.push(['Empierrement 0/32',`${nf(A*(car?0.25:0.18),1)} m³`,`${car?'25':'15 à 20'} cm compactés à la plaque vibrante`],['Géotextile',`${nf(A*1.1,0)} m²`,'sous l’empierrement']);else if(o.base==='stab')items.push(['Empierrement d’appoint',`${nf(A*0.03,1)} m³`,'pour reprofiler']);
    if(o.base==='slab'&&m!=='paves'&&m!=='pnat')items.push(['Mortier-colle drainant',`${nf(A*1.1,0)} m²`,'pose collée sur la dalle existante']);else items.push([m==='paves'||m==='pnat'?'Sable de pose':'Sable stabilisé ou mortier drainant',`${nf(A*0.04,1)} m³`,'lit de pose de 3 à 5 cm']);
    items.push([m==='paves'||m==='pnat'?'Sable de jointoiement':'Mortier de joint ou sable polymère',`≈ ${nf(A*(jj>0.006?5:2),0)} kg`,`joints de ${Math.round(jj*1000)} mm`])}
  return{mode:'slab',d,F,th,XY:toXY,Q:Ql,cells,lay,items,A,per,toXY}}
function drawDeck(cv,a){const R=deckCalc(a);if(!R||!cv)return;const W=cv.width=cv.clientWidth?Math.round(cv.clientWidth*1.5):900,F=R.F,toW=([x,y])=>[x,y];
  const allXY=[...F.P],B=window.__dzNoH?[]:S.shapes.filter(s=>s.kind==='obsPoly').map(s=>s.pts.map(p=>[(p[1]-F.c[1])*F.mp,(p[0]-F.c[0])*111320])).filter(Q=>Q.some(q=>Math.hypot(q[0],q[1])<25));/* cadrage : la terrasse et ses abords immédiats seulement */
  const xs=allXY.map(p=>p[0]),ys=allXY.map(p=>p[1]),mg=Math.max(1.5,0.2*Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))),x0=Math.min(...xs)-mg,x1=Math.max(...xs)+mg,y0=Math.min(...ys)-mg,y1=Math.max(...ys)+mg,sc=Math.min(W/(x1-x0),W*0.8/(y1-y0)),Hh=cv.height=Math.round((y1-y0)*sc)+60;
  const g=cv.getContext('2d'),X=([x,y])=>[(x-x0)*sc,(y1-y)*sc],XU=uv=>X(R.XY(uv));g.fillStyle='#fff';g.fillRect(0,0,W,Hh);
  B.forEach(Q=>{g.beginPath();Q.forEach((q,i)=>{const p=X(q);i?g.lineTo(...p):g.moveTo(...p)});g.closePath();g.fillStyle='#e7e2dc';g.fill();g.strokeStyle='#8d8580';g.lineWidth=2;g.stroke()});
  const col=(DCOL[R.d.col]||DCOL.gris)[1];g.save();g.beginPath();F.P.forEach((q,i)=>{const p=X(q);i?g.lineTo(...p):g.moveTo(...p)});g.closePath();g.fillStyle=col;g.fill();g.clip();
  if(R.mode==='plank'){g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;R.rows.forEach(r=>{[r.v[0],r.v[1]].forEach(v=>{g.beginPath();g.moveTo(...XU([r.u[0],v]));g.lineTo(...XU([r.u[1],v]));g.stroke()});r.ends.forEach(u=>{g.beginPath();g.moveTo(...XU([u,r.v[0]]));g.lineTo(...XU([u,r.v[1]]));g.stroke()})});
    g.setLineDash([4,4]);g.strokeStyle='rgba(200,40,40,.55)';R.joists.forEach(j=>{g.beginPath();g.moveTo(...XU([j.u,j.v[0]]));g.lineTo(...XU([j.u,j.v[1]]));g.stroke()});g.setLineDash([]);g.fillStyle='rgba(200,40,40,.8)';R.plots.forEach(p=>{const q=XU(p);g.beginPath();g.arc(q[0],q[1],Math.max(1.5,sc*0.04),0,7);g.fill()})}
  else{g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=R.cells.length>1500?0.6:1;R.cells.forEach((c,i)=>{g.beginPath();c.c.forEach((q,k)=>{const p=X(R.toXY(q));k?g.lineTo(...p):g.moveTo(...p)});g.closePath();if(i%7===3){g.fillStyle='rgba(0,0,0,.06)';g.fill()}g.stroke()})}
  g.restore();g.beginPath();F.P.forEach((q,i)=>{const p=X(q);i?g.lineTo(...p):g.moveTo(...p)});g.closePath();g.strokeStyle='#222';g.lineWidth=2;g.stroke();
  const fs=Math.max(12,Math.round(W/60));g.font=`${fs}px sans-serif`;g.fillStyle='#222';g.textAlign='center';g.textBaseline='middle';
  F.P.forEach((p,i)=>{const q=F.P[(i+1)%F.P.length],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(l<0.6)return;const m=X([(p[0]+q[0])/2,(p[1]+q[1])/2]),cc=X([0,0]),dx=m[0]-cc[0],dy=m[1]-cc[1],dn=Math.hypot(dx,dy)||1,t=`${nf(l,2)} m`;const px=m[0]+dx/dn*fs*1.1,py=m[1]+dy/dn*fs*1.1;g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.9)';g.strokeText(t,px,py);g.fillText(t,px,py)});
  const by=Hh-24,bar=[1,2,5].find(v=>v*sc>W*0.12)||5;g.fillRect(16,by,bar*sc,5);g.textAlign='left';g.fillText(`${bar} m`,22+bar*sc,by+3);g.beginPath();g.moveTo(W-30,by+10);g.lineTo(W-22,by-16);g.lineTo(W-14,by+10);g.closePath();g.fill();g.fillText('N',W-28,by-26);
  g.font=`${Math.round(fs*0.85)}px sans-serif`;g.fillStyle='#b71c1c';g.fillText(R.mode==='plank'?'— — lambourdes   ● plots':PLAY[R.lay]||'',W*0.35,by+3);return cv}
function deckPng(a,W){try{const cv=document.createElement('canvas');cv.style.width=(W||1200)+'px';Object.defineProperty(cv,'clientWidth',{value:(W||1200)/1.5});drawDeck(cv,a);return{data:cv.toDataURL('image/png'),w:Math.round(cv.width/2),h:Math.round(cv.height/2)}}catch(e){return null}}
function deckHtml(a){const R=deckCalc(a);if(!R)return'';const d=R.d,m=(a.opts||{}).mat,dsel=(k,v,opts)=>`<select data-ad="${k}">${opts.map(([x,l])=>`<option value="${x}"${String(x)===String(v)?' selected':''}>${esc(l)}</option>`).join('')}</select>`,cols=Object.entries(DCOL).filter(([k])=>R.mode==='plank'?!['bleu','beige','rouge','nuance'].includes(k):!['teck','naturel','ipe'].includes(k)).map(([k,v])=>[k,v[0]]);
  const f=R.mode==='plank'?`<label>Longueur des lames${dsel('bl',d.bl,[[2.2,'2,20 m'],[2.4,'2,40 m'],[3,'3,00 m'],[3.6,'3,60 m'],[4,'4,00 m'],[4.2,'4,20 m'],[4.8,'4,80 m']])}</label><label>Largeur (cm)${dsel('bw',d.bw,[[9,'9 cm'],[12,'12 cm'],[14,'14 cm'],[14.5,'14,5 cm'],[19,'19 cm']])}</label><label>Espacement (mm)<input type="number" data-ad="gap" min="2" max="10" step="1" value="${d.gap}"></label><label>Couleur${dsel('col',d.col,cols)}</label><label>Sens de pose${dsel('sens',d.sens,Object.entries(DSENS))}</label>${d.sens==='free'?`<label>Angle par rapport à la maison (°)<input type="number" data-ad="ang" min="-90" max="90" step="5" value="${d.ang}"></label>`:''}<label>Schéma de pose${dsel('pat',d.pat,Object.entries(DPAT))}</label><label>Départ des lames${dsel('start',d.start,[['house','Depuis la maison'],['far','Depuis le jardin']])}</label><label class="ck"><input type="checkbox" data-ad="rive"${d.rive?' checked':''}> Lames de rive en bordure</label>${d.rive?`<label class="ck"><input type="checkbox" data-ad="onglet"${d.onglet?' checked':''}> Coupes d’onglet aux angles</label>`:''}`
   :`<label>Format${dsel('fmt',d.fmt,Object.entries(PFMT[m]||PFMT.dalle))}</label><label>Calepinage${dsel('lay',d.lay,Object.entries(PLAY).filter(([k])=>layOk(d.fmt,k)))}</label><label>Joint (mm)<input type="number" data-ad="joint" min="2" max="20" step="1" value="${d.joint}"></label><label>Couleur${dsel('col',d.col,cols)}</label><label>Départ de la pose${dsel('start',d.start,[['house',a.kind==='allee'?'Pièces entières au début de l’allée':'Pièces entières contre la maison'],['far',a.kind==='allee'?'Pièces entières à la fin':'Pièces entières côté jardin']])}</label>${m!=='ceram'?`<label class="ck"><input type="checkbox" data-ad="bord"${d.bord?' checked':''}> Bordures</label>`:''}`;
  return `<details class="deck" open><summary><b>Plan de pose et liste de matériel</b></summary><div class="frow">${f}${R.mode==='plank'||m==='ceram'?`<label>Support${dsel('sub',d.sub,Object.entries(DSUB))}</label><label>Hauteur finie au-dessus du support (cm)<input type="number" data-ad="H" min="3" max="80" step="1" value="${d.H}"></label>`:''}</div>
   <canvas class="deckcv" data-deck="${a.id}" style="width:100%;max-width:720px;display:block;border:1px solid var(--line);border-radius:10px;background:#fff"></canvas>
   <table class="stack"><thead><tr><th>Article</th><th>Quantité</th><th>Détail</th></tr></thead><tbody>${R.items.map(r=>`<tr><td>${esc(r[0])}</td><td><b>${esc(r[1])}</b></td><td class="small">${esc(r[2])}</td></tr>`).join('')}</tbody></table>
   <p class="small">${R.mode==='plank'?`Lames posées ${d.sens==='perp'?'perpendiculairement à la façade : l’eau s’évacue dans le sens des rainures, vers le jardin':d.sens==='para'?'parallèlement à la façade':'en biais : plus de coupes et un entraxe de lambourdes réduit'}. Vérifiez l’entraxe, l’espacement et la fixation dans la notice du fabricant des lames.`:`Calepinage ${a.kind==='allee'?'aligné sur l’axe de l’allée':'aligné sur la façade la plus proche'}. Quantités avec ${Math.round((PWASTE[R.lay]||0.06)*100)} % de chutes et de casse ; les motifs en chevrons ou en diagonale demandent plus de coupes. Demandez une palette entière pour garder la même teinte partout.`} Pour un rendu réaliste, utilisez l’onglet « Rendus sur photo ».</p></details>`}
function drawDecks(){document.querySelectorAll('canvas.deckcv').forEach(cv=>{const a=S.amen.find(x=>String(x.id)===cv.dataset.deck);if(a)try{drawDeck(cv,a)}catch(e){console.warn('deck',e)}})}
/* création d’une terrasse sur mesure (rectangle, L, T, U) */
const TSHAPE={rect:'Rectangle',L:'En L',T:'En T',U:'En U'};
function tShapePts(k,A,B,a,b){if(k==='L')return[[-A/2,0],[A/2,0],[A/2,B-b],[A/2-a,B-b],[A/2-a,B],[-A/2,B]];if(k==='T'){const s=Math.min(a,A);return[[-A/2,0],[A/2,0],[A/2,b],[s/2,b],[s/2,B],[-s/2,B],[-s/2,b],[-A/2,b]]}
  if(k==='U'){const w=Math.min(a,A-0.6),arm=(A-w)/2;return[[-A/2,0],[A/2,0],[A/2,B],[A/2-arm,B],[A/2-arm,B-b],[-A/2+arm,B-b],[-A/2+arm,B],[-A/2,B]]}return[[-A/2,0],[A/2,0],[A/2,B],[-A/2,B]]}
function placeTerrace(k,A,B,a,b,where){if(S.lat==null){toast('Placez d’abord votre terrain sur la carte.');return}const c0=[S.lat,S.lon],mp=mPer(c0[0]),XY=p=>[(p[1]-c0[1])*mp,(p[0]-c0[0])*111320],LL=([x,y])=>[c0[0]+y/111320,c0[1]+x/mp];
  let O=[0,0],u=[1,0],v=[0,1],off=-B/2;const Bs=S.shapes.filter(s=>s.kind==='obsPoly'&&s.nat!=='caduc'&&s.nat!=='haie').sort((x,y)=>areaLL(y.pts)-areaLL(x.pts));
  if(where==='house'&&Bs.length){const Q=Bs[0].pts.map(XY),C=cen(Q);let best=-9;Q.forEach((p,i)=>{const q=Q[(i+1)%Q.length],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(l<1)return;const t=[(q[0]-p[0])/l,(q[1]-p[1])/l];let nrm=[t[1],-t[0]];const mid=[(p[0]+q[0])/2,(p[1]+q[1])/2];if((mid[0]-C[0])*nrm[0]+(mid[1]-C[1])*nrm[1]<0)nrm=[-nrm[0],-nrm[1]];const sc=-nrm[1]+Math.min(1,l/A)*0.3;if(sc>best){best=sc;O=mid;u=t;v=nrm}});off=0.02}
  else if(where==='house')toast('Aucun bâtiment dessiné : la terrasse est placée au point d’étude. Dessinez la maison dans « 1. L’existant » pour la coller à la façade.');
  const pts=tShapePts(k,A,B,a,b).map(([x,y])=>LL([O[0]+u[0]*x+v[0]*(y+off),O[1]+u[1]*x+v[1]*(y+off)]));pushUndo();const id=++itemId,o=ADEF('terrasse'),E=S.env||{};if(E.f_terr&&E.f_terr!=='auto'&&AMAT[E.f_terr])o.mat=E.f_terr;if(E.diy==='me')o.who='diy';
  S.amen.push({id,pts,kind:'terrasse',opts:o});initGeom(id);setWant('terrasse',true);itemsChanged(false);renderFonc();saveNow(true);toast(`Terrasse ${TSHAPE[k].toLowerCase()} de ${nf(areaLL(pts))} m² ajoutée sur la carte. Pour la déplacer : « Éléments sur la carte » → la terrasse → « Modifier la forme ».`)}
function tplHtml(){const T=S.tpl||(S.tpl={k:'rect',A:5,B:4,a:2,b:2,w:'house'}),n=(k,l,st)=>`<label>${l}<input type="number" data-tp="${k}" min="0.5" max="40" step="${st||0.1}" value="${T[k]}"></label>`;
  return `<details class="card tplcard"><summary><b>Créer une terrasse sur mesure</b> <small>rectangle, en L, en T ou en U, avec ses dimensions</small></summary><div class="frow"><label>Forme<select data-tp="k">${Object.entries(TSHAPE).map(([k,l])=>`<option value="${k}"${k===T.k?' selected':''}>${l}</option>`).join('')}</select></label>${n('A','Longueur le long de la maison (m)')}${n('B','Profondeur (m)')}${T.k!=='rect'?n('a',T.k==='L'?'Largeur de l’encoche (m)':T.k==='T'?'Largeur de l’avancée (m)':'Largeur de l’ouverture (m)')+n('b',T.k==='L'?'Profondeur de l’encoche (m)':T.k==='T'?'Profondeur du bandeau (m)':'Profondeur de l’ouverture (m)'):''}<label>Emplacement<select data-tp="w"><option value="house"${T.w==='house'?' selected':''}>Contre la maison, côté le plus ensoleillé</option><option value="site"${T.w==='site'?' selected':''}>Au point d’étude</option></select></label></div><div class="chips"><button type="button" class="pri" id="tplGo">Créer la terrasse (${nf(Math.abs(areaPts(tShapePts(T.k,+T.A,+T.B,+T.a,+T.b))),1)} m²)</button></div><p class="small">Vous pouvez aussi la dessiner à la main sur la carte, ou partir d’un plan importé (onglet Carte, « Importer un plan »).</p></details>`}
function areaPts(P){let s=0;P.forEach((p,i)=>{const q=P[(i+1)%P.length];s+=p[0]*q[1]-q[0]*p[1]});return s/2}

/* budget, rapport, faire soi-même, liens, plan d’ensemble */
{const _bt23=budgetTotals;budgetTotals=function(L){const F=L.filter(x=>x.fix),N=L.filter(x=>!x.fix),T=_bt23(N);F.forEach(x=>{Object.assign(x,x.fix);T.diy=add2(T.diy,x.diy);T.pro=add2(T.pro,x.pro);T.hours+=x.hDiy;T.hpro+=x.hPro});return T}}
{const _bl23=budgetLines;budgetLines=function(){const L=_bl23();(S.amen||[]).forEach(a=>{const I=amenInfo(a,1),o=I.o;L.push({k:'fonc',t:aName(a),sup:I.supHT,vat:21,qtxt:`${nf(I.A)} m², ${a.kind==='piscine'?(PT[o.type]||PT.coque).l.toLowerCase():(AMAT[o.mat]||AMAT.gravier).l.toLowerCase()}${I.diyOk?'':' (pose par un professionnel)'}`,rent:I.rentHT,hDiy:I.hDiy,hPro:I.hPro,incl:!I.diyOk&&a.kind==='piscine',fix:{diy:I.diy,pro:I.pro,lab:I.lab}})});return L}}
{const _rb23=renderBudget;renderBudget=function(){_rb23();const tb=$('#budgetBox tbody');if(!tb)return;const L=budgetLines();L.forEach((x,i)=>{if(x.incl&&tb.rows[i]&&tb.rows[i].cells[4])tb.rows[i].cells[4].textContent='Compris dans le forfait'})}}
{const _vs23=v4Sections;v4Sections=function(){const o=_vs23();(S.amen||[]).forEach(a=>{const I=amenInfo(a),R=a.kind==='piscine'?poolRules(a,{A:I.A,deb:I.deb}):null;
  o.push({title:aName(a).toUpperCase(),intro:`${nf(I.A)} m². Fait par un professionnel : ${rg(I.pro)} TVAC${I.diyOk?` · moi-même : ${rg(I.diy)} TVAC`:''}.`,tables:[{h:'Choix et caractéristiques',head:['Point','Détail'],rows:I.tech,w:[4600,10238]},...(a.kind!=='piscine'&&deckCalc(a)?[{h:'Plan de pose : liste de matériel',head:['Article','Quantité','Détail'],rows:deckCalc(a).items,w:[3600,3600,7638]}]:[]),...(R&&R.rows.length?[{h:'Conditions de dispense de permis',head:['État','Condition'],rows:R.rows,w:[1400,13438]}]:[]),{h:'Budget indicatif (HTVA)',head:['Poste','Quantité','Prix'],rows:I.bud,w:[6000,4400,4438]}],bullets:[...I.warn,...I.tips.filter(Boolean),...I.steps],bh:'Points d’attention et étapes'})});
  const lp=lawpGet();if(lp&&S.amen.length){const s=o.find(x=>/^(TERRASSE|PISCINE|ALLÉE)/.test(x.title));if(s)s.bullets=[...s.bullets,`Règles de ${lp.commune} (recherche par IA du ${lp.date}, à confirmer auprès de la commune) :`,...lp.text.split(/\n+/).map(x=>x.replace(/^[-•*]\s*/,'').replace(/\*\*/g,'').trim()).filter(Boolean).slice(0,14),...(lp.sources.length?['Sources : '+lp.sources.slice(0,4).map(([u,t])=>`${t} (${u})`).join(' ; ')]:[])]}
  const bi=o.findIndex(x=>/^BUDGET/.test(x.title));if(bi>=0){const bs=o[bi],pn=new Set((S.amen||[]).filter(a=>a.kind==='piscine'&&!(PT[(a.opts||{}).type]||{}).diy).map(aName));if(bs.tables&&bs.tables[0])bs.tables[0].rows.forEach(r=>{if(pn.has(r[0]))r[3]='Compris dans le forfait'});o.push(o.splice(bi,1)[0])}return o}}
{const _cr23=collectReport;collectReport=async function(){const R=await _cr23();try{(S.amen||[]).filter(a=>a.kind!=='piscine'&&deckCalc(a)).forEach(a=>{const sec=(R.sections||[]).find(x=>x.title===aName(a).toUpperCase());const im=deckPng(a,1200);if(sec&&im){sec.pngs=[null,im];sec.planPng=im.data}})}catch(e){console.warn('deck',e)}return R}}
{const _v4h23=v4Sheets;v4Sheets=function(sh,buy){_v4h23(sh,buy);(S.amen||[]).forEach(a=>{if(a.kind==='piscine')return;const R=deckCalc(a);if(!R)return;R.items.forEach(r=>buy.push(['Matériau',r[0],'',r[1],'',`${aName(a)} — ${r[2]}`]))})}}
DIY.terrasse={t:'Terrasse',when:'D’avril à octobre, par temps sec, hors gel',dur:a=>`≈ ${nf(Math.round(a*1.4))} h pour ${nf(a)} m²`,lvl:'Moyen',tools:'Bêche, pelle, brouette, cordeau, niveau et règle ; mini-pelle et plaque vibrante en location',s:['Voir les étapes détaillées selon le matériau dans l’onglet « Terrasse, allées, piscine ».']};
DIY.allee={t:'Allée ou chemin',when:'Toute l’année hors gel, sol ressuyé',dur:a=>`≈ ${nf(Math.round(a*1))} h pour ${nf(a)} m²`,lvl:'Facile à moyen',tools:'Bêche, brouette, cordeau, plaque vibrante en location',s:['Voir les étapes détaillées selon le matériau dans l’onglet « Terrasse, allées, piscine ».']};
DIY.piscinekit={t:'Piscine en kit',when:'Printemps, sol ressuyé',dur:a=>`≈ ${nf(Math.round(24+a*1.5))} h`,lvl:'Difficile',tools:'Mini-pelle (location), niveau laser, bétonnière ; électricien pour le raccordement',s:['Voir les étapes dans l’onglet « Terrasse, allées, piscine ».']};
{const _dl23=diyList;diyList=function(){const L=_dl23();(S.amen||[]).forEach(a=>{const o={...ADEF(a.kind),...(a.opts||{})};if(a.kind==='piscine'){if(o.type==='kit')L.push(['piscinekit',Math.round(areaLL(a.pts))])}else if(!(AMAT[o.mat]||{}).nodiy)L.push([a.kind,Math.round(areaLL(a.pts))])});return L}}
{const _int23=interactions;interactions=function(){const L=_int23();(S.amen||[]).forEach(a=>{const I=amenInfo(a,1);
  if(a.kind==='piscine'){if(!amenLink(a))L.push({lvl:'tip',t:`${aName(a)} et circulation`,d:'Aucune terrasse ni allée ne touche le bassin : prévoyez une plage antidérapante et un chemin pour y aller à pied sec.'});
    S.ponds.forEach((p,i)=>{if(minD(geomPts('a',a),geomPts('pond',p))<3)L.push({lvl:'warn',t:`${aName(a)} et mare ${i+1}`,d:'Une mare naturelle juste à côté d’une piscine chlorée : les éclaboussures et l’eau de vidange nuisent à la faune. Gardez quelques mètres et ne videz jamais la piscine dans la mare.'})});
    S.potagers.forEach((p,i)=>{if(minD(geomPts('a',a),geomPts('v',p))<2)L.push({lvl:'tip',t:`${aName(a)} et potager ${i+1}`,d:'Le potager tout près du bassin : évitez les projections de terre et d’arrosage dans l’eau.'})})}
  if(a.kind!=='piscine'&&(AMAT[I.o.mat]||{}).perm<1){const z=nearZone(a,['pluie','noue'],15);if(z)L.push({lvl:'tip',t:`${aName(a)} et ${ZK[z.z.kind].l.toLowerCase()} ${zNum(z.z)}`,d:`À ${nf(z.d,1)} m : orientez la pente vers ${z.z.kind==='noue'?'la noue':'le jardin de pluie'} pour y infiltrer l’eau de pluie de ${a.kind==='terrasse'?'la terrasse':'l’allée'}.`})}
  if(a.kind==='terrasse'&&S.bed&&massifOn()&&minD(geomPts('a',a),geomPts('bed',S.bed))<0.5)L.push({lvl:'tip',t:`${aName(a)} et massif`,d:'Le massif borde la terrasse : placez les plantes parfumées et les graminées légères devant, les plus hautes au fond.'})});return L}}
{const _pi23=planItems;planItems=function(){const it=_pi23();(S.amen||[]).forEach(a=>it.push({pts:a.pts,col:AK[a.kind].c,closed:1,fill:a.kind==='piscine'?.55:.45,lw:2,lab:AK[a.kind].l,dash:a.kind==='allee'}));return it}}
{const _pl23=planLabels;planLabels=function(){const L_=_pl23();(S.amen||[]).forEach(a=>L_.push([aName(a),cen(a.pts)]));return L_}}
KLAB.amen='Terrasse, allée, piscine';
{const _pp23=proposeLayout;proposeLayout=function(){const keep=S.paths;S.paths=[...keep,...(S.amen||[]).map(a=>({pts:a.pts,nat:'chemin'}))];try{return _pp23()}finally{S.paths=keep}}}
{const _cp23=clearProject;clearProject=function(){S.amen=[];return _cp23()}}
{const _cd23=clearDrawings;clearDrawings=function(){S.amen=[];return _cd23()}}
{const _ser23=serialize;serialize=function(){const d=_ser23();d.set.cside=S.cside;return d}}
{const _rs23=restoreSettings;restoreSettings=function(t){_rs23(t);if(t&&t.cside)S.cside=t.cside;try{applyCside()}catch(e){}}}
window.__p23={deckCalc,placeTerrace,tShapePts,AMAT,PT,amenInfo,poolRules,altMats,renderFonc,FONC,sections:()=>v4Sections(),inter:()=>interactions(),budget:()=>budgetLines(),diy:()=>diyList(),plan:()=>planItems()};
applyCside();renderFonc();


/* ================= v24 : démolition et préparation du terrain (végétal et aménagements) ================= */
/* Prix 2026 en Belgique, HTVA (Trustup, abattage-et-elagage.be, Bobex, Goodcollect, Neocompare) : indicatifs et modifiables. */
S.demo=S.demo||[];LISTS.push('demo');EDIT_K.push(['demo',it=>it.geo==='area']);
const DT={arbre:{l:'Arbre à abattre',side:'veg',geo:'pt'},arbuste:{l:'Arbuste à arracher',side:'veg',geo:'pt'},souche:{l:'Souche à rogner',side:'veg',geo:'pt'},
 haie:{l:'Haie à arracher',side:'veg',geo:'line'},massif:{l:'Massif ou plantation à arracher',side:'veg',geo:'area'},ronces:{l:'Ronces et broussailles à défricher',side:'veg',geo:'area'},pelouse:{l:'Pelouse à décaper',side:'veg',geo:'area'},
 terrasse:{l:'Terrasse ou dallage à enlever',side:'fonc',geo:'area'},allee:{l:'Allée, chemin ou parking à enlever',side:'fonc',geo:'area'},dalle:{l:'Dalle ou fondation en béton à démolir',side:'fonc',geo:'area'},
 abri:{l:'Abri de jardin ou annexe à démolir',side:'fonc',geo:'area'},mur:{l:'Mur ou muret à démolir',side:'fonc',geo:'line'},cloture:{l:'Clôture ou palissade à démonter',side:'fonc',geo:'line'}};
const DCOLR='#d32f2f';
PRICE0.rate=['Main-d’œuvre d’un jardinier','€/h HTVA',60,60];Object.assign(PRICE0,{macon:['Main-d’œuvre d’un maçon ou entrepreneur','€/h HTVA',75,75],dvert:['Évacuation des déchets verts','€/m³',60,60],brise:['Location brise-béton électrique','€/jour',50,90]});
{let sv={};try{sv=JSON.parse(localStorage.getItem('plantania:prices')||'{}')}catch(e){}if(!sv.rate){PRICE.rate=clone(PRICE0.rate)}else PRICE.rate[0]=PRICE0.rate[0];['macon','dvert','brise'].forEach(k=>{if(!PRICE[k])PRICE[k]=clone(PRICE0[k]);if(sv[k])PRICE[k][2]=+sv[k][0],PRICE[k][3]=+sv[k][1]})}
[['xv_sel','Arbre, haie ou massif existant à retirer (cliquer)','pt','Retirer','Cliquez sur un arbre, une haie ou un massif existant, ou sur la carte pour un arbre qui n’est pas dessiné'],
 ['xv_zone','Zone à défricher ou à décaper (forme)','area','Défricher','Cliquez le contour de la zone à défricher ou à décaper'],
 ['xf_sel','Élément existant à démolir (cliquer)','pt','Démolir','Cliquez sur une terrasse, une allée, un mur ou un bâtiment existant'],
 ['xf_zone','Zone à démolir (forme)','area','Zone à démolir','Cliquez le contour de la terrasse, de la dalle ou de l’abri à démolir'],
 ['xf_line','Mur ou clôture à démolir (ligne)','line','Mur à démolir','Cliquez le début du mur ou de la clôture, ses angles, puis la fin']].forEach(([k,t,g,sh,dt])=>{TC[k]=DCOLR;SHORT[k]=sh;DRAWTXT[k]=dt;HINT[k]=t+' : '+dt.toLowerCase()+'.';if(g==='area')SHAPE_MODES[k]=3;if(g==='line')SHAPE_MODES[k]=2});
{let i=-1;TOOLS.forEach((t,j)=>{if(/^a_/.test(t[0]))i=j});TOOLS.splice(i+1,0,['g','Démolition et préparation'],['xv_sel','Arbre, haie ou massif existant à retirer (cliquer)','pt'],['xv_zone','Zone à défricher ou à décaper (forme)','area'],['xf_sel','Élément existant à démolir (cliquer)','pt'],['xf_zone','Zone à démolir (forme)','area'],['xf_line','Mur ou clôture à démolir (ligne)','line'])}
FONC.push('xf_sel','xf_zone','xf_line');rebuildToolLists();
['xv_sel','xv_zone','xf_sel','xf_zone','xf_line'].forEach(k=>{LEGK[k]=()=>S.demo.some(d=>(d.side==='veg')===(k[1]==='v')&&(k.endsWith('sel')?!!d.ref||d.geo==='pt':k.endsWith('zone')?d.geo==='area'&&!d.ref:d.geo==='line'&&!d.ref))});
const dNum=d=>S.demo.indexOf(d)+1;
const dName=d=>`${(DT[d.type]||DT.massif).l} (${dNum(d)})`;
function refItem(d){if(!d.ref)return null;const L_=S[d.ref.k]||[];return L_.find(x=>String(x.id)===String(d.ref.id))||null}
function dGeom(d){const r=refItem(d);if(r){if(d.ref.k==='obs')return[[r.lat,r.lng]];return r.pts}return d.pts}
function dDef(type,r){const o={who:'pro',acc:'facile',souche:'rogner',bois:'place',h:type==='arbre'?(r&&r.h)||10:type==='haie'?(r&&r.h)||2:type==='mur'?(r&&r.h)||1.2:2,ep:20,thick:12,circ:0,amiante:0,keepShade:0};if(type==='arbuste')o.who='diy';return o}
function demoTypeFor(kind,it,side){if(kind==='obs'){return it.type==='bat'?'abri':it.type==='haie'?'haie':it.type==='arbu'?'arbuste':'arbre'}
  if(kind==='shapes'){if(it.kind==='obsLine')return it.nat==='mur'?'mur':'haie';return it.nat==='bat'?'abri':it.nat==='mur'?'mur':it.nat==='arbu'?'massif':'haie'}
  if(kind==='paths')return it.nat==='terrasse'?'terrasse':'allee';return side==='veg'?'massif':'terrasse'}
function demoFromItem(kind,id,side){const exist=S.demo.find(d=>d.ref&&d.ref.k===kind&&String(d.ref.id)===String(id));if(exist){openEditor('demo',exist.id);return}
  if(!['obs','shapes','paths'].includes(kind)){if(kind==='demo'){openEditor('demo',id);return}toast('C’est un élément de votre nouvel aménagement : supprimez-le avec la gomme si vous n’en voulez plus.');return}
  const it=(S[kind]||[]).find(x=>String(x.id)===String(id));if(!it)return;pushUndo();const type=demoTypeFor(kind,it,side),geo=kind==='obs'?'pt':(kind==='shapes'&&it.kind==='obsLine')?'line':'area',pts=kind==='obs'?[[it.lat,it.lng]]:it.pts.map(p=>p.slice());
  const d={id:++itemId,side:DT[type].side,type,geo,pts,raw:pts.map(p=>p.slice()),ref:{k:kind,id:String(id)},opts:dDef(type,it)};S.demo.push(d);demoChanged();toast(`${DT[type].l} : ajouté à la démolition. Réglages dans l’onglet « Démolition ».`);openEditor('demo',d.id)}
function demoChanged(){S.samples=null;try{sunUpdate()}catch(e){}itemsChanged(false);renderDemo();saveNow(true)}
{const _ip24=itemPopup;itemPopup=function(ll,kind,id,label){if(S.mode==='xv_sel'||S.mode==='xf_sel'){demoFromItem(kind,id,S.mode[1]==='v'?'veg':'fonc');return}return _ip24(ll,kind,id,label)}}
{const _sc24=siteClick;siteClick=function(lat,lng){if(S.mode==='xv_sel'){pushUndo();const d={id:++itemId,side:'veg',type:'arbre',geo:'pt',pts:[[lat,lng]],raw:[[lat,lng]],ref:null,opts:dDef('arbre')};S.demo.push(d);demoChanged();toast('Arbre à abattre ajouté : précisez sa hauteur dans « Démolition ».');return}
  if(S.mode==='xf_sel'){$('#maphint').textContent='Cliquez sur un élément existant (terrasse, allée, mur, bâtiment), ou utilisez « Zone à démolir » pour ce qui n’est pas dessiné.';return}return _sc24(lat,lng)}}
{const _fs24=finishShape;finishShape=function(){const m=S.mode;if(m!=='xv_zone'&&m!=='xf_zone'&&m!=='xf_line')return _fs24();const need=SHAPE_MODES[m];if(S.drawPts.length<need){$('#maphint').textContent=`Il faut au moins ${need} points.`;return}pushUndo();
  const type=m==='xv_zone'?'massif':m==='xf_zone'?'terrasse':'mur',pts=S.drawPts.slice(),d={id:++itemId,side:DT[type].side,type,geo:DT[type].geo,pts,raw:pts.map(p=>p.slice()),ref:null,opts:dDef(type)};S.demo.push(d);setMode('site');demoChanged();drawHandles();toast(`${DT[type].l} ajouté(e). Changez le type dans l’onglet « Démolition » si besoin.`);if(typeof wizApply==='function')wizApply()}}
/* l’ombre des éléments démolis ne compte plus (situation après travaux) */
{const _oa24=obsAll;obsAll=function(){const dem=new Set((S.demo||[]).filter(d=>d.ref&&!(d.opts||{}).keepShade).map(d=>d.ref.k+':'+d.ref.id));if(!dem.size)return _oa24();
  if(!S.samples){const keep=S.shapes;S.shapes=keep.filter(s=>!dem.has('shapes:'+s.id));try{_oa24()}finally{S.shapes=keep}}const all=S._all||_oa24();return all.filter(o=>!(S.obs.includes(o)&&dem.has('obs:'+o.id)))}}
/* calcul */
function demoInfo(d){const o={...dDef(d.type),...(d.opts||{})},G=dGeom(d),r=refItem(d),warn=[],tips=[],steps=[],rows=[];let mk=null,rent=[0,0],h=0,gr=0,ve=0,te=0,diyOk=true,qt='';
  const A=d.geo==='area'&&G.length>2?areaLL(G):d.geo==='pt'&&r&&d.ref.k==='obs'&&d.type==='abri'?r.w*r.w*0.8:0,Ln=d.geo==='line'?lenLL(G):d.geo==='area'&&G.length>2?lenLL([...G,G[0]]):0,reg=regionKey(),veg=DT[d.type].side==='veg';
  switch(d.type){
   case 'arbre':{const H=+o.h||10,fac=o.acc!=='difficile',T=H<10?(fac?[150,450]:[300,700]):H<=20?(fac?[400,900]:[700,1500]):(fac?[800,1500]:[1500,4500]);mk=T.slice();qt=`hauteur ≈ ${nf(H,1)} m${o.circ?`, tour du tronc ${nf(o.circ)} cm`:''}`;
     if(o.souche==='rogner')mk=add2(mk,fac?[60,300]:[300,1200]);ve=o.bois==='evac'?0.12*H*H:0;h=H<=5?3+H:0;diyOk=H<=5;
     if(!diyOk)tips.push('Arbre de plus de 5 m : confiez l’abattage à un élagueur assuré. Il démonte l’arbre morceau par morceau si la place manque.');
     steps.push('Vérifier les règles (permis, période de nidification) et prévenir les voisins.','Abattage direct si la place le permet, sinon démontage par le haut (grimpeur ou nacelle).',o.souche==='rogner'?'Rogner la souche à la rogneuse sur 20 à 30 cm de profondeur ; les copeaux font un bon paillage.':'Laisser la souche : elle se décompose en quelques années (champignons, insectes).',o.bois==='evac'?'Évacuer le bois et les branches.':'Débiter le bois en bûches et broyer les branches sur place (paillage).');
     const nb=nearBld({pts:G});const circ=+o.circ||0;
     if(reg==='vla'){if(circ&&circ<100)tips.push('Flandre : tronc de moins de 1 m de tour à 1 m du sol : pas de permis d’urbanisme pour l’abattage lui-même (vérifiez le règlement communal).');else if(nb&&nb.d<15)tips.push(`Flandre : arbre à ${nf(nb.d,1)} m de la maison : en zone d’habitat, agricole ou industrielle, un arbre à moins de 15 m d’une habitation autorisée peut être abattu sans permis (vérifiez le règlement communal).`);else warn.push('Flandre : un arbre dont le tronc fait 1 m de tour ou plus à 1 m du sol demande en principe un permis d’environnement (omgevingsvergunning), sauf exceptions. Renseignez-vous auprès de la commune.')}
     else if(reg==='bxl'){if(H>=4&&(!circ||circ>=40))warn.push('Bruxelles : il faut un permis d’urbanisme pour abattre un arbre à haute tige (au moins 4 m de haut et 40 cm de tour de tronc à 1,50 m du sol), sauf s’il est mort.');warn.push('Bruxelles : abattage et élagage des arbres à haute tige interdits du 1er avril au 15 août.')}
     else tips.push('Wallonie : en général pas de permis dans un jardin, sauf arbre remarquable (liste sur le Géoportail de la Wallonie), zone d’espaces verts au plan de secteur, allée d’au moins 10 arbres ou bien classé. La commune peut avoir son propre règlement.');
     if(reg!=='bxl')tips.push('Période : évitez d’avril à mi-août (nidification) ; détruire un nid occupé est interdit. Le meilleur moment est d’octobre à février.');break}
   case 'arbuste':h=1.5;ve=0.8;qt='1 arbuste';steps.push('Couper les branches, dégager la motte à la bêche autour du pied.','Sectionner les grosses racines et basculer la souche ; reboucher avec de la terre.');break;
   case 'souche':{const fac=o.acc!=='difficile';mk=fac?[60,300]:[300,1200];h=3;qt='1 souche';steps.push('Rogner à la rogneuse (location ou entreprise) sur 20 à 30 cm, ou dessoucher à la pelle pour une petite souche.','Reboucher avec de la terre végétale ; les copeaux peuvent servir de paillage.');break}
   case 'haie':{const H=+o.h||2;h=Ln*0.6*(H>2?1.5:1);ve=Ln*H*0.4;qt=`${nf(Ln,1)} m, hauteur ≈ ${nf(H,1)} m`;steps.push('Couper les branches et les troncs au ras du sol.','Dessoucher (pioche, pelle ou mini-pelle) et retirer les racines principales.','Évacuer ou broyer les déchets verts, reboucher et niveler.');
     if(reg==='wal')tips.push('Wallonie : arracher une haie d’essences indigènes de 10 m ou plus d’un seul tenant demande un permis d’urbanisme, sauf pour créer un seul accès de moins de 2,5 m de large.');tips.push('Période : évitez d’avril à mi-août (oiseaux nicheurs).');if(Ln>15)rent=add2(rent,pr('minipelle',1));break}
   case 'massif':h=A*0.3;ve=A*0.15;qt=`${nf(A)} m²`;steps.push('Repérer les plantes à garder ou à donner (vivaces à diviser, arbustes à transplanter en automne).','Arracher le reste avec les racines, retirer les bâches et anciens paillages plastiques.','Évacuer les déchets verts ou les composter, ameublir le sol.');break;
   case 'ronces':h=A*0.1;ve=A*0.05;qt=`${nf(A)} m²`;steps.push('Débroussailler (débroussailleuse à lame, gants et lunettes).','Arracher les souches de ronces à la pioche ou à la fourche, sinon elles repartent.','Couvrir le sol (carton et paillage, ou semis) pour éviter la repousse.');break;
   case 'pelouse':h=A*0.25;te=A*0.08*1.3;qt=`${nf(A)} m², ≈ ${nf(te,1)} m³ de terre et de gazon`;steps.push('Décaper le gazon sur 5 à 8 cm (bêche plate, ou décapeuse à gazon en location au-delà de 50 m²).','Composter les plaques de gazon retournées, ou les évacuer avec les terres.','Niveler avant le nouvel aménagement.');if(A>80)rent=add2(rent,pr('minipelle',1));break;
   case 'terrasse':case 'allee':h=A*(d.type==='terrasse'?0.5:0.4);gr=A*0.12*1.5;qt=`${nf(A)} m²`;steps.push('Vérifier les câbles et conduites enterrés avant de casser.','Retirer le revêtement (dalles, pavés : souvent récupérables ou revendables).','Évacuer les gravats, garder l’empierrement s’il est sain : il peut servir de fondation au nouvel aménagement.');if(A>20)rent=add2(rent,pr('minipelle',1));break;
   case 'dalle':{const ep=(+o.thick||12)/100;h=A*1.2*(ep/0.12)**0.5;gr=A*ep*1.5;qt=`${nf(A)} m², ${nf(ep*100)} cm d’épaisseur (≈ ${nf(A*ep,1)} m³ de béton)`;rent=add2(rent,pr('brise',Math.max(1,Math.ceil(A/15))));steps.push('Vérifier les câbles et conduites enterrés (plans des impétrants) avant de casser.','Découper le béton en plaques (disqueuse) puis casser au brise-béton ; couper le treillis à la disqueuse.','Évacuer les gravats : béton propre, sans terre ni bois, c’est moins cher en centre de tri.');break}
   case 'mur':{const H=+o.h||1.2,ep=(+o.ep||20)/100,V=Ln*H*ep;h=Math.max(2,V*3);gr=V*2;qt=`${nf(Ln,1)} m × ${nf(H,1)} m, épaisseur ${nf(ep*100)} cm (≈ ${nf(V,1)} m³)`;steps.push('Vérifier que le mur n’est pas mitoyen (accord écrit du voisin) ni porteur ou de soutènement.','Démolir par le haut, rang par rang ; ne jamais saper le pied.','Trier briques et pierres (réemploi), évacuer le reste en gravats.');if(V>1)rent=add2(rent,pr('brise',Math.ceil(V)));
     tips.push('Mur de soutènement (il retient de la terre) : faites étudier la stabilité avant de le démolir.');break}
   case 'cloture':h=Math.max(1,Ln*0.25);gr=Ln*0.05;qt=`${nf(Ln,1)} m`;steps.push('Démonter les panneaux ou le grillage, puis les poteaux.','Casser ou extraire les plots de béton des poteaux, reboucher les trous.','Métal et bois traité au recyparc, dans les bons conteneurs.');tips.push('Clôture mitoyenne : il faut l’accord du voisin pour la retirer.');break;
   case 'abri':{const a=Math.max(A,4);h=a*1;gr=a*0.5;qt=`${nf(a,1)} m² au sol`;steps.push('Vider l’abri, couper l’électricité et l’eau si elles y arrivent.','Démonter la toiture puis les parois ; trier bois, métal, verre.','Casser la dalle si elle ne sert plus (voir « dalle à démolir »).');
     if(o.amiante){diyOk=false;warn.push('Plaques en fibrociment (amiante possible, matériau interdit en Belgique depuis 1998) : ne les cassez pas, ne les percez pas et ne les nettoyez pas au jet. Démontez-les entières, ou faites appel à une entreprise agréée (désamiantage sur devis). Les particuliers peuvent déposer l’amiante-ciment au recyparc sous conditions (emballage, quantité) : renseignez-vous auprès de l’intercommunale.')}
     else tips.push('Abri ancien en plaques ondulées grises ou en ardoises artificielles : de l’amiante est possible. Cochez « Plaques en fibrociment » pour les précautions.');
     if(reg==='wal')tips.push('Wallonie : la démolition d’un abri de jardin est dispensée de permis si les déchets sont évacués conformément à la législation.');break}}
  const rk=veg?'rate':'macon',rt=[PRICE[rk][2],PRICE[rk][3]],hPro=h/1.8,labor=[hPro*rt[0]*0.85,hPro*rt[1]*1.25],ev=[gr*30+ve*PRICE.dvert[2]+te*7,gr*50+ve*PRICE.dvert[3]+te*8];
  const pro=mk?add2(mk,[ve*PRICE.dvert[2],ve*PRICE.dvert[3]]):add2(add2(labor,rent),ev);
  if(gr)rows.push(['Gravats estimés',`${nf(gr,1)} m³ foisonnés`]);if(ve)rows.push(['Déchets verts estimés',`${nf(ve,1)} m³ (${nf(PRICE.dvert[2])} €/m³ à l’évacuation)`]);if(te)rows.push(['Terres et gazon',`${nf(te,1)} m³`]);
  if(!mk)rows.push(['Main-d’œuvre (professionnel)',`≈ ${nf(hPro,1)} h à ${nf(rt[0])}${rt[1]!==rt[0]?'–'+nf(rt[1]):''} €/h HTVA (${veg?'jardinier':'maçon ou entrepreneur'})`]);
  return{o,G,A,Ln,qt,pro,rent,h,hPro,gr,ve,te,diyOk,warn,tips,steps,rows,veg}}
function demoEvac(L_){let G=0,V=0,T=0;L_.forEach(([d,I])=>{if(!(I.o.who==='diy'&&I.diyOk))return;G+=I.gr;V+=I.ve;T+=I.te});const out=[];let diy=[0,0];
  if(G>0){if(G<=1.5){const n=Math.max(1,Math.ceil(G));out.push(['Gravats (moi-même)',`≈ ${nf(G,1)} m³ : ${n} big bag${n>1?'s':''} de 1 m³ et un enlèvement`]);diy=add2(diy,[n*10+50,n*20+150])}else{const n=Math.ceil(G/8);out.push(['Gravats (moi-même)',`≈ ${nf(G,1)} m³ : ${n} conteneur${n>1?'s':''} de 8 m³ pour une semaine`]);diy=add2(diy,[n*200,n*400])}}
  if(T>0){out.push(['Terres et gazon (moi-même)',`≈ ${nf(T,1)} m³ : à garder pour niveler, ou conteneur à terres`]);if(T>1.5)diy=add2(diy,[200,400])}
  if(V>0)out.push(['Déchets verts (moi-même)',`≈ ${nf(V,1)} m³ : broyage sur place (paillage), compost ou recyparc`]);
  const P=L_.filter(([d,I])=>!(I.o.who==='diy'&&I.diyOk)),pg=P.reduce((s,[d,I])=>s+I.gr,0),pv=P.reduce((s,[d,I])=>s+I.ve,0);if(pg||pv)out.push(['Évacuation par l’entreprise',`${pg?`≈ ${nf(pg,1)} m³ de gravats (30 à 50 €/m³)`:''}${pg&&pv?', ':''}${pv?`≈ ${nf(pv,1)} m³ de déchets verts (${nf(PRICE.dvert[2])} €/m³)`:''} : compris dans les prix ci-dessous`]);
  return{rows:out,pro:[0,0],diy,G,V,T}}
/* carte et liste */
{const _di24=drawItems;drawItems=function(){_di24();(S.demo||[]).forEach(d=>{const G=dGeom(d),lab=`✕ ${dName(d)}`;if(!G||!G.length)return;let l;
  if(d.geo==='pt'||G.length===1)l=L.marker(G[0],{icon:L.divIcon({className:'',html:'<span class="demox">✕</span>',iconSize:[22,22],iconAnchor:[11,11]})}).addTo(itemsLayer);
  else if(d.geo==='line')l=L.polyline(G,{color:DCOLR,weight:5,dashArray:'6 6'}).addTo(itemsLayer);else l=L.polygon(G,{color:DCOLR,weight:2,dashArray:'6 5',fillColor:DCOLR,fillOpacity:.15}).addTo(itemsLayer);
  l=hook(l,'demo',d.id,lab);if(l&&l.bindTooltip)l.bindTooltip(lab,{permanent:d.geo!=='pt',direction:'center',className:'maplbl'})});updateLegend()}}
{const _ril24=renderItemsList;renderItemsList=function(){_ril24();const el=$('#itemsList');if(!el||!(S.demo||[]).length)return;let ul=el.querySelector('ul');
  if(!ul){el.innerHTML='<ul></ul><button type="button" id="delAll"></button>';ul=el.querySelector('ul');$('#delAll').textContent=curPhase()==='create'?'Effacer mon aménagement (l’existant est gardé)':'Effacer l’existant (l’aménagement est gardé)'}
  S.demo.forEach(d=>{const sel=typeof SEL19!=='undefined'&&SEL19&&SEL19.kind==='demo'&&SEL19.id===String(d.id);ul.insertAdjacentHTML('beforeend',`<li class="${sel?'isel':''}"><span class="sw" style="background:${DCOLR}"></span><span class="itlink" role="button" tabindex="0" title="Afficher et modifier sur la carte" data-k="demo" data-i="${d.id}" aria-expanded="${sel}">✕ ${esc(dName(d))}</span><button type="button" data-del="demo" data-id="${d.id}">Supprimer</button></li>${sel?`<li class="itedli" data-ek="demo" data-ei="${d.id}">${editorHtml('demo',d)}</li>`:''}`)});
  const c=$('#itemsCount');if(c)c.textContent=el.querySelectorAll('li:not(.itedli)').length}}
KTAB.demo=['demo','Détails de la démolition'];
{const _eh24=editorHtml;editorHtml=function(kind,it){let h=_eh24(kind,it);if(kind!=='demo'||!it)return h;const opts=Object.entries(DT).filter(([k,t])=>t.geo===it.geo||(it.geo==='pt'&&it.ref&&k==='abri')).map(([k,t])=>`<option value="${k}"${k===it.type?' selected':''}>${esc(t.l)}</option>`).join('');
  h=h.replace('<div class="frow">',`<div class="frow"><label>Ce qu’il faut faire<select data-ef="dtype">${opts}</select></label>`);if(it.geo==='pt'||it.ref)h=h.replace(/<button type="button" data-ed="shape">[^<]*<\/button>/,'');return h}}
$('#itemsList').addEventListener('change',e=>{if(e.target.dataset.ef!=='dtype')return;e.stopImmediatePropagation();const li=e.target.closest('.itedli');const d=li&&S.demo.find(x=>String(x.id)===li.dataset.ei);if(!d)return;pushUndo();d.type=e.target.value;d.side=DT[d.type].side;d.opts={...dDef(d.type,refItem(d)),who:(d.opts||{}).who||'pro'};demoChanged()},true);
{const _dl24=delItem;delItem=function(kind,id){const r=_dl24(kind,id);if(kind==='demo'){S.samples=null;try{sunUpdate()}catch(e){}renderDemo()}return r}}
/* onglet « Démolition » */
const dsel_=(k,v,opts)=>`<select data-do="${k}">${opts.map(([x,l])=>`<option value="${x}"${String(x)===String(v)?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
function demoCard(d,I){const o=I.o,n=(k,l,min,max,st)=>`<label>${l}<input type="number" data-do="${k}" min="${min}" max="${max}" step="${st}" value="${o[k]||''}"></label>`,ck=(k,l)=>`<label class="ck"><input type="checkbox" data-do="${k}"${o[k]?' checked':''}> ${l}</label>`;let f=`<label>Ce qu’il faut faire${dsel_('type',d.type,Object.entries(DT).filter(([k,t])=>t.geo===d.geo||(d.geo==='pt'&&d.ref&&k==='abri')).map(([k,t])=>[k,t.l]))}</label>`;
  if(d.type==='arbre')f+=n('h','Hauteur (m)',1,45,0.5)+n('circ','Tour du tronc (cm, facultatif)',10,800,5)+`<label>Accès${dsel_('acc',o.acc,[['facile','Facile : il peut tomber d’un bloc'],['difficile','Difficile : à démonter (maison, câbles, voisin)']])}</label><label>Souche${dsel_('souche',o.souche,[['rogner','La rogner'],['laisser','La laisser']])}</label><label>Bois et branches${dsel_('bois',o.bois,[['place','Gardés sur place (bûches, broyat)'],['evac','Évacués par l’entreprise']])}</label>`;
  if(d.type==='souche')f+=`<label>Accès${dsel_('acc',o.acc,[['facile','Facile'],['difficile','Difficile']])}</label>`;
  if(d.type==='haie')f+=n('h','Hauteur (m)',0.3,10,0.1);if(d.type==='dalle')f+=n('thick','Épaisseur du béton (cm)',5,60,1);if(d.type==='mur')f+=n('h','Hauteur (m)',0.2,5,0.1)+n('ep','Épaisseur (cm)',5,80,1);if(d.type==='abri')f+=ck('amiante','Plaques en fibrociment (amiante possible)');
  f+=`<label>Qui réalise ?${dsel_('who',o.who,[['pro','Un professionnel'],['diy','Moi-même']])}</label>`;if(d.ref&&['arbre','abri','mur','haie'].includes(d.type))f+=ck('keepShade','Garder son ombre dans les calculs');
  const r=refItem(d),src=d.ref?`Élément existant : ${d.ref.k==='obs'?(r&&r.name)||OBT[(r||{}).type||'caduc'].l:d.ref.k==='shapes'?(r&&r.name)||'forme existante':PATHN[(r||{}).nat]||'chemin existant'}`:'Zone dessinée';
  return `<div class="card zcard dcard" data-did="${d.id}"><h4><span class="sw" style="background:${DCOLR}"></span> ✕ ${esc(dName(d))}</h4><p class="small">${esc(src)} · ${esc(I.qt)}${d.ref&&!o.keepShade&&['arbre','abri','mur','haie'].includes(d.type)?' · son ombre n’est plus comptée (situation après travaux)':''}</p><div class="frow">${f}</div>
   ${I.warn.map(w=>`<p class="warn">${esc(w)}</p>`).join('')}${I.rows.length?`<table class="stack"><tbody>${I.rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>`:''}
   <p><b>Fait par un professionnel :</b> ${rg(amenTTC(I.pro,21))} TVAC, évacuation comprise${I.diyOk&&I.h?` · <b>moi-même :</b> ≈ ${nf(Math.round(I.h))} h${I.rent[1]?` + location ${rg(amenTTC(I.rent,21))}`:''}`:''}</p>
   ${I.tips.map(t=>`<p class="small">💡 ${esc(t)}</p>`).join('')}<details><summary>Comment faire</summary><ol class="small">${I.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details></div>`}
function demoTotals(){const L_=(S.demo||[]).map(d=>[d,demoInfo(d)]),E=demoEvac(L_);let pro=[0,0],diy=[0,0],h=0;L_.forEach(([d,I])=>{pro=add2(pro,I.pro);if(I.o.who==='diy'&&I.diyOk){diy=add2(diy,I.rent);h+=I.h}else diy=add2(diy,I.pro)});return{L_,E,pro:add2(pro,E.pro),diy:add2(diy,E.diy),h}}
function renderDemo(){const box=$('#demoBox');if(!box)return;if(!(S.demo||[]).length){box.innerHTML=`<p class="empty">Rien à démolir pour l’instant. Dans « 2. Mon aménagement », utilisez « Retirer » (🌿 Végétal) pour un arbre, une haie ou un massif existant, ou « Démolir » (🧱 Fonctionnel) pour une terrasse, une allée, un mur ou un abri. Cliquez sur l’élément existant, ou dessinez la zone.</p><div class="chips"><button type="button" data-dtool="xv_sel">🌿 Retirer un élément végétal</button><button type="button" data-dtool="xv_zone">🌿 Zone à défricher</button><button type="button" data-dtool="xf_sel">🧱 Démolir un élément existant</button><button type="button" data-dtool="xf_zone">🧱 Zone à démolir</button><button type="button" data-dtool="xf_line">🧱 Mur ou clôture</button></div>`;return}
  const T=demoTotals(),veg=T.L_.filter(([d])=>d.side==='veg'),fon=T.L_.filter(([d])=>d.side!=='veg');
  box.innerHTML=`<div class="card"><h4>Démolition et préparation du terrain</h4><p class="big">${rg(amenTTC(T.pro,21))}</p><p class="small">Si tout est fait par des professionnels, évacuation comprise, TVA 21 % (travaux de jardin). Selon vos choix « qui réalise » : ${rg(amenTTC(T.diy,21))}${T.h?` et ≈ ${nf(Math.round(T.h))} h de travail`:''}.</p>
   ${T.E.rows.length?`<h5>Évacuation des déchets</h5><table class="stack"><tbody>${T.E.rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>`:''}
   <ul class="small"><li>Faites la démolition avant tout le reste : elle libère la place et donne le vrai niveau du terrain.</li><li>Avant de creuser ou de casser une dalle, consultez les plans des câbles et conduites enterrés (CICC en Wallonie et à Bruxelles, KLIP en Flandre).</li><li>Abattage, arrachage de haies : d’octobre à février, hors nidification.</li></ul>
   <div class="chips"><button type="button" data-dtool="xv_sel">+ 🌿 Retirer</button><button type="button" data-dtool="xv_zone">+ 🌿 Zone à défricher</button><button type="button" data-dtool="xf_sel">+ 🧱 Démolir</button><button type="button" data-dtool="xf_zone">+ 🧱 Zone à démolir</button><button type="button" data-dtool="xf_line">+ 🧱 Mur ou clôture</button></div></div>
   ${veg.length?`<h3 class="dh">🌿 Végétal</h3>${veg.map(([d,I])=>demoCard(d,I)).join('')}`:''}${fon.length?`<h3 class="dh">🧱 Aménagements</h3>${fon.map(([d,I])=>demoCard(d,I)).join('')}`:''}`}
$('#demo').addEventListener('change',e=>{const k=e.target.dataset.do;if(!k)return;const c=e.target.closest('[data-did]'),d=c&&S.demo.find(x=>String(x.id)===c.dataset.did);if(!d)return;pushUndo();d.opts=d.opts||{};
  if(k==='type'){d.type=e.target.value;d.side=DT[d.type].side;d.opts={...dDef(d.type,refItem(d)),who:d.opts.who||'pro'}}else{let v=e.target.type==='checkbox'?(e.target.checked?1:0):e.target.value;if(['h','circ','thick','ep'].includes(k)){v=parseFloat(String(v).replace(',','.'));if(!(v>=0))v=0}d.opts[k]=v}demoChanged()});
$('#demo').addEventListener('click',e=>{const b=e.target.closest('[data-dtool]');if(!b)return;const m=b.dataset.dtool;S.cside=m[1]==='v'?'veg':'fonc';try{setPhase('create')}catch(err){}showTab('carte',true);setMode(m)});
{const _ic24=itemsChanged;itemsChanged=function(a){_ic24(a);const s=$('#demo');if(s&&!s.classList.contains('tabhide'))renderDemo()}}
{const _ss24=stepSecs;stepSecs=function(n){const s=_ss24(n);if(n===4&&S.demo.length&&!s.includes('demo'))s.unshift('demo');return s}}
{const _at24=applyTabs;applyTabs=function(sel){_at24(sel);if(sel.includes('demo'))renderDemo()}}
/* budget, rapport, liens, plan */
{const _bl24=budgetLines;budgetLines=function(){const L=_bl24();if(!(S.demo||[]).length)return L;const T=demoTotals(),sup=T.E.diy,hD=T.h;
  const pro=amenTTC(T.pro,21),diy=amenTTC(T.diy,21);L.unshift({k:'demo',t:'Démolition et préparation',sup:[0,0],vat:21,qtxt:`${S.demo.length} élément(s)${T.E.G?`, ≈ ${nf(T.E.G,1)} m³ de gravats`:''}${T.E.V?`, ≈ ${nf(T.E.V,1)} m³ de déchets verts`:''}`,rent:[0,0],hDiy:hD,hPro:hD/1.8,fix:{diy,pro,lab:pro}});return L}}
{const _vs24=v4Sections;v4Sections=function(){const o=_vs24();if((S.demo||[]).length){const T=demoTotals();
  const sec={title:'DÉMOLITION ET PRÉPARATION DU TERRAIN',intro:`${S.demo.length} élément(s) à retirer ou à démolir. Fait par des professionnels : ${rg(amenTTC(T.pro,21))} TVAC, évacuation comprise.`,tables:[{h:'Éléments',head:['Élément','Quantité','Qui','Prix pro TVAC'],rows:T.L_.map(([d,I])=>[dName(d),I.qt,I.o.who==='diy'&&I.diyOk?'Moi-même':'Professionnel',rg(amenTTC(I.pro,21))]),w:[4200,5000,2200,3438]},...(T.E.rows.length?[{h:'Évacuation des déchets',head:['Déchets','Solution'],rows:T.E.rows,w:[3000,11838]}]:[])],
   bullets:[...T.L_.flatMap(([d,I])=>I.warn.map(w=>`${dName(d)} : ${w}`)),...[...new Set(T.L_.flatMap(([d,I])=>I.tips))],'Avant de creuser ou de casser une dalle : plans des câbles et conduites (CICC en Wallonie et à Bruxelles, KLIP en Flandre).'],bh:'Règles et précautions'};
  const i=o.findIndex(x=>x.title==='VOTRE PROJET');o.splice(i>=0?i+1:0,0,sec)}const bi=o.findIndex(x=>/^BUDGET/.test(x.title));if(bi>=0&&bi!==o.length-1)o.push(o.splice(bi,1)[0]);return o}}
{const _int24=interactions;interactions=function(){const L=_int24();const dem=new Set((S.demo||[]).filter(d=>d.ref).map(d=>d.ref.k+':'+d.ref.id)),polys=[...(S.amen||[]).map(a=>[aName(a),a.pts]),...S.ponds.map((p,i)=>[`Mare ${i+1}`,p.pts]),...S.potagers.map((p,i)=>[`Potager ${i+1}`,p.pts]),...(S.zones||[]).map(z=>[`${ZK[z.kind].l} ${zNum(z)}`,z.pts]),...(S.bed&&massifOn()?[['Massif',S.bed.ll]]:[])];
  polys.forEach(([n,P])=>{if(!P||P.length<3)return;S.obs.filter(t=>['caduc','pers','arbu','bat'].includes(t.type)&&!dem.has('obs:'+t.id)&&inPolyLL([t.lat,t.lng],P)).forEach(t=>L.push({lvl:'warn',t:`${n} sur ${t.type==='bat'?'un bâtiment':'un arbre'} existant`,d:`${n} recouvre « ${t.name||OBT[t.type].l} ». Marquez-le à ${t.type==='bat'?'démolir':'abattre'} (outil « ${t.type==='bat'?'Démolir':'Retirer'} ») ou déplacez votre aménagement.`}));
    S.paths.filter(p=>p.nat!=='pasjap'&&!dem.has('paths:'+p.id)&&inPolyLL(cen(p.pts),P)).forEach(p=>L.push({lvl:'tip',t:`${n} sur ${PATHN[p.nat]||'un chemin'} existant`,d:'Marquez l’ancien revêtement « à enlever » (outil « Démolir ») pour compter la démolition et l’évacuation dans le budget.'}))});return L}}
{const _pi24=planItems;planItems=function(){const it=_pi24();(S.demo||[]).forEach(d=>{const G=dGeom(d);if(!G||!G.length)return;if(G.length===1)it.push({pts:G,col:DCOLR,r:0.6,lab:'À démolir ou abattre'});else it.push({pts:G,col:DCOLR,closed:d.geo==='area'?1:0,fill:d.geo==='area'?.12:0,lw:2,dash:1,lab:'À démolir ou abattre'})});return it}}
{const _pl24=planLabels;planLabels=function(){const L_=_pl24();(S.demo||[]).forEach(d=>{const G=dGeom(d);if(G&&G.length)L_.push([`✕ ${(DT[d.type]||DT.massif).l}`,G.length>2?cen(G):G[Math.floor(G.length/2)]])});return L_}}
DIY.demo={t:'Démolition et préparation',when:'Octobre à février pour la végétation ; toute l’année hors gel pour le reste',dur:h=>`≈ ${nf(Math.round(h))} h`,lvl:'Variable',tools:'Gants, lunettes, pioche, pelle, brouette, disqueuse ; brise-béton et mini-pelle en location',s:['Voir le détail de chaque élément dans l’onglet « Démolition ».']};
{const _dl24b=diyList;diyList=function(){const L=_dl24b();if((S.demo||[]).some(d=>(d.opts||{}).who==='diy')){const T=demoTotals();if(T.h)L.unshift(['demo',T.h])}return L}}
{const _cp24=clearProject;clearProject=function(){S.demo=[];return _cp24()}}
{const _cd24=clearDrawings;clearDrawings=function(){S.demo=[];return _cd24()}}
{const _ul24=updateLegend;updateLegend=function(){_ul24();const el=$('#maplegend');if(el&&/\(cliquer\)/.test(el.innerHTML))el.innerHTML=el.innerHTML.replace(/ \(cliquer\)/g,'')}}
window.__p24={DT,demoInfo,demoTotals,renderDemo,demoFromItem,obsAll:()=>obsAll()};
renderDemo();

/* ================= v25 : retours terrain ================= */
/* --- 1. édition dès le placement, copier-coller fiable --- */
function edOpenQuiet(kind,id){SEL19={kind,id:String(id)};const pn=$('#itemsPanel');if(pn)pn.open=true;renderItemsList();const box=$('#itemsList'),ed=box&&box.querySelector('.itedli');if(ed&&box.scrollHeight>box.clientHeight+4)box.scrollTop=Math.max(0,ed.offsetTop-box.offsetTop-40)}
{const _ao25=addObstacle;addObstacle=function(lat,lng){const r=_ao25(lat,lng);if(S.mode==='obs'&&!restoring){const o=S.obs[S.obs.length-1];if(o)edOpenQuiet('obs',o.id)}return r}}
let LASTP25=null;
{const _du25=dupItem;dupItem=function(kind,src,at){if(!src)return;const key=kind+':'+src.id;
  let auto=false;if(kind==='obs'){const w=Math.max(2,src.w||2),same=LASTP25&&LASTP25.k===key;if(!at){auto=true;at=shiftLL([same?LASTP25.p:[src.lat,src.lng]],w,0)[0];LASTP25={k:key,p:at,m:null}}else if(same&&LASTP25.m&&LASTP25.m[0]===at[0]&&LASTP25.m[1]===at[1]){const m=at;at=shiftLL([LASTP25.p],w,0)[0];LASTP25={k:key,p:at,m}}else LASTP25={k:key,p:at,m:at}}else LASTP25=null;
  const n0=S.shapes.length,r=_du25(kind,src,at);
  if(kind==='shapes'&&S.shapes.length>n0){const c=S.shapes[S.shapes.length-1];if(src.w)c.w=src.w;c.name=(src.name||'Forme').replace(/( \(copie\))+$/,'')+' (copie)';renderItemsList()}
  if(kind==='obs'){const o=S.obs[S.obs.length-1];if(o&&o.name)o.name=o.name.replace(/( \(copie\))+$/,'')+' (copie)';if(auto)toast('Copie ajoutée à côté de l’original. Placez la souris sur la carte avant Ctrl+V pour choisir l’endroit.')}
  return r}}
{const _fs25=finishShape;finishShape=function(){const before=itemId,r=_fs25.apply(this,arguments);if(itemId>before&&!restoring){try{const [k]=findItem(itemId);if(k)edOpenQuiet(k,itemId)}catch(e){}}return r}}

/* --- 2. existant : haie (avec largeur), clôture ou palissade, massif de vivaces --- */
SHNAT.viv='Massif de vivaces existant';SHNAT.cloture='Clôture ajourée (grillage, treillis)';SHNAT.palissade='Palissade pleine (bois, panneaux)';
const EX25=[['obsHedge','Haie existante (ligne, avec sa largeur)','line',2,'#2e7d32','Haie existante','Cliquez le long de la haie existante, puis « Terminer ». Réglez ensuite sa hauteur et sa largeur.'],
 ['obsFence','Clôture ou palissade existante (ligne)','line',2,'#78909c','Clôture existante','Cliquez le long de la clôture ou de la palissade existante, puis « Terminer ».'],
 ['obsViv','Massif de vivaces existant (forme)','area',3,'#ab47bc','Massif de vivaces','Cliquez le contour du massif de vivaces existant, puis « Terminer ».']];
{let i=TOOLS.findIndex(t=>t[0]==='obsShrub');if(i<0)i=TOOLS.findIndex(t=>t[0]==='obsLine');EX25.forEach(([k,l,g,n,c,sh,tx])=>{TOOLS.splice(++i,0,[k,l,g]);SHAPE_MODES[k]=n;TC[k]=c;SHORT[k]=sh;HINT[k]=tx;DRAWTXT[k]=tx.replace(/, puis.*$/,'');const j=EXIST_TOOLS.indexOf('path');EXIST_TOOLS.splice(j<0?EXIST_TOOLS.length:j,0,k)})}
SHORT.obsLine='Mur';
{const hd=s=>s.kind==='obsLine'&&(s.nat==='haie'||s.nat==='caduc');LEGK.obsHedge=()=>S.shapes.some(hd);LEGK.obsFence=()=>S.shapes.some(s=>s.nat==='cloture'||s.nat==='palissade');LEGK.obsViv=()=>S.shapes.some(s=>s.nat==='viv');
  LEGK.obsLine=()=>S.shapes.some(s=>s.kind==='obsLine'&&s.nat==='mur');LEGK.obsPoly=()=>S.shapes.some(s=>s.kind==='obsPoly'&&!['arbu','viv'].includes(s.nat))}
{const _fx25=finishShape;finishShape=function(){const m=S.mode;if(!['obsHedge','obsFence','obsViv'].includes(m))return _fx25.apply(this,arguments);const need=SHAPE_MODES[m];if(S.drawPts.length<need){$('#maphint').textContent=`Il faut au moins ${need} points.`;return}pushUndo();
  const id=++itemId,pts=S.drawPts.slice(),cnt=f=>S.shapes.filter(f).length+1;let it;
  if(m==='obsHedge')it={id,kind:'obsLine',pts,name:'Haie existante '+cnt(x=>x.kind==='obsLine'&&(x.nat==='haie'||x.nat==='caduc')),h:1.8,w:1,nat:'haie'};
  else if(m==='obsFence')it={id,kind:'obsLine',pts,name:'Clôture '+cnt(x=>x.nat==='cloture'||x.nat==='palissade'),h:1.5,nat:'cloture'};
  else it={id,kind:'obsPoly',pts,name:'Massif de vivaces '+cnt(x=>x.nat==='viv'),h:0.6,nat:'viv'};
  S.shapes.push(it);initGeom(id);setMode('site');S.samples=null;itemsChanged(true);renderObs();sunUpdate();saveNow(true);edOpenQuiet('shapes',id);
  toast(m==='obsHedge'?`Haie existante ajoutée (${nf(lenLL(pts),1)} m) : réglez sa hauteur et sa largeur ci-dessous.`:m==='obsFence'?`Clôture existante ajoutée (${nf(lenLL(pts),1)} m) : choisissez « clôture ajourée » ou « palissade pleine ».`:`Massif de vivaces existant ajouté (${nf(areaLL(pts))} m²).`)}}
{const _eh25=editorHtml;editorHtml=function(kind,it){let h=_eh25(kind,it);if(!it||locked(kind,it))return h;
  if(kind==='shapes'&&it.kind==='obsLine'&&(it.nat==='haie'||it.nat==='caduc'))h=h.replace(/(<label>Hauteur \(m\)<input[^>]*>)<\/label>/,`$1</label><label>Largeur (m)<input type="number" data-ef="w" value="${it.w||1}" min="0.2" max="8" step="0.1"></label>`);
  const s=soilInfo25(it.soil),site=soilNow();if(s)h=h.replace('<div class="chips">',`<p class="small soil25">Sol à cet endroit : <b>${esc(s.cls)}</b>${s.dr?`, drainage ${esc(BDR[s.dr]||s.dr)}`:''} <span class="muted">(${esc(s.src)})</span>${site&&site.cls!==s.cls?` · <b class="warnc">différent du point d’étude (${esc(site.cls)})</b> : les plantes de cet élément en tiennent compte`:''}</p><div class="chips">`);
  return h}}
$('#itemsList').addEventListener('change',e=>{if(e.target.dataset.ef!=='w')return;const T=edTarget(e);if(!T||!T.it||T.kind!=='shapes')return;const x=parseFloat(String(e.target.value).replace(',','.'));if(!(x>0))return;T.it.w=Math.min(8,x);S.samples=null;itemsChanged(true);renderObs();sunUpdate();saveNow(true)});
function bufLine(P,w){const o=P[0],mp=mPer(o[0]),X=P.map(p=>[(p[1]-o[1])*mp,(p[0]-o[0])*111320]),h=w/2,n=X.length,N=X.map((_,i)=>{const a=X[Math.max(0,i-1)],b=X[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[-dy/l,dx/l]});
  return X.map((p,i)=>[p[0]+N[i][0]*h,p[1]+N[i][1]*h]).concat(X.map((p,i)=>[p[0]-N[i][0]*h,p[1]-N[i][1]*h]).reverse()).map(([x,y])=>[o[0]+y/111320,o[1]+x/mp])}
const hbLayer25=L.layerGroup?L.layerGroup().addTo(map):null;
{const _di25=drawItems;drawItems=function(){_di25();if(!hbLayer25||!L.polygon)return;hbLayer25.clearLayers();S.shapes.filter(s=>s.kind==='obsLine'&&(s.nat==='haie'||s.nat==='caduc')&&(s.w||0)>0.3&&s.pts.length>1).forEach(s=>{try{L.polygon(bufLine(s.pts,s.w),{color:'#2e7d32',weight:1,fillColor:s.nat==='caduc'?'#9ccc65':'#43a047',fillOpacity:.35,interactive:false}).addTo(hbLayer25)}catch(e){}})}}
{const _hk25=hook;hook=function(l,kind,id,label){const r=_hk25(l,kind,id,label);try{if(kind==='shapes'&&l.setStyle){const s=S.shapes.find(x=>x.id==id);const st=s&&!locked(kind,s)&&{viv:{color:'#8e24aa',fillColor:'#ce93d8',fillOpacity:.35},cloture:{color:'#607d8b',dashArray:'2 6',weight:3},palissade:{color:'#6d4c41',weight:4,dashArray:null}}[s.nat];if(st)l.setStyle(st)}}catch(e){}return r}}
{const _dtf25=demoTypeFor;demoTypeFor=function(kind,it,side){if(kind==='shapes'&&it){if(it.nat==='cloture'||it.nat==='palissade')return'cloture';if(it.nat==='viv')return'massif'}return _dtf25(kind,it,side)}}
rebuildToolLists();

/* --- 3. dessin : alignement automatique et mesures en temps réel --- */
let ALT25=false;document.addEventListener('keydown',e=>{if(e.key==='Alt')ALT25=true});document.addEventListener('keyup',e=>{if(e.key==='Alt')ALT25=false});window.addEventListener('blur',()=>{ALT25=false});
const angLL=(a,b)=>Math.atan2((b[0]-a[0])*111320,(b[1]-a[1])*mPer(a[0]));
function longAx(P,closed){let bl=0,th=null;P.forEach((p,i)=>{if(!closed&&i===P.length-1)return;const q=P[(i+1)%P.length],l=llDist(p,q);if(l>bl){bl=l;th=angLL(p,q)}});return th}
function axes25(){const A=[0],P=S.drawPts,n=P.length;if(n>=2)A.push(angLL(P[n-2],P[n-1]));
  const hs=S.shapes.filter(s=>s.kind==='obsPoly'&&s.nat==='bat').sort((x,y)=>areaLL(y.pts)-areaLL(x.pts))[0];if(hs){const t=longAx(hs.pts,true);if(t!=null)A.push(t)}
  try{const D=propDomain();if(D){const t=longAx(D,true);if(t!=null)A.push(t)}}catch(e){}return A}
function align25(lat,lng){const n=S.drawPts.length,out={p:[lat,lng],guides:[],tag:''};if(!S.snap||ALT25||S.curve||!n)return out;
  const sp=snapPt(lat,lng);if(sp[0]!==lat||sp[1]!==lng){out.tag=' · sur un point';return out}
  const a=S.drawPts[n-1],mp=mPer(a[0]),toX=p=>[(p[1]-a[1])*mp,(p[0]-a[0])*111320],toL=([x,y])=>[a[0]+y/111320,a[1]+x/mp],X=toX([lat,lng]),r=Math.hypot(X[0],X[1]);if(r<0.3)return out;
  const th=Math.atan2(X[1],X[0]),AX=axes25();let best=null;
  AX.forEach((t0,ai)=>{for(let k=0;k<(ai===1&&n>=2?8:4);k++){const t=t0+k*Math.PI/(ai===1&&n>=2?4:2);let d=Math.atan2(Math.sin(th-t),Math.cos(th-t));d=Math.abs(d);if(d<0.07&&(!best||d<best.d))best={d,t,right:ai===1&&k%2===0&&k%4===2}}});
  let P=X,dir=null;if(best){dir=[Math.cos(best.t),Math.sin(best.t)];const s=X[0]*dir[0]+X[1]*dir[1];P=[dir[0]*s,dir[1]*s];out.tag=best.right?' · ⟂ angle droit':' · aligné'}
  /* alignement sur un point déjà posé (fermer un rectangle bien d’équerre) */
  const tolM=Math.max(0.25,(map.getZoom?0.6*Math.pow(2,19-map.getZoom()):0.4));let hit=null;
  S.drawPts.slice(0,-1).forEach(q=>{const Q=toX(q);AX.forEach(t0=>{[t0,t0+Math.PI/2].forEach(t=>{const e=[Math.cos(t),Math.sin(t)];
    if(dir){const det=dir[0]*(-e[1])-dir[1]*(-e[0]);if(Math.abs(det)<0.2)return;const s=((Q[0])*(-e[1])-(Q[1])*(-e[0]))/det,I=[dir[0]*s,dir[1]*s];const dd=Math.hypot(I[0]-P[0],I[1]-P[1]);if(dd<tolM&&s>0&&(!hit||dd<hit.dd))hit={dd,I,q}}
    else{const nrm=[-e[1],e[0]],off=(P[0]-Q[0])*nrm[0]+(P[1]-Q[1])*nrm[1];if(Math.abs(off)<tolM*0.6&&(!hit||Math.abs(off)<hit.dd))hit={dd:Math.abs(off),I:[P[0]-off*nrm[0],P[1]-off*nrm[1]],q}}})})});
  if(hit){P=hit.I;out.guides.push([hit.q,toL(P)]);out.tag+=' · aligné sur un point'}
  if(dir)out.guides.push([a,toL([P[0]+dir[0]*2,P[1]+dir[1]*2])]);
  out.p=toL(P);return out}
{const _ad25=addDrawPt;addDrawPt=function(lat,lng){const n=S.drawPts.length;if(n&&S.mode in SHAPE_MODES){let close=false;if(n>=3&&SHAPE_MODES[S.mode]===3){const f=S.drawPts[0],Pp=map.latLngToContainerPoint&&map.latLngToContainerPoint([lat,lng]);if(Pp){const Q=map.latLngToContainerPoint(f);close=Math.hypot(Pp.x-Q.x,Pp.y-Q.y)<16}else close=llDist([lat,lng],f)<1.2}
    if(!close){const r=align25(lat,lng);lat=r.p[0];lng=r.p[1]}}return _ad25(lat,lng)}}
if(map.on)map.on('mousemove',e=>{if(e.originalEvent)ALT25=!!e.originalEvent.altKey;if(!(S.mode in SHAPE_MODES)||!S.drawPts.length||!e.latlng)return;
  const r=align25(e.latlng.lat,e.latlng.lng),b=r.p,n=S.drawPts.length,a=S.drawPts[n-1],col=TC[S.mode]||'#e3a018',cl=SHAPE_MODES[S.mode]===3;rubber.clearLayers();
  L.polyline([a,b],{color:col,weight:2,dashArray:'4 6',interactive:false}).addTo(rubber);if(cl&&n>=2)L.polyline([b,S.drawPts[0]],{color:col,weight:1,opacity:.5,dashArray:'2 6',interactive:false}).addTo(rubber);
  r.guides.forEach(g=>L.polyline(g,{color:'#1e88e5',weight:1,opacity:.8,dashArray:'3 4',interactive:false}).addTo(rubber));
  const pts=S.drawPts.concat([b]);let t=`${nf(llDist(a,b),2)} m`;if(!cl&&n>1)t+=` · total ${nf(lenLL(pts),1)} m`;if(cl&&n>=2)t+=` · ${nf(areaLL(pts),1)} m²`;t+=r.tag;
  const mk=L.circleMarker(b,{radius:3,color:col,weight:1,fillOpacity:1,interactive:false}).addTo(rubber);if(mk.bindTooltip)mk.bindTooltip(t,{permanent:true,direction:'right',offset:[12,0],className:'maplbl live25'})});
{const _dt25=drawTemp;drawTemp=function(){_dt25();const P=S.drawPts,n=P.length;if(n<2||S.mode==='measure')return;const cl=SHAPE_MODES[S.mode]===3;
  for(let i=0;i<n-1+(cl&&n>2?1:0);i++){const p=P[i],q=P[(i+1)%n],d=llDist(p,q);if(d<0.5)continue;const mk=L.circleMarker([(p[0]+q[0])/2,(p[1]+q[1])/2],{radius:1,opacity:0,fillOpacity:0,interactive:false}).addTo(tempLayer);if(mk.bindTooltip)mk.bindTooltip(nf(d,d<10?2:1)+' m',{permanent:true,direction:'center',className:'seglbl'})}}}

/* --- 4. sol sous chaque élément (cartes des sols régionales) --- */
const SOIL25=new Map();
function soilAtLL(p){const k=p[0].toFixed(4)+','+p[1].toFixed(4);if(SOIL25.has(k))return SOIL25.get(k);const pr=(async()=>{try{const r=await Promise.any([soilWallonie(p[0],p[1]),soilFlandre(p[0],p[1])]);if(r&&r.t)return{reg:r}}catch(e){}if(!inBox(BE,p[0],p[1])){try{return{api:await fetchSoil(p[0],p[1])}}catch(e){}}return null})();SOIL25.set(k,pr);return pr}
const ESOIL_K=[['hedges','Haie'],['lawns','Pelouse'],['potagers','Potager'],['orchards','Verger'],['ponds','Pièce d’eau'],['taluses','Talus'],['zones','Zone'],['fruits','Fruitier']];
function elemList25(){const o=[];if(S.bed&&S.bed.ll)o.push(['bed',S.bed,cen(S.bed.ll),'Massif']);ESOIL_K.forEach(([k,l])=>(S[k]||[]).forEach((it,i)=>{const c=k==='fruits'?(it.lat!=null?[it.lat,it.lng]:null):it.pts&&it.pts.length?cen(it.pts):null;if(c)o.push([k,it,c,`${l} ${i+1}`+(it.label?' · '+it.label:'')])}));return o}
function soilInfo25(s){if(!s||s.none)return null;let b=null;if(s.reg)b=regToSoil(s.reg);else if(s.api)b={...s.api};if(!b)return null;const cls=b.belg||texClass(b.sand,b.silt,b.clay);return{cls,cat:b.catB||TEXCAT[cls]||'l',dr:b.dr||null,src:s.reg?(s.reg.src==='cnsw'?'carte des sols de Wallonie':'carte des sols de Flandre'):'SoilGrids'}}
function withSoil25(it,fn){const s=it&&it.soil;if(!s||s.none||S.soilMan||!(s.reg||s.api))return fn();const r0=S.soilReg,a0=S.soilApi;S.soilReg=s.reg||null;S.soilApi=s.api||null;try{return fn()}finally{S.soilReg=r0;S.soilApi=a0}}
{const _co25=compose;compose=function(...x){return withSoil25(S.bed,()=>_co25(...x))}}
{const _hi25=hedgeInfo;hedgeInfo=function(h){return withSoil25(h,()=>_hi25(h))}}
{const _fi25=fruitInfo;fruitInfo=function(f){return withSoil25(f,()=>_fi25(f))}}
{const _pi25=pondInfo;pondInfo=function(p){return withSoil25(p,()=>_pi25(p))}}
let SOILT25=null,SOILRUN25=false;
function schedSoil25(){clearTimeout(SOILT25);SOILT25=setTimeout(runSoil25,700)}
async function runSoil25(){if(S.lat==null||SOILRUN25)return;SOILRUN25=true;let bedCh=false,ch=false;try{for(const [k,it,c] of elemList25()){if(it.soil&&it.soil.ll&&llDist(it.soil.ll,c)<8)continue;const r=await soilAtLL(c);it.soil={ll:c,...(r||{}),none:!r};ch=true;if(k==='bed')bedCh=true}}finally{SOILRUN25=false}
  if(!ch)return;try{if(bedCh&&S.bed&&!S.bed.soil.none)renderCompo()}catch(e){}renderElSoil25();if(SEL19)renderItemsList()}
{const _ic25=itemsChanged;itemsChanged=function(a){_ic25(a);schedSoil25()}}
{const s=$('#sol .in');if(s)s.insertAdjacentHTML('beforeend','<div class="card" id="elSoil" hidden></div>')}
function renderElSoil25(){const box=$('#elSoil');if(!box)return;const site=soilNow(),rows=elemList25().map(([k,it,c,l])=>[l,soilInfo25(it.soil),it.soil]).filter(r=>r[2]);if(!rows.length){box.hidden=true;return}box.hidden=false;
  box.innerHTML=`<h4>Sol sous chaque élément dessiné</h4><p class="small">Un même terrain peut avoir plusieurs sols. La carte des sols est interrogée au centre de chaque élément ; ses plantes sont choisies pour ce sol-là.</p><table class="stack"><thead><tr><th>Élément</th><th>Sol</th><th>Drainage</th></tr></thead><tbody>${rows.map(([l,s])=>`<tr><td>${esc(l)}</td><td>${s?esc(s.cls)+(site&&site.cls!==s.cls?' <b class="warnc">≠ point d’étude</b>':''):'<span class="muted">pas de donnée (zone bâtie ?)</span>'}</td><td>${s&&s.dr?esc(BDR[s.dr]||s.dr):'–'}</td></tr>`).join('')}</tbody></table>`}
{const _rc25=renderCompo;renderCompo=function(){_rc25();const s=S.bed&&soilInfo25(S.bed.soil),site=soilNow(),d=$('#stydesc');if(s&&d&&site&&s.cls!==site.cls)d.insertAdjacentHTML('beforeend',` <span class="small soil25">Sol sous le massif : <b>${esc(s.cls)}</b> (différent du point d’étude) : la palette en tient compte.</span>`)}}
{const _cr25=collectReport;collectReport=async function(){const R=await _cr25();try{const site=soilNow(),L_=elemList25().map(([k,it,c,l])=>[l,soilInfo25(it.soil)]).filter(r=>r[1]);if(L_.length&&L_.some(r=>!site||r[1].cls!==site.cls))R.extras.push(['Sols sous les éléments',L_.map(([l,s])=>`${l} : ${s.cls}`).join(' ; ')+'.'])}catch(e){}return R}}

/* --- 5. propositions : selon les envies et sans chevaucher l’existant --- */
function terrProp25(){const T=S.tpl||{A:5,B:4},A=+T.A||5,B=+T.B||4,Bs=S.shapes.filter(s=>s.kind==='obsPoly'&&s.nat==='bat').sort((x,y)=>areaLL(y.pts)-areaLL(x.pts));if(!Bs.length)return null;
  const c0=cen(Bs[0].pts),mp=mPer(c0[0]),XY=p=>[(p[1]-c0[1])*mp,(p[0]-c0[0])*111320],LL=([x,y])=>[c0[0]+y/111320,c0[1]+x/mp],Q=Bs[0].pts.map(XY);let best=-9,O=null,u,v,side='';
  Q.forEach((p,i)=>{const q=Q[(i+1)%Q.length],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(l<1)return;const t=[(q[0]-p[0])/l,(q[1]-p[1])/l];let nr=[t[1],-t[0]];const mid=[(p[0]+q[0])/2,(p[1]+q[1])/2];if(mid[0]*nr[0]+mid[1]*nr[1]<0)nr=[-nr[0],-nr[1]];const sc=-nr[1]+Math.min(1,l/A)*0.3;if(sc>best){best=sc;O=mid;u=t;v=nr;side=Math.abs(nr[1])>Math.abs(nr[0])?(nr[1]<0?'sud':'nord'):(nr[0]>0?'est':'ouest')}});
  if(!O)return null;const pts=[[-A/2,0.05],[A/2,0.05],[A/2,B],[-A/2,B]].map(([x,y])=>LL([O[0]+u[0]*x+v[0]*y,O[1]+u[1]*x+v[1]*y]));
  return{k:'a_terrasse',w:'terrasse',lab:'Terrasse',pts,why:`${nf(A,1)} × ${nf(B,1)} m contre la façade ${side}, la plus ensoleillée`}}
{const _pl25=proposeLayout;proposeLayout=function(){const R=_pl25();if(!R||!R.props)return R;const n0=R.props.length;
  if(S.want.size)R.props=R.props.filter(p=>S.want.has(p.w));R.hidden=n0-R.props.length;
  if(wantOn('terrasse')&&!(S.amen||[]).some(a=>a.kind==='terrasse')){const t=terrProp25();if(t)R.props.unshift(t)}return R}}
{const _rp25=renderProps;renderProps=function(){_rp25();const box=$('#propBox');if(!box||box.hidden||!PROP19)return;const n=box.querySelector('.note');if(n)n.insertAdjacentHTML('beforeend',S.want.size?` Seuls les aménagements choisis dans « Mes envies » sont proposés${PROP19.hidden?` (${PROP19.hidden} autre(s) écartée(s))`:''}.`:' Choisissez vos envies pour ne recevoir que les propositions qui vous intéressent.')}}

/* --- 6. plan de pose agrandi --- */
{const _dh25=deckHtml;deckHtml=function(a){const h=_dh25(a);if(!h)return h;return h.replace(/(<canvas class="deckcv"[^>]*><\/canvas>)/,`<div class="deckwrap">$1<button type="button" class="deckzoom" data-dz="${a.id}">🔍 Agrandir le plan</button></div>`)}}
const DZ={a:null,z:1};
function dzDraw(){const a=DZ.a,V=$('#dzV'),cv=$('#dzC');if(!a||!V||!cv)return;window.__dzNoH=true;try{const dw=v=>{try{Object.defineProperty(cv,'clientWidth',{value:v,configurable:true})}catch(e){}drawDeck(cv,a)};
  if(!DZ.asp){dw(400);DZ.asp=cv.height/cv.width||0.7}const base=Math.max(300,Math.min(V.clientWidth-24,(V.clientHeight-24)/DZ.asp)),css=base*DZ.z,px=Math.min(css*(window.devicePixelRatio||1),7000);
  dw(px/1.5);cv.style.width=css+'px';cv.style.height=(cv.height/cv.width*css)+'px';$('#dzP').textContent=Math.round(DZ.z*100)+' %'}finally{window.__dzNoH=false}}
function dzZoom(f,cx,cy){const V=$('#dzV');if(!V)return;const z0=DZ.z,z=Math.max(0.5,Math.min(8,f==='fit'?1:z0*f));if(z===z0&&f!=='fit')return;const px=(V.scrollLeft+(cx??V.clientWidth/2))/z0,py=(V.scrollTop+(cy??V.clientHeight/2))/z0;DZ.z=z;dzDraw();V.scrollLeft=px*z-(cx??V.clientWidth/2);V.scrollTop=py*z-(cy??V.clientHeight/2)}
function openDeckZoom(a){let d=$('#deckDlg');if(!d){document.body.insertAdjacentHTML('beforeend',`<dialog id="deckDlg" class="deckdlg" aria-label="Plan de pose agrandi"><div class="dzbar"><b id="dzT"></b><span class="dzb"><button type="button" data-z="out" aria-label="Zoom arrière">−</button><span id="dzP">100 %</span><button type="button" data-z="in" aria-label="Zoom avant">+</button><button type="button" data-z="fit">Ajuster</button><button type="button" data-z="png">Télécharger l’image</button><button type="button" class="pri" data-z="x">Fermer</button></span></div><div class="dzview" id="dzV"><canvas id="dzC"></canvas></div><p class="small">Glissez pour vous déplacer, Ctrl + molette ou les boutons pour zoomer. Chaque pièce est dessinée à l’échelle.</p></dialog>`);d=$('#deckDlg');
    d.addEventListener('click',e=>{const b=e.target.closest('[data-z]');if(!b)return;const z=b.dataset.z;if(z==='x')d.close();else if(z==='in')dzZoom(1.5);else if(z==='out')dzZoom(1/1.5);else if(z==='fit')dzZoom('fit');else if(z==='png'){window.__dzNoH=true;let im;try{im=deckPng(DZ.a,2400)}finally{window.__dzNoH=false}if(im){const l=document.createElement('a');l.href=im.data;l.download='plan-de-pose-'+DZ.a.id+'.png';l.click()}}});
    const V=$('#dzV');let drag=null;V.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,l:V.scrollLeft,t:V.scrollTop};V.setPointerCapture&&V.setPointerCapture(e.pointerId);V.classList.add('drag')});
    V.addEventListener('pointermove',e=>{if(!drag)return;V.scrollLeft=drag.l-(e.clientX-drag.x);V.scrollTop=drag.t-(e.clientY-drag.y)});['pointerup','pointercancel'].forEach(t=>V.addEventListener(t,()=>{drag=null;V.classList.remove('drag')}));
    V.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();const r=V.getBoundingClientRect();dzZoom(e.deltaY<0?1.25:0.8,e.clientX-r.left,e.clientY-r.top)},{passive:false})}
  DZ.a=a;DZ.z=1;DZ.asp=0;$('#dzT').textContent=`${aName(a)} · plan de pose`;if(d.showModal)d.showModal();else d.setAttribute('open','');requestAnimationFrame(dzDraw)}
$('#fonct').addEventListener('click',e=>{const b=e.target.closest('[data-dz]');if(!b)return;const a=S.amen.find(x=>String(x.id)===b.dataset.dz);if(a)openDeckZoom(a)});

/* --- 7. budget de la terrasse et de l’allée : fournitures + heures de pose au taux horaire --- */
const LABH25={bois:[0.9,1.3],exo:[1.1,1.6],composite:[0.9,1.3],pierre:[1.6,2.4],ceram:[1.2,1.8],dalle:[0.9,1.4],paves:[1.1,1.7],pnat:[1.6,2.6],desac:[0.6,0.9],gravier:[0.4,0.7],dolomie:[0.25,0.45]};
const STRU25={plank:['Structure : plots, lambourdes, clips et vis',[18,40]],plots:['Plots réglables et croisillons',[8,16]],lit:['Lit de pose (sable ou mortier drainant) et joints',[6,15]],desac:['Béton, treillis et produit désactivant',[25,45]]};
{const _ai25=amenInfo;amenInfo=function(a,noSun){const I=_ai25(a,noSun);try{if(!(a.kind==='terrasse'||a.kind==='allee'))return I;const o=I.o,M=AMAT[o.mat];if(!M||o.mat==='pasjap')return I;
  const A=I.A,car=a.kind==='allee'&&o.use==='voiture',kp=car&&o.mat==='desac'?1.25:1,plank=['bois','exo','composite'].includes(o.mat),reuse=o.base==='slab'||o.base==='stab';
  const fb=FBASE[reuse?'none':M.base]||FBASE.none,kb=car?1.4:1;let base=[fb.pro[0]*kb,fb.pro[1]*kb],bsup=[fb.sup[0]*kb,fb.sup[1]*kb];if(o.base==='old')base=add2(base,[15,35]);if(o.base==='stab'||(o.base==='slab'&&M.base==='plots')){base=[5,25];bsup=[2,6]}
  const drPro=[Math.max(0,I.proHT[0]-M.pose[0]*A*kp-base[0]*A),Math.max(0,I.proHT[1]-M.pose[1]*A*kp-base[1]*A)],drSup=[Math.max(0,I.supHT[0]-M.sup[0]*A-bsup[0]*A),Math.max(0,I.supHT[1]-M.sup[1]*A-bsup[1]*A)];
  let R=null;try{R=deckCalc(a)}catch(e){}const wf=plank?(R&&R.d&&R.d.sens==='diag'?1.12:1.08):R&&R.mode==='slab'?1+(PWASTE[R.d.lay]||0.05):1.05;
  const st=plank?STRU25.plank:o.mat==='ceram'&&!reuse?STRU25.plots:['pierre','dalle','paves','pnat','ceram'].includes(o.mat)?STRU25.lit:o.mat==='desac'?STRU25.desac:null;
  const mat=[M.sup[0]*A*wf,M.sup[1]*A*wf],stru=st?[st[1][0]*A,st[1][1]*A]:[0,0],mg=[1.1,1.2],matP=[mat[0]*mg[0],mat[1]*mg[1]],struP=[stru[0]*mg[0],stru[1]*mg[1]];
  const rate=[PRICE.macon[2],PRICE.macon[3]],h=LABH25[o.mat]||[1,1.5],kh=car?1.15:1,hrs=[h[0]*A*kh,h[1]*A*kh],labP=[hrs[0]*rate[0],hrs[1]*rate[1]],baseP=[base[0]*A,base[1]*A];
  let bl=0;if(!plank&&M.base==='emp'&&!reuse){const per=lenLL([...a.pts,a.pts[0]]);bl=Math.max(0,per-(I.attached?houseEdgeLen(a):0))}const bord=[28*bl,48*bl],bordS=[8*bl,18*bl];
  const proHT=[matP,struP,labP,baseP,bord,drPro].reduce(add2,[0,0]),supHT=[mat,stru,[bsup[0]*A,bsup[1]*A],bordS,drSup].reduce(add2,[0,0]);
  const r1=x=>nf(Math.round(x));const bud=[[`Fourniture : ${M.l.toLowerCase()}`,`${nf(A,1)} m² + ${Math.round((wf-1)*100)} % de coupe`,rg(matP)]];
  if(st)bud.push([st[0],`${nf(A,1)} m²`,rg(struP)]);
  bud.push([`Main-d’œuvre de pose (${nf(rate[0])} €/h HTVA)`,`${r1(hrs[0])} à ${r1(hrs[1])} h`,rg(labP)]);
  if(baseP[1])bud.push([o.base==='old'?'Démolition, terrassement et fondation':reuse?'Préparation du support existant':M.base==='plots'?'Préparation du sol : décapage, nivellement, géotextile':'Terrassement et fondation',`${nf(A,1)} m²`,rg(baseP)]);
  if(bl)bud.push(['Bordures fournies et posées',`${nf(bl,1)} m`,rg(bord)]);
  I.bud.filter(r=>Object.values(DRAINP).some(P=>P.l===r[0])||/^Location/.test(r[0])).forEach(r=>bud.push(r));
  const pro=amenTTC(proHT,I.vatPro),diy=I.diyOk?add2(amenTTC(supHT,21),amenTTC(I.rentHT,21)):pro.slice(),lab=[Math.max(0,pro[0]-supHT[0]*(1+I.vatPro/100)),Math.max(0,pro[1]-supHT[1]*(1+I.vatPro/100))];
  const tips=I.tips.slice();tips.push(`Repère : ≈ ${nf(pro[0]/A)} à ${nf(pro[1]/A)} € TVAC par m², fourniture, pose${baseP[1]?' et fondation':''} comprises. Les prix varient selon l’accès au chantier, les découpes et la gamme choisie : comparez au moins trois devis.`);
  return{...I,proHT,supHT,pro,diy,lab,bud,tips,hPro:(hrs[0]+hrs[1])/2}}catch(e){console.warn('budget terrasse',e);return I}}}

/* --- 8. trouver un entrepreneur, un pisciniste, un élagueur --- */
const gmaps25=q=>`https://www.google.com/maps/search/${encodeURIComponent(q+(PLACE.commune?' près de '+PLACE.commune:''))}`;
function proLinks25(L_){return L_.length?`<div class="chips prol"><span class="small">Trouver près de chez vous :</span>${L_.map(([q,l])=>`<a class="chipa" href="${esc(gmaps25(q))}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join('')}</div>`:''}
function proFor25(a){const o=a.opts||{};return a.kind==='piscine'?(o.type==='naturelle'?[['baignade naturelle étang de baignade','Spécialistes de baignade naturelle'],['pisciniste','Piscinistes']]:[['pisciniste','Piscinistes'],['construction piscine','Constructeurs de piscines']]):a.kind==='terrasse'?[[['bois','exo','composite'].includes(o.mat)?'entrepreneur terrasse bois composite':'entrepreneur terrasse dallage','Entrepreneurs de terrasses'],['paysagiste','Paysagistes']]:[['entreprise pavage allée','Entreprises de pavage'],['paysagiste','Paysagistes']]}
{const _ac25=amenCard;amenCard=function(a,I){let h=_ac25(a,I);const lk=proLinks25(proFor25(a)),i=h.indexOf('<details><summary>Étapes');h=i>0?h.slice(0,i)+lk+h.slice(i):h.replace(/<\/div>$/,lk+'</div>');
  if(AUD==='pub'){h=h.replace(/<table class="stack"><tbody>([\s\S]*?)<\/tbody><\/table>/,'<details class="techd"><summary>Détails techniques</summary><table class="stack"><tbody>$1</tbody></table></details>').replace('<details class="deck" open>','<details class="deck">').replace(/<h5>Budget indicatif<\/h5>(<table class="stack">[\s\S]*?<\/table>)/,'<details class="techd"><summary>Détail du budget</summary>$1</details>')}
  return h}}
{const _rd25=renderDemo;renderDemo=function(){_rd25();const box=$('#demoBox');if(!box||!(S.demo||[]).length)return;const ty=new Set(S.demo.map(d=>d.type)),L_=[];if(ty.has('arbre')||ty.has('souche'))L_.push(['élagueur abattage arbre','Élagueurs']);if(['massif','haie','ronces','arbuste','pelouse'].some(t=>ty.has(t)))L_.push(['jardinier entretien jardin','Jardiniers']);if(['terrasse','allee','dalle','abri','mur','cloture'].some(t=>ty.has(t)))L_.push(['entreprise démolition terrassement','Démolition et terrassement']);L_.push(['location conteneur déchets','Conteneurs']);box.insertAdjacentHTML('beforeend',`<div class="card">${proLinks25(L_)}</div>`)}}
{const _rp25b=renderPros;renderPros=function(){_rp25b();const box=$('#prosBox');if(!box)return;const L_=[];(S.amen||[]).forEach(a=>proFor25(a).slice(0,1).forEach(x=>L_.push(x)));if((S.demo||[]).some(d=>d.type==='arbre'||d.type==='souche'))L_.push(['élagueur abattage arbre','Élagueurs']);if((S.demo||[]).some(d=>['terrasse','allee','dalle','abri','mur'].includes(d.type)))L_.push(['entreprise démolition terrassement','Démolition et terrassement']);if((S.fences||[]).length)L_.push(['poseur de clôtures','Poseurs de clôtures']);
  const U=[...new Map(L_.map(x=>[x[0],x])).values()];if(U.length)box.insertAdjacentHTML('afterbegin',`<div class="card xcard"><h4>Spécialistes pour votre projet</h4>${proLinks25(U)}<p class="small">Recherche ouverte dans Google Maps autour de votre commune. Aucune entreprise n’est mise en avant contre rémunération.</p></div>`)}}

/* --- 9. résultats : tout ce qui est dessiné, végétal et fonctionnel --- */
const ORD25=['coherence','entretien','demo','massif','jardinieres','potager','verger','amenagements','cloture','pelouse','zones','fonct','arrosage','diy','machines'];
{const _ss25=stepSecs;stepSecs=function(n){const s=_ss25(n);if(n!==4)return s;const add=(k,c)=>{if(c&&!s.includes(k)&&document.getElementById(k))s.push(k)};
  add('massif',!!S.bed);add('potager',S.potagers.length>0);add('verger',S.orchards.length>0);add('amenagements',S.hedges.length+S.fruits.length+S.ponds.length+S.taluses.length+S.vines.length>0);add('pelouse',S.lawns.length>0);add('zones',(S.zones||[]).length>0);add('cloture',(S.fences||[]).length>0);add('fonct',(S.amen||[]).length>0);add('demo',(S.demo||[]).length>0);
  const ix=k=>{const i=ORD25.indexOf(k);return i<0?ORD25.length:i};return s.map((k,i)=>[k,i]).sort((x,y)=>ix(x[0])-ix(y[0])||x[1]-y[1]).map(x=>x[0])}}

/* --- 10. professionnels : « Mon terrain » et « Je dessine » réunis --- */
STEPS_PRO[1]=['Mon terrain et mon projet','Placez le terrain, dessinez l’existant (1), puis votre aménagement (2), végétal et fonctionnel : tout se fait sur la même carte.'];
{const _wg25=wizGo;wizGo=function(n){if(n===3&&AUD!=='pub'){S.phase='create';n=1}return _wg25(n)}}
if(STEPMORE0[1]&&!STEPMORE0[1].some(x=>x[0]==='patri'))STEPMORE0[1].push(['patri','Patrimoine paysager local']);
try{applySteps();if(WZ.on)wizApply()}catch(e){}

/* --- 11. patrimoine paysager local (version professionnelle) --- */
const PATRI={
 lit:{n:'Littoral et polders',mat:['Briques rouges ou jaunes locales, klinkers et pavés de rue (kasseien)','Ganivelles et clôtures en châtaignier dans les dunes','Dalles et bordures en pierre bleue pour les seuils'],arb:['Saule blanc têtard (Salix alba)','Frêne (Fraxinus excelsior)','Aulne glutineux (Alnus glutinosa)','Peuplier en rangées brise-vent'],haie:['Argousier (Hippophae rhamnoides)','Troène commun (Ligustrum vulgare)','Sureau noir (Sambucus nigra)','Églantier (Rosa canina)','Aubépine (Crataegus monogyna)'],viv:['Oyat (Ammophila arenaria) dans les dunes','Iris des marais (Iris pseudacorus)','Salicaire (Lythrum salicaria)','Roseau (Phragmites australis) au bord des fossés'],trad:['Rangées d’arbres brise-vent autour des fermes des polders','Saules têtards le long des fossés et des wateringues','Jardins abrités du vent par des haies basses taillées']},
 flb:{n:'Flandre sablonneuse et sablo-limoneuse',mat:['Brique rouge, klinkers et pavés de rue (kasseien)','Tuiles en terre cuite','Haies taillées et clôtures en bois plutôt que murs'],arb:['Chêne pédonculé (Quercus robur)','Charme (Carpinus betulus)','Aulne glutineux (Alnus glutinosa)','Bouleau verruqueux (Betula pendula)','Saule têtard'],haie:['Charme taillé (haagbeuk)','Aubépine (Crataegus monogyna)','Noisetier (Corylus avellana)','Houx (Ilex aquifolium)','Prunellier (Prunus spinosa)'],viv:['Reine-des-prés (Filipendula ulmaria)','Iris des marais (Iris pseudacorus)','Fougère mâle (Dryopteris filix-mas)','Digitale pourpre (Digitalis purpurea) en lisière'],trad:['Drèves (dreven) menant aux fermes et châteaux','Saules têtards et talus boisés (houtkanten) en bordure des champs','Jardin de ferme (boerentuin) : potager, fleurs à couper, bordures taillées']},
 cam:{n:'Campine',mat:['Brique de Campine, bois et gravier','Grès ferrugineux local par endroits','Clôtures en bois et haies plutôt que murs'],arb:['Pin sylvestre (Pinus sylvestris), planté en masse au XIXe siècle','Chêne pédonculé (Quercus robur)','Bouleau verruqueux (Betula pendula)','Sorbier des oiseleurs (Sorbus aucuparia)'],haie:['Bourdaine (Frangula alnus)','Genêt à balais (Cytisus scoparius)','Sureau noir (Sambucus nigra)','Piment royal (Myrica gale) en sol humide'],viv:['Callune (Calluna vulgaris)','Molinie (Molinia caerulea)','Canche flexueuse (Deschampsia flexuosa)','Fougère aigle (Pteridium aquilinum)'],trad:['Landes à bruyère et bosquets de pins sur sable','Fermes campinoises allongées, entourées de chênes','Sols sableux acides : préférez les plantes de lande et de sous-bois']},
 bxl:{n:'Bruxelles',mat:['Pierre bleue pour seuils, bordures et marches','Pavés de porphyre (Quenast, Lessines) et pavés de grès','Brique, et grès lédien (pierre de Gobertange) sur les bâtiments anciens'],arb:['Hêtre (Fagus sylvatica), forêt de Soignes','Chêne pédonculé (Quercus robur)','Tilleul (Tilia) en alignement','Charme (Carpinus betulus)'],haie:['Charme taillé','Aubépine (Crataegus monogyna)','Houx (Ilex aquifolium)','Noisetier (Corylus avellana)'],viv:['Jacinthe des bois (Hyacinthoides non-scripta)','Anémone sylvie (Anemone nemorosa)','Fougère mâle (Dryopteris filix-mas)','Lierre (Hedera helix)'],trad:['Jardins en intérieur d’îlot, à préserver et à végétaliser','Parcs paysagers du XIXe siècle et alignements de tilleuls','Potagers familiaux et jardins de façade']},
 hes:{n:'Région limoneuse (Hesbaye, Brabant, Hainaut)',mat:['Brique rouge, et silex ou tuffeau en Hesbaye','Pierre de Gobertange en Brabant, pierre bleue (petit granit) en Hainaut','Pavés de porphyre de Quenast et de Lessines'],arb:['Pommiers, poiriers et cerisiers en vergers hautes-tiges','Frêne (Fraxinus excelsior)','Érable champêtre (Acer campestre)','Saule têtard','Noyer (Juglans regia) autour des fermes'],haie:['Aubépine (Crataegus monogyna)','Prunellier (Prunus spinosa)','Viorne obier (Viburnum opulus)','Cornouiller sanguin (Cornus sanguinea)','Noisetier (Corylus avellana)'],viv:['Coquelicot et bleuet en bord de champ (annuelles)','Mauve musquée (Malva moschata)','Knautie des champs (Knautia arvensis)','Fougère mâle à l’ombre'],trad:['Fermes en carré avec verger et mare','Chemins creux bordés de haies vives','Alignements de saules têtards et de peupliers le long des ruisseaux']},
 her:{n:'Pays de Herve et Est',mat:['Brique, colombages, moellons de calcaire et de grès','Pierre bleue pour les encadrements','Haies vives plutôt que clôtures'],arb:['Pommiers, poiriers, pruniers et cerisiers hautes-tiges','Hêtre (Fagus sylvatica)','Chêne pédonculé (Quercus robur)','Frêne (Fraxinus excelsior)'],haie:['Aubépine taillée (Crataegus monogyna)','Charme (Carpinus betulus)','Hêtre taillé','Noisetier (Corylus avellana)','Houx (Ilex aquifolium)'],viv:['Cardamine des prés (Cardamine pratensis)','Fougère mâle (Dryopteris filix-mas)','Géranium des bois (Geranium sylvaticum)','Reine-des-prés (Filipendula ulmaria)'],trad:['Bocage : prairies entourées de haies taillées','Prés-vergers hautes-tiges, base du sirop de Liège','Haies basses taillées chaque année à hauteur de clôture']},
 con:{n:'Condroz, Famenne et Entre-Sambre-et-Meuse',mat:['Moellons de calcaire et de grès, pierre bleue (petit granit)','Murets en pierre sèche','Ardoise ou tuiles sur les dépendances'],arb:['Chêne sessile et pédonculé (Quercus)','Charme (Carpinus betulus)','Hêtre (Fagus sylvatica)','Érable champêtre (Acer campestre)','Merisier (Prunus avium)'],haie:['Cornouiller mâle (Cornus mas)','Viorne lantane (Viburnum lantana)','Troène commun (Ligustrum vulgare)','Prunellier (Prunus spinosa)','Églantier (Rosa canina)'],viv:['Origan (Origanum vulgare)','Sauge des prés (Salvia pratensis)','Scabieuse colombaire (Scabiosa columbaria)','Clématite des haies (Clematis vitalba)'],trad:['Fermes et châteaux-fermes en pierre','Murets de pierre sèche et pelouses calcaires pâturées','Sol calcaire sur les tiges et les vallées : vérifiez le pH']},
 ard:{n:'Ardenne',mat:['Schiste, grès et quartzite en moellons','Ardoise en toiture et en dallage','Bois (mélèze, chêne) pour clôtures et bardages'],arb:['Hêtre (Fagus sylvatica)','Chêne sessile (Quercus petraea)','Bouleau pubescent (Betula pubescens)','Sorbier des oiseleurs (Sorbus aucuparia)'],haie:['Hêtre taillé en haie coupe-vent','Noisetier (Corylus avellana)','Sureau à grappes (Sambucus racemosa)','Genêt à balais (Cytisus scoparius)'],viv:['Digitale pourpre (Digitalis purpurea)','Myrtille (Vaccinium myrtillus)','Callune (Calluna vulgaris)','Fougère aigle et fougère femelle (Athyrium filix-femina)'],trad:['Haies de hêtres taillés autour des fermes contre le vent','Prairies de fauche et vergers rustiques','Sols acides et climat rude : plantes rustiques, plantation au printemps']},
 lor:{n:'Lorraine belge (Gaume)',mat:['Calcaire jaune et grès de Luxembourg','Tuiles canal sur les maisons anciennes','Usoirs : espace pavé ou enherbé devant les maisons'],arb:['Hêtre (Fagus sylvatica)','Chêne sessile (Quercus petraea)','Alisier blanc (Sorbus aria)','Mirabelliers et quetschiers en vergers'],haie:['Cornouiller mâle (Cornus mas)','Viorne lantane (Viburnum lantana)','Troène commun (Ligustrum vulgare)','Prunellier (Prunus spinosa)'],viv:['Sauge des prés (Salvia pratensis)','Origan (Origanum vulgare)','Primevère officinale (Primula veris)','Hellébore fétide (Helleborus foetidus)'],trad:['Villages-rues lorrains et usoirs devant les maisons','Vergers de mirabelles et de quetsches','Climat le plus doux de Wallonie, sols souvent calcaires']}};
function patriRegion(){const la=S.lat,lo=S.lon;if(la==null)return null;if(inBox(BXL,la,lo))return'bxl';if(!inBox(BE,la,lo))return null;if((la>51.05&&lo<3.3)||(la>51.2&&lo<3.95))return'lit';if(la>=50.95&&lo>=4.7)return'cam';if(lo>=5.7&&la>=50.55)return'her';if(lo>=5.65&&la<50.55)return'ard';if(lo>=4.85&&la>=50.6&&la<50.95)return'hes';if(la>=50.75)return'flb';if(la>=50.45)return'hes';if(la<49.75)return'lor';if(lo>=5.55||la<50.05)return'ard';return'con'}
const PATRI_SYS='Tu es historien des jardins et paysagiste en Belgique. Cherche sur le web le patrimoine paysager de la commune indiquée : inventaire du patrimoine (Agence wallonne du Patrimoine, Inventaris Onroerend Erfgoed, urban.brussels), arbres et haies remarquables, parcs et jardins historiques, matériaux traditionnels du bâti et des abords (pierres, briques, pavés, clôtures), plantes indigènes ou très utilisées localement. N’affirme que ce que disent les sources trouvées et signale ce qui reste incertain. Réponds en français, en texte brut, avec ces titres sur une ligne chacun, suivis de tirets : En bref, Paysage et histoire, Matériaux traditionnels, Plantes locales et indigènes, Éléments remarquables, Sources. 260 mots au maximum.';
const patriKey=()=>'plantania:patri:'+(PLACE.commune||'').toLowerCase();
function patriGet(){try{return JSON.parse(localStorage.getItem(patriKey())||'null')}catch(e){return null}}
function renderPatri(){const box=$('#patriBox');if(!box)return;const k=patriRegion(),P=k&&PATRI[k],c=PLACE.commune,ai=patriGet();
  const col=(t,L_)=>`<div><h5>${t}</h5><ul class="small">${L_.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
  box.innerHTML=(P?`<div class="card"><h4>${esc(P.n)}${c?` · ${esc(c)}`:''}</h4><p class="small">Région naturelle estimée d’après la position du terrain. Ces repères aident à composer un aménagement qui s’inscrit dans le paysage local : à confirmer sur place et auprès de la commune.</p><div class="patg">${col('Matériaux traditionnels',P.mat)}${col('Arbres du paysage',P.arb)}${col('Haies et arbustes',P.haie)}${col('Vivaces, graminées et fougères',P.viv)}${col('Traditions paysagères',P.trad)}</div></div>`:`<div class="card"><p class="small">${S.lat==null?'Placez d’abord le terrain sur la carte.':'Repères régionaux disponibles pour la Belgique uniquement. La recherche par IA ci-dessous fonctionne partout.'}</p></div>`)
   +`<div class="card lawai"><h4>Histoire paysagère de ${c?esc(c):'la commune'}</h4>${ai?lawHtml(ai):'<p class="small">L’IA cherche l’inventaire du patrimoine, les arbres et jardins remarquables, les matériaux et les plantes typiques de la commune, avec les liens vers les sources.</p>'}<div class="chips"><button type="button" id="patriGo" class="${ai?'':'pri'}"${c?'':' disabled'}>${ai?'Actualiser la recherche':'Rechercher l’histoire paysagère de la commune'}</button></div></div>`}
$('#patri').addEventListener('click',async e=>{if(!e.target.closest('#patriGo'))return;const b=$('#patriGo');if(!aiReady()){toast('La recherche par IA n’est pas activée sur ce site (serveur relais).');return}b.disabled=true;b.textContent='Recherche en cours… (30 à 60 secondes)';
  try{const k=patriRegion(),r=await askWeb(PATRI_SYS,`Commune : ${PLACE.commune}${PLACE.cp?' ('+PLACE.cp+')':''}, ${PLACE.region||'Belgique'}.${k?' Région naturelle : '+PATRI[k].n+'.':''}\nQuel est le patrimoine paysager de cette commune, et quels matériaux et plantes y sont traditionnels ou indigènes ?`,4);
    try{localStorage.setItem(patriKey(),JSON.stringify({...r,date:new Date().toLocaleDateString('fr-BE'),commune:PLACE.commune}))}catch(err){}}catch(err){toast('Recherche impossible : '+(err.message||err))}renderPatri()});
{const _at25=applyTabs;applyTabs=function(sel){_at25(sel);if(sel.includes('patri'))renderPatri()}}
{const _rpl25=renderPros;renderPros=function(){_rpl25();if(!$('#patri').classList.contains('tabhide'))renderPatri()}}
{const _vs25=v4Sections;v4Sections=function(){const o=_vs25();try{const k=AUD==='pro'&&patriRegion();if(k){const P=PATRI[k],ai=patriGet(),i=o.findIndex(s=>s.title==='BUDGET ESTIMATIF');
  const sec={title:'PATRIMOINE PAYSAGER LOCAL',intro:`${P.n}${PLACE.commune?' · '+PLACE.commune:''}. Repères pour inscrire l’aménagement dans le paysage local (à confirmer sur place).`,tables:[{head:['Thème','Éléments typiques'],rows:[['Matériaux traditionnels',P.mat.join(' ; ')],['Arbres du paysage',P.arb.join(' ; ')],['Haies et arbustes',P.haie.join(' ; ')],['Vivaces, graminées, fougères',P.viv.join(' ; ')],['Traditions paysagères',P.trad.join(' ; ')]],w:[3200,11638]}],
   bullets:ai&&ai.text?ai.text.split(/\n+/).map(s=>s.replace(/^[-•]\s*/,'').trim()).filter(Boolean).slice(0,14):[],bh:ai?`Recherche sur la commune (IA, ${ai.date||''})`:''};
  i>=0?o.splice(i,0,sec):o.push(sec)}}catch(e){}return o}}
{const _t25=toast;toast=function(m,o){const r=_t25(m,o);const box=$('#toasts');if(box)while(box.children.length>2)box.firstElementChild.remove();return r}}
/* --- particulier : moins de détails techniques affichés d’emblée --- */
const PUBFOLD25=['Contrôles agronomiques et paysagers'];
{const _fp25=foldPass;foldPass=function(){_fp25();if(AUD!=='pub')return;document.querySelectorAll('section.band .card > h4').forEach(h=>{const c=h.parentElement;if(c.dataset.pubf)return;const t=[...h.childNodes].filter(n=>!(n.classList&&n.classList.contains('foldb'))).map(n=>n.textContent).join('').trim();if(!PUBFOLD25.includes(t))return;c.dataset.pubf='1';const b=h.querySelector('.foldb'),k=foldKey(h);if(b&&!FOLD.has(k)&&!c.classList.contains('folded'))setFold(b,true,c,k,1)})}}
/* --- optimisation : ombres pré-calculées pendant un recalcul de l’ensoleillement --- */
let OBSC25=null;
function obsPre25(){/* horizon : hauteur d’obstruction maximale par demi-degré d’azimut (toutes saisons / feuillage persistant seulement) */
  const A=new Float32Array(720).fill(-90),E=new Float32Array(720).fill(-90);obsAll().forEach(o=>{const r=relObs(o),d=Math.max(r.dist,0.5),hw=d<=o.w/2?180:Math.atan(o.w/2/d)/R,ang=Math.atan(o.h/d)/R,cad=o.type==='caduc';
    if(hw>=180){for(let i=0;i<720;i++){if(ang>A[i])A[i]=ang;if(!cad&&ang>E[i])E[i]=ang}return}const a0=Math.ceil((r.brg-hw)*2),a1=Math.floor((r.brg+hw)*2);for(let k=a0;k<=a1;k++){const i=((k%720)+720)%720;if(ang>A[i])A[i]=ang;if(!cad&&ang>E[i])E[i]=ang}});return{A,E}}
blocked=function(sp,month){const H=OBSC25||obsPre25(),i=((Math.round(sp.az*2)%720)+720)%720;return sp.alt<((month>=11||month<=3)?H.E:H.A)[i]};
{const _su25=sunUpdate;sunUpdate=function(){S.samples=null;OBSC25=obsPre25();try{return _su25()}finally{OBSC25=null}}}
{const _rd25=readout;readout=function(){const k=!OBSC25;if(k)OBSC25=obsPre25();try{return _rd25()}finally{if(k)OBSC25=null}}}
window.__p25={amenInfo:a=>amenInfo(a),stepSecs:n=>stepSecs(n),patriRegion,align25,edOpenQuiet,curPhase:()=>curPhase(),wzOrder:()=>wzOrder()};

const CVRAW={
/* arbres et grands arbustes */
'Acer campestre':"Elsrijk;10;vert;Couronne ovale et régulière, peu sensible à l’oïdium;r",
'Betula pendula':"Youngii;4;vert;Port pleureur en dôme, pour les petits jardins;c|Fastigiata;15;vert;Port colonnaire étroit;c",
'Carpinus betulus':"Fastigiata;12;vert;Port en flamme, compact, pour les petits espaces;c|Frans Fontaine;10;vert;Colonnaire très étroit, garde sa forme sans taille;c",
'Sorbus aucuparia':"Sheerwater Seedling;8;blanc;Couronne étroite, fruits orange;c|Fastigiata;7;blanc;Port colonnaire, grosses grappes de fruits rouges;c",
'Acer palmatum':"Bloodgood;5;rouge;Feuillage pourpre tout l’été, rouge vif en automne|Osakazuki;5;vert;Vert l’été, écarlate en automne : l’un des plus beaux|Sango-kaku;5;vert;Jeunes rameaux rouge corail, superbes en hiver|Garnet;1.5;rouge;Dissectum : feuillage finement découpé, port en dôme;c",
'Cercis siliquastrum':"Bodnant;6;rose;Fleurs rose pourpre plus soutenues|Alba;6;blanc;Fleurs blanches",
'Cornus mas':"Golden Glory;5;jaune;Port plus dressé, floraison abondante|Jolico;4;jaune;Gros fruits comestibles (cornouilles)",
'Viburnum opulus':"Roseum;3;blanc;Boule de neige : grosses boules blanches, sans fruits;s|Compactum;1.5;blanc;Compact, fleurs et fruits rouges;c|Xanthocarpum;3;blanc;Fruits jaune doré en automne",
'Hydrangea paniculata':"Limelight;1.8;blanc;Panicules vert citron puis blanches et rosées|Vanille Fraise;1.8;blanc rose;Fleurs blanches virant au rose fraise|Bobo;0.8;blanc;Nain, couvert de fleurs, idéal en petit massif ou en pot;c|Little Lime;1;blanc;Version compacte de Limelight;c",
'Corylus avellana':"Contorta;2.5;jaune;Rameaux tortueux, décoratifs en hiver|Red Majestic;3;jaune;Feuillage pourpre et rameaux tortueux",
'Ilex aquifolium':"J.C. van Tol;5;blanc;Feuilles presque sans piquants, fructifie seul (autofertile)|Argentea Marginata;6;blanc;Feuillage bordé de crème, femelle à baies rouges|Alaska;5;blanc;Port étroit, baies abondantes;c",
'Euonymus europaeus':"Red Cascade;3;vert;Fruits rose vif très abondants, feuillage rouge en automne",
'Salvia rosmarinus':"Miss Jessopp's Upright;1.5;bleu;Port dressé, bon pour une petite haie|Arp;1.2;bleu;L’un des plus résistants au froid;r|Prostratus;0.3;bleu;Rampant, retombe des murets;c|Majorca Pink;1;rose;Fleurs roses",
'Taxus baccata':"Fastigiata;5;vert;If d’Irlande, colonnaire|Repandens;0.6;vert;Étalé, couvre-sol pour l’ombre;c|Summergold;1;vert;Feuillage doré, étalé;c",
'Buxus sempervirens':"Suffruticosa;0.5;vert;Buis nain pour les bordures (sensible à la pyrale et au dépérissement : préférez un houx crénelé);c|Rotundifolia;2;vert;Feuilles rondes, plus vigoureux",
'Ilex crenata':"Dark Green;1;blanc;Le meilleur remplaçant du buis pour les bordures;r|Glorie Gem;0.8;blanc;Très compact, petites feuilles;c|Fastigiata;1.5;blanc;Colonnaire étroit, pour rythmer un massif",
'Rosa (hybride anglais)':"Olivia Rose Austin;1.2;rose;Rose tendre, très résistant aux maladies;r|Desdemona;1.2;blanc;Blanc pêche, parfumé, résistant;r|The Poet's Wife;1.2;jaune;Jaune vif, parfum citronné;r|Munstead Wood;1;rouge;Cramoisi profond, très parfumé|Princess Anne;1.2;rose;Rose fuchsia, très florifère;r",
'Rhododendron (azalée japonaise)':"Madame van Hecke;0.8;rose;Rose et blanc, très florifère|Johanna;0.8;rouge;Rouge carmin, feuillage bronze en hiver|Palestrina;1;blanc;Blanc pur|Blue Danube;0.8;violet;Violet bleuté",
'Hamamelis × intermedia':"Arnold Promise;3;jaune;Jaune vif, parfumé, floraison en février|Jelena;3;orange;Orange cuivré, bel automne|Diane;3;rouge;Rouge rubis, feuillage flamboyant|Pallida;3;jaune;Jaune soufre, très parfumé",
'Pieris japonica':"Mountain Fire;1.5;blanc;Jeunes pousses rouge vif|Debutante;0.8;blanc;Compact, épis dressés;c|Little Heath;0.6;blanc;Feuillage panaché, nain;c",
'Syringa vulgaris':"Madame Lemoine;4;blanc;Fleurs doubles blanches, parfumées|Sensation;3.5;violet;Pourpre bordé de blanc|Charles Joly;3.5;violet;Pourpre foncé double|Katherine Havemeyer;4;rose;Lilas rosé double",
'Philadelphus coronarius':"Aureus;2;blanc;Feuillage jaune doré au printemps, fleurs parfumées",
'Weigela florida':"Bristol Ruby;2;rouge;Rouge rubis|Foliis Purpureis;1.2;rose;Feuillage pourpre, compact;c|Nana Variegata;1;rose;Feuillage panaché de crème;c|Alexandra;1.2;rose;Feuillage pourpre foncé (Wine and Roses);c",
'Deutzia gracilis':"Nikko;0.5;blanc;Nain et étalé, couvre-sol fleuri;c",
'Spiraea japonica':"Anthony Waterer;0.9;rose;Rose carmin|Goldflame;0.8;rose;Jeune feuillage cuivre et or|Little Princess;0.6;rose;Petit et dense;c|Shirobana;0.8;blanc rose;Fleurs blanches et roses sur le même pied",
'Dasiphora fruticosa':"Abbotswood;0.8;blanc;Blanc pur, très florifère|Goldfinger;1;jaune;Grandes fleurs jaune d’or|Red Ace;0.6;orange;Rouge orangé (pâlit en plein soleil);c|Pink Beauty;0.8;rose;Rose, longue floraison",
'Abelia × grandiflora':"Edward Goucher;1.5;rose;Rose lilas|Kaleidoscope;0.8;blanc;Feuillage jaune et orange, compact;c|Francis Mason;1.2;blanc rose;Feuillage panaché de jaune",
'Caryopteris × clandonensis':"Heavenly Blue;1;bleu;Bleu intense|Grand Bleu;0.9;bleu;Bleu foncé, feuillage vert sombre|Worcester Gold;0.9;bleu;Feuillage doré",
'Cotinus coggygria':"Royal Purple;3;rose;Feuillage pourpre foncé|Young Lady;2;rose;Fleurit dès le jeune âge, compact;c|Golden Spirit;3;rose;Feuillage jaune d’or, orange en automne",
'Hydrangea macrophylla':"Endless Summer;1.2;bleu rose;Refleurit sur le bois de l’année : fleurit même après un hiver rude;r|Mariesii Perfecta;1.5;bleu;Fleurs plates (lacecap), bleues en sol acide|Madame Emile Mouillère;1.5;blanc;Boules blanches, supporte bien le soleil",
'Hydrangea quercifolia':"Snow Queen;1.8;blanc;Grandes panicules, feuillage rouge en automne|Pee Wee;1;blanc;Compact;c|Snowflake;1.8;blanc;Fleurs doubles",
'Fuchsia magellanica':"Riccartonii;1.5;rouge violet;Le plus rustique, en haie libre;r|Alba;1.2;blanc;Blanc rosé|Versicolor;1;rouge;Feuillage gris rosé panaché;c",
'Choisya ternata':"Sundance;1.2;blanc;Feuillage jaune d’or, à mi-ombre (brûle au soleil);c",
'Nandina domestica':"Fire Power;0.6;blanc;Nain, feuillage rouge vif en hiver;c|Obsessed;1;blanc;Jeunes pousses rouges toute l’année",
'Sambucus nigra':"Black Lace;2.5;rose;Feuillage pourpre découpé, fleurs roses|Aurea;3;blanc;Feuillage doré",
'Ribes sanguineum':"King Edward VII;1.5;rouge;Rouge cramoisi, compact;c|Pulborough Scarlet;2.5;rouge;Rouge vif, vigoureux|White Icicle;2;blanc;Fleurs blanches",
'Daphne mezereum':"Alba;1;blanc;Fleurs blanches, fruits jaunes (toxiques)",
'Magnolia × soulangeana':"Lennei;6;rose;Pourpre rosé à l’extérieur, blanc à l’intérieur|Alba Superba;6;blanc;Blanc pur, parfumé|Rustica Rubra;6;rose;Rose rouge",
'Cornus kousa':"China Girl;5;blanc;Fleurit jeune, très florifère|Satomi;4;rose;Bractées roses;c|Milky Way;5;blanc;Floraison très abondante",
'Quercus robur':"Fastigiata;15;vert;Chêne colonnaire : 3 m de large seulement;c",
'Tilia cordata':"Greenspire;15;blanc;Couronne pyramidale régulière|Rancho;10;blanc;Compact, petites feuilles;c",
'Prunus avium':"Plena;10;blanc;Fleurs doubles, sans fruits;s",
'Parrotia persica':"Vanessa;6;rouge;Port dressé, plus étroit;c|Persian Spire;5;rouge;Colonnaire, feuillage pourpré au printemps;c",
'Pinus sylvestris':"Watereri;3;vert;Pin nain bleuté, croissance lente;c|Fastigiata;8;vert;Colonnaire étroit;c",
'Myrtus communis':"Tarentina;1;blanc;Compact à petites feuilles;c",
'Arbutus unedo':"Atlantic;2.5;blanc;Compact, fructifie jeune;c|Rubra;3;rose;Fleurs roses",
'Elaeagnus × ebbingei':"Limelight;3;blanc;Feuilles panachées de jaune au centre|Gilt Edge;2.5;blanc;Feuilles bordées de jaune d’or",
'Santolina chamaecyparissus':"Lemon Queen;0.5;jaune;Fleurs jaune citron pâle|Small-Ness;0.3;jaune;Très compact;c",
'Helichrysum italicum':"Korma;0.5;jaune;Feuillage argenté, très parfumé (odeur de curry)",
'Salvia officinalis':"Purpurascens;0.5;violet;Feuillage pourpre|Icterina;0.4;violet;Feuillage panaché de jaune;c|Berggarten;0.5;violet;Grandes feuilles rondes, fleurit peu, très rustique;r",
'Lavandula angustifolia':"Hidcote;0.4;violet;Violet foncé, compact;c|Munstead;0.4;violet;Bleu lavande, précoce;c|Rosea;0.4;rose;Rose tendre|Arctic Snow;0.4;blanc;Blanc pur",
/* vivaces */
'Geranium macrorrhizum':"Ingwersen's Variety;0.3;rose;Rose pâle, très couvrant|Bevan's Variety;0.3;rose;Magenta|Spessart;0.3;blanc;Blanc rosé",
'Echinacea purpurea':"Magnus;1;rose;Pétales horizontaux rose soutenu|White Swan;0.7;blanc;Blanc crème|Rubinstern;0.8;rose;Rouge rubis|PowWow Wild Berry;0.5;rose;Compact, fleurit dès la première année;c",
'Nepeta × faassenii':"Walker's Low;0.6;bleu;Le plus utilisé, longue floraison|Six Hills Giant;0.9;bleu;Grand et vigoureux|Kit Kat;0.3;bleu;Nain, pour les bordures;c|Snowflake;0.4;blanc;Fleurs blanches;c",
'Salvia nemorosa':"Caradonna;0.6;violet;Tiges noires, épis violets dressés|Ostfriesland;0.45;violet;Violet profond;c|Schneehügel;0.4;blanc;Blanc;c|Rosakönigin;0.5;rose;Rose",
'Achillea millefolium':"Terracotta;0.8;orange;Orange puis jaune paille|Cerise Queen;0.6;rouge;Rouge cerise|Lilac Beauty;0.6;violet;Lilas|Paprika;0.6;rouge;Rouge à cœur jaune",
'Hosta sieboldiana':"Elegans;0.7;blanc;Grandes feuilles bleutées gaufrées, résiste mieux aux limaces;r|Frances Williams;0.7;blanc;Feuilles bleues bordées de jaune",
'Astilbe × arendsii':"Fanal;0.6;rouge;Rouge foncé, feuillage bronze|Brautschleier;0.7;blanc;Blanc pur|Amethyst;0.8;violet;Lilas pourpré|Erica;0.8;rose;Rose",
'Anemone × hybrida':"Honorine Jobert;1.2;blanc;Blanc pur, classique|Königin Charlotte;0.9;rose;Rose, semi-double|Whirlwind;1.2;blanc;Blanc semi-double",
'Brunnera macrophylla':"Jack Frost;0.4;bleu;Feuilles argentées veinées de vert, éclaire l’ombre|Looking Glass;0.35;bleu;Feuilles entièrement argentées|Hadspen Cream;0.4;bleu;Feuilles bordées de crème",
'Pulmonaria officinalis':"Sissinghurst White;0.3;blanc;Fleurs blanches, feuilles tachetées|Blue Mist;0.3;bleu;Bleu pâle",
'Epimedium × versicolor':"Sulphureum;0.3;jaune;Jaune soufre, couvre-sol d’ombre sèche;r",
'Persicaria amplexicaulis':"Firetail;1.2;rouge;Rouge vif de juillet aux gelées|Alba;1;blanc;Blanc|Pink Elephant;0.5;rose;Compact;c|Orangofield;1;orange;Saumon orangé",
'Iris sibirica':"Caesar's Brother;0.9;violet;Violet foncé|Butter and Sugar;0.7;jaune blanc;Jaune et blanc|Silver Edge;0.7;bleu;Bleu bordé d’argent|Snow Queen;0.8;blanc;Blanc",
'Lythrum salicaria':"Robert;0.8;rose;Compact, rose vif;c|Blush;1;rose;Rose pâle|Zigeunerblut;1.2;rouge;Rouge pourpre",
'Alchemilla mollis':"Thriller;0.4;jaune;Plus florifère, feuillage plus net",
'Digitalis purpurea':"Alba;1.5;blanc;Blanc pur|Dalmatian Purple;0.9;rose;Fleurit dès la première année, compact;c|Pam's Choice;1.2;blanc;Blanc à gorge pourpre",
'Phlox paniculata':"David;1;blanc;Blanc parfumé, résiste à l’oïdium;r|Bright Eyes;0.8;rose;Rose pâle à œil carmin;c|Blue Paradise;1;bleu;Bleu violet|Starfire;0.8;rouge;Rouge cerise|Jeana;1.2;rose;Lilas rosé, résiste à l’oïdium, adoré des papillons;r",
'Delphinium elatum (hybrides)':"Galahad;1.8;blanc;Blanc pur (Pacific Giants)|King Arthur;1.8;violet;Violet royal à œil blanc|Black Knight;1.8;violet;Violet très foncé|Summer Skies;1.7;bleu;Bleu ciel|Magic Fountains Sky Blue;0.9;bleu;Compact, n’a pas besoin de tuteur;c",
'Campanula lactiflora':"Loddon Anna;1.2;rose;Rose lilas|Prichard's Variety;0.8;violet;Violet bleu, plus court;c|Pouffe;0.3;bleu;Nain en coussin;c",
'Veronicastrum virginicum':"Fascination;1.6;violet;Rose lilas|Album;1.5;blanc;Blanc|Lavendelturm;1.8;violet;Lavande|Erica;1.4;rose;Rose",
'Eutrochium maculatum':"Atropurpureum;2;rose;Tiges pourpres, ombelles rose foncé|Riesenschirm;2;rose;Très grandes ombelles",
'Sanguisorba officinalis':"Tanna;0.5;rouge;Compact;c|Red Thunder;1;rouge;Rouge foncé, tiges solides",
'Euphorbia characias':"Black Pearl;1;vert;Fleurs à œil noir|Silver Swan;0.8;vert;Feuillage panaché de blanc;c|Tasmanian Tiger;0.8;vert;Feuillage gris bordé de crème;c",
'Salvia yangii (Perovskia)':"Blue Spire;1.2;bleu;Le classique, bleu lavande|Little Spire;0.6;bleu;Compact, ne s’affaisse pas;c|Lacey Blue;0.5;bleu;Très compact;c",
'Ajuga reptans':"Atropurpurea;0.15;bleu;Feuillage pourpre|Burgundy Glow;0.15;bleu;Feuillage rose, crème et vert|Catlin's Giant;0.2;bleu;Grandes feuilles bronze, épis hauts",
'Clinopodium nepeta':"Blue Cloud;0.4;bleu;Nuage bleu pâle|White Cloud;0.4;blanc;Blanc|Triumphator;0.4;blanc;Très florifère",
'Oenothera lindheimeri':"Whirling Butterflies;0.8;blanc;Blanc, très léger|Siskiyou Pink;0.6;rose;Rose vif;c|Rosyjane;0.6;blanc rose;Blanc bordé de rose;c",
'Knautia macedonica':"Mars Midget;0.4;rouge;Compact, rouge rubis;c|Melton Pastels;0.7;rose;Mélange de rose, rouge et lilas",
'Centaurea montana':"Alba;0.5;blanc;Blanc|Amethyst in Snow;0.5;blanc;Blanc à cœur violet",
'Papaver orientale':"Patty's Plum;0.8;violet;Prune fumé|Beauty of Livermere;1;rouge;Rouge écarlate|Perry's White;0.8;blanc;Blanc à cœur noir|Princess Victoria Louise;0.8;rose;Rose saumon",
'Paeonia lactiflora':"Sarah Bernhardt;0.9;rose;Rose double, parfumée|Duchesse de Nemours;0.8;blanc;Blanc crème double, parfumée|Karl Rosenfield;0.8;rouge;Rouge cramoisi double|Bowl of Beauty;0.8;rose;Rose à cœur crème",
'Hemerocallis (hybrides)':"Stella de Oro;0.4;jaune;Nain, refleurit tout l’été;c|Pardon Me;0.5;rouge;Rouge, remontant;c|Frans Hals;0.7;orange;Orange et jaune|Chicago Apache;0.7;rouge;Rouge écarlate|Joan Senior;0.6;blanc;Blanc crème",
'Iris germanica (hybrides)':"Jane Phillips;0.9;bleu;Bleu clair parfumé|Immortality;0.8;blanc;Blanc, refleurit en automne|Superstition;0.9;violet;Violet presque noir",
'Coreopsis verticillata':"Moonbeam;0.5;jaune;Jaune pâle, très longue floraison|Zagreb;0.4;jaune;Jaune d’or, compact;c|Grandiflora;0.7;jaune;Grandes fleurs",
'Helenium (hybrides)':"Moerheim Beauty;1;rouge;Rouge cuivré|Sahin's Early Flowerer;1;orange;Orange et rouge, fleurit de juin à octobre|Waltraut;0.9;orange;Orange brun|Rubinzwerg;0.8;rouge;Rouge rubis, compact;c",
'Monarda didyma':"Jacob Cline;1.2;rouge;Rouge vif, résiste à l’oïdium;r|Croftway Pink;1;rose;Rose|Blaustrumpf;1;violet;Violet bleuté",
'Astrantia major':"Roma;0.6;rose;Rose, fleurit longtemps, ne se ressème pas;s|Ruby Wedding;0.6;rouge;Rouge rubis|Shaggy;0.7;blanc;Blanc à longues bractées|Claret;0.5;rouge;Bordeaux foncé",
'Geranium sanguineum':"Max Frei;0.2;rose;Magenta, compact;c|Album;0.3;blanc;Blanc|Striatum;0.15;rose;Rose pâle veiné;c",
'Geranium pratense':"Mrs Kendall Clark;0.7;bleu;Bleu gris veiné de blanc|Black Beauty;0.5;violet;Feuillage pourpre foncé",
'Geranium phaeum':"Samobor;0.6;violet;Feuilles marquées d’une tache brune|Album;0.6;blanc;Blanc",
'Centranthus ruber':"Albus;0.7;blanc;Blanc|Coccineus;0.7;rouge;Rouge soutenu",
'Verbascum chaixii':"Album;1;blanc;Blanc à cœur pourpre",
'Stachys byzantina':"Silver Carpet;0.15;rose;Ne fleurit pas : tapis argenté net;c|Big Ears;0.3;rose;Très grandes feuilles argentées",
'Linum perenne':"Album;0.5;blanc;Blanc|Saphir;0.3;bleu;Compact, bleu intense;c",
'Eryngium planum':"Blaukappe;0.6;bleu;Bleu intense;c|Blue Hobbit;0.3;bleu;Nain;c",
'Echinops ritro':"Veitch's Blue;0.9;bleu;Bleu acier, refleurit si on coupe|Platinum Blue;0.9;bleu;Bleu argenté",
'Liatris spicata':"Kobold;0.4;violet;Compact;c|Floristan Weiss;0.8;blanc;Blanc",
'Bistorta officinalis':"Superba;0.7;rose;Plus florifère",
'Thalictrum delavayi':"Hewitt's Double;1.2;violet;Fleurs doubles lilas|Album;1.4;blanc;Blanc",
'Actaea simplex':"Brunette;1.4;blanc;Feuillage pourpre presque noir|White Pearl;1.2;blanc;Blanc, feuillage vert",
'Aquilegia vulgaris':"Nora Barlow;0.7;rose;Fleurs doubles rose et vert|William Guiness;0.7;violet;Pourpre noir et blanc",
'Bergenia cordifolia':"Purpurea;0.4;rose;Feuilles pourpres en hiver|Bressingham White;0.35;blanc;Blanc",
'Tiarella cordifolia':"Brandywine;0.25;blanc;Feuilles marquées de rouge, couvre-sol rapide",
'Lamium maculatum':"White Nancy;0.2;blanc;Blanc, feuillage argenté|Beacon Silver;0.2;rose;Rose, feuillage argenté|Pink Pewter;0.2;rose;Rose pâle",
'Polygonatum × hybridum':"Striatum;0.6;blanc;Feuilles rayées de crème",
'Galanthus nivalis':"Flore Pleno;0.15;blanc;Fleurs doubles",
'Crocus tommasinianus':"Ruby Giant;0.1;violet;Pourpre rubis|Barr's Purple;0.1;violet;Violet lilas",
'Tulipa (hybrides de Darwin)':"Apeldoorn;0.6;rouge;Rouge écarlate, revient plusieurs années|Pink Impression;0.6;rose;Rose|Golden Apeldoorn;0.6;jaune;Jaune d’or|Ivory Floradale;0.6;blanc;Ivoire|Daydream;0.5;orange;Jaune virant à l’orange",
'Camassia leichtlinii':"Caerulea;0.9;bleu;Bleu|Alba;0.9;blanc;Blanc crème",
'Muscari armeniacum':"Valerie Finnis;0.15;bleu;Bleu pâle|Blue Spike;0.15;bleu;Fleurs doubles",
'Leucanthemum × superbum':"Becky;1;blanc;Grandes fleurs, tiges solides|Silberprinzesschen;0.4;blanc;Compact;c|Wirral Supreme;0.8;blanc;Fleurs doubles",
'Thymus serpyllum':"Snowdrift;0.1;blanc;Blanc|Coccineus;0.1;rouge;Rouge pourpre",
'Armeria maritima':"Splendens;0.2;rose;Rose vif|Alba;0.2;blanc;Blanc|Düsseldorfer Stolz;0.2;rouge;Rouge carmin",
'Euphorbia epithymoides':"Bonfire;0.4;jaune;Feuillage pourpre, rouge en automne",
'Ligularia dentata':"Desdemona;1;orange;Revers des feuilles pourpre|Othello;1;orange;Feuillage pourpre|Britt Marie Crawford;0.8;orange;Feuillage presque noir",
'Erica carnea':"Springwood White;0.2;blanc;Blanc|Myretoun Ruby;0.2;rouge;Rouge rubis|December Red;0.2;rose;Rose foncé, très précoce",
'Calluna vulgaris':"Dark Beauty;0.3;rouge;Rouge cerise|Kinlochruel;0.3;blanc;Blanc double|Firefly;0.4;violet;Feuillage orange en hiver",
'Kniphofia uvaria (hybrides)':"Royal Standard;1;rouge jaune;Rouge et jaune|Percy's Pride;1;jaune;Jaune vert|Little Maid;0.6;blanc;Crème, compact;c|Alcazar;1;orange;Orange",
'Anthemis tinctoria':"E.C. Buxton;0.6;jaune;Jaune citron pâle|Sauce Hollandaise;0.6;blanc;Crème",
'Eryngium bourgatii':"Picos Blue;0.5;bleu;Bleu intense",
'Vinca minor':"Gertrude Jekyll;0.15;blanc;Blanc|Atropurpurea;0.15;violet;Pourpre|Illumination;0.15;bleu;Feuillage doré",
'Hedera helix':"Goldchild;0.2;vert;Feuilles bordées de jaune|Glacier;0.2;vert;Feuilles gris argent",
'Melissa officinalis':"Aurea;0.6;blanc;Feuillage panaché de jaune",
'Origanum vulgare':"Herrenhausen;0.5;rose;Rose foncé, très mellifère|Aureum;0.3;rose;Feuillage doré;c",
'Allium schoenoprasum':"Forescate;0.4;rose;Fleurs rose vif",
'Thymus vulgaris':"Compactus;0.2;rose;Compact;c|Silver Posie;0.25;rose;Feuillage panaché d’argent",
/* graminées */
'Stipa tenuissima':"Pony Tails;0.5;blond;Plus dense",
'Pennisetum alopecuroides':"Hameln;0.6;blond;Compact, fleurit tôt;c|Little Bunny;0.3;blond;Nain;c|Moudry;0.7;rouge;Épis noir pourpre|Cassian;0.7;blond;Épis crème, feuillage orange en automne",
'Molinia caerulea':"Moorhexe;0.7;blond;Port très dressé|Edith Dudszus;0.9;blond;Épis foncés|Heidebraut;1;blond;Feuillage doré en automne",
'Hakonechloa macra':"Aureola;0.35;vert;Feuillage rayé de jaune|All Gold;0.35;vert;Feuillage jaune d’or|Nicolas;0.3;vert;Rouge orangé en automne",
'Luzula sylvatica':"Marginata;0.4;blond;Feuilles bordées de crème|Aurea;0.3;blond;Feuillage doré en hiver",
'Festuca glauca':"Elijah Blue;0.3;blond;Bleu argenté, tient bien|Intense Blue;0.25;blond;Bleu soutenu|Golden Toupee;0.2;blond;Feuillage jaune",
'Miscanthus sinensis':"Gracillimus;1.6;blond;Feuillage très fin, élégant|Morning Light;1.4;blond;Feuillage liseré de blanc|Kleine Fontäne;1.3;blond rose;Fleurit dès juillet|Ferner Osten;1.4;rouge;Épis rouge cuivré|Adagio;1.2;blond;Compact;c|Zebrinus;1.8;blond;Feuilles barrées de jaune",
'Sporobolus heterolepis':"Tara;0.6;blond;Compact et dressé",
'Deschampsia cespitosa':"Goldtau;0.6;blond;Épis dorés;c|Bronzeschleier;0.9;blond;Voile bronze",
'Panicum virgatum':"Heavy Metal;1.2;blond;Feuillage bleu acier, très dressé|Shenandoah;1;rouge;Feuillage rouge dès l’été|Northwind;1.5;blond;Colonnaire, feuillage bleu-vert|Rehbraun;1.2;blond;Teintes brun-rouge en automne",
'Pennisetum orientale':"Karley Rose;0.8;rose;Épis rose fumé, longue floraison|Tall Tails;1.2;blond;Épis longs, crème",
'Chasmanthium latifolium':"River Mist;0.8;blond;Feuillage panaché de blanc",
'Liriope muscari':"Big Blue;0.35;violet;Violet, couvre-sol|Monroe White;0.35;blanc;Blanc|Variegata;0.3;violet;Feuilles bordées de jaune",
'Helictotrichon sempervirens':"Saphirsprudel;0.6;blond;Bleu intense, résiste à la rouille;r",
'Stipa gigantea':"Gold Fontaene;2;blond;Épis dorés plus abondants",
/* fougères */
'Dryopteris filix-mas':"Linearis Polydactyla;0.8;;Frondes finement découpées et ramifiées|Barnesii;1;;Port dressé et étroit;c|Crispa Cristata;0.6;;Frondes ondulées et crêtées;c",
'Athyrium filix-femina':"Lady in Red;0.8;;Tiges rouge vif|Frizelliae;0.3;;Frondes en chapelets de perles, nain;c|Victoriae;0.8;;Frondes croisées en treillis",
'Polystichum setiferum':"Plumosum Densum;0.5;;Frondes très divisées, plumeuses;c|Herrenhausen;0.6;;Frondes étalées en rosette",
'Asplenium scolopendrium':"Crispum;0.4;;Frondes ondulées|Cristatum;0.3;;Extrémités crêtées;c",
'Osmunda regalis':"Purpurascens;1.2;;Jeunes frondes pourpres",
'Dryopteris erythrosora':"Brilliance;0.5;;Jeunes frondes orange cuivré plus vif",
/* annuelles */
'Cosmos bipinnatus':"Purity;1;blanc;Blanc pur|Sonata;0.6;rose;Compact, mélange rose et blanc;c|Double Click;1;rose;Fleurs doubles",
'Tropaeolum majus':"Alaska;0.3;orange;Feuillage marbré de crème|Empress of India;0.3;rouge;Rouge foncé, feuillage bleuté",
'Calendula officinalis':"Indian Prince;0.6;orange;Orange foncé à revers rouge|Snow Princess;0.5;blanc;Crème",
'Nigella damascena':"Miss Jekyll;0.5;bleu;Bleu ciel|Persian Jewels;0.4;bleu blanc;Mélange bleu, rose et blanc",
'Zinnia elegans':"Queen Lime;0.8;jaune;Vert citron|Benary's Giant Scarlet;1;rouge;Rouge, grandes fleurs pour la coupe",
'Nicotiana sylvestris':"Only the Lonely;1.5;blanc;Blanc, parfumé le soir",
'Verbena bonariensis':"Lollipop;0.6;violet;Compact;c",
'Papaver rhoeas':"Shirley;0.6;rose rouge blanc;Mélange de coloris tendres|Angels' Choir;0.6;rose blanc;Doubles, pastel",
'Lobelia erinus':"Crystal Palace;0.15;bleu;Bleu foncé, feuillage bronze",
'Salvia farinacea':"Victoria;0.5;bleu;Bleu violet",
'Pelargonium peltatum':"Ville de Paris;0.3;rose;Cascade très florifère"
};

/* ================= v26 : cultivars ================= */
const CVDB={};Object.entries(CVRAW).forEach(([l,s])=>{CVDB[l]=s.split('|').map(x=>{const [n,h,c,note,fl]=x.split(';');return{n,h:parseFloat(h),c:(c||'').split(' ').filter(Boolean),note:note||'',r:/r/.test(fl||''),s:/s/.test(fl||''),cp:/c/.test(fl||'')}})});
S.cvSel=S.cvSel||{};
const cvBaseN=p=>p.n.replace(/\s*\(.*\)$/,'');
const cvBaseL=p=>p.l.replace(/\s*\((hybrides?|hybrides de [^)]*|hybride [^)]*|groupe [^)]*|Perovskia|azalée japonaise|Million Bells)\)$/,'');
const cvList=p=>p&&!/\s'[^']+'/.test(p.l)&&!/\s'[^']+'/.test(p.n)?CVDB[p.l]||null:null;
function cvAuto(p,x,r){const L=cvList(p);if(!L)return null;if(r&&['nat','eco'].includes(r.key))return null;const A=r&&r.A||15,cs=r&&r.cset,inSet=k=>cs&&(cs.has?cs.has(k):Array.isArray(cs)&&cs.includes(k)),hMax=Math.max(0.5,Math.sqrt(A)/2);let best=null,bs=-1e9;
  L.forEach((c,i)=>{let s=-i*0.3;const cc=c.c.filter(k=>k!=='vert'&&k!=='blond');if(x&&x.col&&cc.length){s+=cc.includes(x.col)?4:-2}else if(cs&&cc.length){s+=cc.some(inSet)?2:-1.5}
    if(A<8&&c.h<p.h*0.85)s+=1.5;if(A>=30&&c.cp)s-=0.8;if(p.t!=='arbre'&&c.h>hMax*1.3&&c.h>p.h*0.9)s-=1.5;if(c.r)s+=1;if(c.s)s+=0.3;if(s>bs){bs=s;best=c}});return best}
function cvApply(p,c){if(!c)return p;const q={...p,n:`${cvBaseN(p)} '${c.n}'`,h:c.h||p.h,cv:c.n,cvNote:c.note,cvL:`${cvBaseL(p)} '${c.n}'`,base:p};if(c.c.length)q.c=c.c;return q}
function cvChoice(p,x,r){const L=cvList(p);if(!L)return null;const u=S.cvSel[p.l];if(u==='_')return null;if(u){const c=L.find(c=>c.n===u);if(c)return c}return cvAuto(p,x,r)}
{const _co26=compose;compose=function(...a){const r=_co26(...a);try{r.rows=r.rows.map(x=>{const c=cvChoice(x.p,x,r);return c?{...x,p:cvApply(x.p,c)}:x})}catch(e){console.warn('cultivars',e)}return r}}
{const _rc26=renderCompo;renderCompo=function(){_rc26();const r=S.lastCompo,tb=$('#compo tbody');if(!r||!tb)return;const trs=tb.querySelectorAll('tr');
  r.rows.forEach((x,i)=>{const base=x.p.base||x.p,L=cvList(base),tr=trs[i];if(!L||!tr)return;const cell=tr.querySelector('.pcell > div:last-child');if(!cell)return;const li=cell.querySelector('i.src');if(li&&x.p.cvL)li.textContent=x.p.cvL;const u=S.cvSel[base.l]||'',auto=cvAuto(base,x,r);
    cell.insertAdjacentHTML('beforeend',`<div class="cvrow"><label class="small">Cultivar <select class="cvsel" data-cvl="${esc(base.l)}"><option value=""${u?'':' selected'}>Conseillé${auto?` : ${esc(auto.n)}`:' : espèce type'}</option>${L.map(c=>`<option value="${esc(c.n)}"${u===c.n?' selected':''}>${esc(c.n)} · ${nf(c.h,c.h<1?2:1)} m${c.r?' · résistant':''}</option>`).join('')}<option value="_"${u==='_'?' selected':''}>Espèce type (sans cultivar)</option></select></label>${x.p.cvNote?`<span class="small cvnote">${esc(x.p.cvNote)}</span>`:''}</div>`)})}}
$('#compo').addEventListener('change',e=>{const s=e.target.closest('.cvsel');if(!s)return;pushUndo();if(s.value)S.cvSel[s.dataset.cvl]=s.value;else delete S.cvSel[s.dataset.cvl];renderCompo();try{if(typeof renderV4==='function')renderV4()}catch(err){}saveNow(true)});
{const _op26=openPlant;openPlant=async function(l){const r=await _op26(l);try{const p=PL.find(x=>x.l===l),L=cvList(p),tx=$('#plantBody .pdtx');if(L&&tx)tx.insertAdjacentHTML('beforeend',`<h4 class="cvh">Cultivars conseillés</h4><table class="kv cvt">${L.map(c=>`<tr><th>${esc(cvBaseN(p))} '${esc(c.n)}'</th><td>${nf(c.h,c.h<1?2:1)} m${c.c.length?' · '+c.c.map(k=>COL[k]?COL[k][0].toLowerCase():k).join(', '):''}${c.r?' · <b>résistant</b>':''}<br><span class="small">${esc(c.note)}</span></td></tr>`).join('')}</table><p class="small">Dans un massif, le cultivar le mieux adapté (place, couleurs, résistance) est choisi automatiquement ; vous pouvez le changer dans la liste des plantes. Pour une haie indigène ou un jardin naturel, l’espèce type est préférée.</p>`)}catch(e){}return r}}
{const _cr26=collectReport;collectReport=async function(){const R=await _cr26();try{(R.palettes||[]).forEach(pal=>pal.items.forEach(it=>{if(it.p&&it.p.cvL)it.p={...it.p,l:it.p.cvL}}));if(R.legend&&S.lastLayout)R.legend.forEach((g,i)=>{const x=S.lastLayout.rows[i];if(x&&x.p&&x.p.cv)g.n=x.p.n})}catch(e){}return R}}
{const _ser26=serialize;serialize=function(){const d=_ser26();d.set.cvSel=S.cvSel;return d}}
{const _rs26=restoreSettings;restoreSettings=function(t){_rs26(t);S.cvSel=t&&t.cvSel&&typeof t.cvSel==='object'?{...t.cvSel}:{}}}
window.__p26={cvList:l=>cvList(PL.find(x=>x.l===l)),n:()=>Object.keys(CVDB).length,nc:()=>Object.values(CVDB).reduce((s,L)=>s+L.length,0),missing:()=>Object.keys(CVDB).filter(l=>!PL.some(p=>p.l===l))};

/* ================= v26 : présentation du site à l’ouverture ================= */
const WEL={
 pub:{lead:'Concevez un jardin vraiment adapté à votre terrain. Plantañ.ia calcule au mètre près le climat, le sol, le soleil et les ombres de votre parcelle à partir des données publiques, puis vous propose les plantes et les aménagements qui s’y plairont, avec les quantités, l’entretien et le budget.',
  steps:[['Mes envies','Décrivez votre projet par écrit, à la voix ou avec une photo, ou répondez à quelques questions : ambiance, temps d’entretien, enfants, budget.'],['Mon terrain','Cherchez votre adresse, dessinez ce qui existe (maison, arbres, haies, clôtures), puis votre projet. L’ombre portée est calculée heure par heure.'],['Mes résultats','Les plantes qui conviennent à votre sol et à votre exposition, le plan de plantation, les quantités et le calendrier d’entretien mois par mois.'],['Mon projet en main','Rapport PDF ou Word, liste d’achats, budget « je fais moi-même » ou « par un professionnel », primes et professionnels près de chez vous.']],
  can:[['🌸','Massifs fleuris','Vivaces, graminées, fougères, arbustes et cultivars, en fleurs toute l’année'],['🌳','Haies et arbres','Haies indigènes (avec primes), fruitiers, distances légales'],['🥕','Potager et verger','Plan des planches, rotations, variétés'],['🌾','Pelouse ou prairie','Le bon mélange selon l’usage et l’ombre'],['💧','Mare et jardin de pluie','Profils, volumes, plantes aquatiques'],['🌲','Micro-forêt et fraîcheur','Essences locales, îlot d’ombre'],['🧱','Terrasse, allée, piscine','Matériaux, plan de pose, budget, règles de permis'],['🪓','Démolition et préparation','Abattage, défrichage, évacuation des déchets'],['⛰️','Talus et pentes','Plantes qui tiennent la terre'],['🪴','Balcons et jardinières','Plantes en pot selon l’exposition'],['🚿','Arrosage','Goutte-à-goutte dimensionné'],['📷','Identifier par photo','Plantes, maladies et sol']],
  know:['Gratuit et sans compte : votre projet reste enregistré dans ce navigateur.','Les prix, quantités et règles sont des estimations : faites-les confirmer avant de commander ou de construire.']},
 pro:{lead:'Un outil de pré-étude pour paysagistes, jardiniers et entrepreneurs : diagnostic du site, conception végétale et fonctionnelle, métrés, budget et rapport client, dans une seule session et sur la même carte.',
  steps:[['Mon projet','Les envies et contraintes du client : ambiance, entretien, usages, budget. Description libre analysée, idées par photos.'],['Mon terrain et mon projet','Parcelle cadastrale, import d’un plan (géomètre, architecte), relevé de l’existant (bâtiments, arbres, haies avec leur largeur, clôtures, massifs), puis conception : végétal, fonctionnel et démolition.'],['Résultats','Palettes avec cultivars, plans de plantation, plans de pose des terrasses, contrôles agronomiques, distances légales, cohérence entre les aménagements.'],['Je passe à l’action','Rapport client PDF ou Word avec page de garde, budget détaillé avec vos taux horaires, liste d’achats Excel, primes, règles communales.']],
  can:[['🛰️','Diagnostic de site','Climat sur 30 ans, cartes des sols régionales sous chaque élément, ensoleillement et ombres'],['🗺️','Relevé et plans','Cadastre, plan importé, alignement et cotes en direct'],['🌿','Conception végétale','Massifs, haies, verger, potager, mare, micro-forêt, talus'],['🧱','Aménagement fonctionnel','Terrasses (calepinages), allées, piscines, clôtures'],['🪓','Démolition','Abattage, démolition, évacuation, règles d’abattage'],['🏛️','Patrimoine local','Matériaux, plantes indigènes et traditions de la région'],['⚖️','Règles et permis','Distances légales, dispenses de permis, règles communales par IA'],['💶','Budget et métrés','Taux et prix modifiables, fournitures, heures, location'],['📄','Exports','PDF, Word, Excel, calendrier d’entretien (.ics)']],
  know:['Tous les onglets restent accessibles en mode libre (Menu).','Les estimations sont indicatives : à valider par une visite et vos propres prix.']}};
function welHtml(a){const W=WEL[a];return `<div class="welhead"><img src="data:image/png;base64,${ICON}" alt="" class="wellogo"><div><h2>Bienvenue sur Plantañ.ia</h2><div class="welsw" role="group" aria-label="Je suis"><button type="button" data-wa="pub" aria-pressed="${a==='pub'}">Je suis un particulier</button><button type="button" data-wa="pro" aria-pressed="${a==='pro'}">Je suis un professionnel</button></div></div><button type="button" class="welx" data-wx="1" aria-label="Fermer">×</button></div>
  <p class="wellead">${esc(W.lead)}</p>
  <h3>Comment ça marche</h3><ol class="welsteps">${W.steps.map(([t,d],i)=>`<li><b><span>${i+1}</span>${esc(t)}</b><p>${esc(d)}</p></li>`).join('')}</ol>
  <h3>Ce que vous pouvez réaliser</h3><div class="welcan">${W.can.map(([i,t,d])=>`<div><span class="wi" aria-hidden="true">${i}</span><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join('')}</div>
  <ul class="welknow">${W.know.map(k=>`<li>${esc(k)}</li>`).join('')}</ul>
  <div class="welfoot"><label class="chk"><input type="checkbox" id="welNo"${localStorage.getItem('plantania:welcome')==='done'?' checked':''}> Ne plus afficher à l’ouverture</label><span class="chips"><button type="button" data-wt="1">Visite guidée de l’écran</button><button type="button" class="pri" data-wgo="${a}">Commencer${a==='pro'?' (version professionnelle)':''}</button></span></div>`}
let WELA=AUD==='pro'?'pro':'pub';
function welOpen(){let d=$('#welcome');if(!d){document.body.insertAdjacentHTML('beforeend','<dialog id="welcome" class="weldlg" aria-label="Présentation de Plantañ.ia"><div id="welBody"></div></dialog>');d=$('#welcome');
    d.addEventListener('click',e=>{const sw=e.target.closest('[data-wa]');if(sw){WELA=sw.dataset.wa;$('#welBody').innerHTML=welHtml(WELA);return}
      if(e.target.closest('[data-wx]')){welClose(false);return}if(e.target.closest('[data-wt]')){welClose(false);setTimeout(()=>tutoGo(0),300);return}
      const g=e.target.closest('[data-wgo]');if(g){const a=g.dataset.wgo;if(a!==AUD)setAud(a);welClose(true)}});
    d.addEventListener('change',e=>{if(e.target.id==='welNo')try{e.target.checked?localStorage.setItem('plantania:welcome','done'):localStorage.removeItem('plantania:welcome')}catch(err){}});
    d.addEventListener('cancel',()=>welClose(false))}
  WELA=AUD==='pro'?'pro':'pub';$('#welBody').innerHTML=welHtml(WELA);if(LANG!=='fr')try{setLang(LANG)}catch(e){}if(d.showModal&&!d.open)d.showModal();else d.setAttribute('open','')}
function welClose(go){const d=$('#welcome');if(d){if(d.close&&d.open)d.close();d.removeAttribute('open')}let t=null;try{t=localStorage.getItem('plantania:tuto')}catch(e){}if(go&&!t)setTimeout(()=>tutoGo(0),600)}
{const ml=$('#menuList');if(ml)ml.insertAdjacentHTML('afterbegin','<button type="button" id="mWelcome">Présentation du site</button>');const b=$('#mWelcome');if(b)b.addEventListener('click',()=>{$('#menuList').hidden=true;$('#menuBtn').setAttribute('aria-expanded','false');welOpen()})}
window.__p26w={welOpen,welClose};

/* ================= v27 : planter des arbres ================= */
[P("Érable plane","Acer platanoides","arbre",-35,"sm","df","sla",[5,8],20,[4],0,"jaune","vert automne","arrondi","ang fr",{note:"Très robuste ; ombre dense, peu de plantes poussent dessous."}),
 P("Érable sycomore","Acer pseudoplatanus","arbre",-30,"sm","f","sla",[5,8],25,[4,5],0,"","vert","arrondi","nat",{note:"Grand arbre pour grands terrains ; se ressème facilement."}),
 P("Érable rouge","Acer rubrum","arbre",-35,"sm","fh","la",[4.5,7],15,[3],0,"rouge","automne","arrondi","ang",{note:"Couleurs d’automne spectaculaires ; préfère un sol non calcaire."}),
 P("Érable à écorce de papier","Acer griseum","arbre",-29,"sm","f","la",[5.5,7.5],8,[],0,"","automne","arrondi","ang jap",{note:"Écorce cannelle qui s’exfolie, belle toute l’année."}),
 P("Copalme d’Amérique","Liquidambar styraciflua","arbre",-25,"s","fh","la",[5,7],15,[],0,"","automne","erige","ang",{note:"Automne du jaune au pourpre ; éviter les sols calcaires."}),
 P("Févier d’Amérique","Gleditsia triacanthos","arbre",-30,"s","df","sla",[6,8],12,[6],0,"","vert automne","etale","ang med",{note:"Feuillage léger : ombre filtrée, la pelouse pousse dessous. Choisir un cultivar sans épines."}),
 P("Arbre aux quarante écus","Ginkgo biloba","arbre",-30,"s","f","sla",[5,8],15,[],0,"","automne","erige","ang jap fr",{note:"Jaune d’or en automne. Choisir un sujet mâle : les fruits des femelles sentent mauvais."}),
 P("Tulipier de Virginie","Liriodendron tulipifera","arbre",-30,"s","f","la",[5.5,7],25,[6],0,"jaune","automne","erige","ang",{note:"Fleurs en forme de tulipe ; grand arbre, prévoir beaucoup de place."}),
 P("Hêtre commun","Fagus sylvatica","arbre",-30,"smo","f","sla",[5,8],25,[],0,"","vert automne","arrondi","nat eco",{note:"Craint les sols détrempés et tassés ; garde ses feuilles sèches en hiver."}),
 P("Chêne des marais","Quercus palustris","arbre",-30,"s","fh","la",[4.5,7],20,[],0,"","automne","erige","ang",{note:"Pousse plus vite que les chênes indigènes ; rouge en automne."}),
 P("Chêne sessile","Quercus petraea","arbre",-30,"s","df","sla",[4.5,7.5],25,[],0,"","vert","arrondi","nat eco",{note:"Mieux adapté aux sols secs que le chêne pédonculé ; très riche pour la biodiversité."}),
 P("Noyer commun","Juglans regia","arbre",-25,"s","f","la",[6,8],20,[],0,"","vert","arrondi","fr",{note:"Noix en automne. Ses feuilles freinent les autres plantes : rien de fragile à ses pieds."}),
 P("Châtaignier","Castanea sativa","arbre",-25,"s","f","sa",[4.5,6.5],25,[6,7],0,"blanc","vert automne","arrondi","nat",{note:"Sol acide sans calcaire indispensable. Châtaignes en octobre."}),
 P("Saule blanc","Salix alba","arbre",-35,"s","fh","sla",[5.5,8],20,[4],0,"","gris","erige","nat eco",{note:"Racines qui cherchent l’eau : loin des maisons et des canalisations. Peut être conduit en têtard."}),
 P("Cerisier à grappes","Prunus padus","arbre",-35,"sm","fh","la",[5,8],12,[4,5],0,"blanc","vert","erige","nat eco",{note:"Grappes blanches parfumées, fruits pour les oiseaux."}),
 P("Alisier blanc","Sorbus aria","arbre",-30,"s","df","sla",[6,8.5],12,[5],0,"blanc","gris","arrondi","nat eco",{note:"Revers des feuilles argenté ; très bien sur sol calcaire et sec."}),
 P("Savonnier","Koelreuteria paniculata","arbre",-25,"s","d","sla",[6,8],8,[7,8],0,"jaune","automne","etale","med ang",{note:"Fleurs jaunes en été puis fruits en lanternes ; supporte la sécheresse."}),
 P("Arbre à soie","Albizia julibrissin","arbre",-15,"s","df","sl",[6,8],6,[7,8],0,"rose","vert","etale","med",{note:"Rustique jusqu’à −15 °C : place abritée et ensoleillée."}),
 P("Poirier d’ornement","Pyrus calleryana","arbre",-29,"s","df","sla",[5.5,8],12,[4],0,"blanc","automne","erige","ang fr",{note:"Très résistant en ville, beau en automne."}),
 P("Arbre aux mouchoirs","Davidia involucrata","arbre",-23,"sm","f","la",[5.5,7],12,[5],0,"blanc","vert","arrondi","ang",{note:"Grandes bractées blanches en mai ; fleurit après 8 à 10 ans."}),
 P("Catalpa","Catalpa bignonioides","arbre",-25,"s","f","la",[6,8],12,[6,7],0,"blanc","vert","etale","ang",{note:"Grandes feuilles et fleurs blanches en été ; débourre tard."}),
 P("Séquoia de Chine","Metasequoia glyptostroboides","arbre",-30,"s","fh","la",[5,7.5],30,[],0,"","automne","erige","ang jap",{note:"Conifère qui perd ses aiguilles, roux en automne ; pour grands terrains frais."}),
 P("Zelkova du Japon","Zelkova serrata","arbre",-30,"s","f","sla",[6,8],15,[],0,"","automne","etale","ang fr jap",{note:"Résiste à la maladie de l’orme ; supporte la ville."}),
 P("Styrax du Japon","Styrax japonicus","arbre",-23,"sm","f","la",[5,6.5],7,[6],0,"blanc","vert automne","etale","jap",{note:"Clochettes blanches en juin ; sol sans calcaire."}),
 P("Arbre aux sept fils","Heptacodium miconioides","arbre",-25,"s","f","sla",[5.5,8],5,[8,9],0,"blanc","vert","erige","ang",{note:"Fleurit tard, parfumé, adoré des abeilles."}),
 P("Cytise","Laburnum × watereri","arbre",-25,"s","f","sla",[6,8],6,[5],0,"jaune","vert","erige","ang",{note:"Toutes les parties sont très toxiques : à éviter avec de jeunes enfants."}),
 P("Prunier myrobolan","Prunus cerasifera","arbre",-30,"s","df","sla",[6,8],7,[3,4],0,"blanc","vert","arrondi","nat ang",{note:"Floraison très précoce, utile aux pollinisateurs."}),
 P("Bouleau de l’Himalaya","Betula utilis","arbre",-30,"sm","f","sla",[5,7.5],12,[],0,"","vert automne","erige","ang jap",{note:"Écorce blanc pur, superbe en hiver ; ombre légère."})
].forEach(p=>{if(!PL.some(x=>x.l===p.l))PL.push(p)});
Object.entries({'Fagus sylvatica':"Dawyck;15;;Hêtre colonnaire, 3 m de large;c|Purpurea;25;;Hêtre pourpre|Purpurea Pendula;4;;Pourpre pleureur, pour petit jardin;c",
 'Acer platanoides':"Columnare;12;jaune;Colonnaire;c|Crimson King;15;jaune;Feuillage pourpre foncé|Globosum;5;jaune;Tête en boule;c",
 'Acer rubrum':"October Glory;12;rouge;Rouge vif en automne|Red Sunset;12;rouge;Écarlate dès septembre",
 'Liquidambar styraciflua':"Worplesdon;12;;Automne pourpre et orange|Slender Silhouette;12;;Colonnaire très étroit;c",
 'Ginkgo biloba':"Fastigiata;12;;Colonnaire, sujet mâle;c|Mariken;1.5;;Nain en boule;c",
 'Gleditsia triacanthos':"Sunburst;10;;Feuillage jaune doré, sans épines|Skyline;12;;Pyramidal, sans épines",
 'Pyrus calleryana':"Chanticleer;12;blanc;Pyramidal étroit, très florifère;c",
 'Prunus padus':"Watereri;10;blanc;Très longues grappes parfumées",
 'Catalpa bignonioides':"Nana;4;;Boule sans fleurs;c|Aurea;8;blanc;Feuillage jaune",
 'Quercus palustris':"Green Pillar;15;;Colonnaire;c",
 'Prunus cerasifera':"Nigra;7;rose;Feuillage pourpre, fleurs roses",
 'Laburnum × watereri':"Vossii;6;jaune;Très longues grappes",
 'Betula utilis':"Doorenbos;12;;Écorce blanc pur",
 'Tilia cordata':"Greenspire;15;blanc;Couronne pyramidale régulière|Rancho;10;blanc;Compact, petites feuilles;c"}).forEach(([l,s])=>{CVDB[l]=s.split('|').map(x=>{const [n,h,c,note,fl]=x.split(';');return{n,h:parseFloat(h),c:(c||'').split(' ').filter(Boolean),note:note||'',r:/r/.test(fl||''),s:/s/.test(fl||''),cp:/c/.test(fl||'')}})});
/* largeur adulte de la couronne (m) */
const TREEW={'Acer campestre':8,'Amelanchier lamarckii':5,'Betula pendula':7,'Carpinus betulus':10,'Sorbus aucuparia':5,"Malus 'Evereste'":4,'Alnus glutinosa':8,'Acer palmatum':5,'Cercis siliquastrum':6,"Prunus serrulata 'Kanzan'":7,"Prunus × subhirtella 'Autumnalis'":6,'Magnolia × soulangeana':6,'Cornus kousa':5,'Quercus robur':20,'Tilia cordata':12,'Prunus avium':10,'Sorbus torminalis':9,'Malus sylvestris':6,'Parrotia persica':7,'Pinus sylvestris':8,'Olea europaea':4,"Cupressus sempervirens 'Totem'":1.5,
 'Acer platanoides':15,'Acer pseudoplatanus':18,'Acer rubrum':9,'Acer griseum':6,'Liquidambar styraciflua':9,'Gleditsia triacanthos':9,'Ginkgo biloba':9,'Liriodendron tulipifera':12,'Fagus sylvatica':18,'Quercus palustris':12,'Quercus petraea':18,'Juglans regia':15,'Castanea sativa':15,'Salix alba':14,'Prunus padus':8,'Sorbus aria':8,'Koelreuteria paniculata':7,'Albizia julibrissin':7,'Pyrus calleryana':6,'Davidia involucrata':9,'Catalpa bignonioides':10,'Metasequoia glyptostroboides':8,'Zelkova serrata':12,'Styrax japonicus':6,'Heptacodium miconioides':4,'Laburnum × watereri':4,'Prunus cerasifera':6,'Betula utilis':6};
const RAC27=new Set(['Salix alba','Quercus robur','Quercus petraea','Quercus palustris','Acer pseudoplatanus']);
const TROLE={auto:'Conseillez-moi',ombre:'De l’ombre en été',fleurs:'Des fleurs',automne:'Des couleurs d’automne',biodiv:'La biodiversité (essence indigène)',petit:'Un petit arbre pour un petit jardin',persist:'Un feuillage persistant',fruits:'Des fruits à cueillir'};
const TSIZE={baliveau:{l:'Baliveau (1,25 à 1,50 m, jeune plant)',pl:[15,45],sup:[8,15],h:0.6,m:[0,0]},tige8:{l:'Tige 8/10 (tronc de 8 à 10 cm de tour)',pl:[60,150],sup:[35,70],h:1.5,m:[0,0]},tige12:{l:'Tige 12/14',pl:[120,320],sup:[45,90],h:2.5,m:[0,0]},gros:{l:'Gros sujet 20/25 (effet immédiat)',pl:[450,1400],sup:[90,180],h:5,m:[150,300]}};
S.trees=S.trees||[];LISTS.push('trees');EDIT_K.push(['trees',0]);ESOIL_K.push(['trees','Arbre']);
{const i=TOOLS.findIndex(t=>t[0]==='fruit');TOOLS.splice(i<0?TOOLS.length:i,0,['tree','Arbre à planter (point)','pt'])}
TC.tree='#1b5e20';SHORT.tree='Arbre';HINT.tree='Arbre : cliquez où le planter. L’essence est choisie selon le sol, la place et vos envies ; vous pouvez la changer dans « Éléments sur la carte » ou l’onglet « Arbres ».';DRAWTXT.tree='Cliquez où planter l’arbre';TOOLWANT.tree='arbre';
LEGK.tree=()=>S.trees.length>0;
WANTS.push(['arbre','Planter un ou plusieurs arbres','Ombre, fleurs, automne, biodiversité : l’essence adaptée à la place','tree']);
{const o=ENVQ[0].o,i=o.findIndex(x=>x[0]==='fruit');o.splice(i<0?o.length:i,0,['arbre','Planter un ou plusieurs arbres'])}
ENVKW.want.arbre=['arbre','arbres','ombrage','ombre','tilleul','chêne','érable','bouleau','hêtre','boom','bomen','tree'];
ENVF.push({w:['arbre'],k:'f_tree',q:'Vos arbres, surtout pour… ?',o:()=>Object.entries(TROLE),apply:()=>{itemsChanged(false);renderTrees()}});
rebuildToolLists();
const tName=t=>t.name||`Arbre ${S.trees.indexOf(t)+1}`;
const tRole=t=>t.role&&t.role!=='auto'?t.role:(S.env&&S.env.f_tree)||'auto';
function tEnv(t){const p=t.pts[0],bld=S.shapes.filter(s=>s.kind==='obsPoly'&&(!s.nat||s.nat==='bat')).map(s=>s.pts),dB=bld.length?Math.min(...bld.map(B=>distPtPoly(p,B))):99;
  const D=propDomain();let dP=null;if(D){dP=1e9;D.forEach((q,i)=>{dP=Math.min(dP,distPtPoly(p,[q,D[(i+1)%D.length]]))})}
  let dT=99,tn='';S.obs.forEach(o=>{const d=llDist(p,[o.lat,o.lng])-(o.w||3)/2;if(d<dT){dT=d;tn=o.name||'arbre existant'}});
  S.trees.forEach(o=>{if(o===t)return;const C=o._ch||null,w=C?C.W:5,d=llDist(p,o.pts[0])-w/2;if(d<dT){dT=d;tn=tName(o)}});
  (S.hedges||[]).forEach(h=>h.pts.forEach((q,i)=>{if(i<h.pts.length-1){const d=distPtPoly(p,[q,h.pts[i+1]])-1;if(d<dT){dT=d;tn='la haie'}}}));
  return{dB,dP,dT,tn,clay:(()=>{const s=soilInfo25(t.soil)||soilNow();return s&&/argil/i.test(s.cls||'')})()}}
function tOpts(p){const W0=TREEW[p.l]||Math.max(2,p.h*0.6),o=[{p,cv:null,h:p.h,W:W0}];const L=cvList(p)||[];L.forEach(c=>o.push({p,cv:c,h:c.h||p.h,W:c.cp?Math.min(W0,Math.max(1.5,(c.h||p.h)*0.3)):W0*(c.h||p.h)/p.h}));return o}
function tScore(o,t,E,c){const p=o.p,role=tRole(t);let s=scorePlant(p,c).score,why=[];const st=' '+p.st+' ';
  if(role==='ombre'){if(o.h>=8&&!p.pers)s+=25;if(o.h<5)s-=20}else if(role==='fleurs'){if(p.c&&p.c.length)s+=25}else if(role==='automne'){if((p.fo||[]).includes('automne'))s+=25}else if(role==='biodiv'){if(/ (nat|eco) /.test(st))s+=25;else s-=15}else if(role==='petit'){if(o.h<=7)s+=25;if(o.h>10)s-=30}else if(role==='persist'){if(p.pers)s+=30;else s-=10}else if(role==='fruits'){if(/Malus|Prunus avium|Juglans|Castanea|Amelanchier|Cornus mas/.test(p.l))s+=25}
  const Wmax=Math.min(2*Math.max(0.5,E.dB-1),2*Math.max(0.5,E.dT)+1,E.dP!=null?2*E.dP+1.5:99);if(o.W>Wmax){s-=10+40*Math.min(1.5,(o.W-Wmax)/Wmax);why.push('couronne trop large pour la place')}
  if(E.dP!=null&&E.dP<2&&o.h>4){s-=50;why.push('trop près de la limite pour un grand arbre')}
  const need=Math.max(o.W/2+1,o.h*(RAC27.has(p.l)&&E.clay?1:0.5));if(E.dB<need){s-=25;why.push('trop près de la maison')}
  if(o.cv&&o.cv.cp&&o.W<=Wmax&&Wmax<W0of(p))s+=4;if(o.W<=Wmax&&role!=='petit')s+=10*Math.min(1,o.W/Wmax);if(o.cv&&o.cv.r)s+=3;return{s,why}}
const W0of=p=>TREEW[p.l]||Math.max(2,p.h*0.6);
function tChoose(t){const c=withSoil25(t,()=>cond()),E=tEnv(t),cands=PL.filter(p=>p.t==='arbre');let all=[];cands.forEach(p=>tOpts(p).forEach(o=>{const r=tScore(o,t,E,c);all.push({...o,...r})}));all.sort((a,b)=>b.s-a.s);
  let ch=null;if(t.sp){const ps=all.filter(o=>o.p.l===t.sp);ch=t.cv==='_'?ps.find(o=>!o.cv):t.cv?ps.find(o=>o.cv&&o.cv.n===t.cv):ps[0];if(!ch)ch=ps[0]}if(!ch)ch=all[0];
  const R={...ch,E,all,c,name:ch.cv?`${cvBaseN(ch.p)} '${ch.cv.n}'`:ch.p.n,lat:ch.cv?`${cvBaseL(ch.p)} '${ch.cv.n}'`:ch.p.l};t._ch=R;return R}
function tInfo(t){const C=tChoose(t),E=C.E,p=C.p,sz=TSIZE[t.size]||TSIZE.tige8,rate=PRICE.rate[2],warn=[],ok=[];
  const need=Math.max(C.W/2+1,C.h*(RAC27.has(p.l)&&E.clay?1:0.5));
  if(E.dP!=null){if(E.dP<0.5)warn.push(`À ${nf(E.dP,1)} m de la limite : trop près, même pour un arbre taillé bas (0,5 m minimum).`);else if(E.dP<2&&C.h>3)warn.push(`À ${nf(E.dP,1)} m de la limite : un arbre à haute tige doit être planté à 2 m au moins (Code rural). Ici, il faudra le maintenir bas ou le déplacer.`);else if(E.dP<2)ok.push(`À ${nf(E.dP,1)} m de la limite : permis pour un petit arbre maintenu bas (0,5 m minimum ; 2 m pour un arbre à haute tige).`);else ok.push(`À ${nf(E.dP,1)} m de la limite : distance légale respectée (2 m minimum pour un arbre à haute tige).`)}
  if(E.dB<90){if(E.dB<need)warn.push(`À ${nf(E.dB,1)} m de la maison : prévoyez au moins ${nf(need,1)} m${RAC27.has(p.l)&&E.clay?' (racines puissantes sur sol argileux : risque pour les fondations)':''}.`);else ok.push(`À ${nf(E.dB,1)} m de la maison : suffisant.`)}
  if(E.dT<C.W/2)warn.push(`Sa couronne adulte (${nf(C.W,1)} m) touchera ${E.tn} : écartez-le ou choisissez un cultivar étroit.`);
  const lat=S.lat||50.5,ew=90-lat-23.44,es=90-lat+23.44,shW=C.h/Math.tan(ew*Math.PI/180),shS=C.h/Math.tan(es*Math.PI/180);
  const plant=[sz.pl[0],sz.pl[1]],sup=sz.sup,mach=sz.m,diy=[plant[0]*1.06+sup[0]*1.21+mach[0]*1.21,plant[1]*1.06+sup[1]*1.21+mach[1]*1.21],pro=[plant[0]*1.15*1.06+sup[0]*1.21+(sz.h*rate+mach[0])*1.21,plant[1]*1.15*1.06+sup[1]*1.21+(sz.h*PRICE.rate[3]+mach[1])*1.21];
  const z=scorePlant(p,C.c);return{C,E,sz,warn,ok,shW,shS,diy,pro,z,need}}
function treesChanged(){S.samples=null;itemsChanged(false);renderTrees();saveNow(true)}
{const _sc27=siteClick;siteClick=function(lat,lng){if(S.mode==='tree'){pushUndo();const t={id:++itemId,pts:[[lat,lng]],sp:'',cv:'',role:'auto',size:'tige8'};S.trees.push(t);treesChanged();try{edOpenQuiet('trees',t.id)}catch(e){}const C=t._ch||tChoose(t);toast(`${tName(t)} : ${C.name} conseillé (${nf(C.h,0)} m de haut, ${nf(C.W,0)} m de large à l’âge adulte).`);return}return _sc27(lat,lng)}}
{const _fs27=finishShape;finishShape=function(){if(S.mode==='tree'){const p=S.drawPts[0];S.drawPts=[];if(p){pushUndo();S.trees.push({id:++itemId,pts:[p],sp:'',cv:'',role:'auto',size:'tige8'});treesChanged()}return}return _fs27.apply(this,arguments)}}
{const _di27=drawItems;drawItems=function(){_di27();S.trees.forEach(t=>{const C=t._ch||tChoose(t),lab=`🌳 ${tName(t)} · ${C.name}`;try{L.circle(t.pts[0],{radius:C.W/2,color:TC.tree,weight:1.5,dashArray:'5 5',fillColor:'#43a047',fillOpacity:.12,interactive:false}).addTo(itemsLayer)}catch(e){}
  let l=L.marker(t.pts[0],{draggable:true,icon:L.divIcon({className:'',html:'<span class="treei">🌳</span>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(itemsLayer);if(l.on)l.on('dragend',e=>{const q=e.target.getLatLng();pushUndo();t.pts=[[q.lat,q.lng]];t.soil=null;treesChanged()});l=hook(l,'trees',t.id,lab);if(l&&l.bindTooltip)l.bindTooltip(lab,{direction:'top',className:'maplbl'})});updateLegend()}}
{const _ril27=renderItemsList;renderItemsList=function(){_ril27();const el=$('#itemsList');if(!el||!S.trees.length)return;let ul=el.querySelector('ul');if(!ul){el.insertAdjacentHTML('afterbegin','<ul></ul>');ul=el.querySelector('ul')}
  S.trees.forEach(t=>{const sel=SEL19&&SEL19.kind==='trees'&&SEL19.id===String(t.id),C=t._ch||tChoose(t);ul.insertAdjacentHTML('beforeend',`<li class="${sel?'isel':''}"><span class="sw" style="background:${TC.tree}"></span><span class="itlink" role="button" tabindex="0" data-k="trees" data-i="${t.id}" aria-expanded="${sel}">🌳 ${esc(tName(t))} · ${esc(C.name)}</span><button type="button" data-del="trees" data-id="${t.id}">Supprimer</button></li>${sel?`<li class="itedli" data-ek="trees" data-ei="${t.id}">${editorHtml('trees',t)}</li>`:''}`)})}}
function tSelects(t){const C=t._ch||tChoose(t),sp=[...new Map(C.all.map(o=>[o.p.l,o])).values()].slice(0,40),L_=cvList(C.p)||[];
  return `<div class="frow"><label>Essence<select data-tf="sp"><option value="">Conseillée : ${esc(t.sp?'—':C.name)}</option>${sp.map(o=>`<option value="${esc(o.p.l)}"${t.sp===o.p.l?' selected':''}>${esc(o.p.n)} · ${nf(o.h,0)} m${o.why.length?' ⚠':''}</option>`).join('')}</select></label>
  ${L_.length?`<label>Cultivar<select data-tf="cv"><option value="">Conseillé${C.cv?` : ${esc(C.cv.n)}`:''}</option>${L_.map(c=>`<option value="${esc(c.n)}"${t.cv===c.n?' selected':''}>${esc(c.n)} · ${nf(c.h,c.h<1?2:1)} m</option>`).join('')}<option value="_"${t.cv==='_'?' selected':''}>Espèce type</option></select></label>`:''}
  <label>Surtout pour<select data-tf="role">${Object.entries(TROLE).map(([k,l])=>`<option value="${k}"${(t.role||'auto')===k?' selected':''}>${esc(l)}</option>`).join('')}</select></label>
  <label>Taille à l’achat<select data-tf="size">${Object.entries(TSIZE).map(([k,s])=>`<option value="${k}"${(t.size||'tige8')===k?' selected':''}>${esc(s.l)}</option>`).join('')}</select></label>
  <label>Nom<input type="text" data-tf="name" value="${esc(t.name||'')}" placeholder="${esc(tName(t))}"></label></div>`}
{const _eh27=editorHtml;editorHtml=function(kind,it){if(kind!=='trees'||!it)return _eh27(kind,it);const I=tInfo(it);return `<div class="ited">${tSelects(it)}<p class="small"><b>${esc(I.C.name)}</b> : ${nf(I.C.h,0)} m de haut, ${nf(I.C.W,0)} m de large à l’âge adulte.${I.warn.length?` <span class="warnc">⚠ ${esc(I.warn[0])}</span>`:''} <a href="#arbres" data-gotab="arbres">Fiche complète</a></p></div>`}}
function tFieldChange(e){const f=e.target.dataset.tf;if(!f)return;const box=e.target.closest('[data-ei],[data-tid]');const id=box&&(box.dataset.ei||box.dataset.tid);const t=S.trees.find(x=>String(x.id)===String(id));if(!t)return;pushUndo();const v=e.target.value;
  if(f==='sp'){t.sp=v;t.cv=''}else if(f==='cv')t.cv=v;else if(f==='role'){t.role=v;if(v!=='auto'){t.sp='';t.cv=''}}else if(f==='size')t.size=v;else if(f==='name')t.name=v.trim();treesChanged();renderItemsList()}
$('#itemsList').addEventListener('change',tFieldChange);
document.addEventListener('click',e=>{const a=e.target.closest('[data-gotab]');if(!a)return;e.preventDefault();const k=a.dataset.gotab,b=document.querySelector(`#tabs [data-tab="${k}"]`);if(b&&b.getAttribute('aria-pressed')!=='true')b.click();setTimeout(()=>{const s=document.getElementById(k);if(s)s.scrollIntoView({behavior:'smooth',block:'start'})},80)});
function tCard(t,i){const I=tInfo(t),C=I.C,p=C.p,sz=I.sz,R=x=>`${nf(Math.round(x[0]/5)*5)} à ${nf(Math.round(x[1]/5)*5)} €`;
  return `<div class="card xcard tcard" data-tid="${t.id}"><h4>🌳 ${esc(tName(t))} : ${esc(C.name)} <span class="lat">${esc(C.lat)}</span></h4>${tSelects(t)}
  <div class="tgrid"><div><h5>À l’âge adulte</h5><ul class="small"><li>${nf(C.h,0)} m de haut, couronne de ${nf(C.W,0)} m${C.cv&&C.cv.note?` · ${esc(C.cv.note)}`:''}</li><li>${p.pers?'Feuillage persistant':'Feuillage caduc'}${p.c&&p.c.length?`, fleurs ${p.c.map(k=>COL[k]?COL[k][0].toLowerCase():k).join(', ')} (${p.f.map(m=>MOL[m-1]).join(', ')})`:''}</li><li>Adapté au site : <b>${I.z.score} %</b>${I.z.why.length?' · '+I.z.why.map(esc).join(' · '):''}</li>${p.note?`<li>${esc(p.note)}</li>`:''}<li>Ombre portée à midi : ≈ ${nf(I.shS,0)} m en juin, ≈ ${nf(I.shW,0)} m en décembre (vers le nord)</li></ul></div>
  <div><h5>Place et distances</h5><ul class="small">${I.ok.map(x=>`<li>✓ ${esc(x)}</li>`).join('')}${I.warn.map(x=>`<li class="warnc">⚠ ${esc(x)}</li>`).join('')}${!I.ok.length&&!I.warn.length?'<li>Dessinez la maison et la parcelle pour vérifier les distances.</li>':''}</ul></div>
  <div><h5>Budget indicatif (TVAC)</h5><table class="stack"><tbody><tr><td>${esc(sz.l)}</td><td></td></tr><tr><td>Je plante moi-même</td><td><b>${R(I.diy)}</b></td></tr><tr><td>Planté par un jardinier (${nf(sz.h,1)} h × ${nf(PRICE.rate[2])} €/h HTVA${sz.m[1]?', petite pelle':''})</td><td><b>${R(I.pro)}</b></td></tr></tbody></table><p class="small">Arbre, tuteur${t.size==='baliveau'?'':' tripode'}, colliers, compost, paillage${sz.m[1]?', engin de levage':''}.</p></div></div>
  <details><summary>Plantation et entretien</summary><ul class="small"><li><b>Quand :</b> de novembre à mars hors gel (racines nues : novembre à mars ; en motte ou en conteneur : d’octobre à avril).</li><li><b>Trou :</b> 2 à 3 fois le volume des racines, fond et parois griffés ; collet au niveau du sol, jamais enterré.</li><li><b>Tuteur :</b> ${t.size==='baliveau'?'un piquet incliné côté vent dominant':'un tripode de 3 piquets'}, retiré après 2 à 3 ans.</li><li><b>Arrosage :</b> 30 à 50 L à la plantation, puis 30 à 50 L par semaine sans pluie pendant les deux premiers étés.</li><li><b>Paillage :</b> un cercle de 1 m de diamètre sans herbe, renouvelé chaque printemps.</li><li><b>Taille :</b> taille de formation les premières années (supprimer les branches basses et concurrentes) ; ensuite le minimum, jamais d’étêtage.</li>${/ (nat|eco) /.test(' '+p.st+' ')?'':'<li><b>Biodiversité :</b> une essence indigène accueille davantage d’insectes et d’oiseaux.</li>'}</ul></details>${typeof proLinks25==='function'?proLinks25([['pépinière arbres','Pépinières'],['jardinier plantation arbre','Jardiniers'],['élagueur','Élagueurs']]):''}</div>`}
function renderTrees(){const box=$('#treeBox');if(!box)return;if(!S.trees.length){box.innerHTML='<div class="card"><p>Aucun arbre placé. Choisissez l’outil <b>« Arbre »</b> sur la carte (dans « 2. Mon aménagement », 🌿 Végétal) et cliquez où le planter : l’essence est choisie selon le sol, le climat, la place disponible et vos envies.</p></div>';return}
  const T=S.trees.map(t=>tInfo(t)),sum=k=>T.reduce((s,I)=>[s[0]+I[k][0],s[1]+I[k][1]],[0,0]),r=x=>`${nf(Math.round(x[0]/10)*10)} à ${nf(Math.round(x[1]/10)*10)} €`;
  box.innerHTML=`<div class="card"><p>${S.trees.length} arbre${S.trees.length>1?'s':''} à planter : ${r(sum('diy'))} si vous plantez vous-même, ${r(sum('pro'))} par un jardinier (TVAC).</p></div>`+S.trees.map(tCard).join('')}
$('#arbres').addEventListener('change',tFieldChange);
{const _at27=applyTabs;applyTabs=function(sel){_at27(sel);if(sel.includes('arbres'))renderTrees()}}
{const _ic27=itemsChanged;itemsChanged=function(a){_ic27(a);if(!$('#arbres').classList.contains('tabhide'))renderTrees()}}
{const _ss27=stepSecs;stepSecs=function(n){const s=_ss27(n);if(n===4&&(S.trees.length||wantOn('arbre'))&&!s.includes('arbres')){const i=s.indexOf('massif');i>=0?s.splice(i,0,'arbres'):s.splice(Math.max(0,s.indexOf('fonct')),0,'arbres')}return s}}
ORD25.splice(ORD25.indexOf('massif'),0,'arbres');
{const _bl27=budgetLines;budgetLines=function(){const L_=_bl27();if(!S.trees.length)return L_;const T=S.trees.map(t=>tInfo(t)),sm=k=>T.reduce((s,I)=>[s[0]+I[k][0],s[1]+I[k][1]],[0,0]),h=T.reduce((s,I)=>s+I.sz.h,0),pro=sm('pro'),diy=sm('diy');
  L_.push({k:'trees',t:'Arbres à planter',sup:[0,0],vat:6,qtxt:`${S.trees.length} arbre(s) : ${[...new Set(T.map(I=>I.C.name))].join(', ')}`,rent:[0,0],hDiy:h*1.3,hPro:h,fix:{diy,pro,lab:[Math.max(0,pro[0]-diy[0]),Math.max(0,pro[1]-diy[1])]}});return L_}}
{const _vs27=v4Sections;v4Sections=function(){const o=_vs27();try{if(S.trees.length){const T=S.trees.map(t=>[t,tInfo(t)]),i=o.findIndex(s=>s.title==='BUDGET ESTIMATIF');
  const sec={title:'ARBRES À PLANTER',intro:`${S.trees.length} arbre${S.trees.length>1?'s':''} placé${S.trees.length>1?'s':''} sur le plan. Essences choisies selon le sol, le climat, la place disponible et vos envies.`,
   tables:[{head:['N°','Arbre','Adulte','À l’achat','Distances et remarques','Budget TVAC'],rows:T.map(([t,I],k)=>[String(k+1),`${I.C.name} (${I.C.lat})`,`${nf(I.C.h,0)} m × ${nf(I.C.W,0)} m`,I.sz.l,[...I.warn.map(x=>'⚠ '+x),...I.ok].join(' ')||'–',`${nf(Math.round(I.diy[0]))} à ${nf(Math.round(I.pro[1]))} €`]),w:[600,3300,1500,2400,4600,2438]}],
   bullets:['Plantation de novembre à mars, hors gel ; collet au niveau du sol.','Trou de 2 à 3 fois le volume des racines ; tuteur retiré après 2 à 3 ans.','Arrosage : 30 à 50 L par semaine sans pluie pendant les deux premiers étés ; paillage sur 1 m de diamètre.','Taille de formation les premières années, puis le minimum ; jamais d’étêtage.'],bh:'Plantation et entretien'};
  i>=0?o.splice(i,0,sec):o.push(sec)}}catch(e){console.warn(e)}return o}}
{const _pi27=planItems;planItems=function(){const it=_pi27();S.trees.forEach(t=>{const C=t._ch||tChoose(t);it.push({pts:t.pts,col:TC.tree,r:Math.max(0.8,C.W/2),lab:'Arbre à planter'})});return it}}
{const _pl27=planLabels;planLabels=function(){const L_=_pl27();S.trees.forEach(t=>{const C=t._ch||tChoose(t);L_.push([`${tName(t)} : ${C.name}`,t.pts[0]])});return L_}}
{const _cp27=clearProject;clearProject=function(){_cp27();S.trees=[]}}
{const _pl27b=proposeLayout;proposeLayout=function(){const R=_pl27b();try{if(R&&R.props&&wantOn('arbre')&&!S.trees.length){const D=propDomain();if(D){const mp=mPer(D[0][0]),lats=D.map(p=>p[0]),lngs=D.map(p=>p[1]),bld=S.shapes.filter(s=>s.kind==='obsPoly').map(s=>s.pts),out=[];
   for(let la=Math.min(...lats);la<=Math.max(...lats);la+=1.5/111320)for(let lo=Math.min(...lngs);lo<=Math.max(...lngs);lo+=1.5/mp){const p=[la,lo];if(!inPolyLL(p,D))continue;let c=1e9;D.forEach((q,i)=>{c=Math.min(c,distPtPoly(p,[q,D[(i+1)%D.length]]))});if(c<2.5)continue;bld.forEach(B=>{c=Math.min(c,distPtPoly(p,B)-1.5)});S.obs.forEach(o=>{c=Math.min(c,llDist(p,[o.lat,o.lng])-(o.w||3)/2-1)});R.props.forEach(q=>{if(q.pts.length>2)c=Math.min(c,distPtPoly(p,q.pts)-1)});if(c>=3)out.push([c,p])}
   out.sort((a,b)=>b[0]-a[0]);const pick=[];out.forEach(([c,p])=>{if(pick.length<2&&pick.every(q=>llDist(q[1],p)>Math.max(8,c)))pick.push([c,p])});
   pick.forEach(([c,p])=>R.props.push({k:'tree',w:'arbre',lab:'Arbre',pts:[p],why:`${nf(Math.min(c,12)*2,0)} m d’espace libre : place pour une couronne de cette largeur`}))}}}catch(e){console.warn(e)}return R}}
window.__p27={tChoose:i=>{const C=tChoose(S.trees[i]);return{name:C.name,h:C.h,W:C.W,s:Math.round(C.s),why:C.why,top:C.all.slice(0,5).map(o=>(o.cv?o.cv.n:o.p.n)+':'+Math.round(o.s))}},tInfo:i=>{const I=tInfo(S.trees[i]);return{warn:I.warn,ok:I.ok,diy:I.diy.map(Math.round),pro:I.pro.map(Math.round)}},n:()=>PL.filter(p=>p.t==='arbre').length};

/* ================= v28 : professionnels (identité, clients, plan à l’échelle), arbres, contraintes du site ================= */
/* --- 1. identité du professionnel et clients --- */
const PROK='plantania:proid',CLIK='plantania:clients';let PROID={};try{PROID=JSON.parse(localStorage.getItem(PROK)||'{}')||{}}catch(e){}
let CLIENTS=[];try{CLIENTS=JSON.parse(localStorage.getItem(CLIK)||'[]')||[]}catch(e){}
const proOn=()=>AUD==='pro'&&!!(PROID.name||PROID.logo);
function proSave(){try{localStorage.setItem(PROK,JSON.stringify(PROID))}catch(e){toast('Image trop lourde pour la mémoire du navigateur : choisissez un logo plus petit.')}}
function proLines(){return[PROID.name,PROID.addr,PROID.city,[PROID.tel,PROID.mail].filter(Boolean).join(' · '),[PROID.web,PROID.vat?'TVA '+PROID.vat:''].filter(Boolean).join(' · ')].filter(Boolean)}
function docLogo(){if(proOn()&&PROID.logo){const b=PROID.logo.split(',')[1];return[b,PROID.lr||0.5]}return[LOGO,1]}
CLI.phone=CLI.phone||'';CLI.email=CLI.email||'';
{const ex=$('#export .in'),cov=$('#cliName')&&$('#cliName').closest('.card');if(ex&&cov){
  cov.insertAdjacentHTML('beforebegin',`<div class="card xcard proonly" id="proCard"><h4>Votre entreprise (rapports et plans)</h4><p class="small">Ces coordonnées et votre logo remplacent ceux de Plantañ.ia sur la page de garde, les pieds de page, le Word et le cartouche des plans. Elles restent dans ce navigateur, pour tous vos projets.</p>
   <div class="frow"><label>Nom de l’entreprise<input data-pf="name"></label><label>Adresse<input data-pf="addr"></label><label>Code postal et commune<input data-pf="city"></label><label>Téléphone<input data-pf="tel" type="tel"></label><label>E-mail<input data-pf="mail" type="email"></label><label>Site web<input data-pf="web"></label><label>N° de TVA<input data-pf="vat"></label></div>
   <div class="prologo"><img id="proLogoImg" alt="Votre logo" hidden><label class="chipa">Choisir mon logo<input type="file" id="proLogoIn" accept="image/*" hidden></label><button type="button" id="proLogoDel" hidden>Retirer le logo</button></div></div>`);
  const fr=cov.querySelector('.frow');if(fr){fr.insertAdjacentHTML('beforeend','<label class="proonly">Téléphone<input id="cliPhone" type="tel" autocomplete="tel" style="width:11em"></label><label class="proonly">E-mail<input id="cliMail" type="email" autocomplete="email" style="width:14em"></label>');
   cov.querySelector('h4').insertAdjacentHTML('afterend','<div class="chips proonly cliBar"><label class="small">Client <select id="cliPick"></select></label><button type="button" id="cliSave">Enregistrer dans mes clients</button><button type="button" id="cliDel" hidden>Retirer de mes clients</button></div>')}}}
function proFill(){document.querySelectorAll('[data-pf]').forEach(i=>{i.value=PROID[i.dataset.pf]||''});const im=$('#proLogoImg');if(im){im.hidden=!PROID.logo;if(PROID.logo)im.src=PROID.logo}const d=$('#proLogoDel');if(d)d.hidden=!PROID.logo;
  const p=$('#cliPhone'),m=$('#cliMail');if(p)p.value=CLI.phone||'';if(m)m.value=CLI.email||'';const sel=$('#cliPick');if(sel){sel.innerHTML='<option value="">— nouveau client —</option>'+CLIENTS.map((c,i)=>`<option value="${i}"${c.name===CLI.name&&c.addr===CLI.addr?' selected':''}>${esc(c.name)}${c.city?' · '+esc(c.city):''}</option>`).join('');$('#cliDel').hidden=!sel.value}}
$('#export').addEventListener('input',e=>{const k=e.target.dataset.pf;if(k){PROID[k]=e.target.value.slice(0,120);proSave();return}
  if(e.target.id==='cliPhone'||e.target.id==='cliMail'){CLI[e.target.id==='cliPhone'?'phone':'email']=e.target.value.slice(0,80);try{localStorage.setItem('plantania:client',JSON.stringify(CLI))}catch(err){}saveNow(false)}});
$('#export').addEventListener('change',e=>{if(e.target.id==='proLogoIn'){const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,600/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);PROID.logo=cv.toDataURL('image/png');PROID.lr=cv.height/cv.width;proSave();proFill();toast('Logo enregistré : il figurera sur vos rapports et vos plans.')};im.src=r.result};r.readAsDataURL(f);e.target.value='';return}
  if(e.target.id==='cliPick'){const c=CLIENTS[+e.target.value];if(e.target.value!==''&&c){Object.assign(CLI,{name:c.name||'',addr:c.addr||'',city:c.city||'',phone:c.phone||'',email:c.email||''});[['cliName','name'],['cliAddr','addr'],['cliCity','city']].forEach(([id,k])=>{const el=$('#'+id);if(el)el.value=CLI[k]});try{localStorage.setItem('plantania:client',JSON.stringify(CLI))}catch(err){}saveNow(true)}proFill()}});
$('#export').addEventListener('click',e=>{if(e.target.id==='proLogoDel'){delete PROID.logo;delete PROID.lr;proSave();proFill()}
  else if(e.target.id==='cliSave'){if(!CLI.name){toast('Indiquez d’abord le nom du client.');return}const c={name:CLI.name,addr:CLI.addr,city:CLI.city,phone:CLI.phone,email:CLI.email},i=CLIENTS.findIndex(x=>x.name===c.name&&x.addr===c.addr);if(i>=0)CLIENTS[i]=c;else CLIENTS.push(c);CLIENTS.sort((a,b)=>a.name.localeCompare(b.name,'fr'));try{localStorage.setItem(CLIK,JSON.stringify(CLIENTS))}catch(err){}proFill();toast(`${c.name} est enregistré dans vos clients.`)}
  else if(e.target.id==='cliDel'){const i=+$('#cliPick').value;if(CLIENTS[i]){CLIENTS.splice(i,1);try{localStorage.setItem(CLIK,JSON.stringify(CLIENTS))}catch(err){}proFill()}}});
proFill();
/* client propre à chaque projet */
{const _ser28=serialize;serialize=function(){const d=_ser28();d.set.cli={...CLI};return d}}
{const _rs28=restoreSettings;restoreSettings=function(t){_rs28(t);if(t&&t.cli&&typeof t.cli==='object'){Object.assign(CLI,{name:'',addr:'',city:'',title:'',phone:'',email:''},t.cli);[['cliName','name'],['cliAddr','addr'],['cliCity','city'],['cliTitle','title']].forEach(([id,k])=>{const el=$('#'+id);if(el)el.value=CLI[k]||''});try{proFill()}catch(e){}}}}
{const _sv28=saveNow;saveNow=function(f){_sv28(f);try{if(PRJ.id){const ix=pIdx();if(ix[PRJ.id]&&ix[PRJ.id].cli!==(CLI.name||'')){ix[PRJ.id].cli=CLI.name||'';pSetIdx(ix)}}}catch(e){}}}
let PCLI28='';
{const _rp28=renderProjDlg;renderProjDlg=function(){_rp28();try{const ix=pIdx(),cl=[...new Set(Object.values(ix).map(v=>v.cli||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr')),ul=$('#projList');if(!ul)return;
  ul.querySelectorAll('li').forEach(li=>{const b=li.querySelector('[data-po],[data-open],button');const id=Object.keys(ix).find(k=>li.innerHTML.includes(k));const c=id&&ix[id].cli;if(c){const sm=li.querySelector('small');if(sm)sm.insertAdjacentHTML('afterbegin',`<span class="pcli">👤 ${esc(c)}</span> · `)}if(PCLI28&&(!id||(ix[id].cli||'')!==PCLI28))li.hidden=true});
  let f=$('#projCli');if(cl.length){if(!f){ul.insertAdjacentHTML('beforebegin','<label class="small projcli">Client <select id="projCli"></select></label>');f=$('#projCli');f.addEventListener('change',()=>{PCLI28=f.value;renderProjDlg()})}f.innerHTML=`<option value="">Tous les clients (${Object.keys(ix).length} projets)</option>`+cl.map(c=>`<option${c===PCLI28?' selected':''}>${esc(c)}</option>`).join('')}}catch(e){console.warn(e)}}}
/* rapport PDF : logo, coordonnées */
{const _rh28=reportHtml;reportHtml=function(R){let h=_rh28(R);try{if(proOn()){const P=proLines();if(PROID.logo)h=h.split('data:image/png;base64,'+LOGO).join(PROID.logo);if(PROID.name)h=h.split(' · Plantañ.ia</span>').join(' · '+RE(PROID.name)+'</span>');
   h=h.replace('<div class="cv-cli">',`<div class="cv-pro"><span>Réalisé par</span>${P.map((l,i)=>i?RE(l):`<b>${RE(l)}</b>`).join('<br>')}</div><div class="cv-cli">`).replace('</style>','.cv-pro{font-size:10pt;line-height:1.45;margin:14px 0 10px;color:#3c4a40}.cv-pro span{display:block;text-transform:uppercase;letter-spacing:.08em;font-size:8pt;color:#6b7a70}.cv-l .clogo{max-height:30mm;max-width:60mm;object-fit:contain}footer img{max-height:9mm;width:auto}</style>')}
  if(R.cli&&(R.cli.phone||R.cli.email))h=h.replace(/(<div class="cv-cli">[\s\S]*?)(<\/div>)/,(m,a,b)=>`${a}<br>${[R.cli.phone,R.cli.email].filter(Boolean).map(RE).join('<br>')}${b}`)}catch(e){console.warn(e)}return h}}
window.__plantania&&(window.__plantania.reportHtml=R=>reportHtml(R));

/* --- 2. plan à l’échelle (PDF) et export DXF (Lambert 2008) --- */
function l08(lat,lon){/* EPSG:3812, conique conforme de Lambert à 2 parallèles, GRS80 */const a=6378137,f=1/298.257222101,e=Math.sqrt(2*f-f*f),r=Math.PI/180,
  m=p=>Math.cos(p)/Math.sqrt(1-e*e*Math.sin(p)**2),t=p=>Math.tan(Math.PI/4-p/2)/Math.pow((1-e*Math.sin(p))/(1+e*Math.sin(p)),e/2),p1=(49+50/60)*r,p2=(51+10/60)*r,pF=(50+47/60+52.134/3600)*r,lF=(4+21/60+33.177/3600)*r,
  n=(Math.log(m(p1))-Math.log(m(p2)))/(Math.log(t(p1))-Math.log(t(p2))),F=m(p1)/(n*Math.pow(t(p1),n)),rF=a*F*Math.pow(t(pF),n),rr=a*F*Math.pow(t(lat*r),n),th=n*(lon*r-lF);
  return[649328+rr*Math.sin(th),665262+rF-rr*Math.cos(th)]}
function planGeom(){const o=S.lat!=null?[S.lat,S.lon]:[50.5,4.5],mp=mPer(o[0]),X=p=>[(p[1]-o[1])*mp,(p[0]-o[0])*111320];
  const items=planItems().map(i=>({...i,m:i.pts.map(X)})),labels=planLabels().map(([t,p])=>[t,X(p)]);let plants=[],cells=[];
  try{const Lg=S.lastLayout;if(Lg&&Lg.pts&&massifOn())plants=Lg.pts.map(q=>{const ll=Lg.geo.toLL(q.x,q.y);return{m:X(ll),r:q.rad||0.25,n:Lg.rows.findIndex(r=>r.p===q.p)+1,col:speciesColor(q.p)}});cells=(Lg.cells||[]).filter(c=>typeof c.sp==='number'&&Lg.rows[c.sp]).map(c=>({m:X(Lg.geo.toLL(c.x,c.y)),s:Lg.cs,col:speciesColor(Lg.rows[c.sp].p)}))}catch(e){}
  const all=[...items.flatMap(i=>i.m.flatMap(p=>i.r?[[p[0]-i.r,p[1]-i.r],[p[0]+i.r,p[1]+i.r]]:[p])),...plants.map(p=>p.m)];if(!all.length)return null;
  const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);return{o,items,labels,plants,cells,x0:Math.min(...xs)-1,x1:Math.max(...xs)+1,y0:Math.min(...ys)-1,y1:Math.max(...ys)+1}}
const PAPER={A4:[297,210],A3:[420,297],A2:[594,420]},SCALES=[20,25,50,75,100,125,150,200,250,300,400,500,750,1000,1500,2000];
function scalePlanSvg(paper,den){const G=planGeom();if(!G)return null;const [PW,PH]=PAPER[paper]||PAPER.A3,mg=10,cartH=34,aw=PW-2*mg,ah=PH-2*mg-cartH-4,bw=G.x1-G.x0,bh=G.y1-G.y0;
  if(!den)den=SCALES.find(s=>bw*1000/s<=aw&&bh*1000/s<=ah)||Math.ceil(Math.max(bw*1000/aw,bh*1000/ah)/100)*100;const k=1000/den,ox=mg+(aw-bw*k)/2,oy=mg+(ah-bh*k)/2,MX=p=>(ox+(p[0]-G.x0)*k).toFixed(2),MY=p=>(oy+(G.y1-p[1])*k).toFixed(2);
  const fits=bw*k<=aw+0.5&&bh*k<=ah+0.5;let s='';
  G.items.forEach(i=>{const lw=Math.max(0.18,(i.lw||2)*0.12);if(i.r){i.m.forEach(p=>{s+=`<circle cx="${MX(p)}" cy="${MY(p)}" r="${Math.max(0.6,i.r*k).toFixed(2)}" fill="${i.col}" fill-opacity=".25" stroke="${i.col}" stroke-width="${lw}"/>`});return}
    const d=i.m.map((p,j)=>(j?'L':'M')+MX(p)+' '+MY(p)).join('')+(i.closed?'Z':'');s+=`<path d="${d}" fill="${i.closed&&i.fill?i.col:'none'}" fill-opacity="${i.fill||0}" stroke="${i.col}" stroke-width="${i.closed?lw:Math.max(lw,(i.lw||2)*0.25)}" stroke-linejoin="round" stroke-linecap="round"${i.dash?' stroke-dasharray="2 1.4"':''}/>`});
  G.cells.forEach(c=>{const w=c.s*k;s+=`<rect x="${(+MX(c.m)-w/2).toFixed(2)}" y="${(+MY(c.m)-w/2).toFixed(2)}" width="${w.toFixed(2)}" height="${w.toFixed(2)}" fill="${c.col}" fill-opacity=".55"/>`});
  G.plants.forEach(p=>{s+=`<circle cx="${MX(p.m)}" cy="${MY(p.m)}" r="${Math.max(0.5,p.r*k).toFixed(2)}" fill="${p.col}" fill-opacity=".55" stroke="#fff" stroke-width=".15"/>`;if(p.r*k>=1.6)s+=`<text x="${MX(p.m)}" y="${(+MY(p.m)+0.9).toFixed(2)}" font-size="2.2" text-anchor="middle" fill="#111">${p.n}</text>`});
  G.labels.forEach(([t,p])=>{s+=`<text x="${MX(p)}" y="${MY(p)}" font-size="2.6" text-anchor="middle" fill="#1d241f" stroke="#fff" stroke-width=".7" paint-order="stroke">${RE(String(t).slice(0,48))}</text>`});
  /* échelle graphique et nord */
  const nice=[1,2,5,10,20,25,50,100,200,500].find(v=>v*k>=25)||10,bx=mg,by=PH-mg-cartH+6;let sb='';for(let i=0;i<4;i++)sb+=`<rect x="${(bx+i*nice*k/4).toFixed(2)}" y="${by}" width="${(nice*k/4).toFixed(2)}" height="2" fill="${i%2?'#fff':'#1d241f'}" stroke="#1d241f" stroke-width=".2"/>`;
  sb+=`<text x="${bx}" y="${by+6}" font-size="2.6">0</text><text x="${(bx+nice*k).toFixed(2)}" y="${by+6}" font-size="2.6" text-anchor="middle">${nice} m</text><text x="${bx}" y="${by+11}" font-size="3" font-weight="700">Échelle 1:${den}</text><text x="${bx}" y="${by+15.5}" font-size="2.3" fill="#555">Imprimer en taille réelle (100 %) sur ${paper} paysage</text>`;
  const nx=PW-mg-8,ny=mg+10,north=`<g transform="translate(${nx} ${ny})"><path d="M0 -8 L4 6 L0 3 L-4 6Z" fill="#1d241f"/><text y="-10" font-size="4" text-anchor="middle" font-weight="700">N</text></g>`;
  const cw=150,cx=PW-mg-cw,cy=PH-mg-cartH,logo=proOn()&&PROID.logo?PROID.logo:'data:image/png;base64,'+LOGO,lr=proOn()&&PROID.logo?PROID.lr||0.5:1,lh=cartH-6,lw2=Math.min(40,lh/lr);
  const pl=proOn()?proLines():['Plantañ.ia'],cl=[CLI.name,CLI.addr,CLI.city||PLACE.commune].filter(Boolean);
  const cart=`<g><rect x="${cx}" y="${cy}" width="${cw}" height="${cartH}" fill="#fff" stroke="#1d241f" stroke-width=".35"/><image href="${logo}" x="${cx+3}" y="${cy+3}" width="${lw2}" height="${lw2*lr}" preserveAspectRatio="xMidYMid meet"/>
   <text x="${cx+lw2+7}" y="${cy+7}" font-size="4.2" font-weight="700">${RE(CLI.title||'Projet de jardin')}</text><text x="${cx+lw2+7}" y="${cy+12}" font-size="2.8">${RE(cl.join(' · '))}</text>
   <text x="${cx+lw2+7}" y="${cy+17}" font-size="2.6" fill="#444">Plan d’aménagement · échelle 1:${den} · ${paper}</text><text x="${cx+lw2+7}" y="${cy+21.5}" font-size="2.6" fill="#444">${new Date().toLocaleDateString('fr-BE')} · Lambert 2008 : ${l08(G.o[0],G.o[1]).map(v=>Math.round(v)).join(' / ')}</text>
   ${pl.slice(0,3).map((l,i)=>`<text x="${cx+lw2+7}" y="${cy+26+i*3.3}" font-size="2.4" fill="#444">${RE(l)}</text>`).join('')}</g>`;
  const leg=G.plants.length?(()=>{const Lg=S.lastLayout,rows=Lg.rows.map((r,i)=>`${i+1}. ${r.p.n}`);return `<g>${rows.slice(0,18).map((t,i)=>`<text x="${mg+70+Math.floor(i/6)*58}" y="${PH-mg-cartH+6+(i%6)*4.4}" font-size="2.5">${RE(t.slice(0,34))}</text>`).join('')}</g>`})():'';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${PW}mm" height="${PH}mm" viewBox="0 0 ${PW} ${PH}" font-family="Arial,Helvetica,sans-serif"><rect width="${PW}" height="${PH}" fill="#fff"/><rect x="${mg/2}" y="${mg/2}" width="${PW-mg}" height="${PH-mg}" fill="none" stroke="#1d241f" stroke-width=".5"/>${s}${sb}${north}${leg}${cart}<text x="${PW-mg}" y="${PH-mg/2-1}" font-size="2" text-anchor="end" fill="#888">Plan indicatif à vérifier sur place · limites cadastrales non contractuelles</text></svg>`;
  return{svg,den,paper,PW,PH,fits}}
async function exportScalePlan(){const paper=$('#spPaper').value,sc=+$('#spScale').value||0,P=scalePlanSvg(paper,sc);if(!P){toast('Dessinez d’abord quelque chose sur la carte.');return}
  if(!P.fits)toast(`Le plan ne tient pas en entier à l’échelle 1:${P.den} sur ${paper} : choisissez une échelle plus petite ou un format plus grand.`);
  const html=`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Plan 1:${P.den}</title><style>@page{size:${P.paper} landscape;margin:0}html,body{margin:0;padding:0}svg{display:block}</style></head><body>${P.svg}</body></html>`;
  const fr=document.createElement('iframe');fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(fr);fr.srcdoc=html;await new Promise(ok=>fr.onload=ok);await new Promise(ok=>setTimeout(ok,300));
  toast(`Plan à l’échelle 1:${P.den} : dans la fenêtre d’impression, choisissez « Enregistrer au format PDF », le format ${P.paper} paysage et l’échelle 100 % (taille réelle).`);try{fr.contentWindow.focus();fr.contentWindow.print()}catch(e){}setTimeout(()=>fr.remove(),60000);return P}
function dxfText(s){return String(s).replace(/[’‘]/g,"'").replace(/[“”«»]/g,'"').replace(/œ/g,'oe').replace(/Œ/g,'OE').replace(/€/g,'EUR').replace(/[–—]/g,'-').replace(/[^\x20-\xff]/g,'')}
function buildDxf(){const L72=[],E=[],LAY={PARCELLE:1,BATI:8,EXISTANT:9,MASSIF:30,PLANTES:3,HAIES:94,ARBRES:96,PELOUSE:82,POTAGER:40,VERGER:52,EAU:5,ZONES:84,CLOTURES:250,FONCTIONNEL:33,DEMOLITION:10,TEXTE:7};
  const P=ll=>l08(ll[0],ll[1]),g=(c,v)=>E.push(c,v),f=n=>n.toFixed(3);
  const poly=(lay,pts,closed)=>{if(!pts||pts.length<2)return;g(0,'POLYLINE');g(8,lay);g(66,1);g(70,closed?1:0);g(10,'0.0');g(20,'0.0');g(30,'0.0');pts.forEach(p=>{const [x,y]=P(p);g(0,'VERTEX');g(8,lay);g(10,f(x));g(20,f(y));g(30,'0.0')});g(0,'SEQEND');g(8,lay)};
  const circ=(lay,p,r)=>{const [x,y]=P(p);g(0,'CIRCLE');g(8,lay);g(10,f(x));g(20,f(y));g(30,'0.0');g(40,f(r))};
  const text=(lay,p,t,h)=>{if(!p||!t)return;const [x,y]=P(p);g(0,'TEXT');g(8,lay);g(10,f(x));g(20,f(y));g(30,'0.0');g(40,f(h||0.3));g(1,dxfText(t).slice(0,120))};
  (S.plots||[]).forEach(p=>poly('PARCELLE',p.pts,1));S.shapes.forEach(s=>{const lay=s.kind==='obsPoly'&&(!s.nat||s.nat==='bat')?'BATI':s.nat==='haie'||s.nat==='caduc'?'HAIES':s.nat==='cloture'||s.nat==='palissade'?'CLOTURES':'EXISTANT';poly(lay,s.pts,s.kind==='obsPoly');text('TEXTE',cen(s.pts),s.name,0.4)});
  (S.paths||[]).forEach(p=>poly('EXISTANT',p.pts,1));S.obs.forEach(o=>{circ('EXISTANT',[o.lat,o.lng],Math.max(0.3,(o.w||3)/2));text('TEXTE',[o.lat,o.lng],o.name||'Arbre existant',0.3)});
  if(S.bed&&S.bed.ll)poly('MASSIF',S.bed.ll,1);S.lawns.forEach(p=>poly('PELOUSE',p.pts,1));S.potagers.forEach(p=>poly('POTAGER',p.pts,1));S.orchards.forEach(p=>poly('VERGER',p.pts,1));S.ponds.forEach(p=>poly('EAU',p.pts,1));S.taluses.forEach(p=>poly('ZONES',p.pts,1));(S.zones||[]).forEach(z=>poly('ZONES',z.pts,z.pts.length>2));
  S.hedges.forEach(h=>poly('HAIES',h.pts,0));S.vines.forEach(h=>poly('HAIES',h.pts,0));S.fences.forEach(h=>poly('CLOTURES',h.pts,0));(S.amen||[]).forEach(a=>{poly('FONCTIONNEL',a.pts,1);text('TEXTE',cen(a.pts),aName(a),0.4)});
  (S.demo||[]).forEach(d=>{const G=dGeom(d);if(!G)return;if(G.length===1)circ('DEMOLITION',G[0],0.5);else poly('DEMOLITION',G,d.geo==='area')});
  (S.trees||[]).forEach(t=>{const C=t._ch||tChoose(t);circ('ARBRES',t.pts[0],0.15);circ('ARBRES',t.pts[0],C.W/2);text('TEXTE',t.pts[0],C.name,0.35)});S.fruits.forEach(fr=>{circ('ARBRES',[fr.lat,fr.lng],0.15);text('TEXTE',[fr.lat,fr.lng],FRUITS[fr.sp].n,0.3)});
  try{const Lg=S.lastLayout;if(Lg&&Lg.pts&&massifOn())Lg.pts.forEach(q=>{const ll=Lg.geo.toLL(q.x,q.y);circ('PLANTES',ll,q.rad||0.25);text('PLANTES',ll,String(Lg.rows.findIndex(r=>r.p===q.p)+1),Math.max(0.12,(q.rad||0.25)*0.6))})}catch(e){}
  const out=[];const o=(c,v)=>out.push(String(c),String(v));o(0,'SECTION');o(2,'HEADER');o(9,'$ACADVER');o(1,'AC1009');o(9,'$DWGCODEPAGE');o(3,'ANSI_1252');o(9,'$INSUNITS');o(70,6);o(0,'ENDSEC');
  o(0,'SECTION');o(2,'TABLES');o(0,'TABLE');o(2,'LAYER');o(70,Object.keys(LAY).length);Object.entries(LAY).forEach(([n,c])=>{o(0,'LAYER');o(2,n);o(70,0);o(62,c);o(6,'CONTINUOUS')});o(0,'ENDTAB');o(0,'ENDSEC');
  o(0,'SECTION');o(2,'ENTITIES');for(let i=0;i<E.length;i+=2)o(E[i],E[i+1]);o(0,'ENDSEC');o(0,'EOF');
  const txt=out.join('\r\n')+'\r\n',u=new Uint8Array(txt.length);for(let i=0;i<txt.length;i++){const c=txt.charCodeAt(i);u[i]=c<256?c:63}return u}
function exportDxf(){if(S.lat==null){toast('Placez d’abord le terrain.');return}const u=buildDxf();download(new Blob([u],{type:'application/dxf'}),(CLI.title||PRJ.name||'plan').replace(/[^\wÀ-ÿ -]+/g,'').trim().replace(/\s+/g,'-')+'-lambert2008.dxf');toast('Plan DXF téléchargé : coordonnées Lambert 2008 (EPSG:3812), en mètres, un calque par type d’élément.')}
{const ch=$('#exPdf')&&$('#exPdf').closest('.chips');if(ch)ch.insertAdjacentHTML('afterend',`<div class="card xcard proonly" id="spCard"><h4>Plan à l’échelle</h4><p class="small">Plan coté pour le chantier ou un devis : échelle exacte, échelle graphique, nord, cartouche avec vos coordonnées. Le DXF s’ouvre dans AutoCAD, QGIS, LibreCAD ou Vectorworks (coordonnées Lambert 2008, un calque par élément).</p>
  <div class="frow"><label>Format<select id="spPaper"><option>A4</option><option selected>A3</option><option>A2</option></select></label><label>Échelle<select id="spScale"><option value="0">Automatique (la plus grande qui tient)</option>${[50,100,200,250,500,1000].map(s=>`<option value="${s}">1:${s}</option>`).join('')}</select></label></div>
  <div class="chips"><button type="button" class="pri" id="spPdf">Plan à l’échelle (PDF)</button><button type="button" id="spDxf">Plan DXF (AutoCAD)</button></div></div>`)}
$('#export').addEventListener('click',e=>{if(e.target.id==='spPdf')exportScalePlan();else if(e.target.id==='spDxf')exportDxf()});

/* --- 3. arbres : liste d’achats, ombre future, un seul outil avec les fruitiers --- */
{const _v4s28=v4Sheets;v4Sheets=function(sh,buy){_v4s28(sh,buy);if(!S.trees.length)return;const rows=S.trees.map((t,i)=>{const I=tInfo(t);buy.push(['Plante',I.C.name,I.C.lat,1,'pièce',`${tName(t)} — ${I.sz.l}`]);return[i+1,I.C.name,I.C.lat,`${nf(I.C.h,0)} m`,`${nf(I.C.W,0)} m`,I.sz.l,[...I.warn,...I.ok].join(' ')]});
  const n=S.trees.filter(t=>t.size!=='baliveau').length,nb=S.trees.length-n;if(n)buy.push(['Produit','Tuteur tripode (3 piquets, traverses, colliers)','',n,'kit','Arbres à planter']);if(nb)buy.push(['Produit','Piquet de tuteurage et collier','',nb,'pièce','Arbres à planter (baliveaux)']);
  buy.push(['Produit','Compost de plantation','',S.trees.length*30,'L','Arbres à planter — 30 L par arbre']);buy.push(['Produit','Paillage (écorces ou broyat)','',S.trees.length*60,'L','Arbres à planter — cercle de 1 m']);
  sh.push({name:'Arbres',head:['N°','Arbre','Nom latin','Hauteur adulte','Largeur adulte','Taille à l’achat','Distances et remarques'],rows})}}
S.futShade=S.futShade||'none';
const FUTL={none:'Non comptée',now:'À la plantation',y10:'Dans 10 ans',adult:'À maturité'};
const T0H={baliveau:1.5,tige8:3,tige12:4,gros:6};
function treeAtAge(t){const C=t._ch||tChoose(t),h0=Math.min(C.h,T0H[t.size]||3);if(S.futShade==='now')return{h:h0,w:Math.max(0.6,C.W*h0/C.h)};if(S.futShade==='y10'){const h=Math.min(C.h,h0+0.55*(C.h-h0));return{h,w:Math.max(0.8,C.W*h/C.h)}}return{h:C.h,w:C.W}}
{const _oa28=obsAll;obsAll=function(){const r=_oa28();if(S.futShade==='none'||(!S.trees.length&&!S.fruits.length))return r;const add=[];
  S.trees.forEach(t=>{const A=treeAtAge(t),C=t._ch||tChoose(t);add.push({lat:t.pts[0][0],lng:t.pts[0][1],h:A.h,w:A.w,type:C.p.pers?'pers':'caduc',fut:1})});
  S.fruits.forEach(f=>{try{const fo=fruitForme(f),h=fo.h||4,w=fo.sp||4,k=S.futShade==='now'?0.4:S.futShade==='y10'?0.8:1;add.push({lat:f.lat,lng:f.lng,h:h*k,w:w*k,type:'caduc',fut:1})}catch(e){}});return r.concat(add)}}
function futSel(id){return `<label class="small futsel">Ombre des arbres que vous plantez <select data-fut="1" id="${id}">${Object.entries(FUTL).map(([k,l])=>`<option value="${k}"${S.futShade===k?' selected':''}>${l}</option>`).join('')}</select></label>`}
{const so=$('#soleil .in');if(so)so.insertAdjacentHTML('beforeend',`<div class="card" id="futCard">${futSel('futSun')}<p class="small">Par défaut, l’ensoleillement est calculé avec ce qui existe aujourd’hui. Choisissez « dans 10 ans » ou « à maturité » pour voir l’ombre future des arbres et fruitiers que vous plantez : les plantes du massif s’y adaptent.</p></div>`)}
document.addEventListener('change',e=>{if(!e.target.dataset||!e.target.dataset.fut)return;S.futShade=e.target.value;document.querySelectorAll('[data-fut]').forEach(s=>{s.value=S.futShade});S.samples=null;sunUpdate();try{renderTrees()}catch(err){}saveNow(true)});
{const _rt28=renderTrees;renderTrees=function(){_rt28();const b=$('#treeBox');if(b&&S.trees.length)b.insertAdjacentHTML('afterbegin',`<div class="card">${futSel('futTree')}</div>`)}}
{const _ser28b=serialize;serialize=function(){const d=_ser28b();d.set.futShade=S.futShade;return d}}
{const _rs28b=restoreSettings;restoreSettings=function(t){_rs28b(t);S.futShade=t&&FUTL[t.futShade]?t.futShade:'none'}}
/* un seul outil « Arbre » pour l’ornement et les fruitiers */
{const tt=TOOLS.find(t=>t[0]==='tree');if(tt)tt[1]='Arbre ou fruitier (point)'}SHORT.tree='Arbre ou fruitier';delete TOOLWANT.tree;HINT.tree='Arbre : cliquez où le planter. Choisissez ensuite « arbre d’ornement » ou « fruitier » dans sa fiche ; l’essence est conseillée selon le sol, la place et vos envies.';
{const _rmt28=renderMapTools;renderMapTools=function(){_rmt28();const b=document.querySelector('#mapTools [data-mt="fruit"]');if(b)b.remove()}}
{const _sc28=siteClick;siteClick=function(lat,lng){if(S.mode==='tree'&&wantOn('fruit')&&!wantOn('arbre')){addFruit(lat,lng);try{const f=S.fruits[S.fruits.length-1];edOpenQuiet('fruits',f.id)}catch(e){}toast('Fruitier ajouté : choisissez son espèce et sa forme dans sa fiche.');return}return _sc28(lat,lng)}}
const kindSel=k=>`<label>Genre<select data-tk="1"><option value="orn"${k==='orn'?' selected':''}>Arbre d’ornement ou d’ombrage</option><option value="fruit"${k==='fruit'?' selected':''}>Arbre fruitier</option></select></label>`;
{const _eh28=editorHtml;editorHtml=function(kind,it){let h=_eh28(kind,it);if(!it)return h;if(kind==='trees')h=h.replace('<div class="frow">','<div class="frow">'+kindSel('orn'));else if(kind==='fruits')h=h.replace(/^(<div class="ited">)/,`$1<div class="frow">${kindSel('fruit')}</div>`);return h}}
$('#itemsList').addEventListener('change',e=>{if(!e.target.dataset.tk)return;const li=e.target.closest('[data-ei]');if(!li)return;const kind=li.dataset.ek,id=li.dataset.ei,v=e.target.value;
  if(kind==='trees'&&v==='fruit'){const t=S.trees.find(x=>String(x.id)===String(id));if(!t)return;pushUndo();S.trees=S.trees.filter(x=>x!==t);addFruit(t.pts[0][0],t.pts[0][1]);const f=S.fruits[S.fruits.length-1];treesChanged();edOpenQuiet('fruits',f.id);toast('Changé en fruitier : choisissez son espèce.')}
  else if(kind==='fruits'&&v==='orn'){const f=S.fruits.find(x=>String(x.id)===String(id));if(!f)return;pushUndo();S.fruits=S.fruits.filter(x=>x!==f);const t={id:++itemId,pts:[[f.lat,f.lng]],sp:'',cv:'',role:'auto',size:'tige8'};S.trees.push(t);treesChanged();edOpenQuiet('trees',t.id);toast('Changé en arbre d’ornement : l’essence est conseillée selon la place.')}});

/* --- 4. contraintes du site : zone inondable, Natura 2000, arbres remarquables --- */
const CONS={key:null,st:'',flood:null,n2k:[],n2kNear:[],ahrem:[],err:[]};const consLayer=L.layerGroup?L.layerGroup().addTo(map):null;
async function arcq(base,lat,lng,dist,fields,geom){const u=`${base}/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects${dist?`&distance=${dist}&units=esriSRUnit_Meter`:''}&outFields=${fields}&returnGeometry=${geom?'true':'false'}&outSR=4326&f=json`;
  const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);try{const r=await fetch(u,{signal:c.signal});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(j.error)throw new Error(j.error.message||'erreur');return j.features||[]}finally{clearTimeout(t)}}
const ALEA={1:'faible',2:'moyen',3:'élevé'},ALEAT={1:'débordement de cours d’eau',2:'ruissellement',3:'débordement et ruissellement'};
async function loadCons(force){if(S.lat==null)return;const c=S.plots&&S.plots.length?cen(S.plots[0].pts):[S.lat,S.lon],key=c[0].toFixed(4)+','+c[1].toFixed(4);if(!force&&CONS.key===key&&!CONS.err.length)return;Object.assign(CONS,{key,st:'load',flood:null,n2k:[],n2kNear:[],ahrem:[],err:[],c});renderCons();
  const W='https://geoservices.wallonie.be/arcgis/rest/services',EEA='https://bio.discomap.eea.europa.eu/arcgis/rest/services/ProtectedSites/Natura2000Query_WM/MapServer/1';
  await Promise.all([
   arcq(W+'/EAU/ALEA_INOND/MapServer/2',c[0],c[1],25,'CLASSEMENT,VALEUR').then(F=>{const v=F.map(f=>+f.attributes.CLASSEMENT).filter(Boolean).sort((a,b)=>(b%100)-(a%100))[0];CONS.flood=v?{lvl:Math.floor(v%100/10),type:Math.floor(v/100)}:false}).catch(e=>{CONS.err.push('inondation')}),
   arcq(EEA,c[0],c[1],0,'SITECODE,SITENAME,SITETYPE').then(F=>{CONS.n2k=F.map(f=>f.attributes)}).catch(e=>{CONS.err.push('Natura 2000')}),
   arcq(EEA,c[0],c[1],500,'SITECODE,SITENAME,SITETYPE').then(F=>{CONS.n2kNear=F.map(f=>f.attributes)}).catch(()=>{}),
   ...[0,1].map(l=>arcq(W+'/FAUNE_FLORE/AHREM/MapServer/'+l,c[0],c[1],150,'SPFR,SP,CIRC,H,TYPE,ADRESSE',true).then(F=>F.forEach(f=>{const g=f.geometry||{},pts=g.x!=null?[[g.y,g.x]]:g.paths?g.paths[0].map(([x,y])=>[y,x]):g.points?g.points.map(([x,y])=>[y,x]):[];if(!pts.length)return;const d=Math.min(...pts.map(p=>llDist(p,c)));CONS.ahrem.push({...f.attributes,pts,d,line:l===1})})).catch(e=>{if(l===0)CONS.err.push('arbres remarquables')}))]);
  CONS.ahrem.sort((a,b)=>a.d-b.d);CONS.st='ok';renderCons();drawCons();try{renderV4()}catch(e){}}
function drawCons(){if(!consLayer)return;consLayer.clearLayers();CONS.ahrem.forEach(a=>{const lab=`Arbre ${a.line?'(alignement ou haie) ':''}remarquable : ${a.SPFR||a.SP||'essence non précisée'}${a.CIRC?` · ${a.CIRC} cm de tour`:''}`;try{if(a.pts.length===1)L.circleMarker(a.pts[0],{radius:7,color:'#6a1b9a',weight:2,fillColor:'#ce93d8',fillOpacity:.8}).addTo(consLayer).bindTooltip(lab);else L.polyline(a.pts,{color:'#6a1b9a',weight:4,dashArray:'2 6'}).addTo(consLayer).bindTooltip(lab)}catch(e){}})}
function consAdvice(){const o=[],reg=regionKey()||(inBox(BXL,S.lat,S.lon)?'bxl':S.lat>50.76?'vla':'wal');
  if(CONS.flood){const lv=ALEA[CONS.flood.lvl]||'',ty=ALEAT[CONS.flood.type]||'';o.push(['ko',`Zone d’aléa d’inondation ${lv} (${ty})`,`Ne remblayez pas et ne surélevez pas le terrain sans permis : cela reporte l’eau chez les voisins. Choisissez des plantes qui supportent d’avoir les pieds dans l’eau quelques jours, surélevez l’abri de jardin et stockez le matériel en hauteur.${CONS.flood.type!==1?' Ruissellement : une haie ou une noue perpendiculaire à la pente freine l’eau.':''} Un jardin de pluie ne doit pas aggraver l’inondation : placez-le hors des zones où l’eau stagne déjà.`])}
  else if(CONS.flood===false&&reg==='wal')o.push(['ok','Pas de zone d’aléa d’inondation cartographiée sur le terrain','Selon la carte de l’aléa d’inondation de Wallonie (SPW). Cela ne garantit pas l’absence de toute inondation.']);
  if(reg==='vla')o.push(['mid','Zone inondable : à vérifier sur la carte flamande','La carte des zones sensibles aux inondations (watertoets) n’est pas interrogée automatiquement : vérifiez-la pour l’adresse.','https://www.vlaanderen.be/natuur-en-milieu/waterbeheer/kaart-van-overstromingsgevoelige-gebieden']);
  if(reg==='bxl')o.push(['mid','Zone inondable : à vérifier sur la carte bruxelloise','La carte de l’aléa d’inondation de Bruxelles Environnement n’est pas interrogée automatiquement : vérifiez-la pour l’adresse.','https://environnement.brussels/citoyen/documentation-et-outils/cartes/cartes-relatives-aux-inondations-pour-la-region-bruxelloise']);
  const auth=reg==='vla'?'l’Agentschap voor Natuur en Bos (ANB)':reg==='bxl'?'Bruxelles Environnement':'le Département de la Nature et des Forêts (DNF)';
  if(CONS.n2k.length){const s=CONS.n2k[0];o.push(['ko',`Dans le site Natura 2000 « ${s.SITENAME} » (${s.SITECODE})`,`Certains travaux demandent une autorisation ou une notification auprès de ${auth} : abattre des arbres ou des haies, modifier le relief, drainer, planter des résineux, transformer une prairie. Préférez des essences indigènes et aucune plante invasive.`])}
  else if(CONS.n2kNear.length){const s=CONS.n2kNear[0];o.push(['mid',`Site Natura 2000 à moins de 500 m : « ${s.SITENAME} »`,'Pas de contrainte directe sur votre terrain, mais évitez les plantes invasives (elles s’échappent vers le site) et privilégiez les espèces indigènes.'])}
  else if(CONS.st==='ok'&&!CONS.err.includes('Natura 2000'))o.push(['ok','Pas de site Natura 2000 à moins de 500 m','Source : Agence européenne pour l’environnement.']);
  const near=CONS.ahrem.filter(a=>a.d<=30),far=CONS.ahrem.filter(a=>a.d>30);
  if(near.length)o.push(['ko',`${near.length} arbre${near.length>1?'s':''} ou haie${near.length>1?'s':''} remarquable${near.length>1?'s':''} sur le terrain ou tout près`,`${near.slice(0,4).map(a=>`${a.SPFR||a.SP||'Essence non précisée'}${a.CIRC?` (${a.CIRC} cm de tour)`:''} à ${nf(a.d,0)} m`).join(' ; ')}. Abattre, élaguer fortement ou toucher aux racines d’un arbre ou d’une haie remarquable demande un permis d’urbanisme. Pendant les travaux, ne creusez pas et ne roulez pas sous la couronne.`,'https://www.wallonie.be/fr/demarches/savoir-si-un-arbre-ou-une-haie-est-remarquable-ou-classee-en-wallonie']);
  else if(far.length)o.push(['mid',`Arbre ou haie remarquable à ${nf(far[0].d,0)} m`,`${far[0].SPFR||far[0].SP||'Essence non précisée'} : visible sur la carte (violet). Sans contrainte directe pour votre terrain.`]);
  else if(CONS.st==='ok'&&reg==='wal'&&!CONS.err.includes('arbres remarquables'))o.push(['ok','Aucun arbre ou haie remarquable à moins de 150 m','Liste officielle des arbres et haies remarquables de Wallonie (SPW).']);
  if(reg==='vla')o.push(['mid','Arbres protégés : inventaire flamand','Les arbres et plantations protégés figurent dans l’inventaire du patrimoine immobilier flamand.','https://inventaris.onroerenderfgoed.be/']);
  if(reg==='bxl')o.push(['mid','Arbres remarquables : inventaire bruxellois','Les arbres remarquables et classés de Bruxelles figurent dans l’inventaire du patrimoine.','https://monument.heritage.brussels/']);
  try{const dem=(S.demo||[]).filter(d=>d.type==='arbre'||d.type==='souche');dem.forEach(d=>{const G=dGeom(d);if(!G||!G.length)return;const a=CONS.ahrem.find(a=>Math.min(...a.pts.map(p=>llDist(p,G[0])))<4);if(a)o.unshift(['ko','Un arbre à abattre semble être un arbre remarquable',`${a.SPFR||a.SP||'Arbre'} : ne l’abattez pas sans permis d’urbanisme.`])})}catch(e){}
  return o}
function renderCons(){let box=$('#consCard');if(!box){const sy=$('#carte .in');if(!sy)return;sy.insertAdjacentHTML('beforeend','<div class="card" id="consCard" style="margin-top:16px"></div>');box=$('#consCard')}
  if(S.lat==null){box.innerHTML='';return}if(CONS.st==='load'){box.innerHTML='<h4>Contraintes et protections du site</h4><p class="small">Recherche des zones inondables, des sites Natura 2000 et des arbres remarquables…</p>';return}
  const A=consAdvice(),ic={ok:'✓',mid:'•',ko:'⚠'};box.innerHTML=`<h4>Contraintes et protections du site</h4><ul class="cons">${A.map(([k,t,d,u])=>`<li class="c-${k}"><b>${ic[k]} ${esc(t)}</b><span class="small">${esc(d)}${u?` <a href="${esc(u)}" target="_blank" rel="noopener">Consulter ↗</a>`:''}</span></li>`).join('')}</ul>${CONS.err.length?`<p class="small muted">Données momentanément indisponibles : ${CONS.err.join(', ')}. <button type="button" id="consRetry">Réessayer</button></p>`:''}<p class="small muted">Sources : SPW (aléa d’inondation, arbres et haies remarquables), Agence européenne pour l’environnement (Natura 2000). Informations indicatives : seule l’administration fait foi.</p>`}
document.addEventListener('click',e=>{if(e.target.id==='consRetry')loadCons(true)});
{const _ss28=setSite;setSite=function(...a){const r=_ss28(...a);setTimeout(()=>loadCons(),400);return r}}
{const _ic28=itemsChanged;itemsChanged=function(a){_ic28(a);if(S.plots&&S.plots.length&&CONS.key){const c=cen(S.plots[0].pts);if(c[0].toFixed(4)+','+c[1].toFixed(4)!==CONS.key)setTimeout(()=>loadCons(),300)}}}
{const _vs28=v4Sections;v4Sections=function(){const o=_vs28();try{if(CONS.st==='ok'){const A=consAdvice();if(A.length){const i=o.findIndex(s=>/SOL|CLIMAT|SITE/.test(s.title));const sec={title:'CONTRAINTES ET PROTECTIONS DU SITE',intro:'Zones inondables, sites Natura 2000 et arbres remarquables autour du terrain (sources officielles, à titre indicatif).',tables:[{head:['Constat','Ce que cela implique'],rows:A.map(([k,t,d])=>[({ok:'✓ ',mid:'• ',ko:'⚠ '}[k])+t,d]),w:[5200,9638]}]};o.splice(i>=0?i+1:1,0,sec)}}}catch(e){}return o}}
setTimeout(()=>loadCons(),2500);
window.__p28={load:()=>loadCons(true),l08,scalePlanSvg:(p,s)=>{const r=scalePlanSvg(p,s);return r&&{den:r.den,fits:r.fits,len:r.svg.length}},planSvg:(p,s)=>{const r=scalePlanSvg(p,s);return r&&r.svg},buildDxf:()=>{const u=buildDxf();return String.fromCharCode.apply(null,u.slice(0,Math.min(u.length,60000)))},consAdvice:()=>consAdvice(),CONS,proLines:()=>proLines(),setPro:o=>{Object.assign(PROID,o);proSave();proFill()}};

/* ================= v29 : 6 espaces, projet express, tarifs des professionnels, jardin dans le temps, eau de pluie ================= */
/* --- 1. onglets regroupés en 6 espaces --- */
const TGRP=[['projet','🎯 Mon projet',['envies','projet'],['envies']],['terrain','🗺️ Mon terrain',['carte','synthese','climat','sol','soleil','patri'],['carte']],
 ['veg','🌿 Végétal',['massif','plantes','coherence','arbres','amenagements','pelouse','zones','potager','verger','jardinieres','rendu'],['massif']],
 ['amen','🧱 Aménagements',['fonct','cloture','demo','eau','arrosage','diy','machines'],['fonct']],['soin','🩺 Entretien et santé',['entretien','temps','ident','sante'],['entretien']],
 ['bud','💶 Budget et rapport',['budget','primes','pros','export'],['budget','export']]];
TABS.forEach(t=>{if(!TGRP.some(g=>g[2].includes(t)))TGRP[1][2].push(t)});
let TG=(()=>{try{return localStorage.getItem('plantania:tg')||''}catch(e){return''}})();
const grpOf=t=>(TGRP.find(g=>g[2].includes(t))||TGRP[1])[0];
{const nav=$('#tabs'),h=nav&&nav.querySelector('.tabhint');if(nav){const row=document.createElement('div');row.className='tabrow';while(nav.firstChild)row.appendChild(nav.firstChild);nav.appendChild(row);nav.classList.add('tabs29')}if(nav)nav.insertAdjacentHTML('afterbegin',`<div class="tgrp" id="tGroups" role="group" aria-label="Espaces">${TGRP.map(g=>`<button type="button" data-tg="${g[0]}" aria-pressed="false">${g[1]}</button>`).join('')}</div>`);if(h)h.textContent='Dans cet espace :'}
function grpVis(){const g=TGRP.find(x=>x[0]===TG),cur=curTabs();document.querySelectorAll('#tGroups [data-tg]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tg===TG)));
  document.querySelectorAll('#tabs [data-tab]').forEach(b=>{const id=b.dataset.tab;b.hidden=!!g&&!g[2].includes(id)&&!cur.includes(id);b.classList.toggle('tother',!!g&&!g[2].includes(id))})}
{const _at29=applyTabs;applyTabs=function(sel){_at29(sel);if(sel.length&&!(TGRP.find(x=>x[0]===TG)||[0,0,[]])[2].some(t=>sel.includes(t)))TG=grpOf(sel[sel.length-1]);try{localStorage.setItem('plantania:tg',TG)}catch(e){}grpVis()}}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tg]');if(!b)return;e.stopPropagation();TG=b.dataset.tg;const g=TGRP.find(x=>x[0]===TG);const sel=g[3].filter(t=>TABS.includes(t));applyTabs(oneTab?[sel[0]]:sel);const s=$('#'+sel[0]);if(s)s.scrollIntoView({behavior:'smooth',block:'start'})},true);
if(!TG)TG=grpOf(curTabs()[0]||'carte');grpVis();

/* --- 2. projet express (particuliers) : assistant en 4 étapes --- */
const EXW=[['massif','🌸','Des fleurs','Un massif fleuri toute l’année'],['arbre','🌳','Un arbre','Pour l’ombre, les fleurs ou l’automne'],['pelouse','⚽','Une pelouse','Pour jouer et se détendre'],['potager','🥕','Un potager','Légumes et aromatiques au soleil'],
 ['haie','🌿','Une haie','Intimité, abri pour les oiseaux'],['terrasse','🪑','Une terrasse','Contre la façade la plus ensoleillée'],['mare','💧','Une mare','Un point d’eau pour la faune'],['fruit','🍎','Des fruitiers','Pommes, poires, petits fruits']];
const EXA={auto:'✨',ang:'🌼',nat:'🍃',jap:'🎋',gra:'🔲',med:'☀️',eco:'🐝',viv:'🥬',ros:'🌹',nw:'🌾'};
const EXC=[['low','🪴','Le moins possible','Quelques heures par an'],['mid','🌿','Un peu chaque mois','Une demi-journée par mois'],['high','🧑‍🌾','J’adore jardiner','Un peu chaque semaine']];
const EXT=[['Où se trouve votre jardin ?','Tapez l’adresse et choisissez-la dans la liste.'],['Que voulez-vous faire sur ce terrain ?','Partir de zéro, modifier ce qui existe ou tout changer.'],['Que voulez-vous y faire ?','Choisissez une ou plusieurs envies.'],['Quel style vous ressemble ?','L’ambiance et le temps que vous voulez y consacrer.'],['Votre projet se prépare','Le site place chaque élément selon le soleil, le sol et la place.']];
const EX={step:1,pm:'create',addr:null,keep:false,want:new Set(),amb:'auto',care:'low',sugg:[],busy:false,done:null};
const hasDrawn=()=>!!(S.trees.length||S.shapes.length||S.plots.length||S.obs.length||S.bed||S.hedges.length||S.lawns.length||S.ponds.length||S.fruits.length||S.potagers.length||(S.amen||[]).length);
function exShell(){document.body.insertAdjacentHTML('beforeend',`<dialog id="expDlg" class="exdlg" aria-labelledby="exTitle"><div class="exhero"><div><span class="exkick">⚡ Projet express</span><h2 id="exTitle"></h2><p id="exSub"></p></div><button type="button" class="exx" data-ex="x" aria-label="Fermer">×</button></div>
  <ol class="exdots" aria-hidden="true">${[1,2,3,4,5].map(i=>`<li data-d="${i}"><span>${i}</span></li>`).join('')}</ol><div class="exbody" id="exBody"></div>
  <div class="exfoot"><button type="button" class="exback" data-ex="back">← Retour</button><button type="button" class="pri exnext" data-ex="next">Continuer →</button></div></dialog>`);
  const d=$('#expDlg');d.addEventListener('click',exClick);d.addEventListener('input',exInput);d.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='exQ'){e.preventDefault();if(EX.sugg[0])exPick(0)}});d.addEventListener('cancel',e=>{if(EX.busy)e.preventDefault()})}
function exOpenStep(){const d=$('#expDlg'),n=EX.step;$('#exTitle').textContent=EXT[n-1][0];$('#exSub').textContent=EXT[n-1][1];d.querySelectorAll('.exdots li').forEach(li=>{const i=+li.dataset.d;li.className=i<n?'done':i===n?'cur':''});
  const B=$('#exBody');
  if(n===1)B.innerHTML=`${S.lat!=null&&!EX.addr?`<button type="button" class="excard exkeep${EX.keep?' on':''}" data-ex="keep"><span class="exi">📍</span><span><b>Garder le terrain déjà placé</b><small>${S.parcel?'Parcelle '+esc(S.parcel.id||'')+' · ':''}${nf(S.lat,5)}, ${nf(S.lon,5)}</small></span></button><p class="exor">ou cherchez une autre adresse</p>`:''}
    <div class="exsearch"><span aria-hidden="true">🔎</span><input type="text" id="exQ" placeholder="Rue, numéro, commune" autocomplete="off" aria-label="Adresse du jardin" aria-controls="exSugg" value="${EX.addr?'':esc(EX.q||'')}"></div>
    ${EX.addr?`<div class="excard exsel on"><span class="exi">📍</span><span><b>${esc(EX.addr.l1)}</b><small>${esc(EX.addr.l2)}</small></span><button type="button" class="exlink" data-ex="chg">Changer</button></div>`:`<ul class="exsugg" id="exSugg" role="listbox">${EX.sugg.map((x,i)=>`<li><button type="button" data-sg="${i}"><b>${esc(x.l1)}</b><small>${esc(x.l2)}</small></button></li>`).join('')}</ul><p class="exhint" id="exMsg">${EX.msg||''}</p>`}
    <button type="button" class="exlink exgeo" data-ex="geo">📡 Utiliser ma position actuelle</button>`;
  if(n===2)B.innerHTML=`<div class="exgrid expm">${Object.entries(PM).map(([k,[i,t,d]])=>`<button type="button" class="excard${EX.pm===k?' on':''}" data-xpm="${k}" aria-pressed="${EX.pm===k}"><span class="exi">${i}</span><span><b>${t}</b><small>${d}</small></span><span class="exck" aria-hidden="true">✓</span></button>`).join('')}</div><p class="exhint">${EX.pm==='create'?'Le site repère quand même la maison et les arbres pour calculer les ombres.':'Le site repère la maison, les arbres, les haies et les clôtures : vous choisirez ensuite ce que vous gardez.'}</p>`;
  if(n===3)B.innerHTML=`<div class="exgrid">${EXW.map(([k,i,t,s])=>`<button type="button" class="excard${EX.want.has(k)?' on':''}" data-w="${k}" aria-pressed="${EX.want.has(k)}"><span class="exi">${i}</span><span><b>${t}</b><small>${s}</small></span><span class="exck" aria-hidden="true">✓</span></button>`).join('')}</div>`;
  if(n===4){const amb=ENVQ.find(q=>q.k==='amb').o;B.innerHTML=`<h3 class="exh">L’ambiance</h3><div class="exgrid exsmall">${amb.map(([k,l])=>`<button type="button" class="excard${EX.amb===k?' on':''}" data-a="${k}" aria-pressed="${EX.amb===k}"><span class="exi">${EXA[k]||'🌱'}</span><span><b>${esc(l)}</b></span></button>`).join('')}</div>
    <h3 class="exh">Le temps d’entretien</h3><div class="exseg">${EXC.map(([k,i,t,s])=>`<button type="button" class="excard${EX.care===k?' on':''}" data-c="${k}" aria-pressed="${EX.care===k}"><span class="exi">${i}</span><span><b>${t}</b><small>${s}</small></span></button>`).join('')}</div>`}
  if(n===5)B.innerHTML=`<ul class="exprog">${[['site','Terrain placé'],['parcel','Limites de la parcelle'],['bat','Existant : maison, arbres, haies…'],['props','Aménagements placés']].map(([k,t])=>`<li data-p="${k}" class="wait"><span class="exst" aria-hidden="true"></span><span><b>${t}</b><small></small></span></li>`).join('')}</ul><div id="exDone"></div>`;
  const back=d.querySelector('.exback'),next=d.querySelector('.exnext');back.hidden=n===1||n===5;next.hidden=n===5;next.textContent=n===4?'Créer mon projet ✨':'Continuer →';
  next.disabled=n===1?!(EX.addr||EX.keep):n===3?!EX.want.size:false;
  if(n===1&&!EX.addr)setTimeout(()=>{const q=$('#exQ');if(q)q.focus()},60)}
let exT=0,exTok=0;
function exInput(e){if(e.target.id!=='exQ')return;EX.q=e.target.value;EX.keep=false;const k=$('#expDlg .exkeep');if(k)k.classList.remove('on');$('#expDlg .exnext').disabled=true;clearTimeout(exT);const q=EX.q.trim();if(q.length<3){EX.sugg=[];exSugg();return}exT=setTimeout(()=>exGeocode(q),350)}
function exSugg(msg){const u=$('#exSugg');if(u)u.innerHTML=EX.sugg.map((x,i)=>`<li><button type="button" data-sg="${i}"><b>${esc(x.l1)}</b><small>${esc(x.l2)}</small></button></li>`).join('');const m=$('#exMsg');if(m)m.textContent=msg||''}
async function exGeocode(q){const tk=++exTok;exSugg('Recherche…');let R_=[];
  try{const r=await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=fr&lat=50.6&lon=4.6`);if(r.ok)R_=((await r.json()).features||[]).map(f=>{const p=f.properties||{},st=[p.street||p.name,p.housenumber].filter(Boolean).join(' ');return{lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0],l1:st||p.name||p.city||'',l2:[[p.postcode,p.city||p.town||p.village||p.county].filter(Boolean).join(' '),p.country].filter(Boolean).join(', ')}}).filter(x=>x.l1)}catch(e){}
  if(!R_.length){try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=fr&addressdetails=1&q=${encodeURIComponent(q)}`);if(r.ok)R_=(await r.json()).map(x=>{const a=x.address||{},st=[a.road||a.pedestrian||x.name,a.house_number].filter(Boolean).join(' ');return{lat:+x.lat,lon:+x.lon,l1:st||x.display_name.split(',')[0],l2:[[a.postcode,a.city||a.town||a.village||a.municipality].filter(Boolean).join(' '),a.country].filter(Boolean).join(', ')}})}catch(e){}}
  if(tk!==exTok)return;const seen=new Set();EX.sugg=R_.filter(x=>{const k=x.l1+'|'+x.l2;if(seen.has(k))return false;seen.add(k);return true}).slice(0,6);exSugg(EX.sugg.length?'':'Aucune adresse trouvée : vérifiez l’orthographe, ou ajoutez la commune.')}
function exPick(i){const x=EX.sugg[i];if(!x)return;EX.addr=x;EX.keep=false;exOpenStep()}
function exClick(e){const t=e.target.closest('button');if(!t)return;const a=t.dataset.ex;
  if(a==='x'){if(!EX.busy)$('#expDlg').close();return}
  if(t.dataset.sg!=null){exPick(+t.dataset.sg);return}
  if(a==='keep'){EX.keep=!EX.keep;EX.addr=null;exOpenStep();return}
  if(a==='chg'){EX.addr=null;exOpenStep();return}
  if(a==='geo'){const m=$('#exMsg');if(!navigator.geolocation){if(m)m.textContent='Position indisponible dans ce navigateur.';return}if(m)m.textContent='Localisation…';
    navigator.geolocation.getCurrentPosition(p=>{EX.addr={lat:p.coords.latitude,lon:p.coords.longitude,l1:'Ma position actuelle',l2:`précision ± ${Math.round(p.coords.accuracy)} m`};EX.keep=false;exOpenStep()},err=>{const m2=$('#exMsg');if(m2)m2.textContent='Position refusée ou indisponible.'},{enableHighAccuracy:true,timeout:15000});return}
  if(t.dataset.xpm){EX.pm=t.dataset.xpm;exOpenStep();return}
  if(t.dataset.w){const k=t.dataset.w;EX.want.has(k)?EX.want.delete(k):EX.want.add(k);t.classList.toggle('on');t.setAttribute('aria-pressed',String(EX.want.has(k)));$('#expDlg .exnext').disabled=!EX.want.size;return}
  if(t.dataset.a){EX.amb=t.dataset.a;$('#expDlg').querySelectorAll('[data-a]').forEach(b=>{b.classList.toggle('on',b===t);b.setAttribute('aria-pressed',String(b===t))});return}
  if(t.dataset.c){EX.care=t.dataset.c;$('#expDlg').querySelectorAll('[data-c]').forEach(b=>{b.classList.toggle('on',b===t);b.setAttribute('aria-pressed',String(b===t))});return}
  if(a==='back'){EX.step=Math.max(1,EX.step-1);exOpenStep();return}
  if(a==='next'){if(EX.step<4){EX.step++;exOpenStep()}else expRun();return}
  if(a==='map'||a==='res'){$('#expDlg').close();if(a==='map'){if(WZ.on)wizGo(1);else showTab('carte',true)}else{if(WZ.on)wizGo(4);else showTab(S.want.has('massif')?'massif':'projet',true)}try{const D=propDomain();if(D&&map.fitBounds)map.fitBounds(D,{padding:[30,30]})}catch(err){}}}
function expOpen(){if(!$('#expDlg'))exShell();if(!EX.busy){EX.step=1;EX.addr=null;EX.keep=S.lat!=null;EX.sugg=[];EX.q='';EX.msg='';EX.want=new Set([...S.want].filter(k=>EXW.some(w=>w[0]===k)));EX.amb=S.env&&S.env.amb||'auto';EX.care=S.env&&S.env.care||'low';EX.pm=S.pmode||(hasDrawn()&&exList().length?'modify':'create')}
  exOpenStep();const d=$('#expDlg');if(d.showModal&&!d.open)d.showModal();else d.setAttribute('open','')}
const wait29=(f,ms)=>new Promise(ok=>{const t0=Date.now(),it=setInterval(()=>{if(f()||Date.now()-t0>ms){clearInterval(it);ok(f())}},200)});
async function osmBuildings(lat,lon){const q=`[out:json][timeout:20];way["building"](around:90,${lat.toFixed(6)},${lon.toFixed(6)});out geom 60;`;
  for(const u of['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']){const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);
    try{const r=await fetch(u,{method:'POST',body:'data='+encodeURIComponent(q),headers:{'content-type':'application/x-www-form-urlencoded'},signal:c.signal});if(!r.ok)continue;const j=await r.json();return(j.elements||[]).filter(w=>w.geometry&&w.geometry.length>3).map(w=>({pts:w.geometry.slice(0,-1).map(g=>[g.lat,g.lon]),tags:w.tags||{}}))}catch(e){}finally{clearTimeout(t)}}
  throw new Error('Service des bâtiments indisponible')}
async function expRun(){EX.step=5;exOpenStep();EX.busy=true;const st=(k,s,txt)=>{const li=$(`#exBody [data-p=${k}]`);if(!li)return;li.className=s;li.querySelector('small').textContent=txt||''};
  const W=[...EX.want],notes=[];let n=0;
  try{st('site','run','');
    if(!EX.keep&&EX.addr){if(hasDrawn()&&EX.pm!=='modify'){newProject();notes.push('Votre projet précédent est gardé dans « Mes projets ».')}setSite(EX.addr.lat,EX.addr.lon,true)}
    if(S.lat==null)throw new Error('Terrain non placé');st('site','ok',EX.addr?`${EX.addr.l1}${EX.addr.l2?', '+EX.addr.l2:''}`:'Terrain déjà placé');
    EXW.forEach(([k])=>{if(!W.includes(k)&&S.want.has(k))try{setWant(k,false)}catch(e){}});
    envApply({want:W,amb:EX.amb,care:EX.care},'express');
    st('parcel','run','Recherche dans le cadastre…');await wait29(()=>S.parcel||S.parcelErr,12000);
    if(S.plots.length){st('parcel','ok',`Limite déjà dessinée (${nf(areaLL(S.plots[0].pts),0)} m²)`)}
    else if(S.parcel){const id=++itemId;S.plots.push({id,pts:S.parcel.ring.map(([x,y])=>[y,x]).slice(0,-1),name:'Parcelle'});initGeom(id);st('parcel','ok',`Parcelle ${S.parcel.id||''} · ${nf(areaLL(S.plots[0].pts),0)} m²`)}
    else{const mp=mPer(S.lat),h=12.5,P=[[-h,-h],[h,-h],[h,h],[-h,h]].map(([x,y])=>[S.lat+y/111320,S.lon+x/mp]),id=++itemId;S.plots.push({id,pts:P,name:'Terrain approximatif'});initGeom(id);st('parcel','warn','Parcelle introuvable : terrain approximatif de 25 × 25 m, à ajuster sur la carte');notes.push('Ajustez la limite du terrain sur la carte (outil « Modifier la forme »).')}
    st('bat','run','Cartes publiques et relief…');S.pmode=EX.pm;renderPm();
    try{const L_=await detRun((k,s_,t)=>{if(s_==='run')st('bat','run',t)});const acc=L_.filter(c=>c.on);detAccept(acc);const nb=acc.filter(c=>c.cat==='bat').length,nt=acc.filter(c=>c.cat==='tree').length,no=acc.length-nb-nt;
      if(acc.length)st('bat','ok',[nb?`${nb} bâtiment${nb>1?'s':''}`:'',nt?`${nt} arbre${nt>1?'s':''}`:'',no?`${no} autre${no>1?'s':''} (haies, clôtures, allées…)`:''].filter(Boolean).join(', ')+(acc.length>1?' ajoutés':' ajouté')+' à l’existant');
      else{st('bat','warn','Rien trouvé : dessinez la maison pour des ombres exactes');notes.push('Dessinez la maison dans « 1. L’existant » : les ombres et la terrasse en dépendent.')}
      const left=L_.length-acc.length;if(left)notes.push(`${left} élément${left>1?'s':''} incertain${left>1?'s':''} non ajouté${left>1?'s':''} : relancez « 🔎 Détecter l’existant » sur la carte pour les vérifier.`)}
    catch(e){st('bat','warn','Services indisponibles : dessinez la maison sur la carte');notes.push('Dessinez la maison dans « 1. L’existant ».')}
    if(EX.pm==='redo'){const n=redoAll(false);if(n)notes.push(`${n} élément${n>1?'s':''} existant${n>1?'s':''} à retirer (bâtiments et arbres gardés) : ajustez dans « Que devient l’existant ? » sous la carte.`)}
    if(EX.pm==='modify')notes.push('Choisissez ce que vous gardez, transformez ou retirez dans « Que devient l’existant ? », sous la carte.');
    st('props','run','Calcul du soleil et de la place libre…');await new Promise(ok=>setTimeout(ok,60));S.samples=null;
    S.phase='create';applyPhase();runProps();await new Promise(ok=>setTimeout(ok,200));const add=$('#propBox [data-pa=add]');const P=(typeof PROP19!=='undefined'&&PROP19&&PROP19.props)||[];
    const labs={};P.forEach(p=>{labs[p.lab]=(labs[p.lab]||0)+1});n=P.length;if(add&&n)add.click();
    itemsChanged(true);sunUpdate();saveNow(true);
    const miss=W.filter(k=>!P.some(p=>p.w===k||(k==='arbre'&&p.k==='tree')));
    if(n)st('props','ok',`${n} élément${n>1?'s':''} placé${n>1?'s':''}`);else st('props','warn','Pas de place libre trouvée : dessinez vos aménagements sur la carte');
    if(miss.length&&n)notes.push(`Pas trouvé de place pour : ${miss.map(k=>(EXW.find(w=>w[0]===k)||[0,0,k])[2].toLowerCase()).join(', ')}. Vous pouvez les dessiner vous-même.`);
    $('#exDone').innerHTML=`<div class="exresult"><h3>${n?'🎉 Votre premier projet est prêt':'Votre terrain est prêt'}</h3>${n?`<div class="exchips">${Object.entries(labs).map(([l,c])=>`<span>${c>1?c+' × ':''}${esc(l)}</span>`).join('')}</div>`:''}
      ${notes.length?`<ul class="exnotes">${notes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}<p class="small">Tout reste modifiable : cliquez un élément sur la carte pour le déplacer, le redimensionner ou le supprimer.</p>
      <div class="exfoot2"><button type="button" data-ex="map">🗺️ Voir sur la carte</button><button type="button" class="pri" data-ex="res">Voir mes plantes et résultats →</button></div></div>`;
    $('#exTitle').textContent=n?'C’est prêt !':'Presque prêt';$('#exSub').textContent='Voici ce qui a été préparé pour vous.';
  }catch(e){console.warn(e);$('#exDone').innerHTML=`<div class="exresult"><h3>Un problème est survenu</h3><p>${esc(e.message||String(e))}</p><div class="exfoot2"><button type="button" data-ex="back">← Revenir</button></div></div>`;const b=$('#expDlg .exback');if(b)b.hidden=false}
  finally{EX.busy=false}}
{const ml=$('#menuList');if(ml)ml.insertAdjacentHTML('afterbegin','<button type="button" id="mExpress">⚡ Projet express</button>');const b=$('#mExpress');if(b)b.addEventListener('click',()=>{$('#menuList').hidden=true;$('#menuBtn').setAttribute('aria-expanded','false');expOpen()})}
{const ev=$('#envies .in');if(ev)ev.insertAdjacentHTML('afterbegin','<div class="card expcard"><span class="exi">⚡</span><div><b>Pressé ?</b><span class="small"> Trois questions et un premier projet complet est dessiné pour vous, selon le soleil et la place.</span></div><button type="button" class="pri" id="expOpenB">Projet express</button></div>');document.addEventListener('click',e=>{if(e.target.id==='expOpenB')expOpen()})}
{const _wh29=welHtml;welHtml=function(a){let h=_wh29(a);if(a==='pub')h=h.replace('<button type="button" data-wt="1">','<button type="button" data-wexp="1">⚡ Projet express (2 minutes)</button><button type="button" data-wt="1">');return h}}
document.addEventListener('click',e=>{if(e.target.closest('[data-wexp]')){try{welClose(false)}catch(err){}setTimeout(expOpen,150)}});

/* --- 3. tarifs du professionnel et prix pour le client --- */
PROID.t=PROID.t||{};
{const pc=$('#proCard');if(pc)pc.insertAdjacentHTML('beforeend',`<h5 class="proth">Mes tarifs</h5><div class="frow"><label>Taux horaire jardinier (€ HTVA)<input type="number" min="0" step="1" data-pt="rate"></label><label>Taux horaire maçon ou entrepreneur (€ HTVA)<input type="number" min="0" step="1" data-pt="macon"></label><label>Marge sur fournitures (%)<input type="number" min="0" max="200" step="1" data-pt="marge"></label><label>Déplacement et installation de chantier (€ HTVA)<input type="number" min="0" step="10" data-pt="depl"></label><label>Validité de l’offre (jours)<input type="number" min="1" step="1" data-pt="valid"></label><label>Acompte à la commande (%)<input type="number" min="0" max="100" step="5" data-pt="acompte"></label></div>
  <label class="ck"><input type="checkbox" data-pt="use"> Utiliser mes tarifs pour tous les budgets</label><label class="ck"><input type="checkbox" data-pt="client"> Rapport destiné à mon client : n’afficher que mon prix (sans « je fais moi-même »), en HTVA et TVAC, avec mes conditions</label>
  <p class="small">Les taux remplacent ceux de l’onglet Budget. Le prix client utilise le milieu de chaque fourchette, arrondi.</p>`)}
function proTFill(){document.querySelectorAll('[data-pt]').forEach(i=>{const v=PROID.t[i.dataset.pt];if(i.type==='checkbox')i.checked=!!v;else i.value=v??''})}
const proT=()=>AUD==='pro'&&PROID.t&&PROID.t.use;const proClient=()=>AUD==='pro'&&PROID.t&&PROID.t.client;
function proTApply(){if(!proT())return;const t=PROID.t;if(+t.rate>0)PRICE.rate[2]=PRICE.rate[3]=+t.rate;if(+t.macon>0)PRICE.macon[2]=PRICE.macon[3]=+t.macon;try{localStorage.setItem('plantania:prices',JSON.stringify(PRICE))}catch(e){}}
$('#export').addEventListener('change',e=>{const k=e.target.dataset.pt;if(!k)return;PROID.t[k]=e.target.type==='checkbox'?e.target.checked:(e.target.value===''?'':+e.target.value);proSave();proTApply();try{renderBudget()}catch(err){}try{renderFonc()}catch(err){}try{renderDemo()}catch(err){}try{renderTrees()}catch(err){}});
proTFill();proTApply();
{const _bl29=budgetLines;budgetLines=function(){const L_=_bl29();if(proT()&&+PROID.t.depl>0&&L_.length){const d=+PROID.t.depl*1.21;L_.push({k:'depl',t:'Déplacement et installation de chantier',sup:[0,0],vat:21,qtxt:'forfait',rent:[0,0],hDiy:0,hPro:0,fix:{diy:[0,0],pro:[d,d],lab:[d,d]}})}return L_}}
{const _bt29=budgetTotals;budgetTotals=function(L_){const T=_bt29(L_);const m=proT()?(+PROID.t.marge||0)/100:0;if(m>0)L_.forEach(x=>{if(x.fix||!x.sup)return;const dlt=[TTC(x.sup[0]*m,21),TTC(x.sup[1]*m,21)];x.pro=add2(x.pro,dlt);T.pro=add2(T.pro,dlt)});return T}}
{const _vs29=v4Sections;v4Sections=function(){const o=_vs29();try{if(!proClient())return o;const i=o.findIndex(s=>s.title==='BUDGET ESTIMATIF');if(i<0)return o;const L_=budgetLines(),T=budgetTotals(L_),mid=a=>Math.round((a[0]+a[1])/2/5)*5,t=PROID.t;
   const rows=L_.map(x=>{const ttc=mid(x.pro),ht=Math.round(ttc/1.21);return[x.t,x.qtxt,nf(ht)+' €',nf(ttc-ht)+' €',nf(ttc)+' €']}),ttc=mid(T.pro),ht=Math.round(ttc/1.21);rows.push(['Total','',nf(ht)+' €',nf(ttc-ht)+' €',nf(ttc)+' €']);
   const cond=[`Prix établi par ${PROID.name||'votre professionnel'} sur base de ${nf(PRICE.rate[2])} €/h HTVA (jardinier)${PRICE.macon?` et ${nf(PRICE.macon[2])} €/h HTVA (maçon ou entrepreneur)`:''}.`,t.valid?`Offre valable ${t.valid} jours à partir du ${new Date().toLocaleDateString('fr-BE')}.`:'',t.acompte?`Acompte de ${t.acompte} % à la commande, soit ${nf(Math.round(ttc*t.acompte/100))} € TVAC.`:'','TVA 21 % sur la main-d’œuvre et les fournitures posées ; un taux réduit (6 %) peut s’appliquer pour certains travaux à une habitation de plus de 10 ans.','Quantités établies sur plan : les prix définitifs seront confirmés après visite du chantier.'].filter(Boolean);
   o[i]={title:'PROPOSITION DE PRIX',intro:`Montant total : ${nf(ht)} € HTVA, soit ${nf(ttc)} € TVAC.`,tables:[{head:['Poste','Quantités','Prix HTVA','TVA','Prix TVAC'],rows,w:[3600,4600,2200,1800,2638]}],bullets:cond,bh:'Conditions'}}catch(e){console.warn(e)}return o}}
{const _rh29=reportHtml;reportHtml=function(R){let h=_rh29(R);if(proClient())h=h.replace(/Je fais moi-même : [^<]*?· /g,'');return h}}

/* --- 4. le jardin dans le temps --- */
const FAST29=/^(Betula|Salix|Alnus|Populus|Metasequoia|Acer (pseudoplatanus|platanoides|rubrum|campestre)|Prunus (avium|padus|cerasifera)|Catalpa|Paulownia|Liriodendron|Sorbus aucuparia)/,SLOW29=/^(Quercus|Fagus|Taxus|Ginkgo|Acer (griseum|palmatum)|Parrotia|Cornus|Magnolia|Davidia|Styrax|Ilex|Cercis|Olea|Pinus)/;
const tauOf=l=>FAST29.test(l)?7:SLOW29.test(l)?18:11,rateOf=l=>FAST29.test(l)?0.8:SLOW29.test(l)?0.35:0.5;
const YRS=[0,1,2,3,5,10,15,20];let YR29=5;
function grow(H,h0,t,tau,rate){return Math.min(H,h0+(H-h0)*(1-Math.exp(-t/tau)),rate?h0+rate*t:1e9)}
function timeRows(y){const R=[];
  S.trees.forEach(t=>{const C=t._ch||tChoose(t),h0=Math.min(C.h,T0H[t.size]||3),h=grow(C.h,h0,y,tauOf(C.p.l),rateOf(C.p.l)),w=C.W*h/C.h;R.push({k:'tree',pts:t.pts[0],n:`${tName(t)} : ${C.name}`,h,w,txt:`${nf(h,1)} m de haut, couronne ${nf(w,1)} m`,pct:h/C.h})});
  S.fruits.forEach((f,i)=>{const fo=fruitForme(f),h=grow(fo.h,Math.min(fo.h,1.8),y,6),w=fo.sp*h/fo.h;R.push({k:'fruit',pts:[f.lat,f.lng],n:`${FRUITS[f.sp].n} ${i+1}`,h,w,txt:y<3?`${nf(h,1)} m, premières fleurs`:y<5?`${nf(h,1)} m, premières récoltes`:`${nf(h,1)} m, en pleine production`,pct:h/fo.h})});
  S.hedges.forEach((hd,i)=>{const H=hd.h||2,h=Math.min(H,0.6+0.45*y);R.push({k:'hedge',n:`Haie ${i+1}`,h,txt:h>=H?`${nf(H,1)} m : hauteur voulue atteinte, taille d’entretien`:`${nf(h,1)} m (objectif ${nf(H,1)} m)`,pct:h/H})});
  if(S.bed){const c=Math.round(100*(1-Math.exp(-y/1.4)));R.push({k:'bed',n:'Massif',txt:y===0?'Plantes espacées, sol paillé':c>=95?'Sol entièrement couvert, divisez les vivaces trop grandes tous les 3 à 5 ans':`${c} % du sol couvert`,pct:c/100})}
  S.lawns.forEach((l,i)=>R.push({k:'lawn',n:`Pelouse ${i+1}`,txt:y===0?'Semis ou placage':y<1?'Première tonte à 8–10 cm':'Gazon dense et praticable',pct:Math.min(1,y)}));
  (S.zones||[]).filter(z=>z.type==='foret'||z.kind==='z_foret'||/for/.test(z.type||'')).forEach((z,i)=>R.push({k:'forest',n:`Micro-forêt ${i+1}`,txt:y<2?'Jeunes plants, désherbage et arrosage':y<4?'La canopée se ferme, plus d’entretien':`Forêt autonome, ≈ ${nf(Math.min(12,1.5+1.1*y),0)} m de haut`,pct:Math.min(1,y/4)}));
  S.ponds.forEach((p,i)=>R.push({k:'pond',n:`Mare ${i+1}`,txt:y<1?'Eau claire, plantes en place':y<3?'Plantes installées, premières libellules et grenouilles':'Écosystème équilibré, curage léger tous les 5 ans',pct:Math.min(1,y/3)}));
  return R}
function timeSvg(y){const G=planGeom();if(!G)return'';const W=G.x1-G.x0,H=G.y1-G.y0,pad=1,X=p=>(p[0]-G.x0).toFixed(2),Y=p=>(G.y1-p[1]).toFixed(2),mp=mPer(G.o[0]),toM=p=>[(p[1]-G.o[1])*mp,(p[0]-G.o[0])*111320];
  let s='';G.items.forEach(i=>{if(i.r)return;const d=i.m.map((p,j)=>(j?'L':'M')+X(p)+' '+Y(p)).join('')+(i.closed?'Z':'');s+=`<path d="${d}" fill="${i.closed&&i.fill?i.col:'none'}" fill-opacity="${i.fill||0}" stroke="${i.col}" stroke-width="${i.closed?0.12:0.25}"/>`});
  const R=timeRows(y);R.filter(r=>r.pts).forEach(r=>{const m=toM(r.pts);s+=`<circle cx="${X(m)}" cy="${Y(m)}" r="${Math.max(0.3,r.w/2).toFixed(2)}" fill="${r.k==='fruit'?'#e57373':'#43a047'}" fill-opacity=".35" stroke="${r.k==='fruit'?'#c62828':'#1b5e20'}" stroke-width=".12"/><circle cx="${X(m)}" cy="${Y(m)}" r=".15" fill="#3e2723"/>`});
  if(S.bed&&S.bed.ll){const c=R.find(r=>r.k==='bed');s+=`<path d="${S.bed.ll.map((p,j)=>(j?'L':'M')+X(toM(p))+' '+Y(toM(p))).join('')}Z" fill="#9c6ade" fill-opacity="${(0.1+0.6*(c?c.pct:0)).toFixed(2)}" stroke="#7b1fa2" stroke-width=".15"/>`}
  S.hedges.forEach(hd=>{const r=R.find(x=>x.k==='hedge');s+=`<path d="${hd.pts.map((p,j)=>(j?'L':'M')+X(toM(p))+' '+Y(toM(p))).join('')}" fill="none" stroke="#2e7d32" stroke-opacity=".75" stroke-width="${Math.max(0.3,Math.min(1.5,0.4+0.15*y)).toFixed(2)}" stroke-linecap="round"/>`});
  return `<svg class="tsvg" viewBox="${-pad} ${-pad} ${(W+2*pad).toFixed(2)} ${(H+2*pad).toFixed(2)}" role="img" aria-label="Plan du jardin dans ${y} ans">${s}</svg>`}
const timeLayer=L.layerGroup?L.layerGroup().addTo(map):null;
function timeMap(y,on){if(!timeLayer)return;timeLayer.clearLayers();if(!on)return;timeRows(y).filter(r=>r.pts&&r.w).forEach(r=>{try{L.circle(r.pts,{radius:r.w/2,color:'#6d4c41',weight:1.5,dashArray:'3 4',fillColor:'#8bc34a',fillOpacity:.2,interactive:false}).addTo(timeLayer)}catch(e){}})}
function renderTime(){const box=$('#timeBox');if(!box)return;if(!(S.trees.length||S.fruits.length||S.hedges.length||S.bed||S.lawns.length||S.ponds.length||(S.zones||[]).length)){box.innerHTML='<div class="card"><p>Dessinez d’abord des arbres, une haie, un massif ou une mare : vous verrez ici comment ils grandissent.</p></div>';timeMap(0,false);return}
  const y=YR29,R=timeRows(y);box.innerHTML=`<div class="card"><div class="tslider"><label for="yrSl"><b>${y===0?'À la plantation':`Dans ${y} an${y>1?'s':''}`}</b></label><input type="range" id="yrSl" min="0" max="${YRS.length-1}" step="1" value="${YRS.indexOf(y)}"><span class="small">${YRS.map(v=>v===0?'0':v).join(' · ')} ans</span></div>
   <div class="tgrid2"><div>${timeSvg(y)}<p class="small muted">Vue de dessus : couronnes des arbres, couverture du massif et épaisseur des haies à cette date.</p></div><table class="stack"><tbody>${R.map(r=>`<tr><td><b>${esc(r.n)}</b></td><td>${esc(r.txt)}</td></tr>`).join('')}</tbody></table></div>
   <div class="chips"><label class="ck"><input type="checkbox" id="yrMap"${timeLayer&&timeLayer.getLayers&&timeLayer.getLayers().length?' checked':''}> Afficher ces couronnes sur la carte</label><button type="button" id="yrSun">Calculer l’ensoleillement à cette date</button></div>
   <p class="small">Croissance moyenne pour un sol et un climat favorables : un arbre pousse plus vite les premières années puis ralentit. Les essences à croissance rapide (bouleau, saule, érables) atteignent la moitié de leur taille en 5 à 7 ans ; les chênes et hêtres en 15 à 20 ans.</p></div>`}
$('#temps').addEventListener('input',e=>{if(e.target.id==='yrSl'){YR29=YRS[+e.target.value];const m=$('#yrMap');const on=m&&m.checked;renderTime();timeMap(YR29,on);const m2=$('#yrMap');if(m2)m2.checked=on}});
$('#temps').addEventListener('change',e=>{if(e.target.id==='yrMap')timeMap(YR29,e.target.checked)});
$('#temps').addEventListener('click',e=>{if(e.target.id==='yrSun'){S.futShade='year';S.futYear=YR29;document.querySelectorAll('[data-fut]').forEach(s=>{if(![...s.options].some(o=>o.value==='year'))s.insertAdjacentHTML('beforeend','<option value="year">Année choisie (« Le jardin dans le temps »)</option>');s.value='year'});S.samples=null;sunUpdate();saveNow(true);showTab('soleil',true);toast(`Ensoleillement calculé avec la taille des arbres dans ${YR29} an(s).`)}});
FUTL.year='Année choisie (« Le jardin dans le temps »)';
{const _ta29=treeAtAge;treeAtAge=function(t){if(S.futShade!=='year')return _ta29(t);const C=t._ch||tChoose(t),h0=Math.min(C.h,T0H[t.size]||3),h=grow(C.h,h0,S.futYear||5,tauOf(C.p.l),rateOf(C.p.l));return{h,w:Math.max(0.6,C.W*h/C.h)}}}
{const _ser29=serialize;serialize=function(){const d=_ser29();d.set.futYear=S.futYear;d.set.water=S.water;return d}}
{const _rs29=restoreSettings;restoreSettings=function(t){_rs29(t);if(t&&t.futShade==='year'){S.futShade='year';S.futYear=+t.futYear||5}if(t&&t.water&&typeof t.water==='object')S.water={...W0,...t.water}}}
{const _at29b=applyTabs;applyTabs=function(sel){_at29b(sel);if(sel.includes('temps'))renderTime();else timeMap(0,false);if(sel.includes('eau'))renderWater()}}
{const _ic29=itemsChanged;itemsChanged=function(a){_ic29(a);if(!$('#temps').classList.contains('tabhide'))renderTime();if(!$('#eau').classList.contains('tabhide'))renderWater()}}
{const _vs29b=v4Sections;v4Sections=function(){const o=_vs29b();try{const R0=timeRows(0);if(R0.length){const ys=[1,5,10,20],rows=R0.map((r,i)=>[r.n,...ys.map(y=>timeRows(y)[i].txt)]);const i=o.findIndex(s=>s.title==='BUDGET ESTIMATIF'||s.title==='PROPOSITION DE PRIX');const sec={title:'LE JARDIN DANS LE TEMPS',intro:'Comment le jardin évolue après la plantation (croissance moyenne, sol et climat favorables).',tables:[{head:['Élément','Dans 1 an','Dans 5 ans','Dans 10 ans','Dans 20 ans'],rows,w:[3000,2950,2950,2950,2988]}]};i>=0?o.splice(i,0,sec):o.push(sec)}}catch(e){console.warn(e)}return o}}

/* --- 5. eau de pluie et besoins d’arrosage --- */
const W0={roof:null,rtype:'tuile',pct:100,lawn:false,pers:0,wc:true,lav:true,tank:false,ttype:'auto'};S.water={...W0,...(S.water||{})};
const RTYP={tuile:['Tuiles ou ardoises',0.9],metal:['Métal (zinc, bac acier)',0.95],plat:['Toit plat (roofing, EPDM)',0.85],grav:['Toit plat lesté de gravier',0.6],vert:['Toiture verte',0.3]};
const TTYP={tonneau:['Tonneaux ou cuve aérienne (300 L à 1 m³)',V=>{const n=Math.max(1,Math.ceil(V/0.3));return[n*60+50,n*150+150]},[0,0],1],pe:['Cuve enterrée en polyéthylène',V=>[400+150*V,700+260*V],[800,2000],0],beton:['Citerne enterrée en béton',V=>[500+120*V,900+210*V],[900,2400],0]};
const ttypeOf=W=>S.water.ttype==='auto'||!S.water.ttype?(W.rec<=1?'tonneau':W.rec<=6?'pe':'beton'):S.water.ttype;
const ETB=[7,13,31,55,85,98,104,85,52,27,10,6],PB=[70,58,62,52,62,72,74,80,66,70,72,80],MOS=['J','F','M','A','M','J','J','A','S','O','N','D'];
function roofArea(){const B=S.shapes.filter(s=>s.kind==='obsPoly'&&(!s.nat||s.nat==='bat'));return Math.round(B.reduce((a,s)=>a+areaLL(s.pts),0))}
function waterCalc(){const w=S.water,cl=S.clim,P=cl&&cl.p&&cl.p.every(v=>v!=null)?cl.p:PB,E=cl&&cl.et0&&cl.et0.every(v=>v!=null)?cl.et0:ETB,roof=(w.roof!=null&&w.roof!==''?+w.roof:roofArea())*(w.pct/100),cf=RTYP[w.rtype][1];
  const els=[];const A=(n,a,kc)=>{if(a>0)els.push([n,a,kc])};if(S.bed&&S.bed.ll)A('Massif',areaLL(S.bed.ll),0.5);S.potagers.forEach((p,i)=>A(`Potager ${i+1}`,areaLL(p.pts),1));S.lawns.forEach((p,i)=>{if(w.lawn)A(`Pelouse ${i+1}`,areaLL(p.pts),0.7)});
S.ponds.forEach((p,i)=>A(`Mare ${i+1} (évaporation)`,areaLL(p.pts),1.05));
  const young=S.trees.length+S.fruits.length+S.hedges.reduce((a,h)=>a+Math.ceil(lenLL(h.pts)*2),0);
  const sup=P.map(p=>roof*cf*p*0.9/1000),gar=P.map((p,m)=>els.reduce((a,[n,ar,kc])=>a+ar*Math.max(0,kc*E[m]-0.75*p)/1000,0)+(m>=4&&m<=8?young*0.04*4.3:0)),dom=P.map((p,m)=>w.pers*((w.wc?25:0)+(w.lav?15:0))*[31,28,31,30,31,30,31,31,30,31,30,31][m]/1000),need=gar.map((g,m)=>g+dom[m]);
  const sim=V=>{let st=V/2,used=0,tot=0;for(let k=0;k<36;k++){const m=k%12;st=Math.min(V,st+sup[m]);const u=Math.min(st,need[m]);st-=u;if(k>=12){used+=u;tot+=need[m]}}return tot?used/tot:1};
  const vols=[0.3,0.6,1,2,3,5,7.5,10,15,20],cov=vols.map(v=>[v,sim(v)]),best=cov[cov.length-1][1],rec=(cov.find(([v,c])=>c>=Math.min(0.95,best-0.03))||cov[cov.length-1])[0];
  return{roof,cf,P,E,sup,gar,dom,need,els,young,cov,rec,recC:cov.find(c=>c[0]===rec)[1],sumS:sup.reduce((a,b)=>a+b,0),sumG:gar.reduce((a,b)=>a+b,0),sumD:dom.reduce((a,b)=>a+b,0),src:cl&&cl.p?'climat 1995–2024 du site (Open-Meteo)':'moyennes belges'}}
function waterChart(W){const mx=Math.max(...W.sup,...W.need,0.01),bw=10,h=90,X=i=>8+i*26;return `<svg class="wchart" viewBox="0 0 320 120" role="img" aria-label="Eau récoltée et besoins par mois">${W.sup.map((v,i)=>`<rect x="${X(i)}" y="${(h-v/mx*h+10).toFixed(1)}" width="${bw}" height="${(v/mx*h).toFixed(1)}" fill="#4f8fc0"/><rect x="${X(i)+bw+1}" y="${(h-W.need[i]/mx*h+10).toFixed(1)}" width="${bw}" height="${(W.need[i]/mx*h).toFixed(1)}" fill="#e3a018"/><text x="${X(i)+bw}" y="114" font-size="8" text-anchor="middle" fill="currentColor">${MOS[i]}</text>`).join('')}</svg><p class="small"><span class="lg" style="background:#4f8fc0"></span> eau récoltée <span class="lg" style="background:#e3a018"></span> besoins (m³ par mois)</p>`}
function renderWater(){const box=$('#waterBox');if(!box)return;const w=S.water,W=waterCalc(),ra=roofArea(),tk=ttypeOf(W),T=TTYP[tk],tc=T[1](Math.max(0.3,W.rec)),reg=regionKey()||'';
  box.innerHTML=`<div class="card"><div class="frow"><label>Toiture raccordée (m² au sol)<input type="number" min="0" step="1" data-w="roof" value="${w.roof!=null&&w.roof!==''?w.roof:''}" placeholder="${ra?ra+' (bâtiments dessinés)':'à indiquer'}"></label><label>Part raccordée (%)<input type="number" min="0" max="100" step="5" data-w="pct" value="${w.pct}"></label><label>Type de toit<select data-w="rtype">${Object.entries(RTYP).map(([k,v])=>`<option value="${k}"${w.rtype===k?' selected':''}>${v[0]}</option>`).join('')}</select></label><label>Personnes dans la maison (toilettes, lessive)<input type="number" min="0" max="12" step="1" data-w="pers" value="${w.pers}"></label></div>
   <div class="chips"><label class="ck"><input type="checkbox" data-w="lawn"${w.lawn?' checked':''}> Arroser la pelouse l’été</label><label class="ck"><input type="checkbox" data-w="wc"${w.wc?' checked':''}> Toilettes à l’eau de pluie</label><label class="ck"><input type="checkbox" data-w="lav"${w.lav?' checked':''}> Lessive à l’eau de pluie</label></div></div>
   <div class="grid2 btot"><div class="card"><h4>Eau récoltée</h4><p class="big">${nf(W.sumS,1)} m³ par an</p><p class="small">${nf(W.roof,0)} m² de toit × ${nf(W.P.reduce((a,b)=>a+b,0),0)} mm de pluie × ${nf(W.cf,2)} (${esc(RTYP[w.rtype][0].toLowerCase())}) × 0,9 (filtre)</p></div>
   <div class="card"><h4>Besoins</h4><p class="big">${nf(W.sumG+W.sumD,1)} m³ par an</p><p class="small">Jardin : ${nf(W.sumG,1)} m³ (surtout de mai à août)${W.sumD?` · maison : ${nf(W.sumD,1)} m³`:''}</p></div></div>
   <div class="card"><h4>Citerne conseillée : ${W.rec<1?nf(W.rec*1000,0)+' L':nf(W.rec,1)+' m³'}</h4><p>Elle couvre environ <b>${Math.round(W.recC*100)} %</b> des besoins. ${W.recC<0.7?'Le toit ne récolte pas assez pour tout couvrir : réduisez l’arrosage (paillage, plantes sobres) ou raccordez une plus grande surface.':'Au-delà, une plus grande citerne n’apporte presque rien.'}</p>${waterChart(W)}
   <table class="stack small"><thead><tr><th>Volume</th>${W.cov.map(c=>`<th>${c[0]<1?nf(c[0]*1000,0)+' L':nf(c[0],1)+' m³'}</th>`).join('')}</tr></thead><tbody><tr><td>Besoins couverts</td>${W.cov.map(c=>`<td${c[0]===W.rec?' class="hl"':''}>${Math.round(c[1]*100)} %</td>`).join('')}</tr></tbody></table>
   <p class="small muted">Calcul mois par mois sur ${esc(W.src)}. Besoins du jardin : évapotranspiration moins 75 % de la pluie, selon les surfaces dessinées${W.young?` ; ${W.young} jeune(s) arbre(s) ou plant(s) de haie arrosés 40 L par semaine les deux premiers étés`:''}.</p></div>
   <div class="card"><h4>Réalisation</h4><div class="frow"><label>Type de stockage<select data-w="ttype"><option value="auto"${w.ttype==='auto'?' selected':''}>Conseillé : ${esc(T[0].toLowerCase())}</option>${Object.entries(TTYP).map(([k,v])=>`<option value="${k}"${w.ttype===k?' selected':''}>${v[0]}</option>`).join('')}</select></label><label class="ck"><input type="checkbox" data-w="tank"${w.tank?' checked':''}> L’ajouter au budget</label></div>
   <ul class="small"><li>Prix indicatifs pour ${W.rec<1?nf(W.rec*1000,0)+' L':nf(W.rec,1)+' m³'} : ${esc(T[0].toLowerCase())}, fourniture ${nf(Math.round(tc[0]/10)*10)} à ${nf(Math.round(tc[1]/10)*10)} €${T[2][1]?`, terrassement et pose ${nf(T[2][0])} à ${nf(T[2][1])} €, pompe 200 à 600 €, filtre 100 à 300 €`:', robinet et collecteur de gouttière compris'}.</li>
   <li>Trop-plein : dirigez-le vers un jardin de pluie, une noue ou un puits d’infiltration plutôt qu’à l’égout.</li><li>Une citerne est souvent imposée pour les constructions neuves ou les grosses rénovations${reg==='bxl'?' (Bruxelles : en général 33 L par m² de toiture)':reg==='vla'?' (Flandre : règlement sur les eaux pluviales)':''} : vérifiez auprès de votre commune, qui accorde parfois une prime.</li><li>L’eau de pluie n’est pas potable : réseau séparé et clairement identifié, sans raccordement à l’eau de ville.</li></ul></div>`}
$('#eau').addEventListener('change',e=>{const k=e.target.dataset.w;if(!k)return;const v=e.target.type==='checkbox'?e.target.checked:e.target.type==='number'?(e.target.value===''?null:Math.max(0,+e.target.value)):e.target.value;S.water[k]=k==='pct'?Math.min(100,v??100):k==='pers'?(v||0):v;renderWater();try{renderBudget()}catch(err){}saveNow(true)});
{const _bl29b=budgetLines;budgetLines=function(){const L_=_bl29b();if(S.water&&S.water.tank){const W=waterCalc(),tk=ttypeOf(W),T=TTYP[tk],V=Math.max(0.3,W.rec),c=T[1](V),sup=T[3]?c:[c[0]+300,c[1]+900],pose=T[2];
  L_.push({k:'eau',t:'Récupération de l’eau de pluie',sup,vat:21,qtxt:`${T[0]} : ${V<1?nf(V*1000,0)+' L':nf(V,1)+' m³'}${T[3]?'':', pompe et filtre'}`,rent:[0,0],hDiy:T[3]?2:24,hPro:T[3]?1:12,fix:pose[1]?{diy:[TTC(sup[0],21)+TTC(pose[0]*0.6,21),TTC(sup[1],21)+TTC(pose[1]*0.6,21)],pro:[TTC(sup[0],21)+TTC(pose[0],21),TTC(sup[1],21)+TTC(pose[1],21)],lab:[TTC(pose[0],21),TTC(pose[1],21)]}:undefined})}return L_}}
WANTS.push(['eau','Récupérer l’eau de pluie','Citerne dimensionnée selon le toit et l’arrosage',null]);{const o=ENVQ[0].o;o.push(['eau','Récupérer l’eau de pluie'])}ENVKW.want.eau=['citerne','eau de pluie','récupérer l’eau','récupération','regenwater','tank'];
{const _ss29=stepSecs;stepSecs=function(n){const s=_ss29(n);if(n===4){if((wantOn('eau')||(S.water&&S.water.tank))&&!s.includes('eau'))s.splice(Math.max(0,s.indexOf('arrosage')>=0?s.indexOf('arrosage'):s.length),0,'eau');if((S.trees.length+S.fruits.length+S.hedges.length>0||S.bed)&&!s.includes('temps'))s.push('temps')}return s}}
{const _vs29c=v4Sections;v4Sections=function(){const o=_vs29c();try{if(wantOn('eau')||S.water.tank){const W=waterCalc(),i=o.findIndex(s=>s.title==='BUDGET ESTIMATIF'||s.title==='PROPOSITION DE PRIX');const sec={title:'EAU DE PLUIE ET ARROSAGE',intro:`Toit raccordé : ${nf(W.roof,0)} m². Eau récoltée : ${nf(W.sumS,1)} m³ par an. Besoins : ${nf(W.sumG+W.sumD,1)} m³ par an. Citerne conseillée : ${W.rec<1?nf(W.rec*1000,0)+' L':nf(W.rec,1)+' m³'}, qui couvre environ ${Math.round(W.recC*100)} % des besoins.`,tables:[{head:['Mois',...MOS],rows:[['Récolté (m³)',...W.sup.map(v=>nf(v,1))],['Besoins (m³)',...W.need.map(v=>nf(v,1))]],w:[2238,...MOS.map(()=>1050)]}],bullets:['Trop-plein vers un jardin de pluie, une noue ou un puits d’infiltration.','Eau non potable : réseau séparé, sans raccordement à l’eau de ville.','Citerne souvent imposée pour les constructions neuves ; primes communales possibles.'],bh:'À savoir'};i>=0?o.splice(i,0,sec):o.push(sec)}}catch(e){console.warn(e)}return o}}
/* proposition de pelouse : le plus grand rectangle libre */
function lawnProp(R){const D=propDomain();if(!D)return null;const o=D[0],mp=mPer(o[0]),X=p=>[(p[1]-o[1])*mp,(p[0]-o[0])*111320],LL=([x,y])=>[o[0]+y/111320,o[1]+x/mp],Dm=D.map(X),xs=Dm.map(p=>p[0]),ys=Dm.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),nx=Math.min(140,Math.ceil(Math.max(...xs)-x0)),ny=Math.min(140,Math.ceil(Math.max(...ys)-y0));
  const occ=[...S.shapes.filter(s=>s.kind==='obsPoly').map(s=>s.pts),...R.props.filter(p=>p.pts.length>2).map(p=>p.pts),...(S.bed&&S.bed.ll?[S.bed.ll]:[]),...S.lawns.map(l=>l.pts),...S.potagers.map(l=>l.pts),...S.ponds.map(l=>l.pts),...(S.amen||[]).map(a=>a.pts),...(S.paths||[]).map(a=>a.pts)];
  const pts=[...S.obs.map(o=>[[o.lat,o.lng],(o.w||3)/2]),...S.trees.map(t=>[t.pts[0],((t._ch&&t._ch.W)||6)/2]),...R.props.filter(p=>p.k==='tree').map(p=>[p.pts[0],3])];
  const free=[];for(let j=0;j<ny;j++){free.push([]);for(let i=0;i<nx;i++){const c=LL([x0+i+0.5,y0+j+0.5]);let f=inPolyLL(c,D)&&!occ.some(P=>inPolyLL(c,P)||distPtPoly(c,P)<0.7)&&!pts.some(([q,r])=>llDist(c,q)<r+0.3);free[j].push(f?1:0)}}
  let best={a:0};const h=new Array(nx).fill(0);for(let j=0;j<ny;j++){for(let i=0;i<nx;i++)h[i]=free[j][i]?h[i]+1:0;const st=[];for(let i=0;i<=nx;i++){const cur=i<nx?h[i]:0;let start=i;while(st.length&&st[st.length-1][1]>=cur){const [si,sh]=st.pop();const a=sh*(i-si);if(a>best.a&&sh>=3&&i-si>=3)best={a,i0:si,i1:i,j1:j+1,j0:j+1-sh};start=si}st.push([start,cur])}}
  if(best.a<20)return null;const q=[[best.i0,best.j0],[best.i1,best.j0],[best.i1,best.j1],[best.i0,best.j1]].map(([i,j])=>LL([x0+i,y0+j]));return{k:'lawn',w:'pelouse',lab:'Pelouse',pts:q,why:`${nf(best.a,0)} m² d’un seul tenant, la plus grande surface libre`}}
{const _pl29=proposeLayout;proposeLayout=function(){const R=_pl29();try{if(R&&R.props&&wantOn('pelouse')&&!S.lawns.length&&!R.props.some(p=>p.k==='lawn')){const p=lawnProp(R);if(p)R.props.push(p)}}catch(e){console.warn(e)}return R}}
window.__p29={grpVis,TG:()=>TG,expOpen,expRun,waterCalc:()=>{const W=waterCalc();return{roof:W.roof,sumS:W.sumS,sumG:W.sumG,rec:W.rec,recC:W.recC,cov:W.cov}},timeRows:y=>timeRows(y).map(r=>r.n+': '+r.txt),proTApply};

/* ================= v30 : protection des projets (alerte, grande mémoire, sauvegarde, restauration), mentions légales et confidentialité, accord pour les photos ================= */
/* --- 1. grande mémoire du navigateur (IndexedDB) quand la mémoire habituelle est pleine --- */
const LS30=(()=>{try{return window.localStorage}catch(e){return null}})();
const BIGK=k=>/^plantania:(p|plan):/.test(k);
const IDBC=new Map(),STO={idb:null,ok:false,warn:{},persist:null};
const idbReq=(mode,f)=>new Promise((ok,ko)=>{if(!STO.idb)return ko(new Error('IndexedDB indisponible'));try{const t=STO.idb.transaction('kv',mode),r=f(t.objectStore('kv'));t.oncomplete=()=>ok(r&&r.result);t.onerror=t.onabort=()=>ko(t.error||new Error('IndexedDB'))}catch(e){ko(e)}});
if(LS30){const P=Storage.prototype,_set=P.setItem,_get=P.getItem,_rm=P.removeItem;
  P.setItem=function(k,v){if(this!==LS30||!BIGK(k))return _set.call(this,k,v);
    try{_set.call(this,k,v);if(IDBC.has(k)){IDBC.delete(k);idbReq('readwrite',s=>s.delete(k)).catch(()=>{})}}
    catch(e){if(!STO.ok)throw e;try{_rm.call(this,k)}catch(_){}IDBC.set(k,String(v));idbReq('readwrite',s=>s.put(String(v),k)).catch(()=>stoAlert('fail'));stoAlert('over')}};
  P.getItem=function(k){const v=_get.call(this,k);return v==null&&this===LS30&&IDBC.has(k)?IDBC.get(k):v};
  P.removeItem=function(k){_rm.call(this,k);if(this===LS30&&IDBC.has(k)){IDBC.delete(k);idbReq('readwrite',s=>s.delete(k)).catch(()=>{})}}}
(async()=>{try{if(!window.indexedDB)return;STO.idb=await new Promise((ok,ko)=>{const r=indexedDB.open('plantania',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)});
  const ks=await idbReq('readonly',s=>s.getAllKeys()),vs=await idbReq('readonly',s=>s.getAll());(ks||[]).forEach((k,i)=>IDBC.set(k,vs[i]));STO.ok=true;
  let id=null;try{id=LS30&&LS30.getItem('plantania:current')}catch(e){}
  if(id&&((PRJ.id!==id&&IDBC.has('plantania:p:'+id))||(PRJ.id===id&&!PLANIMG&&IDBC.has('plantania:plan:'+id))))projBoot();
}catch(e){console.warn('IndexedDB',e);STO.ok=false}})();
function stoSize(){let a=0,b=0;try{for(let i=0;i<LS30.length;i++){const k=LS30.key(i);a+=k.length+(Storage.prototype.getItem.call(LS30,k)||'').length}}catch(e){}IDBC.forEach(v=>{b+=String(v).length});return{ls:a,idb:b}}
const mo=n=>nf(n/1e6,n<1e5?2:1)+' Mo';

/* --- 2. alertes visibles --- */
{const bn=$('#banner');(bn||$('header')).insertAdjacentHTML('afterend','<div class="stobar" id="stoBar" role="alert" hidden><span id="stoTxt"></span><span class="chips"><button type="button" class="pri" data-sto="bk">💾 Télécharger une sauvegarde</button><button type="button" data-sto="pj">Mes projets</button><button type="button" class="tx" data-sto="x" aria-label="Masquer">×</button></span></div>')}
const STOMSG={fail:'⚠️ Votre projet n’a pas pu être enregistré : la mémoire du navigateur est pleine. Téléchargez une sauvegarde maintenant, puis supprimez d’anciens projets ou des plans importés.',
  near:'La mémoire du navigateur est presque pleine. Téléchargez une sauvegarde et supprimez les projets dont vous n’avez plus besoin.',
  nostore:'⚠️ Ce navigateur n’enregistre pas vos projets (navigation privée ou stockage bloqué). Téléchargez votre projet avant de fermer la page.',
  remind:''};
function stoAlert(k,txt){if(k==='over'){if(!STO.warn.over){STO.warn.over=1;toast('La mémoire habituelle du navigateur est pleine : ce projet est maintenant gardé dans sa grande mémoire. Pensez à télécharger une sauvegarde.')}return}
  const b=$('#stoBar');if(!b)return;if(STO.warn[k]==='x')return;STO.warn[k]=1;b.dataset.k=k;b.classList.toggle('info',k==='remind'||k==='near');$('#stoTxt').textContent=txt||STOMSG[k];b.hidden=false;
  if(k==='fail'){const s=$('#saveState');if(s)s.classList.add('bad');if(!STO.warn.failT){STO.warn.failT=1;toast(STOMSG.fail)}}}
$('#stoBar').addEventListener('click',e=>{const t=e.target.closest('[data-sto]');if(!t)return;const b=$('#stoBar'),k=b.dataset.k;
  if(t.dataset.sto==='bk'){backupAll();if(k!=='fail')b.hidden=true}
  if(t.dataset.sto==='pj'){try{renderProjDlg();$('#projDlg').showModal()}catch(err){}}
  if(t.dataset.sto==='x'){b.hidden=true;STO.warn[k]='x';if(k==='remind')try{localStorage.setItem('plantania:bkSnooze',String(Date.now()+3*864e5))}catch(err){}}});
{const _sn30=saveNow;let lastChk=0;saveNow=function(f){_sn30(f);const s=$('#saveState');if(!s)return;
  if(/impossible/i.test(s.textContent))stoAlert('fail');else if(/Enregistr/.test(s.textContent)){s.classList.remove('bad');if(STO.warn.fail===1){STO.warn.fail=0;const b=$('#stoBar');if(b&&b.dataset.k==='fail')b.hidden=true}
    if(STO.persist==null&&navigator.storage&&navigator.storage.persist){STO.persist='?';navigator.storage.persisted().then(p=>p||navigator.storage.persist()).then(p=>{STO.persist=!!p}).catch(()=>{STO.persist=false})}
    if(Date.now()-lastChk>30000){lastChk=Date.now();if(stoSize().ls>4.2e6)stoAlert('near')}}}}
try{LS30.setItem('plantania:test','1');LS30.removeItem('plantania:test')}catch(e){setTimeout(()=>stoAlert('nostore'),1200)}

/* --- 3. sauvegarde et restauration de tous les projets --- */
const BKSKIP=/^plantania:(ai|test|tuto|welcome|tg|wiz|tabs|site|current|lastBackup|bkSnooze|consent:photos)$/;
function backupData(){const items={};try{for(let i=0;i<LS30.length;i++){const k=LS30.key(i);if(k&&k.startsWith('plantania:')&&!BKSKIP.test(k))items[k]=LS30.getItem(k)}}catch(e){}IDBC.forEach((v,k)=>{if(!(k in items))items[k]=v});
  return{app:'Plantañ.ia',kind:'sauvegarde',v:1,date:new Date().toISOString(),items}}
function backupAll(){try{saveNow(true)}catch(e){}const d=backupData(),n=Object.keys(d.items).filter(k=>k.startsWith('plantania:p:')).length;
  download(new Blob([JSON.stringify(d)],{type:'application/json'}),`plantania-sauvegarde-${new Date().toISOString().slice(0,10)}.json`);
  try{localStorage.setItem('plantania:lastBackup',String(Date.now()))}catch(e){}const b=$('#stoBar');if(b&&b.dataset.k==='remind')b.hidden=true;
  toast(`Sauvegarde téléchargée : ${n} projet${n>1?'s':''}, vos réglages, votre identité professionnelle et vos clients. Gardez ce fichier en lieu sûr (clé USB, cloud…).`);try{renderProjDlg()}catch(e){}}
function restoreBackup(file){const fr=new FileReader();fr.onload=()=>{let d;try{d=JSON.parse(fr.result)}catch(e){toast('Ce fichier n’est pas une sauvegarde Plantañ.ia');return}
  if(d&&d.v===1&&d.draw){importProject(file);return}
  if(!d||d.kind!=='sauvegarde'||!d.items){toast('Ce fichier n’est pas une sauvegarde Plantañ.ia');return}
  const it=d.items,cur=pIdx();let bix={};try{bix=JSON.parse(it['plantania:projects']||'{}')}catch(e){}let n=0,same=0,reopen=false;
  try{saveNow(true)}catch(e){}
  Object.entries(bix).forEach(([id,m])=>{const pk='plantania:p:'+id;if(!it[pk])return;if(cur[id]&&(cur[id].updated||0)>=(m.updated||0)){same++;return}
    try{localStorage.setItem(pk,it[pk]);if(it['plantania:plan:'+id])localStorage.setItem('plantania:plan:'+id,it['plantania:plan:'+id]);cur[id]={...m};n++;if(id===PRJ.id)reopen=true}catch(e){}});
  pSetIdx(cur);
  Object.entries(it).forEach(([k,v])=>{if(BIGK(k)||k==='plantania:projects'||BKSKIP.test(k))return;try{
    if(k==='plantania:clients'){const a=JSON.parse(localStorage.getItem(k)||'[]'),b=JSON.parse(v||'[]'),key=c=>c.id||c.name;b.forEach(c=>{if(!a.some(x=>key(x)===key(c)))a.push(c)});localStorage.setItem(k,JSON.stringify(a));CLIENTS.length=0;a.forEach(c=>CLIENTS.push(c))}
    else if(localStorage.getItem(k)==null)localStorage.setItem(k,v)}catch(e){}});
  if(reopen){try{restoreState(JSON.parse(localStorage.getItem('plantania:p:'+PRJ.id)));lastSaved=JSON.stringify({...serialize(),saved:0})}catch(e){}}
  else if(n&&(!PRJ.id||S.lat==null||!(S.trees.length||S.shapes.length||S.plots.length||S.obs.length||S.bed||S.hedges.length||S.lawns.length))){const ids=Object.keys(bix).filter(i=>cur[i]&&it['plantania:p:'+i]).sort((a,b)=>cur[b].updated-cur[a].updated);if(ids[0])openProject(ids[0])}
  try{renderProjDlg()}catch(e){}toast(n?`${n} projet${n>1?'s':''} restauré${n>1?'s':''}${same?` ; ${same} déjà à jour dans ce navigateur`:''}.`:same?'Tous les projets de cette sauvegarde sont déjà à jour dans ce navigateur.':'Aucun projet dans cette sauvegarde.')};fr.readAsText(file)}
document.body.insertAdjacentHTML('beforeend','<input type="file" id="bkFile" accept=".json,application/json" hidden>');
$('#bkFile').addEventListener('change',e=>{const f=e.target.files[0];if(f)restoreBackup(f);e.target.value=''});
/* rappel */
setTimeout(()=>{try{const ix=pIdx(),ids=Object.keys(ix);if(!ids.length)return;const lb=+localStorage.getItem('plantania:lastBackup')||0,sn=+localStorage.getItem('plantania:bkSnooze')||0,now=Date.now();if(sn>now)return;
  const newest=Math.max(...ids.map(i=>ix[i].updated||0)),oldest=Math.min(...ids.map(i=>ix[i].updated||now));if(newest<=lb)return;const ref=lb||oldest;if(now-ref<7*864e5)return;
  const j=Math.floor((now-lb)/864e5);stoAlert('remind',lb?`💾 Dernière sauvegarde de vos projets il y a ${j} jours. Vos projets ne sont gardés que dans ce navigateur : téléchargez une sauvegarde de temps en temps.`:'💾 Vos projets ne sont gardés que dans ce navigateur : un nettoyage ou un changement d’appareil peut les effacer. Téléchargez une sauvegarde de temps en temps.')}catch(e){}},8000);
/* dans « Mes projets » */
{const pl=$('#projList');if(pl)pl.insertAdjacentHTML('afterend','<div class="stoinfo" id="stoInfo"></div><div class="chips"><button type="button" id="pBackup">💾 Sauvegarder tous mes projets</button><button type="button" id="pRestore">📂 Restaurer une sauvegarde</button></div>')}
$('#projDlg').addEventListener('click',e=>{if(e.target.id==='pBackup')backupAll();if(e.target.id==='pRestore')$('#bkFile').click()});
{const _rpd30=renderProjDlg;renderProjDlg=function(){_rpd30();const el=$('#stoInfo');if(!el)return;const z=stoSize(),lb=(()=>{try{return +localStorage.getItem('plantania:lastBackup')||0}catch(e){return 0}})(),pct=Math.min(100,Math.round(z.ls/5e6*100));
  el.innerHTML=`<div class="stogauge" title="Mémoire habituelle du navigateur"><span style="width:${pct}%" class="${pct>84?'hi':''}"></span></div><p class="small">Mémoire utilisée : <b>${mo(z.ls)}</b> sur environ 5 Mo${z.idb?` · grande mémoire : ${mo(z.idb)}`:''} · dernière sauvegarde : <b>${lb?new Date(lb).toLocaleDateString('fr-BE'):'jamais'}</b>${STO.persist===true?' · protégés contre l’effacement automatique':''}.</p>
   <p class="small muted">Vos projets restent dans ce navigateur, sur cet appareil. Ils peuvent disparaître si vous effacez les données de navigation, en navigation privée, ou sur iPhone et Mac (Safari) après plusieurs semaines sans visite : gardez une sauvegarde.</p>`}}
{const ml=$('#menuList');if(ml){const r=$('#resetAll');r.insertAdjacentHTML('beforebegin','<button type="button" id="mBackup">💾 Sauvegarder tous mes projets</button><button type="button" id="mRestore">📂 Restaurer une sauvegarde</button><button type="button" id="mLegal">⚖️ Mentions légales</button><button type="button" id="mPriv">🔒 Confidentialité</button>')}}
document.addEventListener('click',e=>{const id=e.target.id,map30={mBackup:()=>backupAll(),mRestore:()=>$('#bkFile').click(),mLegal:()=>legOpen('mentions'),mPriv:()=>legOpen('confidentialite')};if(!map30[id])return;$('#menuList').hidden=true;$('#menuBtn').setAttribute('aria-expanded','false');map30[id]()});

/* --- 4. accord avant l’envoi d’une photo --- */
let PHSESSION=false;
const photoOK=()=>{if(PHSESSION)return true;try{return !!localStorage.getItem('plantania:consent:photos')}catch(e){return false}};
function isPhotoReq(url,init){if(/my-api\.plantnet\.org/.test(url))return true;const b=init&&init.body;if(!b)return false;
  if(typeof b==='string')return b.length>1500&&/data:image\/|"type"\s*:\s*"image"|"media_type"\s*:\s*"image|"image_url"|"input_image"/.test(b);
  if(typeof FormData!=='undefined'&&b instanceof FormData){for(const [,v] of b.entries())if(v instanceof Blob&&/^image\//.test(v.type||'image/'))return true}return false}
function askPhotoConsent(){return new Promise(ok=>{let d=$('#phDlg');if(!d){document.body.insertAdjacentHTML('beforeend',`<dialog class="dlg phdlg" id="phDlg" aria-labelledby="phT"><h3 id="phT">Envoyer votre photo ?</h3>
   <p>Pour reconnaître une plante, une maladie ou un sol, proposer des idées ou réaliser un rendu, la photo est envoyée à un service extérieur :</p>
   <ul class="small"><li><b>Pl@ntNet</b> (France) : reconnaissance des plantes et des maladies ;</li><li><b>Claude</b> (Anthropic, États-Unis), par notre relais : idées, diagnostic, assistant ;</li><li><b>OpenAI</b> (États-Unis), par notre relais : rendus réalistes sur photo.</li></ul>
   <p class="small">Plantañ.ia ne garde pas vos photos. Évitez d’y montrer des personnes, des visages ou des plaques d’immatriculation. Détails dans <a href="#confidentialite">Confidentialité</a>.</p>
   <label class="ck"><input type="checkbox" id="phRem" checked> Ne plus me le demander sur cet appareil</label>
   <div class="chips"><button type="button" data-ph="0">Annuler</button><button type="button" class="pri" data-ph="1">Accepter et envoyer</button></div></dialog>`);d=$('#phDlg')}
  const fin=v=>{d.removeEventListener('click',h);d.removeEventListener('cancel',c);if(d.open)d.close();if(v){if($('#phRem').checked){try{localStorage.setItem('plantania:consent:photos',new Date().toISOString())}catch(e){}}PHSESSION=true}ok(v)};
  const h=e=>{const b=e.target.closest('[data-ph]');if(b)fin(b.dataset.ph==='1');if(e.target.closest('a[href="#confidentialite"]'))fin(false)},c=e=>{e.preventDefault();fin(false)};
  d.addEventListener('click',h);d.addEventListener('cancel',c);if(d.showModal)d.showModal();else d.setAttribute('open','')})}
{const _f30=window.fetch;window.fetch=async function(input,init){let url='';try{url=typeof input==='string'?input:(input&&input.url)||String(input)}catch(e){}
  if(!photoOK()&&isPhotoReq(url,init)){const ok=await askPhotoConsent();if(!ok)throw new Error('Envoi de la photo annulé : votre accord est nécessaire.')}return _f30.call(window,input,init)}}

/* --- 5. mentions légales et politique de confidentialité --- */
const ED=typeof EDITEUR==='object'&&EDITEUR?EDITEUR:{};
const edv=(k,lab)=>ED[k]?esc(ED[k]):`<span class="edtodo">${lab||'à compléter'}</span>`;
const edMissing=()=>['nom','adresse','email'].filter(k=>!ED[k]);
const LEGDATE='25 novembre 2026';
function legHtml(which){const miss=edMissing().length?`<p class="legwarn">Informations à compléter par l’éditeur du site (bloc <code>EDITEUR</code> dans <code>js/app-2-modules.js</code>).</p>`:'';
  const mail=ED.email?`<a href="mailto:${esc(ED.email)}">${esc(ED.email)}</a>`:edv('email');
  if(which==='mentions')return `${miss}<h4>Éditeur du site</h4><table class="legt"><tbody>
   <tr><th>Nom ou dénomination</th><td>${edv('nom')}</td></tr><tr><th>Statut</th><td>${edv('statut','personne physique, entreprise individuelle ou société (forme juridique)')}</td></tr>
   <tr><th>Adresse</th><td>${edv('adresse')}</td></tr><tr><th>E-mail</th><td>${mail}</td></tr>${ED.telephone?`<tr><th>Téléphone</th><td>${esc(ED.telephone)}</td></tr>`:''}
   <tr><th>Numéro d’entreprise (BCE)</th><td>${edv('bce','à compléter si vous êtes inscrit à la Banque-Carrefour des Entreprises')}</td></tr>${ED.tva?`<tr><th>Numéro de TVA</th><td>${esc(ED.tva)}</td></tr>`:''}
   <tr><th>Responsable de la publication</th><td>${ED.responsable?esc(ED.responsable):ED.nom?esc(ED.nom):edv('responsable')}</td></tr></tbody></table>
   <h4>Hébergement</h4><p>Site hébergé par GitHub Pages : GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis. Le relais vers les services d’intelligence artificielle fonctionne sur Cloudflare Workers (Cloudflare, Inc., États-Unis).</p>
   <h4>Nature des informations</h4><p>Plantañ.ia fournit des estimations et des conseils indicatifs (climat, sol, ensoleillement, choix des plantes, quantités, budgets, règles régionales). Ils ne remplacent ni l’avis d’un professionnel, ni un relevé de géomètre, ni les règles et autorisations de votre commune et de votre région. Le plan cadastral n’a pas valeur de bornage. Les données publiques utilisées peuvent être incomplètes ou dépassées : vérifiez-les avant de commencer des travaux.</p>
   <h4>Propriété intellectuelle</h4><p>Les textes, le logo et le code du site appartiennent à l’éditeur, sauf mention contraire. Les données et photos de tiers restent la propriété de leurs auteurs et sont utilisées selon leurs licences (voir « Sources de données » en bas de la page ; photos : auteur et licence indiqués sous chaque photo).</p>
   <h4>Droit applicable</h4><p>Ces mentions sont régies par le droit belge.</p><p class="small muted">Mise à jour : ${LEGDATE}.</p>`;
  const R=[['Recherche d’adresse','le texte de l’adresse','Nominatim (OpenStreetMap), Photon (Komoot, Allemagne), Open-Meteo (Suisse)'],
   ['Climat','les coordonnées du terrain','Open-Meteo (Suisse)'],
   ['Sol, cadastre, contraintes du site','les coordonnées du terrain','Service public de Wallonie, Digitaal Vlaanderen, SPF Finances, Agence européenne pour l’environnement, ISRIC (Pays-Bas)'],
   ['Bâtiments (projet express)','les coordonnées du terrain','Overpass API (OpenStreetMap)'],
   ['Fonds de carte','la zone affichée','Esri (États-Unis), CARTO, OpenStreetMap, Institut géographique national, services régionaux'],
   ['Photos des plantes','le nom de la plante','iNaturalist (États-Unis), Wikipédia / Wikimedia, wsrv.nl'],
   ['Reconnaissance des plantes et maladies','<b>vos photos</b>','Pl@ntNet (France)'],
   ['Assistant, idées par photos, recherches, rendus','vos questions, la description du projet, la commune ou la position, <b>les photos que vous choisissez d’envoyer</b>','Claude (Anthropic, États-Unis) et OpenAI (États-Unis), par notre relais Cloudflare'],
   ['Carte des professionnels','le type de recherche et la commune','Google Maps (États-Unis), seulement si vous l’affichez'],
   ['Polices et bibliothèques','aucune donnée de projet','Google Fonts (États-Unis), unpkg et jsDelivr'],
   ['Avis sur le site','votre message et, si vous la donnez, votre adresse e-mail',FEEDBACK&&FEEDBACK.endpoint?'le service de formulaire de l’éditeur':'votre messagerie (aucun envoi automatique)']];
  const ph=photoOK();
  return `${miss}<h4>En bref</h4><ul><li>Pas de compte, pas de publicité, pas de mesure d’audience, pas de cookie.</li><li>Vos projets, vos réglages et, pour les professionnels, vos coordonnées et votre carnet de clients sont enregistrés <b>uniquement dans votre navigateur</b>, sur votre appareil. L’éditeur n’y a pas accès.</li><li>Certaines fonctions envoient des informations à des services extérieurs, seulement quand vous les utilisez (tableau ci-dessous). Les photos ne partent qu’avec votre accord.</li></ul>
   <h4>Responsable du traitement</h4><p>${edv('nom')}, ${edv('adresse')} — ${mail}</p>
   <h4>Ce qui est envoyé, et à qui</h4><table class="legt"><thead><tr><th>Fonction</th><th>Information envoyée</th><th>Service</th></tr></thead><tbody>${R.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>
   <p class="small">Comme pour tout site, ces services reçoivent aussi votre adresse IP. Ils traitent les données selon leur propre politique de confidentialité. Certains sont situés aux États-Unis : ces transferts s’appuient sur les garanties prévues par le RGPD (cadre de protection des données UE–États-Unis ou clauses contractuelles types, selon le service).</p>
   <h4>Le relais</h4><p>Le relais transmet vos demandes aux services d’intelligence artificielle sans en garder le contenu. Il retient votre adresse IP en mémoire pendant au plus 24 heures, uniquement pour limiter le nombre de demandes. Cloudflare peut tenir des journaux techniques selon sa propre politique.</p>
   <h4>Photos</h4><p>Une photo n’est envoyée que lorsque vous lancez une reconnaissance, une idée ou un rendu, et après votre accord (demandé la première fois). Plantañ.ia ne la conserve pas. Évitez d’y montrer des personnes ou des informations privées.</p>
   <h4>Bases légales</h4><p>Votre demande (fournir la fonction que vous utilisez, article 6.1.b du RGPD), votre consentement pour l’envoi de photos (article 6.1.a), et l’intérêt légitime de protéger le relais contre les abus (article 6.1.f).</p>
   <h4>Durée de conservation</h4><p>Les données restent dans votre navigateur jusqu’à ce que vous les supprimiez (« Mes projets », « Remettre à zéro », bouton ci-dessous, ou effacement des données du site dans votre navigateur).</p>
   <h4>Professionnels</h4><p>Si vous enregistrez des clients, vous êtes responsable du traitement de leurs données : informez-les et ne gardez que le nécessaire. Ces données ne quittent pas votre navigateur, sauf dans les rapports et fichiers que vous exportez.</p>
   <h4>Vos droits</h4><p>Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, l’opposition et la portabilité de vos données (la sauvegarde téléchargeable contient toutes les données gardées par le site), et retirer à tout moment votre accord pour les photos : écrivez à ${mail}. Vous pouvez aussi introduire une plainte auprès de l’Autorité de protection des données, rue de la Presse 35, 1000 Bruxelles, +32 2 274 48 00, <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener">autoriteprotectiondonnees.be</a>.</p>
   <h4>Cookies et stockage</h4><p>Le site n’utilise pas de cookies. Il utilise le stockage du navigateur (localStorage et IndexedDB) uniquement pour garder vos projets et vos préférences, ce qui est nécessaire à son fonctionnement. La carte Google Maps des professionnels, si vous l’affichez, peut déposer des cookies de Google.</p>
   <div class="chips legact"><button type="button" data-lg="ph"${ph?'':' disabled'}>${ph?'Retirer mon accord pour les photos':'Aucun accord donné pour les photos'}</button><button type="button" data-lg="bk">💾 Télécharger toutes mes données</button><button type="button" class="danger" data-lg="del">Supprimer toutes mes données de ce navigateur</button></div>
   <p class="small muted">Mise à jour : ${LEGDATE}.</p>`}
function legOpen(which){let d=$('#legDlg');if(!d){document.body.insertAdjacentHTML('beforeend','<dialog class="dlg legdlg" id="legDlg" aria-labelledby="legT"><div class="leghead"><h3 id="legT"></h3><button type="button" class="welx" data-lg="x" aria-label="Fermer">×</button></div><div class="chips legtabs"><button type="button" data-lgt="mentions">Mentions légales</button><button type="button" data-lgt="confidentialite">Confidentialité</button></div><div id="legBody" class="legbody"></div></dialog>');d=$('#legDlg');
    d.addEventListener('click',e=>{const t=e.target.closest('[data-lg],[data-lgt]');if(!t)return;if(t.dataset.lgt){legOpen(t.dataset.lgt);return}const k=t.dataset.lg;
      if(k==='x')d.close();if(k==='bk')backupAll();
      if(k==='ph'){try{localStorage.removeItem('plantania:consent:photos')}catch(err){}PHSESSION=false;legOpen('confidentialite');toast('Accord retiré : il vous sera redemandé avant le prochain envoi de photo.')}
      if(k==='del'){if(t.dataset.c!=='1'){t.dataset.c='1';t.textContent='Confirmer : tout supprimer (projets, réglages, clients)';return}
        try{Object.keys(LS30).filter(x=>x.startsWith('plantania:')).forEach(x=>Storage.prototype.removeItem.call(LS30,x))}catch(err){}IDBC.clear();try{if(STO.idb)STO.idb.close();indexedDB.deleteDatabase('plantania')}catch(err){}window.__pboot=false;location.hash='';location.reload()}});
    d.addEventListener('close',()=>{if(/^#(mentions-legales|confidentialite)$/.test(location.hash))history.replaceState(null,'',location.pathname+location.search)})}
  $('#legT').textContent=which==='mentions'?'Mentions légales':'Confidentialité';d.querySelectorAll('[data-lgt]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lgt===which)));$('#legBody').innerHTML=legHtml(which);$('#legBody').scrollTop=0;if(!d.open){if(d.showModal)d.showModal();else d.setAttribute('open','')}}
const legHash=()=>{const h=location.hash;if(h==='#mentions-legales')legOpen('mentions');else if(h==='#confidentialite')legOpen('confidentialite')};
addEventListener('hashchange',legHash);setTimeout(legHash,300);
document.addEventListener('click',e=>{const a=e.target.closest('a[href="#mentions-legales"],a[href="#confidentialite"]');if(!a)return;e.preventDefault();legOpen(a.getAttribute('href')==='#mentions-legales'?'mentions':'confidentialite')});
{const f=document.querySelector('footer.foot .in');if(f)f.insertAdjacentHTML('beforeend',`<p class="leglinks"><a href="#mentions-legales">Mentions légales</a> · <a href="#confidentialite">Confidentialité</a> · <a href="#" id="fBackup">Sauvegarder mes projets</a>${ED.nom?` · © ${new Date().getFullYear()} ${esc(ED.nom)}`:''}</p>`);document.addEventListener('click',e=>{if(e.target.id==='fBackup'){e.preventDefault();backupAll()}})}
window.__p30={backupData,backupAll,restoreBackup,stoSize,stoAlert,isPhotoReq,photoOK,legOpen,STO,IDBC};

/* ================= v31 : créer / modifier / tout changer, devenir de l’existant, détection automatique de l’existant ================= */
/* identifiants stables des obstacles ponctuels (les retraits y font référence) */
{const _sd31=snapDrawings;snapDrawings=function(){const d=_sd31();(d.obs||[]).forEach((o,i)=>{if(S.obs[i])o.oid=S.obs[i].id});return d}}
{const _rd31=restoreDrawings;restoreDrawings=function(d){_rd31(d);(d&&d.obs||[]).forEach((o,i)=>{if(S.obs[i]&&o.oid!=null)S.obs[i].id=o.oid});obsId=Math.max(obsId,0,...S.obs.map(o=>+o.id||0))}}

function distPtLine(q,P){if(P.length<2)return P.length?llDist(q,P[0]):1e9;const mp=mPer(q[0]),T=p=>[(p[1]-q[1])*mp,(p[0]-q[0])*111320];let d=1e9;for(let i=0;i<P.length-1;i++){const a=T(P[i]),b=T(P[i+1]),vx=b[0]-a[0],vy=b[1]-a[1],L2=vx*vx+vy*vy,t=L2?Math.max(0,Math.min(1,-(a[0]*vx+a[1]*vy)/L2)):0;d=Math.min(d,Math.hypot(a[0]+vx*t,a[1]+vy*t))}return d}
/* --- 1. type de projet --- */
S.pmode=S.pmode||'';
const PM={create:['🌱','Créer sur un terrain libre','Je garde ce qui existe et j’ajoute de nouveaux aménagements.'],modify:['✏️','Modifier mon jardin','Pour chaque élément existant : garder, transformer (taille, forme, revêtement) ou retirer.'],redo:['🔄','Tout changer','Tout l’existant est retiré, sauf les bâtiments et les arbres que vous gardez, puis on recrée.']};
const isBld=(k,it)=>(k==='obs'&&it.type==='bat')||(k==='shapes'&&it.nat==='bat');
const isTreeO=(k,it)=>k==='obs'&&(it.type==='caduc'||it.type==='pers');
function exList(){const L_=[];S.obs.forEach((o,i)=>L_.push({k:'obs',it:o,id:String(o.id),n:obsName(o,i),ic:o.type==='bat'?'🏠':o.type==='haie'?'🌿':o.type==='arbu'?'🌳':'🌳',m:`${nf(o.h,1)} m de haut`}));
  S.shapes.forEach(s=>{const line=s.kind==='obsLine';L_.push({k:'shapes',it:s,id:String(s.id),n:s.name||SHNAT[s.nat]||'Élément',ic:s.nat==='bat'?'🏠':s.nat==='mur'?'🧱':s.nat==='cloture'||s.nat==='palissade'?'🚧':s.nat==='viv'?'🌸':'🌿',m:line?`${nf(lenLL(s.pts),1)} m`:`${nf(areaLL(s.pts))} m²`})});
  (S.paths||[]).filter(p=>p.nat!=='pasjap').forEach(p=>L_.push({k:'paths',it:p,id:String(p.id),n:p.label||PATHN[p.nat]||'Chemin',ic:p.nat==='terrasse'?'🪵':p.nat==='parking'?'🚗':'🛤️',m:`${nf(areaLL(p.pts))} m²`}));return L_}
const demoOf=(k,id)=>(S.demo||[]).find(d=>d.ref&&d.ref.k===k&&String(d.ref.id)===String(id));
function fateOf(k,it){return it.tf?'mod':demoOf(k,it.id)?'del':'keep'}
function tfTarget(k,it){if(k==='paths')return it.nat==='terrasse'?{tool:'a_terrasse',kk:'amen',lab:'une nouvelle terrasse (taille, forme, revêtement)'}:{tool:'a_allee',kk:'amen',lab:'une nouvelle allée'};
  if(k==='shapes'){if(it.kind==='obsPoly'&&(it.nat==='viv'||it.nat==='arbu'))return{tool:'bed',kk:'bed',lab:'un nouveau massif (forme, plantes)'};if(it.kind==='obsLine'&&(it.nat==='haie'||it.nat==='caduc'))return{tool:'hedge',kk:'hedges',lab:'une nouvelle haie',demo:1};if(it.kind==='obsLine'&&(it.nat==='cloture'||it.nat==='palissade'))return{tool:'fence',kk:'fences',lab:'une nouvelle clôture',demo:1}}
  return null}
function demoSilent(k,id){if(demoOf(k,id))return;const it=(S[k]||[]).find(x=>String(x.id)===String(id));if(!it)return;const type=demoTypeFor(k,it),geo=k==='obs'?'pt':(k==='shapes'&&it.kind==='obsLine')?'line':'area',pts=k==='obs'?[[it.lat,it.lng]]:it.pts.map(p=>p.slice());
  S.demo.push({id:++itemId,side:DT[type].side,type,geo,pts,raw:pts.map(p=>p.slice()),ref:{k,id:String(id)},opts:dDef(type,it)})}
function undoTf(it){if(!it.tf)return;const t=it.tf;delete it.tf;try{if(t.k==='bed'){if(S.bed)delItem('bed',0)}else{const L_=S[t.k]||[],i=L_.findIndex(x=>String(x.id)===String(t.id));if(i>=0)L_.splice(i,1)}}catch(e){}}
function exFate(k,id,f){const it=(S[k]||[]).find(x=>String(x.id)===String(id));if(!it)return;pushUndo();const pu=pushUndo;pushUndo=()=>{};
  try{const d=demoOf(k,id);
    if(f==='keep'){undoTf(it);if(d)S.demo.splice(S.demo.indexOf(d),1)}
    else if(f==='del'){undoTf(it);demoSilent(k,id)}
    else if(f==='mod'){const T=tfTarget(k,it);if(!T)return;if(T.kk==='bed'&&S.bed&&!(it.tf&&it.tf.k==='bed')){toast('Votre projet a déjà un massif : supprimez-le d’abord, ou transformez ce massif plus tard.');return}
      if(d)S.demo.splice(S.demo.indexOf(d),1);undoTf(it);if(curPhase()!=='create'){S.phase='create';applyPhase()}
      const W_=TOOLWANT[T.tool];if(W_)setWant(W_,true);setMode(T.tool);S.drawPts=it.pts.map(p=>p.slice());const before=new Set((S[T.kk]||[]).map(x=>String(x.id)));finishShape();
      let nid=null;if(T.kk==='bed'){if(S.bed)nid=0}else{const n=(S[T.kk]||[]).find(x=>!before.has(String(x.id)));if(n){nid=n.id;if(T.kk==='amen'&&k==='paths'&&n.opts)n.opts.base='old'}}
      if(nid==null){toast('Transformation impossible pour cet élément.');return}it.tf={k:T.kk,id:String(nid)};if(T.demo)demoSilent(k,id);
      setTimeout(()=>{try{openEditor(T.kk,nid)}catch(e){}toast(`Transformé en ${T.lab} : modifiez sa forme sur la carte et ses réglages ci-dessous.`)},50)}
  }finally{pushUndo=pu}
  S.samples=null;try{renderDemo()}catch(e){}itemsChanged(false);try{renderFonc()}catch(e){}sunUpdate();saveNow(true);renderFate()}
function redoAll(trees){pushUndo();const pu=pushUndo;pushUndo=()=>{};let n=0;try{exList().forEach(x=>{if(isBld(x.k,x.it))return;if(isTreeO(x.k,x.it)&&!trees)return;if(fateOf(x.k,x.it)!=='keep')return;demoSilent(x.k,x.id);n++})}finally{pushUndo=pu}
  S.samples=null;try{renderDemo()}catch(e){}itemsChanged(false);sunUpdate();saveNow(true);renderFate();return n}
function setPmode(m){const was=S.pmode;S.pmode=m;renderPm();renderFate();saveNow(true);const ex=exList();
  if(m==='redo'&&was!=='redo'){const n=redoAll(false);toast(n?`${n} élément(s) existant(s) à retirer (bâtiments et arbres gardés). Réglez-les dans « Que devient l’existant ? ».`:'Rien à retirer pour l’instant : dessinez ou détectez l’existant.')}
  if((m==='modify'||m==='redo')&&!ex.filter(x=>!isBld(x.k,x.it)).length&&S.lat!=null)setTimeout(()=>detOpen(true),200)}
function pmHtml(){return `<div class="pmhead"><b>Votre projet</b><span class="small">Que voulez-vous faire sur ce terrain ?</span></div><div class="pmopts" role="radiogroup" aria-label="Type de projet">${Object.entries(PM).map(([k,[i,t,d]])=>`<button type="button" role="radio" data-pm="${k}" aria-checked="${S.pmode===k}" class="${S.pmode===k?'on':''}"><span class="pmi">${i}</span><span><b>${t}</b><small>${d}</small></span></button>`).join('')}</div>`}
function renderPm(){const c=$('#pmCard');if(c)c.innerHTML=pmHtml()}
{const pb=$('#phaseBar');if(pb){pb.insertAdjacentHTML('beforebegin','<div class="pmcard" id="pmCard"></div>');{const ip=$('#itemsPanel');(ip||pb).insertAdjacentHTML(ip?'beforebegin':'afterend','<div class="detcard" id="detCard" hidden></div><div class="fatecard" id="fateCard" hidden></div>')}
  pb.insertAdjacentHTML('beforeend','<button type="button" class="detbtn" id="detBtn" title="Bâtiments, arbres, haies, clôtures et massifs repérés sur les cartes officielles, OpenStreetMap et le relief mesuré par avion">🔎 Détecter l’existant</button>')}}
renderPm();
document.addEventListener('click',e=>{const b=e.target.closest('[data-pm]');if(b&&b.closest('#pmCard'))setPmode(b.dataset.pm);if(e.target.closest('#detBtn'))detOpen(false)});
function renderFate(){const c=$('#fateCard');if(!c)return;const L_=exList();if(!(S.pmode==='modify'||S.pmode==='redo')){c.hidden=true;return}c.hidden=false;
  if(!L_.length){c.innerHTML=`<h4>Que devient l’existant ?</h4><p class="small">Aucun élément existant n’est encore dessiné. <button type="button" class="exlink" data-det="1">🔎 Détecter l’existant automatiquement</button> ou dessinez-le dans « 1. L’existant ».</p>`;return}
  const cnt={keep:0,mod:0,del:0};L_.forEach(x=>cnt[fateOf(x.k,x.it)]++);const trees=L_.filter(x=>isTreeO(x.k,x.it)),treesKept=trees.filter(x=>fateOf(x.k,x.it)!=='del').length;
  c.innerHTML=`<div class="fhead"><h4>Que devient l’existant ?</h4><span class="small">${cnt.keep} gardé${cnt.keep>1?'s':''} · ${cnt.mod} transformé${cnt.mod>1?'s':''} · ${cnt.del} retiré${cnt.del>1?'s':''}</span></div>
   <ul class="fatelist">${L_.map(x=>{const f=fateOf(x.k,x.it),T=tfTarget(x.k,x.it),b=isBld(x.k,x.it);return `<li class="f-${f}"><button type="button" class="fname" data-fz="${x.k}" data-fi="${x.id}"><span class="fi">${x.ic}</span><span><b>${esc(x.n)}</b><small>${esc(x.m)}${f==='mod'?' · transformé':f==='del'?(b?' · à démolir':' · à retirer'):''}</small></span></button>
     <span class="fseg" role="group" aria-label="Devenir de ${esc(x.n)}"><button type="button" data-ff="keep" data-fk="${x.k}" data-fi="${x.id}" aria-pressed="${f==='keep'}">Garder</button>${T?`<button type="button" data-ff="mod" data-fk="${x.k}" data-fi="${x.id}" aria-pressed="${f==='mod'}" title="Le remplacer par ${esc(T.lab)}">Transformer</button>`:''}<button type="button" data-ff="del" data-fk="${x.k}" data-fi="${x.id}" aria-pressed="${f==='del'}">${b?'Démolir':isTreeO(x.k,x.it)?'Abattre':'Retirer'}</button></span></li>`}).join('')}</ul>
   <div class="chips">${S.pmode==='redo'&&treesKept?`<button type="button" data-redotrees="1">Retirer aussi les ${treesKept} arbre${treesKept>1?'s':''}</button>`:''}<button type="button" class="exlink" data-det="1">🔎 Détecter d’autres éléments</button></div>
   <p class="small muted">« Transformer » remplace l’élément par un nouvel aménagement à la même place, que vous pouvez agrandir, redessiner ou changer de revêtement ; la terrasse actuelle sert de base si vous gardez sa fondation. Les retraits et démolitions sont chiffrés dans l’onglet « Démolition ».</p>`}
document.addEventListener('click',e=>{const t=e.target.closest('[data-ff],[data-fz],[data-redotrees],[data-det]');if(!t||!t.closest('#fateCard'))return;
  if(t.dataset.det){detOpen(false);return}
  if(t.dataset.redotrees){const n=redoAll(true);toast(`${n} élément(s) ajouté(s) aux retraits.`);return}
  if(t.dataset.ff){exFate(t.dataset.fk,t.dataset.fi,t.dataset.ff);return}
  if(t.dataset.fz){const it=(S[t.dataset.fz]||[]).find(x=>String(x.id)===t.dataset.fi);if(!it)return;const c=t.dataset.fz==='obs'?[it.lat,it.lng]:cen(it.pts);try{map.setView(c,Math.max(map.getZoom(),20))}catch(err){}}});
{const _ic31=itemsChanged;itemsChanged=function(a){_ic31(a);renderFate()}}
{const _ap31=applyPhase;applyPhase=function(){_ap31();renderFate();const d=$('#detBtn');if(d)d.hidden=curPhase()!=='exist'&&S.pmode!=='modify'&&S.pmode!=='redo'}}
{const _ser31=serialize;serialize=function(){const d=_ser31();d.set.pmode=S.pmode;return d}}
{const _rs31=restoreSettings;restoreSettings=function(t){_rs31(t);S.pmode=t&&t.pmode||'';renderPm();renderFate()}}

/* --- 2. détection automatique de l’existant --- */
const PICC='https://geoservices.wallonie.be/arcgis/rest/services/TOPOGRAPHIE/PICC_VDIFF/MapServer';
const MNS='https://geoservices.wallonie.be/arcgis/rest/services/RELIEF/WALLONIE_MNS_2021_2022/MapServer',MNT='https://geoservices.wallonie.be/arcgis/rest/services/RELIEF/WALLONIE_MNT_2021_2022/MapServer';
const DCAT={bat:['🏠','Bâtiment'],tree:['🌳','Arbre'],hedge:['🌿','Haie'],shrub:['🌳','Massif arbustif'],fence:['🚧','Clôture ou mur'],path:['🛤️','Allée ou accès']};
const DOPT={bat:[['Maison','Maison'],['Annexe','Annexe'],['Garage','Garage'],['Abri de jardin','Abri de jardin'],['Bâtiment voisin','Bâtiment voisin']],tree:[['caduc','Arbre caduc'],['pers','Arbre persistant (conifère…)'],['arbu','Grand arbuste']],
  hedge:[['haie','Haie persistante'],['caduc','Haie caduque']],shrub:[['arbu','Massif arbustif'],['viv','Massif de vivaces']],fence:[['cloture','Clôture ajourée'],['palissade','Palissade pleine'],['mur','Mur ou muret']],path:[['chemin','Chemin ou allée'],['parking','Accès ou parking'],['terrasse','Terrasse']]};
let DET={list:[],busy:false,src:[],log:[]};const detLayer=L.layerGroup().addTo(map);
const tmo=(ms)=>{const c=new AbortController();return[c,setTimeout(()=>c.abort(),ms)]};
async function getJ(u,ms,opt){const [c,t]=tmo(ms||15000);try{const r=await fetch(u,{...(opt||{}),signal:c.signal});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(j&&j.error)throw new Error(j.error.message||'erreur');return j}finally{clearTimeout(t)}}
const bbStr=bb=>`${bb[1]},${bb[0]},${bb[3]},${bb[2]}`;
async function piccQ(id,bb,f){const j=await getJ(`${PICC}/${id}/query?geometry=${bbStr(bb)}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=${f||'NATUR_DESC'}&returnGeometry=true&outSR=4326&f=json`);return j.features||[]}
async function grbQ(bb){const j=await getJ(`https://geo.api.vlaanderen.be/GRB/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=GRB:GBG&outputFormat=application/json&srsName=EPSG:4326&bbox=${bb[0]},${bb[1]},${bb[2]},${bb[3]},urn:ogc:def:crs:EPSG::4326`);
  const fix=c=>c[0]>40?[c[0],c[1]]:[c[1],c[0]];return(j.features||[]).filter(f=>f.geometry).map(f=>{const g=f.geometry,ring=g.type==='Polygon'?g.coordinates[0]:g.type==='MultiPolygon'?g.coordinates[0][0]:null;return ring?{pts:ring.slice(0,-1).map(fix),lbl:(f.properties||{}).LBLTYPE||''}:null}).filter(Boolean)}
async function osmQ(bb){const b=`${bb[0]},${bb[1]},${bb[2]},${bb[3]}`,q=`[out:json][timeout:25];(way["building"](${b});node["natural"="tree"](${b});way["natural"="tree_row"](${b});way["barrier"~"^(hedge|fence|wall)$"](${b});way["highway"~"^(footway|path|service|track)$"](${b}););out geom 400;`;
  for(const u of['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']){try{const j=await getJ(u,25000,{method:'POST',body:'data='+encodeURIComponent(q),headers:{'content-type':'application/x-www-form-urlencoded'}});return j.elements||[]}catch(e){}}throw new Error('OpenStreetMap indisponible')}
async function pix(base,lat,lon){const d=0.0005,j=await getJ(`${base}/identify?geometry=${lon.toFixed(7)},${lat.toFixed(7)}&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=0&mapExtent=${(lon-d).toFixed(6)},${(lat-d).toFixed(6)},${(lon+d).toFixed(6)},${(lat+d).toFixed(6)}&imageDisplay=100,100,96&returnGeometry=false&f=json`,12000);
  const r=(j.results||[])[0];if(!r)return NaN;const a=r.attributes||{},k=Object.keys(a).find(x=>/pixel value/i.test(x));const v=k?parseFloat(String(a[k]).replace(',','.')):NaN;return isFinite(v)?v:NaN}
async function pool(fs,n,onp){const out=new Array(fs.length);let i=0,done=0;await Promise.all(Array.from({length:Math.min(n,fs.length)},async()=>{while(i<fs.length){const k=i++;try{out[k]=await fs[k]()}catch(e){out[k]=NaN}done++;if(onp)onp(done,fs.length)}}));return out}
function hull(P){const p=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(p.length<3)return p;const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}for(const q of p.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}return lo.slice(0,-1).concat(up.slice(0,-1))}
function plane(pts){const n=pts.length;if(n<3)return()=>pts.length?pts.reduce((a,p)=>a+p[2],0)/n:0;let S_=[[0,0,0],[0,0,0],[0,0,0]],b=[0,0,0];pts.forEach(([x,y,z])=>{const v=[1,x,y];for(let i=0;i<3;i++){b[i]+=v[i]*z;for(let j=0;j<3;j++)S_[i][j]+=v[i]*v[j]}});
  const M=S_.map((r,i)=>[...r,b[i]]);for(let i=0;i<3;i++){let mx=i;for(let r=i+1;r<3;r++)if(Math.abs(M[r][i])>Math.abs(M[mx][i]))mx=r;[M[i],M[mx]]=[M[mx],M[i]];if(Math.abs(M[i][i])<1e-9){const m=pts.reduce((a,p)=>a+p[2],0)/n;return()=>m}for(let r=0;r<3;r++)if(r!==i){const f=M[r][i]/M[i][i];for(let c=i;c<4;c++)M[r][c]-=f*M[i][c]}}const c=M.map((r,i)=>r[3]/r[i]);return(x,y)=>c[0]+c[1]*x+c[2]*y}
async function detRun(prog){const D=propDomain();if(!D)throw new Error('Placez d’abord le terrain : la limite de la parcelle est nécessaire.');
  const o=cen(D),mp=mPer(o[0]),X=p=>[(p[1]-o[1])*mp,(p[0]-o[0])*111320],LL=([x,y])=>[o[0]+y/111320,o[1]+x/mp],DX=D.map(X),inD=p=>inPolyLL(p,D),dD=p=>inD(p)?0:distPtPoly(p,D);
  const xs=DX.map(p=>p[0]),ys=DX.map(p=>p[1]),pad=15,bb=[o[0]+(Math.min(...ys)-pad)/111320,o[1]+(Math.min(...xs)-pad)/mp,o[0]+(Math.max(...ys)+pad)/111320,o[1]+(Math.max(...xs)+pad)/mp];
  const reg=regionKey(),C=[],src=new Set(),log=[];const P=(k,s,t)=>prog&&prog(k,s,t);
  /* sources vectorielles */
  P('vec','run','Cartes officielles et OpenStreetMap…');
  const jobs=[];if(reg!=='vla'&&reg!=='bxl')jobs.push(Promise.all([piccQ(11,bb,'NATUR_DESC'),piccQ(14,bb),piccQ(15,bb),piccQ(5,bb)]).then(r=>({k:'picc',r})).catch(e=>({k:'picc',e})));
  if(reg!=='wal'&&reg!=='bxl')jobs.push(grbQ(bb).then(r=>({k:'grb',r})).catch(e=>({k:'grb',e})));jobs.push(osmQ(bb).then(r=>({k:'osm',r})).catch(e=>({k:'osm',e})));
  const R=await Promise.all(jobs),get=k=>R.find(x=>x.k===k);
  const bld=[];const addB=(pts,lbl,s)=>{if(pts.length<3)return;const c=cen(pts);if(bld.some(b=>inPolyLL(c,b.pts)||inPolyLL(cen(b.pts),pts)))return;bld.push({pts,lbl,src:s})};
  const pc=get('picc');if(pc&&pc.r){src.add('PICC (Service public de Wallonie)');const [B,T,H,F]=pc.r;
    B.forEach(f=>{const rg=f.geometry&&f.geometry.rings&&f.geometry.rings[0];if(rg)addB(rg.slice(0,-1).map(([x,y])=>[y,x]),(f.attributes||{}).NATUR_DESC||'','PICC')});
    T.forEach(f=>{const g=f.geometry;if(g&&g.x!=null)C.push({cat:'tree',pt:[g.y,g.x],src:'PICC',conf:'sûr'})});
    H.forEach(f=>{const n=(f.attributes||{}).NATUR_DESC||'',p=f.geometry&&f.geometry.paths&&f.geometry.paths[0];if(!p)return;const pts=p.map(([x,y])=>[y,x]);if(/haie/i.test(n))C.push({cat:'hedge',pts,src:'PICC',conf:'sûr'});else if(/rang/i.test(n))C.push({cat:'row',pts,src:'PICC',conf:'sûr'})});
    F.forEach(f=>{const n=(f.attributes||{}).NATUR_DESC||'',p=f.geometry&&f.geometry.paths&&f.geometry.paths[0];if(!p)return;const nat=/cl[oô]ture/i.test(n)?'cloture':/palissade/i.test(n)?'palissade':/muret/i.test(n)?'mur':null;if(nat)C.push({cat:'fence',pts:p.map(([x,y])=>[y,x]),nat,src:'PICC',conf:'sûr'})})}
  else if(pc&&pc.e)log.push('PICC indisponible');
  const gr=get('grb');if(gr&&gr.r){src.add('GRB (Digitaal Vlaanderen)');gr.r.forEach(b=>addB(b.pts,/bij/i.test(b.lbl)?'Annexe':'Habitation','GRB'))}else if(gr&&gr.e)log.push('GRB indisponible');
  const os=get('osm');if(os&&os.r){src.add('OpenStreetMap');os.r.forEach(e=>{const t=e.tags||{};const pts=e.geometry?e.geometry.map(g=>[g.lat,g.lon]):null;
      if(e.type==='way'&&t.building&&pts&&pts.length>3)addB(pts.slice(0,-1),t.building==='garage'||t.building==='garages'?'Garage':t.building==='shed'||t.building==='hut'?'Abri':t.building==='greenhouse'?'Serre':t.building==='carport'?'Carport':'',`OSM`);
      else if(e.type==='node'&&t.natural==='tree')C.push({cat:'tree',pt:[e.lat,e.lon],src:'OSM',conf:'probable',pers:t.leaf_type==='needleleaved'||t.leaf_cycle==='evergreen'});
      else if(pts&&t.natural==='tree_row')C.push({cat:'row',pts,src:'OSM',conf:'probable'});
      else if(pts&&t.barrier==='hedge')C.push({cat:'hedge',pts,src:'OSM',conf:'probable'});
      else if(pts&&(t.barrier==='fence'||t.barrier==='wall'))C.push({cat:'fence',pts,nat:t.barrier==='wall'?'mur':/wood|board|panel/.test(t.fence_type||'')?'palissade':'cloture',src:'OSM',conf:'probable'});
      else if(pts&&t.highway)C.push({cat:'path',pts,w:t.highway==='service'||t.highway==='track'?3:1.2,src:'OSM',conf:'probable'})})}
  else if(os&&os.e)log.push('OpenStreetMap indisponible');
  P('vec',src.size?'ok':'warn',src.size?[...src].join(', '):'Aucune carte disponible');
  /* relief mesuré par avion (Wallonie) */
  let grid=null,ground=null;const bPolys=[...bld.map(b=>b.pts),...S.shapes.filter(s=>s.kind==='obsPoly'&&s.nat==='bat').map(s=>s.pts)];
  if(reg!=='vla'&&reg!=='bxl'){P('lidar','run','Relief mesuré par avion : premier point…');
    const z0=await pix(MNS,o[0],o[1]).catch(()=>NaN);
    if(isFinite(z0)){src.add('Relief LiDAR 2021-2022 (Service public de Wallonie)');
      const area=Math.abs(polyArea(DX)),s=Math.max(1.5,Math.sqrt(area/170)),pts=[];const x0=Math.min(...xs)-4,x1=Math.max(...xs)+4,y0=Math.min(...ys)-4,y1=Math.max(...ys)+4;
      for(let y=y0+s/2,j=0;y<y1;y+=s,j++)for(let x=x0+s/2,i=0;x<x1;x+=s,i++){const ll=LL([x,y]);if(dD(ll)>4)continue;if(bPolys.some(b=>inPolyLL(ll,b)||distPtPoly(ll,b)<0.6))continue;pts.push({i,j,x,y,ll})}
      const gp=[];for(const fx of[0.1,0.5,0.9])for(const fy of[0.1,0.5,0.9])gp.push([x0+(x1-x0)*fx,y0+(y1-y0)*fy]);
      const tot=pts.length+gp.length;let done=0;const tick=()=>{done++;if(done%8===0)P('lidar','run',`Relief mesuré par avion : ${done} / ${tot} points…`)};
      const gz=await pool(gp.map(p=>()=>pix(MNT,...LL(p)).finally(tick)),8);const gpts=gp.map((p,k)=>[p[0],p[1],gz[k]]).filter(p=>isFinite(p[2]));ground=plane(gpts);
      const zs=await pool(pts.map(p=>()=>pix(MNS,p.ll[0],p.ll[1]).finally(tick)),8);pts.forEach((p,k)=>{p.h=isFinite(zs[k])&&gpts.length?zs[k]-ground(p.x,p.y):NaN});
      grid={s,pts,idx:new Map(pts.map(p=>[p.i+','+p.j,p]))};P('lidar','ok',`${pts.filter(p=>isFinite(p.h)).length} points mesurés (maille ${nf(s,1)} m)`)}
    else P('lidar','warn','Relief indisponible : hauteurs estimées')}
  else P('lidar','skip','Relief détaillé : seulement en Wallonie pour l’instant');
  const hNear=(ll,r)=>{if(!grid)return NaN;const [x,y]=X(ll);let m=NaN;grid.pts.forEach(p=>{if(isFinite(p.h)&&Math.hypot(p.x-x,p.y-y)<=r&&!(p.h<=m))m=p.h});return m};
  /* arbres du relief : maxima locaux */
  const used=new Set();const lt=[];
  if(grid){const nb=p=>{const r=[];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const q=grid.idx.get((p.i+a)+','+(p.j+b));if(q)r.push(q)}return r};
    grid.pts.filter(p=>p.h>4.5&&nb(p).every(q=>!(q.h>p.h))).sort((a,b)=>b.h-a.h).forEach(p=>{if(lt.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<3.2))return;lt.push({x:p.x,y:p.y,h:p.h,cells:[]})});
    grid.pts.filter(p=>p.h>Math.max(2.5,0)).forEach(p=>{let best=null,bd=1e9;lt.forEach(t=>{const d=Math.hypot(t.x-p.x,t.y-p.y);if(d<bd&&d<8&&p.h>t.h*0.35){bd=d;best=t}});if(best){best.cells.push(p);used.add(p)}});
    lt.forEach(t=>{const r=Math.max(grid.s/2,Math.sqrt(t.cells.length*grid.s*grid.s/Math.PI));t.w=Math.min(18,Math.max(2,2*r));t.ll=LL([t.x,t.y])})}
  /* arbres des cartes + fusion */
  const trees=[];C.filter(c=>c.cat==='row').forEach(c=>{const Lr=lenLL(c.pts),n=Math.max(1,Math.round(Lr/6));for(let k=0;k<=n;k++){const f=n?k/n:0.5;let acc=0,tgt=f*Lr;for(let q=0;q<c.pts.length-1;q++){const sg=llDist(c.pts[q],c.pts[q+1]);if(acc+sg>=tgt||q===c.pts.length-2){const u=sg?(tgt-acc)/sg:0;trees.push({pt:[c.pts[q][0]+(c.pts[q+1][0]-c.pts[q][0])*u,c.pts[q][1]+(c.pts[q+1][1]-c.pts[q][1])*u],src:c.src,conf:c.conf});break}acc+=sg}}});
  C.filter(c=>c.cat==='tree').sort((a,b)=>(a.src==='PICC'?0:1)-(b.src==='PICC'?0:1)).forEach(c=>{if(!trees.some(t=>llDist(t.pt,c.pt)<3))trees.push(c)});
  trees.forEach(t=>{const [x,y]=X(t.pt);const m=lt.find(l=>!l.used&&Math.hypot(l.x-x,l.y-y)<3.5);if(m){m.used=1;t.h=m.h;t.w=m.w}else{const h=hNear(t.pt,2.5);t.h=isFinite(h)&&h>2?h:null}});
  lt.filter(l=>!l.used).forEach(l=>trees.push({pt:l.ll,h:l.h,w:l.w,src:'LiDAR',conf:'probable'}));
  const out=[];let nT=0,nV=0;
  trees.forEach(t=>{const d=dD(t.pt);if(d>6)return;if(S.obs.some(o=>o.type!=='bat'&&llDist([o.lat,o.lng],t.pt)<3))return;const nb=d>0.5;const h=t.h||(nb?10:8),w=t.w||Math.max(3,Math.min(12,h*0.6));if(nb&&h<6)return;
    out.push({cat:'tree',pt:t.pt,h,w,type:t.pers?'pers':'caduc',name:nb?`Arbre voisin ${++nV}`:`Arbre ${++nT}`,src:t.src,conf:t.conf,on:true})});
  /* bâtiments */
  const inB=bld.map(b=>{const c=cen(b.pts),fr=b.pts.filter(inD).length/b.pts.length;return{...b,c,a:areaLL(b.pts),inside:inD(c)||fr>=0.5,d:Math.min(...b.pts.map(dD))}}).filter(b=>b.inside||b.d<6).filter(b=>!S.shapes.some(s=>s.kind==='obsPoly'&&s.nat==='bat'&&(inPolyLL(b.c,s.pts)||inPolyLL(cen(s.pts),b.pts))));
  const mainB=inB.filter(b=>b.inside&&!/annexe|garage|abri|serre|carport/i.test(b.lbl)).sort((a,b)=>b.a-a.a)[0];
  if(grid||ground){P('lidar','run','Hauteur des bâtiments…');await pool(inB.map(b=>async()=>{const c=X(b.c),zz=await Promise.all([b.c,...b.pts.slice(0,4).map(p=>[b.c[0]+(p[0]-b.c[0])*0.55,b.c[1]+(p[1]-b.c[1])*0.55])].map(p=>pix(MNS,p[0],p[1]).catch(()=>NaN)));const z=Math.max(...zz.filter(isFinite));if(isFinite(z)&&ground){const h=z-ground(c[0],c[1]);if(h>1.8&&h<40)b.h=h}}),6);if(grid)P('lidar','ok',`${grid.pts.filter(p=>isFinite(p.h)).length} points mesurés et hauteur des bâtiments`)}
  let nA=0;inB.forEach(b=>{let name;if(!b.inside)name='Bâtiment voisin';else if(b===mainB)name='Maison';else if(/garage|carport/i.test(b.lbl))name='Garage';else if(/serre/i.test(b.lbl))name='Serre';else if(b.a<15||/abri/i.test(b.lbl))name='Abri de jardin';else name='Annexe'+(++nA>1?' '+nA:'');
    const h=b.h||(name==='Maison'?7:name==='Bâtiment voisin'?7:name==='Abri de jardin'?2.4:3);out.push({cat:'bat',pts:b.pts,h,name,src:b.src,conf:b.src==='OSM'?'probable':'sûr',on:true})});
  /* haies, clôtures et chemins des cartes */
  const near=(pts,r)=>pts.some(p=>dD(p)<=r);let nH=0,nF=0,nP=0;
  const clip=pts=>{const q=pts.filter(p=>dD(p)<=1.5);return q.length>=2?q:null};
  C.filter(c=>c.cat==='hedge').forEach(c=>{const pts=clip(c.pts);if(!pts||lenLL(pts)<2)return;if(S.shapes.some(s=>s.kind==='obsLine'&&pts.every(p=>distPtLine(p,s.pts)<1.5)))return;let h=NaN;if(grid){const hs=grid.pts.filter(p=>isFinite(p.h)&&p.h>0.4&&distPtLine(LL([p.x,p.y]),pts)<grid.s*0.8);hs.forEach(p=>used.add(p));if(hs.length)h=hs.map(p=>p.h).sort((a,b)=>a-b)[Math.floor(hs.length/2)]}
    out.push({cat:'hedge',pts,h:isFinite(h)?Math.min(6,h):1.8,w:1,nat:'haie',name:`Haie ${++nH}`,src:c.src,conf:c.conf,on:true})});
  C.filter(c=>c.cat==='fence').forEach(c=>{const pts=clip(c.pts);if(!pts||lenLL(pts)<2)return;if(S.shapes.some(s=>s.kind==='obsLine'&&pts.every(p=>distPtLine(p,s.pts)<1)))return;out.push({cat:'fence',pts,nat:c.nat,h:c.nat==='mur'?1:c.nat==='palissade'?1.8:1.5,name:c.nat==='mur'?`Muret ${++nF}`:c.nat==='palissade'?`Palissade ${++nF}`:`Clôture ${++nF}`,src:c.src,conf:c.conf,on:true})});
  C.filter(c=>c.cat==='path').forEach(c=>{const pts=c.pts.filter(p=>inD(p));if(pts.length<2||lenLL(pts)<3)return;const P2=pts.map(X),w=c.w/2,L2=[],R2=[];P2.forEach((p,k)=>{const a=P2[Math.max(0,k-1)],b=P2[Math.min(P2.length-1,k+1)],dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1;L2.push([p[0]-dy/n*w,p[1]+dx/n*w]);R2.push([p[0]+dy/n*w,p[1]-dx/n*w])});
    out.push({cat:'path',pts:[...L2,...R2.reverse()].map(LL),nat:c.w>2?'parking':'chemin',name:c.w>2?`Accès ${++nP}`:`Allée ${++nP}`,src:c.src,conf:c.conf,on:true})});
  /* massifs et haies du relief (1 à 4,5 m, hors arbres) */
  if(grid){const mid=grid.pts.filter(p=>!used.has(p)&&p.h>1&&p.h<=4.5&&inD(LL([p.x,p.y]))),seen=new Set();let nS=0;
    mid.forEach(p0=>{if(seen.has(p0))return;const comp=[],st=[p0];seen.add(p0);while(st.length){const p=st.pop();comp.push(p);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const q=grid.idx.get((p.i+a)+','+(p.j+b));if(q&&!seen.has(q)&&mid.includes(q)){seen.add(q);st.push(q)}}}
      const A=comp.length*grid.s*grid.s;if(A<3)return;const mx=comp.reduce((a,p)=>a+p.x,0)/comp.length,my=comp.reduce((a,p)=>a+p.y,0)/comp.length;let sxx=0,syy=0,sxy=0;comp.forEach(p=>{sxx+=(p.x-mx)**2;syy+=(p.y-my)**2;sxy+=(p.x-mx)*(p.y-my)});
      const th=0.5*Math.atan2(2*sxy,sxx-syy),u=[Math.cos(th),Math.sin(th)],v=[-u[1],u[0]],pu=comp.map(p=>(p.x-mx)*u[0]+(p.y-my)*u[1]),pv=comp.map(p=>(p.x-mx)*v[0]+(p.y-my)*v[1]),Lx=Math.max(...pu)-Math.min(...pu)+grid.s,Wx=Math.max(...pv)-Math.min(...pv)+grid.s;
      const hm=comp.map(p=>p.h).sort((a,b)=>a-b)[Math.floor(comp.length/2)],nearB=bPolys.some(b=>comp.some(p=>distPtPoly(LL([p.x,p.y]),b)<3)),edge=comp.some(p=>dD(LL([p.x,p.y]))<0.01)||comp.some(p=>distPtLine(LL([p.x,p.y]),[...D,D[0]])<2.5);
      if(Lx>=5&&Lx/Wx>=2.5){const a=Math.min(...pu)+grid.s/2,b=Math.max(...pu)-grid.s/2;out.push({cat:'hedge',pts:[[mx+u[0]*a,my+u[1]*a],[mx+u[0]*b,my+u[1]*b]].map(LL),h:hm,w:Wx>grid.s*1.6?Math.min(3,Wx):Math.min(1.5,Wx),nat:'haie',name:`Haie ${++nH}`,src:'LiDAR',conf:edge?'probable':'à vérifier',on:edge})}
      else{const sq=[];const hs=grid.s/2;comp.forEach(p=>sq.push([p.x-hs,p.y-hs],[p.x+hs,p.y-hs],[p.x+hs,p.y+hs],[p.x-hs,p.y+hs]));out.push({cat:'shrub',pts:hull(sq).map(LL),h:hm,nat:'arbu',name:`Massif arbustif ${++nS}`,src:'LiDAR',conf:'à vérifier',on:!nearB&&A>=4})}})}
  out.forEach((c,i)=>c.n=i+1);DET.src=[...src];DET.log=log;return out}
function detDraw(){detLayer.clearLayers();DET.list.forEach(c=>{const col=c.on?'#ef6c00':'#9e9e9e',o={color:col,weight:c.on?2.5:1.5,dashArray:'6 5',fillColor:col,fillOpacity:c.on?0.18:0.05};let ly;
  if(c.cat==='tree')ly=L.circle(c.pt,{...o,radius:c.w/2});else if(c.cat==='hedge'||c.cat==='fence')ly=L.polyline(c.pts,{...o,weight:c.cat==='hedge'?Math.max(4,c.w*4):3});else ly=L.polygon(c.pts,o);
  ly.on('click',()=>{c.on=!c.on;detDraw();detList()});ly.addTo(detLayer);const p=c.pt||cen(c.pts);L.marker(p,{interactive:false,icon:L.divIcon({className:'detnum',html:`<span class="${c.on?'':'off'}">${c.n}</span>`,iconSize:[20,20],iconAnchor:[10,10]})}).addTo(detLayer)})}
function detMeta(c){return c.cat==='tree'?`${nf(c.h,0)} m de haut, couronne ${nf(c.w,0)} m`:c.cat==='hedge'?`${nf(lenLL(c.pts),0)} m, ${nf(c.h,1)} m de haut`:c.cat==='fence'?`${nf(lenLL(c.pts),0)} m`:c.cat==='bat'?`${nf(areaLL(c.pts))} m², ${nf(c.h,0)} m de haut`:`${nf(areaLL(c.pts))} m²${c.h?`, ${nf(c.h,1)} m de haut`:''}`}
function detList(){const box=$('#detList');if(!box)return;const L_=DET.list,on=L_.filter(c=>c.on).length;
  box.innerHTML=L_.length?`<ul class="detl">${L_.map((c,i)=>{const opt=DOPT[c.cat],cur=c.cat==='bat'?c.name.replace(/ \d+$/,''):c.cat==='tree'?c.type:c.cat==='shrub'?c.nat:c.nat;return `<li class="${c.on?'':'off'}"><label class="detck"><input type="checkbox" data-dc="${i}"${c.on?' checked':''}><span class="detn">${c.n}</span></label><span class="deti">${DCAT[c.cat][0]}</span>
     <span class="detb"><b>${esc(c.name)}</b><small>${esc(detMeta(c))} · ${esc(c.src)}</small></span><select data-dt="${i}" aria-label="Type de ${esc(c.name)}">${opt.map(([k,l])=>`<option value="${k}"${cur===k?' selected':''}>${l}</option>`).join('')}</select><span class="conf c-${c.conf.replace(/[^a-z]/g,'')}">${c.conf}</span><button type="button" class="detz" data-dz="${i}" title="Voir sur la carte">◎</button></li>`}).join('')}</ul>`:'<p class="small">Rien de nouveau trouvé autour de ce terrain : dessinez l’existant à la main.</p>';
  const a=$('#detAdd');if(a){a.disabled=!on;a.textContent=`Ajouter ${on} élément${on>1?'s':''} à l’existant`}}
function detOpen(auto){const c=$('#detCard');if(!c)return;if(S.lat==null){toast('Placez d’abord votre terrain.');return}c.hidden=false;
  c.innerHTML=`<div class="dethead"><h4>🔎 Détection de l’existant</h4><button type="button" class="welx" data-dx="close" aria-label="Fermer">×</button></div><p class="small">Bâtiments, arbres, haies, clôtures, allées et massifs repérés sur les cartes publiques et le relief mesuré par avion. <b>Rien n’est ajouté sans votre accord</b> : cochez ce qui est juste, corrigez le type, puis ajoutez.</p>
   <ul class="exprog detprog"><li data-p="vec" class="wait"><span class="exst"></span><span><b>Cartes</b><small></small></span></li><li data-p="lidar" class="wait"><span class="exst"></span><span><b>Hauteurs (arbres, haies, toits)</b><small></small></span></li></ul><div id="detList"></div>
   <div class="detfoot"><span class="chips"><button type="button" data-dx="all">Tout cocher</button><button type="button" data-dx="none">Tout décocher</button></span><span class="chips"><button type="button" data-dx="close">Fermer</button><button type="button" class="pri" id="detAdd" data-dx="add" disabled>Ajouter à l’existant</button></span></div><p class="small muted" id="detSrc"></p>`;
  c.scrollIntoView({behavior:'smooth',block:'nearest'});detGo()}
async function detGo(){if(DET.busy)return;DET.busy=true;const st=(k,s,t)=>{const li=$(`#detCard [data-p=${k}]`);if(!li)return;li.className=s==='skip'?'warn':s;li.querySelector('small').textContent=t||''};
  try{DET.list=await detRun(st);detDraw();detList();const s=$('#detSrc');if(s)s.textContent=`Sources : ${DET.src.join(' ; ')||'aucune'}${DET.log.length?' · '+DET.log.join(', '):''}. Les relevés datent de 1 à 4 ans : un élément récent peut manquer.`;
    try{const all=DET.list.flatMap(c=>c.pt?[c.pt]:c.pts);if(all.length)map.fitBounds(all,{padding:[30,30],maxZoom:20})}catch(e){}}
  catch(e){const l=$('#detList');if(l)l.innerHTML=`<p class="small">${esc(e.message||String(e))}</p>`}finally{DET.busy=false}}
function mkObs(lat,lng,type,h,w,name){$('#obsType').value=OBT[type]?type:'caduc';addObstacle(lat,lng);const o=S.obs[S.obs.length-1];o.type=OBT[type]?type:'caduc';o.h=h;o.w=w;o.name=name;styleObs(o);return o}
function detAccept(L_){if(!L_.length)return 0;pushUndo();const pu=pushUndo;pushUndo=()=>{};let n=0;
  try{L_.forEach(c=>{const id=++itemId,r1=v=>Math.round(v*10)/10;
    if(c.cat==='bat'){S.shapes.push({id,kind:'obsPoly',pts:c.pts,name:c.name,h:r1(c.h),nat:'bat'});initGeom(id)}
    else if(c.cat==='tree'){mkObs(c.pt[0],c.pt[1],c.type==='arbu'?'arbu':c.type,r1(c.h),r1(c.w),c.name)}
    else if(c.cat==='hedge'){S.shapes.push({id,kind:'obsLine',pts:c.pts,name:c.name,h:r1(c.h),w:r1(c.w||1),nat:c.nat||'haie'});initGeom(id)}
    else if(c.cat==='fence'){S.shapes.push({id,kind:'obsLine',pts:c.pts,name:c.name,h:r1(c.h),nat:c.nat});initGeom(id)}
    else if(c.cat==='shrub'){S.shapes.push({id,kind:'obsPoly',pts:c.pts,name:c.nat==='viv'?c.name.replace('Massif arbustif','Massif de vivaces'):c.name,h:c.nat==='viv'?0.6:r1(c.h),nat:c.nat});initGeom(id)}
    else if(c.cat==='path'){S.paths.push({id,pts:c.pts,nat:c.nat,label:c.name});initGeom(id)}n++})}
  finally{pushUndo=pu}S.samples=null;itemsChanged(true);renderObs();sunUpdate();saveNow(true);return n}
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.dc!=null){const c=DET.list[+t.dataset.dc];if(c){c.on=t.checked;detDraw();detList()}}
  if(t.dataset.dt!=null){const c=DET.list[+t.dataset.dt];if(!c)return;const v=t.value;if(c.cat==='bat')c.name=v;else if(c.cat==='tree')c.type=v;else{c.nat=v;if(c.cat==='shrub')c.name=(v==='viv'?'Massif de vivaces ':'Massif arbustif ')+c.n;if(c.cat==='path')c.name=(v==='terrasse'?'Terrasse ':v==='parking'?'Accès ':'Allée ')+c.n}c.on=true;detDraw();detList()}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-dx],[data-dz]');if(!t||!t.closest('#detCard'))return;
  if(t.dataset.dz!=null){const c=DET.list[+t.dataset.dz];if(c)try{map.setView(c.pt||cen(c.pts),Math.max(map.getZoom(),20))}catch(err){}return}
  const a=t.dataset.dx;if(a==='all'||a==='none'){DET.list.forEach(c=>c.on=a==='all');detDraw();detList()}
  if(a==='close'){$('#detCard').hidden=true;detLayer.clearLayers()}
  if(a==='add'){const L_=DET.list.filter(c=>c.on);if(curPhase()!=='exist'){S.phase='exist';applyPhase()}const n=detAccept(L_);detLayer.clearLayers();$('#detCard').hidden=true;DET.list=[];
    toast(`${n} élément${n>1?'s':''} ajouté${n>1?'s':''} à l’existant. Vérifiez-les dans « Éléments sur la carte »${S.pmode==='modify'||S.pmode==='redo'?', puis choisissez ce que vous en faites dans « Que devient l’existant ? »':''}.`);if(S.pmode==='modify'||S.pmode==='redo'){if(S.pmode==='redo')redoAll(false);renderFate()}}});
window.__p31={exList,fateOf:(k,id)=>{const it=(S[k]||[]).find(x=>String(x.id)===String(id));return it?fateOf(k,it):null},exFate,redoAll,setPmode,detRun,detAccept,detOpen,DET,hull,plane};

/* ---------- Démarrage ---------- */
if(window.__noMap){
  $('#map').innerHTML='<div class="nomap"><p><b>La carte n’a pas pu se charger.</b></p><p>Ce fichier doit être ouvert dans un navigateur (Chrome, Edge, Firefox ou Safari sur ordinateur) avec une connexion internet. Un aperçu de fichier, une application de messagerie ou le mode hors ligne bloquent la carte et les données en ligne.</p><p>Vous pouvez quand même saisir des coordonnées au-dessus de la carte.</p></div>';
  const b=$('#banner');b.hidden=false;b.querySelector('span').textContent='Carte indisponible : ouvrez le fichier directement dans votre navigateur, avec internet. Le reste de la page fonctionne avec des coordonnées saisies.';
  document.querySelectorAll('#tool,#drawBed2,.xbtns button').forEach(el=>{el.disabled=true});
}
$('#coords').addEventListener('submit',e=>{e.preventDefault();const la=parseFloat($('#cLat').value.replace(',','.')),lo=parseFloat($('#cLon').value.replace(',','.'));
  if(!(la>=-90&&la<=90&&lo>=-180&&lo<=180)){$('#siteinfo').textContent='Coordonnées invalides (ex. 50.5636 et 4.6990).';return}setSite(la,lo,true)});
const now=new Date();$('#date').value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
$('#time').value=Math.min(1320,Math.max(240,Math.round((now.getHours()*60+now.getMinutes())/10)*10));
manVals();renderObs();
const ro=new ResizeObserver(()=>{drawOmbro();drawRose();drawTri();drawSunPath();if(S.lastCompo)drawPlan(S.lastCompo,S.lastLayout)});
['#ombro','#rose','#tri','#sunpath','#plan'].forEach(s=>ro.observe($(s)));
let start=[50.5636,4.699];try{const s=JSON.parse(localStorage.getItem('plantania:site'));if(Array.isArray(s)&&s.length===2)start=s}catch(e){}
map.setView(start,18);setSite(start[0],start[1]);
if(LANG!=='fr')setLang(LANG);
renderBoxes();renderVeg();renderOrch();
renderWants();projBoot();window.__pboot=1;if(WZ.on)wizGo(WZ.step);else wizApply();syncAdvSum();setTimeout(glossPass,600);
try{if(localStorage.getItem('plantania:welcome')!=='done')setTimeout(welOpen,400);else if(!localStorage.getItem('plantania:tuto'))setTimeout(()=>tutoGo(0),1500)}catch(e){}
