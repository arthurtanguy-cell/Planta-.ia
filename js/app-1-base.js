/* Plantañ.ia : interface, carte, sol, climat, massifs */
/* ---------- Interface ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=(v,d=0)=>v==null||isNaN(v)?'–':Number(v).toLocaleString('fr-BE',{minimumFractionDigits:d,maximumFractionDigits:d});
const MO=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const MOL=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const MI='JFMAMJJASOND'.split('');
const EXL={s:'Plein soleil',m:'Mi-ombre',o:'Ombre'},WL={d:'Sec',f:'Frais',h:'Humide'},SL={s:'Léger (sableux)',l:'Limoneux',a:'Lourd (argileux)'};
const TL={arbre:'Arbre',arbuste:'Arbuste',vivace:'Vivace',graminee:'Graminée',fougere:'Fougère',annuelle:'Annuelle'};
const COL={blanc:['Blanc','#f3f2ea'],rose:['Rose','#e88fb4'],rouge:['Rouge','#c8323b'],orange:['Orange','#ee8a2b'],jaune:['Jaune','#f2cd3a'],bleu:['Bleu','#5582d8'],violet:['Violet','#8a5cc4'],blond:['Blond (épis)','#d6bd86'],vert:['Vert discret','#86a85f']};
const FOL={vert:'Vert',pourpre:'Pourpre',panache:'Panaché',gris:'Gris / bleuté',automne:'Couleurs d’automne',pers:'Persistant'};
const PORT={erige:'Érigé',touffe:'En touffe',arrondi:'Arrondi',couvre:'Couvre-sol',fontaine:'En fontaine',colonne:'Colonnaire',etale:'Étalé'};
const OBT={bat:{l:'Bâtiment',h:8,w:10,c:'#b06a35'},caduc:{l:'Arbre caduc',h:12,w:8,c:'#4f9a5c'},pers:{l:'Arbre persistant',h:12,w:6,c:'#1f6a35'},haie:{l:'Haie',h:2,w:6,c:'#8fb04a'}};
const COMPASS=['N','NE','E','SE','S','SO','O','NO'];
const card=b=>COMPASS[Math.round(b/45)%8];
const doyTxt=d=>{if(d==null)return '–';const x=new Date(Date.UTC(2023,0,1)+(Math.round(d)-1)*864e5);return x.getUTCDate()+' '+MO[x.getUTCMonth()]};

const HUE={rouge:0,orange:30,jaune:60,vert:120,bleu:220,violet:275,rose:330};
const hdist=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d};
const HARM={libre:'Libre (couleurs variées)',camaieu:'Camaïeu (une seule teinte)',analogue:'Couleurs voisines (analogues)',compl:'Couleurs opposées (complémentaires)',chaud:'Tons chauds (rouge, orange, jaune)',froid:'Tons froids (bleu, violet, blanc)',pastel:'Pastels (blanc, rose, bleu)',blanc:'Jardin blanc'};
const HBASE=['rose','rouge','orange','jaune','bleu','violet','blanc'];
const BLOOM={'7':'Saison : 7 mois de fleurs (avril à octobre)','12':'Toute l’année : 12 mois, y compris l’hiver','libre':'Sans objectif de floraison'};
const DISPO={forme:'Suit la forme du massif (bandes parallèles aux bords)',naturel:'Naturelle (dérives et mélanges)',rangs:'Rangs droits parallèles au fond'};
function harmSet(){const H=S.harm,b=H.base;switch(H.mode){
  case 'camaieu':return new Set(b==='blanc'?['blanc']:[b,'blanc']);
  case 'analogue':return new Set(b==='blanc'?['blanc','rose','bleu']:[...Object.keys(HUE).filter(k=>k!=='vert'&&hdist(HUE[k],HUE[b])<=60),'blanc']);
  case 'compl':return new Set(b==='rouge'||b==='rose'?[b]:b==='blanc'?['blanc','violet']:[b,...Object.keys(HUE).filter(k=>k!=='vert'&&hdist(HUE[k],HUE[b])>=140)]);
  case 'chaud':return new Set(['rouge','orange','jaune']);
  case 'froid':return new Set(['bleu','violet','blanc']);
  case 'pastel':return new Set(['blanc','rose','bleu']);
  case 'blanc':return new Set(['blanc']);
  default:return null}}
const colOk=(p,cs)=>!cs||!p.c.length||p.c.some(c=>cs.has(c)||c==='blond'||c==='vert');
const pickCol=(p,cs)=>(cs&&p.c.find(c=>cs.has(c)))||p.c.find(c=>c!=='vert'&&c!=='blond')||p.c[0]||'';
const bloomTgt=()=>S.bloom==='12'?[1,2,3,4,5,6,7,8,9,10,11,12]:S.bloom==='7'?[4,5,6,7,8,9,10]:null;
const isBulb=p=>/^(Galanthus|Crocus|Narcissus|Tulipa|Camassia|Muscari|Allium 'Purple|Anemone nemorosa|Cyclamen (hederifolium|coum))/.test(p.l);
const S={harm:{mode:'libre',base:'rose'},bloom:'7',dispo:'forme',pick:'auto',custom:[],mode:'site',bed:null,drawPts:[],lat:null,lon:null,clim:null,climErr:null,soilApi:null,soilErr:null,soilMan:null,obs:[],ovr:{expo:'auto',eau:'auto',sol:'auto',ph:'auto'},stats:null,tok:0,style:'ang',adding:false,lastCompo:null};
const F={type:'tous',style:'tous',fo:'tous',port:'tous',hmin:0,hmax:99,mois:0,colors:new Set()};

/* ---------- Styles de jardin ---------- */
const STY={
 ang:{l:'Jardin à l’anglaise',s:'Mixed border foisonnant, rosiers, taches de couleur',
  d:'Massif généreux et romantique : les plantes hautes à l’arrière, les basses devant, des vivaces fleuries plantées en taches de 3 à 7 pieds, quelques rosiers ou arbustes pour la structure et des bulbes de printemps glissés entre les vivaces.',
  roles:[
   {r:'Structure : arbustes et rosiers',f:p=>p.t==='arbuste'&&!p.pers,k:A=>A>=6?2:1,m:'count',c:A=>Math.max(1,Math.round(A/10))},
   {r:'Vivaces fleuries en taches',f:p=>p.t==='vivace',k:A=>A>=12?7:5,m:'area',sh:.72},
   {r:'Graminée d’accompagnement',f:p=>p.t==='graminee',k:()=>1,m:'area',sh:.07},
   {r:'Fougère pour les coins d’ombre',f:p=>p.t==='fougere',k:()=>1,m:'area',sh:.06,only:c=>c.expo!=='s'},
   {r:'Bulbes de printemps entre les vivaces',f:p=>isBulb(p),k:()=>1,m:'area',sh:.06}],
  tasks:[[3,'Étaler 2–3 cm de compost sur tout le massif'],[5,'Tuteurer les grandes vivaces avant qu’elles ne versent'],[6,'Retirer les fleurs fanées chaque semaine pour prolonger la floraison'],[10,'Diviser les taches devenues trop grandes et combler les vides']]},
 ros:{l:'Roseraie',s:'Rosiers de plusieurs types et couleurs, vivaces compagnes',
  d:'Une roseraie mêle des rosiers de différents types : grimpants contre le fond (mur, treillage, arche), rosiers anglais et arbustifs au milieu, rosiers buissons à grandes fleurs ou en bouquets devant, couvre-sols en bordure. Des vivaces compagnes (népéta, géranium vivace, alchémille, lavande, sauge) cachent le pied des rosiers, prolongent la floraison et attirent les auxiliaires qui mangent les pucerons. Préférez les variétés résistantes aux maladies (label ADR) : elles se passent de traitements.',
  roles:[
   {r:'Rosiers grimpants contre le fond',f:p=>p.rose&&p.rose.g==='grimpant',k:A=>A>=10?2:1,m:'count',c:A=>Math.max(1,Math.round(Math.sqrt(A)/2)),only:()=>!S.bed||backIdx(bedGeo())>=0},
   {r:'Rosiers anglais et arbustifs',f:p=>p.rose&&(p.rose.g==='anglais'||p.rose.g==='arbustif'),k:A=>A>=12?3:2,m:'area',sh:.36},
   {r:'Rosiers buissons (grandes fleurs, bouquets)',f:p=>p.rose&&(p.rose.g==='buisson'||p.rose.g==='flori'),k:A=>A>=10?2:1,m:'area',sh:.2},
   {r:'Rosier couvre-sol en bordure',f:p=>p.rose&&p.rose.g==='couvre',k:()=>1,m:'area',sh:.08},
   {r:'Vivaces compagnes',f:p=>p.t==='vivace'&&p.st.includes('ros'),k:A=>A>=12?4:3,m:'area',sh:.36}],
  tasks:[[3,'Tailler rosiers buissons et arbustifs au-dessus d’un œil tourné vers l’extérieur, quand les forsythias fleurissent'],[3,'Apporter compost et engrais organique au pied des rosiers'],[6,'Retirer les fleurs fanées chaque semaine pour favoriser la remontée'],[7,'Surveiller pucerons et taches noires ; ramasser les feuilles malades'],[11,'Planter les rosiers à racines nues (novembre à mars), point de greffe 3 cm sous terre ; butter le pied']]},
 nw:{l:'New wave planting',s:'Matrice de graminées et vivaces naturalistes (Oudolf)',
  d:'Une matrice de graminées couvre environ 60 % de la surface ; des vivaces structurantes y sont plantées en groupes, puis quelques ponctuations dispersées. On choisit les plantes aussi pour leurs silhouettes, épis et graines, et on ne coupe rien avant la fin de l’hiver.',
  roles:[
   {r:'Matrice de graminées (≈ 60 %)',f:p=>p.t==='graminee',k:()=>2,m:'area',sh:.6},
   {r:'Vivaces structurantes en groupes',f:p=>p.t==='vivace'&&p.h>=0.7,k:A=>A>=12?4:3,m:'area',sh:.3},
   {r:'Ponctuations dispersées',f:p=>p.t==='vivace'&&p.h<0.7,k:()=>2,m:'area',sh:.1},
   {r:'Arbuste léger (grands massifs)',f:p=>p.t==='arbuste'&&!p.pers,k:A=>A>=30?1:0,m:'count',c:()=>1}],
  tasks:[[2,'Rabattre tout le massif en une seule fois, tiges et graminées à 5–10 cm'],[3,'Broyer les tiges coupées et les laisser en paillis'],[6,'Désherbage sélectif : retirer seulement les semis indésirables'],[11,'Ne rien couper : tiges, épis et graines structurent l’hiver et nourrissent la faune']]},
 fr:{l:'Jardin à la française',s:'Symétrie, bordures taillées, topiaires',
  d:'Un dessin géométrique et symétrique : des compartiments bordés de persistants taillés bas, des topiaires pour marquer les angles et les axes, et un remplissage d’une seule plante par compartiment pour un effet net.',
  roles:[
   {r:'Bordure basse taillée',f:p=>p.t==='arbuste'&&p.pers&&p.h<=2&&/^(Buxus|Ilex crenata|Teucrium|Sarcococca|Osmanthus)/.test(p.l),k:()=>1,m:'line',per:5},
   {r:'Topiaires aux angles',f:p=>p.t==='arbuste'&&p.pers&&(p.p==='colonne'||p.h>=4),k:()=>1,m:'count',c:A=>A>=10?4:2},
   {r:'Remplissage uniforme des compartiments',f:p=>p.t==='vivace'&&p.h<=0.8,k:()=>1,m:'area',sh:.8},
   {r:'Charmille ou alignement',f:p=>p.t==='arbre',k:A=>A>=80?1:0,m:'count',c:A=>Math.max(2,Math.round(Math.sqrt(A)/3))}],
  tasks:[[3,'Désherber et ratisser les allées'],[4,'Remplacer les manques pour garder la symétrie'],[6,'1re taille de la bordure et des topiaires (au cordeau ou au gabarit)'],[9,'2e taille de la bordure et des topiaires']]},
 jap:{l:'Jardin japonais',s:'Minéral, persistants taillés, fougères, mousses',mineral:.5,
  d:'Une scène sobre où le minéral (gravier ratissé, pierres, mousse) occupe environ la moitié de la surface. Un arbre sculptural, des persistants taillés en nuages, des fougères et des graminées en cascade, avec très peu de couleurs.',
  roles:[
   {r:'Arbre sculptural',f:p=>p.t==='arbre',k:A=>A>=8?1:0,m:'count',c:()=>1},
   {r:'Persistants taillés en nuages',f:p=>p.t==='arbuste'&&p.pers,k:A=>A>=6?2:1,m:'count',c:A=>Math.max(1,Math.round(A/12))},
   {r:'Fougères',f:p=>p.t==='fougere',k:()=>2,m:'area',sh:.45},
   {r:'Graminée en cascade',f:p=>p.t==='graminee',k:()=>1,m:'area',sh:.3},
   {r:'Couvre-sol',f:p=>p.t==='vivace'&&p.p==='couvre',k:()=>1,m:'area',sh:.25}],
  tasks:[[4,'Nettoyer et ratisser le gravier, entretenir la mousse'],[6,'Taille en nuages des persistants (1re taille)'],[10,'Taille de finition et ramassage des feuilles sur le minéral']]},
 med:{l:'Jardin sec / méditerranéen',s:'Gravier, plantes de sécheresse, zéro arrosage',
  d:'Des plantes adaptées à la sécheresse, souvent au feuillage gris, sur un paillage minéral. Une fois installé, ce jardin ne demande plus d’arrosage. C’est un bon choix sur sol drainant et en plein soleil.',
  roles:[
   {r:'Arbustes persistants',f:p=>p.t==='arbuste',k:A=>A>=6?2:1,m:'count',c:A=>Math.max(1,Math.round(A/8))},
   {r:'Vivaces de terrain sec',f:p=>p.t==='vivace',k:A=>A>=12?5:4,m:'area',sh:.62},
   {r:'Graminées',f:p=>p.t==='graminee',k:()=>2,m:'area',sh:.28},
   {r:'Bulbes et petites vivaces',f:p=>p.t==='vivace'&&p.h<=0.4,k:()=>1,m:'area',sh:.1}],
  tasks:[[3,'Couper les tiges sèches des vivaces'],[4,'Paillage minéral de 5–8 cm (gravier) ; pas d’engrais'],[7,'Aucun arrosage après la première année']]},
 viv:{l:'Jardin vivrier (comestible)',s:'Petits fruits, aromatiques, légumes vivaces',
  d:'Un massif nourricier : petits fruits à l’arrière, légumes vivaces et aromatiques au milieu, aromatiques fleuries devant, qui attirent les pollinisateurs. Pour les légumes annuels, utilisez l’onglet « Potager » (bacs, pleine terre ou serre).',
  roles:[
   {r:'Petits fruits et arbustes comestibles',f:p=>p.t==='arbuste'||p.t==='arbre',k:A=>A>=10?3:A>=4?2:1,m:'count',c:A=>Math.max(1,Math.round(A/5))},
   {r:'Légumes vivaces et aromatiques',f:p=>p.t==='vivace',k:A=>A>=10?6:4,m:'area',sh:.8},
   {r:'Aromatiques fleuries compagnes',f:p=>p.t==='vivace'&&p.h<=0.5&&p.f.length>0,k:()=>2,m:'area',sh:.2}],
  tasks:[[3,'Étaler 3 cm de compost, préparer le sol à la grelinette sans le retourner'],[5,'Pailler épais entre les plants (paille, tontes sèches)'],[7,'Récoltes régulières ; arrosage au pied le soir en période sèche'],[10,'Semer un engrais vert sur les surfaces libérées (phacélie, moutarde)']]},
 eco:{l:'Jardin écologique (biodiversité)',s:'Plantes mellifères et indigènes, refuges, zéro pesticide',
  d:'Composition pensée pour la faune : plantes indigènes et mellifères qui fleurissent de février à octobre, tiges creuses et graines laissées en hiver, coins de bois mort et de pierres. Aucun pesticide ni engrais chimique ; l’eau de pluie est récupérée.',
  roles:[
   {r:'Arbuste à baies pour les oiseaux',f:p=>p.t==='arbuste'||p.t==='arbre',k:A=>A>=10?3:A>=5?2:1,m:'count',c:A=>Math.max(1,Math.round(A/12))},
   {r:'Vivaces mellifères',f:p=>p.t==='vivace',k:A=>A>=12?6:4,m:'area',sh:.6},
   {r:'Graminées et laîches (abris, graines)',f:p=>p.t==='graminee',k:()=>2,m:'area',sh:.2},
   {r:'Fougères (zones ombragées)',f:p=>p.t==='fougere',k:()=>1,m:'area',sh:.1,only:c=>c.expo!=='s'},
   {r:'Fleurs précoces pour les pollinisateurs',f:p=>p.t==='vivace'&&p.f.some(m=>m<=4),k:()=>2,m:'area',sh:.1}],
  tasks:[[2,'Rabattre seulement en fin d’hiver, laisser les tiges coupées en tas (abris d’insectes)'],[3,'Installer un tas de bois mort, un muret de pierres sèches ou un hôtel à insectes'],[6,'Aucun pesticide ; arroser à l’eau de pluie récupérée'],[10,'Laisser feuilles mortes et graines au sol pour les oiseaux et hérissons']]},
 gra:{l:'Jardin graphique (contemporain)',s:'Formes nettes, masses, peu d’espèces, contrastes',
  d:'Un dessin épuré : peu d’espèces, plantées en grands blocs nets, persistants taillés en boules ou en cubes pour la structure, graminées en masses pour le mouvement, contrastes de feuillage et de silhouettes. Les couleurs sont limitées à 2 ou 3 teintes.',
  roles:[
   {r:'Persistants taillés (boules, cubes)',f:p=>p.t==='arbuste'&&p.pers,k:A=>A>=10?2:1,m:'count',c:A=>Math.max(2,Math.round(A/6))},
   {r:'Graminées en masses',f:p=>p.t==='graminee',k:()=>2,m:'area',sh:.5},
   {r:'Vivaces architecturales en blocs',f:p=>p.t==='vivace'||p.t==='fougere',k:A=>A>=12?3:2,m:'area',sh:.5}],
  tasks:[[3,'Rabattre les graminées caduques en une fois, au cordeau'],[6,'1re taille des boules et des cubes'],[9,'2e taille des boules et des cubes'],[4,'Désherber et regarnir les manques pour garder des blocs nets']]},
 tal:{l:'Talus et pentes',s:'Couvre-sols, arbustes drageonnants, anti-érosion',
  d:'Plantation dense pour tenir la terre : arbustes drageonnants et couvre-sols persistants, dont les racines fixent le sol, et graminées en touffes. Sur pente forte, on plante à travers une toile biodégradable (coco ou jute), en quinconce, dans de petites cuvettes. Pour estimer la pente, dessinez le talus sur la carte (section « Talus et pentes »).',
  roles:[{r:'Arbustes drageonnants (fixation)',f:p=>p.t==='arbuste',k:A=>A>=10?3:2,m:'count',c:A=>Math.max(1,Math.round(A/4))},
   {r:'Couvre-sols persistants',f:p=>(p.t==='vivace'||p.t==='fougere')&&(p.p==='couvre'||p.pers),k:()=>3,m:'area',sh:.6},
   {r:'Graminées en touffes',f:p=>p.t==='graminee',k:()=>2,m:'area',sh:.4}],
  tasks:[[3,'Vérifier la toile anti-érosion et les agrafes ; regarnir les manques'],[5,'Désherber à la main les 2 premières années, sans gratter le sol'],[7,'Arroser les jeunes plants en période sèche (versant sud surtout)'],[10,'Laisser les feuilles mortes en place : elles protègent le sol']]},
 nat:{l:'Jardin naturel / sous-bois',s:'Indigènes, faune, entretien minimal',
  d:'Une composition inspirée des lisières et des sous-bois, surtout avec des espèces indigènes. Elle accueille la faune et demande très peu d’entretien.',
  roles:[
   {r:'Arbre indigène',f:p=>p.t==='arbre',k:A=>A>=30?1:0,m:'count',c:()=>1},
   {r:'Arbustes champêtres',f:p=>p.t==='arbuste',k:A=>A>=10?3:A>=4?2:1,m:'count',c:A=>Math.max(1,Math.round(A/12))},
   {r:'Vivaces spontanées',f:p=>p.t==='vivace',k:()=>4,m:'area',sh:.45},
   {r:'Graminées et laîches',f:p=>p.t==='graminee',k:()=>2,m:'area',sh:.25},
   {r:'Fougères',f:p=>p.t==='fougere',k:()=>2,m:'area',sh:.2,only:c=>c.expo!=='s'},
   {r:'Bulbes naturalisés',f:p=>isBulb(p),k:()=>1,m:'area',sh:.1}],
  tasks:[[3,'Laisser les feuilles mortes en place, dégager seulement les jeunes pousses'],[7,'Aucun traitement : laisser la faune auxiliaire réguler'],[10,'Fauche tardive des zones herbacées ; garder des tas de bois et de feuilles']]}
};

/* ---------- Carte ---------- */
const map=L.map('map',{zoomControl:true,maxZoom:23,zoomSnap:0.5,zoomDelta:0.5,wheelPxPerZoomLevel:100}).setView([50.5636,4.699],17);
const sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:23,maxNativeZoom:19,attribution:'Imagerie © Esri'});
const plan=L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:23,maxNativeZoom:19,subdomains:'abcd',attribution:'© OpenStreetMap, © CARTO'});
sat.addTo(map);
const cadGroup=L.layerGroup(),solGroup=L.layerGroup(),isoGroup=L.layerGroup(),relGroup=L.layerGroup();
const OVL={cad:cadGroup,sol:solGroup,iso:isoGroup,rel:relGroup};
if(!window.__noMap&&L.TileLayer&&L.TileLayer.extend){
  const ArcT=L.TileLayer.extend({getTileUrl(c){const W=20037508.342789244,s=2*W/Math.pow(2,c.z),x0=-W+c.x*s,y1=W-c.y*s;return this._url+`/export?bbox=${x0},${y1-s},${x0+s},${y1}&bboxSR=3857&imageSR=3857&size=256,256&format=${this.options.fmt||'png32'}&transparent=${this.options.fmt?'false':'true'}&f=image${this.options.lyr!=null?'&layers=show:'+this.options.lyr:''}`}});
  window.__orthoW=new ArcT('https://geoservices.wallonie.be/arcgis/rest/services/IMAGERIE/ORTHO_LAST/MapServer',{minZoom:7,maxZoom:23,maxNativeZoom:22,attribution:'Orthophoto © SPW'});
  const W=(u,l,o)=>L.tileLayer.wms?L.tileLayer.wms(u,{layers:l,format:'image/png',transparent:true,maxZoom:23,maxNativeZoom:21,...o}):null;
  new ArcT('https://ccff02.minfin.fgov.be/geoservices/arcgis/rest/services/WMS/Cadastral_Layers/MapServer',{minZoom:15,maxZoom:23,maxNativeZoom:21,attribution:'Plan cadastral © SPF Finances – AGDP'}).addTo(cadGroup);
  new ArcT('https://geoservices.wallonie.be/arcgis/rest/services/PLAN_REGLEMENT/CADMAP_PARCELLES/MapServer',{lyr:0,minZoom:15,maxZoom:23,maxNativeZoom:21}).addTo(cadGroup);
  const a1=W('https://geo.api.vlaanderen.be/Adpf/wms','Adpf',{minZoom:15});if(a1)a1.addTo(cadGroup);
  new ArcT('https://geoservices.wallonie.be/arcgis/rest/services/SOL_SOUS_SOL/CNSW/MapServer',{minZoom:12,maxZoom:23,maxNativeZoom:21,attribution:'Sols © SPW'}).addTo(solGroup);
  const s1=W('https://www.dov.vlaanderen.be/geoserver/bodemkaart/wms','bodemkaart:bodemtypes',{minZoom:12,attribution:'Bodemkaart © DOV'});if(s1)s1.addTo(solGroup);
  new ArcT('https://geoservices.wallonie.be/arcgis/rest/services/IGN/CONTOURLINES/MapServer',{minZoom:12,maxZoom:23,maxNativeZoom:21,attribution:'Courbes de niveau © IGN'}).addTo(isoGroup);
  new ArcT('https://geoservices.wallonie.be/arcgis/rest/services/RELIEF/WALLONIE_2013_2014_VUE_SIMPLE/MapServer',{minZoom:12,maxZoom:23,maxNativeZoom:21,attribution:'Relief © SPW'}).addTo(relGroup);
  const r1=W('https://geo.api.vlaanderen.be/DHMV/wms','DHMVII_DTM_1m',{minZoom:12,attribution:'DHMV © Digitaal Vlaanderen'});if(r1)r1.addTo(relGroup);
}
const ign=L.tileLayer.wms?L.tileLayer.wms('https://cartoweb.wms.ngi.be/service',{layers:'topo',format:'image/png',maxZoom:23,maxNativeZoom:20,attribution:'Carte IGN © NGI (CartoWeb.be)'}):L.tileLayer('');
const ignOv=L.layerGroup();if(L.tileLayer.wms)L.tileLayer.wms('https://cartoweb.wms.ngi.be/service',{layers:'overlay',format:'image/png',transparent:true,maxZoom:23,maxNativeZoom:20}).addTo(ignOv);OVL.ignov=ignOv;
const BASES={sat,ign,plan};
BASES.ortho=L.layerGroup();try{L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:23,maxNativeZoom:19,attribution:'Imagerie © Esri'}).addTo(BASES.ortho);if(window.__orthoW)window.__orthoW.addTo(BASES.ortho);if(L.tileLayer.wms)L.tileLayer.wms('https://geo.api.vlaanderen.be/omw/wms',{layers:'OMWRGB25VL',format:'image/png',transparent:true,maxZoom:23,maxNativeZoom:22,attribution:'Orthofoto © Digitaal Vlaanderen'}).addTo(BASES.ortho)}catch(e){}
BASES.blank=L.layerGroup();
function applyLayers(){
  const op=+$('#ovOp').value/100;
  document.querySelectorAll('#layers [data-ov]').forEach(cb=>{const g=OVL[cb.dataset.ov];map.removeLayer(g);if(cb.checked){g.addTo(map);if(g.eachLayer)g.eachLayer(l=>l.setOpacity&&l.setOpacity(op))}});
}
$('#layers').addEventListener('change',e=>{
  const t=e.target;
  if(t.name==='base'){Object.values(BASES).forEach(b=>map.removeLayer(b));BASES[t.value].addTo(map);document.documentElement.classList.toggle('mapplan',!['sat','ortho'].includes(t.value));document.documentElement.classList.toggle('mapblank',t.value==='blank');{const B_=BASES[t.value];if(B_.bringToBack)B_.bringToBack();else if(B_.getLayers)B_.getLayers().slice().reverse().forEach(l=>l.bringToBack&&l.bringToBack())}return}
  if(t.dataset.ov&&t.checked&&$('#oneLayer').checked)document.querySelectorAll('#layers [data-ov]').forEach(cb=>{if(cb!==t)cb.checked=false});
  if(t.id==='oneLayer'&&t.checked){const on=[...document.querySelectorAll('#layers [data-ov]')].filter(cb=>cb.checked);on.slice(1).forEach(cb=>cb.checked=false)}
  applyLayers();
});
$('#ovOp').addEventListener('input',applyLayers);
applyLayers();
const parcelLayer=L.layerGroup().addTo(map);
const shadowLayer=L.layerGroup().addTo(map);
const siteIcon=L.divIcon({className:'',html:'<span class="pin"></span>',iconSize:[22,22],iconAnchor:[4,26]});
let siteMarker=null;
const bedLayer=L.layerGroup().addTo(map),plantLayer=L.layerGroup().addTo(map),cv=L.canvas({padding:.3});
map.on('click',e=>{const {lat,lng}=e.latlng;if(S.mode==='erase')return;if(S.mode in SHAPE_MODES)addDrawPt(lat,lng);else if(S.mode==='obs')addObstacle(lat,lng);else if(S.mode==='fruit')addFruit(lat,lng);else if(typeof siteClick==='function')siteClick(lat,lng);else setSite(lat,lng)});

function resetProject(){
  if(S.shapes&&typeof clearDrawings==='function'){clearDrawings();S.lawnManual=0}else{S.obs.forEach(o=>{map.removeLayer(o.circle);map.removeLayer(o.marker)});S.obs=[];S.bed=null;bedLayer.clearLayers();plantLayer.clearLayers()}
  S.lastLayout=null;S.samples=null;
  S.soilMan=null;S.phMeas=null;S.ovr={expo:'auto',eau:'auto',sol:'auto',ph:'auto'};$('#phIn').value='';$('#island').checked=false;
  S.clim=null;S.soilReg=null;S.soilApi=null;S.parcel=null;S.stats=null;
  if(S.fill){S.fill.on=false;if($('#fillOn'))$('#fillOn').checked=false}if(S.boxes)S.boxes=[];S.custom=[];S.pick='auto';if(S.veg){S.veg.sel=null;S.veg.touched=0}if(S.orch)S.orch.touched=0;
  if(typeof drawItems==='function'){drawItems();renderExtras()}renderObs();
}
function setSite(lat,lon,fly,keep){
  const moved=S.lat!=null&&Math.hypot((lat-S.lat)*111320,(lon-S.lon)*111320*Math.cos(lat*R))>150;
  const hadItems=S.obs.length||S.bed||(S.shapes&&(S.shapes.length+S.hedges.length+S.lawns.length+S.ponds.length+S.fruits.length+S.vines.length+S.taluses.length))||S.soilMan;
  if(moved&&!keep){resetProject();if(hadItems){$('#maphint').textContent='Nouveau lieu : les obstacles, tracés et corrections de l’adresse précédente ont été retirés, et toutes les données sont rechargées pour ce point.'}}
  S.lat=lat;S.lon=lon;
  if(!siteMarker){siteMarker=L.marker([lat,lon],{draggable:true,icon:siteIcon,zIndexOffset:1000}).addTo(map);siteMarker.on('dragend',()=>{const p=siteMarker.getLatLng();setSite(p.lat,p.lng)})}
  else siteMarker.setLatLng([lat,lon]);
  if(fly)map.setView([lat,lon],18);
  $('#siteinfo').innerHTML=`Site : <b>${lat.toFixed(5)}, ${lon.toFixed(5)}</b>`;$('#cLat').value=lat.toFixed(5);$('#cLon').value=lon.toFixed(5);
  try{localStorage.setItem('plantania:site',JSON.stringify([lat,lon]))}catch(e){}
  sunUpdate();loadData();
}

