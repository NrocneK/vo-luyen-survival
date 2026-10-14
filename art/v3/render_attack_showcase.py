"""GIF bàn giao ghép từ PNG runtime: quyền, kiếm, boss ở tốc độ từng clip."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json
import math

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'public/assets/v3/asset-manifest.json').read_text(encoding='utf-8'))
ids=['duong-khai','duong-khai-kiem','hac-phong-lang-vuong']
actors=[next(a for a in manifest['actors'] if a['id']==id) for id in ids]
scales={}
for a in actors:
    left=right=up=down=1
    for attack in a['attacks']:
        for name in a['animations'][attack['id']+'-SE']['frames']:
            im=Image.open(ROOT/'public'/Path(a['atlas']).parent/(name+'.png'))
            l,t,r,b=im.getchannel('A').getbbox();ax,ay=a['origin'][0]*im.width,a['origin'][1]*im.height
            left=max(left,ax-l);right=max(right,r-ax);up=max(up,ay-t);down=max(down,b-ay)
    # Một tỉ lệ/điểm chân cho cả bộ đòn, chừa vùng riêng cho tên và chú thích.
    scales[a['id']]=min(3,150/left,150/right,185/up,30/down)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
frames=[]
for i in range(84):
    canvas=Image.new('RGB',(1140,430),(14,26,30));draw=ImageDraw.Draw(canvas)
    draw.text((25,18),'BỘ ĐÒN ISOMETRIC · QUYỀN / KIẾM / BOSS',font=font,fill=(232,205,145))
    for col,a in enumerate(actors):
        x=col*380
        draw.rounded_rectangle((x+12,65,x+368,415),8,fill=(21,39,43),outline=(55,81,77))
        names=[n for attack in a['attacks'] for n in a['animations'][attack['id']+'-SE']['frames']]
        f=int(i*a['attacks'][0]['frameRate']/24)%len(names)
        name=names[f];attack=next(t for t in a['attacks'] if name.startswith(t['id']+'-'))
        draw.text((x+28,80),a['name'],font=font,fill=(229,220,189))
        draw.text((x+28,115),attack['name'],font=small,fill=(153,198,183))
        draw.ellipse((x+164,323,x+217,337),fill=(12,24,26))
        path=(ROOT/'public'/Path(a['atlas']).parent)/(name+'.png')
        n=round(a['size']*scales[a['id']]);im=Image.open(path).convert('RGBA').resize((n,n),Image.Resampling.NEAREST)
        point=(round(x+190-im.width*a['origin'][0]),round(330-im.height*a['origin'][1]))
        l,t,r,b=im.getchannel('A').getbbox()
        assert point[0]+l>=x+30 and point[0]+r<=x+350
        assert point[1]+t>=140 and point[1]+b<=362
        canvas.paste(im,point,im)
        k=int(name[-2:]);phase='Chuẩn bị' if k<=attack['windupFrames'][1] else ('Ra đòn' if k<=attack['activeFrames'][1] else 'Thu về')
        draw.text((x+28,378),f'{phase} · khung {k+1}/14',font=small,fill=(142,164,157))
    frames.append(canvas)
frames[0].save(HERE/'preview/attack-showcase.gif',save_all=True,append_images=frames[1:],duration=[40,40,40,40,40,50]*14,loop=0,disposal=2)
frames[7].save(HERE/'preview/attack-showcase.png')
print('SHOWCASE_EXPORTED')
