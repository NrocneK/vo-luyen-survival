"""Danh mục đòn đánh và mốc ra đòn; dữ liệu asset, chưa xử lý sát thương."""
import math

BASE_STATES = {'idle': (8, 8, True), 'walk': (12, 15, True)}
NAMES = {
    'duong-khai': [('Đấm thẳng tay trái', 'L', 'jab'), ('Đấm chéo tay phải', 'R', 'cross'), ('Móc lên tay trái', 'L', 'uppercut')],
    'duong-khai-kiem': [('Chém chéo thuận', 'R', 'diagonal-down'), ('Chém chéo ngược', 'R', 'diagonal-up'), ('Quét kiếm ngang', 'R', 'horizontal')],
    'wolf': [('Cắn chồm', 'head', 'bite'), ('Cào chân trái', 'FL', 'claw-left'), ('Cào chân phải', 'FR', 'claw-right')],
    'boar': [('Húc nanh trái', 'head', 'tusk-left'), ('Húc nanh phải', 'head', 'tusk-right'), ('Dậm đầu lao tới', 'head', 'charge')],
    'frog': [('Rướn miệng phun độc', 'head', 'spit'), ('Nhảy đập đất', 'body', 'slam'), ('Quật tay trước', 'frontL', 'swipe')],
    'bird': [('Lao mổ', 'head', 'peck'), ('Quạt cánh trái', 'wing1L', 'wing-left'), ('Quạt cánh phải', 'wing1R', 'wing-right')],
    'fox': [('Cắn nhanh', 'head', 'bite'), ('Quật đuôi', 'tail1', 'tail-sweep'), ('Vồ hai chân trước', 'FL+FR', 'pounce')],
    'boss': [('Cào trái diện rộng', 'FL', 'claw-left'), ('Cào phải diện rộng', 'FR', 'claw-right'), ('Chồm vồ', 'FL+FR', 'pounce'), ('Gầm tụ lực', 'head', 'roar')],
}

def family(actor):
    if actor in NAMES: return actor
    if 'vuong' in actor: return 'boss'
    if actor.startswith('linh-ho'): return 'fox'
    if 'tru' in actor: return 'boar'
    if 'thiem' in actor: return 'frog'
    if 'dieu' in actor: return 'bird'
    return 'wolf'

def attacks(actor):
    # Mỗi đòn có chuẩn bị -> ra đòn -> thu về. Có thể nối hoặc chọn độc lập.
    fps = 16 if family(actor) == 'boss' else 24
    result=[{'id': f'attack-{i+1}', 'name': name, 'primaryLimb': limb, 'kind': kind,
             'frames': 14, 'frameRate': fps, 'windupFrames': [0, 4],
             'activeFrames': [5, 8], 'impactFrame': 7, 'recoveryFrames': [9, 13],
             'repeat': 0} for i, (name, limb, kind) in enumerate(NAMES[family(actor)])]
    for a in result:
        if a['kind'] in ('slam','pounce'):
            a['windupFrames']=[0,4];a['activeFrames']=[5,10];a['impactFrame']=9;a['recoveryFrames']=[11,13]
    return result

def states(actor):
    return {**BASE_STATES, **{a['id']: (a['frames'], a['frameRate'], False) for a in attacks(actor)}, 'death': (10, 12, False)}

def smooth(x):
    x=max(0, min(1, x)); return x*x*(3-2*x)

def sample(p, keys):
    """Nội suy các pose chủ chốt, không dùng sin giống nhau cho mọi đòn."""
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t0 <= p <= t1:
            t=smooth((p-t0)/(t1-t0))
            if isinstance(v0, (list, tuple)): return tuple(a+(b-a)*t for a,b in zip(v0,v1))
            return v0+(v1-v0)*t
    return keys[-1][1]

def pulse(p):
    return sample(p, [(0,0),(.28,-.28),(.54,1),(.70,.78),(1,0)])

def envelope(p):
    return sample(p, [(0,0),(.28,1),(.70,1),(1,0)])
