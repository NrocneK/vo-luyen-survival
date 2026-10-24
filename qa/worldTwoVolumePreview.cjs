const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
 await page.goto('http://127.0.0.1:5176/qa/world-two-effects.html');await page.waitForFunction(()=>window.worldTwoQA?.bridge.getSnapshot().status==='ready',null,{timeout:60000});
 await page.evaluate(()=>worldTwoQA.game.loop.sleep());
 fs.mkdirSync('art/world-two-vfx-v5/qa',{recursive:true});
 for(const [name,id,augment,t]of [
 ['dragon','kim-long-hien-hoa','long-du',1.4],['hand-charge','gia-thien-thu','',.45],['hand-impact','gia-thien-thu','',.85],['wings','phong-loi-vu-duc','',.5],['ma','nhap-ma','',.8],['laser','diet-hon-kim-quang','',.25]
 ]){
  const info=await page.evaluate(([id,aug,t])=>{
   worldTwoQA.prepareEffect(id,aug);worldTwoQA.advance(t-.01);
   const scene=worldTwoQA.game.scene.getScene('forest');scene.cameras.main.setZoom(1.7);
   worldTwoQA.game.step(performance.now(),16.667);
   const fx=scene.techniqueEffects.skills;return{faces:fx.triangleCount,mode:worldTwoQA.engine().mode};
  },[id,augment,t]);
  await page.screenshot({path:`art/world-two-vfx-v5/qa/${name}.png`});console.log(name,info);
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
