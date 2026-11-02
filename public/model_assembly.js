/* ES2 runtime assembly. Layout/consumer leads: Herculan's mech-shape-drawing
 * and weapon-mounts notes; local tables retain original offsets and bytes. */
'use strict';
globalThis.ESModel={};
ESModel.walk=function*(shape){yield shape;for(const part of shape.parts||[])yield*ESModel.walk(part)};
ESModel.bank=(row,root=0)=>{
 const key=row.roots[root]?.bank||row.roots[root]?.bindings?.[0]?.bank;
 return key?mediaData.images.find(r=>r.key===key)?.name:row.bank;
};
ESModel.weaponBank=()=>mediaData.images.find(r=>r.key==='dba/wpntex.dba')?.name;
ESModel.banks=(row,root=0,override=null)=>[override??ESModel.bank(row,root),row.mounts.length?ESModel.weaponBank():null].filter(Boolean);
ESModel.defaultFit=row=>Object.fromEntries(Object.entries(row.loadout?.slots||{}).map(([key,v])=>[key,v.weapon]));
ESModel.instances=(row,objects,root,{sequence=-1,frame=0,fraction=0,thread=null,fit={},weapons=[],renderer,matrix=ES.ident()}={})=>{
 const shape=objects[root],poseShape=row.kind==='lod'?objects[0]:shape;
 const nativeTransforms=ESMath.pose(poseShape,sequence,frame,fraction,thread),transforms=nativeTransforms.map(t=>t?ESMath.webgl(t):null),hidden=new Set(row.mounts.filter(m=>m.mount<4).map(m=>m.part));
 const items=[{shape,transforms,nativeTransforms,matrix,hiddenParts:hidden,attachments:new Map()}];
 const parts=new Map([...ESModel.walk(shape)].map(p=>[p.id,p]));
 for(const mount of row.mounts){
  const id=fit[mount.slot]||0,weapon=modelAssemblies.weapons[id],part=parts.get(mount.part);
  if(!id||!weapon||!part||mount.mount>=4)continue;
  const model=weapons[weapon.models[mount.mount]];if(!model)continue;
  const offset=mount.offset.slice();
  if(mount.mount<2)offset[2]+=(mount.mount===0?1:-1)*weapon.side[2];
  else offset[0]+=(mount.mount===2?-1:1)*weapon.side[0];
  const local=ES.ident();local.splice(12,3,...offset);
  items[0].attachments.set(mount.part,{shape:model,matrix:ES.mul(matrix,ES.mul(transforms[part.transform]||ES.ident(),local)),transforms:ES.pose(model),nativeTransforms:ESMath.pose(model),textureOffset:renderer.bankOffsets[ESModel.weaponBank()]||0,allowCellOverride:false});
 }
 return items;
};
