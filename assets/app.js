'use strict';
/* Observe Unity — public research registry viewer.
 * This interface reads a frozen, curated browser snapshot, not live GitHub verification.
 * Never promote gate results to physical truth.
 */
const $ = id => document.getElementById(id);
const state = {data:null,atlasFilter:'all',atlasQuery:'',equationQuery:'',equationGate:'all',bridge:'if_gr_sm'};
const statusText = {established:'REFERENCE',candidate:'CANDIDATE',placeholder:'UNIMPORTED'};
const humanFormula = {
  eq_einstein:'Gμν = (8πG / c⁴) Tμν',
  eq_mass_shell:'E² = (pc)² + (mc²)²',
  eq_master_density:'ℒtotal = ℒGR + ℒSM + ℒinteraction + ℒcandidate',
  eq_memory_toy:'τ dM/dt + M = e'
};
function create(tag,attrs={},text){
  const node=document.createElement(tag);
  for(const [key,value] of Object.entries(attrs)){
    if(key==='class')node.className=value;
    else if(key==='dataset')for(const [k,v] of Object.entries(value))node.dataset[k]=v;
    else if(key==='hidden')node.hidden=Boolean(value);
    else node.setAttribute(key,String(value));
  }
  if(text!==undefined&&text!==null)node.textContent=String(text);
  return node;
}
function add(parent,tag,attrs={},text){const node=create(tag,attrs,text);parent.append(node);return node;}
function statusChip(value){
  const css=value==='PASS'?'pass':value==='UNRESOLVED'?'unresolved':value==='FAIL'?'fail':value;
  return create('span',{class:'status-chip '+css},statusText[value]||value);
}
function toast(message){
  const target=$('toast');target.textContent=message;target.classList.add('show');
  clearTimeout(toast._timer);toast._timer=setTimeout(()=>target.classList.remove('show'),3400);
}
function normalize(x){return String(x??'').normalize('NFKD').toLocaleLowerCase();}
function subset(items,query,fields){const q=normalize(query).trim();return !q?items:items.filter(item=>normalize(fields.map(key=>item[key]??'').join(' ')).includes(q));}
function renderStats(){
  const d=state.data;
  $('stat-sectors').textContent=d.ontologies.length;
  $('stat-pass').textContent=d.counts.PASS;
  $('stat-fail').textContent=d.counts.FAIL;
  $('stat-unresolved').textContent=d.counts.UNRESOLVED;
  for(const name of ['PASS','FAIL','UNRESOLVED']){const el=$('gate-'+name.toLowerCase());if(el)el.textContent=d.counts[name];}
  const total=Object.values(d.counts).reduce((a,b)=>a+b,0);
  for(const [name,id] of [['PASS','bar-pass'],['FAIL','bar-fail'],['UNRESOLVED','bar-unresolved']])$(id).style.width=(total?d.counts[name]/total*100:0)+'%';
}
function renderAtlas(){
  const data=state.data;if(!data)return;
  let entries=data.ontologies.filter(x=>state.atlasFilter==='all'||x.status===state.atlasFilter);
  entries=subset(entries,state.atlasQuery,['name','id','scope','status']);
  $('atlas-count').textContent=entries.length+' / '+data.ontologies.length+' SECTORS';
  const grid=$('atlas-grid');grid.replaceChildren();
  entries.forEach((o,i)=>{
    const btn=add(grid,'button',{type:'button',class:'atlas-card','aria-label':'View ontology: '+o.name});
    const head=add(btn,'div',{class:'card-head'});add(head,'span',{class:'card-index'},String(data.ontologies.indexOf(o)+1).padStart(2,'0')+' / 22');add(head,'span',{class:'card-arrow','aria-hidden':'true'},'↗');
    add(btn,'h3',{},o.name);add(btn,'p',{},o.scope);
    const foot=add(btn,'div',{class:'card-foot'});foot.append(statusChip(o.status));add(foot,'span',{class:'micro'},o.equations.length+' RECORD'+(o.equations.length!==1?'S':''));
    btn.addEventListener('click',()=>openOntology(o.id));
  });
  if(!entries.length)add(grid,'p',{class:'empty'},'No sectors match this filter. Try another term or evidence class.');
}
function renderEquations(){
  const data=state.data;if(!data)return;
  const nameMap=new Map(data.ontologies.map(x=>[x.id,x.name]));
  let entries=data.equations.filter(x=>state.equationGate==='all'||x.dimensionGate===state.equationGate);
  const q=normalize(state.equationQuery).trim();
  if(q)entries=entries.filter(x=>normalize([x.id,x.latex,x.scope,x.ontology,nameMap.get(x.ontology)].join(' ')).includes(q));
  $('equation-count').textContent=entries.length+' / '+data.equations.length+' RECORDS';
  const grid=$('equation-grid');grid.replaceChildren();
  entries.forEach(e=>{
    const strong=e.dimensionGate==='PASS';
    const card=add(grid,'article',{class:'eq-card'+(strong?' emphasized':'')});
    const upper=add(card,'div',{class:'eq-upper'});add(upper,'span',{class:'eq-id'},e.id);upper.append(statusChip(e.dimensionGate));
    add(card,'h3',{class:'eq-name'},nameMap.get(e.ontology)||e.ontology);
    const formula=add(card,'div',{class:'eq-display'+(strong?'':' pending')},humanFormula[e.id]||(e.latex||'Source equation not yet imported'));
    if(e.latex)formula.setAttribute('title','Original notation: '+e.latex);
    add(card,'p',{},e.scope);
    const meta=add(card,'div',{class:'eq-meta'});add(meta,'span',{},e.status==='established'?'REFERENCE EXAMPLE':e.status==='candidate'?'CANDIDATE SLOT':'DECLARATION');add(meta,'span',{},e.dimensionGate==='PASS'?'DIMENSIONS ONLY':'NO EXECUTABLE SIDES');
    if(!e.latex)add(meta,'span',{},'UNIMPORTED');
  });
  if(!entries.length)add(grid,'p',{class:'empty'},'No equation records match this search or gate.');
}
function renderBridges(){
  const d=state.data;
  const pick=$('bridge-picker');pick.replaceChildren();
  d.interfaces.forEach((b,i)=>{
    const btn=add(pick,'button',{type:'button',class:'bridge-pick','aria-label':'Select '+b.name,'aria-pressed':state.bridge===b.id? 'true':'false'},String(i+1).padStart(2,'0'));
    if(state.bridge===b.id)btn.classList.add('active');
    btn.addEventListener('click',()=>selectBridge(b.id));
  });
  selectBridge(state.bridge);
}
function selectBridge(id){
  const d=state.data;if(!d)return;
  const item=d.interfaces.find(x=>x.id===id);
  if(!item)return;state.bridge=id;
  $('bridge-name').textContent=item.name;
  $('bridge-type').textContent=item.kind.toUpperCase();
  $('bridge-detail').textContent=item.scope;
  $('bridge-number').textContent=String(d.interfaces.indexOf(item)+1).padStart(2,'0')+' / '+String(d.interfaces.length).padStart(2,'0');
  document.querySelectorAll('.bridge-edge').forEach(el=>el.classList.toggle('active',el.dataset.bridge===id));
  document.querySelectorAll('.bridge-pick').forEach((btn,i)=>{const active=d.interfaces[i].id===id;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
}
function renderObligations(){
  const d=state.data;const list=$('obligation-list');list.replaceChildren();
  for(const o of d.obligations){
    const details=add(list,'details',{class:'obligation'});
    const summary=add(details,'summary');const left=add(summary,'div');
    add(left,'span',{class:'ob-id'},o.id);add(left,'span',{class:'ob-question'},o.question);
    add(summary,'span',{class:'plus','aria-hidden':'true'},'+');
    const ex=add(details,'div',{class:'ob-expanded'});
    add(ex,'p',{},'Required before resolution: frozen source, explicit derivation or executable test, a conventional or null control, reproducible evidence, and a scope-specific adjudication.');
    const p=add(ex,'p');add(p,'code',{},'Target: '+o.target);
  }
}
function renderSources(){
  const grid=$('source-grid');grid.replaceChildren();
  const ordered=[...state.data.sources].sort((a,b)=>Number(b.inspection.startsWith('README'))-Number(a.inspection.startsWith('README')));
  for(const s of ordered){
    const inspected=s.inspection.startsWith('README');
    const card=add(grid,'article',{class:'source-card'});
    const head=add(card,'div',{class:'source-row'});add(head,'span',{class:'eyebrow'},s.id);head.append(statusChip(inspected?'candidate':'placeholder'));
    add(card,'h3',{},s.repository);add(card,'p',{},s.inspection);
    const foot=add(card,'div',{class:'source-row'});
    const a=add(foot,'a',{href:s.url,target:'_blank',rel:'noopener noreferrer'},'Inspect source ↗');
    a.setAttribute('aria-label','Inspect '+s.repository+' on GitHub');
    add(foot,'span',{class:'pin'},'UNPINNED');
  }
}
function openOntology(id){
  const d=state.data,o=d?.ontologies.find(x=>x.id===id);if(!o)return;
  $('dialog-kicker').textContent=o.id.toUpperCase();
  const root=$('dialog-body');root.replaceChildren();
  add(root,'h2',{id:'dialog-title'},o.name);
  root.append(statusChip(o.status));
  add(root,'p',{class:'field-label'},'Sector scope');add(root,'p',{},o.scope);
  add(root,'p',{class:'field-label'},'Evidence boundary');
  const caution=o.status==='established'?'Established physical reference sector; this compiler does not independently derive or confirm all its laws.':o.status==='candidate'?'Candidate research sector; original derivation and physical discriminability have not been established by this site.':'Declared import socket only; equations and physical verification are missing.';
  add(root,'p',{},caution);
  add(root,'p',{class:'field-label'},'Linked equation records');
  const links=d.equations.filter(x=>x.ontology===o.id);
  for(const e of links){const box=add(root,'div',{class:'dialog-eq'});add(box,'code',{},e.id+' · '+e.dimensionGate);add(box,'div',{},humanFormula[e.id]||(e.latex||'Import pending'));}
  const related=d.interfaces.filter(x=>x.from===id||x.to===id);
  if(related.length){
    add(root,'p',{class:'field-label'},'Open bridges');
    const ul=add(root,'ul');related.forEach(b=>add(ul,'li',{},b.name+' — UNRESOLVED'));
  }
  const obligations=d.obligations.filter(x=>x.target===id);
  if(obligations.length){add(root,'p',{class:'field-label'},'Unresolved obligations');const ul=add(root,'ul');obligations.forEach(b=>add(ul,'li',{},b.question));}
  const dialog=$('detail-dialog');if(!dialog.open)dialog.showModal();
}
function download(filename,content,type){
  const blob=new Blob([content],{type});
  const href=URL.createObjectURL(blob);
  const a=create('a',{href,download:filename});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1200);
  toast(filename+' prepared');
}
function exportCsv(){
  const d=state.data;
  const fields=['id','ontology','status','dimensionGate','latex','scope','method'];
  const escape=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  const rows=[fields.join(','),...d.equations.map(e=>fields.map(f=>escape(e[f])).join(','))];
  download('observe-unity-moc-001-equations.csv',rows.join('\r\n')+'\r\n','text/csv;charset=utf-8');
}
async function init(){
  try{
    const res=await fetch('./data/catalog.json',{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();
    if(!Array.isArray(data.ontologies)||!Array.isArray(data.equations)||!Array.isArray(data.findings))throw Error('Invalid data structure');
    const count=x=>data.findings.filter(f=>f.outcome===x).length;
    if(count('PASS')!==data.counts.PASS||count('FAIL')!==data.counts.FAIL||count('UNRESOLVED')!==data.counts.UNRESOLVED)throw Error('Evidence counts disagree with findings');
    state.data=data;
    renderStats();renderAtlas();renderEquations();renderBridges();renderObligations();renderSources();
    $('atlas-search').addEventListener('input',e=>{state.atlasQuery=e.target.value;renderAtlas();});
    document.querySelectorAll('[data-atlas-filter]').forEach(btn=>btn.addEventListener('click',()=>{
      state.atlasFilter=btn.dataset.atlasFilter;
      document.querySelectorAll('[data-atlas-filter]').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
      renderAtlas();
    }));
    $('equation-search').addEventListener('input',e=>{state.equationQuery=e.target.value;renderEquations();});
    $('equation-gate').addEventListener('change',e=>{state.equationGate=e.target.value;renderEquations();});
    $('download-csv').addEventListener('click',exportCsv);
    $('download-json').addEventListener('click',()=>download('observe-unity-moc-001-snapshot.json',JSON.stringify(data,null,2)+'\n','application/json'));
    document.querySelectorAll('.bridge-edge').forEach(el=>{
      el.addEventListener('click',()=>selectBridge(el.dataset.bridge));
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectBridge(el.dataset.bridge);}});
    });
  }catch(error){
    for(const id of ['atlas-grid','equation-grid','source-grid','obligation-list']){
      const el=$(id);el.replaceChildren();add(el,'p',{class:'empty'},'Cannot load registry data. Serve the repository over HTTP, for example: python3 -m http.server 8000. Details: '+String(error));
    }
    toast('Data unavailable; see repository setup.');
    console.error('Observe Unity initialization:',error);
  }
}
$('dialog-close').addEventListener('click',()=>$('detail-dialog').close());
$('detail-dialog').addEventListener('click',e=>{if(e.target===$('detail-dialog'))$('detail-dialog').close();});
const menu=$('menu-toggle');
menu.addEventListener('click',()=>{const isOpen=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!isOpen));$('primary-nav').classList.toggle('open',!isOpen);});
document.querySelectorAll('#primary-nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');$('primary-nav').classList.remove('open');}));
init();
