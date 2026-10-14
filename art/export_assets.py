"""Xuất asset đã tạo bằng imagegen; không chứa logic game.

Người dùng đã cho phép cắt khung, căn neo và đóng gói ảnh bằng script.
Chạy lại an toàn: giữ nguyên ảnh nguồn và chỉ cập nhật các bản xuất.
"""
from pathlib import Path
import hashlib
import json
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
OUT = ROOT / "public" / "assets"
PREVIEW = ART / "preview"
SPEC = json.loads((ART / "production-spec.json").read_text(encoding="utf-8"))
OUT.mkdir(parents=True, exist_ok=True)
PREVIEW.mkdir(parents=True, exist_ok=True)
REPORT = []
MANIFEST = {"version": 1, "stage": 0, "tool": "imagegen + export_assets.py",
            "acceptance": {"status": "rejected", "camera": "side-facing-v1",
                           "reason": "Actor thiếu hướng isometric và chu kỳ bước chân trái/phải chưa đạt.",
                           "replacementStatus": "in-progress", "gameplayReady": False},
            "assets": []}

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")

def find_cuts(projection, count=4):
    """Tìm dải trống gần lưới; ảnh nguồn có thể có ô không đều."""
    length = len(projection)
    cuts = [0]
    for i in range(1, count):
        ideal = length * i / count
        reach = length / count * .43
        lo = max(cuts[-1] + 12, int(ideal - reach))
        hi = min(length - 12, int(ideal + reach))
        zero = projection[lo:hi] == 0
        starts = np.flatnonzero(np.diff(np.r_[False, zero, False].astype(int)) == 1)
        ends = np.flatnonzero(np.diff(np.r_[False, zero, False].astype(int)) == -1)
        candidates = [(lo + (a+b)//2, b-a) for a,b in zip(starts, ends) if b-a >= 2]
        if candidates:
            cut, gap = min(candidates, key=lambda p: abs(p[0]-ideal) - min(p[1], 30)*.15)
        else:
            cut = lo + int(np.argmin(projection[lo:hi]))
        cuts.append(cut)
    return cuts + [length]

def extract_cells(image, preserve_alpha=False):
    pixels = np.array(image)
    threshold = 32 if preserve_alpha else 128
    if preserve_alpha:
        alpha = pixels[:,:,3].astype(np.float32)
        alpha = np.clip(np.round(alpha/64)*64, 0, 255).astype(np.uint8)
        alpha[pixels[:,:,3] < threshold] = 0
    else:
        alpha = np.where(pixels[:,:,3] >= threshold, 255, 0).astype(np.uint8)
    pixels[:,:,3] = alpha
    pixels[alpha == 0, :3] = 0
    clean = Image.fromarray(pixels)
    mask = alpha > 0
    ycuts = find_cuts(mask.sum(axis=1))
    cells, boxes, cut_pixels = [], [], 0
    for row in range(4):
        y0,y1 = ycuts[row:row+2]
        xcuts = find_cuts(mask[y0:y1].sum(axis=0))
        for col in range(4):
            x0,x1 = xcuts[col:col+2]
            cell = clean.crop((x0,y0,x1,y1))
            bbox = cell.getchannel("A").getbbox()
            if bbox is None:
                raise ValueError(f"Ô trống ngoài dự kiến: hàng {row}, cột {col}")
            box = (x0+bbox[0], y0+bbox[1], x0+bbox[2], y0+bbox[3])
            cells.append(clean.crop(box))
            boxes.append(box)
            if col < 3:
                cut_pixels += int(mask[y0:y1,max(0,x1-1):x1+1].sum())
        if row < 3:
            cut_pixels += int(mask[max(0,y1-1):y1+1].sum())
    return cells, boxes, cut_pixels

def reduce_palette(image, colors=64):
    alpha = image.getchannel("A")
    rgb = image.convert("RGB").quantize(colors=colors, dither=Image.Dither.NONE).convert("RGB")
    rgb.putalpha(alpha)
    return rgb

def export_sheet(spec):
    source = Image.open(ART / "sources" / (spec["source"] + ".png")).convert("RGBA")
    size, typ = spec["size"], spec["type"]
    cells, boxes, cut_pixels = extract_cells(source, typ == "effects")
    frames = []
    if typ == "actor":
        # Cùng một hệ tọa độ neo cho cả 16 khung, tránh trượt khi đổi pose.
        sw,sh = source.size
        floor = float(np.median([box[3] for box in boxes[:4]]))
        rel = [(box[0]-(i%4+.5)*sw/4, box[1]-(i//4)*sh/4-floor,
                box[2]-(i%4+.5)*sw/4, box[3]-(i//4)*sh/4-floor)
               for i,box in enumerate(boxes)]
        xmin,ymin = min(b[0] for b in rel), min(b[1] for b in rel)
        xmax,ymax = max(b[2] for b in rel), max(b[3] for b in rel)
        scale = min((size-10)/(xmax-xmin), (size-10)/(ymax-ymin))
        pivot = [round((5-xmin*scale)/size, 4), round((5-ymin*scale)/size, 4)]
        for cell,box in zip(cells,rel):
            resized = cell.resize((max(1,round(cell.width*scale)), max(1,round(cell.height*scale))), Image.Resampling.NEAREST)
            frame = Image.new("RGBA",(size,size))
            frame.alpha_composite(resized,(round(5+(box[0]-xmin)*scale),round(5+(box[1]-ymin)*scale)))
            frames.append(frame)
    else:
        pivot = [.5, .5]
        # Hiệu ứng dùng cùng tỷ lệ trên cả sheet để giữ quá trình lớn/nhỏ.
        common_scale = min((size-12)/max(c.width for c in cells), (size-12)/max(c.height for c in cells))
        for cell in cells:
            scale = common_scale if typ == "effects" else min((size-12)/cell.width,(size-12)/cell.height)
            resized = cell.resize((max(1,round(cell.width*scale)),max(1,round(cell.height*scale))),Image.Resampling.NEAREST)
            frame = Image.new("RGBA",(size,size))
            y = size-6-resized.height if typ == "props" else (size-resized.height)//2
            frame.alpha_composite(resized,((size-resized.width)//2,y))
            frames.append(frame)
        if typ == "props":
            pivot = [.5, (size-6)/size]
    sheet = Image.new("RGBA",(size*4,size*4))
    for i,frame in enumerate(frames):
        sheet.alpha_composite(frame,((i%4)*size,(i//4)*size))
    sheet = reduce_palette(sheet, 80 if typ == "ui" else 64)
    directory = OUT / spec["kind"]
    directory.mkdir(parents=True, exist_ok=True)
    png = directory / (spec["id"] + ".png")
    sheet.save(png, optimize=True)
    export_dir = directory / spec["id"]
    export_dir.mkdir(exist_ok=True)
    animations = {}
    if typ == "actor":
        rows = ["idle","walk","attack","recall" if spec["kind"] == "pets" else "death"]
    elif typ == "effects":
        rows = spec["rows"]
    else:
        rows = None
    names = [f"{rows[i//4]}-{i%4}" for i in range(16)] if rows else spec["names"]
    if rows:
        rates = [5,9,10,7] if typ == "actor" else [12]*4
        animations = {row:{"frames":names[r*4:r*4+4],"frameRate":rates[r],"repeat":-1 if typ == "actor" and r<2 else 0} for r,row in enumerate(rows)}
    atlas = {"frames":{},"meta":{"app":"Stage 0 asset exporter","image":png.name,"format":"RGBA8888","size":{"w":sheet.width,"h":sheet.height},"scale":"1"}}
    for i,name in enumerate(names):
        box = ((i%4)*size,(i//4)*size,(i%4+1)*size,(i//4+1)*size)
        frame = sheet.crop(box)
        frame.save(export_dir / (name+".png"), optimize=True)
        if typ == "icons":
            frame.resize((32,32),Image.Resampling.NEAREST).save(export_dir/(name+"-32.png"),optimize=True)
        if typ == "ui":
            frame.crop(frame.getchannel("A").getbbox()).save(export_dir/(name+"-trim.png"),optimize=True)
        bbox = frame.getchannel("A").getbbox()
        if bbox is None or min(bbox[0],bbox[1],size-bbox[2],size-bbox[3]) < 3:
            raise ValueError(f"Khung bị cắt mép: {spec['id']}/{name}: {bbox}")
        atlas["frames"][name] = {"frame":{"x":box[0],"y":box[1],"w":size,"h":size},"rotated":False,"trimmed":False,"spriteSourceSize":{"x":0,"y":0,"w":size,"h":size},"sourceSize":{"w":size,"h":size},"pivot":{"x":pivot[0],"y":pivot[1]}}
    write_json(directory/(spec["id"]+".json"),atlas)
    entry = {**spec,"file":png.relative_to(ROOT / "public").as_posix(),"atlas":(directory/(spec["id"]+".json")).relative_to(ROOT / "public").as_posix(),"frameWidth":size,"frameHeight":size,"columns":4,"rows":4,"origin":pivot,"frameNames":names,"animations":animations,"sha256":hashlib.sha256(png.read_bytes()).hexdigest()}
    entry.pop("source",None)
    MANIFEST["assets"].append(entry)
    REPORT.append({"id":spec["id"],"frames":16,"size":list(sheet.size),"alpha":list(sheet.getchannel("A").getextrema()),"sourceCutPixels":cut_pixels,"borders":"pass","file":entry["file"]})
    return sheet

for spec in SPEC:
    if spec["type"] == "background":
        source = Image.open(ART / "sources" / (spec["source"]+".png")).convert("RGB")
        image = source.resize(tuple(spec["dimensions"]),Image.Resampling.NEAREST)
        image = image.quantize(colors=96,dither=Image.Dither.NONE).convert("RGBA")
        directory = OUT / spec["kind"]
        directory.mkdir(exist_ok=True,parents=True)
        png = directory/(spec["id"]+".png")
        image.save(png,optimize=True)
        MANIFEST["assets"].append({**spec,"file":png.relative_to(ROOT/"public").as_posix(),"sha256":hashlib.sha256(png.read_bytes()).hexdigest()})
        REPORT.append({"id":spec["id"],"size":list(image.size),"opaque":image.getchannel("A").getextrema()==(255,255)})
    else:
        export_sheet(spec)

write_json(OUT/"asset-manifest.json",MANIFEST)
write_json(PREVIEW/"qa-report.json",{"scope":"technical-export-only",
          "visualAcceptance":"rejected", "gameplayReady":False,
          "checked":len(SPEC),"frames":sum(r.get("frames",0) for r in REPORT),"results":REPORT})

# Bản xem trước lấy hoàn toàn từ PNG đã xuất, không từ tranh ý tưởng.
font_path = "C:/Windows/Fonts/segoeui.ttf"
font = ImageFont.truetype(font_path,17)
title_font = ImageFont.truetype(font_path,28)
actors = [a for a in MANIFEST["assets"] if a["type"] == "actor"]
overview = Image.new("RGB",(1200,600),(13,24,30))
d = ImageDraw.Draw(overview)
d.text((24,16),"BỘ SPRITE DÙNG TRỰC TIẾP · GIAI ĐOẠN 0",font=title_font,fill=(231,214,165))
walk_gif = []
for step in range(4):
    canvas = overview.copy()
    draw = ImageDraw.Draw(canvas)
    for i,asset in enumerate(actors):
        x,y = (i%4)*300,(i//4)*176+65
        draw.rounded_rectangle((x+10,y,x+290,y+162),radius=10,fill=(23,40,45),outline=(49,80,76))
        size=asset["size"]
        sheet=Image.open(ROOT/"public"/asset["file"])
        frame=sheet.crop((step*size,size,(step+1)*size,size*2))
        factor=1 if size>=100 else 2
        frame=frame.resize((size*factor,size*factor),Image.Resampling.NEAREST)
        canvas.paste(frame,(x+(300-frame.width)//2,y+8),frame)
        draw.text((x+18,y+139),asset["name"],font=font,fill=(225,233,227))
    walk_gif.append(canvas)
walk_gif[0].save(PREVIEW/"actors.png")
walk_gif[0].save(PREVIEW/"actors-walk.gif",save_all=True,append_images=walk_gif[1:],duration=140,loop=0)

icon_assets=[a for a in MANIFEST["assets"] if a["type"]=="icons"]
contact=Image.new("RGB",(1200,680),(13,24,30))
draw=ImageDraw.Draw(contact)
draw.text((24,16),"VẬT PHẨM · TRANG BỊ · KỸ NĂNG",font=title_font,fill=(231,214,165))
for group,asset in enumerate(icon_assets):
    sheet=Image.open(ROOT/"public"/asset["file"])
    size=asset["size"]
    for i,name in enumerate(asset["frameNames"]):
        x,y=(i%8)*150,(group*2+i//8)*100+65
        frame=sheet.crop(((i%4)*size,(i//4)*size,(i%4+1)*size,(i//4+1)*size))
        contact.paste(frame,(x+43,y),frame)
        label=asset["labels"][i]
        draw.text((x+8,y+67),label,font=ImageFont.truetype(font_path,13),fill=(216,230,221))
contact.save(PREVIEW/"icons.png")

# Layout tĩnh là dữ liệu asset, không chứa sinh quái hoặc điều khiển gameplay.
placement = [
    ("cay-thong",100,180,1.4),("cay-thong",240,120,1.3),
    ("cay-la-rong",870,150,1.4),("bui-truc",975,350,1.3),
    ("cay-kho",80,570,1.2),("cay-thong",960,690,1.4),
    ("cay-la-rong",90,950,1.4),("bui-truc",910,970,1.4),
    ("da-lon",220,340,.65),("da-nho",795,680,.6),
    ("da-nhon",865,460,.7),("cot-da",160,720,.75),
    ("than-cay",280,870,.7),("goc-cay",780,880,.65),
    ("re-cay",260,185,.65),("duong-xi",160,510,.55),
    ("nam-do",820,275,.45),("tuong-vo",725,180,.7),
    ("mieu-da",520,115,.7),("den-da",575,120,.45),
]
layout={"id":"hac-phong-son","width":1024,"height":1024,"ground":"hac-phong-son-ground", "spawn":{"x":512,"y":526},"props":[{"frame":name,"x":x,"y":y,"scale":scale,"solid":name not in ["duong-xi","nam-do"],"collision":{"shape":"ellipse","radiusX":round(22*scale),"radiusY":round(10*scale)}} for name,x,y,scale in placement]}
write_json(OUT/"maps"/"hac-phong-son-layout.json",layout)
template=(ART/"preview-template.html").read_text(encoding="utf-8")
html=template.replace("__MANIFEST__",json.dumps(MANIFEST,ensure_ascii=False)).replace("__LAYOUT__",json.dumps(layout,ensure_ascii=False))
(ART/"ASSET_PREVIEW.html").write_text(html,encoding="utf-8")
scene=Image.open(OUT/"maps"/"hac-phong-son-ground.png").convert("RGBA")
props=Image.open(OUT/"maps"/"hac-phong-son-props.png")
prop_names=next(a["names"] for a in SPEC if a["type"]=="props")
for name,x,y,scale in placement:
    i=prop_names.index(name)
    frame=props.crop(((i%4)*128,(i//4)*128,(i%4+1)*128,(i//4+1)*128))
    frame=frame.resize((round(128*scale),round(128*scale)),Image.Resampling.NEAREST)
    scene.alpha_composite(frame,(round(x-frame.width*.5),round(y-frame.height*(122/128))))
for id,x,y in [("duong-khai",512,526),("linh-ho",454,560),("thanh-dieu",552,452),("hac-lang",346,376),("thiet-nha-tru",678,596),("doc-thiem",366,654),("hac-lang-tinh-anh",714,364),("hac-phong-lang-vuong",550,228)]:
    a=next(a for a in MANIFEST["assets"] if a["id"]==id)
    size=a["size"]
    sheet=Image.open(ROOT/"public"/a["file"])
    frame=sheet.crop((0,size,size,size*2))
    scene.alpha_composite(frame,(round(x-size*a["origin"][0]),round(y-size*a["origin"][1])))
scene.save(PREVIEW/"scene.png")

from package_assets import create_package
create_package()
print(json.dumps({"sheets":len(SPEC),"frames":sum(r.get("frames",0) for r in REPORT),"png_files":len(list(OUT.rglob("*.png"))),"source_cut_warnings":[r["id"] for r in REPORT if r.get("sourceCutPixels",0)>30]},ensure_ascii=False))
