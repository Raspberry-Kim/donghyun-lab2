const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/../src/app.js','utf8');
const get=name=>source.slice(source.indexOf('function '+name+'('),source.indexOf('\nfunction ',source.indexOf('function '+name+'(')+1));
const scope={Math};vm.createContext(scope);
vm.runInContext(`const mix=(a,b,t)=>a+(b-a)*t;const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};const VIEW_GAIN=10;`+get('wormPoint')+get('bezierPoint')+get('glovePath'),scope);
const at=(type,t,target={x:160,y:180})=>scope.glovePath(type,t,{x:330,y:305},target,.6);
for(const type of [1,3])for(const t of [.25,.35,.45,.55])assert.equal(at(type,t).y,180);
assert(at(1,.75).x===330);assert(at(3,.75).x<160);assert(at(3,.85).x<160);
console.log('PASS Jab snaps back while straight drives horizontally and holds');
for(const y of [140,300,390]){let last=999;for(const t of [.24,.3,.4,.5,.6]){const p=at(2,t,{x:150,y});assert(p.y<=last);last=p.y;}assert.equal(last,y);}
console.log('PASS Uppercut rises to every target height');
const hook=[.22,.3,.4,.5,.6].map(t=>at(4,t));assert(hook[0].y<180);assert(hook.at(-2).y<180);assert.equal(hook.at(-1).y,180);assert(hook.every((p,i)=>i===0||p.x<hook[i-1].x));assert(at(4,.8).x<160);
console.log('PASS Hook curves down toward the target and stays in contact');
assert(at(5,.22).y>180);assert(at(5,.8).x<160);assert(at(6,.22).x>at(4,.22).x);assert(at(6,.4).y<at(6,.22).y);
console.log('PASS Body blow dips and holds; swing follows a wider extended-arm arc');
for(let type=1;type<=8;type++){const p=at(type,.6);assert(Math.abs(p.x-160)<1e-8);assert(Math.abs(p.y-180)<1e-8);}
console.log('PASS Every technique reaches the same commanded contact point');
const base={q:Array(19).fill(0),rates:{reverse:0,forward:0,harsh:0},phase:0,time:0,knockback:0,theatrics:0};
assert.equal(scope.wormPoint(1,base).y-scope.wormPoint(0,base).y,310.5);
for(let p=0;p<=1;p+=.01){const point=scope.wormPoint(p,{...base,q:Array(19).fill(-65),rates:{reverse:.8,forward:.1,harsh:.8},knockback:-85,theatrics:1});assert(point.x-point.r>=24-1e-6);assert(Number.isFinite(point.y));}
console.log('PASS Worm baseline is 90% length and exaggerated response stays inside left boundary');
vm.runInContext(get('chartRange'),scope);
assert.equal(scope.chartRange(0),.1);assert.equal(scope.chartRange(.02),.1);assert.equal(scope.chartRange(.481),.6);assert.equal(scope.chartRange(.559),.8);assert.equal(scope.chartRange(1),1.2);
console.log('PASS Automatic Y range covers low and high neural peaks');
let previous=.1;for(let i=0;i<=1000;i++){const p=i/1000,r=scope.chartRange(p);assert(r>=p*1.15-1e-12);assert(r>=previous);previous=r;}
console.log('PASS Every valid activation has at least 15% headroom and monotonic ranges');
assert(source.includes('h=w<500?340:440'));assert(!source.includes('CHART_MAX'));assert(source.includes("chartPeak=0;drawChart()"));
console.log('PASS Taller chart, no fixed cutoff, and new-run peak reset');
assert(source.includes('gain=Math.min(1,s.rates[k]*VIEW_GAIN)'));
console.log('PASS Activation-driven glow remains presentation-only');
const worker=fs.readFileSync(__dirname+'/../src/worker.js','utf8');assert(worker.includes('PLAYBACK_STRETCH=3'));assert(worker.includes('20*PLAYBACK_STRETCH'));
console.log('PASS Threefold wall-clock playback does not rescale neural integration');
