import { z } from 'zod';
import { tool, nodePath, anyValue } from './types.js';

const g = 'animation';
const player = nodePath('Path to the AnimationPlayer node.');

export const animationTools = [
  tool({ group: g, name: 'list_animations', readOnly: true,
    description: 'List animations on an AnimationPlayer.',
    input: { node_path: player } }),
  tool({ group: g, name: 'create_animation',
    description: 'Create an animation on an AnimationPlayer. loop_mode: 0 none, 1 linear, 2 ping-pong.',
    input: { node_path: player, name: z.string(), length: z.number().optional(), loop_mode: z.number().int().optional() } }),
  tool({ group: g, name: 'add_animation_track',
    description: 'Add a track. track_path like "Sprite2D:position" (node:property).',
    input: { node_path: player, animation: z.string(), track_path: z.string(), track_type: z.enum(['value','position_2d','rotation_2d','scale_2d','method','bezier','blend_shape']).optional(), update_mode: z.enum(['continuous','discrete','capture']).optional() } }),
  tool({ group: g, name: 'set_animation_keyframe',
    description: 'Insert a keyframe on a track at time (seconds). Value formats as for update_property.',
    input: { node_path: player, animation: z.string(), track_index: z.number().int().optional(), time: z.number().optional(), value: anyValue(), easing: z.number().optional() } }),
  tool({ group: g, name: 'get_animation_info', readOnly: true,
    description: 'Tracks and keys of an animation.',
    input: { node_path: player, animation: z.string() } }),
  tool({ group: g, name: 'remove_animation', destructive: true,
    description: 'Delete an animation from an AnimationPlayer.',
    input: { node_path: player, name: z.string() } }),
];
