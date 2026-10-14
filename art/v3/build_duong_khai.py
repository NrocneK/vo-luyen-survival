"""Dựng nhân vật, rig và xuất PNG. Đây là công cụ sản xuất asset, không phải code game.

Chạy: blender -b --python art/v2/build_duong_khai.py -- --preview
Hệ trục: Z lên, -Y là mặt nhân vật; camera orthographic không đổi.
"""
from pathlib import Path
import argparse
import json
import math
import sys
import bpy
from mathutils import Vector, Matrix

sys.path.insert(0,str(Path(__file__).resolve().parent))
from toon_materials import apply_toon,renderer
from rig_helpers import fit_camera,ik,ground_pose
from attack_library import attacks,states,sample,pulse,envelope

ROOT = Path(__file__).resolve().parents[2]
V2 = ROOT / 'art' / 'v3'
MODELS = V2 / 'models'
args = argparse.ArgumentParser()
args.add_argument('--preview', action='store_true')
args.add_argument('--sword', action='store_true')
args.add_argument('--states', default='idle,walk,attack-1,attack-2,attack-3,death')
args.add_argument('--directions',default='S,SW,W,NW,N,NE,E,SE')
opts = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
ACTOR = 'duong-khai-kiem' if opts.sword else 'duong-khai'
RAW = V2 / 'renders' / ACTOR
for folder in (RAW, MODELS):
    folder.mkdir(parents=True, exist_ok=True)
DIRECTIONS = {'S':45, 'SW':0, 'W':-45, 'NW':-90, 'N':-135, 'NE':180, 'E':135, 'SE':90}
COUNTS = {k:v[0] for k,v in states(ACTOR).items()}
CYCLE = .8
STRIDE = .50
STANCE = .60
SPEED = STRIDE / (STANCE * CYCLE)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.cycles.use_denoising = True
scene.cycles.seed = 17
scene.render.resolution_x = scene.render.resolution_y = 192
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.fps = 15
scene.display.shading.light = 'STUDIO'
scene.display.shading.studio_light = 'paint.sl'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = 'BOTH'
scene.display.shading.curvature_ridge_factor = 1.3
scene.display.shading.curvature_valley_factor = 1.1
scene.display.shading.show_specular_highlight = False
scene.display.shading.show_object_outline = True
scene.display.shading.object_outline_color = (.035,.045,.055)
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'Medium High Contrast'
renderer(scene)

def material(name, rgb):
    m = bpy.data.materials.new(name)
    apply_toon(m,rgb)
    return m

MAT = {k:material(k,v) for k,v in {
    'robe':(.085,.27,.29), 'robe_light':(.18,.40,.40),
    'robe_dark':(.045,.16,.20), 'ivory':(.84,.82,.65),
    'red':(.63,.075,.075), 'red_dark':(.31,.03,.045),
    'gold':(.66,.44,.16), 'steel':(.63,.76,.75),
    'skin':(.83,.59,.39), 'skin_light':(.94,.73,.50),
    'hair':(.085,.105,.125), 'hair_light':(.14,.19,.22),
    'boots':(.25,.16,.11), 'boots_light':(.42,.28,.16),
    'pants':(.11,.19,.22), 'eye':(.018,.025,.03),
}.items()}

rig_data = bpy.data.armatures.new('Dương Khai — skeleton')
rig = bpy.data.objects.new('DK_RIG', rig_data)
scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
REST = {}
def bone_axes(a,b):
    y=(Vector(b)-Vector(a)).normalized()
    ref=Vector((1,0,0))
    x=(ref-y*ref.dot(y)).normalized()
    z=x.cross(y).normalized()
    return Matrix((x,y,z)).transposed()

def bone(name, a, b, parent=None):
    eb = rig_data.edit_bones.new(name)
    eb.head, eb.tail = a, b
    eb.align_roll(bone_axes(a,b).col[2])
    if parent:
        eb.parent = rig_data.edit_bones[parent]
    REST[name] = (Vector(a), Vector(b))

