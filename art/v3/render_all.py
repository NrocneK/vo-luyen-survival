"""Xuất đủ 8 hướng; tiến trình Blender phải thành công và có dấu kết thúc."""
from pathlib import Path
import subprocess
import sys
import json
import os
import shutil

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
BLENDER=ROOT/'art/v2/tools/blender-4.5.14-windows-x64/blender.exe'
if not BLENDER.exists():
    located=os.environ.get('BLENDER_EXE') or shutil.which('blender')
    if not located:raise RuntimeError('Cần Blender trên PATH hoặc biến BLENDER_EXE trỏ tới blender.exe.')
    BLENDER=Path(located)
spec=json.loads((ROOT/'art/production-spec.json').read_text(encoding='utf-8'))
for actor in (a['id'] for a in spec if a['type']=='actor'):
    if len(sys.argv)>1 and actor not in sys.argv[1:]:continue
    script='build_duong_khai.py' if actor.startswith('duong-khai') else 'build_creatures.py'
    args=['--sword'] if actor=='duong-khai-kiem' else ([] if actor=='duong-khai' else ['--actor',actor])
    print('RENDER_START',actor,flush=True)
    log=HERE/(actor+'-render.log')
    with log.open('w',encoding='utf-8') as stream:
        result=subprocess.run([str(BLENDER),'-b','-t','4','--python-exit-code','1','--python',str(HERE/script),'--',*args],
            cwd=ROOT,stdout=stream,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW)
    assert result.returncode==0, f'{actor}: Blender exit {result.returncode}; xem {log}'
    assert 'RIG_EXPORT_DONE' in log.read_text(encoding='utf-8'), f'{actor}: chưa hoàn thành'
    print('RENDER_DONE',actor,flush=True)
print('ALL_ACTORS_DONE',flush=True)
