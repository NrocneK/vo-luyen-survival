"""Chuẩn hóa ảnh hướng nhìn để làm nguồn tạo hoạt ảnh; không tạo pose bằng code."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(__file__).resolve().parent/"sources/duong-khai-directions.png"
OUT=Path(__file__).resolve().parent/"references"
image=Image.open(SOURCE).convert("RGBA")
mask=np.array(image.getchannel("A"))>=128

def cut(projection,ideal,radius):
    lo=max(1,round(ideal-radius));hi=min(len(projection)-1,round(ideal+radius))
    empty=np.where(projection[lo:hi]==0)[0]+lo
    return int(empty[np.argmin(abs(empty-ideal))]) if len(empty) else lo+int(np.argmin(projection[lo:hi]))

w,h=image.size
yc=[0,cut(mask.sum(axis=1),h/2,h*.18),h]
cells=[]
for row in range(2):
    p=mask[yc[row]:yc[row+1]].sum(axis=0)
    xc=[0]+[cut(p,w*i/4,w*.08) for i in range(1,4)]+[w]
    for col in range(4):
        crop=image.crop((xc[col],yc[row],xc[col+1],yc[row+1]))
        bbox=crop.getchannel("A").getbbox()
        cells.append(crop.crop(bbox))
# Giữ các góc nguồn đúng; các ảnh đối xứng là reference, không dùng đổi mặt thành lưng.
mapping={"S":(0,False),"SW":(7,True),"W":(2,False),"NW":(5,True),"N":(4,False),"NE":(5,False),"E":(6,False),"SE":(7,False)}
for direction,(i,mirror) in mapping.items():
    sprite=cells[i]
    if mirror:sprite=sprite.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    scale=min(240/sprite.height,240/sprite.width)
    sprite=sprite.resize((round(sprite.width*scale),round(sprite.height*scale)),Image.Resampling.NEAREST)
    canvas=Image.new("RGBA",(288,288))
    canvas.alpha_composite(sprite,((288-sprite.width)//2,264-sprite.height))
    canvas.save(OUT/(direction+".png"))
(OUT/"mapping.json").write_text(json.dumps(mapping,indent=2),encoding="utf-8")
print({"source":image.size,"references":list(mapping)})