/* ---------- Obstacles ---------- */
let obsId=0;
function addObstacle(lat,lng){if(typeof pushUndo==='function')pushUndo();
  const type=$('#obsType').value,d=OBT[type];
  const o={id:++obsId,lat,lng,type,h:d.h,w:d.w};
  o.circle=L.circle([lat,lng],{radius:o.w/2,color:d.c,weight:2,fillOpacity:.25,interactive:false}).addTo(map);
  o.marker=L.marker([lat,lng],{draggable:true,icon:L.divIcon({className:'',html:`<span class="obpin" style="background:${d.c}"></span>`,iconSize:[16,16],iconAnchor:[8,8]})}).addTo(map);
  o.marker.on('drag',()=>{const p=o.marker.getLatLng();o.lat=p.lat;o.lng=p.lng;o.circle.setLatLng(p);drawShadows()});
  o.marker.on('dragend',()=>{renderObs();sunUpdate()});
  o.marker.on('click',e=>{if(S.mode==='erase')delItem('obs',o.id);else itemPopup(e.latlng,'obs',o.id,OBT[o.type].l)});
  S.obs.push(o);renderObs();sunUpdate();
}
function styleObs(o){const d=OBT[o.type];o.circle.setRadius(o.w/2);o.circle.setStyle({color:d.c});o.marker.setIcon(L.divIcon({className:'',html:`<span class="obpin" style="background:${d.c}"></span>`,iconSize:[16,16],iconAnchor:[8,8]}))}
function relObs(o){const dn=(o.lat-S.lat)*111320,de=(o.lng-S.lon)*111320*Math.cos(S.lat*R);return{dist:Math.hypot(dn,de),brg:((Math.atan2(de,dn)/R)+360)%360}}
function blocked(sp,month){
  for(const o of obsAll()){
    if(o.type==='caduc'&&(month>=11||month<=3))continue;
    const r=relObs(o),d=Math.max(r.dist,0.5);
    const hw=d<=o.w/2?180:Math.atan(o.w/2/d)/R, ang=Math.atan(o.h/d)/R;
    const diff=Math.abs(((sp.az-r.brg+540)%360)-180);
    if(diff<=hw&&sp.alt<ang)return true;
  }
  return false;
}
function renderObs(){
  if(typeof renderItemsList==='function')setTimeout(renderItemsList,0);
  const el=$('#obslist');
  if(!S.obs.length&&!S.shapes.length){el.innerHTML='<p class="empty">Aucun obstacle. Choisissez « Obstacle » dans « Ajouter sur la carte » : un point (bâtiment, arbre), une forme dessinée ou une ligne (mur, haie existante).</p>';return}
  el.innerHTML=S.shapes.map(sh=>`<div class="ob" data-sid="${sh.id}"><span class="sw${sh.kind==='obsLine'?' line':''}" style="background:${TC[sh.kind]}"></span>
  <input data-f="name" value="${esc(sh.name)}" aria-label="Nom" style="width:9em">
  <select data-f="nat" aria-label="Nature">${Object.entries(SHNAT).map(([k,v])=>`<option value="${k}"${k===sh.nat?' selected':''}>${v}</option>`).join('')}</select>
  <label>Haut. <input type="number" data-f="h" value="${sh.h}" min="0.3" max="150" step="0.1"> m</label>
  <span class="rel">${sh.kind==='obsPoly'?nf(areaLL(sh.pts))+' m²':nf(lenLL(sh.pts),1)+' m'}</span><button data-f="del" aria-label="Supprimer">×</button></div>`).join('')+S.obs.map(o=>{const r=S.lat!=null?relObs(o):{dist:0,brg:0};return `<div class="ob" data-id="${o.id}"><span class="sw" style="background:${OBT[o.type].c}"></span>
  <select data-f="type" aria-label="Type">${Object.entries(OBT).map(([k,v])=>`<option value="${k}"${k===o.type?' selected':''}>${v.l}</option>`).join('')}</select>
  <label>Haut. <input type="number" data-f="h" value="${o.h}" min="0.5" max="150" step="0.5"> m</label>
  <label>Larg. <input type="number" data-f="w" value="${o.w}" min="0.5" max="150" step="0.5"> m</label>
  <span class="rel">${nf(r.dist)} m au ${card(r.brg)}</span><button data-f="del" aria-label="Supprimer l'obstacle">×</button></div>`}).join('');
}
$('#obslist').addEventListener('change',e=>{
  const sr=e.target.closest('[data-sid]');if(sr){const sh=S.shapes.find(x=>x.id==sr.dataset.sid),f=e.target.dataset.f;if(!sh)return;
    if(f==='h'){const v=parseFloat(e.target.value);if(v>0)sh.h=v}else if(f==='name')sh.name=e.target.value.slice(0,40);else if(f==='nat')sh.nat=e.target.value;itemsChanged(true);return}
  const row=e.target.closest('.ob');if(!row)return;const o=S.obs.find(x=>x.id==row.dataset.id);const f=e.target.dataset.f;
  if(f==='type'){o.type=e.target.value;o.h=OBT[o.type].h;o.w=OBT[o.type].w;styleObs(o);renderObs()}
  else if(f==='h'||f==='w'){const v=parseFloat(e.target.value);if(v>0){o[f]=v;styleObs(o)}}
  sunUpdate();
});
$('#obslist').addEventListener('click',e=>{
  if(e.target.dataset.f!=='del')return;
  const sr=e.target.closest('[data-sid]');if(sr){S.shapes=S.shapes.filter(x=>x.id!=sr.dataset.sid);itemsChanged(true);return}const row=e.target.closest('.ob');const i=S.obs.findIndex(x=>x.id==row.dataset.id);
  if(i<0)return;map.removeLayer(S.obs[i].circle);map.removeLayer(S.obs[i].marker);S.obs.splice(i,1);renderObs();sunUpdate();
});
const SHAPE_MODES={obsPoly:3,obsLine:2,bed:3,hedge:2,lawn:3,pond:3,vine:2,talus:3,potager:3,orchard:3,measure:2};
const TC={erase:'#9e9e9e',site:'#e3a018',obs:'#b06a35',obsPoly:'#7a4a24',obsLine:'#4e342e',bed:'#ff8f00',hedge:'#2f7d32',fruit:'#c2185b',vine:'#6a1b9a',lawn:'#7cb342',pond:'#1e6fa8',talus:'#d84315',potager:'#00897b',orchard:'#f06292',measure:'#212121'};
const TOOLS=[['site','Placer le site (point d’étude)','pt'],['g','Obstacles (ombre portée)'],['obs','Obstacle ponctuel (bâtiment, arbre)','pt'],['obsPoly','Obstacle : forme dessinée (bâtiment, abri)','area'],['obsLine','Obstacle : ligne (mur, haie existante)','line'],
 ['g','Aménagements'],['bed','Massif de plantation (forme)','area'],['hedge','Haie à planter (ligne)','line'],['fruit','Arbre fruitier (point)','pt'],['orchard','Verger (forme)','area'],['potager','Potager (forme)','area'],['vine','Vigne palissée (ligne)','line'],['lawn','Pelouse (forme)','area'],['pond','Pièce d’eau (forme)','area'],['talus','Talus existant (forme)','area'],['g','Outils'],['measure','Mesurer une distance','line'],['erase','Gomme : cliquer un élément pour le supprimer','pt']];
