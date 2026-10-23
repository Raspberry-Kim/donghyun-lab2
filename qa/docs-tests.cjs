const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..'),{renderMarkdown,renderReferenceDocuments,escapeHTML}=require('../render-docs.cjs'),{lexer}=require('../vendor/marked.cjs');
let count=0;function check(n,f){f();count++;console.log('PASS',n);}
for(const name of ['PROVENANCE.md','CREDITS.md'])check('All blocks and real bold: '+name,()=>{
  const text=fs.readFileSync(path.join(root,name),'utf8'),html=renderMarkdown(text);
  assert(!html.includes('**'));assert(html.includes('<strong>'));
  for(const block of lexer(text).filter(x=>x.type!=='space'))assert(html.includes(renderMarkdown(block.raw).trim()),block.type);
});
check('All licenses preserved',()=>{const html=renderReferenceDocuments(root);for(const f of fs.readdirSync(path.join(root,'licenses')))if(f!=='MARKED-MIT.txt')assert(html.includes(escapeHTML(fs.readFileSync(path.join(root,'licenses',f),'utf8'))),f);});
check('No unsafe raw HTML or script URLs',()=>{const h=renderMarkdown('<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)');assert(!h.includes('<script>'));assert(!h.includes('href="javascript:'));});
check('ODbL links and data download are discoverable',()=>{const html=fs.readFileSync(path.join(root,'src/index.html'),'utf8');assert(html.includes('id="data-download"'));assert(fs.readFileSync(path.join(root,'CREDITS.md'),'utf8').includes('https://opendatacommons.org/licenses/odbl/1-0/'));});
check('Only code-driven simulation controls',()=>{const html=fs.readFileSync(path.join(root,'src/index.html'),'utf8');assert(!/type="range"/.test(html));assert(!/onpointerdown|onmousedown|ontouchstart/.test(html));});
console.log('DOCUMENT TOTAL',count);
