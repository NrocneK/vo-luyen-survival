"""Xuất lại các đòn cào sau chỉnh bàn chân; tự xuất toàn bộ nếu canvas đổi."""
from pathlib import Path
import subprocess,json
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
BLENDER=ROOT/'art/v2/tools/blender-4.5.14-windows-x64/blender.exe'
for actor,clips in [('hac-lang','attack-2,attack-3'),('hac-lang-tinh-anh','attack-2,attack-3'),('hac-phong-lang-vuong','attack-1,attack-2')]:
    print('REPAIR_START',actor,flush=True)
    path=HERE/(actor+'-rig.json');before=json.loads(path.read_text(encoding='utf-8'))
    log=HERE/(actor+'-join.log')
    def run(states):
        with log.open('w',encoding='utf-8') as stream:
            r=subprocess.run([str(BLENDER),'-b','-t','4','--python-exit-code','1','--python',str(HERE/'build_creatures.py'),'--','--actor',actor,'--states',states],cwd=ROOT,stdout=stream,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW)
        assert r.returncode==0 and 'RIG_EXPORT_DONE' in log.read_text(encoding='utf-8')
    run(clips)
    after=json.loads(path.read_text(encoding='utf-8'))
    if before['renderSize']!=after['renderSize'] or before['origin']!=after['origin']:
        # Sai số double rất nhỏ không đổi điểm raster; đổi canvas thực thì xuất lại.
        if before['renderSize']!=after['renderSize'] or max(abs(a-b) for a,b in zip(before['origin'],after['origin']))>1e-8:
            print('CANVAS_CHANGED_FULL_RENDER',actor,flush=True);run('')
    print('REPAIR_DONE',actor,flush=True)
