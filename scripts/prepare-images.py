#!/usr/bin/env python3
"""Export retained original indexed framebuffers as illustrations, without scaling."""
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,sys
root=Path(__file__).resolve().parents[1];analysis=root.parent/'earthsiege2-reverse/analysis'
base=analysis/'reference/tick-traces/cd_v1_1_1997_09_win95_e';output=root/'public/images';output.mkdir(exist_ok=True)
candidates=[]
for name in ['campaign-1-squad-success','campaign-c5_10','campaign-c4_10','training-5-panels','campaign-4-razor-armed']:
 folder=base/name
 for f in sorted(folder.glob('*.idx')):
  if f.with_suffix('.pal').exists():candidates.append(f)
# Limit the preview sheet; the published PNGs retain full source resolution.
candidates=candidates[:28]
sheet=Image.new('RGB',(4*320,((len(candidates)+3)//4)*265),'#e5e7dc');pen=ImageDraw.Draw(sheet)
for i,f in enumerate(candidates):
 pal=f.with_suffix('.pal').read_bytes();rgb=bytes(v*4 for j,v in enumerate(pal) if j%4!=3)
 im=Image.frombytes('P',(640,480),f.read_bytes());im.putpalette(rgb);im=im.convert('RGB')
 x=i%4*320;y=i//4*265;sheet.paste(im.resize((320,240),Image.Resampling.NEAREST),(x,y));pen.text((x+4,y+241),f'{i}: {f.parent.name[:24]} {f.stem[-5:]}',fill='black')
preview=root/'.test-output';preview.mkdir(exist_ok=True);sheet.save(preview/'original-frames.jpg');(preview/'image-candidates.json').write_text(json.dumps([str(f.relative_to(analysis)) for f in candidates],indent=2))
# Chosen illustration: opening campaign patrol, captured on tick 1000.
source=base/'campaign-1-squad-success/ticks.jsonl.frame-01000.idx'
if not source.exists():source=candidates[0]
pal=source.with_suffix('.pal').read_bytes();im=Image.frombytes('P',(640,480),source.read_bytes());im.putpalette(bytes(v*4 for j,v in enumerate(pal) if j%4!=3));im.convert('RGB').save(output/'gameplay.png')
terrain=analysis/'rendering/terrain/w8-p3.png';(output/'terrain.png').write_bytes(terrain.read_bytes())
records=[{'image':'gameplay.png','method':'Original process framebuffer, palette RGB6 expanded by multiplication by four','source':str(source.relative_to(analysis)),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'palette_sha256':hashlib.sha256(pal).hexdigest()},{'image':'terrain.png','method':'Original executable terrain and sky routines, controlled lunar camera','source':str(terrain.relative_to(analysis)),'sha256':hashlib.sha256(terrain.read_bytes()).hexdigest()}]
source2=base/'training-5-panels/ticks.jsonl.frame-02048.idx'
pal2=source2.with_suffix('.pal').read_bytes();im2=Image.frombytes('P',(640,480),source2.read_bytes());im2.putpalette(bytes(v*4 for j,v in enumerate(pal2) if j%4!=3));im2.convert('RGB').save(output/'combat.png')
records.append({'image':'combat.png','method':'Original process framebuffer, assault training, tick 2048','source':str(source2.relative_to(analysis)),'sha256':hashlib.sha256(source2.read_bytes()).hexdigest(),'palette_sha256':hashlib.sha256(pal2).hexdigest()})
(output/'original-provenance.json').write_text(json.dumps(records,indent=2)+'\n')
print('Prepared original captures and contact sheet.')
