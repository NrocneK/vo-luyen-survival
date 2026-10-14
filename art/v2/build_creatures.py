"""Dựng quái/sủng vật với skeleton và chu kỳ riêng. Chạy bằng Blender background."""
from pathlib import Path
import argparse
import sys
import math
import json
import bpy
from mathutils import Vector, Matrix

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from rig_helpers import initialize,mat,Rig,ik,foot_path,bake,fit_camera,ground_pose,DIRECTIONS,COUNTS
arg=argparse.ArgumentParser()
arg.add_argument('--actor',required=True)
arg.add_argument('--preview',action='store_true')
opt=arg.parse_args(sys.argv[sys.argv.index('--')+1:])
id=opt.actor
RAW=HERE/'renders'/id
MODELS=HERE/'models'
RAW.mkdir(parents=True,exist_ok=True)
MODELS.mkdir(parents=True,exist_ok=True)
is_boar='tru' in id
is_fox=id.startswith('linh-ho')
is_bird='dieu' in id
is_frog='thiem' in id
elite='tinh-anh' in id
boss='vuong' in id
evolved='tien-hoa' in id
palette={
 'body':(.11,.16,.20),'belly':(.29,.36,.36),'dark':(.035,.06,.09),
 'eye':(.88,.33,.07),'pupil':(.025,.035,.04),'ivory':(.82,.80,.60),
 'amber':(.76,.43,.08),'scarlet':(.67,.08,.055),'teal':(.12,.55,.55),
 'pink':(.42,.07,.09),'steel':(.52,.64,.65)
}
if is_boar:palette.update(body=(.34,.22,.13),belly=(.49,.34,.19),dark=(.13,.085,.055))
if is_fox:palette.update(body=(.75,.82,.72),belly=(.91,.89,.73),dark=(.26,.42,.39),eye=(.10,.53,.58))
if is_bird:palette.update(body=(.07,.34,.38),belly=(.25,.57,.49),dark=(.045,.14,.19),eye=(.81,.56,.13))
if is_frog:palette.update(body=(.22,.35,.10),belly=(.54,.55,.23),dark=(.08,.17,.055),eye=(.81,.48,.10))
M={k:mat(k,v) for k,v in palette.items()}
ORTHO=3.7 if boss else 2.9
SIZE=144 if boss else 96
scene=initialize(size=SIZE*2,ortho=ORTHO,target_z=ORTHO*.3013/.81649658)
TRACE=[]
FOOT_ERRORS=[]
names={
 'hac-lang':'Hắc Lang','thiet-nha-tru':'Thiết Nha Trư','doc-thiem':'Độc Thiềm',
 'hac-lang-tinh-anh':'Hắc Lang Tinh Anh','thiet-nha-tru-tinh-anh':'Thiết Nha Trư Tinh Anh',
 'hac-phong-lang-vuong':'Hắc Phong Lang Vương','linh-ho':'Linh Hồ',
 'linh-ho-tien-hoa':'Ngọc Vĩ Linh Hồ','thanh-dieu':'Thanh Điểu','thanh-dieu-tien-hoa':'Phong Linh Loan'}

