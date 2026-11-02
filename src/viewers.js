/* Public navigation and accessibility around the unchanged analysis calculations. */
(()=>{
 const page=document.querySelector('[data-viewer]')?.dataset.viewer;
 const enhance=()=>{for(const row of document.querySelectorAll('.viewer tr'))if(row.onclick&&!row.querySelector('button')){row.tabIndex=0;row.setAttribute('role','button');row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();row.click()}}}};
 new MutationObserver(enhance).observe(document.querySelector('.viewer'),{childList:true,subtree:true});enhance();
 if(page==='models'){
  new ResizeObserver(()=>{if(typeof shape!=='undefined'&&shape)draw()}).observe(document.getElementById('view'));
  addEventListener('hashchange',()=>{const [key,root]=decodeURIComponent(location.hash.slice(1)).split('@'),r=catalogue.find(x=>x.key===key);if(r&&(resource!==r||+$('root').value!==(Number(root)||0)))select(r,Number(root)||0).catch(EarthsiegeData.report)});
 }
 if(page==='missions'){
  addEventListener('hashchange',()=>{const name=decodeURIComponent(location.hash.slice(1)),m=missions.find(x=>x.name===name);if(m&&current!==m)selectMission(m).catch(EarthsiegeData.report)});
  // A focused link can open a base or the whole battlefield after its scene loads.
  const query=new URLSearchParams(location.search);let done=false;
  const apply=()=>{if(done||!geometry)return;done=true;if(query.has('overview'))$('overview').click();else if(query.has('focus')){const n=Number(query.get('focus'));if(scene.groups[n]?.actors.length){$('focus').value='g'+n;focusGroup(n)}}};
  const observe=new MutationObserver(()=>{apply();if(done)observe.disconnect()});observe.observe($('stats'),{childList:true});apply();
  // Shift-drag is a laptop-friendly alternative to right-drag.
  const down=$('view').onpointerdown;$('view').onpointerdown=e=>{down(e);if(e.shiftKey&&drag)drag.button=2};
 }
 if(page==='rendering')addEventListener('hashchange',()=>{if(data){const f=data.frames.find(x=>x.id===location.hash.slice(1));if(f&&selected!==f){$('world').value='';$('resolution').value='';list();select(f)}}});
 if(page==='cockpits')addEventListener('hashchange',()=>{const row=catalogue.cockpits.find(r=>r.key===location.hash.slice(1));if(row&&current!==row){current=row;draw().catch(EarthsiegeData.report)}});
})();
