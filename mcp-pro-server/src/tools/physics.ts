import { z } from 'zod';
import { tool, nodePath } from './types.js';

const g = 'physics';

export const physicsTools = [
  tool({ group: g, name: 'setup_collision',
    description: 'Add a CollisionShape to a physics body or area. shape 2D: rectangle, circle, capsule, segment (ax,ay,bx,by), custom (points). 3D: box, sphere, capsule, cylinder, convex (points). dimension auto-detected from the node.',
    input: { node_path: nodePath('Body/Area node.'), shape: z.string(), dimension: z.enum(['2d','3d']).optional(), width: z.number().optional(), height: z.number().optional(), depth: z.number().optional(), radius: z.number().optional(), ax: z.number().optional(), ay: z.number().optional(), bx: z.number().optional(), by: z.number().optional(), points: z.array(z.any()).optional(), disabled: z.boolean().optional(), one_way_collision: z.boolean().optional() } }),
  tool({ group: g, name: 'set_physics_layers',
    description: 'Set collision_layer and collision_mask as bitmask ints or lists of layer numbers.',
    input: { node_path: nodePath(), collision_layer: z.any().optional(), collision_mask: z.any().optional() } }),
  tool({ group: g, name: 'get_physics_layers', readOnly: true,
    description: 'Collision layer/mask of a node with the project layer names.',
    input: { node_path: nodePath() } }),
  tool({ group: g, name: 'add_raycast',
    description: 'Add a RayCast2D/3D child pointing at target_x/y(/z).',
    input: { node_path: nodePath('Parent node.'), dimension: z.enum(['2d','3d']).optional(), name: z.string().optional(), enabled: z.boolean().optional(), collision_mask: z.number().int().optional(), collide_with_areas: z.boolean().optional(), collide_with_bodies: z.boolean().optional(), hit_from_inside: z.boolean().optional(), target_x: z.number().optional(), target_y: z.number().optional(), target_z: z.number().optional() } }),
  tool({ group: g, name: 'setup_physics_body',
    description: 'Configure a CharacterBody (floor_stop_on_slope, floor_max_angle, floor_snap_length, wall_min_slide_angle, motion_mode, max_slides, slide_on_ceiling) or RigidBody (mass, gravity_scale, linear_damp, angular_damp, freeze, freeze_mode, continuous_cd, contact_monitor, max_contacts_reported).',
    input: { node_path: nodePath(), floor_stop_on_slope: z.boolean().optional(), floor_max_angle: z.number().optional(), floor_snap_length: z.number().optional(), wall_min_slide_angle: z.number().optional(), motion_mode: z.string().optional(), max_slides: z.number().int().optional(), slide_on_ceiling: z.boolean().optional(), mass: z.number().optional(), gravity_scale: z.number().optional(), linear_damp: z.number().optional(), angular_damp: z.number().optional(), freeze: z.boolean().optional(), freeze_mode: z.string().optional(), continuous_cd: z.string().optional(), contact_monitor: z.boolean().optional(), max_contacts_reported: z.number().int().optional() } }),
  tool({ group: g, name: 'get_collision_info', readOnly: true,
    description: 'Collision shapes, layers and masks of a node (and children).',
    input: { node_path: nodePath(), include_children: z.boolean().optional() } }),
];
