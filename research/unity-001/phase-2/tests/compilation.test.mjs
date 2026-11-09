import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {compile,compileRecords,loadInputs,infer,parseCSV,gitBlob,symbolsOf} from '../compiler.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const data=loadInputs();
const spec=Object.fromEntries(data.types.symbols.map(x=>[x.id,x]));
test('frozen 717 CSV records and four priority source trees',()=>{
  assert.equal(data.rows.length,717);
  assert.equal(new Set(data.rows.map(x=>x.record_id)).size,717);
  assert.equal(data.lifts.lifts.length,14);
  assert.equal(new Set(data.lifts.lifts.map(x=>x.record_id)).size,14);
});
test('ingested coverage is explicit, not inflated',()=>{
  const r=compile();assert.equal(r.report.source_records,717);
  assert.equal(r.report.typed_shape_dimension_pass,14);
  assert.equal(r.report.unparsed_unresolved,703);
  assert.equal(r.report.lean_kernel_proofs_replayed,0);
  assert.equal(r.report.efmw_specific_physical_pass,0);
  assert.equal(r.index.reviewed_lifts.length,14);
  assert.equal(r.index.records.filter(x=>x.typecheck==='TYPECHECK_PASS').length,14);
  assert.equal(r.index.records.filter(x=>x.typecheck==='UNRESOLVED').length,703);
});
test('all manual AST source strings match pinned input exactly',()=>{
  const map=new Map(data.rows.map(x=>[x.record_id,x]));
  for(const lift of data.lifts.lifts){
    const r=map.get(lift.record_id);
    assert.equal(lift.expected_statement,r.original_statement);
    assert.equal(lift.original_blob_sha,r.original_blob_sha);
    assert.equal(lift.source_line,Number(r.source_line));
  }
});
test('compiler rejects source drift, duplicate lift and missing symbols',()=>{
  const corrupted=structuredClone(data.lifts);
  corrupted.lifts[0].expected_statement+=' CHANGED';
  assert.throws(()=>compileRecords(data.rows,corrupted,data.types,data.spec),/SOURCE_DRIFT/);
  const duplicate=structuredClone(data.lifts);duplicate.lifts.push(duplicate.lifts[0]);
  assert.throws(()=>compileRecords(data.rows,duplicate,data.types,data.spec),/Duplicate lift/);
  const missing=structuredClone(data.lifts);missing.lifts[0].ast={op:'eq',a:{op:'sym',name:'unknown_symbol'},b:{op:'zero'}};
  assert.throws(()=>compileRecords(data.rows,missing,data.types,data.spec),/Unknown symbol/);
});
test('units, tensor rank, and invalid tensor multiplication are enforced',()=>{
  const s=n=>({op:'sym',name:n});
  assert.throws(()=>infer({op:'add',args:[s('witd:q'),s('witd:p')]},spec),/TYPE_MISMATCH/);
  assert.throws(()=>infer({op:'add',args:[s('witd:q'),s('witd:I_ab')]},spec),/TYPE_MISMATCH/);
  assert.throws(()=>infer({op:'mul',args:[s('witd:R_ab'),s('witd:I_ab')]},spec),/Tensor products/);
  assert.throws(()=>infer({op:'sym',name:'untyped'},spec),/Unknown symbol/);
  const a=infer({op:'eq',a:s('witd:I_ab'),b:{op:'add',args:[s('witd:R_ab'),s('witd:T_ab_q')]}},spec);
  assert.equal(a.type.sort,'tensor2cov');assert.deepEqual(a.type.dim,{L:-2,Q:2});
});
test('different ontologies cannot be joined without a bridge',()=>{
  const mixed=structuredClone(data.lifts);
  mixed.lifts[0].ast={op:'eq',a:{op:'sym',name:'canonical:golden_phi'},b:{op:'sym',name:'sm:lambda'}};
  assert.throws(()=>compileRecords(data.rows,mixed,data.types,data.spec),/CROSS_ONTOLOGY_BRIDGE_UNJUSTIFIED/);
});
test('source parsing rejects malformed CSV and fabricated rows',()=>{
  assert.throws(()=>parseCSV('record_id,original_statement\n"x'),/Unterminated CSV/);
  const duplicate=[...data.rows,data.rows[0]];
  assert.throws(()=>compileRecords(duplicate,data.lifts,data.types,data.spec),/Duplicate or empty source record/);
});
test('known mismatches are retained and proof status is unresolved',()=>{
  const r=compile();
  assert.equal(r.conflicts.conflicts.length,10);
  assert.ok(r.conflicts.conflicts.some(x=>x.kind==='candidate-scalar-sign'&&x.status==='REPORTED_SOURCE_CONFLICT'));
  assert.ok(r.conflicts.conflicts.some(x=>x.kind==='wave-operator-sign'));
  assert.ok(r.conflicts.conflicts.every(x=>x.adjudication==='REQUIRES_EXPLICIT_BRIDGE_OR_INDEPENDENT_PROOF'));
  assert.equal(r.graph.edges.every(e=>e.relationship==='USES_TYPED_SYMBOL_NOT_PHYSICAL_DEPENDENCY'),true);
  assert.equal(r.report.literal_source_failures_retained.FAIL_SIGN,360);
  assert.equal(r.report.literal_source_failures_retained.FAIL_NEUTRAL_SCALAR_CURRENT,88);
});
