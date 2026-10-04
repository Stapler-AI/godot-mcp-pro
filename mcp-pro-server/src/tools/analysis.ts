import { z } from 'zod';
import { tool, resPath } from './types.js';

const g = 'analysis';
const scan = { path: resPath('Root to scan, default res://.').optional(), include_addons: z.boolean().optional() };

export const analysisTools = [
  tool({ group: g, name: 'find_unused_resources', readOnly: true, timeoutMs: 120_000,
    description: 'Find resource files not referenced by any scene, script or resource.',
    input: scan }),
  tool({ group: g, name: 'analyze_signal_flow', readOnly: true,
    description: 'Map signal connections between nodes in the edited scene.',
    input: {} }),
  tool({ group: g, name: 'analyze_scene_complexity', readOnly: true, timeoutMs: 60_000,
    description: 'Node counts, depth, heavy subtrees and other complexity metrics for a scene (default: edited scene).',
    input: { path: resPath().optional() } }),
  tool({ group: g, name: 'find_script_references', readOnly: true, timeoutMs: 120_000,
    description: 'Find where a class, function or identifier is referenced across scripts and scenes.',
    input: { query: z.string(), ...scan } }),
  tool({ group: g, name: 'detect_circular_dependencies', readOnly: true, timeoutMs: 120_000,
    description: 'Detect preload/dependency cycles between scripts and scenes.',
    input: scan }),
  tool({ group: g, name: 'get_project_statistics', readOnly: true, timeoutMs: 120_000,
    description: 'File counts, line counts and size statistics for the project.',
    input: scan }),
];
