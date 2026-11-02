'use strict';
const $=id=>document.getElementById(id),catalogue=window.modelCatalogue;
const defaultAngle=.7+Math.PI/2;
let objects=[],resource=null,shape=null,poseShape=null,animation=null,thread=null,backward=false,frame=0,elapsed=0,playing=false;
let angle=defaultAngle,elevation=.3,zoom=1,framing=null,ticket=0,geometry=null,fit={},weapons=[];
const renderer=new ES.Renderer($('view')),thumbCanvas=document.createElement('canvas');
renderer.nativeOrder=true;
thumbCanvas.width=192;thumbCanvas.height=140;const thumbRenderer=new ES.Renderer(thumbCanvas);thumbRenderer.nativeOrder=true;
for(const group of new Set(catalogue.map(x=>x.group)))$('group').add(new Option(group));
for(const [i,p]of mediaData.palettes.entries())$('palette').add(new Option(p.key,i));
$('bank').add(new Option('No texture bank',''));for(const bank of mediaData.images)$('bank').add(new Option(bank.key,bank.name));
let thumbnailQueue=Promise.resolve();const thumbnailCache=new Map();
function bounds(g){const b=[0,1,2].map(i=>g.points.reduce((a,p)=>[Math.min(a[0],p[i]),Math.max(a[1],p[i])],[Infinity,-Infinity]));return{centre:b.map(a=>(a[0]+a[1])/2),radius:Math.max(...b.map(a=>a[1]-a[0]))/2||1}}
function rootName(row,i){const bindings=row.roots[i].bindings||[];return bindings.length?[...new Set(bindings.map(b=>b.label))].join(' / ')+` (${i})`:`${row.kind==='lod'?'LOD':'Variant'} ${i}`}
function thumb(row,root=0){
 const key=row.key+'#'+root;if(thumbnailCache.has(key))return thumbnailCache.get(key);
 const promise=thumbnailQueue=thumbnailQueue.catch(()=>{}).then(async()=>{
  const shapes=await EarthsiegeData.load(row.url);thumbRenderer.setPalette(mediaData.palettes.find(p=>p.key==='dpl/world0.dpl'));
  await thumbRenderer.setBank(ESModel.banks(row,root));
  const g=thumbRenderer.geometry(ESModel.instances(row,shapes,root,{fit:ESModel.defaultFit(row),weapons,renderer:thumbRenderer}));
  thumbRenderer.draw(g,{angle:defaultAngle,elevation:.3,zoom:.8});return thumbCanvas.toDataURL();
 });thumbnailCache.set(key,promise);return promise;
}
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);const row=catalogue[+e.target.dataset.model];thumb(row,+e.target.dataset.root).then(url=>e.target.src=url).catch(EarthsiegeData.report)}});
function drawList(){
 const q=$('find').value.toLowerCase(),group=$('group').value;$('rows').replaceChildren();let count=0;
 for(const [i,row]of catalogue.entries()){
  if(group!=='All'&&row.group!==group)continue;
  const roots=row.group==='Buildings'?row.roots.map((_,i)=>i):[0];
  for(const root of roots){
   const label=row.group==='Buildings'?rootName(row,root):row.label;
   if(!`${label} ${row.key}`.toLowerCase().includes(q))continue;
   const tr=document.createElement('tr'),td=document.createElement('td'),image=document.createElement('img');
   image.className='thumb';image.alt=label;image.dataset.model=i;image.dataset.root=root;td.append(image);tr.append(td);
   const title=document.createElement('td'),button=document.createElement('button');button.className='rowbutton';button.textContent=label;
   const small=document.createElement('small');small.textContent=row.group==='Buildings'?`${row.stem} · variant ${root}`:`${row.stem} · ${row.roots.length} ${row.kind==='lod'?'detail levels':'variants'}`;
   button.append(small);title.append(button);tr.append(title);tr.onclick=()=>select(row,root).catch(EarthsiegeData.report);$('rows').append(tr);observer.observe(image);count++;
  }
 }$('count').textContent=count+' entries';
}
async function select(row,root=0){
 const id=++ticket;playing=false;const data=await EarthsiegeData.load(row.url);if(id!==ticket)return;
 objects=data;resource=row;fit=ESModel.defaultFit(row);
 $('name').textContent=row.label;$('source').textContent=row.name;
 $('root').replaceChildren(...data.map((s,i)=>new Option(rootName(row,i),i)));$('root').value=root;
 $('rootLabel').firstChild.textContent=row.kind==='lod'?'Detail ':'Variant ';
 $('palette').value=mediaData.palettes.findIndex(p=>p.key==='dpl/world0.dpl');renderer.setPalette(mediaData.palettes[+$('palette').value]);
 angle=defaultAngle;elevation=.3;zoom=1;
 $('loadoutPanel').hidden=!row.mounts.length;$('loadout').options[0].disabled=!row.loadout;$('loadout').value=row.loadout?'default':'bare';
 $('loadoutNote').textContent=row.loadout?'Shell INI default; career and mission fits can differ':'Mission-dependent fit; select weapons to inspect attachments';buildMountControls();
 await setRoot();if(id!==ticket)return;
 $('variants').replaceChildren();$('variantsPanel').hidden=data.length<2;
 for(let i=0;i<data.length;i++){
  const b=document.createElement('button'),im=document.createElement('img'),label=document.createElement('span');im.alt=`${row.label} ${i}`;label.textContent=rootName(row,i);b.append(im,label);
  b.onclick=()=>{$('root').value=i;setRoot().catch(EarthsiegeData.report)};$('variants').append(b);thumb(row,i).then(url=>im.src=url).catch(EarthsiegeData.report);
 }
 location.hash=encodeURIComponent(row.key)+(root?'@'+root:'');
}
async function setRoot(){
 const row=resource,root=+$('root').value;shape=objects[root];poseShape=row.kind==='lod'?objects[0]:shape;
 animation=(poseShape.extras||[]).find(x=>x.type==='animation_list');
 $('sequence').replaceChildren(new Option('Rest pose',-1));
 for(const [i,s]of (animation?.sequences||[]).entries())$('sequence').add(new Option(`${row.profile?.sequence_roles[i]||'Sequence '+i} · ${s.frames.length} frames`,i));
 $('sequenceLabel').hidden=(animation?.sequences.length||0)<2;$('threadPanel').hidden=!animation;$('destination').replaceChildren(...(animation?.sequences||[]).map((s,i)=>new Option(row.profile?.sequence_roles[i]||'Sequence '+i,i)));$('cell').value=-1;$('cellLabel').hidden=!shape.cell_frame_counts?.length;
 $('cell').max=Math.max(0,...(shape.cell_frame_counts||[]))-1;framing=null;
 const bank=ESModel.bank(row,root);$('bank').value=bank||'';await renderer.setBank(ESModel.banks(row,root));
 if(resource!==row)return;setSequence();$('metadata').textContent=JSON.stringify({profile:row.profile,hardpoints:row.mounts,building_types:row.roots[root].bindings,shape},null,2);
}
function buildMountControls(){
 $('mounts').replaceChildren();
 for(const m of resource.mounts){
  const label=document.createElement('label'),input=document.createElement('select');
  label.append(`Slot ${m.slot+1} (${'top underside left right internal'.split(' ')[m.mount]}): `);
  for(const w of modelAssemblies.weapons)input.add(new Option(w.name,w.id));input.value=fit[m.slot]||0;
  input.onchange=()=>{fit[m.slot]=+input.value;$('loadout').value='custom';draw()};label.append(input);$('mounts').append(label);
 }
}
function setSequence(){frame=0;elapsed=0;playing=false;backward=false;const seq=animation?.sequences[+$('sequence').value];thread=seq?new ESMath.AnimationThread(animation):null;if(thread)thread.set(+$('sequence').value,0,0);$('frame').max=Math.max(0,(seq?.frames.length||1)-1);$('animation').hidden=+$('frame').max===0;$('play').textContent='Play';$('reverse').textContent='Forward';draw()}
function setRate(){if(thread)thread.setRate(Math.round(256*(+$('speed').value||1))*(backward?-1:1))}

