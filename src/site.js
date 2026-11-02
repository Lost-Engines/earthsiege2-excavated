const menu=document.querySelector('[data-menu]'),nav=document.getElementById('navigation');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.focus()}});
for(const audio of document.querySelectorAll('audio'))audio.addEventListener('play',()=>{for(const other of document.querySelectorAll('audio'))if(other!==audio)other.pause()});
