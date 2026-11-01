/* ================= icon + manifest (generated, no image files needed) ================= */
function icon(s){const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,s,s);g.addColorStop(0,'#7c3aed');g.addColorStop(1,'#ff4d8d');x.fillStyle=g;x.fillRect(0,0,s,s);x.fillStyle='rgba(255,209,102,.45)';x.beginPath();x.arc(s*.75,s*.75,s*.22,0,7);x.fill();x.fillStyle='#fff';x.font='900 '+(s*.6)+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('B',s/2,s*.54);return c.toDataURL()}
(function(){const a=document.createElement('link');a.rel='apple-touch-icon';a.href=icon(180);document.head.appendChild(a);
const mf={name:'Blurr',short_name:'Blurr',start_url:location.href.split('#')[0],display:'standalone',background_color:'#0f0b1f',theme_color:'#0f0b1f',icons:[{src:icon(192),sizes:'192x192',type:'image/png'},{src:icon(512),sizes:'512x512',type:'image/png',purpose:'any maskable'}]};
const m=document.createElement('link');m.rel='manifest';m.href=URL.createObjectURL(new Blob([JSON.stringify(mf)],{type:'application/manifest+json'}));document.head.appendChild(m)})();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});

/* ================= helpers & state ================= */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const W=1080;let H=1350,cv,zoom=1,hist=[],hi=-1,lock=false,pal=-1,curTab='templates',deferred=null,cat='All',fxAll=false;
const SIZES=[['Flyer',1350],['Square',1080],['Story',1920],['A4',1528],['Banner',608]];
const PAL=[
 {bg:'#1b1035',bg2:'#ff5e62',ink:'#ffffff',a:'#ffd166',a2:'#ff5e62'},
 {bg:'#04293a',bg2:'#0a6c8f',ink:'#ffffff',a:'#ecb365',a2:'#41b3a3'},
 {bg:'#f1fff6',bg2:'#b9f6ca',ink:'#0b3d2e',a:'#00c853',a2:'#00897b'},
 {bg:'#111111',bg2:'#333333',ink:'#ffffff',a:'#ffffff',a2:'#999999'},
 {bg:'#fff0f6',bg2:'#ffb3d1',ink:'#3d0a2b',a:'#ff2d87',a2:'#7c3aed'},
 {bg:'#0d0d0d',bg2:'#2a2113',ink:'#f5e6c4',a:'#d4a017',a2:'#f5e6c4'},
 {bg:'#0b132b',bg2:'#1c2541',ink:'#ffffff',a:'#5bc0be',a2:'#3a506b'},
 {bg:'#fff8e7',bg2:'#ffd9a0',ink:'#4a2c0a',a:'#e85d04',a2:'#9d0208'},
 {bg:'#2b0a3d',bg2:'#7b2cbf',ink:'#ffffff',a:'#ffd60a',a2:'#ff9e00'},
 {bg:'#ffffff',bg2:'#e9ecef',ink:'#111111',a:'#e63946',a2:'#1d3557'},
 {bg:'#1a2e05',bg2:'#38761d',ink:'#f1ffe0',a:'#d9f99d',a2:'#facc15'},
 {bg:'#3a0ca3',bg2:'#f72585',ink:'#ffffff',a:'#4cc9f0',a2:'#ffd166'}];
