// All diagnostics go to stderr: stdout is the MCP stdio transport.
export function log(...args: unknown[]): void {
  const ts = new Date().toISOString().slice(11, 19);
  process.stderr.write(`[godot-mcp ${ts}] ${args.map(String).join(' ')}\n`);
}
