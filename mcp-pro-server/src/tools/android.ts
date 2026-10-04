import { z } from 'zod';
import { tool } from './types.js';

const g = 'android';

export const androidTools = [
  tool({ group: g, name: 'list_android_devices', readOnly: true, timeoutMs: 60_000,
    description: 'Devices visible to adb.',
    input: {} }),
  tool({ group: g, name: 'get_android_preset_info', readOnly: true,
    description: 'Details of an Android export preset.',
    input: { preset_name: z.string().optional(), preset_index: z.number().int().optional() } }),
  tool({ group: g, name: 'deploy_to_android', timeoutMs: 600_000,
    description: 'Export an APK with a preset and install/launch it on a device via adb. Blocks the editor for minutes.',
    input: { preset_name: z.string().optional(), preset_index: z.number().int().optional(), device_serial: z.string().optional(), debug: z.boolean().optional(), launch: z.boolean().optional(), skip_export: z.boolean().optional() } }),
];