const curP=()=>PAL[pal<0?0:pal];
const FONTS=['Arial Black','Impact','Georgia','Trebuchet MS','Verdana','Courier New','Palatino','Brush Script MT,cursive','Times New Roman','Arial'];
const Y=v=>Math.round(v*H/1350);
const bgObj=()=>cv.getObjects().find(o=>o.name==='bg');
const imgs=()=>cv.getObjects().filter(o=>o.type==='image');
const loadImg=u=>new Promise(r=>fabric.Image.fromURL(u,r));
const rnd=a=>a[Math.random()*a.length|0];
function toast(m,t=2600){const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),t)}
function hex(c,d){if(typeof c!=='string')return d;if(c[0]==='#')return c.length===4?'#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3]:c.slice(0,7);const m=c.match(/\d+/g);return m&&m.length>=3?'#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join(''):d}
const NONE='rgba(0,0,0,0)';
function grad(a,b,d='v'){
 const st=[{offset:0,color:a},{offset:1,color:b}];
 if(d==='r')return new fabric.Gradient({type:'radial',gradientUnits:'pixels',coords:{x1:W/2,y1:H/2,r1:0,x2:W/2,y2:H/2,r2:Math.max(W,H)*.75},colorStops:st});
 const c=d==='h'?{x1:0,y1:0,x2:W,y2:0}:d==='d'?{x1:0,y1:0,x2:W,y2:H}:{x1:0,y1:0,x2:0,y2:H};
 return new fabric.Gradient({type:'linear',gradientUnits:'pixels',coords:c,colorStops:st})}
const mk={
 t:(s,o={})=>new fabric.Textbox(s,{fontFamily:'Arial Black',fontSize:60,fill:'#fff',textAlign:'center',originX:'center',left:W/2,width:W-160,paintFirst:'stroke',...o,top:Y(o.top||0)}),
 r:o=>new fabric.Rect({...o,top:Y(o.top||0)}),
 c:o=>new fabric.Circle({...o,top:Y(o.top||0)}),
 g:(a,b)=>grad(a,b,'v')};

/* ================= 25 layouts -> 50 templates ================= */
const IM='Impact,sans-serif',TR='Trebuchet MS',GE='Georgia',BRU='Brush Script MT,cursive';
const T=(s,top,fs,fill,font,o)=>mk.t(s,{top,fontSize:fs,fill,fontFamily:font||IM,...o});
const R=(l,top,w,h,fill,o)=>mk.r({left:l,top,width:w,height:h,fill,...o});
const O=(l,top,r,fill,o)=>mk.c({left:l,top,radius:r,fill,...o});
const LF={left:90,originX:'left',textAlign:'left',width:W-180};
const IT={fontStyle:'italic'};
const CATS=['All','Events','Sale','Business','Food','Social','Quote'];
const LCAT=['Events','Sale','Events','Events','Events','Business','Quote','Food','Events','Business','Business','Business','Events','Events','Sale','Events','Business','Business','Business','Events','Social','Social','Events','Events','Business'];
const LAY=[
/*0 concert*/p=>({bg:mk.g(p.bg,p.bg2),items:[O(W-300,-220,380,p.a,{opacity:.25}),O(-200,980,300,p.a2,{opacity:.3}),
 T('LIVE\nCONCERT',170,170,p.ink,IM,{lineHeight:.95}),T('Friday • 8 PM',590,62,p.a,GE,IT),R(W/2-240,720,480,104,p.a,{rx:52,ry:52}),T('FREE ENTRY',745,50,p.bg,null,{width:480}),
 T('Your venue address here\n+000 00 000 0000',1080,44,p.ink,TR,{lineHeight:1.5})]}),
/*1 sale*/p=>({bg:p.bg,items:[T('MEGA',110,150,p.ink,IM,{charSpacing:200}),R(-60,380,W+120,520,p.a,{angle:-6}),T('SALE',420,380,p.bg,IM),T('UP TO 50% OFF',980,90,p.ink,IM),T('This weekend only • Visit our store today',1130,42,p.ink,TR)]}),
/*2 invite*/p=>({bg:p.bg,items:[R(60,60,W-120,1230,NONE,{stroke:p.a,strokeWidth:6}),R(84,84,W-168,1182,NONE,{stroke:p.a,strokeWidth:2}),T('YOU ARE INVITED',250,40,p.a,TR,{charSpacing:500}),
 T('Birthday\nParty',360,210,p.ink,BRU,{lineHeight:.95,fontStyle:'italic'}),R(W/2-80,880,160,5,p.a),T('SATURDAY • 4 PM\nYour address goes here',940,44,p.ink,GE,{lineHeight:1.6})]}),
/*3 party*/p=>({bg:mk.g(p.bg2,p.bg),items:[...[0,1,2,3].map(i=>R(-100+i*300,-200,90,2000,p.a,{opacity:.18,angle:25})),
 T('PARTY\nNIGHT',230,290,p.ink,IM,{lineHeight:.9,shadow:new fabric.Shadow({color:p.a,blur:40})}),T('DJ • DRINKS • VIBES',880,64,p.a,IM,{charSpacing:150}),T('SAT 10 PM  |  Your Venue',1080,48,p.ink,TR)]}),
/*4 opening*/p=>({bg:mk.g(p.bg2,p.bg),items:[O(W/2-390,140,390,NONE,{stroke:p.a,strokeWidth:14}),O(W/2-330,200,330,p.a,{opacity:.15}),T('GRAND\nOPENING',330,150,p.ink,IM,{lineHeight:1}),T('★ ★ ★',660,70,p.a),
 R(120,960,W-240,110,p.a,{rx:12,ry:12}),T('COME CELEBRATE WITH US',990,44,p.bg,TR,{charSpacing:100}),T('Free gifts • Live music • Discounts\nYour address here',1130,40,p.ink,GE,{lineHeight:1.6})]}),
/*5 business*/p=>({bg:p.bg,items:[R(0,0,W,420,p.a),T('YOUR BUSINESS\nNAME HERE',110,110,p.bg,IM,{lineHeight:1}),
 ...[['Fast & Reliable','Tell people what makes you great.'],['Affordable Prices','Short, clear and to the point.'],['Quality Service','Add your best offer here.']].flatMap((x,i)=>[
  R(80,480+i*210,W-160,180,p.bg2,{rx:26,ry:26,opacity:.9}),T(x[0],505+i*210,50,p.ink,null,{...LF,left:130,width:W-260}),T(x[1],580+i*210,34,p.ink,TR,{...LF,left:130,width:W-260,opacity:.85})]),
 T('CALL / WHATSAPP: +000 00 000 0000',1170,42,p.a,TR)]}),
/*6 quote*/p=>({bg:mk.g(p.bg,p.bg2),items:[T('“',60,560,p.a,GE,{opacity:.5}),T('Your inspiring quote goes right here.',480,92,p.ink,GE,{...IT,lineHeight:1.2}),R(W/2-60,960,120,6,p.a),T('— AUTHOR NAME',1020,44,p.a,TR,{charSpacing:300})]}),
/*7 menu*/p=>({bg:p.bg,items:[T('MENU',110,220,p.a,IM,{charSpacing:200}),T('Fresh • Tasty • Affordable',380,40,p.ink,GE,IT),
 ...[['Jollof & Chicken','40.00'],['Fried Rice','35.00'],['Waakye Special','30.00'],['Fresh Juice','15.00']].flatMap((x,i)=>[
  T(x[0],520+i*150,52,p.ink,TR,{left:110,originX:'left',textAlign:'left',width:640}),T(x[1],520+i*150,52,p.a,TR,{left:W-110,originX:'right',textAlign:'right',width:300}),R(110,610+i*150,W-220,2,p.ink,{opacity:.3})]),
 T('Order: +000 00 000 0000',1190,44,p.ink,TR)]}),
/*8 worship*/p=>({bg:mk.g(p.bg,p.bg2),items:[O(W/2-300,150,300,p.a,{opacity:.18}),T('✦',110,150,p.a,GE),T('SUNDAY\nSERVICE',330,170,p.ink,IM,{lineHeight:.95}),R(W/2-90,790,180,6,p.a),
 T('8:00 AM  •  10:30 AM',850,56,p.a,TR),T('Come as you are. Everyone is welcome.\nYour church address here',1000,40,p.ink,GE,{...IT,lineHeight:1.5})]}),
/*9 hiring*/p=>({bg:p.bg,items:[R(0,0,W,40,p.a),T('WE ARE',150,70,p.a,TR,{charSpacing:400}),T('HIRING',230,300,p.ink,IM),R(100,620,W-200,310,p.bg2,{rx:30,ry:30,opacity:.9}),
 T('Position: Sales Executive\nExperience: 1+ year\nLocation: Your city',665,46,p.ink,TR,{...LF,left:150,width:W-300,lineHeight:1.6}),R(W/2-300,990,600,110,p.a,{rx:55,ry:55}),T('APPLY NOW',1018,52,p.bg,IM,{width:600}),T('Send CV to: you@email.com',1170,40,p.ink,TR)]}),
/*10 rent*/p=>({bg:p.bg,items:[R(70,70,W-140,620,p.bg2,{rx:30,ry:30}),T('ADD PHOTO HERE',350,50,p.ink,TR,{opacity:.5}),T('FOR RENT',750,170,p.a,IM),
 T('2 Bedroom Apartment • Fully Fenced\nGHS 0,000 / month',950,48,p.ink,TR,{lineHeight:1.5}),T('Call: +000 00 000 0000',1180,50,p.a,TR)]}),
/*11 gym*/p=>({bg:mk.g(p.bg,p.bg2),items:[T('NO PAIN',110,210,p.ink,IM),R(-60,420,W+120,230,p.a,{angle:-5}),T('NO GAIN',450,190,p.bg,IM),T('JOIN OUR GYM TODAY',760,66,p.ink,IM,{charSpacing:100}),
 T('Trainers • Cardio • Weights • Yoga',880,42,p.a,TR),R(W/2-260,1000,520,110,p.ink,{rx:55,ry:55}),T('FIRST WEEK FREE',1028,48,p.bg,IM,{width:520}),T('Your gym address here',1190,38,p.ink,TR)]}),
/*12 graduation*/p=>({bg:mk.g(p.bg,p.bg2),items:[T('★ ★ ★ ★ ★',130,60,p.a,GE),T('CONGRATULATIONS',260,110,p.ink,IM,{charSpacing:40}),T('Class\nof 2026',420,230,p.a,BRU,{lineHeight:.95,fontStyle:'italic'}),
 R(W/2-100,960,200,6,p.a),T('Graduate Name',1010,70,p.ink,GE),T('We are so proud of you!',1130,44,p.ink,TR,IT)]}),
/*13 workshop*/p=>({bg:p.bg,items:[O(W-350,-150,330,p.a,{opacity:.25}),T('MASTERCLASS',150,48,p.a,TR,{...LF,charSpacing:400}),T('Learn\nSkills\nThat Pay',230,190,p.ink,IM,{...LF,lineHeight:.95}),R(90,860,200,10,p.a),
 T('DATE: Saturday, 10 AM\nVENUE: Your venue\nENTRY: Free, limited seats',920,46,p.ink,TR,{...LF,lineHeight:1.6}),T('Register: +000 00 000 0000',1230,40,p.a,TR,LF)]}),
/*14 black friday*/p=>({bg:p.bg,items:[T('BLACK',90,290,p.ink,IM),T('FRIDAY',380,290,p.a,IM),R(100,720,W-200,8,p.a),T('EVERYTHING MUST GO',770,80,p.ink,IM,{charSpacing:80}),T('Up to 70% OFF',900,110,p.a,IM),T('Limited stock • Today only\nYour shop address',1080,44,p.ink,TR,{lineHeight:1.5})]}),
/*15 wedding*/p=>({bg:mk.g(p.bg,p.bg2),items:[R(60,60,W-120,1230,NONE,{stroke:p.a,strokeWidth:4}),R(84,84,W-168,1182,NONE,{stroke:p.a,strokeWidth:1.5}),T('WE ARE GETTING MARRIED',200,38,p.a,TR,{charSpacing:500}),
 T('Name\n&\nName',300,190,p.ink,BRU,{lineHeight:.9,fontStyle:'italic'}),T('SAVE THE DATE',930,50,p.a,TR,{charSpacing:400}),T('Saturday • 2:00 PM\nYour venue address here',1010,46,p.ink,GE,{lineHeight:1.6})]}),
/*16 salon*/p=>({bg:p.bg,items:[O(-150,-150,420,p.a,{opacity:.3}),O(W-250,900,350,p.a2,{opacity:.25}),T('Glam',140,300,p.ink,BRU,IT),T('BEAUTY SALON',470,70,p.a,TR,{charSpacing:300}),
 T('Hair • Nails • Makeup • Lashes',620,48,p.ink,GE,IT),R(W/2-300,760,600,6,p.a),T('BOOK NOW & GET 20% OFF',840,64,p.ink,IM),T('Call / WhatsApp: +000 00 000 0000\nYour salon address',1000,44,p.ink,TR,{lineHeight:1.6})]}),
/*17 product*/p=>({bg:mk.g(p.bg,p.bg2),items:[T('NEW ARRIVAL',80,48,p.a,TR,{charSpacing:400}),O(W/2-340,190,340,p.a,{opacity:.9}),T('ADD\nPRODUCT\nPHOTO',390,70,p.bg,IM,{opacity:.6}),
 T('Product Name',900,110,p.ink,IM),R(W/2-220,1060,440,130,p.a,{rx:65,ry:65}),T('GHS 00.00',1088,64,p.bg,IM,{width:440}),T('Order: +000 00 000 0000',1235,38,p.ink,TR)]}),
/*18 school*/p=>({bg:p.bg,items:[R(0,0,W,300,p.a),T('ADMISSION OPEN',90,100,p.bg,IM,{charSpacing:50}),T('Academic Year 2026/2027',210,44,p.bg,TR),T('Your School Name',380,90,p.ink,GE,IT),
 T('✓  Creche to JHS\n✓  Qualified & caring teachers\n✓  Safe, fun learning place\n✓  ICT & library',560,50,p.ink,TR,{left:130,originX:'left',textAlign:'left',width:W-260,lineHeight:1.7}),
 R(120,1080,W-240,110,p.a,{rx:55,ry:55}),T('ENROL YOUR CHILD TODAY',1108,46,p.bg,IM,{width:W-240}),T('Call: +000 00 000 0000',1230,40,p.ink,TR)]}),
/*19 match day*/p=>({bg:mk.g(p.bg,p.bg2),items:[T('MATCH DAY',100,200,p.ink,IM),R(-80,500,W+160,300,p.a,{angle:-4,opacity:.95}),T('TEAM A  VS  TEAM B',580,90,p.bg,IM),T('SUNDAY • 4:00 PM',900,70,p.a,IM),T('Your stadium / field name\nCome and support!',1030,46,p.ink,TR,{lineHeight:1.5})]}),
/*20 thank you*/p=>({bg:p.bg,items:[O(W/2-300,150,300,p.a,{opacity:.2}),T('THANK',200,200,p.ink,IM),T('you',420,330,p.a,BRU,IT),T('for your support & trust',820,56,p.ink,GE,IT),R(W/2-90,950,180,6,p.a),T('— Your Business Name',1010,48,p.ink,TR,{charSpacing:200}),T('@yourhandle',1120,44,p.a,TR)]}),
/*21 coming soon*/p=>({bg:p.bg,items:[O(W/2-400,180,400,NONE,{stroke:p.a,strokeWidth:6}),T('COMING',330,170,p.ink,IM,{charSpacing:100}),T('SOON',510,260,p.a,IM),T('Stay tuned for something amazing',900,48,p.ink,GE,IT),R(W/2-260,1020,520,90,p.a,{rx:45,ry:45}),T('FOLLOW @yourhandle',1043,40,p.bg,IM,{width:520})]}),
/*22 big birthday*/p=>({bg:mk.g(p.bg,p.bg2),items:[...[[80,120],[900,200],[150,700],[930,640],[300,1250],[820,1230]].map((q,i)=>O(q[0],q[1],20+i%3*10,i%2?p.a:p.a2,{opacity:.8})),
 T('HAPPY',100,120,p.ink,IM,{charSpacing:300}),T('30',200,700,p.a,IM),T('BIRTHDAY',900,150,p.ink,IM),T('to someone special 🎂',1070,56,p.ink,GE,IT)]}),
/*23 webinar*/p=>({bg:mk.g(p.bg,p.bg2),items:[O(W/2-200,150,200,p.a),T('🎙',215,220,p.bg,GE),T('LIVE WEBINAR',640,110,p.ink,IM),T('Topic goes here in one\nclear line',790,56,p.a,GE,{...IT,lineHeight:1.3}),
 R(W/2-250,1000,500,100,p.a,{rx:50,ry:50}),T('JOIN FREE',1022,52,p.bg,IM,{width:500}),T('Saturday • 7 PM • Link in bio',1160,40,p.ink,TR)]}),
/*24 price list*/p=>({bg:p.bg,items:[T('PRICE LIST',90,170,p.a,IM,{charSpacing:100}),T('Car Wash & Detailing',330,50,p.ink,GE,IT),
 ...[['Basic Wash','20'],['Full Wash','40'],['Interior Clean','60'],['Full Detail','120']].flatMap((x,i)=>[
  T(x[0],470+i*150,52,p.ink,TR,{left:110,originX:'left',textAlign:'left',width:640}),T('GHS '+x[1],470+i*150,52,p.a,TR,{left:W-110,originX:'right',textAlign:'right',width:300}),R(110,560+i*150,W-220,2,p.ink,{opacity:.3})]),
 T('Book: +000 00 000 0000',1190,44,p.ink,TR)]})
];
const TPL=[];for(let k=0;k<50;k++)TPL.push({l:k%25,p:k<25?k%12:(k+7)%12});
function build(li,pi){const d=LAY[li](PAL[pi]);return [new fabric.Rect({left:0,top:0,width:W,height:H,fill:d.bg,name:'bg',selectable:false,evented:false,hoverCursor:'default'}),...d.items]}
function applyT(li,pi){lock=true;cv.discardActiveObject();cv.clear();build(li,pi).forEach(o=>cv.add(o));lock=false;cv.renderAll();snap();ui()}
let tq=0;
function thumbs(){const box=$('#tpls');box.innerHTML='';const my=++tq;
 TPL.map((t,k)=>k).filter(k=>cat==='All'||LCAT[TPL[k].l]===cat).forEach((k,n)=>{const im=new Image();im.alt='';box.appendChild(im);const pi=pal<0?TPL[k].p:pal;
  im.onclick=()=>applyT(TPL[k].l,pi);
  setTimeout(()=>{if(my!==tq)return;try{const sc=new fabric.StaticCanvas(null,{width:W*.1,height:H*.1});sc.setZoom(.1);build(TPL[k].l,pi).forEach(o=>sc.add(o));sc.renderAll();im.src=sc.toDataURL();sc.dispose()}catch(e){}},n*30)})}
function shuffle(){const k=Math.random()*50|0;applyT(TPL[k].l,pal<0?(Math.random()*12|0):pal)}

/* ================= history ================= */
function snap(){if(lock||!cv)return;try{const j=JSON.stringify(cv.toJSON(['name','selectable','evented','hoverCursor']));if(hist[hi]===j)return;hist=hist.slice(0,hi+1);hist.push(j);if(hist.length>20)hist.shift();hi=hist.length-1;try{localStorage.blurr=JSON.stringify({H,j})}catch(e){}}catch(e){}}
function goto(i){if(i<0||i>=hist.length)return;hi=i;lock=true;cv.loadFromJSON(hist[i],()=>{lock=false;cv.renderAll();ui()})}

/* ================= canvas sizing ================= */
function fit(){if(!cv)return;const s=$('#stage');const k=Math.min((s.clientWidth-24)/W,(s.clientHeight-24)/H);if(!(k>0))return;zoom=k;cv.setZoom(k);cv.setDimensions({width:W*k,height:H*k});cv.renderAll()}
function setSize(h){const k=h/H;cv.discardActiveObject();cv.getObjects().forEach(o=>{if(o.name!=='bg'){o.top*=k;o.setCoords()}});const b=bgObj();if(b){b.set('height',h);if(b.fill&&b.fill.coords)['y1','y2'].forEach(p=>{if(b.fill.coords[p])b.fill.coords[p]*=k})}H=h;fit();thumbs();snap();ui()}

/* ================= images ================= */
function readImg(file,max=1600){return new Promise(res=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.9))};im.src=fr.result};fr.readAsDataURL(file)})}
function addImage(url,w){fabric.Image.fromURL(url,img=>{let k=(w||W*.7)/img.width;if(img.height*k>H*.8)k=H*.8/img.height;img.set({left:W/2,top:H/2,originX:'center',originY:'center',scaleX:k,scaleY:k});cv.add(img);cv.setActiveObject(img);cv.requestRenderAll()})}
async function magic(file){const url=await readImg(file,1800);fabric.Image.fromURL(url,img=>{lock=true;cv.discardActiveObject();cv.clear();const k=Math.max(W/img.width,H/img.height);img.set({left:W/2,top:H/2,originX:'center',originY:'center',scaleX:k,scaleY:k});
 const P=curP();
 const bg=new fabric.Rect({left:0,top:0,width:W,height:H,fill:'#000',name:'bg',selectable:false,evented:false});
 const shade=new fabric.Rect({left:0,top:0,width:W,height:H,fill:new fabric.Gradient({type:'linear',gradientUnits:'pixels',coords:{x1:0,y1:0,x2:0,y2:H},colorStops:[{offset:0,color:'rgba(0,0,0,0.05)'},{offset:.5,color:'rgba(0,0,0,0.1)'},{offset:1,color:'rgba(0,0,0,0.85)'}]})});
 [bg,img,shade,R(90,880,260,12,P.a),T('YOUR HEADLINE',920,130,'#fff',IM,LF),T('Tell people what, when and where',1120,46,'#fff',TR,LF),T('+000 00 000 0000',1220,42,P.a,TR,LF)].forEach(o=>cv.add(o));
 lock=false;cv.renderAll();snap();ui();tab('edit');toast('Tap the text to change it ✏️')})}

