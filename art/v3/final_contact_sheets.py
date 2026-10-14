"""Bảng kiểm tra trực quan của đủ actor từ PNG runtime cuối."""
from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
m=json.loads((ROOT/'public/assets/v3/asset-manifest.json').read_text(encoding='utf-8'))
actors=sorted(m['actors'],key=lambda a:a['id'])
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
for group in range(2):
    board=Image.new('RGB',(1100,1200),(20,33,37));draw=ImageDraw.Draw(board)
    for row,a in enumerate(actors[group*6:(group+1)*6]):
        samples=[('attack-1','SE',3),('attack-1','SE',7),('attack-2','SE',7),('attack-3','SE',7),('attack-4' if len(a['attacks'])==4 else 'attack-3','S' if len(a['attacks'])==4 else 'N',7)]
        for col,(state,direction,index) in enumerate(samples):
            path=ROOT/'public'/Path(a['atlas']).parent/f'{state}-{direction}-{index:02d}.png'
            im=Image.open(path).convert('RGBA');l,t,r,b=im.getchannel('A').getbbox()
            ax,ay=a['origin'][0]*im.width,a['origin'][1]*im.height
            scale=min(2,125/max(1,ay-t),23/max(1,b-ay),98/max(1,ax-l),98/max(1,r-ax))
            im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST)
            x=col*220+110-round(a['origin'][0]*im.width);y=row*200+173-round(a['origin'][1]*im.height)
            board.paste(im,(x,y),im)
            draw.text((col*220+8,row*200+8),f'{a["id"]}\n{state} {direction} / {index+1}',font=font,fill=(223,203,146))
    board.save(HERE/'preview'/f'final-contact-{group+1}.png')
print('FINAL_CONTACT_SHEETS_EXPORTED')