const swatch=(v,k)=>`<span class="sw ${k==='line'?'line':k==='pt'?'pt':''}" style="background:${TC[v]}"></span>`;
$('#tlist').innerHTML=TOOLS.map(t=>t[0]==='g'?`<li class="grp" role="presentation">${t[1]}</li>`:`<li role="presentation"><button type="button" role="option" data-v="${t[0]}">${swatch(t[0],t[2])}<span>${t[1]}</span></button></li>`).join('');
$('#maplegend').innerHTML='<b class="lgt">Légende</b>'+TOOLS.filter(t=>t[0]!=='g'&&t[0]!=='measure').map(t=>`<span>${swatch(t[0],t[2])}${t[1].replace(/ \((forme|ligne|point)\)$/,'').replace(' (point d’étude)','')}</span>`).join('')+'<span><span class="sw line" style="background:#d7263d"></span>Limite cadastrale</span><span><span class="sw" style="background:#0b0f0c;opacity:.45"></span>Ombre portée</span>';
$('#tool').innerHTML=TOOLS.filter(t=>t[0]!=='g').map(t=>`<option value="${t[0]}">${t[1]}</option>`).join('');
const closeTools=()=>{$('#tlist').hidden=true;$('#tbtn').setAttribute('aria-expanded','false')};
$('#tbtn').addEventListener('click',()=>{const o=$('#tlist').hidden;$('#tlist').hidden=!o;$('#tbtn').setAttribute('aria-expanded',String(o));if(o){const cur=$('#tlist [aria-selected=true]')||$('#tlist button');cur&&cur.focus()}});
$('#tlist').addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(!b)return;closeTools();setMode(b.dataset.v);$('#tbtn').focus()});
document.addEventListener('click',e=>{if(!e.target.closest('#tsel'))closeTools()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#tlist').hidden){closeTools();$('#tbtn').focus()}});
const SHNAT={bat:'Bâtiment / abri',mur:'Mur / clôture pleine',haie:'Haie persistante',caduc:'Haie ou arbres caducs'};
const HINT={site:'Cliquez sur la carte ou déplacez le repère jaune pour choisir le point d’étude. Utilisez « Ajouter sur la carte » pour les obstacles et les aménagements.',
  obs:'Obstacle ponctuel : chaque clic ajoute un obstacle du type choisi (réglez sa hauteur et sa largeur dans « Soleil et ombres »).',
  obsPoly:'Obstacle dessiné : cliquez les angles du bâtiment ou de l’abri, puis « Terminer ». Donnez-lui ensuite un nom et une hauteur dans « Soleil et ombres ».',
  obsLine:'Obstacle linéaire : cliquez le long du mur ou de la haie existante, puis « Terminer ». Donnez-lui ensuite un nom et une hauteur.',
  bed:'Massif : cliquez les sommets dans l’ordre, puis « Terminer ». Cliquez ensuite un côté pour le désigner : fond (mur, haie) → fond + limite de propriété → limite seule → normal.',
  hedge:'Haie à planter : cliquez le début, les angles et la fin de la haie, puis « Terminer ». La longueur et le nombre de plants sont calculés.',
  fruit:'Arbre fruitier : cliquez l’emplacement de chaque arbre (vous pourrez le déplacer). Choisissez l’espèce et la forme dans « Haies, fruitiers, eau ».',
  vine:'Vigne : cliquez le long du mur ou du palissage, puis « Terminer ».',
  lawn:'Pelouse : cliquez le contour, puis « Terminer ».',
  pond:'Pièce d’eau : cliquez le contour, puis « Terminer ».',
  talus:'Talus : cliquez le contour du talus, puis « Terminer » : la pente est estimée à partir du relief.',
  potager:'Potager : cliquez le contour de la zone de culture, puis « Terminer ». Réglez ensuite bacs, pleine terre ou serre dans l’onglet « Potager ».',
  orchard:'Verger : cliquez le contour de la zone du verger, puis « Terminer ». Le nombre d’arbres et les variétés sont proposés dans l’onglet « Verger ».',
  measure:'Mesure : cliquez des points le long du trajet ; la distance s’affiche. « Terminer » pour arrêter.',
  erase:'Gomme : cliquez sur un obstacle, un massif ou un élément tracé pour le supprimer. Choisissez un autre outil pour arrêter.'};
function setMode(m){
  S.mode=m;$('#tool').value=m;const shape=m in SHAPE_MODES;
  const T=TOOLS.find(t=>t[0]===m);if(T){$('#tlab').textContent=T[1];$('#tsw').outerHTML=swatch(m,T[2]).replace('class="sw','id="tsw" class="sw');document.querySelectorAll('#tlist button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v===m)))}
  $('#obsType').hidden=m!=='obs';
  $('#map').classList.toggle('adding',m!=='site');$('#finishBed').hidden=!shape;$('#undoPt').hidden=!shape;$('#clearBed').hidden=!S.bed||shape;
  shape?map.doubleClickZoom.disable():map.doubleClickZoom.enable();
  S.drawPts=[];drawTemp();
  $('#maphint').textContent=HINT[m];
}
$('#tool').addEventListener('change',e=>setMode(e.target.value));setTimeout(()=>setMode('site'),0);
$('#drawBed2').addEventListener('click',()=>{setMode('bed');showTab('carte',true)});
document.querySelectorAll('.xbtns [data-tool]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.tool);showTab('carte',true)}));
$('#finishBed').addEventListener('click',finishShape);
$('#undoPt').addEventListener('click',()=>{S.drawPts.pop();drawTemp()});
$('#clearBed').addEventListener('click',()=>{S.bed=null;bedLayer.clearLayers();plantLayer.clearLayers();setMode('site');renderCompo()});
$('#island').addEventListener('change',()=>{if(S.bed){S.bed.island=$('#island').checked;drawBed();renderCompo()}});
$('#showPlan').addEventListener('change',()=>renderCompo());

/* ---------- Massif dessiné ---------- */
let tempLayer=L.layerGroup().addTo(map);
function addDrawPt(lat,lng){if(typeof snapPt==='function')[lat,lng]=snapPt(lat,lng);S.drawPts.push([lat,lng]);drawTemp()}
function drawTemp(){tempLayer.clearLayers();if(!S.drawPts.length)return;const cl=SHAPE_MODES[S.mode]===3,sm=S.curve&&S.drawPts.length>=(cl?3:2)&&typeof crSpline==='function'?crSpline(S.drawPts,cl&&S.drawPts.length>2):S.drawPts;
  L.polyline(sm.concat(S.drawPts.length>2&&cl?[sm[0]]:[]),{color:TC[S.mode]||'#e3a018',weight:3,dashArray:'6 6',interactive:false}).addTo(tempLayer);
  S.drawPts.forEach(p=>L.circleMarker(p,{radius:5,color:'#fff',weight:2,fillColor:TC[S.mode]||'#e3a018',fillOpacity:1,interactive:false}).addTo(tempLayer));}
function finishBed(){
  if(S.drawPts.length<3){$('#maphint').textContent='Il faut au moins 3 points pour fermer la forme.';return}
  S.bed={raw:S.drawPts.slice(),rawEdges:S.drawPts.map(()=>0),smooth:!!S.curve,island:false};bedRegeom();$('#island').checked=false;
  const c=S.bed.ll.reduce((a,p)=>[a[0]+p[0]/S.bed.ll.length,a[1]+p[1]/S.bed.ll.length],[0,0]);
  S.drawPts=[];drawTemp();setMode('site');drawBed();showTab('massif',false);
  const geo=bedGeo();$('#surf').value=Math.round(geo.area);
  if(S.lat==null||Math.hypot((c[0]-S.lat)*111320,(c[1]-S.lon)*111320*Math.cos(c[0]*R))>30)setSite(c[0],c[1],false,true);else{if(!S.parcel||!pip(c[1],c[0],S.parcel.ring))loadParcel(c[0],c[1]);renderCompo()}
}
function bedGeo(){
  const b=S.bed,lat0=b.ll[0][0],lng0=b.ll[0][1],k=111320,kc=k*Math.cos(lat0*R);
  const poly=b.ll.map(([la,ln])=>[(ln-lng0)*kc,(la-lat0)*k]);
  const toLL=(x,y)=>[lat0+y/k,lng0+x/kc],fromLL=(la,ln)=>[(ln-lng0)*kc,(la-lat0)*k];
  return{poly,area:polyArea(poly),toLL,fromLL};
}
function backIdx(geo){
  const b=S.bed;if(b.island)return -1;
  const man=b.edges.findIndex(s=>s===1||s===2);if(man>=0)return man;
  let best=-1,bd=3;const P=geo.poly;
  for(const o of obsAll()){const [ox,oy]=geo.fromLL(o.lat,o.lng);
    P.forEach((a,i)=>{const bb=P[(i+1)%P.length],d=segDist(ox,oy,a[0],a[1],bb[0],bb[1])-o.w/2;if(d<bd){bd=d;best=i}})}
  return best;
}
const EDGE_ST=['Côté libre','Fond (mur, haie)','Fond + limite de propriété','Limite de propriété'];
function drawBed(){
  bedLayer.clearLayers();if(!S.bed)return;
  const geo=bedGeo(),bi=backIdx(geo),bs=bi>=0?backSet(bi,S.bed.ll.length):[],ll=S.bed.ll;
  L.polygon(ll,{color:TC.bed,weight:1,fillColor:TC.bed,fillOpacity:.08,interactive:false}).addTo(bedLayer);
  ll.forEach((p,i)=>{const q=ll[(i+1)%ll.length],s=S.bed.edges[i],isB=bs.includes(i),isL=s===2||s===3;
    const pl=L.polyline([p,q],{color:isB?'#8a5a35':isL?'#d7263d':TC.bed,weight:isB?9:isL?6:5,opacity:.95,dashArray:isL&&!isB?'8 6':null}).addTo(bedLayer);
    pl.bindTooltip(EDGE_ST[s]+(isB&&s===0?' (détecté : obstacle proche)':'')+' · cliquez pour changer',{sticky:true});
    pl.on('click',e=>{L.DomEvent.stopPropagation(e);if(S.mode==='erase'){delItem('bed',0);return}if(S.mode!=='site')return;const E=S.bed.rawEdges,ri=S.bed.seg2raw?S.bed.seg2raw[i]:i;E[ri]=(E[ri]+1)%4;bedRegeom();S.bed.island=false;$('#island').checked=false;drawBed();renderCompo()});
  });
  $('#clearBed').hidden=S.mode==='draw';
  if(typeof renderItemsList==='function')renderItemsList();
}

/* ---------- Plan de plantation ---------- */
function speciesColor(p){if(p.t==='fougere')return '#3f7d4a';if(p.t==='graminee')return '#d6bd86';const c=p.c.find(x=>x!=='vert')||p.c[0];return c&&COL[c]?COL[c][1]:'#86a85f'}
function layout(r){
  if(!S.bed)return null;
  const geo=bedGeo(),P=geo.poly,n=P.length,bi=backIdx(geo),rand=rng(Math.round(geo.area*1000)+r.key.length);
  const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const cs=Math.max(0.25,Math.sqrt(geo.area/900));
  const cells=[];for(let x=x0+cs/2,ix=0;x<x1;x+=cs,ix++)for(let y=y0+cs/2,iy=0;y<y1;y+=cs,iy++)if(pip(x,y,P))cells.push({x,y,ix,iy,sp:null,g:null});
  if(!cells.length)return null;
  const cx=cells.reduce((s,c)=>s+c.x,0)/cells.length,cy=cells.reduce((s,c)=>s+c.y,0)/cells.length;
  const limits=[];P.forEach((a,i)=>{const s=S.bed.edges[i];if(s===2||s===3)limits.push([a,P[(i+1)%n]])});
  let parcelPoly=null;if(S.parcel){parcelPoly=S.parcel.ring.map(([lo,la])=>geo.fromLL(la,lo));parcelPoly.forEach((a,i)=>limits.push([a,parcelPoly[(i+1)%parcelPoly.length]]))}
  const edgeD=(x,y)=>Math.min(...P.map((a,i)=>segDist(x,y,a[0],a[1],P[(i+1)%n][0],P[(i+1)%n][1])));
  const limD=(x,y)=>limits.length?Math.min(...limits.map(([a,b])=>segDist(x,y,a[0],a[1],b[0],b[1]))):99;
  let A,B,ux,uy;const bset=bi>=0?backSet(bi,n):[],dispo=S.dispo||'forme';
  if(bi>=0){let best=-1;const vs=[...new Set(bset.flatMap(i=>[i,(i+1)%n]))];vs.forEach(a=>vs.forEach(b=>{const d=Math.hypot(P[a][0]-P[b][0],P[a][1]-P[b][1]);if(d>best){best=d;A=P[a];B=P[b]}}));
    if(!(best>0.05)){A=P[bi];B=P[(bi+1)%n]}const l=Math.hypot(B[0]-A[0],B[1]-A[1])||1;ux=(B[0]-A[0])/l;uy=(B[1]-A[1])/l}
  const segD=(x,y,idx)=>Math.min(...idx.map(i=>segDist(x,y,P[i][0],P[i][1],P[(i+1)%n][0],P[(i+1)%n][1]))),others=P.map((_,i)=>i).filter(i=>!bset.includes(i));
  for(const c of cells){
    c.e=edgeD(c.x,c.y);
    if(bi>=0){c.lat=(c.x-A[0])*ux+(c.y-A[1])*uy;
      if(dispo==='rangs')c.d=Math.abs((c.x-A[0])*uy-(c.y-A[1])*ux);else{c.d=segD(c.x,c.y,bset);c.f=others.length?segD(c.x,c.y,others):c.d}}
    else{c.d=Math.hypot(c.x-cx,c.y-cy);c.lat=Math.atan2(c.y-cy,c.x-cx)}
  }
  const maxD=Math.max(...cells.map(c=>c.d))||1,maxE=Math.max(...cells.map(c=>c.e))||1;
  cells.forEach(c=>c.t=dispo==='rangs'?c.d/maxD:bi>=0?c.d/(c.d+c.f+1e-6):1-c.e/maxE);
  const depth=bi>=0?maxD:2*maxD;
  const strip=bi>=0&&depth>1.5?0.4:0;
  if(strip)cells.forEach(c=>{if(c.d<strip)c.sp='strip'});
  const rows=r.rows.map((x,i)=>({...x,i}));
  let free=cells.filter(c=>!c.sp);
  if(r.st.mineral){const s=[...free].sort((a,b)=>b.t-a.t),k=Math.round(s.length*r.st.mineral);s.slice(0,k).forEach(c=>c.sp='gravel');free=free.filter(c=>!c.sp)}
  let gid=0;
  const line=rows.find(x=>x.m==='line');
  if(line){free.forEach(c=>{if(c.e<0.45){if(limD(c.x,c.y)<0.5)c.sp='legal';else{c.sp=line.i;c.g='line'}}});free=free.filter(c=>c.sp==null)}
  const herb=rows.filter(x=>x.m==='area');
  if(herb.length&&free.length){
    if(r.key==='nw'){
      const mat=herb.filter(x=>x.p.t==='graminee'),str=herb.filter(x=>x.p.t!=='graminee'&&x.p.h>=0.7).sort((a,b)=>b.p.h-a.p.h),pon=herb.filter(x=>!mat.includes(x)&&!str.includes(x));
      const tot=herb.reduce((s,x)=>s+x.qty/x.p.d,0);
      const base=mat.length?mat:herb;
      free.forEach(c=>{const k=Math.floor((c.x+c.y)/2.5);c.sp=base[((k%base.length)+base.length)%base.length].i;c.g='m'+(k%base.length)});
      const taken=new Set();
      str.forEach(x=>{const need=Math.round(free.length*(x.qty/x.p.d)/tot),nc=Math.max(1,Math.min(3,Math.round(need/14)));
        for(let k=0;k<nc;k++){const band=free.filter(c=>!taken.has(c)&&(x.p.h>=1.2?c.t<0.6:c.t>0.15));const pool=band.length?band:free.filter(c=>!taken.has(c));if(!pool.length)break;
          const ctr=pool[Math.floor(rand()*pool.length)],m=Math.ceil(need/nc),g='s'+(gid++);
          pool.map(c=>[c,Math.hypot(c.x-ctr.x,c.y-ctr.y)]).sort((a,b)=>a[1]-b[1]).slice(0,m).forEach(([c])=>{c.sp=x.i;c.g=g;taken.add(c)})}});
      pon.forEach(x=>{const need=Math.max(3,Math.round(free.length*(x.qty/x.p.d)/tot));for(let k=0;k<need;k++){const pool=free.filter(c=>!taken.has(c));if(!pool.length)break;const c=pool[Math.floor(rand()*pool.length)];c.sp=x.i;c.g='p'+(gid++);taken.add(c)}});
    }else if(dispo==='naturel'&&r.key!=='fr'){natDrifts(free,herb,{rand,back:bi>=0,ux,uy})
    }else{
      const items=herb.map(x=>({x,a:x.qty/x.p.d})).sort((a,b)=>b.x.p.h-a.x.p.h),tot=items.reduce((s,v)=>s+v.a,0)||1;
      const jit=r.key==='nat'||r.key==='eco'?0.25:r.key==='ang'||r.key==='viv'?0.08:0;
      free.forEach(c=>c.k=c.t+(jit?(rand()-.5)*jit:0));free.sort((a,b)=>a.k-b.k);
      const nz=Math.min(3,items.length),groups=[];let cur=[],acc=0;
      items.forEach((it,i)=>{cur.push(it);acc+=it.a;if(groups.length<nz-1&&acc>=tot*(groups.length+1)/nz&&items.length-i-1>=nz-groups.length-1){groups.push(cur);cur=[]}});
      if(cur.length)groups.push(cur);
      let idx=0;
      groups.forEach((g,gi)=>{
        const ga=g.reduce((s,v)=>s+v.a,0),cnt=gi===groups.length-1?free.length-idx:Math.round(free.length*ga/tot);
        const zone=free.slice(idx,idx+cnt).sort((a,b)=>a.lat-b.lat);idx+=cnt;
        const span=zone.length?(bi>=0?zone[zone.length-1].lat-zone[0].lat:10):0;
        const reps=r.key!=='fr'&&r.key!=='gra'&&g.length>=2&&span>8?2:1,seq=[];
        for(let k=0;k<reps;k++)(k%2?[...g].reverse():g).forEach(it=>seq.push({it,a:it.a/reps}));
        const sa=seq.reduce((s,v)=>s+v.a,0)||1;let j=0;
        seq.forEach((s,si)=>{const m=si===seq.length-1?zone.length-j:Math.round(zone.length*s.a/sa),g2='z'+(gid++);zone.slice(j,j+m).forEach(c=>{c.sp=s.it.x.i;c.g=g2});j+=m});
      });
    }
  }
  const blds=S.obs.filter(o=>o.type==='bat').map(o=>[...geo.fromLL(o.lat,o.lng),o.w/2]);
  const pts=[];
  rows.filter(x=>x.m==='count').sort((a,b)=>b.p.h-a.p.h).forEach(x=>{
    const isTree=x.p.t==='arbre',climb=x.p.rose&&x.p.rose.g==='grimpant'&&bi>=0,pruned=r.key==='fr'||r.key==='gra'||(r.key==='jap'&&x.p.pers);let rad=climb?0.9:isTree?Math.min(x.p.h*0.3,6):pruned?0.5:Math.max(0.4,Math.min(x.p.h*0.4,2.5,depth*0.3));
    const minLim=x.p.h>=2?2:0.5;
    let cand;
    if(climb){cand=cells.filter(c=>c.d<0.7&&c.sp!=='gravel').sort((a,b)=>a.lat-b.lat)}
    else if(r.key==='fr'&&!isTree){cand=P.map(([vx,vy])=>{const dx=cx-vx,dy=cy-vy,l=Math.hypot(dx,dy)||1;return{x:vx+dx/l*0.7,y:vy+dy/l*0.7}});}
    else{const tt=isTree?(bi>=0?0.18:0):(bi>=0?0.3:0.35);
      cand=cells.filter(c=>c.sp!=='strip'&&c.sp!=='gravel'&&Math.abs(c.t-tt)<0.15&&c.e>=Math.min(rad*0.6,1));
      cand.sort((a,b)=>a.lat-b.lat)}
    cand=cand.filter(c=>limD(c.x,c.y)>=minLim);
    if(isTree)cand=cand.filter(c=>blds.every(b=>Math.hypot(c.x-b[0],c.y-b[1])-b[2]>=5));
    const q=x.qty;let placed=0;
    for(let k=0;k<cand.length&&placed<q;k++){
      const c=cand[Math.min(cand.length-1,Math.floor((placed+.5)*cand.length/q)+(k-placed))];if(!c)break;
      if(pts.some(p=>Math.hypot(p.x-c.x,p.y-c.y)<(p.rad+rad)*0.9))continue;
      pts.push({x:c.x,y:c.y,rad,i:x.i,p:x.p});placed++;
    }
    x.placed=placed;
  });
  const outside=parcelPoly?cells.filter(c=>!pip(c.x,c.y,parcelPoly)).length/cells.length:0;
  return{geo,cells,cs,pts,rows,bi,bset,depth,strip,limits,cx,cy,limD,parcelPoly,outside,dispo};
}
function backSet(bi,n){const E=S.bed.edges,man=E.map((v,i)=>v===1||v===2?i:-1).filter(i=>i>=0);if(man.length)return man;
  const m=S.bed.seg2raw;return m?m.map((r,i)=>r===m[bi]?i:-1).filter(i=>i>=0):[bi]}
function natDrifts(free,herb,o){
  const items=herb.map(x=>({x,a:x.qty/x.p.d})).sort((a,b)=>b.x.p.h-a.x.p.h),tot=items.reduce((s,v)=>s+v.a,0)||1,N=free.length;if(!N)return;
  const per=N/Math.max(1,items.length*2.2),drifts=[];
  items.forEach((it,ri)=>{const nn=Math.max(1,Math.round(N*it.a/tot)),k=Math.max(1,Math.min(4,Math.round(nn/per))),tt=items.length>1?ri/(items.length-1):0.5;
    for(let j=0;j<k;j++){const want=Math.min(0.95,Math.max(0.03,tt*0.9+0.05+(o.rand()-.5)*0.35));
      let pool=free.filter(c=>Math.abs(c.t-want)<0.12&&!drifts.some(d=>d.c===c));if(!pool.length)pool=free;
      drifts.push({c:pool[Math.floor(o.rand()*pool.length)],i:it.x.i,cap:nn/k,w:1,ang:o.rand()*Math.PI,n:0})}});
  const dist=(c,d)=>{const dx=c.x-d.c.x,dy=c.y-d.c.y;if(o.back){const u=dx*o.ux+dy*o.uy,v=-dx*o.uy+dy*o.ux;return Math.hypot(u/2.2,v)}const ca=Math.cos(d.ang),sa=Math.sin(d.ang);return Math.hypot((dx*ca+dy*sa)/1.8,-dx*sa+dy*ca)};
  const asg=new Array(N);
  for(let it=0;it<14;it++){drifts.forEach(d=>d.n=0);
    free.forEach((c,ci)=>{let bj=0,bv=1e18;for(let j=0;j<drifts.length;j++){const v=dist(c,drifts[j])/drifts[j].w;if(v<bv){bv=v;bj=j}}asg[ci]=bj;drifts[bj].n++});
    drifts.forEach(d=>{d.w*=Math.pow((d.cap+1)/(d.n+1),0.35)})}
  free.forEach((c,ci)=>{c.sp=drifts[asg[ci]].i;c.g='n'+asg[ci]});
  const at=new Map(free.map(c=>[c.ix+','+c.iy,c])),sw=[];
  free.forEach(c=>{const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>at.get((c.ix+a)+','+(c.iy+b))).filter(q=>q&&q.sp!==c.sp);if(nb.length&&o.rand()<0.22)sw.push([c,nb[Math.floor(o.rand()*nb.length)].sp])});
  sw.forEach(([c,sp])=>{c.sp=sp});
}
function drawPlan(r,Lg){
  const box=$('#plan'),sv=box.querySelector('svg'),W=box.clientWidth,H=box.clientHeight;
  if(!Lg){sv.innerHTML=W?`<text x="${W/2}" y="${H/2-8}" text-anchor="middle">Dessinez la forme du massif sur la carte</text><text x="${W/2}" y="${H/2+12}" text-anchor="middle">pour obtenir le plan de plantation.</text>`:'';$('#plegend').innerHTML='';return}
  if(!W)return;
  const P=Lg.geo.poly,xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const m=26,sc=Math.min((W-2*m)/((x1-x0)||1),(H-2*m-14)/((y1-y0)||1)),ox=(W-(x1-x0)*sc)/2,oy=(H-14-(y1-y0)*sc)/2;
  const X=x=>ox+(x-x0)*sc,Y=y=>oy+(y1-y)*sc,cw=Lg.cs*sc+0.6;
  let g=`<defs><clipPath id="bedclip"><polygon points="${P.map(p=>X(p[0])+','+Y(p[1])).join(' ')}"/></clipPath></defs><g clip-path="url(#bedclip)">`;
  const col=i=>seasonColor(Lg.rows[i].p,Lg.rows[i].col);
  for(const c of Lg.cells){const f=c.sp==='strip'?'#a88e6c':c.sp==='gravel'?'#cfc9bc':c.sp==='legal'?'#f1d4d4':c.sp==null?'#6b5640':col(c.sp);g+=`<rect x="${(X(c.x)-cw/2).toFixed(1)}" y="${(Y(c.y)-cw/2).toFixed(1)}" width="${cw.toFixed(1)}" height="${cw.toFixed(1)}" fill="${f}"/>`}
  g+='</g>';
  P.forEach((a,i)=>{const b=P[(i+1)%P.length],s=S.bed.edges[i],isB=(Lg.bset||[Lg.bi]).includes(i),isL=s===2||s===3;g+=`<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${isB?'var(--soil)':isL?'#c0392b':'var(--ink)'}" stroke-width="${isB?7:isL?3:1.5}"${isL&&!isB?' stroke-dasharray="6 4"':''}/>`;
    if(i===Lg.bi)g+=`<text x="${(X(a[0])+X(b[0]))/2}" y="${(Y(a[1])+Y(b[1]))/2-8}" text-anchor="middle" class="lbl">Fond : mur / haie</text>`});
  const groups={};Lg.cells.forEach(c=>{if(typeof c.sp==='number'&&c.g!=='line'){const k=c.g;(groups[k]||(groups[k]={i:c.sp,x:0,y:0,n:0}));groups[k].x+=c.x;groups[k].y+=c.y;groups[k].n++}});
  const minN=Math.max(3,Lg.cells.length/120);
  Object.values(groups).forEach(gr=>{if(gr.n<minN)return;g+=`<text x="${X(gr.x/gr.n)}" y="${Y(gr.y/gr.n)+4}" text-anchor="middle" class="lbl">${gr.i+1}</text>`});
  Lg.pts.forEach(p=>{g+=`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${Math.max(5,p.rad*sc)}" fill="${seasonColor(p.p,Lg.rows[p.i].col)}" fill-opacity=".55" stroke="#fff" stroke-width="1.5"/><circle cx="${X(p.x)}" cy="${Y(p.y)}" r="2.5" fill="#1a1a1a"/><text x="${X(p.x)}" y="${Y(p.y)-6}" text-anchor="middle" class="lbl">${p.i+1}</text>`});
  if(Lg.parcelPoly)g+=`<polygon points="${Lg.parcelPoly.map(p=>X(p[0])+','+Y(p[1])).join(' ')}" fill="none" stroke="#d7263d" stroke-width="2" stroke-dasharray="7 5"/>`;
  if(Lg.bi<0)g+=`<text x="${W/2}" y="${H-24}" text-anchor="middle">Massif isolé : les plus hautes au centre</text>`;
  const sb=[1,2,5,10,20,50].find(v=>v*sc>=60)||50;g+=`<line x1="${m}" y1="${H-10}" x2="${m+sb*sc}" y2="${H-10}" stroke="var(--ink)" stroke-width="3"/><text x="${m+sb*sc+6}" y="${H-6}">${sb} m</text>`;
  g+=`<path d="M${W-20},${m-6} l6,16 l-6,-4 l-6,4 Z" fill="var(--ink)"/><text x="${W-20}" y="${m+24}" text-anchor="middle">N</text>`;
  sv.innerHTML=g;
  const shown=new Set([...Lg.cells.map(c=>c.sp).filter(v=>typeof v==='number'),...Lg.pts.map(p=>p.i)]);
  $('#plegend').innerHTML=Lg.rows.filter(x=>shown.has(x.i)).map(x=>`<div><b>${x.i+1}</b><span class="dot" style="background:${seasonColor(x.p,x.col)}"></span>${esc(x.p.n)}</div>`).join('')+(Lg.strip?`<div><b></b><span class="dot" style="background:#a88e6c"></span>Bande de pied de mur (paillage)</div>`:'')+(r.st.mineral?`<div><b></b><span class="dot" style="background:#cfc9bc"></span>Minéral (gravier, pierres)</div>`:'')+(Lg.cells.some(c=>c.sp==='legal')?`<div><b></b><span class="dot" style="background:#f1d4d4"></span>Recul légal de 0,5 m</div>`:'')+(Lg.parcelPoly?`<div><b></b><span class="dot" style="background:#d7263d"></span>Limite cadastrale</div>`:'');
}
function drawPlantsOnMap(Lg){
  plantLayer.clearLayers();if(!Lg||!$('#showPlan').checked)return;
  const h=Lg.cs/2;
  for(const c of Lg.cells){if(c.sp==null)continue;const f=c.sp==='strip'?'#a88e6c':c.sp==='gravel'?'#cfc9bc':c.sp==='legal'?'#f1d4d4':speciesColor(Lg.rows[c.sp].p);
    L.rectangle([Lg.geo.toLL(c.x-h,c.y-h),Lg.geo.toLL(c.x+h,c.y+h)],{renderer:cv,stroke:false,fillColor:f,fillOpacity:.75,interactive:false}).addTo(plantLayer)}
  Lg.pts.forEach(p=>L.circle(Lg.geo.toLL(p.x,p.y),{renderer:cv,radius:p.rad,color:'#fff',weight:1.5,fillColor:speciesColor(p.p),fillOpacity:.6,interactive:false}).addTo(plantLayer));
}
function principles(r,Lg){
  const out=[],add=(s,t,d)=>out.push({s,t,d}),c=cond();
  const herb=r.rows.filter(x=>x.m!=='count'),tall=herb.reduce((a,x)=>!a||x.p.h>a.p.h?x:a,null);
  if(Lg){
    add('ok','Étagement des hauteurs',Lg.bi>=0?'Plantes placées de la plus petite (devant) à la plus grande (contre le fond).':'Massif isolé : les plus hautes au centre, les plus basses en bordure, lisible de tous les côtés.');
    if(tall){const lim=Lg.depth/2;add(tall.p.h<=lim*1.15?'ok':'ko','Proportion hauteur / profondeur',tall.p.h<=lim*1.15?`Plus haute plante ${nf(tall.p.h,1)} m pour ${nf(Lg.depth,1)} m de profondeur : la plus haute plante ne dépasse pas la moitié de la profondeur.`:`${tall.p.n} (${nf(tall.p.h,1)} m) dépasse la moitié de la profondeur (${nf(Lg.depth,1)} m). Élargissez le massif à ${nf(tall.p.h*2,1)} m ou réduisez la hauteur maximale dans les filtres.`)}
    if(Lg.strip)add('ok','Pied de mur ou de haie','Une bande de 40 cm est laissée en paillage : cette zone est sèche, abritée de la pluie, en concurrence avec les racines, et doit rester accessible.');
    const legal=Lg.pts.filter(p=>p.p.h>=2);
    const bad=Lg.rows.filter(x=>x.m==='count'&&(x.placed||0)<x.qty);
    if(bad.length)add('ko','Place pour les arbres et arbustes',`Le massif ne permet pas de placer tous les ligneux en respectant leur envergure, les distances légales et 5 m des bâtiments pour les arbres : ${bad.map(x=>`${x.p.n} (${x.placed||0}/${x.qty})`).join(', ')}. Agrandissez la forme ou retirez-les.`);
    if(Lg.limits.length){
      const lig=Lg.pts.map(p=>({p,d:Lg.limD(p.x,p.y),min:p.p.h>=2?2:0.5}));const viol=lig.filter(x=>x.d<x.min-0.01);
      const src=S.parcel?`Limite issue du cadastre (parcelle ${S.parcel.id||'identifiée'}), précision indicative, sans valeur de bornage.`:'Limite désignée à la main sur le massif.';
      const det=lig.length?' '+lig.map(x=>`${x.p.p.n} : ${nf(x.d,1)} m (min. ${nf(x.min,1)} m)`).join(' · ')+'.':'';
      add(viol.length?'ko':'ok','Distances légales (Code civil, art. 3.133)',(viol.length?'Distances non respectées.':'Arbres de 2 m ou plus à au moins 2 m de la limite (mesuré au milieu du tronc), autres arbres, arbustes et haies à au moins 0,5 m.')+det+' '+src+(Lg.cells.some(c=>c.sp==='legal')?' La bordure taillée s’arrête à 0,5 m de la limite.':''));
      if(Lg.outside>0.02)add('ko','Massif hors de la parcelle',`${nf(Lg.outside*100)} % du massif dépasse la limite cadastrale : vérifiez le tracé ou obtenez l’accord écrit du voisin.`);
    }
    else if(legal.length)add('in','Distances légales de plantation','Parcelle cadastrale non trouvée : désignez la limite de propriété en cliquant sur un côté du massif. Un arbre de 2 m ou plus doit être à 2 m de la limite (mesuré au milieu du tronc), les autres plantations à 0,5 m.');
    const trees=Lg.pts.filter(p=>p.p.t==='arbre'),blds=S.obs.filter(o=>o.type==='bat').map(o=>({o,xy:Lg.geo.fromLL(o.lat,o.lng)}));
    trees.forEach(t=>blds.forEach(b=>{const d=Math.hypot(t.x-b.xy[0],t.y-b.xy[1])-b.o.w/2;if(d<5)add('ko','Arbre trop près d’un bâtiment',`${t.p.n} est à environ ${nf(Math.max(0,d),1)} m d’un bâtiment : risque pour les fondations et ombre sur la façade. Comptez au moins 5 m.`)}));
  }
  const months=new Set();r.rows.forEach(x=>x.p.f.forEach(m=>months.add(m)));
  if(r.cset)add('in','Harmonie de couleurs',harmTxt());
  if(r.custom){const area=r.rows.filter(x=>x.m==='area').reduce((s,x)=>s+x.qty/(x.p.d||1),0),pl=r.planted;add(area>=pl*0.8&&area<=pl*1.25?'ok':'ko','Densité de plantation',`Vos vivaces, graminées et fougères couvrent ${nf(area,1)} m² pour ${nf(pl,1)} m² à planter${area<pl*0.8?' : ajoutez des plantes ou augmentez les quantités, sinon les herbes indésirables s’installeront.':area>pl*1.25?' : c’est trop dense, réduisez les quantités.':'.'}`)}
  if(r.tgt){const miss=r.tgt.filter(m=>!months.has(m)),y=r.tgt.length===12;
    add(!miss.length?'ok':(['fr','jap','gra'].includes(r.key)&&!y)?'in':'ko',y?'Floraison toute l’année':'Floraison sur 7 mois',!miss.length?(y?'Objectif atteint : des fleurs chaque mois, hiver compris.':'Objectif atteint : des fleurs chaque mois d’avril à octobre.'):`Mois sans fleurs : ${miss.map(m=>MOL[m-1]).join(', ')}. ${r.custom?'Ajoutez une plante qui fleurit à ce moment (voir le calendrier de floraison).':'Aucune plante adaptée au site et à vos filtres ne fleurit alors : élargissez les couleurs, l’harmonie ou la hauteur.'}`)}
  else add(months.size>=6?'ok':(r.key==='fr'||r.key==='jap'||r.key==='gra'||r.key==='viv')?'in':'ko','Floraison étalée',months.size>=6?`Des fleurs pendant ${months.size} mois de l’année.`:`Floraison concentrée sur ${months.size} mois : ajoutez des plantes de printemps ou d’automne (filtre « En fleur en »).`);
  const winter=r.rows.some(x=>x.p.pers||x.p.t==='graminee');
  add(winter?'ok':'ko','Intérêt en hiver',winter?'Persistants et/ou graminées gardent une structure en hiver.':'Rien ne reste en hiver : ajoutez un persistant ou une graminée.');
  const sp=r.rows.length,shares=herb.map(x=>x.qty/x.p.d),tot=shares.reduce((a,b)=>a+b,0)||1,mx=Math.max(0,...shares)/tot;
  add(r.key==='fr'||r.key==='jap'||r.key==='gra'?'in':sp>=5&&(mx<=0.45||r.key==='nw')?'ok':'ko','Diversité et résilience',r.key==='fr'||r.key==='jap'||r.key==='gra'?`${sp} espèces : ce style repose volontairement sur peu d’espèces. Variez les bordures ou remplissages d’un compartiment à l’autre pour limiter les risques sanitaires (pyrale du buis…).`:sp>=5?`${sp} espèces, aucune ne domine excessivement (hors matrice voulue).`:`Seulement ${sp} espèce(s) : un massif plus diversifié résiste mieux aux maladies et aux ravageurs.`);
  add('ok','Groupes et rythme',r.key==='tal'?'Plantation dense en quinconce, arbustes répartis sur toute la pente, couvre-sols entre eux.':r.key==='gra'?'Grands blocs monospécifiques aux contours nets, persistants taillés répétés pour le rythme.':r.key==='viv'?'Petits fruits au fond, légumes vivaces et aromatiques regroupés par besoins, fleurs compagnes en bordure.':r.key==='jap'?'Composition asymétrique et sobre : quelques sujets taillés, des masses de fougères et de graminées, et le minéral pour le vide.':r.key==='fr'?'Répétition symétrique d’une seule plante par compartiment, bordée de persistants taillés.':r.key==='nw'?'Une matrice de graminées, des vivaces structurantes en groupes, des ponctuations dispersées.':'Vivaces en groupes de 3, 5 ou 7 pieds (nombres impairs), taches répétées le long du massif.');
  add('ok','Couverture du sol','Les densités de plantation permettent de couvrir le sol en 2 saisons, ce qui réduit le désherbage et l’érosion.');
  const lim=r.rows.filter(x=>x.score<65);
  add(lim.length?'ko':'ok','La bonne plante au bon endroit',lim.length?`À surveiller : ${lim.map(x=>x.p.n).join(', ')} (conditions limites).`:`Toutes les plantes conviennent à : ${EXL[c.expo].toLowerCase()}, sol ${SL[c.sol].toLowerCase()}, ${WL[c.eau].toLowerCase()}, pH ${nf(c.ph,1)}.`);
  if(S.fill&&S.fill.on)add(S.fill.nat==='veg'?'in':'ko','Remblai',fillAdvice()[1]||'');
  const so=soilNow();if(so)add('in','Préparation du sol',so.cat==='a'?'Sol lourd : ne pas le travailler mouillé, incorporer 3–5 cm de compost avant de planter, éviter le tassement.':so.cat==='s'?'Sol léger : incorporer du compost et pailler dès la plantation pour garder l’humidité.':'Sol limoneux : travailler en surface seulement, puis couvrir aussitôt (paillage) contre la battance.');
  S.lastChecks=out;
  $('#checks').innerHTML=out.map(o=>`<li><span class="st ${o.s}">${o.s==='ok'?'OK':o.s==='ko'?'À revoir':'Info'}</span><b>${esc(o.t)}</b><span>${esc(o.d)}</span></li>`).join('');
}

/* ---------- Soleil ---------- */
function selDate(){const v=$('#date').value.split('-').map(Number);return v.length===3&&v[0]?v:[new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate()]}
function selTime(){const [y,m,d]=selDate(),mn=+$('#time').value;return new Date(y,m-1,d,0,mn).getTime()}
function dayHours(y,mo,d){let free=0,real=0;for(let m=0;m<1440;m+=10){const sp=sunPos(new Date(y,mo,d,0,m).getTime(),S.lat,S.lon);if(sp.alt>0){free+=10;if(!blocked(sp,mo+1))real+=10}}return{free:free/60,real:real/60}}
function computeStats(){
  if(S.lat==null)return null;
  const y=selDate()[0];let s=0;for(let m=3;m<=8;m++)s+=dayHours(y,m,15).real;
  const g=s/6;return{grow:g,cls:g>=6?'s':g>=3?'m':'o'};
}
function readout(){
  const el=$('#readout');const mn=+$('#time').value;$('#timeout').textContent=String(Math.floor(mn/60)).padStart(2,'0')+':'+String(mn%60).padStart(2,'0');
  if(S.lat==null){el.innerHTML='<span>Placez un site pour calculer la position du soleil.</span>';return}
  const sp=sunPos(selTime(),S.lat,S.lon);const [y,m,d]=selDate();const dh=dayHours(y,m-1,d);
  const sh=sp.alt>0.5?1/Math.tan(sp.alt*R):null;
  el.innerHTML=`<span>Hauteur du soleil <b>${nf(sp.alt,1)}°</b></span><span>Azimut <b>${nf(sp.az)}° (${card(sp.az)})</b></span><span>Ombre d’un objet de 1 m <b>${sh==null?'nuit':nf(sh,1)+' m'}</b></span><span>Durée du jour <b>${nf(dh.free,1)} h</b></span><span>Soleil direct sur le site ce jour <b>${nf(dh.real,1)} h</b></span>`+(sp.alt<=0?'<span>Le soleil est sous l’horizon à cette heure.</span>':'');
}
function drawShadows(){
  shadowLayer.clearLayers();if(S.lat==null||(!S.obs.length&&!S.shapes.length))return;
  const sp=sunPos(selTime(),S.lat,S.lon);if(sp.alt<=0.5)return;
  const dir=(sp.az+180)*R,ux=Math.sin(dir),uy=Math.cos(dir);
  for(const o of S.obs){
    const len=Math.min(o.h/Math.tan(sp.alt*R),400),r=o.w/2,pts=[];
    if(o.type==='bat'){for(const [a,b] of [[-r,-r],[r,-r],[r,r],[-r,r]]){pts.push([a,b]);pts.push([a+ux*len,b+uy*len])}}
    else{for(let i=0;i<24;i++){const t=i/24*2*Math.PI,a=Math.cos(t)*r,b=Math.sin(t)*r;pts.push([a,b]);pts.push([a+ux*len,b+uy*len])}}
    const k=111320,kc=k*Math.cos(o.lat*R);
    const ll=hull(pts).map(([e,n])=>[o.lat+n/k,o.lng+e/kc]);
    L.polygon(ll,{stroke:false,fillColor:'#0b0f0c',fillOpacity:o.type==='caduc'?.28:.4,interactive:false}).addTo(shadowLayer);
  }
  for(const sh of S.shapes){
    const o=sh.pts[0],len=Math.min(sh.h/Math.tan(sp.alt*R),400),P=sh.pts.map(p=>toXY(o,p)),k=111320,kc=k*Math.cos(o[0]*R),toL=([e,n])=>[o[0]+n/k,o[1]+e/kc],st={stroke:false,fillColor:'#0b0f0c',fillOpacity:sh.nat==='caduc'?.28:.4,interactive:false};
    if(sh.kind==='obsPoly'){const pts=[];P.forEach(([a,b])=>{pts.push([a,b]);pts.push([a+ux*len,b+uy*len])});L.polygon(hull(pts).map(toL),st).addTo(shadowLayer)}
    else for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];L.polygon([a,b,[b[0]+ux*len,b[1]+uy*len],[a[0]+ux*len,a[1]+uy*len]].map(toL),st).addTo(shadowLayer)}
  }
}
function renderSeasons(){
  const t=$('#seasons');if(S.lat==null){t.innerHTML='';$('#expotxt').textContent='';return}
  const y=selDate()[0];const rows=[['20 mars',2,20],['21 juin',5,21],['22 septembre',8,22],['21 décembre',11,21]];
  t.innerHTML='<thead><tr><th>Date</th><th class="n">Jour (h)</th><th class="n">Soleil direct (h)</th></tr></thead><tbody>'+rows.map(([l,m,d])=>{const h=dayHours(y,m,d);return `<tr><td>${l}</td><td class="n">${nf(h.free,1)}</td><td class="n">${nf(h.real,1)}</td></tr>`}).join('')+'</tbody>';
  const st=S.stats;
  $('#expotxt').innerHTML=st?`D’avril à septembre, le site reçoit en moyenne <b>${nf(st.grow,1)} h</b> de soleil direct par jour : <b>${EXL[st.cls].toLowerCase()}</b> (plein soleil à partir de 6 h, mi-ombre entre 3 et 6 h). Les arbres caducs sont considérés sans feuilles de novembre à mars.`:'';
}
function sunUpdate(){S.samples=null;S.stats=computeStats();renderSeasons();readout();drawShadows();drawSunPath();renderObs();refreshPlants()}
function drawSunPath(){
  const box=$('#sunpath'),s=box.querySelector('svg'),W=box.clientWidth,H=box.clientHeight;
  if(!W||S.lat==null){s.innerHTML=W?`<text x="${W/2}" y="${H/2}" text-anchor="middle">Placez un site</text>`:'';return}
  const m={l:36,r:12,t:12,b:28},center=S.lat>=0?180:0,rel=a=>((a-center+540)%360)-180,X0=-140,X1=140;
  const X=a=>m.l+(rel(a)-X0)/(X1-X0)*(W-m.l-m.r);
  const ymax=Math.min(90,Math.ceil((90-Math.abs(S.lat)+23.5+4)/10)*10),Y=h=>H-m.b-(Math.max(0,h)/ymax)*(H-m.t-m.b);
  let g='';
  for(let a=0;a<=ymax;a+=10)g+=`<line class="gl${a===0?' z':''}" x1="${m.l}" x2="${W-m.r}" y1="${Y(a)}" y2="${Y(a)}"/>`+(a%20===0?`<text x="${m.l-6}" y="${Y(a)+4}" text-anchor="end">${a}°</text>`:'');
  COMPASS.forEach((c,i)=>{const r=rel(i*45);if(r>=X0&&r<=X1)g+=`<line class="gl" x1="${X(i*45)}" x2="${X(i*45)}" y1="${m.t}" y2="${H-m.b}"/><text x="${X(i*45)}" y="${H-8}" text-anchor="middle">${c}</text>`});
  for(const o of obsAll()){const r=relObs(o),d=Math.max(r.dist,.5),hw=d<=o.w/2?60:Math.atan(o.w/2/d)/R,ang=Math.atan(o.h/d)/R;
    const a1=rel(r.brg-hw),a2=rel(r.brg+hw);if(a2<X0||a1>X1||a1>a2)continue;
    const x1=X(r.brg-hw<0&&center===0?r.brg-hw+360:r.brg-hw);const x2=x1+(2*hw)/(X1-X0)*(W-m.l-m.r);
    g+=`<rect x="${Math.max(m.l,x1)}" y="${Y(Math.min(ang,ymax))}" width="${Math.max(0,Math.min(W-m.r,x2)-Math.max(m.l,x1))}" height="${Y(0)-Y(Math.min(ang,ymax))}" fill="${OBT[o.type].c}" opacity="${o.type==='caduc'?.45:.7}" rx="2"/>`}
  const y=selDate()[0],[sy,sm,sd]=selDate();
  const path=(yy,mo,d)=>{let segs=[],cur=[];for(let mn=0;mn<=1440;mn+=6){const sp=sunPos(new Date(yy,mo,d,0,mn).getTime(),S.lat,S.lon),r=rel(sp.az);if(sp.alt>-0.5&&r>=X0&&r<=X1)cur.push(`${X(sp.az).toFixed(1)},${Y(sp.alt).toFixed(1)}`);else if(cur.length){segs.push(cur);cur=[]}}if(cur.length)segs.push(cur);return segs};
  const draw=(segs,col,w,dash)=>segs.map(c=>`<polyline points="${c.join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"${dash?' stroke-dasharray="5 4"':''}/>`).join('');
  g+=draw(path(y,5,21),'var(--sun)',2.5)+draw(path(y,2,20),'var(--mute)',1.5,1)+draw(path(y,11,21),'var(--rain)',2.5)+draw(path(sy,sm-1,sd),'var(--ink)',2);
  for(let h=6;h<=20;h+=2){const sp=sunPos(new Date(sy,sm-1,sd,h,0).getTime(),S.lat,S.lon);if(sp.alt>2&&Math.abs(rel(sp.az))<X1)g+=`<text x="${X(sp.az)}" y="${Y(sp.alt)-7}" text-anchor="middle" style="fill:var(--ink)">${h}h</text>`}
  const sp=sunPos(selTime(),S.lat,S.lon);
  if(sp.alt>0&&Math.abs(rel(sp.az))<=X1){const bl=blocked(sp,sm);g+=`<circle cx="${X(sp.az)}" cy="${Y(sp.alt)}" r="8" fill="${bl?'var(--mute)':'var(--sun)'}" stroke="var(--card)" stroke-width="2"/>`}
  s.innerHTML=g;
}
$('#time').addEventListener('input',()=>{readout();drawShadows();drawSunPath()});
$('#date').addEventListener('change',()=>sunUpdate());
document.querySelectorAll('.quick button').forEach(b=>b.addEventListener('click',()=>{$('#date').value=new Date().getFullYear()+'-'+b.dataset.d;sunUpdate()}));

/* ---------- Données en ligne ---------- */
async function fetchClim(lat,lon){
  const key='plantania:clim2:'+lat.toFixed(3)+','+lon.toFixed(3);
  try{const c=localStorage.getItem(key);if(c)return JSON.parse(c)}catch(e){}
  const u=`https://archive-api.open-meteo.com/v1/archive?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&start_date=1995-01-01&end_date=2024-12-31&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration,wind_speed_10m_max,wind_direction_10m_dominant,et0_fao_evapotranspiration&timezone=auto`;
  const r=await fetch(u);
  if(!r.ok){let msg='';try{msg=(await r.json()).reason}catch(e){}throw new Error(msg||'HTTP '+r.status)}
  const c=procClim(await r.json());
  try{localStorage.setItem(key,JSON.stringify(c))}catch(e){}
  return c;
}
async function fetchSoil(lat,lon){
  const u=`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon.toFixed(5)}&lat=${lat.toFixed(5)}&property=clay&property=sand&property=silt&property=phh2o&property=soc&depth=0-5cm&depth=5-15cm&depth=15-30cm&value=mean`;
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),20000);
  let r;try{r=await fetch(u,{signal:ctl.signal})}finally{clearTimeout(tm)}
  if(!r.ok)throw new Error('le service a répondu '+r.status);
  const j=await r.json(),out={};
  for(const L of j.properties.layers){const f=(L.unit_measure&&L.unit_measure.d_factor)||1;let s=0,w=0;
    for(const d of L.depths){const v=d.values.mean;if(v==null)continue;const th=d.range?d.range.bottom_depth-d.range.top_depth:1;s+=v/f*th;w+=th}
    out[L.name]=w?s/w:null}
  if(out.clay==null||out.sand==null)throw new Error('pas de donnée à cet endroit (zone bâtie ou eau)');
  const t=out.clay+out.sand+(out.silt||0);
  return {clay:out.clay*100/t,sand:out.sand*100/t,silt:(out.silt||0)*100/t,ph:out.phh2o,soc:out.soc,src:'api'};
}
const BE={s:49.49,n:51.51,w:2.54,e:6.41},BXL={s:50.763,n:50.914,w:4.244,e:4.482};
const inBox=(b,la,lo)=>la>=b.s&&la<=b.n&&lo>=b.w&&lo<=b.e;
async function getJSON(u,ms=15000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(u,{signal:c.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}}
const BTEX={Z:{n:'Sable',f:[92,5,3],cat:'s'},S:{n:'Sable limoneux',f:[75,18,7],cat:'s'},P:{n:'Limon sableux léger',f:[60,30,10],cat:'s'},L:{n:'Limon sableux',f:[40,45,15],cat:'l'},A:{n:'Limon',f:[12,72,16],cat:'l'},E:{n:'Argile',f:[15,45,40],cat:'a'},U:{n:'Argile lourde',f:[10,30,60],cat:'a'},G:{n:'Limon caillouteux',f:[25,55,20],cat:'l'},V:{n:'Tourbe',f:[30,50,20],cat:'l'}};
const BDR={a:'excessif (sol sec)',b:'favorable',c:'modéré',d:'imparfait',e:'assez pauvre (sol humide)',f:'pauvre (sol mouillé)',g:'très pauvre (sol détrempé)',h:'assez pauvre, nappe perchée',i:'pauvre, nappe perchée'};
const DRSHIFT={a:-1,b:0,c:0,d:0,e:1,f:1,g:1,h:1,i:1};
function parseSigle(sig,tex,dr){
  let t=(tex||'').trim(),d=(dr||'').trim().toLowerCase();
  const m=/([ZSPLAEUGV])([a-i])/.exec(sig||'');
  if(!(t.length===1&&BTEX[t]))t=m?m[1]:null;
  if(!(d.length===1&&BDR[d]))d=m?m[2]:null;
  return{t,d};
}
async function soilWallonie(lat,lon){
  const j=await getJSON(`https://geoservices.wallonie.be/arcgis/rest/services/SOL_SOUS_SOL/CNSW/MapServer/2/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=SIGLE_PEDO,MAT_TEXT,DRAINAGE,TYPE_SOL_250,LEGENDE&returnGeometry=false&f=json`);
  const a=j.features&&j.features[0]&&j.features[0].attributes;if(!a)throw new Error('hors Wallonie');
  const {t,d}=parseSigle(a.SIGLE_PEDO,a.MAT_TEXT,a.DRAINAGE);
  return{src:'cnsw',sigle:a.SIGLE_PEDO||'',t,d,desc:a.TYPE_SOL_250||'',link:a.LEGENDE||''};
}
async function soilFlandre(lat,lon){
  const e=0.0005;
  const j=await getJSON(`https://www.dov.vlaanderen.be/geoserver/bodemkaart/wms?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=bodemkaart:bodemtypes&query_layers=bodemkaart:bodemtypes&styles=&srs=EPSG:4326&bbox=${lon-e},${lat-e},${lon+e},${lat+e}&width=101&height=101&x=50&y=50&info_format=application/json&feature_count=1`);
  const p=j.features&&j.features[0]&&j.features[0].properties;if(!p)throw new Error('hors Flandre');
  const {t,d}=parseSigle(p.Bodemtype,p.Textuurklasse_code,p.Drainageklasse_code);
  return{src:'dov',sigle:p.Bodemtype||'',t,d,desc:[p.Textuurklasse,p.Drainageklasse].filter(Boolean).join(' · '),link:p.Scan_toelichtingsboekje||''};
}
function regToSoil(r){if(!r||!r.t)return null;const b=BTEX[r.t];return{sand:b.f[0],silt:b.f[1],clay:b.f[2],ph:null,soc:null,src:r.src,belg:b.n,catB:b.cat,dr:r.d,sigle:r.sigle,desc:r.desc,link:r.link}}
function ringsFromGeo(g){if(!g)return[];if(g.type==='Polygon')return g.coordinates;if(g.type==='MultiPolygon')return g.coordinates.flat();if(g.rings)return g.rings;return[]}
const pickRing=(rings,lat,lon)=>rings.find(r=>pip(lon,lat,r))||null;
async function parcelWallonie(lat,lon){
  const j=await getJSON(`https://geoservices.wallonie.be/arcgis/rest/services/PLAN_REGLEMENT/CADMAP_PARCELLES/MapServer/0/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=CAPAKEY,NOM_COMMUNE&returnGeometry=true&outSR=4326&f=geojson`);
  const f=j.features&&j.features[0];if(!f)throw new Error('aucune parcelle');const ring=pickRing(ringsFromGeo(f.geometry),lat,lon);if(!ring)throw new Error('géométrie');
  return{ring,id:(f.properties||{}).CAPAKEY||'',src:'cadastre wallon (CADMAP, SPW / SPF Finances)'};
}
async function parcelFlandre(lat,lon){
  const e=0.0002;const j=await getJSON(`https://geo.api.vlaanderen.be/Adpf/ogc/features/collections/Adpf/items?f=application%2Fgeo%2Bjson&limit=50&bbox=${lon-e},${lat-e},${lon+e},${lat+e}`);
  for(const f of (j.features||[])){const ring=pickRing(ringsFromGeo(f.geometry),lat,lon);if(ring){const p=f.properties||{};return{ring,id:p.CAPAKEY||p.capakey||p.CaPaKey||p.OIDN||'',src:'percelen Adpf (Digitaal Vlaanderen)'}}}
  throw new Error('aucune parcelle');
}
async function parcelFederal(lat,lon){
  const d=0.001;const j=await getJSON(`https://ccff02.minfin.fgov.be/geoservices/arcgis/rest/services/WMS/Cadastral_Layers/MapServer/identify?geometry=${lon},${lat}&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=0&mapExtent=${lon-d},${lat-d},${lon+d},${lat+d}&imageDisplay=400,400,96&returnGeometry=true&f=json`);
  for(const r of (j.results||[])){const k=Object.keys(r.attributes||{}).find(k=>/capakey/i.test(k));if(!k||!r.geometry||!r.geometry.rings)continue;const ring=pickRing(r.geometry.rings,lat,lon);if(ring)return{ring,id:r.attributes[k],src:'plan parcellaire cadastral (SPF Finances – AGDP)'}}
  throw new Error('aucune parcelle');
}
let parcelTok=0;
function loadParcel(lat,lon){
  const tk=++parcelTok;S.parcel=null;S.parcelErr=null;drawParcel();
  if(!inBox(BE,lat,lon)){$('#parcelinfo').textContent='';return}
  $('#parcelinfo').textContent='Recherche de la parcelle cadastrale…';
  Promise.any([parcelWallonie(lat,lon),parcelFlandre(lat,lon),parcelFederal(lat,lon)])
    .then(p=>{if(tk!==parcelTok)return;S.parcel=p;drawParcel();renderCompo()})
    .catch(()=>{if(tk!==parcelTok)return;S.parcelErr=1;drawParcel();renderCompo()});
}
function drawParcel(){
  parcelLayer.clearLayers();const el=$('#parcelinfo');
  if(S.parcel){L.polygon(S.parcel.ring.map(([x,y])=>[y,x]),{color:'#d7263d',weight:3,fill:false,dashArray:'8 6',interactive:false}).addTo(parcelLayer);
    el.innerHTML=`Parcelle cadastrale <b>${esc(S.parcel.id||'identifiée')}</b> (trait rouge), source : ${esc(S.parcel.src)}. Ses limites servent aux distances légales de plantation. Le plan cadastral est indicatif (environ 1 m de précision) et n’a pas valeur de bornage.`}
  else if(S.parcelErr)el.textContent='Parcelle cadastrale introuvable ou services indisponibles : désignez la limite de propriété en cliquant sur un côté du massif.';
}
async function loadData(){
  const tok=++S.tok,lat=S.lat,lon=S.lon;
  S.clim=null;S.climErr=null;S.soilApi=null;S.soilErr=null;S.soilReg=null;
  $('#climstate').className='state';$('#climstate').textContent='Chargement de 30 ans de données climatiques…';
  $('#soilstate').className='state';$('#soilstate').textContent='Interrogation des cartes des sols régionales…';
  renderClim();renderSoil();
  fetchClim(lat,lon).then(c=>{if(tok!==S.tok)return;S.clim=c;renderClim();refreshPlants(true)}).catch(e=>{if(tok!==S.tok)return;S.climErr=/fetch|network|Load failed/i.test(e.message)?'connexion au service impossible (pas d’internet, ou fichier ouvert dans un aperçu qui bloque les données)':e.message;renderClim()});
  loadParcel(lat,lon);if(typeof loadPlace==='function')loadPlace(lat,lon);
  const reg=inBox(BXL,lat,lon)?'bxl':inBox(BE,lat,lon)?'be':'out';
  Promise.any([soilWallonie(lat,lon),soilFlandre(lat,lon)])
    .then(r=>{if(tok!==S.tok)return;S.soilReg=r;if(!r.t)S.soilErr='nodata';renderSoil();refreshPlants(true)})
    .catch(async()=>{if(tok!==S.tok)return;
      if(reg==='out'){try{S.soilApi=await fetchSoil(lat,lon)}catch(e){S.soilErr='soilgrids'}}
      else S.soilErr=reg==='bxl'?'bxl':'regional';
      if(tok!==S.tok)return;renderSoil();refreshPlants(true)});
}

/* ---------- Climat ---------- */
function renderClim(){
  const c=S.clim,st=$('#climstate');
  if(S.climErr){st.className='state err';st.textContent='Données climatiques indisponibles : '+S.climErr+'. Vérifiez la connexion puis recliquez sur le site.'}
  else if(c){st.className='state';st.textContent=`Données pour le point ${S.lat.toFixed(5)}, ${S.lon.toFixed(5)} (maille de la réanalyse ERA5 d’environ 10 à 25 km : deux adresses proches ont le même climat).`}
  if(!c){$('#kpis').innerHTML='';$('#sunbars').innerHTML='';$('#drynote').textContent='';drawOmbro();drawRose();return}
  const K=[['Pluie annuelle',nf(c.pYear)+' mm',''],['Température moyenne',nf(c.tYear,1)+' °C',`janv. ${nf(c.t[0],1)} · juil. ${nf(c.t[6],1)}`],
    ['Ensoleillement',c.sunYear==null?'–':nf(c.sunYear)+' h/an',''],['Zone de rusticité',usda(c.extMin),`min. annuel moyen ${nf(c.extMin,1)} °C`],
    ['Dernière gelée',doyTxt(c.lastFrost),'date médiane'],['Première gelée',doyTxt(c.firstFrost),'date médiane'],
    ['Bilan hydrique été',(c.summerBal>0?'+':'')+nf(c.summerBal)+' mm','pluie − ETP, juin à août'],['Vent',nf(c.windMean)+' km/h',`vent max. journalier moyen · dominant ${COMPASS[c.dir.indexOf(Math.max(...c.dir))]}`],
    ['Altitude',nf(c.elev)+' m','']];
  $('#kpis').innerHTML=K.map(([a,b,d])=>`<div class="kpi"><small>${a}</small><b>${b}</b><span>${d}</span></div>`).join('');
  const mx=Math.max(...c.sun.map(v=>v||0))||1;
  $('#sunbars').innerHTML=c.sun.map((v,i)=>`<div title="${MOL[i]} : ${nf(v)} h"><span>${nf(v)}</span><i style="height:${(v||0)/mx*80}%"></i>${MI[i]}</div>`).join('');
  const dry=c.p.map((p,i)=>p<2*c.t[i]?MOL[i]:null).filter(Boolean);
  $('#drynote').textContent=dry.length?`Mois secs au sens de Gaussen (P < 2T) : ${dry.join(', ')}.`:`Aucun mois sec au sens de Gaussen. Pourtant, l’évapotranspiration de juin à août dépasse la pluie de ${nf(Math.max(0,-c.summerBal))} mm : prévoyez du paillage et un arrosage la première année.`;
  drawOmbro();drawRose();
}
function drawOmbro(){
  const box=$('#ombro'),s=box.querySelector('svg'),c=S.clim,W=box.clientWidth,H=box.clientHeight;
  if(!c||!W){s.innerHTML='';return}
  const m={l:38,r:44,t:18,b:26},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const top=Math.max(Math.ceil(Math.max(...c.tx)/5)*5,Math.ceil(Math.max(...c.p)/2/5)*5),bot=Math.min(0,Math.floor(Math.min(...c.tn)/5)*5);
  const Y=t=>m.t+ih*(top-t)/(top-bot),bw=iw/12,X=i=>m.l+bw*i+bw/2;
  let g='';
  for(let t=bot;t<=top;t+=5)g+=`<line class="gl${t===0?' z':''}" x1="${m.l}" x2="${W-m.r}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${m.l-6}" y="${Y(t)+4}" text-anchor="end">${t}°</text>`+(t>=0?`<text x="${W-m.r+6}" y="${Y(t)+4}">${t*2}</text>`:'');
  g+=`<text x="${m.l-6}" y="10" text-anchor="end">°C</text><text x="${W-m.r+6}" y="10">mm</text>`;
  c.p.forEach((p,i)=>{const y=Y(p/2);g+=`<rect class="bar${p<2*c.t[i]?' dry':''}" x="${X(i)-bw*.32}" y="${y}" width="${bw*.64}" height="${Math.max(0,Y(0)-y)}" rx="2"><title>${MOL[i]} : ${nf(p)} mm</title></rect>`});
  const fr=c.tx.map((t,i)=>`${X(i)},${Y(t)}`).join(' '),bk=[...Array(12).keys()].reverse().map(i=>`${X(i)},${Y(c.tn[i])}`).join(' ');
  g+=`<polygon class="bnd" points="${fr} ${bk}"/><polyline class="tl" points="${c.t.map((t,i)=>`${X(i)},${Y(t)}`).join(' ')}"/>`;
  c.t.forEach((t,i)=>{g+=`<circle cx="${X(i)}" cy="${Y(t)}" r="3" fill="var(--warn)"><title>${MOL[i]} : ${nf(t,1)} °C (min ${nf(c.tn[i],1)}, max ${nf(c.tx[i],1)})</title></circle><text x="${X(i)}" y="${H-8}" text-anchor="middle">${W<480?MI[i]:MO[i]}</text>`});
  s.innerHTML=g;
}
function drawRose(){
  const box=$('#rose'),s=box.querySelector('svg'),c=S.clim,W=box.clientWidth,H=box.clientHeight;
  if(!c||!W){s.innerHTML='';return}
  const cx=W/2,cy=H/2,r=Math.min(W,H)/2-24,mx=Math.max(...c.dir)||1;let g='';
  [.33,.66,1].forEach(k=>g+=`<circle cx="${cx}" cy="${cy}" r="${r*k}" fill="none" class="gl"/>`);
  c.dir.forEach((f,i)=>{const a0=(i*45-18)*R,a1=(i*45+18)*R,L=r*f/mx;
    g+=`<path d="M${cx},${cy} L${cx+Math.sin(a0)*L},${cy-Math.cos(a0)*L} A${L},${L} 0 0 1 ${cx+Math.sin(a1)*L},${cy-Math.cos(a1)*L} Z" fill="var(--rain)" opacity="${.35+.6*f/mx}"><title>${COMPASS[i]} : ${nf(f*100)} % des jours</title></path>`;
    g+=`<text x="${cx+Math.sin(i*45*R)*(r+13)}" y="${cy-Math.cos(i*45*R)*(r+13)+4}" text-anchor="middle">${COMPASS[i]}</text>`});
  s.innerHTML=g;
}

/* ---------- Sol ---------- */
function soilNow(){const s=S.soilMan||regToSoil(S.soilReg)||S.soilApi;if(!s)return null;const cls=s.belg||texClass(s.sand,s.silt,s.clay);const ph=s.ph!=null?s.ph:(S.phMeas||null);const o=typeof applyFill==='function'?applyFill({...s,ph,cls}):{...s,ph,cls};return{...o,cat:o.catB||TEXCAT[o.cls]||TEXCAT[cls]}}
const SOILTXT={s:'Sol léger : il se réchauffe vite et se travaille facilement, mais il retient peu l’eau et les nutriments. Paillez, apportez du compost chaque année et choisissez des plantes résistantes à la sécheresse.',
  l:'Sol limoneux : fertile, avec une bonne réserve en eau. Il est sensible à la battance (croûte en surface) : ne le travaillez pas mouillé et gardez-le couvert (paillis, couvre-sols).',
  a:'Sol lourd : riche et frais, mais froid au printemps, collant quand il est mouillé et crevassé en été. Apportez de la matière organique, ne marchez pas dessus mouillé et évitez les plantes qui craignent l’excès d’eau.'};
function renderSoil(){
  const s=soilNow(),st=$('#soilstate');
  const RG=S.soilReg;
  if(S.soilMan){$('#soilsrc').textContent='Saisie manuelle (test de terrain)';st.className='state';st.textContent=''}
  else if(RG&&RG.t){$('#soilsrc').textContent=RG.src==='cnsw'?'Carte Numérique des Sols de Wallonie (SPW), 1:20 000':'Digitale bodemkaart van het Vlaams Gewest (DOV), 1:20 000';st.className='state';st.textContent=''}
  else if(S.soilApi){$('#soilsrc').textContent='Hors Belgique : SoilGrids 2.0 (carte mondiale, 250 m, estimation)';st.className='state';st.textContent=''}
  else if(S.soilErr){$('#soilsrc').textContent='';st.className='state err';
    st.textContent={nodata:`Zone bâtie, remaniée ou non cartographiée sur la carte des sols (sigle « ${RG&&RG.sigle||'?'} »). Renseignez votre sol avec le test de terrain ci-dessous.`,
      bxl:'Région bruxelloise : je n’ai trouvé aucun service en ligne qui publie la carte des sols pour Bruxelles. Renseignez votre sol avec le test de terrain ci-dessous ; Bruxelles Environnement propose aussi l’outil « Teste ton sol ».',
      regional:'Les cartes des sols régionales (Wallonie, Flandre) ne répondent pas. Vérifiez la connexion ou renseignez votre sol avec le test de terrain ci-dessous.',
      soilgrids:'Données de sol indisponibles pour ce lieu. Renseignez votre sol avec le test de terrain ci-dessous.'}[S.soilErr]||'';
    $('#manual').open=true}
  if(!s){$('#soilkpis').innerHTML='';$('#soiltxt').innerHTML='';drawTri();return}
  const K=s.belg?[['Texture',s.belg],['Drainage naturel',s.dr?BDR[s.dr]:'–'],['Sigle pédologique',s.sigle||'–'],['pH (eau)',s.ph?nf(s.ph,1):'à mesurer']]:[['Argile',nf(s.clay)+' %'],['Limon',nf(s.silt)+' %'],['Sable',nf(s.sand)+' %'],['pH (eau)',s.ph?nf(s.ph,1):'–']];
  if(s.soc!=null)K.push(['Matière organique','≈ '+nf(s.soc*1.72/10,1)+' %']);
  $('#soilkpis').innerHTML=K.map(([a,b])=>`<div class="kpi"><small>${a}</small><b>${b}</b></div>`).join('');
  const ph=s.ph?(s.ph<5.5?'Sol acide : idéal pour les plantes de terre de bruyère, à chauler pour un potager.':s.ph>7.5?'Sol calcaire : évitez les plantes acidophiles (azalées, hortensias bleus, bruyères).':'pH proche de la neutralité : convient à la grande majorité des plantes.'):'';
  const drTxt=s.dr&&'efghi'.includes(s.dr)?'<p>Drainage limité : l’eau stagne en hiver. Préférez des plantes de sol frais à humide, ou plantez sur butte.</p>':s.dr==='a'?'<p>Drainage excessif : le sol sèche vite en été. Paillez et choisissez des plantes de terrain sec.</p>':'';
  const reg=s.belg?`<p class="note">${s.desc?esc(s.desc)+'. ':''}Les pourcentages d’argile, de limon et de sable du triangle sont des valeurs typiques de la classe belge, à titre indicatif. La carte ne donne pas le pH : mesurez-le (kit de jardinerie) et saisissez-le ci-dessous.${/^https?:/.test(s.link)?` <a href="${esc(s.link)}" target="_blank" rel="noopener">Fiche de la légende</a>.`:''}</p>`:'';
  $('#soiltxt').innerHTML=`<h4 style="margin-bottom:6px">${esc(s.cls)}</h4><p>${SOILTXT[s.cat]}</p>${drTxt}<p>${ph}</p>${reg}`;
  drawTri();
}
function drawTri(){
  const box=$('#tri'),sv=box.querySelector('svg'),W=box.clientWidth,H=box.clientHeight;if(!W){return}
  const side=Math.min(W-60,(H-50)/0.866),x0=(W-side)/2,y0=H-28;
  const P=(si,cl)=>[x0+side*(si+cl/2)/100,y0-side*0.866*cl/100];
  let g='';
  for(let k=20;k<100;k+=20){const a=P(0,k),b=P(100-k,k),c=P(k,0),d=P(k,100-k),e=P(100-k,0),f=P(0,100-k);g+=`<line class="gl" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/><line class="gl" x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}"/><line class="gl" x1="${e[0]}" y1="${e[1]}" x2="${f[0]}" y2="${f[1]}"/>`}
  const A=P(0,0),B=P(100,0),C=P(0,100);
  g+=`<polygon points="${A} ${B} ${C}" fill="none" stroke="var(--ink)" stroke-width="1.5"/>`;
  g+=`<text x="${A[0]}" y="${A[1]+18}" text-anchor="middle">Sable</text><text x="${B[0]}" y="${B[1]+18}" text-anchor="middle">Limon</text><text x="${C[0]}" y="${C[1]-8}" text-anchor="middle">Argile</text>`;
  const s=soilNow();
  if(s){const [x,y]=P(s.silt,s.clay);g+=`<circle cx="${x}" cy="${y}" r="13" fill="var(--soil)" opacity=".25"/><circle cx="${x}" cy="${y}" r="6" fill="var(--soil)" stroke="var(--card)" stroke-width="2"/>`}
  sv.innerHTML=g;
}
function manVals(){const sa=+$('#mSand').value;let cl=+$('#mClay').value;if(sa+cl>100){cl=100-sa;$('#mClay').value=cl}$('#vSand').textContent=sa+' %';$('#vClay').textContent=cl+' % · limon '+(100-sa-cl)+' %';return{sand:sa,clay:cl,silt:100-sa-cl,ph:parseFloat($('#mPh').value)||6.8,soc:null,src:'man'}}
['mSand','mClay'].forEach(id=>$('#'+id).addEventListener('input',manVals));
$('#presets').addEventListener('click',e=>{const p=e.target.dataset.p;if(!p)return;const [sa,si,cl]=p.split(',').map(Number);$('#mSand').value=sa;$('#mClay').value=cl;manVals()});
$('#useMan').addEventListener('click',()=>{S.soilMan=manVals();renderSoil();refreshPlants(true)});
$('#useApi').addEventListener('click',()=>{S.soilMan=null;renderSoil();refreshPlants(true)});
$('#phform').addEventListener('submit',e=>{e.preventDefault();const v=parseFloat($('#phIn').value.replace(',','.'));S.phMeas=v>=3&&v<=10?v:null;if(S.soilMan&&S.phMeas)S.soilMan.ph=S.phMeas;renderSoil();refreshPlants(true)});

/* ---------- Plantes ---------- */
function autoEau(){const c=S.clim;let i=c?(c.summerBal<-180?0:c.summerBal<-60?1:2):1;const so=soilNow();if(so){if(so.dr)i+=DRSHIFT[so.dr]||0;if(so.sand>65)i--;else if(so.clay>35)i++}return 'dfh'[Math.max(0,Math.min(2,i))]}
function cond(){
  const so=soilNow(),aE=S.stats?S.stats.cls:'s',aW=autoEau(),aS=so?so.cat:'l',aP=so&&so.ph?Math.round(so.ph*10)/10:6.8;
  return{tmin:S.clim?S.clim.extMin:null,expo:S.ovr.expo==='auto'?aE:S.ovr.expo,eau:S.ovr.eau==='auto'?aW:S.ovr.eau,sol:S.ovr.sol==='auto'?aS:S.ovr.sol,ph:S.ovr.ph==='auto'?aP:+S.ovr.ph,aE,aW,aS,aP};
}
function renderConds(){
  const c=cond();
  const sel=(k,lab,cur,auto,opts)=>`<label class="cond">${lab}<b>${cur}</b><select data-k="${k}"><option value="auto"${S.ovr[k]==='auto'?' selected':''}>Auto (${auto})</option>${opts.map(([v,l])=>`<option value="${v}"${S.ovr[k]===v?' selected':''}>${l}</option>`).join('')}</select></label>`;
  $('#conds').innerHTML=`<div class="cond">Rusticité<b>${c.tmin!=null?'Zone '+usda(c.tmin):'—'}</b><span>${c.tmin!=null?'min. moyen '+nf(c.tmin,1)+' °C':'en attente du climat'}</span></div>`+
   sel('expo','Exposition',EXL[c.expo],EXL[c.aE],Object.entries(EXL))+
   sel('eau','Humidité du sol',WL[c.eau],WL[c.aW],Object.entries(WL))+
   sel('sol','Texture',SL[c.sol],SL[c.aS],Object.entries(SL))+
   sel('ph','pH',nf(c.ph,1),nf(c.aP,1),[['5.2','Acide (5,2)'],['6.2','Légèrement acide (6,2)'],['7','Neutre (7)'],['7.8','Calcaire (7,8)']]);
}
$('#conds').addEventListener('change',e=>{const k=e.target.dataset.k;if(!k)return;S.ovr[k]=e.target.value;refreshPlants(true)});
function passF(p,compo){
  if(F.colors.size){const flower=!compo||p.t==='vivace'||p.t==='annuelle'||(p.t==='arbuste'&&!p.pers);if(flower&&!p.c.some(x=>F.colors.has(x)))return false}
  if(F.fo!=='tous'&&!(F.fo==='pers'?p.pers:p.fo.includes(F.fo)))return false;
  if(F.port!=='tous'&&p.p!==F.port&&!(compo&&p.t==='arbre'))return false;
  if(!(compo&&p.t==='arbre')&&(p.h<F.hmin||p.h>F.hmax))return false;
  if(F.mois&&!(compo&&p.t!=='vivace'&&p.t!=='annuelle')&&!p.f.includes(F.mois))return false;
  if(!compo){if(F.type!=='tous'&&p.t!==F.type)return false;if(F.style!=='tous'&&!p.st.includes(F.style))return false}
  return true;
}
function scored(){const c=cond();return PL.map(p=>({p,...scorePlant(p,c)}))}
function dots(p){return p.c.map(x=>COL[x]?`<span class="dot" title="${COL[x][0]}" style="background:${COL[x][1]}"></span>`:'').join('')}
function flBar(p){const col=p.c[0]&&COL[p.c[0]]?COL[p.c[0]][1]:'var(--sun)';return `<div class="fl" style="--c:${col}" aria-label="Floraison">${MI.map((l,i)=>`<span class="${p.f.includes(i+1)?'on':''}">${l}</span>`).join('')}</div>`}
function renderPlants(){
  const all=scored(),ok=all.filter(x=>x.ok),list=ok.filter(x=>passF(x.p,false)).sort((a,b)=>b.score-a.score);
  $('#pcount').textContent=S.lat==null?'Placez un site pour filtrer les plantes.':`${list.length} plantes correspondent à vos critères · ${ok.length} sur ${PL.length} sont adaptées au site.`;
  $('#plist').innerHTML=list.length?list.map(x=>{const p=x.p;return `<article class="pc"><div class="pc-top"><span class="tag">${TL[p.t]}</span><span class="score" title="Adéquation ${x.score} %"><i style="width:${x.score}%"></i></span><b>${x.score}</b></div>
   <h4>${esc(p.n)}</h4><p class="lat">${esc(p.l)}</p>
   <div class="ph" data-ph="${esc(p.l)}" data-n="${esc(p.n)}"></div>
   <p class="meta">${nf(p.h,p.h<1?2:1)} m · ${PORT[p.p]} · feuillage ${p.fo.map(f=>FOL[f].toLowerCase()).join(', ')}${p.pers?', persistant':''}</p>
   ${p.c.length?`<div class="dots">${dots(p)}</div>`:''}${p.f.length?flBar(p):''}
   ${x.why.length?`<p class="warn">${x.why.map(esc).join(' · ')}</p>`:''}${p.t!=='annuelle'?`<button type="button" class="padd" data-add="${esc(p.l)}">+ Ajouter au massif</button>`:''}</article>`}).join(''):'<p class="empty">Aucune plante ne correspond. Élargissez les filtres ou changez les conditions.</p>';
  watchPhotos($('#plist'));
}

/* ---------- Composition ---------- */
function pickDiverse(list,k,ps){
  ps=ps||{months:new Set(),cols:new Set()};const picks=[],pool=[...list],tg=ps.tgt,W=m=>tg&&tg.length===12&&[11,12,1,2,3].includes(m)?2:1;
  while(picks.length<k&&pool.length){
    let bi=0,bv=-1e9;
    pool.forEach((x,i)=>{const nm=x.p.f.filter(m=>!ps.months.has(m)&&(!tg||tg.includes(m))).reduce((a,m)=>a+W(m),0),nc=x.p.c.some(c=>!ps.cols.has(c)&&(!ps.cset||ps.cset.has(c)))?1:0,v=x.score+5*nm+4*nc;if(v>bv){bv=v;bi=i}});
    const x=pool.splice(bi,1)[0];picks.push(x);x.p.f.forEach(m=>ps.months.add(m));x.p.c.forEach(c=>ps.cols.add(c));
  }
  return picks;
}
function compose(){
  if(S.bed){$('#surf').value=Math.round(bedGeo().area);$('#surf').disabled=true}else $('#surf').disabled=false;
  const key=S.style,st=STY[key],A=Math.max(2,parseFloat($('#surf').value)||15),c=cond(),cset=harmSet(),tgt=bloomTgt();
  const sc=scored();
  const pool=sc.filter(x=>x.ok&&x.p.t!=='annuelle'&&passF(x.p,true)&&colOk(x.p,cset)).sort((a,b)=>b.score-a.score);
  const perim=4*Math.sqrt(A),planted=A*(1-(st.mineral||0));
  if(S.pick==='perso'&&S.custom.length){
    const rows=[];S.custom.forEach(u=>{const p=PL.find(x=>x.l===u.l);if(!p)return;const z=sc.find(x=>x.p===p),m=p.t==='arbre'||(p.t==='arbuste'&&!p.d)?'count':'area';
      rows.push({role:'Mon choix',m,p,score:z.score,qty:u.qty,det:m==='area'?`${nf(u.qty/(p.d||1),1)} m² · ${p.d}/m²`:'pieds isolés',off:false,warn:z.ok?'':z.why.join(' · '),place:'',col:pickCol(p,cset),custom:1})});
    return{key,st,A,rows,empty:[],custom:1,tgt,cset,planted};
  }
  const used=new Set(),ps={months:new Set(),cols:new Set(),tgt,cset};
  const roles=st.roles.filter(r=>r.k(A)>0&&(!r.only||r.only(c))).map(r=>{
    const cand=pool.filter(x=>r.f(x.p)&&!used.has(x.p.l));let inS=cand.filter(x=>x.p.st.includes(key)),off=false;
    if(!inS.length){inS=cand;off=true}
    const picks=pickDiverse(inS,r.k(A),ps);picks.forEach(x=>used.add(x.p.l));return{...r,picks,off}});
  if(tgt&&(!['fr','gra','jap','medi'].includes(key)||S.bloom==='12')){
    for(let k=0;k<3;k++){const miss=tgt.filter(m=>!ps.months.has(m));if(!miss.length)break;
      const best=pool.filter(x=>!used.has(x.p.l)&&['vivace','arbuste','graminee'].includes(x.p.t)&&(x.p.t!=='arbuste'||A>=4)&&!(x.p.rose&&x.p.rose.g==='grimpant')&&x.p.h<=Math.max(1.5,Math.sqrt(A)/2))
        .map(x=>({x,v:x.p.f.filter(m=>miss.includes(m)).length*14+x.score/5+(x.p.st.includes(key)?6:0)})).filter(o=>o.v>=14).sort((a,b)=>b.v-a.v)[0];
      if(!best)break;const x=best.x;used.add(x.p.l);x.p.f.forEach(m=>ps.months.add(m));
      roles.push({r:'Floraison complémentaire (mois sans fleurs)',m:x.p.t==='arbuste'&&!x.p.d?'count':'area',sh:.06,k:()=>1,c:()=>1,picks:[x],off:!x.p.st.includes(key),gap:1})}
  }
  const ar=roles.filter(r=>r.m==='area'&&r.picks.length),tot=ar.reduce((s,r)=>s+r.sh,0)||1;
  const herb=planted*(roles.some(r=>r.m!=='area'&&r.picks.length)?0.85:1);
  const rows=[];
  for(const r of roles)for(const x of r.picks){
    let qty,det;
    if(r.m==='area'){const a=herb*r.sh/tot/r.picks.length;qty=Math.max(1,Math.round(a*x.p.d));if(key!=='fr'&&!(key==='nw'&&x.p.t==='graminee'))qty=oddify(qty);det=`${nf(a,1)} m² · ${x.p.d}/m²`}
    else if(r.m==='line'){qty=Math.round(perim*r.per);det=`≈ ${nf(perim)} m de bordure · ${r.per}/m`}
    else{qty=Math.max(1,Math.round(r.c(A)/r.picks.length));det='pieds isolés'}
    const place=(key==='ang'||key==='ros')&&x.p.t!=='arbre'?(x.p.h>=1?'Arrière':x.p.h>=0.5?'Milieu':'Devant'):'';
    rows.push({role:r.r,m:r.m,p:x.p,score:x.score,qty,det,off:r.off,place,col:pickCol(x.p,cset)});
  }
  const empty=st.roles.filter(r=>r.k(A)>0&&(!r.only||r.only(c))).filter(r=>!roles.find(x=>x.r===r.r&&x.picks.length)).map(r=>r.r);
  return{key,st,A,rows,empty,tgt,cset,planted};
}
function tasksFor(p,key){
  const T=[],c=S.clim,sow=c&&c.lastFrost?new Date(Date.UTC(2023,0,1)+(c.lastFrost+14)*864e5).getUTCMonth()+1:5;
  const nw=key==='nw';
  switch(p.t){
    case 'arbre':T.push([2,'Taille de formation légère (3 premières années)'],[4,'Pailler un cercle d’1 m au pied, vérifier le tuteur'],[7,'Arrosage profond si sec (50 L tous les 10 jours, 2–3 premières années)']);break;
    case 'arbuste':if(key==='fr'||(key==='jap'&&p.pers))break;
      if(p.pers)T.push([4,'Taille légère de mise en forme si besoin']);
      else if(p.f.length&&p.f[0]<=6)T.push([Math.min(12,p.f[p.f.length-1]+1),'Taille légère juste après la floraison']);
      else T.push([3,'Taille de fin d’hiver (fleurit sur le bois de l’année)']);break;
    case 'vivace':if(!nw){T.push([3,'Couper les tiges sèches au ras du sol']);if(p.f.length>=3&&key==='ang')T.push([p.f[1],'Supprimer les fleurs fanées pour prolonger la floraison'])}
      T.push([10,'Diviser les touffes tous les 3–4 ans']);break;
    case 'graminee':if(!nw)T.push([3,p.pers?'Peigner à la main pour retirer les feuilles sèches (ne pas rabattre)':'Rabattre à 10–15 cm avant la repousse']);T.push([11,'Laisser les épis l’hiver (structure, abri pour la faune)']);break;
    case 'fougere':T.push([3,p.pers?'Retirer les frondes abîmées avant la sortie des crosses':'Couper les vieilles frondes avant la sortie des crosses']);break;
    case 'annuelle':T.push([sow,'Semer ou planter après les dernières gelées'+(c&&c.lastFrost?' (médiane : '+doyTxt(c.lastFrost)+')':'')],[10,'Arracher après les premières gelées ; laisser grainer pour le ressemis']);break;
  }
  if(p.note&&p.noteM)T.push([p.noteM,p.note]);
  return T;
}
function renderCompo(){
  if(S.lat==null){$('#compo').innerHTML='';$('#cal').innerHTML='';$('#stydesc').textContent='Placez un site pour composer un massif.';return}
  const r=compose();S.lastCompo=r;
  const extra=r.st.mineral?` Ici, environ ${nf(r.st.mineral*100)} % de la surface est minérale (${nf(r.A*r.st.mineral,1)} m²).`:'';
  $('#stydesc').innerHTML=`<b>${r.st.l}.</b> ${r.st.d}${extra}`+(r.empty.length?` <span class="off">Aucune plante adaptée pour : ${r.empty.join(', ').toLowerCase()}.</span>`:'');
  drawBed();
  const Lg=S.bed?layout(r):null;S.lastLayout=Lg;
  if(S.bed&&Lg){const bi=Lg.bi;$('#bedinfo').innerHTML=`Forme dessinée : <b>${nf(Lg.geo.area,1)} m²</b>, profondeur ${nf(Lg.depth,1)} m. `+(bi>=0?(S.bed.edges[bi]?'Fond désigné : mur ou haie.':'Fond détecté automatiquement grâce à un obstacle proche.'):'Aucun fond : le massif est traité comme isolé, les plus hautes au centre.')+' Cliquez sur un côté sur la carte pour le changer.'}
  else $('#bedinfo').textContent='Aucune forme dessinée : la composition utilise la surface saisie. Dessinez le contour sur la carte pour obtenir un plan, avec les plus petites plantes devant et les plus grandes au fond.';
  drawPlan(r,Lg);if(typeof drawElev==='function')drawElev(r,Lg);drawPlantsOnMap(Lg);principles(r,Lg);
  const showPlace=(r.key==='ang'||r.key==='ros')&&!Lg&&!r.custom,cu=!!r.custom;
  const colCell=x=>{const many=x.p.c.filter(c=>c!=='vert'&&c!=='blond').length>1;return `<span class="dots" style="display:inline-flex">${dots(x.p)}</span> ${x.p.f.length?MO[x.p.f[0]-1]+(x.p.f.length>1?'–'+MO[x.p.f[x.p.f.length-1]-1]:''):''}${x.col&&COL[x.col]&&many?`<br><small>Choisir la variété à fleurs <b>${COL[x.col][0].toLowerCase()}</b></small>`:''}`};
  $('#compo').innerHTML=`<thead><tr><th>N°</th><th>Rôle</th><th>Plante</th>${showPlace?'<th>Place</th>':''}<th class="n">Quantité</th><th>Détail</th><th>Fleurs</th>${cu?'<th></th>':''}</tr></thead><tbody>`+
    r.rows.map((x,i)=>`<tr><td><b>${i+1}</b></td><td>${esc(x.role)}</td><td><div class="pcell"><div class="ph sm" data-ph="${esc(x.p.l)}" data-n="${esc(x.p.n)}" data-small="1"></div><div><b>${esc(x.p.n)}</b><br><i class="src">${esc(x.p.l)}</i>${x.off?' <span class="off">hors style</span>':''}${x.warn?`<br><span class="warn">${esc(x.warn)}</span>`:''}</div></div></td>${showPlace?`<td>${x.place}</td>`:''}<td class="n">${cu?`<input type="number" class="cuq" data-cu="${i}" min="1" max="999" value="${x.qty}" aria-label="Quantité">`:x.qty}</td><td>${x.det} · ${nf(x.p.h,x.p.h<1?2:1)} m</td><td>${colCell(x)}</td>${cu?`<td><button type="button" class="cudel" data-cu="${i}">Retirer</button></td>`:''}</tr>`).join('')+
    (r.rows.length?'':`<tr><td colspan="8" class="empty">${cu?'Votre liste est vide : ajoutez des plantes ci-dessous.':'Aucune plante ne convient avec ces filtres. Retirez des couleurs, changez l’harmonie ou élargissez la hauteur.'}</td></tr>`)+'</tbody>';
  if(typeof renderCompoExtras==='function')renderCompoExtras(r);
  const M=Array.from({length:12},()=>new Map());
  const add=(m,t,n)=>{const mp=M[(m-1+12)%12];if(!mp.has(t))mp.set(t,new Set());if(n)mp.get(t).add(n)};
  r.rows.forEach(x=>tasksFor(x.p,r.key).forEach(([m,t])=>add(m,t,x.p.n)));
  r.st.tasks.forEach(([m,t])=>add(m,t));
  add(6,'1re année : arroser copieusement une fois par semaine en cas de sécheresse');
  add(11,'Bonne période de plantation pour arbres, arbustes et vivaces (sol encore chaud)');
  watchPhotos($('#compo'));
  const SUP=supplies(r,Lg);S.lastSupplies=SUP;
  $('#supplies').innerHTML='<thead><tr><th>Fourniture</th><th class="n">Quantité</th><th>Conditionnement</th><th>Détail</th></tr></thead><tbody>'+SUP.map(x=>`<tr><td><b>${esc(x[0])}</b></td><td class="n">${esc(x[1])}</td><td>${esc(x[2])}</td><td>${esc(x[3])}</td></tr>`).join('')+'</tbody>';
  $('#cal').innerHTML=M.map((mp,i)=>mp.size?`<div class="mo"><h4>${MOL[i][0].toUpperCase()+MOL[i].slice(1)}</h4><ul>${[...mp].map(([t,ns])=>`<li>${esc(t)}${ns.size?` <em>— ${[...ns].map(esc).join(', ')}</em>`:''}</li>`).join('')}</ul></div>`:'').join('');
}
/* ---------- Photos ---------- */
const PHC={};
function photoKey(l){const s=l.replace(/\(.*?\)/g,'').replace(/'[^']*'/g,'').replace(/\bvar\..*$/,'').replace(/\s+/g,' ').trim(),w=s.split(' ');return(w[1]==='×'?w.slice(0,3):w.slice(0,2)).join(' ')}
async function getPhoto(latin){
  const q=photoKey(latin);if(PHC[q])return PHC[q];
  try{const c=JSON.parse(localStorage.getItem('plantania:ph:'+q));if(c&&c.src){PHC[q]=c;return c}}catch(e){}
  let res=null;
  try{const j=await getJSON(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&per_page=1&locale=fr`,10000);const t=j.results&&j.results[0];if(t&&t.default_photo&&t.default_photo.medium_url)res={src:t.default_photo.medium_url,credit:t.default_photo.attribution||'iNaturalist',link:'https://www.inaturalist.org/taxa/'+t.id}}catch(e){}
  if(!res){try{const j=await getJSON(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/ /g,'_'))}`,10000);if(j.thumbnail)res={src:j.thumbnail.source,credit:'Wikipédia / Wikimedia Commons',link:(j.content_urls&&j.content_urls.desktop&&j.content_urls.desktop.page)||''}}catch(e){}}
  if(res){PHC[q]=res;try{localStorage.setItem('plantania:ph:'+q,JSON.stringify(res))}catch(e){}}
  return res||{none:1};
}
async function fillPhoto(el){
  const r=await getPhoto(el.dataset.ph);if(!el.isConnected)return;
  if(r.none){el.classList.add('noph');el.innerHTML=el.dataset.small?'':'<span>Photo indisponible</span>';return}
  el.innerHTML=`<img src="${esc(r.src)}" alt="${esc(el.dataset.n||'')}" loading="lazy">`+(el.dataset.small?'':`<a class="credit" href="${esc(r.link)}" target="_blank" rel="noopener" title="${esc(r.credit)}">${esc(r.credit)}</a>`);
}
const phObs='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){phObs.unobserve(e.target);fillPhoto(e.target)}}),{rootMargin:'300px'}):null;
function watchPhotos(root){root.querySelectorAll('[data-ph]:not([data-done])').forEach(el=>{el.dataset.done=1;phObs?phObs.observe(el):fillPhoto(el)})}

/* ---------- Fournitures ---------- */
function supplies(r,Lg){
  const A=r.A,so=soilNow(),cat=so?so.cat:'l',key=r.key,c=cond();
  const minA=(r.st.mineral||0)*A,stripA=Lg&&Lg.strip?Lg.cells.filter(x=>x.sp==='strip').length*Lg.cs*Lg.cs:0,plantA=Math.max(0,A-minA-stripA);
  const out=[],sacs=(l,v)=>Math.max(1,Math.ceil(l/v));
  const nPl=r.rows.reduce((s,x)=>s+x.qty,0);
  const pots=r.rows.reduce((o,x)=>{const k=x.p.t==='arbre'?'arbres en conteneur ou racines nues':x.p.t==='arbuste'?'arbustes en conteneur 3–5 L':x.p.t==='annuelle'?'annuelles en mini-mottes ou sachets de graines':'vivaces, graminées et fougères en godets de 9 cm';o[k]=(o[k]||0)+x.qty;return o},{});
  out.push(['Plants à acheter',`${nPl}`,Object.entries(pots).map(([k,v])=>v+' '+k).join(' ; '),'Voir la liste détaillée de la composition']);
  let e=cat==='l'?0.03:0.05;if(S.fill&&S.fill.on&&S.fill.nat!=='veg')e=Math.max(e,0.08);if(key==='med')e=cat==='a'?0.03:0;if(so&&so.soc!=null&&so.soc*0.172>6)e=0.02;
  if(e>0){const l=plantA*e*1000;out.push(['Compost mûr (amendement)',`${nf(l)} L`,`${sacs(l,40)} sac(s) de 40 L`,`${nf(e*100)} cm incorporés sur ${nf(plantA,1)} m² (sol ${SL[cat].toLowerCase()})`])}
  else out.push(['Compost','—','—','Jardin sec : on garde volontairement un sol pauvre']);
  const per={arbre:60,arbuste:15,vivace:1,graminee:1,fougere:1,annuelle:0.5};let terr=0,bru=0;
  r.rows.forEach(x=>{const v=(x.p.t==='arbuste'&&key==='fr'?5:per[x.p.t])*x.qty;if(x.p.ph[1]<=6.2)bru+=v;else terr+=v});
  if(terr)out.push(['Terreau de plantation',`${nf(terr)} L`,`${sacs(terr,50)} sac(s) de 50 L`,'Mélangé à parts égales avec la terre du trou : 60 L par arbre, 15 L par arbuste, 1 L par vivace']);
  if(bru)out.push(['Terre de bruyère',`${nf(bru)} L`,`${sacs(bru,40)} sac(s) de 40 L`,'Pour les plantes de sol acide']);
  if(key==='med'||key==='nat'||key==='eco')out.push(['Engrais de fond','—','—','Inutile pour ce style : les plantes y sont plus robustes et la flore spontanée plus riche sans engrais']);
  else{const g=plantA*70+r.rows.filter(x=>/^Rosa/.test(x.p.l)).reduce((s,x)=>s+x.qty*100,0)+r.rows.filter(x=>x.p.t==='arbre').reduce((s,x)=>s+x.qty*150,0)+(key==='viv'?plantA*50:0);
    out.push(['Engrais organique de fond (type NPK 6-4-10 ou corne broyée)',`${nf(g/1000,1)} kg`,`${sacs(g/1000,1.5)} boîte(s) de 1,5 kg`,'70 g/m² griffés en surface'+(key==='viv'?' (+50 g/m² pour le potager)':'')+', +100 g par rosier, +150 g par arbre'])}
  if(c.ph<5.5&&!r.rows.some(x=>x.p.ph[1]<=6)){const g=plantA*250*Math.ceil((6-c.ph)/0.5);out.push(['Chaux magnésienne (dolomie)',`${nf(g/1000,1)} kg`,`${sacs(g/1000,10)} sac(s) de 10 kg`,'Environ 250 g/m² par demi-point de pH à remonter, épandus à l’automne'])}
  if(key==='med'){const v=plantA*0.06;out.push(['Paillage minéral (gravier 6/14)',`${nf(v,2)} m³`,`≈ ${nf(v*1.5,1)} t, soit ${sacs(v*1500,25)} sac(s) de 25 kg`,'6 cm sur toute la surface plantée'])}
  else{const l=plantA*0.06*1000;out.push(['Paillage organique (BRF, écorces, paille de lin)',`${nf(l)} L`,`${sacs(l,50)} sac(s) de 50 L`,'6 cm après plantation, à renouveler chaque printemps'])}
  if(minA+stripA>0){const v=(minA+stripA)*0.05;out.push(['Gravier décoratif',`${nf(v,2)} m³`,`≈ ${nf(v*1.5,1)} t, soit ${sacs(v*1500,25)} sac(s) de 25 kg`,`5 cm sur ${nf(minA+stripA,1)} m² (zone minérale${stripA?' et pied de mur':''}), sur toile tissée`])}
  const w=r.rows.reduce((s,x)=>s+x.qty*({arbre:50,arbuste:15}[x.p.t]||2),0);
  out.push(['Eau d’arrosage à la plantation',`${nf(w)} L`,'—','50 L par arbre, 15 L par arbuste, 2 L par vivace, même par temps pluvieux']);
  const nt=r.rows.filter(x=>x.p.t==='arbre').reduce((s,x)=>s+x.qty,0);
  if(nt)out.push(['Tuteur et attache',`${nt}`,`${nt} kit(s)`,'Tuteur incliné côté vent dominant, à retirer après 2–3 ans']);
  return out;
}
function refreshPlants(conds){if(conds!==false)renderConds();renderPlants();renderCompo();if(typeof renderV4==='function')renderV4();if(typeof renderExtras==='function'&&S.shapes)renderExtras();if(typeof renderPros==='function'&&$('#prosBox'))renderPros()}

/* ---------- Filtres et styles UI ---------- */
$('#fStyle').innerHTML+=Object.entries(STY).map(([k,v])=>`<option value="${k}">${v.l}</option>`).join('');
$('#fFo').innerHTML+=Object.entries(FOL).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
$('#fPort').innerHTML+=Object.entries(PORT).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
$('#fMois').innerHTML+=MOL.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('');
$('#fColors').innerHTML=Object.entries(COL).map(([k,[l,c]])=>`<button data-c="${k}" aria-pressed="false"><span class="dot" style="background:${c}"></span>${l}</button>`).join('');
$('#fColors').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.c;F.colors.has(k)?F.colors.delete(k):F.colors.add(k);b.setAttribute('aria-pressed',F.colors.has(k));refreshPlants(false)});
[['fType','type'],['fStyle','style'],['fFo','fo'],['fPort','port']].forEach(([id,k])=>$('#'+id).addEventListener('change',e=>{F[k]=e.target.value;refreshPlants(false)}));
[['fHmin','hmin'],['fHmax','hmax'],['fMois','mois']].forEach(([id,k])=>$('#'+id).addEventListener('change',e=>{F[k]=+e.target.value;refreshPlants(false)}));
$('#styles').innerHTML=Object.entries(STY).map(([k,v])=>`<button class="sty" data-s="${k}" aria-pressed="${k===S.style}"><b>${v.l}</b><span>${v.s}</span></button>`).join('');
$('#styles').addEventListener('click',e=>{const b=e.target.closest('.sty');if(!b)return;S.style=b.dataset.s;document.querySelectorAll('.sty').forEach(x=>x.setAttribute('aria-pressed',x===b));renderCompo()});
$('#recompose').addEventListener('click',renderCompo);
$('#surf').addEventListener('change',renderCompo);
$('#copy').addEventListener('click',()=>{
  const r=S.lastCompo;if(!r)return;
  let t=`${r.st.l} — massif de ${r.A} m²\n${S.lat!=null?`Site : ${S.lat.toFixed(5)}, ${S.lon.toFixed(5)}\n`:''}\n`;
  r.rows.forEach(x=>t+=`- ${x.qty} × ${x.p.n} (${x.p.l}) — ${x.role}${x.place?' · '+x.place:''}\n`);
  t+='\nEntretien :\n';document.querySelectorAll('#cal .mo').forEach(m=>{t+=m.querySelector('h4').textContent+'\n';m.querySelectorAll('li').forEach(li=>t+='  · '+li.textContent+'\n')});
  navigator.clipboard.writeText(t).then(()=>$('#copied').textContent='Plan copié.',()=>$('#copied').textContent='Copie refusée par le navigateur.');
});

