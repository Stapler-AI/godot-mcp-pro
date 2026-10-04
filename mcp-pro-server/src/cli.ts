#!/usr/bin/env node
// Debug CLI: godot-mcp-cli <method> ['{"json":"params"}'] [--timeout ms] [--wait ms]
// Listens on the CLI port range (6510-6514), waits for the editor, sends one request.
import { GodotBridge } from './bridge.js';
import { findProjectDir, readProjectInfo, readAuthToken } from './godot-paths.js';

function arg(name: string, def: number): number {
  const i = process.argv.indexOf(name);
  return i > 0 ? Number(process.argv[i + 1]) : def;
}

async function main(): Promise<void> {
  const positional = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !all[i - 1]?.startsWith('--'));
  const method = positional[0];
  if (!method) {
    process.stderr.write('usage: godot-mcp-cli <method> [json-params] [--timeout ms] [--wait ms]\n');
    process.exit(2);
  }
  const params = positional[1] ? JSON.parse(positional[1]) : {};
  const timeout = arg('--timeout', 30_000);
  const wait = arg('--wait', 10_000);

  const projectDir = findProjectDir();
  const info = projectDir ? readProjectInfo(projectDir) : null;
  const bridge = new GodotBridge({
    ports: [6510, 6511, 6512, 6513, 6514],
    tokenProvider: () => (info ? readAuthToken(info) : null),
  });
  await bridge.listen();
  if (!(await bridge.waitForConnection(wait))) {
    process.stderr.write(`No Godot editor connected within ${wait} ms. Is the project open with the MCP addon enabled?\n`);
    await bridge.close();
    process.exit(1);
  }
  try {
    const result = await bridge.call(method, params, timeout);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (e: any) {
    process.stderr.write(`error${e.code !== undefined ? ` ${e.code}` : ''}: ${e.message}\n`);
    if (e.data) process.stderr.write(JSON.stringify(e.data, null, 2) + '\n');
    process.exitCode = 1;
  } finally {
    await bridge.close();
  }
}

main();
