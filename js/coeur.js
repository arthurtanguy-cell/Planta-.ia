/* Plantañ.ia : calculs (soleil, climat, sols) et base des plantes */
/* ---------- Calculs purs (testables) ---------- */
const R=Math.PI/180;
function sunPos(t,lat,lon){
  const d=t/864e5+2440587.5-2451545.0;
  const g=(357.529+0.98560028*d)*R, q=280.459+0.98564736*d;
  const L=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*R, e=(23.439-0.00000036*d)*R;
  const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)), dec=Math.asin(Math.sin(e)*Math.sin(L));
  const gmst=(18.697374558+24.06570982441908*d)%24;
  const H=(gmst*15+lon)*R-ra, la=lat*R;
  const alt=Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(H));
  const az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(la)-Math.tan(dec)*Math.cos(la));
  return {alt:alt/R,az:((az/R+180)%360+360)%360};
}
function texClass(sa,si,cl){
  const t=sa+si+cl||1; sa=sa*100/t; si=si*100/t; cl=cl*100/t;
  if(si+1.5*cl<15) return 'Sable';
  if(si+2*cl<30) return 'Sable limoneux';
  if((cl>=7&&cl<20&&sa>52)||(cl<7&&si<50)) return 'Limon sableux';
  if(cl>=7&&cl<27&&si>=28&&si<50&&sa<=52) return 'Limon moyen (loam)';
  if((si>=50&&cl>=12&&cl<27)||(si>=50&&si<80&&cl<12)) return 'Limon fin';
  if(si>=80&&cl<12) return 'Limon très fin';
  if(cl>=20&&cl<35&&si<28&&sa>45) return 'Limon argilo-sableux';
  if(cl>=27&&cl<40&&sa>20&&sa<=45) return 'Limon argileux';
  if(cl>=27&&cl<40&&sa<=20) return 'Limon argilo-fin';
  if(cl>=35&&sa>45) return 'Argile sableuse';
  if(cl>=40&&si>=40) return 'Argile limoneuse';
  return 'Argile';
}
const TEXCAT={'Sable':'s','Sable limoneux':'s','Limon sableux':'s','Limon moyen (loam)':'l','Limon fin':'l','Limon très fin':'l','Limon argilo-sableux':'l','Limon argileux':'a','Limon argilo-fin':'a','Argile sableuse':'a','Argile limoneuse':'a','Argile':'a'};
const DIM=[31,28.25,31,30,31,30,31,31,30,31,30,31];
const median=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
function procClim(j){
  const D=j.daily,n=D.time.length,z=()=>Array(12).fill(0);
  const tS=z(),tN=z(),xS=z(),xN=z(),nS=z(),nN=z(),pS=z(),sS=z(),sN=z(),eS=z(),eN=z(),wS=z(),wN=z(),dir=Array(8).fill(0),yr={};
  const col=k=>D[k]||[];
  const T=col('temperature_2m_mean'),TX=col('temperature_2m_max'),TN=col('temperature_2m_min'),P=col('precipitation_sum'),SU=col('sunshine_duration'),ET=col('et0_fao_evapotranspiration'),W=col('wind_speed_10m_max'),WD=col('wind_direction_10m_dominant');
  for(let i=0;i<n;i++){
    const [Y,M,Dd]=D.time[i].split('-').map(Number),m=M-1;
    if(T[i]!=null){tS[m]+=T[i];tN[m]++}
    if(TX[i]!=null){xS[m]+=TX[i];xN[m]++}
    if(TN[i]!=null){nS[m]+=TN[i];nN[m]++}
    if(P[i]!=null)pS[m]+=P[i];
    if(SU[i]!=null){sS[m]+=SU[i];sN[m]++}
    if(ET[i]!=null){eS[m]+=ET[i];eN[m]++}
    if(W[i]!=null){wS[m]+=W[i];wN[m]++}
    if(WD[i]!=null)dir[Math.round(WD[i]/45)%8]++;
    const y=yr[Y]||(yr[Y]={min:99,last:null,first:null});
    const tn=TN[i];
    if(tn!=null){
      if(tn<y.min)y.min=tn;
      if(tn<=0){const doy=(Date.UTC(Y,m,Dd)-Date.UTC(Y,0,1))/864e5+1; if(M<=6)y.last=doy; else if(y.first==null)y.first=doy;}
    }
  }
  const ys=Object.values(yr).filter(y=>y.min<99), ny=ys.length||1;
  const avg=(s,c)=>s.map((v,i)=>c[i]?v/c[i]:null);
  const t=avg(tS,tN),tx=avg(xS,xN),tn=avg(nS,nN);
  const p=pS.map(v=>v/ny);
  const sun=sS.map((v,i)=>sN[i]?v/sN[i]/3600*DIM[i]:null);
  const et0=eS.map((v,i)=>eN[i]?v/eN[i]*DIM[i]:null);
  const wind=avg(wS,wN);
  const dt=dir.reduce((a,b)=>a+b,0)||1;
  const sum=a=>a.reduce((s,v)=>s+(v||0),0);
  const lasts=ys.map(y=>y.last).filter(v=>v!=null), firsts=ys.map(y=>y.first).filter(v=>v!=null);
  return {t,tx,tn,p,sun,et0,wind,dir:dir.map(v=>v/dt),
    extMin:ys.reduce((s,y)=>s+y.min,0)/ny,
    lastFrost:median(lasts),firstFrost:median(firsts),frostYears:lasts.length,years:ny,
    pYear:sum(p),tYear:sum(t)/12,sunYear:sun.every(v=>v==null)?null:sum(sun),et0Year:sum(et0),
    summerBal:[5,6,7].reduce((s,m)=>s+p[m]-(et0[m]||0),0),
    windMean:sum(wind)/12,elev:j.elevation};
}
function usda(tmin){
  const f=tmin*9/5+32, v=f+60, z=Math.max(1,Math.min(13,Math.floor(v/10)+1));
  return z+(((v%10)+10)%10<5?'a':'b');
}
function hull(pts){
  const p=[...pts].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];
  for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
  for(const q of p.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
  return lo.slice(0,-1).concat(up.slice(0,-1));
}
const EXO='smo',WO='dfh';
function scorePlant(p,c){
  const why=[];let sc=0,ok=true;
  if(p.z!=null&&c.tmin!=null){
    if(c.tmin<p.z){ok=false;why.push('Pas assez rustique (supporte '+p.z+' °C)')}
    else if(c.tmin-p.z<3){sc-=10;why.push('Rusticité limite : prévoir un abri')}
  }
  const dist=(set,v,ord)=>Math.min(...[...set].map(x=>Math.abs(ord.indexOf(x)-ord.indexOf(v))));
  const de=dist(p.e,c.expo,EXO);
  if(de===0)sc+=35;else if(de===1){sc+=12;why.push(c.expo==='s'?'Préfère un peu d’ombre':'Manque un peu de soleil')}else{ok=false;why.push('Exposition inadaptée')}
  const dw=dist(p.w,c.eau,WO);
  if(dw===0)sc+=30;else if(dw===1){sc+=10;why.push(WO.indexOf(c.eau)<WO.indexOf(p.w[0])?'Arrosage d’appoint en été':'Sol un peu trop humide pour elle')}else{ok=false;why.push('Humidité du sol inadaptée')}
  if(p.s.includes(c.sol))sc+=20;else{sc+=5;why.push('Texture de sol pas idéale : amender')}
  const dp=c.ph<p.ph[0]?p.ph[0]-c.ph:c.ph>p.ph[1]?c.ph-p.ph[1]:0;
  if(dp===0)sc+=15;else if(dp<=0.5){sc+=7;why.push('pH limite')}else{ok=false;why.push('pH inadapté ('+p.ph[0]+'–'+p.ph[1]+')')}
  return {ok,score:Math.max(0,Math.min(100,sc)),why};
}
/* Base de plantes : n, latin, type, rusticité °C, exposition (s/m/o), eau (d/f/h), sols (s/l/a), pH, hauteur m, floraison (mois), densité /m², couleurs, feuillage, port, styles */
const P=(n,l,t,z,e,w,s,ph,h,f,d,c,fo,p,st,x={})=>({n,l,t,z,e,w,s,ph,h,f,d,c:c?c.split(' '):[],fo:fo.split(' '),p,st:st.split(' '),pers:0,...x});
const PL=[
P("Érable champêtre","Acer campestre","arbre",-29,"sm","df","sla",[5.5,8.5],10,[4,5],0,"vert","vert automne","arrondi","nat ang"),
P("Amélanchier de Lamarck","Amelanchier lamarckii","arbre",-29,"sm","fh","sla",[5,7.5],6,[4],0,"blanc","automne","arrondi","ang nat jap nw",{note:"Petits fruits comestibles en juin, appréciés des oiseaux."}),
P("Bouleau verruqueux","Betula pendula","arbre",-40,"s","df","sl",[4.5,7],18,[4],0,"vert","vert automne","erige","nat jap",{note:"Ombre légère : un massif peut vivre à ses pieds."}),
P("Charme commun","Carpinus betulus","arbre",-29,"smo","f","la",[5.5,8],15,[4,5],0,"vert","vert automne","arrondi","fr nat",{note:"Se conduit en charmille : taille en août.",noteM:8}),
P("Sorbier des oiseleurs","Sorbus aucuparia","arbre",-40,"sm","f","sl",[4.5,7],10,[5],0,"blanc","automne","erige","nat ang"),
P("Pommier d'ornement 'Evereste'","Malus 'Evereste'","arbre",-29,"s","f","la",[5.5,7.5],5,[4,5],0,"blanc rose","vert","arrondi","ang",{note:"Ramasser les feuilles tachées (tavelure) à l’automne.",noteM:11}),
P("Aulne glutineux","Alnus glutinosa","arbre",-35,"sm","fh","la",[5,7.5],20,[2,3],0,"vert","vert","erige","nat",{note:"Supporte les sols détrempés et enrichit le sol en azote."}),
P("Érable du Japon","Acer palmatum","arbre",-23,"sm","f","sla",[5.5,7],5,[5],0,"rouge","pourpre automne","etale","jap",{note:"L’abriter du vent et du soleil brûlant d’après-midi."}),
P("Arbre de Judée","Cercis siliquastrum","arbre",-23,"s","df","sla",[6,8.5],6,[4,5],0,"rose","vert","arrondi","med ang"),
P("Cornouiller mâle","Cornus mas","arbuste",-29,"sm","df","sla",[6,8.5],5,[2,3],0,"jaune","vert automne","arrondi","nat ang"),
P("Viorne obier","Viburnum opulus","arbuste",-35,"sm","fh","la",[5.5,8],3,[5,6],0,"blanc","automne","arrondi","nat ang"),
P("Hortensia paniculé","Hydrangea paniculata","arbuste",-35,"sm","f","la",[5,7.5],2,[7,8,9],0,"blanc rose","vert","arrondi","ang nw"),
P("Noisetier","Corylus avellana","arbuste",-29,"sm","f","sla",[5.5,8],5,[2,3],0,"jaune","vert","erige","nat"),
P("Houx commun","Ilex aquifolium","arbuste",-23,"smo","f","sla",[5,7.5],6,[5],0,"blanc","vert","colonne","nat fr",{pers:1}),
P("Fusain d'Europe","Euonymus europaeus","arbuste",-35,"sm","f","la",[6,8.5],4,[5],0,"vert","automne","erige","nat"),
P("Romarin","Salvia rosmarinus","arbuste",-12,"s","d","sl",[6,8.5],1,[3,4],0,"bleu","gris","arrondi","med",{pers:1,note:"Craint l’humidité hivernale plus que le froid : sol très drainant."}),
P("If commun","Taxus baccata","arbuste",-29,"smo","df","sla",[5,8.5],10,[3],0,"vert","vert","colonne","fr jap",{pers:1,note:"Plante toxique (feuilles, graines) : attention aux enfants et animaux."}),
P("Buis","Buxus sempervirens","arbuste",-23,"smo","df","sla",[6,8.5],2,[4],0,"vert","vert","arrondi","fr",{pers:1,note:"Surveiller la pyrale du buis (chenilles) de mai à septembre.",noteM:5}),
P("Houx crénelé","Ilex crenata","arbuste",-23,"sm","f","sla",[5,7],1.5,[6],0,"blanc","vert","arrondi","fr jap",{pers:1,note:"Bonne alternative au buis ; préfère un sol non calcaire."}),
P("Germandrée petit-chêne","Teucrium × lucidrys","arbuste",-23,"s","d","sl",[6.5,8.5],0.4,[6,7,8],0,"rose","vert","touffe","fr med",{pers:1}),
P("Rosier arbustif anglais","Rosa (hybride anglais)","arbuste",-23,"s","f","la",[6,7.5],1.2,[6,7,8,9],0,"rose blanc jaune rouge","vert","arrondi","ang",{note:"Taille en mars au-dessus d’un œil extérieur ; fleurs fanées retirées tout l’été.",noteM:3}),
P("Ciste de Corbières","Cistus × corbariensis","arbuste",-15,"s","d","sl",[6,8.5],1,[5,6],0,"blanc","vert","arrondi","med",{pers:1}),
P("Azalée japonaise","Rhododendron (azalée japonaise)","arbuste",-23,"m","f","sl",[4.5,6],0.8,[4,5],0,"rose blanc rouge","vert","arrondi","jap",{pers:1,note:"Exige un sol acide (terre de bruyère)."}),
P("Géranium vivace 'Rozanne'","Geranium 'Rozanne'","vivace",-29,"sm","f","sla",[5.5,8],0.5,[6,7,8,9,10],5,"bleu violet","vert","couvre","ang nw"),
P("Géranium à grosses racines","Geranium macrorrhizum","vivace",-29,"smo","df","sla",[5,8],0.35,[5,6],7,"rose","vert automne","couvre","nat ang",{note:"Couvre-sol imbattable à l’ombre sèche."}),
P("Échinacée pourpre","Echinacea purpurea","vivace",-35,"s","df","sla",[6,8],0.9,[7,8,9],5,"rose","vert","erige","nw ang"),
P("Rudbeckia 'Goldsturm'","Rudbeckia fulgida","vivace",-35,"sm","f","la",[5.5,7.5],0.7,[8,9,10],5,"jaune","vert","erige","nw ang"),
P("Népéta","Nepeta × faassenii","vivace",-35,"s","df","sl",[6,8.5],0.4,[5,6,7,8,9],4,"bleu violet","gris","touffe","ang med nw",{note:"Rabattre de moitié après la 1re floraison pour une remontée.",noteM:7}),
P("Sauge des bois","Salvia nemorosa","vivace",-29,"s","df","sl",[6,8.5],0.5,[6,7,8],6,"violet","vert","erige","nw ang med"),
P("Achillée millefeuille","Achillea millefolium","vivace",-35,"s","d","sl",[6,8],0.6,[6,7,8,9],6,"blanc rose jaune","vert","erige","nw nat med"),
P("Orpin d'automne","Hylotelephium 'Herbstfreude'","vivace",-35,"s","d","sl",[6,8],0.5,[8,9,10],5,"rose","gris","touffe","nw med"),
P("Lavande vraie","Lavandula angustifolia","vivace",-23,"s","d","sl",[6.5,8.5],0.5,[6,7,8],4,"violet","gris","touffe","med fr ang",{pers:1,note:"Tailler juste après floraison sans couper dans le vieux bois.",noteM:8}),
P("Hosta bleu","Hosta sieboldiana","vivace",-35,"mo","fh","la",[5.5,7.5],0.6,[7],3,"blanc","gris","touffe","jap ang",{note:"Protéger des limaces au débourrement.",noteM:4}),
P("Astilbe","Astilbe × arendsii","vivace",-35,"mo","h","la",[5,7],0.6,[6,7],6,"rose blanc rouge","vert","erige","ang jap"),
P("Hellébore d'Orient","Helleborus × hybridus","vivace",-29,"mo","f","la",[6,8],0.4,[2,3,4],5,"rose blanc violet","vert","touffe","ang nat",{pers:1,note:"Couper les vieilles feuilles en janvier pour dégager les fleurs.",noteM:1}),
P("Anémone du Japon","Anemone × hybrida","vivace",-29,"sm","f","la",[6,8],1,[8,9,10],4,"rose blanc","vert","erige","ang nw jap"),
P("Brunnera","Brunnera macrophylla","vivace",-35,"mo","fh","la",[6,7.5],0.4,[4,5],6,"bleu","vert","couvre","ang nat"),
P("Pulmonaire","Pulmonaria officinalis","vivace",-35,"mo","f","la",[6,8],0.3,[3,4],7,"bleu rose","panache","couvre","nat ang"),
P("Épimède","Epimedium × versicolor","vivace",-29,"mo","df","sla",[5.5,7.5],0.3,[4,5],9,"jaune","vert automne","couvre","jap nat",{note:"Couper le vieux feuillage en février, avant la floraison.",noteM:2}),
P("Renouée amplexicaule","Persicaria amplexicaulis","vivace",-29,"sm","fh","la",[5.5,7.5],1,[7,8,9,10],3,"rouge rose","vert","erige","nw ang"),
P("Iris de Sibérie","Iris sibirica","vivace",-35,"sm","fh","la",[5.5,7],0.8,[5,6],6,"bleu violet","vert","erige","nw ang jap"),
P("Salicaire","Lythrum salicaria","vivace",-35,"sm","h","la",[5,8],1.2,[7,8],4,"rose violet","vert","erige","nat nw"),
P("Euphorbe des bois","Euphorbia amygdaloides var. robbiae","vivace",-23,"mo","df","sla",[5.5,8],0.5,[4,5],5,"vert jaune","vert","couvre","nat",{pers:1,note:"Sève irritante : porter des gants."}),
P("Alchémille","Alchemilla mollis","vivace",-35,"sm","f","sla",[6,8],0.4,[6,7],7,"jaune vert","vert","couvre","ang",{note:"Rabattre après floraison : feuillage neuf, pas de semis envahissants.",noteM:7}),
P("Digitale pourpre","Digitalis purpurea","vivace",-29,"sm","f","sl",[4.5,7],1.5,[6,7],5,"rose blanc","vert","erige","ang nat",{note:"Bisannuelle toxique : la laisser grainer pour qu’elle se ressème."}),
P("Phlox paniculé","Phlox paniculata","vivace",-35,"sm","f","la",[6,7.5],1,[7,8,9],4,"rose blanc violet","vert","erige","ang",{note:"Sensible à l’oïdium : bien espacer et pailler.",noteM:6}),
P("Delphinium","Delphinium elatum (hybrides)","vivace",-35,"s","f","la",[6.5,7.5],1.6,[6,7],3,"bleu violet blanc","vert","erige","ang",{note:"Tuteurer en mai ; rabattre après floraison pour une remontée.",noteM:5}),
P("Campanule laiteuse","Campanula lactiflora","vivace",-35,"sm","f","la",[6,8],1.2,[6,7,8],4,"bleu blanc","vert","erige","ang"),
P("Véronique de Virginie","Veronicastrum virginicum","vivace",-35,"sm","fh","la",[5.5,7.5],1.6,[7,8],4,"blanc violet","vert","erige","nw"),
P("Eupatoire pourpre","Eutrochium maculatum","vivace",-35,"sm","fh","la",[5.5,7.5],2,[8,9],2,"rose","vert","erige","nw nat"),
P("Grande pimprenelle","Sanguisorba officinalis","vivace",-35,"s","fh","la",[5.5,7.5],1.2,[7,8,9],5,"rouge","vert","erige","nw nat"),
P("Agastache 'Blue Fortune'","Agastache 'Blue Fortune'","vivace",-23,"s","d","sl",[6,8],0.9,[7,8,9],5,"bleu violet","vert","erige","nw med",{note:"Craint l’eau stagnante en hiver."}),
P("Ail d'ornement","Allium 'Purple Sensation'","vivace",-29,"s","df","sl",[6,8],0.8,[5,6],15,"violet","vert","erige","nw ang",{note:"Bulbes : planter en octobre à 10 cm de profondeur.",noteM:10}),
P("Euphorbe characias","Euphorbia characias","vivace",-15,"s","d","sl",[6,8.5],1,[3,4,5],1,"vert jaune","gris","arrondi","med",{pers:1,note:"Couper les tiges défleuries à la base, avec des gants.",noteM:6}),
P("Sauge d'Afghanistan","Salvia yangii (Perovskia)","vivace",-23,"s","d","sl",[6,8.5],1.2,[8,9],3,"bleu violet","gris","erige","med nw"),
P("Bugle rampante","Ajuga reptans","vivace",-35,"mo","fh","la",[5,8],0.15,[4,5],9,"bleu","pourpre","couvre","nat jap"),
P("Heuchère 'Palace Purple'","Heuchera micrantha 'Palace Purple'","vivace",-29,"m","f","la",[6,7.5],0.4,[6,7],7,"blanc","pourpre","touffe","ang jap",{pers:1}),
P("Stipa cheveux d'ange","Stipa tenuissima","graminee",-18,"s","d","sl",[6,8.5],0.5,[6,7,8],7,"blond","vert","fontaine","nw med",{pers:1}),
P("Herbe aux écouvillons","Pennisetum alopecuroides","graminee",-23,"s","f","sla",[5.5,7.5],0.8,[8,9,10],3,"blond rose","vert","fontaine","nw"),
P("Calamagrostis 'Karl Foerster'","Calamagrostis × acutiflora","graminee",-35,"sm","fh","la",[5.5,8],1.5,[6,7],3,"blond","vert","colonne","nw"),
P("Molinie bleue","Molinia caerulea","graminee",-35,"sm","fh","sla",[4.5,7],1,[8,9],4,"blond violet","automne","erige","nw nat"),
P("Herbe du Japon","Hakonechloa macra","graminee",-29,"mo","f","l",[5.5,7],0.4,[8],5,"vert","vert automne","fontaine","jap"),
P("Luzule des bois","Luzula sylvatica","graminee",-29,"mo","df","sl",[4.5,7],0.4,[4,5],5,"blond","vert","touffe","nat jap",{pers:1}),
P("Fétuque bleue","Festuca glauca","graminee",-29,"s","d","sl",[5.5,8],0.25,[6],9,"blond","gris","touffe","med",{pers:1,note:"Diviser tous les 3 ans : elle se dégarnit au centre.",noteM:3}),
P("Miscanthus","Miscanthus sinensis","graminee",-29,"s","f","sla",[5.5,7.5],1.8,[9,10],1,"blond rose","vert","fontaine","nw ang jap"),
P("Laîche pendante","Carex pendula","graminee",-23,"mo","h","la",[5,7.5],1,[5,6],3,"vert","vert","fontaine","nat",{pers:1,note:"Se ressème beaucoup : couper les épis avant maturité.",noteM:6}),
P("Sporobole","Sporobolus heterolepis","graminee",-35,"s","df","sla",[5.5,8],0.6,[8,9],5,"blond","automne","fontaine","nw",{note:"Lent à s’installer, mais très longévif."}),
P("Canche cespiteuse","Deschampsia cespitosa","graminee",-35,"sm","fh","la",[5,7.5],0.8,[6,7,8],5,"blond","vert","touffe","nw nat"),
P("Fougère mâle","Dryopteris filix-mas","fougere",-35,"mo","df","sla",[5,7.5],1,[],3,"","vert","fontaine","nat jap ang"),
P("Fougère femelle","Athyrium filix-femina","fougere",-35,"mo","fh","la",[5,7],0.8,[],4,"","vert","fontaine","nat jap"),
P("Polystic à soies","Polystichum setiferum","fougere",-23,"mo","f","la",[5.5,8],0.7,[],3,"","vert","etale","jap ang",{pers:1}),
P("Fougère plume d'autruche","Matteuccia struthiopteris","fougere",-40,"mo","h","la",[5,7],1,[],2,"","vert","erige","nat jap",{note:"Drageonne : lui laisser de la place."}),
P("Scolopendre","Asplenium scolopendrium","fougere",-29,"mo","f","la",[6.5,8.5],0.4,[],6,"","vert","touffe","jap nat",{pers:1}),
P("Polypode commun","Polypodium vulgare","fougere",-35,"mo","d","sl",[4.5,7],0.3,[],8,"","vert","couvre","nat",{pers:1}),
P("Fougère peinte du Japon","Athyrium niponicum 'Pictum'","fougere",-29,"mo","fh","la",[5,7],0.4,[],6,"","gris","etale","jap"),
P("Cosmos","Cosmos bipinnatus","annuelle",null,"s","df","sla",[6,7.5],1,[7,8,9,10],4,"rose blanc","vert","erige","ang nw"),
P("Capucine","Tropaeolum majus","annuelle",null,"sm","df","sl",[6,7.5],0.3,[6,7,8,9,10],4,"orange jaune rouge","vert","etale","ang"),
P("Souci","Calendula officinalis","annuelle",null,"sm","df","sla",[6,7.5],0.5,[6,7,8,9,10],6,"orange jaune","vert","touffe","ang"),
P("Nigelle de Damas","Nigella damascena","annuelle",null,"s","df","sl",[6,8],0.5,[6,7],9,"bleu blanc","vert","erige","ang med"),
P("Zinnia","Zinnia elegans","annuelle",null,"s","f","l",[6,7.5],0.6,[7,8,9,10],6,"rouge orange rose jaune","vert","erige","ang"),
P("Tabac sylvestre","Nicotiana sylvestris","annuelle",null,"sm","f","la",[6,7.5],1.5,[7,8,9],2,"blanc","vert","erige","ang"),
P("Verveine de Buenos Aires","Verbena bonariensis","annuelle",null,"s","df","sl",[6,8],1.5,[7,8,9,10],5,"violet","vert","erige","nw ang"),
P("Coquelicot","Papaver rhoeas","annuelle",null,"s","d","sl",[6,8],0.6,[5,6,7],10,"rouge","vert","erige","nat"),
P("Groseillier à grappes","Ribes rubrum","arbuste",-35,"sm","f","la",[6,7.5],1.5,[4],0,"vert","vert","arrondi","viv",{note:"Récolte en juillet ; en hiver, supprimer les rameaux de plus de 3 ans.",noteM:12}),
P("Cassissier","Ribes nigrum","arbuste",-35,"sm","fh","la",[6,7.5],1.5,[4],0,"vert","vert","arrondi","viv",{note:"Récolte en juillet ; en hiver, supprimer les rameaux de plus de 3 ans.",noteM:12}),
P("Framboisier","Rubus idaeus","arbuste",-35,"sm","f","sl",[5.5,7],1.5,[6],0,"blanc","vert","erige","viv",{note:"Couper au ras les cannes qui ont fructifié, juste après la récolte.",noteM:8}),
P("Myrtillier arbustif","Vaccinium corymbosum","arbuste",-29,"sm","f","sl",[4.5,5.5],1.5,[4,5],0,"blanc","automne","arrondi","viv",{note:"Exige une terre acide : à planter en terre de bruyère."}),
P("Rhubarbe","Rheum rhabarbarum","vivace",-35,"sm","fh","la",[6,7.5],0.9,[6],1,"blanc","vert","touffe","viv",{note:"Récolter les tiges d’avril à juin, jamais les feuilles (toxiques).",noteM:4}),
P("Fraisier","Fragaria × ananassa","vivace",-23,"sm","f","sla",[5.5,7],0.25,[4,5,6],6,"blanc","vert","couvre","viv",{note:"Renouveler les plants tous les 3–4 ans avec les stolons.",noteM:8}),
P("Ciboulette","Allium schoenoprasum","vivace",-35,"sm","f","sla",[6,8],0.3,[5,6],9,"violet","vert","touffe","viv eco"),
P("Thym commun","Thymus vulgaris","vivace",-18,"s","d","sl",[6.5,8.5],0.25,[5,6],9,"rose","gris","touffe","viv med eco",{pers:1}),
P("Sauge officinale","Salvia officinalis","vivace",-18,"s","d","sl",[6,8],0.5,[6],4,"violet","gris","arrondi","viv med eco",{pers:1,note:"Tailler légèrement après floraison pour garder une touffe dense.",noteM:7}),
P("Origan","Origanum vulgare","vivace",-35,"s","d","sl",[6,8.5],0.5,[7,8,9],7,"rose","vert","touffe","viv eco nat"),
P("Menthe verte","Mentha spicata","vivace",-29,"sm","fh","la",[6,7.5],0.5,[7,8],5,"violet","vert","couvre","viv",{note:"Envahissante : la planter dans un pot sans fond enterré."}),
P("Lierre grimpant","Hedera helix","vivace",-23,"smo","df","sla",[5,8.5],0.2,[9,10],4,"vert","vert","couvre","tal nat eco",{pers:1,note:"Couvre-sol persistant très efficace contre l’érosion ; sa floraison tardive nourrit les pollinisateurs."}),
P("Pervenche mineure","Vinca minor","vivace",-29,"mo","f","sla",[5.5,8],0.15,[3,4,5],9,"bleu","vert","couvre","tal nat jap",{pers:1}),
P("Millepertuis à grandes fleurs","Hypericum calycinum","vivace",-18,"smo","df","sla",[5.5,8],0.4,[6,7,8,9],5,"jaune","vert","couvre","tal",{pers:1,note:"Rabattre au ras tous les 2–3 ans en mars pour le rajeunir.",noteM:3}),
P("Rosier des champs","Rosa arvensis","arbuste",-29,"smo","df","sla",[5.5,8],1,[6,7],0,"blanc","vert","etale","tal nat eco",{note:"Rosier sauvage rampant indigène : tiges qui s’enracinent et tiennent la pente."}),
P("Genêt à balais","Cytisus scoparius","arbuste",-23,"s","d","s",[4.5,6.5],1.5,[5,6],0,"jaune","vert","erige","tal nat eco",{note:"Uniquement en sol acide et sableux ; fixe l’azote."}),
P("Saule pourpre","Salix purpurea","arbuste",-35,"s","fh","sla",[5.5,8],3,[3],0,"vert","gris","erige","tal nat",{note:"Le saule de référence pour les fascines et tressages de génie végétal."}),
P("Troène commun","Ligustrum vulgare","arbuste",-29,"smo","df","sla",[6,8.5],3,[6,7],0,"blanc","vert","arrondi","tal nat eco"),
P("Cornouiller sanguin","Cornus sanguinea","arbuste",-35,"sm","dfh","sla",[6,8.5],3,[5,6],0,"blanc","automne","erige","tal nat eco",{note:"Drageonnant : excellent fixateur de talus."}),
P("Artichaut","Cynara cardunculus (groupe Scolymus)","vivace",-12,"s","f","la",[6.5,8],1.2,[7,8],1,"violet","gris","arrondi","viv gra",{note:"Protéger la souche en hiver par un paillage épais.",noteM:11})
];
/* ---- Bibliothèque élargie (v4) ---- */
const R_=(g,parf,rem,o={})=>({rose:{g,parf,rem,...o}});
PL.push(
/* vivaces */
P("Aster cordifolié 'Little Carlow'","Symphyotrichum 'Little Carlow'","vivace",-35,"sm","f","la",[5.5,7.5],0.9,[9,10],5,"bleu violet","vert","erige","nw ang eco"),
P("Aster de Frikart 'Mönch'","Aster × frikartii 'Mönch'","vivace",-23,"s","df","sl",[6,8],0.7,[7,8,9,10],5,"bleu violet","vert","touffe","ang nw"),
P("Calament","Clinopodium nepeta","vivace",-23,"s","d","sl",[6,8.5],0.4,[7,8,9,10],7,"blanc bleu","vert","touffe","nw med eco",{note:"Floraison de juillet aux gelées, très visitée par les abeilles."}),
P("Gaura","Oenothera lindheimeri","vivace",-18,"s","d","sl",[6,8],0.9,[6,7,8,9,10],4,"blanc rose","vert","erige","nw med ang",{note:"Craint l’humidité hivernale : sol bien drainé."}),
P("Knautie de Macédoine","Knautia macedonica","vivace",-29,"s","d","sl",[6,8],0.7,[6,7,8,9],5,"rouge","vert","erige","nw ang eco"),
P("Knautie des champs","Knautia arvensis","vivace",-35,"s","d","sl",[6,8.5],0.8,[6,7,8],5,"violet rose","vert","erige","nat eco nw"),
P("Centaurée des montagnes","Centaurea montana","vivace",-35,"sm","df","sla",[6,8],0.5,[5,6],6,"bleu","vert","touffe","ang nat eco",{note:"Rabattre après la floraison pour une remontée en fin d’été.",noteM:7}),
P("Pavot d'Orient","Papaver orientale","vivace",-35,"s","df","sl",[6,8],0.8,[5,6],4,"rouge orange rose blanc","vert","touffe","ang",{note:"Le feuillage disparaît en été : l’associer à des vivaces tardives qui comblent le vide."}),
P("Pivoine herbacée","Paeonia lactiflora","vivace",-35,"s","f","la",[6,7.5],0.8,[5,6],2,"rose blanc rouge","vert","arrondi","ang fr ros",{note:"Ne pas enterrer les bourgeons à plus de 3 cm, sinon elle ne fleurit pas."}),
P("Hémérocalle","Hemerocallis (hybrides)","vivace",-35,"sm","fh","sla",[6,8],0.8,[6,7,8],4,"jaune orange rouge","vert","fontaine","ang nw"),
P("Iris des jardins","Iris germanica (hybrides)","vivace",-29,"s","d","sl",[6.5,8],0.8,[5,6],6,"bleu violet jaune blanc","gris","erige","ang med",{note:"Planter le rhizome à fleur de terre, au plein soleil.",noteM:8}),
P("Coréopsis verticillé","Coreopsis verticillata","vivace",-29,"s","df","sl",[6,8],0.5,[6,7,8,9],6,"jaune","vert","touffe","nw ang"),
P("Hélénie","Helenium (hybrides)","vivace",-35,"s","fh","la",[6,7.5],1.2,[7,8,9],4,"orange rouge jaune","vert","erige","nw"),
P("Monarde","Monarda didyma","vivace",-35,"sm","fh","la",[6,7.5],0.9,[7,8,9],5,"rouge rose violet","vert","erige","nw ang eco"),
P("Astrance","Astrantia major","vivace",-35,"sm","fh","la",[6,8],0.6,[6,7,8],6,"rose blanc rouge","vert","touffe","ang nat nw"),
P("Géranium sanguin","Geranium sanguineum","vivace",-35,"s","d","sl",[6,8.5],0.3,[5,6,7,8],6,"rose","vert","couvre","ang nat med eco ros"),
P("Géranium des prés","Geranium pratense","vivace",-35,"sm","f","la",[6,8],0.7,[6,7],5,"bleu violet","vert","touffe","nat ang eco"),
P("Géranium brun","Geranium phaeum","vivace",-35,"mo","f","la",[6,8],0.6,[5,6],5,"violet","vert","touffe","nat"),
P("Valériane rouge","Centranthus ruber","vivace",-18,"s","d","sl",[7,8.5],0.7,[5,6,7,8,9],4,"rouge rose blanc","gris","erige","med ang"),
P("Molène de Chaix","Verbascum chaixii","vivace",-29,"s","d","sl",[6,8.5],1,[6,7,8],5,"jaune blanc","gris","erige","nw nat eco"),
P("Épiaire laineuse","Stachys byzantina","vivace",-29,"s","d","sl",[6,8],0.3,[6,7],7,"rose","gris","couvre","med ang fr ros"),
P("Bétoine 'Hummelo'","Betonica officinalis 'Hummelo'","vivace",-35,"s","df","sl",[6,8],0.5,[7,8],7,"rose","vert","touffe","nw eco"),
P("Lin vivace","Linum perenne","vivace",-29,"s","d","sl",[6.5,8],0.5,[5,6,7],8,"bleu","gris","erige","med nat"),
P("Panicaut à feuilles planes","Eryngium planum","vivace",-29,"s","d","sl",[6,8],0.8,[7,8],5,"bleu","gris","erige","nw med gra eco"),
P("Boule azurée","Echinops ritro","vivace",-29,"s","d","sl",[6,8],1,[7,8],3,"bleu","gris","erige","nw med gra eco"),
P("Liatris","Liatris spicata","vivace",-35,"s","fh","sl",[5.5,7.5],0.6,[7,8],7,"violet","vert","erige","nw gra"),
P("Bistorte","Bistorta officinalis","vivace",-35,"sm","fh","la",[5.5,7.5],0.6,[5,6,7],6,"rose","vert","couvre","nat nw"),
P("Pigamon de Delavay","Thalictrum delavayi","vivace",-29,"sm","f","la",[6,7.5],1.5,[6,7,8],4,"violet rose","vert","erige","ang nw"),
P("Actée","Actaea simplex","vivace",-35,"mo","f","la",[5.5,7],1.4,[9,10],3,"blanc","pourpre","erige","ang jap nw"),
P("Ancolie commune","Aquilegia vulgaris","vivace",-35,"smo","f","sla",[6,8],0.6,[5,6],7,"bleu violet rose blanc","vert","touffe","nat ang"),
P("Bergénia","Bergenia cordifolia","vivace",-35,"smo","df","sla",[6,8],0.4,[3,4],7,"rose","vert","couvre","jap ang fr gra",{pers:1,note:"Grandes feuilles persistantes qui rougissent en hiver."}),
P("Tiarelle","Tiarella cordifolia","vivace",-35,"mo","f","la",[5,7],0.25,[4,5],9,"blanc","vert","couvre","nat jap ang",{pers:1}),
P("Lamier maculé","Lamium maculatum","vivace",-35,"mo","f","la",[6,8],0.2,[4,5,6],9,"rose blanc","panache","couvre","nat ang"),
P("Sceau de Salomon","Polygonatum × hybridum","vivace",-35,"mo","f","la",[5.5,7.5],0.7,[5],7,"blanc","vert","fontaine","jap nat ang"),
P("Aspérule odorante","Galium odoratum","vivace",-35,"mo","f","la",[6,8],0.2,[5],12,"blanc","vert","couvre","nat eco"),
P("Primevère acaule","Primula vulgaris","vivace",-29,"mo","f","la",[6,7.5],0.15,[2,3,4],11,"jaune","vert","touffe","nat eco ang",{jr:'r',sais:'h'}),
P("Hellébore fétide","Helleborus foetidus","vivace",-23,"mo","d","sla",[6.5,8.5],0.5,[1,2,3],5,"vert","vert","touffe","nat jap",{pers:1,note:"Plante toxique ; fleurit en plein hiver, nourrit les premiers bourdons."}),
P("Cyclamen de Naples","Cyclamen hederifolium","vivace",-23,"mo","d","sla",[6,8],0.1,[9,10],12,"rose blanc","panache","couvre","nat jap ang",{note:"Tubercules à fleur de terre, au pied des arbres."}),
P("Cyclamen de Cos","Cyclamen coum","vivace",-23,"mo","df","sla",[6,8],0.1,[1,2,3],12,"rose blanc","vert","couvre","nat jap ang"),
P("Perce-neige","Galanthus nivalis","vivace",-29,"mo","f","la",[6,8],0.15,[1,2],25,"blanc","vert","touffe","nat ang",{note:"Bulbes : planter « en vert » juste après la floraison, ou en automne.",noteM:3}),
P("Crocus botanique","Crocus tommasinianus","vivace",-29,"sm","df","sla",[6,8],0.1,[2,3],50,"violet","vert","touffe","nat ang nw eco",{jr:'b',sais:'h',note:"Bulbes : planter en septembre–octobre à 8 cm de profondeur.",noteM:9}),
P("Jonquille","Narcissus pseudonarcissus","vivace",-29,"sm","f","sla",[6,8],0.3,[3,4],25,"jaune","vert","touffe","nat ang",{note:"Bulbes : planter en septembre–octobre ; laisser jaunir le feuillage avant de le couper.",noteM:9}),
P("Narcisse 'Tête-à-Tête'","Narcissus 'Tête-à-Tête'","vivace",-29,"sm","f","sla",[6,8],0.2,[3],40,"jaune","vert","touffe","ang",{jr:'b',sais:'h'}),
P("Tulipe","Tulipa (hybrides de Darwin)","vivace",-29,"s","df","sl",[6,8],0.5,[4,5],30,"rouge rose jaune blanc violet orange","vert","erige","ang fr gra",{jr:'b',sais:'h',note:"Bulbes : planter en novembre à 15 cm de profondeur.",noteM:11}),
P("Camassia","Camassia leichtlinii","vivace",-29,"sm","fh","la",[5.5,7.5],0.9,[5],20,"bleu blanc","vert","erige","nw nat"),
P("Muscari","Muscari armeniacum","vivace",-29,"s","df","sl",[6,8],0.15,[4],50,"bleu","vert","touffe","ang nat eco",{jr:'b',sais:'h'}),
P("Anémone des bois","Anemone nemorosa","vivace",-35,"mo","f","la",[5,7.5],0.15,[3,4],15,"blanc","vert","couvre","nat"),
P("Ail des ours","Allium ursinum","vivace",-29,"mo","fh","la",[6,8],0.3,[4,5],15,"blanc","vert","couvre","nat viv",{note:"Comestible, mais ressemble au muguet et au colchique (toxiques) : bien l’identifier."}),
P("Reine-des-prés","Filipendula ulmaria","vivace",-35,"sm","h","la",[5.5,8],1.2,[6,7,8],4,"blanc","vert","erige","nat eco"),
P("Grande consoude","Symphytum officinale","vivace",-35,"sm","fh","la",[6,8],1,[5,6,7],2,"violet rose","vert","touffe","viv eco nat",{note:"Ses feuilles font un purin riche en potasse pour le potager."}),
P("Vipérine","Echium vulgare","vivace",-23,"s","d","s",[6,8.5],0.8,[6,7,8],5,"bleu","vert","erige","eco nat med",{note:"Bisannuelle très mellifère qui se ressème."}),
P("Marguerite commune","Leucanthemum vulgare","vivace",-35,"s","df","sl",[6,8],0.6,[5,6,7],7,"blanc","vert","erige","nat eco ang"),
P("Grande marguerite","Leucanthemum × superbum","vivace",-29,"s","f","la",[6,8],0.8,[6,7,8],5,"blanc","vert","erige","ang"),
P("Sauge des prés","Salvia pratensis","vivace",-29,"s","d","sl",[6.5,8.5],0.6,[5,6,7],6,"bleu violet","vert","erige","nat eco nw"),
P("Orpin blanc","Sedum album","vivace",-29,"s","d","s",[6,8.5],0.1,[6,7],12,"blanc","vert","couvre","med tal eco",{pers:1}),
P("Thym serpolet","Thymus serpyllum","vivace",-29,"s","d","sl",[6,8.5],0.1,[6,7,8],10,"rose violet","vert","couvre","tal med eco nat",{pers:1}),
P("Œillet des Chartreux","Dianthus carthusianorum","vivace",-29,"s","d","sl",[6.5,8.5],0.4,[6,7,8],9,"rose","vert","touffe","nw med eco"),
P("Armérie maritime","Armeria maritima","vivace",-29,"s","d","s",[5.5,8],0.2,[5,6,7],9,"rose blanc","vert","touffe","med jap",{pers:1}),
P("Euphorbe polychrome","Euphorbia epithymoides","vivace",-29,"s","df","sl",[6,8],0.4,[4,5],5,"jaune","vert","arrondi","ang med",{note:"Sève irritante : porter des gants."}),
P("Rodgersia","Rodgersia podophylla","vivace",-29,"mo","h","la",[5,7],1,[6,7],1,"blanc","pourpre","touffe","jap ang"),
P("Ligulaire","Ligularia dentata","vivace",-35,"mo","h","la",[5.5,7],1.2,[7,8],2,"orange","pourpre","touffe","jap nat"),
P("Lysimaque nummulaire dorée","Lysimachia nummularia 'Aurea'","vivace",-35,"mo","fh","la",[5.5,7.5],0.05,[6,7],9,"jaune","panache","couvre","nat jap",{jr:'t',sais:'a'}),
P("Gaulthérie couchée","Gaultheria procumbens","vivace",-29,"mo","f","sl",[4.5,6],0.15,[7],9,"blanc","vert","couvre","jap",{pers:1,jr:'t',sais:'h',note:"Baies rouges en hiver ; exige un sol acide."}),
P("Bruyère d'hiver","Erica carnea","vivace",-29,"s","df","sl",[5,8],0.25,[12,1,2,3,4],8,"rose blanc","vert","couvre","jap tal",{pers:1,jr:'r',sais:'h'}),
P("Callune","Calluna vulgaris","vivace",-29,"s","df","s",[4,6],0.4,[8,9,10],7,"rose violet blanc","vert","touffe","nat jap",{pers:1,jr:'r',sais:'h',note:"Sol acide obligatoire ; tailler légèrement après floraison."}),
/* graminées */
P("Panic érigé","Panicum virgatum","graminee",-35,"s","df","sla",[5.5,8],1.2,[8,9,10],3,"blond rose","automne","erige","nw gra"),
P("Seslérie d'automne","Sesleria autumnalis","graminee",-29,"sm","df","sla",[6,8.5],0.4,[8,9],7,"blond","vert","touffe","nw jap",{pers:1}),
P("Laîche 'Evergold'","Carex oshimensis 'Evergold'","graminee",-18,"sm","f","la",[5.5,7.5],0.3,[],7,"","panache","fontaine","jap ang",{pers:1,jr:'r',sais:'a'}),
P("Herbe aux écouvillons d'Orient","Pennisetum orientale","graminee",-18,"s","d","sl",[6,8],0.6,[6,7,8,9],5,"rose blond","vert","fontaine","nw med"),
P("Amourette","Briza media","graminee",-35,"s","d","sl",[6,8.5],0.4,[5,6,7],8,"blond","vert","touffe","nat eco nw"),
P("Mélique ciliée","Melica ciliata","graminee",-29,"s","d","sl",[6,8.5],0.5,[5,6],7,"blond","gris","touffe","med nw"),
P("Chasmanthe à larges feuilles","Chasmanthium latifolium","graminee",-29,"sm","f","la",[5.5,7.5],0.9,[8,9],4,"blond","vert","erige","nw jap"),
P("Ophiopogon noir","Ophiopogon planiscapus 'Nigrescens'","graminee",-18,"sm","f","la",[5.5,7.5],0.2,[7],9,"violet","pourpre","touffe","jap gra",{pers:1}),
P("Liriope","Liriope muscari","graminee",-18,"smo","df","la",[5.5,7.5],0.35,[8,9,10],7,"violet","vert","touffe","jap gra",{pers:1}),
P("Herbe aux écouvillons pourpre","Pennisetum × advena 'Rubrum'","annuelle",null,"s","df","sl",[6,7.5],0.8,[7,8,9,10],3,"rose","pourpre","fontaine","nw",{jr:'h',sais:'e',esp:35}),
/* fougères */
P("Osmonde royale","Osmunda regalis","fougere",-35,"mo","h","sl",[4.5,6.5],1.2,[],2,"","automne","fontaine","nat jap"),
P("Blechnum en épi","Blechnum spicant","fougere",-23,"mo","f","sl",[4,6],0.4,[],7,"","vert","touffe","nat jap",{pers:1}),
P("Fougère d'automne","Dryopteris erythrosora","fougere",-23,"mo","f","la",[5,7],0.6,[],4,"","automne","fontaine","jap ang",{pers:1}),
/* arbustes, dont floraisons d'hiver */
P("Viorne de Bodnant 'Dawn'","Viburnum × bodnantense 'Dawn'","arbuste",-23,"sm","f","la",[6,8],2.5,[11,12,1,2,3],0,"rose","vert","erige","ang jap",{note:"Fleurs parfumées en plein hiver : à planter près d’un passage."}),
P("Hamamélis","Hamamelis × intermedia","arbuste",-23,"sm","f","la",[5,7],3,[1,2],0,"jaune orange rouge","automne","etale","jap ang"),
P("Mahonia 'Charity'","Mahonia × media 'Charity'","arbuste",-18,"mo","df","la",[5.5,8],2.5,[11,12,1],0,"jaune","vert","erige","jap ang",{pers:1}),
P("Sarcococca","Sarcococca confusa","arbuste",-18,"mo","df","la",[6,8],1,[12,1,2],0,"blanc","vert","arrondi","jap fr ang",{pers:1,jr:'h',sais:'h',note:"Parfum intense en janvier : idéal en bord d’allée ou en bac."}),
P("Jasmin d'hiver","Jasminum nudiflorum","arbuste",-23,"smo","df","sla",[6,8],1.5,[12,1,2,3],0,"jaune","vert","etale","tal ang"),
P("Chimonanthe","Chimonanthus praecox","arbuste",-18,"s","df","la",[6,8],3,[12,1,2],0,"jaune","vert","erige","ang"),
P("Skimmia 'Rubella'","Skimmia japonica 'Rubella'","arbuste",-18,"mo","f","la",[5,6.5],0.8,[3,4],3,"rose blanc","vert","arrondi","jap",{pers:1,jr:'h',sais:'h',note:"Boutons rouges décoratifs tout l’hiver ; sol acide."}),
P("Andromède du Japon","Pieris japonica","arbuste",-18,"m","f","sl",[4.5,6],1.5,[3,4],0,"blanc","pourpre","arrondi","jap",{pers:1,note:"Exige un sol acide (terre de bruyère)."}),
P("Cornouiller blanc 'Sibirica'","Cornus alba 'Sibirica'","arbuste",-40,"sm","fh","la",[5.5,8],2,[5,6],0,"blanc","automne","erige","nat jap gra",{note:"Rameaux rouge vif en hiver : recéper un tiers des tiges chaque mars.",noteM:3}),
P("Lilas commun","Syringa vulgaris","arbuste",-35,"s","df","sla",[6.5,8.5],4,[5],0,"violet blanc rose","vert","erige","ang"),
P("Seringat","Philadelphus coronarius","arbuste",-29,"sm","df","sla",[6,8],2.5,[6],0,"blanc","vert","erige","ang"),
P("Weigela","Weigela florida","arbuste",-29,"sm","f","la",[6,7.5],2,[5,6],0,"rose rouge","vert","arrondi","ang"),
P("Deutzia grêle","Deutzia gracilis","arbuste",-23,"sm","f","la",[6,7.5],1,[5,6],0,"blanc","vert","arrondi","ang jap"),
P("Spirée du Japon","Spiraea japonica","arbuste",-29,"s","df","sla",[6,7.5],0.8,[6,7,8],0,"rose","vert","arrondi","ang gra"),
P("Potentille arbustive","Dasiphora fruticosa","arbuste",-35,"s","df","sla",[6,8],1,[6,7,8,9],0,"jaune blanc","vert","arrondi","ang tal"),
P("Abélia","Abelia × grandiflora","arbuste",-18,"s","df","sla",[6,7.5],1.5,[7,8,9,10],0,"blanc rose","vert","arrondi","ang med",{pers:1}),
P("Caryoptéris","Caryopteris × clandonensis","arbuste",-18,"s","d","sl",[6,8],1,[8,9],0,"bleu","gris","arrondi","med nw"),
P("Céanothe 'Concha'","Ceanothus 'Concha'","arbuste",-15,"s","d","sl",[6,7.5],2,[5,6],0,"bleu","vert","arrondi","med ang",{pers:1}),
P("Arbre à perruque","Cotinus coggygria","arbuste",-23,"s","d","sla",[6,8],3,[6,7],0,"rose","pourpre automne","arrondi","ang gra med"),
P("Hortensia","Hydrangea macrophylla","arbuste",-18,"mo","fh","la",[5,7],1.5,[7,8,9],0,"bleu rose blanc","vert","arrondi","ang jap",{note:"Fleurs bleues en sol acide, roses en sol calcaire ; ne tailler que les fleurs fanées, en mars.",noteM:3}),
P("Hortensia à feuilles de chêne","Hydrangea quercifolia","arbuste",-23,"sm","f","la",[5,7],1.8,[7,8],0,"blanc","automne","etale","ang jap"),
P("Hortensia 'Annabelle'","Hydrangea arborescens 'Annabelle'","arbuste",-35,"smo","fh","la",[5.5,7.5],1.5,[6,7,8,9],0,"blanc","vert","arrondi","ang nw",{note:"Rabattre à 30 cm du sol en mars.",noteM:3}),
P("Fuchsia de Magellan","Fuchsia magellanica","arbuste",-15,"sm","f","la",[6,7.5],1.2,[7,8,9,10],0,"rouge violet","vert","arrondi","ang"),
P("Oranger du Mexique","Choisya ternata","arbuste",-15,"sm","f","sla",[6,7.5],1.8,[4,5,9],0,"blanc","vert","arrondi","fr ang med",{pers:1}),
P("Bambou sacré","Nandina domestica","arbuste",-18,"sm","f","la",[5.5,7.5],1.2,[7],0,"blanc","pourpre","erige","jap gra",{pers:1}),
P("Pin des montagnes nain","Pinus mugo 'Mops'","arbuste",-40,"s","d","sl",[5,8],1,[],0,"","vert","arrondi","jap gra med",{pers:1}),
P("Osmanthe de Burkwood","Osmanthus × burkwoodii","arbuste",-18,"sm","f","la",[6,7.5],2,[4],0,"blanc","vert","arrondi","fr jap",{pers:1}),
P("Sureau noir","Sambucus nigra","arbuste",-35,"sm","fh","la",[5.5,8],4,[6],0,"blanc","vert","erige","nat eco viv",{note:"Fleurs et baies comestibles cuites (crues, les baies sont toxiques)."}),
P("Aubépine monogyne","Crataegus monogyna","arbuste",-35,"s","df","sla",[5.5,8.5],6,[5],0,"blanc","vert","arrondi","nat eco"),
P("Viorne lantane","Viburnum lantana","arbuste",-29,"sm","d","sla",[6.5,8.5],3,[5],0,"blanc","vert","arrondi","nat eco tal"),
P("Prunellier","Prunus spinosa","arbuste",-35,"s","df","sla",[5.5,8.5],3,[3,4],0,"blanc","vert","erige","nat eco tal",{note:"Drageonne : parfait en haie défensive et sur talus."}),
P("Églantier","Rosa canina","arbuste",-35,"s","df","sla",[5.5,8.5],2.5,[6],0,"rose","vert","etale","nat eco tal ros",R_('botanique',1,0)),
P("Groseillier à fleurs","Ribes sanguineum","arbuste",-23,"sm","f","sla",[5.5,7.5],2,[4],0,"rose rouge","vert","erige","ang nat eco"),
P("Bois-joli","Daphne mezereum","arbuste",-29,"mo","f","la",[6.5,8],1,[2,3],0,"rose","vert","erige","nat ang",{note:"Toutes les parties sont très toxiques."}),
/* arbres */
P("Cerisier du Japon 'Kanzan'","Prunus serrulata 'Kanzan'","arbre",-29,"s","f","la",[6,7.5],8,[4,5],0,"rose","automne","etale","jap ang"),
P("Cerisier d'hiver","Prunus × subhirtella 'Autumnalis'","arbre",-29,"s","f","la",[6,7.5],6,[11,12,1,2,3],0,"blanc rose","automne","etale","jap ang",{note:"Fleurit par vagues lors des redoux, de novembre à mars."}),
P("Magnolia de Soulange","Magnolia × soulangeana","arbre",-23,"sm","f","la",[5,7],6,[4],0,"rose blanc","vert","etale","ang jap"),
P("Cornouiller de Kousa","Cornus kousa","arbre",-23,"sm","f","la",[5,7],6,[6],0,"blanc","automne","etale","jap ang"),
P("Chêne pédonculé","Quercus robur","arbre",-35,"s","fh","la",[4.5,8],25,[5],0,"vert","vert","arrondi","nat eco",{note:"L’arbre indigène qui accueille le plus d’espèces d’insectes ; prévoir de la place."}),
P("Tilleul à petites feuilles","Tilia cordata","arbre",-35,"sm","f","sla",[5.5,8],20,[7],0,"blanc","vert","arrondi","nat eco fr"),
P("Merisier","Prunus avium","arbre",-29,"s","f","la",[6,8],15,[4],0,"blanc","automne","erige","nat eco"),
P("Alisier torminal","Sorbus torminalis","arbre",-29,"s","df","la",[6,8.5],12,[5],0,"blanc","automne","arrondi","nat eco"),
P("Pommier sauvage","Malus sylvestris","arbre",-29,"s","f","la",[5.5,8],7,[4,5],0,"blanc rose","vert","arrondi","nat eco"),
P("Arbre de fer","Parrotia persica","arbre",-23,"sm","f","la",[5.5,7.5],7,[2,3],0,"rouge","automne","etale","jap ang"),
P("Pin sylvestre","Pinus sylvestris","arbre",-40,"s","d","s",[4,7],20,[],0,"","vert","erige","nat jap",{pers:1}),
/* rosiers */
P("Rosier 'Gertrude Jekyll'","Rosa 'Gertrude Jekyll'","arbuste",-23,"s","f","la",[6,7.5],1.5,[6,7,8,9],1,"rose","vert","arrondi","ros ang",R_('anglais',3,1)),
P("Rosier 'Graham Thomas'","Rosa 'Graham Thomas'","arbuste",-23,"sm","f","la",[6,7.5],1.5,[6,7,8,9],1,"jaune","vert","arrondi","ros ang",R_('anglais',2,1)),
P("Rosier 'Olivia Rose Austin'","Rosa 'Olivia Rose Austin'","arbuste",-23,"sm","f","la",[6,7.5],1.1,[6,7,8,9,10],1.5,"rose","vert","arrondi","ros ang",R_('anglais',2,1,{res:1})),
P("Rosier 'Munstead Wood'","Rosa 'Munstead Wood'","arbuste",-23,"s","f","la",[6,7.5],1,[6,7,8,9],1.5,"rouge","vert","arrondi","ros ang",R_('anglais',3,1)),
P("Rosier 'Desdemona'","Rosa 'Desdemona'","arbuste",-23,"sm","f","la",[6,7.5],1.2,[6,7,8,9,10],1.5,"blanc","vert","arrondi","ros ang",R_('anglais',2,1,{res:1})),
P("Rosier 'Lady of Shalott'","Rosa 'Lady of Shalott'","arbuste",-23,"sm","f","la",[6,7.5],1.2,[6,7,8,9,10],1.5,"orange","vert","arrondi","ros ang",R_('anglais',1,1,{res:1})),
P("Rosier 'Bonica'","Rosa 'Bonica'","arbuste",-29,"sm","df","sla",[6,7.5],1,[6,7,8,9,10],2,"rose","vert","arrondi","ros ang",R_('arbustif',0,1,{res:1,adr:1})),
P("Rosier 'Westerland'","Rosa 'Westerland'","arbuste",-29,"s","f","la",[6,7.5],1.8,[6,7,8,9],1,"orange","vert","erige","ros",R_('arbustif',2,1,{res:1,adr:1})),
P("Rosier 'Iceberg'","Rosa 'Iceberg'","arbuste",-23,"s","f","la",[6,7.5],1,[6,7,8,9,10],3,"blanc","vert","arrondi","ros fr",R_('flori',1,1)),
P("Rosier 'Rhapsody in Blue'","Rosa 'Rhapsody in Blue'","arbuste",-23,"s","f","la",[6,7.5],1.2,[6,7,8,9],3,"violet","vert","erige","ros",R_('flori',2,1)),
P("Rosier 'Papa Meilland'","Rosa 'Papa Meilland'","arbuste",-18,"s","f","la",[6,7.5],1,[6,7,8,9],4,"rouge","vert","erige","ros fr",R_('buisson',3,1,{fragile:1})),
P("Rosier 'Mme A. Meilland' (Peace)","Rosa 'Madame A. Meilland'","arbuste",-23,"s","f","la",[6,7.5],1.2,[6,7,8,9],4,"jaune rose","vert","erige","ros fr",R_('buisson',1,1)),
P("Rosier couvre-sol 'The Fairy'","Rosa 'The Fairy'","arbuste",-29,"sm","df","sla",[6,7.5],0.6,[7,8,9,10],3,"rose","vert","etale","ros tal",R_('couvre',0,1,{res:1})),
P("Rosier couvre-sol 'Kent'","Rosa 'Kent'","arbuste",-29,"sm","df","sla",[6,7.5],0.5,[6,7,8,9,10],3,"blanc","vert","etale","ros tal",R_('couvre',0,1,{res:1,adr:1})),
P("Rosier grimpant 'New Dawn'","Rosa 'New Dawn'","arbuste",-29,"sm","f","la",[6,7.5],4,[6,7,8,9],0,"rose","vert","etale","ros ang",R_('grimpant',2,1,{res:1})),
P("Rosier grimpant 'Pierre de Ronsard'","Rosa 'Pierre de Ronsard'","arbuste",-23,"s","f","la",[6,7.5],3,[6,7,8,9],0,"rose blanc","vert","etale","ros ang",R_('grimpant',1,1)),
P("Rosier grimpant 'Mme Alfred Carrière'","Rosa 'Madame Alfred Carrière'","arbuste",-23,"sm","f","la",[6,7.5],5,[6,7,8,9],0,"blanc","vert","etale","ros ang",R_('grimpant',3,1,{nord:1})),
P("Rosier grimpant 'Ghislaine de Féligonde'","Rosa 'Ghislaine de Féligonde'","arbuste",-23,"sm","f","la",[6,7.5],3,[6,7,8],0,"jaune orange","vert","etale","ros ang",R_('grimpant',1,1,{res:1})),
P("Rosier grimpant 'Gloire de Dijon'","Rosa 'Gloire de Dijon'","arbuste",-18,"sm","f","la",[6,7.5],4,[6,7,8,9],0,"jaune orange","vert","etale","ros ang",R_('grimpant',3,1)),
P("Rosier 'The Generous Gardener'","Rosa 'The Generous Gardener'","arbuste",-23,"sm","f","la",[6,7.5],3,[6,7,8,9],0,"rose","vert","etale","ros ang",R_('grimpant',3,1)),
P("Rosier à feuilles rouges","Rosa glauca","arbuste",-35,"sm","df","sla",[6,8],2,[6],0,"rose","pourpre","erige","ros nat gra",R_('botanique',0,0)),
P("Rosier de Moyes 'Geranium'","Rosa moyesii 'Geranium'","arbuste",-29,"s","df","sla",[6,8],2.5,[6],0,"rouge","vert","erige","ros ang",R_('botanique',0,0)),
/* annuelles et saisonnières de jardinière */
P("Géranium-lierre","Pelargonium peltatum","annuelle",null,"s","df","sl",[6,7.5],0.3,[5,6,7,8,9,10],9,"rose rouge blanc violet","vert","etale","ang",{jr:'t',sais:'e',esp:25}),
P("Géranium zonale","Pelargonium × hortorum","annuelle",null,"s","df","sl",[6,7.5],0.4,[5,6,7,8,9,10],9,"rouge rose blanc orange","vert","touffe","ang",{jr:'r',sais:'e',esp:25}),
P("Pétunia retombant","Petunia × atkinsiana (retombant)","annuelle",null,"s","f","sl",[5.5,7],0.25,[5,6,7,8,9,10],9,"violet rose blanc rouge bleu","vert","etale","ang",{jr:'t',sais:'e',esp:25,note:"Gourmand : engrais liquide chaque semaine."}),
P("Calibrachoa","Calibrachoa (Million Bells)","annuelle",null,"s","f","sl",[5.5,6.5],0.2,[5,6,7,8,9,10],9,"jaune orange rose violet rouge blanc","vert","etale","ang",{jr:'t',sais:'e',esp:20}),
P("Verveine retombante","Verbena × hybrida (retombante)","annuelle",null,"s","df","sl",[6,7.5],0.2,[5,6,7,8,9,10],9,"rose violet rouge blanc","vert","etale","ang eco",{jr:'t',sais:'e',esp:25}),
P("Bidens","Bidens ferulifolia","annuelle",null,"s","df","sl",[6,7.5],0.3,[5,6,7,8,9,10],9,"jaune","vert","etale","ang eco",{jr:'t',sais:'e',esp:25}),
P("Scaevola","Scaevola aemula","annuelle",null,"sm","df","sl",[6,7.5],0.2,[5,6,7,8,9,10],9,"bleu violet","vert","etale","ang",{jr:'t',sais:'e',esp:25}),
P("Lobélie","Lobelia erinus","annuelle",null,"sm","f","sl",[6,7.5],0.15,[5,6,7,8,9],9,"bleu blanc violet","vert","etale","ang",{jr:'t',sais:'e',esp:15}),
P("Alysse odorante","Lobularia maritima","annuelle",null,"s","df","sl",[6,7.5],0.15,[5,6,7,8,9,10],9,"blanc violet","vert","couvre","ang eco",{jr:'t',sais:'e',esp:15}),
P("Dichondra argenté","Dichondra argentea 'Silver Falls'","annuelle",null,"s","d","sl",[6,7.5],0.1,[],9,"","gris","etale","med",{jr:'t',sais:'e',esp:30,note:"Retombées argentées jusqu’à 1 m."}),
P("Patate douce d'ornement","Ipomoea batatas (ornementale)","annuelle",null,"sm","f","sl",[6,7.5],0.3,[],9,"","pourpre","etale","ang",{jr:'t',sais:'e',esp:30}),
P("Lantanier","Lantana camara","annuelle",null,"s","d","sl",[6,7.5],0.5,[6,7,8,9,10],9,"orange jaune rose rouge","vert","arrondi","med",{jr:'h',sais:'e',esp:30,note:"Baies toxiques."}),
P("Sauge farineuse","Salvia farinacea","annuelle",null,"s","df","sl",[6,7.5],0.5,[6,7,8,9,10],9,"bleu blanc","vert","erige","ang eco",{jr:'h',sais:'e',esp:25}),
P("Œillet d'Inde","Tagetes patula","annuelle",null,"s","df","sla",[6,7.5],0.3,[6,7,8,9,10],9,"orange jaune rouge","vert","touffe","ang viv",{jr:'r',sais:'e',esp:20,note:"Compagnon du potager : éloigne certains nématodes et pucerons."}),
P("Gazania","Gazania rigens","annuelle",null,"s","d","sl",[6,7.5],0.25,[6,7,8,9,10],9,"orange jaune rouge rose","gris","touffe","med",{jr:'r',sais:'e',esp:20}),
P("Pourpier à grandes fleurs","Portulaca grandiflora","annuelle",null,"s","d","s",[6,7.5],0.15,[6,7,8,9],9,"rose orange jaune rouge blanc","vert","couvre","med",{jr:'t',sais:'e',esp:15}),
P("Héliotrope","Heliotropium arborescens","annuelle",null,"s","f","la",[6,7.5],0.4,[6,7,8,9],9,"violet","pourpre","arrondi","ang",{jr:'h',sais:'e',esp:25}),
P("Némésia","Nemesia strumosa","annuelle",null,"sm","f","sl",[6,7.5],0.3,[5,6,7,8,9],9,"bleu blanc rose jaune","vert","touffe","ang",{jr:'r',sais:'e',esp:20}),
P("Impatiens de Nouvelle-Guinée","Impatiens hawkeri","annuelle",null,"mo","f","la",[5.5,7],0.35,[5,6,7,8,9,10],9,"rose rouge orange blanc violet","vert","arrondi","ang",{jr:'r',sais:'e',esp:25}),
P("Bégonia retombant","Begonia boliviensis","annuelle",null,"mo","f","la",[5.5,7],0.3,[6,7,8,9,10],9,"rouge orange rose jaune","vert","etale","ang",{jr:'t',sais:'e',esp:25}),
P("Bégonia des jardins","Begonia semperflorens","annuelle",null,"smo","f","la",[5.5,7],0.2,[5,6,7,8,9,10],9,"rose rouge blanc","vert","touffe","ang fr",{jr:'r',sais:'e',esp:15}),
P("Fuchsia retombant","Fuchsia (hybrides retombants)","annuelle",null,"mo","f","la",[5.5,7],0.4,[6,7,8,9,10],9,"rose rouge violet blanc","vert","etale","ang",{jr:'t',sais:'e',esp:25}),
P("Coléus","Coleus scutellarioides","annuelle",null,"mo","f","la",[6,7],0.4,[],9,"","pourpre panache","erige","ang",{jr:'h',sais:'e',esp:25,note:"Pincer les épis floraux pour garder un beau feuillage."}),
P("Torénia","Torenia fournieri","annuelle",null,"mo","f","la",[6,7],0.2,[6,7,8,9],9,"bleu violet rose","vert","etale","ang",{jr:'t',sais:'e',esp:20}),
P("Pensée","Viola × wittrockiana","annuelle",null,"smo","f","sla",[6,7.5],0.2,[10,11,12,1,2,3,4,5],9,"jaune bleu violet blanc orange rouge","vert","touffe","ang",{jr:'r',sais:'h',esp:15}),
P("Violette cornue","Viola cornuta","annuelle",null,"smo","f","sla",[6,7.5],0.15,[10,11,12,1,2,3,4,5],9,"bleu violet jaune blanc","vert","touffe","ang eco",{jr:'t',sais:'h',esp:12}),
P("Primevère des jardins","Primula × polyantha","annuelle",null,"mo","f","la",[6,7.5],0.15,[1,2,3,4],9,"jaune rouge rose blanc bleu","vert","touffe","ang",{jr:'r',sais:'h',esp:15}),
P("Cyclamen de Perse miniature","Cyclamen persicum (mini)","annuelle",null,"mo","f","la",[6,7],0.2,[9,10,11,12,1,2,3],9,"rose rouge blanc","panache","touffe","ang",{jr:'r',sais:'h',esp:15,note:"Gèle vers −3 °C : réservé aux balcons abrités."}),
P("Chou d'ornement","Brassica oleracea (ornemental)","annuelle",null,"s","f","la",[6,7.5],0.3,[],9,"","pourpre panache","arrondi","ang",{jr:'r',sais:'h',esp:25})
);
['Hedera helix',"Heuchera micrantha 'Palace Purple'",'Festuca glauca','Thymus vulgaris','Lavandula angustifolia','Salvia officinalis','Allium schoenoprasum','Helleborus × hybridus','Ajuga reptans','Vinca minor'].forEach((l,i)=>{const p=PL.find(x=>x.l===l);if(p&&!p.jr){p.jr=['t','r','r','r','h','r','r','r','t','t'][i];p.sais='a'}});
[['Cosmos bipinnatus','h'],['Tropaeolum majus','t'],['Calendula officinalis','r'],['Nigella damascena','r'],['Zinnia elegans','r'],['Nicotiana sylvestris','h'],['Verbena bonariensis','h']].forEach(([l,j])=>{const p=PL.find(x=>x.l===l);if(p){p.jr=j;p.sais='e';p.esp=j==='h'?30:20}});

