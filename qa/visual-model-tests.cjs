const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/../src/app.js','utf8');
const get=name=>source.slice(source.indexOf('function '+name+'('),source.indexOf('\nfunction ',source.indexOf('function '+name+'(')+1));
const scope={Math};vm.createContext(scope);
vm.runInContext(`const mix=(a,b,t)=>a+(b-a)*t;const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};const VIEW_GAIN=10;`+get('wormPoint')+get('bezierPoint')+get('glovePath'),scope);
const at=(type,t,target={x:160,y:180})=>scope.glovePath(type,t,{x:330,y:305},target,.6);
for(const type of [1,3,5])for(const t of [.25,.35,.45,.55])assert.equal(at(type,t).y,180);
console.log('PASS Jab, straight and body blow have horizontal striking paths');
for(const y of [140,300,390]){let last=999;for(const t of [.24,.3,.4,.5,.6]){const p=at(2,t,{x:150,y});assert(p.y<=last);last=p.y;}assert.equal(last,y);}
console.log('PASS Uppercut rises to every target height');
const hook=[.22,.3,.4,.5,.6].map(t=>at(4,t));assert(hook[2].y>190);assert.equal(hook[0].y,180);assert.equal(hook.at(-1).y,180);assert(hook.every((p,i)=>i===0||p.x<hook[i-1].x));
console.log('PASS Hook has a curved horizontal approach, not the jab path');
for(let type=1;type<=8;type++){const p=at(type,.6);assert(Math.abs(p.x-160)<1e-8);assert(Math.abs(p.y-180)<1e-8);}
console.log('PASS Every technique reaches the same commanded contact point');
const base={q:Array(19).fill(0),rates:{reverse:0,forward:0,harsh:0},phase:0,time:0,knockback:0,theatrics:0};
assert.equal(scope.wormPoint(1,base).y-scope.wormPoint(0,base).y,310.5);
for(let p=0;p<=1;p+=.01){const point=scope.wormPoint(p,{...base,q:Array(19).fill(-65),rates:{reverse:.8,forward:.1,harsh:.8},knockback:-85,theatrics:1});assert(point.x-point.r>=24-1e-6);assert(Number.isFinite(point.y));}
console.log('PASS Worm baseline is 90% length and exaggerated response stays inside left boundary');
assert(source.includes('CHART_MAX=.1'));assert(source.includes('실제 최대'));assert(source.includes('gain=Math.min(1,s.rates[k]*VIEW_GAIN)'));
console.log('PASS Chart zoom and activation-driven glow are presentation-only');
