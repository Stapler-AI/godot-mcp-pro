import { z } from 'zod';
import { tool, nodePath } from './types.js';

const g = 'navigation';
const mode = z.enum(['auto','2d','3d']).optional();

export const navigationTools = [
  tool({ group: g, name: 'setup_navigation_region',
    description: 'Add a NavigationRegion2D/3D with a new navigation mesh/polygon and agent parameters.',
    input: { node_path: nodePath('Parent node.'), mode, name: z.string().optional(), agent_radius: z.number().optional(), agent_height: z.number().optional(), agent_max_climb: z.number().optional(), agent_max_slope: z.number().optional(), cell_size: z.number().optional(), cell_height: z.number().optional(), navigation_layers: z.number().int().optional(), source_geometry_mode: z.string().optional() } }),
  tool({ group: g, name: 'bake_navigation_mesh', timeoutMs: 120_000,
    description: 'Bake the navigation mesh of a region (3D from geometry; 2D from the given outline [[x,y],...]).',
    input: { node_path: nodePath('NavigationRegion node.'), outline: z.array(z.any()).optional() } }),
  tool({ group: g, name: 'setup_navigation_agent',
    description: 'Add a NavigationAgent2D/3D to a character with pathfinding and avoidance settings.',
    input: { node_path: nodePath('Character node.'), mode, name: z.string().optional(), path_desired_distance: z.number().optional(), target_desired_distance: z.number().optional(), radius: z.number().optional(), neighbor_distance: z.number().optional(), max_neighbors: z.number().int().optional(), max_speed: z.number().optional(), avoidance_enabled: z.boolean().optional(), navigation_layers: z.number().int().optional() } }),
  tool({ group: g, name: 'set_navigation_layers',
    description: 'Set navigation layers via bitmask (layers), list of bit numbers (layer_bits) or names (layer_names).',
    input: { node_path: nodePath(), layers: z.number().int().optional(), layer_bits: z.array(z.number().int()).optional(), layer_names: z.array(z.string()).optional() } }),
  tool({ group: g, name: 'get_navigation_info', readOnly: true,
    description: 'Navigation regions and agents under a node.',
    input: { node_path: nodePath() } }),
];