/* ---------- Recherche et géolocalisation ---------- */
$('#search').addEventListener('submit',async e=>{
  e.preventDefault();const q=$('#q').value.trim();if(!q)return;const box=$('#results');box.textContent='Recherche…';
  let res=[];
  try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=fr&q=${encodeURIComponent(q)}`);if(r.ok)res=(await r.json()).map(x=>({lat:+x.lat,lon:+x.lon,name:x.display_name}))}catch(err){}
  if(!res.length){try{const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=5&language=fr&name=${encodeURIComponent(q)}`);if(r.ok)res=((await r.json()).results||[]).map(x=>({lat:x.latitude,lon:x.longitude,name:[x.name,x.admin1,x.country].filter(Boolean).join(', ')}))}catch(err){}}
  box.innerHTML=res.length?res.map((x,i)=>`<button data-i="${i}">${esc(x.name)}</button>`).join(''):'<span>Aucun résultat.</span>';
  box.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;const x=res[+b.dataset.i];box.innerHTML='';setSite(x.lat,x.lon,true)};
});
$('#geo').addEventListener('click',()=>{
  if(!navigator.geolocation){$('#results').textContent='Géolocalisation non disponible dans ce navigateur.';return}
  $('#results').textContent='Localisation en cours…';
  navigator.geolocation.getCurrentPosition(p=>{$('#results').textContent=`Position trouvée (précision ± ${Math.round(p.coords.accuracy)} m).`;setSite(p.coords.latitude,p.coords.longitude,true)},
    err=>{$('#results').textContent='Position refusée ou indisponible : '+err.message},{enableHighAccuracy:true,timeout:15000});
});

