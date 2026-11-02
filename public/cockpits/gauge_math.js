'use strict';
window.GAUGE={
 shields(front,rear){const out=[],base=[25,59,23],bright=[59,59,23];for(const charge of [front,rear]){const v=charge>1024?charge-1024:charge,tracks=[v,v<256?0:Math.min((v-256)*2,1024),v<384?0:Math.min((v-384)*4,1024)];for(const t of tracks.reverse())out.push([...base.map((a,i)=>charge>1024?a+((bright[i]-a)*t>>10):a*t>>10),1])}return out},
 meter(rect,value,width,height,pixels=new Uint8Array(width*height),range=1024,colours=[16,98,97],repaint=false){const[l,t,r,b]=rect,span=Math.trunc(((r-l)<<16)/range),position=span>0?l+(value*span>>16):r-(value*span>>16);for(let y=Math.max(0,t);y<=Math.min(height-1,b);y++)for(let x=Math.max(0,l);x<=Math.min(width-1,r);x++){const lit=span>0||repaint?x<=position:x>=position;pixels[y*width+x]=lit?colours[1+(x&1)]:colours[0]}return{pixels,position}},
 throttle(track,height,value){const span=Math.trunc((((track[3]-track[1])-height)<<16)/2048),v=Math.max(-1024,Math.min(1024,value));return{span,bottom:track[3]-((v+1024)*span>>16)}}
};
