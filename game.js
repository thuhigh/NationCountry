'use strict';
const $=q=>document.querySelector(q),KEY='wc_save_v1',GW=1000,GH=640,CC=6,RR=4;
const NM=['Aldoria','Brennmark','Calvera','Dorsal','Eskarra','Fjordheim','Galdor','Harth','Ilvaren','Jorun','Kestrel','Lumen','Marrow','Nordheim','Ostara','Pellun','Quarra','Ravenmoor','Selvane','Tarn','Ulvar','Vesper','Wyndal','Xanthe'];
const TR=[['Đồng bằng',1,'🌾'],['Rừng',1.2,'🌲'],['Núi',1.5,'⛰️'],['Sa mạc',.9,'🏜️']];
const NAT=[{n:'Vương quốc Aster',c:'#4f8cff',d:'Dễ',f:1.5},{n:'Cộng hòa Borea',c:'#e5534b',d:'Bình thường',f:1},{n:'Đế chế Cyrus',c:'#4cb782',d:'Khó',f:.7},{n:'Liên bang Dorian',c:'#e8b04a',d:'Bình thường',f:1},{n:'Khối Elara',c:'#a371f7',d:'Dễ',f:1.5},{n:'Hạt Fenris',c:'#2cc4c4',d:'Khó',f:.7}];
const U={inf:{n:'Bộ binh',i:'🪖',c:100,t:5,a:10,d:10,s:1,u:2,r:0},scout:{n:'Trinh sát',i:'🔭',c:80,t:4,a:3,d:3,s:3,u:1,r:0},def:{n:'Phòng thủ',i:'🏰',c:200,t:8,a:0,d:50,s:0,u:3,r:0},tank:{n:'Cơ giới',i:'🚜',c:350,t:12,a:35,d:25,s:1.6,u:6,r:1},art:{n:'Pháo binh',i:'💥',c:300,t:10,a:45,d:8,s:.8,u:5,r:1},air:{n:'Không quân',i:'✈️',c:700,t:20,a:60,d:15,s:3,u:12,r:2},nav:{n:'Hải quân',i:'🚢',c:500,t:18,a:40,d:30,s:1.5,u:8,r:2}};
const TECH={eco:['Kinh tế','+15% thu nhập mỗi cấp'],ter:['Quản lý lãnh thổ','Dân tăng nhanh, nâng cấp vùng rẻ hơn 10%/cấp'],mil:['Công nghệ quân sự','+15% tấn công; cấp 1 mở Cơ giới & Pháo binh, cấp 2 mở Không quân & Hải quân'],log:['Hậu cần','Quân nhanh hơn, tiếp tế tốt hơn, bảo trì −10%/cấp'],def:['Phòng thủ','+15% sức phòng thủ mỗi cấp'],dip:['Ngoại giao','+10 thiện cảm khi đàm phán mỗi cấp']};
const rng=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
const G=(()=>{const r=rng(11),v=[],c=[];
for(let j=0;j<=RR;j++){v[j]=[];for(let i=0;i<=CC;i++)v[j][i]=[i*GW/CC+(i%CC?(r()-.5)*60:0),j*GH/RR+(j%RR?(r()-.5)*50:0)]}
for(let j=0;j<RR;j++)for(let i=0;i<CC;i++){const p=[v[j][i],v[j][i+1],v[j+1][i+1],v[j+1][i]],k=j*CC+i,nb=[];
if(i>0)nb.push(k-1);if(i<CC-1)nb.push(k+1);if(j>0)nb.push(k-CC);if(j<RR-1)nb.push(k+CC);
const pop=Math.round(5+r()*35),t=Math.floor(r()*4);
c.push({n:NM[k],p,x:p.reduce((s,q)=>s+q[0],0)/4,y:p.reduce((s,q)=>s+q[1],0)/4,nb,pop,inc:Math.round(100+pop*4+r()*60),t,tm:TR[t][1]})}
return{cells:c}})();
let S=null,vb={x:-50,y:0,w:1100};
const f=n=>Math.round(n).toLocaleString('vi-VN'),me=()=>S.nat[S.me],tech=(n,b)=>S.nat[n].tech[b];
const owned=n=>S.terr.reduce((a,t,k)=>(t.o==n&&a.push(k),a),[]);
const isAl=(a,b)=>S.nat[a].allies.includes(b),atWar=(a,b)=>S.nat[a].war.includes(b),tk=(a,b)=>a<b?a+'_'+b:b+'_'+a;
const atkP=(tr,n)=>Object.keys(tr).reduce((s,u)=>s+tr[u]*U[u].a,0)*(1+.15*tech(n,'mil'));
const defP=(tr,n)=>Object.keys(tr).reduce((s,u)=>s+tr[u]*U[u].d,0)*(1+.15*tech(n,'def'));
const tot=n=>owned(n).reduce((s,k)=>s+atkP(S.terr[k].tr,n)+defP(S.terr[k].tr,n),0);
const ti=k=>{const T=S.terr[k],C=G.cells[k];return C.inc*(1+.5*(T.dev-1))*(T.pop/C.pop)*(1+.15*tech(T.o,'eco'))};
const inc=n=>owned(n).reduce((s,k)=>s+ti(k),0),pop=n=>owned(n).reduce((s,k)=>s+S.terr[k].pop,0);
const cnt=tr=>Object.keys(tr).reduce((s,u)=>s+tr[u],0);
const upk=n=>{let s=0;owned(n).forEach(k=>{const t=S.terr[k].tr;for(const u in t)s+=t[u]*U[u].u});S.mv.forEach(m=>{if(m.n==n)for(const u in m.u)s+=m.u[u]*U[u].u});return s*(1-.1*tech(n,'log'))};
const net=n=>inc(n)*(1-S.nat[n].rb)-upk(n);
const devCost=(n,k)=>Math.round(300*S.terr[k].dev*(1-.1*tech(n,'ter')));
const mobile=tr=>{const m={};for(const u in tr)if(U[u].s>0&&tr[u]>0)m[u]=tr[u];return m};
const mix=(a,b,t)=>{const p=x=>[1,3,5].map(i=>parseInt(x.substr(i,2),16));const A=p(a),B=p(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')'};
const troopsStr=tr=>Object.keys(tr).filter(u=>tr[u]>0).map(u=>U[u].i+tr[u]).join(' ')||'Không có quân';
function toast(m,bad){const e=document.createElement('div');e.textContent=m;if(bad)e.className='bad';$('#toast').appendChild(e);setTimeout(()=>e.remove(),3200)}
function ask(t,fn){const m=$('#modal');m.innerHTML=`<div class=card><p>${t}</p><div class=row><button id=ok>Đồng ý</button><button onclick="A.close()">Hủy</button></div></div>`;m.classList.remove('hidden');$('#ok').onclick=()=>{A.close();fn()}}
function newGame(o){const bat=o.mode=='bat';S={t:0,me:o.me,ai:o.ai,mode:o.mode,speed:1,paused:false,sel:null,pick:null,panel:null,
nat:NAT.map((x,i)=>({name:x.n,c:x.c,money:o.mode=='sbx'?o.money:Math.round((bat?800:1500)*x.f),rp:0,rb:.1,tech:{eco:0,ter:0,mil:0,log:0,def:0,dip:0},allies:[],pact:[],war:bat?[0,1,2,3,4,5].filter(j=>j!=i):[],rel:Array(6).fill(0),next:3+i,alive:true,po:0})),
terr:G.cells.map((c,k)=>({o:(k%6>>1)+3*((k/6|0)>>1),pop:c.pop,dev:1,tr:{inf:bat?30:8},cap:0,occ:null})),q:[],mv:[],truce:{},st:{cap:0,lost:0,kills:0},end:null};A.close();A.panel('map');R()}
/* ---------- combat & war ---------- */
function fight(at,an,dt,dn,k,flat){const tm=flat?1:G.cells[k].tm*(1+.1*S.terr[k].dev),a=atkP(at,an)*(.85+.03*tech(an,'log')),d=defP(dt,dn)*tm,aw=a>d,r=a&&d?(aw?d/a:a/d):0,fr=Math.sqrt(Math.max(0,1-r*r)),win=aw?at:dt,lose=aw?dt:at,s={};
for(const u in win){const n=Math.round(win[u]*fr);if(n>0)s[u]=n}
if(an==S.me&&aw||dn==S.me&&!aw)S.st.kills+=cnt(lose);return{w:aw,s}}
function send(n,k,j,fr){const T=S.terr[k],mob=mobile(T.tr),u={};let sp=9;
for(const x in mob){const q=Math.floor(mob[x]*fr);if(q>0){u[x]=q;sp=Math.min(sp,U[x].s)}}
if(!cnt(u)){if(n==S.me)toast('Không có quân có thể điều động',1);return false}
for(const x in u)T.tr[x]-=u[x];const A_=G.cells[k],B=G.cells[j],sec=Math.hypot(A_.x-B.x,A_.y-B.y)/(8*sp*(1+.1*tech(n,'log')));
S.mv.push({f:k,t:j,n,u,left:sec,tot:sec});return true}
function arrive(m){const T=S.terr[m.t],K=m.t;let u=m.u;
if(T.occ&&T.occ.n!=m.n){const r=fight(u,m.n,T.occ.u,T.occ.n,K,1);if(r.w){T.occ=null;T.cap=0;u=r.s}else{T.occ.u=r.s;return}}
if(T.occ&&T.occ.n==m.n){for(const x in u)T.occ.u[x]=(T.occ.u[x]||0)+u[x];return}
if(T.o==m.n||isAl(m.n,T.o)){for(const x in u)T.tr[x]=(T.tr[x]||0)+u[x];return}
if(!atWar(m.n,T.o)){const b=S.terr[m.f].o==m.n?m.f:owned(m.n)[0];if(b!=null){const B=S.terr[b];for(const x in u)B.tr[x]=(B.tr[x]||0)+u[x]}return}
const old=T.o,r=fight(u,m.n,T.tr,old,K);
if(r.w){T.tr={};T.occ={n:m.n,u:r.s};T.cap=0;if(m.n==S.me||old==S.me)toast((m.n==S.me?'Chiến thắng tại ':'Thất bại tại ')+G.cells[K].n+(m.n==S.me?' – đang chiếm đóng':' – đối phương đang chiếm đóng'),old==S.me)}
else{T.tr=r.s;if(m.n==S.me||old==S.me)toast((m.n==S.me?'Tấn công thất bại tại ':'Đã đẩy lùi quân địch tại ')+G.cells[K].n,m.n==S.me)}}
function declareWar(a,b){if(a==b||atWar(a,b))return false;if(S.truce[tk(a,b)]>S.t){if(a==S.me)toast('Đang trong thời gian đình chiến',1);return false}
const A_=S.nat[a],B=S.nat[b];[A_.allies,A_.pact].forEach(l=>{const i=l.indexOf(b);if(i>=0)l.splice(i,1)});[B.allies,B.pact].forEach(l=>{const i=l.indexOf(a);if(i>=0)l.splice(i,1)});
A_.war.push(b);B.war.push(a);B.rel[a]-=50;A_.rel[b]-=50;
if(a==S.me||b==S.me)toast(A_.name+' tuyên chiến với '+B.name,b==S.me);
S.nat.forEach((O,o)=>{if(!O.alive||o==S.me||o==a||o==b)return;if(isAl(o,b))declareWar(o,a);else if(isAl(o,a)&&!isAl(o,b))declareWar(o,b)});return true}
function makePeace(a,b){[[a,b],[b,a]].forEach(([x,y])=>{const w=S.nat[x].war,i=w.indexOf(y);if(i>=0)w.splice(i,1)});S.truce[tk(a,b)]=S.t+120;S.nat[a].rel[b]+=20;S.nat[b].rel[a]+=20;
S.terr.forEach(T=>{if(T.occ&&(T.occ.n==a&&T.o==b||T.occ.n==b&&T.o==a)){const h=owned(T.occ.n)[0];if(h!=null)for(const x in T.occ.u)S.terr[h].tr[x]=(S.terr[h].tr[x]||0)+T.occ.u[x];T.occ=null;T.cap=0}});
if(a==S.me||b==S.me)toast('Đã ký đình chiến (120 giây)')}
function buy(n,k,u,q){const N=S.nat[n],X=U[u],cost=X.c*q;if(tech(n,'mil')<X.r){if(n==S.me)toast('Cần nghiên cứu Công nghệ quân sự cấp '+X.r,1);return false}
if(N.money<cost){if(n==S.me)toast('Không đủ tiền: cần '+f(cost)+', đang có '+f(N.money),1);return false}
N.money-=cost;S.q.push({n,k,u,q,left:X.t*(1+.2*(q-1))});if(n==S.me)toast('Đang huấn luyện ×'+q+' '+X.n);return true}
function buyTech(n,b){const l=tech(n,b),c=30*(l+1),N=S.nat[n];if(l>=3){if(n==S.me)toast('Đã đạt cấp tối đa',1);return false}
if(b!='eco'&&tech(n,'eco')<l){if(n==S.me)toast('Cần Kinh tế cấp '+l,1);return false}
if(N.rp<c){if(n==S.me)toast('Thiếu điểm nghiên cứu (cần '+c+')',1);return false}N.rp-=c;N.tech[b]++;if(n==S.me)toast('Đã nghiên cứu '+TECH[b][0]+' cấp '+(l+1));return true}
/* ---------- AI ---------- */
function ai(n){const N=S.nat[n],df=S.ai,ks=owned(n);if(!ks.length)return;
['eco','mil','def','log','ter','dip'].some(b=>buyTech(n,b));
const k0=ks.find(k=>S.terr[k].dev<3&&N.money>devCost(n,k)+500);if(k0!=null){N.money-=devCost(n,k0);S.terr[k0].dev++}
const bd=ks.filter(k=>G.cells[k].nb.some(j=>S.terr[j].o!=n)),pool=(bd.length?bd:ks).sort((a,b)=>defP(S.terr[a].tr,n)-defP(S.terr[b].tr,n)),ph=S.t/5|0;
const u=tech(n,'mil')>=1&&ph%3==0?'tank':ph%4==1?'def':'inf',bud=N.money-250-upk(n)/2,q=Math.min(5,Math.floor(bud/U[u].c));if(q>0)buy(n,pool[0],u,q);
if(!N.war.length&&S.t>150){const nb=new Set();ks.forEach(k=>G.cells[k].nb.forEach(j=>{if(S.terr[j].o!=n)nb.add(S.terr[j].o)}));
for(const o of nb){if(isAl(n,o)||N.pact.includes(o)||S.truce[tk(n,o)]>S.t)continue;if(tot(n)>tot(o)*[1.9,1.4,1.1][df]){declareWar(n,o);break}}}
ks.forEach(k=>{const mob=mobile(S.terr[k].tr);if(!cnt(mob))return;let best=null,bs=1e9;G.cells[k].nb.forEach(j=>{const J=S.terr[j];if(J.o!=n&&N.war.includes(J.o)){const d=defP(J.tr,J.o)*G.cells[j].tm*(1+.1*J.dev);if(d<bs){bs=d;best=j}}});
if(best!=null&&atkP(mob,n)*.85>bs*[1.7,1.3,1.1][df])send(n,k,best,1)});
N.war.slice().forEach(e=>{if(tot(n)<.6*tot(e)){if(e==S.me){if(S.t>N.po&&$('#modal').classList.contains('hidden')){N.po=S.t+90;ask(N.name+' đề nghị đình chiến. Chấp nhận?',()=>makePeace(n,e))}}else makePeace(n,e)}});
S.nat.forEach((O,o)=>{if(o!=n&&o!=S.me&&O.alive&&!isAl(n,o)&&!N.war.includes(o)&&N.war.some(w=>O.war.includes(w))){N.allies.push(o);O.allies.push(n)}})}
/* ---------- main loop ---------- */
function tick(dt){if(!S||S.end||S.paused)return;dt*=S.speed;const t0=S.t;S.t+=dt;
S.nat.forEach((N,n)=>{if(!N.alive)return;const I=inc(n),m=n==S.me?1:[.85,1,1.25][S.ai];N.money=Math.max(-5000,N.money+(I*(1-N.rb)*m-upk(n))/60*dt);N.rp+=(N.rb*I/10+pop(n)*.05)/60*dt;
if(N.money<0&&(S.t/5|0)!=(t0/5|0)){owned(n).forEach(k=>{const t=S.terr[k].tr;for(const u in t)t[u]=Math.floor(t[u]*.92)});if(n==S.me)toast('Hết ngân sách! Quân đang đào ngũ',1)}});
S.terr.forEach((T,k)=>{const b=G.cells[k].pop;T.pop=Math.min(b*3,T.pop+b*.003*(1+.3*tech(T.o,'ter'))/60*dt)});
S.q.forEach(e=>e.left-=dt);S.q.filter(e=>e.left<=0).forEach(e=>{const K=S.terr[e.k].o==e.n?e.k:owned(e.n)[0];if(K!=null){const t=S.terr[K].tr;t[e.u]=(t[e.u]||0)+e.q;if(e.n==S.me)toast('Hoàn tất huấn luyện: '+U[e.u].i+' ×'+e.q)}});S.q=S.q.filter(e=>e.left>0);
S.mv.forEach(m=>m.left-=dt);const arr=S.mv.filter(m=>m.left<=0);S.mv=S.mv.filter(m=>m.left>0);arr.forEach(arrive);
S.terr.forEach((T,k)=>{if(!T.occ)return;T.cap+=dt/(10*G.cells[k].tm);if(T.cap>=1){const old=T.o,nw=T.occ.n;T.o=nw;T.tr=T.occ.u;T.occ=null;T.cap=0;
if(nw==S.me)S.st.cap++;if(old==S.me){S.st.lost++;toast('Mất '+G.cells[k].n,1)}else if(nw==S.me)toast('Đã chiếm '+G.cells[k].n);
if(!owned(old).length){S.nat[old].alive=false;S.nat[old].war=[];S.nat.forEach(o=>{o.war=o.war.filter(w=>w!=old)});toast(S.nat[old].name+' đã sụp đổ',old==S.me)}}});
S.nat.forEach((N,n)=>{if(n!=S.me&&N.alive&&S.t>=N.next){N.next=S.t+5+n;ai(n)}});
const sh=owned(S.me).length/G.cells.length;if(!owned(S.me).length)finish(false);else if(sh>=.6||S.nat.every((N,n)=>n==S.me||!N.alive))finish(true)}
function finish(w){S.end={w};localStorage.removeItem(KEY);const m=$('#modal');m.innerHTML=`<div class=card><h2>${w?'🏆 Chiến thắng!':'💀 Thất bại'}</h2><p>Thời gian: ${Math.round(S.t/60)} phút<br>Vùng đã chiếm: ${S.st.cap} · đã mất: ${S.st.lost}<br>Quân địch tiêu diệt: ${f(S.st.kills)}<br>Vùng đang giữ: ${owned(S.me).length}/${G.cells.length}</p><button onclick="start()">Chơi lại</button></div>`;m.classList.remove('hidden')}
/* ---------- UI ---------- */
function top(){const N=me(),n=net(S.me);$('#top').innerHTML=`<b>${N.name}</b><span>💰${f(N.money)}</span><span class="${n>=0?'g':'r'}">${n>=0?'+':''}${f(n)}/ph</span><span>👥${pop(S.me).toFixed(0)}tr</span><span>🔬${f(N.rp)}</span><button onclick="A.pause()">${S.paused?'▶':'⏸'}</button><button onclick="A.spd()">x${S.speed}</button><button onclick="A.menu()">⚙</button>`}
function draw(){document.querySelectorAll('.t').forEach(p=>{const k=+p.dataset.k,T=S.terr[k],c=S.nat[T.o].c,s=p.style;s.fill=c;s.stroke=T.occ?mix(c,S.nat[T.occ.n].c,T.cap):'#08121a';s.strokeWidth=T.occ?5:2;if(k==S.sel||S.pick&&S.pick.k==k){s.stroke='#fff';s.strokeWidth=5}});
$('#lb').innerHTML=G.cells.map((c,k)=>`<text x=${c.x} y=${c.y-4}>${TR[c.t][2]}${c.n}</text><text class=s x=${c.x} y=${c.y+14}>⚔ ${cnt(S.terr[k].tr)}${S.terr[k].occ?' / '+cnt(S.terr[k].occ.u):''}</text>`).join('');
$('#mv').innerHTML=S.mv.map(m=>{const a=G.cells[m.f],b=G.cells[m.t],p=1-m.left/m.tot;return`<circle cx=${a.x+(b.x-a.x)*p} cy=${a.y+(b.y-a.y)*p} r=11 fill=${S.nat[m.n].c} stroke=#fff stroke-width=2 /><text x=${a.x+(b.x-a.x)*p} y=${a.y+(b.y-a.y)*p+4}>${cnt(m.u)}</text>`}).join('')}
function info(){const el=$('#info');if(S.sel==null){el.classList.add('hidden');return}const k=S.sel,T=S.terr[k],C=G.cells[k],N=S.nat[T.o],mt=T.o==S.me;
let b='';if(mt)b=`<button onclick="A.go(1)">Điều 100%</button><button onclick="A.go(.5)">Điều 50%</button>${T.dev<3?`<button onclick="A.dev()">Nâng cấp ${f(devCost(S.me,k))}💰</button>`:''}<button onclick="A.panel('shop')">Mua quân</button>`;
else if(atWar(S.me,T.o))b='<small>Đang chiến tranh – chọn vùng của bạn giáp ranh rồi bấm Điều quân</small>';else b=`<button onclick="A.war(${T.o})">Tuyên chiến</button>`;
if(S.mode=='sbx'&&!mt)b+=`<button onclick="A.take()">Chiếm ngay</button>`;
el.innerHTML=`<button class=x onclick="A.tap(null)">✕</button><b style="color:${N.c}">${C.n}</b> <small>${N.name}</small><p>${TR[C.t][2]} ${TR[C.t][0]} · 👥${T.pop.toFixed(1)}tr · 💰${f(ti(k))}/ph · Phát triển ${T.dev}/3</p><p>🛡 Phòng thủ ${f(defP(T.tr,T.o)*C.tm*(1+.1*T.dev))} · ${troopsStr(T.tr)}</p>${T.occ?`<p>⚠️ ${S.nat[T.occ.n].name} đang chiếm: ${Math.round(T.cap*100)}%</p>`:''}${S.pick?'<p><b>Chạm vùng đích trên bản đồ…</b></p>':''}<div class=row>${b}</div>`;el.classList.remove('hidden')}
const tgt=()=>S.sel!=null&&S.terr[S.sel].o==S.me?S.sel:owned(S.me)[0];
const PN={
shop(){const k=tgt();let h=`<p>Triển khai tại: <b>${G.cells[k].n}</b> · 💰${f(me().money)} <small>(chọn vùng khác trên bản đồ để đổi)</small></p>`;
for(const u in U){const X=U[u],lk=tech(S.me,'mil')<X.r;h+=`<div class="it${lk?' lk':''}"><div>${X.i} <b>${X.n}</b><small>Giá ${X.c} · huấn luyện ${X.t}s · ⚔${X.a} 🛡${X.d} · tốc độ ${X.s} · bảo trì ${X.u}/ph</small></div>${lk?`<span>🔒 Quân sự ${X.r}</span>`:`<span><button onclick="A.buy('${u}',1)">×1</button> <button onclick="A.buy('${u}',5)">×5</button></span>`}</div>`}
const q=S.q.filter(e=>e.n==S.me);return h+'<p><b>Hàng đợi</b></p>'+(q.map(e=>`<div class=it>${U[e.u].i} ×${e.q} → ${G.cells[e.k].n}<span>${Math.ceil(e.left)}s</span></div>`).join('')||'<small>Trống</small>')},
army(){const ks=owned(S.me),mv=S.mv.filter(m=>m.n==S.me);return`<p>Tổng quân: <b>${ks.reduce((s,k)=>s+cnt(S.terr[k].tr),0)}</b> · đang hành quân: ${mv.length} đạo · bảo trì ${f(upk(S.me))}/ph</p>`+ks.map(k=>`<div class=it><div><b>${G.cells[k].n}</b><small>${troopsStr(S.terr[k].tr)}</small></div><button onclick="A.pickK(${k})">Chọn</button></div>`).join('')},
eco(){const N=me(),I=inc(S.me);return`<div class=it><span>Tiền</span><b>${f(N.money)}</b></div><div class=it><span>Thu nhập</span><b>${f(I)}/ph</b></div><div class=it><span>Bảo trì quân</span><b>−${f(upk(S.me))}/ph</b></div><div class=it><span>Ngân sách nghiên cứu</span><b>−${f(I*N.rb)}/ph</b></div><div class=it><span>Lợi nhuận ròng</span><b>${f(net(S.me))}/ph</b></div><div class=it><span>Dân số</span><b>${pop(S.me).toFixed(1)} tr</b></div><div class=it><span>Tăng trưởng kinh tế</span><b>+${tech(S.me,'eco')*15}% thu nhập</b></div><div class=it><span>Điểm nghiên cứu</span><b>${f(N.rp)}</b></div><label>Ngân sách nghiên cứu: ${Math.round(N.rb*100)}% thu nhập</label><input type=range min=0 max=30 value=${N.rb*100} onchange="A.rb(this.value)">`+(S.mode=='sbx'?'<div class=row><button onclick="A.cash()">+10.000 💰 (Sandbox)</button></div>':'')},
dip(){return S.nat.map((N,o)=>{if(o==S.me||!N.alive)return'';const w=atWar(S.me,o),al=isAl(S.me,o),pc=me().pact.includes(o),st=w?'⚔️ Chiến tranh':al?'🤝 Đồng minh':pc?'📜 Không gây chiến':'Hòa bình';
const b=w?`<button onclick="A.peace(${o})">Đề nghị hòa</button>`:`${al?`<button onclick="A.break(${o})">Hủy liên minh</button>`:`<button onclick="A.ally(${o})">Liên minh</button>`}${pc||al?'':`<button onclick="A.pact(${o})">Hiệp ước</button>`}<button onclick="A.aid(${o})">Viện trợ 500</button><button onclick="A.war(${o})">Tuyên chiến</button>`;
return`<div class=it style="display:block"><b style="color:${N.c}">${N.name}</b> <small>${owned(o).length} vùng · sức mạnh ${f(tot(o))} · thiện cảm ${Math.round(N.rel[S.me])} · ${st}</small><div class=row>${b}</div></div>`}).join('')},
res(){return`<p>🔬 Điểm nghiên cứu: <b>${f(me().rp)}</b></p>`+Object.keys(TECH).map(b=>{const l=tech(S.me,b),c=30*(l+1),need=b!='eco'&&tech(S.me,'eco')<l;return`<div class=it><div><b>${TECH[b][0]}</b> – cấp ${l}/3<small>${TECH[b][1]}</small>${l<3?`<small>Chi phí ${c}${need?' · cần Kinh tế cấp '+l:''}</small>`:''}</div>${l<3?`<button onclick="A.tech('${b}')">Nâng</button>`:'✔'}</div>`}).join('')}};
const TT={shop:'🛒 MILITARY SHOP',army:'🪖 Quân đội',eco:'💰 Kinh tế',dip:'🤝 Ngoại giao',res:'🔬 Nghiên cứu'};
function sheet(){const s=$('#sheet');if(!S.panel||S.panel=='map'){s.classList.add('hidden');return}$('#shT').textContent=TT[S.panel];$('#shB').innerHTML=PN[S.panel]();s.classList.remove('hidden')}
function R(){if(!S)return;top();draw();info();sheet()}
const A={
close(){$('#modal').classList.add('hidden')},panel(p){S.panel=p;sheet()},
pause(){S.paused=!S.paused;top()},spd(){S.speed=S.speed==1?2:S.speed==2?4:1;top()},
tap(k){if(k==null||isNaN(k)){if(S.pick){S.pick=null;toast('Đã hủy điều quân')}S.sel=null;return R()}
if(S.pick){const p=S.pick;S.pick=null;A.order(p.k,k,p.f);return R()}S.sel=k;R()},
go(fr){S.pick={k:S.sel,f:fr};toast('Chạm vùng đích trên bản đồ');R()},
pickK(k){S.sel=k;S.panel='map';R()},
order(k,j,fr){if(k==j)return toast('Chọn vùng đích khác',1);const T=S.terr[j],go=()=>{if(send(S.me,k,j,fr))toast('Quân đang hành quân đến '+G.cells[j].n);R()};
if(T.o==S.me||isAl(S.me,T.o))return go();
if(!G.cells[k].nb.includes(j))return toast('Chỉ tấn công được vùng giáp ranh',1);
if(atWar(S.me,T.o))return go();ask('Tuyên chiến với '+S.nat[T.o].name+' để tấn công '+G.cells[j].n+'?',()=>{if(declareWar(S.me,T.o))go()})},
dev(){const k=S.sel,c=devCost(S.me,k);if(me().money<c)return toast('Không đủ tiền: cần '+f(c),1);me().money-=c;S.terr[k].dev++;toast('Đã nâng cấp '+G.cells[k].n);R()},
take(){S.terr[S.sel].o=S.me;S.terr[S.sel].occ=null;R()},
buy(u,q){buy(S.me,tgt(),u,q);R()},tech(b){buyTech(S.me,b);R()},rb(v){me().rb=v/100;R()},cash(){me().money+=10000;R()},
war(o){ask('Tuyên chiến với '+S.nat[o].name+'? Liên minh của họ có thể phản ứng.',()=>{declareWar(S.me,o);R()})},
peace(o){const N=S.nat[o];if(tot(o)<1.2*tot(S.me)||N.rel[S.me]+10*tech(S.me,'dip')>=40){makePeace(S.me,o)}else toast(N.name+' từ chối đình chiến',1);R()},
ally(o){const N=S.nat[o];if(N.rel[S.me]+10*tech(S.me,'dip')>=30){N.allies.push(S.me);me().allies.push(o);toast('Đã lập liên minh với '+N.name)}else toast(N.name+' từ chối – cần thêm thiện cảm (viện trợ, ngoại giao)',1);R()},
pact(o){const N=S.nat[o];if(N.rel[S.me]+10*tech(S.me,'dip')>=10){N.pact.push(S.me);me().pact.push(o);toast('Đã ký hiệp ước không gây chiến')}else toast(N.name+' từ chối hiệp ước',1);R()},
break(o){[S.nat[o].allies,me().allies].forEach((l,i)=>{const x=i?o:S.me;l.splice(l.indexOf(x),1)});S.nat[o].rel[S.me]-=20;R()},
aid(o){if(me().money<500)return toast('Không đủ tiền',1);me().money-=500;S.nat[o].money+=500;S.nat[o].rel[S.me]+=10;toast('Đã gửi viện trợ 500');R()},
menu(){const m=$('#modal');m.innerHTML=`<div class=card><h2>Menu</h2><div class=row><button onclick="A.pause();A.close()">${S.paused?'Tiếp tục':'Tạm dừng'}</button><button onclick="A.save()">Lưu game</button><button onclick="A.load()">Tải game</button><button onclick="A.fresh()">Chơi mới</button><button onclick="A.close()">Đóng</button></div></div>`;m.classList.remove('hidden')},
save(){localStorage.setItem(KEY,JSON.stringify(S));toast('Đã lưu game');A.close()},
load(){const d=localStorage.getItem(KEY);if(!d){A.close();return toast('Chưa có bản lưu',1)}S=JSON.parse(d);A.close();R();toast('Đã tải game')},
fresh(){ask('Bỏ trận hiện tại và chơi mới?',start)}};
function start(){const m=$('#modal'),has=!!localStorage.getItem(KEY);m.innerHTML=`<div class=card><h2>World Conquest – Đế Chế</h2><label>Chế độ</label><select id=sm><option value=dom>World Domination</option><option value=sbx>Sandbox</option><option value=bat>Custom Battle</option></select><label>Quốc gia</label><select id=sn>${NAT.map((x,i)=>`<option value=${i}>${x.n} (${x.d})</option>`).join('')}</select><label>Độ khó AI</label><select id=sa><option value=0>Dễ</option><option value=1 selected>Bình thường</option><option value=2>Khó</option></select><label>Tiền khởi đầu (Sandbox)</label><input id=sg type=number value=20000><div class=row><button id=go>Bắt đầu</button>${has?'<button onclick="A.load()">Tiếp tục</button>':''}</div></div>`;m.classList.remove('hidden');
$('#go').onclick=()=>newGame({mode:$('#sm').value,me:+$('#sn').value,ai:+$('#sa').value,money:Math.max(0,+$('#sg').value||0)})}
/* ---------- map input ---------- */
function setVB(){const r=$('#map').getBoundingClientRect();$('#map').setAttribute('viewBox',`${vb.x} ${vb.y} ${vb.w} ${vb.w*r.height/r.width}`)}
function initMap(){const svg=$('#map'),P=new Map();svg.innerHTML='<rect x=-600 y=-600 width=2200 height=1900 fill=#0e2a3a />'+G.cells.map((c,k)=>`<polygon class=t data-k=${k} points="${c.p.map(q=>q.join(',')).join(' ')}"/>`).join('')+'<g id=lb></g><g id=mv></g>';
const r=svg.getBoundingClientRect();vb.w=Math.max(1100,720*r.width/r.height);vb.x=(GW-vb.w)/2;vb.y=(GH-vb.w*r.height/r.width)/2;setVB();
let mv=0,dn=null,d0=0;const D=()=>{const a=[...P.values()];return Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])||1};
const zoom=(fc,cx,cy)=>{const b=svg.getBoundingClientRect(),px=(cx-b.left)/b.width,py=(cy-b.top)/b.height,h=vb.w*b.height/b.width,nw=Math.min(1500,Math.max(300,vb.w*fc));vb.x+=(vb.w-nw)*px;vb.y+=(h-nw*b.height/b.width)*py;vb.w=nw;setVB()};
svg.onpointerdown=e=>{svg.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size==1){mv=0;dn=e.target.dataset.k}else d0=D()};
svg.onpointermove=e=>{if(!P.has(e.pointerId))return;const o=P.get(e.pointerId),b=svg.getBoundingClientRect();P.set(e.pointerId,[e.clientX,e.clientY]);
if(P.size==1){const dx=e.clientX-o[0],dy=e.clientY-o[1];mv+=Math.abs(dx)+Math.abs(dy);vb.x-=dx*vb.w/b.width;vb.y-=dy*vb.w/b.width;setVB()}
else if(P.size==2){const a=[...P.values()],d=D();zoom(d0/d,(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2);d0=d;mv+=10}};
svg.onpointerup=svg.onpointercancel=e=>{if(P.size==1&&mv<8&&S)A.tap(dn==null?null:+dn);P.delete(e.pointerId)};
svg.onwheel=e=>{e.preventDefault();zoom(e.deltaY>0?1.12:.89,e.clientX,e.clientY)};addEventListener('resize',setVB)}
addEventListener('DOMContentLoaded',()=>{initMap();start();setInterval(()=>{if(!S)return;tick(.25);if(S.end)return;top();draw();if(++A._c%4==0){info();if(['shop','army','dip'].includes(S.panel)||S.panel=='eco'&&document.activeElement.tagName!='INPUT')sheet()}},250);
setInterval(()=>{if(S&&!S.end)localStorage.setItem(KEY,JSON.stringify(S))},20000)});A._c=0;