def quad():
    height=.58 if is_boar else .65
    if is_fox:height=.59
    front=-.35;back=.35;width=.25 if not is_fox else .20
    lengths=(.28,.27) if is_boar else ((.28,.29) if is_fox else (.32,.31))
    zfoot=.07
    spec=[('root',(0,0,0),(0,0,.2),None),('body',(0,.34,height),(0,-.36,height),'root'),
          ('head',(0,-.40,height+.16),(0,-.85,height+.16),'body'),
          ('tail1',(0,.48,height+.08),(0,.86,height+.25),'body'),
          ('tail2',(0,.86,height+.25),(0,1.15,height+.14),'tail1')]
    for limb,y in [('F',front),('H',back)]:
        for side,sign in [('L',1),('R',-1)]:
            tag=limb+side;x=width*sign
            spec.extend([(tag+'upper',(x,y,height),(x,y,height-lengths[0]),'body'),
                         (tag+'lower',(x,y,height-lengths[0]),(x,y,zfoot),tag+'upper'),
                         (tag+'paw',(x,y,zfoot),(x,y-.13,zfoot),tag+'lower')])
    rig=Rig(names[id],spec)
    body_scale=(.40,.59,.33) if is_boar else ((.24,.45,.22) if is_fox else (.31,.52,.28))
    rig.sphere('Thân',(0,0,height+.06),body_scale,'body',M['body'],12,8)
    rig.sphere('Ngực',(0,-.30,height+.055),(.27 if is_fox else .34,.27,.27),'body',M['belly'])
    rig.sphere('Đầu',(0,-.55,height+.21),(.24,.28,.245),'head',M['body'],12,8)
    rig.sphere('Mõm',(0,-.81,height+.10),(.17,.22,.11),'head',M['belly'])
    rig.sphere('Mũi',(0,-.997,height+.105),(.115,.045,.065),'head',M['dark'])
    for sign in [1,-1]:
        x=.19*sign
        rig.sphere('Mắt '+str(sign),(x,-.708,height+.275),(.040,.050,.044),'head',M['eye'])
        rig.sphere('Đồng tử '+str(sign),(x*1.04,-.744,height+.278),(.017,.02,.027),'head',M['pupil'])
        base=.19*sign
        verts=[(base,-.45,height+.32),(base+sign*.105,-.31,height+.31),
               (base+sign*.062,-.34,height+(.66 if is_fox else .56)),(base-sign*.06,-.39,height+.36)]
        faces=[(0,1,2),(0,2,3),(1,3,2),(0,3,1)]
        if sign<0:faces=[tuple(reversed(f)) for f in faces]
        rig.mesh('Tai '+str(sign),verts,faces,'head',M['dark'])
        rig.mesh('Lòng tai '+str(sign),[(base,-.454,height+.35),(base+sign*.072,-.37,height+.34),(base+sign*.045,-.364,height+(.59 if is_fox else .51))],[(0,1,2)],'head',M['belly'])
        if is_boar:
            rig.spike('Nanh gốc '+str(sign),(sign*.18,-.83,height+.01),(sign*.25,-.99,height+.17),.065,'head',M['steel'])
            rig.spike('Nanh nhọn '+str(sign),(sign*.25,-.99,height+.17),(sign*.21,-.99,height+.35),.043,'head',M['ivory'])
        if not is_boar:
            for j in range(3):
                rig.spike('Bờm má',(.22*sign,-.40+j*.07,height+.13),(.35*sign,-.30+j*.07,height+.03),.075,'head',M['body'])
    for limb,y in [('F',front),('H',back)]:
        for side,sign in [('L',1),('R',-1)]:
            tag=limb+side;x=width*sign
            knee=height-lengths[0]
            rig.segment('Đùi '+tag,(x,y,height),(x,y,knee),.12 if is_boar else .09,.075,tag+'upper',M['body'])
            rig.segment('Cẳng '+tag,(x,y,knee),(x,y,zfoot),.072,.052,tag+'lower',M['body'])
            rig.sphere('Bàn chân '+tag,(x,y-.04,.065),(.085,.13,.065),tag+'paw',M['dark'],8,5)
            if not is_boar:
                for offset in [-.035,0,.035]:rig.spike('Móng',(x+offset,y-.125,.06),(x+offset,y-.168,.035),.015,tag+'paw',M['ivory'])
    tails=3 if is_fox and evolved else 1
    for j in range(tails):
        spread=(j-(tails-1)/2)*.23
        r=.13 if is_fox else .08
        rig.segment('Đuôi gốc',(spread,.48,height+.08),(spread,.86,height+.25),r,r*1.35,'tail1',M['body'])
        rig.segment('Đuôi ngọn',(spread,.86,height+.25),(spread,1.15,height+.14),r*1.35,.013,'tail2',M['belly'] if is_fox else M['body'])
    if is_boar:
        for i in range(9):
            y=-.22+i*.068
            rig.spike('Lông gáy',(0,y,height+.32),(0,y+.05,height+.50),.053,'body',M['dark'])
    if elite or boss:
        color=M['scarlet'] if boss else M['amber']
        for i in range(7):
            y=-.30+i*.09
            rig.spike('Tinh thể sống lưng',(0,y,height+.31),((-.08 if i%2 else .08),y,height+.62+(i%3)*.035),.07,'body',color)
        for sign in [1,-1]:
            rig.spike('Giáp vai',(sign*.23,-.22,height+.28),(sign*.39,-.19,height+.39),.12,'body',color)
    if is_fox:
        rig.spike('Dấu ngọc trán',(0,-.775,height+.40),(0,-.795,height+.46),.053,'head',M['teal'])
    stride=.30 if is_boar or is_fox else .38
    cycle=.8;stance=.75
    def pose(state,p):
        rig.reset()
        bob=.012*math.cos(math.tau*2*p) if state=='walk' else .007*math.sin(math.tau*p)
        drop=.19*p if state=='death' else 0
        h=height+bob-drop
        lunge=.09*math.sin(math.pi*p) if state=='attack' else 0
        rig.pose('root',(0,0,0),(0,0,.2))
        rig.pose('body',(0,back-lunge,h),(0,front-lunge,h))
        head_a=Vector((0,-.40-lunge,h+.16))
        head_b=Vector((0,-.85-lunge,h+.16))
        if state=='attack':head_b.z-=.14*math.sin(math.pi*p)
        rig.pose('head',head_a,head_b)
        sw=.15*math.sin(math.tau*p) if state=='walk' else .08*math.sin(math.tau*p)
        rig.pose('tail1',(0,.48,h+.08),(sw,.86,h+.25))
        rig.pose('tail2',(sw,.86,h+.25),(sw*1.35,1.15,h+.14))
        offsets={'FL':0,'HR':.25,'FR':.5,'HL':.75}
        for tag,offset in offsets.items():
            sign=1 if tag[1]=='L' else -1
            y=front if tag[0]=='F' else back
            if state=='walk':dy,lift,planted=foot_path(p+offset,stride,stance,.12 if not is_boar else .08)
            elif state=='attack' and tag[0]=='F':
                dy,lift,planted=-lunge*1.3,.055*math.sin(math.pi*p),False
            else:dy,lift,planted=0,0,True
            hip=Vector((width*sign,y-lunge,h))
            foot=Vector((width*sign,y+dy,zfoot+lift))
            knee=ik(hip,foot,*lengths,bend=(0,1 if tag[0]=='F' else -1,0))
            rig.pose(tag+'upper',hip,knee)
            rig.pose(tag+'lower',knee,foot)
            rig.pose(tag+'paw',foot,foot+Vector((0,-.13,0)))
            if state=='walk':
                actual=rig.object.pose.bones[tag+'paw'].head.copy()
                FOOT_ERRORS.append((actual-foot).length)
                TRACE.append({'phase':p,'limb':tag,'planted':planted,'foot':list(actual),'hip':list(hip),'knee':list(knee)})
        if state=='death':
            rig.transform(Matrix.Translation((0,0,.13*p)) @ Matrix.Rotation(math.radians(65)*p,4,'Y'))
            ground_pose(rig.object)
    scale=1.4 if boss else (1.12 if elite else (.84 if is_fox else 1))
    rig.object.scale=(scale,)*3
    return rig,pose,{'cycleSeconds':cycle,'stride':stride*scale,'stanceFraction':stance,'worldSpeed':stride/(stance*cycle)*scale,'frames':12,'type':'quadruped','offsets':{'FL':0,'HR':.25,'FR':.5,'HL':.75},'modelScale':scale}

