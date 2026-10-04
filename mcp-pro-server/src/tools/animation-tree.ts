import { z } from 'zod';
import { tool, nodePath, anyValue } from './types.js';

const g = 'animation_tree';
const tree = nodePath('Path to the AnimationTree node.');
const smPath = z.string().describe('Nested state machine path, e.g. "Locomotion"; omit for the root.').optional();

export const animationTreeTools = [
  tool({ group: g, name: 'create_animation_tree',
    description: 'Add an AnimationTree (with a root state machine) under a node, linked to an AnimationPlayer.',
    input: { node_path: nodePath('Parent node.'), anim_player: z.string().describe('AnimationPlayer path relative to the tree; auto-detected if omitted.').optional(), name: z.string().optional() } }),
  tool({ group: g, name: 'get_animation_tree_structure', readOnly: true,
    description: 'States, transitions and blend nodes of an AnimationTree.',
    input: { node_path: tree } }),
  tool({ group: g, name: 'add_state_machine_state',
    description: 'Add a state to a state machine. state_type: animation (default), blend_tree or state_machine.',
    input: { node_path: tree, state_name: z.string(), state_machine_path: smPath, state_type: z.enum(['animation','blend_tree','state_machine']).optional(), animation: z.string().optional(), position_x: z.number().optional(), position_y: z.number().optional() } }),
  tool({ group: g, name: 'remove_state_machine_state', destructive: true,
    description: 'Remove a state from a state machine.',
    input: { node_path: tree, state_name: z.string(), state_machine_path: smPath } }),
  tool({ group: g, name: 'add_state_machine_transition',
    description: 'Add a transition between two states.',
    input: { node_path: tree, from_state: z.string(), to_state: z.string(), state_machine_path: smPath, switch_mode: z.enum(['immediate','sync','at_end']).optional(), advance_mode: z.enum(['disabled','enabled','auto']).optional(), advance_expression: z.string().optional(), xfade_time: z.number().optional() } }),
  tool({ group: g, name: 'remove_state_machine_transition', destructive: true,
    description: 'Remove a transition between two states.',
    input: { node_path: tree, from_state: z.string(), to_state: z.string(), state_machine_path: smPath } }),
  tool({ group: g, name: 'set_blend_tree_node',
    description: 'Add or configure a node inside a BlendTree state and optionally connect it to another node/port.',
    input: { node_path: tree, blend_tree_state: z.string(), bt_node_name: z.string(), bt_node_type: z.enum(['Animation','Add2','Blend2','Add3','Blend3','TimeScale','TimeSeek','Transition','OneShot','Sub2']), state_machine_path: smPath, animation: z.string().optional(), position_x: z.number().optional(), position_y: z.number().optional(), connect_to: z.string().optional(), connect_port: z.number().int().optional() } }),
  tool({ group: g, name: 'set_tree_parameter',
    description: 'Set an AnimationTree parameter (e.g. "parameters/Blend/blend_amount").',
    input: { node_path: tree, parameter: z.string(), value: anyValue() } }),
];
