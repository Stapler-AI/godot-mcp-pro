import { z } from 'zod';
import { tool, resPath, anyValue, VALUE_NOTE } from './types.js';

const g = 'batch';

export const batchTools = [
  tool({ group: g, name: 'find_nodes_by_type', readOnly: true,
    description: 'Find all nodes of a class (e.g. "Sprite2D") in the edited scene.',
    input: { type: z.string(), recursive: z.boolean().optional() } }),
  tool({ group: g, name: 'find_signal_connections', readOnly: true,
    description: 'List signal connections in the edited scene, optionally filtered by signal name or node.',
    input: { signal_name: z.string().optional(), node_path: z.string().optional() } }),
  tool({ group: g, name: 'batch_set_property',
    description: `Set one property on every node of a type in the edited scene. ${VALUE_NOTE}`,
    input: { type: z.string(), property: z.string(), value: anyValue() } }),
  tool({ group: g, name: 'batch_add_nodes',
    description: 'Add many nodes at once: nodes: [{type, parent_path?, name?, properties?}].',
    input: { nodes: z.array(z.object({ type: z.string(), parent_path: z.string().optional(), name: z.string().optional(), properties: z.record(z.string(), z.any()).optional() })) } }),
  tool({ group: g, name: 'find_node_references', readOnly: true, timeoutMs: 60_000,
    description: 'Search .tscn and .gd files for a text pattern (node name, path, identifier). Max 100 matches.',
    input: { pattern: z.string() } }),
  tool({ group: g, name: 'get_scene_dependencies', readOnly: true,
    description: 'Resources and scenes a scene file depends on.',
    input: { path: resPath() } }),
  tool({ group: g, name: 'cross_scene_set_property', timeoutMs: 120_000,
    description: 'Set a property on every node of a type across many scene files on disk. Dry-run by default; pass force=true to write (open scenes are skipped).',
    input: { type: z.string(), property: z.string(), value: anyValue(), path_filter: z.string().optional(), exclude_addons: z.boolean().optional(), force: z.boolean().optional(), dry_run: z.boolean().optional() } }),
];
