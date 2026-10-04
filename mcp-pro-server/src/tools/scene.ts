import { z } from 'zod';
import { tool, resPath, nodePath } from './types.js';

const g = 'scene';

export const sceneTools = [
  tool({ group: g, name: 'get_scene_tree', readOnly: true,
    description: 'Node hierarchy of the currently open (edited) scene with types and paths relative to the root.',
    input: { max_depth: z.number().int().describe('-1 for unlimited.').optional() } }),
  tool({ group: g, name: 'get_scene_file_content', readOnly: true,
    description: 'Raw .tscn text of a scene file (can be large).',
    input: { path: resPath() } }),
  tool({ group: g, name: 'create_scene',
    description: 'Create a new .tscn with the given root node type and open it in the editor. Refuses to overwrite unless force.',
    input: { path: resPath('Destination .tscn path.'), root_type: z.string().describe('e.g. Node2D, Node3D, Control, CharacterBody2D.').optional(), root_name: z.string().optional(), force: z.boolean().optional() } }),
  tool({ group: g, name: 'open_scene',
    description: 'Open a scene in the editor and make it the edited scene.',
    input: { path: resPath() } }),
  tool({ group: g, name: 'delete_scene', destructive: true,
    description: 'Delete a .tscn/.scn file from disk (refused while it is open in the editor).',
    input: { path: resPath() } }),
  tool({ group: g, name: 'add_scene_instance',
    description: 'Instance a packed scene as a child of a node in the edited scene.',
    input: { scene_path: resPath('Scene to instance.'), parent_path: nodePath('Parent, default "." (root).').optional(), name: z.string().optional() } }),
  tool({ group: g, name: 'play_scene',
    description: 'Run the game from the editor. mode: "main" (project main scene), "current" (edited scene) or a res:// scene path. Returns immediately; wait ~1 s before runtime tools.',
    input: { mode: z.string().optional() } }),
  tool({ group: g, name: 'stop_scene',
    description: 'Stop the running game.',
    input: {} }),
  tool({ group: g, name: 'save_scene',
    description: 'Save the edited scene. Give path to save-as.',
    input: { path: resPath().optional() } }),
  tool({ group: g, name: 'get_scene_exports', readOnly: true,
    description: 'List @export variables and their values per node in a scene file.',
    input: { path: resPath() } }),
];
