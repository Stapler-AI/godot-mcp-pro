import { z } from 'zod';
import { tool, nodePath } from './types.js';

const g = 'tilemap';
const tm = nodePath('Path to a TileMapLayer (or legacy TileMap) node.');
const cell = { source_id: z.number().int().optional(), atlas_x: z.number().int().optional(), atlas_y: z.number().int().optional(), alternative: z.number().int().optional(), layer: z.number().int().describe('Legacy TileMap layer index only.').optional() };

export const tilemapTools = [
  tool({ group: g, name: 'tilemap_set_cell',
    description: 'Set one cell to a tile from the TileSet atlas.',
    input: { node_path: tm, x: z.number().int(), y: z.number().int(), ...cell } }),
  tool({ group: g, name: 'tilemap_fill_rect',
    description: 'Fill a rectangle of cells (inclusive corners) with one tile.',
    input: { node_path: tm, x1: z.number().int(), y1: z.number().int(), x2: z.number().int(), y2: z.number().int(), ...cell } }),
  tool({ group: g, name: 'tilemap_get_cell', readOnly: true,
    description: 'Read the tile at a cell.',
    input: { node_path: tm, x: z.number().int(), y: z.number().int(), layer: z.number().int().optional() } }),
  tool({ group: g, name: 'tilemap_clear', destructive: true,
    description: 'Clear all cells.',
    input: { node_path: tm, layer: z.number().int().optional() } }),
  tool({ group: g, name: 'tilemap_get_info', readOnly: true,
    description: 'TileSet sources, tile size and layer info.',
    input: { node_path: tm } }),
  tool({ group: g, name: 'tilemap_get_used_cells', readOnly: true,
    description: 'List used cells (capped by max_count, default 500).',
    input: { node_path: tm, layer: z.number().int().optional(), max_count: z.number().int().optional() } }),
];