bone('root',(0,0,0),(0,0,.2))
bone('pelvis',(0,0,.94),(0,0,1.04),'root')
bone('spine',(0,0,.99),(0,0,1.57),'pelvis')
bone('head',(0,0,1.57),(0,0,2.14),'spine')
bone('tail_1',(0,.10,2.16),(0,.23,1.91),'head')
bone('tail_2',(0,.23,1.91),(0,.31,1.67),'tail_1')
for side, x in [('L',.16),('R',-.16)]:
    bone('thigh_'+side,(x,0,.94),(x,0,.51),'pelvis')
    bone('shin_'+side,(x,0,.51),(x,0,.10),'thigh_'+side)
    bone('foot_'+side,(x,0,.10),(x,-.20,.10),'shin_'+side)
    sx = .31 if side == 'L' else -.31
    ex = .39 if side == 'L' else -.39
    bone('arm_'+side,(sx,0,1.51),(ex,0,1.25),'spine')
    bone('forearm_'+side,(ex,0,1.25),(ex,-.03,1.04),'arm_'+side)
    bone('hand_'+side,(ex,-.03,1.04),(ex,-.08,.95),'forearm_'+side)
    bone('skirt_'+side,(x,0,.94),(x,0,.52),'pelvis')
bone('sash',(0,-.16,.98),(0,-.19,.63),'pelvis')
bpy.ops.object.mode_set(mode='OBJECT')
rig.show_in_front = True
rig['workflow'] = 'User approved: real 3D rig -> 8 directional 2D PNG sprites'
rig['gait_cycle_seconds'] = CYCLE
rig['root_speed_world_units'] = SPEED

def bind(obj, b, mat):
    obj.data.materials.append(MAT[mat])
    obj.parent = rig
    group = obj.vertex_groups.new(name=b)
    group.add(list(range(len(obj.data.vertices))), 1.0, 'REPLACE')
    mod = obj.modifiers.new('Rig — '+b,'ARMATURE')
    mod.object = rig
    return obj

def mesh(name, vertices, faces, b, mat):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],faces)
    data.update()
    obj = bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    return bind(obj,b,mat)

def sphere(name, center, scale, b, mat, segments=10, rings=6):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=center)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    return bind(o,b,mat)

def box(name, center, scale, b, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=center)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    if bevel:
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        mod = o.modifiers.new('Edges','BEVEL')
        mod.width = bevel
        mod.segments = 1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    return bind(o,b,mat)

def segment(name, a, b, radius_a, radius_b, bn, mat, sides=8):
    a,b = Vector(a),Vector(b)
    axis = (b-a).normalized()
    ref = Vector((0,1,0)) if abs(axis.y)<.9 else Vector((1,0,0))
    u = axis.cross(ref).normalized()
    v = axis.cross(u).normalized()
    vertices=[]
    for p,r in [(a,radius_a),(b,radius_b)]:
        for i in range(sides):
            angle = 2*math.pi*i/sides
            vertices.append(p+r*(u*math.cos(angle)+v*math.sin(angle)))
    faces=[tuple(range(sides-1,-1,-1)),tuple(range(sides,2*sides))]
    faces += [(i,(i+1)%sides,(i+1)%sides+sides,i+sides) for i in range(sides)]
    return mesh(name,vertices,faces,bn,mat)

def torso_ring(name, levels, b, mat, sides=8):
    verts=[]
    for z,rx,ry in levels:
        for i in range(sides):
            angle=2*math.pi*i/sides+math.pi/8
            verts.append((rx*math.cos(angle),ry*math.sin(angle),z))
    faces=[tuple(range(sides-1,-1,-1)),tuple(range((len(levels)-1)*sides,len(levels)*sides))]
    for r in range(len(levels)-1):
        faces += [(r*sides+i,r*sides+(i+1)%sides,(r+1)*sides+(i+1)%sides,(r+1)*sides+i) for i in range(sides)]
    return mesh(name,verts,faces,b,mat)

