let slow=false;
/* The simulation accepts only integer packets emitted by the unchanged Donghyun VM. */
let D,brain,world,vm,running=false,runId=0,steps=0,elapsed=0,pending=0,token='',packet=[],queue=[],logs=[],samples=[],wallStart=0;
const arity={1:1,2:4,3:1,4:2,5:1,6:1,7:1,8:1};
const PLAYBACK_STRETCH=3; // Wall-clock presentation only; all simulated dt and CSV values stay unchanged.
const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
const range=(x,a,b,name)=>assert(Number.isSafeInteger(x)&&x>=a&&x<=b,`${name}: ${a}~${b} 정수여야 한다.`);
function log(text){logs.push({ms:world?.time||0,text});if(logs.length>300)logs.shift();}
function resetWorld(seed){
  brain=new WormCircuit(D);brain.reset(seed);
  world={seed,time:0,hits:0,action:null,mode:'출발 대기',rates:{...brain.last},q:Array(19).fill(0),v:Array(19).fill(0),phase:0,
    contraction:0,mechanical:0,knockback:0,knockVelocity:0,theatrics:0,impulse:0,lastPosition:.2,lastPower:0,contact:false,blocks:[0,0,0,0,0],mecGain:100,sound:0,tags:[]};
  queue=[];samples=[];pending=0;
}
function write(str){
  for(const ch of String(str)){
    if(/\s/.test(ch)){if(token){const t=token;token='';accept(t);}}
    else{token+=ch;assert(token.length<=20,'정수 토큰이 너무 길다. 문자 대신 정수와 줄바꿈을 출력하라.');}
  }
}
function accept(t){
  assert(/^[+-]?\d+$/.test(t),'동현파는 정수 명령만 읽는다: '+t);
  const n=Number(t);assert(Number.isSafeInteger(n),'정수가 안전 범위를 벗어났다.');
  if(!packet.length)assert(n in arity,'없는 실험 명령: '+n);
  packet.push(n);
  if(packet.length===arity[packet[0]]+1){const p=packet;packet=[];command(p[0],p.slice(1));}
}
function command(op,a){
  switch(op){
    case 1:range(a[0],1,2147483647,'시드');resetWorld(a[0]);log('실험 초기화 · 시드 '+a[0]);break;
    case 2:{
      const [type,hand,power,position]=a;range(type,1,8,'기술 번호');range(hand,1,2,'손: 오른손 1 / 왼손 2');range(power,0,100,'접촉 세기');range(position,5,95,'접촉 위치');
      const spec=punches[type],duration=Math.round(spec.duration/20)*20;
      assert(elapsed+duration<=60000,'한 실행의 모의 시간은 60초까지다.');
      world.action={type,hand,name:(hand===1?'오른손 ':'왼손 ')+spec.name,duration,progress:0,power:power/100,position:position/100,efficacy:.98+.04*brain.rng(),hit:false};pending=duration;
      log(`${world.action.name} 준비 · 위치 ${position}% · 세기 ${power}`);break;
    }
    case 3:range(a[0],20,10000,'대기 ms');assert(a[0]%20===0,'대기 시간은 20 ms의 배수다.');assert(elapsed+a[0]<=60000,'한 실행의 모의 시간은 60초까지다.');world.action=null;pending=a[0];break;
    case 4:range(a[0],1,5,'차단 그룹');range(a[1],0,1,'차단 1 / 복원 0');brain.setBlock(a[0],a[1]);world.blocks[a[0]-1]=a[1];log(`그룹 ${a[0]} 출력 ${a[1]?'차단':'복원'}`);break;
    case 5:range(a[0],0,100,'MEC-4 관련 입력 계수');brain.mecGain=a[0]/100;world.mecGain=a[0];log(`MEC-4 관련 입력 계수 ${a[0]}% · 유전자 편집이 아닌 입력 모델`);break;
    case 6:{
      range(a[0],1,9,'관측 항목');const r=world.rates;
      const values=[0,world.time,r.anterior*1000,r.posterior*1000,r.reverse*1000,r.forward*1000,r.harsh*1000,world.contraction*1000,world.hits,r.active];
      assert(queue.length<256,'관측 입력 큐가 가득 찼다.');queue.push(Math.round(values[a[0]]));log(`관측 ${a[0]} → ${Math.round(values[a[0]])}`);break;
    }
    case 7:world.tags.push({ms:world.time,value:a[0]});log('동현랭 기록: '+a[0]);break;
    case 8:range(a[0],0,1,'효과음');world.sound=a[0];log('효과음 '+(a[0]?'사용':'끔'));break;
  }
}
function tick(){
  const dt=.02;let power=0,position=world.lastPosition;
  if(world.action){
    const a=world.action,p=punches[a.type];a.progress=Math.min(1,a.progress+20/a.duration);
    const local=(a.progress-(p.contact-p.window/2))/p.window;
    if(local>0&&local<1)power=a.power*Math.sin(Math.PI*local);
    position=a.position;
    if(!a.hit&&a.progress>=p.contact){
      a.hit=true;world.hits++;world.lastPower=a.power;world.lastPosition=a.position;
      world.knockVelocity-=210*a.power;
      log(`${a.name} 접촉 · ${a.position<.4?'앞쪽':a.position>.65?'뒤쪽':'몸 중간'} · 누적 ${world.hits}회`);
    }
  }
  world.contact=power>0;
  const neuralPower=Math.min(1,power*(world.action?.efficacy||1));
  brain.step(.01,{power:neuralPower,position});world.rates={...brain.step(.01,{power:neuralPower,position})};
  const r=world.rates;
  world.contraction=Math.min(1,(r.reverse+r.forward)*2+r.harsh*.8);
  world.phase+=dt*(2+7*world.contraction)*(r.forward>=r.reverse?1:-1);
  let mechanical=0;
  const old=world.q.slice();
  for(let i=0;i<world.q.length;i++){
    const s=i/(world.q.length-1),force=-450*power*Math.exp(-Math.pow((s-position)/.13,2));
    const lap=(old[Math.max(0,i-1)]+old[Math.min(old.length-1,i+1)]-2*old[i]);
    world.v[i]+=dt*(-35*old[i]-5.5*world.v[i]+28*lap+force);
    world.v[i]=Math.max(-220,Math.min(220,world.v[i]));world.q[i]=Math.max(-65,Math.min(65,old[i]+world.v[i]*dt));
    mechanical=Math.max(mechanical,Math.abs(world.q[i]));
  }
  world.mechanical=mechanical;
  world.knockVelocity+=dt*(-2.8*world.knockback-2.1*world.knockVelocity);
  world.knockback=Math.max(-85,Math.min(12,world.knockback+world.knockVelocity*dt));
  world.theatrics=Math.max(0,Math.min(1,world.theatrics+power*dt*4-dt*.045));
  world.impulse+=power*dt;
  world.mode=r.harsh>.06?'강한 촉각 회로도 활성':r.reverse>r.forward+.008?'후진 회로 우세':r.forward>r.reverse+.008?'전진 회로 우세':world.contact?'기계적 접촉':world.action&&world.action.progress<1?'기술 진행 중':world.contraction>.01?'반응이 가라앉는 중':'자극 없음';
  world.time+=20;elapsed+=20;
  if(world.time%100===0)samples.push({ms:world.time,...r,contraction:world.contraction,mechanical,knockback:world.knockback,theatrics:world.theatrics,impulse:world.impulse,hits:world.hits,position:world.lastPosition,power:world.lastPower,mecGain:world.mecGain});
}
function snapshot(type='frame',extra={}){
  postMessage({type,state:world,logs:logs.slice(-30),samples:samples.slice(-100),steps,line:vm?.currentLine||1,phys:vm&&!vm.done?(vm.stmts?.[vm.pc]?.phys||0):0,slow,...extra});
}
function fail(e){running=false;log('오류: '+e.message);snapshot('error',{error:e.message,line:e.line||vm?.currentLine,allSamples:samples});}
function loop(id){
  if(!running||id!==runId)return;const t=performance.now(),beforeElapsed=elapsed;
  try{
    if(pending){tick();pending-=20;}
    else{
      let budget=0;
      while(running&&!pending&&!vm.done&&budget++<(slow?1:400)){vm.step(1);steps++;assert(steps<=300000,'30만 문장 한도에 도달했다. 반복 조건을 확인하라.');}
      if(vm.done){
        if(vm.halted){running=false;packet=[];token='';pending=0;log('오겡끼데스까 · 종료');}
        else{if(token){const t=token;token='';accept(t);}assert(!packet.length,'명령 인수가 부족하다. 조작 규약을 확인하라.');if(!pending){running=false;log('프로그램 완료 · 동현이구나');}}
      }
    }
    if(slow||world.time%20===0||!running)snapshot(running?'frame':'done',running?{}:{allSamples:samples,wallMs:performance.now()-wallStart});
    if(running)setTimeout(()=>loop(id),elapsed>beforeElapsed?Math.max(0,20*PLAYBACK_STRETCH-(performance.now()-t)):(slow?260:0));
  }catch(e){fail(e);}
}
onmessage=({data:m})=>{
  try{
    if(m.type==='speed'){slow=!!m.slow;return;}
    if(m.type==='init'){D=m.data;resetWorld(1);snapshot('ready');return;}
    if(m.type==='halt'){
      const h=new Donghyun.VM('나는 동현이냐?\n오겡끼데스까\n동현이구나');h.run();
      if(h.halted){running=false;runId++;pending=0;packet=[];token='';log('오겡끼데스까 · 동현랭 중단 프로그램');snapshot('halted',{allSamples:samples});}return;
    }
    if(m.type==='run'){
      runId++;running=false;resetWorld(1);logs=[];steps=0;elapsed=0;packet=[];token='';pending=0;vm=null;slow=!!m.slow;
      assert(typeof m.code==='string'&&m.code.length<=100000,'코드는 100,000자까지다.');
      const candidate=new Donghyun.VM(m.code,{write,readInt:()=>{assert(queue.length>0,'명령 6으로 관측을 요청한 뒤 꽥꽥으로 읽어라.');return queue.shift();}});
      vm=candidate;running=true;wallStart=performance.now();log('동현랭 프로그램 시작');snapshot();loop(runId);
    }
  }catch(e){fail(e);}
};
