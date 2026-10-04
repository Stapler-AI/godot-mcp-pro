# mcp-pro-server

A local [MCP](https://modelcontextprotocol.io) server that lets Claude Code drive the Godot 4 editor
through the `godot/addons/mcp-pro-addon` addon ("Godot MCP Pro" editor plugin, MIT).

The addon is a WebSocket **client**: it polls `ws://127.0.0.1:6505-6514` every 3 s. This server
listens on the first free port in 6505-6509, answers the addon's JSON-RPC 2.0 protocol, and exposes
each of the addon's 177 commands as an MCP tool over stdio.

```
Claude Code ──stdio──▶ node build/index.js ◀──ws://127.0.0.1:6505── Godot editor (addon enabled)
```

## Setup

```bash
cd mcp-pro-server
npm install
npm run build
```

The repo's `.mcp.json` already registers it for Claude Code:

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["./mcp-pro-server/build/index.js"],
      "env": { "GODOT_PROJECT_PATH": "./godot" }
    }
  }
}
```

Open the project in Godot 4.4+ with **Project ▸ Project Settings ▸ Plugins ▸ Godot MCP Pro** enabled.
The "MCP Pro" bottom panel shows `Port 6505 — Connected` once a Claude Code session is running.
`claude mcp list` should report `godot … ✔ Connected`.

## Environment variables

| Variable             | Default                 | Purpose                                                                                         |
| -------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `GODOT_PROJECT_PATH` | walk up from cwd        | Folder containing `project.godot`. Needed to locate `user://` when the editor requires a token. |
| `GODOT_MCP_PORT`     | first free of 6505-6509 | Pin a single listen port.                                                                       |
| `GODOT_MCP_TOOLSET`  | `full`                  | `full` (177), `lite` (project/scene/node/script/editor/input/runtime/test), `minimal`, `3d`.    |

## Connection token (optional)

If the project setting `mcp-pro-addon/require_connection_token` is on (or the editor runs with
`GODOT_MCP_REQUIRE_TOKEN=1`), the addon writes a token to `user://mcp_auth_token` and expects an
`auth` message within 5 s. The server reads that file automatically; it resolves `user://` from
`project.godot` (`config/name`, or `custom_user_dir_name` when `use_custom_user_dir` is set).

## Debug CLI

Talks to the editor on the CLI port range (6510-6514) without going through MCP:

```bash
GODOT_PROJECT_PATH=../godot node build/cli.js get_project_info
node build/cli.js get_scene_tree '{"max_depth":2}'
node build/cli.js update_property '{"node_path":"Label","property":"text","value":"hi"}'
```

## Behaviour notes

- Requests are strictly serialized (one in flight). The addon's runtime tools share a single
  request file with the running game and are not safe to interleave.
- Screenshot-style results (`get_editor_screenshot`, `get_game_screenshot`, `get_resource_preview`,
  `compare_screenshots`, `capture_frames`) are returned as MCP image blocks; the base64 is stripped
  from the text part.
- Per-tool timeouts follow the addon's own limits (headless runs up to 15 min, Android deploys 10 min).
- Editor-side tools take node paths **relative to the edited scene root** (`.`, `Player/Sprite`).
  Runtime tools take **absolute** paths in the running game (`/root/Main/Player`).
- Extra tools: `godot_status` (connection state) and `list_godot_methods` (what the connected
  addon actually registers, and anything this server does not expose).
- All logging goes to stderr; stdout is the MCP transport.