/* ================= add items ================= */
function addText(k){const P={h:['YOUR HEADING',120,'Impact,sans-serif'],s:['Your subtitle goes here',64,'Georgia'],b:['Write your details here',42,'Trebuchet MS']}[k];const t=new fabric.Textbox(P[0],{left:W/2,top:H/2-80,originX:'center',width:W-200,textAlign:'center',fontSize:P[1],fontFamily:P[2],fill:curP().ink,paintFirst:'stroke'});cv.add(t);cv.setActiveObject(t)}
function star(n,R_,r){const p=[];for(let i=0;i<n*2;i++){const a=Math.PI*i/n-Math.PI/2,d=i%2?r:R_;p.push({x:Math.cos(a)*d,y:Math.sin(a)*d})}return p}
const SH={rect:()=>new fabric.Rect({width:420,height:260,rx:24,ry:24}),circle:()=>new fabric.Circle({radius:180}),ring:()=>new fabric.Circle({radius:170,fill:NONE,strokeWidth:14}),tri:()=>new fabric.Triangle({width:340,height:300}),star:()=>new fabric.Polygon(star(5,200,90)),line:()=>new fabric.Rect({width:520,height:10})};
function addShape(k){const o=SH[k]();o.set({left:W/2,top:H/2,originX:'center',originY:'center'});if(k==='ring')o.set('stroke',curP().a);else o.set('fill',curP().a);cv.add(o);cv.setActiveObject(o)}

