import { z } from 'zod';
import { tool, nodePath, resPath } from './types.js';

const g = 'audio';

export const audioTools = [
  tool({ group: g, name: 'get_audio_bus_layout', readOnly: true,
    description: 'All audio buses with volume, sends and effects.',
    input: {} }),
  tool({ group: g, name: 'add_audio_bus',
    description: 'Add an audio bus.',
    input: { name: z.string(), at_position: z.number().int().optional(), volume_db: z.number().optional(), send: z.string().optional(), solo: z.boolean().optional(), mute: z.boolean().optional() } }),
  tool({ group: g, name: 'set_audio_bus',
    description: 'Change an audio bus (volume, solo, mute, bypass, send target, rename).',
    input: { name: z.string(), volume_db: z.number().optional(), solo: z.boolean().optional(), mute: z.boolean().optional(), bypass_effects: z.boolean().optional(), send: z.string().optional(), rename: z.string().optional() } }),
  tool({ group: g, name: 'add_audio_bus_effect',
    description: 'Add an effect to a bus. effect_type: reverb, chorus, delay, compressor, limiter, phaser, distortion, lowpass, highpass, bandpass, amplify, eq. Effect settings go in params (e.g. {"room_size":0.8,"wet":0.5}).',
    input: { bus: z.string(), effect_type: z.string(), params: z.record(z.string(), z.any()).optional(), at_position: z.number().int().optional() } }),
  tool({ group: g, name: 'add_audio_player',
    description: 'Add an AudioStreamPlayer (type AudioStreamPlayer, AudioStreamPlayer2D or AudioStreamPlayer3D) with a stream file.',
    input: { node_path: nodePath('Parent node.'), name: z.string(), type: z.string().optional(), stream: resPath('Audio file.').optional(), volume_db: z.number().optional(), bus: z.string().optional(), autoplay: z.boolean().optional(), max_distance: z.number().optional(), attenuation: z.number().optional(), attenuation_model: z.number().int().optional(), unit_size: z.number().optional() } }),
  tool({ group: g, name: 'get_audio_info', readOnly: true,
    description: 'Audio players under a node with their streams and settings.',
    input: { node_path: nodePath() } }),
];
