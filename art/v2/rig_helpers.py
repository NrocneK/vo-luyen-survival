"""Các hàm dựng mesh/rig/camera dùng chung trong Blender. Chỉ sản xuất asset."""
from pathlib import Path
import math
import bpy
from mathutils import Vector, Matrix
from toon_materials import apply_toon,renderer

DIRECTIONS={'S':45,'SW':0,'W':-45,'NW':-90,'N':-135,'NE':180,'E':135,'SE':90}
COUNTS={'idle':8,'walk':12,'attack':10,'death':10}

def initialize(size=192,ortho=2.9,target_z=1.07):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    s=bpy.context.scene
    s.render.engine='CYCLES'
    s.cycles.samples=16
    s.cycles.use_denoising=True
    s.cycles.seed=17
    s.render.resolution_x=s.render.resolution_y=size
    s.render.resolution_percentage=100
    s.render.film_transparent=True
    s.render.image_settings.file_format='PNG'
    s.render.image_settings.color_mode='RGBA'
    s.render.fps=15
    s.view_settings.view_transform='Standard'
    s.view_settings.look='Medium High Contrast'
    renderer(s)
    s.world.use_nodes=True
    s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.82,.86,1)
    s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.65
    target=Vector((0,0,target_z))
    bpy.ops.object.camera_add(location=target+Vector((6,-6,6)))
    c=bpy.context.object
    c.name='CAMERA_ISOMETRIC_FIXED'
    c.rotation_euler=(target-c.location).to_track_quat('-Z','Y').to_euler()
    c.data.type='ORTHO'
    c.data.ortho_scale=ortho
    s.camera=c
    bpy.ops.object.light_add(type='AREA',location=(-3,-4,6))
    key=bpy.context.object
    key.name='KEY_FIXED_UPPER_LEFT'
    key.data.energy=350
    key.data.size=4
    key.rotation_euler=(Vector((0,0,1))-key.location).to_track_quat('-Z','Y').to_euler()
    return s

def mat(name,rgb):
    m=bpy.data.materials.new(name)
    apply_toon(m,rgb)
    return m

def axes(a,b,ref=None):
    y=(Vector(b)-Vector(a)).normalized()
    ref=Vector(ref or ((0,0,1) if abs(y.x)>.9 else (1,0,0)))
    x=(ref-y*ref.dot(y)).normalized()
    z=x.cross(y).normalized()
    return Matrix((x,y,z)).transposed()

class Rig:
    def __init__(self,name,spec):
        self.rest={}
        data=bpy.data.armatures.new(name+' skeleton')
        self.object=bpy.data.objects.new(name+' RIG',data)
        bpy.context.scene.collection.objects.link(self.object)
        bpy.context.view_layer.objects.active=self.object
        self.object.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT')
        for name,a,b,parent in spec:
            bone=data.edit_bones.new(name)
            bone.head,bone.tail=a,b
            ref=(0,0,1) if name.startswith('wing') else None
            bone.align_roll(axes(a,b,ref).col[2])
            if parent:bone.parent=data.edit_bones[parent]
            self.rest[name]=(Vector(a),Vector(b),ref)
        bpy.ops.object.mode_set(mode='OBJECT')
        self.object.show_in_front=True
    def reset(self):
        for pb in self.object.pose.bones:pb.matrix_basis=Matrix.Identity(4)
        bpy.context.view_layer.update()
    def pose(self,name,a,b):
        a,b=Vector(a),Vector(b)
        ra,rb,ref=self.rest[name]
        m=Matrix.Translation(a) @ axes(a,b,ref).to_4x4()
        m=m @ Matrix.Diagonal(Vector((1,(b-a).length/(rb-ra).length,1,1)))
        self.object.pose.bones[name].matrix=m
        bpy.context.view_layer.update()
    def transform(self,m):
        targets={p.name:m @ p.matrix.copy() for p in self.object.pose.bones}
        for p in self.object.pose.bones:
            p.matrix=targets[p.name]
            bpy.context.view_layer.update()
    def bind(self,o,b,material):
        o.data.materials.append(material)
        o.parent=self.object
        group=o.vertex_groups.new(name=b)
        group.add(list(range(len(o.data.vertices))),1,'REPLACE')
        mod=o.modifiers.new('Rig: '+b,'ARMATURE')
        mod.object=self.object
        return o
    def mesh(self,name,verts,faces,b,m):
        data=bpy.data.meshes.new(name)
        data.from_pydata(verts,[],faces)
        data.update()
        o=bpy.data.objects.new(name,data)
        bpy.context.scene.collection.objects.link(o)
        return self.bind(o,b,m)
    def sphere(self,name,p,scale,b,m,segments=10,rings=6):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=p)
        o=bpy.context.object
        o.name=name
        o.scale=scale
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        return self.bind(o,b,m)
    def segment(self,name,a,b,ra,rb,bn,m,sides=8):
        a,b=Vector(a),Vector(b)
        axis=(b-a).normalized()
        ref=Vector((0,1,0)) if abs(axis.y)<.9 else Vector((1,0,0))
        u=axis.cross(ref).normalized();v=axis.cross(u).normalized()
        verts=[]
        for p,r in [(a,ra),(b,rb)]:
            for i in range(sides):
                ang=math.tau*i/sides
                verts.append(p+r*(u*math.cos(ang)+v*math.sin(ang)))
        faces=[tuple(range(sides-1,-1,-1)),tuple(range(sides,2*sides))]
        faces += [(i,(i+1)%sides,(i+1)%sides+sides,i+sides) for i in range(sides)]
        return self.mesh(name,verts,faces,bn,m)
    def spike(self,name,base,tip,r,b,m):
        return self.segment(name,base,tip,r,.003,b,m,5)

