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

test('scope denominators and EFMW boundary are exact',()=>{
  const scope=d.evidence_scope;
  assert.equal(scope.structural_pass_findings,5);
  assert.equal(scope.total_gate_findings,d.findings.length);
  assert.equal(scope.equation_records,d.equations.length);
  assert.equal(scope.dimensional_pass_equation_records,4);
  assert.equal(scope.established_reference_dimensional_pass,2);
  assert.equal(scope.illustrative_dimensional_pass,2);
  assert.equal(scope.registry_pass_findings,1);
  assert.equal(scope.efmw_specific_pass,0);
  const passing=d.equations.filter(e=>e.dimensionGate==='PASS');
  assert.equal(passing.filter(e=>e.status==='established').length,2);
  assert.equal(passing.filter(e=>e.status==='placeholder').length,2);
  assert.ok(passing.every(e=>!e.ontology.includes('efmw')));
  const html=get('index.html');
  for(const id of ['stat-total','stat-equation-pass','stat-equation-total','stat-efmw-pass','gate-breakdown'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/Zero EFMW-specific PASS/);
});
test('source pinning is first and remains unresolved',()=>{
  assert.equal(d.obligations[0].id,'ob_pin_sources');
  assert.equal(d.obligations[0].queue_rank,1);
  assert.equal(d.obligations[0].status,'UNRESOLVED');
  assert.ok(d.obligations.every((o,i)=>o.queue_rank===i+1));
  const html=get('index.html');
  assert.match(html,/SOURCE PINS FIRST/);
  assert.match(html,/ob_pin_sources/);
});