def bird():
    spec=[('root',(0,0,0),(0,0,.2),None),('body',(0,.20,.95),(0,-.20,.95),'root'),
          ('head',(0,-.20,1.05),(0,-.42,1.15),'body'),('tail',(0,.25,.95),(0,.70,.82),'body')]
    for side,sign in [('L',1),('R',-1)]:
        spec.extend([('wing1'+side,(sign*.15,0,.99),(sign*.54,.04,1.02),'body'),
                     ('wing2'+side,(sign*.54,.04,1.02),(sign*.87,.14,1.02),'wing1'+side),
                     ('leg'+side,(sign*.09,-.05,.85),(sign*.10,-.12,.65),'body')])
    rig=Rig(names[id],spec)
    rig.sphere('Thân chim',(0,0,.95),(.20,.35,.23),'body',M['body'],12,8)
    rig.sphere('Ức',(0,-.18,.94),(.18,.18,.21),'body',M['belly'])
    rig.sphere('Đầu',(0,-.30,1.14),(.145,.17,.155),'head',M['body'],12,8)
    rig.spike('Mỏ',(0,-.42,1.14),(0,-.63,1.12),.063,'head',M['amber'])
    for sign in [1,-1]:
        rig.sphere('Mắt',(sign*.13,-.36,1.17),(.02,.025,.028),'head',M['eye'])
        rig.spike('Mào',(sign*.04,-.25,1.27),(sign*.07,-.10,1.49 if evolved else 1.35),.055,'head',M['teal'])
    for side,sign in [('L',1),('R',-1)]:
        face=(0,1,2,3) if sign>0 else (3,2,1,0)
        rig.mesh('Cánh gốc '+side,[(sign*.14,-.15,.99),(sign*.55,-.10,1.02),(sign*.61,.18,1.02),(sign*.22,.23,.99)],[face],'wing1'+side,M['body'])
        for j in range(6):
            x=.49+j*.062
            rig.mesh('Lông cánh '+side,[(sign*x,-.08+j*.023,1.023),(sign*(x+.072),-.055+j*.023,1.023),(sign*(x+.15),.34+j*.012,1.019),(sign*x,.19,1.019)],[face],'wing2'+side,M['teal'] if j%2 else M['belly'])
        rig.segment('Chân '+side,(sign*.09,-.05,.85),(sign*.10,-.12,.65),.021,.014,'leg'+side,M['amber'])
        for j in [-1,0,1]:rig.spike('Vuốt',(sign*.10,-.12,.66),(sign*.10+j*.035,-.21,.64),.012,'leg'+side,M['dark'])
    tails=5 if evolved else 3
    for j in range(tails):
        spread=(j-(tails-1)/2)*.075
        rig.mesh('Lông đuôi',[(spread-.03,.22,.95),(spread+.03,.22,.95),(spread+.04,.81 if evolved else .67,.78),(spread-.035,.85 if evolved else .70,.78)],[(0,1,2,3)],'tail',M['teal'] if j%2 else M['body'])
    def pose(state,p):
        rig.reset()
        flap=math.sin(math.tau*p)
        bob=.035*math.cos(math.tau*p)
        z=.95+bob
        if state=='death':z-=.65*p
        rig.pose('root',(0,0,0),(0,0,.2))
        rig.pose('body',(0,.20,z),(0,-.20,z))
        peck=.12*math.sin(math.pi*p) if state=='attack' else 0
        rig.pose('head',(0,-.20,z+.1),(0,-.42-peck,z+.2-peck*.7))
        rig.pose('tail',(0,.25,z),(0,.70,z-.13+.055*flap))
        for side,sign in [('L',1),('R',-1)]:
            theta=.68*flap if state in ('walk','attack') else .20+.15*flap
            if state=='death':theta=1.2*p
            a=Vector((sign*.15,0,z+.04))
            b=a+Vector((sign*.39*math.cos(theta),.04,.39*math.sin(theta)))
            c=b+Vector((sign*.33*math.cos(theta+.15),.10,.33*math.sin(theta+.15)))
            rig.pose('wing1'+side,a,b);rig.pose('wing2'+side,b,c)
            rig.pose('leg'+side,(sign*.09,-.05,z-.10),(sign*.10,-.12,z-.30))
        if state=='death':ground_pose(rig.object)
    if evolved:rig.object.scale=(1.15,)*3
    return rig,pose,{'cycleSeconds':.8,'worldSpeed':.85,'frames':12,'type':'flight','stride':None,'stanceFraction':None}

