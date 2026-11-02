import fs from 'node:fs/promises';import path from 'node:path';import vm from 'node:vm';import {fileURLToPath} from 'node:url';import {parse} from 'parse5';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist'),files=[],errors=[],documents=new Map();
async function scan(dir){for(const f of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isSymbolicLink())throw Error('Unexpected symlink '+p);if(f.isDirectory())await scan(p);else files.push(p)}}await scan(root);
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
function walk(n,fn){fn(n);for(const c of n.childNodes||[])walk(c,fn)}
for(const file of files.filter(f=>f.endsWith('.html'))){const html=await fs.readFile(file,'utf8'),doc=parse(html),ids=new Set(),links=[];walk(doc,n=>{const id=attr(n,'id');if(id){if(ids.has(id))errors.push('Duplicate ID '+id+' in '+file);ids.add(id)}for(const k of ['href','src']){const v=attr(n,k);if(v)links.push(v)}if(n.tagName==='img'&&attr(n,'alt')===undefined)errors.push('Image without alt in '+file)});documents.set(file,{ids,links});if(!html.includes('name="viewport"'))errors.push('No viewport '+file);if(html.includes('\u2014'))errors.push('Em dash in '+file)}
const data={};data.window=data;vm.createContext(data);
for(const f of ['models/catalogue.js','models/assemblies.js','missions/catalogue.js','artwork/data.js','cockpits/catalogue.js'])vm.runInContext(await fs.readFile(path.join(root,f),'utf8'),data);
async function exists(rel){try{await fs.access(path.join(root,rel));return true}catch{errors.push('Missing '+rel);return false}}
const jsonscript=async rel=>{let value;const context={EarthsiegeData:{register:(_,v)=>value=v},document:{currentScript:{src:rel}}};vm.runInNewContext(await fs.readFile(path.join(root,rel),'utf8'),context);return value};
for(const [file,{links}]of documents)for(const ref of links){if(/^(?:https?:|data:|mailto:)/.test(ref))continue;if(path.basename(file)==='404.html')continue;const u=new URL(ref,'https://site.test/'+path.relative(root,file));let target=path.join(root,decodeURIComponent(u.pathname));try{if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');await fs.access(target)}catch{errors.push(path.relative(root,file)+' -> '+ref);continue}if(!u.hash)continue;const hash=decodeURIComponent(u.hash.slice(1)),rel=path.relative(root,target);
 if(hash==='content')continue;
 if(rel==='models/index.html'){const[key,n]=hash.split('@'),model=data.modelCatalogue.find(m=>m.key===key);if(!model||!model.roots[Number(n)||0])errors.push('Invalid model link '+ref)}
 else if(rel==='missions/index.html'){const mission=data.missionCatalogue.missions.find(m=>m.name===hash);if(!mission)errors.push('Invalid mission link '+ref);const tape=u.searchParams.get('tape');if(tape&&!mission?.recordings?.some(r=>r.id===tape))errors.push('Wrong tape link '+ref)}
 else if(rel==='cockpits/index.html'){if(!data.cockpitCatalogue.cockpits.some(c=>c.key===hash))errors.push('Invalid cockpit link '+ref)}
 else if(rel==='rendering/index.html'){const catalogue=await jsonscript('rendering/catalogue.json.js');if(!catalogue.frames.some(f=>f.id===hash))errors.push('Invalid frame link '+ref)}
 else if(documents.has(target)&&!documents.get(target).ids.has(hash))errors.push('Missing anchor '+ref+' in '+file);
}
for(const m of data.modelCatalogue)await exists('models/'+m.url+'.js');
for(const i of data.mediaData.images)await exists('artwork/pixels/'+i.name+'.json.js');
const seen=new Set();
async function missionFile(url){const rel=path.normalize('missions/'+url+'.js');if(seen.has(rel))return;seen.add(rel);if(await exists(rel)){const v=await jsonscript(rel);if(v.terrain)await missionFile(v.terrain)}}
for(const m of data.missionCatalogue.missions){const fixtures=[...m.compilations,...m.situations,...m.recordings,...(m.capture?[m.capture]:[])];if(!fixtures.length)errors.push('No mission preview '+m.name);for(const f of fixtures)for(const k of ['url','scene'])await missionFile(f[k]);}
const replays=await jsonscript('replays/catalogue.json.js');for(const r of replays.tapes){await exists('replays/'+r.frames_url+'.js');for(const f of r.files)await exists('replays/'+f.url)}
const frames=await jsonscript('rendering/catalogue.json.js');for(const f of frames.frames)await exists('rendering/terrain/'+f.id+'.png');
for(const f of files){const rel=path.relative(root,f);if(/\.(exe|dll|iso|cue|vol|rom|7z)$/i.test(rel))errors.push('Unexpected install content '+rel);if((await fs.stat(f)).size>25*1024*1024)errors.push('Unexpected large file '+rel)}
for(const f of ['images/social-preview.jpg','images/provenance.json','.nojekyll'])await exists(f);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Checked ${documents.size} HTML pages, ${files.length} files, ${data.modelCatalogue.length} model libraries, ${data.missionCatalogue.missions.length} missions, all referenced scene/texture data and tour links.`);
