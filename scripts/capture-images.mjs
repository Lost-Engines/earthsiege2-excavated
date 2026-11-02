import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.env.PORT||='4183';process.env.SITE_PREFIX='/earthsiege2-excavated';
const server=await serve(),url=`http://127.0.0.1:${process.env.PORT}${process.env.SITE_PREFIX}/`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1640,height:1100},deviceScaleFactor:1,colorScheme:'light'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
const records=[];
async function shot(file,route,ready,selector,setup){await page.goto(url+route);await page.waitForFunction(ready,{},{timeout:45000});if(selector==='#view'&&route.startsWith('models/'))await page.locator('#view').evaluate(c=>{c.style.width='760px';c.style.height='600px'});if(setup)await page.evaluate(setup);await page.waitForTimeout(500);const target=page.locator(selector);await target.scrollIntoViewIfNeeded();await page.waitForTimeout(300);const bytes=await target.screenshot({path:path.join(root,'public/images',file)});records.push({image:file,method:'Public browser viewer, Chromium with WebGL software rasterization',page:route,selector,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});console.log(file)}
try{
 await shot('colossus.png','models/#dts%2Fcolossus.dts',()=>typeof geometry!=='undefined'&&geometry?.faces>0&&resource?.key==='dts/colossus.dts','#view',()=>{angle=2.27;elevation=.2;zoom=.88;draw()});
 await shot('raptor.png','models/#dts%2Fraptor2.dts',()=>typeof geometry!=='undefined'&&geometry?.faces>0&&resource?.key==='dts/raptor2.dts','#view',()=>{angle=2.27;elevation=.18;zoom=.85;draw()});
 await shot('moon.png','missions/?tape=demo3#C5_02',()=>typeof geometry!=='undefined'&&geometry?.faces>0&&compiled?.inputs?.tape==='demo3'&&scene?.squad,'#sceneWrap',()=>{const g=scene.groups.find(g=>g.kind===2&&g.actors.length&&!g.waiting);if(g)focusGroup(g.index);camera.radius*=.4;camera.elevation=.75;camera.angle=.3;requestDraw()});
 await shot('cockpit.png','cockpits/#razor',()=>typeof current!=='undefined'&&current?.key==='razor'&&$('info').textContent.includes('source artwork'),'#view');
 await shot('tape.png','replays/',()=>typeof frames!=='undefined'&&frames.length>100,'#plot');
 await page.goto(url+'models/');await page.waitForFunction(()=>typeof geometry!=='undefined'&&geometry?.faces>0);await page.screenshot({path:path.join(root,'.test-output/models-desktop.png'),fullPage:true});
 const original=JSON.parse(await fs.readFile(path.join(root,'public/images/original-provenance.json'),'utf8'));await fs.writeFile(path.join(root,'public/images/provenance.json'),JSON.stringify([...original,...records],null,2)+'\n');
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.close();}
