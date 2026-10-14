"""Chốt manifest sau kiểm tra PNG, hoạt ảnh, trình duyệt và trực quan."""
from pathlib import Path
import json
import hashlib
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
OUT=ROOT/'public/assets/v3'
for name in ['package-qa.json','attack-qa.json','browser-qa.json','visual-qa.json']:
    assert json.loads((HERE/'preview'/name).read_text(encoding='utf-8'))['status']=='passed',name
manifest=json.loads((OUT/'asset-manifest.json').read_text(encoding='utf-8'))
visual=json.loads((HERE/'preview/visual-qa.json').read_text(encoding='utf-8'))
for a in manifest['actors']:
    assert a['sha256']==visual['atlasHashes'][a['id']]==hashlib.sha256((ROOT/'public'/a['atlas']).read_bytes()).hexdigest()
manifest.update(status='validated',gameplayReady=True,gameplayStarted=False,
    graphicsApproval='Tạo hình hiện tại được người dùng tạm duyệt; nâng cấp đồ họa ở đợt sau.',
    acceptance={'technical':'passed','attackMotion':'passed','visual':'passed','browser':'passed'})
(OUT/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
template=(HERE/'preview-template.html').read_text(encoding='utf-8')
(HERE/'ASSET_PREVIEW.html').write_text(template.replace('__MANIFEST__',json.dumps(manifest,ensure_ascii=False)),encoding='utf-8')
print('ASSETS_V3_VALIDATED')
