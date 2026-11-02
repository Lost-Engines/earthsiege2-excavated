'use strict';
const $=id=>document.getElementById(id),names=['Urban','Snow','Volcanic','Ice','Moon'];let world,textureFrames=[],loadSerial=0;
for(const w of environmentCatalogue.worlds)$('world').add(new Option(`${names[w.number>>1]} · ${w.number%2?'Night':'Day'} · WORLD${w.number}`,w.number));
function palette(){return mediaData.palettes.find(p=>p.key===`dpl/world${world.number}.dpl`)}
function paint(canvas,indices,pal){const ctx=canvas.getContext('2d'),image=ctx.createImageData(canvas.width,canvas.height);for(let i=0;i<indices.length;i++){const p=indices[i]*3;image.data.set([pal[p],pal[p+1],pal[p+2],255],i*4)}ctx.putImageData(image,0,0)}
function draw(){
 if(!world)return;const scale=+$('resolution').value,width=320<<scale,height=240<<scale,canvas=$('sky'),pitch=+$('pitch').value,roll=+$('roll').value,pal=palette();canvas.width=width;canvas.height=height;
 const commands=ENV.commands(world.sky,Math.round(pitch*65536/360),Math.round(roll*65536/360),scale,8+scale,[width/2,height/2],[0,0,width-1,height-1]);paint(canvas,ENV.render(commands,width,height),pal.rgb);
 $('pitch-value').textContent=pitch+'°';$('roll-value').textContent=roll+'°';const rgb=i=>`rgb(${pal.rgb.slice(i*3,i*3+3).join(',')})`;
 $('colours').innerHTML=Array.from({length:world.sky[3]},(_,i)=>`<span style="background:${rgb(world.sky[1]+i)}" title="Palette ${world.sky[1]+i}"></span>`).join('');$('sky-info').textContent=`${world.sky[3]} sky colours, indices ${world.sky[1]}-${world.sky[1]+world.sky[3]-1}; terrain bank ${world.names[3].toUpperCase()}.`;
 const ratio=+$('distance').value,shade=+$('shade').value,slice=ENV.fog(ratio*1000,100000,pal.fog_levels),row=slice*pal.shade_levels+(shade*(pal.shade_levels-1)>>8),map=pal.remap[row];$('distance-value').textContent=ratio+'%';$('fog-info').textContent=`Fog slice ${slice+1} / ${pal.fog_levels}; shade row ${row%pal.shade_levels} / ${pal.shade_levels-1}.`;
 if(textureFrames.length){const f=textureFrames[+$('frame').value],c=$('texture');c.width=f.width;c.height=f.height;paint(c,f.pixels.map(i=>map[i]),pal.rgb)}
 const indices=new Uint8Array(256*32);for(let y=0;y<32;y++)indices.set(map,y*256);paint($('ramp'),indices,pal.rgb);
 const distance=Math.trunc(ratio/100*114688),thresholds=world.distance_bands[0];let band=0;while(band<thresholds.length-1&&distance>=thresholds[band])band++;
 $('band-info').textContent=`Object distance ${distance} original units; band ${band} of ${thresholds.length-1}.`;$('ranges').innerHTML=world.ranges.map((column,i)=>{const[start,count]=column[band];return `<tr><td>${i}</td><td>${start}-${start+count-1}</td><td><div class="range">${Array.from({length:count},(_,j)=>`<i style="background:${rgb(start+j)}"></i>`).join('')}</div></td></tr>`}).join('');
}
async function selectWorld(){const serial=++loadSerial;world=environmentCatalogue.worlds[+$('world').value];textureFrames=[];draw();const image=mediaData.images.find(i=>i.key===world.terrain),data=await EarthsiegeData.load('../artwork/pixels/'+image.name+'.json');if(serial!==loadSerial)return;textureFrames=data.frames.map(f=>({...f,pixels:EarthsiegeData.bytes(f.indices)}));$('frame').innerHTML=textureFrames.map((_,i)=>`<option value="${i}">Frame ${i}</option>`).join('');$('metadata').textContent=JSON.stringify(world,null,2);draw()}
$('world').onchange=()=>selectWorld().catch(EarthsiegeData.report);for(const id of ['resolution','pitch','roll','frame','shade','distance'])$(id).oninput=draw;$('reset').onclick=()=>{$('pitch').value=$('roll').value=0;draw()};selectWorld().catch(EarthsiegeData.report);
