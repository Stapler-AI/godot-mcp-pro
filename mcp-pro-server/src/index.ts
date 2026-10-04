#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { GodotBridge } from './bridge.js';
import { findProjectDir, readProjectInfo, readAuthToken, userDataDir } from './godot-paths.js';
import { log } from './log.js';
import { registerMetaTools, registerTools, selectTools } from './tools/registry.js';

const VERSION = '0.1.0';

async function main(): Promise<void> {
  const projectDir = findProjectDir();
  const info = projectDir ? readProjectInfo(projectDir) : null;
  if (info) log(`project "${info.name}" at ${info.dir} (user:// -> ${userDataDir(info)})`);
  else log('no project.godot found; set GODOT_PROJECT_PATH if the editor requires a connection token');

  const envPort = Number(process.env.GODOT_MCP_PORT);
  const ports = Number.isInteger(envPort) && envPort > 0 ? [envPort] : [6505, 6506, 6507, 6508, 6509];

  const bridge = new GodotBridge({
    ports,
    tokenProvider: () => (info ? readAuthToken(info) : null),
  });
  await bridge.listen();

  const tools = selectTools(process.env.GODOT_MCP_TOOLSET ?? 'full');

  serveStdio(
    () => {
      const server = new McpServer(
        { name: 'godot', version: VERSION },
        { capabilities: { tools: {} } },
      );
      registerTools(server, bridge, tools);
      registerMetaTools(server, bridge, tools);
      return server;
    },
    { onerror: (e) => log('mcp error:', e.message) },
  );

  const shutdown = async () => {
    await bridge.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.stdin.on('close', shutdown);
}

main().catch((e) => {
  log('fatal:', e?.stack ?? e);
  process.exit(1);
});