# Áo có eo, cổ chéo và tà tách. Chân luôn có khoảng trống để đọc được bước.
torso_ring('Áo xanh — thân',[(.98,.20,.14),(1.13,.24,.15),(1.43,.29,.18),(1.56,.22,.145)],'spine','robe')
mesh('Cổ áo trái',[(-.20,-.12,1.56),(-.12,-.176,1.54),(.06,-.182,1.19),(-.005,-.185,1.18)],[(0,3,2,1)],'spine','ivory')
mesh('Cổ áo phải',[(.20,-.12,1.56),(.12,-.176,1.54),(-.035,-.188,1.29),(-.10,-.184,1.35)],[(0,1,2,3)],'spine','ivory')
torso_ring('Đai đỏ',[(.99,.221,.154),(1.085,.227,.159)],'pelvis','red')
box('Khóa đai',(0,-.162,1.036),(.078,.025,.075),'pelvis','gold',.008)
box('Đầu đai',(0,-.178,.79),(.10,.025,.31),'sash','red_dark',.005)
mesh('Nếp đai',[(.0,-.20,.96),(.06,-.20,.95),(.035,-.206,.63),(-.04,-.206,.65)],[(0,1,2,3)],'sash','red')
for side,sign in [('L',1),('R',-1)]:
    x=.16*sign
    segment('Quần đùi '+side,(x,0,.93),(x,0,.52),.115,.085,'thigh_'+side,'pants')
    segment('Quần ống '+side,(x,0,.51),(x,0,.12),.087,.065,'shin_'+side,'pants')
    box('Ủng '+side,(x,-.065,.105),(.155,.27,.21),'foot_'+side,'boots',.032)
    box('Mũi ủng '+side,(x,-.155,.075),(.16,.13,.13),'foot_'+side,'boots_light',.02)
    segment('Viền ủng '+side,(x,0,.21),(x,0,.235),.084,.086,'shin_'+side,'gold')
    # Hai tà ngoài không tạo thành khối váy liền che hai chân.
    verts=[(sign*.11,-.10,.98),(sign*.26,-.07,.98),(sign*.32,-.08,.54),(sign*.16,-.14,.55),
           (sign*.11,.12,.98),(sign*.26,.10,.98),(sign*.31,.13,.52),(sign*.16,.18,.54)]
    faces=[(0,1,2,3),(4,7,6,5),(1,5,6,2),(3,2,6,7)]
    if sign>0:faces=[tuple(reversed(f)) for f in faces]
    mesh('Tà áo '+side,verts,faces,'skirt_'+side,'robe_dark')
    mesh('Viền tà '+side,[(sign*.16,-.146,.55),(sign*.32,-.086,.54),(sign*.32,-.086,.568),(sign*.16,-.146,.578)],[(0,1,2,3)],'skirt_'+side,'gold')
    sx=.31*sign; ex=.39*sign
    sphere('Vai '+side,(sx,0,1.48),(.15,.15,.16),'arm_'+side,'robe_light')
    segment('Tay áo '+side,(sx,0,1.48),(ex,0,1.29),.125,.10,'arm_'+side,'robe')
    segment('Cẳng tay '+side,(ex,0,1.24),(ex,-.025,1.07),.075,.085,'forearm_'+side,'skin')
    segment('Bao tay '+side,(ex,-.016,1.18),(ex,-.035,1.02),.096,.105,'forearm_'+side,'gold')
    sphere('Nắm tay '+side,(ex,-.065,1.00),(.095,.095,.10),'hand_'+side,'boots_light')
    box('Giáp mu tay '+side,(ex,-.143,1.04),(.10,.024,.10),'hand_'+side,'gold',.008)