def frog():
    spec=[('root',(0,0,0),(0,0,.2),None),('body',(0,.30,.40),(0,-.30,.40),'root'),('head',(0,-.20,.48),(0,-.50,.48),'body')]
    for side,sign in [('L',1),('R',-1)]:
        spec.extend([('hind1'+side,(sign*.24,.20,.35),(sign*.52,.18,.19),'body'),
                     ('hind2'+side,(sign*.52,.18,.19),(sign*.35,-.08,.065),'hind1'+side),
                     ('hindpaw'+side,(sign*.35,-.08,.065),(sign*.35,-.24,.065),'hind2'+side),
                     ('front'+side,(sign*.25,-.20,.38),(sign*.31,-.40,.065),'body'),
                     ('frontpaw'+side,(sign*.31,-.40,.065),(sign*.31,-.52,.065),'front'+side)])
    rig=Rig(names[id],spec)
    rig.sphere('Thân thiềm',(0,0,.42),(.38,.44,.30),'body',M['body'],12,8)
    rig.sphere('Bụng',(0,-.16,.32),(.31,.28,.15),'body',M['belly'])
    rig.sphere('Miệng',(0,-.35,.45),(.31,.19,.13),'head',M['body'])
    for side,sign in [('L',1),('R',-1)]:
        rig.sphere('Hốc mắt',(sign*.24,-.23,.65),(.115,.13,.13),'head',M['body'])
        rig.sphere('Mắt',(sign*.24,-.321,.67),(.08,.065,.081),'head',M['eye'])
        rig.sphere('Đồng tử',(sign*.24,-.375,.674),(.023,.013,.057),'head',M['pupil'])
        rig.segment('Đùi',(sign*.24,.20,.35),(sign*.52,.18,.19),.16,.11,'hind1'+side,M['body'])
        rig.segment('Cẳng',(sign*.52,.18,.19),(sign*.35,-.08,.065),.10,.07,'hind2'+side,M['dark'])
        rig.segment('Tay',(sign*.25,-.20,.38),(sign*.31,-.40,.065),.07,.045,'front'+side,M['body'])
        rig.sphere('Bàn chân sau',(sign*.35,-.11,.035),(.10,.13,.035),'hindpaw'+side,M['belly'],8,4)
        rig.sphere('Bàn chân trước',(sign*.31,-.43,.035),(.07,.09,.035),'frontpaw'+side,M['belly'],8,4)
        for j in [-1,0,1]:
            rig.spike('Ngón sau',(sign*.35,-.08,.065),(sign*.35+j*.07,-.25,.025),.035,'hindpaw'+side,M['belly'])
            rig.spike('Ngón trước',(sign*.31,-.40,.065),(sign*.31+j*.04,-.52,.025),.019,'frontpaw'+side,M['belly'])
    for i in range(14):
        angle=i*2.4
        x=math.cos(angle)*(.12+(i%3)*.055);y=math.sin(angle)*(.12+(i%4)*.03)
        rig.sphere('Nốt độc',(x,y,.66-math.fabs(x)*.25),(.037,.04,.04),'body',M['amber'] if i%3==0 else M['dark'],8,5)
    def pose(state,p):
        rig.reset()
        dy,lift,plant=foot_path(p,.34,.60,.20) if state=='walk' else (0,0,True)
        rise=lift*1.3
        drop=.20*p if state=='death' else 0
        z=.40+rise-drop
        rig.pose('root',(0,0,0),(0,0,.2))
        rig.pose('body',(0,.30,z),(0,-.30,z))
        rig.pose('head',(0,-.20,z+.08),(0,-.50,z+.08))
        for side,sign in [('L',1),('R',-1)]:
            hip=Vector((sign*.24,.20,z-.05))
            knee=Vector((sign*.52,.18+dy*.3,.19+rise-drop*.3))
            foot=Vector((sign*.35,-.08+dy,.065+lift))
            rig.pose('hind1'+side,hip,knee);rig.pose('hind2'+side,knee,foot)
            frontfoot=Vector((sign*.31,-.40+dy,.065+lift))
            rig.pose('front'+side,(sign*.25,-.20,z-.02),frontfoot)
            rig.pose('hindpaw'+side,foot,foot+Vector((0,-.16,0)))
            rig.pose('frontpaw'+side,frontfoot,frontfoot+Vector((0,-.12,0)))
            if state=='walk':
                for tag,bn,target in [('H'+side,'hindpaw'+side,foot),('F'+side,'frontpaw'+side,frontfoot)]:
                    actual=rig.object.pose.bones[bn].head.copy()
                    FOOT_ERRORS.append((actual-target).length)
                    TRACE.append({'phase':p,'limb':tag,'planted':plant,'foot':list(actual)})
        if state=='attack':
            lean=.06*math.sin(math.pi*p)
            rig.pose('head',(0,-.20-lean,z+.08),(0,-.50-lean,z+.08-lean*.4))
        if state=='death':ground_pose(rig.object)
    return rig,pose,{'cycleSeconds':.8,'worldSpeed':.34/(.6*.8),'stride':.34,'stanceFraction':.6,'frames':12,'type':'frog-hop','offsets':{'FL':0,'FR':0,'HL':0,'HR':0}}

