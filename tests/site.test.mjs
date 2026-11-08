import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const get=p=>readFileSync(new URL(p,root),'utf8');
const d=JSON.parse(get('data/catalog.json'));
test('registry record counts and unique IDs',()=>{
  for(const [key,n] of [['ontologies',22],['equations',22],['interfaces',4],['obligations',9],['sources',12],['quantities',17],['findings',40]])assert.equal(d[key].length,n,key);
  const ids=new Set();
  for(const key of ['ontologies','equations','interfaces','obligations','sources'])for(const r of d[key]){assert.ok(!ids.has(r.id),'duplicate ID '+r.id);ids.add(r.id);}
});
test('finding counts are accurate',()=>{
  const actual={PASS:0,FAIL:0,UNRESOLVED:0};
  for(const f of d.findings){assert.ok(Object.hasOwn(actual,f.outcome));actual[f.outcome]++;}
  assert.deepEqual(actual,d.counts);
  assert.deepEqual(actual,{PASS:5,FAIL:0,UNRESOLVED:35});
});
test('unproven bridges and source snapshots are not promoted',()=>{
  assert.ok(d.interfaces.every(x=>x.status==='UNRESOLVED'));
  assert.ok(d.sources.every(x=>x.pinned===false));
  assert.equal(d.sources.filter(x=>x.inspection.startsWith('README')).length,4);
});
test('equation gates are illustrative and linked to sectors',()=>{
  assert.equal(d.equations.filter(e=>e.dimensionGate==='PASS').length,4);
  const ids=new Set(d.ontologies.map(o=>o.id));
  for(const e of d.equations){assert.ok(ids.has(e.ontology));if(e.dimensionGate==='PASS')assert.ok(e.latex);}
});
test('website assets, navigation and Unity references exist',()=>{
  for(const path of ['index.html','assets/style.css','assets/app.js','data/catalog.json','favicon.svg','UNITY.md','SCIENTIFIC_BOUNDARIES.md'])assert.equal(existsSync(new URL(path,root)),true,path);
  const html=get('index.html');
  assert.match(html,/<title>Observe Unity/);
  for(const id of ['mission','atlas','equations','bridges','evidence','unity','sources','quantity-grid','ledger-list'])assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/research\/moc-001\/UNITY_APPENDIX.md/);
  assert.match(html,/No EFMW-specific physical effect/);
});
