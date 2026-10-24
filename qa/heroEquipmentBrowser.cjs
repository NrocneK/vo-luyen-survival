const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const partial=process.argv.includes('--partial'),out='art/hero-equipment/qa';
async function main(){
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],missing=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});fs.mkdirSync(out,{recursive:true});
  try{
    await page.goto('http://127.0.0.1:5176/qa/hero-equipment.html');
    await page.waitForFunction(()=>window.heroQA?.view(),null,{timeout:120000});
    await page.evaluate(()=>heroQA.game.loop.sleep());
    const modes=partial?['unarmed']:['unarmed','sword'];
    for(const mode of modes){
      await page.evaluate(async m=>{await heroQA.setMode(m);heroQA.preset('sacred');},mode);
      const data=await page.evaluate(()=>{const v=heroQA.view(),mode=heroQA.state().mode;let poses=0,maxPieces=0;
        for(const[c,clip]of Object.entries(heroQA.hero.animations[mode]))for(const d of ['S','SW','W','NW','N','NE','E','SE'])for(let i=0;i<clip.count;i++){
          heroQA.pose(c,d,(i+.1)/clip.count);if(v.sprite.frame.name!==String(clip.directions[d].base[i]))throw Error('Lệch khung '+c+d+i);
          if(v.sprite.flipX||v.sprite.flipY)throw Error('Lật ảnh');
          for(const p of v.pieces.filter(p=>p.visible))if(!Number.isFinite(p.x+p.y+p.scaleX+p.scaleY)||p.x!==v.sprite.x||p.y!==v.sprite.y)throw Error('Lệch neo lớp');
          maxPieces=Math.max(maxPieces,v.pieces.filter(p=>p.visible).length);poses++;
        }
        const loaded=heroQA.hero.textures.filter(t=>heroQA.game.textures.exists(t.key));
        return{poses,maxPieces,loadedModes:[...new Set(loaded.map(t=>t.mode))],memoryMiB:loaded.reduce((n,t)=>n+t.size[0]*t.size[1]*4/1048576,0)};
      });
      assert.ok(data.poses>1000);assert.deepEqual(data.loadedModes,[mode]);checks.push({mode,...data});
      for(const preset of ['plain','world2','sacred']){
        await page.evaluate(p=>{heroQA.preset(p);heroQA.pose('idle','S',.2);heroQA.game.step(performance.now(),16.667);},preset);
        await page.screenshot({path:`${out}/${mode}-${preset}.png`});
      }
      await page.evaluate(()=>heroQA.preset('sacred'));
      for(const d of ['S','SW','W','NW','N','NE','E','SE']){
        await page.evaluate(d=>{heroQA.pose('attack-3',d,.6);heroQA.game.step(performance.now(),16.667);},d);
        await page.screenshot({path:`${out}/${mode}-${d}.png`,clip:{x:560,y:220,width:580,height:520}});
      }
      // Chuỗi thực qua PlayerView, bước đi có nền để thấy điểm đặt chân.
      for(const clip of ['walk','run','attack-1','attack-2','attack-3','death']){
        for(let i=0;i<12;i++){
          await page.evaluate(([clip,i])=>{heroQA.pose(clip,'SW',i/11*.999);heroQA.game.step(performance.now(),16.667);},[clip,i]);
          await page.screenshot({path:`${out}/${mode}-${clip}-${String(i).padStart(2,'0')}.png`,clip:{x:650,y:300,width:430,height:440}});
        }
      }
      console.log('ĐÃ RÀ',mode,data);
    }
    if(!partial){
      await page.evaluate(async()=>{await heroQA.setMode('unarmed');heroQA.pose('idle','S',0);});
      assert.deepEqual(await page.evaluate(()=>[...new Set(heroQA.hero.textures.filter(t=>heroQA.game.textures.exists(t.key)).map(t=>t.mode))]),['unarmed']);
      checks.push('Đổi quyền → kiếm → quyền: tải lại đúng bộ, giải phóng atlas cũ');
    }
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    fs.writeFileSync(`${out}/${partial?'partial':'browser'}-qa.json`,JSON.stringify({status:'passed',partial,checks,errors,missing},null,2));
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