/* ================= actions on selected ================= */
function act(a){const o=cv.getActiveObject();if(!o)return;const L=o.type==='activeSelection'?o.getObjects():[o],b=bgObj();
 if(a.startsWith('al-'))L.forEach(x=>x.set('textAlign',a.slice(3)));
 else switch(a){
  case 'del':L.forEach(x=>cv.remove(x));cv.discardActiveObject();break;
  case 'dup':if(o.type!=='activeSelection')o.clone(c=>{c.set({left:o.left+40,top:o.top+40});cv.add(c);cv.setActiveObject(c)});return;
  case 'front':cv.bringToFront(o);break;
  case 'back':cv.sendToBack(o);b&&cv.sendToBack(b);break;
  case 'up':cv.bringForward(o);break;
  case 'down':cv.sendBackwards(o);b&&cv.sendToBack(b);break;
  case 'flip':L.forEach(x=>x.set('flipX',!x.flipX));break;
  case 'shadow':L.forEach(x=>x.set('shadow',x.shadow?null:new fabric.Shadow({color:'rgba(0,0,0,.55)',blur:25,offsetX:8,offsetY:8})));break;
  case 'glow':L.forEach(x=>x.set('shadow',x.shadow?null:new fabric.Shadow({color:hex(x.fill,hex(x.stroke,'#ffffff')),blur:45})));break;
  case 'bold':L.forEach(x=>x.set('fontWeight',x.fontWeight==='bold'?'normal':'bold'));break;
  case 'italic':L.forEach(x=>x.set('fontStyle',x.fontStyle==='italic'?'normal':'italic'));break;
  case 'upper':L.forEach(x=>x.text!=null&&x.set('text',x.text===x.text.toUpperCase()?x.text.toLowerCase():x.text.toUpperCase()));break;
  case 'round':o.clipPath=o.clipPath?null:new fabric.Circle({radius:Math.min(o.width,o.height)/2,originX:'center',originY:'center'});o.dirty=true;break;
  case 'fill':{const k=Math.max(W/o.width,H/o.height);o.set({scaleX:k,scaleY:k,left:W/2,top:H/2,originX:'center',originY:'center'});o.setCoords();cv.sendToBack(o);b&&cv.sendToBack(b);break}
  case 'reset':o.filters=[];o.applyFilters();setVig(o,0);break;
 }
 L.forEach(x=>{x.initDimensions&&/text/.test(x.type)&&x.initDimensions();x.setCoords()});cv.requestRenderAll();snap();ui()}
function bind(root){
 root.querySelectorAll('[data-p]').forEach(i=>{
  i.oninput=()=>{const o=cv.getActiveObject();if(!o)return;const L=o.type==='activeSelection'?o.getObjects():[o];const p=i.dataset.p;const v=i.dataset.n?parseFloat(i.value):i.value;
   L.forEach(x=>{x.set(p,v);if(p==='rx')x.set('ry',v);if(p==='strokeWidth'&&!x.stroke)x.set('stroke','#000000');x.initDimensions&&/text/.test(x.type)&&x.initDimensions();x.setCoords()});cv.requestRenderAll()};
  i.onchange=snap});
 root.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>act(b.dataset.act));
}
const S=(l,p,min,max,step,val)=>`<div class="sl">${l}<input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-p="${p}" data-n="1"></div>`;

/* ================= Edit pane ================= */
function editPane(){
 const o=cv.getActiveObject(),p=$('#p-edit');
 if(!o||o===bgObj()){
  p.innerHTML=`<b>Background</b><div class="row">Top <input type="color" id="bg1" value="${curP().bg}"> Bottom <input type="color" id="bg2" value="${curP().bg2}"><button class="ib" id="bgGo">Apply</button></div>
  <div class="row">${PAL.map((q,i)=>`<span class="sw" data-g="${i}" style="background:linear-gradient(${q.bg},${q.bg2})"></span>`).join('')}</div>
  <p class="mut">Tap anything on the flyer to edit it. Double-tap text to type on the flyer. For patterns or photo backgrounds use the Build tab.</p>${layerList()}`;
  const setBg=(a,b)=>{const g=bgObj();if(g){g.set('fill',a===b?a:mk.g(a,b));cv.requestRenderAll();snap()}};
  $('#bgGo').onclick=()=>setBg($('#bg1').value,$('#bg2').value);
  p.querySelectorAll('[data-g]').forEach(s=>s.onclick=()=>{const q=PAL[s.dataset.g];setBg(q.bg,q.bg2)});
  bindLayers(p);return}
 const T_=/text/.test(o.type),I=o.type==='image',M=o.type==='activeSelection';let h='';
 if(T_&&!M)h+=`<textarea id="txt" rows="2">${esc(o.text)}</textarea>`;
 if(T_)h+=`<div class="row"><select data-p="fontFamily">${FONTS.map(f=>`<option ${f===o.fontFamily?'selected':''}>${f}</option>`).join('')}</select><input type="color" data-p="fill" value="${hex(o.fill,'#ffffff')}"></div>`
  +S('Size','fontSize',20,400,1,o.fontSize||60)
  +`<div class="row"><button class="ib" data-act="bold"><b>B</b></button><button class="ib" data-act="italic"><i>I</i></button><button class="ib" data-act="upper">Aa</button><button class="ib" data-act="al-left">⇤</button><button class="ib" data-act="al-center">↔</button><button class="ib" data-act="al-right">⇥</button></div>`
  +`<div class="row">Outline colour <input type="color" data-p="stroke" value="${hex(o.stroke,'#000000')}"></div>`
  +S('Outline','strokeWidth',0,24,1,o.strokeWidth||0)+S('Spacing','charSpacing',0,1000,10,o.charSpacing||0);
 else if(!I&&!M)h+=`<div class="row">Fill <input type="color" data-p="fill" value="${hex(o.fill,'#ffffff')}"> Border <input type="color" data-p="stroke" value="${hex(o.stroke,'#000000')}"></div>`+S('Border','strokeWidth',0,40,1,o.strokeWidth||0)+(o.type==='rect'?S('Corners','rx',0,200,1,o.rx||0):'');
 else if(I)h+=`<p class="mut">📷 Photo selected. Open the <b>Effects</b> tab for looks and filters.</p>`;
 h+=S('Opacity','opacity',0,1,.05,o.opacity==null?1:o.opacity)+S('Rotate','angle',-180,180,1,Math.round(o.angle||0));
 h+=`<div class="row">${[['dup','⧉','Duplicate'],['del','🗑','Delete'],['front','⤒','To front'],['up','↑','Forward'],['down','↓','Backward'],['back','⤓','To back'],['flip','⇋','Flip'],['shadow','☁︎','Shadow'],['glow','✦','Glow']].map(x=>`<button class="ib" title="${x[2]}" data-act="${x[0]}">${x[1]}</button>`).join('')}</div>`;
 h+=layerList();p.innerHTML=h;bind(p);bindLayers(p);
 const tx=$('#txt');if(tx){tx.oninput=()=>{o.set('text',tx.value);cv.requestRenderAll()};tx.onchange=snap}}
function layerList(){const L=cv.getObjects().filter(o=>o.name!=='bg');if(!L.length)return'';return`<b>Layers</b><div class="row">${L.slice().reverse().map(o=>`<button class="ib ${cv.getActiveObject()===o?'on':''}" data-l="${cv.getObjects().indexOf(o)}">${o.name==='vig'?'◐':/text/.test(o.type)?'T '+esc((o.text||'').slice(0,8)):o.type==='image'?'🖼':o.type==='rect'?'▭':o.type==='circle'?'●':'◆'}</button>`).join('')}</div>`}
function bindLayers(p){p.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const o=cv.getObjects()[b.dataset.l];if(o){cv.setActiveObject(o);cv.requestRenderAll()}})}

/* ================= Effects: filters, looks, random ================= */
const PRE=[['B&W','BlackWhite'],['Gray','Grayscale'],['Sepia','Sepia'],['Invert','Invert'],['Vintage','Vintage'],['Kodak','Kodachrome'],['Techni','Technicolor'],['Polaroid','Polaroid'],['Brownie','Brownie'],['Sharpen','Convolute']];
const SLD=[['Brightness','Brightness','brightness',-.5,.5,.01,0],['Contrast','Contrast','contrast',-.5,.5,.01,0],['Saturation','Saturation','saturation',-1,1,.01,0],['Hue','HueRotation','rotation',-1,1,.01,0],['Blur','Blur','blur',0,.5,.01,0],['Noise','Noise','noise',0,300,5,0],['Pixelate','Pixelate','blocksize',0,40,1,0]];
const BLEND=['source-over','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'];
const LOOKS=[
 {n:'Cinematic',sl:{Contrast:.18,Saturation:-.12,Brightness:-.05,HueRotation:-.04},vig:.5},
 {n:'Warm glow',sl:{Brightness:.06,Saturation:.2,HueRotation:.03,Contrast:.06},vig:.2},
 {n:'Moody',sl:{Brightness:-.1,Contrast:.22,Saturation:-.25},vig:.6},
 {n:'Pop',sl:{Contrast:.12,Saturation:.45,Brightness:.03}},
 {n:'Faded',sl:{Brightness:.08,Contrast:-.15,Saturation:-.2}},
 {n:'Noir',pre:['BlackWhite'],sl:{Contrast:.25},vig:.5},
 {n:'Retro',pre:['Vintage'],sl:{Noise:40},vig:.35},
 {n:'Dreamy',sl:{Brightness:.1,Contrast:-.08,Blur:.03,Saturation:.15}},
 {n:'Cool',sl:{HueRotation:-.08,Saturation:.1,Contrast:.1},vig:.15},
 {n:'Classic sepia',pre:['Sepia'],sl:{Contrast:.1},vig:.3},
 {n:'Kodak',pre:['Kodachrome'],sl:{}}];