/* ---------- Éléments tracés : obstacles dessinés, haies, fruitiers, vigne, pelouse, eau ---------- */
let itemId=0;
Object.assign(S,{shapes:[],hedges:[],lawns:[],ponds:[],fruits:[],vines:[],taluses:[],samples:null,lawnUse:'fam',lawnManual:0});
const itemsLayer=L.layerGroup().addTo(map);
const toXY=(o,p)=>[(p[1]-o[1])*111320*Math.cos(o[0]*R),(p[0]-o[0])*111320];
const llDist=(a,b)=>{const [x,y]=toXY(a,b);return Math.hypot(x,y)};
const lenLL=(pts,closed)=>{let s=0;for(let i=0;i<pts.length-(closed?0:1);i++)s+=llDist(pts[i],pts[(i+1)%pts.length]);return s};
const areaLL=pts=>polyArea(pts.map(p=>toXY(pts[0],p)));
const centLL=pts=>pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length],[0,0]);
function parcelDist(ptsLL,closed){
  if(!S.parcel)return null;const o=ptsLL[0],ring=S.parcel.ring.map(([lo,la])=>toXY(o,[la,lo])),P=ptsLL.map(p=>toXY(o,p)),samp=[];
  const segs=P.length===1?1:P.length-(closed?0:1);
  for(let i=0;i<segs;i++){const a=P[i],b=P[(i+1)%P.length],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(L2/0.5));for(let j=0;j<=k;j++)samp.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k])}
  let m=1e9;for(const p of samp)ring.forEach((a,i)=>{const b=ring[(i+1)%ring.length];m=Math.min(m,segDist(p[0],p[1],a[0],a[1],b[0],b[1]))});return m;
}
function obsAll(){
  if(!S.samples){S.samples=[];
    for(const sh of S.shapes){const P=sh.pts,closed=sh.kind==='obsPoly',n=P.length,ty=sh.nat==='caduc'||sh.nat==='cloture'||sh.nat==='viv'?'caduc':'bat';
      for(let i=0;i<(closed?n:n-1);i++){const a=P[i],b=P[(i+1)%n],k=Math.max(1,Math.round(llDist(a,b)));for(let j=0;j<k;j++){const t=j/k;S.samples.push({lat:a[0]+(b[0]-a[0])*t,lng:a[1]+(b[1]-a[1])*t,h:sh.h,w:sh.w||1.5,type:ty})}}
      if(!closed){const z=P[n-1];S.samples.push({lat:z[0],lng:z[1],h:sh.h,w:sh.w||1.5,type:ty})}}
    S._all=S.obs.concat(S.samples)}
  return S._all;
}
function finishShape(){
  const m=S.mode,need=SHAPE_MODES[m];if(!need)return;
  if(m==='measure'){const L_=lenLL(S.drawPts);S.drawPts=[];drawTemp();setMode('site');if(L_)toast(`Distance mesurée : ${nf(L_,1)} m`);return}
  if(S.drawPts.length>=need)pushUndo();
  if(S.drawPts.length<need){$('#maphint').textContent=`Il faut au moins ${need} points.`;return}
  if(m==='bed'){finishBed();return}
  const pts=S.drawPts.slice(),id=++itemId;
  if(m==='obsPoly')S.shapes.push({id,kind:m,pts,name:'Bâtiment '+(S.shapes.filter(x=>x.kind===m).length+1),h:6,nat:'bat'});
  else if(m==='obsLine')S.shapes.push({id,kind:m,pts,name:'Mur '+(S.shapes.filter(x=>x.kind===m).length+1),h:2,nat:'mur'});
  else if(m==='hedge')S.hedges.push({id,pts,type:'champetre',h:1.8,rows:2});
  else if(m==='lawn')S.lawns.push({id,pts});
  else if(m==='pond')S.ponds.push({id,pts,depth:0});
  else if(m==='vine')S.vines.push({id,pts,cep:0});
  else if(m==='talus'){const t={id,pts,man:{}};S.taluses.push(t);estimateTalus(t)}
  else if(m==='potager')S.potagers.push({id,pts});
  else if(m==='orchard')S.orchards.push({id,pts});
  initGeom(id);setMode('site');itemsChanged(m==='obsPoly'||m==='obsLine');drawHandles();if(typeof toastNew==='function')toastNew(m,id);
  if(m!=='obsPoly'&&m!=='obsLine')showTab(m==='potager'?'potager':m==='orchard'?'verger':m==='lawn'?'pelouse':'amenagements',false);
}
function addFruit(lat,lng){if(typeof pushUndo==='function')pushUndo();S.fruits.push({id:++itemId,lat,lng,sp:0,forme:'dt'});itemsChanged(false)}
function itemsChanged(shade){drawItems();renderObs();renderExtras();renderItemsList();if(shade)sunUpdate()}
function hook(l,kind,id,label){
  if(!l.on)return l;
  l.on('click',e=>{L.DomEvent.stopPropagation(e);const {lat,lng}=e.latlng||{};
    if(S.mode in SHAPE_MODES){addDrawPt(lat,lng);return}
    if(S.mode==='obs'){addObstacle(lat,lng);return}if(S.mode==='fruit'){addFruit(lat,lng);return}
    if(S.mode==='erase'){delItem(kind,id);return}
    itemPopup(e.latlng,kind,id,label)});
  return l;
}
function itemPopup(ll,kind,id,label){
  if(!L.popup||!ll)return;const d=document.createElement('div');
  const cv=kind!=='obs'&&kind!=='fruits';d.innerHTML=`<b>${esc(label)}</b><br>${cv?'<button type="button" class="popdel popcurve">Courbe / angles</button> ':''}<button type="button" class="popdel popx">Supprimer</button>`;
  d.querySelector('.popx').addEventListener('click',()=>{map.closePopup();delItem(kind,id)});if(cv)d.querySelector('.popcurve').addEventListener('click',()=>{map.closePopup();toggleCurve(kind,id)});
  L.popup().setLatLng(ll).setContent(d).openOn(map);
}
function drawItems(){
  itemsLayer.clearLayers();
  const tip=(l,t,dir)=>l.bindTooltip(t,{permanent:true,direction:dir||'center',className:'maplbl'});
  S.shapes.forEach(sh=>{const st={color:TC[sh.kind],fillColor:TC[sh.kind],weight:sh.kind==='obsLine'?6:2,fillOpacity:.3},lab=`${sh.name} · ${nf(sh.h,1)} m`;tip(hook((sh.kind==='obsPoly'?L.polygon(sh.pts,st):L.polyline(sh.pts,st)).addTo(itemsLayer),'shapes',sh.id,lab),esc(lab))});
  S.hedges.forEach((h,i)=>{const lab=`Haie ${i+1} · ${nf(lenLL(h.pts),1)} m`;tip(hook(L.polyline(h.pts,{color:TC.hedge,weight:8,opacity:.85}).addTo(itemsLayer),'hedges',h.id,lab),lab)});
  S.lawns.forEach((l,i)=>{const lab=`Pelouse ${i+1} · ${nf(areaLL(l.pts))} m²`;tip(hook(L.polygon(l.pts,{color:TC.lawn,weight:2,fillColor:TC.lawn,fillOpacity:.35}).addTo(itemsLayer),'lawns',l.id,lab),lab)});
  S.ponds.forEach((p,i)=>{const lab=`Pièce d’eau ${i+1} · ${nf(areaLL(p.pts))} m²`;tip(hook(L.polygon(p.pts,{color:TC.pond,weight:2,fillColor:TC.pond,fillOpacity:.45}).addTo(itemsLayer),'ponds',p.id,lab),lab)});
  S.taluses.filter(t=>t.pts).forEach((t,i)=>{const lab=`Talus ${i+1}${t.est&&t.est.pct!=null?' · '+nf(t.est.pct)+' %':''}`;tip(hook(L.polygon(t.pts,{color:TC.talus,weight:2,fillColor:TC.talus,fillOpacity:.3,dashArray:'4 4'}).addTo(itemsLayer),'taluses',t.id,lab),lab)});
  S.vines.forEach((v,i)=>{const lab=`Vigne ${i+1} · ${nf(lenLL(v.pts),1)} m`;tip(hook(L.polyline(v.pts,{color:TC.vine,weight:5,dashArray:'2 8'}).addTo(itemsLayer),'vines',v.id,lab),lab)});
  (S.potagers||[]).forEach((p,i)=>{const lab=`Potager ${i+1} · ${nf(areaLL(p.pts))} m²`;tip(hook(L.polygon(p.pts,{color:TC.potager,weight:2,fillColor:TC.potager,fillOpacity:.3}).addTo(itemsLayer),'potagers',p.id,lab),lab)});
  (S.orchards||[]).forEach((o,i)=>{const lab=`Verger ${i+1} · ${nf(areaLL(o.pts))} m²`;tip(hook(L.polygon(o.pts,{color:TC.orchard,weight:2,fillColor:TC.orchard,fillOpacity:.12,dashArray:'6 4'}).addTo(itemsLayer),'orchards',o.id,lab),lab)});
  S.fruits.forEach((f,i)=>{const fo=fruitForme(f),lab=`${FRUITS[f.sp].n} ${i+1}`;L.circle([f.lat,f.lng],{radius:fo.sp/2,color:TC.fruit,weight:2,fillOpacity:.12,interactive:false}).addTo(itemsLayer);
    const mk=L.marker([f.lat,f.lng],{draggable:true,icon:L.divIcon({className:'',html:`<span class="obpin" style="background:${TC.fruit}"></span>`,iconSize:[16,16],iconAnchor:[8,8]})}).addTo(itemsLayer);
    tip(mk,lab,'top');mk.on('dragend',()=>{const p=mk.getLatLng();f.lat=p.lat;f.lng=p.lng;drawItems();renderExtras()});mk.on('click',e=>{if(S.mode==='erase')delItem('fruits',f.id);else itemPopup(e.latlng,'fruits',f.id,lab)})});
  renderItemsList();
}
function delItem(kind,id){if(typeof pushUndo==='function'){pushUndo();setTimeout(()=>toast('Élément supprimé',{undo:true}),0)}
  if(kind==='obs'){const i=S.obs.findIndex(x=>x.id==id);if(i>=0){map.removeLayer(S.obs[i].circle);map.removeLayer(S.obs[i].marker);S.obs.splice(i,1)}renderObs();sunUpdate();renderItemsList();return}
  if(kind==='bed'){S.bed=null;bedLayer.clearLayers();plantLayer.clearLayers();S.lastLayout=null;$('#clearBed').hidden=true;renderCompo();renderItemsList();return}
  if(!S[kind])return;S[kind]=S[kind].filter(x=>x.id!=id);itemsChanged(kind==='shapes');
}
function clearDrawings(){
  S.obs.forEach(o=>{map.removeLayer(o.circle);map.removeLayer(o.marker)});S.obs=[];
  S.shapes=[];S.hedges=[];S.lawns=[];S.ponds=[];S.fruits=[];S.vines=[];S.taluses=[];S.potagers=[];S.orchards=[];if(typeof drawHandles==='function')drawHandles();
  S.bed=null;bedLayer.clearLayers();plantLayer.clearLayers();S.lastLayout=null;S.samples=null;$('#clearBed').hidden=true;
  S.drawPts=[];drawTemp();drawItems();renderObs();renderExtras();
}
function renderItemsList(){
  const el=$('#itemsList');if(!el)return;const rows=[];
  const add=(kind,id,c,lab,cls)=>{const cv=kind==='bed'?S.bed:kind!=='obs'&&kind!=='fruits'?(S[kind]||[]).find(x=>x.id==id):null;rows.push(`<li><span class="sw ${cls||''}" style="background:${c}"></span><span>${esc(lab)}</span>${cv&&(kind==='bed'||cv.pts)?`<button type="button" data-curve="${kind}" data-id="${id}" aria-pressed="${!!cv.smooth}" title="Lisser les angles en courbe">Courbe</button>`:''}<button type="button" data-del="${kind}" data-id="${id}">Supprimer</button></li>`)};
  S.obs.forEach((o,i)=>add('obs',o.id,OBT[o.type].c,`${obsName(o,i)} · ${nf(o.h,1)} m`,'pt'));
  (S.shapes||[]).forEach(sh=>add('shapes',sh.id,TC[sh.kind],`${sh.name} · ${nf(sh.h,1)} m`,sh.kind==='obsLine'?'line':''));
  if(S.bed)add('bed',0,TC.bed,`Massif · ${nf(bedGeo().area)} m²`);
  (S.hedges||[]).forEach((h,i)=>add('hedges',h.id,TC.hedge,`Haie ${i+1} · ${nf(lenLL(h.pts),1)} m`,'line'));
  (S.fruits||[]).forEach((f,i)=>add('fruits',f.id,TC.fruit,`${FRUITS[f.sp].n} ${i+1}`,'pt'));
  (S.vines||[]).forEach((v,i)=>add('vines',v.id,TC.vine,`Vigne ${i+1} · ${nf(lenLL(v.pts),1)} m`,'line'));
  (S.lawns||[]).forEach((l,i)=>add('lawns',l.id,TC.lawn,`Pelouse ${i+1} · ${nf(areaLL(l.pts))} m²`));
  (S.ponds||[]).forEach((p,i)=>add('ponds',p.id,TC.pond,`Pièce d’eau ${i+1} · ${nf(areaLL(p.pts))} m²`));
  (S.taluses||[]).forEach((t,i)=>add('taluses',t.id,TC.talus,`Talus ${i+1}`+(t.pts?` · ${nf(areaLL(t.pts))} m²`:' (saisi à la main)')));
  (S.potagers||[]).forEach((p,i)=>add('potagers',p.id,TC.potager,`Potager ${i+1} · ${nf(areaLL(p.pts))} m²`));
  (S.orchards||[]).forEach((o,i)=>add('orchards',o.id,TC.orchard,`Verger ${i+1} · ${nf(areaLL(o.pts))} m²`));
  el.innerHTML=rows.length?`<ul>${rows.join('')}</ul><button type="button" id="delAll">Tout effacer sur la carte</button>`:'<p class="empty">Rien n’est encore dessiné. Choisissez un outil dans « Ajouter sur la carte ».</p>';
  $('#itemsCount').textContent=rows.length;
}
$('#itemsPanel').addEventListener('click',e=>{{const cb=e.target.closest('[data-curve]');if(cb){toggleCurve(cb.dataset.curve,cb.dataset.id);return}}const b=e.target.closest('[data-del]');if(b){delItem(b.dataset.del,b.dataset.id);return}
  if(e.target.id==='delAll'){pushUndo();clearDrawings();sunUpdate();toast('Tous les éléments ont été effacés',{undo:true})}});
const legalTxt=(d,min)=>d==null?'<span class="note">Parcelle cadastrale inconnue : distance à la limite non vérifiée.</span>':`Distance à la limite cadastrale : <b>${nf(d,1)} m</b> (minimum légal ${nf(min,1)} m, Code civil art. 3.133) <span class="${d>=min-0.01?'okk':'koo'}">${d>=min-0.01?'conforme':'non conforme'}</span>`;
const delBtn='<button data-f="del">Supprimer</button>';
const opts=(o,v)=>Object.entries(o).map(([k,x])=>`<option value="${k}"${String(k)===String(v)?' selected':''}>${typeof x==='string'?x:x.l||x.n}</option>`).join('');

/* --- Haies --- */
const HEDGE_T={taillee:{l:'Haie taillée (persistante ou marcescente)',dens:[3,5],h:[1,2],nSp:[1,2],d:'Haie formelle de 1 à 2 essences, taillée deux fois par an.'},
 champetre:{l:'Haie champêtre indigène (libre)',dens:[1.5,3],h:[2,4],nSp:[5,7],d:'Mélange d’au moins 5 essences indigènes, aucune au-delà de 30 % : abri et nourriture pour la faune.'},
 fleurie:{l:'Haie fleurie libre',dens:[1,2],h:[1.5,3],nSp:[3,5],d:'Arbustes à floraisons échelonnées, taillés légèrement après la floraison.'},
 brisevent:{l:'Haie brise-vent (arbres et arbustes)',dens:[1,2],h:[4,10],nSp:[4,6],d:'Strate d’arbres et d’arbustes ; protège du vent sur une distance de 10 à 15 fois sa hauteur.'}};
const HSP=[['Charme commun','Carpinus betulus','taillee champetre brisevent',2,'smo','f','la',[5.5,8]],['Hêtre commun','Fagus sylvatica','taillee brisevent',2,'smo','f','sla',[5,8]],
 ['If commun','Taxus baccata','taillee',1,'smo','df','sla',[5,8.5]],['Troène commun','Ligustrum vulgare','taillee champetre',3,'smo','df','sla',[6,8.5]],['Houx commun','Ilex aquifolium','taillee champetre',1,'smo','f','sla',[5,7.5]],
 ['Aubépine monogyne','Crataegus monogyna','champetre',0,'sm','df','sla',[5.5,8.5]],['Prunellier','Prunus spinosa','champetre',0,'s','df','sla',[5.5,8.5]],['Noisetier','Corylus avellana','champetre brisevent',0,'sm','f','sla',[5.5,8]],
 ['Cornouiller sanguin','Cornus sanguinea','champetre',0,'sm','dfh','sla',[6,8.5]],['Viorne obier','Viburnum opulus','champetre fleurie',0,'sm','fh','la',[5.5,8]],['Viorne lantane','Viburnum lantana','champetre fleurie',0,'sm','d','sla',[6.5,8.5]],
 ['Fusain d’Europe','Euonymus europaeus','champetre',0,'sm','f','la',[6,8.5]],['Sureau noir','Sambucus nigra','champetre',0,'sm','fh','la',[5.5,8]],['Églantier','Rosa canina','champetre fleurie',0,'s','df','sla',[5.5,8.5]],
 ['Érable champêtre','Acer campestre','champetre brisevent',0,'sm','df','sla',[5.5,8.5]],['Cornouiller mâle','Cornus mas','champetre fleurie',0,'sm','df','sla',[6,8.5]],['Amélanchier','Amelanchier lamarckii','fleurie',0,'sm','fh','sla',[5,7.5]],
 ['Groseillier à fleurs','Ribes sanguineum','fleurie',0,'sm','f','sla',[5.5,7.5]],['Seringat','Philadelphus coronarius','fleurie',0,'sm','df','sla',[6,8]],['Saule marsault','Salix caprea','champetre brisevent',0,'sm','fh','sla',[5,8]],
 ['Aulne glutineux','Alnus glutinosa','brisevent',0,'sm','fh','la',[5,7.5]],['Chêne pédonculé','Quercus robur','brisevent',0,'s','fh','la',[4.5,8]]];
