const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path'),crypto=require('crypto');
const D=require('../data/connectome.json'),{WormCircuit}=require('../src/brain.js'),{examples,expression}=require('../src/examples.js');
const source=['donghyun.js','brain.js','examples.js','worker.js'].map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
let total=0;const check=(name,f)=>{f();total++;console.log('PASS',name);};
check('Failed new run cannot reuse earlier observations; next valid run is unchanged',()=>{
  const queue=[],messages=[],c=vm.createContext({console,performance,setTimeout:fn=>queue.push(fn),postMessage:m=>messages.push(structuredClone(m))});c.self=c;vm.runInContext(source,c);
  const drain=()=>{let n=0;while(queue.length){queue.shift()();assert(++n<100000);}};
  c.onmessage({data:{type:'init',data:D}});
  c.onmessage({data:{type:'run',code:examples[0].code}});drain();const first=messages.at(-1);
  assert(first.allSamples.length>0);
  c.onmessage({data:{type:'run',code:'잘못된 시작'}});drain();const failed=messages.at(-1);
  assert.equal(failed.type,'error');assert.equal(failed.samples.length,0);assert.equal(failed.allSamples.length,0);assert.equal(failed.steps,0);
  c.onmessage({data:{type:'run',code:examples[0].code}});drain();
  assert.deepStrictEqual(messages.at(-1).state,first.state);assert.deepStrictEqual(messages.at(-1).allSamples,first.allSamples);
});
check('Same code run again draws a new random seed; first run keeps the written seed',()=>{
  const queue=[],messages=[],c=vm.createContext({console,performance,setTimeout:fn=>queue.push(fn),postMessage:m=>messages.push(structuredClone(m))});c.self=c;vm.runInContext(source,c);
  const drain=()=>{let n=0;while(queue.length){queue.shift()();assert(++n<100000);}};
  c.onmessage({data:{type:'init',data:D}});const code=examples[0].code;
  c.onmessage({data:{type:'run',code}});drain();const first=messages.at(-1);assert.deepStrictEqual(first.seeds,[7]);
  c.onmessage({data:{type:'run',code,repeat:true}});drain();const again=messages.at(-1);assert.notEqual(again.seeds[0],7);assert.equal(again.state.seed,again.seeds[0]);
  c.onmessage({data:{type:'run',code}});drain();assert.deepStrictEqual(messages.at(-1).state,first.state);
});
const program=commands=>'나는 동현이냐?\n'+commands.flatMap(a=>a.map(n=>'뿡뿡 '+expression(n)+'~뿡뿡뿡')).join('\n')+'\n동현이구나';
function execute(code,stop=false){
  let q=[],messages=[],loops=0;
  const c=vm.createContext({console,performance,setTimeout:fn=>q.push(fn),postMessage:m=>messages.push(structuredClone(m))});c.self=c;vm.runInContext(source,c);
  c.onmessage({data:{type:'init',data:D}});c.onmessage({data:{type:'run',code}});if(stop)c.onmessage({data:{type:'halt'}});
  while(q.length){q.shift()();assert(++loops<100000,'loop bound');}
  return {last:messages.at(-1),messages};
}
check('279 neurons and declared undirected layer counts',()=>{assert.equal(D.nodes.length,279);assert.equal(new Set(D.nodes).size,279);assert.deepEqual(D.layers.map(l=>l.edges.length),[517,888,1703]);for(const l of D.layers){const seen=new Set();for(const [a,b]of l.edges){assert(a>=0&&b<279&&a<=b);assert(!seen.has(a+','+b));seen.add(a+','+b);}}});
check('Raw rows match every transformed edge',()=>{
  const raw=fs.readFileSync(path.join(__dirname,'../data/raw/celegans_connectome_multiplex.edges'),'utf8');
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),D.source.rawSha256);
  const sets=[new Set(),new Set(),new Set()];for(const line of raw.trim().split(/\r?\n/)){const [l,a,b,w]=line.split(/\s+/).map(Number);assert.equal(w,1);sets[l-1].add((Math.min(a,b)-1)+','+(Math.max(a,b)-1));}
  for(let i=0;i<3;i++)assert.deepEqual([...sets[i]].sort(),D.layers[i].edges.map(e=>e.join(',')).sort());
});
check('Licenses and machine-readable provenance present',()=>{assert.equal(D.source.license,'ODbL-1.0');assert.equal(D.source.contentsLicense,'DbCL-1.0');assert(D.source.notice.includes('CoMuNeLab'));});
check('No stimulus gives zero activation',()=>{const b=new WormCircuit(D);for(let i=0;i<500;i++)b.step(.01);assert(b.x.every(x=>x===0));});
function peak(position,power=.5,gain=1){const b=new WormCircuit(D);b.mecGain=gain;const out={reverse:0,forward:0,harsh:0};for(let t=0;t<300;t++){const r=b.step(.01,t<20?{position,power}:null);for(const k in out)out[k]=Math.max(out[k],r[k]);}return out;}
check('Anterior touch favours reversal; posterior favours forward',()=>{const a=peak(.2),p=peak(.8);assert(a.reverse>.05&&a.reverse>a.forward*5);assert(p.forward>.08&&p.forward>p.reverse*5);});
check('Strong body touch recruits high-threshold channel',()=>assert(peak(.58,.9).harsh>peak(.58,.4).harsh*10));
check('MEC input zero removes low-strength touch response',()=>{assert.deepEqual(peak(.2,.45,0),{reverse:0,forward:0,harsh:0});});
check('All activations remain finite and bounded',()=>{const b=new WormCircuit(D);for(let i=0;i<4000;i++)b.step(.01,{power:1,position:(i%100)/100});assert(b.x.every(x=>Number.isFinite(x)&&x>=0&&x<=1));});
const runs={};
for(const e of examples)check('Donghyun example '+e.id,()=>{const r=execute(e.code);assert.equal(r.last.type,'done',JSON.stringify(r.last));runs[e.id]=r.last;});
check('Blank contains no commands, elapsed time, contact or activation',()=>{const r=runs.blank;assert.equal(r.state.time,0);assert.equal(r.state.hits,0);assert(r.state.q.every(x=>x===0));assert.equal(r.state.knockback,0);assert.equal(r.allSamples.length,0);assert.equal(examples.length,23);assert.equal(examples.at(-1).id,'blank');});
check('Each demonstration contains real contact events',()=>{for(const [id,r]of Object.entries(runs))if(id!=='blank')assert(r.state.hits>=2,id);});
check('Six-hit combination alternates right and left',()=>{const r=execute(examples.find(e=>e.id==='onetwo').code);const seq=[];let last=0;for(const m of r.messages)if(m.state.hits>last){last=m.state.hits;seq.push(m.state.action.hand);}assert.deepEqual(seq,[1,2,1,2,1,2]);assert.equal(r.last.state.hits,6);assert(r.last.state.tags.length===1);});
check('Same seed, same exact sample trace',()=>assert.deepEqual(execute(examples[0].code).last.allSamples,runs.jab.allSamples));
check('Hand changes the gesture, not the same neural input',()=>{const a=execute(program([[1,7],[2,1,1,45,20],[3,1000]])).last,b=execute(program([[1,7],[2,1,2,45,20],[3,1000]])).last;assert.deepEqual(a.allSamples,b.allSamples);});
const compare=(power,block=0)=>execute(program([[1,7],...(block?[[4,1,1]]:[]),[2,1,1,power,20],[3,1500]])).last;
check('Output block reduces reflex but preserves mechanical knockback',()=>{const a=compare(45),b=compare(45,1);const pk=(r,k)=>Math.max(...r.allSamples.map(s=>s[k]));assert(pk(b,'reverse')<pk(a,'reverse')*.1);assert.equal(Math.min(...a.allSamples.map(s=>s.knockback)),Math.min(...b.allSamples.map(s=>s.knockback)));});
check('Higher power produces greater knockback and cartoon effects',()=>{const a=compare(25),b=compare(90);assert(Math.min(...b.allSamples.map(s=>s.knockback))<Math.min(...a.allSamples.map(s=>s.knockback))*2);assert(Math.max(...b.allSamples.map(s=>s.theatrics))>Math.max(...a.allSamples.map(s=>s.theatrics))*2);});
check('0-power attack has no impulse or neural response',()=>{const r=compare(0);assert(r.allSamples.every(s=>s.impulse===0&&s.active===0&&s.knockback===0));});
check('Donghyun stop freezes the simulation',()=>{const r=execute(examples[0].code,true);assert.equal(r.last.type,'halted');assert.equal(r.messages.filter(m=>m.type==='halted').length,1);});
for(const [name,code]of [
  ['invalid start','안녕\n동현이구나'],['missing arguments','나는 동현이냐?\n뿡뿡 도오옹~뿡뿡뿡\n동현이구나'],
  ['unknown opcode',program([[99]])],['invalid hand',program([[2,1,3,40,20]])],['invalid strength',program([[2,1,1,101,20]])],
  ['invalid location',program([[2,1,1,40,0]])],['empty queue','나는 동현이냐?\n동현아 꽥꽥\n동현이구나'],
  ['invalid wait',program([[3,21]])],['infinite loop','나는 동현이냐?\n신중동역 도오옹\n동현이구나'],
  ['60s limit',program(Array(7).fill([3,10000]))]
])check('Reject '+name,()=>assert.equal(execute(code).last.type,'error'));
const summary={tests:total,data:D.counts,examples:Object.fromEntries(Object.entries(runs).map(([id,r])=>[id,{time:r.state.time,hits:r.state.hits,maxReverse:Math.max(...r.allSamples.map(s=>s.reverse)),maxForward:Math.max(...r.allSamples.map(s=>s.forward)),minKnockback:Math.min(...r.allSamples.map(s=>s.knockback))}]))};
fs.writeFileSync(path.join(__dirname,'core-results.json'),JSON.stringify(summary,null,2));console.log('CORE TOTAL',total);
