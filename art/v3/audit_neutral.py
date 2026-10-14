"""Tìm lệch pose nối hoặc đòn có quá ít khung khác nhau; kiểm tra nội bộ."""
from pathlib import Path
import json,hashlib
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
m=json.loads((ROOT/'public/assets/v3/asset-manifest.json').read_text(encoding='utf-8'))
for a in m['actors']:
    folder=ROOT/'public'/Path(a['atlas']).parent
    for d in a['directions']:
        starts=[];counts=[]
        for attack in a['attacks']:
            names=a['animations'][attack['id']+'-'+d]['frames']
            h=[hashlib.sha256(Image.open(folder/(n+'.png')).tobytes()).hexdigest() for n in names]
            starts.append(h[0]);counts.append(len(set(h)))
            if h[0]!=h[-1]:print('ENTRY_EXIT',a['id'],attack['id'],d)
        if len(set(starts))!=1 or min(counts)<10:print('AUDIT',a['id'],d,'neutral',len(set(starts)),'unique',counts)