segment('Cổ',(0,0,1.54),(0,0,1.73),.10,.10,'head','skin')
sphere('Mặt',(0,-.015,1.87),(.225,.188,.277),'head','skin_light',12,8)
sphere('Tóc chỏm',(0,.036,1.986),(.238,.195,.209),'head','hair',12,8)
box('Tóc mai L',(.198,-.11,1.864),(.052,.048,.20),'head','hair',.01)
box('Tóc mai R',(-.198,-.11,1.864),(.052,.048,.20),'head','hair',.01)
for sign in [1,-1]:
    mesh('Mái tóc '+str(sign),[(sign*.03,-.172,2.073),(sign*.20,-.157,2.03),(sign*.17,-.19,1.905),(sign*.08,-.195,1.972)],[(0,1,2,3)],'head','hair')
    box('Mày '+str(sign),(sign*.082,-.196,1.914),(.065,.015,.013),'head','hair')
    box('Mắt '+str(sign),(sign*.079,-.199,1.887),(.043,.014,.012),'head','eye')
    sphere('Tai '+str(sign),(sign*.214,-.006,1.857),(.038,.035,.062),'head','skin')
sphere('Mũi',(0,-.201,1.851),(.027,.026,.033),'head','skin',8,5)
box('Miệng',(0,-.197,1.796),(.057,.014,.012),'head','boots_light')
sphere('Búi tóc',(0,.062,2.178),(.105,.103,.10),'head','hair')
box('Dây buộc tóc',(0,.132,2.12),(.10,.08,.038),'head','red')
segment('Đuôi tóc 1',(0,.10,2.16),(0,.23,1.91),.077,.07,'tail_1','hair')
segment('Đuôi tóc 2',(0,.23,1.91),(0,.31,1.67),.07,.022,'tail_2','hair_light')

if opts.sword:
    segment('Chuôi kiếm',(-.39,-.05,1.01),(-.39,-.22,1.01),.035,.035,'hand_R','boots')
    box('Chắn kiếm',(-.39,-.23,1.01),(.24,.042,.048),'hand_R','gold',.006)
    mesh('Lưỡi kiếm',[(-.445,-.25,1.01),(-.335,-.25,1.01),(-.39,-1.03,1.01),(-.39,-.25,1.052),(-.39,-.25,.978)],[(0,3,2),(3,1,2),(1,4,2),(4,0,2)],'hand_R','steel')

# Camera true isometric: elevation atan(1/sqrt(2)), azimuth -45 độ.
bpy.ops.object.camera_add(location=(6,-6,6.0))
camera=bpy.context.object
camera.name='CAMERA_ISOMETRIC_FIXED'
target=Vector((0,0,1.07))
camera.location=target+Vector((6,-6,6))
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=2.90
scene.camera=camera
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.82,.86,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.65
bpy.ops.object.light_add(type='AREA',location=(-3,-4,6))
key=bpy.context.object
key.name='KEY_FIXED_UPPER_LEFT'
key.data.energy=350
key.data.size=4
key.rotation_euler=(Vector((0,0,1))-key.location).to_track_quat('-Z','Y').to_euler()

def set_bone(name, a, b, scale=1):
    a,b=Vector(a),Vector(b)
    q=bone_axes(a,b).to_quaternion()
    length=(REST[name][1]-REST[name][0]).length
    m=Matrix.Translation(a) @ q.to_matrix().to_4x4()
    m=m @ Matrix.Diagonal(Vector((scale,(b-a).length/length,scale,1)))
    rig.pose.bones[name].matrix=m
    bpy.context.view_layer.update()

def knee_ik(hip, ankle, upper=.43, lower=.41):
    """Hai đoạn chân có chiều dài cố định; gối gập về phía trước (-Y)."""
    axis=ankle-hip
    dist=axis.length
    if dist>=upper+lower:
        raise ValueError('Chân vượt tầm IK: '+str(dist))
    axis.normalize()
    along=(upper*upper-lower*lower+dist*dist)/(2*dist)
    bend=Vector((0,-1,0))
    bend=(bend-axis*bend.dot(axis)).normalized()
    return hip+axis*along+bend*math.sqrt(max(0,upper*upper-along*along))

