"""Bảng pose nội bộ để kiểm tra trước khi xuất asset."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from attack_library import attacks
import sys
HERE=Path(__file__).resolve().parent
for actor in sys.argv[1:]:
    config=attacks(actor);folder=HERE/'renders'/actor
    direction='SE' if (folder/'attack-1-SE-13.png').exists() else 'S'
    board=Image.new('RGB',(1000,len(config)*230),(20,33,37))
    draw=ImageDraw.Draw(board);font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
    for row,a in enumerate(config):
        for col,frame in enumerate([0,3,7,10,13]):
            path=folder/f'{a["id"]}-{direction}-{frame:02d}.png'
            if not path.exists():continue
            im=Image.open(path).convert('RGBA');im.thumbnail((200,200),Image.Resampling.NEAREST)
            board.paste(im,(col*200+(200-im.width)//2,row*230+30),im)
            draw.text((col*200+5,row*230+5),f'{a["name"]} / {frame}',font=font,fill=(233,206,142))
    board.save(HERE/'preview'/(actor+'-raw-poses.png'))
