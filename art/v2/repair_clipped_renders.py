"""Render lại pose chạm mép bằng canvas rộng hơn, giữ nguyên số pixel trên đơn vị thế giới."""
from pathlib import Path
import json
import math
import bpy

HERE=Path(__file__).resolve().parent
DIRECTIONS={'S':45,'SW':0,'W':-45,'NW':-90,'N':-135,'NE':180,'E':135,'SE':90}
qa=json.loads((HERE/'preview/qa-report.json').read_text(encoding='utf-8'))
for item in qa['actors']:
    frames=item['sourceClipped']
    if not frames:continue
    id=item['id']
    data=json.loads((HERE/(id+'-rig.json')).read_text(encoding='utf-8'))
    bpy.ops.wm.open_mainfile(filepath=str(HERE/'models'/(id+'.blend')))
    scene=bpy.context.scene
    rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
    resolution=data['renderSize']
    scene.render.resolution_x=scene.render.resolution_y=resolution+32
    scene.camera.data.ortho_scale=data['camera']['orthoScale']*(resolution+32)/resolution
    for name in frames:
        state,direction,i=name.rsplit('-',2)
        action=next(a for a in bpy.data.actions if a.name.endswith('_'+state) or a.name.endswith(' '+state))
        rig.animation_data.action=action
        rig.rotation_euler.z=math.radians(DIRECTIONS[direction])
        scene.frame_set(int(i)+1)
        scene.render.filepath=str(HERE/'renders'/id/(name+'.png'))
        bpy.ops.render.render(write_still=True)
        print('REPAIRED',id,name,flush=True)
