"""Chuẩn hóa PNG render, atlas và trang kiểm tra. Không chứa gameplay."""
from pathlib import Path
import hashlib
import json
import math
import zipfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[2]
V2=ROOT/'art/v2'
OUT=ROOT/'public/assets/v2'
PREVIEW=V2/'preview'
PREVIEW.mkdir(parents=True,exist_ok=True)
DIRECTIONS=['S','SW','W','NW','N','NE','E','SE']
STATES={'idle':(8,8,True),'walk':(12,15,True),'attack':(10,20,False),'death':(10,12,False)}
SPECS={s['id']:s for s in json.loads((ROOT/'art/production-spec.json').read_text(encoding='utf-8')) if s['type']=='actor'}
manifest={'version':2,'camera':'isometric-35.264-degrees','renderer':'Blender Cycles CPU',
          'status':'review-candidate','gameplayStarted':False,'actors':[],'remainingActors':[]}
qa={'scope':'directional-actor-export-and-gait','actors':[]}

def save_json(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')

def pixelize(path,size,palette):
    raw=Image.open(path).convert('RGBA')
    im=raw.resize((raw.width//2,raw.height//2),Image.Resampling.NEAREST)
    alpha=im.getchannel('A').point(lambda p:255 if p>=128 else 0)
    rgb=im.convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE).convert('RGB')
    rgb.putalpha(alpha)
    # Viền 1 pixel cố định, không dịch chuyển hoặc cắt lại từng pose.
    edge=alpha.filter(ImageFilter.MaxFilter(3))
    ink=Image.new('RGBA',im.size,(16,25,30,0))
    ink.putalpha(edge)
    ink.alpha_composite(rgb)
    canvas=Image.new('RGBA',(size,size))
    canvas.alpha_composite(ink,((size-im.width)//2,(size-im.height)//2))
    return canvas

all_dirs=sorted((V2/'renders').glob('*'))
for folder in all_dirs:
    if not folder.is_dir(): continue
    id=folder.name
    expected=[folder/f'{state}-{d}-{i:02d}.png' for state,(count,_,_) in STATES.items() for d in DIRECTIONS for i in range(count)]
    if not all(p.exists() for p in expected):
        manifest['remainingActors'].append({'id':id,'reason':'render chưa đủ khung'})
        continue
    # Bảng màu lấy cả da, quần, móng, lưỡi kiếm ở mọi hướng; bỏ pixel nền alpha.
    colors=[]
    for d in DIRECTIONS:
        for state,i in [('walk',0),('attack',5),('death',9)]:
            pixels=np.asarray(Image.open(folder/f'{state}-{d}-{i:02d}.png').convert('RGBA'))
            colors.append(pixels[:,:,:3][pixels[:,:,3]>=128])
    colors=np.concatenate(colors)
    palette_pixels=np.zeros((math.ceil(len(colors)/512)*512,3),dtype=np.uint8)
    palette_pixels[:len(colors)]=colors
    contact=Image.fromarray(palette_pixels.reshape((-1,512,3)))
    palette=contact.quantize(colors=48,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    rig=json.loads((V2/(id+'-rig.json')).read_text(encoding='utf-8'))
    kind=SPECS[id]['kind']
    dest=OUT/kind/id
    dest.mkdir(parents=True,exist_ok=True)
    content_size=rig['nativeFrameSize']
    size=content_size+16
    origin=[(rig['origin'][0]*content_size+8)/size,(rig['origin'][1]*content_size+8)/size]
    camera={**rig['camera'],'orthoScale':rig['camera']['orthoScale']*size/content_size}
    atlas={'frames':{},'meta':{'app':'rig-to-sprite-v2','image':'atlas.png','format':'RGBA8888','size':{'w':20*size,'h':16*size},'scale':'1'}}
    sheet=Image.new('RGBA',(20*size,16*size))
    frame_index=0
    animations={}
    frames={}
    actor_qa={'id':id,'expectedFrames':320,'nonEmpty':0,'clipped':[],'sourceClipped':[],'uniqueWalkFrames':{},'alphaModes':set()}
    for s,(state,(count,fps,loop)) in enumerate(STATES.items()):
        state_sheet=Image.new('RGBA',(count*size,8*size))
        for r,direction in enumerate(DIRECTIONS):
            names=[]
            hashes=[]
            for i in range(count):
                name=f'{state}-{direction}-{i:02d}'
                raw=Image.open(folder/f'{name}.png').convert('RGBA')
                source_bbox=raw.getchannel('A').point(lambda p:255 if p>=128 else 0).getbbox()
                if source_bbox and (min(source_bbox[:2])<=1 or source_bbox[2]>=raw.width-1 or source_bbox[3]>=raw.height-1):
                    actor_qa['sourceClipped'].append(name)
                im=pixelize(folder/f'{name}.png',size,palette)
                frames[name]=im
                im.save(dest/f'{name}.png')
                names.append(name)
                hashes.append(hashlib.sha256(im.tobytes()).hexdigest())
                bbox=im.getchannel('A').getbbox()
                if bbox:
                    actor_qa['nonEmpty']+=1
                    if min(bbox[:2])<=0 or bbox[2]>=size or bbox[3]>=size:
                        actor_qa['clipped'].append(name)
                actor_qa['alphaModes'].update(im.getchannel('A').getextrema())
                x,y=(frame_index%20)*size,(frame_index//20)*size
                frame_index+=1
                sheet.alpha_composite(im,(x,y))
                state_sheet.alpha_composite(im,(i*size,r*size))
                atlas['frames'][name]={'frame':{'x':x,'y':y,'w':size,'h':size},'rotated':False,'trimmed':False,
                    'spriteSourceSize':{'x':0,'y':0,'w':size,'h':size},'sourceSize':{'w':size,'h':size},'pivot':{'x':origin[0],'y':origin[1]}}
            animations[f'{state}-{direction}']={'frames':names,'frameRate':fps,'repeat':-1 if loop else 0}
            if state=='walk': actor_qa['uniqueWalkFrames'][direction]=len(set(hashes))
        state_sheet.save(dest/f'{state}-8-directions.png')
        state_sheet.resize((count*64,8*64),Image.Resampling.NEAREST).save(dest/f'{state}-8-directions-64.png')
    sheet.save(dest/'atlas.png')
    save_json(dest/'atlas.json',atlas)
    save_json(dest/'animations.json',animations)
    actor_qa['alphaModes']=sorted(actor_qa['alphaModes'])
    actor_qa['atlasDimensions']=[sheet.width,sheet.height]
    actor_qa['technicalPass']=actor_qa['nonEmpty']==320 and not actor_qa['clipped'] and not actor_qa['sourceClipped'] and all(n==12 for n in actor_qa['uniqueWalkFrames'].values())
    actor_qa['technicalPass'] &= max(sheet.size)<=4096
    qa['actors'].append(actor_qa)
    entry={'id':id,'name':rig.get('name',SPECS[id]['name']),'size':size,'origin':origin,
           'directions':DIRECTIONS,'atlas':f'assets/v2/{kind}/{id}/atlas.png','atlasData':f'assets/v2/{kind}/{id}/atlas.json',
           'animations':animations,'walk':rig['walk'],'camera':camera,'frames':320,
           'frameGrid':{'columns':20,'stateOffsets':{'idle':0,'walk':64,'attack':160,'death':240}},
           'sha256':hashlib.sha256((dest/'atlas.png').read_bytes()).hexdigest()}
    actor_qa['maxFootTargetError']=rig.get('maxFootTargetError')
    if rig.get('maxFootTargetError') is not None:
        actor_qa['technicalPass'] &= rig['maxFootTargetError']<1e-5
    samples={}
    for sample in rig['trace']:
        limb=sample.get('side',sample.get('limb'))
        phase=round(sample['phase'],7)
        if 0<=phase<=1:samples[(limb,phase)]=sample
    drifts=[]
    offsets=rig['walk'].get('offsets',{'L':0,'R':.5})
    scale=rig['walk'].get('modelScale',1)
    for limb in offsets:
        last=None
        for (key,phase),sample in sorted(samples.items(),key=lambda p:p[0][1]):
            if key!=limb:continue
            point=sample.get('ankle',sample.get('foot'))
            world_y=point[1]*scale-rig['walk']['worldSpeed']*phase*rig['walk']['cycleSeconds']
            contact_cycle=math.floor(phase+offsets[limb]+1e-7)
            if last and sample['planted'] and last[1] and last[2]==contact_cycle:drifts.append(abs(world_y-last[0]))
            last=(world_y,sample['planted'],contact_cycle)
    actor_qa['maxSampledStanceDrift']=max(drifts) if drifts else None
    if drifts:actor_qa['technicalPass'] &= max(drifts)<1e-5
    manifest['actors'].append(entry)
    # Bảng tiếp đất và đổi chân; giữ nguyên ô và điểm neo.
    board=Image.new('RGB',(4*size*2,8*(size*2+28)),(20,33,37))
    draw=ImageDraw.Draw(board)
    for r,d in enumerate(DIRECTIONS):
        for c,i in enumerate([0,3,6,9]):
            im=frames[f'walk-{d}-{i:02d}'].resize((size*2,size*2),Image.Resampling.NEAREST)
            board.paste(im,(c*size*2,r*(size*2+28)+28),im)
            draw.text((c*size*2+12,r*(size*2+28)+8),f'{d} / {i:02d}',fill=(226,201,142))
    board.save(PREVIEW/f'{id}-walk-poses.png')
    gif=[]
    for i in range(12):
        canvas=Image.new('RGB',(4*size*3,2*(size*3+32)),(20,33,37))
        draw=ImageDraw.Draw(canvas)
        for r,d in enumerate(DIRECTIONS):
            x=(r%4)*size*3; y=(r//4)*(size*3+32)
            im=frames[f'walk-{d}-{i:02d}'].resize((size*3,size*3),Image.Resampling.NEAREST)
            canvas.paste(im,(x,y+32),im)
            draw.text((x+12,y+10),d,fill=(226,201,142))
        gif.append(canvas)
    gif[0].save(PREVIEW/f'{id}-walk-8-directions.gif',save_all=True,append_images=gif[1:],duration=67,loop=0,disposal=2)

known={a['id'] for a in manifest['actors']}|{a['id'] for a in manifest['remainingActors']}
manifest['remainingActors'] += [{'id':id,'reason':'chưa xuất rig v2'} for id in SPECS if id not in known]

# Kiểm tra định lượng mô hình bước đi, tách khỏi kiểm tra file PNG.
def foot(p):
    p=p%1
    if p<.6:return -.25+.5*p/.6,0,True
    u=(p-.6)/.4
    return .25-.5*u*u*(3-2*u),.15*math.sin(math.pi*u),False

plant_errors=[]
leg_errors=[]
lift=[]
for side,offset in [('L',0),('R',.5)]:
    last=None
    for i in range(1001):
        t=i*.8/1000
        phase=t/.8+offset
        y,z,planted=foot(phase)
        world_y=y-(.5/(.6*.8))*t
        if planted and last is not None and last[1] and math.floor(phase)==math.floor(last[2]):
            plant_errors.append(abs(world_y-last[0]))
        last=world_y,planted,phase
        lift.append(z)
qa['gait']={'test':'dense analytic stance in world space, 1001 samples per leg',
            'maxStanceDriftWorldUnits':max(plant_errors),'maxSwingLiftWorldUnits':max(lift),
            'phaseOffset':.5,'technicalPass':max(plant_errors)<1e-8,
            'limitation':'Số đo kiểm tra hàm pose; chuyển động PNG vẫn cần xem tại chỗ và trên nền di chuyển.'}
save_json(OUT/'asset-manifest.json',manifest)
save_json(PREVIEW/'qa-report.json',qa)
template=(V2/'preview-template.html').read_text(encoding='utf-8')
(V2/'ASSET_PREVIEW.html').write_text(template.replace('__MANIFEST__',json.dumps(manifest,ensure_ascii=False)),encoding='utf-8')
print(json.dumps({'actors':len(manifest['actors']),'pending':manifest['remainingActors'],'qa':qa},ensure_ascii=False))