rig,pose,walk=bird() if is_bird else (frog() if is_frog else quad())
bake(rig,pose)
frame=fit_camera(rig.object,pose)
pose('idle',0)
rig.object.rotation_euler.z=math.radians(45)
bpy.ops.wm.save_as_mainfile(filepath=str(MODELS/(id+'.blend')))
for d,angle in DIRECTIONS.items():
    rig.object.rotation_euler.z=math.radians(angle)
    for state,count in ({'walk':12} if opt.preview else COUNTS).items():
        for i in ([0,3,6,9] if opt.preview else range(count)):
            pose(state,i/count if state in ('idle','walk') else i/(count-1))
            scene.render.filepath=str(RAW/f'{state}-{d}-{i:02d}.png')
            bpy.ops.render.render(write_still=True)
            print('SPRITE',id,state,d,i,flush=True)
data={'actor':id,'name':names[id],'camera':{'type':'orthographic','elevationDegrees':35.26438968,'azimuthDegrees':-45,'orthoScale':frame['orthoScale']},
      'counts':COUNTS,'nativeFrameSize':frame['nativeFrameSize'],'renderSize':frame['renderSize'],'origin':frame['origin'],'walk':walk,'trace':TRACE,
      'maxFootTargetError':max(FOOT_ERRORS) if FOOT_ERRORS else None,'sourceWorkflow':'3D rig -> orthographic PNG -> fixed palette pixel sprites'}
(HERE/(id+'-rig.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('RIG_EXPORT_DONE',id,flush=True)