const AUTO={n:'Auto',sl:{Contrast:.08,Saturation:.15,Brightness:.03}};
const mkF=t=>t==='Convolute'?new fabric.Image.filters.Convolute({matrix:[0,-1,0,-1,5,-1,0,-1,0]}):new fabric.Image.filters[t]();
function buildFilters(r){const a=[];(r.pre?[...r.pre]:[]).forEach(t=>a.push(mkF(t)));
 SLD.forEach(s=>{const v=r.sl&&r.sl[s[1]];if(v==null)return;const on=s[1]==='Pixelate'?v>=2:v!==s[6];if(on)a.push(new fabric.Image.filters[s[1]]({[s[2]]:v}))});return a}
function randLook(){const b=rnd(LOOKS),j=v=>v*(.85+Math.random()*.3),sl={};Object.keys(b.sl||{}).forEach(k=>sl[k]=+j(b.sl[k]).toFixed(3));return{n:b.n,pre:b.pre||[],sl,vig:Math.min(.8,(b.vig||0)*(.8+Math.random()*.4))}}
function setF(img,type,f){img.filters=(img.filters||[]).filter(x=>x.type!==type);if(f)img.filters.push(f);img.applyFilters();cv.requestRenderAll()}
function setVig(img,s){if(img.vigObj){cv.remove(img.vigObj);img.vigObj=null}if(!s)return;const r=img.getBoundingRect(true,true);
 const v=new fabric.Rect({left:r.left,top:r.top,width:r.width,height:r.height,selectable:true,evented:false,name:'vig',fill:new fabric.Gradient({type:'radial',gradientUnits:'pixels',coords:{x1:r.width/2,y1:r.height/2,r1:Math.min(r.width,r.height)*.3,x2:r.width/2,y2:r.height/2,r2:Math.max(r.width,r.height)*.75},colorStops:[{offset:0,color:'rgba(0,0,0,0)'},{offset:1,color:`rgba(0,0,0,${s})`}]})});
 cv.add(v);cv.moveTo(v,cv.getObjects().indexOf(img)+1);img.vigObj=v}
function fxTargets(){const o=cv.getActiveObject();const L=(fxAll||!(o&&o.type==='image'))?imgs():[o];if(!L.length)toast('Add a photo first 📷');return L}
function applyLook(list,look){list.forEach(img=>{img.filters=buildFilters(look);img.applyFilters();setVig(img,look.vig||0)});cv.requestRenderAll();snap();ui()}
function copyAll(src){imgs().forEach(x=>{if(x===src)return;x.filters=(src.filters||[]).map(f=>new fabric.Image.filters[f.type](f.toObject()));x.applyFilters()});cv.requestRenderAll();snap();toast('Copied to all photos ✓')}
function fxPane(){
 const o=cv.getActiveObject(),p=$('#p-effects');
 let h=`<b>Looks</b> <span class="mut">one tap, pro colour grading</span><div class="row">${LOOKS.map((l,i)=>`<button class="ib sm" data-look="${i}">${l.n}</button>`).join('')}</div>
 <div class="row"><button class="btn" id="rnd">🎲 Surprise me</button><button class="ib" id="auto">✨ Auto enhance</button><label class="mut"><input type="checkbox" id="fxall" ${fxAll?'checked':''}> all photos</label></div>`;
 if(o&&o!==bgObj()){
  if(o.type==='image'){const fl=o.filters||[];
   h+=`<b>Filters</b><div class="row">${PRE.map(x=>`<button class="ib sm ${fl.some(f=>f.type===x[1])?'on':''}" data-pre="${x[1]}">${x[0]}</button>`).join('')}</div>`;
   h+=SLD.map(s=>{const f=fl.find(x=>x.type===s[1]);const v=f?f[s[2]]:s[6];return`<div class="sl">${s[0]}<input type="range" min="${s[3]}" max="${s[4]}" step="${s[5]}" value="${v}" data-fx="${s[1]}|${s[2]}|${s[6]}"></div>`}).join('');
   h+=`<div class="row"><button class="ib" data-act="round">⚪ Circle crop</button><button class="ib" data-act="fill">⛶ Fill page</button><button class="ib" data-act="reset">↺ Reset</button><button class="ib" id="cpall">⧉ Copy to all photos</button></div>`}
  h+=`<b>Blend mode</b><div class="row"><select data-p="globalCompositeOperation">${BLEND.map(b=>`<option ${o.globalCompositeOperation===b?'selected':''}>${b}</option>`).join('')}</select><button class="ib" data-act="shadow">☁︎ Shadow</button><button class="ib" data-act="glow">✦ Glow</button></div>`}
 else h+='<p class="mut">Tap a photo for fine-tuning: filters, brightness, contrast, hue, blur, noise, pixelate and blend modes.</p>';
 p.innerHTML=h;bind(p);
 p.querySelectorAll('[data-look]').forEach(b=>b.onclick=()=>{const L=fxTargets();if(L.length)applyLook(L,LOOKS[b.dataset.look])});
 $('#rnd').onclick=()=>{const L=fxTargets();if(L.length){const l=randLook();applyLook(L,l);toast('Look: '+l.n+' 🎲 tap again for another')}};
 $('#auto').onclick=()=>{const L=fxTargets();if(L.length)applyLook(L,AUTO)};
 $('#fxall').onchange=e=>fxAll=e.target.checked;
 const cp=$('#cpall');if(cp)cp.onclick=()=>copyAll(o);
 p.querySelectorAll('[data-pre]').forEach(b=>b.onclick=()=>{const t=b.dataset.pre,has=(o.filters||[]).some(f=>f.type===t);setF(o,t,has?null:mkF(t));snap();fxPane()});
 p.querySelectorAll('[data-fx]').forEach(i=>{const[t,pr,n]=i.dataset.fx.split('|');let busy=false;
  i.oninput=()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;const v=parseFloat(i.value);const on=t==='Pixelate'?v>=2:v!==parseFloat(n);setF(o,t,on?new fabric.Image.filters[t]({[pr]:v}):null)})};
  i.onchange=()=>{i.oninput();snap()}})}
function ui(){editPane();fxPane();$$('#sizes button').forEach(b=>b.classList.toggle('on',+b.dataset.h===H));$('#undo').style.opacity=hi>0?1:.4;$('#redo').style.opacity=hi<hist.length-1?1:.4}

/* ================= tabs ================= */
function tab(n){curTab=n;$$('.pane').forEach(p=>p.classList.toggle('on',p.id==='p-'+n));$$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===n));if(n!=='qr')stopScan()}
function sel(){const o=cv.getActiveObject();if(['templates','add','build'].includes(curTab)&&o&&o!==bgObj())tab('edit');ui()}

/* ================= Build your own design ================= */
const BGSETS=[['#0f2027','#2c5364'],['#ff512f','#dd2476'],['#1d2b64','#f8cdda'],['#134e5e','#71b280'],['#fdc830','#f37335'],['#232526','#414345'],['#654ea3','#eaafc8'],['#00b4db','#0083b0'],['#f7971e','#ffd200'],['#8e2de2','#4a00e0']];
async function patFill(kind,c1,c2){const s=80,c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');x.fillStyle=c1;x.fillRect(0,0,s,s);x.fillStyle=c2;x.strokeStyle=c2;
 if(kind==='dots'){x.beginPath();x.arc(20,20,8,0,7);x.fill();x.beginPath();x.arc(60,60,8,0,7);x.fill()}
 else if(kind==='stripes')x.fillRect(0,0,s/2,s);
 else if(kind==='grid'){x.fillRect(0,0,s,3);x.fillRect(0,0,3,s)}
 else if(kind==='diag'){x.lineWidth=12;x.beginPath();x.moveTo(0,s);x.lineTo(s,0);x.moveTo(-s/2,s/2);x.lineTo(s/2,-s/2);x.moveTo(s/2,s*1.5);x.lineTo(s*1.5,s/2);x.stroke()}
 else if(kind==='check'){x.fillRect(0,0,s/2,s/2);x.fillRect(s/2,s/2,s/2,s/2)}
 else{x.lineWidth=7;x.beginPath();for(let i=0;i<=s;i++){const yy=s/2+Math.sin(i/s*Math.PI*2)*14;i?x.lineTo(i,yy):x.moveTo(i,yy)}x.stroke()}
 const im=new Image();await new Promise(r=>{im.onload=r;im.src=c.toDataURL()});return new fabric.Pattern({source:im,repeat:'repeat'})}
