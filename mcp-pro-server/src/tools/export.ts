import { z } from 'zod';
import { tool } from './types.js';

const g = 'export';

export const exportTools = [
  tool({ group: g, name: 'list_export_presets', readOnly: true,
    description: 'Export presets defined in export_presets.cfg.',
    input: {} }),
  tool({ group: g, name: 'export_project', readOnly: true,
    description: 'Build the command line for exporting with a preset. Does NOT run the export; returns a `godot --export-*` command you can run yourself.',
    input: { preset_index: z.number().int().optional(), preset_name: z.string().optional(), debug: z.boolean().optional() } }),
  tool({ group: g, name: 'get_export_info', readOnly: true,
    description: 'Export configuration summary (presets, platforms, templates).',
    input: {} }),
];
