"""Đưa nền phẳng sang phép chiếu isometric và đóng gói các asset tĩnh đã kiểm tra."""
from pathlib import Path
import copy
import json
import math
import shutil
import hashlib
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
PUBLIC=ROOT/'public'
OUT=PUBLIC/'assets/v3'
HERE=ROOT/'art/v3'
manifest=json.loads((OUT/'asset-manifest.json').read_text(encoding='utf-8'))
source_manifest=PUBLIC/'assets/asset-manifest.json'
if not source_manifest.exists():source_manifest=HERE/'shared-source-manifest.json'
old=json.loads(source_manifest.read_text(encoding='utf-8'))
shared=[]
for item in old['assets']:
    if item['type']=='actor':continue
    for key in ('file','atlas'):
        if not item.get(key):continue
        src=PUBLIC/item[key]
        src_root=OUT if src.is_relative_to(OUT) else PUBLIC/'assets'
        dst=OUT/src.relative_to(src_root)
        dst.parent.mkdir(parents=True,exist_ok=True)
        if src.resolve()!=dst.resolve():shutil.copyfile(src,dst)
    folder=(PUBLIC/item['file']).with_suffix('')
    dest_folder=OUT/item['kind']/item['id']
    if folder.is_dir() and folder.resolve()!=dest_folder.resolve():
        shutil.copytree(folder,dest_folder,dirs_exist_ok=True)
    entry=copy.deepcopy(item)
    for key in ('file','atlas'):
        if key in entry and not entry[key].startswith('assets/v3/'):
            entry[key]=entry[key].replace('assets/','assets/v3/',1)
    shared.append(entry)

# Chính là phép chiếu orthographic của một mặt đất Z=0 ở camera 35,264°.
# Không kéo méo các props đứng: chỉ chiếu texture đất vốn phẳng.
width,height=1280,896
ppu=96/2.9
cx,cy=width/2,height/2
bound=12
flat_source=HERE/'input-ground-flat.png'
original_flat=PUBLIC/'assets/maps/hac-phong-son-ground.png'
if original_flat.exists():shutil.copyfile(original_flat,flat_source)
src=Image.open(flat_source).convert('RGBA')
a=src.width/(4*bound*ppu/math.sqrt(2))
b=src.height/(4*bound*ppu/math.sqrt(6))
transform=(a,b,src.width/2-a*cx-b*cy,a,-b,src.height/2-a*cx+b*cy)
floor=src.transform((width,height),Image.Transform.AFFINE,transform,resample=Image.Resampling.NEAREST,fillcolor=(0,0,0,0))
ground_path=OUT/'maps/hac-phong-son-ground.png'
floor.save(ground_path)
ground=next(s for s in shared if s['id']=='hac-phong-son-ground')
ground['dimensions']=[width,height]
ground['camera']='isometric-35.264-degrees'
ground['projection']='world-ground-plane'
for entry in shared:
    entry['sha256']=hashlib.sha256((PUBLIC/entry['file']).read_bytes()).hexdigest()

props=next(s for s in shared if s['type']=='props')
objects=[]
def add(frame,x,y,scale=1,collider=.35):
    objects.append({'frame':frame,'world':[x,y],
                    'screen':[cx+(x+y)*ppu/math.sqrt(2),cy+(x-y)*ppu/math.sqrt(6)],
                    'scale':scale,'origin':props['origin'],
                    'collision':{'shape':'circle','radiusWorld':collider} if collider else None})

# Cây chủ yếu viền map; phần giữa đủ rộng cho né đòn và hordes.
for j,v in enumerate([-10,-7,-4,0,4,7,10]):
    for x,y in [(-11,v),(11,v),(v,-11),(v,11)]:
        add('cay-thong' if j%2==0 else 'cay-la-rong',x,y,1.05+.1*(j%3),.48)
for frame,x,y,scale,radius in [
    ('da-lon',-4,2,.65,.65),('da-nho',5,1,.6,.4),('da-nhon',2,-5,.75,.4),
    ('than-cay',-5,-4,.75,.55),('goc-cay',5,5,.65,.4),('re-cay',-8,0,.65,.45),
    ('tuong-vo',-8,7,.75,.6),('cot-da',-9,8,.7,.4),('mieu-da',-9,9,.82,.55),
    ('den-da',-7,9,.7,.35),('cay-kho',8,-7,.85,.4),('bui-truc',7,-9,.9,.4),
    ('duong-xi',3,5,.55,0),('nam-do',-3,-6,.55,0),('duong-xi',-9,-6,.65,0),
    ('nam-do',9,6,.50,0)]:add(frame,x,y,scale,radius)
layout={'id':'hac-phong-son','camera':{'type':'orthographic','elevationDegrees':35.26438968,'azimuthDegrees':-45},
        'dimensions':[width,height],'worldBounds':{'minX':-bound,'maxX':bound,'minY':-bound,'maxY':bound},
        'pixelsPerWorldUnit':ppu,'screenOrigin':[cx,cy],
        'projectionMatrix':[[ppu/math.sqrt(2),ppu/math.sqrt(2)],[ppu/math.sqrt(6),-ppu/math.sqrt(6)]],
        'playerSpawn':[0,0],'bossSpawn':[-6,6],'props':objects,
        'previewActors':[
          {'id':'duong-khai','world':[0,0],'direction':'S'},
          {'id':'linh-ho','world':[-1.0,-.8],'direction':'SE'},
          {'id':'thanh-dieu','world':[1.0,.8],'direction':'S'},
          {'id':'hac-lang','world':[-4,-2],'direction':'SE'},
          {'id':'thiet-nha-tru','world':[4,-1],'direction':'SW'},
          {'id':'doc-thiem','world':[-3,1],'direction':'NW'},
          {'id':'hac-lang-tinh-anh','world':[5,4],'direction':'W'},
          {'id':'hac-phong-lang-vuong','world':[-6,6],'direction':'S'}]}
(OUT/'maps/hac-phong-son-layout.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2),encoding='utf-8')
manifest['sharedAssets']=shared
manifest['sceneLayout']=layout
(HERE/'shared-source-manifest.json').write_text(json.dumps({'version':2,'assets':shared},ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
template=(HERE/'preview-template.html').read_text(encoding='utf-8')
(HERE/'ASSET_PREVIEW.html').write_text(template.replace('__MANIFEST__',json.dumps(manifest,ensure_ascii=False)),encoding='utf-8')
print('Đã xuất nền isometric, layout và',len(shared),'nhóm asset tĩnh.')
