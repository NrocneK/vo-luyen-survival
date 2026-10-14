"""Vật liệu bảng màu rõ, bóng theo pháp tuyến: ổn định giữa các khung pixel."""
import bpy

def linear(c):
    return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4

def apply_toon(material,rgb):
    material.diffuse_color=(*rgb,1)
    material.use_nodes=True
    nodes=material.node_tree.nodes
    nodes.clear()
    links=material.node_tree.links
    geo=nodes.new('ShaderNodeNewGeometry')
    dot=nodes.new('ShaderNodeVectorMath')
    dot.operation='DOT_PRODUCT'
    # Ánh sáng trên trái có phần bù phía trước để mặt và bước chân luôn đọc rõ.
    dot.inputs[1].default_value=(-.1313,-.6565,.7428)
    links.new(geo.outputs['Normal'],dot.inputs[0])
    ramp=nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation='CONSTANT'
    levels=[(0,.48),(.25,.75),(.60,1.05),(.87,1.30)]
    ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
    for i,(position,value) in enumerate(levels):
        e=ramp.color_ramp.elements[0] if i==0 else ramp.color_ramp.elements.new(position)
        e.position=position
        e.color=(value,value,value,1)
    links.new(dot.outputs['Value'],ramp.inputs['Fac'])
    color=nodes.new('ShaderNodeMixRGB')
    color.blend_type='MULTIPLY'
    color.inputs[0].default_value=1
    color.inputs[1].default_value=(*(linear(c) for c in rgb),1)
    links.new(ramp.outputs['Color'],color.inputs[2])
    shader=nodes.new('ShaderNodeEmission')
    links.new(color.outputs[0],shader.inputs['Color'])
    output=nodes.new('ShaderNodeOutputMaterial')
    links.new(shader.outputs[0],output.inputs['Surface'])

def renderer(scene):
    scene.render.engine='CYCLES'
    scene.cycles.samples=8
    scene.cycles.use_denoising=False
    scene.cycles.max_bounces=0
    scene.render.threads_mode='FIXED'
    scene.render.threads=4
    scene.view_settings.view_transform='Standard'
    scene.view_settings.look='None'