let kPhoto=null;
async function buildCustom(fresh){
 const ty=$('#kTy').value,c1=$('#kC1').value,c2=$('#kC2').value;
 lock=true;
 if(fresh){H=+$('#kSz').value;cv.discardActiveObject();cv.clear();fit();cv.add(new fabric.Rect({left:0,top:0,width:W,height:H,fill:'#ffffff',name:'bg',selectable:false,evented:false}))}
 const b=bgObj();
 if(b){b.set('fill',ty==='gradient'?grad(c1,c2,$('#kDir').value):ty==='pattern'?await patFill($('#kPatSel').value,c1,c2):c1)}
 if(ty==='photo'){if(kPhoto){const img=await loadImg(kPhoto),k=Math.max(W/img.width,H/img.height);img.set({left:W/2,top:H/2,originX:'center',originY:'center',scaleX:k,scaleY:k});
   const dim=new fabric.Rect({left:0,top:0,width:W,height:H,fill:'#000',opacity:+$('#kDimR').value});cv.add(img);cv.add(dim);cv.sendToBack(dim);cv.sendToBack(img);b&&cv.sendToBack(b)}else toast('Choose a background photo first')}
 if(fresh&&$('#kTt').checked){const dark=hex(c1,'#000000');const lum=parseInt(dark.slice(1,3),16)*.3+parseInt(dark.slice(3,5),16)*.6+parseInt(dark.slice(5,7),16)*.1;
  cv.add(T($('#kTx').value||'YOUR TITLE',Math.round(H*.4/ (H/1350)),130,(ty==='photo'||lum<140)?'#ffffff':'#111111',IM))}
 lock=false;cv.renderAll();snap();ui();toast(fresh?'Design created. Tap anything to edit ✏️':'Background applied ✓')}
function kShow(){const t=$('#kTy').value;$('#kGrad').style.display=t==='gradient'?'':'none';$('#kPat').style.display=t==='pattern'?'':'none';$('#kPho').style.display=t==='photo'?'':'none';$('#kDim').style.display=t==='photo'?'':'none'}
function kRandom(){const s=rnd(BGSETS);$('#kC1').value=s[0];$('#kC2').value=s[1];$('#kTy').value=rnd(['gradient','gradient','pattern']);$('#kDir').value=rnd(['v','h','d','r']);$('#kPatSel').value=rnd(['dots','stripes','grid','diag','check','waves']);
 if($('#kTy').value==='pattern'){const m=hex(s[0],'#000000');$('#kC2').value='#'+[1,3,5].map(i=>Math.min(255,parseInt(m.slice(i,i+2),16)+28).toString(16).padStart(2,'0')).join('')}kShow()}

/* ================= BATCH ================= */
const REC={pre:new Set(),sl:{},vig:0,border:0,bc:'#ffffff',round:0,wm:'',max:1600,fmt:'jpeg'};
let bFiles=[],bUrls=[],lastRes=null;
const recNow=()=>({pre:[...REC.pre],sl:{...REC.sl},vig:REC.vig,border:REC.border,bc:REC.bc,round:REC.round,wm:REC.wm,fmt:REC.fmt});
function debounce(f,t){let h;return(...a)=>{clearTimeout(h);h=setTimeout(()=>f(...a),t)}}
function renderB(){$$('#bPre button').forEach(b=>b.classList.toggle('on',REC.pre.has(b.dataset.bp)));
 $$('[data-bs]').forEach(i=>{const s=SLD.find(x=>x[1]===i.dataset.bs);i.value=REC.sl[s[1]]!=null?REC.sl[s[1]]:s[6]});
 $$('[data-bk]').forEach(i=>i.value=REC[i.dataset.bk]);
 $('#bCount').textContent=bFiles.length+(bFiles.length===1?' photo':' photos');
 $('#bStrip').innerHTML=bUrls.map(u=>`<img src="${u}" alt="">`).join('')}
function setRec(l){REC.pre=new Set(l.pre||[]);REC.sl={...(l.sl||{})};REC.vig=l.vig||0;lastRes=null;renderB();prevD()}
async function processOne(file,rec,max){
 const img=await loadImg(await readImg(file,max));img.filters=buildFilters(rec);img.applyFilters();
 const w=img.width,h=img.height,png=rec.fmt==='png'||rec.round>0;
 const sc=new fabric.StaticCanvas(null,{width:w,height:h});if(!png)sc.backgroundColor='#ffffff';sc.add(img);
 if(rec.vig>0)sc.add(new fabric.Rect({left:0,top:0,width:w,height:h,fill:new fabric.Gradient({type:'radial',gradientUnits:'pixels',coords:{x1:w/2,y1:h/2,r1:Math.min(w,h)*.3,x2:w/2,y2:h/2,r2:Math.max(w,h)*.75},colorStops:[{offset:0,color:'rgba(0,0,0,0)'},{offset:1,color:`rgba(0,0,0,${rec.vig})`}]})}));
 if(rec.border>0){const bw=Math.round(Math.max(w,h)*rec.border/1000);sc.add(new fabric.Rect({left:bw/2,top:bw/2,width:w-bw,height:h-bw,fill:NONE,stroke:rec.bc,strokeWidth:bw}))}
 if(rec.wm)sc.add(new fabric.Text(rec.wm,{fontSize:Math.max(18,Math.round(Math.max(w,h)/40)),fill:'#fff',opacity:.85,fontFamily:'Trebuchet MS',left:w-14,top:h-14,originX:'right',originY:'bottom',shadow:new fabric.Shadow({color:'rgba(0,0,0,.6)',blur:6})}));
 if(rec.round>0){const r=Math.min(w,h)*rec.round/100;sc.clipPath=new fabric.Rect({left:0,top:0,width:w,height:h,rx:r,ry:r})}
 sc.renderAll();const out=sc.toDataURL({format:png?'png':'jpeg',quality:.92});sc.dispose();return{url:out,png}}
async function preview(){if(!bFiles.length)return;try{const r=await processOne(bFiles[0],recNow(),700);const im=$('#bPrev');im.src=r.url;im.style.display='block'}catch(e){}}
const prevD=debounce(preview,450);
async function runBatch(){if(!bFiles.length){toast('Choose photos first 📸');return null}
 const out=[],rec=recNow(),max=REC.max;
 try{for(let i=0;i<bFiles.length;i++){$('#bProg').textContent=`Processing ${i+1} of ${bFiles.length}…`;await new Promise(r=>setTimeout(r,25));
   const r=await processOne(bFiles[i],rec,max);const blob=await blobOf(r.url);out.push({blob,name:`blurr-${i+1}.${r.png?'png':'jpg'}`})}
  $('#bProg').textContent=`Done ✓ ${out.length} photos ready`;lastRes=out;return out}
 catch(e){$('#bProg').textContent='Something went wrong. Try fewer photos or Small size.';return null}}
async function batchZip(){const r=await runBatch();if(!r)return;
 if(window.JSZip){const z=new JSZip();r.forEach(x=>z.file(x.name,x.blob));saveBlob(await z.generateAsync({type:'blob'}),'blurr-photos.zip')}else r.forEach(x=>saveBlob(x.blob,x.name));toast('Saved ✓')}
async function batchShare(){if(!lastRes){const r=await runBatch();if(r)toast('Ready ✓ Tap Share again to save to Photos',4500);return}
 try{const files=lastRes.map(x=>new File([x.blob],x.name,{type:x.blob.type}));if(navigator.canShare&&navigator.canShare({files}))await navigator.share({files});else{lastRes.forEach(x=>saveBlob(x.blob,x.name))}}catch(e){}}
async function collage(){if(!bFiles.length){toast('Choose photos first 📸');return}
 const files=bFiles.slice(0,12),n=files.length,P=curP(),rec=recNow();
 lock=true;cv.discardActiveObject();cv.clear();
 cv.add(new fabric.Rect({left:0,top:0,width:W,height:H,fill:mk.g(P.bg,P.bg2),name:'bg',selectable:false,evented:false}));
 cv.add(T('MY GALLERY',70,120,P.ink,IM));cv.add(T('Tap the text to change it',210,40,P.a,TR));
 const cols=n<=1?1:n<=4?2:n<=9?3:4,rows=Math.ceil(n/cols),gap=16,top0=Y(290),bot=H-70,aw=W-120,ah=bot-top0,cw=(aw-gap*(cols-1))/cols,ch=(ah-gap*(rows-1))/rows;
 for(let i=0;i<n;i++){const img=await loadImg(await readImg(files[i],1000));const c=i%cols,r=Math.floor(i/cols),x=60+c*(cw+gap),y=top0+r*(ch+gap);
  const k=Math.max(cw/img.width,ch/img.height);img.set({left:x+cw/2,top:y+ch/2,originX:'center',originY:'center',scaleX:k,scaleY:k,clipPath:new fabric.Rect({left:x,top:y,width:cw,height:ch,rx:14,ry:14,absolutePositioned:true})});
  img.filters=buildFilters(rec);img.applyFilters();cv.add(img)}
 lock=false;cv.renderAll();snap();ui();tab('edit');toast('Collage ready. Drag a photo to re-crop it ✂️',3500)}
