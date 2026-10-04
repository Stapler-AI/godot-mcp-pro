import { z } from 'zod';

export interface ImageBlock {
  type: 'image';
  data: string;
  mimeType: string;
}

/** One addon method exposed as an MCP tool. `name` is the JSON-RPC method verbatim. */
export interface ToolDef {
  name: string;
  description: string;
  /** Zod raw shape; wrapped with z.object() at registration. */
  input: z.ZodRawShape;
  /** Server-side reply timeout. Editor-side defaults are ~5 s; long tools override. */
  timeoutMs?: number | ((args: Record<string, any>) => number);
  /** Pull base64 images out of the result so Claude can see them. */
  images?: (result: any) => ImageBlock[];
  /** Fields to drop from the text part of the result (e.g. the base64 already emitted as image). */
  stripFields?: string[];
  readOnly?: boolean;
  destructive?: boolean;
  /** Tool set tags used by GODOT_MCP_TOOLSET filtering. */
  group: string;
}

export function tool(def: ToolDef): ToolDef {
  return def;
}

// ---- shared schema fragments -------------------------------------------

export const EDITOR_PATH_NOTE =
  'node_path is relative to the edited scene root ("." = root, "Player/Sprite" = child).';
export const RUNTIME_PATH_NOTE =
  'node_path must be absolute in the running game, e.g. "/root/Main/Player" (use get_game_scene_tree to find paths). Requires play_scene first.';
export const VALUE_NOTE =
  'Values may be JSON primitives, objects like {"x":1,"y":2} or {"r":1,"g":0,"b":0,"a":1}, or Godot-style strings: "Vector2(1, 2)", "Vector3(0,1,0)", "Color(1,0,0,1)", "#ff0000", "Rect2(0,0,10,10)", "res://path.tres".';

export const nodePath = (desc = 'Node path relative to the scene root.') => z.string().describe(desc);
export const gamePath = (desc = 'Absolute node path in the running game, e.g. /root/Main/Player.') =>
  z.string().describe(desc);
export const resPath = (desc = 'Project path starting with res://.') => z.string().describe(desc);
export const anyValue = (desc = 'Value. ' + VALUE_NOTE) => z.any().describe(desc);
export const vec = (desc: string) =>
  z.union([z.object({ x: z.number(), y: z.number(), z: z.number().optional() }), z.string()]).describe(desc);
export const color = (desc = 'Color as "#rrggbb[aa]", "Color(r,g,b,a)", a named color, or {r,g,b,a}.') =>
  z.union([z.string(), z.object({ r: z.number(), g: z.number(), b: z.number(), a: z.number().optional() })]).describe(desc);

/** Standard base64 PNG extraction for `{image_base64}` results. */
export function pngField(field: string): (r: any) => ImageBlock[] {
  return (r) => (typeof r?.[field] === 'string' && r[field] ? [{ type: 'image', data: r[field], mimeType: 'image/png' }] : []);
}
