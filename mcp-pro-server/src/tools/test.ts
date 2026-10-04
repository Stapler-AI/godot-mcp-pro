import { z } from 'zod';
import { tool, gamePath, anyValue } from './types.js';

const g = 'test';

const step = z.object({
  type: z.enum(['input', 'wait', 'assert', 'screenshot']),
  action: z.string().optional(), keycode: z.string().optional(), pressed: z.boolean().optional(),
  seconds: z.number().optional(), node_path: z.string().optional(), timeout: z.number().optional(),
  property: z.string().optional(), expected: z.any().optional(), operator: z.string().optional(),
  text: z.string().optional(), half_resolution: z.boolean().optional(),
});

function scenarioTimeout(a: Record<string, any>): number {
  const steps = Array.isArray(a.steps) ? a.steps : [];
  let s = 5;
  for (const st of steps) s += Number(st?.seconds ?? st?.timeout ?? 0.5) || 0.5;
  return Math.min(s * 1000 + 30_000, 600_000);
}

export const testTools = [
  tool({ group: g, name: 'run_test_scenario', timeoutMs: scenarioTimeout,
    description: 'Run a scripted playtest: optional scene_path ("main", "current" or res://) then steps: {type:"input", action|keycode} · {type:"wait", seconds | node_path+timeout} · {type:"assert", node_path, property, expected, operator} · {type:"screenshot"}. Returns pass/fail per step.',
    input: { steps: z.array(step), scene_path: z.string().optional() } }),
  tool({ group: g, name: 'assert_node_state', readOnly: true, timeoutMs: 15_000,
    description: 'Assert a runtime node property. operator: eq, neq, gt, lt, gte, lte, contains, type_is. Result is recorded for get_test_report.',
    input: { node_path: gamePath(), property: z.string(), expected: anyValue('Expected value.'), operator: z.enum(['eq','neq','gt','lt','gte','lte','contains','type_is']).optional() } }),
  tool({ group: g, name: 'assert_screen_text', readOnly: true, timeoutMs: 15_000,
    description: 'Assert that some visible UI element in the running game shows the given text.',
    input: { text: z.string(), partial: z.boolean().optional(), case_sensitive: z.boolean().optional() } }),
  tool({ group: g, name: 'run_stress_test', timeoutMs: (a) => (Math.min(a.duration ?? 5, 60) + 10) * 1000 + 10_000,
    description: 'Spam random input actions into the running game for duration seconds (max 60) and count errors in the log.',
    input: { duration: z.number().optional(), actions: z.array(z.string()).optional() } }),
  tool({ group: g, name: 'get_test_report', readOnly: true,
    description: 'Summary of assertions recorded this session (cleared afterwards unless clear=false).',
    input: { clear: z.boolean().optional() } }),
];