/* tags complémentaires : viv (comestible), eco (mellifère / indigène, biodiversité), gra (silhouette graphique) */
const TAG={viv:['Amelanchier lamarckii','Cornus mas','Corylus avellana','Salvia rosmarinus','Tropaeolum majus','Calendula officinalis','Lavandula angustifolia','Allium schoenoprasum'],
 eco:['Acer campestre','Amelanchier lamarckii','Sorbus aucuparia','Cornus mas','Viburnum opulus','Corylus avellana','Euonymus europaeus','Ilex aquifolium','Echinacea purpurea','Nepeta × faassenii','Salvia nemorosa','Achillea millefolium',"Hylotelephium 'Herbstfreude'",'Lavandula angustifolia','Geranium macrorrhizum','Digitalis purpurea','Eutrochium maculatum','Sanguisorba officinalis',"Agastache 'Blue Fortune'",'Lythrum salicaria','Ajuga reptans','Pulmonaria officinalis','Verbena bonariensis','Papaver rhoeas','Deschampsia cespitosa','Luzula sylvatica','Carex pendula','Dryopteris filix-mas','Athyrium filix-femina','Polypodium vulgare','Molinia caerulea','Iris sibirica','Cosmos bipinnatus','Calendula officinalis'],
 tal:['Geranium macrorrhizum','Epimedium × versicolor','Nepeta × faassenii','Achillea millefolium','Origanum vulgare','Thymus vulgaris','Festuca glauca','Stipa tenuissima','Deschampsia cespitosa','Luzula sylvatica','Euphorbia amygdaloides var. robbiae','Ajuga reptans',"Hylotelephium 'Herbstfreude'",'Lavandula angustifolia','Salvia rosmarinus','Cistus × corbariensis','Teucrium × lucidrys','Polypodium vulgare','Dryopteris filix-mas','Corylus avellana','Fragaria × ananassa','Carex pendula'],
 gra:['Taxus baccata','Buxus sempervirens','Ilex crenata','Calamagrostis × acutiflora','Miscanthus sinensis','Pennisetum alopecuroides','Hakonechloa macra','Festuca glauca','Stipa tenuissima',"Allium 'Purple Sensation'",'Echinacea purpurea','Euphorbia characias',"Agastache 'Blue Fortune'",'Hosta sieboldiana',"Heuchera micrantha 'Palace Purple'",'Acer palmatum','Iris sibirica','Veronicastrum virginicum','Matteuccia struthiopteris','Betula pendula','Sporobolus heterolepis','Salvia yangii (Perovskia)']};
