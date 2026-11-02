/* Original ANAnimThread state machine. Fixtures execute four original EXEs. */
'use strict';
const animationFields='sequence frame nextSequence nextFrame armedFrame destination destinationFrame transitionDuration transitionKey request requestFrame requestFlags offset duration ground gx gy gz rx ry rz rate flags'.split(' ');
ESMath.inverse=t=>{const b=t.basis.slice();for(const [a,c]of [[1,2],[4,6],[5,7]])[b[a],b[c]]=[b[c],b[a]];const out={...t,basis:b};out.translation=ESMath.rotate(t.translation.map(x=>-x),out);return out};
ESMath.transformArray=t=>[...t.basis,t.type,0,...t.translation];
ESMath.arrayTransform=t=>({basis:t.slice(0,9),type:t[9],flags:0,translation:t.slice(11)});
ESMath.AnimationThread=class{
 constructor(animation){this.a=animation;for(const f of animationFields)this[f]=0;this.root=ESMath.identity();this.rate=256;this.set(0,0,0)}
 seq(index=this.sequence){return this.a.sequences[index]}
 next(frame,sequence=this.sequence){const s=this.seq(sequence);return s.type==='cyclic_sequence'?(frame+1)%s.frames.length:Math.min(frame+1,s.frames.length-1)}
 previous(frame,sequence=this.sequence){const s=this.seq(sequence);return s.type==='cyclic_sequence'?(frame+s.frames.length-1)%s.frames.length:Math.max(0,frame-1)}
 groundKey(index){const p=this.a.transforms[index].map(ESMath.word);[this.rx,this.ry,this.rz,this.gx,this.gy,this.gz]=p;this.ground=1}
 loadGround(){const s=this.seq();if(s.ground_movement)this.groundKey(s.transform_indices[this.frame*s.part_list.length]);else this.ground=0}
 groundTransform(numerator=1,denominator=1){return{...ESMath.rotation([this.rx,this.ry,this.rz].map(x=>Math.trunc(x*numerator/denominator))),translation:[this.gx,this.gy,this.gz].map(x=>Math.trunc(x*numerator/denominator))}}
 world(){return this.ground?ESMath.compose(this.groundTransform(this.offset,this.duration),this.root):this.root}
 seed(t){const incoming=Array.isArray(t)?ESMath.arrayTransform(t):t;this.root=this.ground?ESMath.compose(ESMath.inverse(this.groundTransform(this.offset,this.duration)),incoming):incoming}
 commit(inverse=false){if(this.ground){let t=this.groundTransform();if(inverse)t=ESMath.inverse(t);this.root=ESMath.compose(t,this.root)}}
 set(sequence,frame=0,offset=0){this.sequence=this.nextSequence=sequence;this.frame=frame;this.nextFrame=this.next(frame);this.offset=offset;this.duration=this.seq().frames[frame][0];this.loadGround();this.request=this.requestFrame=this.armedFrame=-1;this.requestFlags=0;this.flags=1}
 seek(sequence,position){const s=this.seq(sequence),total=s.frames.reduce((sum,f)=>sum+f[0],0);let t=(position*(total-1))>>14,frame=0;while(t>=s.frames[frame][0]){t-=s.frames[frame][0];frame++}this.set(sequence,frame,t)}
 findTransition(){
  const backward=this.rate<0;let frame=backward?this.frame:this.nextFrame;const start=frame,s=this.seq();
  for(;;){const [,count,first]=s.frames[frame];for(const t of this.a.transitions.slice(first,first+count)){if(t[1]!==this.request)continue;[this.transitionDuration,this.destination,this.destinationFrame,this.transitionKey]=t;this.armedFrame=frame;const dest=this.seq(this.destination);if(this.requestFrame===-1||dest.type==='cyclic_sequence'||(backward?this.destinationFrame>this.requestFrame:this.destinationFrame<this.requestFrame)||(this.destinationFrame===this.requestFrame&&this.offset===0))return}
   const next=backward?this.previous(frame):this.next(frame);if(next===frame||next===start)break;frame=next;
  }this.armedFrame=-1;
 }
 target(sequence,frame=-1,flags=0){this.request=sequence;this.requestFrame=frame;this.requestFlags=flags;this.flags&=~1;if(sequence!==-1&&!(this.sequence===sequence&&this.frame===frame&&this.offset===0))this.findTransition();else{this.flags|=1;this.armedFrame=-1}}
 setRate(rate){const old=this.rate;this.rate=ESMath.word(rate);if((old<0)!==(this.rate<0))this.target(this.request,this.requestFrame,this.requestFlags)}
 arrival(){if(this.sequence===this.request&&(this.requestFrame===-1||this.frame===this.requestFrame)){this.flags|=1;return Boolean(this.requestFlags&1)}return false}
 step(dt){
  if((this.flags&1)&&(this.requestFlags&1))return;const delta=ESMath.word((ESMath.word(dt)*this.rate)>>8);if(!delta)return;let o=ESMath.word(this.offset+delta);
  if(o<0&&this.frame===0&&this.armedFrame!==0&&this.previous(0)===0)o=0;
  if(o===0){this.offset=0;if(this.flags&2){this.nextSequence=this.sequence;this.nextFrame=this.next(this.frame);this.duration=this.seq().frames[this.frame][0];this.flags&=~2;this.loadGround()}this.arrival();return}
  if(o>=this.duration){
   let guard=0;while(o!==0&&o>=this.duration){if(++guard>10000)throw Error('Animation forward loop');this.commit();this.sequence=this.nextSequence;this.frame=this.nextFrame;o=ESMath.word(o-this.duration);
    if(this.frame===this.armedFrame){this.nextSequence=this.destination;this.nextFrame=this.destinationFrame;this.duration=this.transitionDuration;this.armedFrame=-1;this.flags|=2;this.groundKey(this.transitionKey)}
    else{this.nextFrame=this.next(this.nextFrame,this.nextSequence);this.duration=this.seq().frames[this.frame][0];if(!this.duration)o=0;this.flags&=~2;this.loadGround()}
    this.offset=0;if(this.arrival())o=0;
   }this.offset=o;return;
  }
  if(o<0){let guard=0;while(o<0){if(++guard>10000)throw Error('Animation reverse loop');this.nextSequence=this.sequence;this.nextFrame=this.frame;
    if(this.frame===this.armedFrame){this.sequence=this.destination;this.frame=this.destinationFrame;this.duration=this.transitionDuration;this.armedFrame=-1;this.flags|=2;this.groundKey(this.transitionKey)}
    else{this.frame=this.previous(this.frame);this.duration=this.seq().frames[this.frame][0];this.flags&=~2;this.loadGround()}
    this.commit(true);if(-o>this.duration){this.offset=0;o=ESMath.word(o+this.duration)}else{this.offset=ESMath.word(o+this.duration);o=0}if(this.arrival())this.offset=o=0;
   }return;
  }this.offset=o;
 }
 elapsed(){return this.seq().frames.slice(0,this.frame).reduce((sum,f)=>sum+f[0],this.offset)}
 locals(){const s=this.seq(),next=this.seq(this.nextSequence),n=s.part_list.length,p=this.a.defaults.map(i=>this.a.transforms[i].map(ESMath.word)),fraction=Math.trunc((this.offset*1024+Math.trunc(this.duration/2))/this.duration);for(let i=0;i<n;i++){const node=s.part_list[i];if(node){const a=this.a.transforms[s.transform_indices[this.frame*n+i]],b=this.a.transforms[next.transform_indices[this.nextFrame*n+i]];p[node]=ESMath.interpolate(a,b,fraction).map(ESMath.word)}}return p}
 snapshot(){const dirty=this.a.defaults.map(()=>0);for(const node of this.seq().part_list)if(node)dirty[node]=1;return{state:animationFields.map(k=>this[k]),root:ESMath.transformArray(this.root),world:ESMath.transformArray(this.world()),locals:this.locals().flat(),dirty,elapsed:this.elapsed()}}
 action(op){const [name,...args]=op;if(name==='rate')this.setRate(...args);else this[name](...args)}
};
