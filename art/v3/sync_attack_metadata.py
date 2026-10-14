"""Đồng bộ dữ liệu mốc đòn sau khi chỉnh cấu hình, không thay PNG hay pose."""
from pathlib import Path
import json
from attack_library import attacks,states
HERE=Path(__file__).resolve().parent
for path in HERE.glob('*-rig.json'):
    data=json.loads(path.read_text(encoding='utf-8'))
    assert data['counts']=={k:v[0] for k,v in states(data['actor']).items()}
    data['attacks']=attacks(data['actor'])
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('ATTACK_METADATA_SYNCED')
