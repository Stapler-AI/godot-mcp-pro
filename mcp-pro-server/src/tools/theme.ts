import { z } from 'zod';
import { tool, nodePath, resPath, color } from './types.js';

const g = 'theme';
const ctl = nodePath('Path to a Control node.');

export const themeTools = [
  tool({ group: g, name: 'create_theme',
    description: 'Create a Theme resource (.tres).',
    input: { path: resPath('Destination .tres path.'), default_font_size: z.number().int().optional() } }),
  tool({ group: g, name: 'set_theme_color',
    description: 'Set a theme color override on a Control (e.g. name "font_color").',
    input: { node_path: ctl, name: z.string(), color: color(), theme_type: z.string().optional() } }),
  tool({ group: g, name: 'set_theme_constant',
    description: 'Set a theme constant override (e.g. "separation", "margin_left").',
    input: { node_path: ctl, name: z.string(), value: z.number().int() } }),
  tool({ group: g, name: 'set_theme_font_size',
    description: 'Set a theme font-size override (name usually "font_size").',
    input: { node_path: ctl, name: z.string(), size: z.number().int() } }),
  tool({ group: g, name: 'set_theme_stylebox',
    description: 'Create a StyleBoxFlat override (name like "panel", "normal", "hover") with background, border, corner radius and padding.',
    input: { node_path: ctl, name: z.string(), bg_color: color().optional(), border_color: color().optional(), border_width: z.number().int().optional(), corner_radius: z.number().int().optional(), padding: z.number().int().optional() } }),
  tool({ group: g, name: 'setup_control',
    description: 'Configure layout of a Control in one call: anchor preset, minimum size ("100, 40"), size flags, margins, separation, grow direction.',
    input: { node_path: ctl, anchor_preset: z.string().optional(), min_size: z.string().optional(), size_flags_h: z.enum(['fill','expand','fill_expand','shrink_center','shrink_end']).optional(), size_flags_v: z.enum(['fill','expand','fill_expand','shrink_center','shrink_end']).optional(), margins: z.object({ left: z.number().optional(), top: z.number().optional(), right: z.number().optional(), bottom: z.number().optional() }).optional(), separation: z.number().int().optional(), grow_h: z.enum(['begin','end','both']).optional(), grow_v: z.enum(['begin','end','both']).optional() } }),
  tool({ group: g, name: 'get_theme_info', readOnly: true,
    description: 'Theme overrides currently set on a Control.',
    input: { node_path: ctl } }),
];
