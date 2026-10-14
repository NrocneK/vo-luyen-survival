"""Đóng gói thành phẩm đã kiểm tra, kèm mô hình và tài liệu; loại toàn bộ bản thử."""
from pathlib import Path
import json
import zipfile
import hashlib

ROOT=Path(__file__).resolve().parents[2]
HERE=ROOT/'art/v3'
OUT=ROOT/'public/assets/v3'

def create_package():
    qa=json.loads((HERE/'preview/package-qa.json').read_text(encoding='utf-8'))
    assert qa['status']=='passed'
    browser=json.loads((HERE/'preview/browser-qa.json').read_text(encoding='utf-8'))
    assert browser['status']=='passed'
    visual=json.loads((HERE/'preview/visual-qa.json').read_text(encoding='utf-8'))
    manifest=json.loads((OUT/'asset-manifest.json').read_text(encoding='utf-8'))
    assert visual['status']=='passed' and manifest['status']=='validated'
    assert all(visual['atlasHashes'][a['id']]==a['sha256'] for a in manifest['actors'])
    attack_qa=json.loads((HERE/'preview/attack-qa.json').read_text(encoding='utf-8'))
    assert attack_qa['status']=='passed'
    files=list(OUT.rglob('*'))
    files+=list((HERE/'models').glob('*.blend'))
    files+=list(HERE.glob('*-rig.json'))
    files+=[p for p in (HERE/'preview').glob('*.png') if 'raw-poses' not in p.name]+list((HERE/'preview').glob('*.gif'))
    files += [HERE/name for name in ['ASSET_PREVIEW.html','preview-template.html',
        'build_duong_khai.py','build_creatures.py','rig_helpers.py','toon_materials.py',
        'attack_library.py','render_all.py',
        'export_rig_assets.py','export_scene_assets.py','validate_assets.py','render_scene_preview.py',
        'validate_attacks.py',
        'render_attack_showcase.py',
        'sync_attack_metadata.py',
        'finalize_assets.py',
        'record_visual_review.py','final_contact_sheets.py',
        'package_assets.py','input-ground-flat.png','shared-source-manifest.json']]
    files += [HERE/'preview'/name for name in ['qa-report.json','package-qa.json','browser-qa.json','visual-qa.json','attack-qa.json']]
    files += [ROOT/name for name in ['README.md','AGENTS.md','art/production-spec.json',
        'docs/ART_GUIDE.md','docs/ASSET_MANIFEST.md','docs/GAME_DESIGN.md','docs/ATTACK_DESIGN.md']]
    dest=ROOT/'art/stage0-assets-v3.zip'
    with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as archive:
        for p in sorted(set(files)):
            if p.is_file():archive.write(p,p.relative_to(ROOT).as_posix())
    with zipfile.ZipFile(dest) as archive:
        names=archive.namelist()
        assert archive.testzip() is None
        assert len(names)==len(set(names))
        assert not any('/tools/' in n or '/sources/walk-' in n or n.endswith('.log') for n in names)
        assert 'public/assets/v3/asset-manifest.json' in names
        assert sum(n.endswith('.blend') for n in names)==12
    info={'zip':str(dest),'entries':len(names),'bytes':dest.stat().st_size,
          'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'status':'passed'}
    (HERE/'preview/zip-qa.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(info,ensure_ascii=False))

if __name__=='__main__':create_package()
