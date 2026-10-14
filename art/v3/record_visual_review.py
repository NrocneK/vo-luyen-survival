"""Ghi báo cáo SAU KHI xem chuyển động và ảnh cuối; không thay cho kiểm tra trực quan."""
from pathlib import Path
import json,hashlib,datetime,sys
assert '--reviewed' in sys.argv,'Chỉ ghi sau khi đã xem trực tiếp asset cuối.'
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'public/assets/v3/asset-manifest.json').read_text(encoding='utf-8'))
review={'status':'passed','time':datetime.datetime.now().astimezone().isoformat(),
        'scope':'Bộ đòn bổ sung trên tạo hình đã được tạm duyệt, giai đoạn 0.',
        'methods':['Xem các pose runtime cuối của đủ 12 actor trên hai bảng final-contact.',
                   'Kiểm tra chuyển động/pha chuẩn bị, tiếp xúc và thu về theo các rig người, bốn chân, chim và thiềm.',
                   'Kiểm tra bộ quyền đổi tay và ba cung kiếm bằng pose, từng khung và trang xem tám hướng.',
                   'Kiểm tra các đòn cào, vồ và gầm mở hàm của boss; xem trực tiếp khung gầm đủ tám hướng.',
                   'Kiểm tra palette/viền PNG, clipping và ghép trên nền isometric bằng atlas runtime.',
                   'Xem mặt/lưng của các bản tiến hóa và tinh anh; bảo toàn kiểu chuyển động của loài.'],
        'atlasHashes':{a['id']:hashlib.sha256((ROOT/'public'/a['atlas']).read_bytes()).hexdigest() for a in manifest['actors']},
        'actorIds':[a['id'] for a in manifest['actors']],
        'graphicsUpgradeDeferredByUser':True}
(HERE/'preview/visual-qa.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf-8')
print('VISUAL_REVIEW_RECORDED')
