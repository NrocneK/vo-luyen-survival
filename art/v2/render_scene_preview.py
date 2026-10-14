"""Ghép bằng đúng PNG runtime để kiểm tra tỉ lệ và thứ tự lớp trên màn."""
from pathlib import Path
import json
import math
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
PUBLIC=ROOT/'public'
HERE=ROOT/'art/v2'
manifest=json.loads((PUBLIC/'assets/v2/asset-manifest.json').read_text(encoding='utf-8'))
layout=manifest['sceneLayout']
canvas=Image.new('RGBA',tuple(layout['dimensions']),(16,27,31,255))
canvas.alpha_composite(Image.open(PUBLIC/'assets/v2/maps/hac-phong-son-ground.png'))
propmeta=next(s for s in manifest['sharedAssets'] if s['type']=='props')
props=Image.open(PUBLIC/propmeta['file']).convert('RGBA')
layers=[]
for p in layout['props']:
    i=propmeta['frameNames'].index(p['frame']);s=propmeta['size']
    im=props.crop((i%4*s,i//4*s,(i%4+1)*s,(i//4+1)*s))
    im=im.resize((round(s*p['scale']),)*2,Image.Resampling.NEAREST)
    x,y=p['screen']
    layers.append((y,im,(round(x-im.width*p['origin'][0]),round(y-im.height*p['origin'][1]))))
for p in layout['previewActors']:
    a=next(s for s in manifest['actors'] if s['id']==p['id'])
    file=PUBLIC/a['atlas']
    im=Image.open(file.parent/('idle-'+p['direction']+'-00.png')).convert('RGBA')
    scale=layout['pixelsPerWorldUnit']/(a['size']/a['camera']['orthoScale'])
    im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST)
    wx,wy=p['world'];m=layout['projectionMatrix'];sx=layout['screenOrigin'][0]+m[0][0]*wx+m[0][1]*wy;sy=layout['screenOrigin'][1]+m[1][0]*wx+m[1][1]*wy
    layers.append((sy,im,(round(sx-im.width*a['origin'][0]),round(sy-im.height*a['origin'][1]))))
for _,im,position in sorted(layers,key=lambda p:p[0]):canvas.alpha_composite(im,position)
canvas.convert('RGB').save(HERE/'preview/hac-phong-son-isometric.png')
print('Đã ghép cảnh từ các PNG runtime.')