const PERS=['caduc','persistant','marcescent','semi-persistant'];
function hedgeInfo(h){
  const T=HEDGE_T[h.type],len=lenLL(h.pts),c=cond(),dens=T.dens[h.rows-1]||T.dens[0],n=Math.max(1,Math.ceil(len*dens));
  const fit=HSP.filter(x=>x[2].split(' ').includes(h.type)).map(x=>{let sc=0;if(x[4].includes(c.expo))sc+=2;if(x[5].includes(c.eau))sc+=2;else if(c.eau==='f')sc+=1;if(c.ph>=x[7][0]-0.3&&c.ph<=x[7][1]+0.3)sc+=1;return{x,sc}}).filter(o=>o.sc>=3).sort((a,b)=>b.sc-a.sc);
  const k=Math.min(T.nSp[1],fit.length),pick=fit.slice(0,Math.max(Math.min(T.nSp[0],fit.length),k));
  const mix=pick.map((o,i)=>({n:o.x[0],l:o.x[1],pers:PERS[o.x[3]],qty:Math.floor(n/pick.length)+(i<n%pick.length?1:0)}));
  const d=parcelDist(h.pts,false),min=h.h>=2?2:0.5;
  return{T,len,dens,n,mix,d,min,brf:len*1*0.08};
}
function renderHedges(){
  $('#hedgeBox').innerHTML=S.hedges.length?S.hedges.map((h,i)=>{const I=hedgeInfo(h);return `<div class="card xcard" data-k="hedges" data-id="${h.id}">
   <div class="xhead"><h4>Haie ${i+1} : ${nf(I.len,1)} m</h4>${delBtn}</div>
   <div class="frow"><label>Type<select data-f="type">${opts(HEDGE_T,h.type)}</select></label><label>Hauteur entretenue (m)<input type="number" data-f="h" min="0.5" max="20" step="0.1" value="${h.h}"></label><label>Plantation<select data-f="rows"><option value="1"${h.rows==1?' selected':''}>Simple rang</option><option value="2"${h.rows==2?' selected':''}>Double rang en quinconce</option></select></label></div>
   <p>${I.T.d} <b>${nf(I.dens,1)} plants par mètre</b>, soit <b>${I.n} plants</b>.</p>
   ${I.mix.length?`<table class="stack"><thead><tr><th>Essence</th><th>Feuillage</th><th class="n">Plants</th></tr></thead><tbody>${I.mix.map(m=>`<tr><td><div class="pcell"><div class="ph sm" data-ph="${esc(m.l)}" data-n="${esc(m.n)}" data-small="1"></div><div><b>${esc(m.n)}</b><br><i class="src">${esc(m.l)}</i></div></div></td><td>${m.pers}</td><td class="n">${m.qty}</td></tr>`).join('')}</tbody></table>`:'<p class="koo">Aucune essence de ce type ne convient aux conditions du site : essayez un autre type.</p>'}
   <p>${legalTxt(I.d,I.min)}${I.d!=null&&I.d<2&&I.d>=0.5?' — à moins de 2 m de la limite, la haie doit rester sous 2 m de haut.':''}</p>
   <ul><li>Planter de novembre à mars, de préférence en racines nues (jeunes plants de 60–80 cm), hors période de gel.</li><li>Pailler sur 1 m de large : ${nf(I.brf,1)} m³ de BRF (8 cm), ou ${nf(I.len)} m de feutre de paillage biodégradable.</li><li>${h.type==='taillee'?'Tailler deux fois par an : fin juin et septembre.':'Taille de formation en hiver les 2 premières années, puis tous les 2–3 ans.'} Évitez de tailler du 15 mars au 31 juillet, période de nidification des oiseaux.</li></ul></div>`}).join(''):'<p class="empty">Aucune haie tracée. Cliquez sur « Tracer une haie », puis dessinez la ligne sur la carte.</p>';
}

/* --- Fruitiers --- */
const FORMES={ht:{l:'Haute tige',h:7,sp:9},dt:{l:'Demi-tige',h:4.5,sp:6},bt:{l:'Basse tige (gobelet)',h:3,sp:4},pal:{l:'Palissé / espalier',h:2,sp:2.5},cor:{l:'Cordon',h:0.6,sp:1.5}};
const FRUITS=[
 {n:'Pommier',l:'Malus domestica',z:-29,e:'s',s:'la',w:'f',v:"'Reinette Hernaut', 'Cwastresse Double', 'Président Roulin' (variétés rustiques diffusées par le CRA-W de Gembloux)",poll:'Planter au moins 2 variétés qui fleurissent en même temps (pollinisation croisée).',formes:'ht dt bt pal cor'},
 {n:'Poirier',l:'Pyrus communis',z:-29,e:'s',s:'la',w:'f',v:"'Conférence', 'Durondeau', 'Légipont'",poll:'La plupart des variétés ont besoin d’un pollinisateur.',formes:'ht dt bt pal'},
 {n:'Prunier',l:'Prunus domestica',z:-29,e:'s',s:'sla',w:'f',v:"'Reine-Claude d’Oullins', 'Mirabelle de Nancy', 'Bleue de Belgique'",poll:'Plusieurs variétés sont autofertiles.',formes:'ht dt bt'},
 {n:'Cerisier',l:'Prunus avium',z:-29,e:'s',s:'sl',w:'df',v:"'Burlat', 'Stella' (autofertile)",poll:'Pollinisateur nécessaire, sauf variétés autofertiles.',formes:'ht dt'},
 {n:'Cognassier',l:'Cydonia oblonga',z:-23,e:'s',s:'la',w:'f',v:"'Champion', 'De Portugal'",poll:'Autofertile.',formes:'dt bt'},
 {n:'Néflier',l:'Mespilus germanica',z:-23,e:'sm',s:'sla',w:'f',v:"'Nottingham'",poll:'Autofertile.',formes:'dt bt'},
 {n:'Pêcher',l:'Prunus persica',z:-18,e:'s',s:'sl',w:'df',v:"'Pêche de vigne', 'Revita' (tolérante à la cloque)",poll:'Autofertile ; idéal palissé contre un mur sud.',formes:'bt pal'},
 {n:'Figuier',l:'Ficus carica',z:-15,e:'s',s:'sl',w:'d',v:"'Brown Turkey', 'Ronde de Bordeaux'",poll:'Autofertile ; à planter contre un mur chaud et abrité.',formes:'bt'},
 {n:'Noyer',l:'Juglans regia',z:-29,e:'s',s:'la',w:'f',v:"'Franquette', 'Lara'",poll:'Grand arbre : prévoir 12 m d’envergure.',formes:'ht',big:1}];
function fruitForme(f){const fo={...FORMES[f.forme]};if(FRUITS[f.sp].big&&f.forme==='ht'){fo.h=15;fo.sp=12}return fo}
function fruitInfo(f){
  const fr=FRUITS[f.sp],fo=fruitForme(f),c=cond(),warn=[],ok=[];
  if(!fr.formes.split(' ').includes(f.forme))warn.push(`La forme « ${fo.l} » est rare pour le ${fr.n.toLowerCase()} : formes conseillées ${fr.formes.split(' ').map(k=>FORMES[k].l.toLowerCase()).join(', ')}.`);
  if(c.tmin!=null&&c.tmin<fr.z)warn.push(`Pas assez rustique (supporte ${fr.z} °C, minimum local ${nf(c.tmin,1)} °C).`);
  if(!fr.e.includes(c.expo))warn.push(`Demande du plein soleil (site : ${EXL[c.expo].toLowerCase()}).`);
  if(!fr.s.includes(c.sol))warn.push('Sol peu adapté : amender largement le trou de plantation.');
  if(!fr.w.includes(c.eau))warn.push(c.eau==='h'?'Sol trop humide : planter sur butte.':'Sol sec : arrosage les 3 premières années.');
  S.fruits.forEach(o=>{if(o===f)return;const d=llDist([f.lat,f.lng],[o.lat,o.lng]),need=(fo.sp+fruitForme(o).sp)/2;if(d<need-0.05)warn.push(`Trop près d’un autre fruitier (${nf(d,1)} m, il faut ${nf(need,1)} m).`)});
  obsAll().filter(o=>o.type==='bat').forEach(o=>{const d=llDist([f.lat,f.lng],[o.lat,o.lng])-o.w/2;if(d<fo.sp/2-0.3&&f.forme!=='pal'&&f.forme!=='cor'&&!warn.some(w=>w.startsWith('Trop près d’un bâtiment')))warn.push(`Trop près d’un bâtiment ou d’un mur (${nf(Math.max(0,d),1)} m) pour cette forme : palissez-le ou éloignez-le.`)});
  const d=parcelDist([[f.lat,f.lng]]),min=fo.h>=2?2:0.5;
  return{fr,fo,warn,d,min};
}
function renderFruits(){
  const sp=Object.fromEntries(FRUITS.map((x,i)=>[i,x.n]));
  $('#fruitBox').innerHTML=S.fruits.length?S.fruits.map((f,i)=>{const I=fruitInfo(f);return `<div class="card xcard" data-k="fruits" data-id="${f.id}">
   <div class="xhead"><h4>${I.fr.n} ${i+1}</h4>${delBtn}</div>
   <div class="pcell"><div class="ph sm" data-ph="${esc(I.fr.l)}" data-n="${esc(I.fr.n)}" data-small="1"></div><div class="frow"><label>Espèce<select data-f="sp">${opts(sp,f.sp)}</select></label><label>Forme<select data-f="forme">${opts(FORMES,f.forme)}</select></label></div></div>
   <p>${f.v?`Variété : <b>'${esc(f.v)}'</b>. `:''}Hauteur adulte ≈ ${nf(I.fo.h,1)} m, envergure ≈ ${nf(I.fo.sp,1)} m. ${f.v?'Autres variétés possibles':'Variétés conseillées'} : ${esc(I.fr.v)}. ${esc(I.fr.poll)}</p>
   <p>${legalTxt(I.d,I.min)}</p>
   ${I.warn.length?`<ul>${I.warn.map(w=>`<li class="koo">${esc(w)}</li>`).join('')}</ul>`:'<p class="okk">Emplacement adapté.</p>'}
   <ul><li>Planter de novembre à mars : trou de 60 × 60 cm, ${I.fo.h>=4?'60':'30'} L de terreau mélangé à la terre, point de greffe 10 cm au-dessus du sol.</li><li>${f.forme==='pal'||f.forme==='cor'?'Fils de palissage tous les 40 cm, taille en vert en été et taille d’hiver.':'Tuteur et protection du tronc ; taille de formation les 3–4 premières années, en hiver (sauf cerisiers et pruniers : après récolte).'}</li></ul></div>`}).join(''):'<p class="empty">Aucun arbre fruitier placé. Cliquez sur « Placer un arbre fruitier », puis sur la carte.</p>';
}

/* --- Vigne --- */
const CEPS=["'Vanessa' (raisin de table rouge, sans pépins)","'Muscat bleu' (raisin de table, résistant au mildiou)","'Boskoop Glory' (raisin de table noir, productif)","'Solaris' (vin blanc, très précoce)","'Johanniter' (vin blanc, résistant aux maladies)","'Regent' (vin rouge, résistant aux maladies)"];
function vineInfo(v){
  const len=lenLL(v.pts),n=Math.max(1,Math.floor(len/1.2)+1),[x,y]=toXY(v.pts[0],v.pts[v.pts.length-1]),brg=((Math.atan2(x,y)/R)+360)%180,ew=brg>55&&brg<125;
  const d=parcelDist(v.pts,false);return{len,n,ew,brg,d,min:0.5,wire:len*3,posts:Math.ceil(len/5)+1};
}
function renderVines(){
  const c=cond();
  $('#vineBox').innerHTML=S.vines.length?S.vines.map((v,i)=>{const I=vineInfo(v);return `<div class="card xcard" data-k="vines" data-id="${v.id}">
   <div class="xhead"><h4>Vigne ${i+1} : ${nf(I.len,1)} m</h4>${delBtn}</div>
   <div class="frow"><label>Cépage<select data-f="cep">${opts(Object.fromEntries(CEPS.map((x,j)=>[j,x])),v.cep)}</select></label></div>
   <p><b>${I.n} pieds</b> espacés de 1,2 m, palissés sur 3 fils (${nf(I.wire)} m de fil), ${I.posts} piquets ou ancrages, 3 tendeurs.</p>
   <ul>${c.expo!=='s'?'<li class="koo">La vigne demande le plein soleil : préférez un mur exposé au sud ou au sud-ouest.</li>':''}<li>${I.ew?'Ligne orientée est-ouest : idéale si la vigne est palissée contre la face sud d’un mur.':'Ligne orientée nord-sud : les deux faces reçoivent le soleil à mi-journée, la maturité sera plus tardive qu’en espalier plein sud.'}</li>
   <li>${legalTxt(I.d,I.min)} (palissage maintenu sous 2 m).</li>
   <li>Planter en mars–avril, en sol drainant ; taille d’hiver en février (taille Guyot ou cordon), ébourgeonnage et rognage en été.</li></ul></div>`}).join(''):'<p class="empty">Aucune vigne tracée. Cliquez sur « Tracer une vigne », puis dessinez la ligne du palissage.</p>';
}

/* --- Pelouse --- */
const LAWNS=[
 {k:'orn',n:'Gazon d’ornement (fin)',mix:'Fétuque rouge, agrostide ténue, pâturin des prés',dose:35,e:'s',w:'f',use:['orn'],eff:4,ent:'Tonte chaque semaine d’avril à octobre à 3–4 cm, arrosage en été, 2 à 3 apports d’engrais par an, scarification au printemps.'},
 {k:'fam',n:'Gazon rustique « jeux et famille »',mix:'Ray-grass anglais, fétuque élevée, pâturin des prés',dose:35,e:'sm',w:'df',use:['fam','orn'],eff:3,ent:'Tonte chaque semaine à 5–6 cm, arrosage rarement nécessaire, un apport d’engrais organique au printemps.'},
 {k:'omb',n:'Gazon d’ombre',mix:'Fétuque rouge, pâturin des bois (Poa nemoralis), fétuque ovine',dose:35,e:'mo',w:'f',use:['fam','orn'],eff:3,ent:'Tonte haute à 6–7 cm, tous les 10 jours au plus ; ramasser les feuilles à l’automne.'},
 {k:'sec',n:'Gazon résistant à la sécheresse',mix:'Fétuque élevée (Festuca arundinacea), fétuque ovine',dose:30,e:'s',w:'d',use:['fam','eco'],eff:2,ent:'Tonte haute à 6–8 cm, aucun arrosage : il jaunit en été puis reverdit à l’automne.'},
 {k:'trefle',n:'Pelouse fleurie au micro-trèfle',mix:'Graminées rustiques, micro-trèfle blanc, pâquerette, brunelle',dose:25,e:'sm',w:'df',use:['eco','fam'],eff:2,ent:'Tonte toutes les 2–3 semaines à 6–8 cm ; aucun engrais (le trèfle fixe l’azote) ; bonne nourriture pour les pollinisateurs.'},
 {k:'prairie',n:'Prairie fleurie indigène (vivace)',mix:'Mélange de fleurs sauvages d’origine locale (marguerite, centaurée, knautie, lotier, sauge des prés…) et de graminées fines',dose:4,e:'s',w:'df',use:['eco'],eff:1,ent:'Fauche 1 à 2 fois par an (fin juin et/ou septembre) avec exportation du foin ; jamais d’engrais ; garder une zone refuge non fauchée.'},
 {k:'golf',n:'Green de golf (gazon de précision)',mix:'Agrostide stolonifère (Agrostis stolonifera) sur substrat sableux drainé',dose:8,e:'s',w:'f',use:['golf'],eff:5,ent:'Tonte presque quotidienne à 3–5 mm (tondeuse hélicoïdale), arrosage automatique, sablage, aération et traitements fréquents : très exigeant et peu écologique.'}];
const LUSE={fam:'Jeux et vie de famille',orn:'Ornement, aspect soigné',eco:'Biodiversité, peu d’entretien',golf:'Putting green / gazon de précision'};
function lawnArea(){return S.lawns.length?S.lawns.reduce((s,l)=>s+areaLL(l.pts),0):S.lawnManual}
function lawnRank(){
  const c=cond(),so=soilNow();
  return LAWNS.map(t=>{let sc=0;const why=[];
    if(t.e.includes(c.expo))sc+=3;else{sc-=3;why.push('exposition peu adaptée')}
    if(t.w.includes(c.eau))sc+=2;else{sc-=1;why.push(c.eau==='d'?'sol trop sec : arrosage nécessaire':'sol humide')}
    if(t.use.includes(S.lawnUse))sc+=3;
    if(t.k==='prairie'&&so&&so.cat==='a')why.push('sol riche ou lourd : les graminées domineront, décaper 5–10 cm de terre ou choisir un mélange pour sol lourd');
    if(t.k==='golf'){sc-=2;why.push('nécessite un substrat sableux, un arrosage automatique et un entretien professionnel')}
    return{t,sc,why}}).sort((a,b)=>b.sc-a.sc);
}
function renderLawn(){
  const A=lawnArea(),rk=lawnRank(),has=A>0||S.lawns.length>0;$('#pelouse').hidden=!has;document.querySelector('#tabs [data-tab="pelouse"]').hidden=!has;if($('#lawnQuick')&&document.activeElement!==$('#lawnQuick'))$('#lawnQuick').value=S.lawnManual||'';$('#lawnHint').hidden=S.lawns.length>0;
  $('#lawnBox').innerHTML=`<div class="frow" style="margin-bottom:12px"><label>Usage principal<select id="lawnUse">${opts(LUSE,S.lawnUse)}</select></label>${S.lawns.length?`<span class="note">Surface dessinée : <b>${nf(A)} m²</b> (${S.lawns.length} zone${S.lawns.length>1?'s':''})</span>`:`<label>Surface (m²)<input type="number" id="lawnA" min="0" max="100000" value="${S.lawnManual||''}" placeholder="ou dessinez-la"></label>`}</div>
  ${S.lawns.map((l,i)=>`<div class="xhead" data-k="lawns" data-id="${l.id}" style="margin-bottom:6px"><span>Pelouse ${i+1} : ${nf(areaLL(l.pts))} m²</span>${delBtn}</div>`).join('')}
  <div class="lawns">${rk.map((x,i)=>`<div class="card"><h4>${esc(x.t.n)}${i<2&&x.sc>=5?'<span class="badge">Conseillé</span>':''}</h4>
   <p class="note" style="margin:6px 0">Entretien <span class="effort">${'●'.repeat(x.t.eff)}${'○'.repeat(5-x.t.eff)}</span></p>
   <p><b>Mélange :</b> ${esc(x.t.mix)}</p><p><b>Semis :</b> ${x.t.dose} g/m²${A?` soit <b>${nf(A*x.t.dose/1000,1)} kg</b> de semences pour ${nf(A)} m²`:''}, en avril–mai ou de fin août à septembre.</p>
   <p>${esc(x.t.ent)}</p>${x.why.length?`<p class="warn">${x.why.map(esc).join(' · ')}</p>`:''}</div>`).join('')}</div>`;
}

/* --- Pièce d’eau --- */
const PONDPL=[
 {z:'Berge humide (0 à 10 cm d’eau)',k:'berge',sp:[['Populage des marais','Caltha palustris'],['Menthe aquatique','Mentha aquatica'],['Myosotis des marais','Myosotis scorpioides'],['Salicaire','Lythrum salicaria'],['Reine-des-prés','Filipendula ulmaria']]},
 {z:'Palier (10 à 30 cm)',k:'palier',sp:[['Iris des marais','Iris pseudacorus'],['Plantain d’eau','Alisma plantago-aquatica'],['Butome en ombelle','Butomus umbellatus'],['Rubanier dressé','Sparganium erectum'],['Sagittaire','Sagittaria sagittifolia']]},
 {z:'Zone profonde : plantes oxygénantes',k:'oxy',sp:[['Cornifle nageant','Ceratophyllum demersum'],['Myriophylle en épi','Myriophyllum spicatum'],['Renoncule aquatique','Ranunculus aquatilis']]},
 {z:'Feuilles flottantes',k:'flot',sp:[['Nénuphar blanc','Nymphaea alba'],['Potamot nageant','Potamogeton natans'],['Morène','Hydrocharis morsus-ranae']]}];
function pondInfo(p){
  const A=areaLL(p.pts),per=lenLL(p.pts,true),o=p.pts[0],xy=p.pts.map(q=>toXY(o,q)),xs=xy.map(q=>q[0]),ys=xy.map(q=>q[1]);
  const Lx=Math.max(...xs)-Math.min(...xs),Wy=Math.max(...ys)-Math.min(...ys);
  const dmax=p.depth||(A<6?0.5:A<15?0.7:A<40?0.9:1.2);
  const so=soilNow(),c=cond();
  const berge=Math.min(A*0.35,per*1),palier=A*0.3,deep=Math.max(0,A-berge-palier);
  let sol;
  if(so&&so.dr&&'ghi'.includes(so.dr))sol='nappe';
  else if(so&&(so.cat==='a'||so.clay>=35))sol='argile';
  else if(so&&so.cat==='l'&&so.dr&&'def'.includes(so.dr))sol='argile';
  else if(so&&so.cat==='l')sol='apport';
  else if(so)sol='leger';else sol='inconnu';
  const SOLS={nappe:{t:'Mare de nappe, sans aucune étanchéité',d:'Votre sol est très mal drainé : la nappe est proche de la surface. Il suffit de creuser ; l’eau monte d’elle-même en hiver et baisse en été. C’est la solution la plus naturelle.'},
   argile:{t:'Mare naturelle dans l’argile en place, sans bâche',d:'Votre sol est argileux ou peu perméable : on creuse puis on corroie (on compacte à l’état humide) le fond et les berges sur 15 à 20 cm. Le niveau baissera en été et la mare pourra même s’assécher en fin d’été : c’est normal, et même favorable aux amphibiens, car cela élimine les poissons et les prédateurs aquatiques.'},
   apport:{t:'Mare naturelle étanchée à l’argile corroyée',d:'Votre sol limoneux retient l’eau imparfaitement. La solution la plus écologique est une couche de 15 à 20 cm d’argile apportée (idéalement issue d’un chantier proche), mouillée et compactée. Une mare temporaire, qui s’assèche en fin d’été, est acceptée. Alternative : une natte de bentonite (argile naturelle entre deux géotextiles).'},
   leger:{t:'Mare étanchée à l’argile ou à la bentonite',d:'Votre sol est léger et drainant : l’eau s’infiltrerait. Par ordre de préférence écologique : 1) 20 cm d’argile corroyée apportée, 2) natte de bentonite recouverte de 10 cm de terre, 3) en dernier recours, une bâche EPDM de 1 mm sur géotextile (jamais de PVC), entièrement recouverte de substrat.'},
   inconnu:{t:'Faites d’abord un test de percolation',d:'Creusez un trou de 50 cm, remplissez-le d’eau deux fois de suite. S’il reste de l’eau après 48 h, le sol est assez étanche pour une mare naturelle sans bâche ; sinon, il faudra apporter de l’argile ou de la bentonite.'}};
  const vol=A*dmax*0.45;
  const mats=[['Déblais à évacuer ou réutiliser',`${nf(vol*1.25,1)} m³`,'Volume creusé avec pentes douces, foisonnement compris ; idéal pour créer une butte ou un talus voisin']];
  if(sol==='apport'||sol==='leger')mats.push(['Argile à corroyer (solution 1)',`${nf(A*1.25*0.2,1)} m³`,`≈ ${nf(A*1.25*0.2*1.8,1)} t, couche de 20 cm sur fond et berges`]);
  if(sol==='apport'||sol==='leger')mats.push(['ou natte de bentonite (solution 2)',`${nf(A*1.3+per*0.5)} m²`,'Avec recouvrements de 30 cm et ancrage en tranchée']);
  if(sol==='leger')mats.push(['ou bâche EPDM 1 mm (dernier recours)',`${nf((Lx+2*dmax+1)*(Wy+2*dmax+1))} m²`,`Dimension ≈ ${nf(Lx+2*dmax+1,1)} × ${nf(Wy+2*dmax+1,1)} m ; + autant de géotextile 300 g/m² dessous et dessus`]);
  if(sol==='leger'||sol==='apport')mats.push(['Sable de pose (sous natte ou bâche)',`${nf(A*1.2*0.05,2)} m³`,'5 cm pour protéger des cailloux et des racines']);
  mats.push(['Substrat pauvre (terre argileuse, sans compost)',`${nf(A*0.1,1)} m³`,'10 cm sur le fond pour enraciner les plantes ; jamais de terreau (il nourrit les algues)']);
  mats.push(['Galets et pierres plates',`${nf(per*0.3,1)} m²`,'Une « plage » en pente très douce pour l’accès de la faune']);
  mats.push(['Bois mort et souches','quelques pièces','Abris pour amphibiens et insectes, sur la berge']);
  const plants=PONDPL.map(Z=>{let sp=Z.sp.slice(0,3),area=Z.k==='berge'?berge*0.5:Z.k==='palier'?palier*0.5:deep,dens=Z.k==='berge'?4:Z.k==='palier'?3:Z.k==='oxy'?0.5:0.25;
    if(Z.k==='flot'){if(dmax<0.6||A<8)sp=sp.filter(x=>x[1]!=='Nymphaea alba');area=deep}
    if((Z.k==='oxy'||Z.k==='flot')&&deep<=0)return{z:Z.z,rows:[]};
    const tot=Math.max(sp.length,Math.ceil(area*dens));return{z:Z.z,rows:sp.map((x,i)=>({n:x[0],l:x[1],q:Math.floor(tot/sp.length)+(i<tot%sp.length?1:0)}))}});
  const site=[];const st=S.stats;
  if(st)site.push(st.grow>=4?['ok',`Ensoleillement de ${nf(st.grow,1)} h par jour en saison : bon pour la vie de la mare (idéal : 5 à 6 h).`]:['ko',`Seulement ${nf(st.grow,1)} h de soleil par jour : la mare sera fraîche et moins riche ; évitez l’ombre complète.`]);
  const ce=centLL(p.pts);const trees=obsAll().filter(x=>x.type==='caduc'&&llDist(ce,[x.lat,x.lng])<10);
  if(trees.length)site.push(['ko','Arbres caducs à moins de 10 m : les feuilles tombées enrichissent l’eau et la comblent. Éloignez la mare ou retirez une partie des feuilles chaque automne.']);
  const d=parcelDist(p.pts,true);if(d!=null)site.push([d>=1?'ok':'ko',`Distance à la limite cadastrale : ${nf(d,1)} m. Gardez au moins 1 m pour l’accès et ne modifiez pas l’écoulement des eaux vers le voisin.`]);
  return{A,per,dmax,Lx,Wy,sol,S:SOLS[sol],mats,plants,berge,palier,deep,vol,site};
}
const POND_STEPS=['Choisir l’emplacement : au moins une demi-journée de soleil, loin des grands arbres caducs, au point bas naturel du terrain si possible.','Tracer la forme au tuyau d’arrosage ou au cordeau ; des contours sinueux multiplient les berges.','Décaper la terre végétale (riche) et la mettre de côté pour le jardin : elle ne doit pas aller dans la mare.','Creuser par paliers : une berge en pente très douce (1 pour 5 au moins, 20 %) sur la moitié du pourtour, côté sud de préférence ; un palier à 10–30 cm ; une zone plus profonde à {d} m pour que la faune passe l’hiver hors gel.','Vérifier que le bord est partout au même niveau (niveau laser, ou niveau à bulle posé sur une longue planche) : c’est le point clé.','Réaliser l’étanchéité selon la solution conseillée ci-dessus, puis couvrir le fond de 10 cm de substrat pauvre.','Laisser se remplir avec l’eau de pluie (ou une gouttière détournée) ; l’eau du robinet, riche en calcaire et en nitrates, favorise les algues.','Planter au printemps (avril–juin), en petit nombre : la nature fera le reste. Ne pas introduire d’animaux, ni d’œufs ou de têtards prélevés ailleurs.'];
const POND_TOOLS=['Cordeau, piquets et tuyau d’arrosage pour le tracé','Bêche, pelle, pioche et brouette','Mini-pelle en location si plus de 10 m³ à creuser','Niveau laser, ou niveau à bulle et longue planche droite','Dame ou pilon pour compacter (corroyer) l’argile','Râteau, cutter et ciseaux (natte ou bâche)','Arrosoir et épuisette pour l’entretien'];
const POND_FAUNA=['Aucun poisson : ils mangent les œufs, les têtards et les larves de libellules.','Pentes très douces et plage de galets : les hérissons et les jeunes amphibiens peuvent sortir de l’eau.','Une bande de végétation non fauchée de 1 à 2 m autour de la mare, et un tas de bois ou de pierres à proximité pour l’hivernage des amphibiens.','Aucun produit : ni anti-algues, ni engrais, ni pesticides à proximité ; pas de pompe, ni de fontaine, ni d’éclairage nocturne.','Plantes indigènes uniquement. Ne jamais introduire de jussies, de myriophylle du Brésil, d’hydrocotyle fausse-renoncule, d’élodées ou de lagarosiphon : ce sont des espèces exotiques envahissantes, dont plusieurs sont interdites dans l’Union européenne.','Curage partiel seulement : retirer au plus un tiers de la vase et des plantes, en octobre, tous les 3 à 5 ans, et laisser les débris quelques jours au bord pour que la petite faune regagne l’eau.','Robot de tonte : ne jamais le faire tourner la nuit (hérissons).','Sécurité des jeunes enfants : clôture basse autour de la mare ou grille rigide posée juste sous la surface, qui laisse passer la faune.'];
function renderPonds(){
  $('#pondBox').innerHTML=S.ponds.length?S.ponds.map((p,i)=>{const I=pondInfo(p);return `<div class="card xcard" data-k="ponds" data-id="${p.id}">
   <div class="xhead"><h4>Pièce d’eau ${i+1} : ${nf(I.A,1)} m², ${nf(I.per,1)} m de berges</h4>${delBtn}</div>
   <div class="frow"><label>Profondeur maximale (m)<input type="number" data-f="depth" min="0.3" max="2" step="0.1" value="${nf(I.dmax,1).replace(',','.')}"></label></div>
   <p>Zones : berge humide ≈ ${nf(I.berge,1)} m², palier ≈ ${nf(I.palier,1)} m², zone profonde ≈ ${nf(I.deep,1)} m² à ${nf(I.dmax,1)} m.</p>
   <h4>Solution conseillée selon votre sol : ${esc(I.S.t)}</h4><p>${esc(I.S.d)}</p>
   ${I.site.length?`<ul>${I.site.map(([k,t])=>`<li class="${k==='ok'?'okk':'koo'}">${esc(t)}</li>`).join('')}</ul>`:''}
   <h4>Étapes (de septembre à novembre, sol ressuyé)</h4><ol>${POND_STEPS.map(t=>`<li>${esc(t.replace('{d}',nf(I.dmax,1)))}</li>`).join('')}</ol>
   <h4>Matériaux</h4><table class="stack"><thead><tr><th>Matériau</th><th class="n">Quantité</th><th>Détail</th></tr></thead><tbody>${I.mats.map(m=>`<tr><td><b>${esc(m[0])}</b></td><td class="n">${esc(m[1])}</td><td>${esc(m[2])}</td></tr>`).join('')}</tbody></table>
   <h4>Outils</h4><ul>${POND_TOOLS.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
   <h4>Plantes aquatiques indigènes</h4><table class="stack"><thead><tr><th>Zone</th><th>Plante</th><th class="n">Quantité</th></tr></thead><tbody>${I.plants.flatMap(Z=>Z.rows.map(x=>`<tr><td>${esc(Z.z)}</td><td><div class="pcell"><div class="ph sm" data-ph="${esc(x.l)}" data-n="${esc(x.n)}" data-small="1"></div><div><b>${esc(x.n)}</b><br><i class="src">${esc(x.l)}</i></div></div></td><td class="n">${x.q}</td></tr>`)).join('')}</tbody></table>
   <h4>Protéger la faune et la flore</h4><ul>${POND_FAUNA.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
   <p class="note">Selon la commune et la région, un creusement important ou une modification sensible du relief peut demander une autorisation d’urbanisme : renseignez-vous auprès du service urbanisme avant les travaux.</p></div>`}).join(''):'<p class="empty">Aucune pièce d’eau dessinée. Cliquez sur « Dessiner une pièce d’eau », puis tracez son contour sur la carte.</p>';
}

