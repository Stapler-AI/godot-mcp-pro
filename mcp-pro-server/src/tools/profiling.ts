import { z } from 'zod';
import { tool } from './types.js';

const g = 'profiling';

export const profilingTools = [
  tool({ group: g, name: 'get_performance_monitors', readOnly: true, timeoutMs: 15_000,
    description: 'Performance monitors (fps, frame time, draw calls, memory, physics…) from the running game. category filters by prefix like "time" or "render". Requires play_scene.',
    input: { category: z.string().optional() } }),
  tool({ group: g, name: 'get_editor_performance', readOnly: true,
    description: 'Editor process performance: fps, frame time, draw calls, node and orphan counts, memory.',
    input: {} }),
];