function draw(){
 if(!shape)return;
 const seq=animation?.sequences[+$('sequence').value],fraction=seq?Math.min(1023,Math.floor(elapsed/Math.max(1,seq.frames[frame][0])*1024)):0;
 renderer.fullbright=$('lighting').value==='bright';renderer.lights=renderer.fullbright?[{kind:0,intensity:255,position:[0,0,0],direction:[0,0,0]}]:[modelDefaultLight];
 geometry=renderer.geometry(ESModel.instances(resource,objects,+$('root').value,{sequence:+$('sequence').value,frame,fraction,thread,fit,weapons,renderer,matrix:$('rootMotion').checked&&thread?ESMath.webgl(thread.world()):ES.ident()}),{edges:$('edges').checked,cell:+$('cell').value});
 if(!framing)framing=bounds(geometry);renderer.draw(geometry,{angle,elevation,zoom,...framing});
 if(thread){frame=thread.frame;$('frame').max=thread.seq().frames.length-1;$('sequence').value=thread.sequence;$('threadInfo').textContent=JSON.stringify({sequence:thread.sequence,frame:thread.frame,nextSequence:thread.nextSequence,nextFrame:thread.nextFrame,offset:thread.offset,duration:thread.duration,request:thread.request,armedFrame:thread.armedFrame,arrived:!!(thread.flags&1),inTransition:!!(thread.flags&2),root:thread.world()},null,2)}else $('threadInfo').textContent='Select an animation sequence to inspect its thread.';$('frame').value=frame;$('frameText').textContent=`${frame}/${$('frame').max}`;
 $('info').textContent=`${geometry.faces} polygons · ${geometry.textured} textured · ${geometry.billboards} billboards · ${renderer.textureCount} texture frames`;
}
$('find').oninput=drawList;$('group').onchange=drawList;$('root').onchange=()=>setRoot().catch(EarthsiegeData.report);$('sequence').onchange=setSequence;
$('edges').onchange=draw;$('lighting').onchange=draw;$('cell').oninput=draw;
$('palette').onchange=()=>{renderer.setPalette(mediaData.palettes[+$('palette').value]);draw()};
$('bank').onchange=async()=>{await renderer.setBank(ESModel.banks(resource,+$('root').value,$('bank').value));draw()};
$('loadout').onchange=()=>{if($('loadout').value==='default')fit=ESModel.defaultFit(resource);else if($('loadout').value==='bare')fit={};buildMountControls();draw()};
$('frame').oninput=()=>{playing=false;frame=+$('frame').value;elapsed=0;if(thread)thread.set(+$('sequence').value,frame,0);$('play').textContent='Play';draw()};
$('reverse').onclick=()=>{backward=!backward;$('reverse').textContent=backward?'Reverse':'Forward';setRate()};$('speed').oninput=setRate;$('rootMotion').onchange=draw;
$('requestTransition').onclick=()=>{if(!thread)return;setRate();thread.target(+$('destination').value,+$('targetFrame').value,$('stopAtTarget').checked?1:0);playing=true;$('play').textContent='Pause';draw()};
$('play').onclick=()=>{setRate();playing=!playing;$('play').textContent=playing?'Pause':'Play'};$('reset').onclick=()=>{angle=defaultAngle;elevation=.3;zoom=1;draw()};
let dragging=null;$('view').onpointerdown=e=>{dragging=[e.clientX,e.clientY];$('view').setPointerCapture(e.pointerId)};
$('view').onpointermove=e=>{if(!dragging)return;angle-=(e.clientX-dragging[0])*.009;elevation=Math.max(-1.5,Math.min(1.5,elevation+(e.clientY-dragging[1])*.009));dragging=[e.clientX,e.clientY];draw()};
$('view').onpointerup=$('view').onpointercancel=()=>dragging=null;
$('view').addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.12,Math.min(6,zoom*Math.exp(e.deltaY*.001)));draw()},{passive:false});
let last=performance.now();function tick(now){const dt=Math.min(200,now-last);last=now;if(playing&&thread){elapsed+=dt;let changed=false;while(elapsed>=40){elapsed-=40;thread.step(31);changed=true;if(((thread.flags&1)&&(thread.requestFlags&1))||(thread.seq().type==='sequence'&&thread.frame===thread.nextFrame&&thread.rate>=0)){playing=false;$('play').textContent='Play';break}}if(changed)draw()}requestAnimationFrame(tick)}

(async()=>{weapons=await EarthsiegeData.load('data/dts/mechwpns.dts.json');drawList();const[key,root]=decodeURIComponent(location.hash.slice(1)).split('@');await select(catalogue.find(r=>r.key===key)||catalogue[0],+root||0);requestAnimationFrame(tick)})().catch(EarthsiegeData.report);
