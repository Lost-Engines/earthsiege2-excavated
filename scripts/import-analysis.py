#!/usr/bin/env python3
"""Refresh the public display snapshot from the sibling analysis workspace."""
import hashlib,json,re,shutil,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT.parent/'earthsiege2-reverse'
A=SOURCE/'analysis';P=ROOT/'public'; records={}
def read(rel):
 p=SOURCE/rel;b=p.read_bytes();records[str(rel)]={'source':str(rel),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()};return b
def put(rel,data):
 p=P/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data.encode() if isinstance(data,str) else data)
def copy(rel,out=None):put(out or rel,read('analysis/'+rel))
def load(rel):return json.loads(read('analysis/'+rel))
def script(rel,name):return json.loads(read('analysis/'+rel).decode().split('=',1)[1].strip().rstrip(';'))
def dataset(rel,obj):put(rel,'EarthsiegeData.register(document.currentScript.src,'+json.dumps(obj,separators=(',',':'))+');\n')
def display(rel):
 rel=str(Path(rel));copy(rel+'.js')
for f in ['browser_data.js','model_cosine.js','model_math.js','model_animation.js','model_lighting.js','model_renderer.js','model_assembly.js']:
 copy(f)
for folder,files in {'models':['catalogue.js','assemblies.js','viewer.js'],'missions':['worlds.js','viewer.js'],'cockpits':['catalogue.js','gauge_math.js','hud_math.js','viewer.js'],'environment':['catalogue.js','math.js','viewer.js'],'rendering':['viewer.js'],'replays':['viewer.js']}.items():
 for f in files:copy(folder+'/'+f)
models=script('models/catalogue.js','modelCatalogue')
for row in models:display('models/'+row['url'])
# Model textures, terrain and cockpit bitmaps. Keep the original palette tables.
media=load('artwork/catalogue.json')
media['images']=[i for i in media['images'] if i['key'].split('/')[0] in ['dba','hba','db0','db1','db2','hb0','hb1','hb2'] and not i['name'].startswith(('shell','simalert'))]
put('artwork/data.js','window.mediaData='+json.dumps(media,separators=(',',':'))+';\n')
for image in media['images']:display('artwork/pixels/'+image['name']+'.json')
missions=load('missions/catalogue.json');missions['missions']=[m for m in missions['missions'] if not m.get('error')]
put('missions/catalogue.js','window.missionCatalogue='+json.dumps(missions,separators=(',',':'))+';\n')
seen=set()
def mission_file(url):
 rel=(A/'missions'/url).resolve().relative_to(A);rel=str(rel)
 if rel in seen:return
 seen.add(rel);display(rel)
 data=load(rel)
 if isinstance(data,dict) and 'terrain' in data:mission_file(data['terrain'])
for mission in missions['missions']:
 cases=mission['compilations']+mission.get('situations',[])+mission.get('recordings',[])
 if mission.get('capture'):cases.append(mission['capture'])
 for case in cases:
  for key in ['url','scene']:mission_file(case[key])
replays=load('replays/catalogue.json');dataset('replays/catalogue.json.js',replays)
for tape in replays['tapes']:
 display('replays/'+tape['frames_url'])
 for f in tape['files']:copy('replays/'+f['url'])
rendering=load('rendering/catalogue.json');dataset('rendering/catalogue.json.js',rendering)
for frame in rendering['frames']:
 copy('rendering/terrain/'+frame['id']+'.png')