/* --- Matériel --- */
function machines(){
  const out=[],lawnA=lawnArea(),lr=lawnRank()[0],hed=S.hedges.reduce((s,h)=>s+lenLL(h.pts),0),hMax=Math.max(0,...S.hedges.map(h=>h.h));
  const comp=S.lastCompo,bedA=comp?comp.A:0,trees=S.fruits.length+(comp?comp.rows.filter(x=>x.p.t==='arbre').reduce((s,x)=>s+x.qty,0):0),shrubs=comp?comp.rows.filter(x=>x.p.t==='arbuste').reduce((s,x)=>s+x.qty,0):0;
  if(lawnA>0){
    if(lr&&lr.t.k==='golf')out.push(['Tondeuse hélicoïdale de précision','Green de golf','Seule une tondeuse à cylindre coupe proprement à 3–5 mm ; matériel professionnel coûteux.']);
    else if(lr&&lr.t.k==='prairie')out.push([lawnA>500?'Motofaucheuse à barre de coupe':'Faux, ou débroussailleuse avec lame à herbe','Fauche de la prairie fleurie','1 à 2 fauches par an, puis râteau-fourche pour exporter le foin.']);
    else out.push([lawnA<=150?'Tondeuse hélicoïdale manuelle':lawnA<=600?'Tondeuse électrique sur batterie':lawnA<=1500?'Tondeuse thermique tractée, ou robot de tonte':'Tracteur tondeuse ou tondeuse autoportée',`Pelouse de ${nf(lawnA)} m²`,lawnA<=150?'Silencieuse, sans énergie, coupe nette.':lawnA<=1500&&lawnA>600?'Si robot : le programmer uniquement en journée pour protéger les hérissons.':'Choisir un modèle avec fonction mulching : l’herbe broyée nourrit le sol.']);
    out.push(['Coupe-bordures sur batterie','Bords de pelouse et pieds de murs','Plus léger et silencieux qu’une débroussailleuse thermique.']);
    if(lr&&(lr.t.k==='orn'||lr.t.k==='fam')&&lawnA>200)out.push(['Scarificateur électrique (ou en location)','Entretien du gazon','Une fois par an au printemps.']);
  }
  if(hed>0)out.push([hed<=20?'Cisaille à haie manuelle':hed<=80?'Taille-haie électrique sur batterie':'Taille-haie thermique ou sur batterie professionnelle',`${nf(hed)} m de haie`,(hMax>2?'Prévoir un taille-haie sur perche pour le dessus des haies hautes. ':'')+'Lame de 50–60 cm pour une haie taillée.']);
  if(comp||S.fruits.length||hed)out.push(['Sécateur à lame franche (bypass) et ébrancheur','Taille des arbustes, rosiers, petits fruits','Indispensable ; désinfecter les lames entre deux arbres malades.']);
  if(trees)out.push(['Scie d’élagage et échenilloir (perche télescopique)',`${trees} arbre(s)`,'Taille des fruitiers et des arbres sans échelle.']);
  if(hed>30||trees>=3||shrubs>=6)out.push(['Broyeur de végétaux électrique (à rouleau)','Recycler les tailles en paillage','Plus silencieux qu’un broyeur à couteaux ; à partager entre voisins ou à louer.']);
  if(bedA||S.lastCompo)out.push(['Grelinette (biofourche), binette, transplantoir','Travail du sol des massifs'+(comp&&comp.key==='viv'?' et du potager':''),'La grelinette aère le sol sans le retourner ni perturber sa vie.']);
  out.push(['Récupérateur d’eau de pluie et arrosage goutte-à-goutte','Arrosage économe','Une cuve de 300 à 1000 L sur une descente de gouttière ; arroser au pied, le soir.']);
  out.push(['Composteur (bac ou silo)','Recycler tontes, feuilles et déchets de cuisine','Fournit gratuitement l’amendement des massifs.']);
  const steep=S.taluses.map(talusVals).filter(v=>v.pct!=null&&v.pct>=30);
  if(steep.length)out.push(['Débroussailleuse sur batterie avec harnais, ou faucille',`Talus de ${nf(Math.max(...steep.map(v=>v.pct)))} % de pente`,'Aucune tondeuse sur une pente de plus de 30 % (risque de renversement) ; travailler de travers, jamais face à la pente.']);
  if(S.ponds.length)out.push(['Épuisette et râteau à mare','Entretien de la pièce d’eau','Pas de pompe ni de filtre : la mare naturelle s’équilibre seule.']);
  return typeof v4Machines==='function'?v4Machines(out):out;
}
function renderMachines(){const M=machines();S.lastMach=M;$('#mach').innerHTML='<thead><tr><th>Matériel</th><th>Pour</th><th>Conseil</th></tr></thead><tbody>'+M.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')+'</tbody>'}

/* --- Talus et pentes --- */
async function elevWal(pts){return Promise.all(pts.map(async([la,lo])=>{const d=0.0005,j=await getJSON(`https://geoservices.wallonie.be/arcgis/rest/services/RELIEF/WALLONIE_MNT_2021_2022/MapServer/identify?geometry=${lo},${la}&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=0&mapExtent=${lo-d},${la-d},${lo+d},${la+d}&imageDisplay=200,200,96&returnGeometry=false&f=json`,12000);
  for(const r of (j.results||[])){const v=Object.values(r.attributes||{}).map(x=>parseFloat(String(x).replace(',','.'))).find(x=>isFinite(x)&&x>-50&&x<1000);if(v!=null)return v}throw new Error('hors Wallonie')}))}
async function elevVl(pts){return Promise.all(pts.map(async([la,lo])=>{const e=0.00005,j=await getJSON(`https://geo.api.vlaanderen.be/DHMV/wms?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=DHMVII_DTM_1m&query_layers=DHMVII_DTM_1m&styles=&srs=EPSG:4326&bbox=${lo-e},${la-e},${lo+e},${la+e}&width=11&height=11&x=5&y=5&info_format=application/json`,12000);
  const p=j.features&&j.features[0]&&j.features[0].properties;const v=p&&Object.values(p).map(x=>parseFloat(x)).find(x=>isFinite(x)&&x>-50&&x<1000);if(v==null)throw new Error('hors Flandre');return v}))}
async function elevOM(pts){const j=await getJSON(`https://api.open-meteo.com/v1/elevation?latitude=${pts.map(p=>p[0].toFixed(6)).join(',')}&longitude=${pts.map(p=>p[1].toFixed(6)).join(',')}`,12000);if(!j.elevation||j.elevation.length!==pts.length)throw new Error('élévation');return j.elevation}
async function getElev(pts){
  try{return await Promise.any([elevWal(pts).then(z=>({z,src:'LiDAR Wallonie 2021–2022 (MNT 0,5 m, SPW)',fine:1})),elevVl(pts).then(z=>({z,src:'LiDAR Vlaanderen DHMV II (DTM 1 m)',fine:1}))])}
  catch(e){const z=await elevOM(pts);return{z,src:'Copernicus DEM 90 m via Open-Meteo (précision faible pour un talus)',fine:0}}
}
function talusSamples(pts){
  const o=pts[0],P=pts.map(p=>toXY(o,p)),xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),out=pts.slice(),n=5;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=x0+(i+.5)*(x1-x0)/n,y=y0+(j+.5)*(y1-y0)/n;if(pip(x,y,P))out.push([o[0]+y/111320,o[1]+x/(111320*Math.cos(o[0]*R))])}
  return out.slice(0,30);
}
function fitPlane(XY,Z){
  let n=XY.length,sx=0,sy=0,sz=0,sxx=0,syy=0,sxy=0,sxz=0,syz=0;
  XY.forEach(([x,y],i)=>{const z=Z[i];sx+=x;sy+=y;sz+=z;sxx+=x*x;syy+=y*y;sxy+=x*y;sxz+=x*z;syz+=y*z});
  const M=[[sxx,sxy,sx],[sxy,syy,sy],[sx,sy,n]],V=[sxz,syz,sz];
  const det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  const D=det(M);if(Math.abs(D)<1e-9)return null;
  const col=(k)=>M.map((r,i)=>r.map((v,j)=>j===k?V[i]:v));
  return{a:det(col(0))/D,b:det(col(1))/D,c:det(col(2))/D};
}
async function estimateTalus(t){
  t.est={loading:1};renderTalus();
  try{
    const pts=talusSamples(t.pts),E=await getElev(pts),o=t.pts[0],XY=pts.map(p=>toXY(o,p)),pl=fitPlane(XY,E.z);
    if(!pl)throw new Error('géométrie insuffisante');
    const g=Math.hypot(pl.a,pl.b),pct=g*100,ux=-pl.a/(g||1),uy=-pl.b/(g||1),asp=((Math.atan2(ux,uy)/R)+360)%360;
    const proj=t.pts.map(p=>{const [x,y]=toXY(o,p);return x*ux+y*uy}),hor=Math.max(...proj)-Math.min(...proj),dz=g*hor;
    t.est={pct,deg:Math.atan(g)/R,hor,len:Math.hypot(hor,dz),dz,asp,zmin:Math.min(...E.z),zmax:Math.max(...E.z),src:E.src,fine:E.fine};
  }catch(e){t.est={err:'Relief indisponible ('+(e.message||'service')+') : saisissez la pente à la main.'}}
  drawItems();renderTalus();renderMachines();
}
function talusVals(t){
  const m=t.man||{},e=t.est||{},area=t.pts?areaLL(t.pts):(m.area||0);
  let pct=null,src='';
  if(m.pct>0){pct=m.pct;src='saisie manuelle'}
  else if(m.len>0&&m.dz>0&&m.len>m.dz){pct=m.dz/Math.sqrt(m.len*m.len-m.dz*m.dz)*100;src='saisie manuelle (longueur et dénivelé)'}
  else if(e.pct!=null){pct=e.pct;src='estimation : '+e.src}
  const len=m.len>0?m.len:e.len,dz=m.dz>0?m.dz:(e.dz!=null?e.dz:(pct!=null&&len?len*Math.sin(Math.atan(pct/100)):null));
  const asp=m.asp!=null&&m.asp!==''?+m.asp:(e.asp!=null?e.asp:null);
  return{area,pct,len,dz,asp,src,deg:pct!=null?Math.atan(pct/100)/R:null};
}
function slopeClass(p){
  if(p==null)return null;
  if(p<10)return{k:0,l:'Pente faible',c:'#7cb342',tips:['Plantation classique ; une pelouse reste facile à tondre.','Paillage organique (BRF, écorces) possible.']};
  if(p<33)return{k:1,l:'Pente modérée',c:'#c0ca33',tips:['Plantez en quinconce, chaque plant dans une petite cuvette ouverte vers le haut pour retenir l’eau.','Au-delà de 25–30 %, la tonte devient difficile : préférez des couvre-sols à une pelouse.','Paillage en BRF grossier ou toile de jute biodégradable (300–500 g/m²).']};
  if(p<60)return{k:2,l:'Pente forte',c:'#ffb300',tips:['Posez une toile de coco biodégradable (700 g/m²) agrafée tous les 50 cm, puis plantez à travers des fentes en croix.','Densité de plantation augmentée de 30 % ; arbustes drageonnants dont les racines tiennent la terre.','Petites banquettes ou fascines de saule tous les 1 m de dénivelé pour casser le ruissellement.','Pas de tondeuse : entretien à la débroussailleuse ou à la main.']};
  if(p<100)return{k:3,l:'Pente très forte',c:'#f4511e',tips:['Génie végétal indispensable : fascines ou tressages de saule vivant, géonatte coco renforcée (900 g/m²), plantation serrée.','Faites valider la stabilité par un professionnel (risque de glissement, surtout sur sol argileux ou limoneux).','Travaux à la main, depuis le bas, encordé si besoin.']};
  return{k:4,l:'Pente instable (plus de 45°)',c:'#b71c1c',tips:['Un ouvrage de soutènement (mur, gabions, caissons végétalisés) est nécessaire avant toute plantation : faites appel à un professionnel.','Ne retirez pas la végétation existante avant stabilisation.']};
}
function talusPlants(V){
  const c={...cond()};
  if(V.asp!=null&&V.pct>15){const sud=V.asp>=135&&V.asp<=225,nord=V.asp>=315||V.asp<=45;if(sud)c.eau=c.eau==='h'?'f':'d';if(nord&&V.pct>30&&c.expo==='s')c.expo='m'}
  if(V.pct>33&&c.eau==='h')c.eau='f';
  const pool=PL.filter(p=>p.st.includes('tal')).map(p=>({p,...scorePlant(p,c)})).filter(x=>x.ok).sort((a,b)=>b.score-a.score);
  const A=V.area||0,k=V.pct>33?1.3:1,sh=pool.filter(x=>x.p.t==='arbuste').slice(0,A>=10?3:2),cv=pool.filter(x=>x.p.t==='vivace'||x.p.t==='fougere').slice(0,3),gr=pool.filter(x=>x.p.t==='graminee').slice(0,2);
  const rows=[];
  sh.forEach(x=>rows.push({role:'Arbuste drageonnant',p:x.p,q:Math.max(1,Math.round(A/4/sh.length))}));
  const shC=gr.length?0.6:1;cv.forEach(x=>rows.push({role:'Couvre-sol',p:x.p,q:Math.max(1,Math.ceil(A*shC/cv.length*x.p.d*k))}));
  gr.forEach(x=>rows.push({role:'Graminée en touffe',p:x.p,q:Math.max(1,Math.ceil(A*0.4/gr.length*x.p.d*k))}));
  return{rows,c};
}
function talusSupplies(V){
  const A=V.area||0,p=V.pct||0,out=[];if(!A)return out;
  if(p>=33)out.push(['Toile de coco biodégradable '+(p>=60?'900':'700')+' g/m²',`${nf(A*1.15)} m²`,'Rouleaux de 1 à 2 m, recouvrement de 15 cm']);
  else if(p>=10)out.push(['Toile de jute ou BRF grossier',`${nf(A*1.1)} m² ou ${nf(A*0.08,1)} m³`,'Protection du sol pendant l’installation']);
  if(p>=10)out.push(['Agrafes en U (acier ou bois)',`${Math.ceil(A*(p>=33?3:2))}`,`${p>=33?3:2} agrafes par m²`]);
  if(p>=33&&V.dz){const w=V.len?A/V.len:Math.sqrt(A),rows=Math.max(1,Math.floor(V.dz));out.push(['Fascines de saule vivant',`${nf(rows*w,1)} m`,`${rows} ligne(s) de ${nf(w,1)} m, une par mètre de dénivelé`]);out.push(['Pieux en bois (fascines)',`${Math.ceil(rows*w)+rows}`,'Un pieu tous les 1 m de fascine']);}
  out.push(['Compost (cuvettes de plantation)',`${nf(A*0.01*1000)} L`,'Une poignée par plant, sans travailler tout le sol (risque d’érosion)']);
  return out;
}
function renderTalus(){
  const box=$('#talusBox');if(!box)return;
  box.innerHTML=S.taluses.length?S.taluses.map((t,i)=>{const V=talusVals(t),C=slopeClass(V.pct),e=t.est||{},m=t.man||{},TP=V.area?talusPlants(V):{rows:[]},SU=talusSupplies(V);
   return `<div class="card xcard" data-k="taluses" data-id="${t.id}">
   <div class="xhead"><h4>Talus ${i+1}${V.area?' : '+nf(V.area)+' m²':''}</h4>${delBtn}</div>
   ${t.pts?(e.loading?'<p class="note">Estimation du relief à partir du modèle de terrain…</p>':e.err?`<p class="koo">${esc(e.err)}</p>`:e.pct!=null?`<p>Estimation depuis la carte : pente <b>${nf(e.pct)} %</b> (${nf(e.deg)}°), longueur le long de la pente <b>${nf(e.len,1)} m</b>, dénivelé <b>${nf(e.dz,1)} m</b>, versant tourné vers le <b>${card(e.asp)}</b>. Altitudes de ${nf(e.zmin,1)} à ${nf(e.zmax,1)} m. Source : ${esc(e.src)}.</p>${e.fine?'':'<p class="koo">Modèle de terrain grossier : mesurez sur place pour un petit talus.</p>'}`:''):'<p class="note">Talus saisi à la main.</p>'}
   <div class="frow">${t.pts?'':`<label>Surface (m²)<input type="number" data-f="area" min="1" step="1" value="${m.area||''}"></label>`}
    <label>Longueur le long de la pente (m)<input type="number" data-f="len" min="0.5" step="0.1" value="${m.len||''}" placeholder="${e.len?nf(e.len,1):''}"></label>
    <label>Dénivelé (m)<input type="number" data-f="dz" min="0.1" step="0.1" value="${m.dz||''}" placeholder="${e.dz?nf(e.dz,1):''}"></label>
    <label>ou pente (%)<input type="number" data-f="pct" min="1" max="300" step="1" value="${m.pct||''}" placeholder="${e.pct?nf(e.pct):''}"></label>
    <label>Versant tourné vers<select data-f="asp"><option value="">${e.asp!=null?'Auto ('+card(e.asp)+')':'—'}</option>${COMPASS.map((c,j)=>`<option value="${j*45}"${m.asp!==''&&m.asp!=null&&+m.asp===j*45?' selected':''}>${c}</option>`).join('')}</select></label>
    ${t.pts?'<button data-f="reest" type="button">Ré-estimer</button>':''}</div>
   ${V.pct!=null?`<div class="slopebar"><i style="left:calc(${Math.min(100,V.pct)}% - 2px)"></i><b style="left:0">0 %</b><b style="left:10%">10</b><b style="left:33%">33</b><b style="left:60%">60</b><b style="right:0">100 %</b></div>
    <h4 style="color:${C.c}">${C.l} : ${nf(V.pct)} % (${nf(V.deg)}°)</h4><p class="note">Valeur retenue : ${esc(V.src)}. Une pente de 100 % correspond à 45° ; 33 % à environ 18°.</p>
    <ul>${C.tips.map(x=>`<li>${esc(x)}</li>`).join('')}${V.asp!=null&&V.pct>15?`<li>${V.asp>=135&&V.asp<=225?'Versant sud : chaud et sec, privilégiez des plantes de terrain sec et paillez.':V.asp>=315||V.asp<=45?'Versant nord : frais et plus ombragé.':'Versant est ou ouest : conditions intermédiaires.'}</li>`:''}</ul>`:'<p class="note">Indiquez la pente (estimation automatique, longueur et dénivelé, ou pourcentage).</p>'}
   ${V.pct!=null&&C.k<4&&TP.rows.length?`<h4>Plantation conseillée pour ce talus</h4><table class="stack"><thead><tr><th>Rôle</th><th>Plante</th><th class="n">Quantité</th></tr></thead><tbody>${TP.rows.map(x=>`<tr><td>${esc(x.role)}</td><td><div class="pcell"><div class="ph sm" data-ph="${esc(x.p.l)}" data-n="${esc(x.p.n)}" data-small="1"></div><div><b>${esc(x.p.n)}</b><br><i class="src">${esc(x.p.l)}</i></div></div></td><td class="n">${x.q}</td></tr>`).join('')}</tbody></table>`:''}
   ${SU.length&&V.pct!=null?`<h4>Fournitures</h4><table class="stack"><thead><tr><th>Fourniture</th><th class="n">Quantité</th><th>Détail</th></tr></thead><tbody>${SU.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td class="n">${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table>`:''}
   <ul><li>Planter d’octobre à mars, du bas vers le haut, sans retourner le sol.</li><li>Désherber à la main les deux premières années ; ne jamais laisser le sol nu.</li></ul></div>`}).join(''):'<p class="empty">Aucun talus. Dessinez-le sur la carte (« Dessiner un talus ») : la pente est estimée à partir du relief LiDAR, ou ajoutez-le à la main.</p>';
  watchPhotos(box);
}
$('#addTalusMan').addEventListener('click',()=>{S.taluses.push({id:++itemId,pts:null,man:{area:20}});renderTalus();renderMachines()});
$('#amenagements').addEventListener('change',e=>{
  const card=e.target.closest('[data-k="taluses"]');if(!card)return;e.stopImmediatePropagation();
  const t=S.taluses.find(x=>x.id==card.dataset.id),f=e.target.dataset.f;if(!t||!f)return;
  if(f==='asp')t.man.asp=e.target.value;else{const v=parseFloat(e.target.value);t.man[f]=v>0?v:undefined}
  drawItems();renderTalus();renderMachines();
},true);
$('#amenagements').addEventListener('click',e=>{const card=e.target.closest('[data-k="taluses"]');if(!card||e.target.dataset.f!=='reest')return;const t=S.taluses.find(x=>x.id==card.dataset.id);if(t)estimateTalus(t)});

function renderExtras(){renderHedges();renderFruits();renderVines();renderLawn();renderPonds();renderTalus();renderMachines();watchPhotos($('#amenagements'));if(typeof renderV4==='function')renderV4();if(typeof renderPros==='function')renderPros()}
function amenChange(e){
  const t=e.target;if(t.id==='lawnUse'){S.lawnUse=t.value;renderLawn();renderMachines();return}
  if(t.id==='lawnA'){S.lawnManual=Math.max(0,parseFloat(t.value)||0);renderLawn();renderMachines();return}
  const card=t.closest('[data-k]');if(!card)return;const it=S[card.dataset.k].find(x=>x.id==card.dataset.id),f=t.dataset.f;if(!it||!f)return;
  if(['h','depth'].includes(f)){const v=parseFloat(t.value);if(v>0)it[f]=v}else if(['rows','sp','cep'].includes(f))it[f]=+t.value;else it[f]=t.value;
  if(f==='type'){it.h=HEDGE_T[it.type].h[1]>2&&it.type!=='taillee'?HEDGE_T[it.type].h[0]:HEDGE_T[it.type].h[1]}
  drawItems();renderExtras();
}
$('#amenagements').addEventListener('change',amenChange);$('#pelouse').addEventListener('change',amenChange);
function amenClick(e){
  if(e.target.dataset.f!=='del')return;const card=e.target.closest('[data-k]');if(!card)return;
  pushUndo();S[card.dataset.k]=S[card.dataset.k].filter(x=>x.id!=card.dataset.id);drawItems();renderExtras();toast('Élément supprimé',{undo:true});
}
$('#amenagements').addEventListener('click',amenClick);$('#pelouse').addEventListener('click',amenClick);

$('#logo').src='data:image/png;base64,'+ICON;
/* ---------- Exports : rapport PDF / Word, liste Excel ---------- */
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function zipBlob(files,type){
  const enc=new TextEncoder(),parts=[],cd=[];let off=0;
  for(const f of files){const nm=enc.encode(f.name),d=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(d);
    const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);
    parts.push(new Uint8Array(h.buffer),nm,d);
    const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(14,0x21,true);c.setUint32(16,crc,true);c.setUint32(20,d.length,true);c.setUint32(24,d.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    cd.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+d.length}
  const cs=cd.reduce((s,a)=>s+a.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cd,new Uint8Array(e.buffer)],{type});
}
const xe=v=>String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
const b64u8=b=>{const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
async function svgToPng(svg){
  if(!svg||!svg.clientWidth||!svg.innerHTML)return null;
  const W=svg.clientWidth,H=svg.clientHeight,cl=svg.cloneNode(true),src=[svg,...svg.querySelectorAll('*')],dst=[cl,...cl.querySelectorAll('*')];
  src.forEach((el,i)=>{const cs=getComputedStyle(el),d=dst[i];['fill','stroke','stroke-width','opacity','fill-opacity','stroke-opacity','stroke-dasharray','font-size','font-family','font-weight','paint-order'].forEach(p=>{const v=cs.getPropertyValue(p);if(v)d.style.setProperty(p,v)})});
  cl.setAttribute('xmlns','http://www.w3.org/2000/svg');cl.setAttribute('width',W);cl.setAttribute('height',H);cl.setAttribute('viewBox',`0 0 ${W} ${H}`);
  cl.insertAdjacentHTML('afterbegin',`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`);
  const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(cl));
  const img=new Image();await new Promise((ok,ko)=>{img.onload=ok;img.onerror=ko;img.src=url});
  const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;const x=cv.getContext('2d');x.scale(2,2);x.drawImage(img,0,0);
  return{data:cv.toDataURL('image/png'),w:W,h:H};
}
const txt=el=>el?el.innerText.replace(/\s+\n/g,'\n').trim():'';
async function reportModel(){
  const keep=curTabs();applyTabs(TABS.slice());await new Promise(r=>setTimeout(r,350));try{return await reportModel0()}finally{applyTabs(keep)}
}
async function reportModel0(){
  const B=[],c=S.clim,so=soilNow(),k=cond(),r=S.lastCompo;
  const H1=t=>B.push({h:1,t}),H2=t=>B.push({h:2,t}),P=t=>t&&B.push({p:t}),T=(head,rows)=>rows.length&&B.push({tb:{head,rows}}),U=a=>a.length&&B.push({ul:a}),I=im=>im&&B.push({img:im});
  B.push({logo:1});B.push({title:'Plantañ.ia — rapport de site et de plantation'});
  P(`Point d’étude : ${S.lat!=null?S.lat.toFixed(5)+', '+S.lon.toFixed(5):'non défini'} · rapport du ${new Date().toLocaleDateString('fr-BE')}`);
  if(S.parcel)P(`Parcelle cadastrale ${S.parcel.id||''} (${S.parcel.src}). Le plan cadastral est indicatif et n’a pas valeur de bornage.`);
  H1('1. Climat');
  if(c){T(['Indicateur','Valeur'],[['Pluie annuelle',nf(c.pYear)+' mm'],['Température moyenne',nf(c.tYear,1)+' °C'],['Ensoleillement',c.sunYear==null?'–':nf(c.sunYear)+' h/an'],['Zone de rusticité',usda(c.extMin)+' (min. annuel moyen '+nf(c.extMin,1)+' °C)'],['Dernière gelée (médiane)',doyTxt(c.lastFrost)],['Première gelée (médiane)',doyTxt(c.firstFrost)],['Bilan hydrique été (P − ETP)',nf(c.summerBal)+' mm'],['Vent max. journalier moyen',nf(c.windMean)+' km/h'],['Altitude',nf(c.elev)+' m']]);
    T(['Mois','Pluie (mm)','T moy. (°C)','T min (°C)','T max (°C)','Soleil (h)'],MOL.map((m,i)=>[m,nf(c.p[i]),nf(c.t[i],1),nf(c.tn[i],1),nf(c.tx[i],1),nf(c.sun[i])]));
    I(await svgToPng($('#ombro svg')));P(txt($('#drynote')));P('Source : normales 1995–2024, réanalyse ERA5 (Copernicus) via Open-Meteo.')}
  else P('Données climatiques non chargées.');
  H1('2. Sol');
  if(so){T(['Caractéristique','Valeur'],[...(so.belg?[['Texture (carte belge)',so.belg],['Drainage naturel',so.dr?BDR[so.dr]:'–'],['Sigle pédologique',so.sigle||'–']]:[['Argile',nf(so.clay)+' %'],['Limon',nf(so.silt)+' %'],['Sable',nf(so.sand)+' %']]),['pH',so.ph?nf(so.ph,1):'à mesurer']]);P(txt($('#soiltxt')));P('Source : '+$('#soilsrc').textContent)}else P('Sol non renseigné.');
  H1('3. Soleil et ombres');
  P(txt($('#expotxt')));const st=$('#seasons');if(st&&st.rows.length>1)T([...st.rows[0].cells].map(x=>x.textContent),[...st.rows].slice(1).map(rw=>[...rw.cells].map(x=>x.textContent)));
  const ob=[...S.shapes.map(sh=>`${sh.name} (${SHNAT[sh.nat]}) : ${nf(sh.h,1)} m de haut`),...S.obs.map(o=>`${o.name||OBT[o.type].l} : ${nf(o.h,1)} m de haut, ${nf(o.w,1)} m de large, à ${nf(relObs(o).dist)} m au ${card(relObs(o).brg)}`)];if(ob.length){H2('Obstacles pris en compte');U(ob)}
  I(await svgToPng($('#sunpath svg')));
  H1('4. Conditions retenues pour le choix des plantes');
  T(['Critère','Valeur'],[['Rusticité',k.tmin!=null?'zone '+usda(k.tmin):'–'],['Exposition',EXL[k.expo]],['Humidité du sol',WL[k.eau]],['Texture',SL[k.sol]],['pH',nf(k.ph,1)]]);
  if(r){H1('5. Composition : '+r.st.l);P(r.st.d);P(`Surface : ${nf(r.A)} m².`);
    T(['N°','Rôle','Plante','Nom latin','Quantité','Hauteur (m)','Floraison'],r.rows.map((x,i)=>[i+1,x.role,x.p.n,x.p.l,x.qty,nf(x.p.h,x.p.h<1?2:1),x.p.f.length?MO[x.p.f[0]-1]+(x.p.f.length>1?'–'+MO[x.p.f[x.p.f.length-1]-1]:''):'—']));
    if(S.lastLayout){H2('Plan de plantation');I(await svgToPng($('#plan svg')));P(txt($('#plegend')).replace(/\n/g,' · '))}
    if(S.lastChecks){H2('Contrôles agronomiques et paysagers');T(['Statut','Contrôle','Détail'],S.lastChecks.map(o=>[o.s==='ok'?'OK':o.s==='ko'?'À revoir':'Info',o.t,o.d]))}
    if(S.lastSupplies){H2('Fournitures pour la plantation');T(['Fourniture','Quantité','Conditionnement','Détail'],S.lastSupplies)}
    H2('Entretien type, mois par mois');document.querySelectorAll('#cal .mo').forEach(m=>{B.push({p:m.querySelector('h4').textContent,b:1});U([...m.querySelectorAll('li')].map(li=>li.textContent))})}
  if(S.hedges.length||S.fruits.length||S.vines.length||S.ponds.length||lawnArea()){
    H1('6. Haies, fruitiers, vigne, pelouse et pièce d’eau');
    S.hedges.forEach((h,i)=>{const I2=hedgeInfo(h);H2(`Haie ${i+1} : ${nf(I2.len,1)} m — ${I2.T.l}`);P(`${nf(I2.dens,1)} plants/m, ${I2.n} plants, hauteur entretenue ${nf(h.h,1)} m. ${I2.d!=null?`Distance à la limite : ${nf(I2.d,1)} m (minimum ${nf(I2.min,1)} m).`:''}`);T(['Essence','Nom latin','Feuillage','Plants'],I2.mix.map(m=>[m.n,m.l,m.pers,m.qty]))});
    if(S.fruits.length){H2('Arbres fruitiers');T(['N°','Espèce','Forme','Hauteur / envergure','Distance limite','Remarques'],S.fruits.map((f,i)=>{const F=fruitInfo(f);return[i+1,F.fr.n,F.fo.l,nf(F.fo.h,1)+' / '+nf(F.fo.sp,1)+' m',F.d!=null?nf(F.d,1)+' m (min. '+nf(F.min,1)+')':'–',F.warn.join(' ')||'Emplacement adapté'+'. Variétés : '+F.fr.v]}))}
    S.vines.forEach((v,i)=>{const V=vineInfo(v);H2(`Vigne ${i+1}`);P(`${nf(V.len,1)} m, ${V.n} pieds de ${CEPS[v.cep]}, ${nf(V.wire)} m de fil, ${V.posts} piquets, 3 tendeurs.`)});
    const la=lawnArea();if(la){H2(`Pelouse (${nf(la)} m², usage : ${LUSE[S.lawnUse]})`);T(['Type','Semences','Entretien'],lawnRank().slice(0,4).map(x=>[x.t.n,nf(la*x.t.dose/1000,1)+' kg ('+x.t.dose+' g/m²)',x.t.ent]))}
    S.ponds.forEach((p,i)=>{const D=pondInfo(p);H2(`Pièce d’eau ${i+1} : ${nf(D.A,1)} m², profondeur ${nf(D.dmax,1)} m`);P(D.S.t+'. '+D.S.d);U(D.site.map(x=>x[1]));B.push({p:'Étapes',b:1});U(POND_STEPS.map(t=>t.replace('{d}',nf(D.dmax,1))));T(['Matériau','Quantité','Détail'],D.mats);B.push({p:'Outils',b:1});U(POND_TOOLS);T(['Zone','Plante','Nom latin','Quantité'],D.plants.flatMap(Z=>Z.rows.map(x=>[Z.z,x.n,x.l,x.q])));B.push({p:'Protéger la faune et la flore',b:1});U(POND_FAUNA)});
  }
  if(S.taluses.length){H1('Talus et pentes');S.taluses.forEach((t,i)=>{const V=talusVals(t),C=slopeClass(V.pct);H2(`Talus ${i+1}${V.area?' : '+nf(V.area)+' m²':''}`);
    if(V.pct!=null){P(`${C.l} : ${nf(V.pct)} % (${nf(V.deg)}°)${V.len?', longueur le long de la pente '+nf(V.len,1)+' m':''}${V.dz?', dénivelé '+nf(V.dz,1)+' m':''}${V.asp!=null?', versant '+card(V.asp):''}. Source : ${V.src}.`);U(C.tips);
      if(C.k<4&&V.area){T(['Rôle','Plante','Nom latin','Quantité'],talusPlants(V).rows.map(x=>[x.role,x.p.n,x.p.l,x.q]));T(['Fourniture','Quantité','Détail'],talusSupplies(V))}}else P('Pente non renseignée.')})}
  H1('7. Matériel d’entretien conseillé');T(['Matériel','Pour','Conseil'],machines());
  H1('Sources');U(['Climat : Open-Meteo (ERA5, Copernicus / ECMWF).','Sols : Carte Numérique des Sols de Wallonie (SPW) ; Bodemkaart Vlaanderen (DOV).','Cadastre : SPF Finances (AGDP), SPW (CADMAP), Digitaal Vlaanderen (Adpf).','Distances de plantation : Code civil belge, art. 3.133.','Photos : iNaturalist et Wikimedia Commons (auteurs et licences sur les sites sources).','Les quantités, distances et conseils sont des estimations à vérifier sur place.']);
  return B;
}
/* --- PDF (impression d’un rapport mis en page) --- */
function modelToHtml(B){
  return B.map(b=>b.logo?`<img src="data:image/png;base64,${LOGO}" alt="Plantañ.ia" style="height:90px">`:b.title?`<h1 class="t">${xe(b.title)}</h1>`:b.h===1?`<h1>${xe(b.t)}</h1>`:b.h===2?`<h2>${xe(b.t)}</h2>`:b.p!=null?`<p${b.b?' class="b"':''}>${xe(b.p).replace(/\n/g,'<br>')}</p>`:b.ul?`<ul>${b.ul.map(x=>`<li>${xe(x)}</li>`).join('')}</ul>`:b.tb?`<table><thead><tr>${b.tb.head.map(h=>`<th>${xe(h)}</th>`).join('')}</tr></thead><tbody>${b.tb.rows.map(r=>`<tr>${r.map(v=>`<td>${xe(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:b.img?`<img src="${b.img.data}" style="width:100%;max-width:${Math.min(700,b.img.w)}px">`:'').join('\n');
}
/* --- Word (.docx) --- */
/* --- Excel (.xlsx) --- */
function xlsxBlob(sheets){
  const col=i=>{let s='';i++;while(i){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
  const cell=(v,r,c,st)=>{const ref=col(c)+r;return typeof v==='number'&&isFinite(v)?`<c r="${ref}"${st?` s="${st}"`:''}><v>${v}</v></c>`:`<c r="${ref}" t="inlineStr" s="${st||2}"><is><t xml:space="preserve">${xe(v)}</t></is></c>`};
  const used=new Set(),names=sheets.map(s=>{let n=s.name.replace(/[\\\/\?\*\[\]:]/g,'-').slice(0,31),b=n,i=2;while(used.has(n.toLowerCase()))n=b.slice(0,28)+' '+(i++);used.add(n.toLowerCase());return n});
  const ws=sheets.map(s=>{const w=s.head.map((h,i)=>Math.min(60,Math.max(10,...[h,...s.rows.map(r=>r[i])].map(v=>String(v==null?'':v).length*1.1))));
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${w.map((x,i)=>`<col min="${i+1}" max="${i+1}" width="${x.toFixed(1)}" customWidth="1"/>`).join('')}</cols><sheetData><row r="1">${s.head.map((h,c)=>cell(h,1,c,1)).join('')}</row>${s.rows.map((r,ri)=>`<row r="${ri+2}">${r.map((v,c)=>cell(v,ri+2,c)).join('')}</row>`).join('')}</sheetData></worksheet>`});
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2D6A3D"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  const files=[{name:'[Content_Types].xml',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${ws.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`},
    {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
    {name:'xl/workbook.xml',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n,i)=>`<sheet name="${xe(n)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`},
    {name:'xl/_rels/workbook.xml.rels',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${ws.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${ws.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`},
    {name:'xl/styles.xml',data:styles},...ws.map((x,i)=>({name:`xl/worksheets/sheet${i+1}.xml`,data:x}))];
  return zipBlob(files,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
function exportXlsx(){
  const r=S.lastCompo,sh=[],buy=[];const fl=p=>p.f.length?MO[p.f[0]-1]+(p.f.length>1?'–'+MO[p.f[p.f.length-1]-1]:''):'';
  const cond0=p=>p.t==='arbre'?'Arbre en conteneur ou racines nues':p.t==='arbuste'?'Conteneur 3–5 L':p.t==='annuelle'?'Mini-mottes ou graines':'Godet 9 cm';
  if(r){sh.push({name:'Plantes du massif',head:['N°','Plante','Nom latin','Type','Rôle','Quantité','Conditionnement','Hauteur (m)','Floraison','Couleurs','Remarque'],rows:r.rows.map((x,i)=>[i+1,x.p.n,x.p.l,TL[x.p.t],x.role,x.qty,cond0(x.p),x.p.h,fl(x.p),x.p.c.map(c=>COL[c]?COL[c][0]:c).join(', '),x.p.note||''])});
    r.rows.forEach(x=>buy.push(['Plante',x.p.n,x.p.l,x.qty,'pièce(s)',cond0(x.p)+' — massif ('+r.st.l+')']));
    if(S.lastSupplies){sh.push({name:'Fournitures massif',head:['Fourniture','Quantité','Conditionnement','Détail'],rows:S.lastSupplies});S.lastSupplies.slice(1).forEach(x=>buy.push(['Produit',x[0],'',x[1],'',x[2]]))}}
  if(S.hedges.length){const rows=[];S.hedges.forEach((h,i)=>{const I=hedgeInfo(h);I.mix.forEach(m=>{rows.push([`Haie ${i+1}`,Math.round(I.len*10)/10,I.T.l,m.n,m.l,m.pers,m.qty]);buy.push(['Plante',m.n,m.l,m.qty,'pièce(s)',`Jeune plant 60–80 cm, racines nues — haie ${i+1}`])});buy.push(['Produit',`BRF pour la haie ${i+1}`,'',Math.round(I.brf*100)/100,'m³','Bande de 1 m, 8 cm d’épaisseur'])});sh.push({name:'Haies',head:['Haie','Longueur (m)','Type','Essence','Nom latin','Feuillage','Plants'],rows})}
  if(S.fruits.length||S.vines.length){const rows=[];S.fruits.forEach((f,i)=>{const F=fruitInfo(f);rows.push([`Fruitier ${i+1}`,F.fr.n,F.fr.l,F.fo.l,1,F.fr.v,F.warn.join(' ')]);buy.push(['Plante',F.fr.n+' ('+F.fo.l.toLowerCase()+')',F.fr.l,1,'pièce','Variétés conseillées : '+F.fr.v])});
    S.vines.forEach((v,i)=>{const V=vineInfo(v);rows.push([`Vigne ${i+1}`,'Vigne','Vitis vinifera',`Palissée, ${Math.round(V.len*10)/10} m`,V.n,CEPS[v.cep],`${Math.round(V.wire)} m de fil, ${V.posts} piquets, 3 tendeurs`]);buy.push(['Plante','Vigne '+CEPS[v.cep],'Vitis vinifera',V.n,'pied(s)',`Vigne ${i+1}`]);buy.push(['Produit','Fil de palissage','',Math.round(V.wire),'m',`Vigne ${i+1}`]);buy.push(['Produit','Piquets ou ancrages','',V.posts,'pièce(s)',`Vigne ${i+1}`])});
    sh.push({name:'Fruitiers et vigne',head:['Élément','Espèce','Nom latin','Forme','Quantité','Variétés / cépage','Remarques'],rows})}
  const la=lawnArea();if(la){const rk=lawnRank();sh.push({name:'Pelouse',head:['Type','Conseillé','Mélange','Dose (g/m²)','Semences (kg)','Entretien'],rows:rk.map((x,i)=>[x.t.n,i<2&&x.sc>=5?'oui':'',x.t.mix,x.t.dose,Math.round(la*x.t.dose/100)/10,x.t.ent])});buy.push(['Produit','Semences : '+rk[0].t.n,'',Math.round(la*rk[0].t.dose/100)/10,'kg',`${Math.round(la)} m²`])}
  S.ponds.forEach((p,i)=>{const D=pondInfo(p);sh.push({name:`Pièce d'eau ${i+1}`,head:['Catégorie','Élément','Nom latin / détail','Quantité'],rows:[...D.mats.map(m=>['Matériau',m[0],m[2],m[1]]),...D.plants.flatMap(Z=>Z.rows.map(x=>['Plante — '+Z.z,x.n,x.l,x.q])),...POND_TOOLS.map(t=>['Outil',t,'',''])]});
    D.plants.forEach(Z=>Z.rows.forEach(x=>buy.push(['Plante',x.n,x.l,x.q,'pièce(s)',`Pièce d’eau ${i+1} — ${Z.z}`])));D.mats.forEach(m=>buy.push(['Produit',m[0],'',m[1],'',`Pièce d’eau ${i+1} — ${m[2]}`]))});
  if(S.taluses.length){const rows=[];S.taluses.forEach((t,i)=>{const V=talusVals(t);if(V.pct==null||!V.area)return;const C=slopeClass(V.pct);
    if(C.k<4)talusPlants(V).rows.forEach(x=>{rows.push([`Talus ${i+1}`,Math.round(V.pct),C.l,x.role,x.p.n,x.p.l,x.q]);buy.push(['Plante',x.p.n,x.p.l,x.q,'pièce(s)',`Talus ${i+1} — ${x.role}`])});
    talusSupplies(V).forEach(r=>buy.push(['Produit',r[0],'',r[1],'',`Talus ${i+1} — ${r[2]}`]))});
    if(rows.length)sh.push({name:'Talus',head:['Talus','Pente (%)','Classe','Rôle','Plante','Nom latin','Quantité'],rows})}
  if(typeof v4Sheets==='function')v4Sheets(sh,buy);
  sh.push({name:'Matériel',head:['Matériel','Pour','Conseil'],rows:machines()});
  const cal=[];document.querySelectorAll('#cal .mo').forEach(m=>m.querySelectorAll('li').forEach(li=>cal.push([m.querySelector('h4').textContent,li.textContent])));if(cal.length)sh.push({name:'Entretien',head:['Mois','Tâche'],rows:cal});
  const c=cond();sh.push({name:'Plantes adaptées au site',head:['Plante','Nom latin','Type','Adéquation (%)','Hauteur (m)','Floraison','Remarques'],rows:scored().filter(x=>x.ok).sort((a,b)=>b.score-a.score).map(x=>[x.p.n,x.p.l,TL[x.p.t],x.score,x.p.h,fl(x.p),x.why.join(' · ')])});
  sh.unshift({name:'Liste d’achat',head:['Catégorie','Article','Nom latin','Quantité','Unité','Détail','Où acheter'],rows:buy.map(b=>[...b,b[0]==='Plante'?shopLink(b[1].match(/indig/i)?'indigenes':'plantes'):shopLink(supplyCat(b[1]))])});
  download(xlsxBlob(sh),'plantania-liste-plantation.xlsx');
}
const exMsg=t=>{$('#exMsg').textContent=t};
$('#exPdf').addEventListener('click',async()=>{exMsg('Préparation du rapport…');try{await exportPdf();exMsg('')}catch(e){exMsg('Erreur : '+e.message)}});
$('#exDoc').addEventListener('click',async()=>{exMsg('Préparation du document Word…');try{await exportDocx();exMsg('Fichier Word téléchargé.')}catch(e){exMsg('Erreur : '+e.message)}});
$('#exXls').addEventListener('click',()=>{try{const keep=curTabs();applyTabs(TABS.slice());exportXlsx();applyTabs(keep);exMsg('Fichier Excel téléchargé.')}catch(e){exMsg('Erreur : '+e.message)}});

/* ---------- Traduction de l’interface (FR / NL / EN) ---------- */
const I18N=[
['Climat, sol, soleil et plantes adaptées à un point précis · prototype','Klimaat, bodem, zon en aangepaste planten voor een precieze plek · prototype','Climate, soil, sun and suitable plants for a precise spot · prototype'],
['Adresse, commune…','Adres, gemeente…','Address, town…'],['Chercher','Zoeken','Search'],['Ma position','Mijn locatie','My location'],
['Carte','Kaart','Map'],['Climat','Klimaat','Climate'],['Sol','Bodem','Soil'],['Soleil et ombres','Zon en schaduw','Sun and shade'],['Plantes','Planten','Plants'],['Composition','Beplantingsplan','Planting scheme'],['Haies, fruitiers, eau','Hagen, fruitbomen, water','Hedges, fruit trees, water'],['Matériel','Materiaal','Equipment'],['Exporter','Exporteren','Export'],
['Latitude','Breedtegraad','Latitude'],['Longitude','Lengtegraad','Longitude'],['Aller','Ga','Go'],
['Ajouter sur la carte','Toevoegen op de kaart','Add on the map'],['Placer le site (point d’étude)','Studiepunt plaatsen','Place the study point'],
['Obstacle ponctuel (bâtiment, arbre)','Puntobstakel (gebouw, boom)','Point obstacle (building, tree)'],['Obstacle : forme dessinée (bâtiment, abri)','Obstakel: getekende vorm (gebouw, berging)','Obstacle: drawn shape (building, shed)'],['Obstacle : ligne (mur, haie existante)','Obstakel: lijn (muur, bestaande haag)','Obstacle: line (wall, existing hedge)'],
['Massif de plantation (forme)','Plantvak (vorm)','Planting bed (shape)'],['Haie à planter (ligne)','Te planten haag (lijn)','Hedge to plant (line)'],['Arbre fruitier (point)','Fruitboom (punt)','Fruit tree (point)'],['Vigne palissée (ligne)','Leiwijnstok (lijn)','Trained grapevine (line)'],['Pelouse (forme)','Gazon (vorm)','Lawn (shape)'],['Pièce d’eau (forme)','Waterpartij (vorm)','Pond (shape)'],
['Bâtiment','Gebouw','Building'],['Arbre caduc','Bladverliezende boom','Deciduous tree'],['Arbre persistant','Groenblijvende boom','Evergreen tree'],['Haie','Haag','Hedge'],
['Annuler le dernier point','Laatste punt ongedaan maken','Undo last point'],['Terminer','Voltooien','Finish'],['Effacer le massif','Plantvak wissen','Clear bed'],
['20 mars','20 maart','20 March'],['21 juin','21 juni','21 June'],['22 sept.','22 sept.','22 Sept.'],['21 déc.','21 dec.','21 Dec.'],
['Hauteur du soleil','Zonnehoogte','Sun elevation'],['Azimut','Azimut','Azimuth'],['Ombre d’un objet de 1 m','Schaduw van een object van 1 m','Shadow of a 1 m object'],['Durée du jour','Daglengte','Day length'],['Soleil direct sur le site ce jour','Directe zon op de plek vandaag','Direct sun on site today'],
['Normales 1995–2024, réanalyse ERA5 via Open-Meteo','Normalen 1995–2024, ERA5-heranalyse via Open-Meteo','1995–2024 normals, ERA5 reanalysis via Open-Meteo'],
['Pluie annuelle','Jaarlijkse neerslag','Annual rainfall'],['Température moyenne','Gemiddelde temperatuur','Mean temperature'],['Ensoleillement','Zonneschijn','Sunshine'],['Zone de rusticité','Winterhardheidszone','Hardiness zone'],['Dernière gelée','Laatste vorst','Last frost'],['Première gelée','Eerste vorst','First frost'],['date médiane','mediane datum','median date'],['Bilan hydrique été','Waterbalans zomer','Summer water balance'],['Vent','Wind','Wind'],['Altitude','Hoogte','Elevation'],
['Diagramme ombrothermique (pluie en barres, température moyenne en ligne, échelle P = 2T)','Ombrothermisch diagram (neerslag als staven, gemiddelde temperatuur als lijn, schaal P = 2T)','Ombrothermic chart (rain as bars, mean temperature as line, scale P = 2T)'],
['Ensoleillement mensuel (heures)','Maandelijkse zonneschijn (uren)','Monthly sunshine (hours)'],['Directions du vent dominant (fréquence journalière)','Overheersende windrichtingen (dagelijkse frequentie)','Prevailing wind directions (daily frequency)'],
['Corriger avec mon test de terrain','Corrigeren met mijn terreintest','Correct with my field test'],['Sableux','Zandig','Sandy'],['Limoneux (lœss)','Lemig (löss)','Silty (loess)'],['Limon sableux','Zandleem','Sandy loam'],['Limon argileux','Kleiige leem','Clay loam'],['Argileux','Kleiig','Clayey'],
['Sable','Zand','Sand'],['Argile','Klei','Clay'],['Limon','Leem','Silt'],['pH (eau)','pH (water)','pH (water)'],['Utiliser ces valeurs','Deze waarden gebruiken','Use these values'],['Revenir aux données en ligne','Terug naar online gegevens','Back to online data'],
['Triangle des textures (classes USDA, 0–30 cm)','Textuurdriehoek (USDA-klassen, 0–30 cm)','Texture triangle (USDA classes, 0–30 cm)'],['pH mesuré sur place','Ter plaatse gemeten pH','pH measured on site'],['Appliquer','Toepassen','Apply'],
['Texture','Textuur','Texture'],['Drainage naturel','Natuurlijke drainage','Natural drainage'],['Sigle pédologique','Bodemcode','Soil code'],['à mesurer','te meten','to be measured'],
['Position du soleil calculée, obstacles saisis sur la carte','Berekende zonnestand, obstakels op de kaart','Computed sun position, obstacles from the map'],['Course du soleil vue depuis le site, avec les obstacles en masque','Zonnebaan gezien vanaf de plek, met obstakels als masker','Sun path seen from the site, obstacles as mask'],
['21 juin','21 juni','21 June'],['équinoxes','equinoxen','equinoxes'],['date choisie','gekozen datum','selected date'],['Obstacles','Obstakels','Obstacles'],['Date','Datum','Date'],['Jour (h)','Dag (u)','Day (h)'],['Soleil direct (h)','Directe zon (u)','Direct sun (h)'],
['Plantes adaptées','Aangepaste planten','Suitable plants'],['Conditions détectées · modifiables','Gedetecteerde omstandigheden · aanpasbaar','Detected conditions · editable'],
['Rusticité','Winterhardheid','Hardiness'],['Exposition','Standplaats','Exposure'],['Humidité du sol','Bodemvochtigheid','Soil moisture'],['pH','pH','pH'],
['Plein soleil','Volle zon','Full sun'],['Mi-ombre','Halfschaduw','Part shade'],['Ombre','Schaduw','Shade'],['Sec','Droog','Dry'],['Frais','Fris','Moist'],['Humide','Vochtig','Wet'],['Léger (sableux)','Licht (zandig)','Light (sandy)'],['Limoneux','Lemig','Loamy'],['Lourd (argileux)','Zwaar (kleiig)','Heavy (clay)'],
['Type','Type','Type'],['Tous','Alle','All'],['Arbres','Bomen','Trees'],['Arbustes','Struiken','Shrubs'],['Vivaces','Vaste planten','Perennials'],['Graminées','Grassen','Grasses'],['Fougères','Varens','Ferns'],['Annuelles','Eenjarigen','Annuals'],
['Style de jardin','Tuinstijl','Garden style'],['Feuillage','Blad','Foliage'],['Port (forme)','Groeivorm','Habit'],['Hauteur min.','Min. hoogte','Min. height'],['Hauteur max.','Max. hoogte','Max. height'],['En fleur en','In bloei in','Flowering in'],['Couleur des fleurs (plusieurs choix possibles)','Bloemkleur (meerdere keuzes mogelijk)','Flower colour (several choices possible)'],
['Arbre','Boom','Tree'],['Arbuste','Struik','Shrub'],['Vivace','Vaste plant','Perennial'],['Graminée','Gras','Grass'],['Fougère','Varen','Fern'],['Annuelle','Eenjarige','Annual'],
['Blanc','Wit','White'],['Rose','Roze','Pink'],['Rouge','Rood','Red'],['Orange','Oranje','Orange'],['Jaune','Geel','Yellow'],['Bleu','Blauw','Blue'],['Violet','Paars','Purple'],['Blond (épis)','Blond (aren)','Blond (seed heads)'],['Vert discret','Discreet groen','Subtle green'],
['Vert','Groen','Green'],['Pourpre','Purper','Purple'],['Panaché','Bont','Variegated'],['Gris / bleuté','Grijs / blauwig','Grey / bluish'],['Couleurs d’automne','Herfstkleuren','Autumn colours'],['Persistant','Groenblijvend','Evergreen'],
['Érigé','Rechtopstaand','Upright'],['En touffe','Pollenvormend','Clump-forming'],['Arrondi','Rond','Rounded'],['Couvre-sol','Bodembedekker','Groundcover'],['En fontaine','Overhangend','Arching'],['Colonnaire','Zuilvormig','Columnar'],['Étalé','Uitgespreid','Spreading'],
['Composer un massif','Een plantvak samenstellen','Design a planting bed'],['Forme du massif','Vorm van het plantvak','Bed shape'],['Dessiner sur la carte','Op de kaart tekenen','Draw on the map'],['Massif isolé, vu de tous côtés','Vrijstaand plantvak, van alle kanten zichtbaar','Island bed, seen from all sides'],['Afficher la plantation sur la carte','Beplanting op de kaart tonen','Show planting on the map'],
['Surface du massif','Oppervlakte plantvak','Bed area'],['Recomposer','Opnieuw samenstellen','Recompose'],['Copier le plan','Plan kopiëren','Copy plan'],
['Plan de plantation (vue du dessus, nord en haut)','Beplantingsplan (bovenaanzicht, noorden boven)','Planting plan (top view, north up)'],['Contrôles agronomiques et paysagers','Agronomische en landschappelijke controles','Agronomic and landscape checks'],
['Fournitures pour la plantation','Benodigdheden voor de aanplant','Planting supplies'],['Entretien type, mois par mois','Standaardonderhoud, maand per maand','Typical maintenance, month by month'],
['N°','Nr.','No.'],['Rôle','Rol','Role'],['Plante','Plant','Plant'],['Place','Plaats','Position'],['Quantité','Hoeveelheid','Quantity'],['Détail','Detail','Detail'],['Fleurs','Bloemen','Flowers'],['Fourniture','Benodigdheid','Supply'],['Conditionnement','Verpakking','Packaging'],
['Arrière','Achteraan','Back'],['Milieu','Midden','Middle'],['Devant','Vooraan','Front'],['OK','OK','OK'],['À revoir','Na te kijken','To review'],['Info','Info','Info'],
['Jardin à l’anglaise','Engelse tuin','English garden'],['New wave planting','New wave planting','New wave planting'],['Jardin à la française','Franse tuin','French formal garden'],['Jardin japonais','Japanse tuin','Japanese garden'],['Jardin sec / méditerranéen','Droge / mediterrane tuin','Dry / Mediterranean garden'],['Jardin vivrier (comestible)','Eetbare tuin','Edible garden'],['Jardin écologique (biodiversité)','Ecologische tuin (biodiversiteit)','Ecological garden (biodiversity)'],['Jardin graphique (contemporain)','Grafische tuin (hedendaags)','Graphic garden (contemporary)'],['Jardin naturel / sous-bois','Natuurlijke tuin / bosrand','Natural / woodland garden'],
['Haies, fruitiers, vigne, pelouse et pièce d’eau','Hagen, fruitbomen, wijnstok, gazon en waterpartij','Hedges, fruit trees, vine, lawn and pond'],['Tracez-les sur la carte, puis réglez-les ici','Teken ze op de kaart en stel ze hier in','Draw them on the map, then adjust them here'],
['Tracer une haie','Een haag tekenen','Draw a hedge'],['Placer un arbre fruitier','Een fruitboom plaatsen','Place a fruit tree'],['Tracer une vigne','Een wijnstok tekenen','Draw a vine'],['Dessiner une pelouse','Een gazon tekenen','Draw a lawn'],['Dessiner une pièce d’eau','Een waterpartij tekenen','Draw a pond'],
['Haies','Hagen','Hedges'],['Arbres fruitiers','Fruitbomen','Fruit trees'],['Vigne','Wijnstok','Grapevine'],['Pelouse','Gazon','Lawn'],['Pièce d’eau','Waterpartij','Pond'],
['Supprimer','Verwijderen','Delete'],['Hauteur entretenue (m)','Onderhouden hoogte (m)','Maintained height (m)'],['Plantation','Aanplant','Planting'],['Simple rang','Enkele rij','Single row'],['Double rang en quinconce','Dubbele rij in driehoeksverband','Staggered double row'],
['Essence','Soort','Species'],['Plants','Planten','Plants'],['Espèce','Soort','Species'],['Forme','Vorm','Form'],['Cépage','Druivenras','Grape variety'],['Usage principal','Hoofdgebruik','Main use'],['Surface (m²)','Oppervlakte (m²)','Area (m²)'],['Conseillé','Aanbevolen','Recommended'],['Profondeur maximale (m)','Maximale diepte (m)','Maximum depth (m)'],
['Matériaux','Materialen','Materials'],['Outils','Gereedschap','Tools'],['Plantes aquatiques indigènes','Inheemse waterplanten','Native aquatic plants'],['Protéger la faune et la flore','Fauna en flora beschermen','Protecting wildlife and plants'],['Zone','Zone','Zone'],['Matériau','Materiaal','Material'],
['Matériel d’entretien conseillé','Aanbevolen onderhoudsmateriaal','Recommended maintenance equipment'],['Pour un particulier, selon ce qui est tracé et composé','Voor particulieren, volgens wat getekend en samengesteld is','For home gardeners, based on what you drew and designed'],['Pour','Voor','For'],['Conseil','Advies','Advice'],
['Toutes les informations du site et du projet','Alle informatie over de plek en het project','All site and project information'],['Rapport PDF','PDF-rapport','PDF report'],['Rapport Word (.docx)','Word-rapport (.docx)','Word report (.docx)'],['Liste de plantation Excel (.xlsx)','Plantlijst Excel (.xlsx)','Planting list Excel (.xlsx)'],
['Sources de données','Gegevensbronnen','Data sources'],
['Fond','Achtergrond','Base map'],['Donner mon avis','Mijn mening geven','Give feedback'],['Votre avis sur Plantañ.ia','Uw mening over Plantañ.ia','Your feedback on Plantañ.ia'],['Note générale','Algemene score','Overall rating'],['Ce qui vous a plu','Wat u goed vond','What you liked'],['Ce qui ne marche pas ou est difficile à comprendre','Wat niet werkt of moeilijk te begrijpen is','What does not work or is hard to understand'],['Idées ou fonctions qui vous manquent','Ideeën of ontbrekende functies','Ideas or missing features'],['Envoyer mon avis','Mening verzenden','Send feedback'],['Copier','Kopiëren','Copy'],['Ensoleillement à une date et une heure','Zonneschijn op een datum en uur','Sunshine at a given date and time'],['Page de garde du rapport (facultatif)','Voorblad van het rapport (optioneel)','Report cover page (optional)'],['Nom','Naam','Name'],['Adresse','Adres','Address'],['Code postal et commune','Postcode en gemeente','Postcode and town'],['Titre du projet','Projecttitel','Project title'],['Télécharger le rapport PDF','PDF-rapport downloaden','Download PDF report'],['Télécharger le rapport Word','Word-rapport downloaden','Download Word report'],['Pros et achats','Vakmensen en aankopen','Pros and shopping'],['Professionnels et achats','Vakmensen en aankopen','Professionals and shopping'],['Autour de votre lieu de projet','Rond uw projectlocatie','Around your project location'],['Trouver un professionnel près de chez vous','Een vakman in uw buurt vinden','Find a professional near you'],['Acheter les fournitures dans votre région','Benodigdheden kopen in uw regio','Buy supplies in your area'],['Demande de devis prête à envoyer','Offerteaanvraag klaar om te verzenden','Quote request ready to send'],['Copier la demande','Aanvraag kopiëren','Copy request'],['Ouvrir dans ma messagerie','Openen in mijn e-mail','Open in my email'],['Adresse e-mail du professionnel','E-mailadres van de vakman','Professional’s email address'],['Carte IGN (Belgique)','NGI-kaart (België)','NGI map (Belgium)'],['Plan OpenStreetMap (hors Belgique)','OpenStreetMap-kaart (buiten België)','OpenStreetMap (outside Belgium)'],['Noms et routes IGN','NGI-namen en wegen','NGI names and roads'],['Agrandir la carte','Kaart vergroten','Enlarge map'],['Réduire la carte','Kaart verkleinen','Shrink map'],['Plein écran','Volledig scherm','Full screen'],['Quitter le plein écran','Volledig scherm verlaten','Exit full screen'],['Vous pouvez aussi étirer la carte par son coin inférieur droit.','U kunt de kaart ook uitrekken via de rechterbenedenhoek.','You can also stretch the map from its bottom-right corner.'],['Éléments sur la carte (','Elementen op de kaart (','Items on the map ('],['Tout effacer sur la carte','Alles op de kaart wissen','Clear everything on the map'],['Remettre à zéro','Alles resetten','Reset everything'],['Confirmer la remise à zéro','Reset bevestigen','Confirm reset'],['Outils','Gereedschap','Tools'],['Gomme : cliquer un élément pour le supprimer','Gom: klik op een element om het te verwijderen','Eraser: click an item to delete it'],['Décrire mon projet','Mijn project beschrijven','Describe my project'],['Assistant de projet','Projectassistent','Project assistant'],['Envoyer','Verzenden','Send'],['Mode','Modus','Mode'],['Modèle','Model','Model'],['Enregistrer','Opslaan','Save'],['Effacer la clé','Sleutel wissen','Clear key'],['Clé API Anthropic','Anthropic API-sleutel','Anthropic API key'],['Adresse du serveur relais','Adres van de relayserver','Relay server URL'],['Assistant intégré (sans IA, gratuit)','Ingebouwde assistent (zonder AI, gratis)','Built-in assistant (no AI, free)'],['Onglets (plusieurs à la fois) :','Tabbladen (meerdere tegelijk):','Tabs (several at once):'],['Tout afficher','Alles tonen','Show all'],['Un seul onglet','Eén tabblad','One tab only'],['Couches','Lagen','Layers'],['Satellite','Satelliet','Satellite'],['Plan','Plattegrond','Street map'],['Cadastre','Kadaster','Cadastre'],['Sols','Bodem','Soils'],['Courbes de niveau','Hoogtelijnen','Contour lines'],['Relief LiDAR','LiDAR-reliëf','LiDAR relief'],['Une seule couche à la fois','Eén laag tegelijk','One layer at a time'],['Opacité','Dekking','Opacity'],
['Talus existant (forme)','Bestaand talud (vorm)','Existing slope (shape)'],['Obstacles (ombre portée)','Obstakels (slagschaduw)','Obstacles (cast shadow)'],['Aménagements','Inrichting','Garden features'],['Limite cadastrale','Kadastrale grens','Cadastral boundary'],['Ombre portée','Slagschaduw','Cast shadow'],
['Talus et pentes','Taluds en hellingen','Banks and slopes'],['Dessiner un talus','Een talud tekenen','Draw a slope'],['Ajouter un talus à la main','Een talud handmatig toevoegen','Add a slope manually'],['Haies, fruitiers, eau, talus','Hagen, fruitbomen, water, taluds','Hedges, fruit trees, water, slopes'],
['Longueur le long de la pente (m)','Lengte langs de helling (m)','Length along the slope (m)'],['Dénivelé (m)','Hoogteverschil (m)','Height difference (m)'],['ou pente (%)','of helling (%)','or slope (%)'],['Versant tourné vers','Helling gericht naar','Slope facing'],['Ré-estimer','Opnieuw schatten','Re-estimate'],
['Pente faible','Zwakke helling','Gentle slope'],['Pente modérée','Matige helling','Moderate slope'],['Pente forte','Steile helling','Steep slope'],['Pente très forte','Zeer steile helling','Very steep slope'],['Plantation conseillée pour ce talus','Aanbevolen beplanting voor dit talud','Recommended planting for this slope'],['Fournitures','Benodigdheden','Supplies'],
['Arbuste drageonnant','Uitlopende struik','Suckering shrub'],['Couvre-sol','Bodembedekker','Groundcover'],['Graminée en touffe','Pollenvormend gras','Clump-forming grass'],['Langue','Taal','Language']
];
const I18M=new Map(I18N.map(([fr,nl,en])=>[fr,{nl,en}]));
let LANG='fr';try{LANG=localStorage.getItem('plantania:lang')||'fr'}catch(e){}
