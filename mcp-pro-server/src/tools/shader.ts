import { z } from 'zod';
import { tool, resPath, nodePath, anyValue } from './types.js';

const g = 'shader';

export const shaderTools = [
  tool({ group: g, name: 'create_shader',
    description: 'Create a .gdshader file. shader_type: spatial (default), canvas_item, particles, sky, fog. Template generated if content empty.',
    input: { path: resPath('Destination .gdshader path.'), content: z.string().optional(), shader_type: z.string().optional(), force: z.boolean().optional() } }),
  tool({ group: g, name: 'read_shader', readOnly: true,
    description: 'Read a shader file.',
    input: { path: resPath() } }),
  tool({ group: g, name: 'edit_shader',
    description: 'Edit a shader: full content, or replacements [{search, replace, regex?}].',
    input: { path: resPath(), content: z.string().optional(), replacements: z.array(z.object({ search: z.string(), replace: z.string(), regex: z.boolean().optional() })).optional(), force: z.boolean().optional() } }),
  tool({ group: g, name: 'assign_shader_material',
    description: 'Create a ShaderMaterial from a shader file and assign it to a node (material / material_override).',
    input: { node_path: nodePath(), shader_path: resPath('Shader path.') } }),
  tool({ group: g, name: 'set_shader_param',
    description: 'Set a shader uniform on the node\'s ShaderMaterial.',
    input: { node_path: nodePath(), param: z.string(), value: anyValue() } }),
  tool({ group: g, name: 'get_shader_params', readOnly: true,
    description: 'List uniforms and current values of the node\'s ShaderMaterial.',
    input: { node_path: nodePath() } }),
];
