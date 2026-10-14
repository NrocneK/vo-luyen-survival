"""Kiểm tra từng đòn, đổi tay, đường kiếm và sự liên tục bằng PNG/bone thật."""
from pathlib import Path
import json
import hashlib
import math
from PIL import Image
from attack_library import attacks

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'public/assets/v3/asset-manifest.json').read_text(encoding='utf-8'))
report={'status':'passed','actors':[],'totalAttackVariants':0,'allDirectionsChecked':True}

def digest(path):return hashlib.sha256(Image.open(path).convert('RGBA').tobytes()).hexdigest()
def distance(a,b):return math.dist(a,b)

for actor in manifest['actors']:
    folder=ROOT/'public'/Path(actor['atlas']).parent
    config=attacks(actor['id'])
    rig=json.loads((HERE/(actor['id']+'-rig.json')).read_text(encoding='utf-8'))
    assert actor['attacks']==rig['attacks']==config
    entry={'id':actor['id'],'variants':len(config),'directions':{}}
    for direction in actor['directions']:
        signatures=[];unique=[];neutral=[]
        for attack in config:
            names=actor['animations'][attack['id']+'-'+direction]['frames']
            hashes=[digest(folder/(n+'.png')) for n in names]
            assert len(names)==14 and actor['animations'][attack['id']+'-'+direction]['repeat']==0
            assert len(set(hashes))>=10,(actor['id'],attack['id'],direction,len(set(hashes)))
            # Đòn khép về đúng pose ban đầu, combo không bật về một hình khác.
            assert hashes[0]==hashes[-1],(actor['id'],attack['id'],direction,'pose đầu/cuối lệch')
            neutral.append(hashes[0]);unique.append(len(set(hashes)))
            signatures.append(hashlib.sha256(''.join(hashes[1:-1]).encode()).hexdigest())
        assert len(set(neutral))==1,(actor['id'],direction,'các đòn không cùng pose nối')
        assert len(set(signatures))==len(config),(actor['id'],direction,'trùng đòn')
        entry['directions'][direction]={'uniqueFramesPerAttack':unique,'distinctVariants':len(set(signatures)),'sameEntryExitPose':True}
    samples={}
    for trace in rig['attackTrace']:
        samples[(trace['state'],round(trace['phase'],6))]=trace
    if actor['id']=='duong-khai':
        limb_motion={}
        for attack in config:
            rows=[r for (s,p),r in sorted(samples.items()) if s==attack['id']]
            start=rows[0]
            key='rightHand' if attack['primaryLimb']=='R' else 'leftHand'
            motion=max(distance(start[key],r[key]) for r in rows)
            assert motion>.22,(attack['id'],'biên độ tay quá nhỏ')
            limb_motion[attack['id']]={'primaryHand':attack['primaryLimb'],'maxTravel':motion}
        assert [a['primaryLimb'] for a in config]==['L','R','L']
        entry['alternatingHands']=limb_motion
    if actor['id']=='duong-khai-kiem':
        paths={}
        for attack in config:
            rows=[r for (s,p),r in sorted(samples.items()) if s==attack['id']]
            path=[r['bladeTip'] for r in rows]
            assert max(distance(path[0],p) for p in path)>.65
            paths[attack['id']]=path
        keys=list(paths)
        separation={}
        for i,k in enumerate(keys):
            for j in keys[i+1:]:
                value=max(distance(a,b) for a,b in zip(paths[k],paths[j]))
                assert value>.5,(k,j,'cung kiếm quá giống nhau')
                separation[k+' / '+j]=value
        entry['bladeTrajectoryMaxSeparation']=separation
    report['actors'].append(entry);report['totalAttackVariants']+=len(config)
assert report['totalAttackVariants']==37
(HERE/'preview/attack-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'status':'passed','actors':len(report['actors']),'attackVariants':report['totalAttackVariants'],'attackDirections':37*8},ensure_ascii=False))
