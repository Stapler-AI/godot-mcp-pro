import { z } from 'zod';
import { tool, resPath, anyValue } from './types.js';

const g = 'project';

export const projectTools = [
  tool({ group: g, name: 'get_project_info', readOnly: true,
    description: 'Get project name, Godot version, main scene, viewport size, renderer and autoloads. Call this first.',
    input: {} }),
  tool({ group: g, name: 'get_filesystem_tree', readOnly: true,
    description: 'Directory tree of the project. Use filter (glob like "*.tscn" or "*.gd") and max_depth to keep output small.',
    input: { path: resPath('Start directory, default res://.').optional(), filter: z.string().optional(), max_depth: z.number().int().optional() } }),
  tool({ group: g, name: 'search_files', readOnly: true,
    description: 'Find files by name substring.',
    input: { query: z.string(), path: resPath().optional(), file_type: z.string().describe('Extension filter like "gd" or "tscn".').optional(), max_results: z.number().int().optional() } }),
  tool({ group: g, name: 'search_in_files', readOnly: true, timeoutMs: 60_000,
    description: 'Search file contents (text or regex) across the project. include_addons defaults to false.',
    input: { query: z.string(), path: resPath().optional(), max_results: z.number().int().optional(), regex: z.boolean().optional(), file_type: z.string().optional(), include_addons: z.boolean().optional() } }),
  tool({ group: g, name: 'get_project_settings', readOnly: true,
    description: 'Read project settings. Give key (e.g. "display/window/size/viewport_width") for one value, or section for a group.',
    input: { section: z.string().optional(), key: z.string().optional() } }),
  tool({ group: g, name: 'set_project_setting',
    description: 'Set and save a project setting. Optional type hint: "int", "float", "bool", "string", "vector2", "color".',
    input: { key: z.string(), value: anyValue(), type: z.string().optional() } }),
  tool({ group: g, name: 'uid_to_project_path', readOnly: true,
    description: 'Resolve a uid:// identifier to its res:// path.',
    input: { uid: z.string() } }),
  tool({ group: g, name: 'project_path_to_uid', readOnly: true,
    description: 'Get the uid:// identifier for a res:// path.',
    input: { path: resPath() } }),
  tool({ group: g, name: 'add_autoload',
    description: 'Register a script or scene as an autoload singleton (fails if the name exists).',
    input: { name: z.string(), path: resPath('Script or scene path.') } }),
  tool({ group: g, name: 'remove_autoload', destructive: true,
    description: 'Remove an autoload singleton by name.',
    input: { name: z.string() } }),
];
