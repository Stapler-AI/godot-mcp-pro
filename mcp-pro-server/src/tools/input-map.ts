import { z } from 'zod';
import { tool } from './types.js';

const g = 'input_map';

const eventSchema = z.object({
  type: z.enum(['key', 'mouse_button', 'joypad_button', 'joypad_motion']),
  keycode: z.string().optional(),
  physical_keycode: z.string().optional(),
  ctrl: z.boolean().optional(), shift: z.boolean().optional(), alt: z.boolean().optional(), meta: z.boolean().optional(),
  button_index: z.number().int().optional(),
  axis: z.number().int().optional(),
  axis_value: z.number().optional(),
});

export const inputMapTools = [
  tool({ group: g, name: 'get_input_actions', readOnly: true,
    description: 'InputMap actions and their bound events (builtin ui_* actions hidden unless include_builtin).',
    input: { filter: z.string().optional(), include_builtin: z.boolean().optional() } }),
  tool({ group: g, name: 'set_input_action',
    description: 'Create or replace an InputMap action with the given events, e.g. [{type:"key", keycode:"W"}, {type:"joypad_button", button_index:0}].',
    input: { action: z.string(), events: z.array(eventSchema), deadzone: z.number().optional() } }),
];