function addFiles(list){bFiles=[...bFiles,...list].slice(0,60);bUrls.forEach(u=>URL.revokeObjectURL(u));bUrls=bFiles.map(f=>URL.createObjectURL(f));lastRes=null;renderB();prevD()}
function buildBatchUI(){
 $('#bLooks').innerHTML=LOOKS.map((l,i)=>`<button class="ib sm" data-bl="${i}">${l.n}</button>`).join('');
 $('#bPre').innerHTML=PRE.map(x=>`<button class="ib sm" data-bp="${x[1]}">${x[0]}</button>`).join('');
 $('#bSl').innerHTML=SLD.map(s=>`<div class="sl">${s[0]}<input type="range" min="${s[3]}" max="${s[4]}" step="${s[5]}" value="${s[6]}" data-bs="${s[1]}"></div>`).join('');
 $('#bLooks').onclick=e=>{const i=e.target.dataset.bl;if(i!=null)setRec(LOOKS[i])};
 $('#bPre').onclick=e=>{const t=e.target.dataset.bp;if(t){REC.pre.has(t)?REC.pre.delete(t):REC.pre.add(t);lastRes=null;renderB();prevD()}};
 const onIn=e=>{const t=e.target;if(t.dataset.bs){REC.sl[t.dataset.bs]=parseFloat(t.value)}else if(t.dataset.bk){REC[t.dataset.bk]=parseFloat(t.value)}else if(t.id==='bwm')REC.wm=t.value;else if(t.id==='bbc')REC.bc=t.value;else if(t.id==='bmax')REC.max=+t.value;else if(t.id==='bfmt')REC.fmt=t.value;else return;lastRes=null;prevD()};
 $('#p-batch').addEventListener('input',onIn);$('#p-batch').addEventListener('change',onIn);
 $('#bPick').onclick=()=>$('#fBatch').click();
 $('#fBatch').onchange=e=>{addFiles([...e.target.files]);e.target.value=''};
 $('#bClear').onclick=()=>{bFiles=[];bUrls.forEach(u=>URL.revokeObjectURL(u));bUrls=[];lastRes=null;$('#bPrev').style.display='none';$('#bProg').textContent='';renderB()};
 $('#bRnd').onclick=()=>{const l=randLook();setRec(l);toast('Look: '+l.n+' 🎲 tap again for another')};
 $('#bAuto').onclick=()=>setRec(AUTO);
 $('#bReset').onclick=()=>{setRec({});REC.border=0;REC.round=0;REC.wm='';$('#bwm').value='';renderB()};
 $('#bPv').onclick=preview;$('#bGo').onclick=batchZip;$('#bShare').onclick=batchShare;$('#bCol').onclick=collage;renderB()}

/* ================= QR create ================= */
const QT={text:['Text or link','',''],wifi:['Network name','Password','WPA'],phone:['Phone number','',''],email:['Email address','Subject',''],wa:['WhatsApp number with country code','Message',''],sms:['Phone number','Message','']};
function qrFields(){const L=QT[$('#qt').value];['qa','qb','qc'].forEach((id,i)=>{const e=$('#'+id);e.style.display=L[i]?'':'none';e.placeholder=L[i]})}
function qrStr(){const t=$('#qt').value,a=$('#qa').value.trim(),b=$('#qb').value.trim(),c=$('#qc').value.trim()||'WPA';
 return a?{text:a,wifi:`WIFI:T:${c};S:${a};P:${b};;`,phone:'tel:'+a,email:`mailto:${a}?subject=${encodeURIComponent(b)}`,wa:`https://wa.me/${a.replace(/\D/g,'')}?text=${encodeURIComponent(b)}`,sms:`SMSTO:${a}:${b}`}[t]:'https://'}
function drawQR(c,str,fg,bg,dots){const q=qrcode(0,'Q');q.addData(str);q.make();const n=q.getModuleCount(),m=4,px=800,cell=px/(n+m*2);c.width=c.height=px;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,px,px);x.fillStyle=fg;
 for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k)){const X=(k+m)*cell,Y2=(r+m)*cell;if(dots){x.beginPath();x.arc(X+cell/2,Y2+cell/2,cell*.47,0,7);x.fill()}else x.fillRect(X-.3,Y2-.3,cell+.6,cell+.6)}}
function renderQR(){try{drawQR($('#qp'),qrStr(),$('#qf').value,$('#qg').value,$('#qd').checked)}catch(e){toast('Text too long for a QR code')}}

/* ================= QR scan ================= */
let stream=null,scanning=false;const sc=document.createElement('canvas'),sctx=sc.getContext('2d',{willReadFrequently:true});
async function startScan(){try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});const v=$('#vid');v.srcObject=stream;await v.play();scanning=true;tickScan()}catch(e){toast('Camera blocked or needs https. Use "From photo" instead.',4000)}}
function stopScan(){scanning=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function tickScan(){if(!scanning)return;const v=$('#vid');if(v.readyState===v.HAVE_ENOUGH_DATA){const k=Math.min(1,720/v.videoWidth);sc.width=v.videoWidth*k;sc.height=v.videoHeight*k;sctx.drawImage(v,0,0,sc.width,sc.height);const d=sctx.getImageData(0,0,sc.width,sc.height);const r=jsQR(d.data,d.width,d.height);if(r&&r.data){stopScan();found(r.data);return}}requestAnimationFrame(tickScan)}
async function scanFile(file){const url=await readImg(file,1400);const im=new Image();im.onload=()=>{sc.width=im.width;sc.height=im.height;sctx.drawImage(im,0,0);const d=sctx.getImageData(0,0,sc.width,sc.height);const r=jsQR(d.data,d.width,d.height,{inversionAttempts:'attemptBoth'});r&&r.data?found(r.data):toast('No QR code found. Try a clearer, closer photo.')};im.src=url}
function found(t){const u=/^https?:\/\//i.test(t);$('#sRes').innerHTML=`<div class="res">${esc(t)}</div><div class="row"><button class="ib" id="rc">Copy</button>${u?`<a class="ib" href="${esc(t)}" target="_blank" rel="noopener">Open</a>`:''}<button class="ib" id="rm">Make my own</button></div>`;
 $('#rc').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(t);toast('Copied ✓')};
 $('#rm').onclick=()=>{qrSub('gen');$('#qt').value='text';qrFields();$('#qa').value=t;renderQR()};if(navigator.vibrate)navigator.vibrate(60)}
function qrSub(n){$('#qgen').style.display=n==='gen'?'':'none';$('#qscan').style.display=n==='scan'?'':'none';$$('[data-qs]').forEach(b=>b.classList.toggle('on',b.dataset.qs===n));if(n!=='scan')stopScan()}

/* ================= export ================= */
async function blobOf(url){return (await fetch(url)).blob()}
async function makeFile(fmt){cv.discardActiveObject();cv.renderAll();const s=+$('#exs').value;const url=cv.toDataURL({format:fmt==='png'?'png':'jpeg',quality:.92,multiplier:s/zoom});
 if(fmt==='pdf'){const{jsPDF}=window.jspdf;const d=new jsPDF({orientation:W>H?'l':'p',unit:'px',format:[W,H],hotfixes:['px_scaling']});d.addImage(url,'JPEG',0,0,W,H);return d.output('blob')}
 return blobOf(url)}
