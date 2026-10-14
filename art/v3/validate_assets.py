"""Kiểm tra dữ liệu, PNG/atlas, vòng bước và liên kết; dừng nếu còn lỗi."""
from pathlib import Path
import hashlib
import json
import math
from PIL import Image
from attack_library import states,attacks

ROOT=Path(__file__).resolve().parents[2]
PUBLIC=ROOT/'public'
OUT=PUBLIC/'assets/v3'
HERE=ROOT/'art/v3'
manifest=json.loads((OUT/'asset-manifest.json').read_text(encoding='utf-8'))
qa=json.loads((HERE/'preview/qa-report.json').read_text(encoding='utf-8'))
assert len(manifest['actors'])==12 and not manifest['remainingActors']
assert len(qa['actors'])==12
assert all(a['technicalPass'] for a in qa['actors']), 'Có actor chưa qua kiểm tra.'
frame_count=0
for actor in manifest['actors']:
    png=PUBLIC/actor['atlas'];data=json.loads((PUBLIC/actor['atlasData']).read_text(encoding='utf-8'))
    im=Image.open(png)
    assert im.mode=='RGBA' and max(im.size)<=4096
    assert actor['sha256']==hashlib.sha256(png.read_bytes()).hexdigest()
    expected=sum(v[0] for v in states(actor['id']).values())*8
    assert len(data['frames'])==expected and len(actor['animations'])==len(states(actor['id']))*8
    names=set()
    rects=set()
    for key,animation in actor['animations'].items():
        assert key.rsplit('-',1)[1] in actor['directions']
        for name in animation['frames']:
            assert name in data['frames']
            names.add(name)
    assert len(names)==expected
    for name,info in data['frames'].items():
        f=info['frame'];rect=(f['x'],f['y'],f['w'],f['h'])
        assert rect not in rects
        rects.add(rect)
        assert f['x']+f['w']<=im.width and f['y']+f['h']<=im.height
        assert info['pivot']['x']==actor['origin'][0] and info['pivot']['y']==actor['origin'][1]
        cell=im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']))
        individual=png.parent/(name+'.png')
        assert individual.exists()
        restored=Image.new('RGBA',(actor['size'],actor['size']))
        o=info['spriteSourceSize'];restored.paste(cell,(o['x'],o['y']))
        assert restored.tobytes()==Image.open(individual).convert('RGBA').tobytes()
        assert cell.getchannel('A').getbbox() is not None
        frame_count+=1
    assert (HERE/'models'/(actor['id']+'.blend')).exists()
for a in manifest['sharedAssets']:
    png=PUBLIC/a['file']
    assert png.exists() and a['sha256']==hashlib.sha256(png.read_bytes()).hexdigest()
    with Image.open(png) as im:im.verify()
    if a.get('atlas'):assert (PUBLIC/a['atlas']).exists()
layout=manifest['sceneLayout']
m=layout['projectionMatrix']
assert abs(abs(m[1][0]/m[0][0])-1/math.sqrt(3))<1e-10
ground=Image.open(OUT/'maps/hac-phong-son-ground.png')
assert ground.size==tuple(layout['dimensions']) and ground.getpixel((0,0))[3]==0
for prop in layout['props']:
    assert prop['frame'] in next(a for a in manifest['sharedAssets'] if a['type']=='props')['frameNames']
    x,y=prop['world']
    assert -12<=x<=12 and -12<=y<=12
png_count=sum(1 for _ in OUT.rglob('*.png'))
result={'status':'passed','actors':12,'directionsPerActor':8,'attackVariants':sum(len(a['attacks']) for a in manifest['actors']),
        'actorFrames':frame_count,'pngFiles':png_count,'atlasAndIndividualFramesMatch':True,
        'noClippedActors':True,'allActorTexturesUnder4096':True,
        'gaitSource':'actual bone heads and world movement, saved in qa-report.json',
        'groundProjection':'true isometric 35.26438968 degrees'}
(HERE/'preview/package-qa.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
