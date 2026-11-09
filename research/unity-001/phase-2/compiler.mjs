// UNITY-001 Phase 2: conservative, source-attested static compilation.
// Bounded typed ASTs are curated and must match byte-for-byte source statements.
// No Lean kernel proof, physics verification, gauge/covariance theorem, or
// cross-ontology equivalence is claimed by a TYPECHECK_PASS outcome.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT=dirname(fileURLToPath(import.meta.url));
export const input=(name)=>resolve(ROOT,name);
export function parseCSV(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){
      if(c==='"' && text[i+1]==='"'){field+='"';i++;}
      else if(c==='"')quoted=false;
      else field+=c;
    }else if(c==='"')quoted=true;
    else if(c===','){row.push(field);field='';}
    else if(c==='\n'){row.push(field.replace(/\r$/,''));if(row.some(x=>x!==''))rows.push(row);row=[];field='';}
    else field+=c;
  }
  if(quoted)throw Error('Unterminated CSV quote');
  if(field!==''||row.length){row.push(field);rows.push(row);}
  const headers=rows.shift();
  if(!headers || new Set(headers).size!==headers.length)throw Error('Missing/duplicate CSV headers');
  const required=['record_id','original_repo','original_commit','original_path','original_blob_sha','source_line','original_statement','claim_class','literal_status'];
  for(const f of required)if(!headers.includes(f))throw Error('Missing CSV field '+f);
  return rows.map((cols,i)=>{
    if(cols.length!==headers.length)throw Error('CSV width mismatch row '+(i+2));
    return Object.fromEntries(headers.map((h,j)=>[h,cols[j]]));
  });
}
export function gitBlob(raw){
  const bytes=Buffer.isBuffer(raw)?raw:Buffer.from(raw,'utf8');
  return createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
}
const DIM=['L','T','M','Q'];
function dimension(raw={}){
  const out={};for(const k of DIM){const v=raw[k]??0;if(!Number.isInteger(v))throw Error('Noninteger dimension '+k);if(v!==0)out[k]=v;}
  for(const k of Object.keys(raw))if(!DIM.includes(k))throw Error('Unknown dimension '+k);
  return out;
}
const dimAdd=(a,b,scale=1)=>dimension(Object.fromEntries(DIM.map(k=>[k,(a[k]||0)+scale*(b[k]||0)])));
const dimMul=(a,n)=>dimension(Object.fromEntries(DIM.map(k=>[k,(a[k]||0)*n])));
const sameDim=(a,b)=>DIM.every(k=>(a[k]||0)===(b[k]||0));
const scalar=(dim={})=>({sort:'scalar',dim:dimension(dim)});
function sameType(a,b){return a.sort===b.sort && sameDim(a.dim,b.dim);}
function makeType(source){return {sort:source.sort,dim:dimension(source.dim)};}
function assertCompatible(a,b,context){
  if(!sameType(a,b))throw Error('TYPE_MISMATCH '+context+': '+JSON.stringify(a)+' versus '+JSON.stringify(b));
  return a;
}
export function infer(ast,symbolMap){
  if(!ast||typeof ast!=='object'||typeof ast.op!=='string')throw Error('Invalid AST node');
  switch(ast.op){
    case 'lit':{
      if(typeof ast.value!=='number'||!Number.isFinite(ast.value))throw Error('Invalid literal');
      return scalar();
    }
    case 'zero':return {sort:'zero',dim:{}};
    case 'sym':{
      const x=symbolMap[ast.name];if(!x)throw Error('Unknown symbol '+ast.name);
      return makeType(x);
    }
    case 'sqrt':{
      const a=infer(ast.a,symbolMap);
      if(a.sort!=='scalar')throw Error('Square-root requires scalar');
      if(DIM.some(k=>(a.dim[k]||0)%2!==0))throw Error('Fractional dimensions outside supported integer types');
      return scalar(dimMul(a.dim,0.5));
    }
    case 'pow':{
      const a=infer(ast.a,symbolMap);
      if(a.sort!=='scalar'||!Number.isInteger(ast.n)||ast.n<0)throw Error('Invalid scalar power');
      return scalar(dimMul(a.dim,ast.n));
    }
    case 'derivative':{
      const a=infer(ast.a,symbolMap);
      if(a.sort!=='scalar'||!['L','T'].includes(ast.coordinate)||![1,2].includes(ast.order))throw Error('Unsupported derivative');
      return scalar(dimAdd(a.dim,{[ast.coordinate]:ast.order},-1));
    }
    case 'add':{
      if(!Array.isArray(ast.args)||ast.args.length<2)throw Error('Add needs operands');
      const a=infer(ast.args[0],symbolMap);
      for(const b of ast.args.slice(1))assertCompatible(a,infer(b,symbolMap),'addition');
      return a;
    }
    case 'sub':return assertCompatible(infer(ast.a,symbolMap),infer(ast.b,symbolMap),'subtraction');
    case 'mul':{
      if(!Array.isArray(ast.args)||ast.args.length<2)throw Error('Mul needs operands');
      const args=ast.args.map(a=>infer(a,symbolMap));
      if(args.some(t=>t.sort==='zero'))throw Error('Use typed zero only as equation RHS');
      if(args.filter(t=>t.sort!=='scalar').length>1)throw Error('Tensor products require explicit index contraction');
      if(args.some(t=>!['scalar','tensor2cov'].includes(t.sort)))throw Error('Unsupported type');
      return{sort:args.find(t=>t.sort!=='scalar')?.sort||'scalar',dim:args.reduce((d,t)=>dimAdd(d,t.dim),{})};
    }
    case 'div':{
      const a=infer(ast.a,symbolMap),b=infer(ast.b,symbolMap);
      if(b.sort!=='scalar'||a.sort==='zero')throw Error('Division requires scalar denominator');
      return {sort:a.sort,dim:dimAdd(a.dim,b.dim,-1)};
    }
    case 'eq':{
      const a=infer(ast.a,symbolMap),b=infer(ast.b,symbolMap);
      if(a.sort==='zero'&&b.sort==='zero')throw Error('Zero=zero alone not a typed equation');
      return {sort:'proposition',type:a.sort==='zero'?b:b.sort==='zero'?a:assertCompatible(a,b,'equation')};
    }
    case 'chain':{
      if(!Array.isArray(ast.args)||ast.args.length<3)throw Error('Chain needs three expressions');
      const types=ast.args.map(e=>infer(e,symbolMap));
      types.slice(1).forEach(t=>assertCompatible(types[0],t,'chained equation'));
      return {sort:'proposition',type:types[0]};
    }
    default:throw Error('Unsupported AST operator: '+ast.op);
  }
}
export function symbolsOf(ast,out=new Set()){
  if(!ast||typeof ast!=='object')return out;
  if(ast.op==='sym'){out.add(ast.name);return out;}
  for(const key of ['a','b'])if(ast[key])symbolsOf(ast[key],out);
  if(Array.isArray(ast.args))for(const x of ast.args)symbolsOf(x,out);
  return out;
}
function distinctNamespaces(symbols){
  return new Set([...symbols].map(s=>s.split(':')[0]));
}
export function compileRecords(rows,lifts,typeSpec,sourceLock){
  const ids=new Set(),sourceRecords=[];
  for(const r of rows){
    if(!r.record_id||ids.has(r.record_id))throw Error('Duplicate or empty source record ID: '+r.record_id);
    ids.add(r.record_id);
    if(!/^[a-f0-9]{40}$/.test(r.original_blob_sha)||!/^[a-f0-9]{40}$/.test(r.original_commit)||!Number.isInteger(Number(r.source_line))||Number(r.source_line)<1||!r.original_statement)throw Error('Missing/invalid pinned record '+r.record_id);
    sourceRecords.push({record_id:r.record_id,original_repo:r.original_repo,original_commit:r.original_commit,original_path:r.original_path,original_blob_sha:r.original_blob_sha,source_line:Number(r.source_line),claim_class:r.claim_class,literal_status:r.literal_status,
      typecheck:'UNRESOLVED',typecheck_reason:'No curated exact-source AST / unsupported source syntax',physical_status:'UNRESOLVED',translation_review:'NOT_PROVIDED'});
  }
  const sym=Object.fromEntries(typeSpec.symbols.map(x=>[x.id,x]));
  if(new Set(typeSpec.symbols.map(x=>x.id)).size!==typeSpec.symbols.length)throw Error('Duplicate symbol IDs');
  const maps=new Map(sourceRecords.map(x=>[x.record_id,x]));
  const origin=new Map(rows.map(x=>[x.record_id,x]));
  const typed=[],edges=[],liftIds=new Set();
  for(const l of lifts.lifts){
    if(liftIds.has(l.record_id))throw Error('Duplicate lift '+l.record_id);
    liftIds.add(l.record_id);
    const record=origin.get(l.record_id);
    if(!record)throw Error('Unknown lifted record '+l.record_id);
    if(record.original_statement!==l.expected_statement || record.original_blob_sha!==l.original_blob_sha || Number(record.source_line)!==l.source_line)throw Error('SOURCE_DRIFT '+l.record_id);
    const type=infer(l.ast,sym);
    if(type.sort!=='proposition')throw Error('AST must be an equality: '+l.record_id);
    const used=symbolsOf(l.ast);
    if(distinctNamespaces(used).size!==1)throw Error('CROSS_ONTOLOGY_BRIDGE_UNJUSTIFIED '+l.record_id);
    const x=maps.get(l.record_id);
    Object.assign(x,{typecheck:'TYPECHECK_PASS',typecheck_reason:'Manually curated AST; shape and dimensions only',translation_review:'CURATED_NOT_INDEPENDENTLY_REVIEWED',sector:l.sector,signature:l.signature,limitations:l.limitations,type_inferred:type.type});
    typed.push({...x,original_statement:record.original_statement,ast:l.ast,symbols:[...used].sort(),source_attestation:'EXACT_STRING_AND_GIT_BLOB_MATCHED'});
    for(const id of used)edges.push({from:l.record_id,to:id,relationship:'USES_TYPED_SYMBOL_NOT_PHYSICAL_DEPENDENCY'});
  }
  const conflictDefs=[
    ['X-001','metric-signature','SM reference (+---) vs C1 candidate (-+++): require exact convention map',['E023-EFMW_Lagrangian','E025-EFMW_Lagrangian','E029-Standard_Model_Reduction'],'UNRESOLVED'],
    ['X-002','wave-operator-sign','Canonical ME-004 uses (+---); WITD-001 uses (-+++) and catalog operator opposite; no silent sign switch',['ME-004','E018-Information_Tensor'],'UNRESOLVED'],
    ['X-003','symbol-collision','φ in ME-041 is golden ratio, while φ in ME-004 is a wave field; separate namespaces are mandatory',['ME-041','ME-004'],'UNRESOLVED'],
    ['X-004','residual-versus-ricci','WITD R_ab is authored memory residual, not Ricci R_munu; ME-006 interpretation differs',['ME-006','E016-Information_Tensor','E017-Information_Tensor'],'UNRESOLVED'],
    ['X-005','candidate-scalar-sign','EFMW-Lagrangian source audit reports 360 FAIL_SIGN literal scalar rows; corrected action sign is a separate version',['E023-EFMW_Lagrangian'],'REPORTED_SOURCE_CONFLICT'],
    ['X-006','gauge-current','Source audit reports 88 FAIL_NEUTRAL_SCALAR_CURRENT and 2 UNDERDEFINED_CURRENT; C1 is source-free',['E024-EFMW_Lagrangian'],'REPORTED_SOURCE_CONFLICT'],
    ['X-007','gravitational-stress','45 literal UNDERDEFINED_STRESS rows require metric variation and source identification',['E025-EFMW_Lagrangian'],'UNRESOLVED'],
    ['X-008','memory-energy','WITD-002 reports storage/residual mismatch and two failed numerical gate groups; tensor conservation not established',['E016-Information_Tensor','E017-Information_Tensor','E020-Information_Tensor'],'UNRESOLVED'],
    ['X-009','reduction-claim','SM notation-level rewriting does not establish a parameter-free 39-strata physical model',['E027-Standard_Model_Reduction','E029-Standard_Model_Reduction'],'UNRESOLVED'],
    ['X-010','source-split','Geometry source-only observable blindness leaves nonzero κ observationally unidentified',['E002-Geometry','ME-007'],'UNRESOLVED']
  ];
  const conflicts=conflictDefs.map(([id,kind,description,records,status])=>({id,kind,description,source_record_ids:records,status,adjudication:'REQUIRES_EXPLICIT_BRIDGE_OR_INDEPENDENT_PROOF',detected_by:'PREDECLARED_SOURCE_AUDIT_NOT_AUTOMATED_THEOREM'}));
  for(const c of conflicts)for(const id of c.source_record_ids)if(!ids.has(id))throw Error('Unknown conflict source '+id);
  const classes={};for(const r of sourceRecords)classes[r.claim_class]=(classes[r.claim_class]||0)+1;
  const covered=sourceRecords.filter(x=>x.typecheck==='TYPECHECK_PASS').length;
  const report={
    schema:'unity-001-phase2-compile-v1',date:'2026-11-09',phase:'P2_TYPED_SOURCE_IMPORT',
    source_records:rows.length,source_references_attested:rows.length,
    typed_ast_proposed:lifts.lifts.length,typed_shape_dimension_pass:covered,
    unparsed_unresolved:rows.length-covered,compiler_type_failures:0,
    independent_ast_review:0,lean_kernel_proofs_replayed:0,
    efmw_specific_physical_pass:0,physical_unification:'UNRESOLVED',
    literal_source_failures_retained:{FAIL_SIGN:360,FAIL_NEUTRAL_SCALAR_CURRENT:88,UNDERDEFINED_CURRENT:2,UNDERDEFINED_STRESS:45,INDEX_REPAIR_REQUIRED:90},
    conflict_register_entries:conflicts.length,conflict_status:'10 REGISTERED, NONE ADJUDICATED',
    claim_boundary:'TYPECHECK_PASS applies only to the manually curated AST under declared type assumptions; raw source expressions were not generally parsed, not independently reviewed, and were not proved by Lean or observation. P2 complete-corpus gate remains UNRESOLVED.',
    source_class_counts:classes,
    upstream_archive_lock:sourceLock.phase1_csv_origin,
    replays:{static_compiler:'EXECUTED',lean:'NOT_EXECUTED',numerical:'NOT_EXECUTED',external_data:'NONE'}
  };
  const index={
    schema:'unity-001-phase2-typed-registry-v1',report,records:sourceRecords,
    types:typeSpec.symbols,reviewed_lifts:typed
  };
  const graph={schema:'unity-001-phase2-type-usage-graph-v1',nodes:[...typed.map(t=>({id:t.record_id,kind:'equation_source',typecheck:t.typecheck})),...typeSpec.symbols.map(s=>({id:s.id,kind:'type_symbol',sort:s.sort,dim:s.dim}))],edges,
    note:'These edges mean manually curated typed-AST symbol use ONLY, not derivation, causality, or valid cross-ontology mapping.'};
  return {index,report,conflicts:{schema:'unity-001-phase2-conflicts-v1',conflicts},graph};
}
export function loadInputs(){
  const raw=readFileSync(input('input/source-equations.csv'));
  const spec=JSON.parse(readFileSync(input('input/input-lock.json'),'utf8'));
  const actual=gitBlob(raw);
  if(actual!==spec.phase1_csv_git_blob)throw Error('PHASE1_INPUT_BLOB_MISMATCH expected '+spec.phase1_csv_git_blob+' got '+actual);
  const frozen=readFileSync(input('input/source-freeze.json'));
  if(gitBlob(frozen)!==spec.phase1_lock_git_blob)throw Error('PHASE1_SOURCE_LOCK_BLOB_MISMATCH');
  const sourceLock=JSON.parse(frozen);
  if(sourceLock.files_count!==209||sourceLock.repositories?.length!==4)throw Error('Unexpected phase-1 source lock structure');
  const rows=parseCSV(raw.toString('utf8'));
  if(rows.length!==spec.record_count)throw Error('Unexpected Phase 1 record count');
  const lifts=JSON.parse(readFileSync(input('schema/reviewed-lifts.json'),'utf8'));
  const types=JSON.parse(readFileSync(input('schema/type-spec.json'),'utf8'));
  return {rows,lifts,types,spec};
}
export function compile(){
  const {rows,lifts,types,spec}=loadInputs();
  return compileRecords(rows,lifts,types,spec);
}
function stable(value){return JSON.stringify(value,null,2)+'\n';}
const outputs={'compiled/typed-registry.json':'index','compiled/compile-report.json':'report','compiled/conflicts.json':'conflicts','compiled/type-usage-graph.json':'graph'};
export function command(mode){
  const result=compile();
  if(result.report.source_records!==717||result.report.typed_shape_dimension_pass!==14||result.report.unparsed_unresolved!==703)throw Error('Unexpected baseline coverage');
  for(const [path,key]of Object.entries(outputs)){
    const file=input(path),expected=stable(result[key]);
    if(mode==='--write'){mkdirSync(dirname(file),{recursive:true});writeFileSync(file,expected,'utf8');}
    if(mode==='--check'&&(!existsSync(file)||readFileSync(file,'utf8')!==expected))throw Error('Output differs or missing: '+path);
  }
  return result.report;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const mode=process.argv[2]||'--check';
  if(!['--check','--write'].includes(mode))throw Error('Usage: node compiler.mjs --write | --check');
  try{const result=command(mode);console.log('UNITY-001 P2: '+mode+'; '+result.source_records+' source entries; '+result.typed_shape_dimension_pass+' static type checks; '+result.unparsed_unresolved+' UNRESOLVED; 0 EFMW physical PASS');}
  catch(e){console.error('UNITY-001 P2 FAIL:',e.message);process.exitCode=1;}
}
