import { z } from 'zod';
import { tool } from './types.js';

const g = 'input';
const NOTE = 'Fire-and-forget: the event is queued for the running game and returns before it is processed. Requires play_scene.';

const eventSchema = z.object({
  type: z.enum(['key', 'mouse_button', 'mouse_motion', 'action']),
  keycode: z.string().optional(),
  pressed: z.boolean().optional(),
  shift: z.boolean().optional(), ctrl: z.boolean().optional(), alt: z.boolean().optional(),
  button: z.number().int().optional(),
  double_click: z.boolean().optional(),
  x: z.number().optional(), y: z.number().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  relative: z.object({ x: z.number(), y: z.number() }).optional(),
  relative_x: z.number().optional(), relative_y: z.number().optional(),
  button_mask: z.number().int().optional(),
  action: z.string().optional(),
  strength: z.number().optional(),
});

export const inputTools = [
  tool({ group: g, name: 'simulate_key',
    description: `Send a key event to the running game. keycode like "A", "Space", "Escape", "KEY_W". ${NOTE}`,
    input: { keycode: z.string(), pressed: z.boolean().optional(), shift: z.boolean().optional(), ctrl: z.boolean().optional(), alt: z.boolean().optional() } }),
  tool({ group: g, name: 'simulate_mouse_click',
    description: `Click at viewport coordinates in the running game. button: 1 left, 2 right, 3 middle. auto_release (default true) sends press+release. ${NOTE}`,
    input: { x: z.number(), y: z.number(), button: z.number().int().optional(), pressed: z.boolean().optional(), double_click: z.boolean().optional(), auto_release: z.boolean().optional() } }),
  tool({ group: g, name: 'simulate_mouse_move',
    description: `Move the mouse in the running game (absolute x/y plus optional relative delta and held button_mask). ${NOTE}`,
    input: { x: z.number().optional(), y: z.number().optional(), relative_x: z.number().optional(), relative_y: z.number().optional(), button_mask: z.number().int().optional(), unhandled: z.boolean().optional() } }),
  tool({ group: g, name: 'simulate_action',
    description: `Trigger an InputMap action (e.g. "ui_accept", "jump") in the running game. ${NOTE}`,
    input: { action: z.string(), pressed: z.boolean().optional(), strength: z.number().optional() } }),
  tool({ group: g, name: 'simulate_sequence',
    description: `Send several input events spaced frame_delay frames apart (0 = all in one frame). ${NOTE}`,
    input: { events: z.array(eventSchema), frame_delay: z.number().int().optional() } }),
];
