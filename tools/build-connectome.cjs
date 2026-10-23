const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.join(__dirname,'..'),raw=path.join(root,'data','raw');
const names=fs.readFileSync(path.join(raw,'celegans_connectome_nodes.txt'),'utf8').trim().split(/\r?\n/).slice(1).map(l=>l.trim().split(/\s+/)[1]);
const lines=fs.readFileSync(path.join(raw,'celegans_connectome_multiplex.edges'),'utf8').trim().split(/\r?\n/);
const records=lines.map(l=>l.trim().split(/\s+/).map(Number));
if(names.length!==279||records.length!==5863)throw Error('Unexpected upstream dataset dimensions');
const maps=[new Map(),new Map(),new Map()];
for(const [layer,a,b,w]of records){
  if(layer<1||layer>3||a<1||a>279||b<1||b>279||w!==1)throw Error('Invalid source record');
  const i=Math.min(a,b)-1,j=Math.max(a,b)-1,key=i+','+j;
  maps[layer-1].set(key,[i,j]);
}
const data={
  schema:'donghyunpa-connectome-1',
  source:{name:'CoMuNeLab C.ELEGANS MULTIPLEX CONNECTOME',url:'https://github.com/CoMuNeLab/C-elegans-Multiplex-Connectome',commit:'9d6d48af4eb6acef31ad9999e22fbd27c2ce210b',license:'ODbL-1.0',contentsLicense:'DbCL-1.0',
    notice:'Contains information from CoMuNeLab C.ELEGANS MULTIPLEX CONNECTOME, available under ODbL 1.0. This reindexed, deduplicated database is also ODbL 1.0; individual database contents are under DbCL 1.0.',
    licenseUrl:'https://opendatacommons.org/licenses/odbl/1-0/',rawSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(raw,'celegans_connectome_multiplex.edges'))).digest('hex')},
  interpretation:'The source README declares all three layers undirected and unweighted. Reciprocal/duplicate records collapse to one unordered edge per layer. Direction and synaptic strength are NOT reconstructed from row order or duplicate counts.',
  attribution:{
    requestedCitations:[
      {text:'Chen BL, Hall DH, Chklovskii DB. Wiring optimization can relate neuronal structure and function. PNAS 103(12), 4723–4728 (2006).',url:'http://www.pnas.org/content/103/12/4723.abstract'},
      {text:'De Domenico M, Porter MA, Arenas A. MuxViz: A Tool for Multilayer Analysis and Visualization of Networks. Journal of Complex Networks 3(2), 159–176 (2015).',url:'http://comnet.oxfordjournals.org/content/3/2/159'}
    ],
    acknowledgments:'Original dataset: European Commission FET-Proactive project PLEXMATH (Grant No. 317614); developed at Alephsys Lab. Original notice preserved in data/SOURCE.md.',
    contentsLicenseUrl:'https://opendatacommons.org/licenses/dbcl/1-0/'
  },
  nodes:names,layers:maps.map((m,i)=>({name:['ElectrJ','MonoSyn','PolySyn'][i],edges:[...m.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1])})),
  counts:{neurons:names.length,sourceRecords:records.length,sourceLayerRecords:[1,2,3].map(k=>records.filter(r=>r[0]===k).length),uniqueLayerEdges:maps.map(m=>m.size),selfEdges:maps.map(m=>[...m.values()].filter(([a,b])=>a===b).length)},
  groups:{
    anterior:['ALML','ALMR','AVM'],posterior:['PLML','PLMR'],pvm:['PVM'],harshHead:['FLPL','FLPR'],harshBody:['PVDL','PVDR'],
    reverse:['AVAL','AVAR','AVDL','AVDR','AVEL','AVER'],forward:['AVBL','AVBR','PVCL','PVCR']
  }
};
for(const g of Object.values(data.groups))for(const n of g)if(!names.includes(n))throw Error('Missing required neuron '+n);
fs.writeFileSync(path.join(root,'data','connectome.json'),JSON.stringify(data));
console.log(JSON.stringify(data.counts));
