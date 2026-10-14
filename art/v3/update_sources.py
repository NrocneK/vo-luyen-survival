"""Chuyển công cụ v2 sang v3 và cập nhật trang kiểm tra; chạy một lần."""
from pathlib import Path
HERE=Path(__file__).resolve().parent
for name in ['export_scene_assets.py','render_scene_preview.py','validate_assets.py','package_assets.py']:
    path=HERE/name
    path.write_text(path.read_text(encoding='utf-8').replace('assets/v2','assets/v3').replace('art/v2','art/v3').replace('stage0-assets-v2.zip','stage0-assets-v3.zip'),encoding='utf-8')
path=HERE/'preview-template.html'
s=path.read_text(encoding='utf-8').replace('Asset v2','Asset v3').replace('3.840 khung','7.024 khung').replace('assets/v2','assets/v3')
s=s.replace('mô hình và rig Blender kèm bộ xuất.','37 đòn riêng · combo và mốc ra đòn kèm mô hình Blender.')
s=s.replace('<option value="walk">Di chuyển</option><option value="idle">Đứng</option><option value="attack">Tấn công</option><option value="death">Bị hạ</option>', '<option value="attack-combo">Luân phiên toàn bộ đòn</option><option value="walk">Di chuyển</option><option value="idle">Đứng</option><option value="death">Bị hạ</option>')
s=s.replace('<label>Tốc độ <select id="speed">','<label><input type="checkbox" id="repeatAttack" checked>Lặp đòn để xem</label><label>Tốc độ <select id="speed">',1)
s=s.replace('<details><summary>Bảng các pha đi', '<details><summary>Bảng các đòn — chuẩn bị, ra đòn, thu về</summary><img id="attackPoses" class="inspect" alt="Các đòn đánh riêng"></details><details><summary>Bảng các pha đi')
s=s.replace("function select(){current=", "function select(){const oldState=state.value;current=")
s=s.replace("if(!current)return;image=new Image();", "if(!current)return;state.replaceChildren();for(const [id,label] of [['attack-combo','Luân phiên toàn bộ đòn'],...current.attacks.map(a=>[a.id,a.name]),['walk','Di chuyển'],['idle','Đứng'],['death','Bị hạ']]){const option=document.createElement('option');option.value=id;option.textContent=label;state.append(option)}state.value=[...state.options].some(o=>o.value===oldState)?oldState:'attack-combo';document.getElementById('attackPoses').src='preview/'+current.id+'-attack-poses.png';image=new Image();")
s=s.replace('chu kỳ đi 12 khung / 0,8 giây`','${current.attacks.length} đòn riêng · chu kỳ đi 12 khung / 0,8 giây`')
start=s.index("document.querySelector('#step').onclick=")
end=s.index("document.querySelector('#restart')",start)
s=s[:start]+"document.querySelector('#step').onclick=()=>{playing=false;const a=clip('S');elapsed=((Math.floor(elapsed*a.frameRate)+1)%a.frames.length+.01)/a.frameRate;syncPause()};\n"+s[end:]
start=s.index('function animate(t)')
end=s.index('// Thư viện ảnh',start)
s=s[:start]+'''// Preview có thể lặp; JSON runtime của từng đòn vẫn repeat: 0.
function clip(direction){
  if(state.value==='attack-combo')return {frames:current.attacks.flatMap(a=>current.animations[a.id+'-'+direction].frames),frameRate:current.attacks[0].frameRate,repeat:-1};
  const a=current.animations[state.value+'-'+direction];
  return {...a,repeat:state.value.startsWith('attack-')&&document.getElementById('repeatAttack').checked?-1:a.repeat};
}
function drawSprite(ctx,im,actor,name,x,y,scale){
  const info=actor.atlasFrames[name],f=info.frame,o=info.spriteSourceSize;
  ctx.drawImage(im,f.x,f.y,f.w,f.h,x+o.x*scale,y+o.y*scale,o.w*scale,o.h*scale);
}
function animate(t){
  if(last&&playing)elapsed+=(t-last)/1000*Number(speed.value);last=t;
  if(currentView==='actors'&&current&&image.complete&&image.naturalWidth){
    const s=current.size,z=Number(zoom.value),n=s*z;
    document.querySelector('#grid').style.gridTemplateColumns=`repeat(${Math.max(1,Math.min(4,Math.floor((document.querySelector('#grid').clientWidth+14)/(n+16))))},minmax(0,1fr))`;
    for(const c of cards){
      const a=clip(c.d),count=a.frames.length;let f=Math.floor(elapsed*a.frameRate);
      f=a.repeat===-1?f%count:Math.min(f,count-1);
      const ctx=c.canvas.getContext('2d');c.canvas.width=c.canvas.height=n;c.canvas.parentElement.style.height=n+'px';
      const angle=(45-c.r*45)*Math.PI/180,v=current.walk.worldSpeed;
      const vx=Math.sin(angle)*v,vy=-Math.cos(angle)*v,time=state.value==='walk'&&move.checked?elapsed:0;
      const gx=(((-vx*time)%1)+1)%1,gy=(((-vy*time)%1)+1)%1,sc=s/current.camera.orthoScale;
      floor(ctx,n,(gx+gy)*.7071*sc*z,(gx-gy)*.408248*sc*z,background.value);ctx.imageSmoothingEnabled=false;
      const name=a.frames[f];drawSprite(ctx,image,current,name,0,0,z);
      const attack=current.attacks.find(a=>name.startsWith(a.id+'-'));
      const localFrame=attack?Number(name.slice(-2)):f;
      const phase=attack?(localFrame<=4?'Chuẩn bị':localFrame<=8?'Ra đòn':'Thu về'):'';
      c.label.textContent=attack?`${attack.name} · ${localFrame+1}/14 · ${phase}`:`${f+1}/${count} · ${state.options[state.selectedIndex].text}`;
      c.canvas.dataset.frame=name;c.canvas.dataset.drawn='true';
    }
  }
  if(currentView==='scene')drawScene();if(currentView==='effects')drawEffects();requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

'''+s[end:]
s=s.replace('ctx.drawImage(im,(idx%20)*a.size,Math.floor(idx/20)*a.size,a.size,a.size,point[0]-a.origin[0]*a.size*scale,point[1]-a.origin[1]*a.size*scale,a.size*scale,a.size*scale)',"drawSprite(ctx,im,a,animation.frames[f],point[0]-a.origin[0]*a.size*scale,point[1]-a.origin[1]*a.size*scale,scale)")
s=s.replace("const idx=a.frameGrid.stateOffsets[state]+a.directions.indexOf(direction)*animation.frames.length+f;",'')
path.write_text(s,encoding='utf-8')
print('V3_SOURCES_UPDATED')
