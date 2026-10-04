import { z } from 'zod';
import { tool, resPath } from './types.js';

const g = 'headless';
const headlessTimeout = (a: Record<string, any>) => Math.min(Math.max(Number(a.timeout_sec) || 120, 1), 900) * 1000 + 15_000;
const common = { timeout_sec: z.number().describe('1-900, default 120.').optional(), quit_after_frames: z.number().int().optional(), args: z.array(z.string()).optional() };

export const headlessTools = [
  tool({ group: g, name: 'run_headless_scene', timeoutMs: headlessTimeout,
    description: 'Run a scene in a separate headless Godot process and return its output and exit code (for automated tests / CI-style checks).',
    input: { scene_path: resPath('Scene to run.'), ...common } }),
  tool({ group: g, name: 'run_headless_script', timeoutMs: headlessTimeout,
    description: 'Run a script (extends SceneTree or MainLoop) in a separate headless Godot process and return output and exit code.',
    input: { script_path: resPath('Script to run.'), ...common } }),
  tool({ group: g, name: 'get_godot_executable', readOnly: true,
    description: 'Path of the running Godot binary, project path and platform.',
    input: {} }),
];