def ik(hip,foot,a,b,bend=(0,-1,0)):
    delta=foot-hip
    length=delta.length
    if length>=a+b:raise ValueError(f'IK vượt tầm: {length} >= {a+b}')
    delta.normalize()
    along=(a*a-b*b+length*length)/(2*length)
    bend=Vector(bend)
    bend=(bend-delta*bend.dot(delta)).normalized()
    return hip+delta*along+bend*math.sqrt(max(0,a*a-along*along))

def foot_path(p,stride=.38,stance=.65,lift=.10):
    p=p%1
    if p<stance:return -stride/2+stride*p/stance,0,True
    u=(p-stance)/(1-stance)
    return stride/2-stride*u*u*(3-2*u),lift*math.sin(math.pi*u),False

def bake(rig,pose):
    obj=rig.object
    scene=bpy.context.scene
    for state,count in COUNTS.items():
        action=bpy.data.actions.new(obj.name+' '+state)
        obj.animation_data_create()
        obj.animation_data.action=action
        for i in range(count+1):
            scene.frame_set(i+1)
            pose(state,i/count if state in ('idle','walk') else min(i/(count-1),1))
            for p in obj.pose.bones:
                p.rotation_mode='QUATERNION'
                for channel in ('location','rotation_quaternion','scale'):
                    p.keyframe_insert(data_path=channel,frame=i+1,group=p.name)
        action.use_fake_user=True
        for curve in action.fcurves:
            for point in curve.keyframe_points:point.interpolation='LINEAR'
            if state in ('idle','walk'):curve.modifiers.new('CYCLES')
    obj.animation_data.action=None
    scene.frame_set(1)

def fit_camera(obj,pose):
    """Một khung chung cho mọi pose/hướng. Tăng canvas, giữ pixel trên đơn vị thế giới."""
    from bpy_extras.object_utils import world_to_camera_view
    scene=bpy.context.scene
    camera=scene.camera
    base=scene.render.resolution_x
    extent=.5
    for direction,angle in DIRECTIONS.items():
        obj.rotation_euler.z=math.radians(angle)
        for state,count in COUNTS.items():
            for i in range(count):
                pose(state,i/count if state in ('idle','walk') else i/(count-1))
                graph=bpy.context.evaluated_depsgraph_get()
                for mesh in (o for o in bpy.data.objects if o.type=='MESH'):
                    evaluated=mesh.evaluated_get(graph)
                    for corner in evaluated.bound_box:
                        v=world_to_camera_view(scene,camera,evaluated.matrix_world @ Vector(corner))
                        extent=max(extent,abs(v.x-.5),abs(v.y-.5))
    resolution=max(base,int(math.ceil((2*extent*base+12)/16))*16)
    camera.data.ortho_scale*=resolution/base
    scene.render.resolution_x=scene.render.resolution_y=resolution
    obj.rotation_euler.z=math.radians(45)
    pose('idle',0)
    origin=world_to_camera_view(scene,camera,Vector((0,0,0)))
    return {'renderSize':resolution,'nativeFrameSize':resolution//2,
            'origin':[origin.x,1-origin.y],'orthoScale':camera.data.ortho_scale}

def ground_pose(obj):
    """Giữ hình ngã xuống trên mặt đất; đo vertex thật sau biến dạng."""
    graph=bpy.context.evaluated_depsgraph_get()
    floor=0
    for o in (o for o in bpy.data.objects if o.type=='MESH'):
        e=o.evaluated_get(graph)
        floor=min(floor,min((e.matrix_world @ v.co).z for v in e.data.vertices))
    if floor>=-1e-6:return
    shift=Matrix.Translation((0,0,-floor/obj.scale.z))
    targets={p.name:shift @ p.matrix.copy() for p in obj.pose.bones}
    for p in obj.pose.bones:
        p.matrix=targets[p.name]
        bpy.context.view_layer.update()
