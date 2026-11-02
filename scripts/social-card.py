from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]
canvas=Image.new('RGB',(1200,630),'#101b23');draw=ImageDraw.Draw(canvas)
fontdir=Path('/usr/share/fonts/truetype/dejavu')
serif=ImageFont.truetype(str(fontdir/'DejaVuSerif.ttf'),58);small=ImageFont.truetype(str(fontdir/'DejaVuSans.ttf'),20);label=ImageFont.truetype(str(fontdir/'DejaVuSans.ttf'),17)
draw.text((55,65),'LOST ENGINES',font=label,fill='#dbb66e');draw.text((55,125),'Earthsiege 2',font=serif,fill='#e4e9e1');draw.text((55,203),'Excavated',font=serif,fill='#dbb66e')
for n,line in enumerate(['Models, missions and machinery.','Inside the original game.']):draw.text((59,325+n*35),line,font=small,fill='#bacbd0')
shot=Image.open(root/'public/images/combat.png').resize((560,420),Image.Resampling.NEAREST);canvas.paste(shot,(600,105));draw.rectangle((599,104,1160,525),outline='#58696c')
draw.text((59,565),'lost-engines.github.io/earthsiege2-excavated',font=label,fill='#aabcc1');canvas.save(root/'public/images/social-preview.jpg',quality=93)