# Templates preserve the IDs expected by the established viewers.
for folder in ['models','missions','cockpits','environment','rendering','replays']:
 html=read('analysis/'+folder+'/index.html').decode()
 body=re.search(r'<main>(.*?)</main>',html,re.S).group(1)
 styles='\n'.join(re.findall(r'<style>(.*?)</style>',html,re.S))
 scripts='\n'.join(re.findall(r'<script\b[^>]*>.*?</script>',html,re.S))
 body=re.sub(r'<details><summary>Preview scope</summary>.*?</details>','',body,flags=re.S)
 if folder=='models':
  body=body.replace('<div class="toolbar"><label>Palette','<details class="advanced"><summary>Palette and texture overrides</summary><div class="toolbar"><label>Palette')
  body=body.replace('<button id="reset">Reset view</button></div>','<button id="reset">Reset view</button></div></details>')
  body=body.replace('Chassis default (INI)','Default equipment').replace('Custom inspection loadout','Custom equipment')
 if folder=='missions':
  body=body.replace('<details open><summary>Placed actors','<details><summary>Placed actors')
  body=body.replace('Changing launch state, time or overlays preserves the camera.','')
 if folder=='cockpits':
  body=body.replace('Messages, MFD content and the outside scene are separate work.','The outside scene and the live mission displays are omitted here.')
 if folder=='rendering':
  body=re.sub(r' · <a id="bytes">.*?</a> · <a id="commands">.*?</a>','',body)
  body=re.sub(r'<p><a href="native-terrain-scenes.json">.*?</p>','',body)
  js=(P/'rendering/viewer.js').read_text().replace("[['png','png'],['bytes','bin'],['commands','json']]","[['png','png']]")
  (P/'rendering/viewer.js').write_text(js)
 if folder=='environment':
  body=re.sub(r'<p class="muted">The JavaScript backdrop.*?</p>','',body)
 # Native source headings are replaced by the site introduction.
 body=body.replace('\u2014',' - ')
 (ROOT/'src/imported'/f'{folder}.html').write_text(f'<style>{styles}</style>\n<section class="viewer" data-viewer="{folder}">{body}</section>\n{scripts}\n<script src="../assets/viewers.js" defer></script>\n')
js=(P/'missions/viewer.js').read_text().replace('Controlled preview · RNG advance ${c.seed}','Fresh chapter · variation ${c.seed+1}')
js=js.replace("if(tape&&current.recordings?.some","if(tape&&$('compilation').value!=='tape:'+tape&&current.recordings?.some")
js=js.replace("async function selectMission(m){current=m;","async function selectMission(m){current=m;history.replaceState(null,'','#'+encodeURIComponent(m.name));")
(P/'missions/viewer.js').write_text(js)
# The analysis notes are preserved verbatim as downloadable text; the public
# research index explains their original workspace-relative links.
notes=['EARTHSIEGE1_OVERLAP','EXECUTABLES_AND_CONTROLS','MISSIONS_AND_TERRAIN','ANIMATION_AND_MOVEMENT','ENVIRONMENT_AND_RENDERING','REPLAYS','AUDIO_AND_VIDEO','COCKPITS','INSTALL_MEDIA','ANALYSIS_STATUS','ORIGINAL_PROCESS_TRACES','FLYER_PROFILE','SIMULATION_FOUNDATIONS','VERSION_DIFFERENCES']
for name in notes:put('research/'+name+'.md',read('docs/'+name+'.md').decode().replace('\u2014',' - '))
put('research/REFERENCES.md',read('reference_sources/README.md').decode())
put('research/HERCULAN-LICENSE.txt',read('reference_sources/HERCULAN-LICENSE.txt'))
put('research/es1-overlap.json',read('analysis/resources/es1-overlap.json'))
# Small, current summary for the public article. Full traces stay in research.
put('research/coverage.json',json.dumps({'reference':'Win95 v1.1, English','mission_snapshots':139064,'exact_cockpit_frames':209,'cpp_tests':166,'source':'docs/ANALYSIS_STATUS.md'},indent=2)+'\n')
put('data-provenance.json',json.dumps({'source_workspace':'earthsiege2-reverse','files':list(records.values()),'note':'Public templates and mission-choice labels are adapted. Recovered geometry, animation, palette and raster algorithms are copied unchanged.'},indent=2)+'\n')
print(f'Imported {len(records)} source files; {len(models)} model libraries and {len(missions["missions"])} missions.')
