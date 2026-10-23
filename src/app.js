const $=s=>document.querySelector(s),canvas=$('#arena'),ctx=canvas.getContext('2d'),chart=$('#chart'),cc=chart.getContext('2d');
let worker,ready=false,busy=false,state=null,samples=[],allSamples=[],lastSource='',data=null,workerURL='',lastHit=0,audio=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const colors={anterior:'#bb681e',posterior:'#198799',reverse:'#bd3b76',forward:'#66851b',harsh:'#7c55ab'};
const glowColors={anterior:'#ffac36',posterior:'#33d9ff',reverse:'#ff4d9d',forward:'#c6f548',harsh:'#bf85ff'};
const fallback={time:0,hits:0,action:null,q:Array(19).fill(0),v:Array(19).fill(0),phase:0,contraction:0,mechanical:0,knockback:0,theatrics:0,impulse:0,lastPosition:.2,lastPower:0,contact:false,mode:'출발 대기',rates:{anterior:0,posterior:0,reverse:0,forward:0,harsh:0,active:0}};
$('#theme').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').setAttribute('aria-pressed',String(dark));draw();drawChart();};
for(const ex of examples){const o=document.createElement('option');o.value=ex.id;o.textContent=ex.title;$('#example').append(o);}
function codeChanged(){const n=$('#code').value.split('\n').length;$('#line-count').textContent=n+'줄';$('#lines').textContent=Array.from({length:n},(_,i)=>i+1).join('\n');}
function selectExample(){
  const ex=examples.find(e=>e.id===$('#example').value);$('#code').value=ex.code;$('#example-note').textContent=ex.note;codeChanged();
  $('#welcome h3').textContent=ex.title.slice(5);
  $('#welcome p').textContent=ex.id==='blank'?'시작과 끝 사이에 나만의 동현랭 연속기를 써 보자.':'가운데 소녀의 글러브에서 왼쪽 선충의 신경 반응까지 지켜보자.';
}
selectExample();$('#example').onchange=selectExample;$('#code').oninput=codeChanged;$('#code').onscroll=()=>$('#lines').scrollTop=$('#code').scrollTop;
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-tab]').forEach(x=>{x.classList.toggle('active',x===b);if(x===b)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});
  document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!=='tab-'+b.dataset.tab);
  if(b.dataset.tab==='lab'){draw();drawChart();}
});
function showReference(key){
  document.querySelectorAll('[data-reference]').forEach(b=>{const yes=b.dataset.reference===key;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
  document.querySelectorAll('[data-reference-panel]').forEach(p=>p.hidden=p.dataset.referencePanel!==key);
}
document.querySelectorAll('[data-reference]').forEach(b=>b.onclick=()=>showReference(b.dataset.reference));
function openReference(hash){
  let id;try{id=decodeURIComponent(hash.slice(1));}catch{return false;}
  const target=document.getElementById(id),panel=target?.closest('[data-reference-panel]');if(!panel)return false;
  document.querySelector('[data-tab="science"]').click();showReference(panel.dataset.referencePanel);
  for(let n=target;n&&n!==panel.parentElement;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;
  requestAnimationFrame(()=>{target.scrollIntoView({block:'start'});if(target.hasAttribute('tabindex'))target.focus({preventScroll:true});});return true;
}
document.querySelectorAll('a[href^="#"]:not(#data-download)').forEach(a=>a.addEventListener('click',e=>{if(openReference(a.getAttribute('href'))){e.preventDefault();try{history.replaceState(null,'',a.getAttribute('href'));}catch{}}}));
addEventListener('hashchange',()=>openReference(location.hash));if(location.hash)openReference(location.hash);
$('.brand').onclick=e=>{e.preventDefault();document.querySelector('[data-tab="lab"]').click();window.scrollTo({top:0,behavior:'instant'});};
function controls(){for(const id of ['run','demo'])$('#'+id).disabled=!ready||busy;$('#halt').disabled=!busy;$('#code').readOnly=busy;$('#example').disabled=busy;}
function status(text,kind=''){$('#status').textContent=text;$('#status').dataset.kind=kind;}
function renderLog(rows){
  $('#log').replaceChildren(...rows.map(r=>{const li=document.createElement('li'),t=document.createElement('time');t.textContent=(r.ms/1000).toFixed(2).padStart(5,'0');li.append(t,document.createTextNode(r.text));return li;}));
}
function pop(){
  if(!audio||audio.state!=='running')return;const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(90,t+.07);g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.0001,t+.09);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.1);
}
function receive(m){
  if(m.state)state=m.state;if(m.samples)samples=m.samples;if(m.allSamples)allSamples=m.allSamples;
  if(m.type==='ready'){ready=true;status('회로 준비 완료');}
  if(m.type==='done'){busy=false;status('실험 완료');$('#result').textContent=`${(state.time/1000).toFixed(1)}초 동안 ${state.hits}회 접촉했다. 다른 위치·세기·감각 경로로 다시 실험해 보자.`;}
  if(m.type==='halted'){busy=false;status('중단됨');$('#result').textContent='오겡끼데스까. 실험을 멈췄다. 다시 실행하면 처음부터 시작한다.';}
  if(m.type==='error'){busy=false;status('실행 오류','error');$('#result').textContent=(m.line?m.line+'번 문장: ':'')+m.error;}
  if(state?.hits>lastHit&&state.sound)pop();lastHit=state?.hits||0;
  for(const key of ['anterior','posterior','reverse','forward'])$('#'+key).innerHTML=(state?.rates[key]||0).toFixed(3)+' <small>a.u.</small>';
  $('#clock').textContent=((state?.time||0)/1000).toFixed(2)+' s';$('#mode').textContent=state?.mode||'출발 대기';$('#contact-count').textContent=(state?.hits||0)+'회 접촉';
  $('#step-count').textContent=(m.steps||0).toLocaleString()+'문장';
  if(m.logs?.length)renderLog(m.logs);$('#csv').disabled=!allSamples.length||busy;controls();draw();drawChart();
}
async function init(){
  try{
    const cfg=window.WORM_CONFIG;
    if(window.EMBEDDED_WORM){data=window.EMBEDDED_WORM;workerURL=URL.createObjectURL(new Blob([window.EMBEDDED_WORKER],{type:'text/javascript'}));}
    else{
      const response=await fetch(cfg.data);if(!response.ok)throw Error('연결 데이터를 읽지 못했다.');data=await response.json();
      const codeResponse=await fetch(cfg.worker);if(!codeResponse.ok)throw Error('계산 실행기를 읽지 못했다.');
      workerURL=URL.createObjectURL(new Blob([await codeResponse.text()],{type:'text/javascript'}));
    }
    worker=new Worker(workerURL);worker.onmessage=e=>receive(e.data);worker.onerror=e=>{busy=false;status('실행 환경 오류','error');$('#result').textContent=e.message||'이 브라우저에서 계산 스레드를 열지 못했다.';controls();};
    worker.postMessage({type:'init',data});
    $('#data-download').href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));
  }catch(e){status('불러오기 오류','error');$('#result').textContent=e.message;}
}
function run(){
  if(!ready||busy)return;lastSource=$('#code').value;allSamples=[];samples=[];drawChart();lastHit=0;busy=true;$('#welcome').hidden=true;status('실험 중','running');$('#result').textContent='동현랭 명령을 실행하고 있다.';controls();
  const AC=window.AudioContext||window.webkitAudioContext;if(AC&&!audio)audio=new AC();if(audio?.state==='suspended')audio.resume().catch(()=>{});
  worker.postMessage({type:'run',code:lastSource});
}
$('#run').onclick=run;$('#demo').onclick=run;$('#halt').onclick=()=>worker?.postMessage({type:'halt'});
$('#code').onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run();}if(e.key==='Tab'&&!busy){e.preventDefault();const t=e.target,start=t.selectionStart;t.setRangeText('  ',start,t.selectionEnd,'end');codeChanged();}};
function download(name,text,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#save').onclick=()=>download('donghyunpa-experiment.dh',$('#code').value,'text/plain;charset=utf-8');
$('.file-label').tabIndex=0;$('.file-label').setAttribute('role','button');
$('.file-label').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#open').click();}};
$('#open').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;if(busy){$('#result').textContent='중단한 뒤 파일을 열 수 있다.';e.target.value='';return;}if(f.size>400000){$('#result').textContent='파일이 너무 크다. 400 KB 이하의 동현랭 코드를 열어라.';return;}const t=await f.text();if(t.length>100000){$('#result').textContent='코드는 100,000자까지다.';return;}$('#code').value=t;codeChanged();$('#result').textContent='코드를 불러왔다. 실행하면 새 실험으로 시작한다.';e.target.value='';};
$('#csv').onclick=()=>{
  if(!allSamples.length)return;const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  const meta=[['# model','동현파 0.2 / 279 neurons / 3108 undirected layer edges / dimensionless activation'],['# data','CoMuNeLab C.ELEGANS MULTIPLEX CONNECTOME; ODbL 1.0 / DbCL 1.0; reindexed and deduplicated'],['# source','https://github.com/CoMuNeLab/C-elegans-Multiplex-Connectome'],['# license','https://opendatacommons.org/licenses/odbl/1-0/'],['# limitation','Not measured electrophysiology, genome simulation, boxing injury or pain model'],['# code',lastSource]],keys=Object.keys(allSamples[0]);
  download('donghyunpa-observations.csv','\ufeff'+meta.map(r=>r.map(esc).join(',')).join('\n')+'\n'+keys.join(',')+'\n'+allSamples.map(s=>keys.map(k=>esc(s[k])).join(',')).join('\n'),'text/csv;charset=utf-8');
};
function setup(c,context,h){
  const w=c.getBoundingClientRect().width;if(w<1)return false;const d=Math.min(devicePixelRatio||1,2);if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d);}
  c.style.height=h+'px';context.setTransform(c.width/640,0,0,c.height/480,0,0);return true;
}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function ellipse(x,y,rx,ry,fill,stroke,rot=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
const mix=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const VIEW_GAIN=10,CHART_MAX=.1;
function wormPoint(p,s){
  const j=p*(s.q.length-1),i=Math.floor(j),q=mix(s.q[i]||0,s.q[Math.min(i+1,s.q.length-1)]||0,j-i);
  const neural=Math.min(65,VIEW_GAIN*((s.rates.reverse+s.rates.forward)*40+s.rates.harsh*18));
  const local=Math.max(-42,Math.min(42,q*VIEW_GAIN)),retract=Math.max(-20,Math.min(45,VIEW_GAIN*(s.rates.reverse-s.rates.forward)*70));
  const radius=.9*(7+15*Math.pow(Math.sin(Math.PI*p),.6))*(1+.18*s.theatrics*Math.sin(p*24+s.time*.015));
  const x=157+.9*(16*Math.sin(p*Math.PI*2-.25)+p*10)+s.knockback*(1.15-.25*p)+local+Math.sin(s.phase+p*Math.PI*3)*neural*Math.sin(Math.PI*p);
  return {x:Math.max(24+radius,Math.min(280-radius,x)),y:110+p*310.5+retract*(1-p),r:radius};
}
function worm(s,dark){
  const points=Array.from({length:25},(_,i)=>wormPoint(i/24,s));const left=[],right=[];
  for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],p=points[i],len=Math.hypot(b.x-a.x,b.y-a.y)||1,nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len;left.push({x:p.x+nx*p.r,y:p.y+ny*p.r});right.push({x:p.x-nx*p.r,y:p.y-ny*p.r});}
  ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=2;const grad=ctx.createLinearGradient(120+s.knockback,0,195+s.knockback,0);grad.addColorStop(0,dark?'#d6a4b0':'#efc3cc');grad.addColorStop(.5,'#fbe1e5');grad.addColorStop(1,'#dfadb9');ctx.fillStyle=grad;ctx.strokeStyle='#ad7a89';ctx.beginPath();
  left.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  const tail=points.at(-1),head=points[0];
  ctx.quadraticCurveTo(tail.x,tail.y+12,right.at(-1).x,right.at(-1).y);
  right.slice(0,-1).reverse().forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.quadraticCurveTo(head.x,head.y-14,left[0].x,left[0].y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#fff3f5b8';ctx.lineWidth=5;ctx.beginPath();points.slice(2,-2).forEach((p,i)=>i?ctx.lineTo(p.x-7,p.y):ctx.moveTo(p.x-7,p.y));ctx.stroke();
  ctx.strokeStyle='#b6809370';ctx.lineWidth=1.2;ctx.setLineDash([2,4]);ctx.beginPath();points.slice(3,-2).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);
  // Schematic group markers, not measured anatomical positions or spike events.
  for(const [p,k]of [[.22,'anterior'],[.8,'posterior'],[.4,'reverse'],[.64,'forward'],[.53,'harsh']]){
    const v=wormPoint(p,s),gain=Math.min(1,s.rates[k]*VIEW_GAIN),color=glowColors[k];
    if(gain>.025){
      const pulse=reduced?1:.72+.28*Math.sin(s.time*.026+p*17)**2,halo=12+gain*18;
      ctx.save();ctx.globalAlpha=gain*.45*pulse;
      const light=ctx.createRadialGradient(v.x,v.y,1,v.x,v.y,halo);
      light.addColorStop(0,color);light.addColorStop(.42,color+'99');light.addColorStop(1,color+'00');
      circle(v.x,v.y,halo,light);
      ctx.globalAlpha=Math.min(1,.35+gain*.65);ctx.shadowColor=color;ctx.shadowBlur=16*gain;
      circle(v.x,v.y,3+gain*5,color);circle(v.x,v.y,1.5+gain*2,'#fffefa');
      ctx.shadowBlur=0;ctx.strokeStyle=color;ctx.lineWidth=1.6;
      const ring=9+gain*10*(reduced?.7:(s.time*.002+p)%1);
      circle(v.x,v.y,ring,null,color);
      for(let j=0;j<3;j++){
        const a=j*2.094+p*9,twinkle=reduced?.8:.4+.6*Math.sin(s.time*.018+j*2+p*11)**2;
        const x=v.x+Math.cos(a)*(halo*.8),y=v.y+Math.sin(a)*(halo*.8),r=2+gain*3*twinkle;
        ctx.globalAlpha=gain*twinkle;ctx.fillStyle=j===1?'#ffffff':color;
        ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+1,y-1);ctx.lineTo(x+r,y);ctx.lineTo(x+1,y+1);ctx.lineTo(x,y+r);ctx.lineTo(x-1,y+1);ctx.lineTo(x-r,y);ctx.lineTo(x-1,y-1);ctx.closePath();ctx.fill();
      }
      ctx.restore();
    }else{circle(v.x,v.y,2.3,colors[k]);}
  }
  const face=wormPoint(.09,s);ctx.strokeStyle='#87546a';ctx.lineWidth=1.8;
  if(s.contact&&s.lastPower>.7){for(const side of [-1,1]){ctx.beginPath();ctx.arc(face.x+side*6,face.y-2,2.5,0,Math.PI);ctx.stroke();}}
  else for(const side of [-1,1]){ellipse(face.x+side*6,face.y-2,2.7,3.5,'#775064');circle(face.x+side*6+.8,face.y-3,1,'#fffdf3');}
  circle(face.x-11,face.y+4,2.4,'#ddba9c');circle(face.x+11,face.y+4,2.4,'#ddba9c');ctx.beginPath();ctx.arc(face.x+1,face.y+4,3,0,Math.PI);ctx.stroke();
  if(s.theatrics>.07){
    ctx.save();ctx.globalAlpha=Math.min(.7,s.theatrics);ctx.strokeStyle='#887f61';ctx.lineWidth=1.5;
    for(let i=0;i<6;i++){const p=wormPoint(.25+i*.105,s),side=i%2?1:-1;ellipse(p.x+side*7,p.y,4+2*s.theatrics,2,'#aa9e79');ctx.beginPath();ctx.moveTo(p.x-side*11,p.y-4);ctx.lineTo(p.x-side*5,p.y-1);ctx.lineTo(p.x-side*10,p.y+3);ctx.stroke();}
    for(let i=0;i<5;i++){const angle=i*1.25+s.time*.004;const x=face.x+Math.cos(angle)*32,y=face.y-25+Math.sin(angle)*10;ctx.fillStyle='#e5bf66';ctx.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,r=j%2?2:5;j?ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}ctx.closePath();ctx.fill();}
    ctx.restore();
  }
  if(s.contact){const t=wormPoint(s.action?.position??s.lastPosition,s);ctx.strokeStyle='#fff6d6';ctx.lineWidth=2;circle(t.x+t.r,t.y,13+s.lastPower*4,null,'#f8e6a5');for(let i=0;i<3;i++){const a=-.8+i*.8;circle(t.x+t.r+Math.cos(a)*20,t.y+Math.sin(a)*20,2.2,'#fff5d0');}}
  if(s.action?.hit&&s.action.power>.55){
    const age=(s.action.progress-punches[s.action.type].contact)/.36;
    if(age>=0&&age<1){const at=wormPoint(s.action.position,s);ctx.save();ctx.globalAlpha=(1-age)*.6;
      for(let i=0;i<5;i++){const angle=2.1+i*.42,reach=12+age*(25+i*8);
        circle(at.x+Math.cos(angle)*reach,at.y+Math.sin(angle)*reach,3+age*7+i*.5,dark?'#b5aa8c':'#e0d1b3');}
      ctx.restore();
    }
  }
}
function bezierPoint(a,b,c,t){return {x:(1-t)*(1-t)*a.x+2*(1-t)*t*b.x+t*t*c.x,y:(1-t)*(1-t)*a.y+2*(1-t)*t*b.y+t*t*c.y};}
function glovePath(type,progress,rest,target,contact){
  // Finish direction is invariant to target height: horizontal jab, vertical uppercut,
  // horizontal projected arc for hook, descending overhand, diagonal shovel.
  const wind=type===2?{x:target.x+15,y:Math.min(435,target.y+105)}:
    type===8?{x:target.x+90,y:Math.min(435,target.y+85)}:
    type===7?{x:target.x+105,y:Math.max(82,target.y-95)}:
    [4,6].includes(type)?{x:target.x+(type===6?155:125),y:target.y}:
    {x:Math.max(rest.x+16,target.x+115),y:target.y};
  if(progress<.22){const t=smooth(progress/.22);return{x:mix(rest.x,wind.x,t),y:mix(rest.y,wind.y,t)};}
  if(progress<=contact){
    const u=smooth((progress-.22)/(contact-.22));
    if([4,6].includes(type)){const width=type===6?155:125;
      return{x:target.x+width*Math.cos(u*Math.PI/2),y:target.y+(type===6?48:30)*Math.sin(u*Math.PI)**2};
    }
    if(type===2)return{x:target.x+15*(1-u)*(1-u),y:mix(wind.y,target.y,u)};
    if(type===7)return bezierPoint(wind,{x:target.x-15,y:wind.y-15},target,u);
    return{x:mix(wind.x,target.x,u),y:mix(wind.y,target.y,u)};
  }
  const t=smooth((progress-contact)/(1-contact));return bezierPoint(target,{x:target.x+60,y:target.y+35},rest,t);
}
function draw(){
  const w=canvas.getBoundingClientRect().width;if(!setup(canvas,ctx,w*480/640))return;
  const s=state||fallback,dark=document.documentElement.dataset.theme==='dark';ctx.clearRect(0,0,640,480);ctx.fillStyle=dark?'#27241e':'#eee8d8';ctx.fillRect(0,0,640,480);
  ctx.strokeStyle=dark?'#c7b38a10':'#b29c6620';ctx.lineWidth=.5;for(let x=0;x<=640;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,480);ctx.stroke();}for(let y=0;y<=480;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(640,y);ctx.stroke();}
  ctx.strokeStyle=dark?'#cfbea533':'#9e8c6550';ctx.lineWidth=1;ctx.strokeRect(12,12,616,456);
  ellipse(162+s.knockback*.5,431,40,6,dark?'#080a081c':'#91877018');ellipse(352,356,20,4,dark?'#08080838':'#91877022');
  ctx.strokeStyle=dark?'#c8b79238':'#baaa893f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(87,442);ctx.lineTo(421,442);ctx.stroke();
  worm(s,dark);drawPixelGirl(ctx,s,punches,wormPoint,glovePath);
  const font=w<500?14:12;ctx.font=font+'px "Pretendard"';ctx.fillStyle=dark?'#d0c3ab':'#6e6356';ctx.textAlign='center';ctx.fillText('예쁜꼬마선충',180,68);ctx.fillText('동현랭 소녀',352,237);
  if(s.action&&s.action.progress<1){ctx.fillStyle=dark?'#edd598':'#957044';ctx.font='13px "Nanum Gothic Coding"';ctx.fillText(s.action.name,480,226);ctx.font='11px "Nanum Gothic Coding"';ctx.fillText('위치 '+Math.round(s.action.position*100)+'% · 세기 '+Math.round(s.action.power*100),480,246);}
}
function drawChart(){
  const w=chart.getBoundingClientRect().width;if(w<1)return;const h=w<500?165:180,d=Math.min(devicePixelRatio||1,2);chart.width=Math.round(w*d);chart.height=Math.round(h*d);chart.style.height=h+'px';cc.setTransform(d,0,0,d,0,0);
  const dark=document.documentElement.dataset.theme==='dark',left=40,right=w-12,top=14,bottom=h-26;cc.clearRect(0,0,w,h);cc.fillStyle=dark?'#201d18':'#fbf7ef';cc.fillRect(0,0,w,h);cc.font='10px "Nanum Gothic Coding"';cc.textAlign='right';
  for(const y of [0,.025,.05,.075,.1]){const yy=bottom-y/CHART_MAX*(bottom-top);cc.strokeStyle=dark?'#c4b18b22':'#dacfb666';cc.lineWidth=1;cc.beginPath();cc.moveTo(left,yy);cc.lineTo(right,yy);cc.stroke();cc.fillStyle=dark?'#bdb19c':'#6e6356';cc.fillText(y.toFixed(3),left-7,yy+3);}
  const end=Math.max(10000,state?.time||0),start=end-10000;
  for(let t=0;t<=10;t+=2){const x=left+(right-left)*t/10;cc.textAlign='center';cc.fillText(((start+t*1000)/1000).toFixed(0)+'s',x,h-8);}
  let peak=0;cc.save();cc.beginPath();cc.rect(left,top,right-left,bottom-top);cc.clip();
  for(const key of Object.keys(colors)){cc.strokeStyle=colors[key];cc.lineWidth=2;cc.beginPath();let first=true;for(const sample of samples){if(sample.ms<start)continue;peak=Math.max(peak,sample[key]);const x=left+(sample.ms-start)/10000*(right-left),y=bottom-sample[key]/CHART_MAX*(bottom-top);if(first){cc.moveTo(x,y);first=false;}else cc.lineTo(x,y);}cc.stroke();}
  cc.restore();
  for(const key of Object.keys(colors)){let prev=-100;for(const sample of samples){if(sample.ms<start||sample[key]<=CHART_MAX)continue;const x=left+(sample.ms-start)/10000*(right-left);if(x-prev<12)continue;prev=x;cc.fillStyle=colors[key];cc.beginPath();cc.moveTo(x,top);cc.lineTo(x-3,top+5);cc.lineTo(x+3,top+5);cc.fill();}}
  $('#chart-scale').textContent='Y축 0–0.10 a.u. · 10× 확대'+(peak>CHART_MAX?' · ▲ 범위 초과 / 실제 최대 '+peak.toFixed(3):'');
}
window.render_game_to_text=()=>JSON.stringify({app:'동현파',version:'0.2',time:state?.time||0,busy,action:state?.action||null,rates:state?.rates||fallback.rates,hits:state?.hits||0,knockback:state?.knockback||0,theatrics:state?.theatrics||0,coordinates:'640×480, x right, y down; upright worm left, pixel girl center'});
let ticking=false;function animate(){if(ticking)return;ticking=true;const frame=()=>{draw();if(busy&&!reduced)requestAnimationFrame(frame);else ticking=false;};requestAnimationFrame(frame);}
$('#run').addEventListener('click',animate);$('#demo').addEventListener('click',animate);
new ResizeObserver(()=>{draw();drawChart();}).observe($('.observation'));document.fonts.ready.then(()=>{draw();drawChart();});
draw();drawChart();init();
