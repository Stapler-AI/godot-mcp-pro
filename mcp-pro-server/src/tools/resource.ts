import { z } from 'zod';
import { tool, resPath, pngField } from './types.js';

const g = 'resource';

export const resourceTools = [
  tool({ group: g, name: 'read_resource', readOnly: true,
    description: 'Load a .tres/.res resource and list its type and properties.',
    input: { path: resPath(), force: z.boolean().optional() } }),
  tool({ group: g, name: 'edit_resource',
    description: 'Set properties on an existing resource file and save it.',
    input: { path: resPath(), properties: z.record(z.string(), z.any()) } }),
  tool({ group: g, name: 'create_resource',
    description: 'Create and save a new resource of a type (e.g. "StandardMaterial3D", "Curve", "Gradient").',
    input: { path: resPath('Destination .tres path.'), type: z.string(), overwrite: z.boolean().optional(), properties: z.record(z.string(), z.any()).optional() } }),
  tool({ group: g, name: 'get_resource_preview', readOnly: true, images: pngField('image_base64'), timeoutMs: 30_000,
    description: 'Thumbnail image of a texture, scene, mesh or material resource (returned as an image).',
    input: { path: resPath(), max_size: z.number().int().optional() } }),
];