Object.entries(TAG).forEach(([t,ls])=>ls.forEach(l=>{const p=PL.find(x=>x.l===l);if(p&&!p.st.includes(t))p.st.push(t)}));
['Nepeta × faassenii','Lavandula angustifolia','Alchemilla mollis',"Geranium 'Rozanne'",'Salvia nemorosa','Digitalis purpurea','Campanula lactiflora','Delphinium elatum (hybrides)',"Allium 'Purple Sensation'",'Buxus sempervirens','Teucrium × lucidrys','Ilex crenata','Rosa (hybride anglais)','Clinopodium nepeta','Oenothera lindheimeri','Salvia yangii (Perovskia)','Astrantia major'].forEach(l=>{const p=PL.find(x=>x.l===l);if(p&&!p.st.includes('ros'))p.st.push('ros')});
function pip(x,y,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((px-ax)*dx+(py-ay)*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-t*dx,py-ay-t*dy)}
function polyArea(poly){let a=0;for(let i=0,j=poly.length-1;i<poly.length;j=i++)a+=(poly[j][0]+poly[i][0])*(poly[j][1]-poly[i][1]);return Math.abs(a/2)}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const oddify=q=>q<3?q:(q%2?q:q+1);
if(typeof module!=='undefined')module.exports={sunPos,texClass,TEXCAT,procClim,usda,hull,scorePlant,PL,pip,segDist,polyArea,rng,oddify};
