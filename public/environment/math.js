/* Original indexed sky, integer coverage and distance fade. Checked against DBSIM. */
'use strict';
globalThis.ESEnvironment={};
const ENV=ESEnvironment;
ENV.horizon=(pitch,roll,shift,focal,center,offset=0,origin=[0,0])=>{
 pitch=ESMath.word(-pitch);const s=ESMath.cos(roll-16384),c=ESMath.cos(roll),x=c>>(6-shift),y=s>>(6-shift),delta=Math.trunc((ESMath.cos(pitch-16384)<<focal)/(ESMath.cos(pitch)||1)),dx=Math.imul(delta,-y)>>(8+shift),dy=Math.imul(delta,x)>>(8+shift);
 let a=[-x+dx+center[0],center[1]-(-y+dy)+offset],b=[x+dx+center[0],center[1]-(y+dy)+offset];const d=a.map((v,i)=>v-b[i]),inverted=(roll&65535)>16384&&(roll&65535)<49152;
 if(origin[1]){a=a.map((v,i)=>v+d[i]);b=b.map((v,i)=>v-d[i])}else if(origin[0]){if((origin[0]<0)!==inverted)a=a.map((v,i)=>v+d[i]);else b=b.map((v,i)=>v-d[i])}
 return {a,b,s,c:-c};
};
ENV.commands=(sky,pitch=0,roll=0,shift=0,focal=8,center=[160,120],bounds=[0,0,319,239],origin=[0,0])=>{
 const {a,b,s,c}=ENV.horizon(pitch,roll,shift,focal,center,sky[7],origin),commands=[];a[1]+=sky[7]>>1;b[1]+=sky[7]>>1;let colour=sky[1]+sky[3]-1;const h=sky[2],t=sky[0]>>1;
 const rect=(p,col)=>commands.push({kind:'rect',points:p.slice(),colour:col}),poly=(p,col,reverse=false)=>commands.push({kind:'polygon',points:(reverse?p.slice().reverse():p).map(v=>v.slice()),colour:col});
 if(!ESMath.word(roll)){
  const r=[...a,...b];let delta=-t;
  for(let i=0;i<sky[3]-1;i++){r[0]+=delta;r[1]+=delta;delta=h*c>>14;rect(r,colour);r[3]=r[1];colour--}
  r[1]=bounds[1];if(r[1]<=r[3])rect(r,colour);
 }else{
  let dx=-s*h>>14,dy=c*h>>14,previous=[a,b].map(p=>[p[0]-2*dx,p[1]-2*dy]);
  for(let i=0;i<sky[3]-1;i++){dx=-s*h*i>>14;dy=(t+(i-1)*h)*c>>14;const far=[a,b].map(p=>[p[0]+dx,p[1]+dy]);poly([...previous,...far.slice().reverse()],colour,true);previous=far;colour--}
  dx=-s*5000>>14;dy=c*5000>>14;poly([...previous,...previous.map(p=>[p[0]+dx,p[1]+dy])],colour,true);
 }
 a[1]++;b[1]++;colour=sky[1]+sky[3]-1;
 if(!ESMath.word(roll)){if(a[1]<=bounds[3])rect([a[0],a[1],b[0],bounds[3]],colour)}else{
  const [l,t,r,bottom]=bounds,p=[a,b];if(a[1]<b[1]){if(r<b[0])p.push([r,bottom]);p.push([l,bottom]);if(l<a[0])p.push([l,t])}else{if(r>b[0])p.push([r,t]);p.push([r,bottom]);if(l>a[0])p.push([l,bottom])}poly(p,colour);
 }
 return commands;
};
ENV.clip=(points,bounds)=>{
 for(const [axis,low,high]of [[0,bounds[0],bounds[2]],[1,bounds[1],bounds[3]]]){
  if(!points.length)break;const result=[],side=p=>p[axis]<low?-1:p[axis]>high?1:0;
  const crossing=(a,b,where)=>{const p=a.slice();p[axis]=where<0?low:high;p[1-axis]=a[1-axis]+Math.trunc((p[axis]-a[axis])*(b[1-axis]-a[1-axis])/(b[axis]-a[axis]));return p};let previous=points.at(-1);
  for(const current of points){const a=side(previous),b=side(current);if(!a&&!b)result.push(current.slice());else if(a!==b){if(a)result.push(crossing(previous,current,a));if(b)result.push(crossing(current,previous,b));else result.push(current.slice())}previous=current}points=result;
 }return points;
};
ENV.edges=points=>{
 let top=0,bottom=0;for(let i=1;i<points.length;i++){const p=points[i],t=points[top],b=points[bottom];if(p[1]<t[1]||(p[1]===t[1]&&p[0]>t[0]))top=i;if(p[1]>b[1]||(p[1]===b[1]&&p[0]<b[0]))bottom=i}
 const first=points[top][1],last=points[bottom][1];if(first===last)return {first,spans:[[points[bottom][0],points[top][0]]]};const spans=Array.from({length:last-first+1},()=>[null,null]);
 for(const [start,target,side]of [[top,last,1],[bottom,first,0]]){
  const path=[points[start]];let cursor=start;while(path.at(-1)[1]!==target){cursor=(cursor+1)%points.length;path.push(points[cursor]);if(path.length>points.length)throw Error('Non-monotonic raster outline')}
  for(let i=1;i<path.length;i++){
   let a=path[i-1],b=path[i];const dx=Math.abs(b[0]-a[0]),dy=Math.abs(b[1]-a[1]),put=(x,y)=>spans[y-first][side]=x;
   if(!dy){put(side?Math.max(a[0],b[0]):Math.min(a[0],b[0]),a[1]);continue}
   if(dx<=dy){if(a[0]>b[0])[a,b]=[b,a];let[x,y]=a;const step=b[1]>=a[1]?1:-1;let error=2*dx-dy;for(let j=0;j<=dy;j++){put(x,y);if(error>=0){x++;error-=2*dy}error+=2*dx;y+=step}}
   else{if((a[0]<b[0])===Boolean(side))[a,b]=[b,a];let[x,y]=a;const sx=b[0]>=a[0]?1:-1,sy=b[1]>=a[1]?1:-1;let error=2*dy-dx;put(x,y);for(let j=0;j<dx;j++){x+=sx;if(error>=0){y+=sy;error-=2*dx;put(x,y)}error+=2*dy}}
  }
 }return {first,spans};
};
ENV.render=(commands,width,height,bounds=[0,0,width-1,height-1])=>{
 const pixels=new Uint8Array(width*height);
 for(const command of commands){const colour=command.colour&255;if(command.kind==='rect'){
  let[l,t,r,b]=command.points;l=Math.max(l,bounds[0]);t=Math.max(t,bounds[1]);r=Math.min(r,bounds[2]);b=Math.min(b,bounds[3]);if(l<=r&&t<=b)for(let y=t;y<=b;y++)pixels.fill(colour,y*width+l,y*width+r+1);
 }else{const p=ENV.clip(command.points,bounds);if(p.length<3)continue;const {first,spans}=ENV.edges(p);for(let i=0;i<spans.length;i++){const [l,r]=spans[i];if(l<=r)pixels.fill(colour,(first+i)*width+l,(first+i)*width+r+1)}}}
 return pixels;
};
ENV.fog=(distance,visibility,slices)=>{distance=Math.min(distance,visibility);return distance<=(visibility>>1)?0:Math.min(Math.trunc((distance-(visibility>>1))*2*65536/visibility),65536)*(slices-1)>>16};
ENV.ranges=(first,last,rows)=>first.map(([a,n],i)=>{const[b,m]=last[i],z=a+n-1,q=b+m-1,da=ESMath.word(Math.trunc((b-a+1)*256/(rows-1))),dz=ESMath.word(Math.trunc((q-z+1)*256/(rows-1)));return [...Array.from({length:rows-1},(_,i)=>{const start=ESMath.word(a+(i*da>>8));return [start,ESMath.word(z+(i*dz>>8)-start+1)]}),[b,m]]});
