/* Donghyunpa qualitative activation model. All values are dimensionless.
 * The source graph is undirected/unweighted. These dynamics and reflex gains
 * are explicit educational assumptions, not reconstructed electrophysiology. */
function random(seed){let x=seed>>>0;return()=>((x=(Math.imul(1664525,x)+1013904223)>>>0)/4294967296);}
class WormCircuit{
  constructor(data){
    this.data=data;this.n=data.nodes.length;this.groups={};
    for(const [k,names]of Object.entries(data.groups))this.groups[k]=names.map(n=>data.nodes.indexOf(n));
    this.syn=[];this.gap=[];this.norm=new Float64Array(this.n).fill(1);
    const member=(g,i)=>this.groups[g].includes(i);
    // A directed functional prior is applied only when an undirected source edge exists.
    // Anterior touch favours reversal and inhibits forward command activity;
    // posterior touch favours forward activity and suppresses reversal.
    const weight=(a,b)=>{
      if(member('anterior',a)&&member('reverse',b))return .9;
      if(member('anterior',a)&&member('forward',b))return -1.1;
      if(member('posterior',a)&&member('forward',b))return .9;
      if(member('posterior',a)&&member('reverse',b))return -1.1;
      if(member('harshHead',a)&&member('reverse',b))return .7;
      if(member('harshBody',a)&&(member('reverse',b)||member('forward',b)))return .45;
      return .008;
    };
    for(const [a,b]of data.layers[0].edges){
      if(a===b)continue; // A self electrical term is identically zero.
      const nm=[data.nodes[a],data.nodes[b]].join('/');
      const reflex=(/AVM/.test(nm)&&/AVD|ALM/.test(nm))||(/PLM/.test(nm)&&/PVC/.test(nm));
      this.gap.push([a,b,reflex?1.2:.018]);
    }
    for(const layer of data.layers.slice(1))for(const [a,b]of layer.edges){
      for(const [pre,post]of [[a,b],[b,a]]){const w=weight(pre,post);this.syn.push([pre,post,w]);this.norm[post]+=Math.abs(w);}
    }
    this.reset(7);
  }
  reset(seed){
    this.rng=random(seed);this.x=new Float64Array(this.n);this.next=new Float64Array(this.n);this.drive=new Float64Array(this.n);this.blocked=new Uint8Array(this.n);
    this.adaptation=new Float64Array(4);this.mecGain=1;this.last={anterior:0,posterior:0,harsh:0,reverse:0,forward:0,active:0};
  }
  setBlock(group,value){
    const names=[null,['anterior'],['posterior'],['reverse'],['forward'],['harshHead','harshBody']][group];
    for(const g of names)for(const i of this.groups[g])this.blocked[i]=value;
  }
  mean(name){const g=this.groups[name];return g.reduce((s,i)=>s+(this.blocked[i]?0:this.x[i]),0)/g.length;}
  step(dt,touch=null){
    const p=touch?.position??.5,power=touch?.power??0;
    const front=Math.exp(-Math.pow((p-.22)/.26,2)),back=Math.exp(-Math.pow((p-.8)/.24,2));
    const harsh=Math.max(0,(power-.6)/.4),head=Math.exp(-Math.pow((p-.15)/.34,2));
    const levels=[power*front*this.mecGain,power*back*this.mecGain,harsh*head,harsh*(1-.55*head)];
    this.drive.fill(0);
    for(let k=0;k<4;k++){
      this.adaptation[k]+=dt*(levels[k]*1.3*(1-this.adaptation[k])-this.adaptation[k]/1.8);
      const input=levels[k]*(1-.65*this.adaptation[k]);
      for(const i of this.groups[['anterior','posterior','harshHead','harshBody'][k]])this.drive[i]+=input*3.5;
    }
    for(const [a,b,w]of this.syn)if(!this.blocked[a])this.drive[b]+=w*this.x[a]/this.norm[b];
    for(const [a,b,g]of this.gap){
      const xa=this.blocked[a]?0:this.x[a],xb=this.blocked[b]?0:this.x[b];
      this.drive[a]+=g*(xb-this.x[a]);this.drive[b]+=g*(xa-this.x[b]);
    }
    const alpha=1-Math.exp(-dt/.13);
    let active=0;
    for(let i=0;i<this.n;i++){const target=Math.tanh(Math.max(0,this.drive[i]));this.next[i]=Math.max(0,Math.min(1,this.x[i]+alpha*(target-this.x[i])));if(!Number.isFinite(this.next[i]))throw Error('회로 수치 오류');if(this.next[i]>.005)active++;}
    [this.x,this.next]=[this.next,this.x];
    this.last={anterior:this.mean('anterior'),posterior:this.mean('posterior'),harsh:(this.mean('harshHead')+this.mean('harshBody'))/2,reverse:this.mean('reverse'),forward:this.mean('forward'),active};
    return this.last;
  }
}
if(typeof module!=='undefined')module.exports={WormCircuit,random};