function saveBlob(b,name){const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},5000)}
async function doExport(fmt){try{toast('Preparing…');const b=await makeFile(fmt);saveBlob(b,'blurr-flyer.'+fmt);toast('Saved ✓')}catch(e){toast('Export failed. Try Normal quality.')}}
async function doShare(){try{const b=await makeFile('png');const f=new File([b],'blurr-flyer.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f]});else{saveBlob(b,'blurr-flyer.png')}}catch(e){}}

/* ================= tutorial ================= */
const STEPS=[
 {t:'Welcome to Blurr 👋',x:'Design flyers, edit photos in bulk and make QR codes. This quick tour shows what every button does. Replay it anytime with the ? button.'},
 {sel:'#sizes',tab:'templates',t:'Canvas size',x:'Choose Flyer, Square (Instagram post), Story (WhatsApp status), A4 (printing) or Banner.'},
 {sel:'#cats',tab:'templates',t:'50 templates',x:'Filter by category, then tap any design below to load it. Tap a colour circle to recolour all of them, or "Auto" to go back to the original colours.'},
 {sel:'#shuf',tab:'templates',t:'Shuffle & Magic',x:'🎲 Shuffle picks a random design for you. ✨ Magic turns one photo into a ready flyer.'},
 {sel:'#tab-build',tab:'build',t:'Build your own',x:'Start from nothing: pick a size and a solid, gradient, pattern or photo background, then Create. Not sure? Tap 🎲 Random background.'},
 {sel:'#tab-add',tab:'add',t:'Add',x:'Add your own photos, headings, shapes and emoji stickers. Each one lands in the middle of your flyer.'},
 {sel:'#tab-edit',tab:'edit',t:'Edit',x:'Tap anything on the flyer, then change its text, font, colour, size, rotation, shadow, glow or layer order. Drag to move, pull the corner dots to resize.'},
 {sel:'#tab-effects',tab:'effects',t:'Effects',x:'One-tap Looks like Cinematic and Noir, 🎲 Surprise me for a random pro look, and ✨ Auto enhance. Tick "all photos" to treat every photo on the flyer the same.'},
 {sel:'#tab-batch',tab:'batch',t:'Batch: many photos at once',x:'Choose lots of photos, pick one look, and Blurr applies it to all of them. Save as a ZIP, share to Photos, or turn them into a collage flyer.'},
 {sel:'#tab-qr',tab:'qr',t:'QR codes',x:'Create QR codes for links, WiFi, WhatsApp and more, then add them to your flyer. Or scan any QR with your camera or a photo.'},
 {sel:'#tab-export',tab:'export',t:'Export',x:'Save as PNG, JPG or PDF, or share straight to WhatsApp and Instagram.'},
 {sel:'#undo',tab:'templates',t:'Undo / Redo',x:'Made a mistake? Step back or forward here.'},
 {sel:'#btnInstall',t:'Install',x:'Add Blurr to your home screen or desktop so it opens like a real app, even offline.'},
 {sel:'#btnHelp',t:'Replay anytime',x:'Tap ? whenever you want to watch this tour again. Enjoy! 🎉'}];
let ti=0;
function tour(i=0){ti=i;$('#tour').classList.add('show');step()}
function step(){const s=STEPS[ti];if(s.tab)tab(s.tab);$('#tt').textContent=s.t;$('#tx').textContent=s.x;$('#tn').textContent=ti===STEPS.length-1?'Done ✓':'Next →';$('#tb').style.visibility=ti?'visible':'hidden';$('#tc').textContent=(ti+1)+'/'+STEPS.length;
 const el0=s.sel&&$(s.sel);if(el0&&el0.scrollIntoView)el0.scrollIntoView({block:'nearest',inline:'center'});
 setTimeout(()=>{const el=s.sel&&$(s.sel),sp=$('#spot'),cd=$('#card');cd.style.top=cd.style.bottom='';
  if(!el){Object.assign(sp.style,{left:'50%',top:'50%',width:'0px',height:'0px'});cd.style.top='50%';cd.style.transform='translate(-50%,-50%)';return}
  const r=el.getBoundingClientRect();Object.assign(sp.style,{left:r.left-6+'px',top:r.top-6+'px',width:r.width+12+'px',height:r.height+12+'px'});cd.style.transform='translateX(-50%)';
  if(r.top>innerHeight/2)cd.style.bottom=(innerHeight-r.top+18)+'px';else cd.style.top=(r.bottom+18)+'px'},220)}
function endTour(){$('#tour').classList.remove('show');localStorage.blurr_tour2=1;tab('templates')}

/* ================= UI wiring ================= */
function buildUI(){
 $('#sizes').innerHTML=SIZES.map(([n,h])=>`<button class="ib sm" data-h="${h}">${n}</button>`).join('');
 $('#sizes').onclick=e=>{const h=e.target.dataset.h;if(h)setSize(+h)};
 $('#kSz').innerHTML=SIZES.map(([n,h])=>`<option value="${h}">${n}</option>`).join('');
 $('#cats').innerHTML=CATS.map(c=>`<button class="ib sm ${c===cat?'on':''}" data-c="${c}">${c}</button>`).join('');
 $('#cats').onclick=e=>{const c=e.target.dataset.c;if(c){cat=c;$$('#cats button').forEach(b=>b.classList.toggle('on',b.dataset.c===c));thumbs()}};
 const drawPals=()=>{$('#pals').innerHTML=`<span class="sw ${pal<0?'on':''}" data-pi="-1" title="Original colours" style="background:conic-gradient(#ff5e62,#ffd166,#41b3a3,#7c3aed,#ff5e62)"></span>`+PAL.map((q,i)=>`<span class="sw ${i===pal?'on':''}" data-pi="${i}" style="background:linear-gradient(135deg,${q.bg2},${q.a})"></span>`).join('')};drawPals();
 $('#pals').onclick=e=>{const i=e.target.dataset.pi;if(i!=null){pal=+i;drawPals();thumbs()}};
 $('#shuf').onclick=shuffle;
 $('#emo').innerHTML='🔥⭐🎉🎶🎁💥❤️✨🍔🍕☕🏆📍📞💼🛍️🌴🙏✅🚀🎓⚽🎤🎧👑💎🌟🆓🆕💯'.match(/\p{Extended_Pictographic}\uFE0F?/gu).map(e=>`<button class="ib" data-e="${e}">${e}</button>`).join('');
 $('#emo').onclick=e=>{const k=e.target.dataset.e;if(k){const t=new fabric.Text(k,{fontSize:180,left:W/2,top:H/2,originX:'center',originY:'center'});cv.add(t);cv.setActiveObject(t)}};
 $$('[data-tx]').forEach(b=>b.onclick=()=>addText(b.dataset.tx));
 $$('[data-s]').forEach(b=>b.onclick=()=>addShape(b.dataset.s));
 $$('#tabs button').forEach(b=>b.onclick=()=>tab(b.dataset.t));
 $('#addImg').onclick=()=>$('#fImg').click();
 $('#fImg').onchange=async e=>{for(const f of e.target.files)addImage(await readImg(f));e.target.value=''};
 $('#magic').onclick=()=>$('#fMagic').click();
 $('#fMagic').onchange=e=>{if(e.target.files[0])magic(e.target.files[0]);e.target.value=''};
 /* build tab */
 $('#kTy').onchange=kShow;kShow();
 $('#kPick').onclick=()=>$('#fBg').click();
 $('#fBg').onchange=async e=>{const f=e.target.files[0];if(f){kPhoto=await readImg(f,1800);$('#kPn').textContent='✓ '+f.name.slice(0,18)}e.target.value=''};
 $('#kNew').onclick=()=>buildCustom(true);$('#kCur').onclick=()=>buildCustom(false);$('#kRand').onclick=()=>{kRandom();buildCustom(false)};
 buildBatchUI();
 $('#undo').onclick=()=>goto(hi-1);$('#redo').onclick=()=>goto(hi+1);
 $('#btnHelp').onclick=()=>tour(0);
 $('#tn').onclick=()=>{ti<STEPS.length-1?(ti++,step()):endTour()};$('#tb').onclick=()=>{if(ti>0){ti--;step()}};$('#ts').onclick=endTour;
 $('#btnInstall').onclick=async()=>{if(deferred){deferred.prompt();deferred=null}else if(/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))toast('On iPhone/iPad: tap the Share button in Safari, then "Add to Home Screen".',6000);else toast('Laptop: click the install icon in the address bar. Android: browser menu → Install app.',6000)};
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e});
 $('#qt').onchange=()=>{qrFields();renderQR()};$('#qgen').oninput=renderQR;qrFields();renderQR();
 $$('[data-qs]').forEach(b=>b.onclick=()=>qrSub(b.dataset.qs));
 $('#qadd').onclick=()=>{addImage($('#qp').toDataURL(),420);toast('QR added. Drag it where you want.')};
 $('#qdl').onclick=async()=>saveBlob(await blobOf($('#qp').toDataURL()),'blurr-qr.png');
 $('#sGo').onclick=startScan;$('#sFile').onclick=()=>$('#fScan').click();
 $('#fScan').onchange=e=>{if(e.target.files[0])scanFile(e.target.files[0]);e.target.value=''};
 $$('[data-ex]').forEach(b=>b.onclick=()=>doExport(b.dataset.ex));
 $('#share').onclick=doShare;
 $('#newBtn').onclick=()=>{if(confirm('Start a blank design? You can undo this.')){lock=true;cv.discardActiveObject();cv.clear();cv.add(new fabric.Rect({left:0,top:0,width:W,height:H,fill:'#ffffff',name:'bg',selectable:false,evented:false}));lock=false;cv.renderAll();snap();ui();tab('add')}};
 document.addEventListener('keydown',e=>{if((e.key==='Delete'||e.key==='Backspace')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){const o=cv.getActiveObject();if(o&&!o.isEditing)act('del')}});
}
function init(){
 Object.assign(fabric.Object.prototype,{transparentCorners:false,cornerColor:'#ffffff',cornerStrokeColor:'#7c3aed',borderColor:'#7c3aed',cornerSize:20,touchCornerSize:44,cornerStyle:'circle',padding:4});
 cv=new fabric.Canvas('c',{preserveObjectStacking:true,allowTouchScrolling:false});
 buildUI();new ResizeObserver(fit).observe($('#stage'));
 cv.on({'object:added':()=>!lock&&snap(),'object:removed':()=>!lock&&snap(),'object:modified':()=>{snap();ui()},'editing:exited':snap,'selection:created':sel,'selection:updated':sel,'selection:cleared':sel});
 let s;try{s=JSON.parse(localStorage.blurr)}catch(e){}
 if(s&&s.j){H=s.H;fit();lock=true;cv.loadFromJSON(s.j,()=>{lock=false;cv.renderAll();hist=[s.j];hi=0;ui();thumbs()})}
 else{fit();applyT(0,0);thumbs()}
}
window.addEventListener('load',()=>setTimeout(()=>{
 if(!window.fabric){$('#splash p').textContent='Please connect to the internet once, then reopen Blurr.';return}
 init();const sp=$('#splash');sp.style.opacity=0;setTimeout(()=>{sp.remove();fit();if(!localStorage.blurr_tour2)tour(0)},600)},2300));
