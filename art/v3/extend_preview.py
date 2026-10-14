"""Bổ sung trang đối chiếu asset trên màn chơi và các nhóm ảnh tĩnh. Không có gameplay."""
from pathlib import Path

HERE=Path(__file__).resolve().parent
path=HERE/'preview-template.html'
text=path.read_text(encoding='utf-8')
if 'id="libraryNav"' in text:
    print('Trang kiểm tra đã được mở rộng.')
    raise SystemExit
text=text.replace('<main>','''<nav id="libraryNav" style="padding:15px 30px;display:flex;gap:9px;flex-wrap:wrap">
<button data-view="actors">Nhân vật & sinh vật</button><button data-view="scene">Màn chơi isometric</button>
<button data-view="icons">Vật phẩm & kỹ năng</button><button data-view="effects">Hiệu ứng</button><button data-view="ui">Giao diện</button></nav>
<main><section id="actorsView">''',1)
text=text.replace('</main>','''</section>
<section id="sceneView" hidden><div class="controls"><label>Tốc độ <select id="sceneSpeed"><option value="1">1×</option><option value="0.5">0,5×</option><option value="0.25">0,25×</option></select></label><button id="scenePause">Tạm dừng</button><button id="sceneRestart">Chạy lại</button></div><canvas id="sceneCanvas" width="1280" height="896" aria-label="Hắc Phong Sơn với sprite isometric" style="width:100%;height:auto;image-rendering:pixelated;border:1px solid #39524f;border-radius:8px"></canvas><p id="sceneStatus">Đang tải các lớp ảnh…</p><p>Hắc Phong Sơn · nền và chướng ngại tách lớp · Dương Khai đi qua đủ 8 hướng với sủng vật đi cùng.</p></section>
<section id="iconsView" hidden></section><section id="effectsView" hidden></section><section id="uiView" hidden></section>
</main>''',1)
text=text.replace('let current=null,','let currentView="actors",current=null,')
text=text.replace('<option value="2">2×</option><option value="3" selected>3×</option>','<option value="2" selected>2×</option><option value="3">3×</option>')
text=text.replace("const ctx=c.canvas.getContext('2d'),n=s*z;c.canvas.width=c.canvas.height=n;", "const ctx=c.canvas.getContext('2d'),n=s*z;c.canvas.width=c.canvas.height=n;c.canvas.parentElement.style.height=n+'px';document.querySelector('#grid').style.gridTemplateColumns=`repeat(${Math.max(1,Math.min(4,Math.floor((document.querySelector('#grid').clientWidth+14)/(n+16))))},minmax(0,1fr))`;")
text=text.replace('requestAnimationFrame(animate)}requestAnimationFrame(animate);', 'if(currentView==="scene")drawScene();if(currentView==="effects")drawEffects();requestAnimationFrame(animate)}requestAnimationFrame(animate);')
extra=r'''
// Thư viện ảnh dùng trực tiếp, lấy đúng PNG và JSON trong bộ xuất.
const shared=manifest.sharedAssets||[],loadedImages=new Map(),effectCards=[];
function assetImage(key,file){if(loadedImages.has(key))return loadedImages.get(key);const im=new Image();im.src='../../public/'+file;im.onerror=()=>{document.querySelector('#sceneStatus').textContent='Không tải được '+file};loadedImages.set(key,im);return im}
function imageCard(file,label,size=96){const el=document.createElement('article');el.className='card';el.innerHTML=`<div class="stage" style="height:${size+28}px;background:repeating-conic-gradient(#17282c 0% 25%,#213a3c 0% 50%) 0/20px 20px"><img src="../../public/${file}" alt="${label}" style="image-rendering:pixelated;max-width:95%;max-height:95%"></div><div class="info">${label}</div>`;return el}
for(const a of shared){
  const folder=a.file.replace(/\.png$/,'');
  if(a.type==='icons'){const title=document.createElement('h2');title.textContent=a.name;document.querySelector('#iconsView').append(title);const grid=document.createElement('div');grid.className='grid';document.querySelector('#iconsView').append(grid);a.frameNames.forEach((f,i)=>grid.append(imageCard(folder+'/'+f+'.png',a.labels[i],100)))}
  if(a.type==='ui'){const title=document.createElement('h2');title.textContent=a.name;document.querySelector('#uiView').append(title);const grid=document.createElement('div');grid.className='grid';document.querySelector('#uiView').append(grid);a.frameNames.forEach((f,i)=>grid.append(imageCard(folder+'/'+f+'-trim.png',a.labels[i],230)))}
  if(a.type==='effects'){const grid=document.createElement('div');grid.className='grid';document.querySelector('#effectsView').append(grid);const im=assetImage(a.id,a.file);Object.keys(a.animations).forEach((name,row)=>{const el=document.createElement('article');el.className='card';el.innerHTML=`<div class="stage" style="height:256px"><canvas width="256" height="256" aria-label="${a.labels[row]}"></canvas></div><div class="info">${a.labels[row]}</div>`;grid.append(el);effectCards.push({a,im,row,canvas:el.querySelector('canvas')})})}
}
function drawEffects(){for(const {a,im,row,canvas}of effectCards){if(!im.complete||!im.naturalWidth)continue;const ctx=canvas.getContext('2d'),f=Math.floor(elapsed*12)%4;ctx.fillStyle='#14272b';ctx.fillRect(0,0,256,256);ctx.imageSmoothingEnabled=false;ctx.drawImage(im,f*a.size,row*a.size,a.size,a.size,0,0,256,256)}}
const layout=manifest.sceneLayout,sceneCanvas=document.querySelector('#sceneCanvas');
let sceneLoaded=false;
function prepareScene(){if(sceneLoaded||!layout)return;for(const a of manifest.actors)assetImage(a.id,a.atlas);for(const a of shared.filter(a=>['props','background'].includes(a.type)))assetImage(a.id,a.file);sceneLoaded=true}
function project(x,y){const m=layout.projectionMatrix;return [layout.screenOrigin[0]+m[0][0]*x+m[0][1]*y,layout.screenOrigin[1]+m[1][0]*x+m[1][1]*y]}
function route(time,v){const length=v*.8,points=[],vectors=[];let x=0,y=0;for(let d=0;d<8;d++){const a=(45-d*45)*Math.PI/180;const vec=[Math.sin(a),-Math.cos(a)];points.push([x,y]);vectors.push(vec);x+=vec[0]*length;y+=vec[1]*length}const mean=points.reduce((p,q)=>[p[0]+q[0]/8,p[1]+q[1]/8],[0,0]);const step=Math.floor(time/.8)%8,progress=time%.8;return {world:[points[step][0]-mean[0]+vectors[step][0]*v*progress,points[step][1]-mean[1]+vectors[step][1]*v*progress],direction:manifest.actors[0].directions[step]}}
function drawScene(){if(!layout||!sceneLoaded)return;const ground=loadedImages.get('hac-phong-son-ground'),props=shared.find(a=>a.type==='props'),propImage=loadedImages.get(props.id);if(!ground?.naturalWidth||!propImage?.naturalWidth)return;const ctx=sceneCanvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#101b1f';ctx.fillRect(0,0,1280,896);ctx.drawImage(ground,0,0);const hero=manifest.actors.find(a=>a.id==='duong-khai'),position=route(elapsed,hero.walk.worldSpeed),draw=[];
for(const p of layout.props){const idx=props.frameNames.indexOf(p.frame);draw.push({y:p.screen[1],run:()=>ctx.drawImage(propImage,(idx%4)*props.size,Math.floor(idx/4)*props.size,props.size,props.size,p.screen[0]-p.origin[0]*props.size*p.scale,p.screen[1]-p.origin[1]*props.size*p.scale,props.size*p.scale,props.size*p.scale)})}
for(const p of layout.previewActors){const a=manifest.actors.find(a=>a.id===p.id),im=loadedImages.get(p.id);if(!im?.naturalWidth)continue;const follows=p.id==='duong-khai'||p.id==='linh-ho'||p.id==='thanh-dieu';const world=follows?[p.world[0]+position.world[0],p.world[1]+position.world[1]]:p.world;const point=project(...world),direction=follows?position.direction:p.direction,state=follows?'walk':'idle',animation=a.animations[state+'-'+direction];const ratio=p.id==='linh-ho'?hero.walk.worldSpeed/a.walk.worldSpeed:1;const f=Math.floor(elapsed*animation.frameRate*ratio)%animation.frames.length;const idx=a.frameGrid.stateOffsets[state]+a.directions.indexOf(direction)*animation.frames.length+f;const scale=layout.pixelsPerWorldUnit/(a.size/a.camera.orthoScale);draw.push({y:point[1],run:()=>{ctx.fillStyle='rgba(5,13,13,.35)';ctx.beginPath();ctx.ellipse(point[0],point[1],a.walk.type==='quadruped'?18:11,a.walk.type==='quadruped'?8:5,0,0,Math.PI*2);ctx.fill();ctx.drawImage(im,(idx%20)*a.size,Math.floor(idx/20)*a.size,a.size,a.size,point[0]-a.origin[0]*a.size*scale,point[1]-a.origin[1]*a.size*scale,a.size*scale,a.size*scale)}})}
draw.sort((a,b)=>a.y-b.y);for(const d of draw)d.run();sceneCanvas.dataset.ready='true';document.querySelector('#sceneStatus').textContent='Các lớp PNG đã tải · cùng phép chiếu isometric · tốc độ bước ghép với chuyển động trên nền.'}
document.querySelectorAll('#libraryNav button').forEach(b=>b.onclick=()=>{currentView=b.dataset.view;for(const name of ['actors','scene','icons','effects','ui'])document.querySelector('#'+name+'View').hidden=name!==currentView;if(currentView==='scene'){prepareScene();speed.value=document.querySelector('#sceneSpeed').value}if(currentView==='effects')speed.value='1';elapsed=0;last=0});
document.querySelector('#sceneSpeed').onchange=e=>speed.value=e.target.value;
document.querySelector('#scenePause').onclick=()=>{playing=!playing;document.querySelector('#scenePause').textContent=playing?'Tạm dừng':'Chạy hoạt ảnh'};
document.querySelector('#sceneRestart').onclick=()=>{elapsed=0;playing=true;document.querySelector('#scenePause').textContent='Tạm dừng'};
'''
text=text.replace('</script>',extra+'</script>')
path.write_text(text,encoding='utf-8')
print('Đã bổ sung trang màn chơi, icon, hiệu ứng và UI.')
