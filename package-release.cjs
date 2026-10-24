const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname,target=path.join(root,'release/donghyun-lab2');
fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
const names=['index.html','README.md','SPEC.md','PROVENANCE.md','CREDITS.md','LICENSE','CHANGELOG.md','package.json','build.cjs','render-docs.cjs','package-release.cjs','.gitignore','.nojekyll','src','data','tools','examples','fonts','licenses','vendor'];
for(const name of names)fs.cpSync(path.join(root,name),path.join(target,name),{recursive:true});
fs.mkdirSync(path.join(target,'qa'),{recursive:true});
for(const name of ['core-tests.cjs','docs-tests.cjs','visual-model-tests.cjs','core-results.json','TESTING.md','browser-results.json']){
  const f=path.join(root,'qa',name);if(fs.existsSync(f))fs.copyFileSync(f,path.join(target,'qa',name));
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(target).filter(f=>!f.endsWith('SHA256SUMS.txt'));
fs.writeFileSync(path.join(target,'SHA256SUMS.txt'),files.map(f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')+'  '+path.relative(target,f)).join('\n')+'\n');
console.log(JSON.stringify({target,files:files.length+1,htmlBytes:fs.statSync(path.join(target,'index.html')).size}));
