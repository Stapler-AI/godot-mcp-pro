import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import { GodotBridge, GodotError } from '../bridge.js';
import { log } from '../log.js';
import type { ToolDef } from './types.js';

import { projectTools } from './project.js';
import { sceneTools } from './scene.js';
import { nodeTools } from './node.js';
import { scriptTools } from './script.js';
import { editorTools } from './editor.js';
import { inputTools } from './input.js';
import { runtimeTools } from './runtime.js';
import { animationTools } from './animation.js';
import { animationTreeTools } from './animation-tree.js';
import { tilemapTools } from './tilemap.js';
import { themeTools } from './theme.js';
import { profilingTools } from './profiling.js';
import { batchTools } from './batch.js';
import { shaderTools } from './shader.js';
import { exportTools } from './export.js';
import { resourceTools } from './resource.js';
import { inputMapTools } from './input-map.js';
import { scene3dTools } from './scene-3d.js';
import { physicsTools } from './physics.js';
import { analysisTools } from './analysis.js';
import { audioTools } from './audio.js';
import { navigationTools } from './navigation.js';
import { particleTools } from './particle.js';
import { testTools } from './test.js';
import { androidTools } from './android.js';
import { headlessTools } from './headless.js';

export const ALL_TOOLS: ToolDef[] = [
  ...projectTools, ...sceneTools, ...nodeTools, ...scriptTools, ...editorTools, ...inputTools,
  ...runtimeTools, ...animationTools, ...animationTreeTools, ...tilemapTools, ...themeTools,
  ...profilingTools, ...batchTools, ...shaderTools, ...exportTools, ...resourceTools,
  ...inputMapTools, ...scene3dTools, ...physicsTools, ...analysisTools, ...audioTools,
  ...navigationTools, ...particleTools, ...testTools, ...androidTools, ...headlessTools,
];

/** Named tool sets selectable with GODOT_MCP_TOOLSET. */
export const TOOLSETS: Record<string, string[] | null> = {
  full: null,
  lite: ['project', 'scene', 'node', 'script', 'editor', 'input', 'runtime', 'test'],
  minimal: ['project', 'scene', 'node', 'script', 'editor'],
  '3d': ['project', 'scene', 'node', 'script', 'editor', 'input', 'runtime', 'scene_3d', 'physics', 'navigation', 'animation', 'animation_tree'],
};

export function selectTools(setName: string): ToolDef[] {
  const groups = TOOLSETS[setName] ?? null;
  if (setName && !(setName in TOOLSETS)) log(`unknown GODOT_MCP_TOOLSET "${setName}", using full`);
  return groups ? ALL_TOOLS.filter((t) => groups.includes(t.group)) : ALL_TOOLS;
}

const CONNECT_WAIT_MS = 10_000;
const MAX_IMAGE_BLOCKS = 10;

/** Runtime replies can arrive as {result:{result:{...}}}; flatten them. */
function unwrap(result: any): any {
  let r = result;
  let guard = 0;
  while (r && typeof r === 'object' && !Array.isArray(r) && 'result' in r && Object.keys(r).length === 1 && guard++ < 4) {
    r = r.result;
  }
  return r;
}

function textOf(result: any, strip: string[]): string {
  if (result === undefined || result === null) return '{}';
  if (typeof result !== 'object' || Array.isArray(result)) return JSON.stringify(result, null, 2);
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(result)) {
    if (strip.includes(k)) {
      copy[k] = Array.isArray(v) ? `<${v.length} images attached>` : '<image attached>';
    } else {
      copy[k] = v;
    }
  }
  return JSON.stringify(copy, null, 2);
}

export function registerTools(server: McpServer, bridge: GodotBridge, tools: ToolDef[]): void {
  for (const def of tools) {
    server.registerTool(
      def.name,
      {
        description: def.description,
        inputSchema: z.object(def.input),
        annotations: {
          readOnlyHint: def.readOnly ?? false,
          destructiveHint: def.destructive ?? false,
          openWorldHint: false,
        },
      },
      async (args: Record<string, any>) => {
        if (!bridge.isConnected() && !(await bridge.waitForConnection(CONNECT_WAIT_MS))) {
          return {
            isError: true,
            content: [{ type: 'text' as const, text:
              `Godot editor is not connected on port ${bridge.port}. Open the project in Godot 4 with the ` +
              `"Godot MCP Pro" addon enabled (Project > Project Settings > Plugins); it reconnects every 3 s.` }],
          };
        }
        const timeout = typeof def.timeoutMs === 'function' ? def.timeoutMs(args) : def.timeoutMs ?? 30_000;
        try {
          const raw = await bridge.call(def.name, stripUndefined(args), timeout);
          const result = unwrap(raw);
          const images = (def.images?.(result) ?? []).slice(0, MAX_IMAGE_BLOCKS);
          const strip = def.stripFields ?? (def.images ? ['image_base64', 'diff_image_base64', 'frames'] : []);
          return {
            content: [{ type: 'text' as const, text: textOf(result, strip) }, ...images],
          };
        } catch (e) {
          return { isError: true, content: [{ type: 'text' as const, text: describeError(e) }] };
        }
      },
    );
  }
  log(`registered ${tools.length} tools`);
}

function stripUndefined(args: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(args ?? {})) if (v !== undefined) out[k] = v;
  return out;
}

function describeError(e: unknown): string {
  if (e instanceof GodotError) {
    const data = e.data ? `\n${JSON.stringify(e.data, null, 2)}` : '';
    return `Godot error ${e.code}: ${e.message}${data}`;
  }
  return `Error: ${(e as Error).message ?? String(e)}`;
}

/** Extra server-side tools that are not addon methods. */
export function registerMetaTools(server: McpServer, bridge: GodotBridge, exposed: ToolDef[]): void {
  server.registerTool(
    'godot_status',
    {
      description: 'Report whether the Godot editor is connected to this MCP server, which port is in use, and how many requests are queued.',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => ({
      content: [{ type: 'text' as const, text: JSON.stringify({
        connected: bridge.isConnected(),
        port: bridge.port,
        queued_requests: bridge.queueLength,
        exposed_tools: exposed.length,
      }, null, 2) }],
    }),
  );
  server.registerTool(
    'list_godot_methods',
    {
      description: 'List every command the connected Godot addon actually registers (useful if a tool is missing or disabled in the editor\'s MCP Pro panel).',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      if (!bridge.isConnected() && !(await bridge.waitForConnection(CONNECT_WAIT_MS))) {
        return { isError: true, content: [{ type: 'text' as const, text: 'Godot editor is not connected.' }] };
      }
      try {
        await bridge.call('__list_methods__', {}, 10_000);
        return { content: [{ type: 'text' as const, text: 'Unexpected: addon accepted a bogus method.' }] };
      } catch (e) {
        if (e instanceof GodotError && e.code === -32601) {
          const methods = ((e.data as any)?.available_methods ?? []) as string[];
          const exposedNames = new Set(exposed.map((t) => t.name));
          const notExposed = methods.filter((m) => !exposedNames.has(m)).sort();
          return { content: [{ type: 'text' as const, text: JSON.stringify({
            count: methods.length, methods: [...methods].sort(), not_exposed_by_this_server: notExposed,
          }, null, 2) }] };
        }
        return { isError: true, content: [{ type: 'text' as const, text: describeError(e) }] };
      }
    },
  );
}
