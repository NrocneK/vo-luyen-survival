const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],missing=[],checks=[];page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
 try{
  await page.goto('http://127.0.0.1:5176/qa/world-two-effects.html');await page.waitForFunction(()=>window.worldTwoQA?.bridge.getSnapshot().status==='ready');
  await page.evaluate(()=>worldTwoQA.setup(7,false));
  assert.equal(await page.evaluate(()=>worldTwoQA.game.scene.getScene('forest').player.constructor.name),'PlayerView');
  await page.locator('.station-nav button').filter({hasText:'Trang bị'}).click();
  for(const[id,name]of [
   ['huyen-duong-thanh-kiem','Huyền Dương Thánh Kiếm'],['huyen-quang-quan','Huyền Quang Quan'],['thanh-nguyen-chien-y','Thánh Nguyên Chiến Y'],['kim-cuong-ho-uyen','Kim Cương Hộ Uyển'],['ngu-phong-ngoa','Ngự Phong Ngoa'],['thanh-tam-ngoc-boi','Thánh Tâm Ngọc Bội'],['thanh-chu-ngoc-an','Thánh Chủ Ngọc Ấn']
  ]){
   await page.locator('.craft-card').filter({has:page.getByRole('heading',{name:`${name} +0`,exact:true})}).getByRole('button',{name:'Trang bị',exact:true}).click();
   await page.waitForFunction(id=>worldTwoQA.game.scene.getScene('forest').player.equipmentKey.includes(id),id);
  }
  await page.waitForFunction(()=>{const p=worldTwoQA.game.scene.getScene('forest').player;return p.appearanceReady&&p.mode==='sword';});
  const look=await page.evaluate(()=>{const p=worldTwoQA.game.scene.getScene('forest').player;return{looks:p.looks,texture:p.sprite.texture.key,scale:p.sprite.scaleX};});
  assert.equal(look.looks.length,7);assert.ok(look.texture.startsWith('hero-v9-sword'));checks.push('Bảy nút Trang bị thật cập nhật ngoại quan trong lobby; đổi kiếm tải đúng atlas');
  await page.screenshot({path:'art/hero-equipment/qa/inventory.png'});
  await page.evaluate(()=>worldTwoQA.bridge.dispatch({type:'start'}));await page.waitForFunction(()=>worldTwoQA.engine()?.mode==='playing');
  await page.evaluate(()=>{worldTwoQA.freeze();worldTwoQA.game.loop.sleep();});
  const inRun=await page.evaluate(()=>{const s=worldTwoQA.game.scene.getScene('forest');s.renderRun(0);const p=s.player;return{looks:p.looks.length,scale:p.sprite.scaleX,unit:s.projection.pixelsPerUnit,texture:p.sprite.texture.key};});
  assert.equal(inRun.looks,7);assert.ok(Math.abs(inRun.scale-inRun.unit/100)<1e-9);checks.push('Mang đủ ngoại quan vào trận, giữ 100 pixel/đơn vị và neo clip');
  const motion=await page.evaluate(()=>{const s=worldTwoQA.game.scene.getScene('forest'),e=worldTwoQA.engine(),p=s.player,result=[];
   for(const d of ['S','SW','W','NW','N','NE','E','SE']){
    p.render(e.position,d,.1,1,.29,.58);const a=p.attachment('back');
    if(!Number.isFinite(a.x+a.y))throw Error('Điểm gắn không hữu hạn');
    result.push({direction:d,frame:p.sprite.frame.name,back:a});
   }
   p.render(e.position,'S',.1,1,.57,.58);const attackClip=p.clip;p.render(e.position,'S',.55,0,0,.58);
   if(p.clip!==attackClip)throw Error('Về thủ giữa liên chiêu');
   return result;
  });assert.equal(new Set(motion.map(x=>x.frame)).size,8);checks.push('Tám hướng dùng khung khác nhau, điểm gắn theo pose');
  await page.evaluate(()=>{worldTwoQA.prepareEffect('nhap-ma');const p=worldTwoQA.engine().profile;p.equipped={weapon:'huyen-duong-thanh-kiem',head:'huyen-quang-quan',body:'thanh-nguyen-chien-y',hands:'kim-cuong-ho-uyen',feet:'ngu-phong-ngoa',jewel:'thanh-tam-ngoc-boi',relic:'thanh-chu-ngoc-an'};worldTwoQA.advance(.8);worldTwoQA.game.step(performance.now(),16.667);});
  const ma=await page.evaluate(()=>{const p=worldTwoQA.game.scene.getScene('forest').player;return{tint:p.statusTint,visible:p.pieces.filter(x=>x.visible).length,all:p.pieces.filter(x=>x.visible).every(x=>x.isTinted)};});
  assert.ok(ma.tint!==null&&ma.all&&ma.visible>0);
  await page.evaluate(()=>{worldTwoQA.advance(5);worldTwoQA.game.step(performance.now(),16.667);});
  assert.equal(await page.evaluate(()=>worldTwoQA.game.scene.getScene('forest').player.statusTint),null);checks.push('Nhập Ma đổi cả các lớp, hết hiệu lực trả màu trang bị');
  await page.evaluate(()=>{const e=worldTwoQA.engine();e.finish(false,'QA ngã','defeat');worldTwoQA.game.step(performance.now(),16.667);});
  const first=await page.evaluate(()=>worldTwoQA.game.scene.getScene('forest').player.frame);
  await page.evaluate(()=>{for(let i=0;i<20;i++)worldTwoQA.game.step(performance.now()+i*100,100);});
  const death=await page.evaluate(()=>{const p=worldTwoQA.game.scene.getScene('forest').player;return{frame:p.frame,count:p.clip.count,last:p.sprite.frame.name};});
  assert.ok(first<death.frame);assert.equal(death.frame,death.count-1);checks.push('Tử trận phát ngã hết rồi giữ khung cuối, không đóng ở giữa clip');
  await page.screenshot({path:'art/hero-equipment/qa/game-death.png'});
  await page.evaluate(()=>{worldTwoQA.setup(7,true);worldTwoQA.engine().abandon();worldTwoQA.game.step(performance.now(),16.667);});
  assert.equal(await page.evaluate(()=>worldTwoQA.game.scene.getScene('forest').player.clip.loop),true);checks.push('Rút lui giữ nhân vật sống, khác hoạt ảnh tử trận');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);fs.writeFileSync('qa/hero-equipment-game-qa.json',JSON.stringify({version:'2.1.0',checks,look,inRun,motion,ma,death,errors,missing},null,2));console.log('Đạt',checks.length,'nhóm ngoại quan trong game');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