def gait(phase):
    p=phase%1
    if p<STANCE:
        return -.25+STRIDE*p/STANCE, 0, True
    u=(p-STANCE)/(1-STANCE)
    smooth=u*u*(3-2*u)
    return .25-STRIDE*smooth, .15*math.sin(math.pi*u), False

TRACE=[]
FOOT_ERRORS=[]
ATTACK_TRACE=[]

def twist_bone(name, yaw):
    pb=rig.pose.bones[name]
    pivot=pb.head.copy()
    pb.matrix=Matrix.Translation(pivot) @ Matrix.Rotation(yaw,4,'Z') @ Matrix.Translation(-pivot) @ pb.matrix
    bpy.context.view_layer.update()
def pose(state, phase):
    for pb in rig.pose.bones:
        pb.matrix_basis=Matrix.Identity(4)
    bpy.context.view_layer.update()
    attacking=state.startswith('attack-')
    index=int(state[-1])-1 if attacking else -1
    power=pulse(phase) if attacking else 0
    env=envelope(phase) if attacking else 0
    bob=-.015*math.sin(4*math.pi*phase) if state=='walk' else (0 if attacking else .008*math.sin(2*math.pi*phase))
    weight_shift=.035*math.sin(2*math.pi*phase) if state=='walk' else 0
    if attacking: weight_shift=(.027 if index in (0,2) else -.027)*power
    pelvis=Vector((weight_shift,0,.870+bob))
    set_bone('root',(0,0,0),(0,0,.2))
    set_bone('pelvis',pelvis,pelvis+Vector((0,0,.1)))
    chest=pelvis+Vector((0,-.028 if state=='walk' else 0,.62))
    yaw=math.radians(([28,-32,38] if opts.sword else [-18,30,-24])[index])*power if attacking else 0
    turn=Matrix.Rotation(yaw,3,'Z')
    if attacking:
        chest.y-=.075*power
        chest.z+=(-.025*power if index<2 else .045*power)
    set_bone('spine',pelvis+Vector((0,0,.05)),chest)
    if attacking:twist_bone('spine',yaw)
    head=chest+Vector((0,0,.56))
    set_bone('head',chest,head)
    if attacking:twist_bone('head',yaw*.6)
    swing=.07*math.sin(2*math.pi*phase) if state=='walk' else .015*math.sin(2*math.pi*phase)
    tail_a=head+Vector((0,.10,.03))
    tail_b=head+Vector((swing,.24,-.22))
    tail_c=head+Vector((swing*1.5,.31,-.46))
    set_bone('tail_1',tail_a,tail_b)
    set_bone('tail_2',tail_b,tail_c)
    for side,sign,offset in [('L',1,0),('R',-1,.5)]:
        p=(phase+offset)%1
        if state=='walk':
            y,lift,plant=gait(p)
        else:
            y,lift,plant=(.045*sign,0,True)
        hip=pelvis+Vector((.16*sign,0,0))
        ankle=Vector((.16*sign,y,.10+lift))
        knee=knee_ik(hip,ankle)
        set_bone('thigh_'+side,hip,knee)
        set_bone('shin_'+side,knee,ankle)
        toe=ankle+Vector((0,-.20,0))
        set_bone('foot_'+side,ankle,toe)
        skirt_a=hip
        skirt_b=hip+Vector((sign*.02,y*.32,-.42))
        set_bone('skirt_'+side,skirt_a,skirt_b)
        shoulder=chest+turn @ Vector((sign*.31,0,-.06))
        arm_y=-.16*math.cos(2*math.pi*p) if state=='walk' else .03
        # Tay đối pha chân cùng bên: chân tới trước thì tay lùi.
        elbow=shoulder+Vector((sign*.07,-arm_y*.65,-.25))
        wrist=shoulder+Vector((sign*.07,-arm_y,-.45))
        blade=None
        if attacking:
            rest=(sign*.07,-.03,-.45)
            if opts.sword and side=='R':
                # Ba cung kiếm khác nhau trong không gian, luôn giữ một tay cầm kiếm.
                paths=[[(0,rest),(.28,(-.08,.06,.24)),(.54,(.15,-.32,-.08)),(.72,(.27,-.12,-.28)),(1,rest)],
                       [(0,rest),(.28,(.20,-.03,-.27)),(.54,(-.02,-.32,.18)),(.72,(-.12,.02,.26)),(1,rest)],
                       [(0,rest),(.28,(-.29,.06,-.10)),(.54,(.18,-.34,-.09)),(.72,(.29,-.08,-.09)),(1,rest)]]
                angles=[[(0,(0,-55)),(.28,(-65,50)),(.54,(25,-12)),(.72,(65,-55)),(1,(0,-55))],
                        [(0,(0,-55)),(.28,(65,-55)),(.54,(-25,30)),(.72,(-65,60)),(1,(0,-55))],
                        [(0,(0,-55)),(.28,(-110,3)),(.54,(5,3)),(.72,(110,3)),(1,(0,-55))]]
                wrist=shoulder+turn @ Vector(sample(phase,paths[index]))
                azimuth,elevation=map(math.radians,sample(phase,angles[index]))
                blade=turn @ Vector((math.sin(azimuth)*math.cos(elevation),-math.cos(azimuth)*math.cos(elevation),math.sin(elevation)))
            elif not opts.sword and side==('R' if index==1 else 'L'):
                paths=[[(0,rest),(.28,(.04,-.17,-.22)),(.54,(.01,-.465,-.06)),(.72,(.04,-.38,-.10)),(1,rest)],
                       [(0,rest),(.28,(-.12,.06,-.17)),(.54,(.15,-.435,-.07)),(.72,(.19,-.32,-.10)),(1,rest)],
                       [(0,rest),(.28,(.10,-.10,-.32)),(.54,(-.04,-.32,.22)),(.72,(-.02,-.24,.28)),(1,rest)]]
                wrist=shoulder+turn @ Vector(sample(phase,paths[index]))
            else:
                guard=Vector((sign*.025,-.23,-.18))
                wrist=shoulder+turn @ Vector(rest).lerp(guard,env)
            elbow=ik(shoulder,wrist,.272,.212,bend=turn @ Vector((sign,.20,.06)))
        set_bone('arm_'+side,shoulder,elbow)
        set_bone('forearm_'+side,elbow,wrist)
        hand_dir=Vector((0,-.05,-.09))
        if not attacking and state!='walk':
            elbow=ik(shoulder,wrist,.272,.212,bend=(sign,.20,.06))
            set_bone('arm_'+side,shoulder,elbow)
            set_bone('forearm_'+side,elbow,wrist)
        if opts.sword and not attacking and side=='R':
            hand_dir=Matrix.Rotation(math.radians(55),3,'X') @ hand_dir
        if attacking and not opts.sword:
            active=side==('R' if index==1 else 'L')
            desired=Vector((0,-.10,.025 if index==2 else -.005))
            hand_dir=turn @ hand_dir.lerp(desired,env if active else env*.65)
        set_bone('hand_'+side,wrist,wrist+hand_dir)
        if blade is not None:
            # Hướng lưỡi kiếm được đặt độc lập với góc gập cổ tay, không kéo dài mesh.
            orientation=blade.to_track_quat('-Y','Z').to_matrix().to_4x4()
            rig.pose.bones['hand_'+side].matrix=Matrix.Translation(wrist) @ orientation @ bone_axes(*REST['hand_'+side]).to_4x4()
            bpy.context.view_layer.update()
        if state=='walk':
            actual=rig.pose.bones['foot_'+side].head.copy()
            FOOT_ERRORS.append((actual-ankle).length)
            TRACE.append({'phase':phase,'side':side,'hip':list(hip),'knee':list(knee),'ankle':list(actual),'planted':plant,'localPhase':p})
    set_bone('sash',pelvis+Vector((0,-.16,.04)),pelvis+Vector((swing*.4,-.19,-.31)))
    if state=='death':
        fall=min(phase/ .85,1)
        fall=fall*fall*(3-2*fall)
        transform=Matrix.Translation((0,-.82*fall,.08*fall)) @ Matrix.Rotation(-math.radians(82)*fall,4,'X')
        targets={pb.name:transform @ pb.matrix.copy() for pb in rig.pose.bones}
        for pb in rig.pose.bones:
            pb.matrix=targets[pb.name]
            bpy.context.view_layer.update()
        ground_pose(rig)
    bpy.context.view_layer.update()
    if attacking:
        entry={'state':state,'phase':phase,'leftHand':list(rig.pose.bones['hand_L'].head),
               'rightHand':list(rig.pose.bones['hand_R'].head),'torsoYaw':yaw}
        if opts.sword:
            pb=rig.pose.bones['hand_R']
            local=Vector((-.39,-1.03,1.01))-REST['hand_R'][0]
            entry['bladeTip']=list(pb.matrix @ bone_axes(*REST['hand_R']).to_4x4().inverted() @ local)
        ATTACK_TRACE.append(entry)

def bake():
    frame=1
    for state,count in COUNTS.items():
        action=bpy.data.actions.new('DK_'+state)
        rig.animation_data_create()
        rig.animation_data.action=action
        for i in range(count+1):
            scene.frame_set(i+1)
            phase=i/count if state in ('walk','idle') else i/(count-1)
            pose(state,min(phase,1) if state not in ('walk','idle') else phase)
            for pb in rig.pose.bones:
                pb.rotation_mode='QUATERNION'
                pb.keyframe_insert(data_path='location',frame=i+1,group=pb.name)
                pb.keyframe_insert(data_path='rotation_quaternion',frame=i+1,group=pb.name)
                pb.keyframe_insert(data_path='scale',frame=i+1,group=pb.name)
        action.use_fake_user=True
        for curve in action.fcurves:
            for point in curve.keyframe_points:point.interpolation='LINEAR'
            if state in ('walk','idle'):curve.modifiers.new('CYCLES')
    rig.animation_data.action=None
    scene.frame_set(1)

bake()
frame=fit_camera(rig,pose,COUNTS)
pose('idle',0)
rig.rotation_euler.z=math.radians(45)
bpy.ops.wm.save_as_mainfile(filepath=str(MODELS/('duong-khai-kiem.blend' if opts.sword else 'duong-khai.blend')))
states={'walk':12} if opts.preview else {s:COUNTS[s] for s in opts.states.split(',')}
for direction,angle in DIRECTIONS.items():
    if direction not in opts.directions.split(','):continue
    rig.rotation_euler.z=math.radians(angle)
    for state,count in states.items():
        frames=[0,3,6,9] if opts.preview else range(count)
        for i in frames:
            phase=i/count if state in ('walk','idle') else i/(count-1)
            pose(state,phase)
            path=RAW/f'{state}-{direction}-{i:02d}.png'
            scene.render.filepath=str(path)
            bpy.ops.render.render(write_still=True)
            print('SPRITE',path.name,flush=True)
config={'actor':ACTOR,'camera':{'type':'orthographic','elevationDegrees':35.26438968,'azimuthDegrees':-45,'orthoScale':frame['orthoScale']},
        'directions':DIRECTIONS,'counts':COUNTS,'nativeFrameSize':frame['nativeFrameSize'],'renderSize':frame['renderSize'],'origin':frame['origin'],
        'walk':{'cycleSeconds':CYCLE,'stride':STRIDE,'stanceFraction':STANCE,'worldSpeed':SPEED,'frames':12},'trace':TRACE,
        'maxFootTargetError':max(FOOT_ERRORS),'attacks':attacks(ACTOR),'attackTrace':ATTACK_TRACE,
        'sourceWorkflow':'3D rig -> orthographic PNG -> fixed palette pixel sprites'}
(V2/(ACTOR+'-rig.json')).write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf-8')
print('RIG_EXPORT_DONE',flush=True)
